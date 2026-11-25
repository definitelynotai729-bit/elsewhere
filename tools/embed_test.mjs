// Played inside another site's page (src/engine/embed.js, tools/itch.py), checked without a browser:
// - where the game is played: its own page, itch.io's (?embed=itch), or an unnamed page around it;
// - storage that works, and storage a browser refuses;
// - a gamepad read where the page around the game withholds the permission (getGamepads throws): no pad, no error;
// - the itch.io upload: it frames the website with ?embed=itch, passes on the permissions the game uses, and listens
//   only to the website's hello;
// - the website's address is written in three places (embed.js, itch.py, build.mjs), and they agree.
// The browser check is tools/itch_check.py (a stand-in for itch.io's page, three sites).
// usage: node tools/embed_test.mjs
import { readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SITE, embedInfo, storageWorks } from '../src/engine/embed.js';

let fails = 0;
const ok = (cond, what) => { if (!cond) { fails++; console.log('FAIL ' + what); } else console.log('ok   ' + what); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// where it is played
const win = (framed) => { const w = {}; w.top = framed ? {} : w; return w; };
const at = (q) => ({ href: SITE + q });
ok(same(embedInfo(at(''), win(false)), { framed: false, site: 'web', host: null }), 'on its own page: the website');
ok(same(embedInfo(at('?embed=itch'), win(false)), { framed: false, site: 'web', host: null }), '?embed=itch on its own page is still the website');
ok(same(embedInfo(at('?embed=itch'), win(true)), { framed: true, site: 'itch', host: 'itch.io' }), 'framed with ?embed=itch: itch.io');
ok(same(embedInfo(at('?v=abcdef012345&embed=itch'), win(true)), { framed: true, site: 'itch', host: 'itch.io' }), 'still itch.io after an update reload adds ?v=');
ok(same(embedInfo(at(''), win(true)), { framed: true, site: 'framed', host: 'another site' }), 'framed by an unnamed page: another site');
ok(embedInfo(at('?embed=<script>'), win(true)).site === 'framed' && embedInfo(at('?embed=' + 'a'.repeat(40)), win(true)).site === 'framed', 'a name that is not a short word is ignored');
const guarded = {}; Object.defineProperty(guarded, 'top', { get() { throw new Error('cross-origin'); } });
ok(embedInfo(at(''), guarded).framed === true, 'a page around it that cannot be read counts as framed');

// storage
const store = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
globalThis.localStorage = store();
ok(storageWorks() === true, 'storage that works');
ok(localStorage.getItem('elsewhere_probe') === null, 'and the probe leaves nothing behind');
Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError: the operation is insecure'); } });
ok(storageWorks() === false, 'storage the browser refuses (reading localStorage throws)');
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); }, removeItem: () => {} } });
ok(storageWorks() === false, 'storage that refuses writes');

// a gamepad read where the permission is withheld
Object.defineProperty(globalThis.navigator, 'getGamepads', { configurable: true, value: () => { throw new Error('Access to the feature "gamepad" is disallowed by permissions policy.'); } });
const { input } = await import('../src/engine/input.js');
let threw = false, pad;
try { pad = input.readPad(); pad = input.readPad(); } catch (e) { threw = true; }
ok(!threw && pad === null && input.padOff === true, 'getGamepads throwing: no pad, no error, and no second try');
input.padOff = false;
Object.defineProperty(globalThis.navigator, 'getGamepads', { configurable: true, value: () => [null, { connected: true, axes: [0.5, 0], buttons: [] }] });
ok(input.readPad() && input.readPad().axes[0] === 0.5, 'a connected pad is read as before');

// the itch.io upload
const out = mkdtempSync(join(tmpdir(), 'itch-'));
execFileSync('python3', ['tools/itch.py', '--out', out], { stdio: 'ignore' });
const page = readFileSync(join(out, 'index.html'), 'utf8');
const frame = /<iframe[^>]*>/.exec(page)[0];
ok(/ src="([^"]+)"/.exec(frame)[1] === SITE + '?embed=itch', 'the upload frames the website, with ?embed=itch');
const allow = /allow="([^"]+)"/.exec(frame)[1].split(';').map((s) => s.trim().split(' ')[0]);
ok(['autoplay', 'fullscreen', 'microphone', 'gamepad'].every((f) => allow.includes(f)) && / allowfullscreen/.test(frame), `and passes on what the game uses (${allow.join(', ')})`);
ok(page.includes(`var ORIGIN = ${JSON.stringify(new URL(SITE).origin)}`) && page.includes("e.data.elsewhere !== 'hello'"), "it listens to the website's hello only");
ok(/<a href="([^"]+)" target="_blank"/.exec(page)[1] === SITE, 'its way out opens the website in a new tab');
ok(!/<script[^>]+src=|<link[^>]+href=/i.test(page), 'it loads nothing else (one file)');

// one address, written three times
const itchSite = /^SITE = '([^']+)'/m.exec(readFileSync('tools/itch.py', 'utf8'))[1];
const buildSite = /const SITE = '([^']+)'/.exec(readFileSync('tools/build.mjs', 'utf8'))[1];
ok(itchSite === SITE && buildSite === SITE, `the site's address agrees in embed.js, itch.py and build.mjs (${SITE})`);

console.log(fails ? `${fails} FAILED` : 'EMBED OK');
process.exitCode = fails ? 1 : 0;
