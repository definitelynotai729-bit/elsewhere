# Chapter 9: The Fair Copy

**World module:** `vellum-scriptorium`.
**Where:** the Scriptorium, the 380 m archive spire at the heart of Plenary, on Assent Day.
**Rules:** none denied.
**Theme:** dawn.
- **Below the clouds:** pale gold horizon, steel-blue sky, fog [100, 500].
- **Above the cloud deck** (`clouds: { y: 250, color: '#ffe9d6' }`): full sunrise light, `sunIntensity 3`, `bloom 0.7`.
- The *Final Word* hangs just above the crown (décor).
- Music: minor, root 50, 88 bpm, `pulse: true`. At the final choice it changes per ending (BUILD.md, feature 8).
**Playtime:** 50–70 minutes.

## Premise

Forty million people woke up holding paper. The doors of the Scriptorium are sealed. At the top of it, a man who closed a door gently twenty years ago is waiting for an old woman to open her hand, and she won't.

## Layout

| part | position; size | notes |
|---|---|---|
| **Plaza** | x −80..80, z +80..−70, y 0 | White stone and gold inlay. The crowd: 60 citizen avatars, plus Ayes on a cordon line at z −60. Spawn [0, 0, 60], yaw 180. |
| Spire base | radius 30, centre [0, 0, −100] | The great doors at [0, 0, −70] (8×12). The **Window** at [25, 14, −72]. The **Drain** grate at [−32, −6, −90]. |
| **The Stacks** | inside the base, floors at y 0 / 30 / 60 / 90 / 120 | Ring-shaped halls (radius 6–28) of towering shelves. The **paternoster lift**: six 2×2 platforms on a loop mover (speed 2 m/s) up the east side from y 0 to 120 and down the west. **Redaction sheets** cross the halls. |
| Cloakroom | y 150, at the hall's entrance | The sign **PLEASE EMPTY YOUR POCKETS**. |
| **The Moderator's Hall** | y 160, radius 26 | Tiered seats around the dais at [0, 160, −120], where the **Moderator's image** stands. The sealed drawer is behind the dais. |
| **The Spine** | an exterior spiral ramp, radius 22–26, from y 170 to 380 | Three turns. Broken spans (6–8 m), spire **heat vents** (`w.wind` up, 4×20×4, force [0, 26, 0]) and **quill strafing lanes**. The cloud deck is at y 250. |
| **The Crown** | a disc of radius 20 at y 380 | A floor of 2×2 tiles. **The master lamp** at the centre: a great upright lens (radius 6) on a pedestal 4 m high. The **cradle** seat at its foot: Quaile sits there, holding the Heartglass. |

**Sightlines.**
- From the plaza the spire vanishes into cloud.
- From the Spine above y 250, the cloud sea is gold, the *Final Word* is close enough to read its windows, and the faint spiral of the Ammonite shows on the horizon if Thousand stayed.

## How the ending game reads your choices

- **Tobin woken:** the cordon Ayes unmask and open the **great doors**, and the first-floor squad is absent.
- **Vitrine slips:** Mags's glass ramp gives a sled jump through the **Window** (y 14), skipping floor 0.
- **Neither:** only the **Drain** (P1).
- **Pelagia saved:** Pelagians hold the plaza, so there is one fewer Aye squad on floors 60 and 90.
- **Pelagia chased:** Tern stands among the counted children. Give Tern the lens to wake them (`vellum.tern.woken`).
- **The slip** shapes the crowd:
  - *'dead'* is loud and pushing, so fewer Ayes inside;
  - *'edited'* stands reading, and some Ayes join it;
  - *'remember'* stands silent, and Leth notices.
- **Errata kept:** it opens Leth's drawer and gives the stone its copies. **Reset:** you break the drawer, and paper becomes the record.
- **Thousand comes:** no strafing on the Spine's second turn.
- **Quaile's stance and her farewell:** her first words and her wish.
- **Petrel:** unlocks "Offer him the light".

## Objectives and critical path

1. **Enter the spire** by the doors, the Window or the Drain.
2. Climb **the Stacks** (paternoster lift, shelves, redaction sheets, Aye squads).
3. **The Moderator's Hall:** unmask the image, and open Leth's drawer.
4. Climb **the Spine** above the clouds.
5. **The Crown:** Leth. The duel.
6. Leth's fate. Errata's report. **The final choice.**

## Encounters

- **Aye squads.** Two per floor, following Chapter 5 rules.
- **Redaction sheets.** A thin black plane sweeps a hall at waist height every 5 s, warned by an ink line 0.8 s ahead. Jump it.
- **Quills** (on the Spine). Three strafing runs per turn: a red lane for 1 s, then a hazard strip for 0.4 s.
- **Censors** drift everywhere, useless against you. One reads *UNRECORDED OBSTRUCTION. APOLOGIES. IT'S YOU AGAIN.*

