// Runs: recording, the proof format, and the state hash a replay must reproduce.
//
// A proof of play is a self-contained JSON object:
//   format, sim          which rules it was played under: the SHA-256 of the archived engine it was played on
//                        (docs/engines/by-hash; tools/engines.mjs). Proofs from before engines were pinned say
//                        "sim-1", which history.json maps to the first archived engine. SIM below is only the
//                        tag inside state hashes, and never changes.
//   world, registry      the world module and every registered world, pinned by SHA-256
//   from, entry          where the player came from and their state on arrival (coins, items, flags, save)
//   ticks, input         one quantised input frame per 1/60 s tick (run-length coded, base64)
//   events               actions applied at the end of a tick: dialog answers, purchases, equips, arcade results
//   claims               what the run produced: items, coins, flags, records, the exit, each with its tick
//   state                SHA-256 of the full game state after the last tick
//   player, sig          who played it, and an Ed25519 signature over everything above
// Anyone holding the pinned modules can replay it (tools/verify.mjs, or the Verify button in the game)
// and check that the same inputs give the same claims and the same final state, bit for bit.
import { sha256hex } from './util.js';

export const SIM = 'sim-1';
export const FORMAT = 'elsewhere-run/1';
export const MAX_TICKS = 60 * 60 * 30; // 30 minutes per world visit
const TAU = Math.PI * 2, YAW_Q = 65536, YAW_STEP = TAU / YAW_Q;

// ---- input frames ----
// q = [mx, my as -127..127, yaw as 0..65535, bits: 1 jump pressed, 2 jump held, 4 board pressed, 8 use pressed,
//      16/32/64 abilities 1-3 (Q/E/R), 128 ability 4 (dash), 256 ability 5 (recall); worlds read them with w.input]
export function frameFromCodes(qx, qy, qa, bits) {
  qx |= 0; qy |= 0; qa = (qa | 0) & 0xffff; bits &= 0x3ff; // integers only, never -0
  return { mx: qx / 127, my: qy / 127, yaw: qa * YAW_STEP, jump: (bits & 1) !== 0, held: (bits & 2) !== 0, board: (bits & 4) !== 0, use: (bits & 8) !== 0, bits, q: [qx, qy, qa, bits] };
}
const q127 = (v) => { const x = Math.round((v < -1 ? -1 : v > 1 ? 1 : v) * 127); return x | 0; };
export function quantYaw(yaw) { let a = yaw % TAU; if (a < 0) a += TAU; return Math.round(a / YAW_STEP) % YAW_Q | 0; }
// Live capture. mv is the move vector (walking or board steering); basisYaw is the direction walking is
// relative to (the character's heading for keys, the camera for sticks). It only matters while walking, so it is
// held (not re-sampled) while standing still or riding a board. That keeps logs small and changes nothing.
export function captureFrame(input, mv, basisYaw, prevQa, hold) {
  const qx = q127(mv.x), qy = q127(mv.y), camYaw = basisYaw;
  const qa = hold || (qx === 0 && qy === 0) ? prevQa : quantYaw(camYaw);
  return frameFromCodes(qx, qy, qa, input.frameBits());
}

export class RunLog {
  constructor() { this.n = 0; this.cap = 4096; this.alloc(); this.events = []; this.full = false; }
  alloc() {
    const grow = (A, old) => { const a = new A(this.cap); if (old) a.set(old.subarray(0, this.n)); return a; };
    this.qx = grow(Int8Array, this.qx); this.qy = grow(Int8Array, this.qy); this.qa = grow(Uint16Array, this.qa); this.bits = grow(Uint16Array, this.bits);
  }
  push(f) {
    if (this.n >= MAX_TICKS) { this.full = true; return; }
    if (this.n >= this.cap) { this.cap *= 2; this.alloc(); }
    const q = f.q, i = this.n++;
    this.qx[i] = q[0]; this.qy[i] = q[1]; this.qa[i] = q[2]; this.bits[i] = q[3];
  }
  event(t, a) { this.events.push([t].concat(JSON.parse(JSON.stringify(a)))); }
}

