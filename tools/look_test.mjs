// The wardrobe's looks (src/engine/looks.js, the kit; avatar.js's skins and proportions). Exits 1 on failure.
// - every style, face, mouth, ears, tail, outfit and extra builds on every body, within bounds, and animates;
// - a hat sits on top of every head, and the name tag clears every pair of ears;
// - looks from anywhere (saves, other players' hellos, worlds' characters) are made safe;
// - with no look, the kit builds exactly the engine's own robot (what every character was before the wardrobe);
// - the look stays out of everything a replay or the ledger compares, and out of the engine.
// usage: node tools/look_test.mjs
import * as THREE from 'three';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAvatar, setLookKit, BOT_METRICS } from '../src/engine/avatar.js';
import { lookKit, normaliseLook, randomLook, legacyColors, PARTS, STYLES, FACES, MOUTHS, TOPS, TAILS, OUTFITS, EXTRAS, FINISHES, DEFAULT_COLORS } from '../src/engine/looks.js';
import { genesisState, entryFrom } from '../src/engine/ledger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let bad = 0, n = 0;
const ok = (cond, what) => { n++; if (!cond) { bad++; console.log('FAIL', what); } };
const C = { body: '#3ec8ff', head: '#eef1ff', visor: '#ff4fd8' };
const STATES = [
  { speed: 0, grounded: true, vy: 0, gliding: false, board: false, groundDist: 0 },
  { speed: 6, grounded: true, vy: 0, gliding: false, board: false, groundDist: 0 },
  { speed: 4, grounded: false, vy: 3, gliding: true, board: false, groundDist: 2 },
  { speed: 12, grounded: true, vy: 0, gliding: false, board: true, groundDist: 0 },
];
const finite = (b) => [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].every(Number.isFinite);

