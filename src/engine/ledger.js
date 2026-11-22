// The season-0 ledger: the rules and data shapes shared by the game (submitting) and the validator
// (tools/ledger.mjs). Accepted runs form a hash chain. Anyone holding the archived proofs can recompute
// it and must get the same heads.
import { canon, signedText, summarize, b64, unb64, SIM } from './run.js';
import { sha256hex } from './util.js';
import { signEvent, RUN_KIND, RUN_TAG } from './nostr.js';

export const SEASON = 0;
export const LIMITS = { perKeyPerDay: 30, maxContent: 160000, maxProof: 4000000 };

// ---- proof <-> Nostr event content: gzip + base64 keeps typical runs far below relay size limits ----
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
export async function packProof(proof) { return b64(await pipe(new TextEncoder().encode(JSON.stringify(proof)), new CompressionStream('gzip'))); }
export async function unpackProof(content) {
  if (typeof content !== 'string' || content.length > LIMITS.maxContent) throw new Error('content too large');
  const raw = await pipe(unb64(content), new DecompressionStream('gzip'));
  if (raw.length > LIMITS.maxProof) throw new Error('proof too large');
  return JSON.parse(new TextDecoder().decode(raw));
}
export async function proofIdOf(proof) { return (await sha256hex(signedText(proof))).slice(0, 24); }
// the same run under any key (to catch copies): world, starting state, inputs and actions
export async function runDigest(proof) { return (await sha256hex(canon([proof.world, proof.from, proof.entry, proof.input, proof.events]))).slice(0, 24); }

// publishing a level: the level data and its creator's verified clear run travel together
export const PUBLISH_TAG = 'elsewhere-publish';
export async function publishEvent(level, proof) {
  const id = await proofIdOf(proof);
  return signEvent({
    kind: RUN_KIND,
    tags: [['d', 'elsewhere-publish:' + id], ['t', PUBLISH_TAG], ['sim', String(proof.sim)], ['enc', 'gzip+base64']],
    content: await packProof({ level, proof }),
  });
}

export async function proofEvent(proof) {
  const id = await proofIdOf(proof);
  return signEvent({
    kind: RUN_KIND,
    tags: [['d', 'elsewhere-run:' + id], ['t', RUN_TAG], ['sim', String(proof.sim)], ['w', String(proof.world.id)], ['enc', 'gzip+base64']],
    content: await packProof(proof),
  });
}

// ---- the chain ----
export function genesis() {
  return { format: 'elsewhere-ledger/1', season: SEASON, sim: SIM, note: 'Accepted proofs of play, as a hash chain. Each entry\'s head is sha256(prev + canonical entry). Recompute it from docs/ledger/proofs with node tools/ledger.mjs --rebuild.', seq: 0, head: '0'.repeat(64), cursor: 0, entries: [] };
}
export async function entryHead(e) { return sha256hex(e.prev + canon(Object.assign({}, e, { head: undefined }))); }
export async function verifyChain(ledger) {
  let head = '0'.repeat(64);
  for (let i = 0; i < ledger.entries.length; i++) {
    const e = ledger.entries[i];
    if (e.seq !== i + 1 || e.prev !== head || (await entryHead(e)) !== e.head) return `entry ${i + 1} does not chain`;
    head = e.head;
  }
  return head === ledger.head && ledger.entries.length === ledger.seq ? null : 'the head does not match the entries';
}
export async function append(ledger, entry) {
  entry.seq = ledger.seq + 1;
  entry.prev = ledger.head;
  entry.head = await entryHead(entry);
  ledger.entries.push(entry);
  ledger.seq = entry.seq; ledger.head = entry.head;
  return entry;
}

