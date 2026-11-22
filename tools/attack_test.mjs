// Attack suite: real attacks on verified ownership, each of which must fail.
// Usage: node tools/attack_test.mjs   (exit code 0 only if every attack is refused and every honest run accepted)
//
// It plays an honest chain of visits headlessly (hub, Skyreach, hub, picking up coins) with a fresh Ed25519
// key, then attacks the validator (tools/ledger.mjs, in a throwaway copy of the site) with proofs an attacker
// can really make: validly signed and replayable, but from a forged starting state, forked, out of order,
// copied under another key, tampered with after signing, or unchained after continuity began. It also feeds
// the relay decoders a decompression bomb.
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { bootHeadless } from '../src/engine/headless.js';
import { SIM, FORMAT, RunLog, frameFromCodes, encodeInput, stateString, signedText, b64 } from '../src/engine/run.js';
import { ensureKey, signText } from '../src/engine/identity.js';
import { genesisState, entryFrom, proofIdOf, unpackProof, CHAIN_START, LIMITS } from '../src/engine/ledger.js';
import { createBlobs } from '../src/engine/blobs.js';
import { rng } from '../src/engine/util.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
let nonce = 0;
const loadModule = async (r) => {
  const text = readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== r.sha256) throw new Error('hash mismatch');
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// attack ${nonce++}\n`).toString('base64'))).default;
};
const yieldNow = () => new Promise((r) => setImmediate(r));
const clone = (v) => JSON.parse(JSON.stringify(v));
const assetOf = (d) => clone({ coins: d.coins, inv: d.inv, eq: d.eq, flags: d.flags, worlds: d.worlds });

// play a visit headlessly from a given entry: seeded input that walks to the nearest coins
async function play(world, entry, seed, ticks = 900, opts = {}) {
  const reg = opts.registry || registry;
  const R = rng(seed), spec = { registry: reg, world: reg.find((r) => r.id === world), from: null, entry: clone(entry) };
  const ui = { dialog: () => new Promise(() => {}), choice: () => new Promise(() => {}), shop: () => {}, cabinet: () => {} };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) throw new Error(world + ': ' + error);
  E.rec = new RunLog();
  const P = E.player, STEP = Math.PI * 2 / 65536;
  for (let t = 0; t < ticks && !E.sim.ended; t++) {
    const coins = E.world.coins.filter((c) => c.mesh.visible).map((c) => [c.mesh.position.x, c.mesh.position.z]);
    coins.sort((a, b) => Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z) - Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z));
    let qx = 0, qy = 0;
    if (coins.length) { const [x, z] = coins[0], a = Math.atan2(x - P.pos.x, z - P.pos.z); qx = Math.round(-Math.sin(a) * 127) | 0; qy = Math.round(Math.cos(a) * 127) | 0; }
    if (opts.arcade && t > 5 && t <= 5 + opts.arcade) E.queueAction(['cab', 0, { source: 'siegeworks', type: 'result', fort: 'fake-' + t, stars: 3 }]); // forged arcade wins
    const flush = E.tick(frameFromCodes(qx, qy, 0, R() < 0.02 ? 1 : 0));
    if (flush) await yieldNow();
  }
  const n = E.rec.n, d = E.profile.data;
  const proof = {
    format: FORMAT, sim: SIM, engine: 'attack-test', world: spec.world, registry: reg, from: null, entry: clone(entry),
    started: '2026-11-22T00:00:00.000Z', ticks: n, input: encodeInput(E.rec, n), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()),
    end: E.sim.ended ? { tick: E.sim.ended.tick, to: E.sim.ended.to } : null,
    state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'attacker' },
  };
  const after = { coins: d.coins, inv: d.inv, eq: d.eq, flags: d.flags, save: d.worlds[world] || null };
  E.world.dispose();
  return { proof, after: clone(after) };
}
async function seal(proof, key, chain) {
  const p = clone(proof);
  if (chain) p.chain = chain; else delete p.chain;
  p.player = { name: p.player.name, key: key.pub };
  p.sig = await signText(key, signedText(p));
  return p;
}
const newKey = async () => { const prof = { data: {}, save() {} }; return ensureKey(prof); };

