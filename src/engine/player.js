// The local player: kinematic character controller (walk, glide, double jump, board) and the camera rig.
import * as THREE from 'three';
import { RAPIER } from './physics.js';
import { clamp, damp, dampAngle } from './util.js';
import { createAvatar } from './avatar.js';
import { traitAllowed } from './items.js';

export const WALK = { speed: 8, accel: 80, airAccel: 26, airDrag: 5, friction: 60, jumpV: 10.8, gravity: 30, fallMax: 48, coyote: 0.11, buffer: 0.13 };
export const BOARD = { max: 25, accel: 21, brake: 42, drag: 2.5, turn: 2.5, jumpV: 9.6, grip: 9 };

// The player's input for one tick, after quantisation (see run.js). Live play and replays feed the
// controller exactly these values, so a recorded run reproduces bit for bit.
// { mx, my: stick/keys in [-1, 1]; yaw: camera yaw used to aim walking; jump: pressed this tick;
//   held: jump held; board: board key pressed; use: use key pressed }
export const NO_INPUT = Object.freeze({ mx: 0, my: 0, yaw: 0, jump: false, held: false, board: false, use: false });

export class Player {
  constructor(engine, prof, opts = {}) {
    this.e = engine;
    this.pos = new THREE.Vector3(); this.prev = new THREE.Vector3(); this.renderPos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.carry = new THREE.Vector3(); this.push = new THREE.Vector3();
    this.checkpoint = { pos: new THREE.Vector3(), yaw: Math.PI };
    this.resetSim();
    this.avatar = opts.headless ? headlessAvatar() : createAvatar(prof.colors, { eq: prof.eq });
    this.light = new THREE.PointLight('#ffd49a', 0, 16, 1.4);
    this.light.position.set(0.45, 1.25, 0.35);
    this.avatar.root.add(this.light);
  }
  // every field that affects gameplay, back to its starting value (each world visit starts from here)
  resetSim() {
    this.pos.set(0, 0, 0); this.prev.set(0, 0, 0); this.renderPos.set(0, 0, 0); this.vel.set(0, 0, 0);
    this.yaw = Math.PI; this.heading = Math.PI; this.boardSpeed = 0; this.boostT = 0;
    this.grounded = false; this.coyote = 0; this.buffer = 0; this.airJumps = 0; this.jumpCut = false; this.fallSpeed = 0;
    this.gliding = false; this.board = false; this.forceBoard = false; this.ballistic = false;
    this.abil = { glide: false, doublejump: false, light: false, board: false, speed: 1 };
    this.groundDist = 0; this.standing = null;
    this.carry.set(0, 0, 0); this.push.set(0, 0, 0);
    this.frozen = false;
    this.checkpoint.pos.set(0, 0, 0); this.checkpoint.yaw = Math.PI;
    this.stepT = 0; this.kickT = 0; this.rampVy = 0; this.prevRate = null;
    this.speedScale = 1; // set by a world (w.player.setSpeed); 1 leaves walking exactly as it was
    this.body = null; this.col = null; this.ctl = null; this.P = null;
  }