// ---- input coding: four columns, each as (zigzag varint value, varint run length) pairs ----
const zz = (v) => (v << 1) ^ (v >> 31);
const unzz = (u) => (u >>> 1) ^ -(u & 1);
function putVar(out, u) { u >>>= 0; while (u >= 0x80) { out.push((u & 0x7f) | 0x80); u >>>= 7; } out.push(u); }
function getVar(b, pos) { let u = 0, s = 0, x; do { x = b[pos.i++]; if (x === undefined) throw new Error('input data is truncated'); u |= (x & 0x7f) << s; s += 7; } while (x & 0x80 && s < 35); return u >>> 0; }
export function encodeInput(log, n = log.n) {
  const out = [0x45, 0x31]; // "E1"
  putVar(out, n);
  const cols = [(i) => log.qx[i], (i) => log.qy[i], (i) => { const d = log.qa[i] - (i ? log.qa[i - 1] : 0); return d > 32767 ? d - 65536 : d < -32768 ? d + 65536 : d; }, (i) => log.bits[i]];
  for (const col of cols) {
    let i = 0;
    while (i < n) {
      const v = col(i); let r = 1;
      while (i + r < n && col(i + r) === v) r++;
      putVar(out, zz(v)); putVar(out, r); i += r;
    }
  }
  return b64(Uint8Array.from(out));
}
export function decodeInput(str) {
  const b = unb64(str), pos = { i: 0 };
  if (b[0] !== 0x45 || b[1] !== 0x31) throw new Error('not an Elsewhere input log');
  pos.i = 2;
  const n = getVar(b, pos);
  if (n > MAX_TICKS) throw new Error('input log is too long');
  const cols = [new Int8Array(n), new Int8Array(n), new Int32Array(n), new Uint16Array(n)];
  for (const c of cols) {
    let i = 0;
    while (i < n) { const v = unzz(getVar(b, pos)), r = getVar(b, pos); if (r < 1 || i + r > n) throw new Error('input runs do not add up'); c.fill(v, i, i + r); i += r; }
  }
  const qa = new Uint16Array(n);
  let a = 0;
  for (let i = 0; i < n; i++) { a = (a + cols[2][i]) & 0xffff; qa[i] = a; }
  return { n, qx: cols[0], qy: cols[1], qa, bits: cols[3] };
}

// ---- canonical JSON (sorted keys) so the same state always hashes the same ----
export function canon(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return isFinite(v) ? JSON.stringify(v) : 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
// Everything a run can change. Taken synchronously at the end of the run, hashed afterwards.
export function stateString(E) {
  const d = E.profile.data, p = E.player, rt = E.world;
  return canon({
    sim: SIM, world: rt.id, tick: E.sim.tick, coins: d.coins, inv: d.inv, eq: d.eq, flags: d.flags, save: d.worlds[rt.id] || null,
    player: [p.pos.x, p.pos.y, p.pos.z, p.vel.x, p.vel.y, p.vel.z, p.yaw, p.heading, p.boardSpeed, p.board, p.grounded],
    things: rt.dynamics.map((x) => { const t = x.body.translation(); return [t.x, t.y, t.z]; }),
    // worlds with enemies: every foe, and the player's hearts (absent elsewhere, so other worlds hash as before)
    foes: rt.foes && rt.foes.length ? rt.foes.map((f) => [f.x, f.y, f.z, f.hp, f.state, f.t]) : undefined,
    hearts: rt.foes && rt.foes.length ? [p.hearts, p.maxHearts, p.hurtT] : undefined,
  });
}
export const snapshotEntry = (data, worldId) => JSON.parse(JSON.stringify({ coins: data.coins, inv: data.inv, eq: data.eq, flags: data.flags, save: data.worlds[worldId] || null }));

// What a run earned, in words (for the records list and the verifier's report).
export function summarize(claims) {
  const out = { records: [], items: [], coins: 0, flags: [], exit: null };
  for (const c of claims || []) {
    if (c[1] === 'record') out.records.push({ key: c[2], value: c[3], better: c[4], tick: c[0] });
    else if (c[1] === 'give') out.items.push(c[2]);
    else if (c[1] === 'coins') out.coins += c[2];
    else if (c[1] === 'flag') out.flags.push(c[2]);
    else if (c[1] === 'travel') out.exit = c[2];
  }
  return out;
}
export const worthKeeping = (claims) => (claims || []).some((c) => ['record', 'give', 'coins', 'flag', 'take'].includes(c[1]));

// The signed part of a proof: every field except the signature, canonically ordered.
export const signedText = (proof) => canon(Object.assign({}, proof, { sig: undefined }));
export async function proofId(proof) { return (await sha256hex(signedText(proof))).slice(0, 16); }

// ---- base64 (browser and Node) ----
export function b64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export function unb64(str) {
  if (typeof str !== 'string' || !/^[A-Za-z0-9+/=\s]*$/.test(str)) throw new Error('not base64');
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(str, 'base64'));
  const s = atob(str.replace(/\s+/g, '')), b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}
