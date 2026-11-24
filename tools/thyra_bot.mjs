// The Last Summer of Bronze, chapter 1 (src/worlds/thyra.js), played headlessly by a scripted bot on the real physics:
// every route a player has to take (the chimney's ledges, the basket, the Hearth's roof, the olive's branch, the
// terraces to Owl's Watch, the boat to Gull Rock, the tide pools, the Shadow Race) and the story's scenes with their
// choices. Each scenario is one visit from a seeded state; its proof is written out, and must verify like any run.
// The bot decides every tick (a person's reaction time is not modelled: a route the bot fails, nobody can take).
// usage: node tools/thyra_bot.mjs [--only climb,hearth,...] [--out DIR] [--docs DIR] [-v]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/thyra')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'lsb-thyra');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI); // the stick's basis faces -z: stick up is -z, stick right is +x
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };
const WELCOMED = { 'met.wren': true, 'lsb.met': true, 'lsb.feet': true, 'lsb.welcomed': true, 'lsb.tremor': true, 'lsb.knife': true, 'codex.lsb.door': true };
const GIFTS = { 'lsb-guest-knife': 1, 'lsb-token-own': 1 };

class Bot {
  constructor(E, name) { this.E = E; this.name = name; this.TH = E.world.group.userData.thyra; this.t = 0; }
  get p() { return this.E.player.pos; }
  get grounded() { return this.E.player.grounded; }
  async tick(qx = 0, qy = 0, bits = 0) {
    if (this.E.sim.ended) throw new Error('the visit already ended');
    this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++;
    await yieldNow();
  }
  steer(x, z, slow = 1.0) {
    const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz);
    if (d < 0.04) return [0, 0];
    const k = Math.min(1, d / slow);
    return [Math.round(dx / d * 127 * k), Math.round(-dz / d * 127 * k)];
  }
  // walk to (x, z), to within r metres
  async go(x, z, r = 0.45, maxS = 40) {
    for (let i = 0; i < maxS * 60; i++) {
      if (Math.hypot(x - this.p.x, z - this.p.z) < r) return;
      const [qx, qy] = this.steer(x, z); await this.tick(qx, qy, 0);
    }
    throw new Error(`go to (${x}, ${z}): stuck at ${f2(this.p)}`);
  }
  async path(pts, r) { for (const [x, z] of pts) await this.go(x, z, r); }
  // jump toward a platform whose top is at y, and land on it
  // (moving: a platform that rises and sinks; landing anywhere on it, above the water, counts)
  async hop(x, y, z, label = '', moving = false) {
    for (let i = 0; i < 300; i++) {
      const [qx, qy] = this.steer(x, z, 0.35);
      await this.tick(qx, qy, i === 0 ? 3 : i < 16 ? 2 : 0);
      if (i > 5 && this.grounded) {
        if (moving ? Math.hypot(this.p.x - x, this.p.z - z) < 1.2 && this.p.y - 0.93 > -1 : Math.abs(this.p.y - 0.93 - y) < 0.35) { if (!moving) await this.go(x, z, 0.3, 4); return; }
        throw new Error(`hop ${label} to (${x}, ${y}, ${z}): landed at ${f2(this.p)}`);
      }
    }
    throw new Error(`hop ${label}: never landed (${f2(this.p)})`);
  }
  async idle(n) { for (let i = 0; i < n; i++) await this.tick(0, 0, 0); }
  // F (use), then let the scene play out: dialogs here close at once, choices take the next pick
  async use() { await this.tick(0, 0, 8); await this.settle(); }
  async strike() { await this.tick(0, 0, 512); await this.idle(30); }
  async settle(maxS = 60) {
    let calm = 0;
    for (let i = 0; i < maxS * 60 && calm < 45; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; }
  }
  mover(mesh) { return this.E.world.movers.find((m) => m.mesh === mesh); }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  // the hearthstone at the chimney's foot: stand on it, let go of the stick, and land on the east rim
  async basket() {
    if (!this.TH.hearthstone) throw new Error('no hearthstone (has Eumaia met the player?)');
    await this.path([[10, -16], [13, -25]], 0.3);
    for (let i = 0; i < 90 && this.p.y < 3; i++) {
      const [qx, qy] = this.steer(16.6, -25, 0.6); await this.tick(qx, qy, 0);
      if (VERBOSE && i % 3 === 0) console.log(`    to the stone: ${f2(this.p)} vel ${this.E.player.vel.y.toFixed(2)} ${this.grounded ? 'grounded' : 'air'}`);
    }
    await this.until(() => this.p.y > 20, 3, 'the launch');
    await this.until(() => this.grounded, 5, 'the landing');
    if (this.p.y < 24.5 || this.p.x < 24) throw new Error(`the hearthstone dropped the player at ${f2(this.p)}`);
    if (VERBOSE) console.log(`    hearthstone: landed at ${f2(this.p)}`);
    await this.go(26, -25, 0.5);
  }
  flag(k) { return this.E.profile.data.flags[k]; }
  has(id) { return (this.E.profile.data.inv[id] || 0) > 0; }
  store() { const s = this.E.profile.data.worlds['lsb-thyra']; return (s && s.store) || {}; }
}

