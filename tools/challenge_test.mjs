// Weekly challenges (src/engine/challenges.js): the schedule, the medals and the weekly boards the checker publishes.
//  - past weeks never change (the first weeks' challenges are pinned below: a new rotation must start at a future week);
//  - every challenge names a real world and a record that world posts, with three targets in order;
//  - a run counts for the week its entry is dated in, in the featured world, with the featured record; each player's
//    best of the week decides one medal;
//  - the boards published in docs/ledger/boards.json match the schedule.
// usage: node tools/challenge_test.mjs [-v]
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEEK, WEEK1, CHALLENGES, ROTATIONS, MEDALS, weekAt, weekStart, challengeOf, challengeAt, medalOf, weeklyOf } from '../src/engine/challenges.js';
import { boardsOf } from '../src/engine/ledger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('-v');
let bad = 0, checks = 0;
const ok = (cond, what) => { checks++; if (!cond) { bad++; console.log('FAIL', what); } else if (verbose) console.log('ok  ', what); };
const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

// ---- the calendar: week 1 starts on a Monday at 00:00 UTC; weeks are 7 days
const d1 = new Date(WEEK1 * 1000);
ok(d1.getUTCDay() === 1 && d1.getUTCHours() === 0 && d1.getUTCMinutes() === 0 && d1.getUTCSeconds() === 0, 'week 1 starts on a Monday at 00:00 UTC');
ok(weekAt(WEEK1 - 1) === 0 && weekAt(WEEK1) === 1 && weekAt(WEEK1 + WEEK - 1) === 1 && weekAt(WEEK1 + WEEK) === 2, 'week boundaries');
ok(weekStart(1) === WEEK1 && weekStart(5) === WEEK1 + 4 * WEEK, 'week starts');
ok(challengeOf(0) === null && challengeOf(-3) === null && challengeOf(1.5) === null && challengeAt(WEEK1 - 10) === null, 'no challenge before week 1');

// ---- past weeks are pinned: this list only ever grows (append the weeks a new rotation decides as they pass)
const PINNED = ['circuit-lap', 'rush-haul', 'clash-quick', 'hub-slimes', 'lantern-steps', 'circuit-lap', 'rush-haul', 'clash-quick', 'hub-slimes', 'lantern-steps'];
PINNED.forEach((id, i) => ok(challengeOf(i + 1) && challengeOf(i + 1).id === id, `week ${i + 1} is ${id}`));
const nowWeek = weekAt(Math.floor(Date.now() / 1000));
for (let n = 1; n <= nowWeek + 52; n++) { const c = challengeOf(n); if (!c || !CHALLENGES[c.id]) { ok(false, `week ${n} has a challenge`); break; } }
ok(ROTATIONS.every((r, i) => Number.isInteger(r.from) && r.from >= 1 && (i === 0 || r.from > ROTATIONS[i - 1].from) && r.order.length && r.order.every((id) => CHALLENGES[id])), 'rotations start in order and name known challenges');
for (const r of ROTATIONS) ok(r.from <= PINNED.length + 1 || r.from > nowWeek, `the rotation from week ${r.from} has started: pin the weeks it decided in PINNED`);

// ---- every challenge: a real world, a record it posts, three targets in order
const registry = json('docs/worlds/registry.json').worlds;
const community = existsSync(join(root, 'docs/ledger/worlds.json')) ? json('docs/ledger/worlds.json').worlds : [];
for (const [id, c] of Object.entries(CHALLENGES)) {
  ok(typeof c.title === 'string' && c.title && typeof c.ask === 'string' && c.ask && typeof c.where === 'string' && c.where, `${id}: title, ask and where`);
  ok(c.better === undefined || c.better === 'higher' || c.better === 'lower', `${id}: better is lower or higher`);
  const hi = c.better === 'higher';
  ok(Array.isArray(c.medals) && c.medals.length === 3 && c.medals.every((v) => typeof v === 'number' && isFinite(v) && v > 0) && (hi ? c.medals[0] > c.medals[1] && c.medals[1] > c.medals[2] : c.medals[0] < c.medals[1] && c.medals[1] < c.medals[2]), `${id}: gold beats silver beats bronze`);
  if (/^lv-/.test(c.world)) {
    ok(community.some((w) => w.id === c.world), `${id}: community level ${c.world} is on the ledger`);
    ok(c.record === 'time' && !hi, `${id}: a level's record is its clear time`);
  } else {
    const w = registry.find((x) => x.id === c.world);
    ok(!!w, `${id}: world ${c.world} is in the registry`);
    const src = readFileSync(join(root, 'src/worlds', c.world + '.js'), 'utf8');
    const m = [...src.matchAll(/w\.record\('([a-z0-9-]+)'([^;]*)\);/g)].find((x) => x[1] === c.record);
    ok(!!m, `${id}: ${c.world} posts the record "${c.record}"`);
    if (m) ok(/better: 'higher'/.test(m[2]) === hi, `${id}: the record's better (${hi ? 'higher' : 'lower'}) matches the world's`);
  }
}

