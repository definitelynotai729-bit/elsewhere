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
  - Every gameplay change keeps proofs verifiable, with no manual step since engines are pinned (2026-11-22). The build archives the engine by its hash (`docs/engines/by-hash/`), and every proof names its engine (`sim`), so old proofs keep replaying on their own engine. This replaces bumping `SIM`: the engine hash is the SIM, bumped by every engine change.
  - Before committing, run `node tools/build.mjs --prune`. It drops world and engine versions built while iterating, which would otherwise stay in the histories and archives.
  - Re-record golden proofs only to cover new gameplay. Old ones stay valid on their pinned engine.
- **Ask the owner only for** accounts, spending, irreversible or public-facing decisions they should own, and feedback on fun.
- **Fun beats features.** If playtest feedback arrives, it jumps the queue.

## Direction (owner, 2026-11-22, LATEST): one look, and a clean Junction
- Owner: "Pick an aesthetic and stick with it. Clean up the home planet."
- **The look is bright, chunky low-poly (ART.md):** flat colours, soft warm light, glow only on what you can use, one name per place. The game's own worlds don't use photo textures, photographed skies or scanned models.
- **The realism track is closed.** Photo mode and the ultra preset stay; they suit the toy look.
- **Every world follows it** (2026-11-22), and so does the interface (2026-11-23: warm navy panels, Fredoka, a title screen in the look).
- Release prep (below) continues alongside.