// the terraces, from the Shelf to Owl's Watch (bell: ring it on the third tier and collect the goat's tablet)
async function terraces(b, bell) {
  await b.path([[26, -19], [50, -19], [50, -52], [47, -56.25]]);
  for (let k = 1; k <= 7; k++) {
    const odd = k % 2 === 1, z = -45 - 13 * k + 1.75, xb = odd ? 46 : 54, xt = odd ? 28.6 : 71.4;
    if (k > 1) await b.go(odd ? xb + 1 : xb - 1, z, 0.5);
    await b.go(xt, z, 0.5);
    await b.go(xt, z - 4.5, 0.5);
    if (bell && k === 3) { await b.go(60.6, -87.2, 0.4); await b.use(); }
    if (bell && k === 4) { await b.go(36, -103, 0.6); }
  }
  await b.path([[50, -140], [50, -149.5], [50, -152]], 0.5);
}
async function cliffStair(b) { await b.path([[26, -19], [50, -19], [62, 4], [84.5, 4], [87, 6], [87, 26.5], [90, 29], [100.5, 29], [102, 25]], 0.5); }
async function upTheStair(b) { await b.path([[102, 25], [100.5, 29], [92, 29], [87.5, 27], [87, 8], [86, 4.5], [66, 4], [50, -12], [48.6, -27.6]], 0.5); }

