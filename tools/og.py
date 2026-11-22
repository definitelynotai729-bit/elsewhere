#!/usr/bin/env python3
"""Render the social preview image (docs/og.png, 1200x630) from a real hub frame."""
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
    pg.add_style_tag(content='#hud, #touch-ui { display: none !important; }')
    pg.evaluate('EW.debug.tp(-6, 1, 15); EW.player.yaw = Math.PI * 0.9')
    pg.wait_for_timeout(600)
    pg.evaluate('EW.camRig.yaw = Math.PI * 1.08; EW.camRig.pitch = 0.16; EW.camRig.dist = 9')
    pg.wait_for_timeout(4200)
    out = os.path.join(docs, 'og.png')
    pg.screenshot(path=out)
    print('wrote', out)
    b.close()
httpd.shutdown()
