// Deterministic Math for gameplay. Importing this module replaces the transcendental Math functions.
//
// ECMAScript leaves Math.sin, cos, tan, atan, atan2, asin, acos, exp and hypot
// "implementation-approximated", so V8 (Chrome), JavaScriptCore (Safari) and SpiderMonkey
// (Firefox) may disagree in the last bit. A replayed run must reproduce every tick bit for bit,
// and one differing bit in a collision can send a replay somewhere else entirely.
//
// Basic arithmetic (+ - * /), Math.sqrt, floor, round, abs, min and max are exactly specified
// in every engine. These ports of the FreeBSD msun (fdlibm) kernels use only those, so they
// give identical results everywhere, within about 1 ulp of the true value.
// Siegeworks measured native trig diverging in 9 of 600 replays across engines. With these
// kernels, all 600 matched in V8, JSC and SpiderMonkey.
//
// It must be imported before anything that computes gameplay values. main.js imports it first.

const DV = new DataView(new ArrayBuffer(8));
const hiWord = (x) => { DV.setFloat64(0, x); return DV.getUint32(0); };
const loWord = (x) => { DV.setFloat64(0, x); return DV.getUint32(4); };
const withLowZero = (x) => { DV.setFloat64(0, x); DV.setUint32(4, 0); return DV.getFloat64(0); };
const fromWords = (hi, lo) => { DV.setUint32(0, hi >>> 0); DV.setUint32(4, lo >>> 0); return DV.getFloat64(0); };

// ---- sin / cos / tan: kernels on [-pi/4, pi/4] (k_sin.c, k_cos.c, k_tan.c) ----
const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
  S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
  C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
function ksin(x, y, iy) {
  const z = x * x, w = z * z, r = S2 + z * (S3 + z * S4) + z * w * (S5 + z * S6), v = z * x;
  return iy === 0 ? x + v * (S1 + z * r) : x - ((z * (0.5 * y - v * r) - y) - v * S1);
}
function kcos(x, y) {
  const z = x * x, w = z * z, r = z * (C1 + z * (C2 + z * C3)) + w * w * (C4 + z * (C5 + z * C6));
  const hz = 0.5 * z, u = 1 - hz;
  return u + (((1 - u) - hz) + (z * r - x * y));
}
const T = [3.33333333333334091986e-01, 1.33333333333201242699e-01, 5.39682539762260521377e-02, 2.18694882948595424599e-02,
  8.86323982359930005737e-03, 3.59207910759131235356e-03, 1.45620945432529025516e-03, 5.88041240820264096874e-04,
  2.46463134818469906812e-04, 7.81794442939557092300e-05, 7.14072491382608190305e-05, -1.85586374855275456654e-05,
  2.59073051863633712884e-05];
const PIO4 = 7.85398163397448278999e-01, PIO4LO = 3.06161699786838301793e-17;
function ktan(x, y, iy) {
  const hx = hiWord(x) | 0, ix = hx & 0x7fffffff, big = ix >= 0x3fe59428; // |x| >= 0.6744
  if (big) { if (hx < 0) { x = -x; y = -y; } x = (PIO4 - x) + (PIO4LO - y); y = 0; }
  let z = x * x, w = z * z;
  let r = T[1] + w * (T[3] + w * (T[5] + w * (T[7] + w * (T[9] + w * T[11]))));
  let v = z * (T[2] + w * (T[4] + w * (T[6] + w * (T[8] + w * (T[10] + w * T[12])))));
  let s = z * x;
  r = y + z * (s * (r + v) + y);
  r += T[0] * s;
  w = x + r;
  if (big) { v = iy; return (hx < 0 ? -1 : 1) * (v - 2 * (x - (w * w / (w + v) - r))); }
  if (iy === 1) return w;
  // -1/(x+r) computed accurately
  z = withLowZero(w);
  v = r - (z - x);
  const a = -1 / w, t = withLowZero(a);
  s = 1 + t * z;
  return t + a * (s + t * v);
}
// Cody-Waite reduction by pi/2 in three pieces (e_rem_pio2.c medium path, every round taken).
// Exact for the angles a game uses; for huge |x| it loses accuracy but stays deterministic.
const INVPIO2 = 6.36619772367581382433e-01,
  PIO2_1 = 1.57079632673412561417e+00, PIO2_2 = 6.07710050630396597660e-11, PIO2_2T = 2.02226624879595063154e-21,
  PIO2_3 = 2.02226624871116645580e-21, PIO2_3T = 8.47842766036889956997e-32;
