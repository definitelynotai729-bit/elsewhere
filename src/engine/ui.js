// HUD, dialogs, panels (items, worlds, settings, shop), chat and overlays. Plain DOM.
import { items, itemIcon, TRAITS, RARITY, traitAllowed, SLOTS } from './items.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { cleanText, fmtTime } from './util.js';
import { summarize } from './run.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function createUI(E) {
  let busy = 0;
  const setBusy = (d) => { busy = Math.max(0, busy + d); E.input.setEnabled(busy === 0); document.body.classList.toggle('busy', busy > 0); };
  let dialogKey = null;
  // anything a panel does to the game state becomes a recorded action, applied on the next tick
  const live = () => E.sim && E.world && !E.sim.ended && !E.traveling;
  const act = (a, direct) => { if (live()) E.queueAction(a); else direct(); };
  const safeData = (v) => { try { const t = JSON.stringify(v); return t && t.length <= 4000 ? JSON.parse(t) : null; } catch (e) { return null; } };

  const ui = {
    get busy() { return busy > 0; },
    loading(msg) { $('#load-msg').textContent = msg; },
    hideLoading() { $('#loading').classList.add('gone'); setTimeout(() => $('#loading').remove(), 900); },
    fade(on) { $('#fade').classList.toggle('on', on); return new Promise((r) => setTimeout(r, on ? 380 : 50)); },
    flash() { const f = $('#fade'); f.classList.add('flash'); setTimeout(() => f.classList.remove('flash'), 160); },
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
      p.append(el('kbd', null, E.input.touch ? 'TAP' : 'E'), el('span', null, text));
      p.classList.add('on');
    },
    banner(title, sub) {
      const b = $('#banner');
      b.querySelector('h1').textContent = title; b.querySelector('p').textContent = sub || '';
      b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    },
    objective(t) { $('#objective').textContent = t || ''; $('#objective').classList.toggle('on', !!t); },
    timer(text, show, final) { const t = $('#timer'); t.textContent = text; t.classList.toggle('on', !!show); t.classList.toggle('final', !!final); },
    refreshHud() {
      const d = profile.data;
      $('#coin-n').textContent = d.coins;
      document.querySelectorAll('#sigils i').forEach((i) => i.classList.toggle('got', !!d.flags['sigil.' + i.dataset.s] || (d.inv['sigil-' + i.dataset.s] || 0) > 0));
      $('#world-name').textContent = E.world ? E.world.mod.name : '';
      const ab = $('#abilities'); ab.innerHTML = '';
      const pl = E.player;
      if (pl) for (const [k, on] of Object.entries(pl.abil)) if (on === true) ab.append(el('span', 'ab', TRAITS[k] ? TRAITS[k].name : k));
      if (pl && pl.abil.board && !pl.board) ab.append(el('span', 'ab hint', E.input.touch ? 'BOARD button to ride' : 'B to ride'));
    },
    online(n) { $('#online-n').textContent = n; $('#online').classList.toggle('alone', n <= 1); },
    coinPop() { const c = $('#coins'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); },
    // re-render whatever panel is open (after a recorded action has been applied)
    refreshPanel() {
      if (!this.panelOpen) return;
      const body = $('#panel .panel-body'); body.innerHTML = '';
      const k = this.panelOpen;
      if (k === 'inv') this.renderInventory(body); else if (k === 'map') this.renderMap(body); else if (k === 'records') this.renderRecords(body);
      else if (k.startsWith('shop:')) this.renderShop(body); else if (k === 'menu') this.renderMenu(body);
    },

    // ---- dialogs ----
    dialog(name, lines) {
      return new Promise((resolve) => {
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
      });
    },
    choice(name, text, options) {
      return new Promise((resolve) => {
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
      });
    },
    handleKey(code) { if (dialogKey) { dialogKey(code); return true; } return false; },

    // ---- panels ----
    panelOpen: null,
    openPanel(kind) {
      if (this.panelOpen === kind) { this.closePanel(); return; }
      if (this.panelOpen) this.closePanel();
      const p = $('#panel'), body = p.querySelector('.panel-body'), h = p.querySelector('h2');
      body.innerHTML = '';
      this.panelOpen = kind; setBusy(1);
      p.classList.remove('hidden');
      if (kind === 'inv') { h.textContent = 'Items'; this.renderInventory(body); }
      else if (kind === 'map') { h.textContent = 'Worlds'; this.renderMap(body); }
      else if (kind === 'menu') { h.textContent = 'Menu'; this.renderMenu(body); }
      else if (kind.startsWith('shop:')) { h.textContent = this.shopData.title; this.renderShop(body); }
      else if (kind === 'records') { h.textContent = 'Verified play'; this.renderRecords(body); }
      audio.play('click');
    },
    closePanel() { if (!this.panelOpen) return; this.panelOpen = null; $('#panel').classList.add('hidden'); setBusy(-1); E.refreshHudSoon(); },

    renderInventory(body) {
      const d = profile.data, rules = E.world ? E.world.rules : {};
      const ids = Object.keys(d.inv).filter((id) => items.get(id));
      const intro = el('p', 'muted', ids.length ? `Items keep their abilities in every world that allows them. ${E.world ? E.world.mod.name : 'This world'}'s rules decide what works here.` : 'No items yet. Explore worlds, finish challenges, or visit the shop in Junction.');
      body.append(intro);
      const grid = el('div', 'grid');
      ids.sort((a, b) => (items.get(a).slot || 'z').localeCompare(items.get(b).slot || 'z'));
      for (const id of ids) {
        const def = items.get(id);
        const card = el('div', 'card item');
        const img = el('img'); img.src = itemIcon(E.render.renderer, id); img.alt = '';
        const name = el('div', 'name', def.name); name.style.color = RARITY[def.rarity] || '#fff';
        const meta = el('div', 'meta', `${def.rarity}${def.slot ? ' · ' + def.slot : ''}${d.inv[id] > 1 ? ' · ×' + d.inv[id] : ''}`);
        const desc = el('div', 'desc', def.desc);
        const traits = el('div', 'traits');
        for (const t of def.traits) {
          const ok = traitAllowed(t, rules);
          const chip = el('span', 'chip ' + (ok ? 'ok' : 'off'), (TRAITS[t] ? TRAITS[t].name : t) + (ok ? '' : ' · off here'));
          chip.title = TRAITS[t] ? TRAITS[t].desc : t;
          traits.append(chip);
        }
        card.append(img, name, meta, desc, traits);
        if (def.slot) {
          const on = d.eq[def.slot] === id;
          const b = el('button', on ? 'btn on' : 'btn', on ? 'Unequip' : 'Equip');
          b.onclick = () => { b.disabled = true; act(['equip', on ? null : id, def.slot], () => { E.equip(on ? null : id, def.slot); this.refreshPanel(); }); };
          card.append(b);
        }
        grid.append(card);
      }
      body.append(grid);
    },
    renderMap(body) {
      body.append(el('p', 'muted', 'Every world is a module. Each one is pinned by its SHA-256 hash, and your browser checks the hash before running it. Anyone could publish one; on the chain, this list becomes a ledger.'));
      const list = el('div', 'worlds');
      for (const w of E.registry.worlds) {
        const row = el('div', 'world-row');
        const dot = el('span', 'wdot'); dot.style.background = w.color || '#888';
        const info = el('div', 'winfo');
        info.append(el('div', 'wname', w.name), el('div', 'wblurb', w.blurb || ''));
        const sv = profile.data.worlds[w.id];
        const coins = sv ? Object.keys(sv.coins || {}).length : 0;
        const tot = sv && sv.coinTotal;
        info.append(el('div', 'wmeta', `${w.kind || 'world'} · by ${w.author || 'unknown'} · ${w.sha256 ? 'sha256 ' + w.sha256.slice(0, 10) + '… ✓' : 'unpinned'}${tot ? ` · ${coins}/${tot} collected` : ''}`));
        const here = E.world && E.world.id === w.id;
        const b = el('button', 'btn' + (here ? ' on' : ''), here ? 'You are here' : 'Travel');
        b.disabled = here;
        b.onclick = () => { this.closePanel(); E.leaveTo(w.id); };
        row.append(dot, info, b);
        list.append(row);
      }
      body.append(list);
    },
    renderMenu(body) {
      const s = profile.data.settings;
      const sec = (title) => { const d = el('div', 'sec'); d.append(el('h3', null, title)); body.append(d); return d; };
      const row = (parent, label, control) => { const r = el('label', 'row'); r.append(el('span', null, label), control); parent.append(r); return r; };
      const toggle = (on, f) => { const i = el('input'); i.type = 'checkbox'; i.checked = on; i.onchange = () => f(i.checked); return i; };
      const a = sec('Settings');
      const q = el('select'); for (const v of ['auto', 'high', 'medium', 'low']) { const o = el('option', null, v); o.value = v; q.append(o); } q.value = s.quality;
      q.onchange = () => { s.quality = q.value; profile.save(); E.applyQuality(); };
      row(a, 'Graphics', q);
      row(a, 'Sound effects', toggle(s.sfx, (v) => { s.sfx = v; profile.save(); audio.setSfx(v); }));
      row(a, 'Music', toggle(s.music, (v) => { s.music = v; profile.save(); audio.setMusic(v); }));
      const sens = el('input'); sens.type = 'range'; sens.min = 0.3; sens.max = 2.5; sens.step = 0.1; sens.value = s.sens;
      sens.oninput = () => { s.sens = +sens.value; profile.save(); };
      row(a, 'Look sensitivity', sens);
      row(a, 'Invert look up/down', toggle(s.invertY, (v) => { s.invertY = v; profile.save(); }));
      row(a, 'Lock mouse on click', toggle(s.lock !== false, (v) => { s.lock = v; profile.save(); E.input.usePointerLock = v; }));
      const o = sec('Online');
      row(o, 'Show me to other players', toggle(profile.data.online, (v) => { profile.data.online = v; profile.save(); E.net.setEnabled(v, E.world && E.world.id); }));
      o.append(el('p', 'muted small', 'Players connect directly to each other (WebRTC), found through public Nostr relays. There is no game server. Peer-to-peer means other players can see your IP address.'));
      const ap = sec('You');
      const b1 = el('button', 'btn', 'Change name & colours'); b1.onclick = async () => { this.closePanel(); await this.creator(); };
      const b2 = el('button', 'btn', 'Back up profile'); b2.onclick = () => { const code = profile.exportCode(); const ta = el('textarea', 'code'); ta.value = code; ta.readOnly = true; ap.append(el('p', 'muted small', 'Copy this code somewhere safe. Paste it into "Restore" on any device.'), ta); ta.select(); };
      const b4 = el('button', 'btn', 'Verified play'); b4.onclick = () => { this.openPanel('records'); };
      const b3 = el('button', 'btn', 'Restore profile'); b3.onclick = () => { const ta = el('textarea', 'code'); ta.placeholder = 'Paste a backup code'; const go = el('button', 'btn', 'Restore'); go.onclick = () => { try { profile.importCode(ta.value); location.reload(); } catch (err) { this.toast('That code did not work: ' + err.message, 'bad'); } }; ap.append(ta, go); };
      const row3 = el('div', 'btnrow'); row3.append(b1, b4, b2, b3); ap.append(row3);
      ap.append(el('p', 'muted small', 'Your backup code includes your signing key, which proves your runs are yours. Keep it private.'));
      const ab = sec('About');
      ab.append(el('p', 'muted', 'Elsewhere is an open universe of worlds. Worlds, games and items are modules that anyone will be able to add. Items carry their abilities between worlds, and each world chooses which abilities work inside it. Every visit is recorded as a proof of play that anyone can replay and verify (press R). Next: a public ledger of verified runs, then ownership on a community-run proof-of-stake chain.'));
      const link = el('a', 'link', 'Source code and how to add a world →'); link.href = E.REPO; link.target = '_blank'; link.rel = 'noopener';
      ab.append(link);
      const keys = el('p', 'muted small', 'Keys: WASD/arrows move · Space jump (hold to glide) · E use · B board · I items · M worlds · R verified play · Enter chat · C camera distance · Esc menu. Gamepads work too.');
      ab.append(keys);
    },
    // ---- verified play: every visit is a replayable proof ----
    renderRecords(body) {
      const names = Object.fromEntries((E.registry ? E.registry.worlds : []).map((w) => [w.id, w.name]));
      body.append(el('p', 'muted', 'Every visit to a world is recorded as a proof of play: your inputs, one per 1/60 s tick, plus what they earned. Anyone can replay a proof with the same world code and check that it produces exactly what it claims. No server decides; the physics does.'));
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
            line.textContent = s.ok ? `Published to ${s.ok} of ${s.total} relays (${(s.bytes / 1024).toFixed(1)} KB). The validator replays new runs about every 30 minutes; accepted runs appear on the boards below.` : 'No relay accepted it. Check your connection and try again.';
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
        card.append(line); body.append(card);
      }
      body.append(el('h3', null, 'Recorded runs'));
      if (!E.runs.length) body.append(el('p', 'muted small', 'Runs that earn something (an item, coins, a record) are kept here after you leave the world.'));
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
        card.append(row, line, ledgerLine); body.append(card);
        ledgerStatus(r, ledgerLine);
      }
      // the season-0 ledger: verified records
      const lb = el('div');
      body.append(el('h3', null, 'Verified records · season 0'), lb);
      lb.append(el('p', 'muted small', 'Loading the ledger…'));
      E.ledgerView(true).then((v) => {
        lb.innerHTML = '';
        const B = v.boards;
        if (!B || !B.count) { lb.append(el('p', 'muted small', 'No runs on the ledger yet. Submit one of yours above: the validator replays it, and if it checks out it is added for good.')); return; }
        lb.append(el('p', 'muted small', `${B.count} verified run${B.count === 1 ? '' : 's'} on the ledger. Chain head ${B.head.slice(0, 12)}…: anyone can recompute it from the archived proofs.`));
        for (const [wid, recs] of Object.entries(B.worlds)) for (const [key, rows] of Object.entries(recs)) {
          const card = el('div', 'card run');
          card.append(el('div', 'name', `${names[wid] || wid} · ${key}`));
          rows.slice(0, 5).forEach((x, i) => card.append(el('div', 'meta', `${i + 1}. ${x.better === 'higher' ? x.value : fmtTime(x.value)} · ${x.name}${x.loadout && x.loadout.length ? ' · with ' + x.loadout.map((id) => { const d = items.get(id); return d ? d.name : id; }).join(', ') : ''}`)));
          lb.append(card);
        }
      });
      // someone else's proof
      body.append(el('h3', null, 'Check a proof'));
      const ta = el('textarea', 'code'); ta.placeholder = 'Paste a proof (JSON) from anyone';
      const line = el('div', 'vres');
      const row = el('div', 'btnrow');
      row.append(verifyBtn(async () => { try { return JSON.parse(ta.value); } catch (e) { throw new Error('That is not valid JSON.'); } }, line, 'Verify pasted proof'));
      body.append(ta, row, line);
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
        const traits = el('div', 'traits'); for (const t of def.traits) traits.append(el('span', 'chip ok', TRAITS[t] ? TRAITS[t].name : t));
        card.append(img, name, el('div', 'desc', def.desc), traits);
        const b = el('button', 'btn' + (owned ? ' on' : ''), owned ? 'Owned' : `Buy ◆ ${price}`);
        b.disabled = owned || d.coins < price;
        b.onclick = () => { if (d.coins < price || owned) return; b.disabled = true; act(['buy', item], () => {}); };
        card.append(b);
        grid.append(card);
      }
      body.append(grid);
    },

    // ---- character creator ----
    creator(first) {
      return new Promise((resolve) => {
        const d = profile.data;
        const c = $('#creator'); c.classList.remove('hidden'); setBusy(1);
        const name = c.querySelector('#cr-name'); name.value = d.name || '';
        const swatches = { body: ['#3ec8ff', '#ff5d8f', '#7cff6b', '#ffb13b', '#a97bff', '#f2f2f2', '#2b2f45', '#ff4646'], head: ['#eef1ff', '#2b2f45', '#ffd9b3', '#9fe7ff', '#ffe066', '#c9b6ff'], visor: ['#ff4fd8', '#7cf6ff', '#ffe066', '#7cff6b', '#ff7a45', '#ffffff'] };
        for (const part of ['body', 'head', 'visor']) {
          const box = c.querySelector(`[data-part="${part}"]`); box.innerHTML = '';
          for (const col of swatches[part]) {
            const b = el('button', 'sw' + (d.colors[part] === col ? ' on' : '')); b.style.background = col; b.title = col;
            b.onclick = () => { d.colors[part] = col; box.querySelectorAll('.sw').forEach((x) => x.classList.toggle('on', x === b)); E.player.avatar.setColors(d.colors); };
            box.append(b);
          }
        }
        const online = c.querySelector('#cr-online'); online.checked = d.online;
        c.querySelector('#cr-first').style.display = first ? '' : 'none';
        c.querySelector('#cr-go').onclick = () => {
          d.name = cleanText(name.value, 18) || 'Wanderer';
          d.online = online.checked;
          if (!d.created) d.created = Date.now();
          profile.save();
          c.classList.add('hidden'); setBusy(-1);
          audio.unlock(); audio.play('pickup');
          E.net.setEnabled(d.online, E.world && E.world.id);
          E.net.announce();
          resolve();
        };
        setTimeout(() => name.focus(), 50);
      });
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
    openChat() {
      const i = $('#chat-input');
      $('#chat').classList.add('typing'); setBusy(1);
      i.value = ''; i.focus();
      const done = (send) => {
        i.onkeydown = null; i.onblur = null;
        $('#chat').classList.remove('typing'); i.blur();
        if (send) { const t = cleanText(i.value, 140); if (t) E.net.chat(t); }
        setBusy(-1);
      };
      i.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') done(true); if (ev.key === 'Escape') done(false); };
      i.onblur = () => done(false);
    },
  };

  // UI keys from input
  E.input.onUiKey = (name, ev) => {
    if (ev && ui.handleKey(ev.code)) return true;
    if (!$('#creator').classList.contains('hidden')) return false;
    if (!$('#cabinet').classList.contains('hidden')) { if (name === 'menu' && ui.cabClose) ui.cabClose(); return true; }
    if (name === 'menu') { if (ui.panelOpen) ui.closePanel(); else if (!busy) ui.openPanel('menu'); return true; }
    if (name === 'camera') { E.camRig.dist = E.camRig.dist > 9 ? 5 : E.camRig.dist > 6 ? 11 : 7.5; return true; }
    if (busy && !ui.panelOpen) return true;
    if (name === 'inv' || name === 'map' || name === 'records') { ui.openPanel(name); return true; }
    if (name === 'chat' && !ui.panelOpen) { if (ev) ev.preventDefault(); ui.openChat(); return true; }
    return true;
  };
  // keys while a dialog is open (input is disabled then, so listen here too)
  window.addEventListener('keydown', (ev) => {
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
    // UI keys (Enter, Esc, I, M, Tab, T, C) already reach the dialog through onUiKey
    if (dialogKey && !['Escape', 'Enter', 'KeyT', 'KeyI', 'KeyM', 'KeyR', 'Tab', 'KeyC'].includes(ev.code)) { ev.preventDefault(); ui.handleKey(ev.code); }
  });
  $('#panel .close').onclick = () => ui.closePanel();
  $('#panel').addEventListener('click', (ev) => { if (ev.target.id === 'panel') ui.closePanel(); });
  $('#btn-menu').onclick = () => ui.openPanel('menu');
  $('#prompt').onclick = () => { E.input.edges.add('use'); };
  return ui;
}
