#!/usr/bin/env python3
"""Proof-of-play test: play scripted sessions in a real browser, export the proofs, and check them.

usage: python3 tools/proof_test.py [--engine chromium|webkit] [--scenario walk|npc|shop|lap|all] [--out proofs]

Each scenario drives the game only through input (keys, the on-screen stick, dialog keys, panel clicks),
exactly as a player would. The proofs it collects are written to --out; then tools/verify.mjs replays
them in Node (V8) and the page replays them again in the browser. Exit code 1 if any check fails.
"""
import argparse, json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

BOT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'circuit_bot.js')).read()

def launch(p, engine):
    bt = getattr(p, engine)
    kw = {'headless': True}
    if engine == 'chromium':
        kw['args'] = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
    return bt.launch(**kw)

def open_page(browser, url, prof):
    ctx = browser.new_context(viewport={'width': 960, 'height': 600})
    ctx.add_init_script(profile_script(prof))
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto(url)
    page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && EW.sim.tick > 30', timeout=60000)
    return page, errors

def hold(page, key, secs):
    page.keyboard.down(key); page.wait_for_timeout(int(secs * 1000)); page.keyboard.up(key)

def scenario_walk(page):
    # walk, turn the camera (mouse drag), jump: a plain trajectory with no dialogs
    page.mouse.move(480, 300); page.mouse.down(); page.mouse.move(380, 300, steps=8); page.mouse.up()
    page.keyboard.down('KeyW')
    for _ in range(4):
        page.wait_for_timeout(450); page.keyboard.press('Space')
    page.keyboard.down('KeyA'); page.wait_for_timeout(600); page.keyboard.up('KeyA')
    page.keyboard.up('KeyW')
    page.wait_for_timeout(500)

def walk_to(page, x, z, timeout=12, stop=0.6):
    # steer with the on-screen stick values, aimed by the camera yaw: like a player holding a direction
    page.evaluate("""([x, z, stop]) => { window.__goal = [x, z, stop]; if (window.__steer) return;
      window.__steer = true;
      const loop = () => { const g = window.__goal; if (!g) { EW.input.stick.x = EW.input.stick.y = 0; window.__steer = false; return; }
        const p = EW.player.pos, dx = g[0] - p.x, dz = g[1] - p.z, d = Math.hypot(dx, dz);
        if (d < g[2]) { EW.input.stick.x = EW.input.stick.y = 0; window.__goal = null; window.__steer = false; return; }
        const yaw = EW.camRig.yaw, want = Math.atan2(dx, dz);
        let a = want - yaw; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
        const s = Math.min(1, d / 2);
        EW.input.stick.x = -Math.sin(a) * s; EW.input.stick.y = Math.cos(a) * s;
        requestAnimationFrame(loop); };
      requestAnimationFrame(loop); }""", [x, z, stop])
    page.wait_for_function('!window.__goal', timeout=timeout * 1000)

def scenario_npc(page):
    # hub: walk to Wren, press F, read through the dialog with F presses
    walk_to(page, -3.2, 14.2, stop=2.0)
    page.wait_for_timeout(300)
    page.keyboard.press('KeyF')
    page.wait_for_timeout(400)
    for _ in range(12):
        if page.evaluate("document.getElementById('dialog').classList.contains('hidden')"): break
        page.keyboard.press('KeyF'); page.wait_for_timeout(120); page.keyboard.press('KeyF'); page.wait_for_timeout(150)
    page.wait_for_timeout(400)

def scenario_shop(page):
    # hub: buy a cap from Pim (needs the coins the test profile starts with)
    pim = page.evaluate("(() => { const n = EW.world.npcs.find((n) => n.avatar.tag); const it = EW.world.interactables.find((i) => /Pim/.test(i.label)); return [it.pos.x, it.pos.z]; })()")
    walk_to(page, pim[0], pim[1], timeout=25, stop=2.2)
    page.wait_for_timeout(300)
    page.keyboard.press('KeyF')
    page.wait_for_timeout(500)
    for _ in range(8):
        if page.evaluate("document.getElementById('dialog').classList.contains('hidden')"): break
        page.keyboard.press('KeyF'); page.wait_for_timeout(120); page.keyboard.press('KeyF'); page.wait_for_timeout(150)
    page.wait_for_function("EW.ui.panelOpen && EW.ui.panelOpen.startsWith('shop:')", timeout=5000)
    page.click("#panel .card.item:has-text('Cap') button")
    page.wait_for_function("(EW.profile.data.inv.cap || 0) > 0", timeout=5000)
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)

