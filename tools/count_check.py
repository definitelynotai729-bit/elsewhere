#!/usr/bin/env python3
"""Anonymous counts in the real game (src/engine/count.js), against a stand-in counter on this machine.

usage: python3 tools/count_check.py [DOCS|URL] [--engine chromium|webkit|both]

With a docs directory (default: docs/), the game runs locally and a test hook (window.__elsewhereCount) points it at
a stand-in counter that records every request:
  1. off by default: the game as built contacts no counter (no account yet), and the Menu has no counts switch;
  2. a first visit: the page view, Junction, the title, then Play;
  3. play: minutes of play, and once the frame rate with the device and quality (a test minute is 3 s);
  4. a world and an item, each counted once however often they come up;
  5. a returning visit: the days away (today), and a page view of its own;
  6. the Menu's switch: off, and nothing more is counted, not even a world; on again, and it counts;
  7. Do Not Track: nothing at all, and the Menu says why;
  8. every request: only GoatCounter's fields, paths from the fixed list, never the player's name or key.
With a URL (the live site), only check 1: the game there contacts no counter until the team switches counting on.
"""
import json, os, re, sys, threading, http.server, socketserver, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, profile_script, ROOT
from proof_test import launch
from playwright.sync_api import sync_playwright

args = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith('--') and sys.argv[i - 1] != '--engine']
TARGET = args[0] if args else os.path.join(ROOT, 'docs')
LIVE = TARGET.startswith('http')
ENGINES = (lambda e: ['chromium', 'webkit'] if e == 'both' else [e])(sys.argv[sys.argv.index('--engine') + 1] if '--engine' in sys.argv else 'chromium')
SAFE = re.compile(r'^[a-z0-9][a-z0-9/.+-]{0,63}$')
FIELDS = {'p', 't', 'r', 'e', 's', 'b', 'q', 'rnd'}
READY = 'window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && EW.sim.tick > 10'

fails = 0
def check(ok, what, detail=''):
    global fails
    print(('PASS  ' if ok else 'FAIL  ') + what + (' · ' + str(detail) if detail != '' else ''), flush=True)
    if not ok: fails += 1

