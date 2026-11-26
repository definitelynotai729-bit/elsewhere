// Skyreach (src/worlds/skyreach.js), played headlessly by a scripted bot on the real physics: the whole climb (the
// stepping stones, the jump pad, the moving planks, the crumbling bridge, the windy beams between gusts, the lift, the
// spiral and the summit's pad) with its record on the boards; and Season 2 of the Founder's hunt (GAME.md: The
// Stranger): the stranger on the landing island races you up, after a head start, and Echo XIV appears at the top for
// whoever gets there first (a race lost offers a rematch). Each scenario is one visit from a seeded state; its proof is
// written out and must verify like any run.
// usage: node tools/skyreach_bot.mjs [--only climb,race,lose] [--out DIR] [--docs DIR] [--ghost FILE] [-v]
//   --ghost FILE: write the climb's path from the stranger's start (the race's recorded run) as JSON
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw, endOf } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/skyreach')), docs = opt('--docs', join(root, 'docs')), GHOST = opt('--ghost', ''), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'skyreach');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };
const D = Math.PI / 180;
// the course (skyreach.js): where things are
const SP = [16, -34], SUM = [16, 41.6, -34], START = [2.2, -9.6];
const STONES = [[0, 0.7, -16.5], [2.6, 1.3, -20.6], [0, 1.9, -24.6], [-2.6, 2.5, -28.6], [0, 3.1, -32.4]];
const SPIRAL = Array.from({ length: 8 }, (_, k) => { const a = (280 - k * 28) * D; return [SP[0] + Math.sin(a) * 11.5, 28.2 + 1.35 * (k + 1), SP[1] + Math.cos(a) * 11.5]; });
const gustAt = (t) => (t % 3.8) < 1.4;

