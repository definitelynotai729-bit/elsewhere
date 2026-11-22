#!/usr/bin/env python3
"""Voice chat end to end: two browsers in the same world over the real P2P network. Ada turns on voice with an
open mic (Chromium's fake microphone plays a tone); Bo must receive her stream and hear sound on it, and Bo's
view must show Ada's speaking ring. Then Ada switches to push-to-talk and goes quiet. usage: voice_test.py [url]"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs')
    httpd, url = (None, arg) if arg.startswith('http') else (lambda h: (h[0], f'http://127.0.0.1:{h[1]}/#hub'))(serve(arg))
    if arg.startswith('http') and '#' not in url: url = url.rstrip('/') + '/#hub'
    ok = False
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=WebRtcHideLocalIpsWithMdns',
                                                   '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        pages = []
        for i, name in enumerate(['Ada', 'Bo']):
            prof = dict(PROFILE, name=name, online=True)
            prof['settings'] = dict(PROFILE['settings'], quality='low', sfx=True, music=False)
            ctx = b.new_context(viewport={'width': 640, 'height': 400}, permissions=['microphone'])
            ctx.add_init_script(profile_script(prof))
            pg = ctx.new_page()
            pg.on('pageerror', lambda e, n=name: print(n, 'pageerror', e))
            pg.goto(url)
            pg.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=60000)
            pg.wait_for_timeout(500); pg.mouse.click(320, 200)  # a click unlocks Web Audio, as a player's first input does
            pages.append(pg)
        ada, bo = pages
        t0 = time.time()
        while time.time() - t0 < 60 and min(pg.evaluate('[...EW.net.peers.values()].filter(p => p.has).length') for pg in pages) < 1: time.sleep(1)
        print(f'peers met after {time.time() - t0:.0f} s')
        ada.evaluate("EW.debug.tp(3, 1.2, 12)"); bo.evaluate("EW.debug.tp(-3, 1.2, 12)")
        print('Ada enables voice (open mic):', ada.evaluate("EW.voice.enable().then((ok) => { EW.voice.setMode('open'); return ok; })"), '· HUD:', ada.evaluate("document.getElementById('voice').textContent"))
        t1 = time.time(); heard = 0
        while time.time() - t1 < 25:
            st = bo.evaluate("JSON.stringify([...EW.voice.peers.values()].map(p => ({ src: !!p.src, level: +p.level.toFixed(3) })))")
            peers = json.loads(st)
            if peers and peers[0]['src'] and peers[0]['level'] > 0.05: heard = peers[0]['level']; time.sleep(0.3); break
            time.sleep(1)
        ring = bo.evaluate("[...EW.net.peers.values()].some(p => p.av && p.av.voiceRing && p.av.voiceRing.visible)")
        print(f'Bo receives Ada: {st} after {time.time() - t1:.0f} s · speaking ring shown: {ring}')
        ok = heard > 0.01 and ring
        # push-to-talk: Ada's track goes silent until she holds V
        ada.evaluate("EW.voice.setMode('ptt')")
        print('Ada push-to-talk, not holding V: track enabled =', ada.evaluate("EW.voice.track.enabled"), '· HUD:', ada.evaluate("document.getElementById('voice').textContent"))
        ada.keyboard.down('KeyV'); time.sleep(0.3)
        print('Ada holding V: track enabled =', ada.evaluate("EW.voice.track.enabled"), '· HUD:', ada.evaluate("document.getElementById('voice').textContent"))
        ada.keyboard.up('KeyV')
        b.close()
    if httpd: httpd.shutdown()
    print('VOICE OK' if ok else 'VOICE FAILED')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
