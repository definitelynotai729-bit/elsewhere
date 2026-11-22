// The standalone verifier page: drop in any proof of play and watch it replay. No WebGL needed.
// The page holds no engine of its own: each proof replays on the exact engine it names (its sim), loaded from the
// archive (engines/by-hash) and checked against its hash, with the exact world code it pins.
import { sha256hex, fmtTime } from '../engine/util.js';

const texts = new Map();
async function loadModule(r) {
  let text = texts.get(r.sha256);
  if (!text) {
    const res = await fetch(`worlds/by-hash/${r.sha256}.js`, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`no module ${r.sha256.slice(0, 12)}… (world "${r.id}") in the archive`);
    text = await res.text();
    if ((await sha256hex(text)) !== r.sha256) throw new Error('archived module does not match its hash');
    texts.set(r.sha256, text);
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
  try { return (await import(/* @vite-ignore */ url)).default; } finally { URL.revokeObjectURL(url); }
}
let history = null;
const engines = new Map();
const hex64 = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);
async function engineFor(proof) {
  if (!history) history = fetch('engines/history.json', { cache: 'no-cache' }).then((r) => r.json());
  const h = await history, sim = proof && proof.sim;
  const id = hex64(sim) ? sim : (h.legacy || {})[sim]; // a name from before engines were pinned ("sim-1")
  if (!id) throw new Error(`played on an unknown engine ("${String(sim).slice(0, 16)}")`);
  if (!engines.has(id)) {
    engines.set(id, (async () => {
      const res = await fetch(`engines/by-hash/${id}.js`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`engine ${id.slice(0, 12)}… is not in the archive`);
      const text = await res.text();
      if ((await sha256hex(text)) !== id) throw new Error(`archived engine ${id.slice(0, 12)}… does not match its hash`);
      for (const m of text.matchAll(/\.\.\/vendor\/([a-z0-9]+-([0-9a-f]{16})\.js)/g)) { // its three.js and Rapier, by hash too
        const v = await fetch(`engines/vendor/${m[1]}`, { cache: 'force-cache' });
        if (!v.ok || (await sha256hex(await v.text())).slice(0, 16) !== m[2]) throw new Error(`vendor module ${m[1]} is missing or altered`);
      }
      const mod = await import(/* @vite-ignore */ new URL(`engines/by-hash/${id}.js`, location.href).href);
      if (mod.API !== 1 || typeof mod.replayRun !== 'function') throw new Error(`engine ${id.slice(0, 12)}… has an interface this page does not know`);
      return mod;
    })());
    engines.get(id).catch(() => engines.delete(id));
  }
  return { id, mod: await engines.get(id) };
}
// one replay at a time: each engine puts its own deterministic Math in place before it replays
let queue = Promise.resolve();
const verify = (proof, progress) => {
  const job = queue.then(async () => {
    let e;
    try { e = await engineFor(proof); } catch (err) { return { ok: false, reason: err.message.charAt(0).toUpperCase() + err.message.slice(1) + '.' }; }
    return Object.assign(await e.mod.replayRun(proof, { loadModule, progress }), { engine: e.id });
  });
  queue = job.catch(() => {});
  return job;
};
window.EWV = { verify };

const $ = (s) => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
async function check(text, label) {
  const card = el('div', 'res'), head = el('div', 'h', label), body = el('div', 'b', 'Replaying…');
  card.append(head, body); $('#results').prepend(card);
  let proof;
  try { proof = JSON.parse(text); } catch (e) { card.classList.add('bad'); body.textContent = 'That is not JSON.'; return; }
  const r = await verify(proof, async (f) => { body.textContent = `Replaying… ${Math.round(f * 100)}%`; await new Promise((x) => setTimeout(x, 0)); });
  card.classList.add(r.ok ? 'ok' : 'bad');
  if (!r.ok) { body.textContent = '✗ Not verified. ' + r.reason; return; }
  const s = r.summary, bits = [];
  for (const x of s.records) bits.push(`${x.key} ${x.better === 'higher' ? x.value : fmtTime(x.value)}`);
  if (s.items.length) bits.push('items: ' + s.items.join(', '));
  if (s.coins) bits.push(`${s.coins > 0 ? '+' : ''}${s.coins} coins`);
  head.textContent = `${label} · ${proof.world.id} · ${proof.player && proof.player.name ? proof.player.name : 'unknown player'}`;
  body.textContent = `✓ Verified. Replayed ${r.ticks.toLocaleString()} ticks (${fmtTime(r.seconds)} of play) in ${(r.ms / 1000).toFixed(2)} s on the engine it names (${r.engine.slice(0, 10)}…) with the pinned world code (${proof.world.sha256.slice(0, 10)}…) and got the identical final state. ${bits.join(' · ') || 'No claims.'} Signature: ${r.sigStatus}.`;
}
$('#go').onclick = () => { const t = $('#paste').value.trim(); if (t) check(t, 'Pasted proof'); };
$('#file').onchange = async (e) => { for (const f of e.target.files) check(await f.text(), f.name); };
const drop = $('#drop');
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
drop.ondragleave = () => drop.classList.remove('over');
drop.ondrop = async (e) => { e.preventDefault(); drop.classList.remove('over'); for (const f of e.dataTransfer.files) check(await f.text(), f.name); };
fetch('engines/history.json', { cache: 'no-cache' }).then((r) => r.json()).then((h) => {
  const cur = h.engines.find((v) => v.until == null);
  $('#sim').textContent = `${cur ? cur.sha256.slice(0, 12) + '…' : '?'} (${h.engines.length} archived)`;
}).catch(() => {});
