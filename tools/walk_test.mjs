// Characters that walk, zones that switch and move, winds that change (engine): played headlessly on the real
// physics, then sealed as a proof and replayed, which must give the same claims and state. Exits 1 on failure.
// usage: node tools/walk_test.mjs [-v]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless, replayRun } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('-v');
const text = readFileSync(join(root, 'tests/worlds/walktest.js'), 'utf8');
const W = { id: 'walktest', sha256: createHash('sha256').update(text).digest('hex') };
let nonce = 0;
const loadModule = async (r) => { if (r.sha256 !== W.sha256) throw new Error('unknown module'); return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// ${nonce++}\n`).toString('base64'))).default; };
const QA = quantYaw(Math.PI);
const yieldNow = () => new Promise((r) => setImmediate(r));
const entry = { coins: 0, inv: {}, eq: { head: null, back: null, hand: null, feet: null, board: null, body: null }, flags: {}, save: null };
const spec = { registry: [W], world: W, from: null, entry };
const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui: { dialog: async () => {}, choice: async () => 0 } });
if (error) { console.log('FAIL boot:', error); process.exit(1); }
E.rec = new RunLog();
const P = E.player, U = E.world.group.userData.walk;
let t = 0, bad = 0;
const tick = async (qx = 0, qy = 0, bits = 0) => { E.tick(frameFromCodes(qx, qy, QA, bits)); t++; await yieldNow(); };
const steer = (x, z) => { const dx = x - P.pos.x, dz = z - P.pos.z, d = Math.hypot(dx, dz); if (d < 0.04) return [0, 0]; const k = Math.min(1, d / 0.8); return [Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k)]; };
const go = async (x, z, r = 0.3, max = 900) => { for (let i = 0; i < max; i++) { if (Math.hypot(x - P.pos.x, z - P.pos.z) < r) return true; const [a, b] = steer(x, z); await tick(a, b); } return false; };
const idle = async (n) => { for (let i = 0; i < n; i++) await tick(); };
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) bad++; };
const st = () => (E.profile.data.worlds.walktest || {}).store || {};
const near = (a, b, r) => Math.hypot(a[0] - b[0], a[2] - b[2]) < r;

