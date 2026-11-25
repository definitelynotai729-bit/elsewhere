// Underfoot: a child's bedroom, seen at the size of a toy. Everything is thirty times bigger than you are used to: the
// bed is a cliff, the rug is a field, a marble is the size of your head. Crumb, a mouse who lives behind the skirting
// board, knows where the ten lost marbles rolled and can't reach one of them. And the room has its own game, played
// every day by the child who lived here: the floor is lava, from the door to the window sill, against the clock.
//
// The room is 120 x 150 m and 75 m high (4 x 5 m and 2.5 m high, at thirty times). North (-z): the window, with the
// desk under it. West: the bed, its head in the north-west corner, and the nightstand beside it. East: the bookshelf
// and the wardrobe, with a warm-air vent in the floor in front of it. South: the door (the way back to Junction) and the
// toy box. In the middle, the rug, with a toy train going round on it.
//
// Ways up, at toy size (a jump clears about 1.9 m): the blanket, slid off the bed into a slope; books stacked as stairs;
// a slinky that throws you onto the chair; a whoopee cushion on the chair that throws you onto the desk; a stair of
// alphabet blocks to the toy box's rim, and a jack-in-the-box inside to spring you out again; and, with the paper plane
// folded on the desk (a loan: it stays in the room), the vent's warm air up to the top of the wardrobe.
//
// The cat sleeps on the bed. It wakes for a few seconds now and then and looks about; a small one it sees on the bed
// gets batted off. Walls and ceiling cast no shadow (the room is full of daylight); the furniture does, and it is
// dark under the bed, where the dust bunnies live.

const D = Math.PI / 180;
const C = {
  floor: '#c99a6b', floorLine: '#b5845a', wall: '#f4e9d8', skirting: '#fffaf1', ceiling: '#fbf4e8',
  wood: '#a8754b', woodDark: '#86583a', woodLight: '#d4a574', paint: '#e9d6b4', paintDark: '#d8c09a',
  mattress: '#f8f4ec', blanket: '#5b9fe0', blanket2: '#f2c14e', pillow: '#fffdf8',
  rug: '#4a78c9', rug2: '#f2c14e', rug3: '#e8685a', rug4: '#fff4dc',
  red: '#e2574c', yellow: '#f6c945', green: '#4fb286', blue: '#4a8fe0', pink: '#f59ab5', purple: '#9b7be0', orange: '#f39a3d',
  cardboard: '#c9a06c', cardboardDark: '#ad8653', paper: '#fdfbf6', metal: '#c9ccd6',
  cat: '#f0a04b', catDark: '#cf7d2c', catLight: '#fbe3c4', dust: '#d9d3c7', lava: '#ff5a1f',
  grass: '#86c86a', grassDark: '#6aaa52', trunk: '#8a6440', leaf: '#5fb85e', leafDark: '#469b49', sky: '#cfe9ff',
};
const LOOKS = {
  crumb: { style: 'little', face: 'big', mouth: 'cat', top: 'bear', tail: 'cord', outfit: 'apron', extra: 'none', finish: 'matte',
    colors: { body: '#a39b94', head: '#a39b94', eyes: '#1d1a22', outfit: '#e8685a', trim: '#fff4dc' } },
};
// the rug (a mat drawn on the floor) and the train going round on it
const RUG = [8, 22], RUG_R = 28, TRACK_R = 18, TRAIN_SPEED = 6;
const atRug = (r, deg) => [RUG[0] + Math.sin(deg * D) * r, RUG[1] + Math.cos(deg * D) * r];
const bearing = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]) / D;
// the floor-is-lava run starts on a slipper by the door and ends on the window sill
const START = [31, 63], SPAWN = [40, 68];
const BLANKET_FOOT = [-17, -30];
const DRUM_IN = atRug(23, bearing(RUG, START)), DRUM_OUT = atRug(23, bearing(RUG, BLANKET_FOOT));
const CAT = [-49, 15.4, -27];
const SLEEP_T = 9, AWAKE_T = 4;          // the cat: asleep 9 s, awake 4 s, round and round
const CAT_SEE = 24, CAT_CONE = 50;        // how far and how wide (degrees either side) it sees when awake
const VENT = [36, 5];                      // the warm-air vent in the floor, in front of the wardrobe
const MARBLE_IDS = ['bed', 'pillow', 'nightstand', 'cup', 'drawer', 'sill', 'wardrobe', 'shelf', 'train', 'toybox'];

