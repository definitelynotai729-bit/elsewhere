// Presence: see other players in the same world, live. Serverless: browsers find each other
// through public Nostr relays (Trystero) and then talk directly over WebRTC.
// Everything received from a peer is untrusted and validated before use.
import { joinRoom, selfId, getRelaySockets } from 'trystero';
import { createAvatar } from './avatar.js';
import { items, SLOTS, itemActive } from './items.js';
import { labelSprite } from './render.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { isColor, cleanText, damp, dampAngle, sha256hex } from './util.js';
import { ensureKey, signText, verifyText } from './identity.js';
import { MEET_RELAYS } from './relays.js';
import { QUICK, chatMode, loadFilter, filterReady, filterOn, shownName, shownText, isBlockedKey, setBlockedKey } from './safety.js';

// Identity in rooms: a hello carries the player's key and a signature over the room, the sender's own connection id
// and the name it shows, so nobody can show up under someone else's key (a copied hello fails: the connection id
// differs). Names are free text, so the short fingerprint of the key is what tells two "Ada"s apart.
const helloText = (room, peer, name) => `elsewhere-hi|${room}|${peer}|${name}`;
// Area of interest: a room still connects everyone (WebRTC mesh), but what flows is local. Positions go 10 times a
// second to the NEAR nearest players within RANGE m, and once a second to everyone else (so everyone knows roughly
// where everyone is). Voice goes to the VOICE nearest within earshot. Leaving a set needs 25% more distance than
// joining it, so nobody flickers at the edge. A small room is exactly as before: one broadcast.
// Safety (safety.js): a player's name shows once we know who they are and the word filter is ready; muted players'
// chat and voice are dropped; blocked players are hidden and get nothing from us (every send skips them).
export const AOI = { near: 25, range: 60, voice: 8, voiceRange: 40, everyone: 1000 };
export const fingerprint = async (key) => (await sha256hex('elsewhere-key|' + key)).slice(0, 6).toUpperCase();

const APP_ID = 'elsewhere-proto-v1-7f3a9c';
const okNum = (v, lim) => typeof v === 'number' && isFinite(v) && Math.abs(v) < lim;

