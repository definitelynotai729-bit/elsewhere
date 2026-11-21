// Avatars: a small robot built from primitives with floating hands and feet (no joints needed).
// Equipped items attach to slots and are rebuilt from their data-described looks.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, labelSprite } from './render.js';
import { buildLook, items } from './items.js';
import { damp } from './util.js';

const G = {};
function geos() {
  if (G.head) return;
  Object.assign(G, {
    head: new RoundedBoxGeometry(0.64, 0.52, 0.56, 3, 0.14),
    visor: new RoundedBoxGeometry(0.5, 0.22, 0.12, 2, 0.06),
    body: new THREE.CapsuleGeometry(0.29, 0.36, 4, 12),
    hand: new THREE.SphereGeometry(0.11, 12, 10),
    foot: new RoundedBoxGeometry(0.22, 0.14, 0.32, 2, 0.05),
    shadow: new THREE.CircleGeometry(0.42, 20),
  });
  for (const g of Object.values(G)) g.userData.keep = true; // shared: never disposed with a world
}
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });

export function createAvatar(colors, opts = {}) {
  geos();
  const root = new THREE.Group();
  const rig = new THREE.Group(); root.add(rig); // squash/stretch + board lift
  const upper = new THREE.Group(); upper.position.y = 0.78; rig.add(upper);
  const body = new THREE.Mesh(G.body, mat(colors.body)); upper.add(body);
  const headPivot = new THREE.Group(); headPivot.position.y = 0.66; upper.add(headPivot);
  const head = new THREE.Mesh(G.head, mat(colors.head, { rough: 0.5 })); headPivot.add(head);
  const visor = new THREE.Mesh(G.visor, mat(colors.visor, { glow: 1.6, rough: 0.3 })); visor.position.set(0, 0.02, 0.24); headPivot.add(visor);
  const handL = new THREE.Mesh(G.hand, mat(colors.head, { rough: 0.5 })), handR = handL.clone();
  rig.add(handL, handR);
  const footL = new THREE.Mesh(G.foot, mat(colors.body, { rough: 0.6 })), footR = footL.clone();
  rig.add(footL, footR);
  for (const m of [body, head, visor, handL, handR, footL, footR]) { m.receiveShadow = true; } // avatars use a blob shadow instead of casting
  const blob = new THREE.Mesh(G.shadow, shadowMat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; blob.renderOrder = 1; root.add(blob);

  const slots = {
    head: new THREE.Group(), back: new THREE.Group(), hand: new THREE.Group(), feetL: new THREE.Group(), feetR: new THREE.Group(), board: new THREE.Group(),
  };
  slots.head.position.y = 0.26; headPivot.add(slots.head);
  slots.back.position.set(0, 0.12, -0.3); upper.add(slots.back);
  handR.add(slots.hand);
  footL.add(slots.feetL); footR.add(slots.feetR);
  slots.board.position.y = 0.16; root.add(slots.board); // boards hover; the rig lifts the feet onto them

  const A = {
    root, rig, upper, body, head, visor, handL, handR, footL, footR, slots, blob,
    phase: 0, speed: 0, squash: 1, squashV: 0, lift: 0, glide: 0, equipped: {},
    tag: null,
    setColors(c) {
      body.material = mat(c.body); head.material = mat(c.head, { rough: 0.5 });
      visor.material = mat(c.visor, { glow: 1.6, rough: 0.3 });
      handL.material = handR.material = mat(c.head, { rough: 0.5 });
      footL.material = footR.material = mat(c.body, { rough: 0.6 });
    },
    equip(slot, itemId) {
      if (this.equipped[slot] === itemId) return;
      this.equipped[slot] = itemId;
      const clear = (g) => { while (g.children.length) g.remove(g.children[0]); };
      const def = itemId ? items.get(itemId) : null;
      const look = () => { const l = buildLook(def.look); l.traverse((o) => { o.castShadow = false; }); return l; };
      if (slot === 'feet') {
        clear(slots.feetL); clear(slots.feetR);
        if (def) { slots.feetL.add(look()); slots.feetR.add(look()); }
        return;
      }
      const g = slots[slot]; if (!g) return;
      clear(g);
      if (def) g.add(look());
    },
    setName(name, color) {
      if (this.tag) { upper.remove(this.tag); this.tag.material.map.dispose(); this.tag.material.dispose(); }
      if (!name) { this.tag = null; return; }
      this.tag = labelSprite(name, { size: 0.4, color: color || '#ffffff', bg: 'rgba(8,10,26,0.72)' });
      this.tag.position.y = 1.35; upper.add(this.tag);
    },
    bump(amount) { this.squashV -= amount; },
    // state: { speed, grounded, vy, gliding, board, dt }
    animate(s, dt) {
      const k = Math.min(1, s.speed / 7);
      this.speed = s.speed;
      if (s.grounded && !s.board) this.phase += dt * (4 + s.speed * 1.35);
      else this.phase += dt * 3;
      const ph = this.phase, sw = Math.sin(ph), cw = Math.cos(ph);
      // squash spring
      this.squashV += (1 - this.squash) * 160 * dt; this.squashV *= Math.exp(-11 * dt);
      this.squash += this.squashV * dt;
      const sq = this.squash;
      rig.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
      this.lift = damp(this.lift, s.board ? 0.3 : 0, 10, dt);
      rig.position.y = this.lift;
      this.glide = damp(this.glide, s.gliding ? 1 : 0, 8, dt);
      const t = performance.now() / 1000;
      if (s.board) {
        upper.position.y = 0.7; upper.rotation.x = 0.08; upper.rotation.z = Math.sin(t * 2) * 0.03;
        footL.position.set(-0.2, 0.07, 0.25); footR.position.set(0.2, 0.07, -0.25);
        footL.rotation.set(0, 0.6, 0); footR.rotation.set(0, 0.6, 0);
        handL.position.set(-0.55, 0.85, 0.1); handR.position.set(0.55, 0.85, -0.1);
      } else if (s.grounded) {
        upper.position.y = 0.78 + Math.abs(sw) * 0.06 * k + Math.sin(t * 2.2) * 0.012 * (1 - k);
        upper.rotation.x = k * 0.12; upper.rotation.z = sw * 0.04 * k;
        footL.position.set(-0.16, 0.07 + Math.max(0, cw) * 0.14 * k, sw * 0.26 * k);
        footR.position.set(0.16, 0.07 + Math.max(0, -cw) * 0.14 * k, -sw * 0.26 * k);
        footL.rotation.set(-sw * 0.4 * k, 0, 0); footR.rotation.set(sw * 0.4 * k, 0, 0);
        handL.position.set(-0.47, 0.72 + Math.sin(t * 2.2) * 0.02, -sw * 0.22 * k);
        handR.position.set(0.47, 0.72 + Math.sin(t * 2.2 + 1) * 0.02, sw * 0.22 * k);
      } else {
        const up = s.vy > 0 ? 1 : 0;
        const g = this.glide;
        upper.position.y = 0.8; upper.rotation.x = -0.05 + g * 0.25; upper.rotation.z = 0;
        footL.position.set(-0.17, 0.16 + up * 0.08, 0.05 - g * 0.1); footR.position.set(0.17, 0.1, -0.1 - g * 0.1);
        footL.rotation.set(0.3, 0, 0); footR.rotation.set(-0.2, 0, 0);
        handL.position.set(-0.5 - g * 0.35, 0.95 + up * 0.2 - g * 0.1, 0); handR.position.set(0.5 + g * 0.35, 0.95 + up * 0.2 - g * 0.1, 0);
      }
      slots.back.scale.x = 1 + this.glide * 0.9;
      headPivot.rotation.x = -upper.rotation.x * 0.5;
      // blob shadow sits on the ground below, shrinking with height
      const gd = Math.min(s.groundDist == null ? 0 : s.groundDist, 12);
      blob.position.y = 0.03 - gd;
      blob.scale.setScalar(Math.max(0.35, 1 - gd * 0.06));
      blob.visible = gd < 12;
    },
  };
  for (const slot of ['head', 'back', 'hand', 'feet', 'board']) if (opts.eq && opts.eq[slot]) A.equip(slot, opts.eq[slot]);
  if (opts.name) A.setName(opts.name, opts.nameColor);
  return A;
}
