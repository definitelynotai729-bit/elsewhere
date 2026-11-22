// Blobs: content-addressed bytes (uploaded models), kept by players' browsers and the public relays, never by the
// site. A blob's name is the SHA-256 of its bytes and every copy is checked against it, so a relay can lose a
// blob but never change one. Transport: gzip, then base64 chunks in Nostr app-data events (kind 30078) tagged
// ['t','elsewhere-blob'], ['x', sha256], ['i', index], ['n', count]. All chunks of one upload share a throwaway
// signing key, so a reader can tell one upload's chunks from anyone else's and skip copies that do not verify.
import { query, publish, signEvent, newSecretKey, RUN_KIND, RELAYS } from './nostr.js';
import { sha256bytes, decodeMesh, meshGeometry, MESH_LIMITS } from './mesh.js';
import { gunzipCapped } from './util.js';

export const BLOB_TAG = 'elsewhere-blob';
const CHUNK = 32000; // base64 characters per event: well inside what the relays accept
const isSha = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);

async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };

// a tiny IndexedDB key-value store (browser only; anything going wrong just means no cache)
function idb() {
  if (typeof indexedDB === 'undefined') return null;
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('elsewhere-blobs', 1); r.onupgradeneeded = () => r.result.createObjectStore('blobs'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = (mode, f) => db().then((d) => new Promise((res, rej) => { const t = d.transaction('blobs', mode), st = t.objectStore('blobs'), q = f(st); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
  return { get: (k) => tx('readonly', (s) => s.get(k)).catch(() => null), put: (k, v) => tx('readwrite', (s) => s.put(v, k)).catch(() => null) };
}

export function createBlobs(opts = {}) {
  const relays = opts.relays || RELAYS, mem = new Map(), geos = new Map(), store = opts.noCache ? null : idb();
  const B = {
    // keep bytes we made or fetched (checked against their name first)
    async put(bytes) {
      const sha = await sha256bytes(bytes);
      mem.set(sha, bytes); if (store) await store.put(sha, bytes);
      return sha;
    },
    async local(sha) {
      if (mem.has(sha)) return mem.get(sha);
      const b = store ? await store.get(sha) : null;
      if (b instanceof Uint8Array && (await sha256bytes(b)) === sha) { mem.set(sha, b); return b; }
      return null;
    },
    // from the relays: every upload's chunks, reassembled and checked; the first that matches wins
    async fetch(sha, timeoutMs = 9000) {
      if (!isSha(sha)) throw new Error('a blob is named by its SHA-256');
      const q = await query({ kinds: [RUN_KIND], '#x': [sha], limit: 200 }, relays, timeoutMs);
      const ups = new Map();
      for (const ev of q.events) {
        const tag = (k) => { const t = ev.tags.find((x) => x[0] === k); return t ? t[1] : null; };
        if (tag('t') !== BLOB_TAG || tag('x') !== sha) continue;
        const i = +tag('i'), n = +tag('n');
        if (!Number.isInteger(i) || !Number.isInteger(n) || n < 1 || n > 64 || i < 0 || i >= n) continue;
        const u = ups.get(ev.pubkey + ':' + n) || ups.set(ev.pubkey + ':' + n, { n, parts: [] }).get(ev.pubkey + ':' + n);
        u.parts[i] = ev.content;
      }
      for (const u of ups.values()) {
        if (u.parts.filter((x) => typeof x === 'string').length !== u.n) continue;
        try {
          const bytes = await gunzipCapped(unb64(u.parts.join('')), MESH_LIMITS.bytes); // capped: no decompression bombs
          if ((await sha256bytes(bytes)) === sha) return bytes;
        } catch (e) {}
      }
      return null;
    },
    // local copy, or the relays (and keep what they give)
    async get(sha) {
      const b = (await B.local(sha)) || (await B.fetch(sha));
      if (b && !mem.has(sha)) await B.put(b);
      return b;
    },
    // send one blob to the relays; resolves to how many relays took every chunk
    async publish(sha) {
      const bytes = await B.local(sha);
      if (!bytes) throw new Error('that model is not in this browser');
      const text = b64(await pipe(bytes, new CompressionStream('gzip')));
      const n = Math.ceil(text.length / CHUNK), sk = newSecretKey();
      if (n > 64) throw new Error('too large to send');
      const evs = [];
      for (let i = 0; i < n; i++) evs.push(await signEvent({ kind: RUN_KIND, tags: [['d', `${BLOB_TAG}:${sha}:${i}`], ['t', BLOB_TAG], ['x', sha], ['i', String(i)], ['n', String(n)], ['enc', 'gzip+base64']], content: text.slice(i * CHUNK, (i + 1) * CHUNK) }, sk));
      const ok = new Map();
      for (const ev of evs) for (const r of await publish(ev, relays)) if (r.ok) ok.set(r.relay, (ok.get(r.relay) || 0) + 1);
      return [...ok.values()].filter((c) => c === n).length;
    },
    // a model as a shared geometry (cached; kept across worlds)
    mesh(sha) {
      if (!geos.has(sha)) geos.set(sha, (async () => {
        const bytes = await B.get(sha);
        if (!bytes) throw new Error('model ' + sha.slice(0, 10) + ' is not on the relays');
        const g = meshGeometry(decodeMesh(bytes));
        g.userData.keep = true; g.userData.colored = !!g.attributes.color;
        return g;
      })().catch((e) => { geos.delete(sha); throw e; }));
      return geos.get(sha);
    },
  };
  return B;
}
