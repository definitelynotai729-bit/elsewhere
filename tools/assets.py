#!/usr/bin/env python3
"""Fetch, slim and pin the free 3D assets the first-party worlds use.

usage: python3 tools/assets.py [--only id,id]

Reads assets/sources.json. Every asset there is CC0 (public domain) from Poly Haven.
- Models: download the 1k glTF, shrink textures to 512 px, then gltfpack simplifies, quantises and compresses
  (meshopt) into one .glb.
- Skies: download the 1k .hdr.
Outputs go to docs/assets/ with a manifest pinning each file by SHA-256 (the engine checks it), plus CREDITS.md.
Downloads are cached in assets/.cache (not committed).
"""
import hashlib, io, json, os, subprocess, sys, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
UA = {'User-Agent': 'elsewhere-asset-fetch/1.0'}
CACHE, OUT = os.path.join(ROOT, 'assets/.cache'), os.path.join(ROOT, 'docs/assets')
TEX = 512

def get(url, binary=False):
    data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
    return data if binary else json.loads(data)

def fetch(url, path):
    if os.path.exists(path): return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = get(url, binary=True)
    with open(path, 'wb') as f: f.write(data)

def shrink(path):
    im = Image.open(path)
    if max(im.size) <= TEX: return
    im.thumbnail((TEX, TEX), Image.LANCZOS)
    if path.lower().endswith('.png'): im.save(path, optimize=True)
    else: im.convert('RGB').save(path, quality=86, optimize=True)

def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f: h.update(f.read())
    return h.hexdigest()

def main():
    src = json.load(open(os.path.join(ROOT, 'assets/sources.json')))
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    man_path = os.path.join(OUT, 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {'format': 'elsewhere-assets/1', 'models': {}, 'hdris': {}}
    os.makedirs(os.path.join(OUT, 'models'), exist_ok=True); os.makedirs(os.path.join(OUT, 'hdri'), exist_ok=True)
    for m in src['models']:
        if only and m['id'] not in only: continue
        ph = m['ph']; info = get(f'https://api.polyhaven.com/info/{ph}'); files = get(f'https://api.polyhaven.com/files/{ph}')
        g = files['gltf']['1k']['gltf']
        base = os.path.join(CACHE, ph)
        gpath = os.path.join(base, os.path.basename(g['url']))
        fetch(g['url'], gpath)
        for rel, f in g.get('include', {}).items():
            p = os.path.join(base, rel); fetch(f['url'], p)
            if not rel.endswith('.bin'): shrink(p)
        out = os.path.join(OUT, 'models', m['id'] + '.glb')
        cmd = ['npx', '--no-install', 'gltfpack', '-i', gpath, '-o', out, '-cc', '-si', str(m.get('simplify', 1))]
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        if r.returncode: print(m['id'], 'gltfpack failed:', r.stderr[-400:]); continue
        tris = info.get('polycount', 0) * m.get('simplify', 1)
        man['models'][m['id']] = {'file': f"assets/models/{m['id']}.glb", 'sha256': sha(out), 'bytes': os.path.getsize(out),
                                  'tris': int(tris), 'license': 'CC0 1.0', 'authors': list(info.get('authors', {}).keys()),
                                  'name': info.get('name', ph), 'source': f'https://polyhaven.com/a/{ph}'}
        print(f"{m['id']:16s} {os.path.getsize(out)/1024:7.0f} KB  ~{int(tris):>6} tris  {info.get('name')}")
    for h in src['hdris']:
        if only and h['id'] not in only: continue
        ph = h['ph']; info = get(f'https://api.polyhaven.com/info/{ph}'); files = get(f'https://api.polyhaven.com/files/{ph}')
        u = files['hdri']['1k']['hdr']['url']
        out = os.path.join(OUT, 'hdri', h['id'] + '.hdr')
        fetch(u, os.path.join(CACHE, 'hdri', ph + '.hdr'))
        with open(os.path.join(CACHE, 'hdri', ph + '.hdr'), 'rb') as a, open(out, 'wb') as b: b.write(a.read())
        man['hdris'][h['id']] = {'file': f"assets/hdri/{h['id']}.hdr", 'sha256': sha(out), 'bytes': os.path.getsize(out), 'license': 'CC0 1.0',
                                 'authors': list(info.get('authors', {}).keys()), 'name': info.get('name', ph), 'source': f'https://polyhaven.com/a/{ph}'}
        print(f"{h['id']:16s} {os.path.getsize(out)/1024:7.0f} KB  sky: {info.get('name')}")
    with open(man_path, 'w') as f: json.dump(man, f, indent=1)
    lines = ['# Credits', '', 'Elsewhere uses these free assets, all **CC0 1.0 (public domain)**, from [Poly Haven](https://polyhaven.com). Thank you to the artists.', '',
             '| asset | used as | authors |', '|---|---|---|']
    for k, v in sorted(man['models'].items()): lines.append(f"| [{v['name']}]({v['source']}) | model `{k}` | {', '.join(v['authors'])} |")
    for k, v in sorted(man['hdris'].items()): lines.append(f"| [{v['name']}]({v['source']}) | sky `{k}` | {', '.join(v['authors'])} |")
    lines += ['', 'Fonts: Chakra Petch and Inter, SIL Open Font License 1.1 (see docs/fonts).']
    with open(os.path.join(ROOT, 'CREDITS.md'), 'w') as f: f.write('\n'.join(lines) + '\n')
    total = sum(v['bytes'] for v in man['models'].values()) + sum(v['bytes'] for v in man['hdris'].values())
    print(f"manifest: {len(man['models'])} models, {len(man['hdris'])} skies, {total/1e6:.1f} MB")

if __name__ == '__main__':
    main()