// the patrol
const p0 = U.wanda.pos; await idle(60);
check(!near(U.wanda.pos, p0, 0.5) && U.wanda.moving, `a walker walks its path (from ${p0.map((v) => v.toFixed(1))} to ${U.wanda.pos.map((v) => v.toFixed(1))})`);
// hidden at 3 s, shown at 4 s
await idle(140);
const hiddenAt = U.wanda.pos; await idle(20);
check(near(U.wanda.pos, hiddenAt, 0.01), 'hidden, it stands still');
await idle(60);
const shownAt = U.wanda.pos; await idle(30);
check(!near(U.wanda.pos, shownAt, 0.2), 'shown again, it walks on');
// standing in its way: it waits; out of the way: it goes on
// stand on its path ahead of it: it stops in front of you, and goes on once you step aside
await go(-2, -12, 0.25, 900);
for (let i = 0; i < 1800; i++) { const q = U.wanda.pos; if (Math.hypot(q[0] - P.pos.x, q[2] - P.pos.z) < 1.3) break; await tick(); }
await idle(30); const w1 = U.wanda.pos; await idle(60);
check(near(U.wanda.pos, w1, 0.05) && Math.hypot(w1[0] - P.pos.x, w1[2] - P.pos.z) < 1.3, `a walker waits while you stand in its way (moved ${Math.hypot(U.wanda.pos[0] - w1[0], U.wanda.pos[2] - w1[2]).toFixed(2)} m)`);
await go(-2, -8, 0.3, 300); await idle(60);
check(!near(U.wanda.pos, w1, 0.5), 'and walks on once you step aside');
// the follower
await go(6, 2.2); await tick(0, 0, 8); await idle(40);
check(st().following != null, 'talking to the follower starts it following');
await go(0, 12, 0.5); await idle(60);
const f = U.fol.pos;
check(Math.hypot(f[0] - P.pos.x, f[2] - P.pos.z) < 3.5, `the follower keeps up (${Math.hypot(f[0] - P.pos.x, f[2] - P.pos.z).toFixed(1)} m behind)`);
// the far zone: it stops, walks to a spot (awaited), and the arrival is recorded after it
await go(0, 24, 0.5); await go(3.5, 24, 0.4); // (then out of its way)
for (let i = 0; i < 600 && st().arrived == null; i++) await tick();
check(st().arrived != null && near(U.fol.pos, [0, 0, 28], 0.05) && E.profile.data.coins === 1, `an awaited walk resumes its code on arrival (tick ${st().arrived}, at ${U.fol.pos.map((v) => v.toFixed(2))})`);
// the gate zone: on after 2 s (we're well past it), moved at 6 s
await go(14, 0, 0.4); await idle(10);
check(st().gate === 1, `a zone switched on later, and moved, triggers at its new place (${st().gate})`);
// the gust turns round every 2 s
await go(-12, 0, 0.3); const pushes = [];
for (let k = 0; k < 4; k++) { const x0 = P.pos.x; await idle(30); pushes.push(Math.sign(P.pos.x - x0)); await idle(90); await go(-12, 0, 0.3); }
check(pushes.includes(1) && pushes.includes(-1), `a wind's force can change (pushes ${pushes.join(', ')})`);
// a waypoint's own wait: Pip stands 2.5 s at one end of the walk and turns straight round at the other
const runs = { far: [], near: [] }; let last = U.pip.pos, run = 0, moved = false;
for (let i = 0; i < 1200; i++) {
  await tick(); const q = U.pip.pos, still = Math.hypot(q[0] - last[0], q[2] - last[2]) < 1e-6; last = q;
  if (still) { run++; continue; }
  if (run && moved) (Math.abs(q[2] - 10) < 0.5 ? runs.far : runs.near).push(run); // a whole stop, from arriving to leaving
  run = 0; moved = true;
}
check(runs.far.length >= 1 && runs.far.every((r) => Math.abs(r - 150) <= 1) && runs.near.length === 0, `a waypoint's own wait (stops at the far end: ${runs.far.map((r) => (r / 60).toFixed(2) + ' s').join(', ')}; at the other: ${runs.near.length})`);
// talking to a walker stops it for the whole talk, and it carries on afterwards
await go(-18.6, 13, 0.25);
for (let i = 0; i < 900; i++) { const q = U.pip.pos; if (U.pip.moving && Math.abs(q[2] - 13) < 1.2) break; await tick(); }
await tick(0, 0, 8); const t0 = U.pip.pos;
await idle(80);
const t1 = U.pip.pos;
check(near(t0, t1, 1e-6) && !U.pip.moving && st().pipTalked == null, 'a walker stops while you talk to it');
for (let i = 0; i < 120 && st().pipTalked == null; i++) await tick();
await idle(30);
check(st().pipTalked != null && !near(U.pip.pos, t1, 0.3), `and carries on when the talk ends (moved ${Math.hypot(U.pip.pos[0] - t1[0], U.pip.pos[2] - t1[2]).toFixed(2)} m)`);
// a talk that sends its walker somewhere goes ahead (it does not wait for itself)
await go(-26.8, -4, 0.25); await tick(0, 0, 8);
for (let i = 0; i < 600 && st().guided == null; i++) await tick();
check(st().guided != null && near(U.guide.pos, [-28, 0, -10], 0.05), `a talk can walk its walker ("Follow me"): ${st().guided != null ? 'it led the way and finished the talk' : `stuck at ${U.guide.pos.map((v) => v.toFixed(2))}`}`);
// sealed and replayed: the same claims and the same state
const proof = { format: FORMAT, sim: await sourceEngine(), engine: 'walk-test', world: W, registry: [W], from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'walk test' } };
E.world.dispose();
const r = await replayRun(proof, { loadModule });
check(r.ok, `the replay matches: ${r.ok ? `${r.ticks} ticks, ${proof.claims.length} claims, state ${r.state.slice(0, 12)}` : r.reason}`);
console.log(`${(t / 60).toFixed(1)} s of play: ${bad ? bad + ' FAILED' : 'ALL OK'}`);
process.exitCode = bad ? 1 : 0;
