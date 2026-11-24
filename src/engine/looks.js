// Looks: the wardrobe's catalogue and the kit that builds a look onto an avatar (avatar.js setLookKit).
// A look is plain data: { style, face, mouth, top, tail, outfit, extra, finish, colors: { body, head, eyes, outfit, trim } }.
// Everything here is presentation and lives outside the engine (replays never draw), so new styles and outfits can
// be added without a new engine. Shapes follow ART.md: chunky primitives in flat colours; only the eyes glow.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat } from './render.js';

const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const DEG = Math.PI / 180;

// ---- the catalogue (names as players see them) ----
export const STYLES = {
  bot: { name: 'Bot' }, round: { name: 'Round' }, block: { name: 'Block' }, tall: { name: 'Tall' }, little: { name: 'Little' }, bean: { name: 'Bean' },
};
export const FACES = {
  visor: { name: 'Visor', glow: true }, eyes: { name: 'Eyes', glow: true }, big: { name: 'Big eyes' }, happy: { name: 'Happy', glow: true },
  sleepy: { name: 'Sleepy', glow: true }, mono: { name: 'One eye', glow: true }, shades: { name: 'Shades' },
};
export const MOUTHS = { none: { name: 'None' }, smile: { name: 'Smile' }, grin: { name: 'Grin' }, o: { name: 'Oh' }, cat: { name: 'Cat' } };
export const TOPS = {
  none: { name: 'None' }, cat: { name: 'Cat ears' }, bear: { name: 'Bear ears' }, bunny: { name: 'Bunny ears' }, horns: { name: 'Horns' },
  sprout: { name: 'Sprout' }, crest: { name: 'Crest' }, bun: { name: 'Bun' },
};
export const TAILS = { none: { name: 'None' }, cat: { name: 'Cat' }, fox: { name: 'Fox' }, bunny: { name: 'Bunny' }, dino: { name: 'Dino' }, cord: { name: 'Power cord' } };
export const OUTFITS = {
  none: { name: 'None' }, tee: { name: 'Tee' }, hoodie: { name: 'Hoodie' }, jacket: { name: 'Jacket' }, sweater: { name: 'Sweater' },
  overalls: { name: 'Overalls' }, apron: { name: 'Apron' }, suit: { name: 'Suit' }, tunic: { name: 'Tunic' }, robe: { name: 'Robe' },
  armour: { name: 'Armour' }, poncho: { name: 'Poncho' },
};
export const EXTRAS = {
  none: { name: 'None' }, scarf: { name: 'Scarf' }, bowtie: { name: 'Bow tie' }, necklace: { name: 'Necklace' }, belt: { name: 'Belt' },
  satchel: { name: 'Satchel' }, bandana: { name: 'Bandana' },
};
export const FINISHES = { matte: { name: 'Matte', body: 0.78, head: 0.5 }, satin: { name: 'Satin', body: 0.45, head: 0.36 }, glossy: { name: 'Glossy', body: 0.22, head: 0.2 } };
export const PARTS = { style: STYLES, face: FACES, mouth: MOUTHS, top: TOPS, tail: TAILS, outfit: OUTFITS, extra: EXTRAS, finish: FINISHES };

// swatches in the one look (ART.md): calm and bright colours, skin tones for heads, glowing colours for eyes
export const SWATCHES = {
  body: ['#3ec8ff', '#2ec4b6', '#62e39b', '#7cc86b', '#ffc93c', '#ff9f1c', '#ff6f61', '#ff5d8f', '#c2185b', '#8f6bff', '#3a6ff7', '#2b2f45', '#4a4a55', '#8a5a3c', '#f2d6a2', '#f6f3ea'],
  head: ['#eef1ff', '#f6f3ea', '#ffe0bd', '#f1c27d', '#d9a066', '#a86b3c', '#6b4226', '#3b2417', '#2b2f45', '#9fe7ff', '#ffe066', '#c9b6ff', '#ffb3c7', '#b5f5c8'],
  eyes: ['#ff4fd8', '#7cf6ff', '#ffe066', '#7cff6b', '#ff7a45', '#ffffff', '#3ec8ff', '#b388ff', '#ff3b3b', '#2b2f45'],
};
SWATCHES.outfit = SWATCHES.body; SWATCHES.trim = SWATCHES.body;
export const COLOR_PARTS = { body: 'Body', head: 'Head and hands', eyes: 'Eyes', outfit: 'Outfit', trim: 'Trim' };
export const DEFAULT_COLORS = { body: '#3ec8ff', head: '#eef1ff', eyes: '#ff4fd8', outfit: '#ffc93c', trim: '#2b2f45' };

