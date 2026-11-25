#!/usr/bin/env python3
"""Phones: every world played by touch on an emulated phone (RELEASE.md: "touch controls in every world").

A landscape phone (844x390, touch) in Chromium, which can send real touch sequences (CDP Input.dispatchTouchEvent:
press, drag, hold, lift) to the page. In every world:
  - the touch controls show, and no two of the buttons showing overlap;
  - the stick (a drag on the left of the screen) walks the player; a drag on the right turns the camera;
  - JUMP jumps, and each button's press reaches the game's input for that tick (the run log's bits: what a replay
    plays back), not just the screen;
  - the world's own verbs: talking (USE beside a character opens the dialog, and taps page through it), gliding (hold
    JUMP while falling, Skyreach), riding (BOARD, Neon Circuit), the arena's buttons (Spire Clash), striking (STRIKE,
    only inside Junction's training yard: blades stay sheathed on the plaza);
  - no page errors, and no world callback errors.
Then a portrait look (390x844) at every world, for overlaps.

usage: python3 tools/phone_check.py [DOCS|URL] [--worlds a,b] [--out DIR]
The test profile owns a glider, a hoverboard and the katana, never publishes (verify off), and meets nobody (every
WebSocket is stubbed). Origin is left out: before the hunt is done it says "sealed" and sends you back to Junction.
"""
import argparse, json, os, re, sys, tempfile, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('target', nargs='?', default=os.path.join(ROOT, 'docs'))
ap.add_argument('--worlds', default='')
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'phone-check'))
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
if a.target.startswith('http'):
    URL = a.target if a.target.endswith('/') else a.target + '/'
    import urllib.request
    reg = json.loads(urllib.request.urlopen(URL + 'worlds/registry.json').read())
else:
    httpd, port = serve(os.path.abspath(a.target)); URL = f'http://127.0.0.1:{port}/'
    reg = json.load(open(os.path.join(a.target, 'worlds', 'registry.json')))
WORLDS = a.worlds.split(',') if a.worlds else [w['id'] for w in reg['worlds'] if w['id'] != 'origin']
if 'hub' in WORLDS: WORLDS = ['hub'] + [w for w in WORLDS if w != 'hub']

prof = json.loads(json.dumps(PROFILE))
prof['inv'] = {'glider': 1, 'hoverboard': 1, 'katana': 1}
prof['eq'] = dict(prof['eq'], back='glider', board='hoverboard', hand='katana')
prof['settings']['quality'] = 'low'

fails, notes = [], []
def check(ok, what):
    print(('  ok   ' if ok else '  FAIL ') + what, flush=True)
    if not ok: fails.append(what)
READY = 'window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && !EW.sim.ended && EW.player'
VISIBLE = r"""(sel) => [...document.querySelectorAll(sel)].filter((e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
  return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && !e.classList.contains('hidden') && +s.opacity > 0.05; })
  .map((e) => { const r = e.getBoundingClientRect(); return { id: e.id || e.className, x: r.left, y: r.top, w: r.width, h: r.height, round: parseFloat(getComputedStyle(e).borderTopLeftRadius) >= Math.min(r.width, r.height) / 2 - 1 }; })"""
