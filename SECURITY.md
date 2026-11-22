# Security: what stops each attack

Elsewhere's promise is that what you earn is verifiably yours. This file lists the attacks against that promise, what stops each one, and the test that proves it. Every claim here is backed by a test that runs in CI or by hand, as listed below.

## Tests

| Test | What it checks | How to run |
|---|---|---|
| `tools/attack_test.mjs` | Real attacks against the real validator: forged, forked, copied, tampered and bombed proofs. Every one must fail and honest chains must pass. | `node tools/attack_test.mjs` (CI) |
| `tools/chain_test.py` | Continuity in a real browser (Chromium and WebKit), end to end, ending with the validator accepting what the browser made. | `python3 tools/chain_test.py --engine webkit` |
| `tools/mp_test.py` | Multiplayer, including an impersonation attempt. | `python3 tools/mp_test.py` |
| `tools/tamper_test.mjs`, golden proofs, `tools/battery.*` | Tampered proofs are rejected, and replays agree across engines. | CI |

## The attacks

| Attack | What stops it | Proof |
|---|---|---|
| **Start a run from a forged state.** Edit your browser storage for coins, sigils or items, then play a perfectly valid run from there. | **Continuity.** Every run names its player's previous run, and the validator keeps each player's verified state. A run is accepted only if it starts from exactly that state. The check happens before any replay. In the browser, every visit starts from the chain's state, so edits are undone. | attack_test "forged starting state"; chain_test "edited profile is undone" |
| **Fork your own history** (two different futures after one run). | One chain per key: the validator accepts only the next run after the head. | attack_test "fork" |
| **Mint coins through arcade results.** An arcade game runs outside the simulation, so its "3 stars" is whatever a browser says. | The engine refuses coins, items, records and flags while an arcade result is handled, and the hub no longer pays for arcade scores. (Found by the red-team review.) | attack_test "forged arcade results mint no coins" |
| **Replay an old version of a world that had a bug** (the archive keeps every version, so old proofs still verify). | `docs/worlds/history.json` lists each world's code versions. New runs must use the current version, or the previous one for 24 h after a change. Versions with a bug are revoked, with the reason. | attack_test "old, revoked hub code" |
| **Copy someone's run and front-run them** (re-sign it, backdate it). | Chained copies are accepted alongside the original, never instead of it: earnings are soulbound and a copy starts from the copier's own state. Refusing copies used to let a thief lock the real player out. | attack_test "front-runs" |
| **Re-encode a run to dodge the copy check.** | Input logs must be in canonical form. | attack_test "re-encoded" |
| **Edit claims, or the chain link, after signing.** | Ed25519 signature over everything, checked before anything else. | attack_test "edited after signing", tamper_test |
| **Submit unchained (old-format) runs.** | Refused after `CHAIN_START` (2026-11-22 08:00 UTC). Earlier runs stay as season-0 history. | attack_test "unchained" |
| **Decompression bombs** (a small gzip that inflates to gigabytes), for proofs and models. | Inflation is capped while streaming (`gunzipCapped`). 64 MB of zeros is refused after 4 MB. | attack_test "decompression bomb" |
| **Stall the validator:** floods of slow or huge proofs, a registry list repeated 256 times, pathological levels. | <ul><li>Cheap checks first (form, signature, chain, rules), replay last.</li><li>Registry entries must be unique, and pinned worlds load once.</li><li>Levels are capped (600 parts, 200 things).</li><li>A replay-time budget per run, and fair queuing: players with a verified chain first, at most 40 new keys per run.</li><li>The relay cursor never skips unprocessed events.</li></ul> | attack_test "registry", "budget" |
| **Rewrite the ledger's history** (an operator, or anyone with the repository). | <ul><li>Anyone can recompute the chain from the archived proofs (`node tools/ledger.mjs --rebuild`).</li><li>Every head is timestamped in Bitcoin with OpenTimestamps (`docs/ledger/anchors/`, three independent calendars). A rewrite would contradict them.</li></ul> | `ots verify docs/ledger/anchors/<seq>.txt.ots` |
| **Impersonate a player in a room.** | A hello carries the player's key and a signature over the room, the sender's connection id and the name. Name tags show the key's fingerprint. A copied hello fails. | mp_test "identity" |
| **Swap an uploaded model on a relay.** | A model is named by its SHA-256, and every copy is checked against it. A relay can lose a model but never change one. | blob store, by design |
| **Run code through a level.** | Levels are data compiled by one fixed template (string literal). Validators load only modules archived by hash. | red-team review (no path found) |
| **XSS to steal the key from local storage.** | No untrusted string reaches `innerHTML`, an attribute or a URL. Everything goes through `textContent` or is a validated colour. The arcade frame is sandboxed without same-origin. | red-team review (no sink found) |

## Open limits

- **Bots.** A proof shows that the inputs produced the result, not that a human made the inputs. Earnings are soulbound (nothing to sell), so bot farming gains only leaderboard places.
- **Identical-record copies.** A copier still ties an original record. A commit-reveal step for records would settle who was first.
- **One validator.** Season 0 runs one validator (a GitHub Action). It can censor or stall, but it cannot forge: anyone can recompute its decisions. Next is a federation of independent validators that countersign heads (G4).
- **Engine versions.** World code is pinned by hash, but the engine itself is not yet. A change to engine semantics must keep every archived proof replaying identically, and the golden proofs check that. Pinning engine versions by hash is the next step.
- **Relay retention.** Relays may drop old events. Models can then vanish (stand-ins show), and proofs must reach the validator within its window (a 7-hour look-back).
- **Lost keys.** True ownership means a lost key loses its chain. Passkeys and recovery phrases are planned (G4).
- **Peer-to-peer play shows your IP address** to the other players in your room.
