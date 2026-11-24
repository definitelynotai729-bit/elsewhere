// Avatars: a small robot built from primitives with floating hands and feet (no joints needed).
// Equipped items attach to slots and are rebuilt from their data-described looks.
// A body item (slot 'body') swaps the robot for a rigged, animated character (characters.js). The item
// slots then move onto the character's bones, so hats, blades and gliders still show and move with it.
// A look (the wardrobe: a body style, a face, an outfit and colours) is built by a look kit the game hands in
// (looks.js, outside the engine). Without one (replays, tools) every avatar is the default robot. The kit fills the
// avatar's skins (torso, head, hands, feet, topper, tail) and gives the style's proportions, which place the
// slots and drive the animation below.
// All of this is presentation: the collider and everything a replay checks stay the same.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, labelSprite } from './render.js';
import { buildLook, items } from './items.js';
import { damp } from './util.js';

// the default robot's proportions (metres; upper = the torso's pivot, the rest relative to it or to the head)
export const BOT_METRICS = { up: 0.78, headY: 0.66, hatY: 0.26, handX: 0.47, handY: 0.72, footX: 0.16, backY: 0.12, backZ: -0.3, tagY: 1.35, charmY: 1.95, tailY: -0.26, tailZ: -0.24 };
let lookKit = null;
// main.js hands avatars the look kit (looks.js): build(look, colors) -> { look, m, parts }
export function setLookKit(kit) { lookKit = kit; }

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

let charLib = null;
// main.js hands avatars the character library. Without one (replays, tools), bodies stay the default robot.
export function setCharacterLibrary(lib) { charLib = lib; }
const sane = (n) => THREE.PropertyBinding.sanitizeNodeName(n || ''); // the loader's node names
const D2R = Math.PI / 180;
// bounds of a model's meshes as posed now, in its parent's space, skipping some subtrees (worn props)
function poseBox(root, skip) {
  const box = new THREE.Box3(), b = new THREE.Box3();
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (let p = o; p; p = p.parent) if (skip.has(p)) return;
    b.makeEmpty(); b.expandByObject(o, true); box.union(b);
  });
  return box;
}

