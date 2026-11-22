// Headless replay: re-simulate a proof of play with no screen, sound or input, and check it.
// The same code verifies in Node (tools/verify.mjs, the ledger validator) and in the browser (Verify button).
// A proof is untrusted data: it is only ever parsed and range-checked, never evaluated. World code runs
// only if its SHA-256 matches a module the verifier already trusts (the registry / the by-hash archive).
import './detmath.js';
import * as THREE from 'three';
import { initPhysics } from './physics.js';
import { createItems, SLOTS } from './items.js';
import { Player } from './player.js';
import { installCore } from './core.js';
import { worldSave } from './profile.js';
import { FORMAT, MAX_TICKS, decodeInput, frameFromCodes, stateString, canon, signedText, summarize } from './run.js';
import { verifyText } from './identity.js';
import { sha256hex } from './util.js';

const noop = () => {};
const hang = () => new Promise(noop);
function stubs() {
  return {
    ui: { busy: false, toast: noop, prompt: noop, banner: noop, objective: noop, timer: noop, refreshHud: noop, flash: noop, dialog: hang, choice: hang, shop: noop, openPanel: noop, cabinet: noop, refreshPanel: noop, coinPop: noop },
    audio: { play: noop, music: noop, wind: noop, hum: noop },
    fx: { burst: noop, dust: noop, ring: noop, addAmbient: () => ({ points: new THREE.Object3D() }), clearAmbient: noop, update: noop, setScale: noop },
    camRig: { yaw: 0, pitch: 0, dist: 7.5, snap: noop, shake: noop, update: noop },
    net: { announce: noop, join: noop, leave: noop },
    toast: noop,
  };
}
function memProfile(entry, worldId) {
  const data = {
    v: 1, name: '', colors: { body: '#3ec8ff', head: '#eef1ff', visor: '#ff4fd8' }, online: false,
    coins: entry.coins, inv: entry.inv, eq: entry.eq, flags: entry.flags, worlds: {}, settings: {}, created: 1,
  };
  if (entry.save) data.worlds[worldId] = entry.save;
  return { data, save: noop, world: (id) => worldSave(data, id) };
}

// ---- structure checks for untrusted proofs ----
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isHex64 = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);
const isId = (s) => typeof s === 'string' && /^[a-z][a-z0-9-]{1,31}$/.test(s);
const EVENT_TYPES = ['ui', 'equip', 'buy', 'cab', 'event', 'travel'];
export function checkShape(p) {
  if (!isObj(p)) return 'not a JSON object';
  if (p.format !== FORMAT) return `not an ${FORMAT} proof`;
  if (typeof p.sim !== 'string') return 'missing sim version';
  if (!isObj(p.world) || !isId(p.world.id) || !isHex64(p.world.sha256)) return 'bad world reference';
  if (!Array.isArray(p.registry) || !p.registry.length || p.registry.length > 256 || !p.registry.every((r) => isObj(r) && isId(r.id) && isHex64(r.sha256))) return 'bad registry list';
  if (!p.registry.some((r) => r.id === p.world.id && r.sha256 === p.world.sha256)) return 'the world is not in the registry list';
  if (new Set(p.registry.map((r) => r.id)).size !== p.registry.length || new Set(p.registry.map((r) => r.sha256)).size !== p.registry.length) return 'the registry list repeats a world';
  if (p.from != null && !isId(p.from)) return 'bad origin';
  const e = p.entry;
  if (!isObj(e) || !Number.isInteger(e.coins) || e.coins < 0 || !isObj(e.inv) || !isObj(e.eq) || !isObj(e.flags) || (e.save != null && !isObj(e.save))) return 'bad entry state';
  if (Object.values(e.inv).some((n) => !Number.isInteger(n) || n < 1) || Object.keys(e.eq).some((s) => !SLOTS.includes(s))) return 'bad entry items';
  if (canon(e).length > 400000) return 'entry state is too large';
  if (!Number.isInteger(p.ticks) || p.ticks < 1 || p.ticks > MAX_TICKS) return 'bad tick count';
  if (typeof p.input !== 'string' || p.input.length > 4000000) return 'bad input log';
  if (!Array.isArray(p.events) || p.events.length > 5000 || !p.events.every((a) => Array.isArray(a) && Number.isInteger(a[0]) && a[0] >= 0 && a[0] < p.ticks && EVENT_TYPES.includes(a[1]))) return 'bad event list';
  if (!Array.isArray(p.claims) || p.claims.length > 20000 || !p.claims.every((c) => Array.isArray(c) && Number.isInteger(c[0]) && typeof c[1] === 'string')) return 'bad claim list';
  if (!isHex64(p.state)) return 'bad state hash';
  if (p.end != null && !(isObj(p.end) && Number.isInteger(p.end.tick) && isId(p.end.to))) return 'bad end';
  // continuity: the player's previous run (its proof id) and this run's place in their chain
  if (p.chain != null && !(isObj(p.chain) && Number.isInteger(p.chain.seq) && p.chain.seq >= 1 && p.chain.seq <= 1e9 && (p.chain.prev === null ? p.chain.seq === 1 : typeof p.chain.prev === 'string' && /^[0-9a-f]{24}$/.test(p.chain.prev) && p.chain.seq > 1))) return 'bad chain link';
  return null;
}

