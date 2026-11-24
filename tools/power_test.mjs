// Artifacts' powers, item families and world switches (engine): played headlessly on the real physics, then sealed as
// a proof and replayed, which must give the same claims and state. Exits 1 on failure.
// usage: node tools/power_test.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless, replayRun } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const text = readFileSync(join(root, 'tests/worlds/powertest.js'), 'utf8');
const W = { id: 'powertest', sha256: createHash('sha256').update(text).digest('hex') };
let nonce = 0;
const loadModule = async (r) => { if (r.sha256 !== W.sha256) throw new Error('unknown module'); return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// ${nonce++}\n`).toString('base64'))).default; };
const QA = quantYaw(Math.PI);
const yieldNow = () => new Promise((r) => setImmediate(r));
const INV = { 'pt-glass': 1, 'pt-bubble': 1, 'pt-seeker': 1, 'pt-mask': 1, 'pt-wild': 1, 'pt-boots': 1, 'pt-blade': 1 };
const entry = { coins: 0, inv: INV, eq: { head: null, back: null, hand: 'pt-blade', feet: 'pt-boots', board: null, body: null, charm: 'pt-glass' }, flags: {}, save: null };
const spec = { registry: [W], world: W, from: null, entry };
const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui: { dialog: async () => {}, choice: async () => 0 } });
if (error) { console.log('FAIL boot:', error); process.exit(1); }
E.rec = new RunLog();
const P = E.player, PW = () => P.pw;
let t = 0, bad = 0;
const POW = 1024 | 2048, HELD = 2048, STRIKE = 512, JUMP = 1 | 2;
const tick = async (qx = 0, qy = 0, bits = 0) => { E.tick(frameFromCodes(qx, qy, QA, bits)); t++; await yieldNow(); };
const steer = (x, z) => { const dx = x - P.pos.x, dz = z - P.pos.z, d = Math.hypot(dx, dz); if (d < 0.04) return [0, 0]; const k = Math.min(1, d / 0.8); return [Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k)]; };
const go = async (x, z, r = 0.3, max = 1200) => { for (let i = 0; i < max; i++) { if (Math.hypot(x - P.pos.x, z - P.pos.z) < r) return true; const [a, b] = steer(x, z); await tick(a, b); } return false; };
const idle = async (n) => { for (let i = 0; i < n; i++) await tick(); };
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) bad++; };
const st = () => (E.profile.data.worlds.powertest || {}).store || {};
const equip = async (id) => { E.queueAction(['equip', id, 'charm']); await tick(); };
const records = () => E.sim.claims.filter((c) => c[1] === 'record').length;
const cdOf = (id) => PW().cds[id] || 0;
const f3 = (v) => v.map((x) => x.toFixed(2)).join(', ');

// ---- records count on a visit without powers ----
await go(12, 12, 0.5); await idle(2);
check(st().rec === true && records() === 1, 'a record before any power is used: on the board');
await go(12, 6, 0.4);

// ---- the rewind: back along your own path, exactly ----
check(P.power && P.power.kind === 'rewind' && P.power.seconds === 60, 'a magic artifact works where magic is allowed');
const trail = [];
for (const [x, z] of [[4, 6], [4, -4], [-6, -4]]) { for (let i = 0; i < 2000; i++) { if (Math.hypot(x - P.pos.x, z - P.pos.z) < 0.3) break; const [a, b] = steer(x, z); await tick(a, b); trail.push([P.pos.x, P.pos.y, P.pos.z]); } }
const n = trail.length;
await tick(0, 0, POW); // tick 1 of the rewind
// (after rewind tick j, three samples a tick have been taken back: you stand where you were 3j ticks before the press)
let exact = PW().kind === 'rewind' && P.pos.x === trail[n - 3][0] && P.pos.z === trail[n - 3][2];
for (let j = 2; j <= 40; j++) { await tick(0, 0, HELD); const q = trail[n - 3 * j]; if (P.pos.x !== q[0] || P.pos.y !== q[1] || P.pos.z !== q[2]) exact = false; }
check(exact, `rewinding retraces your path exactly, three ticks of it per tick (now at ${f3([P.pos.x, P.pos.y, P.pos.z])})`);
check(Math.abs(PW().back - 120 / 60) < 1e-9, `40 ticks held rewind 2 seconds (${PW().back.toFixed(3)} s)`);
await tick(0, 0, 0); // let go
check(PW().kind === null && Math.abs(cdOf('pt-glass') - 20) < 0.02 && PW().used === 1, `letting go ends it, and it recharges (${cdOf('pt-glass').toFixed(2)} s)`);
await tick(0, 0, POW); await idle(5);
check(PW().kind === null && PW().used === 1 && cdOf('pt-glass') > 19.8, 'pressed again while recharging: nothing happens');

