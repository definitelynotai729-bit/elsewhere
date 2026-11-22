# Building *The Last Summer of Bronze*

How the campaign maps onto the World API (`~/elsewhere/WORLD_API.md`), what the engine would need to add, and a plan to build Chapter 1 first. Everything here assumes the API as documented: one module per world, everything through `w`, deterministic tick logic, and proofs that replay bit for bit.

## 1. Shape of the campaign

| Chapter | World id | Theme / sky | Rules | Main systems |
|---|---|---|---|---|
| 1 The Door in the Sea | `lsb-thyra` | `day-sky`, blends to dusk | deny `board` | climb, pickups, movers, choice |
| 2 The Low Wings | `lsb-pterousa` | `clear-sky` | deny `board` | wind, glide course, balance puzzle, light stealth |
| 3 Three Circuits | `lsb-strait` | `sunset-sky` | deny `board` | ship ride, timed hazards, the giant, strike rhythm |
| 4 The House of the Double Axe | `lsb-kerynthos` | `sunset-sky`, then night | deny `board` | palace hub, mirrors, bull-leap, rescue, choice |
| 5 The Labyrinth | `lsb-labyrinth` | dark (no sky) | deny `board`, `glide` | maze, patrol enemy, turning walls, chase |
| 6 The Old Man of the Sea | `lsb-pharia` | `clear-sky` | deny `board` | hide-and-count, five-phase platform fight |
| 7 The Mountain's Mouth | `lsb-omphe` | ash afternoon, then eruption | deny `board` | vents, dials, pipe walk, the big choice, eruption glide |
| 8 The Drawback | `lsb-aphanes` | night, volcanic red | none | timed run, carry weight, moving wave |
| 9 The Last Circuit | `lsb-harbour` | ash morning | deny `board` | timed errands, saved count, the giant, final glide |
| 10 The Stranger's Hearth | `lsb-hearth` | ash night to dawn | deny `board` | feast, naming, endings |

**Conventions for every module**
- **Story state** is global flags (`w.flag` / `w.setFlag`) under `lsb.` and `codex.lsb.`. Per-world `w.store` holds only local things (tin-drops found, best times).
- **Arrival variants** (`palace-ship`, `cow-night`, `harbour-lit` and so on) are read from a flag set just before `w.travel`, for example `lsb.arrive = 'cow-night'`. In `build`, the world positions the spawn, NPCs and props from it with `w.player.setPos` in the `'enter'` handler. Feature 1 makes this cleaner.
- **Determinism:** Talos's walk, the bull's state machine, wave and pumice timings, vent pulses and bobbing stones are all functions of `w.ticks` or `w.time` inside `w.on('tick')`. Decoration placement uses `w.rand(seed)`. Visual-only animation (the giant's limbs, the Kore's skirt, flames) goes in `w.on('frame')`.
- **No coins from the story.** Tin-drops are `w.store` counters with collectible pickups that pay no coins (feature 2 covers this properly). Story rewards are titles, keepsake cosmetics and codex flags only.

## 2. Items the campaign defines

Item ids are global, so everything is prefixed `lsb-`. Each item is declared in the module where it first appears, and re-declared identically in later modules that hand it out again (or, better, after feature 2, once in a shared campaign data module).

