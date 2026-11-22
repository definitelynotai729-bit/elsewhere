# Chapter 2: The Lamp That Points Nowhere

**World module:** `vellum-vitrine` (the epilogue, Chapter 10, is this world in its "after" state).
**Where:** Vitrine, a desert of fused glass. The mining town of Glassgut, the restricted Flats, and the far-lamp.
**Rules:** `deny: ['glide']` (a sign by the pad: *"Glass-wind shreds canopies. No gliding on Vitrine."*). Boards allowed.
**Theme:** a white-gold glare sky (`sky: 'clear-sky'`, `skyBackdrop: false`), sun intensity 3.2, bloom 0.5, warm haze fog [120, 600]. Music: phrygian, root 50, 88 bpm.
**Playtime:** 35–45 minutes.

## Premise

Brack has post for Glassgut and a crate's history to trace. The lens-glass you climbed out of was cut from a lighthouse that stands alone in a forbidden desert, pointing at nothing. Only someone the Censors can't see can walk out to it.

## Layout

North is +z; the journey runs south (−z). The ground is fused glass at y 0: pale gold, metal 0.3, rough 0.15, so it glints.

| area | bounds / position | notes |
|---|---|---|
| Landing pad | disc radius 12 at [−26, 0, 2] | The *Rumour* is parked behind it (static décor hull, x −40..−70). Spawn [−20, 0, −4], yaw 150. |
| Main street | along x = 0, z −6..−60, 8 m wide | Flat-roofed glass-brick houses (6–10 m wide, 4–9 m tall), awnings at y 3. |
| Post office | [−12, 0, −20], 8×5×8 | Open front; the dead-letter wall (pigeonholes) inside. |
| The Blowpipe teahouse | [12, 0, −24], 10×4.5×9 | Awning y 3, roof y 4.5. A glass screen plays the Moderator's Hour. Mags at a table, Hob at the counter. |
| Co-op yard | fenced 14×14 centred [24, 0, −46] | Three slip bundles among ore crates. Two Ayes in the alley (x 30, z −40..−20). |
| Old shaft | [38, 0, −12] | A lift-head over a dark hole: F · *Drop the bundle*. |
| Rooftop route | east side of the street | R1 teahouse roof (y 4.5) → R2 [12, −36] y 6.0 → R3 [10, −47] y 7.5 → water-tower platform [8, −56] y 9.0 → wall top y 9 (a 2.5 m gap) → a rubble ramp down to y 0 at z −80. Every hop is ≤ 3 m across and ≤ 1.5 m up. Barrels at [15, 0, −20] (1.2) and [15, 0, −22] (2.4) climb to R1. |
| Tally-gate | wall x −45..45 at z −65, height 9 | An arch at x −3..3 with glass doors that never open for you. A sign: *TALLY GATE · For your convenience · All citizens counted.* |
| Glass Flats | x −90..90, z −66..−300 | Dunes are glass ramps 3–8 m high. Spires are cones 6–18 m (texture `cliff`, tinted amber, metal 0.4). |
| Memorial field | centred [−40, 0, −125] | Twelve soldiers fused in glass mid-stride (cylinders and spheres, translucent), with a plaque. |
| Aye fort | [0, 0, −170] | Walls 20×12, 4 m high, across the pass between two glass ridges (x ±10..±60, 14 m high). Two wall Ayes and a sweeping searchlight. |
| West route | x −60..−30, z −140..−260 | No Ayes, but **glass-wind** gusts. |
| Far-lamp mesa | centre [0, 0, −320], radius 32, top y 20 | A spiral ramp up the north face from [20, 0, −292]. |
| The far-lamp | tower radius 6, y 20..80 | Hollow (12 wall segments), with the door on the north and a spiral stair (P3). The **lantern room** is at y 74; the **great lens** (radius 3, rose-gold, light 30) faces north at [0, 77, −316]. An outer gallery at y 74. |
| Lens hoist | ramp from the south gallery [0, 74, −327] down to [0, 20, −352] | A 45° slide of old cable-rail: the quick way down. |
| The Long Dune | from [0, 20, −352] south to [0, −40, −860] | The sled run (see the set piece). Width 24. |
| The Sluice | a canyon floor at y −40, z −840..−900 | The *Rumour*'s cargo ramp at [0, −40..−34, −872]. |

