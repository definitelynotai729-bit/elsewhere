# THE LONG LIGHT: build notes

## Modules, ids and state

**Modules:**
- `vellum-rumour`: Chapter 1, and the hub once `vellum.ch ≥ 1`.
- `vellum-vitrine`: Chapter 2, and Chapter 10 once `vellum.ch ≥ 9`.
- `vellum-skerrow` (3), `vellum-amaranth` (4), `vellum-pelagia` (5), `vellum-ammonite` (6), `vellum-cinder` (7), `vellum-plenary` (8), `vellum-scriptorium` (9).

**State.**
- **Global flags** (`vellum.*`) carry the story between worlds: the README choice table, plus `vellum.ch` (last chapter done), `vellum.debrief`, `vellum.codex.<id>`, `vellum.words.<WORD>` and `vellum.moths`.
- **Per-world `w.store`** holds only local puzzle progress (bags, clamps, mirrors, rings, vanes).

**Items** (all bound, each declared in the module that first gives it):
- Head, cosmetic: `vellum-cap`, `vellum-charm`, `vellum-lens`, `vellum-visor`.
- Back, cosmetic: `vellum-mantle`.
- `vellum-sled` (board), `vellum-step` (feet, doublejump), `vellum-veil` (back, glide).
- `vellum-blade-elsewhere` / `-aurora` / `-lane` / `-noon` (hand, blade and light).

Key items are slot null, traits `['key']`, and are always taken back by story code: `vellum-mailbag`, `vellum-bundle`, `vellum-hilt`, `vellum-half-a`, `vellum-half-b`, `vellum-heartglass`, `vellum-forty`.

**Currency.** None: no coins anywhere.

**Determinism.**
- Every schedule (flares, sparkers, searchlights, Assent Hours, lightning, tide) is a function of `w.ticks` or of seeded `w.rand` draws made in `build`.
- Gameplay movement (sentries, Tern, Leth) is stepped in `tick`; `frame` only interpolates.
- The leap, swarms, aurora and paper are visual only.

## World-side kits (write once, copy into each module)

Worlds can't import code, so each module carries the kits it needs. Keep them as one clearly fenced block per kit so a fix can be copied across.

1. **Talk kit.**
   - `call()` returns `w.flag('vellum.call') || 'Stranger'`, and `fmt(line)` substitutes `{call}`.
   - `scene([[speaker, line], ...])` groups consecutive lines by speaker into sequential `w.say` calls.
   - `choose(name, q, opts, { esc })` wraps `w.ask` and maps −1 to the stated default, or asks again.
2. **Codex and words kit.**
   - `codex(id, title, text)` sets `vellum.codex.<id>` once and toasts *Codex: title*.
   - `word(W)` sets `vellum.words.<W>` and toasts *Pockets learned "W"*.
   - Both are recorded inputs, so both are verifiable.
3. **Sentry kit** (Ayes).
   - **State:** a waypoint path, facing, speed, a pause and turn schedule, and a detection meter.
   - **Vision:** a cone plus line of sight: a 2D segment-vs-box test against the module's cover boxes, until `w.raycast` exists (feature 4).
   - **Caught:** a callback, usually a toast and `player.setPos(lastHide)`.
   - **Look:** an ivory, grey and gold `w.avatar`, with tabard parts parented in `frame`.
4. **Combat kit.**
   - **Enemies** carry HP. Strike resolution copies Junction's dummies: nearest enemy within 2.6 m on `w.input.attack`, damage by the `blade` trait.
   - **Their attacks** are telegraphed strips (a glow mesh for N seconds, then a hazard test for M seconds).
   - **Player hearts** are a world counter shown through `w.objective` text until a HUD meter exists (feature 4).
5. **Companion waypoints.** An NPC teleports to the next waypoint when the player passes a zone and it is out of view. This is the cheap stand-in for NPC movement (feature 3).
6. **Memory-bridges** (Chapters 6 and 9).
   - Box handles with `hide()`/`show()`, and a per-tick distance test from the player to each AABB.
   - They show within 5 m if `player.canUse('light')`, and hide 1.5 s after the player leaves.
