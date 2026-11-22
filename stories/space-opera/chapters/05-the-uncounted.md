# Chapter 5: The Uncounted

**World module:** `vellum-pelagia`.
**Where:** Pelagia, an ocean world. The raft-city Saltwort, and the Old Lamp sunk 220 m south of it.
**Rules:** `deny: ['board']`.
**Theme:** two states.
- **Day and sunset** (the Tidewalk and the tea): `sky: 'afternoon-sky'`, fog `#9fc9d9` [120, 520], `clouds: { y: -30 }`.
- **Storm night** (the raid): near-black sky, rain particles, lightning flashes (a point light pulsing to intensity 80 for 0.15 s with `shake 0.2`, every 6–11 s on a seeded schedule).
- The switch needs `w.theme` (BUILD.md, feature 8). Fallback: a dusk theme throughout, with storm effects added at night.
- Music: dorian, root 50. 76 bpm by day; 96 bpm with `pulse: true` in the storm.
**Playtime:** 50–60 minutes.

## Premise

Only the tide-folk know the way to the Ammonite, and they don't do favours for counted people. The player isn't counted. Neither, it turns out, is the man who comes to tea.

## Layout

The sea surface is y 0. Water is world logic: if `player.y < waterY` you splash and respawn at the last raft checkpoint. `waterY` is 0, except during the Tidewalk. Raft decks are at y 1.

| raft | centre; size | notes |
|---|---|---|
| R1 Landing | [0, 1, 30]; 16×12 | Spawn [0, 1, 26], yaw 180. The *Rumour* is moored at [−25, 0, 40]. Sign **HOME WATERS · NO COUNTING**. |
| R2 Market | [−18, 1, 10]; 18×14 | Stalls, a kelp-tea stove, letter-writers. The gavels land here at sunset. |
| R3 Longhouse | [0, 1, −10]; 24×18 | An open-sided hall (pillars, a thatch roof at y 6). **The tea table** is at [0, 1, −14]. |
| R4 Children's | [22, 1, 4]; 14×12 | Tents, toys, and Tern's diving board (a 1×4 plank at y 3, facing south). Tow cleats at three corners. |
| R5 Kelp farm | [30, 1, −20]; 20×10 | Nets as crumbling walkways (delay 0.6). |
| R6 Tide Bell | [−28, 1, −24]; 10×10 | A bronze bell on a frame. The shrine of letters to the drowned. |
| R7 Mast | [10, 1, −34]; 10×10 | A mast to y 26 with climbing pegs (blocks 1.2 m apart, alternating sides). The crow's nest is a 3×3 platform at y 22. |

- **Bridges.** Plank bridges 1.2 m wide link R1–R2, R1–R3, R2–R3, R3–R4, R3–R7, R4–R5 and R2–R6.
- **Bobbing.** R2, R4 and R5 bob as 2-point movers (±0.3 m, period 4–5 s; ±0.8 m in the storm).

**The seabed** (revealed at low tide):
- The floor is y −30, sand-textured (`gravel`, tinted ochre), with rocks (`boulder`, `mossy-rocks`), kelp (tall green cones, `collide: false`) and tide pools (hazard discs).
- **The sandbank path** runs south from under R4 to the Old Lamp, about 200 m.
- Midway is **the wreck**: a windjammer hull lying on its side at [6, −30, −110], 30 m long, with ribs as hurdles and an open hold to run through.

**The Old Lamp:** a lighthouse tower of radius 7 at [0, −30..+10, −230].
- **Exterior ledges** spiral up the outside: 14 ledges (2×2), each 2.8 m higher and 40° further around.
  - Ledges 6 and 11 are crumbling.
  - Between 9 and 10 the gap is 6 m: Second Step.
- A **broken balcony** at y 2 projects south. From it the lantern gallery (y 7) can only be reached by climbing to ledge 14 (y 9) and gliding 10 m across.
- **The lens** sits in the lantern at [0, 9, −230]: a disc of radius 2 with an etched spiral chart that glows when read.

**Distant:** at sunset the *Final Word* (décor, a 1,400 m book shape) hangs at [0, 380, −700], blotting out the sun.

## Objectives and critical path

1. Arrival. Mother Skua sets the test: walk the tide.
2. *(Optional, until the bell)* Explore Saltwort: the Tide Bell letters, the market, the mast.
3. **The Tidewalk.** Race Tern down the drained seabed and up the Old Lamp before the tide returns. Read the lens.
4. **Tea with the Redactor-General** at sunset. Leth exposes Errata, and Mother Skua names him.
5. **The raid** in the storm. At its height, choose: the children's raft, or the lens.
6. **Errata's confession.** Choose its correction.
7. Leave for the Ammonite.

