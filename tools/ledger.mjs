// Season-0 validator: fetch proofs of play from Nostr relays, replay each one, and append the accepted
// runs to the ledger (docs/ledger/). Anyone can run it; given the same proofs it reaches the same ledger.
//
//   node tools/ledger.mjs                  fetch new runs from the relays, validate, update docs/ledger/
//   node tools/ledger.mjs --file a.json …  validate local proof files instead (testing; meta comes from the file)
//   node tools/ledger.mjs --rebuild        recompute every entry from docs/ledger/proofs and compare the heads
//   --dry                                  report only, write nothing
//
// Proof content from relays is untrusted: it is size-limited, parsed as JSON and replayed. The only code
// that runs is world code pinned by SHA-256 in docs/worlds/by-hash.
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readHistory as readEngines, replayPinned, enginePolicy } from './engines.mjs';
import { canon, signedText, decodeInput, encodeInput } from '../src/engine/run.js';
import { verifyText } from '../src/engine/identity.js';
import { query, RUN_KIND, RUN_TAG, RELAYS } from '../src/engine/nostr.js';
import { genesis, verifyChain, append, admitRule, entryOf, boardsOf, worldsOf, admitWorld, unpackProof, proofIdOf, runDigest, PUBLISH_TAG, chainCheck, nextState } from '../src/engine/ledger.js';
import { checkLevel, compileLevel } from '../src/engine/level.js';
import { createBlobs } from '../src/engine/blobs.js';
import { decodeMesh } from '../src/engine/mesh.js';
const blobs = createBlobs({ noCache: true }); // models are only checked here, never stored by the validator

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const DRY = flag('--dry'), REBUILD = flag('--rebuild'), FILES = flag('--file');
const AT = +opt('--at', 0); // --file only: pretend the events were published at this time (tests)
const docs = opt('--docs', join(root, 'docs')), LD = join(docs, 'ledger');
const MAX_EVENTS = 300; // per run of the validator, so a flood of junk cannot stall it

const sha = (t) => createHash('sha256').update(t).digest('hex');
let nonce = 0;
const dataCache = new Map(); // sha -> module: pinned worlds read only for their items and rules load once per run
async function loadModule(r, o) {
  if (o && o.data && dataCache.has(r.sha256)) return dataCache.get(r.sha256);
  const file = join(docs, 'worlds/by-hash', r.sha256 + '.js');
  if (!existsSync(file)) throw new Error(`no module ${r.sha256.slice(0, 12)}… (world "${r.id}") in the archive`);
  const text = readFileSync(file, 'utf8');
  if (sha(text) !== r.sha256) throw new Error('archived module does not match its hash');
  const mod = (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// visit ${nonce++}\n`).toString('base64'))).default;
  if (o && o.data) dataCache.set(r.sha256, mod);
  return mod;
}
// new runs play current code: a world's current version, or the previous one for a day after a change, never a revoked one
const GRACE = 24 * 3600;
let history = null;
let engines = null;
function versionCheck(proof, now) {
  if (!history) history = readJson(join(docs, 'worlds/history.json'), { worlds: {} });
  if (!engines) engines = readEngines(docs);
  // the engine: current, or the previous one for a day after a change, unless withdrawn (tools/engines.mjs)
  const eng = enginePolicy(engines, proof.sim, now);
  if (eng) return eng;
  for (const r of proof.registry || []) {
    if (/^lv-/.test(r.id)) continue; // community levels are content-addressed: each has exactly one version
    const v = (history.worlds[r.id] || []).find((x) => x.sha256 === r.sha256);
    if (!v) return `world "${r.id}" ${r.sha256.slice(0, 8)} is not a version this validator admits new runs on (reload the game)`;
    if (v.revoked) return `world "${r.id}" ${r.sha256.slice(0, 8)} was withdrawn: ${v.revoked}`;
    if (v.until != null && v.until < now - GRACE) return `world "${r.id}" ${r.sha256.slice(0, 8)} is out of date (reload the game)`;
  }
  return null;
}
const canonicalInput = (s) => { try { const d = decodeInput(s); return encodeInput(d, d.n) === s; } catch (e) { return false; } };
const readJson = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { return d; } };
const names = Object.fromEntries((readJson(join(docs, 'worlds/registry.json'), { worlds: [] }).worlds || []).map((w) => [w.id, w.name]));

