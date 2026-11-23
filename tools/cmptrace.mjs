// The other half of tools/tickdiff.py: replay its proof.json tick by tick and report the first tick where the player
// differs from its live trace.json, with the inputs and frame numbers around it.
// usage: node tools/cmptrace.mjs <dir> [--modules <dir with unpublished test modules>]
import { readFileSync } from 'node:fs';
import { install } from '../src/engine/detmath.js';
import { bootHeadless } from '../src/engine/headless.js';
import { decodeInput, frameFromCodes } from '../src/engine/run.js';
import { loadByHash } from './verify.mjs';
install();
const dir = process.argv[2];
const proof = JSON.parse(readFileSync(dir + '/proof.json', 'utf8')), live = JSON.parse(readFileSync(dir + '/trace.json', 'utf8'));
const input = decodeInput(proof.input);
const boot = await bootHeadless(proof, { loadModule: loadByHash }, { replaying: true });
if (boot.error) throw new Error(boot.error);
const E = boot.E;
const script = new Map(); for (const a of proof.events) { if (!script.has(a[0])) script.set(a[0], []); script.get(a[0]).push(a.slice(1)); }
E.sim.script = script;
const y = () => new Promise((r) => setImmediate(r));
await y();
const L = new Map(live.map((r) => [r[0], r]));
let first = null;
for (let t = 0; t < proof.ticks; t++) {
  const f = frameFromCodes(input.qx[t], input.qy[t], input.qa[t], input.bits[t]);
  const flush = E.tick(f);
  if (flush) await y();
  const p = E.player, mine = [p.pos.x, p.pos.y, p.pos.z, p.vel.x, p.vel.y, p.vel.z, p.grounded];
  const l = L.get(E.sim.tick);
  if (!l) continue;
  const theirs = l.slice(2, 9);
  if (first === null && JSON.stringify(mine) !== JSON.stringify(theirs)) {
    first = t;
    console.log('first difference after tick', t, '(sim.tick', E.sim.tick, ') live frame #', l[1]);
    console.log('  replay', mine.join(', ')); console.log('  live  ', theirs.join(', '));
    console.log('  input q replay', f.q.join(','), ' live', JSON.stringify(l[9]));
    for (let k = Math.max(0, t - 4); k <= t; k++) { const r = L.get(k + 1); console.log('   live tick', k + 1, 'frame', r && r[1], 'pos', r && r.slice(2, 5).map((v) => v.toFixed(6)).join(','), 'q', r && JSON.stringify(r[9])); }
  }
}
if (first === null) console.log('no difference in', proof.ticks, 'ticks');
