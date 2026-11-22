#!/usr/bin/env python3
"""Render a portrait icon for each wearable character (docs/assets/characters/<id>.png).

usage: python3 tools/char_portraits.py [--only id,id]

Serves docs/ locally and opens the game in headless Chromium. Each character is posed in its idle clip, lit, and
rendered full-body to a transparent 256 px PNG with the game's own loader and three.js. The shop and items panel
show these icons. Run it after tools/characters.py.
"""
import base64, functools, http.server, json, os, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DOCS = os.path.join(ROOT, 'docs')

RENDER = """async (ids) => {
  const T = EW.THREE, out = {};
  await EW.characters.init();
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const r = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  r.outputColorSpace = T.SRGBColorSpace; r.setClearColor(0x000000, 0);
  r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xffffff, 0x4a4f6a, 2.2));
  const key = new T.DirectionalLight(0xffffff, 2.8); key.position.set(2.5, 4, 5); scene.add(key);
  const rim = new T.DirectionalLight(0x9fc8ff, 1.6); rim.position.set(-3, 2, -4); scene.add(rim);
  const cam = new T.PerspectiveCamera(26, 1, 0.01, 1000);
  for (const id of ids) {
    const inst = await EW.characters.instance(id), m = inst.root;
    const mixer = new T.AnimationMixer(m), clip = T.AnimationClip.findByName(inst.clips, inst.info.anims.idle);
    if (clip) { mixer.clipAction(clip).play(); mixer.update(0.6); }
    m.updateMatrixWorld(true);
    const box = new T.Box3();
    m.traverse((o) => { if (o.isMesh && o.visible) box.union(new T.Box3().expandByObject(o, true)); });
    const size = box.getSize(new T.Vector3()), c = box.getCenter(new T.Vector3());
    const dist = size.y / 2 / Math.tan(13 * Math.PI / 180) * 1.12;
    cam.position.set(c.x + dist * 0.34, c.y + size.y * 0.1, c.z + dist * 0.94);
    cam.lookAt(c.x, c.y, c.z);
    scene.add(m); r.render(scene, cam); scene.remove(m);
    out[id] = canvas.toDataURL('image/png');
  }
  r.dispose();
  return out;
}"""

def main():
    only = None
    if '--only' in sys.argv: only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
    chars = json.load(open(os.path.join(DOCS, 'assets/characters.json')))['characters']
    ids = [c['id'] for c in chars if not only or c['id'] in only]
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=DOCS)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            page = b.new_page()
            page.goto(f'http://127.0.0.1:{srv.server_address[1]}/#hub')
            page.wait_for_function('window.EW && EW.characters', timeout=60000)
            out = page.evaluate(RENDER, ids)
            b.close()
    finally:
        srv.shutdown()
    for cid, url in out.items():
        path = os.path.join(DOCS, 'assets/characters', cid + '.png')
        with open(path, 'wb') as f: f.write(base64.b64decode(url.split(',', 1)[1]))
        print(cid, os.path.getsize(path), 'bytes')

if __name__ == '__main__':
    main()
