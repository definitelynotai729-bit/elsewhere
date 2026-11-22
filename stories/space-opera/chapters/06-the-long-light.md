# Chapter 6: The Long Light

**World module:** `vellum-ammonite`.
**Where:** the Ammonite, the Lightkeepers' archive. A spiral station drifting dark in the Hush nebula.
**Rules:** `deny: ['board']`.
**Theme:** the Hush: near-black violet, `stars: 0.15`, faint nebula (four huge translucent spheres, opacity 0.06, violet and teal, `fog: false`). Interiors are dark until relit; `fog [20, 140]`.
**Music:** phrygian, root 48, 50 bpm, sparkle 0.1. After the Heartglass: lydian, 66 bpm, sparkle 0.5.
**Playtime:** 45–55 minutes.

## Premise

Going into the Ammonite is going back in time. Its chambers were added one by one as the record grew: the newest at the mouth, the oldest at the heart. The floors of the inner rooms fell away decades ago. The station still remembers where they were.

## Layout

The spiral turns inward around the **core** at [0, 10, 0]. The chambers are rounded rooms of curved shell-plate (`plaster`, bone and nacre, rough 0.3). The **siphuncle**, a glowing tube 3 m across, pierces every dividing wall (septum), so the way on is always the light across the room. The void below falls to `killY −40`; you respawn at the chamber's entry.

| chamber (era) | centre; size (x×y×z) | what's in it |
|---|---|---|
| Mouth (dock) | [90, 0, 60]; 24×12×20 | The *Rumour* docks at the outer lip. Spawn [86, 0, 52], yaw 220. |
| **VII The Dimming** (60 years ago) | [70, 0, 20]; 44×20×44 | Floor blown out. Black **quench-scars** (thin black bars) on the walls. **Memory-bridges** over the void. |
| **VI The Clamour** (92–62 years ago) | [20, 0, −40]; 36×18×36 | Six **drifting record-racks** on loop movers, memory-bridges, and war-light flickering on the walls. |
| **V Saltglass** (92 years ago) | [−35, 0, −10]; 30×16×30 | An amphitheatre: a floor ring (radius 10–15) with west and east lens-stands, a void ring (3–10), and a **central island** (radius 3) holding the projector. |
| **IV The Lamps** (~300 years ago) | [−30, 0, 40]; 26×30×26 | A tall chamber hung with lamp models. Three **vents** (updrafts). The exit septum is high, at y 24. |
| **III First Light** (~400 years ago) | [5, 10, 25]; 18×12×18 | The oldest room: a lattice of old glass (crumbling tiles) and the founders' inscription. |
| **Core** | sphere room, radius 7, at [0, 10, 0] | **The Heartglass**: a faceted stone (ico, radius 0.8, glow 3) on a cradle at [0, 11, 0], slowly turning. |

**Sightlines.**
- At the mouth you look down the spiral's throat: a chain of dim septum-lights curving away inward like a nautilus.
- After the Heartglass is lifted, every chamber lights in sequence, outward, and the spiral can be seen whole from the core's window, on the camera side.

## The Ammonite's signature mechanic: memory-bridges

