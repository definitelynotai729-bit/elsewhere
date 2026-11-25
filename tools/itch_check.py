#!/usr/bin/env python3
"""The itch.io upload, checked as itch.io would show it (tools/itch.py; store/README.md).

Three sites, as on itch.io:
  - a stand-in for itch.io's game page (http://127.0.0.1), with its frame attributes, copied from a real itch.io page;
  - the upload, tools/itch.py's page (http://127.0.0.2, where itch.io serves uploads from html-classic.itch.zone);
  - the game (http://localhost, a local build, or the website itself when given its URL).
Each is a different site, so the browser keeps the framed game's storage apart, as it does on itch.io.

Checks: the game starts inside both frames and knows it is on itch.io; the upload hears its hello. The keyboard goes
to the game once itch.io focuses its frame, and "Click the game to play" shows whenever it does not. Progress
survives a reload. A first visit gets the title. A browser that refuses storage still plays, and says so. A game behind
the server's reloads inside the frame and stays on itch.io. A game that cannot be reached gets a link to its own tab.
No page errors. Screenshots at itch.io's usual embed sizes go to OUT.

usage: python3 tools/itch_check.py DOCS|URL [--engine chromium|webkit|both] [--out DIR]
Test profiles never publish (verify off), and every WebSocket is stubbed: nothing reaches the real relays.
"""
import argparse, copy, functools, http.server, json, os, re, socket, sys, tempfile, threading, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import PROFILE, profile_script
import itch
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('target', help='a docs/ build directory, or the game\'s URL')
ap.add_argument('--engine', default='both')
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'itch-check'))
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
# (a third site at 127.0.0.2, not [::1]: Chrome did not match an iframe's allow list to an IPv6 address, so a frame
# there lost the gamepad permission it was given, which tests the stand-in rather than the upload)
def serve(directory, host='127.0.0.1'):
    httpd = http.server.ThreadingHTTPServer((host, 0), functools.partial(Quiet, directory=directory))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]

# the game
if a.target.startswith('http'):
    GAME = a.target if a.target.endswith('/') else a.target + '/'
else:
    GAME = f'http://localhost:{serve(os.path.abspath(a.target))}/'
GAME_ORIGIN = re.match(r'https?://[^/]+', GAME).group(0)

# the upload (as itch.io would serve it), and one pointed at a game that cannot be reached
tmp = tempfile.mkdtemp(prefix='itch-check-')
itch.build(url=GAME, wait=20, out=os.path.join(tmp, 'up'))
itch.build(url='http://localhost:9/', wait=2, out=os.path.join(tmp, 'up', 'dead'))
UP = f'http://127.0.0.2:{serve(tmp, host="127.0.0.2")}/up/'