const isColor = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
// any look (a save, a hello from another player, a world's character) made safe: unknown parts and bad colours
// fall back. colors are the old three ({ body, head, visor }), used where the look gives none.
export function normaliseLook(raw, colors) {
  const L = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const c = colors && typeof colors === 'object' ? colors : {};
  const lc = L.colors && typeof L.colors === 'object' ? L.colors : {};
  const col = (v, d) => (isColor(v) ? v.toLowerCase() : d);
  const pick = (k, d) => (own(PARTS[k], L[k]) ? L[k] : d);
  return {
    style: pick('style', 'bot'), face: pick('face', 'visor'), mouth: pick('mouth', 'none'), top: pick('top', 'none'), tail: pick('tail', 'none'),
    outfit: pick('outfit', 'none'), extra: pick('extra', 'none'), finish: pick('finish', 'matte'),
    colors: {
      body: col(lc.body, col(c.body, DEFAULT_COLORS.body)), head: col(lc.head, col(c.head, DEFAULT_COLORS.head)), eyes: col(lc.eyes, col(c.visor, DEFAULT_COLORS.eyes)),
      outfit: col(lc.outfit, DEFAULT_COLORS.outfit), trim: col(lc.trim, DEFAULT_COLORS.trim),
    },
  };
}
// the old three colours (the hello's c, NPC code, old clients) from a look
export const legacyColors = (L) => ({ body: L.colors.body, head: L.colors.head, visor: L.colors.eyes });
export const sameLook = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// colour sets that go together, for "Surprise me"
const THEMES = [
  ['#3ec8ff', '#eef1ff', '#ff4fd8', '#ffc93c', '#2b2f45'], ['#ff6f61', '#ffe0bd', '#2b2f45', '#2ec4b6', '#ffc93c'], ['#62e39b', '#2b2f45', '#ffe066', '#ff9f1c', '#f6f3ea'],
  ['#8f6bff', '#c9b6ff', '#7cf6ff', '#2b2f45', '#ffc93c'], ['#ffc93c', '#f1c27d', '#3ec8ff', '#3a6ff7', '#f6f3ea'], ['#2b2f45', '#9fe7ff', '#7cff6b', '#ff5d8f', '#ffc93c'],
  ['#ff5d8f', '#ffb3c7', '#ffffff', '#8f6bff', '#f6f3ea'], ['#2ec4b6', '#f6f3ea', '#ff7a45', '#ff6f61', '#2b2f45'], ['#8a5a3c', '#d9a066', '#ffe066', '#7cc86b', '#f2d6a2'],
  ['#f6f3ea', '#3b2417', '#3ec8ff', '#c2185b', '#ffc93c'], ['#3a6ff7', '#ffe0bd', '#ffe066', '#ff9f1c', '#2b2f45'], ['#4a4a55', '#a86b3c', '#ff3b3b', '#2b2f45', '#ff9f1c'],
];
export function randomLook(rand = Math.random) {
  const any = (o, none = 0) => { const k = Object.keys(o); return none && rand() < none ? 'none' : k[Math.floor(rand() * k.length)]; };
  const t = THEMES[Math.floor(rand() * THEMES.length)];
  return normaliseLook({
    style: any(STYLES), face: any(FACES), mouth: any(MOUTHS, 0.45), top: any(TOPS, 0.45), tail: any(TAILS, 0.6), outfit: any(OUTFITS, 0.15),
    extra: any(EXTRAS, 0.5), finish: rand() < 0.7 ? 'matte' : any(FINISHES),
    colors: { body: t[0], head: t[1], eyes: t[2], outfit: t[3], trim: t[4] },
  });
}

// ---- building ----
// geometry is shared (never disposed with a world); materials come from render.js's cache
const GEO = new Map();
const keep = (g) => { g.userData.keep = true; return g; };
const geo = (key, make) => { let g = GEO.get(key); if (!g) { g = keep(make()); GEO.set(key, g); } return g; };
const G = {
  sphere: (r, ws = 18, hs = 12) => geo(`s${r}|${ws}`, () => new THREE.SphereGeometry(r, ws, hs)),
  capsule: (r, len, rs = 14) => geo(`c${r}|${len}|${rs}`, () => new THREE.CapsuleGeometry(r, len, 4, rs)),
  rbox: (w, h, d, rad, seg = 3) => geo(`r${w}|${h}|${d}|${rad}|${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, rad)),
  box: (w, h, d) => geo(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d)),
  cyl: (rt, rb, h, sides = 18, open = false) => geo(`y${rt}|${rb}|${h}|${sides}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, sides, 1, open)),
  cone: (r, h, sides = 12) => geo(`n${r}|${h}|${sides}`, () => new THREE.ConeGeometry(r, h, sides)),
  torus: (r, tube, arc = Math.PI * 2) => geo(`t${r}|${tube}|${arc}`, () => new THREE.TorusGeometry(r, tube, 8, Math.max(12, Math.round(28 * arc / (Math.PI * 2))), arc)),
  band: (r, h, arc) => geo(`v${r}|${h}|${arc}`, () => new THREE.CylinderGeometry(r, r, h, 24, 1, true, -arc / 2, arc)),
  lathe: (key, pts, gap = 0) => geo(`l${key}|${gap}`, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(0.001, x), y)), 22, gap / 2, Math.PI * 2 - gap)),
};
const DARK = '#262a38', WHITE = '#f6f3ea', GOLD = '#ffc93c', LEAF = '#7cc86b';