## Encounters

**The raid: Ayes with assent to break.** The first real fight: sentries with health, like Junction's dummies.
- **Breaking them.** Three blade strikes (12 bare-handed) break an Aye's assent. It kneels, takes off its faceplate and stays down, confused.
- **Their fire.** Sparker shots are telegraphed red lines (0.8 s). A hit pushes you back 3 m and costs one of three **hearts** (BUILD.md, feature 4). At zero, you respawn at the raft checkpoint.
- **Wave 1:** three Ayes land on R2 from a gavel.
- **Wave 2:** three more on R3, plus storm **wind gusts** (force 20, ±x, 1.5 s every 5 s, warned by sheets of rain).
- **Censors** are useless here; Pelagians have no tallies either. Toast: *"A Censor scans the whole raft-city and reports it empty."*

## Puzzles and solutions

**P1: the Tidewalk** (a timed race, 150 s).
- **Start.** Ring the Tide Bell or step onto Tern's board. `waterY` drains from 0 to −30 over 10 s, and the sea mesh follows.
- **The clock.** At t = 60 s the tide turns, rising back to 0 by t = 150 s (0.33 m/s), always behind you.
- **The route.**
  - Drop from the board onto the sandbank.
  - Skirt the tide pools (hazard discs; a pool returns you to the board).
  - Run through the wreck's hold. Its ribs are 1.2 m hurdles.
  - Climb the Old Lamp's ledges (Second Step at 9 → 10).
  - Glide from ledge 14 to the lantern gallery.
- **Tern** runs a fixed path (an avatar stepped in `tick`) and arrives at t = 120 s. Winning or losing changes only Tern's line.
- **Caught by the tide:** you float up and respawn on R4, with the tide reset. Mother Skua's line plays once.

**P2: saving the raft** (if chosen).
- R4 has been cut loose and is being towed by three cables to a gavel hovering at [60, 12, 10]. The raft drifts east as a mover, 0.8 m/s.
- Chase it across R3 and R5 (crumbling nets). Then double-jump from R5's east edge to the drifting raft (a 5 m gap that widens with time).
- Break the two Ayes on board, and cut the three tow cleats (F · *Cut the line*, 1 s each).
- When the last line goes, the gavel's tow snaps, the raft drifts back on the current, and Pelagian boats arrive.

**P3: chasing the lens** (if chosen).
- Vane's gavel lifts from the Old Lamp carrying the lens, rising past Saltwort: a mover from [0, 12, −200] to [0, 40, −40] over 25 s.
- Climb R7's mast to the crow's nest (y 22). As the gavel's open ramp passes below and ahead, glide onto it (a catch zone 6×3×6 riding with the mover).
- Break Vane's two Ayes. F · *Take the lens*.
- Then jump off; the Veil carries you back to R3.

## Set pieces

1. **The Tidewalk.** The sea drains away, and you race a cocky fifteen-year-old down a seabed and up a sunken lighthouse while the ocean climbs back behind you.
2. **Tea with the Redactor-General.** The sun goes out behind a city-sized book. A barefoot man pours the tea youngest-first, and an old woman says his drowned name.
3. **The storm raid.** Lightning, rafts heaving, and a choice made at a run.

## Collectibles and codex

**Pockets' words.**

- HOME (key): landing raft sign *"HOME WATERS · NO COUNTING"*
- LOW TIDE: the Old Lamp's base plate
- TEA: market stall *"KELP TEA · HOT"*

**Codex.**
1. **Pelagia** (arrival). *"An ocean world under one great moon, the Tidemother, whose pull drains the sea thirty metres every evening. Its raft-clans never took tallies."*
2. **The Uncounted** (Mother Skua). *"Barefoot, bird-named, tide-singing. The Unanimity leaves them uncounted because there is nothing on Pelagia worth editing. It is wrong about that."*
3. **Letters to the Drowned** (a letter-writer on R2). *"Pelagians write to their drowned. Brack carries the letters to the Tide Bell, where they are read aloud at low tide. She has never read one."*
4. **Margin Slip: "To Petrel"** (on the Tide Bell, under a stone). *"Petrel, if the sea gave you back, come home. The raft's still yours. I still pour the tea youngest-first. —Auntie. (34th year)"*
5. **The Old Lamp** (the lens). *"A Lightkeeper lamp sunk in the Clamour. Its lens holds the chart the tide-folk used to ferry Keepers through the Hush to the Ammonite."*
6. **Petrel** (after the tea). *"Mother Skua's sister's boy. At twelve, a Margin slip nailed to a Saltwort mast revealed that his father ran cargo for the Unanimity. The clan cut the family's raft loose in a storm. Petrel swam to a patrol boat and asked for a tally."*
7. **Moderator's Remark No. 12, again** (gavel speakers during the raid). *"Played over a raid: 'Agreement is a kindness we do for each other.' The third time you've heard the same words."*
8. **Errata's Report** (after the confession). *"Sixty-one nightly reports since Hesk. Struck out of them: the Old Lamp, the moths, and a dog called Biscuit."*

