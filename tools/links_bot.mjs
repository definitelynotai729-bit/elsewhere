// Lost Links (src/worlds/links.js), played headlessly by a scripted golfer on the real engine: Ottie's welcome, a full
// round of nine with every putt planned on the world's own ball physics (the jump over the ravine included), and the
// side routes: the plank bridge, a ball the river takes, the geyser's throw, Spike's swat, the golden egg, picking up
// after six, and stopping a round. Each scenario is one visit from a seeded state; its proof must verify like any run.
// usage: node tools/links_bot.mjs [--only round,...] [--out DIR] [--docs DIR] [-v]
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
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/links')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'links');
let nonce = 0, S = null;
const loadModule = async (r) => {
  const m = (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
  if (r.id === 'links') S = m.sim; // the same module the world runs: its HOLES are the world's
  return m;
};
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const D = Math.PI / 180;
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

// ---------- the planner: putts tried on the world's own physics ----------
function simShot(H, ball, aimLocal, n, t0, watch) {
  const b = Object.assign({}, ball), v = S.speedOf(S.powerOf(n)), a = aimLocal * D;
  b.vx = Math.sin(a) * v; b.vz = Math.cos(a) * v; b.air = false; b.lip = false;
  let st = 0, gold = 0, launch = 0, maxY = b.y;
  for (let t = t0; t < t0 + 25 * 60; t++) {
    const r = S.tickBall(H, b, t);
    if (b.egg && H.eggs[b.egg - 1][3]) gold++;
    if (b.launch) launch++;
    if (b.y > maxY) maxY = b.y;
    if (r === S.HOLED) return { r: 'holed', b, t, gold, launch, maxY };
    if (r === S.LOST) return { r: 'lost', b, t, gold, launch, maxY };
    if (r === S.STOPPED) { if (++st >= 20) return { r: 'stop', b, t, gold, launch, maxY }; } else st = 0;
    if (watch && watch(b)) return { r: 'watch', b, t, gold, launch, maxY };
  }
  return { r: 'stop', b, t: t0 + 25 * 60, gold, launch, maxY };
}
const periodOf = (H) => (H.neck ? H.neck.period : H.tail ? H.tail.period : H.geyser ? H.geyser.period : H.jaw ? H.jaw.period : 0);
// how far a ball has to roll to the cup, round walls, rocks and eggs (not as the crow flies): a grid, filled outward
// from the cup once per hole
const MAPS = new Map(), CELL = 0.2;
function distMap(H) {
  if (MAPS.has(H)) return MAPS.get(H);
  const [x0, z0, x1, z1] = H.box, nx = Math.ceil((x1 - x0) / CELL) + 1, nz = Math.ceil((z1 - z0) / CELL) + 1;
  const ok = new Uint8Array(nx * nz), dist = new Float64Array(nx * nz).fill(Infinity), R = S.R;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const x = x0 + i * CELL, z = z0 + k * CELL;
    if (!S.ground(H, x, z)) continue;
    let free = true;
    for (const w of H.walls) { const dx = w.x1 - w.x0, dz = w.z1 - w.z0, l2 = dx * dx + dz * dz; let t = l2 ? ((x - w.x0) * dx + (z - w.z0) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t)); if (Math.hypot(x - w.x0 - dx * t, z - w.z0 - dz * t) < R + w.wr) { free = false; break; } }
    for (const r of H.rocks.concat(H.eggs)) if (free && Math.hypot(x - r[0], z - r[1]) < R + r[2]) free = false;
    if (free) ok[i * nz + k] = 1;
  }
  const ci = Math.round((H.cup[0] - x0) / CELL), ck = Math.round((H.cup[1] - z0) / CELL), q = [[0, ci, ck]];
  dist[ci * nz + ck] = 0;
  while (q.length) { // (Dijkstra with a plain sorted queue: the grids are small)
    q.sort((a, b) => b[0] - a[0]);
    const [d, i, k] = q.pop();
    if (d > dist[i * nz + k]) continue;
    for (const [di, dk, c] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]]) {
      const a = i + di, b = k + dk; if (a < 0 || b < 0 || a >= nx || b >= nz || !ok[a * nz + b]) continue;
      const nd = d + c * CELL; if (nd < dist[a * nz + b]) { dist[a * nz + b] = nd; q.push([nd, a, b]); }
    }
  }
  const m = { at: (x, z) => { const i = Math.round((x - x0) / CELL), k = Math.round((z - z0) / CELL); if (i < 0 || k < 0 || i >= nx || k >= nz) return 99; let best = dist[i * nz + k];
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = k + dk; if (a >= 0 && b >= 0 && a < nx && b < nz) best = Math.min(best, dist[a * nz + b] + CELL); }
    return Number.isFinite(best) ? best : 99; } };
  MAPS.set(H, m);
  return m;
}
// how many more strokes a finished putt leaves, roughly (a planner's guess, not the game's)
function cost(H, res) {
  if (res.r === 'holed') return 0;
  if (res.r === 'lost') return 2.7;
  const d = distMap(H).at(res.b.x, res.b.z);
  let c = 1 + Math.min(1.3, 0.04 + 0.13 * d); // (smooth: every metre the ball gets nearer, by the way it must roll, counts)
  if (H.zones.some((zn) => zn.kind === 'tar' && res.b.x >= zn.r[0] && res.b.x <= zn.r[2] && res.b.z >= zn.r[1] && res.b.z <= zn.r[3])) c += 0.4;
  return c;
}
// the best putt from where the ball is: a coarse search, then a finer one round the best few
function plan(H, ball, now, o = {}) {
  const score = o.score || ((res) => cost(H, res));
  const direct = Math.atan2(H.cup[0] - ball.x, H.cup[1] - ball.z) / D, per = periodOf(H);
  const center = o.aimAt != null ? o.aimAt : direct;
  const aims = (o.aims || [0, -2, 2, -5, 5, -10, 10, -18, 18, -30, 30, -45, 45]).map((k) => center + k);
  const pulls = o.pulls || Array.from({ length: 20 }, (_, k) => 4 + k * 4);
  const phases = per ? Array.from({ length: 8 }, (_, k) => Math.round((k * per) / 8)) : [0];
  const t0Of = (n, ph) => { let t0 = now + 90 + n; if (per) t0 += (((ph - t0) % per) + per) % per; return t0; };
  const cand = [];
  for (const a of aims) for (const n of pulls) for (const ph of phases) { const res = simShot(H, ball, a, n, t0Of(n, ph), o.watch); cand.push({ a, n, ph, c: score(res), res }); }
  cand.sort((x, y) => x.c - y.c || x.n - y.n);
  let best = cand[0];
  for (const c0 of cand.slice(0, 4)) {
    for (let da = -1.5; da <= 1.51; da += 0.5) for (let dn = -3; dn <= 3; dn++) for (const dp of per ? [-4, -2, 0, 2, 4] : [0]) {
      const a = c0.a + da, n = c0.n + dn, ph = per ? (((c0.ph + dp) % per) + per) % per : 0;
      if (n < 1 || n > 80) continue;
      const res = simShot(H, ball, a, n, t0Of(n, ph), o.watch), c = score(res);
      if (c < best.c - 1e-9 || (Math.abs(c - best.c) < 1e-9 && n < best.n)) best = { a, n, ph, c, res };
    }
  }
  return best;
}

