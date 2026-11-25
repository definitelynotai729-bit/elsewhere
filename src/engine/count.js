// Anonymous counts: how many people play, where they come from, how far they get, and whether the game runs
// smoothly on their device. Sent to GoatCounter (an open-source counter that sets no cookies), and only once the
// team has an account there. Client code: not part of the pinned engine, and nothing here touches a run.
//
// THE SWITCH is GOATCOUNTER below. Empty (as now): the game counts nothing and contacts no counter, and the build
// leaves the counting parts out of the privacy page. To switch on: set it to the account's code (the CODE in
// https://CODE.goatcounter.com), update the privacy page's "Last updated" line, and build. The build refuses a
// privacy page that does not name the counter's host.
//
// What one count is: a path from the fixed list below (world and item ids from the game's own registry, and fixed
// words), the screen's width, and on the page view only, the site that linked here and any ref= or utm_ campaign
// tag in the link. Never a name, a player ID, chat, or anything a player typed: a path that is not plain lower-case
// words is not sent. GoatCounter stores only totals (country, browser, system, language, screen width) and counts a
// visitor once by keeping the IP address and browser in memory for up to 8 hours, linked to a random ID, never on
// disk (goatcounter.com/help/sessions). The game stores nothing for it except the time of the last visit, in this
// browser, to say how long a returning player was away.
//
// Never counted: with counts switched off (Menu, Online), with Do Not Track or Global Privacy Control on, in
// automated browsers (our own tests, and bots), and anywhere but the game's own site (pages that frame the site, like
// itch.io's, are the site).
//
// The paths (each at most once per page load, at most MAX_EVENTS events):
//   /  /itch  /framed        a page view: on the game's site, inside itch.io's page, inside another site's page
//   title, start/new         a first visit: the title screen shown, then Play pressed
//   back/today|1d|2-7d|8-30d|31d+|unknown   a returning player, by days since their last visit
//   world/<id>               arrived in a world (community levels: world/community)
//   item/<id>                an item gained (a community level's reward: item/community)
//   hunt/started|tuned|complete, season1/started, hub/met-wren   milestones (flags)
//   story/bronze-<n>, story/beacon-lit|dark   a Bronze chapter finished; Chapter 1's choice
//   record/<world>/<key>     a record posted: a finished lap, ride, haul or match
//   time/1m|5m|15m|30m|60m   minutes of play reached (the world running, the tab in front)
//   perf/<phone|computer>/<quality>/fps-<0-20|20-30|30-45|45-55|55+>   once, after a minute of play (Auto settled)
//   save/refused|ahead       the game found its saved chain refused, or behind another device (main.js checkLedger)
//   feedback/<love|ok|meh|none>   feedback sent from the Menu (only that it was sent, and its mood)
//   error/boot|script|build/<id>  the game failed to start, a script error, a world failed to build
import { SITE } from './embed.js';

export const GOATCOUNTER = '';
export const counterHost = (code) => `${code}.goatcounter.com`;
const SITE_HOST = new URL(SITE).hostname;
export const SAFE = /^[a-z0-9][a-z0-9/.+-]{0,63}$/; // a path a count may carry: fixed lower-case words only
export const TIME_MARKS = [1, 5, 15, 30, 60]; // minutes of play
export const PERF_FROM = 30, PERF_AT = 60; // seconds of play: the frame rate is measured between these
export const MAX_EVENTS = 60; // per page load, so a long session (or a bug) cannot flood the counter
export const SEEN_KEY = 'elsewhere_seen_v1'; // the last visit's time (only stored while counting is on)
// the choices that end a story chapter (flag: [name, its values]): Chapter 1's beacon, Chapter 2's compass, Chapter 3's answer
export const STORY_CHOICES = { 'lsb.beacon': ['beacon', ['lit', 'dark']], 'lsb.compass': ['compass', ['stolen', 'asked', 'left']], 'lsb.talos': ['talos', ['truth', 'lie', 'unsure']] };
export const MILESTONES = { 'hunt.started': 'hunt/started', 'hunt.tuned': 'hunt/tuned', 'hunt.complete': 'hunt/complete', 's1.started': 'season1/started', 'met.wren': 'hub/met-wren' };