// ---- season-0 admission rules (after a successful replay) ----
// Returns null to admit, or a reason to reject.
export function admitRule(ledger, proof, meta) {
  if (proof.sim !== SIM) return `recorded under ${proof.sim}; season ${SEASON} runs ${SIM}`;
  if (!proof.player || !proof.player.key || !proof.sig) return 'unsigned: proofs must be signed by the player\'s key';
  const sum = summarize(proof.claims);
  if (!sum.records.length && !sum.items.length) return 'nothing to record (no record or item in this run)';
  const copy = ledger.entries.find((e) => e.run === meta.run && e.key !== proof.player.key);
  if (copy) return `a copy of run #${copy.seq}, played by another key`;
  const day = new Date(meta.at * 1000).toISOString().slice(0, 10);
  const today = ledger.entries.filter((e) => e.key === proof.player.key && new Date(e.at * 1000).toISOString().slice(0, 10) === day).length;
  if (today >= LIMITS.perKeyPerDay) return `daily limit reached (${LIMITS.perKeyPerDay} runs per player per day)`;
  return null;
}
export function entryOf(proof, meta, replay) {
  const sum = summarize(proof.claims);
  return {
    id: meta.id, run: meta.run, key: proof.player.key, name: String(proof.player.name || 'Wanderer').slice(0, 24),
    world: proof.world.id, worldSha: proof.world.sha256, sim: proof.sim, ticks: proof.ticks,
    records: sum.records.map((r) => ({ key: r.key, value: r.value, better: r.better })), items: sum.items, coins: sum.coins,
    loadout: Object.values(proof.entry.eq || {}).filter(Boolean).sort(),
    entry: meta.entryHash, state: replay.state, started: String(proof.started || '').slice(0, 30), event: meta.event, at: meta.at,
  };
}

// community worlds: published levels, newest first (derived, not hashed)
export function worldsOf(ledger) {
  return { format: 'elsewhere-worlds/1', note: 'Community levels accepted onto the ledger. Each module is archived at worlds/by-hash/<sha256>.js.',
    worlds: ledger.entries.filter((e) => e.kind === 'world').reverse().map((e) => ({ id: e.world, name: e.levelName, blurb: e.blurb, color: e.color, theme: e.theme, author: e.name, key: e.key, sha256: e.worldSha, seq: e.seq, at: e.at, clear: e.records[0] ? e.records[0].value : null })) };
}
// publishing rules on top of the run rules (the clear run is judged like any run)
export function admitWorld(ledger, level, proof, compiled, meta) {
  if (proof.world.id !== compiled.id || proof.world.sha256 !== compiled.sha256) return 'the clear run was not played on this level';
  if (!level.author.key || level.author.key !== proof.player.key) return 'the level must name its creator\'s key, and the creator must sign the clear run';
  if (!proof.claims.some((c) => c[1] === 'record' && c[2] === 'time')) return 'the clear run does not reach the goal';
  if (ledger.entries.some((e) => e.kind === 'world' && e.world === compiled.id)) return 'already published';
  const day = new Date(meta.at * 1000).toISOString().slice(0, 10);
  if (ledger.entries.filter((e) => e.kind === 'world' && e.key === level.author.key && new Date(e.at * 1000).toISOString().slice(0, 10) === day).length >= 5) return 'daily limit reached (5 levels per creator per day)';
  return null;
}

// ---- derived views for the game (not hashed; rebuilt from the entries every time) ----
export function boardsOf(ledger, registryNames = {}) {
  const worlds = {};
  for (const e of ledger.entries) for (const r of e.records) {
    const w = worlds[e.world] || (worlds[e.world] = {});
    const list = w[r.key] || (w[r.key] = []);
    const better = (a, b) => (r.better === 'higher' ? a > b : a < b);
    const mine = list.find((x) => x.key === e.key);
    const row = { value: r.value, better: r.better, name: e.name, key: e.key, seq: e.seq, id: e.id, at: e.at, loadout: e.loadout };
    if (!mine) list.push(row); else if (better(r.value, mine.value)) Object.assign(mine, row);
  }
  for (const w of Object.values(worlds)) for (const [k, list] of Object.entries(w)) { list.sort((a, b) => (a.better === 'higher' ? b.value - a.value : a.value - b.value) || a.seq - b.seq); w[k] = list.slice(0, 10); }
  const recent = ledger.entries.slice(-20).reverse().map((e) => ({ seq: e.seq, id: e.id, name: e.name, world: e.world, records: e.records, items: e.items, at: e.at }));
  return { format: 'elsewhere-boards/1', season: SEASON, sim: ledger.sim, count: ledger.seq, head: ledger.head, worlds, recent, names: registryNames, index: Object.fromEntries(ledger.entries.map((e) => [e.id, e.seq])) };
}
