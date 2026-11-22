# BUILD: The Drowned Hours

How to build the campaign on the current World API, what the engine still needs, and the Chapter 1 vertical slice.

## 1. Shape of the build

- **Eleven world modules:** `dh-chartroom` and `dh-01-havana` through `dh-10-light`. Modules can't import, so shared code (Grit and foes, diving, climbing, the capstan, lantern sweeps, the ship deck, dialogue helpers) lives in one `dh-kit` source that the build inlines into each module. Every module stays self-contained and pinned by its own hash.
- **State:**
  - Story choices are global flags in the `dh.` namespace, so later worlds can read them.
  - Beat progress within a chapter lives in `w.store` (for example `beat: 3`) and is restored on `enter` by `setPos` to that beat's beacon.
  - "Tell it differently" clears the flags each chapter file lists.
- **Rules:** `rules: { deny: ['board'] }` everywhere, so loaned boards come only through `forceBoard`. Gliding and double jumps from other worlds stay allowed and open optional routes.
- **No coins.** No chapter calls `w.coin` or `addCoins`. Rewards are soulbound titles, cosmetics, codex entries and records.
- **Items** (all defined in `dh-chartroom` so the ids are unique):

| id | slot | traits | notes |
|---|---|---|---|
| `dh-straw-hat`, `dh-quadrant`, `dh-topsail-cloak`, `dh-red-cap` | head / hand / back / head | cosmetic | Soulbound rewards. |
| `dh-swallow-brooch`, `dh-casa-sash`, `dh-unawarded-medal`, `dh-lusca-ring` | head / back / head / hand | cosmetic | Ending rewards. |
| `dh-cutlass` | hand | blade (campaign-scoped) | Cosmetic outside `dh-*` worlds. |
| `dh-storm-lantern` | hand | light (campaign-scoped) | Cosmetic outside `dh-*` worlds. |
| `dh-knife`, `dh-dive-knife`, `dh-cutlass-loan` | hand | blade | Loans, taken back at the end of the beat. |
| `dh-torn-topsail` | back | glide | Loan (Chapter 3). |
| `dh-hatch-cover`, `dh-yard`, `dh-launch` | board | board | Loans, ridden with `forceBoard`. |
| `dh-winding-key`, `dh-pocket-watch`, `dh-journal`, `dh-protocol-book`, `dh-tin`, `dh-chart-case`, `dh-safe-conduct`, `dh-english-purse`, `dh-keys`, `dh-merino-key`, `dh-cell-key`, `dh-commission`, `dh-line` | null | key | Story items. |

- **Records:** `roofrun`, `compass`, `surf`, `flood`, `cabin`, `raid`, `knots`, `boarding`, `throat` and `lamp` (lower is better).

## 2. World API features used, by chapter