## Puzzles and solutions

**P1: the Drain** (when no ally opens a door).
1. Drop through the grate into the service culvert, where water flows at your ankles.
2. Climb three pump-wheels: rotating décor whose fixed spoke-platforms you step up.
3. Cross a crumbling grille.
4. Come up through a floor hatch on Stack floor 0.

It adds about 6 minutes. No combat; it's shadowed by one Aye patrol.

**P2: the Stacks.** Ride the paternoster up the east side, and step off at each floor to clear it. The halls have **gaps in the floor** where shelves have been pulled: memory-style pits, crossed by Second Step or by climbing the shelves (drawers every 0.8 m). Each floor's lift onward is unlocked by a **reading lamp** (F) at the floor's far side.

**P3: the image.**
- **F · Read the File of Forty to her.** As she speaks, a toast counts: *"Remark No. 12. Filed: 207 times."*
- **Hold your blade near her.** Your blade's light unstills her: the image freezes mid-word, fractures into flakes of light and falls into its source, a small stillglass disc on the dais labelled *M · AUTO · 40*.
- **The drawer:**
  - *kept:* Errata knows the seal: "I wore it."
  - *reset:* three blade strikes.

**P4: the Spine.** Three turns, with a checkpoint on each.
- **Turn 1:** a 7 m gap (Second Step).
- **Turn 2:** two broken spans: ride a heat vent up, then glide across.
- **Turn 3:** above the clouds, a 14 m glide from a vent to the crown's lip.

## The duel with Leth

**Leth** (an avatar with a quench-staff) uses world-side boss logic. He has 12 hit points, and your blade deals 1 per strike. Three phases of 4 hits each. He never "dies"; at 0 he kneels.

| phase | his moves | your window |
|---|---|---|
| 1 (12→8) | **Sweep:** an ink line across the floor, 0.7 s, then a knee-high black bar. Jump it. **Strike-through:** a straight lunge along a lane telegraphed for 0.8 s. Step aside. | He's open for 1.5 s after each lunge (his coat edges glow). |
| 2 (8→4) | **Redaction:** every 6 s he quenches a ring of floor tiles, which go black and fall away. The crown shrinks to islands; cross gaps with the Second Step. | The same windows, now across gaps. |
| 3 (4→0) | **Memory floor:** your light brings the fallen tiles back as memory-bridges (the Ammonite rule, 5 m radius). He sweeps faster (every 2 s). | He's open after each pair of sweeps. |

A hit on you costs a heart (3 hearts). At zero you respawn at the crown's lip with Leth's health unchanged: fair and forgiving.

## Collectibles and codex

**Pockets' words.**

- POCKETS (key): the cloakroom sign, *"PLEASE EMPTY YOUR POCKETS"*
- QUIET ROOM: the hall door plaque
- ABOVE: the Spine marker, *"ABOVE THE CLOUDS · CROWN"*

**Codex.**
1. **The Scriptorium** (plaza). *"The archive spire of the Fair Copy: three hundred and eighty metres of edited history, with the master lamp at its crown. Every tally in the Vellum listens to that lamp."*
2. **Sallow's Last Message** (the drawer). The full text (see Dialogue).
3. **The Moderator, 1st–42nd years of the Assent** (after the unmasking). *"Benedikta Sallow led the Unanimity for forty-two years and died in her bed twenty years ago. Since then she has been a recording."*
4. **Errata's Last Report** (*kept*). *"Sixty-one years of edits at Hesk, every name struck out, filed in copy and given to the Heartglass. 'The report I was built to write.'"*
5. **The Margin's Paper** (*reset*). *"With no clerk's copy to draw on, the last sixty years of the true record were rebuilt from slips: forty years of the Margin's paper, and forty million sheets from last night."*
6. **Ansel Leth** (after his fate). Text varies with the fate (see Dialogue).

## Dialogue

### The plaza
Banner: *Chapter 9 · The Fair Copy*.
- **Brack:** "I'm coming up. Don't argue. I carried the Assent up this spire once. I'll carry the end of it."
- *(slip 'dead')* **Citizen:** "She's dead? She's been DEAD?"; **Citizen:** "Then who's been talking?"
- *(slip 'edited')* **Citizen** (reading): "'Read this in your own hand.' ...It is my hand."
- *(slip 'remember')* *(No one speaks. Thousands of people hold paper up toward the spire in silence.)*
- *(Tobin woken:)*
  - **Tobin** (on the cordon): "You said I'd know when. This is when."
  - **Tobin:** "Ayes! Faces off."
  - *(A whole rank lifts away its faceplates: young, frightened, human faces. The great doors grind open.)*
