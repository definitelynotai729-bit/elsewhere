# Elsewhere: goals and work log

The owner gives direction and feedback; Claude builds, tests and ships on its own, and keeps this file current.
Read this first when resuming work.

## North star

A *Ready Player One*-style universe of worlds:
1. **Fun.** Every world is a game worth playing.
2. **Open.** New worlds, games and items can be added later, by anyone.
3. **Verifiably owned.** What you earn is provably yours, on a community-run proof-of-stake chain of its own (not Ethereum), with no developer–player feuds.

## How work runs

- **Cadence.** In each work cycle, take the top unfinished step below, build it, test it, ship it to the live site, then add a dated entry to the log.
  - Tests: `tools/proof_test.py`, `tools/battery.*`, `tools/smoke.py` and CI, as relevant.
  - Every gameplay change keeps proofs verifiable. Bump `SIM` in `src/engine/run.js` when gameplay code changes, and re-record the golden proofs.
- **Ask the owner only for** accounts, spending, irreversible or public-facing decisions they should own, and feedback on fun.
- **Fun beats features.** If playtest feedback arrives, it jumps the queue.

## Goals

### G1. Season-0 ledger of verified runs (target 2026-11-23)
Players can publish a run; an open validator replays it; accepted runs form a public, hash-chained ledger that anyone can recompute.
- [ ] Self-host the fonts, so Google drops out of the dependency list.
- [ ] Publish proofs to public Nostr relays from the game ("Submit to the ledger"). No account needed; the proof is already signed with the player's key.
- [ ] Validator `tools/ledger.mjs`:
  - fetches proof events from the relays;
  - replays each one;
  - applies the season rules (signed, current rules version, no duplicates, rate limits);
  - archives the accepted proofs;
  - appends them to `docs/ledger/ledger.json` as a hash chain.
- [ ] A scheduled GitHub Action runs the validator. Anyone can rebuild the same ledger from the relays with `node tools/ledger.mjs --rebuild`.
- [ ] In-game record boards: best verified times per world and recent verified runs. These are UI only; world code never reads the ledger.
- **Done when:** a run played on the live site is submitted from the game, accepted by the validator and shown on the board, and a tampered proof is rejected.

### G2. Continuity: a verified inventory (target 2026-11-25)
A run only counts if it starts from the player's last verified state. Its coins, items and flags must be what the ledger says they own, and equipped items must be owned. Items and coins then exist only because verified play produced them.
- [ ] Ledger keeps per-key state: owned items, coins, flags, world saves.
- [ ] Chained submission: the game queues every state-changing run and publishes them in order.
- [ ] "Verified" marks on items in the inventory.

### G3. Fun: a new game-world plus polish (target 2026-11-26)
- [ ] One new world that is a replayable score game (a `w.record` with `better: 'higher'`), proving games can be added later.
- [ ] Vault interior: give it real headroom; the dome collider is currently a 2.1 m ceiling.
- [ ] Phone pass: touch controls and performance on a mid-range phone profile.

### G4. Chain groundwork (target 2026-11-30)
A minimal proof-of-stake chain in Node:
- a staked validator set and proposer rotation;
- blocks that carry accepted proof ids, with 2/3 signatures for finality;
- a state root over the ledger state.

Demo: four local validators agree on the same ledger, and an invalid proof is refused by every one. That shows the work is checking play.

### Later
Open world publishing (author keys, a sandbox worker for third-party worlds), item trading with creator royalties, room sharding, validator-run relays.

## Open questions for the owner
- The final name ("Elsewhere" is a working title).
- The licence for the engine and for community worlds.

## Log

### 2026-11-21
- Pivoted from Siegeworks to Elsewhere (0.1): Junction hub, Skyreach, Glowcave, Neon Circuit. Cross-world items with per-world rules. P2P presence over Nostr and WebRTC. World modules pinned by hash. Live on GitHub Pages.
- Owner: "a much better start." Asked whether the work is still verifiable.
- 0.2, verified play:
  - Every visit is a signed, replayable proof of play.
  - Deterministic Math. One tick function shared by live play and replay. Dialog answers, purchases and equips are recorded as inputs.
  - Verifiers: the in-game panel (R), `verify.html`, and `tools/verify.mjs`.
  - 200 random runs replayed identically in V8, JavaScriptCore and SpiderMonkey. Browser-played laps, the shop and the Vault verify in Node. Every tampered proof is rejected.
  - The tests found that the Founder's Crown was unreachable; fixed.
- Owner asked about central servers. Answer: there is no game server. The outside dependencies are GitHub Pages (files), public Nostr relays (matchmaking), STUN (Google, Cloudflare) and Google Fonts.
- Owner: run with it, set goals and reminders, proceed independently; they will check in for feedback. Goals G1–G4 above.