7. **Beam tracer** (Chapters 3 and 7).
   - Grid-direction rays bounce between mirror stations; the drawn segments are pooled box meshes.
   - It is pure math, recomputed when a station changes.
8. **Water level** (Chapters 4 and 5). `waterY(t)` is a function of ticks. `tick` respawns the player when `player.y < waterY`, and `frame` moves the sea mesh.
9. **Hazard riders.** A hazard that follows a mover or a schedule is a `tick` test against a computed box, until zones can move (feature 6).

## Per-chapter use of the World API

Every chapter uses the basics: solids and textures, lights, particles, signs, npc, zone, interact, checkpoint, `give`/`take`/`equip`, flags, `say`/`ask`/`banner`/`objective`, `sound`/`burst`/`shake`, portal home. Beyond those:

- **1 Stowaway.**
  - *Uses:* `mover` (crane hook), `wind` (vents), dome sphere, `timer` (gavel), `setKillY`.
  - *Kits:* talk, codex, sentry, hazard riders.
  - *Needs:* **nothing new.**
- **2 Vitrine.**
  - *Uses:* `boostPad`, `crumble`, `jumpPad`, `wind`, hazard shards, `forceBoard`, assets (`desert-boulder`, `barrels`).
  - *Kits:* sentry.
  - *Needs:* nothing, though 1 should ship first.
- **3 Skerrow.**
  - *Uses:* `crumble`, `wind`, mirror interacts, `hide()` (grate), mover (falling ice).
  - *Kits:* sentry, beam tracer, combat (the spar).
  - *Better with:* 3, 5.
- **4 Amaranth.**
  - *Uses:* zones on pillar caps, `timer`, moth pickups, `wind` (fire plumes), movers (branches), assets (`fern`, `jacaranda`, `dead-trunk`).
  - *Kits:* companion waypoints.
  - *Better with:* 3, 8.
- **5 Pelagia.**
  - *Uses:* raft and gavel movers, `crumble` nets, the tide timer, storm `wind`.
  - *Kits:* water level, combat.
  - *Needs:* **8** (storm; fallback: dusk throughout) and **4** (hearts; fallback: objective text).
- **6 Ammonite.**
  - *Uses:* `hide()`/`show()` bridges, loop movers (racks), vents, `crumble`.
  - *Kits:* memory-bridges.
  - *Better with:* 5, 8.
- **7 Cinder.**
  - *Uses:* a star sphere via `w.add`, furnace `wind`, ring interacts, mover streaks.
  - *Kits:* beam tracer, combat, hazard riders (flares).
  - *Needs:* **7** (fallback: a down-force wind).
- **8 Plenary.**
  - *Uses:* box rails, `boostPad`, `jumpPad`, movers (trams, shelves, platen, belts, lift), `w.spin`.
  - *Kits:* sentry (freezes for the Assent Hour).
  - *Needs:* **9** (fallback: 800 particles).
- **9 Scriptorium.**
  - *Uses:* loop mover (paternoster), vents, quill strips, `hide()`/`show()` tiles.
  - *Kits:* combat (boss), memory-bridges.
  - *Needs:* **4**, **5**, **8**.
- **10 Margins.**
  - *Uses:* `record('dune')`.
  - *Needs:* **2** (fallback: a cosmetic and a codex line).

## New engine features the story needs (ranked)

Each feature has the cheapest version that would unblock the story. Chapter 1 needs none of them.

**1. Campaign plumbing.**
- *Problem:* Junction auto-opens a portal for every registered world, so ten chapter worlds would clutter it and let players skip ahead.
- *Cheapest:* a module field `hidden: true` that the registry keeps and Junction's auto-portal loop skips, plus one hand-placed Junction portal ("THE LONG LIGHT") to `vellum-rumour`. Each chapter world checks its prerequisite in `enter` (`vellum.ch ≥ n−1`), and otherwise toasts "This chapter isn't open yet" and calls `w.travel('vellum-rumour')`.
- *Better later:* `campaign: { id, chapter }` metadata, a campaign card in the M panel, and "continue" routing.

