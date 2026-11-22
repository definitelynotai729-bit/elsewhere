// All sound is synthesised with Web Audio: no files to download, and worlds can pick a mood.
let ctx = null, master = null, sfxBus = null, musicBus = null, verb = null, noiseBuf = null, voiceBus = null;
let sfxOn = true, musicOn = true;
let wind = null, hum = null, musicTimer = null, musicTheme = null;
let lastStep = 0;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 0.6 : 0; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.17 : 0; musicBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1.4; voiceBus.connect(master); // other players' voices
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // reverb from decaying noise
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 3, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const b = ir.getChannelData(ch); for (let i = 0; i < len; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir;
    const vg = ctx.createGain(); vg.gain.value = 0.5; verb.connect(vg); vg.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function env(g, t, a, peak, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function tone(freq, dur, gain, type = 'sine', slide = 1, delay = 0, bus = sfxBus, wet = 0) {
  if (!ensure()) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
  const g = ctx.createGain(); env(g, t, 0.006, gain, dur);
  o.connect(g); g.connect(bus);
  if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, freq, q, gain, type = 'lowpass', delay = 0, sweep = 1) {
  if (!ensure()) return;
  const t = ctx.currentTime + delay;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep !== 1) f.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
  const g = ctx.createGain(); env(g, t, 0.005, gain, dur);
  s.connect(f); f.connect(g); g.connect(sfxBus);
  s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const SFX = {
  jump() { tone(300, 0.14, 0.18, 'square', 1.7); noise(0.08, 900, 0.8, 0.12); },
  djump() { tone(520, 0.16, 0.16, 'square', 1.6); tone(780, 0.12, 0.08, 'triangle', 1.5, 0.03); },
  land(v = 1) { noise(0.12, 260, 0.7, Math.min(0.5, 0.12 + v * 0.05), 'lowpass'); },
  step() { const n = performance.now(); if (n - lastStep < 140) return; lastStep = n; noise(0.04, 1200 + Math.random() * 600, 1.2, 0.035, 'bandpass'); },
  coin() { tone(988, 0.08, 0.2, 'triangle'); tone(1319, 0.28, 0.2, 'triangle', 1, 0.07, sfxBus, 0.2); },
  gem() { [1568, 1976, 2637].forEach((f, i) => tone(f, 0.22, 0.12, 'sine', 1, i * 0.05, sfxBus, 0.35)); },
  checkpoint() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 0.16, 'triangle', 1, i * 0.07, sfxBus, 0.3)); },
  pad() { tone(180, 0.32, 0.3, 'sine', 3.2); tone(90, 0.2, 0.25, 'sine', 2); },
  boost() { noise(0.45, 400, 1.5, 0.3, 'bandpass', 0, 8); tone(220, 0.4, 0.12, 'sawtooth', 2.5); },
  portal() { noise(1.0, 200, 1, 0.35, 'bandpass', 0, 12); [392, 494, 587, 784].forEach((f, i) => tone(f, 1.0, 0.07, 'sine', 1.01, 0.1 + i * 0.04, sfxBus, 0.6)); },
  pickup() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? 0.9 : 0.16, 0.18, 'triangle', 1, i * 0.09, sfxBus, 0.4)); },
  blip() { tone(1200 + Math.random() * 300, 0.035, 0.05, 'square'); },
  click() { tone(900, 0.05, 0.1, 'triangle'); },
  error() { tone(150, 0.25, 0.2, 'sawtooth', 0.8); },
  crumble() { noise(0.5, 500, 0.6, 0.35, 'lowpass', 0, 0.3); },
  respawn() { tone(700, 0.25, 0.15, 'triangle', 0.4); noise(0.3, 1500, 1, 0.1, 'bandpass', 0, 0.3); },
  chat() { tone(1600, 0.06, 0.06, 'sine'); tone(2100, 0.1, 0.05, 'sine', 1, 0.05); },
  open() { tone(55, 2.5, 0.5, 'sawtooth', 0.7); noise(2.2, 120, 0.8, 0.5, 'lowpass'); [261, 329, 392, 523, 659].forEach((f, i) => tone(f, 2.5, 0.08, 'triangle', 1, 0.6 + i * 0.12, sfxBus, 0.7)); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.45, 0.18, 'triangle', 1, i * 0.11, sfxBus, 0.35)); },
  lose() { [330, 262].forEach((f, i) => tone(f, 0.5, 0.15, 'triangle', 1, i * 0.25)); },
  countdown() { tone(660, 0.15, 0.2, 'square'); },
  go() { tone(1320, 0.4, 0.22, 'square'); },
};

