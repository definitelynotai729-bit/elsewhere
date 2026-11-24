// The wardrobe: make your character. A screen docked at the side while the camera swings round to face you where you
// stand: a body style, ears and tails, a face, an outfit, colours, the gear you own, and looks you have saved.
// The look is presentation (profile.data.look, outside everything a replay checks); gear goes on through the same
// recorded 'equip' action as the Items panel. Outside the engine.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';
import { items, itemIcon, SLOTS } from './items.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { cleanText } from './util.js';
import { nameProblem, loadFilter } from './safety.js';
import { STYLES, FACES, MOUTHS, TOPS, TAILS, OUTFITS, EXTRAS, FINISHES, SWATCHES, COLOR_PARTS, normaliseLook, legacyColors, randomLook, sameLook } from './looks.js';

const MAX_SAVED = 6;
const TABS = [['body', 'Body'], ['face', 'Face'], ['outfit', 'Outfit'], ['colours', 'Colours'], ['gear', 'Gear'], ['looks', 'Looks']];
const GEAR = [['body', 'Character'], ['head', 'Head'], ['back', 'Back'], ['feet', 'Feet'], ['board', 'Board'], ['hand', 'Hand'], ['charm', 'Charm']];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// the player's look (made from the old three colours the first time)
export function currentLook() { const d = profile.data; return normaliseLook(d.look, d.colors); }
// keep it, and the old colours with it (old clients and NPC code read those)
export function storeLook(L) { const d = profile.data; d.look = L; d.colors = legacyColors(L); }

