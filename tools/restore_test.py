#!/usr/bin/env python3
"""Restoring a backup on another device continues the verified chain (it never starts it over).

usage: python3 tools/restore_test.py [--engine chromium]

The site is a throwaway copy, and the real validator (tools/ledger.mjs) writes its ledger there, so the browsers
read the states it verified. Publishing is off (settings.verify = false): nothing leaves this machine.
1. Device A plays two visits; the validator accepts them.
2. Device B restores A's backup code: it continues from the ledger (same head, same verified coins and items),
   with no Season 0 mementos made from copies. B's next visit is accepted.
3. A is now behind the ledger: it notices, does not seal the visit it was in (it could only be refused), and its
   next trip continues from the verified state. Its next visit is accepted.
4. B is behind now: the "Continue from the ledger now" button re-enters the world from the verified state, and
   B's next visit is accepted.
5. Device C restores the code while the ledger cannot be reached: it starts provisionally (the copies are kept as
   provisional mementos), then catches up once the ledger answers, and the provisional mementos go.
6. The checker refuses one of device D's visits (here the world version it played is withdrawn; on 2026-11-25 a real
   one had run on an out-of-date game). Every later visit builds on it and could only be refused, so D notices the
   refusal, says so, drops the visit it is in, and its next trip continues from the verified state. Its next
   visit is accepted. (Before the fix, D went on sending visits the checker refused, and nothing was saved again.)
"""
import argparse, json, os, shutil, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shot import serve, PROFILE, ROOT
from proof_test import launch, walk_to
from playwright.sync_api import sync_playwright

fails = 0
def check(ok, what, detail=''):
    global fails
    print(('PASS  ' if ok else 'FAIL  ') + what + (' · ' + str(detail) if detail != '' else ''))
    if not ok: fails += 1

