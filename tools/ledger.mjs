// Season-0 validator: fetch proofs of play from Nostr relays, replay each one, and append the accepted
// runs to the ledger (docs/ledger/). Anyone can run it; given the same proofs it reaches the same ledger.
//
//   node tools/ledger.mjs                  fetch new runs from the relays, validate, update docs/ledger/
//   node tools/ledger.mjs --file a.json …  validate local proof files instead (testing; meta comes from the file)
//   node tools/ledger.mjs --rebuild        recompute every entry from docs/ledger/proofs and compare the heads
//   --dry                                  report only, write nothing
//
// Proof content from relays is untrusted: it is size-limited, parsed as JSON and replayed. The only code
// that runs is world code pinned by SHA-256 in docs/worlds/by-hash.
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { replayRun } from '../src/engine/headless.js';
import { canon } from '../src/engine/run.js';
import { query, RUN_KIND, RUN_TAG, RELAYS } from '../src/engine/nostr.js';
import { genesis, verifyChain, append, admitRule, entryOf, boardsOf, worldsOf, admitWorld, unpackProof, proofIdOf, runDigest, PUBLISH_TAG } from '../src/engine/ledger.js';
import { checkLevel, compileLevel } from '../src/engine/level.js';
import { createBlobs } from '../src/engine/blobs.js';
import { decodeMesh } from '../src/engine/mesh.js';
const blobs = createBlobs({ noCache: true }); // models are only checked here, never stored by the validator

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const DRY = flag('--dry'), REBUILD = flag('--rebuild'), FILES = flag('--file');
const docs = opt('--docs', join(root, 'docs')), LD = join(docs, 'ledger');
const MAX_EVENTS = 300; // per run of the validator, so a flood of junk cannot stall it

const sha = (t) => createHash('sha256').update(t).digest('hex');
let nonce = 0;
async function loadModule(r) {
  const file = join(docs, 'worlds/by-hash', r.sha256 + '.js');
  if (!existsSync(file)) throw new Error(`no module ${r.sha256.slice(0, 12)}… (world "${r.id}") in the archive`);
  const text = readFileSync(file, 'utf8');
  if (sha(text) !== r.sha256) throw new Error('archived module does not match its hash');
  return (await import('data:text/javascript;base64,' + Buffer.from(text + `\n// visit ${nonce++}\n`).toString('base64'))).default;
}
const readJson = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { return d; } };
const names = Object.fromEntries((readJson(join(docs, 'worlds/registry.json'), { worlds: [] }).worlds || []).map((w) => [w.id, w.name]));

// validate one proof against the ledger; returns { entry } or { reason }
async function judge(ledger, proof, meta) {
  if (!proof || typeof proof !== 'object') return { reason: 'not a proof' };
  if (!proof.player || !proof.player.key || !proof.sig) return { reason: 'unsigned: proofs must be signed by the player\'s key' };
  const r = await replayRun(proof, { loadModule });
  if (!r.ok) return { reason: 'replay failed: ' + r.reason };
  if (r.sigStatus !== 'valid') return { reason: 'signature ' + r.sigStatus };
  meta.run = await runDigest(proof);
  meta.entryHash = sha(canon(proof.entry));
  const why = admitRule(ledger, proof, meta);
  if (why) return { reason: why };
  return { entry: entryOf(proof, meta, r) };
}

