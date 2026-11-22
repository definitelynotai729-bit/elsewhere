# BUILD: The Day Begins at Sunset

How to build the Florence campaign with the World API as it stands, what the engine still needs, and how to ship Chapter 1 first.

## 1. Architecture

**Modules.**
- `florence` is the **Bottega**: the campaign hub and Junction's single entry. Its portal back to `hub` sits inside the Veil.
- Each chapter is its own module: `fi-01-snow`, `fi-02-palle`, `fi-03-campane`, `fi-04-spada`, `fi-05-giardino`, `fi-06-raccolta`, `fi-07-falo`, `fi-08-careggi`, `fi-09-prova`, `fi-10-sanmarco`, `fi-11-tramonto`.
- Chapter prologues set in the Bottega (Chapters 2, 3, 6 and 8) live in `florence`. They are selected by flags in `build()` and played from `on('enter')`.
- **Why per-chapter modules:** small proofs, small modules to review and pin, and chapters that ship one at a time.

**Travel.**
- The Bottega's **Chapter Door** is a zone that calls `w.travel(next)`. `next` comes from the flags: the first chapter not yet done, or the chapter picked on the **Calendar**.
- Each chapter ends with `w.travel('florence')`. The Bottega's `on('enter', from)` reads `from` and uses `w.player.setPos` to put the player at the door.
- No `w.portal` is needed between story modules, so no glowing rings appear in Renaissance streets.

**State.**
- **Choices and progress** are global **flags** with the prefix `fi.`; README.md lists the major ones. Progress: `fi.cN.done`.
- **Minor flags:** `fi.c4.stencil`, `fi.c4.proof`, `fi.c5.florin`, `fi.c6.evidence`, `fi.c8.signal`, `fi.c8.ledger`, `fi.c9.flare`, `fi.c9.domenico`, `fi.c10.truth`.
- **Leaves and codex entries** are flags too (`fi.leaf.N`, `fi.codex.<id>`), so the Bottega's Codex Desk can read them.
- **`w.store`** holds per-module puzzle state only: wheels collected, mirror states, record bests.

**Replays (memory mode).**
- If `fi.cN.done` is set, the chapter runs in memory mode: dialogue reads the stored flags and never asks again, and collectibles and records stay live.
- Major choices are therefore made once. That keeps the story honest, and it means a verifier never sees two different answers.

**Rules.**
- `rules: { deny: ['board'] }` in every module. Hoverboards don't suit 1494.
- Glide, double jump, light and blade all work.
- Puzzles never *require* outside gear. Spring boots and Skyreach's glider only open optional lines.

**Rewards.**
- **No `w.coin` anywhere and no `addCoins`.** Coins buy Pim's items and might one day trade, and story rewards must not be farmable.
- Rewards are cosmetic items, one functional item (the Wing), titles and codex entries, all soulbound (§4, feature 3).

**Determinism.**
- **Tick and interact code:** all puzzle state, beam maths (2D reflections in the x/z plane), guard sight checks, chase paths, timers (`w.after`, `w.wait`), and placement of crowds and drifts (seeded `w.rand`).
- **`frame` code:** only lamp flicker, crowd bob, fire shells, bell swing, and Veil glow.
- Avoid `**` and `Math.pow`.

**Scale and look.**
- **Scale.** Florence is at about half scale. The dome stands about 45 m high to the lantern, the Palace tower 47 m, the Campanile 42 m.
- **Palette.** Ochre `#d9b77e`, sienna `#b8743a`, terracotta `#b5552f`, pietra serena `#7d8288`, pietra forte `#b49a6a`, white marble `#efe9dc`, green marble `#2f5a46`, Florentine red `#c0302a`, Medici gold `#d4a72c`.
- **Textures.** `plaster` (walls), `stone-blocks` (rusticated bases, towers), `marble` and `marble-check` (the Duomo, floors), `planks` (scaffolds, the pyramid, the platform), `gravel` and `grass` (garden, countryside), `cliff` and `mossy-rock` (hills), `metal` (clockwork).
- **Assets.** `barrels`, `bench`, `boulder`, `brass-lantern`, `wooden-lantern`, `gothic-statue`, `marble-bust`, `horse-statue`, `potted-plant`, `mossy-rocks`, `fern`, `tree-stump`. Don't use `street-lamp`; it is anachronistic.
- **Skies.** `afternoon-sky`, `day-sky`, `sunset-sky` and `night-sky`, plus painted overcast for the snow.

