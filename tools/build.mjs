// Build: archive the engine by hash, bundle the client, copy world modules, pin each world by SHA-256 in the registry.
// Usage: node tools/build.mjs [--prune]
//   --prune  before committing: forget world and engine versions that were built but never committed (see the end)
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildEngine, updateHistory, readHistory } from './engines.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const src = join(root, 'src'), out = outArg > 0 ? process.argv[outArg + 1] : join(root, 'docs');
mkdirSync(join(out, 'worlds'), { recursive: true });
const NOW = Math.floor(Date.now() / 1000);

// the engine verifiers replay on, archived by hash (tools/engines.mjs); the client stamps its hash on every proof
const { engine } = await buildEngine({ out });
updateHistory(out, engine.sha256, NOW);

// The physics engine's binary as a file of its own, for the game client only. The Rapier package embeds it as
// base64 text (4.1 MB, 1.6 MB gzipped); as a .wasm it is 1.2 MB gzipped, compiles while it downloads, and stays
// cached when engine.js changes. Same bytes as the embedded copy, so play is identical; the archived replay engine
// (tools/engines.mjs) keeps the self-contained package.
let wasmName = null;
const rapierFile = {
  name: 'rapier-wasm-file',
  setup(b) {
    b.onLoad({ filter: /rapier3d-deterministic-compat[\\/]dist[\\/]rapier\.mjs$/ }, (a) => {
      const code = readFileSync(a.path, 'utf8');
      const m = /([A-Za-z_$][\w$]*)\.toByteArray\("(AGFzbQ[A-Za-z0-9+/=]+)"\)\.buffer/.exec(code);
      if (!m) throw new Error('rapier-wasm-file: the embedded WASM was not found (did the Rapier package change?)');
      const bytes = Buffer.from(m[2], 'base64');
      const name = wasmName = `rapier-${createHash('sha256').update(bytes).digest('hex').slice(0, 16)}.wasm`;
      writeFileSync(join(out, name), bytes);
      // the page starts this download while it is still parsing (window.__elsewhereWasm, a fetch made by an inline
      // script in index.html; see below) and the physics engine takes that response. Without it (verify.html), a URL
      // string: fetched then. Either way it compiles while it streams.
      return { contents: code.replace(m[0], `(globalThis.__elsewhereWasm || ${JSON.stringify(name)})`), loader: 'js' };
    });
  },
};

// The word filter (src/engine/profanity.js) is built on its own. The obscenity library inside it ships as CommonJS:
// in the client build, esbuild's CommonJS helpers would join the runtime chunk that every chunk imports, renaming it
// and every chunk after it (three.js among them), so returning players would download them all again. Its own bundle
// carries its own helpers. safety.js imports it by the name given here (__PROFANITY__), the first time it is needed.
// (The badwords list is turned into a plain ES module on the way.)
const badwordsEsm = {
  name: 'badwords-esm',
  setup(b) {
    b.onLoad({ filter: /[\\/]badwords[\\/]array\.js$/ }, (a) => {
      const list = JSON.parse(readFileSync(a.path, 'utf8').replace(/^\s*module\.exports\s*=\s*/, '').replace(/;\s*$/, ''));
      if (!Array.isArray(list) || list.length < 100) throw new Error('badwords-esm: the word list was not found (did the badwords package change?)');
      return { contents: `export default ${JSON.stringify(list)};`, loader: 'js' };
    });
  },
};

const filterBuild = await build({
  entryPoints: [join(src, 'engine/profanity.js')], bundle: true, format: 'esm', minify: true, write: false,
  target: ['es2020'], logLevel: 'warning', legalComments: 'none', plugins: [badwordsEsm],
});
const filterBytes = filterBuild.outputFiles[0].contents;
const filterName = `chunks/profanity-${createHash('sha256').update(filterBytes).digest('hex').slice(0, 8).toUpperCase()}.js`;
mkdirSync(join(out, 'chunks'), { recursive: true });
writeFileSync(join(out, filterName), filterBytes);

