// Elsewhere engine entry: boot, world loading (hash-checked modules), the fixed-step loop.
import * as THREE from 'three';
import { initPhysics } from './physics.js';
import { createRender } from './render.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { profile } from './profile.js';
import { items, SLOTS } from './items.js';
import { Player, CameraRig } from './player.js';
import { WorldRuntime } from './world.js';
import { FX } from './fx.js';
import { createUI } from './ui.js';
import { createNet } from './net.js';
import { sha256hex, isTouch, clamp } from './util.js';

export const VERSION = '0.1.0';
const DT = 1 / 60;

const E = (window.EW = {
  VERSION, THREE, input, audio, profile, items,
  REPO: 'https://github.com/definitelynotai729-bit/elsewhere',
  world: null, registry: null, traveling: false,
});

async function loadModule(entry) {
  const url = new URL(entry.url, location.href);
  const res = await fetch(url.href + (entry.sha256 ? '?h=' + entry.sha256.slice(0, 12) : ''), { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  if (entry.sha256) {
    const h = await sha256hex(text);
    if (h !== entry.sha256) throw new Error('hash mismatch: this file is not the one the registry pins');
  }
  const blob = new Blob([text, `\n//# sourceURL=${url.href}`], { type: 'text/javascript' });
  const burl = URL.createObjectURL(blob);
  try { return (await import(/* @vite-ignore */ burl)).default; }
  catch (err) {
    if (entry.sha256) throw err;
    return (await import(/* @vite-ignore */ url.href)).default; // unpinned dev worlds only
  } finally { URL.revokeObjectURL(burl); }
}

E.travel = async (id, opts = {}) => {
  if (E.traveling) return;
  const entry = E.registry.worlds.find((w) => w.id === id);
  if (!entry) { E.toast(`No world called "${id}" in the registry.`, 'bad'); return; }
  E.traveling = true;
  if (!opts.first) { audio.play('portal'); E.camRig.shake(0.15); await E.ui.fade(true); }
  let mod;
  try { mod = await loadModule(entry); }
  catch (err) {
    console.error(err);
    E.toast(`Could not open ${entry.name}: ${err.message}`, 'bad');
    await E.ui.fade(false); E.traveling = false;
    if (!E.world && id !== 'hub') return E.travel('hub', { first: true });
    return;
  }
  if (E.world) { E.world.dispose(); }
  E.net.leave();
  E.ui.prompt(null);
  const rt = new WorldRuntime(E, entry, mod);
  E.world = rt;
  E.player.forceBoard = false; E.player.setBoard(false);
  const def = rt.spawnFor(null);
  E.player.attach(rt.P, def.pos, def.yaw);
  try { await rt.build(); }
  catch (err) { console.error(`[${id}] build failed`, err); E.toast(`${entry.name} failed to build: ${err.message}`, 'bad'); }
  const sp = rt.spawnFor(opts.from);
  E.player.place(sp.pos, sp.yaw);
  E.player.checkpoint.pos.copy(sp.pos); E.player.checkpoint.yaw = sp.yaw;
  E.refreshEquipment();
  E.camRig.snap(E.player); E.camRig.yaw = sp.yaw; E.camRig.pitch = 0.28;
  const save = profile.world(id); save.visits = (save.visits || 0) + 1; save.coinTotal = rt.coins.length; profile.save();
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
  if (profile.data.online && profile.data.created) E.net.join(id);
  E.ui.refreshHud();
  E.traveling = false;
  await E.ui.fade(false);
  E.ui.banner(mod.name, mod.blurb || entry.blurb || '');
  rt.emit('enter', opts.from || null);
};

E.giveItem = (id, opts = {}) => {
  const def = items.get(id);
  if (!def) return false;
  const d = profile.data;
  const first = !d.inv[id];
  d.inv[id] = (d.inv[id] || 0) + 1;
  if (def.slot && !d.eq[def.slot]) d.eq[def.slot] = id;
  profile.save(); E.refreshEquipment(); E.net.announce();
  if (!opts.silent) {
    audio.play('pickup');
    E.ui.banner(def.name, def.desc);
    E.toast(first ? `New item: ${def.name}${def.slot && d.eq[def.slot] === id ? ' (equipped)' : ''}. Press I to see your items.` : `+1 ${def.name}`, 'item');
  }
  return true;
};
E.equip = (id, slot) => {
  const d = profile.data;
  if (id) { const def = items.get(id); if (!def || !def.slot || !d.inv[id]) return; d.eq[def.slot] = id; }
  else if (slot) d.eq[slot] = null;
  profile.save(); E.refreshEquipment(); E.net.announce(); audio.play('click');
};
E.refreshEquipment = () => {
  const d = profile.data;
  for (const s of SLOTS) E.player.avatar.equip(s, d.eq[s] && items.get(d.eq[s]) ? d.eq[s] : null);
  E.player.updateAbilities(E.world ? E.world.rules : {}, d.eq);
  E.ui.refreshHud();
};
E.addCoins = (n) => {
  profile.data.coins = Math.max(0, profile.data.coins + n); profile.save();
  E.ui.refreshHud();
  const c = document.getElementById('coins'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
};
E.toast = (t, k) => E.ui.toast(t, k);
let hudSoon = 0;
E.refreshHudSoon = () => { clearTimeout(hudSoon); hudSoon = setTimeout(() => E.ui.refreshHud(), 30); };
E.applyQuality = () => {
  let q = profile.data.settings.quality;
  if (q === 'auto') q = E.autoQuality || (isTouch() ? 'medium' : 'high');
  E.render.setQuality(q);
  if (E.fx) E.fx.setScale(E.render.renderer, E.camera);
};
E.onRespawn = () => { E.ui.fade(true).then(() => setTimeout(() => E.ui.fade(false), 120)); if (E.world) E.world.emit('respawn'); };

// debug + test hooks
E.debug = {
  tp(x, y, z) { E.player.place(new THREE.Vector3(x, y, z)); E.camRig.snap(E.player); },
  state() { const p = E.player; return { world: E.world && E.world.id, pos: [p.pos.x, p.pos.y, p.pos.z].map((v) => +v.toFixed(2)), grounded: p.grounded, board: p.board, abil: p.abil, coins: profile.data.coins, inv: profile.data.inv, peers: E.net.peers.size }; },
  give(id) { return E.giveItem(id); },
};

function handleInteract() {
  const rt = E.world, p = E.player.pos;
  let best = null, bd = 1e9;
  if (!E.ui.busy) for (const it of rt.interactables) {
    if (!it.enabled) continue;
    const d = (it.pos.x - p.x) ** 2 + (it.pos.z - p.z) ** 2 + ((it.pos.y - p.y) * 0.5) ** 2;
    if (d < it.radius * it.radius && d < bd) { bd = d; best = it; }
  }
  if (best !== E.near) { E.near = best; E.ui.prompt(best ? best.label : null); }
  if (input.take('use') && best && !E.ui.busy) { E.ui.prompt(null); E.near = null; Promise.resolve(best.onUse()).catch((e) => console.error(e)); }
}

let last = 0, acc = 0, fpsT = 0, fpsN = 0, fpsChecks = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
  input.poll(dt);
  const pl = E.player, rt = E.world;
  const live = rt && !E.traveling;
  if (live) {
    acc += dt;
    let n = 0;
    while (acc >= DT && n < 8) {
      try {
        rt.preTick(DT);
        pl.tick(DT, input, E.camRig.yaw);
        rt.P.step();
        rt.postTick(DT);
      } catch (err) { console.error('tick', err); }
      acc -= DT; n++;
    }
    if (n === 8) acc = 0;
    handleInteract();
    const alpha = acc / DT;
    pl.frame(dt, alpha);
    rt.frame(dt, now / 1000, alpha);
    audio.wind(pl.gliding ? 0.55 : clamp((-pl.vel.y - 14) / 30, 0, 0.8));
    audio.hum(pl.board ? 1 : 0, Math.abs(pl.boardSpeed));
  } else { input.take('use'); input.take('jump'); }
  E.camRig.update(dt, pl, input, live ? rt.P : null, profile.data.settings);
  E.render.follow(pl.renderPos);
  E.fx.update(dt, now / 1000);
  E.net.update(dt);
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
  input.init(canvas);
  input.usePointerLock = profile.data.settings.lock !== false;
  E.ui = createUI(E);
  E.ui.loading('Starting physics…');
  await initPhysics();
  E.render = createRender(canvas);
  E.scene = E.render.scene; E.camera = E.render.camera;
  E.fx = new FX(E.scene);
  audio.setSfx(profile.data.settings.sfx); audio.setMusic(profile.data.settings.music);
  E.applyQuality();
  window.addEventListener('resize', () => { E.render.resize(); E.fx.setScale(E.render.renderer, E.camera); });
  E.ui.loading('Reading the world registry…');
  const res = await fetch('worlds/registry.json', { cache: 'no-cache' });
  E.registry = await res.json();
  for (const w of E.registry.worlds) for (const [id, def] of Object.entries(w.items || {})) items.register(id, def, w.id);
  E.player = new Player(E, profile.data);
  E.scene.add(E.player.avatar.root);
  E.camRig = new CameraRig(E.camera);
  E.net = createNet(E);
  E.net.enabled = !!profile.data.online;
  try { await Promise.race([document.fonts.load('600 40px "Chakra Petch"'), new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  E.ui.loading('Opening a portal…');
  const want = (location.hash || '').replace('#', '');
  const start = E.registry.worlds.some((w) => w.id === want) ? want : 'hub';
  await E.travel(start, { first: true });
  E.ui.hideLoading();
  requestAnimationFrame(loop);
  const unlock = () => { audio.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
  if (!profile.data.created) {
    E.camRig.yaw = E.player.yaw + Math.PI; E.camRig.dist = 4.5; E.camRig.pitch = 0.12;
    await E.ui.creator(true);
    E.camRig.yaw = E.player.yaw; E.camRig.dist = 7.5; E.camRig.pitch = 0.28;
    E.world.emit('firstVisit');
  }
  E.player.avatar.setColors(profile.data.colors);
  E.ui.refreshHud();
}

boot().catch((err) => {
  console.error(err);
  const m = document.getElementById('load-msg');
  if (m) m.textContent = 'Something went wrong starting Elsewhere: ' + err.message + '. Try a recent Chrome, Edge, Firefox or Safari.';
});
