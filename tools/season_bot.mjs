// Seasons 1 and 2 of the Founder's hunt (GAME.md: Before the Door, The Stranger), Junction's side, played headlessly by
// a scripted bot on the real physics. Season 1: the crayon drawing pinned inside the Vault starts the season for anyone
// whose hunt has begun (and the goal line follows it once the first hunt is done), a hunt still under way can start it
// too without losing its own goal line, and before the hunt begins the drawing only hums. Season 2: once Season 1 is
// done the goal line points at the postcard beside the drawing, which starts it; with Echo XII found, a stranger waits
// by the fountain, and following them round Junction (not too close: a look back at under 8 m, or a bump, and
// they slip away) ends at the Skyreach portal with Echo XIII; with Echoes XI to XIV found they wait in the Vault, and
// after you talk they leave Echo XV on the stone and walk out, and the Stranger's Hood follows. The other Echoes are
// in their worlds' bots (underfoot echo6 and echo10, thyra echo7, pterousa echo8, surf echo9, links echo11, strait
// echo12, skyreach race). Each scenario is one visit from a seeded state; its proof is written out and must verify.
// usage: node tools/season_bot.mjs [--only start,...] [--out DIR] [--docs DIR] [-v]
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
const ONLY = opt('--only', ''), OUT = opt('--out', join(root, 'proofs/season')), docs = opt('--docs', join(root, 'docs')), VERBOSE = argv.includes('-v');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const WORLD = registry.find((r) => r.id === 'hub');
let nonce = 0;
const loadModule = async (r) => (await import('data:text/javascript;base64,' + Buffer.from(readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8') + `\n// bot ${nonce++}\n`).toString('base64'))).default;
const QA = quantYaw(Math.PI);
const yieldNow = () => new Promise((r) => setImmediate(r));
const f2 = (v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
const EQ0 = { head: null, back: null, hand: null, feet: null, board: null, body: null };

class Bot {
  constructor(E) { this.E = E; this.t = 0; }
  get p() { return this.E.player.pos; }
  flag(k) { return this.E.profile.data.flags[k]; }
  async tick(qx = 0, qy = 0, bits = 0) { if (this.E.sim.ended) throw new Error(`the visit already ended: ${JSON.stringify(this.E.sim.ended).slice(0, 200)} at ${f2(this.p)}`); this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++; await yieldNow(); }
  stick(x, z) { const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz); if (d < 0.03) return [0, 0]; const k = Math.min(1, d); return [Math.round((dx / d) * 127 * k), Math.round((-dz / d) * 127 * k)]; }
  async go(x, z, r = 0.4, maxS = 30) {
    for (let i = 0; i < maxS * 60; i++) { if (Math.hypot(x - this.p.x, z - this.p.z) < r) return; const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0); }
    throw new Error(`walk to (${x}, ${z}): stuck at ${f2(this.p)}`);
  }
  async use() { await this.tick(0, 0, 8); let calm = 0; for (let i = 0; i < 3600 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  async until(fn, maxS, what) { for (let i = 0; i < maxS * 60; i++) { if (fn()) return; await this.tick(); } throw new Error(`waited ${maxS} s for ${what} (at ${f2(this.p)})`); }
  // from the arrival into the Vault (its door is at +z) and round the crown's pedestal to the drawing (east, at the back)
  async toDrawing() { for (const [x, z] of [[0, 9], [0, 4], [1.8, 1.0], [3.5, -1.3]]) await this.go(x, z); }
  async toPostcard() { for (const [x, z] of [[0, 9], [0, 4], [1.8, 1.0], [2.5, -2.9]]) await this.go(x, z); }
  get S2() { return this.E.world.group.userData.season2; }
  // from the arrival round the west side of the Vault to the fountain, where the stranger waits
  async toFountain() { for (const [x, z] of [[-10, 16.5], [-17.5, 6], [-18, -6], [-14, -11]]) await this.go(x, z, 0.6); }
  // follow the stranger round Junction: steer for where they were `lag` ticks ago (their own path, clear of
  // everything), and hold back while closer than `keep` metres
  async follow(keep, lag, maxS = 120) {
    const S = this.S2, crumbs = [];
    for (let i = 0; i < maxS * 60; i++) {
      if (S.TL.state !== 'walk') return S.TL.state;
      const q = S.stranger.pos; crumbs.push([q[0], q[2]]);
      const d = Math.hypot(q[0] - this.p.x, q[2] - this.p.z), aim = crumbs[Math.max(0, crumbs.length - 1 - lag)];
      if (d > keep && Math.hypot(aim[0] - this.p.x, aim[1] - this.p.z) > 0.3) { const [qx, qy] = this.stick(aim[0], aim[1]); await this.tick(qx, qy, 0); }
      else await this.tick();
      if (VERBOSE && i % 30 === 0) console.log(`      t${i} me ${f2(this.p)} them (${q[0].toFixed(1)}, ${q[2].toFixed(1)}) d ${d.toFixed(1)} aim (${aim[0].toFixed(1)}, ${aim[1].toFixed(1)}) ${S.TL.state}`);
      this.maxD = Math.max(this.maxD || 0, d); this.minD = Math.min(this.minD == null ? 1e9 : this.minD, d);
    }
    throw new Error('followed for too long');
  }
}

const SIGILS = { 'sigil-sky': 1, 'sigil-deep': 1, 'sigil-speed': 1 };
const S0 = { 'echo-1': 1, 'echo-2': 1, 'echo-3': 1, 'echo-4': 1, 'echo-5': 1 };
const S1 = { 'echo-6': 1, 'echo-7': 1, 'echo-8': 1, 'echo-9': 1, 'echo-10': 1 };
const S2_12 = { 'echo-11': 1, 'echo-12': 1 }, S2_14 = Object.assign({ 'echo-13': 1, 'echo-14': 1 }, S2_12), S2_ALL = Object.assign({ 'echo-15': 1, 'strangers-hood': 1 }, S2_14);
const OPEN = { 'met.wren': true, 'vault.opened': true };
const DONE0 = Object.assign({}, OPEN, { 'hunt.started': true, 'hunt.tuned': true, 'hunt.complete': true });
const DONE1 = Object.assign({}, DONE0, { 's1.started': true, 's1.complete': true });
const HAVE1 = Object.assign({ crown: 1, 'founders-mantle': 1, 'paper-crown': 1 }, SIGILS, S0, S1);
const IN_S2 = (inv) => ({ flags: Object.assign({}, DONE1, { 's2.started': true }), inv: Object.assign({}, HAVE1, inv) });
const SEEDS = {
  start: { flags: DONE0, inv: Object.assign({ crown: 1, 'founders-mantle': 1 }, SIGILS, S0) },
  parallel: { flags: Object.assign({}, OPEN, { 'hunt.started': true }), inv: Object.assign({ crown: 1, 'echo-1': 1 }, SIGILS) },
  complete: { flags: DONE1, inv: HAVE1 },
  silent: { flags: OPEN, inv: Object.assign({ crown: 1 }, SIGILS) },
  postcard: { flags: DONE1, inv: HAVE1 },
  tail: IN_S2(S2_12),
  spotted: IN_S2(S2_12),
  lost: IN_S2(S2_12),
  meet: IN_S2(S2_14),
  complete2: { flags: Object.assign({}, DONE1, { 's2.started': true, 's2.complete': true }), inv: Object.assign({}, HAVE1, S2_ALL) },
};
const SCENARIOS = {
  // the first hunt is done: the goal line points at the drawing, which starts Season 1 and gives Echo VI's riddle
  start: async (b, ui) => {
    if (!/crayon drawing/.test(ui.goal)) throw new Error(`the goal line does not point at the drawing: "${ui.goal}"`);
    await b.toDrawing(); await b.use();
    if (!b.flag('s1.started')) throw new Error('the drawing did not start Season 1');
    if (!/^Echo VI:/.test(ui.goal)) throw new Error(`the goal line is not Echo VI's riddle: "${ui.goal}"`);
    if (!ui.banners.some((t) => /SEASON 1/.test(t))) throw new Error('no Season 1 banner');
    b.note = `goal: ${ui.goal.slice(0, 60)}...`;
  },
  // a hunt still under way: the drawing starts Season 1 too, but the goal line stays on the first hunt's next Echo
  parallel: async (b, ui) => {
    await b.toDrawing(); await b.use();
    if (!b.flag('s1.started')) throw new Error('the drawing did not start Season 1');
    if (!/^Echo II:/.test(ui.goal)) throw new Error(`the goal line left the first hunt: "${ui.goal}"`);
  },
  // Season 1 done: the drawing says so, and the goal line has moved on to the postcard beside it
  complete: async (b, ui) => {
    if (!/postcard/.test(ui.goal)) throw new Error(`the goal line: "${ui.goal}"`);
    await b.toDrawing(); await b.use();
    if (!ui.said.some((t) => /The door it shows is open/.test(t))) throw new Error('the drawing did not say it is open');
  },
  // before the Echo Stone has woken the hunt, the drawing and the postcard only hum
  silent: async (b, ui) => {
    await b.toDrawing(); await b.use();
    await b.go(2.5, -2.9); await b.use();
    if (b.flag('s1.started') || b.flag('s2.started')) throw new Error('a season started before the hunt');
    if (ui.said.filter((t) => /hums/.test(t)).length < 2) throw new Error('the drawing and the postcard did not both hum');
  },
  // Season 2 starts at the postcard, and the goal line gives Echo XI's riddle
  postcard: async (b, ui) => {
    await b.toPostcard(); await b.use();
    if (!b.flag('s2.started')) throw new Error('the postcard did not start Season 2');
    if (!ui.banners.some((t) => /SEASON 2/.test(t))) throw new Error('no Season 2 banner');
    if (!/^Echo XI:/.test(ui.goal)) throw new Error(`the goal line is not Echo XI's riddle: "${ui.goal}"`);
    b.note = `goal: ${ui.goal.slice(0, 60)}...`;
  },
  // Echo XII found: the stranger hums by the fountain. Walk up, then follow 10 m behind, through all three
  // looks back, to the Skyreach portal; Echo XIII hangs where they passed
  tail: async (b, ui) => {
    const S = b.S2;
    if (S.TL.state !== 'idle') throw new Error(`the stranger is not waiting by the gate (${S.TL.state})`);
    await b.toFountain();
    await b.until(() => S.TL.state === 'walk', 3, 'the stranger to set off');
    if (!/Follow the stranger/.test(ui.goal)) throw new Error(`the goal line: "${ui.goal}"`);
    const end = await b.follow(10, 200);
    if (end !== 'done') throw new Error(`the walk ended "${end}": ${ui.toasts.slice(-2).join(' | ')}`);
    const looks = ui.toasts.filter((t) => /admire a planter/.test(t)).length;
    if (looks !== 3) throw new Error(`${looks} looks back passed, not 3`);
    await b.go(S.ECHO13[0], S.ECHO13[2], 0.5);
    await b.until(() => b.E.profile.data.inv['echo-13'], 3, 'Echo XIII');
    await b.until(() => /^Echo XIV:/.test(ui.goal), 6, 'Echo XIV\'s riddle');
    b.note = `kept ${b.minD.toFixed(1)} to ${b.maxD.toFixed(1)} m behind; goal: ${ui.goal.slice(0, 40)}...`;
  },
  // too close: 5 m behind at the first look back, and they slip away, back to the fountain
  spotted: async (b, ui) => {
    const S = b.S2;
    await b.toFountain();
    await b.until(() => S.TL.state === 'walk', 3, 'the stranger to set off');
    const end = await b.follow(5, 60);
    if (end !== 'gone' || !ui.toasts.some((t) => /straight at you/.test(t))) throw new Error(`not seen: "${end}"; ${ui.toasts.slice(-2).join(' | ')}`);
    await b.until(() => S.TL.state === 'idle', 6, 'the stranger back at the fountain');
    const q = S.stranger.pos;
    if (Math.hypot(q[0] - S.GATE_SPOT[0], q[2] - S.GATE_SPOT[2]) > 0.2) throw new Error('not back at the fountain');
    for (let i = 0; i < 60; i++) await b.tick(0, -127, 0); // (then away, on foot)
  },
  // too far: stand still once they set off, and they are lost
  lost: async (b, ui) => {
    const S = b.S2;
    await b.toFountain();
    await b.until(() => S.TL.state === 'walk', 3, 'the stranger to set off');
    await b.until(() => S.TL.state === 'gone', 20, 'the stranger to be lost');
    if (!ui.toasts.some((t) => /lost the stranger/.test(t))) throw new Error('no word of losing them');
    for (let i = 0; i < 60; i++) await b.tick(0, 127, 0);
  },
  // Echoes XI to XIV found: the stranger waits in the Vault. Talk; they leave Echo XV on the stone and walk out; the
  // hood follows the Echo
  meet: async (b, ui) => {
    const S = b.S2;
    if (!/^Echo XV:/.test(ui.goal)) throw new Error(`the goal line: "${ui.goal}"`);
    for (const [x, z] of [[0, 9], [0, 4], [-1.6, 0.2], [-1.6, -2.2]]) await b.go(x, z);
    await b.use();
    if (!ui.said.some((t) => /You found me/.test(t))) throw new Error('the stranger did not talk');
    await b.go(1.3, -2.4); // (out of their way)
    await b.until(() => S.stranger.pos[2] > 8 || !S.stranger.avatar.root.visible, 12, 'the stranger to walk out');
    await b.go(S.ECHO15[0] + 0.4, S.ECHO15[2], 0.4);
    await b.until(() => b.E.profile.data.inv['echo-15'], 3, 'Echo XV');
    await b.until(() => b.E.profile.data.inv['strangers-hood'], 8, 'the Stranger\'s Hood');
    if (!b.flag('s2.complete')) throw new Error('Season 2 is not complete');
    if (!ui.banners.some((t) => /SEASON 2 COMPLETE/.test(t))) throw new Error('no Season 2 banner');
    for (let i = 0; i < 60; i++) await b.tick(0, -127, 0);
  },
  // Season 2 done: the goal line says so, and the postcard has one more line
  complete2: async (b, ui) => {
    if (!/The Stranger, is complete/.test(ui.goal)) throw new Error(`the goal line: "${ui.goal}"`);
    await b.toPostcard(); await b.use();
    if (!ui.said.some((t) => /Glad you came/.test(t))) throw new Error('no last line on the postcard');
    if (b.S2.stranger.avatar.root.visible) throw new Error('the stranger is still about');
  },
};

mkdirSync(OUT, { recursive: true });
const engine = await sourceEngine();
let bad = 0;
for (const [name, plan] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const seed = SEEDS[name];
  const entry = { coins: 0, inv: Object.assign({}, seed.inv), eq: Object.assign({}, EQ0), flags: Object.assign({}, seed.flags), save: { coins: {}, store: { open: true }, visits: 1 } };
  const spec = { registry, world: WORLD, from: null, entry };
  const U = { goal: '', banners: [], said: [], toasts: [] };
  const ui = { dialog: async (who, lines) => { for (const l of [].concat(lines)) U.said.push(String(l)); }, choice: async () => 0,
    objective: (t) => { U.goal = String(t || ''); }, banner: (t, s) => { U.banners.push(`${t} ${s || ''}`); } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
  E.toast = (t) => { U.toasts.push(String(t)); };
  const b = new Bot(E);
  let err = null;
  try { for (let i = 0; i < 30; i++) await b.tick(); await plan(b, U); } catch (e) { err = e; }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const proof = { format: FORMAT, sim: engine, engine: 'season-bot', world: WORLD, registry, from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: endOf(E.sim.ended), state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'season bot' } };
  writeFileSync(join(OUT, `season-${name}.json`), JSON.stringify(proof));
  if (VERBOSE) console.log(`    said: ${U.said.slice(-3).join(' | ').slice(0, 300)}`);
  if (err) { bad++; console.log(`FAIL ${name}: ${err.message} (tick ${b.t})${b.note ? '; ' + b.note : ''}`); }
  else console.log(`ok   ${name}: ${(b.t / 60).toFixed(1)} s of play${b.note ? '; ' + b.note : ''}`);
  E.world.dispose();
}
console.log(bad ? `${bad} FAILED` : 'ALL CHECKS OK');
process.exitCode = bad ? 1 : 0;