| Id | Slot | Traits | Kind | Given in |
|---|---|---|---|---|
| `lsb-guest-knife` | hand | `blade` | **loaned** gear | 1 |
| `lsb-low-wings` | back | `glide` | **loaned** gear | 2 |
| `lsb-linnet-boots` | feet | `doublejump` | **loaned** gear | 4 |
| `lsb-bread`, `lsb-tablet-1…6`, `lsb-kyllo-note`, `lsb-token-own`, `lsb-token-linnet`, `lsb-house-seal`, `lsb-compass`, `lsb-sealskin`, `lsb-linnet-tablet`, `lsb-relic-tablets`, `lsb-relic-seed`, `lsb-relic-heart` | null | `key` | key items | 1–8 |
| `lsb-feather` (Pedlar's Feather), `lsb-owl-brooch`, `lsb-laurel`, `lsb-armband`, `lsb-token-keepsake`, `lsb-wings-keepsake`, `lsb-ash-cloak` | head, back or hand | `cosmetic` | **keepsakes** (soulbound) | 1, 2, 4, 10 |

**The loan pattern (works today).** A loaned item is given in `'enter'` if its flag is set (`lsb.has.wings`), and taken back in a synchronous `'leave'` handler (`w.take('lsb-low-wings')`). It never leaves the campaign, so it can never be traded or carried into another world. Chapter 5 denies `glide`, so the wings are carried but inert there. Players' own gear (a Skyreach glider, spring boots, the katana) keeps working wherever the rules allow, as the platform promises. NPC lines react to it, and no puzzle requires the player not to have it.

## 3. World API features used, per chapter

- **Ch1:** `box`, `cylinder`, `sphere`, `cone`, `ramp` with textures (`cave-rock`, `plaster`, `stone-blocks`, `grass`, `cliff`, `planks`); `portal` (to `hub`); `checkpoint`; `crumble` (dark chimney ledges, cap stones); `mover` (the drifting boat, tide stones, the palace ship's approach); `wind` (the saddle); `pickup` (tablets, items); `interact` (basin, table, bell, lamps, beacon); `npc` with `onTalk`, `say` and `ask`; `sign`; `zone` (the tremor trigger, the race finish, the splash); `timer` and `record` (the Shadow Race); `w.input.attack` (striking the olive and the bell); `shake`, `burst`, `particles`, `light`; `travel`; `asset` (`brass-lantern` for a few hero lamps, `boulder`, `mossy-rocks`). Needs feature 7 (dusk) for polish only.
- **Ch2:** stacks as textured cylinders; `wind` updrafts; `pickup` ×7 feathers; `interact` (balance pieces); `zone` grid (the loom floor); timed bridges need feature 3 (toggle wind); a sight-cone patrol in tick (Axe-Bearers, optional); `record` (the High Line).
- **Ch3:** `mover` (the ship ride); Talos as a `w.model` group animated in `frame`; footfall `hazard` volumes switched on and off (feature 3; today, a `zone` with `onStay` that calls `w.player.respawn()` while a tick flag says "foot down"); `crumble` scree; strike-rhythm logic in tick; `burst` and `shake` for the boulders.
- **Ch4:** a large static palace (static parts merge, so hundreds of boxes are fine); `mover` (the training bull) with a tick-coded launch plate (`w.player.launch`); mirrors as `interact`s with beam boxes shown and hidden; patrol cones; `crumble`-free roofs; NPCs with many lines; crowd silhouettes (feature 5).
- **Ch5:** maze walls as merged boxes; turning walls as boxes swapped with `hide`/`show` (collision follows); the bull's state machine in tick (an eye-colour material in `frame`, presentation only); `crumble` tiles and timed pillar hazards for the Gallery; the lift `mover` started by a strike.
- **Ch6:** seal rows as decoration with a tick check for player speed near Proteus; five phases built from `mover`, `crumble` and rising platforms; the fire ring as a shrinking hazard (feature 3).
- **Ch7:** vents (feature 3), horns as rotating `interact`s, the pipe walk (a cylinder plus sideways wind), the choice (`ask` with 3–4 options), the eruption (`shake`, `particles`, lava-bomb hazards with shadow decals), the glide descent.
- **Ch8:** a long timer in tick; `w.player.setSpeed(0.75)` while carrying; `ball` (the dolphin); the moving wave (feature 3); `crumble`; respawn handling that resets the wave.
- **Ch9:** the errand list built from flags with `objective`; reuses Ch4's palace geometry (copied); a fire thermal (`wind`); the beacon; Talos's scripted brace; the saved count computed from flags and stored as `lsb.saved`.
- **Ch10:** reuses Thyra's geometry with camps scaled by `lsb.saved`; the feast `say`s; the naming `ask`s; ending logic; `banner` epilogues.

## 4. New engine features, ranked

Ranked by how much of the story they unlock against their cost. Each has the cheapest version that would do.

1. **Story worlds: unlisted chapters, arrival points and a campaign entry.** Junction auto-places a portal for every registered world, so ten chapters would put ten portals in the outer ring.
   *Cheapest:* a module field `listed: false` that the hub's auto-portal filter respects (plus the world map panel), and `w.travel(id, { arrive: 'name' })`, which the destination reads as `w.arrival` and which a module maps to positions in `arrivals: { name: { pos, yaw } }`. Flags already carry state between worlds.
2. **Soulbound rewards: bound items, titles and a codex.** The brief requires that nothing tradable comes from story play.
   *Cheapest:* an item field `bound: true` that ownership and trade (roadmap stage 3) refuse to transfer, so keepsakes and gear can simply be given. Titles: `w.title(id, text)` stores a flag `title.<id>`, and the profile panel lists them, with one chosen title shown under the nameplate. Codex: a panel that lists every flag `codex.<world>.<id>` with its text taken from a `codex` map in the module (data, like `items`). Tin-drops: a `collectible` pickup kind that counts in `w.store` and pays no coins.
3. **Movable and switchable gameplay volumes.** Talos's footfalls, pulsing vents, gusting crosswinds, the closing ring of fire, pumice lanes and the returning wave all need hazards, winds or zones that move or switch.
   *Cheapest:* give `w.hazard`, `w.wind` and `w.zone` the same handle as building blocks, plus `setPos([x, y, z])`, `setEnabled(bool)` and, for wind, `setForce([x, y, z])`, all callable from tick code. Until then, a world can approximate a moving hazard with a large `zone` whose `onStay` checks a tick-computed plane (`if (w.player.pos[2] < waveZ) w.player.respawn()`), which is deterministic but clunky.
4. **Dialogue and scene presentation.** Several choices have four options; a few scenes need the camera on a speaker (the giant kneeling, Proteus, the Wanassa); chapters change time of day.
   *Cheapest:* `w.ask` accepts up to 4 options (and `null` entries to hide unavailable ones while keeping stable indices for replays); `w.say(name, lines, { focus: [x, y, z] })` points the camera at a spot for the duration (presentation only; replays ignore it); and **feature 7** below.
5. **Characters in motion: walking NPCs, followers, giants, crowds.** Eumaia's walk to the beacon, Kore leading children, Tarkon leading the Quiet Rooms out, the feast crowd, a 30 m Talos.
   *Cheapest:* an NPC handle with `moveTo(pos, speed)` (tick-driven, with no collision against the player) and `follow(target, distance)`; `scale` on `w.npc` (presentation only, collider unchanged); and crowds made of `w.avatar` instances driven in `frame` (presentation only). Talos is a `w.model` built from parts (section 5), so he needs nothing new; scale is enough for the kneel.
6. **A simple enemy helper** (the Old Bull, Axe-Bearer cones, Proteus's count): a `w.patrol({ path, speed, cone: { range, angle }, onSee })` that steps in tick and exposes its position and facing. *Cheapest:* nothing in the engine; ship it as a copy-paste helper in WORLD_API's examples, since it is about 40 lines of tick code.
7. **Theme blending.** Dusk on Thyra, the eruption sky, dawn at the end. *Cheapest:* `w.setTheme(partial, seconds)` lerping colours, fog, sun direction and intensity. Presentation only, so it never touches a proof.
8. **Sounds.** Add `waves`, `gong`, `horn` (conch), `roar` (the bull, the mountain), `crowd` and `bell`. *Cheapest:* six more procedural sounds alongside the existing ones.
9. **Steerable ship rides.** Today a ship is a `mover` with a fixed path, which is enough for every chapter here. *Cheapest later:* `mover.setPath(points)` and `pause()`/`resume()` so a dialogue choice can change course.
10. **A cross-world hook for the Hearth ending.** No engine change: Junction's module adds a small hearth with Eumaia and Old Horn by the campaign portal when `w.flag('lsb.ending') === 'hearth'`. It is a few lines in `hub.js`, and it needs feature 1 only so that the campaign has a single portal to sit beside.

**Wanted CC0 assets** (Poly Haven, via `tools/assets.py`): an olive tree, a cypress, a clay amphora or pithos, a Mediterranean cliff rock set and a coil of rope. Fallbacks for each are simple primitives, so nothing blocks on them.

## 5. Notes for the hard parts

- **Talos.** A `w.model` of about 20 parts: a box torso with overlapping scale plates (thin rotated boxes), cylinder limbs, a box head with a flat mask face and two glow-3 spheres for eyes, a thin red emissive cylinder for the vein, and a pale cylinder for the nail. Gameplay never touches his mesh; footfalls are hazards at computed positions. A footfall at tick `n` lands at `stones[k]`, where `k = floor(n / 288) mod 6` (288 ticks = 4.8 s), with the stone's shadow decal darkened from tick `n − 72`.
- **The Old Bull.** States `walk` and `look`, switching every 360 ticks (6 s) with a 150-tick `look`. In `look`, if the player is within 12 m, within 30° of facing, and moving faster than 0.5 m/s, it enters `charge` along its facing at 12 m/s for up to 20 m. Contact means `respawn()`.
- **The saved count.** A pure function of flags, computed once at the end of Chapter 9 and stored as `lsb.saved`. It is shown in Chapter 10 and recorded with `w.record('lsb-saved', n, { better: 'higher' })` so that boards can show the most lives saved, a nice use of verified play.
- **One ending on the chain.** The first `lsb.ending` set is final. Replays of Chapter 10 show the other endings as "what might have been" but don't overwrite the flag: check `if (!w.flag('lsb.ending'))` before setting it.
- **Performance.** 300 votive lamps are small glowing spheres (static, merged), not lights. Keep to four or fewer `w.light`s per area. The palace is hundreds of boxes, which merge. Crowds and frescoes are `detail: true` where they are models.

## 6. Vertical slice: Chapter 1 first

Chapter 1 can be built **entirely with today's API**. That is the point: it proves the campaign's look, its dialogue voice and its choice-and-flag plumbing before any engine work.

**Scope.** All of `lsb-thyra` as written, with both beacon branches. The exit travels to a stub `lsb-pterousa` that shows a sign ("To be continued: Pterousa") and a portal home. In the slice, the stub is the only other new world.

**Milestones**
1. **Greybox** (about one day). Flat-coloured boxes for the cave, the chimney (17 ledges at 1.7 m steps, inside the 1.9 m jump), the Shelf, the Hearth, seven terraces, Owl's Watch, the cliff stair, the village and the quay. Portal to `hub`, checkpoints, `killY: −20` and the splash zone. Walk it and time it: the target is 25 minutes of pure traversal for a first-timer.
2. **Hearth scenes.** Eumaia's `npc` and the scenes 1.2–1.4 with `say` and `ask`; the basin and table `interact`s; items declared in `items` (bread, knife, both tokens). Flags `lsb.sign`, `codex.lsb.*`.
3. **Tremor and tablets.** The scripted shake and bursts; six tablet pickups and their six puzzles (the olive strike in tick, the boat `mover`, the tide-stone `mover`s with staggered `offset`, the goat bell, the roof jump, the threshold tablet); the return lines; Linnet's token; the title flag `title.lsb.guest`.
4. **Harbour.** Kyllo and the Shadow Race (`timer`, `record('lsb-shadow')`), Teuthis (kindness 1), Myrrha, Kessa (the slate or tin-drops payment).
5. **Dusk and the beacon.** Swap to a dusk theme on the trigger (or a banner until feature 7 exists), the palace ship's lantern `mover`, the `ask`, both branches and both exits.
6. **Art pass.** Textures, the Omphe backdrop cone with an ash plume, the walking Talos silhouette (a decorative `w.model` on a time-computed path), votive lamps, a few `brass-lantern` hero assets, the goat (a small `w.model`, or a coloured NPC until an asset exists).
7. **Proofs.** Record runs of both branches with `python3 tools/proof_test.py` and check them with `node tools/verify.mjs`; screenshots with `tools/shot.py` at the arrival, the chimney, the courtyard and the dusk beacon. `npm run build` must accept the module: no `Math.random`, `Date`, timers, `**` or browser APIs.

**Done when:** both branches can be played start to finish in under 50 minutes; every tablet is reachable with no gear (a glider or boots only adds shortcuts); both branches' proofs verify; the codex and title flags are set correctly; and a playtester can say who Linnet is and why the beacon matters without being told.

**Next after the slice:** feature 1 (unlisted worlds and arrivals) and feature 3 (moving volumes) unblock Chapters 2–3; feature 2 should land before any keepsake ships; features 4, 5 and 7 are polish that every later chapter benefits from.
