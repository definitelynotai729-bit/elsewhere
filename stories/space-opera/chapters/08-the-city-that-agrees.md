# Chapter 8: The City That Agrees

**World module:** `vellum-plenary`.
**Where:** Plenary, the Unanimity's capital city-world, on the night before Assent Day.
**Rules:** none denied (`rules: {}`). This is the sled's chapter.
**Theme:** night.
- Sky top `#0a1430`, horizon `#3a4f8a`. Fog `#5a6fa8` [80, 600]. `stars: 0.3`. Bloom 0.6.
- The city's white towers carry rows of identical lit windows: emissive strips like lines of text.
- The *Final Word* hangs over the Scriptorium (décor: a book shape, gold-lit spine).
- Music: lydian, root 60, 80 bpm, very orderly. It switches to major, 92 bpm, sparkle 0.6, during the blizzard.
**Playtime:** 50–60 minutes.

## Premise

Tomorrow at dawn the Last Edit makes every tally permanent, and after that a note in your own hand won't break anything ever again. Tonight is the last night paper matters. The Margin means to print one slip for every person in the capital. It needs a line worth reading.

## Layout

Plenary is built in three bands. The Scriptorium spire is always visible on the skyline to the north (−z): 400 m tall, master lamp at its crown, at [0, 0, −900] (décor in this chapter).

| band | where | contents |
|---|---|---|
| **The Footnotes** | y −40..0, x −80..80, z +60..−60 | Flooded canals (water plane y −40, a hazard), arches, paper lanterns, chalked Margin marks. The *Rumour*'s hidden dock is at [−50, −40, 40]; spawn [−40, −38, 34], yaw 120. **The Press Hall** is a cavern 60×30×40 centred [20, −38, 0] (floor y −38), holding the **Great Press**. The **Weathervane Tower** rises from [60, −38, −40]. |
| **The Rails** | y 20..80 | Glowing transit rails (boxes 1.2 m wide, blue emissive edges) curve between towers. **Trams** (8×3×3 movers) run some lines; stations are 10×10 platforms. |
| **The Records Annex** | a tower floor at y 70, [−60, 70, −160], 40×8×40 | Aisles of filing cabinets; some are **moving shelves** (2-point movers sliding 4 m). The Moderator's desk is at the far end, with Ampersand. |

**Rail lines (with the sled).**
- **Line A** (Footnotes lift → Annex). It leaves the Footnotes' public lift top (y 20, [−30, 20, 10]) and climbs in sweeping curves to the Annex station [−60, 70, −140]. Boost pads every 50 m.
  - **The gap:** a broken span at [−45, 48, −80], 9 m. A boosted jump (`w.jumpPad` power 16 plus forward speed) or a Second Step.
- **Line B** (Annex → Weathervane). A long descending line with tram crossings (time the trams or ride on their roofs: the movers carry you).
- **The miners' ramp** (only if `vellum.vitrine.slips`). Mags's crews have bolted a glass-miner's ramp from Line A to Line B, cutting the return in half.

**The Weathervane Tower:** a 160 m iron lattice (y −38..120) topped by a giant **weathervane** (décor `w.spin`, slow) and four **slip hoppers**.
- A cargo lift (a mover, 2.5 m/s, 3 s pause) runs up its core.
- Exterior girders form a climbing route: beams every 3 m, with diagonal braces as ramps.
- Gust zones above y 80 push ±x for 1.5 s every 6 s.

## The Assent Hour (the chapter's rhythm)

