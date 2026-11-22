// Levels: worlds made of data, so anyone can create one without being able to run code.
//
// A level is plain JSON: parts (boxes, ramps, cylinders, spheres, cones, plus decorative shapes),
// things (jump pads, boost pads, checkpoints, crumbling and moving platforms, hazards, wind, signs, labels),
// a spawn and a goal flag. checkLevel() turns any input into one canonical form or refuses it.
// compileLevel() pastes that data into ONE fixed world template. The template is the only code, the same
// for every level, so the module's SHA-256 identifies the level and a published level cannot run anything.
// The template is a string literal (never function source), so minifying the engine cannot change it.
//
// Format 2 adds an optional reward: a cosmetic item the level gives for clearing it, described as data (a
// name, a slot and a look made of a few primitives). Its id is the level's id plus '-r', so a creator can
// never mint someone else's item. Levels without a reward stay format 1 and compile exactly as before.
import { canon } from './run.js';
import { sha256hex } from './util.js';

export const LEVEL_FORMAT = 'elsewhere-level/1';
export const LEVEL_FORMAT_2 = 'elsewhere-level/2';
export const REWARD_LIMITS = { name: 24, desc: 120, parts: 16, extent: 0.9 };
export const REWARD_SLOTS = ['head', 'back', 'hand'];
const LOOK_SHAPES = ['box', 'rbox', 'cyl', 'cone', 'sphere', 'torus', 'oct', 'ico'];
export const LEVEL_LIMITS = { parts: 1500, things: 300, coord: 400, size: 120, name: 32, blurb: 90, title: 32, text: 240 };
export const THEME_NAMES = ['day', 'dusk', 'night', 'cave', 'candy'];
const SOLIDS = ['box', 'ramp', 'cyl', 'sphere', 'cone'], DECOR = ['torus', 'oct', 'ico'];
const THINGS = ['pad', 'boost', 'checkpoint', 'crumble', 'mover', 'hazard', 'wind', 'sign', 'label'];

const r2 = (v) => Math.round(v * 100) / 100;
const num = (v, lo, hi) => { if (typeof v !== 'number' || !isFinite(v) || v < lo || v > hi) throw new Error(`number out of range (${lo}..${hi})`); return r2(v); };
const vec = (a, n, lo, hi) => { if (!Array.isArray(a) || a.length !== n) throw new Error(`expected ${n} numbers`); return a.map((v) => num(v, lo, hi)); };
const yawOf = (v) => (v == null ? 0 : ((Math.round(num(v, -720, 720)) % 360) + 360) % 360);
const color = (c, d) => { if (c == null) return d; if (typeof c !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(c)) throw new Error('colours are #rrggbb'); return c.toLowerCase(); };
const text = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const L = LEVEL_LIMITS, RL = REWARD_LIMITS;

// a reward item: cosmetic only, small, made of primitives
function checkReward(r) {
  if (!r || typeof r !== 'object') throw new Error('reward: an object with a name, a slot and a look');
  const name = text(r.name, RL.name);
  if (name.length < 2) throw new Error('reward: the item needs a name');
  if (!REWARD_SLOTS.includes(r.slot)) throw new Error('reward: the slot is head, back or hand');
  const parts = Array.isArray(r.look) ? r.look : [];
  if (!parts.length || parts.length > RL.parts) throw new Error(`reward: the look needs 1 to ${RL.parts} parts`);
  const look = parts.map((p, i) => {
    try {
      if (!p || !LOOK_SHAPES.includes(p.s)) throw new Error('unknown shape ' + (p && p.s));
      const o = { s: p.s, color: color(p.color, '#ffd166') };
      if (p.s === 'torus') { o.r = num(p.r == null ? 0.3 : p.r, 0.02, RL.extent); o.tube = num(p.tube == null ? 0.04 : p.tube, 0.01, 0.3); }
      else if (p.size != null) o.size = vec(p.size, 3, 0.01, RL.extent * 2);
      else if (p.s === 'cyl' || p.s === 'cone') { o.r = num(p.r == null ? 0.2 : p.r, 0.01, RL.extent); o.h = num(p.h == null ? 0.2 : p.h, 0.01, RL.extent * 2); }
      else o.r = num(p.r == null ? 0.2 : p.r, 0.01, RL.extent);
      if (p.pos != null) o.pos = vec(p.pos, 3, -RL.extent, RL.extent);
      if (p.rot != null) o.rot = vec(p.rot, 3, -360, 360);
      if (p.glow) o.glow = num(p.glow, 0, 3);
      if (p.metal) o.metal = num(p.metal, 0, 1);
      return o;
    } catch (e) { throw new Error(`reward look part ${i + 1}: ${e.message}`); }
  });
  return { name, desc: text(r.desc, RL.desc), slot: r.slot, look };
}

