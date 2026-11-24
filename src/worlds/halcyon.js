// Halcyon Point: a holiday island at golden hour, and the Giant, a wave as tall as an eight-storey house that breaks
// along the reef all day and never stops. Paddle out and play on its face, or ask Marisol on the pier for a tow into
// a scored ride: drop in, race the curl down the reef, ride the barrel, launch off the lip, make it to the channel.
//
// How the wave works. It stands still and the water moves through it, which is how a rider sees a real wave. Its face
// is a fixed quarter-pipe (invisible slabs under a drawn surface), and this world's tick code does what a moving wave
// does to a board on it:
// - the water rising up the face carries a rider up it (FLOW), and gravity slides them down it (SLIP, times the
//   slope), so a rider going along the wave settles on a trim line about half way up;
// - the slope speeds the board down the face and slows it up the face (w.player.setBoardSpeed), so a rider makes
//   speed by dropping and turning, as on a real wave; W only paddles (the board is tuned slow: w.player.tuneBoard);
// - on a scored ride the break peels along the reef behind the rider: fall behind it and the whitewater has them;
//   just ahead of it is the pocket (points x2), low under its lip is the barrel, and high near it the lip hits you.

const DT = 1 / 60, D2R = Math.PI / 180;
const ZT = -20;            // the trough: where the face meets the flat water (z)
const H = 26, D = 52;      // the face's height and depth: y = s^2 / 2D, s metres up it (to -z), 45 degrees at the top
const X0 = -40, X1 = 380;  // the wave's ends along the reef; rides go to +x, from the peak to the channel
const X_END = 360;         // a scored ride that reaches here has made the wave (the channel buoy)
// the wave's forces (tuned with tools/surf_bot.mjs): FLOW, the water rising up the face (m/s); SLIP, gravity sliding a
// board sideways down it (m/s at a slope's sine of 1: stronger than FLOW high up, weaker low down, so a board going
// along the wave settles on a trim line); G_SLOPE, gravity along the board (m/s2, the game's gravity is 30); DRAG, the
// water's drag on the board (times speed squared), so speed has a ceiling; THROW_BACK, the lip throwing a flier back
// over the face (m/s); DRAW, how far out in front of the wave the water is pulled toward it (m); POP, the lift a jump or
// a launch from the upper face gets on a ride (m/s up; the board's own jump is 9.6); POCKET, the breaking wave's push
// within 8 m of the curl (m/s2), for a board driving off it (down the line and down the face): enough to escape.
const FLOW = 7.5, SLIP = 13, G_SLOPE = 26, DRAG = 0.014, THROW_BACK = 12, DRAW = 30, POP = 14.5, POCKET = 4;
// the board here: W paddles slowly (to 11 m/s); the wave's slope makes the real speed (heavy drag only above 34)
const BOARD_TUNE = { accel: 6, max: 11, brake: 18, drag: 0.4, turn: 3.1, airTurn: 3, grip: 7, airGrip: 0.25, cap: 36, top: 40 };
// the break's speed along the reef by section (m/s), and how far its lip throws out (m): a gentle takeoff, the bowl
// (the widest barrel), the long wall (race it), the inside (room for airs) and a hard run to the channel
const SECTIONS = [
  { to: 0, speed: 9, throwM: 6, name: 'the takeoff' },
  { to: 90, speed: 12, throwM: 15, name: 'the bowl' },
  { to: 230, speed: 15, throwM: 10, name: 'the wall' },
  { to: 330, speed: 12, throwM: 7, name: 'the inside' },
  { to: 1e9, speed: 16, throwM: 12, name: 'the end section' },
];
const FEATHER = 1.2;       // the lip everywhere the wave is not breaking: a feather of spray
const faceY = (s) => (s <= 0 ? 0 : s >= D ? H : (s * s) / (2 * D));
const BACK_TAN = Math.tan(24 * Math.PI / 180); // the back of the wave falls away at 24 degrees
const sectionAt = (x) => { for (const sc of SECTIONS) if (x < sc.to) return sc; return SECTIONS[SECTIONS.length - 1]; };
// how far the lip throws out dx metres ahead of the break (on a ride; behind the break it has crashed)
const throwAt = (x, dx) => {
  if (dx < 0) return 0;
  const bell = dx < 4 ? 0.6 + 0.1 * dx : dx < 30 ? 1 - (0.8 * (dx - 4)) / 26 : 0;
  return Math.max(FEATHER, sectionAt(x).throwM * bell);
};
// where the lip lands on the face (s) for a throw t: the bowl's full throw arches over the whole face to land near
// the trough (a barrel you could sail a boat through), a feather curls back onto the crest. The tube is the face
// above that line, and the lip lands on whoever is at it, close to the curl. (The drawn lip arches to the same line.)
const THROW_MAX = 15;
const landS = (t) => D - Math.min(1, t / THROW_MAX) * (D - 8);
// on a ride, the wave's push dx metres ahead of the break: full near the curl, softer out on the shoulder, so a rider
// who runs far ahead sinks to the flatter, slower part of the face and the curl comes back to them
const powerAt = (dx) => (dx <= 30 ? 1 : Math.max(0.45, 1 - (dx - 30) * 0.011));
const angDiff = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const ENDS = {
  made: ['MADE THE WAVE', 'All the way to the channel'],
  caught: ['WIPEOUT', 'The whitewater caught you'],
  lipped: ['WIPEOUT', 'The lip knocked you flat'],
  bail: ['WIPEOUT', 'You bailed the landing'],
  back: ['OVER THE BACK', 'The Giant rolled on without you'],
  straight: ['STRAIGHTENED OUT', 'You rode it in to the lagoon'],
  time: ['RIDE OVER', 'That was a long one'],
};
const C = {
  sand: '#f6d58f', sandDark: '#e9bf74', wet: '#dcb06c', grass: '#8fcf6a', grassDark: '#6fb357',
  rock: '#b3967e', rockDark: '#94795f', wood: '#b9824f', woodDark: '#8f5f37', plank: '#d39d68',
  trunk: '#8a6440', frond: '#5cbf63', frondDark: '#3e9b4e', coconut: '#7a5432',
  coral: '#ff7a59', sun: '#ffd166', teal: '#3ec9c2', white: '#fffaf0', navy: '#2b3a67', pink: '#ff9fb2',
};
const LOOKS = {
  marisol: { style: 'tall', face: 'shades', mouth: 'grin', top: 'none', outfit: 'tee', extra: 'necklace', finish: 'satin', colors: { body: '#b9794f', head: '#b9794f', eyes: '#2a2230', outfit: '#ff7a59', trim: '#ffd166' } },
  nell: { style: 'round', face: 'eyes', mouth: 'smile', top: 'bun', outfit: 'tee', extra: 'none', finish: 'matte', colors: { body: '#e8b48a', head: '#e8b48a', eyes: '#1d3557', outfit: '#ffd166', trim: '#e63946' } },
  kiko: { style: 'little', face: 'big', mouth: 'o', top: 'none', outfit: 'overalls', extra: 'none', finish: 'matte', colors: { body: '#8d5b3e', head: '#8d5b3e', eyes: '#1b1b2a', outfit: '#3ec9c2', trim: '#ffd166' } },
};

