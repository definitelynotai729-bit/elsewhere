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
- [x] **Custom 3D models (shipped 2026-11-22; owner asked "what about custom .sdl", read as .stl).** What shipped:
  - Builder import of .stl/.glb into the canonical `elsewhere-mesh/1` format: simplified to at most 20k triangles and 300 KB, and named by its SHA-256.
  - Level format 3 with `mesh` parts. Visual, with an optional convex hull carried as data: 4–48 points, turned into a collider by `w.hull`.
  - Bytes live only on the relays (chunked kind-30078 `elsewhere-blob` events), cached in IndexedDB, and checked by hash.
  - The validator checks availability at admission (not on rebuild).
  - Per-player Hide and Hide creator at the Gate.
  - Golden proof `webkit-model`: the player crosses an imported STL slab via its hull.
  - The original plan follows, kept for reference:
  - Upload .stl or .glb at the Gate.
  - It is converted to a canonical compact mesh (quantised positions, indices, optional vertex colours); the hash of that is its id.
  - A level places it as a `mesh` part (visual; an optional convex-hull collider computed from the canonical points).
  - Limits: about 20k triangles and 300 KB.
  - Transport: the model travels with the level in chunked relay events; the validator verifies the hash and size, then archives it in `docs/assets/by-hash/`.
  - It needs the content rules plus report/hide. If the owner meant something else (SDF sculpting? SDL games?), switch.
- [x] **The Builder** (worker B, merged 2026-11-21: keyboard-first, drafts, export and import, test-play, then publish): an in-game creative mode where you place parts and things on a grid, test-play, and publish (with the clear run).
- [x] **Creator items** (2026-11-22): a level can award its own cosmetic item, tied to the creator and the level (provenance). Community items are cosmetic only.
  - Format `elsewhere-level/2`, with a `reward` (name, slot head/back/hand, and 1–16 look parts, each within 0.9 m).
  - The item id is `<level id>-r`, so it can't collide with anyone else's.
  - Template 2 gives it on a clear. Format-1 levels compile byte-identically, and published `lv-58aa35c96b` still matches its archive.
  - Owned creator items load before the first visit, and every run pins their level, so verifiers replay cross-world wear by hash. Equipping is allowed only for items from pinned modules.
  - Replays now keep pinned levels out of `w.worlds`, matching live play (the first cross-world test caught Junction building an extra portal in replay).
  - The Builder menu has 8 ready-made looks in two colours. The Gate shows each level's reward, and item cards show "Made by … · reward for clearing …".
  - Golden proofs `webkit-reward` (clear and reward) and `webkit-reward-junction` (worn in Junction). Their test level module is in `tests/modules/`; `verify.mjs --modules` reads it.
- [ ] **Later:**
  - Uploaded models, textures and sounds, pinned by hash, visual only and size-limited.
  - Sandboxed code worlds.
  - Curation by stakers and by curators each player chooses, instead of a developer veto.
- **Owner decisions** (drafted defaults below):
  - **Content rules: DECIDED by the owner on 2026-11-22: "There isn't banned content (in the bitcoin spirit)".**
    - Validators check only form: format, size, hash, and a replayable clear. Never content.
    - Filtering is per player: hide a level or a creator for yourself, and later opt into filter lists you choose. No central veto.
    - Hosting: uploaded model bytes stay off the owner's GitHub. They live on public relays, addressed by SHA-256, and the site and ledger record only hashes.
    - The protocol bans nothing, but a host is bound by the law where it hosts and by its provider's terms. Keeping bytes off the owner's GitHub keeps the owner a client and index, not a host.
  - Creator licence. Proposed: creators keep ownership and grant everyone a licence to play, display and remix inside Elsewhere.

### G7. Real graphics: each world its own look (owner asked 2026-11-21; next)
Owner: "not too roblox-like… nice graphics, custom looks… not just all same vibe".
- [x] Asset pipeline: `tools/assets.py` fetches CC0 models and skies from Poly Haven, shrinks textures to 512 px, and runs gltfpack (simplify, quantise, meshopt). The results are pinned by SHA-256 in `docs/assets/manifest.json`; `CREDITS.md` credits them.
- [x] Engine: `w.asset(id, { pos, yaw, scale, collide })` (scenery that loads async, with an explicit collider so gameplay stays deterministic), and `theme.sky` (HDRI environment lighting plus an optional photographed backdrop).
- [x] First dressing:
  - Junction: gothic guardians, marble busts, a bronze horse and whale, Victorian street lamps, benches, plants, a brass lantern, and sunset-lit reflections.
  - Skyreach: a photographed partly-cloudy sky, mossy rocks, ferns, a stump, a log and a boulder.
