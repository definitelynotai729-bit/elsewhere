// Spire Clash, played headlessly by a simple bot: fast balance checks, and proofs for the determinism battery.
// Usage: node tools/clash_sim.mjs [--matches 3] [--minutes 14] [--out proofs/clash] [--gear glider,lantern,...]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bootHeadless } from '../src/engine/headless.js';
import { SIM, FORMAT, RunLog, frameFromCodes, encodeInput, stateString, quantYaw } from '../src/engine/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const MATCHES = +opt('--matches', 3), MINUTES = +opt('--minutes', 14), OUT = opt('--out', join(root, 'proofs/clash'));
const GEAR = opt('--gear', '');
const docs = join(root, 'docs');
const registry = JSON.parse(readFileSync(join(docs, 'worlds/registry.json'), 'utf8')).worlds.map((w) => ({ id: w.id, sha256: w.sha256 }));
let nonce = 0;
const loadModule = async (r) => {
  const text = readFileSync(join(docs, 'worlds/by-hash', r.sha256 + '.js'), 'utf8');
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// sim ${nonce++}\n`).toString('base64'))).default;
};
mkdirSync(OUT, { recursive: true });
const QA = quantYaw(Math.PI); // the arena camera looks toward -z: screen-up is -z, screen-right is +x

for (let k = 0; k < MATCHES; k++) {
  const inv = {}, eq = { head: null, back: null, hand: null, feet: null, board: null };
  for (const id of GEAR.split(',').filter(Boolean)) { inv[id] = 1; const slot = { glider: 'back', lantern: 'hand', springboots: 'feet', hoverboard: 'board', cap: 'head' }[id]; if (slot) eq[slot] = id; }
  const entry = { coins: 0, inv, eq, flags: {}, save: null };
  const spec = { registry, world: registry.find((r) => r.id === 'clash'), from: null, entry };
  const { E, error } = await bootHeadless(spec, { loadModule }, { replaying: false });
  if (error) { console.error(error); process.exit(1); }
  E.rec = new RunLog();
  const C = E.world.group.userData.clash;
  const ticks = MINUTES * 3600;
  let last = '', lastHp = 1, wins = 0, losses = 0, t;
  for (t = 0; t < ticks; t++) {
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
        if (rv.alive && rd < 12 && P.qcd <= 0) bits |= 16;
        if (rv.alive && rd < 9 && frac < 0.6 && P.ecd <= 0) bits |= 32;
        if (rv.alive && rd < 10 && P.rcd <= 0 && pl.lvl >= 3) bits |= 64;
      }
    }
    const dx = tx - pl.x, dz = tz - pl.z, d = Math.hypot(dx, dz);
    const qx = d > 0.6 ? Math.round(dx / d * 127) : 0, qy = d > 0.6 ? Math.round(-dz / d * 127) : 0;
    E.tick(frameFromCodes(qx, qy, QA, bits));
    if (C.state === 'over' && last !== 'over') {
      const won = C.spires[1].alive === false;
      if (won) wins++; else losses++;
      console.log(`match ${k + 1}: ${won ? 'VICTORY' : 'defeat'} at ${(E.world.time / 60).toFixed(1)} min · lvl ${C.player.lvl} vs ${C.rival.lvl} · takedowns ${C.kills} · deaths ${C.deaths} · minions ${C.cs} · gold left ${Math.floor(C.gold)} · towers ${C.towers.filter((x) => x.alive && x.team === 0).length}-${C.towers.filter((x) => x.alive && x.team === 1).length}`);
      break;
    }
    last = C.state;
    if (t % 7200 === 0 && t) console.log(`  ${(t / 3600).toFixed(0)} min: lvl ${C.player.lvl}/${C.rival.lvl} hp ${Math.ceil(C.player.hp)}/${Math.ceil(C.player.max)} gold ${Math.floor(C.gold)} cs ${C.cs} kills ${C.kills} deaths ${C.deaths} towers ${C.towers.filter((x) => x.alive && x.team === 0).length}-${C.towers.filter((x) => x.alive && x.team === 1).length} minions ${C.units.filter((u) => u.alive && (u.kind === 'melee' || u.kind === 'ranged')).length}`);
  }
  if (t >= ticks) console.log(`match ${k + 1}: no result after ${MINUTES} min (towers ${C.towers.filter((x) => x.alive && x.team === 0).length}-${C.towers.filter((x) => x.alive && x.team === 1).length})`);
  const proof = { format: FORMAT, sim: SIM, engine: 'clash-sim', world: spec.world, registry, from: null, entry, started: '2026-01-01T00:00:00.000Z', ticks: E.rec.n, input: encodeInput(E.rec), events: E.rec.events.slice(), claims: E.sim.claims.map((c) => c.slice()), end: null, state: createHash('sha256').update(stateString(E)).digest('hex'), player: { name: 'clash bot' } };
  writeFileSync(join(OUT, `clash-${k}.json`), JSON.stringify(proof));
  E.world.dispose();
}
