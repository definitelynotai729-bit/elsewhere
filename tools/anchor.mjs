// Anchor the ledger in Bitcoin: timestamp every new head with OpenTimestamps, so nobody (the operator, or someone
// with the repository) can quietly rewrite history. A rewrite would contradict a timestamp that Bitcoin holds.
//
//   node tools/anchor.mjs        stamp the current head if it has no anchor yet (run after the validator)
//
// Each head gets docs/ledger/anchors/<seq>.txt (seq and head) and <seq>.txt.ots: a standard OpenTimestamps proof of
// that file, with one branch from each public calendar that answered. Pending at first; `ots upgrade` (the
// opentimestamps-client) later completes it with the Bitcoin block attestation, and `ots verify <seq>.txt.ots`
// checks it. Only a hash leaves this machine: the calendars never see the ledger.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), i = argv.indexOf('--docs');
const docs = i >= 0 ? argv[i + 1] : join(root, 'docs'), dir = join(docs, 'ledger/anchors');
const CALENDARS = ['https://a.pool.opentimestamps.org', 'https://b.pool.opentimestamps.org', 'https://a.pool.eternitywall.com'];
const HEADER = Buffer.concat([Buffer.from([0x00]), Buffer.from('OpenTimestamps'), Buffer.from([0x00, 0x00]), Buffer.from('Proof'), Buffer.from([0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94])]);

const ledger = JSON.parse(readFileSync(join(docs, 'ledger/ledger.json'), 'utf8'));
mkdirSync(dir, { recursive: true });
const txt = join(dir, `${ledger.seq}.txt`);
if (!ledger.seq) { console.log('empty ledger: nothing to anchor'); process.exit(0); }
if (existsSync(txt + '.ots')) { console.log(`head #${ledger.seq} is already anchored`); process.exit(0); }
const text = `Elsewhere ledger\nseq ${ledger.seq}\nhead ${ledger.head}\n`;
const digest = createHash('sha256').update(text).digest();
const answers = [];
for (const c of CALENDARS) {
  try {
    const r = await fetch(c + '/digest', { method: 'POST', body: digest, headers: { Accept: 'application/vnd.opentimestamps.v1', 'User-Agent': 'elsewhere-ledger/1.0' }, signal: AbortSignal.timeout(20000) });
    const b = Buffer.from(await r.arrayBuffer());
    if (r.ok && b.length > 8 && b.length < 10000) answers.push(b); else console.log(`${c}: HTTP ${r.status}`);
  } catch (e) { console.log(`${c}: ${e.message}`); }
}
if (!answers.length) { console.log('no calendar answered: try again next run'); process.exit(0); }
answers.sort(Buffer.compare); // one branch per calendar (0xff marks every branch but the last)
const body = Buffer.concat(answers.flatMap((b, k) => (k < answers.length - 1 ? [Buffer.from([0xff]), b] : [b])));
writeFileSync(txt, text);
writeFileSync(txt + '.ots', Buffer.concat([HEADER, Buffer.from([0x01, 0x08]), digest, body]));
const idxp = join(dir, 'index.json'), idx = existsSync(idxp) ? JSON.parse(readFileSync(idxp, 'utf8')) : { note: 'Ledger heads timestamped with OpenTimestamps (Bitcoin). Verify one with: ots verify <seq>.txt.ots', anchors: [] };
idx.anchors.push({ seq: ledger.seq, head: ledger.head, at: Math.floor(Date.now() / 1000), calendars: answers.length });
writeFileSync(idxp, JSON.stringify(idx, null, 1));
console.log(`anchored head #${ledger.seq} (${ledger.head.slice(0, 12)}) with ${answers.length} calendar${answers.length === 1 ? '' : 's'}`);
