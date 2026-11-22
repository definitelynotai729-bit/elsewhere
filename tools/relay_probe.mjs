// Which public relays accept and return proof-sized app-data events? Publishes one test event
// (kind 30078, tag t=elsewhere-test, ~N KB of filler) to each candidate, then reads it back.
// Usage: node tools/relay_probe.mjs [--kb 12] [relay ...]
import { signEvent, publish, query, RUN_KIND } from '../src/engine/nostr.js';
const argv = process.argv.slice(2);
const kbI = argv.indexOf('--kb'); const KB = kbI >= 0 ? +argv.splice(kbI, 2)[1] : 12;
const CANDIDATES = argv.length ? argv : ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nostr.mom', 'wss://offchain.pub', 'wss://relay.nostr.net', 'wss://relay.snort.social', 'wss://nostr.oxtr.dev', 'wss://relay.mostr.pub', 'wss://nostr-pub.wellorder.net'];
const tag = 'probe-' + Date.now().toString(36);
const ev = await signEvent({ kind: RUN_KIND, tags: [['d', tag], ['t', 'elsewhere-test']], content: JSON.stringify({ probe: tag, filler: 'x'.repeat(KB * 1024) }) });
const pub = await publish(ev, CANDIDATES, 10000);
await new Promise((r) => setTimeout(r, 1500));
const back = await Promise.all(CANDIDATES.map(async (relay) => { const q = await query({ kinds: [RUN_KIND], '#t': ['elsewhere-test'], '#d': [tag] }, [relay], 10000); return q.events.length > 0; }));
CANDIDATES.forEach((relay, i) => console.log(`${relay.padEnd(34)} publish ${pub[i].ok ? 'OK ' : 'NO '} ${pub[i].message.slice(0, 60).padEnd(40)} read back ${back[i] ? 'yes' : 'no'}`));