function mesh(g, m, pos, rot, scale) {
  const o = new THREE.Mesh(g, m);
  if (pos) o.position.set(pos[0], pos[1], pos[2]);
  if (rot) o.rotation.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG);
  if (scale) { if (typeof scale === 'number') o.scale.setScalar(scale); else o.scale.set(scale[0], scale[1], scale[2]); }
  o.receiveShadow = true; // avatars use a blob shadow instead of casting
  return o;
}

// Each style: its torso, head, hands and feet, its proportions (m, as avatar.js BOT_METRICS), the torso's shape for
// outfits (T: half width r, half depth d, shoulders top, bottom bot, waist, neck; prof(y) = radius at height y for
// round torsos, box for boxy ones) and the head's for faces (H: half width w, half height h, front d; round or box).
const capsuleProf = (r, len, cy = 0) => (y) => { const a = Math.abs(y - cy) - len / 2; return a <= 0 ? r : Math.sqrt(Math.max(0, r * r - a * a)); };
const ellProf = (r, sy, cy = 0) => (y) => { const k = (y - cy) / (r * sy); return Math.abs(k) >= 1 ? 0 : r * Math.sqrt(1 - k * k); };
const STYLE = {
  bot: () => ({
    m: { up: 0.78, headY: 0.66, hatY: 0.26, handX: 0.47, handY: 0.72, footX: 0.16, backY: 0.12, backZ: -0.3, tagY: 1.35, charmY: 1.95, tailY: -0.3, tailZ: -0.22 },
    T: { r: 0.29, d: 0.29, top: 0.4, bot: -0.47, waist: -0.1, neck: 0.36, prof: capsuleProf(0.29, 0.36) },
    H: { w: 0.32, h: 0.26, d: 0.28, round: false },
    torso: (M) => [mesh(G.capsule(0.29, 0.36, 12), M.body)],
    head: (M) => [mesh(G.rbox(0.64, 0.52, 0.56, 0.14), M.head)],
    hand: (M) => mesh(G.sphere(0.11, 12, 10), M.head),
    foot: (M) => mesh(G.rbox(0.22, 0.14, 0.32, 0.05, 2), M.foot),
  }),
  round: () => ({
    m: { up: 0.72, headY: 0.6, hatY: 0.31, handX: 0.45, handY: 0.68, footX: 0.15, backY: 0.06, backZ: -0.3, tagY: 1.36, charmY: 1.9, tailY: -0.26, tailZ: -0.24 },
    T: { r: 0.31, d: 0.3, top: 0.25, bot: -0.35, waist: -0.06, neck: 0.24, prof: ellProf(0.31, 1.12), dz: 0.95 },
    H: { w: 0.33, h: 0.33, d: 0.33, round: true },
    torso: (M) => [mesh(G.sphere(0.31, 22, 16), M.body, null, null, [1, 1.12, 0.95])],
    head: (M) => [mesh(G.sphere(0.33, 24, 18), M.head)],
    hand: (M) => mesh(G.sphere(0.12, 12, 10), M.head),
    foot: (M) => mesh(G.sphere(0.13, 14, 10), M.foot, [0, 0.01, 0.02], null, [1, 0.62, 1.3]),
  }),
  block: () => ({
    m: { up: 0.8, headY: 0.64, hatY: 0.28, handX: 0.47, handY: 0.7, footX: 0.16, backY: 0.06, backZ: -0.25, tagY: 1.36, charmY: 1.95, tailY: -0.3, tailZ: -0.2 },
    T: { r: 0.29, d: 0.22, top: 0.31, bot: -0.33, waist: -0.08, neck: 0.33, box: true },
    H: { w: 0.31, h: 0.28, d: 0.28, round: false },
    torso: (M) => [mesh(G.rbox(0.58, 0.66, 0.44, 0.04), M.body)],
    head: (M) => [mesh(G.rbox(0.62, 0.56, 0.56, 0.05), M.head)],
    hand: (M) => mesh(G.rbox(0.19, 0.19, 0.19, 0.03), M.head),
    foot: (M) => mesh(G.rbox(0.24, 0.16, 0.34, 0.02), M.foot),
  }),
  tall: () => ({
    m: { up: 0.9, headY: 0.7, hatY: 0.22, handX: 0.42, handY: 0.8, footX: 0.14, backY: 0.14, backZ: -0.26, tagY: 1.28, charmY: 2.0, tailY: -0.4, tailZ: -0.18 },
    T: { r: 0.24, d: 0.24, top: 0.45, bot: -0.52, waist: -0.14, neck: 0.42, prof: capsuleProf(0.24, 0.56) },
    H: { w: 0.25, h: 0.22, d: 0.23, round: false },
    torso: (M) => [mesh(G.capsule(0.24, 0.56), M.body)],
    head: (M) => [mesh(G.rbox(0.5, 0.44, 0.46, 0.13), M.head)],
    hand: (M) => mesh(G.sphere(0.095, 12, 10), M.head),
    foot: (M) => mesh(G.rbox(0.2, 0.13, 0.3, 0.05), M.foot),
  }),
  little: () => ({
    m: { up: 0.58, headY: 0.62, hatY: 0.31, handX: 0.4, handY: 0.56, footX: 0.14, backY: 0.02, backZ: -0.27, tagY: 1.34, charmY: 1.76, tailY: -0.2, tailZ: -0.22 },
    T: { r: 0.25, d: 0.25, top: 0.22, bot: -0.31, waist: -0.04, neck: 0.2, prof: capsuleProf(0.25, 0.12) },
    H: { w: 0.37, h: 0.31, d: 0.33, round: false },
    torso: (M) => [mesh(G.capsule(0.25, 0.12), M.body)],
    head: (M) => [mesh(G.rbox(0.74, 0.62, 0.66, 0.2), M.head)],
    hand: (M) => mesh(G.sphere(0.1, 12, 10), M.head),
    foot: (M) => mesh(G.rbox(0.2, 0.13, 0.28, 0.05), M.foot),
  }),
  bean: () => ({
    m: { up: 0.76, headY: 0.5, hatY: 0.34, handX: 0.5, handY: 0.7, footX: 0.16, backY: 0.1, backZ: -0.36, tagY: 1.3, charmY: 1.95, tailY: -0.34, tailZ: -0.3 },
    T: { r: 0.34, d: 0.34, top: 0.3, bot: -0.48, waist: -0.08, neck: 0.3, prof: capsuleProf(0.34, 0.64, 0.18), bean: true },
    H: { w: 0.3, h: 0.2, d: 0.34, round: true, cyl: true },
    torso: (M) => { const pr = capsuleProf(0.34, 0.64, 0.18), lathe = (y0, y1) => { const pts = []; for (let i = 0; i <= 16; i++) { const y = y0 + (y1 - y0) * i / 16; pts.push([pr(y), y]); } return G.lathe(`bean${y0}|${y1}`, pts); };
      return [mesh(lathe(-0.48, 0.3), M.body), mesh(lathe(0.3, 0.84), M.head)]; }, // a capsule toy: body below, the head's colour above the chin
    head: () => [],
    hand: (M) => mesh(G.sphere(0.11, 12, 10), M.head),
    foot: (M) => mesh(G.rbox(0.22, 0.14, 0.32, 0.05), M.foot),
  }),
};

