// Particles (bursts, dust, ambient motes) and the portal surface shader.
import * as THREE from 'three';

const VS = `attribute float size; attribute vec3 color; attribute float alpha; uniform float scale;
varying vec3 vC; varying float vA;
void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * scale / max(0.2, -mv.z); gl_Position = projectionMatrix * mv; }`;
const FS = `varying vec3 vC; varying float vA; uniform float boost;
void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.08, length(d)) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vC * boost, a); }`;

function pointsMaterial(additive, boost = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { scale: { value: 400 }, boost: { value: boost } }, vertexShader: VS, fragmentShader: FS,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}
const tmpC = new THREE.Color();

class Pool {
  constructor(max, additive, boost) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max); this.grav = new Float32Array(max); this.size0 = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.points = new THREE.Points(g, pointsMaterial(additive, boost));
    this.points.frustumCulled = false; this.points.renderOrder = 5;
  }
  add(x, y, z, vx, vy, vz, color, size, life, grav) {
    let i = this.n < this.max ? this.n++ : Math.floor(Math.random() * this.max);
    this.pos.set([x, y, z], i * 3); this.vel.set([vx, vy, vz], i * 3);
    tmpC.set(color); this.col.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
    this.size[i] = this.size0[i] = size; this.life[i] = this.maxLife[i] = life; this.grav[i] = grav; this.alpha[i] = 1;
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        const j = --this.n;
        if (i !== j) {
          for (let k = 0; k < 3; k++) { this.pos[i * 3 + k] = this.pos[j * 3 + k]; this.vel[i * 3 + k] = this.vel[j * 3 + k]; this.col[i * 3 + k] = this.col[j * 3 + k]; }
          this.size[i] = this.size[j]; this.size0[i] = this.size0[j]; this.life[i] = this.life[j]; this.maxLife[i] = this.maxLife[j]; this.grav[i] = this.grav[j]; this.alpha[i] = this.alpha[j];
          i--;
        }
        continue;
      }
      this.vel[i * 3 + 1] -= this.grav[i] * dt;
      const drag = Math.exp(-2.2 * dt);
      for (let k = 0; k < 3; k++) { if (k !== 1) this.vel[i * 3 + k] *= drag; this.pos[i * 3 + k] += this.vel[i * 3 + k] * dt; }
      const t = this.life[i] / this.maxLife[i];
      this.alpha[i] = Math.min(1, t * 2.5);
      this.size[i] = this.size0[i] * (0.4 + 0.6 * t);
    }
    const g = this.points.geometry;
    g.setDrawRange(0, this.n);
    for (const a of ['position', 'color', 'size', 'alpha']) g.attributes[a].needsUpdate = true;
  }
}

