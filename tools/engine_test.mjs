// Engine versions pinned by hash (tools/engines.mjs), end to end. Runs in CI.
//
// 1. The archive is intact: every engine and vendor module matches its hash, and legacy names point at archived
//    engines.
// 2. The committed build is fresh: the source builds to the current archived engine.
// 3. A gameplay change makes a new engine, and old proofs survive it. A variant engine (players walk 6% slower) is built
//    into a scratch copy of the archive, as the new current engine. Every golden proof still verifies, on the
//    engine it names, and replayed on the variant they fail: the pin is what keeps them valid.
// 4. Policy for new runs: the current engine is admitted, the previous one for a day, a revoked or unknown one never.
import { mkdtempSync, cpSync, readFileSync, readdirSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildEngine, readHistory, updateHistory, currentEngine, replayPinned, checkArchive, engineOf, enginePolicy } from './engines.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'), docs = join(root, 'docs');
let fails = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? ' · ' + detail : ''}`); if (!ok) fails++; };
let nonce = 0;
async function loadModule(r) {
  let file = join(docs, 'worlds/by-hash', r.sha256 + '.js');
  if (!existsSync(file)) file = join(root, 'tests/modules', r.sha256 + '.js');
  const text = readFileSync(file, 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== r.sha256) throw new Error('module hash mismatch');
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// engine test ${nonce++}\n`).toString('base64'))).default;
}

// 1. the archive
const errs = checkArchive(docs), hist0 = readHistory(docs);
check(!errs.length, 'every archived engine matches its hash, and legacy names point at archived engines', errs.join('; ') || `${hist0.engines.length} engine(s); legacy ${Object.keys(hist0.legacy).join(', ')}`);

// 2. the build is fresh
const cur = currentEngine(hist0), src = (await buildEngine()).engine.sha256;
check(src === cur, 'the source builds to the current archived engine (the committed build is fresh)', `src ${src.slice(0, 12)}, current ${cur && cur.slice(0, 12)}`);

// 3. a gameplay change: walking speed 8 -> 7.5 m/s, as a new engine in a scratch copy of the archive
const tmp = mkdtempSync(join(tmpdir(), 'ew-engine-'));
cpSync(join(docs, 'engines'), join(tmp, 'engines'), { recursive: true });
const slowerWalk = {
  name: 'slower-walk',
  setup(b) {
    b.onLoad({ filter: /[\\/]src[\\/]engine[\\/]player\.js$/ }, (a) => {
      const t = readFileSync(a.path, 'utf8');
      if (!t.includes('WALK = { speed: 8,')) throw new Error('engine_test: the walking speed moved; update the variant');
      return { contents: t.replace('WALK = { speed: 8,', 'WALK = { speed: 7.5,'), loader: 'js' };
    });
  },
};
const variant = (await buildEngine({ out: tmp, plugins: [slowerWalk] })).engine.sha256;
const now = Math.floor(Date.now() / 1000);
const hist = updateHistory(tmp, variant, now);
check(variant !== cur && currentEngine(hist) === variant && checkArchive(tmp).length === 0, 'a gameplay change builds a different engine, archived as the new current one', `${cur.slice(0, 8)} -> ${variant.slice(0, 8)}`);

const files = readdirSync(join(root, 'tests/proofs')).filter((f) => f.endsWith('.json')).sort();
let own = 0, diverged = 0;
const notes = [];
for (const f of files) {
  const proof = JSON.parse(readFileSync(join(root, 'tests/proofs', f), 'utf8'));
  const a = await replayPinned(tmp, hist, proof, { loadModule });
  if (a.ok && a.engine === engineOf(hist, proof.sim) && a.engine !== variant) own++; else notes.push(`${f}: ${a.reason}`);
  const b = await replayPinned(tmp, hist, Object.assign({}, proof, { sim: variant }), { loadModule });
  if (!b.ok && !/signature/.test(b.reason || '')) diverged++; // (not the signature: that changed with sim on purpose)
}
check(own === files.length, 'after the change, every golden proof still verifies, on the engine it names', `${own}/${files.length}${notes.length ? ' · ' + notes.join('; ') : ''}`);
check(diverged >= files.length - 2, 'replayed on the changed engine, they fail: the pin is what keeps them valid', `${diverged}/${files.length} diverge on the variant`);

// 4. policy for new runs
const day = 86400;
const revoked = JSON.parse(JSON.stringify(hist)); revoked.engines.find((v) => v.sha256 === variant).revoked = 'test: an exploitable bug';
const cases = [
  ['the current engine', enginePolicy(hist, variant, now) === null],
  ['the previous engine within a day of the update', enginePolicy(hist, cur, now + day / 2) === null],
  ['the previous engine after a day', /out of date/.test(enginePolicy(hist, cur, now + 2 * day) || '')],
  ['a legacy name for the previous engine after a day', /out of date/.test(enginePolicy(hist, 'sim-1', now + 2 * day) || '')],
  ['a revoked engine', /withdrawn/.test(enginePolicy(revoked, variant, now) || '')],
  ['an unknown engine hash', /not a version/.test(enginePolicy(hist, 'a'.repeat(64), now) || '')],
  ['an unknown name', /not one this validator knows/.test(enginePolicy(hist, 'sim-9', now) || '')],
];
check(cases.every((c) => c[1]), 'new runs: current admitted, previous for a day, revoked or unknown never', cases.filter((c) => !c[1]).map((c) => 'wrong: ' + c[0]).join('; ') || `${cases.length} cases`);

rmSync(tmp, { recursive: true, force: true });
console.log(fails ? `${fails} FAILED` : 'ENGINE PINNING OK');
process.exitCode = fails ? 1 : 0;
