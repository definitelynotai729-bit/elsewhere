// Player feedback (RELEASE.md, the soft launch): a short message to the people making the game, with no account and no
// server. It is encrypted to the team's key and carried by the same public relays as saved runs (a NIP-78 app-data
// event, kind 30078, tagged ["t", "elsewhere-feedback"], from a fresh throwaway key). The relays only ever hold
// ciphertext; tools/feedback.mjs, with the private half of the key (kept off the repo), fetches and reads them.
//
// The seal: ECDH on P-256 with a fresh key per message, HKDF-SHA-256 ("elsewhere-feedback-v1") to an AES-256-GCM key,
// a random 12-byte nonce. Written as "v1.<ephemeral public key>.<nonce>.<ciphertext>", each part base64url. WebCrypto
// does it all, in every browser and in Node 22 (no library). Feedback is not gameplay: nothing here touches a run.
import { signEvent, publish, RUN_KIND, RELAYS } from './nostr.js';

export const FEEDBACK_TAG = 'elsewhere-feedback';
export const FEEDBACK_TEST_TAG = 'elsewhere-test'; // (test messages: the reading tool skips them unless asked)
// The team's public key (P-256, uncompressed point, base64url). The private half lives at ~/.config/elsewhere/feedback-key.json
// on the team's machine, never in the repo.
export const TEAM_KEY = 'BJ_1VmPaOwz6vAN7lHSekG9Iy0AV0ssdefIMAfMuLH6wV0PpDeSsZ9EtD-qrydvG7q4t3Ha0BtYn-XmLycuW0KE';
export const MAX_TEXT = 1000;
export const MOODS = ['love', 'ok', 'meh'];
const INFO = new TextEncoder().encode('elsewhere-feedback-v1');

const b64 = (bytes) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = (str) => { const s = atob(String(str).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };
const subtle = () => globalThis.crypto.subtle;

async function aesKey(bits, usage) {
  const hk = await subtle().importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return subtle().deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO }, hk, { name: 'AES-GCM', length: 256 }, false, [usage]);
}

// What a message holds: the words, a mood (optional), and the little context the Feedback tab names on screen. site:
// where the game is played ('web' on its own page, 'itch' inside itch.io's, 'framed' inside another page; embed.js)
export function feedbackMessage({ text, mood, world, minutes, device, build, site }) {
  const clean = String(text || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, MAX_TEXT);
  return {
    v: 1, text: clean, mood: MOODS.includes(mood) ? mood : null,
    world: typeof world === 'string' ? world.slice(0, 40) : null,
    minutes: Math.max(0, Math.min(100000, Math.round(+minutes || 0))),
    device: device && typeof device === 'object' ? { touch: !!device.touch, w: device.w | 0, h: device.h | 0, browser: String(device.browser || '').slice(0, 20), quality: String(device.quality || '').slice(0, 12) } : null,
    build: String(build || '').slice(0, 16),
    site: typeof site === 'string' && /^[a-z][a-z0-9-]{0,15}$/.test(site) ? site : null,
  };
}

// Encrypt a message (any JSON) to a public key (the team's by default)
export async function sealFeedback(obj, teamKey = TEAM_KEY) {
  const pub = await subtle().importKey('raw', unb64(teamKey), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const eph = await subtle().generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const bits = await subtle().deriveBits({ name: 'ECDH', public: pub }, eph.privateKey, 256);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, await aesKey(bits, 'encrypt'), new TextEncoder().encode(JSON.stringify(obj))));
  const epub = new Uint8Array(await subtle().exportKey('raw', eph.publicKey));
  return `v1.${b64(epub)}.${b64(iv)}.${b64(ct)}`;
}

// Decrypt with the private key (a JWK): the reading tool's half. Throws on anything not sealed to that key, or altered.
export async function openFeedback(sealed, privateJwk) {
  const parts = String(sealed).split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('not a sealed feedback message');
  const priv = await subtle().importKey('jwk', privateJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const epub = await subtle().importKey('raw', unb64(parts[1]), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const bits = await subtle().deriveBits({ name: 'ECDH', public: epub }, priv, 256);
  const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(parts[2]) }, await aesKey(bits, 'decrypt'), unb64(parts[3]));
  return JSON.parse(new TextDecoder().decode(pt));
}

// The event a message travels in (signed by a fresh throwaway key, like a saved run's)
export async function feedbackEvent(msg, { teamKey = TEAM_KEY, test = false } = {}) {
  const content = await sealFeedback(msg, teamKey);
  return signEvent({ kind: RUN_KIND, tags: [['d', test ? 'elsewhere-feedback-test' : 'elsewhere-feedback'], ['t', test ? FEEDBACK_TEST_TAG : FEEDBACK_TAG]], content });
}

// Send it: resolves to { ok, sent, of }, ok when at least one relay took it
export async function sendFeedback(msg, { relays = RELAYS, teamKey = TEAM_KEY, test = false } = {}) {
  const ev = await feedbackEvent(msg, { teamKey, test });
  const res = await publish(ev, relays, 8000);
  const sent = res.filter((r) => r.ok).length;
  return { ok: sent > 0, sent, of: res.length, id: ev.id };
}