**2. Soulbound rewards: bound items, codex, titles.**
- *Problem:* story rewards must never be tradable, and the codex and titles have no home yet.
- *Cheapest:*
  - `bound: true` in an item definition. The ledger refuses to list or transfer it; until trading exists it is only a marker on the item card ("Bound: earned in The Long Light").
  - The codex reads global flags with the prefix `<world>.codex.` and shows them in an items-panel tab, using titles and text the world declares in a `codex` map in the module.
  - A title is `w.title(id, text)`, stored as a flag `title.<id>`. The profile picks one, and the nameplate shows it.
- *Fallback today:* the hub's codex terminal reads the entries back through `w.say`, and titles are given as cosmetic badges.

**3. NPC actors.**
- *Problem:* NPCs are fixed in place, with a static collider and an interact at a fixed point. The story wants a walking Brack, a following Quaile, a racing Tern, a barefoot Leth crossing a bridge, and Pockets trundling after you.
- *Cheapest:* make `w.npc` return `{ setPos(p, yaw), moveTo(p, speed), face(p), hide(), show(), anim(state) }`. Movement is stepped in `tick`, with the collider and interact centre moving together. The anim state reuses the avatar's idle, walk, run and use clips.
- *Also:* `scale` for knee-high Pockets, and `parts` for custom looks (the Myrr swarm is particles parented to the NPC).

**4. Enemy kit: line of sight, hit points, hearts.**
- *Problem:* stealth and combat run in six chapters. World-side code can do it (Spire Clash does), but every module would repeat the same maths.
- *Cheapest:*
  - `w.raycast(from, to)` → `{ hit, point }`. Rapier's ray cast is deterministic.
  - `w.meter(id, { value, max, icon })`, a small HUD pip row for hearts and boss health.
  - The sentry and combat kits stay world-side; documenting them as a copy-paste snippet in WORLD_API.md is enough.

**5. Scripted camera beats.**
- *Problem:* the set pieces want a held shot: Errata's leap, Quaile waking, the spiral lighting, the lamp firing.
- *Cheapest:* `w.camera.focus(target, { from, seconds })` with the player frozen, plus letterbox bars. It is presentation only (not in the replay), and Esc skips it. A replay is identical because only the freeze (tick-driven) affects play.

**6. Controllable movers and movable zones.**
- *Problem:* lifts that wake when power returns, a gavel ramp that leaves, a raft cut loose, a platen that slams on cue, hazards that ride things.
- *Cheapest:* `w.mover` returns `{ pause(), resume(), goTo(i) }`. Zones and hazards get `setPos(p)` and `enabled` (the runtime already has `enabled` and a mutable centre: document and support them).

**7. Runtime rule zones.**
- *Problem:* Redactors' quench fields switch off stilled light. Without them, Chapters 7 and 9 fake it.
- *Cheapest:* `w.rules.deny(trait)` and `w.rules.allow(trait)` at runtime, called from zone `onEnter` and `onExit`, recorded like equips.

**8. Mid-world theme and music changes.**
- *Problem:* the Unlit after lighting out, dusk to fire on Amaranth, day to storm on Pelagia, and four ending moods.
- *Cheapest:* `w.theme(partial, seconds)` lerps sky, fog, sun and bloom, and `w.music(partial)` swaps scale and tempo at the next bar. Both are presentation only.

**9. Particle kinds and volume.**
- *Problem:* lane-light streaks (Chapters 1 and 7) and forty million slips of paper (Chapter 8).
- *Cheapest:* `kind: 'streak'` (stretched along a velocity) and `kind: 'paper'` (flat quads that tumble), with a count cap of about 3,000 at high quality that scales down on phones.