def scenario_katana(page):
    # hub: buy the Katana from Pim, equip it, and break a training dummy with three strikes (key 1)
    pim = page.evaluate("(() => { const it = EW.world.interactables.find((i) => /Pim/.test(i.label)); return [it.pos.x, it.pos.z]; })()")
    walk_to(page, pim[0], pim[1], timeout=25, stop=2.2)
    page.wait_for_timeout(300)
    page.keyboard.press('KeyF')
    page.wait_for_timeout(500)
    for _ in range(8):
        if page.evaluate("document.getElementById('dialog').classList.contains('hidden')"): break
        page.keyboard.press('KeyF'); page.wait_for_timeout(120); page.keyboard.press('KeyF'); page.wait_for_timeout(150)
    page.wait_for_function("EW.ui.panelOpen && EW.ui.panelOpen.startsWith('shop:')", timeout=5000)
    page.click("#panel .card.item:has-text('Katana') button")
    page.wait_for_function("(EW.profile.data.inv.katana || 0) > 0", timeout=5000)
    page.keyboard.press('Escape'); page.wait_for_timeout(300)
    # a bought hand item is equipped at once when the hand is free; equip it from the inventory only if not
    if page.evaluate("EW.profile.data.eq.hand") != 'katana':
        page.keyboard.press('KeyI'); page.wait_for_timeout(500)
        page.click("#panel .card.item:has-text('Katana') button:text-is('Equip')")
        page.wait_for_function("EW.profile.data.eq.hand === 'katana'", timeout=5000)
        page.keyboard.press('Escape'); page.wait_for_timeout(300)
    d = page.evaluate("[Math.sin(123 * Math.PI / 180) * 27, Math.cos(123 * Math.PI / 180) * 27]")
    walk_to(page, d[0], d[1], timeout=20, stop=1.4)
    page.wait_for_timeout(300)
    # strike until it falls (software rendering runs the game slower than the wall clock, so pace by game state)
    for _ in range(12):
        if page.evaluate("JSON.stringify(EW.profile.data.worlds.hub || {}).includes('dummies')"): break
        page.keyboard.press('Digit1'); page.wait_for_timeout(800)
    page.wait_for_function("JSON.stringify(EW.profile.data.worlds.hub || {}).includes('dummies')", timeout=5000)
    page.wait_for_timeout(500)

def scenario_slimes(page):
    # hub: carry the katana into the slime pen and sweep three slimes (key 1). They chase, wind up and hit back.
    c = page.evaluate("[Math.sin(146 * Math.PI / 180) * 27.5, Math.cos(146 * Math.PI / 180) * 27.5]")
    gate = page.evaluate("(c) => { const g = Math.atan2(-c[0], -c[1]); return [c[0] + Math.sin(g) * 4.8, c[1] + Math.cos(g) * 4.8]; }", c)
    walk_to(page, gate[0], gate[1], timeout=40, stop=0.6)
    walk_to(page, c[0], c[1], timeout=10, stop=0.9)
    done = "EW.sim.claims.some((c) => c[1] === 'record' && c[2] === 'slimes')"
    for _ in range(80):
        if page.evaluate(done): break
        if page.evaluate("Math.hypot(EW.player.pos.x - %f, EW.player.pos.z - %f) > 6" % (c[0], c[1])):  # knocked out: back into the pen
            walk_to(page, gate[0], gate[1], timeout=40, stop=0.6); walk_to(page, c[0], c[1], timeout=10, stop=0.9)
        tgt = page.evaluate("(() => { const p = EW.player.pos; const f = EW.world.foes.filter((f) => f.alive).sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0]; return f ? [f.x, f.z] : null; })()")
        if tgt:
            try: walk_to(page, tgt[0], tgt[1], timeout=4, stop=1.4)
            except Exception: page.evaluate("window.__goal = null")
        for _ in range(3): page.keyboard.press('Digit1'); page.wait_for_timeout(420)
    page.wait_for_function(done, timeout=10000)
    page.wait_for_timeout(500)

