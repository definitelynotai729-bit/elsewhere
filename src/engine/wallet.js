// Wallets: the tradable side of Elsewhere (ECONOMY.md).
//
// Play never creates anything here: bots can play perfectly on unlimited keys, so anything tradable that play made
// would be farmed. Editions are minted by their creators with a fixed supply (cosmetic only, never part of a verified
// run), and they move only by signed transactions:
//   mint  one key creates an edition: a design (a look) and a number of copies, all into its own wallet
//   give  one key sends editions to another (signed by the giver)
//   swap  one trade object, what a gives and what b gives, signed by both: applied whole or not at all
// The validator applies transactions in one order (the ledger's hash chain). Every key numbers its transactions
// (nonce 1, 2, 3…): each applies exactly once, in order, so nothing is spent twice and nothing signed is replayed.
// Signed transactions also expire, at most a week after they are made.
import { canon } from './run.js';
import { sha256hex } from './util.js';
import { verifyText } from './identity.js';
import { checkReward } from './level.js';

export const TX_FORMAT = 'elsewhere-tx/1';
export const TX_TAG = 'elsewhere-tx';
export const WALLET_LIMITS = {
  maxSupply: 1000,       // copies of one edition
  mintsPerKeyPerDay: 3,
  txPerKeyPerDay: 100,
  maxLines: 16,          // different editions on one side of a transaction
  maxCount: 1000,        // copies of one edition in one line
  maxLife: 7 * 86400,    // a signed transaction must expire within a week of being applied
  maxBytes: 16000,
};
const KEY = /^[A-Za-z0-9+/]{43}=$/, SIG = /^[A-Za-z0-9+/]{86}==$/, ED = /^ed-[0-9a-f]{16}$/;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const only = (o, keys) => Object.keys(o).every((k) => keys.includes(k));

// what is signed: the transaction without its signatures
export const txText = (tx) => canon(Object.assign({}, tx, { sig: undefined, sigs: undefined }));
export async function txId(tx) { return (await sha256hex(txText(tx))).slice(0, 24); }
// an edition is named after the transaction that minted it
export const editionOf = (mintId) => 'ed-' + mintId.slice(0, 16);

function checkLines(items, what) {
  if (!isObj(items)) return `${what}: a list of editions and counts`;
  const ids = Object.keys(items);
  if (ids.length > WALLET_LIMITS.maxLines) return `${what}: at most ${WALLET_LIMITS.maxLines} editions`;
  for (const id of ids) if (!ED.test(id) || !isInt(items[id], 1, WALLET_LIMITS.maxCount)) return `${what}: bad line "${id.slice(0, 24)}"`;
  return null;
}

// The shape of a transaction: cheap, before any signature is checked. null, or what is wrong.
export function checkTx(tx) {
  if (!isObj(tx)) return 'not a transaction';
  if (tx.format !== TX_FORMAT) return `not an ${TX_FORMAT} transaction`;
  let size; try { size = canon(tx).length; } catch (e) { return 'unreadable'; }
  if (size > WALLET_LIMITS.maxBytes) return 'too large';
  if (!isInt(tx.expires, 1, 1e11)) return 'bad expiry';
  if (tx.kind === 'mint' || tx.kind === 'give') {
    if (!KEY.test(tx.key || '') || !isInt(tx.nonce, 1, 1e9) || !SIG.test(tx.sig || '')) return 'bad signer, nonce or signature';
    if (tx.kind === 'mint') {
      if (!only(tx, ['format', 'kind', 'key', 'nonce', 'expires', 'design', 'supply', 'sig'])) return 'unknown fields';
      if (!isInt(tx.supply, 1, WALLET_LIMITS.maxSupply)) return `the supply is 1 to ${WALLET_LIMITS.maxSupply} copies`;
      let d; try { d = checkReward(tx.design); } catch (e) { return 'design: ' + e.message.replace(/^reward: /, ''); }
      if (canon(d) !== canon(tx.design)) return 'the design is not in canonical form (normalise it with designOf)'; // one encoding per design
      return null;
    }
    if (!only(tx, ['format', 'kind', 'key', 'nonce', 'expires', 'to', 'items', 'sig'])) return 'unknown fields';
    if (!KEY.test(tx.to || '') || tx.to === tx.key) return 'bad recipient';
    const bad = checkLines(tx.items, 'items'); if (bad) return bad;
    if (!Object.keys(tx.items).length) return 'nothing to give';
    return null;
  }
  if (tx.kind === 'swap') {
    if (!only(tx, ['format', 'kind', 'expires', 'a', 'b', 'sigs'])) return 'unknown fields';
    for (const k of ['a', 'b']) {
      const s = tx[k];
      if (!isObj(s) || !only(s, ['key', 'nonce', 'items']) || !KEY.test(s.key || '') || !isInt(s.nonce, 1, 1e9)) return `bad side ${k}`;
      const bad = checkLines(s.items, `side ${k}`); if (bad) return bad;
    }
    if (tx.a.key === tx.b.key) return 'a swap needs two different keys';
    if (!Object.keys(tx.a.items).length && !Object.keys(tx.b.items).length) return 'nothing to swap';
    if (!isObj(tx.sigs) || !only(tx.sigs, ['a', 'b']) || !SIG.test(tx.sigs.a || '') || !SIG.test(tx.sigs.b || '')) return 'a swap needs both signatures';
    return null;
  }
  return 'unknown kind';
}
// a design in canonical form (what a mint must carry): throws if it is not a valid look
export const designOf = (d) => checkReward(d);

