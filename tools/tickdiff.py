#!/usr/bin/env python3
"""Hunt a live-vs-replay mismatch: play a proof_test scenario until its proof fails to verify, recording the player
after every live tick (by wrapping EW.tick from outside, so the engine is unchanged). Saves proof.json and trace.json;
then `node tools/cmptrace.mjs <out> [--modules <dir>]` finds the first tick where the replay parts from the live run.

usage: python3 tools/tickdiff.py <scenario> <chromium|webkit> <tries> <out-dir>
"""
import sys, os, json
sys.path.insert(0, os.path.expanduser('~/elsewhere/tools'))
import proof_test as T
from shot import serve
from playwright.sync_api import sync_playwright
name, engine, tries, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
os.makedirs(out, exist_ok=True)
site = T.with_test_worlds(os.path.expanduser('~/elsewhere/docs'))
httpd, port = serve(site)
WRAP = """(() => { const iv = setInterval(() => { if (window.EW && EW.tick && !EW.__wrapped) { const orig = EW.tick; window.__tr = []; window.__fr = 0;
  EW.tick = (f) => { const r = orig(f); const p = EW.player; window.__tr.push([EW.sim.tick, window.__fr, p.pos.x, p.pos.y, p.pos.z, p.vel.x, p.vel.y, p.vel.z, p.grounded, f.q.slice()]); return r; };
  const fr = () => { window.__fr++; requestAnimationFrame(fr); }; requestAnimationFrame(fr);
  EW.__wrapped = true; clearInterval(iv); } }, 1); })();"""
world, fn = T.SCENARIOS[name]
with sync_playwright() as p:
  bt = getattr(p, engine)
  b = bt.launch(headless=True, **({'args': ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']} if engine == 'chromium' else {}))
  for i in range(tries):
    prof = json.loads(json.dumps(T.PROFILE)); prof['coins'] = 40; prof.update(T.PROFILES.get(name, {}))
    ctx = b.new_context(viewport={'width': 960, 'height': 600}); ctx.add_init_script(T.profile_script(prof))
    ctx.add_init_script(WRAP)
    page = ctx.new_page(); page.goto(f'http://127.0.0.1:{port}/#{world}')
    page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && EW.sim.tick > 30', timeout=60000)
    fn(page)
    proof = page.evaluate("EW.currentProof()")
    res = page.evaluate('(p) => EW.verify(p).then((r) => ({ ok: r.ok, reason: r.reason || null }))', proof)
    tr = page.evaluate("window.__tr")
    print(f'{name} {engine} #{i}: {proof["ticks"]} ticks, traced {len(tr or [])} -> {"OK" if res["ok"] else "FAIL " + str(res["reason"])}', flush=True)
    if not res['ok']:
      json.dump(proof, open(f'{out}/proof.json', 'w')); json.dump(tr, open(f'{out}/trace.json', 'w')); break
    ctx.close()
  b.close()
httpd.shutdown()