- [x] **Textured materials for primitives** (worker A, merged 2026-11-21: 11 CC0 PBR sets, box-projected UVs at bake, and an art pass on Junction, Skyreach, Glowcave and Rush): CC0 PBR texture sets (grass, rock, marble, cobblestone, wood, metal) with world-space UVs generated at bake. Then the island ground, the plaza floor and the arena lane look real.
- [ ] A per-world art direction pass:
  - Skyreach: natural.
  - Junction: grand marble plaza at dusk.
  - Glowcave: wet stone, crystals, moon rocks, lanterns.
  - Spire Clash: weathered stone ruins, desert boulders, quiver trees, banners.
  - Crystal Rush: candy.
  - Neon Circuit: keep synthwave.
- [ ] Replace low-poly trees with real ones (heavily simplified CC0 trees, or impostors).
- [ ] Creators: upload .glb/.stl to levels (G5 step).

### G8. Bigger rooms (owner asked 2026-11-21)
Today each world is one full-mesh WebRTC room: n−1 links per browser, positions at 10 Hz to each peer, and a separate voice stream to every peer. That gives about 10–15 players comfortably, with 6–8 talking.
1. [ ] **Area of interest.** Link only the ~25 nearest players, and send voice only to the ~8 nearest speakers. Target: hundreds per world, still pure P2P.
2. [ ] **Spatial cells.** Rooms `world:<id>:<cell>`; join your cell and its neighbours as you move.
3. [ ] **Volunteer forwarders.** Strong desktop peers forward for phones.
4. [ ] **Community relays** (with G4). Independent relay servers forward state and voice (an open-source SFU), and clients use several at once. Validators can run them and earn. Target: thousands.
- Competitive matches: deterministic input lockstep or rollback, with a verifiable result.

### G2. Continuity: a verified inventory (target 2026-11-25)
A run only counts if it starts from the player's last verified state. Its coins, items and flags must be what the ledger says they own, and equipped items must be owned. Items and coins then exist only because verified play produced them.
- [x] Ledger keeps per-key state: owned items, coins, flags, world saves (`docs/ledger/states.json`, recomputed by `--rebuild`).
- [x] Chained submission: every visit is sealed into the player's chain (`prev`, `seq`, signed) and published in order from an outbox.
  - Each visit starts from the chain's state, so profile edits are undone.
  - A visit left open when the tab closes is sealed on the next load.
  - The chain is bound to its key.
- [x] "Verified" marks on items. The records panel shows the chain's progress, with "Return to my verified state".
- **Done 2026-11-22. Continuity is live from `CHAIN_START` (2026-11-22 08:00 UTC).**
  - Earlier, unverified progress became Season 0 mementos.
  - See SECURITY.md; tests: attack_test (CI) and chain_test in Chromium and WebKit.

### G3. Fun: a new game-world plus polish (target 2026-11-26)
- [x] One new world that is a replayable score game (a `w.record` with `better: 'higher'`), proving games can be added later. Shipped as **Crystal Rush** on 2026-11-21.
- [ ] Vault interior: give it real headroom; the dome collider is currently a 2.1 m ceiling.
- [ ] Phone pass: touch controls and performance on a mid-range phone profile.

### G4. Chain groundwork (target 2026-11-30; security design agreed in outline 2026-11-21)
Goal: player-owned assets that are secure from attack. The game rules ARE the consensus rules: every claim is a replay that any node, even a phone, checks in about a second. So validators can order and censor, but they cannot forge.

Design (details in the 2026-11-21 log):
1. **Player microchains.**
   - Each player's runs form their own signed hash chain (a prev pointer and a sequence number).
   - Validators countersign each step (a quorum certificate) so a player cannot fork their own history.
   - Single-owner assets need no global order (FastPay, Sui owned objects, Linera).
2. **BFT ordering only for shared objects:** trades, auctions, limited mints, publishing.
   - Tendermint-style 2/3 finality; double-signing is provable and slashable.
3. **Two asset classes** (owner decision pending; recommended):
   - Play-earned coins and progress are soulbound (not transferable), so Sybil farming yields nothing to sell.
   - Tradable items come only from fixed-supply creator mints and globally capped achievements.
   - Items are namespaced by issuer, and worlds choose which issuers they honour.
4. **Checkpoints** anchored to Bitcoin via OpenTimestamps (free), plus Nostr and GitHub. These are weak-subjectivity checkpoints against long-range rewrites.
5. **Keys:** passkeys (WebAuthn) plus an exportable recovery phrase, with optional social recovery.
6. **Creator code:**
   - Levels stay data-only.
   - Any future code worlds run in a metered sandbox (QuickJS in WASM with step limits). Never import() untrusted code on a validator.
