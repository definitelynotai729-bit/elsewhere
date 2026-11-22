#!/usr/bin/env python3
"""Continuity, end to end in a real browser: what a player's browser does, and what the validator accepts.

usage: python3 tools/chain_test.py [--engine chromium]

1. An old player (coins and items, no chain yet) loads the game: that progress becomes Season 0 mementos and
   verified ownership starts at nothing.
2. Three visits (Junction, Skyreach, Junction): each one is sealed into the chain, in order, into the outbox.
3. The profile is edited behind the game's back (999 coins and the Vault sigils), then the page reloads:
   the next visit starts from the chain's state again, and the edit is gone.
4. The page closes in the middle of a visit: the next load seals that visit into the chain.
5. Every proof the browser made goes through the real validator (tools/ledger.mjs, in a throwaway copy of the
   site). All are accepted in order, and the ledger's verified state equals the browser's.
Publishing is switched off (settings.verify = false): nothing leaves this machine.
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

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--engine', default='chromium'); args = ap.parse_args()
    httpd, port = serve(os.path.join(ROOT, 'docs'))
    url = f'http://127.0.0.1:{port}/'
    old = json.loads(json.dumps(PROFILE)); old['coins'] = 57; old['inv'] = {'katana': 1, 'cap': 1}; old['eq'] = dict(old['eq'], hand='katana')
    with sync_playwright() as p:
        b = launch(p, args.engine)
        ctx = b.new_context(viewport={'width': 960, 'height': 600})
        # an existing player from before continuity: a profile, and no chain (written once, before the first load)
        ctx.add_init_script("try { if (!localStorage.getItem('seeded')) { localStorage.setItem('seeded', '1'); localStorage.setItem('elsewhere_profile_v1', %s); } } catch (e) {}" % json.dumps(json.dumps(old)))
        page = ctx.new_page()
        errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url + '#hub'); page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim.tick > 10', timeout=90000)
        d = page.evaluate('({ coins: EW.profile.data.coins, inv: EW.profile.data.inv, legacy: EW.profile.data.legacy, seq: EW.chain.seq })')
        check(d['coins'] == 0 and d['inv'] == {} and d['legacy'] and d['legacy']['coins'] == 57 and 'katana' in d['legacy']['inv'], 'unverified progress from before continuity becomes Season 0 mementos', d['legacy'])
        # visits: Junction (collect what is near), Skyreach, Junction
        coins = page.evaluate("EW.world.coins.filter((c) => c.mesh.visible).map((c) => [c.mesh.position.x, c.mesh.position.z]).sort((a, b) => Math.hypot(a[0], a[1] - 30) - Math.hypot(b[0], b[1] - 30)).slice(0, 2)")
        for x, z in coins:
            try: walk_to(page, x, z, timeout=12, stop=0.5)
            except Exception: pass
        got = page.evaluate('EW.profile.data.coins')
        for w in ['skyreach', 'hub']:
            page.evaluate(f"EW.leaveTo('{w}')")
            page.wait_for_function(f"EW.world.id === '{w}' && !EW.traveling && EW.sim.tick > 30", timeout=60000)
        c = page.evaluate('({ seq: EW.chain.seq, out: EW.outbox.length, links: EW.outbox.map((p) => [p.chain.seq, p.chain.prev, p.world.id]), coins: EW.profile.data.coins })')
        check(c['seq'] == 2 and c['out'] == 2 and c['links'][0][0] == 1 and c['links'][0][1] is None and c['links'][1][0] == 2, 'each finished visit is sealed into the chain, in order', c['links'])
        # edit the profile behind the game's back, then reload: the next visit starts from the chain's state
        page.evaluate("(() => { const d = JSON.parse(localStorage.getItem('elsewhere_profile_v1')); d.coins = 999; d.inv['sigil-sky'] = 1; d.inv['sigil-deep'] = 1; d.inv['sigil-speed'] = 1; localStorage.setItem('elsewhere_profile_v1', JSON.stringify(d)); })()")
        page.reload(); page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim.tick > 10', timeout=90000)
        r = page.evaluate("({ coins: EW.profile.data.coins, sigils: Object.keys(EW.profile.data.inv).filter((k) => k.startsWith('sigil')), entryCoins: EW.run.entry.coins, want: EW.chain.state.coins })")
        check(r['coins'] == r['want'] == r['entryCoins'] and not r['sigils'], 'an edited profile is undone at the next visit (the run starts from the verified state)', r)
        # close the page mid-visit: the next load seals that visit
        walk_to(page, 0, 20, timeout=10, stop=1)
        page.wait_for_timeout(6000)  # the open visit is snapshotted every 5 s (not every browser runs pagehide on close)
        seq0 = page.evaluate('EW.chain.seq')
        page.close(run_before_unload=True)
        page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url + '#hub'); page.wait_for_function('window.EW && EW.world && EW.world.built && !EW.traveling && EW.sim.tick > 10', timeout=90000)
        seq1 = page.evaluate('EW.chain.seq')
        check(seq1 == seq0 + 1, 'a visit left open when the page closed is sealed on the next load', f'chain {seq0} -> {seq1}')
        # one more visit, then hand every proof to the real validator
        page.evaluate("EW.leaveTo('skyreach')"); page.wait_for_function("EW.world.id === 'skyreach' && !EW.traveling && EW.sim.tick > 30", timeout=60000)
        proofs = page.evaluate('EW.outbox'); mine = page.evaluate('({ key: EW.profile.data.key.pub, state: EW.chain.state, seq: EW.chain.seq, head: EW.chain.head })')
        ids = page.evaluate('Promise.all(EW.outbox.map((p) => EW.proofId(p)))')
        print('      links:', [(pr['chain']['seq'], (pr['chain']['prev'] or '-')[:8], i[:8], pr['world']['id']) for pr, i in zip(proofs, ids)])
        tmp = tempfile.mkdtemp(prefix='ew-chain-'); site = os.path.join(tmp, 'docs'); shutil.copytree(os.path.join(ROOT, 'docs'), site)
        files = []
        for i, pr in enumerate(proofs):
            f = os.path.join(tmp, f'p{i}.json'); json.dump(pr, open(f, 'w')); files.append(f)
        out = subprocess.run(['node', os.path.join(ROOT, 'tools/ledger.mjs'), '--docs', site, '--file', *files], capture_output=True, text=True).stdout
        acc = [l for l in out.split('\n') if l.startswith('ACCEPT')]
        check(len(acc) == len(proofs) == mine['seq'], f'the validator accepts every visit the browser chained ({len(proofs)})', '\n      '.join(l for l in out.split('\n') if l.startswith(('ACCEPT', 'REJECT', 'defer'))))
        st = json.load(open(os.path.join(site, 'ledger/states.json')))['keys'].get(mine['key'])
        same = st and st['seq'] == mine['seq'] and st['head'] == mine['head'] and json.dumps(st['state'], sort_keys=True) == json.dumps(mine['state'], sort_keys=True)
        check(same, "the ledger's verified state equals the browser's chain state", st and f"seq {st['seq']}, {st['state']['coins']} coins")
        check(not [e for e in errors if 'WebGL' not in e], 'no page errors', errors[:3])
        b.close()
    httpd.shutdown()
    print(f'{fails} FAILED' if fails else 'CONTINUITY OK')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
