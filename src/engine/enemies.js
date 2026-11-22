// Enemies (w.enemy): foes for third-person worlds, part of the deterministic simulation.
//
// A foe idles or patrols, notices the player in sight, chases, winds up an attack the player can see coming (step
// back to dodge it, or strike to interrupt it), hits, rests, and gives up past its leash to walk home, healed. The
// player's strike (key 1) knocks it back and stuns it for a moment; a blade hits far harder than bare hands. A
// foe's hit costs hearts and knocks the player back; with none left they wake at their last checkpoint with full
// hearts. Defeated foes can drop coins, once per player (no farming), and stay down or come back after a while.
// Foes walk on whatever is under them (a Rapier ray down), never off a ledge, and stop at walls (a ray ahead).
// The simulation half runs on the fixed tick with detmath and Rapier queries only, so a replay reproduces every
// chase and every hit; the other half (looks, animation, health bars) is visual and runs per rendered frame.
import * as THREE from 'three';

export const FOE_KINDS = {
  slime: { hp: 60, speed: 2.4, sight: 8, reach: 1.2, windup: 0.6, rest: 0.9, damage: 1, radius: 0.5, push: 7, heavy: 1, color: '#6fdc8c' },
  crawler: { hp: 90, speed: 3.4, sight: 10, reach: 1.4, windup: 0.45, rest: 0.8, damage: 1, radius: 0.6, push: 8, heavy: 1.3, color: '#8fd8ff' },
  brute: { hp: 260, speed: 1.6, sight: 9, reach: 2.0, windup: 1.0, rest: 1.4, damage: 2, radius: 1.0, push: 12, heavy: 3, color: '#c9a27a' },
};
export const STRIKE = { reach: 2.3, cd: 0.38, blade: 34, bare: 6, stun: 0.3, knock: 9 };
const DOWN = { x: 0, y: -1, z: 0 };

