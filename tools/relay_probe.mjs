// Which public relays can carry the game's runs? For each candidate:
// - publishes a test event of each size (kind 30078, tag t=elsewhere-test, filler content) and reads it back.
//   Real proofs reach ~105 KB as an event (two Crystal Rush runs by 2026-11-24), and many relays cap events at
//   64 KB, so the default sizes are a typical run and the largest;
// - counts the game's runs (t=elsewhere-run) it returns from the last 7 days, read-only.
// Relays treat addresses differently (2026-11-24: relay.nostr.net returned every run here and none to GitHub's
// runners, where the ledger's checker runs), so run it where the checker runs too: the `relays` workflow.
// Usage: node tools/relay_probe.mjs [--kb 4,110] [relay ...]
import { signEvent, publish, query, RUN_KIND, RUN_TAG, RELAYS } from '../src/engine/nostr.js';
const argv = process.argv.slice(2);
const kbI = argv.indexOf('--kb'); const SIZES = (kbI >= 0 ? argv.splice(kbI, 2)[1] : '4,110').split(',').map(Number).filter((x) => x > 0);
const extra = ['wss://relay.snort.social', 'wss://relay.coinos.io', 'wss://relay.flashapp.me', 'wss://nostr.rblb.it', 'wss://relay.angor.io', 'wss://nostr.data.haus', 'wss://purplerelay.com', 'wss://relay.wavlake.com', 'wss://offchain.pub'];
const CANDIDATES = argv.length ? argv : [...RELAYS, ...extra.filter((r) => !RELAYS.includes(r))];
const short = (r) => r.replace('wss://', '');
const cols = new Map(CANDIDATES.map((r) => [r, []]));
for (const kb of SIZES) {
  const tag = 'probe-' + Date.now().toString(36) + '-' + kb;
  const ev = await signEvent({ kind: RUN_KIND, tags: [['d', tag], ['t', 'elsewhere-test']], content: JSON.stringify({ probe: tag, filler: 'x'.repeat(kb * 1024) }) });
  const pub = await publish(ev, CANDIDATES, 10000);
  // some relays index a big event a few seconds after taking it: ask up to three times
  const readBack = async (relay) => {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if ((await query({ kinds: [RUN_KIND], '#t': ['elsewhere-test'], '#d': [tag] }, [relay], 10000)).events.length > 0) return true;
    }
    return false;
  };
  const back = await Promise.all(CANDIDATES.map((relay, i) => (pub[i].ok ? readBack(relay) : false)));
  CANDIDATES.forEach((relay, i) => cols.get(relay).push(`${kb} KB ${pub[i].ok ? (back[i] ? 'stored' : 'took, not returned') : 'refused: ' + pub[i].message.slice(0, 40)}`));
}
const since = Math.floor(Date.now() / 1000) - 7 * 86400;
const runs = await Promise.all(CANDIDATES.map((relay) => query({ kinds: [RUN_KIND], '#t': [RUN_TAG], since }, [relay], 12000)));
CANDIDATES.forEach((relay, i) => {
  const q = runs[i], err = q.relays[0] && q.relays[0].error, ts = q.events.map((e) => e.created_at);
  const newest = ts.length ? new Date(Math.max(...ts) * 1000).toISOString().slice(5, 16).replace('T', ' ') : '';
  cols.get(relay).push(err ? `runs: (${err})` : `runs 7 d: ${String(ts.length).padStart(3)}${newest ? ' newest ' + newest : ''}`);
});
for (const relay of CANDIDATES) console.log(`${(RELAYS.includes(relay) ? '* ' : '  ') + short(relay).padEnd(26)} ${cols.get(relay).map((c) => c.padEnd(30)).join(' ')}`);
console.log('* = a ledger relay now (src/engine/nostr.js RELAYS)');