**Landmarks and sightlines.**
- From the pad, the lamp's rose-gold glint is visible on the southern horizon (a glowing sphere at y 77), always there, so the player knows where they're going.
- From the wall top, the whole Flats lie spread out with the fort's searchlight sweeping.
- From the lantern room you see Glassgut to the north, and the Long Dune falling away south to a dark canyon.

## Objectives and critical path

1. Meet Brack at the post office (the letter).
2. Find Mags in the Blowpipe.
3. *(Optional)* Carry three slip bundles from the yard to the old shaft before you leave town.
4. Get over the tally-gate by the rooftops.
5. Cross the Flats to the far-lamp: past the fort, or by the windy west route.
6. Climb the far-lamp. Touch the lens: Quaile's message, and Haskell's hilt.
7. Vane's gavel lands. Slide down the hoist, take Mags's sled, ride the Long Dune into the *Rumour*.

**Optional:** the memorial field, the teahouse sign, the Glassgut notice board, and a ledge outside the lantern room.

## Encounters

- **Censors** (four of them) loop the Flats at y 3. They ignore you. The first time one passes through you: toast *"A Censor floats through the space where you're standing and reports nothing."*
- **Aye fort.** Two wall Ayes (sentry spec: 35°, 10 m range, 0.5 s) and a **searchlight cone**: a 7 m circle sweeping the pass floor from x −8 to 8 every 6 s.
  - Shadow: hug the fort's west wall, wait at the water barrels [−9, 0, −158], and cross while the light sweeps east.
  - Caught: respawn at the wall-top checkpoint (CP *Wall*).
- **Glass-wind** (west route). Three wind boxes (20 × 6 × 20) push [16, 0, 0] for 2 s every 7 s, each preceded by a 1 s dust burst of amber particles. Glass spires give cover in their lee.
- **The alley Ayes** (optional quest). AY1 turns at the yard gate [24, 0, −38] every 5 s. AY2 walks x = 30 from z −40 to −20 at 1.4 m/s.

## Puzzles and solutions

**P1: the gate that can't count you.** The doors never open for you. Pockets says NO ENTRY and sits down. The route is the rooftops listed above. The water tower is the only way to wall height; reach its platform from R3 with a 1.5 m step-up jump.

**P2 (optional): three bundles.**
- Bundles sit in the yard's crates at [20, 0, −50], [27, 0, −44] and [22, 0, −40]. Carry one at a time (key item `vellum-bundle`) to the shaft at [38, 0, −12].
- The safe line is behind the ore crates on x 34–36 while AY2 walks south, then the gap in the fence at [31, 0, −30]. The Censor sweep (two drones) floats through the yard and finds nothing on you.
- **"Noon" is narrative time, not a clock.** The sweep resolves when you first cross the wall top:
  - all three hidden →`vellum.vitrine.slips = true`;
  - otherwise → `false` (toast: *"Behind you, the Censor sweep reaches Mags's yard."*).

**P3: the broken stair.**
- The stair blocks (1.6 × 0.4 × 1.2) run around the inner wall at radius 4.6, rising 1.0 m every 30°.
- **Gaps** at y 31 and y 38 (one missing block each: a 2.4 m jump).
- **Crumbling blocks** (`w.crumble`, delay 0.5) from y 39 to 43.
- At y 44 the stair is gone for half a turn. A fallen **lens-gear** lies across the shaft centre: a disc of radius 2.5 with a jump pad on it (power 22, apex about 8 m). It throws you to the stair at y 52.
- A lit **sun-slot** in the wall at y 52 marks the landing.
- The last turn up to y 74 is whole.

## Set piece: the Long Dune

The Long Dune is a 500 m sled run from y 20 to y −40, built from 24 m wide glass ramp segments 40 m long, each dropping 4–6 m. Turns are banked (±20° yaw). `w.player.forceBoard(true)` on entering the run zone; `false` at the Sluice. `killY` for the run is −60.

