#!/usr/bin/env python3
"""Fetch, trim and pin the rigged, animated characters players can wear.

usage: python3 tools/characters.py [--only id,id]

Reads assets/characters.json. Every character there is CC0 (public domain).
- Download each .glb from its pinned source commit. The file's SHA-256 is recorded on first fetch and checked after that.
- Strip the props held in the hands (players hold their own items), and keep only the clips the game plays.
  KayKit files carry about 76 clips; the game uses 7.
- gltfpack rebuilds what is left: it drops unused data, quantises, resamples clips at 30 Hz and compresses (meshopt).
Outputs: docs/assets/characters/<id>.glb, and docs/assets/characters.json, which pins each file by SHA-256 (the
engine checks it) and carries the rig settings the engine needs. Also the characters section of CREDITS.md.
Downloads are cached in assets/.cache, which is not committed.
"""
import hashlib, json, os, struct, subprocess, sys, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
UA = {'User-Agent': 'elsewhere-asset-fetch/1.0'}
SPEC = os.path.join(ROOT, 'assets/characters.json')
CACHE, OUT = os.path.join(ROOT, 'assets/.cache/characters'), os.path.join(ROOT, 'docs/assets/characters')
MANIFEST = os.path.join(ROOT, 'docs/assets/characters.json')
CREDITS = os.path.join(ROOT, 'CREDITS.md')
MARK_A, MARK_B = '<!-- characters:start -->', '<!-- characters:end -->'

def sha(data): return hashlib.sha256(data).hexdigest()

def read_glb(b):
    if b[:4] != b'glTF': raise ValueError('not a binary glTF')
    total, off, js, binc = struct.unpack('<I', b[8:12])[0], 12, None, None
    while off < total:
        ln, typ = struct.unpack('<II', b[off:off + 8]); data = b[off + 8:off + 8 + ln]
        if typ == 0x4E4F534A: js = json.loads(data)
        elif typ == 0x004E4942: binc = data
        off += 8 + ln
    return js, binc

def write_glb(js, binc):
    jb = json.dumps(js, separators=(',', ':')).encode()
    jb += b' ' * ((4 - len(jb) % 4) % 4)
    parts = [struct.pack('<II', len(jb), 0x4E4F534A), jb]
    if binc is not None:
        bb = binc + b'\0' * ((4 - len(binc) % 4) % 4)
        parts += [struct.pack('<II', len(bb), 0x004E4942), bb]
    body = b''.join(parts)
    return struct.pack('<4sII', b'glTF', 2, 12 + len(body)) + body

def trim(js, strip, clips):
    for n in js['nodes']:
        if n.get('name') in strip: n.pop('mesh', None); n.pop('skin', None)
    have = {a.get('name') for a in js.get('animations', [])}
    missing = [c for c in clips if c not in have]
    if missing: raise ValueError('missing clips: ' + ', '.join(missing))
    js['animations'] = [a for a in js['animations'] if a.get('name') in clips]

def main():
    only = None
    if '--only' in sys.argv: only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
    spec = json.load(open(SPEC))
    os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    old = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {'characters': []}
    done = {c['id']: c for c in old.get('characters', [])}
    pinned_new = False
    for c in spec['characters']:
        if only and c['id'] not in only: continue
        src, rig = spec['sources'][c['source']], spec['rigs'][c['rig']]
        url = f"https://raw.githubusercontent.com/{src['repo']}/{src['commit']}/{src['dir']}{c['file']}"
        cpath = os.path.join(CACHE, c['source'] + '-' + c['file'])
        if not os.path.exists(cpath):
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()
            with open(cpath, 'wb') as f: f.write(data)
        raw = open(cpath, 'rb').read()
        if c.get('sha256') and sha(raw) != c['sha256']: raise SystemExit(f"{c['id']}: the source file no longer matches its pinned SHA-256")
        if not c.get('sha256'): c['sha256'] = sha(raw); pinned_new = True
        js, binc = read_glb(raw)
        trim(js, set(c.get('strip', [])), list(rig['anims'].values()))
        tmp = os.path.join(CACHE, c['id'] + '.trimmed.glb')
        with open(tmp, 'wb') as f: f.write(write_glb(js, binc))
        out = os.path.join(OUT, c['id'] + '.glb')
        r = subprocess.run(['npx', '--no-install', 'gltfpack', '-i', tmp, '-o', out, '-cc', '-kn'], cwd=ROOT, capture_output=True, text=True)
        if r.returncode: raise SystemExit(f"{c['id']}: gltfpack failed: {r.stderr[-400:]}")
        packed = open(out, 'rb').read()
        done[c['id']] = {
            'id': c['id'], 'name': c['name'], 'file': f"assets/characters/{c['id']}.glb", 'sha256': sha(packed), 'bytes': len(packed),
            'height': c.get('height', 1.8), 'anims': rig['anims'], 'once': rig.get('once', []), 'slots': rig['slots'],
            'hand': rig.get('hand', 'bone'), 'handRot': rig.get('handRot', [0, 0, 0]), 'speeds': rig.get('speeds', {'walk': 1.8, 'run': 4.8}),
            'hatScale': rig.get('hatScale', 1), 'headwear': c.get('headwear', []), 'backwear': c.get('backwear', []),
            'credit': {'title': src['title'], 'author': src['author'], 'license': src['license'], 'source': f"https://github.com/{src['repo']}"},
        }
        print(f"{c['id']:18} {len(raw) / 1e6:5.2f} MB -> {len(packed) / 1e3:6.1f} KB")
    order = [c['id'] for c in spec['characters']]
    chars = [done[i] for i in order if i in done]
    with open(MANIFEST, 'w') as f:
        json.dump({'format': 'elsewhere-characters/1', 'note': 'Rigged, animated CC0 characters (tools/characters.py). Each file is pinned by SHA-256.', 'characters': chars}, f, indent=1)
    if pinned_new:
        with open(SPEC, 'w') as f: json.dump(spec, f, indent=2, ensure_ascii=False); f.write('\n')
    # credits: one marked section, so the other asset tool can keep it when it rewrites the file
    lines = [MARK_A, '## Characters', '', 'Rigged and animated characters players can wear, trimmed and packed by `tools/characters.py`. All CC0 1.0 (public domain).', '']
    for key, src in spec['sources'].items():
        names = [c['name'] for c in spec['characters'] if c['source'] == key]
        lines.append(f"- **{src['title']}** by {src['author']} ({src['license']}): {', '.join(names)}. https://github.com/{src['repo']}")
    lines.append(MARK_B)
    text = open(CREDITS).read() if os.path.exists(CREDITS) else '# Credits\n'
    if MARK_A in text: text = text[:text.index(MARK_A)] + '\n'.join(lines) + text[text.index(MARK_B) + len(MARK_B):]
    else: text = text.rstrip('\n') + '\n\n' + '\n'.join(lines) + '\n'
    with open(CREDITS, 'w') as f: f.write(text)
    print('total', round(sum(c['bytes'] for c in chars) / 1e6, 2), 'MB for', len(chars), 'characters')

if __name__ == '__main__':
    main()