**The Florence kit.** Modules can't import, so a shared helper block is pasted into each module (see §4, feature 12, for build-time includes). It provides:
- `palazzo(x0, x1, z0, z1, h, opts)`: a rusticated base, plaster upper floors, a cornice and a roof;
- `casaTorre`;
- `roof(x0, x1, z0, z1, ridge, crumble)`: two ramps, terracotta;
- `loggia(cols, span, h)`;
- `tower(x, z, w, h, bellY)`;
- `tenter(x, y, z, yaw, power)`: a jump pad dressed as a wool drying frame;
- `crowd(area, n, seed, palette)`;
- `mirrorStand(x, y, z, states)`;
- `ladder(x, z, y0, y1)`.

**Item ids** are global, so all carry the prefix `fi-`.
- **Worn items:** `fi-ala` (the Wing; back, `glide`), `fi-lanterna` (hand, `light`), `fi-spectacles`, `fi-mazzocchio`, `fi-paradise-crown`, `fi-carnival-mask`, `fi-rain-hood`, `fi-cypress`, `fi-berretta` (head), `fi-volpaia-sun`, `fi-olive`, `fi-palm`, `fi-smeralda-lens` (hand).
- **Key items:** `fi-palla`, `fi-venus`, `fi-pinion`, `fi-token`, `fi-venus-original`, `fi-petrarch`, `fi-lute`, `fi-seal`.
- **NPC-only hats:** `fi-hood-dominican`, `fi-hood-franciscan`, `fi-cap-citizen`, `fi-cap-red`.

---

## 2. World API features used, by chapter

| Ch | Uses (all exist today) | Needs (see §3) |
|---|---|---|
| 1 | Solids with textures, `dome` spheres, a `portal` inside the Veil frame, `npc`, `say`/`ask`, `pickup`/`give` (key item), `interact` (mirrors, crank, lever), `zone` (beam target, ladder zones, scene triggers), `mover` (hoist), `crumble` (snow cornices), `particles` (snow), `light`, `checkpoint`, `player.freeze`, `shake`/`burst`, `input.attack` (ice), `setFlag`/`store`, `travel`, `on('enter', from)` | Bell sound; walkers (friars); breakables |
| 2 | + `jumpPad` (tenter frame), `mover` (swinging pans), slow zone (`player.setSpeed`), `canUse('light')`, `ask` with up to 7 options | Walkers (crowd surge); crowd; bell; theme transition (dusk) |
| 3 | + an item with `glide`, `equip`, mover rafts, `timer` + `record` (`fi-signal`), mirrors with two interacts (coarse/nudge) | Walkers (the procession); `horn` sound; bell; camera shots |
| 4 | + slide zones (`wind` pushing down-slope), crumble bricks, a rope `mover` removed mid-chase, `record` (`fi-dome-chase`), a show/hide decal (the sword) | Chase walker; timed `say`; crowd-noise sound |
| 5 | + looping circular `mover` paths (the Paradise rings), `jumpPad` (frames, awning), `pickup` (crown), `record` (`fi-roof-chase`) | Chase walker; crowd pose swap (cheap: two crowd sets, hide/show) |
| 6 | + flats as pre-built copies toggled with `hide`/`show`, guard checks in tick, `respawn` | Stealth walkers with cones; viewpoint; image card |
| 7 | + `wind` (heat column), timed hazard/crumble enabling (`zone.enabled`, `hide`/`show`), `equip('fi-ala')`, three pickups where taking one removes the others, `checkpoint` | Theme transition; bell and horn; walkers (procession) |
| 8 | + light-trait detection, lever sequences (interact), whisper zones (`onStay` plus `say`), an escort | Walkers (escort, guards, lure) |
| 9 | + static yaw-turned figures, breakable pinions (`input.attack`), the dispute schedule (`w.after`), rain as **`particles` kind `snow` at speed 14**, a rescue timer | Theme transition (storm); walkers; thunder sound |
| 10 | + stealth, crumble, a counterweight `mover` created at runtime, rhythm strikes (`input.attack` timing), followers | Walkers (followers); bell |
| 11 | + long glides, looping raft movers, circular mill-wheel paddles, `wind` (mill races), `player.boost` (skiff), `record` (`fi-river-chase`), an `ask` whose options are built from flags | Theme transitions (sunset → night → dawn); epilogue cards |

