# Chapter 4: What the Flowers Saw

**World module:** `vellum-amaranth`.
**Where:** Amaranth, a jungle world. The ruined Lightkeeper school, the Glasshouse, on terraces above a river.
**Rules:** `deny: ['board']`.
**Theme:** late dusk that never ends (the chapter takes place in one evening).
- Sky top `#1b2b4a`, horizon `#e0708f`. Dense green-blue fog `#21403f` [30, 220]. `bloom: 0.7`.
- Assets: `fern`, `mossy-rocks`, `dead-trunk`, `tree-stump`, `jacaranda`.
- Music: lydian, root 55, 70 bpm, sparkle 0.35.
**Playtime:** 45–55 minutes.

## Premise

Quaile wants to know who is left. The school where she trained, and taught, is a ruin in a jungle whose flowers replay whatever they saw. Some of what they saw, she would rather they hadn't.

## Layout

| area | bounds / position | notes |
|---|---|---|
| River | x −80..80, z +20..+40 | A water plane at y −0.5. Touching it means a splash and a respawn at the last checkpoint. The *Rumour* (décor) is moored at [−20, 0, 30]. |
| Sandbar | [−30..10, 0, +8..+20] | Spawn [−8, 0, 14], yaw 180. |
| Jungle floor | x −50..50, z +10..−110, y 0 | Giant buttress trunks (cylinders, radius 3–5, height 40, with canopy discs at y 30–40), root ramps, two streams with fallen-trunk bridges, and afterbloom patches. The path is marked by stone lanterns every 15 m. |
| Canopy walk (optional) | planks at y 18–24 between trunks | Reached from root ramps at [20, 0, −20] and [−25, 0, −70]. Three moths and a codex entry. |
| Training court | Terrace 1: y 6, x −14..14, z −118..−152 | Broad stairs (ramps) up from the jungle at z −110. The 12 Lamp Trial pillars. At the south end, the **stillglass gate** [0, 6, −152]: a translucent rose pane, 6 × 5 m, with a collider. |
| Library terrace | Terrace 2: y 14, x −24..24, z −155..−190 | Stairs from the gate. The roofless library (walls 5 m, broken shelves), Dace's hand-press at [8, 14, −172], and the dormitory ruins to the west. |
| Keeper's garden | Terrace 3: y 22, x −30..30, z −190..−230 | A ring of afterbloom beds around the **confession bed** at [6, 22, −210], a stone bench, and the plaque **REMEMBER**. |
| Bell tower | square 8 × 8 at [−20, 22, −215], height 45 (top y 67) | An interior switch-back stair (ramps 1.8 m wide, rising 4 m per flight). Two broken floors to jump at y 38 and y 50. The bell chamber is at the top. |
| Glide path | from the tower top to the sandbar | About 245 m long and 67 m down; the Veil carries about 300 m. Waypoints: [−24, 62, −195] → [−30, 56, −170] → [−38, 49, −140] → [−44, 41, −105] → [−46, 32, −65] → [−40, 22, −25] → the sandbar. |

**Landmarks.**
- The bell tower is visible from the sandbar the whole way, a dark finger against the pink sky.
- The afterbloom glows pink, teal and gold in the undergrowth.
- From the garden you can see down over the canopy to the river, and the *Rumour*'s lights.

## Objectives and critical path

1. Follow Quaile up through the jungle to the training court.
2. Dace's ambush, then Thousand.
3. Run the **Lamp Trial**. The gate opens.
4. The library: Censors scatter Thousand. *(Optional: find its 12 moths.)*
5. The Keeper's garden: the confession, and Quaile's question.
6. Dace's question: print now, or wait.
7. Climb the bell tower and learn **the Veil**. The canopy catches fire, so glide to the river.

## Encounters

- **Afterbloom replays.** Within 4 m of a bed, a light-trait holder sees ghost avatars (opacity 0.35) act for 4–8 s, once per visit. This is the stillblade's first payoff.
- **No enemies on foot.** The tension is the library raid and the fire.
- **Quaile as a companion.** She waits at waypoints ahead of you (sandbar, bridge, court, garden, tower top), the cheap version of NPC movement (BUILD.md, feature 3).

## Puzzles and solutions

