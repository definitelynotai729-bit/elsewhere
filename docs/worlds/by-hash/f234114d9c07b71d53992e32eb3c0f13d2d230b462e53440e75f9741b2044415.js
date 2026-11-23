// Glowcave: a dark cavern under everything, lit by crystals, glowcaps and lantern light.
// Take a lantern, bounce up the mushroom grove, thread the Murk by its crystal trail, cross
// Mirror Lake, then glide the Great Chasm (with Skyreach's glider) to the Shrine of the Deep.
// Spring boots open a harder way over: the Old Stair. Lantern light wakes hidden moss.
const LANTERN = [
  { s: 'torus', r: 0.06, tube: 0.012, pos: [0, 0.03, 0], color: '#4a4f66', metal: 0.7 },
  { s: 'cone', r: 0.1, h: 0.07, pos: [0, -0.04, 0], color: '#4a4f66', metal: 0.7 },
  { s: 'cyl', r: 0.1, h: 0.03, pos: [0, -0.085, 0], color: '#4a4f66', metal: 0.7 },
  { s: 'cyl', r: 0.085, h: 0.2, pos: [0, -0.19, 0], color: '#ffe3a3', glow: 0.8, opacity: 0.45 },
  { s: 'sphere', r: 0.055, pos: [0, -0.19, 0], color: '#ffc45c', glow: 3 },
  { s: 'box', size: [0.018, 0.2, 0.018], pos: [0.085, -0.19, 0], color: '#4a4f66', metal: 0.7 },
  { s: 'box', size: [0.018, 0.2, 0.018], pos: [-0.085, -0.19, 0], color: '#4a4f66', metal: 0.7 },
  { s: 'box', size: [0.018, 0.2, 0.018], pos: [0, -0.19, 0.085], color: '#4a4f66', metal: 0.7 },
  { s: 'box', size: [0.018, 0.2, 0.018], pos: [0, -0.19, -0.085], color: '#4a4f66', metal: 0.7 },
  { s: 'cyl', r: 0.11, h: 0.035, pos: [0, -0.305, 0], color: '#4a4f66', metal: 0.7 },
];

