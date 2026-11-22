// A minimal Nostr client (NIP-01) for publishing and fetching proofs of play.
// Nostr relays are independent public servers that store signed events; anyone can run one, and
// anyone can read from them. Proofs travel as NIP-78 app-data events (kind 30078) tagged
// ["t", "elsewhere-run"]. Each event is signed with a fresh throwaway key. What matters is the
// Ed25519 signature inside the proof itself, which ties the run to the player.
// Works in browsers and in Node 22 (global WebSocket and crypto.subtle).
import { schnorr, utils } from '@noble/secp256k1';

export const RUN_KIND = 30078;
export const RUN_TAG = 'elsewhere-run';
// Relays that accept, keep and return these events from a fresh key (checked with tools/relay_probe.mjs;
// some relays refuse keys outside their web of trust). Any of them can be swapped for another.
export const RELAYS = ['wss://nos.lol', 'wss://relay.primal.net', 'wss://relay.nostr.net', 'wss://nostr.mom', 'wss://relay.damus.io'];

const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));
async function sha256(bytes) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)); }

export async function eventId(ev) {
  return hex(await sha256(new TextEncoder().encode(JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]))));
}
// sk: an optional secret key (bytes), so the chunks of one upload share a signer; otherwise a fresh one
export async function signEvent({ kind, tags, content, created_at }, sk = utils.randomSecretKey()) {
  const ev = { pubkey: hex(schnorr.getPublicKey(sk)), created_at: created_at || Math.floor(Date.now() / 1000), kind, tags, content };
  ev.id = await eventId(ev);
  ev.sig = hex(await schnorr.signAsync(unhex(ev.id), sk));
  return ev;
}
export async function checkEvent(ev) {
  if (!ev || typeof ev.id !== 'string' || typeof ev.content !== 'string' || !Array.isArray(ev.tags)) return false;
  return (await eventId(ev)) === ev.id;
}

function open(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    let ws;
    try { ws = new WebSocket(url); } catch (e) { reject(e); return; }
    const t = setTimeout(() => { try { ws.close(); } catch (e) {} reject(new Error('timeout')); }, timeoutMs);
    ws.onopen = () => { clearTimeout(t); resolve(ws); };
    ws.onerror = () => { clearTimeout(t); reject(new Error('connection failed')); };
  });
}

// Publish to every relay at once. Resolves to [{ relay, ok, message }].
export async function publish(ev, relays = RELAYS, timeoutMs = 8000) {
  return Promise.all(relays.map(async (relay) => {
    let ws;
    try {
      ws = await open(relay, timeoutMs);
      const res = await new Promise((resolve) => {
        const t = setTimeout(() => resolve({ ok: false, message: 'no answer' }), timeoutMs);
        ws.onmessage = (m) => {
          let d; try { d = JSON.parse(m.data); } catch (e) { return; }
          if (d[0] === 'OK' && d[1] === ev.id) { clearTimeout(t); resolve({ ok: d[2] === true, message: String(d[3] || '') }); }
        };
        ws.send(JSON.stringify(['EVENT', ev]));
      });
      return Object.assign({ relay }, res);
    } catch (e) { return { relay, ok: false, message: e.message }; }
    finally { try { ws && ws.close(); } catch (e) {} }
  }));
}

// Fetch matching events from every relay until each sends EOSE (or times out). Deduplicated by id;
// only events whose id matches their content are kept. Resolves to { events, relays: [{ relay, n, error }] }.
export async function query(filter, relays = RELAYS, timeoutMs = 12000) {
  const seen = new Map(), stats = [];
  await Promise.all(relays.map(async (relay) => {
    const st = { relay, n: 0, error: null }; stats.push(st);
    let ws;
    try {
      ws = await open(relay, timeoutMs);
      const sub = 'q' + Math.random().toString(36).slice(2, 10);
      await new Promise((resolve) => {
        const t = setTimeout(() => { st.error = 'timeout before EOSE'; resolve(); }, timeoutMs);
        ws.onmessage = async (m) => {
          let d; try { d = JSON.parse(m.data); } catch (e) { return; }
          if (d[0] === 'EVENT' && d[1] === sub && d[2] && !seen.has(d[2].id)) { st.n++; if (await checkEvent(d[2])) seen.set(d[2].id, Object.assign({ relay }, d[2])); }
          else if (d[0] === 'EOSE' && d[1] === sub) { clearTimeout(t); resolve(); }
          else if (d[0] === 'CLOSED' && d[1] === sub) { clearTimeout(t); st.error = String(d[2] || 'closed'); resolve(); }
        };
        ws.send(JSON.stringify(['REQ', sub, filter]));
      });
      try { ws.send(JSON.stringify(['CLOSE', sub])); } catch (e) {}
    } catch (e) { st.error = e.message; }
    finally { try { ws && ws.close(); } catch (e) {} }
  }));
  return { events: [...seen.values()], relays: stats };
}
export const newSecretKey = () => utils.randomSecretKey();
