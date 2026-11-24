// Underfoot (src/worlds/underfoot.js), played headlessly by a scripted bot on the real physics: meeting Crumb, each of
// the ten marbles (under the bed past the dust bunnies, the blanket's slope and the bed past the cat, the pillow, the
// nightstand, the desk's book stairs to the sill, the slinky and the whoopee cushion, the drawer, the pencil cup, the
// paper plane and the vent's warm air to the wardrobe's top and the bookshelf's, the train, the toy box and its
// jack-in-the-box), the cat batting a careless player off the bed, Crumb's thimble, and the floor-is-lava run from the
// door to the window sill. Each scenario is one visit from a seeded state; its proof is written out and must verify.
// usage: node tools/underfoot_bot.mjs [--only lava,high,...] [--out DIR] [--docs DIR] [-v]
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
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/underfoot')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'underfoot');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

class Bot {
  constructor(E) { this.E = E; this.U = E.world.group.userData.underfoot; this.t = 0; }
  get p() { return this.E.player.pos; }
  get grounded() { return this.E.player.grounded; }
  get feet() { return this.p.y - 0.93; }
  flag(k) { return this.E.profile.data.flags[k]; }
  store(k, d) { const ws = this.E.profile.data.worlds.underfoot; const v = ws && ws.store ? ws.store[k] : undefined; return v === undefined ? d : v; }
  marbles() { return this.store('marbles', []); }
  async tick(qx = 0, qy = 0, bits = 0) {
    if (this.E.sim.ended) throw new Error('the visit already ended');
    this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++;
    if (this.watch) this.watch();
    await yieldNow();
  }
  stick(x, z, slow = 1.0) {
    const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz);
    if (d < 0.03) return [0, 0];
    const k = Math.min(1, d / slow);
    return [Math.round((dx / d) * 127 * k), Math.round((-dz / d) * 127 * k)];
  }
  // walk to (x, z), to within r metres; fails if it ends up well below where it started (a fall)
  async go(x, z, r = 0.45, maxS = 40, what = '') {
    const y0 = this.p.y;
    for (let i = 0; i < maxS * 60; i++) {
      if (Math.hypot(x - this.p.x, z - this.p.z) < r) return;
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (this.p.y < y0 - 3) throw new Error(`fell walking to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: at ${f2(this.p)}`);
    }
    throw new Error(`walk to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: stuck at ${f2(this.p)}`);
  }
  // jump toward a platform whose top is at y, landing near (x, z): run at it and jump from the edge (or once within
  // reach); a jump from the middle of a toy falls short
  async hop(x, y, z, label = '', tol = 0.4, reach = 3.0) {
    let jt = -1, px = this.p.x, pz = this.p.z, still = 0;
    for (let i = 0; i < 400; i++) {
      const d = Math.hypot(x - this.p.x, z - this.p.z);
      still = Math.hypot(this.p.x - px, this.p.z - pz) < 0.02 ? still + 1 : 0; px = this.p.x; pz = this.p.z;
      let bits = 0;
      if (jt < 0) { if (d <= reach || !this.grounded || still > 5) { bits = 3; jt = i; } } // (at the edge, in reach, or stuck at a step)
      else bits = i - jt < 18 ? 2 : 0;
      const [qx, qy] = this.stick(x, z, jt < 0 ? 0.01 : 0.3);
      await this.tick(qx, qy, bits);
      if (jt >= 0 && i - jt > 5 && this.grounded) {
        if (Math.abs(this.feet - y) < tol) { await this.go(x, z, 0.4, 4, label); return; }
        throw new Error(`hop ${label} to (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}): landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`hop ${label}: never landed (${f2(this.p)})`);
  }
  // after a launch (a spring): steer for (x, z) until down, and expect to be at height y
  async fly(x, z, y, label = '', glide = false, letGo = null) {
    for (let i = 0; i < 900; i++) {
      const [qx, qy] = this.stick(x, z, 0.5);
      const hold = glide && !(letGo && letGo());
      await this.tick(qx, qy, hold ? 2 : 0);
      if (i > 10 && this.grounded) {
        if (Math.abs(this.feet - y) < 0.5) return;
        throw new Error(`${label}: came down at ${f2(this.p)}, not at ${y}`);
      }
    }
    throw new Error(`${label}: never came down (${f2(this.p)})`);
  }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async settle(maxS = 60) { let calm = 0; for (let i = 0; i < maxS * 60 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  car(m) { const q = m.body.translation(); return [q.x, q.y, q.z]; }
  // ---- routes (the floor's open lanes: round the start of the lava trail by the door, south of the rug's train,
  // and down the west side past the blanket's slope) ----
  async path(pts, what) { for (const [x, z] of pts) await this.go(x, z, 0.8, 30, what); }
  async fromDoor() { await this.path([[37, 67], [26, 68.5], [18, 62], [14, 52]], 'round the trail by the door'); }
  async toWestSide() { await this.fromDoor(); await this.path([[-10, 52], [-20, 20], [-9, -20]], 'down the west side'); }
  async talkCrumb() { await this.fromDoor(); await this.path([[-10, 52], [-52, 33]], 'to Crumb'); await this.go(-54.2, 33, 0.3, 5, 'Crumb'); await this.use(); }
  // up the blanket's slope to just below the bed (the cat does not count you until you are on it)
  async blanketUp() {
    await this.toWestSide();
    await this.path([[-9, -36], [-16, -36]], 'the blanket\'s foot');
    await this.go(-30, -36, 0.5, 20, 'up the blanket');
  }
  // across the bed to the pillow, when the cat has just gone to sleep
  async crossBed() {
    const S = this.U.catS;
    await this.until(() => this.U.catS.awake, 14, 'the cat to wake');
    await this.until(() => !this.U.catS.awake, 14, 'the cat to sleep');
    await this.go(-36, -32, 0.6, 10, 'onto the bed');
    await this.go(-37, -60.5, 0.6, 10, 'along the bed');
    if (S.swats) throw new Error('the cat batted me');
    await this.hop(-40, 16.6, -66, 'onto the pillow');
  }
  async pillowToDesk(marble = false) {
    await this.go(-35, -68, 0.5, 10, 'the pillow\'s end');
    await this.hop(-30.5, 18, -68, 'onto the nightstand');
    if (marble) { const M = this.U.MARBLE_AT.nightstand; await this.go(M[0] - 0.8, M[2] - 0.3, 0.4, 5, 'the nightstand marble'); await this.go(-30.5, -68, 0.4, 5, 'back'); }
    const N = this.U.NIGHT_BOOKS;
    await this.hop(-28, N[0][1], N[0][2], 'book 1');                      // (each on the part of the step the next book leaves free)
    await this.hop(-26, N[1][1], N[1][2], 'book 2');
    await this.hop(N[2][0], N[2][1], N[2][2], 'book 3');
    await this.hop(-16.5, 22.5, -67, 'onto the desk');
  }
  async deskToSill() {
    const K = this.U.DESK_BOOKS;
    await this.hop(-12.5, K[0][1], -63.2, 'desk book 1');                 // (the strips the next book leaves free)
    await this.hop(-11, K[1][1], -65.5, 'desk book 2');
    await this.hop(K[2][0], K[2][1], -68.5, 'desk book 3');
    await this.go(-11, -72.6, 0.5, 5, 'onto the sill');
  }
  async toSeat() {
    const S = this.U.SLINKY;
    await this.go(S[0] + 3.5, S[2], 0.6, 60, 'by the slinky');
    await this.go(S[0], S[2], 0.6, 5, 'onto the slinky');
    await this.fly(2, -42, 13.5, 'the slinky');
  }
  async seatToDesk() {
    const C = this.U.CUSHION;
    await this.go(C[0], C[2] + 4, 0.5, 5, 'behind the cushion');
    for (let i = 0; i < 240 && this.feet < 15; i++) { const [qx, qy] = this.stick(C[0], -58); await this.tick(qx, qy, 0); }
    await this.fly(C[0], -58, 22.5, 'the whoopee cushion');
  }
  async toVentTop() {
    const V = this.U.VENT;
    await this.go(V[0] - 6, V[1], 0.8, 60, 'by the vent');
    for (let i = 0; i < 20 * 60; i++) {
      const [qx, qy] = this.stick(V[0], V[1], 0.5); await this.tick(qx, qy, 2);
      if (this.p.y > 66) return;
    }
    throw new Error(`the warm air did not lift me (${f2(this.p)})`);
  }
  // ride a car of the train: wait at a drum's inner edge for one to come close, jump on, ride; off at another drum
  async toInnerEdge(dr) {
    const R = this.U.RUG, dx = R[0] - dr.x, dz = R[1] - dr.z, l = Math.hypot(dx, dz);
    await this.go(dr.x + (dx / l) * 1.45, dr.z + (dz / l) * 1.45, 0.2, 5, 'the drum\'s inner edge');
  }
  async board(car, top, what) {
    let last = 1e9;
    await this.until(() => { const q = this.car(car), d = Math.hypot(q[0] - this.p.x, q[2] - this.p.z), ok = d < 4.4 && d < last; last = d; return ok; }, 30, `the ${what} to come by`);
    for (let i = 0; i < 200; i++) {
      const q = this.car(car);
      const [qx, qy] = this.stick(q[0], q[2], 0.2);
      await this.tick(qx, qy, i === 0 ? 3 : i < 18 ? 2 : 0);
      if (i > 5 && this.grounded) {
        if (Math.abs(this.feet - top) < 0.45) return;
        throw new Error(`jumping on the ${what}: landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`jumping on the ${what}: never landed`);
  }
  // ride at the car's outer edge until the drum dr is close, then jump onto it
  async rideTo(car, dr) {
    const R = this.U.RUG;
    for (let i = 0; i < 40 * 60; i++) {
      const q = this.car(car), ox = q[0] - R[0], oz = q[2] - R[1], ol = Math.hypot(ox, oz);
      if (Math.hypot(dr.x - this.p.x, dr.z - this.p.z) < 4.2) return this.hop(dr.x, dr.top, dr.z, 'off the train onto the drum', 0.4, 9);
      const [qx, qy] = this.stick(q[0] + (ox / ol) * 1.1, q[2] + (oz / ol) * 1.1, 1.5); await this.tick(qx, qy, 0);
      if (this.feet < 0.5) throw new Error(`fell off the train at ${f2(this.p)}`);
    }
    throw new Error('rode too long');
  }
}

const ALL = ['bed', 'pillow', 'nightstand', 'cup', 'drawer', 'sill', 'wardrobe', 'shelf', 'train', 'toybox'];
const MET = { 'uf.met': true };
const SEEDS = {
  crumb: {},
  bed: { flags: MET },
  bedroom: { flags: MET },
  desk: { flags: MET },
  high: { flags: Object.assign({}, MET, { 'uf.plane': true }) },
  train: { flags: MET },
  toybox: { flags: MET },
  cat: { flags: MET },
  thimble: { flags: MET, store: { marbles: ALL } },
  lava: { flags: MET },
};
const SCENARIOS = {
  crumb: async (b) => { await b.talkCrumb(); if (!b.flag('uf.met')) throw new Error('did not meet Crumb'); },
  bed: async (b) => {
    const M = b.U.MARBLE_AT.bed;
    await b.toWestSide(); await b.path([[-9, -45], [-30, -50]], 'beside the bed');
    await b.go(M[0] + 2, M[2], 0.6, 20, 'under the bed');
    await b.go(M[0], M[2], 0.6, 10, 'the marble');
    if (!b.marbles().includes('bed')) throw new Error('no marble under the bed');
    b.note = `hearts ${b.E.player.hearts}`;
  },
  bedroom: async (b) => {
    await b.blanketUp(); await b.crossBed();
    const M = b.U.MARBLE_AT;
    await b.go(M.pillow[0], M.pillow[2], 0.6, 10, 'the pillow marble');
    await b.pillowToDesk(true);
    await b.deskToSill();
    await b.go(M.sill[0], M.sill[2], 0.6, 10, 'the sill marble');
    const m = b.marbles();
    for (const k of ['pillow', 'nightstand', 'sill']) if (!m.includes(k)) throw new Error(`no ${k} marble (${m})`);
    b.note = `marbles ${m.join(',')}; swats ${b.U.catS.swats}`;
  },
  desk: async (b) => {
    await b.toSeat();
    const D0 = b.U.MARBLE_AT.drawer, PB = b.U.PENCIL_BOX;
    await b.go(5, -47, 0.5, 5, 'the seat\'s corner');
    await b.hop(11, 12.5, -52.5, 'into the drawer');
    await b.go(D0[0], D0[2], 0.6, 5, 'the drawer marble');
    await b.hop(PB[0], PB[1], PB[2], 'onto the pencil box');
    await b.hop(4.5, 13.5, -46.5, 'back onto the seat');
    await b.seatToDesk();
    const S = b.U.CUP_STEP, E2 = b.U.ERASER, M = b.U.MARBLE_AT.cup;
    await b.go(S[0] - 2.5, S[2], 0.5, 10, 'by the step book');
    await b.hop(S[0], S[1], S[2], 'onto the step book');
    await b.hop(M[0] - 0.1, 22.8, M[2], 'into the pencil cup', 0.7);     // (the floor, or the eraser beside it)
    await b.go(M[0], M[2], 0.5, 3, 'the cup marble');
    await b.hop(E2[0], E2[1], E2[2], 'onto the eraser');
    await b.hop(9.5, 22.5, -63, 'out of the cup');
    await b.go(b.U.PAPER[0] + 2.5, b.U.PAPER[2], 0.6, 10, 'the paper'); await b.use();
    if (!b.flag('uf.plane')) throw new Error('no paper plane');
    const m = b.marbles();
    for (const k of ['drawer', 'cup']) if (!m.includes(k)) throw new Error(`no ${k} marble (${m})`);
    b.note = `marbles ${m.join(',')}`;
  },
  high: async (b) => {
    await b.toVentTop();
    // over the wardrobe, and let go
    await b.fly(51, 8, 60, 'onto the wardrobe', true, () => b.p.x > 45);
    const M = b.U.MARBLE_AT;
    await b.go(M.wardrobe[0], M.wardrobe[2], 0.6, 10, 'the wardrobe marble');
    // off its north edge, gliding to the bookshelf's top
    await b.go(55.5, -8.5, 0.5, 10, 'the wardrobe\'s north edge');
    for (let i = 0; i < 8; i++) { const [qx, qy] = b.stick(55.5, -45); await b.tick(qx, qy, i === 0 ? 3 : 2); }
    await b.fly(55.5, -44, 52, 'onto the bookshelf', true, () => b.p.z < -33);
    await b.go(M.shelf[0], M.shelf[2], 0.6, 10, 'the shelf marble');
    const m = b.marbles();
    for (const k of ['wardrobe', 'shelf']) if (!m.includes(k)) throw new Error(`no ${k} marble (${m})`);
  },
  train: async (b) => {
    const T = b.U.TRAIL1, dr = T[T.length - 1], tr = b.U.train;
    await b.fromDoor(); await b.go(16, 45, 0.6, 20, 'by the drum');
    await b.hop(dr.x, dr.top, dr.z, 'onto the drum');
    await b.toInnerEdge(dr);
    await b.board(tr.loco, 3.2, 'engine');
    await b.until(() => b.marbles().includes('train'), 3, 'the train marble');
    b.note = `marbles ${b.marbles().join(',')}`;
  },
  toybox: async (b) => {
    const BL = b.U.BLOCKS;
    await b.fromDoor(); await b.go(BL[0][0] + 3.5, BL[0][2], 0.6, 30, 'the blocks');
    for (const [i, q] of BL.entries()) await b.hop(q[0], q[1], q[2], `block ${i + 1}`);
    await b.hop(-26.4, 12, 67, 'the toy box\'s rim');
    const M = b.U.MARBLE_AT.toybox;
    await b.hop(M[0] + 1, 0.6, M[2], 'down into the toy box');
    await b.go(M[0], M[2], 0.6, 5, 'the marble');
    if (!b.marbles().includes('toybox')) throw new Error('no toy box marble');
    const J = b.U.JACK;
    await b.go(J[0] - 3, J[2], 0.5, 10, 'by the jack-in-the-box');
    for (let i = 0; i < 240; i++) { const [qx, qy] = b.stick(J[0], J[2]); await b.tick(qx, qy, 0); if (b.feet > 4) break; }
    for (let i = 0; i < 600; i++) { const [qx, qy] = b.stick(-12, 64); await b.tick(qx, qy, 0); if (i > 10 && b.grounded) break; }
    if (b.p.x < -26) throw new Error(`still in the toy box: ${f2(b.p)}`);
    b.note = `sprung out to ${f2(b.p)}`;
  },
  cat: async (b) => {
    await b.blanketUp();
    await b.go(-36, -32, 0.6, 10, 'onto the bed, in plain sight');
    await b.until(() => b.U.catS.swats > 0, 15, 'the cat to see me');
    await b.until(() => b.grounded && b.feet < 0.5, 5, 'landing on the floor');
    b.note = `batted off; landed at ${f2(b.p)}`;
  },
  thimble: async (b) => {
    await b.talkCrumb();
    if (!b.flag('uf.marbles') || !b.E.profile.data.inv['uf-thimble']) throw new Error('no thimble');
  },
  lava: async (b) => {
    const U = b.U, T1 = U.TRAIL1, T2 = U.TRAIL2;
    await b.hop(T1[0].x, T1[0].top, T1[0].z, 'onto the slipper');
    await b.use();
    await b.until(() => U.L.on, 5, 'the countdown');
    for (const q of T1.slice(1)) await b.hop(q.x, q.top, q.z, q.kind);
    await b.toInnerEdge(T1[T1.length - 1]);
    await b.board(U.train.cars[0], 1.5, 'blue car');
    await b.rideTo(U.train.cars[0], T2[0]);
    for (const q of T2.slice(1, 3)) await b.hop(q.x, q.top, q.z, q.kind);
    await b.go(U.BOX_B[0], U.BOX_B[1], 0.5, 20, 'along the meter stick');
    await b.hop(-18.5, 15.4 * 3.5 / 18, -31, 'onto the blanket', 1.5);  // (a slope: its height depends where you land)
    await b.go(-30, -32, 0.5, 20, 'up the blanket');
    await b.crossBed();
    await b.pillowToDesk();
    await b.deskToSill();
    await b.settle();
    if (!U.L.runs || U.L.on) throw new Error('the run did not finish');
    const t = b.store('lavaBest', null);
    if (t == null) throw new Error('no time');
    b.note = `floor is lava ${(+t).toFixed(2)} s; title ${b.flag('title.uf.lava')}`;
  },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const seed = SEEDS[name] || {}, picks = (seed.picks || []).slice();
  const entry = { coins: 0, inv: Object.assign({}, seed.inv), eq: Object.assign({}, EQ0, seed.eq || {}), flags: Object.assign({}, seed.flags), save: seed.store ? { coins: {}, store: seed.store, visits: 1 } : null };
  const spec = { registry, world: WORLD, from: seed.from || 'hub', arrival: seed.arrival, entry };
  const ui = { dialog: async () => {}, choice: async (who, q, opts) => { const k = picks.length ? picks.shift() : 0; if (VERBOSE) console.log(`    ${who}: ${q} -> ${opts[k]}`); return k; } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E);
  let err = null;
  try { await plan(b); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'underfoot-bot', world: WORLD, registry, from: spec.from, ...(spec.arrival ? { arrival: spec.arrival } : {}), entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'underfoot bot' } };
  writeFileSync(join(OUT, `underfoot-${name}.json`), JSON.stringify(proof));
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t}, ${(b.t / 60).toFixed(1)} s)${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL ROUTES OK');
process.exitCode = bad ? 1 : 0;
