# Chapter 7: Lampfall

**World module:** `vellum-cinder`.
**Where:** Cinder Gate, the last lit lamp holding a lane to Plenary. A 210 m lighthouse on a rock shard skimming a red giant star.
**Rules:** `deny: ['board']`.
**Theme:**
- The star **Cinder** fills a third of the eastern sky: a sphere of radius 900 at [2600, 300, 0], `MeshBasic` orange-red, `fog: false`, plus a corona sphere at opacity 0.15.
- Sun from +x, colour `#ff7a3a`, intensity 3.4. Sky top `#2a0d08`, horizon `#ff8a3a`. Rising ember particles. `bloom 0.8`.
- Music: minor, root 45, 100 bpm, `pulse: true`.
**Playtime:** 40–50 minutes.

## Premise

The Unanimity is switching off the lamps. Cinder Gate is the last one with a lane to Plenary, and the Margin's whole ragged fleet is waiting in the Unlit for someone to hold it open. Nobody has ever stilled a lamp's beam. Quaile says it can be done. She doesn't say what it costs.

## Layout

The tower stands on the shard's flat top (y 0, a 120 m disc of dark basalt, `cliff` texture). Its **star side** faces +x (east) and its **shadow side** −x (west).

| part | position; size | notes |
|---|---|---|
| Dock | [−40, 0, 0] | The *Rumour* is berthed on a landing apron. Spawn [−30, 0, 4], yaw 90 (facing the tower). The sign **COME BACK SAFE** hangs on the dock arch. |
| Tower shaft | centre [0, 0, 0], radius 14, height 190 | Twelve wall segments per 10 m ring, with glowing amber iron bands. |
| Base gate | [−14, 0, 0], shadow side | The garrison entrance. The hall inside (radius 12) has two Ayes. |
| **Furnace gate** | [0, 0, −14] | An iron door to the hollow core. Inside: the **furnace chimney** (radius 6), a column of heat shimmer with an updraft (`w.wind`, 8×80×8, force [0, 28, 0]) to y 80. Opened only by Tobin (if woken). |
| Exterior ledges | spiralling, y 4..40 | 20 ledges (2.5×0.5×2): the route to G1 if you come out of the base hall's window. |
| **Gallery G1** | ring y 40, radius 14–18 | Railings, three **flare shields** (vertical iron slabs 3×4×0.4) on the star side. The fallen Aye who used to be Vane sits here. |
| Exterior climb G1→G2 | y 40..80 | **Star side:** ledges and an iron ladder (fast, but exposed). **Shadow side:** a slower route with gaps needing Second Step. |
| **Gallery G2** | ring y 80 | The **chapel**: a niche on the shadow side with the Moderator's stilled image. The furnace updraft vents here. |
| G2 → G3 | y 80..120 | Six **fins** (2 m thick, projecting 8 m) climbed by their ribs, with a 10 m glide between fins 3 and 4. |
| **Gallery G3** | ring y 120 | **The Redactor** (mini-boss) holds it. |
| G3 → lens room | y 120..190 | An internal spiral stair (switch-backs, then a broken flight: Second Step). |
| **Lens room** | floor y 190, radius 16, open to the sky | **The great lens**: three upright concentric rings (radius 9/6/3) facing +z at [0, 200, 0]. Consoles at [−6, 190, 6], [0, 190, 8] and [6, 190, 6]. The **keeper's desk** (Cinder Lens) at [−12, 190, −6]. |
| **The lane** (after the puzzle) | a beam from [0, 200, 9] toward [−800, 200, 2400] | A long box 4 m wide; its first 60 m (the walkable "Holding") is solid. |

**Sightlines.**
- From the dock, the tower stands black against the star, its lens dark.
- From G3 you can see the Margin fleet as a scatter of small lights to the north-west: green signal flares in the Unlit (particles at [−600, 260, 1800]).
- From the lens room, the star is enormous and very close.

## Solar flares (the chapter's rhythm)

- **The cycle.** Every 20 s (a fixed tick schedule, starting 8 s after arrival):
  - **Warning, 3 s.** The sky brightens and the sun intensity ramps (a visual-only `frame` lerp). An alarm `countdown` sound plays, and a toast reads *"FLARE!"* (first two times only).
  - **The flare, 2 s.** You are burned unless you are on the **shadow side**, or behind a **flare shield**, or indoors.
    - "Shadow side": your position's angle around the tower is more than 100° from +x.
    - "Behind a shield": inside that shield's 3×4×3 lee box.
  - **Burned:** `shake 0.3`, an orange burst, and a respawn at the last gallery checkpoint.