- *(vitrine.slips:)* **Mags:** "Ramp's bolted and the window's that one. Don't miss, love, it's a long way to the gift shop."
- *(Chased, among the counted children:)* `ASK` *(Tern stares at nothing, a new tally glinting behind one ear.)*
  1. "Here. Your lens. Your chart." →`vellum.tern.woken = true`
     - **Tern:** "...Three bends past the Weeping Star. I know that. I *know* that. Where's Gran?"
  2. "I'll come back for you."
  - Esc: as 2.
- *Objective:* "Get into the Scriptorium."

### The Moderator's Hall
The cloakroom sign comes first:
- **Pockets:** "POCKETS?"
- **Pockets:** "POCKETS!"
- *(Toast: "Pockets has found the word for itself.")*

In the hall, the image is mid-broadcast:
- **Moderator** (image): "Citizens of the Vellum. Agreement is a kindness we do for each other."
- *(F · Read the file. Toast: "Remark No. 12. Filed: 207 times.")*
- *(Your light unstills her. She fractures into falling flakes.)*
- *(If Brack is present:)* **Brack:** "Twenty years. She's talked to me in my galley every week for twenty years, and she was dead."
- *(kept)* **Errata:** "His seal is on this drawer. I know it. I wore it." *(The drawer opens.)*
- *(reset)* *(Three strikes. The lock bursts.)*
- Inside, a stillglass disc labelled *For Ansel. Not for broadcast.* F · *Play it.* An old woman in a narrow bed, very real, very tired:
  - **Sallow:** "Ansel. Come here. Sit. I haven't much breath, so listen."
  - **Sallow:** "When I'm gone, tell them. All of it. Saltglass, Orla's half, and mine. The tallies. Every edit."
  - **Sallow:** "I built a quiet room and called it peace. It was only quiet. Open the door."
  - **Sallow:** "And find Orla, if she's anywhere. Tell her I was a fool too. Everyone's a fool."
  - **Sallow:** "I'm sorry I couldn't do it myself. I was afraid. Don't be."
- *(If `brack.letter` is 'read' or 'shared':)* **Brack:** "'Forgive me, Orla.' She meant it, then. All the way to the end."
- *Objective:* "Climb to the crown."

### The crown
Leth stands at the lens. Quaile sits at its foot, cradling the Heartglass.
- **Leth:** "You found her message."
- **Leth:** "I listened to it every night for a year. Then I locked it in a drawer and made her say number one again."
- **Leth:** "She was afraid, and she was right to be. You've seen Saltglass. One true half made a war. Imagine all of it, at once, in every head."
- *(slip 'remember')* **Leth:** "Did you hear them down there? Forty million people, holding paper, saying nothing. I've never heard Plenary so loud."
- **Leth:** "I'm not a monster, {call}. I'm a man who closed a door gently. Please don't make me open it."
- *(petrel)* **Leth:** "And don't call me by that name. Not here."
- **Quaile:** "Ansel. Benedikta asked you."
- **Leth:** "Benedikta asked a great many things at the end. People do."
- **Leth:** "I'm sorry. This won't hurt. You won't remember that it did."

**During the duel** (toasts, one per phase):
- *(Phase 2)* **Leth:** "You can't be seen either, can you? Two blank pages. We could have written something together."
- *(Phase 3)* **Leth:** "I swam for an hour in the dark. Nobody came. I decided nobody should ever have to remember a night like that."

