// The Builder: make a level inside the game, keyboard first (a mouse is optional).
//
// It edits a level (format elsewhere-level/1, see level.js) as plain data and draws it live with three.js
// meshes of its own. "Test play" hands the level to E.playLevel, exactly like a level pasted at the Creator's
// Gate; publishing then goes through the Gate as before, with the creator's verified clear run.
//
// Builder mode is UI only. While it is open, the world is paused (main.js runs no ticks) and hidden, game
// input is off (E.input.setEnabled(false)) and the Builder reads the keyboard itself. Its listeners exist only
// while it is open, so none of this runs during normal play, and nothing here touches the simulation.
import * as THREE from 'three';
import { checkLevel, compileLevel, LEVEL_FORMAT, LEVEL_LIMITS, THEME_NAMES, REWARD_LIMITS } from './level.js';
import { mat, labelSprite, textCanvas, canvasTexture, wrapLines } from './render.js';
import { buildLook } from './items.js';
import { WALK } from './player.js';
import { ensureKey } from './identity.js';
import { profile } from './profile.js';
import { DEG, clamp, damp, dampAngle } from './util.js';

const L = LEVEL_LIMITS;
const STORE = 'elsewhere_builder_v1', MAX_SLOTS = 8;
const GRIDS = [1, 0.5, 0.25], GLOWS = [0, 0.8, 2];
const PALETTE = [['#5b5f97', 'slate'], ['#4b4f83', 'indigo'], ['#3b3f63', 'night'], ['#8a8fa8', 'stone'], ['#e9ecff', 'snow'], ['#ffd6a5', 'sand'], ['#ffd166', 'gold'], ['#ff9f5a', 'amber'],
  ['#ff7eb6', 'pink'], ['#ff5d8f', 'rose'], ['#c9a7ff', 'lilac'], ['#7cf6ff', 'cyan'], ['#4fb3ff', 'sky'], ['#62e39b', 'mint'], ['#7a9a6a', 'moss'], ['#a0785a', 'wood']];
// Rewards: ready-made looks for the item a level gives for clearing it, in two colours the creator picks.
// Slot 'head' sits on top of the head, 'back' on the upper back (looks extend backwards), 'hand' from the grip up.
const REWARDS = {
  crown: { label: 'Crown', slot: 'head', look: (a, b) => [
    { s: 'cyl', r: 0.23, h: 0.12, pos: [0, 0.06, 0], color: a, metal: 0.8 },
    ...[0, 72, 144, 216, 288].map((d) => ({ s: 'cone', r: 0.05, h: 0.14, pos: [r2(Math.sin(d * DEG) * 0.2), 0.18, r2(Math.cos(d * DEG) * 0.2)], color: a, metal: 0.8 })),
    { s: 'sphere', r: 0.04, pos: [0, 0.07, 0.23], color: b, glow: 1.2 }, { s: 'sphere', r: 0.03, pos: [0.16, 0.07, 0.16], color: b, glow: 1.2 }, { s: 'sphere', r: 0.03, pos: [-0.16, 0.07, 0.16], color: b, glow: 1.2 }] },
  horns: { label: 'Horns', slot: 'head', look: (a, b) => [
    { s: 'cone', r: 0.07, h: 0.3, pos: [0.2, 0.1, 0], rot: [0, 0, -30], color: a }, { s: 'cone', r: 0.07, h: 0.3, pos: [-0.2, 0.1, 0], rot: [0, 0, 30], color: a },
    { s: 'sphere', r: 0.03, pos: [0.28, 0.24, 0], color: b, glow: 0.8 }, { s: 'sphere', r: 0.03, pos: [-0.28, 0.24, 0], color: b, glow: 0.8 }] },
  wizard: { label: 'Wizard hat', slot: 'head', look: (a, b) => [
    { s: 'cyl', r: 0.34, h: 0.03, pos: [0, 0.02, 0], color: a }, { s: 'cone', r: 0.2, h: 0.5, pos: [0, 0.28, 0], color: a },
    { s: 'torus', r: 0.2, tube: 0.03, pos: [0, 0.07, 0], rot: [90, 0, 0], color: b }, { s: 'oct', r: 0.05, pos: [0, 0.22, 0.15], color: b, glow: 1.5 }] },
  halo: { label: 'Halo', slot: 'head', look: (a, b) => [
    { s: 'torus', r: 0.22, tube: 0.03, pos: [0, 0.3, 0], rot: [90, 0, 0], color: a, glow: 1.8 }, { s: 'oct', r: 0.04, pos: [0, 0.3, 0.22], color: b, glow: 2 }] },
  wings: { label: 'Wings', slot: 'back', look: (a, b) => [
    { s: 'box', size: [0.6, 0.34, 0.04], pos: [0.33, 0.06, -0.06], rot: [0, -25, -14], color: a }, { s: 'box', size: [0.6, 0.34, 0.04], pos: [-0.33, 0.06, -0.06], rot: [0, 25, 14], color: a },
    { s: 'box', size: [0.4, 0.18, 0.05], pos: [0.27, -0.12, -0.06], rot: [0, -25, -24], color: b }, { s: 'box', size: [0.4, 0.18, 0.05], pos: [-0.27, -0.12, -0.06], rot: [0, 25, 24], color: b }] },
  banner: { label: 'Banner', slot: 'back', look: (a, b) => [
    { s: 'cyl', r: 0.025, h: 0.96, pos: [0, 0.36, -0.08], color: b }, { s: 'box', size: [0.42, 0.28, 0.02], pos: [0.22, 0.68, -0.08], color: a },
    { s: 'sphere', r: 0.045, pos: [0, 0.87, -0.08], color: b, metal: 0.8 }] },
  wand: { label: 'Wand', slot: 'hand', look: (a, b) => [
    { s: 'cyl', r: 0.022, h: 0.5, pos: [0, 0.22, 0], color: b }, { s: 'oct', r: 0.08, pos: [0, 0.52, 0], color: a, glow: 1.6 },
    { s: 'torus', r: 0.05, tube: 0.012, pos: [0, 0.08, 0], rot: [90, 0, 0], color: a }] },
  sword: { label: 'Sword', slot: 'hand', look: (a, b) => [
    { s: 'cyl', r: 0.03, h: 0.2, pos: [0, 0, 0], color: b }, { s: 'box', size: [0.22, 0.04, 0.06], pos: [0, 0.11, 0], color: a, metal: 0.8 },
    { s: 'box', size: [0.05, 0.75, 0.02], pos: [0, 0.5, 0], color: '#e8eef8', metal: 0.9 }, { s: 'sphere', r: 0.04, pos: [0, -0.11, 0], color: a, metal: 0.8 }] },
};
// a reward in the canonical form checkLevel gives it, or null if it does not check out
function canonReward(r) {
  if (!r) return null;
  const c = checkLevel({ name: 'reward', spawn: [0, 0, 0, 0], goal: [0, 0, 100], reward: r });
  return c.error ? null : c.level.reward;
}
// which ready-made look (and colours) a saved reward was made from, if any
function matchPreset(rw) {
  const cols = [...new Set(rw.look.map((p) => p.color))];
  for (const [k, p] of Object.entries(REWARDS)) {
    if (p.slot !== rw.slot) continue;
    for (const a of cols) for (const b of cols.concat(['#ffd166'])) {
      const t = canonReward({ name: rw.name, desc: rw.desc, slot: p.slot, look: p.look(a, b) });
      if (t && JSON.stringify(t.look) === JSON.stringify(rw.look)) return { preset: k, a, b };
    }
  }
  return null;
}
// Platforms (top: 1) put their top surface at the cursor, so you build floors at the height you stand on.
// Everything else stands on the cursor.
const PIECES = [
  { id: 'box', key: '1', name: 'Box', short: 'Box', part: 'box', size: [4, 1, 4], top: 1, color: '#5b5f97' },
  { id: 'ramp', key: '2', name: 'Ramp', short: 'Ramp', part: 'ramp', size: [4, 2, 6], color: '#ff7eb6', yaw: 180 },
  { id: 'cyl', key: '3', name: 'Cylinder', short: 'Cylinder', part: 'cyl', size: [3, 1, 3], top: 1, round: 1, color: '#4b4f83' },
  { id: 'sphere', key: '4', name: 'Sphere', short: 'Sphere', part: 'sphere', size: [2, 2, 2], ball: 1, color: '#ffd166' },
  { id: 'pad', key: '5', name: 'Jump pad', short: 'Pad', thing: 'pad', yaw: 180 },
  { id: 'boost', key: '6', name: 'Boost pad', short: 'Boost', thing: 'boost', yaw: 180 },
  { id: 'checkpoint', key: '7', name: 'Checkpoint', short: 'Checkpt', thing: 'checkpoint', yaw: 180 },
  { id: 'crumble', key: '8', name: 'Crumbling tile', short: 'Crumble', thing: 'crumble', size: [2.4, 0.4, 2.4], top: 1, color: '#ff9f5a', swap: 1 },
  { id: 'mover', key: '9', name: 'Moving platform', short: 'Mover', thing: 'mover', size: [3, 0.5, 3], top: 1, color: '#7cf6ff', swap: 1 },
  { id: 'hazard', key: '0', name: 'Hazard', short: 'Hazard', thing: 'hazard', size: [4, 1, 1], swap: 1 },
  { id: 'sign', key: '⇧1', name: 'Sign', short: 'Sign', thing: 'sign' },
  { id: 'goal', key: '⇧2', name: 'Goal flag', short: 'Flag', marker: 'goal' },
  { id: 'spawn', key: '⇧3', name: 'Spawn point', short: 'Start', marker: 'spawn', yaw: 180 },
  { id: 'cone', key: '⇧4', name: 'Cone', short: 'Cone', part: 'cone', size: [2, 3, 2], round: 1, color: '#c9a7ff' },
  { id: 'wind', key: '⇧5', name: 'Updraft', short: 'Updraft', thing: 'wind', size: [4, 6, 4], swap: 1 },
  { id: 'label', key: '⇧6', name: 'Label', short: 'Label', thing: 'label' },
];
const HELP = [
  ['Move', 'W A S D or arrows · R F or PgUp PgDn: up, down · G: grid size'],
  ['Pieces', '1–9, 0 · Shift+1–6 · Tab: next one'],
  ['Shape', 'Q E: turn 15° · + −: size · Shift+W A S D R F: stretch · C: colour · B: glow · X: copy the piece under the cursor'],
  ['Build', 'Enter or Space: place · Backspace or Delete: remove · Z: undo · Y: redo'],
  ['View', 'J L: turn · I K: tilt · U O: zoom · T: top view · Home: reset'],
  ['Level', 'P: test play · Esc: menu (name, theme, drafts, export, publish, exit) · H: hide this'],
];