// ---- generative ambient music: a slow pad progression plus sparse plucks ----
const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10] };
function startMusic(theme) {
  stopMusic();
  musicTheme = theme;
  if (!theme || !ensure()) return;
  const scale = SCALES[theme.scale || 'minor'] || SCALES.minor;
  const root = theme.root || 57;
  const prog = theme.progression || [0, 5, 3, 4];
  const beat = 60 / (theme.bpm || 72);
  let bar = 0, next = ctx.currentTime + 0.2, step = 0;
  const note = (deg, oct = 0) => root + scale[((deg % 7) + 7) % 7] + 12 * (Math.floor(deg / 7) + oct);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = theme.bright || 1400; lp.connect(musicBus);
  const wet = ctx.createGain(); wet.gain.value = 0.9; lp.connect(wet); wet.connect(verb);
  const delay = ctx.createDelay(1); delay.delayTime.value = beat * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.35; delay.connect(fb); fb.connect(delay); delay.connect(lp);
  const voice = (n, t, dur, gain, type, dest) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = midi(n);
    o.detune.value = (Math.random() - 0.5) * 12;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(1.2, dur * 0.3)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.1);
  };
  const pluck = (n, t, gain) => {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = midi(n);
    const g = ctx.createGain(); env(g, t, 0.005, gain, 0.9);
    o.connect(g); g.connect(lp); g.connect(delay); o.start(t); o.stop(t + 1);
  };
  const thump = (t, n) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(midi(n), t); o.frequency.exponentialRampToValueAtTime(midi(n) * 0.5, t + 0.18);
    const g = ctx.createGain(); env(g, t, 0.004, 0.5, 0.22); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.3);
  };
  const hat = (t) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); env(g, t, 0.002, 0.08, 0.05); s.connect(f); f.connect(g); g.connect(musicBus); s.start(t, Math.random()); s.stop(t + 0.08);
  };
  musicTimer = setInterval(() => {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.4) {
      const inBar = step % 8; // eighth notes
      if (inBar === 0) {
        const deg = prog[bar % prog.length];
        const dur = beat * 4 + 1.2;
        [0, 2, 4].forEach((k) => voice(note(deg + k, -1), next, dur, 0.06, theme.wave || 'triangle', lp));
        voice(note(deg, -2), next, dur, 0.07, 'sine', lp);
        bar++;
      }
      if (theme.pulse) {
        if (inBar % 2 === 0) thump(next, note(prog[(bar - 1 + prog.length) % prog.length], -2));
        if (inBar % 2 === 1) hat(next);
      }
      if (Math.random() < (theme.sparkle == null ? 0.22 : theme.sparkle)) {
        const deg = prog[(bar - 1 + prog.length) % prog.length] + [0, 2, 4, 7, 9][Math.floor(Math.random() * 5)];
        pluck(note(deg, 1), next, 0.05);
      }
      next += beat / 2; step++;
    }
  }, 100);
}
function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

function loop(kind) {
  if (!ensure()) return null;
  if (kind === 'wind') {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start();
    return { g, f };
  }
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 60;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 120;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
  const g = ctx.createGain(); g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); o.start(); o2.start();
  return { g, f, o, o2 };
}

export const audio = {
  // the Web Audio context (null until the first click or key press unlocks sound) and the voice-chat bus
  context() { return ctx; },
  voiceBus() { return voiceBus; },
  unlock() { ensure(); if (musicTheme && !musicTimer && musicOn) startMusic(musicTheme); },
  play(name, arg) { if (!sfxOn) return; const f = SFX[name]; if (f) try { f(arg); } catch (e) {} },
  setSfx(on) { sfxOn = !!on; if (sfxBus) sfxBus.gain.value = sfxOn ? 0.6 : 0; },
  setMusic(on) { musicOn = !!on; if (musicBus) musicBus.gain.value = musicOn ? 0.17 : 0; if (musicOn && musicTheme && !musicTimer && ctx) startMusic(musicTheme); if (!musicOn) stopMusic(); },
  music(theme) { musicTheme = theme; if (musicOn && ctx) startMusic(theme); else stopMusic(); },
  // continuous sounds driven every frame: wind while gliding/falling fast, hum while riding
  wind(level) {
    if (!ctx || !sfxOn) return;
    if (!wind) wind = loop('wind');
    if (!wind) return;
    wind.g.gain.setTargetAtTime(level * 0.25, ctx.currentTime, 0.1);
    wind.f.frequency.setTargetAtTime(400 + level * 900, ctx.currentTime, 0.2);
  },
  hum(level, speed) {
    if (!ctx || !sfxOn) return;
    if (!hum) hum = loop('hum');
    if (!hum) return;
    hum.g.gain.setTargetAtTime(level * 0.06, ctx.currentTime, 0.08);
    hum.o.frequency.setTargetAtTime(50 + speed * 4, ctx.currentTime, 0.1);
    hum.o2.frequency.setTargetAtTime(100 + speed * 8, ctx.currentTime, 0.1);
    hum.f.frequency.setTargetAtTime(300 + speed * 40, ctx.currentTime, 0.1);
  },
};
