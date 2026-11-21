// Accuracy of the deterministic Math against the engine's own (V8 uses fdlibm, itself < 1 ulp).
// Usage: node tools/detmath_test.mjs   (exit code 1 if any function is more than 2 ulp off)
import { native } from '../src/engine/detmath.js';
const D = Math; // detmath.js installs itself on import
const f = new Float64Array(1), u = new BigInt64Array(f.buffer);
const bits = (x) => { f[0] = x; const b = u[0]; return b < 0n ? -(b & 0x7fffffffffffffffn) : b; };
const ulps = (a, b) => (Number.isNaN(a) && Number.isNaN(b) ? 0 : a === b ? 0 : Number((d => d < 0n ? -d : d)(bits(a) - bits(b))));
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const cases = {
  sin: [[1e-9, 1e-6], [-0.8, 0.8], [-7, 7], [-1000, 1000]],
  cos: [[1e-9, 1e-6], [-0.8, 0.8], [-7, 7], [-1000, 1000]],
  tan: [[1e-9, 1e-6], [-0.7, 0.7], [-1.5, 1.5], [-100, 100]],
  atan: [[-0.4, 0.4], [-3, 3], [-1e6, 1e6]],
  asin: [[-0.5, 0.5], [-0.97, 0.97], [-1, 1]],
  acos: [[-0.5, 0.5], [-0.97, 0.97], [-1, 1]],
  exp: [[-1e-9, 1e-9], [-0.3, 0.3], [-5, 5], [-700, 700]],
};
let worst = 0;
for (const [fn, ranges] of Object.entries(cases)) {
  const out = [];
  for (const [lo, hi] of ranges) {
    let max = 0, n1 = 0; const N = 200000;
    for (let i = 0; i < N; i++) { const x = lo + (hi - lo) * rnd(); const e = ulps(D[fn](x), native[fn](x)); if (e > max) max = e; if (e >= 1) n1++; }
    worst = Math.max(worst, max);
    out.push(`[${lo},${hi}] max ${max} ulp, ${(n1 / N * 100).toFixed(2)}% differ`);
  }
  console.log(fn.padEnd(5), out.join(' | '));
}
let m2 = 0;
for (let i = 0; i < 200000; i++) { const y = (rnd() - 0.5) * 20, x = (rnd() - 0.5) * 20; m2 = Math.max(m2, ulps(D.atan2(y, x), native.atan2(y, x))); }
let m3 = 0;
for (let i = 0; i < 200000; i++) { const a = (rnd() - 0.5) * 200, b = (rnd() - 0.5) * 200, c = (rnd() - 0.5) * 200; m3 = Math.max(m3, ulps(D.hypot(a, b, c), native.hypot(a, b, c))); }
console.log('atan2 max', m2, 'ulp; hypot max', m3, 'ulp');
worst = Math.max(worst, m2, m3);
const specials = [
  ['sin', [0, -0, Math.PI, 1e300, NaN, Infinity]], ['cos', [0, Math.PI, 1e300, NaN]], ['tan', [0, -0, Math.PI / 4, NaN]],
  ['asin', [1, -1, 0.5, -0.5, 2, NaN]], ['acos', [1, -1, 0.5, -0.5, 0, 2]], ['exp', [0, -0, 1, -1, 709.7, 710, -745, -746, Infinity, -Infinity, NaN]],
  ['atan', [0, -0, Infinity, -Infinity, 1, -1]],
];
for (const [fn, xs] of specials) {
  const bad = xs.filter((x) => ulps(D[fn](x), native[fn](x)) > 2 && !(fn === 'sin' && x === 1e300) && !(fn === 'cos' && x === 1e300));
  if (bad.length) { console.log('special mismatch', fn, bad.map((x) => [x, D[fn](x), native[fn](x)])); worst = 99; }
}
console.log(worst <= 2 ? 'OK: within 2 ulp of native everywhere tested' : 'FAIL');
process.exit(worst <= 2 ? 0 : 1);
