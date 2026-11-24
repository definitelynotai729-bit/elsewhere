// Weekly challenges in the game: the line in the HUD, the banner when a new one starts, a medal when a run earns one,
// and the card at the top of the Leaderboards. The schedule and the medal rules are in challenges.js, shared with the
// checker. UI only: nothing here touches a run (it reads the claims a run makes, as the HUD does).
import { profile } from './profile.js';
import { fmtTime } from './util.js';
import { challengeAt, challengeOf, weekAt, medalOf, beats, MEDALS, MEDAL_NAMES } from './challenges.js';
import { shownName, filterReady } from './safety.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const nowSec = () => Math.floor(Date.now() / 1000);
// a time or a score as players see it
export const fmtValue = (ch, v) => (ch.better === 'higher' ? `${v} ${ch.unit || ''}`.trim() : fmtTime(v));
const medalIcon = (m, on = true) => { const i = el('i', 'medal ' + m + (on ? '' : ' dim')); i.setAttribute('aria-label', MEDAL_NAMES[m]); return i; };

// how long until the week ends: "5 days", "20 hours", "40 minutes"
export function leftText(ch, now) {
  const s = Math.max(0, ch.end - now), d = Math.floor(s / 86400), h = Math.floor(s / 3600), m = Math.max(1, Math.ceil(s / 60));
  return d >= 2 ? `${d} days` : h >= 2 ? `${h} hours` : `${m} minute${m === 1 ? '' : 's'}`;
}
// where the Go button takes you, in words
const placeName = (ch) => (ch.world === 'hub' ? 'Junction' : /^lv-/.test(ch.world) ? ch.title : ch.where);