// ---------------- level data ----------------
const r2 = (v) => Math.round(v * 100) / 100;
const yaw360 = (v) => ((Math.round(v) % 360) + 360) % 360;
const fmt = (v) => String(r2(v));
const colorName = (c) => { const p = PALETTE.find((x) => x[0] === c); return p ? p[1] : c; };
const okNum = (v) => typeof v === 'number' && isFinite(v) && Math.abs(v) <= L.coord;
const spawnOf = (s) => (Array.isArray(s) && s.length === 4 && s.slice(0, 3).every(okNum) && typeof s[3] === 'number' && Math.abs(s[3]) <= 720 ? [r2(s[0]), r2(s[1]), r2(s[2]), yaw360(s[3])] : null);
const goalOf = (g) => (Array.isArray(g) && g.length === 3 && g.every(okNum) ? g.map(r2) : null);
const starter = (name) => ({
  format: LEVEL_FORMAT, name: name || 'My Level', blurb: '', theme: 'day', color: '#ffd166',
  spawn: [0, 0, 0, 180], goal: [0, 0, -14],
  parts: [{ s: 'box', p: [0, -0.5, -9], z: [6, 1, 14], y: 0, c: '#5b5f97' }], things: [],
});
// one entry in exactly the form checkLevel() gives it (or an error), so the Builder only ever holds canonical data
function canonEntry(e, isPart) {
  const c = checkLevel({ name: 'entry', spawn: [0, 0, 0, 0], goal: [0, 0, 100], [isPart ? 'parts' : 'things']: [e] });
  if (c.error) throw new Error(c.error.replace(/^(part|thing) 1: /, ''));
  return (isPart ? c.level.parts : c.level.things)[0];
}
// any stored or imported draft -> a draft the Builder can edit (bad entries are dropped, not fatal)
function sanitize(raw) {
  raw = raw && typeof raw === 'object' ? raw : {};
  const d = starter();
  const keep = (list, isPart, max) => (Array.isArray(list) ? list : []).slice(0, max).map((e) => { try { return canonEntry(e, isPart); } catch (err) { return null; } }).filter(Boolean);
  return {
    format: LEVEL_FORMAT, name: typeof raw.name === 'string' ? raw.name.slice(0, L.name) : d.name, blurb: typeof raw.blurb === 'string' ? raw.blurb.slice(0, L.blurb) : '',
    theme: THEME_NAMES.includes(raw.theme) ? raw.theme : 'day', color: typeof raw.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.color) ? raw.color.toLowerCase() : '#ffd166',
    spawn: spawnOf(raw.spawn) || d.spawn, goal: goalOf(raw.goal) || d.goal,
    parts: Array.isArray(raw.parts) ? keep(raw.parts, true, L.parts) : d.parts, things: keep(raw.things, false, L.things),
    reward: canonReward(raw.reward) || undefined,
  };
}
function pieceOf(e, isPart) {
  if (isPart) return PIECES.find((p) => p.part === e.s) || null;
  return PIECES.find((p) => p.thing === e.t) || null;
}
function describe(e, isPart) {
  const pc = pieceOf(e, isPart), name = pc ? pc.name : 'Decoration (' + e.s + ')';
  if (isPart) {
    const size = e.s === 'sphere' ? fmt(e.z[0]) + ' m across' : e.s === 'cyl' || e.s === 'cone' ? `${fmt(e.z[0])} m across, ${fmt(e.z[1])} m tall` : `${e.z.map(fmt).join(' × ')} m`;
    return `${name} ${size}${e.y ? ` · turned ${e.y}°` : ''} · ${colorName(e.c)}${e.g ? ' · glowing' : ''}${e.n ? ' · no collider' : ''}`;
  }
  switch (e.t) {
    case 'pad': return `Jump pad · power ${e.power}${e.push ? ` · throw ${fmt(Math.hypot(e.push[0], e.push[1]))} m/s` : ''}`;
    case 'sign': return `Sign "${e.title || e.text.slice(0, 24)}"`;
    case 'label': return `Label "${e.text}"`;
    case 'mover': return `Moving platform ${e.z.map(fmt).join(' × ')} m · travels ${fmt(Math.hypot(e.to[0] - e.p[0], e.to[1] - e.p[1], e.to[2] - e.p[2]))} m`;
    case 'crumble': case 'hazard': case 'wind': return `${name} ${e.z.map(fmt).join(' × ')} m`;
    default: return `${name}${e.y ? ` · facing ${e.y}°` : ''}`;
  }
}

