// Halcyon Point (src/worlds/halcyon.js), played headlessly on the real physics by scripted riders: free play on the
// Giant's face, and scored rides from Marisol's tow with different riders (one who does nothing, one who holds a line,
// one who rides in the pocket near the curl, one who also jumps and spins high on the face). Each scenario is one visit; its
// proof is written out and must verify like any run.
// The riders decide every tick; --delay N gives them a person's reaction time (they act N ticks late).
// usage: node tools/surf_bot.mjs [--only free,passive,...] [--out DIR] [--docs DIR] [--delay N] [-v]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootHeadless } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw, endOf } from '../src/engine/run.js';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/surf')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const DELAY = +opt('--delay', 0), LINE = +opt('--line', 72);
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'halcyon');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // walking: the stick's basis faces -z (stick up is -z, stick right is +x)
const yieldNow = () => new Promise((r) => setImmediate(r));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angDiff = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
const f1 = (v) => (+v).toFixed(1);
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

class Bot {
  constructor(E) { this.E = E; this.S = E.world.group.userData.halcyon; this.t = 0; this.log = []; this.queue = []; }
  get p() { return this.E.player.pos; }
  get feet() { return this.E.player.pos.y - 0.93; }
  get yaw() { return this.E.player.yaw / (Math.PI / 180); }
  async tick(qx = 0, qy = 0, bits = 0) {
    if (this.E.sim.ended) throw new Error('the visit already ended');
    this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++;
    await yieldNow();
  }
  // on foot: walk to (x, z)
  async go(x, z, r = 0.6, maxS = 40) {
    for (let i = 0; i < maxS * 60; i++) {
      const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz);
      if (d < r) return;
      const k = Math.min(1, d / 1.0);
      await this.tick(Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k), 0);
    }
    throw new Error(`go to (${x}, ${z}): stuck at (${f1(this.p.x)}, ${f1(this.p.y)}, ${f1(this.p.z)})`);
  }
  // on the board: turn toward heading psi (degrees; 0 faces +z, 90 faces +x), with W held (paddling) if asked
  stick(psi, paddle = 0) { const d = angDiff(this.yaw, psi); return [Math.round(clamp(d / 22, -1, 1) * 127), Math.round(paddle * 127)]; }
  async paddleTo(x, z, r = 3, maxS = 40) {
    for (let i = 0; i < maxS * 60; i++) {
      const dx = x - this.p.x, dz = z - this.p.z;
      if (Math.hypot(dx, dz) < r) return;
      const [qx, qy] = this.stick(Math.atan2(dx, dz) / (Math.PI / 180), 1); await this.tick(qx, qy, 0);
    }
    throw new Error(`paddle to (${x}, ${z}): stuck at (${f1(this.p.x)}, ${f1(this.p.z)})`);
  }
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async settle(maxS = 30) { let calm = 0; for (let i = 0; i < maxS * 60 && calm < 30; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(); }
  // from the arrival to Marisol at the end of the pier, and a tow
  async towIn() {
    await this.go(6.5, 52, 0.4);
    await this.use();
    for (let i = 0; i < 400 && this.S.state !== 'tow'; i++) await this.tick();
    if (this.S.state !== 'tow') throw new Error(`no tow (state ${this.S.state})`);
    for (let i = 0; i < 400 && this.S.state === 'tow'; i++) await this.tick();
    if (this.S.state !== 'ride') throw new Error(`the tow did not start a ride (state ${this.S.state})`);
  }
  sample() {
    const S = this.S, x = this.p.x;
    this.log.push({ t: this.t, x, dx: x - S.xp, y: this.feet, s: -20 - this.p.z, v: this.E.player.boardSpeed, yaw: this.yaw, score: S.score, g: this.E.player.grounded });
  }
  // ride until the ride ends; pick(): [psi, paddle, bits] each tick
  async ride(pick, maxS = 110) {
    for (let i = 0; i < maxS * 60 && this.S.state === 'ride'; i++) {
      if (i % 30 === 0) this.sample();
      const want = pick(this);
      this.queue.push(want);
      const [psi, paddle, bits] = this.queue.length > DELAY ? this.queue.shift() : [this.yaw, 0, 0];
      const [qx, qy] = typeof psi === 'number' ? this.stick(psi, paddle) : psi; // (a raw stick [qx, qy] also works)
      await this.tick(qx, qy, bits || 0);
    }
    this.sample();
    const r = { how: this.S.endHow, score: Math.round(this.S.score), airs: this.S.airs, tube: this.S.bestTube, t: this.S.t };
    await this.idle(200); // the ending: the banner, the record, a hat for making it, and back to the beach
    if (this.S.state !== 'free') throw new Error(`not back on the beach after the ride (state ${this.S.state})`);
    if (r.how === 'made' && !this.E.sim.claims.some((c) => c[1] === 'give' && c[2] === 'sun-hat')) throw new Error('made the wave, but no Sun Hat');
    return r;
  }
}