| z | feature |
|---|---|
| −352 | Start: Mags's sled on a rack. |
| −380, −450, −520, −590, −660, −730, −800 | **Boost pads** (`w.boostPad`, power 1.4, time 1.2 s), offset left and right so you weave. |
| −420..−480 | **Black glass**: eight hazard shards (2 × 1 × 2, near-black, glossy) in a slalom. |
| −500 | **RC1** checkpoint, styled as a sled rack. |
| −520 | **Glass-wave crest**: a kicker ramp 3 m high over a 10 m crevasse. |
| −560 and −700 | **Censor redaction beams**: a white line sweeps the run every 3 s, glowing 0.8 s before it scorches for 0.3 s. They aren't hunting you; they burn whatever is there. |
| −640 | **RC2**, then the **crumbling bridge**: 15 glass tiles (crumble delay 0.25) over a 30 m sinkhole. Keep your speed. |
| −680..−760 | Vane's gavel shadows you overhead. Its sparker strips (telegraphed red, 1.0 s, as in Chapter 1) stripe the run in pairs. |
| −780 | **RC3.** |
| −830 | **The kicker** (5 m high). You fly into the canyon. |
| −872 | The *Rumour*'s cargo ramp. The landing catch zone is 10 × 6 × 14 (anything inside counts as landed). |

On landing: banner **GLASS-RUNNER**, `shake 0.6`. **Brack** (comm): "Got you! Hold on to something that isn't me!" Then `w.travel('vellum-rumour')` with `vellum.debrief = 2`.

## Collectibles and codex

**Pockets' words.**

- FRIEND (key): the Blowpipe's sign: *"A STRANGER IS A FRIEND WHO HASN'T BOUGHT A ROUND"*
- ANYONE: the far-lamp door: *"LAMP OF THE EIGHTH LANE · FOR ANYONE"*
- DANGER: a Flats fence sign: *"DANGER · RESTRICTED"*

**Codex.**
1. **Vitrine** (on arrival). *"A desert fused to glass by stillglass bombs in the Clamour, now mined for dead glass: stilled light gone dark, sold for lenses."*
2. **Glassgut** (town sign). *"Mining town and post stop. Population 2,100, every one of them counted; the tally-gate makes sure of it."*
3. **The Sillen** (talk to Hob). *"Vitrine's natives: tall, slow, translucent and immune to glass-dust. They mined these dunes before the war made them valuable, and they resent being called 'the help'."*
4. **A Letter to Herself** (post office).
   - *Read:* the full letter text (see Dialogue).
   - *Kept:* *"Brack read it alone. She hasn't said what it says."*
5. **The Clamour** (memorial plaque). *"Thirty years of war, ninety-two to sixty-two years ago, fought with records as much as ships. Every world showed the half that made it right. The plaque reads: 'Saltglass. Never again.'"*
6. **The Far-Lamp** (the door). *"The Lamp of the Eighth Lane. There is no eighth lane. Its lens has been lit for sixty years, pointing at nothing in the Vellum."*
7. **Orla Quaile** (the message). *"A Keeper of the Light, recorded sixty years ago. She says she is in the ice at Skerrow, holding 'something no tally can be allowed to edit'."*
8. **Moderator's Remark No. 31** (Glassgut notice board). *"'Every voice is welcome in agreement.'"*
9. **Margin Slip: "Birthdays"** (with the third bundle). *"Tam's is the ninth of Ember. Rosy's is the second of Thaw. If you forget again, you great lump, there's cake money in the boot. —Dad (you)."*

## Dialogue

### Arrival
Banner: *Chapter 2 · The Lamp That Points Nowhere*. Everyone is at the *Rumour*'s ramp.
- **Brack:** "Glassgut. Best dead glass in the Margin, worst tea in the Vellum. Don't tell Mags I said that."
- **Brack:** "I've post to drop. Then we find out where that lens came from. Mags Dunmore runs the miners' co-op; she sold me the crates."
- **Errata** (if `vouched` is 'yes' or 'neutral'): "I will remain with the ship. Glassgut has a records office, and records offices know my face."
- **Brack** (if `vouched = 'no'`): "Clerk stays in the hold. Don't look at me like that, it can't see you."
- **Pockets:** "FOLLOW."
- *Objective:* "Meet Brack at the post office."

