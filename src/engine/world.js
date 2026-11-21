// World runtime + the World API.
// A world is a module: `export default { id, name, theme, rules, items, spawn, build(w) }`.
// `build` receives `w`, the only surface a world touches. Everything a world creates goes
// through it, so worlds stay portable and can later run sandboxed.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Physics, RAPIER } from './physics.js';
import { mat, labelSprite, textCanvas, canvasTexture } from './render.js';
import { buildLook, items, traitAllowed } from './items.js';
import { createAvatar } from './avatar.js';
import { portalMaterial } from './fx.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { DEG, rng, clamp, damp, dampAngle, fmtTime } from './util.js';

const UNIT = {};
const keep = (g) => { g.userData.keep = true; return g; };
const GEN = {
  box: () => new THREE.BoxGeometry(1, 1, 1),
  cyl: () => new THREE.CylinderGeometry(1, 1, 1, 28),
  cyl6: () => new THREE.CylinderGeometry(1, 1, 1, 6),
  cyl8: () => new THREE.CylinderGeometry(1, 1, 1, 8),
  sphere: () => new THREE.SphereGeometry(1, 28, 18),
  ico: () => new THREE.IcosahedronGeometry(1, 0),
  cone: () => new THREE.ConeGeometry(1, 1, 24),
  ramp: () => {
    // wedge: full height at +z, zero at -z, unit size, centred
    const v = [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]];
    const f = [[0, 2, 1], [0, 3, 2], [3, 4, 5], [3, 5, 2], [0, 1, 5], [0, 5, 4], [0, 4, 3], [1, 2, 5]];
    const pos = [];
    for (const t of f) for (const i of t) pos.push(...v[i]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
    g.computeVertexNormals();
    return g;
  },
};
const unit = (k) => UNIT[k] || (UNIT[k] = keep(GEN[k]()));

const v3 = (a, d = [0, 0, 0]) => new THREE.Vector3(...(a || d));
const quatOf = (o) => {
  const e = new THREE.Euler(((o.rot && o.rot[0]) || 0) * DEG, ((o.rot && o.rot[1]) || o.yaw || 0) * DEG, ((o.rot && o.rot[2]) || 0) * DEG, 'YXZ');
  return new THREE.Quaternion().setFromEuler(e);
};

export class WorldRuntime {
  constructor(engine, entry, mod) {
    this.e = engine; this.entry = entry; this.mod = mod; this.id = entry.id;
    this.rules = mod.rules || {};
    this.group = new THREE.Group(); this.group.name = 'world:' + this.id;
    this.P = new Physics(-24);
    this.statics = []; this.movers = []; this.crumbles = []; this.zones = []; this.interactables = []; this.portals = [];
    this.coins = []; this.pickups = []; this.spinners = []; this.npcs = []; this.dynamics = []; this.handlers = {}; this.lights = [];
    this.time = 0; this.ticks = 0; this.killY = mod.killY == null ? -60 : mod.killY;
    this.timer = { running: false, t0: 0, elapsed: 0, shown: false };
    this.save = profile.world(this.id);
    this.w = this.makeApi();
  }

  async build() {
    this.e.scene.add(this.group);
    this.e.render.applyTheme(this.mod.theme || {});
    audio.music(this.mod.music || null);
    if (this.mod.build) await this.mod.build(this.w);
    this.bake();
    this.built = true;
    this.P.step(); // let scene queries see everything we just built
  }

  // merge every untouched static mesh by material: hundreds of parts become a handful of draw calls
  bake() {
    const byMat = new Map();
    for (const s of this.statics) {
      if (s.claimed || !s.mesh || s.mesh.material.transparent) continue;
      s.mesh.updateMatrixWorld(true);
      const g = s.mesh.geometry.index ? s.mesh.geometry.toNonIndexed() : s.mesh.geometry.clone();
      g.applyMatrix4(s.mesh.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!byMat.has(s.mesh.material)) byMat.set(s.mesh.material, []);
      byMat.get(s.mesh.material).push(g);
      s.mesh.removeFromParent(); s.mesh = null;
    }
    for (const [m, list] of byMat) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, m); mesh.castShadow = true; mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  emit(name, ...args) { for (const f of this.handlers[name] || []) { try { f(...args); } catch (e) { console.error(`[${this.id}] ${name} handler`, e); } } }

