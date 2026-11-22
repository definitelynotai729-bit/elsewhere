// Keyboard + mouse, touch (virtual stick, drag to look, buttons) and gamepad, folded into one state.
import { clamp, isTouch } from './util.js';

// Keyboard, Star Wars: The Old Republic style: W/S forward and back, A/D turn, Q/E strafe, F interact.
// The arrow keys orbit and tilt the camera.
const KEYMAP = {
  KeyW: 'f', KeyS: 'b', KeyA: 'tl', KeyD: 'tr', KeyQ: 'sl', KeyE: 'sr',
  ArrowLeft: 'cl', ArrowRight: 'cr', ArrowUp: 'cu', ArrowDown: 'cd',
  Space: 'jump', KeyF: 'use', KeyB: 'board', ShiftLeft: 'walk', ShiftRight: 'walk', KeyR: 'ab3', Digit1: 'atk',
};
export const TURN_RATE = 2.8; // rad/s for A/D
const UIKEYS = { KeyI: 'inv', Tab: 'inv', KeyM: 'map', KeyR: 'records', Enter: 'chat', KeyT: 'chat', Escape: 'menu', KeyC: 'camera' };

export const input = {
  held: new Set(),
  edges: new Set(),
  move: { x: 0, y: 0 },
  stick: { x: 0, y: 0, active: false },
  pad: { x: 0, y: 0, lx: 0, ly: 0, prev: [] },
  lookDX: 0, lookDY: 0, zoom: 0,
  jumpHeld: false,
  locked: false, dragging: false,
  touch: false,
  enabled: true,
  usePointerLock: true,
  mouseLook: false, // the mouse only clicks buttons unless this is switched on in the menu
  keyLookT: 0,
  // keyboard movement is relative to the character's heading (turned with A/D); sticks move relative to the camera
  heading: Math.PI, turnKeys: 0, keyMove: false, keyMode: true,
  boardMove: { x: 0, y: 0 },
  snapHeading(y) { this.heading = y; },
  // A world can choose its control scheme. 'default': the SWTOR-style keys above. 'topdown' (arena games):
  // WASD or the arrows move relative to a fixed camera, Q/E/R are abilities, Space dashes, B recalls.
  scheme: 'default',
  setScheme(s) { this.scheme = s === 'topdown' ? 'topdown' : 'default'; this.edges.clear(); this.jumpHeld = false; },
  // the action bits of one tick (consumes the key presses); recorded in the run, so a replay sees the same
  frameBits() {
    if (this.scheme === 'topdown') this.take('atk'); // the strike key belongs to standard controls
    if (this.scheme === 'topdown') return (this.take('use') ? 8 : 0) | (this.take('sl') ? 16 : 0) | (this.take('sr') ? 32 : 0) | (this.take('ab3') ? 64 : 0) | (this.take('jump') ? 128 : 0) | (this.take('board') ? 256 : 0);
    this.take('sl'); this.take('sr'); this.take('ab3');
    return (this.take('jump') ? 1 : 0) | (this.jumpHeld ? 2 : 0) | (this.take('board') ? 4 : 0) | (this.take('use') ? 8 : 0) | (this.take('atk') ? 512 : 0);
  },
  onUiKey: null,
  lastLookAt: 0,

  init(canvas) {
    this.canvas = canvas;
    this.touch = isTouch();
    const typing = (e) => { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); };
    window.addEventListener('keydown', (e) => {
      if (typing(e)) return;
      const ui = UIKEYS[e.code];
      if (ui && this.onUiKey && !(this.scheme === 'topdown' && e.code === 'KeyR')) { if (this.onUiKey(ui, e) !== false) e.preventDefault(); return; }
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault();
      if (!this.enabled) return;
      if (!e.repeat) this.edges.add(k);
      this.held.add(k);
      if (k === 'jump') this.jumpHeld = true;
    });
    window.addEventListener('keyup', (e) => {
      const k = KEYMAP[e.code];
      if (!k) return;
      this.held.delete(k);
      if (k === 'jump') this.jumpHeld = false;
    });
    window.addEventListener('blur', () => { this.held.clear(); this.jumpHeld = false; this.dragging = false; });

    // mouse look: pointer lock on click, or drag while the button is held
    canvas.addEventListener('mousedown', (e) => {
      if (!this.enabled || !this.mouseLook) return;
      this.dragging = true;
      this.downAt = [e.clientX, e.clientY];
    });
    window.addEventListener('mouseup', (e) => {
      if (this.mouseLook && this.dragging && this.usePointerLock && !this.locked && this.downAt && Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) < 4 && this.enabled) {
        try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {}
      }
      this.dragging = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled || !this.mouseLook) return;
      if (this.locked || this.dragging) { this.lookDX += e.movementX || 0; this.lookDY += e.movementY || 0; this.lastLookAt = performance.now(); }
    });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });
    canvas.addEventListener('wheel', (e) => { this.zoom += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // touch: left part of the screen is a floating stick, the rest drags the camera
    const stickEl = document.getElementById('stick'), knob = document.getElementById('stick-knob');
    let stickId = null, lookId = null, origin = [0, 0], lastLook = [0, 0];
    const R = 56;
    canvas.addEventListener('touchstart', (e) => {
      this.touch = true;
      document.body.classList.add('touch');
      for (const t of e.changedTouches) {
        if (stickId === null && t.clientX < window.innerWidth * 0.45) {
          stickId = t.identifier; origin = [t.clientX, t.clientY];
          this.stick.active = true;
          if (stickEl) { stickEl.style.left = origin[0] + 'px'; stickEl.style.top = origin[1] + 'px'; stickEl.classList.add('on'); knob.style.transform = 'translate(-50%,-50%)'; }
        } else if (lookId === null) { lookId = t.identifier; lastLook = [t.clientX, t.clientY]; }
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) {
          let dx = t.clientX - origin[0], dy = t.clientY - origin[1];
          const l = Math.hypot(dx, dy);
          if (l > R) { dx *= R / l; dy *= R / l; }
          this.stick.x = dx / R; this.stick.y = -dy / R;
          if (knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        } else if (t.identifier === lookId) {
          this.lookDX += (t.clientX - lastLook[0]) * 1.5; this.lookDY += (t.clientY - lastLook[1]) * 1.5;
          lastLook = [t.clientX, t.clientY]; this.lastLookAt = performance.now();
        }
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) { stickId = null; this.stick.x = this.stick.y = 0; this.stick.active = false; if (stickEl) stickEl.classList.remove('on'); }
        if (t.identifier === lookId) lookId = null;
      }
    };
    canvas.addEventListener('touchend', end); canvas.addEventListener('touchcancel', end);
    // on-screen buttons
    document.querySelectorAll('[data-btn]').forEach((b) => {
      const name = b.dataset.btn;
      b.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        b.classList.add('down');
        if (['inv', 'map', 'chat', 'menu'].includes(name)) { if (this.onUiKey) this.onUiKey(name, e); return; }
        if (!this.enabled) return;
        this.edges.add(name); this.held.add(name);
        if (name === 'jump') this.jumpHeld = true;
      }, { passive: false });
      const up = (e) => { e.preventDefault(); b.classList.remove('down'); this.held.delete(name); if (name === 'jump') this.jumpHeld = false; };
      b.addEventListener('touchend', up); b.addEventListener('touchcancel', up);
    });
    if (this.touch) document.body.classList.add('touch');
  },

  // called once per rendered frame
  poll(dt) {
    const gp = navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g && g.connected) : null;
    this.pad.x = this.pad.y = 0;
    if (gp) {
      const dz = (v) => (Math.abs(v) < 0.18 ? 0 : v);
      this.pad.x = dz(gp.axes[0] || 0); this.pad.y = -dz(gp.axes[1] || 0);
      const lx = dz(gp.axes[2] || 0), ly = dz(gp.axes[3] || 0);
      if (lx || ly) { this.lookDX += lx * 700 * dt; this.lookDY += ly * 500 * dt; this.lastLookAt = performance.now(); }
      const btn = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const map = { 0: 'jump', 2: 'use', 3: 'board' };
      for (const i in map) {
        const now = btn(+i), was = !!this.pad.prev[i];
        if (now && !was && this.enabled) { this.edges.add(map[i]); if (map[i] === 'jump') this.jumpHeld = true; }
        if (!now && was && map[i] === 'jump') this.jumpHeld = this.held.has('jump');
        this.pad.prev[i] = now;
      }
      for (const [i, name] of [[9, 'menu'], [8, 'map'], [1, 'inv']]) {
        const now = btn(i), was = !!this.pad.prev[i];
        if (now && !was && this.onUiKey) this.onUiKey(name, null);
        this.pad.prev[i] = now;
      }
      if (btn(0)) this.jumpHeld = true;
    }
    let x = 0, y = 0;
    this.turnKeys = 0; this.keyMove = false; this.boardMove.x = this.boardMove.y = 0;
    if (this.enabled) {
      // camera keys: a tap nudges the view, holding turns it at full speed after a short ramp
      const kx = (this.held.has('cr') ? 1 : 0) - (this.held.has('cl') ? 1 : 0);
      const ky = (this.held.has('cd') ? 1 : 0) - (this.held.has('cu') ? 1 : 0);
      // every press turns the view at least a little, even a tap released before the next frame
      const tx = (this.take('cr') ? 1 : 0) - (this.take('cl') ? 1 : 0), ty = (this.take('cd') ? 1 : 0) - (this.take('cu') ? 1 : 0);
      if (tx && !kx) this.lookDX += tx * 30;
      if (ty && !ky) this.lookDY += ty * 22;
      if ((kx || ky) && this.scheme === 'topdown') { /* the arrows move in arena worlds; the camera is fixed */ }
      else if (kx || ky) {
        this.keyLookT = Math.min(1, this.keyLookT + dt * 3.5);
        const k = 0.3 + 0.7 * this.keyLookT;
        this.lookDX += kx * 880 * k * dt; this.lookDY += ky * 520 * k * dt;
        this.lastLookAt = performance.now();
      } else this.keyLookT = 0;
      // keys: forward/back (backpedal is slower), strafe, and turning (applied to the heading each tick)
      if (this.scheme === 'topdown') { // screen-relative movement: WASD or the arrows
        const tx2 = ((this.held.has('tr') || this.held.has('cr')) ? 1 : 0) - ((this.held.has('tl') || this.held.has('cl')) ? 1 : 0);
        const ty2 = ((this.held.has('f') || this.held.has('cu')) ? 1 : 0) - ((this.held.has('b') || this.held.has('cd')) ? 1 : 0);
        this.held.delete('sl'); this.held.delete('sr');
        x = tx2; y = ty2; const l2 = Math.hypot(x, y); if (l2 > 1) { x /= l2; y /= l2; }
        for (const s of [this.stick, this.pad]) if (Math.hypot(s.x, s.y) > Math.hypot(x, y)) { x = clamp(s.x, -1, 1); y = clamp(s.y, -1, 1); }
        this.keyMode = false; this.turnKeys = 0;
        this.move.x = x; this.move.y = y;
        return;
      }
      const fwd = (this.held.has('f') ? 1 : 0) - (this.held.has('b') ? 1 : 0);
      const strafe = (this.held.has('sr') ? 1 : 0) - (this.held.has('sl') ? 1 : 0);
      this.turnKeys = (this.held.has('tr') ? 1 : 0) - (this.held.has('tl') ? 1 : 0);
      x = strafe; y = fwd > 0 ? 1 : fwd < 0 ? -0.6 : 0;
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      this.keyMove = !!(x || y);
      if (this.keyMove || this.turnKeys) this.keyMode = true;
      // on a board A/D (and Q/E) steer and S brakes fully
      this.boardMove.x = clamp(this.turnKeys + strafe, -1, 1); this.boardMove.y = fwd;
      for (const s of [this.stick, this.pad]) if (Math.hypot(s.x, s.y) > Math.hypot(x, y) && Math.hypot(s.x, s.y) > 0.05) {
        x = clamp(s.x, -1, 1); y = clamp(s.y, -1, 1); this.keyMode = false; this.keyMove = false;
        this.boardMove.x = x; this.boardMove.y = y;
      }
      if (this.held.has('walk')) { x *= 0.45; y *= 0.45; }
    }
    this.move.x = x; this.move.y = y;
  },
  take(name) { if (this.edges.has(name)) { this.edges.delete(name); return true; } return false; },
  endFrame() { this.lookDX = 0; this.lookDY = 0; this.zoom = 0; },
  setEnabled(on) {
    this.enabled = on;
    if (!on) { this.held.clear(); this.edges.clear(); this.jumpHeld = false; this.dragging = false; this.stick.x = this.stick.y = 0; if (document.pointerLockElement) document.exitPointerLock(); }
  },
};
