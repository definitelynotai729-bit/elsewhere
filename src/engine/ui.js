// HUD, dialogs, panels (items, worlds, settings, shop), chat and overlays. Plain DOM.
import * as THREE from 'three';
import { items, itemIcon, TRAITS, RARITY, traitAllowed, SLOTS, FAMILIES, familyAllowed, powerOf } from './items.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { cleanText, fmtTime } from './util.js';
import { summarize } from './run.js';
import { fingerprint } from './net.js';
import { normalise, applySettings, resetSettings, QUALITY } from './settings.js';
import { controlRows, keyName } from './controls.js';
import { QUICK, CHAT_MODES, chatMode, loadFilter, filterReady, shownName, shownLabel, nameProblem, blockList, setBlockedKey } from './safety.js';
import { feedbackMessage, sendFeedback, MAX_TEXT } from './feedback.js';

const $ = (s) => document.querySelector(s);
const _v = new THREE.Vector3(), _c = new THREE.Vector3();
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function createUI(E) {
  let busy = 0;
  const setBusy = (d) => { busy = Math.max(0, busy + d); E.input.setEnabled(busy === 0); document.body.classList.toggle('busy', busy > 0); };
  let dialogs = Promise.resolve(); // the dialog box's queue: each opens after the one before it has closed
  const inTurn = (open) => { const p = dialogs.then(open); dialogs = p.then(() => {}, () => {}); return p; };
  let dialogKey = null;
  // anything a panel does to the game state becomes a recorded action, applied on the next tick
  const live = () => E.sim && E.world && !E.sim.ended && !E.traveling;
  // every change to what a player owns goes through a recorded visit (between visits it waits for the next one)
  const act = (a) => E.queueAction(a);
  const safeData = (v) => { try { const t = JSON.stringify(v); return t && t.length <= 4000 ? JSON.parse(t) : null; } catch (e) { return null; } };

  const ui = {
    get busy() { return busy > 0; },
    // the loading screen: each step moves the bar along (the steps are few and quick, so it is a guide, not a measure)
    loading(msg) {
      $('#load-msg').textContent = msg; this._steps = (this._steps || 0) + 1;
      const bar = $('#load-bar'); if (bar) bar.style.width = Math.min(90, 14 + this._steps * 19) + '%';
    },
    hideLoading() {
      const bar = $('#load-bar'); if (bar) bar.style.width = '100%';
      $('#loading').classList.add('gone'); setTimeout(() => $('#loading').remove(), 900);
    },
    // the title, on a first visit: the game's name over the live world, a name to go by, and Play. Resolves on Play
    titleCard() {
      return new Promise((resolve) => {
        const d = profile.data, t = $('#title'), name = $('#ti-name'), online = $('#ti-online'), play = $('#ti-play'), err = $('#ti-err');
        this.onTitle = true; t.classList.remove('hidden'); setBusy(1); document.body.classList.add('titling');
        name.value = d.name && d.name !== 'Wanderer' ? d.name : ''; online.checked = d.online;
        loadFilter(); // names are checked on Play (game portals ask for this): have the list here by then
        let checking = false;
        const go = async () => {
          if (!this.onTitle || checking) return;
          const nm = cleanText(name.value, 18);
          if (nm) { checking = true; const why = await nameProblem(nm); checking = false; if (why) { err.textContent = why; err.classList.remove('hidden'); name.focus(); return; } }
          err.classList.add('hidden');
          if (!this.onTitle) return;
          d.name = nm || 'Wanderer'; d.online = online.checked;
          if (!d.created) d.created = Date.now();
          profile.save();
          this.onTitle = false; t.classList.add('gone'); setTimeout(() => t.classList.add('hidden'), 650); setBusy(-1); document.body.classList.remove('titling');
          audio.unlock(); audio.play('portal');
          E.net.setEnabled(d.online, E.world && E.world.id); E.net.announce();
          resolve();
        };
        play.onclick = go;
        name.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') go(); };
        if (!E.input.touch) setTimeout(() => play.focus(), 50);
      });
    },
    fade(on) { $('#fade').classList.toggle('on', on); return new Promise((r) => setTimeout(r, on ? 380 : 50)); },
    flash() { const f = $('#fade'); f.classList.add('flash'); setTimeout(() => f.classList.remove('flash'), 160); },
    hurt() { const f = $('#fade'); f.classList.add('hurt'); setTimeout(() => f.classList.remove('hurt'), 220); },
    // the Founder's Crown senses echoes: 0..1 (closer is more), or -1 to hide. Five bars; the DOM changes only when they do
    signal(s) {
      const n = s < 0 ? -1 : Math.min(5, Math.ceil(s * 5)); if (this._signal === n) return; this._signal = n;
      const box = $('#signal'); box.classList.toggle('on', n >= 0); box.textContent = '';
      if (n < 0) return;
      for (let i = 0; i < 5; i++) { const b = document.createElement('b'); b.style.height = (5 + i * 2.6) + 'px'; if (i < n) b.className = 'lit'; box.append(b); }
      const l = document.createElement('span'); l.textContent = n >= 4 ? 'ECHO, VERY CLOSE' : n >= 2 ? 'ECHO NEARBY' : 'FAINT ECHO'; box.append(l);
    },
    // hearts in worlds with enemies (0 max hides them); the DOM changes only when the numbers do
    hearts(n, max) {
      const k = n + '/' + max; if (this._hearts === k) return; this._hearts = k;
      const box = $('#hearts'); box.classList.toggle('on', max > 0); box.textContent = '';
      for (let i = 0; i < max; i++) { const s = document.createElement('span'); s.textContent = '♥'; if (i >= n) s.className = 'empty'; box.append(s); }
    },
    toast(text, kind) {
      const t = el('div', 'toast ' + (kind || ''), text);
      $('#toasts').appendChild(t);
      setTimeout(() => t.classList.add('out'), 3200);
      setTimeout(() => t.remove(), 3700);
    },
    prompt(text) {
      const p = $('#prompt');
      if (!text) { p.classList.remove('on'); return; }
      p.innerHTML = '';
      p.append(el('kbd', null, E.input.touch ? 'TAP' : 'F'), el('span', null, text));
      p.classList.add('on');
    },
    bannerAt: -1e9, // when the last banner began (a banner shows for 3.4 s; weekly.js waits for the next free moment)
    banner(title, sub) {
      this.bannerAt = performance.now();
      const b = $('#banner');
      b.querySelector('h1').textContent = title; b.querySelector('p').textContent = sub || '';
      b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    },
    objective(t, o) {
      $('#objective').textContent = t || ''; $('#objective').classList.toggle('on', !!t);
      this.mark = t && o && o.at ? new THREE.Vector3(o.at[0], o.at[1], o.at[2]) : null;
    },
    // every frame: the objective's marker, a pin over the place to go with its distance. While that place is out of
    // view, the pin waits at the edge of the screen with an arrow toward it. It hides when you are there.
    frame() {
      this.powerHud();
      const m = $('#marker'), at = this.mark, pl = E.player, cam = E.camera;
      const hide = () => { if (this._mk) { m.classList.remove('on'); this._mk = false; } };
      if (!m || !at || !pl || !cam || busy > 0 || this.panelOpen || this.onTitle || E.traveling || (E.builder && E.builder.active) || (E.camRig && E.camRig.shot)) return hide();
      const p = pl.renderPos, d = Math.hypot(at.x - p.x, at.y - p.y, at.z - p.z);
      if (d < 4.5) return hide();
      const W = innerWidth, H = innerHeight, pad = 48, top = 120;
      cam.updateMatrixWorld();
      _c.copy(at).applyMatrix4(cam.matrixWorldInverse); // camera space: x right, y up, ahead is -z
      let x = 0, y = 0, on = false;
      if (_c.z < -0.5) { _v.copy(at).project(cam); x = (_v.x + 1) / 2 * W; y = (1 - _v.y) / 2 * H; on = x > pad && x < W - pad && y > top && y < H - pad; }
      if (!on) {
        // toward it: ahead, the way it lies on screen; behind you, low on the side to turn toward
        let dx = _c.x, dy = -_c.y;
        if (_c.z >= -0.5) { dx = Math.max(-1, Math.min(1, _c.x / (Math.abs(_c.z) + 1))); dy = 0.9; }
        const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        const cx = W / 2, cy = (top + H - pad) / 2, hw = W / 2 - pad, hh = (H - pad - top) / 2;
        const k = Math.min(hw / Math.max(Math.abs(ux), 1e-4), hh / Math.max(Math.abs(uy), 1e-4));
        x = cx + ux * k; y = cy + uy * k;
        m.querySelector('.mk-arrow').style.transform = `rotate(${Math.atan2(uy, ux).toFixed(3)}rad) translateX(26px)`;
      }
      m.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (this._mkEdge !== !on) { this._mkEdge = !on; m.classList.toggle('edge', !on); }
      const txt = Math.round(d) + ' m';
      if (txt !== this._mkd) { this._mkd = txt; m.querySelector('.mk-d').textContent = txt; }
      if (!this._mk) { m.classList.add('on'); this._mk = true; }
    },
    timer(text, show, final) { const t = $('#timer'); t.textContent = text; t.classList.toggle('on', !!show); t.classList.toggle('final', !!final); },
    // the artifact in your charm slot: its icon, its key, and whether it is ready, at work, recharging or asleep here
    // (#power on screen; on a phone the same face is the POWER button)
    powerHud() {
      const pl = E.player, d = profile.data, id = d.eq.charm, def = id && items.get(id);
      const boxes = [$('#power'), $('#tb-power')];
      if (!pl || !def || !powerOf(def)) { if (this._pw !== 'none') { this._pw = 'none'; boxes.forEach((b) => b && b.classList.add('hidden')); } return; }
      const P = pl.pw, pw = pl.power, key = E.input.device === 'pad' ? (E.input.padKind === 'ps' ? 'L2' : 'LT') : E.input.touch ? '' : '2';
      let state, frac = 0, text = '';
      if (!pw) { state = 'asleep'; text = 'asleep'; }
      else if (P.kind) { state = 'on'; frac = P.kind === 'rewind' ? Math.min(1, P.back / pw.seconds) : Math.max(0, P.t) / (P.kind === 'transform' || P.kind === 'shield' || P.kind === 'finder' ? pw.seconds : 1); text = P.kind === 'rewind' ? '◀◀ ' + Math.round(P.back) + ' s' : Math.ceil(P.t) + ' s'; }
      else if ((P.cds[pw.item] || 0) > 0) { const cd = P.cds[pw.item]; state = 'cd'; frac = cd / pw.cooldown; text = Math.ceil(cd) + ' s'; }
      else { state = 'ready'; text = TRAITS[pw.kind] ? TRAITS[pw.kind].name : pw.kind; }
      const sig = `${id}|${state}|${text}|${Math.round(frac * 60)}|${key}`;
      if (sig === this._pw) return;
      this._pw = sig;
      for (const b of boxes) {
        if (!b) continue;
        b.classList.remove('hidden');
        if (b.dataset.item !== id) { b.dataset.item = id; b.querySelector('img').src = itemIcon(E.render.renderer, id); b.title = `${def.name}: ${def.desc}`; }
        b.dataset.state = state;
        b.style.setProperty('--frac', String(state === 'cd' ? frac : state === 'on' ? frac : 0));
        b.querySelector('.pw-key').textContent = key;
        b.querySelector('.pw-t').textContent = text;
      }
    },
    refreshHud() {
      const d = profile.data;
      $('#coin-n').textContent = d.coins;
      document.querySelectorAll('#sigils i').forEach((i) => i.classList.toggle('got', !!d.flags['sigil.' + i.dataset.s] || (d.inv['sigil-' + i.dataset.s] || 0) > 0));
      $('#world-name').textContent = E.world ? E.world.mod.name : '';
      if (E.weekly) E.weekly.hud();
      const ab = $('#abilities'); ab.innerHTML = '';
      const pl = E.player;
      if (pl) for (const [k, on] of Object.entries(pl.abil)) if (on === true) ab.append(el('span', 'ab', TRAITS[k] ? TRAITS[k].name : k));
      if (pl && pl.abil.board && !pl.board) ab.append(el('span', 'ab hint', E.input.touch ? 'BOARD button to ride' : 'B to ride'));
      this.touchButtons();
    },
    // on a phone, a button shows only where it does something: BOARD with a board to ride, STRIKE where there are
    // foes or with a blade in hand, CHAT while shown to other players (and chat is not off), TALK once voice chat is on
    touchButtons() {
      const tu = $('#touch-ui'), d = profile.data, pl = E.player;
      if (!tu || !pl) return;
      const hand = d.eq.hand && items.get(d.eq.hand), blade = !!(hand && hand.traits && hand.traits.includes('blade'));
      tu.classList.toggle('no-board', !pl.abil.board);
      tu.classList.toggle('no-strike', (!blade && !(E.world && E.world.foes && E.world.foes.length)) || !!(E.world && E.world.rules.fighting === false));
      tu.classList.toggle('no-chat', !d.online || chatMode() === 'off');
      tu.classList.toggle('no-talk', !(E.voice && E.voice.enabled));
    },
    online(n) { $('#online-n').textContent = n; $('#online').classList.toggle('alone', n <= 1); },
    // voice chat status, next to the player count
    voice(enabled, live, mode) {
      const v = $('#voice'); if (!v) return;
      this.touchButtons();
      v.classList.toggle('on', enabled); v.classList.toggle('live', live);
      v.textContent = !enabled ? '' : live ? 'Talking' : (mode === 'open' ? 'Mic on' : (E.input.touch ? 'Hold TALK to talk' : 'Hold V to talk'));
    },
    coinPop() { const c = $('#coins'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); },
    // re-render whatever panel is open (after a recorded action has been applied)
    // (keeping the scroll position, unless the Menu changed tabs)
    refreshPanel() {
      if (!this.panelOpen) return;
      const body = $('#panel .panel-body'), top = this._resetScroll ? 0 : body.scrollTop; this._resetScroll = false;
      body.innerHTML = '';
      const k = this.panelOpen;
      if (k === 'wardrobe') { E.wardrobe.refresh(); return; }
      if (k === 'inv') this.renderInventory(body); else if (k === 'map') this.renderMap(body); else if (k === 'records') this.renderRecords(body); else if (k === 'gate') this.renderGate(body);
      else if (k === 'players') this.renderPlayers(body); else if (k === 'privacy') this.renderPrivacy(body);
      else if (k.startsWith('shop:')) this.renderShop(body); else if (k === 'menu') this.renderMenu(body);
      body.scrollTop = top;
    },

    // ---- dialogs ----
    // One at a time: a dialog asked for while another is open waits its turn. Taking the box over left the first
    // one open for ever, and the game without input.
    dialog(name, lines) {
      return inTurn(() => new Promise((resolve) => {
        const d = $('#dialog'); setBusy(1);
        d.querySelector('.who').textContent = name || '';
        d.querySelector('.choices').innerHTML = '';
        d.classList.remove('hidden');
        let i = 0, typing = null;
        const show = () => {
          const text = String(lines[i] || '');
          const tgt = d.querySelector('.text'); tgt.textContent = '';
          let k = 0; clearInterval(typing);
          typing = setInterval(() => { k += 2; tgt.textContent = text.slice(0, k); if (k % 6 === 0) audio.play('blip'); if (k >= text.length) { clearInterval(typing); typing = null; } }, 16);
          d.querySelector('.more').textContent = i < lines.length - 1 ? '▼' : '✕';
        };
        const next = () => {
          if (typing) { clearInterval(typing); typing = null; d.querySelector('.text').textContent = String(lines[i]); return; }
          i++;
          if (i >= lines.length) { close(); return; }
          show();
        };
        const close = () => { d.classList.add('hidden'); d.onclick = null; dialogKey = null; setBusy(-1); resolve(); };
        d.onclick = next;
        dialogKey = (k) => { if (k === 'Escape') close(); else if (['KeyE', 'Space', 'Enter', 'KeyF'].includes(k)) next(); };
        show();
      }));
    },
    choice(name, text, options) {
      return inTurn(() => new Promise((resolve) => {
        const d = $('#dialog'); setBusy(1);
        d.querySelector('.who').textContent = name || '';
        d.querySelector('.text').textContent = text;
        d.querySelector('.more').textContent = '';
        const box = d.querySelector('.choices'); box.innerHTML = '';
        const done = (idx) => { d.classList.add('hidden'); box.innerHTML = ''; dialogKey = null; d.onclick = null; setBusy(-1); audio.play('click'); resolve(idx); };
        options.forEach((o, idx) => { const b = el('button', 'choice', `${idx + 1}. ${o}`); b.onclick = (ev) => { ev.stopPropagation(); done(idx); }; box.append(b); });
        d.onclick = null;
        d.classList.remove('hidden');
        dialogKey = (k) => { if (k === 'Escape') done(-1); const n = parseInt(k.replace('Digit', ''), 10); if (n >= 1 && n <= options.length) done(n - 1); };
      }));
    },
    handleKey(code) { if (dialogKey) { dialogKey(code); return true; } return false; },

    // ---- panels ----
    panelOpen: null,
    openPanel(kind) {
      if (this.panelOpen === kind) { this.closePanel(); return; }
      if (this.panelOpen) this.closePanel();
      if (kind === 'wardrobe') { if (!E.wardrobe || !E.player) return; this.panelOpen = kind; setBusy(1); E.wardrobe.show(); audio.play('click'); return; }
      const p = $('#panel'), body = p.querySelector('.panel-body'), h = p.querySelector('h2');
      body.innerHTML = '';
      this.panelOpen = kind; setBusy(1);
      p.classList.remove('hidden');
      if (kind === 'inv') { h.textContent = 'Items'; this.renderInventory(body); }
      else if (kind === 'map') { h.textContent = 'Worlds'; this.renderMap(body); }
      else if (kind === 'menu') { h.textContent = 'Menu'; this.renderMenu(body); }
      else if (kind.startsWith('shop:')) { h.textContent = this.shopData.title; this.renderShop(body); }
      else if (kind === 'records') { h.textContent = 'Leaderboards'; this.renderRecords(body); }
      else if (kind === 'gate') { h.textContent = "The Creator's Gate"; this.renderGate(body); }
      else if (kind === 'players') { h.textContent = 'Players here'; this.renderPlayers(body); }
      else if (kind === 'privacy') { h.textContent = 'Privacy'; this.renderPrivacy(body); }
      // a panel opened from another starts at its top (the browser keeps a hidden box's scroll and gives it back
      // when it shows again, so this comes after it is shown)
      body.scrollTop = 0;
      audio.play('click');
    },
    closePanel() { if (!this.panelOpen) return; const k = this.panelOpen; this.panelOpen = null; if (k === 'wardrobe') E.wardrobe.hide(); else $('#panel').classList.add('hidden'); setBusy(-1); E.refreshHudSoon(); },

    renderInventory(body) {
      const d = profile.data, rules = E.world ? E.world.rules : {};
      let pendingItems = 0;
      let verified = this._verified; // fetched once per opening (below)
      const ids = Object.keys(d.inv).filter((id) => items.get(id));
      const intro = el('p', 'muted', ids.length ? `Items keep their abilities in every world that allows them. ${E.world ? E.world.mod.name : 'This world'}'s rules decide what works here.` : 'No items yet. Explore worlds, finish challenges, or visit the shop in Junction.');
      body.append(intro);
      const wr = el('div', 'btnrow'), wb = el('button', 'btn', `Wardrobe: change your look (${keyName('KeyO')})`);
      wb.onclick = () => this.openPanel('wardrobe'); wr.append(wb); body.append(wr);
      const grid = el('div', 'grid');
      ids.sort((a, b) => (items.get(a).slot || 'z').localeCompare(items.get(b).slot || 'z'));
      for (const id of ids) {
        const def = items.get(id);
        const card = el('div', 'card item');
        const img = el('img'); img.src = itemIcon(E.render.renderer, id); img.alt = '';
        const name = el('div', 'name', def.name); name.style.color = RARITY[def.rarity] || '#fff';
        const meta = el('div', 'meta', `${def.rarity}${def.slot ? ' · ' + def.slot : ''}${d.inv[id] > 1 ? ' · ×' + d.inv[id] : ''}`);
        const desc = el('div', 'desc', def.desc);
        if (def.by) desc.append(el('div', 'meta', `Made by ${def.by}${def.from ? ' · reward for clearing ' + def.from : ''}`)); // a creator item
        const traits = el('div', 'traits');
        if (def.family && FAMILIES[def.family]) { // magic or machine: a world can put the whole family to sleep
          const ok = familyAllowed(def, rules), F = FAMILIES[def.family];
          const chip = el('span', 'chip fam ' + def.family + (ok ? '' : ' off'), F.name + (ok ? '' : ' · asleep here'));
          chip.title = ok ? `${F.name}: works in worlds that allow it.` : `${F.name}: ${F.off}.`;
          traits.append(chip);
        }
        for (const t of def.traits) {
          const ok = traitAllowed(t, rules);
          // why it is off: a world's switch (no fighting, no artifacts), or the trait itself is denied here
          const why = ok ? '' : t === 'blade' && rules.fighting === false ? ' · no fighting here' : powerOf(def) && rules.powers === false ? ' · artifacts sleep here' : ' · off here';
          const chip = el('span', 'chip ' + (ok ? 'ok' : 'off'), (TRAITS[t] ? TRAITS[t].name : t) + why);
          chip.title = TRAITS[t] ? TRAITS[t].desc : t;
          traits.append(chip);
        }
        const pw = powerOf(def);
        if (pw) traits.append(el('div', 'pwline', pw.kind === 'rewind' ? `Up to ${pw.seconds} s back · recharges in ${pw.cooldown} s` : `Lasts ${pw.seconds} s · recharges in ${pw.cooldown} s`));
        card.append(img, name, meta, desc, traits);
        if (def.slot) {
          const on = d.eq[def.slot] === id, later = !on && E.pinned && !E.pinned(def.source); // its level loaded after this visit began
          const b = el('button', on ? 'btn on' : 'btn', on ? 'Unequip' : later ? 'Equip (from your next world)' : 'Equip');
          if (later) b.disabled = true;
          b.onclick = () => { b.disabled = true; act(['equip', on ? null : id, def.slot], () => { E.equip(on ? null : id, def.slot); this.refreshPanel(); }); };
          card.append(b);
        }
        grid.append(card);
        // verified ownership: the ledger's state for this player holds the item (else it is waiting to be verified)
        const badge = el('div', 'meta', ''); card.insertBefore(badge, desc);
        if (verified !== undefined) {
          // saved for good once the checker has replayed the run that gave it; before that it is sent and waiting
          // (or not sent yet: offline, or saving online is off)
          const ok = !!(verified && verified.state.inv[id]), off = profile.data.settings.verify === false;
          badge.textContent = ok ? '✓ saved' : off ? 'not saved online' : E.outbox.length ? 'saving…' : '✓ sent · being checked';
          badge.title = ok ? 'Saved online and checked: yours on any device.' : off ? 'Save my progress online is off (Menu, Online).' : 'Sent. The checker replays new runs about every half hour (an hour when GitHub is busy); then it shows as saved.';
          if (!ok) pendingItems++;
        }
      }
      body.append(grid);
      if (pendingItems && profile.data.settings.verify !== false) body.insertBefore(el('p', 'muted small', 'New items show "being checked" until the checker has replayed the visit that gave them: about every half hour, sometimes an hour. They are already sent.'), grid);
      if (!this._verifiedAt || Date.now() - this._verifiedAt > 60000) { this._verifiedAt = Date.now(); E.verifiedState().then((v) => { this._verified = v || null; if (this.panelOpen === 'inv') this.refreshPanel(); }); }
      // what this browser held before verified ownership began: kept as mementos, not usable
      if (d.legacy && Object.keys(d.legacy.inv || {}).length) {
        body.append(el('h3', null, 'Keepsakes'));
        body.append(el('p', 'muted small', `From before saved progress began (${d.legacy.at}). Keepsakes only: everything you use now was earned since.`));
        body.append(el('p', 'muted small', Object.keys(d.legacy.inv).map((id) => (items.get(id) ? items.get(id).name : id)).join(' · ') + (d.legacy.coins ? ` · ◆ ${d.legacy.coins}` : '')));
      }
    },
    renderMap(body) {
      body.append(el('p', 'muted', 'Step into a portal in Junction, or travel from here.'));
      const list = el('div', 'worlds');
      for (const w of E.registry.worlds) {
        if (w.listed === false) continue; // a secret world, reached only from inside the game (the Origin)
        const row = el('div', 'world-row');
        const dot = el('span', 'wdot'); dot.style.background = w.color || '#888';
        const info = el('div', 'winfo');
        info.append(el('div', 'wname', w.name), el('div', 'wblurb', w.blurb || ''));
        const sv = profile.data.worlds[w.id];
        const coins = sv ? Object.keys(sv.coins || {}).length : 0;
        const tot = sv && sv.coinTotal;
        const meta = el('div', 'wmeta', `by ${w.author || 'unknown'}${tot ? ` · ${coins}/${tot} coins collected` : ''}`);
        if (w.sha256) meta.title = 'Version ' + w.sha256.slice(0, 10) + ' (checked on load)';
        info.append(meta);
        const here = E.world && E.world.id === w.id;
        const b = el('button', 'btn' + (here ? ' on' : ''), here ? 'You are here' : 'Travel');
        b.disabled = here;
        b.onclick = () => { this.closePanel(); E.leaveTo(w.id); };
        row.append(dot, info, b);
        list.append(row);
      }
      body.append(list);
    },
    // The Menu: the Builder's way back (when testing a level) first, then the tabs. H opens it on Controls.
    menuTab: 'graphics',
    renderMenu(body) {
      const s = normalise(profile.data.settings);
      const sec = (parent, title) => { const d = el('div', 'sec'); if (title) d.append(el('h3', null, title)); parent.append(d); return d; };
      // testing a level from the Builder: the way back is the first button (Esc, then Enter)
      const testing = E.world && E.localLevels[E.world.id];
      let first = null;
      if (E.builder && (E.builder.used || testing)) {
        const cs = sec(body, testing ? 'Testing your level' : 'Create');
        const bb = el('button', 'btn primary', E.builder.used || (testing && testing.builder != null) ? 'Back to the Builder' : 'Open the Builder'); bb.onclick = () => { this.closePanel(); E.builder.open(testing && testing.builder != null ? { slot: testing.builder } : {}); };
        const row0 = el('div', 'btnrow'); row0.append(bb); cs.append(row0);
        if (testing) cs.append(el('p', 'muted small', 'Reach the golden flag to clear it. To publish, leave the level (the portal behind the start) and press Publish at the Creator\'s Gate.'));
        first = bb; // the panel is already showing, so Enter presses it straight away
      }
      const TABS = [['graphics', 'Graphics'], ['sound', 'Sound'], ['controls', 'Controls'], ['online', 'Online'], ['you', 'You'], ['feedback', 'Feedback']];
      const tab = TABS.some(([id]) => id === this.menuTab) ? this.menuTab : 'graphics';
      const bar = el('div', 'tabs'); bar.setAttribute('role', 'tablist');
      for (const [id, label] of TABS) {
        const b = el('button', 'tab' + (id === tab ? ' on' : ''), label);
        b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === tab)); b.dataset.tab = id;
        b.onclick = () => { if (this.menuTab === id) return; this.menuTab = id; this._tabFocus = true; this._resetScroll = true; this.refreshPanel(); };
        bar.append(b);
      }
      body.append(bar);
      const page = el('div', 'tabpage'); body.append(page);
      const save = () => { profile.save(); applySettings(E); };
      const row = (parent, label, control, note) => {
        const r = el('label', 'row'); const t = el('span', 'rl', label);
        if (note) t.append(el('span', 'note', note));
        r.append(t, control); parent.append(r); return r;
      };
      const toggle = (on, f) => { const i = el('input'); i.type = 'checkbox'; i.checked = on; i.onchange = () => f(i.checked); return i; };
      // a slider with its value beside it; fmt shows the value, f takes it
      const slider = (min, max, step, value, fmt, f, done) => {
        const w = el('span', 'slider'), i = el('input'), v = el('span', 'val', fmt(value));
        i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = value; i.setAttribute('aria-valuetext', fmt(value));
        i.oninput = () => { v.textContent = fmt(+i.value); i.setAttribute('aria-valuetext', fmt(+i.value)); f(+i.value); };
        if (done) i.onchange = () => done(+i.value);
        w.append(i, v); return w;
      };
      const pct = (x) => `${Math.round(x * 100)}%`, times = (x) => `${(+x).toFixed(1)}×`;
      const resetRow = (parent, group) => {
        const b = el('button', 'btn subtle', 'Back to defaults');
        b.onclick = () => { resetSettings(s, group); save(); if (group === 'graphics') E.applyQuality(); if (group === 'controls' && document.pointerLockElement) document.exitPointerLock(); this.refreshPanel(); this.toast('Settings back to their defaults.'); };
        const r = el('div', 'btnrow end'); r.append(b); parent.append(r);
      };

      if (tab === 'graphics') {
        const a = sec(page);
        const q = el('select'); for (const [v, t] of [['auto', 'Auto'], ['ultra', 'Ultra'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']]) { const o = el('option', null, t); o.value = v; q.append(o); } q.value = s.quality;
        const qd = el('p', 'muted small qdesc');
        const describe = () => { qd.textContent = QUALITY[s.quality] + (s.quality === 'auto' && E.render ? ` Now: ${E.render.quality[0].toUpperCase() + E.render.quality.slice(1)}.` : ''); };
        q.onchange = () => { s.quality = q.value; profile.save(); E.applyQuality(); describe(); };
        row(a, 'Quality', q); a.append(qd); describe();
        row(a, 'Field of view', slider(50, 90, 1, s.fov, (x) => `${x}°`, (x) => { s.fov = x; save(); }), 'how wide you see around your character');
        row(a, 'Widen the view at speed', toggle(s.speedFov, (v) => { s.speedFov = v; save(); }));
        row(a, 'Camera shake', toggle(s.shake, (v) => { s.shake = v; save(); }), 'on landings, boosts and hits');
        row(a, 'Show the frame rate', toggle(s.fps, (v) => { s.fps = v; save(); }));
        if (E.photo && !E.input.touch) { const pb = el('button', 'btn', 'Take a photo'); pb.onclick = () => { this.closePanel(); setTimeout(() => E.photo(), 60); }; row(a, 'Photo', pb, 'a path-traced still of this view; takes a few seconds'); }
        resetRow(a, 'graphics');
      } else if (tab === 'sound') {
        const a = sec(page);
        const vol = (label, key, test) => row(a, label, slider(0, 1, 0.05, s[key], pct, (x) => { s[key] = x; save(); }, test ? () => audio.play(test) : null));
        vol('Volume', 'volume', 'pickup');
        vol('Music', 'musicVol');
        vol('Sound effects', 'sfxVol', 'pickup');
        vol('Voices', 'voiceVol');
        a.append(el('p', 'muted small', 'Voices are other players talking in voice chat (Online tab).'));
        row(a, 'Keep playing in the background', toggle(s.bgSound, (v) => { s.bgSound = v; save(); }), 'music and effects while you are in another tab');
        resetRow(a, 'sound');
      } else if (tab === 'controls') {
        const a = sec(page);
        const touch = E.input.touch, padSeen = E.input.device === 'pad' || !!E.input.padKind;
        row(a, touch ? 'Look sensitivity' : 'Mouse sensitivity', slider(0.2, 3, 0.1, s.sens, times, (x) => { s.sens = x; save(); }), touch ? 'dragging to look around' : 'with mouse look on');
        if (!touch || padSeen) row(a, 'Camera speed', slider(0.2, 3, 0.1, s.camSpeed, times, (x) => { s.camSpeed = x; save(); }), touch ? 'a gamepad\'s right stick' : 'arrow keys and a gamepad\'s right stick');
        row(a, 'Invert up and down', toggle(s.invertY, (v) => { s.invertY = v; save(); }));
        row(a, 'Invert left and right', toggle(s.invertX, (v) => { s.invertX = v; save(); }));
        if (!touch) {
          row(a, 'Mouse look', toggle(!!s.mouseLook, (v) => { s.mouseLook = v; save(); if (!v && document.pointerLockElement) document.exitPointerLock(); this.refreshPanel(); }), 'move the mouse to look around (the arrow keys always turn the camera)');
          row(a, 'Key hints', toggle(s.hints, (v) => { s.hints = v; save(); }), 'the line of keys at the bottom of the screen');
        }
        resetRow(a, 'controls');
        // what everything does, for keys, gamepad or touch (the one in use first)
        const devs = [['keys', 'Keyboard'], ['pad', 'Gamepad'], ['touch', 'Touch']];
        const dev = devs.some(([d]) => d === this.ctlDevice) ? this.ctlDevice : (E.input.device || 'keys');
        const ref = sec(page, 'What everything does');
        const sw = el('div', 'tabs small'); sw.setAttribute('role', 'tablist');
        for (const [d, label] of devs) { const b = el('button', 'tab' + (d === dev ? ' on' : ''), label); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(d === dev)); b.dataset.dev = d; b.onclick = () => { this.ctlDevice = d; this._tabFocus = 'dev'; this.refreshPanel(); }; sw.append(b); }
        ref.append(sw);
        const table = (rows) => {
          const t = el('div', 'keys-table');
          for (const [what, ks] of rows) {
            const r = el('div', 'kt-row'), c = el('div', 'kt-keys');
            for (const k of ks) c.append(/^(or |Drag|Left stick|Right stick|Mouse wheel)/.test(k) ? el('span', 'kt-or', k) : el('kbd', null, k));
            r.append(el('div', 'kt-what', what), c); t.append(r);
          }
          return t;
        };
        const arena = E.input.scheme === 'topdown', wname = E.world ? E.world.mod.name : 'this world';
        ref.append(el('p', 'muted small', arena ? `${wname} is an arena: the controls are its own.` : 'In every world except arenas like Spire Clash.'), table(controlRows(dev, E.input.scheme, E.input.padKind)));
        if (dev === 'keys') ref.append(el('p', 'muted small', s.mouseLook ? 'Mouse look is on: click the game to capture the pointer, then move the mouse to look around. Esc lets the pointer go. The wheel zooms.' : 'The mouse clicks buttons. Switch on Mouse look above to look around with it. The wheel zooms.'));
        const other = el('details', 'adv'); other.append(el('summary', null, arena ? 'Controls in every other world' : 'Controls in arenas (Spire Clash)'), table(controlRows(dev, arena ? 'default' : 'topdown', E.input.padKind)));
        ref.append(other);
        if (dev === 'keys' && keyName('KeyW') !== 'W') ref.append(el('p', 'muted small', 'Key names follow your keyboard\'s layout.'));
        if (this._toReference) { this._toReference = false; requestAnimationFrame(() => ref.scrollIntoView({ block: 'start' })); }
      } else if (tab === 'online') {
        const o = sec(page, 'Online');
        row(o, 'Show me to other players', toggle(profile.data.online, (v) => { profile.data.online = v; profile.save(); E.net.setEnabled(v, E.world && E.world.id); this.touchButtons(); }));
        o.append(el('p', 'muted small', 'You play directly with the other players in your world: there is no game server. That means players in the same world can see your IP address.'));
        const pr = el('div', 'btnrow');
        const bp = el('button', 'btn', `Players here: mute or block (${keyName('KeyP')})`); bp.onclick = () => this.openPanel('players');
        const bv = el('button', 'btn', 'Privacy: what is shared, and with whom'); bv.onclick = () => this.openPanel('privacy');
        pr.append(bp, bv); o.append(pr);
        const cs = sec(page, 'Chat');
        const cm = el('select'); for (const [v, t] of Object.entries(CHAT_MODES)) { const op = el('option', null, t); op.value = v; cm.append(op); } cm.value = chatMode();
        cm.onchange = () => { s.chat = cm.value; profile.save(); this.touchButtons(); };
        row(cs, 'Text chat', cm);
        cs.append(el('p', 'muted small', 'Quick chat only: just the ready-made phrases (hello, follow me, thanks…), never anything typed. Off: no chat at all.'));
        row(cs, 'Hide bad language', toggle(s.filter !== false, (v) => { s.filter = v; profile.save(); if (v) loadFilter().then(() => E.net.relabel()); else E.net.relabel(); }));
        cs.append(el('p', 'muted small', 'In other players\' chat, names and level names: swear words and slurs are starred out, and links, email addresses and phone numbers are taken out of chat. It happens in your game, so it works on everything you see.'));
        const nb = blockList().length;
        if (nb) cs.append(el('p', 'muted small', `You have blocked ${nb} player${nb === 1 ? '' : 's'}: see Players here to unblock.`));
        const fpLine = el('p', 'muted small', 'Your player ID: …');
        if (profile.data.key) fingerprint(profile.data.key.pub).then((fp) => { fpLine.textContent = `Your player ID: ${fp}. Other players see it next to your name: anyone can pick a name, but not your ID.`; });
        o.append(fpLine);
        row(o, 'Save my progress online (needed for leaderboards)', toggle(s.verify !== false, (v) => { s.verify = v; profile.save(); if (v) E.pumpOutbox(); }));
        o.append(el('p', 'muted small', 'Your runs are saved online and checked, which keeps the leaderboards fair. Switched off, they wait in this browser until you switch it back on.'));
        const vs = sec(page, 'Voice chat');
        const vcfg = Object.assign({ on: false, mode: 'ptt', hear: true }, s.voice || {});
        const vt = toggle(E.voice.enabled, async (v) => { if (v) { const ok = await E.voice.enable(); if (!ok) vt.checked = false; } else E.voice.disable(); });
        row(vs, 'Voice chat (uses your microphone)', vt);
        const vm = el('select'); for (const [v, t] of [['ptt', `Push to talk (hold ${keyName('KeyV')})`], ['open', 'Open mic']]) { const op = el('option', null, t); op.value = v; vm.append(op); } vm.value = vcfg.mode;
        vm.onchange = () => E.voice.setMode(vm.value);
        row(vs, 'Mode', vm);
        row(vs, 'Hear other players', toggle(vcfg.hear, (v) => E.voice.setHear(v)));
        vs.append(el('p', 'muted small', 'Voice goes straight to the players in the same world, peer to peer, and is never recorded. You hear people from where they stand: closer is louder (their volume is in the Sound tab). It needs "Show me to other players".'));
      } else if (tab === 'feedback') {
        // feedback (src/engine/feedback.js): sealed to the team's key, carried by the relays; no account, no server
        const f = sec(page, 'Tell us what you think');
        f.append(el('p', 'muted', 'What was fun, what was boring, where you got stuck or lost: it goes straight to the people making Elsewhere, and every message is read.'));
        const moods = el('div', 'btnrow'), moodBtns = [];
        for (const [id, label] of [['love', 'Loving it'], ['ok', 'It\'s OK'], ['meh', 'Not for me']]) {
          const b = el('button', 'btn' + (this._fbMood === id ? ' primary' : ''), label);
          b.setAttribute('aria-pressed', String(this._fbMood === id));
          b.onclick = () => { this._fbMood = this._fbMood === id ? null : id; for (const [k, x] of moodBtns) { x.className = 'btn' + (this._fbMood === k ? ' primary' : ''); x.setAttribute('aria-pressed', String(this._fbMood === k)); } };
          moodBtns.push([id, b]); moods.append(b);
        }
        const ta = el('textarea', 'code'); ta.maxLength = MAX_TEXT; ta.rows = 5; ta.placeholder = 'Type here...'; ta.value = this._fbText || ''; ta.setAttribute('aria-label', 'Your feedback');
        const count = el('span', 'note', ''), status = el('p', 'muted small', '');
        const send = el('button', 'btn primary', 'Send');
        let sending = false;
        const upd = () => { this._fbText = ta.value; count.textContent = `${ta.value.length} / ${MAX_TEXT}`; send.disabled = sending || !ta.value.trim(); };
        ta.oninput = upd;
        send.onclick = async () => {
          const wait = (this._fbAt || 0) + 60000 - Date.now();
          if (wait > 0) { status.textContent = `Thank you! You can send another in ${Math.ceil(wait / 1000)} s.`; return; }
          sending = true; upd(); status.textContent = 'Sending...';
          try {
            const ua = navigator.userAgent, browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other';
            const msg = feedbackMessage({ text: ta.value, mood: this._fbMood, world: E.world ? E.world.id : null, minutes: performance.now() / 60000, build: String(E.ENGINE || '').slice(0, 12),
              device: { touch: !!(window.matchMedia && matchMedia('(pointer: coarse)').matches), w: innerWidth, h: innerHeight, browser, quality: profile.data.settings.quality } });
            const r = await sendFeedback(msg);
            if (r.ok) { this._fbAt = Date.now(); this._fbText = ''; this._fbMood = null; ta.value = ''; for (const [, x] of moodBtns) x.className = 'btn'; status.textContent = 'Sent. Thank you!'; }
            else status.textContent = 'It did not go through: no relay answered. Check your connection and try again.';
          } catch (e) { status.textContent = 'It did not go through. Try again in a moment.'; }
          sending = false; upd();
        };
        upd();
        const sr = el('div', 'btnrow'); sr.append(send, count);
        f.append(moods, ta, sr, status);
        f.append(el('p', 'muted small', 'Sent with it: the world you are in, the minutes you have played this session, and whether you are on a phone or a computer (screen size, browser, graphics setting). Not your name. It is encrypted, so only the team can read it. The privacy note has the details.'));
      } else {
        const ap = sec(page, 'You');
        const b1 = el('button', 'btn', `Wardrobe: name and look (${keyName('KeyO')})`); b1.onclick = () => this.openPanel('wardrobe');
        const b2 = el('button', 'btn', 'Back up profile'); b2.onclick = () => { const code = profile.exportCode(); const ta = el('textarea', 'code'); ta.value = code; ta.readOnly = true; ap.append(el('p', 'muted small', 'Copy this code somewhere safe. Paste it into "Restore" on any device.'), ta); ta.select(); };
        const b4 = el('button', 'btn', 'Leaderboards'); b4.onclick = () => { this.openPanel('records'); };
        const b3 = el('button', 'btn', 'Restore profile'); b3.onclick = () => { const ta = el('textarea', 'code'); ta.placeholder = 'Paste a backup code'; const go = el('button', 'btn', 'Restore'); go.onclick = () => { try { profile.importCode(ta.value); location.reload(); } catch (err) { this.toast('That code did not work: ' + err.message, 'bad'); } }; ap.append(ta, go); };
        const row3 = el('div', 'btnrow'); row3.append(b1, b4, b2, b3); ap.append(row3);
        ap.append(el('p', 'muted small', 'Your backup code is your account: it holds your private key, so keep it secret. Restore it on another device to carry on where you left off.'));
        const ab = sec(page, 'About');
        ab.append(el('p', 'muted', 'Elsewhere is a universe of worlds joined by portals. Explore, race, fight and climb; carry what you find from world to world; follow the Founder\'s Echoes to the Origin; build your own levels and share them.'));
        const link = el('a', 'link', 'Source code and how to add a world →'); link.href = E.REPO; link.target = '_blank'; link.rel = 'noopener';
        ab.append(link);
      }
      // focus: the way back to the Builder when there is one; after choosing a tab, that tab (so the keyboard stays put)
      const focusTab = this._tabFocus; this._tabFocus = false;
      if (focusTab === 'dev') { const b = page.querySelector(`.tab[data-dev="${this.ctlDevice}"]`); if (b) b.focus({ preventScroll: true }); }
      else if (focusTab) { const b = bar.querySelector(`.tab[data-tab="${tab}"]`); if (b) b.focus({ preventScroll: true }); }
      else if (first) first.focus({ preventScroll: true });
    },
    // ---- leaderboards (every visit is a replayable proof, checked before it counts) ----
    renderRecords(body) {
      const names = Object.fromEntries([...(E.community || []), ...(E.registry ? E.registry.worlds : [])].map((w) => [w.id, w.name])); // (community levels by name too)
      body.append(el('p', 'muted', 'Best times and scores from every world. Every run is replayed and checked before it counts, so the boards are fair.'));
      const pend = el('p', 'muted small', ''); body.append(pend);
      E.verifiedState().then((v) => {
        const n = (E.chain ? E.chain.seq : 0) - (v ? v.seq : 0);
        if (n > 0 && profile.data.settings.verify !== false) pend.textContent = `${n} of your visits ${n === 1 ? 'is' : 'are'} sent and waiting for the next check (about every half hour, sometimes an hour). ${n === 1 ? 'It' : 'They'} will show here then.`;
      });
      // the weekly challenge first: this week's featured world, its board, last week's winners, your medals
      if (E.weekly) E.weekly.card(body, { fresh: true });
      // leaderboards: every world's best checked runs
      const lb = el('div');
      body.append(el('h3', null, 'Best runs'), lb);
      lb.append(el('p', 'muted small', 'Loading…'));
      Promise.all([E.ledgerView(true), filterReady()]).then(([v]) => {
        lb.innerHTML = '';
        const B = v.boards;
        if (!B || !B.count) { lb.append(el('p', 'muted small', 'No scores yet. Play a world: your best runs are checked and show up here, usually within the hour.')); return; }
        lb.append(el('p', 'muted small', `${B.count} run${B.count === 1 ? '' : 's'} checked so far. Each one is replayed before it counts.`));
        if (B.recent && B.recent.length) {
          const card = el('div', 'card run');
          card.append(el('div', 'name', 'Recently'));
          B.recent.slice(0, 6).forEach((x) => { const won = [...x.records.map((r) => `${r.key} ${r.better === 'higher' ? r.value : fmtTime(r.value)}`), ...x.items.map((id) => { const d = items.get(id); return d ? d.name : id; })].join(', '); card.append(el('div', 'meta', `#${x.seq} · ${shownName(x.name)} · ${names[x.world] || x.world}${won ? ' · ' + won : ''}`)); });
          lb.append(card);
        }
        for (const [wid, recs] of Object.entries(B.worlds)) for (const [key, rows] of Object.entries(recs)) {
          const card = el('div', 'card run');
          card.append(el('div', 'name', `${names[wid] || wid} · ${key}`));
          rows.slice(0, 5).forEach((x, i) => card.append(el('div', 'meta', `${i + 1}. ${x.better === 'higher' ? x.value : fmtTime(x.value)} · ${shownName(x.name)}${x.loadout && x.loadout.length ? ' · with ' + x.loadout.map((id) => { const d = items.get(id); return d ? d.name : id; }).join(', ') : ''}`)));
          lb.append(card);
        }
      });
      // the hunt's verified firsts (GAME.md): who first carried each prize onto the ledger
      const firstBox = el('div', 'vres', 'Loading…');
      body.append(el('h3', null, 'First finders'), firstBox);
      Promise.all([E.ledgerView(), filterReady()]).then(([v]) => {
        const f = (v && v.boards && v.boards.firsts) || {};
        const order = ['sigil-sky', 'sigil-deep', 'sigil-speed', 'crown', 'echo-1', 'echo-2', 'echo-3', 'echo-4', 'echo-5', 'founders-mantle',
          'echo-6', 'echo-7', 'echo-8', 'echo-9', 'echo-10', 'paper-crown']; // (Season 1: Before the Door)
        const rows = order.filter((k) => f[k]).map((k) => { const d = items.get(k); return `${d ? d.name : k}: ${shownName(f[k].name)} (#${f[k].seq})`; });
        firstBox.textContent = rows.length ? rows.join(' · ') : 'Nobody yet. The first players to find the Founder\'s Crown, each Echo, the Mantle and the Paper Crown are recorded here for good.';
      });
      // the machinery behind fair boards (saved runs, their checks), folded away for those who want it
      const adv = el('details', 'adv'); adv.append(el('summary', null, 'Advanced: your saved runs, and how every score is checked')); body.append(adv);
      // continuity: this player's chain of visits, and how far the validator has verified it
      const ch = el('div', 'vres');
      const waiting = E.outbox.length, local = E.chain ? E.chain.seq : 0;
      ch.textContent = `Your chain: ${local} visit${local === 1 ? '' : 's'} recorded${waiting ? `, ${waiting} waiting to send` : ', all sent'}. Checking the ledger…`;
      adv.append(el('h3', null, 'Your verified chain'), ch);
      E.verifiedState().then((v) => {
        const vs = v ? v.seq : 0;
        ch.textContent = `Your chain: ${local} visit${local === 1 ? '' : 's'} recorded${waiting ? `, ${waiting} waiting to send` : ', all sent'}. The ledger has verified ${vs} of them${vs < local ? ' (the validator runs every 30 minutes)' : ''}.`;
        ch.className = 'vres ' + (vs === local ? 'ok' : '');
        // a refused run leaves your browser ahead of the ledger for good: start again from what is verified.
        // The ledger can also be ahead of this browser (another device, a restored backup): continue from it.
        const ahead = v && vs > local;
        if (v && v.head && E.chain.head !== v.head && (ahead || (!waiting && vs < local))) {
          if (ahead) ch.textContent = `The ledger has ${vs} verified visits of yours, more than this browser's ${local}: you played on another device, or restored a backup. Your next trip continues from the ledger.`;
          const b = el('button', 'btn', ahead ? 'Continue from the ledger now' : 'Return to my verified state');
          b.title = ahead ? 'Re-enters this world from your verified coins, items and progress.' : 'Your browser is ahead of what the ledger accepted. This restores your coins, items and progress to the last verified run, and re-enters this world.';
          b.onclick = () => { E.adoptVerified(v); E.toast('Continuing from your verified state.', 'item'); this.refreshPanel(); };
          const r = el('div', 'btnrow'); r.append(b); ch.after(r);
        }
      });
      const itemName = (id) => { const d = items.get(id); return d ? d.name : id; };
      const describe = (sum) => {
        const bits = [];
        for (const r of sum.records) bits.push(`${r.key} ${r.better === 'higher' ? r.value : fmtTime(r.value)}`);
        if (sum.items.length) bits.push(sum.items.map(itemName).join(', '));
        if (sum.coins) bits.push(`${sum.coins > 0 ? '+' : ''}${sum.coins} coins`);
        return bits.join(' · ') || 'explored';
      };
      const resultLine = (r, line) => {
        line.className = 'vres ' + (r.ok ? 'ok' : 'bad');
        line.textContent = r.ok
          ? `✓ Verified: replayed ${r.ticks.toLocaleString()} ticks (${fmtTime(r.seconds)}) in ${(r.ms / 1000).toFixed(1)} s and got the identical result. Signature: ${r.sigStatus}.`
          : `✗ Not verified: ${r.reason}`;
      };
      const verifyBtn = (getProof, line, label, onDone) => {
        const b = el('button', 'btn', label || 'Verify');
        b.onclick = async () => {
          b.disabled = true; line.className = 'vres'; line.textContent = 'Replaying…';
          try {
            const proof = await getProof();
            if (!proof) { line.textContent = 'Nothing to verify yet.'; b.disabled = false; return; }
            const r = await E.verify(proof, (f) => { line.textContent = `Replaying… ${Math.round(f * 100)}%`; });
            resultLine(r, line); if (onDone) onDone(r, proof);
          } catch (err) { line.className = 'vres bad'; line.textContent = '✗ ' + err.message; }
          b.disabled = false;
        };
        return b;
      };
      // publishing to the season-0 ledger
      const submitBtn = (r, line) => {
        const b = el('button', 'btn', r.submitted ? 'Submit again' : 'Submit to the ledger');
        let armed = false;
        b.onclick = async () => {
          if (!armed && !profile.data.ledgerOk) {
            armed = true; b.textContent = 'Confirm: publish publicly';
            line.className = 'vres'; line.textContent = 'This publishes the run, your player name and your public key to public Nostr relays. Anyone can see it and replay it. Press again to confirm.';
            return;
          }
          profile.data.ledgerOk = true; profile.save();
          b.disabled = true; line.className = 'vres'; line.textContent = 'Publishing…';
          try {
            const s = await E.submitRun(r.proof);
            r.submitted = { at: Date.now(), ok: s.ok, total: s.total, event: s.event };
            line.className = 'vres ' + (s.ok ? 'ok' : 'bad');
            line.textContent = s.ok ? `Published to ${s.ok} of ${s.total} relays (${(s.bytes / 1024).toFixed(1)} KB). The validator replays new runs about every half hour (sometimes an hour); accepted runs appear on the boards below.` : 'No relay accepted it. Check your connection and try again.';
            E.saveRuns();
          } catch (err) { line.className = 'vres bad'; line.textContent = 'Could not publish: ' + err.message; }
          b.disabled = false; b.textContent = 'Submit again';
        };
        return b;
      };
      const ledgerStatus = async (r, line) => {
        if (!r.submitted) return;
        const v = await E.ledgerView(); const id = await E.proofId(r.proof);
        const seq = v.boards && v.boards.index && v.boards.index[id];
        const rej = v.rejected.find((x) => x.id === id);
        line.className = 'vres ' + (seq ? 'ok' : rej ? 'bad' : '');
        line.textContent = seq ? `On the ledger as run #${seq}.` : rej ? `Refused by the validator: ${rej.reason}` : `Published ${Math.max(1, Math.round((Date.now() - r.submitted.at) / 60000))} min ago; waiting for the validator.`;
      };
      const tools = (proof) => {
        const c = el('button', 'btn', 'Copy proof');
        c.onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(proof)); c.textContent = 'Copied'; } catch (e) { c.textContent = 'Copy failed'; } setTimeout(() => { c.textContent = 'Copy proof'; }, 1500); };
        const d = el('button', 'btn', 'Download');
        d.onclick = () => { const a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(proof)], { type: 'application/json' })); a.download = `elsewhere-${proof.world.id}-${proof.started.slice(0, 19).replace(/[:T]/g, '')}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
        return [c, d];
      };
      // this visit
      if (E.run && E.world) {
        const card = el('div', 'card run');
        card.append(el('div', 'name', `This visit: ${E.world.mod.name}`), el('div', 'meta', E.run.tainted ? `Not verifiable (${E.run.tainted}).` : `${fmtTime((E.sim ? E.sim.tick : 0) / 60)} so far · ${describe(summarize(E.sim ? E.sim.claims : []))}`));
        const line = el('div', 'vres');
        if (!E.run.tainted) { const row = el('div', 'btnrow'); row.append(verifyBtn(() => E.currentProof(), line, 'Verify so far')); card.append(row); }
        card.append(line); adv.append(card);
      }
      adv.append(el('h3', null, 'Recorded runs'));
      if (!E.runs.length) adv.append(el('p', 'muted small', 'Runs that earn something (an item, coins, a record) are kept here after you leave the world.'));
      for (const r of E.runs) {
        const p = r.proof, sum = r.summary || summarize(p.claims);
        const card = el('div', 'card run');
        const ago = Math.max(0, Math.round((Date.now() - Date.parse(p.started)) / 60000));
        card.append(el('div', 'name', `${names[p.world.id] || p.world.id} · ${fmtTime(p.ticks / 60)}`), el('div', 'meta', `${describe(sum)} · ${ago < 60 ? ago + ' min' : Math.round(ago / 60) + ' h'} ago · ${(JSON.stringify(p).length / 1024).toFixed(1)} KB · ${p.sig ? 'signed' : 'unsigned'}`));
        const line = el('div', 'vres');
        if (r.verified) resultLine(r.verified, line);
        const row = el('div', 'btnrow');
        row.append(verifyBtn(async () => p, line, 'Verify', (res) => { r.verified = { ok: res.ok, reason: res.reason, ticks: res.ticks, seconds: res.seconds, ms: res.ms, sigStatus: res.sigStatus }; }), ...tools(p));
        const ledgerLine = el('div', 'vres');
        if (p.sig && (sum.records.length || sum.items.length)) row.append(submitBtn(r, ledgerLine));
        card.append(row, line, ledgerLine); adv.append(card);
        ledgerStatus(r, ledgerLine);
      }
      // someone else's proof
      adv.append(el('h3', null, 'Check a proof'));
      const ta = el('textarea', 'code'); ta.placeholder = 'Paste a proof (JSON) from anyone';
      const line = el('div', 'vres');
      const row = el('div', 'btnrow');
      row.append(verifyBtn(async () => { try { return JSON.parse(ta.value); } catch (e) { throw new Error('That is not valid JSON.'); } }, line, 'Verify pasted proof'));
      adv.append(ta, row, line);
    },
    // ---- the Creator's Gate: community levels on the ledger, and a way in for creators ----
    renderGate(body) {
      body.append(el('p', 'muted', 'Worlds made by players with the Builder. Play them, clear them, and make your own: a level appears here once its maker has cleared it.'));
      const list = el('div', 'worlds');
      body.append(el('h3', null, 'Community worlds'), list);
      // your own filter: nothing is banned from the ledger, but you choose what you see (kept in this browser)
      const HKEY = 'elsewhere_hidden_v1';
      const hidden = (() => { try { const h = JSON.parse(localStorage.getItem(HKEY) || '{}'); return { levels: Array.isArray(h.levels) ? h.levels : [], creators: Array.isArray(h.creators) ? h.creators : [] }; } catch (e) { return { levels: [], creators: [] }; } })();
      const saveHidden = () => { try { localStorage.setItem(HKEY, JSON.stringify(hidden)); } catch (e) {} };
      let showHidden = false;
      const draw = () => {
        list.innerHTML = '';
        if (!E.community.length) { list.append(el('p', 'muted small', 'None yet. Yours could be the first.')); return; }
        const isHidden = (w) => hidden.levels.includes(w.id) || (w.key && hidden.creators.includes(w.key));
        const nHidden = E.community.filter(isHidden).length;
        for (const w of E.community.filter((x) => showHidden || !isHidden(x)).slice(0, 60)) {
          const row = el('div', 'world-row');
          const dot = el('span', 'wdot'); dot.style.background = w.color || '#888';
          const info = el('div', 'winfo');
          const maker = shownName(w.author);
          info.append(el('div', 'wname', shownLabel(w.name, 'A level')), el('div', 'wblurb', shownLabel(w.blurb || '')), el('div', 'wmeta', `by ${maker} · cleared by its creator in ${w.clear != null ? fmtTime(w.clear) : '?'} · #${w.seq}`));
          if (w.reward) info.append(el('div', 'wmeta', `Reward for clearing: ${shownLabel(w.reward.name, 'an item')} (${w.reward.slot})`));
          const here = E.world && E.world.id === w.id;
          const b = el('button', 'btn' + (here ? ' on' : ''), here ? 'You are here' : 'Travel');
          b.disabled = here;
          b.onclick = () => { this.closePanel(); E.leaveTo(w.id); };
          const hid = isHidden(w);
          const hl = el('button', 'btn', hid ? 'Unhide' : 'Hide');
          hl.title = hid ? 'Show this level again' : 'Hide this level from your list (only for you)';
          hl.onclick = () => {
            if (hid) { hidden.levels = hidden.levels.filter((x) => x !== w.id); if (w.key) hidden.creators = hidden.creators.filter((x) => x !== w.key); }
            else hidden.levels.push(w.id);
            saveHidden(); draw();
          };
          const hc = el('button', 'btn', 'Hide creator'); hc.title = `Hide every level by ${maker} (only for you)`;
          hc.onclick = () => { if (w.key && !hidden.creators.includes(w.key)) hidden.creators.push(w.key); saveHidden(); draw(); };
          if (hid) row.classList.add('hidden-level');
          row.append(dot, info, b, hl); if (!hid && w.key) row.append(hc); list.append(row);
        }
        if (nHidden) {
          const t = el('button', 'btn', showHidden ? 'Collapse the levels you hid' : `Show the ${nHidden} level${nHidden === 1 ? '' : 's'} you hid`);
          t.onclick = () => { showHidden = !showHidden; draw(); };
          const r = el('div', 'btnrow'); r.append(t); list.append(r);
        }
      };
      filterReady().then(draw); Promise.all([E.loadCommunity(), filterReady()]).then(draw);
      // creators: build a level in the Builder (or paste one), test-play it, then publish it once you have cleared it
      body.append(el('h3', null, 'Make a level'));
      body.append(el('p', 'muted small', 'The Builder is a level editor for the keyboard: place floors, ramps, pads, platforms and a goal flag on a grid, then test-play your level. Clear it (reach the flag), and you can publish it here.' + (E.input.touch ? ' It needs a keyboard; a mouse helps but is optional.' : '')));
      const openB = el('button', 'btn primary', E.builder && E.builder.used ? 'Back to the Builder' : 'Open the Builder');
      openB.onclick = () => { this.closePanel(); E.builder.open(); };
      const rowB = el('div', 'btnrow'); rowB.append(openB); body.append(rowB);
      if (!$('#panel').contains(document.activeElement)) openB.focus({ preventScroll: true }); // keyboard players: Enter opens it
      body.append(el('p', 'muted small', 'Or paste a level (JSON, format elsewhere-level/1; see WORLD_API.md) and play it here.'));
      const ta = el('textarea', 'code'); ta.placeholder = '{ "format": "elsewhere-level/1", "name": "…", "spawn": [0, 0, 0, 180], "goal": [0, 4, -40], "parts": [ … ], "things": [ … ] }';
      const line = el('div', 'vres');
      const play = el('button', 'btn', 'Play this level');
      play.onclick = async () => {
        let raw; try { raw = JSON.parse(ta.value); } catch (e) { line.className = 'vres bad'; line.textContent = 'That is not valid JSON.'; return; }
        const key = profile.data.key;
        raw.author = { name: profile.data.name || 'Wanderer', key: key ? key.pub : '' };
        try { this.closePanel(); await E.playLevel(raw); } catch (e) { this.openPanel('gate'); }
      };
      const row = el('div', 'btnrow'); row.append(play); body.append(ta, row, line);
      // levels tested here this session: publish once cleared (a draft you cleared before a reload comes back too)
      if (E.builder) E.builder.restoreCleared().then((n) => { if (n && this.panelOpen === 'gate') this.refreshPanel(); });
      const mine = Object.values(E.localLevels);
      if (mine.length) {
        body.append(el('h3', null, 'Your levels'));
        for (const L of mine) {
          const cleared = E.runs.some((r) => r.proof.world.id === L.id && r.proof.world.sha256 === L.sha256 && r.proof.claims.some((c) => c[1] === 'record' && c[2] === 'time'));
          const card = el('div', 'card run'), st = el('div', 'vres');
          card.append(el('div', 'name', L.name), el('div', 'meta', `${L.id}${L.builder != null ? ` · from the Builder (draft ${L.builder + 1})` : ''} · ${cleared ? 'cleared: ready to publish' : 'not cleared yet: reach the flag, then leave the level'}`));
          const r2 = el('div', 'btnrow');
          const again = el('button', 'btn', 'Play again'); again.onclick = () => { this.closePanel(); E.leaveTo(L.id); };
          const edit = el('button', 'btn', 'Edit in the Builder'); edit.onclick = () => { this.closePanel(); E.builder.open(L.builder != null ? { slot: L.builder } : { level: L.level }); };
          if (E.builder) r2.append(edit);
          const pub = el('button', 'btn', 'Publish'); pub.disabled = !cleared;
          pub.onclick = async () => {
            pub.disabled = true; st.className = 'vres'; st.textContent = 'Publishing…';
            try { const s = await E.publishLevel(L.id); st.className = 'vres ok'; st.textContent = `Published! Your clear run is checked within the hour; then your level appears here for everyone.`; }
            catch (e) { st.className = 'vres bad'; st.textContent = e.message; pub.disabled = false; }
          };
          r2.append(again, pub); card.append(r2, st); body.append(card);
        }
      }
    },
    shopData: null,
    shop(title, listing) { this.shopData = { title, listing }; this.openPanel('shop:' + title); },
    renderShop(body) {
      const d = profile.data;
      body.append(el('p', 'muted', `You have ◆ ${d.coins}. Coins come from exploring worlds and beating challenges.`));
      const grid = el('div', 'grid');
      for (const { item, price } of this.shopData.listing) {
        const def = items.get(item); if (!def) continue;
        const owned = (d.inv[item] || 0) > 0;
        const card = el('div', 'card item');
        const img = el('img'); img.src = itemIcon(E.render.renderer, item); img.alt = '';
        const name = el('div', 'name', def.name); name.style.color = RARITY[def.rarity] || '#fff';
        const traits = el('div', 'traits');
        if (def.family && FAMILIES[def.family]) traits.append(el('span', 'chip fam ' + def.family, FAMILIES[def.family].name));
        for (const t of def.traits) traits.append(el('span', 'chip ok', TRAITS[t] ? TRAITS[t].name : t));
        card.append(img, name, el('div', 'desc', def.desc), traits);
        const b = el('button', 'btn' + (owned ? ' on' : ''), owned ? 'Owned' : price ? `Buy ◆ ${price}` : 'Free');
        b.disabled = owned || d.coins < price;
        b.onclick = () => { if (d.coins < price || owned) return; b.disabled = true; act(['buy', item], () => {}); };
        card.append(b);
        grid.append(card);
      }
      body.append(grid);
    },

    // ---- arcade cabinet: any web game in a sandboxed frame ----
    cabinet(url, title, onMessage) {
      const c = $('#cabinet'); setBusy(1);
      c.querySelector('.cab-title').textContent = title || 'Arcade';
      const f = c.querySelector('iframe');
      f.src = url;
      c.classList.remove('hidden');
      const listener = (ev) => { if (ev.source === f.contentWindow && onMessage) { const d = safeData(ev.data); if (d != null) onMessage(d); } };
      window.addEventListener('message', listener);
      const close = () => { c.classList.add('hidden'); f.src = 'about:blank'; window.removeEventListener('message', listener); setBusy(-1); this.cabClose = null; };
      this.cabClose = close;
      c.querySelector('.cab-close').onclick = close;
    },

    // ---- players here: mute and block (net.js does them; safety.js keeps the block list) ----
    renderPlayers(body) {
      const net = E.net, wname = E.world ? E.world.mod.name : 'this world';
      if (!profile.data.online) {
        body.append(el('p', 'muted', 'You are not shown to other players, so you do not see them either.'));
        const b = el('button', 'btn', 'Show me to other players'); b.onclick = () => { profile.data.online = true; profile.save(); net.setEnabled(true, E.world && E.world.id); this.touchButtons(); this.refreshPanel(); };
        const r = el('div', 'btnrow'); r.append(b); body.append(r);
      } else {
        const me = E.player && E.player.pos;
        const here = [...net.peers.values()].filter((p) => p.settled && !net.isBlocked(p))
          .map((p) => [p, me && p.has ? Math.hypot(p.tx - me.x, p.tz - me.z) : Infinity]).sort((a, b) => a[1] - b[1]);
        body.append(el('h3', null, `In ${wname}`));
        if (!here.length) body.append(el('p', 'muted small', 'Nobody else is here right now. Other players show up as they arrive.'));
        const list = el('div', 'worlds');
        for (const [p, dist] of here) {
          const row = el('div', 'world-row player-row');
          const dot = el('span', 'wdot'); dot.style.background = (p.colors && p.colors.body) || '#888'; dot.style.color = dot.style.background;
          const info = el('div', 'winfo');
          const talking = E.voice && E.voice.peers.get(p.id) && E.voice.peers.get(p.id).level > 0.02;
          info.append(el('div', 'wname', p.shown), el('div', 'wmeta', [p.fp ? `ID ${p.fp}` : 'No player ID', isFinite(dist) ? `${Math.round(dist)} m away` : 'arriving', talking && !net.isMuted(p) ? 'talking' : ''].filter(Boolean).join(' · ')));
          const muted = net.isMuted(p);
          const bm = el('button', 'btn' + (muted ? ' on' : ''), muted ? 'Unmute' : 'Mute');
          bm.title = muted ? 'Hear their voice and see their chat again' : 'Stop hearing their voice and seeing their chat, until you close the game';
          bm.onclick = () => { net.mute(p, !muted); this.refreshPanel(); };
          const bb = el('button', 'btn', 'Block');
          bb.title = p.key ? 'They vanish for you, and you for them. Kept on this device until you unblock them.' : 'They vanish for you, and you for them, until you close the game (without a player ID there is nothing to remember them by).';
          bb.onclick = () => { net.block(p, true); this.toast(`Blocked ${p.shown}: you will not see or hear each other.`); this.refreshPanel(); };
          row.append(dot, info, bm, bb); list.append(row);
        }
        body.append(list);
      }
      // blocked: kept by player ID on this device; players without one only for this session
      const saved = blockList(), now = [...net.peers.values()].filter((p) => p.settled && net.isBlocked(p) && !p.key);
      body.append(el('h3', null, 'Blocked'));
      if (!saved.length && !now.length) body.append(el('p', 'muted small', 'Nobody. Blocking someone hides them from you and you from them: no chat, no voice, no seeing each other.'));
      const bl = el('div', 'worlds');
      const ago = (t) => { const d = Math.floor((Date.now() - t) / 86400000); return d < 1 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };
      for (const b of [...saved].reverse()) {
        const row = el('div', 'world-row player-row'), info = el('div', 'winfo');
        const inRoom = [...net.peers.values()].some((p) => p.key === b.k);
        info.append(el('div', 'wname', shownName(b.n)), el('div', 'wmeta', [b.fp ? `ID ${b.fp}` : '', `blocked ${ago(b.t)}`, inRoom ? 'here now' : ''].filter(Boolean).join(' · ')));
        const u = el('button', 'btn', 'Unblock');
        u.onclick = () => { const p = [...net.peers.values()].find((q) => q.key === b.k); if (p) net.block(p, false); else setBlockedKey(b.k, false); this.refreshPanel(); };
        row.append(info, u); bl.append(row);
      }
      for (const p of now) {
        const row = el('div', 'world-row player-row'), info = el('div', 'winfo');
        info.append(el('div', 'wname', p.shown), el('div', 'wmeta', 'No player ID · until you close the game · here now'));
        const u = el('button', 'btn', 'Unblock'); u.onclick = () => { net.block(p, false); this.refreshPanel(); };
        row.append(info, u); bl.append(row);
      }
      body.append(bl);
      body.append(el('p', 'muted small', 'Mute: you stop hearing their voice and seeing their chat, until you close the game. They are not told. Block: they disappear for you and you for them, and it is kept on this device until you unblock them. Chat settings and the language filter are in the Menu, under Online.'));
      const pv = el('button', 'btn subtle', 'Privacy: what other players can see →'); pv.onclick = () => this.openPanel('privacy');
      const r2 = el('div', 'btnrow end'); r2.append(pv); body.append(r2);
    },
    // players came or went: the open Players panel follows (a beat later, so a crowd arriving redraws once)
    peersChanged() {
      if (this.panelOpen !== 'players' || this._peersT) return;
      this._peersT = setTimeout(() => { this._peersT = null; if (this.panelOpen === 'players' && !$('#panel').contains(document.activeElement)) this.refreshPanel(); }, 300);
    },
    // the privacy note: privacy.html (one text for the page and the game)
    renderPrivacy(body) {
      const box = el('div', 'priv', 'Loading…'); body.append(box);
      fetch('privacy.html').then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))).then((html) => {
        const main = new DOMParser().parseFromString(html, 'text/html').querySelector('main');
        box.textContent = '';
        for (const n of [...(main ? main.children : [])]) { if (n.matches('h1, .back')) continue; box.append(document.importNode(n, true)); }
        for (const a of box.querySelectorAll('a')) { a.target = '_blank'; a.rel = 'noopener'; }
        const link = el('a', 'link', 'Open this page on its own →'); link.href = 'privacy.html'; link.target = '_blank'; link.rel = 'noopener';
        box.append(link);
      }).catch(() => { box.textContent = 'The privacy page did not load. It is at privacy.html next to the game.'; });
    },

    // ---- chat ----
    chatLine(name, text, color, self) {
      const log = $('#chat-log');
      const line = el('div', 'line' + (self ? ' self' : ''));
      const n = el('b', null, name + ': '); n.style.color = color || '#7cf6ff';
      line.append(n, document.createTextNode(text));
      log.append(line);
      while (log.children.length > 8) log.firstChild.remove();
      setTimeout(() => line.classList.add('old'), 15000);
    },
    // T or Enter: the chat box. Quick phrases above it (click, or 1-8 with Quick chat only); typed chat below
    openChat() {
      const mode = chatMode();
      if (!profile.data.online) { this.toast('You are offline. Turn on "Show me to other players" in the Menu (Online) to chat.'); return; }
      if (mode === 'off') { this.toast('Chat is off. You can switch it on in the Menu, under Online.'); return; }
      const box = $('#chat'), i = $('#chat-input'), q = $('#chat-quick'), quickOnly = mode === 'quick';
      box.classList.add('typing'); box.classList.toggle('quick', quickOnly); setBusy(1);
      document.body.classList.add('chatting'); // (on a phone, the touch buttons step aside: the game waits anyway)
      q.textContent = '';
      let open = true;
      const done = (send) => {
        if (!open) return; open = false;
        i.onkeydown = null; i.onblur = null; window.removeEventListener('keydown', keys, true); window.removeEventListener('pointerdown', away, true);
        box.classList.remove('typing', 'quick'); i.blur(); q.textContent = ''; document.body.classList.remove('chatting');
        if (send === true) { const t = cleanText(i.value, 140); if (t) E.net.chat(t); }
        else if (typeof send === 'number') E.net.quick(send);
        setBusy(-1);
      };
      QUICK.forEach((t, n) => {
        const b = el('button'); b.type = 'button'; b.append(el('b', null, String(n + 1)), t);
        b.onpointerdown = (ev) => { ev.preventDefault(); ev.stopPropagation(); done(n); }; // (before the text box loses focus)
        b.onclick = (ev) => { ev.preventDefault(); done(n); };
        q.append(b);
      });
      if (quickOnly) q.append(el('div', 'qnote', 'Quick chat only (Menu, Online): press a number, or Esc.'));
      // Quick chat only: the numbers pick a phrase; Esc, Enter or T close. A tap elsewhere closes too.
      const keys = (ev) => {
        if (!quickOnly) return;
        const n = /^(Digit|Numpad)([1-8])$/.exec(ev.code);
        if (n) { ev.preventDefault(); ev.stopPropagation(); done(+n[2] - 1); }
        else if (['Escape', 'Enter', 'NumpadEnter', 'KeyT'].includes(ev.code)) { ev.preventDefault(); ev.stopPropagation(); done(false); }
      };
      const away = (ev) => { if (quickOnly && !box.contains(ev.target)) done(false); };
      window.addEventListener('keydown', keys, true); window.addEventListener('pointerdown', away, true);
      if (!quickOnly) {
        i.value = ''; i.focus();
        i.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') done(true); if (ev.key === 'Escape') done(false); };
        i.onblur = () => done(false);
      }
    },
  };

  // UI keys from input
  E.input.onUiKey = (name, ev) => {
    if (E.builder && E.builder.active) return true; // the Builder has the keys (this catches gamepad and touch buttons)
    if (ev && ui.handleKey(ev.code)) return true;
    if (ui.onTitle) return false;
    if (!$('#cabinet').classList.contains('hidden')) { if (name === 'menu' && ui.cabClose) ui.cabClose(); return true; }
    if (name === 'menu') { if (ui.panelOpen) ui.closePanel(); else if (!busy) ui.openPanel('menu'); return true; }
    // H: the Controls tab, scrolled to what everything does (H again closes it)
    if (name === 'help') { if (ui.panelOpen === 'menu' && ui.menuTab === 'controls') ui.closePanel(); else if (!busy || ui.panelOpen) { ui.menuTab = 'controls'; ui._toReference = true; if (ui.panelOpen === 'menu') ui.refreshPanel(); else ui.openPanel('menu'); } return true; }
    if (name === 'camera') { E.camRig.dist = E.camRig.dist > 9 ? 5 : E.camRig.dist > 6 ? 11 : 7.5; return true; }
    if (busy && !ui.panelOpen) return true;
    if (name === 'inv' && !ev && ui.panelOpen === 'wardrobe') { ui.closePanel(); return true; } // a pad's B leaves the wardrobe
    if (name === 'inv' || name === 'map' || name === 'records' || name === 'players' || name === 'wardrobe') { ui.openPanel(name); return true; }
    if (name === 'chat' && !ui.panelOpen) { if (ev) ev.preventDefault(); ui.openChat(); return true; }
    return true;
  };
  // keyboard players: in a panel, Tab moves between its controls and Enter or Space presses the focused one
  // (the game's own keys would otherwise take them); arrows work in lists and sliders
  window.addEventListener('keydown', (ev) => {
    const t = ev.target, p = ui.panelOpen === 'wardrobe' ? $('#wardrobe') : $('#panel');
    if (!ui.panelOpen || !(t instanceof Node) || t === p || !p.contains(t)) return;
    const tag = t.tagName, kind = (t.type || '').toLowerCase();
    if (tag === 'TEXTAREA' || (tag === 'INPUT' && kind !== 'checkbox' && kind !== 'range')) return; // typing: the game ignores it anyway
    const press = ev.code === 'Enter' || ev.code === 'NumpadEnter' || ev.code === 'Space';
    if (ev.code === 'Tab' || (press && /^(BUTTON|A|SELECT|INPUT)$/.test(tag)) || (/^Arrow/.test(ev.code) && (tag === 'SELECT' || kind === 'range'))) ev.stopPropagation();
  }, true);
  // keys while a dialog is open (input is disabled then, so listen here too)
  window.addEventListener('keydown', (ev) => {
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
    // UI keys (Enter, Esc, I, M, Tab, T, C, H) already reach the dialog through onUiKey
    if (dialogKey && !['Escape', 'Enter', 'KeyT', 'KeyI', 'KeyM', 'KeyR', 'Tab', 'KeyC', 'KeyH', 'KeyP'].includes(ev.code)) { ev.preventDefault(); ui.handleKey(ev.code); }
  });
  $('#panel .close').onclick = () => ui.closePanel();
  $('#panel').addEventListener('click', (ev) => { if (ev.target.id === 'panel') ui.closePanel(); });
  $('#btn-menu').onclick = () => ui.openPanel('menu');
  $('#online').onclick = (ev) => { ev.stopPropagation(); if (!ui.busy || ui.panelOpen) ui.openPanel('players'); };
  $('#weekly').onclick = (ev) => { ev.stopPropagation(); if (!ui.busy || ui.panelOpen) ui.openPanel('records'); };
  $('#prompt').onclick = () => { E.input.edges.add('use'); };
  return ui;
}
