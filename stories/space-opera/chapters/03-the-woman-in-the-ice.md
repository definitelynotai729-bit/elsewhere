# Chapter 3: The Woman in the Ice

**World module:** `vellum-skerrow`.
**Where:** Skerrow, an ice world. A crevassed glacier climbing to an old Lightkeeper observatory, now a Unanimity listening post.
**Rules:** `deny: ['glide', 'board']`.
**Theme:** night, deep blue. `stars: 0.8`. Snow particles (`kind: 'snow'`). Fog `#0d1b33` [60, 380].
- **Aurora:** five curtains of tall, thin, translucent boxes (glow 1.6, opacity 0.18, green and violet) at y 120–180, slowly pulsing in `frame`.
- **Ice:** colour `#cfe8ff`, rough 0.1, metal 0.1.
- **Music:** minor, root 52, 60 bpm, sparkle 0.25.
**Playtime:** 40–50 minutes.

## Premise

Quaile's message said "in the ice at Skerrow, under the old observatory." The Unanimity listens to Skerrow's sky from that observatory, and has no idea what it is standing on.

## Layout

| area | bounds / position | notes |
|---|---|---|
| Moraine camp | x −30..30, z +10..−20, y 0 | Gravel. The *Rumour* (décor) at [−24, 0, 6]. Spawn [−12, 0, −2], yaw 180. |
| Glacier tongue | x −25..25, z −20..−140 | Ice ramp segments rising to y 36 (surface y ≈ 0.3 × (−20 − z)). Rocky moraine walls on both sides (texture `cliff`, height 20). |
| Crevasse 1 | z −44..−47 | 3 m, full width: a single jump. |
| Crevasse 2 | z −56..−60 | 4 m. An ice bridge of crumbling tiles (delay 0.5) at x −6..−2. |
| Crevasse 3 | z −72..−77 | 5 m, too wide. A fallen serac (a tilted block) bridges it at x 8..12; an ice bridge at x −15. **Tobin's ledge** is at [10, 14, −74.5], 2 m below the lip. |
| Crevasse 4 | z −90..−94 | 4 m, with three seracs (blocks 2–4 m tall) to hop across. |
| The Ridge | x −4..4, z −110..−140, y 30..36 | Wind gusts and ice pillars as windbreaks. |
| Observatory plateau | x −40..40, z −140..−210, y 36 | Two Unanimity huts (east [26, 36, −170], north [−20, 36, −150]). A gavel pad at [25, 36, −150]. |
| The dome | centre [0, 36, −175] | Wall cylinder radius 14, y 36..44; dome above (radius 14, top y 58). North door [0, 36, −161], east door [14, 36, −175]. A glowing **aperture** slit high on the west side. |
| Telescope | the dome's centre | A great brass tube (radius 1.5, length 9) on a cradle (radius 3, height 4): it blocks any straight beam across the middle. Its tube is tilted as a ramp from [−4, 36, −175] up to [3, 46, −175]. |
| Gallery | ring at y 46, radius 8–10 | Four mirror stations on it. Reach it by the telescope ramp (in the floor Ayes' view) or the **star-chart rack** on the north wall: four crumbling ledges at y 38.5 / 41 / 43.5 / 46. |
| The well | shaft radius 2, centre [0, 36, −184] | Under the south mirror station. An iron grate at y 36 until the beam arrives. The shaft falls to the **chamber** at y 6. Spiral rungs inside (blocks every 30°, 1 m rise). |
| Well chamber | radius 8, y 6..12 | The **stilled pillar** (a glowing cylinder, radius 0.9, height 3, with Quaile's figure inside) at [0, 6, −184]. The plaque **BE BRAVE · BE STILL**. Three ice pillars for practice. Tunnel east. |
| Ice tunnel | [2..20, 6..10, −184] | Leads out to the **icefall** ledge at [20, 10, −184]. |
| Icefall | [20..44, 10 → 0, −184..−160] | Seracs S1–S5 down to the moraine (see the set piece). The *Rumour*'s ramp is at [44, 0, −160]. |

**Sightlines.** From the camp the dome's silhouette sits on the skyline under the aurora, with its aperture glowing. From the Ridge you look back down the whole crevasse field to the *Rumour*'s lights.

## Objectives and critical path

1. Climb the glacier (crevasses, aurora echoes). Meet Tobin at crevasse 3.
2. Cross the Ridge. Enter the observatory.
3. Reach the gallery and turn four mirrors to pour the Needle's light into the well.
4. Descend the well. Wake Quaile: the spar, then the blade.
5. Light the stillblade. Strike three ice pillars.
6. Vane fires on the glacier. Escape down the icefall, learning the Second Step on the run.

**Optional:** the three aurora echoes, the north hut (a slip and a Moderator remark), and the telescope plaque.

## Encounters

- **Aurora echoes.** Three zones (z −50, −85, the Ridge) where ghost avatars (opacity 0.35) play a 6 s moment with a line.
- **Ridge wind.** ±x gusts (force 18, 1.5 s every 5 s), each warned by a snow swirl. Ice pillars at [−3, 33, −118], [3, 34.5, −126] and [−2, 35.5, −134] have a calm lee.
- **Dome Ayes** (sentry spec: 35°, 9 m, 0.5 s):
  - F1–F3 circle the floor at radius 6, 120° apart, at 1.2 m/s.
  - G1 laps the gallery every 60 s. **If Tobin is woken, G1 leaves for the east hut ("the heater has a fault").**
  - Caught: respawn inside the north door.
- **Censors.** Two drift under the dome. First bump: *"UNRECORDED OBSTRUCTION. APOLOGIES. AGAIN."*
- **The listening dish** (west station). A beam on it sends the nearest floor Aye to look up from the ramp's foot for 20 s.

## Puzzles and solutions

**P1: the crevasse field.**
- Crevasse 1 is a running jump.
- Crevasse 2: the ice bridge crumbles 0.5 s after you land, so don't stop on it.
- Crevasse 3: the fallen serac at x 8..12. Climb its low end and walk up its spine. Tobin is right beside it.
- Crevasse 4: hop the three seracs.

**P2: the four mirrors** (the core puzzle).
- **Stations.** Four stand on the gallery at y 46: **W** (west, [−9, 46, −175]), **N** ([0, 46, −166]), **E** ([9, 46, −175]) and **S** ([0, 46, −184], over the well).
- **The beam.** The Needle's light enters the west aperture at y 47 heading +x and runs in straight segments between stations, drawn as ice-white glowing boxes recomputed on every change.
- **The block.** The telescope stops any segment through the centre (within 3 m of [0, −175]).
- **The mirrors.** F · *Turn the mirror* cycles a station through the arrows painted on its base, each showing where incoming light goes (N, NE, E, SE on W, and so on). A toast names the setting.
- **The well mirror (S)** adds **DOWN**, which tips the beam into the well.

**Solution.** The beam travels a diamond around the telescope.

| station | setting | sends the beam |
|---|---|---|
| W | NE | toward N |
| N | SE | toward E |
| E | SW | toward S |
| S | DOWN | into the well |

**Failure states are visible, never punishing.**
- Wrong settings send the beam into the telescope (it stops), out through the dome wall (nothing), or **into the listening dish** (W set to SE): an alert, an Aye looks up, you hide behind a mirror for 20 s.
- Players solve it by watching the light.

**P3: the spar.**
- Quaile's guard opens (her blade flashes white) for 0.7 s every 2 s. Strike (key 1) within 2.6 m during the flash to land a hit.
- Her lunges are telegraphed by a red arc on the floor (0.6 s). If you're in the arc you're pushed back 4 m: no damage, no respawn.
- Three hits end it. Strikes with the dark hilt count here, because the spar is about timing.

## Set piece: the icefall

When Vane's guns hit the glacier, the chamber shakes (`shake` every 3 s) and the tunnel east cracks open. The icefall is a descent from y 10 to 0, with the glacier collapsing behind you:

| step | from → to | gap | notes |
|---|---|---|---|
| Ledge → S1 | [20,10,−184] → [24,9,−182] | 3 m | Crumble, delay 0.4. |
| S1 → S2 | → [31,8,−178] | **6.5 m** | Too far to jump. Quaile teaches the **Second Step** here (the player is frozen while she speaks; the gap waits). |
| S2 → S3 | → [36,6,−173] | 4 m | Falling ice: a block slides along a 2-point mover across the path every 3 s (a hazard). |
| S3 → S4 | → [42,5,−166] | **7 m** | A double jump. A chunk of glacier collapses behind you (a crumble chain). |
| S4 → slope | ramp to [44, 0, −160] | — | Slide into the *Rumour*'s ramp zone. |

- **Camera-dressing:** burst particles of ice dust on each step, `shake 0.4` on each landing, and a deep groan sound (`crumble`).
- **Death plane:** below y −8. Respawn at the S2 checkpoint (placed after the lesson).

## Collectibles and codex

**Pockets' words.**

- BRAVE (key): well-chamber plaque, *"BE BRAVE · BE STILL"*
- LOOK UP: telescope plaque
- QUIET: north hut sign, *"QUIET PLEASE · LISTENING"*

**Codex.**
1. **Skerrow** (arrival). *"An ice world at the edge of the Binding. The Lightkeepers built an observatory on its glacier to watch the Needle, the brightest star in the western Vellum."*
2. **The Aurora of Skerrow** (echo 1). *"Skerrow's sky is full of old light leaking from the glacier, where Keepers stilled what they saw during the Dimming. On cold nights it replays."*
3. **Echo: "You cut it"** (echo 2). *"Sixty-year-old stillglass: one Keeper shouting at another, 'You cut it, Orla! You cut the record!'"*
4. **Listening Post 9** (dome door). *"The Unanimity listens to Skerrow's sky. It hears the old light, records it, and files it under 'weather'."*
5. **Moderator's Remark No. 4** (north hut terminal). *"'No one need carry the past alone.'"*
6. **Margin Slip: "Not a number"** (north hut bunk). *"If you are reading this in your own hand: your name is not a number. Your mother's dog was called Patch. —You, before."*
7. **Tobin** (if woken). *"Aye Forty-One remembered a dog, then a name. Assent is a light trance; sometimes a hand is enough to break it."*
8. **Haskell Orme** (on receiving the blade). *"First Keeper of the Lightkeepers until the Dimming, and Quaile's teacher. His hilt was dark for sixty years."*
9. **The Stilling** (on lighting the blade). *"The discipline of asking light to stop. Its tenets: Still the hand, that it strikes true. Still the eye, that it sees whole. Still the heart, that it holds light."*

## Dialogue

### Arrival
Banner: *Chapter 3 · The Woman in the Ice*.
- **Brack:** "Skerrow. Cold enough to freeze a rumour. That was a joke, pet. Laugh, it's warmer."
- *(If `vouched = 'no'`:)* **Brack:** "Clerk! Out of the hold. I need your counting."
- **Errata:** "The observatory is at the top of the glacier. The listening post holds six Ayes and two Censors. I counted them on the way in."
- **Brack:** "Errata and Pockets stay with me. They'd light up a Censor like a festival. It's you or nobody, {call}."
- *(If `call = 'Nobody'`:)* **Brack:** "...Well. It's you."
- **Pockets:** "COLD."
- *Objective:* "Climb the glacier to the observatory."

### Aurora echoes
- **Echo 1** (two ghost Keepers running, Ayes behind them):
  - **Ghost Keeper:** "Don't still it here, they'll read it! Run!"
- **Echo 2** (two Keepers face to face, one pointing at the other):
  - **Ghost Keeper:** "You cut it, Orla! You cut the record!"
- **Echo 3** (one woman walking up into the storm with a lamp; no line). Toast: *"A woman with a scar through one eyebrow, walking toward the observatory. Sixty years ago."*

### Tobin
Near crevasse 3, a voice from below:
- **Tobin:** "Help. We— I— help."
- *(F · Help the Aye up. He scrambles over the lip, faceplate cracked.)*
- **Tobin:** "We thank you, citizen. We will record your— You're not there."
- **Tobin:** "Our visor says there's no one there. But your hand. I felt your hand."
- **Tobin:** "We... I... there was a dog. Why do I remember a dog?"
- `ASK` *(The Aye stares at you, swaying.)*
  1. "What's your name? Not your number. Your name." →`vellum.tobin = 'woken'`
     - **Tobin:** "Forty-One. We are Forty-One."
     - **Tobin:** "...No. Tobin. It was Tobin. My mother called me in for supper. 'Tobin, the dog's out.' Tobin."
     - **Tobin:** "Why does that hurt to say?"
     - **Tobin:** "The others walk the dome in a ring. The one on the gallery... I'll send him to the east hut. Say there's a fault in the heater. There's always a fault in the heater."
     - **Tobin:** "Why am I helping you? I don't know you. I don't know me."
  2. "Go back to your post, soldier." →`vellum.tobin = 'left'`
     - **Tobin:** "We... yes. We agree. We agree."
  - Esc: as 2.
- *(Either way he walks downhill toward the huts and out of the chapter.)*

### The observatory
- Sign at the north door: *SKERROW OBSERVATORY · LISTENING POST 9 · ALL SOUNDS ARE RECORDED*.
- **Aye barks:** "We listen."; "Skerrow is quiet. We agree."; *(if Tobin is woken)* "The heater has a fault again."; On detection: "HALT. You are not in the record."
- **The well grate**, before the beam: toast *"An iron grate. Below, a glow like deep water. It won't move."*
- **First mirror turned:** toast *"The mirror swings on its turntable. The arrow on its base shows where it will send the light."*
- **Beam into the well:** the grate glows white and melts away (`hide()`). `shake 0.5`. The shaft fills with blue light. *Objective:* "Descend the well."

### The woman in the ice
**F · Touch the light.** A burst of 200 particles (white and gold), `shake 1.0`. The pillar shatters and the figure inside falls forward onto her hands.
- **Quaile:** "—the record! Benedikta, don't—"
- **Quaile:** "Who are you? Where's... Stand back. Stand BACK."
- *(The spar. Objective: "Strike when her guard opens (0/3).")*
- **Quaile** (after the third hit): "You fight like someone who's never been taught. Good. Then nobody taught you wrong."
- **Quaile:** "There's no tally behind your ear. You're... blank."
- **Quaile:** "You came through my lamp. Someone actually came through my lamp."
- **Quaile:** "I didn't call *you*, you understand. I called *anyone*. You came. That's better."
- `ASK` **Quaile:** "How long? How long was I stilled?"
  1. "Sixty years."
     - **Quaile:** "Sixty..." *(A long pause.)* "Then everyone I knew is old, or a name on a wall."
  2. "A long time. I'm sorry."
     - **Quaile:** "Don't be sorry. You say 'a long time' the way a doctor says 'let's sit down'."
  - Esc: as 1.
- `ASK` **Quaile:** "And the Lightkeepers?"
  1. "I think you might be the last."
     - **Quaile:** "No. There'll be others. There's always one more lamp in the dark."
     - **Quaile:** "...You don't know. Of course you don't. You've been here an afternoon."
  2. "There's an empire now. The Unanimity."
     - **Quaile:** "The Unanimity. Ha. That was her word. Benedikta's word. She said it like a prayer."
  - Esc: as 1.
- **Quaile:** "Give me that hilt."
- **Quaile:** "This was Haskell's. My teacher. He'd be furious you're holding it like a spoon."
- **Quaile:** "Light doesn't go *into* a hilt, child. It *stays*. You have to ask it to stop."
- **Quaile:** "Every ray you've ever seen is still travelling somewhere, with a picture of what it touched. Most of it scatters. We ask a little of it to stop."
- **Quaile:** "Pick a light. One you've truly looked at. A blade remembers the light it was stilled from, all its life."
- `ASK` **Quaile:** "Which light will you still?"
  1. "The light of the lamp I came through." →`vellum.blade = 'elsewhere'` (rose-gold)
     - **Quaile:** "From Elsewhere. I've never seen a colour like that. Nobody has. Hold it."
  2. "The aurora over this glacier." → `'aurora'` (green-violet)
     - **Quaile:** "Skerrow's sky. It's full of old memories, that light. It'll be a talkative blade."
  3. "The Rumour's lane-drive." → `'lane'` (blue-white)
     - **Quaile:** "Engine light. Practical. We were lamp-tenders before we were anything grand. Haskell would approve."
  4. "Vitrine's noon." → `'noon'` (white-gold)
     - **Quaile:** "Desert sun. Honest light. It doesn't flatter anything."
  - Esc: as 1.
- **Quaile:** "Now. Hold still. Not your hand. *You*."
- **Quaile:** "Still the hand, that it strikes true. Still the eye, that it sees whole. Still the heart, that it holds light."
- *(Take `vellum-hilt`; give and equip `vellum-blade-<choice>`. Banner **THE STILLED EDGE** / First form. Toast: "Press 1 to strike. Your stillblade also lights the dark, in any world that allows light.")*
- **Quaile:** "There. Strike those." *(The three ice pillars glow: targets. Each shatters on a blade strike.)*
- **Quaile** (after the third): "Good. Clumsy. Good."
- *(A deep boom. Ice dust falls from the shaft.)*
- **Vane** (loudhailer, far above): "Attention, ice! The Redactor-General requires whatever is down that well! Ayes: fire on the glacier!"
- **Quaile:** "Who is that idiot?"
- `ASK` **Quaile:** "Well?"
  1. "Redactor Vane. He follows me around."
     - **Quaile:** "Then let's lose him."
  2. "Run now, talk later?"
     - **Quaile:** "Oh, I like you."
  - Esc: as 2.
- *Objective:* "Escape down the icefall."

### The Second Step
On reaching S1, Quaile (NPC placed at S2, waving) speaks across the gap:
- **Quaile:** "Too far to jump. So don't *only* jump. Jump, and then still a step under your foot. Light, stopped. Stand on it."
- **Quaile:** "Now!"
- *(Give and equip `vellum-step`. Banner **THE SECOND STEP** / Second form. Toast: "Press Space again in mid-air.")*
- **Quaile** (on landing): "There. Second form. The first thing most children manage is falling on their faces."
- *(At S4, the double gap:)* **Quaile:** "Again! Don't look at the glacier, it's not interesting!"

### The ramp
- **Brack:** "Get in, get in! Who's this?"
- **Quaile:** "Orla Quaile. Keeper of the Light. Who are you?"
- **Brack:** "Ottoline Brack. The Rumour. Post."
- *(If `brack.letter = 'read'`:)*
  - **Brack:** "...Orla. 'Forgive me, Orla.' She said your name. The Moderator. At the signing."
  - **Quaile** *(stopping dead on the ramp)*: "...Later."
- *(If `'kept'`:)*
  - **Brack** *(a long look)*: "...Orla. In. Now."
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 3`.)*

## Aboard the Rumour (debrief 3)

- **Quaile:** "This ship is held together with string and opinions."
- **Brack:** "So am I, love."
- **Quaile:** "Sixty years. And Benedikta is the Moderator. Benedikta Sallow. My student. I remember her at twenty, crying at sad songs."
- **Errata:** "The Moderator addresses the Vellum every week. She is very calm."
- **Quaile:** "She was never calm a day in her life."
- *(If `brack.letter = 'read'`:)*
  - **Brack:** "'Forgive me, Orla.' She said it at the signing, the night I brought her the Assent. I wrote it down so I'd remember. I didn't."
  - **Quaile:** "...Forgive her for what?"
- *(If `'kept'`:)*
  - **Errata:** "Keeper, the Moderator was your student?"
  - **Quaile:** "She was."
- **Errata:** "Your heart rate changed, Keeper."
- **Quaile:** "Clerks shouldn't count heartbeats."
- **Quaile:** "There was a school on Amaranth. The Glasshouse. If anything of us survived, it's there. Before I go anywhere near the Ammonite, I want to know who's left."
- **Errata:** "The Ammonite?"
- **Quaile:** "A shell. Never mind. Amaranth first."
- **Errata:** "Amaranth. Noted."
- **Pockets:** "BRAVE." *(if found; otherwise "COLD.")*

**Optional, in the hub afterwards: talk to Errata.**
- `ASK` *(Where the paint has scraped off its shoulder, something gold shows through: a stamped seal, a quill crossed by a bar.)*
  1. "What's that seal on your shoulder?"
     - **Errata:** "A manufacturer's mark. All clerks have one."
     - *(Codex: "A Seal Under the Paint". It is a lie, and Chapter 5 says so.)*
  2. "Never mind."
- **Night scene 3:**
  - **Errata** (whispering in the blister): "...E-R-Eight. The Keeper is awake. Orla Quaile. She spoke of 'the Ammonite'. Destination Amaranth. Filed."
  - *(If approached:)* **Errata:** "Defragmenting, {call}. Sleep well."

## What the player learns and earns

**Learns.**
- Tallies dull the Stilling, and you have none.
- Someone once accused Orla of "cutting the record".
- Quaile was the Moderator's teacher, and her heart races at the name.
- An Aye can be woken.
- The Ammonite exists.

**Earns.**
- **Stillblade** in the chosen colour (`vellum-blade-<light>`): hand, `blade` and `light`, bound. A slim hilt with a silent blade of stopped light.
- **Second Step** (`vellum-step`): feet, `doublejump`, bound. Soft boots that flash a disc of light on the second jump.
- Title **Spark** (a novice of the Light).
- Up to 9 codex entries and 3 words.
- Flags: `vellum.ch = 3`, `vellum.tobin`, `vellum.blade`.

## Chapter-ending hook

A woman of a hundred and nineteen, in a body of fifty-nine, sits on the hull of a mail ship, staring at stars that have moved. Below her, a clerk whispers "Amaranth" into the dark.
