// Elsewhere engine entry: boot, world loading (hash-checked modules), the fixed-step loop, run recording.
import './detmath.js'; // deterministic Math (entry.js installs it before any module of the game runs)
import * as THREE from 'three';
import { initPhysics } from './physics.js';
import { createRender, allMaterials } from './render.js';
import { installUltra } from './gfx.js';
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
import { SIM, FORMAT, RunLog, captureFrame, quantYaw, encodeInput, stateString, snapshotEntry, signedText, worthKeeping, summarize, canon, endOf } from './run.js';
import { ensureKey, signText } from './identity.js';
import { replayRun } from './headless.js';
import { proofEvent, proofIdOf, publishEvent, genesisState } from './ledger.js';
import { checkLevel, compileLevel } from './level.js';
import { publish } from './nostr.js';
import { sha256hex, isTouch, clamp } from './util.js';
import { createCharacters } from './characters.js';
import { createBlobs } from './blobs.js';
import { setCharacterLibrary, setLookKit } from './avatar.js';
import { lookKit, legacyColors } from './looks.js';
import { createWardrobe, currentLook } from './wardrobe.js';
import { applySettings, applyView } from './settings.js';
import { loadLayout, hintLine } from './controls.js';
import { createWeekly } from './weekly.js';
import { createPowerView } from './powerview.js';
import { familyAllowed, FAMILIES, powerOf } from './items.js';
import { SITE, embedInfo, storageWorks, sayHello, watchFocus } from './embed.js';
import { freeWorld } from './freeworld.js';
import { createCounter } from './count.js';

export const VERSION = '0.3.0';
// the engine this client is: the SHA-256 of the engine module the build archived from the same source
// (docs/engines/by-hash; tools/engines.mjs). Every proof names it, and verifiers replay on exactly that engine.
/* global __ENGINE__ */
export const ENGINE = typeof __ENGINE__ === 'string' ? __ENGINE__ : 'dev';

const E = (window.EW = {
  VERSION, SIM, ENGINE, THREE, input, audio, profile, items,
  REPO: 'https://github.com/definitelynotai729-bit/elsewhere',
  world: null, registry: null, traveling: false, runs: [],
});
installCore(E);
// played inside another site's page (the itch.io upload frames this one): say hello to it, and see whether this
// browser lets the game keep anything here (embed.js)
E.SITE = SITE;
E.embedded = embedInfo();
E.canSave = storageWorks();
sayHello(E.embedded);
// anonymous counts (count.js): nothing at all until the team switches counting on, and never names or IDs
E.count = createCounter({ settings: () => (profile.data && profile.data.settings) || {}, site: E.embedded.site });
const countKnown = {
  world: (id) => !!(E.registry && E.registry.worlds.some((w) => w.id === id)), // first-party worlds (not community levels)
  item: (id) => !!items.get(id) && !/^lv-/.test(id), // first-party items (a community level's reward is lv-...-r)
};
const countDevice = () => ({ phone: isTouch(), quality: E.render ? E.render.quality : 'unknown' });
window.addEventListener('error', () => E.count.event('error/script'));
window.addEventListener('unhandledrejection', () => E.count.event('error/script'));