- Where a floor or walkway used to be there is a faint outline: a 2 cm glowing edge, barely visible.
- A **memory-bridge** is a box (collider plus translucent mesh, `opacity 0.35`, glow 1.4, in your blade's colour) that is *shown* (`show()`) whenever a light-trait holder stands within **5 m** of its nearest point, and *hidden* again 1.5 s after they leave that radius.
- **What it means for play:** the bridge exists around you and behind you briefly, then fades. You walk a road that remembers itself as you walk it.
- Implement in `tick` with a list of bridge boxes and their AABBs. It is deterministic.
- **If the player's light is put away**, the bridges stay dark, and a toast nudges: *"The floor remembers light. Hold your blade."*

## Encounters

None hostile. The Ammonite is empty. The danger is the void under the forgotten floors, and the past, which walks among you.

## Objectives and critical path

1. Dock. Enter the Dimming. Learn memory-bridges.
2. Cross the Clamour on drifting racks and bridges.
3. **Saltglass:** recover both halves of the record and join them at the projector. Watch the whole truth.
4. Climb the Lamps by the vents.
5. Cross First Light. Read the founders' words.
6. Lift the Heartglass. Thousand's choice. Leth's broadcast.

## Puzzles and solutions

**P1: VII, the first bridge.** A straight 30 m memory-bridge to the far septum. Its left spur leads to a codex, a remark and MIND THE GAP. Behind you the bridge fades, and ahead it brightens; nobody falls unless they put the blade away.

**P2: VI, the drifting racks.**
- **The racks.** Six platforms (4×1×4) circle at radius 12 (loop mover, 0.9 m/s, at y 0, 2 and 4). Memory-bridges join three wall stubs.
- **The route.** Stub A → ride a rack a quarter-turn → bridge to B → rack → C, the exit.
- **Thousand's shortcut** (only if `vellum.moths ≥ 9`): Thousand says "We remember a walkway here," and a hidden memory-bridge appears straight from stub A to C.

**P3: V, joining Saltglass** (the core puzzle).
- **Half A, "the shooting"** (a half-disc, key item `vellum-half-a`), is on the **west stand**. It is easy to take.
- **Half B, "the forgery"** (`vellum-half-b`), is on the **east stand**, sealed behind a **quench-scar**: a slab of black glass (2×3×0.4) with Quaile's mark etched in it. Three blade strikes shatter it.
  - **Quaile:** "My seal. Break it. I'd rather you did it than me."
- **The island.** The central island is reached only by a memory-bridge across the void ring (7 m).
- **The method.** Carry one half at a time (key items, one in hand) across the bridge, and set it in the projector (F · *Set the half*).
- **When both are set,** the projector plays the full record (the set piece). The two half-discs are taken back (`w.take`), and you carry nothing out.

**P4: IV, the vents.** The exit is at y 24. Three updrafts (`w.wind`, 4×26×4, force [0, 24, 0]) rise from floor grilles.
- **If `errata = 'kept'`:** Errata reads the lamp-model's old control ("an old format, a very old format, how lovely") and opens the high shutter. The route is vent 1 → a short glide to the shutter.
- **If `'reset'`:** Errata can't read it ("It has lovely handwriting!"). The shutter stays closed, and you take the long route: vent 1 → ledge (y 10) → vent 2 → ledge (y 18) → a Second Step plus a glide across a 9 m gap → vent 3 → the exit ledge.

**P5: III, the lattice.** Twelve old glass tiles over the void (`w.crumble`, delay 0.45, respawn 4). Two memory-bridges fill gaps where tiles have already fallen. The inscription is on the far wall.

## Set piece 1: Saltglass, whole

When both halves are set, the lights in V go out. The projector throws life-size translucent figures across the whole amphitheatre floor, in sequence. You can walk among them. Each scene is 6–10 s, with a `w.say` line where marked.

1. **A workshop at night.** A man paints light onto glass. **Forger:** "Make the soldiers' faces clear. People need faces to hate."
2. **The Brinewell.** A crowd holds up the painted glass. **Crowd** (many voices): "The well! They poisoned the well!"
3. **The garrison.** Young soldiers at a gate, terrified. **Officer:** "Hold! Hold your fire!" A single flash. Then many.
   - The violence is abstract: white flashes and falling silhouettes, then silence (T-rating).
4. **Night. Young Quaile** in the forger's workshop. She finds the painted glass and stills both scenes, then cuts. **Ghost Quaile:** "Keep this half."
5. **Sixty-two years ago, this chamber.** A grey-streaked woman of fifty alone at this projector, watching both halves together.
   - **Ghost Benedikta:** "Orla. You fool. Everyone's a fool."
   - **Ghost Benedikta:** "If one true half did this, a whole truth will do worse. No one sees either. Ever."
   - She takes both halves out with her. The lights come back up.

## Set piece 2: the spiral lights

- **F · Lift the Heartglass.** `shake 1.5`.
- Light runs outward along the siphuncle: the core, then III, IV, V, VI, VII and the mouth. Each chamber's lights switch on 0.6 s after the one before, with a rising chime (sound `open` at increasing pitch where supported, otherwise `gem`).
- Every memory-bridge in the station shows at once, permanently: the whole old architecture is visible, floors and walkways and stairs, solid light.
- Banner: **THE LONG LIGHT**.
- Then a voice comes over every lamp-glass in the station.

## Collectibles and codex

**Pockets' words.**

- ALWAYS (key): III, the founders' inscription
- MIND THE GAP: VII, the left spur
- ARCHIVE: V, over the west stand

**Codex.**
1. **The Ammonite** (the mouth). *"The Lightkeepers' archive: a spiral station whose chambers were added as the record grew, newest at the mouth, oldest at the heart. Quenched and hidden in the Hush at the Dimming."*
2. **Memory-Bridges** (the first bridge). *"The Ammonite remembers its own floors. Bring light where a walkway used to be and its light stands up again, solid as the day it was stilled."*
3. **The Hush** (arrival). *"A dark nebula with no lamps at all. Pelagian pilots crossed it by chart and song."*
4. **The Clamour, in Its Own Light** (VI). *"Thirty years of records used as weapons, each world projecting its half at another world's lamps. The war was fought in pictures."*
5. **Moderator's Remark No. 38** (VII, a quench-crew recorder dropped sixty years ago, still looping). *"'Peace is a quiet room with the door closed gently.'"*
6. **Saltglass, Whole** (V). *"A forgery sent the crowd. Panic fired the guns. A Keeper showed only the guns. Everyone in the Clamour showed only the half that made them right."*
7. **Benedikta, Alone** (V). *"Sixty-two years ago, at the end of the Clamour, Benedikta Sallow watched both halves of Saltglass in this chamber and decided nobody should see either. The Unanimity began here."*
8. **Always One More Lamp** (III). *"'We will not always see clearly. We will not always say well. But there is always one more lamp in the dark, and someone to keep it.' —the first Keepers"*
9. **The Heartglass** (the core). *"The master record of the Long Light, every stilled witness in one stone. Lifting it lit every lamp in the Vellum for a heartbeat."*

## Dialogue

### Arrival
Banner: *Chapter 6 · The Long Light*.
- *(Saved:)* **Tern:** "Three bends past the Weeping Star. The unlit lane by the dead lamp. And... there. The shell."
- *(Chased:)* **Thousand:** "The lens says: here. We are reading it as well as we can. It is very small writing."
- **Quaile:** "Sixty years. Nobody's been in. It's waited."
- **Brack:** "It's a seashell the size of a city, and it's dark. I'll keep the engine running."
- **Errata** *(kept)*: "The record, Captain. All of it. I have dreamed of rooms like this, if clerks dream." / *(reset)*: "Oh! A filing system shaped like a snail! Wonderful!"
- *Objective:* "Go inward. Back in time."

### VII, the Dimming
At the void's edge:
- **Quaile:** "The Ayes blew the floors out when they quenched it. Thought they'd make it unwalkable."
- **Quaile:** "But it's ours. It remembers. Hold your light near the edge and walk."
- *(On the first bridge appearing:)* **Quaile:** "Fourth form, nearly. The Witness: you read what the light remembers. Here, the light remembers a floor."
- *(If you stop mid-bridge:)* **Quaile:** "Don't stand in the middle admiring it. It's a floor. Floors are for crossing."

### VI, the Clamour
- **Thousand:** "We remember this war. We were very small. Every lamp was showing something terrible to someone."
- *(If moths ≥ 9:)* **Thousand:** "We remember a walkway here. Hold your light... *there*."
- **Brack** (comm): "How's the snail?" **Quaile:** "Haunted. Fine."

### V, Saltglass
On entry:
- **Quaile:** "This is it. Saltglass. Both halves were brought here, in the end. I brought the first. Someone else must have brought the second."
- *(At the east stand:)* **Quaile:** "My seal. Break it. I'd rather you did it than me."
- *(The full record plays: see the set piece.)*

After the record, by Quaile's stance:
- *(absolve)* **Quaile:** "I still think the shooting was the truth that mattered. I think I'm wrong. I think I've been wrong for ninety years and called it being right."
- *(challenge)* **Quaile:** "You said it in the garden. Editing. She said it here. You were both right, and I was the last to know."
- *(forward)* **Quaile:** "Now, you said. Fine. Now I know what I did, whole. That's new. That's... now."
- **Quaile:** "She wept. Benedikta. I never saw her weep in her life. 'Everyone's a fool.' She was right about that too."

Brack, over the comm:
- *(If `brack.letter = 'read'`)* **Brack:** "'Forgive me, Orla.' That's what she was weeping about. All those years."
- *(If `'kept'`)* **Brack:** "...I've a letter. In my own hand. From the night of the signing. She said, 'Forgive me, Orla.' I didn't tell you. I'm telling you now." →`vellum.brack.letter = 'shared'`
- **Quaile:** *(a long silence)* "...Forgive *me*, she said. As if she was the one who cut it."

**Errata, if spoken to here:**
- *(kept)* "Two halves, one record. I have filed it under 'whole'. It is a short category."
- *(reset)* "I don't understand any of it, but I feel very sad, which I gather is correct."

### IV, the Lamps
- *(kept)* **Errata:** "An old format. A very old format. How lovely. One moment." *(The shutter opens.)*
- *(reset)* **Errata:** "I can't read this, but it has lovely handwriting!" **Quaile:** "The long way, then. Up the vents."

### III, First Light
At the inscription:
- **Quaile:** "The first Keepers wrote that. Before ranks, before blades, before any of us thought we were grand."
- **Quaile:** "'We will not always see clearly.' We should have had it tattooed on our hands."

### The core
At the cradle:
- **Quaile:** "The Heartglass. Every witness we ever stilled. Four hundred years in a stone you can hold in one hand."
- **Quaile:** "It answers to an unsealed hand. Mine's shaking. Yours isn't. Lift it."
- *(F · Lift the Heartglass. Set piece 2. Key item `vellum-heartglass` given.)*
- *(The lights hold for a moment, then begin to dim, chamber by chamber, from the mouth inward.)*
- **Errata** *(kept)*: "The station is losing its light. Without the Heartglass, it will go dark again." / *(reset)*: "Oh no, the lovely lights are going out!"
- **Thousand:** "We could stay. Each of our moths can hold a little light. Enough to keep the shell lit. Enough to keep it a library, and not a tomb."
- *(If moths < 6:)* **Thousand:** "We are not all of us. We would hold it badly. But we would hold it."
- `ASK` **Thousand:** "Shall we stay, {call}?"
  1. "Stay. Keep it lit. Someone should." →`vellum.thousand = 'stays'`
     - **Thousand:** "Then we will be the one more lamp. We like that. We remember liking that."
     - *(The swarm spreads out along the siphuncle, and the chambers steady at a soft glow.)*
  2. "Come with us. We need you." →`vellum.thousand = 'comes'`
     - **Thousand:** "Then the shell will sleep again. It is good at sleeping. So were we."
     - *(The lights go out behind you as you walk back.)*
  - Esc: ask again.

### The broadcast
Every lamp-glass in the station (and in the Vellum) carries a quiet voice.
- **Leth:** "Citizens of the Vellum. This is the Redactor-General, speaking for the Moderator."
- **Leth:** "Tonight a light flickered in every lamp we hold. Some of you saw things you don't remember seeing. I'm sorry. It won't happen again."
- **Leth:** "In three days, on Assent Day, we will make our agreement permanent. No more night edits. No more forgetting and remembering and forgetting. One record, kept kindly, forever."
- **Leth:** "Rest. The record will keep."
- **Quaile:** "The Last Edit. He means to seal every tally in the Vellum for good."
- *(kept)* **Errata:** "To set an edit permanently, he needs the master record." *(Its lens-eye turns to the stone in your hands.)* "He needs that."
- *(reset)* **Thousand** *(or Tern, if aboard)*: "He needs what you're holding."
- **Quaile:** "And a hand with no tally to set it."
- **Brack** (comm): "Then he's not having either. Get back aboard."
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 6`.)*

## Aboard the Rumour (debrief 6)

- **Brack:** "Bad news from the post. The lamps are going out. Not ours. Theirs. One by one, on purpose."
- **Errata** *(kept)*: "The Unanimity is darkening every lane except the ones that lead to Plenary. If the Margin wishes to reach Assent Day, it will have to come through the last open lamp: Cinder Gate." / *(reset)* **Brack** says it instead, reading a slip.
- **Quaile:** "Cinder Gate. A lamp on the lip of a dying star. We built it to dare each other."
- **Brack:** "Margin's mustering in the Unlit near there. Every patched-up barge and mail-boat in the Vellum. Waiting for a lane."
- **Quaile:** "Then we give them one."
- **Pockets:** "ALWAYS." *(if found; otherwise "MIND THE GAP.")*

## What the player learns and earns

**Learns.**
- Saltglass, whole: a forgery sent the crowd, panic fired the guns, and Quaile cut the record.
- Benedikta founded the Unanimity in grief at that cut.
- The Last Edit is set for Assent Day, and needs the Heartglass and an untallied hand.

**Earns.**
- Title **Witness**.
- The key item `vellum-heartglass` (carried into Chapter 7).
- Up to 9 codex entries and 3 words.
- Flags: `vellum.ch = 6`, `vellum.thousand`, and possibly `vellum.brack.letter = 'shared'`.

## Chapter-ending hook

The *Rumour* carries four hundred years of the truth in a stone the size of a fist, through a galaxy whose lamps are being switched off one by one, toward the only one left burning.
