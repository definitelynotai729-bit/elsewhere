// Scenery assets: 3D models (.glb), photographed skies (.hdr) and PBR texture sets (.jpg) from docs/assets, each
// pinned by SHA-256 in docs/assets/manifest.json and checked before use. A model or texture loads once and every
// placement shares it.
// Assets are scenery: world code never reads them back, so they cannot change gameplay, and a replay
// (which has no screen) never loads them.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export function createAssets(renderer) {
  let manifest = { models: {}, hdris: {}, textures: {} };
  let ready = null;
  const models = new Map(), skies = new Map(), sets = new Map();
  const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
  const rgbe = new RGBELoader();
  const pmrem = renderer ? new THREE.PMREMGenerator(renderer) : null;
  const aniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
  const anisoMax = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
  let hiRes = false; // the ultra preset: texture sets at 1024 px (maps_hi) and full anisotropic filtering
  async function load(entry) {
    const res = await fetch(entry.file, { cache: 'force-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    if (hex(await crypto.subtle.digest('SHA-256', buf)) !== entry.sha256) throw new Error('asset does not match its pinned hash');
    return buf;
  }
  // ---- textures ----
  // A texture starts as a 1x1 stand-in (the set's average colour, a flat normal, its average roughness) and gets its
  // image when the file arrives. Materials therefore compile once, every copy of a material shares the same textures,
  // and a part looks the same, flat, until then.
  const texture = (img, srgb) => {
    const t = new THREE.Texture(img);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  const pixel = (r, g, b) => new ImageData(new Uint8ClampedArray([r, g, b, 255]), 1, 1);
  async function image(entry) {
    const url = URL.createObjectURL(new Blob([await load(entry)], { type: 'image/jpeg' }));
    try { const img = new Image(); img.src = url; await img.decode(); return img; } finally { URL.revokeObjectURL(url); }
  }
  // fill a set's textures with images: its 512 px maps, or (ultra) its 1024 px maps_hi
  function loadMaps(id, s, maps) {
    const hi = maps !== (manifest.textures[id] || {}).maps;
    if (hi) s.hi = true;
    for (const [k, t] of [['map', s.map], ['normal', s.normal], ['rough', s.arm]]) {
      // a new image size needs a fresh GPU texture: dispose the stand-in's, then upload the real one
      image(maps[k]).then((img) => {
        if (!hi && s.hi && t.image && t.image.width > img.width) return; // the sharper copy arrived first
        t.dispose(); t.image = img; if (hi) t.anisotropy = anisoMax; t.needsUpdate = true;
      }).catch((err) => console.warn(`texture ${id} (${k}):`, err.message));
    }
  }
  return {
    // the manifest is read once. World builds wait for it, for at most a few seconds, so texture sets are known when
    // parts ask for them; if it is late, parts simply keep their flat colours.
    init() { return ready || (ready = (async () => { try { const r = await fetch('assets/manifest.json', { cache: 'no-cache' }); if (r.ok) manifest = await r.json(); } catch (e) {} })()); },
    get ready() { return ready && Promise.race([ready, new Promise((r) => setTimeout(r, 4000))]); },
    has(id) { return !!manifest.models[id]; },
    hasTexture(id) { return !!(manifest.textures && manifest.textures[id]); },
    info: () => manifest,
    // a model's template (meshes marked as shared, so leaving a world never disposes them)
    model(id) {
      if (!models.has(id)) models.set(id, (async () => {
        const e = manifest.models[id];
        if (!e) throw new Error('no model "' + id + '" in the asset manifest');
        const g = await gltf.parseAsync(await load(e), '');
        g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.geometry) o.geometry.userData.keep = true; } });
        return g.scene;
      })());
      return models.get(id);
    },
    // a texture set for textured parts: { id, map, normal, arm, mean (linear colour), rough, size (metres), ao, metal, bump }.
    // Returned at once (with stand-ins); the images follow. Sets stay loaded for the session, shared by every world.
    texture(id) {
      if (sets.has(id)) return sets.get(id);
      const e = manifest.textures && manifest.textures[id];
      if (!e) return null;
      const avg = new THREE.Color().setRGB(e.mean[0], e.mean[1], e.mean[2]).getHex(); // sRGB bytes of the linear average
      const s = {
        id, mean: e.mean.map((v) => Math.max(v, 0.002)), rough: e.rough || 1, size: e.size || 2, ao: !!e.ao, metal: !!e.metal, bump: e.bump == null ? 1 : e.bump,
        map: texture(pixel(avg >> 16, (avg >> 8) & 255, avg & 255), true),
        normal: texture(pixel(128, 128, 255)),
        arm: texture(pixel(255, Math.round(255 * (e.rough || 1)), 255)),
      };
      sets.set(id, s);
      loadMaps(id, s, hiRes && e.maps_hi ? e.maps_hi : e.maps);
      return s;
    },
    // ultra: swap every texture set to its 1024 px images (where the manifest has them), now and for sets loaded later
    setHiRes(on) {
      if (on === hiRes) return;
      hiRes = on;
      for (const [id, s] of sets) {
        const e = manifest.textures[id];
        for (const t of [s.map, s.normal, s.arm]) { t.anisotropy = on ? anisoMax : aniso; t.needsUpdate = true; }
        if (on && e && e.maps_hi && !s.hi) loadMaps(id, s, e.maps_hi);
      }
    },
    // a photographed sky: an environment map for lighting and reflections, and the image for the background
    sky(id) {
      if (!skies.has(id)) skies.set(id, (async () => {
        const e = manifest.hdris[id];
        if (!e || !pmrem) throw new Error('no sky "' + id + '"');
        const url = URL.createObjectURL(new Blob([await load(e)]));
        try {
          const tex = await rgbe.loadAsync(url);
          tex.mapping = THREE.EquirectangularReflectionMapping;
          return { bg: tex, env: pmrem.fromEquirectangular(tex).texture };
        } finally { URL.revokeObjectURL(url); }
      })());
      return skies.get(id);
    },
  };
}
