# Chapter 10: Margins

**World module:** `vellum-vitrine`, in its **after** state (`vellum.ch ≥ 9`). Same terrain as Chapter 2 · dressing, NPCs and rules change by ending.
**Where:** Glassgut and the far-lamp, some months after Assent Day.
**Rules:** `deny: ['glide']` as before; boards allowed.
**Theme:** late golden afternoon (`sky: 'afternoon-sky'`). Music by ending: Full Light (major, 96 bpm, bright), Open Library (lydian, 72), Kept Light (dorian, 70), Fair Copy (major, 60, `bright: 700`, slightly muted).
**Playtime:** 15–25 minutes.

## Premise

The *Rumour* has post for Glassgut, the way it did the first time. You walk through a town your choices have rearranged, ride the Long Dune for fun, and climb the lamp you came through to decide whether to go home.

## What changes, by ending

| place | Full Light | Open Library | Kept Light | Fair Copy |
|---|---|---|---|---|
| **Sky** | Lane-lights streak the sky: 40 thin glowing lines drifting slowly | Calm. If `thousand = 'stays'`, the Ammonite shows as a faint spiral star in the south | One very bright star low in the east: Cinder Gate, relit | Clear gold. No lanes visible |
| **Tally-gate** | Doors gone. Chalk on the arch: *ARGUE HERE* | Doors open. A new sign: *COUNT YOURSELF* | Doors propped open with a Keeper's staff | Working perfectly. It still can't count you |
| **Main street** | Loud debate (6 arguing citizens), murals of both halves of Saltglass | People reading on the steps | As before, plus a Lightkeeper shrine | Everyone smiles; nobody looks twice |
| **Post office** | Mail to the ceiling | A **reading terminal**, *ASK THE LONG LIGHT*, playing random codex entries | A Keeper's desk: *TRUTHS BY REQUEST* | Normal |
| **Censors** | Gone | Gone | Two, repainted Keeper-blue, carrying post | As before |
| **The Flats** | Open; the fort is a teahouse | Open | Open | Restricted again (Censors still can't see you) |
| **The far-lamp** | Blazing white-gold | Soft, steady | Under repair: scaffolding, two Keeper novices | Dim gold |

**New fixture in every ending: the Long Dune run.** It is now a public sled run, started from a rack at the mesa's south lip. Same course as Chapter 2, without hazards beyond the black glass, plus boost pads. `w.record('dune', t)`, lower is better. *(In the Fair Copy ending the Censor beams remain.)*

## Objectives and critical path

1. Land at the pad. The crew comes with you, depending on who is aboard.
2. *(Optional)* Walk Glassgut: Mags, Hob, the post office, and anyone else whose fate brought them here (see the table).
3. Walk or sled the open Flats to the far-lamp. The stair is mended, with simple steps and no crumbling.
4. At the top: **set your light in the lens.** The crew's farewells. Pockets' sentence.
5. Go home through the lens, or stay.

## Puzzle: the last light

The lens is cracked (a dark seam across it).
- F · *Set your light in the lens*. The player freezes for 2 s while your blade's light flows into the seam, and the lens glows in your blade's colour: rose-gold, green-violet, blue-white or white-gold.
- In **Full Light** and **Open Library** a plaque appears beneath it: *FOR ANYONE UNWRITTEN*.
- In **Kept Light** it reads: *FOR KEEPERS*.
- In **Fair Copy** the lens glows, then dims to a faint ember. The plaque reads: *FOR ANYONE WHO REMEMBERS*.
- It's a small act: the Fifth Form, the Holding, done gently, once more. The world is the reward.

## Set piece: the view from the lamp

The view is ending-specific (see the sky row above). After the light is set:
- the sun drops behind the Long Dune;
- the lens projects a long beam across the Flats toward Glassgut (a translucent box with your blade's colour and glow 1.5);
- the town's windows light one by one.

## Fates (who you meet, and where)

NPCs appear in Glassgut or at the lamp according to these flags. Their lines are under Dialogue.

| who | where they are |
|---|---|
| Brack | Always at the pad and at the lamp. |
| Errata | Always with the crew. It has no tally, so it remembers in every ending. |
| Pockets | Always. It has no tally, and remembers everything. |
| Quaile | At the lamp in every ending. |
| Mags | In the Blowpipe. She remembers you only if `vitrine.slips` and the ending isn't Fair Copy. |
| Tobin | Woken: runs the Glassgut post office, with a dog. Left: stands at the gate as Aye Forty-One (Kept and Fair) or sits on its steps, confused but free (Full and Library). |
| Dace | Full: on the street with a cart of newspapers. Library: at the reading terminal. Kept: the Keeper's desk. Fair: absent (Brack: "Some lad with inky hands sends post. I don't know him."). |
| Thousand | Comes: a swarm in the teahouse rafters. Stays: absent; the Ammonite star shows in the sky. |
| Tern | Here, in a *Rumour* pilot's jacket, training as navigator, if Saltwort was saved, Tern was woken in Chapter 9, or the ending unsealed the tallies (Full, Library). Otherwise absent. |
| Leth | Absent. Brack has news (see Dialogue). |

## Collectibles and codex

No new Pockets' words. This is where they're spent.

**Codex** (the last entries, one per category):
1. **The Vellum, After** (the pad). Text by ending:
   - *Full:* "Every edit undone in a single night. The Loud Years have begun."
   - *Library:* "No tally edits anyone now. The Long Light is open to any reader. The queues are long."
   - *Kept:* "The Last Edit never came. The Lightkeepers keep the record again, and decide."
   - *Fair:* "Peace, at last, by agreement. Almost everyone agrees."
2. **Ansel Leth, After** (Brack's news). Text by `leth.fate` and ending (see Dialogue).
3. **Benedikta Sallow** (the lamp plaque). *"Founder of the Unanimity. Novice who skipped the ninth pillar. She asked for the door to be opened, too late to open it herself."*
4. **Pockets** (after its sentence). *"Mail-sorting clerk, knee-high, six arms, no tally, many pockets. It spoke only in words it found. Once, it found enough."*

## Dialogue

### The pad
Banner: **THE LONG LIGHT** / *Chapter 10 · Margins*.
- **Brack:**
  - *(Full)* "Glassgut. Listen to it. Everyone's arguing. Isn't it lovely?"
  - *(Library)* "Glassgut. Quiet as a reading room. Which it partly is now."
  - *(Kept)* "Glassgut. Same as ever, give or take a Keeper."
  - *(Fair)* "Glassgut. Peaceful, isn't it? Everyone's so... agreed." *(She looks at you.)* "Sorry, pet, you came aboard at Hesk? Remind me your name?"
- *(Fair only)* **Errata:** "{call}. Your name is {call}. I remember. I have filed it under 'us'."
- **Pockets:** "HELLO."

### Glassgut (optional)
**Mags** (the Blowpipe):
- *(Remembers you)* "There's my lovely nobody! My lads remember every birthday. I've had to buy so much cake."
- *(Doesn't)* "Brack's new hand, is it? Sit down, love. Don't drink the tea."

**Hob** (counter):
- *(Full)* "Number twelve's off the screens. Now it's just people shouting. I find I prefer it."
- *(Library)* "I read Saltglass at the terminal. Then the Sillen's own history. Nobody'd ever filed it."
- *(Kept)* "The Keepers say they'll tell us about the glass when we're ready. I'm a hundred and nine. I'm ready."
- *(Fair)* "Lovely day. Agreement is a kindness, isn't it?"

**Tobin** (woken, at the post office counter, a scruffy dog at his feet):
- "Afternoon. Tobin. Postmaster. That's Patch. Well, Patch the Second."
- "I remembered the first one, and then I wanted another. Turns out you're allowed."

**Aye Forty-One** (left; Kept or Fair):
- "We... I... do I know you?"

**Aye Forty-One** (left; Full or Library):
- "There was a dog. I'm trying to remember its name. I think I'm allowed to now."

**Dace:**
- *(Full)* "Read all about it! All of it! Every edition is the truth and they all disagree!"
- *(Library)* "I'm teaching kids to set type in the Glasshouse." *(printed)* "We're rebuilding it first." *(waited)* "The flowers remember us coming back."
- *(Kept)* "I set what the Keepers let out. Some days that's a lot. Some days I want to bite someone."

**Thousand** (comes, in the teahouse rafters):
- "We live in the rafters now. We are teaching Vitrine's moths to remember. They are very small."

### At the lamp
The crew stands in the lantern room.

On setting your light:
- **Quaile:** "There. The lamp's yours now. It points wherever you point it."

Quaile, by ending:
- *(Full)* "I'm going to walk the Margin and answer anyone who asks me about Saltglass. Every question. It'll take years. Good."
- *(Library)* "I'm going to the Ammonite to read. Everything. Starting with the parts I didn't want to."
- *(Kept)* "Two Lightkeepers. We'll need more. There's a school on Amaranth that needs a roof. You'll stay a while?"
- *(Fair)* "I remember. You remember. Pockets and the clerk remember. That's four. I've started with less."

Quaile, by blade (`vellum.blade`):
- *(elsewhere)* "Your blade's the colour of where you came from. Take it home. Show them what it's for."
- *(aurora)* "Skerrow's sky in your hand. It'll talk your ear off on the way."
- *(lane)* "Engine light. Fitting. You never stopped moving."
- *(noon)* "Desert noon. Honest to the end."

**Brack** (news of Leth):
- *(redeemed)* "Letter from Saltwort. A Petrel's moved back onto his old raft. Pours the tea youngest-first and argues with his auntie. She says he's terrible at nets."
- *(spared, Full)* "Leth's testifying at the open hearings on Plenary. Barefoot. Answers everything. They say he never raises his voice."
- *(spared, Library)* "Leth's at the Ammonite, reading his own file. All of it. Thousand says he hasn't left the Saltglass room in a month."
- *(spared, Kept)* "Leth lives under the Keepers' eye on Skerrow. Quaile visits. They argue. She says it's good for him."
- *(spared, Fair)* "The new Moderator's a quiet sort. Barefoot. Gives a different speech every week. Folk like him." *(If `petrel`:)* "Signs his letters 'P'."
- *(arrested)* "Leth's in a cell on Plenary, writing his own record by hand. Asked for paper specially."

Then Brack:
- *(not Fair)* "Post goes out at dawn. There's a bunk for you. There's always a bunk."
- *(Fair)* "Mind how you go, stranger. You've a kind face. Funny, that."

**Errata**, by its state:
- *(kept)* "I have filed you under 'friend'. It was an empty category for sixty-one years. It is filling up."
- *(reset)* "I only met you on a raft, but I feel I've known you longer. Is that a thing? I've filed it as a thing."

*(If Tern is present:)* **Tern:** "Three bends past the Weeping Star. I'll fly you there any time. Gran says hello, barnacle."

### Pockets' sentence
Pockets climbs onto the lens stand and holds out all six hands. It speaks slowly, one card at a time. The line is built from the **key words** collected, in chapter order, skipping any not found:

> THANK YOU · FRIEND · BRAVE · REMEMBER · HOME · ALWAYS · COME BACK · SOON

**Assembly rules.**
- Each word becomes its own sentence ("THANK YOU."), except **COME BACK** and **SOON**, which join as "COME BACK SOON." when both are present.
- If **POCKETS** (Chapter 9) was found, end with "— POCKETS." Otherwise end with "— NO RETURN ADDRESS."
- If none of the first eight were found, the line is its first words instead: "HELLO. FRAGILE. THIS WAY UP."
- **Kept Light:** the final full stop becomes a question mark.
- **Fair Copy:** prefix with your callsign in capitals, then a full stop ("NOBODY.", "STRANGER.", "ELSEWHERE.").

**Examples.**
- Everything found, Full Light: **"THANK YOU. FRIEND. BRAVE. REMEMBER. HOME. ALWAYS. COME BACK SOON. — POCKETS."**
- Three words, Fair Copy, called Nobody: **"NOBODY. FRIEND. HOME. SOON. — NO RETURN ADDRESS."**

After it speaks:
- *Toast:* "Codex: Pockets."
- **Errata:** "That was not a label. That was a sentence. Pockets, that was *yours*."
- **Pockets:** "YES."

### Going home
- `ASK` **Brack:** "Well, pet? Going home?"
  1. "For now. I'll come back." →`vellum.done = true`
     - **Brack:** "Course you will. The post always comes back."
     - *(Banner **THE LONG LIGHT** with the ending title as subtitle: **Full Light** / **Librarian of the Long Light** / **Keeper** / **Fair Copyist**. The title is awarded. The lens becomes a `w.portal` to `hub`, labelled* Elsewhere *with the subtitle* For anyone unwritten*, and you step through when ready.)*
  2. "Not yet. Show me the Vellum." →`vellum.done = true`
     - **Brack:** "Ha! Bunk's yours. Star map's on the bridge."
     - *(Banner and title as above. The lens portal stays open, and the *Rumour*'s star map now offers every world.)*
  - Esc: as 2.

## What the player learns and earns

**Learns.** What became of everyone: the measure of every choice.

**Earns.**
- The ending title: **Full Light**, **Librarian of the Long Light**, **Keeper** or **Fair Copyist**.
- 4 codex entries.
- The Long Dune time trial.
- Flag `vellum.done`.
- The campaign stays open for collectible-hunting. Endings and choices are recorded once and never re-asked.

## The last image

A lighthouse in a glass desert, lit in the colour of the light you chose, pointing at somewhere that isn't in the record, for anyone who isn't either.
