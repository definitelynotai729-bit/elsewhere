// Spire Clash: a lane battle in the arena style. Minion waves march down one lane between two bases; towers
// guard each side; a rival champion fights you for it. Level up, buy upgrades at your fountain, topple the
// enemy towers, then their spire. The gear you bring from other worlds becomes your edge here.
// Keyboard: WASD or arrows move, Q bolt, E shield, R starfall, Space dash, B recall. Attacks are automatic.
// Phones: the stick moves, and the Q, E, R, DASH and RECALL buttons send the same presses as the keys.
// The look: a dry savanna, an old paved road and ruined sandstone walls, with CC0 models from Poly Haven.
// Scenery never changes the fight: only the floor, the walls and the props against the walls or in the camp
// corners have colliders, and none of them stand in the lane or in a camp exit.
export default {
  id: 'clash',
  name: 'Spire Clash',
  author: 'elsewhere',
  version: 1,
  blurb: 'A lane battle: towers, minion waves and a rival champion. Your gear comes with you.',
  color: '#ff6b5c',
  spawn: { pos: [0, 1.2, 74], yaw: 180 },
  killY: -20,
  controls: 'topdown',
  camera: { mode: 'top', yaw: 180, pitch: 56, dist: 27 },
  rules: {},
  theme: {
    skyTop: '#4d84cc', skyHorizon: '#f0d9b8', skyBottom: '#c9b38c', skySharp: 0.6,
    sunDir: [-0.5, 0.72, 0.42], sunColor: '#ffdcaa', sunSize: 2, sunLight: '#ffe2bc', sunIntensity: 2.8,
    hemiSky: '#d4e0f2', hemiGround: '#a08a62', hemiIntensity: 1.25,
    fog: [100, 320], fogColor: '#d9c9ab', stars: 0, bloom: 0.35, exposure: 0.95,
  },
  music: { root: 50, scale: 'dorian', bpm: 96, progression: [0, 3, 6, 4], sparkle: 0.3, bright: 2000, wave: 'triangle', pulse: true },
  items: {
    'spire-circlet': { name: 'Spire Circlet', slot: 'head', traits: ['cosmetic'], rarity: 'rare', desc: 'Won a Spire Clash.',
      look: [{ s: 'torus', r: 0.3, tube: 0.04, pos: [0, 0.02, 0], rot: [90, 0, 0], color: '#ffd166', metal: 0.8 },
        { s: 'oct', r: 0.09, pos: [0, 0.06, 0.29], color: '#ff6b5c', glow: 2.4 }] },
  },

  build(w) {
    const T = w.THREE, D = Math.PI / 180;
    // the balance knobs in one place (tools/clash_sim.mjs plays whole matches headlessly to check them)
    // surgeAt: seconds into the fight when the waves surge: they come every surgeWave s, surgeGrow stronger, towers and
    // spires take surgeStructure more damage, and every one that can be hit crumbles by surgeDecay of its health a
    // second. So a match always ends, and a stalemate goes to the side that did more damage; respawn + respawnLvl * level: seconds a fallen champion waits (you and the rival)
    const TUNE = { towerHp: 2000, spireHp: 3000, rivalAtkPerMin: 0.04, rivalHpPerMin: 0.03, wave: 25, towerVsMinion: 0.38, minionGrowth: 0, siegeReach: 1, glideSpeed: 0.15, lightAp: 0.4, dashCd: 0.5, bladeAtk: 0.25, surgeAt: 270, surgeWave: 15, surgeGrow: 0.5, surgeStructure: 1, surgeDecay: 0.01, respawn: 5, respawnLvl: 1.6 };
    const C = {
      grass: '#8b8a4c', grass2: '#76803f', grass3: '#9e9258', earth: '#8a6f4b', lane: '#6e5e48',
      slab: ['#a8987c', '#9a8b70', '#b3a487', '#8d7f66'], kerb: '#77684f', scorch: '#4f4438',
      sand: '#b9a479', bed: '#2c4542', water: '#3f8ea3', wall: ['#ab9672', '#9d8865', '#b7a37e'], pier: '#8e7b5d',
      rock: '#7d7062', wood: '#7a5737', wood2: '#644528', woodDark: '#45301d', reed: '#6f7d3a', reed2: '#8c8d4f',
      canopy: '#5f6c30', canopy2: '#717d3b', bark: '#54412f', canvas: '#cdbb93',
      blue: '#3ec8ff', red: '#ff5d5d', stone: '#bfb299', dark: '#3b3a35', gold: '#ffd166',
    };
    const TEAM = [{ name: 'blue', color: C.blue, cloth: '#2f86d8', dir: -1, fountain: [0, 76], spire: [0, 62] }, { name: 'red', color: C.red, cloth: '#cf3b3b', dir: 1, fountain: [0, -76], spire: [0, -62] }];
    const own = []; // geometry and materials this world creates, disposed on leave
    const geo = { box: new T.BoxGeometry(1, 1, 1), sphere: new T.SphereGeometry(1, 14, 10), cone: new T.ConeGeometry(1, 1, 10), cyl: new T.CylinderGeometry(1, 1, 1, 12), cyl8: new T.CylinderGeometry(1, 1, 1, 8), oct: new T.OctahedronGeometry(1, 0) };
    Object.values(geo).forEach((g) => own.push(g));
    const mesh = (g, color, o = {}) => { const m = new T.Mesh(g, w.mat(color, o)); m.castShadow = true; return m; };

    // =====================================================================================
    // The battlefield: a dry savanna crossed by an old paved road between two walled camps
    // =====================================================================================
    const R = w.rand(17);
    const deco = (o) => Object.assign({ collide: false, shadow: false }, o); // flat decoration you walk over
    w.box({ pos: [0, -0.5, 0], size: [90, 1, 190], color: C.grass });
    for (let i = 0; i < 110; i++) { // grass, straw and bare earth
      const x = R.range(-44, 44), z = R.range(-93, 93), s = R.range(3, 11);
      if (Math.abs(x) < 9 && Math.abs(z) < 59) continue;
      w.box(deco({ pos: [x, i % 2 ? 0.005 : 0.015, z], size: [s, 0.01, s * R.range(0.4, 1)], yaw: R.range(0, 180), color: [C.grass2, C.grass3, C.earth][i % 3] }));
    }
    // the road: packed earth under worn paving, broken toward its edges, with kerbstones
    w.box(deco({ pos: [0, 0.02, 0], size: [15, 0.02, 118], color: C.lane }));
    for (let row = 0, z = -57.9; z < 58; row++, z += 1.42) {
      if (Math.abs(z) < 5) continue; // the bridge
      for (let x = -7.4 + (row % 2) * 0.93; x < 7.4; x += 1.86) {
        const e = Math.abs(x) / 7.5;
        if (R() < 0.08 + 0.42 * e * e) continue;
        const x0 = Math.max(x - 0.85 + R.range(0, 0.12), -7.35), x1 = Math.min(x + 0.85 - R.range(0, 0.12), 7.35);
        if (x1 - x0 < 0.5) continue;
        w.box(deco({ pos: [(x0 + x1) / 2, R.range(0.042, 0.048), z + R.range(-0.05, 0.05)], size: [x1 - x0, 0.03, R.range(1.12, 1.28)], yaw: R.range(-3, 3), color: R.pick(C.slab) }));
      }
    }
    for (const sx of [-1, 1]) for (let z = -57.4; z < 57.5; z += 1.2) {
      if (Math.abs(z) < 5 || R() < 0.18) continue;
      w.box(deco({ pos: [sx * 7.62, 0.06, z], size: [0.32, 0.09, 1.05], yaw: R.range(-4, 4), color: C.kerb }));
    }
    for (let i = 0; i < 90; i++) { // tufts of dry grass: you walk through them, like brush
      const x = (i % 2 ? 1 : -1) * R.range(8.2, 30), z = R.range(-80, 80);
      if (Math.abs(z) < 5 || (Math.abs(z) > 57 && Math.abs(x) < 22)) continue;
      for (let k = 0; k < 4; k++) w.cone(deco({ pos: [x + R.range(-0.3, 0.3), 0.16, z + R.range(-0.3, 0.3)], radius: 0.05, height: R.range(0.3, 0.55), rot: [R.range(-15, 15), 0, R.range(-15, 15)], color: k % 2 ? C.reed2 : C.grass3 }));
    }
    for (let i = 0; i < 140; i++) { // pebbles beside the road
      const sx = i % 2 ? 1 : -1, x = sx * R.range(7.9, 14.6), z = R.range(-57, 57);
      if (Math.abs(z) > 4.6) w.sphere(deco({ pos: [x, 0.02, z], radius: R.range(0.07, 0.2), low: true, color: i % 3 ? C.rock : C.wall[1] }));
    }

    // the river: a dark bed, sandy banks, water that reflects the sky, a timber bridge and stepping stones
    w.box(deco({ pos: [0, 0.03, 0], size: [90, 0.02, 7.6], color: C.bed }));
    for (const s of [-1, 1]) w.box(deco({ pos: [0, 0.04, s * 4.1], size: [90, 0.02, 1.2], color: C.sand }));
    const waterMat = new T.MeshStandardMaterial({ color: C.water, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.78, depthWrite: false });
    own.push(waterMat);
    const water = new T.Mesh(new T.PlaneGeometry(90, 7.2), waterMat); water.rotation.x = -Math.PI / 2; water.position.y = 0.075; water.receiveShadow = true; w.add(water);
    for (let i = 0, z = -4.55; z < 4.6; i++, z += 0.57) {
      if (i === 4 || i === 12) continue; // two planks lost to the war
      w.box(deco({ pos: [R.range(-0.08, 0.08), 0.12, z], size: [15.3, 0.07, 0.5], yaw: R.range(-1.2, 1.2), color: i % 3 ? C.wood : C.wood2, shadow: true }));
    }
    for (const x of [-6, 0, 6]) w.box(deco({ pos: [x, 0.075, 0], size: [0.35, 0.06, 9.8], color: C.woodDark }));
    for (const sx of [-1, 1]) for (const [dx, z] of [[0.3, -2.7], [-0.4, -1], [0.35, 0.75], [-0.3, 2.45]]) w.cylinder(deco({ pos: [sx * (11.4 + dx), 0.09, z], radius: R.range(0.5, 0.65), height: 0.14, sides: 8, yaw: R.range(0, 45), color: C.wall[1] }));
    for (let i = 0; i < 36; i++) { // reeds where the river runs beyond the walls
      const x = (i % 2 ? 1 : -1) * R.range(16.8, 40), z = (i % 4 < 2 ? 1 : -1) * R.range(3, 4.6);
      for (let k = 0; k < 5; k++) w.cone(deco({ pos: [x + R.range(-0.5, 0.5), 0.45, z + R.range(-0.35, 0.35)], radius: 0.05, height: R.range(0.7, 1.3), color: k % 2 ? C.reed : C.reed2 }));
    }
    for (let i = 0; i < 10; i++) w.sphere(deco({ pos: [(i % 2 ? 1 : -1) * R.range(17.5, 36), 0.05, R.range(-2.6, 2.6)], radius: R.range(0.25, 0.6), low: true, color: C.rock }));

    // walls of old sandstone: an invisible box keeps the old collider; the masonry on it is decoration
    const wall = (x, z, sx, sz, h = 2.2) => {
      w.box({ id: 'wall', pos: [x, h / 2, z], size: [sx, h, sz], color: C.wall[0] }).mesh.visible = false;
      const alongZ = sz > sx, len = alongZ ? sz : sx, th = (alongZ ? sx : sz) + 0.14;
      const at = (u, y) => (alongZ ? [x, y, z + u] : [x + u, y, z]), dims = (a, y, t) => (alongZ ? [t, y, a] : [a, y, t]);
      for (let s = -len / 2; s < len / 2 - 0.1;) {
        const l = Math.min(R.range(2.2, 4.4), len / 2 - s), bh = h + R.range(-0.3, 0.3);
        w.box({ pos: at(s + l / 2, bh / 2), size: dims(l + 0.02, bh, th), color: R.pick(C.wall), collide: false });
        if (bh > h - 0.05) for (let m = s + 0.6; m < s + l - 0.5; m += 1.6) if (R() < 0.7) { const mh = R.range(0.3, 0.6); w.box({ pos: at(m, bh + mh / 2), size: dims(0.85, mh, th - 0.25), color: R.pick(C.wall), collide: false }); }
        s += l;
      }
    };
    wall(-15.5, 0, 1, 118); wall(15.5, 0, 1, 118);
    for (const s of [1, -1]) {
      wall(-21, 70 * s, 1, 24); wall(21, 70 * s, 1, 24); wall(0, 82.5 * s, 43, 1);
      wall(-18.25, 58.5 * s, 6.5, 1); wall(18.25, 58.5 * s, 6.5, 1);
    }
    for (const sx of [-1, 1]) {
      for (let z = -52; z <= 52; z += 13) if (z) { // stepped buttresses outside
        w.box({ pos: [sx * 16.55, 0.8, z], size: [1, 1.6, 1.3], color: R.pick(C.wall), collide: false });
        w.box({ pos: [sx * 16.3, 1.9, z], size: [0.6, 0.7, 1.1], color: R.pick(C.wall), collide: false });
      }
      for (let i = 0; i < 36; i++) { // fallen blocks at their feet
        const z = R.range(-56, 56), s = R.range(0.25, 0.7);
        if (Math.abs(z) > 4.5) w.box({ pos: [sx * R.range(16.3, 19), s * 0.4, z], size: [s * 1.3, s * 0.8, s], rot: [R.range(-12, 12), R.range(0, 90), R.range(-12, 12)], color: R.pick(C.wall), collide: false });
      }
    }

    // ---------- banners: team cloth that waves in the wind (animated in the frame handler: visual only) ----------
    const cloths = [];
    const emblemGeo = new T.PlaneGeometry(0.3, 0.3); emblemGeo.rotateZ(Math.PI / 4); own.push(emblemGeo);
    const goldMat = w.mat(C.gold, { metal: 0.7, rough: 0.35 });
    // hangs from (x, y, z) facing yaw (degrees); parent: a group to hide it with (a tower), or the world
    const banner = (parent, team, wd, ht, x, y, z, yaw, amp = 0.12) => {
      const g = new T.PlaneGeometry(wd, ht, 2, 6); g.translate(0, -ht / 2, 0); own.push(g);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) < 1e-4 && p.getY(i) < -ht + 1e-4) p.setY(i, -ht * 0.8); // swallowtail
      const root = new T.Group(); root.position.set(x, y, z); root.rotation.y = yaw * D;
      const cloth = new T.Mesh(g, w.mat(TEAM[team].cloth, { double: true, rough: 0.9 })); cloth.castShadow = true; root.add(cloth);
      for (const s of [1, -1]) { const e = new T.Mesh(emblemGeo, goldMat); e.position.set(0, -ht * 0.3, 0.06 * s); if (s < 0) e.rotation.y = Math.PI; root.add(e); }
      const bar = new T.Mesh(geo.cyl, goldMat); bar.scale.set(0.04, wd + 0.2, 0.04); bar.rotation.z = Math.PI / 2; root.add(bar);
      if (parent) parent.add(root); else w.add(root);
      cloths.push({ g, base: Float32Array.from(p.array), ht, amp, ph: R.range(0, 6.3), spd: R.range(1.6, 2.4), root });
      return root;
    };
    const flameMat = new T.MeshStandardMaterial({ color: '#ffd28a', emissive: new T.Color('#ff9b3d'), emissiveIntensity: 2.4 }); own.push(flameMat);
    // a lantern: a little wooden frame round a flame. (Every random draw stays in its old order, because the same
    // sequence places the lane's colliders further down.)
    const lantern = (x, y, z, s = 1.5) => {
      const yaw = R.range(0, 90), c = Math.cos(yaw * D), sn = Math.sin(yaw * D);
      w.box({ pos: [x, y + 0.03 * s, z], size: [0.24 * s, 0.06 * s, 0.24 * s], yaw, color: C.woodDark, collide: false });
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) w.box({ pos: [x + (dx * c + dz * sn) * 0.1 * s, y + 0.2 * s, z + (-dx * sn + dz * c) * 0.1 * s], size: [0.025 * s, 0.3 * s, 0.025 * s], yaw, color: C.woodDark, collide: false, shadow: false });
      w.cone({ pos: [x, y + 0.42 * s, z], radius: 0.2 * s, height: 0.14 * s, sides: 4, rot: [0, yaw + 45, 0], color: C.wood2, collide: false });
      const f = new T.Mesh(geo.sphere, flameMat); f.scale.setScalar(0.065 * s); f.position.set(x, y + 0.25 * s, z); w.add(f);
    };
    // low-poly stand-ins for what were photographed models (ART.md)
    const RD = w.rand(71); // their own random shapes, so the layout's sequence is untouched
    const rock = (x, y, z, r, yaw, col) => w.sphere({ pos: [x, y + r * 0.45, z], radius: r, low: true, flat: true, scale: [1.25, 0.72, 1], rot: [0, yaw, RD.range(-6, 6)], color: col || C.rock, collide: false });
    const shieldLook = (pos, rot, team) => { // a kite shield: a painted board, a point below, a boss
      const e = new T.Euler(rot[0] * D, rot[1] * D, rot[2] * D, 'YXZ'), at = (v) => new T.Vector3(...v).applyEuler(e).add(new T.Vector3(...pos)).toArray();
      const col = team == null ? (RD() < 0.5 ? '#9c3b32' : '#2f6ea3') : TEAM[team].cloth;
      w.box({ pos: at([0, 0.12, 0]), size: [0.56, 0.62, 0.06], rot, color: col, collide: false });
      w.cone({ pos: at([0, -0.38, 0]), radius: 0.28, height: 0.4, sides: 4, rot: [rot[0] + 180, rot[1], rot[2] + 45], scale: [1, 1, 0.21], color: col, collide: false, shadow: false });
      w.sphere({ pos: at([0, 0.12, 0.05]), radius: 0.09, low: true, color: C.gold, metal: 0.6, rough: 0.4, collide: false, shadow: false });
    };
    const quiver = (x, z, s, yaw) => { // a quiver tree: a fat pale trunk forking into tufted arms
      w.cylinder({ pos: [x, 0.9 * s, z], radius: 0.2 * s, height: 1.8 * s, sides: 7, color: '#c9b48a', collide: false });
      for (let k = 0; k < 3; k++) {
        const a = (yaw + k * 120) * D, bx = x + Math.sin(a) * 0.35 * s, bz = z + Math.cos(a) * 0.35 * s;
        w.cylinder({ pos: [bx, 2.05 * s, bz], radius: 0.08 * s, height: 0.75 * s, sides: 6, rot: [Math.cos(a) * 30, 0, -Math.sin(a) * 30], color: '#bca67c', collide: false });
        w.sphere({ pos: [x + Math.sin(a) * 0.62 * s, 2.5 * s, z + Math.cos(a) * 0.62 * s], radius: 0.36 * s, low: true, flat: true, scale: [1, 0.7, 1], color: C.canopy2, collide: false });
      }
    };
    const log = (x, z, s, yaw) => w.cylinder({ pos: [x, 0.22 * s, z], radius: 0.22 * s, height: 2.4 * s, sides: 7, rot: [0, yaw, 90], color: C.bark, collide: false });
    const post = (x, z, h = 1.6) => { // a lantern post: the post is its collider
      w.box({ pos: [x, 0.15, z], size: [0.55, 0.3, 0.55], color: C.wall[1], collide: false });
      w.cylinder({ pos: [x, h / 2, z], radius: 0.13, height: h, color: C.woodDark });
      lantern(x, h, z);
    };
    const poleBanner = (team, x, z, h = 4.4) => {
      w.box({ pos: [x, 0.17, z], size: [0.6, 0.34, 0.6], color: C.wall[1], collide: false });
      w.cylinder({ pos: [x, h / 2, z], radius: 0.09, height: h, color: C.woodDark });
      w.cone({ pos: [x, h + 0.16, z], radius: 0.13, height: 0.32, color: C.gold, metal: 0.7, collide: false });
      banner(null, team, 1.0, 2.2, x, h - 0.25, z + 0.12, 0); // hangs above head height
    };
    // the lane walls: piers with lanterns, and masts flying each side's colours over its half
    for (const sx of [-1, 1]) {
      for (const z of [-42, -25, -8, 8, 25, 42]) {
        w.box({ pos: [sx * 15.5, 1.45, z], size: [1.5, 2.9, 1.5], color: C.pier, collide: false });
        w.box({ pos: [sx * 15.5, 2.98, z], size: [1.7, 0.16, 1.7], color: C.wall[2], collide: false });
        if (Math.abs(z) !== 25) lantern(sx * 15.5, 3.06, z);
      }
      for (const z of [-50, -34, -16, 16, 34, 50]) {
        w.cylinder({ pos: [sx * 15.5, 4, z], radius: 0.07, height: 3.6, color: C.woodDark, collide: false });
        w.cone({ pos: [sx * 15.5, 5.95, z], radius: 0.12, height: 0.3, color: C.gold, metal: 0.7, collide: false });
        banner(null, z > 0 ? 0 : 1, 1.1, 2.2, sx * 14.9, 5.4, z, 0);
      }
    }
    // the timber bridge's corner posts
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(sx * 8.15, sz * 4.95, 1.5);

    // ruins against the lane walls, inside reach: each has a collider, and none reaches past |x| 13.6
    const column = (x, z, h, o = {}) => {
      const r = o.r || 0.5, yaw = o.yaw || 0;
      w.box({ pos: [x, 0.17, z], size: [r * 2.5, 0.34, r * 2.5], yaw, color: C.wall[1], collide: false });
      w.cylinder({ pos: [x, 0.34 + h / 2, z], radius: r, height: h, sides: 8, yaw, color: R.pick(C.wall), collide: !!o.solid });
      if (o.cap) w.box({ pos: [x, 0.5 + h, z], size: [r * 2.4, 0.32, r * 2.4], yaw, color: C.wall[2], collide: false });
    };
    const lanePiece = (sx, z, kind) => {
      if (kind === 'column') { const h = R.range(1.3, 2.7); column(sx * 14.25, z, h, { solid: true, cap: h > 2.1 }); }
      else if (kind === 'boulder') {
        const yaw = 90 + R.range(-8, 8);
        w.box({ pos: [sx * 14.35 + 0.07 * Math.cos(yaw * D), 0.37, z - 0.07 * Math.sin(yaw * D)], size: [2.1, 0.75, 0.95], yaw, invisible: true });
        rock(sx * 14.35, -0.05, z, 0.95, yaw, '#a3927a'); rock(sx * 14.35 + 0.55 * Math.cos(yaw * D), -0.08, z - 0.55 * Math.sin(yaw * D), 0.6, yaw + 40, C.rock);
      }
      else if (kind === 'drums') {
        w.cylinder({ pos: [sx * 14.3, 0.48, z], radius: 0.48, height: 2.1, sides: 8, rot: [90, R.range(-6, 6), 0], color: R.pick(C.wall) });
        w.cylinder({ pos: [sx * 14.4, 0.4, z + 1.9], radius: 0.4, height: 0.8, sides: 8, yaw: 10, color: R.pick(C.wall) });
      } else if (kind === 'shields') {
        for (const dz of [-0.45, 0.5]) {
          const rot = [16, sx * 90, R.range(-5, 5)], pos = [sx * 14.62, 0.74, z + dz];
          const c = new T.Vector3(0, -0.05, 0).applyEuler(new T.Euler(rot[0] * D, rot[1] * D, rot[2] * D, 'YXZ'));
          w.box({ pos: [pos[0] + c.x, pos[1] + c.y, pos[2] + c.z], size: [0.6, 1.4, 0.35], rot, invisible: true });
          shieldLook(pos, rot);
        }
        w.cylinder({ pos: [sx * 14.6, 1.0, z], radius: 0.035, height: 2.2, rot: [0, 0, sx * -12], color: C.woodDark, collide: false });
      } else if (kind === 'stub') {
        w.box({ pos: [sx * 14.3, 0.8, z], size: [1.4, 1.6, 0.9], color: R.pick(C.wall) });
        w.box({ pos: [sx * 14.5, 1.85, z], size: [0.9, 0.5, 0.8], yaw: 8, color: R.pick(C.wall), collide: false });
        for (const dz of [-0.9, 0.8]) w.box(deco({ pos: [sx * 14.4, 0.13, z + dz], size: [0.5, 0.26, 0.45], yaw: R.range(0, 90), color: R.pick(C.wall), shadow: true }));
      }
    };
    for (const [sx, z, kind] of [[1, -50, 'column'], [1, -35, 'boulder'], [1, -18, 'shields'], [1, 13, 'drums'], [1, 31, 'column'], [1, 47, 'boulder'],
      [-1, -47, 'drums'], [-1, -31, 'column'], [-1, -14, 'boulder'], [-1, 17, 'shields'], [-1, 35, 'stub'], [-1, 51, 'column'], [1, -55, 'stub']]) lanePiece(sx, z, kind);

    // ---------- the camps: paving, lanterns, banners, and supplies in the corners (each with a collider) ----------
    const tent = (team, x, z) => { // canvas A-frame (two wedges), a team door flap and a pennant; one box collider
      for (const s of [-1, 1]) w.ramp({ pos: [x + s * 0.65, 0.9, z], size: [3.2, 1.8, 1.3], yaw: s < 0 ? 90 : -90, color: C.canvas, collide: false });
      w.box({ pos: [x, 1.83, z], size: [0.12, 0.08, 3.5], color: C.woodDark, collide: false });
      w.box({ pos: [x, 0.5, z + 1.62], size: [0.95, 1.0, 0.04], color: TEAM[team].cloth, collide: false });
      w.cylinder({ pos: [x, 2.3, z + 1.5], radius: 0.03, height: 1.0, color: C.woodDark, collide: false });
      banner(null, team, 0.45, 0.6, x, 2.75, z + 1.5, 0, 0.08);
      w.box({ id: 'tent', pos: [x, 0.9, z], size: [2.6, 1.8, 3.2], color: C.canvas }).mesh.visible = false;
    };
    const crates = (x, z) => {
      w.box({ pos: [x, 0.45, z], size: [0.9, 0.9, 0.9], yaw: 8, color: C.wood });
      w.box({ pos: [x + 1, 0.4, z + 0.2], size: [0.8, 0.8, 0.8], yaw: -12, color: C.wood2 });
      w.box({ pos: [x + 0.4, 1.25, z + 0.05], size: [0.7, 0.7, 0.7], yaw: 25, color: C.wood, collide: false });
    };
    const rack = (x, z, s) => { // a weapon rack with kite shields leaning on it
      for (const dx of [-1.3, 1.3]) w.cylinder({ pos: [x + dx, 0.65, z], radius: 0.07, height: 1.3, color: C.woodDark, collide: false });
      w.box({ pos: [x, 1.15, z], size: [2.8, 0.1, 0.1], color: C.wood, collide: false });
      for (const dx of [-0.85, 0, 0.85]) shieldLook([x + dx, 0.76, z + s * 0.2], [s * -14, 0, R.range(-4, 4)], s > 0 ? 0 : 1);
      w.box({ id: 'rack', pos: [x, 0.75, z + s * 0.1], size: [3, 1.5, 0.9], color: C.wood }).mesh.visible = false;
    };
    for (const team of [0, 1]) {
      const s = team === 0 ? 1 : -1, Z = (z) => s * z;
      // a packed-earth yard, paved around the fountain and along the way out, worn bare elsewhere
      w.box(deco({ pos: [0, 0.02, Z(70.5)], size: [41, 0.02, 23], color: C.lane }));
      for (let z = 59.8; z < 81.8; z += 1.62) for (let x = -19.6; x < 19.7; x += 1.62) {
        const r = Math.hypot(x, z - 76);
        if (r < 5.3 || R() < (r < 9.5 || Math.abs(x) < 5.2 ? 0.1 : 0.7)) continue;
        w.box(deco({ pos: [x + R.range(-0.06, 0.06), R.range(0.042, 0.048), Z(z + R.range(-0.06, 0.06))], size: [R.range(1.3, 1.52), 0.03, R.range(1.3, 1.52)], yaw: R.range(-3, 3), color: R.pick(C.slab) }));
      }
      for (const sx of [-1, 1]) {
        post(sx * 6.2, Z(78.6));
        poleBanner(team, sx * 4.4, Z(81.4));
        poleBanner(team, sx * 7.4, Z(64.6));
        banner(null, team, 1.1, 2.3, sx * 18.25, 5.3, Z(58.5) + s * 0.6, 0); // over the camp gate
        w.cylinder({ pos: [sx * 18.25, 4, Z(58.5)], radius: 0.07, height: 3.6, color: C.woodDark, collide: false });
        tent(team, sx * 17.9, Z(78.4));
        { // barrels: the same box collider (5.1 by 3.8, turned a quarter), a cluster of barrels to see
          const bx = sx * 17.6, bz = Z(65.6);
          w.box({ pos: [bx - 0.3, 0.54, bz + 0.13], size: [5.1, 1.1, 3.8], yaw: 90, invisible: true });
          for (const [dx, dz, h] of [[-1.2, -1.6, 1], [0.1, -1.4, 1], [1.2, -1.7, 1], [-1.1, -0.2, 1], [0.2, 0.1, 1], [1.2, -0.3, 1], [-0.5, 1.4, 0.8], [0.8, 1.5, 1]]) {
            const px = bx - 0.3 + dx, pz = bz + 0.13 + dz;
            w.cylinder({ pos: [px, 0.04 + 0.5 * h, pz], radius: 0.46, height: 1.0 * h, sides: 10, color: C.wood, collide: false });
            for (const y of [0.22, 0.78]) w.cylinder({ pos: [px, 0.04 + y * h, pz], radius: 0.475, height: 0.06, sides: 10, color: C.woodDark, collide: false, shadow: false });
          }
        }
        crates(sx * 16.6 - (sx < 0 ? 1 : 0), Z(71.4));
        rack(sx * 18.6, Z(60.5), s);
      }
    }

    // ---------- beyond the walls, out of reach (no colliders): quiver trees, acacias, boulders and old colonnades ----------
    const spot = (lo, hi) => {
      for (;;) {
        const x = (R() < 0.5 ? -1 : 1) * R.range(lo, hi), z = R.range(-92, 92);
        if (Math.abs(z) < 6.5 || (Math.abs(z) > 56.5 && Math.abs(x) < 23.2)) continue; // the river, the camps
        return [x, z];
      }
    };
    const out = (x, need) => Math.sign(x) * Math.max(Math.abs(x), need); // keep a model's footprint outside the walls
    for (let i = 0; i < 12; i++) { const s = R.range(2.3, 3.4), [x, z] = spot(18.5, 31); quiver(out(x, 16.8 + 0.65 * s), z, s * 0.8, R.range(0, 360)); }
    for (let i = 0; i < 9; i++) { const s = R.range(1.1, 2.2), [x, z] = spot(17, 32); rock(out(x, 16.8 + 1.4 * s), -0.1, z, 0.9 * s, R.range(0, 360), '#a3927a'); }
    for (let i = 0; i < 6; i++) { const s = R.range(1.4, 2.4), [x, z] = spot(17, 34); rock(out(x, 16.8 + 1.0 * s), -0.1, z, 0.75 * s, R.range(0, 360)); }
    for (let i = 0; i < 4; i++) { const s = R.range(1.1, 1.5), [x, z] = spot(18, 30); log(out(x, 16.8 + 1.6 * s), z, s, R.range(0, 360)); }
    for (const sx of [-1, 1]) { rock(sx * 26, -0.05, sx * 8.2, 0.7, sx * 40, C.rock); rock(sx * 26.8, -0.05, sx * 8.9, 0.45, sx * 70, '#8d9a6a'); }
    const acacia = (x, z, s) => {
      w.cylinder({ pos: [x, 1.5 * s, z], radius: 0.18 * s, height: 3 * s, rot: [R.range(-8, 8), 0, R.range(-6, 6)], color: C.bark, collide: false });
      for (const k of [-1, 1]) w.cylinder({ pos: [x + k * 0.55 * s, 3.1 * s, z], radius: 0.1 * s, height: 1.6 * s, rot: [0, 0, -k * 35], color: C.bark, collide: false });
      w.sphere({ pos: [x, 3.85 * s, z], radius: 1, low: true, scale: [3.4 * s, 0.55 * s, 2.9 * s], yaw: R.range(0, 180), color: C.canopy, collide: false });
      w.sphere({ pos: [x + 0.8 * s, 4.15 * s, z - 0.4 * s], radius: 1, low: true, scale: [1.9 * s, 0.4 * s, 1.7 * s], color: C.canopy2, collide: false });
    };
    for (let i = 0; i < 9; i++) { const s = R.range(0.9, 1.3), [x, z] = spot(22, 40); acacia(out(x, 17 + 3.4 * s), z, s); }
    const colonnade = (x, z) => { // runs roughly along z, so it never reaches a wall
      const a = R.range(65, 115) * D, n = 2 + Math.floor(R() * 3);
      let prev = false;
      for (let i = 0; i < n; i++) {
        const d = (i - (n - 1) / 2) * 2.7, whole = R() < 0.45;
        column(x + Math.cos(a) * d, z + Math.sin(a) * d, whole ? 3.4 : R.range(0.6, 2.4), { cap: whole });
        if (whole && prev) { const m = d - 1.35; w.box({ pos: [x + Math.cos(a) * m, 4.32, z + Math.sin(a) * m], size: [3.9, 0.5, 0.9], yaw: -a / D, color: C.wall[2], collide: false }); }
        prev = whole;
      }
      for (let k = 0; k < 2; k++) w.cylinder({ pos: [x + R.range(-2.5, 2.5), 0.42, z + R.range(-2.5, 2.5)], radius: 0.42, height: R.range(0.8, 1.6), sides: 8, rot: [90, R.range(0, 180), 0], color: R.pick(C.wall), collide: false });
    };
    for (let i = 0; i < 7; i++) { const [x, z] = spot(24.5, 36); colonnade(x, z); }
    for (const [x, z] of [[-9, -89.5], [10, -89.5], [-30, -89], [30, -89.5]]) colonnade(x, z); // seen from the red camp
    for (const [x, z, s] of [[-16, -88, 2.8], [3, -89, 3.1], [24, -86, 2.6]]) quiver(x, z, s * 0.8, x * 7);
    w.particles({ pos: [0, 0, 0], area: [44, 5, 170], count: 70, color: ['#fff3d6', '#f0dcae'], size: 0.1, kind: 'float' }); // dust in the light

    // camps: fountains (the spires and towers come with the units below)
    const fountains = TEAM.map((t) => {
      const [x, z] = t.fountain;
      w.cylinder({ pos: [x, 0.15, z], radius: 5, height: 0.3, color: C.stone });
      w.cylinder({ pos: [x, 0.32, z], radius: 4.2, height: 0.06, color: t.color, glow: 0.8, opacity: 0.7, collide: false, shadow: false });
      w.light({ pos: [x, 3, z], color: t.color, intensity: 18, distance: 14 });
      return { x, z };
    });
    w.portal({ pos: [0, 0, 81], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Leave the arena', arrive: 7 });

    // =====================================================================================
    // Units: every fighter, tower and spire is a plain record, updated in the tick (so replays match)
    // =====================================================================================
    const units = [];
    let uid = 0;
    // health bars: a dark back and a coloured fill, facing the fixed camera
    const barBack = w.mat('#1a1a22', {}), barFill = [w.mat(C.blue, { glow: 0.6 }), w.mat(C.red, { glow: 0.6 })], barShield = w.mat('#ffffff', { glow: 0.8 });
    const makeBar = (u, width, height) => {
      const g = new T.Group(); g.position.y = height;
      const back = new T.Mesh(geo.box, barBack); back.scale.set(width + 0.08, 0.18, 0.04);
      const fill = new T.Mesh(geo.box, barFill[u.team]); fill.scale.set(width, 0.12, 0.05); fill.position.z = 0.01;
      const sh = new T.Mesh(geo.box, barShield); sh.scale.set(0.001, 0.12, 0.05); sh.position.z = 0.012; sh.visible = false;
      g.add(back, fill, sh); g.rotation.x = -34 * D;
      u.bar = { g, fill, sh, width };
      return g;
    };
    const addUnit = (o) => {
      const u = Object.assign({ id: uid++, alive: true, cd: 0, shield: 0, shieldT: 0, aggroT: -9, target: null, hitBy: null }, o);
      u.max = u.hp;
      units.push(u);
      return u;
    };

    // towers and spires
    const towerAt = (team, x, z) => {
      const t = TEAM[team];
      const col = w.cylinder({ id: 'tower', pos: [x, 2.5, z], radius: 1.3, height: 5, color: C.stone, sides: 8, yaw: 22.5 });
      const g = new T.Group(); g.position.set(x, 0, z);
      const plinth = mesh(geo.cyl8, C.wall[1]); plinth.scale.set(1.62, 0.45, 1.62); plinth.position.y = 0.22; plinth.rotation.y = 22.5 * D; g.add(plinth);
      const crystal = mesh(geo.oct, t.color, { glow: 2.2 }); crystal.scale.set(0.7, 1.1, 0.7); crystal.position.y = 6.1; g.add(crystal);
      const cap = mesh(geo.cyl, C.dark); cap.scale.set(1.5, 0.35, 1.5); cap.position.y = 5.1; g.add(cap);
      for (let i = 0; i < 8; i++) { const a = (i * 45 + 22.5) * D, m = mesh(geo.box, C.stone); m.scale.set(0.5, 0.42, 0.3); m.position.set(Math.sin(a) * 1.33, 5.48, Math.cos(a) * 1.33); m.rotation.y = a; g.add(m); }
      for (const a of [-45, 45]) banner(g, team, 0.8, 2.0, Math.sin(a * D) * 1.27, 4.85, Math.cos(a * D) * 1.27, a, 0.05);
      g.add(makeBar({ team }, 2.6, 7.6)); w.add(g);
      // what stays when it falls: a broken stump and rubble (kill shows it; the stump keeps the tower's collider)
      const ruin = new T.Group(); ruin.position.set(x, 0, z); ruin.visible = false;
      const stump = mesh(geo.cyl8, C.stone); stump.scale.set(1.3, 1.0, 1.3); stump.position.y = 0.5; stump.rotation.y = 22.5 * D; ruin.add(stump);
      for (let i = 0; i < 3; i++) { const a = (i * 120 + R.range(0, 60)) * D, b = mesh(geo.box, i % 2 ? C.stone : C.wall[1]); b.scale.set(0.7, R.range(0.4, 0.9), 0.5); b.position.set(Math.sin(a) * 0.85, 1.0 + b.scale.y / 2 - 0.1, Math.cos(a) * 0.85); b.rotation.set(R.range(-0.2, 0.2), a, R.range(-0.2, 0.2)); ruin.add(b); }
      for (let i = 0; i < 12; i++) { const a = R.range(0, 6.3), d = R.range(1.5, 2.9), b = mesh(geo.box, R.pick([C.stone, C.wall[0], C.wall[1]])); b.scale.set(R.range(0.3, 0.6), R.range(0.15, 0.32), R.range(0.25, 0.5)); b.position.set(Math.sin(a) * d, b.scale.y / 2, Math.cos(a) * d); b.rotation.set(R.range(-0.3, 0.3), R.range(0, 3), R.range(-0.3, 0.3)); ruin.add(b); }
      const burn = new T.Mesh(geo.cyl8, w.mat(C.scorch, {})); burn.scale.set(3, 0.01, 3); burn.position.y = 0.07; ruin.add(burn);
      w.add(ruin);
      return addUnit({ team, kind: 'tower', x, z, hp: TUNE.towerHp, atk: 120, range: 8.5, cdMax: 1.1, radius: 1.4, group: g, crystal, col, warm: 0, ruin });
    };
    const spireAt = (team, x, z) => {
      const t = TEAM[team];
      const col = w.cylinder({ id: 'spire', pos: [x, 1, z], radius: 2.2, height: 2, color: C.stone, sides: 8, yaw: 22.5 });
      const g = new T.Group(); g.position.set(x, 0, z);
      const c = mesh(geo.oct, t.color, { glow: 2.6 }); c.scale.set(1.3, 3.2, 1.3); c.position.y = 5.2; g.add(c);
      const ring = mesh(geo.cyl, C.gold, { metal: 0.7 }); ring.scale.set(2.4, 0.25, 2.4); ring.position.y = 2.1; g.add(ring);
      const step = mesh(geo.cyl8, C.wall[1]); step.scale.set(2.55, 0.32, 2.55); step.position.y = 0.16; step.rotation.y = 22.5 * D; g.add(step);
      for (const a of [-45, 0, 45]) banner(g, team, 1.0, 1.55, Math.sin(a * D) * 2.47, 2.0, Math.cos(a * D) * 2.47, a, 0.05);
      g.add(makeBar({ team }, 3.4, 9.6)); w.add(g);
      return addUnit({ team, kind: 'spire', x, z, hp: TUNE.spireHp, atk: 0, range: 0, cdMax: 1, radius: 2.3, group: g, crystal: c, col });
    };
    // makeBar sets u.bar on the object it is given; rebuild the link for towers and spires
    const linkBar = (u) => { const g = u.group.children[u.group.children.length - 1]; u.bar = { g, fill: g.children[1], sh: g.children[2], width: g.children[1].scale.x }; };
    const towers = [towerAt(0, 5, 44), towerAt(0, 5, 24), towerAt(1, -5, -24), towerAt(1, -5, -44)].map((u) => { linkBar(u); return u; });
    const spires = [spireAt(0, 0, 62), spireAt(1, 0, -62)].map((u) => { linkBar(u); return u; });

    // champions
    const player = addUnit({ team: 0, kind: 'champ', x: 0, z: 74, hp: 560, atk: 34, range: 6, cdMax: 0.85, radius: 0.6, name: 'You', lvl: 1, xp: 0 });
    const rivalAv = w.avatar({ colors: { body: '#d64545', head: '#f2e6e6', visor: '#ffd166' }, eq: { head: 'tophat' }, name: 'Rival', nameColor: '#ffb3b3' });
    const rival = addUnit({ team: 1, kind: 'champ', x: 0, z: -74, hp: 560, atk: 32, range: 6, cdMax: 0.9, radius: 0.6, name: 'Rival', lvl: 1, xp: 0, av: rivalAv, yaw: 0, mode: 'lane', qcd: 0, ecd: 0, rcd: 0, dcd: 0 });
    // champions' bars float above them, facing the camera (placed each frame)
    const rivalBar = makeBar(rival, 1.6, 0); w.add(rivalBar);
    const youBar = makeBar(player, 1.6, 0); w.add(youBar);

    // =====================================================================================
    // Gear from other worlds: equipped items (and sigils carried) become match bonuses
    // =====================================================================================
    const gear = { speed: 0, dashCd: 1, ap: 0, recall: 1, dmg: 0, atk: 0, gold: 0, lines: [] };
    const readGear = () => {
      Object.assign(gear, { speed: 0, dashCd: 1, ap: 0, recall: 1, dmg: 0, atk: 0, gold: 0, lines: [] });
      const eq = w.equipment();
      for (const [slot, id] of Object.entries(eq)) {
        const it = id && w.itemInfo(id);
        if (!it) continue;
        // keyed on traits, not item ids, so items made later (by anyone) count too
        if (slot === 'hand' && it.traits.includes('blade')) { gear.atk += TUNE.bladeAtk; gear.lines.push(`${it.name}: +${Math.round(TUNE.bladeAtk * 100)}% attack damage`); }
        if (it.traits.includes('glide')) { gear.speed += TUNE.glideSpeed; gear.lines.push(`${it.name}: +${Math.round(TUNE.glideSpeed * 100)}% move speed`); }
        if (it.traits.includes('doublejump')) { gear.dashCd *= TUNE.dashCd; gear.lines.push(`${it.name}: dash recharges ${Math.round((1 - TUNE.dashCd) * 100)}% faster`); }
        if (it.traits.includes('light')) { gear.ap += TUNE.lightAp; gear.lines.push(`${it.name}: +${Math.round(TUNE.lightAp * 100)}% ability power`); }
        if (it.traits.includes('board')) { gear.recall *= 0.5; gear.lines.push(`${it.name}: recall twice as fast`); }
        if (it.traits.includes('speed')) gear.lines.push(`${it.name}: +25% move speed`); // the engine already applies it
        if (id === 'crown') { gear.gold += 0.1; gear.lines.push('Founder\'s Crown: +10% gold'); }
      }
      for (const s of ['sigil-sky', 'sigil-deep', 'sigil-speed']) if (w.has(s)) { gear.dmg += 0.04; const it = w.itemInfo(s); gear.lines.push(`${it ? it.name : s}: +4% damage`); }
      w.player.setSpeed(0.78 * (1 + gear.speed));
    };

    // =====================================================================================
    // Match state
    // =====================================================================================
    const ROUND_SPAWN = TUNE.wave;
    let state = 'pre', t0 = 0, endT = 0, waveT = 0, gold = 0, kills = 0, deaths = 0, cs = 0, upgradeIx = 0, surging = false, result = null, ease = 0;
    const taken = [0, 0]; // damage each side's towers and spire have taken in this match (crumbling not counted)
    const UPGRADES = [
      { name: 'Ember Blade', atk: 14, cost: 300 }, { name: 'Ward Plate', hp: 220, cost: 300 }, { name: 'Swift Greaves', speed: 0.1, cost: 280 },
      { name: 'Arc Focus', ap: 0.25, cost: 420 }, { name: 'Titan Plate', hp: 360, cost: 560 }, { name: 'Storm Blade', atk: 24, cost: 620 }, { name: 'Starheart', ap: 0.35, hp: 200, cost: 800 },
    ];
    const bonus = { atk: 0, hp: 0, speed: 0, ap: 0 };
    const xpFor = (lvl) => [0, 120, 280, 470, 700, 960, 1250, 1580, 1950][Math.min(lvl, 8)];
    const statsFor = (u) => { const L = u.lvl - 1; return { hp: 560 + 82 * L + (u === player ? bonus.hp : 0), atk: 34 + 5 * L + (u === player ? bonus.atk : 0) }; };
    const P = { qcd: 0, ecd: 0, rcd: 0, dcd: 0, recallT: -1, dead: 0, starfall: null };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
    const enemiesOf = (u) => units.filter((v) => v.alive && v.team !== u.team);
    const towersUp = (team) => towers.filter((t) => t.alive && t.team === team).length;
    const targetable = (v) => v.kind !== 'spire' || towersUp(v.team) === 0;

    // ---------- visual effects (pure decoration; the tick decides everything) ----------
    const fx = [];
    const tracer = (a, b, color, life = 0.18, size = 0.22) => {
      const m = mesh(geo.sphere, color, { glow: 2.2 }); m.scale.setScalar(size); m.castShadow = false;
      w.add(m); fx.push({ m, ax: a.x, az: a.z, ay: 1.4, bx: b.x, bz: b.z, by: 1.2, t: 0, life });
    };

    // ---------- damage, death, rewards ----------
    const sound = (n) => w.sound(n);
    const damage = (target, amount, src) => {
      if (!target.alive || amount <= 0) return;
      if (target.kind === 'spire' && towersUp(target.team) > 0) return;
      if (target === player && P.dead) return;
      let a = amount;
      if (target.kind === 'tower' || target.kind === 'spire') { if (surging) a *= 1 + TUNE.surgeStructure; taken[target.team] += Math.min(a, target.hp); }
      if (target.shield > 0) { const s = Math.min(target.shield, a); target.shield -= s; a -= s; }
      target.hp -= a; target.hitBy = src; target.lastHurt = w.time;
      if (src && src.kind === 'champ' && target.kind === 'champ') src.aggroT = w.time;
      if (target === player && P.recallT >= 0) { P.recallT = -1; w.toast('Recall interrupted'); }
      if (target === rival && rival.recallT >= 0) rival.recallT = -1;
      if (target.hp <= 0) kill(target, src);
    };
    // the rival catches up when it falls behind in levels (it has no fountain trips to make up for it)
    const giveXp = (team, x, z, amount) => { for (const c of [player, rival]) if (c.team === team && c.alive && Math.hypot(c.x - x, c.z - z) < 14) gainXp(c, c === rival ? amount * (1 + 0.35 * Math.max(0, player.lvl - rival.lvl)) : amount); };
    const gainXp = (c, amount) => {
      c.xp += amount;
      while (c.lvl < 9 && c.xp >= xpFor(c.lvl)) {
        c.lvl++;
        const s = statsFor(c), frac = c.hp / c.max;
        c.max = s.hp; c.hp = Math.min(c.max, c.hp + 82 * frac + 40); c.atk = s.atk;
        if (c === player) { w.toast(`Level ${c.lvl}!${c.lvl === 3 ? ' Starfall (R) unlocked.' : ''}`, 'item'); sound('checkpoint'); }
      }
    };
    const earn = (n) => { gold += Math.round(n * (1 + gear.gold)); };
    const kill = (u, src) => {
      u.alive = false; u.hp = 0;
      if (u.kind === 'melee' || u.kind === 'ranged') {
        if (u.mesh) u.mesh.removeFromParent();
        giveXp(1 - u.team, u.x, u.z, u.kind === 'melee' ? 17 : 14);
        if (src === player) { earn(u.kind === 'melee' ? 22 : 17); cs++; }
      } else if (u.kind === 'tower') {
        u.group.visible = false; u.col.mesh.visible = false; u.ruin.visible = true; // the stump keeps its collider
        w.burst([u.x, 4, u.z], { color: [TEAM[u.team].color, '#ffffff', C.gold], count: 70, speed: 10, life: 1.2 }); w.shake(0.4); sound('crumble');
        if (u.team === 1) { earn(160); w.banner('TOWER DOWN', towersUp(1) ? 'One more stands before their spire.' : 'Their spire is exposed!'); }
        else w.banner('YOUR TOWER FELL', towersUp(0) ? 'Hold the line.' : 'Your spire is exposed!');
        giveXp(1 - u.team, u.x, u.z, 60);
      } else if (u.kind === 'spire') {
        u.group.visible = false; u.col.hide();
        finish(u.team === 1);
      } else if (u === player) {
        deaths++; P.dead = TUNE.respawn + TUNE.respawnLvl * player.lvl; P.recallT = -1; w.player.freeze(true);
        w.banner('DEFEATED', `Back in ${Math.ceil(P.dead)} s`); sound('lose');
        if (src === rival) gainXp(rival, 120);
      } else if (u === rival) {
        rival.dead = TUNE.respawn + TUNE.respawnLvl * rival.lvl; rival.av.root.visible = false; kills++;
        earn(260); gainXp(player, 120); w.banner('RIVAL DOWN', '+260 gold'); sound('win');
      }
    };
    const respawnPlayer = () => {
      player.alive = true; player.hp = player.max; player.shield = 0; P.dead = 0;
      const f = fountains[0];
      w.player.setPos([f.x, 1.0, f.z - 2], 180); w.player.freeze(false);
    };

    // ---------- minions ----------
    const spawnWave = () => {
      for (let team = 0; team < 2; team++) {
        const t = TEAM[team], z0 = t.spire[1] + (team === 0 ? -5 : 5), grow = (1 + TUNE.minionGrowth * (w.time - t0) / 60) * (surging ? 1 + TUNE.surgeGrow : 1); // later waves hit harder
        for (let i = 0; i < 5; i++) {
          const kind = i < 3 ? 'melee' : 'ranged', lane = [-1.8, 0, 1.8, -1, 1][i];
          const m = kind === 'melee' ? mesh(geo.box, t.color, { rough: 0.6 }) : mesh(geo.cone, t.color, { glow: 0.3 });
          if (kind === 'melee') m.scale.set(0.8, 1.0, 0.8); else m.scale.set(0.55, 1.2, 0.55);
          const g = new T.Group(); m.position.y = kind === 'melee' ? 0.5 : 0.6; g.add(m);
          const head = mesh(geo.sphere, '#f2efe6'); head.scale.setScalar(0.28); head.position.y = kind === 'melee' ? 1.2 : 1.35; g.add(head);
          const u = addUnit({ team, kind, x: lane, z: z0 - t.dir * (i >= 3 ? -2.2 : 0), hp: (kind === 'melee' ? 320 : 230) * grow, atk: (kind === 'melee' ? 14 : 22) * grow, range: kind === 'melee' ? 1.7 : 5.5, cdMax: kind === 'melee' ? 1.2 : 1.6, speed: 3.4, radius: 0.5, lane });
          g.add(makeBar(u, 0.9, 1.8)); g.position.set(u.x, 0, u.z); if (surging) g.scale.setScalar(1.25); w.add(g); u.mesh = g;
        }
      }
    };

    // ---------- the match ----------
    const reset = () => {
      for (const u of units) if (u.kind === 'melee' || u.kind === 'ranged') { if (u.mesh) u.mesh.removeFromParent(); }
      for (let i = units.length - 1; i >= 0; i--) if (units[i].kind === 'melee' || units[i].kind === 'ranged') units.splice(i, 1);
      for (const u of towers.concat(spires)) { u.alive = true; u.hp = u.max; u.group.visible = true; u.col.show(); if (u.ruin) u.ruin.visible = false; u.warm = 0; u.target = null; }
      Object.assign(bonus, { atk: 0, hp: 0, speed: 0, ap: 0 }); upgradeIx = 0; gold = 500; kills = 0; deaths = 0; cs = 0; surging = false; result = null; taken[0] = taken[1] = 0;
      for (const c of [player, rival]) { c.lvl = 1; c.xp = 0; const s = statsFor(c); c.max = c.hp = s.hp; c.atk = s.atk; c.shield = 0; c.alive = true; c.target = null; c.recallT = -1; }
      Object.assign(P, { qcd: 0, ecd: 0, rcd: 0, dcd: 0, recallT: -1, dead: 0, starfall: null });
      Object.assign(rival, { x: 0, z: -74, mode: 'lane', qcd: 3, ecd: 0, rcd: 0, dcd: 0, dead: 0, recallT: -1 }); rival.av.root.visible = true;
      readGear();
      // a player who keeps losing meets an easier rival: 10% weaker for each defeat in a row (at most 3). A win against
      // it counts for everything but the leaderboard time, so losing on purpose buys no record.
      ease = Math.min(3, w.store.get('lossStreak', 0));
      rival.max = rival.hp = statsFor(rival).hp * (1 - 0.1 * ease); rival.atk = statsFor(rival).atk * (1 - 0.1 * ease);
      if (ease) w.toast(`The rival is ${10 * ease}% weaker this match (${ease} defeat${ease > 1 ? 's' : ''} in a row).`);
      respawnPlayer();
      state = 'countdown'; t0 = w.time; waveT = 6;
      w.timer.cancel();
      w.objective('Get ready: topple the red towers, then their spire.');
    };
    let shownCd = -1;
    // the Founder's last Echo (GAME.md): win a battle, and it wakes by your fountain
    const echo5 = w.echo({ id: '5', pos: [-4.5, 1.6, 79.5], hidden: !(w.store.get('wins', 0) > 0), line: 'That is all of me I could leave behind. Take my words back to the stone.', next: "All five Echoes are yours. Take them back to the Echo Stone in the Vault." });
    const finish = (won) => {
      if (state === 'over') return; // both spires in one tick: the first decides
      state = 'over'; endT = w.time; result = won ? 'won' : 'lost';
      const t = w.timer.stop();
      w.store.set('lossStreak', won ? 0 : Math.min(9, w.store.get('lossStreak', 0) + 1));
      if (won) {
        if (!ease) { w.record('victory', t); const best = w.store.get('best', null); if (best == null || t < best) w.store.set('best', t); }
        else w.after(3, () => w.toast('A win against an easier rival: it counts, but sets no leaderboard time.'));
        const wins = w.store.get('wins', 0) + 1; w.store.set('wins', wins);
        w.banner('VICTORY', `${w.fmtTime(t)} · ${kills} takedowns · ${cs} minions`); sound('win'); w.shake(0.6);
        w.addCoins(30);
        if (!w.has('spire-circlet')) w.after(2.5, () => w.give('spire-circlet'));
        if (!echo5.shown) { echo5.reveal(); if (w.flag('hunt.started') && !w.has('echo-5')) w.after(5, () => w.toast('An echo stirs by your fountain.', 'item')); }
      } else {
        w.banner('DEFEAT', 'Your spire fell. A new match starts shortly.'); sound('lose');
        w.addCoins(5);
      }
      w.objective(won ? 'Victory! A new match starts in a few seconds, or take the portal home.' : 'Defeat. A new match starts in a few seconds.');
    };

    // ---------- abilities ----------
    const nearestEnemy = (u, range, filter) => {
      let best = null, bd = range;
      for (const v of units) { if (!v.alive || v.team === u.team || (filter && !filter(v)) || !targetable(v)) continue; const d = dist(u, v) - (v.radius || 0.5); if (d < bd) { bd = d; best = v; } }
      return best;
    };
    const bolts = [];
    const castBolt = (u, aim, dmg) => {
      let dx, dz;
      if (aim) { dx = aim.x - u.x; dz = aim.z - u.z; } else { dx = Math.sin(u.yaw); dz = Math.cos(u.yaw); }
      const l = Math.hypot(dx, dz) || 1;
      const m = mesh(geo.sphere, TEAM[u.team].color, { glow: 3 }); m.scale.setScalar(0.45); m.castShadow = false; w.add(m);
      bolts.push({ team: u.team, src: u, x: u.x, z: u.z, dx: dx / l, dz: dz / l, left: 14, dmg, m });
      sound('boost');
    };
    const castStarfall = (u, at, dmg) => {
      const ring = mesh(geo.cyl, TEAM[u.team].color, { glow: 1.6, opacity: 0.45 }); ring.scale.set(5, 0.05, 5); ring.position.set(at.x, 0.1, at.z); ring.castShadow = false; w.add(ring);
      return { team: u.team, src: u, x: at.x, z: at.z, t: 0.7, dmg, ring };
    };
    const rivalFalls = [];
    const dodgeRoll = w.rand(5);

    // =====================================================================================
    // The tick
    // =====================================================================================
    w.on('tick', (dt) => {
      // player record follows the engine's player
      const pp = w.player.pos; player.x = pp[0]; player.z = pp[2]; player.yaw = w.player.yaw * D;
      if (state === 'pre') return;
      if (state === 'countdown') {
        const n = 3 - Math.floor(w.time - t0);
        if (n !== shownCd) { shownCd = n; if (n > 0) { w.banner(String(n), n === 3 ? (gear.lines.length ? 'Your gear: ' + gear.lines.join(' · ') : 'No gear bonuses: bring items from other worlds!') : ''); sound('countdown'); } }
        if (w.time - t0 >= 3) { state = 'live'; w.banner('FIGHT!', 'Push the lane. Topple their towers, then their spire.'); sound('go'); w.timer.start(); }
        return;
      }
      if (state === 'over') { if (w.time - endT > 9) reset(); return; }

      // waves and passive gold; at surgeAt the waves surge (a stalled match still ends)
      if (!surging && TUNE.surgeAt > 0 && w.time - t0 - 3 >= TUNE.surgeAt) {
        surging = true; waveT = Math.min(waveT, 2);
        w.banner('SURGE!', 'Towers and spires crumble, and the waves hit harder. Finish it!'); sound('countdown'); w.shake(0.3);
      }
      waveT -= dt;
      if (waveT <= 0) { spawnWave(); waveT = surging ? TUNE.surgeWave : ROUND_SPAWN; }
      if (surging && TUNE.surgeDecay > 0) {
        const fell = [];
        for (const u of towers.concat(spires)) if (u.alive && targetable(u)) {
          u.hp -= u.max * TUNE.surgeDecay * dt;
          if (u.hp <= 0) fell.push(u);
          else if (w.ticks % 90 === 0) w.burst([u.x, 2.5, u.z], { color: [C.stone, C.sand, C.kerb], count: 12, speed: 2.5, life: 0.9 }); // crumbling dust
        }
        // both spires crumbling away in the same tick: the side whose structures took more damage falls (dead even: theirs)
        if (fell.filter((u) => u.kind === 'spire').length === 2) { const keep = spires[taken[0] > taken[1] ? 1 : 0]; keep.hp = 1; fell.splice(fell.indexOf(keep), 1); }
        for (const u of fell) kill(u, null);
      }
      if (Math.floor(w.time * 2) !== Math.floor((w.time - dt) * 2)) earn(1);

      // ---------- the player ----------
      const inp = w.input, moving = Math.hypot(inp.move[0], inp.move[1]) > 0.1;
      for (const k of ['qcd', 'ecd', 'rcd', 'dcd']) P[k] = Math.max(0, P[k] - dt);
      if (P.dead > 0) { P.dead -= dt; if (P.dead <= 0) respawnPlayer(); }
      else {
        const ap = 1 + gear.ap + bonus.ap, dmgMul = 1 + gear.dmg;
        if (inp.q && P.qcd <= 0) { const aim = nearestEnemy(player, 13, (v) => v.kind === 'champ') || nearestEnemy(player, 13); castBolt(player, aim, (75 + 26 * (player.lvl - 1)) * ap * dmgMul); P.qcd = 5; }
        if (inp.e && P.ecd <= 0) { player.shield = (110 + 36 * (player.lvl - 1)) * ap; player.shieldT = 3; P.ecd = 13; sound('pickup'); w.burst([player.x, 1.4, player.z], { color: ['#ffffff', C.blue], count: 18, speed: 3, life: 0.5 }); }
        if (inp.r && P.rcd <= 0 && player.lvl >= 3) { const at = nearestEnemy(player, 12, (v) => v.kind === 'champ') || nearestEnemy(player, 10) || player; P.starfall = castStarfall(player, { x: at.x, z: at.z }, (220 + 75 * (player.lvl - 1)) * ap * dmgMul); P.rcd = 55; sound('open'); }
        else if (inp.r && player.lvl < 3) w.toast('Starfall unlocks at level 3');
        if (inp.dash && P.dcd <= 0) { const dx = Math.sin(player.yaw), dz = Math.cos(player.yaw); w.player.launch(0.1, dx * 30, dz * 30); P.dcd = 12 * gear.dashCd; sound('jump'); }
        if (inp.recall && P.recallT < 0) { P.recallT = 3 * gear.recall; w.toast(`Recalling… (${P.recallT.toFixed(1)} s, don't move)`); }
        if (P.recallT >= 0) {
          if (moving) { P.recallT = -1; w.toast('Recall cancelled'); }
          else { P.recallT -= dt; if (P.recallT < 0) { const f = fountains[0]; w.player.setPos([f.x, 1.0, f.z - 2], 180); sound('portal'); } }
        }
        if (player.shieldT > 0) { player.shieldT -= dt; if (player.shieldT <= 0) player.shield = 0; }
        // automatic attacks while standing still
        player.cd -= dt;
        if (!moving && player.cd <= 0) {
          // siege rule: with your minions at an enemy structure, hit the structure; otherwise champions, then minions
          const sieging = (v) => (v.kind === 'tower' || v.kind === 'spire') && units.some((m) => m.alive && m.team === player.team && (m.kind === 'melee' || m.kind === 'ranged') && dist(m, v) < v.range + 2);
          const tgt = nearestEnemy(player, player.range, (v) => v.kind === 'champ') || nearestEnemy(player, player.range + TUNE.siegeReach, sieging) || nearestEnemy(player, player.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(player, player.range + 1);
          if (tgt) { damage(tgt, player.atk * (1 + gear.dmg) * (1 + gear.atk), player); player.cd = player.cdMax; tracer(player, tgt, C.blue); }
        }
        // fountain: heal, and buy the next upgrade when you can afford it
        const f = fountains[0];
        if (Math.hypot(player.x - f.x, player.z - f.z) < 5) {
          player.hp = Math.min(player.max, player.hp + player.max * 0.12 * dt);
          const up = UPGRADES[upgradeIx];
          if (up && gold >= up.cost) {
            gold -= up.cost; upgradeIx++;
            bonus.atk += up.atk || 0; bonus.hp += up.hp || 0; bonus.ap += up.ap || 0;
            if (up.speed) { bonus.speed += up.speed; w.player.setSpeed(0.78 * (1 + gear.speed + bonus.speed)); }
            const s = statsFor(player); player.max = s.hp; player.atk = s.atk; player.hp = Math.min(player.max, player.hp + (up.hp || 0));
            w.toast(`Bought ${up.name}`, 'item'); sound('coin');
          }
        }
      }

      // ---------- the rival ----------
      const rv = rival;
      for (const k of ['qcd', 'ecd', 'rcd', 'dcd']) rv[k] = Math.max(0, rv[k] - dt);
      if (rv.dead > 0) {
        rv.dead -= dt;
        if (rv.dead <= 0) { rv.alive = true; rv.hp = rv.max; rv.shield = 0; rv.x = 0; rv.z = -74; rv.av.root.visible = true; rv.mode = 'lane'; }
      } else if (rv.alive) {
        const frac = rv.hp / rv.max, pfrac = player.hp / player.max, dp = dist(rv, player);
        const blueTowerNearPlayer = towers.some((t) => t.alive && t.team === 0 && dist(t, player) < 9);
        if (rv.shieldT > 0) { rv.shieldT -= dt; if (rv.shieldT <= 0) rv.shield = 0; }
        let goal = null, fight = false;
        if (rv.recallT >= 0) {
          rv.recallT -= dt;
          if (rv.recallT < 0) { rv.x = 0; rv.z = -74; }
        } else if (frac < 0.28) {
          goal = { x: 0, z: -74 }; // retreat; recall when safe
          if (!player.alive || dp > 11) { rv.recallT = 3; }
          if (rv.dcd <= 0 && player.alive && dp < 6) { rv.dashT = 0.2; rv.dcd = 16; }
        } else if (player.alive && !P.dead && dp < 10 && !blueTowerNearPlayer && (frac > pfrac - 0.12 || pfrac < 0.4)) {
          fight = true; goal = dp > rv.range - 0.5 ? player : null;
          if (rv.qcd <= 0 && dp < 12) { castBolt(rv, player, 75 + 26 * (rv.lvl - 1)); rv.qcd = 5.5; }
          if (rv.ecd <= 0 && frac < 0.55) { rv.shield = 100 + 32 * (rv.lvl - 1); rv.shieldT = 3; rv.ecd = 15; }
          if (rv.rcd <= 0 && rv.lvl >= 3 && pfrac < 0.5 && dp < 8) { rivalFalls.push(castStarfall(rv, player, 200 + 70 * (rv.lvl - 1))); rv.rcd = 65; }
        } else {
          // stay a few steps behind the red frontline, or by the outer red tower
          let front = null;
          for (const m of units) if (m.alive && m.team === 1 && (m.kind === 'melee' || m.kind === 'ranged') && (!front || m.z > front.z)) front = m;
          goal = front ? { x: 2.5, z: front.z - 3.5 } : { x: 2.5, z: -28 };
          // never stand inside a blue tower's reach without minions to tank it
          for (const t of towers) if (t.alive && t.team === 0 && t.target && t.target === rv) goal = { x: 2.5, z: t.z - 11 };
        }
        // sidestep a bolt flying at it (a seeded roll, so a replay dodges the same way)
        if (rv.dodgeT > 0) rv.dodgeT -= dt;
        else for (const b of bolts) {
          if (b.team === rv.team || b.seen) continue;
          const rx = rv.x - b.x, rz = rv.z - b.z, along = rx * b.dx + rz * b.dz, off = Math.abs(rx * b.dz - rz * b.dx);
          if (along > 0 && along < 10 && off < 1.3) { b.seen = true; if (dodgeRoll() < 0.55) { const s = (rx * b.dz - rz * b.dx) >= 0 ? 1 : -1; rv.dodgeT = 0.35; rv.dodge = [b.dz * s, -b.dx * s]; } }
        }
        if (rv.dodgeT > 0 && rv.recallT < 0) { rv.x += rv.dodge[0] * 9 * dt; rv.z += rv.dodge[1] * 9 * dt; goal = null; rv.walking = true; }
        if (rv.recallT < 0 && goal) {
          const dx = goal.x - rv.x, dz = goal.z - rv.z, d = Math.hypot(dx, dz);
          const sp = 6.1 * (rv.dashT > 0 ? 4 : 1);
          if (rv.dashT > 0) rv.dashT -= dt;
          if (d > 0.3) { const step = Math.min(d, sp * dt); rv.x += dx / d * step; rv.z += dz / d * step; rv.yaw = Math.atan2(dx, dz); rv.walking = true; } else rv.walking = false;
        } else rv.walking = false;
        rv.x = Math.max(-13.5, Math.min(13.5, rv.x));
        rv.cd -= dt;
        if (rv.cd <= 0 && rv.recallT < 0) {
          const tgt = (fight && dp <= rv.range + 0.6) ? player : nearestEnemy(rv, rv.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(rv, rv.range + 1, (v) => v.kind !== 'champ');
          if (tgt && tgt.alive && !(tgt === player && P.dead)) { damage(tgt, rv.atk, rv); rv.cd = rv.cdMax; rv.yaw = Math.atan2(tgt.x - rv.x, tgt.z - rv.z); tracer(rv, tgt, C.red); }
        }
        if (Math.hypot(rv.x - fountains[1].x, rv.z - fountains[1].z) < 5) rv.hp = Math.min(rv.max, rv.hp + rv.max * 0.12 * dt);
        // the rival keeps pace with your upgrades as the match goes on
        const minute = (w.time - t0) / 60;
        rv.atk = statsFor(rv).atk * (1 + TUNE.rivalAtkPerMin * minute) * (1 - 0.1 * ease); rv.max = statsFor(rv).hp * (1 + TUNE.rivalHpPerMin * minute) * (1 - 0.1 * ease);
      }

      // ---------- minions ----------
      for (const m of units) {
        if (!m.alive || (m.kind !== 'melee' && m.kind !== 'ranged')) continue;
        m.cd -= dt;
        if (m.target && (!m.target.alive || dist(m, m.target) > 9 || !targetable(m.target) || (m.target === player && P.dead))) m.target = null;
        if (!m.target) m.target = nearestEnemy(m, 7, (v) => !(v === player && P.dead));
        const tgt = m.target;
        if (tgt && dist(m, tgt) - (tgt.radius || 0.5) <= m.range) {
          if (m.cd <= 0) { damage(tgt, m.atk, m); m.cd = m.cdMax; if (m.kind === 'ranged') tracer(m, tgt, TEAM[m.team].color, 0.25, 0.14); }
        } else {
          const gx = tgt ? tgt.x : m.lane, gz = tgt ? tgt.z : (m.team === 0 ? -66 : 66);
          const dx = gx - m.x, dz = gz - m.z, d = Math.hypot(dx, dz) || 1;
          m.x += dx / d * m.speed * dt; m.z += dz / d * m.speed * dt; m.yaw = Math.atan2(dx, dz);
        }
      }

      // ---------- towers ----------
      for (const t of towers) {
        if (!t.alive) continue;
        t.cd -= dt;
        if (t.target && (!t.target.alive || dist(t, t.target) > t.range || (t.target === player && P.dead))) { t.target = null; t.warm = 0; }
        // a champion who just hit a champion under this tower becomes its target
        for (const c of [player, rival]) if (c.team !== t.team && c.alive && !(c === player && P.dead) && w.time - c.aggroT < 2 && dist(t, c) <= t.range) { const ally = c === player ? rival : player; if (ally.team === t.team && dist(t, ally) <= t.range + 2) { if (t.target !== c) t.warm = 0; t.target = c; } }
        if (!t.target) t.target = nearestEnemy(t, t.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(t, t.range, (v) => v.kind === 'champ' && !(v === player && P.dead));
        if (t.target && t.cd <= 0) {
          const champ = t.target.kind === 'champ';
          damage(t.target, champ ? t.atk * (1 + 0.25 * t.warm) : t.target.max * TUNE.towerVsMinion, t);
          if (champ) t.warm = Math.min(t.warm + 1, 4);
          t.cd = t.cdMax; tracer({ x: t.x, z: t.z }, t.target, TEAM[t.team].color, 0.3, 0.3);
        }
      }

      // ---------- projectiles and starfalls ----------
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i], step = 30 * dt;
        b.x += b.dx * step; b.z += b.dz * step; b.left -= step;
        let hit = null;
        for (const v of units) if (v.alive && v.team !== b.team && v.kind !== 'tower' && v.kind !== 'spire' && Math.hypot(v.x - b.x, v.z - b.z) < (v.radius || 0.5) + 0.5 && !(v === player && P.dead)) { hit = v; break; }
        if (hit) { damage(hit, b.dmg, b.src); w.burst([hit.x, 1.2, hit.z], { color: [TEAM[b.team].color, '#ffffff'], count: 12, speed: 4, life: 0.4 }); }
        if (hit || b.left <= 0) { b.m.removeFromParent(); bolts.splice(i, 1); }
      }
      const falls = (P.starfall ? [P.starfall] : []).concat(rivalFalls);
      for (const s of falls) {
        s.t -= dt;
        if (s.t <= 0 && !s.done) {
          s.done = true; s.ring.removeFromParent();
          for (const v of units) if (v.alive && v.team !== s.team && v.kind !== 'tower' && v.kind !== 'spire' && Math.hypot(v.x - s.x, v.z - s.z) < 5) damage(v, s.dmg, s.src);
          w.burst([s.x, 2, s.z], { color: [TEAM[s.team].color, '#ffffff', C.gold], count: 60, speed: 9, life: 0.9 }); w.shake(0.25); sound('crumble');
        }
      }
      if (P.starfall && P.starfall.done) P.starfall = null;
      for (let i = rivalFalls.length - 1; i >= 0; i--) if (rivalFalls[i].done) rivalFalls.splice(i, 1);
      // remove the dead
      for (let i = units.length - 1; i >= 0; i--) { const u = units[i]; if (!u.alive && (u.kind === 'melee' || u.kind === 'ranged')) units.splice(i, 1); }

      // HUD, a few times a second
      if (w.ticks % 12 === 0) {
        // the goal first, with a marker on what to topple next (the nearest red tower, then their spire); then your
        // level, gold and only what is still recharging (your health is the bar over your champion)
        const up = UPGRADES[upgradeIx], canBuy = up && gold >= up.cost;
        const red = towers.filter((t) => t.alive && t.team === 1), next = red.length ? red.reduce((a, b) => (b.z > a.z ? b : a)) : spires.find((t) => t.alive && t.team === 1);
        const goal = red.length ? `Topple the red tower${red.length > 1 ? 's' : ''} (${red.length} left), then their spire.` : 'Topple the red spire!';
        const wait = [['Q', P.qcd], ['E', P.ecd], ['R', player.lvl < 3 ? 0 : P.rcd], ['Dash', P.dcd]].filter((c) => c[1] > 0).map((c) => `${c[0]} ${Math.ceil(c[1])}s`);
        const toSurge = TUNE.surgeAt > 0 && !surging ? TUNE.surgeAt - (w.time - t0 - 3) : 0;
        const surge = surging ? ' · Surge: towers crumble' : toSurge > 0 && toSurge <= 30 ? ` · Surge in ${Math.ceil(toSurge)} s` : '';
        const rest = `Lv ${player.lvl}${player.lvl < 3 ? ' (R at Lv 3)' : ''} · ${Math.floor(gold)} gold${wait.length ? ' · ' + wait.join(' ') : ''}${P.recallT >= 0 ? ' · recalling' : ''}${surge}${canBuy ? ` · ${up.name} affordable: B to recall and buy` : ''}`;
        if (P.dead > 0) w.objective(`Respawning in ${Math.ceil(P.dead)} s`);
        else w.objective(`${goal} ${rest}`, next ? { at: [next.x, 4.5, next.z] } : undefined);
      }
    });

    // =====================================================================================
    // Drawing (visual only)
    // =====================================================================================
    const setBar = (u) => {
      if (!u.bar || !u.bar.fill) return;
      const k = Math.max(0, u.hp / u.max), W = u.bar.width;
      u.bar.fill.scale.x = Math.max(0.001, W * k); u.bar.fill.position.x = -W * (1 - k) / 2;
      const s = Math.min(1, (u.shield || 0) / u.max);
      u.bar.sh.visible = s > 0.005; if (s > 0.005) { u.bar.sh.scale.x = W * s; u.bar.sh.position.x = -W / 2 + W * k + W * s / 2 - 0.001; }
    };
    w.on('frame', (dt, time) => {
      for (const u of units) {
        if (u.kind === 'melee' || u.kind === 'ranged') { if (u.mesh) { u.mesh.position.x += (u.x - u.mesh.position.x) * Math.min(1, dt * 14); u.mesh.position.z += (u.z - u.mesh.position.z) * Math.min(1, dt * 14); u.mesh.rotation.y = u.yaw || 0; } }
        if (u.kind === 'tower' || u.kind === 'spire') u.crystal.rotation.y += dt * 0.8;
        setBar(u);
      }
      const r = rival;
      r.av.root.position.set(r.x, 0, r.z); r.av.root.rotation.y = r.yaw || 0;
      r.av.animate({ speed: r.walking ? 6 : 0, grounded: true, vy: 0, groundDist: 0 }, dt);
      const pp = w.player.pos; youBar.position.set(pp[0], pp[1] + 1.8, pp[2]); youBar.visible = !(P.dead > 0);
      rivalBar.position.set(r.x, 2.7, r.z); rivalBar.visible = r.av.root.visible;
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i]; f.t += dt; const k = Math.min(1, f.t / f.life);
        f.m.position.set(f.ax + (f.bx - f.ax) * k, f.ay + (f.by - f.ay) * k, f.az + (f.bz - f.az) * k);
        if (f.t >= f.life) { f.m.removeFromParent(); fx.splice(i, 1); }
      }
      for (const b of bolts) b.m.position.set(b.x, 1.3, b.z);
      for (const s of (P.starfall ? [P.starfall] : []).concat(rivalFalls)) if (s.ring) s.ring.material.opacity = 0.25 + 0.35 * Math.abs(Math.sin(time * 9));
      // the scenery: banners wave, lantern flames flicker
      for (const c of cloths) {
        if (!c.root.visible || (c.root.parent && !c.root.parent.visible)) continue;
        const p = c.g.attributes.position, b = c.base;
        for (let i = 0; i < p.count; i++) { const t = -b[i * 3 + 1] / c.ht; p.setZ(i, c.amp * t * Math.sin(time * c.spd + c.ph + t * 2.6 + b[i * 3] * 1.2)); }
        p.needsUpdate = true; c.g.computeVertexNormals();
      }
      flameMat.emissiveIntensity = 2.2 + 0.5 * Math.sin(time * 9.1) * Math.sin(time * 5.3 + 1);
    });

    w.on('enter', () => { readGear(); reset(); });
    w.on('leave', () => own.forEach((g) => g.dispose()));

    // the rules, by the fountain
    w.sign({ pos: [-8, 0, 70], yaw: 18, title: 'SPIRE CLASH', width: 3.4, text: 'Topple both red towers, then their spire.\nStand still to attack. Q, E and R cast; Space dashes; B recalls.\nAt 4:30 the surge: towers crumble, waves grow.' });
    w.sign({ pos: [8, 0, 70], yaw: -18, title: 'YOUR GEAR COUNTS', width: 3.4, text: 'Glider: faster. Spring Boots: quicker dash. Lantern: stronger abilities. A blade in hand (like the Katana): harder attacks. Hoverboard: faster recall. Each sigil: more damage. Crown: more gold. Hats show on your champion.' });

    // read-only test hook for tools
    w.scene.userData.clash = { units, P, player, rival, towers, spires, TUNE, taken, get surging() { return surging; }, get result() { return result; }, get ease() { return ease; }, get state() { return state; }, get gold() { return gold; }, get kills() { return kills; }, get deaths() { return deaths; }, get cs() { return cs; }, get nextCost() { const u = UPGRADES[upgradeIx]; return u ? u.cost : Infinity; } };
  },
};
