#!/usr/bin/env python3
"""Headless check + screenshots of Elsewhere.

usage: python3 tools/shot.py [--world hub] [--out shots] [--fresh] [--engine chromium|firefox|webkit]
       [--steps 'tp:0,2,10;wait:1;key:KeyW:1.5;shot:name;eval:js']

Serves ./docs on a local port, opens the page with a preset profile (unless --fresh), waits until
the world is live, runs the steps, and prints console errors. Exit code 1 on page errors.
"""
import argparse, json, os, sys, threading, time, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def serve(directory):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()
    handler = functools.partial(Q, directory=directory)
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]

PROFILE = {"v": 1, "name": "Tester", "colors": {"body": "#3ec8ff", "head": "#eef1ff", "visor": "#ff4fd8"}, "online": False,
           "coins": 0, "inv": {}, "eq": {"head": None, "back": None, "hand": None, "feet": None, "board": None}, "flags": {"met.wren": True},
           "worlds": {}, "settings": {"quality": "high", "sfx": False, "music": False, "sens": 1, "invertY": False}, "created": 1}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--world', default='hub')
    ap.add_argument('--out', default=os.path.join(ROOT, 'shots'))
    ap.add_argument('--fresh', action='store_true')
    ap.add_argument('--engine', default='chromium')
    ap.add_argument('--steps', default='wait:1;shot:start')
    ap.add_argument('--profile', default='')
    ap.add_argument('--size', default='1280x720')
    ap.add_argument('--url', default='')
    ap.add_argument('--quality', default='high')
    ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'), help='directory to serve (a build output)')
    ap.add_argument('--mobile', action='store_true', help='emulate a touch phone (390x844)')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    httpd, port = serve(args.docs)
    url = args.url or f'http://127.0.0.1:{port}/#{args.world}'
    w, h = map(int, args.size.split('x'))
    prof = dict(PROFILE)
    prof['settings'] = dict(PROFILE['settings'], quality=args.quality)
    if args.profile:
        prof.update(json.loads(args.profile))
    errors = []
    with sync_playwright() as p:
        bt = getattr(p, args.engine)
        launch = {'headless': True}
        if args.engine == 'firefox':
            launch['firefox_user_prefs'] = {'webgl.force-enabled': True, 'webgl.enable-webgl2': True, 'webgl.disabled': False, 'gfx.webrender.software': True}
        if args.engine == 'chromium':
            launch['args'] = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
        b = bt.launch(**launch)
        if args.mobile:
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        else:
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
        if not args.fresh:
            ctx.add_init_script(f"try {{ localStorage.setItem('elsewhere_profile_v1', {json.dumps(json.dumps(prof))}); }} catch (e) {{}}")
        page = ctx.new_page()
        page.on('console', lambda m: errors.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: errors.append(f'[pageerror] {e}'))
        t0 = time.time()
        page.goto(url)
        try:
            page.wait_for_function('window.EW && EW.world && !EW.traveling && EW.world.built', timeout=90000)
        except Exception:
            print('NOT LIVE; load message:', page.evaluate("(document.getElementById('load-msg') || {}).textContent"))
            for e in errors[:20]: print(e)
            page.screenshot(path=os.path.join(args.out, 'notlive.png'))
            raise
        print(f'live in {time.time() - t0:.1f}s: {page.evaluate("JSON.stringify(EW.debug.state())")}')
        for step in [s for s in args.steps.split(';') if s.strip()]:
            kind, _, rest = step.partition(':')
            if kind == 'wait':
                page.wait_for_timeout(float(rest) * 1000)
            elif kind == 'shot':
                path = os.path.join(args.out, f'{rest}.png')
                page.screenshot(path=path)
                print('shot', path)
            elif kind == 'tp':
                x, y, z = map(float, rest.split(','))
                page.evaluate(f'EW.debug.tp({x},{y},{z})')
            elif kind == 'look':  # yaw,pitch in degrees
                yaw, pitch = map(float, rest.split(','))
                page.evaluate(f'EW.camRig.yaw = {yaw} * Math.PI / 180; EW.camRig.pitch = {pitch} * Math.PI / 180; EW.player.yaw = EW.camRig.yaw')
            elif kind == 'key':  # key:Code:seconds
                code, _, dur = rest.partition(':')
                page.keyboard.down(code if len(code) > 1 else code)
                page.wait_for_timeout(float(dur or 0.1) * 1000)
                page.keyboard.up(code)
            elif kind == 'keys':  # keys:KeyW+Space:seconds  (hold several)
                codes, _, dur = rest.partition(':')
                cs = codes.split('+')
                for c in cs: page.keyboard.down(c)
                page.wait_for_timeout(float(dur or 0.1) * 1000)
                for c in cs: page.keyboard.up(c)
            elif kind == 'press':
                page.keyboard.press(rest)
            elif kind == 'eval':
                print('eval', page.evaluate(rest))
            elif kind == 'evalfile':  # run JS from a file (for code containing ';')
                print('evalfile', page.evaluate(open(rest).read()))
            elif kind == 'state':
                print('state', page.evaluate('JSON.stringify(EW.debug.state())'))
            elif kind == 'click':
                x, y = map(float, rest.split(','))
                page.mouse.click(x, y)
            elif kind == 'travel':
                page.evaluate(f"EW.travel('{rest}')")
                page.wait_for_timeout(500)
                page.wait_for_function(f"EW.world && EW.world.id === '{rest}' && !EW.traveling", timeout=60000)
            else:
                print('unknown step', step)
        fps = page.evaluate('''() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); })''')
        print(f'fps (headless software GL) ~{fps:.0f}')
        b.close()
    httpd.shutdown()
    bad = [e for e in errors if 'pageerror' in e or '[error]' in e]
    for e in errors[:40]:
        print(e)
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
