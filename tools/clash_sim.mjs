// Spire Clash, played headlessly by a simple bot: fast balance checks, and proofs for the determinism battery.
// Usage: node tools/clash_sim.mjs [--matches 3] [--minutes 14] [--out proofs/clash] [--gear glider,lantern,katana,...] [--spread 8]
//          [--policy strong|casual|passive] [--tune towerHp=1800,wave=20]
// --spread N also replays the same match with N other seeds for the rival's dodge rolls (no proofs for those) and
// prints the spread: one match is a single sample of a chaotic system, so balance calls need several.
// --policy: strong (the default) plays well with no reaction time. casual stands in for a person: it looks and
// decides every 0.4 s and uses its abilities about half as eagerly. novice is a first match: every 0.8 s, rare
// abilities, never shops; learner is the same but shops when the HUD says it can. passive stands in the fountain (how
// long a match lasts when nobody plays it). comeback loses its first match on purpose, then plays strong (the easier
// rival after a defeat).
// --tune overrides knobs in the world's TUNE object for this run only, to try balance changes before making them.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { sourceEngine } from './engines.mjs';
import { SIM, FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const MATCHES = +opt('--matches', 3), MINUTES = +opt('--minutes', 14), OUT = opt('--out', join(root, 'proofs/clash'));
const GEAR = opt('--gear', ''), SPREAD = +opt('--spread', 0), POLICY = opt('--policy', 'strong'), TUNE = opt('--tune', '');
const SEED = +opt('--seed', 0), EVERY = +opt('--every', 120), SESSION = +opt('--session', 1); // --session N: N matches in a row in one visit // --seed N: the matches use spread seed N's rolls; --every: log interval (s)
const docs = join(root, 'docs');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const SLOT = { glider: 'back', lantern: 'hand', katana: 'hand', springboots: 'feet', hoverboard: 'board', cap: 'head', tophat: 'head' };
// the Katana lives in Junction's module; a build from before it existed gets the same definition here (sim only)
const KATANA = { name: 'Katana', slot: 'hand', traits: ['blade'], rarity: 'epic', desc: 'A folded-steel blade.', look: [{ s: 'box', size: [0.018, 0.9, 0.05], pos: [0, 0.5, 0], color: '#eef2f8' }] };
let nonce = 0, mirrored = false;
const loadModule = (patch) => async (r) => {
  let text = readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8');
  if (r.id === 'clash') text = tune(text);
  if (patch && r.id === 'clash') text = patch(text);
  const mod = (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// sim ${nonce++}\n`).toString('base64'))).default;
  if (r.id === 'hub' && GEAR.split(',').includes('katana') && !(mod.items && mod.items.katana)) { mod.items = Object.assign({}, mod.items, { katana: KATANA }); mirrored = true; }
  return mod;
};
const tune = (text) => {
  for (const kv of TUNE.split(',').filter(Boolean)) {
    const [k, v] = kv.split('='), re = new RegExp(`(const TUNE = \\{[^}]*\\b${k}: )(-?[0-9.]+)`);
    if (!re.test(text) || !isFinite(+v)) throw new Error(`no TUNE knob ${k} (or a bad value ${v})`);
    text = text.replace(re, (m, a) => a + (+v));
  }
  return text;
};
mkdirSync(OUT, { recursive: true });
const QA = quantYaw(Math.PI); // the arena camera looks toward -z: screen-up is -z, screen-right is +x

// The policy (tools/clash_bot.js plays the same one in a browser): fight with the frontline, cast at the rival,
// clear waves with Q, dash on long walks, recall to heal or to spend gold, and step up to a red tower while your
// own minions are hitting it.
const decide = (C, shops = true) => {
  const pl = C.player, P = C.P, rv = C.rival;
  let tx = pl.x, tz = pl.z, bits = 0, qWave = false, buy = false;
  if (C.state === 'live' && P.dead <= 0) {
    const frac = pl.hp / pl.max, rd = Math.hypot(rv.x - pl.x, rv.z - pl.z);
    const allies = C.units.filter((u) => u.alive && u.team === 0 && (u.kind === 'melee' || u.kind === 'ranged'));
    const front = allies.reduce((a, b) => (!a || b.z < a.z ? b : a), null);
    const redTowers = C.towers.filter((x) => x.alive && x.team === 1);
    if (P.recallT >= 0) { tx = pl.x; tz = pl.z; }
    else if (frac < 0.3) { if (rd > 9) bits |= 256; else { tx = 0; tz = 74; } }
    else if (shops && C.gold >= C.nextCost && pl.z < 60 && rd > 12) { bits |= 256; buy = true; } // go home and spend, as the HUD suggests
    else if (frac < 0.95 && pl.z > 68) { tx = 0; tz = 74; } // heal up in the fountain
    else {
      const anchor = front ? front.z + 4 : (redTowers.length ? Math.max(pl.z, 30) : -50);
      tz = anchor; tx = 1.5;
      // do not walk into a red tower's reach without minions ahead
      for (const tw of redTowers) if (!front || front.z > tw.z + 9) tz = Math.max(tz, tw.z + 10);
      // but while your minions are at a tower, step up and hit it (they draw its fire)
      const siege = redTowers.find((tw) => allies.some((m) => Math.hypot(m.x - tw.x, m.z - tw.z) < tw.range + 2));
      if (siege && (!rv.alive || rd > 7 || frac > 0.6)) { tx = siege.x + 2.5; tz = siege.z + 5.5; }
      if (rv.alive && rd < 12 && P.qcd <= 0) bits |= 16;
      else if (P.qcd <= 0 && C.units.some((u) => u.alive && u.team === 1 && (u.kind === 'melee' || u.kind === 'ranged') && Math.hypot(u.x - pl.x, u.z - pl.z) < 9)) { bits |= 16; qWave = true; } // clear the wave
      if (rv.alive && rd < 9 && frac < 0.6 && P.ecd <= 0) bits |= 32;
      if (rv.alive && rd < 10 && P.rcd <= 0 && pl.lvl >= 3) bits |= 64;
    }
  }
  const d = Math.hypot(tx - pl.x, tz - pl.z);
  if (C.state === 'live' && P.dead <= 0 && P.recallT < 0 && d > 18 && P.dcd <= 0) bits |= 128; // dash on long walks
  return { tx, tz, bits, qWave, buy };
};
const frame = (C, tx, tz, bits) => {
  const pl = C.player, dx = tx - pl.x, dz = tz - pl.z, d = Math.hypot(dx, dz);
  return frameFromCodes(d > 0.6 ? Math.round(dx / d * 127) : 0, d > 0.6 ? Math.round(-dz / d * 127) : 0, QA, bits);
};
const strong = () => (C) => { const g = decide(C); return frame(C, g.tx, g.tz, g.bits); };
// a person, roughly: decides every 0.4 s and holds its course in between; casts at the rival 70% of the times it
// could, clears waves with Q 30%, shields 60%, Starfall 70%, dashes on a long walk half the time (seeded, so a
// match repeats exactly)
const human = (every, keep, shops) => (seed) => {
  let a = seed >>> 0, hold = null, n = 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return (C) => {
    if (C.state !== 'live') hold = null; // waits at the fountain between matches
    if (hold && n++ % every) return frame(C, hold.tx, hold.tz, 0);
    const g = decide(C, shops);
    for (const [bit, p] of [[16, g.qWave ? keep.wave : keep.q], [32, keep.e], [64, keep.r], [128, keep.dash]]) if ((g.bits & bit) && rnd() >= p) g.bits &= ~bit;
    hold = g;
    return frame(C, g.tx, g.tz, g.bits);
  };
};
const casual = human(24, { q: 0.7, wave: 0.3, e: 0.6, r: 0.7, dash: 0.5 }, true);
// a first match: decides every 0.8 s, uses abilities rarely and never goes home to shop
const novice = human(48, { q: 0.5, wave: 0.1, e: 0.3, r: 0.5, dash: 0.3 }, false);
// a first match that follows the HUD's hint to recall and buy
const learner = human(48, { q: 0.5, wave: 0.1, e: 0.3, r: 0.5, dash: 0.3 }, true);
const passive = () => () => frameFromCodes(0, 0, QA, 0);
// stands in the fountain through its first match (and loses it), then plays like strong against the easier rival
const comeback = () => { const st = strong(), idle = passive(); let lost = false; return (C) => { if (C.result === 'lost') lost = true; return lost && C.state === 'live' ? st(C) : idle(C); }; };
const POLICIES = { strong, casual, novice, learner, passive, comeback };
const makePolicy = (seed) => POLICIES[POLICY](seed);
if (!POLICIES[POLICY]) throw new Error('--policy is ' + Object.keys(POLICIES).join(', '));
const towersLeft = (C, team) => C.towers.filter((x) => x.alive && x.team === team).length;

// one match; returns its summary (and the engine, for the proof)
const play = async (patch, log, seed = 1) => {
  const policy = makePolicy(seed);
  const inv = {}, eq = { head: null, back: null, hand: null, feet: null, board: null };
  for (const id of GEAR.split(',').filter(Boolean)) { inv[id] = 1; if (SLOT[id]) eq[SLOT[id]] = id; }
  const entry = { coins: 0, inv, eq, flags: {}, save: null };
  const spec = { registry, world: registry.find((r) => r.id === 'clash'), from: null, entry };
  const { E, error } = await bootHeadless(spec, { loadModule: loadModule(patch) }, { replaying: false });
  if (error) { console.error(error); process.exit(1); }
  E.rec = new RunLog();
  const C = E.world.group.userData.clash;
  let last = '', res = null, startT = null;
  const session = [];
  const tl = { red: [], blue: [] }, up = [2, 2];
  for (let t = 0; t < MINUTES * 3600; t++) {
    E.tick(policy(C));
    if (C.state === 'live' && last !== 'live') { startT = E.world.time; up[0] = up[1] = 2; }
    for (const team of [0, 1]) { const n = towersLeft(C, team); if (n < up[team]) { up[team] = n; tl[team ? 'red' : 'blue'].push((E.world.time - startT) / 60); } }
    if (C.state === 'over' && last !== 'over') { res = { won: C.result === 'won', min: (E.world.time - startT) / 60, ease: C.ease }; session.push(res); if (session.length >= SESSION) break; }
    last = C.state;
    if (log && t % (EVERY * 60) === 0 && t) console.log(`  ${(t / 3600).toFixed(1)} min: rival ${C.rival.alive ? (C.rival.dead > 0 ? 'dead' : Math.round(C.rival.z)) : 'dead'} you ${C.P.dead > 0 ? 'dead' : Math.round(C.player.z)} lvl ${C.player.lvl}/${C.rival.lvl} hp ${Math.ceil(C.player.hp)}/${Math.ceil(C.player.max)} gold ${Math.floor(C.gold)} cs ${C.cs} kills ${C.kills} deaths ${C.deaths} towers ${towersLeft(C, 0)}-${towersLeft(C, 1)} minions ${C.units.filter((u) => u.alive && (u.kind === 'melee' || u.kind === 'ranged')).length}`);
  }
  const line = res ? `${res.won ? 'VICTORY' : 'defeat'} at ${res.min.toFixed(1)} min` : `no result after ${MINUTES} min`;
  const falls = (xs) => xs.map((m) => m.toFixed(1)).join('/') || '-';
  const seq = SESSION > 1 ? ` · session ${session.map((r) => `${r.won ? 'W' : 'L'}${r.ease ? '(-' + r.ease * 10 + '%)' : ''} ${r.min.toFixed(1)}`).join(', ')}` : '';
  return { E, C, spec, entry, res: session[0] || null, session, tl, text: `${line}${seq} · red towers fell ${falls(tl.red)} · blue ${falls(tl.blue)} · lvl ${C.player.lvl} vs ${C.rival.lvl} · takedowns ${C.kills} · deaths ${C.deaths} · minions ${C.cs} · gold left ${Math.floor(C.gold)}` };
};

for (let k = 0; k < MATCHES; k++) {
  const { E, spec, entry, text } = await play(SEED ? (t) => t.replace('w.rand(5)', `w.rand(${100 + SEED})`) : null, true, 1 + SEED);
  console.log(`match ${k + 1}: ${text}`);
  const proof = { format: FORMAT, sim: await sourceEngine(), engine: 'clash-sim', world: spec.world, registry, from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'clash bot' } };
  writeFileSync(join(OUT, `clash-${k}.json`), JSON.stringify(proof));
  E.world.dispose();
}
if (SPREAD > 0) {
  const mins = [];
  for (let s = 1; s <= SPREAD; s++) {
    const { E, res, text } = await play((t) => t.replace('w.rand(5)', `w.rand(${100 + s})`), false, 1 + s);
    console.log(`  spread seed ${s}: ${text}`);
    mins.push(res ? (res.won ? res.min : -res.min) : Infinity);
    E.world.dispose();
  }
  const won = mins.filter((m) => m > 0 && m < Infinity).sort((a, b) => a - b), lost = mins.filter((m) => m < 0).map((m) => -m).sort((a, b) => a - b);
  const stats = (xs) => `min ${xs[0].toFixed(1)} · median ${xs[xs.length >> 1].toFixed(1)} · max ${xs[xs.length - 1].toFixed(1)} · mean ${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1)}`;
  console.log(`spread (${POLICY}${TUNE ? ', ' + TUNE : ''}): ${won.length}/${SPREAD} won within ${MINUTES} min${won.length ? `; minutes ${stats(won)}` : ''}${lost.length ? `; ${lost.length} lost (${stats(lost)})` : ''}`);
}
if (mirrored) console.log('(this build has no Katana in Junction yet: the sim used the same definition, slot hand, trait blade)');
