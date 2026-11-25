// Season 1 of the Founder's hunt (GAME.md: Before the Door), Junction's side, played headlessly by a scripted bot on the
// real physics: the crayon drawing pinned inside the Vault starts the season for anyone whose hunt has begun (and the
// goal line follows it once the first hunt is done), a hunt still under way can start it too without losing its own
// goal line, a finished season says so, and before the hunt begins the drawing only hums. The five Echoes themselves
// are in their worlds' bots (underfoot echo6 and echo10, thyra echo7, pterousa echo8, surf echo9). Each scenario is one
// visit from a seeded state; its proof is written out and must verify like any run.
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
  async tick(qx = 0, qy = 0, bits = 0) { if (this.E.sim.ended) throw new Error('the visit already ended'); this.E.tick(frameFromCodes(qx, qy, QA, bits)); this.t++; await yieldNow(); }
  stick(x, z) { const dx = x - this.p.x, dz = z - this.p.z, d = Math.hypot(dx, dz); if (d < 0.03) return [0, 0]; const k = Math.min(1, d); return [Math.round((dx / d) * 127 * k), Math.round((-dz / d) * 127 * k)]; }
  async go(x, z, r = 0.4, maxS = 30) {
    for (let i = 0; i < maxS * 60; i++) { if (Math.hypot(x - this.p.x, z - this.p.z) < r) return; const [qx, qy] = this.stick(x, z); await this.tick(qx, qy, 0); }
    throw new Error(`walk to (${x}, ${z}): stuck at ${f2(this.p)}`);
  }
  async use() { await this.tick(0, 0, 8); let calm = 0; for (let i = 0; i < 3600 && calm < 40; i++) { await this.tick(); calm = this.E.sim.busy > 0 ? 0 : calm + 1; } }
  // from the arrival into the Vault (its door is at +z) and round the crown's pedestal to the drawing (east, at the back)
  async toDrawing() { for (const [x, z] of [[0, 9], [0, 4], [1.8, 1.0], [3.5, -1.3]]) await this.go(x, z); }
}

const SIGILS = { 'sigil-sky': 1, 'sigil-deep': 1, 'sigil-speed': 1 };
const S0 = { 'echo-1': 1, 'echo-2': 1, 'echo-3': 1, 'echo-4': 1, 'echo-5': 1 };
const S1 = { 'echo-6': 1, 'echo-7': 1, 'echo-8': 1, 'echo-9': 1, 'echo-10': 1 };
const OPEN = { 'met.wren': true, 'vault.opened': true };
const DONE0 = Object.assign({}, OPEN, { 'hunt.started': true, 'hunt.tuned': true, 'hunt.complete': true });
const SEEDS = {
  start: { flags: DONE0, inv: Object.assign({ crown: 1, 'founders-mantle': 1 }, SIGILS, S0) },
  parallel: { flags: Object.assign({}, OPEN, { 'hunt.started': true }), inv: Object.assign({ crown: 1, 'echo-1': 1 }, SIGILS) },
  complete: { flags: Object.assign({}, DONE0, { 's1.started': true, 's1.complete': true }), inv: Object.assign({ crown: 1, 'founders-mantle': 1, 'paper-crown': 1 }, SIGILS, S0, S1) },
  silent: { flags: OPEN, inv: Object.assign({ crown: 1 }, SIGILS) },
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
  complete: async (b, ui) => {
    if (!/Before the Door, is complete/.test(ui.goal)) throw new Error(`the goal line: "${ui.goal}"`);
    await b.toDrawing(); await b.use();
    if (!ui.said.some((t) => /The door it shows is open/.test(t))) throw new Error('the drawing did not say it is open');
  },
  // before the Echo Stone has woken the hunt, the drawing only hums
  silent: async (b, ui) => {
    await b.toDrawing(); await b.use();
    if (b.flag('s1.started')) throw new Error('Season 1 started before the hunt');
    if (!ui.said.some((t) => /hums/.test(t))) throw new Error('the drawing did not hum');
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
  const U = { goal: '', banners: [], said: [] };
  const ui = { dialog: async (who, lines) => { for (const l of [].concat(lines)) U.said.push(String(l)); }, choice: async () => 0,
    objective: (t) => { U.goal = String(t || ''); }, banner: (t, s) => { U.banners.push(`${t} ${s || ''}`); } };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.log(`FAIL ${name}: ${error}`); bad++; continue; }
  E.rec = new RunLog();
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