### The dead letter
In the post office, Brack stands at the dead-letter wall.
- **Brack:** "Dead letters. Post nobody could deliver. Nobody at the address, or nobody remembers living there."
- **Brack:** "Funny thing. This one's addressed to me. 'O. Brack, Courier Nineteen, care of any post office.' Sixty-two years in this wall."
- **Brack:** "...That's my handwriting."
- `ASK` **Brack:** "I don't remember writing it. Should I open it?"
  1. "Open it. Read it out, if you want." →`vellum.brack.letter = 'read'`
     - **Brack** (reading): "'Otto. You're going to forget this, so I'm writing it down. Tonight I carried the Assent to Plenary and put it in the Moderator's hands myself.'"
     - **Brack:** "'She signed it, and then she wept, and she said, Forgive me, Orla. Quiet, like I wasn't there.'"
     - **Brack:** "'Tomorrow they fit my tally and I'll think it was the happiest night of my life. It wasn't. Remember that. Love, you.'"
     - **Brack:** "...I don't remember any of that. I remember a party. Lanterns. Somebody gave me a medal."
     - **Brack:** "Forgive me, Orla. Who in the black is Orla?"
  2. "It's yours. Read it on your own." → `'kept'`
     - *(She reads. A long silence.)*
     - **Brack:** "Later, pet. Go and find Mags."
  - Esc: as 2.
- *Objective:* "Find Mags Dunmore at the Blowpipe."

### The Blowpipe
On entering, the glass screen plays:
- **Moderator** (screen): "Citizens of the Vellum. Agreement is a kindness we do for each other. Rest. The record will keep."
- **Hob** (a Sillen miner, chiming faintly when he speaks): "Number twelve again. She does that one every month or so. Lovely woman. Never changes."
- *(If you heard No. 12 on Hesk, toast: "The exact words from the lamp at Hesk.")*

Mags at her table:
- **Mags:** "Brack's stowaway! News travels faster than post round here, love. Sit. Don't drink the tea."
- **Mags:** "The lens? Cut it off the far-lamp myself. 'The Lamp That Points Nowhere', we call it. Stands out on the Flats, lit for sixty years, pointing at nothing at all."
- **Mags:** "Three crates' worth, then the Unanimity fenced the Flats. Restricted, they said. Censors everywhere."
- **Mags:** "But you... they're saying you walk right past Censors. They're saying you're not in the record."
- `ASK` **Mags:** "Going out to the lamp, then?"
  1. "That's why I'm here."
     - **Mags:** "Good. Gate's at the top of the street. It won't open for you, mind. It only opens for people it can count."
  2. "What's out there?"
     - **Mags:** "Glass, wind, two Ayes in a fort, and a lamp nobody can explain. Mind the gate: it won't open for you. It only opens for people it can count."
  - Esc: as 1.
- **Mags** (quieter): "And... if you've a minute before you go."
- **Mags:** "There's a Censor sweep coming through my yard at noon. I've got slips in that yard. Paper. Things my crew wrote down so they'd not forget them."
- **Mags:** "If the Censors find them, the night edit takes the lot. My lads'll forget their own kids' birthdays."
- `ASK` **Mags:** "Censors can't see you. Would you carry three bundles from the yard down the old shaft before the sweep?"
  1. "I'll do it." →`vellum.vitrine.accepted = true`
     - **Mags:** "Bless you. Yard's at the east end. Shaft's the old lift-head by the wall. Mind the two Ayes in the alley. They've got eyes, if not much behind them."
     - *Objective added:* "Optional: hide Mags's slip bundles in the old shaft (0/3) before you leave town."
  2. "I can't risk it."
     - **Mags:** "No. No, course not. Off you go, then, love."
  - Esc: as 2.

**Hob, if spoken to:** "The Flats? We Sillen walked them before they were glass. Now we need a pass to look at them."

**Mags, after the third bundle:**
- **Mags:** "Every one. You lovely nobody. My lads'll remember their kids' birthdays because of you."
- *(Sets `vellum.vitrine.slips = true`.)*

### The gate
On approach: toast *"The tally-gate scans you, finds nothing, and stays shut."*
- **Pockets:** "NO ENTRY."
- **Pockets:** "STAY. HERE."
- *Objective:* "Find a way over the wall."

At the wall top: *Objective:* "Cross the Glass Flats to the far-lamp." Checkpoint *Wall*.

**Fort Aye barks:** "We watch the Flats."; "Nothing moves that the record doesn't know."; On detection: "HALT. You are not in the record."