export default {
  id: 'halcyon',
  name: 'Halcyon Point',
  author: 'elsewhere',
  version: 1,
  blurb: 'A holiday island with a wave the size of a building. Surf it.',
  color: '#3fd0d4',
  spawn: { pos: [20, 1.6, 88], yaw: 180 },
  killY: -30,
  rules: { powers: false }, // scored rides: artifacts sleep here (any board works on the water)
  theme: { // a bright tropical afternoon (Junction has the golden hour): the sun high behind the beach lights the Giant
    skyTop: '#2a78e4', skyHorizon: '#bfe8ff', skyBottom: '#d9f3ff', skySharp: 0.55,
    sunDir: [-0.4, 0.72, 0.56], sunColor: '#fff7e0', sunSize: 2.2, sunLight: '#fff4dc', sunIntensity: 3.0,
    hemiSky: '#cfe8ff', hemiGround: '#f3d29a', hemiIntensity: 1.25,
    fog: [420, 1700], fogColor: '#cfeaff', stars: 0, bloom: 0.2, exposure: 1.0,
  },
  music: { root: 62, scale: 'lydian', bpm: 100, progression: [0, 4, 5, 3], sparkle: 0.45, bright: 2400, wave: 'triangle', pulse: true },
  items: {
    surfboard: {
      name: 'Surfboard', slot: 'board', traits: ['board'], rarity: 'uncommon',
      desc: 'A big-wave board from Halcyon Point. Press B to ride it wherever boards are allowed.',
      look: [
        { s: 'rbox', size: [0.62, 0.08, 2.1], pos: [0, 0.06, 0.05], color: '#fffaf0' },
        { s: 'box', size: [0.09, 0.085, 1.96], pos: [0, 0.066, 0.05], color: '#3ec9c2' },
        { s: 'box', size: [0.5, 0.09, 0.12], pos: [0, 0.067, 0.72], color: '#ff7a59' },
        { s: 'box', size: [0.03, 0.16, 0.22], pos: [0, -0.05, -0.82], color: '#3ec9c2' },
      ],
    },
    'sun-hat': {
      name: 'Sun Hat', slot: 'head', traits: ['cosmetic'], rarity: 'rare',
      desc: 'Rode the Giant at Halcyon Point all the way to the channel.',
      look: [
        { s: 'cyl', r: 0.47, h: 0.03, pos: [0, 0.02, 0], color: '#f2d38b' },
        { s: 'cyl', r: 0.25, h: 0.2, pos: [0, 0.13, 0], color: '#f2d38b' },
        { s: 'cyl', r: 0.256, h: 0.06, pos: [0, 0.07, 0], color: '#ff7a59' },
        { s: 'sphere', r: 0.065, pos: [0.21, 0.1, 0.12], color: '#ffd1dc' },
        { s: 'sphere', r: 0.03, pos: [0.21, 0.13, 0.17], color: '#ffd166' },
      ],
    },
  },

  build(w) {
    const T = w.THREE;
    w.player.tuneBoard(BOARD_TUNE);

    // ---- the state of play (tick code changes it; the frame code only draws it) ----
    // state: 'free' (the beach, the lagoon, practice on the face), 'tow' (Marisol's tow-in), 'ride' (a scored
    // ride: the break peels at xp), 'over' (a ride just ended)
    const S = {
      state: 'free', xp: X0, towK: 0, endK: 0, endHow: null, score: 0, t: 0, mult: 1, tag: '',
      inTube: false, tube: 0, bestTube: 0, airs: 0, air: null, airT: -9, cutT: -9, headHist: [], wasG: true, backT: 0, carve: 0, carved: false, carveYaw: null, carves: 0, carveT: -9, yLo: 99, yHi: -99,
      forced: false, lastObj: '', objT: 0, rides: 0,
    };
    w.scene.userData.halcyon = S; // (read by the tests)

    // Big colliders are tiled: a character moving across one box hundreds of metres long slowly sinks into it
    // (8 cm in 12 s of walking on a 700 m box), and then cannot step onto a pier. Tiles meet edge to edge, so a
    // board crosses their seams without a bump (the surf bot checks).
    const tiled = (x0, x1, step, make) => { for (let x = x0; x < x1 - 1e-6; x += step) { const len = Math.min(step, x1 - x); make(x + len / 2, len); } };

    // ---- the water: an invisible floor at y = 0 under the bay and out to sea, walled at its edges ----
    for (let z = -340; z < 42; z += 50) { const dz = Math.min(50, 42 - z); tiled(-300, 700, 50, (x, len) => w.box({ pos: [x, -1, z + dz / 2], size: [len, 2, dz], invisible: true })); }
    for (const x of [-300, 700]) for (let z = -340; z < 42; z += 50) { const dz = Math.min(50, 42 - z); w.box({ pos: [x, 15, z + dz / 2], size: [2, 34, dz], invisible: true }); }
    tiled(-300, 700, 50, (x, len) => w.box({ pos: [x, 15, -340], size: [len, 34, 2], invisible: true }));

    // ---- the Giant: the face's slabs, then its back ----
    {
      const N = 12, TH = 2;
      for (let i = 0; i < N; i++) {
        const s0 = (D * i) / N, s1 = (D * (i + 1)) / N, y0 = faceY(s0), y1 = faceY(s1);
        const len = Math.hypot(s1 - s0, y1 - y0), a = Math.atan2(y1 - y0, s1 - s0);
        // the slab's top is the segment; its centre sits half a slab under it (normal: up and toward the beach)
        const ym = (y0 + y1) / 2 - (Math.cos(a) * TH) / 2, zm = ZT - (s0 + s1) / 2 - (Math.sin(a) * TH) / 2;
        tiled(X0, X1, 30, (x, l) => w.box({ pos: [x, ym, zm], size: [l, TH, len + 0.3], rot: [a / D2R, 0, 0], invisible: true }));
      }
      const RUN = H / Math.tan(24 * D2R), blen = Math.hypot(RUN, H), b = -24 * D2R;
      const ym = H / 2 - (Math.cos(b) * TH) / 2, zm = ZT - D - RUN / 2 + (Math.sin(-b) * TH) / 2;
      tiled(X0, X1, 30, (x, l) => w.box({ pos: [x, ym, zm], size: [l, TH, blen], rot: [-24, 0, 0], invisible: true }));
    }

    // ---- the beach: sand out of the lagoon, flat to the dunes, hills behind ----
    {
      const a = Math.atan2(1.5, 26); // from (z 36, y -0.5) to (z 62, y 1.0)
      tiled(-220, 480, 50, (x, l) => w.box({ pos: [x, 0.25 - Math.cos(a), 49 + Math.sin(a)], size: [l, 2, 26.2], rot: [-a / D2R, 0, 0], color: C.wet }));
      // (big colliders are tiled: a character walking across one box hundreds of metres long slowly sinks into it)
      for (let x = -220; x < 480; x += 50) for (let z = 62; z < 162; z += 50) w.box({ pos: [x + 25, 0, z + 25], size: [50, 2, 50], color: C.sand });
      tiled(-250, 510, 50, (x, l) => w.box({ pos: [x, 0.4, 150], size: [l, 2.4, 60], color: C.grass, shadow: false }));
      const R = w.rand(7);
      for (let i = 0; i < 26; i++) { // dunes and grassy humps along the back of the beach
        const x = -200 + i * 28 + R.range(-8, 8), z = 116 + R.range(-4, 8), r = R.range(8, 15);
        w.sphere({ pos: [x, -r * 0.55 + 1, z], radius: r, low: true, color: i % 3 ? C.grass : C.grassDark, collide: false, shadow: false });
      }
      for (let i = 0; i < 9; i++) { // hills behind
        const x = -260 + i * 90 + R.range(-20, 20), r = R.range(40, 70);
        w.cone({ pos: [x, r * 0.32, 220 + R.range(-15, 25)], radius: r, height: r * 0.8, sides: 7, color: i % 2 ? C.grassDark : '#7cc25f', collide: false, shadow: false });
      }
      // headlands framing the bay: rocks with grass on top, left of the peak and right of the channel
      for (const [x0, dir] of [[-150, -1], [470, 1]]) {
        for (let k = 0; k < 8; k++) { // chunky boulders, the bigger ones grass-topped, stepping out to sea
          const x = x0 + dir * k * 20 + R.range(-6, 6), z = 70 - k * 50 + R.range(-10, 10), r = R.range(14, 24);
          w.sphere({ pos: [x, -r * 0.35, z], radius: r, low: true, color: k % 2 ? C.rock : C.rockDark });
          w.sphere({ pos: [x + R.range(-8, 8), -r * 0.4, z + R.range(-12, 12)], radius: r * 0.6, low: true, color: k % 2 ? C.rockDark : C.rock });
          if (r > 17) w.sphere({ pos: [x, r * 0.52, z], radius: r * 0.32, low: true, color: C.grass, collide: false, shadow: false });
        }
      }
      for (let i = 0; i < 6; i++) { // islands on the horizon
        const r = R.range(30, 70);
        w.cone({ pos: [-300 + i * 170 + R.range(-30, 30), -2, -620 + R.range(-60, 40)], radius: r, height: r * 0.7, sides: 6, color: i % 2 ? '#86b9a2' : '#9cc7b0', collide: false, shadow: false });
      }
    }

    // ---- palms, umbrellas, towels, a beach ball or two ----
    const palm = (x, z, lean, seed) => {
      const R = w.rand(seed);
      let px = x, py = 1, pz = z;
      const dir = R.range(0, 360) * D2R;
      for (let k = 0; k < 6; k++) { // a curved trunk: six leaning drums
        const ox = Math.sin(dir) * lean * k * 0.18, oz = Math.cos(dir) * lean * k * 0.18;
        w.cylinder({ pos: [px + ox, py + 0.9, pz + oz], radius: 0.36 - k * 0.025, height: 1.9, sides: 7, color: k % 2 ? C.trunk : '#9b744b', collide: k === 0 });
        py += 1.8;
        if (k === 5) { px += ox; pz += oz; }
      }
      for (let f = 0; f < 7; f++) { // the crown: drooping fronds
        const a = (f / 7) * 360 + R.range(-12, 12);
        const fx = Math.sin(a * D2R), fz = Math.cos(a * D2R);
        w.box({ pos: [px + fx * 2.1, py + 0.25, pz + fz * 2.1], size: [1.0, 0.12, 4.4], yaw: a, rot: [24, a, 0], color: f % 2 ? C.frond : C.frondDark, collide: false });
      }
      for (let c = 0; c < 3; c++) w.sphere({ pos: [px + Math.sin(c * 2.1) * 0.4, py - 0.35, pz + Math.cos(c * 2.1) * 0.4], radius: 0.28, low: true, color: C.coconut, collide: false });
      return [px, py, pz];
    };
    const palmTops = [];
    {
      const R = w.rand(11);
      for (let i = 0; i < 16; i++) {
        const x = -140 + i * 34 + R.range(-9, 9), z = 74 + R.range(0, 26);
        if (Math.abs(x - 20) < 10) continue; // the arrival's lane
        palmTops.push(palm(x, z, R.range(0.6, 1.6), 100 + i));
      }
      const UMB = [C.coral, C.sun, C.teal, C.pink, '#8ecae6'];
      for (let i = 0; i < 12; i++) {
        const x = -70 + i * 24 + R.range(-5, 5), z = 64 + R.range(0, 8), col = UMB[i % UMB.length];
        if (Math.abs(x - 8) < 9) continue; // (Marisol's patch)
        w.cylinder({ pos: [x, 2.2, z], radius: 0.07, height: 2.6, color: C.white, collide: false });
        w.cone({ pos: [x, 3.6, z], radius: 2.3, height: 0.9, sides: 8, color: col, collide: false });
        w.box({ pos: [x + 1.6, 1.03, z + 0.6], size: [1.1, 0.04, 2.2], yaw: R.range(-20, 20), color: UMB[(i + 2) % UMB.length], collide: false, shadow: false });
      }
      w.ball({ pos: [32, 2.5, 72], radius: 0.6, color: C.coral });
      w.ball({ pos: [96, 2.5, 70], radius: 0.6, color: C.teal });
    }

    // ---- the pier, the jet ski, and the steps down to the water ----
    const PX = -10, PIER = { x0: PX - 2.4, x1: PX + 2.4, z0: -4.5, z1: 64, top: 1.4 }; // (0.4 m above the sand: a step)
    {
      for (let z = PIER.z0; z < PIER.z1 - 1e-6; z += 34.25) w.box({ pos: [PX, PIER.top - 0.25, z + 17.125], size: [4.6, 0.5, 34.25], color: C.plank });
      for (let z = PIER.z0 + 1; z < PIER.z1; z += 6) for (const dx of [-2, 2]) w.cylinder({ pos: [PX + dx, -0.6, z], radius: 0.22, height: 4, sides: 6, color: C.woodDark, collide: false });
      for (let z = PIER.z0 + 2; z < 40; z += 4) for (const dx of [-2.2, 2.2]) w.box({ pos: [PX + dx, 2.1, z], size: [0.12, 1.0, 0.12], color: C.woodDark, collide: false });
      w.box({ pos: [PX - 2.2, 2.55, 17], size: [0.1, 0.1, 43], color: C.wood, collide: false });
      w.box({ pos: [PX + 2.2, 2.55, 17], size: [0.1, 0.1, 43], color: C.wood, collide: false });
      for (let k = 0; k < 4; k++) w.box({ pos: [PX + 4.2, 0.2 * (k + 1) - 0.25 + 0.0, -1.5 + k * 1.2], size: [3.6, 0.4 * (k + 1), 1.25], color: C.plank }); // steps to the water
      w.coin({ pos: [PX, 2.6, 30] }); w.coin({ pos: [PX, 2.6, 15] }); w.coin({ pos: [PX + 4.4, 1.6, -7] });
    }
    const MX = 6, MZ = 50, sandY = (z) => (z <= 36 ? -0.5 : z >= 62 ? 1 : -0.5 + (1.5 * (z - 36)) / 26);
    const JET = [MX + 6, 0.15, 40.5];
    const jetski = w.model({ pos: JET, yaw: 180, parts: [
      { s: 'rbox', size: [1.4, 0.55, 3.2], pos: [0, 0.28, 0], color: '#fffaf0' },
      { s: 'box', size: [1.42, 0.14, 3.0], pos: [0, 0.2, 0], color: C.coral },
      { s: 'rbox', size: [0.7, 0.3, 1.2], pos: [0, 0.68, -0.3], color: C.navy },
      { s: 'box', size: [0.9, 0.1, 0.12], pos: [0, 1.05, 0.55], color: '#3a3a4a' },
      { s: 'cyl', r: 0.06, h: 0.5, pos: [0, 0.8, 0.55], color: '#3a3a4a' },
      { s: 'box', size: [0.5, 0.4, 0.5], pos: [0, 0.55, 0.9], color: C.teal },
    ] });

    // ---- the surf shack, the lifeguard tower, the boardwalk, the portal home ----
    {
      const sx = -12, sz = 74;
      w.box({ pos: [sx, 2.6, sz], size: [9, 3.2, 6], color: C.wood });
      w.box({ pos: [sx, 4.45, sz], size: [10.4, 0.5, 7.4], color: C.woodDark });
      for (let k = 0; k < 8; k++) w.box({ pos: [sx - 4.6 + k * 1.3 + 0.65, 3.9, sz - 4.1], size: [1.3, 0.12, 2.4], rot: [-14, 0, 0], color: k % 2 ? C.white : C.coral, collide: false });
      const BOARDS = [C.coral, C.sun, C.teal, C.white, C.pink];
      for (let k = 0; k < 5; k++) w.box({ pos: [sx + 5.6, 2.4, sz - 2.4 + k * 1.2], size: [0.5, 2.8, 0.12], rot: [0, 0, -12], color: BOARDS[k], collide: false });
      w.sign({ pos: [sx + 2, 1.0, sz + 4.2], yaw: 0, title: 'HALCYON SURF', text: 'Boards for everyone.\nTows from Marisol, at the water.', bg: '#1f5f7a', border: C.coral, titleColor: C.sun, frame: C.woodDark });
      w.coin({ pos: [sx, 5.6, sz] });
      // the lifeguard tower: legs, a deck you can climb to, a hut
      const lx = 64, lz = 70;
      for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) w.cylinder({ pos: [lx + dx, 2.8, lz + dz], radius: 0.14, height: 3.8, color: C.white, collide: false });
      w.box({ pos: [lx, 4.7, lz], size: [4, 0.3, 4], color: C.wood });
      w.box({ pos: [lx, 6.0, lz + 0.6], size: [3, 2.3, 2.4], color: C.sun });
      w.box({ pos: [lx, 7.3, lz + 0.6], size: [3.6, 0.3, 3], color: C.coral });
      for (let k = 0; k < 9; k++) w.box({ pos: [lx, 1.25 + k * 0.4, lz + 2.4 + (8 - k) * 0.45], size: [1.4, 0.2, 0.5], color: C.woodDark }); // the ladder's steps
      w.coin({ pos: [lx, 8.3, lz + 0.6] });
      // the boardwalk
      tiled(-90, 130, 55, (x, l) => w.box({ pos: [x, 1.12, 98], size: [l, 0.25, 6], color: C.plank }));
      for (let x = -88; x <= 128; x += 8) w.box({ pos: [x, 0.7, 101.2], size: [0.3, 1.6, 0.3], color: C.woodDark, collide: false });
      w.portal({ pos: [20, 1.25, 98], yaw: 180, to: 'hub', label: 'Junction', frame: C.woodDark });
      w.sign({ pos: [34, 1.25, 96], yaw: 180, title: 'HALCYON POINT', text: 'Sun, sand, and the Giant.\nThe wave breaks all day. Nobody knows why.', bg: '#1f5f7a', border: C.teal, titleColor: C.sun, frame: C.woodDark });
      // coins on the beach
      for (const [x, z] of [[-60, 70], [-34, 82], [40, 80], [80, 74], [130, 70], [170, 66]]) w.coin({ pos: [x, 2.1, z] });
      w.coin({ pos: [210, 1.2, 20] }); // out on a buoy in the lagoon
      w.cylinder({ pos: [210, 0.1, 20], radius: 0.8, height: 1.4, sides: 10, color: C.coral, collide: false });
    }
    // the channel buoy: make it here and the ride is made
    w.cylinder({ pos: [X_END, 1.2, ZT + 6], radius: 1.1, height: 2.4, sides: 10, color: C.sun, glow: 0.6, collide: false });
    w.cone({ pos: [X_END, 3.2, ZT + 6], radius: 0.8, height: 1.6, sides: 10, color: C.coral, collide: false });
    // gems on the Giant's face, for whoever plays on it
    for (const [x, s] of [[30, 0.62], [95, 0.8], [160, 0.7], [220, 0.9], [280, 0.66], [330, 0.84]]) w.coin({ pos: [x, faceY(s * D) + 1.4, ZT - s * D], kind: 'gem', value: 3 });

    // ---- the people ----
    const marisol = w.npc({ pos: [MX, sandY(MZ), MZ], yaw: 0, name: 'Marisol', look: LOOKS.marisol, onTalk: () => talkMarisol() });
    w.sign({ pos: [MX - 4, sandY(MZ + 2), MZ + 2], yaw: 0, title: 'TOWS TO THE GIANT', text: 'Talk to Marisol for a tow into a real ride.\nOr paddle out and play on its face.', bg: '#1f5f7a', border: C.coral, titleColor: C.sun, frame: C.woodDark });
    w.npc({ pos: [64, 5.0, 69.4], yaw: 180, name: 'Nell', look: LOOKS.nell, lines: [
      'Lifeguard on duty! Not that anyone drowns here. The Giant is fierce, but it is kind.',
      'It breaks in five sections. The takeoff is gentle, then the bowl: that is where it barrels widest.',
      'Then the wall: long and fast. It runs away from you if you let it. The inside is slower, with room for airs.',
      'The end section runs hard into the channel. Make the yellow buoy and the wave is yours.',
    ] });
    w.npc({ pos: [-46, 1.0, 66], yaw: 160, name: 'Kiko', look: LOOKS.kiko, lines: [
      'I am building the Giant out of sand. It keeps falling over. Like the real one!',
      'My mum says nobody rides it all the way. My mum has never tried.',
    ] });
    { // Kiko's sandcastle
      w.box({ pos: [-44.2, 1.25, 64.5], size: [2.2, 0.5, 1.4], color: C.sandDark, collide: false });
      w.cone({ pos: [-44.2, 1.9, 64.5], radius: 0.6, height: 0.9, sides: 6, color: C.sandDark, collide: false });
      w.cone({ pos: [-45.1, 1.75, 64.5], radius: 0.4, height: 0.6, sides: 6, color: C.sandDark, collide: false });
      w.cone({ pos: [-43.3, 1.75, 64.5], radius: 0.4, height: 0.6, sides: 6, color: C.sandDark, collide: false });
    }

    // ---- talking to Marisol, and the tow ----
    const best = () => w.store.get('best', 0);
    function giveBoard(loud) {
      if (!w.has('surfboard')) w.give('surfboard', loud ? undefined : { silent: true });
      if (!w.equipment().board) w.equip('surfboard');
    }
    async function talkMarisol() {
      if (S.state !== 'free') return;
      marisol.face('player');
      if (!w.flag('halcyon.met')) {
        w.setFlag('halcyon.met', true);
        await w.say('Marisol', ['Welcome to Halcyon Point! Sun, sand, and the Giant.', 'That wall of water out there breaks along the reef all day, every day. Nobody knows why. Nobody minds.']);
        giveBoard(true);
        await w.say('Marisol', ['Every visitor gets a board. Paddle out and play on its face as long as you like.', 'When you want a real ride, come back to me here and I will tow you into one.']);
        objective();
      }
      const k = await w.ask('Marisol', best() ? `Your best ride: ${fmt(best())} points. Another?` : 'Ready to ride the Giant?', ['Tow me in!', 'How do I surf it?', 'Not yet']);
      if (k === 0) { tow(); return; }
      if (k === 1) {
        await w.say('Marisol', [
          'W paddles. Out on the wave, the slope is your engine: drop down the face to go fast, climb it to slow down.',
          'The break chases you along the reef. Stay just ahead of it, in the pocket, for double points. Fall behind and the whitewater has you.',
          'Low in the pocket, under the lip, is the barrel. Up high near the curl, the lip will knock you flat.',
          'Hit the lip fast and you fly. A and D spin you in the air: land facing the way you are going.',
          'Make the yellow buoy at the channel and the wave is yours. The best rides go on the boards.',
        ]);
      }
    }
    // the tow: Marisol's jet ski pulls the rider out across the lagoon and slings them up the face to the drop
    const TOW = { from: [JET[0] - 2, 0.95, 37], mid: [-36, 0.95, ZT + 8], s1: 0.86 * D, x1: -24, ticks: 190 };
    const towPos = (k) => {
      const f = Math.min(1, k / TOW.ticks);
      if (f < 0.62) { // across the lagoon, easing out
        const e = f / 0.62, q = e * e * (3 - 2 * e);
        return [TOW.from[0] + (TOW.mid[0] - TOW.from[0]) * q, 0.95, TOW.from[2] + (TOW.mid[2] - TOW.from[2]) * q];
      }
      const e = (f - 0.62) / 0.38, s = -8 + (TOW.s1 + 8) * e; // then up the face, on its surface
      return [TOW.mid[0] + (TOW.x1 - TOW.mid[0]) * e, faceY(s) + 0.95, ZT - s];
    };
    function tow() {
      if (S.state !== 'free') return;
      giveBoard(false);
      S.state = 'tow'; S.towK = 0;
      w.player.forceBoard(true); S.forced = true; w.player.freeze(true);
      w.shot({ pos: [-96, 20, 34], look: [-28, 9, -40] });
      w.sound('boost');
      w.objective('Hold on!');
    }
    function startRide() {
      Object.assign(S, { state: 'ride', xp: TOW.x1 - 10, score: 0, t: 0, mult: 1, tag: '', inTube: false, tube: 0, bestTube: 0, airs: 0, air: null, airT: -9, cutT: -9, headHist: [], wasG: true, carve: 0, carved: false, carveYaw: null, carves: 0, carveT: -9, yLo: 99, yHi: -99 });
      w.player.freeze(false);
      w.player.setPos(towPos(TOW.ticks), 38);
      w.player.setBoardSpeed(9);
      w.shot(null);
      w.banner('DROP IN!', 'Race the curl down the reef to the channel');
      w.sound('go');
    }
    function endRide(how) {
      if (S.state !== 'ride') return;
      if (S.inTube && S.tube >= 1 && how === 'made') bankTube();
      S.state = 'over'; S.endHow = how; S.endK = 0; S.rides++;
      const made = how === 'made';
      if (made) { S.score += 300; w.toast('Made the wave! +300'); }
      const total = Math.round(S.score), prev = best();
      const counted = w.record('ride', total, { better: 'higher' });
      if (counted && total > prev) w.store.set('best', total);
      const [title, why] = ENDS[how];
      const extra = [S.carves ? `${S.carves} carve${S.carves > 1 ? 's' : ''}` : '', S.bestTube >= 1 ? `barrel ${S.bestTube.toFixed(1)} s` : '', S.airs ? `${S.airs} air${S.airs > 1 ? 's' : ''}` : '', counted && total > prev && prev ? 'new best!' : ''].filter(Boolean).join(' · ');
      w.banner(`${title} · ${fmt(total)}`, extra ? `${why} · ${extra}` : why);
      const coins = Math.min(6, Math.floor(total / 350));
      if (coins) { w.addCoins(coins); w.toast(`+${coins} coin${coins > 1 ? 's' : ''}`); }
      if (made) {
        w.sound('win');
        w.burst([w.player.pos[0], w.player.pos[1] + 2, w.player.pos[2]], { color: [C.sun, C.coral, C.white, C.teal], count: 90, speed: 9, life: 1.4 });
        if (!w.has('sun-hat')) w.after(1.6, () => { w.give('sun-hat'); w.setFlag('halcyon.made', true); });
      } else if (how !== 'back' && how !== 'straight') {
        w.sound('lose'); w.shake(0.5);
        w.burst([w.player.pos[0], w.player.pos[1], w.player.pos[2]], { color: ['#ffffff', '#c8f4f2'], count: 70, speed: 8, life: 1.1 });
      }
      w.player.freeze(true);
    }
    function backToBeach() {
      S.state = 'free'; S.xp = X0;
      w.player.freeze(false);
      w.player.setPos([MX + 2.5, sandY(MZ + 3) + 0.95, MZ + 3], 180);
      S.forced = false; w.player.forceBoard(false);
      objective();
    }
    // free play: back into the lagoon when the wave is left behind (its ends, or over its back)
    function toLagoon(x, why) {
      w.toast(why);
      w.player.setPos([Math.max(X0 + 14, Math.min(X1 - 30, x)), 0.95, ZT + 14], 90);
    }
    // a barrel is judged by how you come out of it: with speed (driving down the line), not drifting out
    function bankTube() {
      const drive = Math.max(0, Math.min(1, (w.player.boardSpeed - 10) / 8)), pts = Math.round((150 + 150 * S.tube) * drive);
      S.bestTube = Math.max(S.bestTube, S.tube);
      if (!pts) { w.toast(`Barrel ${S.tube.toFixed(1)} s, but no speed out of it`); return; }
      S.score += pts; w.toast(`Barrel! ${S.tube.toFixed(1)} s  +${pts}`); w.sound('pad');
    }
    function objective(text) {
      let line = text;
      if (line == null) {
        if (!w.flag('halcyon.met')) { w.objective('Meet Marisol at the water\'s edge', { at: [MX, sandY(MZ) + 2, MZ] }); S.lastObj = ''; return; }
        line = best() ? `Ask Marisol for a tow into the Giant · your best ride ${fmt(best())}` : 'Paddle out and play on the Giant, or ask Marisol for a tow into a real ride';
      }
      if (line !== S.lastObj) { S.lastObj = line; w.objective(line); }
    }
    objective();

    // ---- every tick: the water, the wave's forces, the ride ----
    const onPier = (p, feet) => p[0] > PIER.x0 && p[0] < PIER.x1 && p[2] > PIER.z0 && p[2] < PIER.z1 && feet > 1.0;
    w.on('tick', () => {
      const p = w.player.pos, feet = p[1] - 0.93, g = w.player.grounded;
      // on the water you are on a board (yours, or the island's)
      const wet = p[2] < 41 && !onPier(p, feet);
      if (wet && !S.forced) {
        if (!w.has('surfboard') && !w.equipment().board && !w.flag('halcyon.met')) w.toast('Marisol waves from the water\'s edge: "Take a board! It is yours."');
        giveBoard(false); w.player.forceBoard(true); S.forced = true;
      } else if (!wet && S.forced && S.state === 'free') { w.player.forceBoard(false); S.forced = false; }

      if (S.state === 'tow') {
        S.towK++;
        const q = towPos(S.towK), q2 = towPos(S.towK + 1);
        w.player.setPos(q, Math.atan2(q2[0] - q[0], q2[2] - q[2]) / D2R);
        if (S.towK >= TOW.ticks) startRide();
        return;
      }
      if (S.state === 'over') {
        S.endK++;
        if (S.endK >= (S.endHow === 'made' ? 150 : 100)) backToBeach();
        return;
      }

      // where on the wave: s metres up the face from the trough
      const s = ZT - p[2], onReef = p[0] > X0 && p[0] < X1;
      const fy = faceY(s), above = feet - fy;
      const nearFace = onReef && s > -0.5 && s < D + 0.6 && above < 0.9 && above > -1.5;
      const yaw = w.player.yaw, yr = yaw * D2R;
      const bs0 = w.player.boardSpeed, drag = DRAG * bs0 * Math.abs(bs0);
      if (nearFace) {
        const th = Math.atan(Math.max(0, Math.min(D, s)) / D), sn = Math.sin(th);
        // the water rising up the face carries you up; gravity slides the board sideways down it (the share of the
        // slope across the board: none when you point straight down, where it all goes into speed instead)
        const pw = S.state === 'ride' ? powerAt(p[0] - S.xp) : 1;
        w.player.drift([0, 0, -FLOW * pw + SLIP * sn * Math.abs(Math.sin(yr))]);
        // the slope speeds the board down the face and slows it up the face; the water drags on it
        // close to the curl, its push, for a board driving off it: down the line and down the face, not trimming level
        const deep = S.state === 'ride' && p[0] - S.xp > 0 && p[0] - S.xp < 8 && Math.cos(yr) > 0.2;
        w.player.setBoardSpeed(bs0 + (G_SLOPE * sn * Math.cos(yr) - drag + (deep ? POCKET * Math.max(0, Math.sin(yr)) : 0)) * DT);
      } else if (g && onReef && s > D - 0.2 && feet - (H - (s - D) * BACK_TAN) < 0.9) {
        w.player.drift([0, 0, -6]); // on the back of the wave: it slides you off behind it
      } else if (S.forced && g && feet < 0.6) {
        w.player.setBoardSpeed(bs0 - drag * DT); // flat water drags too
        if (onReef && s > -DRAW && s <= -0.5) w.player.drift([0, 0, -FLOW * (1 + s / DRAW)]); // in front of the wave, its draw pulls you toward it
      } else if (!g && onReef && (s > D - 3 || feet > H) && above > 0.5) {
        w.player.push([0, 0, THROW_BACK]); // off the lip: the wave throws you back onto its face
      }

      if (S.state === 'free') {
        if (nearFace && p[0] > X1 - 8) toLagoon(X1, 'The Giant ends here. Back to the lagoon!');
        else if (nearFace && p[0] < X0 + 3) toLagoon(X0, 'That is the peak. Back to the lagoon!');
        else if (g && onReef && s > D + 2.5) toLagoon(p[0], 'Over the back! Marisol fishes you out.');
        objective();
        return;
      }

      // ---- a scored ride ----
      S.t += DT;
      S.xp += sectionAt(S.xp).speed * DT;
      const dx = p[0] - S.xp;
      if (p[0] >= X_END) return endRide('made');
      if (dx < -0.5 && s > -32 && s < D + 6 && feet < H + 8) return endRide('caught'); // behind the break, anywhere it reaches
      const t = throwAt(p[0], dx), sL = landS(t);
      if (nearFace && dx >= 0 && dx < 2 && t >= 9 && s > sL - 2 && s < sL + 3) return endRide('lipped'); // where a big lip comes down, at the curl (a small one crumbles)
      if (g && onReef && s > D + 2.5) return endRide('back');
      if (s < -32) return endRide('straight');
      if (S.t > 75) return endRide('time');

      // points, judged like a surf contest: for what you do on the wave, not for time on it. A little for riding, more
      // for each carve (a turn of 45 degrees or more, at speed), the barrel (deep, under the lip), airs and speed; all
      // doubled in the pocket, close to the curl
      const onWave = nearFace || (!g && onReef && s > -2);
      const pocket = dx >= 1 && dx <= 15;
      const inTube = nearFace && dx >= 1 && dx <= 7 && t >= 6.5 && s > sL + 4; // deep, under the arch of the lip
      S.mult = pocket ? 2 : 1;
      if (onWave) S.score += 3 * DT;
      const bs = w.player.boardSpeed;
      if (nearFace) { // carves: a turn held one way (45 degrees or more) that took you up or down the face (2.5 m or more)
        // since the last; it counts once, then the next must turn back the other way. Wiggling in place is not a carve
        const d = angDiff(yaw, S.carveYaw == null ? yaw : S.carveYaw); S.carveYaw = yaw;
        S.yLo = Math.min(S.yLo, feet); S.yHi = Math.max(S.yHi, feet);
        if (Math.abs(d) > 0.05) {
          if (Math.sign(d) !== Math.sign(S.carve || 0)) { S.carve = 0; S.carved = false; }
          S.carve += d;
          if (!S.carved && Math.abs(S.carve) >= 45 && bs > 10 && S.yHi - S.yLo >= 2.5 && S.t - S.carveT >= 0.55) {
            S.carved = true; S.carves++; S.carveT = S.t; S.yLo = S.yHi = feet; S.score += Math.round((30 + bs) * S.mult);
          }
        }
      } else S.carveYaw = null;
      // the barrel counts when you come out of it ahead of the curl (a second or more inside); not if it takes you
      if (inTube) S.tube += DT;
      else if (S.inTube) { if (S.tube >= 1 && dx > 7) bankTube(); S.tube = 0; }
      S.inTube = inTube;
      // airs: off the upper face, upward
      if (S.air) {
        S.air.rot += angDiff(yaw, S.air.yaw); S.air.yaw = yaw; S.air.top = Math.max(S.air.top, feet - H);
        if (g) {
          const air = S.air; S.air = null;
          const time = (w.ticks - air.k) * DT, v = w.player.vel, hs = Math.hypot(v[0], v[2]);
          const off = hs < 4 ? 0 : Math.abs(angDiff(yaw, Math.atan2(v[0], v[2]) / D2R));
          if (off > 75 && off < 150) return endRide('bail');
          if (time >= 0.55) {
            S.airT = S.t;
            const spins = Math.floor((Math.abs(air.rot) + 30) / 180);
            const pts = Math.round(100 + 80 * spins + 25 * Math.max(0, air.top));
            S.score += pts; S.airs++;
            w.toast(`${spins ? `Air ${spins * 180}!` : 'Air!'}  +${pts}`); w.sound('boost');
          }
        }
      } else if (!g && S.wasG && w.player.vel[1] > 2.5 && s > D * 0.6 && S.t - S.airT > 2) {
        S.air = { k: w.ticks, rot: 0, yaw, top: 0 };
        if (w.player.vel[1] < POP) w.player.launch(POP); // the wave's lift: off its upper face, a jump really flies
      }
      S.wasG = g;
      // cutbacks: from heading down the reef to back toward the curl, on the face, within 1.2 s
      S.headHist.push(Math.sin(yr)); if (S.headHist.length > 72) S.headHist.shift();
      if (nearFace && Math.sin(yr) < -0.35 && S.t - S.cutT > 1.5 && S.headHist.some((h) => h > 0.55)) {
        S.cutT = S.t; S.score += 60 * S.mult; S.headHist.length = 0; w.toast(`Cutback  +${60 * S.mult}`); w.sound('blip');
      }
      // the line under the world's name: the score, and what is happening
      S.tag = inTube ? 'IN THE BARREL' : dx < 3 ? 'the curl is on you!' : pocket ? 'POCKET x2' : dx > 35 ? 'get back to the pocket' : '';
      if (++S.objT >= 6) { S.objT = 0; objective(`Ride ${fmt(S.score)}${S.tag ? ' · ' + S.tag : ''}`); }
    });

    // ---- what is drawn: the sea, the Giant, its lip, foam and streaks, the jet ski ----
    const hash = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    const lerpC = (a, b, f) => new T.Color(a).lerp(new T.Color(b), f);
    // the sea: a faceted swell, lighter over the lagoon's sand, deep blue beyond the wave
    const sea = (() => {
      const geo = new T.PlaneGeometry(1700, 940, 85, 47);
      geo.rotateX(-Math.PI / 2); geo.translate(170, 0, 43 - 470);
      const pos = geo.attributes.position, n = pos.count, base = Float32Array.from(pos.array), col = new Float32Array(n * 3), amp = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const z = base[i * 3 + 2];
        const c = z > ZT + 10 ? lerpC('#3fb8c8', '#7ee0dc', Math.min(1, (z - ZT - 10) / 50)) : z > ZT - D - 60 ? new T.Color('#2a9fc0') : lerpC('#2a9fc0', '#1d6fa0', Math.min(1, (ZT - D - 60 - z) / 200));
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        amp[i] = z > ZT + 12 ? 0.07 : z > ZT - D - 70 ? 0.12 : 0.7;
      }
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.3, metalness: 0 }));
      mesh.position.y = -0.04; mesh.receiveShadow = true; w.add(mesh);
      return { pos, base, amp, n };
    })();
    // the Giant: one strip from in front of the trough, up the face, over the crest and down the back
    const XA = X0 - 60, XB = X1 + 50, NC = Math.round((XB - XA) / 3) + 1;
    const PROF = [[-12, -0.3], [-4, -0.12], [0, 0.04]];
    for (let k = 1; k <= 12; k++) { const s = (D * k) / 12; PROF.push([s, faceY(s) + 0.05]); }
    PROF.push([D + 1.2, H + 1.0], [D + 4, H + 0.7], [D + 14, H - 5.5], [D + 34, H - 16], [D + 62, -0.3]);
    const NP = PROF.length;
    const FACE_COL = (j) => { // trough blue to aqua high up, a white crest, a darker back
      const [s] = PROF[j];
      if (s > D + 2) return new T.Color('#1e88ae');
      if (s >= D) return new T.Color('#e9fbfb');
      const f = Math.max(0, s) / D;
      return f < 0.5 ? lerpC('#1580ab', '#27b0c8', f * 2) : lerpC('#27b0c8', '#58d6d4', (f - 0.5) * 2);
    };
    const grid = (np, colorOf, side) => {
      const pos = new Float32Array(NC * np * 3), col = new Float32Array(NC * np * 3), idx = [];
      for (let i = 0; i < NC; i++) for (let j = 0; j < np; j++) { const c = colorOf(j); col[(i * np + j) * 3] = c.r; col[(i * np + j) * 3 + 1] = c.g; col[(i * np + j) * 3 + 2] = c.b; }
      for (let i = 0; i < NC - 1; i++) for (let j = 0; j < np - 1; j++) { const a = i * np + j, b = a + np; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setIndex(idx);
      const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.28, metalness: 0, side }));
      mesh.frustumCulled = false; mesh.receiveShadow = true; w.add(mesh);
      return { geo, pos: geo.attributes.position };
    };
    const face = grid(NP, FACE_COL, T.FrontSide);
    // the lip: an arch thrown from the crest to where it lands (landS: the same line the ride's barrel and lip use); a
    // small feather of it all along the wave, the full arch where the wave is breaking
    const LU = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.88, 1];
    const LIP_COL = ['#f2fdfc', '#c8f4f0', '#8be6e0', '#6fdcd8', '#7fe2dd', '#b4efeb', '#e6fbfa', '#ffffff'];
    const lip = grid(LU.length, (j) => new T.Color(LIP_COL[j]), T.DoubleSide);
    // whitewater: a frothy band over the broken face behind the break (tucked under the face elsewhere), lumps of foam
    // where the lip lands and along the band's front, and streaks of water running up the unbroken face
    const FS = [-14, -9, -4, 0, 0.12 * D, 0.26 * D, 0.42 * D, 0.58 * D], FT = [0.3, 1.5, 2.3, 2.6, 2.4, 2.0, 1.4, 0.15];
    const FOAM_COL = ['#d8f6f4', '#f4fdfd', '#ffffff', '#f7fdfd', '#ffffff', '#eefbfb', '#f9fefe', '#d7f3f1'];
    const soup = grid(FS.length, (j) => new T.Color(FOAM_COL[j]), T.FrontSide);
    const FOAM = 56, foam = new T.InstancedMesh(new T.IcosahedronGeometry(1, 0), new T.MeshStandardMaterial({ color: '#f7fdff', flatShading: true, roughness: 0.6 }), FOAM);
    foam.frustumCulled = false; w.add(foam);
    const STREAKS = 90, streaks = new T.InstancedMesh(new T.BoxGeometry(0.22, 0.05, 3.2), new T.MeshBasicMaterial({ color: '#e8fbff', transparent: true, opacity: 0.55 }), STREAKS);
    streaks.frustumCulled = false; w.add(streaks);
    const M4 = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), V = new T.Vector3(), SC = new T.Vector3();
    let vxp = X0 - 200, vfade = 0; // the break as drawn: it follows a ride, then runs on to the end and the wave reforms
    const ends = (x) => { // rising out of the sea at the peak, fading past the channel
      const k = x < X0 ? Math.max(0, Math.min(1, (x - XA) / (X0 - XA))) : x > X1 ? Math.max(0, 1 - (x - X1) / (XB - X1)) : 1;
      return k * k * (3 - 2 * k);
    };
    const broken = (x) => Math.max(0, Math.min(1, (vxp - x) / 10)) * vfade; // 1 where the wave has broken
    const height = (x) => ends(x) * (1 - 0.5 * Math.max(0, Math.min(1, (vxp - x) / 35)) * vfade); // ... and lower there
    w.on('frame', (dt, time) => {
      // the sea's swell
      for (let i = 0; i < sea.n; i++) {
        const x = sea.base[i * 3], z = sea.base[i * 3 + 2];
        sea.pos.array[i * 3 + 1] = sea.amp[i] * (Math.sin(0.035 * x + 0.06 * z - 1.1 * time) + 0.5 * Math.sin(0.07 * x - 0.03 * z + 0.7 * time));
      }
      sea.pos.needsUpdate = true;
      // the break as drawn
      if (S.state === 'ride') { vxp = S.xp; vfade = Math.min(1, vfade + dt * 2); }
      else if (vfade > 0) { vxp += 14 * dt; if (vxp > XB + 60) vfade = Math.max(0, vfade - dt / 3); }
      // the face, crest and back; the lip; the whitewater
      const fp = face.pos.array, lp = lip.pos.array, sp = soup.pos.array;
      for (let i = 0; i < NC; i++) {
        const x = XA + i * 3, k = height(x), bk = broken(x);
        for (let j = 0; j < NP; j++) {
          const [s, y] = PROF[j], o = (i * NP + j) * 3;
          const wob = j >= 12 && j <= 15 ? 0.25 * Math.sin(x * 0.21 + time * 1.7 + j) : 0;
          fp[o] = x; fp[o + 1] = y * k + wob; fp[o + 2] = ZT - s;
        }
        const dx = x - vxp, t = vfade > 0 ? (dx < 0 ? 0 : throwAt(x, dx)) * vfade + FEATHER * (1 - vfade) : FEATHER;
        const tt = Math.max(0.01, t), spray = 0.3 * Math.sin(time * 3 + x * 0.4);
        const sL = landS(tt), yL = faceY(sL) + 0.4, f = Math.min(1, tt / THROW_MAX), bulge = 0.3 * (H + 1 - yL) * f + 0.8;
        for (let j = 0; j < LU.length; j++) {
          const u = LU[j], o = (i * LU.length + j) * 3;
          const ls = D + 1.2 + (sL - D - 1.2) * u, ly = H + 1 + (yL - H - 1) * u + 4 * bulge * u * (1 - u) + spray * u * (1 - u) * 2;
          lp[o] = x; lp[o + 1] = ly * k; lp[o + 2] = ZT - ls;
        }
        const thin = Math.max(0.3, Math.min(1, 1 - (vxp - x - 50) / 70));
        for (let j = 0; j < FS.length; j++) {
          const s = FS[j], o = (i * FS.length + j) * 3, base = faceY(Math.max(0, s)) * k;
          const lift = bk > 0 ? bk * thin * (FT[j] + 0.45 * Math.sin(x * 0.37 + time * 2.1 + j * 1.3)) : -0.4;
          sp[o] = x; sp[o + 1] = base + lift; sp[o + 2] = ZT - s + (j < 3 ? bk * 3 : 0);
        }
      }
      face.pos.needsUpdate = true; lip.pos.needsUpdate = true; soup.pos.needsUpdate = true;
      // foam: lumps where the lip lands (low on the face, just behind the break) and along the whitewater's front
      for (let i = 0; i < FOAM; i++) {
        const crash = i < 16, h1 = hash(i, 1), h2 = hash(i, 2), h3 = hash(i, 3);
        const dx = crash ? -h1 * 4 : -2 - h1 * 68, x = vxp + dx;
        const s = crash ? D * (0.05 + 0.35 * h2) : -3 - 9 * h2;
        const r = (crash ? 1.2 + 1.6 * h3 : 0.7 + 1.1 * h3) * (0.85 + 0.15 * Math.sin(time * 2.3 + i));
        const show = vfade > 0.02 && x > XA + 20 && x < XB;
        SC.setScalar(show ? r * vfade : 0.0001);
        V.set(x, faceY(Math.max(0, s)) * height(x) + r * 0.5 + 0.3 * Math.sin(time * 1.7 + i), ZT - s);
        E.set(time * (0.3 + h1), time * (0.2 + h2), 0); Q.setFromEuler(E);
        M4.compose(V, Q, SC); foam.setMatrixAt(i, M4);
      }
      foam.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < STREAKS; i++) {
        const x = X0 + hash(i, 5) * (X1 - X0), f = (time * 0.16 + hash(i, 6)) % 1, s = 2 + f * (D - 6);
        const gone = broken(x) > 0.05, th = Math.atan(s / D);
        SC.set(1, 1, gone ? 0.0001 : Math.sin(f * Math.PI));
        V.set(x, faceY(s) * height(x) + 0.12, ZT - s);
        E.set(th, 0, 0); Q.setFromEuler(E);
        M4.compose(V, Q, SC); streaks.setMatrixAt(i, M4);
      }
      streaks.instanceMatrix.needsUpdate = true;
      // the jet ski: out on the tow, bobbing at the pier otherwise
      const g = jetski.group;
      if (S.state === 'tow') { // ahead of the rider across the lagoon, then peeling off along the trough as they go up
        const f = Math.min(1, (S.towK + 22) / TOW.ticks);
        if (f <= 0.62) { const a = towPos(S.towK + 22), b = towPos(S.towK + 23); g.position.set(a[0], 0.15, a[2]); g.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]); }
        else { const e = (f - 0.62) / 0.38; g.position.set(TOW.mid[0] + 30 * e, 0.15, TOW.mid[2] + 4 + 14 * e * e); g.rotation.y = Math.atan2(30, 28 * e + 1); }
      } else { g.position.set(JET[0], JET[1] + 0.06 * Math.sin(time * 1.6), JET[2]); g.rotation.y = Math.PI + 0.05 * Math.sin(time); }
    });
  },
};
