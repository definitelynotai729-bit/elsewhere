// Safety in a game with no server. Everything another player sends is shown only after it passes here, in each
// player's own game: nothing is banned for everyone, and each player decides what reaches them.
//  - Words: other players' chat, names and level names go through the word filter (profanity.js, loaded the first
//    time it is needed) unless the player switches it off. A name that fails the stricter name check shows as
//    "Wanderer" (the player ID next to it still tells players apart). Our own name is checked when it is chosen.
//  - Chat: On (typed chat, filtered, plus quick phrases), Quick chat only (the phrases below: nothing anyone types
//    is shown), or Off.
//  - Mute and block (net.js): mute stops their chat and voice for this session; block also hides them, stops
//    sending them anything, and is kept on this device (by player ID).
import { profile } from './profile.js';
import { prep } from './textprep.js';

// quick chat: what each number means is fixed here, so a quick message carries no words of its own
export const QUICK = ['Hi! 👋', 'Follow me!', 'Over here!', 'Wait for me!', 'Thanks!', 'Nice one! 👍', 'Good game!', 'Bye! 👋'];
export const CHAT_MODES = { on: 'On', quick: 'Quick chat only', off: 'Off' };

const S = () => profile.data.settings;
export const chatMode = () => (CHAT_MODES[S().chat] ? S().chat : 'on');
export const filterOn = () => S().filter !== false;

let F = null, failed = false, loading = null;
// the word filter's own bundle, next to the game's chunks (tools/build.mjs builds it apart and names it)
const FILTER_URL = typeof __PROFANITY__ === 'string' ? new URL(__PROFANITY__, import.meta.url).href : './profanity.js';
// the word filter, loaded once (resolves, filter or not: if it cannot load, other players' typed words stay hidden)
export function loadFilter() {
  if (!loading) loading = import(FILTER_URL).then((m) => { F = m; return m; }, (e) => { console.warn('[safety] the word filter did not load', e); failed = true; loading = null; return null; });
  return loading;
}
// ready to show other players' words? (at once when the filter is off or already here)
export function filterReady() { return F || !filterOn() ? Promise.resolve() : loadFilter().then(() => {}); }

// another player's typed words, ready to show; null: not shown (the filter is on but not here)
export function shownText(text) {
  if (!filterOn()) return prep(text) || null;
  if (!F) { if (!failed) loadFilter(); return null; }
  return F.cleanChat(prep(text)) || null;
}
// another player's (or a level maker's) name, ready to show
export function shownName(name) {
  const n = prep(name).slice(0, 18) || 'Wanderer';
  if (!filterOn()) return n;
  return F && !F.badName(n) ? n : 'Wanderer';
}
// level names and blurbs from players
export function shownLabel(text, fallback = '') {
  const t = shownText(text);
  return t == null ? fallback : t;
}
// our own name: why it cannot be used, or null
export async function nameProblem(name) {
  const m = await loadFilter();
  if (!m) return null; // the filter could not load: other players' games check it anyway
  return m.badName(prep(name)) ? 'Please pick another name: other players would see "Wanderer" instead of that one.' : null;
}

// the block list: player IDs (public keys) with the name and short ID they had, kept with the settings
export function blockList() {
  const s = S();
  if (!Array.isArray(s.blocked)) s.blocked = [];
  return s.blocked;
}
export const isBlockedKey = (key) => !!key && blockList().some((b) => b.k === key);
export function setBlockedKey(key, on, info = {}) {
  const list = blockList(), i = list.findIndex((b) => b.k === key);
  if (on && i < 0) { list.push({ k: key, n: String(info.n || 'Wanderer').slice(0, 18), fp: info.fp || '', t: Date.now() }); if (list.length > 500) list.shift(); }
  if (!on && i >= 0) list.splice(i, 1);
  profile.save();
}
