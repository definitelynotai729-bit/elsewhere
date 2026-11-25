// Anonymous counts (src/engine/count.js), checked without a browser: off until switched on, the rules that keep a
// page from counting, the exact request GoatCounter gets, the fixed vocabulary (never a name or anything typed), what
// a visit's events become, and the privacy page in both versions. The browser check is tools/count_check.py.
// usage: node tools/count_test.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOATCOUNTER, counterHost, whyNot, countUrl, campaign, referrerOf, backBucket, fpsBucket, createCounter, SAFE, MAX_EVENTS, SEEN_KEY, TIME_MARKS } from '../src/engine/count.js';
import { SITE } from '../src/engine/embed.js';
import { privacyPage } from './privacy.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0, n = 0;
const ok = (cond, what) => { n++; if (!cond) { fails++; console.log('FAIL ' + what); } else console.log('ok   ' + what); };
const host = new URL(SITE).hostname;

// ---- 1. the switch ----
ok(GOATCOUNTER === '' || /^[a-z0-9-]{2,40}$/.test(GOATCOUNTER), `the switch is off or a GoatCounter code (now: ${GOATCOUNTER ? '"' + GOATCOUNTER + '"' : 'off'})`);

// ---- 2. the rules ----
const env = (o) => Object.assign({ endpoint: 'https://x.goatcounter.com/count', host, webdriver: false, dnt: false, gpc: false, setting: true, test: false }, o);
ok(whyNot(env({ endpoint: '' })) !== '', 'without an account nothing is counted');
ok(whyNot(env({})) === '', "on the game's own site, with nothing against it: counted");
ok(whyNot(env({ setting: false })) !== '', 'the player switched counts off: nothing');
ok(whyNot(env({ dnt: true })) !== '' && whyNot(env({ gpc: true })) !== '', 'Do Not Track, or Global Privacy Control: nothing');
ok(whyNot(env({ webdriver: true })) !== '', 'an automated browser (our tests, bots): nothing');
ok(whyNot(env({ host: '127.0.0.1' })) !== '' && whyNot(env({ host: 'evil.example' })) !== '', "anywhere but the game's own site: nothing");
ok(whyNot(env({ test: true, host: '127.0.0.1', webdriver: true })) === '' && whyNot(env({ test: true, dnt: true })) !== '' && whyNot(env({ test: true, setting: false })) !== '',
  "a test page's stand-in counter counts on any host, but still obeys the player's switch and Do Not Track");

// ---- 3. the request, as GoatCounter's own count.js builds it ----
const u = new URL(countUrl('https://code.goatcounter.com/count', { path: 'world/lsb-thyra', title: 'Thyra', event: true, screen: 390 }, 'ab12c'));
ok(u.origin + u.pathname === 'https://code.goatcounter.com/count' && [...u.searchParams.keys()].join(',') === 'p,t,e,s,b,rnd', 'an event carries p, t, e, s, b, rnd and nothing else');
ok(u.searchParams.get('p') === 'world/lsb-thyra' && u.searchParams.get('e') === 'true' && u.searchParams.get('s') === '390' && u.searchParams.get('b') === '0', 'with the path, event flag, screen width and a bot score of 0');
const pv = new URL(countUrl('https://code.goatcounter.com/count', { path: '/', title: 'Elsewhere', referrer: 'https://www.reddit.com/', query: '?ref=webgames', screen: 1920 }, 'zz'));
ok(!pv.searchParams.has('e') && pv.searchParams.get('r') === 'https://www.reddit.com/' && pv.searchParams.get('q') === '?ref=webgames', 'a page view has no event flag, and carries the referrer and campaign tags');

// ---- 4. the vocabulary: fixed lower-case words, never a name or typed text ----
for (const p of ['world/lsb-thyra', 'item/founders-mantle', 'perf/phone/medium/fps-55+', 'time/15m', 'record/circuit/lap', 'back/31d+']) ok(SAFE.test(p), `allowed: ${p}`);
for (const p of ['Dve', 'world/Thyra', 'chat/hello there', 'name:bob', 'a'.repeat(70), '', 'item/🙂', 'x?y=1']) ok(!SAFE.test(p), `refused: ${JSON.stringify(p.length > 20 ? p.slice(0, 20) + '…' : p)}`);
ok(campaign('?embed=itch&v=abc123&ref=webgames&utm_source=reddit&name=Dve') === '?ref=webgames&utm_source=reddit', 'only ref= and utm_ tags pass from the address (not embed=, v= or anything else)');
ok(campaign('?ref=' + encodeURIComponent('a b<script>')) === '' && campaign('') === '' && campaign('?ref=' + 'x'.repeat(41)) === '', 'and only plain short tags');
ok(referrerOf('https://www.reddit.com/r/WebGames/comments/x?utm=1#y') === 'https://www.reddit.com/r/WebGames/comments/x', "the referrer loses its query and fragment");