- **Why it matters.** The fast routes are on the star side. Every climb is a rhythm of dash, duck, dash.

## Objectives and critical path

1. Dock. Get into the tower: by the furnace gate (Tobin) or the base hall and the exterior ledges.
2. Reach G1, then G2: the star-side ladder between flares, or the shadow route.
3. Climb the fins to G3. Defeat the Redactor.
4. Climb to the lens room. Turn the three rings to point the lamp at the fleet.
5. **The Holding:** Quaile and you still the beam into a lane. Hold the lens for 90 s while the fleet runs it.
6. Leth arrives. Quaile's bargain. The Heartglass goes with her.

## Encounters

- **Base and G1 Ayes.** Sentries with health (Chapter 5 rules: 3 blade strikes, telegraphed sparker lines, hearts).
- **Tobin** (if woken) opens the furnace gate. The updraft lifts you from y 0 to 80 in about 6 s; the chimney wall (radius > 5.4) is a hazard.
  - Without him the gate stays bolted ("Someone's on the other side, humming."), and you take the hall and the ledges.
- **The man who was Vane** sits on G1, faceplate off, staring at the star. Optional talk.
- **The Redactor on G3** (mini-boss, masked, a quench-staff).
  - **Sweeps:** every 3 s, a knee-high black bar telegraphed by a 0.7 s ink line. Jump it. A hit costs a heart.
  - **Quench field:** every third sweep it plants its staff, and a dark circle of radius 6 spreads. Inside it, stilled light fails: your blade can't hit, and a down-force of [0, −30, 0] cancels gliding (BUILD.md, feature 7: runtime rule zones; the down-force is the fallback).
  - **Defeat:** 6 strikes outside the field. Unmasked, it is a tired middle-aged woman, and she sits down.
- **During the Holding:** three waves of two Ayes climb from a gavel at G3. Each Aye that reaches the lens circle (radius 3) **dims the beam**, adding 10 s to the hold.

## Puzzles and solutions

**P1: the flare climb.** G1 → G2 on the star side has five ladder sections (8 m each), with flare shields at the 1st, 3rd and 5th landings. Climb one or two sections per window, then duck behind a shield. The shadow side has no flares but needs two Second Step gaps (6 m) and takes twice as long. Both work.

**P2: the fins.** Each fin has rib ledges every 2.5 m. Fin 3 tops out at y 116. Glide from fin 3 to fin 4 (10 m, a 2 m drop), then climb 4 to G3. Fins 1–3 are on the shadow side; fin 4 is half-exposed, so time the glide between flares.

