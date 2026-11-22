// Determinism battery, part 1: generate proofs of play from random input, headlessly in Node (V8).
// Usage: node tools/battery.mjs [--runs 50] [--ticks 1200] [--out proofs/battery] [--seed 1]
// Each run enters a world with a random loadout and plays seeded random input: stick directions and
// magnitudes, camera sweeps, jumps (taps and holds), board toggles, use presses, and dialogs answered
// after random delays. tools/battery.py then replays every proof in Chromium, WebKit and Firefox.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { SIM, FORMAT, RunLog, frameFromCodes, encodeInput, stateString } from '../src/engine/run.js';
import { rng } from '../src/engine/util.js';
const ENGINE = await sourceEngine(); // proofs made from src name the engine src builds to (archived by tools/build.mjs)

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const RUNS = +opt('--runs', 50), TICKS = +opt('--ticks', 1200), OUT = opt('--out', join(root, 'proofs/battery')), SEED = +opt('--seed', 1);
const docs = join(root, 'docs');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
let nonce = 0;
const loadModule = async (r) => {
  const text = readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== r.sha256) throw new Error('hash mismatch');
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// battery ${nonce++}\n`).toString('base64'))).default;
};
const yieldNow = () => new Promise((r) => setImmediate(r));
mkdirSync(OUT, { recursive: true });

