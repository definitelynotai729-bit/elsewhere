#!/usr/bin/env python3
"""Phone survey: every world on an emulated phone, in one session (RELEASE.md, phones; the soft launch).

A landscape phone (844x390 at 3x, touch) with the game's own choice of quality ("auto": medium on phones). Every
world is visited in turn, as a player would, and for each one:
  - memory: GPU geometries, textures and shader programs (renderer.info), JavaScript heap, and an estimate of the
    bytes held by textures and geometry;
  - a frame as drawn: draw calls and triangles over every pass, GPU time (timer queries, with --gpu), and the
    JavaScript time to issue it;
  - a frame as played, with the CPU slowed down (CDP throttling, x4 by default, about a mid-range phone against this
    machine): JavaScript per frame (median and 90th percentile), the simulation's share (ticks), and the drawing's;
  - which objects the draw calls go to (the busiest owners), to show what to merge or drop.
Then back to Junction: what the tour left behind (geometries, textures, heap) shows leaks across travel.

The player stands at each world's arrival point, looking the way a visitor first looks. GPU times come from this
machine's GPU (--gpu, ANGLE on EGL), so they rank worlds rather than predict a phone: a mid-range phone's GPU is
very roughly 50-100 times slower than a desktop's. Without --gpu, rendering is software (SwiftShader), and GPU
times are left out.

usage: python3 tools/phone_bench.py [--docs DIR] [--worlds hub,skyreach] [--gpu] [--throttle 4] [--frames 150]
                                    [--size 844x390] [--dpr 3] [--json FILE]
"""
import argparse, json, os, statistics, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'))
ap.add_argument('--worlds', default='')
ap.add_argument('--gpu', action='store_true')
ap.add_argument('--throttle', type=float, default=4)
ap.add_argument('--frames', type=int, default=150)
ap.add_argument('--size', default='844x390')
ap.add_argument('--dpr', type=float, default=3)
ap.add_argument('--settle', type=float, default=5)
ap.add_argument('--json', default='')
ap.add_argument('--quality', default='', help='force a preset in every world (default: the game\'s own choice)')
ap.add_argument('--setup', default='', help='JS run after each arrival (and the preset), e.g. to switch something off')
ap.add_argument('--owners', type=int, default=10, help='how many draw-call owners to list per world')
a = ap.parse_args()

# every frame's JavaScript, timed from the browser's side (installed before the game starts)
RAF = r"""(() => {
  if (window.__pb) return;
  const raf = window.requestAnimationFrame.bind(window), st = window.__pb = { on: false, js: [] };
  window.requestAnimationFrame = (cb) => raf((t) => { const a = performance.now(); try { cb(t); } finally { if (st.on) st.js.push(performance.now() - a); } });
})();"""

HOOKS = r"""() => {
  const st = window.__pb; if (st.hooked) return true; st.hooked = true;
  const R = EW.render, renderer = R.renderer, gl = renderer.getContext(), info = renderer.info;
  info.autoReset = false;
  const ext = window.__pbGpu ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
  Object.assign(st, { tick: [], tickFrame: 0, submit: [], calls: [], tris: [], gpu: [], pending: [], owners: null, ext: !!ext });
  // the simulation's share: every tick, summed per frame
  const tick = EW.tick;
  EW.tick = function (f) { const t0 = performance.now(); try { return tick.call(this, f); } finally { st.tickFrame += performance.now() - t0; } };
  // which object each draw goes to (counted only while st.owners is an object)
  const rbd = renderer.renderBufferDirect.bind(renderer);
  const avatarRoot = (o) => { for (let x = o; x; x = x.parent) if (x.userData && (x.userData.avatar || x.userData.isAvatar)) return x; return null; };
  const ownerOf = (o) => {
    for (let x = o; x; x = x.parent) { if (EW.player && x === EW.player.avatar.root) return 'the player'; }
    for (let x = o; x && !/^world:/.test(x.name || ''); x = x.parent) if (x.name) return 'named: ' + x.name;
    const top = (() => { let x = o; while (x.parent && !/^world:/.test(x.parent.name || '') && x.parent !== EW.render.scene) x = x.parent; return x; })();
    const inWorld = !!(top.parent && /^world:/.test(top.parent.name || ''));
    const kind = o.isSprite ? 'label (sprite)' : o.isPoints ? 'particles' : o.isLine ? 'line' : (o.geometry && o.geometry.type === 'BufferGeometry' && o.parent && /^world:/.test(o.parent.name || '')) ? 'merged statics' : ((o.geometry && o.geometry.type) || 'mesh') + ' ' + ((o.material && o.material.type) || '');
    const group = top !== o ? ' in a group of ' + (() => { let n = 0; top.traverse((c) => { if (c.isMesh || c.isSprite) n++; }); return n; })() : '';
    return (inWorld ? '' : '[outside the world] ') + kind + group;
  };
  renderer.renderBufferDirect = function (camera, scene, geometry, material, object, group) {
    if (st.on && st.owners) { const k = ownerOf(object) + (camera && camera.isOrthographicCamera ? ' (shadow pass)' : ''); st.owners[k] = (st.owners[k] || 0) + 1; } // the sun's shadow camera is the orthographic one
    return rbd(camera, scene, geometry, material, object, group);
  };
  // a frame as drawn: calls, triangles, GPU time (all passes), JavaScript to issue it
  const render = R.render.bind(R);
  let q = null;
  const rr = renderer.render.bind(renderer);
  renderer.render = function (scene, camera) {
    if (!(st.on && ext && q)) return rr(scene, camera);
    const t = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, t); rr(scene, camera); gl.endQuery(ext.TIME_ELAPSED_EXT); q.push(t);
  };
  R.render = function () {
    info.reset(); q = st.on && ext ? [] : null;
    const t0 = performance.now(); render(); const t1 = performance.now();
    if (st.on) { st.submit.push(t1 - t0); st.calls.push(info.render.calls); st.tris.push(info.render.triangles); st.tick.push(st.tickFrame); if (st.owners) st.ownerFrames++; }
    st.tickFrame = 0;
    if (q && q.length) st.pending.push(q); q = null;
    if (ext && st.pending.length) {
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      st.pending = st.pending.filter((qs) => {
        if (!gl.getQueryParameter(qs[qs.length - 1], gl.QUERY_RESULT_AVAILABLE)) return true;
        const ms = qs.reduce((s, x) => s + gl.getQueryParameter(x, gl.QUERY_RESULT) / 1e6, 0); qs.forEach((x) => gl.deleteQuery(x));
        if (!disjoint) st.gpu.push(ms);
        return false;
      });
    }
  };
  return true;
}"""

