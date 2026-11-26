// Lost Links: adventure golf through a valley the world forgot. Nine holes, out from the clubhouse round the valley
// and back, and on every one the dinosaurs do something to your ball: a long neck grazing across the lane, a tail
// swinging through a gate, a nest of bouncing eggs, tar, a geyser, a river, a volcano and, last of all, a jump over the
// ravine and through a skull's teeth. Ottie, who fell into the valley chasing a golf ball, built the course and keeps
// the card.
//
// A putt (all of it tick code, so a replay sees the same putts): stand to your ball with F. Left and right turn your
// aim (A and D, Q and E, or the stick); pull back (S, or the stick) and let go. The longer you pull, the harder you
// hit, up to full and then back down again. The ball's physics is the world's own, worked out in each hole's own
// frame (the tee at the origin, play along +z): rolling friction, slopes, walls, rocks, bouncing eggs, moving necks,
// tails and jaws, tar, water with a current, flight off a ramp or the geyser, and a cup that takes a ball rolling
// slowly enough. The ball keeps being simulated while it rests, so a tail can swat it and a geyser can throw it.

const D = Math.PI / 180;
const C = {
  grass: '#93cc68', grass2: '#86c15e', path: '#ead7a4', green: '#62c25a', green2: '#58b752', tee: '#4f9f4a',
  wood: '#a5714a', woodDark: '#7c5335', woodLight: '#d39c66', stone: '#dcc9a1', stone2: '#c4ac80', rock: '#b09f89', rock2: '#94877a',
  cliff: '#d3ae80', cliff2: '#bd946a', cliff3: '#a87f5c', bone: '#f4ecd8', bone2: '#ded2b8', tar: '#2c2533', tar2: '#463c52',
  water: '#4db3d6', water2: '#86d3ea', foam: '#f2fbff', lava: '#ff7a2e', ember: '#ffb347',
  leaf: '#4fae55', leaf2: '#3f9a4d', leaf3: '#79c66b', trunk: '#8a6440', trunk2: '#a37a4f', fern: '#5dbb5f', straw: '#e6c27a', straw2: '#cfa75c',
  teal: '#5fb3a1', tealLight: '#c6e6cf', orange: '#ee9449', orangeLight: '#f8d3a6', plate: '#dd5a48', purple: '#9a83d8', purpleLight: '#ddd2f6',
  egg: '#f7f0de', eggSpot: '#9cc7a3', gold: '#ffcf4a', flag: '#ff5d5d', cup: '#1f281c', navy: '#25344a', cream: '#fff6e2',
  ptero: '#c9785a', pteroWing: '#e6a07e', eye: '#1d1a22',
};
const LOOKS = {
  ottie: { style: 'round', face: 'happy', mouth: 'smile', top: 'none', tail: 'none', outfit: 'jacket', extra: 'satchel', finish: 'matte',
    colors: { body: '#f2c9a0', head: '#f2c9a0', eyes: '#2a2230', outfit: '#d9b26f', trim: '#7c5335' } },
};

// ---------- the ball: pure functions of a hole and the tick, at module level, so a bot can try putts too ----------
const R = 0.16, CUP_R = 0.3, SUB = 8, SDT = 1 / 60 / SUB;
const GRAV = 18, ROLL = 7;
const FRICT = { green: 1.6, tar: 9, water: 2.4 };
const E_WALL = 0.62, E_ROCK = 0.5, E_EGG = 1.2, EGG_KICK = 2.6;
const MAX_STROKES = 6;
const PULL = 80; // ticks of pulling back from nothing to full (1.33 s); it then eases off again
const powerOf = (n) => { const ph = n % (PULL * 2); return ph <= PULL ? ph / PULL : (PULL * 2 - ph) / PULL; };
const speedOf = (p) => 0.5 + 13.5 * p * p;
const rollOf = (v) => (v * v) / (2 * FRICT.green); // how far a putt rolls on a flat green
const OK = 0, STOPPED = 1, HOLED = 2, LOST = 3;

// a wall from (x0, z0) to (x1, z1): its top at t0 (t1 at the far end, beside a slope), half as thick as wr, its foot at b
const W = (x0, z0, x1, z1, t0 = 0.35, t1 = t0, wr = 0.13, b = -0.3) => ({ x0, z0, x1, z1, t0, t1, wr, b });
const ring = (x0, z0, x1, z1, top = 0.35) => [W(x0, z0, x0, z1, top), W(x1, z0, x1, z1, top), W(x0, z0, x1, z0, top), W(x0, z1, x1, z1, top)];
// the nest: twelve sides round (cx, cz), the one facing the tee left open for the lane
const nestWalls = (cx, cz, r) => {
  const out = [];
  for (let k = 0; k < 12; k++) {
    if (k === 5) continue;
    const a0 = (15 + 30 * k) * D, a1 = (45 + 30 * k) * D;
    out.push(W(cx + Math.sin(a0) * r, cz + Math.cos(a0) * r, cx + Math.sin(a1) * r, cz + Math.cos(a1) * r));
  }
  return out;
};

// The holes, each in its own frame: tee at (0, 0), play along +z, `at` and `yaw` place it in the valley. Floors:
// `r: [x0, z0, x1, z1]` with a height `h` (or `[h0, h1]`, rising along z), `c: [x, z, r]` circles (flat, a `cone`
// [foot, rim, rim radius, crater depth], or a `dip` that wins over everything else there). Rocks are [x, z, r, top],
// eggs [x, z, r, golden]; zones are tar or water (with a current).
const HOLES = [
  { name: 'Fern Walk', par: 2, at: [-10, 52], yaw: 180, cup: [0, 12],
    floor: [{ r: [-1.6, -1.2, 1.6, 13.6], h: 0 }],
    walls: ring(-1.6, -1.2, 1.6, 13.6),
    rocks: [[-0.9, 5.5, 0.4, 0.7], [0.9, 8.5, 0.4, 0.7]],
    tip: 'A gentle one to start. Mind the two rocks, and don\'t hit it too hard: a ball rolling fast just hops over the cup.' },
  { name: 'Long Neck', par: 3, at: [-22, 40], yaw: 180, cup: [0, 13.6],
    floor: [{ r: [-1.8, -1.2, 1.8, 15.2], h: 0 }],
    walls: ring(-1.8, -1.2, 1.8, 15.2),
    neck: { z: 7.6, amp: 1.25, period: 264, r: 0.5 },
    tip: 'Pebble grazes across the lane all day. Wait for her head to swing out of the way, or bank it off the wall behind her.' },
  { name: 'Stego Gate', par: 3, at: [-38, 26], yaw: 180, cup: [0.5, 13.8],
    floor: [{ r: [-1.8, -1.2, 1.8, 16.2], h: 0 }],
    walls: [...ring(-1.8, -1.2, 1.8, 16.2), W(-1.8, 8, -0.8, 8, 0.35, 0.35, 0.25), W(0.8, 8, 1.8, 8, 0.35, 0.35, 0.25)],
    tail: { px: 2.9, pz: 8, len: 3.6, amp: 0.45, period: 240, wr: 0.2, base: Math.PI },
    tip: 'Through the gate, between swings of Spike\'s tail. He doesn\'t mean anything by it. He just likes swinging it.' },
  { name: 'The Nest', par: 3, at: [-50, 4], yaw: 180, cup: [0, 10.8],
    floor: [{ r: [-1.3, -1.2, 1.3, 4.6], h: 0 }, { c: [0, 9.2, 5.3], h: 0 }],
    walls: [W(-1.3, -1.2, -1.3, 4.13), W(1.3, -1.2, 1.3, 4.13), W(-1.3, -1.2, 1.3, -1.2), ...nestWalls(0, 9.2, 5.25)],
    eggs: [[0, 8.3, 0.42], [-1.6, 9.6, 0.42], [1.6, 9.6, 0.42], [-1.0, 12.2, 0.42], [1.0, 12.2, 0.42, 1]],
    tip: 'The eggs bounce. Hard. Use the walls of the nest, and come in round the side.' },
  { name: 'Tar Pits', par: 3, at: [-44, -22], yaw: 90, cup: [7, 14],
    floor: [{ r: [-1.6, -1.2, 8.6, 15.6], h: 0 }],
    walls: ring(-1.6, -1.2, 8.6, 15.6),
    zones: [{ r: [0.4, 2.8, 6.6, 11.2], kind: 'tar' }],
    rocks: [[4.5, 0.8, 0.45, 0.7], [7.6, 6.5, 0.45, 0.7], [1.2, 13.8, 0.45, 0.7]],
    tip: 'The straight line goes through the tar, and nothing comes out of tar in a hurry. Go round.' },
  { name: 'The Geyser', par: 3, at: [-20, -24], yaw: 90, cup: [-1.3, 14.3],
    floor: [{ c: [0, 6.8, 0.6], dip: 0.08 }, { r: [-2.2, -1.2, 2.2, 9.0], h: 0 }, { r: [2.2, -1.2, 3.6, 2.0], h: 0 },
      { r: [2.2, 2.0, 3.6, 9.0], h: [0, 1.7] }, { r: [-2.2, 9.0, 3.6, 15.4], h: 1.7 }],
    walls: [W(-2.2, -1.2, -2.2, 9.0), W(-2.2, -1.2, 3.6, -1.2), W(3.6, -1.2, 3.6, 2.0), W(3.6, 2.0, 3.6, 9.0, 0.35, 2.05), W(2.2, 2.0, 2.2, 9.0, 0.35, 2.05),
      W(-2.2, 9.0, 2.2, 9.0, 1.7), W(-2.2, 9.0, -2.2, 15.4, 2.05), W(3.6, 9.0, 3.6, 15.4, 2.05), W(-2.2, 15.4, 3.6, 15.4, 2.05)],
    geyser: { x: 0, z: 6.8, r: 0.6, period: 192, on: 40, vy: 9.4, vx: 0, vz: 3.9 },
    tip: 'The long way is up the ramp on the right. The short way is to leave your ball on the vent and wait.' },
  { name: 'River Run', par: 3, at: [2, -30], yaw: 90, cup: [-0.4, 14],
    floor: [{ r: [-2, -1.2, 2, 5.6], h: 0 }, { r: [-2, 5.6, 2, 6.6], h: [0, -0.3] }, { r: [-2, 6.6, 2, 8.6], h: -0.3 },
      { r: [-2, 8.6, 2, 9.6], h: [-0.3, 0] }, { r: [-2, 9.6, 2, 16.2], h: 0 }],
    walls: [W(2, -1.2, 2, 16.2, 0.35, 0.35, 0.13, -0.6), W(-2, -1.2, -2, 5.6), W(-2, 9.6, -2, 16.2), W(-2, -1.2, 2, -1.2, 0.08), W(-2, 16.2, 2, 16.2)],
    zones: [{ r: [-2, 5.9, 2, 9.3], kind: 'water', flow: [-2.4, 0] }],
    tip: 'The river runs to the left and takes anything slow with it. Aim upstream, and don\'t be shy.' },
  { name: 'The Volcano', par: 3, at: [30, -20], yaw: 0, cup: [0, 11.6],
    floor: [{ r: [-2.8, -1.2, 2.8, 7.0], h: 0 }, { r: [-5, 7.0, 5, 16.4], h: 0 }, { c: [0, 11.6, 4.6], cone: [0, 1.5, 0.85, 0.2] }],
    walls: [W(-2.8, -1.2, -2.8, 7.0), W(2.8, -1.2, 2.8, 7.0), W(-2.8, -1.2, 2.8, -1.2), W(-5, 7, -2.8, 7), W(2.8, 7, 5, 7),
      W(-5, 7, -5, 16.4), W(5, 7, 5, 16.4), W(-5, 16.4, 5, 16.4)],
    tip: 'Up and into the crater. Too soft and it rolls back to you; too hard and it goes over the top and down the far side.' },
  { name: 'The Big Jump', par: 4, at: [30, 6], yaw: 0, cup: [1.1, 25.4],
    floor: [{ r: [-4.4, -1.2, 2.4, 8.0], h: 0 }, { r: [-1.0, 8.0, 1.0, 11.0], h: [0, 0.95] }, { r: [-4.0, 8.0, -3.0, 15.0], h: 0, wood: true },
      { r: [-4.4, 15.0, 2.4, 27.4], h: 0 }],
    walls: [W(-4.4, -1.2, -4.4, 8), W(2.4, -1.2, 2.4, 8), W(-4.4, -1.2, 2.4, -1.2), W(-4.4, 8, -4.0, 8), W(-3.0, 8, -1.0, 8), W(1.0, 8, 2.4, 8),
      W(-4.0, 8, -4.0, 15, 0.25), W(-3.0, 8, -3.0, 15, 0.25), W(-4.4, 15, -4.4, 27.4), W(2.4, 15, 2.4, 27.4), W(-4.4, 27.4, 2.4, 27.4),
      W(-4.4, 22, -0.75, 22, 0.8, 0.8, 0.25), W(0.75, 22, 2.4, 22, 0.8, 0.8, 0.25)],
    jaw: { x0: -0.75, x1: 0.75, z: 22, period: 150, shut: 70 },
    tip: 'Over the ravine off the ramp, if you dare: it wants nearly everything you\'ve got. The plank bridge on the left is slower and safer. Then through the teeth, when they\'re open.' },
];
const PAR = HOLES.reduce((a, H) => a + H.par, 0);
for (const H of HOLES) {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, low = 1e9;
  for (const p of H.floor) {
    if (p.r) {
      x0 = Math.min(x0, p.r[0]); x1 = Math.max(x1, p.r[2]); z0 = Math.min(z0, p.r[1]); z1 = Math.max(z1, p.r[3]);
      low = Math.min(low, typeof p.h === 'number' ? p.h : Math.min(p.h[0], p.h[1]));
    } else {
      x0 = Math.min(x0, p.c[0] - p.c[2]); x1 = Math.max(x1, p.c[0] + p.c[2]); z0 = Math.min(z0, p.c[1] - p.c[2]); z1 = Math.max(z1, p.c[1] + p.c[2]);
      low = Math.min(low, p.dip ? -p.dip : p.cone ? p.cone[0] : p.h || 0);
    }
  }
  H.box = [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6]; H.low = low;
  H.rocks = H.rocks || []; H.eggs = H.eggs || []; H.zones = H.zones || [];
}