// Any input -> { level } in canonical form, or { error }. Unknown fields are dropped.
export function checkLevel(raw) {
  try {
    if (!raw || typeof raw !== 'object') throw new Error('a level is a JSON object');
    const name = text(raw.name, L.name);
    if (name.length < 2) throw new Error('the level needs a name');
    const theme = THEME_NAMES.includes(raw.theme) ? raw.theme : 'day';
    const author = { name: text(raw.author && raw.author.name, 24) || 'Anonymous', key: raw.author && typeof raw.author.key === 'string' && /^[A-Za-z0-9+/=]{20,64}$/.test(raw.author.key) ? raw.author.key : '' };
    const spawn = vec(raw.spawn, 4, -720, 720); spawn[0] = num(spawn[0], -L.coord, L.coord); spawn[1] = num(spawn[1], -L.coord, L.coord); spawn[2] = num(spawn[2], -L.coord, L.coord); spawn[3] = yawOf(spawn[3]);
    const goal = vec(raw.goal, 3, -L.coord, L.coord);
    if (Math.hypot(goal[0] - spawn[0], goal[1] - spawn[1], goal[2] - spawn[2]) < 6) throw new Error('the goal must be at least 6 m from the spawn');
    const parts = (Array.isArray(raw.parts) ? raw.parts : []).map((p, i) => {
      try {
        if (!SOLIDS.includes(p.s) && !DECOR.includes(p.s)) throw new Error('unknown shape ' + p.s);
        const o = { s: p.s, p: vec(p.p, 3, -L.coord, L.coord), z: vec(p.z, 3, 0.05, L.size), y: yawOf(p.y), c: color(p.c, '#8a8fa8') };
        if (p.g) o.g = num(p.g, 0, 3);
        if (p.m) o.m = num(p.m, 0, 1);
        if (p.o != null && p.o < 1) o.o = num(p.o, 0.1, 1);
        if (p.n || DECOR.includes(p.s)) o.n = 1; // decoration: no collider
        return o;
      } catch (e) { throw new Error(`part ${i + 1}: ${e.message}`); }
    });
    if (parts.length > L.parts) throw new Error(`at most ${L.parts} parts`);
    const things = (Array.isArray(raw.things) ? raw.things : []).map((t, i) => {
      try {
        if (!THINGS.includes(t.t)) throw new Error('unknown thing ' + t.t);
        const o = { t: t.t, p: vec(t.p, 3, -L.coord, L.coord) };
        if (t.t === 'pad') { o.power = num(t.power == null ? 17 : t.power, 8, 30); if (t.push) o.push = vec(t.push, 2, -12, 12); }
        if (t.t === 'boost' || t.t === 'checkpoint' || t.t === 'sign') o.y = yawOf(t.y);
        if (['crumble', 'mover', 'hazard', 'wind'].includes(t.t)) o.z = vec(t.z, 3, 0.2, 60);
        if (t.t === 'crumble' || t.t === 'mover') o.c = color(t.c, t.t === 'crumble' ? '#ff9f5a' : '#7fe0c8');
        if (t.t === 'mover') { o.to = vec(t.to, 3, -L.coord, L.coord); o.speed = num(t.speed == null ? 2.5 : t.speed, 0.5, 8); }
        if (t.t === 'wind') o.f = vec(t.f, 3, -30, 30);
        if (t.t === 'sign') { o.title = text(t.title, L.title); o.text = text(t.text, L.text); }
        if (t.t === 'label') o.text = text(t.text, L.title) || '…';
        return o;
      } catch (e) { throw new Error(`thing ${i + 1}: ${e.message}`); }
    });
    if (things.length > L.things) throw new Error(`at most ${L.things} things`);
    let low = spawn[1];
    for (const p of parts) if (!p.n) low = Math.min(low, p.p[1] - p.z[1] / 2);
    for (const t of things) low = Math.min(low, t.p[1]);
    const reward = raw.reward == null ? null : checkReward(raw.reward);
    const level = {
      format: reward ? LEVEL_FORMAT_2 : LEVEL_FORMAT, name, blurb: text(raw.blurb, L.blurb), author, theme, color: color(raw.color, '#ffd166'),
      spawn, goal, killY: r2(Math.max(-L.coord - 20, low - 15)), parts, things,
    };
    if (reward) level.reward = reward;
    return { level };
  } catch (e) { return { error: e.message }; }
}

