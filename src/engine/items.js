// Items are data. Traits are behaviour.
// An item (defined by any world's manifest) carries a list of traits. The engine implements
// the universal traits below; each world's rules decide which traits are active inside it.
// That is how an item earned in one world can mean something in every other world.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat } from './render.js';
import { DEG } from './util.js';

export const SLOTS = ['head', 'back', 'hand', 'feet', 'board', 'body'];
export const TRAITS = {
  glide: { name: 'Glide', desc: 'Hold jump while falling to glide.' },
  doublejump: { name: 'Double jump', desc: 'Jump once more in mid-air.' },
  light: { name: 'Light', desc: 'Carries light into dark places.' },
  board: { name: 'Vehicle', desc: 'Press B to ride.' },
  speed: { name: 'Speed', desc: 'Move faster on foot.' },
  cosmetic: { name: 'Cosmetic', desc: 'Looks only. Allowed everywhere.' },
  key: { name: 'Key', desc: 'Opens something, somewhere.' },
  blade: { name: 'Blade', desc: 'Press 1 to strike. Deals damage where a world has something to hit.' },
};
export const RARITY = { common: '#b8c4d6', uncommon: '#62e39b', rare: '#4fb3ff', epic: '#c77dff', legendary: '#ffc94d' };

// An item registry. The live game uses `items`; a replay builds its own from the worlds a run pinned.
export function createItems() {
  return {
    defs: {},
    register(id, def, source) {
      if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(id)) throw new Error('bad item id ' + id);
      this.defs[id] = Object.assign({ id, source, slot: null, traits: [], rarity: 'common', desc: '', look: [] }, def);
    },
    get(id) { return Object.prototype.hasOwnProperty.call(this.defs, id) ? this.defs[id] : null; },
  };
}
export const items = createItems();

// Is a trait active in a world with these rules? Cosmetics are allowed unless explicitly denied.
export function traitAllowed(trait, rules) {
  rules = rules || {};
  if (rules.deny && rules.deny.includes(trait)) return false;
  if (rules.allow && trait !== 'cosmetic' && !rules.allow.includes(trait)) return false;
  return true;
}
export function itemActive(def, rules) {
  return !!def && def.traits.every((t) => traitAllowed(t, rules));
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