const TINY = 7.450580596923828125e-9; // 2^-27
let y0 = 0, y1 = 0;
function rem(x) {
  const fn = Math.round(x * INVPIO2);
  let r = x - fn * PIO2_1;
  let t = r, w = fn * PIO2_2;
  r = t - w; w = fn * PIO2_2T - ((t - r) - w);
  t = r; w = fn * PIO2_3;
  r = t - w; w = fn * PIO2_3T - ((t - r) - w);
  y0 = r - w; y1 = (r - y0) - w;
  return ((fn % 4) + 4) % 4;
}
export function sin(x) {
  x = +x;
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const ax = x < 0 ? -x : x;
  if (ax <= PIO4) return ax < TINY ? x : ksin(x, 0, 0);
  switch (rem(x)) {
    case 0: return ksin(y0, y1, 1);
    case 1: return kcos(y0, y1);
    case 2: return -ksin(y0, y1, 1);
    default: return -kcos(y0, y1);
  }
}
export function cos(x) {
  x = +x;
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const ax = x < 0 ? -x : x;
  if (ax <= PIO4) return ax < TINY ? 1 : kcos(x, 0);
  switch (rem(x)) {
    case 0: return kcos(y0, y1);
    case 1: return -ksin(y0, y1, 1);
    case 2: return -kcos(y0, y1);
    default: return ksin(y0, y1, 1);
  }
}
export function tan(x) {
  x = +x;
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const ax = x < 0 ? -x : x;
  if (ax <= PIO4) return ax < TINY ? x : ktan(x, 0, 1);
  const n = rem(x);
  return ktan(y0, y1, 1 - ((n & 1) << 1));
}

// ---- atan / atan2 (s_atan.c, e_atan2.c); high-word thresholds as exact value comparisons ----
const ATANHI = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const ATANLO = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
const AT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
  9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
  4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];
export function atan(x) {
  x = +x;
  if (x !== x) return NaN;
  const neg = x < 0 || Object.is(x, -0);
  let ax = neg ? -x : x;
  if (ax >= 73786976294838206464) return neg ? -(ATANHI[3] + ATANLO[3]) : ATANHI[3] + ATANLO[3]; // 2^66
  let id;
  if (ax < 0.4375) {
    if (ax < TINY) return x;
    id = -1; ax = x; // keep the sign; the polynomial is odd
  } else if (ax < 1.1875) {
    if (ax < 0.6875) { id = 0; ax = (2 * ax - 1) / (2 + ax); } else { id = 1; ax = (ax - 1) / (ax + 1); }
  } else if (ax < 2.4375) { id = 2; ax = (ax - 1.5) / (1 + 1.5 * ax); } else { id = 3; ax = -1 / ax; }
  const z = ax * ax, w = z * z;
  const s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10])))));
  const s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
  if (id < 0) return ax - ax * (s1 + s2);
  const r = ATANHI[id] - ((ax * (s1 + s2) - ATANLO[id]) - ax);
  return neg ? -r : r;
}
const PI = 3.1415926535897931160E+00, PI_O_2 = 1.5707963267948965580E+00, PI_O_4 = 7.8539816339744827900E-01, PI_LO = 1.2246467991473531772E-16;
export function atan2(y, x) {
  y = +y; x = +x;
  if (x !== x || y !== y) return NaN;
  if (x === 1) return atan(y);
  const sy = y < 0 || Object.is(y, -0), sx = x < 0 || Object.is(x, -0);
  const m = (sy ? 1 : 0) | (sx ? 2 : 0);
  if (y === 0) return m === 0 || m === 1 ? y : m === 2 ? PI : -PI;
  if (x === 0) return sy ? -PI_O_2 : PI_O_2;
  if (x === Infinity || x === -Infinity) {
    if (y === Infinity || y === -Infinity) return [PI_O_4, -PI_O_4, 3 * PI_O_4, -3 * PI_O_4][m];
    return [0, -0, PI, -PI][m];
  }
  if (y === Infinity || y === -Infinity) return sy ? -PI_O_2 : PI_O_2;
  const q = Math.abs(y / x);
  let z, mm = m;
  if (q > 1152921504606846976) { z = PI_O_2 + 0.5 * PI_LO; mm = m & 1; } // 2^60
  else if (sx && q < 8.673617379884035e-19) z = 0; // 2^-60
  else z = atan(q);
  switch (mm) {
    case 0: return z;
    case 1: return -z;
    case 2: return PI - (z - PI_LO);
    default: return (z - PI_LO) - PI;
  }
}

// ---- asin / acos (e_asin.c, e_acos.c) ----
const PIO2_HI = 1.57079632679489655800e+00, PIO2_LO = 6.12323399573676603587e-17, PIO4_HI = 7.85398163397448278999e-01;
const pS0 = 1.66666666666666657415e-01, pS1 = -3.25565818622400915405e-01, pS2 = 2.01212532134862925881e-01,
  pS3 = -4.00555345006794114027e-02, pS4 = 7.91534994289814532176e-04, pS5 = 3.47933107596021167570e-05,
  qS1 = -2.40339491173441421878e+00, qS2 = 2.02094576023350569471e+00, qS3 = -6.88283971605453293030e-01, qS4 = 7.70381505559019352791e-02;
