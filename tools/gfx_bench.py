#!/usr/bin/env python3
"""Graphics bench: screenshots and per-frame cost of each quality preset, from fixed camera views.

usage: python3 tools/gfx_bench.py [--world hub] [--quality low,medium,high,ultra] [--views all|name,name|ring]
       [--gpu] [--mobile] [--size 1920x1080] [--dpr 1] [--frames 90] [--shots] [--out DIR] [--json FILE]
       [--eval JS] [--tag NAME]

Serves ./docs (a build), opens the world with a test profile, and for every view and quality:
  - places the player and camera (debug teleport: the visit is tainted, as in every test),
  - lets the frame settle, then times N frames of EW.render.render():
      gpu_ms  GPU time of the whole frame (shadow maps, scene, post passes), from EXT_disjoint_timer_query_webgl2,
      cpu_ms  JavaScript time to issue the frame (with a 1-pixel read-back each frame when there is no timer query,
              so software rendering is timed to completion),
  - counts draw calls and triangles over every pass of one frame (renderer.info with autoReset off),
  - optionally saves a screenshot with the HUD hidden.

--gpu uses the machine's GPU through ANGLE on EGL (headless). Without it Chromium renders in software (SwiftShader),
which is what the other test tools use: its timings are CPU-bound and say little about any real GPU.
--mobile emulates a touch phone (390x844, --dpr default 3), so presets render at their phone pixel ratio.
'ring' views: 3 spots x 8 directions (the G3 phone-pass method); averages over views mean more than any one view.
"""
import argparse, json, os, sys, statistics, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

# name: (player position, camera yaw deg, pitch deg, distance m)
VIEWS = {
    'hub': {
        'spawn': ([0, 1.2, 19], 180, 14, 7.5),          # the first view: the Vault across the plaza
        'door': ([-0.6, 1.2, 12.5], 163, 7, 6.0),       # Vault door, guardians and gold pillars
        'statue': ([5.4, 1.2, 11.2], 145, 4, 3.4),      # close-up: a gothic guardian on its plinth
        'plaza': ([-14, 1.2, 22], 128, 10, 8.0),        # across the plaza: lamps, planters, portals
        'bust': ([7.4, 1.2, 22.6], 205, 3, 3.6),        # close-up: a marble bust and the gate
        'hall': ([0, 1.2, 2.5], 180, 2, 3.2),           # inside the Vault (lit by its own lamp)
        'floor': ([4.6, 1.2, 10.8], 140, 38, 3.2),      # close-up, looking down: marble, chequer, gold strip, plinth
    },
    'skyreach': {
        'isle': ([2.0, 1.2, 1.0], 125, 12, 8.0),        # the landing isle: trees, rocks, grass
        'rocks': ([6.0, 1.2, 6.5], 215, 8, 4.5),        # close-up: mossy rocks and a fern
        'vista': ([0, 1.2, -8.5], 180, 2, 7.0),         # out over the cloud sea to the floating isles
        'stump': ([4.5, 1.2, -4.8], 125, 14, 4.0),      # close-up: the stump and a tree
    },
    'glowcave': {
        'spawn': (None, None, 14, 7.5),
    },
}
RING_SPOTS = {'hub': [[0, 1.2, 19], [-14, 1.2, 10], [12, 1.2, -16]]}

HIDE_HUD = "(() => { const s = document.createElement('style'); s.textContent = '#hud,#toasts,#banner,#hint,#prompt,#abilities,#chat,#touch-ui,#timer{display:none !important}'; document.head.appendChild(s); })()"

BENCH_JS = r'''
() => {
  if (window.__bench) return true;
  const R = EW.render, renderer = R.renderer, gl = renderer.getContext();
  // software GL (SwiftShader) exposes the timer extension but its queries never resolve: time those frames to completion
  const ext = window.__benchSync ? null : gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const info = renderer.info; info.autoReset = false;
  const px = new Uint8Array(4);
  // GPU time is taken per renderer.render() call (each pass of a frame: the first call also draws the shadow map), so
  // every query is short; the per-call minimum over many frames then escapes time-slicing with other GPU work, and the
  // frame estimate is the sum of those minimums. 'frame' sums the calls of each frame (with whatever contention).
  const st = window.__bench = { on: false, gpu: [], perCall: [], cpu: [], calls: 0, tris: 0, pending: [], timer: !!ext, frames: 0 };
  let frameQ = null;
  const rrender = renderer.render.bind(renderer);
  renderer.render = function (scene, camera) {
    if (!(st.on && ext && frameQ)) return rrender(scene, camera);
    const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
    rrender(scene, camera);
    gl.endQuery(ext.TIME_ELAPSED_EXT); frameQ.push(q);
  };
  const orig = R.render.bind(R);
  R.render = function () {
    info.reset();
    frameQ = st.on && ext ? [] : null;
    const t0 = performance.now();
    orig();
    if (!ext && st.on) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // software GL: time the frame to completion
    const t1 = performance.now();
    if (frameQ && frameQ.length) st.pending.push(frameQ);
    frameQ = null;
    if (st.on) { st.cpu.push(t1 - t0); st.calls = info.render.calls; st.tris = info.render.triangles; st.frames++; }
    if (ext && st.pending.length) {
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      st.pending = st.pending.filter((qs) => {
        if (!gl.getQueryParameter(qs[qs.length - 1], gl.QUERY_RESULT_AVAILABLE)) return true;
        const ms = qs.map((q) => gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6);
        qs.forEach((q) => gl.deleteQuery(q));
        if (!disjoint) { st.gpu.push(ms.reduce((x, y) => x + y, 0)); ms.forEach((v, i) => { (st.perCall[i] = st.perCall[i] || []).push(v); }); }
        return false;
      });
    }
  };
  return true;
}
'''