**P1: the Lamp Trial.** Twelve stone pillars (radius 0.9, glowing caps). Heights are given above the court floor (y 6):

| # | position (x, z) | top | # | position (x, z) | top |
|---|---|---|---|---|---|
| 1 | −8, −124 | 1.2 | 7 | 2, −138 | 6.0 |
| 2 | −4, −126 | 2.4 | 8 | −3, −140 | 6.6 |
| 3 | 0, −125 | 3.6 | 9 | −7, −143 | 5.4 |
| 4 | 4, −128 | 4.4 | 10 | −6, −147 | 7.2 |
| 5 | 8, −132 | 3.2 | 11 | −1, −149 | 6.4 |
| 6 | 6, −136 | 4.8 | 12 | 4, −150 | 7.0 |

- **The ghost run.** F · *Wake the court* (at the court's flower bed). A ghost girl runs the course in 40 s. Each cap flashes as she lands on it, and she skips 9 by double-jumping from 8 to 10.
- **Your run.** Touch the caps in order (zones on top) within 45 s of touching cap 1. The timer shows. Skipping 9 by a double jump from 8 to 10 is accepted, which is the secret.
- **Failure.** Missing or out-of-order caps reset with a soft chime; you're never sent back further than the court.
- **Success.** The gate dissolves (`hide()`), with a burst of rose light.

**P2 (optional): Thousand's moths.** Twelve glowing moths (small winged ico shapes, glow 2.4, gently bobbing), each a pickup that sets `vellum.moths` (0–12) and toasts a memory line:

1. library shelf top (y 19): "We remember Haskell's desk. The jar. The lamp that never went out."
2. dormitory wall: "We remember Benedikta drawing lanes on the dormitory wall."
3. inside the bell (tower top): "We remember the night the Ayes came. We hid in the bell."
4. garden bench: "We remember Quaile laughing. She laughed like a door slamming."
5. canopy walk, west end: "We remember a boy at a Unanimity dock on Pelagia, asking for a tally. He wanted to forget. We remember him because nobody asks for that."
6. stream bridge underside: "We remember the tide-folk rowing Keepers out to sea, toward a shell in the dark."
7. canopy walk, middle: "We remember the Ammonite's lights from far away, like a spiral of lamps."
8. beside the press: "We remember Dace as a baby, asleep on the press."
9. top of pillar 9: "We remember being one moth. It was very quiet."
10. tower broken floor (y 38): "We remember Saltglass. Not what happened. What the Keepers' faces did when they heard."
11. canopy walk, east end: "We remember Juniper Mirrin saying: paper remembers what people are told to forget."
12. garden plaque ledge (y 25): "We remember our name. We chose it. We were a thousand, and we were one."

Thousand's swarm visibly grows with each one: its particle count is 30 + 20 × moths.

**P3: the tower.** Two broken floors. At y 38 there is a 3 m gap between landings (a jump). At y 50 a flight is missing and the gap is 6 m: Second Step.

## Set piece: the burning canopy

At the top of the tower, Quaile gives you the Veil, and the jungle catches fire before you can practise.
1. Vane's clearance begins (`shake 0.6`). The canopy discs along the glide path switch to burning versions: emissive orange, with rising red and orange particle columns.
2. The light shifts warmer: two orange point lights along the route.
3. Hazards on the glide path:
   - **Falling burning branches:** five branches, each a 2-point `w.mover` dropping from y 34 to 4 at the route waypoints, period 4 s, offsets 0–0.8. Each is a hazard box riding with it (world-side: the hazard's centre follows the mover in `tick`).
   - **Fire plumes:** three `w.wind` boxes (6 × 30 × 6, force [0, 26, 0]) under the route. They lift you if you're sinking too low, so they're helpful; they're also visible as roaring columns.
   - **Smoke:** a dense grey particle band at [−44, 41, −105]. You fly through it blind for 1.5 s, which is just long enough to feel it.
4. The *Rumour* hovers over the river with its ramp down (catch zone 12 × 6 × 16 at [−20, 3, 20]).
5. Hitting a hazard sends you back to the tower top: the checkpoint is set when the Veil is given. The glide takes about 25 s, so retries are cheap.
6. **After the chapter**, the world loads calm at night. Six **light rings** (glowing tori, radius 3) hang on the waypoints as a timed course: `w.record('veil', t)`, lower is better.

## Collectibles and codex

**Pockets' words.**

- REMEMBER (key): the garden plaque
- LIBRARY: the library arch
- WET INK: a card on Dace's press

**Codex.**
1. **Amaranth** (arrival). *"A jungle world where nothing is forgotten: its afterbloom flowers drink the light by day and give it back at night."*
2. **Afterbloom** (first replay). *"Flowers that store light and replay it after dark. The Lightkeepers planted them around their school so the school would remember itself."*
3. **The Glasshouse** (court arch). *"The Lightkeepers' school, abandoned since the Dimming. Novices trained here from the age of ten. Its gate opens for anyone who runs the Lamp Trial."*
4. **Benedikta, aged fourteen** (after the ghost run). *"The fastest novice the Glasshouse ever had. She skipped the ninth pillar. Nobody told Haskell."*
5. **The Myrr** (meeting Thousand). *"Beings made of luminous moths flying in a person's shape; each moth carries part of the memory. Scattered, a Myrr forgets who it is."*
6. **Saltglass, as Quaile tells it** (after the confession). *"Soldiers fired into a crowd at the Brinewell; three thousand died. The crowd had been sent there by a forged stillglass. Quaile released the shooting and buried the forgery."*
7. **Moderator's Remark No. 19** (a clearance notice nailed to the gate). *"'We forgive, so that we may forget.'"*
8. **Margin Slip: "Gran"** (library desk). *"Dace. If you're reading this, you forgot again. Your gran is Juniper Mirrin and she is the Printer and she loves you and she is very cross. Go home to Plenary when it's time. You'll know. —You"*
9. **The Glasshouse Burning** (only if Dace prints). *"A thousand slips carrying a stilled picture of Ayes burning a school library. The caption, in Dace's bold face: THEY DID THIS. REMEMBER IT."*

## Dialogue

### Arrival
Banner: *Chapter 4 · What the Flowers Saw*.
- **Quaile:** "It's grown. Everything's grown."
- **Quaile:** "We used to row the novices across this river at dawn. Mind the flowers. They're listening. Well. Looking."
- **Brack** (from the ramp): "I'll keep the engines warm. Errata, Pockets, with me. Margin folk shoot at clerks."
- **Errata:** "A reasonable policy."
- *Objective:* "Follow Quaile up to the Glasshouse."

At the first afterbloom bed (ghost novices run past laughing):
- **Ghost Novice:** "Race you to the bell!"
- **Quaile:** "Afterbloom. It drinks the light by day and gives it back at night, whatever it saw. Hold your blade near them. They'll show you."

At the stream bridge:
- **Quaile:** "Haskell fell off this bridge once. In front of everyone. He said it was a lesson in humility. It was a lesson in moss."

### The ambush
At the top of the court stairs, Dace is on pillar 7 with a sparker aimed at you.
- **Dace:** "Hands where I can see them, Unanimity!"
- **Dace:** "You've come for the press? You'll have to take it off me, and I bite."
- **Quaile:** "We're not Unanimity, boy. Put that thing down before you hurt a flower."
- **Dace:** "That's exactly what a Redactor in a nice coat would say."
- *(A river of glowing moths pours down from the library terrace and gathers into a tall figure.)*
- **Thousand:** "Dace. Stop. We know her."
- **Thousand:** "Keeper Quaile. We remember you. We were smaller then."
- **Quaile:** "Thousand? You were a jar of moths on Haskell's desk."
- **Thousand:** "We grew. We remember the jar. It was a good jar."
- **Dace:** "A Keeper? They're a story. They're a story my gran tells."
- **Quaile:** "I'm a very rude story."
- **Dace:** "And you. Thousand says Censors can't see you. Is that true?"
- `ASK` **Dace:**
  1. "True. I'm not in the record."
     - **Dace:** "Ha! A walking blank page. Gran would print you."
  2. "Ask the Censors."
     - **Dace:** "Funny. I like funny. Funny's useful."
  - Esc: as 1.
- **Dace:** "Dace Mirrin. I run the press here. Thousand keeps the archive. We're the Margin, or the bit of it that hides in a ruined school."
- **Thousand:** "The inner school is sealed. The gate opens only for those who run the Lamp Trial. We have not run it. We have no legs."
- **Quaile:** "The flowers in the court remember the last novice who ran it. Wake them. Watch her. Then run it yourself."
- *Objective:* "Run the Lamp Trial: follow the remembered runner across the pillars."

### The Lamp Trial
- During the ghost run: **Quaile:** "Benedikta. Fourteen. She was the fastest novice we ever had."
- After it:
  - **Quaile:** "She cheated on the ninth pillar. Look, she skipped it. Haskell never caught her. I did."
  - **Quaile:** "I never told him."
- On success: banner **THE LAMP TRIAL**.
  - If all 12 were touched: **Quaile:** "Not bad. Benedikta was faster."
  - If 9 was skipped: **Quaile:** "You skipped the ninth. ...Ha. Don't tell Haskell."

### The library
On entering the library terrace, Censors burst through the broken roof.
- **Vane** (loudhailer, distant): "In accordance with the Agricultural Clearance Ordinance, this ruin is scheduled for... clearance!"
- **Thousand:** "Censors. They read our moths as—"
- *(The swarm explodes outward in twelve streaks of light.)*
- **Dace:** "Thousand! They've scattered it!"
- **Dace:** "Each moth carries a bit of it. If they're spread out, Thousand doesn't know who it is. Find them!"
- *Toast:* "Thousand's moths have scattered across the school. Each one you return brings back a memory."
- *(The Censors sweep once, find nothing they can read, and leave.)*
- *Objective:* "Go up to the Keeper's garden. (Find Thousand's moths along the way.)"

**Thousand, if spoken to**, depending on moths found:
- 0–3: "We... are looking for us."
- 4–8: "We are coming back. It is like waking in a room you don't recognise and then, slowly, do."
- 9–12: "We are nearly all here. Thank you, {call}. We will remember that you looked."

### The confession
In the garden, your light nears the confession bed. Two ghosts form: a young Quaile in a Keeper's coat, holding a stillglass disc and a small blade, and a girl of twenty in a Lamp's grey.
- **Ghost Quaile** *(cutting the disc in two)*: "Keep this half. They never need to see the rest."
- **Ghost Benedikta:** "Orla? What are you doing? That's the record."
- **Ghost Quaile:** "It's the truth."
- **Ghost Benedikta:** "It's half of it."
- *(They fade. The real Quaile stands beside you.)*
- **Quaile:** "...Of course they kept that. Flowers. Of course."
- **Quaile:** "Saltglass. Ninety-two years ago. I saw soldiers fire into a crowd at the Brinewell. Three thousand people. I stilled it, and I said it. That's the oath."
- **Quaile:** "Then, that same night, I found out why the crowd was there. A painted glass. A forgery, telling them the soldiers had poisoned the well. Somebody wanted them angry."
- **Quaile:** "I released the shooting. I buried the forgery. I thought the shooting was the truth that mattered, and the forgery would only excuse it."
- **Quaile:** "Thirty years of war followed. Every world released its own half of something. They called it the Clamour."
- **Quaile:** "Benedikta found the other half. She never forgave me. And then she built the Unanimity out of it."
- `ASK` **Quaile:** "Go on. Say what you're thinking."
  1. "The shooting happened. You told the truth." →`vellum.quaile = 'absolve'`
     - **Quaile:** "That's what I told myself for thirty years. It's a very comfortable chair, that sentence."
  2. "You chose which half they saw. That's editing." → `'challenge'`
     - **Quaile:** "...Yes. Benedikta said the same, word for word. Then she built an empire out of the same idea and called it mercy."
  3. "It was ninety years ago. What matters is what you do now." → `'forward'`
     - **Quaile:** "Ninety for you. For me it was thirty years of war and a sixty-year nap."
     - **Quaile:** "But you're right. Now."
  - Esc: as 3.

### Dace's question
Dace climbs into the garden with ink on his hands.
- **Dace:** "The flowers in the lower court remember the Dimming. Ayes burning this library. Novices thirteen years old being tallied on those steps. It's all there, in colour."
- **Dace:** "I can set it in type tonight. A thousand slips by morning, every one with a stilled picture of what they did here. Margin worlds will rise."
- **Dace:** "Or it sits in a flowerbed for another sixty years."
- `ASK` **Dace:** "Do I run it?"
  1. "Print it. People should see." →`vellum.dace = 'printed'`
     - **Dace:** "Ha! Ink's already mixed. A thousand slips by morning."
     - **Thousand:** "They will come back for this, Dace."
     - **Dace:** "Let them."
     - **Quaile** *(quietly, to you)*: "He reminds me of someone."
  2. "Wait. Print it when it can do the most good." → `'waited'`
     - **Dace:** "Wait? People are edited every night while we wait!"
     - **Dace:** "...Fine. But I'm holding you to 'the most good'. I'll know it when I see it, and so will you."
     - **Quaile:** "Ninety years too late, somebody finally says 'wait' to the right person."
  - Esc: as 2.
- **Dace:** "I'll get the press out by river before Vane comes back. See you in the margins, blank page."
- *Objective:* "Climb the bell tower."

### The Veil
At the top of the tower, Quaile is by the bell.
- **Quaile:** "The third form. The Veil. You still the light *around* you, not under you. A veil. Let it hold you while you fall."
- **Quaile:** "Haskell made us jump from this bell. Most of us cried. Benedikta laughed all the way down."
- *(Give and equip `vellum-veil`. Banner **THE VEIL** / Third form. Toast: "Jump, then hold Space to glide.")*
- *(A roar below. The canopy erupts in orange.)*
- **Vane** (loudhailer): "Commence clearance!"
- **Quaile:** "No time for practice. Jump! Follow the river-light!"
- **Quaile:** "And don't land on anything that's on fire!"
- *(On landing in the catch zone:)* **Brack:** "In! The whole jungle's going up!"
- *(Then `w.travel('vellum-rumour')`, `vellum.debrief = 4`.)*

## Aboard the Rumour (debrief 4)

Thousand hovers in the engine room's blue light. Its size follows `vellum.moths`.
- *(If moths ≥ 6:)* **Thousand:** "We remember who knows the way to the Ammonite. The tide-folk of Pelagia. They rowed Keepers out to the shell, in our grandmothers' time. Which is to say, ours."
- *(If moths < 6:)* **Thousand:** "We remember... a sea? There was a sea, and a shell. We are sorry. We are not all here."
- **Quaile:** "Pelagia. The uncounted. They never liked us, but they liked our money."
- **Brack:** "Pelagia I can do. Their post is all letters to drowned people. Breaks your heart."
- **Errata:** "Pelagia. Noted."
- *(If Dace printed:)*
  - **Brack:** "And your firebrand's slips are already all over the Margin. Found three in my own mailbags."
  - **Quaile:** "Then the Unanimity has found them too."
- *(If he waited:)* **Brack:** "That boy'll print the whole jungle one day. Good. Not yet. Good."
- **Pockets:** "REMEMBER." *(if found; otherwise "LOOK.")*

**Night scene 4.** Errata in the blister.
- **Errata** (whispering): "...E-R-Eight. The Keeper confessed Saltglass. A Myrr knows the way to the Ammonite: the tide-folk of Pelagia. Filed."
- *(A pause.)* **Errata:** "...Correction. Strike the last line."
- *(If approached:)* **Errata:** "I was correcting something. Goodnight, {call}."

## What the player learns and earns

**Learns.**
- Quaile released half the truth of Saltglass, and the Clamour followed.
- The Moderator was the girl who skipped the ninth pillar.
- A Pelagian boy once asked for a tally in order to forget.
- The way to the Ammonite runs through Pelagia.
- Errata has begun editing its own reports.

**Earns.**
- **Keeper's Veil** (`vellum-veil`): back, `glide`, bound. A sheer veil of stilled light that opens like wings when you fall.
- Title **Afterbloom**.
- Up to 9 codex entries, 12 moths and 3 words.
- Flags: `vellum.ch = 4`, `vellum.quaile`, `vellum.dace`, `vellum.moths`.

## Chapter-ending hook

The jungle burns behind the *Rumour*, and every flower in it remembers. Ahead lies a world of uncounted people who never liked Keepers. And a clerk has, for the first time in sixty-one years, struck out a line it had written.
