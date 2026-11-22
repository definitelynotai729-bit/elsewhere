// Voice chat: proximity voice between players in the same world, browser to browser (WebRTC, through the same
// Trystero room as presence). You hear each player from where their avatar stands: louder when close, panned
// left or right. It is off until the player turns it on (the browser asks for the microphone then).
// Push-to-talk (hold V, or the TALK button on touch screens) by default, or an open mic.
// Voice is presentation only: it never touches the simulation, so runs stay verifiable.
import { audio } from './audio.js';

export function createVoice(E) {
  const settings = () => (E.profile.data.settings.voice = Object.assign({ on: false, mode: 'ptt', hear: true }, E.profile.data.settings.voice || {}));
  const V = {
    enabled: false, stream: null, track: null, pushing: false, live: false, room: null,
    peers: new Map(), // peerId -> { stream, el, src, panner, gain, analyser, buf, level }
    get mode() { return settings().mode; },
    async enable() {
      audio.unlock(); // turning voice on is a click, so sound can start now too
      if (!this.stream) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { E.toast('This browser cannot capture a microphone.', 'bad'); return false; }
        try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }); }
        catch (e) { E.toast('Microphone not available: ' + (e.message || e.name), 'bad'); return false; }
        this.track = this.stream.getAudioTracks()[0];
        this.sendingTo.clear(); // net.js picks who hears us (the nearest players within earshot)
        if (E.net && E.net.refreshInterest) E.net.refreshInterest();
      }
      this.enabled = true; settings().on = true; E.profile.save();
      this.refresh();
      return true;
    },
    disable() {
      this.enabled = false; settings().on = false; E.profile.save();
      if (this.stream) {
        if (this.room) { try { this.room.removeStream(this.stream); } catch (e) {} }
        this.sendingTo.clear();
        this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; this.track = null;
      }
      this.refresh();
    },
    setMode(m) { settings().mode = m === 'open' ? 'open' : 'ptt'; E.profile.save(); this.refresh(); },
    setHear(on) { settings().hear = !!on; E.profile.save(); for (const p of this.peers.values()) if (p.gain) p.gain.gain.value = on ? 1 : 0; },
    setPushing(on) { if (this.pushing !== on) { this.pushing = on; this.refresh(); } },
    // is our microphone live right now? (a disabled track sends silence, so nothing is renegotiated)
    refresh() {
      this.live = !!(this.enabled && this.track && (settings().mode === 'open' || this.pushing));
      if (this.track) this.track.enabled = this.live;
      if (E.ui && E.ui.voice) E.ui.voice(this.enabled, this.live, settings().mode);
    },
    // ---- the room (called by net.js) ----
    sendingTo: new Set(), // who our microphone goes to: only players within earshot (area of interest)
    attach(room) {
      this.room = room; this.sendingTo.clear();
      room.onPeerStream = (stream, peerId) => this.onStream(stream, peerId);
    },
    peerJoined(id) {}, // net.js adds a new player to the voice targets once they are near
    detach() { for (const id of [...this.peers.keys()]) this.drop(id); this.room = null; this.sendingTo.clear(); },
    // send our microphone to exactly these players (adding and removing streams as players come and go)
    setTargets(ids) {
      if (!this.room || !this.stream) { this.sendingTo.clear(); return; }
      const want = new Set(ids);
      for (const id of want) if (!this.sendingTo.has(id)) { this.sendingTo.add(id); try { this.room.addStream(this.stream, { target: id }); } catch (e) {} }
      for (const id of [...this.sendingTo]) if (!want.has(id)) { this.sendingTo.delete(id); try { this.room.removeStream(this.stream, { target: id }); } catch (e) {} }
    },
    onStream(stream, peerId) {
      if (!stream.getAudioTracks().length) return;
      this.drop(peerId);
      // Chrome only feeds remote WebRTC audio into Web Audio while a (muted) media element is playing it
      const el = new Audio(); el.muted = true; el.srcObject = stream; el.play().catch(() => {});
      const p = { stream, el, level: 0 };
      this.peers.set(peerId, p);
      this.wire(p);
    },
    wire(p) {
      const ctx = audio.context(), bus = audio.voiceBus();
      if (!ctx || !bus || p.src) return; // sound is still locked until the first click or key; update() retries
      p.src = ctx.createMediaStreamSource(p.stream);
      p.analyser = ctx.createAnalyser(); p.analyser.fftSize = 256; p.buf = new Uint8Array(p.analyser.fftSize);
      p.panner = ctx.createPanner();
      Object.assign(p.panner, { panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 3, maxDistance: 60, rolloffFactor: 1.1 });
      p.gain = ctx.createGain(); p.gain.gain.value = settings().hear ? 1 : 0;
      p.src.connect(p.analyser); p.src.connect(p.panner); p.panner.connect(p.gain); p.gain.connect(bus);
    },
    drop(id) {
      const p = this.peers.get(id); if (!p) return;
      try { if (p.src) p.src.disconnect(); if (p.gain) p.gain.disconnect(); } catch (e) {}
      p.el.srcObject = null; this.peers.delete(id);
      const np = E.net && E.net.peers.get(id); if (np && np.av && np.av.voiceRing) np.av.voiceRing.visible = false;
    },
    // ---- every frame: place voices at their avatars, hear from the camera, show who is speaking ----
    update(dt) {
      const ctx = audio.context();
      if (!ctx) return;
      const set3 = (node, x, y, z) => { if (node.positionX) { node.positionX.value = x; node.positionY.value = y; node.positionZ.value = z; } else node.setPosition(x, y, z); };
      const cam = E.camera, L = ctx.listener;
      if (cam) {
        set3(L, cam.position.x, cam.position.y, cam.position.z);
        const f = cam.getWorldDirection(this._f || (this._f = new cam.position.constructor()));
        if (L.forwardX) { L.forwardX.value = f.x; L.forwardY.value = f.y; L.forwardZ.value = f.z; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; } else L.setOrientation(f.x, f.y, f.z, 0, 1, 0);
      }
      for (const [id, p] of this.peers) {
        if (!p.src) this.wire(p);
        if (!p.src) continue;
        const np = E.net && E.net.peers.get(id);
        if (np && np.has) set3(p.panner, np.x, np.y + 0.6, np.z);
        // speaking: the loudness of the incoming voice, smoothed
        p.analyser.getByteTimeDomainData(p.buf);
        let s = 0; for (let i = 0; i < p.buf.length; i++) { const v = (p.buf[i] - 128) / 128; s += v * v; }
        const rms = Math.sqrt(s / p.buf.length);
        p.level = Math.max(rms, p.level - dt * 0.6);
        if (np && np.av) {
          if (!np.av.voiceRing) np.av.voiceRing = E.makeVoiceRing ? E.makeVoiceRing(np.av) : null;
          if (np.av.voiceRing) { const on = p.level > 0.02 && settings().hear; np.av.voiceRing.visible = on; if (on) np.av.voiceRing.scale.setScalar(1 + Math.min(0.5, p.level * 4)); }
        }
      }
    },
    // keys: hold V to talk (not while typing)
    init() {
      const typing = (e) => { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); };
      window.addEventListener('keydown', (e) => { if (e.code === 'KeyV' && !typing(e) && !e.repeat) this.setPushing(true); });
      window.addEventListener('keyup', (e) => { if (e.code === 'KeyV') this.setPushing(false); });
      window.addEventListener('blur', () => this.setPushing(false));
      const tb = document.getElementById('tb-talk');
      if (tb) {
        tb.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); tb.classList.add('down'); if (!this.enabled) this.enable(); this.setPushing(true); }, { passive: false });
        const up = (e) => { e.preventDefault(); tb.classList.remove('down'); this.setPushing(false); };
        tb.addEventListener('touchend', up); tb.addEventListener('touchcancel', up);
      }
      // turn the mic back on at load only if it was on and the browser already granted it (no surprise prompts)
      if (settings().on && navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' }).then((r) => { if (r.state === 'granted') this.enable(); else { settings().on = false; } }).catch(() => { settings().on = false; });
      } else settings().on = false;
      this.refresh();
    },
  };
  return V;
}
