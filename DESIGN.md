# Elsewhere: design notes

## The goal

Build a shared virtual universe in the spirit of *Ready Player One*. New worlds, games and items can be added at any time by anyone. What players earn and own is recorded on a community-run chain, so no single developer can take it away or rewrite the rules.

It has to be **fun first**. Past metaverse projects mostly failed because they were empty land sales with nothing to do. Here, every world is a game, and the chain only records things that actually happened in play.

## Architecture today (0.3)

```
registry.json ── pins every world module by SHA-256 (becomes ledger state)
     │
engine ── renderer (three.js) · physics (Rapier, deterministic build) · player/camera
     │    · items + traits · UI · P2P presence (Nostr discovery, WebRTC)
     │
world module (one file) ── build(w): geometry, rules, items, gameplay, all via the World API
```

- **Worlds are modules.** A world only touches the engine through `w`, so the same code can later run sandboxed (in a worker with the same API) when worlds come from strangers.
- **Items are data, traits are behaviour.** An item is `{ name, slot, traits, look }`, where the look is data too. The engine implements universal traits: glide, double jump, light, board, speed, cosmetic and key. Each world's `rules` switch traits on or off locally. So items can be minted once and stay meaningful in worlds that didn't exist when they were made. Nobody can nerf your item everywhere; a world can only decide what works inside itself.
- **Verified play (proof of play).** Every visit to a world is recorded as a proof: the player's quantised input for each 1/60 s tick, plus the few decisions made outside the controls (dialog answers, purchases, equips, arcade results), each stamped with its tick. Replaying a proof with the world module it pins must reproduce the same claims (items, coins, records, the exit) and the same final state hash, bit for bit. Proofs are signed with the player's Ed25519 key.
  - Live play and replay run the same code. `core.js` holds the one tick function, and the renderer, sound and UI are presentation only.
  - Everything that affects the game is deterministic across browsers: Rapier's deterministic build, fixed-step ticks, `detmath.js` (fdlibm ports replacing the browser's own sin, cos, exp and the other transcendental functions), tick-based timers (`w.after`, `w.wait`), and sign colliders sized by character counts rather than font metrics. Async world code (`await w.say(...)`) resumes at the same point in live play and in a replay.
  - The build rejects world code that reads the clock, uses `Math.random`, timers or browser APIs.
  - Evidence (0.2):
    - 200 random-input runs (235,003 ticks, with dialogs, purchases and equips across all four worlds) were recorded in Node (V8). They replay identically in Chromium (V8), WebKit (JavaScriptCore) and Firefox (SpiderMonkey).
    - Runs played in WebKit and Chromium, including full race laps, verify in Node.
    - Every tampered copy is rejected, down to one stick value nudged by 1/127 on one tick.
  - Verify anywhere: the in-game panel (R), `verify.html` (no WebGL needed), or `node tools/verify.mjs`.
- **A public ledger of verified runs (season 0).** A player can publish a run to public Nostr relays.
  - The run travels as a NIP-78 app-data event, gzipped. It is signed with a fresh throwaway key; the proof inside is signed with the player's own key.
  - The validator (`tools/ledger.mjs`, run every 30 minutes by a GitHub Action, and runnable by anyone) fetches new runs and replays each one with the pinned world code. Season rules: signed, current rules version, something to record, no copies of another player's run, a daily limit.
  - Accepted runs are appended to `docs/ledger/ledger.json`, a hash chain, and their proofs are archived next to it. `--rebuild` recomputes every head from the archive, and CI checks that on every push.
  - The game shows verified record boards as UI only; world code never reads the ledger, so worlds stay deterministic.
- **No game server.** Nothing central runs gameplay or stores accounts. Outside services:
  - GitHub Pages serves the files.
  - Public Nostr relays handle matchmaking and carry published runs.
  - STUN servers (Google, Cloudflare) help direct connections.
  - GitHub Actions runs CI and the season-0 validator.

  Browsers talk directly over WebRTC, in rooms per world. Mesh rooms stop scaling at about 20 people; sharding comes next.

## Roadmap

1. **Fun pass (now).** Real players in the hub and three worlds. Collect feedback, fix what bores people, and add worlds quickly.
2. **Identity and verified achievements.**
   - Done in 0.2: each player has an Ed25519 key pair, kept with the profile like a wallet. Every visit becomes a signed proof, and verifiers exist in the game, on a web page and in Node.
   - Done in 0.3: the season-0 ledger of verified runs (see above).
   - Next: continuity. A run's starting state must equal the player's previous verified end state, so items and coins can only come from verified play.
3. **Ownership.** Items earned through verified achievements become ledger records: owner key, item id, provenance (which world, which run). They can be traded peer to peer, and the creator's royalty is enforced by the protocol rather than a company.
4. **Open publishing.** Anyone submits a world: module hash, author key and a small bond. Curation and moderation are decided by stakers, not a single owner. Third-party worlds run sandboxed.
5. **The chain.** A sovereign proof-of-stake chain (not Ethereum). Its state holds accounts, item records, the world registry and verified results. Validators stake, and their work includes re-running submitted replays. That is the original "the game is the work" idea in a form that holds up: the work is checking play, not solving puzzles a bot could grind.
6. **Scale.** Room sharding, then relays run by validators for crowded worlds. Voice is optional, and so are creator tools inside the game.

## Open questions

- **Bots.** A proof shows that a run is legal under the rules. It cannot show that a person was holding the controller, and a deterministic game can be solved by a bot (the test autopilot laps Neon Circuit in 33 s). Rewards should favour prestige and cosmetics over money, and be rate-limited per identity.
- **Name.** "Elsewhere" is a working title.
- **Licence.** The licence for the engine and for community worlds is still to be decided. It matters for contributors.
