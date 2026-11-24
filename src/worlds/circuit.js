// Neon Circuit: a one-lap hoverboard time trial around a floating neon figure-eight above a synthwave city.
// Everyone races on a board here (forced on for the lap), and finishing a lap hands you the Hoverboard,
// which keeps working (B to ride) in every world that allows boards. Beat par for the Sigil of Speed.
//
// The track is generated from a list of pieces (straights and arcs) laid end to end, so the geometry,
// the checkpoint gates, the respawn points and the ghost all share one centreline.

// Par (beat it for the Sigil of Speed) and the track record (the Founder's lap: Echo III and a one-off coin bonus), in
// seconds. Measured with the key-driving test autopilot on the real physics (board capped at 25 m/s, boosts to 37.5),
// with its key presses delayed like a person's reactions (2026-11-23): 33.4 s with none, 34.9 at 0.1 s, 36.9 at 0.15 s,
// 38.0 at 0.2 s, and at 0.25 s it starts falling off (59 s). Par leaves room for a fall or two. The record used to be
// 32.5 s, faster than the undelayed autopilot, so no person could beat it; 37.5 asks for a well-learned line.

const PAR_TIME = 41, RECORD_TIME = 37.5;
const DS = 0.5;      // centreline sample spacing (m)

// From the start line, heading north (-z). S = straight { len }, L/R = arc { r, deg } turning left/right.
// w = width (m), bank = degrees into the turn, wall = 'out' (outside of the arc) or 'both'.
// The two 'auto' straights get whatever length closes the loop.
const LAYOUT = [
  { n: 'main', t: 'S', len: 130, w: 13 },
  { n: 'hp1', t: 'L', r: 8, deg: 180, w: 14, wall: 'out' },
  { n: 'hp1x', t: 'S', len: 12, w: 14 },
  { n: 'ess1', t: 'R', r: 14, deg: 90, w: 12, bank: 6, wall: 'out' },
  { n: 'ess2', t: 'S', len: 14, w: 12 },
  { n: 'ess3', t: 'L', r: 14, deg: 90, w: 12, bank: 6, wall: 'out' },
  { n: 'climb', t: 'S', len: 40, w: 12 },
  { n: 'sweep', t: 'L', r: 24, deg: 90, w: 12, bank: 10, wall: 'out' },
  { n: 'bridge', t: 'S', len: 52, w: 11, wall: 'both' },
  { n: 'kick', t: 'S', len: 8, w: 12 },
  { n: 'drop', t: 'S', len: 22, w: 14 },
  { n: 'sb1', t: 'L', r: 24, deg: 45, w: 13, bank: 6 },
  { n: 'sb2', t: 'R', r: 24, deg: 90, w: 12, bank: 8, wall: 'out' },
  { n: 'sb3', t: 'L', r: 24, deg: 45, w: 12, bank: 6 },
  { n: 'run', t: 'S', len: 8, w: 13 },
  { n: 'bowl', t: 'R', r: 36, deg: 180, w: 14, bank: 18, wall: 'out' },
  { n: 'gapS', t: 'S', auto: 'x', w: 13 },
  { n: 'tl', t: 'L', r: 14, deg: 90, w: 12, bank: 6, wall: 'out' },
  { n: 'leg', t: 'S', len: 12, w: 13 },
  { n: 'hp2', t: 'R', r: 9, deg: 180, w: 14, wall: 'out' },
  { n: 'home', t: 'S', auto: 'z', w: 13 },
];

const BOARD_LOOK = [
  { s: 'rbox', size: [0.7, 0.08, 1.6], pos: [0, 0.07, 0], color: '#1b1030', metal: 0.4 },
  { s: 'box', size: [0.56, 0.02, 1.3], pos: [0, 0.115, 0], color: '#2e2552' },
  { s: 'box', size: [0.5, 0.03, 1.3], pos: [0, 0.015, 0], color: '#ff4fd8', glow: 2.6 },
  { s: 'box', size: [0.04, 0.05, 1.45], pos: [0.34, 0.07, 0], color: '#2ff3ff', glow: 2.0 },
  { s: 'box', size: [0.04, 0.05, 1.45], pos: [-0.34, 0.07, 0], color: '#2ff3ff', glow: 2.0 },
  { s: 'box', size: [0.04, 0.13, 0.26], pos: [0, 0.16, -0.66], color: '#ff4fd8', glow: 1.6 },
  { s: 'cyl', r: 0.07, h: 0.1, pos: [0.18, 0.06, -0.8], rot: [90, 0, 0], color: '#7cf6ff', glow: 2.6 },
  { s: 'cyl', r: 0.07, h: 0.1, pos: [-0.18, 0.06, -0.8], rot: [90, 0, 0], color: '#7cf6ff', glow: 2.6 },
];
const NEON = { cyan: '#2ff3ff', pink: '#ff3fd8', violet: '#9d6bff', amber: '#ffb13b', lime: '#c6ff4a', white: '#f4f0ff' };