class Foe {
  constructor(rt, o, n) {
    this.kind = FOE_KINDS[o.kind] ? o.kind : 'slime';
    this.s = Object.assign({}, FOE_KINDS[this.kind]);
    for (const k of ['hp', 'speed', 'sight', 'reach', 'damage']) if (typeof o[k] === 'number' && isFinite(o[k]) && o[k] > 0) this.s[k] = o[k];
    if (typeof o.color === 'string') this.s.color = o.color;
    this.id = String(o.id || this.kind + '-' + n);
    const p = o.pos || [0, 0, 0];
    this.home = { x: +p[0] || 0, y: +p[1] || 0, z: +p[2] || 0 };
    this.x = this.home.x; this.y = this.home.y; this.z = this.home.z; this.px = this.x; this.py = this.y; this.pz = this.z;
    this.yaw = (+o.yaw || 0) * Math.PI / 180;
    this.hp = this.s.hp; this.state = 'idle'; this.t = 0; this.stun = 0; this.kx = 0; this.kz = 0; this.snapped = false;
    this.leash = typeof o.leash === 'number' ? o.leash : 14;
    this.respawn = typeof o.respawn === 'number' && o.respawn > 0 ? o.respawn : 0; this.respawnT = 0;
    this.patrol = Array.isArray(o.patrol) && o.patrol.length ? o.patrol.map((q) => ({ x: +q[0] || 0, z: +q[1] || 0 })) : null; this.pi = 0;
    this.drops = Math.max(0, Math.min(10, o.drops | 0));
    this.scale = typeof o.scale === 'number' && o.scale > 0 ? o.scale : 1;
    this.hitT = 0; this.lastHit = -99; this.look = null; // (visual)
  }
  get alive() { return this.state !== 'down' && this.state !== 'gone'; }
  go(state) { this.state = state; this.t = 0; }
  revive() { this.x = this.home.x; this.y = this.home.y; this.z = this.home.z; this.px = this.x; this.py = this.y; this.pz = this.z; this.hp = this.s.hp; this.kx = 0; this.kz = 0; this.stun = 0; this.go('idle'); }
  // one step of movement at velocity (vx, vz); false if a ledge or a wall is in the way (then nothing moves)
  move(rt, vx, vz, dt) {
    const nx = this.x + vx * dt, nz = this.z + vz * dt, P = rt.P, skip = rt.e.player.col;
    const g = P.ray({ x: nx, y: this.y + 1, z: nz }, DOWN, 2.6, skip);
    if (!g) return false; // nothing underfoot there: never walk off a ledge
    const gy = this.y + 1 - g.toi;
    if (gy - this.y > 0.5) return false; // a step too high: a wall
    const dx = nx - this.x, dz = nz - this.z, d = Math.hypot(dx, dz);
    if (d > 1e-9 && P.ray({ x: this.x, y: this.y + 0.4, z: this.z }, { x: dx / d, y: 0, z: dz / d }, d + this.s.radius * 0.7, skip)) return false;
    this.x = nx; this.z = nz; this.y = gy;
    return true;
  }
  walk(rt, ux, uz, speed, dt) {
    this.yaw = Math.atan2(ux, uz);
    return this.move(rt, ux * speed, uz * speed, dt) || this.move(rt, ux * speed, 0, dt) || this.move(rt, 0, uz * speed, dt);
  }
  wander(rt, dt) {
    if (!this.patrol) return; // no patrol: it stands guard
    const q = this.patrol[this.pi], dx = q.x - this.x, dz = q.z - this.z, d = Math.hypot(dx, dz);
    if (d < 0.4 || !this.walk(rt, dx / d, dz / d, this.s.speed * 0.55, dt)) this.pi = (this.pi + 1) % this.patrol.length;
  }
  step(rt, dt) {
    const pl = rt.e.player, p = pl.pos, s = this.s;
    this.px = this.x; this.py = this.y; this.pz = this.z;
    if (!this.snapped) { // settle onto the ground under its spawn (the colliders exist by the first tick)
      this.snapped = true;
      const g = rt.P.ray({ x: this.x, y: this.y + 2, z: this.z }, DOWN, 6, pl.col);
      if (g) { this.y = this.y + 2 - g.toi; this.home.y = this.y; this.py = this.y; }
    }
    if (this.state === 'gone') { if (this.respawn) { this.respawnT -= dt; if (this.respawnT <= 0) this.revive(); } return; }
    this.t += dt;
    if (this.state === 'down') { if (this.t >= 0.7) { this.go('gone'); this.respawnT = this.respawn; } return; }
    if (this.kx !== 0 || this.kz !== 0) { // knocked back: it slides, slowing
      this.move(rt, this.kx, this.kz, dt);
      const k = Math.max(0, 1 - dt * 8); this.kx *= k; this.kz *= k;
      if (Math.abs(this.kx) + Math.abs(this.kz) < 0.1) { this.kx = 0; this.kz = 0; }
    }
    if (this.stun > 0) { this.stun -= dt; return; }
    const dx = p.x - this.x, dz = p.z - this.z, dist = Math.hypot(dx, dz), dy = p.y - this.y;
    const seen = dist < s.sight && dy > -2.5 && dy < 3.5;
    const fromHome = Math.hypot(this.x - this.home.x, this.z - this.home.z);
    switch (this.state) {
      case 'idle':
        if (seen) { this.go('chase'); rt.e.audio.play('alert'); } else this.wander(rt, dt);
        break;
      case 'chase':
        if (fromHome > this.leash || dist > s.sight * 1.5 || dy < -3 || dy > 4.5) { this.go('return'); break; }
        if (dist < s.reach + 0.25) { if (dist > 1e-6) this.yaw = Math.atan2(dx, dz); this.go('windup'); break; }
        this.walk(rt, dx / dist, dz / dist, s.speed, dt);
        break;
      case 'windup': // the tell: it stops and gathers itself. Step out of reach before it lands, or strike to interrupt
        if (this.t >= s.windup) { if (dist < s.reach + 0.55 && dy > -1.5 && dy < 2) hurtPlayer(rt, this); this.go('rest'); }
        break;
      case 'rest':
        if (this.t >= s.rest) this.go('chase');
        break;
      case 'return': {
        if (seen && fromHome < this.leash * 0.6) { this.go('chase'); break; }
        const hx = this.home.x - this.x, hz = this.home.z - this.z, hd = Math.hypot(hx, hz);
        if (hd < 0.4 || this.t > 8) { this.revive(); break; } // home (or stuck for 8 s): back to full health
        this.walk(rt, hx / hd, hz / hd, s.speed, dt);
        break;
      }
    }
    // never stand inside the player: the foe steps back (the player is never pushed by this)
    const gap = s.radius * this.scale + 0.45, ex = this.x - p.x, ez = this.z - p.z, ed = Math.hypot(ex, ez);
    if (ed < gap && ed > 1e-6 && Math.abs(dy) < 1.8) this.move(rt, (ex / ed) * (gap - ed) / dt, (ez / ed) * (gap - ed) / dt, dt);
  }
}