## Dialogue

### Arrival
Banner: *Chapter 5 · The Uncounted*.
- **Brack:** "Pelagia. No tallies, no lamps, no Censors worth the name. The Unanimity says they're too poor to edit."
- **Quaile:** "They're not poor. They keep their money in the sea."
- *(A broad woman in sea-boots strides onto the landing raft, two fishers and a skinny teenager behind her.)*
- **Mother Skua:** "Lightkeeper. I can smell it on you. Like a struck match."
- **Mother Skua:** "And a mail captain, a clerk, a jar of moths, and— what's that?"
- **Tern:** "Gran, the Censor on the buoy didn't even blink at that one."
- **Mother Skua:** "Huh. A blank. Haven't met a blank who wasn't born wet."
- **Quaile:** "We need the way to the Ammonite. Your grandmothers rowed us there."
- **Mother Skua:** "And our grandmothers were paid, barnacle. In good glass. Then you lot started a war and stopped tipping."
- **Mother Skua:** "The way's carved on the Old Lamp's lens. The Old Lamp's under the sea, except at low tide, which is in an hour."
- **Mother Skua:** "Uncounted folk don't do favours for counted folk. But a blank... a blank I'll test. Walk the tide."
- **Tern:** "Race you."
- `ASK` **Mother Skua:** "Well, blank? Will you walk the tide with my grandchild?"
  1. "Race accepted."
     - **Tern:** "You'll lose. I've been doing this since I was six."
  2. "What happens if the tide catches me?"
     - **Mother Skua:** "You float back here and everyone laughs at you. That's Pelagian justice."
     - **Tern:** "It's very effective."
  - Esc: as 1.
- *Objective:* "Explore Saltwort until low tide. Then ring the Tide Bell, or meet Tern at the children's raft."

