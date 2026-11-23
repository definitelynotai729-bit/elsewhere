#!/usr/bin/env python3
"""Render the social preview image (docs/og.png, 1200x630) from a real hub frame: the title over Junction."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

docs = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs')
httpd, port = serve(docs)
prof = dict(PROFILE, eq={'head': 'crown', 'back': 'glider', 'hand': None, 'feet': None, 'board': None}, inv={'crown': 1, 'glider': 1})
prof['settings'] = dict(PROFILE['settings'], quality='high')
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': 1200, 'height': 630})
    ctx.add_init_script(profile_script(prof))
    pg = ctx.new_page()
    pg.goto(f'http://127.0.0.1:{port}/#hub')
    pg.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=90000)
    # the title's view (ART.md): high over Junction with the name on top, as a first visit opens
    pg.add_style_tag(content='#hud, #touch-ui, .ti-card { display: none !important; } #title { background: none; padding-top: 34px; }')
    pg.evaluate("document.getElementById('title').classList.remove('hidden'); EW.attract = { t: 0, a0: 1.05, k: 0, leaving: false }")
    pg.wait_for_timeout(4500)
    out = os.path.join(docs, 'og.png')
    pg.screenshot(path=out)
    print('wrote', out)
    b.close()
httpd.shutdown()