// a published level: check and compile it, then judge its creator's clear run on the compiled module
async function judgeWorld(ledger, raw, proof, meta) {
  const c = checkLevel(raw);
  if (c.error) return { reason: 'level: ' + c.error };
  const m = await compileLevel(c.level);
  if (!proof || !proof.world) return { reason: 'no clear run' };
  // models (format 3): each must be on the relays and be a valid model when the level is admitted. A rebuild
  // skips this: it recomputes the ledger from the archive alone, and relays may have dropped old data since.
  if (!REBUILD) for (const h of [...new Set(c.level.parts.filter((p) => p.s === 'mesh').map((p) => p.h))]) {
    const bytes = await blobs.fetch(h);
    if (!bytes) return { reason: `model ${h.slice(0, 10)} is not on the relays` };
    try { decodeMesh(bytes); } catch (e) { return { reason: `model ${h.slice(0, 10)}: ${e.message}` }; }
  }
  if (proof.world.id !== m.id || proof.world.sha256 !== m.sha256) return { reason: 'the clear run was not played on this level' };
  const file = join(docs, 'worlds/by-hash', m.sha256 + '.js'), had = existsSync(file);
  if (!had) writeFileSync(file, m.text); // the replay loads the module by its hash
  const j = await judge(ledger, proof, meta);
  const why = j.entry ? admitWorld(ledger, c.level, proof, m, meta) : null;
  if (!j.entry || why) { if (!had) try { unlinkSync(file); } catch (e) {} return { reason: j.reason || why }; }
  // format 2 levels give a reward item: record its id (the level id + '-r') and name with the world
  const reward = c.level.reward ? { reward: { id: m.id + '-r', name: c.level.reward.name, slot: c.level.reward.slot } } : {};
  return { entry: Object.assign({ kind: 'world' }, j.entry, { levelName: c.level.name, blurb: c.level.blurb, color: c.level.color, theme: c.level.theme }, reward), level: c.level };
}

function save(ledger, rejected, seen) {
  if (DRY) return;
  mkdirSync(join(LD, 'proofs'), { recursive: true });
  writeFileSync(join(LD, 'ledger.json'), JSON.stringify(ledger, null, 1));
  writeFileSync(join(LD, 'boards.json'), JSON.stringify(boardsOf(ledger, Object.assign({}, names, Object.fromEntries(ledger.entries.filter((e) => e.kind === 'world').map((e) => [e.world, e.levelName]))))));
  writeFileSync(join(LD, 'worlds.json'), JSON.stringify(worldsOf(ledger), null, 1));
  writeFileSync(join(LD, 'rejected.json'), JSON.stringify({ note: 'Recent submissions the validator refused, and why.', list: rejected.slice(-300) }, null, 1));
  writeFileSync(join(LD, 'seen.json'), JSON.stringify(seen.slice(-20000)));
}