// ---- a game behind the server's ----
// A page brought back from the browser's cache (the back button, a restored tab or session) can run an earlier
// game than the server's, while the registry, always fetched afresh, names worlds made for the current engine. On
// the earlier engine those fail to build (2026-11-24: a returning player's game, a day behind, met Thyra's walking
// islanders: "myrrha.walk is not a function"). So the registry names its engine, and a game on another one reloads
// itself once, at an address no cache holds (?v=); that page asks for engine.js by its own new name (the build's
// ?c=). Still behind after that (an update landing that very minute), it carries on and says so.
const behind = (reg) => !!(reg && typeof reg.engine === 'string' && ENGINE !== 'dev' && reg.engine !== ENGINE);
function reloadIfBehind(reg) {
  if (!behind(reg)) return false;
  const v = reg.engine.slice(0, 12), u = new URL(location.href);
  if (u.searchParams.get('v') === v) return false; // reloaded for this engine already: carry on
  u.searchParams.set('v', v);
  E.updating = true;
  try { E.ui.loading('Updating to the new version…'); } catch (e) {}
  console.info(`[update] this game runs engine ${ENGINE.slice(0, 8)}, the worlds are made for ${v.slice(0, 8)}: reloading`);
  location.replace(u.href);
  return true;
}

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
// fetch a world's module ahead of the visit (at boot, the first world's, while the physics engine downloads);
// loadModule waits for it rather than fetching twice. A failure here is ignored: loadModule tries again.
const prefetching = new Map();
function prefetchModule(entry) {
  if (!entry || !entry.sha256 || !entry.url || moduleText.has(entry.sha256) || prefetching.has(entry.sha256)) return;
  const url = new URL(entry.url, location.href).href + '?h=' + entry.sha256.slice(0, 12);
  prefetching.set(entry.sha256, fetchChecked(url, entry.sha256).then((t) => { moduleText.set(entry.sha256, t); }, () => {})
    .finally(() => prefetching.delete(entry.sha256)));
}
async function loadModule(entry) {
  const url = new URL(entry.url || `worlds/by-hash/${entry.sha256}.js`, location.href).href;
  if (entry.sha256 && prefetching.has(entry.sha256)) await prefetching.get(entry.sha256);
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
  if (!r) throw new Error('clear your level first: the gallery accepts a level once its clear run checks out');
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

// ---- continuity: every visit extends the player's chain of runs and starts from the state that chain ended in ----
// The chain lives in this browser (head, run number, the state it ended in) and every visit's proof goes to the
// relays in order. The validator accepts a run only if it starts from that player's verified state, so coins and
// items exist only because verified play made them. Edits to the profile, and visits that cannot be verified,
// are undone at the next visit.
const CHAIN_KEY = 'elsewhere_chain_v1', OUTBOX_KEY = 'elsewhere_outbox_v1', UNSEALED_KEY = 'elsewhere_unsealed_v1';
const assetState = (d) => JSON.parse(JSON.stringify({ coins: d.coins, inv: d.inv, eq: d.eq, flags: d.flags, worlds: d.worlds }));
E.chain = null; E.outbox = [];
const saveChain = () => { try { localStorage.setItem(CHAIN_KEY, JSON.stringify(E.chain)); } catch (e) {} };
const saveOutbox = () => { try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(E.outbox)); } catch (e) { console.warn('[chain] the outbox no longer fits in this browser'); } };
function loadChain() {
  const pub = profile.data.key && profile.data.key.pub;
  try { E.chain = JSON.parse(localStorage.getItem(CHAIN_KEY) || 'null'); } catch (e) { E.chain = null; }
  try { const o = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); E.outbox = Array.isArray(o) ? o : []; } catch (e) { E.outbox = []; }
  // a chain belongs to one key: never continue another key's chain (a replaced profile starts its own)
  if (E.chain && E.chain.key && E.chain.key !== pub) { console.warn('[chain] the stored chain belongs to another key; starting this key\'s own'); E.chain = null; }
  if (E.chain && E.chain.state && Number.isInteger(E.chain.seq)) { if (!E.chain.key && pub) { E.chain.key = pub; saveChain(); } return true; }
  E.chain = null;
  return false; // this browser has no chain for this key: ask the ledger before starting one (settleChain)
}
// A browser without this key's chain (a restored backup, a new device, cleared storage) must not start the key's
// chain over: the ledger may already hold it, and a second chain from the start is a fork, refused for ever. So
// it asks the ledger first and continues from the verified state. Only a key the ledger has never seen starts
// fresh, and then anything this browser held before verified play is kept as Season 0 mementos.
async function settleChain(newKey) {
  if (E.chain) return;
  // a key made during this visit (a first visit) cannot be on the ledger yet: nothing to ask, nothing to download
  let r = { ok: true, v: null };
  if (!newKey) { E.ui.loading('Loading your progress…'); r = await E.ledgerState(5000); }
  if (r.ok && r.v) { E.resetToVerified(r.v); E.chainNotice = 'resumed'; return; }
  const d = profile.data, g = genesisState();
  // (provisional: the ledger did not answer, so these may be copies of verified items; catching up drops them)
  if (d.coins > 0 || Object.keys(d.inv).length) { d.legacy = { coins: d.coins, inv: Object.assign({}, d.inv), at: new Date().toISOString().slice(0, 10), provisional: r.ok ? undefined : true }; E.chainNotice = 'migrated'; }
  Object.assign(d, { coins: g.coins, inv: g.inv, eq: g.eq, flags: g.flags, worlds: g.worlds });
  profile.save();
  E.chain = { key: (d.key && d.key.pub) || null, head: null, seq: 0, state: assetState(d), ids: [] }; saveChain();
}
// the chain's recent run ids by step ([seq, first 16 hex]), to tell "behind the ledger" from "ahead of it"
const withId = (ids, seq, id) => (ids || []).concat([[seq, id.slice(0, 16)]]).slice(-256);
// extend the chain with a sealed visit (its proof goes to the outbox, then the relays)
async function chainRun(s, after) {
  const link = { prev: E.chain.head, seq: E.chain.seq + 1 };
  const proof = await sealRun(s, link);
  if (!proof || !proof.sig) return null;
  const id = await proofIdOf(proof);
  E.chain = { key: proof.player.key, head: id, seq: link.seq, state: after, ids: withId(E.chain.ids, link.seq, id) }; saveChain();
  E.outbox.push(proof); saveOutbox();
  pumpOutbox();
  return proof;
}
// send waiting proofs in order (a proof is only useful after the one before it)
let pumping = false;
async function pumpOutbox() {
  if (pumping || !E.outbox.length || profile.data.settings.verify === false) return;
  pumping = true;
  try {
    while (E.outbox.length) {
      const proof = E.outbox[0];
      let r = null; try { r = await E.submitRun(proof); } catch (e) {}
      if (!r || !r.ok) break; // offline, or no relay answered: try again later
      E.outbox.shift(); saveOutbox();
      const k = E.runs.find((x) => x.proof && x.proof.sig === proof.sig);
      if (k) { k.submitted = { event: r.event, at: Date.now() }; saveRuns(); }
    }
  } finally { pumping = false; E.ui.refreshPanel && E.ui.refreshPanel(); }
}
E.pumpOutbox = pumpOutbox;
// this key's entry on the ledger: { ok: true, v } (v null if the ledger has never accepted a run of this key), or
// { ok: false } when the ledger could not be reached in time
E.ledgerState = async (timeout = 10000) => {
  const key = profile.data.key && profile.data.key.pub;
  if (!key) return { ok: false };
  const ask = (async () => {
    try {
      const r = await fetch('ledger/states.json', { cache: 'no-cache' });
      if (r.status === 404) return { ok: true, v: null }; // no ledger here yet
      if (!r.ok) return { ok: false };
      return { ok: true, v: ((await r.json()).keys || {})[key] || null };
    } catch (e) { return { ok: false }; }
  })();
  return Promise.race([ask, new Promise((res) => setTimeout(() => res({ ok: false }), timeout))]);
};
// the player's verified state on the ledger (null until their first run is accepted, or when unreachable)
E.verifiedState = async () => { const r = await E.ledgerState(); return r.ok ? r.v : null; };
// start over from the ledger's verified state (after a run was refused, or on a new device with the same key)
E.resetToVerified = (v) => {
  const d = profile.data, pub = d.key && d.key.pub;
  const st = v ? v.state : genesisState();
  Object.assign(d, JSON.parse(JSON.stringify({ coins: st.coins, inv: st.inv, eq: st.eq, flags: st.flags, worlds: st.worlds })));
  if (d.legacy && d.legacy.provisional) delete d.legacy; // copies made while the ledger could not be asked
  profile.save();
  E.chain = { key: pub, head: v ? v.head : null, seq: v ? v.seq : 0, state: assetState(d), ids: v ? withId([], v.seq, v.head) : [] }; saveChain();
  E.outbox = E.outbox.filter((p) => !p.player || p.player.key !== pub); saveOutbox(); // this key's unsent runs could only be refused now
  try { localStorage.removeItem(UNSEALED_KEY); } catch (e) {}
  E.continueFrom = null;
};
// Two ways this browser's chain can end up where nothing more of it will be accepted:
// - the ledger moved past it: the same key played on another device, or this browser's chain was replaced;
// - the checker refused one of its runs (it could not be replayed: a game left behind by an update, say). Every
//   later run builds on that one, so the checker refuses them all as well ("the previous run never arrived").
//   Found 2026-11-25: a player's one refused visit left every visit after it unsaved for a day.
// Either way the next trip continues from the verified state (startRun), and the visit in progress is not sealed
// (finishRun). E.continueFrom = { v (the verified state, null for none yet), why: 'ahead'|'refused', refused }.
// Checked at load and every 5 minutes; true when the next trip will continue from the verified state.
// ({ reenter: false }: never re-enter the world from here, as the Leaderboards panel asks)
E.continueFrom = null;
const refusedList = async () => {
  try { const r = await fetch('ledger/rejected.json', { cache: 'no-cache' }); return r.ok ? ((await r.json()).list || []) : []; } catch (e) { return []; }
};
E.checkLedger = async (o = {}) => {
  const r = await E.ledgerState();
  if (!r.ok || !E.chain) return !!E.continueFrom;
  const v = r.v, vs = v ? v.seq : 0;
  if (v && v.head === E.chain.head) return false;
  if (v) {
    const mine = (E.chain.ids || []).find((x) => x[0] === v.seq);
    if (v.seq > E.chain.seq || (mine && mine[1] !== v.head.slice(0, 16))) { E.continueFrom = { v, why: 'ahead' }; E.count.event('save/ahead'); return true; }
  }
  // this browser is ahead of the ledger: are its runs waiting for the checker, or was one of them refused?
  // (a refusal is for good; a level whose clear run was fine can be refused alone, which ends nothing)
  const later = (E.chain.ids || []).filter((x) => x[0] > vs);
  if (!later.length) return false;
  const list = await refusedList();
  let refused = null;
  for (const m of later) {
    const x = list.find((y) => y && !y.publish && typeof y.id === 'string' && y.id.slice(0, 16) === m[1]);
    if (x) { refused = { seq: m[0], id: x.id, reason: String(x.reason || ''), at: x.at }; break; }
  }
  if (!refused) return false;
  const told = E.continueFrom && E.continueFrom.why === 'refused' && E.continueFrom.refused.id === refused.id;
  E.continueFrom = { v, why: 'refused', refused };
  E.count.event('save/refused');
  // nothing has happened in this visit yet (the check soon after loading, say): continue from the verified state
  // now, rather than after a visit whose results could only be thrown away
  const fresh = o.reenter !== false && E.world && !E.traveling && E.sim && !E.sim.ended && !E.sim.busy && !E.sim.claims.length;
  if (!told) E.ui.toast(`${refusalWords(refused)} so nothing after it could be saved. ${fresh ? 'You continue from your last saved visit.' : 'Your next trip continues from your last saved visit.'}`, 'bad', 15000);
  if (fresh) { E.chainNotice = 'refused'; E.adoptVerified(v); }
  return true;
};
// a refusal in a player's words (the checker's own reason is in the Leaderboards' advanced part)
function refusalWords(refused) {
  let day = '';
  if (refused.at) {
    const d = new Date(refused.at * 1000), midnight = new Date(); midnight.setHours(0, 0, 0, 0);
    const back = Math.ceil((midnight - d) / 86400000); // 0 today, 1 yesterday...
    day = back <= 0 ? ' earlier today' : back === 1 ? ' yesterday' : back < 7 ? ' on ' + d.toLocaleDateString([], { weekday: 'long' }) : ' on ' + d.toLocaleDateString();
  }
  const old = /out of date|failed to build|engine|is not a function|reload the game/i.test(refused.reason);
  return `A visit of yours${day} could not be checked${old ? ' (it ran on an out-of-date copy of the game),' : ','}`;
}
E.refusalWords = refusalWords;
// continue from v now: the visit in progress started from the old state and could only be refused, so it is not
// sealed, and the world is entered again from the verified state
E.adoptVerified = (v) => {
  taint('continued from the verified state');
  E.resetToVerified(v);
  if (E.world && !E.traveling) E.travel(E.world.id);
};