// ---- 5. buckets ----
const day = 86400000, t0 = new Date(2026, 10, 25, 15, 0).getTime();
ok(backBucket(t0 - 3600000, t0) === 'today' && backBucket(t0 - day, t0) === '1d' && backBucket(t0 - 3 * day, t0) === '2-7d' && backBucket(t0 - 20 * day, t0) === '8-30d' && backBucket(t0 - 90 * day, t0) === '31d+' && backBucket(null, t0) === 'unknown',
  'days away: today, 1d, 2-7d, 8-30d, 31d+, unknown');
ok(backBucket(new Date(2026, 10, 24, 23, 50).getTime(), new Date(2026, 10, 25, 0, 10).getTime()) === '1d', 'by calendar days where the player is (23:50 to 00:10 is "yesterday")');
ok([10, 25, 40, 50, 60].map(fpsBucket).join(' ') === '0-20 20-30 30-45 45-55 55+', 'frame-rate bands');

// ---- 6. a counter on a stand-in page ----
function page({ code = 'elsewhere-test', hostName = host, search = '', referrer = '', settings = { counts: true }, nav = {}, test = null, site = 'web', stored = null } = {}) {
  const sent = [], mem = new Map(stored != null ? [[SEEN_KEY, String(stored)]] : []);
  const win = { location: { hostname: hostName, search }, screen: { width: 1920 }, __elsewhereCount: test };
  const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) };
  const C = createCounter({ code, settings: () => settings, site, win, nav: Object.assign({ webdriver: false }, nav), doc: { referrer, visibilityState: 'visible' }, send: (url) => sent.push(new URL(url)), now: () => t0, storage });
  return { C, sent, mem, paths: () => sent.map((x) => x.searchParams.get('p')) };
}
{
  const off = page({ code: '' });
  off.C.visit(); off.C.event('world/hub'); off.C.back(); off.C.frame(0.016, true, () => ({ phone: false, quality: 'high' }));
  ok(!off.C.active && off.sent.length === 0 && off.mem.size === 0, 'switched off (no account): no request, and nothing stored');
}
{
  const p = page({ search: '?embed=itch&ref=webgames', referrer: 'https://www.reddit.com/r/WebGames/?x=1' });
  p.C.visit(); p.C.visit();
  const v = p.sent[0];
  ok(p.sent.length === 1 && v.origin === 'https://elsewhere-test.goatcounter.com' && v.searchParams.get('p') === '/' && v.searchParams.get('r') === 'https://www.reddit.com/r/WebGames/' && v.searchParams.get('q') === '?ref=webgames',
    'switched on: one page view, to the account\'s counter, with the referrer and the campaign tag');
  p.C.event('world/hub', 'Junction'); p.C.event('world/hub', 'Junction'); p.C.event('world/skyreach');
  ok(p.paths().join(' ') === '/ world/hub world/skyreach', 'each event once per page load');
  ok(!p.C.event('Dve was here') && !p.C.event('world/' + 'Thyra'), 'a path outside the vocabulary is never sent');
  for (let i = 0; i < MAX_EVENTS + 20; i++) p.C.event('item/i' + i);
  ok(p.sent.length === 1 + MAX_EVENTS, `at most ${MAX_EVENTS} events in one page load`);
}
{
  const settings = { counts: true }, p = page({ settings });
  p.C.visit(); settings.counts = false; p.C.event('world/hub'); p.C.back(); p.C.frame(70, true, () => ({}));
  ok(p.paths().join(' ') === '/' && p.mem.size === 0, 'switching counts off stops them at once (and stores nothing)');
}
ok(page({ nav: { doNotTrack: '1' } }).C.visit() === false && page({ nav: { globalPrivacyControl: true } }).C.visit() === false, 'Do Not Track or Global Privacy Control: not even the page view');
ok(page({ nav: { webdriver: true } }).C.visit() === false && page({ hostName: 'localhost' }).C.visit() === false, 'an automated browser, or another host: nothing');
{
  const p = page({ site: 'itch' }), q = page({ site: 'framed' });
  p.C.visit(); q.C.visit();
  ok(p.paths()[0] === '/itch' && q.paths()[0] === '/framed', 'inside itch.io\'s page: /itch; inside another site\'s: /framed');
}
{
  const p = page({ stored: t0 - 3 * day });
  p.C.back();
  ok(p.paths()[0] === 'back/2-7d' && p.mem.get(SEEN_KEY) === String(t0), 'a returning player: days away, and this visit remembered');
  const q = page(); q.C.back();
  ok(q.paths()[0] === 'back/unknown', 'a returning player from before counting began: unknown');
}
{
  const p = page({ test: { endpoint: 'http://127.0.0.1:9/count', minute: 1000 } });
  ok(p.C.active && p.C.endpoint === 'http://127.0.0.1:9/count', "a test page's stand-in counter replaces the account's");
  const dev = () => ({ phone: true, quality: 'medium' });
  const marks = () => p.paths().filter((x) => x.startsWith('time/')).join(' ');
  for (let i = 0; i < 650; i++) p.C.frame(0.1, i % 10 !== 9, dev); // 58.5 "minutes" of play (a minute = 1 s here) in 65 of frames
  ok(marks() === 'time/1m time/5m time/15m time/30m', 'minutes of play: each mark once, and frames that are not play (travel, the title) do not count');
  for (let i = 0; i < 30; i++) p.C.frame(0.1, true, dev);
  ok(marks() === TIME_MARKS.map((m) => `time/${m}m`).join(' '), 'then the hour');
  const perf = p.paths().filter((x) => x.startsWith('perf/'));
  ok(perf.length === 1 && perf[0] === 'perf/phone/medium/fps-0-20', `the frame rate once, with the device and quality (${perf[0]})`);
  const before = p.sent.length; p.C.frame(5, true, dev);
  ok(p.sent.length === before, 'a tab coming back from the background is not play');
}
{
  const p = page(), known = { world: (id) => ['hub', 'circuit', 'lsb-thyra'].includes(id), item: (id) => ['glider', 'paper-crown'].includes(id) };
  for (const c of [[1, 'give', 'glider'], [2, 'give', 'lv-abc123-r'], [3, 'flag', 'hunt.started', true], [4, 'flag', 'hunt.started', true], [5, 'flag', 'lsb.ch', 2], [6, 'flag', 'lsb.beacon', 'dark'],
    [7, 'flag', 'codex.lsb.omphe', true], [8, 'coins', 5], [9, 'record', 'lap', 33.2], [10, 'flag', 'met.wren', true], [11, 'flag', 'lsb.ch', 'x']]) p.C.claim(c, c[1] === 'record' ? 'circuit' : 'hub', known);
  p.C.claim([12, 'record', 'shrine', 5], 'lv-abc123', known);
  ok(p.paths().join(' ') === 'item/glider item/community hunt/started story/bronze-2 story/beacon-dark record/circuit/lap hub/met-wren',
    `a visit's claims: items (community ones as one), milestones, chapters, Chapter 1's choice, first-party records (${p.paths().join(' ')})`);
}

