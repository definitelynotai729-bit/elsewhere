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
- [x] Self-host the fonts, so Google drops out of the dependency list.
- [x] Publish proofs to public Nostr relays from the game ("Submit to the ledger"). No account needed; the proof is already signed with the player's key.
- [x] Validator `tools/ledger.mjs`:
  - fetches proof events from the relays;
  - replays each one;
  - applies the season rules (signed, current rules version, no duplicates, rate limits);
  - archives the accepted proofs;
  - appends them to `docs/ledger/ledger.json` as a hash chain.
- [x] A scheduled GitHub Action runs the validator. Anyone can rebuild the same ledger from the relays with `node tools/ledger.mjs --rebuild`.
- [x] In-game record boards: best verified times per world and recent verified runs. These are UI only; world code never reads the ledger.
- **Done when:** a run played on the live site is submitted from the game, accepted by the validator and shown on the board, and a tampered proof is rejected. **Done 2026-11-21:**
  - Ledger entry #1 is a run played in the browser (a local build of the same code) and submitted with the game's button.
  - The GitHub Action fetched it from the relays and accepted it.
  - A tampered copy was refused, with the reason published.

### G5. Creator content on the ledger (priority: next, owner asked 2026-11-21)
Anyone can make worlds and items and put them on the ledger, without a developer's permission.
- [x] **Level format** (`elsewhere-level/1`): a world as data, made of parts, things (coins, pads, boosts, checkpoints, crumbles, movers, hazards, wind, signs) and a goal flag. (Coins are left out for now, so community levels cannot print currency.)
  - One fixed engine template compiles any level into a world module, so levels can never run their own code.
  - The compiled module's hash is the level's identity.
- [x] **Publishing:** the creator publishes the level together with a verified run of themselves beating it (the clear check).
  - The validator checks the schema and limits, compiles the level, and replays the clear run.
  - It appends the level to the ledger and archives the module by hash.
  - `docs/ledger/worlds.json` lists the community worlds.
- [x] **Creator's Gate:** in Junction, a panel lists community worlds and lets players travel to them. Their runs are verifiable and rank on the boards. Until the Builder exists, creators paste level JSON there.
- [ ] **Custom 3D models (next; owner asked "what about custom .sdl", read as .stl):**
  - Upload .stl or .glb at the Gate.
  - It is converted to a canonical compact mesh (quantised positions, indices, optional vertex colours); the hash of that is its id.
  - A level places it as a `mesh` part (visual; an optional convex-hull collider computed from the canonical points).
  - Limits: about 20k triangles and 300 KB.
  - Transport: the model travels with the level in chunked relay events; the validator verifies the hash and size, then archives it in `docs/assets/by-hash/`.
  - It needs the content rules plus report/hide. If the owner meant something else (SDF sculpting? SDL games?), switch.
- [ ] **The Builder:** an in-game creative mode where you place parts and things on a grid, test-play, and publish (with the clear run).
- [ ] **Creator items:** a level can award its own cosmetic item, tied to the creator's key and the level (provenance). Community items are cosmetic only.
- [ ] **Later:**
  - Uploaded models, textures and sounds, pinned by hash, visual only and size-limited.
  - Sandboxed code worlds.
  - Curation by stakers and by curators each player chooses, instead of a developer veto.
- **Owner decisions** (drafted defaults below):
  - Content rules. Proposed: no illegal content, no sexual content, no hate or harassment, no impersonation, no spam. Enforced by validator filters now and by curation later.
  - Creator licence. Proposed: creators keep ownership and grant everyone a licence to play, display and remix inside Elsewhere.

### G2. Continuity: a verified inventory (target 2026-11-25)
A run only counts if it starts from the player's last verified state. Its coins, items and flags must be what the ledger says they own, and equipped items must be owned. Items and coins then exist only because verified play produced them.
- [ ] Ledger keeps per-key state: owned items, coins, flags, world saves.
- [ ] Chained submission: the game queues every state-changing run and publishes them in order.
- [ ] "Verified" marks on items in the inventory.