// The game client: engine.js plus chunks. engine.js (src/engine/entry.js) installs deterministic Math, then imports
// the game (main.js), so no gameplay module runs before it. Parts most players never use load on first use, each
// its own chunk: the Builder (with model import and its mesh simplifier) and the ultra graphics preset. Code shared
// between them and the game sits in shared chunks. The page preloads every chunk boot needs. Chunk names carry a
// hash of their content, so a cached engine.js always asks for the chunks it was built with (and --prune keeps the
// chunks of the last deployed build).
const client = await build({
  entryPoints: { engine: join(src, 'engine/entry.js') },
  bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'],
  splitting: true, outdir: out, entryNames: '[name]', chunkNames: 'chunks/[name]-[hash]', metafile: true,
  logLevel: 'warning', legalComments: 'none',
  define: { __ENGINE__: JSON.stringify(engine.sha256), __PROFANITY__: JSON.stringify('./' + filterName.slice('chunks/'.length)) },
  plugins: [rapierFile],
});
const rel = (p) => relative(out, resolve(p)).split(sep).join('/'); // metafile paths are relative to the working directory
const clientOut = Object.fromEntries(Object.entries(client.metafile.outputs).map(([p, v]) => [rel(p), v]));
const chunksNow = new Set(Object.keys(clientOut).filter((p) => p.startsWith('chunks/')).concat(filterName));
// what boot needs: what engine.js imports (detmath, then the game), and every chunk those import, but not the parts
// loaded on first use (the game's own dynamic imports)
const preloads = [];
{
  const todo = clientOut['engine.js'].imports.filter((i) => i.kind === 'import-statement' || i.kind === 'dynamic-import').map((i) => rel(i.path));
  while (todo.length) {
    const p = todo.shift();
    if (preloads.includes(p)) continue;
    preloads.push(p);
    todo.push(...clientOut[p].imports.filter((i) => i.kind === 'import-statement').map((i) => rel(i.path)));
  }
}
if (!wasmName) throw new Error('the physics engine binary was not written');
// guard: until the game is imported, engine.js may run nothing but deterministic Math (entry.js), so that every
// gameplay module computes its values with it, as replays do
{
  const early = new Set(), seen = new Set(), todo = ['engine.js'];
  while (todo.length) {
    const p = todo.shift(); if (seen.has(p)) continue; seen.add(p);
    for (const k of Object.keys(clientOut[p].inputs)) early.add(relative(root, resolve(k)).split(sep).join('/'));
    todo.push(...clientOut[p].imports.filter((i) => i.kind === 'import-statement').map((i) => rel(i.path)));
  }
  const extra = [...early].filter((f) => f !== 'src/engine/entry.js' && f !== 'src/engine/detmath.js');
  if (extra.length) throw new Error(`engine.js runs ${extra.join(', ')} before deterministic Math is in place (see src/engine/entry.js)`);
}

// photo mode (src/engine/photo.js, the path tracer): its own file, loaded only when a player takes a photo. 'three'
// resolves to the running game's copy (window.EW.THREE), so the path tracer and the game share one set of classes.
{
  const threeNames = Object.keys(await import('three')).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default');
  await build({
    entryPoints: [join(src, 'engine/photo.js')],
    bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'],
    outfile: join(out, 'photo.js'), logLevel: 'warning', legalComments: 'none',
    plugins: [{
      name: 'game-three',
      setup(b) {
        b.onResolve({ filter: /^three$/ }, () => ({ path: 'three', namespace: 'game-three' }));
        b.onLoad({ filter: /.*/, namespace: 'game-three' }, () => ({ contents: `export const { ${threeNames.join(', ')} } = window.EW.THREE;`, loader: 'js' }));
      },
    }],
  });
}

await build({
  entryPoints: [join(src, 'verify/main.js')],
  bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'],
  outfile: join(out, 'verify.js'), logLevel: 'warning', legalComments: 'none',
});
copyFileSync(join(src, 'verify.html'), join(out, 'verify.html'));

