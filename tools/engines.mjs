// Engine versions, pinned by hash.
//
// The deterministic engine (src/engine/sim.js and everything it imports) is built into one module and archived
// by its SHA-256 at docs/engines/by-hash/<sha256>.js. Every proof names the engine it was played on in its `sim`
// field, and verifiers replay it on exactly that engine. So engine code, gameplay included, can change without
// breaking a single old proof: old proofs keep replaying on their old engine.
//
// three.js and Rapier are archived once per version as vendor modules (docs/engines/vendor/<name>-<first 16 hex of
// their sha256>.js), which engine modules import by relative path; each engine version then costs only its own code.
// docs/engines/history.json lists the engines with from/until times (like worlds' history.json): new runs must use
// the current engine, or the previous one for a day after a change, and an engine with an exploitable bug can be
// revoked. Proofs from before pinning say `sim: "sim-1"`; history.legacy maps that name to the first archived engine,
// which replays all of them (checked when it was archived).
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sha = (b) => createHash('sha256').update(b).digest('hex');
export const API = 1; // the interface an archived engine exports: { API, replayRun(proof, env), checkShape(proof) }
export const GRACE = 24 * 3600;
const VENDORS = [
  { name: 'three', spec: 'three', code: "export * from 'three';" },
  { name: 'rapier', spec: '@dimforge/rapier3d-deterministic-compat', code: "export * from '@dimforge/rapier3d-deterministic-compat'; export { default } from '@dimforge/rapier3d-deterministic-compat';" },
];
const OPTS = { bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'], legalComments: 'none', logLevel: 'warning', write: false };

// Build the engine (and its vendor modules) from src. Nothing is written unless `out` (a docs directory) is given.
// plugins: extra esbuild plugins (engine_test builds a variant engine with a gameplay change).
export async function buildEngine({ out = null, plugins = [] } = {}) {
  const vendors = [];
  for (const v of VENDORS) {
    const r = await build({ ...OPTS, stdin: { contents: v.code, resolveDir: root, loader: 'js' } });
    const bytes = Buffer.from(r.outputFiles[0].contents);
    vendors.push({ ...v, file: `${v.name}-${sha(bytes).slice(0, 16)}.js`, bytes });
  }
  const external = {
    name: 'engine-vendors',
    setup(b) { for (const v of vendors) b.onResolve({ filter: new RegExp('^' + v.spec.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&') + '$') }, () => ({ path: '../vendor/' + v.file, external: true })); },
  };
  const r = await build({ ...OPTS, entryPoints: [join(root, 'src/engine/sim.js')], plugins: [external, ...plugins] });
  const bytes = Buffer.from(r.outputFiles[0].contents);
  const engine = { sha256: sha(bytes), bytes };
  if (out) {
    mkdirSync(join(out, 'engines/by-hash'), { recursive: true }); mkdirSync(join(out, 'engines/vendor'), { recursive: true });
    for (const v of vendors) { const p = join(out, 'engines/vendor', v.file); if (!existsSync(p)) writeFileSync(p, v.bytes); }
    const p = join(out, 'engines/by-hash', engine.sha256 + '.js'); if (!existsSync(p)) writeFileSync(p, bytes);
  }
  return { engine, vendors };
}
// the engine the source tree builds to (tools that make proofs from src stamp it as the proofs' sim)
let srcEngine = null;
export async function sourceEngine() { if (!srcEngine) srcEngine = (await buildEngine()).engine.sha256; return srcEngine; }

// ---- history ----
export function readHistory(docs) { try { return JSON.parse(readFileSync(join(docs, 'engines/history.json'), 'utf8')); } catch (e) { return null; } }
export function updateHistory(docs, current, now) {
  const hist = readHistory(docs) || { format: 'elsewhere-engines/1', note: 'Engine versions: from/until (unix seconds), and revoked ones (with why). New runs must use the current engine, or the previous one for a day after a change. legacy: proofs from before engines were pinned, and the engine that replays them.', legacy: {}, engines: [] };
  if (!hist.legacy['sim-1']) hist.legacy['sim-1'] = current;
  const cur = hist.engines.find((v) => v.until == null);
  if (!(cur && cur.sha256 === current)) {
    if (cur) cur.until = now;
    const v = hist.engines.find((x) => x.sha256 === current);
    if (v) v.until = null; else hist.engines.push({ sha256: current, from: now, until: null });
  }
  writeFileSync(join(docs, 'engines/history.json'), JSON.stringify(hist, null, 1));
  return hist;
}
export const currentEngine = (hist) => { const c = hist && hist.engines.find((v) => v.until == null); return c ? c.sha256 : null; };
// the engine a proof was played on: its sim if that is an engine hash, or the engine a legacy name stands for
export function engineOf(hist, sim) {
  if (typeof sim !== 'string') return null;
  if (/^[0-9a-f]{64}$/.test(sim)) return sim;
  return (hist && hist.legacy && hist.legacy[sim]) || null;
}
// may a NEW run use this engine? null if so, or the reason not. (Old, accepted runs stay valid on any archived engine.)
export function enginePolicy(hist, sim, now) {
  const h = engineOf(hist, sim);
  if (!h) return `engine "${String(sim).slice(0, 16)}" is not one this validator knows (reload the game)`;
  const v = hist.engines.find((x) => x.sha256 === h);
  if (!v) return `engine ${h.slice(0, 8)} is not a version this validator admits new runs on (reload the game)`;
  if (v.revoked) return `engine ${h.slice(0, 8)} was withdrawn: ${v.revoked}`;
  if (v.until != null && v.until < now - GRACE) return `engine ${h.slice(0, 8)} is out of date (reload the game)`;
  return null;
}

// ---- loading and replaying ----
const loaded = new Map();
// an archived engine, checked against its hash (and its vendor modules against theirs) before it is imported
export async function loadEngine(docs, h) {
  const key = docs + '|' + h;
  if (loaded.has(key)) return loaded.get(key);
  const file = join(docs, 'engines/by-hash', h + '.js');
  if (!existsSync(file)) throw new Error(`engine ${h.slice(0, 12)}… is not in the archive`);
  const text = readFileSync(file);
  if (sha(text) !== h) throw new Error(`archived engine ${h.slice(0, 12)}… does not match its hash`);
  for (const m of text.toString('utf8').matchAll(/\.\.\/vendor\/([a-z0-9]+-([0-9a-f]{16})\.js)/g)) {
    const vf = join(docs, 'engines/vendor', m[1]);
    if (!existsSync(vf) || sha(readFileSync(vf)).slice(0, 16) !== m[2]) throw new Error(`engine ${h.slice(0, 12)}…: vendor module ${m[1]} is missing or altered`);
  }
  const mod = await import(pathToFileURL(file).href);
  if (mod.API !== API || typeof mod.replayRun !== 'function') throw new Error(`engine ${h.slice(0, 12)}… has an interface this tool does not know`);
  loaded.set(key, mod);
  return mod;
}
// replay a proof on the engine it names. Replays must run one at a time: each puts its engine's Math in place.
export async function replayPinned(docs, hist, proof, env) {
  const h = engineOf(hist, proof && proof.sim);
  if (!h) return { ok: false, reason: `Played on an unknown engine ("${String(proof && proof.sim).slice(0, 16)}"): not a hash, and not a name this archive knows.` };
  let eng;
  try { eng = await loadEngine(docs, h); } catch (e) { return { ok: false, reason: e.message + '.' }; }
  const r = await eng.replayRun(proof, env);
  return Object.assign(r, { engine: h });
}
// every archived file matches its name (CI)
export function checkArchive(docs) {
  const errs = [], hist = readHistory(docs);
  if (!hist) return ['no docs/engines/history.json'];
  for (const v of hist.engines) {
    const f = join(docs, 'engines/by-hash', v.sha256 + '.js');
    if (!existsSync(f)) errs.push(`engine ${v.sha256.slice(0, 12)}… is listed but not archived`);
    else if (sha(readFileSync(f)) !== v.sha256) errs.push(`engine ${v.sha256.slice(0, 12)}… does not match its hash`);
  }
  for (const [name, h] of Object.entries(hist.legacy || {})) if (!hist.engines.some((v) => v.sha256 === h)) errs.push(`legacy "${name}" points at an unlisted engine`);
  return errs;
}