7. **No bridge at launch.**
   - Start with a federation of 4–7 independent validators (threshold keys). They can censor but not forge.
   - Stake only when there's value worth securing.
   - Legal review before anything is redeemable for money.

First milestone (unchanged in spirit): four local validators agree on the same ledger, and an invalid proof is refused by every one. Then add microchains, quorum certificates and an OpenTimestamps anchor.
- [x] **Player microchains, single-validator version** (2026-11-22, via G2 continuity): chain links, verified per-key state, deferral of out-of-order runs.
- [x] **OpenTimestamps anchoring** of every ledger head (`tools/anchor.mjs` in the ledger workflow, three calendars; `ots upgrade` completes the Bitcoin attestations).
- [x] **Hardening from a red-team review.** Every exploit it found now has an attack test:
  - arcade minting;
  - copy-check bypass and front-running lockout;
  - validator stall (budget, fair queue, registry dedupe, cursor);
  - decompression bombs;
  - old-version replays (`docs/worlds/history.json` with revocations).
- [x] **Signed room identity:** key fingerprints on name tags, and copied hellos fail.
- [ ] **Federation:** 4+ validators countersign heads (a quorum certificate); clients check the signatures.
- [ ] **Engine versions pinned by hash** (today a semantic engine change must keep every archived proof identical).
- [ ] **Passkeys and a recovery phrase**; commit-reveal for records.

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
- Owner: how to enable voice on Windows (answered: menu → Voice chat; Windows microphone privacy settings); "add some free nice stls… not too roblox-like… custom looks… not all same vibe".
  - New goal G7. Shipped the asset pipeline (20 CC0 models, 5 HDRI skies, 12 MB), `w.asset` and `theme.sky`, and a first dressing of Junction and Skyreach.
  - Lessons:
    - Poly Haven dimensions are in millimetres (the horse statue is a 22 cm figurine).
    - `street_lamp_02` is a wall lantern; `street_lamp_01` stands free.
    - The photographed sunset backdrop washed out Junction's painted identity, so it is used for lighting only.
- Owner: "Can we have multiple Claude sessions working on this at the same time? Maybe each on their own branch". Yes. Three parallel workers, each in its own git worktree and branch, with the coordinator (this session) reviewing, testing and merging:
  - A: textured materials plus the art pass on Junction, Skyreach, Glowcave and Crystal Rush.
  - B: the in-game Builder.
  - C: Spire Clash polish (art, touch ability buttons, balance).
  - Scheduled work cycles skip steps marked IN PROGRESS.
- Owner on differentiators against Roblox: answered, and saved as "Positioning" in DESIGN.md.
  - Cross-world item meaning.
  - Proof-backed records and ghost races.
  - Pinned rules with a public ledger (no feuds).
  - One link, no install.
  - Per-world looks.
  - Creator-first economics later.
- Owner on security from a currency and consensus angle ("true player-owned assets"). Answered, and the G4 design was rewritten:
  - Validity by replay: no forging, even by validators.
  - Signatures: no theft without keys.
  - Microchains with quorum certificates for single-owner assets; BFT only for shared objects.
  - Soulbound play earnings against farming.
  - Issuer-namespaced items.
  - OpenTimestamps checkpoints.
  - Passkeys for recovery.
  - Sandboxed code worlds.
  - No bridge.
  - Federation first, then stake.
  - Decisions pending from the owner: soulbound coins, federation-first.
- Owner: "katana in shop that deals damage". Shipped:
  - The Katana (blade trait), key 1 to strike (recorded input bit 512, `w.input.attack`).
  - Junction training dummies.
  - A golden proof `webkit-katana`.
  - Then the owner asked "Make the katana free": price 0, shown as "Free", and listed first.
  - Asked worker C to add the blade bonus in Spire Clash.
- Owner: "other character models in the shop… can still be animated to walk but doesn't look like the current character". Shipped the body slot with 7 rigged CC0 characters:
  - From KayKit: Knight, Barbarian, Mage, Rogue, Skeleton Warrior and Skeleton Mage. From Quaternius: the Robot.
  - Each is trimmed from 76 clips to 7, and from 3.6 MB to about 155 KB; 1.07 MB in total.
  - Engine:
    - Slots move onto bones, calibrated at the rest pose, and a worn hat replaces the character's own helmet.
    - The idle/walk/run/jump/strike state machine runs from the same inputs as the robot.
    - NPCs can wear characters (`w.npc({ character })`).
    - Bodies reach other players; `mp_test` now checks it.
    - Replays are untouched (the headless avatar ignores bodies; old proofs lack the slot and still verify).
  - Fixed before it shipped: net.js would have crashed on the new slot for every remote player.
