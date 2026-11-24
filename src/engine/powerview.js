// What artifacts' powers look like. Presentation only: this module is not part of the engine a replay runs, so these
// looks can change without touching a proof. Each frame it reads the player's power state (player.js `pw`) and draws
// the shield's bubble, the shape a transformation takes, the rewind's tint and wake, and the finder's trail of light
// with a pillar where it ends.
import * as THREE from 'three';
import { buildLook } from './items.js';

const BUBBLE_VS = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv; }`;
// a soap-film rim: nearly clear facing you, bright at the edge, with a slow shimmer
const BUBBLE_FS = `uniform vec3 color; uniform float alpha; uniform float t; varying vec3 vN; varying vec3 vV;
void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); f = f * f;
  float shimmer = 0.82 + 0.18 * sin(t * 3.0 + vN.y * 9.0 + vN.x * 5.0);
  gl_FragColor = vec4(color * (0.75 + 1.5 * f), alpha * (0.08 + 0.85 * f) * shimmer); }`;

// the finder's stream: motes that fly an arc from you to the mark (no drag, unlike the shared particles)
const MOTE_VS = `attribute float size; attribute float alpha; uniform float scale; varying float vA;
void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * scale / max(0.2, -mv.z); gl_Position = projectionMatrix * mv; }`;
const MOTE_FS = `uniform vec3 color; varying float vA;
void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.05, length(d)) * vA; if (a < 0.01) discard; gl_FragColor = vec4(color * 2.2, a); }`;
const MOTES = 96;

export function createPowerView(E) {
  const pl = E.player, A = pl.avatar;
  const mp = new Float32Array(MOTES * 3), ms = new Float32Array(MOTES), ma = new Float32Array(MOTES);
  const mo = []; // { a: start, b: end, h: arc height, u: progress 0..1, k: progress per second }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.BufferAttribute(mp, 3).setUsage(THREE.DynamicDrawUsage));
  mg.setAttribute('size', new THREE.BufferAttribute(ms, 1).setUsage(THREE.DynamicDrawUsage));
  mg.setAttribute('alpha', new THREE.BufferAttribute(ma, 1).setUsage(THREE.DynamicDrawUsage));
  const moteMat = new THREE.ShaderMaterial({ uniforms: { scale: { value: 400 }, color: { value: new THREE.Color('#ffd77a') } }, vertexShader: MOTE_VS, fragmentShader: MOTE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const motes = new THREE.Points(mg, moteMat); motes.frustumCulled = false; motes.renderOrder = 6;
  E.scene.add(motes);
  const vb = new THREE.Vector2();
  const bubbleMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color('#9fe7ff') }, alpha: { value: 0 }, t: { value: 0 } },
    vertexShader: BUBBLE_VS, fragmentShader: BUBBLE_FS, transparent: true, depthWrite: false,
  });
  const bubble = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 3), bubbleMat);
  bubble.position.y = 0.95; bubble.visible = false; bubble.renderOrder = 6;
  A.root.add(bubble);
  const pillarMat = new THREE.MeshBasicMaterial({ color: '#ffe3a0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.7, 1, 14, 1, true), pillarMat);
  pillar.visible = false; pillar.renderOrder = 6; pillar.frustumCulled = false;
  E.scene.add(pillar);
  const overlay = typeof document !== 'undefined' ? document.getElementById('rewind-fx') : null;
  let form = null, formOf = null, phase = 0, bubbleK = 0, pillarK = 0, moteT = 0, wakeT = 0, last = null;
  const at = new THREE.Vector3(), from = new THREE.Vector3(), dir = new THREE.Vector3();
  const puff = (colors) => E.fx.burst(new THREE.Vector3(pl.renderPos.x, pl.renderPos.y, pl.renderPos.z), { color: colors, count: 26, speed: 3.5, life: 0.7, gravity: -1, soft: true, size: 0.5 });

  function setForm(f) {
    if (formOf === f) return;
    if (form) { form.removeFromParent(); form = null; }
    formOf = f || null;
    if (f) { form = buildLook(f.look); form.traverse((o) => { o.castShadow = false; }); A.root.add(form); }
    A.rig.visible = !f;
  }

  return {
    frame(dt, t) {
      const P = pl.pw, kind = P.kind;
      if (kind !== last) { // a power began or ended
        if (kind === 'transform' || last === 'transform') puff(['#ffffff', '#e6dcff', '#c9b6ff']);
        if (kind === 'shield') bubbleK = 0;
        last = kind;
      }
      // the shield: a bubble that fades in, and blinks in its last second and a half
      const shieldOn = kind === 'shield';
      bubbleK = Math.min(1, Math.max(0, bubbleK + (shieldOn ? dt * 6 : -dt * 4)));
      bubble.visible = bubbleK > 0.01;
      if (bubble.visible) {
        const blink = shieldOn && P.t < 1.5 ? 0.55 + 0.45 * Math.cos(t * 18) : 1;
        bubbleMat.uniforms.alpha.value = bubbleK * blink; bubbleMat.uniforms.t.value = t;
        const s = 0.85 + 0.15 * bubbleK; bubble.scale.setScalar(s * (1 + Math.sin(t * 2.4) * 0.015));
      }
      // the transformation: the form stands in for the body (the charm keeps hovering)
      setForm(kind === 'transform' ? P.form : null);
      if (form) {
        const sp = Math.hypot(pl.vel.x, pl.vel.z), up = pl.grounded || pl.groundDist < 0.15;
        phase += dt * (3 + sp * 1.6);
        form.position.y = up ? Math.abs(Math.sin(phase)) * Math.min(0.22, sp * 0.025) : 0.12;
        form.rotation.x = up ? Math.sin(phase * 2) * Math.min(0.08, sp * 0.008) : THREE.MathUtils.clamp(-pl.vel.y * 0.03, -0.35, 0.35);
        // the last three seconds: it shimmers, a warning that the shape will not last
        form.visible = !(P.t < 3 && Math.sin(t * 22) > 0.55);
      }
      // the rewind: a cool tint over the screen, and a wake of fading light where you were
      if (overlay) overlay.classList.toggle('on', kind === 'rewind');
      if (kind === 'rewind') {
        wakeT -= dt;
        if (wakeT <= 0) { wakeT = 0.03; E.fx.soft.add(pl.renderPos.x, pl.renderPos.y + 0.1, pl.renderPos.z, 0, 0.3, 0, '#bfe3ff', 0.9, 0.7, 0); }
      }
      // the finder: a stream of light from you toward its mark, and a pillar over the mark itself
      const finding = kind === 'finder' && P.at;
      if (finding) at.set(P.at[0], P.at[1], P.at[2]);
      pillarK = Math.min(1, Math.max(0, pillarK + (finding ? dt * 2.5 : -dt * 2)));
      pillar.visible = pillarK > 0.01;
      if (pillar.visible) {
        pillar.position.set(at.x, at.y + 19, at.z); pillar.scale.set(1, 40, 1);
        pillarMat.opacity = 0.35 * pillarK * (0.8 + 0.2 * Math.sin(t * 5));
      }
      if (finding) {
        moteT -= dt;
        from.set(pl.renderPos.x, pl.renderPos.y + 0.7, pl.renderPos.z);
        dir.subVectors(at, from); const d = dir.length();
        if (d > 0.8 && moteT <= 0 && mo.length < MOTES) {
          moteT = 0.05;
          const reach = Math.min(d, 30), b = from.clone().addScaledVector(dir, reach / d); // a far mark: the stream shows the way
          mo.push({ a: from.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)), b, h: 1 + reach * 0.12, u: 0, k: 14 / Math.max(2, reach) });
        }
      }
      let n = 0;
      for (let i = 0; i < mo.length; i++) {
        const m = mo[i]; m.u += dt * m.k;
        if (m.u >= 1) { mo.splice(i--, 1); continue; }
        const u = m.u, x = m.a.x + (m.b.x - m.a.x) * u, z = m.a.z + (m.b.z - m.a.z) * u, y = m.a.y + (m.b.y - m.a.y) * u + Math.sin(u * Math.PI) * m.h;
        mp[n * 3] = x; mp[n * 3 + 1] = y; mp[n * 3 + 2] = z; ms[n] = 0.32 * (1 - u * 0.5); ma[n] = Math.min(1, (1 - u) * 3) * Math.min(1, u * 8); n++;
      }
      mg.setDrawRange(0, n);
      if (n) {
        for (const a of ['position', 'size', 'alpha']) mg.attributes[a].needsUpdate = true;
        if (E.render && E.render.renderer && E.camera) { E.render.renderer.getDrawingBufferSize(vb); moteMat.uniforms.scale.value = vb.y / (2 * Math.tan((E.camera.fov * Math.PI) / 360)); }
      }
    },
    // between worlds: nothing of a power outlives its visit
    reset() { setForm(null); bubbleK = 0; bubble.visible = false; pillarK = 0; pillar.visible = false; mo.length = 0; mg.setDrawRange(0, 0); last = null; if (overlay) overlay.classList.remove('on'); },
  };
}
