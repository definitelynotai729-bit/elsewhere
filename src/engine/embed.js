// Played inside another site's page. The itch.io upload (tools/itch.py) is one small page that frames this site, so the
// game played there is always the current one. A copy frozen into the upload would fall out of date within a day: the
// checker refuses runs on world and engine versions replaced more than 24 h earlier (tools/ledger.mjs GRACE).
//
// Inside a frame the game says hello to the page around it, which shows a way out if the game never loads. It shows
// "Click the game to play" while the keyboard belongs to another page, and names where it is played: in feedback, and
// on the You tab, which explains that each site keeps its own saves. None of this is gameplay. It is client code,
// outside the pinned engine (sim.js's import graph).
export const SITE = 'https://definitelynotai729-bit.github.io/elsewhere/';
const HOSTS = { itch: 'itch.io' };

// { framed, site: 'web' | 'itch' | 'framed' (another page, unnamed), host: what to call that page in words }
export function embedInfo(loc = location, win = window) {
  let framed = false;
  try { framed = win.top !== win; } catch (e) { framed = true; }
  let named = null;
  try { const v = new URL(loc.href).searchParams.get('embed'); if (v && /^[a-z][a-z0-9-]{0,15}$/.test(v)) named = v; } catch (e) {}
  const site = framed ? (named || 'framed') : 'web';
  return { framed, site, host: framed ? (HOSTS[site] || 'another site') : null };
}

// Can this page keep anything? A private window blocks storage for framed pages, and so does Chrome's "block
// third-party cookies" setting; a full disk refuses writes. The game still runs (every read and write is guarded),
// but nothing outlives the tab.
export function storageWorks() {
  try {
    const k = 'elsewhere_probe';
    localStorage.setItem(k, '1');
    const ok = localStorage.getItem(k) === '1';
    localStorage.removeItem(k);
    return ok;
  } catch (e) { return false; }
}

// the page around us (tools/itch.py's) waits for this; without it, it offers a link to open the game in its own tab
export function sayHello(info) {
  if (!info.framed) return;
  try { window.parent.postMessage({ elsewhere: 'hello' }, '*'); } catch (e) {}
}

// In a frame, the keyboard goes to whichever page was clicked last (on itch.io, often the page around the game), so a
// returning player who skips the title screen would press keys into nothing. body.unfocused shows the hint. Touch
// screens need no focus: a tap lands where it is, and the hint never shows there.
export function watchFocus(info, hint) {
  if (!info.framed || !hint) return null;
  if (window.matchMedia && matchMedia('(pointer: coarse)').matches) return null;
  const upd = () => document.body.classList.toggle('unfocused', !document.hasFocus());
  window.addEventListener('focus', upd);
  window.addEventListener('blur', () => setTimeout(upd, 0));
  upd();
  return setInterval(upd, 500); // focus moving into or out of the arcade cabinet's frame fires nothing here
}