export function createWardrobe(E, ui) {
  const box = document.getElementById('wardrobe');
  const body = box.querySelector('.wd-body'), tabsBar = box.querySelector('.wd-tabs'), err = box.querySelector('.wd-err');
  const W = {
    open: false, k: 0, tab: 'body', orbit: 0.35, pitch: 0.08, zoom: 1, focus: 0, start: null, startEq: null,
    thumbs: new Map(), queue: [], announceT: 0, dirty: false,
  };

  // ---- portraits of looks, for the cards (one small off-screen scene, a mannequin per framing) ----
  let rig = null;
  function portrait(look, framing) {
    const key = framing + JSON.stringify(look);
    if (W.thumbs.has(key)) return W.thumbs.get(key);
    const renderer = E.render && E.render.renderer;
    if (!renderer) return '';
    if (!rig) {
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4660, 2.1));
      const d = new THREE.DirectionalLight(0xffffff, 2.3); d.position.set(2, 4, 5); scene.add(d);
      const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 30);
      const S = 112, rt = new THREE.WebGLRenderTarget(S, S, { samples: 4 });
      rig = { scene, cam, rt, S, buf: new Uint8Array(S * S * 4), mq: null };
    }
    const { scene, cam, rt, S, buf } = rig;
    if (!rig.mq) { rig.mq = createAvatar(legacyColors(look), { look }); scene.add(rig.mq.root); }
    const A = rig.mq;
    A.setLook(look, legacyColors(look));
    A.animate({ speed: 0, grounded: true, vy: 0, gliding: false, board: false, groundDist: 0 }, 0);
    const M = A.m, head = M.up + M.headY;
    A.root.rotation.y = framing === 'back' ? Math.PI * 0.78 : 0.42;
    if (framing === 'head') { cam.position.set(0, head + 0.12, 1.75); cam.lookAt(0, head + 0.04, 0); }
    else { cam.position.set(0, 1.05, 4.6); cam.lookAt(0, 0.93, 0); }
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, S, S, buf);
    renderer.setRenderTarget(prev);
    for (let i = 0; i < buf.length; i += 4) for (let k = 0; k < 3; k++) { const x = buf[i + k] / 255; buf[i + k] = Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)); }
    const c = document.createElement('canvas'); c.width = c.height = S;
    const ctx = c.getContext('2d'), img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) img.data.set(buf.subarray((S - 1 - y) * S * 4, (S - y) * S * 4), y * S * 4);
    ctx.putImageData(img, 0, 0);
    const url = c.toDataURL();
    if (W.thumbs.size > 400) W.thumbs.clear();
    W.thumbs.set(key, url);
    return url;
  }
  // cards get their pictures a few per frame, so the screen opens at once
  function lazyPic(img, look, framing) {
    const key = framing + JSON.stringify(look);
    if (W.thumbs.has(key)) { img.src = W.thumbs.get(key); return; }
    W.queue.push(() => { if (img.isConnected) img.src = portrait(look, framing); });
  }

  // ---- the look: change it, show it, keep it ----
  const me = () => E.player && E.player.avatar;
  function apply(L, bump = true) {
    storeLook(L);
    const A = me(); if (A) { A.setLook(L, legacyColors(L)); if (bump) A.bump(0.16); }
    W.dirty = true;
    profile.save();
  }
  function change(part, value) {
    const L = currentLook();
    if (L[part] === value) return;
    L[part] = value;
    apply(normaliseLook(L));
    audio.play('click');
    render();
  }
  function setColor(part, value) {
    const L = currentLook();
    if (L.colors[part] === value) return;
    L.colors[part] = value;
    apply(normaliseLook(L), false);
    render();
  }

  // ---- the screen ----
  function card(label, on, look, framing, onPick, title, key) {
    const b = el('button', 'wd-card' + (on ? ' on' : ''));
    if (key) b.dataset.k = key;
    const img = el('img'); img.alt = ''; img.width = img.height = 64;
    lazyPic(img, look, framing);
    b.append(img, el('span', 'wd-name', label));
    if (title) b.title = title;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.onclick = onPick;
    return b;
  }
  function optionGrid(parent, heading, part, list, framing) {
    const L = currentLook();
    parent.append(el('h3', null, heading));
    const g = el('div', 'wd-grid');
    for (const [id, def] of Object.entries(list)) g.append(card(def.name, L[part] === id, normaliseLook(Object.assign({}, L, { [part]: id })), framing, () => change(part, id), null, `${part}:${id}`));
    parent.append(g);
  }
  function chips(parent, heading, part, list) {
    const L = currentLook();
    parent.append(el('h3', null, heading));
    const r = el('div', 'wd-chips');
    for (const [id, def] of Object.entries(list)) { const b = el('button', 'chipbtn' + (L[part] === id ? ' on' : ''), def.name); b.dataset.k = `${part}:${id}`; b.setAttribute('aria-pressed', L[part] === id ? 'true' : 'false'); b.onclick = () => change(part, id); r.append(b); }
    parent.append(r);
  }
  function colourRow(parent, part) {
    const L = currentLook(), cur = L.colors[part];
    const row = el('div', 'wd-colours');
    row.append(el('div', 'wd-clabel', COLOR_PARTS[part]));
    const sw = el('div', 'swatches');
    for (const col of SWATCHES[part]) {
      const b = el('button', 'sw' + (cur === col ? ' on' : '')); b.style.background = col; b.title = col; b.dataset.k = `c:${part}:${col}`; b.setAttribute('aria-label', `${COLOR_PARTS[part]} ${col}`);
      b.onclick = () => setColor(part, col);
      sw.append(b);
    }
    // any colour: the picker (applied when it closes, so dragging through it doesn't make hundreds of materials)
    const pick = el('input', 'sw sw-pick'); pick.type = 'color'; pick.value = cur; pick.title = 'Any colour'; pick.setAttribute('aria-label', `${COLOR_PARTS[part]}: any colour`);
    if (!SWATCHES[part].includes(cur)) pick.classList.add('on');
    pick.onchange = () => setColor(part, pick.value.toLowerCase());
    sw.append(pick);
    row.append(sw); parent.append(row);
  }
  function nameRow(parent) {
    const d = profile.data;
    const r = el('div', 'wd-namerow');
    const inp = el('input'); inp.type = 'text'; inp.maxLength = 18; inp.placeholder = 'Wanderer'; inp.value = d.name || ''; inp.autocomplete = 'off'; inp.id = 'wd-name';
    const b = el('button', 'btn', 'Change name');
    const go = async () => {
      const nm = cleanText(inp.value, 18) || 'Wanderer';
      if (nm === (d.name || 'Wanderer')) { err.classList.add('hidden'); return; }
      const why = await nameProblem(nm);
      if (why) { err.textContent = why; err.classList.remove('hidden'); inp.focus(); return; }
      err.classList.add('hidden');
      d.name = nm; profile.save();
      E.net.announce();
      ui.toast(`You are ${nm} now.`);
    };
    b.onclick = go;
    inp.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') go(); if (ev.key === 'Escape') inp.blur(); };
    const lab = el('label', 'wd-clabel', 'Name'); lab.htmlFor = 'wd-name';
    r.append(lab, inp, b); parent.append(r);
  }
  function renderGear(parent) {
    const d = profile.data;
    const owned = (slot) => Object.keys(d.inv).filter((id) => { const def = items.get(id); return def && def.slot === slot && d.inv[id] > 0; });
    let any = false;
    for (const [slot, label] of GEAR) {
      const ids = owned(slot); if (!ids.length) continue;
      any = true;
      parent.append(el('h3', null, label));
      const g = el('div', 'wd-grid');
      const wear = (id) => { E.queueAction(['equip', id, slot]); audio.play('click'); };
      const none = el('button', 'wd-card' + (d.eq[slot] ? '' : ' on')); none.append(el('span', 'wd-none', '∅'), el('span', 'wd-name', 'None')); none.onclick = () => wear(null); none.dataset.k = `g:${slot}:-`;
      g.append(none);
      for (const id of ids) {
        const def = items.get(id), on = d.eq[slot] === id, later = !on && E.pinned && !E.pinned(def.source);
        const b = el('button', 'wd-card' + (on ? ' on' : '')); b.dataset.k = `g:${slot}:${id}`;
        const img = el('img'); img.alt = ''; img.width = img.height = 64; img.src = itemIcon(E.render.renderer, id);
        b.append(img, el('span', 'wd-name', def.name));
        b.title = later ? 'You can wear it from your next world.' : def.desc || def.name;
        if (later) b.disabled = true;
        b.onclick = () => wear(on ? null : id);
        g.append(b);
      }
      parent.append(g);
      if (slot === 'body') parent.append(el('p', 'muted small', 'A character body is a whole new you, with its own colours: while you wear one, your style, face and outfit wait underneath.'));
    }
    if (!any) parent.append(el('p', 'muted', 'Nothing to wear yet. Hats, characters and more are at Pim\'s shop in Junction, and out in the worlds.'));
  }
  function renderLooks(parent) {
    const d = profile.data, saved = Array.isArray(d.looks) ? d.looks : [];
    parent.append(el('p', 'muted small', `Keep up to ${MAX_SAVED} looks and switch between them. A saved look keeps your hat and character too, if you still have them.`));
    const save = el('button', 'btn', saved.length >= MAX_SAVED ? `${MAX_SAVED} looks saved (remove one first)` : 'Save this look');
    save.disabled = saved.length >= MAX_SAVED;
    save.onclick = () => {
      const list = Array.isArray(d.looks) ? d.looks : (d.looks = []);
      if (list.length >= MAX_SAVED) return;
      const used = new Set(list.map((x) => x.name));
      let n = list.length + 1; while (used.has(`Look ${n}`)) n++;
      list.push({ name: `Look ${n}`, look: currentLook(), head: d.eq.head || null, body: d.eq.body || null });
      profile.save(); audio.play('pickup'); render();
    };
    const r = el('div', 'btnrow'); r.append(save); parent.append(r);
    const g = el('div', 'wd-grid wd-saved');
    saved.forEach((s, i) => {
      const L = normaliseLook(s.look);
      const c = el('div', 'wd-card wd-look');
      const img = el('img'); img.alt = ''; img.width = img.height = 64; lazyPic(img, L, 'body');
      const nm = el('span', 'wd-name', String(s.name || `Look ${i + 1}`).slice(0, 24));
      const wearB = el('button', 'btn small', 'Wear'), del = el('button', 'btn small subtle', 'Remove');
      wearB.onclick = () => {
        apply(L);
        for (const slot of ['head', 'body']) { // its hat and character, when you still own them
          const id = s[slot] || null, own = !id || (d.inv[id] > 0 && items.get(id));
          if (own && d.eq[slot] !== id) E.queueAction(['equip', id, slot]);
        }
        audio.play('pickup'); render();
      };
      del.onclick = () => { d.looks.splice(i, 1); profile.save(); render(); };
      const btns = el('div', 'wd-lookbtns'); btns.append(wearB, del);
      c.append(img, nm, btns); g.append(c);
    });
    parent.append(g);
  }
  function render() {
    const top = body.scrollTop, act = document.activeElement, fk = act && body.contains(act) && act.dataset ? act.dataset.k : null;
    body.innerHTML = ''; W.queue.length = 0;
    tabsBar.querySelectorAll('button').forEach((b) => { const on = b.dataset.tab === W.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    const L = currentLook();
    const char = profile.data.eq.body && items.get(profile.data.eq.body);
    if (char && W.tab !== 'gear' && W.tab !== 'looks') body.append(el('p', 'wd-note', `You are wearing the ${char.name} character, so this look waits underneath. Take it off in Gear to see it.`));
    if (W.tab === 'body') {
      nameRow(body);
      optionGrid(body, 'Style', 'style', STYLES, 'body');
      optionGrid(body, 'Ears and horns', 'top', TOPS, 'head');
      optionGrid(body, 'Tail', 'tail', TAILS, 'back');
      chips(body, 'Finish', 'finish', FINISHES);
    } else if (W.tab === 'face') {
      optionGrid(body, 'Eyes', 'face', FACES, 'head');
      optionGrid(body, 'Mouth', 'mouth', MOUTHS, 'head');
      colourRow(body, 'eyes');
    } else if (W.tab === 'outfit') {
      optionGrid(body, 'Outfit', 'outfit', OUTFITS, 'body');
      optionGrid(body, 'Extra', 'extra', EXTRAS, 'body');
      colourRow(body, 'outfit'); colourRow(body, 'trim');
    } else if (W.tab === 'colours') {
      for (const part of Object.keys(COLOR_PARTS)) colourRow(body, part);
    } else if (W.tab === 'gear') renderGear(body);
    else renderLooks(body);
    body.scrollTop = top;
    if (fk) { const b = body.querySelector(`[data-k="${CSS.escape(fk)}"]`); if (b) b.focus({ preventScroll: true }); } // the keyboard stays where it was
    box.querySelector('.wd-undo').disabled = !W.start || sameLook(L, W.start);
  }
  for (const [id, label] of TABS) {
    const b = el('button', 'tab', label); b.dataset.tab = id; b.setAttribute('role', 'tab');
    b.onclick = () => { if (W.tab === id) return; W.tab = id; body.scrollTop = 0; render(); audio.play('click'); };
    tabsBar.append(b);
  }
  box.querySelector('.wd-random').onclick = () => { apply(randomLook()); audio.play('pickup'); render(); };
  box.querySelector('.wd-undo').onclick = () => { if (W.start) { apply(W.start); render(); } };
  box.querySelector('.wd-done').onclick = () => ui.closePanel();

  // ---- turning the view: drag, the wheel, keys, a pad's right stick ----
  const canvas = document.getElementById('view');
  let drag = null;
  canvas.addEventListener('pointerdown', (ev) => { if (!W.open) return; drag = { x: ev.clientX, y: ev.clientY, id: ev.pointerId }; try { canvas.setPointerCapture(ev.pointerId); } catch (e) {} });
  canvas.addEventListener('pointermove', (ev) => {
    if (!W.open || !drag || ev.pointerId !== drag.id) return;
    W.orbit -= (ev.clientX - drag.x) * 0.011; W.pitch = clamp(W.pitch + (ev.clientY - drag.y) * 0.004, -0.25, 0.6);
    drag.x = ev.clientX; drag.y = ev.clientY;
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (ev) => { if (!W.open) return; W.zoom = clamp(W.zoom * (ev.deltaY > 0 ? 1.1 : 0.9), 0.6, 1.6); }, { passive: true });
  const held = new Set();
  window.addEventListener('keydown', (ev) => {
    if (!W.open) return;
    const t = ev.target; if (t && (t.tagName === 'INPUT' && t.type === 'text')) return;
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown'].includes(ev.code)) { held.add(ev.code); if (ev.code.startsWith('Arrow')) ev.preventDefault(); }
  }, true);
  window.addEventListener('keyup', (ev) => held.delete(ev.code), true);
  window.addEventListener('blur', () => held.clear());

  // ---- open and close (ui.openPanel('wardrobe') and ui.closePanel() call these) ----
  W.show = () => {
    W.open = true; W.start = currentLook(); W.dirty = false; err.classList.add('hidden');
    const A = me(); if (A && !A.look) A.setLook(W.start, legacyColors(W.start));
    W.orbit = 0.35; W.pitch = 0.08; W.zoom = 1;
    box.classList.remove('hidden'); document.body.classList.add('wardrobe-open');
    loadFilter();
    render();
    const f = tabsBar.querySelector('.tab.on'); if (f) f.focus({ preventScroll: true });
  };
  W.hide = () => {
    W.open = false; held.clear(); drag = null; W.queue.length = 0;
    box.classList.add('hidden'); document.body.classList.remove('wardrobe-open');
    if (W.dirty) { E.net.announce(); W.dirty = false; }
  };
  W.refresh = () => { if (W.open) render(); };

  // ---- each frame, after the camera rig: swing round to face the player, with the panel's side left clear ----
  const target = new THREE.Vector3(), pos = new THREE.Vector3(), look = new THREE.Vector3(), from = new THREE.Vector3(), fromLook = new THREE.Vector3(), dir = new THREE.Vector3(), pan = new THREE.Vector3();
  W.frame = (dt) => {
    for (let i = 0; i < 3 && W.queue.length; i++) W.queue.shift()();
    W.k = clamp(W.k + (W.open ? dt : -dt) / 0.55, 0, 1);
    const A = me(), pl = E.player, cam = E.camera;
    // the view's width blends from the one the game keeps (the player's setting; 50 in arenas, where the rig sets it
    // once and never again, so it is put back here when the swing back ends)
    const base = E.camRig.mode ? 50 : E.profile.data.settings.fov;
    if (W.k <= 0) { if (W.wasOn) { W.wasOn = false; cam.fov = base; cam.updateProjectionMatrix(); } return; }
    W.wasOn = true;
    if (!A || !pl) return;
    // turning by keys or the pad's right stick
    const kx = ((held.has('ArrowRight') || held.has('KeyD') || held.has('KeyE')) ? 1 : 0) - ((held.has('ArrowLeft') || held.has('KeyA') || held.has('KeyQ')) ? 1 : 0);
    const ky = (held.has('ArrowDown') ? 1 : 0) - (held.has('ArrowUp') ? 1 : 0);
    W.orbit -= kx * dt * 2.2; W.zoom = clamp(W.zoom + ky * dt * 0.8, 0.6, 1.6);
    const gp = W.open && navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g && g.connected) : null;
    if (gp) { const ax = gp.axes[2] || 0; if (Math.abs(ax) > 0.18) W.orbit -= ax * dt * 2.4; }
    const M = A.m, feet = pl.renderPos.y - 0.93;
    W.focus = clamp(W.focus + ((W.open && W.tab === 'face') ? dt : -dt) * 2.5, 0, 1);
    const f = W.focus * W.focus * (3 - 2 * W.focus);
    const ty = feet + 0.95 + (M.up + M.headY - 0.95) * f;
    // far enough for all of you (or your head, on the Face tab) to fit the part of the screen the panel leaves clear
    // (a portrait lens; where the clear part is short, as above a panel on a tall phone, a wider one, so the camera
    // need not back away into walls)
    const rect = box.getBoundingClientRect(), Wd = innerWidth, Hd = innerHeight;
    const bottom = rect.width > Wd * 0.8, clearY = bottom && rect.height ? Math.max(0.25, 1 - rect.height / Hd) : 1;
    const need = 2.15 + (0.95 - 2.15) * f, fit = (lens) => need / 2 / (Math.tan(lens * Math.PI / 360) * clearY * 0.92);
    let lens = 36, dFit = fit(lens);
    if (dFit > 4.6) { lens = Math.min(64, 2 * Math.atan(need / 2 / (4.6 * clearY * 0.92)) * 180 / Math.PI); dFit = fit(lens); }
    const fov = lens + (base - lens) * (1 - W.k), tanV = Math.tan(fov * Math.PI / 360);
    const dist = Math.max(3.4 + (1.75 - 3.4) * f, dFit) * W.zoom;
    const ang = A.root.rotation.y + W.orbit, cp = Math.cos(W.pitch), sp = Math.sin(W.pitch);
    target.set(pl.renderPos.x, ty, pl.renderPos.z);
    dir.set(Math.sin(ang) * cp, sp, Math.cos(ang) * cp);
    // don't go through walls: stop short of what is between
    let d = dist;
    const P = E.world ? E.world.P : null;
    if (P && pl.col) { const hit = P.ray(target, dir, dist + 0.3, pl.col); if (hit) d = Math.max(0.9, hit.toi - 0.3); }
    // the panel covers one side (the bottom on a tall phone): move the view so you stand in the clear part
    pan.set(0, 0, 0);
    if (rect.width && rect.height) {
      if (bottom) pan.y = -(rect.height / Hd) * d * tanV; // docked at the bottom
      else { const s = (rect.width / Wd) * d * tanV * (Wd / Hd); pan.set(Math.cos(ang) * s, 0, -Math.sin(ang) * s); }
    }
    // swing round you (not through you) from where the rig has the camera
    const e = W.k * W.k * (3 - 2 * W.k);
    from.copy(cam.position).sub(target);
    const r0 = Math.max(0.5, from.length()), yaw0 = Math.atan2(from.x, from.z), pitch0 = Math.asin(clamp(from.y / r0, -1, 1));
    const dy = Math.atan2(Math.sin(ang - yaw0), Math.cos(ang - yaw0));
    const yw = yaw0 + dy * e, pt = pitch0 + (W.pitch - pitch0) * e, r = r0 + (d - r0) * e;
    pos.set(Math.sin(yw) * Math.cos(pt), Math.sin(pt), Math.cos(yw) * Math.cos(pt)).multiplyScalar(r).add(target).addScaledVector(pan, e);
    look.copy(target).add(pan);
    fromLook.copy(E.camRig.target);
    cam.position.copy(pos);
    cam.lookAt(fromLook.lerp(look, e));
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
  };
  return W;
}
