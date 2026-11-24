// Moving platforms carry their riders (engine): a lift rises 12 m and its rider walks off at the top; then rides it
// down; a sideways ferry carries its rider. Played headlessly on the real physics. Exits 1 on failure.
// usage: node tools/lift_test.mjs [-v]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { RunLog, frameFromCodes, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('-v');
const text = readFileSync(join(root, 'tests/worlds/lifttest.js'), 'utf8');
const sha = createHash('sha256').update(text).digest('hex');
const W = { id: 'lifttest', sha256: sha };
let nonce = 0;
const loadModule = async () => (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI);
const yieldNow = () => new Promise((r) => setImmediate(r));
const entry = { coins: 0, inv: {}, eq: { head: null, back: null, hand: null, feet: null, board: null, body: null }, flags: {}, save: null };
const { E, error } = await bootHeadless({ registry: [W], world: W, from: null, entry }, { loadModule }, { replaying: false });
if (error) { console.log('FAIL boot:', error); process.exit(1); }
E.rec = new RunLog();
const P = E.player, U = E.world.group.userData.lift;
const mover = (mesh) => E.world.movers.find((m) => m.mesh === mesh);
let t = 0, bad = 0;
const tick = async (qx = 0, qy = 0, bits = 0) => { E.tick(frameFromCodes(qx, qy, QA, bits)); t++; await yieldNow(); };
const steer = (x, z) => { const dx = x - P.pos.x, dz = z - P.pos.z, d = Math.hypot(dx, dz); if (d < 0.04) return [0, 0]; const k = Math.min(1, d / 0.8); return [Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k)]; };
const go = async (x, z, r = 0.3, max = 600) => { for (let i = 0; i < max; i++) { if (Math.hypot(x - P.pos.x, z - P.pos.z) < r) return true; const [a, b] = steer(x, z); await tick(a, b); } return false; };
const until = async (f, max) => { for (let i = 0; i < max; i++) { if (f()) return true; await tick(); } return false; };
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) bad++; };
const gap = (m) => P.pos.y - 0.9 - (m.cur.y + 0.2); // the rider's skin: feet above the platform's top (0.03 at rest)

// the lift, up: wait for it at the floor, ride, step off east onto the tower
const L = () => mover(U.lift);
await go(0, -2.5); await until(() => L().cur.y < -0.1 && L().wait > 0.5, 1200); await go(0, -6, 0.2);
let minGap = 9;
for (let i = 0; i < 900 && !(L().cur.y > 11.7 && L().wait > 0.3); i++) { await tick(); if (L().cur.y > 0.5) minGap = Math.min(minGap, gap(L())); if (VERBOSE && i % 60 === 0) console.log(`  up: lift ${L().cur.y.toFixed(2)} rider ${P.pos.y.toFixed(3)} gap ${gap(L()).toFixed(3)}`); }
check(P.pos.y > 12.5, `the lift carries its rider to the top (rider at ${P.pos.y.toFixed(2)})`);
check(minGap > 0.015, `the rider keeps its skin on the way up (smallest gap ${minGap.toFixed(3)} m)`);
const off = await go(3.5, -6, 0.3, 240);
check(off && P.pos.y > 12.5, `and walks off at the top onto the landing (at ${P.pos.x.toFixed(2)}, ${P.pos.y.toFixed(2)})`);
// back onto the lift when it rests at the top again, and down
await until(() => L().cur.y > 11.7 && L().wait > 1.5, 1800); await go(0, -6, 0.2);
await until(() => L().cur.y < -0.1 && L().wait > 0.3, 900);
check(P.pos.y < 1.5, `ridden back down (rider at ${P.pos.y.toFixed(2)})`);
check(await go(0, -2.5, 0.3, 240), 'and walks off at the bottom');
// the ferry, sideways
const F = () => mover(U.ferry);
await go(-6, -3); await go(-6, 1.6);
await until(() => F().cur.z < 4.05 && F().wait > 0.8, 900); await go(-6, 4, 0.2);
await until(() => F().cur.z > 13.5 && F().wait > 0.3, 900);
check(Math.abs(P.pos.z - 13.6) < 0.8 && P.pos.y > 1.5, `the ferry carries its rider across (at z ${P.pos.z.toFixed(2)})`);
check(await go(-6, 16, 0.3, 240) && P.pos.y > 1.5, `and its rider walks off onto the far dock (at z ${P.pos.z.toFixed(2)}, y ${P.pos.y.toFixed(2)})`);
console.log(`${(t / 60).toFixed(1)} s of play: ${bad ? bad + ' FAILED' : 'ALL OK'}`);
process.exitCode = bad ? 1 : 0;
