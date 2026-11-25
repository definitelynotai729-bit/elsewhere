#!/usr/bin/env python3
"""The itch.io upload: one small page that plays the live game from its website (store/README.md, RELEASE.md §5).

itch.io plays HTML games from its own servers (html-classic.itch.zone) inside a frame on the game's page, so a game
has to be uploaded rather than linked. The upload made here is not a copy of the game. It is a page that frames the
website's own copy, so the game on itch.io is always the current one.

A frozen copy would fall behind within a day. The checker refuses runs on any world or engine version replaced more
than 24 hours earlier (tools/ledger.mjs, tools/engines.mjs: GRACE), and the site changes several times a day, so a
copy's runs would stop counting after the next update.

The page:
  - frames the game with `?embed=itch` (embed.js: the game then names itch.io on its You tab and in feedback);
  - passes on the permissions itch.io's frame gives (fullscreen, autoplay, the microphone for voice, gamepads);
  - hands the keyboard to the game whenever itch.io focuses its frame;
  - after a wait with no hello from the game (it posts one as soon as it runs), offers a link to open the game in
    its own tab.

usage: python3 tools/itch.py [--name NAME] [--url URL] [--wait SECONDS] [--out DIR]
writes OUT/index.html (itch.io also takes this one file as the upload) and OUT/<name>-itch.zip (the same file, zipped).
Default OUT: store/itch (git-ignored).
"""
import argparse, html, json, os, re, sys, zipfile
from urllib.parse import urlsplit

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SITE = 'https://definitelynotai729-bit.github.io/elsewhere/'
# what itch.io's own frame allows (its game page, read 2026-11-25), less what the game never uses
ALLOW = 'autoplay; fullscreen *; microphone; gamepad; web-share'

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<style>
  html, body {{ margin: 0; height: 100%; overflow: hidden; background: #1e2b3e; }}
  #game {{ position: fixed; inset: 0; width: 100%; height: 100%; border: 0; display: block; }}
  #help {{ position: fixed; left: 0; right: 0; bottom: 0; display: none; padding: 10px 16px; text-align: center;
          font: 15px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; color: #fff8ea; background: rgba(30, 43, 62, .94); }}
  #help a {{ color: #ffd166; font-weight: 600; }}
</style>
</head>
<body>
<iframe id="game" title="{title}" src="{src}" allow="{allow}" allowfullscreen></iframe>
<div id="help" role="status">Still loading? The game comes from its website, so it needs a connection to it. <a href="{site}" target="_blank" rel="noopener">Open the game in its own tab</a></div>
<noscript><p style="color:#fff8ea;font:16px system-ui;padding:24px">{title} needs JavaScript. <a style="color:#ffd166" href="{site}">Open it on its website</a>.</p></noscript>
<script>
(function () {{
  var ORIGIN = {origin}, WAIT = {wait};
  var frame = document.getElementById('game'), help = document.getElementById('help'), heard = false;
  // the game says hello as soon as it runs (embed.js); until it does, after a while, offer the way out
  addEventListener('message', function (e) {{
    if (e.origin !== ORIGIN || !e.data || e.data.elsewhere !== 'hello') return;
    heard = true; help.style.display = 'none';
  }});
  setTimeout(function () {{ if (!heard) help.style.display = 'block'; }}, WAIT * 1000);
  // itch.io focuses its frame (this page) when the game starts: pass the keyboard on to the game. A moment later,
  // not inside the focus event, where Chrome keeps the focus in this page (2026-11-25)
  function give() {{ setTimeout(function () {{ try {{ frame.focus(); }} catch (e) {{}} }}, 50); }}
  addEventListener('focus', give);
  frame.addEventListener('load', function () {{ if (document.hasFocus()) give(); }});
  if (document.hasFocus()) give();
}})();
</script>
</body>
</html>
"""

def build(name='Elsewhere', url=SITE, wait=20, out=os.path.join(ROOT, 'store', 'itch')):
    parts = urlsplit(url)
    if parts.scheme not in ('https', 'http') or not parts.netloc: raise SystemExit(f'not a web address: {url}')
    if parts.scheme == 'http' and parts.hostname not in ('localhost', '127.0.0.1', '::1'):
        raise SystemExit('itch.io is HTTPS only: the game must come from an https:// address')
    sep = '&' if parts.query else '?'
    src = url + sep + 'embed=itch' if '#' not in url else url.replace('#', sep + 'embed=itch#', 1)
    site = url.split('#')[0]
    origin = f'{parts.scheme}://{parts.netloc}'
    page = PAGE.format(title=html.escape(name), src=html.escape(src), allow=ALLOW, site=html.escape(site),
                       origin=json.dumps(origin), wait=json.dumps(float(wait)))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f: f.write(page)
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'game'
    zpath = os.path.join(out, f'{slug}-itch.zip')
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        # a fixed date, so the same page makes the same zip
        info = zipfile.ZipInfo('index.html', date_time=(2026, 1, 1, 0, 0, 0)); info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, page)
    return os.path.join(out, 'index.html'), zpath

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--name', default='Elsewhere', help='the game\'s name (the page title; working title until the owner picks one)')
    ap.add_argument('--url', default=SITE, help='where the game is served (default: the website)')
    ap.add_argument('--wait', type=float, default=20, help='seconds without a hello from the game before the page offers a link')
    ap.add_argument('--out', default=os.path.join(ROOT, 'store', 'itch'))
    a = ap.parse_args()
    page, zpath = build(a.name, a.url, a.wait, a.out)
    print(f'{os.path.relpath(page)} ({os.path.getsize(page)} bytes)\n{os.path.relpath(zpath)} ({os.path.getsize(zpath)} bytes)')