// validate one proof against the ledger and the players' verified states.
// Returns { entry, final }, { reason } (refused) or { defer } (its player's previous run has not arrived yet).
async function judge(ledger, states, proof, meta) {
  if (!proof || typeof proof !== 'object') return { reason: 'not a proof' };
  if (!proof.player || !proof.player.key || !proof.sig) return { reason: 'unsigned: proofs must be signed by the player\'s key' };
  // cheap checks first, so a flood of junk costs almost nothing: form, signature, chain link, rules; the replay last
  if (typeof proof.input !== 'string' || !canonicalInput(proof.input)) return { reason: 'the input log is not in canonical form' };
  if ((await verifyText(proof.player.key, signedText(proof), proof.sig)) !== true) return { reason: 'signature does not match the proof' };
  if (!REBUILD) { const old = versionCheck(proof, Math.floor(Date.now() / 1000)); if (old) return { reason: old }; }
  const link = chainCheck(states, proof, meta.at);
  if (link) return link;
  meta.run = await runDigest(proof);
  meta.entryHash = sha(canon(proof.entry));
  const why = admitRule(ledger, proof, meta);
  if (why) return { reason: why };
  if (!engines) engines = readEngines(docs);
  const r = await replayPinned(docs, engines, proof, { loadModule }); // on the engine the proof names, archived by hash
  if (!r.ok) return { reason: 'replay failed: ' + r.reason };
  if (r.sigStatus !== 'valid') return { reason: 'signature ' + r.sigStatus };
  return { entry: entryOf(proof, meta, r), final: r.final };
}

// a published level: check and compile it, then judge its creator's clear run on the compiled module
async function judgeWorld(ledger, states, raw, proof, meta) {
  const c = checkLevel(raw);
  if (c.error) return { reason: 'level: ' + c.error };
  const m = await compileLevel(c.level);
  if (!proof || !proof.world) return { reason: 'no clear run' };
  // models (format 3): each must be on the relays and be a valid model when the level is admitted. A rebuild
  // skips this: it recomputes the ledger from the archive alone, and relays may have dropped old data since.
  if (!REBUILD) for (const h of [...new Set(c.level.parts.filter((p) => p.s === 'mesh').map((p) => p.h))]) {
    const bytes = await blobs.fetch(h);
    if (!bytes) return { reason: `model ${h.slice(0, 10)} is not on the relays` };
    try { decodeMesh(bytes); } catch (e) { return { reason: `model ${h.slice(0, 10)}: ${e.message}` }; }
  }
  if (proof.world.id !== m.id || proof.world.sha256 !== m.sha256) return { reason: 'the clear run was not played on this level' };
  const file = join(docs, 'worlds/by-hash', m.sha256 + '.js'), had = existsSync(file);
  if (!had) writeFileSync(file, m.text); // the replay loads the module by its hash
  // the clear run may already be on its player's chain (sent as an ordinary run first): then only the level is new
  const known = ledger.entries.find((e) => e.id === meta.id && e.kind !== 'world');
  let j;
  if (known) { meta.run = known.run; meta.entryHash = known.entry; j = { entry: Object.assign(entryOf(proof, meta, { state: known.state }), { id: meta.id + 'w', publishes: meta.id }), already: true }; }
  else j = await judge(ledger, states, proof, meta);
  if (j.defer) { if (!had) try { unlinkSync(file); } catch (e) {} return j; }
  const why = j.entry ? admitWorld(ledger, c.level, proof, m, meta) : null;
  if (!j.entry || why) { if (!had) try { unlinkSync(file); } catch (e) {} return { reason: j.reason || why }; }
  // format 2 levels give a reward item: record its id (the level id + '-r') and name with the world
  const reward = c.level.reward ? { reward: { id: m.id + '-r', name: c.level.reward.name, slot: c.level.reward.slot } } : {};
  return { entry: Object.assign({ kind: 'world' }, j.entry, { levelName: c.level.name, blurb: c.level.blurb, color: c.level.color, theme: c.level.theme }, reward), level: c.level, final: j.final, already: !!j.already };
}

function save(ledger, rejected, seen, states) {
  if (DRY) return;
  mkdirSync(join(LD, 'proofs'), { recursive: true });
  writeFileSync(join(LD, 'ledger.json'), JSON.stringify(ledger, null, 1));
  // every player's verified state (derived: --rebuild recomputes it by replaying the archive in order)
  writeFileSync(join(LD, 'states.json'), JSON.stringify({ format: 'elsewhere-states/1', note: "Each player's verified state: what their chain of accepted runs ended in. A player's next run must start from exactly this.", head: ledger.head, keys: states }, null, 1));
  writeFileSync(join(LD, 'boards.json'), JSON.stringify(boardsOf(ledger, Object.assign({}, names, Object.fromEntries(ledger.entries.filter((e) => e.kind === 'world').map((e) => [e.world, e.levelName]))))));
  writeFileSync(join(LD, 'worlds.json'), JSON.stringify(worldsOf(ledger), null, 1));
  writeFileSync(join(LD, 'rejected.json'), JSON.stringify({ note: 'Recent submissions the validator refused, and why.', list: rejected.slice(-300) }, null, 1));
  writeFileSync(join(LD, 'seen.json'), JSON.stringify(seen.slice(-20000)));
}

