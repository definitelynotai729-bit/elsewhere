// The season-0 ledger: the rules and data shapes shared by the game (submitting) and the validator
// (tools/ledger.mjs). Accepted runs form a hash chain. Anyone holding the archived proofs can recompute
// it and must get the same heads.
import { canon, signedText, summarize, b64, unb64, SIM } from './run.js';
import { sha256hex, gunzipCapped } from './util.js';
import { signEvent, RUN_KIND, RUN_TAG } from './nostr.js';
import { weeklyOf } from './challenges.js';

export const SEASON = 0;
export const LIMITS = { perKeyPerDay: 30, chainedPerKeyPerDay: 1500, maxContent: 160000, maxProof: 4000000 };
// Continuity (from CHAIN_START): every run names its player's previous run, and must start from exactly the
// state that player's verified chain ended in. Items and coins then exist only because verified play made
// them. Unchained runs from before CHAIN_START stay on the ledger as season-0 history.
export const CHAIN_START = 1795334400; // 2026-11-22 08:00 UTC
// what every new player owns: nothing
export const genesisState = () => ({ coins: 0, inv: {}, eq: { head: null, back: null, hand: null, feet: null, board: null, body: null }, flags: {}, worlds: {} });
// the entry a chained run must have, given the player's verified state
export const entryFrom = (state, worldId) => ({ coins: state.coins, inv: state.inv, eq: state.eq, flags: state.flags, save: state.worlds[worldId] || null });
// a chained run's link check, before any replay: cheap, so spam costs nothing. Returns null, { reason } or { defer }.
export function chainCheck(states, proof, at) {
  const key = proof.player && proof.player.key;
  if (!proof.chain) return at >= CHAIN_START ? { reason: 'unchained run: runs must name their player\'s previous run (update the game)' } : null;
  const st = states[key] || { head: null, seq: 0, state: genesisState() };
  if (proof.chain.seq > st.seq + 1) return { defer: `waiting for run ${st.seq + 1} of this player` };
  if (proof.chain.seq !== st.seq + 1 || (proof.chain.prev || null) !== st.head) return { reason: `not the next run in this player's chain (the chain is at run ${st.seq})` };
  if (canon(proof.entry) !== canon(entryFrom(st.state, proof.world.id))) return { reason: 'the run does not start from this player\'s verified state (coins, items, flags or world save differ)' };
  // a named arrival (somewhere inside a world, a story's harbour say) only where this player's last run went: that
  // run's verified end travelled here, to this arrival, from the world this run names as its origin
  if (proof.arrival != null) {
    const L = st.last, end = L && L.end;
    if (!end || end.to !== proof.world.id || end.arrival !== proof.arrival || L.world !== proof.from) return { reason: `the run begins at "${proof.arrival}", but this player's last run did not travel there` };
  }
  return null;
}
// the player's verified state after an accepted chained run
export function nextState(states, proof, id, final) {
  const key = proof.player.key, st = states[key] || { head: null, seq: 0, state: genesisState() };
  const worlds = Object.assign({}, st.state.worlds, { [proof.world.id]: final.save });
  // (and where that run went: its end, which the replay checked, so the next run's named arrival can be checked)
  states[key] = { head: id, seq: proof.chain.seq, state: { coins: final.coins, inv: final.inv, eq: final.eq, flags: final.flags, worlds }, last: { world: proof.world.id, end: proof.end || null } };
}

// ---- proof <-> Nostr event content: gzip + base64 keeps typical runs far below relay size limits ----
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
export async function packProof(proof) { return b64(await pipe(new TextEncoder().encode(JSON.stringify(proof)), new CompressionStream('gzip'))); }
export async function unpackProof(content) {
  if (typeof content !== 'string' || content.length > LIMITS.maxContent) throw new Error('content too large');
  const raw = await gunzipCapped(unb64(content), LIMITS.maxProof); // capped while inflating: no decompression bombs
  return JSON.parse(new TextDecoder().decode(raw));
}
export async function proofIdOf(proof) { return (await sha256hex(signedText(proof))).slice(0, 24); }
// the same run under any key (to catch copies): world, starting state, inputs and actions
export async function runDigest(proof) { return (await sha256hex(canon(proof.arrival != null ? [proof.world, proof.from, proof.entry, proof.input, proof.events, proof.arrival] : [proof.world, proof.from, proof.entry, proof.input, proof.events]))).slice(0, 24); }

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