  // ---- fixed tick (60 Hz) ----
  preTick(dt) {
    for (const m of this.movers) m.step(dt);
  }
  postTick(dt) {
    this.time += dt; this.ticks++;
    const pl = this.e.player, p = pl.pos;
    for (const z of this.zones) {
      if (!z.enabled) { z.inside = false; continue; }
      let inside;
      if (z.r) inside = (p.x - z.c.x) ** 2 + (p.y - z.c.y) ** 2 + (p.z - z.c.z) ** 2 < z.r * z.r;
      else inside = Math.abs(p.x - z.c.x) < z.h.x && Math.abs(p.y - z.c.y) < z.h.y && Math.abs(p.z - z.c.z) < z.h.z;
      if (inside && !z.inside) { z.inside = true; z.onEnter && z.onEnter(); if (z.once) z.enabled = false; }
      else if (!inside && z.inside) { z.inside = false; z.onExit && z.onExit(); }
      if (inside && z.onStay) z.onStay(dt);
    }
    for (const c of this.crumbles) c.step(dt);
    if (p.y < this.killY) { this.emit('fall'); pl.respawn(); }
    this.emit('tick', dt);
  }

  // ---- per rendered frame (visual only) ----
  frame(dt, t, alpha) {
    for (const m of this.movers) if (m.mesh) m.mesh.position.lerpVectors(m.prev, m.cur, alpha);
    for (const c of this.coins) if (c.mesh.visible) { c.mesh.rotation.y += dt * 3; c.mesh.position.y = c.y + Math.sin(t * 2 + c.y) * 0.12; }
    for (const pk of this.pickups) if (pk.group.visible) { pk.look.rotation.y += dt * 1.2; pk.look.position.y = Math.sin(t * 2) * 0.15; }
    for (const s of this.spinners) s.obj.rotation[s.axis] += dt * s.speed;
    for (const pt of this.portals) pt.mat.uniforms.t.value = t;
    for (const d of this.dynamics) { const tr = d.body.translation(), r = d.body.rotation(); d.mesh.position.set(tr.x, tr.y, tr.z); d.mesh.quaternion.set(r.x, r.y, r.z, r.w); if (tr.y < this.killY) { d.body.setTranslation(d.home, true); d.body.setLinvel({ x: 0, y: 0, z: 0 }, true); } }
    const pp = this.e.player.renderPos;
    for (const n of this.npcs) {
      const dx = pp.x - n.pos.x, dz = pp.z - n.pos.z, near = dx * dx + dz * dz < 64;
      n.avatar.root.rotation.y = dampAngle(n.avatar.root.rotation.y, near ? Math.atan2(dx, dz) : n.yaw, 4, dt);
      n.avatar.animate({ speed: 0, grounded: true, vy: 0, groundDist: 0 }, dt);
      if (n.wave) n.avatar.handR.position.y = 1.0 + Math.sin(t * 8) * 0.12;
    }
    if (this.timer.running) this.e.ui.timer(fmtTime(this.time - this.timer.t0), true);
    this.emit('frame', dt, t);
  }

  dispose() {
    this.emit('leave');
    this.group.traverse((o) => {
      if (o.geometry && !o.geometry.userData.keep && !o.isSprite) o.geometry.dispose();
      if (o.isSprite && o.material.map) { o.material.map.dispose(); o.material.dispose(); }
      if (o.material && o.material.isShaderMaterial) o.material.dispose();
    });
    this.group.removeFromParent();
    this.e.fx.clearAmbient();
    this.P.free();
    this.e.ui.timer('', false); this.e.ui.objective('');
  }

  spawnFor(fromId) {
    const back = fromId && this.portals.find((p) => p.to === fromId);
    if (back) {
      const f = new THREE.Vector3(Math.sin(back.yaw), 0, Math.cos(back.yaw));
      // arrive a few steps in front of the portal you came through, facing away from it
      return { pos: back.pos.clone().addScaledVector(f, back.arrive || 7).add(new THREE.Vector3(0, 1.0, 0)), yaw: back.yaw };
    }
    const s = this.mod.spawn || {};
    return { pos: v3(s.pos, [0, 2, 0]), yaw: ((s.yaw == null ? 180 : s.yaw) * DEG) };
  }