const yieldNow = () => new Promise((r) => (typeof setImmediate === 'function' ? setImmediate(r) : (() => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); })()));

// A headless engine inside a world, set up exactly as a live visit sets one up.
// spec: { registry: [{id, sha256}], world: {id, sha256}, from, entry }. opts.ui replaces the silent UI (tests).
export async function bootHeadless(spec, env, opts = {}) {
  await initPhysics();
  const E = Object.assign({ headless: true, THREE, items: createItems(), registry: { worlds: [] } }, stubs());
  if (opts.ui) Object.assign(E.ui, opts.ui);
  E.scene = new THREE.Scene();
  E.render = { scene: E.scene, applyTheme: noop, follow: noop, render: noop, setQuality: noop };
  let visit = null;
  const pinned = []; // every module the run pinned; levels among them stay out of the world list, as they do live
  try {
    for (const r of spec.registry) {
      const mod = await env.loadModule(r, { data: true }); // read for its items and rules only: a cached copy is fine
      if (!mod || mod.id !== r.id || typeof mod.build !== 'function') throw new Error(`module ${r.sha256.slice(0, 8)} is not world "${r.id}"`);
      const w = { id: mod.id, name: mod.name, kind: mod.kind || 'world', author: mod.author || 'unknown', version: mod.version || 1, blurb: mod.blurb || '', color: mod.color || '#9d7bff', sha256: r.sha256, rules: mod.rules || {}, items: mod.items || {} };
      pinned.push(w);
      // live, the world list (w.worlds) is the first-party registry; community levels are pinned only for the
      // visit itself or for the creator items they define
      if (w.kind !== 'level') E.registry.worlds.push(w);
      for (const [id, def] of Object.entries(mod.items || {})) E.items.register(id, JSON.parse(JSON.stringify(def)), mod.id);
    }
    visit = await env.loadModule(spec.world); // a fresh instance, exactly as a live visit imports one
  } catch (e) { return { error: 'Could not load the pinned world code: ' + e.message }; }
  E.profile = memProfile(JSON.parse(JSON.stringify(spec.entry)), spec.world.id);
  installCore(E);
  E.player = new Player(E, E.profile.data, { headless: true });
  const entry = pinned.find((w) => w.id === spec.world.id && w.sha256 === spec.world.sha256);
  const { err } = await E.enterWorld(entry, visit, spec.from || null, { replaying: !!opts.replaying });
  if (err) return { E, error: 'The world failed to build: ' + err.message };
  return { E };
}