// where the head's front surface is, at (x, y) on the face
const frontZ = (H, x, y) => (H.cyl ? Math.sqrt(Math.max(0, H.d * H.d - x * x)) : H.round ? Math.sqrt(Math.max(0, H.d * H.d - x * x - y * y)) : H.d);

const FACE = {
  visor: (H, M) => H.round
    ? [mesh(G.band(H.d + 0.012, 0.2, 150 * DEG), M.eyes, [0, 0.03, 0])] // wraps round a round head
    : [mesh(G.rbox(H.w * 1.56, 0.22, 0.12, 0.06, 2), M.eyes, [0, 0.02, H.d - 0.04])],
  eyes: (H, M) => [-1, 1].map((s) => mesh(G.sphere(0.065, 12, 10), M.eyes, [s * H.w * 0.36, 0.03, frontZ(H, H.w * 0.36, 0.03) - 0.01], null, [1, 1.35, 0.5])),
  big: (H, M) => [-1, 1].flatMap((s) => { const x = s * H.w * 0.38, z = frontZ(H, x, 0.04); return [mesh(G.sphere(0.088, 14, 12), M.white, [x, 0.04, z - 0.035]), mesh(G.sphere(0.046, 12, 10), M.pupil, [x, 0.035, z + 0.03]), mesh(G.sphere(0.014, 8, 6), M.white, [x + 0.018, 0.06, z + 0.07])]; }),
  happy: (H, M) => [-1, 1].map((s) => mesh(G.torus(0.05, 0.017, Math.PI), M.eyes, [s * H.w * 0.36, 0.01, frontZ(H, H.w * 0.36, 0.01)])),
  sleepy: (H, M) => [-1, 1].map((s) => mesh(G.capsule(0.022, 0.09), M.eyes, [s * H.w * 0.36, 0.02, frontZ(H, H.w * 0.36, 0.02)], [0, 0, 90])),
  mono: (H, M) => { const z = frontZ(H, 0, 0.04); return [mesh(G.sphere(0.12, 16, 12), M.white, [0, 0.04, z - 0.07]), mesh(G.sphere(0.068, 14, 10), M.eyes, [0, 0.04, z + 0.015]), mesh(G.torus(0.125, 0.02), M.trimDark, [0, 0.04, z - 0.02])]; },
  shades: (H, M) => { const z = frontZ(H, 0, 0.04); return [mesh(H.round ? G.band(H.d + 0.016, 0.13, 130 * DEG) : G.rbox(H.w * 1.62, 0.13, 0.06, 0.03), M.shades, H.round ? [0, 0.04, 0] : [0, 0.04, z]), mesh(G.box(0.03, 0.09, 0.01), M.white, [H.w * 0.42, 0.06, (H.round ? z : H.d) + 0.03], [0, 0, 35])]; },
};
const MOUTH = {
  none: () => [],
  smile: (H, M, y) => [mesh(G.torus(0.07, 0.016, Math.PI), M.mouth, [0, y + 0.06, frontZ(H, 0, y)], [0, 0, 180])],
  grin: (H, M, y) => [mesh(G.torus(0.1, 0.02, Math.PI), M.mouth, [0, y + 0.08, frontZ(H, 0, y)], [0, 0, 180], [1, 0.8, 1])],
  o: (H, M, y) => [mesh(G.torus(0.035, 0.014), M.mouth, [0, y, frontZ(H, 0, y)])],
  cat: (H, M, y) => [-1, 1].map((s) => mesh(G.torus(0.035, 0.013, Math.PI), M.mouth, [s * 0.035, y + 0.02, frontZ(H, s * 0.035, y)], [0, 0, 180])),
};
const TOP = {
  none: () => [],
  cat: (H, M, y) => [-1, 1].map((s) => mesh(G.cone(0.1, 0.2, 4), M.head, [s * H.w * 0.58, y + 0.04, -0.02], [0, 45, -s * 16])),
  bear: (H, M, y) => [-1, 1].map((s) => mesh(G.sphere(0.1, 14, 10), M.head, [s * H.w * 0.66, y - 0.02, -0.02], null, [1, 1, 0.55])),
  bunny: (H, M, y) => [-1, 1].map((s) => mesh(G.capsule(0.055, 0.24), M.head, [s * 0.11, y + 0.17, -0.03], [-10, 0, -s * 9])),
  horns: (H, M, y) => [-1, 1].map((s) => mesh(G.cone(0.055, 0.18, 8), M.horn, [s * H.w * 0.48, y + 0.06, 0.04], [0, 0, -s * 22])),
  sprout: (H, M, y) => [mesh(G.cyl(0.013, 0.013, 0.12, 6), M.leaf, [0, y + 0.06, 0]), ...[-1, 1].map((s) => mesh(G.sphere(0.075, 10, 8), M.leaf, [s * 0.06, y + 0.13, 0], [0, 0, s * 28], [1, 0.26, 0.55]))],
  crest: (H, M, y) => [0.16, 0.05, -0.06, -0.17].map((z, i) => mesh(G.cone(0.065 - i * 0.008, 0.2 - i * 0.03, 4), M.trim, [0, y + 0.07 - i * 0.012, z * (H.d / 0.28)], [-18 - i * 8, 45, 0])),
  bun: (H, M, y) => [mesh(G.sphere(0.11, 14, 10), M.trim, [0, y + 0.02, -H.d * 0.5]), mesh(G.torus(0.07, 0.02), M.outfit, [0, y - 0.04, -H.d * 0.5], [80, 0, 0])],
};
const TAIL = {
  none: () => [],
  cat: (M) => [[0, 0.02, -0.06, 0.055], [0, 0.07, -0.15, 0.05], [0, 0.16, -0.21, 0.046], [0, 0.26, -0.22, 0.042], [0, 0.34, -0.18, 0.04]].map(([x, y, z, r]) => mesh(G.sphere(r, 10, 8), M.body, [x, y, z])),
  fox: (M) => [mesh(G.cone(0.11, 0.36, 8), M.body, [0, 0.07, -0.18], [-115, 0, 0]), mesh(G.cone(0.06, 0.1, 8), M.white, [0, 0.15, -0.36], [-115, 0, 0])],
  bunny: (M) => [mesh(G.sphere(0.09, 12, 10), M.white, [0, 0.02, -0.06])],
  dino: (M) => [mesh(G.cone(0.1, 0.42, 8), M.body, [0, -0.04, -0.2], [-100, 0, 0]), ...[0.08, 0.2, 0.31].map((z, i) => mesh(G.cone(0.035 - i * 0.006, 0.09, 4), M.trim, [0, 0.05 - i * 0.03, -z], [-20, 45, 0]))],
  cord: (M) => [mesh(G.torus(0.13, 0.018, Math.PI * 1.25), M.cord, [0, -0.08, -0.13], [0, 90, 0]), mesh(G.rbox(0.07, 0.05, 0.09, 0.012), M.gold, [0, -0.14, -0.26], [20, 0, 0])],
};

