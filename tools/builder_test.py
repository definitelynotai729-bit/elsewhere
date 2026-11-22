#!/usr/bin/env python3
"""Builder test: make a level with key presses only, check its JSON, then test-play it and clear it.

usage: python3 tools/builder_test.py [--engine chromium|webkit] [--shots /tmp/wb_shots] [--docs docs]

1. In Junction, open the Creator's Gate; "Open the Builder" has the focus, so Enter opens it.
2. Key presses only: remove the starter floor, then build a floor, a ramp, an upper platform and a jump pad,
   move the goal flag and the spawn point. Undo and redo once on the way.
3. The exported JSON passes checkLevel in the page and in Node, and is already canonical (checking it changes nothing).
4. P test-plays it: the level loads. A stick bot (input only) clears it. Esc then Enter goes back to the Builder,
   and the world stays paused while it is open. Leaving the level makes the clear run publishable at the Gate,
   and the clear run verifies in Node (tools/verify.mjs). Nothing is published.
With --scenario pieces (or all): every piece type by keys (the moving platform's end point, sign and label text,
colours, glow, copy), the five themes, draft slots, and importing levels/lantern-steps.json; then it test-plays that.
Screenshots go to --shots. Exit code 1 on any failure.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT, profile_script
from playwright.sync_api import sync_playwright

CHECK_JS = r"""
import { readFileSync } from 'node:fs';
import { checkLevel } from './src/engine/level.js';
const raw = JSON.parse(readFileSync(process.argv[process.argv.length - 1], 'utf8'));
const c = checkLevel(raw);
if (c.error) { console.log(JSON.stringify({ ok: false, error: c.error })); process.exit(0); }
const again = checkLevel(c.level);
const canonical = !again.error && JSON.stringify(again.level) === JSON.stringify(c.level)
  && ['format', 'name', 'blurb', 'theme', 'color', 'spawn', 'goal', 'parts', 'things'].every((k) => JSON.stringify(raw[k]) === JSON.stringify(c.level[k]));