// ---- runs: every world visit is recorded so it can be replayed and verified ----
function startRun(entry, from, arrival) {
  // nothing more of this browser's chain can be accepted: continue from the verified state (see E.checkLedger)
  if (E.continueFrom) { const why = E.continueFrom.why; E.resetToVerified(E.continueFrom.v); E.chainNotice = why === 'refused' ? 'refused' : 'caught-up'; }
  // the visit starts from the chain's state; anything else (an edited profile, a visit that could not be verified) is undone
  if (E.chain && canon(assetState(profile.data)) !== canon(E.chain.state)) {
    Object.assign(profile.data, JSON.parse(JSON.stringify(E.chain.state))); profile.save();
    E.chainNotice = E.chainNotice || 'reverted';
  }
  // pins: every first-party world, the levels behind creator items registered here, and this world
  const registry = E.registry.worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
  for (const w of E.itemWorlds.values()) if (!registry.some((r) => r.id === w.id)) registry.push(w);
  if (!registry.some((r) => r.id === entry.id)) registry.push({ id: entry.id, sha256: entry.sha256 });
  E.run = {
    world: { id: entry.id, sha256: entry.sha256 }, from: from || null, arrival: arrival || null, registry, pins: new Set(registry.map((r) => r.id)),
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
    run, n, events: E.rec.events.filter((a) => a[0] < n), claims: sim.claims.map((c) => c.slice()), end: endOf(sim.ended),
    state: stateString(E), input: encodeInput(E.rec, n), full: E.rec.full,
  };
}
async function sealRun(s, chain) {
  if (!s || s.n < 1) return null;
  E.lastSealedState = s.state; // the state behind the last proof's hash, for tests that compare it with a replay's
  const { run } = s;
  const proof = {
    format: FORMAT, sim: s.sim || ENGINE, engine: VERSION, world: run.world, registry: run.registry, from: run.from, ...(run.arrival ? { arrival: run.arrival } : {}), entry: run.entry,
    started: run.started, ticks: s.n, input: s.input, events: s.events, claims: s.claims, end: s.end,
    state: await sha256hex(s.state),
    player: { name: profile.data.name || 'Wanderer' },
  };
  if (chain) proof.chain = chain; // continuity: this run's place in the player's chain (signed with the rest)
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
  const run = E.run, s = snapshotRun(), after = assetState(profile.data); // both exactly at the run's end
  E.run = null; E.rec = null;
  try { localStorage.removeItem(UNSEALED_KEY); } catch (e) {} // this visit is sealed normally now
  if (!s || run.tainted || s.full) return; // not verifiable: the next visit starts from the chain's state again
  if (E.continueFrom) return; // built on a chain the ledger will not take any more: it could only be refused
  const proof = await chainRun(s, after);
  if (!proof || !worthKeeping(s.claims)) return;
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
let ledgerCache = null, ledgerFetch = null;
E.ledgerView = async (fresh) => {
  if (ledgerCache && !fresh && Date.now() - ledgerCache.t < 60000) return ledgerCache.v;
  if (ledgerFetch) return ledgerFetch; // one fetch at a time: the panel's parts all ask at once
  const get = async (f) => { try { const r = await fetch('ledger/' + f, { cache: 'no-cache' }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  ledgerFetch = Promise.all([get('boards.json'), get('rejected.json')]).then(([boards, rejected]) => {
    ledgerCache = { t: Date.now(), v: { boards, rejected: rejected ? rejected.list : [] } };
    return ledgerCache.v;
  }).finally(() => { ledgerFetch = null; });
  return ledgerFetch;
};
// Verify a proof here, on this client's own engine. A proof from another engine version replays on the verifier page
// (verify.html), which loads the exact engine it names: loading a second engine into a running game is not safe.
let engineNames = null;
E.verify = async (proof, onProgress) => {
  const sim = proof && proof.sim;
  if (sim !== ENGINE && !/^[0-9a-f]{64}$/.test(sim || '')) { // a legacy name ("sim-1"): which engine stands for it?
    if (!engineNames) engineNames = fetch('engines/history.json', { cache: 'no-cache' }).then((r) => r.json()).then((h) => h.legacy || {}).catch(() => ({}));
    if ((await engineNames)[sim] !== ENGINE) return { ok: false, reason: `Played on an older engine ("${String(sim).slice(0, 12)}"). Open verify.html to replay it on that exact engine.` };
  } else if (sim !== ENGINE) return { ok: false, reason: `Played on engine ${String(sim).slice(0, 8)}; this game runs ${ENGINE.slice(0, 8)}. Open verify.html to replay it on that exact engine.` };
  return replayRun(proof, { loadModule: loadByHash, progress: onProgress ? async (f) => { onProgress(f); await new Promise((r) => setTimeout(r, 0)); } : null });
};

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
  if (E.world) {
    E.world.dispose();
    // what the world's dispose() leaves on the GPU: its signs' canvas textures and its own materials (freeworld.js)
    try { freeWorld(E.world.group, { shared: [...allMaterials()], scene: E.render.scene }); } catch (e) { console.warn('[free]', e.message); }
  }
  E.net.leave();
  E.ui.prompt(null);
  if (mod.kind === 'level') registerWorldItems(entry, mod); // a level's reward item (before the run pins it)
  startRun(entry, opts.from, opts.arrival);
  const { sp, err } = await E.enterWorld(entry, mod, opts.from || null, { arrival: opts.arrival || null });
  // a world that failed to build fails the same way in its replay: don't send that visit to be checked and refused
  if (err) { console.error(`[${id}] build failed`, err); E.toast(`${entry.name} failed to build: ${err.message}`, 'bad'); taint('the world failed to build'); E.count.event('error/build/' + (countKnown.world(id) ? id : 'community')); }
  else E.count.event('world/' + (countKnown.world(id) ? id : 'community'), countKnown.world(id) ? entry.name : '');
  input.setScheme(mod.controls);
  E.camRig.shot = null;
  E.powerView.reset();
  E.camRig.setMode(mod.camera || null);
  if (!mod.camera) { E.camRig.snap(E.player); E.camRig.yaw = sp.yaw; E.camRig.pitch = 0.28; if (E.camRig.dist < 3 || E.camRig.dist > 16) E.camRig.dist = 7.5; }
  input.snapHeading(sp.yaw);
  document.body.classList.toggle('topdown', input.scheme === 'topdown');
  E.updateHint();
  E.lastQa = quantYaw(sp.yaw);
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
  if (profile.data.online && profile.data.created) E.net.join(id);
  E.ui.refreshHud();
  if (E.chainNotice) {
    const notes = {
      migrated: 'Welcome back! Saved progress starts now. Your earlier items are kept as keepsakes (items panel).',
      resumed: `Welcome back! Your saved progress is restored.`,
      'caught-up': 'You played on another device: your saved progress has been brought up to date.',
      refused: 'You continue from your last saved visit. From here on your visits are saved again.',
    };
    E.toast(notes[E.chainNotice] || 'Your progress was restored from your last save.', 'item');
    E.chainNotice = null;
  }
  await new Promise((r) => setTimeout(r, 0)); // let any async 'enter' handlers settle before the first tick
  E.traveling = false;
  await E.ui.fade(false);
  E.ui.banner(mod.name, mod.blurb || entry.blurb || '');
  E.weekly.arrive();
  // what you wear that sleeps here by the world's switches (no magic, no machines, no artifacts): once per world a session
  const R = E.world.rules, why = (d) => (!familyAllowed(d, R) ? FAMILIES[d.family].off : R.powers === false && powerOf(d) ? 'artifacts sleep here' : null);
  const asleep = Object.values(profile.data.eq).filter(Boolean).map((iid) => items.get(iid)).filter((d) => d && why(d));
  if (asleep.length && !(E.toldAsleep || (E.toldAsleep = new Set())).has(id)) {
    E.toldAsleep.add(id);
    setTimeout(() => E.toast(`${asleep.map((d) => d.name).join(', ')} ${asleep.length > 1 ? 'sleep' : 'sleeps'} in ${mod.name}: ${why(asleep[0])}.`), 1800);
  }
};
// leaving through the world list: recorded as an action so the run ends on a tick
E.leaveTo = (id) => { if (E.sim && E.world && !E.sim.ended && !E.traveling) E.queueAction(['travel', id]); else E.travel(id); };

E.toast = (t, k) => E.ui.toast(t, k);
let hudSoon = 0;
E.refreshHudSoon = () => { clearTimeout(hudSoon); hudSoon = setTimeout(() => E.ui.refreshHud(), 30); };
E.applyQuality = () => {
  let q = profile.data.settings.quality;
  // Auto: this visit's own step-down, else where it settled on this device before (a slow phone then starts smooth
  // instead of stuttering for the seconds a step-down takes, on every visit), else High on computers, Medium on phones
  if (q === 'auto') q = E.autoQuality || profile.data.settings.autoQ || (isTouch() ? 'medium' : 'high');
  E.render.setQuality(q);
  if (E.fx) E.fx.setScale(E.render.renderer, E.camera);
};

// The Builder (builder.js, with model import) is its own file, loaded the first time it opens: most players never
// build a level. Until then this stand-in answers what the rest of the game asks of it (ui.js, the frame loop).
const BUILDER_DRAFTS = 'elsewhere_builder_v1'; // where builder.js keeps its drafts (STORE there)
function lazyBuilder() {
  let loading = null;
  const load = () => loading || (loading = import('./builder.js').then((m) => (E.builder = m.createBuilder(E)), (err) => {
    loading = null;
    console.error('[builder]', err);
    E.toast('The Builder could not load. If the game was just updated, reload the page.', 'bad');
    throw err;
  }));
  return {
    active: false, used: false, load,
    open: (opts) => load().then((B) => B.open(opts), () => false),
    // drafts cleared before a reload are listed at the Gate again; with no drafts there is nothing to load
    restoreCleared: () => {
      let drafts = null; try { drafts = localStorage.getItem(BUILDER_DRAFTS); } catch (e) {}
      return drafts ? load().then((B) => B.restoreCleared(), () => 0) : Promise.resolve(0);
    },
  };
}

// photo mode: a path-traced still of the current view (photo.js, its own file, loaded on first use). Visual only.
E.photo = async (opts = {}) => {
  if (E.photoBusy) return null;
  E.photoBusy = true;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:80;padding:10px 16px;border-radius:12px;background:rgba(8,10,26,.86);color:#fff;font:600 14px Inter,system-ui,sans-serif;text-align:center';
  box.textContent = 'Preparing the path tracer…';
  document.body.append(box);
  try {
    const m = await import(new URL('photo.js', location.href).href); // not bundled: a separate file
    const r = await m.takePhoto(E, Object.assign({ onProgress: (n, of) => { box.textContent = `Path tracing… ${Math.floor(n)} / ${of} samples`; } }, opts));
    if (opts.keepOverlay === false) { box.remove(); return r; }
    box.textContent = '';
    const img = new Image(); img.src = r.dataUrl; img.alt = 'Path-traced photo';
    img.style.cssText = 'display:block;max-width:min(82vw,1280px);max-height:72vh;border-radius:8px;margin:0 auto 8px';
    const save = document.createElement('a'); save.href = r.dataUrl; save.download = `elsewhere-${E.world ? E.world.id : 'photo'}.png`; save.textContent = 'Save image'; save.className = 'btn primary';
    const close = document.createElement('button'); close.textContent = 'Close'; close.className = 'btn'; close.onclick = () => box.remove();
    const note = document.createElement('div'); note.style.cssText = 'opacity:.7;font-weight:500;font-size:12px;margin-top:6px';
    note.textContent = `${r.samples} samples, ${(r.ms / 1000).toFixed(1)} s (scene build ${(r.buildMs / 1000).toFixed(1)} s)`;
    const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;justify-content:center'; row.append(save, close);
    box.append(img, row, note);
    return r;
  } catch (err) {
    console.error('photo', err);
    box.textContent = 'The photo failed: ' + err.message; setTimeout(() => box.remove(), 5000);
    return null;
  } finally { E.photoBusy = false; }
};

// debug + test hooks (anything that changes the game outside the tick marks the visit unverifiable)
E.debug = {
  tp(x, y, z) { taint('debug teleport'); E.player.place(new THREE.Vector3(x, y, z)); E.camRig.snap(E.player); },
  state() { const p = E.player; return { world: E.world && E.world.id, tick: E.sim && E.sim.tick, pos: [p.pos.x, p.pos.y, p.pos.z].map((v) => +v.toFixed(2)), grounded: p.grounded, board: p.board, abil: p.abil, coins: profile.data.coins, inv: profile.data.inv, peers: E.net.peers.size, run: E.run ? { tainted: E.run.tainted, ticks: E.rec ? E.rec.n : 0, claims: E.sim.claims.length } : null }; },
  give(id) { taint('debug give'); return E.giveItem(id); },
};

// input.js scales and inverts every look delta for its device (the Controls settings), so the camera rig, which
// would scale them again by settings.sens, gets a neutral copy
const RIG_SETTINGS = Object.freeze({ sens: 1, invertY: false });
// the records a visit posts, as they happen (the weekly challenge's medals; UI only, the run is not touched)
let claimSim = null, claimsSeen = 0;
function watchClaims() {
  const sim = E.sim;
  if (sim !== claimSim) { claimSim = sim; claimsSeen = 0; }
  if (!sim || sim.claims.length <= claimsSeen) return;
  for (let i = claimsSeen; i < sim.claims.length; i++) {
    const c = sim.claims[i];
    if (c[1] === 'record' && E.world) try { E.weekly.onRecord(E.world.id, c[2], c[3], c[0]); } catch (e) { console.warn('[weekly]', e); }
    try { E.count.claim(c, E.world && E.world.id, countKnown); } catch (e) {}
  }
  claimsSeen = sim.claims.length;
}
let last = 0, acc = 0, fpsT = 0, fpsN = 0, fpsChecks = 0, meterT = 0, meterN = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const raw = (now - (last || now)) / 1000, dt = Math.min(0.1, raw); last = now;
  // the frame rate, when the player asked to see it (Graphics settings)
  if (profile.data.settings.fps) {
    meterT += raw; meterN++;
    if (meterT >= 0.5) { const m = document.getElementById('fps'); if (m) m.textContent = `${Math.round(meterN / meterT)} fps`; meterT = 0; meterN = 0; }
  }
  input.poll(dt);
  // a run that ended last frame leaves now: its continuations have run, exactly as a replay waits for them
  if (E.sim && E.sim.ended && !E.sim.ended.external && !E.traveling && E.world) E.travel(E.sim.ended.to, { from: E.world.id, arrival: E.sim.ended.arrival || null });
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
    E.powerView.frame(dt, now / 1000);
    rt.frame(dt, now / 1000, alpha);
    audio.wind(pl.gliding ? 0.55 : clamp((-pl.vel.y - 14) / 30, 0, 0.8));
    audio.hum(pl.board ? 1 : 0, Math.abs(pl.boardSpeed));
  } else { input.take('use'); input.take('jump'); input.take('board'); input.take('pow'); }
  watchClaims();
  E.count.frame(raw, live && !E.attract, countDevice);
  E.weekly.tick();
  if (E.camRig.shot && E.camRig.shot.on && E.sim && !E.sim.busy && (input.keyMove || input.turnKeys || Math.hypot(input.stick.x, input.stick.y) > 0.3)) E.camRig.hold(null);
  if (building) E.builder.frame(dt); else { E.camRig.update(dt, pl, input, live ? rt.P : null, RIG_SETTINGS); applyView(E); }
  if (E.attract) attractCamera(dt);
  E.wardrobe.frame(dt); // the wardrobe's view of you (after the rig, like the title's camera)
  E.render.follow(building ? E.builder.focus : pl.renderPos);
  E.ui.frame();
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
      if (fps < 38 && fpsChecks > 1 && q !== 'low') {
        E.autoQuality = q === 'high' ? 'medium' : 'low';
        profile.data.settings.autoQ = E.autoQuality; profile.save(); // remembered: the next visit starts here
        E.applyQuality(); E.toast(`Graphics set to ${E.autoQuality} for a smoother frame rate.`);
      }
    }
  }
}

