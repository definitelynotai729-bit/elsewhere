// Read the players' feedback (src/engine/feedback.js): fetch the sealed messages from the relays, open them with the
// team's private key (~/.config/elsewhere/feedback-key.json, made once and never committed), and print them, newest
// first. Messages that are not sealed to the key (anyone can post to the tag) are counted and skipped.
// usage: node tools/feedback.mjs [--days 30] [--key PATH] [--tests] [--json]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { query, RUN_KIND } from '../src/engine/nostr.js';
import { openFeedback, FEEDBACK_TAG, FEEDBACK_TEST_TAG } from '../src/engine/feedback.js';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const days = +opt('--days', 30), keyPath = opt('--key', join(homedir(), '.config/elsewhere/feedback-key.json'));
const tests = argv.includes('--tests'), asJson = argv.includes('--json');
let key;
try { key = JSON.parse(readFileSync(keyPath, 'utf8')); } catch (e) { console.error(`no key at ${keyPath}: ${e.message}`); process.exit(2); }
const since = Math.floor(Date.now() / 1000) - days * 86400;
const { events, relays } = await query({ kinds: [RUN_KIND], '#t': [tests ? FEEDBACK_TEST_TAG : FEEDBACK_TAG], since, limit: 1000 });
const out = []; let unreadable = 0;
for (const ev of events) {
  try { out.push({ at: ev.created_at, id: ev.id.slice(0, 12), relay: ev.relay, msg: await openFeedback(ev.content, key.privateJwk) }); } catch (e) { unreadable++; }
}
out.sort((a, b) => b.at - a.at);
if (asJson) { console.log(JSON.stringify({ messages: out, unreadable, relays }, null, 1)); process.exit(0); }
const MOOD = { love: 'loving it', ok: 'it\'s OK', meh: 'not for me' };
for (const { at, msg } of out) {
  const d = msg.device || {};
  const where = [msg.world || 'no world', msg.site && msg.site !== 'web' ? `on ${msg.site}` : '', `${msg.minutes} min`, d.touch ? 'phone/tablet' : 'computer', d.w ? `${d.w}x${d.h}` : '', d.browser, d.quality].filter(Boolean).join(', ');
  console.log(`${new Date(at * 1000).toISOString().replace('T', ' ').slice(0, 16)} UTC  ${msg.mood ? '[' + MOOD[msg.mood] + '] ' : ''}(${where})`);
  console.log('  ' + String(msg.text).replace(/\n/g, '\n  ') + '\n');
}
console.log(`${out.length} message${out.length === 1 ? '' : 's'} in the last ${days} days${unreadable ? `, ${unreadable} not readable (not sealed to this key)` : ''}; relays: ${relays.map((r) => `${r.relay.replace('wss://', '')} ${r.error ? 'error' : r.n}`).join(', ')}`);
