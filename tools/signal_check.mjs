// Do the relays players meet through still carry Trystero's signalling? For each relay, one connection subscribes to
// a random topic and a second publishes an ephemeral event to it, with Trystero's own createEvent and subscribe. The
// relay passes if it delivers the event. Ephemeral events are not stored, and nothing about a player is sent.
// Exits 1 if fewer than MIN of the game's relays pass (src/engine/relays.js says how to swap one).
// usage: node tools/signal_check.mjs [--all] [relay ...]
//   --all also tries Trystero's built-in list and a few large relays, to find replacements.
import { defaultRelayUrls, createEvent, subscribe } from 'trystero';
import { MEET_RELAYS } from '../src/engine/relays.js';

const MIN = 4;
const argv = process.argv.slice(2);
const all = argv.includes('--all');
const named = argv.filter((a) => a.startsWith('wss://'));
const LARGE = ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.nostr.net', 'wss://nostr.mom', 'wss://relay.primal.net', 'wss://relay.snort.social'];
const urls = named.length ? named : [...new Set([...MEET_RELAYS, ...(all ? [...LARGE, ...defaultRelayUrls] : [])])];

const open = (url) => new Promise((res, rej) => {
  const ws = new WebSocket(url);
  const t = setTimeout(() => { rej(new Error('no connection in 6 s')); try { ws.close(); } catch (e) {} }, 6000);
  ws.onopen = () => { clearTimeout(t); res(ws); };
  ws.onerror = () => { clearTimeout(t); rej(new Error('connection refused or failed')); };
});

async function check(url) {
  const t0 = Date.now(); let a = null, b = null;
  try {
    [a, b] = await Promise.all([open(url), open(url)]);
    const topic = 'elsewhere-signal-check-' + Math.random().toString(36).slice(2);
    let refused = '';
    b.onmessage = (m) => { const d = JSON.parse(m.data); if (d[0] === 'OK' && !d[2]) refused = String(d[3] || 'refused').slice(0, 60); };
    const delivered = new Promise((res) => {
      a.onmessage = (m) => { const d = JSON.parse(m.data); if (d[0] === 'EVENT' && d[1] === 's') res(true); };
      setTimeout(() => res(false), 6000);
    });
    a.send(subscribe('s', topic));
    await new Promise((r) => setTimeout(r, 1200)); // let the subscription settle before publishing
    const t1 = Date.now();
    b.send(await createEvent(topic, 'check'));
    const ok = await delivered;
    return { url, ok, ms: Date.now() - (ok ? t1 : t0), why: ok ? '' : refused ? `publish refused: ${refused}` : 'not delivered' };
  } catch (e) {
    return { url, ok: false, ms: Date.now() - t0, why: e.message };
  } finally {
    for (const s of [a, b]) try { s && s.close(); } catch (e) {}
  }
}

const results = await Promise.all(urls.map(check));
const ours = new Set(MEET_RELAYS);
for (const r of results.sort((x, y) => (y.ok - x.ok) || (x.ms - y.ms))) {
  console.log(`${r.ok ? 'pass' : 'FAIL'} ${ours.has(r.url) ? 'game ' : 'spare'} ${r.url.replace('wss://', '').padEnd(34)} ${r.ok ? r.ms + ' ms' : r.why}`);
}
const passing = results.filter((r) => r.ok && ours.has(r.url)).length;
const total = urls.filter((u) => ours.has(u)).length;
if (total) console.log(`${passing} of the game's ${total} meeting relays carry signalling` + (passing < MIN ? ` (fewer than ${MIN}: swap the failing ones in src/engine/relays.js)` : ''));
process.exitCode = total && passing < MIN ? 1 : 0;
setTimeout(() => process.exit(), 100);