export class FX {
  constructor(scene) {
    this.scene = scene;
    this.glow = new Pool(900, true, 2.2);
    this.soft = new Pool(400, false, 1);
    scene.add(this.glow.points, this.soft.points);
    this.ambient = [];
  }
  setScale(renderer, camera) {
    const h = renderer.getDrawingBufferSize(new THREE.Vector2()).y;
    const s = h / (2 * Math.tan((camera.fov * Math.PI) / 360));
    this.glow.points.material.uniforms.scale.value = s;
    this.soft.points.material.uniforms.scale.value = s;
    for (const a of this.ambient) a.points.material.uniforms.scale.value = s;
  }
  burst(p, o = {}) {
    const n = o.count || 16, sp = o.speed || 5, color = o.color || '#ffffff';
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, r = Math.sqrt(1 - u * u);
      const s = sp * (0.4 + Math.random() * 0.6);
      (o.soft ? this.soft : this.glow).add(p.x, p.y, p.z, Math.cos(a) * r * s, Math.abs(u) * s * (o.up == null ? 1 : o.up) + (o.lift || 0), Math.sin(a) * r * s,
        Array.isArray(color) ? color[i % color.length] : color, (o.size || 0.25) * (0.6 + Math.random() * 0.8), (o.life || 0.8) * (0.6 + Math.random() * 0.6), o.gravity == null ? 6 : o.gravity);
    }
  }
  dust(pos, n = 6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2;
      this.soft.add(pos.x + Math.cos(a) * 0.3, pos.y - 0.85, pos.z + Math.sin(a) * 0.3, Math.cos(a) * s, 0.6 + Math.random(), Math.sin(a) * s, '#d8d2e8', 0.35 + Math.random() * 0.25, 0.45 + Math.random() * 0.3, 1);
    }
  }
  ring(pos, color) {
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; this.glow.add(pos.x, pos.y - 0.8, pos.z, Math.cos(a) * 5, -0.5, Math.sin(a) * 5, color, 0.22, 0.35, 0); }
  }
  // ambient motes: fireflies, embers, snow, sparkles drifting inside a box
  addAmbient(o) {
    const n = o.count || 80, area = o.area || [40, 10, 40], c = o.pos || [0, 0, 0];
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), alpha = new Float32Array(n), seed = new Float32Array(n);
    const colors = [].concat(o.color || '#fff6b0');
    for (let i = 0; i < n; i++) {
      pos.set([c[0] + (Math.random() - 0.5) * area[0], c[1] + Math.random() * area[1], c[2] + (Math.random() - 0.5) * area[2]], i * 3);
      tmpC.set(colors[i % colors.length]); col.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
      size[i] = (o.size || 0.18) * (0.6 + Math.random() * 0.8); alpha[i] = 1; seed[i] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(size, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
    const points = new THREE.Points(g, pointsMaterial(o.additive !== false, o.boost || 2));
    points.frustumCulled = false;
    const sys = { points, n, pos, alpha, seed, c, area, kind: o.kind || 'float', speed: o.speed || 1 };
    this.ambient.push(sys);
    return sys;
  }
  clearAmbient() { for (const a of this.ambient) { a.points.removeFromParent(); a.points.geometry.dispose(); a.points.material.dispose(); } this.ambient = []; }
  update(dt, t) {
    this.glow.update(dt); this.soft.update(dt);
    for (const s of this.ambient) {
      const { pos, alpha, seed, c, area, n } = s;
      for (let i = 0; i < n; i++) {
        const k = seed[i];
        if (s.kind === 'snow' || s.kind === 'rise') {
          const dir = s.kind === 'snow' ? -1 : 1;
          pos[i * 3 + 1] += dir * s.speed * dt * (0.6 + (k % 1));
          pos[i * 3] += Math.sin(t * 0.7 + k) * dt * 0.4;
          if (pos[i * 3 + 1] < c[1]) pos[i * 3 + 1] = c[1] + area[1];
          if (pos[i * 3 + 1] > c[1] + area[1]) pos[i * 3 + 1] = c[1];
          alpha[i] = 0.75;
        } else {
          pos[i * 3] += Math.sin(t * 0.5 * s.speed + k) * dt * 0.5;
          pos[i * 3 + 1] += Math.cos(t * 0.7 * s.speed + k * 1.3) * dt * 0.3;
          pos[i * 3 + 2] += Math.sin(t * 0.6 * s.speed + k * 0.7) * dt * 0.5;
          alpha[i] = 0.45 + 0.55 * Math.max(0, Math.sin(t * 1.7 + k * 3));
        }
      }
      s.points.geometry.attributes.position.needsUpdate = true;
      s.points.geometry.attributes.alpha.needsUpdate = true;
    }
  }
}

const PORTAL_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const PORTAL_FS = `uniform float t; uniform vec3 c1; uniform vec3 c2; uniform float locked; varying vec2 vUv;
void main(){
  vec2 p = vUv * 2.0 - 1.0; float r = length(p); if (r > 1.0) discard;
  float a = atan(p.y, p.x);
  float sw = 0.5 + 0.5 * sin(a * 3.0 + r * 9.0 - t * 2.2);
  float sw2 = 0.5 + 0.5 * sin(a * 5.0 - r * 14.0 + t * 1.7);
  vec3 col = mix(c1, c2, sw * 0.7 + sw2 * 0.3);
  col *= 0.55 + 0.9 * (1.0 - r) * sw;
  col += c2 * smoothstep(0.82, 1.0, r) * 1.2;
  col = mix(col, vec3(dot(col, vec3(0.33))) * 0.35, locked);
  gl_FragColor = vec4(col * 1.5, 0.94);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export function portalMaterial(c1, c2) {
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, c1: { value: new THREE.Color(c1) }, c2: { value: new THREE.Color(c2) }, locked: { value: 0 } },
    vertexShader: PORTAL_VS, fragmentShader: PORTAL_FS, transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
}