class Bot {
  constructor(E) { this.E = E; this.U = E.world.group.userData.links; this.t = 0; this.log = []; }
  get P() { return this.U.P; }
  get p() { return this.E.player.pos; }
  get now() { return this.E.world.ticks; }
  flag(k) { return this.E.profile.data.flags[k]; }
  store(k, d) { const ws = this.E.profile.data.worlds.links; const v = ws && ws.store ? ws.store[k] : undefined; return v === undefined ? d : v; }
  async tick(qx = 0, qy = 0, bits = 0) {
    if (this.E.sim.ended) throw new Error('the visit already ended');
    this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++;
    await yieldNow();
  }
  stick(x, z, slow = 1.0) {
    const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz);
    if (d < 0.03) return [0, 0];
    const k = Math.min(1, d / slow);
    return [Math.round((dx / d) * 127 * k), Math.round((-dz / d) * 127 * k)];
  }
  // walk to (x, z); round anything in the way by stepping sideways for a moment
  async go(x, z, r = 0.6, maxS = 60, what = '') {
    let last = null, stuck = 0, side = 1;
    for (let i = 0; i < maxS * 60; i++) {
      if (Math.hypot(x - this.p.x, z - this.p.z) < r) return;
      let [qx, qy] = this.stick(x, z);
      if (stuck > 12) { // sidestep: perpendicular to the way to go, for half a second
        for (let k = 0; k < 30; k++) await this.tick(Math.round(-qy * side), Math.round(qx * side), 0);
        stuck = 0; side = -side; continue;
      }
      await this.tick(qx, qy, 0);
      if (last && Math.hypot(this.p.x - last[0], this.p.z - last[1]) < 0.03) stuck++; else stuck = 0;
      last = [this.p.x, this.p.z];
    }
    throw new Error(`walk to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: stuck at ${f2(this.p)}`);
  }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(); }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what}`); }
  async use() { await this.until(() => this.E.sim.busy === 0, 30, 'quiet'); await this.tick(0, 0, 8); await this.tick(); }
  async settle() { await this.idle(2); await this.until(() => this.E.sim.busy === 0, 30, 'the dialog'); await this.idle(2); }
  async talkOttie() { const o = this.U.OTTIE_AT; await this.go(o[0], o[2] + 1.6, 1.0, 30, 'Ottie'); await this.use(); await this.settle(); }
  async via(pts) { for (const q of pts) await this.go(q[0], q[1], 1.2, 60, `waypoint (${q[0]}, ${q[1]})`); }
  async teeUp(i, way = []) {
    await this.via(way);
    const t = this.U.teeW(i);
    await this.go(t[0], t[2], 0.9, 60, `tee ${i + 1}`);
    await this.use(); await this.settle();
    await this.until(() => this.P.mode === 'address' && this.P.hole === i, 10, `standing to the ball on hole ${i + 1}`);
  }
  // turn the aim (world degrees) to exactly `target`, as a player holding the stick would
  async aimTo(target) {
    for (let i = 0; i < 1200; i++) {
      const d = target - this.P.aim;
      if (Math.abs(d) < 0.003) { await this.tick(); return; }
      if (this.P.mode !== 'address') return;
      const rate = this.P.turnT + 1 < 14 ? 0.3 : 1.1, want = Math.min(1, Math.sqrt(Math.abs(d) / rate));
      let q = Math.max(6, Math.round(want * 127));
      if (rate * (q / 127) * (q / 127) > Math.abs(d) + 1e-9 && q > 6) q--;
      await this.tick(d > 0 ? -q : q, 0, 0);
    }
    throw new Error(`could not aim at ${target.toFixed(2)} (at ${this.P.aim.toFixed(3)})`);
  }
  // one putt: plan it, aim, wait for the moment, pull back n ticks, let go; then watch the ball until it rests
  async stroke(o = {}) {
    const P = this.P, H = this.U.HOLES[P.hole];
    await this.until(() => P.mode === 'address', 20, 'the ball, to stand to');
    let pl = plan(H, P.ball, this.now, o);
    await this.aimTo(pl.a + H.yaw);
    if (P.mode !== 'address') return this.rest(); // knocked while aiming: watch it, then plan again
    // with the aim as it really is, and the clock as it really is, check the putt (and patch it if a fraction moved it)
    const per = periodOf(H), aim = P.aim - H.yaw, score = o.score || ((res) => cost(H, res));
    const t0For = (n, ph) => { let t0 = this.now + n + 3; if (per) t0 += (((ph - t0) % per) + per) % per; return t0; };
    let best = null;
    for (let dn = 0; dn <= 6; dn = dn <= 0 ? 1 - dn : -dn) for (const dp of per ? [0, 1, -1, 2, -2, 3, -3] : [0]) {
      const n = pl.n + dn, ph = per ? (((pl.ph + dp) % per) + per) % per : 0;
      if (n < 1 || n > 80) continue;
      const t0 = t0For(n, ph), res = simShot(H, P.ball, aim, n, t0, o.watch), c = score(res);
      if (!best || c < best.c - 1e-9) best = { n, t0, c, res };
      if (c <= pl.c + 1e-9) break;
    }
    if (VERBOSE) console.log(`    hole ${P.hole + 1} stroke ${P.strokes + 1}: aim ${aim.toFixed(2)} pull ${best.n} t0 ${best.t0} -> ${best.res.r} (${best.res.b.x.toFixed(2)}, ${best.res.b.z.toFixed(2)}) cost ${best.c.toFixed(2)} (planned ${pl.c.toFixed(2)})`);
    while (this.now < best.t0 - best.n - 2) await this.tick();
    if (P.mode !== 'address') return this.rest();
    for (let k = 0; k < best.n; k++) await this.tick(0, -127, 0);
    await this.tick(0, 0, 0); // let go
    if (P.mode !== 'roll') throw new Error(`the putt did not go (mode ${P.mode}, pull ${P.pull})`);
    this.expect = best.res;
    await this.rest();
    return best.res;
  }
  // walk to a point inside hole i's nest (local x, z) round its eggs: a shortest path over a few clear points
  async inNest(i, goal) {
    const H = this.U.HOLES[i], eggs = H.eggs, local = () => S.toLocal(H, this.p.x, this.p.z);
    const clear = (a, b) => eggs.every(([x, z, r]) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1e-9, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L)); return Math.hypot(a[0] + t * dx - x, a[1] + t * dz - z) > r + 0.6; });
    const pts = [local(), [0, 2], [0, 4.6], [3, 7.6], [-3, 7.6], [3.2, 11.3], [-3.2, 11.3], [0, 13.6], goal];
    const dist = pts.map(() => Infinity), prev = pts.map(() => -1), done = pts.map(() => false); dist[0] = 0;
    for (;;) { let u = -1; for (let k = 0; k < pts.length; k++) if (!done[k] && (u < 0 || dist[k] < dist[u])) u = k; if (u < 0 || dist[u] === Infinity) break; done[u] = true;
      for (let v = 0; v < pts.length; v++) if (!done[v] && clear(pts[u], pts[v])) { const d = dist[u] + Math.hypot(pts[v][0] - pts[u][0], pts[v][1] - pts[u][1]); if (d < dist[v]) { dist[v] = d; prev[v] = u; } } }
    const route = []; for (let k = pts.length - 1; k > 0; k = prev[k]) { if (k < 0) throw new Error('no way into the nest'); route.unshift(pts[k]); }
    for (const q of route) { const [x, z] = S.toWorld(H, q[0], q[1]); await this.go(x, z, 0.35, 20, 'in the nest'); }
  }
  async rest() { await this.until(() => this.P.mode !== 'roll', 40, 'the ball to stop'); }
  // a whole hole from its tee: putts until it is in (or picked up)
  async hole(i, opts = {}) {
    if (!(this.P.hole === i && this.P.mode === 'address')) await this.teeUp(i, opts.way || []);
    for (let k = 0; k < 14 && this.P.hole === i; k++) {
      if (this.P.mode === 'wait' || this.P.mode === 'done' || this.P.mode === 'roll') { await this.idle(1); k--; continue; }
      await this.stroke(opts.stroke ? opts.stroke(k) : {});
      await this.until(() => this.P.mode !== 'wait' && this.P.mode !== 'done', 6, 'the next shot');
    }
    if (this.P.hole === i) throw new Error(`hole ${i + 1} not finished`);
  }
}

// ways round what is in the way: the clubhouse counter, Pebble, the ravine, the mesa, River Run's raised lane (its tee
// is reached from behind, up the step)
const OUT_FRONT = [0, 56]; // (out in front of the arrival, past the clubhouse)
const WAYS = {
  0: [OUT_FRONT], 2: [OUT_FRONT, [-20, 46], [-24, 26]], 3: [OUT_FRONT], 4: [OUT_FRONT, [-30, 0]], 5: [OUT_FRONT, [-5, 30], [-22.5, -17], [-22.5, -24]],
  6: [OUT_FRONT, [5, 30], [5, 0], [-0.6, -26], [-0.8, -30]], 8: [OUT_FRONT, [16, 26], [16, 10]],
};
const NEXT = { 6: (b) => (b.p.y < 1.5 ? [[b.p.x, -20], [-3, -20], [-2.5, -30.5], [-0.8, -30]] : [[-3, b.p.z], [-2.5, -30.5], [-0.8, -30]]) };

// the state a scenario starts from
const MET = { 'll.met': true };
const SEEDS = {
  welcome: { from: 'hub', flags: {}, picks: [0] },
  round: { flags: MET, picks: [0] },
  bridge: { flags: MET, picks: [] },
  river: { flags: MET, picks: [] },
  geyser: { flags: MET, picks: [] },
  swat: { flags: MET, picks: [] },
  egg: { flags: MET, picks: [] },
  pickup: { flags: MET, picks: [] },
  quit: { flags: MET, picks: [0, 2, 0] },
  echo11: { flags: Object.assign({ 'hunt.started': true, 's2.started': true }, MET), picks: [] },
};
const holeOf = (b, i) => b.U.HOLES[i];
const SCENARIOS = {
  // a first visit: Ottie's welcome, then the first hole of a round
  welcome: async (b) => {
    await b.via([OUT_FRONT]);
    await b.talkOttie();
    if (!b.flag('ll.met')) throw new Error('Ottie did not say hello');
    await b.hole(0, { way: [] });
    if (!b.P.round || b.P.card.length !== 1) throw new Error(`no round under way (card ${JSON.stringify(b.P.card)})`);
    b.note = `hole 1 in ${b.P.card[0]}`;
  },
  // all nine, as well as the planner can, then the card and the prizes
  round: async (b) => {
    for (let i = 0; i < 9; i++) await b.hole(i, { way: i === 0 ? WAYS[0] : NEXT[i] ? NEXT[i](b) : [] });
    await b.settle();
    const best = b.store('best', null);
    if (best == null) throw new Error('no round on the card');
    if (!b.E.profile.data.inv['ll-putter']) throw new Error('no Fossil Putter');
    if (best <= S.PAR && !b.E.profile.data.inv['ll-hood']) throw new Error('par or better, and no Stego Hood');
    const rec = b.E.sim.claims.find((c) => c[1] === 'record' && c[2] === 'strokes');
    if (!rec) throw new Error('the round set no record');
    b.note = `round of ${best} (par ${S.PAR}): ${JSON.stringify(b.store('holeBest', []))}; record ${rec[3]}`;
  },
  // the slow way over the ravine: the plank bridge, then the teeth
  bridge: async (b) => {
    const H = holeOf(b, 8);
    await b.teeUp(8, WAYS[8]);
    // first putt: down the plank bridge to the far side (never the ramp)
    const res = await b.stroke({ aimAt: Math.atan2(-3.5 - 0, 9 - 0) / D, aims: [-3, -2, -1, 0, 1, 2, 3], pulls: Array.from({ length: 28 }, (_, k) => 26 + k * 2),
      score: (r) => (r.r === 'lost' || r.b.z < 15 || r.maxY > 0.5 ? 9 : Math.hypot(r.b.x - H.cup[0], r.b.z - H.cup[1]) * 0.1) });
    if (!res || res.b.z < 15) throw new Error('the bridge putt did not cross');
    await b.hole(8);
    b.note = `the bridge, then ${b.store('holeBest', [])[8]} in all`;
  },
  // too soft across the stream: the river takes it, a stroke's penalty, then on
  river: async (b) => {
    await b.teeUp(6, WAYS[6]);
    const res = await b.stroke({ aims: [-4, 0, 4], pulls: Array.from({ length: 27 }, (_, k) => 36 + k), score: (r) => (r.r === 'lost' ? 0 : 9) });
    await b.until(() => b.P.mode === 'address', 6, 'the ball back on the tee');
    if (!res || res.r !== 'lost' || b.P.strokes !== 2) throw new Error(`the river did not take it (${res && res.r}, strokes ${b.P.strokes})`);
    if (Math.hypot(b.P.ball.x, b.P.ball.z) > 0.01) throw new Error('the ball did not go back to the tee');
    await b.hole(6);
    b.note = `lost one to the river; ${b.store('holeBest', [])[6]} in all`;
  },
  // leave the ball on the geyser's vent and wait: it throws it up onto the mesa
  geyser: async (b) => {
    const H = holeOf(b, 5), q = H.geyser;
    await b.teeUp(5, WAYS[5]);
    // a putt onto the vent: thrown as it crosses, or as it sits there (never the ramp)
    await b.stroke({ aimAt: 0, aims: [-2, -1, 0, 1, 2], pulls: Array.from({ length: 31 }, (_, k) => 30 + k),
      score: (r) => { const d = Math.hypot(r.b.x - q.x, r.b.z - q.z); return r.r === 'holed' ? 1 : r.launch ? 0 : r.r === 'stop' && d < q.r * 0.8 ? 0.5 : 9; } });
    await b.until(() => b.P.throws > 0 || b.P.hole < 0, 6, 'the geyser to throw it');
    if (!b.P.throws) throw new Error('the geyser never threw the ball');
    if (b.P.hole === 5) { await b.rest(); if (b.P.strokes !== 1) throw new Error(`the throw cost a stroke (${b.P.strokes})`); await b.hole(5); }
    b.note = `thrown onto the mesa; ${b.store('holeBest', [])[5]} in all`;
  },
  // rest the ball where Spike's tail sweeps: it gets swatted without a stroke
  swat: async (b) => {
    const H = holeOf(b, 2), t = H.tail;
    await b.teeUp(2, WAYS[2]);
    const sweep = (x, z) => { const dx = x - t.px, dz = z - t.pz, d = Math.hypot(dx, dz), a = Math.atan2(dz, dx); let da = Math.abs(((a - t.base + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); return d < t.len - 0.3 && d > 1.2 && da < t.amp - 0.05; };
    await b.stroke({ aims: [-6, -4, -2, 0, 2, 4, 6], aimAt: 0, pulls: Array.from({ length: 31 }, (_, k) => 30 + k),
      score: (r) => (r.r === 'stop' && sweep(r.b.x, r.b.z) && r.b.z < t.pz - 0.6 ? 0 : 9) });
    const s0 = b.P.strokes, x0 = b.P.ball.x, z0 = b.P.ball.z;
    await b.until(() => b.P.swats > 0, 8, 'the swat');
    await b.rest();
    if (b.P.strokes !== s0) throw new Error('the swat cost a stroke');
    await b.hole(2);
    b.note = `swatted from (${x0.toFixed(1)}, ${z0.toFixed(1)}); ${b.store('holeBest', [])[2]} in all`;
  },
  // three knocks on the golden egg and it hatches
  egg: async (b) => {
    await b.teeUp(3, WAYS[3]);
    for (let k = 0; k < 8 && !b.flag('ll.hatched') && b.P.hole === 3; k++) {
      await b.stroke({ score: (r) => (r.r === 'holed' ? 5 : r.r === 'lost' ? 9 : -r.gold) });
      await b.until(() => b.P.mode !== 'wait' && b.P.mode !== 'done', 6, 'the next shot');
    }
    if (!b.flag('ll.hatched')) throw new Error('the golden egg never hatched');
    b.note = `hatched after ${b.P.strokes} putt(s)`;
  },
  // six tiny taps on the tar hole: picked up, a 7
  pickup: async (b) => {
    await b.teeUp(4, WAYS[4]);
    for (let k = 0; k < 6; k++) { await b.stroke({ aims: [0], aimAt: 0, pulls: [4], score: () => 0 }); await b.until(() => b.P.mode !== 'roll', 6, 'rest'); }
    await b.until(() => b.P.hole < 0, 6, 'the pick-up');
    if (b.store('holeBest', [])[4] !== 7) throw new Error(`picked up, but the card says ${b.store('holeBest', [])[4]}`);
    b.note = 'six taps, a seven';
  },
  // Season 2 of the Founder's hunt: hatch Mabel's golden egg, and Echo XI is in the nest; step away from the ball and
  // walk in to it (between the eggs)
  echo11: async (b) => {
    await b.teeUp(3, WAYS[3]);
    for (let k = 0; k < 8 && !b.flag('ll.hatched') && b.P.hole === 3; k++) {
      await b.stroke({ score: (r) => (r.r === 'holed' ? 5 : r.r === 'lost' ? 9 : -r.gold) });
      await b.until(() => b.P.mode !== 'wait' && b.P.mode !== 'done', 6, 'the next shot');
    }
    if (!b.flag('ll.hatched')) throw new Error('the golden egg never hatched');
    await b.idle(200);
    if (b.P.mode === 'address') { await b.use(); await b.idle(2); }
    await b.inNest(3, [2.4, 12.9]);
    await b.until(() => b.E.profile.data.inv['echo-11'], 3, 'Echo XI');
    b.note = `hatched after ${b.P.strokes} putt(s), and Echo XI`;
  },
  // a round started, then given up at Ottie's
  quit: async (b) => {
    await b.teeUp(0, WAYS[0]);
    if (!b.P.round) throw new Error('no round');
    await b.use(); // step away from the ball
    if (b.P.mode !== 'free') throw new Error(`still standing to the ball (${b.P.mode})`);
    await b.talkOttie();
    if (b.P.round || b.P.hole >= 0) throw new Error('the round did not stop');
    b.note = 'round stopped at Ottie\'s';
  },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
const t00 = Date.now();
for (const [name, run] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const sd = SEEDS[name] || {}, picks = (sd.picks || []).slice();
  const entry = { coins: 0, inv: {}, eq: Object.assign({}, EQ0), flags: Object.assign({}, sd.flags), save: sd.store ? { coins: {}, store: sd.store, visits: 1 } : null };
  const spec = { registry, world: WORLD, from: sd.from || 'hub', entry };
  const ui = { dialog: async () => {}, choice: async (who, q, opts) => { const k = picks.length ? picks.shift() : 0; if (VERBOSE) console.log(`    ${who}: ${q} -> ${opts[k]}`); return k; } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E), t0 = Date.now();
  let err = null;
  try {
    await run(b);
    // walk on for a second: the world places you at every putt, so without this a visit's end can be the same on an
    // engine that walks differently, and tools/engine_test.mjs wants golden proofs to show that the pin matters
    await b.settle(); if (b.E.player.frozen) { await b.use(); await b.idle(2); }
    for (let k = 0; k < 60; k++) await b.tick(0, 127, 0);
  } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'links-bot', world: WORLD, registry, from: spec.from, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'links bot' } };
  writeFileSync(join(OUT, `links-${name}.json`), JSON.stringify(proof));
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t}, ${(b.t / 60).toFixed(1)} s)${b.note ? '; ' + b.note : ''}`); if (VERBOSE) console.log(err.stack); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play, ${((Date.now() - t0) / 1000).toFixed(1)} s to run${b.note ? '; ' + b.note : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : `ALL ROUTES OK (${((Date.now() - t00) / 1000).toFixed(1)} s)`);
process.exitCode = bad ? 1 : 0;