// ---------------- previews: what the level template builds, drawn without physics ----------------
const GEO = {};
function geo(k) {
  if (GEO[k]) return GEO[k];
  let g;
  if (k === 'box') g = new THREE.BoxGeometry(1, 1, 1);
  else if (k === 'cyl') g = new THREE.CylinderGeometry(1, 1, 1, 28);
  else if (k === 'cyl8') g = new THREE.CylinderGeometry(1, 1, 1, 8);
  else if (k === 'sphere') g = new THREE.SphereGeometry(1, 28, 18);
  else if (k === 'ico') g = new THREE.IcosahedronGeometry(1, 0);
  else if (k === 'cone') g = new THREE.ConeGeometry(1, 1, 24);
  else if (k === 'capsule') g = new THREE.CapsuleGeometry(0.4, 1.0, 4, 12);
  else if (k === 'ring') g = new THREE.TorusGeometry(2.4, 0.22, 12, 48);
  else if (k === 'edges') g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  else if (k === 'arrow') { // a flat arrow on the ground pointing along +z
    const s = new THREE.Shape(); s.moveTo(0, 1.1); s.lineTo(0.55, 0.35); s.lineTo(0.2, 0.35); s.lineTo(0.2, -0.5); s.lineTo(-0.2, -0.5); s.lineTo(-0.2, 0.35); s.lineTo(-0.55, 0.35); s.closePath();
    g = new THREE.ShapeGeometry(s); g.rotateX(Math.PI / 2);
  } else if (k === 'ramp') { // the same wedge the world builds: full height at +z, zero at -z
    const v = [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]];
    const f = [[0, 2, 1], [0, 3, 2], [3, 4, 5], [3, 5, 2], [0, 1, 5], [0, 5, 4], [0, 4, 3], [1, 2, 5]];
    const pos = []; for (const t of f) for (const i of t) pos.push(...v[i]);
    g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  }
  g.userData.keep = true;
  return (GEO[k] = g);
}
// ghosts (the piece at the cursor) are see-through and faintly lit
const M = (color, o, ghost) => (ghost ? mat(color, { glow: Math.max(0.5, (o && o.glow) || 0), opacity: 0.42 }) : mat(color, o || {}));
function mesh(k, m, o = {}) {
  const x = new THREE.Mesh(typeof k === 'string' ? geo(k) : k, m);
  if (o.pos) x.position.set(o.pos[0], o.pos[1], o.pos[2]);
  if (o.scale) x.scale.set(o.scale[0], o.scale[1], o.scale[2]);
  if (o.yaw) x.rotation.y = o.yaw * DEG;
  x.castShadow = !!o.shadow && !m.transparent; x.receiveShadow = !m.transparent;
  return x;
}
// over: drawn on top of everything (a path you must be able to see wherever it goes)
function line(pts, color, opacity = 0.9, over = false) {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: !over }));
  l.userData.own = true; if (over) l.renderOrder = 4;
  return l;
}
const own = (o) => { o.userData.own = true; return o; };
function arrow(color, ghost, scale = 1) {
  const a = own(new THREE.Mesh(geo('arrow'), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: ghost ? 0.5 : 0.8, side: THREE.DoubleSide, depthWrite: false })));
  a.scale.setScalar(scale); a.position.y = 0.04; a.renderOrder = 3;
  return a;
}
// the arc a jump pad throws you along (the player's gravity; a pad's push is kept until landing)
function padArc(power, push, color) {
  const pts = [], vx = push ? push[0] : 0, vz = push ? push[1] : 0, g = WALK.gravity;
  for (let i = 0; i <= 60; i++) { const t = i * 0.05, y = 0.4 + power * t - 0.5 * g * t * t; pts.push([vx * t, y, vz * t]); if (y < -4) break; }
  return line(pts, color || '#ffcf3f', 0.85);
}
function partObj(e, ghost) {
  const m = M(e.c, { glow: e.g, metal: e.m, opacity: e.o }, ghost), sh = !ghost && !e.n;
  let x;
  if (e.s === 'box' || e.s === 'ramp') x = mesh(e.s, m, { scale: e.z, shadow: sh });
  else if (e.s === 'cyl') x = mesh('cyl', m, { scale: [e.z[0] / 2, e.z[1], e.z[0] / 2], shadow: sh });
  else if (e.s === 'sphere') x = mesh('sphere', m, { scale: [e.z[0] / 2, e.z[0] / 2, e.z[0] / 2], shadow: sh });
  else if (e.s === 'cone') x = mesh('cone', m, { scale: [e.z[0] / 2, e.z[1], e.z[0] / 2], shadow: sh });
  else x = buildLook([{ s: e.s, r: e.z[0] / 2, tube: e.z[1] / 2, color: e.c, glow: e.g, metal: e.m }]); // decoration: the world uses w.model
  const g = new THREE.Group(); g.add(x);
  g.position.set(e.p[0], e.p[1], e.p[2]); g.rotation.y = (e.y || 0) * DEG;
  return { obj: g, body: g };
}
function signObj(t, ghost) {
  const wd = 3, lines = [t.title || ''].concat(String(t.text || '').split('\n')).filter((x, i) => i > 0 || x);
  const pxW = Math.round(wd * 160), pad = 30, fs = 40, lh = 50;
  const wrapped = wrapLines(lines, Math.max(8, Math.floor((pxW - pad * 2) / 21)));
  const pxH = wrapped.length * lh + pad * 2 - (lh - fs);
  const c = textCanvas(wrapped, { width: pxW, height: pxH, wrapped: true, fit: true, bg: '#141a33', color: '#e8ecff', titleColor: t.title ? '#ffd166' : null, fontSize: fs, align: 'left', border: '#3b4570', pad });
  const hgt = wd * pxH / pxW, by = 1.2 + hgt / 2;
  const g = new THREE.Group(); g.position.set(t.p[0], t.p[1], t.p[2]); g.rotation.y = (t.y || 0) * DEG;
  const board = own(new THREE.Mesh(new THREE.PlaneGeometry(wd, hgt), new THREE.MeshBasicMaterial({ map: canvasTexture(c), toneMapped: false, transparent: !!ghost, opacity: ghost ? 0.6 : 1 })));
  board.position.set(0, by, 0.07); g.add(board);
  g.add(mesh('box', M('#2a2f45', {}, ghost), { pos: [0, by, 0], scale: [wd + 0.15, hgt + 0.15, 0.1], shadow: !ghost }));
  g.add(mesh('box', M('#2a2f45', {}, ghost), { pos: [0, 0.6, 0], scale: [0.16, 1.25, 0.16], shadow: !ghost }));
  return { obj: g, body: g };
}
function thingObj(t, ghost) {
  const P = t.p;
  if (t.t === 'sign') return signObj(t, ghost);
  if (t.t === 'mover') {
    const g = new THREE.Group(), a = mesh('box', M(t.c, { glow: 0.3 }, ghost), { pos: P, scale: t.z, shadow: !ghost });
    g.add(a);
    if (t.to && (t.to[0] !== P[0] || t.to[1] !== P[1] || t.to[2] !== P[2])) {
      g.add(mesh('box', M(t.c, { glow: 0.6, opacity: 0.22 }), { pos: t.to, scale: t.z }));
      g.add(line([P, t.to], '#ff4fd8', 0.85, true));
    }
    return { obj: g, body: a };
  }
  if (t.t === 'crumble') { const a = mesh('box', M(t.c, {}, ghost), { pos: P, scale: t.z, shadow: !ghost }); return { obj: a, body: a }; }
  if (t.t === 'hazard') { const a = mesh('box', ghost ? M('#ff3b5c', {}, true) : mat('#ff3b5c', { glow: 1.2, opacity: 0.5 }), { pos: P, scale: t.z }); return { obj: a, body: a }; }
  if (t.t === 'wind') {
    const g = new THREE.Group(), a = mesh('box', mat('#e8f6ff', { opacity: ghost ? 0.2 : 0.1 }), { pos: P, scale: t.z });
    g.add(a);
    const f = t.f || [0, 25, 0], fl = Math.hypot(f[0], f[1], f[2]) || 1, q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(f[0] / fl, f[1] / fl, f[2] / fl));
    for (const [dx, dz] of [[-0.25, -0.25], [0.25, 0.25], [0.25, -0.25], [-0.25, 0.25]]) {
      const c = mesh('cone', M('#e8f6ff', { glow: 0.8, opacity: 0.5 }, ghost), { pos: [P[0] + dx * t.z[0], P[1], P[2] + dz * t.z[2]], scale: [0.25, 0.6, 0.25] });
      c.quaternion.copy(q); g.add(c);
    }
    return { obj: g, body: a };
  }
  if (t.t === 'label') {
    const s = own(labelSprite(t.text, { size: 0.5 })); s.position.set(P[0], P[1], P[2]);
    if (ghost) s.material.opacity = 0.6;
    // it floats 1.5 m up: its box reaches down to the floor it was placed on, so the cursor can find it
    return { obj: s, body: s, box: new THREE.Box3(new THREE.Vector3(P[0] - 0.5, P[1] - 1.5, P[2] - 0.5), new THREE.Vector3(P[0] + 0.5, P[1] + 0.3, P[2] + 0.5)) };
  }
  const g = new THREE.Group(); g.position.set(P[0], P[1], P[2]);
  if (t.t === 'pad') {
    const r = 1.1, col = '#ffcf3f';
    g.add(mesh('cyl', M('#2a2d3e', {}, ghost), { pos: [0, 0.15, 0], scale: [r * 1.15, 0.3, r * 1.15], shadow: !ghost }));
    g.add(mesh('cyl', M(col, { glow: 1.6 }, ghost), { pos: [0, 0.34, 0], scale: [r, 0.08, r] }));
    g.add(mesh('cyl', mat(col, { glow: 0.8, opacity: ghost ? 0.2 : 0.35 }), { pos: [0, 1.2, 0], scale: [r * 0.8, 1.6, r * 0.8] }));
    if (ghost) g.add(padArc(t.power, t.push));
  } else if (t.t === 'boost') {
    g.rotation.y = (t.y || 0) * DEG;
    const m = M('#00f5d4', { glow: 2.2 }, ghost);
    for (let i = 0; i < 3; i++) {
      const z = -0.8 + i * 0.8;
      const l = mesh('box', m, { pos: [-0.45, 0.05, z - 0.2], scale: [1.1, 0.06, 0.3] }); l.rotation.y = -0.6;
      const rr = mesh('box', m, { pos: [0.45, 0.05, z - 0.2], scale: [1.1, 0.06, 0.3] }); rr.rotation.y = 0.6;
      g.add(l, rr);
    }
    g.add(mesh('box', mat('#00f5d4', { opacity: 0.12 }), { pos: [0, 0.02, 0], scale: [3.2, 0.04, 3.2] }));
  } else if (t.t === 'checkpoint') {
    g.add(mesh('cyl8', M('#30344a', { metal: 0.3 }, ghost), { pos: [0, 0.2, 0], scale: [0.7, 0.4, 0.7], shadow: !ghost }));
    g.add(mesh('cyl', M('#9aa3c0', { metal: 0.6 }, ghost), { pos: [0, 1.5, 0], scale: [0.08, 2.4, 0.08], shadow: !ghost }));
    g.add(mesh('ico', M('#7cf6ff', { glow: 1.2 }, ghost), { pos: [0, 3, 0], scale: [0.32, 0.32, 0.32] }));
    const a = arrow('#7cf6ff', ghost, 0.9); a.rotation.y = (t.y || 0) * DEG; g.add(a); // which way you face after a respawn
  }
  return { obj: g, body: g };
}
function goalObj(G, ghost) {
  const g = new THREE.Group(); g.position.set(G[0], G[1], G[2]);
  g.add(mesh('cyl', M('#e8ecff', { metal: 0.5 }, ghost), { pos: [0, 2, 0], scale: [0.08, 4, 0.08], shadow: !ghost }));
  g.add(mesh('box', M('#ffd166', { glow: 1.2 }, ghost), { pos: [0.62, 3.5, 0], scale: [1.2, 0.8, 0.06] }));
  g.add(mesh('cyl', M('#ffd166', { glow: 1.4 }, ghost), { pos: [0, 0.05, 0], scale: [1.6, 0.1, 1.6] }));
  return { obj: g, body: g };
}
function spawnObj(S, ghost) {
  const g = new THREE.Group(), yaw = S[3] * DEG, fx = Math.sin(yaw), fz = Math.cos(yaw);
  // what the level template adds for you: a start platform, and the portal home behind it
  if (!ghost || ghost === 'full') {
    const plat = mesh('box', M('#3b3f63', {}, !!ghost), { pos: [S[0] - fx * 4, S[1] - 0.3, S[2] - fz * 4], scale: [7, 0.6, 12], shadow: !ghost }); plat.rotation.y = yaw; g.add(plat);
    const portal = new THREE.Group(); portal.position.set(S[0] - fx * 8, S[1], S[2] - fz * 8); portal.rotation.y = yaw;
    // the portal home, see-through here: it is added for you, and a solid ring would block the view
    portal.add(mesh('ring', mat('#9d7bff', { glow: 0.4, opacity: ghost ? 0.08 : 0.14 }), { pos: [0, 2.7, 0] }));
    portal.add(mesh('box', M('#262a3d', { metal: 0.3 }, !!ghost), { pos: [0, 0.15, 0], scale: [6.6, 0.3, 2.6] }));
    if (!ghost) { const lab = own(labelSprite('portal home', { size: 0.42, color: '#ffffff', border: '#9d7bff' })); lab.position.set(0, 0.9, 0); portal.add(lab); }
    g.add(portal);
  }
  // you, to scale, and the way you will face
  const me = mesh('capsule', mat('#7cf6ff', { glow: 0.6, opacity: ghost ? 0.35 : 0.55 }), { pos: [S[0], S[1] + 0.9, S[2]] }); g.add(me);
  const a = arrow('#7cf6ff', ghost, 1.3); a.position.set(S[0], S[1] + 0.04, S[2]); a.rotation.y = yaw; g.add(a);
  return { obj: g, body: me };
}
function disposeObj(o) {
  o.traverse((x) => {
    if (!x.userData.own) return;
    if (x.material) { if (x.material.map) x.material.map.dispose(); x.material.dispose(); }
    if (x.geometry && !x.geometry.userData.keep && !x.isSprite) x.geometry.dispose();
  });
}
// the bounds of what you can see of a piece (lines such as a pad's arc do not count)
function boxOf(body) {
  body.updateMatrixWorld(true);
  const b = new THREE.Box3(), t = new THREE.Box3();
  body.traverse((x) => { if (x.isMesh && x.geometry) { if (!x.geometry.boundingBox) x.geometry.computeBoundingBox(); t.copy(x.geometry.boundingBox).applyMatrix4(x.matrixWorld); b.union(t); } });
  return b.isEmpty() ? new THREE.Box3().setFromObject(body) : b;
}

// level themes: compile a tiny probe level and read its theme, so the preview uses exactly the template's colours
const themeCache = {};
function themeFor(name) {
  if (!themeCache[name]) themeCache[name] = (async () => {
    const c = checkLevel({ name: 'Theme', theme: name, spawn: [0, 0, 0, 0], goal: [0, 0, 10] });
    const m = await compileLevel(c.level);
    const url = URL.createObjectURL(new Blob([m.text], { type: 'text/javascript' }));
    try { const mod = (await import(/* @vite-ignore */ url)).default; return { theme: mod.theme || {}, music: mod.music || null }; } finally { URL.revokeObjectURL(url); }
  })().catch((err) => { console.warn('[builder] theme', name, err.message); delete themeCache[name]; return { theme: {}, music: null }; });
  return themeCache[name];
}

