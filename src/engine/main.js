// Elsewhere engine entry: boot, world loading (hash-checked modules), the fixed-step loop, run recording.
import './detmath.js'; // first: deterministic Math before anything computes a gameplay value
import * as THREE from 'three';
import { initPhysics } from './physics.js';
import { createRender } from './render.js';
import { input, TURN_RATE } from './input.js';
import { audio } from './audio.js';
import { profile } from './profile.js';
import { items, SLOTS } from './items.js';
import { Player, CameraRig } from './player.js';
import { FX } from './fx.js';
import { createUI } from './ui.js';
import { createNet } from './net.js';
import { createVoice } from './voice.js';
import { createAssets } from './assets.js';
import { installCore, DT } from './core.js';
import { SIM, FORMAT, RunLog, captureFrame, quantYaw, encodeInput, stateString, snapshotEntry, signedText, worthKeeping, summarize } from './run.js';
import { ensureKey, signText } from './identity.js';
import { replayRun } from './headless.js';
import { proofEvent, proofIdOf, publishEvent } from './ledger.js';
import { checkLevel, compileLevel } from './level.js';
import { createBuilder } from './builder.js';
import { publish } from './nostr.js';
import { sha256hex, isTouch, clamp } from './util.js';
import { createCharacters } from './characters.js';
import { createBlobs } from './blobs.js';
import { setCharacterLibrary } from './avatar.js';

export const VERSION = '0.3.0';

const E = (window.EW = {
  VERSION, SIM, THREE, input, audio, profile, items,
  REPO: 'https://github.com/definitelynotai729-bit/elsewhere',
  world: null, registry: null, traveling: false, runs: [],
});
installCore(E);

