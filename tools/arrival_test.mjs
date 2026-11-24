// Named arrivals (engine + ledger): a portal and w.travel name a place in the world you are going to; the next visit
// begins there, its proof carries it, and the ledger accepts it only after a run that travelled there.
// Plays a chain of visits headlessly, seals and replays them, then runs the ledger's chain check on real and forged
// links. Exits 1 on failure. usage: node tools/arrival_test.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless, replayRun } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw, endOf } from '../src/engine/run.js';
import { chainCheck, nextState, entryFrom, genesisState, runDigest, CHAIN_START } from '../src/engine/ledger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const text = readFileSync(join(root, 'tests/worlds/arrivetest.js'), 'utf8');
const W = { id: 'arrivetest', sha256: createHash('sha256').update(text).digest('hex') };
let nonce = 0;
const loadModule = async (r) => { if (r.sha256 !== W.sha256) throw new Error('unknown module'); return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// ${nonce++}\n`).toString('base64'))).default; };
const QA = quantYaw(Math.PI);
const yieldNow = () => new Promise((r) => setImmediate(r));
let bad = 0;
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) bad++; };
const f2 = (p) => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`;
const engine = await sourceEngine();

// one visit: boot (from, arrival), check where it begins, walk to a point until the visit ends; returns its proof
async function visit(from, arrival, entry, route) {
  const spec = { registry: [W], world: W, from, entry, ...(arrival ? { arrival } : {}) };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui: { dialog: async () => {}, choice: async () => 0 } });
  if (error) throw new Error('boot: ' + error);
  E.rec = new RunLog();
  const P = E.player, start = P.pos.clone(), seen = Object.assign({}, E.world.group.userData.arrive);
  const tick = async (qx = 0, qy = 0) => { E.tick(frameFromCodes(qx, qy, QA, 0)); await yieldNow(); };
  await tick();
  for (const [x, z] of route) {
    for (let i = 0; i < 900 && !E.sim.ended; i++) {
      const dx = x - P.pos.x, dz = z - P.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.3) break;
      const k = Math.min(1, d / 0.8); await tick(Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k));
    }
    if (E.sim.ended) break;
  }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'arrival-test', world: W, registry: [W], from, ...(arrival ? { arrival } : {}), entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'arrival test' } };
  const pd = E.profile.data, final = JSON.parse(JSON.stringify({ coins: pd.coins, inv: pd.inv, eq: pd.eq, flags: pd.flags, save: pd.worlds[W.id] || null }));
  if (E.world) E.world.dispose();
  return { proof, start, seen, final };
}

const entry0 = entryFrom(genesisState(), W.id);
// 1. from nowhere: the spawn; the portal sends you to "dock"
const A = await visit(null, null, entry0, [[0, -10]]);
check(Math.hypot(A.start.x, A.start.z) < 0.2 && A.seen.from === null && A.seen.arrival === null, `no origin, no arrival: the spawn ${f2(A.start)}; w.from ${A.seen.from}, w.arrival ${A.seen.arrival}`);
check(JSON.stringify(A.proof.end && [A.proof.end.to, A.proof.end.arrival]) === '["arrivetest","dock"]' && A.proof.claims.some((c) => c[1] === 'travel' && c[3] === 'dock'), `a portal names an arrival: the run ends ${JSON.stringify(A.proof.end)}`);
// 2. at the dock (w.from and w.arrival say so); then w.travel to "top"
const B = await visit('arrivetest', 'dock', entryFrom(genesisState(), W.id), [[12, -14], [-6, -8]]);
check(Math.abs(B.start.x - 12) < 0.2 && Math.abs(B.start.z + 20) < 0.2 && B.seen.from === 'arrivetest' && B.seen.arrival === 'dock', `the next visit begins at the dock ${f2(B.start)}; w.from ${B.seen.from}, w.arrival ${B.seen.arrival}`);
check(B.proof.end && B.proof.end.arrival === 'top', `w.travel names an arrival: the run ends ${JSON.stringify(B.proof.end)}`);
// 3. at the top (up on its block)
const C = await visit('arrivetest', 'top', entryFrom(genesisState(), W.id), [[-10, -2], [8, 4]]); // (round the dock portal)
check(Math.abs(C.start.x + 10) < 0.2 && C.start.y > 5 && C.seen.arrival === 'top', `and the one after at the top ${f2(C.start)}`);
check(C.proof.end && C.proof.end.to === 'arrivetest' && C.proof.end.arrival === undefined, `an arrival that is not a name is dropped: ${JSON.stringify(C.proof.end)}`);
// 4. an arrival the world does not have: the usual rules (the portal back to where you came from)
const D = await visit('arrivetest', 'nowhere', entryFrom(genesisState(), W.id), []);
check(Math.abs(D.start.x) < 0.2 && Math.abs(D.start.z - 2) < 0.3, `an arrival the world lacks falls back to the portal back ${f2(D.start)}`);

// replays: the same claims, ending and state; a proof whose arrival was edited does not replay
for (const [name, v] of [['A', A], ['B', B], ['C', C]]) {
  const r = await replayRun(v.proof, { loadModule });
  check(r.ok, `run ${name} replays: ${r.ok ? `${r.ticks} ticks, state ${r.state.slice(0, 12)}` : r.reason}`);
}
const edited = Object.assign({}, B.proof, { arrival: 'top' });
const re = await replayRun(edited, { loadModule });
check(!re.ok, `a proof whose arrival was edited is refused (${re.ok ? 'it replayed!' : re.reason.slice(0, 70)})`);
const malformed = await replayRun(Object.assign({}, B.proof, { arrival: 'Not A Name!' }), { loadModule });
check(!malformed.ok && /bad arrival/.test(malformed.reason), `a malformed arrival is refused (${malformed.reason})`);
check((await runDigest(B.proof)) !== (await runDigest(Object.assign({}, B.proof, { arrival: undefined }))), 'the copy check tells runs apart by their arrival');

// the ledger's rule, on a chain of these runs: real links pass, forged arrivals do not
const key = 'k'.repeat(64), at = CHAIN_START + 86400;
const chained = (p, seq, prev, entry) => Object.assign({}, p, { chain: { seq, prev }, player: { name: 'arrival test', key }, entry });
const states = {};
const a = chained(A.proof, 1, null, entryFrom(genesisState(), W.id));
check(chainCheck(states, a, at) === null, 'run 1 (no arrival) links');
nextState(states, a, 'id-a', A.final);
const b = chained(B.proof, 2, 'id-a', entryFrom(states[key].state, W.id));
check(chainCheck(states, b, at) === null, 'run 2 begins at the dock, where run 1 travelled: it links');
const forgedTop = Object.assign({}, b, { arrival: 'top' }), forgedFrom = Object.assign({}, b, { from: 'hub' });
const r1 = chainCheck(states, forgedTop, at), r2 = chainCheck(states, forgedFrom, at);
check(r1 && r1.reason && r2 && r2.reason, `a forged arrival is refused ("top": ${r1 && r1.reason}; from "hub": ${r2 && r2.reason ? 'refused' : 'linked!'})`);
const plain = Object.assign({}, b, { from: null, arrival: undefined });
check(chainCheck(states, plain, at) === null, 'without an arrival, the next run may begin at the spawn (travel stays free)');
const stranger = chained(B.proof, 1, null, entryFrom(genesisState(), W.id));
const r3 = chainCheck({}, Object.assign({}, stranger, { player: { name: 'x', key: 'j'.repeat(64) } }), at);
check(r3 && r3.reason, `a new player's first run cannot begin at a named arrival (${r3 && r3.reason})`);
nextState(states, b, 'id-b', B.final);
check(states[key].last && states[key].last.end && states[key].last.end.arrival === 'top', `the ledger remembers where the last run went (${JSON.stringify(states[key].last)})`);
console.log(bad ? `${bad} FAILED` : 'ALL OK');
process.exitCode = bad ? 1 : 0;