def overlapping(btns):
    out = []
    for i, p in enumerate(btns):
        for q in btns[i + 1:]:
            if p['round'] and q['round']:
                d = ((p['x'] + p['w'] / 2 - q['x'] - q['w'] / 2) ** 2 + (p['y'] + p['h'] / 2 - q['y'] - q['h'] / 2) ** 2) ** 0.5
                hit = d < min(p['w'], p['h']) / 2 + min(q['w'], q['h']) / 2 - 2
            else: hit = p['x'] < q['x'] + q['w'] - 2 and q['x'] < p['x'] + p['w'] - 2 and p['y'] < q['y'] + q['h'] - 2 and q['y'] < p['y'] + p['h'] - 2
            if hit: out.append((p['id'], q['id']))
    return out

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, is_mobile=True, has_touch=True)
    ctx.add_init_script(profile_script(prof)); ctx.route_web_socket(re.compile('.*'), lambda ws: None)
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)

    def touch(kind, pts=()):
        cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i + 1} for i, (x, y) in enumerate(pts)]})
    def free_point(x, y):
        """a spot on the 3D view itself (not a button or panel) near x, y"""
        for dx, dy in ((0, 0), (0, -40), (40, 0), (-40, 0), (0, 40), (60, -60), (-60, -60)):
            if pg.evaluate(f"(document.elementFromPoint({x + dx}, {y + dy}) || {{}}).id === 'view'"): return x + dx, y + dy
        return None
    def bits_since(n0): return pg.evaluate(f'Array.from(EW.rec.bits.subarray({n0}, EW.rec.n)).reduce((a, x) => a | x, 0)')
    def recn(): return pg.evaluate('EW.rec.n')
    def button(bid):
        r = pg.evaluate(f"(() => {{ const e = document.getElementById({json.dumps(bid)}); if (!e) return null; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return (r.width && s.display !== 'none') ? [r.left + r.width / 2, r.top + r.height / 2] : null; }})()")
        return r
    def tap(bid, hold=0.12):
        c = button(bid)
        if not c: return False
        touch('touchStart', [c]); pg.wait_for_timeout(int(hold * 1000)); touch('touchEnd'); return True
    def pos(): return pg.evaluate('[EW.player.pos.x, EW.player.pos.y, EW.player.pos.z]')
    def wait_until(js, ms=3000):
        try: pg.wait_for_function(js, timeout=ms); return True
        except Exception: return False
    def go(w):
        if pg.evaluate('EW.world && EW.world.id') == w: return True
        pg.evaluate(f'EW.travel({json.dumps(w)})'); pg.wait_for_timeout(400)
        try: pg.wait_for_function(READY + f' && EW.world.id === {json.dumps(w)}', timeout=120000); pg.wait_for_timeout(2500); return True
        except Exception: return False
    def close_dialogs():
        for _ in range(30):
            if not pg.evaluate("!document.getElementById('dialog').classList.contains('hidden')"): return True
            ch = pg.evaluate("(() => { const c = document.querySelector('#dialog .choices button'); if (!c) return null; const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()")
            c = ch or pg.evaluate("(() => { const r = document.getElementById('dialog').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()")
            touch('touchStart', [c]); pg.wait_for_timeout(60); touch('touchEnd'); pg.wait_for_timeout(350)
        return False
    def talk():
        """walk-in distance from the nearest character's talk point, then USE"""
        spot = pg.evaluate(r"""(() => { const p = EW.player.pos; let best = null, bd = 1e9;
          for (const it of EW.world.interactables) { if (it.enabled === false || !/talk/i.test(it.label || '')) continue; const q = it.pos; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = it; } }
          return best ? { x: best.pos.x, y: best.pos.y, z: best.pos.z, label: best.label, r: best.radius } : null; })()""")
        if not spot: return None
        pg.evaluate(f"EW.debug.tp({spot['x'] + 1.4}, {spot['y'] + 0.5}, {spot['z'] + 0.6})"); pg.wait_for_timeout(900)
        n0 = recn(); ok = tap('tb-use')
        opened = ok and wait_until("!document.getElementById('dialog').classList.contains('hidden')", 4000)
        return spot['label'], opened, bool(bits_since(n0) & 8), close_dialogs()

    pg.goto(URL + '#' + WORLDS[0]); pg.wait_for_function(READY, timeout=180000); pg.wait_for_timeout(2500)
    check(pg.evaluate("document.body.classList.contains('touch')"), 'the game knows it is on a touch screen')
    for w in WORLDS:
        print(f'-- {w}', flush=True)
        if not go(w): check(False, f'{w}: arrives'); continue
        e0 = len(errs)
        topdown = pg.evaluate("document.body.classList.contains('topdown')")
        btns = pg.evaluate(VISIBLE, '#touch-ui .tbtn')
        names = [x['id'] for x in btns]
        over = overlapping(btns)
        check(len(btns) >= 2 and not over, f'{w}: touch buttons show ({", ".join(n.replace("tb-", "") for n in names)}), none overlapping {over or ""}')
        pg.screenshot(path=os.path.join(a.out, f'{w}-landscape.png'))
        if not topdown: # JUMP first, where the world puts you (a walk can end on Crystal Rush's start pad, which holds you for its countdown)
            n0 = recn(); g0 = pos()[1]
            ok = tap('tb-jump')
            peak = g0
            for _ in range(8): pg.wait_for_timeout(70); peak = max(peak, pos()[1])
            check(ok and bits_since(n0) & 1 and peak - g0 > 0.3, f'{w}: JUMP jumps (+{peak - g0:.1f} m)')
            pg.wait_for_timeout(700)
            close_dialogs()
            lk = free_point(640, 170); y0 = pg.evaluate('EW.camRig.yaw')
            if lk:
                touch('touchStart', [lk])
                for k in range(1, 9): touch('touchMove', [(lk[0] + 12 * k, lk[1])]); pg.wait_for_timeout(25)
                touch('touchEnd'); pg.wait_for_timeout(200)
            check(lk and abs(pg.evaluate('EW.camRig.yaw') - y0) > 0.05, f'{w}: a drag on the right turns the camera')
        close_dialogs()
        # the stick: a drag on the left, held
        p0 = pos(); st = free_point(170, 300)
        if st:
            touch('touchStart', [st]); pg.wait_for_timeout(80)
            for k in range(1, 7): touch('touchMove', [(st[0], st[1] - 10 * k)]); pg.wait_for_timeout(30)
            pg.wait_for_timeout(1300); touch('touchEnd'); pg.wait_for_timeout(300)
            p1 = pos(); d = ((p1[0] - p0[0]) ** 2 + (p1[2] - p0[2]) ** 2) ** 0.5
            check(d > 1.0, f'{w}: the stick walks ({d:.1f} m)')
        else: check(False, f'{w}: a free spot for the stick')
        if topdown:
            arena = [('tb-q', 16), ('tb-e', 32), ('tb-r', 64), ('tb-dash', 128), ('tb-recall', 256)]
            got = []
            for bid, bit in arena:
                pg.wait_for_timeout(250); n0 = recn()
                if tap(bid) and wait_until(f'Array.from(EW.rec.bits.subarray({n0}, EW.rec.n)).some((x) => x & {bit})', 2000): got.append(bid.replace('tb-', ''))
            check(len(got) == len(arena), f'{w}: the arena buttons reach the game ({", ".join(got)})')
        # the world's own verbs
        if w == 'hub':
            check('tb-strike' not in names, 'hub: no STRIKE on the plaza (blades stay sheathed)')
            yard = pg.evaluate("(() => { const z = EW.world.zones.find((z) => z.r === 11); return z ? [z.c.x, z.c.y, z.c.z] : null; })()")
            if yard:
                pg.evaluate(f'EW.debug.tp({yard[0]}, {yard[1] + 0.5}, {yard[2]})'); pg.wait_for_timeout(1200)
                n0 = recn(); ok = tap('tb-strike')
                check(ok and wait_until(f'Array.from(EW.rec.bits.subarray({n0}, EW.rec.n)).some((x) => x & 512)', 2000), 'hub: STRIKE shows in the training yard, and strikes')
            else: check(False, 'hub: the training yard (a zone of radius 11)')
        if w == 'skyreach':
            pg.evaluate('EW.debug.tp(EW.player.pos.x, EW.player.pos.y + 14, EW.player.pos.z)'); pg.wait_for_timeout(250)
            c = button('tb-jump'); touch('touchStart', [c])
            glid = wait_until('EW.player.gliding', 2500); touch('touchEnd')
            check(glid, 'skyreach: holding JUMP while falling glides')
            pg.wait_for_timeout(2500)
        if w == 'circuit':
            n0 = recn(); ok = tap('tb-board')
            on = ok and wait_until('EW.player.board', 2000)
            st = free_point(170, 300); s0 = 0
            if on and st:
                touch('touchStart', [st])
                for k in range(1, 7): touch('touchMove', [(st[0], st[1] - 10 * k)]); pg.wait_for_timeout(30)
                for _ in range(12): pg.wait_for_timeout(100); s0 = max(s0, pg.evaluate('Math.abs(EW.player.boardSpeed)'))
                touch('touchEnd')
            check(on and s0 > 2, f'circuit: BOARD rides, and the stick drives it ({s0:.1f} m/s)')
            tap('tb-board'); pg.wait_for_timeout(500)
        if w in ('hub', 'lsb-thyra', 'lsb-pterousa', 'halcyon', 'underfoot', 'skyreach', 'circuit', 'glowcave'):
            r = talk()
            if r is None: notes.append(f'{w}: no character to talk to near enough')
            else:
                label, opened, bit, closed = r
                check(opened and bit, f'{w}: USE beside a character opens the talk ("{label}")')
                check(closed, f'{w}: taps page through the dialog to its end')
        check(len(errs) == e0, f'{w}: no page errors {errs[e0:e0 + 3]}')

    print('-- portrait (390x844)', flush=True)
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(800)
    for w in WORLDS:
        if not go(w): continue
        btns = pg.evaluate(VISIBLE, '#touch-ui .tbtn')
        over = overlapping(btns)
        off = [x['id'] for x in btns if x['x'] < -1 or x['y'] < -1 or x['x'] + x['w'] > 391 or x['y'] + x['h'] > 845]
        check(not over and not off, f'{w}: portrait buttons fit, none overlapping {over or ""}{off or ""}')
        pg.screenshot(path=os.path.join(a.out, f'{w}-portrait.png'))
    # Auto quality: a device that stutters steps down once, and the next visit starts there (settings.autoQ)
    print('-- Auto quality remembers its step-down', flush=True)
    auto = json.loads(json.dumps(PROFILE)); auto['settings']['quality'] = 'auto'
    c2 = b.new_context(viewport={'width': 844, 'height': 390})
    c2.add_init_script("if (!sessionStorage.getItem('ew-once')) { sessionStorage.setItem('ew-once', '1'); " + profile_script(auto) + " }") # once: the game's own saves must survive the reload
    c2.route_web_socket(re.compile('.*'), lambda ws: None)
    p2 = c2.new_page(); s2 = c2.new_cdp_session(p2)
    p2.goto(URL + '#hub'); p2.wait_for_function(READY, timeout=180000)
    q0 = p2.evaluate('EW.render.quality')
    s2.send('Emulation.setCPUThrottlingRate', {'rate': 20}) # a slow device
    stepped = False
    try: p2.wait_for_function('!!EW.autoQuality', timeout=90000); stepped = True
    except Exception: pass
    s2.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    saved = p2.evaluate('EW.profile.data.settings.autoQ')
    check(stepped and q0 == 'high' and saved == p2.evaluate('EW.autoQuality'), f'a stuttering computer steps down from {q0} to {saved}, and it is saved')
    p2.reload(); p2.wait_for_function(READY, timeout=180000)
    check(p2.evaluate('EW.render.quality') == saved and not p2.evaluate('EW.autoQuality'), f'the next visit starts at {saved}, before any stutter')
    p2.evaluate("EW.ui.menuTab = 'graphics'; EW.ui.openPanel('menu')"); p2.wait_for_timeout(400)
    p2.evaluate("(() => { const q = [...document.querySelectorAll('#panel select')].find((x) => [...x.options].some((o) => o.value === 'ultra')); q.value = 'low'; q.onchange(); q.value = 'auto'; q.onchange(); })()")
    check(p2.evaluate("EW.profile.data.settings.autoQ === '' && EW.render.quality === 'high'"), 'choosing Auto again starts over (High on a computer)')
    c2.close()
    b.close()
for n in notes: print('  note ' + n)
print(f'screenshots: {a.out}')
print('PHONE OK' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