// the privacy note (also shown in the game's Privacy panel) must name every relay and address server the game uses
{
  const page = readFileSync(join(src, 'privacy.html'), 'utf8');
  const { MEET_RELAYS } = await import(pathToFileURL(join(src, 'engine/relays.js')).href);
  const nostrSrc = readFileSync(join(src, 'engine/nostr.js'), 'utf8');
  const ledgerRelays = (/export const RELAYS = \[([^\]]*)\]/.exec(nostrSrc) || [, ''])[1].match(/wss:\/\/[^'"]+/g) || [];
  const iceLine = readFileSync(join(root, 'node_modules/@trystero-p2p/core/dist/peer.mjs'), 'utf8').split('\n').find((l) => l.includes('defaultIceServers =')) || '';
  const stun = iceLine.match(/(?:[a-z0-9-]+\.)+[a-z]{2,}(?=:\d+)/g) || []; // Trystero's default STUN hosts (l.google.com, stun.cloudflare.com)
  const missing = [...new Set([...MEET_RELAYS, ...ledgerRelays].map((u) => u.replace('wss://', '')).concat(stun))].filter((h) => !page.includes(h));
  if (!ledgerRelays.length || !stun.length) throw new Error('privacy.html check: could not read the relay or STUN lists');
  if (missing.length) throw new Error(`src/privacy.html does not name ${missing.join(', ')}: players must be told every server the game contacts`);
  copyFileSync(join(src, 'privacy.html'), join(out, 'privacy.html'));
}

// fonts are self-hosted (SIL Open Font License 1.1), so no third-party font server sees players
const FONTS = [['@fontsource/fredoka', [500, 600, 700]], ['@fontsource/inter', [400, 500, 600]]];
mkdirSync(join(out, 'fonts'), { recursive: true });
let fontCss = '/* Self-hosted fonts, SIL Open Font License 1.1 (see the *-LICENSE.txt files next to this one). */\n';
for (const [pkg, weights] of FONTS) {
  const dir = join(root, 'node_modules', pkg), name = pkg.split('/')[1];
  copyFileSync(join(dir, 'LICENSE'), join(out, 'fonts', `${name}-LICENSE.txt`));
  for (const wgt of weights) {
    for (const block of readFileSync(join(dir, `${wgt}.css`), 'utf8').match(/@font-face\s*{[^}]*}/g)) {
      const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)[1];
      copyFileSync(join(dir, 'files', file), join(out, 'fonts', file));
      fontCss += block.replace(/src:[^;]*;/, `src: url(./${file}) format('woff2');`) + '\n';
    }
  }
}
writeFileSync(join(out, 'fonts/fonts.css'), fontCss);

const SITE = 'https://definitelynotai729-bit.github.io/elsewhere/';
let html = readFileSync(join(src, 'index.html'), 'utf8');
const og = existsSync(join(out, 'og.png')) ? `<meta property="og:image" content="${SITE}og.png">\n<meta property="og:url" content="${SITE}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta property="og:url" content="${SITE}">`;
html = html.replace('<!--OG-->', og);
// start the downloads boot needs at once, rather than after engine.js has arrived and run: the physics engine's
// binary (the biggest file) and the chunks of the game. The binary is fetched by a script rather than a
// <link rel="preload">: Safari does not hand a preloaded file to a later fetch() and downloads it twice.
if (!html.includes('<!--PRELOAD-->')) throw new Error('index.html: the <!--PRELOAD--> marker is missing');
html = html.replace('<!--PRELOAD-->', [`<script>try { const p = fetch(${JSON.stringify(wasmName)}); p.catch(() => {}); window.__elsewhereWasm = p; } catch (e) {}</script>`,
  ...preloads.map((p) => `<link rel="modulepreload" href="${p}">`)].join('\n'));
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, '.nojekyll'), '');

// worlds: order = hub first, then the order in src/worlds/order.json (if present), then alphabetical
// Determinism lint. A world's gameplay must replay bit for bit, so world code may not read the wall clock,
// use unseeded randomness or timers, or call Math functions that differ between browsers.
const BANNED = [
  [/\bMath\.random\b/, 'Math.random (use w.rand(seed))'], [/\bDate\b/, 'Date (worlds run on game time: w.time)'],
  [/\bperformance\.now\b/, 'performance.now (use w.time)'], [/\bset(Timeout|Interval)\b/, 'setTimeout/setInterval (use w.after / w.wait)'],
  [/\brequestAnimationFrame\b/, "requestAnimationFrame (use w.on('frame'))"], [/\*\*/, '** (multiply instead: engines may round it differently)'],
  [/\bMath\.(pow|log|log2|log10|log1p|expm1|cbrt|sinh|cosh|tanh|asinh|acosh|atanh)\b/, 'Math.pow/log/... (not deterministic across browsers)'],
  [/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document|window|navigator)\b/, 'browser APIs (a world talks to the engine only through w)'],
];
function lint(file, text) {
  const errs = [];
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/\/\/.*$/, '').replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''"));
  code.forEach((line, i) => { for (const [re, why] of BANNED) if (re.test(line)) errs.push(`${file}:${i + 1}: ${why}`); });
  return errs;
}