## Direction (owner, 2026-11-22): release a successful game
- Owner: "It's clear to me that the crypto extreme upside event of true secure gameplay consensus is not feasible. Let's proceed now thinking about just wanting to release a successful game."
- **The plan is RELEASE.md** (a checklist): first impressions, quality, safety, reasons to come back, and launch (the owner's decisions: name, portals, analytics, a trailer).
- **Verified play stays as invisible machinery:** fair leaderboards and saved progress. Players never see its vocabulary. No new crypto or consensus work.
- Cycle prompts still say "own PoS chain, never Ethereum" and "bump SIM". Both are stale: follow this section.

## Direction (owner, 2026-11-22, earlier)
- "Let's focus on making a fun game and including crypto where it is natural. That means ethereum is on the table." Then: "Maybe we should just try to build a full 'ready-player-one' game with realistic graphics, and just focus on the game and add crypto / user ownership where it makes sense."
- **What this means:**
  - The goal is a full, original game in the spirit of Ready Player One: a universe of worlds, a grand hunt that ties them together, story worlds, combat, a living hub, and realistic graphics. The book's names, characters and quest are not used.
  - **Shelved:** our own proof-of-stake chain, the Sparks currency, and further economy steps (G4's federation and chain work, G9 E2–E5).
  - **Kept:** verified play, which is cheap and invisible and makes boards fair, and E1's trading groundwork, which is used only where natural (cosmetics).
  - **Ethereum is allowed.** If real value ever moves (for example creator payouts), use a layer 2 network and stablecoins rather than a token of our own.
- **Next:** combat (shipped: `w.enemy`), the game spine (a grand hunt across worlds), the story campaigns as worlds, and the photorealism agent's findings.

## Goals

### G11. The full game (owner, 2026-11-22: "a full 'ready-player-one' game with realistic graphics"). TOP PRIORITY
- [x] **Combat** (2026-11-22): `w.enemy` foes, hearts, strikes; the slime pen in Junction.
- [x] **The spine: the Founder's Echoes (GAME.md).** Complete 2026-11-22: the Prologue, Echoes I–V, the Tuning, the Origin. Stage 1:
  - the design (GAME.md);
  - the Echo Stone in the Vault, where the Founder's message starts the hunt;
  - `w.echo` (silent until the hunt starts);
  - Echo I in a root cradle hanging under Skyreach's Cloud Garden (glide off the edge and curve back under);
  - the Founder's Crown as an echo detector (a five-bar signal);
  - verified first finders on the boards and in the Verified play panel.
  - **All five Echoes are placed** (2026-11-22, the owner's "keep building… make it fun"). Each is a different kind of challenge:
    - **II, Glowcave:** a reflection walk. Stones you can't see lead across Mirror Lake to an islet; once the hunt is on, their reflections shimmer on the water.
    - **III, Neon Circuit:** beat the track record (the Founder's lap) and it wakes in the cyan garage.
    - **IV, Crystal Rush:** 30 crystals in one round and it floats above the tower.
    - **V, Spire Clash:** win a battle and it wakes by your fountain.
    - Feat-locked Echoes use `w.echo({ hidden })` with `.reveal()`.
  - **The Tuning and the Origin are built** (2026-11-22): the whole arc is playable, from the sigils to the Founder's letter (GAME.md).
    - **The Tuning:** play the five Echoes to the stone in life order IV, III, II, I, V. Each Echo has a pentatonic note; wrong tries give hints.
    - **The Origin** (`src/worlds/origin.js`, `listed: false`): a blueprint world opened from the Vault. Four stretches paint themselves in colour; then the study and the letter, which give the Founder's Mantle. The run is timed as "origin" on the boards. It is sealed (sends you home) without the Tuning.
    - **Later:**
      - The one-of-one tradable edition for the first player into the Origin (ECONOMY E1 mint, by the validator's key).
      - Seasons: new Echo trails through the story campaigns.
      - The Origin's art (it is a plain blueprint for now).
- [ ] **Story campaigns as worlds** (G10): a vertical slice of Chapter 1 of the best campaign; hide chapter worlds from Junction's portal ring.
- [x] **One look (ART.md; the owner, 2026-11-22: "Pick an aesthetic and stick with it").** It replaces the realistic-graphics track below, which is closed.
  - Bright, chunky low-poly. Junction rebuilt and every other world converted, and the photo assets deleted (2026-11-22).
  - The interface in the same look (2026-11-23): the palette, the Fredoka typeface, the loading and title screens.
- [x] ~~**Realistic graphics**~~ (closed 2026-11-22 by the one-look decision; kept for the record). Agent report: `~/elsewhere_graphics/REPORT.md`, with comparisons in `compare/`. Step 1 shipped 2026-11-22: an opt-in **ultra** preset and a path-traced **photo mode** (both stay). The steps that were next:
  - free wins at every quality level: per-world tone mapping (AgX for natural worlds), more sky light and less flat fill, clamped HDRI backdrops;
  - KTX2/Basis textures (phone memory; makes 1K/2K affordable);
  - a "photoreal" art pass on Skyreach: photographed materials, CC0 scans instead of primitives, instanced foliage in cells;
  - build-time baked lighting keyed by world hash, the only realistic light cheap enough for phones;
  - photo mode polish; three.js r170 → ~r188 on WebGL.
  - **Not now:** WebGPU (1.5–2.5× the CPU per frame, r170's post nodes are broken, the API churns); Gaussian splats (backdrops only, unlit, no colliders, licensing).
  - **The real limit is art direction, not the renderer.** Junction's pastel glow can't look photographed; realism needs natural palettes, materials as photographed, and scans.
- [ ] **NPCs that move:** walking paths, sight cones, followers (the story agents' top need; the foe AI is the base).
- [ ] **A living hub:** Junction as a city that grows, with more to do with other players.

### G9. Free exchange that bots can't farm (SHELVED 2026-11-22 by the owner's redirect: only E1 stays, for cosmetics where natural)
Owner: "a system of free exchange and a secure Ethereum- or Bitcoin-like currency that can't be bot farmed." Design: ECONOMY.md.
- **The rule:** playing never creates anything tradable, because bots can play perfectly on unlimited keys.
- **Tradable value enters only through:** stake (Sparks, fixed supply, issued pro rata), human creativity (editions designed and minted by players), and burned fees.
- **Play rewards stay soulbound.**
- [x] **E1. Ledger wallets** (2026-11-22).
  - Code: `src/engine/wallet.js` (shape, Ed25519 signatures, then an all-or-nothing apply) and `docs/ledger/wallets.json`, derived and recomputed by the rebuild. Transactions travel as kind-30078 `elsewhere-tx` events and share the hash chain with runs (`kind: 'tx'` entries). Each is archived in `docs/ledger/txs/`.
  - Editions: a design (the creator-item look format) and a fixed supply up to 1,000, all minted to the creator. Gifts, and swaps signed by both sides.
  - Rules: a per-key nonce, deferral when a nonce is missing, an expiry within a week judged on the validator's clock, and limits of 3 mints and 100 transactions per key per day.
  - Test: `tools/wallet_test.mjs`, 14 checks in CI.
  - Also fixed: a far-future relay event could carry the validator's cursor past every real event and blind it. The cursor is now capped at the validator's clock (`nextCursor`).
- [ ] **E2. In game.**
  - A wallet panel (editions apart from soulbound items).
  - Wearing editions on a style layer outside the verified run state; peers check ownership.
  - Minting from the look editor; trading with a nearby player (both confirm, both sign).
- [ ] **E3. Sparks.** The supply schedule, genesis (owner decision; ECONOMY.md recommends a 10% treasury), signed transfers, burned fees; issuance to stakers once the federation exists.
- [ ] **E4.** An offers board (signed half-trades on the relays) and a market stall in Junction.
- [ ] **E5.** Events with entry fees (zero-sum prize pools), with checks for tool-assisted runs.

### G10. Single-player stories (owner asked 2026-11-22)
- [x] **Four campaigns, written by agents** (done 2026-11-22; in `stories/`, index at `stories/README.md`):
  - The Long Light (space opera), The Day Begins at Sunset (Florence), The Drowned Hours (1715), The Last Summer of Bronze (Aegean myth). About 156k words in all.
  - All pass an originality scan.
  - The settings: an original space opera (no Star Wars names or lore), Renaissance Florence, the Age of Sail, and Bronze Age myth.
  - Each one: a story bible, 8–12 chapters with buildable layouts and full dialogue, and a build plan with the engine features needed.
  - They are drafted in `~/elsewhere_stories/`, reviewed for originality, then moved into `stories/`.
- [ ] **A playable vertical slice:** the first chapter of one campaign as a world. Then the engine features the campaigns share (enemies, a quest log, cutscene cameras…).
- **Photorealism:** an agent is prototyping options in its own worktree (lighting and post-processing, baked light, WebGPU, Gaussian splats, a path-traced photo mode). Its report goes to `~/elsewhere_graphics/REPORT.md`; the follow-up goes under G7.

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
- [ ] **Later (backlog, not the next step):**
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
- [x] A per-world art direction pass (done 2026-11-22):
  - Worker A: textures for Junction, Skyreach, Glowcave and Rush.
  - Worker C: Spire Clash ruins.
  - This cycle:
    - Glowcave props: moon rocks, crystal ground cover, wooden lanterns with flames in the Mouth, the Grove and the Shrine, and a faint night-sky environment.
    - Crystal Rush: photographed clear-sky lighting.
  - Neon Circuit stays synthwave. The original sub-list:
  - Skyreach: natural.
  - Junction: grand marble plaza at dusk.
  - Glowcave: wet stone, crystals, moon rocks, lanterns.
  - Spire Clash: weathered stone ruins, desert boulders, quiver trees, banners.
  - Crystal Rush: candy.
  - Neon Circuit: keep synthwave.
- [x] Replace low-poly trees with real ones (2026-11-22).
  - Skyreach's trees are the CC0 Jacaranda (Poly Haven), cut from 3.8M triangles to 37k with gltfpack's aggressive mode and 256 px textures (860 KB, loaded once, shared by all six).
  - Their old trunk and canopy colliders stay as invisible parts, so play is identical. A `fallback` look shows if the model can't load (tested by blocking the file).
- [x] Creators: upload .glb/.stl to levels (done as G5's custom 3D models).

### G3. Fun: a new game-world plus polish (target 2026-11-26; moved up 2026-11-22: fun first)
- [x] One new world that is a replayable score game (a `w.record` with `better: 'higher'`), proving games can be added later. Shipped as **Crystal Rush** on 2026-11-21.
- [x] Vault interior headroom (2026-11-22).
  - The dome was a solid sphere hanging into the hall down to 2.1 m. It is now a true dome: `w.sphere({ dome: true })`, the upper hemisphere with a matching 59-point convex-hull collider.
  - The hall has 7 m of headroom: a jump peaks at 2.49 m (player centre), where the ceiling used to stop it at about 1.2.
  - Outside is unchanged: you land on the dome top at y 14.22, at the gliders' gem cache.
  - Vault proofs VALID in Chromium and WebKit; the battery is identical across engines.
- [x] Phone pass: touch controls and performance on a mid-range phone profile (done 2026-11-22). Part 1:
  - A STRIKE touch button (key 1; the katana and dummies), tested by tapping on an emulated phone.
  - Measured each world's per-frame load on a phone. At medium: Junction 96 draw calls / 123k triangles, Skyreach 54 / 249k, Glowcave 243 / 258k, others under 90 / 65k.
  - The new `detail` flag on `w.asset` steps heavy decoration down at low quality (Skyreach trees to low-poly; Glowcave rocks to stones, plants dropped): Skyreach 249k to 138k triangles, Glowcave 258k to 160k.
  - Part 2, draw calls: measured over 24 views per world (3 spots × 8 directions), not one. Averages are 31–90 draw calls per world; Glowcave's 243 was its busiest view (at spawn).
    - Tried instancing every repeated copy (one draw for all copies of a model): calls −7% to +13%, triangles +115% to +755%, because a batch loses per-copy culling.
    - Tried instancing only low-poly copies: averages −7% to +13%; Glowcave's worst view 243 → 203. Not worth a new engine class and new ways for visuals to break. Reverted.
    - **Lesson:** draw calls are not the phone bottleneck here; frustum culling already does the work. Measure many views, never one.
  - Left for the owner (not blocking): a check on a real mid-range phone. The adaptive quality (medium, then low, when under 38 fps) covers slow devices meanwhile.

### G8. Bigger rooms (owner asked 2026-11-21)
Today each world is one full-mesh WebRTC room: n−1 links per browser, positions at 10 Hz to each peer, and a separate voice stream to every peer. That gives about 10–15 players comfortably, with 6–8 talking.
1. [x] **Area of interest** (2026-11-22).
   - Positions go 10/s to the 25 nearest players within 60 m and 1/s to everyone else. Voice goes to the 8 nearest within 40 m.
   - Leaving a set needs 25% more distance than joining it; players without a known position count as near; distant players are smoothed at their slower rate.
   - Small rooms are unchanged (one broadcast).
   - Upload per player in a room of 100: positions from 990 to about 350 messages/s, voice from about 3 Mbps (99 streams) to 240 kbps (8). At 200 players: 1,990 to about 450 messages/s; voice stays at 240 kbps.
   - **Honest limit:** Trystero still connects everyone to everyone (it has no way to cap connections). So the ceiling moved from bandwidth and voice (about 10–15 players, 6–8 talking) to the browser's connection count (roughly 50–100). Hundreds needs step 2 (cells).
   - Test: `tools/aoi_test.py`, four players in a room.
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
- [x] **Restoring a backup continues the chain** (fixed 2026-11-22; found while choosing the next step). Before the fix:
  - On a new device or after clearing storage, restoring a backup started the key's chain over at step 0. The validator already held the chain, so every later run was a fork, refused for ever. The restored items also became Season 0 mementos.
  - The "Return to my verified state" button reset in the middle of a visit. That visit had started from the old state, so its proof was refused too, and the player looped.
  - Now:
    - A browser without this key's chain asks the ledger first (`settleChain`) and continues from the verified state. Only a key the ledger has never seen starts fresh.
    - If the ledger can't be reached, the start is provisional, and those mementos are dropped on catching up.
    - Every 5 minutes (`E.checkLedger`) the browser compares its chain to the ledger, using recent run ids per step. If the ledger moved past it (another device, a restored backup), the visit in progress is not sealed and the next trip continues from the ledger.
    - The button marks the visit unverifiable and re-enters the world. It is also offered when the ledger is ahead.
    - The left-open-visit snapshot is bound to its chain's head and key.
  - Test: `tools/restore_test.py` (9 checks, Chromium and WebKit) with the real validator and three devices: restore, both devices leapfrogging, the button, and an offline restore.
- **Done 2026-11-22. Continuity is live from `CHAIN_START` (2026-11-22 08:00 UTC).**
  - Earlier, unverified progress became Season 0 mementos.
  - See SECURITY.md; tests: attack_test (CI) and chain_test in Chromium and WebKit.

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
- [x] **Engine versions pinned by hash** (2026-11-22; moved ahead of G8 step 2, see the log).
  - The engine (`src/engine/sim.js`, on top of `headless.js`) is built into one module and archived at `docs/engines/by-hash/<sha256>.js`: 78 KB per version. three.js and Rapier are archived once per version as vendor modules (`docs/engines/vendor/`).
  - Proofs carry `sim: <engine sha256>`; the build bakes the hash into the client. Old proofs say `sim-1`, which `docs/engines/history.json` maps to the first archived engine (it replays all 12 golden proofs and the whole ledger).
  - The validator, `verify.mjs`, the ledger rebuild and `verify.html` replay each proof on its own engine, checked by hash (vendors too), one at a time. Each replay installs its engine's deterministic Math; `detmath.install` can now re-run.
  - Policy for new runs (as for worlds): the current engine, or the previous one for 24 h, never a revoked or unknown one.
  - The client's Verify button replays only its own engine's proofs. Others go to `verify.html`, since loading a second engine into a running game is not safe.
  - Tests:
    - `tools/engine_test.mjs` (CI): archive integrity and a fresh build. A walking-speed change builds a new engine; all 12 golden proofs still verify on their own engine and all 12 diverge on the changed one. Plus 7 policy cases.
    - attack_test: three new attacks.
  - `build.mjs --prune` drops never-committed versions.
- [ ] **Passkeys and a recovery phrase**; commit-reveal for records.

### Later
Open world publishing (author keys, a sandbox worker for third-party worlds), item trading with creator royalties, room sharding, validator-run relays.

## Open questions for the owner
- **Economy (ECONOMY.md):** confirm the rule that play never creates anything tradable, and choose the genesis. Recommended: a 10% treasury for grants, contests and founding validators, the rest issued to stakers.
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
- Work cycle (no owner feedback). Finished G7's per-world art pass.
  - **Glowcave:** CC0 props placed against walls, never on paths, with small colliders: moon rocks (×12–16), crystalline iceplant ground cover, and wooden lanterns (×2.6) with glowing flames.
    - The Mouth: the exit pair and the portal pair.
    - The Grove: under the glowcaps.
    - The Shrine: four lanterns framing the dais between its pillars.
    - A faint night-sky environment (no backdrop) for the wet rock to reflect.
  - **Crystal Rush:** clear-sky environment lighting. The photo as a backdrop glared: its HDR sun bloomed over half the screen, so the painted candy sky stays.
  - Tests: golden 12/12, ledger rebuild, attack_test, battery 30 (10 Glowcave/Rush) identical in Chromium and WebKit, Rush and Skyreach VALID in WebKit, smoke 22/22.
  - Process caveats:
    - Every local build adds a version to `docs/worlds/history.json`. Before committing, drop versions that were never deployed (they would get the 24 h grace). Removed three here.
    - Screenshots: standing near a portal puts the camera inside its glow.
- Work cycle (no owner feedback). G7 real trees: done (details in G7).
  - Lesson: Poly Haven's trees are modelled leaves, not alpha cards, so normal simplification stalls (312k reported, 3.8M actual triangles, only to 231k at 6%). gltfpack `-sa` reaches 37k and still reads as a tree, judged side by side at 6%, 1% and 0.4%.
  - New tool options: `aggressive` and `tex` in `assets/sources.json`. Engine: the `invisible` part option and the `w.asset` `fallback`.
  - WORLD_API now documents `w.asset`, `theme.sky` and the asset library (pending since the first graphics pass).
  - Tests: golden 12/12, ledger rebuild, attack_test, battery 24 (4 Skyreach) identical in Chromium and WebKit, Skyreach walk VALID in both, smoke 22/22, the fallback with the model blocked.
  - G7 is now complete.
- Work cycle (no owner feedback). G8 step 1, area of interest: shipped (details in G8).
  - Trystero 0.26 can target sends and streams (`send(data, { target })`, `addStream` / `removeStream(stream, { target })`) but cannot limit connections. Step 2 (spatial cells) is what reaches hundreds.
  - Test lesson: four software-rendered pages run at about 1–2 fps, so message rates can't show 10/s against 1/s. `aoi_test` checks routing instead: the target list of every send, plus the voice targets.
  - Tests: aoi_test (7 checks), mp_test (identity, characters), voice_test, smoke 22/22, golden 12/12.
- **Daily review and digest, 2026-11-22.**
  - Shipped today:
    - Creator items (level rewards).
    - Custom 3D models (.stl/.glb). Owner decision: no banned content, in the Bitcoin spirit, with model bytes kept off GitHub.
    - The security pass:
      - continuity (verified ownership) live from 08:00 UTC;
      - six red-team exploits fixed, with 17 attack tests in CI;
      - signed room identity;
      - OpenTimestamps anchoring: ledger head #2 is now in Bitcoin block 977017.
    - Art: Glowcave props and lanterns, Crystal Rush sky lighting, real trees in Skyreach (G7 complete).
    - Area of interest for multiplayer (G8 step 1).
  - Health:
    - Smoke 22/22 (Chromium and WebKit), CI green, and the ledger workflow green every 30 minutes.
    - Live multiplayer OK (3 players, identities verified).
    - No chained runs yet since continuity began (nobody has played since 08:00 UTC). No wrongful rejections.
    - Fixed in review: the ledger job committed `ots upgrade`'s `.bak` files; they are now removed in the job.
  - Priorities: G3 (the Vault interior, the phone pass) moved above G8 step 2 (fun first; crowds of hundreds can wait). Owner said "keep building".
  - Next: the Vault's headroom (G3), then the phone pass, then G8 cells, then G4 (federation, engine pinning, passkeys).
  - Decisions for the owner (none blocking, so no notification):
    - Play-earned coins soulbound (recommended yes).
    - Federation first (recommended yes).
    - The final name.
    - The engine licence and the creator licence.
    - **Rotate the GitHub token pasted earlier** (security).
- Owner: "keep building". After the daily review, built G3's Vault headroom (details in G3). Next: the G3 phone pass.
- Phone pass, part 1 (G3, details there): a STRIKE touch button, a per-world performance survey on an emulated phone, and `detail` decoration stepping down at low quality.
  - Tests: the STRIKE tap broke a dummy; golden 12/12, ledger, attack_test, battery 24 identical in Chromium and WebKit, Skyreach walk VALID, smoke 22/22.
- Work cycle (G3 phone pass, part 2, then a continuity fix):
  - Phone pass part 2: draw calls measured over 24 views per world are fine (31–90 on average). Instancing was tried two ways and reverted (it kills culling: up to +755% triangles). G3 is done; a real-phone check is left for the owner.
  - The ledger shows the first chained runs by a real player (4 entries, 1 verified state).
  - Found and fixed a continuity bug: restoring a backup on another device restarted the chain, so all later runs were refused, and the recovery button looped. Details in G2.
  - Tests: restore_test 9/9 in Chromium and WebKit; chain_test both; golden 12/12; ledger rebuild matches; attack_test; tamper_test; battery 12 identical; Vault and katana proofs VALID in WebKit; smoke 22/22.
- Work cycle: **engine versions pinned by hash** (G4), taken ahead of G8 step 2 (spatial cells).
  - **Why:**
    - The verifier refused any proof whose `sim` differed from its own. So bumping SIM for a gameplay change (as this file said to) would have invalidated every archived proof, and players' verified states could no longer be recomputed.
    - In practice no gameplay change to the engine could ship. That is the opposite of fun first.
    - Spatial cells only pay off at hundreds of players in big worlds; the ledger has one real player.
  - Details in G4. Golden proofs, the ledger and the battery now all replay on archived engine `3a79dc04`, the same engine `sim-1` stands for.
  - Tests: engine_test (new, CI); attack_test (3 new engine attacks); golden 12/12; ledger rebuild matches; tamper; detmath; battery 24 in Node, and on the verifier page (now loading the archived engine) in Chromium and WebKit; proof_test walk/vault/katana in both; chain_test both; restore_test; smoke 22/22.
- **Owner, 2026-11-22:** "Let's focus on fun and bot farming right now. I'd ideally like a system of free exchange and a secure etherium or bitcoin like currency that can't be bot farmed. Have an agent also make several full, massive well-thought single-player stories (Starwars, renaissance time, etc)." Then: "Also have an agent explore photorealistic graphics."
  - Started four story agents (space opera, kept original; Renaissance Florence; the Age of Sail; Bronze Age myth) and a graphics agent in its own worktree.
  - Wrote ECONOMY.md and new goals G9 (economy) and G10 (stories), both at the top.
  - Next: G9 E1, the ledger wallets.
- G9 E1 (wallets) shipped: details in G9.
  - Tests: wallet_test 14/14; golden 12/12; ledger rebuild matches; attack_test; engine_test; tamper; chain_test in Chromium and WebKit; restore_test. The engine hash is unchanged (`3a79dc04`).
  - Next: E2, the in-game side (wallet panel, wearing editions, minting from the look editor, trading with a nearby player).
- **Owner redirect: a full Ready Player One-style game, realistic graphics, crypto only where natural (Ethereum allowed).** Shelved the chain and the currency; see Direction at the top.
- **Combat shipped: `w.enemy` (enemies.js).**
  - Foes (slime, crawler, brute) patrol, see you, chase, wind up a visible attack (dodge it, or strike to interrupt), hit for hearts, and give up past a leash.
  - Strikes knock them back; a blade does 34 damage, bare hands 6. Drops come once per player (no farming).
  - Hearts appear in the HUD; at zero you wake at your checkpoint. Sounds: hurt, squish, alert, defeat.
  - Everything is in the fixed-tick simulation (Rapier rays for ground and walls; foes are in the state hash). It is a new engine, `972a0601`, and the old proofs stay pinned to `3a79dc04`.
  - Junction got a slime pen by the dummies and the free katana: three slimes, a gate, a sign, and a "slimes" sweep time on the boards.
  - Tests: proof_test "slimes" (a browser sweeps the pen; VALID in Chromium and WebKit); the battery now seeks foes and strikes (24 runs identical in Node, Chromium and WebKit); golden 12/12 on their pinned engine; engine, attack, wallet, tamper, rebuild, chain (both), restore, smoke 22/22.
- Story agent done: **Renaissance, "The Day Begins at Sunset"** (11 chapters, 40k words, in `~/elsewhere_stories/renaissance/`).
  - Its top needs: NPCs that walk paths and see you, bells and custom sounds, codex/titles, mid-world sky changes, camera shots.
  - The registry needs a way to hide chapter worlds from Junction's portal ring.
- Story agent done: **Age of Sail, "The Drowned Hours"** (10 chapters plus the Chart Room hub, 39.7k words, `~/elsewhere_stories/age-of-sail/`). Havana 1715, the treasure fleet and the hurricane; the prize is a sea clock that solves longitude. Four endings.
  - Its top needs: campaign grouping (`listed: false` in the registry), soulbound campaign-only items with titles and a codex, movable NPCs, a combat kit (now partly covered by `w.enemy`), and water/diving.
  - Originality scan of both finished campaigns: clean. Franchise terms appear only in their self-audits.
  - Both campaigns ask for **campaign grouping** and **movable NPCs** first, so build those before any chapter.
- Story agent done: **Space opera, "The Long Light"** (10 chapters, 37k words of prose, `~/elsewhere_stories/space-opera/`). A galaxy whose rulers edit what everyone remembers; the player is the one person the record can't see. The hub is the mail ship *Rumour*. Chapter 1 needs no new engine features. Originality scan: clean (Star Wars terms appear only in its audit; no other franchises).
  - **Three campaigns agree on the next engine features, in order:**
    1. Campaign grouping: a `hidden` or `listed: false` registry flag, one portal per campaign, and chapter gating.
    2. Soulbound story rewards: a `bound` item flag, titles, and a codex.
    3. Movable NPCs: `setPos`, `moveTo`, `hide`/`show`.
    4. Enemy support: a `w.raycast` for line of sight, HUD meters for boss health and breath.
    5. Camera beats: a visual-only focus with letterbox bars.
- Story agent done: **Bronze Age, "The Last Summer of Bronze"** (10 chapters, 39k words). The missing oracle is another traveller from Elsewhere, and the best ending puts a hearth in Junction (an `lsb.ending` flag). Originality scan: clean.
- **All four campaigns are now in the repo** under `stories/`, with an index (`stories/README.md`) listing the engine features they share.
- **Graphics agent done, step 1 merged.**
  - **Ultra:** opt-in desktop graphics preset, never chosen automatically (`src/engine/gfx.js`, which wraps the renderer from main.js). It adds GTAO on indirect light only (half resolution), contact-hardening PCSS shadows at 4096, a planar mirror on Junction's marble, per-world tone mapping and light balance, a film grade, and 1024 px texture sets fetched only at ultra (`tools/assets.py --hires`, 8.9 MB).
  - **Cost:** about 2× high on desktop (Junction 0.86 ms against 0.45 ms on an RTX 5090); phones stay on medium/low.
  - **Photo mode:** Menu → Settings → Take a photo, or `EW.photo()`. Path-traced stills with three-gpu-pathtracer and three-mesh-bvh (MIT), loaded on first use from `docs/photo.js` (212 KB).
  - **Bench:** `tools/gfx_bench.py`, GPU-timed per pass via ANGLE/EGL on the real GPU.
  - **Merge checks:** the engine hash is unchanged (`972a0601`). All six worlds load at ultra with no errors in Chromium and in WebKit (the agent had tested only Chromium). Golden 12/12, engine, attack, wallet, battery identical in all three engines, walk and slimes proofs in both, smoke 22/22.
  - **TRAP:** editing `render.js` changes the engine hash, even in code a replay never runs. `world.js` imports `mat()` from it, and the minifier renames symbols across the whole file. Put renderer work in separate modules wired from main.js.
- Work cycle: **the spine, stage 1** (G11).
  - GAME.md: the Founder's Echoes. The prologue is the Vault; then the Echoes, the Tuning, and the Origin. Verified firsts are the natural use of the ledger; one owned one-of-one edition goes to the first player into the Origin.
  - Built:
    - The Echo Stone against the Vault's left wall. The Hall of Firsts sign now talks about the Echoes and the ledger, not "when the chain launches".
    - `w.echo` in the engine (new engine `158efff8`).
    - Echo I in Skyreach's root cradle. A first version hid it inside the cone, but the third-person camera stayed outside the rock and saw nothing, so it moved to an open cradle under the tip.
    - The crown's signal in the HUD.
    - `boards.firsts` and the "First finders" section in Verified play.
  - Tests:
    - proof_test "echo": a browser wakes the Echo Stone; VALID in Chromium and WebKit.
    - A functional check of Echo I in both engines: silent before the hunt, given after it, signal shown.
    - Golden 12/12, engine, attack, wallet, tamper; battery identical in Node, Chromium and WebKit; chain_test; smoke 22/22.
  - Note: `w.after` runs on game time, which in headless Chromium (software rendering) is slower than the wall clock.
- **Owner: "Keep building the game out. Draw from any inspiration you like. Make it fun!"**
  - Art style: decided myself (the open question). Junction stays stylised; natural worlds may move towards realism later.
  - Built Echoes II–V (details in G11). The engine is `e64d7378`; all five worlds changed version.
  - Tests:
    - A functional check of every new Echo in Chromium and WebKit: hidden before its feat, shown after, collectable; Glowcave's invisible stones hold you up.
    - Golden 12/12, engine, attack, wallet, tamper; battery identical in Node, Chromium and WebKit.
    - proof_test walk/lap/rush/clash/echo VALID in Chromium; walk/rush/echo/slimes in WebKit.
    - Smoke 22/22.
  - Harness flake: a Chromium proof_test started right after battery.py has twice printed nothing (probably a browser crash at launch, with the traceback hidden by my grep); reruns pass. Grep for Traceback too.
- **The hunt is complete, end to end: the Tuning and the Origin** (details in G11).
  - New: `listed: false` world modules (registry flag; no portal ring, no Worlds-menu entry), the first engine-adjacent piece the story campaigns asked for. Five echo notes in the audio. First finders now include the Founder's Mantle.
  - Tests:
    - proof_test "tuning" (a wrong order, then the right one): VALID in Chromium and WebKit.
    - A functional walk of the Origin in both engines: every stretch paints; the guardians fall to the katana and the gate opens; the invisible bridge holds; the letter gives the Mantle; the seal sends untuned visitors home.
    - Battery of 28 (4 in the Origin) identical in Node, Chromium and WebKit.
    - echo, slimes and walk proofs in both; golden 12/12; engine, attack, wallet; smoke 24/24.
  - Test lesson: WebKit types dialogs out slowly under test, and a dialog that follows an answer opens a few ticks later. Tests must wait on dialog state, never on key counts or text.
- **Owner: release a successful game.** Wrote RELEASE.md, then started on first impressions:
  - **Plain words:** "Verified play" became **Leaderboards** (best runs, first finders, the checking tools folded under Advanced). The jargon was rewritten in toasts, settings, the Worlds panel and the backup text. Community levels now show by name on the boards.
  - **Load time:** the physics binary is split out of engine.js (`docs/rapier-<sha16>.wasm`, by a build plugin for the client bundle only).
    - engine.js went from 5.4 MB (1,978 KB gzipped) to 1.4 MB (395 KB); the wasm is 1,145 KB gzipped. It compiles while it streams and stays cached across updates.
    - Same bytes as before, so play is identical: browser proofs (walk, slimes, echo, lap, rush, clash, tuning) are VALID on the archived engine, from Chromium and WebKit.
  - The engine hash is unchanged. Golden 12/12; smoke 24/24.
- **Owner: "Pick an aesthetic and stick with it. Clean up the home planet."**
  - **The style: bright, chunky low-poly (ART.md).** It is what the characters (KayKit), the avatar, Rush, Clash and the Origin already were; the photographed parts made the game look mixed.
  - **Junction rebuilt:**
    - A golden-hour plaza on a floating island: cream stone, an aged-copper dome, terracotta and coral, low-poly trees and planters.
    - Five portals evenly spaced on six avenues, each with a place between them: the world map, the arcade with the Leaderboards, the fountain garden with the sky path, the training yard, Pim's shop and the Junction Cup.
    - The Creator's Gate is now a portal like the rest (F opens the list).
    - **Removed:**
      - the scanned statues and lamps, the photographed marble and the HDR sunset (713 KB);
      - the candy trees and the neon floor and wall rings;
      - two empty arcade cabinets, the welcome board that repeated the controls, and six instruction labels.
    - **Kept:** the Vault and its insides, the spawn, Wren, the coin ids (made in the old order), and the sky path's jumps (rotated as a whole, so every jump is identical).
  - **Engine** (`3ea5090b`), all additive:
    - `sides` (3 to 64) on cylinders and cones;
    - portal `frame` (a stone frame and base, with glowing edges);
    - portals show no blurb by default;
    - `w.worlds[].listed`.
    - Other worlds look the same: no other world passes `sides` to a cone, and the cylinder sides they use (6, 8, 28) build the same shapes.
  - **Tests:**
    - proof_test npc, shop, katana, slimes, vault, echo and tuning are VALID in Chromium; npc, katana, slimes and vault in WebKit. katana and slimes now read the training yard's place from the world (`group.userData.dummies` and `.pen`) and walk round the Clash portal.
    - Golden 12/12, detmath, engine, tamper, attack and wallet tests pass; the battery 24/24 VALID; the ledger rebuild matches every head.
    - A sky-path check: every rock is solid, the pads throw as before.
- **Every world in the one look** (the rest of the owner's "stick with it"):
  - **Skyreach:** low-poly isles: grass tops, earth layers, faceted rock cones. Low-poly trees replace the scanned jacaranda (860 KB), and the photographed sky is gone.
  - **Crystal Rush:** flat paint instead of the plaster texture; no photographed sky.
  - **Spire Clash:** low-poly boulders, quiver trees, logs, barrels, painted kite shields and wooden lanterns replace the eight scanned models; no photographed sky. Its layout's random sequence also places the lane colliders, so every draw stays in its old order (new shapes take their own seed).
  - **Glowcave:** flat, faceted rock instead of the cave-rock and gravel textures; low-poly boulders, crystal ground cover and tall wooden lanterns replace the moon rocks, ice plants and lanterns; no photographed night sky.
  - **Neon Circuit and the Origin** were already flat.
  - **Every replacement kept its collider.** The invisible boxes and cylinders are exactly the asset colliders, offsets turned the same way.
  - **Signs:** shorter text in Glowcave, Circuit and Clash, where the controls are already on screen.
  - **Removed:** the photographed library (21 models, 5 HDR skies, 11 texture sets; 23.5 MB) from `docs/assets/`, and the Poly Haven list in CREDITS.md (it stays in history). The KayKit characters stay.
  - **Engine** (additive):
    - **Painted-sky reflections:** a world without `theme.sky` gets its painted sky rendered once into an environment map (`theme.envIntensity`, default 0.3). Without it, metal rendered black: the katana's blade, the crown.
    - **`w.sign({ frame })`:** the back and post in a world colour (wood in daylight) instead of a black slab.
  - **A replay mismatch, found and fixed** (engine `a3148117`). It predated today's work.
    - **The symptom:** sometimes the Vault proof replayed to the same claims but a different final state, under load. It happened in Chromium once in about 45 runs, and in WebKit on the first try.
    - **The cause:** Junction's door animation, a frame handler (live only), called `door.hide()` when the door finished rising. That disabled its collider a second time.
      - Rapier counts even a repeated disable as a change, which reorders later contact handling.
      - The run ends pressing straight into the round crown pedestal, against two contacts at once. There the reordering showed as a sub-millimetre difference in x.
    - **How it was found:**
      - The new state diff showed that only the player's final x differed.
      - A per-tick trace of a live run, compared with its replay, put the first difference at tick 390.
      - Injecting `door.hide()` between any two ticks from 100 to 381 reproduced the live value exactly.
    - **Fixes:**
      - The door animation now only hides the door's mesh.
      - `hide()`/`show()` touch a collider only when its state really changes (`isEnabled()`).
      - From a frame handler, `hide()`/`show()`/`remove()` change only what is drawn and log a warning, so live and replay always agree.
    - **Checked:** 90 injected redundant hides now leave the replay unchanged, and the WebKit Vault scenario verified 6 times out of 6.
    - **Diagnostics kept:**
      - A refusal carries the replay's whole state string.
      - The client keeps the last sealed one (`EW.lastSealedState`).
      - proof_test prints the differing fields.
      - `tools/tickdiff.py` (play until a proof fails, recording every live tick) and `tools/cmptrace.mjs` (the first tick where the replay parts from it).
  - **A softlock, found by the test suite and fixed** (in the same engine).
    - **The bug:** pressing F during a pause between an NPC's lines started the same conversation again. Both dialogs took over the one dialog box; the first never closed, so the UI's busy count stayed up and the player could not move. It also never released the sim's interaction lock.
    - **It showed up because:** slow test machines widen the pauses, and proof_test's "async" scenario presses F while waiting. It failed twice in a row.
    - **Fixes:**
      - The engine: an interactable can't start again while its previous run is still going (`it.running`, cleared in the continuation after it ends: the same tick live and in a replay).
      - The UI: dialogs queue instead of taking the box over.
    - **Also:** the async scenario's zone walks stop within 1.2 m of the centre (the zone throws you up, so 0.4 m could bounce on it).

### 2026-11-23
- **The first two minutes, and a title screen** (RELEASE.md, first impressions). Before, a new player got a "Who are you?" colour picker, then six lines of lore from Wren, then an objective naming three portals by direction.
  - **The title:** the loading screen is now Junction's golden-hour sky with a floating island, the name and a progress bar. A first visit opens on the title over the live plaza while the camera circles it, with a name box and Play (colours are in the menu). Play glides the camera down to the player. Returning players go straight in.
  - **Markers:** `w.objective(text, { at })` puts a pin with its distance on a place, or an arrow at the screen's edge while it is out of view (UI only; a replay ignores it). Junction always names one next step and marks it: Wren, then each sigil's portal in the order Wren suggests (Skyreach, Glowcave, Neon Circuit), then the Vault, the crown, the Echo Stone (to wake it, and again once all five Echoes are found) and the Origin. The Echo riddles stay unmarked: finding the place is the puzzle. Skyreach marks the summit, the glider and the Cloud Garden.
  - **Wren:** three short lines instead of six, ending with a gift, the Party Hat, which goes straight on (a banner and a toast). The rest of the old speech became tips.
  - **A trail of coins** from Wren round the planter to the Skyreach portal (named ids `trail1`–`trail3`, made last so every other coin keeps its id; c1 already sat on the way).
- **The interface in the one look** (the rest of "stick with it"): warm navy panels, cream text, gold lines, teal and coral instead of neon cyan and pink; Fredoka instead of Chakra Petch for headings, labels and signs (signs size by character count, so colliders are unchanged). The Worlds panel no longer shows hashes.
- **Engine** `5be7119f`: only the objective's marker option and the label font changed; replays are unaffected (the battery is identical).
- **Tests:**
  - a new proof_test scenario, `welcome`: a fresh profile talks to Wren, gets the hat, follows the trail (4 coins) and takes the Skyreach portal; VALID.
  - proof_test: all 18 proofs VALID in Chromium; welcome, npc, shop, katana, slimes, echo, tuning, vault and async VALID in WebKit.
  - Golden 12/12; detmath, engine, attack, wallet and tamper tests pass; the battery is identical in Chromium and WebKit (243/243); the ledger rebuild (19 entries) matches every head; smoke in Chromium and WebKit (7 worlds, 5 portals).
- **The social preview** (`og.png`) is now the title view, rendered by `tools/og.py` (it was the old neon Junction).
- **Next:** the playtest pass through every world as a new player (RELEASE.md, quality), then load time step 2 (the Builder on demand), the settings players expect, and safety (chat filter, mute and block).
- **The new-player playtest pass** (RELEASE.md, quality), later the same day. Every world was entered from Junction the way a new player arrives (after Wren, wearing the Party Hat, nothing else), at desktop and phone size, then taken through its key moments. No errors in any world. What it found, and the fixes:
  - **Skyreach:** you arrived with the world's sign between you and the camera, huge and cut off, and Bram behind you. Both now stand ahead of where you arrive, in view. Reaching the summit without touching the sigil skipped straight to "take the glider"; it now asks for the sigil first. Landing in the Cloud Garden left the goal saying "glide to the Cloud Garden"; it now says to take the portal home, with a marker.
  - **Glowcave:** markers on the lantern, each beacon in turn (the Grove, the Murk, Mirror Lake, the far shore, the Brink), the sigil and the portal home. A player without a glider learned only at the chasm, minutes in, that the far end needs one (unless they talked to Fenn); a note now says so five seconds after taking the lantern.
  - **Neon Circuit:** markers on the start grid, and in a race on the next gate, then the finish line.
  - **Spire Clash:** the goal line was a stats readout ("Lv 1 · HP 560/560 · 200 gold · Q ready · E ready…"). It now leads with the goal ("Topple the red towers (2 left), then their spire.") with a marker on the next red tower, and lists only what is still recharging. The countdown says what to do.
  - **Crystal Rush:** "no score yet" is gone from the goal line.
  - **Phones:** eight touch buttons crowded the middle of the screen. BOARD, STRIKE, CHAT and TALK now show only where they do something: a board to ride, foes here or a blade in hand, being shown to other players, voice chat switched on (Menu). TALK used to switch voice on, and ask for the microphone, at a tap.
  - **Two Echoes no person could reach** (the hunt's skill gates, measured with the test bots):
    - **Echo III** asked you to beat a 32.5 s lap. The autopilot, with perfect steering and no reaction time, laps in 33.4 s. Given a 0.15 s reaction time it laps in 36.9 s, at 0.2 s in 38.0 s, and at 0.25 s it starts falling off (59 s). The record is now **37.5 s**: a well-learned line, not a robot. Par (41 s, the Sigil of Speed) stays.
    - **Echo IV** asked for 30 points in a Rush round. The bot, which sees every crystal at once, scores 28–34. It is now **25** (the riddles say so).
  - **Left for later:** a Spire Clash match takes a strong bot about 11 minutes (6 seeds: 8.9–13.8); a person will take longer. Shorter matches (fewer tower hit points or faster waves) are a balance change of their own.
  - Junction's places (the map, arcade, shop, training yard, Cup, fountain garden) read clearly from where you walk up to them.
  - **Worlds** (new versions): hub `666e5e85` (the Echo IV riddle), skyreach `dcc0f8ac`, glowcave `f234114d`, circuit `f9455bb2`, clash `82e86ca9`, rush `e5b12680`. The engine is unchanged (`5be7119f`): the touch buttons live in `ui.js`, outside it.
  - **Tests:** proof_test all 18 VALID in Chromium; walk, welcome, npc, shop, katana, slimes, echo, tuning, vault, async, lap and exit VALID in WebKit on the final build (the lap now beats the record: +25 coins). A new golden proof, `webkit-record.json` (a record lap, then out through the paddock portal), makes 13; all VALID. The battery: 50/50 identical in Node, Chromium and WebKit. Detmath, engine, attack, wallet and tamper tests pass; the ledger rebuild (19 entries) matches every head; smoke in Chromium and WebKit (7 worlds, 5 portals).
- **Next:** load time step 2 (the Builder on demand), the settings players expect, safety (a chat filter, mute and block), and a shorter Spire Clash match. A person's playtest (the owner or friends) would find what bots cannot: boredom.