  // ---------------- the World API ----------------
  makeApi() {
    const rt = this, e = this.e, P = this.P, G = this.group;
    const addMesh = (geo, m, o) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.copy(v3(o.pos));
      mesh.quaternion.copy(quatOf(o));
      mesh.castShadow = o.shadow !== false; mesh.receiveShadow = true;
      G.add(mesh);
      return mesh;
    };
    const material = (o) => mat(o.color || '#8a8fa8', { glow: o.glow, metal: o.metal, rough: o.rough, opacity: o.opacity, flat: o.flat });
    const solid = (shape, o, geo, scale, colDesc) => {
      const mesh = addMesh(geo, material(o), o);
      mesh.scale.copy(scale);
      const t = { kind: shape, mesh, col: null, o, claimed: false };
      if (o.collide !== false) t.col = P.addStatic(colDesc(), mesh.position, mesh.quaternion, o.tag ? { tag: o.tag } : null);
      t.remove = () => { if (t.col) P.world.removeCollider(t.col, false); t.col = null; if (t.mesh) t.mesh.removeFromParent(); t.claimed = true; };
      t.hide = () => { if (t.mesh) t.mesh.visible = false; if (t.col) t.col.setEnabled(false); t.claimed = true; };
      t.show = () => { if (t.mesh) t.mesh.visible = true; if (t.col) t.col.setEnabled(true); };
      if (rt.built) t.claimed = true;
      if (o.dynamic || o.id) t.claimed = true;
      rt.statics.push(t);
      return t;
    };
    const zone = (o) => {
      const z = { c: v3(o.pos), r: o.radius || 0, h: o.size ? new THREE.Vector3(o.size[0] / 2, o.size[1] / 2, o.size[2] / 2) : null, inside: false, enabled: true, onEnter: o.onEnter, onExit: o.onExit, onStay: o.onStay, once: !!o.once };
      if (!z.r && !z.h) z.r = 1.5;
      rt.zones.push(z);
      return z;
    };
    const interact = (o) => {
      const it = { pos: v3(o.pos), radius: o.radius || 2.6, label: o.label || 'Use', onUse: o.onUse, enabled: true };
      rt.interactables.push(it);
      return it;
    };
    const pl = e.player;
    const playerApi = {
      get pos() { return [pl.pos.x, pl.pos.y, pl.pos.z]; },
      get vel() { return [pl.vel.x, pl.vel.y, pl.vel.z]; },
      get yaw() { return pl.yaw / DEG; },
      get grounded() { return pl.grounded; },
      get board() { return pl.board; },
      get speed() { return Math.hypot(pl.vel.x, pl.vel.z); },
      setPos(p, yawDeg) { pl.place(v3(p), yawDeg == null ? pl.yaw : yawDeg * DEG); e.camRig.snap(pl); },
      launch(vy, vx, vz) { pl.launch(vy, vx, vz); },
      push(v) { pl.push.x += v[0]; pl.push.y += v[1]; pl.push.z += v[2]; },
      boost(sec, speed) { pl.boost(sec, speed); },
      respawn() { pl.respawn(); },
      setCheckpoint(p, yawDeg) { pl.checkpoint.pos.copy(v3(p)); if (yawDeg != null) pl.checkpoint.yaw = yawDeg * DEG; },
      freeze(on) { pl.frozen = !!on; },
      forceBoard(on) { pl.forceBoard = !!on; if (on) pl.setBoard(true); else if (!pl.abil.board) pl.setBoard(false); },
      canUse(trait) { return pl.abil[trait] === true || (trait === 'speed' && pl.abil.speed > 1); },
    };

    const w = {
      THREE, id: rt.id, get name() { return rt.mod.name; }, get time() { return rt.time; }, get ticks() { return rt.ticks; },
      scene: G, player: playerApi, rules: rt.rules,
      rand: (seed) => rng(seed == null ? 12345 : seed),
      mat: (color, o) => mat(color, o || {}),
      deg: DEG,

      // ---------- building blocks ----------
      box(o) {
        const s = o.size || [1, 1, 1];
        return solid('box', o, o.round ? unit('box') : unit('box'), new THREE.Vector3(...s), () => RAPIER.ColliderDesc.cuboid(s[0] / 2, s[1] / 2, s[2] / 2));
      },
      cylinder(o) {
        const r = o.radius || 1, h = o.height || 1;
        const geo = unit(o.sides === 6 ? 'cyl6' : o.sides === 8 ? 'cyl8' : 'cyl');
        return solid('cyl', o, geo, new THREE.Vector3(r, h, r), () => RAPIER.ColliderDesc.cylinder(h / 2, r));
      },
      sphere(o) {
        const r = o.radius || 1;
        return solid('sphere', o, unit(o.low ? 'ico' : 'sphere'), new THREE.Vector3(r, r, r), () => RAPIER.ColliderDesc.ball(r));
      },
      cone(o) {
        const r = o.radius || 1, h = o.height || 2;
        return solid('cone', o, unit('cone'), new THREE.Vector3(r, h, r), () => RAPIER.ColliderDesc.cone(h / 2, r));
      },
      // wedge rising toward its local +z; size = [width, height, length]
      ramp(o) {
        const s = o.size || [2, 1, 4];
        const pts = [];
        for (const [x, y, z] of [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]]) pts.push(x * s[0], y * s[1], z * s[2]);
        return solid('ramp', o, unit('ramp'), new THREE.Vector3(...s), () => RAPIER.ColliderDesc.convexHull(new Float32Array(pts)));
      },
      // decoration only (no collision): any data-described look, same format as items
      model(o) {
        const g = buildLook(o.parts || []);
        g.position.copy(v3(o.pos)); g.quaternion.copy(quatOf(o));
        if (o.scale) g.scale.setScalar(o.scale);
        G.add(g);
        return { group: g, remove: () => g.removeFromParent() };
      },
      // custom three.js object (decoration). Escape hatch for anything the API lacks.
      add(obj) { G.add(obj); return obj; },

