// Weekly challenges: each week one world and one of its leaderboard records is featured, with three times (or
// scores) to beat for a gold, silver or bronze medal. A new week starts every Monday at 00:00 UTC.
//
// Leaderboards only: worlds and the engine know nothing of challenges, so nothing here changes a run or its replay.
// The game (weekly.js) and the checker (ledger.js boardsOf, run by tools/ledger.mjs) read this same schedule, so both
// agree on which runs count:
//  - a checked run counts for the week its ledger entry is dated in (when it was sent), if it was played in the
//    featured world and carries the featured record;
//  - each player's best that week decides their medal, one medal per player per week.
//
// Editing rules (tools/challenge_test.mjs checks them):
//  - A challenge that has been featured never changes: its targets decided medals. To change one, add a new id.
//  - Past weeks never change: a new rotation starts at a future week (ROTATIONS), and the ones before it stay.

export const WEEK = 7 * 24 * 3600; // seconds
export const WEEK1 = 1795392000; // Monday 23 November 2026, 00:00 UTC: the first week

// medals: [gold, silver, bronze]. Times are seconds (lower is better) unless better is 'higher'.
// Targets come from the test bots that play like people (NOTES.md, 2026-11-23): see each note.
export const CHALLENGES = {
  'circuit-lap': {
    world: 'circuit', record: 'lap', title: 'Hot lap', where: 'Neon Circuit',
    ask: 'Your fastest lap of Neon Circuit. Step onto the glowing grid to race.',
    medals: [38.5, 41, 50], // bots: 33.4 s with no reaction time, 36.9 at 0.15 s, 38.0 at 0.2 s; par is 41
  },
  'rush-haul': {
    world: 'rush', record: 'crystals', better: 'higher', unit: 'crystals', title: 'Crystal haul', where: 'Crystal Rush',
    ask: 'The most crystals in one 90-second round of Crystal Rush. Step on the glowing pad to start.',
    medals: [25, 18, 12], // the bot that sees every crystal scores 28-34; Echo IV asks 25; the visor comes at 12
  },
  'clash-quick': {
    world: 'clash', record: 'victory', title: 'Quick victory', where: 'Spire Clash',
    ask: 'Win a Spire Clash battle as fast as you can. A win against an eased rival sets no time.',
    medals: [360, 405, 480], // bots: strong 5.8-7.0 min, casual 5.9-7.1, slow 6.2-7.8, geared 5.6-6.3; every win ends by 7:50
  },
  'hub-slimes': {
    world: 'hub', record: 'slimes', title: 'Slime sweep', where: 'Junction',
    ask: 'Sweep three slimes in the pen in Junction\'s training yard. Pim at the shop gives a katana away free.',
    medals: [5, 8, 15], // the scripted bot sweeps in 3.5-4 s
  },
  'lantern-steps': {
    world: 'lv-58aa35c96b', record: 'time', title: 'Lantern Steps', where: 'the Creator\'s Gate',
    ask: 'Run Lantern Steps, a level from the Creator\'s Gate, as fast as you can.',
    medals: [9, 12, 20], // its maker cleared it in 17.8 s; a player's best so far is 8.4 s
  },
};

// which challenge each week features: a rotation runs from its first week until the next rotation starts
export const ROTATIONS = [
  { from: 1, order: ['circuit-lap', 'rush-haul', 'clash-quick', 'hub-slimes', 'lantern-steps'] },
];

export const MEDALS = ['gold', 'silver', 'bronze'];
export const MEDAL_NAMES = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

// the week a time (unix seconds) falls in: 1 is the first; 0 or less is before challenges began
export const weekAt = (sec) => Math.floor((sec - WEEK1) / WEEK) + 1;
export const weekStart = (n) => WEEK1 + (n - 1) * WEEK;

// the challenge featured in week n, or null before the first week
export function challengeOf(n) {
  if (!Number.isInteger(n) || n < 1) return null;
  let rot = null;
  for (const r of ROTATIONS) if (r.from <= n) rot = r;
  if (!rot) return null;
  const id = rot.order[(n - rot.from) % rot.order.length], c = CHALLENGES[id];
  return Object.assign({ id, week: n, start: weekStart(n), end: weekStart(n + 1), better: 'lower' }, c);
}
export const challengeAt = (sec) => challengeOf(weekAt(sec));

// is a better than b for this challenge?
export const beats = (ch, a, b) => (ch.better === 'higher' ? a > b : a < b);
// the medal a time or score earns, or null (records are floats: a hair's width counts as reaching the target)
export function medalOf(ch, v) {
  if (!ch || typeof v !== 'number' || !isFinite(v)) return null;
  const reached = (t) => (ch.better === 'higher' ? v >= t - 1e-6 : v <= t + 1e-6);
  for (let i = 0; i < 3; i++) if (reached(ch.medals[i])) return MEDALS[i];
  return null;
}

// The weekly boards, from the ledger's entries (in ledger order). For every week with at least one counting run:
// the featured challenge, how many players took part, how many medals of each kind, and the ten best (each player's
// best of the week). medals: every player's medals across all weeks, by key. Derived from the ledger alone, so
// anyone recomputing the ledger gets the same boards.
export function weeklyOf(entries) {
  const best = {};
  for (const e of entries) {
    if (!e || e.kind === 'tx' || !Array.isArray(e.records) || typeof e.at !== 'number') continue;
    const n = weekAt(e.at), ch = challengeOf(n);
    if (!ch || e.world !== ch.world) continue;
    for (const r of e.records) {
      if (!r || r.key !== ch.record || typeof r.value !== 'number' || !isFinite(r.value)) continue;
      const B = best[n] || (best[n] = {}), cur = B[e.key];
      if (!cur || beats(ch, r.value, cur.value)) B[e.key] = { value: r.value, name: e.name, key: e.key, seq: e.seq, id: e.id, at: e.at };
    }
  }
  const weeks = {}, medals = {};
  for (const n of Object.keys(best).map(Number).sort((a, b) => a - b)) {
    const ch = challengeOf(n);
    const rows = Object.values(best[n]).sort((a, b) => (ch.better === 'higher' ? b.value - a.value : a.value - b.value) || a.seq - b.seq);
    const count = { gold: 0, silver: 0, bronze: 0 };
    for (const r of rows) {
      const m = medalOf(ch, r.value);
      if (!m) continue;
      r.medal = m; count[m]++;
      const mine = medals[r.key] || (medals[r.key] = { gold: 0, silver: 0, bronze: 0 });
      mine[m]++;
    }
    weeks[n] = { id: ch.id, world: ch.world, record: ch.record, better: ch.better, players: rows.length, medals: count, top: rows.slice(0, 10) };
  }
  return { weeks, medals };
}
