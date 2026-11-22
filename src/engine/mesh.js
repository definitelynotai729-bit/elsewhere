// Uploaded models. Any .stl or .glb becomes one canonical compact mesh (format elsewhere-mesh/1), and the SHA-256
// of those bytes is the model's name. A model is presentation: levels show it, and gameplay only ever uses the
// small collision hull a level carries as data (computed here at import, then checked by checkLevel like any
// other number). So a replay never needs the model's bytes.
//
// Canonical bytes (little-endian):
//   'EWM1' · u32 vertices · u32 triangles · u32 flags (1 = vertex colours) · f32×3 min · f32×3 max
//   · u16×3 per vertex (each position quantised within [min, max])
//   · indices: u16 when there are at most 65,536 vertices, else u32 (3 per triangle)
//   · when coloured: u8×3 per vertex (sRGB)
// Imports are normalised first: centred on x and z, resting on y = 0, largest side 1 m. A level gives the size.
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';

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

// ---- import: .stl or .glb -> canonical bytes, its hash, and its hull ----
async function readGLB(buf) {
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(buf, '');
  gltf.scene.updateMatrixWorld(true);
  const pos = [], col = [], idx = [];
  let colored = false;
  gltf.scene.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.position && o.geometry.attributes.color) colored = true; });
  gltf.scene.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const g = o.geometry, P = g.attributes.position, C = g.attributes.color, base = pos.length / 3, v = new THREE.Vector3();
    const mc = new THREE.Color(o.material && o.material.color ? o.material.color : 0xdddddd);
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); pos.push(v.x, v.y, v.z);
      if (colored) { const c = C ? new THREE.Color(C.getX(i), C.getY(i), C.getZ(i)) : mc; col.push(c.r, c.g, c.b); }
    }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    else for (let i = 0; i < P.count; i++) idx.push(base + i);
  });
  return { pos, col: colored ? col : null, idx };
}
function readSTL(buf) {
  const g = new STLLoader().parse(buf); // non-indexed; binary STL may carry per-face colours
  const P = g.attributes.position, C = g.attributes.color, pos = [], col = C ? [] : null, idx = [];
  // STL is usually Z-up (3D printing): turn it Y-up
  for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getZ(i), -P.getY(i)); idx.push(i); if (C) col.push(C.getX(i), C.getY(i), C.getZ(i)); }
  return { pos, col, idx };
}
// identical corners become one vertex (STL lists every triangle's corners separately)
function weld(pos, col, idx) {
  const key = new Map(), P = [], Cc = col ? [] : null, remap = new Int32Array(pos.length / 3);
  let span = 0; for (let i = 0; i < pos.length; i++) span = Math.max(span, Math.abs(pos[i]));
  const q = (v) => Math.round(v / (span || 1) * 1e6);
  for (let i = 0; i < pos.length / 3; i++) {
    let k = q(pos[i * 3]) + ',' + q(pos[i * 3 + 1]) + ',' + q(pos[i * 3 + 2]);
    if (col) k += ',' + Math.round(col[i * 3] * 255) + ',' + Math.round(col[i * 3 + 1] * 255) + ',' + Math.round(col[i * 3 + 2] * 255);
    let j = key.get(k);
    if (j == null) { j = P.length / 3; key.set(k, j); P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); if (col) Cc.push(col[i * 3], col[i * 3 + 1], col[i * 3 + 2]); }
    remap[i] = j;
  }
  const I = [];
  for (let t = 0; t < idx.length; t += 3) { const a = remap[idx[t]], b = remap[idx[t + 1]], c = remap[idx[t + 2]]; if (a !== b && b !== c && a !== c) I.push(a, b, c); } // drop degenerate triangles
  return { pos: P, col: Cc, idx: I };
}
export async function importModel(buf, filename = 'model') {
  if (!(buf instanceof ArrayBuffer) || buf.byteLength > MESH_LIMITS.source) throw new Error('the file is too large (64 MB at most)');
  const name = String(filename).replace(/\.[a-z0-9]+$/i, '').replace(/[^\w .-]+/g, ' ').trim().slice(0, 24) || 'Model';
  const head = new Uint8Array(buf, 0, Math.min(4, buf.byteLength));
  const glb = head[0] === 0x67 && head[1] === 0x6c && head[2] === 0x54 && head[3] === 0x46; // 'glTF'
  let m = glb ? await readGLB(buf) : readSTL(buf);
  if (!m.idx.length) throw new Error('no triangles in that file');
  m = weld(m.pos, m.col, m.idx);
  if (!m.idx.length) throw new Error('no usable triangles in that file');
  // normalise: centred on x and z, resting on y = 0, largest side 1
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m.pos.length; i++) { const a = i % 3; lo[a] = Math.min(lo[a], m.pos[i]); hi[a] = Math.max(hi[a], m.pos[i]); }
  const side = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1, c = [(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2];
  let positions = new Float32Array(m.pos.length);
  for (let i = 0; i < m.pos.length; i++) positions[i] = (m.pos[i] - c[i % 3]) / side;
  let indices = new Uint32Array(m.idx), colors = m.col ? Float32Array.from(m.col) : null;
  const sourceTriangles = indices.length / 3;
  // too detailed: simplify (meshoptimizer), relaxing the allowed error until it fits
  if (sourceTriangles > MESH_LIMITS.triangles) {
    await MeshoptSimplifier.ready;
    let out = null;
    for (const err of [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4]) {
      const [r] = MeshoptSimplifier.simplify(indices, positions, 3, MESH_LIMITS.triangles * 3, err, ['Prune']);
      out = r;
      if (r.length / 3 <= MESH_LIMITS.triangles) break;
    }
    if (out.length / 3 > MESH_LIMITS.triangles) throw new Error(`could not simplify it below ${MESH_LIMITS.triangles} triangles`);
    const [remap, unique] = MeshoptSimplifier.compactMesh(out);
    const np = new Float32Array(unique * 3), nc = colors ? new Float32Array(unique * 3) : null;
    for (let v = 0; v < remap.length; v++) { const t = remap[v]; if (t === 0xffffffff) continue; np.set(positions.subarray(v * 3, v * 3 + 3), t * 3); if (nc) nc.set(colors.subarray(v * 3, v * 3 + 3), t * 3); }
    positions = np; colors = nc; indices = out;
  }
  const c8 = colors ? Uint8Array.from(colors, (v) => Math.round(Math.min(1, Math.max(0, v)) * 255)) : null;
  const bytes = encodeMesh(positions, indices, c8);
  if (bytes.length > MESH_LIMITS.bytes) throw new Error(`the model is still ${Math.round(bytes.length / 1000)} KB after simplifying (300 KB at most)`);
  const decoded = decodeMesh(bytes); // the hull comes from exactly what everyone will load
  return { name, bytes, sha256: await sha256bytes(bytes), triangles: decoded.triangles, vertices: decoded.vertices, sourceTriangles, colored: !!c8, hull: hullPoints(decoded.positions) };
}
