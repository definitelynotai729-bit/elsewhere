#!/usr/bin/env python3
"""Area of interest, with four real players in one room (G8 step 1).

usage: python3 tools/aoi_test.py

Ada walks; Bo and Cy stand near her; Dee stands far away (the test shrinks the ranges to fit Junction:
positions full-rate within 10 m, voice within 10 m). Everyone has Chromium's fake microphone, and Ada opens hers.
  - Bo gets Ada's position at the full rate (about 10 a second), Dee only the once-a-second update.
  - Ada's voice goes to Bo and Cy, not to Dee.
  - When Dee walks over, Dee starts getting both.
Uses the public Nostr relays to find the other pages, as the game does; nothing is published.
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

fails = 0
def check(ok, what, detail=''):
    global fails
    print(('PASS  ' if ok else 'FAIL  ') + what + (' · ' + str(detail) if detail != '' else ''))
    if not ok: fails += 1

def main():
    httpd, port = serve(os.path.join(ROOT, 'docs'))
    url = f'http://127.0.0.1:{port}/#hub'
    names = ['Ada', 'Bo', 'Cy', 'Dee']
    spots = {'Ada': (0, 10), 'Bo': (2.5, 10), 'Cy': (-2.5, 11), 'Dee': (14, -14)}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=WebRtcHideLocalIpsWithMdns',
                                                   '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        pages = {}
        for i, name in enumerate(names):
            prof = dict(PROFILE, name=name, online=True)
            prof['settings'] = dict(PROFILE['settings'], quality='low', voice={'on': False, 'mode': 'open', 'hear': True})
            ctx = b.new_context(viewport={'width': 480, 'height': 300}, permissions=['microphone'])
            ctx.add_init_script(profile_script(prof))
            pg = ctx.new_page(); pg.goto(url)
            pg.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=90000)
            pages[name] = pg
        t0 = time.time()
        while time.time() - t0 < 90:
            if all(pg.evaluate('[...EW.net.peers.values()].filter((p) => p.has).length') >= 3 for pg in pages.values()): break
            time.sleep(1)
        check(all(pg.evaluate('[...EW.net.peers.values()].filter((p) => p.has).length') >= 3 for pg in pages.values()), 'all four players found each other', f'{time.time() - t0:.0f} s')
        for name, pg in pages.items():
            x, z = spots[name]
            pg.evaluate(f"EW.net.aoi.range = 10; EW.net.aoi.voiceRange = 10; EW.debug.tp({x}, 1.2, {z})")
        time.sleep(3)
        who = {name: pg.evaluate('EW.net.selfId || null') for name, pg in pages.items()}
        idof = lambda viewer, name: pages[viewer].evaluate(f"(() => {{ const p = [...EW.net.peers.values()].find((q) => q.name === '{name}'); return p ? p.id : null; }})()")
        ada_at_bo, ada_at_dee = idof('Bo', 'Ada'), idof('Dee', 'Ada')
        count = lambda viewer, pid: pages[viewer].evaluate(f"(EW.net.peers.get('{pid}') || {{}}).received || 0")
        # record whom each of Ada's position updates goes to (headless rendering is slow, so check routing, not rates)
        RECORD = """(() => { const st = EW.net.act.st, send = st.send.bind(st); EW.net._log = [];
          st.send = (m, o) => { EW.net._log.push(o && o.target ? o.target.map((id) => (EW.net.peers.get(id) || {}).name).sort().join(',') : 'ALL'); return send(m, o); }; })()"""
        pages['Ada'].evaluate(RECORD)
        b0, d0 = count('Bo', ada_at_bo), count('Dee', ada_at_dee)
        pages['Ada'].keyboard.down('KeyW'); pages['Ada'].keyboard.down('KeyA') # a small circle: her position changes all the time
        time.sleep(8)
        pages['Ada'].keyboard.up('KeyW'); pages['Ada'].keyboard.up('KeyA')
        log = pages['Ada'].evaluate('EW.net._log')
        near = [t for t in log if t != 'ALL']; alls = log.count('ALL')
        nb, nd = count('Bo', ada_at_bo) - b0, count('Dee', ada_at_dee) - d0
        check(near and all('Dee' not in t for t in near) and all(t in ('Bo,Cy', 'Bo', 'Cy') for t in near), "Ada's full-rate updates go to the players near her, never to the far one", f'{len(near)} targeted to {sorted(set(near))}')
        check(2 <= alls <= 10, 'everyone still gets her position about once a second', f'{alls} broadcasts in 8 s')
        check(nb > nd, 'so Bo hears from Ada more often than Dee does', f'Bo {nb}, Dee {nd}')
        # voice: Ada opens her microphone; it should reach Bo and Cy only
        pages['Ada'].evaluate('EW.voice.enable()')
        time.sleep(4)
        sending = pages['Ada'].evaluate('[...EW.voice.sendingTo].map((id) => (EW.net.peers.get(id) || {}).name).sort()')
        check(sending == ['Bo', 'Cy'], "Ada's voice goes to the players within earshot only", sending)
        time.sleep(4)
        bo_hears = pages['Bo'].evaluate(f"EW.voice.peers.has('{ada_at_bo}')"); dee_hears = pages['Dee'].evaluate(f"EW.voice.peers.has('{ada_at_dee}')")
        check(bo_hears and not dee_hears, "Bo receives Ada's voice stream, Dee does not", f'Bo {bo_hears}, Dee {dee_hears}')
        # Dee walks over: now Dee is near
        pages['Dee'].evaluate('EW.debug.tp(1, 1.2, 8)')
        time.sleep(5)
        pages['Ada'].evaluate('EW.net._log = []')
        pages['Ada'].keyboard.down('KeyW'); pages['Ada'].keyboard.down('KeyA'); time.sleep(5); pages['Ada'].keyboard.up('KeyW'); pages['Ada'].keyboard.up('KeyA')
        log = pages['Ada'].evaluate('EW.net._log'); near = [t for t in log if t != 'ALL']
        sending = pages['Ada'].evaluate('[...EW.voice.sendingTo].map((id) => (EW.net.peers.get(id) || {}).name).sort()')
        time.sleep(3)
        dee_hears = pages['Dee'].evaluate(f"EW.voice.peers.has('{ada_at_dee}')")
        near_set = pages['Ada'].evaluate('[...EW.net.nearIds].map((id) => (EW.net.peers.get(id) || {}).name).sort()')
        full = len(log) >= len([t for t in log if t == 'ALL']) and (not near or any('Dee' in t for t in near))  # everyone near: one broadcast, as in a small room
        check('Dee' in sending and 'Dee' in near_set and full and dee_hears, 'after walking over, Dee is in Ada\'s near set (now everyone is: one broadcast) and hears her', f'near {near_set}; voice to {sending}; sends {len(log)} ({sorted(set(log))}); hears {dee_hears}')
        b.close()
    httpd.shutdown()
    print(f'{fails} FAILED' if fails else 'AREA OF INTEREST OK')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
