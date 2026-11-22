// Scenery assets: 3D models (.glb) and photographed skies (.hdr) from docs/assets, each pinned by SHA-256 in
// docs/assets/manifest.json and checked before use. A model loads once and every placement shares it.
// Assets are scenery: world code never reads them back, so they cannot change gameplay, and a replay
// (which has no screen) never loads them.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export function createAssets(renderer) {
  let manifest = { models: {}, hdris: {} };
  const models = new Map(), skies = new Map();
  const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
  const rgbe = new RGBELoader();
  const pmrem = renderer ? new THREE.PMREMGenerator(renderer) : null;
  async function load(entry) {
    const res = await fetch(entry.file, { cache: 'force-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    if (hex(await crypto.subtle.digest('SHA-256', buf)) !== entry.sha256) throw new Error('asset does not match its pinned hash');
    return buf;
  }
  return {
    async init() { try { const r = await fetch('assets/manifest.json', { cache: 'no-cache' }); if (r.ok) manifest = await r.json(); } catch (e) {} },
    has(id) { return !!manifest.models[id]; },
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
