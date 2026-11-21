#!/usr/bin/env python3
"""Determinism battery, part 2: replay every Node-made proof in real browser engines.

usage: python3 tools/battery.py [--dir proofs/battery] [--engines chromium,webkit,firefox]

Proofs come from tools/battery.mjs (recorded headlessly in Node, i.e. V8). Each browser engine replays
them on the standalone verifier page (docs/verify.html, no WebGL needed) and must reach the identical
final state. V8 (Chromium), JavaScriptCore (WebKit) and SpiderMonkey (Firefox) are all different JS engines.
"""
import argparse, glob, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, ROOT
from playwright.sync_api import sync_playwright

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', default=os.path.join(ROOT, 'proofs/battery'))
    ap.add_argument('--engines', default='chromium,webkit,firefox')
    ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'))
    args = ap.parse_args()
    files = sorted(glob.glob(os.path.join(args.dir, '*.json')))
    proofs = [json.load(open(f)) for f in files]
    httpd, port = serve(args.docs)
    total_ticks = sum(p['ticks'] for p in proofs)
    summary, ok_all = {}, True
    with sync_playwright() as p:
        for eng in args.engines.split(','):
            b = getattr(p, eng).launch(headless=True)
            page = b.new_page()
            errs = []
            page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(f'http://127.0.0.1:{port}/verify.html')
            page.wait_for_function('window.EWV', timeout=60000)
            t0 = time.time(); good = 0; bad = []
            for f, pr in zip(files, proofs):
                r = page.evaluate('(p) => EWV.verify(p).then((r) => ({ ok: r.ok, reason: r.reason || null, state: r.state || r.replayState || null }))', pr)
                if r['ok']: good += 1
                else: bad.append((os.path.basename(f), r['reason']))
            dt = time.time() - t0
            ua = page.evaluate('navigator.userAgent')
            summary[eng] = (good, len(files), dt)
            print(f'{eng:9s} {good}/{len(files)} identical ({total_ticks:,} ticks) in {dt:.0f} s  [{ua[-60:]}]')
            for name, why in bad[:8]: print('   ', name, why)
            if errs: print('    page errors:', errs[:3])
            if good != len(files): ok_all = False
            b.close()
    httpd.shutdown()
    print('ALL IDENTICAL' if ok_all else 'DIVERGENCE FOUND')
    sys.exit(0 if ok_all else 1)

if __name__ == '__main__':
    main()