export default {
  id: 'underfoot',
  name: 'Underfoot',
  author: 'elsewhere',
  version: 1,
  blurb: 'A child\'s bedroom at the size of a toy. Find the ten lost marbles; the floor is lava.',
  color: '#f39a3d',
  spawn: { pos: [SPAWN[0], 1.6, SPAWN[1]], yaw: 180 },
  killY: -20,
  rules: { deny: ['board'], powers: false }, // (the floor is lava is a race: artifacts sleep here)
  theme: { // daylight through the window
    skyTop: '#5aa8f2', skyHorizon: '#d6efff', skyBottom: '#e9f6ff', skySharp: 0.6,
    sunDir: [0.32, 0.62, -0.72], sunColor: '#fff3d6', sunSize: 1.6, sunLight: '#fff2dc', sunIntensity: 2.7,
    hemiSky: '#fff4e2', hemiGround: '#d4ab82', hemiIntensity: 1.4,
    fog: [500, 1400], fogColor: '#e4f2fb', stars: 0, bloom: 0.22, exposure: 1.0,
  },
  music: { root: 60, scale: 'major', bpm: 86, progression: [0, 5, 3, 4], sparkle: 0.55, bright: 2100, wave: 'triangle', pulse: false },
  items: {
    'uf-paper-plane': {
      name: 'Paper Plane', slot: 'back', traits: ['glide'], rarity: 'uncommon',
      desc: 'Folded from a crayon drawing in Underfoot. Hold Space in the air to glide. It stays in the room.',
      look: [
        { s: 'box', size: [0.07, 0.03, 0.9], pos: [0, 0.06, 0], color: '#fdfbf6' },
        { s: 'box', size: [0.46, 0.02, 0.78], pos: [-0.23, 0.09, 0.06], rot: [0, -9, 14], color: '#fdfbf6' },
        { s: 'box', size: [0.46, 0.02, 0.78], pos: [0.23, 0.09, 0.06], rot: [0, 9, -14], color: '#fdfbf6' },
        { s: 'box', size: [0.05, 0.025, 0.42], pos: [-0.3, 0.115, 0.12], rot: [0, -9, 14], color: '#4a8fe0' },
        { s: 'box', size: [0.05, 0.025, 0.42], pos: [0.3, 0.115, 0.12], rot: [0, 9, -14], color: '#e2574c' },
      ],
    },
    'uf-thimble': {
      name: 'Thimble Helmet', slot: 'head', traits: ['cosmetic'], rarity: 'rare',
      desc: 'Crumb\'s thanks for bringing back the ten lost marbles of Underfoot.',
      look: [
        { s: 'cyl', r: 0.27, h: 0.05, pos: [0, 0.025, 0], color: '#aeb2bf', metal: 0.7 },
        { s: 'cyl', r: 0.25, h: 0.3, pos: [0, 0.18, 0], color: '#c9ccd6', metal: 0.7 },
        { s: 'sphere', size: [0.25, 0.09, 0.25], pos: [0, 0.33, 0], color: '#c9ccd6', metal: 0.7 },
        ...[0, 60, 120, 180, 240, 300].map((a) => ({ s: 'sphere', r: 0.03, pos: [Math.sin(a * D) * 0.25, 0.2, Math.cos(a * D) * 0.25], color: '#9da1ad', metal: 0.6 })),
      ],
    },
  },

  build(w) {
    const store = w.store;
    const has = (k) => !!w.flag(k);
    const say = (n, l) => w.say(n, l);
    const deco = { collide: false, shadow: false };
    // big colliders are tiled (a walker slowly sinks into one long box); tiles meet edge to edge
    const tiled = (a0, a1, step, make) => { for (let a = a0; a < a1 - 1e-6; a += step) { const len = Math.min(step, a1 - a); make(a + len / 2, len); } };
    // a solid box given by its extents (x0..x1, y0..y1, z0..z1)
    const slab = (x0, x1, y0, y1, z0, z1, o = {}) => w.box(Object.assign({ pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], size: [x1 - x0, y1 - y0, z1 - z0] }, o));

    // ---------- the room ----------
    tiled(-60, 60, 40, (x, lx) => tiled(-75, 75, 50, (z, lz) => w.box({ pos: [x, -1, z], size: [lx, 2, lz], color: C.floor })));
    for (let x = -58.5; x < 60; x += 3) w.box({ pos: [x, 0.006, 0], size: [0.1, 0.012, 150], color: C.floorLine, ...deco }); // floorboards
    const wall = (x0, x1, y0, y1, z0, z1) => slab(x0, x1, y0, y1, z0, z1, { color: C.wall, shadow: false });
    // north (the window: x -18..18, y 27..63), south (the door: x 22..46, y 0..60), west, east; and the ceiling
    tiled(-61, -18, 50, (x, l) => wall(x - l / 2, x + l / 2, 0, 75, -77, -75)); tiled(18, 61, 50, (x, l) => wall(x - l / 2, x + l / 2, 0, 75, -77, -75));
    wall(-18, 18, 0, 27, -77, -75); wall(-18, 18, 63, 75, -77, -75);
    tiled(-61, 22, 42, (x, l) => wall(x - l / 2, x + l / 2, 0, 75, 75, 77)); wall(46, 61, 0, 75, 75, 77); wall(22, 46, 60, 75, 75, 77);
    tiled(-77, 77, 39, (z, l) => { wall(-62, -60, 0, 75, z - l / 2, z + l / 2); wall(60, 62, 0, 75, z - l / 2, z + l / 2); });
    tiled(-60, 60, 40, (x, lx) => tiled(-75, 75, 50, (z, lz) => w.box({ pos: [x, 76, z], size: [lx, 2, lz], color: C.ceiling, shadow: false })));
    // skirting boards
    for (const [x0, x1, z0, z1] of [[-60, 60, -75, -74.4], [-60, 22, 74.4, 75], [46, 60, 74.4, 75], [-60, -59.4, -75, 75], [59.4, 60, -75, 75]]) {
      tiled(Math.min(x0, x1), Math.max(x0, x1), 50, (x, l) => tiled(z0, z1, 50, (z, lz) => slab(x - l / 2, x + l / 2, 0, 3, z - lz / 2, z + lz / 2, { color: C.skirting })));
    }
    // the ceiling lamp
    w.cylinder({ pos: [0, 73.5, 0], radius: 7, height: 2.5, sides: 24, color: '#fff7e6', glow: 0.6, ...deco });
    // the window: glass (solid: you stay in the room), its frame, the sill, curtains, and the garden outside
    w.box({ pos: [0, 45, -76], size: [36, 36, 0.2], color: C.sky, opacity: 0.16, shadow: false });
    for (const [x, y, sx, sy] of [[0, 45, 0.8, 36], [-17.6, 45, 0.8, 36], [17.6, 45, 0.8, 36], [0, 45, 36, 0.8], [0, 62.6, 36, 0.8]]) w.box({ pos: [x, y, -75.6], size: [sx, sy, 0.8], color: '#ffffff', ...deco });
    slab(-20, 20, 25.8, 27, -75, -70.5, { color: '#ffffff' }); // the sill, top at 27
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) w.box({ pos: [s * (21 + i * 1.7), 41, -73.6 + (i % 2) * 0.6], size: [1.8, 48, 0.8], color: i % 2 ? '#f6b26b' : '#f39a3d', ...deco });
    }
    w.box({ pos: [0, 66, -73.4], size: [56, 0.8, 0.8], color: C.woodDark, ...deco }); // the curtain rod
    w.box({ pos: [0, -1.2, -260], size: [700, 2, 360], color: C.grass, ...deco }); // the garden, far below the sill
    w.box({ pos: [0, 15, -150], size: [400, 30, 14], color: C.leafDark, ...deco }); // the hedge
    for (const [x, z, r, h] of [[-120, -230, 46, 140], [90, -260, 60, 170], [10, -330, 40, 120], [-40, -200, 26, 70]]) {
      w.cylinder({ pos: [x, h * 0.35, z], radius: r * 0.16, height: h * 0.7, color: C.trunk, ...deco });
      w.sphere({ pos: [x, h * 0.78, z], radius: r, color: C.leaf, low: true, ...deco });
    }
    // the door, open: the way back to Junction (the hall beyond is out of bounds)
    slab(46, 47.5, 0, 60, 51, 75, { color: '#f6f0e5' });
    w.sphere({ pos: [45.2, 28, 53], radius: 1.1, color: '#d9b45a', metal: 0.6, ...deco });
    slab(22, 46, 0, 60, 75.2, 75.8, { invisible: true });
    w.box({ pos: [34, -0.5, 95], size: [24, 1, 40], color: '#b88a5e', ...deco }); w.box({ pos: [34, 30, 115], size: [24, 60, 2], color: '#e8dcc6', ...deco });
    w.portal({ pos: [34, 0, 73], yaw: 180, to: 'hub', label: 'Junction', frame: C.woodLight });
    w.checkpoint({ pos: [SPAWN[0], 0, SPAWN[1] - 2], yaw: 180 });
    // the rug, drawn on the floor, and the train's track round it
    w.cylinder({ pos: [RUG[0], 0.03, RUG[1]], radius: RUG_R, height: 0.05, sides: 48, color: C.rug, ...deco });
    // (its rings 4 cm apart: closer, and far away they flicker into each other)
    [[24.5, C.rug2], [21.5, C.rug3], [12, C.rug4], [8, C.rug2]].forEach(([r, c], i) => w.cylinder({ pos: [RUG[0], 0.07 + i * 0.04, RUG[1]], radius: r, height: 0.02, sides: 48, color: c, ...deco }));
    for (const rr of [TRACK_R - 1.1, TRACK_R + 1.1]) w.model({ pos: [RUG[0], 0.3, RUG[1]], parts: [{ s: 'torus', r: rr, tube: 0.12, rot: [90, 0, 0], color: '#8d8f99', metal: 0.5 }] });
    for (let a = 0; a < 360; a += 7.5) { const p = atRug(TRACK_R, a); w.box({ pos: [p[0], 0.24, p[1]], size: [3.0, 0.08, 0.6], yaw: a + 90, color: C.woodDark, ...deco }); }

    // ---------- the marbles: ten of them, each the size of your head ----------
    const marbles = () => store.get('marbles', []);
    const MCOL = { bed: C.blue, pillow: C.pink, nightstand: C.green, cup: C.yellow, drawer: C.purple, sill: C.orange, wardrobe: C.red, shelf: '#3ec9c2', train: '#ffffff', toybox: '#7fd36b' };
    const marbleParts = (k) => [
      { s: 'sphere', r: 0.55, pos: [0, 0, 0], color: '#eaf6ff', opacity: 0.55, glow: 0.3 },
      { s: 'sphere', size: [0.32, 0.18, 0.4], pos: [0.05, 0.02, 0], rot: [0, 30, 20], color: MCOL[k], glow: 0.9 },
      { s: 'sphere', size: [0.18, 0.3, 0.14], pos: [-0.12, 0, 0.1], rot: [0, -20, 0], color: MCOL[k], glow: 0.9 },
    ];
    const bobbers = [];
    const MARBLE_AT = {};
    function takeMarble(k) {
      if (marbles().includes(k)) return;
      const got = marbles().concat([k]); store.set('marbles', got);
      w.sound('gem'); w.addCoins(2);
      w.burst(MARBLE_AT[k] || w.player.pos, { color: ['#ffffff', MCOL[k]], count: 30, speed: 5, life: 0.8 });
      w.toast(got.length < 10 ? `A lost marble! ${got.length} of 10` : 'All ten marbles! Take the news to Crumb by the mouse hole.', 'item');
      objective();
    }
    const marble = (k, p) => {
      MARBLE_AT[k] = p;
      if (marbles().includes(k)) return null;
      const m = w.model({ pos: [p[0], p[1] + 0.6, p[2]], parts: marbleParts(k) });
      const z = w.zone({ pos: [p[0], p[1] + 0.6, p[2]], radius: 1.3, onEnter: () => { if (!z.enabled) return; z.enabled = false; m.group.visible = false; takeMarble(k); } });
      const b = { m, base: p[1] + 0.6 }; bobbers.push(b);
      return b;
    };
    w.on('frame', (dt, t) => { for (const b of bobbers) if (b.m.group.visible) { b.m.group.position.y = b.base + Math.sin(t * 2.2 + b.base) * 0.15; b.m.group.rotation.y = t * 0.9; } });

    // ---------- floor things: the stepping stones of the floor-is-lava run (and toys) ----------
    // a thing on the floor, centre (x, z), its top at `top`; turned to yaw; drawn by kind
    const things = [];
    function thing(kind, x, z, top, yaw = 0) {
      const t = { kind, x, z, top, yaw };
      if (kind === 'slipper') {
        w.box({ pos: [x, top / 2, z], size: [3.4, top, 7.2], yaw, color: C.pink });
        w.sphere({ pos: [x + Math.sin(yaw * D) * 2.4, top + 0.5, z + Math.cos(yaw * D) * 2.4], radius: 0.9, color: '#ffffff', ...deco });
      } else if (kind === 'car') {
        w.box({ pos: [x, top / 2 + 0.3, z], size: [2.4, top - 0.6, 4.0], yaw, color: C.red });
        w.box({ pos: [x, top / 2, z], size: [2.6, 0.6, 3.6], yaw, invisible: true });
        w.box({ pos: [x, top + 0.02, z], size: [1.9, 0.04, 1.8], yaw, color: '#bfe3ff', ...deco });
        for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          const dx = a * 1.3, dz = b * 1.3, s = Math.sin(yaw * D), c = Math.cos(yaw * D);
          w.cylinder({ pos: [x + dx * c + dz * s, 0.45, z - dx * s + dz * c], radius: 0.45, height: 0.35, color: '#2b2b33', rot: [0, yaw, 90], ...deco });
        }
      } else if (kind === 'book') {
        w.box({ pos: [x, top / 2, z], size: [5.0, top, 6.6], yaw, color: C.blue });
        w.box({ pos: [x, top / 2, z], size: [5.06, top * 0.8, 6.3], yaw, color: C.paper, ...deco });
      } else if (kind === 'block') {
        w.box({ pos: [x, top / 2, z], size: [2.0, top, 2.0], yaw, color: C.yellow });
        w.box({ pos: [x, top - 0.7, z], size: [2.04, 0.12, 2.04], yaw, color: C.red, ...deco });
      } else if (kind === 'crayons') {
        w.box({ pos: [x, top / 2, z], size: [2.8, top, 2.2], yaw, color: '#5bbf5a' });
        for (let i = 0; i < 5; i++) w.cylinder({ pos: [x - 1 + i * 0.5, top + 0.4, z], radius: 0.2, height: 1.0, color: [C.red, C.blue, C.yellow, C.purple, C.orange][i], ...deco });
      } else if (kind === 'drum') {
        w.cylinder({ pos: [x, top / 2, z], radius: 1.8, height: top, sides: 16, color: C.red });
        w.cylinder({ pos: [x, top - 0.05, z], radius: 1.82, height: 0.12, sides: 16, color: '#ffffff', ...deco });
      } else if (kind === 'shoebox') {
        w.box({ pos: [x, top / 2, z], size: [3.2, top, 4.6], yaw, color: C.cardboard });
        w.box({ pos: [x, top - 0.3, z], size: [3.3, 0.6, 4.7], yaw, color: C.cardboardDark, ...deco });
      }
      things.push(t);
      return t;
    }
    // trail 1: the slipper by the door to the drum on the rug, where the train comes by
    const along = (a, b, f, side) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [a[0] + dx * f + (dz / l) * side, a[1] + dz * f - (dx / l) * side]; };
    const yaw1 = bearing(START, DRUM_IN);
    const TRAIL1 = [
      thing('slipper', START[0], START[1], 1.2, yaw1),
      thing('car', ...along(START, DRUM_IN, 0.22, 1.5), 1.8, yaw1 + 15),
      thing('book', ...along(START, DRUM_IN, 0.42, -1.5), 0.9, yaw1 - 25),
      thing('block', ...along(START, DRUM_IN, 0.62, 1.3), 2.4, 20),
      thing('crayons', ...along(START, DRUM_IN, 0.81, -1.2), 1.5, yaw1),
      thing('drum', DRUM_IN[0], DRUM_IN[1], 1.8),
    ];
    // trail 2: from the drum on the far side of the rug, by a toy car and a shoebox, along a ruler to another shoebox
    // beside the blanket's slope
    const BOX_A = [-6, -7.5], BOX_B = [-13, -31];
    const yawR = bearing(BOX_A, BOX_B);
    const TRAIL2 = [
      thing('drum', DRUM_OUT[0], DRUM_OUT[1], 1.8),
      thing('car', -4.0, -3.1, 1.6, yawR),
      thing('shoebox', BOX_A[0], BOX_A[1], 3.0, yawR),
      thing('shoebox', BOX_B[0], BOX_B[1], 3.0, yawR),
    ];
    {
      const l = Math.hypot(BOX_B[0] - BOX_A[0], BOX_B[1] - BOX_A[1]) + 2;
      w.box({ pos: [(BOX_A[0] + BOX_B[0]) / 2, 3.075, (BOX_A[1] + BOX_B[1]) / 2], size: [0.9, 0.15, l], yaw: yawR, color: '#f4d35e' }); // a meter stick
      for (let i = 1; i < l; i += 1.5) { const f = i / l - 0.5; w.box({ pos: [(BOX_A[0] + BOX_B[0]) / 2 + Math.sin(yawR * D) * f * l, 3.16, (BOX_A[1] + BOX_B[1]) / 2 + Math.cos(yawR * D) * f * l], size: [i % 15 < 1.5 ? 0.6 : 0.3, 0.02, 0.06], yaw: yawR, color: '#3a3a44', ...deco }); }
    }
    // other floor toys (cover, and fun): a bouncy ball, a spinning top's worth of colour
    w.ball({ pos: [24, 2, 8], radius: 1.4, color: C.pink });
    w.ball({ pos: [-26, 2, 40], radius: 0.9, color: C.yellow });

    // ---------- the toy train ----------
    const trainPath = []; for (let a = 0; a < 360; a += 15) { const p = atRug(TRACK_R, a); trainPath.push([p[0], 0, p[1]]); }
    const loopLen = trainPath.reduce((s, p, i) => s + Math.hypot(p[0] - trainPath[(i + 1) % trainPath.length][0], p[2] - trainPath[(i + 1) % trainPath.length][2]), 0);
    const CAR_GAP = 5.2;
    const mkCar = (h, color, k) => {
      const part = w.cylinder({ pos: [trainPath[0][0], h / 2, trainPath[0][2]], radius: 2.0, height: h, sides: 18, color });
      return w.mover(part, { path: trainPath.map((p) => [p[0], h / 2, p[2]]), speed: TRAIN_SPEED, loop: true, offset: (k * CAR_GAP) / loopLen });
    };
    const flat2 = mkCar(1.5, C.yellow, 0), flat1 = mkCar(1.5, C.blue, 1), loco = mkCar(3.2, C.red, 2); // (engine roof 3.2: a jump from a car)
    const train = { loco, cars: [flat1, flat2] };
    const chimney = w.model({ pos: [0, 0, 0], parts: [
      { s: 'cyl', r: 0.6, h: 1.8, pos: [0, 0.9, 0.9], color: '#2b2b33' }, { s: 'cyl', r: 0.85, h: 0.35, pos: [0, 1.9, 0.9], color: '#2b2b33' },
      { s: 'cyl', r: 2.04, h: 0.4, pos: [0, -1.4, 0], color: C.yellow }, { s: 'box', size: [2.6, 1.6, 1.4], pos: [0, -0.4, -1.4], color: '#2b2b33' },
    ] });
    const smoke = w.particles({ pos: [0, 6, 0], area: [1.2, 3, 1.2], count: 10, color: '#ffffff', size: 0.5, kind: 'rise' });
    const posOf = (m) => m.body.translation();
    // the train marble rides on the engine's roof: take it by getting up there
    let trainMarble = null;
    if (!marbles().includes('train')) trainMarble = w.model({ pos: [0, 0, 0], parts: marbleParts('train') });
    w.on('tick', () => {
      if (!trainMarble || marbles().includes('train')) return;
      const t = posOf(loco), p = w.player.pos;
      if (Math.hypot(p[0] - t.x, p[1] - (t.y + 1.6 + 1.0), p[2] - t.z) < 1.7) { trainMarble.group.visible = false; takeMarble('train'); }
    });
    w.on('frame', (dt, t) => {
      const q = posOf(loco), a = Math.atan2(q.x - RUG[0], q.z - RUG[1]);
      chimney.group.position.set(q.x, q.y + 1.6, q.z); chimney.group.rotation.y = a + Math.PI / 2;
      if (smoke.points) smoke.points.position.set(q.x, 0, q.z);           // (the puffs are made round (0, 6, 0))
      if (trainMarble && trainMarble.group.visible) trainMarble.group.position.set(q.x, q.y + 1.6 + 0.7 + Math.sin(t * 3) * 0.1, q.z);
    });
    marble('bed', [-56, 0, -50]);

    // ---------- the bed (head in the north-west corner), the blanket's slope, the cat ----------
    for (const [x, z] of [[-59, -74], [-34, -74], [-59, -19], [-34, -19]]) slab(x - 1, x + 1, 0, 6, z - 1, z + 1, { color: C.woodDark });
    for (const [z0, z1] of [[-75, -46.5], [-46.5, -18]]) {
      slab(-60, -33, 6, 9, z0, z1, { color: C.wood });                        // the frame
      slab(-59.75, -33.25, 9, 15, Math.max(z0, -74.75), Math.min(z1, -18.25), { color: C.mattress }); // the mattress, top at 15
    }
    slab(-60, -33, 0, 30, -75, -73.5, { color: C.wood });                     // the headboard
    slab(-59.5, -33.2, 15, 15.4, -52, -18.2, { color: C.blanket });            // the blanket, top at 15.4
    for (let z = -50; z < -19; z += 4) w.box({ pos: [-46.4, 15.41, z], size: [26.3, 0.02, 1.2], color: C.blanket2, ...deco });
    slab(-57, -34, 15, 16.6, -72, -63, { color: C.pillow });                   // the pillow, top at 16.6
    // the blanket slid off the bed: a slope from the floor (x -15) up to the bed's edge (x -33, at 15.4)
    const BLANKET = { x0: -15, x1: -33, z0: -38, z1: -26, top: 15.4 };
    w.ramp({ pos: [-24, 7.7, -32], size: [12, 15.4, 18], yaw: -90, color: C.blanket });
    for (let i = 0; i < 5; i++) w.box({ pos: [-16.5 - i * 3.6, 0.9 + i * 3.08, -32], size: [0.9, 0.03, 12.04], rot: [0, 0, 40.6], color: C.blanket2, ...deco });
    // under the bed: dark, dusty, and a marble
    const bunnies = [
      w.enemy({ kind: 'slime', pos: [-52, 0, -66], patrol: [[-55, -68], [-40, -66]], leash: 16, respawn: 40, drops: 1, color: C.dust, scale: 1.1 }),
      w.enemy({ kind: 'slime', pos: [-45, 0, -45], patrol: [[-52, -50], [-38, -40]], leash: 16, respawn: 40, drops: 1, color: C.dust, scale: 1.0 }),
      w.enemy({ kind: 'slime', pos: [-50, 0, -27], patrol: [[-56, -30], [-41, -24]], leash: 16, respawn: 40, drops: 1, color: C.dust, scale: 1.2 }),
    ];
    // the cat, asleep at the foot of the bed (on the blanket); its head turns when it is awake
    const catS = { awake: false, look: 140, swatT: -9, swats: 0 };
    w.box({ pos: [CAT[0], CAT[1] + 3, CAT[2]], size: [10, 6, 12], invisible: true });
    const catBody = w.model({ pos: CAT, parts: [
      { s: 'sphere', size: [5.2, 3.2, 6.4], pos: [0, 3.0, 0], color: C.cat },
      ...[-3, -1, 1, 3].map((z) => ({ s: 'box', size: [10.1, 0.5, 0.8], pos: [0, 4.2, z], rot: [0, 0, 0], color: C.catDark })),
      { s: 'torus', r: 4.4, tube: 0.9, rot: [90, 0, 0], pos: [0, 0.9, 0.6], color: C.cat },
      { s: 'sphere', r: 1.0, pos: [4.0, 0.9, 3.0], color: C.catLight }, { s: 'sphere', r: 1.0, pos: [3.4, 0.9, -3.4], color: C.catLight },
    ] });
    const catHead = w.model({ pos: [CAT[0] + 3.2, CAT[1] + 4.6, CAT[2] - 3.0], parts: [
      { s: 'sphere', size: [2.6, 2.3, 2.4], pos: [0, 0, 0.8], color: C.cat },
      { s: 'cone', r: 0.8, h: 1.6, pos: [-1.3, 2.0, 0.6], rot: [0, 0, 15], color: C.cat }, { s: 'cone', r: 0.8, h: 1.6, pos: [1.3, 2.0, 0.6], rot: [0, 0, -15], color: C.cat },
      { s: 'sphere', size: [1.1, 0.8, 0.6], pos: [0, -0.5, 2.9], color: C.catLight }, { s: 'sphere', r: 0.22, pos: [0, -0.2, 3.25], color: '#e88a8a' },
      { s: 'box', size: [0.9, 0.14, 0.1], pos: [-0.9, 0.35, 3.0], color: '#3a2a20', name: 'shut' }, { s: 'box', size: [0.9, 0.14, 0.1], pos: [0.9, 0.35, 3.0], color: '#3a2a20', name: 'shut' },
      { s: 'sphere', size: [0.42, 0.55, 0.2], pos: [-0.9, 0.35, 3.0], color: '#7ee07a', glow: 1.2, name: 'open' }, { s: 'sphere', size: [0.42, 0.55, 0.2], pos: [0.9, 0.35, 3.0], color: '#7ee07a', glow: 1.2, name: 'open' },
    ] });
    const zzz = w.label({ pos: [CAT[0] + 3, CAT[1] + 10, CAT[2] - 3], text: 'z z z', size: 0.9 });
    w.on('tick', () => {
      const k = w.ticks % ((SLEEP_T + AWAKE_T) * 60), awake = k >= SLEEP_T * 60;
      if (awake !== catS.awake) { catS.awake = awake; if (awake) w.sound('open'); }
      if (!awake) { catS.look = 140; return; }
      const u = (k - SLEEP_T * 60) / (AWAKE_T * 60);
      catS.look = 140 + 70 * Math.sin(u * Math.PI * 2);
      // what it sees: a small one on the bed, near enough, inside its gaze
      const p = w.player.pos;
      if (p[1] < 14.9 + 0.93 - 0.4 || p[0] < -60 || p[0] > -33 || p[2] < -75 || p[2] > -18 || w.time < catS.swatT) return;
      const hx = CAT[0] + 3.2, hz = CAT[2] - 3.0, dx = p[0] - hx, dz = p[2] - hz;
      if (Math.hypot(dx, dz) > CAT_SEE) return;
      let a = Math.atan2(dx, dz) / D - catS.look; while (a > 180) a -= 360; while (a < -180) a += 360;
      if (Math.abs(a) > CAT_CONE) return;
      catS.swatT = w.time + 1.5; catS.swats++;
      w.sound('boost'); w.toast('Mrrrp! The cat bats you off the bed.');
      w.player.launch(10, 15, 0);
    });
    w.on('frame', (dt, t) => {
      catHead.group.rotation.y = catS.look * D;
      for (const m of catHead.group.children) { if (m.name === 'shut') m.visible = !catS.awake; if (m.name === 'open') m.visible = catS.awake; }
      catBody.group.scale.y = catS.awake ? 1 : 1 + Math.sin(t * 1.6) * 0.025;
      if (zzz && zzz.position) { zzz.visible = !catS.awake; zzz.position.y = CAT[1] + 10 + Math.sin(t * 1.2) * 0.4; }
    });
    marble('pillow', [-50, 16.6, -67]);

    // ---------- the nightstand, and books up to the desk ----------
    slab(-32, -19, 0, 18, -75, -62, { color: C.woodLight });
    w.box({ pos: [-25.5, 9, -61.95], size: [11, 6, 0.1], color: C.wood, ...deco }); w.sphere({ pos: [-25.5, 9, -61.8], radius: 0.6, color: '#d9b45a', ...deco });
    const NIGHT_BOOKS = [
      slab(-29, -20, 18, 19.2, -74, -66, { color: C.red }) && [-24.5, 19.2, -70],
      slab(-27, -20.5, 19.2, 20.4, -73.5, -66.5, { color: C.green }) && [-23.75, 20.4, -70],
      slab(-25, -20.5, 20.4, 21.6, -73, -67, { color: C.purple }) && [-22.75, 21.6, -70],
    ];
    // the alarm clock
    w.cylinder({ pos: [-24, 21, -63.8], radius: 3, height: 1.4, rot: [90, 0, 0], sides: 24, color: C.blue });
    w.cylinder({ pos: [-24, 21, -63.05], radius: 2.5, height: 0.1, rot: [90, 0, 0], sides: 24, color: '#ffffff', ...deco });
    for (const [a, l] of [[60, 1.8], [190, 1.3]]) w.box({ pos: [-24 + Math.sin(a * D) * l / 2, 21 + Math.cos(a * D) * l / 2, -62.95], size: [0.18, l, 0.05], rot: [0, 0, -a], color: '#2b2b33', ...deco });
    for (const s of [-1, 1]) w.sphere({ pos: [-24 + s * 2, 24.2, -63.8], radius: 0.9, color: '#d9b45a', metal: 0.5, ...deco });
    marble('nightstand', [-29.6, 18, -64]);

    // ---------- the desk under the window, the chair, the drawer ----------
    slab(-18, 18, 21.3, 22.5, -70.5, -52.5, { color: C.woodLight });          // top at 22.5
    for (const [x, z] of [[-17.2, -69.7], [17.2, -69.7], [-17.2, -53.3], [17.2, -53.3]]) slab(x - 0.8, x + 0.8, 0, 21.3, z - 0.8, z + 0.8, { color: C.wood });
    // books stacked at the back of the desk: stairs to the sill
    const DESK_BOOKS = [
      slab(-15, -5, 22.5, 24, -70.4, -62, { color: C.orange }) && [-10, 24, -66.2],
      slab(-14, -8, 24, 25.5, -70.4, -64.5, { color: C.blue }) && [-11, 25.5, -67.45],
      slab(-13, -9.5, 25.5, 27, -70.4, -66.5, { color: C.yellow }) && [-11.25, 27, -68.45],
    ];
    // the pencil cup (its walls a ring), a book to climb into it, an eraser to climb out
    const CUP = [6, -63];
    for (let i = 0; i < 12; i++) { const a = i * 30; w.box({ pos: [CUP[0] + Math.sin(a * D) * 1.6, 23.7, CUP[1] + Math.cos(a * D) * 1.6], size: [0.86, 2.4, 0.3], yaw: a, color: C.red }); }
    w.cylinder({ pos: [CUP[0], 22.65, CUP[1]], radius: 1.7, height: 0.3, sides: 12, color: C.red });
    for (const [dx, dz, c] of [[0.6, 0.5, C.yellow], [-0.5, 0.7, C.green], [0.2, -0.8, C.blue]]) w.cylinder({ pos: [CUP[0] + dx, 26.3, CUP[1] + dz], radius: 0.22, height: 7.2, rot: [dx * 6, 0, dz * 6], color: c, ...deco });
    const CUP_STEP = slab(1.5, 4.0, 22.5, 23.7, -65, -61, { color: C.green }) && [2.75, 23.7, -63];
    const ERASER = slab(6.2, 7.0, 22.8, 23.4, -63.5, -62.5, { color: C.pink }) && [6.6, 23.4, -63];
    marble('cup', [5.4, 22.8, -63.4]);
    // the lamp, lighting the desk
    w.cylinder({ pos: [14, 22.8, -67], radius: 2.2, height: 0.6, sides: 18, color: '#3d6fb6' });
    w.box({ pos: [12.2, 30.5, -65], size: [0.6, 16, 0.6], rot: [0, 45, 16], color: '#3d6fb6', ...deco });
    w.cone({ pos: [9.5, 37.5, -62.5], radius: 3.2, height: 4, sides: 18, color: '#3d6fb6', ...deco });
    w.light({ pos: [9, 34, -62], color: '#fff1c9', intensity: 24, distance: 34 });
    // the paper to fold into a plane, and the globe
    w.box({ pos: [-2, 22.53, -57.5], size: [6.3, 0.06, 8.9], yaw: 12, color: C.paper, ...deco });
    for (const [dx, dz, c, s] of [[-1, -1, C.blue, 1.6], [1, 1.5, C.yellow, 1.2], [0.5, -2.5, C.green, 0.9]]) w.cylinder({ pos: [-2 + dx, 22.57, -57.5 + dz], radius: s, height: 0.02, color: c, ...deco });
    const PAPER = [-2, 22.5, -57.5];
    const fold = w.interact({ pos: [PAPER[0], 23.2, PAPER[2]], radius: 3.4, label: 'Fold a paper plane', onUse: () => foldPlane() });
    w.cylinder({ pos: [12, 23.0, -57], radius: 1.6, height: 1.0, color: C.woodDark });
    w.sphere({ pos: [12, 27.4, -57], radius: 3.4, color: '#4f8fd8', collide: false });
    for (const [dx, dy, dz, s] of [[1.6, 1.2, 2.6, 1.3], [-2.2, -0.4, 2.2, 1.1], [0.3, 2.4, -2.2, 1.2]]) w.sphere({ pos: [12 + dx, 27.4 + dy, -57 + dz], radius: s, color: '#7cc46a', low: true, ...deco });
    slab(9.4, 14.6, 23.5, 31.4, -59.6, -54.4, { invisible: true });
    // the chair: a slinky on the floor throws you onto its seat, the whoopee cushion there onto the desk
    slab(-6, 6, 12.3, 13.5, -48, -36, { color: C.red });                      // the seat, top at 13.5
    for (const [x, z] of [[-5.4, -47.4], [5.4, -47.4], [-5.4, -36.6], [5.4, -36.6]]) slab(x - 0.6, x + 0.6, 0, 12.3, z - 0.6, z + 0.6, { color: C.red });
    for (const x of [-5.4, 5.4]) slab(x - 0.6, x + 0.6, 13.5, 30, -37.2, -36, { color: C.red });
    slab(-6, 6, 27, 30, -37.2, -36, { color: C.red });
    const SLINKY = [11, 0, -42], CUSHION = [-1, 13.5, -45];
    const spring = (p, power, push, look, sound) => {
      const m = w.model({ pos: p, parts: look });
      let cool = 0;
      w.zone({ pos: [p[0], p[1] + 0.9, p[2]], size: [2.6, 1.6, 2.6], onStay: () => {
        if (cool > w.time || w.player.vel[1] > 2) return;
        cool = w.time + 0.4;
        w.player.launch(power, push[0], push[2]); w.sound(sound);
        w.burst([p[0], p[1] + 0.8, p[2]], { color: ['#ffffff', '#ffd166'], count: 12, speed: 4, life: 0.5 });
        bounceT.set(m, w.time);
      } });
      return m;
    };
    const bounceT = new Map();
    spring(SLINKY, 31, [-4.2, 0, 0], [...Array(7)].map((_, i) => ({ s: 'torus', r: 1.15, tube: 0.13, rot: [90, 0, 0], pos: [0, 0.2 + i * 0.22, 0], color: '#c9ccd6', metal: 0.7 })), 'pad');
    spring(CUSHION, 25, [0, 0, -10], [{ s: 'sphere', size: [1.6, 0.55, 1.3], pos: [0, 0.4, 0], color: C.pink }, { s: 'cyl', r: 0.3, h: 0.7, pos: [0, 0.4, -1.5], rot: [90, 0, 0], color: C.pink }], 'boost');
    w.on('frame', (dt, t) => { for (const [m, t0] of bounceT) { const k = Math.max(0, 1 - (w.time - t0) * 3); m.group.scale.y = 1 + Math.sin(k * 12) * 0.35 * k; } });
    // the drawer, pulled open under the desk's right side (a pencil box inside to climb out on)
    slab(6, 16, 12, 12.5, -58, -48, { color: C.woodLight });                  // its floor, at 12.5
    slab(6, 6.5, 12.5, 14.5, -58, -48, { color: C.woodLight }); slab(15.5, 16, 12.5, 14.5, -58, -48, { color: C.woodLight }); // (sides 2 m: a hop
    slab(6.5, 15.5, 12.5, 14.5, -48.5, -48, { color: C.woodLight }); slab(6.5, 15.5, 12.5, 14.5, -58, -57.5, { color: C.woodLight }); // in from the seat)
    w.sphere({ pos: [11, 13.8, -47.6], radius: 0.5, color: '#d9b45a', ...deco });
    const PENCIL_BOX = slab(6.5, 9, 12.5, 13.5, -50.5, -48.5, { color: C.blue }) && [7.75, 13.5, -49.5]; // (by the seat: out in two hops)
    marble('drawer', [12, 12.5, -53.5]);

    // ---------- the window sill: the finish of the floor-is-lava run ----------
    w.cylinder({ pos: [-16, 28.2, -72.75], radius: 1.8, height: 2.4, sides: 14, color: '#d97b4f' });
    for (let i = 0; i < 7; i++) w.box({ pos: [-16 + Math.sin(i * 51 * D) * 1.4, 31.2, -72.75 + Math.cos(i * 51 * D) * 1.4], size: [0.4, 4.2, 1.2], rot: [Math.cos(i * 51 * D) * 30, i * 51, Math.sin(i * 51 * D) * -30], color: C.leaf, ...deco });
    w.cylinder({ pos: [14, 30.2, -72.75], radius: 2.6, height: 6.4, sides: 18, color: '#d7f0ff', opacity: 0.3, glow: 0.1 }); // the goldfish bowl
    w.cylinder({ pos: [14, 29.6, -72.75], radius: 2.4, height: 5, sides: 18, color: '#5fb3e6', opacity: 0.35, ...deco });
    const fish = w.model({ pos: [14, 30, -72.75], parts: [{ s: 'sphere', size: [0.7, 0.45, 0.35], pos: [0, 0, 0], color: '#ff8a3d', glow: 0.3 }, { s: 'cone', r: 0.35, h: 0.6, pos: [-0.85, 0, 0], rot: [0, 0, 90], color: '#ff8a3d' }] });
    w.on('frame', (dt, t) => { fish.group.position.set(14 + Math.cos(t * 0.8) * 1.4, 30 + Math.sin(t * 1.7) * 0.4, -72.75 + Math.sin(t * 0.8) * 1.0); fish.group.rotation.y = -t * 0.8 + Math.PI / 2; });
    w.model({ pos: [-7, 27, -73.6], parts: [{ s: 'cyl', r: 0.12, h: 4.4, pos: [0, 2.2, 0], color: '#2b2b33' }, { s: 'box', size: [0.06, 1.4, 2.2], pos: [0, 3.6, 1.1], color: C.red, glow: 0.4 }] });
    marble('sill', [4, 27, -72.6]);

    // ---------- the east wall: the bookshelf, the wardrobe, the warm-air vent ----------
    slab(51, 60, 0, 52, -60, -59, { color: C.wood }); slab(51, 60, 0, 52, -31, -30, { color: C.wood }); slab(59, 60, 0, 52, -59, -31, { color: C.woodDark });
    slab(51, 60, 51, 52, -60, -30, { color: C.wood });                         // its top, at 52
    for (const y of [1.2, 12, 22, 32, 42]) slab(51, 59, y - 1, y, -59, -31, { color: C.wood });
    {
      const bookCols = [C.red, C.blue, C.yellow, C.green, C.purple, C.orange, C.pink, '#3ec9c2'];
      let k = 0;
      for (const y of [1.2, 12, 22, 32, 42]) {
        let z = -58.5;
        while (z < -32) { const t = 0.9 + ((k * 7) % 5) * 0.25, h = 6 + ((k * 3) % 4) * 0.9; slab(53, 58.6, y, y + h, z, z + t, { color: bookCols[k % bookCols.length] }); z += t + 0.08; k++; }
      }
    }
    w.model({ pos: [55.5, 52, -36], parts: [{ s: 'cone', r: 1.1, h: 5.5, pos: [0, 4.3, 0], color: '#f4f4f8' }, { s: 'cyl', r: 1.1, h: 3, pos: [0, 1.5, 0], color: C.red }, { s: 'cone', r: 1.4, h: 1.6, pos: [0, 0.8, 0], color: C.blue }] });
    marble('shelf', [55.5, 52, -45]);
    slab(42, 60, 0, 60, -10, 20, { color: C.paint });                         // the wardrobe, top at 60
    w.box({ pos: [41.95, 31, 5], size: [0.1, 56, 0.4], color: C.paintDark, ...deco });
    for (const z of [-2.5, 12.5]) for (const [y, h] of [[17, 26], [46, 22]]) w.box({ pos: [41.93, y, z], size: [0.12, h, 11], color: C.paintDark, ...deco }) && w.box({ pos: [41.9, y, z], size: [0.12, h - 1.6, 9.4], color: C.paint, ...deco });
    w.box({ pos: [51, 59.4, 5], size: [19, 1.2, 31], color: C.paintDark, ...deco });             // the cornice
    for (const z of [3, 7]) w.sphere({ pos: [41.7, 30, z], radius: 0.7, color: '#d9b45a', metal: 0.5, ...deco });
    // a shoebox of drawings on top of the wardrobe: whoever lived here drew the worlds before there were any
    slab(46, 53, 60, 60.4, -4, 6, { color: C.cardboard });
    for (const [x0, x1, z0, z1] of [[46, 46.4, -4, 6], [52.6, 53, -4, 6], [46, 53, -4, -3.6], [46, 53, 5.6, 6]]) slab(x0, x1, 60.4, 61.4, z0, z1, { color: C.cardboard }); // (1.4 m above the wardrobe: a hop in, a hop out)
    for (const [z, c] of [[-1.5, C.blue], [1, C.green], [3.5, C.pink]]) w.box({ pos: [50.5, 61.1, z], size: [3.6, 1.4, 0.08], rot: [-24, 0, 0], color: C.paper, ...deco }) && w.box({ pos: [50.5, 61.15, z + 0.06], size: [2, 0.7, 0.02], rot: [-24, 0, 0], color: c, ...deco });
    marble('wardrobe', [56, 60, 12]);
    // the vent: warm air rising, strong enough to carry a paper plane up past the wardrobe's top
    for (let i = 0; i < 7; i++) w.box({ pos: [VENT[0], 0.03, VENT[1] - 4.2 + i * 1.4], size: [8, 0.06, 0.5], color: '#8d8f99', metal: 0.4, ...deco });
    w.box({ pos: [VENT[0], 0.02, VENT[1]], size: [8.6, 0.04, 10.6], color: '#5d5f69', ...deco });
    const vent = w.wind({ pos: [VENT[0], 35, VENT[1]], size: [8, 70, 10], force: [0, 30, 0] });
    w.particles({ pos: [VENT[0], 30, VENT[1]], area: [6, 56, 8], count: 50, color: '#fff2dc', size: 0.4, kind: 'rise' });

    // ---------- the toy box (south-west), a stair of blocks up to its rim, a jack-in-the-box inside ----------
    const TB = { x0: -50, x1: -26, z0: 61, z1: 75, top: 12 };
    slab(-50, -26, 0, 0.6, 61, 75, { color: C.green });
    slab(-26.8, -26, 0.6, 12, 61, 75, { color: C.green }); slab(-50, -49.2, 0.6, 12, 61, 75, { color: C.green }); slab(-49.2, -26.8, 0.6, 12, 61, 61.8, { color: C.green });
    w.box({ pos: [-38, 19, 74.4], size: [24, 14, 0.8], color: '#3f9a7a', ...deco });          // the lid, open against the wall
    for (const [x, y] of [[-44, 6], [-32, 6]]) w.box({ pos: [x, y, 61.0], size: [5, 5, 0.06], color: C.yellow, ...deco });
    const BLOCKS = [];
    for (let i = 0; i < 8; i++) {
      const x1 = -14 - 1.5 * i, h = 1.5 * (i + 1);
      slab(x1 - 1.5, x1, 0, h, 64, 70, { color: [C.red, C.blue, C.yellow, C.green][i % 4] });
      for (let y = 1.5; y < h - 0.1; y += 1.5) w.box({ pos: [x1 - 0.75, y, 67], size: [1.54, 0.08, 6.04], color: '#ffffff', ...deco });
      BLOCKS.push([x1 - 0.75, h, 67]);
    }
    w.model({ pos: [-44, 0.6, 70], parts: [ // a teddy, flopped in the corner
      { s: 'sphere', size: [2.6, 3.0, 2.2], pos: [0, 2.8, 0], color: '#b07a4f' }, { s: 'sphere', r: 1.9, pos: [0, 6.4, 0.2], color: '#b07a4f' },
      { s: 'sphere', r: 0.7, pos: [-1.4, 7.9, 0.2], color: '#b07a4f' }, { s: 'sphere', r: 0.7, pos: [1.4, 7.9, 0.2], color: '#b07a4f' },
      { s: 'sphere', size: [0.8, 0.6, 0.4], pos: [0, 6.0, 1.9], color: '#e8c9a8' }, { s: 'sphere', r: 0.2, pos: [-0.6, 6.8, 1.85], color: '#2b2b33' }, { s: 'sphere', r: 0.2, pos: [0.6, 6.8, 1.85], color: '#2b2b33' },
    ] });
    w.box({ pos: [-44, 4.2, 70], size: [5.2, 8.4, 4.4], invisible: true });
    const JACK = [-30.5, 0.6, 65];
    slab(JACK[0] - 1.3, JACK[0] + 1.3, 0.6, 3.2, JACK[2] - 1.3, JACK[2] + 1.3, { color: C.purple });
    const jackHead = w.model({ pos: [JACK[0], 3.2, JACK[2]], parts: [{ s: 'sphere', r: 0.9, pos: [0, 1.1, 0], color: '#ffe0c2' }, { s: 'cone', r: 0.9, h: 1.4, pos: [0, 2.4, 0], color: C.red }, { s: 'sphere', r: 0.25, pos: [0, 3.2, 0], color: C.yellow }] });
    let jackT = -9;
    w.zone({ pos: [JACK[0], 1.6, JACK[2]], size: [4.0, 2.0, 4.0], onStay: () => {
      if (jackT + 0.6 > w.time || w.player.vel[1] > 2) return;
      jackT = w.time; w.sound('boost'); w.player.launch(28, 9.5, 0); // (up, and out over the east side)
    } });
    w.on('frame', () => { const k = Math.max(0, 1 - (w.time - jackT) * 1.2); jackHead.group.position.y = 3.2 + k * 4; });
    marble('toybox', [-34, 0.6, 70]);

    // ---------- Crumb's mouse hole, in the west wall's skirting board ----------
    w.box({ pos: [-59.32, 1.3, 33], size: [0.1, 2.6, 3.2], color: '#2a1d16', ...deco });       // (in front of the skirting board)
    w.cylinder({ pos: [-59.32, 2.6, 33], radius: 1.6, height: 0.1, rot: [0, 0, 90], sides: 16, color: '#2a1d16', ...deco });
    w.box({ pos: [-58.8, 0.1, 33], size: [2.2, 0.2, 3.2], color: '#e8685a', ...deco }); // a doormat
    const crumb = w.npc({ pos: [-56, 0, 33], yaw: 90, name: 'Crumb', look: LOOKS.crumb, onTalk: () => talkCrumb() });
    w.sign({ pos: [-55, 0, 38.5], yaw: 120, title: 'Crumb', width: 2.4, text: 'Mouse.\nKnocks welcome.', bg: '#4a3526', border: '#e8685a' });

    // ---------- drawings on the walls, in crayon: worlds, drawn before there were any ----------
    const drawing = (x, y, z, yaw, caption, blobs) => {
      w.box({ pos: [x, y, z], size: [8.4, 6, 0.12], yaw, color: C.paper, ...deco });
      const s = Math.sin(yaw * D), c = Math.cos(yaw * D);
      // (each crayon mark 5 cm in front of the last: marks at one depth flicker into each other from afar)
      blobs.forEach(([dx, dy, r, col], i) => { const k = 0.12 + i * 0.05; w.cylinder({ pos: [x + dx * c + s * k, y + dy, z - dx * s + c * k], radius: r, height: 0.04, rot: [90, yaw, 0], color: col, ...deco }); });
      w.label({ pos: [x + s * 0.4, y + 3.7, z + c * 0.4], text: caption, size: 0.5 });             // (above it: the door's shelf hides what is under)
    };
    drawing(-36, 26, 74.8, 180, 'MY CLOUD GARDEN', [[-2, 1, 1.3, '#9fd4ff'], [0.5, 1.4, 1.6, '#ffffff'], [2.4, 0.6, 1.1, '#9fd4ff'], [0, -1.6, 1.0, C.green]]);
    drawing(-12, 26, 74.8, 180, 'THE GLOW CAVE', [[0, 0, 2.2, '#3a3f6b'], [-1, 0.6, 0.35, '#8ff7ff'], [0.8, -0.4, 0.3, '#ff9ff5'], [0.2, 1.2, 0.25, '#ffe58f']]);
    drawing(-59.8, 30, 10, 90, 'FASTEST TRACK EVER', [[0, 0, 2.3, '#2b2b33'], [0, 0, 1.6, '#ffffff'], [1.6, 1.0, 0.4, C.red]]);
    drawing(-59.8, 30, -4, 90, 'A DOOR TO EVERYWHERE', [[0, 0.2, 2.0, '#9d7bff'], [0, 0.2, 1.3, '#1a1440'], [0, -2.2, 0.5, C.yellow]]);

    // ---------- Season 1 of the Founder's hunt (GAME.md): Before the Door ----------
    // Echo VI waits in the shoebox of drawings on the wardrobe. Echo X is the crayon door on the west wall, high up: a
    // shelf under it to land on, from a glide all the way across the room. It wakes once Echoes VI to IX are found, and
    // the last of the five gives the Paper Crown (both defined by Junction)
    const s1 = () => !!w.flag('s1.started');
    const S1 = ['6', '7', '8', '9', '10'];
    const s1Count = () => S1.filter((k) => w.has('echo-' + k)).length;
    const echo6 = w.echo({ id: '6', pos: [48.8, 61.3, 2.4], hidden: !s1(),
      line: 'I drew doors on my bedroom wall. They painted over them. I drew them again, smaller, where only the dust could see.',
      next: 'Echo VII: "The first story I loved was an island that fed strangers before it asked their names. I sat where its smoke goes up." The Stranger\'s Hearth, Thyra.' });
    const DOOR = [-59.8, 30, -4];
    slab(-60, -55, 26.4, 27, -9, 1, { color: C.woodLight });                                   // the shelf, top at 27
    for (const [dz, c] of [[-4.2, C.red], [4.2, C.blue]]) w.box({ pos: [-58.6, 27.8, -4 + dz], size: [1.6, 1.6, 1.6], color: c }); // (either side of the door)
    const doorGlow = w.box({ pos: [DOOR[0] + 0.14, DOOR[1] + 0.2, DOOR[2]], size: [0.04, 4.2, 2.6], color: '#ffe9a8', glow: 2.2, opacity: 0.85, ...deco });
    doorGlow.hide();
    const needX = () => s1() && ['6', '7', '8', '9'].every((k) => w.has('echo-' + k));
    const echo10 = w.echo({ id: '10', pos: [-57.8, 28.9, -4], hidden: !needX(),
      line: 'Every world here is a door I drew. I left them all open, for you.' });
    if (w.has('paper-crown')) doorGlow.show();
    w.on('echo', (id) => {
      if (id === '6' && needX()) echo10.reveal();
      if (id !== '10' || s1Count() < 5 || w.has('paper-crown')) return;
      w.setFlag('s1.complete', true);
      w.after(4.8, () => {
        w.give('paper-crown'); w.sound('win'); doorGlow.show();
        w.burst([DOOR[0] + 1, DOOR[1], DOOR[2]], { color: ['#ffe9a8', '#ffb36b', '#ffffff', '#9fe7ff'], count: 120, speed: 8, life: 1.6 });
        w.banner('SEASON 1 COMPLETE', 'Before the Door: all five Echoes. The crayon door glows.');
      });
    });

    // ---------- coins (lost buttons) along the ways up ----------
    for (const p of [[29.7, 3.2, 57.7], [24.8, 3.8, 49.4], [-6, 4.4, -7.5], [-9.5, 4.6, -19.3], [-24, 9.5, -32], [-40, 16.6, -40], [-30.5, 19.4, -70],
      [-20, 1.2, 60], [-18.5, 6.5, 67], [0, 15, -40], [-6.5, 25.2, -63], [0, 28.4, -72.6], [-48, 1.2, -60], [36, 2, 30], [12, 1.2, 46], [-40, 1.2, 50]]) w.coin({ pos: p });

    // ---------- the paper plane (a loan, like everything here: it stays in the room) ----------
    function lendPlane() {
      if (!w.has('uf-paper-plane')) w.give('uf-paper-plane', { silent: true });
      const eq = w.equipment();
      if (eq.back !== 'uf-paper-plane') { if (eq.back && !store.get('prevBack', null)) store.set('prevBack', eq.back); w.equip('uf-paper-plane'); }
    }
    async function foldPlane() {
      if (has('uf.plane')) { lendPlane(); return say('', '(Your paper plane. Hold Space in the air to glide; the warm air over the vent by the wardrobe goes a long way up.)'); }
      w.setFlag('uf.plane', true); lendPlane(); w.sound('pickup');
      await say('', ['(A crayon drawing of a plane with a face. You fold it along the creases someone already made.)', 'Paper Plane. Hold Space in the air to glide. The warm air over the vent by the wardrobe goes a long way up.']);
      objective();
    }

    // ---------- the floor is lava: from the slipper by the door to the window sill, against the clock ----------
    const L = { on: false, count: 0, runs: 0 };
    const lava = w.box({ pos: [0, 0.36, 0], size: [120, 0.05, 150], color: C.lava, glow: 1.6, ...deco }); // (over the rug and its track)
    lava.hide();
    w.sign({ pos: [START[0] + 5.5, 0, START[1] - 6], yaw: -22, title: 'THE FLOOR IS LAVA', width: 3.4,
      text: 'From this slipper to the window sill\nwithout touching the floor.\nF on the slipper to start.', bg: '#5a2a1a', border: '#ff7a3d' });
    const starter = w.interact({ pos: [START[0], 1.2, START[1]], radius: 3.2, label: 'The floor is lava: start', onUse: () => startLava() });
    function startLava() {
      if (L.on || L.count) return;
      const p = w.player.pos;
      if (Math.hypot(p[0] - START[0], p[2] - START[1]) > 4 || p[1] < 1.6) return w.toast('Stand on the slipper to start.');
      L.count = 3; starter.enabled = false; w.sound('countdown'); w.banner('3', 'The floor is lava...');
      w.after(1, () => { if (L.count) { L.count = 2; w.sound('countdown'); w.banner('2', 'The floor is lava...'); } });
      w.after(2, () => { if (L.count) { L.count = 1; w.sound('countdown'); w.banner('1', 'The floor is lava...'); } });
      w.after(3, () => {
        if (!L.count) return;
        L.count = 0; L.on = true; L.runs++; lava.show(); w.timer.start(); w.sound('go');
        w.banner('THE FLOOR IS LAVA!', 'To the window sill. Don\'t touch the floor.'); objective();
      });
    }
    function lavaOff() { L.on = false; L.count = 0; lava.hide(); starter.enabled = true; }
    function lavaFail() {
      lavaOff(); w.timer.cancel(); w.sound('lose');
      w.toast('LAVA! Back to the slipper.'); w.player.setPos([START[0], 2.2, START[1]], 180); objective();
    }
    function lavaDone() {
      const t = w.timer.stop(); lavaOff();
      const prev = store.get('lavaBest', null);
      if (prev == null || t < prev) store.set('lavaBest', t);
      const counted = w.record('lava', t, { better: 'lower' });
      w.sound('win');
      w.banner(`Safe! ${w.fmtTime(t)}`, prev != null && t < prev ? 'a new best' : prev != null ? `best ${w.fmtTime(prev)}` : counted ? 'door to window sill, and not a toe on the floor' : '');
      if (!has('title.uf.lava')) { w.setFlag('title.uf.lava', true); w.toast('Title earned: Lava Walker', 'item'); }
      objective();
    }
    w.zone({ pos: [0, 28.6, -72.75], size: [40, 3.2, 4.5], onEnter: () => { if (L.on) lavaDone(); } });
    w.on('tick', () => {
      if (!L.on) return;
      const p = w.player.pos;
      if (w.player.grounded && p[1] < 1.38) lavaFail();             // (on the floor or the rug: the lowest toy is 0.9 m)
    });
    w.on('respawn', () => { if (L.on || L.count) { lavaOff(); w.timer.cancel(); objective(); } });

    // ---------- Crumb ----------
    async function talkCrumb() {
      crumb.face('player');
      const n = marbles().length;
      if (!has('uf.met')) {
        w.setFlag('uf.met', true);
        await say('Crumb', ['Oh! Another small one. Hello! Mind your feet: the floor is lava.',
          '(It isn\'t, really. It\'s a game. The Small Big One who lived here played it every day: from the door to the window sill, and never a toe on the floor.)',
          'They had ten marbles. Every one of them rolled off somewhere in here, and I know where. But I\'m a mouse. Marbles go up; mice go along.',
          'Find all ten for me? I\'ve been keeping something for whoever does.']);
        objective(); return;
      }
      if (n >= 10 && !has('uf.marbles')) {
        w.setFlag('uf.marbles', true); w.give('uf-thimble'); w.sound('win');
        w.burst([-56, 2, 33], { color: ['#ffffff', '#c9ccd6', '#ffd166'], count: 50, speed: 6, life: 1.2 });
        await say('Crumb', ['All ten! I can hear them clicking in your pockets.',
          'Here. The Small Big One wore this as a helmet once. On their finger. It was a very small war.',
          'They left a long time ago, you know. They said they were going to build a door to everywhere. I think they did.']);
        objective(); return;
      }
      if (has('uf.marbles')) return say('Crumb', 'The marbles are back in their jar. Sometimes I roll one across the floor, for old times\' sake. The floor is still lava.');
      const hint = nextMarbleHint();
      return say('Crumb', [`${n} of 10. ${n === 0 ? 'Every journey starts with one marble.' : n < 5 ? 'Keep going!' : 'More than half! My whiskers are tingling.'}`, hint]);
    }
    const HINTS = {
      bed: 'One went under the bed. It\'s dark under there, and the dust bunnies bite. Not hard, but they do.',
      pillow: 'One is on the pillow, at the top of the bed. The blanket slid off the side: walk up it. Mind the cat. It sleeps, then it doesn\'t.',
      nightstand: 'One is on the nightstand, by the clock. From the pillow it\'s a hop.',
      cup: 'One fell into the pencil cup on the desk. The slinky by the chair, then the cushion on the seat. You\'ll see.',
      drawer: 'One is in the desk drawer, the one left open. From the chair seat, over its side.',
      sill: 'One is on the window sill. The books on the desk go up like stairs.',
      wardrobe: 'One is on top of the wardrobe. Nobody walks up there. Fold the paper on the desk into a plane, and find the warm air.',
      shelf: 'One is on top of the bookshelf. From the wardrobe\'s top, glide.',
      train: 'One is riding on the train! On the engine\'s roof. Round and round it goes.',
      toybox: 'One is in the toy box. The blocks go up to the rim. The jack-in-the-box gets you out. Loudly.',
    };
    const nextMarble = () => MARBLE_IDS.find((k) => !marbles().includes(k));
    const nextMarbleHint = () => { const k = nextMarble(); return k ? HINTS[k] : ''; };

    // ---------- the goal line ----------
    function objective() {
      if (L.on) return w.objective('The floor is lava! Get to the window sill.', { at: [0, 28, -72.75] });
      if (!has('uf.met')) return w.objective('Someone small lives by the mouse hole in the west wall.', { at: [-56, 3, 33] });
      const n = marbles().length;
      if (n < 10) { const k = nextMarble(); const at = MARBLE_AT[k] || null; return w.objective(`Find the lost marbles: ${n} of 10.`, at ? { at: [at[0], at[1] + 2, at[2]] } : undefined); }
      if (!has('uf.marbles')) return w.objective('All ten marbles! Back to Crumb at the mouse hole.', { at: [-56, 3, 33] });
      return w.objective('The floor is lava: from the slipper by the door to the window sill. Beat your time.', { at: [START[0], 3, START[1]] });
    }

    w.on('enter', () => {
      if (has('uf.plane')) lendPlane();
      if (!has('uf.met')) w.after(2, () => w.toast('Underfoot: a bedroom, at the size of a toy. Someone small lives by the mouse hole.'));
      objective();
    });
    w.on('leave', () => {
      if (w.has('uf-paper-plane')) {
        w.take('uf-paper-plane');
        const prev = store.get('prevBack', null);
        if (prev && w.has(prev)) w.equip(prev);
        store.set('prevBack', null);
      }
    });
    w.scene.userData.underfoot = { echo6, echo10, DOOR, L, catS, CAT, train, crumb, fold, starter, vent, bunnies, things, TRAIL1, TRAIL2, BOX_A, BOX_B, BLANKET, NIGHT_BOOKS, DESK_BOOKS,
      CUP, CUP_STEP, ERASER, PAPER, SLINKY, CUSHION, PENCIL_BOX, BLOCKS, JACK, TB, START, SPAWN, VENT, MARBLE_AT, DRUM_IN, DRUM_OUT, RUG, TRACK_R, marbles };
  },
};