// a garment that follows the torso's own shape between two heights (k: how far it stands off the body)
function wrap(T, y0, y1, k, m, key, gap = 0) {
  if (T.box) { const h = y1 - y0; return mesh(G.rbox(T.r * 2 * k, h, T.d * 2 * k, 0.04), m, [0, (y0 + y1) / 2, 0]); }
  const n = 12, pts = [];
  for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; pts.push([T.prof(y) * k, y]); }
  const o = mesh(G.lathe(`${key}|${y0}|${y1}|${k}`, pts, gap), m);
  if (T.dz) o.scale.z = T.dz;
  return o;
}
const rAt = (T, y) => (T.box ? Math.max(T.r, T.d) : T.prof(y));
// a flat piece on the front of the torso between two heights, leaning back with the chest: { pos, rot } for mesh()
const front = (T, y0, y1, k, out = 0) => {
  if (T.box) return { pos: [0, (y0 + y1) / 2, T.d * k + out], rot: [0, 0, 0] };
  const zb = T.prof(y0) * k * (T.dz || 1), zt = T.prof(y1) * k * (T.dz || 1);
  return { pos: [0, (y0 + y1) / 2, (zb + zt) / 2 + out], rot: [-Math.atan2(zb - zt, y1 - y0) / DEG, 0, 0] };
};
const onFront = (g, m, T, y0, y1, k, out, x = 0) => { const f = front(T, y0, y1, k, out); f.pos[0] = x; return mesh(g, m, f.pos, f.rot); };
// a skirt from the waist down to just above the feet (world height 0.24): bottom radius a factor of the waist's
const skirt = (T, up, flare, m, key) => {
  const top = T.waist, bot = 0.24 - up, h = top - bot, r0 = rAt(T, top) * (T.box ? 1.05 : 1.08);
  return mesh(G.cyl(r0, r0 * flare, h, T.box ? 4 : 18), m, [0, (top + bot) / 2, 0], T.box ? [0, 45, 0] : null, T.box ? [1, 1, T.d / T.r] : null);
};
const OUTFIT = {
  none: () => [],
  tee: (T, M, key) => [wrap(T, T.waist - 0.02, T.neck, 1.05, M.outfit, key + 'tee'), mesh(G.torus(rAt(T, T.neck) * 0.9, 0.03), M.trim, [0, T.neck, 0], [90, 0, 0])],
  hoodie: (T, M, key) => [wrap(T, T.bot + 0.08, T.neck + 0.02, 1.06, M.outfit, key + 'hd'),
    mesh(G.sphere(0.2, 16, 12), M.outfit, [0, T.top + 0.02, -rAt(T, T.top) * 0.85], null, [1.45, 0.9, 0.85]),
    onFront(G.rbox(0.3, 0.14, 0.05, 0.02), M.trim, T, T.waist - 0.09, T.waist + 0.05, 1.06, 0.012),
    ...[-1, 1].map((s) => onFront(G.cyl(0.012, 0.012, 0.16, 6), M.trim, T, T.neck - 0.18, T.neck - 0.02, 1.06, 0.015, s * 0.07))],
  jacket: (T, M, key) => T.box
    ? [wrap(T, T.waist - 0.08, T.neck, 1.07, M.outfit, key + 'jk'), onFront(G.box(0.12, (T.neck - T.waist) * 0.9, 0.03), M.trim, T, T.waist - 0.06, T.neck - 0.02, 1.07, 0.006)]
    : [wrap(T, T.waist - 0.06, T.neck - 0.01, 1.035, M.trim, key + 'jks'), wrap(T, T.waist - 0.08, T.neck, 1.07, M.outfit, key + 'jk', 0.5),
      ...[-1, 1].map((s) => mesh(G.box(0.09, 0.15, 0.025), M.outfit, [s * 0.1, T.neck - 0.07, rAt(T, T.neck - 0.07) * 1.06], [0, 0, s * 22]))],
  sweater: (T, M, key) => [wrap(T, T.bot + 0.12, T.neck, 1.07, M.outfit, key + 'sw'), mesh(G.torus(rAt(T, T.neck) * 0.92, 0.05), M.outfit, [0, T.neck, 0], [90, 0, 0]),
    wrap(T, -0.03, 0.05, 1.09, M.trim, key + 'swb'), wrap(T, T.bot + 0.12, T.bot + 0.17, 1.09, M.trim, key + 'swh')],
  overalls: (T, M, key) => {
    const r = rAt(T, T.waist + 0.06) * 1.07, rn = rAt(T, T.neck - 0.08) * 1.06;
    return [wrap(T, T.bot + 0.02, T.waist + 0.04, 1.06, M.outfit, key + 'ov'), onFront(G.box(0.3, 0.24, 0.03), M.outfit, T, T.waist + 0.03, T.waist + 0.27, 1.06, 0.01),
      ...[-1, 1].flatMap((s) => [mesh(G.box(0.05, 0.36, 0.03), M.outfit, [s * 0.11, T.neck - 0.08, rn], [12, 0, 0]), mesh(G.cyl(0.022, 0.022, 0.02, 10), M.gold, [s * 0.11, T.waist + 0.24, r + 0.02], [90, 0, 0])])];
  },
  apron: (T, M) => {
    const y1 = T.neck - 0.05, y0 = y1 - (T.neck - T.bot) * 0.78;
    return [onFront(G.rbox(0.36, y1 - y0, 0.03, 0.012), M.outfit, T, y0, y1, 1.06, 0.02), onFront(G.rbox(0.16, 0.1, 0.035, 0.01), M.trim, T, T.waist - 0.17, T.waist - 0.07, 1.06, 0.045),
      mesh(G.torus(rAt(T, T.waist) * 1.04, 0.016), M.trim, [0, T.waist, 0], [90, 0, 0])];
  },
  suit: (T, M, key) => {
    const sh = front(T, T.neck - 0.26, T.neck - 0.01, 1.06, 0.004), tie = front(T, T.neck - 0.3, T.neck - 0.06, 1.06, 0.02);
    return [wrap(T, T.bot + 0.06, T.neck, 1.06, M.outfit, key + 'su'), mesh(G.cone(0.1, 0.25, 3), M.white, sh.pos, [sh.rot[0] + 180, 0, 0], [1, 1, 0.12]),
      mesh(G.rbox(0.05, 0.22, 0.02, 0.008), M.trim, tie.pos, tie.rot), mesh(G.sphere(0.03, 8, 6), M.trim, [0, T.neck - 0.05, rAt(T, T.neck - 0.05) * 1.06 + 0.02])];
  },
  tunic: (T, M, key, up) => [wrap(T, T.waist - 0.02, T.neck, 1.05, M.outfit, key + 'tu'), mesh(G.cyl(rAt(T, T.waist) * 1.08, rAt(T, T.waist) * 1.3, Math.min(0.3, T.waist - (0.3 - up)), T.box ? 4 : 18), M.outfit, [0, T.waist - Math.min(0.3, T.waist - (0.3 - up)) / 2, 0], T.box ? [0, 45, 0] : null),
    mesh(G.torus(rAt(T, T.waist) * 1.09, 0.03), M.trim, [0, T.waist, 0], [90, 0, 0])],
  robe: (T, M, key, up) => [wrap(T, T.waist, T.neck, 1.06, M.outfit, key + 'rb'), skirt(T, up, 1.5, M.outfit, key), mesh(G.torus(rAt(T, T.waist) * 1.1, 0.035), M.trim, [0, T.waist, 0], [90, 0, 0]),
    mesh(G.torus(rAt(T, T.waist) * 1.08 * 1.5 - 0.01, 0.025), M.trim, [0, 0.27 - up, 0], [90, 0, 0])],
  armour: (T, M, key) => [wrap(T, T.waist - 0.04, T.neck, 1.08, M.outfit, key + 'ar'),
    ...[-1, 1].map((s) => mesh(G.sphere(0.16, 14, 8, 0), M.trim, [s * (rAt(T, T.top - 0.1) + 0.03), T.top - 0.07, 0], null, [1, 0.62, 1.05])),
    mesh(G.torus(rAt(T, T.waist - 0.04) * 1.1, 0.035), M.trimDark, [0, T.waist - 0.04, 0], [90, 0, 0]), mesh(G.cyl(0.06, 0.06, 0.02, 6), M.gold, [0, T.waist + 0.16, rAt(T, T.waist + 0.16) * 1.08 + 0.01], [90, 0, 0])],
  poncho: (T, M) => {
    // (a 7-sided cone's flat sides sit at 0.9 of its radius: sized so the body never shows through them)
    const r0 = rAt(T, T.neck) * 1.18, top = T.neck + 0.03, h = 0.5, rb = Math.max(r0 + 0.27, rAt(T, top - h) / 0.88 + 0.08), at = (y) => r0 + (rb - r0) * (top - y) / h;
    return [mesh(G.cyl(r0, rb, h, 7), M.outfit, [0, top - h / 2, 0]), mesh(G.cyl(at(top - 0.24) + 0.004, at(top - 0.29) + 0.004, 0.05, 7), M.trim, [0, top - 0.265, 0]),
      mesh(G.cyl(at(top - h + 0.07) + 0.004, rb + 0.004, 0.07, 7), M.trim, [0, top - h + 0.035, 0]), mesh(G.torus(r0 * 0.98, 0.04), M.trim, [0, top - 0.01, 0], [90, 0, 0])];
  },
};
const EXTRA = {
  none: () => [],
  scarf: (T, M) => { const r = rAt(T, T.neck) * 0.95; return [mesh(G.torus(r, 0.06), M.outfit, [0, T.neck, 0], [90, 0, 0]), mesh(G.rbox(0.1, 0.3, 0.05, 0.02), M.outfit, [r * 0.55, T.neck - 0.16, r * 0.9], [8, 0, 6]), mesh(G.box(0.1, 0.03, 0.055), M.trim, [r * 0.55 + 0.01, T.neck - 0.26, r * 0.9 + 0.01], [8, 0, 6])]; },
  bowtie: (T, M) => { const z = rAt(T, T.neck - 0.04) * 1.04 + 0.02; return [...[-1, 1].map((s) => mesh(G.cone(0.06, 0.1, 4), M.trim, [s * 0.05, T.neck - 0.04, z], [0, 0, s * 90], [1, 1, 0.5])), mesh(G.sphere(0.03, 8, 6), M.trim, [0, T.neck - 0.04, z])]; },
  necklace: (T, M) => { const r = rAt(T, T.neck - 0.03) * 1.03; return [mesh(G.torus(r, 0.012), M.gold, [0, T.neck - 0.03, 0], [80, 0, 0]), mesh(G.sphere(0.038, 8, 6), M.trim, [0, T.neck - 0.1, rAt(T, T.neck - 0.1) * 1.03 + 0.03])]; },
  belt: (T, M) => { const r = rAt(T, T.waist) * 1.09; return [mesh(G.torus(r, 0.035), M.trimDark, [0, T.waist, 0], [90, 0, 0]), mesh(G.rbox(0.09, 0.07, 0.03, 0.01), M.gold, [0, T.waist, r + 0.02])]; },
  satchel: (T, M) => { const r = rAt(T, T.waist); return [mesh(G.torus(Math.max(r, T.d) * 1.12, 0.018), M.trimDark, [0, T.waist + 0.16, 0], [90, 0, 38]), mesh(G.rbox(0.2, 0.17, 0.08, 0.025), M.trim, [r * 1.08 + 0.02, T.waist - 0.08, 0.02], [0, 90, 0])]; },
  bandana: (T, M) => { const r = rAt(T, T.neck - 0.02) * 1.03; return [mesh(G.torus(r * 0.96, 0.03), M.trim, [0, T.neck - 0.01, 0], [90, 0, 0]), mesh(G.cone(0.13, 0.17, 3), M.trim, [0, T.neck - 0.09, r * 0.96 + 0.01], [180, 0, 0], [1, 1, 0.25])]; },
};

