// Photo mode: a path-traced still of the current view, made with three-gpu-pathtracer (MIT, Garrett Johnson).
// Real global illumination, soft shadows, reflections and depth of field, from the same scene the game draws.
// It is built as its own file (docs/photo.js) and loaded only when a player asks for a photo; three.js comes from the
// running game (window.EW.THREE), so both see the same objects. Visual only: the game keeps ticking underneath.
//
// What the path tracer cannot draw is left out or stood in for:
//  - the painted sky (a GLSL shader) is rendered into a cube map that becomes the photo's backdrop;
//  - the hemisphere light (no path-traced equivalent) is folded into the environment map as a sky/ground gradient,
//    radiance = colour x intensity / pi, which lights exactly as three's HemisphereLight does;
//  - labels, particles, stars, the cloud sea and the portals' shader surfaces are hidden.
import * as THREE from 'three';
import { WebGLPathTracer, PhysicalCamera } from 'three-gpu-pathtracer';

const HIDE = (o, skyParts) => skyParts.has(o) || o.isSprite || o.isPoints || o.isLine
  || (o.isMesh && o.material && !Array.isArray(o.material) && (o.material.isShaderMaterial || (o.material.transparent && o.material.opacity < 0.05)));

// The asset library's models are packed by gltfpack: quantised (normalised integer) and interleaved attributes. The
// path tracer's geometry merge reads plain float arrays only (packed models came out missing, or as huge stray
// triangles), so for the photo each such mesh gets a float copy of its geometry, swapped in while the scene is built.
function floatGeometry(g) {
  const out = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries(g.attributes)) {
    if (name === 'skinIndex') { out.setAttribute(name, a.isInterleavedBufferAttribute ? new THREE.BufferAttribute(Uint16Array.from({ length: a.count * a.itemSize }, (_, i) => a.getComponent(Math.floor(i / a.itemSize), i % a.itemSize)), a.itemSize) : a); continue; }
    const n = a.count, s = a.itemSize, arr = new Float32Array(n * s);
    for (let i = 0; i < n; i++) for (let k = 0; k < s; k++) arr[i * s + k] = a.getComponent(i, k); // de-normalises
    out.setAttribute(name, new THREE.BufferAttribute(arr, s));
  }
  if (g.index) out.setIndex(new THREE.BufferAttribute(Uint32Array.from(g.index.array), 1));
  for (const gr of g.groups) out.addGroup(gr.start, gr.count, gr.materialIndex);
  return out;
}
const packed = (g) => g && Object.values(g.attributes).some((a) => a.isInterleavedBufferAttribute || a.normalized || !(a.array instanceof Float32Array));

// the painted sky as a cube map (linear HDR), for camera rays that leave the world
function skyCube(renderer, R, size = 512) {
  const s = new THREE.Scene();
  const m = new THREE.Mesh(R.sky.mesh.geometry, R.sky.mesh.material); m.scale.setScalar(1000); m.frustumCulled = false;
  s.add(m);
  const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(1, 2000, rt);
  cc.update(renderer, s);
  return rt;
}

// the light from the sky: the photographed environment (if the world has one) plus the hemisphere light, in one map
function skyLight(hdr, envIntensity, hemi) {
  const w = hdr ? hdr.image.width : 256, h = hdr ? hdr.image.height : 128;
  const out = new Float32Array(w * h * 4);
  const src = hdr && hdr.image.data, half = hdr && hdr.type === THREE.HalfFloatType, ch = src ? src.length / (w * h) : 0;
  const k = hemi.intensity / Math.PI, sky = hemi.color, gnd = hemi.groundColor;
  for (let y = 0; y < h; y++) {
    // rows run top (straight up) to bottom, as in the .hdr file (RGBELoader's flipY convention, kept below)
    const up = (y + 0.5) / h < 0.5;
    const c = up ? sky : gnd;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, j = (y * w + x) * ch;
      let r = 0, g = 0, b = 0;
      if (src) {
        r = half ? THREE.DataUtils.fromHalfFloat(src[j]) : src[j];
        g = half ? THREE.DataUtils.fromHalfFloat(src[j + 1]) : src[j + 1];
        b = half ? THREE.DataUtils.fromHalfFloat(src[j + 2]) : src[j + 2];
      }
      out[i] = r * envIntensity + c.r * k; out[i + 1] = g * envIntensity + c.g * k; out[i + 2] = b * envIntensity + c.b * k; out[i + 3] = 1;
    }
  }
  const t = new THREE.DataTexture(out, w, h, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false; t.flipY = true; t.needsUpdate = true;
  return t;
}

