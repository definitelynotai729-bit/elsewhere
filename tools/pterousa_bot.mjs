// The Last Summer of Bronze, chapter 2: The Low Wings (src/worlds/pterousa.js), played headlessly by a scripted bot on
// the real physics: the climb to Perdika (Low Stack, Cormorant's ledges, the Twins and the jump, the crosswind bridge,
// Kestrel's updraft and stair), the east nests (Old Wife, the Eye), the palace ship's masthead, the feather basket, the
// Balance, the test flight (through the Eye, up the bird chimney, down in the circle), the three compass choices (with
// the midnight steal past the Axe-Bearers), Glauke's loom-floor, Kyllo's sandal, Old Horn on Gull Pillar and the High
// Line. Each scenario is one visit from a seeded state; its proof is written out and must verify like any run.
// usage: node tools/pterousa_bot.mjs [--only climb,east,...] [--out DIR] [--docs DIR] [-v]
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
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/pterousa')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'lsb-pterousa');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

class Bot {
  constructor(E) { this.E = E; this.U = E.world.group.userData.pterousa; this.t = 0; }
  get p() { return this.E.player.pos; }
  get grounded() { return this.E.player.grounded; }
  flag(k) { return this.E.profile.data.flags[k]; }
  store(k, d) { const ws = this.E.profile.data.worlds['lsb-pterousa']; const v = ws && ws.store ? ws.store[k] : undefined; return v === undefined ? d : v; }
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
  // walk to (x, z), to within r metres; fails if it ends up well below where it started (a fall)
  async go(x, z, r = 0.45, maxS = 40, what = '') {
    const y0 = this.p.y;
    for (let i = 0; i < maxS * 60; i++) {
      if (Math.hypot(x - this.p.x, z - this.p.z) < r) return;
      if (this.stopIf && this.stopIf()) return;            // (e.g. caught and walked off the ship: the caller looks)
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (this.p.y < y0 - 3) throw new Error(`fell walking to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: at ${f2(this.p)}`);
    }
    throw new Error(`walk to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: stuck at ${f2(this.p)}`);
  }
  async path(pts, r = 0.5, what = '') { for (const q of pts) await this.go(q[0], q[2], r, 40, what); }
  // jump toward a platform whose top is at y, landing near (x, z)
  async hop(x, y, z, label = '') {
    for (let i = 0; i < 240; i++) {
      const [qx, qy] = this.stick(x, z, 0.3);
      await this.tick(qx, qy, i === 0 ? 3 : i < 18 ? 2 : 0);
      if (i > 5 && this.grounded) {
        if (Math.abs(this.p.y - 0.93 - y) < 0.4) { await this.go(x, z, 0.4, 4, label); return; }
        throw new Error(`hop ${label} to (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}): landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`hop ${label}: never landed (${f2(this.p)})`);
  }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(); }
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async settle(maxS = 60) { let calm = 0; for (let i = 0; i < maxS * 60 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn() || (this.stopIf && this.stopIf())) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  feathers() { return this.store('feathers', []); }
  // a crosswind bridge: wait at its start for a gust to end, then run across in the lull
  async cross(br, what) {
    await this.go(br.a[0], br.a[2], 0.4, 20, `the bridge to ${what}`);
    await this.until(() => this.U.P.gustOn, 10, 'a gust');
    await this.until(() => !this.U.P.gustOn, 10, 'the lull');
    for (let i = 0; ; i++) {
      if (Math.hypot(br.b[0] - this.p.x, br.b[2] - this.p.z) < 0.6) break;
      if (i > 600) throw new Error(`crossing to ${what}: never got there (${f2(this.p)})`);
      const [qx, qy] = this.stick(br.b[0], br.b[2]); await this.tick(qx, qy, 0);
      if (VERBOSE && i % 20 === 0) console.log(`      cross ${what} t+${i}: ${f2(this.p)} gust ${this.U.P.gustOn} grounded ${this.grounded}`);
      if (this.p.y < Math.min(br.a[1], br.b[1]) - 1.5) throw new Error(`fell crossing to ${what}: at ${f2(this.p)}, gust ${this.U.P.gustOn}`);
    }
  }
  // on the beach after the flight: Perdika's compass question (the seed's picks choose), and its aftermath
  async compass() {
    await this.talkTo(this.U.perdika, 'Perdika');
    await this.until(() => this.flag('lsb.compass'), 30, 'the compass choice');
    if (this.flag('lsb.compass') === 'left') await this.until(() => this.flag('lsb.p.compassDone'), 40, 'Perdika coming back');
  }
  // to Kessa at the pier, and away: the chapter's end
  async sail() {
    await this.talkTo(this.U.kessa, 'Kessa');
    await this.until(() => (this.flag('lsb.ch') || 0) >= 2, 20, 'sailing');
    await this.until(() => this.E.sim.ended, 40, 'the trip home');
  }
  posOf(npc) { const q = npc.pos; return q.x !== undefined ? [q.x, q.y, q.z] : q; }
  async talkTo(npc, what) {
    const q = this.posOf(npc);
    const pierNow = this.p.x > -33 && this.p.x < -27 && this.p.z < 57, pierThen = q[0] > -33 && q[0] < -26 && q[2] < 56;
    if (pierThen && !pierNow) await this.go(-30, 58, 0.8, 40, 'the pier\'s end');      // (people walk out along the pier)
    if (pierNow && !pierThen) await this.go(-30, 58, 0.8, 40, 'back along the pier');
    await this.go(pierThen ? -29.6 : q[0], pierThen ? q[2] : q[2], pierThen ? 0.6 : 2.0, 40, what);
    await this.use();
  }
  // the feather basket: from its bottom station up to Kestrel's deck (it must be running: met Perdika)
  async basketUp() {
    const B = this.U.BASKET_BOTTOM, T = this.U.BASKET_TOP;
    await this.go(B[0], B[2] + 3.5, 0.6, 40, 'the basket\'s station');
    await this.until(() => { const m = this.E.world.movers.find((q) => q.mesh === this.U.P.basket.mesh); return m && m.cur.distanceTo({ x: B[0], y: B[1], z: B[2] }) < 0.3 && m.wait > 0.5; }, 40, 'the basket at the bottom');
    await this.go(B[0], B[2], 0.5, 5, 'into the basket');
    await this.until(() => Math.hypot(this.p.x - T[0], this.p.z - T[2]) < 1.5 && this.p.y > T[1], 40, 'the top');
    await this.go(T[0] + 4, T[2] - 4, 0.8, 10, 'onto the deck');
  }
  // glide (holding Space) toward (x, z) until fn() says stop; aborts on landing
  async glideTo(x, z, fn, maxS = 30, what = '') {
    for (let i = 0; i < maxS * 60; i++) {
      if (fn()) return;
      const [qx, qy] = this.stick(x, z, 0.5); await this.tick(qx, qy, 2);
      if (VERBOSE && i % 30 === 0) console.log(`      glide ${what}: ${f2(this.p)} vy ${this.E.player.vel.y.toFixed(1)} hs ${Math.hypot(this.E.player.vel.x, this.E.player.vel.z).toFixed(1)} gliding ${this.E.player.gliding}`);
      if (this.grounded && i > 10) throw new Error(`landed gliding to ${what}: at ${f2(this.p)}`);
    }
    throw new Error(`glide to ${what}: never got there (${f2(this.p)})`);
  }
  // from Kestrel's deck: run out along the plank, jump off its end, and turn for (x, z) in the air
  async launch(x, z) {
    const U = this.U, K = U.S.kes, tip = U.PLANK_TIP;
    const ux = tip[0] - K[0], uz = tip[2] - K[1], ul = Math.hypot(ux, uz);
    await this.go(K[0] + (ux / ul) * 10, K[1] + (uz / ul) * 10, 0.5, 10, 'the plank');
    for (let i = 0; i < 200; i++) {
      const end = Math.hypot(this.p.x - K[0], this.p.z - K[1]) > K[2] + 6.4;
      const [qx, qy] = this.stick(tip[0] + ux, tip[2] + uz); await this.tick(qx, qy, end ? 3 : 0);
      if (!this.grounded && end) break;
    }
    for (let i = 0; i < 30; i++) { const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 2); }
  }
  // Gull Pillar's top, by its updraft: glide in, ride it up, slip across and let go over the top
  async toGullTop() {
    const G = this.U.S.gull, U0 = [G[0] - 6, G[1]];
    await this.launch(U0[0], U0[1]);
    await this.glideTo(U0[0], U0[1], () => Math.hypot(this.p.x - U0[0], this.p.z - U0[1]) < 1.5, 20, 'Gull Pillar\'s updraft');
    await this.glideTo(U0[0], U0[1], () => this.p.y > G[3] + 3, 20, 'up the updraft');
    for (let i = 0; i < 600; i++) {
      const d = Math.hypot(this.p.x - G[0], this.p.z - G[1]);
      const [qx, qy] = this.stick(G[0], G[1], 0.5); await this.tick(qx, qy, d < 2.0 ? 0 : 2);
      if (this.grounded) break;
    }
    if (Math.abs(this.p.y - 0.93 - G[3]) > 0.5) throw new Error(`not on Gull Pillar's top: ${f2(this.p)}`);
  }
  // the test flight from the deck: the plank, a jump, the Eye, the chimney, the circle
  async testFlight() {
    const U = this.U, K = U.S.kes, tip = U.PLANK_TIP, eye = U.EYE, ch = U.CHIMNEY, c = U.CIRCLE;
    const ux = tip[0] - K[0], uz = tip[2] - K[1], ul = Math.hypot(ux, uz);
    await this.go(K[0] + (ux / ul) * 10, K[1] + (uz / ul) * 10, 0.5, 10, 'the plank');
    for (let i = 0; i < 200; i++) { // run the plank and jump off its end
      const [qx, qy] = this.stick(eye[0], eye[2]);
      const end = Math.hypot(this.p.x - K[0], this.p.z - K[1]) > K[2] + 6.4;
      await this.tick(qx, qy, end ? 3 : 0);
      if (!this.grounded && end) break;
    }
    await this.glideTo(eye[0], eye[2], () => this.U.P.flight && this.U.P.flight.eye, 20, 'the Eye');
    await this.glideTo(ch[0], ch[1], () => Math.hypot(this.p.x - ch[0], this.p.z - ch[1]) < 4, 20, 'the bird chimney');
    let a = 0; // circle in the chimney until high enough
    await this.glideTo(ch[0], ch[1], () => { a += 0.03; return this.p.y > 44; }, 20, 'up the chimney');
    for (let i = 0; i < 40 * 60; i++) { // to the circle; let go of Space over it
      const d = Math.hypot(this.p.x - c[0], this.p.z - c[2]);
      const [qx, qy] = this.stick(c[0], c[2], 0.5);
      await this.tick(qx, qy, d < 2.5 ? 0 : 2);
      if (this.grounded) break;
    }
  }
  // from the beach up the west route to Kestrel's deck, collecting the nests on the way
  async climbWest(stop = '') {
    const R = this.U.route;
    await this.go(-62, 57, 0.6, 40, 'the spit');
    await this.path(R.lowStair, 0.7, 'Low Stack\'s stair');
    await this.go(R.lowBridge.a[0], R.lowBridge.a[2], 0.6, 20, 'the bridge to Cormorant');
    await this.go(R.lowBridge.b[0], R.lowBridge.b[2], 0.6, 20, 'across to Cormorant');
    await this.go(R.corm20[0], R.corm20[2], 0.5, 10, 'Cormorant\'s landing');
    await this.hop(R.cormNest[0], R.cormNest[1], R.cormNest[2], 'down to the nest');
    await this.hop(R.corm20[0], R.corm20[1], R.corm20[2], 'back up');
    for (const [i, q] of R.cormLedges.entries()) await this.hop(q[0], q[1], q[2], `Cormorant ledge ${i + 1}`);
    const C0 = this.U.S.corm;
    await this.hop(C0[0] + (R.cormBridge.a[0] - C0[0]) * 0.5, C0[3], C0[1] + (R.cormBridge.a[2] - C0[1]) * 0.5, 'Cormorant\'s top');
    await this.go(R.cormBridge.a[0], R.cormBridge.a[2], 0.6, 10, 'the bridge to the Twins');
    await this.go(R.tww28[0], R.tww28[2], 0.6, 20, 'across to the Twins');
    if (stop === 'twins') return;
    for (const [i, q] of R.twwLedges.entries()) await this.hop(q[0], q[1], q[2], `Twin ledge ${i + 1}`);
    const W = this.U.S.tww, E2 = this.U.S.twe;
    await this.hop(W[0], W[3], W[1], 'the west Twin\'s top');
    const ux = E2[0] - W[0], uz = E2[1] - W[1], ul = Math.hypot(ux, uz);
    await this.go(W[0] + (ux / ul) * (W[2] - 1.2), W[1] + (uz / ul) * (W[2] - 1.2), 0.4, 10, 'the edge facing the east Twin');
    await this.hop(E2[0] - (ux / ul) * 2, E2[3], E2[1] - (uz / ul) * 2, 'the jump between the Twins');
    await this.path(R.tweStair, 0.6, 'down to the Twins\' nest');
    await this.path(R.tweStair.slice().reverse(), 0.6, 'back up');
    await this.cross(R.kesBridge, 'Kestrel');
    await this.go(R.kes30b[0], R.kes30b[2], 0.6, 10, 'round the 30 m ledge');
    await this.go(R.upAt[0], R.upAt[2], 1.2, 10, 'into the updraft');
    // the updraft throws you onto the 40 m ledge
    await this.until(() => this.grounded && Math.abs(this.p.y - 0.93 - R.kesUp[1]) < 0.4, 4, 'landing on the 40 m ledge');
    await this.go(R.kesUp[0], R.kesUp[2], 0.6, 5, 'the 40 m ledge');
    await this.path(R.kesStair, 0.6, 'Kestrel\'s stair');
  }
}

const MET = { 'lsb.ch': 1, 'lsb.beacon': 'lit', 'lsb.p.met': true };
const ALL7 = ['low', 'corm', 'twe', 'kes', 'old', 'eye', 'mast'];
const SEEDS = {
  climb: { flags: { 'lsb.ch': 1, 'lsb.beacon': 'lit' } },
  basket: { flags: MET },
  balance: { flags: MET, store: { feathers: ALL7 }, picks: [0] },
  east: { flags: MET },
  loom: { flags: { 'lsb.ch': 1, 'lsb.beacon': 'lit' }, picks: [1] },
  sandal: { flags: { 'lsb.ch': 1, 'lsb.beacon': 'lit' } },
  cove: { flags: { 'lsb.ch': 1, 'lsb.beacon': 'dark' }, arrival: 'cove' },
  goat: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true }), store: { feathers: ALL7, balanced: true } },
  highline: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true }), store: { feathers: ALL7, balanced: true } },
  echo8: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true, 'hunt.started': true, 's1.started': true }), store: { feathers: ALL7, balanced: true } },
  ship: { flags: MET },
  left: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true }), store: { feathers: ALL7, balanced: true }, picks: [2, 0] },
  ask: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true }), store: { feathers: ALL7, balanced: true }, picks: [1, 0] },
  steal: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.p.flown': true }), store: { feathers: ALL7, balanced: true }, picks: [0, 0] },
  flight: { flags: Object.assign({}, MET, { 'lsb.p.balanced': true, 'lsb.has.wings': true, 'lsb.perdika.trust': true }), store: { feathers: ALL7, balanced: true }, picks: [2] },
};
const f2v = (q) => `(${q[0].toFixed(1)}, ${q[2].toFixed(1)})`;
const SCENARIOS = {
  east: async (b) => {
    const R = b.U.route, O = b.U.S.old, E1 = b.U.S.eyeS;
    await b.go(94.5, 54, 0.6, 40, 'the spit to Old Wife');
    await b.path(R.oldStair, 0.7, 'Old Wife\'s stair');
    await b.cross(R.oldBridge, 'the Eye');
    const n = b.U.NEST.eye.at;
    await b.go(n[0], n[2], 0.6, 20, 'the nest on the arch');
    const f = b.feathers(); if (!f.includes('old') || !f.includes('eye')) throw new Error(`feathers ${f}`);
    b.note = `feathers ${f.join(',')}`;
  },
  ship: async (b) => {
    await b.go(-30, 58, 0.6, 40, 'the pier'); await b.go(-30, 34, 0.5, 20, 'along the pier');
    await b.go(-31.5, 34, 0.35, 10, 'the gangplank'); await b.go(-35, 34, 0.4, 10, 'aboard');
    await b.path(b.U.route.mastTreads, 0.45, 'the rope stair');
    if (!b.feathers().includes('mast')) throw new Error('no masthead feather');
  },
  left: async (b) => { await b.compass(); await b.sail(); },
  ask: async (b) => {
    await b.compass();
    await b.talkTo(b.U.ikmalios, 'Ikmalios'); if (!b.flag('lsb.ikmalios.shaken')) throw new Error('Ikmalios was not asked');
    await b.talkTo(b.U.perdika, 'Perdika'); await b.sail();
  },
  steal: async (b) => {
    await b.compass();
    const [bow, stern] = b.U.guards, gp = (q) => b.posOf(q.g);
    // they look where they walk: the bow guard has its back to the gangplank while it walks to the bow, the stern guard its
    // back to the cabin door while it walks to the far rail (and rests there)
    const bowAway = () => Math.abs(bow.face) > 2.6 && gp(bow)[2] > 27;
    const sternAway = () => stern.face < -1.3 && gp(stern)[0] > -36.8 && gp(stern)[0] < -34.5;
    const SAFE = [-34.0, 37.0];                         // by the starboard rail amidships: out of both patrols' sight
    const has = () => (b.E.profile.data.inv['lsb-compass'] || 0) > 0;
    const caught = () => b.U.P.seenT > 0;
    let tries = 0;
    const steps = async (list) => {
      b.stopIf = caught;
      try {
        for (const f of list) {
          await f();
          if (VERBOSE) console.log(`      step done at ${f2(b.p)} tick ${b.E.sim.tick} caught ${caught()} bow ${f2v(gp(bow))} face ${(bow.face || 0).toFixed(2)} stern ${f2v(gp(stern))} face ${(stern.face || 0).toFixed(2)}`);
          if (caught()) return false;
        }
        return true;
      } finally { b.stopIf = null; }
    };
    while (!has() && tries < 4) {
      tries++;
      if (b.p.x < -32 || b.p.x > -28 || b.p.z > 57) await b.go(-30, 58, 0.8, 40, 'the pier\'s end');
      await b.go(-30, 34, 0.4, 40, 'the gangplank\'s foot');
      await b.until(() => !caught(), 5, 'the guard\'s back');
      await b.until(bowAway, 30, 'the bow guard walking away');
      const ok = await steps([() => b.go(-31.5, 34, 0.35, 5, 'the gangplank'), () => b.go(-34.0, 34, 0.4, 5, 'aboard'),
        () => b.go(SAFE[0], SAFE[1], 0.4, 5, 'amidships by the rail'), () => b.until(sternAway, 30, 'the stern guard walking away'),
        () => b.go(-34.4, 43.4, 0.35, 5, 'the cabin door'), () => b.go(-36.4, 46.85, 0.3, 5, 'the chest'), () => b.use()]);
      if (!ok) { b.caughtIn = (b.caughtIn || 0) + 1; continue; }
      if (!has()) throw new Error(`used the chest at ${f2(b.p)} but no compass`);
    }
    if (!has()) throw new Error(`no compass after ${tries} tries`);
    const out = await steps([() => b.until(sternAway, 30, 'the stern guard walking away'), () => b.go(-34.4, 43.6, 0.4, 5, 'out of the cabin'),
      () => b.go(SAFE[0], SAFE[1], 0.4, 10, 'amidships by the rail'), () => b.until(bowAway, 30, 'the bow guard walking away'),
      () => b.go(-34.0, 34, 0.4, 5, 'the gangplank\'s top'), () => b.go(-31.5, 34, 0.35, 5, 'down the gangplank'), () => b.go(-30, 34, 0.5, 5, 'the pier')]);
    if (!out) throw new Error('caught on the way out');
    await b.go(-30, 58, 0.8, 20, 'the pier\'s end');
    await b.talkTo(b.U.perdika, 'Perdika'); if (!b.flag('lsb.p.compassDone')) throw new Error('Perdika did not take the compass');
    await b.talkTo(b.U.ikmalios, 'Ikmalios');
    await b.sail();
    b.note = `${tries} tries aboard, caught ${b.caughtIn || 0} times`;
  },
  loom: async (b) => {
    const LO = b.U.LO, cell = (r, c) => [LO[0] - 4.5 + c * 1.5, LO[2] - 4.5 + r * 1.5];
    await b.go(LO[0] + 7.5, LO[2] + 7.5, 0.8, 40, 'the loom-floor\'s corner');    // (round the floor, not across it)
    await b.go(LO[0] + 7.5, LO[2] - 4.0, 0.8, 10, 'by the loom');
    await b.talkTo(b.U.glauke, 'Glauke');
    if (!b.flag('lsb.p.loomTalk')) throw new Error('Glauke did not tell me about the floor');
    await b.go(LO[0] + 7.5, LO[2] + 7.5, 0.8, 10, 'back round');
    await b.go(LO[0] - 7.5, LO[2] + 7.5, 0.8, 20, 'the far corner');
    await b.go(LO[0] - 7.0, LO[2] - 4.5, 0.5, 20, 'the end of the top row');
    // every thread stone, stepping only on thread (back along lit ones where a branch ends)
    const ROUTE = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [5, 2], [6, 2], [5, 2], [4, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4],
      [5, 4], [5, 3], [5, 4], [5, 5], [4, 5], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [1, 6], [1, 5], [2, 5], [2, 4], [2, 3], [2, 2]];
    for (const [r, c] of ROUTE) { const q = cell(r, c); await b.go(q[0], q[1], 0.3, 5, `stone ${r},${c}`); }
    await b.settle();
    if (!b.flag('lsb.sign.athena')) throw new Error(`the loom is not done: ${b.U.stones.filter((q) => q.lit).length} lit`);
    if (!b.E.profile.data.inv['lsb-owl-brooch']) throw new Error('no Owl Brooch');
  },
  sandal: async (b) => {
    await b.talkTo(b.U.kyllo, 'Kyllo');
    if (!b.store('sandalAsked', false)) throw new Error('Kyllo did not ask');
    await b.climbWest('twins');
    await b.path(b.U.route.sandalStair, 0.6, 'down to the gull\'s ledge');
    const SD = b.U.SANDAL; await b.go(SD[0], SD[2], 0.4, 5, 'the sandal');
    if (!b.store('sandal', false)) throw new Error('no sandal');
    const W = b.U.S.tww; // off the ledge into the sea: a splash, and back on the beach
    for (let i = 0; i < 600 && b.p.z < 80; i++) { const [qx, qy] = b.stick(b.p.x + (b.p.x - W[0]), b.p.z + (b.p.z - W[1])); await b.tick(qx, qy, 0); }
    if (b.p.z < 80) throw new Error(`no splash: ${f2(b.p)}`);
    await b.talkTo(b.U.kyllo, 'Kyllo');
    if (!b.flag('lsb.kind.2')) throw new Error('Kyllo has no sandal');
  },
  cove: async (b) => {
    if (Math.hypot(b.p.x - 128, b.p.z - 90) > 3) throw new Error(`not at the cove: ${f2(b.p)}`);
    await b.talkTo(b.U.kessa, 'Kessa');
    if (b.posOf(b.U.kessa)[0] < 100) throw new Error('Kessa is not waiting in the cove');
    await b.go(124, 90, 0.6, 10, 'the sea cave'); await b.go(106, 90, 0.6, 10, 'through it');
    await b.go(0, 96, 1.0, 40, 'along the beach');
  },
  // Season 1 of the Founder's hunt: Echo VIII, beside Old Horn on Gull Pillar's top
  echo8: async (b) => {
    await b.basketUp();
    await b.toGullTop();
    await b.go(b.U.S.gull[0] - 1.6, b.U.S.gull[1] + 1.4, 0.4, 5, 'Echo VIII');
    await b.until(() => b.flag('echo.8'), 2, 'Echo VIII');
  },
  goat: async (b) => {
    await b.basketUp();
    await b.toGullTop();
    await b.go(b.U.S.gull[0] + 1, b.U.S.gull[1] - 1.5, 0.6, 5, 'Old Horn');
    if (!b.flag('lsb.goat.2')) throw new Error('no goat');
  },
  highline: async (b) => {
    await b.basketUp();
    await b.toGullTop();
    const G = b.U.S.gull, H = b.U.HOOPS, h0 = H[0];
    const ux = h0[0] - G[0], uz = h0[2] - G[1], ul = Math.hypot(ux, uz);
    await b.go(G[0] - (ux / ul) * 2, G[1] - (uz / ul) * 2, 0.4, 10, 'the far side of the top');
    for (let i = 0; i < 40 * 60; i++) {
      if (b.store('highBest', null) != null) break;
      const n = b.U.P.high ? b.U.P.high.next : 0, h = H[n];
      const dh = Math.hypot(h[0] - b.p.x, h[2] - b.p.z), onTop = Math.hypot(b.p.x - G[0], b.p.z - G[1]) < G[2] + 0.3 && b.grounded;
      const atRim = Math.hypot(b.p.x - G[0], b.p.z - G[1]) > G[2] - 0.6;
      const glide = b.p.y - dh / 4.52 > h[1] + 0.8 ? 0 : 2;              // (let go to sink when a glide would come in high)
      const [qx, qy] = b.stick(h[0], h[2]);
      await b.tick(qx, qy, onTop ? (atRim ? 3 : 0) : glide);
      if (b.grounded && !onTop && i > 30) throw new Error(`landed on the High Line before hoop ${n + 1}: ${f2(b.p)}`);
    }
    const t = b.store('highBest', null);
    if (t == null) throw new Error('the High Line is not finished');
    b.note = `High Line ${(+t).toFixed(2)} s`;
  },
  basket: async (b) => { await b.basketUp(); if (b.p.y < 47) throw new Error(`not on the deck: ${f2(b.p)}`); },
  balance: async (b) => {
    await b.basketUp();
    const P = b.U.PIECES, at = (k) => { const i = P.findIndex((q) => q.k === k), B = b.U.BAL; return [B[0] + 3.2, B[2] - 2 + i]; };
    for (const k of ['f1', 'f3', 'w6']) { const q = at(k); await b.go(q[0] - 0.9, q[1], 0.4, 20, `the ${k} piece`); await b.use(); }
    await b.settle();
    if (!b.flag('lsb.p.balanced')) throw new Error('not balanced');
    if (!b.flag('lsb.has.wings')) throw new Error('no wings after the fear talk');
    b.note = `balanced; trust ${b.flag('lsb.perdika.trust')}`;
  },
  flight: async (b) => {
    await b.basketUp();
    await b.testFlight();
    await b.until(() => b.flag('lsb.compass'), 60, 'the talk on the beach');
    await b.settle();
    if (!b.flag('lsb.p.flown')) throw new Error(`not flown: landed at ${f2(b.p)}`);
    b.note = `landed at ${f2(b.p)}; title ${b.flag('title.lsb.lowflyer')}; compass ${b.flag('lsb.compass')}`;
  },
  climb: async (b) => {
    await b.climbWest();
    const pd = b.U.perdika.pos;
    await b.go(pd.x !== undefined ? pd.x : pd[0], (pd.z !== undefined ? pd.z : pd[2]) + 1.5, 1.2, 20, 'Perdika');
    await b.use();
    if (!b.flag('lsb.p.met')) throw new Error('did not meet Perdika');
    b.note = `met Perdika; feathers ${b.feathers().join(',')}`;
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
  const proof = { format: FORMAT, sim: engine, engine: 'pterousa-bot', world: WORLD, registry, from: spec.from, ...(spec.arrival ? { arrival: spec.arrival } : {}), entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'pterousa bot' } };
  writeFileSync(join(OUT, `pterousa-${name}.json`), JSON.stringify(proof));
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t}, ${(b.t / 60).toFixed(1)} s)${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL ROUTES OK');
process.exitCode = bad ? 1 : 0;