- **The cycle.** Every **90 s** of play (Plenary's "hours" are compressed for the game), the bells ring.
- **For the next 12 s:**
  - every citizen avatar stops;
  - a unison chant plays (toast and banner text: *"We agree; we remember; we are one record."*);
  - **every Aye freezes** (sentries disabled, visors dim).
- **Censors keep floating**, but they can't see you anyway.
- **The point:** Aye checkpoints that block the rails are passable *during* the Hour. You ride through a frozen city while it speaks with one voice. The rest of the time you find another way, or break them (Chapter 5 combat rules).
- **After the slips fall** (the end of the chapter), the last Assent Hour plays with the chant **out of unison**: voices stumble, some stop. Banner: *"For the first time in sixty-two years, the Assent is not unanimous."*

## Objectives and critical path

1. The Footnotes: meet the Printer and Dace. The plan needs a true line.
2. Ride Line A to the Records Annex (Assent Hour timing; the broken span).
3. Find **Ampersand** among the moving shelves. Learn that the Moderator is dead. Take **the File of Forty**.
4. Return (Line B, or the miners' ramp) to the Press Hall.
5. **Choose the headline.** Clear the Great Press's jam.
6. Climb the Weathervane. Open the vanes: **the paper blizzard**. Glide and ride down through falling paper.

## Encounters

- **Aye checkpoints.** Four along the rails, two Ayes each, standing across the rail (sentry, 35° / 10 m).
  - Pass them during an Assent Hour, break them (3 strikes each), or take a tram's roof past them.
  - **If `vellum.tobin = 'woken'`**, the checkpoint at Line A's midpoint is manned by woken Ayes, who lift their faceplates an inch and wave you through. **Tobin:** "Not yet. But soon."
- **Censor searchlights** sweep the Annex windows. They're harmless to you, but they'd see Dace, so Dace waits outside.
- **The man in the Annex lobby**, a citizen filing a complaint about a dream, is comic. Optional.

## Puzzles and solutions

**P1: the moving shelves** (Annex). Twelve cabinet rows; four of them slide 4 m back and forth on movers (3 s period), opening and closing aisles. Ampersand's desk is at the far end.
- The shelves are 3 m tall, so you can't jump them, but you can climb the stationary rows by their drawers (steps every 0.8 m) and walk along the tops.
- **Solution:** take the third row's top, wait for shelf 7 to slide open, drop, and take the aisle.

**P2: the Great Press.** A machine 20 m long and 12 m high in the Press Hall.
- **The fault.** Three **type-forms** have jammed at different levels: y −34 (on the feed belt), y −30 (behind the inking rollers) and y −27 (on the platen frame). Each needs one blade strike to knock it loose.
- **Feed belts:** two horizontal movers (3 m/s, 0.5 s pause).
- **The platen:** a 6×1×4 slab dropping 3 m every 4 s, a crush hazard while down. Its shadow warns you.
- **The inking rollers** are décor; the ledge behind them is the route.
- **The climb:** belt → roller ledge → wait out the platen → climb its frame.
- **When all three are free,** the press runs: a wall counter rolls to *40,000,000*, and crates go up the Weathervane lift.

**P3: the Weathervane.** Ride the lift (slow), or climb the girders (faster, with gusts above y 80).
- At the top, F · *Open the vanes* on each of the four hoppers (N, E, S, W platforms around the vane, joined by 1 m catwalks).
- **If `vellum.pelagia = 'saved'`,** Tern holds the lift at the top, and the hoppers' N and S doors are already open.

## Set piece: the paper blizzard

1. When the fourth vane opens, the wind takes the slips. A storm of white paper (particles, `kind: 'snow'`, size 0.25, count 2,500, over a 600×200×600 area) pours out over the city and drifts down for the rest of the chapter.
2. **Windows light up across the city:** thousands of window strips switching from cool white to warm gold in waves, as people wake and read.
3. **The ride down.** Step off the vane platform. The Veil carries you over the rooftops in falling paper (y 120 → Line B's high station at y 60, 260 m away; about 60 m of drop at 4.5:1 is about 270 m: designed to just make it).
4. On the rail, the sled carries you on down Line B to the Footnotes in a long, fast curve. Slips stick to the rail lights.
5. The last Assent Hour rings **out of unison**. Banner, toast and `shake 0.4`.
6. At the dock, Juniper is waiting, reading a slip with her own name on it.

## Collectibles and codex

**Pockets' words.**

- SOON (key): a tram sign on Line A, *"NEXT TRAM: SOON"*
- MIND THE DOORS: the Annex lift
- PRINTED MATTER: the Press Hall crates

**Codex.**
1. **Plenary** (arrival). *"The Unanimity's capital: a city-world of white towers whose windows run in neat lines like text. At every Assent Hour, the whole city stops and speaks together."*
2. **The Footnotes** (the dock). *"Plenary's lowest levels, where the light comes second-hand. The Margin has lived here for forty years, in the small print."*
3. **The Assent Hour** (first bells). *"'We agree; we remember; we are one record.' Forty million voices, one breath. The Ayes freeze where they stand until it's done."*
4. **Juniper Mirrin** (meeting her). *"The Printer. Eighty-six, ink to the elbows. She has run the Margin by post for forty years and never once been edited, because she sleeps on a mattress stuffed with her own letters."*
5. **Ampersand** (meeting it). *"Filing clerk to the Moderator's office for sixty years. It joins everything with 'and', because it has never been allowed to finish a thought before the next one arrives."*
6. **The File of Forty** (from Ampersand). *"Forty remarks, filed in order, over and over, for twenty years. The last new thing the Moderator said was never broadcast: 'Ansel, come here.'"*
7. **The Great Slip** (after printing). The chosen headline, plus "printed 40,000,000 times".
8. **Margin Slip: "Dace"** (Juniper's desk). *"June. Your grandson is alive. He's on Amaranth. He prints. He is extremely loud. You'd love it. —J (you)"*

## Dialogue

### The Footnotes
Banner: *Chapter 8 · The City That Agrees*.
- **Brack:** "Plenary. I came here once at nineteen with a treaty in a satchel. They gave me a medal and a tally. I kept the medal."
- *(A small hunched woman in a printer's apron comes down the dock with Dace behind her.)*
- **Juniper:** "So you're the blank. Dace said you'd be taller. He says that about everyone."
- **Dace:** "I do not."
- **Juniper:** "Paper remembers what people are told to forget. That's all the Margin's ever been, love. Forty years of paper."
- **Juniper:** "At dawn the Last Edit makes every tally permanent. After that, a slip in your own hand won't break a thing. So tonight's the last night paper matters."
- **Juniper:** "One slip for every soul on Plenary. Forty million. Dropped from the Weathervane at midnight, on the wind. They'll wake up holding it."
- **Juniper:** "But a slip needs a line, and the line needs to be true, and big enough. We've had forty years of small truths. I want a big one."
- **Juniper:** "There's a clerk in the Moderator's annex who's filed her remarks since before Dace was born. If anything's wrong at the top, that clerk knows. It knows everything, and it says it all at once."
- *(If `vellum.dace = 'printed'`:)*
  - **Dace:** "Every Aye patrol in the city's got my face since the Glasshouse slips. Worth it. Amaranth burned for it, though. Thousand's flowers. All of it."
  - **Dace:** "I'll wait at the bottom of Line A."
- *(If `'waited'`:)*
  - **Dace:** "I've still got the Glasshouse record. Saved it for the most good, like you said. I think it's nearly time."
  - **Dace:** "I'll wait at the bottom of Line A."
- *Objective:* "Ride Line A to the Records Annex."

**Optional Footnotes talk.**
- *(If `vitrine.slips`:)* **Mags** (by a stack of sleds): "Told you my lads'd remember their kids' birthdays! Brought the whole co-op. We've bolted a ramp between your rails. You're welcome."
- *(If `pelagia = 'saved'`:)* **Mother Skua** (on a windjammer in the canal): "Saltwort owed you a tide. Here's the tide. Don't make me regret it, barnacle."
- *(If Thousand came:)* **Thousand:** "So many people asleep above us. We can feel them remembering things they shouldn't, and forgetting things they should."
- *(If Thousand stayed:)* **Brack:** "Look up. That faint spiral, just there. That's the Ammonite. Still lit."

### The Annex: Ampersand
Behind the last shelf, an old, thin clerk with a brass ampersand for a face-plate, at a desk of index cards.
- **Ampersand:** "oh a visitor and nobody visits and I have been filing the Moderator's remarks for twenty years and she says one every week and I file it and"
- **Ampersand:** "and there are forty of them and she says them in order and then she starts again and I file number one again and number two again and"
- **Ampersand:** "and I asked once whether she might say a new one and they told me the Moderator does not take requests and I filed that too"
- **Ampersand:** "and number twelve is my favourite because it is kind and I have filed number twelve two hundred and six times and"
- `ASK` *(Ampersand waits, its pen trembling.)*
  1. "When did she last say something new?"
     - **Ampersand:** "twenty years ago this winter and it was 'Ansel, come here' and it was not in the broadcast and I filed it anyway because I file everything and then nothing new ever again and"
  2. *(Only if 5+ Moderator's Remarks were collected)* "I heard number twelve at Hesk, on Vitrine and on Pelagia. Word for word."
     - **Ampersand:** "yes and on every world and in every year and the same breath in the same place and that is because it is the same light and"
  3. "Is the Moderator alive?"
     - **Ampersand:** "I am a filing clerk and I am not permitted to know things, I am only permitted to file them and"
     - **Ampersand:** "...and a person who is alive says new things"
  - Esc: as 1.
- **Ampersand:** "and she is dead isn't she and she has been dead for twenty years and I have been filing a lamp"
- **Ampersand:** "and you may have the file if you like because I am very tired and I would like someone else to know"
- *(Key item `vellum-forty`: The File of Forty.)*
- *(If `errata = 'kept'`:)*
  - **Errata** (by comm, or in person if brought): "Ampersand. This is Archive Clerk E-R-Eight. You may stop filing now. I have it."
  - **Ampersand:** "oh and thank you and"
  - *(Its pen goes still. It rests, peacefully, mid-word.)*
- *(If `'reset'`:)*
  - **Errata:** "What a beautiful filing system! May I help?"
  - **Ampersand:** "and yes and please and"
- *Objective:* "Get the file back to the Printer."

### The headline
In the Press Hall, Juniper reads the File of Forty, then puts it down very carefully.
- **Juniper:** "Twenty years. We've been fighting a recording for twenty years."
- **Juniper:** "Well, blank? You found it. You set it. What does the slip say?"
- `ASK` **Juniper:**
  1. "THE MODERATOR IS DEAD. SHE DIED TWENTY YEARS AGO." →`vellum.slip = 'dead'`
     - **Juniper:** "Oh, that'll wake them. That'll wake the whole city screaming. Good."
  2. "YOU ARE BEING EDITED. READ THIS IN YOUR OWN HAND." → `'edited'`
     - **Juniper:** "The old words. They work. Slowly, but they work."
  3. "REMEMBER." → `'remember'`
     - **Juniper:** "One word. People will fill it in themselves. That's either brilliant or useless. We'll know by breakfast."
  - Esc: as 2.
- *(If `dace = 'waited'`:)*
  - **Dace:** "Then it's time. The Glasshouse goes on the back. Both sides true. That's the most good I've got."
  - *(The codex entry "The Glasshouse Burning" unlocks now.)*
- **Juniper:** "And the Great Press has jammed, because of course it has. Three forms, up in its guts. Dace is too big to fit. You aren't."
- *Objective:* "Clear the three jammed type-forms in the Great Press."
- *(When the press starts:)* **Juniper:** "Listen to her. Forty years I've waited to hear her run flat out."
- *Objective:* "Climb the Weathervane. Open the four vanes."

### The Weathervane
- *(If `pelagia = 'saved'`, at the top:)* **Tern:** "Held the lift for you! Gran says Pelagians are good with wind. We're good with wind."
- *(If Thousand came:)* **Thousand** (a cloud around the vane): "We will dance with the Censors so they look at us. They like looking at things. It's all they do."
- *(After the fourth vane:)* **Juniper** (comm): "...Look at it. Look at it come down."
- *(At the dock, after the ride:)* **Juniper** *(holding a slip)*: "One of them landed on me. My own line, in my own press, in my own hand. I'll be sleeping on this one."
- **Brack:** "Dawn in five hours. The Scriptorium's sealed itself, and the *Final Word* is sitting on top of it like a hen."
- **Brack:** "Get some sleep, pet. In the Unlit, where it counts. We go up at first light."
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 8`.)*

## Aboard the Rumour (debrief 8)

The night before. Short scenes, one per crew member present. Walk up to each to hear theirs.
- **Brack** (on the bridge): "I carried the Assent up that spire at nineteen. Tomorrow I'll carry you. Funny old route, the post."
- *(kept)* **Errata:** "I have one report left in me. I intend to file it with the whole Vellum." / *(reset)* **Errata:** "Captain says tomorrow is important. I have polished my lens-eye. Twice."
- **Pockets:** "SOON." *(if found; otherwise "PRINTED MATTER.")*
- *(If Thousand came:)* **Thousand:** "We remember Quaile at the jar, tapping the glass to make us glow. Bring her back. She owes us a tap."
- *(Saved:)* **Tern:** "If you see Uncle Petrel up there... I mean the Redactor-General. If you see him. Tell him the raft's still his. Gran won't say it."
- **Dace** (in the hold, inking his hands): "Gran's never been afraid of anything. She's afraid tonight. I like her better for it."

## What the player learns and earns

**Learns.**
- The Moderator died twenty years ago; the Vellum has been ruled by her recording.
- Her last words, never broadcast: "Ansel, come here."
- The capital can stop agreeing.

**Earns.**
- Title **Margin-Writer**.
- **Printer's Visor** (`vellum-visor`: head, cosmetic, bound): a green celluloid eyeshade, from Juniper.
- Up to 8 codex entries and 3 words.
- Flags: `vellum.ch = 8`, `vellum.slip`.

## Chapter-ending hook

Forty million people wake before dawn holding a slip of paper. Above them, in a spire with its doors sealed, a dead woman's image is about to say number one again, and an old Keeper sits beside a stone, refusing.
