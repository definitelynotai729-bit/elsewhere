// The Last Summer of Bronze, chapter 2: The Low Wings (stories/bronze-age/chapters/02-the-low-wings.md has every line).
// Pterousa, the wingmakers' island: a lagoon ringed by sea stacks. Perdika makes the best wings in the Isles and will
// not stand on her own launch plank, so the stranger climbs to her workshop on the Stack of Kestrels, gathers seven
// great feathers from the nests, balances the wing, and makes the test flight through the Eye, up a column of
// seabirds and down into a circle on the beach. Then the palace ship in the lagoon turns out to carry the Compass of
// Perdix, which Perdika's family says the Daedalids stole: steal it back, ask for it, or let it go.
//
// Story state is global flags under `lsb.` (chapter-2 progress under `lsb.p.`), carried into later chapters; the
// world's store keeps local things (feathers, tin-drops, the loom, the High Line best). Nothing here pays coins.
// The Low Wings are a loan, like chapter 1's knife: given on arrival once earned, taken back on leaving.
// As built, it differs from the chapter text in places (BUILD.md, section 8): the map is tighter, and Perdika's
// feather basket runs between her deck and the beach once you have met her, so nobody climbs Kestrel twice.

const C = {
  sea: '#2c86b8', lagoon: '#5cc9cf', deep: '#1f6f9e', sand: '#f0dfb2', wet: '#d8c38f',
  rock: '#c99d72', rock2: '#b08560', rock3: '#93704f', guano: '#f3f0e6', grass: '#a6c15a',
  plaster: '#f6eedf', reed: '#d6b866', reed2: '#b99a48', wood: '#a0703f', wood2: '#6f4a2c', rope: '#cdb38a',
  ochre: '#e0a14e', tin: '#e8eef5', feather: '#fbf7ee', wax: '#e8c66a', red: '#a8402f', red2: '#7c2e22',
  bronze: '#d0913c', ribbon: '#e0503c', stone: '#e2d3b2', stone2: '#c4b18c', loom: '#8a6a4a', thread: '#ffd166',
};
const D = Math.PI / 180;
// the nine stacks: x, z, radius, height
const S = {
  low: [-62, 40, 8, 20], corm: [-84, 10, 7, 28], tww: [-86, -26, 6, 32], twe: [-74, -36, 6, 32], kes: [-40, -68, 12, 48],
  gull: [6, -86, 4, 60], eyeN: [87.3, -48.6, 6, 40], eyeS: [80.7, -23.4, 6, 40], old: [86, 14, 8, 36],
};
const EYE = [84, 27, -36], EYE_YAW = 165.3;     // the Eye: an opening 14 wide, y 22-32, in the rock wall between the Eye stacks
// (a straight glide from the plank reaches it about 27.5 m up: the middle of the opening)
const CIRCLE = [8, 1, 82];                        // the landing circle on the beach (radius 6)
const CHIMNEY = [104, -10];                       // the bird chimney: an updraft over the water, past the Eye
const PLANK_YAW = 75.5;                           // the launch plank points at the Eye
const DECK_Y = 48;
// Perdika's Balance: the pieces on the bench, and the beam's rules
const PIECES = [{ k: 'w4', name: 'Wax 4', kind: 'wax', w: 4 }, { k: 'w6', name: 'Wax 6', kind: 'wax', w: 6 }, { k: 'f1', name: 'Feather 1', kind: 'feather', w: 1 },
  { k: 'f3', name: 'Feather 3', kind: 'feather', w: 3 }, { k: 'r5', name: 'Reed 5', kind: 'reed', w: 5 }];
// Glauke's loom-floor: rows from the loom end, X = thread
const LOOM = ['X.....X', 'XX...XX', 'XXXXXXX', 'X.XXX.X', 'XXX.XXX', '.XXXXX.', '..X.X..'];
const CODEX = {
  pterousa: ['Pterousa', 'A lagoon ringed by sea stacks. Every child here learns to fall before they learn to walk. Most of them are bad at it.'],
  perdikids: ['The Perdikids', 'The wingmaker family of Pterousa, descended from Perdix, inventor of the saw and the compass.'],
  perdix: ['Perdix', 'Daedalus\'s nephew, cleverer than his uncle. Daedalus pushed him off a height out of jealousy; Athena caught him and made him a partridge. Partridges never fly high.'],
  daedalus: ['Daedalus', 'Builder of the labyrinth and of wings that worked. His son flew too high and fell. His descendants still build for the House.'],
  lowwings: ['The Low Wings', 'Reed, feather and a little wax, designed to glide and never climb. "Partridges live. Eagles get shot."'],
  compass: ['The Compass of Perdix', 'Two brass legs and a hinge. It draws a perfect circle. The Perdikids say it was taken by the Daedalids and never given back.'],
  labrys: ['The Labrys', 'The House\'s swiftest ship, with eyes painted on the bow so it can see where it is going.'],
  glauke: ['Glauke', 'A grey-eyed weaver who mends sails in every harbour. There is always an owl near her loom. Nobody has seen it arrive.'],
  wax: ['Wax', 'Wax holds feathers. Sun melts wax. Every wingmaker\'s child is told this before bed, and has nightmares.'],
};
const LOOKS = {
  perdika: { style: 'little', face: 'big', mouth: 'grin', top: 'crest', outfit: 'apron', extra: 'belt', finish: 'satin', colors: { body: '#c98a5a', head: '#c98a5a', eyes: '#2a2230', outfit: '#3e8f8a', trim: '#f2d28a' } },
  ikmalios: { style: 'tall', face: 'sleepy', mouth: 'none', outfit: 'robe', extra: 'satchel', finish: 'matte', colors: { body: '#d9a982', head: '#d9a982', eyes: '#2a2230', outfit: '#9c3b2e', trim: '#d0913c' } },
  glauke: { style: 'tall', face: 'eyes', mouth: 'smile', outfit: 'robe', extra: 'scarf', finish: 'satin', colors: { body: '#e8c2a0', head: '#e8c2a0', eyes: '#8a9aa8', outfit: '#e8e2d2', trim: '#3e6fb0' } },
  kyllo: { style: 'tall', face: 'big', mouth: 'grin', outfit: 'tunic', extra: 'satchel', colors: { outfit: '#7a4fa0', trim: '#f2d28a' } },
  kessa: { style: 'round', face: 'big', mouth: 'none', outfit: 'tunic', extra: 'bandana', colors: { outfit: '#c86a43', trim: '#2f5f99' } },
  guard: { style: 'block', face: 'mono', mouth: 'none', outfit: 'armour', extra: 'belt', finish: 'glossy', colors: { body: '#c9956b', head: '#c9956b', eyes: '#1d1d2a', outfit: '#9c3b2e', trim: '#d0913c' } },
};
const wing = (side) => [
  { s: 'box', size: [0.9, 0.04, 0.42], pos: [side * 0.55, 0.08, -0.06], rot: [0, 0, side * 14], color: '#fbf7ee' },
  { s: 'box', size: [0.7, 0.045, 0.3], pos: [side * 0.98, 0.18, -0.08], rot: [0, 0, side * 20], color: '#f1e7d2' },
  { s: 'box', size: [1.25, 0.035, 0.035], pos: [side * 0.7, 0.14, 0.12], rot: [0, 0, side * 16], color: '#b99a48' },
];
const items = {
  'lsb-low-wings': { name: 'Low Wings', slot: 'back', traits: ['glide'], rarity: 'rare', desc: 'Perdika\'s wings: reed, feather and a little wax. Hold Space in the air to glide. On loan: they stay in the Isles.',
    look: [{ s: 'box', size: [0.2, 0.5, 0.08], pos: [0, -0.15, -0.02], color: '#b99a48' }].concat(wing(1), wing(-1)) },
  'lsb-compass': { name: 'Compass of Perdix', slot: null, traits: ['key'], rarity: 'epic', desc: 'Two brass legs and a hinge. It is warm. Brass should not be warm.',
    look: [{ s: 'box', size: [0.05, 0.5, 0.05], pos: [-0.08, 0, 0], rot: [0, 0, 12], color: '#d0913c', metal: 0.7 }, { s: 'box', size: [0.05, 0.5, 0.05], pos: [0.08, 0, 0], rot: [0, 0, -12], color: '#d0913c', metal: 0.7 }, { s: 'sphere', r: 0.07, pos: [0, 0.25, 0], color: '#e0a84e', metal: 0.7 }] },
  'lsb-owl-brooch': { name: 'Owl Brooch', slot: 'head', traits: ['cosmetic'], rarity: 'epic', desc: 'A little grey owl that came off Glauke\'s loom and decided to stay. Wisdom is mostly looking up before you step.',
    look: [{ s: 'sphere', r: 0.13, pos: [0, 0.1, 0.02], color: '#8a8f98' }, { s: 'sphere', r: 0.1, pos: [0, 0.27, 0.03], color: '#9aa0a8' }, { s: 'sphere', r: 0.03, pos: [0.04, 0.29, 0.12], color: '#ffd166', glow: 0.6 }, { s: 'sphere', r: 0.03, pos: [-0.04, 0.29, 0.12], color: '#ffd166', glow: 0.6 }, { s: 'cone', r: 0.03, h: 0.07, pos: [0.06, 0.37, 0.02], color: '#7a7f88' }, { s: 'cone', r: 0.03, h: 0.07, pos: [-0.06, 0.37, 0.02], color: '#7a7f88' }] },
};