class Bot {
  constructor(E) { this.E = E; this.t = 0; this.deaths = 0; this.trace = null; }
  get p() { return this.E.player.pos; }
  get grounded() { return this.E.player.grounded; }
  get now() { return this.E.world.ticks; }
  get time() { return this.E.world.time; }
  get M() { return this.E.world.movers; }
  get R() { return this.E.world.group.userData.skyRace; }
  flag(k) { return this.E.profile.data.flags[k]; }
  store(k, d) { const ws = this.E.profile.data.worlds.skyreach; const v = ws && ws.store ? ws.store[k] : undefined; return v === undefined ? d : v; }
  async tick(qx = 0, qy = 0, bits = 0) {
    if (this.E.sim.ended) throw new Error('the visit already ended');
    this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++;
    if (this.trace) this.trace.push([this.p.x, this.p.y, this.p.z, this.grounded ? 1 : 0]);
    await yieldNow();
  }
  stick(x, z, slow = 1.0) {
    const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz);
    if (d < 0.03) return [0, 0];
    const k = Math.min(1, d / slow);
    return [Math.round((dx / d) * 127 * k), Math.round((-dz / d) * 127 * k)];
  }
  // walk to (x, z), to within r metres; fails on a fall (well below where it started)
  async go(x, z, r = 0.45, maxS = 30, what = '') {
    const y0 = this.p.y;
    for (let i = 0; i < maxS * 60; i++) {
      if (Math.hypot(x - this.p.x, z - this.p.z) < r) return;
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (this.p.y < y0 - 3) throw new Error(`fell walking to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: at ${f2(this.p)}`);
    }
    throw new Error(`walk to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: stuck at ${f2(this.p)}`);
  }
  // jump toward a platform whose top is at y, landing near (x, z): run at it and jump at the edge (off it, within
  // 3.2 m of the target, or stuck against a step), steering all the way down
  async hop(x, y, z, label = '') {
    let last = null, stuck = 0;
    for (let i = 0; i < 300; i++) {
      const d = Math.hypot(x - this.p.x, z - this.p.z);
      if (!this.grounded || d < 3.2 || stuck > 4) break;
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (last && Math.hypot(this.p.x - last[0], this.p.z - last[1]) < 0.02) stuck++; else stuck = 0;
      last = [this.p.x, this.p.z];
    }
    for (let i = 0; i < 240; i++) {
      const [qx, qy] = this.stick(x, z, 0.3);
      await this.tick(qx, qy, i === 0 ? 3 : i < 18 ? 2 : 0);
      if (VERBOSE && i % 5 === 0) console.log(`        hop ${label} i${i}: ${f2(this.p)} g ${this.grounded} c ${(this.time % 3.8).toFixed(2)}`);
      if (i > 5 && this.grounded) {
        if (Math.abs(this.p.y - 0.93 - y) < 0.45) return;
        throw new Error(`hop ${label} to (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}): landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`hop ${label}: never landed (${f2(this.p)})`);
  }
  // after a launch (a jump pad): steer for (x, z) until down on a top at y
  async fly(x, y, z, label) {
    for (let i = 0; i < 600; i++) {
      const [qx, qy] = this.stick(x, z, 0.5); await this.tick(qx, qy, 0);
      if (i > 10 && this.grounded) { if (Math.abs(this.p.y - 0.93 - y) < 0.5) return; throw new Error(`${label}: came down at ${f2(this.p)}`); }
    }
    throw new Error(`${label}: never came down (${f2(this.p)})`);
  }
  async hold(x, z, n) { for (let i = 0; i < n; i++) { const [qx, qy] = this.stick(x, z, 0.6); await this.tick(qx, qy, 0); } }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(); }
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async settle(maxS = 60) { let calm = 0; for (let i = 0; i < maxS * 60 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  // ---- the climb, from the landing island's south edge to the summit ----
  async climb() {
    const t0 = this.now, lap = (what) => { if (VERBOSE) console.log(`      ${what}: ${((this.now - t0) / 60).toFixed(1)} s ${f2(this.p)}`); };
    await this.go(0, -10.5, 0.5, 20, 'the landing island\'s edge');
    for (const [i, [x, y, z]] of STONES.entries()) await this.hop(x, y, z, `stone ${i + 1}`);
    await this.hop(0, 3.7, -36.2, 'the first isle');
    lap('stones');
    // the jump pad: onto it, then steer for the isle it throws you to
    await this.go(2.4, -41, 0.3, 10, 'the jump pad');
    await this.until(() => !this.grounded && this.E.player.vel.y > 5, 2, 'the pad');
    await this.fly(10, 9.6, -46, 'the pad\'s isle');
    lap('pad');
    // the planks: on to the first while it waits at the near end, across at the middle, off at the far end
    const [pl1, pl2] = this.M;
    await this.go(12.6, -46, 0.3, 10, 'the isle\'s east edge');
    await this.until(() => pl1.cur.x < 16.2 && pl1.wait > 0.25, 12, 'the first plank');
    await this.go(pl1.cur.x, -46, 0.35, 3, 'onto the first plank');
    await this.until(() => pl1.cur.x > 20.8 && pl2.cur.x < 23.7, 12, 'the planks to meet');
    for (let i = 0; i < 90 && Math.hypot(this.p.x - pl2.cur.x, this.p.z + 46) > 0.35; i++) { const [qx, qy] = this.stick(pl2.cur.x, -46); await this.tick(qx, qy, 0); }
    await this.until(() => pl2.cur.x > 28.2, 12, 'the far end');
    await this.go(32.5, -46, 0.4, 5, 'the far isle');
    lap('planks');
    // the crumbling bridge, without stopping
    await this.go(34, -43, 0.4, 5, 'the bridge\'s foot');
    await this.go(34, -21.5, 0.6, 10, 'over the crumbling bridge');
    lap('bridge');
    // the windy beams, each stretch between gusts (the small isle in the middle is the place to wait, holding on)
    await this.go(32, -18.5, 0.3, 5, 'beside the first beam');        // (just out of the wind)
    for (let i = 0; i < 8 * 60; i++) { const c = this.time % 3.8; if (c > 1.42 && c < 1.6) break; await this.hold(32, -18.5, 1); }
    await this.go(18, -18.5, 0.5, 4, 'the middle isle');
    for (let i = 0; ; i++) { const c = this.time % 3.8; if (c > 1.42 && c < 1.75 && Math.hypot(this.p.x - 18.6, this.p.z + 18.5) < 1.2) break; if (i > 12 * 60) throw new Error('no calm on the middle isle'); await this.hold(18.6, -18.5, 1); }
    await this.hop(1.5, 13.2, -18.5, 'the lift\'s isle');
    lap('beams');
    // the lift: on while it waits at the bottom, off at the top
    const lift = this.M[2];
    await this.go(0, -20.6, 0.4, 5, 'beside the lift');
    await this.until(() => lift.cur.y < 13.0 && lift.wait > 0.5, 15, 'the lift');
    await this.go(0, -23.5, 0.3, 3, 'onto the lift');
    await this.until(() => lift.cur.y > 27.85, 10, 'the top');
    await this.go(0, -27.4, 0.4, 3, 'off the lift');
    lap('lift');
    // the spiral, isle to isle, and the pad on the last one up to the summit
    for (const [k, [x, y, z]] of SPIRAL.entries()) await this.hop(x, y, z, `spiral ${k + 1}`);
    const last = SPIRAL[SPIRAL.length - 1];
    await this.go(last[0], last[2], 0.25, 4, 'the summit pad');
    await this.until(() => !this.grounded && this.E.player.vel.y > 5, 2, 'the summit pad');
    await this.fly(SUM[0] + 3.5, SUM[1], SUM[2] + 0.5, 'the summit');
    lap('summit');
  }
}

const SEEDS = {
  climb: { flags: {}, inv: {} },
  race: { flags: { 'hunt.started': true, 's2.started': true }, inv: { 'echo-11': 1, 'echo-12': 1, 'echo-13': 1 }, picks: [0] },
  lose: { flags: { 'hunt.started': true, 's2.started': true }, inv: { 'echo-11': 1, 'echo-12': 1, 'echo-13': 1 }, picks: [0] },
};
const SCENARIOS = {
  // the whole climb from the arrival, on the clock, to the summit: the sigil and the glider are there, and the time
  // goes on the boards
  climb: async (b) => {
    await b.go(START[0], START[1], 0.3, 10, 'the stranger\'s spot');
    if (GHOST) b.trace = [];
    await b.climb();
    const rec = b.E.sim.claims.find((c) => c[1] === 'record' && c[2] === 'summit');
    if (!rec) throw new Error('no summit record');
    if (GHOST) {
      await b.go(SUM[0] - 1.6, SUM[2] + 3.4, 0.3, 5, 'to where the stranger waits');
      writeFileSync(GHOST, JSON.stringify(b.trace)); b.trace = null;
    }
    b.note = `summit in ${rec[3].toFixed(2)} s`;
  },
  // Season 2: the stranger waits on the landing island; race them, and win: Echo XIV at the top
  race: async (b) => {
    const R = b.R;
    if (!R || !R.stranger.avatar.root.visible) throw new Error('no stranger on the landing island');
    await b.go(START[0] - 1.4, START[1] - 0.6, 0.5, 10, 'the stranger');
    await b.use();
    await b.until(() => R.state.on && b.now >= R.state.t0, 6, 'the start');
    await b.climb();
    const margin = (R.state.arrive - b.now) / 60;
    if (!b.store('raceWon', false)) throw new Error('the race was not won');
    await b.until(() => R.echo.shown, 4, 'Echo XIV to appear');
    await b.go(R.ECHO14[0], R.ECHO14[2], 0.4, 8, 'Echo XIV');
    await b.until(() => b.E.profile.data.inv['echo-14'], 3, 'Echo XIV');
    b.note = `won with ${margin.toFixed(1)} s to spare`;
  },
  // a race lost: stand about, and the stranger reaches the top first; then a rematch is on offer up there
  lose: async (b) => {
    const R = b.R;
    await b.go(START[0] - 1.4, START[1] - 0.6, 0.5, 10, 'the stranger');
    await b.use();
    await b.until(() => R.state.lost, 400, 'the stranger to win');
    if (b.store('raceWon', false)) throw new Error('won without running');
    for (let k = 0; k < 60; k++) await b.tick(0, 127, 0);
  },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const sd = SEEDS[name] || {}, picks = (sd.picks || []).slice();
  const entry = { coins: 0, inv: Object.assign({}, sd.inv), eq: Object.assign({}, EQ0), flags: Object.assign({}, sd.flags), save: null };
  const spec = { registry, world: WORLD, from: 'hub', entry };
  const ui = { dialog: async () => {}, choice: async (who, q, opts) => { const k = picks.length ? picks.shift() : 0; if (VERBOSE) console.log(`    ${who}: ${q} -> ${opts[k]}`); return k; } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E);
  (E.world.handlers.respawn || (E.world.handlers.respawn = [])).push(() => { b.deaths++; });
  let err = null;
  try { await b.idle(20); await plan(b); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'skyreach-bot', world: WORLD, registry, from: spec.from, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'skyreach bot' } };
  writeFileSync(join(OUT, `skyreach-${name}.json`), JSON.stringify(proof));
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t}, ${(b.t / 60).toFixed(1)} s)${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}${b.deaths ? `; ${b.deaths} respawn(s)` : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL ROUTES OK');
process.exitCode = bad ? 1 : 0;
