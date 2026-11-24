// Renderer, sky, lights, post-processing, shared materials and text textures.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ---------- shared materials (cached by appearance) ----------
// o.tex: a texture set from the asset library (assets.texture(id)). Then the colour is what the part averages to and
// the texture adds the detail (its maps are divided by the set's average), so a part looks the same before and after
// its images arrive; no colour shows the material as photographed. rough works the same way for roughness.
const MATS = new Map();
export function mat(color, o = {}) {
  const t = o.tex || null;
  const key = [color, o.glow || 0, o.emissive || '', o.metal || 0, o.rough == null ? 0.78 : o.rough, o.opacity == null ? 1 : o.opacity, o.flat ? 1 : 0, o.double ? 1 : 0].join('|')
    + (t ? `|${t.id}|${o.rough == null ? '-' : o.rough}|${o.metal == null ? '-' : o.metal}` : ''); // textured: unset rough/metal mean "as photographed"
  let m = MATS.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: color || '#ffffff', roughness: o.rough == null ? 0.78 : o.rough, metalness: o.metal || 0, flatShading: !!o.flat });
    if (t) {
      m.map = t.map; m.normalMap = t.normal; m.roughnessMap = t.arm;
      if (t.ao) m.aoMap = t.arm;
      if (t.metal) { m.metalnessMap = t.arm; m.metalness = o.metal == null ? 1 : o.metal; }
      m.normalScale.set(t.bump, t.bump);
      if (color) { m.color.r /= t.mean[0]; m.color.g /= t.mean[1]; m.color.b /= t.mean[2]; } // linear: the texture's average becomes the colour
      m.roughness = o.rough == null ? 1 : o.rough / t.rough;
    }
    if (o.glow) { m.emissive = new THREE.Color(o.emissive || color || '#ffffff'); m.emissiveIntensity = o.glow; }
    if (o.opacity != null && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
    if (o.double) m.side = THREE.DoubleSide;
    MATS.set(key, m);
  }
  return m;
}
export function allMaterials() { return MATS.values(); }