MEMORY = r"""() => {
  const R = EW.render, renderer = R.renderer, info = renderer.info;
  const tex = new Set(), geo = new Set(); let meshes = 0, visible = 0, sprites = 0, points = 0, skinned = 0;
  const KEYS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap', 'bumpMap', 'lightMap', 'specularMap', 'displacementMap'];
  R.scene.traverse((o) => {
    if (o.isMesh || o.isSprite || o.isPoints || o.isLine) {
      if (o.isMesh) meshes++; if (o.isSprite) sprites++; if (o.isPoints) points++; if (o.isSkinnedMesh) skinned++;
      let v = true; for (let x = o; x; x = x.parent) if (!x.visible) { v = false; break; } if (v) visible++;
      if (o.geometry) geo.add(o.geometry);
      for (const m of [].concat(o.material || [])) for (const k of KEYS) if (m[k] && m[k].isTexture) tex.add(m[k]);
    }
  });
  let texBytes = 0;
  for (const t of tex) { const im = t.image || {}; const w = im.width || (im.data && im.data.width) || 0, h = im.height || (im.data && im.data.height) || 0; texBytes += w * h * 4 * (t.generateMipmaps === false ? 1 : 1.33); }
  let geoBytes = 0;
  for (const g of geo) { for (const k in g.attributes) { const at = g.attributes[k]; geoBytes += at.array ? at.array.byteLength : 0; } if (g.index && g.index.array) geoBytes += g.index.array.byteLength; }
  const heap = performance.memory ? performance.memory.usedJSHeapSize : null;
  return { geometries: info.memory.geometries, textures: info.memory.textures, programs: (info.programs || []).length,
           heapMB: heap ? +(heap / 1048576).toFixed(1) : null, texMB: +(texBytes / 1048576).toFixed(1), geoMB: +(geoBytes / 1048576).toFixed(1),
           meshes, visible, sprites, points, skinned, quality: R.quality, px: [renderer.domElement.width, renderer.domElement.height] };
}"""

READY = 'window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && !EW.sim.ended && EW.player'
med = lambda v: round(statistics.median(v), 2) if v else None
def pct(v, f):
    if not v: return None
    s = sorted(v); return round(s[min(len(s) - 1, int(len(s) * f))], 2)

def frames(pg, n, owners=False):
    pg.evaluate(f"Object.assign(window.__pb, {{ js: [], tick: [], submit: [], calls: [], tris: [], gpu: [], owners: {'{}' if owners else 'null'}, ownerFrames: 0, on: true }})")
    t0 = time.time()
    while time.time() - t0 < 240:
        if pg.evaluate('window.__pb.submit.length') >= n: break
        pg.wait_for_timeout(200)
    pg.evaluate('window.__pb.on = false'); pg.wait_for_timeout(400) # the last timer queries resolve
    return pg.evaluate('(() => { const s = window.__pb, o = s.owners; s.owners = null; if (o) for (const k in o) o[k] = o[k] / Math.max(1, s.ownerFrames); return { js: s.js, tick: s.tick, submit: s.submit, calls: s.calls, tris: s.tris, gpu: s.gpu, owners: o }; })()')