// every signature checks (null), or which one does not
export async function verifyTx(tx) {
  const text = txText(tx);
  const pairs = tx.kind === 'swap' ? [['a', tx.a.key, tx.sigs.a], ['b', tx.b.key, tx.sigs.b]] : [['the', tx.key, tx.sig]];
  for (const [who, k, s] of pairs) if ((await verifyText(k, text, s)) !== true) return `${who === 'the' ? 'the' : 'side ' + who + "'s"} signature does not match`;
  return null;
}

export const emptyWallets = () => ({ keys: {}, editions: {} });
const dayOf = (at) => new Date(at * 1000).toISOString().slice(0, 10);
const view = (W, key) => W.keys[key] || { nonce: 0, items: {} };
const owns = (acct, items) => Object.entries(items).every(([id, n]) => (acct.items[id] || 0) >= n);
function move(from, to, items) {
  for (const [id, n] of Object.entries(items)) {
    from.items[id] -= n; if (!from.items[id]) delete from.items[id];
    to.items[id] = (to.items[id] || 0) + n;
  }
}

// Apply one transaction whose shape and signatures were checked, at time `at` (the validator's clock, unix seconds).
// -> { ok: fields for the ledger entry } | { defer: why } (an earlier transaction of a signer is missing) | { reason }.
// The wallets change only on ok: a transaction applies whole or not at all.
export function applyTx(W, tx, id, at) {
  if (tx.expires < at) return { reason: 'expired' };
  if (tx.expires > at + WALLET_LIMITS.maxLife) return { reason: 'it must expire within a week' };
  const signers = tx.kind === 'swap' ? [tx.a, tx.b] : [tx];
  for (const s of signers) {
    const next = view(W, s.key).nonce + 1;
    if (s.nonce < next) return { reason: `transaction ${s.nonce} of this key was already applied (a replay)` };
    if (s.nonce > next) return { defer: `waiting for transaction ${next} of ${s.key.slice(0, 8)}` };
  }
  const today = dayOf(at), fresh = (a) => a.day !== today;
  for (const s of signers) { const a = view(W, s.key); if (!fresh(a) && a.today >= WALLET_LIMITS.txPerKeyPerDay) return { reason: `daily limit reached (${WALLET_LIMITS.txPerKeyPerDay} transactions per key)` }; }
  if (tx.kind === 'mint') { const a = view(W, tx.key); if (!fresh(a) && a.mints >= WALLET_LIMITS.mintsPerKeyPerDay) return { reason: `mint limit reached (${WALLET_LIMITS.mintsPerKeyPerDay} editions per key per day)` }; }
  if (tx.kind === 'give' && !owns(view(W, tx.key), tx.items)) return { reason: 'the giver does not own all of that' };
  if (tx.kind === 'swap' && !(owns(view(W, tx.a.key), tx.a.items) && owns(view(W, tx.b.key), tx.b.items))) return { reason: 'a side does not own what it offers (nothing moved)' };
  // everything checks: apply
  const touch = (k) => { const a = W.keys[k] || (W.keys[k] = { nonce: 0, items: {} }); if (fresh(a)) { a.day = today; a.today = 0; a.mints = 0; } return a; };
  for (const s of signers) { const a = touch(s.key); a.nonce = s.nonce; a.today++; }
  let edition;
  if (tx.kind === 'mint') {
    edition = editionOf(id);
    const a = touch(tx.key); a.mints++;
    W.editions[edition] = { creator: tx.key, name: tx.design.name, desc: tx.design.desc, slot: tx.design.slot, look: tx.design.look, supply: tx.supply, at };
    a.items[edition] = tx.supply;
  } else if (tx.kind === 'give') move(touch(tx.key), touch(tx.to), tx.items);
  else { const A = touch(tx.a.key), B = touch(tx.b.key); move(A, B, tx.a.items); move(B, A, tx.b.items); }
  return { ok: { tx: tx.kind, keys: signers.map((s) => s.key), to: tx.kind === 'give' ? tx.to : undefined, edition } };
}
// shape, signatures, then the rules: what a validator runs on one transaction
export async function judgeTx(W, tx, id, at) {
  const bad = checkTx(tx); if (bad) return { reason: bad };
  const sig = await verifyTx(tx); if (sig) return { reason: sig };
  return applyTx(W, tx, id, at);
}