def scenario_lap(page):
    page.evaluate(BOT)
    # the bot steers through the same input state as the keyboard; it starts the race by driving onto the grid
    page.wait_for_function("EW.world.group.userData.circuit.state === 'finished' || EW.world.group.userData.circuit.state === 'idle' && (EW.profile.data.worlds.circuit && EW.profile.data.worlds.circuit.store.last)", timeout=120000)
    page.wait_for_timeout(6000)  # staged rewards arrive over a few seconds
    page.evaluate("window.BOT && (window.BOT.on = false)")

def scenario_exit(page):
    # finish a lap, then ride/walk out through the paddock portal: the stored proof covers the whole visit
    scenario_lap(page)
    page.evaluate("""() => { window.__exit = true;
      const loop = () => { if (!window.__exit || EW.traveling || EW.world.id !== 'circuit') { EW.input.stick.x = EW.input.stick.y = 0; return; }
        const p = EW.player.pos, dx = -44 - p.x, dz = 18 - p.z;
        let a = Math.atan2(dx, dz) - EW.camRig.yaw; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
        EW.input.stick.x = -Math.sin(a); EW.input.stick.y = Math.cos(a); requestAnimationFrame(loop); };
      requestAnimationFrame(loop); }""")
    page.wait_for_function("EW.world.id === 'hub' && !EW.traveling && EW.runs.length > 0", timeout=60000)

def scenario_rush(page):
    # one full 90-second round of Crystal Rush, played by a keys-only bot
    page.evaluate(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rush_bot.js')).read())
    page.wait_for_function("EW.world.group.userData.rush.state === 'running'", timeout=30000)
    page.wait_for_function("EW.world.group.userData.rush.state === 'done'", timeout=150000)
    page.wait_for_timeout(5000)  # rewards arrive after the banner
    page.evaluate("window.RUSHBOT.on = false")
    print('  rush score', page.evaluate("EW.world.group.userData.rush.score"))

def scenario_level(page):
    # test-play the sample community level from its data (as the Creator's Gate does), clear it, leave
    level = json.load(open(os.path.join(ROOT, 'levels/lantern-steps.json')))
    page.evaluate("async (raw) => { const k = EW.profile.data.key; raw.author = { name: EW.profile.data.name || 'Wanderer', key: k ? k.pub : '' }; window.__lv = (await EW.playLevel(raw)).id; }", level)
    page.wait_for_function("EW.world && EW.world.id === window.__lv && !EW.traveling && EW.sim.tick > 20", timeout=30000)
    page.evaluate(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'level_bot.js')).read())
    page.wait_for_function("EW.sim.claims.some((c) => c[1] === 'record' && c[2] === 'time')", timeout=90000)
    print('  cleared in', page.evaluate("EW.sim.claims.find((c) => c[1] === 'record')[3].toFixed(2)"), 's')
    page.wait_for_timeout(800)
    page.evaluate("EW.leaveTo('hub')")
    page.wait_for_function("EW.world.id === 'hub' && !EW.traveling && EW.runs.length > 0", timeout=30000)
    # make the compiled level available to the Node verifier (an unpublished level is not in the archive yet)
    L = page.evaluate("(() => { const L = EW.localLevels[window.__lv]; return { sha: L.sha256, text: L.text }; })()")
    open(os.path.join(page.context.__docs, 'worlds/by-hash', L['sha'] + '.js'), 'w').write(L['text'])