// the kit avatar.js uses: a look onto an avatar's skins
export const lookKit = {
  build(look, colors) {
    const L = normaliseLook(look, colors), C = L.colors, F = FINISHES[L.finish];
    const S = STYLE[L.style](), T = S.T, H = S.H, up = S.m.up;
    const glowFace = !!FACES[L.face].glow;
    const M = {
      body: mat(C.body, { rough: F.body }), head: mat(C.head, { rough: F.head }), foot: mat(C.body, { rough: Math.min(F.body, 0.6) }),
      eyes: mat(C.eyes, { glow: 1.6, rough: 0.3 }), pupil: mat(C.eyes, { glow: 0.35, rough: 0.3 }), white: mat(WHITE, { rough: 0.35 }),
      mouth: glowFace ? mat(C.eyes, { glow: 1.2, rough: 0.3 }) : mat(DARK, { rough: 0.6 }), shades: mat('#1d2230', { rough: 0.15 }),
      outfit: mat(C.outfit, { rough: 0.85 }), trim: mat(C.trim, { rough: 0.8 }), trimDark: mat(DARK, { rough: 0.7 }), gold: mat(GOLD, { metal: 0.7, rough: 0.35 }),
      horn: mat('#f3ead8', { rough: 0.6 }), leaf: mat(LEAF, { rough: 0.8 }), cord: mat(DARK, { rough: 0.6 }),
    };
    const g = () => new THREE.Group();
    const parts = { torso: g(), head: g(), handL: g(), handR: g(), footL: g(), footR: g(), topper: g(), tail: g() };
    const key = L.style;
    parts.torso.add(...S.torso(M), ...OUTFIT[L.outfit](T, M, key, up), ...EXTRA[L.extra](T, M, key, up));
    const face = FACE[L.face](H, M), mouth = MOUTH[L.mouth](H, M, -H.h * 0.45);
    parts.head.add(...S.head(M), ...face, ...mouth);
    const top = TOP[L.top](H, M, S.m.hatY);
    let m = S.m;
    if (top.length) {
      parts.topper.add(...top);
      // tall ears lift the name tag clear of them
      const tip = new THREE.Box3().setFromObject(parts.topper).max.y;
      m = Object.assign({}, m, { tagY: Math.max(m.tagY, m.headY + tip + 0.4) });
    }
    const tail = TAIL[L.tail](M);
    if (tail.length) parts.tail.add(...tail);
    parts.handL.add(S.hand(M)); parts.handR.add(S.hand(M)); parts.footL.add(S.foot(M)); parts.footR.add(S.foot(M));
    return { look: L, m, parts };
  },
};
