// The Last Summer of Bronze, chapter 3: Three Circuits (src/worlds/strait.js), played headlessly by a scripted bot on the
// real physics: the ride in (the crew, the boulders, the anchor, Kessa's briefing), the Teeth, the causeway crossed
// between Talos's footfalls (and once under one), Watch Rock's stair and its cracked steps, the Calling Bell (a wrong
// rhythm, then the shepherds' one), Talos's rule and his question (every answer), the glide home and the walk home,
// Kessa and the trip to Kerynthos (lit and dark), Ammi's water, Old Horn on the yard and the tin-drops. Each scenario is
// one visit from a seeded state; its proof is written out and must verify like any run.
// usage: node tools/strait_bot.mjs [--only ride,cross,...] [--out DIR] [--docs DIR] [-v]
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
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/strait')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'lsb-strait');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

class Bot {
  constructor(E) { this.E = E; this.U = E.world.group.userData.strait; this.t = 0; this.deaths = 0; }
  get p() { return this.E.player.pos; }
  get grounded() { return this.E.player.grounded; }
  get now() { return this.E.world.ticks; }
  flag(k) { return this.E.profile.data.flags[k]; }
  store(k, d) { const ws = this.E.profile.data.worlds['lsb-strait']; const v = ws && ws.store ? ws.store[k] : undefined; return v === undefined ? d : v; }
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
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (this.p.y < y0 - 3) throw new Error(`fell walking to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: at ${f2(this.p)}`);
    }
    throw new Error(`walk to ${what || `(${x.toFixed(1)}, ${z.toFixed(1)})`}: stuck at ${f2(this.p)}`);
  }
  async path(pts, r = 0.5, what = '') { for (const q of pts) await this.go(q[0], q[2], r, 40, what); }
  // jump toward a platform whose top is at y, landing near (x, z)
  async hop(x, y, z, label = '', quick = false) {
    // run at it and jump at the edge: off the edge (coyote time), within 3 m of the target, or stuck against a step
    let last = null, stuck = 0;
    for (let i = 0; i < 300; i++) {
      const d = Math.hypot(x - this.p.x, z - this.p.z);
      if (!this.grounded || d < 3.0 || stuck > 4) break;
      const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0);
      if (last && Math.hypot(this.p.x - last[0], this.p.z - last[1]) < 0.02) stuck++; else stuck = 0;
      last = [this.p.x, this.p.z];
    }
    for (let i = 0; i < 240; i++) {
      const [qx, qy] = this.stick(x, z, 0.3);
      await this.tick(qx, qy, i === 0 ? 3 : i < 18 ? 2 : 0);
      if (VERBOSE && i % 6 === 0) console.log(`      hop ${label} i${i}: ${f2(this.p)} g ${this.grounded}`);
      if (i > 5 && this.grounded) {
        if (Math.abs(this.p.y - 0.93 - y) < 0.4) { if (!quick) await this.go(x, z, 0.4, 4, label); return; }
        throw new Error(`hop ${label} to (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}): landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`hop ${label}: never landed (${f2(this.p)})`);
  }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(); }
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async settle(maxS = 60) { let calm = 0; for (let i = 0; i < maxS * 60 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  posOf(npc) { const q = npc.pos; return q.x !== undefined ? [q.x, q.y, q.z] : q; }
  async talkTo(npc, what) { const q = this.posOf(npc); await this.go(q[0], q[2] + (q[2] > 0 ? -1.4 : 1.4), 1.2, 30, what); await this.use(); }
  // ---- the hazards, read from the world's schedule ----
  // is the stretch of causeway around z (half-length h) safe from now until `ticks` from now?
  stoneSafe(k, ticks) {
    const U = this.U, t = this.now;
    if (U.P.talos.mode !== 'walk') return true;
    if (U.plantedAt(t) === k) return false;
    return U.nextStamp(k, t) > t + ticks;
  }
  screeSafe(i, ticks) {
    const U = this.U, s = U.scree[i], t = this.now;
    if (s.down || (s.fallAt >= 0 && s.fallAt <= t + ticks)) return false;
    if (U.P.talos.mode !== 'walk') return true;
    // a stamp within 10 m drops it 0.3 s later
    for (let k = 0; k < 6; k++) if (Math.abs(U.STONES[k] - s.z) <= 10 && U.nextStamp(k, t) + U.DROP <= t + ticks) return false;
    return true;
  }
  crackSafe(i, ticks) {
    const U = this.U, c = U.cracked[i], t = this.now;
    if (c.down || (c.fallAt >= 0 && c.fallAt <= t + ticks)) return false;
    if (U.P.talos.mode !== 'walk') return true;
    for (let k = 0; k < 6; k++) if (U.nextStamp(k, t) + U.DROP <= t + ticks) return false;
    return true;
  }
  // off the ship by the gap in the port rail, onto the plank
  async toPlank() { await this.go(-1.2, 0, 0.5, 20, 'the gap in the rail'); await this.go(-4.5, 0, 0.5, 10, 'the plank'); }
  // the hop line of the Teeth, from the Landing to the causeway's tip
  async teeth() {
    const U = this.U;
    await this.go(U.LANDING[0] - 1.5, U.LANDING[1] - 1.2, 0.6, 30, 'the Landing\'s west edge');
    for (const [i, [x, z, r, top, crumbly]] of U.TEETH.entries()) await this.hop(x, top, z, `Tooth ${i + 1}`, crumbly);
    await this.hop(U.CX + 0.8, U.CY, U.TIP + 1.6, 'the causeway\'s tip');
  }
  // north along the causeway, niche to niche: the niches are the safe places between his footstones. Before each dash,
  // wait until every footstone and stretch of scree on the way will stay safe for as long as the dash takes
  async causeway() {
    const U = this.U, CX = U.CX, NX = CX + U.CW / 2 + 0.8;
    const stops = [U.TIP - 1.5].concat(U.NICHES, [U.NEND - 1]);
    for (let i = 0; i + 1 < stops.length; i++) {
      const z0 = stops[i], z1 = stops[i + 1], niche = i + 1 < stops.length - 1;
      const stones = U.STONES.map((z, k) => [z, k]).filter(([z]) => z < z0 && z > z1).map(([, k]) => k);
      const screes = U.SCREE.map((z, j) => [z, j]).filter(([z]) => z < z0 && z > z1).map(([, j]) => j);
      const need = Math.ceil(((z0 - z1 + 6) / 7.2) * 60) + 30;
      const ok = () => stones.every((k) => this.stoneSafe(k, need)) && screes.every((j) => this.screeSafe(j, need));
      let waited = 0;
      while (!ok()) { await this.tick(); if (++waited > 150 * 60) throw new Error(`waited too long at ${z0} for the stretch to ${z1}`); }
      if (VERBOSE) console.log(`      ${z0} -> ${z1} (stones ${stones}, scree ${screes}): waited ${(waited / 60).toFixed(1)} s (tick ${this.now}, his step ${U.stepOf(this.now) % U.PLAN.length})`);
      const d0 = this.deaths;
      await this.go(CX + 0.6, z0 - 1, 0.5, 10, `out of the niche at ${z0}`);
      await this.go(CX + 0.6, z1 + (niche ? 0 : 1), 0.5, 15, `along to ${z1}`);
      if (niche) await this.go(NX, z1, 0.4, 5, `into the niche at ${z1}`);
      if (this.deaths > d0) throw new Error(`caught between ${z0} and ${z1}`);
    }
  }
  // up Watch Rock's stair, waiting before each cracked stretch until it will hold
  async climb() {
    const U = this.U, T = U.treads;
    let i = 0;
    while (i < T.length) {
      const ci = U.CRACKED.findIndex(([a]) => a === i + 1 || a === i);
      if (ci >= 0 && U.CRACKED[ci][0] === i + 1) {
        const n = U.CRACKED[ci][1] - U.CRACKED[ci][0] + 3, need = Math.ceil((n * 1.7 / 7.5) * 60) + 25;
        let waited = 0;
        while (!this.crackSafe(ci, need)) { await this.tick(); if (++waited > 60 * 60) throw new Error(`waited a minute at cracked steps ${ci}`); }
        const y0 = this.p.y;
        for (let j = U.CRACKED[ci][0]; j <= U.CRACKED[ci][1] + 1; j++) await this.go(T[j][0], T[j][2], 0.6, 5, `cracked step ${j}`);
        if (this.p.y < y0 - 1) throw new Error(`fell at cracked steps ${ci}`);
        i = U.CRACKED[ci][1] + 2; continue;
      }
      await this.go(T[i][0], T[i][2], 0.6, 10, `step ${i}`);
      i++;
    }
    await this.go(U.BELL[0] + 4.5, U.BELL[2] - 3, 0.6, 10, 'the summit'); await this.go(U.BELL[0] + 4.5, U.BELL[2] + 2.6, 0.6, 10, 'round the bell\'s frame');
    await this.go(U.BELL[0], U.BELL[2] + 2.0, 0.4, 10, 'the bell');
  }
  // the bell: three presses of F with the given gaps (seconds)
  async ring(gaps) {
    await this.tick(0, 0, 8);
    for (const g of gaps) { await this.idle(Math.round(g * 60) - 1); await this.tick(0, 0, 8); }
  }
  // glide from the summit's south-east rim to the ship's deck
  async glideHome() {
    const U = this.U, R0 = U.ROCK;
    const ux = 0 - R0[0], uz = 0 - R0[1], ul = Math.hypot(ux, uz), ex = R0[0] + (ux / ul) * (U.ROCK_R - 0.8), ez = R0[1] + (uz / ul) * (U.ROCK_R - 0.8);
    await this.go(ex - (ux / ul) * 4, ez - (uz / ul) * 4, 0.5, 20, 'back from the rim');
    for (let i = 0; i < 200; i++) { // run off the rim and jump
      const atRim = Math.hypot(this.p.x - R0[0], this.p.z - R0[1]) > U.ROCK_R - 1.0;
      const [qx, qy] = this.stick(0, 0); await this.tick(qx, qy, atRim ? 3 : 0);
      if (!this.grounded && atRim) break;
    }
    for (let i = 0; i < 40 * 60; i++) {
      const [qx, qy] = this.stick(0, 2, 0.5); await this.tick(qx, qy, 2);
      if (VERBOSE && i % 60 === 0) console.log(`      glide: ${f2(this.p)}`);
      if (this.grounded && i > 10) break;
    }
    if (!(Math.abs(this.p.x) < 3.2 && Math.abs(this.p.z) < 10.2 && this.p.y > 1.8)) throw new Error(`glided home short: landed at ${f2(this.p)}`);
  }
  // back down the stair and along the causeway (he sits now, so it is safe), the Teeth and the plank
  async walkHome() {
    const U = this.U, T = U.treads;
    for (let i = T.length - 1; i >= 0; i--) await this.go(T[i][0], T[i][2], 0.7, 10, `down step ${i}`);
    await this.go(U.CX + 0.6, U.TIP + 1.5, 0.6, 30, 'back along the causeway');
    const back = U.TEETH.slice().reverse();
    for (const [i, [x, z, r, top]] of back.entries()) await this.hop(x, top, z, `Tooth ${back.length - i} (back)`);
    await this.hop(U.LANDING[0] - 1.0, 1.35, U.LANDING[1], 'the Landing');
    await this.go(-5.0, 0, 0.5, 10, 'the plank'); await this.go(-1.5, 0, 0.5, 10, 'aboard');
  }
  async sail() {
    await this.until(() => this.E.sim.busy === 0, 30, 'quiet');
    if (!(this.flag('lsb.ch') >= 3)) await this.talkTo(this.U.kessa, 'Kessa');
    await this.until(() => (this.flag('lsb.ch') || 0) >= 3, 60, 'sailing');
    await this.until(() => this.E.sim.ended, 60, 'the trip home');
  }
}

// what a player has after chapter two (lit: the seal and both tokens; dark: the tokens)
const AFTER2 = (beacon = 'lit', trust = true) => ({
  flags: { 'lsb.ch': 2, 'lsb.beacon': beacon, 'lsb.eumaia': beacon === 'lit' ? 'home' : 'held', 'lsb.has.wings': true, 'lsb.p.flown': true, 'lsb.perdika.trust': trust, 'lsb.compass': 'asked' },
  inv: Object.assign({ 'lsb-token-own': 1, 'lsb-token-linnet': 1 }, beacon === 'lit' ? { 'lsb-house-seal': 1 } : {}),
});
const ANCHORED = { anchored: true, briefed: true };
const seed = (beacon, trust, store, picks, extra = {}) => Object.assign({}, AFTER2(beacon, trust), { store, picks }, extra);
const SEEDS = {
  ride: seed('lit', true, null, [0], { from: 'lsb-pterousa' }),
  why: seed('dark', false, { anchored: true }, [1, 0], { from: 'lsb-pterousa' }),
  teeth: seed('lit', true, ANCHORED, []),
  stamped: seed('lit', true, ANCHORED, []),
  cross: seed('lit', true, ANCHORED, []),
  seal: seed('lit', true, ANCHORED, [0, 0, 0, 0]),         // bring: the seal; answer: the truth; Kessa: the truth; up anchor
  token: seed('dark', true, ANCHORED, [0, 1, 1, 0]),        // (dark: no seal) the token; a kind lie; between us; up anchor
  please: seed('lit', false, ANCHORED, [2, 2, 0, 0]),       // please; I don't know
  walk: seed('lit', true, { anchored: true, briefed: true, talked: true }, [1, 1, 0], { flagsExtra: { 'lsb.talos': 'unsure' }, noWings: true }),
  ammi: seed('lit', true, ANCHORED, []),
  goat: seed('lit', true, ANCHORED, []),
  hub: seed('lit', true, ANCHORED, [], { from: 'hub' }),
};
const SCENARIOS = {
  // from the end of chapter two: she sails in, he throws, she anchors, Kessa briefs (and Perdika climbs the mast)
  ride: async (b) => {
    if (!b.U.P.ride) throw new Error('not sailing in');
    if (b.p.z < 145 || b.p.y < 2) throw new Error(`not on the deck at the start: ${f2(b.p)}`);
    await b.until(() => b.U.P.anchored, 40, 'the anchor');
    if (Math.abs(b.p.z) > 10 || b.p.y < 2) throw new Error(`not carried in: ${f2(b.p)}`);
    await b.until(() => b.store('briefed', false), 60, 'the briefing');
    await b.settle();
    const pd = b.posOf(b.U.perdika);
    if (pd[1] < 10) throw new Error(`Perdika is not up the mast: (${pd.map((v) => v.toFixed(1))})`);
    b.note = `anchored at tick ${b.now}; codex strait ${!!b.flag('codex.lsb.strait')}`;
  },
  // anchored but not yet briefed (dark, no trust): "why does a giant guard a strait?", then "I'll go"
  why: async (b) => {
    await b.until(() => b.store('briefed', false), 60, 'the briefing');
    await b.settle();
    if (b.posOf(b.U.perdika)[1] > 5) throw new Error('Perdika went up the mast without trust');
  },
  teeth: async (b) => {
    await b.toPlank();
    await b.teeth();
    b.note = `tin ${b.store('tin', []).length}`;
  },
  // stand on a footstone until his foot comes down: back to the checkpoint
  stamped: async (b) => {
    await b.toPlank();
    await b.teeth();
    const U = b.U;
    await b.until(() => b.stoneSafe(0, 300), 120, 'a quiet moment');
    await b.go(U.CX, U.STONES[0], 0.4, 10, 'the first footstone');
    await b.until(() => b.store('stamped', 0) > 0, 120, 'his foot');
    if (Math.abs(b.p.z - U.STONES[0]) < 4) throw new Error(`still on the footstone: ${f2(b.p)}`);
  },
  cross: async (b) => {
    await b.toPlank();
    await b.teeth();
    const t0 = b.now;
    await b.causeway();
    const t1 = b.now;
    await b.climb();
    b.note = `causeway ${((t1 - t0) / 60).toFixed(1)} s, climb ${((b.now - t1) / 60).toFixed(1)} s, tin ${b.store('tin', []).length}`;
  },
  seal: async (b) => { await b.fullRun([[1.2, 0.3]], 'glide'); },
  token: async (b) => { await b.fullRun([[0.4, 1.2], [1.3, 0.9], [1.2, 0.25]], 'glide'); }, // a quick one, a slow third, then right
  please: async (b) => { await b.fullRun([[1.5, 0.4]], 'glide'); },
  // after the talk, without wings: down the stair, along the causeway, over the Teeth, back aboard, and away
  walk: async (b) => {
    const U = b.U;
    await b.toPlank();
    await b.teeth();
    await b.go(U.CX + 0.6, U.NEND - 1, 0.5, 40, 'along the causeway (he sits)');
    await b.climb();
    await b.walkHome();
    await b.sail();
  },
  ammi: async (b) => {
    await b.talkTo(b.U.ammi, 'Ammi');
    if (!b.store('ammiAsked', false)) throw new Error('Ammi did not ask');
    await b.go(-1.8, 6.9, 0.5, 20, 'the jar'); await b.use();
    if (!b.store('cup', false)) throw new Error('no cup');
    await b.talkTo(b.U.ammi, 'Ammi');
    if (!b.flag('lsb.kind.3')) throw new Error('no kindness');
  },
  goat: async (b) => {
    const U = b.U;
    await b.go(-1.0, 4.5, 0.6, 10, 'the port side'); await b.go(-1.0, 0.8, 0.6, 10, 'forward');
    await b.go(-1.2, -2.9, 0.5, 10, 'round the mast'); await b.go(1.4, -2.7, 0.5, 10, 'to the foot of the rope stair'); // (from the bow side: nothing overhead)
    for (const [i, q] of U.RUNGS.entries()) await b.go(q[0], q[2], 0.35, 5, `rung ${i}`);
    await b.go(U.FOOTWAY.pos[0] - 1.0, U.FOOTWAY.pos[2], 0.3, 5, 'the yard');
    await b.until(() => b.flag('lsb.goat.3'), 2, 'Old Horn');
    await b.talkTo(b.U.perdika, 'Perdika up the mast');
    if (!b.flag('lsb.goat.3')) throw new Error('no goat');
  },
  // from Junction: on the Landing, in front of the portal home
  hub: async (b) => {
    if (Math.hypot(b.p.x - b.U.LANDING[0], b.p.z - b.U.LANDING[1]) > 4.5) throw new Error(`not on the Landing: ${f2(b.p)}`);
    await b.toPlank(); await b.go(-1, 0, 0.5, 10, 'aboard');
  },
};
// the whole chapter from the deck: the Teeth, the causeway, the climb, the bell (some wrong tries first), the talk, home, away
Bot.prototype.fullRun = async function (rhythms, home) {
  const U = this.U;
  await this.toPlank();
  await this.teeth();
  await this.causeway();
  await this.climb();
  for (const g of rhythms) { if (U.P.talos.mode !== 'walk') break; await this.ring(g); await this.idle(90); }
  if (U.P.talos.mode === 'walk') throw new Error('the bell did not call him');
  await this.until(() => this.store('talked', false), 120, 'the talk');
  await this.settle();
  if (home === 'glide') await this.glideHome(); else await this.walkHome();
  await this.sail();
  this.note = `answer ${this.flag('lsb.talos')}, token ${!!this.flag('lsb.talos.token')}, bring ${this.store('bring', '')}, title ${!!this.flag('title.lsb.talos')}`;
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const sd = SEEDS[name] || {}, picks = (sd.picks || []).slice();
  const flags = Object.assign({}, sd.flags, sd.flagsExtra || {});
  const inv = Object.assign({}, sd.inv), eq = Object.assign({}, EQ0);
  if (sd.noWings) delete flags['lsb.has.wings'];
  const entry = { coins: 0, inv, eq, flags, save: sd.store ? { coins: {}, store: sd.store, visits: 1 } : null };
  const spec = { registry, world: WORLD, from: sd.from || 'lsb-pterousa', arrival: sd.arrival, entry };
  const ui = { dialog: async () => {}, choice: async (who, q, opts) => { const k = picks.length ? picks.shift() : 0; if (VERBOSE) console.log(`    ${who}: ${q} -> ${opts[k]}`); return k; } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E);
  (E.world.handlers.respawn || (E.world.handlers.respawn = [])).push(() => { b.deaths++; });
  let err = null;
  try { await plan(b); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'strait-bot', world: WORLD, registry, from: spec.from, ...(spec.arrival ? { arrival: spec.arrival } : {}), entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'strait bot' } };
  writeFileSync(join(OUT, `strait-${name}.json`), JSON.stringify(proof));
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t}, ${(b.t / 60).toFixed(1)} s)${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}${b.deaths ? `; ${b.deaths} respawn(s)` : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL ROUTES OK');
process.exitCode = bad ? 1 : 0;