// the floor under (x, z): its height and slope, or null over nothing (a ravine, the river's way out)
function ground(H, x, z) {
  let h = null, gx = 0, gz = 0;
  for (const p of H.floor) {
    let ph, px = 0, pz = 0;
    if (p.r) {
      const r = p.r;
      if (x < r[0] || x > r[2] || z < r[1] || z > r[3]) continue;
      if (typeof p.h === 'number') ph = p.h;
      else { pz = (p.h[1] - p.h[0]) / (r[3] - r[1]); ph = p.h[0] + pz * (z - r[1]); }
    } else {
      const dx = x - p.c[0], dz = z - p.c[1], d = Math.sqrt(dx * dx + dz * dz);
      if (d > p.c[2]) continue;
      if (p.dip) { // a shallow bowl (the geyser's vent): it wins over the floor round it
        const k = p.dip / p.c[2];
        ph = -p.dip + k * d; if (d > 1e-6) { px = k * dx / d; pz = k * dz / d; }
        return { h: ph, gx: px, gz: pz };
      }
      if (p.cone) {
        const [h0, hr, rr, dep] = p.cone;
        if (d >= rr) { const k = (hr - h0) / (p.c[2] - rr); ph = hr - k * (d - rr); px = -k * dx / d; pz = -k * dz / d; }
        else { const k = dep / rr; ph = hr - dep + k * d; if (d > 1e-6) { px = k * dx / d; pz = k * dz / d; } }
      } else ph = p.h || 0;
    }
    if (h === null || ph > h) { h = ph; gx = px; gz = pz; }
  }
  return h === null ? null : { h, gx, gz };
}
const zoneAt = (H, x, z) => { for (const zn of H.zones) if (x >= zn.r[0] && x <= zn.r[2] && z >= zn.r[1] && z <= zn.r[3]) return zn; return null; };
const geyserOn = (q, T) => (T % q.period) < q.on;
const jawShut = (j, T) => (T % j.period) < j.shut;
// the neck's head and the tail, at tick T (fractional within a tick)
const neckAt = (n, T) => { const ph = (2 * Math.PI * T) / n.period; return [n.amp * Math.sin(ph), n.amp * Math.cos(ph) * ((2 * Math.PI * 60) / n.period)]; };
const tailAt = (t, T) => { const ph = (2 * Math.PI * T) / t.period; return [t.base + t.amp * Math.sin(ph), t.amp * Math.cos(ph) * ((2 * Math.PI * 60) / t.period)]; };

const NQ = [0, 0, 0];
function nearest(x0, z0, x1, z1, x, z) {
  const dx = x1 - x0, dz = z1 - z0, l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((x - x0) * dx + (z - z0) * dz) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  NQ[0] = x0 + dx * t; NQ[1] = z0 + dz * t; NQ[2] = t;
  return NQ;
}
// bounce the ball off a point of something (moving at ux, uz) that it is closer to than rr
function push(b, qx, qz, rr, e, ux, uz, kick) {
  let nx = b.x - qx, nz = b.z - qz;
  const d2 = nx * nx + nz * nz;
  if (d2 >= rr * rr) return false;
  const d = Math.sqrt(d2);
  if (d < 1e-9) { nx = 0; nz = -1; } else { nx /= d; nz /= d; }
  b.x = qx + nx * rr; b.z = qz + nz * rr;
  const rvx = b.vx - ux, rvz = b.vz - uz, vn = rvx * nx + rvz * nz;
  if (vn < 0) {
    let out = -vn * e;
    if (kick && out < kick) out = kick;
    const tx = rvx - vn * nx, tz = rvz - vn * nz;
    b.vx = ux + tx * 0.95 + nx * out; b.vz = uz + tz * 0.95 + nz * out;
    if (-vn > b.knock) b.knock = -vn;
  }
  return true;
}
function collide(H, b, T) {
  const bot = b.y - R;
  for (const s of H.walls) {
    const q = nearest(s.x0, s.z0, s.x1, s.z1, b.x, b.z);
    if (bot < s.t0 + (s.t1 - s.t0) * q[2]) push(b, q[0], q[1], R + s.wr, E_WALL, 0, 0, 0);
  }
  for (const k of H.rocks) if (bot < k[3]) push(b, k[0], k[1], R + k[2], E_ROCK, 0, 0, 0);
  for (let i = 0; i < H.eggs.length; i++) { const k = H.eggs[i]; if (push(b, k[0], k[1], R + k[2], E_EGG, 0, 0, EGG_KICK)) b.egg = i + 1; }
  if (H.neck) { const n = H.neck, [x, u] = neckAt(n, T); if (push(b, x, n.z, R + n.r, 0.8, u, 0, 0)) b.swat = 1; }
  if (H.tail) {
    const t = H.tail, [th, om] = tailAt(t, T);
    const q = nearest(t.px, t.pz, t.px + Math.cos(th) * t.len, t.pz + Math.sin(th) * t.len, b.x, b.z);
    if (push(b, q[0], q[1], R + t.wr, 0.35, -om * (q[1] - t.pz), om * (q[0] - t.px), 0)) b.swat = 1;
  }
  if (H.jaw && jawShut(H.jaw, T)) { const j = H.jaw, q = nearest(j.x0, j.z, j.x1, j.z, b.x, b.z); push(b, q[0], q[1], R + 0.22, 0.5, 0, 0, 0); }
}
// one eighth of a tick
function sub(H, b, T) {
  if (b.air) { b.vy -= GRAV * SDT; b.x += b.vx * SDT; b.z += b.vz * SDT; b.y += b.vy * SDT; }
  else {
    let ax = 0, az = 0, fr = FRICT.green;
    const zn = zoneAt(H, b.x, b.z);
    if (zn) { if (zn.kind === 'tar') fr = FRICT.tar; else if (zn.kind === 'water') fr = FRICT.water; if (zn.flow) { ax += zn.flow[0]; az += zn.flow[1]; } }
    const g = ground(H, b.x, b.z);
    if (g) { ax -= ROLL * g.gx; az -= ROLL * g.gz; }
    // the cup's lip leans in a little: a ball crawling past close by drops
    const cx = b.x - H.cup[0], cz = b.z - H.cup[1], cd = Math.sqrt(cx * cx + cz * cz);
    if (cd < CUP_R + 0.1 && cd > 1e-6) { ax -= (1.8 * cx) / cd; az -= (1.8 * cz) / cd; }
    b.vx += ax * SDT; b.vz += az * SDT;
    const sp = Math.sqrt(b.vx * b.vx + b.vz * b.vz), dec = fr * SDT;
    if (sp <= dec) { b.vx = 0; b.vz = 0; } else { const k = (sp - dec) / sp; b.vx *= k; b.vz *= k; }
    b.x += b.vx * SDT; b.z += b.vz * SDT;
  }
  collide(H, b, T);
  if (b.x < H.box[0] || b.x > H.box[2] || b.z < H.box[1] || b.z > H.box[3]) return LOST;
  const g2 = ground(H, b.x, b.z);
  if (b.air) {
    if (g2 && b.y - R <= g2.h && b.y - R > g2.h - 0.5) {
      b.y = g2.h + R;
      if (b.vy < -3) { b.vy = -b.vy * 0.3; b.vx *= 0.82; b.vz *= 0.82; if (1 > b.knock) b.knock = 1; }
      else { b.air = false; b.vy = 0; b.vyg = 0; b.vx *= 0.8; b.vz *= 0.8; }
    } else if (b.y < H.low - 1.2) return LOST;
  } else if (!g2 || g2.h < b.y - R - 0.08) { b.air = true; b.vy = b.vyg; } // off an edge: a ramp's lip keeps its rise
  else if (g2.h > b.y - R + 0.15) { b.x -= b.vx * SDT; b.z -= b.vz * SDT; b.vx *= -0.5; b.vz *= -0.5; } // a step up: back off it
  else { const ny = g2.h + R; b.vyg = (ny - b.y) / SDT; b.y = ny; }
  if (H.geyser && !b.air) {
    const q = H.geyser, dx = b.x - q.x, dz = b.z - q.z;
    if (dx * dx + dz * dz < q.r * q.r && geyserOn(q, T)) { b.air = true; b.vy = q.vy; b.vx = q.vx; b.vz = q.vz; b.launch = 1; } // (always the same throw: up onto the mesa)
  }
  if (!b.air) {
    const cx = b.x - H.cup[0], cz = b.z - H.cup[1], cd = Math.sqrt(cx * cx + cz * cz);
    if (cd < CUP_R) {
      const sp = Math.sqrt(b.vx * b.vx + b.vz * b.vz);
      if (sp < 1.5 - (1.0 * cd) / CUP_R) return HOLED;
      if (!b.lip) { // too fast: it lips out, turned away a little
        b.lip = true;
        const a = (b.vx * cz - b.vz * cx > 0 ? 1 : -1) * 0.7 * (cd / CUP_R), c = Math.cos(a), s = Math.sin(a);
        const vx = (b.vx * c - b.vz * s) * 0.96, vz = (b.vx * s + b.vz * c) * 0.96;
        b.vx = vx; b.vz = vz;
      }
    } else b.lip = false;
  }
  return OK;
}
// one tick of the ball: OK (moving), STOPPED (at rest), HOLED or LOST
function tickBall(H, b, tick) {
  b.knock = 0; b.launch = 0; b.swat = 0; b.egg = 0;
  for (let s = 0; s < SUB; s++) { const r = sub(H, b, tick + s / SUB); if (r) return r; }
  if (b.air) return OK;
  const zn = zoneAt(H, b.x, b.z);
  if (zn && zn.flow) return OK;
  const g = ground(H, b.x, b.z), sl = g ? ROLL * Math.sqrt(g.gx * g.gx + g.gz * g.gz) : 0;
  if (b.vx * b.vx + b.vz * b.vz < 0.0025 && sl < 0.55) { b.vx = 0; b.vz = 0; return STOPPED; }
  return OK;
}
const newBall = (H, x, z) => { const g = ground(H, x, z); return { x, z, y: (g ? g.h : 0) + R, vx: 0, vz: 0, vy: 0, vyg: 0, air: false, lip: false, knock: 0, launch: 0, swat: 0, egg: 0 }; };
// a hole's frame to the valley's, and back
const toWorld = (H, x, z) => { const s = Math.sin(H.yaw * D), c = Math.cos(H.yaw * D); return [H.at[0] + x * c + z * s, H.at[1] - x * s + z * c]; };
const toLocal = (H, x, z) => { const s = Math.sin(H.yaw * D), c = Math.cos(H.yaw * D), dx = x - H.at[0], dz = z - H.at[1]; return [dx * c - dz * s, dx * s + dz * c]; };
const BASE = 0.04; // every hole's floor sits just above the valley's grass (River Run sits higher: its stream bed is lower)
HOLES[6].y = 0.34;
const baseOf = (H) => (H.y == null ? BASE : H.y);
// where you stand to the ball: beside it (on its left) and a little behind, facing the aim, so the camera behind you
// sees the ball and its line; on a narrow plank or by a wall, the first spot that has floor and room
function standSpot(H, b, aimDeg) {
  const a = (aimDeg - H.yaw) * D, fx = Math.sin(a), fz = Math.cos(a), lx = fz, lz = -fx;
  const fl = b.y - R;
  for (const [l, f] of [[0.7, -0.35], [-0.7, -0.35], [0, -0.95], [0.45, -0.7], [-0.45, -0.7], [0, 0]]) {
    const x = b.x + lx * l + fx * f, z = b.z + lz * l + fz * f, g = ground(H, x, z);
    if (!g || Math.abs(g.h - fl) > 0.3) continue;
    let room = true;
    for (const s of H.walls) { const q = nearest(s.x0, s.z0, s.x1, s.z1, x, z); if ((q[0] - x) * (q[0] - x) + (q[1] - z) * (q[1] - z) < 0.42 * 0.42) { room = false; break; } }
    if (room || (l === 0 && f === 0)) return [x, z, g.h];
  }
  return [b.x, b.z, fl];
}

