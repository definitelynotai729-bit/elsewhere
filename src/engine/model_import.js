// Importing a model: an .stl or .glb file becomes the canonical mesh (mesh.js), its SHA-256 and its collision hull.
// Only the Builder imports models, so this file (with the simplifier, meshoptimizer) loads with the Builder.
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';
import { MESH_LIMITS, sha256bytes, encodeMesh, decodeMesh, hullPoints } from './mesh.js';

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