### The far-lamp
**F · Touch the lens.** A translucent woman in a long Keeper's coat forms beside the lens. She stands straight-backed, with a scar through one eyebrow.
- **Quaile** (stilled): "If you can hear this, you have no tally. Good."
- **Quaile:** "My name is Orla Quaile. I'm a Keeper of the Light, and by the time anyone hears this there may be no others."
- **Quaile:** "I lit this lamp for anyone unwritten. It opens onto somewhere the record doesn't reach. I don't know who you are. That's rather the point."
- **Quaile:** "I'm in the ice at Skerrow, under the old observatory, stilled. I'm holding something no tally can be allowed to edit."
- **Quaile:** "Bring light. And don't let them see you coming. ...Though I suppose they can't."
- **Quaile:** "Haskell's hilt is on the stand. Take it. It's dark. You'll fix that."
- *Pickup `vellum-hilt`. Toast: "A Keeper's hilt. Cold, dark, and heavier than it looks."*
- *(If `vellum.brack.letter = 'read'`: toast "Orla. 'Forgive me, Orla.' The name in Brack's letter.")*
- *(Toast: "Through the lens: a plaza at sunset, ringed with portals. Junction. This lamp is a door." The lens's south face is a `w.portal` to `hub`, labelled Elsewhere.)*

### Vane arrives
On picking up the hilt, a gavel slams down at the mesa's foot (`shake 0.8`, a burst of glass dust).
- **Vane** (loudhailer): "Attention, irregularity! In accordance with the Restricted Flats Ordinance, you are surrounded!"
- **Vane:** "That is to say, my Ayes are surrounding the area in which you are probably standing!"
- **Brack** (comm): "{call}! Ayes all over the pad at Glassgut; I've had to lift. I'm going round to the Sluice, south of the lamp."
- **Brack:** "Can you get down the Long Dune?"
- **Mags** (comm): "There's a salvage sled at the foot of the lamp, south side. Mine. Ride it down the dune and don't touch the black glass!"
- *Objective:* "Slide down the lens hoist. Take Mags's sled and ride the Long Dune to the Sluice."

On taking the sled (`vellum-sled`, equipped automatically):
- **Mags** (comm): "She pulls left. So do I. Go!"
- *Toast:* "Boost pads launch you; black glass sends you back."

## Aboard the Rumour (debrief 2)

In the galley. If `vouched = 'no'`, Errata's lines come over the intercom from the hold.
- **Errata:** "The hilt is Lightkeeper work. A Keeper's hilt. There is no light in it."
- If `vellum.brack.letter = 'read'`:
  - **Brack:** "Orla Quaile. 'Forgive me, Orla.' The Moderator said that name the night I gave her the treaty. And now Orla's in the ice on Skerrow."
- If `'kept'`:
  - **Brack:** "Orla Quaile." *(She looks at the table for a while.)* "...Skerrow, then."
- **Errata:** "Skerrow is a cold world at the edge of the Binding. There is a Unanimity listening post at the old observatory."
- **Errata:** "Which tower is the observatory, exactly? For my notes."
- **Brack:** "The big one with the dome, clerk. You can't miss it."
- **Brack:** "And how did that Redactor know to land at the lamp? Nobody knew we were going there but us."
- **Errata:** "Glassgut has a records office. Records offices talk."
- **Pockets:** "COLD?"
- **Brack:** "Very. Wrap up."
- *(The star map unlocks Skerrow.)*

**Night scene** (on the next hub entry, or after this debrief). Errata stands in the blister.
- **Errata** (whispering): "...E-R-Eight to the office of the Redactor-General. The null entry carries a Keeper's hilt. Destination Skerrow, the observatory. Filed."
- *(If you walk up:)* **Errata:** "Defragmenting. It is a private process, like dreaming. Goodnight, {call}."
- *(Pockets, if spoken to at ship's night:)* **Pockets:** "SECRET. SIGNAL. NIGHT."

## What the player learns and earns

**Learns.**
- The Moderator repeats herself.
- Brack's memory was edited sixty-two years ago, and the Moderator once said "Forgive me, Orla".
- Orla Quaile lit a lamp onto Elsewhere and stilled herself in ice.
- Someone keeps telling the Redactors where you're going.

**Earns.**
- **Salvage Sled** (`vellum-sled`: board, bound): a dented miner's sled in Mags's co-op stripes.
- Title **Glass-Runner**.
- Up to 9 codex entries and 3 words.
- Flags: `vellum.ch = 2`, `vellum.brack.letter`, `vellum.vitrine.slips`, and the key item `vellum-hilt`.

## Chapter-ending hook

A Keeper's dark hilt on the galley table, a name in a sixty-two-year-old letter, and a clerk who asks a little too precisely which tower.
