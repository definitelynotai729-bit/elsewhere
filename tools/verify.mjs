// Verify proofs of play by replaying them headlessly with the pinned world code.
// Usage: node tools/verify.mjs proof.json [more.json ...] [--docs <dir>] [--json]
// Exit code 0 only if every proof verifies. World modules are taken from <docs>/worlds/by-hash/, the
// content-addressed archive the build keeps, and run only if their SHA-256 matches the proof's pin.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { replayRun } from '../src/engine/headless.js';
import { summarize } from '../src/engine/run.js';
import { fmtTime } from '../src/engine/util.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const docs = opt('--docs', join(root, 'docs'));
const asJson = argv.includes('--json'); if (asJson) argv.splice(argv.indexOf('--json'), 1);
if (!argv.length) { console.error('usage: node tools/verify.mjs proof.json [...] [--docs dir] [--json]'); process.exit(2); }

const sha256 = (t) => createHash('sha256').update(t).digest('hex');
let nonce = 0;
export async function loadByHash(r) {
  const file = join(docs, 'worlds/by-hash', r.sha256 + '.js');
  if (!existsSync(file)) throw new Error(`no module ${r.sha256.slice(0, 12)}… (world "${r.id}") in the archive`);
  const text = readFileSync(file, 'utf8');
  if (sha256(text) !== r.sha256) throw new Error(`archived module ${r.sha256.slice(0, 12)}… does not match its hash`);
  // import exactly the bytes we hashed; the trailing comment only makes each visit a fresh module instance
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// visit ${nonce++}\n`).toString('base64'))).default;
}

let allOk = true;
const out = [];
for (const file of argv) {
  let proof;
  try { proof = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { out.push({ file, ok: false, reason: 'cannot read JSON: ' + e.message }); allOk = false; if (!asJson) console.log(`INVALID ${file}\n        cannot read it: ${e.message}`); continue; }
  const r = await replayRun(proof, { loadModule: loadByHash });
  r.file = file;
  out.push(r);
  if (!r.ok) allOk = false;
  if (!asJson) {
    if (r.ok) {
      const s = r.summary, bits = [];
      for (const x of s.records) bits.push(`${x.key} ${x.better === 'higher' ? x.value : fmtTime(x.value)}`);
      if (s.items.length) bits.push('items: ' + s.items.join(', '));
      if (s.coins) bits.push(`${s.coins > 0 ? '+' : ''}${s.coins} coins`);
      if (s.exit) bits.push('left for ' + s.exit);
      console.log(`VALID   ${file}\n        ${proof.world.id} (${proof.world.sha256.slice(0, 8)}), ${r.ticks} ticks = ${fmtTime(r.seconds)}, replayed in ${(r.ms / 1000).toFixed(2)} s; signature ${r.sigStatus}${proof.player && proof.player.name ? ` (${proof.player.name})` : ''}\n        ${bits.join(' · ') || 'no claims'}\n        state ${r.state.slice(0, 16)}…`);
    } else console.log(`INVALID ${file}\n        ${r.reason}`);
  }
}
if (asJson) console.log(JSON.stringify(out.map((r) => ({ file: r.file, ok: r.ok, reason: r.reason || null, world: r.world, ticks: r.ticks, ms: r.ms, sig: r.sigStatus, state: r.state, summary: r.summary || (r.replayClaims ? summarize(r.replayClaims) : null), divergedAt: r.divergedAt })), null, 1));
// let piped output drain before exiting (process.exit would cut a long --json report short)
process.exitCode = allOk ? 0 : 1;