// riders: each returns [heading, paddle, bits] for this tick
const passive = () => [[0, 0], 0, 0];
const trim = (y0) => (b) => { const e = y0 - b.feet; return [90 + clamp(e * 6, -50, 50), 0, 0]; };
// the carving rider: the pocket rider's line, with big S-turns on top (down the face and back up it, 0.45 a second)
function carver() {
  let ph = 0, lastXp = null;
  // the line: only the gap to the curl (no height held: the turns take it up and down the face); big turns with room
  // to spare, small ones close to the curl, where a bottom turn meets the falling lip
  return (b) => {
    const S = b.S, vp = lastXp == null ? 12 : (S.xp - lastXp) * 60; lastXp = S.xp;
    const dx = b.p.x - S.xp, dxAhead = dx + 0.6 * (b.E.player.vel.x - vp), y = b.feet + 0.6 * b.E.player.vel.y;
    ph += 1 / 60;
    const line = 90 - clamp((12 - dxAhead) * 3, -30, 28) + (y < 3 ? 25 : y > 18 ? -25 : 0);
    if (dxAhead < 6) return [62, 0, 0]; // the curl is on you: drive
    return [line + (dx > 9 ? 50 : 18) * Math.sin(ph * 2 * Math.PI * 0.45), 0, 0];
  };
}
// the pocket rider: holds a height (y) and a distance ahead of the curl (dx) by its angle on the face: lower and
// faster when the curl closes in, higher and slower when it falls behind. With air: a jump high on the face, a full
// spin, and a landing lined up with the wave.
function pocketRider(opts = {}) {
  const yT = opts.y || 10, dxT = opts.dx || 12;
  return (b) => {
    const S = b.S, dx = b.p.x - S.xp, y = b.feet;
    if (S.air) { if (VERBOSE && b.t % 4 === 0) console.log(`      air t ${S.t.toFixed(2)} rot ${S.air.rot.toFixed(0)} yaw ${b.yaw.toFixed(0)} vel (${b.E.player.vel.x.toFixed(1)},${b.E.player.vel.y.toFixed(1)},${b.E.player.vel.z.toFixed(1)}) y ${y.toFixed(1)}`); return opts.spin && Math.abs(S.air.rot) < 335 ? [[127, 0], 0, 0] : [90, 0, 0]; }
    // looking ahead 0.6 s, as a person does: where the height and the gap to the curl are heading
    const vp = b.lastXp == null ? 12 : (S.xp - b.lastXp) * 60; b.lastXp = S.xp;
    const yAhead = y + 0.6 * b.E.player.vel.y, dxAhead = dx + 0.6 * (b.E.player.vel.x - vp);
    const yWant = dxAhead < 12 ? Math.min(yT, 8.5) : yT; // deep near the curl, ride low: under the lip, not into it
    let psi = 90 + clamp((yWant - yAhead) * 4, -30, 30) - clamp((dxT - dxAhead) * 3, -35, 28);
    if (dxAhead < 6) psi = Math.min(psi, 62); // the curl is on you: drive, down the line and down the face
    const jump = opts.air && S.t > 3 && b.E.player.grounded && y > 10 && dx > 12 && b.t - (b.jumped || 0) > 150 ? 1 | 2 : 0;
    if (jump) b.jumped = b.t;
    return [psi, 0, jump];
  };
}