// ---- the shield: no hit gets through for 6 s (each artifact recharges on its own) ----
await equip('pt-bubble');
check(P.power && P.power.kind === 'shield' && cdOf('pt-bubble') === 0, 'another artifact is ready at once: each recharges on its own');
await go(-17.2, -20, 0.3);
for (let i = 0; i < 120 && E.world.foes[0].state !== 'chase'; i++) await tick();
await tick(0, 0, POW);
check(PW().kind === 'shield', 'the bubble is up');
for (let i = 0; i < 330; i++) await tick();
check((st().blocked || 0) >= 1 && P.hearts === 3 && !st().hurt, `the slime's hits bounce off it (${st().blocked || 0} blocked, hearts ${P.hearts})`);
for (let i = 0; i < 400 && !st().hurt; i++) { const f = E.world.foes[0]; const [a, b] = steer(f.x, f.z); await tick(Math.round(a * 0.2), Math.round(b * 0.2)); }
check(PW().kind === null && st().hurt >= 1 && P.hearts < 3, `after six seconds, hits land again (hearts ${P.hearts})`);
await go(-6, -6, 0.5);

// ---- fighting: off in the peace garden (no strike reaches the world, the blade sleeps), on outside it ----
const a0 = st().attacks || 0; await tick(0, 0, STRIKE); await idle(2);
check((st().attacks || 0) === a0 + 1, 'outside: the strike key strikes');
await go(0, 30, 0.6); await idle(2);
const a1 = st().attacks || 0, nf = st().nofight || 0; await tick(0, 0, STRIKE); await idle(2);
check((st().attacks || 0) === a1 && (st().nofight || 0) === nf + 1 && !P.avatar.slots.hand.visible, 'in a place without fighting: no strike, the world hears "nofight", the blade sleeps');
await go(0, 22, 0.6); await idle(2);
check(P.avatar.slots.hand.visible, 'and out of it again, the blade is back');

// ---- families: no magic in the temple, no machines in the hall, no artifacts in the bare room ----
await equip('pt-glass');
await go(-12, 20, 0.6); await idle(2);
const pw0 = st().powers || '';
await tick(0, 0, POW); await idle(2);
check(P.power === null && PW().kind === null && (st().powers || '') === pw0 && P.abil.doublejump, 'where magic sleeps: the magic artifact does nothing, the machine boots still work');
await go(-12, 12, 0.6); await idle(2);
check(P.power && P.power.kind === 'rewind', 'out of the temple, the magic is back');
await go(12, 20, 0.6); await idle(2);
check(!P.abil.doublejump && P.power && P.power.kind === 'rewind', 'where machines sleep: no double jump; the magic artifact still works');
await equip('pt-seeker');
check(P.power === null, 'and the machine artifact sleeps too');
await go(4, 20, 0.6); await idle(2);
check(P.abil.doublejump && P.power && P.power.kind === 'finder', 'out of the hall, machines wake');
await go(-24, 30, 0.6); await idle(2);
check(P.power === null, 'where artifacts sleep: none works');
await go(-24, 22, 0.6); await idle(2);

// ---- the finder: the nearest thing to find, never a key ----
await go(0, -6, 0.3); await idle(2);
await tick(0, 0, POW);
check(PW().kind === 'finder' && PW().at && PW().at.join() === '8,1,-14' && PW().what === 'a coin', `the finder marks the nearest coin, not the nearer key (${PW().at && PW().at.join()}, ${PW().what})`);
await go(8, -14, 0.5); await idle(10);
check(E.profile.data.coins === 1, 'that coin is collected');
for (let i = 0; i < 900 && (PW().kind || cdOf('pt-seeker') > 0); i++) await tick();
await tick(0, 0, POW);
check(PW().kind === 'finder' && PW().at && PW().at.join() === '-16,1,6' && PW().what === 'a gem', `then the next: the gem (${PW().at && PW().at.join()})`);

