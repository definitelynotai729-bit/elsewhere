// What a world leaves on the GPU, freed after its dispose() (src/engine/freeworld.js), checked without a browser:
// a sign's own material and canvas texture are freed; the shared materials (render.js mat()), anything still in the
// scene, a canvas texture another live material shows, and textures loaded from files are kept.
// The browser check is .scratch/leak_check.py (every world toured twice: the GPU's textures stay level).
// usage: node tools/free_test.mjs
import * as THREE from 'three';
import { freeWorld } from '../src/engine/freeworld.js';

let fails = 0;
const ok = (cond, what) => { if (!cond) { fails++; console.log('FAIL ' + what); } else console.log('ok   ' + what); };
const freed = new Set();
const watch = (x) => { x.addEventListener('dispose', () => freed.add(x)); return x; };
const canvas = () => watch(new THREE.CanvasTexture({ width: 544, height: 450 }));
const box = new THREE.BoxGeometry(1, 1, 1);

const scene = new THREE.Scene(), world = new THREE.Group(); world.name = 'world:test';
// a sign: its own material and canvas texture
const signTex = canvas(), signMat = watch(new THREE.MeshBasicMaterial({ map: signTex }));
world.add(new THREE.Mesh(box, signMat));
// a shared material (mat(): one per colour, for every world)
const shared = watch(new THREE.MeshStandardMaterial({ color: 0x336699 }));
world.add(new THREE.Mesh(box, shared));
// a material the world shares with something still drawn (the player's avatar, say)
const liveTex = canvas(), live = watch(new THREE.MeshStandardMaterial({ map: liveTex }));
world.add(new THREE.Mesh(box, live)); scene.add(new THREE.Mesh(box, live));
// the world's own material showing a canvas texture that a live material also shows
const sharedTex = canvas(), ownOnShared = watch(new THREE.MeshBasicMaterial({ map: sharedTex }));
world.add(new THREE.Mesh(box, ownOnShared)); scene.add(new THREE.Mesh(box, new THREE.MeshBasicMaterial({ map: sharedTex })));
// a texture loaded from a file (a model's), on the world's own material
const fileTex = watch(new THREE.Texture({ width: 512, height: 512 })), modelMat = watch(new THREE.MeshStandardMaterial({ map: fileTex }));
world.add(new THREE.Mesh(box, modelMat));
// a shader material with a canvas texture in a uniform, and several materials on one mesh
const uTex = canvas(), shaderMat = watch(new THREE.ShaderMaterial({ uniforms: { pic: { value: uTex } } }));
const multiA = watch(new THREE.MeshBasicMaterial()), multiB = watch(new THREE.MeshBasicMaterial({ map: canvas() }));
const group = new THREE.Group(); group.add(new THREE.Mesh(box, shaderMat), new THREE.Mesh(box, [multiA, multiB])); world.add(group);

const r = freeWorld(world, { shared: [shared], scene });
ok(freed.has(signMat) && freed.has(signTex), "a sign's own material and canvas texture are freed");
ok(!freed.has(shared), 'a shared material is kept');
ok(!freed.has(live) && !freed.has(liveTex), 'a material still in the scene is kept, with its texture');
ok(freed.has(ownOnShared) && !freed.has(sharedTex), "the world's own material is freed, but not a canvas texture a live material shows");
ok(freed.has(modelMat) && !freed.has(fileTex), 'a texture from a file is kept (caches share them between worlds)');
ok(freed.has(shaderMat) && freed.has(uTex), "a shader material's canvas texture (in a uniform) is freed with it");
ok(freed.has(multiA) && freed.has(multiB) && freed.has(multiB.map), 'every material of a mesh with several is freed');
ok(r.materials === 6 && r.textures === 3, `it says what it freed (${r.materials} materials, ${r.textures} textures)`);
const again = freeWorld(world, { shared: [shared], scene });
ok(again.materials === 6, 'freeing twice is harmless (three.js ignores a second dispose)');

console.log(fails ? `${fails} FAILED` : 'FREE OK');
process.exitCode = fails ? 1 : 0;