async function main() {
  let ledger = readJson(join(LD, 'ledger.json'), null) || genesis();
  const broken = await verifyChain(ledger);
  if (broken) throw new Error('the ledger on disk does not verify (' + broken + '); refusing to touch it');
  const rejected = readJson(join(LD, 'rejected.json'), { list: [] }).list;
  const seen = readJson(join(LD, 'seen.json'), []);
  const seenSet = new Set(seen);

  if (REBUILD) {
    const fresh = genesis(), st = {};
    for (const e of ledger.entries) {
      const pid = e.publishes || e.id; // a level published after its clear run was accepted shares that run's proof
      const proof = readJson(join(LD, 'proofs', pid + '.json'), null);
      if (!proof) throw new Error(`entry #${e.seq}: archived proof ${pid} is missing`);
      const meta = { id: await proofIdOf(proof), event: e.event, at: e.at };
      if (meta.id !== pid) throw new Error(`entry #${e.seq}: the archived proof's id is ${meta.id}, not ${pid}`);
      const j = e.kind === 'world' ? await judgeWorld(fresh, st, readJson(join(LD, 'levels', e.world + '.json'), null), proof, meta) : await judge(fresh, st, proof, meta);
      if (!j.entry) throw new Error(`entry #${e.seq} no longer validates: ${j.reason || j.defer}`);
      await append(fresh, j.entry);
      if (proof.chain && !j.already) nextState(st, proof, meta.id, j.final);
      if (fresh.head !== e.head) throw new Error(`entry #${e.seq}: rebuilt head ${fresh.head.slice(0, 12)} differs from ${e.head.slice(0, 12)}`);
    }
    if (!DRY) writeFileSync(join(LD, 'states.json'), JSON.stringify({ format: 'elsewhere-states/1', note: "Each player's verified state: what their chain of accepted runs ended in. A player's next run must start from exactly this.", head: fresh.head, keys: st }, null, 1));
    console.log(`rebuilt ${fresh.seq} entries from the archived proofs; every head matches (${fresh.head.slice(0, 16)}…); ${Object.keys(st).length} players' verified states recomputed`);
    return;
  }
  // every player's verified state; it must belong to this exact ledger (else rebuild it)
  const sf = readJson(join(LD, 'states.json'), null);
  if (sf && sf.head !== ledger.head) throw new Error('states.json belongs to another ledger head: run with --rebuild first');
  const states = (sf && sf.keys) || {};

  // candidates: [{ proof, meta: { id, event, at } }] or [{ reason, meta }] for unreadable ones
  const cands = [];
  if (FILES) {
    for (const f of argv) { const x = readJson(f, null); const meta = { event: 'file:' + f.split('/').pop(), at: AT || Math.floor(Date.now() / 1000) }; cands.push(x && x.level ? { proof: x.proof, level: x.level, publish: true, meta } : { proof: x, meta }); }
  } else {
    const since = Math.max(0, (ledger.cursor || 0) - 7 * 3600); // deferred chain runs wait up to 6 h, so look back 7
    const q = await query({ kinds: [RUN_KIND], '#t': [RUN_TAG, PUBLISH_TAG], since, limit: 500 }, RELAYS, 15000);
    console.log('relays:', q.relays.map((r) => `${r.relay.replace('wss://', '')} ${r.error ? '(' + r.error + ')' : r.n}`).join(', '));
    const events = q.events.filter((e) => !seenSet.has(e.id)).sort((a, b) => a.created_at - b.created_at || (a.id < b.id ? -1 : 1)).slice(0, MAX_EVENTS);
    for (const ev of events) {
      const meta = { event: ev.id, at: ev.created_at };
      const pub = ev.tags.some((t) => t[0] === 't' && t[1] === PUBLISH_TAG);
      try { const x = await unpackProof(ev.content); cands.push(pub ? { proof: x && x.proof, level: x && x.level, publish: true, meta } : { proof: x, meta }); } catch (e) { cands.push({ reason: 'unreadable content: ' + e.message, meta }); }
    }
  }
  // fair queuing: players with a verified chain first (in time order), then new keys, at most MAX_NEW per run, so a
  // flood of fresh keys delays only other fresh keys. A replay-time budget ends the run cleanly before the job's
  // timeout; whatever is left is not marked seen, and the cursor never moves past it, so the next run picks it up.
  const MAX_NEW = 40, BUDGET = +(process.env.LEDGER_BUDGET_MS || 10 * 60 * 1000), t0 = Date.now();
  const known = (c) => !!(c.proof && c.proof.player && states[c.proof.player.key]);
  cands.sort((a, b) => (known(b) - known(a)) || (a.meta.at - b.meta.at));
  let fresh = 0;
  for (const c of cands) if (!known(c) && c.proof && !c.reason) { fresh++; if (fresh > MAX_NEW) c.later = true; }
  let added = 0;
  // passes: a run whose player's previous run is later in this batch waits for it (chains arrive in any order)
  let pending = cands, progress = true, deferred = [];
  const now = Math.floor(Date.now() / 1000);
  while (pending.length && progress) {
  progress = false; deferred = [];
  for (const c of pending) {
    const meta = c.meta;
    if (c.later || Date.now() - t0 > BUDGET) { c.later = true; deferred.push(c); continue; }
    let res = c.reason ? { reason: c.reason } : null;
    if (!res) {
      try { meta.id = await proofIdOf(c.proof); } catch (e) { res = { reason: 'not a proof' }; }
    }
    if (!res && ledger.entries.some((e) => e.id === (c.publish ? meta.id + 'w' : meta.id) || (c.publish && e.kind === 'world' && e.id === meta.id))) res = { skip: 'already in the ledger' };
    if (!res) res = c.publish ? await judgeWorld(ledger, states, c.level, c.proof, meta) : await judge(ledger, states, c.proof, meta);
    if (res.defer) {
      // its player's previous run has not been accepted yet: try again later, for up to 6 hours
      if (meta.at < now - 6 * 3600) res = { reason: 'the previous run in this player\'s chain never arrived (' + res.defer + ')' };
      else { deferred.push(c); continue; }
    }
    if (res.entry) {
      progress = true;
      await append(ledger, res.entry); added++;
      if (c.proof && c.proof.chain && !res.already) nextState(states, c.proof, meta.id, res.final);
      if (!DRY) {
        mkdirSync(join(LD, 'proofs'), { recursive: true }); writeFileSync(join(LD, 'proofs', meta.id + '.json'), JSON.stringify(c.proof));
        if (res.level) { mkdirSync(join(LD, 'levels'), { recursive: true }); writeFileSync(join(LD, 'levels', res.entry.world + '.json'), JSON.stringify(res.level)); }
      } else if (res.entry.kind === 'world') { try { unlinkSync(join(docs, 'worlds/by-hash', res.entry.worldSha + '.js')); } catch (e) {} }
      const e = res.entry;
      console.log(`ACCEPT #${e.seq} ${e.id} ${e.name} · ${e.kind === 'world' ? 'NEW WORLD "' + e.levelName + '" ' : ''}${e.world} · ${e.records.map((r) => `${r.key} ${r.value.toFixed(2)}`).join(', ') || 'no record'} · ${e.items.join(', ') || 'no items'}`);
    } else if (res.reason) {
      rejected.push({ event: meta.event, id: meta.id || null, reason: res.reason, at: meta.at });
      console.log(`REJECT ${meta.id || meta.event}: ${res.reason}`);
    } else console.log(`skip   ${meta.id}: ${res.skip}`);
    if (meta.event && !String(meta.event).startsWith('file:')) seen.push(meta.event);
  }
  pending = deferred.filter((c) => !c.later);
  if (deferred.some((c) => c.later)) break;
  }
  for (const c of deferred) console.log(`defer  ${c.meta.id || c.meta.event}: ${c.later ? 'over this run\'s budget (next run)' : 'waiting for the player\'s previous run'}`);
  // the cursor: past everything decided, but never past anything still waiting
  if (!FILES) {
    const waiting = deferred.map((c) => c.meta.at), decided = cands.filter((c) => !deferred.includes(c)).map((c) => c.meta.at);
    const hi = Math.max(ledger.cursor || 0, ...decided);
    ledger.cursor = waiting.length ? Math.min(hi, Math.min(...waiting)) : hi;
  }
  save(ledger, rejected, seen, states);
  console.log(`${added} accepted; ledger has ${ledger.seq} entries, head ${ledger.head.slice(0, 16)}…${DRY ? ' (dry run: nothing written)' : ''}`);
}

main().then(() => { process.exitCode = 0; }, (e) => { console.error('validator error:', e.message); process.exitCode = 1; });