**10. Dialogue polish.**
- *Problem:* long multi-speaker scenes.
- *Cheapest:* `w.say` accepts `[[speaker, line], ...]` in one dialog, with an optional speaker colour. It is purely UI, so replays are unaffected.

## Vertical slice: Chapter 1, Stowaway

**Why first.**
- It needs **no new engine features**.
- It is one compact 72 m ship, and it builds the **hub** every later chapter returns to.
- It exercises every core system:
  - branching dialogue and cross-world flags;
  - sight-line stealth, and drones that can't see you;
  - carrying key items;
  - a timed hull set piece;
  - codex, words and a bound reward.

**Build order.**
1. **Ship shell** from the layout table (hold, mail room, decks, bridge, blister, dorsal hull), with flat colours first and textures later. Hesk's gantry and the lamp as décor. `killY: -30`.
2. **Talk kit and flags.** The arrival → Brack → Errata → galley chain on placeholder geometry. Check that `vellum.call`, `vellum.errata.vouched` and `vellum.c1.door` survive a reload.
3. **Sentry kit.** A1–A3 (35°, 8 m, 0.5 s, line of sight against crate boxes), the visor tint, and caught → last hide spot.
4. **Censors.** Two loops, and the bump toast. Test the "they can't see me" moment on someone who hasn't read this doc.
5. **Bags and the cold box.** One bag at a time. Then the crane hook and the mail chute.
6. **Escalation.** Vane, Leth and Brack on the intercom, with the player frozen.
7. **The hull.**
   - The searchlight band and shadow boxes.
   - The sparker lanes on a tick schedule.
   - Clamp interacts.
   - The gavel timer, plus the bow Ayes if it expires.
   - The Moderator broadcast.
8. **Lighting out.**
   - Edge hazards, aft wind, streaks.
   - Errata's leap: a `frame` arc, but a tick-scheduled landing.
   - Hatch → banner, burst, `setPos` inside, Unlit state.
9. **Galley and the Nowhere Lens.** The shard scene, the portal to `hub`, `vellum-cap`, `vellum.ch = 1`.
10. **Hub mode.** The star map (only "Stay aboard" until Chapter 2 exists), the codex terminal, crew placement.
11. **Polish.**
    - Nine codex entries and three words.
    - Lights: amber hold, warm mail room, red hull alert.
    - Sounds: `open`, `pickup`, `crumble`, `win`.
    - Dust and streak particles.

**Acceptance criteria.**
- A first-time player finishes in 25–35 minutes, and knows within a minute that drones can't see them and soldiers can.
- Every detection is explainable: the player was in the cone, in line of sight, for 0.5 s.
- There are no unwinnable states:
  - bags are never lost;
  - released clamps stay released;
  - an expired gavel timer only makes the hull harder;
  - Esc resolves every `ask`.
- Replays verify. Record proofs (`tools/proof_test.py`), check them with `node tools/verify.mjs`, and run the Chromium/WebKit battery, for:
  - a clean run;
  - a run caught by each Aye;
  - every callsign and Errata choice;
  - Esc on every ask;
  - an exit through the Nowhere Lens.
- `npm run build` passes the determinism lint.
- The phone survey stays within Junction's frame budget.
- Re-entering after completion spawns in the hub's Unlit state, and the Nowhere Lens returns to Junction.

**Allowed stubs.**
- Brack and Errata stand still (no walking).
- The Unlit switch is a hard cut.
- There is no camera shot on the leap.
- The codex is read back at the galley terminal.
- The title is a toast plus the cap.

**Estimate.** About 1,200–1,600 lines (Glowcave is 732), mostly layout and the sentry kit. The kits (talk, codex, sentry, hazard riders) carry into every later chapter.

**Next.**
1. Feature 1 before Chapter 2, so chapters don't appear in Junction.
2. Chapter 2, which reuses the sentry kit and adds the sled run.
3. Feature 2 before the first blade is given in Chapter 3.
