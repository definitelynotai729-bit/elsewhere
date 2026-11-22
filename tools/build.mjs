// Build: bundle the engine, copy world modules, pin each world by SHA-256 in the registry.
// Usage: node tools/build.mjs
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const src = join(root, 'src'), out = outArg > 0 ? process.argv[outArg + 1] : join(root, 'docs');
mkdirSync(join(out, 'worlds'), { recursive: true });

await build({
  entryPoints: [join(src, 'engine/main.js')],
  bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'],
  outfile: join(out, 'engine.js'), logLevel: 'warning', legalComments: 'none',
});

await build({
  entryPoints: [join(src, 'verify/main.js')],
  bundle: true, format: 'esm', minify: true, sourcemap: false, target: ['es2020'],
  outfile: join(out, 'verify.js'), logLevel: 'warning', legalComments: 'none',
});
copyFileSync(join(src, 'verify.html'), join(out, 'verify.html'));

// fonts are self-hosted (SIL Open Font License 1.1), so no third-party font server sees players
const FONTS = [['@fontsource/chakra-petch', [500, 600, 700]], ['@fontsource/inter', [400, 500, 600]]];
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
    url: 'worlds/' + f, sha256, bytes: Buffer.byteLength(text),
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
  const hp = join(out, 'worlds/history.json'), now = Math.floor(Date.now() / 1000);
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
const kb = (p) => (readFileSync(p).length / 1024).toFixed(0) + ' KB';
console.log(`engine.js ${kb(join(out, 'engine.js'))}; worlds: ${entries.map((e) => `${e.id} (${(e.bytes / 1024).toFixed(1)} KB, ${e.sha256.slice(0, 8)})`).join(', ')}; items: ${Object.keys(itemOwners).length}`);
