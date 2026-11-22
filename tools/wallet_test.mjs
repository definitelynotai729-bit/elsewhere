// Wallets (G9 E1, ECONOMY.md): editions, gifts and swaps through the real validator. Runs in CI.
//
// Each check sends signed transactions to tools/ledger.mjs (in a throwaway copy of the site) and reads the
// wallets it derives. Covered: minting with a fixed supply, gifts, swaps applied whole or not at all, double
// spends, replays, out-of-order nonces, forged and altered signatures, expiry, limits, soulbound items (never
// tradable), and a rebuild that recomputes the same wallets from the archive.
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ensureKey, signText } from '../src/engine/identity.js';
import { TX_FORMAT, txText, txId, editionOf, designOf } from '../src/engine/wallet.js';
import { nextCursor } from '../src/engine/ledger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0, n = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? ' · ' + detail : ''}`); if (!ok) fails++; };
const clone = (v) => JSON.parse(JSON.stringify(v));

// a copy of the site with only what the validator reads for transactions (and the real ledger, to build on)
const tmp = mkdtempSync(join(tmpdir(), 'ew-wallet-')), site = join(tmp, 'docs');
mkdirSync(site, { recursive: true });
for (const d of ['ledger', 'worlds', 'engines']) cpSync(join(root, 'docs', d), join(site, d), { recursive: true });
function validate(txs, at) {
  const files = txs.map((t) => { const f = join(tmp, `t${n++}.json`); writeFileSync(f, JSON.stringify(t)); return f; });
  const r = spawnSync('node', [join(root, 'tools/ledger.mjs'), '--docs', site, '--at', String(at), '--file', ...files], { encoding: 'utf8' });
  if (r.status) throw new Error('validator crashed: ' + r.stderr);
  return r.stdout.split('\n').filter((l) => /^(ACCEPT|REJECT|defer|skip)/.test(l));
}
const wallets = () => JSON.parse(readFileSync(join(site, 'ledger/wallets.json'), 'utf8'));
const owned = (k, ed) => ((wallets().keys[k.pub] || { items: {} }).items[ed] || 0);
const acc = (lines) => lines.filter((l) => l.startsWith('ACCEPT')).length;
const rej = (lines) => lines.filter((l) => l.startsWith('REJECT'));

const newKey = async () => ensureKey({ data: {}, save() {} });
const A = await newKey(), B = await newKey(), C = await newKey();
const T0 = 1795500000; // the validator's clock for these tests (2026-11-23)
let at = T0;
const nonces = new Map();
const next = (k) => { const v = (nonces.get(k.pub) || 0) + 1; nonces.set(k.pub, v); return v; };
const sign1 = async (tx, k) => Object.assign(tx, { sig: await signText(k, txText(tx)) });
const mint = async (k, name, supply, nonce = next(k)) => sign1({ format: TX_FORMAT, kind: 'mint', key: k.pub, nonce, expires: at + 3600, design: designOf({ name, slot: 'head', look: [{ s: 'sphere', r: 0.2, color: '#ffd166' }] }), supply }, k);
const give = async (k, to, items, nonce = next(k)) => sign1({ format: TX_FORMAT, kind: 'give', key: k.pub, nonce, expires: at + 3600, to: to.pub, items }, k);
async function swap(a, aItems, b, bItems) {
  const tx = { format: TX_FORMAT, kind: 'swap', expires: at + 3600, a: { key: a.pub, nonce: next(a), items: aItems }, b: { key: b.pub, nonce: next(b), items: bItems } };
  const text = txText(tx);
  return Object.assign(tx, { sigs: { a: await signText(a, text), b: await signText(b, text) } });
}

// 1. minting: a fixed supply, all to the creator
const m1 = await mint(A, 'Founder Halo', 10), X = editionOf(await txId(m1));
let out = validate([m1], at);
const ed = wallets().editions[X];
check(acc(out) === 1 && owned(A, X) === 10 && ed && ed.creator === A.pub && ed.supply === 10, 'a creator mints an edition: a fixed number of copies, all in their wallet', `${X}: ${owned(A, X)} copies`);

// 2. a gift
out = validate([await give(A, B, { [X]: 3 })], at);
check(acc(out) === 1 && owned(A, X) === 7 && owned(B, X) === 3, 'a gift moves copies from one wallet to another', `A ${owned(A, X)}, B ${owned(B, X)}`);

// 3. double spends: one nonce signed twice (to B and to C); then two gifts that together exceed what A owns
const n3 = next(A);
out = validate([await give(A, B, { [X]: 1 }, n3), await give(A, C, { [X]: 1 }, n3)], at);
check(acc(out) === 1 && rej(out).length === 1 && /already applied/.test(rej(out)[0]), 'the same nonce signed twice: only one applies (no double spend)', rej(out)[0]);
out = validate([await give(A, C, { [X]: 6 }), await give(A, C, { [X]: 6 })], at);
check(acc(out) === 1 && rej(out).length === 1 && /does not own/.test(rej(out)[0]) && owned(A, X) === 0 && owned(C, X) === 6, 'gifts beyond what the wallet holds are refused (balances never go negative)', `A ${owned(A, X)}, C ${owned(C, X)}`);
// (the refused gift still used its nonce? no: refused transactions change nothing, so A's next nonce is the same)
nonces.set(A.pub, wallets().keys[A.pub].nonce);

// 4. replays: the same transaction again (another event), and an old nonce
const g4 = await give(B, C, { [X]: 1 });
out = validate([g4], at);
const out4 = validate([clone(g4)], at);
check(acc(out) === 1 && out4.length === 1 && /already in the ledger/.test(out4[0]) && owned(C, X) === 7, 'a transaction sent again applies once', out4[0]);

