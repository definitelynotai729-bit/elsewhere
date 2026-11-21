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

const SITE = 'https://definitelynotai729-bit.github.io/elsewhere/';
let html = readFileSync(join(src, 'index.html'), 'utf8');
const og = existsSync(join(out, 'og.png')) ? `<meta property="og:image" content="${SITE}og.png">\n<meta property="og:url" content="${SITE}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta property="og:url" content="${SITE}">`;
html = html.replace('<!--OG-->', og);
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, '.nojekyll'), '');

// worlds: order = hub first, then the order in src/worlds/order.json (if present), then alphabetical
const files = readdirSync(join(src, 'worlds')).filter((f) => f.endsWith('.js'));
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
    if (d.slot && !['head', 'back', 'hand', 'feet', 'board'].includes(d.slot)) throw new Error(`${mod.id}: item ${id} has unknown slot ${d.slot}`);
  }
  copyFileSync(join(src, 'worlds', f), join(out, 'worlds', f));
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
const kb = (p) => (readFileSync(p).length / 1024).toFixed(0) + ' KB';
console.log(`engine.js ${kb(join(out, 'engine.js'))}; worlds: ${entries.map((e) => `${e.id} (${(e.bytes / 1024).toFixed(1)} KB, ${e.sha256.slice(0, 8)})`).join(', ')}; items: ${Object.keys(itemOwners).length}`);