// ---- 7. the privacy page, in both versions ----
const src = readFileSync(join(root, 'src/privacy.html'), 'utf8');
const offPage = privacyPage(src, '', counterHost), onPage = privacyPage(src, 'elsewhere-test', counterHost);
ok(!/goatcounter|counts:/i.test(offPage) && offPage.includes('no cookies, no tracking and no game server'), 'off: the page says no tracking, and never mentions a counter');
ok(onPage.includes('elsewhere-test.goatcounter.com') && onPage.includes('<h2>Anonymous counts</h2>') && onPage.includes('no tracking beyond anonymous counts') && !/counts:(on|off)|\{COUNTER_HOST\}/.test(onPage),
  'on: it names the counter, has its own section, and says so up front');
for (const w of ['worlds you arrive in', 'items you find', 'frame rate', 'feedback', 'failed to start', 'Do Not Track', 'Global Privacy Control', 'Count my visits anonymously', 'time of your last visit']) ok(onPage.includes(w), `on: the page tells players about "${w}"`);
const served = readFileSync(join(root, 'docs/privacy.html'), 'utf8');
ok(served === privacyPage(src, GOATCOUNTER, counterHost), 'the served page is the version for the switch as it stands');
let threw = false; try { privacyPage(src.replace(/\{COUNTER_HOST\}/g, 'somewhere.example'), 'elsewhere-test', counterHost); } catch (e) { threw = true; }
ok(threw, 'a page that does not name the counter is refused while counting is on');
threw = false; try { privacyPage(src, 'Not A Code!', counterHost); } catch (e) { threw = true; }
ok(threw, 'and so is a switch that is not a GoatCounter code');

// ---- 8. outside the engine ----
const graph = new Set();
(function walk(f) {
  if (graph.has(f)) return; graph.add(f);
  for (const m of readFileSync(f, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s*['"](\.\/[^'"]+)['"]|import\(\s*['"](\.\/[^'"]+)['"]\s*\)/g)) { const p = join(dirname(f), m[1] || m[2]); if (existsSync(p)) walk(p); }
})(join(root, 'src/engine/sim.js'));
ok(![...graph].some((f) => f.endsWith('/count.js')), `count.js is outside the pinned engine (${graph.size} files), so counting never changes a run`);

console.log(fails ? `${fails} of ${n} FAILED` : `COUNT OK (${n} checks)`);
process.exitCode = fails ? 1 : 0;
