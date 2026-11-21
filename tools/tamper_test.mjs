// Tamper test: every kind of edit to a valid proof must be caught.
// Usage: node tools/tamper_test.mjs proof.json   (exit 1 if any tampered copy still verifies)
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { decodeInput, encodeInput } from '../src/engine/run.js';

const base = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'ew-tamper-'));
const reencode = (p, f) => { const c = decodeInput(p.input); f(c); p.input = encodeInput({ qx: c.qx, qy: c.qy, qa: c.qa, bits: c.bits, n: c.n }); return p; };
const mid = Math.floor(base.ticks / 2);
const cases = {
  'one input frame (stick nudged by 1/127)': (p) => reencode(p, (c) => { c.qx[mid] = c.qx[mid] === 127 ? 126 : c.qx[mid] + 1; }),
  'one jump press added': (p) => reencode(p, (c) => { c.bits[mid] |= 1; }),
  'camera yaw nudged at one tick': (p) => reencode(p, (c) => { c.qa[mid] = (c.qa[mid] + 1) & 0xffff; c.qx[mid] = c.qx[mid] || 127; }),
  'a claim added': (p) => { p.claims.push([p.ticks - 1, 'give', 'crown']); return p; },
  'more coins at entry': (p) => { p.entry.coins += 1; return p; },
  'state hash edited': (p) => { p.state = (p.state[0] === 'a' ? 'b' : 'a') + p.state.slice(1); return p; },
  'world pinned to another hash': (p) => { p.world.sha256 = 'f'.repeat(64); return p; },
  'player name changed after signing': (p) => { p.player.name = 'Somebody else'; return p; },
  'last tick dropped': (p) => reencode(Object.assign(p, { ticks: p.ticks - 1 }), (c) => { c.n -= 1; }),
};
let fails = 0;
for (const [name, f] of Object.entries(cases)) {
  const p = f(JSON.parse(JSON.stringify(base)));
  const file = join(dir, 'p.json'); writeFileSync(file, JSON.stringify(p));
  let out = '', valid = false;
  try { out = execFileSync('node', [new URL('./verify.mjs', import.meta.url).pathname, file], { encoding: 'utf8' }); valid = true; } catch (e) { out = e.stdout || String(e); }
  const why = (out.split('\n').find((l) => l.startsWith('        ')) || '').trim();
  console.log(`${valid ? 'MISSED ' : 'caught '} ${name}${valid ? '' : ': ' + why.slice(0, 150)}`);
  if (valid) fails++;
}
console.log(fails ? `${fails} tampered proofs passed` : 'every tampered proof was rejected');
process.exit(fails ? 1 : 0);