// env.loadModule({ id, sha256 }) -> a fresh instance of that exact module (it must check the hash)
export async function replayRun(proof, env) {
  const box = {};
  try { return await replay(proof, env, box); }
  finally { try { if (box.E && box.E.world) box.E.world.dispose(); } catch (e) {} }
}
async function replay(proof, env, box) {
  const t0 = Date.now(), res = { ok: false, sim: proof && proof.sim, world: proof && proof.world && proof.world.id };
  const fail = (reason, extra) => Object.assign(res, { ok: false, reason, ms: Date.now() - t0 }, extra || {});
  const bad = checkShape(proof);
  if (bad) return fail('Malformed proof: ' + bad + '.');
  // (which engine replays a proof is the caller's choice: tools/engines.mjs picks the one the proof names)
  let input;
  try { input = decodeInput(proof.input); } catch (e) { return fail('Input log: ' + e.message + '.'); }
  if (input.n !== proof.ticks) return fail('The input log does not cover the claimed number of ticks.');

  const boot = await bootHeadless(proof, env, { replaying: true });
  box.E = boot.E;
  if (boot.error) return fail(boot.error);
  const E = boot.E;
  const script = new Map();
  for (const a of proof.events) { if (!script.has(a[0])) script.set(a[0], []); script.get(a[0]).push(a.slice(1)); }
  E.sim.script = script;
  await yieldNow();

  for (let t = 0; t < proof.ticks; t++) {
    let flush = false;
    try { flush = E.tick(frameFromCodes(input.qx[t], input.qy[t], input.qa[t], input.bits[t])); } catch (e) { console.error('replay tick', t, e); }
    if (flush) await yieldNow();
    if (env.progress && t % 600 === 0) await env.progress(t / proof.ticks);
    if (E.sim.ended && t < proof.ticks - 1) return fail(`The replay left the world at tick ${t}, before the run did (tick ${proof.ticks - 1}).`, { divergedAt: t });
  }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const claims = E.sim.claims;
  const want = canon(proof.claims), got = canon(claims);
  if (want !== got) {
    let i = 0; while (i < claims.length && i < proof.claims.length && canon(claims[i]) === canon(proof.claims[i])) i++;
    const c = claims[i], p = proof.claims[i];
    return fail(`Claims differ from claim ${i + 1}: the proof says ${p ? JSON.stringify(p) : 'nothing more'}, the replay gives ${c ? JSON.stringify(c) : 'nothing more'}.`, { divergedAt: (p || c || [null])[0], replayClaims: claims });
  }
  const endWant = proof.end ? canon(proof.end) : 'null', endGot = E.sim.ended ? canon(E.sim.ended) : 'null';
  if (endWant !== endGot) return fail(`The run's ending differs: proof ${endWant}, replay ${endGot}.`);
  const state = await sha256hex(stateString(E));
  if (state !== proof.state) return fail('Same claims, but the final game state differs from the proof (state hash mismatch).', { replayState: state });
  // what the player owns afterwards: the next run in their chain must start from exactly this
  const pd = E.profile.data;
  res.final = JSON.parse(JSON.stringify({ coins: pd.coins, inv: pd.inv, eq: pd.eq, flags: pd.flags, save: pd.worlds[proof.world.id] || null }));

  // who played it
  let sig = 'unsigned';
  if (proof.player && proof.player.key && proof.sig) {
    const v = await verifyText(proof.player.key, signedText(proof), proof.sig);
    sig = v === true ? 'valid' : v === false ? 'INVALID' : 'unchecked';
    if (v === false) return fail('The replay matches, but the signature does not: the proof was altered after signing, or signed by a different key.', { sigStatus: sig });
  }
  return Object.assign(res, { ok: true, ticks: proof.ticks, seconds: proof.ticks / 60, summary: summarize(claims), state, sigStatus: sig, ms: Date.now() - t0 });
}
