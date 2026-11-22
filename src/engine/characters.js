// Characters: rigged, animated bodies players can wear, from docs/assets/characters.json (made by
// tools/characters.py). A body is presentation only: it never changes the collider or anything a replay
// checks, and replays (which have no screen) never load one. Each file is pinned by SHA-256 and checked
// before use. Clones share geometry and materials; each gets its own skeleton so it animates on its own.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export function createCharacters(base = 'assets/') {
  let list = null, ready = null;
  const templates = new Map();
  const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
  const lib = {
    init() {
      return ready || (ready = fetch(base + 'characters.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : null)).catch(() => null)
        .then((m) => { list = (m && m.characters) || []; return list; }));
    },
    list: () => list || [],
    info: (id) => (list || []).find((c) => c.id === id) || null,
    // the loaded original, kept for cloning (its meshes are shared, so leaving a world never disposes them)
    template(id) {
      if (!templates.has(id)) templates.set(id, (async () => {
        await lib.init();
        const info = lib.info(id);
        if (!info) throw new Error('no character "' + id + '"');
        const res = await fetch(info.file, { cache: 'force-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const buf = await res.arrayBuffer();
        if (hex(await crypto.subtle.digest('SHA-256', buf)) !== info.sha256) throw new Error('character file does not match its pinned hash');
        const g = await gltf.parseAsync(buf, '');
        g.scene.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = false; o.receiveShadow = true; // avatars use a blob shadow
          o.frustumCulled = false; // skinned bounds are the bind pose; animation can leave them
          if (o.geometry) o.geometry.userData.keep = true;
        });
        return { scene: g.scene, clips: g.animations, info };
      })());
      return templates.get(id);
    },
    async instance(id) { const t = await lib.template(id); return { root: cloneSkinned(t.scene), clips: t.clips, info: t.info }; },
  };
  return lib;
}
