#!/usr/bin/env python3
"""Smoke test: load every world in the registry, walk through each hub portal, check for errors.

usage: python3 tools/smoke.py [docs-dir] [--engines chromium,firefox,webkit]
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from shot import serve, PROFILE, ROOT
from playwright.sync_api import sync_playwright

def run(engine, docs):
    httpd, port = serve(docs)
    reg = json.load(open(os.path.join(docs, 'worlds', 'registry.json')))
    ids = [w['id'] for w in reg['worlds']]
    errors, report = [], []
    with sync_playwright() as p:
        bt = getattr(p, engine)
        kw = {'headless': True}
        if engine == 'firefox':
            kw['firefox_user_prefs'] = {'webgl.force-enabled': True, 'webgl.enable-webgl2': True, 'webgl.disabled': False, 'gfx.webrender.software': True}
        if engine == 'chromium':
            kw['args'] = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        b = bt.launch(**kw)
        ctx = b.new_context(viewport={'width': 960, 'height': 540})
        prof = dict(PROFILE)
        prof['settings'] = dict(PROFILE['settings'], quality='low')
        ctx.add_init_script(f"try {{ localStorage.setItem('elsewhere_profile_v1', {json.dumps(json.dumps(prof))}); }} catch (e) {{}}")
        page = ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text[:300]}') if m.type == 'error' and 'favicon' not in m.text else None)
        page.goto(f'http://127.0.0.1:{port}/#hub')
        page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=90000)
        # every world loads directly and its hash check passes
        for wid in ids:
            t0 = time.time()
            page.evaluate(f"EW.travel('{wid}')")
            page.wait_for_timeout(300)
            page.wait_for_function(f"EW.world && EW.world.id === '{wid}' && EW.world.built && !EW.traveling", timeout=60000)
            page.wait_for_timeout(600)
            st = json.loads(page.evaluate('JSON.stringify(EW.debug.state())'))
            n = page.evaluate('({ coins: EW.world.coins.length, portals: EW.world.portals.length, zones: EW.world.zones.length, statics: EW.world.statics.length })')
            report.append(f'{wid:10s} loaded in {time.time() - t0:4.1f}s  pos {st["pos"]}  {n}')
        # walking into each hub portal lands in that world, in front of its return portal
        page.evaluate("EW.travel('hub')")
        page.wait_for_function("EW.world && EW.world.id === 'hub' && !EW.traveling", timeout=60000)
        page.wait_for_timeout(500)
        portals = page.evaluate("EW.world.portals.map(p => ({ to: p.to, x: p.pos.x, y: p.pos.y, z: p.pos.z }))")
        for pt in portals:
            page.evaluate("EW.travel('hub')")
            page.wait_for_function("EW.world && EW.world.id === 'hub' && !EW.traveling", timeout=60000)
            page.wait_for_timeout(400)
            page.evaluate(f"EW.debug.tp({pt['x']}, {pt['y'] + 2.6}, {pt['z']})")
            try:
                page.wait_for_function(f"EW.world && EW.world.id === '{pt['to']}' && !EW.traveling", timeout=20000)
                page.wait_for_timeout(500)
                back = page.evaluate("(() => { const b = EW.world.portals.find(p => p.to === 'hub'); if (!b) return null; const p = EW.player.pos; return Math.hypot(p.x - b.pos.x, p.z - b.pos.z).toFixed(1); })()")
                report.append(f'portal hub -> {pt["to"]:9s} ok, arrived {back} m from the return portal')
            except Exception as e:
                errors.append(f'portal to {pt["to"]} did not work: {e}')
        b.close()
    httpd.shutdown()
    return report, errors

if __name__ == '__main__':
    args = sys.argv[1:]
    engines = ['chromium']
    if '--engines' in args:
        i = args.index('--engines'); engines = args[i + 1].split(','); del args[i:i + 2]
    docs = args[0] if args else os.path.join(ROOT, 'docs')
    bad = False
    for eng in engines:
        rep, errs = run(eng, docs)
        print(f'== {eng}')
        for r in rep: print('  ' + r)
        for e in errs[:20]: print('  ERROR ' + e)
        bad = bad or bool(errs)
    sys.exit(1 if bad else 0)