function hurtPlayer(rt, f) {
  const pl = rt.e.player;
  if (pl.hurtT > 0 || pl.hearts <= 0) return; // a moment of safety after every hit
  pl.hearts -= f.s.damage; pl.hurtT = 1.1;
  const dx = pl.pos.x - f.x, dz = pl.pos.z - f.z, d = Math.hypot(dx, dz) || 1;
  pl.launch(5, (dx / d) * f.s.push, (dz / d) * f.s.push);
  rt.e.audio.play('hurt'); rt.e.camRig.shake(0.3); if (rt.e.ui.hurt) rt.e.ui.hurt();
  rt.emit('hurt', pl.hearts, f.id);
  if (pl.hearts <= 0) { rt.emit('knockout', f.id); pl.hearts = pl.maxHearts; pl.hurtT = 1.5; pl.respawn(); }
}

function defeat(rt, f) {
  f.hp = 0; f.go('down'); f.kx *= 0.3; f.kz *= 0.3;
  rt.e.audio.play('defeat');
  rt.e.fx.burst(new THREE.Vector3(f.x, f.y + 0.5, f.z), { color: [f.s.color, '#ffffff'], count: 24, speed: 5, life: 0.6, gravity: 4 });
  const mem = rt.save.foes || (rt.save.foes = {}), first = !mem[f.id];
  mem[f.id] = 1;
  if (first && f.drops) for (let i = 0; i < f.drops; i++) { // coins, the first time each foe falls: nothing to farm
    const a = (i / f.drops) * Math.PI * 2;
    rt.w.coin({ id: `foe-${f.id}-${i}`, pos: [f.x + Math.sin(a) * 0.9, f.y + 0.8, f.z + Math.cos(a) * 0.9] });
  }
  rt.emit('defeat', f.id, f.kind);
}

// the player's strike: the nearest foe in reach takes it
function strike(rt) {
  const pl = rt.e.player, p = pl.pos;
  let best = null, bd = Infinity;
  for (const f of rt.foes) {
    if (!f.alive) continue;
    const d = Math.hypot(f.x - p.x, f.z - p.z), dy = f.y - p.y;
    if (d < STRIKE.reach + f.s.radius * f.scale && dy > -1.6 && dy < 1.8 && d < bd) { bd = d; best = f; }
  }
  if (!best) return;
  const hand = rt.e.profile.data.eq.hand, def = hand && rt.e.items.get(hand), blade = !!(def && def.traits && def.traits.includes('blade'));
  best.hp -= blade ? STRIKE.blade : STRIKE.bare;
  best.stun = STRIKE.stun; best.hitT = 0.18; best.lastHit = rt.time;
  const dx = best.x - p.x, dz = best.z - p.z, d = Math.hypot(dx, dz) || 1, k = STRIKE.knock / best.s.heavy;
  best.kx = (dx / d) * k; best.kz = (dz / d) * k;
  if (best.state === 'windup') best.go('rest'); // a strike interrupts its attack
  rt.e.audio.play(blade ? 'slash' : 'land');
  rt.e.fx.burst(new THREE.Vector3(best.x, best.y + 0.6, best.z), { color: blade ? ['#ffe9a8', '#ffffff'] : [best.s.color], count: blade ? 12 : 5, speed: 4, life: 0.35 });
  if (best.hp <= 0) defeat(rt, best); else rt.e.audio.play('squish');
}

