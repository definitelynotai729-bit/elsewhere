// Players' chains, for the daily review: for every player who sent runs recently, the ledger's verified run against
// the newest run they sent, and any of theirs the checker refused. A chain that stays behind the newest run sent is
// a player whose visits are not being saved.
//
// Found 2026-11-25: one refused visit (a game left behind by an update) and the checker refused every later visit of
// that player as "the previous run never arrived", for a day, before anyone looked. The game now notices a refusal
// and continues from the verified state (main.js E.checkLedger); this shows whether any player is stuck anyway.
//
// usage: node tools/chains.mjs [--hours 48] [--docs docs]   (reads the relays; writes nothing)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, RUN_KIND, RUN_TAG, RELAYS } from '../src/engine/nostr.js';
import { unpackProof, proofIdOf } from '../src/engine/ledger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const docs = arg('--docs', join(root, 'docs')), hours = +arg('--hours', 48);
const read = (f, d) => { try { return JSON.parse(readFileSync(join(docs, 'ledger', f), 'utf8')); } catch (e) { return d; } };
const states = read('states.json', { keys: {} }).keys || {};
const refused = new Map((read('rejected.json', { list: [] }).list || []).map((x) => [x.id, x]));

const since = Math.floor(Date.now() / 1000) - hours * 3600;
const q = await query({ kinds: [RUN_KIND], '#t': [RUN_TAG], since, limit: 1000 }, RELAYS, 15000);
console.log('relays:', q.relays.map((r) => `${r.relay.replace('wss://', '')} ${r.error ? '(' + r.error + ')' : r.n}`).join(', '));
const players = new Map();
for (const ev of q.events) {
  let p; try { p = await unpackProof(ev.content); } catch (e) { continue; }
  if (!p || !p.player || !p.player.key || !p.chain) continue;
  const id = await proofIdOf(p), k = p.player.key;
  if (!players.has(k)) players.set(k, { name: p.player.name || '?', runs: [] });
  players.get(k).runs.push({ seq: p.chain.seq, id, world: p.world && p.world.id, at: ev.created_at, sim: String(p.sim || '').slice(0, 8) });
}
const when = (t) => new Date(t * 1000).toISOString().slice(5, 16).replace('T', ' ');
let stuck = 0;
for (const [k, pl] of players) {
  const runs = pl.runs.sort((a, b) => a.seq - b.seq), st = states[k], vs = st ? st.seq : 0, last = runs[runs.length - 1];
  const bad = runs.filter((r) => refused.has(r.id));
  const behind = runs.filter((r) => r.seq > vs);
  const line = `${pl.name.padEnd(12)} ${k.slice(0, 8)}  verified ${String(vs).padStart(3)}  newest sent ${String(last.seq).padStart(3)} (${last.world}, ${when(last.at)} UTC, engine ${last.sim})`;
  if (!behind.length) { console.log('ok     ' + line); continue; }
  const first = behind[0], dead = bad.find((r) => r.seq > vs);
  if (dead) {
    stuck++;
    console.log('STUCK  ' + line);
    console.log(`       refused run ${dead.seq} (${dead.world}, ${when(dead.at)} UTC): ${refused.get(dead.id).reason}`);
    console.log(`       ${behind.length} run(s) after the verified one can't be accepted; a game with the 2026-11-25 fix continues from the verified state on its next trip`);
  } else console.log(`wait   ${line}  (${behind.length} waiting; the oldest sent ${when(first.at)} UTC)`);
}
if (!players.size) console.log(`no runs on the relays in the last ${hours} h`);
console.log(stuck ? `${stuck} player(s) with a stuck chain` : 'no stuck chains');
process.exitCode = 0;
