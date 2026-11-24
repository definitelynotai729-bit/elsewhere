// Keyboard + mouse, touch (virtual stick, drag to look, buttons) and gamepad, folded into one state.
import { clamp, isTouch } from './util.js';

// Keyboard, Star Wars: The Old Republic style: W/S forward and back, A/D turn, Q/E strafe, F interact.
// The arrow keys orbit and tilt the camera.
// The Controls tab (controls.js) lists these maps, so what it says is what the keys do.
export const KEYMAP = {
  KeyW: 'f', KeyS: 'b', KeyA: 'tl', KeyD: 'tr', KeyQ: 'sl', KeyE: 'sr',
  ArrowLeft: 'cl', ArrowRight: 'cr', ArrowUp: 'cu', ArrowDown: 'cd',
  Space: 'jump', KeyF: 'use', KeyB: 'board', ShiftLeft: 'walk', ShiftRight: 'walk', KeyR: 'ab3', Digit1: 'atk', Digit2: 'pow',
};
export const TURN_RATE = 2.8; // rad/s for A/D
export const UIKEYS = { KeyI: 'inv', Tab: 'inv', KeyM: 'map', KeyR: 'records', Enter: 'chat', KeyT: 'chat', Escape: 'menu', KeyC: 'camera', KeyH: 'help', KeyP: 'players', KeyO: 'wardrobe' };
// Gamepad buttons (the standard mapping: 0 A/Cross, 1 B/Circle, 2 X/Square, 3 Y/Triangle, 4 LB/L1, 5 RB/R1, 7 RT/R2,
// 8 Back/Share, 9 Start/Options). RT is the strike in most worlds and the third ability in arenas: frameBits keeps the
// one this world's scheme reads. LB and RB are the arena's first two abilities. LT (6) is an artifact's power.
export const PADMAP = { 0: ['jump'], 2: ['use'], 3: ['board'], 4: ['sl'], 5: ['sr'], 6: ['pow'], 7: ['atk', 'ab3'] };
export const PADUI = { 9: 'menu', 8: 'map', 1: 'inv' };

export const input = {
  held: new Set(),
  edges: new Set(),
  move: { x: 0, y: 0 },
  stick: { x: 0, y: 0, active: false },
  pad: { x: 0, y: 0, lx: 0, ly: 0, prev: [] },
  lookDX: 0, lookDY: 0, zoom: 0,
  // camera settings (the Controls tab): a speed for each way of turning the view, and inverted axes
  look: { mouse: 1, touch: 1, keys: 1, pad: 1, invertX: false, invertY: false },
  addLook(dx, dy, src) {
    const L = this.look, k = L[src] == null ? 1 : L[src];
    this.lookDX += dx * k * (L.invertX ? -1 : 1); this.lookDY += dy * k * (L.invertY ? -1 : 1);
  },
  // what the player last used: 'keys', 'pad' or 'touch' (the hint line speaks its language)
  device: 'keys', onDevice: null,
  setDevice(d) { if (this.device !== d) { this.device = d; if (this.onDevice) this.onDevice(d); } },
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
    // the power key: pressed this tick (a tap shorter than a tick still counts), and held (a rewind lasts while it is)
    const powDown = this.take('pow'), powHeld = this.held.has('pow') || this.padPow;
    return (this.take('jump') ? 1 : 0) | (this.jumpHeld ? 2 : 0) | (this.take('board') ? 4 : 0) | (this.take('use') ? 8 : 0) | (this.take('atk') ? 512 : 0)
      | (powDown ? 1024 : 0) | (powDown || powHeld ? 2048 : 0);
  },
  padPow: false,
  onUiKey: null,
  lastLookAt: 0,

  init(canvas) {
    this.canvas = canvas;
    this.touch = isTouch();
    this.device = this.touch ? 'touch' : 'keys';
    // typing into a text box keeps the keys; a focused checkbox or slider does not (Esc still closes the Menu)
    const typing = (e) => { const t = e.target; return t && (t.tagName === 'TEXTAREA' || t.isContentEditable || (t.tagName === 'INPUT' && !/^(checkbox|radio|range|button|submit|reset|color)$/i.test(t.type || 'text'))); };
    window.addEventListener('keydown', (e) => {
      if (typing(e)) return;
      if (!this.touch) this.setDevice('keys');
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
    window.addEventListener('blur', () => { this.held.clear(); this.jumpHeld = false; this.padPow = false; this.dragging = false; });

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
      if (this.locked || this.dragging) { this.addLook(e.movementX || 0, e.movementY || 0, 'mouse'); this.lastLookAt = performance.now(); }
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
      document.body.classList.add('touch'); this.setDevice('touch');
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
          this.addLook((t.clientX - lastLook[0]) * 1.5, (t.clientY - lastLook[1]) * 1.5, 'touch');
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
      if (lx || ly) { this.addLook(lx * 700 * dt, ly * 500 * dt, 'pad'); this.lastLookAt = performance.now(); }
      if (this.pad.x || this.pad.y || lx || ly) this.setDevice('pad');
      this.padKind = /sony|playstation|dualsense|dualshock|054c/i.test(gp.id) ? 'ps' : 'xbox';
      const btn = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      for (const i in PADMAP) {
        const now = btn(+i), was = !!this.pad.prev[i];
        if (now && !was) { this.setDevice('pad'); if (this.enabled) for (const a of PADMAP[i]) { this.edges.add(a); if (a === 'jump') this.jumpHeld = true; } }
        if (!now && was && PADMAP[i][0] === 'jump') this.jumpHeld = this.held.has('jump');
        this.pad.prev[i] = now;
      }
      for (const i in PADUI) {
        const now = btn(+i), was = !!this.pad.prev[i];
        if (now && !was) { this.setDevice('pad'); if (this.onUiKey) this.onUiKey(PADUI[i], null); }
        this.pad.prev[i] = now;
      }
      if (btn(0)) this.jumpHeld = true;
      this.padPow = this.enabled && btn(6);
    } else this.padPow = false;
    let x = 0, y = 0;
    this.turnKeys = 0; this.keyMove = false; this.boardMove.x = this.boardMove.y = 0;
    if (this.enabled) {
      // camera keys: a tap nudges the view, holding turns it at full speed after a short ramp
      const kx = (this.held.has('cr') ? 1 : 0) - (this.held.has('cl') ? 1 : 0);
      const ky = (this.held.has('cd') ? 1 : 0) - (this.held.has('cu') ? 1 : 0);
      // every press turns the view at least a little, even a tap released before the next frame
      const tx = (this.take('cr') ? 1 : 0) - (this.take('cl') ? 1 : 0), ty = (this.take('cd') ? 1 : 0) - (this.take('cu') ? 1 : 0);
      if (tx && !kx) this.addLook(tx * 30, 0, 'keys');
      if (ty && !ky) this.addLook(0, ty * 22, 'keys');
      if ((kx || ky) && this.scheme === 'topdown') { /* the arrows move in arena worlds; the camera is fixed */ }
      else if (kx || ky) {
        this.keyLookT = Math.min(1, this.keyLookT + dt * 3.5);
        const k = 0.3 + 0.7 * this.keyLookT;
        this.addLook(kx * 880 * k * dt, ky * 520 * k * dt, 'keys');
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
    if (!on) { this.held.clear(); this.edges.clear(); this.jumpHeld = false; this.padPow = false; this.dragging = false; this.stick.x = this.stick.y = 0; if (document.pointerLockElement) document.exitPointerLock(); }
  },
};