async function main() {
  let ledger = readJson(join(LD, 'ledger.json'), null) || genesis();
  const broken = await verifyChain(ledger);
  if (broken) throw new Error('the ledger on disk does not verify (' + broken + '); refusing to touch it');
  const rejected = readJson(join(LD, 'rejected.json'), { list: [] }).list;
  const seen = readJson(join(LD, 'seen.json'), []);
  const seenSet = new Set(seen);

  if (REBUILD) {
    const fresh = genesis();
    for (const e of ledger.entries) {
      const proof = readJson(join(LD, 'proofs', e.id + '.json'), null);
      if (!proof) throw new Error(`entry #${e.seq}: archived proof ${e.id} is missing`);
      const meta = { id: await proofIdOf(proof), event: e.event, at: e.at };
      if (meta.id !== e.id) throw new Error(`entry #${e.seq}: the archived proof's id is ${meta.id}, not ${e.id}`);
      const j = e.kind === 'world' ? await judgeWorld(fresh, readJson(join(LD, 'levels', e.world + '.json'), null), proof, meta) : await judge(fresh, proof, meta);
      if (!j.entry) throw new Error(`entry #${e.seq} no longer validates: ${j.reason}`);
      await append(fresh, j.entry);
      if (fresh.head !== e.head) throw new Error(`entry #${e.seq}: rebuilt head ${fresh.head.slice(0, 12)} differs from ${e.head.slice(0, 12)}`);
    }
    console.log(`rebuilt ${fresh.seq} entries from the archived proofs; every head matches (${fresh.head.slice(0, 16)}…)`);
    return;
  }

  // candidates: [{ proof, meta: { id, event, at } }] or [{ reason, meta }] for unreadable ones
  const cands = [];
  if (FILES) {
    for (const f of argv) { const x = readJson(f, null); const meta = { event: 'file:' + f.split('/').pop(), at: Math.floor(Date.now() / 1000) }; cands.push(x && x.level ? { proof: x.proof, level: x.level, publish: true, meta } : { proof: x, meta }); }
  } else {
    const since = Math.max(0, (ledger.cursor || 0) - 3 * 3600);
    const q = await query({ kinds: [RUN_KIND], '#t': [RUN_TAG, PUBLISH_TAG], since, limit: 500 }, RELAYS, 15000);
    console.log('relays:', q.relays.map((r) => `${r.relay.replace('wss://', '')} ${r.error ? '(' + r.error + ')' : r.n}`).join(', '));
    const events = q.events.filter((e) => !seenSet.has(e.id)).sort((a, b) => a.created_at - b.created_at || (a.id < b.id ? -1 : 1)).slice(0, MAX_EVENTS);
    for (const ev of events) {
      const meta = { event: ev.id, at: ev.created_at };
      const pub = ev.tags.some((t) => t[0] === 't' && t[1] === PUBLISH_TAG);
      try { const x = await unpackProof(ev.content); cands.push(pub ? { proof: x && x.proof, level: x && x.level, publish: true, meta } : { proof: x, meta }); } catch (e) { cands.push({ reason: 'unreadable content: ' + e.message, meta }); }
      ledger.cursor = Math.max(ledger.cursor || 0, ev.created_at);
    }
  }
  let added = 0;
  for (const c of cands) {
    const meta = c.meta;
    let res = c.reason ? { reason: c.reason } : null;
    if (!res) {
      try { meta.id = await proofIdOf(c.proof); } catch (e) { res = { reason: 'not a proof' }; }
    }
    if (!res && ledger.entries.some((e) => e.id === meta.id)) res = { skip: 'already in the ledger' };
    if (!res) res = c.publish ? await judgeWorld(ledger, c.level, c.proof, meta) : await judge(ledger, c.proof, meta);
    if (res.entry) {
      await append(ledger, res.entry); added++;
      if (!DRY) {
        mkdirSync(join(LD, 'proofs'), { recursive: true }); writeFileSync(join(LD, 'proofs', meta.id + '.json'), JSON.stringify(c.proof));
        if (res.level) { mkdirSync(join(LD, 'levels'), { recursive: true }); writeFileSync(join(LD, 'levels', res.entry.world + '.json'), JSON.stringify(res.level)); }
      } else if (res.entry.kind === 'world') { try { unlinkSync(join(docs, 'worlds/by-hash', res.entry.worldSha + '.js')); } catch (e) {} }
      const e = res.entry;
      console.log(`ACCEPT #${e.seq} ${e.id} ${e.name} · ${e.kind === 'world' ? 'NEW WORLD "' + e.levelName + '" ' : ''}${e.world} · ${e.records.map((r) => `${r.key} ${r.value.toFixed(2)}`).join(', ') || 'no record'} · ${e.items.join(', ') || 'no items'}`);
    } else if (res.reason) {
      rejected.push({ event: meta.event, id: meta.id || null, reason: res.reason, at: meta.at });
      console.log(`REJECT ${meta.id || meta.event}: ${res.reason}`);
    } else console.log(`skip   ${meta.id}: ${res.skip}`);
    if (meta.event && !String(meta.event).startsWith('file:')) seen.push(meta.event);
  }
  save(ledger, rejected, seen);
  console.log(`${added} accepted; ledger has ${ledger.seq} entries, head ${ledger.head.slice(0, 16)}…${DRY ? ' (dry run: nothing written)' : ''}`);
}

main().then(() => { process.exitCode = 0; }, (e) => { console.error('validator error:', e.message); process.exitCode = 1; });