---

## 3. New engine features, ranked

Each feature has its **cheapest version that works today or with a tiny patch**, then the proper one.

1. **Walkers: moving NPCs on paths, with sight.** Used in every chapter: friars, crowds surging, chase targets, guards, an escort, boys following.
   - **Cheap:** `w.avatar` for the look, moved in `frame` from a position computed in `tick` along a polyline (deterministic). The guard's cone test runs in tick: angle, distance, and 2D occlusion against stack rectangles. To talk to a moving NPC, move a `w.interact` with it (this relies on `interact().pos` being a live Vector3; fragile).
   - **Proper:** `w.walker({ path, speed, loop, pause, look, cone: { angle, range }, onSee, onTalk })` returning `{ moveTo, follow(target, gap), stop, hide, show }`, with walk and run animation from speed; plus `npc.moveTo` and `npc.hide`.
2. **Bells and custom sounds.** The story's voice: la Vacca, the Ave Maria, the Piagnona, trumpets, a crowd gasping and roaring, thunder.
   - **Cheap:** add synthesized `bell` (with `{ pitch, volume }`), `horn`, `crowd` and `thunder` to `audio.js`, allowing `w.sound(name, opts)`.
   - **Proper:** positional sounds (`pos`) and CC0 sound assets pinned like models.
3. **Story services: codex, titles, soulbound items.** Required by the brief's reward rules.
   - **Cheap:** codex and Leaves as flags, read at the Bottega's Codex Desk through `w.say`. Titles as flags shown on the Wall of Titles. Items marked with a `bound` trait.
   - **Proper:**
     - `w.codex.add(id, title, text)` and `openPanel('codex')`;
     - `w.title(id, text)`, a soulbound title shown on the nameplate;
     - an item field `bound: true` that the coming ownership and trading layer must refuse to transfer. **Decide this before trading ships.**
4. **Runtime theme transitions.** Dusk in Chapters 1, 2 and 7, the storm in 9, sunset to night to dawn in 11.
   - **Cheap:** a fixed theme per module, with mood carried by `w.light` and particles. Rain already works as fast `snow` particles.
   - **Proper:** `w.setTheme(partial, seconds)`, lerping sky colours, fog, sun direction and colour, exposure, and switching `sky` HDRIs with a crossfade. Presentation only, so replays ignore it.
5. **Camera shots and viewpoints.** For cutscenes (the King's entry, the sermon) and perspective puzzles (the Painted Wall, Uccello's dial, the projection).
   - **Cheap:** `freeze`, set the yaw, and design anamorphic art for the default third-person camera.
   - **Proper:** `w.camera.shot({ from, at, seconds })`, a letterbox, and `w.view({ from, at, fov })`, a first-person lock while frozen. All presentation only.
6. **Campaign grouping.** Twelve story modules must not become twelve portals in Junction.
   - **Cheap:** add the `fi-*` ids to `known` in `hub.js`, and place one dressed portal for `florence`, framed as a painted Ideal City panel.
   - **Proper:** a registry field `unlisted: true` or `group: 'florence'`, exposed in `w.worlds`.
7. **Crowds.** Six chapters have 200–700 onlookers.
   - **Cheap:** merged static cylinders and spheres (`collide: false`), placed with a seed. A pose swap is two pre-built sets toggled with hide/show.
   - **Proper:** `w.crowd({ area, count, seed, palette, poses })`, instanced, with frame-time sway.
8. **Breakables.** Ice, pinions, a chest hatch, a wedge, a barrel.
   - **Cheap:** copy Junction's dummy logic: nearest target within 2.6 m on `input.attack`, hp, blade ×8.5.
   - **Proper:** `w.breakable({ pos, hp, onBreak })`, with the strike target chosen by the engine.
9. **Timed dialogue and image cards.** Sermons, overheard talk, the Venus close-up, the ledger page.
   - **Cheap:** split the lines across `await w.wait()`, and render cards as text in `say`.
   - **Proper:** `w.say(name, lines, { auto: s })`, and `w.card({ image, text })` with images from the asset library.
