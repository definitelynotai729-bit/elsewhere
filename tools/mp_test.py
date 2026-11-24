#!/usr/bin/env python3
"""Two browsers join the same world over the real P2P network (Nostr relays + WebRTC) and must see each other."""
import json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

T0 = time.time()
def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs')
    if arg.startswith('http'):
        httpd, url = None, arg
    else:
        httpd, port = serve(arg)
        url = f'http://127.0.0.1:{port}/#hub'
    # The relays players meet through must still carry signalling, or players stop finding each other one day
    # without any error a player would see (src/engine/relays.js).
    sig = subprocess.run(['node', os.path.join(ROOT, 'tools', 'signal_check.mjs')], capture_output=True, text=True, timeout=60)
    print(sig.stdout.rstrip() or sig.stderr.rstrip()[-400:])
    relays_ok = sig.returncode == 0
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=WebRtcHideLocalIpsWithMdns'])
        pages = []
        for i, name in enumerate(['Ada', 'Bo', 'Mallory']):
            prof = dict(PROFILE, name=name, online=True, colors={'body': ['#ff5d8f', '#7cff6b', '#9a7cff'][i], 'head': '#eef1ff', 'visor': '#ffe066'})
            prof['settings'] = dict(PROFILE['settings'], quality='low')
            if i == 0:  # Ada wears a character body, so Bo's view checks that bodies reach other players
                prof['inv'] = dict(PROFILE.get('inv', {}), knight=1); prof['eq'] = dict(PROFILE['eq'], body='knight')
            if i == 1:  # Bo has a look from the wardrobe, so Ada's view checks that looks reach other players
                prof['look'] = {'style': 'bean', 'face': 'big', 'top': 'cat', 'outfit': 'robe', 'extra': 'scarf', 'colors': {'outfit': '#2ec4b6'}}
            ctx = b.new_context(viewport={'width': 640, 'height': 400})
            ctx.add_init_script(profile_script(prof))
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
            if min(seen) >= 2:
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
            # identity: Bo sees Ada's key fingerprint; Mallory copies Ada's signed hello byte for byte, and fails
            try:
                pages[1].wait_for_function("[...EW.net.peers.values()].some((p) => p.name === 'Ada' && p.fp)", timeout=20000)
                ada = pages[0].evaluate('EW.net.hello()')
                fp = pages[1].evaluate("[...EW.net.peers.values()].find((p) => p.name === 'Ada' && p.fp).fp")
                pages[2].evaluate("(h) => { EW.net.hello = () => h; EW.net.announce = function () { this.act.hi.send(h).catch(() => {}); }; EW.net.announce(); }", ada)
                pages[1].wait_for_function("[...EW.net.peers.values()].filter((p) => p.name === 'Ada').length === 2 && [...EW.net.peers.values()].some((p) => p.name === 'Ada' && p.label && /unverified/.test(p.label))", timeout=20000)
                labels = pages[1].evaluate("[...EW.net.peers.values()].map((p) => p.label)")
                print(f'Bo sees: {labels} (Ada\'s key fingerprint {fp})')
                if sum(1 for l in labels if l == f'Ada · {fp}') != 1: ok = False; print('identity: WRONG')
                else: print('identity: the real Ada is verified; a copy of her signed hello is not')
            except Exception as e:
                ok = False; print('identity check failed:', str(e)[:200], pages[1].evaluate("JSON.stringify([...EW.net.peers.values()].map((p) => [p.name, p.label, p.fp]))"))
            try:
                pages[1].wait_for_function("[...EW.net.peers.values()].some((p) => p.av && p.av.bodyId === 'knight' && p.av.model)", timeout=20000)
                print('Bo sees Ada as a Knight: ok')
            except Exception:
                ok = False; print('Bo does not see Ada as a Knight:', pages[1].evaluate("JSON.stringify([...EW.net.peers.values()].map((p) => [p.name, p.av && p.av.bodyId, !!(p.av && p.av.model)]))"))
            try:
                pages[0].wait_for_function("[...EW.net.peers.values()].some((p) => p.name === 'Bo' && p.av && p.av.look && p.av.look.style === 'bean' && p.av.look.outfit === 'robe' && p.av.look.colors.outfit === '#2ec4b6')", timeout=20000)
                print("Ada sees Bo's look (a bean in a teal robe): ok")
            except Exception:
                ok = False; print("Ada does not see Bo's look:", pages[0].evaluate("JSON.stringify([...EW.net.peers.values()].map((p) => [p.name, p.av && p.av.look]))"))
            pages[1].screenshot(path=os.path.join(ROOT, 'shots', 'mp-bo.png'))
        b.close()
    if httpd: httpd.shutdown()
    if not relays_ok: print('FAIL: too few meeting relays carry signalling (see above)')
    sys.exit(0 if ok and relays_ok else 1)

if __name__ == '__main__':
    main()
