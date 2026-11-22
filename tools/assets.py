#!/usr/bin/env python3
"""Fetch, slim and pin the free 3D assets the first-party worlds use.

usage: python3 tools/assets.py [--only id,id]

Reads assets/sources.json. Every asset there is CC0 (public domain) from Poly Haven.
- Models: download the 1k glTF, shrink textures to 512 px, then gltfpack simplifies, quantises and compresses
  (meshopt) into one .glb.
- Skies: download the 1k .hdr.
- Textures (PBR sets for w.box({ texture }) and the other solids): download the 1k colour, normal (OpenGL
  convention) and ARM (ambient occlusion, roughness, metalness) maps, or the roughness map when a set has no
  ARM, and save each as a 512 px JPEG. The manifest also records what the engine needs before the images
  arrive: the set's average colour (linear) and roughness, and its real-world size in metres.
Outputs go to docs/assets/ with a manifest pinning each file by SHA-256 (the engine checks it), plus CREDITS.md.
Downloads are cached in assets/.cache (not committed).
"""
import hashlib, io, json, os, subprocess, sys, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
UA = {'User-Agent': 'elsewhere-asset-fetch/1.0'}
CACHE, OUT = os.path.join(ROOT, 'assets/.cache'), os.path.join(ROOT, 'docs/assets')
TEX = 512
TEX_BUDGET = 8_000_000  # all texture sets together

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

def srgb_to_linear(v):
    c = v / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def channel_means(im, linear):
    """Average of each channel, from histograms (0..1; sRGB-decoded when linear is set)."""
    out = []
    for ch in im.split():
        hist, n = ch.histogram(), im.size[0] * im.size[1]
        out.append(sum(c * (srgb_to_linear(v) if linear else v / 255) for v, c in enumerate(hist)) / n)
    return out

# map key -> (Poly Haven names, in order of preference; JPEG chroma subsampling: 2 = 4:2:0 for colour, 0 = 4:4:4 for data)
TEX_MAPS = {'map': (['Diffuse'], 2, 84), 'normal': (['nor_gl'], 0, 88), 'rough': (['arm', 'Rough'], 0, 85)}

def texture_set(t, man):
    ph = t['ph']; info = get(f'https://api.polyhaven.com/info/{ph}'); files = get(f'https://api.polyhaven.com/files/{ph}')
    entry = {'maps': {}}
    for key, (names, sub, q) in TEX_MAPS.items():
        name = next(n for n in names if n in files)
        u = files[name]['1k']['jpg']['url']
        cached = os.path.join(CACHE, 'textures', ph, os.path.basename(u)); fetch(u, cached)
        im = Image.open(cached).convert('RGB')
        im = im.resize((TEX, max(1, round(TEX * im.size[1] / im.size[0]))), Image.LANCZOS)
        out = os.path.join(OUT, 'textures', f"{t['id']}-{key}.jpg")
        im.save(out, quality=q, optimize=True, subsampling=sub)
        entry['maps'][key] = {'file': f"assets/textures/{t['id']}-{key}.jpg", 'sha256': sha(out), 'bytes': os.path.getsize(out)}
        if key == 'map': entry['mean'] = [round(x, 4) for x in channel_means(im, True)]
        if key == 'rough':
            m = channel_means(im, False)
            entry['ao'] = name == 'arm'  # ARM: red is ambient occlusion, green roughness, blue metalness
            entry['rough'] = round(m[1], 4)
            if t.get('metal') and name == 'arm': entry['metal'] = True
    dims = info.get('dimensions') or [2000, 2000]
    entry['size'] = round(sum(dims[:2]) / 2 / 1000, 2)  # metres covered by one copy of the texture
    if 'bump' in t: entry['bump'] = t['bump']
    entry.update({'license': 'CC0 1.0', 'authors': list(info.get('authors', {}).keys()), 'name': info.get('name', ph), 'source': f'https://polyhaven.com/a/{ph}'})
    man['textures'][t['id']] = entry
    kb = sum(m['bytes'] for m in entry['maps'].values()) / 1024
    print(f"{t['id']:16s} {kb:7.0f} KB  {entry['size']} m  texture: {entry['name']}")

def main():
    src = json.load(open(os.path.join(ROOT, 'assets/sources.json')))
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    man_path = os.path.join(OUT, 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {'format': 'elsewhere-assets/1', 'models': {}, 'hdris': {}}
    man.setdefault('textures', {})
    for d in ('models', 'hdri', 'textures'): os.makedirs(os.path.join(OUT, d), exist_ok=True)
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
    for t in src.get('textures', []):
        if only and t['id'] not in only: continue
        texture_set(t, man)
    # sets no longer listed in sources.json leave the manifest (and their files go)
    for k in [k for k in man['textures'] if k not in {t['id'] for t in src.get('textures', [])}]:
        for m in man['textures'].pop(k)['maps'].values():
            p = os.path.join(OUT, '..', m['file'])
            if os.path.exists(p): os.remove(p)
    tex_bytes = sum(m['bytes'] for v in man['textures'].values() for m in v['maps'].values())
    if tex_bytes > TEX_BUDGET: print(f'WARNING: textures total {tex_bytes/1e6:.1f} MB, over the {TEX_BUDGET/1e6:.0f} MB budget')
    with open(man_path, 'w') as f: json.dump(man, f, indent=1)
    lines = ['# Credits', '', 'Elsewhere uses these free assets, all **CC0 1.0 (public domain)**, from [Poly Haven](https://polyhaven.com). Thank you to the artists.', '',
             '| asset | used as | authors |', '|---|---|---|']
    for k, v in sorted(man['models'].items()): lines.append(f"| [{v['name']}]({v['source']}) | model `{k}` | {', '.join(v['authors'])} |")
    for k, v in sorted(man['hdris'].items()): lines.append(f"| [{v['name']}]({v['source']}) | sky `{k}` | {', '.join(v['authors'])} |")
    for k, v in sorted(man['textures'].items()): lines.append(f"| [{v['name']}]({v['source']}) | texture `{k}` | {', '.join(v['authors'])} |")
    lines += ['', 'Fonts: Chakra Petch and Inter, SIL Open Font License 1.1 (see docs/fonts).']
    # keep sections other tools own (tools/characters.py writes one between markers)
    cpath = os.path.join(ROOT, 'CREDITS.md'); keep = ''
    if os.path.exists(cpath):
        old = open(cpath).read(); a, b = old.find('<!-- characters:start -->'), old.find('<!-- characters:end -->')
        if a >= 0 and b > a: keep = '\n' + old[a:b + len('<!-- characters:end -->')] + '\n'
    with open(cpath, 'w') as f: f.write('\n'.join(lines) + '\n' + keep)
    total = sum(v['bytes'] for v in man['models'].values()) + sum(v['bytes'] for v in man['hdris'].values()) + tex_bytes
    print(f"manifest: {len(man['models'])} models, {len(man['hdris'])} skies, {len(man['textures'])} texture sets ({tex_bytes/1e6:.1f} MB), {total/1e6:.1f} MB")

if __name__ == '__main__':
    main()