export function createAvatar(colors, opts = {}) {
  geos();
  const root = new THREE.Group();
  const rig = new THREE.Group(); root.add(rig); // squash/stretch + board lift
  const upper = new THREE.Group(); upper.position.y = BOT_METRICS.up; rig.add(upper);
  const headPivot = new THREE.Group(); headPivot.position.y = BOT_METRICS.headY; upper.add(headPivot);
  // hands and feet are holders: their skin (the look) and their item slot hang from them
  const handL = new THREE.Group(), handR = new THREE.Group(), footL = new THREE.Group(), footR = new THREE.Group();
  rig.add(handL, handR, footL, footR);
  // skins: what the look is made of (the default robot, or a kit's build)
  const skins = { torso: new THREE.Group(), head: new THREE.Group(), handL: new THREE.Group(), handR: new THREE.Group(), footL: new THREE.Group(), footR: new THREE.Group(), topper: new THREE.Group(), tail: new THREE.Group() };
  upper.add(skins.torso); headPivot.add(skins.head, skins.topper); handL.add(skins.handL); handR.add(skins.handR); footL.add(skins.footL); footR.add(skins.footR);
  const tailPivot = new THREE.Group(); tailPivot.add(skins.tail); upper.add(tailPivot);
  const blob = new THREE.Mesh(G.shadow, shadowMat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; blob.renderOrder = 1; root.add(blob);

  const slots = {
    head: new THREE.Group(), back: new THREE.Group(), hand: new THREE.Group(), feetL: new THREE.Group(), feetR: new THREE.Group(), board: new THREE.Group(),
    charm: new THREE.Group(),
  };
  headPivot.add(slots.head);
  upper.add(slots.back);
  handR.add(slots.hand);
  footL.add(slots.feetL); footR.add(slots.feetR);
  slots.board.position.y = 0.16; root.add(slots.board); // boards hover; the rig lifts the feet onto them
  slots.charm.position.set(0.62, BOT_METRICS.charmY, -0.12); root.add(slots.charm); // an artifact hovers at the right shoulder (any body)
  const clear = (g) => { while (g.children.length) g.remove(g.children[0]); };

  const A = {
    root, rig, upper, headPivot, handL, handR, footL, footR, slots, blob, skins,
    phase: 0, speed: 0, squash: 1, squashV: 0, lift: 0, glide: 0, equipped: {},
    tag: null, m: BOT_METRICS, look: null, colors: null,
    // the default robot: a capsule body, a rounded head with a glowing visor, round hands and boxy feet
    robot(c) {
      for (const g of Object.values(skins)) clear(g);
      const add = (g, geo, m, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(0, y, z); o.receiveShadow = true; g.add(o); return o; }; // avatars use a blob shadow instead of casting
      add(skins.torso, G.body, mat(c.body));
      add(skins.head, G.head, mat(c.head, { rough: 0.5 }));
      add(skins.head, G.visor, mat(c.visor, { glow: 1.6, rough: 0.3 }), 0.02, 0.24);
      add(skins.handL, G.hand, mat(c.head, { rough: 0.5 })); add(skins.handR, G.hand, mat(c.head, { rough: 0.5 }));
      add(skins.footL, G.foot, mat(c.body, { rough: 0.6 })); add(skins.footR, G.foot, mat(c.body, { rough: 0.6 }));
      this.fit(BOT_METRICS);
    },
    // place the slots and the tag for a style's proportions
    fit(m) {
      this.m = m;
      upper.position.y = m.up; headPivot.position.y = m.headY;
      slots.head.position.set(0, m.hatY, 0);
      slots.back.position.set(0, m.backY, m.backZ);
      slots.charm.position.y = m.charmY;
      tailPivot.position.set(0, m.tailY, m.tailZ);
      if (this.tag) this.tag.position.y = m.tagY;
    },
    // a look from the wardrobe (or a world's character): built by the kit when there is one, else the default robot
    // in the look's colours. look may be partial or null; colors are the fallbacks ({ body, head, visor }).
    setLook(look, c) {
      c = c || this.colors || colors;
      if (!lookKit) { this.look = null; this.colors = c; this.robot(c); return; }
      const b = lookKit.build(look, c);
      for (const g of Object.values(skins)) clear(g);
      for (const k of Object.keys(skins)) if (b.parts[k]) skins[k].add(b.parts[k]);
      this.look = b.look; this.colors = c;
      this.fit(Object.assign({}, BOT_METRICS, b.m));
      const hidden = !!this.model; // a character body is worn: the look waits underneath
      for (const g of Object.values(skins)) g.visible = !hidden;
      this.syncWear();
    },
    setColors(c) {
      if (this.look) this.setLook(Object.assign({}, this.look, { colors: Object.assign({}, this.look.colors, { body: c.body, head: c.head, eyes: c.visor }) }), c);
      else this.setLook(null, c);
    },
    equip(slot, itemId) {
      if (this.equipped[slot] === itemId) return;
      this.equipped[slot] = itemId;
      const clear = (g) => { while (g.children.length) g.remove(g.children[0]); };
      const def = itemId ? items.get(itemId) : null; // looks only; unknown items show nothing
      if (slot === 'body') { this.setBody(def && def.character ? def.character : null); return; }
      const look = () => { const l = buildLook(def.look); l.traverse((o) => { o.castShadow = false; }); return l; };
      if (slot === 'feet') {
        clear(slots.feetL); clear(slots.feetR);
        if (def) { slots.feetL.add(look()); slots.feetR.add(look()); }
        return;
      }
      const g = slots[slot]; if (!g) return;
      clear(g);
      if (def) g.add(look());
      if (slot === 'head' || slot === 'back') this.syncWear();
    },

    // ---- bodies ----
    want: null, bodyOn: true, bodyId: null, bodyTok: 0, model: null, bodyInfo: null, mixer: null, acts: null, cur: null, curState: null, strikeT: 0, homes: [], backBase: null,
    setBody(cid) { this.want = cid || null; this.syncBody(); },
    // a world whose rules switch cosmetics off shows the default robot instead
    setBodyActive(on) { this.bodyOn = !!on; this.syncBody(); },
    syncBody() {
      const id = this.bodyOn && charLib ? this.want : null;
      if (id === this.bodyId) return;
      this.bodyId = id; const tok = ++this.bodyTok;
      this.dropBody();
      if (id) charLib.instance(id).then((inst) => { if (tok === this.bodyTok) this.mountBody(inst); }, (e) => console.warn('character', id, e.message));
    },
    mountBody(inst) {
      const info = inst.info, model = inst.root;
      const wear = new Set();
      for (const n of [...(info.headwear || []), ...(info.backwear || [])]) { const o = model.getObjectByName(sane(n)); if (o) wear.add(o); }
      // size: the given height with the feet on the ground, measured in the file's rest pose (model not yet parented,
      // so world space here is the rig's space)
      model.position.set(0, 0, 0); model.scale.setScalar(1); model.updateMatrixWorld(true);
      const raw = poseBox(model, new Set());
      const s = (info.height || 1.8) / Math.max(0.05, raw.max.y - raw.min.y);
      model.scale.setScalar(s); model.position.y = -raw.min.y * s; model.updateMatrixWorld(true);
      const bare = poseBox(model, wear); // without helmets and capes: where hats sit
      const bone = (k) => { const n = info.slots && info.slots[k]; return n ? model.getObjectByName(sane(n)) : null; };
      const at = (o) => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
      const up = new THREE.Quaternion();
      this.homes = [];
      const keep = (slot) => this.homes.push([slot, slot.parent, slot.position.clone(), slot.quaternion.clone(), slot.scale.clone()]);
      // put a slot on a bone so that, in the rest pose, it sits at pos with rotation quat and size scl (rig space)
      const put = (slot, b, pos, quat, scl) => {
        keep(slot);
        const want = new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(scl, scl, scl));
        new THREE.Matrix4().copy(b.matrixWorld).invert().multiply(want).decompose(slot.position, slot.quaternion, slot.scale);
        b.add(slot);
      };
      const hb = bone('head');
      if (hb) { const p = at(hb); put(slots.head, hb, new THREE.Vector3(p.x, bare.max.y, p.z), up, info.hatScale || 1); }
      const cb = bone('back');
      if (cb) { const p = at(cb), o = info.backOffset || [0, 0, -0.22]; put(slots.back, cb, new THREE.Vector3(p.x + o[0], p.y + o[1], p.z + o[2]), up, 1); }
      const hand = bone('hand');
      if (hand && info.hand === 'bone') {
        // the rig's own weapon socket: items extend along its +y, as the pack's own swords do
        keep(slots.hand);
        const sc = new THREE.Vector3().setFromMatrixScale(hand.matrixWorld);
        slots.hand.position.set(0, 0, 0); slots.hand.quaternion.identity(); slots.hand.scale.set(1 / sc.x, 1 / sc.y, 1 / sc.z);
        hand.add(slots.hand);
      } else if (hand) {
        const r = info.handRot || [0, 0, 0];
        put(slots.hand, hand, at(hand), new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D2R, r[1] * D2R, r[2] * D2R)), 1);
      }
      for (const [k, slot] of [['feetL', slots.feetL], ['feetR', slots.feetR]]) { const b = bone(k); if (b) { const p = at(b); put(slot, b, new THREE.Vector3(p.x, 0.07, p.z), up, 1.15); } }
      this.backBase = slots.back.scale.clone();
      rig.add(model);
      for (const g of Object.values(skins)) g.visible = false; // the look waits underneath
      // one action per game state; strikes, cheers and one-shot jumps play once
      const mixer = new THREE.AnimationMixer(model), acts = {};
      for (const [state, name] of Object.entries(info.anims || {})) {
        const clip = THREE.AnimationClip.findByName(inst.clips, name); if (!clip) continue;
        const a = mixer.clipAction(clip);
        const loops = state === 'idle' || state === 'walk' || state === 'run' || (state === 'jump' && !(info.once || []).includes('jump'));
        if (!loops) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
        acts[state] = a;
      }
      Object.assign(this, { model, bodyInfo: info, mixer, acts, cur: null, curState: null, strikeT: 0 });
      this.syncWear();
      this.play('idle', 0);
      mixer.update(0);
    },
    dropBody() {
      if (this.mixer) this.mixer.stopAllAction();
      if (this.model) { this.model.removeFromParent(); this.model.traverse((o) => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose(); }); }
      for (const [slot, parent, p, q, sc] of this.homes.reverse()) { parent.add(slot); slot.position.copy(p); slot.quaternion.copy(q); slot.scale.copy(sc); }
      this.homes = []; this.backBase = null;
      Object.assign(this, { model: null, bodyInfo: null, mixer: null, acts: null, cur: null, curState: null, strikeT: 0 });
      for (const g of Object.values(skins)) g.visible = true;
      this.syncWear();
    },
    // a worn hat replaces the character's own helmet (or the look's ears, horns or crest); a worn back item its cape
    syncWear() {
      skins.topper.visible = !this.model && !this.equipped.head;
      if (!this.model) return;
      const show = (names, on) => { for (const n of names || []) { const o = this.model.getObjectByName(sane(n)); if (o) o.visible = on; } };
      show(this.bodyInfo.headwear, !this.equipped.head);
      show(this.bodyInfo.backwear, !this.equipped.back);
    },
    play(state, fade = 0.2) {
      const a = this.acts && this.acts[state];
      if (!a) return false;
      if (this.cur === a && state !== 'strike') return true;
      a.reset().setEffectiveTimeScale(state === 'strike' ? 1.6 : 1).setEffectiveWeight(1).play();
      if (this.cur && this.cur !== a) { if (fade > 0) this.cur.crossFadeTo(a, fade, false); else this.cur.stop(); }
      this.cur = a; this.curState = state;
      return true;
    },
    animateBody(s, dt) {
      const sd = this.bodyInfo.speeds || {}, walk = sd.walk || 1.8, run = sd.run || 4.8, sp = s.speed || 0;
      if (this.strikeT > 0) this.strikeT -= dt;
      else {
        const st = s.board ? 'idle' : !s.grounded ? 'jump' : sp > walk * 1.7 ? 'run' : sp > 0.4 ? 'walk' : 'idle';
        if (st !== this.curState) this.play(st, st === 'jump' ? 0.12 : 0.22);
        // walk and run cycles keep pace with the ground speed
        if ((st === 'walk' || st === 'run') && this.curState === st) this.cur.setEffectiveTimeScale(Math.min(1.7, Math.max(0.6, sp / (st === 'walk' ? walk : run))));
      }
      this.mixer.update(dt);
    },
    setName(name, color) {
      if (this.tag) { upper.remove(this.tag); if (this.tag.material.map) this.tag.material.map.dispose(); this.tag.material.dispose(); }
      if (!name) { this.tag = null; return; }
      this.tag = labelSprite(name, { size: 0.4, color: color || '#ffffff', bg: 'rgba(8,10,26,0.72)' });
      this.tag.position.y = this.m.tagY; upper.add(this.tag);
    },
    bump(amount) { this.squashV -= amount; },
    swingT: 0,
    swing() {
      this.swingT = 0.32;
      if (this.model && this.acts.strike && this.play('strike', 0.05)) this.strikeT = this.acts.strike.getClip().duration / 1.6 * 0.8;
    },
    // state: { speed, grounded, vy, gliding, board, dt }
    animate(s, dt) {
      const k = Math.min(1, s.speed / 7), M = this.m;
      this.speed = s.speed;
      this.charmT = (this.charmT || 0) + dt; // the charm bobs and turns slowly
      slots.charm.position.y = M.charmY + Math.sin(this.charmT * 2.1) * 0.07; slots.charm.rotation.y = this.charmT * 0.9;
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
        upper.position.y = M.up - 0.08; upper.rotation.x = 0.08; upper.rotation.z = Math.sin(t * 2) * 0.03;
        footL.position.set(-M.footX - 0.04, 0.07, 0.25); footR.position.set(M.footX + 0.04, 0.07, -0.25);
        footL.rotation.set(0, 0.6, 0); footR.rotation.set(0, 0.6, 0);
        handL.position.set(-M.handX - 0.08, M.handY + 0.13, 0.1); handR.position.set(M.handX + 0.08, M.handY + 0.13, -0.1);
      } else if (s.grounded) {
        upper.position.y = M.up + Math.abs(sw) * 0.06 * k + Math.sin(t * 2.2) * 0.012 * (1 - k);
        upper.rotation.x = k * 0.12; upper.rotation.z = sw * 0.04 * k;
        footL.position.set(-M.footX, 0.07 + Math.max(0, cw) * 0.14 * k, sw * 0.26 * k);
        footR.position.set(M.footX, 0.07 + Math.max(0, -cw) * 0.14 * k, -sw * 0.26 * k);
        footL.rotation.set(-sw * 0.4 * k, 0, 0); footR.rotation.set(sw * 0.4 * k, 0, 0);
        handL.position.set(-M.handX, M.handY + Math.sin(t * 2.2) * 0.02, -sw * 0.22 * k);
        handR.position.set(M.handX, M.handY + Math.sin(t * 2.2 + 1) * 0.02, sw * 0.22 * k);
      } else {
        const up = s.vy > 0 ? 1 : 0;
        const g = this.glide;
        upper.position.y = M.up + 0.02; upper.rotation.x = -0.05 + g * 0.25; upper.rotation.z = 0;
        footL.position.set(-M.footX - 0.01, 0.16 + up * 0.08, 0.05 - g * 0.1); footR.position.set(M.footX + 0.01, 0.1, -0.1 - g * 0.1);
        footL.rotation.set(0.3, 0, 0); footR.rotation.set(-0.2, 0, 0);
        handL.position.set(-M.handX - 0.03 - g * 0.35, M.handY + 0.23 + up * 0.2 - g * 0.1, 0); handR.position.set(M.handX + 0.03 + g * 0.35, M.handY + 0.23 + up * 0.2 - g * 0.1, 0);
      }
      // a strike: the right hand sweeps across the body
      if (this.swingT > 0) {
        this.swingT -= dt; const k2 = 1 - Math.max(0, this.swingT) / 0.32, a = Math.sin(k2 * Math.PI);
        handR.position.set(M.handX - 0.75 * k2, M.handY + 0.28 + 0.25 * a, 0.25 + 0.35 * a);
        handR.rotation.set(-1.2 * a, 0, -1.4 * k2 + 0.4);
      } else handR.rotation.set(0, 0, 0);
      // a tail sways, and streams out behind at a run
      if (skins.tail.children.length) { tailPivot.rotation.y = Math.sin(t * 2.6) * 0.22 * (1 - k * 0.6); tailPivot.rotation.x = -0.5 * k + (s.grounded ? 0 : 0.25); }
      slots.back.scale.x = (this.backBase ? this.backBase.x : 1) * (1 + this.glide * 0.9);
      if (this.model) this.animateBody(s, dt);
      headPivot.rotation.x = -upper.rotation.x * 0.5;
      // blob shadow sits on the ground below, shrinking with height
      const gd = Math.min(s.groundDist == null ? 0 : s.groundDist, 12);
      blob.position.y = 0.03 - gd;
      blob.scale.setScalar(Math.max(0.35, 1 - gd * 0.06));
      blob.visible = gd < 12;
    },
  };
  A.setLook(opts.look || null, colors);
  for (const slot of ['head', 'back', 'hand', 'feet', 'board', 'body']) if (opts.eq && opts.eq[slot]) A.equip(slot, opts.eq[slot]);
  if (opts.character) A.setBody(opts.character);
  if (opts.name) A.setName(opts.name, opts.nameColor);
  return A;
}