def scenario_reward(page):
    # a creator item: a level with a reward is cleared (the item is given and worn), then worn in Junction.
    # The Junction visit pins the level's module, so a verifier that never played the level can replay it.
    level = json.load(open(os.path.join(ROOT, 'levels/lantern-steps.json')))
    level['reward'] = {'name': 'Lantern Crown', 'slot': 'head', 'desc': 'For climbing the lantern steps.',
                       'look': [{'s': 'cyl', 'r': 0.23, 'h': 0.12, 'pos': [0, 0.06, 0], 'color': '#ffd166', 'metal': 0.8},
                                {'s': 'cone', 'r': 0.05, 'h': 0.14, 'pos': [0, 0.18, 0.2], 'color': '#ffd166'},
                                {'s': 'sphere', 'r': 0.04, 'pos': [0, 0.07, 0.23], 'color': '#ff5d8f', 'glow': 1.2}]}
    page.evaluate("async (raw) => { const k = EW.profile.data.key; raw.author = { name: EW.profile.data.name || 'Wanderer', key: k ? k.pub : '' }; window.__lv = (await EW.playLevel(raw)).id; }", level)
    page.wait_for_function("EW.world && EW.world.id === window.__lv && !EW.traveling && EW.sim.tick > 20", timeout=30000)
    page.evaluate(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'level_bot.js')).read())
    page.wait_for_function("(EW.profile.data.inv[window.__lv + '-r'] || 0) > 0", timeout=90000)
    print('  reward given and worn:', page.evaluate("[window.__lv + '-r', EW.profile.data.eq.head, EW.items.get(window.__lv + '-r').by]"))
    page.wait_for_timeout(800)
    page.evaluate("EW.leaveTo('hub')")
    page.wait_for_function("EW.world.id === 'hub' && !EW.traveling && EW.runs.length > 0 && EW.sim.tick > 30", timeout=30000)
    print('  Junction pins the level:', page.evaluate("EW.run.registry.some((r) => r.id === window.__lv)"))
    page.evaluate("EW.queueAction(['equip', null, 'head'])"); page.wait_for_function("EW.profile.data.eq.head === null", timeout=5000)
    page.evaluate("EW.queueAction(['equip', window.__lv + '-r', 'head'])"); page.wait_for_function("EW.profile.data.eq.head === window.__lv + '-r'", timeout=5000)
    hold(page, 'KeyW', 0.8)
    page.wait_for_timeout(400)
    page.context.__extra = [('junction', page.evaluate('EW.currentProof()'))]
    L = page.evaluate("(() => { const L = EW.localLevels[window.__lv]; return { sha: L.sha256, text: L.text }; })()")
    open(os.path.join(page.context.__modules, L['sha'] + '.js'), 'w').write(L['text'])
    print('  level module:', os.path.join(page.context.__modules, L['sha'] + '.js'))

def box_stl(path, sx, sy, sz):
    # a binary STL box from (0,0,0) to (sx,sy,sz), Z up (as 3D-printing files are)
    import struct
    v = [(x, y, z) for x in (0, sx) for y in (0, sy) for z in (0, sz)]
    faces = [(0, 2, 3), (0, 3, 1), (4, 5, 7), (4, 7, 6), (0, 1, 5), (0, 5, 4), (2, 6, 7), (2, 7, 3), (0, 4, 6), (0, 6, 2), (1, 3, 7), (1, 7, 5)]
    with open(path, 'wb') as f:
        f.write(b'\0' * 80 + struct.pack('<I', len(faces)))
        for a, b, c in faces: f.write(struct.pack('<3f', 0, 0, 0) + b''.join(struct.pack('<3f', *v[i]) for i in (a, b, c)) + b'\0\0')

