// Uploaded models. Any .stl or .glb becomes one canonical compact mesh (format elsewhere-mesh/1), and the SHA-256
// of those bytes is the model's name. A model is presentation: levels show it, and gameplay only ever uses the
// small collision hull a level carries as data (computed at import by hullPoints, then checked by checkLevel like
// any other number). So a replay never needs the model's bytes.
//
// Canonical bytes (little-endian):
//   'EWM1' · u32 vertices · u32 triangles · u32 flags (1 = vertex colours) · f32×3 min · f32×3 max
//   · u16×3 per vertex (each position quantised within [min, max])
//   · indices: u16 when there are at most 65,536 vertices, else u32 (3 per triangle)
//   · when coloured: u8×3 per vertex (sRGB)
// Imports are normalised first: centred on x and z, resting on y = 0, largest side 1 m. A level gives the size.
// Reading .stl and .glb files is in model_import.js, which only the Builder loads.
import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const MESH_LIMITS = { triangles: 20000, bytes: 300000, hull: 48, source: 64 * 1024 * 1024 };
const MAGIC = 0x314d5745; // 'EWM1'
const HEAD = 40;

export async function sha256bytes(bytes) {
  const h = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---- the canonical format ----
export function encodeMesh(positions, indices, colors) {
  const nv = positions.length / 3, nt = indices.length / 3, wide = nv > 65536;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < nv; i++) for (let a = 0; a < 3; a++) { const v = positions[i * 3 + a]; if (v < min[a]) min[a] = v; if (v > max[a]) max[a] = v; }
  for (let a = 0; a < 3; a++) { min[a] = Math.fround(min[a]); max[a] = Math.fround(max[a]); if (max[a] <= min[a]) max[a] = Math.fround(min[a] + 1e-4); }
  const size = HEAD + nv * 6 + nt * 3 * (wide ? 4 : 2) + (colors ? nv * 3 : 0);
  const buf = new ArrayBuffer(size + ((4 - (size % 4)) % 4)), dv = new DataView(buf);
  dv.setUint32(0, MAGIC, true); dv.setUint32(4, nv, true); dv.setUint32(8, nt, true); dv.setUint32(12, colors ? 1 : 0, true);
  for (let a = 0; a < 3; a++) { dv.setFloat32(16 + a * 4, min[a], true); dv.setFloat32(28 + a * 4, max[a], true); }
  let o = HEAD;
  for (let i = 0; i < nv; i++) for (let a = 0; a < 3; a++, o += 2) dv.setUint16(o, Math.round(((positions[i * 3 + a] - min[a]) / (max[a] - min[a])) * 65535), true);
  for (let i = 0; i < nt * 3; i++, o += wide ? 4 : 2) wide ? dv.setUint32(o, indices[i], true) : dv.setUint16(o, indices[i], true);
  if (colors) for (let i = 0; i < nv * 3; i++, o++) dv.setUint8(o, colors[i]);
  return new Uint8Array(buf, 0, size);
}
// bytes -> { positions, indices, colors, min, max, vertices, triangles }, or throws (untrusted input)
export function decodeMesh(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < HEAD || bytes.length > MESH_LIMITS.bytes) throw new Error('not a model of the allowed size');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (dv.getUint32(0, true) !== MAGIC) throw new Error('not an Elsewhere model');
  const nv = dv.getUint32(4, true), nt = dv.getUint32(8, true), flags = dv.getUint32(12, true);
  if (!nv || !nt || nt > MESH_LIMITS.triangles || nv > nt * 3 || (flags & ~1)) throw new Error('bad model header');
  const wide = nv > 65536, colored = (flags & 1) === 1;
  if (bytes.length !== HEAD + nv * 6 + nt * 3 * (wide ? 4 : 2) + (colored ? nv * 3 : 0)) throw new Error('model size does not match its header');
  const min = [0, 1, 2].map((a) => dv.getFloat32(16 + a * 4, true)), max = [0, 1, 2].map((a) => dv.getFloat32(28 + a * 4, true));
  if (![...min, ...max].every(Number.isFinite) || min.some((v, a) => !(max[a] > v))) throw new Error('bad model bounds');
  const positions = new Float32Array(nv * 3);
  let o = HEAD;
  for (let i = 0; i < nv; i++) for (let a = 0; a < 3; a++, o += 2) positions[i * 3 + a] = min[a] + (dv.getUint16(o, true) / 65535) * (max[a] - min[a]);
  const indices = wide ? new Uint32Array(nt * 3) : new Uint16Array(nt * 3);
  for (let i = 0; i < nt * 3; i++, o += wide ? 4 : 2) { const v = wide ? dv.getUint32(o, true) : dv.getUint16(o, true); if (v >= nv) throw new Error('model index out of range'); indices[i] = v; }
  const colors = colored ? bytes.slice(o, o + nv * 3) : null;
  return { positions, indices, colors, min, max, vertices: nv, triangles: nt };
}
// a renderable geometry: normals smoothed across gentle angles, hard edges kept (CAD parts and sculpts both look right)
export function meshGeometry(m) {
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
  if (m.colors) g.setAttribute('color', new THREE.BufferAttribute(m.colors, 3, true));
  g.setIndex(new THREE.BufferAttribute(m.indices, 1));
  g = toCreasedNormals(g, 35 * Math.PI / 180);
  g.computeBoundingSphere();
  return g;
}

// ---- the collision hull: up to 48 points, the extremes along fixed directions (2 decimals, as levels store them) ----
const DIRS = (() => { const d = [], n = 64, ga = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < n; i++) { const y = 1 - (i + 0.5) * 2 / n, r = Math.sqrt(1 - y * y); d.push([Math.cos(i * ga) * r, y, Math.sin(i * ga) * r]); } return d; })();
export function hullPoints(positions) {
  const out = [], seen = new Set();
  for (const [dx, dy, dz] of DIRS) {
    let best = -1, bd = -Infinity;
    for (let i = 0; i < positions.length; i += 3) { const d = positions[i] * dx + positions[i + 1] * dy + positions[i + 2] * dz; if (d > bd) { bd = d; best = i; } }
    const p = [positions[best], positions[best + 1], positions[best + 2]].map((v) => Math.round(v * 100) / 100 || 0);
    const k = p.join(',');
    if (!seen.has(k)) { seen.add(k); out.push(p); }
    if (out.length >= MESH_LIMITS.hull) break;
  }
  return out;
}