// ---------- text ----------
export const FONT = '"Fredoka", "Segoe UI", system-ui, sans-serif';
const HAS_DOM = typeof document !== 'undefined';
// Deterministic word wrap by character count. Anything with a collider (signs) is sized from this,
// never from font metrics, which differ between browsers and machines and would change the physics.
export function wrapLines(lines, maxChars) {
  const out = [];
  for (const line of lines) {
    let cur = '';
    for (const word of String(line).split(' ')) {
      const t = cur ? cur + ' ' + word : word;
      if (t.length > maxChars && cur) { out.push(cur); cur = word; } else cur = t;
    }
    out.push(cur);
  }
  return out;
}
// o.wrapped: lines are already wrapped (no measuring); o.fit: shrink the font if a line would overflow.
// Without a DOM (headless replays) this returns a size-only stand-in.
export function textCanvas(lines, o = {}) {
  const pad = o.pad == null ? 28 : o.pad;
  let fs = o.fontSize || 44;
  const lh0 = Math.round(fs * 1.25);
  if (!HAS_DOM) {
    const n = o.wrapped ? lines.length : lines.length;
    return { width: o.width || Math.max(10, Math.max(...lines.map((l) => String(l).length)) * Math.round(fs * 0.56)) + pad * 2, height: o.height || n * lh0 + pad * 2 - (lh0 - fs), headless: true };
  }
  const font = (size) => `${o.weight || 600} ${size}px ${FONT}`;
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  ctx.font = font(fs);
  const width = o.width || Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width), 10)) + pad * 2;
  let wrapped = [];
  if (o.wrapped || !o.width) wrapped = lines.slice();
  else for (const line of lines) {
    let cur = '';
    for (const word of line.split(' ')) {
      const t = cur ? cur + ' ' + word : word;
      if (ctx.measureText(t).width > width - pad * 2 && cur) { wrapped.push(cur); cur = word; } else cur = t;
    }
    wrapped.push(cur);
  }
  const height = o.height || wrapped.length * lh0 + pad * 2 - (lh0 - fs);
  if (o.fit) { // keep the layout, shrink the glyphs until the widest line fits
    const widest = Math.max(...wrapped.map((l) => ctx.measureText(l).width), 1);
    if (widest > width - pad * 2) fs = Math.max(12, Math.floor(fs * (width - pad * 2) / widest));
  }
  const lh = o.fit ? lh0 : Math.round(fs * 1.25);
  c.width = width; c.height = height;
  ctx.font = font(fs);
  if (o.bg) {
    ctx.fillStyle = o.bg;
    const r = o.radius == null ? 18 : o.radius;
    ctx.beginPath(); ctx.roundRect(0, 0, width, height, r); ctx.fill();
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(3, 3, width - 6, height - 6, Math.max(0, r - 3)); ctx.stroke(); }
  }
  ctx.fillStyle = o.color || '#ffffff';
  ctx.textBaseline = 'top';
  ctx.textAlign = o.align === 'left' ? 'left' : 'center';
  const x = o.align === 'left' ? pad : width / 2;
  const top = o.height ? (height - (wrapped.length * lh - (lh - fs))) / 2 : pad;
  wrapped.forEach((l, i) => {
    if (o.titleColor && i === 0) ctx.fillStyle = o.titleColor; else ctx.fillStyle = o.color || '#ffffff';
    ctx.fillText(l, x, top + i * lh);
  });
  return c;
}
export function canvasTexture(c) {
  if (!c || c.headless) return null;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
// A floating label that always faces the camera. size = world height in metres.
export function labelSprite(text, o = {}) {
  const c = textCanvas(String(text).split('\n'), Object.assign({ bg: 'rgba(8,10,26,0.62)', fontSize: 40, pad: 18 }, o));
  const m = new THREE.SpriteMaterial({ map: canvasTexture(c), transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const s = new THREE.Sprite(m);
  const h = o.size || 0.45;
  s.scale.set(h * c.width / c.height, h, 1);
  s.renderOrder = 10;
  return s;
}

// ---------- sky ----------
const SKY_VS = `varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const SKY_FS = `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunSize; uniform float sharp;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), sharp)) : mix(horizon, bottom, pow(clamp(-h, 0.0, 1.0), 0.45));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  col += sunColor * (smoothstep(1.0 - 0.0009 * sunSize, 1.0 - 0.0006 * sunSize, s) * 3.0 + pow(s, 10.0) * 0.28);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// a theme's colours and numbers, with the defaults paintTheme uses, so that two themes can be blended
function themeValues(t) {
  const c = (x, d) => new THREE.Color(x || d), fog = t.fog || [80, 420], sd = t.sunDir || [0.35, 0.45, -0.8];
  return {
    skyTop: c(t.skyTop, '#0b1030'), skyHorizon: c(t.skyHorizon, '#ff7a59'), skyBottom: c(t.skyBottom || t.skyHorizon, '#120a1e'),
    sunColor: c(t.sunColor, '#ffb070'), sunLight: c(t.sunLight || t.sunColor, '#ffd6b0'), hemiSky: c(t.hemiSky, '#bfd6ff'), hemiGround: c(t.hemiGround, '#30243a'),
    fogColor: c(t.fogColor || t.skyHorizon, '#ff7a59'), sunDir: new THREE.Vector3(sd[0], sd[1], sd[2]).normalize(),
    sunSize: t.sunSize == null ? 1 : t.sunSize, skySharp: t.skySharp || 0.55, sunIntensity: t.sunIntensity == null ? 2.0 : t.sunIntensity,
    hemiIntensity: t.hemiIntensity == null ? 1.1 : t.hemiIntensity, fogNear: fog[0], fogFar: fog[1], stars: t.stars || 0, exposure: t.exposure || 1.05, bloom: t.bloom == null ? 0.55 : t.bloom,
  };
}
// a blend of two themeValues, k from 0 to 1, in the shape paintTheme takes (colours as THREE.Color)
function mixThemes(a, b, k) {
  const L = (x, y) => x + (y - x) * k, C = (x, y) => x.clone().lerp(y, k), d = a.sunDir.clone().lerp(b.sunDir, k).normalize();
  return {
    skyTop: C(a.skyTop, b.skyTop), skyHorizon: C(a.skyHorizon, b.skyHorizon), skyBottom: C(a.skyBottom, b.skyBottom), sunColor: C(a.sunColor, b.sunColor),
    sunLight: C(a.sunLight, b.sunLight), hemiSky: C(a.hemiSky, b.hemiSky), hemiGround: C(a.hemiGround, b.hemiGround), fogColor: C(a.fogColor, b.fogColor),
    sunDir: [d.x, d.y, d.z], sunSize: L(a.sunSize, b.sunSize), skySharp: L(a.skySharp, b.skySharp), sunIntensity: L(a.sunIntensity, b.sunIntensity),
    hemiIntensity: L(a.hemiIntensity, b.hemiIntensity), fog: [L(a.fogNear, b.fogNear), L(a.fogFar, b.fogFar)], stars: L(a.stars, b.stars), exposure: L(a.exposure, b.exposure), bloom: L(a.bloom, b.bloom),
  };
}