console.log(JSON.stringify({ ok: true, canonical, level: c.level }));
"""

def launch(p, engine):
    kw = {'headless': True}
    if engine == 'chromium':
        kw['args'] = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
    return getattr(p, engine).launch(**kw)

fails, errors = [], []
def check(cond, what):
    print(('  ok    ' if cond else '  FAIL  ') + what)
    if not cond: fails.append(what)
    return cond

def open_page(browser, port):
    ctx = browser.new_context(viewport={'width': 1280, 'height': 720})
    prof = json.loads(json.dumps(PROFILE))
    ctx.add_init_script(profile_script(prof))
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    page.on('console', lambda m: errors.append(f'console.error: {m.text[:300]}') if m.type == 'error' and 'favicon' not in m.text else None)
    page.goto(f'http://127.0.0.1:{port}/#hub')
    page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim && EW.sim.tick > 30', timeout=90000)
    return ctx, page

def shot(page, args, name):
    path = os.path.join(args.shots, f'{name}.png'); page.screenshot(path=path); print('  shot', path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', default='chromium')
    ap.add_argument('--shots', default='/tmp/wb_shots')
    ap.add_argument('--docs', default=os.path.join(ROOT, 'docs'))
    ap.add_argument('--scenario', default='all', help='acceptance, pieces or all')
    args = ap.parse_args()
    os.makedirs(args.shots, exist_ok=True)
    httpd, port = serve(args.docs)
    with sync_playwright() as p:
        browser = launch(p, args.engine)
        if args.scenario in ('all', 'acceptance'): acceptance(browser, port, args)
        if args.scenario in ('all', 'pieces'): pieces(browser, port, args)
        browser.close()
    httpd.shutdown()
    bad = [e for e in errors if 'WebGL' not in e and 'GPU' not in e]
    check(not bad, 'no page errors' + (': ' + '; '.join(bad[:5]) if bad else ''))
    print('ALL OK' if not fails else f'FAILURES: {len(fails)}')
    sys.exit(1 if fails else 0)

def acceptance(browser, port, args):
        ctx, page = open_page(browser, port)
        key = lambda k, n=1: [page.keyboard.press(k) for _ in range(n)]
        shot_ = lambda name: shot(page, args, name)

        print('[open] the Creator\'s Gate, then "Open the Builder" by keyboard')
        page.evaluate("EW.ui.openPanel('gate')")  # what pressing F at the Gate does
        page.wait_for_function("document.activeElement && document.activeElement.textContent === 'Open the Builder'", timeout=5000)
        key('Enter')
        page.wait_for_function('EW.builder.active', timeout=10000)
        page.wait_for_timeout(1500)
        tick0 = page.evaluate('EW.sim.tick')
        check(not page.evaluate('EW.input.enabled'), 'game input is off while the Builder is open')
        shot_('builder-1-open')

        print('[build] key presses only')
        st = page.evaluate('EW.builder.state()')
        check(st['cursor'] == [0, 0, 0] and st['piece'] == 'box', f"the cursor starts at the spawn with the box ({st['cursor']}, {st['piece']})")
        key('KeyW', 6)
        check(page.evaluate('EW.builder.state().hover') == 'part 0', 'the starter floor is under the cursor')
        key('Backspace')
        check(len(page.evaluate('EW.builder.level().parts')) == 0, 'Backspace removed it')
        # the floor: a box, stretched to 4 x 1 x 12, with its top at the spawn's height
        key('Digit1'); key('Shift+KeyW', 8); key('KeyW', 2); key('Enter')
        # a ramp (it already faces away from the camera, 180 degrees): turn it a full circle with Q and E to test turning
        key('Digit2'); key('KeyQ', 4); key('KeyE', 4); key('KeyW', 9); key('Enter')
        shot_('builder-2-ramp')
        # the upper platform: 6 x 1 x 18, two metres up
        key('Digit1'); key('Shift+KeyD', 2); key('Shift+KeyW', 6); key('KeyR', 2); key('KeyW', 12); key('Enter')
        # a jump pad on it; undo it and redo it
        key('Digit5'); key('KeyS', 6); key('Enter')
        n_things = len(page.evaluate('EW.builder.level().things'))
        key('KeyZ'); undone = len(page.evaluate('EW.builder.level().things'))
        key('KeyY'); redone = len(page.evaluate('EW.builder.level().things'))
        check((n_things, undone, redone) == (1, 0, 1), f'Z undoes and Y redoes ({n_things}, {undone}, {redone})')
        # the goal flag at the far end, then the spawn point back near the start
        key('Shift+Digit2'); key('KeyW', 12); key('Enter')
        key('Shift+Digit3'); key('KeyF', 2); key('KeyS', 34); key('Enter')
        page.wait_for_timeout(600)
        shot_('builder-3-built')
        # a look from above
        key('KeyT'); key('KeyO', 3); page.wait_for_timeout(1400); shot_('builder-4-top'); key('KeyT'); key('KeyU', 3)

        lv = page.evaluate('EW.builder.level()')
        want_parts = [{'s': 'box', 'p': [0, -0.5, -8], 'z': [4, 1, 12], 'y': 0, 'c': '#5b5f97'},
                      {'s': 'ramp', 'p': [0, 1, -17], 'z': [4, 2, 6], 'y': 180, 'c': '#ff7eb6'},
                      {'s': 'box', 'p': [0, 1.5, -29], 'z': [6, 1, 18], 'y': 0, 'c': '#5b5f97'}]
        check(lv['parts'] == want_parts, 'a floor, a ramp and an upper platform, exactly where the keys put them')
        check(lv['things'] == [{'t': 'pad', 'p': [0, 2, -23], 'power': 17}], f"a jump pad on the upper platform ({lv['things']})")
        check(lv['spawn'] == [0, 0, -1, 180] and lv['goal'] == [0, 2, -35], f"spawn {lv['spawn']} and goal {lv['goal']}")

        print('[json] export, checkLevel in the page and in Node')
        key('Escape')
        page.wait_for_function("EW.builder.state().modal === 'menu'", timeout=5000)
        page.wait_for_timeout(400)
        shot_('builder-5-menu')
        exported = page.evaluate("document.querySelector('#builder .bd-json').value")
        check(exported == page.evaluate('EW.builder.exportText()'), 'the menu shows the export')
        key('Escape')
        check(page.evaluate('EW.builder.state().modal') is None, 'Esc closes the menu')
        path = os.path.join(args.shots, 'builder-level.json')
        open(path, 'w').write(exported)
        check(page.evaluate('!EW.builder.check().error'), 'checkLevel accepts it in the page')
        r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, path], capture_output=True, text=True, cwd=ROOT)
        try: res = json.loads(r.stdout.strip().splitlines()[-1])
        except Exception: res = {'ok': False, 'error': (r.stdout + r.stderr)[-500:]}
        check(res.get('ok'), f"checkLevel accepts it in Node ({res.get('error') or 'ok'})")
        check(res.get('canonical'), 'the export is canonical: checking it again changes nothing')
        check(page.evaluate('EW.sim.tick') == tick0, 'the world stayed paused while building')

        print('[play] P test-plays it')
        key('KeyP')
        page.wait_for_function("EW.world && /^lv-/.test(EW.world.id) && EW.world.built && !EW.traveling && EW.sim.tick > 20", timeout=30000)
        lid = page.evaluate('EW.world.id')
        check(not page.evaluate('EW.builder.active') and page.evaluate('EW.input.enabled'), f'in the level {lid}, with game input back on')
        check(page.evaluate('EW.localLevels[EW.world.id] && EW.localLevels[EW.world.id].builder') == 0, 'the level knows its draft')
        page.wait_for_timeout(800)
        shot_('builder-6-testplay')
        # a stick bot (input only, like a player): along the floor, up the ramp, over the pad, to the flag
        page.evaluate("""() => { const W = [[0, -11], [0, -19], [0, -35]]; window.__bb = { i: 0 };
          const loop = () => { const b = window.__bb; if (!b || b.i >= W.length || !EW.world || !/^lv-/.test(EW.world.id)) { EW.input.stick.x = EW.input.stick.y = 0; return; }
            const p = EW.player.pos, t = W[b.i], dx = t[0] - p.x, dz = t[1] - p.z;
            if (Math.hypot(dx, dz) < 1.0) b.i++;
            let a = Math.atan2(dx, dz) - EW.camRig.yaw; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
            EW.input.stick.x = -Math.sin(a); EW.input.stick.y = Math.cos(a); requestAnimationFrame(loop); };
          requestAnimationFrame(loop); }""")
        try:
            page.wait_for_function("EW.sim.claims.some((c) => c[1] === 'record' && c[2] === 'time')", timeout=90000)
            check(True, 'cleared: ' + page.evaluate("EW.sim.claims.find((c) => c[1] === 'record')[3].toFixed(2)") + ' s')
        except Exception:
            check(False, 'the bot cleared the level (at ' + json.dumps(page.evaluate('EW.debug.state().pos')) + ')')
        page.evaluate('window.__bb = null; EW.input.stick.x = EW.input.stick.y = 0')
        page.wait_for_timeout(1200)
        shot_('builder-7-cleared')

        print('[back] Esc, Enter: back to the Builder; the run waits')
        key('Escape')
        page.wait_for_function("EW.ui.panelOpen === 'menu' && document.activeElement && document.activeElement.textContent === 'Back to the Builder'", timeout=5000)
        key('Enter')
        page.wait_for_function('EW.builder.active', timeout=5000)
        t1 = page.evaluate('EW.sim.tick'); page.wait_for_timeout(1200)
        check(page.evaluate('EW.sim.tick') == t1, 'the level is paused while the Builder is open')
        check(page.evaluate('EW.builder.state().slot') == 0, 'it reopened the same draft')
        shot_('builder-8-back')
        key('Escape')
        page.wait_for_function("EW.builder.state().modal === 'menu'", timeout=5000)
        page.click("#builder .bd-card button:has-text('Exit the Builder')")
        page.wait_for_function('!EW.builder.active && EW.input.enabled', timeout=5000)

        print('[publish] leave the level; the Gate offers Publish')
        page.evaluate("EW.leaveTo('hub')")
        page.wait_for_function("EW.world.id === 'hub' && !EW.traveling && EW.runs.some((r) => /^lv-/.test(r.proof.world.id))", timeout=30000)
        proof = page.evaluate("EW.runs.find((r) => r.proof.world.id === '%s').proof" % lid)
        page.evaluate("EW.ui.openPanel('gate')")
        page.wait_for_timeout(600)
        ready = page.evaluate("""() => [...document.querySelectorAll('#panel .card.run')].some((c) => /cleared: ready to publish/.test(c.textContent) && [...c.querySelectorAll('button')].some((b) => b.textContent === 'Publish' && !b.disabled))""")
        check(ready, 'the Gate lists the level as cleared, with Publish enabled')
        shot_('builder-9-gate')
        L = page.evaluate("(() => { const L = EW.localLevels['%s']; return { sha: L.sha256, text: L.text }; })()" % lid)
        page.evaluate('EW.ui.closePanel()')
        ctx.close()

        print('[verify] the clear run, replayed in Node')
        tmp = tempfile.mkdtemp(prefix='ew-builder-')
        arch = os.path.join(tmp, 'worlds', 'by-hash'); os.makedirs(arch)
        for f in os.listdir(os.path.join(args.docs, 'worlds', 'by-hash')): shutil.copy(os.path.join(args.docs, 'worlds', 'by-hash', f), arch)
        open(os.path.join(arch, L['sha'] + '.js'), 'w', encoding='utf8').write(L['text'])
        ppath = os.path.join(args.shots, 'builder-clear-proof.json'); json.dump(proof, open(ppath, 'w'))
        r = subprocess.run(['node', os.path.join(ROOT, 'tools/verify.mjs'), '--docs', tmp, ppath], capture_output=True, text=True)
        print('  ' + r.stdout.strip().replace('\n', '\n  '))
        check(r.returncode == 0, 'the clear run verifies in Node')
        shutil.rmtree(tmp, ignore_errors=True)

def pieces(browser, port, args):
    ctx, page = open_page(browser, port)
    key = lambda k, n=1: [page.keyboard.press(k) for _ in range(n)]
    shot_ = lambda name: shot(page, args, name)
    lv = lambda: page.evaluate('EW.builder.level()')
    print('[pieces] every piece type by keys, in a new draft')
    page.evaluate('EW.builder.open()')
    page.wait_for_function('EW.builder.active', timeout=10000)
    key('Escape'); page.wait_for_function("EW.builder.state().modal === 'menu'", timeout=5000)
    page.click("#builder .bd-card button:has-text('New draft')")
    page.wait_for_function('EW.builder.state().slot === 1', timeout=5000)
    key('Escape')
    check(lv()['name'] == 'My Level 2' and page.evaluate('EW.builder.state().cursor') == [0, 0, 0], 'a new draft in slot 2, cursor at its start')
    key('KeyS', 3); key('KeyD', 8)                                  # off to the side of the starter floor
    key('Digit1'); key('KeyC', 2); key('KeyB'); key('Enter')       # box, recoloured, glowing
    key('KeyW', 6); key('Digit2'); key('Enter')                     # ramp
    key('KeyW', 6); key('Digit3'); key('Equal'); key('Enter')       # cylinder, one size bigger
    key('KeyW', 6); key('Digit4'); key('Minus'); key('Enter')       # sphere, one size smaller
    key('KeyW', 6); key('Digit5'); key('Shift+KeyW', 5); key('KeyQ', 2); key('Shift+KeyR', 3); key('Enter')  # pad: throw 5, aimed 210, power 20
    key('KeyW', 6); key('Digit6'); key('KeyQ', 6); key('Enter')     # boost pad, turned 90
    key('KeyW', 6); key('Digit7'); key('Enter')                     # checkpoint
    key('KeyW', 6); key('Digit8'); key('KeyC'); key('Enter')        # crumbling tile
    key('KeyW', 6); key('Digit9'); key('Enter')                     # moving platform: start...
    check(page.evaluate('EW.builder.state().pending'), 'the moving platform waits for its end point')
    key('KeyD', 6); key('KeyR', 2); key('Enter')                    # ...and its end point
    check(not page.evaluate('EW.builder.state().pending'), 'Enter set the end point')
    key('KeyA', 6); key('KeyF', 2)
    key('KeyW', 6); key('Digit0'); key('KeyQ'); key('Enter')        # hazard, turned 90 (its size swaps)
    key('KeyW', 6); key('Shift+Digit1'); key('Enter')               # sign: a dialog asks for its text
    page.wait_for_function("EW.builder.state().modal === 'text' && document.activeElement.tagName === 'INPUT'", timeout=5000)
    page.keyboard.press('Control+KeyA'); page.keyboard.type('WELCOME'); key('Enter')
    page.keyboard.press('Control+KeyA'); page.keyboard.type('Made with the Builder, by keyboard.'); key('Enter')
    page.wait_for_function("EW.builder.state().modal === null", timeout=5000)
    key('KeyW', 6); key('Shift+Digit4'); key('Enter')               # cone
    key('KeyW', 6); key('Shift+Digit5'); key('Enter')               # updraft
    key('KeyW', 6); key('Shift+Digit6'); key('Enter')               # label
    page.wait_for_function("EW.builder.state().modal === 'text' && document.activeElement.tagName === 'INPUT'", timeout=5000)
    page.keyboard.press('Control+KeyA'); page.keyboard.type('THE END'); key('Enter')
    page.wait_for_function("EW.builder.state().modal === null", timeout=5000)
    key('KeyW', 6); key('Shift+Digit1'); key('Enter'); page.wait_for_function("EW.builder.state().modal === 'text'", timeout=5000); key('Escape')
    check(page.evaluate('EW.builder.state().modal') is None, 'Esc cancels the sign dialog')
    L = lv()
    kinds = sorted(x['s'] for x in L['parts']), sorted(x['t'] for x in L['things'])
    check(kinds == (['box', 'box', 'cone', 'cyl', 'ramp', 'sphere'], ['boost', 'checkpoint', 'crumble', 'hazard', 'label', 'mover', 'pad', 'sign', 'wind']), f'every piece type placed ({kinds})')
    pad = next(x for x in L['things'] if x['t'] == 'pad'); mover = next(x for x in L['things'] if x['t'] == 'mover'); sign = next(x for x in L['things'] if x['t'] == 'sign')
    check(pad['power'] == 20 and pad.get('push') == [-2.5, -4.33], f'pad power 20, thrown 5 m/s toward 210 degrees ({pad})')
    check(mover['to'][0] - mover['p'][0] == 6 and mover['to'][1] - mover['p'][1] == 2, f"the moving platform travels 6 m across and 2 m up ({mover['p']} -> {mover['to']})")
    check(sign['title'] == 'WELCOME' and sign['text'] == 'Made with the Builder, by keyboard.', 'the sign has its text')
    box = L['parts'][1]
    check(box['c'] == '#3b3f63' and box.get('g') == 0.8, f"C recoloured and B lit the box ({box['c']}, glow {box.get('g')})")
    haz = next(x for x in L['things'] if x['t'] == 'hazard')
    check(haz['z'] == [1, 1, 4], f"Q turned the hazard 90 degrees ({haz['z']})")
    cyl = next(x for x in L['parts'] if x['s'] == 'cyl'); ball = next(x for x in L['parts'] if x['s'] == 'sphere')
    check(cyl['z'] == [4, 2, 4] and cyl['p'][1] == -1, f"+ made the cylinder 4 m across and 2 m tall, its top at the cursor ({cyl['z']}, centre y {cyl['p'][1]})")
    check(ball['z'] == [1, 1, 1] and ball['p'][1] == 0.5, f"- made the sphere 1 m across, resting on the cursor ({ball['z']}, centre y {ball['p'][1]})")
    check(not page.evaluate('EW.builder.check().error'), 'checkLevel accepts it')
    # copy the sphere under the cursor with X, then the grid and the view
    key('KeyS', 6 * 11)
    key('KeyX')
    st = page.evaluate('EW.builder.state()')
    check(st['piece'] == 'sphere' and st['brush']['size'] == [1, 1, 1], f"X copied the sphere under the cursor ({st['piece']}, {st['brush']['size']})")
    key('KeyG'); check(page.evaluate('EW.builder.state().grid') == 0.5, 'G halves the grid')
    key('KeyG', 2)
    key('KeyO', 4); key('KeyJ'); page.wait_for_timeout(1500)
    shot_('pieces-1-all')
    for theme in ['dusk', 'night', 'cave', 'candy']:
        key('Escape'); page.wait_for_function("EW.builder.state().modal === 'menu'", timeout=5000)
        page.select_option('#builder .bd-card select >> nth=0', theme)
        key('Escape'); page.wait_for_timeout(1300)
        shot_(f'pieces-2-{theme}')
    check(lv()['theme'] == 'candy', 'the theme picker sets the theme')
    print('[pieces] test-play it')
    key('KeyP')
    page.wait_for_function("EW.world && /^lv-/.test(EW.world.id) && EW.world.built && !EW.traveling && EW.sim.tick > 20", timeout=30000)
    page.wait_for_timeout(1500)
    check(page.evaluate('EW.world.statics.length') > 6, 'it builds and runs as a world')
    shot_('pieces-3-testplay')
    print('[import] levels/lantern-steps.json as a new draft')
    key('Escape'); page.wait_for_function("EW.ui.panelOpen === 'menu'", timeout=5000); key('Enter')
    page.wait_for_function('EW.builder.active', timeout=5000)
    key('Escape'); page.wait_for_function("EW.builder.state().modal === 'menu'", timeout=5000)
    page.fill("#builder .bd-card textarea[placeholder^='Paste']", open(os.path.join(ROOT, 'levels/lantern-steps.json')).read())
    page.click("#builder .bd-card button:has-text('Open as a new draft')")
    page.wait_for_function("EW.builder.level().name === 'Lantern Steps'", timeout=5000)
    src = json.load(open(os.path.join(ROOT, 'levels/lantern-steps.json')))
    L = lv()
    check(len(L['parts']) == len(src['parts']) and len(L['things']) == len(src['things']) and L['theme'] == 'dusk', 'Lantern Steps opens with every piece')
    exported = json.loads(page.evaluate('EW.builder.exportText()'))
    r = subprocess.run(['node', '--input-type=module', '-e', CHECK_JS, os.path.join(ROOT, 'levels/lantern-steps.json')], capture_output=True, text=True, cwd=ROOT)
    canon = json.loads(r.stdout.strip().splitlines()[-1])['level']
    check(all(json.dumps(exported[k]) == json.dumps(canon[k]) for k in ['name', 'blurb', 'theme', 'color', 'spawn', 'goal', 'parts', 'things']), 'and exports exactly its canonical form')
    drafts = page.evaluate("[...document.querySelectorAll('#builder .bd-slotrow')].length")
    check(drafts == 3, f'three drafts are listed ({drafts})')
    key('Escape'); page.wait_for_timeout(1500)
    shot_('pieces-4-lantern')
    ctx.close()

if __name__ == '__main__':
    main()