const LOADOUTS = [
  { inv: {}, eq: {} },
  { inv: { glider: 1 }, eq: { back: 'glider' } },
  { inv: { glider: 1, hoverboard: 1, lantern: 1 }, eq: { back: 'glider', board: 'hoverboard', hand: 'lantern' } },
  { inv: { springboots: 1, hoverboard: 1, cap: 1 }, eq: { feet: 'springboots', board: 'hoverboard', head: 'cap' } },
  { inv: { glider: 1, springboots: 1, lantern: 1, hoverboard: 1, 'sigil-sky': 1, 'sigil-deep': 1, 'sigil-speed': 1 }, eq: { back: 'glider', feet: 'springboots', hand: 'lantern', board: 'hoverboard' } },
];
const worlds = registry.map((r) => r.id);
let made = 0;
for (let k = 0; k < RUNS; k++) {
  const R = rng(SEED * 100003 + k * 7919);
  const wid = worlds[k % worlds.length];
  const lo = LOADOUTS[R.int(0, LOADOUTS.length - 1)];
  const others = worlds.filter((x) => x !== wid);
  const from = R() < 0.5 ? null : R.pick(others);
  const entry = { coins: R.int(0, 120), inv: lo.inv, eq: Object.assign({ head: null, back: null, hand: null, feet: null, board: null }, lo.eq), flags: R() < 0.5 ? { 'met.wren': true } : {}, save: null };
  const spec = { registry, world: registry.find((r) => r.id === wid), from, entry };
  const open = []; // dialogs waiting for an answer
  let shop = null, cab = null;
  const ui = {
    dialog: () => new Promise((r) => open.push({ r, kind: 'say', at: R.int(20, 200) })),
    choice: (n, t, opts) => new Promise((r) => open.push({ r, kind: 'ask', n: opts.length, at: R.int(20, 200) })),
    shop: (title, listing) => { shop = { listing, at: R.int(10, 90) }; },
    cabinet: (url, title, onMessage) => { if (onMessage) cab = { onMessage, at: R.int(30, 300) }; },
  };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false, ui });
  if (error) { console.error(wid, error); process.exit(1); }
  E.rec = new RunLog();
  // seeded play: wandering segments, and seeking segments that walk to something interesting
  const rt = E.world, P = E.player, STEP = Math.PI * 2 / 65536;
  const targets = () => [...rt.interactables.map((i) => [i.pos.x, i.pos.z, 'use']), ...rt.coins.filter((c) => c.mesh.visible).map((c) => [c.mesh.position.x, c.mesh.position.z, 'go']), ...rt.pickups.filter((k) => k.group.visible).map((k) => [k.group.position.x, k.group.position.z, 'go']), ...(rt.foes || []).filter((f) => f.alive).map((f) => [f.x, f.z, 'fight'])];
  let seg = 0, qx = 0, qy = 0, qa = R.int(0, 65535), held = false, dqa = 0, seek = null;
  for (let t = 0; t < TICKS && !E.sim.ended; t++) {
    if (--seg <= 0) {
      seg = R.int(8, 70); seek = null;
      const ts = targets();
      if (ts.length && R() < 0.45) { // pick one of the nearest few things and walk to it
        ts.sort((a, b) => Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z) - Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z));
        seek = ts[R.int(0, Math.min(3, ts.length - 1))]; seg = R.int(90, 300);
      }
      const a = R.range(0, Math.PI * 2), m = R() < 0.15 ? 0 : R() < 0.6 ? 1 : R.range(0.2, 1);
      qx = Math.round(Math.sin(a) * m * 127) | 0; qy = Math.round(Math.cos(a) * m * 127) | 0;
      dqa = R() < 0.5 ? 0 : R.int(-400, 400);
      held = R() < 0.35;
    }
    let bits = 0;
    if (seek && !P.board) {
      const dx = seek[0] - P.pos.x, dz = seek[1] - P.pos.z, d = Math.hypot(dx, dz);
      let a = Math.atan2(dx, dz) - qa * STEP; a = Math.atan2(Math.sin(a), Math.cos(a));
      const m = d < 1.8 ? 0 : 1;
      qx = Math.round(-Math.sin(a) * m * 127) | 0; qy = Math.round(Math.cos(a) * m * 127) | 0; dqa = 0;
      if (seek[2] === 'use' && d < 2.6 && R() < 0.08) bits |= 8;
      if (seek[2] === 'fight' && d < 2.8 && R() < 0.15) bits |= 512; // strike (enemies.js)
      if (R() < 0.01) bits |= 1;
    } else {
      qa = (qa + dqa + 65536) & 0xffff;
      if (R() < 0.04) bits |= 1;
      if (R() < 0.006) bits |= 4;
      if (R() < 0.02) bits |= 8;
      if (R() < 0.01) bits |= 512;
    }
    if (held) bits |= 2;
    for (const d of open.slice()) if (--d.at <= 0) { open.splice(open.indexOf(d), 1); d.r(d.kind === 'ask' ? R.int(-1, d.n - 1) : undefined); }
    // panel actions a player might take: buy from an open shop, change equipment, an arcade result
    if (shop && --shop.at <= 0) { E.queueAction(['buy', R.pick(shop.listing).item]); shop = R() < 0.5 ? null : { listing: shop.listing, at: R.int(10, 60) }; }
    if (cab && --cab.at <= 0) { E.queueAction(['cab', 0, { source: 'siegeworks', type: 'result', fort: R.pick(['F1', 'F2', 'P3']), stars: R.int(0, 3), outcome: 'breached', shots: R.int(1, 5) }]); cab = null; }
    if (R() < 0.003) { const own = Object.keys(E.profile.data.inv).filter((id) => E.items.get(id) && E.items.get(id).slot); if (own.length) { const id = R.pick(own); E.queueAction(R() < 0.7 ? ['equip', id, E.items.get(id).slot] : ['equip', null, E.items.get(id).slot]); } }
    const flush = E.tick(frameFromCodes(qx, qy, qa, bits));
    if (flush) await yieldNow();
  }
  if (E.sim.ended) { await yieldNow(); E.leaveWorld(); }
  const sim = E.sim, n = E.rec.n;
  const proof = {
    format: FORMAT, sim: ENGINE, engine: 'battery', world: spec.world, registry, from, entry: JSON.parse(JSON.stringify(entry)),
    started: '2026-01-01T00:00:00.000Z', ticks: n, input: encodeInput(E.rec, n), events: E.rec.events.slice(), claims: sim.claims.map((c) => c.slice()),
    end: sim.ended ? { tick: sim.ended.tick, to: sim.ended.to } : null,
    state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'battery' },
  };
  E.world.dispose();
  writeFileSync(join(OUT, `b${String(k).padStart(3, '0')}-${wid}.json`), JSON.stringify(proof));
  made++;
  if (k % 10 === 0) console.log(`run ${k}: ${wid} from ${from || 'spawn'}, ${n} ticks, ${proof.events.length} events, ${proof.claims.length} claims${proof.end ? ', left for ' + proof.end.to : ''}`);
}
console.log(`${made} proofs in ${OUT}`);