def main():
    httpd, port = serve(a.docs)
    reg = json.load(open(os.path.join(a.docs, 'worlds', 'registry.json')))
    ids = [w['id'] for w in reg['worlds']]
    # (not Origin: before the hunt is done it says "sealed" and sends you back to Junction, which is then measured)
    worlds = a.worlds.split(',') if a.worlds else ['hub'] + [i for i in ids if i not in ('hub', 'origin')]
    prof = json.loads(json.dumps(PROFILE)); prof['settings']['quality'] = 'auto' # the game's own choice on a phone
    w, h = map(int, a.size.split('x'))
    rows = []
    with sync_playwright() as p:
        flags = ['--enable-precise-memory-info', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit']
        flags += ['--use-angle=gl-egl', '--enable-gpu'] if a.gpu else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        b = p.chromium.launch(headless=True, args=flags)
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=a.dpr, is_mobile=True, has_touch=True)
        ctx.add_init_script(profile_script(prof)); ctx.add_init_script(RAF)
        ctx.route_web_socket(__import__('re').compile('.*'), lambda ws: None) # alone: no relays, no peers
        pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(f'http://127.0.0.1:{port}/#{worlds[0]}')
        pg.wait_for_function(READY, timeout=180000)
        if a.gpu: pg.evaluate('window.__pbGpu = true')
        pg.evaluate(HOOKS)
        renderer = pg.evaluate("(() => { const gl = EW.render.renderer.getContext(); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); })()")
        print(f'renderer: {renderer}\nphone {w}x{h} at {a.dpr}x, quality "{pg.evaluate("EW.render.quality")}", CPU x{a.throttle} for the played frames; load {os.getloadavg()[0]:.0f}', flush=True)
        first = None
        for i, wid in enumerate(worlds + ['hub']):
            back = i == len(worlds)
            if i > 0:
                pg.evaluate(f"EW.travel({json.dumps(wid)})")
                pg.wait_for_timeout(500)
                try: pg.wait_for_function(READY + f" && EW.world.id === {json.dumps(wid)}", timeout=120000)
                except Exception: print(f'{wid:13s} did not arrive: skipped', flush=True); continue
            pg.wait_for_timeout(a.settle * 1000)
            if a.quality: pg.evaluate(f"EW.autoQuality = {json.dumps(a.quality)}; EW.render.setQuality({json.dumps(a.quality)})"); pg.wait_for_timeout(1500)
            if a.setup: pg.evaluate(a.setup); pg.wait_for_timeout(1000)
            mem = pg.evaluate(MEMORY)
            if back:
                rows.append({'world': 'hub (after the tour)', 'mem': mem}); break
            if first is None: first = mem
            drawn = frames(pg, a.frames, owners=False)
            own = frames(pg, 10, owners=True)['owners'] or {}
            if a.throttle:
                cdp.send('Emulation.setCPUThrottlingRate', {'rate': a.throttle})
                played = frames(pg, a.frames)
                cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
            else: played = {'js': [], 'tick': [], 'submit': []}
            top = sorted(own.items(), key=lambda kv: -kv[1])[:a.owners]
            shadow = sum(v for k, v in own.items() if k.endswith('(shadow pass)'))
            print(f"    {wid}: {sum(own.values()):.0f} draws a frame, {shadow:.0f} of them for the sun's shadow", flush=True)
            row = {'world': wid, 'mem': mem, 'calls': med(drawn['calls']), 'calls_max': max(drawn['calls']) if drawn['calls'] else None,
                   'tris': med(drawn['tris']), 'gpu_ms': med(drawn['gpu']), 'gpu_min': round(min(drawn['gpu']), 3) if drawn['gpu'] else None,
                   'submit_ms': med(drawn['submit']), 'js_ms': med(played['js']), 'js_p90': pct(played['js'], 0.9),
                   'tick_ms': med(played['tick']), 'tick_p90': pct(played['tick'], 0.9), 'submit_thr_ms': med(played['submit']),
                   'owners': [[k, round(v, 1)] for k, v in top]}
            rows.append(row)
            print(f"{wid:13s} calls {row['calls']:>5} (max {row['calls_max']})  tris {int(row['tris'] or 0):>7}  gpu {row['gpu_ms']} ms  "
                  f"| x{a.throttle:g}: js {row['js_ms']} ms (p90 {row['js_p90']})  ticks {row['tick_ms']} (p90 {row['tick_p90']})  draw {row['submit_thr_ms']}  "
                  f"| geo {mem['geometries']} tex {mem['textures']} prog {mem['programs']} heap {mem['heapMB']} MB  texMB {mem['texMB']} geoMB {mem['geoMB']}", flush=True)
            if row['owners']: print('    draws: ' + ', '.join(f'{k} {v}' for k, v in row['owners']), flush=True)
        last = rows[-1]['mem']
        print(f"after the tour, back in Junction: geometries {first['geometries']} -> {last['geometries']}, textures {first['textures']} -> {last['textures']}, "
              f"programs {first['programs']} -> {last['programs']}, heap {first['heapMB']} -> {last['heapMB']} MB", flush=True)
        if errs: print('page errors:', errs[:5])
        b.close()
    if a.json: json.dump(rows, open(a.json, 'w'), indent=1)

main()