### G3. Fun: a new game-world plus polish (target 2026-11-26)
- [x] One new world that is a replayable score game (a `w.record` with `better: 'higher'`), proving games can be added later. Shipped as **Crystal Rush** on 2026-11-21.
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
- G1 done (0.3):
  - Fonts are self-hosted.
  - Runs publish to Nostr relays as NIP-78 events, gzipped, under a throwaway key. The validator `tools/ledger.mjs` and the ledger workflow (every 30 min) are live. `--rebuild` runs in CI.
  - In-game boards, recent verified runs, and a Hall of Records terminal in Junction.
  - Relay notes:
    - nos.lol, relay.primal.net, relay.nostr.net and nostr.mom store and return the events.
    - offchain.pub and nostr.bitcoiner.social refuse keys outside their web of trust.
    - relay.damus.io is flaky.
    - Events over ~48 KB are refused by most relays; gzip keeps runs at 1–10 KB.
  - Validator commits use the Actions token, so they do not trigger CI (GitHub blocks recursive runs). Pages still deploys them.
- G3a done: **Crystal Rush** (`src/worlds/rush.js`), a 90-second score attack.
  - Layout: ramps, corner decks, shuttles, a tower with four jump pads, and a ring of crumbling stones.
  - Crystal order: three crystals at a time, following a seeded tier pattern (ground first, so a new player's first targets are easy). Everyone gets the same sequence.
  - Records: `w.record('crystals', n, { better: 'higher' })`.
  - Rewards: Rush Visor at 12, Prism Cape at 35 (cosmetics, for prestige), and coins up to 15 a round.
  - Portal in Junction to the west. Wren mentions it.
  - The keys-only test bot (`tools/rush_bot.js`) scores 28–30, so 35 for the cape stays prestigious.
  - The bot exposed a design flaw: the first three crystals were all high up. Fixed with the tier pattern.
  - 60 random runs across five worlds were identical in V8, JavaScriptCore and SpiderMonkey. Bot rounds recorded in Chromium and WebKit verify in Node.
- Next: G2 (continuity / verified inventory), then the G3 polish (Vault headroom, phone pass), then G4.
- Owner asked about graphics and content others can put on the chain. New goal **G5** (creator content), ahead of G2:
  - Data-only levels compiled by one fixed template (no third-party code).
  - Publishing requires the creator's own verified clear run.
  - Community worlds appear at the Creator's Gate, and levels can award cosmetic items with provenance.
  - Uploaded assets and code worlds come later, after sandboxing and curation.
- G5 steps 1–3 done:
  - `src/engine/level.js`:
    - `checkLevel()` canonicalises any input or refuses it.
    - `compileLevel()` pastes the canonical data, as a JSON string literal, into ONE template string (never function source, so minifying the engine cannot change it).
    - Replacements use a function, because `$&` in level text would otherwise corrupt the module.
  - An injection test confirms that quotes, backticks, `$&` and U+2028 in level text stay data.
  - Validator: publish events (tag `elsewhere-publish`) are judged by `judgeWorld`: compile, check the clear run was played on that exact module, replay it, then apply the world rules (author key = signer, clear record, 5 per creator per day). Accepted levels are archived in `docs/ledger/levels/` and `docs/worlds/by-hash/`. `worlds.json` lists them.
  - Travelling to a community level from Junction is a recorded action. The rule for ending a run therefore depends only on the id's form, because a replay knows fewer worlds than live play.
  - Sample level `levels/lantern-steps.json`, cleared by `tools/level_bot.js` in about 15–18 s and published from the game. The dry-run validator accepts it from the relays.
- Live: the GitHub validator accepted **Lantern Steps** as ledger entry #2, the first community world.
  - The ledger workflow now also commits accepted level modules (`docs/worlds/by-hash`); it missed them at first.
  - On the live site, the Creator's Gate lists the level, travel loads it from the public archive, and a WebKit clear run verifies in Node.
  - The clear run is a golden CI proof (`tests/proofs/lantern-clear.json`).
- Next for G5: the in-game **Builder** (place parts and things on a grid, test-play, clear, publish), then creator cosmetic items with provenance.
- Owner: "What about custom .sdl". Read as .stl (3D model files). Custom models are queued as the next G5 step, ahead of the Builder; the interpretation is flagged to the owner.
- Owner: "fix the camera control… arrows control camera… no mouse right now".
  - WASD moves; the arrow keys turn and tilt the camera: a tap nudges about 4.5°, holding turns about 2 rad/s after a short ramp.
  - Mouse look is off by default, with a menu toggle; clicks no longer capture the mouse.
  - Tested in Chromium and WebKit: arrows don't move the player, W walks exactly where the camera faces, and mouse drags do nothing.
  - The hint bar, the About keys and the Junction welcome sign are updated. Proof and smoke regressions pass.
- Owner asked if multiplayer works. A live two-browser test after the camera change: the test browsers met in 3.8 s, and positions and chat came through. They also met two real players already in Junction ("Wanderer" near Wren, and "Dve").
  - Works: presence and chat.
  - Not yet: shared gameplay (races against others, co-op, shared physics objects); a relay server for players behind strict networks; sharding beyond about 20 people a world.
- Owner: "Q and E strafe like Star Wars: The Old Republic". The keyboard is now SWTOR-style:
  - W/S forward and back (backpedal at 60%, facing forward); A/D turn the heading (2.8 rad/s) with the camera following; Q/E strafe while facing forward; F interacts (E is strafe now).
  - The arrows orbit the camera, which swings back behind you when you move. On a board, A/D (and Q/E) steer.
  - This is all in the input layer: frames record the move vector plus a basis yaw (the heading for keys, the camera for sticks), so there is no simulation change and old proofs still verify.
  - Tested in Chromium and WebKit.
- Owner (mid-turn): "Can you make a League-of-Legends-like game. Can you completely change the style? But still bring in and use inventory". New goal **G6: a MOBA world**, started right after the controls shipped.
- G6 MVP shipped: **Spire Clash** (`src/worlds/clash.js`), an original lane battle (MOBA genre; no names or art from existing games).
  - Engine: per-world `controls: 'topdown'` (WASD or arrows screen-relative; Q/E/R, Space dash, B recall recorded as frame bits 16–256 and read via `w.input`) and `camera: { mode: 'top' }`.
  - New World API: `w.equipment()`, `w.itemInfo()`, `w.player.setSpeed()`. Old proofs are unaffected: the bits mask is now 0x3ff, so earlier bit values decode the same.
  - Gear bonuses: glider +6% speed, spring boots 30% faster dash, lantern +15% ability power, hoverboard 2× recall, each sigil +4% damage, crown +10% gold. Worn cosmetics show.
  - The first win gives the Spire Circlet; wins `w.record('victory', t)`.
  - Balance from `tools/clash_sim.mjs` (headless matches in under a second each): bot victory in 17.7 min without gear and 11.3 min with glider, lantern and spring boots, a few deaths each.
  - Fixed along the way: XP too fast; rival too weak (now catch-up XP and seeded bolt dodges); a siege stalemate (siege rule: with your minions at a structure, you hit the structure).
  - Two full matches (104k ticks) are identical in V8, JSC and SpiderMonkey. Browser sessions with real key presses verify in Node (Chromium and WebKit).
  - The bot exposed a zsh gotcha: `${g:+--gear $g}` does not word-split.
  - Next for G6: a lusher art pass, touch buttons for abilities, a live head-to-head versus mode (two players), more champions.
- Owner (mid-turn): "add voice chat to the overall game". Shipped **proximity voice chat** (`src/engine/voice.js`).
  - Transport: Trystero media streams in the same room as presence (`addStream`, `onPeerStream`, and re-adding the stream when a peer joins later).
  - Audio: Web Audio HRTF panners placed at each peer's avatar, with the listener at the camera, through a voice bus.
  - Mic control: push-to-talk (hold V, or a TALK touch button) by default, or an open mic, by toggling `track.enabled`, so nothing is renegotiated.
  - Off until enabled in the menu; it re-enables at load only if the browser already granted the mic.
  - A speaking ring over avatars, and a HUD pill.
  - Chrome needs a muted `<audio>` element playing a remote stream before Web Audio receives it.
  - `tools/voice_test.py`: two Chromium browsers with fake microphones over the real relays. The listener hears the tone (level 0.31) within 1 s, the ring shows, and push-to-talk mutes and unmutes.
  - Voice is presentation only: the simulation is untouched.