| World | Features used |
|---|---|
| Chart Room | `portal`, `interact`, `npc`, `ask` and `say`, flags, `travel`, `asset` (furniture), `model` (reward case), `light`, `sign` |
| 1 Havana | box/ramp/cylinder with textures (`stone-blocks`, `plaster`, `planks`), `asset` (ships, barrels, crates, lanterns), `jumpPad` (awnings), `crumble` (plank bridge), `wind` (laundry gust), `zone` (creaky planks, finish line, procession trigger), `interact`, `npc`, `ask`, `pickup` and `give`, `checkpoint`, `timer` and `record`, `mover` (Fenwick's pinnace), `avatar` (the procession), `burst`, `shake`, `light`, `banner`, theme swaps, `setSpeed` (capstan) |
| 2 Silver Road | static ship, climb zones (shrouds), zones (compass studs, exposed stern spots), tick-driven officer cycle, `interact` (winding, log, signs), `particles` (birds, wake), `frame` visuals (fleet bobbing, swell bands) |
| 3 Hurakán | tilted geometry, `wind` gust schedules, rain particles, lightning (`light` and `shake`), world-coded wave sweeps, `mover` (loose gun), loaned blade, glide and board, `forceBoard`, `freeze` and `setPos` (mast fall), hazards (reef heads), `boostPad` (breakers) |
| 4 Silver Tide | water-level `mover` (tide) with a world-coded splash check, `setSpeed` (wading), loaned board, hide/show world states (time skip), `ask`-driven deduction |
| 5 Forty Breaths | dive volume (wind buoyancy, `setSpeed`, breath counter), `crumble` (the roll), bubble-column `wind`, strike targets (beams), knock cues (bursts and toasts) |
| 6 Palmar | foe waves (`input.attack`), lantern-sweep zones, `avatar` waypoints (divers, families), loaned launch, telegraphed hazards (volleys) |
| 7 Nassau | ordered-zone puzzle (Knot Yard), climb zones (tackles), a 40° ramp hull, `interact`, the sundial timing window, `ask` judgement, night theme |
| 8 Dead Reckoning | static deck with moving sea, deck movers (roll window), `jumpPad` swing, foes, jolly-boat board, timed `interact` choice |
| 9 Wandering Isle | tide-cycle wind zones (Lusca), dive volume, guide line, capstan, eyepiece timing, `light`-trait lantern |
| 10 True Light | capstan, crumble and gust stair, ring-run timing, foes and boss, reef causeway, ending branches, the meridian `portal` |

## 3. New engine features, ranked

Ranked by how much of the campaign depends on each one. Each has the cheapest version that unblocks the story.

**1. Campaign grouping.** Today Junction opens a portal to every registered world, so it would show eleven.
- **Cheapest:** a registry field `listed: false` that Junction's automatic ring and the M panel skip. The Chart Room is the only listed world, and it handles chapter select with `w.travel`.
- **Later:** a `campaign: { id, order }` block, so the worlds panel can show progress.

**2. Soulbound and scoped rewards: titles and a codex.** The brief requires story rewards that can't be traded, and story gear shouldn't hand out free powers everywhere.
- **Cheapest:**
  - an item field `soulbound: true` that the future ownership layer refuses to transfer;
  - an item field `scope: 'dh-'` that makes `traitAllowed` ignore the item's traits outside worlds whose id starts with that prefix (cosmetic everywhere else);
  - `w.title(id, text)`, which stores an earned title on the profile and shows it in the items panel;
  - `w.openPanel('codex')`, which lists the flags `dh.codex.*` with text from a `codex: {}` map in the module (data only).
- **Fallback now:** titles as flags, and a codex read out with `w.say` in the Chart Room.

**3. NPC handles.** NPCs are static. Today `npc()` returns no way to move or hide them, and their colliders and interacts are fixed. The story needs Lalo at several stops, crowds, processions and allies who arrive.
- **Cheapest:** `npc.setPos(p, yaw)`, `npc.hide()` and `npc.show()`, moving or disabling the avatar, the capsule collider and the interact together.
- **Later:** `npc.walkTo(path, speed)`, tick-driven and deterministic, and a `follow` mode for companions.

**4. Foe kit and Grit HUD.** Chapters 3, 6, 8 and 10 have fights. Junction's dummies show the pattern works in world code.
- **Cheapest:** `w.meter(id, label, value, max)`, a small HUD bar used for Grit and breath, plus a documented `dh-kit` foe template:
  - state in `tick` with 100 HP;
  - a 0.6 s telegraph (a raised blade, using the avatar's strike clip);
  - reach 2.2 m and a hit costing 1 Grit, with knockback through `push`;
  - "yield" at 0 HP, where the foe sits down and drops its blade (a `model` swap) and stops being a target;
  - at 0 Grit, a respawn at the beacon.
- **Later:** an engine `w.foe()` with a hit flash and animation states.

**5. Water and diving.** No swim exists.
- **Cheapest:** world code. A dive volume is a zone with an upward push (net gravity 12 m/s²), `setSpeed(0.6)`, blue fog swapped through the theme, a breath counter on `w.meter`, refill zones, and a splash check outside dive volumes.
- **Later:** `w.water({ pos, size, dive, current })`, with a swim stroke, a surface float and underwater camera tinting.

**6. Climb volumes.** Shrouds, nets, tackles, drainpipes and ladders.
- **Cheapest (works today):** a zone whose `onStay` reads `w.input.move[1] > 0.5` and calls `w.player.push([0, 7, 0])` with a small push into the surface, then a forward nudge at the top.
- **Later:** `w.climb({ pos, size, face })`, with a climb animation and the camera pulled back.

**7. Weather, sky and sound.**
- **Cheapest:**
  - eight new sound names: `thunder`, `surf`, `wind`, `bell`, `cannon`, `creak`, `splash` and `tick`;
  - a particles kind `rain` (fast, stretched streaks);
  - `w.flash(intensity, seconds)` for lightning.
- **Later:** positional `w.sound(name, { pos })` (the Heart's ticking), `w.sky.sun(dir)` for moving the sun at noon (visual), and theme crossfades.

**8. Compound movers.** Ship decks that heave and roll, and the boarding gap.
- **Cheapest:** `w.mover([parts], opts)`, so one path carries several parts with fixed offsets.
- **Later:** rotation keyframes on movers (roll and pitch), with riders carried correctly.

**9. Camera shots.** For the mast fall, the strike, the reveal and the ending.
- **Cheapest (works today):** `freeze`, `banner` and `say`, with `setPos` to frame the scene.
- **Later:** `w.camera.shot({ from, look, seconds })` with letterbox bars; presentation only, skipped in replays.

**10. Animated sea.**
- **Cheapest:** a large translucent box plus `frame`-bobbed decoration (swell bands, foam rings).
- **Later:** `w.sea({ level, color, swell })`, a vertex-shader surface shared by every sea chapter.

**11. Overlay views.** The telescope eyepiece, and a chart or traverse-board close-up.
- **Cheapest:** geometry placed in front of the camera in `frame` while the player is frozen.
- **Later:** `w.overlay({ image | parts })` as a UI layer.

**12. A steerable ship.** Deferred. The story never needs the player to helm.
- **Cheapest:** static decks with a moving sea and `w.ask` voyages between worlds.
- **Later:** a boat vehicle trait on top of the board physics (wind angle, heel).

## 4. Assets to add

All verified on Poly Haven, CC0. Add them to `assets/sources.json`; the left side is the proposed id, the right the Poly Haven id.

- **Ships:** `dutch-ship-large` (dutch_ship_large_01), `dutch-ship-large-2` (dutch_ship_large_02), `dutch-ship` (dutch_ship_medium), `pinnace` (ship_pinnace).
- **Ship props:** `cannon` (cannon_01), `treasure-chest` (treasure_chest), the casket base, `compass` (seadogs_compass), `wine-barrel` (wine_barrel_01), `crate` (wooden_crate_01), `bucket` (wooden_bucket_01), `ladder` (wooden_ladder), `saber` (wooden_handle_saber), the cutlass look.
- **Shore:** `fort-kit` (modular_fort_01), Havana and Nassau walls; `pier` (modular_wooden_pier); `island-tree-1..3` (island_tree_01–03), which need checking that they read as palms; `conch` (lambis_shell); `coast-rocks` (coast_rocks_01); `cliff` (coastal_cliff_01); `roots` (root_cluster_01), mangroves.
- **Interiors:** `table` (WoodenTable_01), `chair` (WoodenChair_01), `stool` (wooden_stool_01), `bookshelf` (wooden_bookshelf_worn), `candlestick` (wooden_candlestick), `ship-lantern` (Lantern_01), `mantel-clock` (mantel_clock_01) for the Chart Room, and `basket` (wicker_basket_01).
- **Already pinned:** `barrels`, `wooden-lantern`, `brass-lantern`, `boulder` and `mossy-rocks`.
- **Characters:** none needed. NPCs use the default avatar with period colours and hats. A CC0 period pack (sailor, officer, merchant) would be a later, optional `characters.json` addition.

## 5. Vertical slice: Chapter 1 first

**Why Chapter 1.** It exercises most of the kit and needs no engine changes except optional ones. It covers rooftop platforming, a timing puzzle, light stealth, the capstan, a procession, two lasting choices and the hand-off to Chapter 2. If it's fun, the campaign is viable.

**In scope:**
- Havana's waterfront, the rooftops, the Sun Loft, the customs house, the Real Fuerza tower, the Fleet Wharf and La Punta, all built to the layout table in `chapters/01-noon-at-havana.md`.
- The full Chapter 1 dialogue and flags.
- The Chart Room in its minimal form: a room, Lalo's first visit and the great-chart entry.
- A stub Chapter 2 world reading "To be continued" that confirms the flags arrived.

**Out of scope:** the codex panel, which falls back to `say`; titles, which fall back to flags; NPC walking (Lalo uses three fixed instances, hidden by toggling `avatar.root.visible` and moving the interact radius off-stage, until feature 3 lands).

**Engine work:** feature 1 (`listed: false`) before publishing, and ideally feature 2's `soulbound` field so the hat is born soulbound. Nothing else blocks the slice.

**Milestones:**
1. **Greybox.** Every footprint from the layout table as flat-coloured boxes. Spawn, splash and beacons. The rooftop route tuned against the movement numbers (jumps of 1.9 m and 4.5 m, bounce power 19).
2. **Mechanics.**
   - The noon clock and the meridian sun spot (a tick-driven position and a ±0.06 m window).
   - The creaky planks.
   - The capstan angle accumulator with the lantern sweep.
   - The procession (avatars on a tick schedule; visual only).
   - The nine o'clock gun and the chain visual.
3. **Story.** All `w.say` and `w.ask` scripts from the chapter file. The flags `dh.origin`, `dh.hired`, `dh.late`, `dh.fenwick`, `dh.wraxall`, `dh.ch.1` and `dh.codex.*`. Items and the hat reward. `w.record('roofrun')`.
4. **Dressing.** Textures, Poly Haven ships and props, theme swaps (day, sunset, night), lights, particles and music.
5. **Verification.**
   - Scripted proofs through `tools/proof_test.py` for six branch combinations: freed + told, left + refused, reported + sold, a late arrival, an overwind-free path and a "never answer Wraxall" path.
   - Each proof replays with `node tools/verify.mjs`, and the flags are checked at the end.
   - `tools/shot.py` screenshots at the spawn, the Sun Loft, the procession and the capstan.

**Acceptance:**
- A new player reaches the Sun Loft from the spawn without help in under 5 minutes.
- Every branch replays bit for bit.
- No `Math.random`, `Date` or timer calls in the module.
- 60 fps on the reference laptop at medium quality, which means under 400 draw calls after static merging (ship assets are flagged `detail: true` beyond 150 m).
- Chapter 2's stub reads the right flags.

**Risks:**
- Rooftop difficulty for new players. Mitigation: awnings with generous radii, and the late path loses nothing.
- Dialogue length. Every `say` stays at five lines or fewer, and optional voices stay optional.
- The procession's look depends on avatars standing in for soldiers until a period character pack exists.