export default {
  id: 'links',
  name: 'Lost Links',
  author: 'elsewhere',
  version: 1,
  blurb: 'Adventure golf through a valley the world forgot. Nine holes, and the dinosaurs play through.',
  color: '#62c25a',
  spawn: { pos: [0, 1.2, 68], yaw: 180 },
  killY: -8,
  // A and D turn your aim, as Q and E do, while you stand to the ball (main.js: the player is frozen then)
  turnAims: true,
  rules: { deny: ['board'], powers: false, fighting: false }, // (a round goes on the boards: artifacts sleep here)
  theme: { // a hazy tropical morning
    skyTop: '#3f9bd8', skyHorizon: '#ffe3b8', skyBottom: '#f6e7c8', skySharp: 0.9,
    sunDir: [0.5, 0.55, 0.42], sunColor: '#fff0cf', sunSize: 1.5, sunLight: '#fff1d6', sunIntensity: 2.6,
    hemiSky: '#e4f3ff', hemiGround: '#b7c98a', hemiIntensity: 1.25,
    fog: [150, 900], fogColor: '#f3e2c4', stars: 0, bloom: 0.22, exposure: 1.0,
  },
  music: { root: 57, scale: 'major', bpm: 92, progression: [0, 3, 4, 3], sparkle: 0.4, bright: 2000, wave: 'triangle', pulse: true },
  items: {
    'll-putter': {
      name: 'Fossil Putter', slot: 'hand', traits: ['cosmetic'], rarity: 'rare', iconRot: [0, 0, -40],
      desc: 'Ottie\'s thanks for going round all nine holes of Lost Links. The head is amber-coloured resin with a fern inside it; the shaft is bone-white ash.',
      look: [
        { s: 'cyl', r: 0.03, h: 0.22, pos: [0, 0.02, 0], color: '#3a2b22', rough: 0.9 },
        { s: 'cyl', r: 0.016, h: 0.78, pos: [0, 0.5, 0], color: '#f4ecd8' },
        { s: 'box', size: [0.07, 0.07, 0.26], pos: [0, 0.9, 0.08], color: '#f0a63a', rough: 0.35 },
        { s: 'box', size: [0.02, 0.05, 0.12], pos: [0.036, 0.9, 0.08], color: '#4fae55' },
      ],
    },
    'll-hood': {
      name: 'Stego Hood', slot: 'head', traits: ['cosmetic'], rarity: 'epic',
      desc: 'Plates down the back, a snout and two round eyes. Ottie gives one to anyone who goes round Lost Links in par or better.',
      look: [
        { s: 'sphere', size: [0.3, 0.24, 0.31], pos: [0, 0.02, -0.02], color: '#ee9449' },
        { s: 'box', size: [0.2, 0.1, 0.16], pos: [0, 0.07, 0.24], color: '#ee9449' },
        { s: 'sphere', r: 0.05, pos: [0.11, 0.16, 0.15], color: '#fff6e2' }, { s: 'sphere', r: 0.05, pos: [-0.11, 0.16, 0.15], color: '#fff6e2' },
        { s: 'sphere', r: 0.025, pos: [0.115, 0.17, 0.195], color: '#1d1a22' }, { s: 'sphere', r: 0.025, pos: [-0.115, 0.17, 0.195], color: '#1d1a22' },
        ...[[0.14, 0.25, 0.12], [0, 0.29, 0.16], [-0.14, 0.24, 0.14], [-0.26, 0.17, 0.11]].map(([z, y, s], i) => ({ s: 'box', size: [0.03, s, s], pos: [i % 2 ? 0.035 : -0.035, y, z], rot: [45, 0, 0], color: '#dd5a48' })),
      ],
    },
  },
  // the ball's physics, for tools (tools/links_bot.mjs tries putts with it)
  sim: { HOLES, tickBall, newBall, ground, powerOf, speedOf, rollOf, toWorld, toLocal, standSpot, baseOf, R, CUP_R, PULL, SUB, MAX_STROKES, PAR, OK, STOPPED, HOLED, LOST, neckAt, tailAt, geyserOn, jawShut },

  build(w) {
    const T = w.THREE, store = w.store;
    const has = (k) => !!w.flag(k);
    const deco = { collide: false, shadow: false };
    const tiled = (a0, a1, step, make) => { for (let a = a0; a < a1 - 1e-6; a += step) { const len = Math.min(step, a1 - a); make(a + len / 2, len); } };
    const slab = (x0, x1, y0, y1, z0, z1, o = {}) => w.box(Object.assign({ pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], size: [x1 - x0, y1 - y0, z1 - z0] }, o));
    const rnd = w.rand(31); // decoration only (nothing that collides with the ball depends on it)
    // a point in a frame { x, z, y, yaw } (a dinosaur's, say: +z is where it faces)
    const fp = (F, x, y, z) => { const s = Math.sin(F.yaw * D), c = Math.cos(F.yaw * D); return [F.x + x * c + z * s, F.y + y, F.z - x * s + z * c]; };
    const holeFrame = (H, x, z, localYaw = 0) => { const [wx, wz] = toWorld(H, x, z); return { x: wx, z: wz, y: baseOf(H), yaw: H.yaw + localYaw }; };
    const cupW = (i) => { const H = HOLES[i], [x, z] = toWorld(H, H.cup[0], H.cup[1]), g = ground(H, H.cup[0], H.cup[1]); return [x, baseOf(H) + g.h + 0.4, z]; };
    const teeW = (i) => { const H = HOLES[i], [x, z] = toWorld(H, 0, -0.6); return [x, baseOf(H) + 0.6, z]; };

    // ---------- the valley floor (a gap left for the ravine the last hole jumps) ----------
    const RAV = [21, 14, 40, 21]; // x0, z0, x1, z1
    const ground0 = (x0, x1, z0, z1) => tiled(x0, x1, 40, (x, lx) => tiled(z0, z1, 50, (z, lz) => w.box({ pos: [x, -1, z], size: [lx, 2, lz], color: ((x + z) / 10) % 2 > 1 ? C.grass2 : C.grass })));
    ground0(-100, RAV[0], -95, 105); ground0(RAV[2], 80, -95, 105); ground0(RAV[0], RAV[2], -95, RAV[1]); ground0(RAV[0], RAV[2], RAV[3], 105);
    // the ravine: rock walls going down, the river at the bottom
    slab(RAV[0], RAV[2], -16, 0, RAV[1] - 1.5, RAV[1], { color: C.cliff3 }); slab(RAV[0], RAV[2], -16, 0, RAV[3], RAV[3] + 1.5, { color: C.cliff3 });
    slab(RAV[0] - 1.5, RAV[0], -16, 0, RAV[1], RAV[3], { color: C.cliff3 }); slab(RAV[2], RAV[2] + 1.5, -16, 0, RAV[1], RAV[3], { color: C.cliff3 });
    for (let x = RAV[0] + 1; x < RAV[2]; x += 2.6) for (const z of [RAV[1] + 0.3, RAV[3] - 0.3]) w.sphere({ pos: [x + rnd.range(-0.6, 0.6), -rnd.range(1, 9), z], radius: rnd.range(0.7, 1.3), low: true, color: rnd.pick([C.cliff2, C.cliff3, C.rock2]), ...deco });
    w.box({ pos: [(RAV[0] + RAV[2]) / 2, -11, (RAV[1] + RAV[3]) / 2], size: [RAV[2] - RAV[0], 0.2, RAV[3] - RAV[1]], color: C.water, opacity: 0.85, ...deco });

    // ---------- the cliffs round the valley, and a fence of air behind them ----------
    const cliff = (x, z, r, h) => {
      w.cylinder({ pos: [x, h / 2 - 1, z], radius: r, height: h, sides: 7, color: rnd.pick([C.cliff, C.cliff2, C.cliff3]), rot: [0, rnd.range(0, 60), 0] });
      w.cone({ pos: [x, h - 1 + r * 0.25, z], radius: r * 0.92, height: r * 0.5, sides: 7, color: rnd.pick([C.leaf, C.leaf2]), ...deco });
    };
    for (let x = -96; x <= 76; x += 13) { cliff(x, -92 - rnd.range(0, 6), rnd.range(10, 15), rnd.range(34, 58)); cliff(x, 100 + rnd.range(0, 6), rnd.range(10, 15), rnd.range(22, 40)); }
    for (let z = -80; z <= 92; z += 13) { cliff(-98 - rnd.range(0, 6), z, rnd.range(10, 15), rnd.range(30, 52)); cliff(80 + rnd.range(0, 6), z, rnd.range(10, 15), rnd.range(30, 52)); }
    for (const [x0, x1, z0, z1] of [[-102, 82, -98, -96], [-102, 82, 104, 106], [-104, -102, -98, 106], [84, 86, -98, 106]]) {
      tiled(x0, x1, 46, (x, l) => tiled(z0, z1, 46, (z, lz) => w.box({ pos: [x, 20, z], size: [l, 44, lz], invisible: true })));
    }
    // far away: the volcano the valley is named for (nobody's name for it is written down), smoking a little
    w.cone({ pos: [240, 104, -360], radius: 190, height: 230, sides: 11, color: C.rock2, ...deco });
    w.cone({ pos: [240, 196, -360], radius: 62, height: 46, sides: 11, color: '#6e6158', ...deco });
    for (let i = 0; i < 9; i++) w.sphere({ pos: [236 + i * 9, 226 + i * 15, -360 - i * 6], radius: 14 + i * 3, low: true, color: '#d9d2c8', opacity: 0.55 - i * 0.04, ...deco });
    for (const [x, z, r, h] of [[-160, -260, 90, 120], [-30, -300, 120, 160], [140, -230, 70, 90], [-240, 60, 110, 130], [260, 120, 120, 140]]) w.cone({ pos: [x, h / 2 - 2, z], radius: r, height: h, sides: 9, color: rnd.pick(['#8fb07a', '#7fa36c', '#a3bc84']), ...deco });

    // ---------- the waterfall on the north cliff, and the river: under River Run, then down into the ravine ----------
    const FALL = [10, -82];
    slab(FALL[0] - 9, FALL[0] + 9, -1, 46, FALL[1] - 6, FALL[1] - 1, { color: C.cliff2 });
    w.box({ pos: [FALL[0], 22, FALL[1] + 1.4], size: [6.4, 46, 0.8], color: C.water2, opacity: 0.88, ...deco });
    for (let i = 0; i < 7; i++) w.box({ pos: [FALL[0] - 2.7 + i * 0.9, 22, FALL[1] + 1.85], size: [0.18, 46, 0.1], color: C.foam, opacity: 0.6, ...deco });
    w.cylinder({ pos: [FALL[0], 0.03, FALL[1] + 6], radius: 9, height: 0.06, sides: 20, color: C.water, opacity: 0.9, ...deco });
    for (let i = 0; i < 12; i++) w.sphere({ pos: [FALL[0] + rnd.range(-3.4, 3.4), 0.4, FALL[1] + rnd.range(2.2, 3.6)], radius: rnd.range(0.5, 1.0), low: true, color: C.foam, ...deco });
    w.particles({ pos: [FALL[0], 2.5, FALL[1] + 2], area: [10, 4, 5], count: 30, color: '#ffffff', size: 0.3, kind: 'rise' });
    const river = (pts, wdt) => { for (let i = 0; i + 1 < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], l = Math.hypot(x1 - x0, z1 - z0);
      w.box({ pos: [(x0 + x1) / 2, 0.035, (z0 + z1) / 2], size: [wdt, 0.05, l + wdt * 0.6], yaw: Math.atan2(x1 - x0, z1 - z0) / D, color: C.water, opacity: 0.9, ...deco }); } };
    river([[9.6, -73], [9.6, -32.2]], 4.2);
    river([[9.6, -27.6], [9.8, -12], [12, 2], [17, 11], [21.5, 16.5]], 4.2);
    w.box({ pos: [21.2, -5, 16.5], size: [0.6, 10, 4], color: C.water2, opacity: 0.85, ...deco }); // over the ravine's edge
    for (const [x, z, yaw] of [[9.7, -48, 0], [12, 2, 15], [9.8, -12, 0]]) { // footbridges where the paths cross
      w.box({ pos: [x, 0.25, z], size: [6, 0.18, 1.8], yaw: yaw + 90, color: C.woodLight });
      for (const s of [-0.85, 0.85]) { const p = fp({ x, z, y: 0, yaw }, s, 0, 0); w.box({ pos: [p[0], 0.55, p[2]], size: [0.1, 0.5, 6], yaw, color: C.woodDark, ...deco }); }
    }

    // ---------- the clubhouse, the way home, and Ottie ----------
    const HUT = [-27, 61];
    slab(HUT[0] - 5, HUT[0] + 5, 0, 0.36, HUT[1] - 3.5, HUT[1] + 3.5, { color: C.woodLight });
    for (const [dx, dz] of [[-4.6, -3.1], [4.6, -3.1], [-4.6, 3.1], [4.6, 3.1]]) w.cylinder({ pos: [HUT[0] + dx, 2.0, HUT[1] + dz], radius: 0.22, height: 3.4, sides: 8, color: C.trunk });
    w.cone({ pos: [HUT[0], 4.6, HUT[1]], radius: 7.6, height: 2.6, sides: 4, rot: [0, 45, 0], color: C.straw, ...deco });
    w.cone({ pos: [HUT[0], 5.95, HUT[1]], radius: 1.6, height: 0.7, sides: 4, rot: [0, 45, 0], color: C.straw2, ...deco });
    slab(HUT[0] - 3.5, HUT[0] + 3.5, 0.36, 1.35, HUT[1] - 2.6, HUT[1] - 1.9, { color: C.wood });           // the counter
    slab(HUT[0] - 3.7, HUT[0] + 3.7, 1.35, 1.47, HUT[1] - 2.75, HUT[1] - 1.75, { color: C.woodDark, ...deco });
    for (let i = 0; i < 5; i++) w.cylinder({ pos: [HUT[0] - 2.6 + i * 0.5, 1.75, HUT[1] - 2.2], radius: 0.05, height: 0.6, color: ['#ff5d5d', '#4fae55', '#4a8fe0', '#ffcf4a', '#9a83d8'][i], ...deco }); // putters in a rack
    w.label({ pos: [HUT[0], 4.0, HUT[1] - 3.2], text: 'Lost Links', size: 0.6 });
    const board = w.sign({ pos: [5.5, 0, 60.5], yaw: -130, title: 'THE CARD', width: 3.2, bg: '#3b2a1e', border: C.straw, frame: C.woodDark,
      text: HOLES.map((H, i) => `${i + 1}  ${H.name}  par ${H.par}`).join('\n') + `\nPar for the course: ${PAR}` });
    void board;
    w.portal({ pos: [0, 0, 78], yaw: 180, to: 'hub', label: 'Junction', frame: C.woodLight });
    w.checkpoint({ pos: [5, 0, 66], yaw: 180 });
    const OTTIE_AT = [-5.5, 0, 59.5];
    const ottie = w.npc({ pos: OTTIE_AT, yaw: 125, name: 'Ottie', hat: 'cap', look: LOOKS.ottie, onTalk: () => talkOttie() });
    void ottie;

    // ---------- plants: palms, cycads, tree ferns and ferns, kept off the course ----------
    const clear = (x, z, m) => {
      if (Math.hypot(x - HUT[0], z - HUT[1]) < 9 + m || Math.hypot(x, z - 73) < 8 + m || Math.hypot(x - OTTIE_AT[0], z - OTTIE_AT[2]) < 4 + m) return false;
      if (x > RAV[0] - 2 - m && x < RAV[2] + 2 + m && z > RAV[1] - 2 - m && z < RAV[3] + 2 + m) return false;
      for (const H of HOLES) { const [lx, lz] = toLocal(H, x, z); if (lx > H.box[0] - 3 - m && lx < H.box[2] + 3 + m && lz > H.box[1] - 3 - m && lz < H.box[3] + 3 + m) return false; }
      if (Math.abs(x - 9.7) < 4 + m && z < -10) return false; // the river
      return true;
    };
    const palm = (x, z, h) => {
      const lean = rnd.range(-12, 12), dir = rnd.range(0, 360);
      for (let i = 0; i < 5; i++) { const k = i / 5, o = fp({ x, z, y: 0, yaw: dir }, 0, 0, Math.sin(lean * D) * h * k * k); w.cylinder({ pos: [o[0], h * (k + 0.1), o[2]], radius: 0.34 - i * 0.04, height: h / 5 + 0.1, sides: 6, color: i % 2 ? C.trunk : C.trunk2, ...deco }); }
      const top = fp({ x, z, y: h + 0.1, yaw: dir }, 0, 0, Math.sin(lean * D) * h);
      for (let k = 0; k < 7; k++) { const a = k * 51 + rnd.range(0, 20), q = fp({ x: top[0], z: top[2], y: top[1], yaw: a }, 0, -0.5, 1.6); w.box({ pos: q, size: [0.9, 0.08, 3.4], rot: [24, a, 0], color: k % 2 ? C.leaf : C.leaf2, ...deco }); }
      w.sphere({ pos: [top[0], top[1] - 0.25, top[2]], radius: 0.32, low: true, color: '#7c5a36', ...deco });
      w.cylinder({ pos: [x, h / 2, z], radius: 0.36, height: h, invisible: true });
    };
    const cycad = (x, z, s) => {
      w.cylinder({ pos: [x, 0.6 * s, z], radius: 0.45 * s, height: 1.2 * s, sides: 7, color: '#7d6a45' });
      for (let k = 0; k < 9; k++) { const a = k * 40 + rnd.range(0, 15), q = fp({ x, z, y: 1.3 * s, yaw: a }, 0, 0.4 * s, 0.9 * s); w.box({ pos: q, size: [0.5 * s, 0.06, 2.1 * s], rot: [-35, a, 0], color: k % 2 ? C.leaf3 : C.leaf, ...deco }); }
    };
    const treeFern = (x, z, h) => {
      w.cylinder({ pos: [x, h / 2, z], radius: 0.22, height: h, sides: 6, color: '#6b5236' });
      for (let k = 0; k < 8; k++) { const a = k * 45 + rnd.range(0, 20), q = fp({ x, z, y: h, yaw: a }, 0, 0.1, 1.2); w.box({ pos: q, size: [0.55, 0.05, 2.6], rot: [8, a, 0], color: k % 2 ? C.fern : C.leaf2, ...deco }); }
    };
    const fern = (x, z, s) => { for (let k = 0; k < 5; k++) { const a = k * 72 + rnd.range(0, 30), q = fp({ x, z, y: 0, yaw: a }, 0, 0.3 * s, 0.55 * s); w.box({ pos: q, size: [0.32 * s, 0.04, 1.2 * s], rot: [-28, a, 0], color: k % 2 ? C.fern : C.leaf3, ...deco }); } };
    const plant = (n, m, f) => { let tries = 0; for (let i = 0; i < n && tries < n * 40; tries++) { const x = rnd.range(-88, 70), z = rnd.range(-82, 92); if (!clear(x, z, m)) continue; f(x, z); i++; } };
    plant(34, 1.5, (x, z) => palm(x, z, rnd.range(7, 11)));
    plant(22, 1, (x, z) => cycad(x, z, rnd.range(0.8, 1.3)));
    plant(18, 1, (x, z) => treeFern(x, z, rnd.range(3, 4.6)));
    plant(70, 0, (x, z) => fern(x, z, rnd.range(0.7, 1.3)));
    plant(26, 0.5, (x, z) => w.sphere({ pos: [x, 0.2, z], radius: rnd.range(0.5, 1.4), low: true, color: rnd.pick([C.rock, C.rock2, C.stone2]), scale: [1, 0.7, 1], ...deco }));

    // ---------- the course: every hole drawn from the same data its ball rolls on ----------
    const holeParts = [];
    HOLES.forEach((H, i) => {
      const Y = baseOf(H), green = i % 2 ? C.green2 : C.green;
      const at = (x, z, y = 0) => { const [wx, wz] = toWorld(H, x, z); return [wx, Y + y, wz]; };
      for (const p of H.floor) {
        if (p.r) {
          const [x0, z0, x1, z1] = p.r, pos = at((x0 + x1) / 2, (z0 + z1) / 2);
          if (typeof p.h === 'number') {
            if (p.h > 0.2) { // a raised green: a block of rock with grass on top
              w.box({ pos: [pos[0], Y + (p.h - 0.4) / 2 - 0.1, pos[2]], size: [x1 - x0, p.h + 0.2, z1 - z0], yaw: H.yaw, color: C.stone2 });
              w.box({ pos: [pos[0], Y + p.h - 0.15, pos[2]], size: [x1 - x0, 0.3, z1 - z0], yaw: H.yaw, color: green });
            } else w.box({ pos: [pos[0], Y + p.h - 0.15, pos[2]], size: [x1 - x0, 0.3, z1 - z0], yaw: H.yaw, color: p.wood ? C.woodLight : green });
          } else {
            const lo = Math.min(p.h[0], p.h[1]), rise = Math.abs(p.h[1] - p.h[0]), wood = i === 8;
            w.ramp({ pos: [pos[0], Y + lo + rise / 2, pos[2]], size: [x1 - x0, rise, z1 - z0], yaw: p.h[1] > p.h[0] ? H.yaw : H.yaw + 180, color: wood ? C.woodLight : green });
            w.box({ pos: [pos[0], Y + lo - 0.15, pos[2]], size: [x1 - x0, 0.3, z1 - z0], yaw: H.yaw, color: wood ? C.wood : green });
          }
        } else if (p.cone) { // the volcano: a frustum to see, a cone to stand on, a glowing crater round the cup
          const [h0, hr, rr, dep] = p.cone, pos = at(p.c[0], p.c[1]), apex = hr + (rr * (hr - h0)) / (p.c[2] - rr);
          w.cone({ pos: [pos[0], Y + h0 + apex / 2, pos[2]], radius: p.c[2], height: apex, invisible: true });
          const m = new T.Mesh(new T.CylinderGeometry(rr, p.c[2], hr - h0, 30, 1, true), new T.MeshStandardMaterial({ color: C.rock2, roughness: 0.92, flatShading: true }));
          m.position.set(pos[0], Y + h0 + (hr - h0) / 2, pos[2]); m.castShadow = true; m.receiveShadow = true; w.add(m);
          const cr = new T.Mesh(new T.ConeGeometry(rr, dep, 30, 1, true), new T.MeshStandardMaterial({ color: '#6a2c1c', emissive: new T.Color(C.lava), emissiveIntensity: 0.9, side: T.DoubleSide, roughness: 0.8 }));
          cr.rotation.x = Math.PI; cr.position.set(pos[0], Y + hr - dep / 2, pos[2]); w.add(cr);
          w.model({ pos: [pos[0], Y + hr, pos[2]], parts: [{ s: 'torus', r: rr, tube: 0.07, rot: [90, 0, 0], color: '#5a4c43' }] });
        } else if (p.dip) { // the geyser's vent
          const pos = at(p.c[0], p.c[1]);
          w.cylinder({ pos: [pos[0], Y + 0.012, pos[2]], radius: p.c[2], height: 0.02, sides: 20, color: '#3d3a3a', ...deco });
          w.model({ pos: [pos[0], Y + 0.03, pos[2]], parts: [{ s: 'torus', r: p.c[2], tube: 0.07, rot: [90, 0, 0], color: C.rock2 }] });
        } else { const pos = at(p.c[0], p.c[1]); w.cylinder({ pos: [pos[0], Y + (p.h || 0) - 0.15, pos[2]], radius: p.c[2], height: 0.3, sides: 36, color: green }); }
      }
      for (const s of H.walls) {
        const dx = s.x1 - s.x0, dz = s.z1 - s.z0, L = Math.hypot(dx, dz), c = Math.cos(H.yaw * D), sn = Math.sin(H.yaw * D);
        const wdx = dx * c + dz * sn, wdz = -dx * sn + dz * c, th = Math.atan2(-wdz, wdx) / D;
        const mid = at((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2), tall = Math.max(s.t0, s.t1) > 0.5;
        const thick = s.wr >= 0.25, color = thick && i === 8 ? C.bone2 : thick || tall ? C.stone : C.wood;
        if (s.t0 === s.t1) {
          w.box({ pos: [mid[0], Y + (s.t0 + s.b) / 2, mid[2]], size: [L + s.wr * 2, s.t0 - s.b, s.wr * 2], rot: [0, th, 0], color });
          if (!tall && !thick) w.box({ pos: [mid[0], Y + s.t0 + 0.02, mid[2]], size: [L + s.wr * 2 + 0.04, 0.05, s.wr * 2 + 0.06], rot: [0, th, 0], color: C.woodLight, ...deco });
        } else { // beside a slope: a tilted wall, its top along the slope
          const tilt = Math.atan2(s.t1 - s.t0, L) / D, hh = 0.9;
          w.box({ pos: [mid[0], Y + (s.t0 + s.t1) / 2 - hh / 2, mid[2]], size: [Math.hypot(L, s.t1 - s.t0) + s.wr * 2, hh, s.wr * 2], rot: [0, th, tilt], color });
        }
      }
      for (const k of H.rocks) {
        const pos = at(k[0], k[1]);
        w.sphere({ pos: [pos[0], Y + k[2] * 0.55, pos[2]], radius: k[2] * 1.08, low: true, color: C.rock, scale: [1, 1.05, 1], collide: false });
        w.cylinder({ pos: [pos[0], Y + k[3] / 2, pos[2]], radius: k[2], height: k[3], invisible: true });
      }
      for (let e = 0; e < H.eggs.length; e++) {
        const k = H.eggs[e], pos = at(k[0], k[1]), gold = !!k[3];
        w.sphere({ pos: [pos[0], Y + k[2] * 1.2, pos[2]], radius: k[2], scale: [1, 1.32, 1], color: gold ? C.gold : C.egg, glow: gold ? 0.5 : 0, collide: false });
        if (!gold) for (let q = 0; q < 4; q++) { const a = q * 90 + 30 * e; w.sphere({ pos: [pos[0] + Math.sin(a * D) * k[2] * 0.93, Y + k[2] * (0.9 + 0.25 * (q % 2)), pos[2] + Math.cos(a * D) * k[2] * 0.93], radius: 0.07, color: C.eggSpot, ...deco }); }
        w.cylinder({ pos: [pos[0], Y + 0.5, pos[2]], radius: k[2], height: 1, invisible: true });
      }
      // the cup and its flag, the tee and its name
      const cg = ground(H, H.cup[0], H.cup[1]), cp = at(H.cup[0], H.cup[1], cg.h);
      w.cylinder({ pos: [cp[0], cp[1] + 0.008, cp[2]], radius: CUP_R + 0.05, height: 0.012, sides: 24, color: '#ffffff', ...deco });
      w.cylinder({ pos: [cp[0], cp[1] + 0.014, cp[2]], radius: CUP_R, height: 0.012, sides: 24, color: C.cup, ...deco });
      w.cylinder({ pos: [cp[0], cp[1] + 0.85, cp[2]], radius: 0.03, height: 1.7, color: '#f4f4f4', ...deco });
      const flag = w.model({ pos: [cp[0], cp[1] + 1.48, cp[2]], yaw: H.yaw + 90, parts: [{ s: 'box', size: [0.03, 0.36, 0.56], pos: [0, 0, 0.3], color: C.flag }] });
      w.label({ pos: [cp[0], cp[1] + 2.05, cp[2]], text: String(i + 1), size: 0.42 });
      const tp = at(0, -0.15);
      w.box({ pos: [tp[0], Y + 0.006, tp[2]], size: [2.0, 0.012, 1.6], yaw: H.yaw, color: C.tee, ...deco });
      for (const sx of [-0.8, 0.8]) { const q = at(sx, -0.75); w.sphere({ pos: [q[0], Y + 0.1, q[2]], radius: 0.1, color: i % 2 ? '#4a8fe0' : '#ff5d5d', ...deco }); }
      const lp = at(0, -1.6);
      w.label({ pos: [lp[0], Y + 2.5, lp[2]], text: `${i + 1} · ${H.name} · par ${H.par}`, size: 0.4 });
      const tee = w.interact({ pos: teeW(i), radius: 2.4, label: `Hole ${i + 1}: ${H.name}`, onUse: () => teeUp(i) });
      holeParts.push({ flag, tee });
    });

    // ---------- the dinosaurs, and what each hole does ----------
    const SP = {}; // the moving set pieces, posed every frame
    { // Long Neck: Pebble grazes across the lane, her head sweeping through the ball's way
      const H = HOLES[1], F = holeFrame(H, 6.4, 7.6, -90), P3 = (x, y, z) => fp(F, x, y, z);
      w.sphere({ pos: P3(0, 3.1, 0), radius: 1, scale: [2.3, 2.0, 3.6], color: C.teal, collide: false });
      w.sphere({ pos: P3(0, 2.55, 0.2), radius: 1, scale: [1.9, 1.5, 3.0], color: C.tealLight, collide: false });
      for (const [x, z] of [[-1, 1.3], [1, 1.3], [-1, -1.4], [1, -1.4]]) {
        w.cylinder({ pos: P3(x, 1.2, z), radius: 0.42, height: 2.4, sides: 10, color: C.teal, collide: false });
        w.cylinder({ pos: P3(x, 0.12, z), radius: 0.52, height: 0.24, sides: 10, color: '#4f9b8a', collide: false });
      }
      [[3.0, -3.6, 0.9], [2.6, -5.0, 0.7], [2.1, -6.2, 0.52], [1.6, -7.2, 0.36], [1.2, -8.0, 0.22]].forEach(([y, z, r]) => w.sphere({ pos: P3(0, y, z), radius: r, color: C.teal, collide: false }));
      for (let k = 0; k < 6; k++) w.sphere({ pos: P3(rnd.range(-1, 1), 4.7 + rnd.range(0, 0.3), rnd.range(-2.4, 2.2)), radius: 0.22, color: '#4f9b8a', ...deco });
      w.box({ pos: P3(0, 2.4, -0.6), size: [4.4, 4.8, 8.6], yaw: F.yaw, invisible: true });
      const neck = w.model({ pos: [0, 0, 0], parts: Array.from({ length: 11 }, (_, k) => ({ s: 'sphere', r: 0.62 - k * 0.03, color: k % 3 === 1 ? '#57a895' : C.teal })) });
      const head = w.model({ pos: [0, 0, 0], parts: [
        { s: 'sphere', size: [0.46, 0.4, 0.62], color: C.teal }, { s: 'sphere', size: [0.36, 0.28, 0.4], pos: [0, -0.07, 0.42], color: C.tealLight },
        { s: 'sphere', r: 0.085, pos: [0.25, 0.13, 0.12], color: '#ffffff' }, { s: 'sphere', r: 0.085, pos: [-0.25, 0.13, 0.12], color: '#ffffff' },
        { s: 'sphere', r: 0.045, pos: [0.3, 0.14, 0.16], color: C.eye }, { s: 'sphere', r: 0.045, pos: [-0.3, 0.14, 0.16], color: C.eye },
      ] });
      head.group.rotation.order = 'YXZ';
      SP.neck = { H, shoulder: new T.Vector3(...P3(0, 4.4, 2.9)), ctrl: new T.Vector3(...P3(0, 7.6, 5.2)), neck, head };
    }
    { // Stego Gate: Spike stands with his back to the lane and swings his tail through the gate
      const H = HOLES[2], F = holeFrame(H, 5.6, 8.0, 90), P3 = (x, y, z) => fp(F, x, y, z);
      w.sphere({ pos: P3(0, 2.2, 0), radius: 1, scale: [1.6, 1.55, 3.0], color: C.orange, collide: false });
      w.sphere({ pos: P3(0, 1.75, 0.2), radius: 1, scale: [1.3, 1.1, 2.4], color: C.orangeLight, collide: false });
      for (const [x, y, z, r, h] of [[-0.75, 0.6, 1.7, 0.3, 1.2], [0.75, 0.6, 1.7, 0.3, 1.2], [-0.85, 0.9, -1.2, 0.42, 1.8], [0.85, 0.9, -1.2, 0.42, 1.8]]) w.cylinder({ pos: P3(x, y, z), radius: r, height: h, sides: 10, color: C.orange, collide: false });
      w.sphere({ pos: P3(0, 1.5, 2.75), radius: 0.48, color: C.orange, collide: false });
      w.sphere({ pos: P3(0, 1.05, 3.4), radius: 1, scale: [0.34, 0.3, 0.55], color: C.orange, collide: false });
      for (const s of [-1, 1]) w.sphere({ pos: P3(0.2 * s, 1.18, 3.55), radius: 0.06, color: C.eye, ...deco });
      [[2.2, 0.6], [1.5, 0.85], [0.8, 1.0], [0.1, 1.05], [-0.6, 1.0], [-1.3, 0.9], [-1.9, 0.7], [-2.4, 0.5]].forEach(([z, s], k) => {
        const top = 2.2 + 1.5 * Math.sqrt(Math.max(0, 1 - (z / 3) * (z / 3)));
        w.box({ pos: P3(k % 2 ? 0.16 : -0.16, top + s * 0.28, z), size: [0.08, s, s], rot: [45, F.yaw, 0], color: k % 2 ? C.plate : '#e8735a', ...deco });
      });
      w.box({ pos: P3(0, 1.8, 0), size: [3.4, 3.6, 6.6], yaw: F.yaw, invisible: true });
      const t = H.tail, base = holeFrame(H, t.px, t.pz);
      const tail = w.model({ pos: [base.x, base.y, base.z], parts: [
        ...[[0.25, 1.7, 0.42], [0.8, 1.15, 0.36], [1.35, 0.72, 0.3], [1.9, 0.5, 0.25], [2.5, 0.48, 0.23], [3.1, 0.48, 0.21], [3.7, 0.48, 0.19], [4.15, 0.48, 0.17]]
          .map(([x, y, r]) => ({ s: 'sphere', r, pos: [x, y, 0], color: C.orange })),
        ...[[3.75, 1], [3.75, -1], [4.1, 1], [4.1, -1]].map(([x, s]) => ({ s: 'cone', r: 0.08, h: 0.6, pos: [x, 0.72, 0.2 * s], rot: [-50 * s, 0, 0], color: C.bone })),
      ] });
      SP.tail = { H, tail };
    }
    { // The Nest: Mabel watches her eggs; the golden one hatches if it is knocked about enough
      const H = HOLES[3], F = holeFrame(H, -5.8, 14.6, 150), P3 = (x, y, z) => fp(F, x, y, z);
      w.sphere({ pos: P3(0, 2.0, 0), radius: 1, scale: [1.1, 1.2, 1.9], color: C.purple, collide: false });
      w.sphere({ pos: P3(0, 1.75, 0.25), radius: 1, scale: [0.85, 0.9, 1.4], color: C.purpleLight, collide: false });
      for (const s of [-1, 1]) { w.cylinder({ pos: P3(0.5 * s, 0.8, -0.3), radius: 0.32, height: 1.6, sides: 10, color: C.purple, collide: false }); w.cylinder({ pos: P3(0.55 * s, 1.9, 1.0), radius: 0.1, height: 0.7, sides: 6, rot: [30, F.yaw, 0], color: C.purple, ...deco }); }
      [[1.7, -1.8, 0.6], [1.35, -2.9, 0.42], [1.0, -3.8, 0.26]].forEach(([y, z, r]) => w.sphere({ pos: P3(0, y, z), radius: r, color: C.purple, collide: false }));
      w.sphere({ pos: P3(0, 2.8, 1.0), radius: 0.42, color: C.purple, collide: false });
      w.cylinder({ pos: P3(0, 1.6, 0), radius: 1.2, height: 3.2, invisible: true });
      const mhead = w.model({ pos: P3(0, 3.3, 1.35), yaw: F.yaw, parts: [
        { s: 'sphere', size: [0.34, 0.32, 0.5], color: C.purple }, { s: 'box', size: [0.34, 0.1, 0.42], pos: [0, -0.1, 0.45], color: '#f2c14e' },
        { s: 'cone', r: 0.16, h: 0.55, pos: [0, 0.32, -0.15], rot: [-35, 0, 0], color: C.plate },
        { s: 'sphere', r: 0.06, pos: [0.22, 0.1, 0.18], color: C.eye }, { s: 'sphere', r: 0.06, pos: [-0.22, 0.1, 0.18], color: C.eye },
      ] });
      // straw round the nest's rim
      for (let k = 0; k < 30; k++) { const a = k * 12 + rnd.range(0, 8), r = 5.25 + rnd.range(0.1, 0.5), q = holeFrame(H, Math.sin(a * D) * r, 9.2 + Math.cos(a * D) * r);
        if (Math.cos(a * D) < -0.9) continue; w.box({ pos: [q.x, q.y + 0.45, q.z], size: [0.08, 0.06, rnd.range(0.8, 1.4)], rot: [rnd.range(-20, 20), rnd.range(0, 180), 0], color: rnd.pick([C.straw, C.straw2]), ...deco }); }
      const g = H.eggs[4], gp = holeFrame(H, g[0], g[1]);
      const baby = w.model({ pos: [gp.x, gp.y + 0.05, gp.z], yaw: H.yaw + 180, parts: [
        { s: 'sphere', size: [0.22, 0.24, 0.3], pos: [0, 0.3, 0], color: C.purple }, { s: 'sphere', size: [0.17, 0.16, 0.22], pos: [0, 0.6, 0.12], color: C.purple },
        { s: 'sphere', r: 0.04, pos: [0.09, 0.66, 0.24], color: C.eye }, { s: 'sphere', r: 0.04, pos: [-0.09, 0.66, 0.24], color: C.eye },
        { s: 'sphere', size: [0.3, 0.16, 0.3], pos: [0, 0.08, 0], color: C.gold },
      ] });
      baby.group.visible = has('ll.hatched');
      SP.nest = { H, mhead, baby, base: mhead.group.position.y };
    }
    { // Tar Pits: the pit, a few bones that didn't get out, and bubbles
      const H = HOLES[4], z = H.zones[0].r, c = holeFrame(H, (z[0] + z[2]) / 2, (z[1] + z[3]) / 2);
      w.box({ pos: [c.x, c.y + 0.008, c.z], size: [z[2] - z[0] + 0.3, 0.012, z[3] - z[1] + 0.3], yaw: H.yaw, color: C.tar2, ...deco });
      w.box({ pos: [c.x, c.y + 0.016, c.z], size: [z[2] - z[0], 0.012, z[3] - z[1]], yaw: H.yaw, color: C.tar, rough: 0.2, ...deco });
      for (const [x, zz, a, l] of [[1.6, 4.4, 30, 1.1], [4.8, 9.6, -50, 0.9], [3.1, 6.6, 80, 1.3]]) { const q = holeFrame(H, x, zz); w.cylinder({ pos: [q.x, q.y + 0.25, q.z], radius: 0.07, height: l, rot: [40, a + H.yaw, 0], color: C.bone, ...deco }); w.sphere({ pos: fp({ x: q.x, z: q.z, y: q.y, yaw: a + H.yaw }, 0, 0.25 + l * 0.38, l * 0.32), radius: 0.12, color: C.bone, ...deco }); }
      const bubbles = Array.from({ length: 6 }, (_, k) => { const q = holeFrame(H, z[0] + 0.6 + ((k * 2.3) % (z[2] - z[0] - 1.2)), z[1] + 0.6 + ((k * 3.7) % (z[3] - z[1] - 1.2))); return { m: w.model({ pos: [q.x, q.y + 0.02, q.z], parts: [{ s: 'sphere', r: 1, color: C.tar2, rough: 0.2 }] }), ph: k * 0.37 }; });
      SP.tar = bubbles;
    }
    { // The Geyser: steam at rest, a column when it goes
      const H = HOLES[5], q = H.geyser, v = holeFrame(H, q.x, q.z);
      w.particles({ pos: [v.x, v.y + 0.8, v.z], area: [0.8, 1.2, 0.8], count: 10, color: '#ffffff', size: 0.25, kind: 'rise' });
      const col = w.model({ pos: [v.x, v.y, v.z], parts: [{ s: 'cyl', r: 0.45, h: 1, pos: [0, 0.5, 0], color: '#ffffff', opacity: 0.6 }, { s: 'sphere', r: 0.75, pos: [0, 1.05, 0], color: '#ffffff', opacity: 0.5 }] });
      col.group.visible = false;
      for (let k = 0; k < 14; k++) { const a = rnd.range(0, 360), r = rnd.range(0.9, 2.2), p = holeFrame(H, -2.2 - rnd.range(0.3, 1.2), 9.4 + rnd.range(0, 5.5)); void a; void r; w.sphere({ pos: [p.x, p.y + rnd.range(0.3, 1.4), p.z], radius: rnd.range(0.4, 0.8), low: true, color: rnd.pick([C.stone2, C.cliff2]), ...deco }); }
      SP.geyser = { H, q, col, v };
    }
    { // River Run: the stream under the lane, a grate upstream, the way out downstream
      const H = HOLES[6], s = holeFrame(H, 0, 7.6);
      w.box({ pos: [s.x, s.y - 0.07, s.z], size: [4, 0.02, 3.9], yaw: H.yaw, color: C.water, opacity: 0.82, ...deco });
      for (let k = 0; k < 7; k++) { const g = holeFrame(H, 2.05, 5.9 + k * 0.55); w.cylinder({ pos: [g.x, g.y + 0.1, g.z], radius: 0.04, height: 0.7, color: '#6b6f78', ...deco }); }
      const o = holeFrame(H, -2.6, 7.6);
      w.box({ pos: [o.x, o.y - 0.2, o.z], size: [1.4, 0.04, 3.9], rot: [0, H.yaw, -14], color: C.water2, opacity: 0.85, ...deco });
      const streaks = w.model({ pos: [0, 0, 0], parts: Array.from({ length: 7 }, () => ({ s: 'box', size: [0.5, 0.012, 0.05], color: C.foam, opacity: 0.8 })) });
      SP.river = { H, streaks };
      const st = holeFrame(H, 0, -1.85); // a step up to the tee (the lane sits higher than the grass)
      w.box({ pos: [st.x, 0.1, st.z], size: [3.6, 0.2, 1.1], yaw: H.yaw, color: C.woodLight });
    }
    { // The Volcano: smoke over the crater
      const H = HOLES[7], c = holeFrame(H, H.cup[0], H.cup[1]);
      w.particles({ pos: [c.x, c.y + 2.6, c.z], area: [1.4, 2.4, 1.4], count: 14, color: ['#c9c1b8', '#e8e1d8'], size: 0.45, kind: 'rise' });
    }
    { // The Big Jump: the ramp's trestle, the plank bridge's posts, and the skull
      const H = HOLES[8];
      for (const [x, z] of [[-0.9, 9.0], [0.9, 9.0], [-0.9, 10.7], [0.9, 10.7]]) { const p = holeFrame(H, x, z); w.cylinder({ pos: [p.x, p.y - 5, p.z], radius: 0.12, height: 10, sides: 6, color: C.woodDark, ...deco }); }
      for (let z = 8.4; z < 15; z += 1.3) for (const x of [-4.0, -3.0]) { const p = holeFrame(H, x, z); w.cylinder({ pos: [p.x, p.y + 0.4, p.z], radius: 0.06, height: 0.8, sides: 6, color: C.woodDark, ...deco }); }
      for (const x of [-4.0, -3.0]) { const a = holeFrame(H, x, 11.5); w.cylinder({ pos: [a.x, a.y + 0.75, a.z], radius: 0.025, height: 7, rot: [90, H.yaw, 0], color: C.straw2, ...deco }); }
      for (const [x, z] of [[-3.5, 8.1], [-3.5, 14.9]]) { const p = holeFrame(H, x, z); w.cylinder({ pos: [p.x, p.y - 2.5, p.z], radius: 0.14, height: 5, sides: 6, color: C.woodDark, ...deco }); }
      const S = holeFrame(H, 0, 22), P3 = (x, y, z) => fp(S, x, y, z);
      w.box({ pos: P3(0, 2.0, 0.9), size: [3.0, 1.5, 2.4], yaw: S.yaw, color: C.bone });
      w.sphere({ pos: P3(0, 2.6, 1.3), radius: 1, scale: [1.6, 0.9, 1.4], color: C.bone, collide: false });
      for (const s of [-1, 1]) { w.sphere({ pos: P3(0.95 * s, 2.25, -0.28), radius: 0.38, color: '#3b3026', ...deco }); w.sphere({ pos: P3(1.1 * s, 0.6, 0.2), radius: 0.62, color: C.bone, collide: false }); }
      w.box({ pos: P3(0, 1.75, -0.7), size: [1.3, 0.55, 1.2], yaw: S.yaw, color: C.bone2, collide: false });
      w.box({ pos: P3(0, 0.004, -0.55), size: [1.6, 0.01, 0.9], yaw: S.yaw, color: C.bone2, ...deco });
      const jaw = w.model({ pos: P3(0, 1.3, 0.75), yaw: S.yaw, parts: [
        { s: 'box', size: [1.7, 0.32, 1.55], pos: [0, 0, -0.75], color: C.bone },
        ...Array.from({ length: 7 }, (_, k) => ({ s: 'cone', r: 0.09, h: 1.0, pos: [-0.66 + k * 0.22, -0.62, -1.42], rot: [180, 0, 0], color: '#fffaf0' })),
      ] });
      SP.jaw = { H, jaw };
    }
    // pterosaurs, wheeling high over the valley
    SP.ptero = [[0, -10, 52, 34, 0.11, 0], [30, 10, 36, 40, -0.08, 2], [-40, 20, 28, 28, 0.14, 4]].map(([cx, cz, r, y, sp, ph]) => {
      const wingL = w.model({ pos: [0, 0, 0], parts: [{ s: 'box', size: [2.4, 0.06, 1.0], pos: [1.2, 0, 0], color: C.pteroWing }] });
      const wingR = w.model({ pos: [0, 0, 0], parts: [{ s: 'box', size: [2.4, 0.06, 1.0], pos: [-1.2, 0, 0], color: C.pteroWing }] });
      const body = w.model({ pos: [0, 0, 0], parts: [{ s: 'sphere', size: [0.3, 0.3, 0.9], color: C.ptero }, { s: 'cone', r: 0.12, h: 0.9, pos: [0, 0.05, 0.85], rot: [90, 0, 0], color: C.ptero }, { s: 'cone', r: 0.1, h: 0.5, pos: [0, 0.25, 0.3], rot: [-60, 0, 0], color: C.plate }] });
      for (const m of [wingL, wingR, body]) m.group.rotation.order = 'YXZ';
      return { cx, cz, r, y, sp, ph, wingL, wingR, body };
    });

    // ---------- coins, for anyone who looks round the valley ----------
    for (const p of [[FALL[0], 1.1, FALL[1] + 0.2], [HUT[0] - 7.5, 1.1, HUT[1] + 1], [-62, 1.1, -30], [-30, 1.1, 36], [44, 1.1, 0], [52, 1.1, 40]]) w.coin({ pos: p });
    { const H = HOLES[5], p = holeFrame(H, -1.6, 14.6); w.coin({ pos: [p.x, p.y + 1.7 + 1.0, p.z] }); }
    { const H = HOLES[8], p = holeFrame(H, -3.5, 11.5); w.coin({ pos: [p.x, p.y + 1.0, p.z] }); }

    // ---------- Season 2 of the Founder's hunt (GAME.md: The Stranger): Echo XI, in Mabel's nest, once her golden egg
    // has hatched (and Season 2 has begun) ----------
    const ECHO11 = (() => { const H = HOLES[3], [x, z] = toWorld(H, 2.4, 12.9); return [x, baseOf(H) + 1.45, z]; })(); // (by the hatchling, off the line to the cup)
    const echo11 = w.echo({ id: '11', pos: ECHO11, hidden: !(has('s2.started') && has('ll.hatched')),
      line: 'I still visit every world, in a hood, so nobody knows it is me. Mabel knows. She has let me sit by her nest for years.',
      next: 'Echo XII: "A bronze giant asked me if his maker was coming back. Answer him, then ring his bell again, the shepherds\' way." Watch Rock, The Last Summer of Bronze, chapter 3.' });
    // (shown once you are clear of it: one that appears round you would wait for you to step out and back in)
    let reveal11 = false;
    w.on('tick', () => { if (!reveal11) return; const p = w.player.pos; if (Math.hypot(p[0] - ECHO11[0], p[1] - ECHO11[1], p[2] - ECHO11[2]) > 1.8) { reveal11 = false; echo11.reveal(); } });

    // ---------- playing: the state of the hole you are on ----------
    const P = {
      mode: 'free', // 'free': walking; 'address': standing to the ball; 'roll': the ball is moving; 'wait': between; 'done': just holed
      hole: -1, round: false, card: [], strokes: 0, ball: null, from: null, aim: 0, turnT: 0, pull: 0, armed: false,
      rollT: 0, settleT: 0, putts: 0, swingT: -99, sunkT: -99, gold: 0, knockT: 0, prev: [0, 0, 0], bt: 0, swats: 0, throws: 0,
    };
    const ballInt = w.interact({ pos: [0, -50, 0], radius: 2.4, label: 'Putt', onUse: () => onBall() });
    ballInt.enabled = false;
    const ballW = () => { const H = HOLES[P.hole], b = P.ball, [x, z] = toWorld(H, b.x, b.z); return [x, baseOf(H) + b.y, z]; };
    const sumPar = (n) => HOLES.slice(0, n).reduce((a, H) => a + H.par, 0);
    const toPar = () => { const d = P.card.reduce((a, n) => a + n, 0) - sumPar(P.card.length); return d === 0 ? 'level par' : d < 0 ? `${-d} under par` : `${d} over par`; };
    const scoreName = (n, par) => { const d = n - par; return n === 1 ? 'Hole in one!' : d <= -3 ? 'Albatross!' : d === -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === 2 ? 'Double bogey' : `${n} strokes`; };

    function objective() {
      if (!has('ll.met')) return w.objective('Lost Links: nine holes of adventure golf. Ottie, at the clubhouse, keeps the card.', { at: [OTTIE_AT[0], 2.2, OTTIE_AT[2]] });
      if (P.hole >= 0 && P.ball) {
        const H = HOLES[P.hole], k = P.mode === 'roll' || P.mode === 'done' ? P.strokes : P.strokes + 1;
        const head = `Hole ${P.hole + 1}, ${H.name} · par ${H.par} · stroke ${k}${P.round && P.card.length ? ' · ' + toPar() : ''}`;
        if (P.mode === 'address') return w.objective(P.putts < 3 && store.get('putts', 0) < 3 ? `${head}. Turn to aim, then pull back and let go to putt.` : head, { at: cupW(P.hole) });
        if (P.mode === 'free') return w.objective(`${head}. Your ball is waiting: F beside it.`, { at: ballW() });
        return w.objective(head, { at: cupW(P.hole) });
      }
      if (P.round) { const k = P.card.length; return w.objective(`Your round: hole ${k + 1} next, ${HOLES[k].name}. ${P.card.length ? toPar() + ' so far.' : ''}`, { at: teeW(k) }); }
      const best = store.get('best', null);
      return w.objective(best == null ? `A round of nine starts at the first tee. Par is ${PAR}.` : `Your best round: ${best}. A round of nine starts at the first tee.`, { at: teeW(0) });
    }

    // a tee: in a round, the next hole; otherwise any hole, for practice (the first offers a round)
    async function teeUp(i) {
      if (P.hole >= 0 && P.mode !== 'free') return;
      if (P.round) {
        const next = P.card.length;
        if (P.hole >= 0 && P.hole !== i) return w.toast(`You're on hole ${P.hole + 1}. Your ball is waiting there.`);
        if (P.hole < 0 && i !== next) return w.toast(`Your round goes on at hole ${next + 1}, ${HOLES[next].name}.`);
        if (P.hole === i) return address(false);
        return startHole(i);
      }
      if (i === 0) {
        const k = await w.ask('Hole 1', `Fern Walk. A round of nine holes (par ${PAR}), or just this one?`, ['A round of nine', 'Just this hole', 'Not now']);
        if (k === 0) { P.round = true; P.card = []; startHole(0); } else if (k === 1) startHole(0);
        return;
      }
      startHole(i);
    }
    function startHole(i) {
      const H = HOLES[i];
      P.hole = i; P.strokes = 0; P.ball = newBall(H, 0, 0); P.from = [0, 0]; P.gold = 0;
      for (const hp of holeParts) hp.tee.enabled = false;
      w.banner(`Hole ${i + 1}: ${H.name}`, `par ${H.par}${P.round ? ' · ' + (P.card.length ? toPar() : 'round of nine') : ''}`);
      address(true);
    }
    function address(first) {
      const H = HOLES[P.hole], b = P.ball;
      P.mode = 'address'; P.pull = 0; P.armed = false; P.turnT = 0;
      if (first) P.aim = H.yaw;
      else { const [wx, wz] = toWorld(H, b.x, b.z), cp = cupW(P.hole); P.aim = Math.atan2(cp[0] - wx, cp[2] - wz) / D; }
      w.player.freeze(true); stand();
      ballInt.enabled = true; ballInt.setLabel('Step away'); ballInt.setPos(ballW());
      objective();
    }
    function stand() {
      const H = HOLES[P.hole], s = standSpot(H, P.ball, P.aim), [x, z] = toWorld(H, s[0], s[1]);
      w.player.setPos([x, baseOf(H) + s[2] + 1.0, z], P.aim);
    }
    function onBall() {
      if (P.hole < 0 || !P.ball) return;
      if (P.mode === 'address') { P.mode = 'free'; w.player.freeze(false); ballInt.setLabel('Putt'); objective(); return; }
      if (P.mode === 'free') address(false);
    }
    function putt() {
      const H = HOLES[P.hole], b = P.ball, v = speedOf(powerOf(P.pull)), a = (P.aim - H.yaw) * D;
      P.from = [b.x, b.z]; P.pull = 0;
      b.vx = Math.sin(a) * v; b.vz = Math.cos(a) * v; b.air = false; b.lip = false;
      P.strokes++; P.putts++; P.mode = 'roll'; P.rollT = 0; P.settleT = 0; P.swingT = w.ticks;
      ballInt.enabled = false;
      if (P.putts === 3 && store.get('putts', 0) < 3) store.set('putts', 3);
      w.sound('putt'); objective();
    }
    function settled() {
      if (P.strokes >= MAX_STROKES) return pickUp();
      address(false);
    }
    function lost() {
      const H = HOLES[P.hole], b = P.ball, [x, z] = toWorld(H, b.x, b.z), Y = baseOf(H);
      const where = H.zones.some((zn) => zn.flow) ? 'The river took it!' : P.hole === 8 ? 'Into the ravine!' : 'Out of bounds!';
      w.sound('splash'); w.burst([x, Y + Math.max(b.y, 0.2), z], { color: [C.water2, '#ffffff'], count: 24, speed: 4, life: 0.8 });
      P.strokes++; P.mode = 'wait';
      w.toast(`${where} A stroke's penalty, and the ball goes back to where you played it.`);
      P.ball = newBall(H, P.from[0], P.from[1]);
      w.after(1.1, () => { if (P.mode !== 'wait') return; if (P.strokes >= MAX_STROKES) pickUp(); else address(P.from[0] === 0 && P.from[1] === 0); });
    }
    function pickUp() {
      P.mode = 'wait';
      w.toast(`That's ${MAX_STROKES}: Ottie's rule. You pick the ball up and score ${MAX_STROKES + 1}.`);
      w.after(1.2, () => finishHole(MAX_STROKES + 1));
    }
    function holed() {
      const H = HOLES[P.hole], n = P.strokes, i = P.hole, name = scoreName(n, H.par), cp = cupW(i);
      P.mode = 'done'; P.sunkT = w.ticks; ballInt.enabled = false;
      w.sound('cup');
      w.after(0.35, () => w.sound(n <= H.par ? 'win' : 'coin'));
      w.burst([cp[0], cp[1], cp[2]], { color: n === 1 ? ['#ffd166', '#ffffff', '#ff8f6b'] : ['#ffffff', '#9fe3a0'], count: n === 1 ? 90 : 30, speed: n === 1 ? 9 : 5, life: 1.1 });
      if (n === 1) w.shake(0.3);
      if (n === 1) {
        const aces = store.get('aces', []);
        if (!aces.includes(i + 1)) { store.set('aces', aces.concat([i + 1]).sort((a, b) => a - b)); w.addCoins(5); w.toast('+5 coins: your first hole in one on this hole', 'item'); }
        if (!has('title.ll.ace')) { w.setFlag('title.ll.ace', true); w.toast('Title earned: Hole in One', 'item'); }
      }
      w.banner(name, `${H.name}: ${n} stroke${n === 1 ? '' : 's'}${P.round ? ' · ' + toParAfter(n) : ''}`);
      w.after(1.6, () => finishHole(n));
    }
    const toParAfter = (n) => { const d = P.card.reduce((a, k) => a + k, 0) + n - sumPar(P.card.length + 1); return d === 0 ? 'level par' : d < 0 ? `${-d} under par` : `${d} over par`; };
    function finishHole(n) {
      const i = P.hole;
      const hb = store.get('holeBest', [null, null, null, null, null, null, null, null, null]).slice();
      if (hb[i] == null || n < hb[i]) { hb[i] = n; store.set('holeBest', hb); }
      P.hole = -1; P.ball = null; P.mode = 'free'; ballInt.enabled = false;
      w.player.freeze(false);
      for (const hp of holeParts) hp.tee.enabled = true;
      if (P.round) {
        P.card.push(n);
        if (P.card.length === HOLES.length) return endRound();
      } else w.toast(`Hole ${i + 1}, ${HOLES[i].name}: ${n}. ${i < 8 ? 'The next tee is along the path.' : 'Back to the clubhouse.'}`);
      objective();
    }
    async function endRound() {
      const card = P.card.slice(), total = card.reduce((a, n) => a + n, 0), d = total - PAR;
      P.round = false; P.card = [];
      const prev = store.get('best', null), rounds = store.get('rounds', 0) + 1;
      store.set('rounds', rounds);
      if (prev == null || total < prev) store.set('best', total);
      const counted = w.record('strokes', total, { better: 'lower' });
      w.sound('win');
      w.banner(`Round complete: ${total}`, d < 0 ? `${-d} under par${prev != null && total < prev ? ' · a new best' : ''}` : d === 0 ? 'level par' : `${d} over par${prev != null && total < prev ? ' · a new best' : ''}`);
      const lines = [`${card.join(' · ')}: ${total} for the nine holes, ${d === 0 ? 'level par' : d < 0 ? `${-d} under par` : `${d} over par`}.${counted ? ' It goes on the Leaderboards once it\'s checked.' : ''}`];
      if (!w.has('ll-putter')) { w.give('ll-putter'); lines.push('Ottie\'s thanks for going round: the Fossil Putter. It\'s in your items.'); }
      if (total <= PAR && !w.has('ll-hood')) { w.give('ll-hood'); lines.push('Par or better! Ottie gives you a Stego Hood, as she does everyone who manages it.'); }
      if (total <= PAR && !has('title.ll.par')) { w.setFlag('title.ll.par', true); lines.push('Title earned: Under the Volcano.'); }
      objective();
      await w.wait(1.5);
      await w.say('Your card', lines);
    }

    // ---------- every tick: the ball, and your aim and swing ----------
    w.on('tick', () => {
      if (P.hole < 0 || !P.ball) return;
      const H = HOLES[P.hole], b = P.ball;
      if (P.mode !== 'done' && P.mode !== 'wait') {
        P.prev[0] = b.x; P.prev[1] = b.y; P.prev[2] = b.z; P.bt = w.ticks;
        const r = tickBall(H, b, w.ticks);
        if (b.knock > 0.9 && w.ticks - P.knockT > 5) { P.knockT = w.ticks; w.sound('knock'); }
        if (b.egg) { w.sound('boing'); if (H.eggs[b.egg - 1][3]) hitGold(); }
        if (b.launch) { w.sound('geyser'); w.toast('Whoosh!'); P.throws++; }
        if (b.swat && P.mode === 'roll') P.swats++;
        if (r === HOLED) return holed();
        if (r === LOST) return lost();
        if (P.mode === 'roll') {
          P.rollT++;
          if (r === STOPPED || P.rollT > 60 * 25) { if (++P.settleT >= 20) settled(); } else P.settleT = 0;
        } else if (r !== STOPPED) { // it moved while it was resting: swatted, thrown, or a slope
          if (P.mode === 'address' && (b.swat || b.launch || b.vx * b.vx + b.vz * b.vz > 0.09)) {
            P.mode = 'roll'; P.rollT = 0; P.settleT = 0; P.pull = 0; ballInt.enabled = false;
            if (b.swat) P.swats++;
            if (b.swat) w.toast(P.hole === 1 ? 'Pebble nudged your ball. She didn\'t mean to.' : 'Spike swatted your ball!');
            objective();
          }
        }
        if ((P.mode === 'free' || P.mode === 'address') && r !== STOPPED) ballInt.setPos(ballW());
      }
      if (P.mode !== 'address') return;
      const [mx, my] = w.input.move;
      if (P.pull === 0 && Math.abs(mx) > 0.04) {
        P.turnT++;
        P.aim -= (P.turnT < 14 ? 0.3 : 1.1) * mx * Math.abs(mx);
        stand();
      } else if (Math.abs(mx) <= 0.04) P.turnT = 0;
      if (my > -0.3) { if (P.pull > 0) return putt(); P.armed = true; }
      else if (my < -0.35 && P.armed) P.pull++;
    });
    function hitGold() {
      if (has('ll.hatched')) return;
      if (++P.gold < 3) return;
      w.setFlag('ll.hatched', true); SP.nest.baby.group.visible = true;
      const H = HOLES[3], g = H.eggs[4], p = holeFrame(H, g[0], g[1]);
      w.burst([p.x, p.y + 0.6, p.z], { color: [C.gold, '#ffffff', C.purple], count: 40, speed: 5, life: 1 });
      w.sound('pickup'); w.addCoins(3);
      w.toast('The golden egg hatched! Mabel looks very pleased. +3 coins', 'item');
      if (has('s2.started') && !echo11.shown) w.after(2.5, () => { reveal11 = true; w.toast('Mabel nudges something out of the nest: a light, humming.'); });
    }
    w.on('respawn', () => { if (P.hole >= 0 && P.mode === 'free') objective(); });

    // ---------- what you see: the ball, your line, the putter, and everything that moves ----------
    const ballM = w.model({ pos: [0, -50, 0], parts: [{ s: 'sphere', r: R, color: '#ffffff', glow: 0.25 }, { s: 'torus', r: R * 0.985, tube: 0.024, color: C.flag }] });
    const dots = w.model({ pos: [0, 0, 0], parts: Array.from({ length: 16 }, () => ({ s: 'sphere', r: 0.045, color: '#ffffff', glow: 0.6 })) });
    const ringM = w.model({ pos: [0, -50, 0], parts: [{ s: 'torus', r: 0.3, tube: 0.035, rot: [90, 0, 0], color: '#ffffff', glow: 0.9 }] });
    const ringMat = ringM.group.children[0].material = ringM.group.children[0].material.clone();
    const putter = w.model({ pos: [0, -50, 0], parts: [{ s: 'cyl', r: 0.018, h: 1.0, pos: [0, 0.5, 0], color: C.bone }, { s: 'box', size: [0.07, 0.07, 0.24], pos: [0, 0.035, 0.05], color: '#f0a63a' }] });
    const cool = new T.Color('#ffffff'), warm = new T.Color('#ffcf4a'), hot = new T.Color('#ff6b4a');
    const up = new T.Vector3(0, 1, 0), tv = new T.Vector3(), axis = new T.Vector3(), qq = new T.Quaternion(), bez = new T.Vector3(), hd = new T.Vector3();
    let vt = 0, rolled = false, wasShut = true, lastErupt = -1;
    w.on('frame', (dt, t) => {
      vt = Math.min(Math.max(vt + dt * 60, w.ticks - 2), w.ticks + 1);
      // the ball (between ticks, rolling as it goes; sinking into the cup when holed)
      const on = P.hole >= 0 && !!P.ball;
      ballM.group.visible = on;
      if (on) {
        const H = HOLES[P.hole], b = P.ball, Y = baseOf(H), live = P.mode !== 'wait' && P.mode !== 'done';
        const al = live ? Math.min(1, Math.max(0, vt - (P.bt - 1))) : 1;
        const lx = live ? P.prev[0] + (b.x - P.prev[0]) * al : b.x, ly = live ? P.prev[1] + (b.y - P.prev[1]) * al : b.y, lz = live ? P.prev[2] + (b.z - P.prev[2]) * al : b.z;
        let [wx, wz] = toWorld(H, lx, lz), wy = Y + ly;
        if (P.mode === 'done') { const k = Math.min(1, (vt - P.sunkT) / 12), cp = cupW(P.hole); wx += (cp[0] - wx) * k; wz += (cp[2] - wz) * k; wy -= k * 0.42; }
        const pos = ballM.group.position;
        if (rolled) { const dx = wx - pos.x, dz = wz - pos.z, d = Math.hypot(dx, dz); if (d > 1e-4 && d < 2) { axis.set(dz, 0, -dx).normalize(); qq.setFromAxisAngle(axis, d / R); ballM.group.quaternion.premultiply(qq); } }
        pos.set(wx, wy, wz); rolled = true;
      } else rolled = false;
      // your line: a few dots while you aim; pulling back stretches them as far as the putt would roll on the flat
      const aiming = on && P.mode === 'address';
      dots.group.visible = aiming; ringM.group.visible = aiming && P.pull > 0;
      if (aiming) {
        const H = HOLES[P.hole], b = P.ball, Y = baseOf(H), la = (P.aim - H.yaw) * D, sx = Math.sin(la), sz = Math.cos(la);
        const pw = P.pull > 0 ? powerOf(P.pull) : 0, len = P.pull > 0 ? Math.min(16, Math.max(0.7, rollOf(speedOf(pw)))) : 2.0, n = P.pull > 0 ? 16 : 6;
        dots.group.children.forEach((m, k) => {
          m.visible = k < n; if (!m.visible) return;
          const d = 0.35 + ((len - 0.35) * k) / (n - 1), x = b.x + sx * d, z = b.z + sz * d, g = ground(H, x, z), [px, pz] = toWorld(H, x, z);
          m.position.set(px, Y + (g ? g.h : b.y - R) + 0.07, pz);
        });
        if (P.pull > 0) {
          const x = b.x + sx * len, z = b.z + sz * len, g = ground(H, x, z), [px, pz] = toWorld(H, x, z);
          ringM.group.position.set(px, Y + (g ? g.h : b.y - R) + 0.06, pz);
          ringMat.color.copy(pw < 0.5 ? cool.clone().lerp(warm, pw * 2) : warm.clone().lerp(hot, (pw - 0.5) * 2)); ringMat.emissive && ringMat.emissive.copy(ringMat.color);
        }
      }
      // the putter: drawn back while you pull, swung through as you putt
      const swung = vt - P.swingT;
      putter.group.visible = on && (P.mode === 'address' || swung < 24);
      if (putter.group.visible) {
        const H = HOLES[P.hole], b = P.ball, Y = baseOf(H), la = (P.aim - H.yaw) * D;
        const back = P.mode === 'address' ? (P.pull > 0 ? 0.6 * powerOf(P.pull) : 0) : swung < 6 ? -0.35 * (swung / 6) : -0.35;
        const fx = Math.sin(la), fz = Math.cos(la), hx = P.mode === 'address' ? b.x : P.from[0], hz = P.mode === 'address' ? b.z : P.from[1];
        const [px, pz] = toWorld(H, hx - fx * (R + 0.08 + back), hz - fz * (R + 0.08 + back)), floor = Y + (P.mode === 'address' ? b.y - R : ground(H, hx, hz) ? ground(H, hx, hz).h : b.y - R);
        const me = w.player.pos;
        putter.group.position.set(px, floor + 0.01, pz);
        tv.set(me[0] - px, me[1] - 0.05 - floor, me[2] - pz).normalize();
        putter.group.quaternion.setFromUnitVectors(up, tv);
      }
      // Pebble's neck and head, on the sweep the ball meets
      { const s = SP.neck, n = s.H.neck, [hx] = neckAt(n, vt), [x, z] = toWorld(s.H, hx, n.z);
        hd.set(x, baseOf(s.H) + 0.42 + Math.abs(Math.sin(t * 3)) * 0.04, z);
        s.neck.group.children.forEach((m, k) => { const u = (k + 0.5) / 11.5; bez.copy(s.shoulder).multiplyScalar((1 - u) * (1 - u)).addScaledVector(s.ctrl, 2 * u * (1 - u)).addScaledVector(hd, u * u); m.position.copy(bez); });
        const last = s.neck.group.children[10].position;
        s.head.group.position.copy(hd); s.head.group.rotation.set(0.45, Math.atan2(hd.x - last.x, hd.z - last.z), 0); }
      // Spike's tail
      { const s = SP.tail, tl = s.H.tail, [th] = tailAt(tl, vt), c = Math.cos(s.H.yaw * D), sn = Math.sin(s.H.yaw * D);
        const wdx = Math.cos(th) * c + Math.sin(th) * sn, wdz = -Math.cos(th) * sn + Math.sin(th) * c;
        s.tail.group.rotation.set(0, Math.atan2(-wdz, wdx), 0); }
      // Mabel looks about; the tar bubbles; the geyser
      { const s = SP.nest; s.mhead.group.position.y = s.base + Math.sin(t * 1.7) * 0.05; }
      for (const bb of SP.tar) { const ph = (t * 0.45 + bb.ph) % 1, k = ph < 0.85 ? 0.04 + (0.2 * ph) / 0.85 : 0.001; bb.m.group.scale.setScalar(k); }
      { const s = SP.geyser, e = vt % s.q.period, on2 = e < s.q.on;
        s.col.group.visible = on2;
        if (on2) { const h = 7 * Math.min(1, e / 7) * Math.min(1, (s.q.on - e) / 10 + 0.15); s.col.group.scale.set(1 + Math.sin(t * 30) * 0.06, Math.max(0.1, h), 1 + Math.cos(t * 27) * 0.06); }
        const cyc = Math.floor(vt / s.q.period);
        if (on2 && cyc !== lastErupt) { lastErupt = cyc; w.burst([s.v.x, s.v.y + 0.6, s.v.z], { color: ['#ffffff', '#e8f6ff'], count: 26, speed: 5, life: 0.9 }); } }
      // the river's current
      { const s = SP.river; s.streaks.group.children.forEach((m, k) => {
        const x = 2 - ((vt / 60) * 1.7 + k * 0.61) % 4.0, z = 6.1 + ((k * 0.47) % 3.0), [px, pz] = toWorld(s.H, x, z);
        m.position.set(px, baseOf(s.H) - 0.055, pz); m.rotation.y = s.H.yaw * D; }); }
      // the skull's teeth
      { const s = SP.jaw, j = s.H.jaw, e = vt % j.period, ang = e < j.shut ? 0 : 0.6 * Math.min(1, (e - j.shut) / 10, (j.period - e) / 10);
        s.jaw.group.rotation.order = 'YXZ'; s.jaw.group.rotation.set(ang, s.H.yaw * D, 0);
        const shut = e < j.shut;
        if (shut && !wasShut) { const me = w.player.pos, cp = cupW(8); if (Math.hypot(me[0] - cp[0], me[2] - cp[2]) < 18) w.sound('clack'); }
        wasShut = shut; }
      // pterosaurs
      for (const p of SP.ptero) {
        const a = p.ph + t * p.sp, x = p.cx + Math.cos(a) * p.r, z = p.cz + Math.sin(a) * p.r, y = p.y + Math.sin(t * 0.3 + p.ph) * 2;
        const yaw = Math.atan2(-Math.sin(a) * Math.sign(p.sp), Math.cos(a) * Math.sign(p.sp)), flap = Math.sin(t * 4 + p.ph) * 0.45, bank = -Math.sign(p.sp) * 0.25;
        for (const m of [p.body, p.wingL, p.wingR]) { m.group.position.set(x, y, z); m.group.rotation.set(0, yaw, bank); }
        p.wingL.group.rotation.z = bank + flap; p.wingR.group.rotation.z = bank - flap;
      }
      // the flags
      holeParts.forEach((hp, i) => { hp.flag.group.rotation.y = (HOLES[i].yaw + 90) * D + Math.sin(t * 2.2 + i) * 0.22; });
    });

    // ---------- Ottie ----------
    async function talkOttie() {
      if (!has('ll.met')) {
        await w.say('Ottie', [
          'Oh! Hello! Mind the eggs. Welcome to Lost Links: nine holes through a valley the rest of the world forgot.',
          'I fell in here chasing a golf ball, years ago. Through a gap in the ferns, and down, and there they all were.',
          'They\'re gentle. Enormous, and gentle, and very, very interested in golf balls. So I built a course they could join in with.',
          'Stand to your ball with F. Turn to aim: A and D, or the stick. Then pull back, with S or the stick, and let go. The longer you pull, the harder you hit, up to a point, and then it eases off again.',
          `The first tee is just along the path. A round of nine is par ${PAR}. Go round, and I'll have something for you.`,
        ]);
        w.setFlag('ll.met', true); objective(); return;
      }
      if (P.round) {
        const at = P.hole >= 0 ? P.hole : P.card.length;
        const k = await w.ask('Ottie', `Hole ${at + 1} of nine, ${P.card.length ? toPar() : 'just getting started'}. How's it going?`, ['Fine, thanks!', 'Any tips for this one?', 'I\'d like to stop this round.']);
        if (k === 1) await w.say('Ottie', HOLES[at].tip);
        if (k === 2) { const s = await w.ask('Ottie', 'Stop now? The card goes in the bin.', ['Yes, stop the round', 'No, keep going']); if (s === 0) giveUp(); }
        return;
      }
      const best = store.get('best', null);
      const k = await w.ask('Ottie', best == null ? 'Fancy a round? The first tee is just along the path.' : `Your best round is ${best}. ${best <= PAR ? 'Under the volcano, as we say round here. Lovely.' : `Par is ${PAR}. You'll get there.`}`, ['Any tips?', 'Tell me about the valley.', 'See you!']);
      if (k === 0) { const i = hardestHole(); await w.say('Ottie', [`Hole ${i + 1}, ${HOLES[i].name}?`, HOLES[i].tip]); }
      if (k === 1) await w.say('Ottie', [
        'Pebble, on hole two, is the oldest of them. She grazes on that lane every day, and did long before I built a lane there.',
        'Spike, on three, swings his tail when he\'s thinking. He thinks a lot.',
        'Mabel sits on her eggs on four. There\'s a golden one she\'s been waiting on for years. Golf balls seem to help.',
        'And the bridge on nine was the first thing I built. The ravine was the first thing I fell into.',
        'Sometimes I think the valley was waiting for somebody to come and play in it. A door to everywhere has to open onto somewhere.',
      ].concat(has('s2.started') ? ['Oh, and a fellow in a grey hood comes in now and then. Terrible round, every time. Then they sit by Mabel\'s nest for hours. She likes them.'] : []));
    }
    function giveUp() {
      P.round = false; P.card = [];
      if (P.hole >= 0) { P.hole = -1; P.ball = null; P.mode = 'free'; w.player.freeze(false); ballInt.enabled = false; for (const hp of holeParts) hp.tee.enabled = true; }
      objective();
    }
    function hardestHole() {
      const hb = store.get('holeBest', []);
      let worst = 0, wv = -99;
      HOLES.forEach((H, i) => { const v = hb[i] == null ? 9 : hb[i] - H.par; if (v > wv) { wv = v; worst = i; } });
      return worst;
    }

    w.on('enter', () => {
      objective();
    });
    w.scene.userData.links = { P, HOLES, SP, ballInt, holeParts, OTTIE_AT, HUT, teeW, cupW, ballW, RAV, FALL, ECHO11 };
  },
};