10. **Rotors.** Mill wheels and the Paradise.
    - **Cheap:** looping circular `mover` paths, one mover per seat or paddle. This works today, though seats don't tilt.
    - **Proper:** `w.rotor({ center, axis, radius, speed, parts })`, kinematic and rideable.
11. **Ladders and climbing.**
    - **Cheap:** a narrow zone where `input.move[1] > 0` pushes the player up at 3 m/s.
    - **Proper:** `w.ladder({ pos, size })` with a climb animation.
12. **Build-time includes** for the Florence kit. A tooling feature: `// @include kits/florence.js`, inlined before hashing, so the pinned module is still one file.
13. **Portal looks.** `w.portal({ look: 'none' | 'frame' })`, so the Veil's frame is the only frame. **Cheap:** build the frame around the standard ring.
14. **Period characters.** Rigged friars and citizens.
    - **Cheap:** robot NPCs with world-defined hood and cap items and story colour palettes.
    - **Proper:** CC0 rigged characters, added through `assets/characters.json`.

---

## 4. Vertical slice: Chapter 1 first

**Goal.** Prove the campaign's architecture and its feel in one playable, verifiable hour: the hub and chapter structure, travel, flags, the Veil, an optics puzzle, the backward clock, and a set piece.

**Scope.**
- **`florence`** (the Bottega):
  - all five floors and the altana;
  - the Veil portal;
  - the Light Bench (Puzzle 1), the hoist, Masino;
  - the Chapter Door, the Codex Desk (cheap version), and the Wall of Titles (flags).
- **`fi-01-snow`:**
  - the bridge, Por Santa Maria, a slice of the Signoria, Calzaiuoli, Piazza del Duomo, the Duomo's inner façade and clock loft, Via Larga, and the Medici courtyard;
  - Puzzles 2 and 3, the Savonarola scene, the snow giant.
- **Out of scope:** walkers (the friars stand as a static tableau with breath particles), theme transitions (a fixed overcast, with dusk faked by window lights), and custom sounds beyond one synthesized `bell` (patch feature 2's cheap version first; it's tiny and the chapter ends on the Ave Maria).

**Milestones.**
1. **The Bottega greybox.** Floors, stairs, the hoist and the Veil portal. Check: arriving from Junction lands 4 m in front of the Veil, and leaving through it returns to Junction.
2. **Light Bench.** Mirror states in `store`, the beam in tick, beam boxes in frame. Check: a proof that solves it replays with the same final state.
3. **Travel loop.** The Chapter Door goes to `fi-01-snow`, and the end goes back to the Bottega at the door. Check: `on('enter', from)` places the player correctly both ways, and `fi.c1.*` flags survive the trip.
4. **The city greybox.** Kit buildings along the route, snow, the Ponte Vecchio, crumbles, the Leaves.
5. **The clock.** Ice breakables (cheap version of feature 8), the weight shaft, a crank with 24 states, the wind-back lever, a peephole showing the mirrored back of the dial.
6. **The courtyard.** The snow giant, four mirror stations, answers that depend on `fi.c1.crystal`, ladder zones, the soft timer, the blaze set piece.
7. **Dialogue pass.** All of Chapter 1's lines, the two `ask`s, `fi.c1.answer` and `fi.c1.crystal`; the title and spectacles awarded.
8. **Dress and light.** Textures, assets, lamps, particles, the skyline backdrop.

**Test plan.**
- Record proofs with `tools/proof_test.py` for four paths: each of the three Veil answers, and both crystal choices. Verify with `node tools/verify.mjs`.
- Run a random-input fuzz pass for determinism (as for the existing worlds).
- `tools/shot.py` screenshots at the altana, the clock face and the blazing giant.

**Acceptance.**
- A new player reaches the blazing giant in under 40 minutes with no external help.
- Every proof verifies.
- The Bottega reflects Chapter 1's flags on re-entry.
- No `Math.random`, `Date`, timers or `**` anywhere (the build enforces this).

**What it de-risks.** Multi-module travel, flags as story state, memory-mode replays, the cheap codex, and the beam maths reused in Chapters 3, 4 and 11. Feature 2 (bells) should land in the slice. Feature 1 (walkers) should be specified during the slice and built before Chapter 2, which needs crowds that move.