// ---------------- the Builder ----------------
export function createBuilder(E) {
  const B = { active: false, used: false, focus: new THREE.Vector3(), PIECES };
  let store = null, lv = null, slot = 0;
  const cur = { x: 0, y: 0, z: 0 }, vis = new THREE.Vector3();
  let grid = 1, piece = PIECES[0], pending = null, modal = null, hover = null, help = true;
  const brushes = {};
  const brush = () => brushes[piece.id] || (brushes[piece.id] = {
    size: (piece.size || [1, 1, 1]).slice(), yaw: piece.yaw || 0, color: piece.color || '#5b5f97', glow: 0, power: 17, push: 0, speed: 2.5, force: 25,
    title: 'HELLO', text: piece.id === 'label' ? 'THE END' : 'Reach the golden flag.',
  });
  let undoStack = [], redoStack = [];
  const view = { yaw: Math.PI, pitch: 0.62, dist: 22, top: false }, cam = { yaw: Math.PI, pitch: 0.62, dist: 22, t: new THREE.Vector3() };
  const held = new Set();
  let root = null, levelG, markG, ghostG, cursorG, hoverG, gridObj = null, dropLine = null;
  let pool = new Map(), entries = [], marks = [], markKey = '', ghostKey = '', ghostObj = null;
  let dom = null, sayT = 0, saveT = 0, dirty = false;
  const hidden = [], keepVisible = new Set();
  let saved = null; // what open() changed: restored by close()

  // ---- drafts in localStorage: several slots ----
  function loadStore() {
    if (store) return;
    try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); if (v && Array.isArray(v.slots)) store = { cur: v.cur | 0, help: v.help !== false, slots: v.slots.slice(0, MAX_SLOTS) }; } catch (e) {}
    if (!store) store = { cur: 0, help: true, slots: [] };
    help = store.help;
    if (!store.slots[store.cur]) store.cur = Math.max(0, store.slots.findIndex(Boolean));
    if (!store.slots[store.cur]) store.slots[store.cur] = { level: starter(), at: Date.now() };
    useSlot(store.cur);
  }
  function useSlot(i) {
    slot = i; store.cur = i;
    const s = store.slots[i];
    lv = sanitize(s.level);
    undoStack = []; redoStack = []; pending = null;
    const c = Array.isArray(s.cur) && s.cur.every(okNum) ? s.cur : lv.spawn;
    cur.x = r2(c[0]); cur.y = r2(c[1]); cur.z = r2(c[2]);
    const v = Array.isArray(s.view) && s.view.length === 3 && s.view.every((x) => typeof x === 'number' && isFinite(x)) ? s.view : [lv.spawn[3] * DEG, 0.62, 22];
    view.yaw = v[0]; view.pitch = clamp(v[1], 0.12, 1.45); view.dist = clamp(v[2], 4, 120); view.top = false;
    vis.set(cur.x, cur.y, cur.z); cam.t.copy(vis); cam.yaw = view.yaw; cam.pitch = view.pitch; cam.dist = view.dist;
  }
  function writeStore() {
    clearTimeout(saveT); saveT = 0;
    if (!store) return true;
    if (lv) store.slots[slot] = { level: lv, at: dirty || !store.slots[slot] ? Date.now() : store.slots[slot].at, cur: [cur.x, cur.y, cur.z], view: [r2(view.yaw), r2(view.pitch), r2(view.dist)] };
    store.help = help; dirty = false;
    try { localStorage.setItem(STORE, JSON.stringify(store)); return true; } catch (e) { return false; }
  }
  const autosave = () => { dirty = true; clearTimeout(saveT); saveT = setTimeout(() => { if (!writeStore()) say('Could not save the draft (browser storage is full or blocked). Export it from the menu.', 'bad'); refreshHud(); }, 400); };

  // ---- the scene: the level as it is, the piece at the cursor, the cursor ----
  function ensureScene() {
    if (root) return;
    root = new THREE.Group(); root.name = 'builder';
    levelG = new THREE.Group(); markG = new THREE.Group(); ghostG = new THREE.Group(); cursorG = new THREE.Group(); hoverG = new THREE.Group();
    root.add(levelG, markG, ghostG, cursorG, hoverG);
    const cm = new THREE.LineBasicMaterial({ color: '#7cf6ff', transparent: true, opacity: 0.95, depthTest: false });
    const ring = [], N = 32; for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2; ring.push(new THREE.Vector3(Math.cos(a) * 0.32, 0.03, Math.sin(a) * 0.32)); }
    const r = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), cm); r.renderOrder = 5;
    const cross = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.7, 0.03, 0), new THREE.Vector3(0.7, 0.03, 0), new THREE.Vector3(0, 0.03, -0.7), new THREE.Vector3(0, 0.03, 0.7), new THREE.Vector3(0, 0.03, 0), new THREE.Vector3(0, 0.6, 0)]), cm); cross.renderOrder = 5;
    cursorG.add(r, cross);
    dropLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)]), new THREE.LineDashedMaterial({ color: '#7cf6ff', dashSize: 0.3, gapSize: 0.2, transparent: true, opacity: 0.7 }));
    root.add(dropLine);
    const hb = new THREE.LineSegments(geo('edges'), new THREE.LineBasicMaterial({ color: '#ff4fd8', transparent: true, opacity: 0.95, depthTest: false }));
    hb.renderOrder = 6; hb.name = 'hoverbox'; hoverG.add(hb);
    makeGrid();
  }
  function makeGrid() {
    if (gridObj) { gridObj.removeFromParent(); gridObj.geometry.dispose(); gridObj.material.dispose(); }
    const size = grid >= 1 ? 48 : grid >= 0.5 ? 30 : 16;
    gridObj = new THREE.GridHelper(size, Math.round(size / grid), '#7cf6ff', '#a7b0d8');
    gridObj.material.transparent = true; gridObj.material.opacity = 0.26; gridObj.material.depthWrite = false; gridObj.renderOrder = 1;
    root.add(gridObj);
  }
  // draw the level from its data; unchanged pieces keep their meshes
  function syncLevel() {
    const old = pool; pool = new Map(); entries = [];
    const take = (key, make) => {
      const l = old.get(key);
      const it = l && l.length ? l.pop() : make();
      if (!it.box) it.box = boxOf(it.body);
      (pool.get(key) || pool.set(key, []).get(key)).push(it);
      return it;
    };
    lv.parts.forEach((e, i) => entries.push({ part: true, i, it: take('p' + JSON.stringify(e), () => partObj(e)) }));
    lv.things.forEach((e, i) => entries.push({ part: false, i, it: take('t' + JSON.stringify(e), () => thingObj(e)) }));
    for (const l of old.values()) for (const it of l) { it.obj.removeFromParent(); disposeObj(it.obj); }
    for (const x of entries) if (x.it.obj.parent !== levelG) levelG.add(x.it.obj);
    const k = JSON.stringify([lv.spawn, lv.goal]);
    if (k !== markKey) {
      markKey = k;
      for (const m of marks) { m.it.obj.removeFromParent(); disposeObj(m.it.obj); }
      marks = [{ marker: 'spawn', it: spawnObj(lv.spawn) }, { marker: 'goal', it: goalObj(lv.goal) }];
      for (const m of marks) { markG.add(m.it.obj); m.it.box = boxOf(m.it.body); }
    }
  }
  // the piece the brush would place, drawn at the cursor (built around the origin, then moved with the cursor)
  function syncGhost() {
    const br = brush();
    const key = JSON.stringify([piece.id, br, pending && pending.e]);
    if (key === ghostKey && ghostObj) return;
    ghostKey = key;
    if (ghostObj) { ghostObj.removeFromParent(); disposeObj(ghostObj); ghostObj = null; }
    const o = { x: 0, y: 0, z: 0 };
    let it = null;
    try {
      if (pending) { const e = pending.e; it = { obj: mesh('box', M(e.c, {}, true), { pos: [0, -e.z[1] / 2, 0], scale: e.z }) }; }
      else if (piece.marker === 'spawn') it = spawnObj([0, 0, 0, br.yaw], 'full');
      else if (piece.marker === 'goal') it = goalObj([0, 0, 0], true);
      else if (piece.part) it = partObj(makeEntry(piece, br, o), true);
      else it = thingObj(makeEntry(piece, br, o), true);
    } catch (err) { it = null; }
    if (!it) return;
    ghostObj = new THREE.Group(); ghostObj.add(it.obj); ghostG.add(ghostObj);
    // an outline drawn over everything, so the piece shows where it goes even inside something solid
    if (piece.marker !== 'spawn') {
      const b = boxOf(it.obj), c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
      const ol = new THREE.LineSegments(geo('edges'), new THREE.LineBasicMaterial({ color: '#7cf6ff', transparent: true, opacity: 0.75, depthTest: false }));
      ol.userData.own = true; ol.renderOrder = 6; ol.position.copy(c); ol.scale.set(Math.max(0.05, sz.x), Math.max(0.05, sz.y), Math.max(0.05, sz.z));
      ghostObj.add(ol);
    }
  }
  // the moving platform being placed: its path from the start to the cursor
  let pathLine = null;
  function syncPending() {
    if (pathLine) { pathLine.removeFromParent(); disposeObj(pathLine); pathLine = null; }
    if (!pending) return;
    const e = pending.e;
    pathLine = new THREE.Group(); pathLine.userData.own = false;
    pathLine.add(mesh('box', M(e.c, { glow: 0.3 }), { pos: e.p, scale: e.z }));
    pathLine.add(line([e.p, [cur.x, cur.y - e.z[1] / 2, cur.z]], '#ff4fd8', 0.95, true));
    root.add(pathLine);
  }
  // what the cursor points at: Delete removes it, X copies it
  function findHover() {
    const h = Math.min(0.3, grid * 0.45);
    const probe = new THREE.Box3(new THREE.Vector3(cur.x - h, cur.y - 0.25, cur.z - h), new THREE.Vector3(cur.x + h, cur.y + 0.6, cur.z + h));
    let best = null, bs = Infinity;
    const consider = (x, rank) => {
      if (!x.it.box || !x.it.box.intersectsBox(probe)) return;
      // things before shapes; then the piece whose top or bottom is nearest the cursor; then the newest
      const s = rank * 1000 + Math.min(Math.abs(x.it.box.max.y - cur.y), Math.abs(x.it.box.min.y - cur.y)) * 10 - (x.i || 0) * 1e-4;
      if (s < bs) { bs = s; best = x; }
    };
    for (const x of entries) consider(x, x.part ? 1 : 0);
    for (const m of marks) consider(m, 0.5);
    hover = best;
    const hb = hoverG.getObjectByName('hoverbox');
    hoverG.children.filter((c) => c !== hb).forEach((c) => { c.removeFromParent(); disposeObj(c); });
    hb.visible = !!hover;
    if (hover) {
      const b = hover.it.box, c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
      hb.position.copy(c); hb.scale.set(s.x + 0.08, s.y + 0.08, s.z + 0.08);
      const e = hover.part === false && lv.things[hover.i];
      if (e && e.t === 'pad') { const a = padArc(e.power, e.push, '#ff4fd8'); a.position.set(e.p[0], e.p[1], e.p[2]); hoverG.add(a); }
    }
  }
  function redraw() { syncLevel(); findHover(); syncGhost(); syncPending(); refreshHud(); }
  function changed() { redraw(); autosave(); }

  // ---- editing ----
  function snapshot() { undoStack.push(JSON.stringify(lv)); if (undoStack.length > 300) undoStack.shift(); redoStack = []; }
  function undo() { if (!undoStack.length) return fail('Nothing to undo.'); redoStack.push(JSON.stringify(lv)); lv = JSON.parse(undoStack.pop()); changed(); E.audio.play('blip'); say('Undone.'); }
  function redo() { if (!redoStack.length) return fail('Nothing to redo.'); undoStack.push(JSON.stringify(lv)); lv = JSON.parse(redoStack.pop()); changed(); E.audio.play('blip'); say('Redone.'); }
  const snap = (v) => r2(Math.round(v / grid) * grid);
  const lim = (v) => clamp(v, -L.coord, L.coord);
  function setCursor(x, y, z) {
    cur.x = lim(snap(x)); cur.y = lim(snap(y)); cur.z = lim(snap(z));
    findHover(); syncPending(); refreshHud();
  }
  // W/S and A/D move along the grid axis closest to the way the camera looks
  function axes() {
    const fx = Math.sin(view.yaw), fz = Math.cos(view.yaw);
    const f = Math.abs(fx) > Math.abs(fz) ? [Math.sign(fx), 0] : [0, Math.sign(fz)];
    return { f, r: [-f[1], f[0]] };
  }
  function move(dx, dz) { const { f, r } = axes(); setCursor(cur.x + (r[0] * dx + f[0] * dz) * grid, cur.y, cur.z + (r[1] * dx + f[1] * dz) * grid); }
  function lift(d) { setCursor(cur.x, cur.y + d * grid, cur.z); }
  function brushChanged() { syncGhost(); refreshHud(); }
  const sizeMax = () => (piece.part ? L.size : 60);
  function resizeAxis(br, ax, d) {
    const s = br.size, mx = sizeMax(), nv = (v) => clamp(r2(v + d * grid), 0.25, mx);
    if (piece.ball) { const v = nv(s[0]); s[0] = s[1] = s[2] = v; } else if (piece.round && ax !== 1) { const v = nv(s[0]); s[0] = s[2] = v; } else s[ax] = nv(s[ax]);
  }
  function stretch(ax, d) {
    const br = brush();
    if (piece.thing === 'pad') {
      if (ax === 1) { br.power = clamp(br.power + d, 8, 30); brushChanged(); return say(`Jump pad power ${br.power}: you rise about ${fmt(br.power * br.power / (2 * WALK.gravity))} m.`); }
      if (ax === 2) { br.push = clamp(br.push + d, 0, 12); brushChanged(); return say(br.push ? `The pad throws you ${br.push} m/s toward ${br.yaw}° (Q/E aim).` : 'The pad throws you straight up.'); }
      return say('Jump pads: Shift+R/F power, Shift+W/S throw, Q/E aim.');
    }
    if (!piece.size) return say(`${piece.name}: fixed size.`);
    resizeAxis(br, ax, d); brushChanged();
  }
  function resize(d) {
    const br = brush();
    if (piece.thing === 'pad') return stretch(1, d);
    if (!piece.size) return say(`${piece.name}: fixed size.`);
    for (const ax of piece.ball ? [0] : piece.round ? [0, 1] : [0, 1, 2]) resizeAxis(br, ax, d); // a sphere has one size
    brushChanged();
  }
  function turn(d) {
    const br = brush();
    if (piece.marker === 'goal' || piece.thing === 'label') return say(`${piece.name}: no direction to turn.`);
    if (piece.swap) { br.size = [br.size[2], br.size[1], br.size[0]]; brushChanged(); return say(`${piece.name}: turned 90° (it stays square to the grid).`); }
    br.yaw = yaw360(br.yaw + d * 15); brushChanged();
    if (piece.thing === 'pad' && !br.push) say(`Aimed at ${br.yaw}°. Add a throw with Shift+W.`);
  }
  function recolor(d) {
    const br = brush();
    if (!piece.part && piece.thing !== 'crumble' && piece.thing !== 'mover') return say(`${piece.name}: its colour is fixed.`);
    const i = PALETTE.findIndex((p) => p[0] === br.color), n = PALETTE.length;
    br.color = PALETTE[((i < 0 ? 0 : i + d) % n + n) % n][0]; brushChanged();
  }
  function reglow() {
    const br = brush();
    if (!piece.part) return say(`${piece.name}: glow is for shapes (keys 1-4, Shift+4).`);
    br.glow = GLOWS[(GLOWS.indexOf(br.glow) + 1) % GLOWS.length]; brushChanged();
    say(br.glow ? (br.glow > 1.4 ? 'Glow: bright.' : 'Glow: soft.') : 'Glow: off.');
  }
  function regrid() { grid = GRIDS[(GRIDS.indexOf(grid) + 1) % GRIDS.length]; makeGrid(); setCursor(cur.x, cur.y, cur.z); say(`Grid: ${grid} m.`); }
  function pick(i) {
    if (!PIECES[i]) return;
    if (pending) { pending = null; syncPending(); }
    piece = PIECES[i]; brushChanged(); E.audio.play('click');
    say(piece.marker === 'spawn' ? 'Spawn point: Enter puts the start here, facing the arrow (Q/E turn it).' : piece.marker === 'goal' ? 'Goal flag: Enter puts the flag here. Reaching it clears the level.' : piece.thing === 'mover' ? 'Moving platform: Enter places it, then choose where it travels to.' : `${piece.name}.`);
  }
  function feedback(p, color) { E.audio.play('click'); E.fx.burst(new THREE.Vector3(p[0], p[1] + 0.4, p[2]), { color: color || '#7cf6ff', count: 14, speed: 3, life: 0.5, gravity: 2 }); }
  function add(pc, br) {
    let e;
    try { e = makeEntry(pc, br, cur); } catch (err) { return fail('It cannot go here: ' + err.message + '.'); }
    const list = pc.part ? lv.parts : lv.things, max = pc.part ? L.parts : L.things;
    if (list.length >= max) return fail(`A level holds at most ${max} ${pc.part ? 'shapes' : 'pads, platforms and signs'}.`);
    const k = JSON.stringify(e);
    if (list.some((x) => JSON.stringify(x) === k)) return fail('That piece is already here.');
    if (pc.thing === 'mover') { pending = { e }; syncGhost(); syncPending(); refreshHud(); E.audio.play('click'); return say('Now move the cursor to where the platform travels to, then press Enter. Esc cancels.'); }
    snapshot(); list.push(e); changed(); feedback(e.p, pc.part ? e.c : null);
  }
  function finishMover() {
    const e = Object.assign({}, pending.e, { to: [cur.x, cur.y - pending.e.z[1] / 2, cur.z] });
    let c;
    try { c = canonEntry(e, false); } catch (err) { return fail('It cannot go there: ' + err.message + '.'); }
    if (c.to.every((v, i) => v === c.p[i])) return fail('The platform would not move. Move the cursor to its end point first (Esc cancels).');
    pending = null; snapshot(); lv.things.push(c); changed(); feedback(c.to, c.c);
    say(`Moving platform placed: it travels ${fmt(Math.hypot(c.to[0] - c.p[0], c.to[1] - c.p[1], c.to[2] - c.p[2]))} m and back.`);
  }
  function place() {
    if (pending) return finishMover();
    const br = brush();
    if (piece.marker === 'spawn') {
      snapshot(); lv.spawn = [cur.x, cur.y, cur.z, yaw360(br.yaw)]; changed(); feedback(lv.spawn, '#7cf6ff');
      return say(goalWarning() || 'The start is here now.');
    }
    if (piece.marker === 'goal') {
      snapshot(); lv.goal = [cur.x, cur.y, cur.z]; changed(); feedback(lv.goal, '#ffd166');
      return say(goalWarning() || 'The golden flag is here now.');
    }
    if (piece.thing === 'sign' || piece.thing === 'label') {
      const pc = piece;
      askText(pc, br).then((ok) => { if (ok) add(pc, br); });
      return;
    }
    add(piece, br);
  }
  function remove() {
    if (pending) { pending = null; syncGhost(); syncPending(); refreshHud(); return say('Moving platform cancelled.'); }
    if (!hover) return fail('Nothing under the cursor to remove.');
    if (hover.marker) return fail(hover.marker === 'spawn' ? 'The start can only move: pick it with Shift+3 and press Enter where it should be.' : 'The flag can only move: pick it with Shift+2 and press Enter where it should be.');
    const isPart = hover.part, list = isPart ? lv.parts : lv.things, e = list[hover.i];
    snapshot(); list.splice(hover.i, 1); changed();
    E.audio.play('crumble'); say('Removed: ' + describe(e, isPart) + '.');
  }
  function copyHovered() {
    if (!hover) return fail('Nothing under the cursor to copy.');
    if (hover.marker) { pick(PIECES.findIndex((p) => p.marker === hover.marker)); if (hover.marker === 'spawn') { brush().yaw = lv.spawn[3]; brushChanged(); } return; }
    const isPart = hover.part, e = (isPart ? lv.parts : lv.things)[hover.i], pc = pieceOf(e, isPart);
    if (!pc) return fail('This decoration cannot be placed from the Builder yet.');
    piece = pc;
    const br = brush();
    if (isPart) { br.size = e.z.slice(); br.yaw = e.y; br.color = e.c; br.glow = e.g || 0; }
    else {
      if (e.z) br.size = e.z.slice();
      if (e.c) br.color = e.c;
      if (e.y != null) br.yaw = e.y;
      if (e.t === 'pad') { br.power = e.power; br.push = e.push ? r2(Math.hypot(e.push[0], e.push[1])) : 0; if (e.push) br.yaw = yaw360(Math.atan2(e.push[0], e.push[1]) / DEG); }
      if (e.t === 'mover') br.speed = e.speed;
      if (e.t === 'wind') br.force = e.f[1] || 25;
      if (e.t === 'sign') { br.title = e.title; br.text = e.text; }
      if (e.t === 'label') br.text = e.text;
    }
    brushChanged(); E.audio.play('click'); say('Copied: ' + describe(e, isPart) + '. Enter places another.');
  }
  function goalWarning() {
    const s = lv.spawn, g = lv.goal;
    return Math.hypot(g[0] - s[0], g[1] - s[1], g[2] - s[2]) < 6 ? 'The flag must be at least 6 m from the start.' : '';
  }

  // ---- the HUD ----
  const h = (tag, cls, text) => { const x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; };
  function ensureDom() {
    if (dom) return;
    const rootEl = document.getElementById('builder');
    rootEl.innerHTML = '<div class="bd-top"><div class="bd-bar"></div><div class="bd-status"></div></div><div class="bd-side"><div class="bd-title"><b>BUILDER</b> <span class="bd-draft"></span></div><div class="bd-info"></div></div><div class="bd-help"></div><div class="bd-modal hidden"><div class="bd-card" role="dialog" aria-modal="true"></div></div>';
    dom = { root: rootEl, bar: rootEl.querySelector('.bd-bar'), status: rootEl.querySelector('.bd-status'), draft: rootEl.querySelector('.bd-draft'), info: rootEl.querySelector('.bd-info'), help: rootEl.querySelector('.bd-help'), modal: rootEl.querySelector('.bd-modal'), card: rootEl.querySelector('.bd-card') };
    PIECES.forEach((p, i) => {
      const s = h('div', 'bd-slot'); s.dataset.id = p.id; s.title = p.name;
      s.append(h('kbd', null, p.key), h('span', null, p.short));
      s.onclick = () => { if (!modal) pick(i); };
      dom.bar.append(s);
    });
    for (const [k, v] of HELP) { const r = h('div', 'bd-hrow'); r.append(h('b', null, k), h('span', null, v)); dom.help.append(r); }
    // the dialogs keep their keys to themselves (the game never sees them)
    dom.modal.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.code === 'Escape') { ev.preventDefault(); closeModal(); } });
    dom.modal.addEventListener('mousedown', (ev) => { if (ev.target === dom.modal) closeModal(); });
  }
  function brushText() {
    const br = brush();
    if (pending) return `Moving platform · end point: x ${fmt(cur.x)}, y ${fmt(cur.y)}, z ${fmt(cur.z)}`;
    if (piece.marker === 'spawn') return `Spawn point · facing ${br.yaw}°`;
    if (piece.marker === 'goal') return 'Goal flag';
    if (piece.thing === 'pad') return `Jump pad · power ${br.power} (rises ${fmt(br.power * br.power / (2 * WALK.gravity))} m)${br.push ? ` · throws ${br.push} m/s toward ${br.yaw}°` : ''}`;
    if (piece.thing === 'sign') return `Sign · facing ${br.yaw}° · "${br.title}"`;
    if (piece.thing === 'label') return `Label · "${br.text}"`;
    if (piece.thing === 'boost' || piece.thing === 'checkpoint') return `${piece.name} · facing ${br.yaw}°`;
    const s = br.size, size = piece.ball ? `${fmt(s[0])} m across` : piece.round ? `${fmt(s[0])} m across, ${fmt(s[1])} m tall` : `${s.map(fmt).join(' × ')} m`;
    return `${piece.name} · ${size}${piece.part && br.yaw ? ` · turned ${br.yaw}°` : ''}${piece.part || piece.thing === 'crumble' || piece.thing === 'mover' ? ` · ${colorName(br.color)}` : ''}${br.glow ? ' · glowing' : ''}`;
  }
  function hint() {
    if (pending) return 'Move the cursor to where the platform travels to, then press Enter. Esc cancels.';
    const w = goalWarning();
    if (w) return w + ' Move one of them (Shift+2 flag, Shift+3 start).';
    return 'Enter places · Delete removes · Z undoes · P test plays · Esc menu';
  }
  function refreshHud() {
    if (!dom || !lv) return;
    dom.bar.querySelectorAll('.bd-slot').forEach((s) => s.classList.toggle('on', s.dataset.id === piece.id));
    dom.draft.textContent = `${lv.name || 'Untitled'} · draft ${slot + 1}${dirty || saveT ? '' : ' · saved'}`;
    const info = dom.info; info.innerHTML = '';
    const sw = h('span', 'bd-sw'); sw.style.background = brush().color;
    const top = h('div', 'bd-piece'); if (piece.part || piece.thing === 'crumble' || piece.thing === 'mover') top.append(sw); top.append(h('span', null, brushText()));
    info.append(top);
    info.append(h('div', null, `Cursor x ${fmt(cur.x)} · y ${fmt(cur.y)} · z ${fmt(cur.z)} · grid ${grid} m`));
    info.append(h('div', 'bd-under', hover ? (hover.marker ? (hover.marker === 'spawn' ? 'Under the cursor: the start' : 'Under the cursor: the golden flag') : 'Under the cursor: ' + describe((hover.part ? lv.parts : lv.things)[hover.i], hover.part)) : 'Under the cursor: nothing'));
    const np = lv.parts.length, nt = lv.things.length;
    info.append(h('div', 'muted', `${np} shape${np === 1 ? '' : 's'} · ${nt} gameplay piece${nt === 1 ? '' : 's'} · theme ${lv.theme}`));
    dom.help.classList.toggle('hidden', !help);
    if (Date.now() > sayT) { dom.status.textContent = hint(); dom.status.className = 'bd-status' + (goalWarning() && !pending ? ' warn' : ''); }
  }
  function say(text, kind) { if (!dom) return; dom.status.textContent = text; dom.status.className = 'bd-status ' + (kind || 'note'); sayT = Date.now() + 3500; clearTimeout(say.t); say.t = setTimeout(refreshHud, 3600); }
  function fail(text) { say(text, 'bad'); E.audio.play('error'); }

  // ---- dialogs: the menu, and text for signs ----
  function openModal(kind, render) {
    modal = kind; dom.card.innerHTML = ''; dom.card.className = 'bd-card ' + kind;
    render(dom.card);
    dom.modal.classList.remove('hidden');
    const f = dom.card.querySelector('[data-focus]') || dom.card.querySelector('button, input, select, textarea');
    if (f) f.focus(); // at once, so no keystroke typed straight after can go astray
  }
  function closeModal(result) {
    if (!modal) return;
    const done = closeModal.done; closeModal.done = null;
    modal = null; dom.modal.classList.add('hidden'); dom.card.innerHTML = '';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (done) done(result);
    refreshHud();
  }
  function askText(pc, br) {
    return new Promise((resolve) => {
      openModal('text', (c) => {
        c.append(h('h2', null, pc.thing === 'sign' ? 'Sign' : 'Label'));
        const field = (label, value, max) => { const l = h('label', 'bd-field'); l.append(h('span', null, label)); const i = h('input'); i.type = 'text'; i.maxLength = max; i.value = value; i.autocomplete = 'off'; l.append(i); c.append(l); return i; };
        const title = pc.thing === 'sign' ? field('Title (up to 32 letters)', br.title, L.title) : null;
        const text = field(pc.thing === 'sign' ? 'Text (up to 240 letters)' : 'Text (up to 32 letters)', br.text, pc.thing === 'sign' ? L.text : L.title);
        if (title) title.dataset.focus = '1'; else text.dataset.focus = '1';
        const row = h('div', 'btnrow'), ok = h('button', 'btn', 'Place it (Enter)'), no = h('button', 'btn', 'Cancel (Esc)');
        row.append(ok, no); c.append(row);
        const finish = () => {
          const t = text.value.replace(/\s+/g, ' ').trim();
          if (!t && !(title && title.value.trim())) { text.focus(); return; }
          if (title) br.title = title.value.replace(/\s+/g, ' ').trim().slice(0, L.title);
          br.text = t.slice(0, pc.thing === 'sign' ? L.text : L.title) || (pc.thing === 'label' ? '…' : '');
          closeModal(true); brushChanged();
        };
        if (title) title.addEventListener('keydown', (ev) => { if (ev.code === 'Enter' || ev.code === 'NumpadEnter') { ev.preventDefault(); text.focus(); } });
        text.addEventListener('keydown', (ev) => { if (ev.code === 'Enter' || ev.code === 'NumpadEnter') { ev.preventDefault(); finish(); } });
        ok.onclick = finish; no.onclick = () => closeModal(false);
      });
      closeModal.done = (r) => resolve(!!r);
    });
  }
  function slotLabel(s, i) {
    const l = s && s.level;
    if (!l) return null;
    const n = (l.parts ? l.parts.length : 0) + (l.things ? l.things.length : 0);
    const ago = Math.max(0, Math.round((Date.now() - (s.at || 0)) / 60000));
    return `${i + 1} · ${l.name || 'Untitled'} · ${n} piece${n === 1 ? '' : 's'} · ${ago < 1 ? 'just now' : ago < 60 ? ago + ' min ago' : Math.round(ago / 60) + ' h ago'}`;
  }
  function openMenu() {
    if (pending) { pending = null; syncGhost(); syncPending(); }
    writeStore();
    openModal('menu', renderMenu);
  }
  function renderMenu(c) {
    c.append(h('h2', null, 'The Builder'));
    const chk = checkLevel(JSON.parse(JSON.stringify(lv)));
    const np = lv.parts.length, nt = lv.things.length;
    const st = h('div', 'vres ' + (chk.error ? 'bad' : 'ok'), chk.error ? `Not ready to test: ${chk.error}.` : `Ready to test: ${np} shape${np === 1 ? '' : 's'} and ${nt} gameplay piece${nt === 1 ? '' : 's'}.`);
    // actions first: Enter on the focused button plays the level
    const acts = h('div', 'btnrow');
    const bt = (label, f, cls) => { const b = h('button', 'btn' + (cls ? ' ' + cls : ''), label); b.onclick = f; acts.append(b); return b; };
    const play = bt('Test play (P)', () => { closeModal(); testPlay(); }, 'primary'); play.dataset.focus = '1';
    const pubLine = h('div', 'vres');
    bt('Publish…', () => publishFlow(pubLine));
    bt('Keep building (Esc)', () => closeModal());
    bt('Exit the Builder', () => { closeModal(); B.close(); });
    c.append(acts, st, pubLine);
    // the level's details
    const sec = (title) => { const d = h('div', 'sec'); d.append(h('h3', null, title)); c.append(d); return d; };
    const det = sec('Your level');
    const field = (parent, label, el) => { const l = h('label', 'bd-field'); l.append(h('span', null, label), el); parent.append(l); return el; };
    const name = h('input'); name.type = 'text'; name.maxLength = L.name; name.value = lv.name; name.autocomplete = 'off';
    name.oninput = () => { lv.name = name.value; autosave(); refreshHud(); };
    const blurb = h('input'); blurb.type = 'text'; blurb.maxLength = L.blurb; blurb.value = lv.blurb; blurb.autocomplete = 'off'; blurb.placeholder = 'One line that sells it';
    blurb.oninput = () => { lv.blurb = blurb.value; autosave(); };
    const theme = h('select'); for (const t of THEME_NAMES) { const o = h('option', null, t); o.value = t; theme.append(o); } theme.value = lv.theme;
    theme.onchange = () => { lv.theme = theme.value; autosave(); applyTheme(); refreshHud(); };
    const colr = h('select'); for (const [hex, nm] of PALETTE) { const o = h('option', null, nm); o.value = hex; colr.append(o); } if (!PALETTE.some((p) => p[0] === lv.color)) { const o = h('option', null, lv.color); o.value = lv.color; colr.append(o); } colr.value = lv.color;
    colr.onchange = () => { lv.color = colr.value; autosave(); };
    field(det, 'Name', name); field(det, 'Blurb', blurb); field(det, 'Theme', theme); field(det, 'Colour at the Gate', colr);
    // the reward: a cosmetic item players get for clearing the level, credited to you, worn in every world
    const rw = sec('Reward for clearing (optional)');
    rw.append(h('div', 'muted', 'Everyone who clears your level gets this item, marked as made by you. It is cosmetic: it shows in every world.'));
    const made = lv.reward ? matchPreset(lv.reward) : null;
    const kind = h('select'); { const o = h('option', null, 'No reward'); o.value = ''; kind.append(o); }
    for (const [k, p] of Object.entries(REWARDS)) { const o = h('option', null, `${p.label} (${p.slot})`); o.value = k; kind.append(o); }
    if (lv.reward && !made) { const o = h('option', null, 'Custom look (from a file)'); o.value = 'custom'; kind.append(o); }
    kind.value = lv.reward ? (made ? made.preset : 'custom') : '';
    const colour = (v) => { const s = h('select'); for (const [hex, nm] of PALETTE) { const o = h('option', null, nm); o.value = hex; s.append(o); } if (!PALETTE.some((p) => p[0] === v)) { const o = h('option', null, v); o.value = v; s.append(o); } s.value = v; return s; };
    const rname = h('input'); rname.type = 'text'; rname.maxLength = REWARD_LIMITS.name; rname.value = lv.reward ? lv.reward.name : ''; rname.autocomplete = 'off'; rname.placeholder = 'Item name';
    const rdesc = h('input'); rdesc.type = 'text'; rdesc.maxLength = REWARD_LIMITS.desc; rdesc.value = lv.reward ? lv.reward.desc : ''; rdesc.autocomplete = 'off'; rdesc.placeholder = 'One line about it (optional)';
    const ca = colour(made ? made.a : '#ffd166'), cb = colour(made ? made.b : '#ff5d8f');
    const applyReward = () => {
      const k = kind.value;
      if (!k) delete lv.reward;
      else {
        const raw = k === 'custom' ? Object.assign({}, lv.reward, { name: rname.value, desc: rdesc.value }) : { name: rname.value, desc: rdesc.value, slot: REWARDS[k].slot, look: REWARDS[k].look(ca.value, cb.value) };
        lv.reward = canonReward(raw) || raw; // kept as typed until it checks out; the status line says why
      }
      autosave(); refreshHud();
    };
    kind.onchange = () => { if (kind.value && kind.value !== 'custom' && !rname.value.trim()) rname.value = REWARDS[kind.value].label; applyReward(); renderAgain(); };
    rname.oninput = applyReward; rdesc.oninput = applyReward; ca.onchange = applyReward; cb.onchange = applyReward;
    field(rw, 'Reward', kind);
    if (kind.value) { field(rw, 'Item name', rname); field(rw, 'About it', rdesc); if (kind.value !== 'custom') { field(rw, 'Main colour', ca); field(rw, 'Accent', cb); } }
    // drafts
    const dr = sec('Drafts (saved in this browser)');
    store.slots.forEach((s, i) => {
      const label = slotLabel(s, i); if (!label) return;
      const row = h('div', 'bd-slotrow' + (i === slot ? ' on' : ''));
      row.append(h('span', null, (i === slot ? '● ' : '') + label));
      if (i !== slot) { const o = h('button', 'btn', 'Open'); o.onclick = () => { writeStore(); useSlot(i); afterSwitch(); renderAgain(); }; row.append(o); }
      const del = h('button', 'btn', 'Delete');
      del.onclick = () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Press again to delete'; return; }
        store.slots[i] = null;
        if (i === slot) { const j = store.slots.findIndex(Boolean); if (j >= 0) useSlot(j); else { store.slots[0] = { level: starter(), at: Date.now() }; useSlot(0); } afterSwitch(); }
        writeStore(); renderAgain();
      };
      row.append(del); dr.append(row);
    });
    const nb = h('button', 'btn', 'New draft');
    nb.onclick = () => {
      const j = Array.from({ length: MAX_SLOTS }, (_, k) => k).find((k) => !store.slots[k]);
      if (j == null) { nb.textContent = `All ${MAX_SLOTS} drafts are used: delete one first`; return; }
      writeStore(); store.slots[j] = { level: starter('My Level ' + (j + 1)), at: Date.now() }; useSlot(j); afterSwitch(); writeStore(); renderAgain();
    };
    dr.append(nb);
    // share: export and import as JSON
    const sh = sec('Export and import');
    const json = exportText();
    const out = h('textarea', 'code bd-json'); out.readOnly = true; out.value = json; out.rows = 5; out.setAttribute('aria-label', 'This level as JSON');
    const exp = h('div', 'btnrow');
    const cp = h('button', 'btn', 'Copy JSON');
    cp.onclick = async () => { try { await navigator.clipboard.writeText(json); cp.textContent = 'Copied'; } catch (e) { out.focus(); out.select(); cp.textContent = 'Selected: press Ctrl+C'; } setTimeout(() => { cp.textContent = 'Copy JSON'; }, 1800); };
    const dl = h('button', 'btn', 'Download .json');
    dl.onclick = () => { const a = h('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = (lv.name || 'level').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
    exp.append(cp, dl); sh.append(exp, out);
    const size = h('div', 'muted small'); sh.append(size);
    gzSize(json).then((n) => { if (n != null) size.textContent = `${(json.length / 1024).toFixed(1)} KB as text, about ${(n / 1024).toFixed(1)} KB packed for the relays${n > 36000 ? ': too big to publish (relays refuse events over about 48 KB, with the clear run). Remove some pieces.' : '.'}`; });
    const inp = h('textarea', 'code'); inp.placeholder = 'Paste a level (JSON, format elsewhere-level/1) to open it as a new draft'; inp.rows = 3;
    const res = h('div', 'vres');
    const ld = h('button', 'btn', 'Open as a new draft');
    ld.onclick = () => { let raw; try { raw = JSON.parse(inp.value); } catch (e) { res.className = 'vres bad'; res.textContent = 'That is not valid JSON.'; return; } const r = importLevel(raw); res.className = 'vres ' + (r.error ? 'bad' : 'ok'); res.textContent = r.error || r.ok; if (!r.error) renderAgain(); };
    const file = h('input'); file.type = 'file'; file.accept = '.json,application/json'; file.className = 'bd-file';
    file.onchange = async () => { const f = file.files && file.files[0]; if (!f) return; try { inp.value = await f.text(); ld.onclick(); } catch (e) { res.className = 'vres bad'; res.textContent = 'Could not read that file.'; } };
    const imp = h('div', 'btnrow'); imp.append(ld, file);
    sh.append(inp, imp, res);
  }
  function renderAgain() { if (modal === 'menu') { dom.card.innerHTML = ''; renderMenu(dom.card); const f = dom.card.querySelector('[data-focus]'); if (f) f.focus(); } }
  function afterSwitch() { markKey = ''; redraw(); applyTheme(); say(`Draft ${slot + 1}: ${lv.name || 'Untitled'}.`); }
  async function gzSize(text) {
    try { const s = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip')); return (await new Response(s).arrayBuffer()).byteLength; } catch (e) { return null; }
  }
  // the level as a file: the canonical form checkLevel gives (without the author, which test play fills in)
  function exportText() {
    const c = checkLevel(JSON.parse(JSON.stringify(lv)));
    const l = c.error ? lv : c.level;
    const out = { format: l.format || LEVEL_FORMAT, name: l.name, blurb: l.blurb, theme: l.theme, color: l.color, spawn: l.spawn, goal: l.goal, parts: l.parts, things: l.things, reward: l.reward || undefined };
    return JSON.stringify(out, null, 1);
  }
  // open any level (pasted JSON, a file, a level from the Gate) as a new draft
  function importLevel(raw, opts = {}) {
    const c = checkLevel(raw);
    if (c.error) return { error: 'That level does not check out: ' + c.error + '.' };
    const fresh = sanitize(c.level);
    const same = store.slots.findIndex((s) => s && JSON.stringify(s.level) === JSON.stringify(fresh)); // drafts are stored canonical
    if (same >= 0) { if (same !== slot) { writeStore(); useSlot(same); afterSwitch(); } return { ok: `It is already draft ${same + 1}; opened it.` }; }
    let j = Array.from({ length: MAX_SLOTS }, (_, k) => k).find((k) => !store.slots[k]);
    if (j == null) { if (opts.replace === false) return { error: `All ${MAX_SLOTS} drafts are used: delete one first.` }; j = slot; }
    writeStore(); store.slots[j] = { level: fresh, at: Date.now() }; useSlot(j); afterSwitch(); writeStore();
    return { ok: `Opened "${fresh.name}" as draft ${j + 1}.` };
  }

  // ---- test play and publishing ----
  async function rawWithAuthor(level) {
    const key = await ensureKey(profile); // as the Gate does: your name and key go on the level, so its clear run can publish it
    return Object.assign(JSON.parse(JSON.stringify(level || lv)), { author: { name: profile.data.name || 'Wanderer', key: key ? key.pub : '' } });
  }
  const clearedOn = (m) => (r) => r.proof && r.proof.world.id === m.id && r.proof.world.sha256 === m.sha256 && r.proof.claims.some((c) => c[1] === 'record' && c[2] === 'time');
  async function testPlay() {
    if (pending) { pending = null; syncPending(); syncGhost(); }
    const raw = await rawWithAuthor();
    const c = checkLevel(raw);
    if (c.error) return fail('Not ready to test: ' + c.error + '.');
    const s = slot;
    writeStore();
    B.close();
    // earlier test versions of this draft that were never cleared are not worth listing at the Gate
    for (const [id, L0] of Object.entries(E.localLevels)) if (L0.builder === s && !(E.world && E.world.id === id) && !E.runs.some(clearedOn(L0))) delete E.localLevels[id];
    try {
      const m = await E.playLevel(raw);
      if (E.localLevels[m.id]) E.localLevels[m.id].builder = s;
      E.toast('Testing your level. Esc, then Enter: back to the Builder.');
      return m;
    } catch (err) { E.toast('Could not start the level: ' + err.message, 'bad'); }
  }
  // Publishing needs a clear run of exactly this version: take the player to the Gate when there is one
  async function publishFlow(line) {
    const show = (t, k) => { line.className = 'vres ' + (k || ''); line.textContent = t; };
    const raw = await rawWithAuthor();
    const c = checkLevel(raw);
    if (c.error) return show('Not ready: ' + c.error + '.', 'bad');
    const m = await compileLevel(c.level), cl = clearedOn(m);
    if (E.runs.some(cl)) {
      await E.addLocalLevel(raw); E.localLevels[m.id].builder = slot;
      closeModal(); B.close(); E.ui.openPanel('gate');
      return;
    }
    if (E.world && E.world.id === m.id && E.sim && E.sim.claims.some((x) => x[1] === 'record' && x[2] === 'time')) {
      // cleared in this visit: leave the level (that seals the clear run), then open the Gate
      closeModal(); B.close(); E.leaveTo('hub');
      const t0 = Date.now();
      const iv = setInterval(() => { if (E.world && E.world.id === 'hub' && !E.traveling && E.runs.some(cl)) { clearInterval(iv); E.ui.openPanel('gate'); } else if (Date.now() - t0 > 30000) clearInterval(iv); }, 250);
      return;
    }
    show('Clear it first: press P to test play and reach the golden flag. The validator replays that clear run before it accepts your level. (Any change makes a new version that needs its own clear.)');
  }
  // after a reload, a draft you already cleared is publishable again: list it at the Gate
  B.restoreCleared = async () => {
    try {
      if (!store && !localStorage.getItem(STORE)) return 0; // never used the Builder: nothing to restore
      loadStore();
      let n = 0;
      for (let i = 0; i < store.slots.length; i++) {
        const s = store.slots[i]; if (!s || !s.level) continue;
        const raw = await rawWithAuthor(i === slot ? lv : sanitize(s.level));
        const c = checkLevel(raw); if (c.error) continue;
        const m = await compileLevel(c.level);
        if (!E.localLevels[m.id] && E.runs.some(clearedOn(m))) { await E.addLocalLevel(raw); E.localLevels[m.id].builder = i; n++; }
      }
      return n;
    } catch (e) { return 0; }
  };

  // ---- theme, keys, mouse ----
  async function applyTheme() {
    const want = lv.theme, t = await themeFor(want);
    if (!B.active || lv.theme !== want) return;
    E.render.applyTheme(t.theme);
    if (E.applySky) E.applySky(t.theme);
    E.render.sky.stars.visible = true;
    E.audio.music(t.music);
  }
  function nudge(code) {
    if (code === 'KeyJ') view.yaw += 15 * DEG; else if (code === 'KeyL') view.yaw -= 15 * DEG;
    else if (code === 'KeyI') view.pitch = clamp(view.pitch + 0.08, 0.12, 1.45); else if (code === 'KeyK') view.pitch = clamp(view.pitch - 0.08, 0.12, 1.45);
    else if (code === 'KeyU') view.dist = clamp(view.dist / 1.15, 4, 120); else if (code === 'KeyO') view.dist = clamp(view.dist * 1.15, 4, 120);
    if (code === 'KeyI' || code === 'KeyK') view.top = false;
  }
  function resetView() { view.yaw = lv.spawn[3] * DEG; view.pitch = 0.62; view.dist = 22; view.top = false; say('View reset.'); }
  function handleKey(code, shift, rep) {
    switch (code) {
      case 'KeyW': case 'ArrowUp': return shift ? stretch(2, 1) : move(0, 1);
      case 'KeyS': case 'ArrowDown': return shift ? stretch(2, -1) : move(0, -1);
      case 'KeyA': case 'ArrowLeft': return shift ? stretch(0, -1) : move(-1, 0);
      case 'KeyD': case 'ArrowRight': return shift ? stretch(0, 1) : move(1, 0);
      case 'KeyR': case 'PageUp': return shift ? stretch(1, 1) : lift(1);
      case 'KeyF': case 'PageDown': return shift ? stretch(1, -1) : lift(-1);
      case 'KeyQ': return turn(1);
      case 'KeyE': return turn(-1);
      case 'Equal': case 'NumpadAdd': return resize(1);
      case 'Minus': case 'NumpadSubtract': return resize(-1);
      case 'KeyC': return recolor(shift ? -1 : 1);
      case 'KeyB': return reglow();
      case 'KeyX': return copyHovered();
      case 'KeyG': return regrid();
      case 'Tab': return pick((PIECES.indexOf(piece) + (shift ? PIECES.length - 1 : 1)) % PIECES.length);
      case 'Enter': case 'NumpadEnter': case 'Space': if (!rep) place(); return;
      case 'Backspace': case 'Delete': if (!rep) remove(); return;
      case 'KeyZ': return shift ? redo() : undo();
      case 'KeyY': return redo();
      case 'KeyJ': case 'KeyL': case 'KeyI': case 'KeyK': case 'KeyU': case 'KeyO': if (!rep) { held.add(code); nudge(code); } return;
      case 'KeyT': view.top = !view.top; return say(view.top ? 'Top view (T again to tilt back).' : 'Tilted view.');
      case 'Home': return resetView();
      case 'KeyH': help = !help; writeStore(); return refreshHud();
      case 'KeyP': if (!rep) testPlay(); return;
      case 'Escape': if (pending) return remove(); return openMenu();
    }
    const d = /^(Digit|Numpad)(\d)$/.exec(code);
    if (d) { const n = +d[2]; if (shift && d[1] === 'Digit') { if (n >= 1) pick(9 + n); } else pick(n === 0 ? 9 : n - 1); return; }
    return false;
  }
  function onKeyDown(ev) {
    if (!B.active) return;
    const code = ev.code;
    if (modal) {
      if (ev.target instanceof Node && dom.modal.contains(ev.target)) return; // the dialog handles its own keys (and keeps them from the game)
      ev.stopPropagation();
      if (code === 'Escape') { ev.preventDefault(); closeModal(); } else if (code === 'Tab') { ev.preventDefault(); const f = dom.card.querySelector('button, input, select, textarea'); if (f) f.focus(); }
      return;
    }
    if (code === 'KeyV' && !ev.ctrlKey && !ev.metaKey) return; // push-to-talk keeps working
    ev.stopPropagation(); // the game never sees Builder keys
    if (ev.ctrlKey || ev.metaKey || ev.altKey) {
      if ((ev.ctrlKey || ev.metaKey) && code === 'KeyZ') { ev.preventDefault(); if (ev.shiftKey) redo(); else undo(); }
      else if ((ev.ctrlKey || ev.metaKey) && code === 'KeyY') { ev.preventDefault(); redo(); }
      return; // anything else belongs to the browser
    }
    if (handleKey(code, ev.shiftKey, ev.repeat) !== false) ev.preventDefault();
  }
  function onKeyUp(ev) { held.delete(ev.code); }
  function onBlur() { held.clear(); }
  // the mouse (optional): wheel zooms, right-drag turns the view, a click moves the cursor there (a second click places)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  let drag = null;
  function onWheel(ev) { if (modal) return; view.dist = clamp(view.dist * (ev.deltaY > 0 ? 1.12 : 1 / 1.12), 4, 120); }
  function onDown(ev) { if (modal) return; drag = { x: ev.clientX, y: ev.clientY, b: ev.button, moved: false }; }
  function onMove(ev) {
    if (!drag || modal) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    if (drag.b === 2 || drag.b === 1) { view.yaw -= dx * 0.008; view.pitch = clamp(view.pitch + dy * 0.006, 0.12, 1.45); view.top = false; drag.x = ev.clientX; drag.y = ev.clientY; }
  }
  function onUp(ev) {
    if (!drag || modal) { drag = null; return; }
    const d = drag; drag = null;
    if (d.b !== 0 || d.moved) return;
    ndc.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, E.camera);
    if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -cur.y), hit)) return;
    const x = lim(snap(hit.x)), z = lim(snap(hit.z));
    if (x === cur.x && z === cur.z) place(); else setCursor(x, cur.y, z);
  }
  const listeners = [[window, 'keydown', onKeyDown, true], [window, 'keyup', onKeyUp, true], [window, 'blur', onBlur, false]];
  const canvasListeners = [['wheel', onWheel], ['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp]];

  // ---- open and close ----
  B.open = async (opts = {}) => {
    if (B.active) return true;
    if (E.traveling || !E.world) return false;
    if (E.ui.panelOpen) E.ui.closePanel();
    if (E.ui.busy) { E.toast('Close the dialog first.'); return false; }
    ensureDom(); ensureScene(); loadStore();
    if (opts.level) { const r = importLevel(opts.level); if (r.error) E.toast(r.error, 'bad'); }
    else if (opts.slot != null && store.slots[opts.slot]) useSlot(opts.slot);
    B.active = true; B.used = true;
    saved = { fov: E.camera.fov, stars: E.render.sky.stars.visible };
    E.input.setEnabled(false);
    E.audio.wind(0); E.audio.hum(0, 0);
    E.ui.prompt(null);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    document.body.classList.add('building');
    dom.root.classList.remove('hidden');
    keepVisible.clear();
    for (const o of [root, E.render.sky.mesh, E.render.sky.stars, E.render.clouds, E.render.sun.target, E.fx.glow.points, E.fx.soft.points]) keepVisible.add(o);
    E.scene.add(root);
    E.camera.fov = 55; E.camera.updateProjectionMatrix();
    for (const [t, n, f, c] of listeners) t.addEventListener(n, f, c);
    const cv = E.render.renderer.domElement;
    for (const [n, f] of canvasListeners) cv.addEventListener(n, f);
    markKey = ''; ghostKey = '';
    redraw();
    applyTheme();
    E.audio.play('pickup');
    say(`Draft ${slot + 1}: ${lv.name}. ${help ? 'P test plays it · H hides the keys' : 'H shows the keys · P test plays it'}.`);
    return true;
  };
  B.close = () => {
    if (!B.active) return;
    writeStore();
    B.active = false;
    held.clear(); drag = null;
    if (modal) closeModal();
    for (const [t, n, f, c] of listeners) t.removeEventListener(n, f, c);
    const cv = E.render.renderer.domElement;
    for (const [n, f] of canvasListeners) cv.removeEventListener(n, f);
    dom.root.classList.add('hidden');
    document.body.classList.remove('building');
    root.removeFromParent();
    for (const o of hidden) o.visible = true;
    hidden.length = 0;
    // the world as it was: its theme, sky and music, and the game's camera
    const mod = E.world && E.world.mod;
    const t = (mod && mod.theme) || {};
    E.render.applyTheme(t);
    if (E.applySky) E.applySky(t);
    if (saved) { E.render.sky.stars.visible = saved.stars; E.camera.fov = saved.fov; E.camera.updateProjectionMatrix(); }
    E.audio.music((mod && mod.music) || null);
    E.input.setEnabled(!E.ui.busy);
    E.ui.refreshHud();
  };
  // every rendered frame while open (main.js calls this instead of the game camera; the world does not tick)
  B.frame = (dt) => {
    for (const o of E.scene.children) if (o.visible && !keepVisible.has(o) && !o.isLight) { o.visible = false; hidden.push(o); }
    for (const k of held) {
      if (k === 'KeyJ') view.yaw += 1.9 * dt; else if (k === 'KeyL') view.yaw -= 1.9 * dt;
      else if (k === 'KeyI') view.pitch = clamp(view.pitch + 1.1 * dt, 0.12, 1.45); else if (k === 'KeyK') view.pitch = clamp(view.pitch - 1.1 * dt, 0.12, 1.45);
      else if (k === 'KeyU') view.dist = clamp(view.dist * (1 - 1.2 * dt), 4, 120); else if (k === 'KeyO') view.dist = clamp(view.dist * (1 + 1.2 * dt), 4, 120);
    }
    vis.set(damp(vis.x, cur.x, 26, dt), damp(vis.y, cur.y, 26, dt), damp(vis.z, cur.z, 26, dt));
    cursorG.position.copy(vis); ghostG.position.copy(vis);
    cursorG.children[0].scale.setScalar(1 + Math.sin(performance.now() / 260) * 0.12);
    const gy = Math.abs(vis.y) > 0.05;
    dropLine.visible = gy;
    if (gy) { const p = dropLine.geometry.attributes.position; p.setXYZ(0, vis.x, vis.y, vis.z); p.setXYZ(1, vis.x, 0, vis.z); p.needsUpdate = true; dropLine.computeLineDistances(); }
    gridObj.position.set(Math.round(vis.x / grid) * grid, vis.y + 0.012, Math.round(vis.z / grid) * grid);
    cam.t.set(damp(cam.t.x, vis.x, 8, dt), damp(cam.t.y, vis.y + 0.5, 8, dt), damp(cam.t.z, vis.z, 8, dt));
    cam.yaw = dampAngle(cam.yaw, view.yaw, 10, dt); cam.pitch = damp(cam.pitch, view.top ? 1.45 : view.pitch, 9, dt); cam.dist = damp(cam.dist, view.dist, 9, dt);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    E.camera.position.set(cam.t.x - Math.sin(cam.yaw) * cp * cam.dist, cam.t.y + sp * cam.dist, cam.t.z - Math.cos(cam.yaw) * cp * cam.dist);
    E.camera.lookAt(cam.t);
    B.focus.copy(cam.t);
  };
  // for the Gate, tests and tools
  B.level = () => JSON.parse(JSON.stringify(lv));
  B.exportText = () => exportText();
  B.check = () => checkLevel(JSON.parse(JSON.stringify(lv)));
  B.state = () => ({ active: B.active, slot, piece: piece.id, cursor: [cur.x, cur.y, cur.z], grid, pending: !!pending, modal, hover: hover ? (hover.marker || (hover.part ? 'part ' : 'thing ') + hover.i) : null, brush: JSON.parse(JSON.stringify(brush())), undo: undoStack.length });
  return B;
}

// the entry the brush makes at the cursor, in canonical form
function makeEntry(pc, br, c) {
  const s = br.size, x = c.x, y = c.y, z = c.z;
  let e;
  if (pc.part) {
    const d = s[0], hgt = pc.ball ? d : s[1];
    e = { s: pc.part, p: [x, pc.top ? y - hgt / 2 : y + hgt / 2, z], z: pc.ball ? [d, d, d] : pc.round ? [d, s[1], d] : s.slice(), y: br.yaw, c: br.color };
    if (br.glow) e.g = br.glow;
  } else switch (pc.thing) {
    case 'pad': e = { t: 'pad', p: [x, y, z], power: br.power }; if (br.push) e.push = [Math.sin(br.yaw * DEG) * br.push, Math.cos(br.yaw * DEG) * br.push]; break;
    case 'boost': case 'checkpoint': e = { t: pc.thing, p: [x, y, z], y: br.yaw }; break;
    case 'sign': e = { t: 'sign', p: [x, y, z], y: br.yaw, title: br.title, text: br.text }; break;
    case 'label': e = { t: 'label', p: [x, y + 1.5, z], text: br.text }; break;
    case 'crumble': case 'mover': e = { t: pc.thing, p: [x, y - s[1] / 2, z], z: s.slice(), c: br.color }; if (pc.thing === 'mover') { e.to = e.p.slice(); e.speed = br.speed; } break;
    case 'hazard': e = { t: 'hazard', p: [x, y + s[1] / 2, z], z: s.slice() }; break;
    case 'wind': e = { t: 'wind', p: [x, y + s[1] / 2, z], z: s.slice(), f: [0, br.force, 0] }; break;
    default: throw new Error('not a piece');
  }
  return canonEntry(e, !!pc.part);
}

// for tests: the ready-made reward looks and how saved rewards map back to them
export { REWARDS, matchPreset, canonReward };