  attach(physics, pos, yaw) {
    this.P = physics;
    const c = physics.createCharacter(pos);
    this.body = c.body; this.col = c.col; this.ctl = c.ctl;
    this.place(pos, yaw);
    this.checkpoint.pos.copy(pos); this.checkpoint.yaw = yaw;
  }
  place(pos, yaw) {
    this.pos.copy(pos); this.prev.copy(pos); this.renderPos.copy(pos);
    this.vel.set(0, 0, 0); this.boardSpeed = 0; this.boostT = 0;
    if (yaw != null) { this.yaw = yaw; this.heading = yaw; }
    if (this.body) { this.body.setTranslation(pos, true); this.body.setNextKinematicTranslation(pos); }
    this.grounded = false; this.coyote = 0; this.standing = null;
  }
  respawn() {
    this.place(this.checkpoint.pos, this.checkpoint.yaw);
    this.e.audio.play('respawn');
    if (this.e.onRespawn) this.e.onRespawn();
  }
  launch(vy, vx = 0, vz = 0) {
    this.vel.y = vy; if (vx || vz) { this.vel.x = vx; this.vel.z = vz; this.ballistic = true; } // keep the push until landing
    this.grounded = false; this.coyote = 0; this.jumpCut = false; this.buffer = 0;
    this.airJumps = this.abil.doublejump ? 1 : 0;
    this.avatar.bump(-0.35);
  }
  boost(seconds, speed) {
    if (this.board) { this.boostT = Math.max(this.boostT, seconds); this.boardSpeed = Math.max(this.boardSpeed, speed); }
    else { this.vel.x = Math.sin(this.yaw) * speed * 0.6; this.vel.z = Math.cos(this.yaw) * speed * 0.6; }
  }
  updateAbilities(rules, eq) {
    const items = this.e.items;
    const has = (trait) => Object.values(eq).some((id) => { const d = id && items.get(id); return d && d.traits.includes(trait); }) && traitAllowed(trait, rules);
    this.abil = { glide: has('glide'), doublejump: has('doublejump'), light: has('light'), board: has('board'), speed: has('speed') ? 1.25 : 1 };
    if (this.board && !this.abil.board && !this.forceBoard) this.setBoard(false);
    this.light.intensity = this.abil.light ? 30 : 0;
    // hide equipment whose traits are switched off here
    for (const [slot, id] of Object.entries(eq)) {
      const d = id && items.get(id);
      const active = !d || d.traits.every((t) => traitAllowed(t, rules));
      if (slot === 'feet') { this.avatar.slots.feetL.visible = this.avatar.slots.feetR.visible = active; }
      else if (this.avatar.slots[slot]) this.avatar.slots[slot].visible = slot === 'board' ? active && this.board : active;
    }
  }
  setBoard(on) {
    if (on === this.board) return;
    this.board = on;
    if (on) { this.heading = this.yaw; this.boardSpeed = Math.hypot(this.vel.x, this.vel.z); }
    this.avatar.slots.board.visible = on;
    this.e.ui && this.e.ui.refreshHud();
    if (this.e.fx) this.e.fx.burst(this.pos, { color: '#7cf6ff', count: 12, speed: 3, life: 0.4 });
  }