// why not to count on this page, or '' to count
export function whyNot({ endpoint, host, webdriver, dnt, gpc, setting, test }) {
  if (!endpoint) return 'counting is not switched on'; // no account yet: nothing is ever sent
  if (setting === false) return 'the player switched counts off';
  if (dnt || gpc) return 'Do Not Track or Global Privacy Control';
  if (test) return ''; // a test page's stand-in counter (tools/count_check.py): any host, automated
  if (webdriver) return 'an automated browser';
  if (host !== SITE_HOST) return "not the game's own site";
  return '';
}

// one count's address, as GoatCounter's own count.js builds it: p path, t title, r referrer, e event, s screen
// width, b bot score (always 0: automated browsers are never counted), q campaign tags, rnd against caches
export function countUrl(endpoint, { path, title = '', referrer = '', event = false, screen = 0, query = '' }, rnd) {
  const data = { p: path, t: title, r: referrer, e: event ? 'true' : '', s: screen || '', b: 0, q: query, rnd };
  return endpoint + '?' + Object.entries(data).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

// the campaign tags of a link (?ref=reddit, utm_source=...), and nothing else of the address (no embed=, v=)
export function campaign(search) {
  const keep = new URLSearchParams();
  try { for (const [k, v] of new URLSearchParams(search || '')) if (/^(ref|utm_(source|medium|campaign|content|term))$/.test(k) && /^[\w.-]{1,40}$/.test(v)) keep.append(k, v); } catch (e) {}
  const s = keep.toString();
  return s ? '?' + s : '';
}
// the site that linked here, without its path's query or fragment
export const referrerOf = (ref) => String(ref || '').split(/[?#]/)[0].slice(0, 200);

// days since the last visit, in calendar days where the player is
export function backBucket(lastMs, nowMs) {
  if (!lastMs || !isFinite(lastMs)) return 'unknown';
  const day = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const n = Math.round((day(nowMs) - day(lastMs)) / 86400000);
  return n <= 0 ? 'today' : n === 1 ? '1d' : n <= 7 ? '2-7d' : n <= 30 ? '8-30d' : '31d+';
}
export const fpsBucket = (fps) => (fps < 20 ? '0-20' : fps < 30 ? '20-30' : fps < 45 ? '30-45' : fps < 55 ? '45-55' : '55+');

// the counter for this page. settings: () => the player's settings (counts: false switches it off at once).
// Test pages set window.__elsewhereCount = { endpoint, minute } before the game starts: a stand-in counter, and a
// shorter minute for the time marks.
export function createCounter({ code = GOATCOUNTER, settings = () => ({}), site = 'web', win = globalThis.window, nav = globalThis.navigator, doc = globalThis.document, send = null, now = () => Date.now(), storage = null } = {}) {
  const test = (win && win.__elsewhereCount) || null;
  const endpoint = test && test.endpoint ? String(test.endpoint) : code ? `https://${counterHost(code)}/count` : '';
  const minute = test && test.minute > 0 ? test.minute : 60000;
  const C = { active: !!endpoint, endpoint, sent: [], seen: new Set(), events: 0, played: 0, marks: 0, perfT: 0, perfN: 0, perfDone: false };
  const store = storage || (() => { try { return win.localStorage; } catch (e) { return null; } })();
  C.why = () => whyNot({
    endpoint, test: !!test, setting: (settings() || {}).counts,
    host: win && win.location ? win.location.hostname : '', webdriver: !!(nav && nav.webdriver),
    dnt: !!((nav && nav.doNotTrack === '1') || (win && win.doNotTrack === '1')), gpc: !!(nav && nav.globalPrivacyControl === true),
  });
  const transmit = send || ((url) => {
    try { if (nav.sendBeacon && nav.sendBeacon(url)) return; } catch (e) {}
    try { fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, credentials: 'omit' }).catch(() => {}); } catch (e) {}
  });
  const hit = (o) => {
    try {
      if (!endpoint || C.why() || !SAFE.test(o.path.replace(/^\//, '') || 'x')) return false;
      const screen = win && win.screen ? win.screen.width : 0;
      transmit(countUrl(endpoint, Object.assign({ screen }, o), Math.random().toString(36).slice(2, 7)));
      C.sent.push(o.path);
      return true;
    } catch (e) { return false; }
  };
  // the page view, once: which site it is on, who linked here, and the link's campaign tags
  C.visit = () => {
    if (C.seen.has('/')) return false;
    C.seen.add('/');
    return hit({ path: site === 'web' ? '/' : '/' + (site === 'itch' ? 'itch' : 'framed'), title: 'Elsewhere', referrer: referrerOf(doc && doc.referrer), query: campaign(win && win.location ? win.location.search : '') });
  };
  // an event, once per page load
  C.event = (path, title = '') => {
    if (!endpoint || C.seen.has(path) || C.events >= MAX_EVENTS) return false;
    if (!SAFE.test(path) || C.why()) return false;
    C.seen.add(path); C.events++;
    return hit({ path, title: String(title).slice(0, 80), event: true });
  };
  // a returning player: days since the last visit (and remember this one; only while counting)
  C.back = () => {
    if (!endpoint || C.why()) return false;
    let last = null;
    try { last = store ? +store.getItem(SEEN_KEY) : null; } catch (e) {}
    C.remember();
    return C.event('back/' + backBucket(last, now()));
  };
  C.remember = () => { if (!endpoint || C.why()) return; try { if (store) store.setItem(SEEN_KEY, String(now())); } catch (e) {} };
  // every frame: minutes of play (the world running, the tab in front), and the frame rate between PERF_FROM and
  // PERF_AT seconds of play. secs: the frame's real length; device: () => ({ phone, quality })
  C.frame = (secs, live, device) => {
    if (!endpoint || !live || (doc && doc.visibilityState === 'hidden')) return;
    const dt = Math.min(1, Math.max(0, secs)); // (a tab coming back from the background is not play)
    C.played += dt;
    const mins = (C.played * 1000) / minute;
    while (C.marks < TIME_MARKS.length && mins >= TIME_MARKS[C.marks]) C.event(`time/${TIME_MARKS[C.marks++]}m`);
    if (C.perfDone) return;
    const s = mins * 60;
    if (s >= PERF_FROM) { C.perfT += dt; C.perfN++; }
    if (s >= PERF_AT && C.perfT > 0) {
      C.perfDone = true;
      const d = device();
      C.event(`perf/${d.phone ? 'phone' : 'computer'}/${d.quality}/fps-${fpsBucket(C.perfN / C.perfT)}`);
    }
  };
  // what a visit's claims say (main.js watchClaims): items, milestones, records. known: first-party world/item ids
  C.claim = (c, worldId, known) => {
    if (!endpoint) return;
    if (c[1] === 'give' && typeof c[2] === 'string') C.event('item/' + (known.item(c[2]) ? c[2] : 'community'));
    else if (c[1] === 'flag' && MILESTONES[c[2]] && c[3]) C.event(MILESTONES[c[2]]);
    else if (c[1] === 'flag' && c[2] === 'lsb.ch' && Number.isInteger(c[3]) && c[3] > 0 && c[3] < 20) C.event('story/bronze-' + c[3]);
    else if (c[1] === 'flag' && STORY_CHOICES[c[2]] && STORY_CHOICES[c[2]][1].includes(c[3])) C.event(`story/${STORY_CHOICES[c[2]][0]}-${c[3]}`); // the choices that end a chapter
    else if (c[1] === 'record' && typeof c[2] === 'string' && known.world(worldId)) C.event(`record/${worldId}/${c[2]}`);
  };
  return C;
}