# the stand-in counter: records each request's query (GET or POST, as sendBeacon sends it). hits: this scenario's;
# every: all of them, for the audit (8)
hits, every, secrets = [], [], set()
class Counter(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def handle_one(self):
        u = urllib.parse.urlsplit(self.path)
        if u.path == '/count':
            q = urllib.parse.parse_qsl(u.query, keep_blank_values=True)
            h = dict(q) | {'_keys': [k for k, _ in q], '_raw': urllib.parse.unquote(self.path)}
            hits.append(h); every.append(h)
        self.send_response(200); self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Content-Length', '0'); self.end_headers()
    def do_GET(self): self.handle_one()
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n: self.rfile.read(n)
        self.handle_one()
cs = socketserver.ThreadingTCPServer(('127.0.0.1', 0), Counter); cs.daemon_threads = True
threading.Thread(target=cs.serve_forever, daemon=True).start()
ENDPOINT = f'http://127.0.0.1:{cs.server_address[1]}/count'
HOOK = "window.__elsewhereCount = { endpoint: %s, minute: 3000 };" % json.dumps(ENDPOINT)

def paths(): return [h.get('p') for h in hits]
def wait_paths(pg, want, timeout=60):
    """wait (in page time) until every path in want has been counted"""
    for _ in range(int(timeout * 4)):
        if all(w in paths() for w in want): return True
        pg.wait_for_timeout(250)
    return False

def run(engine, url):
    global hits
    with sync_playwright() as p:
        b = launch(p, engine)
        errors = []
        def context(hook=True, prof=None, extra=''):
            ctx = b.new_context(viewport={'width': 1100, 'height': 650})
            ctx.route_web_socket(re.compile('.*'), lambda ws: None)  # no relays: nothing leaves this machine
            gc = []
            ctx.route(re.compile(r'.*goatcounter\.com.*'), lambda route: (gc.append(route.request.url), route.abort()))
            if hook: ctx.add_init_script(HOOK)
            if extra: ctx.add_init_script(extra)
            if prof: ctx.add_init_script(profile_script(prof))
            pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
            return ctx, pg, gc

        # 1. off by default: no hook, the game as built
        hits = []
        ctx, pg, gc = context(hook=False, prof=PROFILE)
        pg.goto(url + '#hub')
        try: pg.wait_for_function(READY, timeout=120000)
        except Exception:
            print('      page state:', pg.evaluate("({ world: window.EW && EW.world && EW.world.id, built: window.EW && EW.world && EW.world.built, trav: window.EW && EW.traveling, tick: window.EW && EW.sim && EW.sim.tick, msg: (document.getElementById('load-msg') || {}).textContent, errs: %s })" % json.dumps(errors[:3])))
            raise
        pg.evaluate("EW.travel('skyreach')"); pg.wait_for_function(READY + " && EW.world.id === 'skyreach'", timeout=60000); pg.wait_for_timeout(1500)
        r = pg.evaluate("({ active: EW.count.active, why: EW.count.why() })")
        pg.evaluate("EW.ui.menuTab = 'online'; EW.ui.openPanel('menu')")
        pg.wait_for_timeout(500)
        switch = pg.locator("text=Count my visits anonymously").count()
        check(not r['active'] and not gc and not hits and switch == 0, f'{engine}: off by default: no counter contacted, no counts switch in the Menu', r['why'])
        ctx.close()
        if LIVE:
            b.close(); return

        # 2. a first visit, with the stand-in counter
        hits = []
        ctx, pg, gc = context()
        pg.goto(url + '#hub'); pg.wait_for_function('window.EW && EW.world && EW.world.built', timeout=120000)
        pg.locator('#ti-play').wait_for(timeout=30000)
        first = wait_paths(pg, ['/', 'world/hub', 'title'], 20)
        pg.fill('#ti-name', 'Tester'); pg.uncheck('#ti-online'); pg.click('#ti-play')
        started = wait_paths(pg, ['start/new'], 20)
        secrets.update([pg.evaluate("EW.profile.data.name || ''"), pg.evaluate("(EW.profile.data.key && EW.profile.data.key.pub) || ''")])
        order = [x for x in paths() if x in ('/', 'world/hub', 'title', 'start/new')]
        check(first and started and order == ['/', 'world/hub', 'title', 'start/new'], f'{engine}: a first visit: the page view, Junction, the title, then Play', ' '.join(order))
        pv = next((h for h in hits if h.get('p') == '/'), {})
        check(pv.get('t') == 'Elsewhere' and 'e' not in pv and pv.get('b') == '0' and pv.get('s', '').isdigit(), f'{engine}: the page view is a page view (no event flag, bot score 0, a screen width)', {k: v for k, v in pv.items() if not k.startswith('_')})

        # 3. play: a test minute is 3 s of the world running in front
        timed = wait_paths(pg, ['time/1m'], 60)
        for _ in range(240):
            if any((x or '').startswith('perf/') for x in paths()): break
            pg.wait_for_timeout(250)
        pf = [x for x in paths() if (x or '').startswith('perf/')]
        q = pg.evaluate('EW.render.quality')
        check(timed and len(pf) == 1 and re.match(r'^perf/computer/%s/fps-(0-20|20-30|30-45|45-55|55\+)$' % re.escape(q), pf[0] or ''), f'{engine}: a minute of play, then the frame rate once, with the device and quality', ' '.join(pf))

        # 4. a world and an item, each once
        pg.evaluate("EW.travel('skyreach')"); pg.wait_for_function(READY + " && EW.world.id === 'skyreach'", timeout=60000)
        pg.evaluate("EW.travel('hub')"); pg.wait_for_function(READY + " && EW.world.id === 'hub'", timeout=60000)
        pg.evaluate("EW.travel('skyreach')"); pg.wait_for_function(READY + " && EW.world.id === 'skyreach'", timeout=60000)
        item = pg.evaluate("['glider', 'cap', 'lantern'].find((id) => EW.items.get(id)) || ''")
        pg.evaluate(f"EW.sim.claims.push([EW.sim.tick, 'give', '{item}']); EW.sim.claims.push([EW.sim.tick, 'give', '{item}'])")
        wait_paths(pg, [f'item/{item}'], 10); pg.wait_for_timeout(800)
        check(paths().count('world/skyreach') == 1 and paths().count('world/hub') == 1 and paths().count(f'item/{item}') == 1, f'{engine}: a world and an item each counted once, however often they come up', f"skyreach x{paths().count('world/skyreach')}, item/{item} x{paths().count(f'item/{item}')}")

        # 5. a returning visit (the profile is made now; the last visit was this one)
        before = len(hits)
        pg.reload(); pg.wait_for_function(READY, timeout=120000)
        back = wait_paths(pg, ['back/today'], 20)
        newer = [h.get('p') for h in hits[before:]]
        check(back and newer[:1] == ['/'] and 'title' not in newer, f'{engine}: a returning visit: its own page view, and back/today (no title)', ' '.join(newer[:4]))

        # 6. the Menu's switch
        pg.evaluate("EW.ui.menuTab = 'online'; EW.ui.openPanel('menu')"); pg.wait_for_timeout(600)
        sw = pg.locator('label.row', has_text='Count my visits anonymously').locator('input[type=checkbox]')
        shown = sw.count() == 1
        if shown: sw.first.uncheck()
        pg.evaluate("EW.ui.closePanel()")
        n0 = len(hits)
        pg.evaluate("EW.travel('glowcave')"); pg.wait_for_function(READY + " && EW.world.id === 'glowcave'", timeout=60000); pg.wait_for_timeout(1500)
        silent = len(hits) == n0
        pg.evaluate("EW.profile.data.settings.counts = true; EW.profile.save()")
        pg.evaluate("EW.travel('circuit')"); pg.wait_for_function(READY + " && EW.world.id === 'circuit'", timeout=60000)
        again = wait_paths(pg, ['world/circuit'], 10)
        check(shown and silent and again and 'world/glowcave' not in paths(), f'{engine}: the Menu switch: off counts nothing (not even a world); on again, it counts', f'shown {shown}, silent {silent}')
        ctx.close()

        # 7. Do Not Track
        hits = []
        ctx, pg, gc = context(prof=PROFILE, extra="Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' });")
        pg.goto(url + '#hub'); pg.wait_for_function(READY, timeout=120000)
        pg.evaluate("EW.travel('skyreach')"); pg.wait_for_function(READY + " && EW.world.id === 'skyreach'", timeout=60000); pg.wait_for_timeout(4000)
        pg.evaluate("EW.ui.menuTab = 'online'; EW.ui.openPanel('menu')"); pg.wait_for_timeout(600)
        said = pg.evaluate("document.body.innerText.includes('asks sites not to track you')")
        check(not hits and said, f'{engine}: Do Not Track: nothing counted at all, and the Menu says why', f'{len(hits)} requests')
        ctx.close()
        b.close()
    return errors

for eng in ENGINES:
    every.clear()
    if LIVE: errs = run(eng, TARGET.rstrip('/') + '/') or []
    else:
        httpd, port = serve(TARGET)
        errs = run(eng, f'http://127.0.0.1:{port}/') or []
        httpd.shutdown()
        # 8. everything this engine's run sent, from the first visit to Do Not Track
        bad_keys = [h['_keys'] for h in every if not set(h['_keys']) <= FIELDS]
        bad_paths = [h.get('p') for h in every if not SAFE.match((h.get('p') or '').lstrip('/') or 'x')]
        leaks = [h['_raw'][:80] for h in every for x in secrets if x and len(x) > 2 and x in h['_raw']]
        check(every and not bad_keys and not bad_paths and not leaks, f"{eng}: all {len(every)} requests carry only GoatCounter's fields and listed paths, never the player's name or key",
              f"{len(set(h.get('p') for h in every))} different paths" if not (bad_keys or bad_paths or leaks) else (bad_keys[:2], bad_paths[:3], leaks[:2]))
    check(not [e for e in errs if 'WebGL' not in e], f'{eng}: no page errors', errs[:3])

cs.shutdown()
print(f'{fails} FAILED' if fails else 'COUNT CHECK OK')
sys.exit(1 if fails else 0)