export default {
  id: 'lsb-pterousa',
  name: 'The Low Wings',
  author: 'elsewhere',
  version: 1,
  listed: false, // a chapter: reached from Thyra's ending, or Junction's campaign portal once chapter one is done
  blurb: 'The Last Summer of Bronze, chapter 2. On the wingmakers\' island, test-fly a pair of wings through the Eye.',
  color: '#3e8f8a',
  spawn: { pos: [0, 1.6, 106], yaw: 180 },
  arrivals: { pier: { pos: [-36.5, 3.2, 44], yaw: 0 }, cove: { pos: [128, 1.6, 90], yaw: -90 } },
  killY: -15,
  rules: { deny: ['board'], machines: false }, // the Bronze Age: machines sleep (a Skyreach glider too: use Perdika's)
  theme: { // a hard blue sky and white light
    skyTop: '#1f66d6', skyHorizon: '#cbe7f7', skyBottom: '#9fd3ea', skySharp: 0.6,
    sunDir: [0.3, 0.75, 0.45], sunColor: '#fffaf0', sunSize: 1.8, sunLight: '#fffdf6', sunIntensity: 3.1,
    hemiSky: '#dcecff', hemiGround: '#d9c08c', hemiIntensity: 1.45,
    fog: [260, 1100], fogColor: '#d4ecf6', stars: 0, bloom: 0.25, exposure: 1.0,
  },
  music: { root: 64, scale: 'lydian', bpm: 92, progression: [0, 4, 5, 3], sparkle: 0.45, bright: 2500, wave: 'triangle' },
  items,

  build(w) {
    const T = w.THREE;
    const flag = (k) => w.flag(k), store = w.store;
    const R = w.rand(22);
    const deco = { collide: false, shadow: false };
    const say = (who, lines) => w.say(who, [].concat(lines));
    const ask = async (who, q, opts, esc = 0) => { const i = await w.ask(who, q, opts); return i < 0 ? esc : i; };
    const codex = (id) => { if (flag('codex.lsb.' + id)) return; w.setFlag('codex.lsb.' + id, true); w.toast(`Codex: ${CODEX[id][0]}`, 'item'); };
    const lit = flag('lsb.beacon') !== 'dark';
    const P = { night: false, flight: null, guards: [], seenT: 0, basket: null, high: null }; // (the visit's state; see the test hook at the end)

    // ---------- the water: a lagoon inside the stacks, the open sea beyond; falling in is a splash ----------
    w.box({ pos: [0, -0.3, -20], size: [2400, 0.3, 2400], color: C.sea, collide: false, shadow: false });
    w.cylinder({ pos: [0, -0.12, -15], radius: 118, height: 0.1, sides: 48, color: C.lagoon, opacity: 0.85, collide: false, shadow: false });
    w.zone({ pos: [0, -3, -20], size: [900, 4.6, 900], onEnter: () => {
      w.burst(w.player.pos, { color: ['#ffffff', C.lagoon], count: 30, speed: 6, life: 0.8 });
      w.sound('respawn');
      if (P.flight) return endFlight('wet');
      w.player.respawn();
    } });

    // ---------- the beach and the village (sand at y 1) ----------
    const tiled = (x0, x1, step, make) => { for (let x = x0; x < x1 - 1e-6; x += step) { const l = Math.min(step, x1 - x); make(x + l / 2, l); } };
    tiled(-120, 120, 40, (x, l) => w.box({ pos: [x, 0, 88], size: [l, 2, 64], color: C.sand }));   // z 56..120, top at 1
    tiled(-120, 120, 40, (x, l) => w.box({ pos: [x, -0.15, 51], size: [l, 1.4, 10], color: C.wet, rot: [-6, 0, 0] })); // the wet slope into the lagoon
    for (let i = 0; i < 22; i++) w.sphere({ pos: [-118 + i * 11 + R.range(-3, 3), -3, 128 + R.range(-2, 6)], radius: R.range(7, 12), low: true, color: i % 2 ? '#9bbf5a' : '#8aae4c', collide: false, shadow: false });
    const house = (x, z, yaw) => {
      w.box({ pos: [x, 2.6, z], size: [6, 3.2, 5], yaw, color: C.plaster });
      w.box({ pos: [x, 4.5, z], size: [6.8, 0.7, 5.8], yaw, color: C.reed });
      w.box({ pos: [x, 5.0, z], size: [5.6, 0.4, 4.4], yaw, color: C.reed2, collide: false });
      w.box({ pos: [x + Math.sin(yaw * D) * 2.52, 2.1, z + Math.cos(yaw * D) * 2.52], size: [1.2, 2.2, 0.08], yaw, color: '#5a3f2a', collide: false });
    };
    house(-62, 100, 180); house(-40, 104, 170); house(28, 104, 190); house(50, 100, 180); house(72, 104, 200);
    const rack = (x, z, yaw) => { // a drying rack of feathers
      for (const s of [-1.6, 1.6]) w.cylinder({ pos: [x + Math.cos(yaw * D) * s, 2.0, z - Math.sin(yaw * D) * s], radius: 0.07, height: 2.2, color: C.wood2, collide: false });
      w.box({ pos: [x, 2.9, z], size: [3.4, 0.06, 0.06], yaw, color: C.wood, collide: false });
      for (let k = 0; k < 9; k++) w.box({ pos: [x + Math.cos(yaw * D) * (-1.4 + k * 0.35), 2.45, z - Math.sin(yaw * D) * (-1.4 + k * 0.35)], size: [0.12, 0.8, 0.04], yaw, color: k % 3 ? C.feather : '#e9dfc9', collide: false });
    };
    rack(-50, 92, 0); rack(-18, 96, 10); rack(40, 92, -8); rack(62, 90, 0);
    // the Perdikid shrine: a stone partridge on a plinth
    w.box({ pos: [-6, 1.6, 100], size: [1.6, 1.2, 1.6], color: C.stone });
    w.model({ pos: [-6, 2.2, 100], yaw: 200, parts: [{ s: 'sphere', r: 0.42, pos: [0, 0.4, 0], color: C.stone2 }, { s: 'sphere', r: 0.26, pos: [0, 0.78, 0.3], color: C.stone2 }, { s: 'cone', r: 0.08, h: 0.2, pos: [0, 0.76, 0.58], rot: [90, 0, 0], color: '#b9a37e' }, { s: 'box', size: [0.5, 0.1, 0.5], pos: [0, 0.32, -0.32], rot: [30, 0, 0], color: '#b9a37e' }] });
    w.interact({ pos: [-6, 1.5, 101.5], radius: 2.2, label: 'Look at the partridge', onUse: () => { codex('perdix'); return say('The shrine', 'A stone partridge, worn smooth by children\'s hands. Someone has left it a feather and a very small saw.'); } });
    w.checkpoint({ pos: [0, 1, 96], yaw: 180 });
    w.portal({ pos: [0, 1, 116], yaw: 180, to: 'hub', label: 'Junction', frame: C.wood2 });
    w.zone({ pos: [0, 2, 88], size: [220, 4, 50], once: true, onEnter: () => codex('pterousa') });

    // ---------- the stacks ----------
    const stack = (k) => {
      const [x, z, r, h] = S[k];
      w.cylinder({ pos: [x, h / 2 - 2, z], radius: r, height: h + 4, sides: 9, color: k === 'kes' || k === 'old' ? C.rock2 : C.rock });
      for (let y = 5; y < h - 2; y += 7 + R.range(0, 3)) w.cylinder({ pos: [x, y, z], radius: r + 0.06, height: 0.7, sides: 9, color: C.rock3, collide: false, shadow: false });
      w.cylinder({ pos: [x, h + 0.05, z], radius: r - 0.15, height: 0.12, sides: 9, color: k === 'gull' ? C.guano : C.grass, collide: false });
      for (let i = 0; i < 5; i++) { const a = R.range(0, 360) * D; w.box({ pos: [x + Math.cos(a) * (r + 0.02), h - 1.5 - R.range(0, 2), z + Math.sin(a) * (r + 0.02)], size: [0.5, R.range(2, 4), 0.06], yaw: 90 - a / D, color: C.guano, ...deco }); }
      w.particles({ pos: [x, h + 6, z], area: [r * 3, 6, r * 3], count: 10, color: '#ffffff', size: 0.35, kind: 'float' });
    };
    Object.keys(S).forEach(stack);
    // the direction (degrees, from +x toward +z) from a stack's centre to a point
    const angTo = (k, tx, tz) => Math.atan2(tz - S[k][1], tx - S[k][0]) / D;
    const onRing = (k, a, rr, y) => [S[k][0] + Math.cos(a * D) * rr, y, S[k][1] + Math.sin(a * D) * rr];
    // a stair winding round a stack: treads rising `rise` (0.4 m: a step anyone can take), from angle a0, dir +1 or -1;
    // returns its treads ([x, y, z, angle], top surfaces)
    const stair = (k, y0, y1, a0, dir, width = 2.2, rise = 0.4, tread = 1.7) => {
      const r = S[k][2], rr = r + width / 2 - 0.25, n = Math.max(1, Math.round(Math.abs(y1 - y0) / rise)), da = (tread / rr) / D, out = [];
      for (let i = 0; i <= n; i++) {
        const a = a0 + dir * da * i, y = y0 + ((y1 - y0) * i) / n, c = onRing(k, a, rr, y);
        w.box({ pos: [c[0], y - 0.2, c[2]], size: [width, 0.4, tread + 0.3], yaw: -a, color: i % 2 ? C.stone2 : C.stone });
        out.push([c[0], y, c[2], a]);
      }
      return out;
    };
    // a ledge on a stack's side at angle a: a flat shelf, top at y; returns its centre
    const ledge = (k, y, a, width = 2.6, len = 3.2) => {
      const c = onRing(k, a, S[k][2] + width / 2 - 0.3, y);
      w.box({ pos: [c[0], y - 0.25, c[2]], size: [width, 0.5, len], yaw: -a, color: C.stone });
      return c;
    };
    // a rope bridge of planks from a to b (both just inside the rock at their ends), sagging a little, rope rails
    const bridge = (a, b, width = 1.3, sag = 0.8) => {
      const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz), n = Math.max(2, Math.round(len / 0.9)), yaw = Math.atan2(dx, dz) / D;
      const yAt = (t) => a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        w.box({ pos: [a[0] + dx * t, yAt(t) - 0.08, a[2] + dz * t], size: [width, 0.16, (len / n) + 0.06], yaw, color: i % 2 ? C.wood : '#b07d48' });
      }
      for (const sd of [-1, 1]) for (let i = 0; i < n; i += 2) { // rope rails (seen, not solid)
        const t = (i + 0.5) / n, ox = Math.cos(yaw * D) * sd * (width / 2 + 0.05), oz = -Math.sin(yaw * D) * sd * (width / 2 + 0.05);
        w.box({ pos: [a[0] + dx * t + ox, yAt(t) + 0.95, a[2] + dz * t + oz], size: [0.05, 0.05, (len / n) * 2 + 0.05], yaw, color: C.rope, ...deco });
        w.box({ pos: [a[0] + dx * t + ox, yAt(t) + 0.45, a[2] + dz * t + oz], size: [0.04, 0.95, 0.04], color: C.rope, ...deco });
      }
      return { a, b, yaw, len, mid: [a[0] + dx / 2, yAt(0.5), a[2] + dz / 2] };
    };
    // a bridge between two stacks, from a (at ya) to b (at yb): an end on a stack's top starts 1 m inside its rim; an end
    // on a ledge (onLedge) stops on the ledge, 1.2 m outside the rim
    const span = (ka, ya, kb, yb, width, sag, onLedge = false) => bridge(onRing(ka, angTo(ka, S[kb][0], S[kb][1]), S[ka][2] - 1, ya),
      onRing(kb, angTo(kb, S[ka][0], S[ka][1]), S[kb][2] + (onLedge ? 1.2 : -1), yb), width, sag);
    // ribbons on poles show the air: straight up over an updraft, streaming sideways in a crosswind (slack in a lull)
    const ribbons = [];
    const ribbon = (p, kind) => {
      w.cylinder({ pos: [p[0], p[1] + 1.6, p[2]], radius: 0.06, height: 3.2, color: C.wood2, collide: false });
      const m = w.model({ pos: [p[0], p[1] + 3.2, p[2]], parts: [{ s: 'box', size: [0.12, 1.4, 0.03], pos: [0, -0.7, 0], color: C.ribbon }] });
      ribbons.push({ m, kind, yaw: R.range(0, 360) });
    };
    const gusts = [];
    // a bridge's crosswind: blows across it (only over the bridge: a zone turned to fit it), 3.5 s on and 3.5 s off;
    // the ribbons at its ends show which
    const crosswind = (br) => {
      const g = { in: false, force: [Math.cos(br.yaw * D) * 6, 0, -Math.sin(br.yaw * D) * 6] };
      w.zone({ pos: [br.mid[0], br.mid[1] + 1.2, br.mid[2]], size: [5, 5, br.len - 3], yaw: br.yaw, onEnter: () => { g.in = true; }, onExit: () => { g.in = false; } });
      gusts.push(g);
      for (const e of [br.a, br.b]) ribbon([e[0] + Math.cos(br.yaw * D) * 1.6, e[1], e[2] - Math.sin(br.yaw * D) * 1.6], 'cross');
    };

    // the west route: Low Stack's stair from a sand spit, a bridge to Cormorant (hop up its ledges), a bridge to the
    // Twins (a jump between them), a crosswind bridge to Kestrel's 30 m ledge, an updraft to 40 m, a stair to the deck
    w.box({ pos: [-62, 0.4, 51], size: [5, 1.2, 8], color: C.sand }); // the spit out to Low Stack
    const lowStair = stair('low', 1.4, 20, 90, -1);              // (ends round the far side from the bridge)
    const lowBridge = span('low', 20, 'corm', 20, 1.3, 0.8, true);
    const cAng = angTo('corm', S.low[0], S.low[1]);
    const corm20 = ledge('corm', 20, cAng, 3.0, 4.0);                   // where the bridge lands
    const cormNest = ledge('corm', 18.6, cAng - 32, 2.4, 2.8);          // a drop below it: the nest
    const cormLedges = [1, 2, 3, 4, 5].map((i) => ledge('corm', 20 + i * 1.35, cAng + 38 * i, 2.4, 2.8)); // hop up, round, to the top (28)
    const cormBridge = span('corm', 28, 'tww', 28, 1.3, 0.8, true);
    const tAng = angTo('tww', S.corm[0], S.corm[1]);
    const tww28 = ledge('tww', 28, tAng, 3.0, 4.0);
    const twwLedges = [1, 2].map((i) => ledge('tww', 28 + i * 1.33, tAng - 40 * i, 2.4, 2.8)); // and up to the top (32)
    const sandalStair = stair('tww', 27.6, 22, tAng + 26, 1, 1.8);      // down to a ledge where a gull keeps a sandal
    const tweAng = angTo('twe', S.kes[0], S.kes[1]);
    const tweStair = stair('twe', 31.6, 26, tweAng + 60, 1, 1.8);       // down the Twins' far side to a nest
    const kAng = angTo('kes', S.twe[0], S.twe[1]);
    const kes30 = ledge('kes', 30, kAng, 3.4, 5.0);
    const kesBridge = span('twe', 32, 'kes', 30, 1.2, 1.0, true);
    crosswind(kesBridge);
    // Kestrel: the 30 m ledge runs round to an updraft (ribbon straight up) beside a 40 m ledge; a stair from it to the deck
    const kes30b = ledge('kes', 30, kAng + 22, 3.0, 4.0);
    const upAt = onRing('kes', kAng + 38, S.kes[2] + 2.2, 30);
    const kesUp = ledge('kes', 40, kAng + 56, 3.0, 4.2);
    // the updraft: step into it and the air throws you up and across onto the 40 m ledge (a walker in a plain updraft
    // only bobs, 0.7 s up and down again, with no time to step across)
    w.box({ pos: [upAt[0], 29.75, upAt[2]], size: [3.0, 0.5, 3.0], color: C.stone });
    { const dx = kesUp[0] - upAt[0], dz = kesUp[2] - upAt[2], d = Math.hypot(dx, dz);
      w.jumpPad({ pos: [upAt[0], 30, upAt[2]], power: 26, push: [(dx / d) * 4.6, 0, (dz / d) * 4.6] }); }
    const updraft = upAt;
    w.particles({ pos: [upAt[0], 36, upAt[2]], area: [2.4, 12, 2.4], count: 26, color: '#ffffff', size: 0.3, kind: 'rise' });
    ribbon([upAt[0] + 1.1, 30, upAt[2] + 1.1], 'up');
    const kesStair = stair('kes', 40.3, DECK_Y, kAng + 70, 1, 1.6, 0.35, 1.45);
    w.checkpoint({ pos: kes30, yaw: 0 });

    // the east: a spit out to Old Wife, its stair, a crosswind bridge to the Eye stacks (walk across the arch), and a
    // stair down the Eye's south stack to its nest
    w.box({ pos: [94.5, 0.4, 37.5], size: [5, 1.2, 37], color: C.sand });
    w.box({ pos: [94.5, 0.4, 55], size: [9, 1.2, 4], color: C.sand });
    // (it starts on the east side so that it ends just where the bridge to the Eye leaves the top: a stair that passed
    // under a bridge near the top would bump your head on its planks)
    const oldStair = stair('old', 1.4, 36, angTo('old', S.eyeS[0], S.eyeS[1]) - 957.5, 1);
    const oldBridge = span('old', 36, 'eyeS', 40, 1.2, 0.7);
    crosswind(oldBridge);
    // the Eye: a rock wall between the Eye stacks, open from 22 to 32 m, with an arch on top you can walk
    const wall = (y0, y1) => w.box({ pos: [EYE[0], (y0 + y1) / 2, EYE[2]], size: [5, y1 - y0, 26], yaw: EYE_YAW, color: C.rock });
    wall(-2, 22); wall(32, 40);
    w.box({ pos: [EYE[0], 40.05, EYE[2]], size: [4.6, 0.1, 24], yaw: EYE_YAW, color: C.grass, collide: false });
    for (let i = 0; i < 7; i++) { // ribbons hung across the opening: the gate
      const t = -6 + i * 2, x = EYE[0] + Math.sin(EYE_YAW * D) * t, z = EYE[2] + Math.cos(EYE_YAW * D) * t;
      w.box({ pos: [x, 30.4, z], size: [0.08, 3.2, 0.5], yaw: EYE_YAW, color: i % 2 ? C.ribbon : '#f4ead8', collide: false });
    }
    w.label({ pos: [EYE[0], 43.5, EYE[2]], text: 'The Eye', size: 0.6 });
    // the bird chimney: a column of seabirds rising over the water, past the Eye
    const chimney = w.wind({ pos: [CHIMNEY[0], 22, CHIMNEY[1]], size: [16, 44, 16], force: [0, 30, 0] });
    w.particles({ pos: [CHIMNEY[0], 24, CHIMNEY[1]], area: [12, 40, 12], count: 70, color: '#ffffff', size: 0.4, kind: 'rise' });
    // Gull Pillar: an updraft beside it lifts a glider to the top (Old Horn is there)
    w.wind({ pos: [S.gull[0] - 6, 34, S.gull[1]], size: [7, 60, 7], force: [0, 34, 0] });
    w.particles({ pos: [S.gull[0] - 6, 40, S.gull[1]], area: [6, 50, 6], count: 40, color: '#ffffff', size: 0.35, kind: 'rise' });
    // where the nests are: on the routes' treads and ledges
    const treadNear = (tr, y) => tr.reduce((b, t) => (Math.abs(t[1] - y) < Math.abs(b[1] - y) ? t : b), tr[0]);
    const NEST = {
      low: { at: treadNear(lowStair, 12), name: 'Low Stack' },
      corm: { at: cormNest, name: 'Cormorant' },
      twe: { at: tweStair[tweStair.length - 1], name: 'the Twins' },
      kes: { at: kesUp, name: 'Kestrel' },
      old: { at: treadNear(oldStair, 30), name: 'Old Wife' },
      eye: { at: [EYE[0] + Math.sin(EYE_YAW * D) * 4, 40, EYE[2] + Math.cos(EYE_YAW * D) * 4], name: 'the top of the Eye' },
      mast: { at: null, name: 'the palace ship\'s masthead' }, // (set below, on the rope stair's last tread)
    };
    // ---------- Kestrel's deck: Perdika's workshop, the Balance, the launch plank ----------
    const K = S.kes;
    w.cylinder({ pos: [K[0], DECK_Y + 0.06, K[1]], radius: K[2] - 0.2, height: 0.12, sides: 12, color: C.wood, collide: false }); // (flush: the stair's top treads stay clear)
    for (const [dx, dz] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) w.cylinder({ pos: [K[0] + dx, DECK_Y + 2.2, K[1] + dz], radius: 0.14, height: 4.2, color: C.wood2, collide: false });
    w.box({ pos: [K[0], DECK_Y + 4.4, K[1]], size: [12, 0.4, 10], color: C.reed, collide: false });
    for (let i = 0; i < 4; i++) w.model({ pos: [K[0] - 6 + i * 3, DECK_Y + 1.4, K[1] - 6], yaw: 0, parts: wing(1).concat(wing(-1)).map((q) => Object.assign({}, q, { pos: [q.pos[0] * 1.6, q.pos[1] * 1.6, q.pos[2]], size: q.size.map((v) => v * 1.6) })) });
    const pa = PLANK_YAW * D, px = K[0] + Math.sin(pa) * (K[2] + 3.6), pz = K[1] + Math.cos(pa) * (K[2] + 3.6);
    w.box({ pos: [px, DECK_Y + 0.1, pz], size: [1.4, 0.2, 7], yaw: PLANK_YAW, color: '#c08a50' });
    const PLANK_TIP = [K[0] + Math.sin(pa) * (K[2] + 7), DECK_Y, K[1] + Math.cos(pa) * (K[2] + 7)];
    ribbon([K[0] + Math.sin(pa) * (K[2] + 0.5) + 1.2, DECK_Y, K[1] + Math.cos(pa) * (K[2] + 0.5)], 'flag');
    w.checkpoint({ pos: [K[0] + 3, DECK_Y, K[1] + 4], yaw: PLANK_YAW });
    // the Balance: a beam with two pans; the finished left wing (12) and the right frame (2) with what you place on it
    const BAL = [K[0] - 4, DECK_Y, K[1] + 6];
    w.box({ pos: [BAL[0], BAL[1] + 0.9, BAL[2]], size: [0.3, 1.8, 0.3], color: C.wood2 });
    const beam = w.model({ pos: [BAL[0], BAL[1] + 1.85, BAL[2]], parts: [
      { s: 'box', size: [4.2, 0.14, 0.18], pos: [0, 0, 0], color: '#c08a50' },
      { s: 'cyl', r: 0.5, h: 0.08, pos: [-2, -0.5, 0], color: C.bronze, metal: 0.6 }, { s: 'cyl', r: 0.5, h: 0.08, pos: [2, -0.5, 0], color: C.bronze, metal: 0.6 },
      { s: 'box', size: [0.02, 0.5, 0.02], pos: [-2, -0.25, 0], color: C.rope }, { s: 'box', size: [0.02, 0.5, 0.02], pos: [2, -0.25, 0], color: C.rope },
      { s: 'box', size: [0.9, 0.06, 0.45], pos: [-2, -0.42, 0], color: C.feather }] });
    w.sign({ pos: [BAL[0], BAL[1] + 0.2, BAL[2] - 1.4], yaw: 0, title: 'Carved on the beam', width: 2.6, text: 'Three pieces to a wing.\nNever more wax than feather.\nReed is for the spine.', bg: '#4a3526', border: '#d9b27c', titleColor: '#ffd98a', frame: C.wood2, post: false, read: false });
    const pan = []; // what is on the right pan (piece keys), this visit
    const pieceMesh = {};
    PIECES.forEach((pc, i) => {
      const at = [BAL[0] + 3.2, BAL[1] + 1.05, BAL[2] - 2 + i * 1.0];
      w.box({ pos: [at[0], BAL[1] + 0.5, at[2]], size: [1.0, 1.0, 0.9], color: C.wood2 });
      const look = pc.kind === 'wax' ? [{ s: 'box', size: [0.4, 0.06 * pc.w, 0.3], pos: [0, 0.03 * pc.w, 0], color: C.wax }] : pc.kind === 'feather' ? [{ s: 'box', size: [0.12, 0.6 + pc.w * 0.15, 0.04], pos: [0, 0.4, 0], rot: [0, 0, 15], color: C.feather }] : [{ s: 'cyl', r: 0.06, h: 1.2, pos: [0, 0.1, 0], rot: [90, 0, 0], color: C.reed2 }];
      pieceMesh[pc.k] = w.model({ pos: at, parts: look });
      w.label({ pos: [at[0], at[1] + 1.1, at[2]], text: pc.name, size: 0.3 });
      const it = w.interact({ pos: at, radius: 1.3, label: `Place the ${pc.name}`, onUse: () => placePiece(pc.k) });
      pieceMesh[pc.k].it = it;
    });
    function balanceWeight() { return 2 + pan.reduce((s, k) => s + PIECES.find((p) => p.k === k).w, 0); }
    async function placePiece(k) {
      if (!flag('lsb.p.met') || store.get('balanced', false)) return;
      if (store.get('feathers', []).length < 7) return say('Perdika', 'Feathers first. Seven. Then we balance.');
      const i = pan.indexOf(k);
      if (i >= 0) pan.splice(i, 1); else pan.push(k);
      w.sound('click');
      for (const pc of PIECES) pieceMesh[pc.k].it.setLabel(pan.includes(pc.k) ? `Take the ${pc.name} off` : `Place the ${pc.name}`);
      const wt = balanceWeight();
      if (pan.length < 3 && wt !== 12) return;
      const kinds = pan.map((q) => PIECES.find((p) => p.k === q).kind);
      const nWax = kinds.filter((q) => q === 'wax').length, nFeather = kinds.filter((q) => q === 'feather').length;
      if (kinds.includes('reed')) return say('Perdika', 'Reed\'s for the spine! A wing with a reed in it flies like a door.');
      if (nWax > nFeather) return say('Perdika', 'That\'s a wax wing. Wax wings are for people who want to be famous after they\'re dead.');
      if (pan.length < 3) return say('Perdika', 'Three pieces. Three. I didn\'t carve it on the beam for decoration.');
      if (pan.length > 3) return say('Perdika', 'That\'s four. A wing is three pieces. Take one off.');
      if (wt !== 12) return say('Perdika', `Twelve, not ${wt}. Left wing's twelve spans. Make the right side match.`);
      store.set('balanced', true); w.setFlag('lsb.p.balanced', true);
      w.sound('win'); w.burst([BAL[0] + 2, BAL[1] + 2, BAL[2]], { color: [C.feather, C.wax], count: 40, speed: 5, life: 1 });
      await say('Perdika', 'Feather, feather, wax. One holds, two fly. Look at that: you can count.');
      codex('wax');
      await fear();
    }

    // ---------- the palace ship Labrys at the west pier, and Kessa's Patient Cow on its other side ----------
    w.box({ pos: [-30, 1.15, 39], size: [4, 0.5, 34], color: C.wood });              // the pier, deck at 1.4
    for (let z = 23; z < 56; z += 5) for (const dx of [-1.8, 1.8]) w.cylinder({ pos: [-30 + dx, -0.4, z], radius: 0.2, height: 3, color: C.wood2, collide: false });
    // the hull: red, eyes on the bow (north), deck at 2.6; a gangplank from the pier
    w.box({ pos: [-36.5, 0.9, 37], size: [7, 3.4, 26], color: C.red });
    w.box({ pos: [-36.5, 2.55, 37], size: [6.4, 0.1, 25.4], color: '#b98a56' });
    w.box({ pos: [-39.9, 3.1, 37], size: [0.25, 1.0, 26], color: C.red2 });                                // the rails (a gap
    w.box({ pos: [-33.1, 3.1, 28.5], size: [0.25, 1.0, 9], color: C.red2 }); w.box({ pos: [-33.1, 3.1, 42.5], size: [0.25, 1.0, 15], color: C.red2 }); // at the gangplank)
    w.box({ pos: [-36.5, 3.1, 24.1], size: [7, 1.0, 0.25], color: C.red2 });
    for (const s of [-1, 1]) w.sphere({ pos: [-36.5 + s * 2.2, 1.9, 23.9], radius: 0.45, color: '#ffffff', collide: false });
    for (const s of [-1, 1]) w.sphere({ pos: [-36.5 + s * 2.2, 1.9, 23.75], radius: 0.22, color: '#1a1a2a', collide: false });
    for (let i = 0; i < 3; i++) w.box({ pos: [-31.5 - i * 0.55, 1.6 + i * 0.2, 34], size: [0.6, 0.4 + i * 0.4, 2], color: C.wood }); // the gangplank: three 0.4 m steps up from the pier
    // the mast, and a stair of rope round it to the masthead (the seventh nest)
    const mastTreads = [];
    w.cylinder({ pos: [-36.5, 9.6, 36], radius: 0.35, height: 14, color: C.wood2 });
    w.box({ pos: [-36.5, 9.5, 36], size: [10, 0.15, 0.15], color: C.wood2, collide: false });
    w.box({ pos: [-36.5, 6.6, 36.3], size: [9.6, 6, 0.06], color: '#f4ead8', ...deco });
    {
      const n = 33, rr = 1.15;
      for (let i = 0; i <= n; i++) { const a = (i * 34) * D; w.box({ pos: [-36.5 + Math.cos(a) * rr, 2.6 + i * 0.4 + 0.05, 36 + Math.sin(a) * rr], size: [1.0, 0.1, 0.7], yaw: -a / D, color: C.rope }); mastTreads.push([-36.5 + Math.cos(a) * rr, 2.6 + i * 0.4 + 0.1, 36 + Math.sin(a) * rr]); }
    }
    // the stern cabin, its roof open to the sky, and the bronze chest inside
    for (const [x, z, sx, sz] of [[-39.2, 46.5, 0.3, 5], [-33.8, 46.5, 0.3, 5], [-36.5, 49, 5.7, 0.3]]) w.box({ pos: [x, 3.9, z], size: [sx, 2.6, sz], color: C.red2 });
    w.box({ pos: [-38, 3.9, 44], size: [2.7, 2.6, 0.3], color: C.red2 }); // (a doorway on the right)
    w.box({ pos: [-36.5, 3.0, 47.8], size: [1.4, 0.8, 0.9], color: C.bronze, metal: 0.5 });
    // deck lanterns, lit at midnight: one over each patrol
    const lanterns = [[-33.4, 30.5], [-33.4, 42.6]].map(([x, z]) => {
      w.box({ pos: [x, 4.1, z], size: [0.1, 1.0, 0.1], color: C.wood2, collide: false });
      const glow = w.sphere({ pos: [x, 4.75, z], radius: 0.2, color: '#ffc46b', glow: 2.4, collide: false });
      const l = w.light({ pos: [x - 0.6, 5.0, z], color: '#ffc46b', intensity: 30, distance: 15 }); l.visible = false;
      return { glow, l };
    });
    // crates of cargo amidships (cover from the deck's patrols at night)
    // (the starboard side stays clear, rail to crates, from the bow to the cabin door)
    for (const [x, z] of [[-38, 30], [-35.6, 31.6], [-38, 39.6], [-35.6, 39.8]]) w.box({ pos: [x, 3.3, z], size: [1.6, 1.4, 1.6], color: '#9a7a50' });
    w.label({ pos: [-36.5, 6.2, 24], text: 'The Labrys', size: 0.5 });
    w.zone({ pos: [-36.5, 4, 37], size: [7, 6, 26], once: true, onEnter: () => codex('labrys') });
    // the Patient Cow, on the pier's east side
    w.box({ pos: [-25, 0.6, 38], size: [4, 1.6, 11], color: '#b98a56' });
    w.box({ pos: [-25, 6, 38], size: [0.25, 10, 0.25], color: C.wood2, collide: false });
    w.box({ pos: [-25, 7, 38.2], size: [5.4, 5, 0.06], color: '#f2e6cc', ...deco });
    w.box({ pos: [-25, 7, 38.25], size: [5.4, 0.5, 0.07], color: '#c8503c', ...deco });

    // ---------- the hidden cove (where Kessa puts in, in the dark), through a sea cave to the village ----------
    w.box({ pos: [114, 6, 72], size: [8, 14, 30], color: C.rock2 }); w.box({ pos: [114, 6, 108], size: [8, 14, 30], color: C.rock2 });
    w.box({ pos: [114, 9, 90], size: [8, 8, 6], color: C.rock3 });   // the cave's roof (open at y 1..5)
    w.box({ pos: [130, 0, 90], size: [24, 2, 30], color: C.sand });
    w.box({ pos: [138, 0.6, 96], size: [3, 1.2, 8], color: '#b98a56' }); // the Cow's skiff, pulled up

    // ---------- the landing circle, and Glauke's loom-floor ----------
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; w.box({ pos: [CIRCLE[0] + Math.cos(a) * 6, 1.1, CIRCLE[2] + Math.sin(a) * 6], size: [0.9, 0.3, 0.7], yaw: -a / D, color: C.ochre }); }
    w.cylinder({ pos: [CIRCLE[0], 1.02, CIRCLE[2]], radius: 5.6, height: 0.04, sides: 32, color: '#e8cf98', collide: false, shadow: false });
    const LO = [-24, 1, 80]; // the floor's centre; row 0 at the loom end (north)
    w.box({ pos: [LO[0], 2.6, LO[2] - 6.6], size: [7, 3.2, 0.3], color: C.loom });
    LOOM.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') w.box({ pos: [LO[0] + (c - 3) * 0.95, 1.6 + (6 - r) * 0.38, LO[2] - 6.45], size: [0.8, 0.3, 0.06], color: C.thread, glow: 0.4, collide: false }); }));
    const stones = [];
    LOOM.forEach((row, r) => [...row].forEach((ch, c) => {
      const p = [LO[0] - 4.5 + c * 1.5, 1.05, LO[2] - 4.5 + r * 1.5];
      const m = w.box({ pos: p, size: [1.3, 0.1, 1.3], color: C.stone2, collide: false });
      const glowM = w.box({ pos: [p[0], 1.11, p[2]], size: [1.1, 0.04, 1.1], color: C.thread, glow: 1.6, collide: false });
      glowM.hide();
      const st = { r, c, thread: ch === 'X', lit: false, glowM, m };
      w.zone({ pos: [p[0], 1.6, p[2]], size: [1.4, 1.6, 1.4], onEnter: () => stepStone(st) });
      stones.push(st);
    }));
    function stepStone(st) {
      if (store.get('loom', false) || !flag('lsb.p.loomTalk')) return;
      if (!st.thread) {
        if (stones.some((q) => q.lit)) { for (const q of stones) { q.lit = false; q.glowM.hide(); } w.sound('error'); w.toast('A gap. The threads come undone.'); }
        return;
      }
      if (st.lit) return;
      st.lit = true; st.glowM.show(); w.sound('blip');
      if (stones.filter((q) => q.thread).every((q) => q.lit)) loomDone();
    }
    async function loomDone() {
      store.set('loom', true); w.setFlag('lsb.sign.athena', true);
      w.sound('win'); w.burst([LO[0], 4, LO[2] - 6.6], { color: ['#9aa0a8', C.thread], count: 50, speed: 5, life: 1.2 });
      await say('Glauke', ['There. An owl. Wisdom is mostly looking up before you step.']);
      w.give('lsb-owl-brooch');
      await say('Glauke', 'Look after the little bird, the wingmaker. I caught one of hers once, a long way up. I\'d rather not have to do it again.');
    }

    // ---------- people ----------
    const PERDIKA_DECK = [K[0] + 5, DECK_Y, K[1] - 2]; // by the stair's top and the plank, away from the Balance's bench
    const perdika = w.npc({ pos: PERDIKA_DECK, yaw: 100, name: 'Perdika', walks: true, look: LOOKS.perdika, onTalk: () => talkPerdika() });
    const ikmalios = w.npc({ pos: [-31.2, 1.4, 48], yaw: -90, name: 'Ikmalios', walks: true, look: LOOKS.ikmalios, onTalk: () => talkIkmalios() });
    const kessa = w.npc({ pos: [-27.6, 1.4, 41], yaw: 90, name: 'Kessa', walks: true, hat: 'lsb-headscarf', look: LOOKS.kessa, onTalk: () => talkKessa() });
    const glauke = w.npc({ pos: [LO[0] + 5.4, 1, LO[2] - 6.4], yaw: 200, name: 'Glauke', look: LOOKS.glauke, onTalk: () => talkGlauke() });
    w.model({ pos: [LO[0] + 3.2, 4.35, LO[2] - 6.6], parts: [{ s: 'sphere', r: 0.22, pos: [0, 0, 0], color: '#8a8f98' }, { s: 'sphere', r: 0.17, pos: [0, 0.3, 0.02], color: '#9aa0a8' }, { s: 'sphere', r: 0.05, pos: [0.07, 0.33, 0.16], color: '#ffd166', glow: 0.8 }, { s: 'sphere', r: 0.05, pos: [-0.07, 0.33, 0.16], color: '#ffd166', glow: 0.8 }] });
    const kyllo = w.npc({ pos: [44, 1, 72], yaw: -30, name: 'Kyllo', walks: true, hat: 'lsb-petasos', look: LOOKS.kyllo, wave: true, onTalk: () => talkKyllo() });
    // Kessa waits where she landed you: the cove (dark) until you have met Perdika, then at the pier with the Cow
    if (!lit && !flag('lsb.p.met')) kessa.setPos([132, 1, 94], -90);

    // ---------- the seven nests, the tin-drops and the sandal (picked up by walking into them) ----------
    const carry = (p, parts, onTake, radius = 1.4) => {
      const m = w.model({ pos: p, parts });
      const z = w.zone({ pos: p, radius, onEnter: () => { if (!z.enabled) return; z.enabled = false; m.group.visible = false; onTake(); } });
      return { m, z, base: p[1] };
    };
    const bobbers = [];
    w.on('frame', (dt, t) => { for (const b of bobbers) if (b.m.group.visible) { b.m.group.position.y = b.base + 0.4 + Math.sin(t * 2 + b.base) * 0.12; b.m.group.rotation.y = t * 1.1; } });
    const feathers = () => store.get('feathers', []);
    const nestAt = {};
    NEST.mast.at = mastTreads[mastTreads.length - 1];
    for (const [k, n] of Object.entries(NEST)) {
      const p = n.at;
      w.model({ pos: [p[0], p[1] - 0.05, p[2]], parts: [{ s: 'torus', r: 0.55, tube: 0.18, rot: [90, 0, 0], pos: [0, 0.12, 0], color: '#a88a5a' }, { s: 'cyl', r: 0.45, h: 0.12, pos: [0, 0.05, 0], color: '#8a6e48' }] });
      if (feathers().includes(k)) continue;
      const h = carry([p[0], p[1] + 0.3, p[2]], [{ s: 'box', size: [0.16, 1.2, 0.05], pos: [0, 0.5, 0], rot: [0, 0, 18], color: C.feather }, { s: 'box', size: [0.04, 1.3, 0.04], pos: [0.04, 0.48, 0.03], rot: [0, 0, 18], color: '#d8cfba' }], () => {
        const got = feathers().concat([k]); store.set('feathers', got);
        w.sound('pickup'); w.burst([p[0], p[1] + 1, p[2]], { color: ['#ffffff', '#f3f0e6'], count: 24, speed: 6, life: 0.9 });
        w.toast(`Great feather from ${n.name}: ${got.length} of 7`);
        if (got.length === 7) w.toast('Seven! Back to Perdika\'s Balance.', 'item');
        objective();
      });
      nestAt[k] = h; bobbers.push(h);
    }
    // tin-drops: on the routes (treads, ledges, bridges), the arch, and the ship's mast stair
    const up = (q, h = 0.8) => [q[0], q[1] + h, q[2]];
    const TIN = [up(treadNear(lowStair, 6)), up(treadNear(lowStair, 16)), up(lowBridge.mid), up(cormLedges[2]), up(cormBridge.mid), up(twwLedges[1]),
      up(sandalStair[Math.floor(sandalStair.length / 2)]), up(kesBridge.mid), up(kes30b), up(kesStair[Math.floor(kesStair.length / 2)]),
      up(treadNear(oldStair, 12)), up(treadNear(oldStair, 24)), up(oldBridge.mid), [EYE[0], 40.8, EYE[2]], up(mastTreads[16], 0.6)];
    const tins = () => store.get('tin', []);
    TIN.forEach((p, i) => {
      if (tins().includes(i)) return;
      bobbers.push(carry(p, [{ s: 'sphere', r: 0.16, pos: [0, 0, 0], color: C.tin, glow: 1.3, metal: 0.5 }, { s: 'cone', r: 0.11, h: 0.24, pos: [0, 0.18, 0], color: C.tin, glow: 1.3, metal: 0.5 }], () => {
        const got = tins().concat([i]); store.set('tin', got);
        w.sound('coin'); w.toast(`Tin-drop: ${got.length} of ${TIN.length}`);
      }, 1.2));
    });
    let sandal = null;
    const SANDAL = up(sandalStair[sandalStair.length - 1], 0.2);
    function makeSandal() {
      if (sandal || flag('lsb.kind.2') || store.get('sandal', false) || !store.get('sandalAsked', false)) return;
      sandal = carry(SANDAL, [{ s: 'box', size: [0.3, 0.06, 0.6], pos: [0, 0, 0], color: '#8a5a3a' }, { s: 'box', size: [0.34, 0.12, 0.05], pos: [0, 0.08, 0.1], rot: [0, 0, 0], color: '#f2d28a' }, { s: 'box', size: [0.5, 0.03, 0.12], pos: [0.2, 0.12, -0.1], rot: [0, 30, 20], color: '#ffffff' }], () => {
        store.set('sandal', true); w.sound('pickup'); w.toast('Kyllo\'s sandal. It flutters.'); objective();
      });
      bobbers.push(sandal);
    }
    makeSandal();
    // Old Horn on top of Gull Pillar
    const goat = w.model({ pos: [S.gull[0] + 1, S.gull[3] + 0.05, S.gull[1]], yaw: 200, parts: [
      { s: 'box', size: [0.55, 0.5, 1.0], pos: [0, 0.75, 0], color: '#f2ece0' }, { s: 'box', size: [0.38, 0.4, 0.42], pos: [0, 1.15, 0.6], color: '#f2ece0' },
      { s: 'cone', r: 0.06, h: 0.4, pos: [0.12, 1.45, 0.55], rot: [-30, 0, 0], color: '#5a4a3a' }, { s: 'cone', r: 0.06, h: 0.4, pos: [-0.12, 1.45, 0.55], rot: [-30, 0, 0], color: '#5a4a3a' },
      ...[[-0.18, -0.35], [0.18, -0.35], [-0.18, 0.35], [0.18, 0.35]].map(([x, z]) => ({ s: 'box', size: [0.1, 0.5, 0.1], pos: [x, 0.25, z], color: '#5a4a3a' })),
      { s: 'box', size: [0.05, 0.3, 0.12], pos: [0, 1.02, 0.86], rot: [0, 0, 70], color: '#ffffff' }] });
    w.zone({ pos: [S.gull[0], S.gull[3] + 1.5, S.gull[1]], radius: 4.5, onEnter: () => {
      if (flag('lsb.goat.2')) return;
      w.setFlag('lsb.goat.2', true); w.sound('win');
      say('Old Horn', '(Old Horn stands on the highest rock in the Isles, chewing a feather. The gulls are giving her a wide berth.)');
    } });

    // Echo VIII, beside her, once Season 1 of the Founder's hunt has begun (GAME.md)
    w.echo({ id: '8', pos: [S.gull[0] - 1.6, S.gull[3] + 1.4, S.gull[1] + 1.4], hidden: !flag('s1.started'),
      line: 'Gliding is flying for people who mean to come home. I always meant to come home.',
      next: 'Echo IX: "Make the Giant\'s wave once, all the way to the channel. Then find the child who builds it out of sand." Halcyon Point.' });

    // ---------- Perdika's feather basket: Kestrel's deck to the beach and back, once you have met her ----------
    const BASKET_TOP = [K[0] - 9.5, DECK_Y + 0.15, K[1] + 8.5], BASKET_BOTTOM = [-50, 1.35, 60];
    w.box({ pos: [BASKET_BOTTOM[0], 0.7, BASKET_BOTTOM[2]], size: [5, 0.6, 5], color: C.wood });
    w.cylinder({ pos: [BASKET_BOTTOM[0] + 2.8, 3, BASKET_BOTTOM[2]], radius: 0.15, height: 5, color: C.wood2, collide: false });
    w.sign({ pos: [BASKET_BOTTOM[0] + 3.4, 1.0, BASKET_BOTTOM[2] + 3.2], yaw: 180, title: 'The feather basket', width: 2.4, text: 'Up to Kestrel and back.\nPerdika\'s rope. Stand in, hold on.', bg: '#4a3526', border: '#d9b27c', titleColor: '#ffd98a', frame: C.wood2 });
    function makeBasket() {
      if (P.basket) return;
      const b = w.box({ pos: BASKET_TOP, size: [3, 0.3, 3], color: '#b07d48' });
      w.mover(b, { path: [BASKET_TOP, BASKET_BOTTOM], speed: 9, pause: 3 });
      P.basket = b;
    }
    if (flag('lsb.p.met')) makeBasket();
    // the rope the basket rides (seen, not solid)
    { const dx = BASKET_BOTTOM[0] - BASKET_TOP[0], dy = BASKET_BOTTOM[1] - BASKET_TOP[1], dz = BASKET_BOTTOM[2] - BASKET_TOP[2], len = Math.hypot(dx, dy, dz);
      const rope = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, len, 5), w.mat(C.rope, {}));
      rope.position.set(BASKET_TOP[0] + dx / 2, BASKET_TOP[1] + 2 + dy / 2, BASKET_TOP[2] + dz / 2);
      rope.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx, dy, dz).normalize()); w.add(rope); }

    // ---------- the story ----------
    const has = (k) => !!flag(k);
    async function talkPerdika() {
      perdika.face('player');
      if (!has('lsb.p.met')) {
        w.setFlag('lsb.p.met', true);
        await say('Perdika', ['Stop. Don\'t step there, that\'s a wing. Step there. No, there. Saw and compass, are all strangers this big?',
          'You climbed Kestrel. Nobody climbs Kestrel. Four hundred and twelve pegs; I counted them putting them in.',
          'I\'m Perdika. I make wings. The House ordered twelve pairs for the Festival, and I need someone to test-fly the new design, because I am not doing it.']);
        const i = await ask('Perdika', 'You\'ll do it. Won\'t you?', ['Why not you?', 'Is it safe?', 'All right.'], 2);
        await say('Perdika', ['Because I\'m a genius, not an idiot. Next question.', 'It\'s safer than walking. Walking kills hundreds of people a year. Nobody counts.', 'Good. Don\'t say "soar". I hate "soar".'][i]);
        await say('Perdika', 'The frame\'s ready. It needs seven great feathers from the nests on the stacks, and it needs balancing. Then you jump off that plank and do exactly what I shout.');
        await say('Perdika', ['See the ribbons? Wind\'s invisible; ribbons aren\'t. Ribbon straight up means the air\'s going up, and if you stand in it, it takes you with it.',
          'Ribbon streaming sideways: crosswind. Wait till it goes slack, then cross. Don\'t be brave. Brave people are mostly at the bottom of the lagoon.']);
        if (w.has('glider')) await say('Perdika', 'Is that a glider? Let me see. Hm. Wide, flat, climbs too well. Somebody\'s going to fly that into the sun one day. Use mine here.');
        await say('Perdika', 'Nests: Low Stack, Cormorant, the Twins, Kestrel\'s north face, Old Wife, the Eye, and that palace ship\'s masthead, because the gulls have no shame. I\'ll send the basket down for you. Nobody climbs Kestrel twice.');
        codex('perdikids');
        makeBasket();
        objective();
        return;
      }
      if (!store.get('balanced', false)) {
        const n = feathers().length;
        if (n < 7) return say('Perdika', `${n} of 7. The nests are on the stacks, and one on the palace ship's masthead. Ribbons up, you go up.`);
        return say('Perdika', 'Left wing\'s done: twelve spans. Right frame\'s two. Make the right side twelve. Rules are on the beam.');
      }
      if (!has('lsb.has.wings')) return fear();
      if (!has('lsb.p.flown')) return say('Perdika', 'Run, jump, hold Space! Straight at the ribbons! Through the Eye, into the birds, and down in the circle.');
      if (!flag('lsb.compass')) return compassTalk();
      if (flag('lsb.compass') === 'stolen' && !has('lsb.p.compassDone')) {
        if (!w.has('lsb-compass')) return say('Perdika', 'Midnight. The stern cabin. Mind the Axe-Bearers; they look where they walk.');
        await say('Perdika', 'It\'s warm. Brass shouldn\'t be warm. Hello. Hello, you.');
        w.take('lsb-compass'); w.setFlag('lsb.p.compassDone', true); codex('compass');
        dawn(); objective(); return;
      }
      if (flag('lsb.compass') === 'asked' && !has('lsb.p.compassDone')) {
        if (!has('lsb.ikmalios.shaken')) return say('Perdika', 'Go on, then. Ask him. Openly. I\'ll be here, not biting anyone.');
        await say('Perdika', '"Nothing yet." Hm. That\'s the first thing a Daedalid has ever said to us that wasn\'t a price.');
        w.setFlag('lsb.p.compassDone', true); objective(); return;
      }
      if (has('lsb.p.compassDone')) return say('Perdika', 'The House\'s twelve pairs go to Kerynthos on the cow-boat, and so do I. Kessa\'s at the pier.');
      return say('Perdika', 'It\'s still ours.');
    }
    async function fear() {
      if (has('lsb.has.wings')) return;
      await say('Perdika', ['Right. Strap in. I\'ll stand here and shout. I was meant to test it myself, you know. Gran said I should.',
        'I make the best wings in the Isles and I can\'t stand on that plank. My great-great-great-grandfather was pushed off a cliff. A goddess caught him and made him a bird. We still dream about the falling part.']);
      const i = await ask('Perdika', 'Go on. Say something wise. Everyone does.', ['Fly when you\'re ready. I\'ll go first.', 'Just jump. It\'s your design.'], 0);
      w.setFlag('lsb.perdika.trust', i === 0);
      await say('Perdika', i === 0 ? '...When I\'m ready. Nobody ever said that. Fine. You first. I\'ll watch the wing, not the drop.' : '"Just jump." That\'s what HE said, probably, at the top of the Acropolis. Strap in, Stranger.');
      w.setFlag('lsb.has.wings', true);
      lendWings();
      codex('lowwings');
      objective();
    }
    function lendWings() {
      if (!w.has('lsb-low-wings')) w.give('lsb-low-wings', { silent: true });
      const eq = w.equipment();
      if (eq.back !== 'lsb-low-wings') { if (eq.back && !store.get('prevBack', null)) store.set('prevBack', eq.back); w.equip('lsb-low-wings'); }
    }

    // the test flight: off the plank, through the Eye, up the bird chimney, down in the circle
    // (a try starts when you leave Kestrel's deck in the air, wings on)
    w.on('tick', () => {
      if (P.flight || !has('lsb.has.wings') || has('lsb.p.flown') || w.player.grounded) return;
      const p = w.player.pos;
      if (p[1] < DECK_Y - 5 || p[1] > DECK_Y + 8 || Math.hypot(p[0] - K[0], p[2] - K[1]) < K[2] + 1.5) return;
      P.flight = { eye: false, chimney: false, t0: w.time };
      w.toast('Perdika: "Hold Space! Straight at the ribbons!"');
      objective();
    });
    w.zone({ pos: EYE, size: [6, 10, 14], yaw: EYE_YAW, onEnter: () => {
      if (!P.flight || P.flight.eye) return;
      P.flight.eye = true; w.sound('pad'); w.toast('Perdika: "THROUGH! Ha! Now right, into the birds, circle, CIRCLE!"');
    } });
    w.zone({ pos: [CHIMNEY[0], 22, CHIMNEY[1]], size: [16, 44, 16], onEnter: () => {
      if (!P.flight || P.flight.chimney) return;
      P.flight.chimney = true; w.toast('Perdika: "Up, up. Enough! Beach! Now!"');
    } });
    const circleZone = w.zone({ pos: [CIRCLE[0], 2.4, CIRCLE[2]], radius: 6.2, onStay: () => { if (P.flight && w.player.grounded) endFlight(P.flight.eye ? 'circle' : 'cheat'); } });
    w.on('tick', () => { // landing anywhere else ends the try
      const f = P.flight;
      if (!f || !w.player.grounded || w.time - f.t0 < 1.5) return;
      const p = w.player.pos;
      if (Math.hypot(p[0] - CIRCLE[0], p[2] - CIRCLE[2]) < 6.2) return; // (the circle's zone decides)
      if (p[1] > DECK_Y - 2 && Math.hypot(p[0] - K[0], p[2] - K[1]) < K[2] + 8) { P.flight = null; return; } // still on the deck: not flying yet
      endFlight('short');
    });
    async function endFlight(how) {
      const f = P.flight; if (!f) return;
      P.flight = null;
      if (how === 'wet') { w.player.respawn(); return say('Perdika', 'Wet. That\'s data. Again.'); }
      if (how === 'short' || how === 'cheat') {
        w.toast(how === 'cheat' ? 'Perdika: "Through the EYE first. The Eye!"' : 'Perdika: "Down, and not in the circle. That\'s data too. Again!"');
        await w.wait(1.5);
        w.player.setPos([K[0] + 3, DECK_Y + 0.5, K[1] + 4], PLANK_YAW);
        w.toast('Perdika hauls you back up in the feather basket.');
        return;
      }
      // in the circle
      w.setFlag('lsb.p.flown', true); w.sound('win');
      w.burst([CIRCLE[0], 3, CIRCLE[2]], { color: [C.feather, C.ochre, '#ffffff'], count: 80, speed: 8, life: 1.4 });
      perdika.setPos([CIRCLE[0] + 3.5, 1, CIRCLE[2] - 2.5], -120);
      await w.wait(1);
      await say('Perdika', ['(Out of breath from the stairs.) In the circle. In the CIRCLE. The wing works. I made a wing that works with a person in it.',
        'Keep them. On loan. Bring them back unbroken, or bring back an excellent reason.']);
      if (!flag('title.lsb.lowflyer')) { w.setFlag('title.lsb.lowflyer', true); w.toast('Title earned: Low-Flyer', 'item'); }
      await compassTalk();
    }

    // the compass
    async function compassTalk() {
      if (flag('lsb.compass')) return;
      perdika.face([-36.5, 3, 37]);
      await say('Perdika', 'That\'s the palace ship. Of course. Ikmalios. He buys my wings, he doesn\'t look at me, and he pays in good tin. I hate that he pays in good tin.');
      await say('Perdika', feathers().includes('mast') && store.get('mastSeen', true) ? 'You were up his mast. Did you see a brass case in the cabin? Two legs and a hinge?' : 'Gran says he carries it everywhere. A brass case with two legs and a hinge.');
      await say('Perdika', ['That\'s the Compass of Perdix. My family\'s. The first circle anyone ever drew on purpose. The Daedalids took it when they took everything else, and they\'ve been drawing labyrinths with it for a hundred years.',
        'Tonight the crew will be drunk on our wine. I could get it. We could get it.']);
      codex('compass');
      const i = await ask('Perdika', 'Well? Will you help me take back what\'s ours?', ['Let\'s take it.', 'Ask him for it. Openly.', 'Let it go. It\'s just a tool.'], 2);
      if (i === 0) {
        w.setFlag('lsb.compass', 'stolen');
        await say('Perdika', 'Saw and compass. Midnight. Mind the Axe-Bearers on deck; they look where they walk, and nowhere else.');
        midnight();
      } else if (i === 1) {
        w.setFlag('lsb.compass', 'asked');
        await say('Perdika', 'Ask. A Daedalid. ...You do it. If I do it I\'ll bite him.');
      } else {
        w.setFlag('lsb.compass', 'left');
        await say('Perdika', 'Just a tool. A wheel\'s just a tool. Fire\'s just a tool. Fine. FINE.');
        perdika.hide();
        await w.wait(20);
        perdika.show(); perdika.face('player');
        await say('Perdika', '(She comes back an hour later.) It\'s still ours.');
        w.setFlag('lsb.p.compassDone', true);
      }
      objective();
    }
    // midnight on the Labrys: two Axe-Bearers walk the deck, each looking where it walks (5.5 m, 50 degrees either side)
    const NIGHT = { skyTop: '#0b1030', skyHorizon: '#2e3a66', skyBottom: '#0f1430', skySharp: 0.55, sunDir: [-0.6, 0.35, -0.4], sunColor: '#a9b8ff', sunLight: '#7d8fd6', sunSize: 0.5,
      sunIntensity: 0.9, hemiSky: '#5664a0', hemiGround: '#2e2e44', hemiIntensity: 1.15, fog: [160, 700], fogColor: '#1a2040', stars: 1, bloom: 0.5, exposure: 1.05 };
    const DAY = { skyTop: '#1f66d6', skyHorizon: '#cbe7f7', skyBottom: '#9fd3ea', skySharp: 0.6, sunDir: [0.3, 0.75, 0.45], sunColor: '#fffaf0', sunLight: '#fffdf6', sunSize: 1.8,
      sunIntensity: 3.1, hemiSky: '#dcecff', hemiGround: '#d9c08c', hemiIntensity: 1.45, fog: [260, 1100], fogColor: '#d4ecf6', stars: 0, bloom: 0.25, exposure: 1.0 };
    // one walks the starboard side of the bow, up to the gangplank and back; the other crosses the stern deck in front of
    // the cabin door, pausing at each rail. They look where they walk (5.5 m, 50 degrees each way), so there are two
    // windows: up the gangplank while the first walks to the bow, and in at the door while the second walks to the far
    // rail. Between them, by the starboard rail amidships, neither can see you
    const GUARD_PATHS = [[[-34.0, 2.6, 30, 1], [-34.0, 2.6, 26, 2]], [[-34.2, 2.6, 42, 1], [-38.8, 2.6, 42, 3]]];
    const guards = GUARD_PATHS.map((path) => { const g = w.npc({ pos: path[0], yaw: 0, name: 'Axe-Bearer', walks: true, look: LOOKS.guard, onTalk: () => say('Axe-Bearer', 'Move along. Ship\'s closed for the night.') }); g.hide(); return { g, path, last: null, face: 0 }; });
    const chest = w.interact({ pos: [-36.5, 3.4, 47.8], radius: 1.6, label: 'Break the clay seal', onUse: () => takeCompass() });
    chest.enabled = false;
    function midnight() {
      if (P.night) return;
      P.night = true;
      for (const q of lanterns) q.l.visible = true;
      w.setTheme(NIGHT, 4); w.banner('Midnight', 'The crew is asleep on Perdikid wine. Two Axe-Bearers are not.');
      ikmalios.hide();
      for (const q of guards) {
        q.face = Math.atan2(q.path[1][0] - q.path[0][0], q.path[1][2] - q.path[0][2]); q.last = null;
        q.g.show(); q.g.setPos(q.path[0], q.face / D); q.g.walk(q.path, { loop: true, pause: 1 });
      }
      chest.enabled = true;
      objective();
    }
    function dawn() {
      if (!P.night) return;
      P.night = false;
      for (const q of lanterns) q.l.visible = false;
      w.setTheme(DAY, 6); w.banner('Morning', 'The palace ship\'s crew wakes up with headaches.');
      for (const q of guards) { q.g.stop(); q.g.hide(); }
      chest.enabled = false;
      ikmalios.show();
    }
    async function takeCompass() {
      if (!P.night || w.has('lsb-compass') || has('lsb.p.compassDone')) return;
      w.sound('crumble'); w.give('lsb-compass');
      await say('The chest', '(You strike the clay seal. Inside, on red cloth, lies a brass compass. It is warm.)');
      w.toast('Back to Perdika on the beach, quietly.');
      objective();
    }
    w.on('tick', () => { // the Axe-Bearers' eyes
      if (!P.night) return;
      for (const q of guards) { // which way each is facing: the way it last walked
        const g = q.g.pos, gp = [g.x !== undefined ? g.x : g[0], g.y !== undefined ? g.y : g[1], g.z !== undefined ? g.z : g[2]];
        if (q.last) { const mx = gp[0] - q.last[0], mz = gp[2] - q.last[2]; if (Math.hypot(mx, mz) > 1e-3) q.face = Math.atan2(mx, mz); }
        q.last = gp;
      }
      if (P.seenT > 0) { P.seenT -= 1 / 60; return; }
      const p = w.player.pos;
      if (p[1] < 2.2 || p[0] < -40 || p[0] > -33 || p[2] < 23 || p[2] > 51) return; // only aboard
      for (const q of guards) {
        const gp = q.last;
        const dx = p[0] - gp[0], dz = p[2] - gp[2], d = Math.hypot(dx, dz);
        if (d > 5.5 || d < 0.01) continue;
        let a = Math.atan2(dx, dz) - q.face; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
        if (Math.abs(a) > 50 * D) continue;
        P.seenT = 2;
        w.sound('error'); w.toast('An Axe-Bearer: "Who\'s there? Off the ship, you." (You are walked back to the pier.)');
        w.player.setPos([-30, 2, 31], 0);
        return;
      }
    });
    async function talkIkmalios() {
      ikmalios.face('player');
      if (flag('lsb.compass') === 'asked' && !has('lsb.ikmalios.shaken')) {
        await say('Ikmalios', ['The compass. She sent you. No, she didn\'t; she\'d have come with teeth. You came.',
          'Do you know what I draw with it? Every corridor of the House. Every turn of the labyrinth. Every horn of the Listening Room. My family built the Isles\' cage with her family\'s circle.',
          'I can\'t give it to you. Not here, not with the crew watching. Tell her... (he stops) Tell her nothing yet. Tell her the House pays in good tin.']);
        w.setFlag('lsb.ikmalios.shaken', true); objective(); return;
      }
      if (flag('lsb.compass') === 'stolen' && has('lsb.p.compassDone')) {
        if (!store.get('coldSeen', false)) {
          store.set('coldSeen', true);
          await say('Ikmalios', ['Someone broke a seal on my ship last night and took one thing. Not the tin, not the wine. One brass compass.', '(He looks at you for a long moment.) Well. It\'s a long way to Kerynthos.']);
          return;
        }
        return say('Ikmalios', '(He doesn\'t look up from his tablets.)');
      }
      if (!store.get('ikHello', false)) {
        store.set('ikHello', true);
        if (lit) return say('Ikmalios', ['Pterousa. Mind the gulls; they\'re Perdikid gulls and they hate me personally.', 'The wingmaker you want is the granddaughter, Perdika. Best hands in the Isles, worst manners. I\'m not welcome up there. You\'ll do better alone.']);
        return say('Ikmalios', 'The stranger from Thyra. You came the long way round, I hear. Perdika\'s up the tall stack. Don\'t tell her I said hello.');
      }
      return say('Ikmalios', has('lsb.p.flown') ? 'I saw you go through the Eye. Perdikid wings. They never climb, which is the whole point.' : 'The wingmaker\'s up the tall stack. Kestrel. Four hundred and twelve pegs, she\'ll tell you.');
    }
    async function talkKessa() {
      kessa.face('player');
      if (!lit && !store.get('kessaHello', false)) {
        store.set('kessaHello', true);
        return say('Kessa', ['Out you get. The palace ship\'s in already; they\'ll be asking after a stranger from Thyra. You\'re a stranger from nowhere in particular.', 'Go and see the wingmaker. Top of the tall stack. Don\'t fall off.']);
      }
      if (!has('lsb.p.compassDone')) return say('Kessa', has('lsb.p.flown') ? 'Saw you fly. Don\'t do that near my mast.' : 'I sail when the wingmaker\'s ready. She\'s never ready. Go and help her be ready.');
      await say('Perdika', 'The House\'s twelve pairs go to Kerynthos on the cow-boat, and so do I. I\'m not trusting my wings to a Daedalid hold.');
      await say('Kessa', 'Wingmaker aboard. Wonderful. She\'ll measure my mast and tell me it\'s wrong.');
      await say('Perdika', 'It\'s wrong.');
      if (lit && flag('lsb.compass') !== 'stolen') await say('Ikmalios', 'You\'re sailing with the cow? Suit yourself. Show Talos the seal at the strait; he likes things done properly.');
      const i = await ask('Kessa', 'Ready? We sail for Kerynthos, by the Strait of Teeth.', ['Sail.', 'Not yet.'], 1);
      if (i !== 0) return say('Kessa', 'Not yet. Story of my life.');
      return leave();
    }
    async function leave() {
      w.setFlag('lsb.ch', Math.max(2, flag('lsb.ch') || 0));
      w.setTheme(NIGHT, 6);
      w.player.setPos([-25, 1.6, 36], 180);
      w.shot({ pos: [-12, 6, 52], look: [-25, 2.5, 38] });
      await w.wait(2);
      await say('Perdika', ['(That night, on the Patient Cow\'s rail, checking stitching by lamplight, without looking up.) What do they do with the old Voices? When the new one comes.',
        'Gran said they build them a little house inside the mountain. Gran also said the moon was a cheese.']);
      for (let i = 0; i < 3; i++) { w.shake(0.25); w.sound('crumble'); await w.wait(1.4); }
      await say('The sea', '(From the north, very faintly: a deep metal sound, three slow beats, like a bell the size of a hill.)');
      w.sound('win'); w.banner('End of chapter two', 'The Last Summer of Bronze continues in Three Circuits.');
      await w.wait(6);
      w.travel(w.worlds.some((x) => x.id === 'lsb-strait') ? 'lsb-strait' : 'hub'); // (on to the Strait of Teeth, aboard the Cow)
    }
    async function talkGlauke() {
      glauke.face('player');
      codex('glauke');
      if (store.get('loom', false)) {
        const lines = ['Olive oil is the best gift anyone ever gave a city. Better than a spring of salt water, whatever some people say.', 'The Daedalids make beautiful things and never ask what they\'re for. That\'s not cleverness. That\'s a very fast kind of stupid.'];
        if (flag('lsb.compass') === 'stolen' && has('lsb.p.compassDone') && !store.get('glaukeStolen', false)) { store.set('glaukeStolen', true); return say('Glauke', 'A thing stolen back is still stolen. Ask the partridge\'s family what pushing does to a house.'); }
        const n = store.get('glaukeN', 0); store.set('glaukeN', n + 1);
        return say('Glauke', lines[n % 2]);
      }
      await say('Glauke', has('lsb.p.flown') ? 'You fly like a partridge. Good. The ones who fly like eagles keep me busy.' : 'You walk like someone who\'s about to fly. Mind the wax.');
      if (!has('lsb.p.loomTalk')) {
        const i = await ask('Glauke', 'Do you weave?', ['No.', 'Who are you?'], 0);
        await say('Glauke', i === 0 ? 'Then learn. It\'s the same as thinking, only you can wear the result.' : 'Someone who mends sails. Who are you? Ah, you don\'t know yet either.');
        w.setFlag('lsb.p.loomTalk', true);
      }
      return say('Glauke', 'My loom has a pattern on it. The floor wants the same pattern. Step only on the thread. Look at what you\'re making.');
    }
    async function talkKyllo() {
      kyllo.face('player');
      if (flag('lsb.kind.2')) return say('Kyllo', 'My feet thank you. I can\'t go anywhere without them, and I go everywhere.');
      if (store.get('sandal', false)) {
        store.set('sandal', false); w.setFlag('lsb.kind.2', true); w.sound('win');
        return say('Kyllo', ['Ah! My sandal! Still fluttering. Bird thought it was a nest. Can\'t blame it.', 'My feet thank you. I can\'t go anywhere without them, and I go everywhere.']);
      }
      store.set('sandalAsked', true); makeSandal();
      return say('Kyllo', 'Ah! Friend! A gull took my other sandal to the Twins. Bird thinks it\'s a nest. It\'s a sandal. Very fluttery, warm, you\'ll know it.');
    }

    // ---------- the High Line: ten ribbon hoops from Gull Pillar's updraft down to the beach, against the clock ----------
    // (they fall 1 m in 4.3, a little steeper than a glide's 1 in 4.5: jump off Gull Pillar's top and simply glide, and
    // every hoop comes up within reach, the last about 2 m high; each ring faces the way you come at it)
    const HOOPS = [[12, 60.1, -78], [26, 55.2, -62], [40, 50.2, -46], [52, 45.6, -30], [60, 41, -12], [62, 36.8, 6], [56, 32.8, 22], [44, 28.9, 34], [30, 24.9, 44], [18, 21.2, 54]];
    const hoopYaw = (i) => { const a = i ? HOOPS[i - 1] : [S.gull[0], 0, S.gull[1]], h = HOOPS[i]; return Math.atan2(h[0] - a[0], h[2] - a[2]) / D; };
    const hoopMeshes = HOOPS.map((h, i) => w.model({ pos: h, yaw: hoopYaw(i), parts: [{ s: 'torus', r: 3.2, tube: 0.18, rot: [0, 0, 0], pos: [0, 0, 0], color: i === 0 ? '#ffd166' : C.ribbon, glow: 0.8 }] }));
    for (const hm of hoopMeshes) hm.group.visible = false;
    HOOPS.forEach((h, i) => w.zone({ pos: h, radius: 4, onEnter: () => hoop(i) }));
    function hoop(i) {
      if (!has('lsb.p.flown')) return;
      const H = P.high;
      if (i === 0 && !H) { P.high = { next: 1, t0: w.time }; w.timer.start(); w.sound('go'); w.toast('The High Line: through every hoop, down to the beach.'); return; }
      if (!H || i !== H.next) return;
      H.next++; w.sound('blip');
      if (H.next === HOOPS.length) {
        const t = w.timer.stop(); P.high = null;
        const prev = store.get('highBest', null);
        if (prev == null || t < prev) store.set('highBest', t);
        const counted = w.record('lsb-highline', t, { better: 'lower' });
        w.sound('win'); w.banner(`High Line: ${w.fmtTime(t)}`, prev != null && t < prev ? 'a new best' : prev != null ? `best ${w.fmtTime(prev)}` : counted ? 'your first time on the boards' : '');
      }
    }
    w.on('respawn', () => { if (P.high) { P.high = null; w.timer.cancel(); } });
    w.on('tick', () => { // one glide: landing anywhere ends the try
      if (P.high && w.player.grounded) { P.high = null; w.timer.cancel(); w.toast('Landed. The High Line is one glide, from Gull Pillar\'s top.'); objective(); }
    });

    // ---------- the goal line: one next step at a time ----------
    function objective() {
      for (const hm of hoopMeshes) hm.group.visible = has('lsb.p.flown');
      if (P.high) return w.objective(`The High Line: hoop ${P.high.next + 1} of ${HOOPS.length}.`);
      if (has('lsb.p.compassDone') || (flag('lsb.ch') || 0) >= 2) {
        if ((flag('lsb.ch') || 0) >= 2) return w.objective('Chapter two is done. The High Line starts at Gull Pillar\'s updraft, by Kestrel.');
        return w.objective('Kessa sails for Kerynthos from the pier, with Perdika aboard.', { at: [-27.6, 3.4, 41] });
      }
      if (!has('lsb.p.met')) return w.objective('Find Perdika, the wingmaker, at the top of the tallest stack.', { at: [K[0], DECK_Y + 2, K[1]] });
      const n = feathers().length;
      if (n < 7) return w.objective(`Gather seven great feathers from the nests on the stacks (${n} of 7).`);
      if (!store.get('balanced', false)) return w.objective('Balance the right wing on Perdika\'s Balance.', { at: [BAL[0], BAL[1] + 2, BAL[2]] });
      if (!has('lsb.has.wings')) return w.objective('Talk to Perdika: the wing is ready.', { at: [K[0], DECK_Y + 2, K[1]] });
      if (!has('lsb.p.flown')) return w.objective('The test flight: off the plank, through the Eye, into the birds, and down in the ochre circle.', { at: P.flight && P.flight.eye ? [CIRCLE[0], 3, CIRCLE[2]] : [EYE[0], EYE[1], EYE[2]] });
      const c = flag('lsb.compass');
      if (!c) return w.objective('Perdika is on the beach, by the circle.', { at: [CIRCLE[0] + 3.5, 3, CIRCLE[2] - 2.5] });
      if (c === 'stolen') return w.objective(w.has('lsb-compass') ? 'Back to Perdika on the beach, quietly.' : 'Midnight: board the Labrys and take the compass from the stern cabin.', { at: w.has('lsb-compass') ? [CIRCLE[0] + 3.5, 3, CIRCLE[2] - 2.5] : [-36.5, 4, 47.8] });
      if (c === 'asked') return w.objective(has('lsb.ikmalios.shaken') ? 'Tell Perdika what Ikmalios said.' : 'Ask Ikmalios for the compass, at the pier.', { at: has('lsb.ikmalios.shaken') ? [CIRCLE[0] + 3.5, 3, CIRCLE[2] - 2.5] : [-31.2, 3.4, 48] });
      return w.objective('Perdika stomped off. Give her a moment.');
    }
    w.on('pickup', () => objective());

    // ---------- arriving and leaving ----------
    if (has('lsb.p.flown')) perdika.setPos([CIRCLE[0] + 3.5, 1, CIRCLE[2] - 2.5], -120);
    if (flag('lsb.compass') === 'stolen' && !has('lsb.p.compassDone')) midnight();
    w.on('enter', () => {
      if (has('lsb.has.wings')) lendWings(); // the wings are a loan: they stay in the Isles
      if (w.arrival === 'pier') w.after(1.5, () => talkIkmalios());
      else if (w.arrival === 'cove') w.after(1.5, () => talkKessa());
      else if (!has('lsb.p.met')) w.after(2, () => w.toast('Pterousa, the wingmakers\' island. Perdika is at the top of the tallest stack.'));
      objective();
    });
    w.on('leave', () => {
      if (w.has('lsb-low-wings')) {
        w.take('lsb-low-wings');
        const prev = store.get('prevBack', null);
        if (prev && w.has(prev)) w.equip(prev);
        store.set('prevBack', null);
      }
    });
    // what is drawn: ribbons on their poles
    w.on('frame', (dt, t) => {
      for (const rb of ribbons) {
        const on = rb.kind === 'flag' || (rb.kind === 'cross' && P.gustOn);
        const g = rb.m.group;
        if (rb.kind === 'up') { g.rotation.set(Math.PI + Math.sin(t * 7 + rb.yaw) * 0.12, 0, 0); continue; }
        if (on) { g.rotation.set(0, rb.yaw * D, Math.PI / 2 + Math.sin(t * 11 + rb.yaw) * 0.18); }
        else if (rb.kind === 'cross' && P.gustSoon) { g.rotation.set(0, rb.yaw * D, Math.PI / 5 + Math.sin(t * 9 + rb.yaw) * 0.3); } // (lifting: a gust is coming)
        else { g.rotation.set(Math.sin(t * 1.5 + rb.yaw) * 0.08, 0, 0); }
      }
    });
    // the crosswinds blow 3 s and rest 5 s (the longest bridge is 3.5 s at a run, so go as the ribbons drop); the ribbons
    // start to lift 1 s before each gust
    const GUST = 180, LULL = 300;
    P.gustOn = true; P.gustSoon = false;
    w.on('tick', () => {
      const k = w.ticks % (GUST + LULL);
      P.gustOn = k < GUST; P.gustSoon = k >= GUST + LULL - 60;
      if (P.gustOn) for (const g of gusts) if (g.in) w.player.push(g.force);
    });
    w.scene.userData.pterousa = { P, perdika, ikmalios, kessa, glauke, kyllo, guards, nestAt, NEST, S, EYE, CIRCLE, CHIMNEY, PLANK_TIP, BAL, HOOPS, BASKET_TOP, BASKET_BOTTOM,
      route: { lowStair, lowBridge, corm20, cormNest, cormLedges, cormBridge, tww28, twwLedges, sandalStair, tweStair, kes30, kesBridge, kes30b, upAt, kesUp, kesStair, oldStair, oldBridge, mastTreads },
      stones, LO, SANDAL, TIN, pan, updraft, chimney, PIECES };
  },
};
