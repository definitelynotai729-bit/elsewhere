// What a world leaves on the GPU after its own dispose() (world.js), freed here.
//
// Found 2026-11-25 on the phone pass (.scratch/leak_check.py tours every world twice): every visit left its signs
// behind. Each w.sign board has its own material and a texture drawn from a canvas (about 1.3 MB on the GPU with its
// mipmaps), and world.dispose() frees only geometry, label sprites and shader materials. A session of world-hopping
// grew without end: about 22 textures per tour of the worlds. world.js is in the pinned engine, so the rest is freed
// here, in client code, after the world's dispose():
//   - every material of the world's objects that nothing else uses: not one of the shared materials (render.js mat()
//     keeps one per colour for every world), and not on anything still in the scene;
//   - with it, every texture of those materials that was drawn from a canvas (signs, pictures, drawings) and that no
//     material still in use shows.
// Textures loaded from files (models) are left alone: caches share them between worlds.
// three.js uploads a freed material or texture again if it is ever drawn again, so a mistake here would cost a
// moment's re-upload, never a missing picture.
const MAPS = ['map', 'alphaMap', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap', 'lightMap', 'specularMap'];
const texturesOf = (m) => {
  const out = [];
  for (const k of MAPS) if (m[k] && m[k].isTexture) out.push(m[k]);
  if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u && u.value && u.value.isTexture) out.push(u.value);
  return out;
};
const materialsOf = (o) => (o.material ? [].concat(o.material) : []);

// group: the world's group (already out of the scene); shared: the materials every world uses (render.js
// allMaterials()); scene: what is still drawn. Returns what it freed.
export function freeWorld(group, { shared = [], scene = null } = {}) {
  const keep = new Set(shared), keepTex = new Set();
  if (scene) scene.traverse((o) => { for (const m of materialsOf(o)) keep.add(m); });
  for (const m of keep) for (const t of texturesOf(m)) keepTex.add(t);
  const mats = new Set();
  group.traverse((o) => { for (const m of materialsOf(o)) if (!keep.has(m)) mats.add(m); });
  const texs = new Set();
  for (const m of mats) for (const t of texturesOf(m)) if (t.isCanvasTexture && !keepTex.has(t)) texs.add(t);
  for (const t of texs) t.dispose();
  for (const m of mats) m.dispose();
  return { materials: mats.size, textures: texs.size };
}