def scenario_model(page):
    # an uploaded model: an STL imported through the Builder, placed as the only floor between the start and the flag
    # (solid through its hull). Clearing the level proves the hull collider; the verifier never sees the model.
    import tempfile
    stl = os.path.join(tempfile.mkdtemp(prefix='ew-model-'), 'slab.stl'); box_stl(stl, 8, 10, 1.2)  # 8 x 10 m, 1.2 m thick
    page.evaluate("EW.ui.openPanel('gate')")
    page.wait_for_function("document.activeElement && document.activeElement.textContent === 'Open the Builder'", timeout=8000)
    page.keyboard.press('Enter'); page.wait_for_function('EW.builder.active', timeout=10000); page.wait_for_timeout(1200)
    page.keyboard.press('Escape'); page.wait_for_timeout(600)
    page.set_input_files('input[type=file][accept=".stl,.glb"]', stl)
    page.wait_for_function("[...document.querySelectorAll('.vres.ok')].some((e) => /^Imported/.test(e.textContent))", timeout=30000)
    print('  ', page.evaluate("[...document.querySelectorAll('.vres.ok')].find((e) => /^Imported/.test(e.textContent)).textContent"))
    m = page.evaluate("JSON.parse(localStorage.getItem('elsewhere_models_v1')).find((x) => x.name === 'slab')")
    page.evaluate('EW.builder.close()'); page.wait_for_function('!EW.builder.active', timeout=10000)
    level = {'name': 'Model Bridge', 'theme': 'dusk', 'spawn': [0, 0, 0, 180], 'goal': [0, 0, -10], 'things': [],
             'parts': [{'s': 'mesh', 'h': m['h'], 'p': [0, -1.2, -7], 'y': 0, 'k': 10, 'c': '#ffd6a5', 'hull': m['hull']}]}
    page.evaluate("async (raw) => { const k = EW.profile.data.key; raw.author = { name: EW.profile.data.name || 'Wanderer', key: k ? k.pub : '' }; window.__lv = (await EW.playLevel(raw)).id; }", level)
    page.wait_for_function("EW.world && EW.world.id === window.__lv && !EW.traveling && EW.sim.tick > 20", timeout=30000)
    page.wait_for_function("(() => { let n = 0; EW.world.group.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.userData.keep && o.geometry.attributes.normal && o.geometry.attributes.position.count >= 36) n++; }); return n > 0; })()", timeout=20000)
    print('  the model is drawn; level format', page.evaluate("EW.localLevels[window.__lv].level.format"))
    walk_to(page, 0, -10, timeout=30, stop=0.8)
    page.wait_for_function("EW.sim.claims.some((c) => c[1] === 'record' && c[2] === 'time')", timeout=20000)
    print('  cleared on the model in', page.evaluate("EW.sim.claims.find((c) => c[1] === 'record')[3].toFixed(2)"), 's; height', page.evaluate("EW.player.pos.y.toFixed(2)"))
    page.wait_for_timeout(600)
    page.evaluate("EW.leaveTo('hub')")
    page.wait_for_function("EW.world.id === 'hub' && !EW.traveling && EW.runs.length > 0", timeout=30000)
    L = page.evaluate("(() => { const L = EW.localLevels[window.__lv]; return { sha: L.sha256, text: L.text }; })()")
    open(os.path.join(page.context.__modules, L['sha'] + '.js'), 'w').write(L['text'])