# itch.io's game page, as far as the frame goes: its iframe attributes exactly (read from a real page, 2026-11-25)
ITCH_ALLOW = 'autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated; web-share'
def outer_page(src, w, h, allow=ITCH_ALLOW):
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>itch.io stand-in</title>
<style>body {{ margin: 0; background: #222; color: #ddd; font: 14px sans-serif; }} header {{ padding: 14px 20px; }} #wrap {{ width: {w}px; height: {h}px; margin: 0 auto; background: #000; }}
iframe {{ width: 100%; height: 100%; display: block; }} footer {{ padding: 14px 20px; }}</style></head><body>
<header><b>A game by someone</b> <button id="elsewhere">a button on itch.io's page</button></header>
<div id="wrap"><iframe msallowfullscreen="true" allowfullscreen="true" src="{src}" allow="{allow}" frameborder="0" id="game_drop" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>
<footer>Comments and more of itch.io's page below the game.</footer></body></html>"""
otmp = tempfile.mkdtemp(prefix='itch-outer-')
for nm, src, w, h, allow in (('page.html', UP + 'index.html', 1280, 720, ITCH_ALLOW), ('small.html', UP + 'index.html', 960, 600, ITCH_ALLOW),
                             ('dead.html', UP + 'dead/index.html', 960, 600, ITCH_ALLOW), ('nopad.html', UP + 'index.html', 960, 600, 'autoplay; fullscreen *')):
    open(os.path.join(otmp, nm), 'w').write(outer_page(src, w, h, allow))
ITCH = f'http://127.0.0.1:{serve(otmp)}/'
print(f'itch.io stand-in {ITCH}\nupload {UP}\ngame {GAME}', flush=True)

fails = []
def check(ok, what):
    print(('  ok   ' if ok else '  FAIL ') + what, flush=True)
    if not ok: fails.append(what)

READY = 'window.EW && EW.world && !EW.traveling && EW.world.built && EW.sim && !EW.sim.ended'
# a test profile, installed once per browser context (the game's own saves must survive a reload); verify off
# (shot.profile_script also seeds a chain whose state is the profile, or continuity would reset it to nothing)
def install(prof):
    return ("if (location.origin === %s) { try { if (!localStorage.getItem('elsewhere_profile_v1')) { %s } } catch (e) {} }") % (json.dumps(GAME_ORIGIN), profile_script(prof))
# storage refused, as in a private window: reading localStorage throws, and so does opening IndexedDB
REFUSE = ("if (location.origin === %s) { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } });"
          " try { IDBFactory.prototype.open = function () { throw new DOMException('The operation is insecure.', 'SecurityError'); }; } catch (e) {} }") % json.dumps(GAME_ORIGIN)

def game_frame(pg, timeout=60):
    t0 = time.time()
    while time.time() - t0 < timeout:
        for f in pg.frames:
            if f.url.startswith(GAME) and f.parent_frame and f.parent_frame.parent_frame: return f
        pg.wait_for_timeout(250)
    return None
def wait_ready(pg, timeout=150):
    t0 = time.time()
    while time.time() - t0 < timeout:
        f = game_frame(pg, 10)
        if f:
            try: f.wait_for_function(READY, timeout=5000); return f
            except Exception: pass # a reload replaces the frame: find it again
    return None

def run(engine):
    print(f'== {engine}', flush=True)
    with sync_playwright() as pw:
        b = getattr(pw, engine).launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] if engine == 'chromium' else [])
        def context(scripts=(), routes=(), vp=(1400, 900)):
            ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]})
            ctx.route_web_socket(re.compile('.*'), lambda ws: None) # no relays: nothing published, nobody met
            for s in scripts: ctx.add_init_script(s)
            for pat, fn in routes: ctx.route(pat, fn)
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and ('callback' in m.text or 'Uncaught' in m.text) else None)
            return ctx, pg, errs
        def has(f, sel): return f.evaluate(f"(() => {{ const e = document.querySelector({json.dumps(sel)}); return !!e && getComputedStyle(e).display !== 'none' && !e.classList.contains('hidden'); }})()")
        def unfocused(f): return f.evaluate("document.body.classList.contains('unfocused')")
        def wait_for(f, js, ms=4000):
            try: f.wait_for_function(js, timeout=ms); return True
            except Exception: return False

        print('-- a returning player on itch.io', flush=True)
        ctx, pg, errs = context([install(copy.deepcopy(PROFILE))])
        pg.goto(ITCH + 'page.html')
        f = wait_ready(pg); check(f is not None, 'the game starts inside itch.io\'s frame and the upload\'s')
        if not f: ctx.close(); b.close(); return
        emb = f.evaluate('EW.embedded'); check(emb == {'framed': True, 'site': 'itch', 'host': 'itch.io'}, f'it knows where it is played: {emb}')
        check(f.evaluate('EW.canSave') is True, 'it can save there (the browser keeps a framed site\'s storage apart, not away)')
        up = next((x for x in pg.frames if x.url.startswith(UP)), None)
        check(up is not None and up.evaluate("getComputedStyle(document.getElementById('help')).display") == 'none', 'the upload heard its hello (no "still loading" line)')
        check(wait_for(f, "document.body.classList.contains('unfocused')") and has(f, '#focus-hint'), '"Click the game to play" while the keyboard is with itch.io\'s page')
        pg.screenshot(path=os.path.join(a.out, f'{engine}-unfocused.png'))
        # itch.io focuses its frame when the game starts: the upload hands the keyboard on
        pg.evaluate("document.getElementById('game_drop').focus()")
        check(wait_for(f, "!document.body.classList.contains('unfocused')"), 'itch.io focusing its frame gives the game the keyboard')
        p0 = f.evaluate('[EW.player.pos.x, EW.player.pos.z]')
        pg.keyboard.down('KeyW'); pg.wait_for_timeout(1800); pg.keyboard.up('KeyW'); pg.wait_for_timeout(300)
        p1 = f.evaluate('[EW.player.pos.x, EW.player.pos.z]'); d = ((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2) ** 0.5
        check(d > 1, f'W walks: {d:.1f} m')
        pg.click('#elsewhere') # a click on itch.io's page takes the keyboard away again
        check(wait_for(f, "document.body.classList.contains('unfocused')"), 'a click on itch.io\'s page brings the hint back')
        f.locator('#view').click(position={'x': 400, 'y': 300})
        check(wait_for(f, "!document.body.classList.contains('unfocused')") and not has(f, '#focus-hint'), 'a click on the game hides it')
        f.evaluate("EW.ui.menuTab = 'you'; EW.ui.openPanel('menu')"); pg.wait_for_timeout(600)
        you = f.evaluate("document.querySelector('#panel .panel-body').innerText")
        check("inside itch.io's page" in you and 'kept apart' in you, 'the You tab says itch.io keeps its own saves')
        pg.screenshot(path=os.path.join(a.out, f'{engine}-you.png'))
        f.evaluate("EW.ui.menuTab = 'feedback'; EW.ui.refreshPanel()"); pg.wait_for_timeout(400)
        check('itch.io' in f.evaluate("document.querySelector('#panel .panel-body').innerText"), 'Feedback says where it is played goes with a message')
        f.evaluate("EW.ui.closePanel()")
        # progress survives a reload (the frame's storage is kept for itch.io's page)
        f.evaluate("localStorage.setItem('itch_check_marker', 'kept')")
        pg.reload(); f = wait_ready(pg)
        check(f is not None and f.evaluate("localStorage.getItem('itch_check_marker')") == 'kept', 'what the game keeps survives a reload')
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a smaller embed (960x600)', flush=True)
        ctx, pg, errs = context([install(copy.deepcopy(PROFILE))], vp=(1100, 760))
        pg.goto(ITCH + 'small.html'); f = wait_ready(pg)
        check(f is not None, 'the game starts at 960x600')
        if f:
            pg.evaluate("document.getElementById('game_drop').focus()"); pg.wait_for_timeout(800)
            pg.screenshot(path=os.path.join(a.out, f'{engine}-960x600.png'))
            f.evaluate("EW.ui.menuTab = 'controls'; EW.ui.openPanel('menu')"); pg.wait_for_timeout(600)
            pg.screenshot(path=os.path.join(a.out, f'{engine}-960x600-menu.png'))
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a page that passes on no gamepad permission (getGamepads throws there)', flush=True)
        ctx, pg, errs = context([install(copy.deepcopy(PROFILE))], vp=(1100, 760))
        pg.goto(ITCH + 'nopad.html'); f = wait_ready(pg)
        check(f is not None, 'the game starts')
        if f:
            f.locator('#view').click(position={'x': 400, 'y': 300}); pg.wait_for_timeout(500)
            p0 = f.evaluate('[EW.player.pos.x, EW.player.pos.z]')
            pg.keyboard.down('KeyW'); pg.wait_for_timeout(1800); pg.keyboard.up('KeyW'); pg.wait_for_timeout(300)
            p1 = f.evaluate('[EW.player.pos.x, EW.player.pos.z]'); d = ((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2) ** 0.5
            check(d > 1 and f.evaluate('EW.input.padOff') in (True, False), f'and plays without a pad: W walks {d:.1f} m')
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a first visit on itch.io', flush=True)
        fresh = copy.deepcopy(PROFILE); fresh.pop('created', None); fresh['flags'] = {}
        ctx, pg, errs = context([install(fresh)])
        pg.goto(ITCH + 'page.html'); f = wait_ready(pg)
        check(f is not None and wait_for(f, "!document.getElementById('title').classList.contains('hidden')", 20000), 'the title card shows')
        if f:
            check(not has(f, '#ti-nosave'), 'with no warning about saving (this browser saves)')
            check(not has(f, '#focus-hint'), 'and no focus hint over the title')
            pg.screenshot(path=os.path.join(a.out, f'{engine}-title.png'))
            f.locator('#ti-play').click()
            check(wait_for(f, "!EW.ui.onTitle && !document.body.classList.contains('unfocused')", 8000), 'Play starts the game, with the keyboard')
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a browser that refuses storage (a private window)', flush=True)
        ctx, pg, errs = context([REFUSE])
        pg.goto(ITCH + 'page.html'); f = wait_ready(pg)
        check(f is not None, 'the game still starts')
        if f:
            check(f.evaluate('EW.canSave') is False, 'it knows it cannot save')
            check(wait_for(f, "!document.getElementById('title').classList.contains('hidden')", 20000) and has(f, '#ti-nosave'), 'the title card says progress ends with the tab')
            href = f.evaluate("(document.querySelector('#ti-nosave a') || {}).href")
            check(href == itch.SITE, f'with a link to the game\'s own page ({href})')
            pg.screenshot(path=os.path.join(a.out, f'{engine}-nosave.png'))
            f.locator('#ti-play').click()
            check(wait_for(f, '!EW.ui.onTitle', 8000), 'Play still works')
            f.evaluate("EW.ui.menuTab = 'you'; EW.ui.openPanel('menu')"); pg.wait_for_timeout(500)
            check('not keeping your progress' in f.evaluate("document.querySelector('#panel .panel-body').innerText"), 'and the You tab says so')
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a game behind the server\'s, inside the frame', flush=True)
        n = {'reg': 0}
        def reg_once(route):
            n['reg'] += 1
            resp = route.fetch()
            if n['reg'] > 1: return route.fulfill(response=resp)
            reg = json.loads(resp.text()); reg['engine'] = 'abcdef0123456789' * 4
            route.fulfill(response=resp, body=json.dumps(reg))
        ctx, pg, errs = context([install(copy.deepcopy(PROFILE))], routes=[(re.compile(r'.*/worlds/registry\.json.*'), reg_once)])
        pg.goto(ITCH + 'page.html')
        t0 = time.time(); f = None
        while time.time() - t0 < 120:
            f = game_frame(pg, 5)
            if f and 'v=abcdef012345' in f.url: break
            pg.wait_for_timeout(500)
        check(f is not None and 'v=abcdef012345' in f.url and 'embed=itch' in f.url, f'it reloads itself, still on itch.io ({f.url if f else None})')
        f = wait_ready(pg)
        check(f is not None and f.evaluate('EW.embedded.site') == 'itch', 'and starts there, knowing where it is')
        check(not errs, f'no page errors {errs[:3]}')
        ctx.close()

        print('-- a game that cannot be reached', flush=True)
        ctx, pg, errs = context()
        pg.goto(ITCH + 'dead.html'); pg.wait_for_timeout(3500)
        up = next((x for x in pg.frames if x.url.startswith(UP + 'dead/')), None)
        check(up is not None and up.evaluate("getComputedStyle(document.getElementById('help')).display") == 'block', 'the upload offers its link')
        check(up is not None and up.evaluate("document.querySelector('#help a').href") == 'http://localhost:9/', 'to the game\'s own page')
        pg.screenshot(path=os.path.join(a.out, f'{engine}-dead.png'))
        ctx.close()
        b.close()

for e in (['chromium', 'webkit'] if a.engine == 'both' else [a.engine]):
    run(e)
print(f'screenshots: {a.out}')
print('ITCH OK' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