function makeSky() {
  const uniforms = {
    top: { value: new THREE.Color('#0b1030') }, horizon: { value: new THREE.Color('#ff7a59') }, bottom: { value: new THREE.Color('#120a1e') },
    sunDir: { value: new THREE.Vector3(0.3, 0.2, -1) }, sunColor: { value: new THREE.Color('#ffb070') }, sunSize: { value: 1 }, sharp: { value: 0.55 },
  };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.ShaderMaterial({ uniforms, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false }));
  mesh.scale.setScalar(1000); mesh.frustumCulled = false; mesh.renderOrder = -10;
  const n = 1400, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x, y, z, l;
    do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; l = Math.hypot(x, y, z); } while (l > 1 || l < 0.1);
    y = Math.abs(y) * 0.95 + 0.03;
    l = Math.hypot(x, y, z);
    pos.set([x / l * 900, y / l * 900, z / l * 900], i * 3);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false, toneMapped: false }));
  stars.frustumCulled = false; stars.renderOrder = -9;
  return { mesh, stars, uniforms };
}

// cloud sea below floating worlds
function makeClouds() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 12 + Math.random() * 46;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 10);
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: tex, transparent: true, depthWrite: false, opacity: 0.9 });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(900, 48), m);
  mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = -5; mesh.visible = false;
  return mesh;
}