const SCENARIOS = {
  // the hearthstone at a run: sprinting across it from the cave must launch you too
  async sprint(b) {
    await b.path([[6, -25]], 0.4);
    for (let i = 0; i < 150 && b.p.y < 3; i++) await b.tick(127, 0, 0);
    await b.until(() => b.p.y > 20, 3, 'the launch at a run');
    await b.until(() => b.grounded, 5, 'the landing');
    if (b.p.y < 24.5 || b.p.x < 24) throw new Error(`a running launch dropped the player at ${f2(b.p)}`);
  },
  // a first visit: the cave, the chimney's ledges, Eumaia, the basin, bread and salt, the tremor
  async climb(b) {
    await b.path([[8, -14], [20.5, -23.6]]);
    const L = b.TH.LEDGES;
    for (let i = 0; i < L.length; i++) { const [x, z] = L[i] || [21.6, -21.6]; await b.hop(x, 1.6 * (i + 1), z, `ledge ${i + 1}`); }
    await b.hop(12.4, 24, -25.6, 'onto the Shelf');
    await b.go(10.4, -21.1, 0.4); await b.use();
    if (!b.flag('lsb.met')) throw new Error('the greeting did not happen');
    await b.path([[12, -17], [26, -17], [36.5, -19], [36.5, -21.8], [31.6, -25.9]], 0.3); await b.use();
    if (!b.flag('lsb.feet')) { const its = b.E.world.interactables.map((it) => `${it.label}${it.enabled ? '' : ' (off)'}${it.running ? ' (running)' : ''} ${Math.hypot(it.pos.x - b.p.x, it.pos.z - b.p.z).toFixed(1)}`).filter((x) => +x.split(' ').pop() < 6); throw new Error(`the basin scene did not happen (at ${f2(b.p)}, busy ${b.E.sim.busy}; near: ${its.join('; ')})`); }
    await b.go(35, -28.8, 0.4); await b.use();
    if (!b.flag('lsb.welcomed')) throw new Error(`bread and salt did not happen (at ${f2(b.p)})`);
    await b.until(() => b.flag('lsb.tremor'), 10, 'the tremor'); await b.settle();
    if (!b.flag('lsb.tremor') || !b.has('lsb-guest-knife')) throw new Error('no tremor, or no knife');
  },
  // the basket, the Hearth's roof (stair, terrace, jar), the olive's branch, two tablets back to Eumaia
  async hearth(b) {
    await b.basket();
    await b.path([[26, -19], [48.6, -19], [48.6, -27.6], [46, -28.6], [46, -37.4], [43, -38.2], [40.2, -37.6]], 0.4);
    await b.hop(40.2, 29.3, -39.4, 'onto the jar');
    await b.hop(40, 31, -41.6, 'onto the roof');
    await b.go(37, -43, 0.4);
    if (!b.has('lsb-tablet-fish')) throw new Error('no roof tablet');
    await b.go(40, -38.6, 0.4);                                   // off the roof's front, down onto the terrace
    await b.go(40, -37.2, 0.3);
    await b.hop(40, 28.8, -36.2, 'onto the parapet');
    await b.go(40, -27.7, 0.25);
    await b.hop(40, 30.4, -25.6, 'into the olive\'s crown');
    if (!b.has('lsb-tablet-wheel')) throw new Error('no olive tablet');
    await b.path([[43, -25.5], [44.5, -27.6], [32.2, -29.4]], 0.4); await b.use();
    if ((b.store().returned || []).length !== 2) throw new Error('the tablets were not returned');
  },
  // the terraces: the supper bell, Old Horn's tablet, Owl's Watch
  async terraces(b) {
    await b.basket();
    await terraces(b, true);
    if (!b.has('lsb-tablet-mountain')) throw new Error('no terrace tablet');
  },
  // the cliff stair, the quay, the drifting boat out to Gull Rock and back
  async boat(b) {
    await b.basket(); await cliffStair(b);
    await b.path([[118, 24], [127, 38.5], [127, 45], [127, 67.2]], 0.5);
    const m = () => b.mover(b.TH.boat);
    await b.until(() => m().cur.z < 70.6 && m().wait > 1.0, 30, 'the boat at the quay');
    await b.go(127, 70.8, 0.4);
    await b.until(() => m().cur.z > 81.4 && m().wait > 0.4, 30, 'the boat at Gull Rock');
    await b.hop(127, 2.4, 85.4, 'onto Gull Rock');
    await b.go(127, 87.6, 0.4);
    if (!b.has('lsb-tablet-star')) throw new Error('no Gull Rock tablet');
    await b.go(127, 85.2, 0.4);
    await b.until(() => m().cur.z > 81.4 && m().wait > 1.4, 40, 'the boat back at Gull Rock');
    await b.hop(127, 1.0, 81.5, 'back into the boat');
    await b.until(() => m().cur.z < 70.6 && m().wait > 0.4, 30, 'the boat at the quay');
    await b.hop(127, 1.5, 67, 'onto the quay');
  },
  // the tide pools: ride the crest of risen stones out to the far rock
  async pools(b) {
    await b.basket(); await cliffStair(b);
    await b.path([[112, 26], [114, 38.6]], 0.4);
    await b.hop(114, 1.6, 41.6, 'onto the shore step');
    const stones = b.TH.poolStones.map((mesh) => () => b.mover(mesh)), P = b.TH.POOLS;
    // hop onto each stone as it comes up (rising, or resting at the top), so the crest carries you out
    const ready = (m) => m.cur.y > -0.1 && (m.cur.y > m.prev.y + 1e-6 || (m.cur.y > 0.05 && Math.abs(m.cur.y - m.prev.y) < 1e-6));
    for (let k = 0; k < P.length; k++) {
      await b.until(() => ready(stones[k]()), 12, `stone ${k} up`);
      await b.hop(P[k][0], 0.6, P[k][1], `stone ${k}`, true);
    }
    await b.hop(103.5, 1.6, 69.2, 'onto the far rock');
    await b.go(103.5, 69.8, 0.4);
    if (!b.has('lsb-tablet-wave')) throw new Error('no tide-pool tablet');
  },
  // the Shadow Race: from Kyllo by the sundial, up the cliff stair, to the Hearth
  async race(b) {
    await b.basket(); await cliffStair(b);
    await b.path([[118, 20], [123.4, 12.8]], 0.4);
    const t0 = b.t;
    await b.use();
    if (b.TH.race == null) throw new Error('the race did not start');
    const start = b.t;
    await b.path([[118, 20]], 0.6); await upTheStair(b); await b.go(44, -27.6, 0.5);
    await b.idle(5);
    const rec = b.E.sim.claims.find((c) => c[1] === 'record' && c[2] === 'lsb-shadow');
    if (!rec) throw new Error(`no record (race ${b.TH.race}, at ${f2(b.p)})`);
    b.note = `race: ${rec[3].toFixed(2)} s on the clock (limit ${b.TH.RACE} s); the bot ran it in ${((b.t - start) / 60).toFixed(1)} s`;
  },
  // dusk: the terraces to the Watch, the beacon lit, the palace ship, home to Junction
  async finale(b) {
    await b.basket(); await terraces(b, false);
    await b.settle(90);
    for (let i = 0; i < 60 * 30 && !b.E.sim.ended; i++) await b.tick();
    if (!b.E.sim.ended) throw new Error('the chapter did not end with a trip home');
    if (b.flag('lsb.ch') !== 1 || b.flag('lsb.beacon') !== 'lit' || !b.has('lsb-house-seal')) throw new Error('the ending did not set the chapter, the beacon or give the seal');
  },
};
const SEEDS = {
  sprint: { flags: WELCOMED, inv: GIFTS },
  climb: { flags: { 'met.wren': true }, inv: {}, picks: [1, 1] },
  hearth: { flags: WELCOMED, inv: GIFTS, eq: { hand: 'lsb-guest-knife' } },
  terraces: { flags: WELCOMED, inv: GIFTS, eq: { hand: 'lsb-guest-knife' } },
  boat: { flags: WELCOMED, inv: GIFTS },
  pools: { flags: WELCOMED, inv: GIFTS },
  race: { flags: WELCOMED, inv: GIFTS, picks: [3, 0] },
  finale: { flags: Object.assign({}, WELCOMED, { 'lsb.tablets': true, 'lsb.kessa': 'slate', 'title.lsb.guest': true }), inv: Object.assign({ 'lsb-token-linnet': 1 }, GIFTS), store: { returned: ['fish', 'wheel', 'star', 'wave', 'mountain', 'bird'], goat: 'moved', olive: 'dropped' }, picks: [0] },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const seed = SEEDS[name], picks = (seed.picks || []).slice();
  const entry = { coins: 0, inv: Object.assign({}, seed.inv), eq: Object.assign({}, EQ0, seed.eq || {}), flags: Object.assign({}, seed.flags), save: seed.store ? { coins: {}, store: seed.store, visits: 1 } : null };
  const spec = { registry, world: WORLD, from: 'hub', entry };
  const ui = { dialog: async () => {}, choice: async (who, q, opts) => { const k = picks.length ? picks.shift() : 0; if (VERBOSE) console.log(`    ${who}: ${q} -> ${opts[k]}`); return k; } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  const b = new Bot(E, name);
  let err = null;
  try { await plan(b); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'thyra-bot', world: WORLD, registry, from: 'hub', entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: E.sim.ended && !E.sim.ended.external ? { tick: E.sim.ended.tick, to: E.sim.ended.to } : null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'thyra bot' } };
  const file = join(OUT, `thyra-${name}.json`);
  writeFileSync(file, JSON.stringify(proof));
  const sum = proof.claims.filter((c) => ['give', 'record', 'take'].includes(c[1])).map((c) => c[1] === 'record' ? `${c[2]} ${(+c[3]).toFixed(2)}` : `${c[1]} ${c[2]}`).join(', ');
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t})`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play, ${proof.events.length} answers${b.note ? '; ' + b.note : ''}${VERBOSE ? ' · ' + sum : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL ROUTES OK');
process.exitCode = bad ? 1 : 0;