  tick(dt, f) {
    this.prev.copy(this.pos);
    if (!this.body) return;
    if (this.frozen) { this.vel.set(0, 0, 0); this.body.setNextKinematicTranslation(this.pos); return; }
    // ride moving platforms: apply the platform's motion for this tick
    if (this.grounded && this.standing != null) {
      const info = this.P.info.get(this.standing);
      if (info && info.delta) this.carry.copy(info.delta);
    }
    const mx = f.mx, my = f.my;
    if (f.jump) this.buffer = WALK.buffer; else this.buffer = Math.max(0, this.buffer - dt);
    if (f.board) {
      if (this.forceBoard) this.e.toast && this.e.toast('This world keeps you on the board.');
      else if (this.abil.board) this.setBoard(!this.board);
      else this.e.toast && this.e.toast(this.hasItemTrait('board') ? 'Boards are switched off in this world.' : 'You need a board item. Check the shop or your inventory.');
    }
    const wasGrounded = this.grounded;

    if (this.board) this.tickBoard(dt, mx, my); else this.tickWalk(dt, mx, my, f.yaw);

    // jump, coyote time and buffered input
    if (this.buffer > 0 && (this.grounded || this.coyote > 0)) {
      this.vel.y = this.board ? BOARD.jumpV : WALK.jumpV;
      this.grounded = false; this.coyote = 0; this.buffer = 0; this.jumpCut = true;
      this.e.audio.play('jump'); this.avatar.bump(-0.3);
      this.e.fx && this.e.fx.dust(this.pos, 6);
    } else if (this.buffer > 0 && !this.grounded && this.airJumps > 0 && !this.board) {
      this.vel.y = WALK.jumpV * 0.95; this.airJumps--; this.buffer = 0; this.jumpCut = true;
      this.e.audio.play('djump'); this.avatar.bump(-0.3);
      this.e.fx && this.e.fx.ring(this.pos, '#ffb347');
    }
    // gravity; releasing jump early cuts the jump short
    let g = WALK.gravity;
    if (this.vel.y > 0 && this.jumpCut && !f.held) g *= 2.7;
    this.gliding = this.abil.glide && !this.grounded && !this.board && f.held && this.vel.y < 0.5;
    if (this.gliding) {
      // glide: ease down to a steady 2.3 m/s sink (no gravity below that, so it settles exactly)
      if (this.vel.y > -2.3) this.vel.y = Math.max(this.vel.y - g * 0.3 * dt, -2.3);
      else this.vel.y = damp(this.vel.y, -2.3, 9, dt);
    } else this.vel.y = Math.max(this.vel.y - g * dt, -WALK.fallMax);

    // move through the world
    // while grounded, ask for no vertical movement and let snap-to-ground hold us down: requesting a tick
    // of gravity into the floor sometimes made Rapier answer with a dead stop
    const holdGround = this.grounded && this.vel.y <= 0 && this.push.y <= 0;
    const want = { x: (this.vel.x + this.push.x) * dt, y: holdGround ? 0 : (this.vel.y + this.push.y) * dt, z: (this.vel.z + this.push.z) * dt };
    this.push.set(0, 0, 0);
    this.ctl.computeColliderMovement(this.col, want, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
    const m = this.ctl.computedMovement();
    // kick loose physics objects (balls) we run into: a proper kick, not just a shove
    const hs0 = Math.hypot(this.vel.x, this.vel.z);
    if (hs0 > 0.5) {
      for (let i = 0; i < this.ctl.numComputedCollisions(); i++) {
        const c = this.ctl.computedCollision(i);
        const body = c && c.collider && c.collider.parent();
        if (!body || !body.isDynamic()) continue;
        const ux = this.vel.x / hs0, uz = this.vel.z / hs0, mass = body.mass();
        if (hs0 > 3 && this.kickT <= 0) { // running into it: a real kick
          const k = mass * Math.min(hs0, 12) * 1.45;
          body.applyImpulse({ x: ux * k, y: mass * 4.5, z: uz * k }, true);
          this.kickT = 0.35; this.e.audio.play('pad');
        } else body.applyImpulse({ x: ux * mass * 0.25, y: 0, z: uz * mass * 0.25 }, true); // walking: a nudge
        break;
      }
    }
    if (this.kickT > 0) this.kickT -= dt;
    if (want.y > 0 && m.y < want.y * 0.4 && this.vel.y > 0) this.vel.y = 0; // bonked a ceiling
    // stop pushing into walls but keep sliding along them
    const ax = m.x / dt, az = m.z / dt;
    if (Math.abs(ax) < Math.abs(this.vel.x) - 0.01) this.vel.x = ax;
    if (Math.abs(az) < Math.abs(this.vel.z) - 0.01) this.vel.z = az;
    if (this.board) { // hitting a real wall on the board scrubs speed (low lips and floors don't)
      const wantH = Math.hypot(want.x, want.z), gotH = Math.hypot(m.x, m.z);
      if (wantH > 1e-4 && gotH < wantH * 0.6) {
        const feet = this.pos.y - 0.9;
        let wall = false;
        for (let i = 0; i < this.ctl.numComputedCollisions(); i++) {
          const c = this.ctl.computedCollision(i);
          if (c && Math.abs(c.normal1.y) < 0.4 && c.witness1.y - feet > 0.35) { wall = true; break; }
        }
        if (wall) { this.boardSpeed *= Math.max(0.2, gotH / wantH); if (wantH / dt > 12) this.e.camRig && this.e.camRig.shake(0.12); }
      }
    }
    // the platform we stand on moves by `carry` during this same physics step, so we move with it
    this.pos.set(this.pos.x + m.x + this.carry.x, this.pos.y + m.y + this.carry.y, this.pos.z + m.z + this.carry.z);
    this.carry.set(0, 0, 0);
    this.body.setNextKinematicTranslation(this.pos);

    const groundedNow = this.ctl.computedGrounded() && this.vel.y <= 0.01;
    // leaving the top of a ramp keeps its upward speed, so ramps launch you (kickers, jumps on the board)
    if (wasGrounded && !groundedNow && this.vel.y <= 0.01 && this.rampVy > 1.5) {
      this.vel.y = Math.min(this.rampVy, 18); this.coyote = 0.06;
    }
    // sustained climbing only: autostep over a ledge is a one-tick spike, so take the smaller of two ticks
    const rate = groundedNow ? Math.min(m.y / dt, Math.hypot(m.x, m.z) / dt * 1.2) : 0;
    this.rampVy = groundedNow ? Math.min(rate, this.prevRate == null ? rate : this.prevRate) : 0;
    this.prevRate = groundedNow ? rate : null;
    this.grounded = groundedNow;
    if (this.grounded) {
      if (!wasGrounded) {
        const impact = this.fallSpeed;
        if (impact > 5) { this.e.audio.play('land', impact / 10); this.avatar.bump(Math.min(0.45, impact * 0.025)); this.e.fx && this.e.fx.dust(this.pos, Math.min(14, 4 + impact)); }
      }
      if (this.vel.y < 0) this.vel.y = 0;
      this.ballistic = false;
      this.coyote = WALK.coyote; this.airJumps = this.abil.doublejump ? 1 : 0; this.jumpCut = false; this.fallSpeed = 0;
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
      this.fallSpeed = Math.max(0, -this.vel.y);
    }
    // what are we standing on, and how high are we?
    const hit = this.P.ray(this.pos, { x: 0, y: -1, z: 0 }, 40, this.col);
    this.groundDist = hit ? Math.max(0, hit.toi - 0.9) : 99;
    this.standing = hit && this.groundDist < 0.25 ? hit.collider.handle : null;
    // footsteps
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (this.grounded && !this.board && hs > 1.5) { this.stepT += dt * hs; if (this.stepT > 2.1) { this.stepT = 0; this.e.audio.play('step'); } }
  }

  tickWalk(dt, mx, my, camYaw) {
    const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
    const rx = -Math.cos(camYaw), rz = Math.sin(camYaw);
    const sp = WALK.speed * this.abil.speed * (this.gliding ? 1.3 : 1) * this.speedScale;
    const wx = (fx * my + rx * mx) * sp, wz = (fz * my + rz * mx) * sp;
    const moving = Math.hypot(mx, my) > 0.05;
    let a;
    if (this.grounded) a = moving ? WALK.accel : WALK.friction;
    else if (this.ballistic) { if (!moving) return; a = WALK.airAccel * 0.6; } // pad launches carry you unless you steer
    else a = moving ? (this.gliding ? 16 : WALK.airAccel) : WALK.airDrag;
    const dx = wx - this.vel.x, dz = wz - this.vel.z, dl = Math.hypot(dx, dz), step = a * dt;
    if (dl <= step) { this.vel.x = wx; this.vel.z = wz; } else { this.vel.x += (dx / dl) * step; this.vel.z += (dz / dl) * step; }
    if (moving) this.yaw = dampAngle(this.yaw, Math.atan2(wx, wz), 16, dt);
  }

  tickBoard(dt, mx, my) {
    const B = BOARD;
    const turn = B.turn * (0.4 + 0.6 * clamp(Math.abs(this.boardSpeed) / 12, 0, 1));
    this.heading -= mx * turn * dt * (this.grounded ? 1 : 0.6);
    if (this.grounded) {
      if (my > 0 && this.boardSpeed < B.max) this.boardSpeed = Math.min(B.max, this.boardSpeed + my * B.accel * dt * (this.boardSpeed < 0 ? 2.5 : 1));
      else if (my < 0) this.boardSpeed += my * (this.boardSpeed > 0 ? B.brake : B.accel * 0.4) * dt;
      const drag = (this.boostT > 0 ? 0 : B.drag) + (Math.abs(this.boardSpeed) > B.max ? 14 : 0);
      this.boardSpeed -= Math.sign(this.boardSpeed) * Math.min(Math.abs(this.boardSpeed), drag * dt);
    }
    this.boardSpeed = clamp(this.boardSpeed, -7, B.max * 1.5); // boosts can exceed max; drag pulls it back
    if (this.boostT > 0) this.boostT -= dt;
    const tx = Math.sin(this.heading) * this.boardSpeed, tz = Math.cos(this.heading) * this.boardSpeed;
    const grip = this.grounded ? B.grip : 1.2;
    this.vel.x = damp(this.vel.x, tx, grip, dt); this.vel.z = damp(this.vel.z, tz, grip, dt);
    this.yaw = this.heading;
  }

  hasItemTrait(trait) {
    const eq = this.e.profile.data.eq, items = this.e.items;
    return Object.values(eq).some((id) => { const d = id && items.get(id); return d && d.traits.includes(trait); });
  }

  // per rendered frame
  frame(dt, alpha) {
    this.renderPos.lerpVectors(this.prev, this.pos, alpha);
    const A = this.avatar;
    A.root.position.set(this.renderPos.x, this.renderPos.y - 0.9, this.renderPos.z);
    // with keyboard controls you face your heading (strafing and backpedalling don't turn you around)
    const inp = this.e.input, face = inp && inp.scheme === 'default' && inp.keyMode && !this.board && !this.frozen ? inp.heading : this.yaw;
    A.root.rotation.y = dampAngle(A.root.rotation.y, face, 18, dt);
    A.animate({ speed: Math.hypot(this.vel.x, this.vel.z), grounded: this.grounded || this.groundDist < 0.12, vy: this.vel.y, gliding: this.gliding, board: this.board, groundDist: this.groundDist }, dt);
    if (this.board) A.rig.rotation.z = damp(A.rig.rotation.z, clamp(-(this.e.input ? this.e.input.move.x : 0) * Math.abs(this.boardSpeed) * 0.012, -0.3, 0.3), 8, dt);
    else A.rig.rotation.z = damp(A.rig.rotation.z, 0, 8, dt);
  }
}

// a stand-in with the avatar's shape and none of its meshes (replays have no one to show it to)
function headlessAvatar() {
  const g = () => new THREE.Group();
  const slots = { head: g(), back: g(), hand: g(), feetL: g(), feetR: g(), board: g() };
  const noop = () => {};
  return { root: g(), rig: g(), slots, handR: g(), setColors: noop, equip: noop, setName: noop, bump: noop, animate: noop, blob: g() };
}

export class CameraRig {
  constructor(camera) {
    this.cam = camera; this.yaw = Math.PI; this.pitch = 0.3; this.dist = 7.5; this.cur = 7.5;
    this.target = new THREE.Vector3(); this.ty = 0; this.fov = 62; this.shakeT = 0;
    this.dir = new THREE.Vector3();
  }
  snap(player) { this.yaw = player.yaw; this.ty = player.pos.y + 1.3; this.cur = this.dist; }
  // A world may fix the camera: { mode: 'top', yaw, pitch (degrees), dist }. Arena games look down at the field.
  setMode(m) { this.mode = m && m.mode === 'top' ? { yaw: (m.yaw || 0) * Math.PI / 180, pitch: (m.pitch == null ? 55 : m.pitch) * Math.PI / 180, dist: m.dist || 24 } : null; if (this.mode) { this.yaw = this.mode.yaw; this.pitch = this.mode.pitch; this.dist = this.cur = this.mode.dist; } }
  update(dt, player, input, physics, settings) {
    if (this.mode) {
      const M = this.mode, p = player.renderPos;
      if (input.zoom) M.dist = clamp(M.dist + input.zoom * 1.5, 14, 40);
      this.yaw = M.yaw; this.pitch = M.pitch; this.cur = damp(this.cur, M.dist, 6, dt);
      this.target.set(p.x, p.y + 1, p.z);
      const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      this.dir.set(-Math.sin(this.yaw) * cp, sp, -Math.cos(this.yaw) * cp);
      this.cam.position.copy(this.target).addScaledVector(this.dir, this.cur);
      if (this.shakeT > 0) { this.shakeT -= dt; const s = this.shakeT * 0.6; this.cam.position.x += (Math.random() - 0.5) * s; this.cam.position.z += (Math.random() - 0.5) * s; }
      this.cam.lookAt(this.target);
      if (Math.abs(this.fov - 50) > 0.05) { this.fov = 50; this.cam.fov = 50; this.cam.updateProjectionMatrix(); }
      return;
    }
    const sens = 0.0026 * (settings.sens || 1);
    this.yaw -= input.lookDX * sens;
    this.pitch = clamp(this.pitch + input.lookDY * sens * 0.85 * (settings.invertY ? -1 : 1), -0.55, 1.3);
    if (input.zoom) this.dist = clamp(this.dist + input.zoom * 0.9, 3, 16);
    const since = performance.now() - input.lastLookAt;
    if (player.board && since > 600) this.yaw = dampAngle(this.yaw, player.heading, 3.2, dt);
    // keyboard: the camera swings behind your heading while you turn or move (arrow-key orbits wait 0.4 s)
    else if (input.keyMode && (input.turnKeys || input.keyMove) && since > 400) this.yaw = dampAngle(this.yaw, input.heading, input.turnKeys ? 14 : 5, dt);
    else if (input.touch && since > 1500 && Math.hypot(player.vel.x, player.vel.z) > 3) this.yaw = dampAngle(this.yaw, player.yaw, 0.9, dt);
    const p = player.renderPos;
    this.ty = Math.abs(p.y + 1.3 - this.ty) > 6 ? p.y + 1.3 : damp(this.ty, p.y + 1.3, 12, dt);
    this.target.set(p.x, this.ty, p.z);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    this.dir.set(-Math.sin(this.yaw) * cp, sp, -Math.cos(this.yaw) * cp);
    let want = this.dist;
    if (physics && player.col) {
      const hit = physics.ray(this.target, this.dir, this.dist + 0.4, player.col);
      if (hit) want = Math.max(1.0, hit.toi - 0.4);
    }
    this.cur = want < this.cur ? want : damp(this.cur, want, 3.5, dt);
    this.cam.position.copy(this.target).addScaledVector(this.dir, this.cur);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const s = this.shakeT * 0.6;
      this.cam.position.x += (Math.random() - 0.5) * s; this.cam.position.y += (Math.random() - 0.5) * s;
    }
    this.cam.lookAt(this.target);
    const hs = Math.hypot(player.vel.x, player.vel.z);
    const fov = 62 + clamp((hs - 10) * 0.8, 0, 16);
    if (Math.abs(fov - this.fov) > 0.05) { this.fov = damp(this.fov, fov, 4, dt); this.cam.fov = this.fov; this.cam.updateProjectionMatrix(); }
  }
  shake(t) { this.shakeT = Math.max(this.shakeT, t); }
}
