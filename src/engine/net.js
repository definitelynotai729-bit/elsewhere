// Presence: see other players in the same world, live. Serverless: browsers find each other
// through public Nostr relays (Trystero) and then talk directly over WebRTC.
// Everything received from a peer is untrusted and validated before use.
import { joinRoom, selfId, getRelaySockets } from 'trystero';
import { createAvatar } from './avatar.js';
import { items, SLOTS, traitAllowed } from './items.js';
import { labelSprite } from './render.js';
import { profile } from './profile.js';
import { audio } from './audio.js';
import { isColor, cleanText, damp, dampAngle } from './util.js';

const APP_ID = 'elsewhere-proto-v1-7f3a9c';
const okNum = (v, lim) => typeof v === 'number' && isFinite(v) && Math.abs(v) < lim;

export function createNet(E) {
  const net = {
    room: null, worldId: null, enabled: false, peers: new Map(), act: null, sendT: 0, lastSent: null,
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
      this.worldId = worldId;
      if (!this.enabled) return;
      try {
        this.room = joinRoom({ appId: APP_ID, relayConfig: { warnOnRelayFailure: false } }, 'world:' + worldId, {
          onJoinError: (d) => console.warn('[net] could not connect to a player:', d && d.error),
        });
      } catch (e) { console.warn('[net] join failed', e); this.room = null; return; }
      const hi = this.room.makeAction('hi'), st = this.room.makeAction('st'), ch = this.room.makeAction('ch');
      this.act = { hi, st, ch };
      if (E.voice) E.voice.attach(this.room);
      this.room.onPeerJoin = (id) => { if (this.debug) console.log('[net] peer joined', id); hi.send(this.hello(), { target: id }).catch((e) => console.warn('[net] hello failed', e && e.message)); if (E.voice) E.voice.peerJoined(id); };
      this.room.onPeerLeave = (id) => this.drop(id);
      hi.onMessage = (d, meta) => { if (this.debug) console.log('[net] hi from', meta && meta.peerId); this.onHello(meta.peerId, d); };
      st.onMessage = (d, meta) => this.onState(meta.peerId, d);
      ch.onMessage = (d, meta) => this.onChat(meta.peerId, d);
      this.count();
    },
    leave() {
      if (E.voice) E.voice.detach();
      if (this.room) { try { this.room.leave(); } catch (e) {} }
      this.room = null; this.act = null;
      for (const id of [...this.peers.keys()]) this.drop(id);
      this.count();
    },
    hello() { const d = profile.data; return { v: 1, n: d.name || 'Wanderer', c: d.colors, e: d.eq }; },
    announce() { if (this.act) this.act.hi.send(this.hello()).catch(() => {}); },
    count() { E.ui && E.ui.online(this.peers.size + 1); },
    peer(id) {
      let p = this.peers.get(id);
      if (!p) {
        p = { id, name: 'Wanderer', av: null, tx: 0, ty: 0, tz: 0, tyaw: 0, flags: 0, speed: 0, seen: performance.now(), chatT: 0, bubble: null, bubbleT: 0, has: false };
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
      if (!p.av) {
        p.av = createAvatar(colors, { name: p.name });
        p.av.root.visible = p.has;
        E.scene.add(p.av.root);
        if (!p.greeted) { p.greeted = true; E.ui.chatLine('•', `${p.name} is here`, '#9aa3c0'); }
      } else { p.av.setColors(colors); p.av.setName(p.name); }
      const eq = d.e || {};
      const rules = E.world ? E.world.rules : {};
      for (const s of SLOTS) {
        const it = typeof eq[s] === 'string' && items.get(eq[s]) && items.get(eq[s]).slot === s ? eq[s] : null;
        p.av.equip(s, it);
        const active = !it || items.get(it).traits.every((t) => traitAllowed(t, rules));
        if (s === 'feet') { p.av.slots.feetL.visible = p.av.slots.feetR.visible = active; }
        else if (s === 'body') p.av.setBodyActive(active); // a character body (presentation only)
        else p.av.slots[s].visible = active && s !== 'board';
      }
    },
    onState(id, d) {
      if (!Array.isArray(d) || d.length < 6) return;
      const [x, y, z, yaw, flags, speed] = d.map(Number);
      if (!okNum(x, 1e7) || !okNum(y, 1e7) || !okNum(z, 1e7) || !okNum(yaw, 1e4) || !okNum(speed, 1e5)) return; // values arrive x100
      const p = this.peer(id);
      p.tx = x / 100; p.ty = y / 100; p.tz = z / 100; p.tyaw = yaw / 100; p.flags = flags | 0; p.speed = speed / 100; p.seen = performance.now();
      if (!p.has) { p.has = true; p.x = p.tx; p.y = p.ty; p.z = p.tz; p.yaw = p.tyaw; if (p.av) p.av.root.visible = true; }
      if (!p.av) { this.act && this.act.hi.send(this.hello(), { target: id }).catch(() => {}); }
    },
    onChat(id, d) {
      const p = this.peers.get(id); if (!p) return;
      const now = performance.now();
      if (now - p.chatT < 800) return; p.chatT = now;
      const text = cleanText(d && d.t, 140); if (!text) return;
      E.ui.chatLine(p.name, text, '#ffd166');
      audio.play('chat');
      this.bubble(p, text);
    },
    bubble(p, text) {
      const av = p.av || (p === 'self' ? E.player.avatar : null); if (!av) return;
      if (p.bubble) { av.upper.remove(p.bubble); p.bubble.material.map.dispose(); p.bubble.material.dispose(); }
      p.bubble = labelSprite(text.length > 48 ? text.slice(0, 46) + '…' : text, { size: 0.36, color: '#111522', bg: 'rgba(255,255,255,0.92)', fontSize: 34 });
      p.bubble.position.y = 1.8; av.upper.add(p.bubble); p.bubbleT = 6;
    },
    chat(text) {
      E.ui.chatLine(profile.data.name || 'You', text, '#7cf6ff', true);
      if (!this.selfBubble) this.selfBubble = { av: E.player.avatar, bubble: null };
      this.bubble(this.selfBubble, text);
      if (this.act) this.act.ch.send({ t: text }).catch(() => {});
      else if (!this.enabled) E.toast('You are offline. Turn on "Show me to other players" in the menu to chat.');
    },
    drop(id) {
      const p = this.peers.get(id); if (!p) return;
      if (E.voice) E.voice.drop(id);
      if (p.av) { p.av.root.removeFromParent(); }
      if (p.has || p.av) E.ui.chatLine('•', `${p.name} left`, '#9aa3c0');
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
          this.act.st.send(msg).catch((e) => { if (this.debug) console.warn('[net] state send failed', e && e.message); });
        }
      }
      const now = performance.now();
      for (const p of this.peers.values()) {
        if (now - p.seen > 20000) { this.drop(p.id); continue; }
        if (!p.av || !p.has) continue;
        const far = Math.hypot(p.tx - p.x, p.ty - p.y, p.tz - p.z) > 10;
        p.x = far ? p.tx : damp(p.x, p.tx, 12, dt); p.y = far ? p.ty : damp(p.y, p.ty, 12, dt); p.z = far ? p.tz : damp(p.z, p.tz, 12, dt);
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
