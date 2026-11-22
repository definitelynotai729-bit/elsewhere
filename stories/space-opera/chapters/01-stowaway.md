# Chapter 1: Stowaway

**World module:** `vellum-rumour`, also the campaign hub (see *Hub mode*).
**Where:** the mail ship *Rumour*, clamped to the inspection gantry of the Lamp of Hesk.
**Playtime:** 25–35 minutes.

## Premise

You step through the rose-gold arch in Junction and climb out of a crate of lens-glass in a cargo hold. Two minutes later the Unanimity comes aboard to inspect it. The ship's drones can't see you. Its soldiers can.

## Layout

The ship's bow points to −z, and spawn faces it (yaw 180). y = 0 is the lower-deck floor. The ship is 72 m long (z +20 stern to −52 bow) and 16 m wide in the hold. Space around it is empty; `killY: -30` returns you to the last checkpoint.

| area | bounds (x; y; z) | notes |
|---|---|---|
| Engine room | −6..6; 0..9; +10..+20 | Lane-drive: a blue-white cylinder along z, centre [0, 4.5, 15], radius 2.2, length 8. Port catwalk x −6..−3.2, top y 4.5, z 11..19; tool-crate steps at [−5, 0, 12] (tops 1.5/3.0/4.5). Doorway to the hold at z +10, 3 m wide. |
| Cargo hold | −8..8; 0..9; +10..−18 | Double height, amber work lights. The **spawn crate** is at [3, 0, 4] (2.4 × 1.6 × 2.4, open top, lens-glass glowing rose-gold inside). Spawn is [3, 0.4, 4], yaw 180. |
| Crate stacks | in the hold (centre, then size x×y×z) | S1 [−4.5, 0, 6] 2.4×2.4×2.4; S2 [−1, 0, −2] 3×1.6×2; S3 [4.5, 0, −6] 2.4×2.4×3.6; S4 [−5, 0, −9] 2×1.6×2; S5 [1.5, 0, −12] 2.4×2.4×2.4; S6 [5.5, 0, −15] 2×1.2×2; S7 [6, 0, −10] 2×3.6×2; S8 [3.2, 0, −8.5] 1.4×1.2×1.4 |
| Starboard catwalk | x 5..8, top y 5, z +8..−16 | Railing on its open side. Reached by S8 → S3 → S7 → catwalk; each step is ≤ 1.4 m. |
| Cargo crane | beam at y 8.2 along x at z −4 | The hook platform (1.6 × 0.3 × 1.6, top y 6.8) is a `w.mover` from x −6 to +6 at 2 m/s with a 1.2 s pause. It joins the port crates to the catwalk. |
| Mail chute | ramp from [5, 5, −16] to [3, 0, −22] | A 1.4 m slide into the mail room: the secret route past the door guard. |
| Gangway door | starboard wall, x 8, z −2..−6 | Where the Ayes come aboard. The gangway runs out to the Hesk gantry at x 14. |
| Top-hatch ladder | [0, 0..9, −16] | Leads to the hatch at [0, 9, −16] and out onto the dorsal hull. |
| Mail room | −6..6; 0..4.5; −18..−30 | Door from the hold at z −18, 3 m wide. Pigeonhole walls on x = ±6. The **sorting drum** is a cylinder along x (centre [0, 1.8, −24], radius 1.4, length 5) that splits the room into two aisles. The **cold box** is a lead-grey locker at [−4.8, 0, −28.8] (2 × 2.4 × 1.6) with a glowing latch. Hide alcove at [4.8, 0, −28], 1.5 m deep. |
| Corridor | −2..2; 0..4.5; −30..−36 | Ladder at z −35 up to the upper deck. |
| Upper deck | floor y 5, z −18..−30 | Galley at x −6..0 (table, stove, Brack's tea tin, noticeboard). Bunks at x 0..6. Ladder at [−3, 5..10.5, −26] up to the blister. |
| Bridge | −5..5; 5..9.5; −36..−50 | Two pilot seats at x ±1.5, z −44. The bow **lane-glass** is a glowing disc of radius 3 at [0, 7.2, −50]. |
| Observation blister | dome radius 3 at [0, 10.5, −26] | Glass dome (`dome: true`, opacity 0.25). |
| Dorsal hull | top surface y 10.5 | The main deck (x −7..7, z +18..−34) narrows to the **bow spine** (x −2..2, z −34..−48). Obstacles are listed below. |
| Hesk gantry (décor plus gangway) | x 10..30; y 4..16; z +10..−30 | An iron lattice with three Aye posts and a **searchlight** at [16, 15, −8]. |
| The Lamp of Hesk | [260, −120..220, −160] | Décor: tower radius 18, a glowing lens sphere (radius 14) on top, one slow turning beam. |

**Hull obstacles.**
- **Mail-drum hump:** a cylinder along x, centre [0, 11.3, −4], radius 1.6, length 10 (climbable).
- **Vent stacks:** cylinders 1.5 m tall at [−4, 11.25, +4] and [4, 11.25, +12], each with an updraft (`w.wind`, size 2×4×2, force [0, 22, 0]).
- **Antenna mast:** [5, 10.5..18, +6], with a 2×2 platform on top at y 14.5.
- **Docking clamps:** C1 [6.5, 10.5, +14], C2 [−6.5, 10.5, −6], C3 [0, 10.5, −46]. Each is an iron jaw 1.5 m tall with a red glowing pin.

**Sightlines.** From the crate you see down the hold to the mail-room door. On the hull, the Lamp of Hesk fills the starboard sky.

## Objectives and critical path

1. Climb out of the crate; meet Pockets, then Brack.
2. Hide three mailbags in the cold box past the Ayes. Errata confronts you after the second.
3. After the third: Vane's question, then Leth's voice over the lamp.
4. Release the three docking clamps on the hull (C1, C2, C3) under a searchlight and sparker fire.
5. Lighting out: run back to the hatch through streaming light. Errata lands beside you.
6. The galley scene and the shard's picture. Pockets mounts the shard as the Nowhere Lens. Chapter complete.

**Optional areas:** the antenna mast, the bridge, the blister, the galley noticeboard, and the split mail sack behind S6.

## Encounters

### Ayes and Censors
Ayes use the shared sentry spec (BUILD.md):
- **Vision:** a 35° half-angle cone, 8 m long, blocked by crates.
- **Detection:** 0.5 s of sight, while the visor line reddens.
- **Caught:** "HALT. You are not in the record." You respawn at the last **hide spot**, keeping any bag you carry. Hide spots are checkpoints marked with a chalk "|": the spawn crate, behind S2, the mail-room alcove, and the top of the engine steps.

| Aye | behaviour |
|---|---|
| A1 | Loops the hold [−2,0,8] → [−2,0,−14] → [3,0,−14] → [3,0,8] at 1.6 m/s, pausing 2 s per corner. It turns left at the drive coupling every 40 s. |
| A2 | At the mail-room door [0, 0, −18.5], alternating between facing +z and −x every 6 s. |
| A3 | Beside Vane at the gangway door [6.8, 0, −4], facing −x. His cone misses anything above 4 m. |

Two **Censors** loop the hold and the mail room at y 2.2 and 1.2 m/s, ignoring you. The first close pass: toast *"A Censor drone bumps into you. 'UNRECORDED OBSTRUCTION. APOLOGIES.' It drifts on."*

### On the hull
- **Searchlight.** A 4 m band sweeps the hull stern to bow and back every 9 s. Inside it, outside a **shadow box**, you're seen, and you respawn at the hatch checkpoint.
  - Shadow boxes: behind the mail drum (x −5..5, z −5.6..−2.4); within 3.4 m of the blister; on the −x side of each vent stack; under the antenna platform.
  - The band is a translucent white slab, and the hull plating glows where it lands.
- **Sparker lanes** (after C1). Three 14 × 1 m strips at z +6, −2 and −20. Each glows red for 1.0 s, then is a hazard for 0.35 s, repeating every 4 s at offsets 0, 1.3 and 2.6 s.
- **Gavel inbound** (after C2). A 90 s banner countdown. If it expires, two Ayes drop onto the bow spine and patrol it: harder, never a loss of progress.

## Puzzles and solutions

**P1: three bags, one locker.** You carry one bag at a time (key item `vellum-mailbag`; a second says "Your arms are full"). **F · Hide the mailbag** at the cold box.
- **Bag 1** at [−7, 0, −16]. Shadow A1 down the port side behind S1 and S4. Grab it while he turns, and pass the door while A2 faces −x.
- **Bag 2** at [6.5, 5, −14], on the catwalk. Climb S8 → S3 → S7 (A3 can't see above 4 m), or ride the crane hook. Then take the **mail chute**, which drops you behind the sorting drum, out of A2's cone.
- **Bag 3** at [−4.6, 4.5, 17]. Wait for A1's left turn at the coupling, then climb the tool-crate steps. A Censor drifts straight through you on the way: a laugh mid-tension.

**P2: the searchlight.** The rhythm is hatch → mail drum (wait) → C2 → drum → vent stack → C1 → blister (wait) → C3. The bow spine has no shadow, so you follow the band in.

**P3 (optional): the mast.** Vent stack 1's updraft lifts you about 4 m to the antenna platform (y 14.5): Pockets' word **PRIORITY**, and the whole lamp in view.

## Set piece: lighting out

1. C3 releases. `shake 1.0`; the gangway slides away along +x over 3 s.
2. Light-streaks (long, thin glowing boxes in pale blue and rose) stream aft past the hull, and a wind of [0, 0, 14] pushes you aft toward the hatch.
3. The hull edges become hazards ("the lane-field shears the edges"): |x| > 6.2 on the main deck and |x| > 1.6 on the spine, marked by sparks.
4. Halfway back, **Errata leaps** from the departing gantry in a scripted arc from [14, 6, −8] to [2, 10.5, −12] and lands in sparks beside the hatch.
5. At the hatch, a short exchange. Then freeze, banner *INTO THE UNLIT*, a white burst of 160 particles, `shake 1.2`, and a teleport to [0, 0, −14].
6. The world switches to its **Unlit** state: lamp and gantry hidden, a near-black sky, the streaks slowing to a drift, amber lights.

## Collectibles and codex

**Pockets' words** (walk up to the label; F · *Read the label*; flag `vellum.words.<word>`).

- THANK YOU (key): sticker on the bridge console: "THANK YOU FOR FLYING THE UNLIT POST"
- AIRMAIL: tag on the sack behind S6
- PRIORITY: crate on the antenna platform

**Codex entries** (flag `vellum.codex.<id>`). On first collection: toast *"Codex: <title>"*.

1. **The Rumour** (bridge plaque). *"Courier-hauler, eighty-one years old, post-box red. Licensed to the Unlit Post. Her lane-glass was cut on Vitrine; her mail drum holds forty thousand letters; her captain holds grudges."*
2. **The Unlit Post** (mail-room sign "SORT BY HEART"). *"The last independent mail route in the Vellum: paper letters between people the Fair Copy has separated. Post's post; Brack doesn't read it."*
3. **Tallies** (automatic, after Brack explains). *"A glass bead fitted behind the ear in infancy, everywhere in the Binding. It reports to the Fair Copy and, at night near a lamp, it edits. You don't have one."*
4. **Censors** (automatic, first bump). *"Unanimity drones: white spheres with a black bar across the face. They read tallies, not faces. To a Censor, you are an obstruction."*
5. **Ayes** (automatic, first time seen within 6 m). *"Conscript soldiers in assent, a light trance. Ivory plate, printed tabards, one voice: 'We agree.' Their eyes work perfectly well."*
6. **Redactors** (automatic, when Vane speaks). *"Officers who decide what the Fair Copy keeps. Grey coats, ink-black gloves, blank paper masks. Imre Vane would like you to know he has a commendation."*
7. **Lamps and Lanes** (in the blister). *"Stillglass lighthouses at the edges of systems; their beams hold the lanes open. Whoever holds the lamps holds the roads. Running an unlit lane is how the Rumour stays free."*
8. **Margin Slip: "Biscuit"** (the split sack behind S6). *"Hesk, third night. Mum, if this reaches you, I'm well. They edited Pa again; he thinks the mine was always shut. Read him this. Tell him the dog was called Biscuit. He'll laugh. —J."*
9. **Moderator's Remark No. 12** (automatic, the lamp broadcast when you first step onto the hull). *"Citizens of the Vellum. Agreement is a kindness we do for each other. Rest. The record will keep."*

## Dialogue

Speakers are **bold**. `ASK` is a `w.ask`, and Esc (−1) is handled as stated. `{call}` is the chosen callsign, defaulting to "Stranger" until it is chosen.

### Arrival
On first entry: banner **THE LONG LIGHT** / *Chapter 1 · Stowaway*. Objective: *Climb out of the crate.*

Pockets peeks from behind the crate, at [4.8, 0, 2]. Its talk triggers on approach within 3 m, once:
- **Pockets:** "HELLO."
- **Pockets:** "FRAGILE. THIS WAY UP."
- **Pockets:** "NO RETURN ADDRESS?"
- *Toast:* "The little robot speaks only in words it has found on labels and signs. Find it more words, and it will have more to say."

On leaving the crate zone, Brack is at [0, 0, 3]:
- **Brack:** "Well. You're not mail."
- **Brack:** "Lens-glass, three crates, Vitrine to Hesk. That's my manifest. It doesn't say 'and one passenger, folded'."
- **Brack:** "Ottoline Brack. Captain. This is the Rumour: post and parcels, no questions. And in about four minutes, a Unanimity inspection."
- `ASK` **Brack:** "So. Who are you, and how did you get in my crate?"
  1. "I stepped through a door in another world. I came out in your glass." →`vellum.c1.door = true`
     - **Brack:** "Course you did. And I'm the Moderator's auntie."
     - **Brack:** "...You mean it. Your eyes went odd when you said it. Right then."
  2. "Honestly? I've no idea."
     - **Brack:** "Honest's a start. Most stowaways lead with a sob story."
  3. "Does it matter? You've got four minutes."
     - **Brack:** "Ha! No, it doesn't. I like you already, which is going to be a problem."
  - Esc: as 2.
- **Brack:** "Here's your trouble, pet. Everyone in the Vellum's got a tally. Glass bead, behind the ear. Censors read it like a label."
- **Brack:** "You haven't got one. I looked while you were snoring in my lens-glass. So to a Censor, you're nothing. Air with opinions."
- **Brack:** "The Ayes, though. The soldiers. They use their eyes. And they'll want to know why my ship's carrying a person the record's never heard of."
- **Brack:** "So stay out of their sight. And while you're at it, do me a kindness."
- **Brack:** "Three sacks of post are lying about my hold. Unlit Post. Paper letters, the sort the Unanimity likes to read before anyone else does."
- **Brack:** "They go in the cold box, in the mail room up front. Lead-lined. Censors can't scan through it."
- *(A heavy clang; `shake 0.3`.)*
- **Brack:** "That's them docking. Early. Course they are."
- **Brack:** "Keep a crate between you and any faceplate. Pockets, hide. Go on, the pair of you."
- **Pockets:** "HIDE."
- *Toast:* "Pockets climbs into a mail sack, which is probably how it got its name."
- *Objective:* "Hide the three mailbags in the cold box (0/3). Keep out of the Ayes' sight."

### The inspection
Vane and A3 enter at the gangway door:
- **Vane:** "Captain Brack. Redactor Imre Vane, Lamp of Hesk. In accordance with the Inspection Ordinance, we will be looking at everything."
- **Brack:** "Look all you like. It's post."
- **Vane:** "Post is precisely what worries the Ordinance, Captain."

**Aye barks** (toasts, within 6 m, cycling): "We agree."; "Hold clear."; "Manifest item forty: lens-glass. Accounted."; "We see nothing out of order."

**Brack, if spoken to:** "Not now, pet. Sacks." After 1 bag: "Two to go." After 2: "One more. You're a natural. That's not a compliment, mind."

### Errata (after the second bag)
It triggers the next time you enter the mail room. Errata stands at [2.5, 0, −21] with a ledger, and A2 is called away. Its lens-eye whirs.
- **Errata:** "Hold still, please. I am counting you."
- **Errata:** "Vessel mass, as declared: two hundred and six tonnes, four hundred kilograms. Vessel mass, as weighed by the dock: two hundred and six tonnes, four hundred and seventy-one."
- **Errata:** "You are seventy-one kilograms of nobody. The Censors cannot see you. I, however, can subtract."
- **Errata:** "Archive Clerk E-R-Eight, Lamp of Hesk inspection office. People call me Errata. I correct things."
- `ASK` **Errata:** "I must file you under something. What shall I enter?"
  1. "Stranger." →`vellum.call = 'Stranger'`
     - **Errata:** "'Stranger.' Accurate. Filed."
  2. "Nobody." →`vellum.call = 'Nobody'`
     - **Errata:** "'Nobody.' Pleasingly literal. Filed."
  3. "Elsewhere. It's where I'm from." →`vellum.call = 'Elsewhere'`
     - **Errata:** "'Elsewhere.' There is no such place in the record. That makes two of you. Filed."
  - Esc: as 1.
- **Errata:** "Correction: I have filed you nowhere. The discrepancy is now a rounding error. Rounding errors are not reported."
- **Errata:** "I have a protocol for this situation. I have decided not to use it."
- `ASK` **Errata:** "You have a question. Your face is doing it."
  1. "Why are you helping me?"
     - **Errata:** "Sixty-one years correcting the record, and you are the first entry I have ever seen that was blank. I should like to see what gets written on it."
  2. "Are you going to report me?"
     - **Errata:** "I report everything. That is what clerks are for."
     - **Errata:** "...I am reporting that there is nothing here. Go on."
     - *(This is a clue: in Chapter 5 it turns out that it reported a great deal.)*
  3. "Thank you."
     - **Errata:** "Noted. Do not thank me where an Aye can hear. They find gratitude suspicious."
  - Esc: as 3.
- **Errata:** "One sack remains, I believe. On the engine-room catwalk. The Aye in the hold turns left at the drive coupling every forty seconds. I mention this for no reason."
- *(Errata walks into the port aisle and stands still among the pigeonholes. Talking to it again: "I am a filing cabinet. Ignore me.")*

### The question from the lamp (third bag hidden)
The player is held in place (freeze) for the exchange. The voices come over the ship's speakers.
- **Vane:** "Captain Brack! A question has come down from the lamp. A very... senior question."
- **Vane:** "Why is the office of the Redactor-General asking for your vessel by name?"
- *(Static. A quiet, courteous voice.)*
- **Leth:** "Captain Brack. Good evening. This is Ansel Leth."
- **Leth:** "You're carrying someone who isn't in the record. I don't blame you. They're very hard to see."
- **Leth:** "Please keep the Rumour at Hesk. I'll be there before the tide turns. Then you can go back to your post, and I'll take it from here."
- **Leth:** "I'm sorry for the inconvenience. Truly."
- **Brack** (intercom): "'Before the tide turns.' Who talks like that?"
- **Brack:** "Right. Nobody's taking anybody off my ship. {call}! Top hatch, middle of the hold. Three docking clamps on the hull. Pop them and we light out."
- **Brack:** "Ayes on the gantry will see you up there, so mind their searchlight. Behind the mail drum or the blister, you're in shadow."
- **Pockets** (popping out of a sack): "THIS WAY UP."
- *Objective:* "Climb to the top hatch. Release the three docking clamps (0/3)."

### On the hull
On first emergence (once):
- **Moderator** (the lamp broadcast, rolling out over the gantry speakers): "Citizens of the Vellum. Agreement is a kindness we do for each other. Rest. The record will keep."
- *Toast:* "Codex: Moderator's Remark No. 12."
- *Toast:* "Mag-soles hold you to the hull. The searchlight sweeps the deck: wait in the shadow of the mail drum or the blister."

**Clamps.** Each one is F · *Release clamp*. The player freezes for 0.8 s, then sound `open`, `shake 0.3`, and toast *"Clamp released (n/3)."*

- **After C1:**
  - **Aye** (gantry): "Movement on the hull. We fire."
  - *Toast:* "Sparker fire! The red lines flash before they hit."
- **After C2:**
  - **Brack** (intercom): "Gavel coming off the lamp. That's a landing boat full of Ayes, pet. Bow clamp. Now."
- **After C3:**
  - **Brack:** "That's my girl! Lighting out! Get inside, {call}, or you'll be the first postmark in the Unlit!"
- **At the hatch, after Errata lands:**
  - **Errata:** "Ah. Hello. I appear to have defected."
  - **Errata:** "Noted."
  - *(The drop and the banner follow.)*

### The galley
Triggered on reaching the upper deck. Brack is at the table, Errata stands, Pockets sits on the stove.
- **Brack:** "Well. That's us in the Unlit. No lamps, no lanes, no Leth. For now."
- **Brack:** "Somebody tell me how the Redactor-General himself heard about a stowaway that fell out of my lens-glass forty minutes ago."
- **Errata:** "The Lamp of Hesk files every anomaly, Captain. Someone read the file very quickly."
- **Pockets:** "SECRET?"
- **Errata:** "Pockets, that word is not helpful."
- **Pockets:** "SECRET."
- **Brack:** "And you, clerk. You jumped a closing gangway onto a ship lighting out. Why?"
- **Errata:** "I have corrected the record for sixty-one years, Captain. I wished, once, to read something that was not already finished."
- **Brack:** "That's either the nicest thing a clerk's ever said to me, or the most worrying."
- `ASK` **Brack:** "{call}. You're the one it covered for. Does the clerk stay?"
  1. "It saved me. It stays." →`vellum.errata.vouched = 'yes'`
     - **Brack:** "On your head, then. Errata, you're crew. Crew does the washing up."
     - **Errata:** "I have no hands suited to washing up."
     - **Brack:** "You'll learn."
  2. "Lock it in the hold until we know more." → `'no'`
     - **Brack:** "Sensible. Sorry, clerk. The hold's warm, mostly."
     - **Errata:** "I understand. I would lock me in the hold too."
  3. "Your ship, Captain. Your call." → `'neutral'`
     - **Brack:** "Coward's answer, that. Fine. It stays where I can see it."
  - Esc: as 3.
- **Pockets:** "LOOK." *(It holds up a palm-sized shard of the rose-gold lens-glass.)*
- **Errata:** "The lens-glass from your crate, Captain. It is still lit. That is stillglass. It is holding a picture."
- *(F · Look into the shard. Over the table, a translucent picture forms: a woman standing in blue ice with her eyes open. It dissolves into a broken lighthouse on a desert of glass.)*
- **A voice in the glass** (faint, broken): "...for anyone unwritten..."
- **Brack:** "That's a lamp. That's the old far-lamp on Vitrine, out past Glassgut. I bought those crates off the miners there."
- **Brack:** "And that's... somebody in ice."
- **Errata:** "Stillglass does not lie, Captain. It can be cut. It does not lie."
- **Brack:** "Vitrine, then. I've post for Glassgut anyway."
- **Pockets:** "EXIT. THIS WAY."
- *(Pockets climbs down to the hold and fixes the shard to the aft bulkhead at [0, 0, 9.4]. The shard spreads into a rose-gold doorway: the **Nowhere Lens**, a `w.portal` to `hub` labelled* Junction *with the subtitle* The way you came in.*)*
- **Brack:** "Well, would you look at that. That your way home, {call}? You can take it, you know. Nobody'd blame you."
- **Brack:** "But the post goes to Glassgut in the morning, and I could use a pair of hands the Censors can't see."
- **Brack:** "Here. Every hand on the Rumour wears one. Means the post office owes you a cup of tea." *(Gives `vellum-cap`.)*
- Banner: **CHAPTER 1 COMPLETE** / *Title earned: the Unentered*.
- *Objective:* "When you're ready, the star map on the bridge. (The Nowhere Lens in the hold leads back to Junction.)"

## What the player learns and earns

**Learns.** Tallies edit memory, and you have none, so drones can't see you. The Redactor-General already knows you exist, and talks like someone from the sea. Stillglass holds pictures and can be "cut". Someone lit a lamp for "anyone unwritten".

**Earns.**
- Title **the Unentered**.
- **Rumour Post Cap** (`vellum-cap`: head, cosmetic, bound), a red courier cap with a brass horn badge.
- Up to 9 codex entries and 3 words.
- Flags: `vellum.ch = 1`, `vellum.call`, `vellum.errata.vouched`.

## Chapter-ending hook

A woman standing in ice with her eyes open, and a lamp lit for anyone unwritten. And somewhere behind you, a polite man who will be there before the tide turns.

## Hub mode (this module, after Chapter 1)

When `vellum.ch ≥ 1`, the module builds the ship in its calm **Unlit** state. Spawn is [0, 0, 6] in the hold.

- **Star map** (bridge console, [0, 5, −40]). F · *Plot a course*: an `ASK` of unlocked destinations plus "Stay aboard", then `w.travel`. Finished chapters stay open for collectibles; their choices are never re-asked.
- **Codex terminal** (galley wall). Reads found entries back through `w.say`, until the engine has a codex panel (BUILD.md).
- **Trophy shelf** (bunks). Models of earned gear, shown by flag.
- **Nowhere Lens** (hold). The way to Junction.
- **Crew by flag.**
  - Brack is on the bridge; Pockets roams.
  - Errata is in the mail room (in the hold until Chapter 3 if `vouched = 'no'`).
  - Quaile is on the hull, Chapters 3–7.
  - Thousand is in the engine light from Chapter 4 (gone after 6 if it stayed).
  - Tern is on the bridge from Chapter 5, if saved.
- **Debriefs.** Later chapters end with `w.travel('vellum-rumour')`. On `enter`, the pending debrief (`vellum.debrief`), that chapter's "Aboard the Rumour" scene, plays once in the galley.
- **Night scenes** (after Chapters 2–4). Toast: *"Ship's night."* Errata whispers in the blister: that chapter's clue, then its cover story.