// ---- medals
const lap = challengeOf(1), haul = challengeOf(2);
ok(medalOf(lap, 38.5) === 'gold' && medalOf(lap, 38.5000000001) === 'gold' && medalOf(lap, 38.51) === 'silver' && medalOf(lap, 41) === 'silver' && medalOf(lap, 50) === 'bronze' && medalOf(lap, 50.01) === null, 'medals for times (lower is better)');
ok(medalOf(haul, 25) === 'gold' && medalOf(haul, 24) === 'silver' && medalOf(haul, 18) === 'silver' && medalOf(haul, 12) === 'bronze' && medalOf(haul, 11) === null, 'medals for scores (higher is better)');
ok(medalOf(lap, NaN) === null && medalOf(lap, Infinity) === null && medalOf(lap, '38') === null && medalOf(null, 30) === null, 'no medal for nonsense');

// ---- the weekly boards, from synthetic ledger entries
const at = (week, h = 1) => weekStart(week) + h * 3600;
const run = (seq, key, world, recs, when, extra = {}) => Object.assign({ seq, id: 'id' + seq, key, name: 'P' + key, world, records: recs.map(([k, v, b]) => ({ key: k, value: v, better: b || 'lower' })), items: [], at: when }, extra);
const E = [
  run(1, 'a', 'circuit', [['lap', 45]], WEEK1 - 60), // before week 1: not counted
  run(2, 'a', 'circuit', [['lap', 44], ['lap', 39.9]], at(1)), // two laps in one visit: the better one
  run(3, 'b', 'circuit', [['lap', 38.4]], at(1, 30)),
  run(4, 'c', 'circuit', [['lap', 60]], at(1, 40)), // no medal, still on the board
  run(5, 'b', 'circuit', [['lap', 40]], at(1, 50)), // worse than b's best: b keeps 38.4
  run(6, 'd', 'hub', [['slimes', 4]], at(1, 60)), // not the featured world this week
  run(7, 'e', 'circuit', [['split', 10]], at(1, 61)), // not the featured record
  run(8, 'f', 'circuit', [['lap', 39.9]], at(1, 62)), // ties a's 39.9: a's came first
  { seq: 9, id: 'tx9', kind: 'tx', at: at(1, 63) }, // a transaction: no records
  run(10, 'a', 'circuit', [['lap', 30]], at(2)), // a lap in week 2 (Crystal Rush week): not counted
  run(11, 'a', 'rush', [['crystals', 26, 'higher']], at(2, 5)),
  run(12, 'b', 'rush', [['crystals', 13, 'higher']], at(2, 6)),
  run(13, 'b', 'rush', [['crystals', 19, 'higher']], at(2, 7)),
  run(14, 'g', 'rush', [['crystals', 2, 'higher']], WEEK1 + 2 * WEEK - 1), // the last second of week 2
];
const W = weeklyOf(E);
const w1 = W.weeks[1], w2 = W.weeks[2];
ok(Object.keys(W.weeks).join() === '1,2', 'boards for weeks 1 and 2 only');
ok(w1 && w1.id === 'circuit-lap' && w1.players === 4 && w1.top.map((r) => r.key).join() === 'b,a,f,c', 'week 1: each player\'s best, best first, ties by ledger order');
ok(w1 && w1.top[0].value === 38.4 && w1.top[0].medal === 'gold' && w1.top[1].value === 39.9 && w1.top[1].medal === 'silver' && !w1.top[3].medal, 'week 1: values and medals');
ok(w1 && w1.medals.gold === 1 && w1.medals.silver === 2 && w1.medals.bronze === 0, 'week 1: medal counts');
ok(w2 && w2.id === 'rush-haul' && w2.top.map((r) => `${r.key}${r.value}`).join() === 'a26,b19,g2' && w2.top[1].medal === 'silver' && w2.medals.gold === 1, 'week 2: higher is better, best per player, the last second counts');
ok(W.medals.a && W.medals.a.gold === 1 && W.medals.a.silver === 1 && W.medals.b.gold === 1 && W.medals.b.silver === 1 && !W.medals.c && !W.medals.g, 'medals across weeks, one per player per week');
const many = Array.from({ length: 25 }, (_, i) => run(100 + i, 'k' + i, 'circuit', [['lap', 40 + i]], at(1)));
const Wm = weeklyOf(many);
ok(Wm.weeks[1].top.length === 10 && Wm.weeks[1].players === 25, 'the board keeps the ten best and counts everyone');
ok(JSON.stringify(weeklyOf(E)) === JSON.stringify(W), 'the same entries give the same boards');

// ---- the published boards (docs/ledger/boards.json) match the schedule
const ledger = json('docs/ledger/ledger.json');
const B = boardsOf(ledger);
const pub = json('docs/ledger/boards.json');
ok(B.weekly && B.medals && JSON.stringify(pub.weekly) === JSON.stringify(B.weekly) && JSON.stringify(pub.medals) === JSON.stringify(B.medals), `docs/ledger/boards.json has this schedule's weekly boards (run node tools/ledger.mjs --file to refresh them)`);

console.log(`${checks} checks; ${Object.keys(CHALLENGES).length} challenges; week ${nowWeek} is ${challengeOf(nowWeek) ? challengeOf(nowWeek).id : 'none'}: ${bad ? bad + ' FAILED' : 'ALL OK'}`);
process.exitCode = bad ? 1 : 0;