// ---- 1. looks from anywhere are made safe ----
const D = normaliseLook(null);
ok(D.style === 'bot' && D.face === 'visor' && D.outfit === 'none' && D.finish === 'matte' && JSON.stringify(D.colors) === JSON.stringify(DEFAULT_COLORS), 'no look: the default robot in the default colours');
const old = normaliseLook(undefined, { body: '#112233', head: '#445566', visor: '#778899' });
ok(old.colors.body === '#112233' && old.colors.head === '#445566' && old.colors.eyes === '#778899', 'the old three colours carry over (body, head, visor -> eyes)');
for (const junk of [42, 'bot', [], [1, 2], true, { style: 'robot' }, { style: '__proto__' }, { style: 'constructor' }, { face: 'toString' }, { outfit: 'hasOwnProperty' }, { top: 'valueOf' }, JSON.parse('{"__proto__": {"style": "tall"}}'), { colors: 'red' }, { colors: [1] }]) {
  const L = normaliseLook(junk);
  ok(L.style === 'bot' && L.face === 'visor' && L.outfit === 'none' && L.top === 'none' && own(L.colors), `junk is refused: ${JSON.stringify(junk)}`);
}
function own(c) { return Object.keys(c).join() === 'body,head,eyes,outfit,trim' && Object.values(c).every((v) => /^#[0-9a-f]{6}$/.test(v)); }
const cols = normaliseLook({ colors: { body: 'red', head: '#fff', eyes: '#12345g', outfit: '#ABCDEF', trim: 123 } });
ok(cols.colors.body === DEFAULT_COLORS.body && cols.colors.head === DEFAULT_COLORS.head && cols.colors.eyes === DEFAULT_COLORS.eyes && cols.colors.outfit === '#abcdef' && cols.colors.trim === DEFAULT_COLORS.trim, 'bad colours fall back; good ones are kept (lower case)');
const extra = normaliseLook({ style: 'tall', evil: 'x'.repeat(10000), colors: { body: '#000000', extra: 1 } });
ok(!('evil' in extra) && !('extra' in extra.colors) && JSON.stringify(extra).length < 400, 'unknown keys are dropped (a look stays small)');
let rnd = 7; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
let stable = true;
for (let i = 0; i < 300; i++) { const L = randomLook(rand); if (JSON.stringify(normaliseLook(L)) !== JSON.stringify(L) || JSON.stringify(normaliseLook(JSON.parse(JSON.stringify(L)))) !== JSON.stringify(L)) stable = false; }
ok(stable, 'random looks are valid looks, and survive a trip through JSON (a hello) unchanged');
ok(Object.keys(PARTS).every((k) => Object.keys(PARTS[k]).length >= 3 && Object.values(PARTS[k]).every((d) => typeof d.name === 'string' && d.name)), 'every option has a name to show');

// ---- 2. the default look is the engine's own robot ----
const meshes = (A) => { const out = []; A.root.updateMatrixWorld(true); A.root.traverse((o) => { if (o.isMesh && o !== A.blob) { const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); out.push([o.geometry.type, JSON.stringify(o.geometry.parameters), o.material.uuid, p.toArray().map((x) => x.toFixed(4)).join()].join('|')); } }); return out.sort(); };
setLookKit(null);
const plain = createAvatar(C, {}); // (not animated: the idle bob follows the clock)
setLookKit(lookKit);
const kitted = createAvatar(C, {});
const a = meshes(plain), b = meshes(kitted);
ok(a.length === 7 && JSON.stringify(a) === JSON.stringify(b), `no look: the kit builds the engine's robot exactly (${a.length} parts, ${a.filter((x, i) => x !== b[i]).length} differ)`);
ok(JSON.stringify(kitted.m) === JSON.stringify(BOT_METRICS) || Object.keys(BOT_METRICS).every((k) => Math.abs(kitted.m[k] - BOT_METRICS[k]) < 1e-9 || k === 'tailY' || k === 'tailZ'), 'no look: the robot\'s proportions');

// ---- 3. every combination builds, stays in bounds and animates ----
let built = 0, worstTop = 0, worstSide = 0;
const tooBig = [], hats = [], tags = [], nan = [];
function check(look, tag) {
  const A = createAvatar(C, { look });
  for (const s of STATES) A.animate(s, 1 / 60);
  A.swing(); A.animate(STATES[0], 0.1);
  A.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(A.root);
  if (!finite(box)) { nan.push(tag); return; }
  worstTop = Math.max(worstTop, box.max.y); worstSide = Math.max(worstSide, -box.min.x, box.max.x, -box.min.z, box.max.z);
  if (box.max.y > 2.3 || box.min.y < -0.05 || Math.max(-box.min.x, box.max.x, -box.min.z, box.max.z) > 0.95) tooBig.push(`${tag} ${box.min.toArray().map((x) => x.toFixed(2))} ${box.max.toArray().map((x) => x.toFixed(2))}`);
  built++;
  return A;
}
for (const style of Object.keys(STYLES)) {
  for (const outfit of Object.keys(OUTFITS)) for (const extra of Object.keys(EXTRAS)) check({ style, outfit, extra }, `${style}/${outfit}/${extra}`);
  for (const face of Object.keys(FACES)) for (const mouth of Object.keys(MOUTHS)) for (const top of Object.keys(TOPS)) {
    const A = check({ style, face, mouth, top }, `${style}/${face}/${mouth}/${top}`);
    if (!A) continue;
    // the name tag (0.4 tall, centred at upper + tagY) clears the head and its ears
    A.animate(STATES[0], 0); A.root.updateMatrixWorld(true);
    const headTop = new THREE.Box3().setFromObject(A.headPivot).max.y, tagBottom = A.upper.getWorldPosition(new THREE.Vector3()).y + A.m.tagY - 0.2;
    if (tagBottom < headTop + 0.02) tags.push(`${style}/${top} tag ${tagBottom.toFixed(2)} head ${headTop.toFixed(2)}`);
  }
  for (const tail of Object.keys(TAILS)) for (const finish of Object.keys(FINISHES)) check({ style, tail, finish }, `${style}/${tail}/${finish}`);
  // a hat sits on top of the head: the head slot at the head's top, within 3 cm
  const A = createAvatar(C, { look: { style } }); A.animate(STATES[0], 0); A.root.updateMatrixWorld(true);
  const top = new THREE.Box3().setFromObject(A.skins.head).max.y, hat = A.slots.head.getWorldPosition(new THREE.Vector3()).y;
  const bodyTop = new THREE.Box3().setFromObject(A.skins.torso).max.y;
  const crown = Math.max(top === -Infinity ? 0 : top, bodyTop); // (the bean's head is its body)
  if (Math.abs(hat - crown) > 0.03) hats.push(`${style}: hat at ${hat.toFixed(3)}, head top ${crown.toFixed(3)}`);
}
ok(!nan.length, `every look's bounds are finite (${nan.slice(0, 3)})`);
ok(!tooBig.length, `every look stays within 2.3 m tall and 0.95 m from the middle (${built} built; tallest ${worstTop.toFixed(2)} m, widest ${worstSide.toFixed(2)} m) ${tooBig.slice(0, 3).join('; ')}`);
ok(!hats.length, `a hat sits on top of every style's head ${hats.join('; ')}`);
ok(!tags.length, `the name tag clears every head and its ears ${tags.slice(0, 3).join('; ')}`);
// a worn hat puts ears and horns away; a character body hides the look underneath and gives it back
{
  const A = createAvatar(C, { look: { style: 'round', top: 'bunny', tail: 'fox', outfit: 'robe' } });
  ok(A.skins.topper.visible && A.skins.topper.children.length > 0, 'ears show without a hat');
  A.equipped.head = 'cap'; A.syncWear(); ok(!A.skins.topper.visible, 'a hat puts the ears away');
  A.equipped.head = null; A.syncWear(); ok(A.skins.topper.visible, 'and taking it off brings them back');
  A.setColors({ body: '#010203', head: '#040506', visor: '#070809' });
  ok(A.look.style === 'round' && A.look.top === 'bunny' && A.look.colors.body === '#010203' && A.look.colors.eyes === '#070809', 'new colours keep the rest of the look');
}

// ---- 4. the look stays out of what replays and the ledger compare, and out of the engine ----
ok(JSON.stringify(Object.keys(genesisState())) === JSON.stringify(['coins', 'inv', 'eq', 'flags', 'worlds']) && JSON.stringify(Object.keys(genesisState().eq)) === JSON.stringify(['head', 'back', 'hand', 'feet', 'board', 'body']),
  'the ledger\'s starting state has no look in it (and no new slot: a new default key would refuse every run)');
const prof = { coins: 3, inv: { cap: 1 }, eq: genesisState().eq, flags: {}, worlds: {}, look: randomLook(rand), looks: [{ name: 'Look 1', look: randomLook(rand) }], colors: C };
ok(JSON.stringify(Object.keys(entryFrom(prof, 'hub'))) === JSON.stringify(['coins', 'inv', 'eq', 'flags', 'save']), 'a run\'s entry (what the ledger compares) carries no look');
const graph = new Set();
(function walk(f) {
  if (graph.has(f)) return; graph.add(f);
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/(?:import|export)[^'"]*?from\s*['"](\.\/[^'"]+)['"]|import\(\s*['"](\.\/[^'"]+)['"]\s*\)/g)) { const p = join(dirname(f), m[1] || m[2]); if (existsSync(p)) walk(p); }
})(join(root, 'src/engine/sim.js'));
const inEngine = [...graph].map((f) => f.split('/').pop());
ok(inEngine.includes('avatar.js') && !inEngine.includes('looks.js') && !inEngine.includes('wardrobe.js'), `looks and the wardrobe are outside the engine (new outfits need no new engine); the engine has ${inEngine.length} files`);

console.log(bad ? `${bad} of ${n} checks FAILED` : `look test: all ${n} checks pass (${built} looks built)`);
process.exitCode = bad ? 1 : 0;
