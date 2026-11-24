// Items are data. Traits are behaviour.
// An item (defined by any world's manifest) carries a list of traits. The engine implements
// the universal traits below; each world's rules decide which traits are active inside it.
// That is how an item earned in one world can mean something in every other world.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat } from './render.js';
import { DEG } from './util.js';

// 'charm': an artifact with an active power (POWERS below). It hovers at your shoulder.
export const SLOTS = ['head', 'back', 'hand', 'feet', 'board', 'body', 'charm'];
export const TRAITS = {
  glide: { name: 'Glide', desc: 'Hold jump while falling to glide.' },
  doublejump: { name: 'Double jump', desc: 'Jump once more in mid-air.' },
  light: { name: 'Light', desc: 'Carries light into dark places.' },
  board: { name: 'Vehicle', desc: 'Press B to ride.' },
  speed: { name: 'Speed', desc: 'Move faster on foot.' },
  cosmetic: { name: 'Cosmetic', desc: 'Looks only. Allowed everywhere.' },
  key: { name: 'Key', desc: 'Opens something, somewhere.' },
  blade: { name: 'Blade', desc: 'Press 1 to strike. Deals damage where a world has something to hit.' },
  // artifacts' powers (one each; a charm's power is its trait, so a world can switch one off by name)
  rewind: { name: 'Rewind', desc: 'Hold 2 to run back through your last minute.' },
  shield: { name: 'Shield', desc: 'Press 2: a bubble that no hit gets through, for a few seconds.' },
  finder: { name: 'Finder', desc: 'Press 2: a trail of light to the nearest thing still to find here.' },
  transform: { name: 'Transform', desc: 'Press 2 to change shape for a while; again to change back.' },
};
// Item families. A world can switch a whole family off (rules: { magic: false } or { machines: false }): its items
// sleep there, abilities and powers both. Items with no family (clothes, keys, blades, lanterns) are never asleep for it.
export const FAMILIES = { magic: { name: 'Magic', off: 'no magic works here' }, machine: { name: 'Machine', off: 'machines sleep here' } };
// The powers an artifact can carry, with the limits the engine holds every item to (seconds it lasts, seconds to
// recharge after it ends). An item names one: power: { kind, seconds, cooldown, ...kind's own fields }.
export const POWERS = {
  rewind: { seconds: [1, 60, 60], cooldown: [5, 120, 20] }, // seconds: how far back it can go
  shield: { seconds: [1, 15, 6], cooldown: [5, 120, 25] },
  finder: { seconds: [1, 10, 6], cooldown: [3, 120, 8] }, // seconds: how long the trail shows
  transform: { seconds: [3, 60, 20], cooldown: [5, 180, 30] },
};
const clampN = (v, lo, hi, d) => (typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
// an item's power, checked and clamped (null when it has none, or names a kind the engine does not have)
export function powerOf(def) {
  const p = def && def.power;
  if (!p || typeof p !== 'object' || !Object.prototype.hasOwnProperty.call(POWERS, p.kind) || !def.traits.includes(p.kind)) return null;
  const L = POWERS[p.kind], out = { kind: p.kind, seconds: clampN(p.seconds, L.seconds[0], L.seconds[1], L.seconds[2]), cooldown: clampN(p.cooldown, L.cooldown[0], L.cooldown[1], L.cooldown[2]) };
  if (p.kind === 'transform') { // a form: how fast it runs and how high it jumps (multipliers), and what it looks like
    const f = p.form || {};
    out.form = { name: typeof f.name === 'string' ? f.name.slice(0, 24) : 'another shape', speed: clampN(f.speed, 0.5, 1.6, 1), jump: clampN(f.jump, 0.5, 1.4, 1), look: Array.isArray(f.look) ? f.look : [], height: clampN(f.height, 0.3, 3, 1.2) };
  }
  return out;
}
export const RARITY = { common: '#b8c4d6', uncommon: '#62e39b', rare: '#4fb3ff', epic: '#c77dff', legendary: '#ffc94d', creator: '#ff8fd8' };

// An item registry. The live game uses `items`; a replay builds its own from the worlds a run pinned.
export function createItems() {
  return {
    defs: {},
    register(id, def, source) {
      if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(id)) throw new Error('bad item id ' + id);
      this.defs[id] = Object.assign({ id, source, slot: null, traits: [], rarity: 'common', desc: '', look: [] }, def);
      const d = this.defs[id];
      if (d.family != null && !Object.prototype.hasOwnProperty.call(FAMILIES, d.family)) d.family = null; // an unknown family is no family
    },
    get(id) { return Object.prototype.hasOwnProperty.call(this.defs, id) ? this.defs[id] : null; },
  };
}
export const items = createItems();

// Is a trait active in a world with these rules? Cosmetics are allowed unless explicitly denied.
// The world switches: fighting: false (no strikes, so no blades), powers: false (every artifact's power sleeps).
export function traitAllowed(trait, rules) {
  rules = rules || {};
  if (rules.deny && rules.deny.includes(trait)) return false;
  if (rules.allow && trait !== 'cosmetic' && !rules.allow.includes(trait)) return false;
  if (trait === 'blade' && rules.fighting === false) return false;
  if (rules.powers === false && Object.prototype.hasOwnProperty.call(POWERS, trait)) return false;
  return true;
}
// Is an item's family awake in a world with these rules? (magic: false, machines: false)
export function familyAllowed(def, rules) {
  rules = rules || {};
  const f = def && def.family;
  return f === 'magic' ? rules.magic !== false : f === 'machine' ? rules.machines !== false : true;
}
export function itemActive(def, rules) {
  return !!def && familyAllowed(def, rules) && def.traits.every((t) => traitAllowed(t, rules));
}
// why an item sleeps in a world with these rules, in words (null when it works)
export function asleepWhy(def, rules) {
  if (!def || itemActive(def, rules)) return null;
  if (!familyAllowed(def, rules)) return FAMILIES[def.family].off;
  const t = def.traits.find((x) => !traitAllowed(x, rules));
  if (t === 'blade' && rules && rules.fighting === false) return 'no fighting here';
  if (rules && rules.powers === false && Object.prototype.hasOwnProperty.call(POWERS, t)) return 'artifacts sleep here';
  return `${TRAITS[t] ? TRAITS[t].name.toLowerCase() : t} is off here`;
}