READY = 'window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim.tick > 10'

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--engine', default='chromium'); args = ap.parse_args()
    tmp = tempfile.mkdtemp(prefix='ew-restore-'); site = os.path.join(tmp, 'docs')
    shutil.copytree(os.path.join(ROOT, 'docs'), site)
    httpd, port = serve(site)
    url = f'http://127.0.0.1:{port}/'
    sent = set()
    def validate(page, label):
        """Hand this device's unsent proofs to the validator; return the ACCEPT/REJECT lines."""
        proofs = page.evaluate('EW.outbox')
        ids = page.evaluate('Promise.all(EW.outbox.map((p) => EW.proofId(p)))')
        files = []
        for pr, i in zip(proofs, ids):
            if i in sent: continue
            sent.add(i); f = os.path.join(tmp, f'{label}-{i[:12]}.json'); json.dump(pr, open(f, 'w')); files.append(f)
        page.evaluate('EW.outbox.length = 0')  # as if published (the validator has them now)
        if not files: return []
        res = subprocess.run(['node', os.path.join(ROOT, 'tools/ledger.mjs'), '--docs', site, '--file', *files], capture_output=True, text=True)
        lines = [l for l in res.stdout.split('\n') if l.startswith(('ACCEPT', 'REJECT', 'defer'))]
        if not lines or not all(l.startswith('ACCEPT') for l in lines): print('      validator:', (res.stdout + res.stderr)[-1500:])
        return lines
    ledger = lambda: json.load(open(os.path.join(site, 'ledger', 'states.json')))['keys']
    def go(page, w):
        page.evaluate(f"EW.travel('{w}')")
        page.wait_for_function(f"EW.world.id === '{w}' && !EW.traveling && EW.sim.tick > 30", timeout=60000)

    with sync_playwright() as p:
        b = launch(p, args.engine)
        errors = []
        def device(seed=True):
            ctx = b.new_context(viewport={'width': 960, 'height': 600})
            prof = json.loads(json.dumps(PROFILE))
            if seed: ctx.add_init_script("try { if (!localStorage.getItem('seeded')) { localStorage.setItem('seeded', '1'); localStorage.setItem('elsewhere_profile_v1', %s); } } catch (e) {}" % json.dumps(json.dumps(prof)))
            pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
            return ctx, pg

        # 1. device A: a new player, two visits, accepted
        ctxA, A = device()
        A.goto(url + '#hub'); A.wait_for_function(READY, timeout=90000)
        coins = A.evaluate("EW.world.coins.filter((c) => c.mesh.visible).map((c) => [c.mesh.position.x, c.mesh.position.z]).sort((a, b) => Math.hypot(a[0], a[1] - 30) - Math.hypot(b[0], b[1] - 30)).slice(0, 2)")
        for x, z in coins:
            try: walk_to(A, x, z, timeout=12, stop=0.5)
            except Exception: pass
        go(A, 'skyreach'); go(A, 'hub')
        acc = validate(A, 'A')
        keyA = A.evaluate('EW.profile.data.key.pub'); L = ledger().get(keyA)
        check(len(acc) == 2 and all(l.startswith('ACCEPT') for l in acc) and L and L['seq'] == 2, "device A's two visits are accepted", f"{L and L['state']['coins']} verified coins")
        code = A.evaluate('EW.profile.exportCode()')

        # 2. device B restores the backup code
        ctxB, B = device(seed=False)
        B.goto(url + '#hub'); B.wait_for_function(READY, timeout=90000)
        B.evaluate(f"EW.profile.importCode({json.dumps(code)})"); B.reload(); B.wait_for_function(READY, timeout=90000)
        r = B.evaluate('({ key: EW.profile.data.key.pub, seq: EW.chain.seq, head: EW.chain.head, coins: EW.profile.data.coins, inv: EW.profile.data.inv, legacy: EW.profile.data.legacy || null, entry: EW.run.entry.coins })')
        check(r['key'] == keyA and r['seq'] == 2 and r['head'] == L['head'] and r['coins'] == L['state']['coins'] == r['entry'] and r['inv'] == L['state']['inv'],
              'the restored device continues the chain from the ledger (same key, head and verified state)', f"seq {r['seq']}, {r['coins']} coins")
        check(r['legacy'] is None, 'and makes no Season 0 mementos out of copies of verified items', r['legacy'])
        go(B, 'skyreach'); go(B, 'glowcave')
        acc = validate(B, 'B'); L = ledger()[keyA]
        check(len(acc) == 2 and all(l.startswith('ACCEPT') for l in acc) and L['seq'] == 4, "the restored device's next visits are accepted", '; '.join(x[:60] for x in acc))

        # 3. device A is behind the ledger now
        behind = A.evaluate('EW.checkLedger()')
        seqA = A.evaluate('EW.chain.seq')
        go(A, 'rush')
        r = A.evaluate('({ seq: EW.chain.seq, head: EW.chain.head, out: EW.outbox.length, coins: EW.profile.data.coins, entry: EW.run.entry.coins })')
        check(behind and seqA == 2 and r['seq'] == 4 and r['head'] == L['head'] and r['out'] == 0 and r['coins'] == L['state']['coins'] == r['entry'],
              'the device left behind notices, drops the visit it was in, and continues from the ledger', f"chain {seqA} -> {r['seq']}, nothing sent from the stale chain")
        go(A, 'hub')
        acc = validate(A, 'A'); L = ledger()[keyA]
        check(len(acc) == 1 and acc[0].startswith('ACCEPT') and L['seq'] == 5, "and its next visit is accepted", acc)

        # 4. device B is behind: the records panel offers to continue now
        B.evaluate('EW.checkLedger()')
        B.evaluate("EW.ui.openPanel('records')")
        btn = B.locator("button:text-is('Continue from the ledger now')")
        btn.wait_for(timeout=15000); btn.click()
        B.wait_for_function("EW.chain.seq === 5 && !EW.traveling && EW.sim.tick > 30", timeout=60000)
        B.evaluate('EW.ui.closePanel()')
        go(B, 'skyreach')
        acc = validate(B, 'B'); L = ledger()[keyA]
        check(len(acc) == 1 and acc[0].startswith('ACCEPT') and L['seq'] == 6, 'the "Continue from the ledger now" button re-enters from the verified state, and the next visit is accepted', acc)

        # 5. device C restores while the ledger cannot be reached (A and B are done: close them)
        ctxA.close(); ctxB.close()
        ctxC, C = device(seed=False)
        C.goto(url + '#hub'); C.wait_for_function(READY, timeout=90000)
        C.route('**/ledger/states.json', lambda route: route.abort())
        C.evaluate(f"EW.profile.importCode({json.dumps(code)})"); C.reload(); C.wait_for_function(READY, timeout=90000)
        r = C.evaluate('({ seq: EW.chain.seq, legacy: EW.profile.data.legacy || null })')
        prov = r['seq'] == 0 and (r['legacy'] is None or r['legacy'].get('provisional') is True)
        C.unroute('**/ledger/states.json')
        ahead = C.evaluate('EW.checkLedger()')
        go(C, 'skyreach')
        r2 = C.evaluate('({ seq: EW.chain.seq, head: EW.chain.head, legacy: EW.profile.data.legacy || null, coins: EW.profile.data.coins })')
        check(prov and ahead and r2['seq'] == 6 and r2['head'] == L['head'] and r2['legacy'] is None and r2['coins'] == L['state']['coins'],
              'offline at restore: a provisional start, then it catches up and the provisional mementos go', f"seq 0 -> {r2['seq']}; mementos while offline: {r['legacy']}")

        # 6. a refused visit: device D (a player of its own; C is done)
        ctxC.close()
        ctxD, D = device()
        D.goto(url + '#hub'); D.wait_for_function(READY, timeout=90000)
        go(D, 'skyreach')  # seals visit 1 (Junction)
        acc = validate(D, 'D'); keyD = D.evaluate('EW.profile.data.key.pub'); LD = ledger()[keyD]
        go(D, 'glowcave')  # seals visit 2 (Skyreach), which the checker will refuse
        hist_file = os.path.join(site, 'worlds', 'history.json'); hist_text = open(hist_file).read()
        hist = json.loads(hist_text)
        for v in hist['worlds']['skyreach']:
            if v.get('until') is None: v['revoked'] = 'withdrawn for the test'
        json.dump(hist, open(hist_file, 'w'))
        refused = validate(D, 'D')
        open(hist_file, 'w').write(hist_text)
        go(D, 'hub')  # seals visit 3 (Glowcave), built on the refused one: the checker can only wait for visit 2
        waiting = validate(D, 'D')
        check(len(acc) == 1 and acc[0].startswith('ACCEPT') and LD['seq'] == 1 and len(refused) == 1 and refused[0].startswith('REJECT')
              and len(waiting) == 1 and waiting[0].startswith('defer'), "device D: visit 1 accepted, visit 2 refused, visit 3 waits for visit 2 (for ever)", '; '.join(x[:70] for x in acc + refused + waiting))
        # in the middle of a visit (something already happened in it): say so, and continue at the next trip
        D.evaluate("EW.sim.claims.push([EW.sim.tick, 'flag', 'test.something', true])")
        found = D.evaluate('EW.checkLedger()')
        cf = D.evaluate('EW.continueFrom && { why: EW.continueFrom.why, seq: EW.continueFrom.refused.seq, v: EW.continueFrom.v && EW.continueFrom.v.seq }')
        said = D.evaluate("[...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent).join(' | ')")
        check(found and cf == {'why': 'refused', 'seq': 2, 'v': 1} and 'could not be checked' in said and 'next trip' in said,
              'D notices that the checker refused visit 2, and says so', said[:160])
        D.evaluate("EW.ui.openPanel('records')")
        btn = D.locator("button:text-is('Continue from my saved progress now')")
        btn.wait_for(timeout=15000)
        line = D.evaluate("[...document.querySelectorAll('.vres.bad')].map((e) => e.textContent).join(' | ')")
        check('withdrawn for the test' in line and "can't be saved" in line, "the Leaderboards explain it, unfolded, with the checker's reason and a button", line[:200])
        D.evaluate('EW.ui.closePanel()')
        # at the start of a visit (the check soon after loading): continue from the verified state at once
        D.evaluate('EW.sim.claims.length = 0')
        found = D.evaluate('EW.checkLedger()')
        D.wait_for_function("EW.chain.seq === 1 && !EW.traveling && EW.world.id === 'hub' && EW.sim.tick > 30", timeout=60000)
        r = D.evaluate('({ seq: EW.chain.seq, head: EW.chain.head, out: EW.outbox.length, coins: EW.profile.data.coins, entry: EW.run.entry.coins, cf: EW.continueFrom })')
        said = D.evaluate("[...document.querySelectorAll('#toasts .toast')].map((t) => t.textContent).join(' | ')")
        check(found and r['seq'] == 1 and r['head'] == LD['head'] and r['out'] == 0 and r['coins'] == LD['state']['coins'] == r['entry'] and r['cf'] is None and 'saved again' in said,
              'a visit just begun re-enters from the verified state at once (nothing more sent from the dead chain)', f"chain at {r['seq']}, {r['coins']} coins")
        go(D, 'skyreach')  # seals the new Junction visit, built on visit 1
        acc = validate(D, 'D'); LD = ledger()[keyD]
        check(len(acc) == 1 and acc[0].startswith('ACCEPT') and LD['seq'] == 2, "and D's next visit is accepted: saving works again", acc)
        found = D.evaluate('EW.checkLedger()')
        check(found is False and D.evaluate('EW.continueFrom') is None, 'with the chain back in step, nothing more is flagged')

        check(not [e for e in errors if 'WebGL' not in e], 'no page errors', errors[:3])
        b.close()
    httpd.shutdown()
    shutil.rmtree(tmp, ignore_errors=True)
    print(f'{fails} FAILED' if fails else 'RESTORE OK')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