const R = (t) => (t * (pS0 + t * (pS1 + t * (pS2 + t * (pS3 + t * (pS4 + t * pS5)))))) / (1 + t * (qS1 + t * (qS2 + t * (qS3 + t * qS4))));
export function asin(x) {
  x = +x;
  const hx = hiWord(x) | 0, ix = hx & 0x7fffffff;
  if (ix >= 0x3ff00000) { // |x| >= 1
    if (((ix - 0x3ff00000) | loWord(x)) === 0) return x * PIO2_HI + x * PIO2_LO;
    return NaN;
  }
  if (ix < 0x3fe00000) { // |x| < 0.5
    if (ix < 0x3e500000) return x; // |x| < 2^-26
    return x + x * R(x * x);
  }
  const w = 1 - Math.abs(x), t = w * 0.5, s = Math.sqrt(t);
  let r;
  if (ix >= 0x3fef3333) r = PIO2_HI - (2 * (s + s * R(t)) - PIO2_LO); // |x| > 0.975
  else {
    const f = withLowZero(s), c = (t - f * f) / (s + f);
    const p = 2 * s * R(t) - (PIO2_LO - 2 * c), q = PIO4_HI - 2 * f;
    r = PIO4_HI - (p - q);
  }
  return hx > 0 ? r : -r;
}
export function acos(x) {
  x = +x;
  const hx = hiWord(x) | 0, ix = hx & 0x7fffffff;
  if (ix >= 0x3ff00000) {
    if (((ix - 0x3ff00000) | loWord(x)) === 0) return hx > 0 ? 0 : PI + 2 * PIO2_LO;
    return NaN;
  }
  if (ix < 0x3fe00000) { // |x| < 0.5
    if (ix <= 0x3c600000) return PIO2_HI + PIO2_LO;
    return PIO2_HI - (x - (PIO2_LO - x * R(x * x)));
  }
  if (hx < 0) { // x < -0.5
    const z = (1 + x) * 0.5, s = Math.sqrt(z), w = R(z) * s - PIO2_LO;
    return PI - 2 * (s + w);
  }
  const z = (1 - x) * 0.5, s = Math.sqrt(z), df = withLowZero(s), c = (z - df * df) / (s + df);
  return 2 * (df + (R(z) * s + c));
}

// ---- exp (e_exp.c) ----
const LN2HI = 6.93147180369123816490e-01, LN2LO = 1.90821492927058770002e-10, INVLN2 = 1.44269504088896338700e+00;
const P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03, P3 = 6.61375632143793436117e-05,
  P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08;
const TWOM1000 = 9.33263618503218878990e-302, TWO1023 = 8.98846567431157953865e+307;
export function exp(x) {
  x = +x;
  if (x !== x) return NaN;
  const hx0 = hiWord(x), neg = hx0 >>> 31 === 1, hx = hx0 & 0x7fffffff;
  if (hx >= 0x40862e42) { // |x| >= 709.78
    if (x === Infinity) return Infinity;
    if (x === -Infinity) return 0;
    if (x > 7.09782712893383973096e+02) return Infinity;
    if (x < -7.45133219101941108420e+02) return 0;
  }
  let hi = 0, lo = 0, k = 0;
  if (hx > 0x3fd62e42) { // |x| > 0.5 ln2
    if (hx < 0x3ff0a2b2) { // and < 1.5 ln2
      if (neg) { hi = x + LN2HI; lo = -LN2LO; k = -1; } else { hi = x - LN2HI; lo = LN2LO; k = 1; }
    } else {
      k = Math.trunc(INVLN2 * x + (neg ? -0.5 : 0.5));
      hi = x - k * LN2HI; lo = k * LN2LO;
    }
    x = hi - lo;
  } else if (hx < 0x3e300000) return 1 + x; // |x| < 2^-28
  const t = x * x;
  const c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1 - ((x * c) / (c - 2) - x);
  const y = 1 - ((lo - (x * c) / (2 - c)) - hi);
  if (k >= -1021) {
    if (k === 1024) return y * 2 * TWO1023;
    return y * fromWords((0x3ff + k) << 20, 0);
  }
  return y * fromWords((0x3ff + k + 1000) << 20, 0) * TWOM1000;
}

// ---- hypot: plain sum of squares (exact operations), scaled only when it would overflow or underflow ----
export function hypot() {
  const n = arguments.length;
  let s = 0, inf = false, nan = false, max = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(+arguments[i]);
    if (a === Infinity) inf = true; else if (a !== a) nan = true; else { s += a * a; if (a > max) max = a; }
  }
  if (inf) return Infinity;
  if (nan) return NaN;
  if (s === Infinity || (s < 1e-290 && max > 0)) {
    let t = 0;
    for (let i = 0; i < n; i++) { const r = Math.abs(+arguments[i]) / max; t += r * r; }
    return max * Math.sqrt(t);
  }
  return Math.sqrt(s);
}

export const native = { sin: Math.sin, cos: Math.cos, tan: Math.tan, atan: Math.atan, atan2: Math.atan2, asin: Math.asin, acos: Math.acos, exp: Math.exp, hypot: Math.hypot };
// (re-runnable: a validator can hold several archived engines, and each replay installs its own engine's copy)
export function install() {
  if (Math.sin === sin && Math.cos === cos && Math.exp === exp && Math.hypot === hypot) return;
  Object.assign(Math, { sin, cos, tan, atan, atan2, asin, acos, exp, hypot });
  if (!('__det' in Math)) Object.defineProperty(Math, '__det', { value: true, configurable: true });
}
install();