def scenario_clash(page):
    # two minutes of Spire Clash, played through the real keyboard state (abilities are key presses)
    page.evaluate(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clash_bot.js')).read())
    page.wait_for_function("EW.world.group.userData.clash.state === 'live'", timeout=30000)
    page.wait_for_timeout(120000)
    page.evaluate("window.CLASHBOT.on = false")
    print('  clash:', page.evaluate("(() => { const C = EW.world.group.userData.clash; return `lvl ${C.player.lvl} vs ${C.rival.lvl}, minions ${C.cs}, takedowns ${C.kills}, deaths ${C.deaths}, casts ${window.CLASHBOT.casts}, towers ${C.towers.filter((t) => t.alive && t.team === 0).length}-${C.towers.filter((t) => t.alive && t.team === 1).length}`; })()"))

def scenario_vault(page):
    # all three sigils in the pack: open the Vault (an ask), walk in, take the crown (a pickup created mid-run)
    walk_to(page, 0, 9.0, stop=1.2, timeout=20)
    page.keyboard.press('KeyF')
    page.wait_for_function("document.querySelector('#dialog .choices').children.length > 0", timeout=5000)
    page.keyboard.press('Digit1')
    page.wait_for_function("EW.profile.data.worlds.hub.store.open === true", timeout=5000)
    page.wait_for_timeout(2800)  # the door rises
    walk_to(page, 0, 1.3, stop=0.5, timeout=20)   # up to the pedestal; the crown floats above it
    page.keyboard.down('KeyW'); page.wait_for_timeout(600); page.keyboard.up('KeyW')   # step up to the pedestal
    page.wait_for_function("(EW.profile.data.inv.crown || 0) > 0", timeout=8000)
    page.wait_for_timeout(500)

def scenario_async(page):
    # the asynctest world: wait chains on arrival, a zone with a wait, an NPC with say/wait/ask/wait
    page.wait_for_timeout(1500)
    walk_to(page, 0, 5, stop=0.4)       # enter the zone (launch after a wait)
    page.wait_for_timeout(900)
    walk_to(page, 4, 0, stop=2.0)       # talk to Tess
    page.keyboard.press('KeyF'); page.wait_for_timeout(500)
    for _ in range(6):
        if page.evaluate("document.querySelector('#dialog .choices').children.length > 0"): break
        page.keyboard.press('KeyF'); page.wait_for_timeout(200)
    page.wait_for_function("document.querySelector('#dialog .choices').children.length > 0", timeout=5000)
    page.keyboard.press('Digit1')
    page.wait_for_function("(EW.profile.data.inv['test-token'] || 0) > 0", timeout=5000)
    walk_to(page, 0, 5, stop=0.4)       # the zone again
    page.wait_for_timeout(1200)

SCENARIOS = {
    'walk': ('skyreach', scenario_walk),
    'npc': ('hub', scenario_npc),
    'shop': ('hub', scenario_shop),
    'katana': ('hub', scenario_katana),
    'slimes': ('hub', scenario_slimes),
    'lap': ('circuit', scenario_lap),
    'exit': ('circuit', scenario_exit),
    'async': ('asynctest', scenario_async),
    'vault': ('hub', scenario_vault),
    'rush': ('rush', scenario_rush),
    'level': ('hub', scenario_level),
    'reward': ('hub', scenario_reward),
    'model': ('hub', scenario_model),
    'clash': ('clash', scenario_clash),
}
PROFILES = {'katana': {'coins': 100}, 'slimes': {'inv': {'katana': 1}, 'eq': {'head': None, 'back': None, 'hand': 'katana', 'feet': None, 'board': None}}, 'vault': {'inv': {'sigil-sky': 1, 'sigil-deep': 1, 'sigil-speed': 1}, 'flags': {'met.wren': True, 'sigil.sky': True, 'sigil.deep': True, 'sigil.speed': True}}}

def with_test_worlds(docs):
    # a throwaway copy of the site with the test worlds registered (pinned by hash, like any world)
    import hashlib, shutil, tempfile
    tmp = tempfile.mkdtemp(prefix='ew-site-')
    site = os.path.join(tmp, 'docs'); shutil.copytree(docs, site)
    reg = json.load(open(os.path.join(site, 'worlds/registry.json')))
    tdir = os.path.join(ROOT, 'tests/worlds')
    for f in sorted(os.listdir(tdir)):
        text = open(os.path.join(tdir, f), encoding='utf8').read()
        h = hashlib.sha256(text.encode('utf8')).hexdigest()
        open(os.path.join(site, 'worlds', f), 'w', encoding='utf8').write(text)
        open(os.path.join(site, 'worlds/by-hash', h + '.js'), 'w', encoding='utf8').write(text)
        wid = f[:-3]
        reg['worlds'].append({'id': wid, 'name': wid, 'kind': 'test', 'author': 'tests', 'version': 1, 'blurb': '', 'color': '#888888', 'url': 'worlds/' + f, 'sha256': h, 'bytes': len(text.encode('utf8')), 'rules': {}, 'items': {'test-token': {'name': 'Test Token', 'slot': None, 'traits': ['key'], 'desc': 'test', 'look': [{'s': 'oct', 'r': 0.2, 'color': '#ff0'}]}}})
    json.dump(reg, open(os.path.join(site, 'worlds/registry.json'), 'w'))
    return site

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', default='chromium')
    ap.add_argument('--scenario', default='all')
    ap.add_argument('--out', default=os.path.join(ROOT, 'proofs'))
    ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'))
    ap.add_argument('--url', default='', help='play on a deployed site instead of a local build (e.g. the live URL)')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    names = list(SCENARIOS) if args.scenario == 'all' else args.scenario.split(',')
    if 'async' in names or 'level' in names: args.docs = with_test_worlds(args.docs)
    modules = os.path.join(args.out, 'modules'); os.makedirs(modules, exist_ok=True) # unpublished levels some proofs pin
    httpd, port = serve(args.docs)
    files, ok = [], True
    with sync_playwright() as p:
        browser = launch(p, args.engine)
        for name in names:
            world, fn = SCENARIOS[name]
            prof = json.loads(json.dumps(PROFILE)); prof['coins'] = 40; prof.update(PROFILES.get(name, {}))
            base = args.url.rstrip('/') + '/' if args.url else f'http://127.0.0.1:{port}/'
            page, errors = open_page(browser, f'{base}#{world}', prof)
            page.context.__docs = args.docs
            page.context.__modules = modules
            t0 = time.time()
            fn(page)
            proof = page.evaluate("EW.runs.length && EW.runs[0].proof.world.id !== EW.world.id ? EW.runs[0].proof : EW.currentProof()")
            if not proof:
                print(f'[{name}] no proof'); ok = False; continue
            # in-browser verification of the same proof (same engine)
            res = page.evaluate('(p) => EW.verify(p).then((r) => ({ ok: r.ok, reason: r.reason || null, ms: r.ms, sig: r.sigStatus }))', proof)
            path = os.path.join(args.out, f'{args.engine}-{name}.json')
            with open(path, 'w') as f: json.dump(proof, f)
            files.append(path)
            claims = [c for c in proof['claims'] if c[1] in ('record', 'give', 'coins', 'flag', 'buy', 'equip', 'take')]
            print(f"[{name}] {args.engine}: {proof['ticks']} ticks, {len(proof['events'])} events, claims {claims[:8]}{' …' if len(claims) > 8 else ''}; "
                  f"{os.path.getsize(path) / 1024:.1f} KB; in-page verify: {'OK' if res['ok'] else 'FAIL ' + str(res['reason'])} ({res['ms']} ms, sig {res['sig']}); {time.time() - t0:.0f} s")
            if not res['ok']: ok = False
            # further proofs a scenario hands back (another visit it wants verified too)
            for suffix, extra in getattr(page.context, '__extra', []) or []:
                r2 = page.evaluate('(p) => EW.verify(p).then((r) => ({ ok: r.ok, reason: r.reason || null }))', extra)
                xp = os.path.join(args.out, f'{args.engine}-{name}-{suffix}.json')
                with open(xp, 'w') as f: json.dump(extra, f)
                files.append(xp)
                print(f"[{name}-{suffix}] {extra['ticks']} ticks, {len(extra['events'])} events, pins {len(extra['registry'])}; in-page verify: {'OK' if r2['ok'] else 'FAIL ' + str(r2['reason'])}")
                if not r2['ok']: ok = False
            bad = [e for e in errors if 'WebGL' not in e and 'GPU' not in e]
            if bad: print('  page errors:', bad[:5])
            page.context.close()
        browser.close()
    httpd.shutdown()
    if files:
        r = subprocess.run(['node', os.path.join(ROOT, 'tools/verify.mjs'), '--docs', args.docs, '--modules', modules, *files], capture_output=True, text=True)
        print(r.stdout.strip()); print(r.stderr.strip()[-2000:]) if r.returncode else None
        if r.returncode: ok = False
    print('ALL OK' if ok else 'FAILURES')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