      // ---------- motion ----------
      // Turn a part into a moving platform following `path` (list of positions), ping-pong by default.
      mover(t, o) {
        t.claimed = true;
        const path = (o.path || []).map((p) => v3(p));
        if (path.length < 2) throw new Error('mover needs a path of 2+ points');
        if (t.col) P.world.removeCollider(t.col, false);
        const shape = t.kind === 'box' ? RAPIER.ColliderDesc.cuboid(t.mesh.scale.x / 2, t.mesh.scale.y / 2, t.mesh.scale.z / 2)
          : t.kind === 'cyl' ? RAPIER.ColliderDesc.cylinder(t.mesh.scale.y / 2, t.mesh.scale.x) : RAPIER.ColliderDesc.ball(t.mesh.scale.x);
        const info = { delta: new THREE.Vector3() };
        const k = P.addKinematic(shape, path[0], t.mesh.quaternion, info);
        t.col = k.col; t.body = k.body;
        const lens = []; let total = 0;
        for (let i = 1; i < path.length; i++) { const l = path[i].distanceTo(path[i - 1]); lens.push(l); total += l; }
        const loop = o.loop === true;
        const speed = o.speed || 2, pause = o.pause == null ? 0.6 : o.pause;
        const m = {
          mesh: t.mesh, prev: path[0].clone(), cur: path[0].clone(), s: (o.offset || 0) * total, dir: 1, wait: 0,
          step(dt) {
            this.prev.copy(this.cur);
            if (this.wait > 0) this.wait -= dt;
            else {
              this.s += this.dir * speed * dt;
              if (loop) this.s = ((this.s % total) + total) % total;
              else if (this.s >= total) { this.s = total; this.dir = -1; this.wait = pause; }
              else if (this.s <= 0) { this.s = 0; this.dir = 1; this.wait = pause; }
            }
            let d = this.s, i = 0;
            while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++; }
            const a = lens[i] ? d / lens[i] : 0;
            const target = loop && i === lens.length ? path[0] : path[i + 1];
            this.cur.lerpVectors(path[i], target, clamp(a, 0, 1));
            info.delta.subVectors(this.cur, this.prev);
            k.body.setNextKinematicTranslation(this.cur);
          },
        };
        if (loop) { path.push(path[0].clone()); lens.push(path[path.length - 2].distanceTo(path[0])); total += lens[lens.length - 1]; }
        t.mesh.position.copy(path[0]);
        rt.movers.push(m);
        return t;
      },
      // Platform that falls away shortly after you land on it, then comes back.
      crumble(t, o = {}) {
        t.claimed = true;
        const delay = o.delay == null ? 0.55 : o.delay, back = o.respawn == null ? 3 : o.respawn;
        const home = t.mesh.position.clone();
        const solidMat = t.mesh.material, fade = solidMat.clone(); fade.transparent = true; fade.depthWrite = false;
        const c = {
          timer: -1, down: 0,
          step(dt) {
            if (this.down > 0) {
              this.down -= dt; t.mesh.position.y -= dt * 9;
              fade.opacity = Math.max(0, 1 - (back - this.down) * 2.5); t.mesh.material = fade;
              if (this.down <= 0) { t.mesh.position.copy(home); t.mesh.material = solidMat; t.col.setEnabled(true); t.mesh.visible = true; }
              return;
            }
            if (this.timer < 0 && e.player.grounded && e.player.standing === t.col.handle) { this.timer = delay; audio.play('crumble'); }
            if (this.timer >= 0) {
              this.timer -= dt;
              t.mesh.position.set(home.x + (Math.random() - 0.5) * 0.08, home.y, home.z + (Math.random() - 0.5) * 0.08);
              if (this.timer < 0) { t.col.setEnabled(false); this.down = back; this.timer = -1; }
            }
          },
        };
        rt.crumbles.push(c);
        return t;
      },
      spin(obj, o = {}) { const target = obj.mesh || obj.group || obj; rt.spinners.push({ obj: target, axis: o.axis || 'y', speed: o.speed == null ? 1 : o.speed }); if (obj.claimed !== undefined) obj.claimed = true; return obj; },

      // ---------- gameplay pieces ----------
      zone, interact,
      jumpPad(o) {
        const p = v3(o.pos), color = o.color || '#ffcf3f', r = o.radius || 1.1;
        w.cylinder({ pos: [p.x, p.y + 0.15, p.z], radius: r * 1.15, height: 0.3, color: '#2a2d3e' });
        const top = addMesh(unit('cyl'), mat(color, { glow: 1.6 }), { pos: [p.x, p.y + 0.34, p.z] }); top.scale.set(r, 0.08, r);
        const ring = addMesh(unit('cyl'), mat(color, { glow: 0.8, opacity: 0.35 }), { pos: [p.x, p.y + 1.2, p.z] }); ring.scale.set(r * 0.8, 1.6, r * 0.8);
        let cool = 0;
        zone({ pos: [p.x, p.y + 0.9, p.z], size: [r * 2, 1.4, r * 2], onStay: () => {
          if (cool > rt.time || e.player.vel.y > 2) return;
          cool = rt.time + 0.25;
          e.player.launch(o.power || 17, o.push ? o.push[0] : undefined, o.push ? o.push[2] : undefined);
          audio.play('pad'); e.fx.burst(new THREE.Vector3(p.x, p.y + 0.6, p.z), { color, count: 14, speed: 4, life: 0.5 });
          top.scale.y = 0.25; setTimeout(() => { top.scale.y = 0.08; }, 120);
        } });
      },
      boostPad(o) {
        const p = v3(o.pos), color = o.color || '#00f5d4', yaw = (o.yaw || 0) * DEG;
        const g = new THREE.Group(); g.position.copy(p); g.rotation.y = yaw; G.add(g);
        for (let i = 0; i < 3; i++) {
          const chev = new THREE.Mesh(unit('box'), mat(color, { glow: 2.2 }));
          chev.scale.set(1.6, 0.06, 0.35); chev.position.set(0, 0.05, -0.8 + i * 0.8);
          const l = chev.clone(); l.scale.set(1.1, 0.06, 0.3); l.position.set(-0.45, 0.05, chev.position.z - 0.2); l.rotation.y = -0.6;
          const r = chev.clone(); r.scale.set(1.1, 0.06, 0.3); r.position.set(0.45, 0.05, chev.position.z - 0.2); r.rotation.y = 0.6;
          g.add(l, r);
        }
        let cool = 0;
        zone({ pos: [p.x, p.y + 1, p.z], size: [o.width || 3.2, 2, 3.2], onStay: () => {
          if (cool > rt.time) return; cool = rt.time + 0.5;
          if (e.player.board) e.player.heading = dampAngle(e.player.heading, yaw, 4, 0.1);
          e.player.boost(o.time || 1.2, o.power || 34); audio.play('boost'); e.camRig.shake(0.15);
        } });
      },
      checkpoint(o) {
        const p = v3(o.pos), color = o.color || '#7cf6ff';
        const base = addMesh(unit('cyl8'), mat('#30344a', { metal: 0.3 }), { pos: [p.x, p.y + 0.2, p.z] }); base.scale.set(0.7, 0.4, 0.7);
        const pole = addMesh(unit('cyl'), mat('#9aa3c0', { metal: 0.6 }), { pos: [p.x, p.y + 1.5, p.z] }); pole.scale.set(0.08, 2.4, 0.08);
        const gem = addMesh(unit('ico'), mat('#555a70', { glow: 0 }), { pos: [p.x, p.y + 3, p.z] }); gem.scale.setScalar(0.32);
        rt.spinners.push({ obj: gem, axis: 'y', speed: 1.5 });
        const cp = { active: false, light() { gem.material = mat(color, { glow: 2.4 }); } };
        zone({ pos: [p.x, p.y + 1.2, p.z], radius: o.radius || 2.2, onEnter: () => {
          e.player.checkpoint.pos.set(p.x, p.y + 1.0, p.z);
          e.player.checkpoint.yaw = o.yaw == null ? e.player.yaw : o.yaw * DEG;
          if (!cp.active) { cp.active = true; cp.light(); audio.play('checkpoint'); e.fx.burst(new THREE.Vector3(p.x, p.y + 3, p.z), { color, count: 24, speed: 6 }); rt.emit('checkpoint', o.id); }
        } });
        return cp;
      },
      coin(o) {
        const p = v3(o.pos), id = o.id || 'c' + rt.coins.length, gem = o.kind === 'gem';
        const got = !!rt.save.coins[id];
        const geo = gem ? unit('ico') : unit('cyl');
        const colr = o.color || (gem ? '#62f0ff' : '#ffc93c');
        const mesh = new THREE.Mesh(geo, got ? mat(colr, { opacity: 0.25 }) : mat(colr, { glow: gem ? 1.4 : 0.6, metal: gem ? 0 : 0.7, rough: 0.3 }));
        if (gem) mesh.scale.set(0.28, 0.4, 0.28); else { mesh.scale.set(0.36, 0.07, 0.36); mesh.rotation.x = Math.PI / 2; }
        const holder = new THREE.Group(); holder.position.copy(p); holder.add(mesh); G.add(holder);
        const c = { id, mesh: holder, y: p.y, got, value: o.value || 1 };
        rt.coins.push(c);
        zone({ pos: o.pos, radius: 1.1, once: true, onEnter: () => {
          holder.visible = false;
          if (!c.got) { c.got = true; rt.save.coins[id] = 1; e.addCoins(c.value); }
          audio.play(gem ? 'gem' : 'coin');
          e.fx.burst(p, { color: colr, count: 10, speed: 3, life: 0.5, gravity: 2 });
          rt.emit('coin', id);
        } });
        return c;
      },
      pickup(o) {
        const def = items.get(o.item);
        if (!def) throw new Error('unknown item ' + o.item);
        const p = v3(o.pos);
        const group = new THREE.Group(); group.position.copy(p); G.add(group);
        const look = buildLook(def.look); look.scale.setScalar(o.scale || 1.6); group.add(look);
        const halo = new THREE.Mesh(unit('cyl'), mat('#ffffff', { glow: 0.9, opacity: 0.25 })); halo.scale.set(0.9, 0.04, 0.9); halo.position.y = -0.9; group.add(halo);
        const pk = { group, look, item: o.item };
        rt.pickups.push(pk);
        const owned = () => (profile.data.inv[o.item] || 0) > 0;
        if (o.once !== false && owned()) { group.visible = false; return pk; }
        zone({ pos: o.pos, radius: o.radius || 1.4, onEnter: () => {
          if (!group.visible) return;
          if (o.once !== false && owned()) { group.visible = false; return; }
          group.visible = false;
          e.giveItem(o.item);
          e.fx.burst(p, { color: ['#ffffff', '#ffe066', '#7cf6ff'], count: 40, speed: 7, life: 1 });
          if (o.onPick) o.onPick();
          rt.emit('pickup', o.item);
        } });
        return pk;
      },
      portal(o) {
        const p = v3(o.pos), yaw = (o.yaw || 0) * DEG, size = o.size || 2.4;
        const target = e.registry.worlds.find((x) => x.id === o.to);
        const color = o.color || (target && target.color) || '#9d7bff';
        const g = new THREE.Group(); g.position.copy(p); g.rotation.y = yaw; G.add(g);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(size, 0.22, 12, 48), mat(color, { glow: 2.2 }));
        ring.position.y = size + 0.3; g.add(ring);
        const frame = new THREE.Mesh(new THREE.TorusGeometry(size + 0.38, 0.14, 8, 48), mat('#2c3048', { metal: 0.6, rough: 0.4 }));
        frame.position.y = size + 0.3; g.add(frame);
        const pm = portalMaterial(o.color2 || '#1a1440', color);
        const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 48), pm); disc.position.y = size + 0.3; g.add(disc);
        const base = new THREE.Mesh(unit('box'), mat('#262a3d', { metal: 0.3 })); base.scale.set((size + 0.9) * 2, 0.3, 2.6); base.position.y = 0.15; base.castShadow = base.receiveShadow = true; g.add(base);
        const trim = new THREE.Mesh(unit('box'), mat(color, { glow: 1.6 })); trim.scale.set((size + 0.9) * 2 + 0.05, 0.06, 2.65); trim.position.y = 0.3; g.add(trim);
        P.addStatic(RAPIER.ColliderDesc.cuboid(size + 0.9, 0.15, 1.3), new THREE.Vector3(p.x, p.y + 0.15, p.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw));
        const label = labelSprite(o.label || (target ? target.name : o.to), { size: 0.7, color: '#ffffff', border: color });
        label.position.set(p.x, p.y + size * 2 + 1.5, p.z); G.add(label);
        if (o.subtitle || (target && target.blurb)) {
          const sub = labelSprite(o.subtitle || target.blurb, { size: 0.32, color: '#d8dcff', bg: 'rgba(8,10,26,0.5)', fontSize: 30 });
          sub.position.set(p.x, p.y + size * 2 + 0.85, p.z); G.add(sub);
        }
        const pt = { pos: p, yaw, to: o.to, mat: pm, locked: false, arrive: o.arrive };
        rt.portals.push(pt);
        const f = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        zone({ pos: [p.x + f.x * 0.1, p.y + size + 0.3, p.z + f.z * 0.1], size: [Math.abs(Math.cos(yaw)) * size * 1.6 + 0.9, size * 1.8, Math.abs(Math.sin(yaw)) * size * 1.6 + 0.9], onEnter: () => {
          if (pt.locked) { e.toast(o.lockedText || 'This portal is sealed.'); return; }
          if (o.requires && !o.requires()) { e.toast(o.lockedText || 'Not yet.'); return; }
          e.travel(o.to, { from: rt.id });
        } });
        pt.lock = (on) => { pt.locked = on; pm.uniforms.locked.value = on ? 1 : 0; };
        return pt;
      },
      npc(o) {
        const p = v3(o.pos);
        const av = createAvatar(Object.assign({ body: '#ffaa5c', head: '#fff3e0', visor: '#5ce1ff' }, o.colors || {}), { eq: { head: o.hat || null, hand: o.hand || null }, name: o.name, nameColor: o.nameColor || '#ffe9a8' });
        av.root.position.set(p.x, p.y, p.z); av.root.rotation.y = (o.yaw || 0) * DEG; G.add(av.root);
        P.addStatic(RAPIER.ColliderDesc.capsule(0.5, 0.4), new THREE.Vector3(p.x, p.y + 0.9, p.z), null);
        const n = { avatar: av, pos: p, yaw: (o.yaw || 0) * DEG, wave: !!o.wave };
        rt.npcs.push(n);
        interact({ pos: o.pos, radius: o.radius || 3, label: o.label || `Talk to ${o.name}`, onUse: async () => {
          if (o.onTalk) return o.onTalk();
          await e.ui.dialog(o.name, typeof o.lines === 'function' ? o.lines() : o.lines || ['…']);
        } });
        return n;
      },
      sign(o) {
        const p = v3(o.pos), yaw = (o.yaw || 0) * DEG, wd = o.width || 3.2;
        const lines = [o.title || ''].concat(String(o.text || '').split('\n')).filter((x, i) => i > 0 || x);
        const c = textCanvas(lines, { width: Math.round(wd * 160), bg: o.bg || '#141a33', color: '#e8ecff', titleColor: o.titleColor || '#ffd166', fontSize: 40, align: 'left', border: o.border || '#3b4570', pad: 30 });
        const hgt = wd * c.height / c.width;
        const g = new THREE.Group(); g.position.copy(p); g.rotation.y = yaw; G.add(g);
        const board = new THREE.Mesh(new THREE.PlaneGeometry(wd, hgt), new THREE.MeshBasicMaterial({ map: canvasTexture(c), toneMapped: false }));
        board.position.y = (o.post === false ? 0 : 1.2) + hgt / 2; board.position.z = 0.07; g.add(board);
        const back = new THREE.Mesh(unit('box'), mat('#2a2f45')); back.scale.set(wd + 0.15, hgt + 0.15, 0.1); back.position.y = board.position.y; back.castShadow = true; g.add(back);
        if (o.post !== false) { const post = new THREE.Mesh(unit('box'), mat('#2a2f45')); post.scale.set(0.16, 1.25, 0.16); post.position.y = 0.6; g.add(post); }
        // solid, so the camera and players don't pass through it
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        P.addStatic(RAPIER.ColliderDesc.cuboid(wd / 2 + 0.07, hgt / 2 + 0.07, 0.07), new THREE.Vector3(p.x, p.y + board.position.y, p.z), q);
        if (o.post !== false) P.addStatic(RAPIER.ColliderDesc.cuboid(0.08, 0.62, 0.08), new THREE.Vector3(p.x, p.y + 0.6, p.z), q);
        if (o.read !== false) interact({ pos: o.pos, radius: 2.8, label: 'Read', onUse: () => e.ui.dialog(o.title || 'Sign', String(o.text || '').split('\n').filter(Boolean)) });
        return { group: g };
      },
      label(o) {
        const s = labelSprite(o.text, { size: o.size || 0.5, color: o.color || '#ffffff', bg: o.bg, border: o.border });
        s.position.copy(v3(o.pos)); G.add(s);
        return s;
      },
      light(o) {
        const l = new THREE.PointLight(o.color || '#ffffff', o.intensity == null ? 20 : o.intensity, o.distance || 18, o.decay || 1.6);
        l.position.copy(v3(o.pos)); G.add(l); rt.lights.push(l);
        return l;
      },
      particles(o) { const s = e.fx.addAmbient(o); G.add(s.points); return s; },
      wind(o) { return zone({ pos: o.pos, size: o.size, onStay: () => playerApi.push(o.force || [0, 0, 0]) }); },
      hazard(o) { return zone({ pos: o.pos, size: o.size, radius: o.radius, onEnter: () => { e.camRig.shake(0.2); e.player.respawn(); } }); },
      ball(o) {
        const r = o.radius || 0.8, p = v3(o.pos);
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), mat(o.color || '#ff5d8f', { flat: true, rough: 0.5 }));
        mesh.castShadow = true; G.add(mesh);
        const d = P.addDynamic(RAPIER.ColliderDesc.ball(r), p, { density: o.density || 0.25, bounce: o.bounce == null ? 0.6 : o.bounce });
        rt.dynamics.push({ mesh, body: d.body, home: p.clone() });
        return d;
      },
      cabinet(o) {
        const p = v3(o.pos), yaw = (o.yaw || 0) * DEG, color = o.color || '#ff4fd8';
        const g = new THREE.Group(); g.position.copy(p); g.rotation.y = yaw; G.add(g);
        const body = new THREE.Mesh(unit('box'), mat('#1b1e33', { rough: 0.5 })); body.scale.set(1.3, 2.4, 1.1); body.position.y = 1.2; body.castShadow = true; g.add(body);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), mat(color, { glow: 1.4 })); screen.position.set(0, 1.65, 0.56); screen.rotation.x = -0.15; g.add(screen);
        const marquee = new THREE.Mesh(unit('box'), mat(color, { glow: 2.4 })); marquee.scale.set(1.3, 0.28, 0.2); marquee.position.set(0, 2.5, 0.48); g.add(marquee);
        const panel = new THREE.Mesh(unit('box'), mat('#2b2f4d')); panel.scale.set(1.3, 0.15, 0.5); panel.position.set(0, 1.05, 0.7); panel.rotation.x = 0.35; g.add(panel);
        P.addStatic(RAPIER.ColliderDesc.cuboid(0.65, 1.2, 0.55), new THREE.Vector3(p.x, p.y + 1.2, p.z), quatOf(o));
        const lab = labelSprite(o.title || 'Arcade', { size: 0.42, border: color }); lab.position.set(p.x, p.y + 3.3, p.z); G.add(lab);
        interact({ pos: o.pos, radius: 2.6, label: o.url ? `Play ${o.title || 'game'}` : (o.title || 'Cabinet'), onUse: () => (o.url ? e.ui.cabinet(o.url, o.title, o.onMessage) : e.ui.dialog(o.title || 'Cabinet', [].concat(o.emptyText || 'This cabinet is empty. Any web game can be plugged in here.'))) });
      },

      // ---------- player, items, progress ----------
      give(id, opts) { return e.giveItem(id, opts); },
      has(id) { return (profile.data.inv[id] || 0) > 0; },
      take(id) { if (!profile.data.inv[id]) return false; profile.data.inv[id]--; if (!profile.data.inv[id]) { delete profile.data.inv[id]; for (const s in profile.data.eq) if (profile.data.eq[s] === id) profile.data.eq[s] = null; } e.refreshEquipment(); profile.save(); return true; },
      equip(id) { e.equip(id); },
      coins() { return profile.data.coins; },
      addCoins(n) { e.addCoins(n); },
      spend(n) { if (profile.data.coins < n) return false; e.addCoins(-n); return true; },
      flag(k) { return profile.data.flags[k]; },
      setFlag(k, v) { profile.data.flags[k] = v; profile.save(); e.ui.refreshHud(); },
      store: {
        get: (k, d) => (k in rt.save.store ? rt.save.store[k] : d),
        set: (k, v) => { rt.save.store[k] = v; profile.save(); },
      },
      active(trait) { return traitAllowed(trait, rt.rules); },

      // ---------- UI ----------
      shop: (title, listing) => e.ui.shop(title, listing),
      openPanel: (kind) => e.ui.openPanel(kind),
      toast: (t, kind) => e.toast(t, kind),
      say: (name, lines) => e.ui.dialog(name, [].concat(lines)),
      ask: (name, text, options) => e.ui.choice(name, text, options),
      banner: (title, sub) => e.ui.banner(title, sub),
      objective: (t) => e.ui.objective(t),
      sound: (n) => audio.play(n),
      burst: (pos, o) => e.fx.burst(v3(pos), o || {}),
      shake: (t) => e.camRig.shake(t || 0.3),
      timer: {
        start() { rt.timer.running = true; rt.timer.t0 = rt.time; e.ui.timer('0:00.00', true); },
        stop() { if (!rt.timer.running) return 0; rt.timer.running = false; const el = rt.time - rt.timer.t0; e.ui.timer(fmtTime(el), true, true); return el; },
        cancel() { rt.timer.running = false; e.ui.timer('', false); },
        get running() { return rt.timer.running; },
        get elapsed() { return rt.timer.running ? rt.time - rt.timer.t0 : 0; },
      },
      fmtTime,
      avatar(o = {}) { const a = createAvatar(Object.assign({ body: '#888', head: '#eee', visor: '#0ff' }, o.colors || {}), { eq: o.eq || {}, name: o.name, nameColor: o.nameColor }); G.add(a.root); return a; },
      travel: (id) => e.travel(id, { from: rt.id }),
      get worlds() { return e.registry.worlds.map((x) => ({ id: x.id, name: x.name, blurb: x.blurb, color: x.color, sha256: x.sha256, author: x.author })); },
      on(ev, f) { (rt.handlers[ev] || (rt.handlers[ev] = [])).push(f); },
      setKillY(y) { rt.killY = y; },
    };
    return w;
  }
}