// The title's camera (a first visit): a slow orbit high over the world while the title is up, then a glide down to
// the usual place behind the player. Presentation only. It runs after the rig has placed the camera, and blends from
// the orbit to the rig's pose, so the hand-over is seamless.
const _from = new THREE.Vector3(), _look = new THREE.Vector3(), _to = new THREE.Vector3(), _toLook = new THREE.Vector3();
function attractCamera(dt) {
  const a = E.attract, cam = E.camera, p = E.player.renderPos;
  a.t += dt;
  const ang = a.a0 + a.t * 0.07, cx = p.x * 0.5, cz = p.z * 0.5;
  _from.set(cx + Math.sin(ang) * 40, p.y + 17, cz + Math.cos(ang) * 40); _look.set(cx, p.y + 3, cz);
  if (a.leaving) a.k = Math.min(1, a.k + dt / 1.8);
  const e = a.k * a.k * (3 - 2 * a.k);
  _to.copy(cam.position); _toLook.copy(E.camRig.target);
  cam.position.lerpVectors(_from, _to, e); cam.lookAt(_look.lerp(_toLook, e));
  if (a.k >= 1) { E.attract = null; if (a.done) a.done(); }
}

async function boot() {
  const canvas = document.getElementById('view');
  profile.load();
  loadRuns();
  E.profile = profile;
  input.init(canvas);
  applySettings(E); // sound, camera speeds and hints, before anything plays
  E.ui = createUI(E);
  E.wardrobe = createWardrobe(E, E.ui); // your look (presentation only; opened as the 'wardrobe' panel)
  E.weekly = createWeekly(E);
  // the line of key hints at the bottom of the screen: in the words of whatever the player last used (keys or pad),
  // for this world's scheme, with key names from their keyboard layout
  E.updateHint = () => { const h = document.getElementById('hint'); if (h) h.textContent = hintLine(input.device, input.scheme, input.padKind); };
  input.onDevice = () => E.updateHint();
  loadLayout().then((ok) => { if (ok) E.updateHint(); });
  E.ui.loading('Starting physics…');
  // While the physics engine downloads (the page preloads it), fetch what boot needs next instead of after it: the
  // world registry, the title's font, and the first world's module.
  const registryP = fetch('worlds/registry.json', { cache: 'no-cache' }).then((r) => r.json());
  registryP.then((reg) => {
    if (reloadIfBehind(reg)) return;
    const want = (location.hash || '').replace('#', '');
    if (!/^lv-/.test(want)) prefetchModule(reg.worlds.find((w) => w.id === want) || reg.worlds.find((w) => w.id === 'hub'));
  }, () => {});
  const fontP = document.fonts ? document.fonts.load('600 40px "Fredoka"').catch(() => {}) : Promise.resolve();
  await initPhysics();
  E.render = installUltra(createRender(canvas)); // + the ultra preset (gfx.js)
  E.scene = E.render.scene; E.camera = E.render.camera;
  E.fx = new FX(E.scene);
  E.assets = createAssets(E.render.renderer);
  const assetsReady = E.assets.init();
  E.characters = createCharacters(); // bodies players can wear (presentation only)
  E.blobs = createBlobs(); // uploaded models: kept in this browser and on the public relays, named by their SHA-256
  setCharacterLibrary(E.characters);
  setLookKit(lookKit); // every avatar's look: body styles, faces, outfits (looks.js; replays have none and draw nothing)
  // theme.sky: a photographed sky from the asset library lights the world (and becomes its backdrop
  // unless theme.skyBackdrop is false). Worlds without one keep the painted sky, which also becomes what shiny
  // things reflect (theme.envIntensity, default 0.3: a sheen, while the hemisphere light does the ambient work)
  E.applySky = (theme) => {
    const S = E.scene, sky = E.render.sky;
    S.environment = null; S.background = null; sky.mesh.visible = true;
    E.wantSky = theme.sky || null;
    if (!theme.sky) {
      try { S.environment = E.render.paintedEnv(); S.environmentIntensity = theme.envIntensity == null ? 0.3 : theme.envIntensity; } catch (err) { console.warn('painted sky', err.message); }
      return;
    }
    const want = theme.sky;
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
  E.applyQuality();
  const onResize = () => { E.render.resize(); E.fx.setScale(E.render.renderer, E.camera); };
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(canvas);
  E.ui.loading('Reading the world registry…');
  E.registry = await registryP;
  if (E.updating || reloadIfBehind(E.registry)) { E.ui.loading('Updating to the new version…'); await new Promise(() => {}); } // reloading: start nothing
  if (behind(E.registry)) setTimeout(() => E.toast('Elsewhere was just updated. If a world looks wrong, reload the page in a minute.', 'bad'), 4000);
  for (const w of E.registry.worlds) for (const [id, def] of Object.entries(w.items || {})) items.register(id, def, w.id);
  E.loadCommunity();
  const hadKey = !!(profile.data.key && profile.data.key.pub);
  await ensureKey(profile); // the chain is this key's
  if (!loadChain()) await settleChain(!hadKey && !!(profile.data.key && profile.data.key.pub));
  setTimeout(() => E.checkLedger(), 20000); setInterval(() => E.checkLedger(), 300000);
  // a visit left open when the page closed: seal it into the chain now (if the chain has not moved on since)
  try {
    const u = JSON.parse(localStorage.getItem(UNSEALED_KEY) || 'null');
    localStorage.removeItem(UNSEALED_KEY);
    if (u && u.s && u.seq === E.chain.seq && (u.head === undefined || u.head === E.chain.head) && (u.key === undefined || u.key === E.chain.key)) { const p = await chainRun(u.s, u.after); if (p && worthKeeping(p.claims)) { E.runs.unshift({ proof: p, world: p.world.id, summary: summarize(p.claims) }); saveRuns(); } if (p) Object.assign(profile.data, JSON.parse(JSON.stringify(u.after))); }
  } catch (e) { console.warn('[chain] could not seal the last visit:', e.message); }
  setInterval(pumpOutbox, 60000); window.addEventListener('online', () => pumpOutbox());
  E.player = new Player(E, profile.data);
  { const L = currentLook(); E.player.avatar.setLook(L, legacyColors(L)); } // the wardrobe's look
  E.scene.add(E.player.avatar.root);
  E.powerView = createPowerView(E); // what artifacts' powers look like (presentation only)
  E.camRig = new CameraRig(E.camera);
  // camera shake can be switched off (Graphics settings); the worlds and the engine shake through this
  const shake = E.camRig.shake.bind(E.camRig);
  E.camRig.shake = (t) => { if (profile.data.settings.shake !== false) shake(t); };
  E.net = createNet(E);
  E.net.enabled = !!profile.data.online;
  // voice chat: a ring over a player's head pulses while they speak
  E.makeVoiceRing = (av) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 8, 28), new THREE.MeshBasicMaterial({ color: '#7cf6ff', toneMapped: false })); m.geometry.userData.keep = false; m.position.y = 1.64; m.rotation.x = Math.PI / 2; m.visible = false; av.upper.add(m); return m; };
  E.voice = createVoice(E);
  E.voice.init();
  E.builder = lazyBuilder(); // the level editor: UI only, loaded the first time it is opened at the Creator's Gate
  // closing the page mid-visit: keep the visit as it stands (synchronously), and seal it on the next load. Not every
  // browser runs a handler while a tab closes, so the snapshot is also refreshed every few seconds and when hidden.
  E.keepVisit = () => {
    const s = snapshotRun();
    if (!s || !E.run || E.run.tainted || s.full || s.n < 1) return;
    const run = Object.assign({}, s.run, { pins: undefined });
    // sim: the engine that played it, which the proof names when the next load seals it, even if that load runs a
    // newer engine (an update in between, or an earlier game reloading itself first): only that engine replays it
    try { localStorage.setItem(UNSEALED_KEY, JSON.stringify({ s: Object.assign({}, s, { run, sim: ENGINE }), after: assetState(profile.data), seq: E.chain.seq, head: E.chain.head, key: E.chain.key })); } catch (e) {}
  };
  window.addEventListener('pagehide', E.keepVisit);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') E.keepVisit(); });
  // a tab in the background goes quiet, unless the player asked for sound there (voices carry on either way)
  document.addEventListener('visibilitychange', () => audio.setBackground(document.visibilityState === 'hidden'));
  setInterval(() => { if (E.run && !E.traveling) E.keepVisit(); }, 5000);
  try { await Promise.race([fontP, new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  E.ui.loading('Opening a portal…');
  const want = (location.hash || '').replace('#', '');
  if (/^lv-/.test(want)) await Promise.race([E.loadCommunity(), new Promise((r) => setTimeout(r, 3000))]);
  const start = findWorld(want) ? want : 'hub';
  // creator items you own: register them (and so pin their levels) before the first visit begins
  const owned = Object.keys(profile.data.inv), late = E.loadItemWorlds(owned).catch(() => 0);
  await Promise.race([late, new Promise((r) => setTimeout(r, 4000))]);
  late.then(() => { for (const s of SLOTS) E.player.avatar.equip(s, profile.data.eq[s] && items.get(profile.data.eq[s]) ? profile.data.eq[s] : null); });
  E.count.visit(); // (the page view first, then the world it opens in)
  await E.travel(start, { first: true });
  const first = !profile.data.created;
  if (first) { E.attract = { t: 0, a0: Math.atan2(E.player.pos.x, E.player.pos.z) + 0.9, k: 0, leaving: false }; document.body.classList.add('titling'); }
  E.ui.hideLoading();
  if (first) { E.count.event('title'); E.count.remember(); } else E.count.back();
  requestAnimationFrame(loop);
  watchFocus(E.embedded, document.getElementById('focus-hint'));
  if (!E.canSave && !first) E.ui.toast(E.embedded.framed
    ? `This browser is not letting the game save inside ${E.embedded.host}'s page (a private window, or blocked site data). You can play, but nothing is kept when the tab closes. Menu, then You, has a link to the game's own page.`
    : 'This browser is not letting the game save (a private window, or blocked site data). You can play, but nothing is kept when the tab closes.', 'bad', 12000);
  const unlock = () => { audio.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
  if (first) {
    // a first visit: the title over the live world (the camera circles it), then down to the player, and the world
    // says hello
    await E.ui.titleCard();
    E.count.event('start/new');
    E.camRig.yaw = E.player.yaw; E.camRig.dist = 7.5; E.camRig.pitch = 0.28;
    await new Promise((r) => { if (!E.attract) return r(); E.attract.done = r; E.attract.leaving = true; });
    E.queueAction(['event', 'firstVisit']);
  }
  E.ui.refreshHud();
  ensureKey(profile);
}

boot().catch((err) => {
  console.error(err);
  try { E.count.event('error/boot'); } catch (e) {}
  const m = document.getElementById('load-msg');
  if (m) m.textContent = 'Something went wrong starting Elsewhere: ' + err.message + '. Try a recent Chrome, Edge, Firefox or Safari.';
});
