// The standalone verifier page: drop in any proof of play and watch it replay. No WebGL needed.
import { replayRun } from '../engine/headless.js';
import { summarize, SIM } from '../engine/run.js';
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
const verify = (proof, progress) => replayRun(proof, { loadModule, progress });
window.EWV = { verify, SIM };

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
  body.textContent = `✓ Verified. Replayed ${r.ticks.toLocaleString()} ticks (${fmtTime(r.seconds)} of play) in ${(r.ms / 1000).toFixed(2)} s with the pinned world code (${proof.world.sha256.slice(0, 10)}…) and got the identical final state. ${bits.join(' · ') || 'No claims.'} Signature: ${r.sigStatus}.`;
}
$('#go').onclick = () => { const t = $('#paste').value.trim(); if (t) check(t, 'Pasted proof'); };
$('#file').onchange = async (e) => { for (const f of e.target.files) check(await f.text(), f.name); };
const drop = $('#drop');
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
drop.ondragleave = () => drop.classList.remove('over');
drop.ondrop = async (e) => { e.preventDefault(); drop.classList.remove('over'); for (const f of e.dataTransfer.files) check(await f.text(), f.name); };
$('#sim').textContent = SIM;