// the validator, in a throwaway copy of the site (each scenario starts from the honest ledger state it needs)
function site() { const d = mkdtempSync(join(tmpdir(), 'ew-attack-')); cpSync(docs, join(d, 'docs'), { recursive: true }); return join(d, 'docs'); }
function validate(dir, proofs, at) {
  const files = proofs.map((p, i) => { const f = join(dir, '..', `p${i}-${nonce++}.json`); writeFileSync(f, JSON.stringify(p)); return f; });
  const r = spawnSync('node', [join(root, 'tools/ledger.mjs'), '--docs', dir, ...(at ? ['--at', String(at)] : []), '--file', ...files], { encoding: 'utf8' });
  if (r.status) throw new Error('validator crashed: ' + r.stderr);
  return r.stdout;
}
const lines = (out, tag) => out.split('\n').filter((l) => l.startsWith(tag));

let fails = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? ' · ' + detail : ''}`); if (!ok) fails++; };

// ---- an honest player's chain: three visits ----
const key = await newKey(), other = await newKey();
let st = genesisState();
const visits = [], states = []; // states[i]: the verified state once visit i+1 is accepted
for (const [i, world] of [['1', 'hub'], ['2', 'skyreach'], ['3', 'hub']].map(([n, w]) => [+n, w])) {
  const { proof, after } = await play(world, entryFrom(st, world), 100 + i);
  const prev = visits.length ? await proofIdOf(visits[visits.length - 1]) : null;
  const sealed = await seal(proof, key, { prev, seq: i });
  visits.push(sealed);
  st = { coins: after.coins, inv: after.inv, eq: after.eq, flags: after.flags, worlds: Object.assign({}, st.worlds, { [world]: after.save }) };
  states.push(clone(st));
}
console.log(`honest chain: ${visits.length} visits, ${st.coins} coins collected along the way`);

{
  const dir = site(), out = validate(dir, visits);
  check(lines(out, 'ACCEPT').length === 3, 'an honest chain of three visits is accepted', `${lines(out, 'ACCEPT').length} accepted`);
  const s = JSON.parse(readFileSync(join(dir, 'ledger/states.json'), 'utf8')).keys[key.pub];
  check(s && s.seq === 3 && s.state.coins === st.coins && s.head === await proofIdOf(visits[2]), "the ledger records the player's verified state", s ? `seq ${s.seq}, ${s.state.coins} coins` : 'no state');
  const rb = spawnSync('node', [join(root, 'tools/ledger.mjs'), '--docs', dir, '--rebuild'], { encoding: 'utf8' });
  const s2 = JSON.parse(readFileSync(join(dir, 'ledger/states.json'), 'utf8')).keys[key.pub];
  check(rb.status === 0 && JSON.stringify(s2) === JSON.stringify(s), 'a rebuild from the archive recomputes the same verified state', rb.stdout.trim().split('\n').pop());
}

// ---- attack 1: a valid, signed, replayable run from a forged starting state (the Vault sigils and 999 coins) ----
{
  const honest = entryFrom(states[0], 'skyreach');
  const forged = Object.assign(clone(honest), { coins: 999, inv: Object.assign({}, honest.inv, { 'sigil-sky': 1, 'sigil-deep': 1, 'sigil-speed': 1 }), flags: Object.assign({}, honest.flags, { 'sigil.sky': true, 'sigil.deep': true, 'sigil.speed': true }) });
  const { proof } = await play('skyreach', forged, 202);
  const bad = await seal(proof, key, { prev: await proofIdOf(visits[0]), seq: 2 });
  const dir = site(), out = validate(dir, [visits[0], bad]);
  const rej = lines(out, 'REJECT');
  check(rej.length === 1 && /verified state/.test(rej[0]), 'a run from a forged starting state is refused (before any replay)', rej[0] || 'accepted!');
}
// ---- attack 2: forking your own chain (two different runs after the same one) ----
{
  const { proof } = await play('skyreach', entryFrom(states[0], 'skyreach'), 303); // an honest start, different play
  const dir = site();
  const out1 = validate(dir, visits.slice(0, 2));
  const fork = await seal(proof, key, { prev: await proofIdOf(visits[0]), seq: 2 });
  const out2 = validate(dir, [fork]);
  check(lines(out1, 'ACCEPT').length === 2 && lines(out2, 'REJECT').length === 1 && /not the next run/.test(lines(out2, 'REJECT')[0]), 'a fork of an accepted chain is refused', lines(out2, 'REJECT')[0] || 'accepted!');
}
// ---- attack 3: out of order (the validator waits for the missing run instead of skipping it) ----
{
  const dir = site();
  const out1 = validate(dir, [visits[0], visits[2]]); // run 3 before run 2
  check(lines(out1, 'ACCEPT').length === 1 && lines(out1, 'defer').length === 1, 'a run that arrives before its predecessor waits (deferred, not lost)');
  const out2 = validate(dir, [visits[2], visits[1]]); // both arrive: any order within a batch works
  check(lines(out2, 'ACCEPT').length === 2, 'once the missing run arrives, the chain completes in order', `${lines(out2, 'ACCEPT').length} accepted`);
}
// ---- attack 4: front-running. A thief re-signs a player's first run under their own key and gets it in first. ----
// Earnings are soulbound and a chained run starts from its own player's state, so the copy gains the thief nothing
// but a tie; what must not happen is the real player's chain being locked out (it once was: copies were refused).
{
  const copy = await seal(visits[0], other, { prev: null, seq: 1 });
  const dir = site(), out1 = validate(dir, [copy]), out2 = validate(dir, visits);
  const st = JSON.parse(readFileSync(join(dir, 'ledger/states.json'), 'utf8')).keys;
  check(lines(out1, 'ACCEPT').length === 1 && lines(out2, 'ACCEPT').length === 3 && st[key.pub] && st[key.pub].seq === 3, "a thief who copies and front-runs a player's run cannot lock that player's chain out", `thief: 1 run; real player: ${lines(out2, 'ACCEPT').length} accepted, chain at ${st[key.pub] && st[key.pub].seq}`);
}
// ---- attack 5: claims edited after signing (a crown added), and a chain link edited after signing ----
{
  const t = clone(visits[0]); t.claims.push([t.ticks - 1, 'give', 'crown']);
  const u = clone(visits[1]); u.chain.seq = 7;
  const dir = site(), out = validate(dir, [t]);
  check(lines(out, 'REJECT').length === 1, 'claims added after signing are refused', lines(out, 'REJECT')[0] || 'accepted!');
  const out2 = validate(site(), [visits[0], u]);
  check(lines(out2, 'ACCEPT').length === 1 && lines(out2, 'REJECT').length + lines(out2, 'defer').length === 1, 'a chain link edited after signing never joins the chain', (lines(out2, 'REJECT')[0] || lines(out2, 'defer')[0] || 'accepted!'));
}
// ---- attack 6: an unchained run after continuity began (a forged state with no link) ----
{
  const { proof } = await play('hub', Object.assign(entryFrom(genesisState(), 'hub'), { coins: 500 }), 404);
  const bare = await seal(proof, other, null);
  const out = validate(site(), [bare], CHAIN_START + 60);
  check(lines(out, 'REJECT').length === 1 && /unchained/.test(lines(out, 'REJECT')[0]), 'an unchained run after continuity began is refused', lines(out, 'REJECT')[0] || 'accepted!');
}
// ---- attack 8 (red team #1): forged arcade wins mint coins (40 results of 3 stars = 360 coins on the old code) ----
{
  const control = await play('hub', entryFrom(genesisState(), 'hub'), 505, 120); // the same play, no arcade results
  const { proof, after } = await play('hub', entryFrom(genesisState(), 'hub'), 505, 120, { arcade: 40 });
  const run = await seal(proof, other, { prev: null, seq: 1 });
  const dir = site(), out = validate(dir, [run]);
  const st = JSON.parse(readFileSync(join(dir, 'ledger/states.json'), 'utf8')).keys[other.pub];
  check(after.coins === control.after.coins && lines(out, 'ACCEPT').length === 1 && st && st.state.coins === control.after.coins, 'forged arcade results mint no coins (the run itself is still valid play)', `40 fake 3-star wins: ${st ? st.state.coins : '?'} coins, the same as the identical run without them (${control.after.coins}, picked up on foot)`);
  // the same forgery, pinned to the old hub code that did pay out: that version was revoked
  const hist = JSON.parse(readFileSync(join(docs, 'worlds/history.json'), 'utf8')).worlds.hub, old = hist.find((v) => v.revoked);
  if (old) {
    const reg = registry.map((r) => (r.id === 'hub' ? { id: 'hub', sha256: old.sha256 } : r));
    const o = await play('hub', entryFrom(genesisState(), 'hub'), 506, 120, { arcade: 40, registry: reg });
    const k3 = await newKey(), r3 = await seal(o.proof, k3, { prev: null, seq: 1 });
    const out3 = validate(site(), [r3]);
    check(o.after.coins > 0 && lines(out3, 'REJECT').length === 1 && /withdrawn/.test(lines(out3, 'REJECT')[0]), 'the old, revoked hub code (which paid for arcade wins) cannot be used for new runs', `old code minted ${o.after.coins} coins; ${lines(out3, 'REJECT')[0] || 'accepted!'}`);
  }
}
// ---- attack 9 (red team #3): the same run under a different input encoding (to dodge the copy digest) ----
{
  const t = clone(visits[0]); t.input = t.input.slice(0, 8) + '\n' + t.input.slice(8);
  const v = await seal(t, other, { prev: null, seq: 1 });
  const out = validate(site(), [v]);
  check(lines(out, 'REJECT').length === 1 && /canonical/.test(lines(out, 'REJECT')[0]), 'a run re-encoded to dodge the copy check is refused', lines(out, 'REJECT')[0] || 'accepted!');
}
// ---- attack 10 (red team #5): a registry list that repeats a world 256 times (module amplification) ----
{
  const t = clone(visits[0]); t.registry = Array.from({ length: 256 }, () => registry.find((r) => r.id === 'hub'));
  const v = await seal(t, other, { prev: null, seq: 1 });
  const t0 = Date.now(), out = validate(site(), [v]);
  check(lines(out, 'REJECT').length === 1 && Date.now() - t0 < 20000, 'a registry list that repeats a world is refused before loading anything', `${lines(out, 'REJECT')[0] || 'accepted!'} (${Date.now() - t0} ms)`);
}
// ---- attack 11 (red team #2): a validator run cannot be stalled: it stops at its budget and the rest waits ----
{
  const dir = site();
  const r1 = spawnSync('node', [join(root, 'tools/ledger.mjs'), '--docs', dir, '--file', ...visits.map((p, i) => { const f = join(dir, '..', `b${i}.json`); writeFileSync(f, JSON.stringify(p)); return f; })], { encoding: 'utf8', env: Object.assign({}, process.env, { LEDGER_BUDGET_MS: '1' }) });
  const over = lines(r1.stdout, 'defer').filter((l) => /budget/.test(l)).length;
  const r2 = validate(dir, visits);
  check(r1.status === 0 && over >= 1 && lines(r1.stdout, 'ACCEPT').length + lines(r2, 'ACCEPT').length === 3, 'over its time budget the validator stops cleanly and the rest is accepted on the next run', `${lines(r1.stdout, 'ACCEPT').length} then ${lines(r2, 'ACCEPT').length} (${over} left for later)`);
}
// ---- attack 7: decompression bombs against the relay decoders (validator memory) ----
{
  const zeros = new Uint8Array(64 * 1024 * 1024); // 64 MB of zeros gzips to about 64 KB
  const gz = new Uint8Array(await new Response(new Blob([zeros]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
  const content = b64(gz);
  const t0 = Date.now(), m0 = process.memoryUsage().arrayBuffers;
  let err = null; try { await unpackProof(content); } catch (e) { err = e.message; }
  const grew = (process.memoryUsage().arrayBuffers - m0) / 1e6;
  check(!!err && grew < LIMITS.maxProof / 1e6 * 3, 'a proof decompression bomb is refused without inflating it', `${gz.length} bytes -> refused (${err}) in ${Date.now() - t0} ms, +${grew.toFixed(1)} MB`);
}

console.log(fails ? `${fails} FAILED` : 'ALL ATTACKS REFUSED');
process.exitCode = fails ? 1 : 0;