// ---- Looks: small 3D models described as data, so items can be defined without code ----
const GEO = {};
function geo(kind) {
  if (GEO[kind]) return GEO[kind];
  let g;
  switch (kind) {
    case 'box': g = new THREE.BoxGeometry(1, 1, 1); break;
    case 'rbox': g = new RoundedBoxGeometry(1, 1, 1, 2, 0.12); break;
    case 'cyl': g = new THREE.CylinderGeometry(1, 1, 1, 16); break;
    case 'cone': g = new THREE.ConeGeometry(1, 1, 16); break;
    case 'sphere': g = new THREE.SphereGeometry(1, 16, 12); break;
    case 'torus': g = new THREE.TorusGeometry(1, 0.12, 8, 24); break;
    case 'oct': g = new THREE.OctahedronGeometry(1, 0); break;
    case 'ico': g = new THREE.IcosahedronGeometry(1, 0); break;
    default: g = new THREE.BoxGeometry(1, 1, 1);
  }
  g.userData.keep = true;
  return (GEO[kind] = g);
}
// A part: { s:'box'|'rbox'|'cyl'|'cone'|'sphere'|'torus'|'oct'|'ico', size:[x,y,z] | r/h, pos:[x,y,z], rot:[deg,deg,deg], color, glow, metal }
function torusGeo(r, tube) {
  const k = `torus:${r}:${tube}`;
  if (!GEO[k]) { GEO[k] = new THREE.TorusGeometry(r, tube, 10, Math.min(160, Math.max(24, Math.round(r * 10)))); GEO[k].userData.keep = true; }
  return GEO[k];
}
export function buildLook(parts) {
  const g = new THREE.Group();
  for (const p of parts || []) {
    const geometry = p.s === 'torus' ? torusGeo(p.r || 0.3, p.tube || 0.04) : geo(p.s);
    const m = new THREE.Mesh(geometry, mat(p.color || '#cccccc', { glow: p.glow || 0, metal: p.metal || 0, rough: p.rough, opacity: p.opacity }));
    if (p.size) m.scale.set(p.size[0], p.size[1], p.size[2]);
    else if (p.s === 'cyl' || p.s === 'cone') m.scale.set(p.r || 0.2, p.h || 0.2, p.r || 0.2);
    else if (p.s !== 'torus') m.scale.setScalar(p.r || 0.2);
    if (p.pos) m.position.set(p.pos[0], p.pos[1], p.pos[2]);
    if (p.rot) m.rotation.set(p.rot[0] * DEG, p.rot[1] * DEG, p.rot[2] * DEG);
    m.castShadow = true;
    if (p.name) m.name = p.name;
    g.add(m);
  }
  return g;
}

// Small square icon for UI, rendered once per item with the main renderer.
const iconCache = {};
let iconRig = null;
export function itemIcon(renderer, id) {
  if (iconCache[id]) return iconCache[id];
  const def = items.get(id);
  if (def && def.icon) return (iconCache[id] = def.icon); // a portrait image (characters)
  if (!def || !renderer) return '';
  if (!iconRig) {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, 2.2));
    const d = new THREE.DirectionalLight(0xffffff, 2.2); d.position.set(2, 3, 4); scene.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    const rt = new THREE.WebGLRenderTarget(96, 96, { samples: 4 });
    iconRig = { scene, cam, rt, buf: new Uint8Array(96 * 96 * 4) };
  }
  const { scene, cam, rt, buf } = iconRig;
  const look = buildLook(def.look);
  if (Array.isArray(def.iconRot)) look.rotation.set(def.iconRot[0] * Math.PI / 180, def.iconRot[1] * Math.PI / 180, def.iconRot[2] * Math.PI / 180); // e.g. a blade shown diagonally
  scene.add(look);
  const box = new THREE.Box3().setFromObject(look);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const r = Math.max(size.x, size.y, size.z, 0.2);
  cam.position.copy(center).add(new THREE.Vector3(0.9, 0.7, 1.4).normalize().multiplyScalar(r * 2.6));
  cam.lookAt(center);
  const prevTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(rt);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, cam);
  renderer.readRenderTargetPixels(rt, 0, 0, 96, 96, buf);
  renderer.setRenderTarget(prevTarget);
  scene.remove(look);
  // render targets hold linear colour; convert to sRGB for the <img>
  for (let i = 0; i < buf.length; i += 4) for (let k = 0; k < 3; k++) {
    const x = buf[i + k] / 255;
    buf[i + k] = Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
  }
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(96, 96);
  for (let y = 0; y < 96; y++) img.data.set(buf.subarray((95 - y) * 96 * 4, (96 - y) * 96 * 4), y * 96 * 4);
  ctx.putImageData(img, 0, 0);
  return (iconCache[id] = c.toDataURL());
}