export default {
  id: 'circuit',
  name: 'Neon Circuit',
  author: 'elsewhere',
  version: 1,
  blurb: 'Race a neon figure-eight above a midnight city. Beat par for the Sigil of Speed.',
  color: '#ff4fd8',
  spawn: { pos: [-32, 1.2, 18], yaw: 90 },
  killY: -20,
  rules: { deny: ['glide', 'doublejump'], magic: false, powers: false }, // fair racing: no gliding over gaps, no air jumps, no artifacts; a machine world, where magic fizzles
  theme: {
    skyTop: '#020008', skyHorizon: '#d4207f', skyBottom: '#0a0214', skySharp: 0.32,
    sunDir: [0.0, 0.07, -1], sunColor: '#ff5ab4', sunSize: 0.02, sunLight: '#ff9ad6', sunIntensity: 1.1,
    hemiSky: '#7a5cff', hemiGround: '#1a0830', hemiIntensity: 1.25,
    fog: [220, 1300], fogColor: '#2a0a3c', stars: 0.95, bloom: 0.85, exposure: 1.1,
  },
  music: { root: 57, scale: 'minor', bpm: 110, progression: [0, 5, 2, 6], sparkle: 0.3, bright: 2600, pulse: true, wave: 'sawtooth' },
  items: {
    hoverboard: {
      name: 'Hoverboard', slot: 'board', family: 'machine', traits: ['board'], rarity: 'rare',
      desc: 'A Neon Circuit racing board. Press B to ride it in any world that allows boards.',
      look: BOARD_LOOK,
    },
    'sigil-speed': {
      name: 'Sigil of Speed', slot: null, traits: ['key'], rarity: 'legendary',
      desc: 'One of three sigils that open the Vault in Junction. Won by beating par on Neon Circuit.',
      look: [
        { s: 'oct', r: 0.32, color: '#ff4fd8', glow: 2.4 },
        { s: 'torus', r: 0.48, tube: 0.03, rot: [90, 0, 0], color: '#ffffff', glow: 1.6 },
        { s: 'torus', r: 0.4, tube: 0.02, rot: [90, 0, 28], color: '#2ff3ff', glow: 1.8 },
      ],
    },
  },

  build(w) {
    const T = w.THREE, D = Math.PI / 180;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

    // =====================================================================================
    // 1. Centreline: trace the pieces, solve the two 'auto' straights so the loop closes
    // =====================================================================================
    const pieces = LAYOUT.map((p) => Object.assign({}, p));
    const trace = (sample) => {
      let x = 0, z = 0, h = Math.PI, s = 0;
      for (const p of pieces) {
        p.s0 = s; p.x0 = x; p.z0 = z; p.h0 = h;
        if (p.t === 'S') {
          const L = p.len || 0, n = Math.max(1, Math.round(L / DS)), st = L / n;
          for (let i = 0; i < n && L > 0; i++) { if (sample) sample(x, z, h, s, p); x += Math.sin(h) * st; z += Math.cos(h) * st; s += st; }
        } else {
          const dir = p.t === 'L' ? 1 : -1, a = p.deg * D, r = p.r, len = r * a;
          const n = Math.max(2, Math.round(len / DS)), da = a / n;
          const cx = x + dir * r * Math.cos(h), cz = z - dir * r * Math.sin(h);
          for (let i = 0; i < n; i++) {
            if (sample) sample(x, z, h, s, p);
            h += dir * da; x = cx - dir * r * Math.cos(h); z = cz + dir * r * Math.sin(h); s += r * da;
          }
          p.len = len;
        }
        p.s1 = s;
      }
      return { x, z, h, s };
    };
    for (const p of pieces) if (p.auto) p.len = 0;
    const open = trace();
    for (const p of pieces) if (p.auto) {
      const dx = Math.round(Math.sin(p.h0)), dz = Math.round(Math.cos(p.h0));
      p.len = p.auto === 'x' ? -open.x / dx : -open.z / dz;
      if (!(p.len > 20)) throw new Error('circuit: layout does not close (' + p.n + ' = ' + p.len + ')');
    }
    const SX = [], SZ = [], SH = [], SS = [], SP = [];
    const end = trace((x, z, h, s, p) => { SX.push(x); SZ.push(z); SH.push(h); SS.push(s); SP.push(p); });
    const L = end.s, N = SX.length;
    const P = {}; for (const p of pieces) P[p.n] = p;
    const A = (name, off = 0) => P[name].s0 + off; // s at a piece start (+ offset)
    const idxAt = (s) => { // nearest sample to arc length s (binary search: arcs use slightly uneven steps)
      s = ((s % L) + L) % L;
      let lo = 0, hi = N - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SS[m] <= s) lo = m; else hi = m - 1; }
      const nextS = lo + 1 < N ? SS[lo + 1] : L;
      return nextS - s < s - SS[lo] ? (lo + 1) % N : lo;
    };

    // =====================================================================================
    // 2. Profiles along s: height (Hermite knots), bank, width, walls, gaps, kickers
    // =====================================================================================
    const snap = (s) => SS[idxAt(s)]; // special points sit exactly on a sample, so slabs can end there
    const KICK1 = Math.tan(10 * D), KICK2 = Math.tan(10.4 * D);
    const K1A = snap(A('kick')), LIP1 = snap(A('drop')), LIP1Y = 10 + (LIP1 - K1A) * KICK1;
    const K2A = snap(A('gapS', 16)), LIP2 = snap(A('gapS', 28)), GAP2 = snap(LIP2 + 10) - LIP2, LIP2Y = (LIP2 - K2A) * KICK2;
    const K = (s, y, ml = 0, mr = ml) => ({ s, y, ml, mr });
    const knots = [
      K(0, 0), K(A('climb'), 0), K(A('bridge', 17), 10), K(K1A, 10, 0, KICK1),
      K(LIP1, LIP1Y, KICK1, -0.05), K(A('drop', 30), 4.4, -0.26), K(A('sb3', 6), 0.6, -0.05), K(A('run'), 0),
      K(K2A, 0, 0, KICK2), K(LIP2, LIP2Y, KICK2, -0.2), K(LIP2 + GAP2, 0.5, -0.04), K(LIP2 + GAP2 + 24, 0), K(L, 0),
    ];
    const height = (s) => {
      s = ((s % L) + L) % L;
      let k = 0; while (k < knots.length - 2 && s > knots[k + 1].s) k++;
      const a = knots[k], b = knots[k + 1], ds = b.s - a.s, t = ds > 0 ? (s - a.s) / ds : 0, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * a.y + (t3 - 2 * t2 + t) * ds * a.mr + (-2 * t3 + 3 * t2) * b.y + (t3 - t2) * ds * b.ml;
    };
    const gaps = [[LIP2, LIP2 + GAP2]];
    const inGap = (s) => gaps.some(([a, b]) => s > a + 1e-6 && s < b - 1e-6);
    const kickers = [{ s: LIP1, ang: 10 }, { s: LIP2, ang: 10.4 }];
    const bankRaw = (s) => {
      let b = 0;
      for (const p of pieces) if (p.bank) {
        const sign = p.t === 'R' ? 1 : -1; // positive roll lifts the left edge: the outside of a right turn
        b += sign * p.bank * sstep(p.s0 - 9, p.s0 + 9, s) * (1 - sstep(p.s1 - 9, p.s1 + 9, s));
      }
      return b;
    };
    const wRaw = new Float32Array(N), SY = new Float32Array(N), SB = new Float32Array(N), SW = new Float32Array(N);
    const wallL = new Uint8Array(N), wallR = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const s = SS[i], p = SP[i];
      SY[i] = height(s); SB[i] = bankRaw(s) * D; wRaw[i] = p.w || 12;
    }
    for (let i = 0; i < N; i++) { // width transitions: moving average over ~12 m
      let acc = 0; const R = 12;
      for (let k = -R; k <= R; k++) acc += wRaw[(i + k + N) % N];
      SW[i] = acc / (2 * R + 1);
    }
    for (const p of pieces) if (p.wall) { // walls run a little past the piece ends
      const pre = 7, post = 9;
      for (let s = p.s0 - pre; s < p.s1 + post; s += DS) {
        const i = idxAt(s);
        if (p.wall === 'both') { wallL[i] = 1; wallR[i] = 1; }
        else if (p.t === 'L') wallR[i] = 1; else wallL[i] = 1;
      }
    }

    // per-sample frames: centre C, forward F, banked left Lt, banked up U
    const C = [], F = [], Lt = [], U = [];
    for (let i = 0; i < N; i++) {
      const s = SS[i], h = SH[i], slope = (height(s + 0.25) - height(s - 0.25)) / 0.5;
      const c = new T.Vector3(SX[i], SY[i], SZ[i]);
      const f = new T.Vector3(Math.sin(h), slope, Math.cos(h)).normalize();
      const l = new T.Vector3(Math.cos(h), 0, -Math.sin(h));
      const u0 = new T.Vector3().crossVectors(f, l).normalize();
      const lt = l.clone().multiplyScalar(Math.cos(SB[i])).addScaledVector(u0, Math.sin(SB[i])).normalize();
      C.push(c); F.push(f); Lt.push(lt); U.push(new T.Vector3().crossVectors(f, lt).normalize());
    }
    const frameAt = (s) => { const i = idxAt(s); return { i, c: C[i], f: F[i], l: Lt[i], u: U[i], h: SH[i], w: SW[i], y: SY[i] }; };
    const at = (s, lat = 0, up = 0) => { const fr = frameAt(s); return fr.c.clone().addScaledVector(fr.l, lat).addScaledVector(fr.u, up); };
    const yawAt = (s) => SH[idxAt(s)] / D;
    for (const k of kickers) { const kf = frameAt(k.s); k.gate = { c: kf.c, f: new T.Vector3(kf.f.x, 0, kf.f.z).normalize(), half: kf.w / 2 + 0.5 }; }

    // =====================================================================================
    // 3. Build the road: one box per short segment, fitted to the banked cross-sections
    // =====================================================================================
    const ROAD = '#1a1430', SLAB = 1.2;
    const tmpM = new T.Matrix4(), tmpE = new T.Euler();
    const placeBox = (mid, X, Y, Fz, local, size, o) => {
      const pos = mid.clone().addScaledVector(X, local[0]).addScaledVector(Y, local[1]).addScaledVector(Fz, local[2]);
      tmpM.makeBasis(X, Y, Fz); tmpE.setFromRotationMatrix(tmpM, 'YXZ');
      return w.box(Object.assign({ pos: [pos.x, pos.y, pos.z], size, rot: [tmpE.x / D, tmpE.y / D, tmpE.z / D] }, o));
    };
    const breakAt = new Set(gaps.map(([a]) => idxAt(a)));   // a slab must end exactly here (a gap lip)
    const resumeAt = new Set(gaps.map(([, b]) => idxAt(b))); // and the next one starts here
    const segs = [];
    {
      let a = 0;
      while (a < N) {
        if (inGap(SS[a]) || (breakAt.has(a) && inGap(SS[a] + DS))) { a++; continue; }
        let b = a + 1;
        while (b < N && !breakAt.has(b)) {
          const j = (b + 1) % N;
          const dh = Math.abs(angDiff(SH[a], SH[j])) / D, slope = Math.max(Math.abs(F[a].y), Math.abs(F[j].y));
          const dp = Math.abs(Math.asin(F[a].y) - Math.asin(F[j].y)) / D, db = Math.abs(SB[a] - SB[j]) / D;
          if (dh > (slope > 0.05 ? 2.5 : SP[a].r && SP[a].r < 12 ? 3.5 : 6) || dp > 1 || db > 0.5 || Math.abs(SW[a] - SW[j]) > 0.3 || (SS[j] || L) - SS[a] > 10) break;
          b++;
        }
        segs.push([a, b]);
        a = b;
      }
    }
    // each slab: a box from its start A to its end B, top face through the chord, banked by the average
    // of its two cross-sections, extended forwards only (to close the wedge gaps on the outside of curves)
    const frameOf = (A0, B0, la, lb) => {
      const Fz = B0.clone().sub(A0); const len = Fz.length(); Fz.normalize();
      const X = la.clone().add(lb); X.addScaledVector(Fz, -X.dot(Fz)).normalize();
      return { A: A0, B: B0, Fz, X, Y: new T.Vector3().crossVectors(Fz, X).normalize(), len };
    };
    const SEG = segs.map(([a, b]) => {
      const bi = b % N, f = frameOf(C[a].clone(), C[bi].clone(), Lt[a], Lt[bi]);
      f.a = a; f.b = bi; f.width = (SW[a] + SW[bi]) / 2;
      f.ext = breakAt.has(bi) ? 0 : 0.3 + (f.width / 2) * Math.tan(Math.min(Math.abs(angDiff(SH[a], SH[bi])), 0.6) / 2 + 0.02);
      return f;
    });
    // Shingle every joint: the slab ahead starts a hair *below* the one you are leaving, at every point
    // across the road, so any step faces away from the rider. At racing speed the character controller
    // treats even a 5 cm lip facing you as a wall and the board loses half its speed.
    for (let pass = 0; pass < 2; pass++) for (let k = 0; k < SEG.length; k++) {
      const prev = SEG[(k - 1 + SEG.length) % SEG.length], cur = SEG[k];
      if (prev.b !== cur.a) continue; // the far side of the gap
      const hw = Math.min(prev.width, cur.width) / 2 - 0.1;
      let worst = -1;
      for (const d of [-hw, -hw / 2, 0, hw / 2, hw]) worst = Math.max(worst, prev.Y.dot(cur.A.clone().addScaledVector(cur.X, d).sub(prev.B)));
      if (worst > -0.004) Object.assign(cur, frameOf(cur.A.clone().addScaledVector(cur.Y, -(worst + 0.006)), cur.B, Lt[cur.a], Lt[cur.b]));
    }
    for (const sf of SEG) {
      const { X, Y, Fz, width } = sf, full = sf.len + sf.ext, mid = sf.A.clone().addScaledVector(Fz, full / 2);
      // road slab
      placeBox(mid, X, Y, Fz, [0, -SLAB / 2, 0], [width, SLAB, full], { color: ROAD, rough: 0.55, metal: 0.15 });
      // neon edge lines on top and glowing bands down the sides
      const hw = width / 2;
      placeBox(mid, X, Y, Fz, [hw - 0.28, 0.025, 0], [0.2, 0.05, full], { color: NEON.cyan, glow: 1.3, collide: false, shadow: false });
      placeBox(mid, X, Y, Fz, [-hw + 0.28, 0.025, 0], [0.2, 0.05, full], { color: NEON.pink, glow: 1.8, collide: false, shadow: false });
      placeBox(mid, X, Y, Fz, [hw + 0.03, -0.45, 0], [0.06, 0.22, full], { color: NEON.cyan, glow: 1.1, collide: false, shadow: false });
      placeBox(mid, X, Y, Fz, [-hw - 0.03, -0.45, 0], [0.06, 0.22, full], { color: NEON.pink, glow: 1.4, collide: false, shadow: false });
      // walls on the outside of tight corners and along the bridge
      const wl = wallL[sf.a] && wallL[sf.b], wr = wallR[sf.a] && wallR[sf.b];
      for (const [on, side, col, g] of [[wl, 1, NEON.cyan, 1.0], [wr, -1, NEON.pink, 1.8]]) {
        if (!on) continue;
        placeBox(mid, X, Y, Fz, [side * (hw - 0.3), 0.45, 0], [0.6, 1.3, full], { color: '#2a1f48', rough: 0.4 });
        placeBox(mid, X, Y, Fz, [side * (hw - 0.3), 1.13, 0], [0.64, 0.07, full], { color: col, glow: g, collide: false, shadow: false });
      }
    }
    // dashed centre line on the straights
    for (let s = 2; s < L; s += 9) {
      const p = SP[idxAt(s)];
      if (p.t !== 'S' || inGap(s) || inGap(s + 4)) continue;
      const fr = frameAt(s + 2);
      placeBox(fr.c, fr.l, fr.u, fr.f, [0, 0.02, 0], [0.22, 0.04, 4], { color: '#5b47a0', glow: 0.7, collide: false, shadow: false });
    }

    // =====================================================================================
    // 4. Set pieces: kickers, gap, start line, gates, bridge, spines, chevrons, pylons
    // =====================================================================================
    // kicker lips: hazard-yellow stripes so you see the jump coming
    for (const k of kickers) for (let d = 1; d <= 7; d += 3) {
      const fr = frameAt(k.s - d);
      placeBox(fr.c, fr.l, fr.u, fr.f, [0, 0.03, 0], [fr.w - 1.4, 0.05, 0.4], { color: NEON.amber, glow: 1.3, collide: false, shadow: false });
    }
    { // the gap: a glowing edge on the far side and a warning label
      const land = frameAt(LIP2 + GAP2 + 0.5);
      placeBox(land.c, land.l, land.u, land.f, [0, -0.6, 0], [land.w + 0.2, 1.25, 0.2], { color: NEON.amber, glow: 1.8, collide: false });
      const lp = at(LIP2 - 12, 0, 5.2);
      w.label({ pos: [lp.x, lp.y, lp.z], text: 'GAP · KEEP IT FLAT OUT', size: 0.55, color: '#ffe3a8', border: NEON.amber });
    }
    // checkered start/finish line
    {
      const fr = frameAt(0.6), n = Math.round(fr.w / 0.65);
      for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) {
        const lat = (k - (n - 1) / 2) * (fr.w / n);
        placeBox(fr.c, fr.l, fr.u, fr.f, [lat, 0.025, (r - 0.5) * 0.65], [fr.w / n, 0.05, 0.65], { color: (k + r) % 2 ? '#f4f0ff' : '#120c1e', glow: (k + r) % 2 ? 0.9 : 0, collide: false, shadow: false });
      }
    }
    // arches: the start/finish line and six checkpoint gates, each with its own material so it can light up
    const arch = (s, color, big) => {
      const fr = frameAt(s), half = fr.w / 2 + (big ? 1.6 : 1.0), hgt = big ? 9 : 7;
      const yaw = Math.atan2(fr.f.x, fr.f.z);
      const g = new T.Group(); g.position.copy(fr.c); g.rotation.y = yaw; w.add(g);
      const dark = w.mat('#20183a', { rough: 0.5, metal: 0.3 });
      const glow = new T.MeshStandardMaterial({ color, emissive: new T.Color(color), emissiveIntensity: 1.2, roughness: 0.4 });
      const box = (m, sx, sy, sz, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = true; g.add(b); return b; };
      const pw = big ? 1.3 : 0.7;
      for (const side of [-1, 1]) {
        box(dark, pw, hgt, pw, side * half, hgt / 2 - 1.2, 0);
        box(glow, 0.12, hgt - 1.6, 0.12, side * (half - pw / 2 - 0.02), hgt / 2 - 0.6, pw / 2 + 0.02);
        box(glow, 0.12, hgt - 1.6, 0.12, side * (half - pw / 2 - 0.02), hgt / 2 - 0.6, -pw / 2 - 0.02);
      }
      box(dark, half * 2 + pw, big ? 1.6 : 0.9, pw, 0, hgt - 0.6, 0);
      box(glow, half * 2 + pw - 0.6, 0.14, 0.14, 0, hgt - 0.6 - (big ? 0.55 : 0.3), pw / 2 + 0.03);
      box(glow, half * 2 + pw - 0.6, 0.14, 0.14, 0, hgt - 0.6 - (big ? 0.55 : 0.3), -pw / 2 - 0.03);
      return { glow, s, top: fr.c.y + hgt };
    };
    const finishArch = arch(0, NEON.pink, true);
    { const p = at(0, 0, 11.2); w.label({ pos: [p.x, p.y, p.z], text: 'NEON CIRCUIT', size: 1.5, color: '#ffd6f5', border: NEON.pink }); }
    const GATES = [A('main', 62), A('hp1x', 0.5), A('bridge', 0), A('sb2', 6), A('gapS', 2), A('home', 1)];
    const gates = GATES.map((s, k) => {
      const fr = frameAt(s), a = arch(s, NEON.cyan, false);
      const lp = at(s, 0, 8.4); w.label({ pos: [lp.x, lp.y, lp.z], text: String(k + 1), size: 0.9, color: '#e8fdff', border: NEON.cyan });
      return { s, i: fr.i, arch: a, c: fr.c.clone(), f: new T.Vector3(fr.f.x, 0, fr.f.z).normalize(), half: fr.w / 2 + 1.5, yaw: yawAt(s) };
    });
    const finish = { s: 0, c: frameAt(0).c.clone(), f: new T.Vector3(frameAt(0).f.x, 0, frameAt(0).f.z).normalize(), half: frameAt(0).w / 2 + 1.5 };

    // the bridge: where the figure-eight crosses itself
    const CROSS = A('bridge', -P.bridge.x0);
    {
      const deck = frameAt(CROSS);
      for (const dx of [-9.5, 9.5]) for (const dz of [-4.5, 4.5]) {
        w.cylinder({ pos: [dx, (deck.y - SLAB - 62) / 2, deck.c.z + dz], radius: 0.7, height: deck.y - SLAB + 62, sides: 8, color: '#1e1736', collide: false });
      }
      for (const dz of [-6.2, 6.2]) w.box({ pos: [0, deck.y - SLAB - 0.15, deck.c.z + dz], size: [26, 0.3, 0.3], color: NEON.violet, glow: 2, collide: false, shadow: false });
      w.light({ pos: [0, deck.y - 3, deck.c.z], color: '#c08bff', intensity: 40, distance: 26 });
      const lp = at(CROSS, 0, 6.5); w.label({ pos: [lp.x, lp.y, lp.z], text: 'THE CROSSOVER', size: 0.6, color: '#efe3ff', border: NEON.violet });
    }
    // spines: tall walls inside the two hairpins so nobody hops across
    const spine = (sA, sB, sC, sD) => { // between the inner edges of two parallel straights
      const a = at(sA), b = at(sB), c = at(sC), d = at(sD);
      const m1 = a.clone().add(c).multiplyScalar(0.5), m2 = b.clone().add(d).multiplyScalar(0.5);
      const mid = m1.clone().add(m2).multiplyScalar(0.5), len = m1.distanceTo(m2);
      const yaw = Math.atan2(m2.x - m1.x, m2.z - m1.z) / D;
      w.box({ pos: [mid.x, mid.y + 1.0, mid.z], size: [1.4, 3.2, len], yaw, color: '#241a40' });
      w.box({ pos: [mid.x, mid.y + 2.65, mid.z], size: [1.5, 0.1, len + 0.1], yaw, color: NEON.amber, glow: 1.2, collide: false });
      w.cylinder({ pos: [m1.x, m1.y + 1.6, m1.z], radius: 0.95, height: 3.2, color: '#241a40' });
      w.cylinder({ pos: [m1.x, m1.y + 3.25, m1.z], radius: 1.0, height: 0.12, color: NEON.amber, glow: 1.4, collide: false });
    };
    spine(A('hp1', 0), A('hp1', -16), A('hp1x', 0), A('hp1x', 12)); // main straight vs hairpin exit
    spine(A('hp2', P.hp2.len), A('home', 16), A('hp2', 0), A('leg', 0));
    // chevron boards on the outside walls of the hairpins
    const chevrons = (pn) => {
      const p = P[pn], dir = p.t === 'L' ? 1 : -1;
      for (let k = 1; k < 6; k++) {
        const s = p.s0 + p.len * k / 6, fr = frameAt(s), side = -dir; // outside: right for L turns, left for R turns
        const base = fr.c.clone().addScaledVector(fr.l, side * (fr.w / 2 - 0.3)).addScaledVector(fr.u, 2.1);
        const tang = new T.Vector3(fr.f.x, 0, fr.f.z).normalize(), up = new T.Vector3(0, 1, 0);
        const nrm = new T.Vector3().crossVectors(tang, up); // board faces the track
        if (nrm.dot(fr.c.clone().sub(base)) < 0) nrm.negate();
        const X = new T.Vector3().crossVectors(up, nrm).normalize(); // board-local x
        const flip = X.dot(tang) > 0 ? 1 : -1;
        placeBox(base, X, up, nrm, [0, 0, -0.05], [2.4, 1.5, 0.12], { color: '#120c22', collide: false });
        for (const sy of [1, -1]) {
          const pos = base.clone().addScaledVector(X, flip * 0.05).addScaledVector(up, sy * 0.27).addScaledVector(nrm, 0.03);
          const r = new T.Matrix4().makeBasis(X, up, nrm).multiply(new T.Matrix4().makeRotationZ(-sy * flip * 0.85));
          tmpE.setFromRotationMatrix(r, 'YXZ');
          w.box({ pos: [pos.x, pos.y, pos.z], size: [0.95, 0.2, 0.06], rot: [tmpE.x / D, tmpE.y / D, tmpE.z / D], color: NEON.amber, glow: 2.4, collide: false, shadow: false });
        }
      }
    };
    chevrons('hp1'); chevrons('hp2');
    // pylons holding the track up, fading into the haze
    for (let s = 10; s < L; s += 34) {
      if (inGap(s) || Math.abs(s - CROSS) < 12 || Math.abs(s - A('main', 26)) < 12) continue;
      const fr = frameAt(s), top = fr.c.y - SLAB - 0.2;
      w.cylinder({ pos: [fr.c.x, (top - 70) / 2, fr.c.z], radius: 0.9, height: top + 70, sides: 8, color: '#17112a', collide: false });
      w.cylinder({ pos: [fr.c.x, top - 0.6, fr.c.z], radius: 1.05, height: 0.16, sides: 8, color: NEON.violet, glow: 2, collide: false });
    }

    // =====================================================================================
    // 5. Boost pads and coins
    // =====================================================================================
    for (const s of [A('main', 40), A('main', 84), A('home', 14)]) {
      const fr = frameAt(s);
      w.boostPad({ pos: [fr.c.x, fr.c.y, fr.c.z], yaw: yawAt(s), width: fr.w - 1, power: 36, time: 1.3 });
    }
    const coinAt = (s, lat, up = 1.0) => { const p = at(s, lat, up); w.coin({ pos: [p.x, p.y, p.z] }); };
    const arcCoins = (lip, lipY, ang, v, times) => { // coins along the flight path of a kicker taken at speed v
      const vy = v * Math.sin(ang * D) + 1;
      for (const t of times) { const p = at(lip + v * t); w.coin({ pos: [p.x, lipY + 0.93 + vy * t - 15 * t * t, p.z] }); }
    };
    [96, 106, 116].forEach((s) => coinAt(A('main', s), -3.6));        // entry line for hairpin 1
    coinAt(A('hp1', P.hp1.len / 2), 4.2);                             // hairpin apex
    coinAt(A('ess1', P.ess1.len / 2), -3.2); coinAt(A('ess3', P.ess3.len / 2), 3.2);
    coinAt(A('bridge', 28), 0); coinAt(A('bridge', 40), 0);           // over the crossover
    arcCoins(LIP1, LIP1Y, 10, 33, [0.32, 0.6]);                       // off the bridge kicker
    coinAt(A('bowl', P.bowl.len * 0.38), 5, 1.0); coinAt(A('bowl', P.bowl.len * 0.62), 5, 1.0); // high line in the bowl
    arcCoins(LIP2, LIP2Y, 10.4, 32, [0.2, 0.42]);                      // over the gap
    coinAt(A('hp2', P.hp2.len / 2), -4.4);                            // hairpin 2 apex
    coinAt(A('home', 40), 0);

    // =====================================================================================
    // 6. The paddock: arrival, portal, mechanic, signs, grid
    // =====================================================================================
    const PAD = { x0: -48, x1: -6.2, z0: -8, z1: 44 };
    w.box({ pos: [(PAD.x0 + PAD.x1) / 2, -0.6, (PAD.z0 + PAD.z1) / 2], size: [PAD.x1 - PAD.x0, 1.2, PAD.z1 - PAD.z0], color: '#1d1634', rough: 0.6 });
    w.box({ pos: [(PAD.x0 + PAD.x1) / 2, -1.25, (PAD.z0 + PAD.z1) / 2], size: [PAD.x1 - PAD.x0 + 0.3, 0.12, PAD.z1 - PAD.z0 + 0.3], color: NEON.violet, glow: 2, collide: false });
    for (let x = PAD.x0 + 4; x < PAD.x1 - 2; x += 6) w.box({ pos: [x, 0.01, (PAD.z0 + PAD.z1) / 2], size: [0.08, 0.02, PAD.z1 - PAD.z0 - 2], color: '#3a2d66', collide: false, shadow: false });
    // barrier between paddock and track, open at the grid
    const GRID_Z = [8, 26];
    for (const [z0, z1] of [[PAD.z0, GRID_Z[0]], [GRID_Z[1], PAD.z1]]) {
      w.box({ pos: [-7.0, 0.5, (z0 + z1) / 2], size: [0.6, 1.0, z1 - z0], color: '#2a1f48' });
      w.box({ pos: [-7.0, 1.03, (z0 + z1) / 2], size: [0.64, 0.07, z1 - z0], color: NEON.violet, glow: 2.2, collide: false });
    }
    for (const [x0, x1, z] of [[PAD.x0, PAD.x1 - 1, PAD.z0 + 0.3], [PAD.x0, PAD.x1 - 1, PAD.z1 - 0.3]]) w.box({ pos: [(x0 + x1) / 2, 0.5, z], size: [x1 - x0, 1.0, 0.6], color: '#2a1f48' });
    w.box({ pos: [PAD.x0 + 0.3, 0.5, (PAD.z0 + PAD.z1) / 2], size: [0.6, 1.0, PAD.z1 - PAD.z0], color: '#2a1f48' });
    w.portal({ pos: [-44, 0, 18], yaw: 90, to: 'hub', label: 'Junction', subtitle: 'Back to the crossroads', arrive: 12 }); // far enough that the camera starts clear of the portal
    // pit garages along the north edge, open to the south
    [[-40, NEON.pink], [-30, NEON.cyan], [-20, NEON.lime]].forEach(([x, col], k) => {
      const z = -3;
      w.box({ pos: [x, 3, -7.3], size: [8, 6, 0.4], color: '#241b40' });
      w.box({ pos: [x - 3.9, 3, z], size: [0.3, 6, 9], color: '#241b40' });
      w.box({ pos: [x, 6.1, z], size: [8.4, 0.3, 9.4], color: '#241b40' });
      w.box({ pos: [x, 5.85, z + 4.7], size: [8.4, 0.12, 0.12], color: col, glow: 1.5, collide: false });
      w.box({ pos: [x + 1.5, 0.45, z - 2], size: [1.6, 0.9, 1.2], color: '#3a2d66' });
      w.box({ pos: [x - 1.8, 0.3, z - 1], size: [0.9, 0.6, 2.2], color: '#2e2552' });
      if (k === 1) w.light({ pos: [x, 4.5, z], color: '#ff7ad9', intensity: 22, distance: 16 });
    });
    // the grid
    const GRID_S = L - 16;
    const gridF = frameAt(GRID_S);
    for (const dz of [-1.6, 1.6]) placeBox(gridF.c, gridF.l, gridF.u, gridF.f, [0, 0.03, dz], [4.2, 0.05, 0.16], { color: NEON.white, glow: 1.2, collide: false, shadow: false });
    for (const dx of [-2.1, 2.1]) placeBox(gridF.c, gridF.l, gridF.u, gridF.f, [dx, 0.03, 0], [0.16, 0.05, 3.36], { color: NEON.white, glow: 1.2, collide: false, shadow: false });
    // the start zone: a pulsing neon outline (its own material, so it can breathe while you are idle)
    const gridMat = new T.MeshStandardMaterial({ color: NEON.lime, emissive: new T.Color(NEON.lime), emissiveIntensity: 1.5, roughness: 0.4 });
    const gz0 = GRID_Z[0] + 0.3, gz1 = GRID_Z[1] - 0.3, gx = 6.0;
    for (const [sx, sz, x, z] of [[gx * 2, 0.22, 0, gz0], [gx * 2, 0.22, 0, gz1], [0.22, gz1 - gz0, -gx, (gz0 + gz1) / 2], [0.22, gz1 - gz0, gx, (gz0 + gz1) / 2]]) {
      const m = new T.Mesh(new T.BoxGeometry(sx, 0.05, sz), gridMat); m.position.set(x, 0.035, z); w.add(m);
    }
    const gridLabel = w.label({ pos: [-7.5, 4.2, 17], text: 'STEP ONTO THE GRID TO RACE  →', size: 0.75, color: '#efffd0', border: NEON.lime });
    w.light({ pos: [0, 7, 4], color: '#ff6ad5', intensity: 45, distance: 30 });
    w.light({ pos: [-24, 7, 18], color: '#b48cff', intensity: 70, distance: 36 });
    w.light({ pos: [-14, 5, 30], color: '#ff8ad8', intensity: 40, distance: 24 });

    w.sign({ pos: [-22, 0, 9.5], yaw: -42, title: 'NEON CIRCUIT', width: 3.4, text: `One lap, six gates, in order. Step onto the glowing grid to start.\nW throttle · S brake · A/D steer · Space hop.\nBeat par for the Sigil of Speed.` });

    const fmt = (t) => (t == null ? '--:--.--' : w.fmtTime(t));
    const PAR = () => PAR_TIME, RECORD = () => RECORD_TIME;
    let timesLabel = null;
    const refreshBoard = () => {
      if (timesLabel) { timesLabel.removeFromParent(); if (timesLabel.material.map) timesLabel.material.map.dispose(); timesLabel.material.dispose(); }
      const best = w.store.get('best', null), last = w.store.get('last', null);
      const lines = [`PAR ${fmt(PAR())}   ·   RECORD ${fmt(RECORD())}`, `YOUR BEST ${fmt(best)}${last != null ? `   ·   LAST ${fmt(last)}` : ''}`];
      timesLabel = w.label({ pos: [-20, 5.2, 30], text: lines.join('\n'), size: 1.1, color: '#ffe9fb', border: NEON.pink });
    };
    refreshBoard();

    // the mechanic
    const sawTalk = () => !!w.store.get('talked', false);
    w.npc({ pos: [-27, 0, 25], yaw: -125, name: 'Vex', colors: { body: '#2b2f45', head: '#ffd6a5', visor: NEON.pink }, hat: 'cap', wave: true, onTalk: async () => {
      const best = w.store.get('best', null);
      if (!sawTalk()) {
        w.store.set('talked', true);
        await w.say('Vex', [
          'Welcome to Neon Circuit. One lap, six gates, you against the clock.',
          'Step onto the glowing grid by the track and the countdown starts. You ride a board for the whole lap, whether you own one or not.',
          'W to throttle, S to brake, A and D to steer, Space to hop. The camera follows you.',
          'The gates count in order. Fall off and you restart at the last gate you passed, but the clock keeps running.',
          `Beat par, ${fmt(PAR())}, and the Sigil of Speed is yours. Finish a lap at all and you keep the board.`,
        ]);
        return;
      }
      const tips = [
        'Tap S before the two hairpins. A wall costs you far more than a brake.',
        'Hit the kickers straight and you fly. The landings are wide, so stay on the throttle.',
        'The bowl is banked. Coins sit up high on the outside if you are brave.',
        'Your best lap races you as a ghost. Beat your own line.',
        'The boost pads on the main straight sling you into hairpin one. Brake late, but brake.',
      ];
      const lines = [];
      if (best == null) lines.push('No lap yet? The glowing grid is through the gap in the barrier. Go!');
      else if (best > PAR()) lines.push(`Best so far ${fmt(best)}. Par is ${fmt(PAR())}. You are ${(best - PAR()).toFixed(2)} s off.`);
      else if (best > RECORD()) lines.push(`Par beaten with ${fmt(best)}. The track record is ${fmt(RECORD())}. Nobody has touched it.`);
      else lines.push(`${fmt(best)}. You broke the record. I have nothing left to teach you.`);
      lines.push(tips[(w.ticks >> 4) % tips.length]);
      if (w.has('hoverboard')) lines.push('Your board works anywhere boards are allowed. Press B to hop on.');
      await w.say('Vex', lines);
    } });
    // a display board on a plinth next to Vex
    w.cylinder({ pos: [-23, 0.45, 28.5], radius: 1.0, height: 0.9, sides: 8, color: '#2a1f48' });
    w.cylinder({ pos: [-23, 0.92, 28.5], radius: 1.05, height: 0.06, sides: 8, color: NEON.cyan, glow: 2, collide: false });
    const showBoard = w.model({ pos: [-23, 1.55, 28.5], rot: [0, 0, 0], scale: 1.5, parts: BOARD_LOOK });
    w.spin(showBoard, { speed: 0.8 });

    // =====================================================================================
    // 7. The city: grid floor, sun, skyline, haze particles
    // =====================================================================================
    const CX = 30, CZ = -10; // rough centre of the track
    {
      const mat = new T.ShaderMaterial({
        uniforms: { line: { value: new T.Color('#ff3fd8') }, base: { value: new T.Color('#07020f') }, haze: { value: new T.Color('#2a0a3c') }, cell: { value: 24 } },
        vertexShader: 'varying vec3 vW; void main(){ vec4 p = modelMatrix * vec4(position, 1.0); vW = p.xyz; gl_Position = projectionMatrix * viewMatrix * p; }',
        fragmentShader: `uniform vec3 line; uniform vec3 base; uniform vec3 haze; uniform float cell; varying vec3 vW;
          void main(){
            vec2 g = vW.xz / cell; vec2 fw = fwidth(g);
            vec2 a = abs(fract(g - 0.5) - 0.5) / max(fw, vec2(1e-4));
            float ln = 1.0 - min(min(a.x, a.y), 1.0);
            float d = length(vW.xz - cameraPosition.xz);
            float near = 1.0 - smoothstep(250.0, 1500.0, d);
            vec3 col = mix(base, line * 2.4, ln * near * clamp(1.4 - max(fw.x, fw.y) * 3.0, 0.0, 1.0));
            col = mix(haze, col, 0.25 + 0.75 * near);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      });
      const floor = new T.Mesh(new T.PlaneGeometry(5000, 5000), mat);
      floor.rotation.x = -Math.PI / 2; floor.position.set(CX, -62, CZ); w.add(floor);
    }
    const sunDir = new T.Vector3(0, 0.07, -1).normalize();
    const sun = new T.Mesh(new T.CircleGeometry(150, 64), new T.ShaderMaterial({
      uniforms: { t: { value: 0 } }, transparent: true, depthWrite: false, fog: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float t; varying vec2 vUv;
        void main(){
          vec2 p = vUv * 2.0 - 1.0; float r = length(p); if (r > 1.0) discard;
          vec3 col = mix(vec3(1.0, 0.12, 0.55), vec3(1.0, 0.86, 0.32), smoothstep(-0.85, 0.75, p.y));
          float band = fract(p.y * 9.0 + t * 0.35);
          float gapw = clamp((0.25 - p.y) * 0.42, 0.0, 0.55);
          if (p.y < 0.25 && band < gapw) discard;
          float edge = smoothstep(1.0, 0.94, r);
          gl_FragColor = vec4(col * (1.0 + 0.25 * (1.0 - r)), edge);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    sun.renderOrder = -8; sun.frustumCulled = false; w.add(sun);
    {
      const R = w.rand(77), winCols = ['#ff4fd8', '#2ff3ff', '#ffb13b', '#9d6bff', '#ff7a9c'];
      for (let k = 0; k < 64; k++) {
        const a = (k / 64) * Math.PI * 2 + R.range(-0.03, 0.03), rad = R.range(430, 720);
        const x = CX + Math.sin(a) * rad, z = CZ + Math.cos(a) * rad;
        const bw = R.range(22, 48), bd = R.range(22, 48), bh = R.range(90, 280), base = -62;
        const yaw = a / D + 180;
        w.box({ pos: [x, base + bh / 2, z], size: [bw, bh, bd], yaw, color: R() < 0.5 ? '#0c0718' : '#110a22', collide: false, shadow: false });
        const fx = -Math.sin(a), fz = -Math.cos(a); // towards the track
        const col = R.pick(winCols), rows = Math.floor(bh / 9);
        for (let r = 2; r < rows; r++) {
          if (R() < 0.35) continue;
          const y = base + r * 9;
          w.box({ pos: [x + fx * (bd / 2 + 0.2), y, z + fz * (bd / 2 + 0.2)], size: [bw * R.range(0.4, 0.85), 1.2, 0.3], yaw, color: R() < 0.8 ? col : R.pick(winCols), glow: 1.8, collide: false, shadow: false });
        }
        w.box({ pos: [x, base + bh + 0.6, z], size: [bw * 0.3, 1.2, bd * 0.3], yaw, color: R() < 0.5 ? '#ff2f4f' : col, glow: 2.4, collide: false, shadow: false });
      }
    }
    w.particles({ pos: [CX, -20, CZ], area: [420, 70, 420], count: 220, color: ['#ff4fd8', '#2ff3ff', '#b28bff'], size: 0.55, kind: 'rise', speed: 2.5 });

    // =====================================================================================
    // 8. Race logic
    // =====================================================================================
    const G = gates.length;
    let state = 'idle', cdT = 0, cdStep = -1, next = 0, raceT0 = 0, finT = 0, finHold = 3.6, loaned = false, skipCross = false;
    let splits = [], ghostRec = [], tickN = 0;
    const later = []; // [time, fn]: small sim-time scheduler for staged banners
    const after = (dt, fn) => later.push([w.time + dt, fn]);
    const bestSplits = () => w.store.get('splits', null);

    // markers (UI only): the grid while you are off the track, the next gate in a race, the finish line after the last
    const mark = (f) => ({ at: [f.c.x, f.c.y + 3.2, f.c.z] });
    const objective = () => {
      const best = w.store.get('best', null);
      if (state === 'racing') w.objective(`Gate ${Math.min(next + 1, G)} of ${G}${next >= G ? ' done: to the finish line!' : ''} · par ${fmt(PAR())}`, mark(next < G ? gates[next] : finish));
      else if (state === 'countdown') w.objective('Get ready…');
      else if (state === 'finished') w.objective(`Lap ${fmt(w.store.get('last', null))} · best ${fmt(best)} · par ${fmt(PAR())}`);
      else w.objective(best == null ? 'Step onto the glowing grid to race (Vex knows the track).' : `Best ${fmt(best)} · par ${fmt(PAR())}. Step onto the grid to race again.`, mark(gridF));
    };

    // progress along the centreline: used for the dynamic kill height, wrong-way warnings and respawns
    let prog = 0;
    const nearest = (p, from, span) => {
      let best = from, bd = 1e18;
      const lo = span ? from - span : 0, hi = span ? from + span : N - 1;
      for (let j = lo; j <= hi; j += span ? 1 : 2) {
        const i = ((j % N) + N) % N, dx = p[0] - SX[i], dy = (p[1] - 0.9 - SY[i]) * 2, dz = p[2] - SZ[i];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bd) { bd = d; best = i; }
      }
      return [best, Math.sqrt(bd)];
    };
    const resync = () => { prog = nearest(w.player.pos, 0, 0)[0]; };
    const inPaddock = (p) => p[0] > PAD.x0 - 1 && p[0] < -7.4 && p[2] > PAD.z0 - 1 && p[2] < PAD.z1 + 1 && p[1] > -3 && p[1] < 8;

    // the ghost of your best lap
    const ghostColors = { body: '#ff4fd8', head: '#ffe3f8', visor: '#2ff3ff' };
    // the Founder's third Echo (GAME.md): the track record was the Founder's lap. Beat it and an echo wakes in the cyan garage
    const echo3 = w.echo({ id: '3', pos: [-30, 1.7, -4.2], hidden: !w.store.get('recordBeaten', false), line: 'Fast is a kind of forgetting. I raced to stop thinking. You raced to find me.', next: "Echo IV: \"Twenty-five crystals in one round of Crystal Rush, and I will wait above the tower. Look up.\"" });
    let ghost = null, ghostData = w.store.get('ghost', null);
    const makeGhost = () => {
      if (ghost || !ghostData) return;
      ghost = w.avatar({ colors: ghostColors, eq: { board: 'hoverboard' }, name: `GHOST ${fmt(ghostData.t)}`, nameColor: '#ffd6f5' });
      ghost.root.traverse((o) => {
        if (o.isMesh && o.material && !o.isSprite) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.38; o.material.depthWrite = false; }
      });
      ghost.root.visible = false;
    };
    const ghostAt = (t) => { // position + yaw at lap time t
      const d = ghostData.d, n = d.length / 4, k = clamp(t / (ghostData.step / 60), 0, n - 1.001), i = Math.floor(k), f = k - i;
      const g = (j, c) => d[(i + j) * 4 + c];
      const yaw0 = g(0, 3) * D, yaw1 = g(1, 3) * D;
      return { x: (g(0, 0) + (g(1, 0) - g(0, 0)) * f) / 10, y: (g(0, 1) + (g(1, 1) - g(0, 1)) * f) / 10, z: (g(0, 2) + (g(1, 2) - g(0, 2)) * f) / 10, yaw: yaw0 + angDiff(yaw0, yaw1) * f, done: k >= n - 1.01 };
    };
    let ghostPrev = null;

    const loanBoard = () => {
      if (w.player.canUse('board')) return; // already riding their own board item
      if (w.has('hoverboard')) { w.equip('hoverboard'); return; }
      w.give('hoverboard', { silent: true }); w.equip('hoverboard'); loaned = true;
    };
    const returnLoan = () => { if (loaned && !w.store.get('boardEarned', false)) w.take('hoverboard'); loaned = false; };

    const startCountdown = () => {
      if (state !== 'idle') return;
      state = 'countdown'; cdT = 0; cdStep = -1;
      const p = gridF.c;
      w.player.setPos([p.x, p.y + 1.0, p.z], yawAt(GRID_S));
      w.player.forceBoard(true); loanBoard(); w.player.freeze(true);
      w.timer.cancel();
      makeGhost(); if (ghost) { const g = ghostAt(0); ghost.root.visible = true; ghost.root.position.set(g.x, g.y - 0.9, g.z); ghost.root.rotation.y = g.yaw; }
      objective();
    };
    const goRace = () => {
      state = 'racing'; next = 0; splits = []; ghostRec = []; tickN = 0; raceT0 = w.time;
      w.player.freeze(false); w.timer.start(); w.player.setCheckpoint([gridF.c.x, gridF.c.y + 1.0, gridF.c.z], yawAt(GRID_S));
      gates.forEach((g) => { g.arch.glow.emissiveIntensity = 1.2; });
      objective();
    };
    const endRace = (toPaddock) => {
      state = 'idle'; w.player.freeze(false); w.player.forceBoard(false);
      gates.forEach((g) => { g.arch.glow.emissiveIntensity = 1.2; });
      if (ghost) ghost.root.visible = false;
      if (toPaddock) { w.player.setPos([-12, 1.0, 17], 90); w.player.setCheckpoint([-12, 1.0, 17], 90); resync(); }
      objective();
    };
    const abandon = (why) => {
      if (state !== 'racing' && state !== 'countdown') return;
      w.timer.cancel(); w.toast(why); returnLoan(); endRace(false);
    };

    const crossed = (g, a, b) => { // did the player cross gate g forwards between positions a and b?
      const da = (a[0] - g.c.x) * g.f.x + (a[2] - g.c.z) * g.f.z, db = (b[0] - g.c.x) * g.f.x + (b[2] - g.c.z) * g.f.z;
      if (!(da < 0 && db >= 0)) return false;
      const lat = Math.abs((b[0] - g.c.x) * g.f.z - (b[2] - g.c.z) * g.f.x);
      return lat < g.half && b[1] > g.c.y - 4 && b[1] < g.c.y + 9;
    };

    const finishRace = () => {
      const t = w.timer.stop();
      w.record('lap', t);
      state = 'finished'; finT = 0;
      const prevBest = w.store.get('best', null), isBest = prevBest == null || t < prevBest;
      w.store.set('last', t);
      if (isBest) {
        w.store.set('best', t); w.store.set('splits', splits.slice());
        ghostData = { t, step: 6, d: ghostRec.slice() }; w.store.set('ghost', ghostData);
        if (ghost) { ghost.root.removeFromParent(); ghost = null; }
      }
      w.sound('win'); w.shake(0.4);
      const p = finish.c;
      w.burst([p.x, p.y + 4, p.z], { color: [NEON.pink, NEON.cyan, '#ffffff', NEON.amber], count: 120, speed: 14, life: 1.6 });
      const sub = [];
      if (isBest && prevBest != null) sub.push(`new best (−${(prevBest - t).toFixed(2)} s)`);
      else if (!isBest) sub.push(`best ${fmt(prevBest)}`);
      const par = PAR(), record = RECORD();
      sub.push(t < par ? `par ${fmt(par)} beaten!` : `par ${fmt(par)}: ${(t - par).toFixed(2)} s to find`);
      w.banner(fmt(t), sub.join(' · '));
      objective();
      // rewards, staged so each gets its own banner (you are sent back to the paddock after the last one)
      let delay = 2.0;
      if (!w.store.get('boardEarned', false)) {
        w.store.set('boardEarned', true);
        const hadIt = w.has('hoverboard'); loaned = false;
        after(delay, () => {
          if (!hadIt) w.give('hoverboard'); else { w.sound('pickup'); w.banner('Hoverboard', 'It is yours. Press B to ride it in any world that allows boards.'); w.toast('The Hoverboard is yours to keep. Press B to ride.', 'item'); }
        });
        delay += 2.3;
      }
      if (t < par && !w.has('sigil-speed')) {
        after(delay, () => { w.give('sigil-speed'); w.setFlag('sigil.speed', true); w.burst([p.x, p.y + 6, p.z], { color: ['#ff4fd8', '#ffffff'], count: 90, speed: 10, life: 1.4 }); });
        delay += 2.3;
      } else if (t < par) w.setFlag('sigil.speed', true);
      if (t < record) echo3.reveal();
      if (t < record && !w.store.get('recordBeaten', false)) {
        w.store.set('recordBeaten', true);
        after(delay, () => { w.addCoins(25); w.sound('gem'); w.banner('TRACK RECORD', `Under ${fmt(record)}. Vex owes you 25 coins.`); });
        delay += 2.3;
      }
      finHold = Math.max(3.6, delay + 0.6);
      refreshBoard();
    };

    // ---------- the tick ----------
    let lastP = null;
    let wrongT = 0, warnedWrong = 0;
    w.on('tick', (dt) => {
      const p = w.player.pos;
      // scheduler
      for (let k = later.length - 1; k >= 0; k--) if (w.time >= later[k][0]) { const f = later[k][1]; later.splice(k, 1); f(); }

      // progress + a kill height that follows the track (fall off and you are back within a second)
      const [pi, pd] = nearest(p, prog, 50);
      prog = pd > 30 ? nearest(p, 0, 0)[0] : pi;

      if (state === 'countdown') {
        cdT += dt;
        const step = Math.floor(cdT);
        if (step !== cdStep) {
          cdStep = step;
          if (step < 3) { w.banner(String(3 - step), step === 0 ? 'Hold W at GO' : ''); w.sound('countdown'); }
          else { w.banner('GO!', ''); w.sound('go'); goRace(); }
        }
      } else if (state === 'racing') {
        tickN++;
        if (tickN % 6 === 1) ghostRec.push(Math.round(p[0] * 10), Math.round(p[1] * 10), Math.round(p[2] * 10), Math.round(w.player.yaw));
        if (lastP && !skipCross) {
          // gates, in order
          if (next < G) {
            if (crossed(gates[next], lastP, p)) {
              const g = gates[next], t = w.time - raceT0;
              splits.push(t);
              w.player.setCheckpoint([g.c.x, g.c.y + 1.0, g.c.z], g.yaw);
              g.arch.glow.emissiveIntensity = 0.25;
              const bs = bestSplits(), dlt = bs && bs[next] != null ? t - bs[next] : null;
              w.sound('checkpoint');
              w.toast(`Gate ${next + 1}/${G} · ${fmt(t)}${dlt == null ? '' : ` (${dlt <= 0 ? '−' : '+'}${Math.abs(dlt).toFixed(2)})`}`);
              next++; objective();
            } else {
              let missed = false;
              for (let k = next + 1; k < G; k++) if (crossed(gates[k], lastP, p)) missed = true;
              if (next > 0 && crossed(finish, lastP, p)) missed = true; // (with no gate yet, that is just the start)
              if (missed) { w.toast(`Missed gate ${next + 1}! Back you go.`, 'bad'); w.sound('error'); w.player.respawn(); }
            }
          } else if (crossed(finish, lastP, p)) finishRace();
          // wrong way?
          const v = w.player.vel, sp = w.player.speed;
          if (sp > 6 && (v[0] * F[prog].x + v[2] * F[prog].z) / sp < -0.6) wrongT += dt; else wrongT = 0;
          if (wrongT > 1.2 && w.time - warnedWrong > 4) { warnedWrong = w.time; w.banner('WRONG WAY', 'Turn around'); w.sound('error'); }
        }
        if (inPaddock(p) && p[0] < -12) abandon('Race abandoned. Step onto the grid to try again.');
      } else if (state === 'finished') {
        finT += dt;
        if (finT > finHold) endRace(true);
      }
      // kickers: launch off the lip like a real ramp (the controller would just roll you off it flat)
      if (lastP && !skipCross) for (const k of kickers) {
        if (crossed(k.gate, lastP, p) && p[1] - 0.9 < k.gate.c.y + 0.6 && w.player.speed > 4) {
          w.player.launch(Math.max(w.player.speed * Math.sin(k.ang * D) + 1, w.player.vel[1])); w.sound('jump');
        }
      }

      // kill height that follows the track (fall off and you are back within a second); after any teleport
      // above, re-find our place first so the old spot's height cannot trigger a phantom fall
      const pe = w.player.pos;
      if (Math.hypot(pe[0] - p[0], pe[1] - p[1], pe[2] - p[2]) > 3) resync();
      w.setKillY(inPaddock(pe) ? -8 : SY[prog] - 7);
      lastP = pe; skipCross = false;
    });

    // ---------- per frame: ghost, gate pulse, sun ----------
    w.on('frame', (dt, time) => {
      const pp = w.player.pos;
      sun.position.set(pp[0] + sunDir.x * 1150, pp[1] + sunDir.y * 1150, pp[2] + sunDir.z * 1150);
      sun.lookAt(pp[0], pp[1], pp[2]);
      sun.material.uniforms.t.value = time;
      if (state === 'racing' && next < G) gates[next].arch.glow.emissiveIntensity = 2.2 + Math.sin(time * 8) * 0.8;
      finishArch.glow.emissiveIntensity = state === 'racing' && next >= G ? 2.6 + Math.sin(time * 8) : 1.6;
      gridMat.emissiveIntensity = state === 'idle' ? 1.6 + Math.sin(time * 3.5) * 0.9 : 0.35;
      gridLabel.visible = state === 'idle';
      if (ghost && ghost.root.visible && ghostData) {
        const t = state === 'racing' ? w.time - raceT0 : 0;
        const g = ghostAt(t);
        const spd = ghostPrev ? Math.hypot(g.x - ghostPrev.x, g.z - ghostPrev.z) / Math.max(dt, 1e-3) : 0;
        ghost.root.position.set(g.x, g.y - 0.9, g.z); ghost.root.rotation.y = g.yaw;
        ghost.animate({ speed: spd, grounded: true, vy: 0, board: true, groundDist: 0 }, dt);
        ghost.blob.visible = false;
        ghostPrev = g;
        if (g.done && state === 'racing') ghost.root.visible = false;
      }
    });

    // ---------- events ----------
    w.zone({ pos: [0, 1.5, (GRID_Z[0] + GRID_Z[1]) / 2], size: [13, 4, GRID_Z[1] - GRID_Z[0]], onEnter: () => startCountdown() });
    w.on('enter', () => { state = 'idle'; resync(); objective(); refreshBoard(); });
    w.on('respawn', () => { resync(); skipCross = true; });
    w.on('fall', () => { if (state === 'racing') w.toast(next ? `Back to gate ${next}. The clock is still running!` : 'Back to the grid. The clock is still running!', 'bad'); });
    w.on('leave', () => { returnLoan(); });

    // debug/test hook (read-only data for tools; the world never reads it back)
    w.scene.userData.circuit = { L, N, SX, SZ, SY: Array.from(SY), SH, SS, gates: gates.map((g) => g.s), kickers: kickers.map((k) => ({ s: k.s, ang: k.ang })), grid: [gridF.c.x, gridF.c.y, gridF.c.z], get par() { return PAR(); }, get state() { return state; }, get next() { return next; }, get prog() { return prog; }, get ghost() { return ghost ? { visible: ghost.root.visible, pos: ghost.root.position.toArray().map((v) => +v.toFixed(1)) } : null; } };
  },
};