def place(page, view):
    """Puts the player at the view's spot and pins the camera there exactly (the camera rig is bypassed, so every
    preset and variant sees the same framing: the rig's collision pull-in and easing would otherwise vary)."""
    pos, yaw, pitch, dist = view
    js = []
    if pos: js.append(f'EW.debug.tp({pos[0]},{pos[1]},{pos[2]})')
    if yaw is not None: js.append(f'EW.player.yaw = {yaw} * Math.PI / 180')
    page.evaluate('; '.join(js) or '0')
    page.wait_for_timeout(700)  # the player lands
    yaw_js = f'{yaw} * Math.PI / 180' if yaw is not None else 'EW.camRig.yaw'
    page.evaluate(f"""(() => {{
      const rig = EW.camRig, cam = EW.camera, p = EW.player.pos;
      const yaw = {yaw_js}, pitch = {pitch} * Math.PI / 180, dist = {dist};
      const t = new EW.THREE.Vector3(p.x, p.y + 1.3, p.z);
      const d = new EW.THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      const c = t.clone().addScaledVector(d, dist);
      rig.yaw = yaw; rig.pitch = pitch; rig.dist = dist; rig.cur = dist;
      if (!rig.__pinned) {{ rig.__orig = rig.update; rig.__pinned = true; }}
      rig.update = () => {{ cam.position.copy(rig.__c); cam.lookAt(rig.__t); if (cam.fov !== 62) {{ cam.fov = 62; cam.updateProjectionMatrix(); }} }};
      rig.__c = c; rig.__t = t;
    }})()""")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--world', default='hub')
    ap.add_argument('--quality', default='low,medium,high')
    ap.add_argument('--views', default='all')
    ap.add_argument('--gpu', action='store_true')
    ap.add_argument('--mobile', action='store_true')
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--dpr', type=float, default=0)
    ap.add_argument('--frames', type=int, default=90)
    ap.add_argument('--settle', type=float, default=1.5)
    ap.add_argument('--shots', action='store_true')
    ap.add_argument('--out', default=os.path.join(ROOT, 'shots', 'gfx'))
    ap.add_argument('--json', default='')
    ap.add_argument('--tag', default='')
    ap.add_argument('--eval', default='', help='JS run once the world is live (e.g. to switch an option)')
    ap.add_argument('--verbose', action='store_true', help='also print console warnings')
    ap.add_argument('--photo', type=int, default=0, help='also take a path-traced photo of each view with this many samples')
    ap.add_argument('--fstop', type=float, default=0, help='photo depth of field (f-number; 0 = none)')
    ap.add_argument('--variants', default='', help="'name=js|name=js': each runs after the preset is set and is measured as preset+name (ablations)")
    ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'))
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    httpd, port = serve(args.docs)
    prof = dict(PROFILE)
    prof['settings'] = dict(PROFILE['settings'], quality=args.quality.split(',')[0])
    with sync_playwright() as p:
        flags = ['--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--autoplay-policy=no-user-gesture-required']
        flags += ['--use-angle=gl-egl', '--enable-gpu'] if args.gpu else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        b = p.chromium.launch(headless=True, args=flags)
        if args.mobile:
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=args.dpr or 3, is_mobile=True, has_touch=True)
        else:
            w, h = map(int, args.size.split('x'))
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=args.dpr or 1)
        ctx.add_init_script(profile_script(prof))
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text[:300]}') if m.type == 'error' or (args.verbose and m.type == 'warning') else None)
        page.goto(f'http://127.0.0.1:{port}/#{args.world}')
        page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling', timeout=120000)
        page.evaluate(HIDE_HUD)
        gl = page.evaluate("(() => { const gl = EW.render.renderer.getContext(); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); })()")
        print('renderer:', gl)
        if not args.gpu: page.evaluate('window.__benchSync = true')
        page.evaluate(BENCH_JS)
        if args.eval: print('eval:', page.evaluate(args.eval))
        page.wait_for_timeout(4000)  # textures and models arrive
        views = VIEWS.get(args.world, {})
        if args.views == 'ring':
            sel = []
            for si, spot in enumerate(RING_SPOTS.get(args.world, [[0, 1.2, 0]])):
                for d in range(8): sel.append((f'r{si}{d}', (spot, d * 45, 12, 7.5)))
        elif args.views == 'all': sel = list(views.items())
        else: sel = [(n, views[n]) for n in args.views.split(',')]
        rows = []
        variants = [v.split('=', 1) for v in args.variants.split('|')] if args.variants else [['', '']]
        for q in args.quality.split(','):
            page.evaluate(f"EW.render.setQuality('{q}'); EW.fx && EW.fx.setScale(EW.render.renderer, EW.camera)")
            page.wait_for_timeout(2500)  # shader compiles after a preset change
            for vname, vjs in variants:
                if vjs:
                    page.evaluate(vjs)
                    page.wait_for_timeout(2000)
                label = q + (('+' + vname) if vname else '')
                for name, view in sel:
                    place(page, view)
                    page.wait_for_timeout(args.settle * 1000)
                    page.evaluate('Object.assign(window.__bench, { on: true, gpu: [], perCall: [], cpu: [], frames: 0 })')
                    n = args.frames
                    page.wait_for_function(f'window.__bench.frames >= {n}', timeout=600000, polling=100)
                    page.evaluate('window.__bench.on = false')
                    page.wait_for_timeout(300)
                    st = page.evaluate('({ gpu: __bench.gpu, perCall: __bench.perCall.map((a) => Math.min(...a)), cpu: __bench.cpu, calls: __bench.calls, tris: __bench.tris, timer: __bench.timer, px: [EW.render.renderer.domElement.width, EW.render.renderer.domElement.height] })')
                    med = lambda a: round(statistics.median(a), 3) if a else None
                    pct = lambda a, f: round(sorted(a)[max(0, int(len(a) * f) - 1)], 3) if a else None
                    row = {'world': args.world, 'tag': args.tag, 'quality': label, 'view': name, 'gpu': args.gpu, 'mobile': args.mobile, 'px': st['px'],
                           'calls': st['calls'], 'tris': st['tris'], 'gpu_ms': med(st['gpu']), 'gpu_min': min(st['gpu']) if st['gpu'] else None, 'gpu_p10': pct(st['gpu'], 0.1), 'gpu_p90': pct(st['gpu'], 0.9),
                           'gpu_summin': round(sum(st['perCall']), 3) if st['perCall'] else None, 'passes_min': [round(v, 3) for v in st['perCall']],
                           'cpu_ms': med(st['cpu']), 'cpu_min': min(st['cpu']) if st['cpu'] else None, 'cpu_p90': pct(st['cpu'], 0.9), 'n': len(st['gpu']) or len(st['cpu'])}
                    rows.append(row)
                    print(f"{label:16s} {name:8s} {st['px'][0]}x{st['px'][1]}  calls {row['calls']:4d}  tris {row['tris']:7d}  gpu sum-of-min {row['gpu_summin']} (frame med {row['gpu_ms']} min {row['gpu_min']})  cpu med {row['cpu_ms']}  passes {row['passes_min']}", flush=True)
                    if args.shots:
                        page.screenshot(path=os.path.join(args.out, f"{args.world}-{name}-{label.replace('+', '_')}{('-' + args.tag) if args.tag else ''}.png"), timeout=180000)
                    if args.photo:  # photo mode: a path-traced still of the same view
                        r = page.evaluate(f"EW.photo({{ samples: {args.photo}, keepOverlay: false{(', fStop: ' + str(args.fstop)) if args.fstop else ''} }}).then((r) => r && {{ url: r.dataUrl, ms: r.ms, buildMs: r.buildMs, samples: r.samples }})")
                        if r:
                            import base64
                            path = os.path.join(args.out, f"{args.world}-{name}-photo{args.photo}{('-' + args.tag) if args.tag else ''}.png")
                            open(path, 'wb').write(base64.b64decode(r['url'].split(',', 1)[1]))
                            print(f"photo {name}: {r['samples']} samples in {r['ms'] / 1000:.1f} s (BVH build {r['buildMs'] / 1000:.1f} s) -> {path}", flush=True)
                            row['photo_ms'] = r['ms']; row['photo_build_ms'] = r['buildMs']
                        else: print('photo failed', name)
        # averages per preset/variant
        for label in dict.fromkeys(r['quality'] for r in rows):
            rs = [r for r in rows if r['quality'] == label]
            avg = lambda k: round(sum(r[k] for r in rs if r[k] is not None) / max(1, len([r for r in rs if r[k] is not None])), 3)
            print(f"AVG {label:16s} over {len(rs)} views: calls {avg('calls')}  tris {avg('tris')}  gpu sum-of-min {avg('gpu_summin')} ms (frame med {avg('gpu_ms')} min {avg('gpu_min')})  cpu med {avg('cpu_ms')} ms")
        if args.json:
            with open(args.json, 'a') as f:
                for r in rows: f.write(json.dumps(r) + '\n')
        b.close()
    httpd.shutdown()
    for e in errors[:20]: print(e)

if __name__ == '__main__':
    main()