// The level's id is derived from its content, so the same level always has the same id.
export async function levelId(level) { return 'lv-' + (await sha256hex(canon(Object.assign({}, level, { id: undefined })))).slice(0, 10); }
export async function compileLevel(level) {
  const data = Object.assign({}, level, { id: await levelId(level) });
  const literal = JSON.stringify(canon(data));
  const textOut = (data.format === LEVEL_FORMAT_2 ? TEMPLATE_2 : TEMPLATE).replace('__DATA__', () => literal); // a function, so '$&' in level text stays literal
  return { id: data.id, text: textOut, sha256: await sha256hex(textOut) };
}

// ---- the one template every level runs on ----
const TEMPLATE = `// An Elsewhere community level (format elsewhere-level/1), written by the engine's level compiler.
// The code below is the same for every level; only the DATA line differs, so a level cannot run code of its own.
const DATA = JSON.parse(__DATA__);
const THEMES = {
  day: { skyTop: '#2a64cf', skyHorizon: '#bfe3fb', skyBottom: '#8fc2ea', skySharp: 0.7, sunDir: [0.35, 0.75, -0.55], sunColor: '#fff2c8', sunSize: 2, sunLight: '#fff4e0', sunIntensity: 3.0, hemiSky: '#cfe6ff', hemiGround: '#7a9a6a', hemiIntensity: 1.5, fog: [140, 560], fogColor: '#bfe3fb', stars: 0, bloom: 0.35, exposure: 0.95, clouds: { y: -30, color: '#f4f9ff', opacity: 0.75 } },
  dusk: { skyTop: '#0c0a2e', skyHorizon: '#ff7b8a', skyBottom: '#2a1240', skySharp: 0.5, sunDir: [0.55, 0.3, -0.78], sunColor: '#ffb070', sunSize: 3, sunLight: '#ffd0b0', sunIntensity: 2.8, hemiSky: '#b9c4ff', hemiGround: '#6a4a8a', hemiIntensity: 1.9, fog: [70, 330], fogColor: '#c25e86', stars: 0.75, bloom: 0.6, exposure: 1.2, clouds: { y: -26, color: '#ffb3d0', opacity: 0.55 } },
  night: { skyTop: '#020008', skyHorizon: '#d4207f', skyBottom: '#0a0214', skySharp: 0.32, sunDir: [0.0, 0.07, -1], sunColor: '#ff5ab4', sunSize: 0.02, sunLight: '#ff9ad6', sunIntensity: 1.1, hemiSky: '#7a5cff', hemiGround: '#1a0830', hemiIntensity: 1.25, fog: [160, 900], fogColor: '#2a0a3c', stars: 0.95, bloom: 0.85, exposure: 1.1 },
  cave: { skyTop: '#020409', skyHorizon: '#04090e', skyBottom: '#010204', skySharp: 0.6, sunDir: [0.2, 0.95, -0.25], sunColor: '#000000', sunSize: 1, sunLight: '#5470ff', sunIntensity: 0, hemiSky: '#5a92b8', hemiGround: '#3a2458', hemiIntensity: 1.6, fog: [24, 140], fogColor: '#04090e', stars: 0, bloom: 0.8, exposure: 1.3 },
  candy: { skyTop: '#2f6fd6', skyHorizon: '#c4f1ff', skyBottom: '#a8e6ff', skySharp: 0.6, sunDir: [-0.4, 0.7, -0.5], sunColor: '#fff0d0', sunSize: 2.2, sunLight: '#fff2dd', sunIntensity: 3.0, hemiSky: '#d6ecff', hemiGround: '#8a7fb8', hemiIntensity: 1.5, fog: [120, 460], fogColor: '#c4f1ff', stars: 0, bloom: 0.45, exposure: 1.0, clouds: { y: -22, color: '#ffffff', opacity: 0.85 } },
};
const MUSIC = {
  day: { root: 60, scale: 'major', bpm: 88, progression: [0, 3, 4, 5], sparkle: 0.3, bright: 2200, wave: 'triangle' },
  dusk: { root: 57, scale: 'lydian', bpm: 66, progression: [0, 4, 5, 3], sparkle: 0.25, bright: 1600 },
  night: { root: 57, scale: 'minor', bpm: 110, progression: [0, 5, 2, 6], sparkle: 0.3, bright: 2600, pulse: true, wave: 'sawtooth' },
  cave: { root: 52, scale: 'phrygian', bpm: 56, progression: [0, 1, 0, 6], sparkle: 0.14, bright: 900, wave: 'sine' },
  candy: { root: 62, scale: 'lydian', bpm: 118, progression: [0, 4, 5, 3], sparkle: 0.5, bright: 2600, wave: 'triangle', pulse: true },
};
const D = Math.PI / 180;
export default {
  id: DATA.id, name: DATA.name, kind: 'level', author: DATA.author.name, version: 1, blurb: DATA.blurb, color: DATA.color,
  spawn: { pos: [DATA.spawn[0], DATA.spawn[1] + 1, DATA.spawn[2]], yaw: DATA.spawn[3] },
  killY: DATA.killY, rules: { deny: ['board'] }, theme: THEMES[DATA.theme], music: MUSIC[DATA.theme], items: {},
  build(w) {
    const S = DATA.spawn, G = DATA.goal, fx = Math.sin(S[3] * D), fz = Math.cos(S[3] * D);
    // the start: a platform, with the way home behind you
    w.box({ pos: [S[0] - fx * 4, S[1] - 0.3, S[2] - fz * 4], size: [7, 0.6, 12], yaw: S[3], color: '#3b3f63' });
    w.portal({ pos: [S[0] - fx * 8, S[1], S[2] - fz * 8], yaw: S[3], to: 'hub', label: 'Junction', arrive: 8 });
    for (const p of DATA.parts) {
      const o = { pos: p.p, yaw: p.y, color: p.c, glow: p.g, metal: p.m, opacity: p.o, collide: p.n ? false : undefined, shadow: p.n ? false : undefined };
      if (p.s === 'box') w.box(Object.assign(o, { size: p.z }));
      else if (p.s === 'ramp') w.ramp(Object.assign(o, { size: p.z }));
      else if (p.s === 'cyl') w.cylinder(Object.assign(o, { radius: p.z[0] / 2, height: p.z[1] }));
      else if (p.s === 'sphere') w.sphere(Object.assign(o, { radius: p.z[0] / 2 }));
      else if (p.s === 'cone') w.cone(Object.assign(o, { radius: p.z[0] / 2, height: p.z[1] }));
      else w.model({ pos: p.p, yaw: p.y, parts: [{ s: p.s, r: p.z[0] / 2, tube: p.z[1] / 2, color: p.c, glow: p.g, metal: p.m }] });
    }
    for (const t of DATA.things) {
      if (t.t === 'pad') w.jumpPad({ pos: t.p, power: t.power, push: t.push ? [t.push[0], 0, t.push[1]] : undefined });
      else if (t.t === 'boost') w.boostPad({ pos: t.p, yaw: t.y });
      else if (t.t === 'checkpoint') w.checkpoint({ pos: t.p, yaw: t.y });
      else if (t.t === 'crumble') w.crumble(w.box({ pos: t.p, size: t.z, color: t.c }), {});
      else if (t.t === 'mover') w.mover(w.box({ pos: t.p, size: t.z, color: t.c, glow: 0.3 }), { path: [t.p, t.to], speed: t.speed });
      else if (t.t === 'hazard') { w.hazard({ pos: t.p, size: t.z }); w.box({ pos: t.p, size: t.z, color: '#ff3b5c', glow: 1.2, opacity: 0.5, collide: false, shadow: false }); }
      else if (t.t === 'wind') { w.wind({ pos: t.p, size: t.z, force: t.f }); w.particles({ pos: [t.p[0], t.p[1] - t.z[1] / 2, t.p[2]], area: t.z, count: 24, color: '#ffffff', size: 0.1, kind: 'rise', speed: 1.5 }); }
      else if (t.t === 'sign') w.sign({ pos: t.p, yaw: t.y, title: t.title, text: t.text, width: 3 });
      else if (t.t === 'label') w.label({ pos: t.p, text: t.text, size: 0.5 });
    }
    // the goal flag; the clock starts when you leave the start
    w.cylinder({ pos: [G[0], G[1] + 2, G[2]], radius: 0.08, height: 4, color: '#e8ecff', metal: 0.5 });
    w.box({ pos: [G[0] + 0.62, G[1] + 3.5, G[2]], size: [1.2, 0.8, 0.06], color: '#ffd166', glow: 1.2, collide: false });
    w.cylinder({ pos: [G[0], G[1] + 0.05, G[2]], radius: 1.6, height: 0.1, color: '#ffd166', glow: 1.4, collide: false, shadow: false });
    let started = false, done = false;
    const near = (p, r) => Math.hypot(p[0] - S[0], p[2] - S[2]) < r && Math.abs(p[1] - 1 - S[1]) < 2;
    w.on('enter', () => w.objective('Reach the golden flag. The clock starts when you leave the start.'));
    w.on('tick', () => {
      const p = w.player.pos;
      if (!started && !done && !near(p, 2.5)) { started = true; w.timer.start(); }
      if (done && near(p, 1.5)) { done = false; started = false; w.timer.cancel(); w.objective('Again! The clock starts when you leave the start.'); }
    });
    w.zone({ pos: [G[0], G[1] + 1.2, G[2]], radius: 2, onEnter: () => {
      if (done || !started) return;
      done = true;
      const t = w.timer.stop();
      w.record('time', t);
      const best = w.store.get('best', null);
      if (best == null || t < best) w.store.set('best', t);
      w.store.set('cleared', true);
      w.sound('win');
      w.burst([G[0], G[1] + 3, G[2]], { color: ['#ffd166', '#ffffff', '#7cf6ff'], count: 90, speed: 10, life: 1.4 });
      w.banner('CLEARED', w.fmtTime(t) + (best == null || t < best ? ' · your best' : ' · best ' + w.fmtTime(best)));
      w.objective('Cleared! Walk back to the start to try again, or take the portal home.');
    } });
  },
};
`;

// ---- format 2: the same template, plus the reward item and the line that gives it on a clear ----
const swap = (s, a, b) => { if (!s.includes(a)) throw new Error('level template 2: missing ' + a.slice(0, 40)); return s.replace(a, () => b); };
const TEMPLATE_2 = [
  ['(format elsewhere-level/1)', '(format elsewhere-level/2: with a reward item)'],
  ['const D = Math.PI / 180;', `const D = Math.PI / 180;
// the reward: cosmetic only, named after the level, and credited to the level's creator
const REWARD_ID = DATA.id + '-r';
const REWARD = { name: DATA.reward.name, desc: DATA.reward.desc, slot: DATA.reward.slot, traits: ['cosmetic'], rarity: 'creator', look: DATA.reward.look, by: DATA.author.name, from: DATA.name };`],
  ['items: {},', 'items: { [REWARD_ID]: REWARD },'],
  ["      w.store.set('cleared', true);", "      w.store.set('cleared', true);\n      if (!w.has(REWARD_ID)) w.give(REWARD_ID);"],
].reduce((t, [a, b]) => swap(t, a, b), TEMPLATE);