// ---- the transformation: faster and higher, until it ends or you press again ----
await equip('pt-mask');
await tick(0, 0, POW);
check(PW().kind === 'transform' && PW().form && PW().form.speed === 1.5, 'the mask: you change shape');
let top = 0;
for (let i = 0; i < 50; i++) { await tick(0, 127); top = Math.max(top, Math.hypot(P.vel.x, P.vel.z)); }
check(Math.abs(top - 12) < 0.01, `a stag runs half again as fast (${top.toFixed(2)} m/s)`);
await idle(30);
const y0 = P.pos.y; let yMax = y0; await tick(0, 0, JUMP);
for (let i = 0; i < 40; i++) { await tick(0, 0, 2); yMax = Math.max(yMax, P.pos.y); }
check(yMax - y0 > 3.1 && yMax - y0 < 3.4, `and leaps higher (${(yMax - y0).toFixed(2)} m; on two legs about 1.9)`);
await idle(40);
await tick(0, 0, POW);
check(PW().kind === null && Math.abs(cdOf('pt-mask') - 30) < 0.02, 'pressed again: back to yourself, and it recharges');
// limits: an artifact asking for too much is held to the engine's
await equip('pt-wild');
check(P.power && P.power.seconds === 60 && P.power.cooldown === 5 && P.power.form.speed === 1.6 && P.power.form.jump === 1.4, `an artifact's numbers are clamped (${P.power && [P.power.seconds, P.power.cooldown, P.power.form.speed, P.power.form.jump].join(', ')})`);
// a form that meets a place where it cannot be ends there
await tick(0, 0, POW);
const wasWild = PW().kind === 'transform';
await go(-24, 30, 0.6); await idle(2);
check(wasWild && PW().kind === null && cdOf('pt-wild') > 0, 'a form ends where artifacts sleep');
await go(-24, 22, 0.6);

// ---- rewinding a fall ----
await equip('pt-glass');
for (let i = 0; i < 1300 && cdOf('pt-glass') > 0; i++) await tick();
for (let i = 0; i < 1200 && P.pos.x < 25; i++) { const [a, b] = steer(22, 0); await tick(a, b); } // the pad puts you on the ledge
await idle(30);
const onLedge = P.pos.y > 5.5 && P.grounded;
for (let i = 0; i < 200 && P.pos.y > 2.5; i++) await tick(127, 0); // run off its edge and fall
const fell = P.pos.y <= 2.5;
await tick(0, 0, POW);
for (let i = 0; i < 300 && !(P.pos.y > 5.9 && P.pos.x < 32.5); i++) await tick(0, 0, HELD);
await idle(40);
check(onLedge && fell && P.grounded && Math.abs(P.pos.y - 5.93) < 0.05 && P.pos.x < 33, `a rewind undoes a fall: back on the ledge (y ${P.pos.y.toFixed(2)}, x ${P.pos.x.toFixed(2)})`);

// ---- a respawn ends the way back ----
for (let i = 0; i < 1300 && cdOf('pt-glass') > 0; i++) await tick();
await go(36, 8, 0.6);
let respawned = false;
for (let i = 0; i < 600; i++) { const x0 = P.pos.x; await tick(127, 0); if (x0 > 30 && P.pos.x < 5) { respawned = true; break; } }
await tick(0, 0, POW);
check(respawned && PW().kind === null && P.hn < 8, `after a respawn there is nothing to rewind yet (${P.hn} samples)`);

// ---- a visit that used a power sets no records ----
const r0 = records();
await go(12, 12, 0.5); await idle(2);
check(st().rec === false && records() === r0, 'a record after a power was used: refused');

// ---- sealed and replayed: the same claims and the same state ----
const proof = { format: FORMAT, sim: await sourceEngine(), engine: 'power-test', world: W, registry: [W], from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'power test' } };
E.world.dispose();
const r = await replayRun(proof, { loadModule });
check(r.ok, `the replay matches: ${r.ok ? `${r.ticks} ticks, ${proof.claims.length} claims, state ${r.state.slice(0, 12)}` : r.reason}`);
console.log(`${(t / 60).toFixed(1)} s of play: ${bad ? bad + ' FAILED' : 'ALL OK'}`);
process.exitCode = bad ? 1 : 0;