export function createNet(E) {
  const net = {
    room: null, worldId: null, enabled: false, peers: new Map(), act: null, sendT: 0, lastSent: null,
    muted: new Set(), // player IDs (or connections, for players without one) muted until the game is closed
    blockedNow: new Set(), // connections blocked until the game is closed (players without an ID)
    get selfId() { return selfId; },
    relays() { try { return Object.entries(getRelaySockets()).map(([u, s]) => [u.replace('wss://', ''), s && s.readyState]); } catch (e) { return String(e); } },
    setEnabled(on, worldId) {
      this.enabled = !!on;
      if (!this.enabled) this.leave();
      else if (worldId && this.worldId !== worldId) this.join(worldId);
      else if (worldId && !this.room) this.join(worldId);
    },
    join(worldId) {
      this.leave();
      this.worldId = worldId; this.roomName = 'world:' + worldId;
      if (!this.enabled) return;
      if (filterOn()) loadFilter(); // ready before anyone's name arrives (players take seconds to connect)
      try {
        this.room = joinRoom({ appId: APP_ID, relayConfig: { urls: MEET_RELAYS, warnOnRelayFailure: false } }, 'world:' + worldId, {
          onJoinError: (d) => console.warn('[net] could not connect to a player:', d && d.error),
        });
      } catch (e) { console.warn('[net] join failed', e); this.room = null; return; }
      const hi = this.room.makeAction('hi'), st = this.room.makeAction('st'), ch = this.room.makeAction('ch');
      this.act = { hi, st, ch };
      if (E.voice) E.voice.attach(this.room);
      this.room.onPeerJoin = (id) => { if (this.debug) console.log('[net] peer joined', id); if (this.isBlocked(this.peers.get(id))) return; hi.send(this.hello(), { target: id }).catch((e) => console.warn('[net] hello failed', e && e.message)); if (E.voice) E.voice.peerJoined(id); };
      this.room.onPeerLeave = (id) => this.drop(id);
      hi.onMessage = (d, meta) => { if (this.debug) console.log('[net] hi from', meta && meta.peerId); this.onHello(meta.peerId, d); };
      st.onMessage = (d, meta) => this.onState(meta.peerId, d);
      ch.onMessage = (d, meta) => this.onChat(meta.peerId, d);
      this.count();
      this.signHello().catch(() => {});
    },
    leave() {
      if (E.voice) E.voice.detach();
      if (this.room) { try { this.room.leave(); } catch (e) {} }
      this.room = null; this.act = null;
      this.nearIds = new Set(); this.voiceIds = new Set(); this.lastAll = 0;
      for (const id of [...this.peers.keys()]) this.drop(id);
      this.count();
    },
    stats: { near: 0, all: 0 }, nearIds: new Set(), voiceIds: new Set(), aoi: AOI,
    // who is near: players without a position yet count as near (so they can place us); the rest by distance
    pick(k, range, held) {
      const me = E.player.pos, out = [], list = [];
      for (const p of this.peers.values()) {
        if (!p.settled || this.isBlocked(p)) continue; // nothing to a player until we know who they are
        if (!p.has) { out.push(p.id); continue; }
        const d = Math.hypot(p.tx - me.x, p.ty - me.y, p.tz - me.z);
        if (d < (held.has(p.id) ? range * 1.25 : range)) list.push([d, p.id]);
      }
      list.sort((a, b) => a[0] - b[0]);
      for (const [, id] of list.slice(0, Math.max(0, k - out.length))) out.push(id);
      return out;
    },
    // the players who get our position at full rate; null means everyone (a small room: one broadcast)
    interest() {
      const ids = this.pick(AOI.near, AOI.range, this.nearIds);
      this.nearIds = new Set(ids);
      return ids.length === this.peers.size ? null : ids;
    },
    // voice: our microphone to the nearest players within earshot
    refreshInterest() {
      if (!E.voice || !E.player) return;
      const ids = E.voice.stream ? this.pick(AOI.voice, AOI.voiceRange, this.voiceIds).filter((id) => { const p = this.peers.get(id); return p && p.has; }) : [];
      this.voiceIds = new Set(ids);
      E.voice.setTargets(ids);
    },
    hello() { const d = profile.data, h = { v: 1, n: d.name || 'Wanderer', c: d.colors, e: d.eq }; if (this.sig && this.sig.name === h.n && this.sig.room === this.roomName) { h.k = this.sig.key; h.g = this.sig.g; } return h; },
    // sign this room's hello once (and again if the name changes), then tell everyone
    async signHello() {
      const d = profile.data, name = d.name || 'Wanderer', room = this.roomName;
      if (!room || (this.sig && this.sig.name === name && this.sig.room === room)) return;
      const key = await ensureKey(profile); if (!key || room !== this.roomName) return;
      this.sig = { room, name, key: key.pub, g: await signText(key, helloText(room, selfId, cleanText(name, 18) || 'Wanderer')) };
      this.announce();
    },
    announce() { if (this.act) { if (!this.sig || this.sig.name !== (profile.data.name || 'Wanderer')) this.signHello().catch(() => {}); this.send('hi', this.hello()); } },
    // send to everyone but blocked players (one broadcast while nobody here is blocked). Hellos go to players we do
    // not know yet too; chat and positions only to players we know (so a blocked player gets nothing at all)
    send(kind, data) {
      if (!this.act) return;
      const t = this.targets(kind !== 'hi');
      if (t && !t.length) return;
      this.act[kind].send(data, t ? { target: t } : undefined).catch((e) => { if (this.debug) console.warn('[net] send failed', kind, e && e.message); });
    },
    targets(knownOnly) {
      const all = [...this.peers.values()], ok = (p) => !this.isBlocked(p) && (!knownOnly || p.settled);
      return all.every(ok) ? null : all.filter(ok).map((p) => p.id);
    },
    count() { E.ui && E.ui.online([...this.peers.values()].filter((p) => !this.isBlocked(p)).length + 1); if (E.ui && E.ui.peersChanged) E.ui.peersChanged(); },

    // ---- mute and block ----
    // a player is known by their player ID (a key that signed their hello) or, without one, by this connection
    isBlocked(p) { return !!p && ((!!p.key && isBlockedKey(p.key)) || this.blockedNow.has(p.id)); },
    isMuted(p) { return !!p && (this.isBlocked(p) || this.muted.has(p.key || p.id) || this.muted.has(p.id)); },
    mutedId(id) { const p = this.peers.get(id); return !!p && this.isMuted(p); },
    mute(p, on) { const k = p.key || p.id; if (on) this.muted.add(k); else { this.muted.delete(k); this.muted.delete(p.id); } this.restyle(p); },
    block(p, on) {
      if (p.key) setBlockedKey(p.key, on, { n: p.shown || p.name, fp: p.fp });
      else if (on) this.blockedNow.add(p.id); else this.blockedNow.delete(p.id);
      if (on && this.act) this.act.st.send({ bye: 1 }, { target: p.id }).catch(() => {}); // we leave their game at once (as if we had left the world)
      this.restyle(p); this.count(); this.refreshInterest();
      if (!on && p.greeted === false) this.settled(p); // unblocked: say hello now
      if (!on) this.act && this.act.hi.send(this.hello(), { target: p.id }).catch(() => {}); // they get our hello (and position) again
    },
    // how a player shows: their name (filtered) and ID, hidden while blocked, no bubble while muted
    label(p) { p.shown = shownName(p.name); p.label = p.fp ? `${p.shown} · ${p.fp}` : `${p.shown} (unverified)`; },
    restyle(p) {
      if (!p.av) return;
      if (p.settled) p.av.setName(p.label);
      p.av.root.visible = !!(p.has && p.settled && !this.isBlocked(p));
      if (p.bubble && this.isMuted(p)) { p.av.upper.remove(p.bubble); p.bubble.material.map.dispose(); p.bubble.material.dispose(); p.bubble = null; }
    },
    // after the filter setting changes: every name again
    relabel() { for (const p of this.peers.values()) if (p.settled) { this.label(p); this.restyle(p); } if (E.ui && E.ui.peersChanged) E.ui.peersChanged(); },
    // what another player wears (only items this client knows; others show once their level loads)
    applyEq(p) {
      const eq = p.eq || {}, rules = E.world ? E.world.rules : {};
      for (const s of SLOTS) {
        const it = typeof eq[s] === 'string' && items.get(eq[s]) && items.get(eq[s]).slot === s ? eq[s] : null;
        p.av.equip(s, it);
        const active = !it || itemActive(items.get(it), rules); // (asleep here: its family or a trait is switched off)
        if (s === 'feet') { p.av.slots.feetL.visible = p.av.slots.feetR.visible = active; }
        else if (s === 'body') p.av.setBodyActive(active); // a character body (presentation only)
        else p.av.slots[s].visible = active && s !== 'board';
      }
    },
    peer(id) {
      let p = this.peers.get(id);
      if (!p) {
        p = { id, name: 'Wanderer', shown: 'Wanderer', av: null, tx: 0, ty: 0, tz: 0, tyaw: 0, flags: 0, speed: 0, seen: performance.now(), chatT: 0, bubble: null, bubbleT: 0, has: false, settled: false };
        this.peers.set(id, p);
        this.count();
      }
      return p;
    },
    onHello(id, d) {
      if (!d || typeof d !== 'object') return;
      const p = this.peer(id);
      p.name = cleanText(d.n, 18) || 'Wanderer';
      const c = d.c || {};
      const colors = { body: isColor(c.body) ? c.body : '#888888', head: isColor(c.head) ? c.head : '#eeeeee', visor: isColor(c.visor) ? c.visor : '#00ffff' };
      p.colors = colors;
      if (!p.av) { p.av = createAvatar(colors); p.av.root.visible = false; E.scene.add(p.av.root); } // shown once settled (below)
      else p.av.setColors(colors);
      // who this is: a key that signed this room, this connection and this name; else an unverified guest. Their
      // name shows once that is known and the word filter is ready, so a blocked player never appears at all.
      const room = this.roomName, name = p.name;
      const who = typeof d.k === 'string' && typeof d.g === 'string' && d.k.length < 100 && d.g.length < 200
        ? verifyText(d.k, helloText(room, id, name), d.g).then(async (ok) => (ok === true ? { key: d.k, fp: await fingerprint(d.k) } : { key: null, fp: null }), () => ({ key: null, fp: null }))
        : Promise.resolve({ key: null, fp: null });
      Promise.all([who, filterReady()]).then(([w]) => {
        if (this.peers.get(id) !== p || room !== this.roomName || p.name !== name) return;
        p.key = w.key; p.fp = w.fp;
        this.settled(p);
      });
      p.eq = d.e || {};
      this.applyEq(p);
      // creator items this client has not seen yet: load their levels, then dress the player again
      const unknown = Object.values(p.eq).filter((id) => typeof id === 'string' && !items.get(id));
      if (unknown.length && E.loadItemWorlds) E.loadItemWorlds(unknown).then((n) => { if (n && p.av) this.applyEq(p); }, () => {});
    },
    settled(p) {
      p.settled = true;
      this.label(p); this.restyle(p); this.count();
      if (this.isBlocked(p)) { p.greeted = p.greeted || false; return; }
      if (!p.greeted) { p.greeted = true; E.ui.chatLine('•', `${p.shown} is here`, '#9aa3c0'); }
      if (p.queue) { const q = p.queue; p.queue = null; for (const m of q) this.onChat(p.id, m); }
    },
    onState(id, d) {
      if (d && d.bye === 1 && !Array.isArray(d)) { this.drop(id); return; } // they left us (a block looks like leaving)
      if (!Array.isArray(d) || d.length < 6) return;
      const [x, y, z, yaw, flags, speed] = d.map(Number);
      if (!okNum(x, 1e7) || !okNum(y, 1e7) || !okNum(z, 1e7) || !okNum(yaw, 1e4) || !okNum(speed, 1e5)) return; // values arrive x100
      const p = this.peer(id), now = performance.now();
      if (p.seen) p.interval = p.interval ? p.interval * 0.7 + Math.min(3000, now - p.seen) * 0.3 : Math.min(3000, now - p.seen);
      p.received = (p.received || 0) + 1;
      p.tx = x / 100; p.ty = y / 100; p.tz = z / 100; p.tyaw = yaw / 100; p.flags = flags | 0; p.speed = speed / 100; p.seen = now;
      if (!p.has) { p.has = true; p.x = p.tx; p.y = p.ty; p.z = p.tz; p.yaw = p.tyaw; this.restyle(p); }
      if (!p.av && !this.isBlocked(p) && now - (p.askT || 0) > 1000) { p.askT = now; this.act && this.act.hi.send(this.hello(), { target: id }).catch(() => {}); }
    },
    onChat(id, d) {
      const p = this.peers.get(id); if (!p || !d || typeof d !== 'object') return;
      if (!p.settled) { if (!p.queue) p.queue = []; if (p.queue.length < 3) p.queue.push(d); return; } // shown once we know who it is
      if (this.isMuted(p) || chatMode() === 'off') return;
      // a burst of up to 4 lines, then one every 3 s, and never two within 0.8 s
      const now = performance.now();
      p.tokens = Math.min(4, (p.tokens ?? 4) + (now - (p.tokT || now)) / 3000); p.tokT = now;
      if (now - p.chatT < 800 || p.tokens < 1) return;
      let text = null;
      if (Number.isInteger(d.q) && d.q >= 0 && d.q < QUICK.length) text = QUICK[d.q]; // a quick phrase: our own words for it
      else if (chatMode() === 'on') text = shownText(cleanText(d.t, 140));
      if (!text) return;
      p.tokens -= 1; p.chatT = now;
      E.ui.chatLine(p.label || p.shown, text, '#ffd166');
      audio.play('chat');
      this.bubble(p, text);
    },
    bubble(p, text) {
      const av = p.av || (p === 'self' ? E.player.avatar : null); if (!av) return;
      if (p.bubble) { av.upper.remove(p.bubble); p.bubble.material.map.dispose(); p.bubble.material.dispose(); }
      p.bubble = labelSprite(text.length > 48 ? text.slice(0, 46) + '…' : text, { size: 0.36, color: '#111522', bg: 'rgba(255,255,255,0.92)', fontSize: 34 });
      p.bubble.position.y = 1.8; av.upper.add(p.bubble); p.bubbleT = 6;
    },
    // our own chat: typed words (others' games filter them; we show what they will see) or a quick phrase
    chat(text) { if (chatMode() === 'on') this.say({ t: text }, shownText(text) || text); },
    quick(i) { if (QUICK[i]) this.say({ q: i }, QUICK[i]); },
    say(msg, shown) {
      if (!this.enabled) { E.toast('You are offline. Turn on "Show me to other players" in the menu to chat.'); return; }
      const now = performance.now();
      this.myTokens = Math.min(4, (this.myTokens ?? 4) + (now - (this.myT || now)) / 3000); this.myT = now;
      if (this.myTokens < 1) { E.toast('Slow down a little: one line every few seconds.'); return; }
      this.myTokens -= 1;
      E.ui.chatLine(profile.data.name || 'You', shown, '#7cf6ff', true);
      if (!this.selfBubble) this.selfBubble = { av: E.player.avatar, bubble: null };
      this.bubble(this.selfBubble, shown);
      this.send('ch', msg);
    },
    drop(id) {
      const p = this.peers.get(id); if (!p) return;
      if (E.voice) E.voice.drop(id);
      if (p.av) { p.av.root.removeFromParent(); }
      if (p.greeted && !this.isBlocked(p)) E.ui.chatLine('•', `${p.shown} left`, '#9aa3c0');
      this.peers.delete(id);
      this.count();
    },
    update(dt) {
      const pl = E.player;
      if (this.act && pl && E.world && !E.traveling) {
        this.sendT -= dt;
        const flags = (pl.grounded ? 1 : 0) | (pl.gliding ? 2 : 0) | (pl.board ? 4 : 0);
        const yaw = ((pl.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const msg = [Math.round(pl.pos.x * 100), Math.round(pl.pos.y * 100), Math.round(pl.pos.z * 100), Math.round(yaw * 100), flags, Math.round(Math.hypot(pl.vel.x, pl.vel.z) * 100)];
        const changed = !this.lastSent || msg.some((v, i) => v !== this.lastSent[i]);
        if (this.sendT <= 0 && (changed || this.sendT < -1)) {
          this.sendT = 0.1; this.lastSent = msg;
          const now = performance.now(), all = now - (this.lastAll || 0) >= AOI.everyone;
          const target = all ? this.targets(true) : this.interest(); // (null: everyone; blocked players never)
          if (all) this.lastAll = now;
          if (target === null || target.length) {
            this.stats[target === null ? 'all' : 'near']++;
            this.act.st.send(msg, target === null ? undefined : { target }).catch((e) => { if (this.debug) console.warn('[net] state send failed', e && e.message); });
          }
        }
        if ((this.voiceT = (this.voiceT || 0) - dt) <= 0) { this.voiceT = 1; this.refreshInterest(); }
      }
      const now = performance.now();
      for (const p of this.peers.values()) {
        if (now - p.seen > 20000) { this.drop(p.id); continue; }
        if (!p.av || !p.has) continue;
        // smoothing follows how often this player's updates arrive (10 a second near, about 1 a second far)
        const k = Math.max(2, Math.min(12, 1200 / (p.interval || 100))), far = Math.hypot(p.tx - p.x, p.ty - p.y, p.tz - p.z) > 25;
        p.x = far ? p.tx : damp(p.x, p.tx, k, dt); p.y = far ? p.ty : damp(p.y, p.ty, k, dt); p.z = far ? p.tz : damp(p.z, p.tz, k, dt);
        p.yaw = dampAngle(p.yaw, p.tyaw, 12, dt);
        p.av.root.position.set(p.x, p.y - 0.9, p.z); p.av.root.rotation.y = p.yaw;
        const board = !!(p.flags & 4);
        p.av.slots.board.visible = board && !!p.av.equipped.board;
        p.av.animate({ speed: p.speed, grounded: !!(p.flags & 1), vy: 0, gliding: !!(p.flags & 2), board, groundDist: (p.flags & 1) ? 0 : 1 }, dt);
        if (p.bubble && (p.bubbleT -= dt) <= 0) { p.av.upper.remove(p.bubble); p.bubble = null; }
      }
      const sb = this.selfBubble;
      if (sb && sb.bubble && (sb.bubbleT -= dt) <= 0) { sb.av.upper.remove(sb.bubble); sb.bubble = null; }
    },
  };
  return net;
}