**P3: the three rings** (the lamp's aim).
- **The rings.** Outer (O), middle (M) and inner (I) each have 8 positions (0–7, at 45° steps); a bright notch marks each ring's current position.
- **The target.** Point the lane at the fleet: position **7 (north-west)**, where the green flares are, on all three rings. A painted arrow on the lens frame shows the fleet's bearing.
- **Start:** O = 2, M = 5, I = 1.
- **Consoles** (F · *Turn*):
  - The **outer** console turns O by +1 *and M by +1* (geared).
  - The **middle** console turns M by +1 *and I by +1*.
  - The **inner** console turns I by +1.
- **Solution:** solve outside-in.
  1. Outer ×5: O = 7, and M wraps to 2.
  2. Middle ×5: M = 7, I = 6.
  3. Inner ×1: I = 7.
  - Eleven presses. Any order that ends at 7-7-7 works.
- When aligned, the lens flares white. Quaile calls the Holding.

## Set piece: the Holding

- **Quaile:** "Fifth form. Nobody's done it in a hundred years. You don't still a step or a veil. You still the *beam*. Make it a road."
- **Freeze.** The player is held for 1.5 s; both your blades are raised to the lens (two avatar strike poses).
- **The beam.** It turns from flickering light into a solid white-gold **lane**, a box 4 m wide stretching out into space toward the fleet.
  - The first 60 m are walkable: you can step out onto the lane and stand on light above a star.
  - Optional: a codex entry waits at its 60 m tip.
- **The hold, 90 s.**
  - A ship streak (a long glowing box mover) races out along the lane every 4 s, toward Plenary: patched mail-barges, glass-miner tugs, and Pelagian windjammers if Saltwort was saved.
  - A counter reads *Ships through: n*.
  - The waves of Ayes come up the stair (see Encounters).
- **When the timer completes,** banner **THE LANE HOLDS**, and the last ship through is the *Rumour*'s sister mail-boat, blowing its horn.
- **Then the light changes.** The star's glow is blotted out by something the size of a city, closing like a book.

## Collectibles and codex

**Pockets' words.**

- COME BACK (key): the dock arch, *"COME BACK SAFE"*
- HOT: the furnace gate, *"CAUTION: HOT"*
- KEEP CLEAR: the lens-room floor stencil

**Codex.**
1. **Cinder Gate** (dock). *"A lamp built on a rock shard skimming the red giant Cinder, three hundred years ago, by Keepers daring each other. Every lane to Plenary runs through it."*
2. **Flares** (the first flare). *"Cinder flares every few breaths of a pilot's life. Lamp-tenders here learned to count, and to stand in the tower's shadow."*
3. **Imre Vane, Edited** (talk on G1). *"The former Redactor of Hesk, now an Aye without a number he can remember. Leth edited him for failing: 'It's kinder.'"*
4. **No Shadow** (the G2 chapel image). *"The Moderator's image stands in the flare light and throws no shadow. Yours falls straight through where hers should be."*
5. **Moderator's Remark No. 40** (the chapel image). *"'Tomorrow will remember today kindly.'"*
6. **The Holding** (the lane's tip, 60 m out). *"The fifth form: stilling a moving beam into a road. The last Keeper to do it held a lane for a fleet of refugees in the Clamour, then rested for a week."*
7. **The Margin Fleet** (after the hold). *"Two hundred and nine ships: mail-boats, tugs, barges, windjammers, a hospital ship and a pleasure yacht someone stole. All of them through."*

## Dialogue

### Arrival
Banner: *Chapter 7 · Lampfall*.
- **Brack:** "There she is. Cinder Gate. Last lamp burning with a lane to Plenary."
- **Quaile:** "We built it on a dare. Haskell won the dare. He was very annoying about it."
- **Errata** *(kept)*: "The Margin fleet is waiting in the Unlit, nine minutes north-west. Two hundred ships. They need the lamp pointed at them and held." / *(reset)*: "So many little ships out there! Are they all post?"
- **Brack:** "I'll keep the *Rumour* on the dock. If that lamp goes dark, so do we."
- **Quaile:** "Up, then. Mind the flares. Stand in the tower's shadow when the sky goes white."
- *Objective:* "Get into the tower."

### Tobin (if woken)
- **Tobin:** "It's you. The hand. I'm Tobin. I'm still Tobin. I say it every morning."
- **Tobin:** "There are others now. Ayes who remember their names. We wear our faceplates so nobody knows. Not yet."
- **Tobin:** "I'll open the furnace gate. The heat will carry you up the core. Don't touch the walls."
- **Tobin:** "And... when it's time, wherever it is, we'll take our faces off. You'll know."

### The man who was Vane (G1, optional)
- **The Aye:** "We are... I'm sorry. I think I used to be someone with a commendation."
- **The Aye:** "There's a word on the tip of my tongue. 'Ordinance.' Does that mean anything to you?"
- `ASK`
  1. "You were Redactor Imre Vane."
     - **The Aye:** "...That sounds like a very tiring person to have been."
  2. "No. Rest."
     - **The Aye:** "Thank you. I'll sit here. The star's nice."

### The chapel (G2, optional)
F · *Look at the image*. The Moderator stands in stilled light, hands folded.
- **Moderator** (image): "Tomorrow will remember today kindly."
- *(Toast: "The flare light pours past her. Her image throws no shadow. Yours falls straight through where hers should be.")*
- **Quaile** (if present via waypoint): "...That's Benedikta. Older. She looks like her mother." *(A pause.)* "She never stood that still in her life."

### The Redactor (G3)
- **Redactor:** "Keeper. Blank. The Redactor-General asks that you step away from the lamp."
- **Quaile:** "The Redactor-General can come and ask himself."
- **Redactor:** "He will."
- *(When defeated, the mask slips:)* **Redactor:** "...I had a sister. Didn't I?"

### The lens
- **Quaile:** "Three rings. The outer drags the middle, the middle drags the inner. Haskell designed it to be annoying. It's working."
- **Quaile:** "Point it at the fleet. North-west, where the green flares are."
- *(After aligning, the Holding:)*
- **Quaile:** "Fifth form. Nobody's done it in a hundred years. You don't still a step or a veil. You still the *beam*. Make it a road."
- **Quaile:** "Together. Still the hand. Still the eye. Still the heart. *Hold*."
- **Brack** (comm, at the first ship): "Look at that. Look at them go. Every barge I've ever sold a stamp to."
- *(If Pelagia was saved, at a windjammer:)* **Tern** (comm): "That's Saltwort's sails! Gran sent the boats!"
- *(If Dace printed, at ship 100:)* **Brack:** "Half of these weren't Margin a month ago. That boy's slips did this."

### Leth
A small gavel docks at the lens room's rim. The *Final Word* hangs behind it, blocking the star. Leth walks out barefoot onto the lens room floor. He is unarmed.
- **Leth:** "That was beautiful. I mean it. Nobody's held a lane in a hundred years."
- *(If `leth.petrel`:)* **Leth:** "{call}. You called me by my name, on Pelagia. I haven't slept properly since. I'm not angry. I'd like you to know that."
- *(Otherwise:)* **Leth:** "{call}. Good evening."
- **Leth:** "Keeper Quaile. I've wanted to meet you for thirty years. You were the first editor. Everything I do, you did first."
- **Quaile:** "I know."
- **Leth:** "The *Final Word* could put this lamp out with one breath. The fleet would be stranded in the Unlit. They'd starve or surrender, and either way they'd be counted by Assent Day."
- **Leth:** "Or I let them pass. All of them. I only need two things: the Heartglass, and a hand with no tally to set it."
- **Leth** *(to you)*: "I'd prefer yours. You'd never give it to me."
- **Quaile:** "No. They wouldn't. But I would."
- **Quaile:** "You'll have both. Me, and the stone. The fleet goes through. The blank goes free."
- **Leth:** "...Agreed. I'm sorry, Keeper. Truly."
- **Quaile** *(turning to you)*: "Give it to me, child."
- *(F · Give her the Heartglass. `w.take('vellum-heartglass')`. The only option is to give it: if you walk away, she follows and says "I wasn't asking," and the scene continues.)*
- **Quaile:** "Ninety years ago I chose for everyone. Let me choose for myself, once."
- `ASK` **Quaile:** "Well? Say it. Whatever it is."
  1. "Don't go. We'll find another way." →`vellum.cinder.farewell = 'stay'`
     - **Quaile:** "There's always one more lamp. Tonight, it's me."
  2. "Then I'll come for you." → `'come'`
     - **Quaile:** "Don't come for me. Come for the stone. ...But if you're passing."
  3. "Go. You've chosen for everyone for ninety years. Choose for yourself." → `'go'`
     - **Quaile:** "...Yes. That's it exactly."
  - Esc: as 2.
- **Quaile:** "Light enough to walk by, {call}."
- *(She walks into the gavel with Leth. It lifts. The lane holds behind it, and the last of the fleet goes through.)*
- **Brack** (comm, very quietly): "...Come down, pet. Come on down."
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 7`.)*

## Aboard the Rumour (debrief 7)

The galley is quiet. Quaile's empty place is set anyway; Brack does it without saying anything.
- **Brack:** "We got the fleet through. Two hundred and nine ships. That's the most post I've ever delivered."
- *(kept)* **Errata:** "I have filed the Keeper under 'crew, absent'. I find the category does not close." / *(reset)* **Errata:** "The tall lady with the blade isn't here. Will she be back for supper?" **Brack:** "...We'll see, pet."
- *(If Thousand came:)* **Thousand:** "We remember her as a jar's-eye view. A tall shape, always cross, always there."
- *(Saved:)* **Tern:** "She told me once that every Keeper's a lamp. Then she walked off with the brightest thing in the Vellum. That's not fair."
- **Brack** *(holding a slip)*: "Post from Plenary, through the lane, an hour ago. Your firebrand's handwriting. 'Gran says come to the Footnotes. Bring the blank. Assent Day's at dawn after next.'"
- **Brack:** "Plenary, then. The city that agrees."
- **Pockets:** "COME BACK." *(if found; otherwise "KEEP CLEAR.")*
- *(The star map unlocks Plenary.)*

## What the player learns and earns

**Learns.**
- The Moderator's image casts no shadow.
- Leth has the Heartglass and an unsealed hand.
- Quaile chose to go.
- Ayes are waking in secret.

**Earns.**
- Title **Lampholder**.
- **Cinder Lens** (`vellum-lens`: head, cosmetic, bound): a smoked-glass monocle on a chain, from the keeper's desk.
- Up to 7 codex entries and 3 words.
- Flags: `vellum.ch = 7`, `vellum.cinder.farewell`. The Heartglass is taken.

## Chapter-ending hook

The fleet is through, the lamp is held, and the woman who lit the lamp you came through is in the Redactor-General's flagship with four hundred years of truth in her lap, on her way to the city where, the day after tomorrow, everyone will agree forever.