export default {
  id: 'glowcave',
  name: 'Glowcave',
  author: 'elsewhere',
  version: 1,
  blurb: 'A glowing cavern under everything. Bring a light, follow the crystals, glide the Deep.',
  color: '#3dffc5',
  spawn: { pos: [0, 1.5, 0.5], yaw: 180 },
  killY: -22,
  rules: { deny: ['board'] }, // gliders, spring boots and lanterns all work down here
  theme: {
    skyTop: '#020409', skyHorizon: '#04090e', skyBottom: '#010204', skySharp: 0.6,
    sunDir: [0.2, 0.95, -0.25], sunColor: '#000000', sunSize: 1, sunLight: '#5470ff', sunIntensity: 0,
    hemiSky: '#5a92b8', hemiGround: '#3a2458', hemiIntensity: 1.1,
    fog: [16, 95], fogColor: '#04090e', stars: 0, bloom: 0.8, exposure: 1.2,
  },
  music: { root: 52, scale: 'phrygian', bpm: 56, progression: [0, 1, 0, 6], sparkle: 0.14, bright: 900, wave: 'sine' },
  items: {
    lantern: { name: 'Lantern', slot: 'hand', traits: ['light'], rarity: 'common',
      desc: 'A Glowcave lantern. Lights the dark around you in any world that allows light.', look: LANTERN },
    'sigil-deep': { name: 'Sigil of the Deep', slot: null, traits: ['key'], rarity: 'legendary',
      desc: 'One of three sigils that open the Vault in Junction.',
      look: [{ s: 'oct', r: 0.32, color: '#3dffc5', glow: 2.4 }, { s: 'torus', r: 0.48, tube: 0.03, rot: [90, 0, 0], color: '#3dffc5', glow: 1.8 }] },
  },

  build(w) {
    const C = {
      rock: '#2a3243', rock2: '#333c50', rock3: '#20263a', floor: '#2b3245', floor2: '#394259', bed: '#121824',
      stem: '#7d7a9e', teal: '#3dffc5', cyan: '#5fe8ff', violet: '#a97dff', pink: '#ff5fcf', amber: '#ffc46b', water: '#0d5a66',
    };
    // wet dark rock in flat colour (ART.md): faceted, a little glossy so lights glint off it. Colours stay dark.
    const ROCK = { flat: true, rough: 0.5 }, FLOOR = { rough: 0.65 };
    const STONES = { [C.rock]: ROCK, [C.rock2]: ROCK, [C.rock3]: ROCK, [C.bed]: ROCK, [C.floor]: FLOOR, [C.floor2]: FLOOR };
    const box = (x0, x1, y0, y1, z0, z1, color, o) => w.box(Object.assign({ pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], size: [x1 - x0, y1 - y0, z1 - z0], color: color || C.rock }, STONES[color || C.rock], o));
    const lumen = [], caps = [], shadows = [], own = [];
    const own1 = (h) => { const m = h.mesh.material.clone(); h.mesh.material = m; own.push(m); return m; };

    // ---------- decoration helpers (static parts merge into a few draw calls) ----------
    // a crystal shard: a stretched icosahedron; tx/tz tilt it (degrees). To lean it by t toward direction a (radians,
    // measured from +x toward +z) use tx = t*sin(a), tz = -t*cos(a).
    const shard = (x, y, z, len, thick, color, glow, tx = 0, tz = 0, ry = 0) => {
      const h = w.sphere({ pos: [x, y, z], radius: 1, low: true, rot: [tx, ry, tz], color, glow, collide: false });
      h.mesh.scale.set(thick, len, thick);
      return h;
    };
    const cluster = (x, y, z, s, color, seed, n = 5) => {
      const r = w.rand(seed);
      shard(x, y + 0.55 * s, z, 1.0 * s, 0.24 * s, color, 2.2, (r() - 0.5) * 14, (r() - 0.5) * 14, 0);
      for (let i = 1; i < n; i++) {
        const a = r() * Math.PI * 2, d = (0.22 + r() * 0.3) * s, len = (0.4 + r() * 0.45) * s, t = 22 + r() * 26;
        shard(x + Math.cos(a) * d, y + len * 0.42, z + Math.sin(a) * d, len, (0.11 + r() * 0.07) * s, color, 1.7, t * Math.sin(a), -t * Math.cos(a));
      }
      const b = w.sphere(Object.assign({ pos: [x, y, z], radius: 1, low: true, color: C.rock2, collide: false }, ROCK, { tile: 1.6 }));
      b.mesh.scale.set(0.6 * s, 0.22 * s, 0.55 * s);
    };
    // crystals growing out of a wall: dir is the direction they point (radians from +x toward +z)
    const wallCrystals = (x, y, z, s, color, dir, seed) => {
      const r = w.rand(seed);
      for (let i = 0; i < 4; i++) {
        const len = (0.5 + r() * 0.6) * s, t = 50 + r() * 30, a = dir + (r() - 0.5) * 1.2;
        shard(x + (r() - 0.5) * s, y + (r() - 0.5) * s, z + (r() - 0.5) * s, len, (0.12 + r() * 0.08) * s, color, i ? 1.7 : 2.2, t * Math.sin(a), -t * Math.cos(a));
      }
    };
    const shroom = (x, y, z, h, cr, color, cone) => {
      w.cylinder({ pos: [x, y + h / 2, z], radius: Math.max(0.05, cr * 0.16), height: h, sides: 8, color: C.stem, glow: 0.12, collide: false });
      if (cone) {
        w.cone({ pos: [x, y + h + cr * 0.3, z], radius: cr, height: cr * 0.6, color, glow: 1.1, collide: false });
        w.cylinder({ pos: [x, y + h - 0.03, z], radius: cr * 0.82, height: 0.05, sides: 8, color, glow: 2.2, collide: false });
      } else {
        const c = w.sphere({ pos: [x, y + h, z], radius: 1, color, glow: 1.1, collide: false });
        c.mesh.scale.set(cr, cr * 0.5, cr);
      }
    };
    const shroomPatch = (x, y, z, n, seed, colors, spread = 1.4) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = r() * spread;
        shroom(x + Math.cos(a) * d, y, z + Math.sin(a) * d, 0.25 + r() * 0.7, 0.18 + r() * 0.35, r.pick(colors), true);
      }
    };
    // rocky lumps along a wall face so rooms read as caves: axis 'x' = face at x=c spanning z a0..a1; dir = side the room is on
    const lumps = (axis, c, dir, a0, a1, y0, y1, n, seed) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const rad = 0.9 + r() * 1.9, a = a0 + r() * (a1 - a0), y = y0 + r() * (y1 - y0), p = 0.2 + r() * 0.55;
        const pos = axis === 'x' ? [c - dir * (rad - p), y, a] : [a, y, c - dir * (rad - p)];
        w.sphere(Object.assign({ pos, radius: rad, low: true, color: r.pick([C.rock, C.rock2, C.rock3]), rot: [r() * 360, r() * 360, 0] }, ROCK));
      }
    };
    // ceiling: stalactites (some with glowing drips) and glowworm threads
    const ceiling = (x0, x1, z0, z1, y, n, worms, seed) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), len = 1.5 + r() * 4.5, rad = 0.3 + r() * 0.9;
        w.cone(Object.assign({ pos: [x, y - len / 2, z], radius: rad, height: len, rot: [180, 0, 0], color: r.pick([C.rock, C.rock3]), collide: false }, ROCK, { tile: 2 }));
        if (r() < 0.4) w.sphere({ pos: [x, y - len - 0.06, z], radius: 0.1, low: true, color: r.pick([C.teal, C.cyan, C.violet]), glow: 2.6, collide: false });
      }
      for (let i = 0; i < worms; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), len = 0.4 + r() * 2.6;
        w.cylinder({ pos: [x, y - len / 2, z], radius: 0.01, height: len, sides: 6, color: '#1d3a44', glow: 0.5, collide: false });
        w.sphere({ pos: [x, y - len, z], radius: 0.06, low: true, color: '#aef8ff', glow: 3, collide: false });
      }
    };
    const stalagmites = (x0, x1, z0, z1, y, n, seed) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), len = 1 + r() * 3.5, rad = 0.3 + r() * 0.6;
        w.cone(Object.assign({ pos: [x, y + len / 2 - 0.1, z], radius: rad, height: len, color: r.pick([C.rock, C.rock2]) }, ROCK, { tile: 2 }));
      }
    };
    // glowing moss: little clusters of luminous dots on the floor
    const moss = (x0, x1, z0, z1, y, n, seed, colors) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), col = r.pick(colors), k = 5 + Math.floor(r() * 7), spread = 0.3 + r() * 0.6;
        for (let j = 0; j < k; j++) w.sphere({ pos: [x + (r() - 0.5) * spread * 2, y + 0.02, z + (r() - 0.5) * spread * 2], radius: 0.03 + r() * 0.045, low: true, color: col, glow: 2.6, collide: false });
      }
    };
    const pebbles = (x0, x1, z0, z1, y, n, seed) => {
      const r = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const s = 0.12 + r() * 0.35;
        const p = w.sphere(Object.assign({ pos: [x0 + r() * (x1 - x0), y, z0 + r() * (z1 - z0)], radius: 1, low: true, color: r.pick([C.rock2, C.floor2]), collide: false, rot: [0, r() * 360, 0] }, ROCK, { tile: 1 }));
        p.mesh.scale.set(s * 1.3, s * 0.6, s);
      }
    };
    // small teal crystals marking the way
    const crumb = (x, y, z, seed = 1) => { const r = w.rand(seed * 31 + 7); shard(x, y + 0.22, z, 0.42, 0.11, C.teal, 2.2, (r() - 0.5) * 30, (r() - 0.5) * 30); shard(x + 0.14, y + 0.12, z - 0.1, 0.22, 0.07, C.teal, 2.2, 25, -20); };
    const crumbLine = (a, b, n, side = 1.6, seed = 1) => {
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1), s = i % 2 ? side : -side;
        const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1;
        crumb(a[0] + dx * t + (-dz / l) * s, a[1] + (b[1] - a[1]) * t, a[2] + dz * t + (dx / l) * s, seed + i);
      }
    };
    const coin = (id, x, y, z, gem) => w.coin({ id, pos: [x, y, z], kind: gem ? 'gem' : undefined, value: gem ? 2 : 1 });

    // ---------- glowcaps: springy mushrooms (a jump pad with a mushroom body) ----------
    const glowcap = (x, y0, z, o = {}) => {
      const r = o.r || 1.3, color = o.color || C.pink, power = o.power || 18, push = o.push || [0, 0, 0];
      const top = y0 + 0.42, id = 'gc' + caps.length;
      const dome = w.sphere({ id: id + 'd', pos: [x, top - r * 0.38 + 0.05, z], radius: 1, color, glow: 0.9, collide: false, shadow: false });
      dome.mesh.scale.set(r, r * 0.38, r);
      own1(dome).color.multiplyScalar(0.3); // dark body, bright glow: lantern light should not wash it out
      const disc = w.cylinder({ id: id + 'c', pos: [x, top - 0.2, z], radius: r * 0.82, height: 0.4, color, shadow: false });
      disc.mesh.visible = false; // the collider; the dome is what you see
      w.cylinder({ pos: [x, y0 + 0.03, z], radius: r * 1.08, height: 0.06, color, glow: 2.6, collide: false });
      w.particles({ pos: [x, top, z], area: [r * 1.3, 4.5, r * 1.3], count: 10, color: [color, '#ffffff'], size: 0.12, kind: 'rise', speed: 1.6 });
      const cap = { dome, r, t: 9 };
      caps.push(cap);
      let cool = 0;
      w.zone({ pos: [x, top + 0.9, z], size: [r * 1.7, 1.4, r * 1.7], onStay: () => {
        if (cool > w.time || w.player.vel[1] > 2) return;
        cool = w.time + 0.25;
        w.player.launch(power, push[0], push[2]);
        w.sound('pad');
        w.burst([x, top + 0.2, z], { color: [color, '#ffffff'], count: 18, speed: 5, life: 0.6 });
        cap.t = 0;
      } });
      return cap;
    };
    // giant mushroom you can stand on: a rim and a shallow cone top (both collide), glowing underside and spots
    const giant = (x, y0, z, top, cr, color, under, seed) => {
      w.cylinder({ pos: [x, (y0 + top - 0.6) / 2, z], radius: cr * 0.2, height: top - 0.6 - y0, color: C.stem, glow: 0.2 });
      w.cylinder({ pos: [x, top - 0.3, z], radius: cr, height: 0.6, color, glow: 0.55 });
      w.cone({ pos: [x, top + 0.25, z], radius: cr, height: 0.5, color, glow: 0.55 });
      const u = w.sphere({ pos: [x, top - 0.05 - cr * 0.3, z], radius: 1, color: under, glow: 1.0, collide: false }); // stays below the cap top
      u.mesh.scale.set(cr * 0.97, cr * 0.3, cr * 0.97);
      w.cylinder({ pos: [x, top - 0.56, z], radius: cr + 0.04, height: 0.08, color: under, glow: 2.6, collide: false });
      const r = w.rand(seed);
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2, d = 0.6 + r() * (cr - 1.1);
        w.sphere({ pos: [x + Math.cos(a) * d, top + 0.5 * (1 - d / cr), z + Math.sin(a) * d], radius: 0.1 + r() * 0.12, low: true, color: '#ffe9ff', glow: 1.8, collide: false });
      }
    };
    const onCap = (gx, gz, top, cr, x, z) => top + 0.5 * (1 - Math.hypot(x - gx, z - gz) / cr); // surface height of a giant cap
    // lumen moss: dark until a lantern comes near, then it lights up
    const lumenMoss = (h, x, y, z) => { const m = own1(h); m.emissiveIntensity = 0.03; lumen.push({ m, x, y, z }); };
    // a stone in the lake: rock body down to the lakebed, glowing moss ring at the top
    const stone = (x, top, z, r, rim, hidden) => {
      w.cylinder(Object.assign({ pos: [x, (top - 4.5) / 2, z], radius: r, height: top + 4.5, color: C.rock2 }, ROCK, { tile: 2 }));
      const ring = w.cylinder({ id: hidden ? 'hs' + x + z : undefined, pos: [x, top - 0.12, z], radius: r + 0.07, height: 0.12, color: rim || C.teal, glow: 1.2, collide: false, shadow: false });
      if (hidden) lumenMoss(ring, x, top, z);
    };
    // shadow-moss: a curtain that shrinks away from lantern light (a few blobs and drifting spores: cheap to draw)
    const shadowMoss = (x, y, z, sx, sy, sz, seed) => {
      const wall = w.box({ id: 'sm' + seed, pos: [x, y + sy / 2, z], size: [sx, sy, sz], color: '#140c22', rough: 1, shadow: false });
      const r = w.rand(seed), blobs = [], alongX = sx > sz;
      for (let i = 0; i < 4; i++) {
        const u = (i / 3 - 0.5) * Math.max(sx, sz) * 0.75, v = y + 0.9 + r() * (sy - 1.6);
        const b = w.sphere({ id: `sm${seed}b${i}`, pos: alongX ? [x + u, v, z] : [x, v, z + u], radius: 1, color: r.pick(['#2a1745', '#22123a']), glow: 0.45, collide: false, shadow: false });
        const k = [0.9 + r() * 0.5, 1.2 + r() * 0.6, 0.9 + r() * 0.5];
        b.mesh.scale.set(alongX ? k[0] : 0.75, k[1], alongX ? 0.75 : k[2]);
        blobs.push({ m: b.mesh, k: b.mesh.scale.clone() });
      }
      const spores = w.particles({ pos: [x, y + 0.2, z], area: [sx + 0.4, sy - 0.3, sz + 0.4], count: 40, color: ['#c08cff', '#c08cff', '#ffe066'], size: 0.13, kind: 'float', speed: 2.5 });
      shadows.push({ wall, blobs, spores, x, y: y + sy / 2, z, open: false, t: 0, nag: 0 });
    };

    // ======================================================================
    // 0. THE MOUTH: entrance hall, lantern stand, guide, portal home
    // ======================================================================
    box(-13, 13, -2, 0, -16, 16, C.floor);
    box(-15, -13, -2, 16, -16, 16);
    box(13, 15, -2, 16, -16, -8); box(13, 15, -2, 16, -4, 16); box(13, 15, 4, 16, -8, -4);
    box(-15, 15, -2, 16, 14, 16);
    box(-15, -3, -2, 16, -16, -14); box(3, 15, -2, 16, -16, -14); box(-3, 3, 6, 16, -16, -14);
    box(-15, 15, 15, 17, -16, 16, C.rock3);
    lumps('x', -13, 1, -13, 13, 0, 13, 22, 11);
    lumps('x', 13, -1, 0, 13, 0, 13, 12, 12); lumps('x', 13, -1, -13, -9, 0, 13, 5, 13); lumps('x', 13, -1, -9, 0, 5, 13, 5, 14);
    lumps('z', 14, -1, -12, 12, 0, 13, 16, 15);
    lumps('z', -14, 1, -12, -4, 0, 13, 8, 16); lumps('z', -14, 1, 4, 12, 0, 13, 8, 17); lumps('z', -14, 1, -3, 3, 7.5, 13, 3, 18);
    ceiling(-12, 12, -13, 13, 15, 14, 60, 19);
    stalagmites(-12, -8, -12, 12, 0, 5, 20); stalagmites(8, 12, 0, 12, 0, 4, 21);
    moss(-11, 11, -12, 12, 0, 26, 22, [C.teal, C.cyan, C.violet]);
    pebbles(-12, 12, -13, 13, 0, 40, 23);
    // the shadow-moss alcove (east wall): a gem for whoever brings a light
    box(13, 18, -2, 0, -8, -4, C.floor);
    box(18, 20, -2, 5, -10, -2); box(13, 20, -2, 5, -10, -8); box(13, 20, -2, 5, -4, -2); box(13, 20, 4, 6, -10, -2);
    lumps('x', 18, -1, -7.8, -4.2, 0, 4, 4, 241); lumps('z', -8, 1, 13.5, 18, 2.5, 4, 3, 242); lumps('z', -4, -1, 13.5, 18, 2.5, 4, 3, 243);
    cluster(16.8, 0, -7, 0.9, C.violet, 24); cluster(17, 0, -4.8, 0.7, C.cyan, 25);
    coin('e4', 16, 1.3, -6, true);
    shadowMoss(13.15, 0, -6, 0.9, 4, 4, 26);
    // portal home, glowing crystals around the hall
    w.portal({ pos: [0, 0, 10.5], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Back to the crossroads', arrive: 10 }); // arrive far enough out that the camera is not inside the portal
    cluster(-10, 0, 9.5, 1.5, C.teal, 27); cluster(10.5, 0, 10, 1.3, C.violet, 28); cluster(-11, 0, -10.5, 1.6, C.cyan, 29); cluster(11, 0, -11, 1.3, C.teal, 30);
    cluster(-4, 0, -12.6, 1.1, C.teal, 31); cluster(4, 0, -12.6, 1.1, C.teal, 32);
    shroomPatch(-10.5, 0, 3, 7, 33, [C.pink, C.violet]); shroomPatch(10.5, 0, 4, 6, 34, [C.teal, C.cyan]); shroomPatch(-9, 0, -6, 5, 35, [C.violet, C.cyan]);
    // the lantern stand
    const IRON = { metal: 0.5, rough: 0.5 };
    w.cylinder({ pos: [1, 0.06, -3.5], radius: 1.1, height: 0.12, sides: 8, color: '#3a4152' });
    w.cylinder({ pos: [1, 0.1, -3.5], radius: 1.14, height: 0.03, sides: 8, color: C.amber, glow: 1.4, collide: false });
    box(-2.9, -2.75, 0, 2.6, -3.2, -3.05, '#4a4f66', IRON); box(-1.25, -1.1, 0, 2.6, -3.2, -3.05, '#4a4f66', IRON);
    box(-3, -1, 2.45, 2.6, -3.2, -3.05, '#4a4f66', IRON);
    [-2.6, -2, -1.4].forEach((x) => { // hanging lanterns (static parts, so they merge)
      w.cylinder({ pos: [x, 2.3, -3.12], radius: 0.015, height: 0.3, sides: 6, color: '#4a4f66', collide: false });
      w.cone({ pos: [x, 2.1, -3.12], radius: 0.16, height: 0.11, color: '#4a4f66', metal: 0.6, collide: false });
      w.cylinder({ pos: [x, 1.88, -3.12], radius: 0.13, height: 0.32, sides: 8, color: '#ffc46b', glow: 1.3, collide: false });
      w.cylinder({ pos: [x, 1.7, -3.12], radius: 0.17, height: 0.05, sides: 8, color: '#4a4f66', metal: 0.6, collide: false });
    });
    // the next step, with a marker on where it is (UI only): the lantern, each beacon in turn, the sigil, the portal home
    const AT = { lantern: [1, 2.6, -3.5], grove: [-5, 13.6, -49.5], murk: [12, 13.6, -88], lake: [17.5, 2.6, -117], shore: [-7, 3.1, -151], brink: [-6, 11.6, -160], sigil: [0, 3.6, -216], home: [0, 2.6, -228] };
    // a first-timer without a glider learns at the start, not at the chasm, that the far end needs one
    const gliderNote = () => { if (!w.has('glider') && !w.has('springboots') && !w.has('sigil-deep')) w.after(5, () => w.toast('Heads-up: the Deep ends at a chasm only a glider crosses. Skyreach keeps one at its summit.')); };
    w.pickup({ pos: [1, 1.25, -3.5], item: 'lantern', scale: 2.2, onPick: () => { // just ahead and right of the spawn: in view, and on the way
      if (!w.player.canUse('light')) w.equip('lantern');
      w.objective('Follow the teal crystals into the Deep.', { at: AT.grove });
      w.toast('Lantern lit. Shadow-moss shrinks from its light, and some moss only shows itself to it.');
      gliderNote();
    } });
    w.light({ pos: [0, 6, -2], color: '#86f7dc', intensity: 26, distance: 26 });
    w.sign({ pos: [5.2, 0, -5], yaw: -35, title: 'GLOWCAVE', width: 3.4, text: 'Take a lantern from the stand: it lights the dark. Then follow the teal crystals into the Deep.' });
    w.npc({ pos: [-4.6, 0, -0.8], yaw: 120, name: 'Fenn', colors: { body: '#2f7f6d', head: '#e9fff7', visor: '#3dffc5' }, hat: 'cap', hand: 'lantern', onTalk: async () => {
      const lines = [];
      if (!w.flag('met.fenn')) {
        w.setFlag('met.fenn', true);
        lines.push('Mind the step, traveller. Welcome to Glowcave.', 'Down here the light grows on the walls: crystals, glowcaps, moss. Beautiful, and very dark in between.');
      }
      lines.push(w.player.canUse('light') ? 'Good, your lantern is lit. Hold it close to the walls: some moss only shows itself to lantern light, and shadow-moss shrinks away from it.'
        : w.has('lantern') ? 'Your lantern is packed away. Press I and hold it. You will want it.'
          : 'Take a lantern from the stand. It lights the dark around you, here and in any world that allows light.');
      lines.push('Follow the teal crystals. They lead up the grove, through the Murk and over Mirror Lake to the Great Chasm.');
      lines.push(w.player.canUse('glide') ? 'And you carry a glider! At the chasm: run, jump off the lip and hold Space. The Shrine of the Deep waits on the far side.'
        : w.has('glider') ? 'You have a glider in your pack. Wear it on your back before the chasm: nobody jumps that gap.'
          : 'One warning: nobody jumps the Great Chasm. Fliers glide it. Skyreach, through Junction, keeps a glider at its summit.');
      if (w.player.canUse('doublejump') && !w.player.canUse('glide')) lines.push('Spring boots, eh? There is an old crystal stair beside the chasm. Two jumps per pillar, and a steady nerve.');
      const best = w.store.get('best', null);
      if (best) lines.push(`Your best run from this hall to the shrine: ${w.fmtTime(best)}.`);
      await w.say('Fenn', lines);
    } });
    w.particles({ pos: [0, 0.3, 0], area: [24, 7, 26], count: 45, color: ['#ffd27a', C.teal], size: 0.11, kind: 'float', speed: 0.6 });
    coin('e1', 0.8, 1.1, -6); coin('e2', -0.6, 1.1, -9); coin('e3', 0.4, 1.1, -12);

    // tunnel to the grove (the run clock starts here)
    box(-3, 3, -2, 0, -23, -14, C.floor);
    box(-5, -3, -2, 8, -23, -14); box(3, 5, -2, 8, -23, -14); box(-5, 5, 6, 8, -23, -14, C.rock3);
    lumps('x', -3, 1, -22, -15, 0, 5.5, 5, 38); lumps('x', 3, -1, -22, -15, 0, 5.5, 5, 39);
    crumbLine([0, 0, -15], [0, 0, -21], 3, 2.1, 40);
    let started = false, finished = false;
    w.zone({ pos: [0, 2, -19], size: [6, 4, 3], onEnter: () => { if (started || finished) return; started = true; w.timer.start(); } });

    // ======================================================================
    // 1. THE GROVE: bounce up the glowcaps to the ledge
    // ======================================================================
    box(-16.5, 16.5, -2, 0, -47, -21, C.floor);
    box(-18, -3, -2, 27, -23, -21); box(3, 18, -2, 27, -23, -21); box(-3, 3, 6, 27, -23, -21);
    box(-19, -16.5, -2, 27, -85, -21); box(16.5, 19, -2, 27, -85, -21);
    box(-19, 19, 26, 28, -47, -21, C.rock3);
    box(-19, 19, -2, 12, -85, -47); // the cliff, and the rock the Murk sits on
    box(-19, 19, 20, 22, -85, -47, C.rock3); box(-19, 19, 22, 26, -48, -47, C.rock3);
    lumps('x', -16.5, 1, -45, -24, 0, 24, 22, 41); lumps('x', 16.5, -1, -46, -37, 0, 24, 8, 42); lumps('x', 16.5, -1, -26, -24, 0, 24, 3, 43);
    lumps('x', 16.5, -1, -37, -24, 12, 24, 6, 44);
    lumps('z', -23, -1, -15, -4, 0, 24, 9, 45); lumps('z', -23, -1, 4, 15, 0, 24, 9, 46);
    lumps('z', -47, 1, -15, 15, 0, 10, 16, 47);
    ceiling(-15, 15, -46, -24, 26, 18, 90, 48);
    moss(-15, 15, -46, -24, 0, 30, 49, [C.pink, C.violet, C.teal]);
    pebbles(-15, 15, -46, -24, 0, 40, 50);
    crumbLine([0, 0, -23.2], [0, 0, -24.6], 2, 1.8, 51);
    // a staircase of giant caps straight ahead; each glowcap throws you mostly forward, so holding W still lands
    giant(-1.5, 0, -33, 4.2, 3.6, '#3d1f66', C.pink, 52);
    giant(0, 0, -42.2, 8.2, 3.8, '#1f2f66', C.violet, 53);
    glowcap(0, 0, -26.5, { color: C.pink, power: 18, push: [-1.4, 0, -6.1] });
    glowcap(-1.5, onCap(-1.5, -33, 4.2, 3.6, -1.5, -34.9), -34.9, { color: C.violet, power: 18, push: [1.4, 0, -6.7] });
    glowcap(0, onCap(0, -42.2, 8.2, 3.8, 0, -44.2), -44.2, { color: C.cyan, power: 18, push: [0, 0, -6] });
    coin('g1', -0.8, 6.6, -30.2); coin('g2', -0.66, 11, -38.9); coin('g3', 0, 15, -47.8);
    coin('g4', -3.2, 5.3, -32); coin('g5', 1.8, 9.3, -41.2);
    w.sign({ pos: [3.2, 0, -24.4], yaw: -25, title: 'GLOWCAPS', width: 2.8, text: 'Step on and up you go.\nHold a direction to steer while you fly.' });
    // decor: mushrooms of every size, a few tall ones in the corners
    shroom(-12, 0, -27, 5, 2.2, C.teal, false); shroom(11.5, 0, -42, 6.5, 2.6, C.pink, true); shroom(-12.5, 0, -40, 7.5, 2.4, C.violet, false);
    shroomPatch(-13, 0, -25, 8, 54, [C.pink, C.violet], 2); shroomPatch(9, 0, -25, 8, 55, [C.teal, C.cyan], 2); shroomPatch(-2, 0, -44, 9, 56, [C.pink, C.teal], 2.5);
    shroomPatch(8, 0, -33, 6, 57, [C.violet, C.pink], 2);
    cluster(-14.5, 0, -46, 1.3, C.violet, 58); cluster(13.8, 0, -45.5, 1.2, C.teal, 59);
    coin('g8', -14.6, 1.3, -43.8, true); // in the dark behind the tall violet cap
    // shelf fungi up the east wall: lumen moss lights each step for a lantern bearer
    [[1.5, -27], [3.0, -30.6], [4.5, -27], [6.0, -30.6], [7.5, -27], [9.0, -30.6]].forEach(([top, z], i) => {
      w.cylinder({ pos: [16.5, top - 0.18, z], radius: 1.7, height: 0.36, color: '#5a4a6e' });
      w.sphere({ pos: [16.5, top - 0.36, z], radius: 1, color: '#3a2c4c', collide: false }).mesh.scale.set(1.65, 0.3, 1.65);
      lumenMoss(w.cylinder({ id: 'shelf' + i, pos: [16.2, top + 0.02, z], radius: 1.35, height: 0.04, sides: 12, color: C.cyan, glow: 1, collide: false, shadow: false }), 15.6, top, z);
    });
    box(13.6, 16.5, 9.9, 10.5, -36.6, -32.4, '#5a4a6e');
    { const r = w.rand(247); for (let i = 0; i < 10; i++) { const z = r.pick([-24.2, -33.4, -35.8, -37.2]), y = 0.5 + r() * 11; w.sphere(Object.assign({ pos: [17.3, y, z + (r() - 0.5)], radius: 1.2 + r() * 0.6, low: true, color: r.pick([C.rock, C.rock2]), collide: false, rot: [r() * 90, r() * 90, 0] }, ROCK)); } }
    lumenMoss(w.box({ id: 'shelftop', pos: [15, 10.52, -34.5], size: [2.6, 0.04, 3.8], color: C.cyan, glow: 1, collide: false }), 15, 10.5, -34.5);
    coin('g6', 15, 11.7, -34, true); coin('g7', 15, 11.7, -35.6);
    wallCrystals(16.3, 12.5, -34.5, 1.2, C.cyan, Math.PI, 60);
    w.light({ pos: [0, 13, -34], color: '#c77dff', intensity: 38, distance: 32 });
    w.particles({ pos: [0, 0, -34], area: [32, 22, 24], count: 110, color: [C.pink, C.violet, C.teal], size: 0.13, kind: 'rise', speed: 0.5 });

    // ======================================================================
    // 2. THE MURK: a dark maze; teal crystals mark the way through
    // ======================================================================
    const MAZE = [
      '#####.#####',
      '#...#.....#',
      '#.###.###.#',
      '#.....#.#.#',
      '###.###.###',
      '#.........#',
      '#.#####.#.#',
      '#.....#.#.#',
      '#.###.#.###',
      '#...#.#...#',
      '#########.#',
    ];
    const MX = -16.5, MZ = -52, T = 3, MY = 12, WH = 4.5;
    const tile = (c, r) => [MX + T * c + T / 2, MZ - T * r - T / 2];
    MAZE.forEach((row, r) => {
      for (let c = 0; c < row.length;) {
        if (row[c] !== '#') { c++; continue; }
        let e = c;
        while (e + 1 < row.length && row[e + 1] === '#') e++;
        box(MX + T * c, MX + T * (e + 1), MY, MY + WH, MZ - T * (r + 1), MZ - T * r, r % 2 ? C.rock : C.rock2);
        c = e + 1;
      }
    });
    { // rock skin over the box walls, and rough tops (decoration; the boxes do the colliding)
      const r = w.rand(61);
      MAZE.forEach((row, ri) => [...row].forEach((ch, ci) => {
        if (ch !== '#') return;
        const [x, z] = tile(ci, ri);
        for (const y of [MY + 1.1, MY + 3.2]) {
          const h = w.sphere(Object.assign({ pos: [x + (r() - 0.5) * 0.3, y + (r() - 0.5) * 0.6, z + (r() - 0.5) * 0.3], radius: 1, low: true, color: r.pick([C.rock, C.rock2, C.rock3]), collide: false, rot: [r() * 40, r() * 360, r() * 40] }, ROCK));
          h.mesh.scale.set(1.9, 1.3 + r() * 0.3, 1.9); // icosahedron faces sit at 0.79 of the radius
        }
        if (r() < 0.6) {
          const s = 1 + r() * 0.9;
          const h = w.sphere(Object.assign({ pos: [x + (r() - 0.5), MY + WH, z + (r() - 0.5)], radius: 1, low: true, color: r.pick([C.rock, C.rock3]), collide: false, rot: [0, r() * 360, 0] }, ROCK));
          h.mesh.scale.set(s, s * 0.55, s);
        }
      }));
    }
    // the way through, found by search so the trail always matches the walls
    const open = (c, r) => r >= 0 && r < MAZE.length && c >= 0 && c < MAZE[0].length && MAZE[r][c] !== '#';
    const prev = { '5,0': null }, queue = [[5, 0]];
    while (queue.length) {
      const [c, r] = queue.shift();
      if (c === 9 && r === 10) break;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${c + dc},${r + dr}`;
        if (open(c + dc, r + dr) && !(k in prev)) { prev[k] = [c, r]; queue.push([c + dc, r + dr]); }
      }
    }
    const way = [];
    for (let k = [9, 10]; k; k = prev[`${k[0]},${k[1]}`]) way.unshift(k);
    for (let i = 1; i < way.length; i++) {
      const [x0, z0] = tile(...way[i - 1]), [x1, z1] = tile(...way[i]);
      const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), s = i % 2 ? 1.05 : -1.05;
      crumb((x0 + x1) / 2 + (-dz / l) * s, MY, (z0 + z1) / 2 + (dx / l) * s, 70 + i);
    }
    // dead ends keep their own treasures
    [['m1', 9, 3, true], ['m2', 3, 9, true], ['m3', 9, 7, true], ['m4', 3, 1], ['m5', 5, 9], ['m6', 7, 3], ['m7', 3, 5], ['m8', 7, 7]].forEach(([id, c, r, gem]) => {
      const [x, z] = tile(c, r); coin(id, x, MY + 1.2, z, gem);
    });
    [[9, 3, C.violet], [3, 9, C.cyan], [9, 7, C.violet]].forEach(([c, r, col], i) => {
      const [x, z] = tile(c, r); cluster(x + 0.9, MY, z + 0.9, 0.6, col, 90 + i, 4);
    });
    ceiling(-16, 16, -84, -48, 20, 10, 50, 62);
    // the ledge before the Murk
    w.checkpoint({ id: 'grove', pos: [-5, 12, -49.5], yaw: 180 });
    w.sign({ pos: [5, 12, -50.4], yaw: 0, title: 'THE MURK', width: 2.8, text: 'Walls you cannot see.\nFollow the teal crystals.\nThe dark corners keep their own treasures.' });
    w.label({ pos: [0, 17.6, -52], text: 'THE MURK', size: 0.6, color: '#c9fff0', border: C.teal });
    crumbLine([0, 12, -48], [0, 12, -51], 2, 1.6, 63);
    cluster(-13.5, 12, -48.5, 1.1, C.teal, 64); cluster(13.5, 12, -49, 1, C.violet, 65);
    w.particles({ pos: [0, 12.3, -68], area: [32, 4, 32], count: 30, color: [C.teal], size: 0.1, kind: 'float', speed: 0.4 });

    // ======================================================================
    // 3. MIRROR LAKE: overlook, ramp down, stones, the lily raft, bobbing stones
    // ======================================================================
    box(8, 22, -6, 12, -91, -85); // overlook
    box(-24, -16.5, -6, 26, -87, -85); box(16.5, 24, 12, 26, -87, -85); box(-16.5, 16.5, 16.5, 26, -87, -85);
    box(-24, -22, -6, 26, -158, -85); box(22, 24, -6, 26, -158, -85);
    box(-24, 24, 24, 26, -158, -85, C.rock3);
    box(-22, 22, -6, -4, -147, -85, C.bed);
    lumps('x', -22, 1, -146, -88, -1, 20, 28, 101); lumps('x', 22, -1, -146, -122, -1, 20, 12, 102); lumps('x', 22, -1, -112, -92, 13, 22, 6, 103);
    lumps('z', -85, -1, -21, 6, 0, 22, 18, 104);
    ceiling(-21, 21, -146, -88, 24, 22, 150, 105);
    w.checkpoint({ id: 'murk', pos: [12, 12, -88], yaw: 180 });
    w.label({ pos: [0, 9, -112], text: 'MIRROR LAKE', size: 0.6, color: '#d3f6ff', border: C.cyan });
    w.ramp({ pos: [19, 6.5, -102], size: [6, 11, 22], yaw: 0, color: C.floor });
    box(16, 22, -6, 1, -113, -91);
    for (let i = 0; i < 6; i++) { const z = -92.5 - i * 3.8; crumb(16.5, 1 + 11 * (z + 113) / 22, z, 110 + i); }
    crumbLine([12, 12, -86.5], [16, 12, -89.5], 2, 1.2, 116);
    // east beach
    box(10, 22, -6, 1, -121, -113, C.floor);
    w.checkpoint({ id: 'lake', pos: [17.5, 1, -117], yaw: -90 });
    crumbLine([14, 1, -115.5], [11, 1, -119], 2, 1.2, 118);
    shroomPatch(19.5, 1, -119, 7, 119, [C.teal, C.cyan]); cluster(20.5, 1, -114.5, 1.2, C.cyan, 120);
    w.sign({ pos: [13.2, 1, -114.2], yaw: 55, title: 'MIRROR LAKE', width: 2.9, text: 'The water takes you back to the shore.\nThe lily pad ferries you south.\nBobbing stones sink: hop while they are up.' });
    // the crossing
    stone(6.5, 1.0, -118, 1.3); stone(2.5, 1.3, -120.5, 1.2); stone(-1.5, 1.0, -118.5, 1.2); stone(-5.5, 1.2, -121, 1.5);
    coin('l1', 2.5, 2.5, -120.5); coin('l2', -5.5, 2.4, -121);
    const raft = w.mover(w.cylinder({ pos: [-5.5, 0.85, -125.5], radius: 1.8, height: 0.4, color: '#1f7a5c', glow: 0.3 }), { path: [[-5.5, 0.85, -125.5], [-5.5, 0.85, -133.5]], speed: 2.2, pause: 1.0 });
    const raftLook = w.model({ pos: [-5.5, 0.85, -125.5], parts: [
      { s: 'torus', r: 1.78, tube: 0.06, pos: [0, 0.2, 0], rot: [90, 0, 0], color: C.teal, glow: 2.2 },
      { s: 'cone', r: 0.3, h: 0.5, pos: [0.9, 0.45, 0.6], color: C.pink, glow: 2 },
      { s: 'sphere', r: 0.1, pos: [0.9, 0.75, 0.6], color: '#ffffff', glow: 2.5 },
      { s: 'box', size: [1.7, 0.02, 0.06], pos: [-0.9, 0.21, 0], rot: [0, 30, 0], color: '#0f4a39' },
    ] });
    raftLook.group.traverse((o) => { o.castShadow = false; });
    coin('l3', -5.5, 2.3, -129.5);
    stone(-5.5, 1.1, -137.5, 1.4);
    const bobbers = [];
    [[-2, -141, 0], [1.5, -144, 0.5]].forEach(([x, z, off], i) => {
      const s = w.mover(w.cylinder({ pos: [x, 0.75, z], radius: 1.2, height: 0.5, color: C.rock2 }), { path: [[x, 0.75, z], [x, -1.45, z]], speed: 1.1, pause: 1.4, offset: off });
      const ring = w.cylinder({ id: 'bob' + i, pos: [x, 0.9, z], radius: 1.27, height: 0.12, color: C.teal, glow: 2, collide: false, shadow: false });
      bobbers.push({ s, ring, m: own1(ring) });
    });
    coin('l4', 1.5, 2.3, -144);
    // waterfall island: hidden stones (lumen moss) lead behind the falling water
    stone(-3, 0.35, -114.5, 1.1, C.cyan, true); stone(-5.5, 0.35, -111, 1.1, C.cyan, true);
    w.cylinder(Object.assign({ pos: [-8, -1.75, -104], radius: 4, height: 5.5, color: C.rock2 }, ROCK));
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI; w.sphere(Object.assign({ pos: [-8 + Math.cos(a) * 3.6, 1.6, -104 + Math.sin(a) * 3.4], radius: 1.5, low: true, color: i % 2 ? C.rock : C.rock3 }, ROCK)); }
    // the waterfall pours from a crack in the ceiling: a faint sheet with brighter streaks and falling sparkles
    box(-10.6, -5.4, 1, 24, -106.45, -106.25, '#6fe9ff', { collide: false, opacity: 0.12, glow: 0.9 });
    { const r = w.rand(248); for (let i = 0; i < 9; i++) { const x = -10.4 + r() * 4.8, wd = 0.12 + r() * 0.3; box(x, x + wd, 1, 24, -106.42 + r() * 0.1, -106.3 + r() * 0.1, '#bdfaff', { collide: false, opacity: 0.22 + r() * 0.12, glow: 1.4 }); } }
    w.cylinder({ pos: [-8, 23.9, -106.35], radius: 0.6, height: 0.2, color: C.cyan, glow: 2.6, collide: false }).mesh.scale.set(3.2, 0.2, 0.5);
    w.particles({ pos: [-8, 1, -106.35], area: [5.2, 23, 0.5], count: 200, color: ['#d9fdff', C.cyan], size: 0.14, kind: 'snow', speed: 8 });
    coin('l5', -8, 2.2, -102.6, true); coin('l6', -9.8, 2.2, -103.6, true);
    cluster(-6.4, 1, -102.4, 0.7, C.cyan, 121, 4);
    // lakebed glow, lily pads near the shores
    {
      const r = w.rand(122);
      for (let i = 0; i < 30; i++) w.sphere({ pos: [-20 + r() * 40, -3.8, -145 + r() * 58], radius: 0.15 + r() * 0.25, low: true, color: r.pick([C.cyan, C.teal, C.violet]), glow: 1.1, collide: false });
      for (let i = 0; i < 14; i++) {
        const x = r() < 0.5 ? -20 + r() * 8 : 9 + r() * 11, z = -146 + r() * 56;
        w.cylinder({ pos: [x, 0.03, z], radius: 0.3 + r() * 0.35, height: 0.04, sides: 12, color: '#1f7a5c', glow: 0.4, collide: false });
        if (r() < 0.5) w.sphere({ pos: [x, 0.15, z], radius: 0.09, low: true, color: C.pink, glow: 2.4, collide: false });
      }
    }
    // the Founder's second Echo (GAME.md): a reflection walk. An islet in the lake's southwest corner holds it; the
    // way there is a line of stones nobody can see. Once the hunt is on, their reflections shimmer on the water.
    {
      const ISLET = [-17.5, -140];
      w.cylinder(Object.assign({ pos: [ISLET[0], -1.6, ISLET[1]], radius: 2.2, height: 5.0, color: C.rock2 }, ROCK));
      w.cylinder({ pos: [ISLET[0], 0.92, ISLET[1]], radius: 2.25, height: 0.06, color: C.teal, glow: 1.4, collide: false, shadow: false });
      const awake = !!w.flag('hunt.started');
      for (const [x, z] of [[-9.2, -134.8], [-12.6, -136.4], [-15.2, -138.8]]) { // from the raft's southern stop
        w.cylinder({ pos: [x, 0.65, z], radius: 1.0, height: 0.5, color: C.rock2, invisible: true });
        if (awake) w.cylinder({ pos: [x, 0.03, z], radius: 1.0, height: 0.02, color: '#bff6ff', glow: 1.8, opacity: 0.5, collide: false, shadow: false });
      }
      w.echo({ id: '2', pos: [ISLET[0], 2.4, ISLET[1]], line: 'Everyone looks up for answers. I always found mine in reflections.', next: "Echo III: \"I was fastest once. Beat my lap, the Neon Circuit track record, then look in the cyan garage.\"" });
    }
    const water = box(-22, 22, -4, 0, -147, -87, C.water, { collide: false, opacity: 0.88, glow: 0.35 });
    const waterMat = own1(water);
    w.zone({ pos: [0, -2, -116], size: [44, 5.2, 62], onEnter: () => {
      const p = w.player.pos;
      w.burst([p[0], 0.2, p[2]], { color: [C.cyan, '#ffffff'], count: 26, speed: 6, life: 0.7 });
      w.shake(0.2); w.player.respawn(); w.toast('Splash! The lake sends you back to the shore.');
    } });
    w.light({ pos: [0, 7, -122], color: '#3fc8ff', intensity: 32, distance: 34 });
    w.particles({ pos: [0, 0.3, -116], area: [40, 6, 56], count: 80, color: [C.cyan, C.teal, '#ffffff'], size: 0.12, kind: 'float', speed: 0.5 });
    // far shore and the big glowcap up to the Brink
    box(-22, 22, -6, 1.5, -156, -147, C.floor);
    w.checkpoint({ id: 'shore', pos: [-7, 1.5, -151], yaw: 180 });
    glowcap(0, 1.5, -151, { r: 1.5, color: C.teal, power: 24, push: [0, 0, -7] });
    w.label({ pos: [0, 5.5, -151], text: '↑ to the Brink', size: 0.4, color: '#c9fff0' });
    crumbLine([2, 1.5, -147.6], [2, 1.5, -149.4], 2, 1.4, 123);
    shroomPatch(-15, 1.5, -151, 8, 124, [C.teal, C.violet], 2.5); shroomPatch(14, 1.5, -150, 8, 125, [C.pink, C.cyan], 2.5);
    cluster(-19, 1.5, -154, 1.4, C.violet, 126); cluster(18.5, 1.5, -154.5, 1.3, C.teal, 127);
    lumps('z', -156, 1, -21, -16, 1.5, 22, 4, 128); lumps('z', -156, 1, 16, 21, 1.5, 22, 4, 129);

    // ======================================================================
    // 4. THE BRINK and THE GREAT CHASM (30 m across, the far side 10 m lower)
    // ======================================================================
    box(-16, 16, -45, 10, -170, -156, C.floor);
    box(-24, -16, -6, 26, -158, -156); box(16, 24, -6, 26, -158, -156);
    box(-18, -16, -45, 28, -232, -222); box(-18, -16, -45, 28, -218, -156); box(-18, -16, 4, 28, -222, -218);
    box(16, 18, -45, 28, -232, -156);
    box(-18, 18, -45, 28, -234, -232);
    box(-18, 18, 26, 28, -234, -156, C.rock3);
    lumps('x', -16, 1, -168, -158, 10, 24, 7, 131); lumps('x', 16, -1, -168, -158, 10, 24, 7, 132);
    lumps('x', -16, 1, -198, -172, -20, 24, 16, 133); lumps('x', 16, -1, -198, -172, -20, 24, 16, 134);
    ceiling(-15, 15, -230, -158, 26, 20, 120, 135);
    w.checkpoint({ id: 'brink', pos: [-6, 10, -160], yaw: 180 });
    coin('b1', 0, 11.1, -159.5);
    crumbLine([0, 10, -161], [0, 10, -167], 3, 2.2, 136);
    // the launch lip
    box(-8, 4, 10, 10.04, -169.9, -169.65, C.teal, { collide: false, glow: 1.2 });
    for (let i = 0; i < 4; i++) {
      const x = -6 + i * 3;
      box(x - 0.55, x - 0.05, 10, 10.03, -168.36, -168.24, C.teal, { collide: false, glow: 1.2, rot: [0, 35, 0] });
      box(x + 0.05, x + 0.55, 10, 10.03, -168.36, -168.24, C.teal, { collide: false, glow: 1.2, rot: [0, -35, 0] });
    }
    w.sign({ pos: [-4, 10, -165.5], yaw: 0, title: 'THE GREAT CHASM', width: 3.4, text: 'Thirty metres of nothing. No one jumps it.\nWith a glider: run, jump off the lip and hold Space until you land.\nNo glider? Skyreach keeps one at its summit, through Junction.' });
    w.label({ pos: [0, 16.5, -171], text: 'THE GREAT CHASM', size: 0.6, color: '#c9fff0', border: C.teal });
    let hintAt = -99;
    w.zone({ pos: [0, 11.5, -168], size: [32, 4, 4.4], onEnter: () => {
      if (w.time < hintAt) return;
      hintAt = w.time + 8;
      if (w.player.canUse('glide')) w.toast('Run, jump off the lip and hold Space to glide across.');
      else if (w.has('glider')) w.toast('Your glider is in your pack. Press I and wear it on your back.');
      else if (w.player.canUse('doublejump')) w.toast('Too wide to jump. Spring boots might manage the Old Stair (right). A glider from Skyreach would carry you over.');
      else w.toast('Too wide to jump. A glider from Skyreach would carry you across.');
    } });
    w.npc({ pos: [-12, 10, -163.5], yaw: 120, name: 'Wick', colors: { body: '#5a4a8a', head: '#f1e9ff', visor: '#ffc46b' }, hand: 'lantern', onTalk: async () => {
      const lines = ['The Great Chasm. Thirty metres of nothing, and the Deep underneath.'];
      if (w.player.canUse('glide')) {
        lines.push('That is a glider on your back! Run at the lip, jump, and hold Space. Keep holding until your feet touch the far side.', 'The shrine is straight across. You will float right down to it.');
        return w.say('Wick', lines);
      }
      if (w.has('glider')) {
        lines.push('You have a glider in your pack, but it is not on your back. Press I and wear it, then jump and hold Space.');
        return w.say('Wick', lines);
      }
      lines.push('Nobody jumps it. Folk with gliders float over like spores. The gliders come from Skyreach: climb to its summit and one is waiting.');
      if (w.player.canUse('doublejump')) lines.push('Then again, those are spring boots. The Old Stair, on the right, is a row of crystal pillars. Jump, then jump again at the top of the leap. Do not look down.');
      await w.say('Wick', lines);
      const pick = await w.ask('Wick', 'Want a shortcut back to Junction? Skyreach is through there.', ['Take me to Junction', 'I will stay a while']);
      if (pick === 0) w.travel('hub');
    } });
    cluster(-13.5, 10, -168.5, 1.3, C.teal, 137); cluster(13.8, 10, -158.5, 1.1, C.violet, 138); shroomPatch(-13.5, 10, -158.5, 6, 139, [C.teal, C.cyan], 1.6);
    w.light({ pos: [0, 15, -163], color: '#57d8ff', intensity: 28, distance: 28 });
    // the Old Stair: crystal pillars for double jumpers (8 m gaps: one jump reaches ~7 m even with coyote time, two reach ~10)
    w.sign({ pos: [7.2, 10, -166.2], yaw: 0, title: 'THE OLD STAIR', width: 2.6, text: 'For spring-heeled feet only.\nJump, then jump again at the top of the leap.' });
    [[-179.5], [-190.5]].forEach(([z], i) => {
      w.cylinder({ pos: [10, -17.5, z], radius: 1.5, height: 55, sides: 6, color: '#3b3566' });
      w.cylinder({ pos: [10, 9.78, z], radius: 1.56, height: 0.18, sides: 6, color: C.violet, glow: 2.2, collide: false });
      w.cylinder({ pos: [10, 3, z], radius: 1.56, height: 0.25, sides: 6, color: C.violet, glow: 1.7, collide: false });
      wallCrystals(10, -4, z, 1.6, C.violet, i ? Math.PI : 0, 140 + i);
      coin('b' + (2 + i), 10, 11.1, z);
    });
    // the chasm: glowing veins, crystals and the Deep far below
    {
      const r = w.rand(150);
      for (const [zf, d] of [[-170.05, -1], [-199.95, 1]]) {
        for (let k = 0; k < 9; k++) {
          let x = -14 + k * 3.5 + r() * 2, y = (zf < -190 ? -1 : 9) - r() * 2;
          for (let i = 0; i < 7; i++) {
            const len = 1.6 + r() * 2.4, ang = (r() - 0.5) * 70;
            const nx = x + Math.sin(ang * Math.PI / 180) * len, ny = y - Math.cos(ang * Math.PI / 180) * len;
            w.box({ pos: [(x + nx) / 2, (y + ny) / 2, zf + d * 0.03], size: [0.1, len + 0.1, 0.08], rot: [0, 0, ang], color: r() < 0.7 ? C.teal : C.cyan, glow: 1.7, collide: false });
            x = nx; y = ny;
          }
        }
        for (let k = 0; k < 7; k++) wallCrystals(-13 + r() * 26, -2 - r() * 26, zf, 1.2 + r(), r.pick([C.teal, C.cyan, C.violet]), d * Math.PI / 2, 160 + k + (d > 0 ? 10 : 0));
      }
    }
    box(-16, 16, -46, -45, -200, -170, '#0a4a40', { collide: false, glow: 0.9 });
    w.particles({ pos: [0, -42, -185], area: [30, 52, 28], count: 160, color: [C.teal, C.cyan], size: 0.2, kind: 'rise', speed: 2.2 });

    // ======================================================================
    // 5. THE SHRINE OF THE DEEP
    // ======================================================================
    box(-16, 16, -45, 0, -232, -200, C.floor);
    lumps('x', -16, 1, -231, -224, 0, 24, 5, 171); lumps('x', -16, 1, -216, -202, 0, 24, 8, 172); lumps('x', 16, -1, -231, -202, 0, 24, 12, 173);
    lumps('z', -232, 1, -15, 15, 7, 24, 12, 174);
    w.checkpoint({ id: 'shrine', pos: [-6, 0, -205], yaw: 180 });
    crumbLine([0, 0, -202], [0, 0, -208], 3, 2.2, 175);
    const SH = [0, 0, -216], DRESSED = { rough: 0.55 }; // the shrine is built, not grown
    w.cylinder(Object.assign({ pos: [SH[0], 0.2, SH[2]], radius: 6, height: 0.4, sides: 28, color: '#323a4f' }, DRESSED));
    w.cylinder({ pos: [SH[0], 0.36, SH[2]], radius: 6.06, height: 0.07, color: C.teal, glow: 1.7, collide: false });
    w.cylinder({ pos: [SH[0], 0.41, SH[2]], radius: 3.2, height: 0.02, color: C.teal, glow: 0.9, collide: false });
    w.cylinder(Object.assign({ pos: [SH[0], 0.42, SH[2]], radius: 3.05, height: 0.02, color: '#2b3245', collide: false }, DRESSED));
    w.cylinder(Object.assign({ pos: [SH[0], 0.9, SH[2]], radius: 0.75, height: 1.0, sides: 8, color: '#3a4258' }, DRESSED, { tile: 1.6 }));
    w.cylinder({ pos: [SH[0], 1.36, SH[2]], radius: 0.8, height: 0.06, sides: 8, color: C.teal, glow: 2.2, collide: false });
    for (const a of [60, 120, 240, 300]) {
      const x = SH[0] + Math.sin(a * Math.PI / 180) * 8.5, z = SH[2] + Math.cos(a * Math.PI / 180) * 8.5;
      w.cylinder(Object.assign({ pos: [x, 13, z], radius: 0.8, height: 26, sides: 6, color: '#2f3a52' }, DRESSED));
      for (const y of [2.2, 6.5, 12]) w.cylinder({ pos: [x, y, z], radius: 0.86, height: 0.2, sides: 6, color: C.teal, glow: 1.7, collide: false });
      cluster(x, 0, z, 0.9, C.teal, 180 + a, 4);
    }
    w.pickup({ pos: [SH[0], 2.6, SH[2]], item: 'sigil-deep', scale: 2.2, onPick: () => {
      w.setFlag('sigil.deep', true);
      w.shake(0.4);
      w.burst([SH[0], 3, SH[2]], { color: [C.teal, '#ffffff', C.cyan], count: 80, speed: 9, life: 1.3 });
      w.objective('Take the portal home to Junction. The Vault is waiting.', { at: AT.home });
    } });
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; coin('s' + (i + 1), SH[0] + Math.sin(a) * 4, 1.6, SH[2] + Math.cos(a) * 4, true); }
    w.portal({ pos: [0, 0, -228], yaw: 0, to: 'hub', label: 'Junction', subtitle: 'Home, with the light of the Deep' });
    w.label({ pos: [SH[0], 12.5, SH[2]], text: 'SHRINE OF THE DEEP', size: 0.75, color: '#c9fff0', border: C.teal });
    w.light({ pos: [SH[0], 8, SH[2]], color: '#3dffc5', intensity: 24, distance: 30 });
    w.particles({ pos: [SH[0], 0.5, SH[2]], area: [16, 10, 16], count: 70, color: [C.teal, '#ffffff'], size: 0.12, kind: 'float', speed: 0.7 });
    shroomPatch(-12, 0, -206, 7, 181, [C.teal, C.violet], 2.2); shroomPatch(12, 0, -207, 7, 182, [C.cyan, C.pink], 2.2);
    cluster(-13, 0, -229, 1.8, C.cyan, 183); cluster(13, 0, -229.5, 1.6, C.violet, 184);
    // the shrine grotto (west wall), behind shadow-moss
    box(-22, -16, -2, 0, -222, -218, C.floor);
    box(-24, -22, -2, 6, -224, -216); box(-22, -16, -2, 6, -224, -222); box(-22, -16, -2, 6, -218, -216); box(-24, -16, 4, 6, -224, -216);
    lumps('x', -22, 1, -221.8, -218.2, 0, 4, 4, 244); lumps('z', -222, 1, -21.5, -16.5, 2.5, 4, 3, 245); lumps('z', -218, -1, -21.5, -16.5, 2.5, 4, 3, 246);
    cluster(-21, 0, -221, 0.9, C.teal, 185); cluster(-21.2, 0, -218.8, 0.7, C.violet, 186);
    coin('s7', -18.5, 1.3, -219.2, true); coin('s8', -20.2, 1.3, -220.8, true);
    shadowMoss(-16, 0, -220, 0.9, 4, 4, 187);
    let done = false;
    w.zone({ pos: [SH[0], 1.5, SH[2]], radius: 8, onEnter: () => {
      if (!done) { done = true; if (w.has('sigil-deep')) w.objective('Take the portal home to Junction.', { at: AT.home }); else w.objective('Claim the Sigil of the Deep on the pedestal.', { at: AT.sigil }); }
      w.player.setCheckpoint([0, 1.4, -208], 180); // gliders and stair-climbers may miss the beacon: never send them back over the chasm
      if (!started || finished) return;
      finished = true;
      const t = w.timer.stop(), best = w.store.get('best', null);
      w.record('shrine', t);
      if (best == null || t < best) w.store.set('best', t);
      w.sound('win');
      w.burst([SH[0], 4, SH[2]], { color: [C.teal, '#ffffff', C.violet], count: 90, speed: 10, life: 1.4 });
      w.banner('THE DEEP', `${w.fmtTime(t)}${best == null || t < best ? ' · new best!' : ` · best ${w.fmtTime(best)}`}`);
    } });

    // ======================================================================
    // 6. DRESSING: low-poly props (ART.md). Each one stands against a wall or beside a path, never on one, with a
    //    small collider where you could bump into it (the same colliders the photographed props they replaced had).
    // ======================================================================
    const rock = (x, z, yaw, s) => { // a boulder of the cave's rock, and a smaller one leaning on it
      w.cylinder({ pos: [x, 0.04 * s, z], radius: 0.06 * s, height: 0.08 * s, invisible: true });
      w.sphere({ pos: [x, 0.035 * s, z], radius: 1, low: true, flat: true, scale: [0.105 * s, 0.045 * s, 0.07 * s], rot: [0, yaw, 0], color: C.rock2, collide: false });
      const a = yaw * Math.PI / 180;
      w.sphere({ pos: [x + Math.cos(a) * 0.075 * s, 0.02 * s, z - Math.sin(a) * 0.075 * s], radius: 1, low: true, flat: true, scale: [0.05 * s, 0.03 * s, 0.045 * s], rot: [0, yaw + 50, 0], color: C.rock, collide: false });
    };
    const plant = (x, z, yaw, s) => { // crystalline ground cover, softly lit: walk through it
      const r = w.rand(Math.round(Math.abs(x * 131 + z * 17)) + 3);
      for (let i = 0; i < 6; i++) {
        const a = r() * Math.PI * 2, d = r() * 0.28 * s, len = (0.12 + r() * 0.16) * s, t = 15 + r() * 30;
        shard(x + Math.cos(a) * d, len * 0.4, z + Math.sin(a) * d, len, 0.035 * s, i % 2 ? '#9fe9ff' : '#c6b4ff', 0.5, t * Math.sin(a), -t * Math.cos(a));
      }
    };
    const lamp = (x, z, yaw, s = 2.6) => { // a tall wooden lantern on the floor
      w.cylinder({ pos: [x, 0.265 * s, z], radius: 0.1 * s, height: 0.53 * s, invisible: true });
      const c = Math.cos(yaw * Math.PI / 180), sn = Math.sin(yaw * Math.PI / 180);
      w.box({ pos: [x, 0.02 * s, z], size: [0.16 * s, 0.04 * s, 0.16 * s], yaw, color: '#3b2a1e', collide: false });
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) w.box({ pos: [x + (dx * c + dz * sn) * 0.062 * s, 0.25 * s, z + (-dx * sn + dz * c) * 0.062 * s], size: [0.014 * s, 0.42 * s, 0.014 * s], yaw, color: '#4a3526', collide: false, shadow: false });
      w.box({ pos: [x, 0.13 * s, z], size: [0.13 * s, 0.012 * s, 0.13 * s], yaw, color: '#4a3526', collide: false, shadow: false });
      w.cone({ pos: [x, 0.5 * s, z], radius: 0.12 * s, height: 0.09 * s, sides: 4, rot: [0, yaw + 45, 0], color: '#3b2a1e', collide: false });
      w.sphere({ pos: [x, 0.24 * s, z], radius: 0.05 * s, color: '#ffc46b', glow: 2.6, collide: false, shadow: false }); // its flame
    };
    // the Mouth: lanterns at the way on and at the portal home, rocks and crystal growth along the walls
    lamp(-4.2, -13.2, 0); lamp(4.2, -13.2, 0); lamp(-3.2, 13, 180); lamp(3.2, 13, 180);
    rock(-11.3, 7, 30, 14); rock(-11.4, -9, 110, 12); rock(11.2, 9.5, -40, 13); rock(11, -12, 200, 12);
    plant(-10.2, 3, 20, 2); plant(10.4, 4.5, -60, 1.8); plant(-9.6, -12.3, 80, 1.6); plant(9.2, 12.4, 0, 2);
    // the Grove floor, under the glowcaps
    rock(-14.6, -25, 70, 16); rock(14.4, -29, -20, 15); rock(-14.8, -41, 150, 14); rock(14.6, -44, 40, 16);
    plant(-13.2, -32, 10, 2.2); plant(13, -37, 100, 2); plant(-12.8, -45.5, 40, 1.8);
    // the Shrine: four lanterns frame the dais between its pillars; rocks in the far corners
    for (const a of [30, 150, 210, 330]) lamp(Math.sin(a * Math.PI / 180) * 7.2, -216 + Math.cos(a * Math.PI / 180) * 7.2, a + 180);
    rock(-14.2, -204, 60, 14); rock(14, -207, -30, 13); rock(-14.4, -229, 120, 15); rock(14.3, -226, 200, 14);
    plant(-12.5, -212, 0, 2); plant(12.6, -220, 90, 2.2);

    // ======================================================================
    // behaviour
    // ======================================================================
    w.on('enter', () => {
      if (!w.has('lantern')) w.objective('Take a lantern from the stand.', { at: AT.lantern });
      else {
        if (w.has('sigil-deep')) w.objective('The Deep knows you. Race the clock to the shrine, or hunt the hidden gems.');
        else { w.objective('Follow the teal crystals into the Deep.', { at: AT.grove }); gliderNote(); }
        if (!w.player.canUse('light')) w.toast('Your lantern is in your pack. Press I and hold it: it is dark down here.');
      }
    });
    w.on('checkpoint', (id) => {
      const across = w.player.canUse('glide') || w.player.canUse('doublejump');
      const o = { // [text, where the marker goes]: the next beacon, then the shrine
        grove: ['Find your way through the Murk. Teal crystals mark the path.', AT.murk],
        murk: ['Down to Mirror Lake. Keep out of the water.', AT.lake],
        lake: ['Cross Mirror Lake to the far shore. Keep out of the water.', AT.shore],
        shore: ['Bounce up to the Brink.', AT.brink],
        brink: [w.player.canUse('glide') ? 'Glide the Great Chasm: run, jump off the lip, hold Space.'
          : w.player.canUse('doublejump') ? 'Cross the Old Stair with double jumps, or bring a glider from Skyreach.'
            : 'You need a glider to cross. Skyreach keeps one at its summit.', across ? AT.sigil : null],
        shrine: w.has('sigil-deep') ? ['Take the portal home to Junction.', AT.home] : ['Claim the Sigil of the Deep.', AT.sigil],
      }[id];
      if (o) w.objective(o[0], o[1] ? { at: o[1] } : undefined);
    });
    w.on('fall', () => w.toast('The Deep swallowed you. Back to the last beacon.'));
    w.on('tick', () => {
      const p = w.player.pos, lit = w.player.canUse('light');
      for (const s of shadows) {
        if (s.open) continue;
        if (Math.hypot(p[0] - s.x, (p[1] - s.y) * 0.6, p[2] - s.z) > 3.4) continue;
        if (lit) {
          s.open = true; s.t = 0.001; s.wall.hide();
          w.sound('crumble'); w.burst([s.x, s.y, s.z], { color: ['#c08cff', '#2a1640'], count: 30, speed: 4, life: 0.8 });
          w.toast('The shadow-moss shrinks away from your lantern light.');
        } else if (w.time > s.nag) {
          s.nag = w.time + 7;
          w.toast('Shadow-moss. Cold and thick, and it seems to shy away from light.');
        }
      }
    });
    let splash = 0;
    const SR = w.rand(696); // visual only: splash positions
    w.on('frame', (dt, time) => {
      const p = w.player.pos, lit = w.player.canUse('light');
      for (const l of lumen) {
        const d = Math.hypot(p[0] - l.x, p[1] - l.y, p[2] - l.z);
        const want = lit ? 0.03 + 2.4 * Math.max(0, Math.min(1, (9 - d) / 5)) : 0.03;
        l.m.emissiveIntensity += (want - l.m.emissiveIntensity) * Math.min(1, dt * 5);
      }
      for (const c of caps) {
        if (c.t > 2) continue;
        c.t += dt;
        const s = Math.exp(-5 * c.t) * Math.cos(16 * c.t);
        c.dome.mesh.scale.set(c.r * (1 + 0.12 * s), c.r * 0.38 * (1 - 0.4 * s), c.r * (1 + 0.12 * s));
      }
      for (const s of shadows) {
        if (!s.t || s.t > 1) continue;
        s.t += dt;
        const k = Math.max(0.001, 1 - s.t / 0.8);
        for (const b of s.blobs) b.m.scale.set(b.k.x * (0.5 + 0.5 * k), b.k.y * k, b.k.z * (0.5 + 0.5 * k));
        if (s.t > 0.8) { for (const b of s.blobs) b.m.visible = false; s.spores.points.visible = false; }
      }
      raftLook.group.position.copy(raft.mesh.position);
      for (const b of bobbers) {
        const y = b.s.mesh.position.y;
        b.ring.mesh.position.set(b.s.mesh.position.x, y + 0.15, b.s.mesh.position.z);
        b.m.emissiveIntensity = 0.4 + 1.8 * Math.max(0, Math.min(1, (y + 0.4) / 1.15));
      }
      waterMat.emissiveIntensity = 0.32 + 0.08 * Math.sin(time * 0.9);
      splash -= dt;
      if (splash < 0) { splash = 0.3; w.burst([-11 + SR() * 6, 1.1, -106.3], { color: ['#b9fbff', C.cyan], count: 3, speed: 2.5, life: 0.6, gravity: 3 }); }
    });
    w.on('leave', () => own.forEach((m) => m.dispose()));
  },
};
