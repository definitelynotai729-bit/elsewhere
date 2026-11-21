#!/usr/bin/env python3
"""Two browsers join the same world over the real P2P network (Nostr relays + WebRTC) and must see each other."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from shot import serve, PROFILE, ROOT
from playwright.sync_api import sync_playwright

T0 = time.time()
def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs')
    if arg.startswith('http'):
        httpd, url = None, arg
    else:
        httpd, port = serve(arg)
        url = f'http://127.0.0.1:{port}/#hub'
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=WebRtcHideLocalIpsWithMdns'])
        pages = []
        for i, name in enumerate(['Ada', 'Bo']):
            prof = dict(PROFILE, name=name, online=True, colors={'body': ['#ff5d8f', '#7cff6b'][i], 'head': '#eef1ff', 'visor': '#ffe066'})
            prof['settings'] = dict(PROFILE['settings'], quality='low')
            ctx = b.new_context(viewport={'width': 640, 'height': 400})
            ctx.add_init_script(f"try {{ localStorage.setItem('elsewhere_profile_v1', {json.dumps(json.dumps(prof))}); }} catch (e) {{}}")
            pg = ctx.new_page()
            pg.on('pageerror', lambda e, n=name: print(n, 'pageerror', e))
            pg.on('console', lambda m, n=name: print(f'{time.time()-T0:.1f}s', n, m.type, m.text[:200]) if ('[net]' in m.text or m.type == 'error') else None)
            pg.goto(url)
            pg.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=60000)
            pg.evaluate('EW.net.debug = true')
            pages.append(pg)
        t0 = time.time()
        ok = False
        while time.time() - t0 < 60:
            n = [pg.evaluate('EW.net.peers.size') for pg in pages]
            seen = [pg.evaluate('[...EW.net.peers.values()].filter(p => p.has && p.av).length') for pg in pages]
            if min(seen) >= 1:
                ok = True
                break
            time.sleep(1)
        print(f'peers after {time.time() - t0:.0f}s: sizes={n} with avatars={seen}')
        if ok:
            pages[0].evaluate('EW.debug.tp(5, 1.2, 10)')
            time.sleep(2.5)
            seen_pos = pages[1].evaluate('JSON.stringify([...EW.net.peers.values()].map(p => [p.name, +p.tx.toFixed(1), +p.ty.toFixed(1), +p.tz.toFixed(1)]))')
            print('Bo sees', seen_pos)
            pages[0].evaluate("EW.net.chat('hello from Ada')")
            time.sleep(2)
            print('Bo chat log:', pages[1].evaluate("document.getElementById('chat-log').innerText"))
            pages[1].screenshot(path=os.path.join(ROOT, 'shots', 'mp-bo.png'))
        b.close()
    if httpd: httpd.shutdown()
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