// ---- the simulation, once per tick (before zones, so dropped coins count the same tick) ----
export function stepFoes(rt, dt) {
  const pl = rt.e.player;
  if (pl.hurtT > 0) pl.hurtT -= dt;
  if (pl.strikeCd > 0) pl.strikeCd -= dt;
  const f = rt.e.frame;
  if (f && (f.bits & 512) && pl.strikeCd <= 0) { pl.strikeCd = STRIKE.cd; strike(rt); }
  for (const foe of rt.foes) foe.step(rt, dt);
}
export function addFoe(rt, o) {
  const f = new Foe(rt, o || {}, rt.foes.length);
  if (rt.foes.some((x) => x.id === f.id)) throw new Error(`two enemies with the id "${f.id}"`);
  rt.foes.push(f);
  if (!rt.e.headless) { f.look = buildLook(f); rt.group.add(f.look.root); }
  return {
    get id() { return f.id; }, get kind() { return f.kind; }, get hp() { return f.hp; }, get alive() { return f.alive; }, get state() { return f.state; },
    get pos() { return [f.x, f.y, f.z]; },
    defeat() { if (f.alive) defeat(rt, f); },
    revive() { f.revive(); },
  };
}
// in the state hash (only in worlds that have foes, so other worlds hash as before)
export const foeState = (rt) => rt.foes.map((f) => [f.x, f.y, f.z, f.hp, f.state, f.t]);