**Saltwort, optional.**
- **Letter-writer** (R2): "Writing to my brother. Drowned nine years. He'd want to know the kelp came in thick. Your captain takes them to the Bell."
- **Brack** (R2): "Post's post. I don't read them. Doesn't stop them reading me."
- **Errata** (on the *Rumour*'s deck): "The Pelagians are very difficult to file. They have no numbers. I find I like them."

### The Tidewalk
- **Tern** (at the board): "Tide's going. On the bell, we go. First to the lens wins. Loser carries the nets."
- *(If the tide catches you, once:)* **Mother Skua** (from the raft, laughing): "Float, barnacle! Float home!"
- *(If you win:)* **Tern:** "...You beat me. Nobody beats me. Gran's going to be unbearable."
- *(If Tern wins:)* **Tern:** "Ha! Nets are yours, blank."
- **F · Read the lens.** The etched spiral glows: a chart of lanes through a dark nebula.
  - **Tern:** "There. Into the Hush, three bends past the Weeping Star, the unlit lane by the dead lamp, then the shell. Got it."
  - **Tern:** "Pelagians remember tides. That's all a chart is: a tide that doesn't move."
- *(A windjammer slides alongside the lamp as the sea returns. Fade; you are back at the longhouse at sunset.)*

### Tea with the Redactor-General
The sun goes out behind the *Final Word*. Gavels settle on the market raft, and Ayes file out and stand still. A man in a plain grey coat walks across the bridge, barefoot. At the table sit Mother Skua, Quaile, Brack, Tern and the player; Errata stands at the edge of the hall.
- **Leth:** "Good evening. May I sit? I've been on my feet since Hesk."
- **Mother Skua:** "You've got Ayes on my market raft."
- **Leth:** "They'll stand very still. I promise. I'd like a cup of tea before the tide turns."
- *(He pours for everyone, Tern first: the youngest first.)*
- **Mother Skua** *(staring)*: "...Where did you learn to pour like that?"
- **Leth** *(to you)*: "You must be the one the record can't see. {call}, isn't it? Errata's been very thorough."
- **Errata:** "...Redactor-General."
- **Brack:** "What did you say?"
- **Leth:** "Your clerk has filed a report every night since Hesk. Beautifully written. Lately it's started striking things out, which I found rather moving. One can still read through a strike, of course."
- *(Quaile is on her feet, blade lit.)*
- **Leth:** "Please sit down, Keeper. You're Orla Quaile. You started a war with half a record. I've read the other half."
- **Leth:** "I'm not here to fight. I'm here to ask."
- **Leth** *(to you)*: "Come with me. Not as a prisoner. As a colleague. You and I are the only two people in the Vellum the Fair Copy can't see. I did it to myself. I'd like to know who did it to you."
- **Leth:** "Help me finish the record, kindly. And I'll leave Saltwort as I found it: uncounted, and alone."
- `ASK` **Leth:** "What do you say?"
  1. "No."
     - **Leth:** "I thought not. I'd have thought less of you otherwise."
  2. "Why did you do it to yourself?"
     - **Leth:** "Because when I was twelve, a true thing was nailed to a mast not far from here, and it drowned my family. I wanted nobody ever to be able to post anything about me again."
  3. "Why does Mother Skua keep staring at you?"
     - **Leth:** *(a pause)* "Because she's sharp. She always was."
  - Esc: as 1.
- **Mother Skua** *(slowly standing)*: "...Petrel?"
- *(Leth goes still.)*
- **Mother Skua:** "My sister's boy. Petrel. They said you drowned with them, and you swam."
- **Leth:** "Hello, Auntie."
- **Mother Skua:** "You took a tally. A Pelagian boy took a *tally*."
- **Leth:** "I asked for one. I wanted to forget the mast, and the slip, and the storm. It worked, for a while."
- `ASK` *(The table looks at you.)*
  1. "Petrel. Your aunt has been mourning you for thirty-four years." →`vellum.leth.petrel = true`
     - **Leth:** *(a long pause)* "...Don't call me that. Please."
  2. *(Only if the "To Petrel" slip was found)* "She still writes to you. It's on the Tide Bell." →`vellum.leth.petrel = true`
     - *(You put the slip on the table. He reads it. He folds it very small and puts it in his coat.)*
     - **Leth:** "...She still pours youngest-first."
  3. "Redactor-General. Leave these people alone."
     - **Leth:** "I will. If you come with me."
  4. *(Say nothing.)*
     - **Leth:** "...Thank you for not saying it."
  - Esc: as 4.
- **Leth** *(rising)*: "I'll give you the tide to decide. Pelagians always get the tide."
- **Leth:** "When it turns tonight, I'll come back for {call}. And I'm very sorry for what happens if they aren't on the landing raft."
- **Leth:** "I find it kinder to say these things plainly. Thank you for the tea, Auntie."
- *(He walks away. The gavels lift.)*
- **Brack:** "Clerk."
- **Errata:** "Yes, Captain."
- **Brack:** "Every night?"
- **Errata:** "Every night. Since Hesk."
- **Brack:** "Hold. Now. We'll talk after."
- *Objective:* "Night is coming, and so is Leth. Get ready to defend Saltwort."

### The raid
Storm state. Wave 1 lands on R2.
- **Aye barks:** "We count this raft."; "We agree."; *(when broken, kneeling)* "...Where are we? Why is it raining?"
- **Gavel speakers:** "Citizens of the Vellum. Agreement is a kindness we do for each other." *(Toast: "No. 12. Again.")*
- *(After wave 2, a scream from the east.)*
- **Tern** (from R4, which is moving): "They've cut the school raft loose! The little ones are on it! I'm with them, I've got them—"
- **Quaile** (from the Old Lamp side): "And that's Vane's gavel on the Old Lamp. He's taking the lens!"
- `ASK` **Quaile:** "Raft or lens, {call}? We can't do both!"
  1. "The raft. The children." →`vellum.pelagia = 'saved'`
  2. "The lens. We need the way." →`vellum.pelagia = 'chased'`
  - Esc: ask again.
- **Saved** (P2): on cutting the last line:
  - **Tern:** "You came for us. You actually came."
  - *(If you chased instead, the raft's lights vanish into a gavel's belly, and the gavel climbs into the clouds.)*
- **Chased** (P3): on boarding the gavel:
  - **Vane:** "Unhand that— that is Ordinance property!"
  - **Vane:** "...Fine. Keep it. I have *children* to file."

### Dawn: Errata's confession
On R1, the storm breaking. Errata stands at the raft's edge. (If saved: it cut its way out of the hold to help free the raft lines. If chased: it went after the gavel and was too slow.)
- *(Saved:)* **Mother Skua:** "You chose my children over your map. Uncounted folk don't forget that. Saltwort owes you a tide." *(She ties a shell-and-feather charm to your wrist: `vellum-charm`.)*
  - **Tern:** "And I've still got the map. In here."
- *(Chased:)* **Mother Skua** *(cold)*: "You've got your glass. They took Tern. They took six children to be counted."
  - **Mother Skua:** "Get off my water."
- **Errata:** "I have a confession. It is in the form of a report, because that is the only form I know."
- **Errata:** "Report. Since Hesk, Archive Clerk E-R-Eight has filed sixty-one nightly reports to the office of the Redactor-General, as ordered. The seal under my paint is his."
- **Errata:** "I reported Vitrine. I reported Skerrow. I reported the Keeper. I did not report the Old Lamp, the moths, or the dog called Biscuit. I struck those out."
- *(If `vouched = 'yes'`:)* **Errata:** "You vouched for me, at the start. I filed that under 'evidence'."
- *(If `'no'`:)* **Errata:** "You locked me in the hold, at the start. You were right to."
- **Errata:** "I cannot refuse the order. It is in me, under the paint. But I have found that I can misfile."
- **Errata:** "There are two corrections available. The Captain's tools could remove the seal, and everything written since it was fitted. Sixty-one years. Clean. I would not remember Hesk. Or you."
- **Errata:** "Or I could try to break it myself. I do not know if I can. It would hurt, insofar as I hurt. And I would remember everything, including what I did."
- `ASK` **Errata:** "{call}. You filed me as crew. Which correction?"
  1. "Break it yourself. Keep your memories. I forgive you." →`vellum.errata = 'kept'`
     - *(It shakes. Gold light cracks from its shoulder, and the seal burns out in a puff of sparks.)*
     - **Errata:** "...Done. I— Correction. *We* did it. Noted. Noted."
     - **Brack:** "Welcome back, clerk. You're still doing the washing up."
  2. "Reset. Start clean. It's kinder." →`vellum.errata = 'reset'`
     - *(Brack's tools. Errata goes still, then its lens-eye relights.)*
     - **Errata:** "Archive Clerk E-R-Eight. Good morning! I do not recognise this ship. Are you the postmistress? I love post."
     - **Brack** *(quietly)*: "...Yeah, pet. I'm the postmistress."
     - **Pockets:** "HELLO?"
     - **Errata:** "Hello, small one! What lovely pockets."
  - Esc: ask again.
- **Quaile:** "The Ammonite. Now, before Leth finds the way himself."
- *(Saved:)* **Tern:** "I'm coming. You need a navigator." **Mother Skua:** "...Bring her back, blank."
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 5`.)*

## Aboard the Rumour (debrief 5)

- **Quaile:** "He said I started a war with half a record. He's right. And he says he's read the other half."
- **Brack:** "He poured the tea youngest-first. Pelagian manners on a Redactor-General. Somebody raised him right, and then somebody else got to him."
- *(If `errata = 'kept'`:)* **Errata:** "I would like it noted that this is the first night in sixty-one years I have no report to file. I do not know what to do with my hands." **Brack:** "Washing up."
- *(If `'reset'`:)* **Errata:** "Captain, I have sorted your post alphabetically by the sender's mother's name. Is that useful?" **Brack:** "...It's lovely, pet."
- *(Saved:)* **Tern:** "Three bends past the Weeping Star. I'll stand on the bridge and say it every hour if you like."
- *(Chased:)* **Thousand:** "We will read the lens. We are made for reading small things in the dark."
- **Pockets:** "HOME." *(if found; otherwise "TEA?")*

## What the player learns and earns

**Learns.**
- Leth is Petrel of Saltwort. He is unentered by choice, and a true slip drowned his family.
- Errata was his informant, and began misfiling.
- The way to the Ammonite.
- The Unanimity will take uncounted children to be counted.

**Earns.**
- Title **Friend of Saltwort** (saved) or **Tide-Chaser** (chased).
- **Saltwort Tide-Charm** (`vellum-charm`: head, cosmetic, bound; only if saved).
- Up to 8 codex entries and 3 words.
- Flags: `vellum.ch = 5`, `vellum.leth.petrel`, `vellum.pelagia`, `vellum.errata`.

## Chapter-ending hook

The *Rumour* turns into the Hush with a chart, in a girl's head or etched in a stolen lens. Behind it, a barefoot man folds a letter very small and does not throw it away.
