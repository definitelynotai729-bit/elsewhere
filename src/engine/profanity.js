// The word filter (safety.js loads it the first time another player's words or name are shown: a player who never
// plays online never downloads it).
//
// Words: the obscenity library's English set (MIT). It sees through the usual dodges (f4ck, fuuuck, sh1t, letters
// from other alphabets that look the same) and leaves "class", "assassin" and "Scunthorpe" alone. On top of it:
//  - accents and fancy letters are folded first (fúck, 𝐟𝐮𝐜𝐤, ｆｕｃｋ);
//  - words spelled out with gaps (f u c k, f.u.c.k) are joined up and checked again;
//  - a few phrases aimed at a person (kys);
//  - in chat, links, email addresses and phone numbers are taken out, so nobody is lured off the game.
// Names are held to more (game portals ask for strict name filtering): no word from the badwords list either (MIT;
// the list Poki gives developers), as a whole word, and no links or numbers to call.
import { RegExpMatcher, DataSet, pattern, englishDataset, englishRecommendedTransformers } from 'obscenity';
import BADWORDS from 'badwords/array.js';

const data = new DataSet().addAll(englishDataset)
  .addPhrase((p) => p.setMetadata({ originalWord: 'kys' })
    .addPattern(pattern`|kys|`).addPattern(pattern`kill yourself`).addPattern(pattern`kill urself`).addPattern(pattern`kill ur self`)
    .addPattern(pattern`kill your self`).addPattern(pattern`unalive yourself`));
const built = data.build();
// game talk the English set would star
built.whitelistedTerms.push('kung fu', 'shiitake', 'cockpit', 'penistone', 'cum laude', 'magna cum', 'summa cum');
const matcher = new RegExpMatcher({ ...built, ...englishRecommendedTransformers });

// accents off, lookalike forms folded and combining marks dropped (f̷u̵c̸k), keeping where each folded character
// came from in s, so a match can be starred in what is shown
function fold(s) {
  let t = ''; const at = [];
  for (const m of s.matchAll(/[\s\S]/gu)) { // code points
    const ch = m[0];
    if (/\p{M}/u.test(ch)) continue;
    let base = ch.length === 1 ? ch.normalize('NFKD').replace(/\p{M}/gu, '') : ch;
    if (base.length !== 1) base = ch; // emoji and other astral characters stay as they are
    for (let k = 0; k < base.length; k++) { t += base[k]; at.push(m.index + k); }
  }
  return { t, at };
}
// letters spelled out with gaps: three or more single letters or digits, one to three separators apart
const SPACED = /(?<![\p{L}\p{N}])(?:[\p{L}\p{N}][\s._*\-,'"~+|\\/]{1,3}){2,}[\p{L}\p{N}](?![\p{L}\p{N}])/gu;
const LINK = /\b(?:(?:https?|ftp):\/\/|www\.)\S+|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|gg|io|xyz|ru|tk|me|tv|co|app|link|ly|be|to|ws|us|uk|de|fr|info|biz|site|online|shop|store|live|fun|ml|ga|cf|gq|top|club|vip|cc|in|nl|es|it|pl|ca|au|chat|social)\b(?:\/\S*)?/gi;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE = /\+?\d(?:[\s().-]?\d){6,}/g;

// the spans [start, end] (inclusive, as indices into s) of everything to star
function spans(s) {
  const { t, at } = fold(s), out = [];
  for (const m of matcher.getAllMatches(t, true)) out.push([at[m.startIndex], at[m.endIndex]]);
  for (const m of t.matchAll(SPACED)) {
    const joined = m[0].replace(/[^\p{L}\p{N}]/gu, '');
    if (matcher.hasMatch(joined)) out.push([at[m.index], at[m.index + m[0].length - 1]]);
  }
  return out;
}
// starred: each letter in a span becomes *, and the marks stacked on it go with it
const star = (s, ranges) => {
  if (!ranges.length) return s;
  let out = '', starring = false;
  for (const m of s.matchAll(/[\s\S]/gu)) {
    const ch = m[0], i = m.index;
    if (/\p{M}/u.test(ch)) { if (!starring) out += ch; continue; }
    starring = /\S/.test(ch) && ranges.some(([x, y]) => i >= x && i <= y);
    out += starring ? '*' : ch;
  }
  return out;
};
const unlink = (s) => s.replace(EMAIL, '[email]').replace(LINK, '[link]').replace(PHONE, '[number]');

// Text comes in prepared by textprep.js (safety.js does that): compatibility forms folded, invisible characters out.
// chat or level text, starred where it needs to be
export function cleanChat(text) {
  const s = unlink(String(text));
  return star(s, spans(s));
}
// is there anything to star in it?
export function flagged(text) { return spans(String(text)).length > 0; }

// names: the stricter check. True means the name should not be used (or shown).
const sep = (w) => w.toLowerCase().replace(/[\s_.\-]+/g, '');
const BAD = new Set(), BAD_PREFIX = [];
for (const w of BADWORDS) { if (w.endsWith('*')) BAD_PREFIX.push(sep(w.slice(0, -1))); else BAD.add(sep(w)); }
export function badName(name) {
  const n = String(name || '');
  if (flagged(n) || unlink(n) !== n) return true;
  const f = fold(n).t;
  // whole words: split at spaces, marks and camel case (BigBoss is big + boss, xXGodXx is x + X + God + Xx), and the
  // name run together; each also without its digits (Hell99)
  const words = f.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2').split(/[\s_.\-]+/).map(sep).filter(Boolean);
  words.push(sep(f));
  for (const w of [...words]) { const d = w.replace(/\d+/g, ''); if (d !== w && d.length >= 3) words.push(d); }
  return words.some((w) => BAD.has(w) || BAD_PREFIX.some((p) => w.startsWith(p)));
}