const SCENARIOS = {
  // free play: paddle out, ride the face along the reef without a ride, and come back to the lagoon at its end
  free: async (b) => {
    await b.go(30, 50); await b.paddleTo(60, -14, 2);
    let tTop = 0, ys = [];
    for (let i = 0; i < 60 * 14; i++) {
      const s = -20 - b.p.z, on = s > 0 && b.E.player.grounded;
      if (on) ys.push(b.feet);
      const [qx, qy] = b.stick(90, b.E.player.boardSpeed < 8 ? 1 : 0); await b.tick(qx, qy, 0);
      if (b.feet > 3) tTop++;
    }
    if (ys.length < 300) throw new Error(`never rode up onto the face (${ys.length} ticks on it)`);
    const last = ys.slice(-240), avg = last.reduce((a, c) => a + c, 0) / last.length;
    b.note = `on the face ${(ys.length / 60).toFixed(1)} s, settled at ${avg.toFixed(1)} m up (trim), x ${f1(b.p.x)}`;
    if (avg < 6 || avg > 20) throw new Error(`the trim line is off: ${avg.toFixed(1)} m`);
  },
  passive: async (b) => { await b.towIn(); const r = await b.ride(passive); b.note = JSON.stringify(r); if (r.how === 'made') throw new Error('a rider who does nothing made the wave'); },
  trim: async (b) => { await b.towIn(); const r = await b.ride(trim(11)); b.note = JSON.stringify(r); },
  // hands off on the line the browser found (about 72 degrees, down the line): it makes the wave, and scores little
  line: async (b) => { await b.towIn(); const r = await b.ride((bb) => [bb.S.t < 1.2 ? LINE : [0, 0], 0, 0]); b.note = JSON.stringify(r); if (r.score > 900) throw new Error(`hands off scored ${r.score}`); },
  // wiggling: A and D in turn every quarter second on top of a steady line. It must not count as carving
  wiggle: async (b) => { await b.towIn(); const base = pocketRider({ y: 10, dx: 14 }); let k = 0; const r = await b.ride((bb) => { const [psi] = base(bb); k++; return [psi + (Math.floor(k / 15) % 2 ? 30 : -30), 0, 0]; }); b.note = JSON.stringify(r) + ` carves ${b.S.carves}`; if (b.S.carves > 12) throw new Error(`wiggling counted ${b.S.carves} carves`); },
  pocket: async (b) => { await b.towIn(); const r = await b.ride(pocketRider({ dx: 8 })); b.note = JSON.stringify(r); if (r.how !== 'made') throw new Error(`the pocket rider did not make the wave: ${r.how}`); },
  // a lazy rider: one bottom turn (A for 0.45 s), then hands off. The wave must not ride itself
  lazy: async (b) => { await b.towIn(); let k = 0; const r = await b.ride(() => (k++ < 27 ? [[-127, 0], 0, 0] : [[0, 0], 0, 0])); b.note = JSON.stringify(r); if (r.score > 900) throw new Error(`hands off scored ${r.score}`); },
  steady: async (b) => { await b.towIn(); const r = await b.ride(pocketRider({ y: 10, dx: 16 })); b.note = JSON.stringify(r); if (r.how !== 'made') throw new Error(`the steady pocket rider did not make the wave: ${r.how}`); },
  carve: async (b) => { await b.towIn(); const r = await b.ride(carver()); b.note = JSON.stringify(r) + ` carves ${b.S.carves}`; if (r.how !== 'made') throw new Error(`the carving rider did not make the wave: ${r.how}`); },
  // Season 1 of the Founder's hunt: make the wave, then Echo IX over Kiko's sandcastle on the beach
  echo9: async (b) => {
    await b.towIn(); const r = await b.ride(pocketRider({ dx: 8 })); b.note = JSON.stringify(r);
    if (r.how !== 'made') throw new Error(`did not make the wave: ${r.how}`);
    if (b.E.player.board) { await b.tick(0, 0, 4); await b.idle(20); }                     // (B: off the board, on foot)
    if (b.E.player.board) throw new Error('still on the board');
    await b.go(12, 64, 0.8); await b.go(-40, 64.5, 0.8); await b.go(-44.2, 64.5, 0.4); // (round the pier's root, along the upper beach)
    for (let i = 0; i < 120 && !b.E.profile.data.flags['echo.9']; i++) await b.tick();
    if (!b.E.profile.data.flags['echo.9']) throw new Error('no Echo IX over the sandcastle');
  },
  air: async (b) => { await b.towIn(); const r = await b.ride(pocketRider({ y: 13, dx: 22, air: true, spin: true })); b.note = JSON.stringify(r); if (!r.airs) throw new Error('no air'); },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const SEEDS = { echo9: { 'hunt.started': true, 's1.started': true } };
  const entry = { coins: 0, inv: {}, eq: Object.assign({}, EQ0), flags: Object.assign({ 'met.wren': true }, SEEDS[name] || {}), save: null };
  const spec = { registry, world: WORLD, from: 'hub', entry };
  const ui = { dialog: async () => {}, choice: async () => 0 };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E);
  let err = null;
  try { await plan(b); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'surf-bot', world: WORLD, registry, from: 'hub', entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'Surf Bot' } };
  writeFileSync(join(OUT, `surf-${name}.json`), JSON.stringify(proof));
  if (VERBOSE) for (const l of b.log) console.log(`    t ${f1(l.t / 60)} x ${f1(l.x)} dx ${f1(l.dx)} y ${f1(l.y)} s ${f1(l.s)} v ${f1(l.v)} yaw ${f1(l.yaw)} ${l.g ? 'G' : 'air'} score ${Math.round(l.score)}`);
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t})${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL RIDES OK');
process.exitCode = bad ? 1 : 0;