// 5. nonces out of order: the later one waits for the earlier
const g5a = await give(C, B, { [X]: 1 }), g5b = await give(C, B, { [X]: 1 });
out = validate([g5b], at);
const out5 = validate([g5a], at);
const out5b = validate([g5b], at); // the next validator run picks the deferred one up again (from the relays, in production)
check(out.some((l) => l.startsWith('defer')) && acc(out5) === 1 && acc(out5b) === 1 && owned(C, X) === 5, 'a transaction that arrives before an earlier one of its key waits, then applies in order', `C ${owned(C, X)}`);

// 6. forgery: C signs a gift out of A's wallet
const f6 = { format: TX_FORMAT, kind: 'give', key: B.pub, nonce: wallets().keys[B.pub].nonce + 1, expires: at + 3600, to: C.pub, items: { [X]: 1 } };
f6.sig = await signText(C, txText(f6));
out = validate([f6], at);
check(rej(out).length === 1 && /signature/.test(rej(out)[0]), "a gift out of someone else's wallet, signed by another key, is refused", rej(out)[0]);

// 7. a swap: B trades 1 Founder Halo for 2 of C's... C mints its own edition first
const m7 = await mint(C, 'Glass Crown', 5), Y = editionOf(await txId(m7));
validate([m7], at);
nonces.set(B.pub, wallets().keys[B.pub].nonce);
const s7 = await swap(B, { [X]: 1 }, C, { [Y]: 2 });
const bX = owned(B, X), cX = owned(C, X);
out = validate([s7], at);
check(acc(out) === 1 && owned(B, X) === bX - 1 && owned(C, X) === cX + 1 && owned(B, Y) === 2 && owned(C, Y) === 3, 'a swap moves both sides at once', `B: ${owned(B, X)} halo, ${owned(B, Y)} crowns`);

// 8. a swap altered after both signed (one more crown for B): no valid signatures
const s8 = await swap(B, { [X]: 1 }, C, { [Y]: 1 });
const t8 = clone(s8); t8.b.items[Y] = 3;
out = validate([t8], at);
check(rej(out).length === 1 && /signature/.test(rej(out)[0]), 'a swap altered after signing is refused', rej(out)[0]);
nonces.set(B.pub, wallets().keys[B.pub].nonce); nonces.set(C.pub, wallets().keys[C.pub].nonce);

// 9. a swap where one side lacks what it offers: refused, and nothing moves on either side
const before = clone(wallets().keys);
const s9 = await swap(B, { [X]: 1 }, C, { [Y]: 50 });
out = validate([s9], at);
const after = wallets().keys;
check(rej(out).length === 1 && /nothing moved/.test(rej(out)[0]) && JSON.stringify(after[B.pub].items) === JSON.stringify(before[B.pub].items) && JSON.stringify(after[C.pub].items) === JSON.stringify(before[C.pub].items), 'a swap one side cannot cover applies not at all (no half trades)', rej(out)[0]);
nonces.set(B.pub, wallets().keys[B.pub].nonce); nonces.set(C.pub, wallets().keys[C.pub].nonce);

// 10. expiry: applied after it expired, or signed to last more than a week
const e10 = await give(B, C, { [X]: 1 });
out = validate([e10], at + 7200);
nonces.set(B.pub, wallets().keys[B.pub].nonce);
const e10b = await sign1({ format: TX_FORMAT, kind: 'give', key: B.pub, nonce: next(B), expires: at + 30 * 86400, to: C.pub, items: { [X]: 1 } }, B);
const out10 = validate([e10b], at);
nonces.set(B.pub, wallets().keys[B.pub].nonce);
check(rej(out).length === 1 && /expired/.test(rej(out)[0]) && rej(out10).length === 1 && /within a week/.test(rej(out10)[0]), 'expired transactions, and ones signed to last over a week, are refused', `${rej(out)[0].slice(-7)}; ${rej(out10)[0].slice(-26)}`);

// 11. limits: a fourth mint in a day; a supply over the cap; soulbound items (play rewards) are not editions
const mints = [await mint(A, 'Second', 5), await mint(A, 'Third', 5), await mint(A, 'Fourth', 5)];
out = validate(mints, at);
const big = await mint(B, 'Too many', 5000);
const sb = await give(B, C, { katana: 1 });
const out11 = validate([big, sb], at);
check(acc(out) === 2 && /mint limit/.test(rej(out)[0] || '') && rej(out11).length === 2 && /supply/.test(rej(out11)[0]) && /bad line/.test(rej(out11)[1]),
  'mint limits hold, and soulbound items (a katana earned by play) can never be traded', `${rej(out)[0].slice(-40)}; ${rej(out11)[1].slice(-30)}`);

// 12. the rebuild recomputes the same wallets from the archived transactions
const live = readFileSync(join(site, 'ledger/wallets.json'), 'utf8');
const rb = spawnSync('node', [join(root, 'tools/ledger.mjs'), '--docs', site, '--rebuild'], { encoding: 'utf8' });
check(rb.status === 0 && readFileSync(join(site, 'ledger/wallets.json'), 'utf8') === live, 'a rebuild from the archive recomputes the same wallets (every head matches)', rb.stdout.trim().split('\n').pop() || rb.stderr.slice(-200));

// 13. the relay cursor cannot be carried into the future by an event with a far-future time
const cur = nextCursor(T0 - 600, [T0 - 300, T0 + 10 * 365 * 86400], [], T0);
check(cur === T0, 'a far-future event cannot carry the relay cursor past the validator\'s clock', `cursor ${cur - T0} s from now`);

rmSync(tmp, { recursive: true, force: true });
console.log(fails ? `${fails} FAILED` : 'WALLETS OK');
process.exitCode = fails ? 1 : 0;
