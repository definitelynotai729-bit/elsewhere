// Player feedback (src/engine/feedback.js), checked without the network: the team's key is a real P-256 public key; a
// message sealed to a key opens with its private half and with nothing else; one altered character is refused; the
// message keeps to its limits (1000 characters, no control characters, the named context only); and the event it
// travels in has the right kind, tags, a valid signature and a small size. Sending to the real relays and reading back
// is a manual check: tools/feedback.mjs --tests, after a test message.
// usage: node tools/feedback_test.mjs
import { TEAM_KEY, MAX_TEXT, feedbackMessage, sealFeedback, openFeedback, feedbackEvent, FEEDBACK_TAG, FEEDBACK_TEST_TAG } from '../src/engine/feedback.js';
import { checkEvent, RUN_KIND } from '../src/engine/nostr.js';

const subtle = globalThis.crypto.subtle;
let fails = 0;
const ok = (cond, what) => { if (!cond) { fails++; console.log('FAIL ' + what); } else console.log('ok   ' + what); };
const throwsAsync = async (f) => { try { await f(); return false; } catch (e) { return true; } };
const b64u = (b) => Buffer.from(b).toString('base64url');

// the team's key: a P-256 point the browser can import
ok(!(await throwsAsync(() => subtle.importKey('raw', Buffer.from(TEAM_KEY, 'base64url'), { name: 'ECDH', namedCurve: 'P-256' }, false, []))), 'the team key is a P-256 public key');

// a test key pair (not the team's)
const kp = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const pub = b64u(new Uint8Array(await subtle.exportKey('raw', kp.publicKey))), priv = await subtle.exportKey('jwk', kp.privateKey);
const other = await subtle.exportKey('jwk', (await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])).privateKey);

const msg = feedbackMessage({ text: 'The cat got me three times. Love the train!', mood: 'love', world: 'underfoot', minutes: 12.6, device: { touch: false, w: 1280, h: 720, browser: 'Firefox', quality: 'high' }, build: 'acaf55744998', site: 'itch' });
const sealed = await sealFeedback(msg, pub);
ok(/^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(sealed), 'sealed as v1.<key>.<nonce>.<ciphertext>');
ok(!sealed.includes('cat') && !sealed.includes('underfoot'), 'nothing readable in the sealed text');
const back = await openFeedback(sealed, priv);
ok(JSON.stringify(back) === JSON.stringify(msg), 'it opens with the private half, unchanged');
ok(await throwsAsync(() => openFeedback(sealed, other)), 'another key cannot open it');
const parts = sealed.split('.'), c = parts[3], flip = (c[5] === 'A' ? 'B' : 'A');
ok(await throwsAsync(() => openFeedback([parts[0], parts[1], parts[2], c.slice(0, 5) + flip + c.slice(6)].join('.'), priv)), 'one altered character is refused');
ok((await sealFeedback(msg, pub)) !== sealed, 'two seals of one message differ (a fresh key and nonce each time)');
ok(await throwsAsync(() => openFeedback('hello', priv)), 'a message not sealed this way is refused');

// the message keeps to its limits
const long = feedbackMessage({ text: 'x'.repeat(5000) + '\u0000\u0007', mood: 'angry', world: 'w'.repeat(99), minutes: -5, device: 'phone' });
ok(long.text.length === MAX_TEXT, `the text is cut to ${MAX_TEXT} characters`);
ok(!/[\u0000-\u0008]/.test(feedbackMessage({ text: 'a\u0000b\u0007c' }).text), 'control characters are removed');
ok(long.mood === null && long.minutes === 0 && long.device === null && long.world.length === 40, 'a mood not on the list, a negative time and a bad device are dropped');
ok(msg.site === 'itch' && feedbackMessage({ text: 'a', site: 'https://evil.example/' }).site === null && feedbackMessage({ text: 'a' }).site === null, 'where it is played: a short name, or nothing');
ok(Object.keys(msg).sort().join() === 'build,device,minutes,mood,site,text,v,world', 'it holds the words, a mood and the named context only');

// the event it travels in
const ev = await feedbackEvent(feedbackMessage({ text: 'y'.repeat(MAX_TEXT) }), { teamKey: pub });
ok(ev.kind === RUN_KIND && ev.tags.some((t) => t[0] === 't' && t[1] === FEEDBACK_TAG) && ev.tags.some((t) => t[0] === 'd'), `a kind ${RUN_KIND} event tagged ${FEEDBACK_TAG}`);
ok(await checkEvent(ev) && /^[0-9a-f]{128}$/.test(ev.sig), 'signed, and its id matches its content');
ok(JSON.stringify(ev).length < 4096, `small: ${JSON.stringify(ev).length} bytes with the longest message (relays cap events at 64 KB)`);
const tev = await feedbackEvent(msg, { teamKey: pub, test: true });
ok(tev.tags.some((t) => t[1] === FEEDBACK_TEST_TAG) && !tev.tags.some((t) => t[1] === FEEDBACK_TAG), 'a test message carries the test tag instead');
const a = await feedbackEvent(msg, { teamKey: pub }), b = await feedbackEvent(msg, { teamKey: pub });
ok(a.pubkey !== b.pubkey, 'each message is signed by a fresh throwaway key');

console.log(fails ? `${fails} FAILED` : 'FEEDBACK OK');
process.exitCode = fails ? 1 : 0;