// ---- world modules: fetched, checked against the registry's SHA-256, imported fresh for every visit ----
async function fetchChecked(url, sha256) {
  const res = await fetch(url, { cache: sha256 ? 'force-cache' : 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  if (sha256 && (await sha256hex(text)) !== sha256) throw new Error('hash mismatch: this file is not the one the registry pins');
  return text;
}
async function importText(text, label) {
  const blob = new Blob([text, `\n//# sourceURL=${label}`], { type: 'text/javascript' });
  const burl = URL.createObjectURL(blob);
  try { return (await import(/* @vite-ignore */ burl)).default; } finally { URL.revokeObjectURL(burl); }
}
const moduleText = new Map(); // sha256 -> source (modules are immutable, so this is safe to keep)
async function loadModule(entry) {
  const url = new URL(entry.url || `worlds/by-hash/${entry.sha256}.js`, location.href).href;
  let text = entry.sha256 && moduleText.get(entry.sha256);
  if (!text && entry.text) { // a level compiled here (test-play before publishing): check its hash like any module
    if ((await sha256hex(entry.text)) !== entry.sha256) throw new Error('level text does not match its hash');
    text = entry.text; moduleText.set(entry.sha256, text);
  }
  if (!text) {
    try { text = await fetchChecked(url + (entry.sha256 ? '?h=' + entry.sha256.slice(0, 12) : ''), entry.sha256); }
    catch (err) {
      if (!entry.sha256 || !entry.url) throw err;
      text = await fetchChecked(new URL(`worlds/by-hash/${entry.sha256}.js`, location.href).href, entry.sha256); // older versions stay addressable
    }
    if (entry.sha256) moduleText.set(entry.sha256, text);
  }
  return importText(text, url);
}
// the replay verifier asks for modules by hash only (any version the archive holds)
const loadByHash = (r) => {
  const cur = findWorld(r.id, r.sha256);
  return loadModule(cur || { id: r.id, sha256: r.sha256 });
};

// ---- where worlds come from: the first-party registry, community levels on the ledger, levels being tested here ----
E.community = []; E.localLevels = {};
function findWorld(id, sha256) {
  const lists = [E.registry ? E.registry.worlds : [], E.community, Object.values(E.localLevels)];
  for (const l of lists) { const w = l.find((x) => x.id === id && (!sha256 || x.sha256 === sha256)); if (w) return w; }
  return null;
}
E.findWorld = findWorld;

// ---- creator items: cosmetics a community level gives for clearing it (id '<level id>-r') ----
// The level's module defines the item, so every run pins that module (verifiers load it by hash, like any
// world), and an item can be equipped only while its module is pinned (E.pinned, checked in core).
E.itemWorlds = new Map(); // level id -> { id, sha256 } of levels whose items are registered here
const CREATOR_ITEM = /^(lv-[0-9a-f]{10})-r$/;
function registerWorldItems(entry, mod) {
  const defs = Object.entries(mod.items || {});
  for (const [id, def] of defs) items.register(id, def, mod.id);
  if (defs.length && mod.kind === 'level') E.itemWorlds.set(mod.id, { id: mod.id, sha256: entry.sha256 });
}
// load the levels behind creator items (ones you own, or another player wears); resolves to how many loaded
E.loadItemWorlds = async (ids) => {
  const want = [...new Set(ids.map((id) => (CREATOR_ITEM.exec(id) || [])[1]).filter((lv) => lv && !E.itemWorlds.has(lv)))];
  if (!want.length) return 0;
  if (want.some((lv) => !findWorld(lv))) await E.loadCommunity();
  let n = 0;
  await Promise.all(want.map(async (lv) => {
    const entry = findWorld(lv);
    if (!entry) return;
    try { registerWorldItems(entry, await loadModule(entry)); n++; } catch (e) { console.warn('[items]', lv, e.message); }
  }));
  return n;
};
E.pinned = (source) => !E.run || E.run.pins.has(source);
E.loadCommunity = async () => {
  try { const r = await fetch('ledger/worlds.json', { cache: 'no-cache' }); if (r.ok) { const j = await r.json(); E.community = (j.worlds || []).map((w) => Object.assign({ kind: 'level', url: `worlds/by-hash/${w.sha256}.js` }, w)); } } catch (e) {}
  return E.community;
};
// a level from its data (the Builder, or a JSON file), compiled with the one template: ready to play or publish
E.addLocalLevel = async (raw) => {
  const c = checkLevel(raw);
  if (c.error) throw new Error(c.error);
  const m = await compileLevel(c.level);
  E.localLevels[m.id] = Object.assign(E.localLevels[m.id] || {}, { id: m.id, name: c.level.name, kind: 'level', blurb: c.level.blurb, color: c.level.color, author: c.level.author.name, sha256: m.sha256, text: m.text, level: c.level });
  return m;
};
// test-play a level from its data: compile it and travel there
E.playLevel = async (raw) => {
  const m = await E.addLocalLevel(raw);
  await E.travel(m.id, { from: E.world ? E.world.id : null });
  return m;
};
// publish a level you have cleared: the level data plus your verified clear run, to the public relays
E.publishLevel = async (id) => {
  const L = E.localLevels[id];
  if (!L) throw new Error('test-play the level first');
  const r = E.runs.find((x) => x.proof.world.id === id && x.proof.world.sha256 === L.sha256 && x.proof.claims.some((c) => c[1] === 'record' && c[2] === 'time'));
  if (!r) throw new Error('clear your level first: the validator replays your clear run before it accepts the level');
  const key = await ensureKey(profile);
  if (!key || r.proof.player.key !== key.pub) throw new Error('the clear run must be signed by your own key');
  const level = Object.assign({}, L.level, { author: { name: profile.data.name || 'Wanderer', key: key.pub } });
  if (JSON.stringify(level.author) !== JSON.stringify(L.level.author)) throw new Error('set your name and key on the level before clearing it (open it again from the Builder)');
  // the level's models go to the relays first: the level names them by hash, and players fetch them from there
  for (const h of [...new Set(level.parts.filter((p) => p.s === 'mesh').map((p) => p.h))]) {
    if (!(await E.blobs.local(h))) throw new Error(`model ${h.slice(0, 10)} is not in this browser: import it again in the Builder`);
    if (!(await E.blobs.publish(h))) throw new Error(`no relay took model ${h.slice(0, 10)}; try again in a moment`);
  }
  const ev = await publishEvent(level, r.proof);
  const res = await publish(ev);
  return { event: ev.id, ok: res.filter((x) => x.ok).length, total: res.length };
};

// ---- runs: every world visit is recorded so it can be replayed and verified ----
function startRun(entry, from) {
  // pins: every first-party world, the levels behind creator items registered here, and this world
  const registry = E.registry.worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
  for (const w of E.itemWorlds.values()) if (!registry.some((r) => r.id === w.id)) registry.push(w);
  if (!registry.some((r) => r.id === entry.id)) registry.push({ id: entry.id, sha256: entry.sha256 });
  E.run = {
    world: { id: entry.id, sha256: entry.sha256 }, from: from || null, registry, pins: new Set(registry.map((r) => r.id)),
    entry: snapshotEntry(profile.data, entry.id), started: new Date().toISOString(), tainted: null,
  };
  E.rec = new RunLog();
  E.lastQa = 0;
}
const taint = (why) => { if (E.run && !E.run.tainted) { E.run.tainted = why; console.info(`[run] ${why}: this visit can no longer be verified`); } };
// Freeze the current run (synchronously, so it is exact), then hash and sign it.
function snapshotRun() {
  if (!E.run || !E.sim || !E.rec) return null;
  const run = E.run, sim = E.sim, n = Math.min(E.rec.n, sim.tick);
  return {
    run, n, events: E.rec.events.filter((a) => a[0] < n), claims: sim.claims.map((c) => c.slice()), end: sim.ended && !sim.ended.external ? { tick: sim.ended.tick, to: sim.ended.to } : null,
    state: stateString(E), input: encodeInput(E.rec, n), full: E.rec.full,
  };
}
async function sealRun(s) {
  if (!s || s.n < 1) return null;
  const { run } = s;
  const proof = {
    format: FORMAT, sim: SIM, engine: VERSION, world: run.world, registry: run.registry, from: run.from, entry: run.entry,
    started: run.started, ticks: s.n, input: s.input, events: s.events, claims: s.claims, end: s.end,
    state: await sha256hex(s.state),
    player: { name: profile.data.name || 'Wanderer' },
  };
  const key = await ensureKey(profile);
  if (key) { proof.player.key = key.pub; proof.sig = await signText(key, signedText(proof)); }
  return proof;
}
const RUNS_KEY = 'elsewhere_runs_v1';
function saveRuns() {
  try {
    let list = E.runs.filter((r) => r.proof).slice(0, 12);
    const pack = (l) => JSON.stringify(l.map((r) => ({ proof: r.proof, verified: r.verified || null, submitted: r.submitted || null })));
    let text = pack(list);
    while (text.length > 1500000 && list.length > 1) { list = list.slice(0, -1); text = pack(list); }
    localStorage.setItem(RUNS_KEY, text);
  } catch (e) {}
}
E.saveRuns = () => saveRuns();
function loadRuns() {
  try { const v = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]'); if (Array.isArray(v)) E.runs = v.filter((r) => r && r.proof && r.proof.format === FORMAT); } catch (e) {}
}
async function finishRun() {
  if (!E.run) return;
  const run = E.run, s = snapshotRun();
  E.run = null; E.rec = null;
  if (!s || run.tainted || s.full || !worthKeeping(s.claims)) return;
  const proof = await sealRun(s);
  if (!proof) return;
  E.runs.unshift({ proof, world: run.world.id, summary: summarize(proof.claims) });
  E.runs = E.runs.slice(0, 20);
  saveRuns();
  E.ui.refreshPanel && E.ui.refreshPanel();
}
// the in-progress visit, sealed as it stands now
E.currentProof = async () => {
  if (!E.run || E.run.tainted) return null;
  return sealRun(snapshotRun());
};
// ---- the season-0 ledger: publish a proof to public Nostr relays; the validator picks it up from there ----
E.proofId = (proof) => proofIdOf(proof);
E.submitRun = async (proof) => {
  const ev = await proofEvent(proof);
  const res = await publish(ev);
  return { event: ev.id, bytes: ev.content.length, ok: res.filter((r) => r.ok).length, total: res.length, relays: res };
};
let ledgerCache = null;
E.ledgerView = async (fresh) => {
  if (ledgerCache && !fresh && Date.now() - ledgerCache.t < 60000) return ledgerCache.v;
  const get = async (f) => { try { const r = await fetch('ledger/' + f, { cache: 'no-cache' }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  const [boards, rejected] = await Promise.all([get('boards.json'), get('rejected.json')]);
  ledgerCache = { t: Date.now(), v: { boards, rejected: rejected ? rejected.list : [] } };
  return ledgerCache.v;
};
E.verify = (proof, onProgress) => replayRun(proof, { loadModule: loadByHash, progress: onProgress ? async (f) => { onProgress(f); await new Promise((r) => setTimeout(r, 0)); } : null });

// ---- travel ----
E.travel = async (id, opts = {}) => {
  if (E.traveling) return;
  const entry = findWorld(id);
  if (!entry) {
    E.toast(`No world called "${id}" in the registry.`, 'bad');
    if (E.world && E.sim && E.sim.ended) { E.leaveWorld(); finishRun(); startRun(findWorld(E.world.id), null); taint('a trip to a missing world'); E.sim.ended = null; }
    return;
  }
  E.traveling = true;
  // called directly (not through a portal or the world list): the run simply stops at this tick
  if (E.sim && !E.sim.ended && E.world) E.sim.ended = { tick: E.sim.tick, to: id, external: true };
  else if (E.sim && E.sim.ended && E.world) E.leaveWorld();
  const done = finishRun();
  if (!opts.first) { audio.play('portal'); E.camRig.shake(0.15); await E.ui.fade(true); }
  let mod;
  try { mod = await loadModule(entry); }
  catch (err) {
    console.error(err);
    E.toast(`Could not open ${entry.name}: ${err.message}`, 'bad');
    await E.ui.fade(false); E.traveling = false;
    if (!E.world && id !== 'hub') return E.travel('hub', { first: true });
    if (E.world) { startRun(findWorld(E.world.id), null); taint('a failed trip'); E.sim.ended = null; }
    return;
  }
  await done;
  if (E.world) E.world.dispose();
  E.net.leave();
  E.ui.prompt(null);
  if (mod.kind === 'level') registerWorldItems(entry, mod); // a level's reward item (before the run pins it)
  startRun(entry, opts.from);
  const { sp, err } = await E.enterWorld(entry, mod, opts.from || null);
  if (err) { console.error(`[${id}] build failed`, err); E.toast(`${entry.name} failed to build: ${err.message}`, 'bad'); }
  input.setScheme(mod.controls);
  E.camRig.setMode(mod.camera || null);
  if (!mod.camera) { E.camRig.snap(E.player); E.camRig.yaw = sp.yaw; E.camRig.pitch = 0.28; if (E.camRig.dist < 3 || E.camRig.dist > 16) E.camRig.dist = 7.5; }
  input.snapHeading(sp.yaw);
  document.body.classList.toggle('topdown', input.scheme === 'topdown');
  const hint = document.getElementById('hint');
  if (hint) hint.textContent = input.scheme === 'topdown' ? 'WASD or arrows move · attacks are automatic when you stand still · Q bolt · E shield · R starfall · Space dash · B recall · V talk · Esc menu' : 'W/S move · A/D turn · Q/E strafe · F use · Arrows camera · Space jump · V talk · I items · M worlds · Esc menu';
  E.lastQa = quantYaw(sp.yaw);
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
  if (profile.data.online && profile.data.created) E.net.join(id);
  E.ui.refreshHud();
  await new Promise((r) => setTimeout(r, 0)); // let any async 'enter' handlers settle before the first tick
  E.traveling = false;
  await E.ui.fade(false);
  E.ui.banner(mod.name, mod.blurb || entry.blurb || '');
};
// leaving through the world list: recorded as an action so the run ends on a tick
E.leaveTo = (id) => { if (E.sim && E.world && !E.sim.ended && !E.traveling) E.queueAction(['travel', id]); else E.travel(id); };

E.toast = (t, k) => E.ui.toast(t, k);
let hudSoon = 0;
E.refreshHudSoon = () => { clearTimeout(hudSoon); hudSoon = setTimeout(() => E.ui.refreshHud(), 30); };
E.applyQuality = () => {
  let q = profile.data.settings.quality;
  if (q === 'auto') q = E.autoQuality || (isTouch() ? 'medium' : 'high');
  E.render.setQuality(q);
  if (E.fx) E.fx.setScale(E.render.renderer, E.camera);
};

// debug + test hooks (anything that changes the game outside the tick marks the visit unverifiable)
E.debug = {
  tp(x, y, z) { taint('debug teleport'); E.player.place(new THREE.Vector3(x, y, z)); E.camRig.snap(E.player); },
  state() { const p = E.player; return { world: E.world && E.world.id, tick: E.sim && E.sim.tick, pos: [p.pos.x, p.pos.y, p.pos.z].map((v) => +v.toFixed(2)), grounded: p.grounded, board: p.board, abil: p.abil, coins: profile.data.coins, inv: profile.data.inv, peers: E.net.peers.size, run: E.run ? { tainted: E.run.tainted, ticks: E.rec ? E.rec.n : 0, claims: E.sim.claims.length } : null }; },
  give(id) { taint('debug give'); return E.giveItem(id); },
};

let last = 0, acc = 0, fpsT = 0, fpsN = 0, fpsChecks = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
  input.poll(dt);
  // a run that ended last frame leaves now: its continuations have run, exactly as a replay waits for them
  if (E.sim && E.sim.ended && !E.sim.ended.external && !E.traveling && E.world) E.travel(E.sim.ended.to, { from: E.world.id });
  const pl = E.player, rt = E.world;
  // while the Builder is open the world is paused: no ticks (a replay never knows), and the Builder has the camera
  const building = !!(E.builder && E.builder.active);
  const live = rt && !E.traveling && E.sim && !E.sim.ended && !building;
  if (live) {
    acc += dt;
    let n = 0;
    while (acc >= DT && n < 8) {
      // keys turn the heading (A/D) and move relative to it; on a board the heading is the board's
      if (pl.board) input.heading = pl.heading;
      else if (input.turnKeys) input.heading -= input.turnKeys * TURN_RATE * DT;
      const f = captureFrame(input, pl.board ? input.boardMove : input.move, input.scheme === 'default' && input.keyMode ? input.heading : E.camRig.yaw, E.lastQa, pl.board);
      E.lastQa = f.q[2];
      let flush = false;
      try { flush = E.tick(f); } catch (err) { console.error('tick', err); }
      acc -= DT; n++;
      // world code went async (a dialog closed, an interaction began): let it continue before the next tick,
      // exactly as a replay does
      if (flush || E.sim.ended) break;
    }
    if (n === 8) acc = 0;
    const alpha = clamp(acc / DT, 0, 1);
    pl.frame(dt, alpha);
    rt.frame(dt, now / 1000, alpha);
    audio.wind(pl.gliding ? 0.55 : clamp((-pl.vel.y - 14) / 30, 0, 0.8));
    audio.hum(pl.board ? 1 : 0, Math.abs(pl.boardSpeed));
  } else { input.take('use'); input.take('jump'); input.take('board'); }
  if (building) E.builder.frame(dt); else E.camRig.update(dt, pl, input, live ? rt.P : null, profile.data.settings);
  E.render.follow(building ? E.builder.focus : pl.renderPos);
  E.fx.update(dt, now / 1000);
  E.net.update(dt);
  E.voice.update(dt);
  input.endFrame();
  E.render.render();
  // adaptive quality: drop a level once if the frame rate stays low
  if (profile.data.settings.quality === 'auto' && live) {
    fpsT += dt; fpsN++;
    if (fpsT > 4) {
      const fps = fpsN / fpsT; fpsT = 0; fpsN = 0; fpsChecks++;
      const q = E.render.quality;
      if (fps < 38 && fpsChecks > 1 && q !== 'low') { E.autoQuality = q === 'high' ? 'medium' : 'low'; E.applyQuality(); E.toast(`Graphics set to ${E.autoQuality} for a smoother frame rate.`); }
    }
  }
}

async function boot() {
  const canvas = document.getElementById('view');
  profile.load();
  loadRuns();
  E.profile = profile;
  input.init(canvas);
  input.usePointerLock = profile.data.settings.lock !== false;
  input.mouseLook = !!profile.data.settings.mouseLook;
  E.ui = createUI(E);
  E.ui.loading('Starting physics…');
  await initPhysics();
  E.render = createRender(canvas);
  E.scene = E.render.scene; E.camera = E.render.camera;
  E.fx = new FX(E.scene);
  E.assets = createAssets(E.render.renderer);
  const assetsReady = E.assets.init();
  E.characters = createCharacters(); // bodies players can wear (presentation only)
  E.blobs = createBlobs(); // uploaded models: kept in this browser and on the public relays, named by their SHA-256
  setCharacterLibrary(E.characters);
  // theme.sky: a photographed sky from the asset library lights the world (and becomes its backdrop
  // unless theme.skyBackdrop is false); worlds without one keep the painted sky
  E.applySky = (theme) => {
    const S = E.scene, sky = E.render.sky;
    S.environment = null; S.background = null; sky.mesh.visible = true;
    if (!theme.sky) return;
    const want = theme.sky;
    E.wantSky = want;
    assetsReady.then(() => E.assets.sky(want)).then(({ env, bg }) => {
      if (E.wantSky !== want) return;
      S.environment = env; S.environmentIntensity = theme.envIntensity == null ? 0.7 : theme.envIntensity;
      if (S.environmentRotation && theme.skyRotate) S.environmentRotation.y = theme.skyRotate * Math.PI / 180;
      if (theme.skyBackdrop !== false) {
        S.background = bg; S.backgroundIntensity = theme.skyBrightness == null ? 1 : theme.skyBrightness;
        if (S.backgroundRotation && theme.skyRotate) S.backgroundRotation.y = theme.skyRotate * Math.PI / 180;
        sky.mesh.visible = false; sky.stars.visible = false;
      }
    }).catch((err) => console.warn('sky', want, err.message));
  };
  audio.setSfx(profile.data.settings.sfx); audio.setMusic(profile.data.settings.music);
  E.applyQuality();
  const onResize = () => { E.render.resize(); E.fx.setScale(E.render.renderer, E.camera); };
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(canvas);
  E.ui.loading('Reading the world registry…');
  const res = await fetch('worlds/registry.json', { cache: 'no-cache' });
  E.registry = await res.json();
  for (const w of E.registry.worlds) for (const [id, def] of Object.entries(w.items || {})) items.register(id, def, w.id);
  E.loadCommunity();
  E.player = new Player(E, profile.data);
  E.scene.add(E.player.avatar.root);
  E.camRig = new CameraRig(E.camera);
  E.net = createNet(E);
  E.net.enabled = !!profile.data.online;
  // voice chat: a ring over a player's head pulses while they speak
  E.makeVoiceRing = (av) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 8, 28), new THREE.MeshBasicMaterial({ color: '#7cf6ff', toneMapped: false })); m.geometry.userData.keep = false; m.position.y = 1.64; m.rotation.x = Math.PI / 2; m.visible = false; av.upper.add(m); return m; };
  E.voice = createVoice(E);
  E.voice.init();
  E.builder = createBuilder(E); // the level editor: UI only, and idle until opened at the Creator's Gate
  window.addEventListener('pagehide', () => { const s = snapshotRun(); if (s && E.run && !E.run.tainted && worthKeeping(s.claims)) sealRun(s).then((p) => { if (p) { E.runs.unshift({ proof: p, world: p.world.id, summary: summarize(p.claims) }); saveRuns(); } }); });
  try { await Promise.race([document.fonts.load('600 40px "Chakra Petch"'), new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  E.ui.loading('Opening a portal…');
  const want = (location.hash || '').replace('#', '');
  if (/^lv-/.test(want)) await Promise.race([E.loadCommunity(), new Promise((r) => setTimeout(r, 3000))]);
  const start = findWorld(want) ? want : 'hub';
  // creator items you own: register them (and so pin their levels) before the first visit begins
  const owned = Object.keys(profile.data.inv), late = E.loadItemWorlds(owned).catch(() => 0);
  await Promise.race([late, new Promise((r) => setTimeout(r, 4000))]);
  late.then(() => { for (const s of SLOTS) E.player.avatar.equip(s, profile.data.eq[s] && items.get(profile.data.eq[s]) ? profile.data.eq[s] : null); });
  await E.travel(start, { first: true });
  E.ui.hideLoading();
  requestAnimationFrame(loop);
  const unlock = () => { audio.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
  if (!profile.data.created) {
    E.camRig.yaw = E.player.yaw + Math.PI; E.camRig.dist = 4.5; E.camRig.pitch = 0.12;
    await E.ui.creator(true);
    E.camRig.yaw = E.player.yaw; E.camRig.dist = 7.5; E.camRig.pitch = 0.28;
    E.queueAction(['event', 'firstVisit']);
  }
  E.player.avatar.setColors(profile.data.colors);
  E.ui.refreshHud();
  ensureKey(profile);
}

boot().catch((err) => {
  console.error(err);
  const m = document.getElementById('load-msg');
  if (m) m.textContent = 'Something went wrong starting Elsewhere: ' + err.message + '. Try a recent Chrome, Edge, Firefox or Safari.';
});