// ---- looks (visual only) ----
function part(geo, m, x, y, z, sx, sy, sz) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; return o; }
const GEO = {};
const geo = (k) => GEO[k] || (GEO[k] = k === 'sphere' ? new THREE.SphereGeometry(1, 24, 16) : k === 'ico' ? new THREE.IcosahedronGeometry(1, 0) : new THREE.BoxGeometry(1, 1, 1));
for (const k of ['sphere', 'ico', 'box']) geo(k).userData.keep = true;
function buildLook(f) {
  const root = new THREE.Group(), body = new THREE.Group(), c = new THREE.Color(f.s.color);
  // each foe owns its materials, so it can flash when hit and glow while it winds up
  const skin = new THREE.MeshStandardMaterial({ color: c, roughness: f.kind === 'slime' ? 0.25 : 0.6, metalness: f.kind === 'crawler' ? 0.2 : 0, emissive: c, emissiveIntensity: 0.12, flatShading: f.kind !== 'slime', transparent: f.kind === 'slime', opacity: f.kind === 'slime' ? 0.88 : 1 });
  const eye = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, emissive: f.kind === 'slime' ? '#000000' : '#ffe9a8', emissiveIntensity: f.kind === 'slime' ? 0 : 1.4 });
  const dark = new THREE.MeshStandardMaterial({ color: '#141821', roughness: 0.4 });
  const mats = [skin, eye, dark], limbs = [];
  if (f.kind === 'slime') {
    body.add(part(geo('sphere'), skin, 0, 0.42, 0, 0.55, 0.45, 0.55));
    for (const sx of [-1, 1]) { body.add(part(geo('sphere'), eye, sx * 0.16, 0.55, 0.42, 0.1, 0.12, 0.08)); body.add(part(geo('sphere'), dark, sx * 0.16, 0.55, 0.49, 0.05, 0.06, 0.04)); }
  } else if (f.kind === 'crawler') {
    body.add(part(geo('ico'), skin, 0, 0.45, 0, 0.6, 0.32, 0.75));
    for (const sx of [-1, 1]) {
      body.add(part(geo('sphere'), eye, sx * 0.16, 0.55, 0.6, 0.07, 0.07, 0.07));
      for (const z of [-0.3, 0.05, 0.4]) { const leg = part(geo('box'), dark, sx * 0.55, 0.18, z, 0.5, 0.06, 0.07); leg.rotation.z = sx * -0.5; body.add(leg); limbs.push(leg); }
    }
  } else {
    body.add(part(geo('box'), skin, 0, 1.05, 0, 1.3, 1.3, 0.95));
    body.add(part(geo('box'), skin, 0, 2.0, 0.05, 0.75, 0.6, 0.7));
    for (const sx of [-1, 1]) {
      body.add(part(geo('box'), eye, sx * 0.18, 2.05, 0.41, 0.12, 0.08, 0.04));
      const arm = part(geo('box'), skin, sx * 0.95, 1.05, 0, 0.45, 1.3, 0.5); body.add(arm); limbs.push(arm);
    }
  }
  body.scale.setScalar(f.scale); root.add(body);
  // a health bar over its head while it is hurt
  const bar = new THREE.Group(), barBg = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55, depthTest: false }), barFg = new THREE.MeshBasicMaterial({ color: '#ff5d6e', depthTest: false });
  const bg = new THREE.Mesh(geo('box'), barBg), fg = new THREE.Mesh(geo('box'), barFg);
  bg.scale.set(1, 0.12, 0.01); fg.scale.set(0.96, 0.08, 0.01); fg.position.z = 0.01; bg.renderOrder = fg.renderOrder = 10;
  bar.add(bg, fg); bar.position.y = (f.kind === 'brute' ? 2.8 : 1.35) * f.scale; bar.visible = false; root.add(bar);
  mats.push(barBg, barFg);
  root.position.set(f.x, f.y, f.z); root.rotation.y = f.yaw;
  return { root, body, skin, limbs, bar, fg, mats, phase: 0 };
}
// once per rendered frame: interpolate between ticks, animate, flash, show health
export function frameFoes(rt, dt, t, alpha) {
  const cam = rt.e.camera;
  for (const f of rt.foes) {
    const L = f.look; if (!L) continue;
    L.root.visible = f.state !== 'gone';
    if (!L.root.visible) continue;
    L.root.position.set(f.px + (f.x - f.px) * alpha, f.py + (f.y - f.py) * alpha, f.pz + (f.z - f.pz) * alpha);
    let dyaw = f.yaw - L.root.rotation.y; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    L.root.rotation.y += dyaw * Math.min(1, dt * 12);
    const moving = Math.hypot(f.x - f.px, f.z - f.pz) > 1e-4, wind = f.state === 'windup' ? Math.min(1, f.t / f.s.windup) : 0;
    L.phase += dt * (moving ? 9 : 2.5);
    const b = L.body;
    if (f.state === 'down') { const k = Math.max(0, 1 - f.t / 0.7); b.scale.setScalar(f.scale * k); b.position.y = 0; }
    else if (f.kind === 'slime') {
      const hop = moving ? Math.abs(Math.sin(L.phase)) : 0, squash = moving ? 1 - 0.22 * Math.abs(Math.cos(L.phase)) : 1 + Math.sin(L.phase) * 0.04;
      b.position.y = hop * 0.32;
      b.scale.set(f.scale * (1 + (1 - squash) * 0.5 + wind * 0.25), f.scale * (squash - wind * 0.3), f.scale * (1 + (1 - squash) * 0.5 + wind * 0.25));
    } else if (f.kind === 'crawler') {
      b.position.y = moving ? Math.abs(Math.sin(L.phase * 1.4)) * 0.05 : 0; b.rotation.x = -wind * 0.45;
      L.limbs.forEach((leg, i) => { leg.rotation.y = moving ? Math.sin(L.phase * 1.6 + i * 1.7) * 0.5 : 0; });
    } else {
      b.position.y = moving ? Math.abs(Math.sin(L.phase * 0.7)) * 0.08 : 0;
      L.limbs.forEach((arm) => { arm.rotation.x = -wind * 2.2; });
    }
    // flash white when hit; glow while winding up
    f.hitT = Math.max(0, f.hitT - dt);
    L.skin.emissive.set(f.hitT > 0 ? '#ffffff' : f.s.color);
    L.skin.emissiveIntensity = f.hitT > 0 ? 1.6 : 0.12 + wind * 1.4;
    // health bar: shown for a few seconds after a hit, facing the camera
    const show = f.alive && rt.time - f.lastHit < 4 && f.hp < f.s.hp;
    L.bar.visible = show;
    if (show) { L.fg.scale.x = 0.96 * Math.max(0, f.hp / f.s.hp); L.fg.position.x = -0.48 * (1 - Math.max(0, f.hp / f.s.hp)); if (cam) L.bar.quaternion.copy(cam.quaternion).premultiply(L.root.quaternion.clone().invert()); }
  }
}
export function disposeFoes(rt) { for (const f of rt.foes) if (f.look) f.look.mats.forEach((m) => m.dispose()); }