export function createRender(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1600);
  const sky = makeSky(); scene.add(sky.mesh, sky.stars);
  const clouds = makeClouds(); scene.add(clouds);
  const hemi = new THREE.HemisphereLight(0xbfd6ff, 0x30243a, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.castShadow = true;
  const sc = sun.shadow.camera; sc.left = -36; sc.right = 36; sc.top = 36; sc.bottom = -36; sc.near = 1; sc.far = 200;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  scene.fog = new THREE.Fog(0x000000, 80, 420);

  const R = {
    renderer, scene, camera, sky, sun, hemi, clouds,
    quality: 'high', bloomOn: false, composer: null, bloom: null, sunDir: new THREE.Vector3(0.3, 0.6, -0.5).normalize(),
    setQuality(q) {
      this.quality = q;
      const dpr = window.devicePixelRatio || 1;
      renderer.setPixelRatio(q === 'high' ? Math.min(dpr, 2) : q === 'medium' ? Math.min(dpr, 1.5) : 1);
      const shadows = q !== 'low';
      if (renderer.shadowMap.enabled !== shadows) {
        renderer.shadowMap.enabled = shadows;
        for (const m of allMaterials()) m.needsUpdate = true;
        scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => (m.needsUpdate = true)); });
      }
      sun.castShadow = shadows && this.sunOn !== false;
      const size = q === 'high' ? 2048 : 1024;
      if (sun.shadow.mapSize.x !== size) { sun.shadow.mapSize.set(size, size); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
      this.bloomOn = q === 'high';
      if (this.bloomOn && !this.composer) {
        const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
        this.composer = new EffectComposer(renderer, rt);
        this.composer.addPass(new RenderPass(scene, camera));
        this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.45, 1.0); // threshold 1: only emissive (glow) surfaces bloom, not bright skies
        this.composer.addPass(this.bloom);
        this.composer.addPass(new OutputPass());
      }
      this.resize();
    },
    resize() {
      // the canvas always fills the viewport; layout-derived sizes can be stale during startup (seen in WebKit)
      const w = Math.max(1, window.innerWidth || canvas.clientWidth), h = Math.max(1, window.innerHeight || canvas.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (this.composer) { this.composer.setPixelRatio(renderer.getPixelRatio()); this.composer.setSize(w, h); }
    },
    // theme: { skyTop, skyHorizon, skyBottom, sunDir:[x,y,z], sunColor, sunIntensity, sunSize, hemiSky, hemiGround, hemiIntensity, fog:[near,far], fogColor, stars:0..1, bloom, exposure, clouds:{y,color,opacity} }
    applyTheme(t = {}) {
      this.blend = null; this.theme = Object.assign({}, t);
      this.paintTheme(t);
    },
    // time of day (w.setTheme): blend towards a partial theme over `seconds` (wall clock: this only draws)
    blendTheme(partial = {}, seconds = 0) {
      const target = Object.assign({}, this.theme || {}, partial);
      if (!(seconds > 0)) { this.applyTheme(target); this.refreshEnv(); return; }
      // (a blend that interrupts another starts from where that one had got to)
      const from = themeValues(this.blend && this.blend.now ? this.blend.now : this.theme || {});
      this.blend = { from, to: themeValues(target), target, t0: performance.now(), ms: seconds * 1000, now: null };
    },
    stepBlend() {
      const b = this.blend, k = Math.min(1, (performance.now() - b.t0) / b.ms);
      b.now = mixThemes(b.from, b.to, k * k * (3 - 2 * k));
      this.paintTheme(Object.assign({}, b.target, b.now));
      if (k >= 1) { this.applyTheme(b.target); this.refreshEnv(); }
    },
    // shiny things reflect the painted sky: paint it again once the sky has changed
    refreshEnv() { if (scene.environment && this.envRT && scene.environment === this.envRT.texture) scene.environment = this.paintedEnv(); },
    paintTheme(t) {
      const u = sky.uniforms;
      u.top.value.set(t.skyTop || '#0b1030');
      u.horizon.value.set(t.skyHorizon || '#ff7a59');
      u.bottom.value.set(t.skyBottom || t.skyHorizon || '#120a1e');
      u.sunColor.value.set(t.sunColor || '#ffb070');
      u.sunSize.value = t.sunSize == null ? 1 : t.sunSize;
      u.sharp.value = t.skySharp || 0.55;
      const sd = t.sunDir || [0.35, 0.45, -0.8];
      this.sunDir.set(sd[0], sd[1], sd[2]).normalize();
      u.sunDir.value.copy(this.sunDir);
      sun.color.set(t.sunLight || t.sunColor || '#ffd6b0');
      sun.intensity = t.sunIntensity == null ? 2.0 : t.sunIntensity;
      this.sunOn = sun.intensity > 0.01; // caves: skip the shadow pass entirely
      sun.castShadow = this.sunOn && this.quality !== 'low';
      hemi.color.set(t.hemiSky || '#bfd6ff'); hemi.groundColor.set(t.hemiGround || '#30243a');
      hemi.intensity = t.hemiIntensity == null ? 1.1 : t.hemiIntensity;
      scene.fog.color.set(t.fogColor || t.skyHorizon || '#ff7a59');
      scene.fog.near = (t.fog || [80, 420])[0]; scene.fog.far = (t.fog || [80, 420])[1];
      sky.stars.material.opacity = t.stars || 0;
      renderer.toneMappingExposure = t.exposure || 1.05;
      if (this.bloom) this.bloom.strength = t.bloom == null ? 0.55 : t.bloom;
      if (t.clouds) {
        clouds.visible = true; clouds.position.y = t.clouds.y == null ? -40 : t.clouds.y;
        clouds.material.color.set(t.clouds.color || '#ffffff'); clouds.material.opacity = t.clouds.opacity == null ? 0.85 : t.clouds.opacity;
      } else clouds.visible = false;
    },
    // A world without a photographed sky still gives shiny things something to reflect: its painted sky, rendered once
    // into an environment map when the world loads (a few milliseconds). Without it, metal renders black (ART.md).
    paintedEnv() {
      if (!this.pmrem) this.pmrem = new THREE.PMREMGenerator(renderer);
      if (!this.envScene) {
        this.envScene = new THREE.Scene();
        const m = new THREE.Mesh(sky.mesh.geometry, sky.mesh.material); m.scale.setScalar(100); m.frustumCulled = false;
        this.envScene.add(m);
      }
      const rt = this.pmrem.fromScene(this.envScene, 0, 0.1, 200);
      if (this.envRT) this.envRT.dispose();
      this.envRT = rt;
      return rt.texture;
    },
    follow(target) {
      if (this.blend) this.stepBlend();
      sky.mesh.position.copy(camera.position); sky.stars.position.copy(camera.position);
      clouds.position.x = camera.position.x; clouds.position.z = camera.position.z;
      clouds.material.alphaMap.offset.set(camera.position.x / 180 + performance.now() * 0.000004, -camera.position.z / 180);
      sun.target.position.copy(target);
      sun.position.copy(target).addScaledVector(this.sunDir, 80);
    },
    render() {
      if (this.bloomOn && this.composer) this.composer.render(); else renderer.render(scene, camera);
    },
  };
  return R;
}
