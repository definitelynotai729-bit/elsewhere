// The chat and name filter (src/engine/profanity.js): it must catch the usual dodges, and leave everyday game talk
// alone (a filter that stars "class" or "kung fu" spoils chat for everyone). Exits 1 on any miss.
// usage: node tools/filter_test.mjs [-v]
import * as F from '../src/engine/profanity.js';
import { prep } from '../src/engine/textprep.js';
// as the game calls them (safety.js prepares text first)
const cleanChat = (t) => F.cleanChat(prep(t)), flagged = (t) => F.flagged(prep(t)), badName = (n) => F.badName(prep(n));

const verbose = process.argv.includes('-v');
let bad = 0;
const fail = (what) => { bad++; console.log('FAIL', what); };

// must be starred (or taken out) in chat
const STAR = ['fuck you', 'f4ck', 'fuuuuuck', 'FUCK', 'f u c k', 'f.u.c.k off', 'f-u-c-k', 'sh1t', 's h i t', 'b!tch', 'fúck', 'ｆｕｃｋ', '𝐟𝐮𝐜𝐤',
  'fυck', 'f\u200Buck', 'fu\u200Dck', 'f\u202Euck', 'f\u0337\u0322u\u0335c\u0338k\u0336', 'kys', 'kill yourself', 'n1gger', 'you a$$hole', 'motherfucker', 'c u n t', 'wh0re', 'pu$$y', 'dickhead', 'faggot', 'retard',
  'bitch please', 'what the fuck', 'shit happens', 'you whore', 'slut', 'cunt'];
for (const s of STAR) { const out = cleanChat(s); if (out === s || !out.includes('*')) fail(`not starred: ${JSON.stringify(s)} -> ${JSON.stringify(out)}`); else if (verbose) console.log('ok  ', JSON.stringify(s), '->', JSON.stringify(out)); }

// links, email addresses and phone numbers come out of chat
const UNLINK = [['join discord.gg/abc123 now', '[link]'], ['www.example.com', '[link]'], ['go to http://x.yz/a', '[link]'], ['mail me at kid@mail.co', '[email]'],
  ['call 555 123 4567', '[number]'], ['+44 7700 900123', '[number]'], ['bit.ly/xyz', '[link]'], ['my insta is name.store', '[link]']];
for (const [s, want] of UNLINK) { const out = cleanChat(s); if (!out.includes(want)) fail(`not taken out: ${JSON.stringify(s)} -> ${JSON.stringify(out)}`); else if (verbose) console.log('ok  ', JSON.stringify(s), '->', JSON.stringify(out)); }

// everyday talk: must come through unchanged
const CLEAN = ['hi', 'gg', 'good game', 'follow me', 'over here!', 'nice one', 'lol', 'brb', 'afk', 'wait for me', 'thanks!', 'where is the vault?',
  'how do I get the glider', 'the crown is in the dome', 'assassin', 'class', 'pass me the ball', 'glass', 'grass', 'bass', 'compass', 'kung fu',
  'Scunthorpe', 'cocktail', 'shiitake', 'therapist', 'grape', 'scrape', 'title', 'titan', 'button', 'analysis', 'canal', 'document', 'cucumber',
  'circumference', 'Sussex', 'Essex', 'assist', 'cockpit', 'peacock', 'scrap', 'spawn', 'my score is 37.5', '100000 points', '3.14', 'e.g. this',
  'i.e. that', 'lap 1:02.5', "it's 10:30", 'I got 25 crystals', 'ok. me too', 'wanna race?', "let's go", 'kill the slimes', 'I killed the brute',
  'the spire is down', 'damn', 'what the heck', 'that sucks', 'Glowcave', 'Skyreach', 'Neon Circuit', 'Spire Clash', 'Junction', 'Crystal Rush',
  'the Founder', 'Echo IV', 'Wren', 'Bram', 'Fenn', 'assume', 'passage', 'hello', 'shell', 'Michelle', 'arsenal', 'cumulative', 'accumulate',
  'I need to pass', 'harass', 'embarrassing', 'skyscraper', 'Dickens', 'hit the button', 'is it a trap?', 'push the cart', 'he is a beast',
  'rapids', 'grapes', 'drape', 'therapy', 'shuttle', 'shuttlecock', 'hancock', 'hitchcock', 'twitter', 'bigger', 'snigger', 'cockatoo',
  'sextant', 'Middlesex', 'Matsushita', 'Penistone', 'cum laude', 'hello everyone, nice to meet you', 'see you tomorrow', 'I am 12', 'version 0.3.1',
  'press F to talk', 'use the glider at the summit', 'boost on the board', 'jump jump jump', 'a b c', 'I a m', 'x y z', 'the 3 sigils',
  'Echo V needs a win in Spire Clash', 'buy the katana', 'the slime pen', 'my time was 38.0', 'ggs', 'wp', 'ez', 'noob'];
for (const s of CLEAN) { const out = cleanChat(s); if (out !== s) fail(`changed: ${JSON.stringify(s)} -> ${JSON.stringify(out)}`); }

// names: stricter
const BAD_NAMES = ['God', 'Hell99', 'xXGodXx', 'FuckBoy', 'Sh1tLord', 'nazi', 'PornStar', 'a_s_s', 'Fudge Packer', 'www.x.com', 'call5551234567', 'B1tch', 'cuntface', 'dickhead', 'kys'];
const GOOD_NAMES = ['Ada', 'Wanderer', 'Big Boss', 'bigBoss', 'Shell', 'Michelle', 'Cassandra', 'Glass Hopper', 'Kai', 'Luna', 'Zed', 'Pixel', 'Mr Bean',
  'Hellen', 'Godric', 'Scunthorpe', 'Dve', 'Elsewhere team', 'Wren', 'Ava 2', 'Skyrunner', 'Basstian', 'Classy', 'Pass', 'Titania', 'Peacock', 'ninja_77'];
for (const n of BAD_NAMES) if (!badName(n)) fail(`name allowed: ${JSON.stringify(n)}`);
for (const n of GOOD_NAMES) if (badName(n)) fail(`name refused: ${JSON.stringify(n)}`);

// shown as it should be: emoji stay whole, accents stay, Zalgo and direction flips go
for (const [s, want] of [['👨\u200D👩\u200D👧 hi', '👨\u200D👩\u200D👧 hi'], ['café olé', 'café olé'], ['h\u0301\u0302\u0303\u0304ello', 'hello'], ['a\u202Eb', 'ab'], ['Ｈｉ', 'Hi']]) {
  const out = cleanChat(s); if (out !== want) fail(`shown as ${JSON.stringify(out)}, not ${JSON.stringify(want)}`);
}
// sanity: flagged() agrees with cleanChat()
if (!flagged('f4ck') || flagged('class')) fail('flagged() disagrees');
// speed: chat arrives at most a few lines a second per player
const t0 = performance.now(); for (let i = 0; i < 2000; i++) cleanChat('the quick brown fox jumps over the lazy dog, and then some more words ' + i);
const per = (performance.now() - t0) / 2000;
if (per > 2) fail(`slow: ${per.toFixed(3)} ms a line`);

console.log(`${STAR.length} starred, ${UNLINK.length} taken out, ${CLEAN.length} left alone, ${BAD_NAMES.length + GOOD_NAMES.length} names; ${per.toFixed(3)} ms a line: ${bad ? bad + ' FAILED' : 'ALL OK'}`);
process.exitCode = bad ? 1 : 0;