At zero, Leth kneels.
- **Leth:** "Go on, then. Whatever you're going to do. Only be quick. I've never liked waiting for the tide."
- `ASK`
  1. "Get up. You're going to watch what happens next." →`vellum.leth.fate = 'spared'`
     - **Leth:** "...That's crueller than anything I ever did. All right."
  2. "The Ayes can have him." → `'arrested'`
     - *(Tobin's Ayes, if woken; otherwise Brack with a cargo strap.)*
     - **Leth:** "Of course. The record will keep."
  3. *(petrel only)* "Petrel. The raft's still yours. Come and see what the light looks like." → `'redeemed'`
     - **Leth:** *(a long silence)* "...She'd say I'm letting the tide decide."
     - **Leth:** "All right. Show me."
  - Esc: as 1.
- **Codex: Ansel Leth.**
  - *Spared:* "He watched."
  - *Arrested:* "He went quietly, barefoot, between two Ayes with their faces showing."
  - *Redeemed:* "Petrel of Saltwort put his hand on the lamp beside yours."

### Errata's report
- *(kept)*
  - **Errata:** "One more thing. The stone remembers four hundred years, up to the Dimming. It does not remember the last sixty. The Fair Copy has them, edited."
  - **Errata:** "But I remember them. Every edit I made at Hesk, for sixty-one years. Every name I struck out. Clerks always file copies."
  - **Errata:** "Let me give them to the stone. It is the report I was built to write."
  - *(Its lens-eye touches the Heartglass. Gold light flows between them. `vellum.errata.report = true`.)*
- *(reset)*
  - **Errata:** "Captain, the stone is missing sixty years! Who would have kept those?"
  - **Brack** *(holding up a slip)*: "Forty million people did. Last night. Paper, pet. It was always going to be paper."

### Quaile
Her first words depend on `cinder.farewell`:
- *(stay)* **Quaile:** "You came anyway. I told you there was one more lamp. You didn't listen. Good."
- *(come)* **Quaile:** "You said you'd come for me. I said come for the stone. You managed both. Show-off."
- *(go)* **Quaile:** "I chose for myself, like you said. I chose to sit here and refuse. It's been a very long morning of refusing."

Then:
- **Quaile:** "He can't make me set it. Stilled hands don't take orders. I've been sitting here deciding whether he's right."

What she thinks depends on `vellum.quaile`:
- *(absolve)* **Quaile:** "I showed half, once. If we show anything, we show all of it. Everything. Even me."
- *(challenge)* **Quaile:** "I don't trust myself to choose what anyone sees. I don't trust him. Maybe that's the point. Let them choose."
- *(forward)* **Quaile:** "It's yours to choose, child. You're the one the record can't see. You're the only one of us not already in this story."

Then:
- **Quaile:** "Benedikta said 'open the door'. She didn't say how wide."
- *(She puts the Heartglass in your hands.)*
- `ASK` **Quaile:** "The stone answers to your hand. What do we do with four hundred years of truth?"
  1. "Light every lamp. Show everyone everything." →`vellum.ending = 'full'`
  2. "Unseal every tally. Keep the record open for anyone who comes to read." → `'library'`
  3. "We keep it. We'll decide what's safe to show." → `'kept'`
  4. "Leth was right. Write a kinder copy, and let them rest." → `'fair'`
  - Esc: ask again.

### The lamp fires
Each ending plays one short scene, then `w.travel('vellum-vitrine')` with `vellum.ch = 9`.

- **Full Light.** You set the stone in the lens.
  - The master lamp throws a white beam straight up through the *Final Word* (which doesn't burn; the light passes through it, and every window of the ship lights). Then it breaks into a thousand beams, outward, to every lamp. Banner: **FULL LIGHT**.
  - **Quaile:** "There it goes. All of it. Even me."
  - *(redeemed)* **Leth:** "...It's so loud."
- **The Open Library.** You set the stone in the lens and turn it once, the way Quaile shows you.
  - Far below, every tally in the plaza goes dark at once: forty million faint glints behind forty million ears, out like candles. The lamp itself stays quiet. Banner: **THE OPEN LIBRARY**.
  - **Quaile:** "Nobody's told anything. Everyone's allowed to ask. Benedikta would have hated how slow it'll be. Then loved it."
- **The Kept Light.** You don't set the stone. Quaile closes your fingers around it.
  - **Quaile:** "Then we keep it. Lightkeepers again. Two of us. Plus a postmistress, which is new."
  - The lamp stays dark; Leth's Last Edit never fires. Banner: **THE KEPT LIGHT**.
  - **Pockets:** "KEEP. SECRET?"
- **The Fair Copy.** You set the stone, and Leth (if spared or redeemed) shows you the gentle turn. Otherwise Quaile does, grimly.
  - Gold, soft light spills from every lamp. Below, the crowd lowers its paper, puzzled, then folds it away. Banner: **THE FAIR COPY**.
  - **Quaile:** "...I'll remember. Stilled minds keep. So will you. We'll be the only ones."
  - **Brack** *(blinking at you)*: "...Sorry, pet. Have we met?"

## What the player learns and earns

**Learns.**
- At the Unanimity's centre: a dead woman's recording, and her last wish, buried by the man who loved her.

**Earns.**
- **Keeper's Mantle** (`vellum-mantle`: back, cosmetic, bound): a Lightkeeper coat-cape in your blade's colour, from Quaile.
- Codex entries and the last key word.
- The ending title, awarded in Chapter 10.
- Flags: `vellum.ch = 9`, `vellum.leth.fate`, `vellum.ending`, `vellum.errata.report`, `vellum.tern.woken`.

## Chapter-ending hook

The light has gone wherever you sent it. Months later the *Rumour* has post for Glassgut, and a lamp on Vitrine is still pointing at nowhere, waiting to see if you'll take it home.