// The relay cursor after a validator run: past everything decided, never past anything still waiting, and never past
// the validator's own clock. Event times are whatever their publishers claim, and a far-future time would otherwise
// carry the cursor past every real event: the validator would stop seeing anything.
export function nextCursor(cursor, decided, waiting, now) {
  const hi = Math.min(now, Math.max(cursor || 0, ...decided));
  return waiting.length ? Math.min(hi, Math.min(...waiting)) : hi;
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
  // (the engine a run was played on is checked by the validator against docs/engines/history.json)
  if (!proof.player || !proof.player.key || !proof.sig) return 'unsigned: proofs must be signed by the player\'s key';
  const sum = summarize(proof.claims);
  if (!proof.chain && !sum.records.length && !sum.items.length) return 'nothing to record (no record or item in this run)'; // chained runs always count: they carry the player's state
  // copies: a chained run starts from its own player's state, and earnings are soulbound, so copying a run gains nothing
  // but a tie on a board. Refusing copies let a thief who re-signed (and backdated) a run lock its real player out,
  // so chained copies are accepted; unchained (season-0) runs keep the old rule.
  const copy = !proof.chain && ledger.entries.find((e) => e.run === meta.run && e.key !== proof.player.key);
  if (copy) return `a copy of run #${copy.seq}, played by another key`;
  const day = new Date(meta.at * 1000).toISOString().slice(0, 10);
  const today = ledger.entries.filter((e) => e.key === proof.player.key && new Date(e.at * 1000).toISOString().slice(0, 10) === day).length;
  const cap = proof.chain ? LIMITS.chainedPerKeyPerDay : LIMITS.perKeyPerDay;
  if (today >= cap) return `daily limit reached (${cap} runs per player per day)`;
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
    chain: proof.chain ? { prev: proof.chain.prev || null, seq: proof.chain.seq } : undefined,
  };
}

// community worlds: published levels, newest first (derived, not hashed)
export function worldsOf(ledger) {
  return { format: 'elsewhere-worlds/1', note: 'Community levels accepted onto the ledger. Each module is archived at worlds/by-hash/<sha256>.js.',
    worlds: ledger.entries.filter((e) => e.kind === 'world').reverse().map((e) => ({ id: e.world, name: e.levelName, blurb: e.blurb, color: e.color, theme: e.theme, author: e.name, key: e.key, sha256: e.worldSha, seq: e.seq, at: e.at, clear: e.records[0] ? e.records[0].value : null, reward: e.reward || undefined })) };
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
  for (const e of ledger.entries) for (const r of e.records || []) { // (transactions have no records)
    const w = worlds[e.world] || (worlds[e.world] = {});
    const list = w[r.key] || (w[r.key] = []);
    const better = (a, b) => (r.better === 'higher' ? a > b : a < b);
    const mine = list.find((x) => x.key === e.key);
    const row = { value: r.value, better: r.better, name: e.name, key: e.key, seq: e.seq, id: e.id, at: e.at, loadout: e.loadout };
    if (!mine) list.push(row); else if (better(r.value, mine.value)) Object.assign(mine, row);
  }
  for (const w of Object.values(worlds)) for (const [k, list] of Object.entries(w)) { list.sort((a, b) => (a.better === 'higher' ? b.value - a.value : a.value - b.value) || a.seq - b.seq); w[k] = list.slice(0, 10); }
  // verified firsts (GAME.md): the first accepted run to carry the crown, a sigil or a Founder's Echo, in ledger order
  const firsts = {};
  for (const e of ledger.entries) for (const it of e.items || []) if (/^(crown|echo-\d+|sigil-[a-z]+|founders-mantle)$/.test(it) && !firsts[it]) firsts[it] = { name: e.name, key: e.key, seq: e.seq, id: e.id, at: e.at };
  const recent = ledger.entries.filter((e) => e.kind !== 'tx').slice(-20).reverse().map((e) => ({ seq: e.seq, id: e.id, name: e.name, world: e.world, records: e.records, items: e.items, at: e.at }));
  // weekly challenges (challenges.js): each week's board and medals, and every player's medals
  const W = weeklyOf(ledger.entries);
  return { format: 'elsewhere-boards/1', season: SEASON, sim: ledger.sim, count: ledger.seq, head: ledger.head, worlds, recent, names: registryNames, firsts, weekly: W.weeks, medals: W.medals, index: Object.fromEntries(ledger.entries.map((e) => [e.id, e.seq])) };
}