- Merged workers A (textures) and B (the Builder). Worker C is still running.
- Lesson: `git add -A` picked up `.claude/worktrees/*` as gitlinks, so `.claude/` is now ignored.
- Merged worker C (Spire Clash polish). G6 status:
  - **Done:**
    - Art pass: afternoon sky, paved road, ruined sandstone walls, river with a timber bridge and stepping stones, banners, camps, ruins.
    - Touch Q/E/R, DASH and RECALL buttons.
    - Katana: +25% damage for the blade trait.
    - Balance: towers 3000 HP, spire 6000, numbers in one TUNE object. Over 8 seeds the bot wins in 8.9–13.8 min (11.7 mean); with gear 9.8, with the katana 9.4.
  - **Next:**
    - A live head-to-head versus mode.
    - More champions.
    - Portrait framing on phones (the timer covers the coins).
    - Fallen-tower stumps keep their colliders.
- All three parallel workers are merged. Combined suite:
  - 9/9 golden proofs, and the ledger rebuild matches.
  - Chromium and WebKit runs VALID.
  - Smoke 22/22.
  - Builder test OK.
  - mp_test: the Knight shows to the other player.

### 2026-11-22
- Work cycle (no owner feedback since the last one). The top step (G5 custom 3D models) is blocked: it needs the owner's content rules plus report/hide, because auto-publishing arbitrary meshes to the public site is a public-facing decision. So I took the next G5 step and shipped **creator items** (details in G5).
  - Tests:
    - Golden proofs 11/11 VALID; ledger rebuild heads match.
    - Battery 24/24 identical in Chromium and WebKit.
    - Scenarios VALID in Chromium and WebKit, including the new `reward` scenario (clear, then wear it in Junction).
    - Smoke 22/22, the Builder test, and mp_test all pass.
  - SIM unchanged: no existing proof replays differently.
  - Lesson: a replay's world list must equal live play's (first-party registry only). Pinning extra modules for their items must not make them visible to world code.
- Owner: "There isn't banned content (In the bitcoin spirit)". Recorded under content rules: validators check form only, and filtering is per player.
  - I flagged the one legal floor: a host is bound by law and its provider's terms.
  - Design answer: model bytes never touch the owner's GitHub; the relays carry them by hash, and the site and ledger hold only hashes.
- Shipped **custom 3D models** (G5, details there).
  - Tests:
    - STL imported through the Builder's file input, then cleared via its hull: VALID in Chromium and WebKit, and verified in Node without the model's bytes.
    - Live relay round trip: 180 KB model, 3 of 5 relays took every chunk, fetched back by hash.
    - Golden 12/12, battery identical, 10 scenarios VALID, smoke 22/22, Builder test OK, mp_test OK.
  - meshoptimizer 1.3.0 added (MIT, pinned), for the in-browser simplifier.
  - Known limits:
    - Relays may drop old events, so a model can vanish and its level shows stand-ins. Re-publishing (by the creator, or any client holding it) restores it. Blossom/IPFS mirrors are a later step.
    - Fetching waits for the slowest relay (about 9 s worst case).
- Owner: "Try to actually solve the security issues and sophisticated attacks". Shipped:
  - **Continuity (G2).** Each player's runs form a signed chain. The validator keeps every player's verified state and accepts a run only if it starts from exactly that state, so forged starting states (coins, sigils, items) are refused before any replay. In the browser, every visit starts from the chain's state, and existing unverified progress became Season 0 mementos.
  - **An independent red-team review** found 6 exploits, all fixed with attack tests:
    1. Arcade results minted unlimited coins.
    2. The copy-check was bypassable by re-encoding.
    3. Front-running copies could lock a player's chain.
    4. A validator stall through slow proofs.
    5. Registry amplification (72 MB per proof).
    6. Decompression bombs.
  - Plus version pinning of fixed bugs (world history with revocations).
  - **OpenTimestamps anchoring** of ledger heads in Bitcoin.
  - **Signed room identity** with key fingerprints.
  - **SECURITY.md** lists every attack, its defence and its test.
  - Tests:
    - attack_test 17/17 (now in CI);
    - chain_test in Chromium and WebKit;
    - mp_test (impersonation fails);
    - golden 12/12, ledger rebuild, battery identical, 10 scenarios VALID, smoke 22/22, Builder test.
  - SIM unchanged. The arcade guard changes no existing proof (none contains arcade events). Engine pinning by hash is noted as the proper long-term mechanism.
  - Lessons:
    - A chain must be bound to its key: a replaced profile generated a new key that would have continued another key's chain.
    - WebKit doesn't run `pagehide` on tab close, so open visits are also snapshotted every 5 s.