export function createWeekly(E) {
  const S = () => profile.data.settings;
  const myKey = () => (profile.data.key && profile.data.key.pub) || null;
  // the welcome comes first: a new player hears of challenges once Wren has met them
  const welcomed = () => !!profile.data.flags['met.wren'];
  let welcomedAtStart = null; // had they met Wren before this session? (then a new week's banner is news to them)

  // this player's best in a week's challenge on this device: the runs kept here, and the visit so far
  function localBest(ch) {
    let best = null;
    const take = (v) => { if (typeof v === 'number' && isFinite(v) && (best == null || beats(ch, v, best))) best = v; };
    for (const r of E.runs || []) {
      const p = r.proof;
      if (!p || !p.world || p.world.id !== ch.world) continue;
      const t = Date.parse(p.started) / 1000;
      if (!(t >= ch.start && t < ch.end)) continue;
      for (const c of p.claims || []) if (c[1] === 'record' && c[2] === ch.record) take(c[3]);
    }
    if (E.sim && E.world && E.world.id === ch.world && E.run && !E.run.tainted) {
      const t = Date.parse(E.run.started) / 1000;
      if (t >= ch.start && t < ch.end) for (const c of E.sim.claims) if (c[1] === 'record' && c[2] === ch.record) take(c[3]);
    }
    return best;
  }

  // ---- the HUD line: in the featured world, the three targets (the ones reached lit) and your best; in Junction, a
  // pointer to it. Tapping it opens the Leaderboards.
  let hudKey = '';
  function hud() {
    const box = document.getElementById('weekly');
    if (!box) return;
    const ch = challengeAt(nowSec()), here = E.world && E.world.id;
    let mode = null;
    if (ch && here && welcomed() && !(E.builder && E.builder.active)) mode = here === ch.world ? 'here' : here === 'hub' ? 'hub' : null;
    const best = mode ? localBest(ch) : null;
    const key = [mode, ch && ch.id, best, E.input && E.input.touch].join('|');
    if (key === hudKey) return;
    hudKey = key;
    box.textContent = '';
    box.classList.toggle('on', !!mode);
    if (!mode) return;
    const got = medalOf(ch, best);
    box.append(el('div', 'wk-title', `★ Weekly · ${ch.title}`));
    if (mode === 'here') {
      const row = el('div', 'wk-medals');
      ch.medals.forEach((v, i) => { const m = MEDALS[i], on = !!got && MEDALS.indexOf(got) <= i; const s = el('span', on ? 'got' : ''); s.append(medalIcon(m, on), document.createTextNode(fmtValue(ch, v))); row.append(s); });
      box.append(row);
      box.append(el('div', 'wk-sub', best == null ? 'Your best this week shows here.' : `Your best this week: ${fmtValue(ch, best)}${got ? ' · ' + MEDAL_NAMES[got] : ''}`));
    } else {
      const sub = el('div', 'wk-sub');
      if (got) sub.append(medalIcon(got));
      sub.append(document.createTextNode(`At ${ch.where} · ${E.input && E.input.touch ? 'tap' : 'R'} for the board`));
      box.append(sub);
    }
  }

  // ---- a record in the featured world: did it earn a medal? (a little after the world's own banner)
  function onRecord(world, key, value, tick) {
    const ch = challengeAt(nowSec());
    if (!ch || world !== ch.world || key !== ch.record || (E.run && E.run.tainted)) return;
    // the best before this one: everything this week except this claim
    let before = null;
    const take = (v) => { if (typeof v === 'number' && isFinite(v) && (before == null || beats(ch, v, before))) before = v; };
    for (const r of E.runs || []) {
      const p = r.proof;
      if (!p || !p.world || p.world.id !== ch.world) continue;
      const t = Date.parse(p.started) / 1000;
      if (t >= ch.start && t < ch.end) for (const c of p.claims || []) if (c[1] === 'record' && c[2] === ch.record) take(c[3]);
    }
    if (E.sim) for (const c of E.sim.claims) if (c[1] === 'record' && c[2] === ch.record && c[0] < tick) take(c[3]);
    const was = medalOf(ch, before), now = medalOf(ch, value), rank = (m) => (m ? 3 - MEDALS.indexOf(m) : 0);
    const next = now === 'gold' ? null : MEDALS[now ? MEDALS.indexOf(now) - 1 : 2];
    const nextText = next ? ` ${MEDAL_NAMES[next]} is ${fmtValue(ch, ch.medals[MEDALS.indexOf(next)])}.` : '';
    let text = null;
    if (rank(now) > rank(was)) text = `Weekly challenge: ${MEDAL_NAMES[now]} medal!${nextText}`;
    else if (before == null || beats(ch, value, before)) text = `Weekly challenge: ${before == null ? '' : 'a new best, '}${fmtValue(ch, value)}.${nextText}`;
    hudKey = '';
    if (text) setTimeout(() => E.toast(text, now ? 'item' : ''), 1500);
  }

  // ---- arriving somewhere: a new week's challenge gets a banner, once (a returning player's reason to look)
  function arrive() {
    hudKey = '';
    hud();
    if (welcomedAtStart === null) welcomedAtStart = welcomed();
    const n = weekAt(nowSec()), ch = challengeOf(n), s = S();
    if (!ch || !welcomed() || s.weekSeen === n) return;
    s.weekSeen = n; profile.save();
    if (!welcomedAtStart) return; // met Wren this session: the challenge is simply there (the HUD line, the Leaderboards)
    // (in an arena R is an ability: there the ★ line is the way in)
    const how = E.input && (E.input.touch || E.input.scheme === 'topdown') ? `${E.input.touch ? 'tap' : 'click'} ★ for the board` : 'R for the board';
    // after the world's own banners: its name on arrival, and any it shows in its first seconds (those wait on game
    // time, which runs slow on a struggling device, so this waits for 5 s of the visit's ticks too). Never over a
    // banner, and not in a dialog or a panel.
    const t0 = performance.now(), sim0 = E.sim, tick0 = sim0 ? sim0.tick : 0;
    const show = () => {
      if (performance.now() - t0 > 60000) return;
      const played = !E.sim ? 0 : E.sim === sim0 ? E.sim.tick - tick0 : E.sim.tick;
      if (E.traveling || E.ui.busy || E.ui.panelOpen || played < 300 || performance.now() - E.ui.bannerAt < 4000) { setTimeout(show, 500); return; }
      E.ui.banner('New weekly challenge', `${ch.title} at ${ch.where} · gold ${fmtValue(ch, ch.medals[0])} · ${how}`);
    };
    setTimeout(show, 2500);
  }

  // ---- the Leaderboards card: this week's challenge, its board, last week's winners, your medals
  function card(body, opts = {}) {
    const now = nowSec(), n = weekAt(now), ch = challengeOf(n);
    if (!ch) return;
    body.append(el('h3', null, 'This week\'s challenge'));
    const c = el('div', 'card run weekly-card');
    c.append(el('div', 'name', `★ ${ch.title} · ${ch.where}`));
    c.append(el('div', 'desc', ch.ask));
    const tiers = el('div', 'wk-tiers');
    ch.medals.forEach((v, i) => { const s = el('span'); s.append(medalIcon(MEDALS[i]), document.createTextNode(`${MEDAL_NAMES[MEDALS[i]]} ${fmtValue(ch, v)}`)); tiers.append(s); });
    c.append(tiers);
    const you = el('div', 'meta wk-you');
    const best = localBest(ch), got = medalOf(ch, best);
    you.textContent = best == null ? 'You have not tried it this week.' : `Your best this week: ${fmtValue(ch, best)}${got ? ` · ${MEDAL_NAMES[got]}` : ''}`;
    c.append(you);
    const end = new Date(ch.end * 1000);
    let endText = '';
    try { endText = end.toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' }); } catch (e) { endText = end.toUTCString(); }
    c.append(el('div', 'meta', `Ends ${endText} (in ${leftText(ch, now)}). A new challenge every week.`));
    const row = el('div', 'btnrow');
    const here = E.world && E.world.id === ch.world;
    const go = el('button', 'btn' + (here ? ' on' : ''), here ? 'You are here' : `Go to ${placeName(ch)}`);
    go.disabled = here;
    go.onclick = async () => {
      if (!E.findWorld(ch.world)) await E.loadCommunity();
      if (!E.findWorld(ch.world)) { E.toast('That world could not be found. Try again in a moment.', 'bad'); return; }
      E.ui.closePanel(); E.leaveTo(ch.world);
    };
    row.append(go); c.append(row);
    if (S().verify === false) c.append(el('div', 'meta', 'Save my progress online is off (Menu, Online), so your runs wait in this browser and are not on the boards.'));
    const board = el('div', 'wk-board'); board.append(el('div', 'meta', 'Loading the board…'));
    c.append(board);
    body.append(c);
    const last = challengeOf(n - 1), lastBox = el('div');
    const medalsBox = el('div');
    body.append(lastBox, medalsBox);
    Promise.all([E.ledgerView(opts.fresh), filterReady()]).then(([v]) => {
      const B = v && v.boards, wk = B && B.weekly ? B.weekly[n] : null, me = myKey();
      board.textContent = '';
      if (!wk || !wk.top.length) board.append(el('div', 'meta', 'No one is on this week\'s board yet. Checked runs show up here, usually within the hour.'));
      else {
        board.append(el('div', 'meta', `${wk.players} player${wk.players === 1 ? '' : 's'} this week · ${MEDALS.map((m) => `${wk.medals[m]} ${m}`).join(', ')}`));
        wk.top.forEach((r, i) => { const line = el('div', 'meta wk-row' + (r.key === me ? ' me' : '')); if (r.medal) line.append(medalIcon(r.medal)); line.append(document.createTextNode(`${i + 1}. ${fmtValue(ch, r.value)} · ${shownName(r.name)}${r.key === me ? ' (you)' : ''}`)); board.append(line); });
      }
      const lw = last && B && B.weekly ? B.weekly[n - 1] : null;
      if (lw && lw.top.length) {
        const lc = el('div', 'card run');
        lc.append(el('div', 'name', `Last week: ${last.title} · ${last.where}`));
        lw.top.slice(0, 3).forEach((r, i) => { const line = el('div', 'meta wk-row' + (r.key === me ? ' me' : '')); if (r.medal) line.append(medalIcon(r.medal)); line.append(document.createTextNode(`${i + 1}. ${fmtValue(last, r.value)} · ${shownName(r.name)}${r.key === me ? ' (you)' : ''}`)); lc.append(line); });
        lc.append(el('div', 'meta', `${lw.players} player${lw.players === 1 ? '' : 's'} took part.`));
        lastBox.append(lc);
      }
      const mine = me && B && B.medals ? B.medals[me] : null;
      if (mine && (mine.gold || mine.silver || mine.bronze)) {
        const line = el('div', 'meta wk-mine');
        line.append(document.createTextNode('Your medals: '));
        MEDALS.forEach((m) => { if (mine[m]) { line.append(medalIcon(m), document.createTextNode(`${mine[m]} ${m}  `)); } });
        medalsBox.append(line);
      }
    });
  }

  let lastT = 0;
  return {
    hud, onRecord, arrive, card, localBest,
    // every frame: the HUD line catches up once a second (a week ending, the welcome finishing)
    tick() { const t = performance.now(); if (t - lastT >= 1000) { lastT = t; hud(); } },
  };
}
