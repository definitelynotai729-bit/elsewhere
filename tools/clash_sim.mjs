// Spire Clash, played headlessly by a simple bot: fast balance checks, and proofs for the determinism battery.
// Usage: node tools/clash_sim.mjs [--matches 3] [--minutes 14] [--out proofs/clash] [--gear glider,lantern,katana,...] [--spread 8]
// --spread N also replays the same match with N other seeds for the rival's dodge rolls (no proofs for those) and
// prints the spread: one match is a single sample of a chaotic system, so balance calls need several.
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
const GEAR = opt('--gear', ''), SPREAD = +opt('--spread', 0);
const docs = join(root, 'docs');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
const SLOT = { glider: 'back', lantern: 'hand', katana: 'hand', springboots: 'feet', hoverboard: 'board', cap: 'head', tophat: 'head' };
// the Katana lives in Junction's module; a build from before it existed gets the same definition here (sim only)
const KATANA = { name: 'Katana', slot: 'hand', traits: ['blade'], rarity: 'epic', desc: 'A folded-steel blade.', look: [{ s: 'box', size: [0.018, 0.9, 0.05], pos: [0, 0.5, 0], color: '#eef2f8' }] };
let nonce = 0, mirrored = false;
const loadModule = (patch) => async (r) => {
  let text = readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8');
  if (patch && r.id === 'clash') text = patch(text);
  const mod = (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// sim ${nonce++}\n`).toString('base64'))).default;
  if (r.id === 'hub' && GEAR.split(',').includes('katana') && !(mod.items && mod.items.katana)) { mod.items = Object.assign({}, mod.items, { katana: KATANA }); mirrored = true; }
  return mod;
};
mkdirSync(OUT, { recursive: true });
const QA = quantYaw(Math.PI); // the arena camera looks toward -z: screen-up is -z, screen-right is +x

// The policy (tools/clash_bot.js plays the same one in a browser): fight with the frontline, cast at the rival,
// clear waves with Q, dash on long walks, recall to heal or to spend gold, and step up to a red tower while your
// own minions are hitting it.
const policy = (C) => {
  const pl = C.player, P = C.P, rv = C.rival;
  let tx = pl.x, tz = pl.z, bits = 0;
  if (C.state === 'live' && P.dead <= 0) {
    const frac = pl.hp / pl.max, rd = Math.hypot(rv.x - pl.x, rv.z - pl.z);
    const allies = C.units.filter((u) => u.alive && u.team === 0 && (u.kind === 'melee' || u.kind === 'ranged'));
    const front = allies.reduce((a, b) => (!a || b.z < a.z ? b : a), null);
    const redTowers = C.towers.filter((x) => x.alive && x.team === 1);
    if (P.recallT >= 0) { tx = pl.x; tz = pl.z; }
    else if (frac < 0.3) { if (rd > 9) bits |= 256; else { tx = 0; tz = 74; } }
    else if (C.gold >= C.nextCost && pl.z < 60 && rd > 12) bits |= 256; // go home and spend, as the HUD suggests
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
      else if (P.qcd <= 0 && C.units.some((u) => u.alive && u.team === 1 && (u.kind === 'melee' || u.kind === 'ranged') && Math.hypot(u.x - pl.x, u.z - pl.z) < 9)) bits |= 16; // clear the wave
      if (rv.alive && rd < 9 && frac < 0.6 && P.ecd <= 0) bits |= 32;
      if (rv.alive && rd < 10 && P.rcd <= 0 && pl.lvl >= 3) bits |= 64;
    }
  }
  const dx = tx - pl.x, dz = tz - pl.z, d = Math.hypot(dx, dz);
  if (C.state === 'live' && P.dead <= 0 && P.recallT < 0 && d > 18 && P.dcd <= 0) bits |= 128; // dash on long walks
  return frameFromCodes(d > 0.6 ? Math.round(dx / d * 127) : 0, d > 0.6 ? Math.round(-dz / d * 127) : 0, QA, bits);
};
const towersLeft = (C, team) => C.towers.filter((x) => x.alive && x.team === team).length;

// one match; returns its summary (and the engine, for the proof)
const play = async (patch, log) => {
  const inv = {}, eq = { head: null, back: null, hand: null, feet: null, board: null };
  for (const id of GEAR.split(',').filter(Boolean)) { inv[id] = 1; if (SLOT[id]) eq[SLOT[id]] = id; }
  const entry = { coins: 0, inv, eq, flags: {}, save: null };
  const spec = { registry, world: registry.find((r) => r.id === 'clash'), from: null, entry };
  const { E, error } = await bootHeadless(spec, { loadModule: loadModule(patch) }, { replaying: false });
  if (error) { console.error(error); process.exit(1); }
  E.rec = new RunLog();
  const C = E.world.group.userData.clash;
  let last = '', res = null;
  for (let t = 0; t < MINUTES * 3600; t++) {
    E.tick(policy(C));
    if (C.state === 'over' && last !== 'over') { res = { won: C.spires[1].alive === false, min: E.world.time / 60 }; break; }
    last = C.state;
    if (log && t % 7200 === 0 && t) console.log(`  ${(t / 3600).toFixed(0)} min: lvl ${C.player.lvl}/${C.rival.lvl} hp ${Math.ceil(C.player.hp)}/${Math.ceil(C.player.max)} gold ${Math.floor(C.gold)} cs ${C.cs} kills ${C.kills} deaths ${C.deaths} towers ${towersLeft(C, 0)}-${towersLeft(C, 1)} minions ${C.units.filter((u) => u.alive && (u.kind === 'melee' || u.kind === 'ranged')).length}`);
  }
  const line = res ? `${res.won ? 'VICTORY' : 'defeat'} at ${res.min.toFixed(1)} min` : `no result after ${MINUTES} min`;
  return { E, C, spec, entry, res, text: `${line} · lvl ${C.player.lvl} vs ${C.rival.lvl} · takedowns ${C.kills} · deaths ${C.deaths} · minions ${C.cs} · gold left ${Math.floor(C.gold)} · towers ${towersLeft(C, 0)}-${towersLeft(C, 1)}` };
};

for (let k = 0; k < MATCHES; k++) {
  const { E, spec, entry, text } = await play(null, true);
  console.log(`match ${k + 1}: ${text}`);
  const proof = { format: FORMAT, sim: await sourceEngine(), engine: 'clash-sim', world: spec.world, registry, from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'clash bot' } };
  writeFileSync(join(OUT, `clash-${k}.json`), JSON.stringify(proof));
  E.world.dispose();
}
if (SPREAD > 0) {
  const mins = [];
  for (let s = 1; s <= SPREAD; s++) {
    const { E, res, text } = await play((t) => t.replace('w.rand(5)', `w.rand(${100 + s})`), false);
    console.log(`  spread seed ${s}: ${text}`);
    mins.push(res && res.won ? res.min : Infinity);
    E.world.dispose();
  }
  const won = mins.filter((m) => m < Infinity).sort((a, b) => a - b);
  console.log(`spread: ${won.length}/${SPREAD} won within ${MINUTES} min${won.length ? `; minutes min ${won[0].toFixed(1)} · median ${won[won.length >> 1].toFixed(1)} · max ${won[won.length - 1].toFixed(1)} · mean ${(won.reduce((a, b) => a + b, 0) / won.length).toFixed(1)}` : ''}`);
}
if (mirrored) console.log('(this build has no Katana in Junction yet: the sim used the same definition, slot hand, trait blade)');