// opts: { samples (default 256), bounces (6), fStop (0 = no depth of field), focus (m; default the player), tiles (2),
//         onProgress(samples, of) }. Resolves to { dataUrl, samples, ms, buildMs }.
export async function takePhoto(E, opts = {}) {
  const R = E.render, renderer = R.renderer, scene = R.scene, cam = E.camera;
  const samples = opts.samples || 256;
  const t0 = performance.now();

  // the camera, frozen where it is now (with an optional lens: depth of field focused on the player)
  const pc = new PhysicalCamera(cam.fov, cam.aspect, cam.near, cam.far);
  pc.position.copy(cam.position); pc.quaternion.copy(cam.quaternion); pc.updateMatrixWorld();
  pc.focusDistance = opts.focus || cam.position.distanceTo(E.player.renderPos) || 8;
  pc.fStop = opts.fStop || 1e4; pc.apertureBlades = 7;

  // sky and sky light
  const theme = (E.world && E.world.mod && E.world.mod.theme) || {};
  let hdr = null;
  if (theme.sky && E.assets) { try { hdr = (await E.assets.sky(theme.sky)).bg; } catch (e) {} }
  const saved = { env: scene.environment, envI: scene.environmentIntensity, bg: scene.background, bgI: scene.backgroundIntensity };
  const envIntensity = scene.environment ? scene.environmentIntensity : 0;
  const light = skyLight(hdr, envIntensity, R.hemi);
  let cube = null;
  if (!scene.background) { cube = skyCube(renderer, R); scene.background = cube.texture; scene.backgroundIntensity = 1; }
  scene.environment = light; scene.environmentIntensity = 1;

  // build: hide what cannot be path traced, collect the rest into one BVH
  const skyParts = new Set([R.sky.mesh, R.sky.stars, R.clouds]);
  const hidden = [], swapped = [];
  scene.traverse((o) => {
    if (o.visible && HIDE(o, skyParts)) { hidden.push(o); o.visible = false; return; }
    if (o.isMesh && packed(o.geometry)) { swapped.push([o, o.geometry]); o.geometry = floatGeometry(o.geometry); }
  });
  const pt = new WebGLPathTracer(renderer);
  pt.bounces = opts.bounces || 6; pt.filterGlossyFactor = 0.5; pt.tiles.set(opts.tiles || 2, opts.tiles || 2);
  pt.renderDelay = 0; pt.minSamples = 1; pt.fadeDuration = 0; pt.rasterizeScene = false; pt.dynamicLowRes = false;
  pt.textureSize.set(1024, 1024);
  let buildMs = 0;
  try {
    pt.setScene(scene, pc);
    buildMs = performance.now() - t0;
  } finally {
    hidden.forEach((o) => (o.visible = true));
    for (const [o, g] of swapped) { o.geometry.dispose(); o.geometry = g; }
    scene.environment = saved.env; scene.environmentIntensity = saved.envI; scene.background = saved.bg; scene.backgroundIntensity = saved.bgI;
  }

  // accumulate: the game's own render is replaced by path-traced samples until the photo is done
  const render = R.render;
  const done = await new Promise((resolve) => {
    R.render = function () {
      renderer.setRenderTarget(null); // the path tracer draws into whatever target is bound: the screen, here
      pt.renderSample();
      if (opts.onProgress) opts.onProgress(pt.samples, samples);
      if (pt.samples >= samples) {
        const dataUrl = renderer.domElement.toDataURL('image/png'); // same task as the draw: no preserveDrawingBuffer needed
        R.render = render;
        resolve({ dataUrl, samples: Math.floor(pt.samples), ms: Math.round(performance.now() - t0), buildMs: Math.round(buildMs) });
      }
    };
  });
  try { pt.dispose(); } catch (e) {} // 0.0.23's dispose() trips over a member it no longer has, after freeing the rest
  light.dispose(); if (cube) cube.dispose();
  return done;
}