const files = readdirSync(join(src, 'worlds')).filter((f) => f.endsWith('.js'));
const lintErrs = files.flatMap((f) => lint(f, readFileSync(join(src, 'worlds', f), 'utf8')));
if (lintErrs.length) { console.error('World determinism lint failed:\n  ' + lintErrs.join('\n  ')); process.exit(1); }
mkdirSync(join(out, 'worlds/by-hash'), { recursive: true });
const order = existsSync(join(src, 'worlds/order.json')) ? JSON.parse(readFileSync(join(src, 'worlds/order.json'), 'utf8')) : [];
const entries = [];
const itemOwners = {};
for (const f of files) {
  const text = readFileSync(join(src, 'worlds', f), 'utf8');
  const sha256 = createHash('sha256').update(text).digest('hex');
  const mod = (await import(pathToFileURL(join(src, 'worlds', f)).href + '?' + sha256)).default;
  if (!mod || !mod.id || !mod.name || typeof mod.build !== 'function') throw new Error(`${f}: a world must export default { id, name, build(w) }`);
  if (!/^[a-z][a-z0-9-]{1,31}$/.test(mod.id)) throw new Error(`${f}: bad world id ${mod.id}`);
  for (const id of Object.keys(mod.items || {})) {
    if (itemOwners[id]) throw new Error(`item "${id}" defined by both ${itemOwners[id]} and ${mod.id}`);
    itemOwners[id] = mod.id;
    const d = mod.items[id];
    if (!d.name || !Array.isArray(d.traits)) throw new Error(`${mod.id}: item ${id} needs a name and traits[]`);
    if (d.slot && !['head', 'back', 'hand', 'feet', 'board', 'body'].includes(d.slot)) throw new Error(`${mod.id}: item ${id} has unknown slot ${d.slot}`);
  }
  copyFileSync(join(src, 'worlds', f), join(out, 'worlds', f));
  // content-addressed archive: every version ever published stays loadable, so old runs stay verifiable
  const arch = join(out, 'worlds/by-hash', sha256 + '.js');
  if (!existsSync(arch)) writeFileSync(arch, text);
  entries.push({
    id: mod.id, name: mod.name, kind: mod.kind || 'world', author: mod.author || 'unknown', version: mod.version || 1,
    blurb: mod.blurb || '', color: mod.color || '#9d7bff',
    url: 'worlds/' + f, sha256, bytes: Buffer.byteLength(text), ...(mod.listed === false ? { listed: false } : {}), // unlisted: reached only from inside the game
    rules: mod.rules || {}, items: mod.items || {},
  });
}
const rank = (id) => (id === 'hub' ? -1 : order.includes(id) ? order.indexOf(id) : 1000);
entries.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
const registry = { format: 'elsewhere-registry/1', note: 'Each world is pinned by the SHA-256 of its module. Clients refuse a module whose hash differs. On the chain, this file becomes ledger state.', worlds: entries };
writeFileSync(join(out, 'worlds/registry.json'), JSON.stringify(registry, null, 1));
// Version history: which code each world has run, and since when. The validator admits new runs only on a world's
// current code, or the previous version for a day after a change (open tabs), unless that version was revoked
// (it had an exploitable bug): the archive keeps every version so old proofs still verify, but nobody can play an
// old, fixed bug again. Revocations are added here by hand, with the reason.
{
  const hp = join(out, 'worlds/history.json'), now = NOW;
  let hist = { format: 'elsewhere-history/1', note: 'Each world\'s code versions: from/until (unix seconds), and revoked versions (with why). New runs must use a current version.', worlds: {} };
  try { hist = JSON.parse(readFileSync(hp, 'utf8')); } catch (e) {}
  for (const w of registry.worlds) {
    const list = hist.worlds[w.id] || (hist.worlds[w.id] = []);
    const cur = list.find((v) => v.until == null);
    if (cur && cur.sha256 === w.sha256) continue;
    if (cur) cur.until = now;
    if (!list.some((v) => v.sha256 === w.sha256)) list.push({ sha256: w.sha256, from: now, until: null });
    else { const v = list.find((x) => x.sha256 === w.sha256); v.until = null; }
  }
  writeFileSync(hp, JSON.stringify(hist, null, 1));
}
// --prune: while iterating, every build of a changed world or engine adds a version to its history, and most are never
// deployed. A version that is not current and that the committed history (git HEAD) does not list is dropped, and
// its archive file too if git does not track it. The version that was current at HEAD gets its end time now.
if (process.argv.includes('--prune')) {
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const committed = (rel) => { try { return JSON.parse(git(['show', 'HEAD:' + rel])); } catch (e) { return null; } };
  const tracked = new Set(git(['ls-files', 'docs/worlds/by-hash', 'docs/engines']).split('\n').filter(Boolean));
  const keepList = (list, headList) => {
    const inHead = new Set((headList || []).map((v) => v.sha256));
    const kept = list.filter((v) => v.until == null || inHead.has(v.sha256));
    for (const v of kept) { const h = (headList || []).find((x) => x.sha256 === v.sha256); if (h && h.until == null && v.until != null) v.until = NOW; }
    return kept;
  };
  let dropped = 0;
  const wh = JSON.parse(readFileSync(join(out, 'worlds/history.json'), 'utf8')), whHead = committed('docs/worlds/history.json') || { worlds: {} };
  const worldShas = new Set();
  for (const id of Object.keys(wh.worlds)) { const n = wh.worlds[id].length; wh.worlds[id] = keepList(wh.worlds[id], whHead.worlds[id]); dropped += n - wh.worlds[id].length; wh.worlds[id].forEach((v) => worldShas.add(v.sha256)); }
  writeFileSync(join(out, 'worlds/history.json'), JSON.stringify(wh, null, 1));
  for (const f of readdirSync(join(out, 'worlds/by-hash'))) {
    const rel = 'docs/worlds/by-hash/' + f;
    if (!tracked.has(rel) && !worldShas.has(f.replace(/\.js$/, ''))) { unlinkSync(join(out, 'worlds/by-hash', f)); dropped++; }
  }
  const eh = readHistory(out), ehHead = committed('docs/engines/history.json');
  const n0 = eh.engines.length; eh.engines = keepList(eh.engines, ehHead && ehHead.engines); dropped += n0 - eh.engines.length;
  const cur = eh.engines.find((v) => v.until == null).sha256;
  for (const k of Object.keys(eh.legacy)) if (!eh.engines.some((v) => v.sha256 === eh.legacy[k])) eh.legacy[k] = cur; // never deployed: the first deployed engine stands for it
  writeFileSync(join(out, 'engines/history.json'), JSON.stringify(eh, null, 1));
  const engShas = new Set(eh.engines.map((v) => v.sha256)), vendorsUsed = new Set();
  for (const f of readdirSync(join(out, 'engines/by-hash'))) {
    const h = f.replace(/\.js$/, '');
    if (!engShas.has(h) && !tracked.has('docs/engines/by-hash/' + f)) { unlinkSync(join(out, 'engines/by-hash', f)); dropped++; continue; }
    for (const m of readFileSync(join(out, 'engines/by-hash', f), 'utf8').matchAll(/\.\.\/vendor\/([a-z0-9]+-[0-9a-f]{16}\.js)/g)) vendorsUsed.add(m[1]);
  }
  for (const f of readdirSync(join(out, 'engines/vendor'))) if (!vendorsUsed.has(f) && !tracked.has('docs/engines/vendor/' + f)) { unlinkSync(join(out, 'engines/vendor', f)); dropped++; }
  // client chunks: keep this build's and every chunk the deployed (HEAD) engine.js reaches, so a browser holding the
  // previous engine.js in its cache still finds its chunks; drop the rest (older deploys, builds made while iterating)
  const keepChunks = new Set(chunksNow);
  const chunkRefs = (text) => [...text.matchAll(/([\w-]+-[A-Z0-9]{8}\.js)/g)].map((m) => 'chunks/' + m[1]);
  const atHead = (p) => { try { return git(['show', 'HEAD:docs/' + p]); } catch (e) { return null; } };
  const todo = chunkRefs(atHead('engine.js') || '');
  while (todo.length) { const c = todo.pop(); if (keepChunks.has(c)) continue; const t = atHead(c); if (t == null) continue; keepChunks.add(c); todo.push(...chunkRefs(t)); }
  if (existsSync(join(out, 'chunks'))) for (const f of readdirSync(join(out, 'chunks'))) if (!keepChunks.has('chunks/' + f)) { unlinkSync(join(out, 'chunks', f)); dropped++; }
  console.log(`prune: dropped ${dropped} never-committed versions and files`);
}

const clientKB = (files) => (files.reduce((n, f) => n + readFileSync(join(out, f)).length, 0) / 1024).toFixed(0) + ' KB';
const eh = readHistory(out);
console.log(`engine ${engine.sha256.slice(0, 12)} (${(engine.bytes.length / 1024).toFixed(0)} KB, ${eh.engines.length} archived); client ${clientKB(['engine.js', ...preloads])} at boot, ${clientKB([...chunksNow].filter((c) => !preloads.includes(c)))} on first use; worlds: ${entries.map((e) => `${e.id} (${(e.bytes / 1024).toFixed(1)} KB, ${e.sha256.slice(0, 8)})`).join(', ')}; items: ${Object.keys(itemOwners).length}`);
