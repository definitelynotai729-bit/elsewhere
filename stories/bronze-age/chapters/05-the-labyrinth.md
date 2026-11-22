# Chapter 5: The Labyrinth

**World:** `lsb-labyrinth` · **Story time:** day 5 · **Playtime:** 45–55 minutes
**Rules:** `deny: ['board', 'glide']` (underground; wings would only snag) · **killY:** −20 · **Music:** root 50, phrygian, 58 bpm, sparkle 0.1, bright 800
**Theme:** dark like Glowcave: no sky, hemisphere light low and warm, fog 12–70 m in amber `#1a120c`, bloom 0.7. Lit by wall lamps (glowing spheres in niches) and four real lights. `light`-trait items (the Glowcave lantern) work and are welcome.

## Summary

Under the palace, the seven-course Processional Way leads to the Quiet Rooms, where an old blind man explains what happens to the Voices. Beyond lies the Deep Labyrinth: turning walls, double-axe marks counting down to the heart, and a bronze bull that charges anything it sees move. Notes scratched in plain Elsewhere letters lead the player to Linnet, who has been hiding in a garden under a light well for thirty days. She tells the truth about the mountain. Then the ground shakes and the bull gets loose.

## Locations and layout

Origin (0, 0, 0) is the foot of the stairs from the Labyrinth Gate. The floor is at y 0 throughout, except the light-well shafts. North is −z.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Processional Way** (accepted) | (0, 0, −24) | classical seven-course labyrinth, 36 across | Walls 3 m high (plaster, ochre and red bands), path 1.6 m wide, one path with no choices, about 450 m long. Eight fresco panels (signs) on the way. Ends at a door to the Quiet Rooms. |
| **Quiet Rooms** (refused start; the end of the Way) | (40, 0, −24) | a 10 × 10 court with five rooms of 5 × 5 | Lamplit and comfortable: beds, cushions, wall paintings of sea and mountain. Names scratched on the walls. Tarkon, the Old Voice, is in room 5. Checkpoint `quiet`. |
| **Threshold** | (40, 0, −46) | grate 3 × 3 | A bronze grate behind Tarkon's room, pried loose. Beyond it the Deep begins. The first labrys mark (four axes) is cut above it. |
| **The Deep Labyrinth** | (20, 0, −90) | 11 × 11 cells of 4 m (44 × 44), walls 4.5 m | A true maze. Labrys marks at the junctions. Three turning walls (TW-A, TW-B, TW-C): 4 m panels on centre pivots, each turned by a pressure plate in a side cell. The Old Bull patrols the central loop. Wall lamps are sparse, so the dark is real. Checkpoints `deep-1` (inside the Threshold) and `deep-2` (after TW-B). |
| **The Bull's Loop** | (20, 0, −90) | a ring corridor around the maze centre, 3 m wide | The bull's patrol: 64 m long, walked at 3 m/s. Four alcoves (1 × 1.5 m) to stand in. |
| **The Heart** (Linnet's garden) | (20, 0, −126) | 12 × 12 × 6 | Under a light well (a 4 × 4 shaft rising 30 m to the palace's north terrace). A fig tree (cylinder trunk with a low-poly crown, solid up to 4.5 m), herbs in pots, a trickling spring, a bedroll and walls covered in Linnet's writing. Checkpoint `heart`. |
| **Bull's Gallery** (escape) | (50, 0, −126) | 8 × 6 × 60 hall | A long pillared hall east of the Heart, leading to the freight lift. During the escape: crumbling floor tiles, falling pillars and dust. |
| **Freight lift** | (82, 0 → 34, −126) | platform 4 × 4 in a shaft | A counterweighted platform tied off by a rope. Cutting the rope (strike) sends it up 34 m to the **Seaward Door**, a ledge in the cliff over the sea, which is the chapter exit. |

**Sightlines.** In the Heart, looking up the light well: a square of blue sky, swallows crossing it, the edge of a red column. In the Deep, the bull's eyes glow down long corridors before you see the bull.

## Objectives

### Critical path
1. **Accepted:** walk the Processional Way (reading the frescoes) to the Quiet Rooms. **Refused:** wake in the Quiet Rooms.
2. **Meet Tarkon,** the Old Voice. He explains the Voices and points to the Threshold.
3. **Enter the Deep.** Follow Linnet's notes and the labrys countdown.
4. **Learn the bull** (puzzle 1) and **turn the walls** (puzzle 2).
5. **Find Linnet** in the Heart. Join the token halves. Hear the truth. **Choose** her path.
6. **Escape:** a tremor, the bull loose, the Gallery collapsing. Cut the lift rope.
7. **The Seaward Door:** the chapter ends. Travel to `lsb-pharia` (both branches; see 5.7).

### Optional
Kindness 5 (read Tarkon his name); return Linnet's boots (if taken); Old Horn sighting 5; all eight frescoes; all twelve of Linnet's notes; 10 tin-drops in the Deep's dead ends.

## Puzzles

1. **The Old Bull.** A bronze bull 3 m long with a lamp inside its head. Its eye colour is its state, and a world tick handler (BUILD.md, simple enemies) drives it:
   - **Amber (walking):** it walks the Loop at 3 m/s. Out of its sight it ignores you.
   - **Red (looking):** every 6 s it stops for 2.5 s and its eyes turn red. Its sight is a 12 m cone, 60° wide, along the corridor. **If you move faster than 0.5 m/s inside the cone while its eyes are red, it charges:** it runs straight at 12 m/s for up to 20 m, and contact sends you to the last checkpoint.
   *Solution:* stand still when the eyes are red (Linnet's note: STAND STILL WHEN ITS EYES ARE RED), cross the Loop behind it while they are amber, and use the alcoves. Fair warning: red eyes light the corridor walls red before you see the bull.
2. **The turning walls.** Each of TW-A, TW-B and TW-C has two faces carved with double axes. The house signs count down toward the heart: the Threshold has four axes, and each correct passage has one fewer. A pressure plate in a side cell turns its wall a quarter turn.
   - TW-A: faces of **3** and 5 axes. Turn it so the 3 faces the Threshold corridor.
   - TW-B: faces of **2** and 3. The 2 must face TW-A's side.
   - TW-C: faces of **1** and 4. The 1 must face TW-B's side.
   *Solution:* set each wall so its face continues the count 4, 3, 2, 1 from the direction you came. Only that arrangement lines the open sides up into a continuous path to the Heart. Two of the plates sit on the bull's Loop, so puzzle 1 and puzzle 2 interlock. Linnet's note: "Count down. The House counts down to its heart."
3. **The lift.** The lift platform is tied off by a thick rope to a bronze cleat. *Solution:* stand on the platform and strike the rope (key 1). With the bull charging the length of the Gallery, the strike has to be the first thing you do when you arrive.

## Set pieces

- **The writing on the walls.** The Heart is a small green room with a fig tree in a shaft of sunlight, and every wall is covered in Elsewhere's alphabet: tallies of days, a map of the maze, a poem, a drawing of Junction's Vault from memory, "I WAS HERE 9 YEARS" and, in fresh chalk, "30 DAYS DOWN HERE. STILL ME." The player reads it, and no islander could.
- **The tokens.** Two halves of broken clay that were apart for nine years fit together in the player's hand (a burst of gold dust, a soft chime, `w.sound('win')` at low volume).
- **The Bull's Gallery.** A tremor cracks the Heart, the bull's patrol breaks and it comes down the Gallery at a run, sparks off its hooves, pillars falling, the floor going behind you, Linnet shouting from the lift. If Kore was freed, she steps into the bull's path at the halfway mark, grabs its horns and holds it: "I am bronze too!"

## Collectibles and codex

- **Tin-drops (10).**
- **Old Horn sighting 5** (`lsb.goat.5`): up the fig tree in the Heart (a branch at y 4.2), reached by the bedroll crate and a jump. "Old Horn is up the fig tree, eating figs. Linnet stares. 'How long has she been in my garden?'"
- **Codex:**
  - **The Labyrinth:** "The House's lower halls. The Processional Way is for walking slowly; the Deep is for getting lost. Daedalus drew both with a borrowed compass."
  - **The Countdown:** "Double axes cut at the junctions: four, three, two, one. The House counts down to its heart."
  - **The Quiet Rooms:** "Where the old Voices live when a new one is seated. Comfortable. Lamplit. No door that opens from the inside."
  - **Tarkon, the Old Voice:** "The eighth Voice, from the east, seated eighteen years ago. Blind now. Still says good morning to every Voice who comes down."
  - **The Old Bull:** "A bronze bull made to guard the Deep, older than the House's records. It cannot see what does not move. Neither, Linnet notes, can most people."
  - **Linnet's Notes:** "Scratched in a script the islanders call bird-feet. Every traveller from Elsewhere can read them."
  - **The Mountain's Words:** "What Linnet actually heard and said: 'Leave the low places. The mountain will throw the sea at you. Take the children high, and then take them away.'"

## Dialogue

### 5.1 Processional Way frescoes (accepted; signs, in order)
1. "A ship arrives at Thyra. A small figure walks out of a shining arch."
2. "The figure is crowned with flowers and carried up the mountain."
3. "The figure sits on a tripod over a crack in the rock. Lines rise from the crack into its mouth."
4. "A woman in a tall headdress writes on a tablet, listening. (The Speaker.)"
5. "People in every island kneel and lift their cups."
6. "Nine suns. A second figure walks out of a shining arch."
7. "The first figure is carried down the mountain by a bronze giant. It is very small in his hand."
8. *(Blank plaster, smoothed over. Under the plaster, if the player strikes it, a painted door with no handle.)*

### 5.2 Tarkon, the Old Voice (the Quiet Rooms; both branches)
**TARKON:** "Another one. Sit down. Mind the cushion, it's older than me. The Bull is loud tonight."
**TARKON:** "I'm Tarkon. I was the eighth Voice. Nine years I sat over the god's crack and said what came up. Then a girl with jumping shoes came down from the light, and they carried me here."
**TARKON** (ask): "You're the tenth, I suppose. Or you refused them. Which?"
- → *(accepted)* "I'm the Voice-Elect." **TARKON:** "Then they sent you down to be 'met by the voices that were'. That's me. I'm the met. Welcome to forever. It's quieter than it sounds."
- → *(refused)* "I refused." **TARKON:** "Did you! Nobody refuses. Good for you. It won't help, but good for you."
**TARKON:** "The god's voice isn't the god's, you know. It's the mountain's. You sit over the crack and the rock hums into your bones, and words come. Deep words, slow ones. The Speaker writes them down and makes them pretty."
**TARKON:** "They keep us here afterwards because we know what the mountain really said, before it was made pretty. We could tell people. So: cushions, lamps, good food, and a door that doesn't open from this side."
**TARKON:** "Six of us came down. Five are names on the wall now. I'm the last. The girl, Linnet, never came down. She ran. Into the Deep, past my room, thirty days ago. She said she'd rather be lost than pretty."
**TARKON:** "The grate behind my bed. She bent it. Follow the bird-feet; she said someone like you would read them. And mind the Bull. It's blind to stillness. I've heard it walk past me a thousand times."

### 5.3 Tarkon's name (kindness 5; optional)
**TARKON:** "Would you do an old man a favour? My name's scratched on the wall by the door, with the others. I can't see it. Is it still there?"
*(Interact with the wall: "Names, one under another in five different scripts. The last is in eastern wedge-marks, cut deep: TARKON. Under it, smaller, in Elsewhere letters: 'kind man. good singer. — L'.")*
**TARKON:** *(when told)* "Still there. And she wrote something under it? Read it to me." *(The player confirms.)* "...Good singer. Ha. I was never a good singer. She was a terrible liar." *(`lsb.kind.5`)*

### 5.4 Linnet's notes (signs in Elsewhere letters, in the order found)
1. Threshold: "IF YOU CAN READ THIS, YOU'RE FROM ELSEWHERE. HI. I'M LINNET. FOLLOW THE CHALK."
2. First junction: "COUNT DOWN. THE HOUSE COUNTS DOWN TO ITS HEART. 4 3 2 1."
3. Bull's Loop: "THE BULL HATES MOVEMENT. DON'T BE MOVEMENT. STAND STILL WHEN ITS EYES ARE RED."
4. Alcove: "THIS ALCOVE SAVED MY LIFE TWICE. IT'S NOT COMFY."
5. Plate A: "THE WALLS TURN. MAKE THE NUMBERS COUNT DOWN THE WAY YOU CAME."
6. Dead end: "WRONG WAY. I CRIED HERE ON DAY 4. YOU DON'T HAVE TO."
7. Dead end: "DAY 11. THE MOUNTAIN HUMS THROUGH THE FLOOR EVEN DOWN HERE. SAME THREE NOTES. GETTING CLOSER."
8. Plate B: "TWO. YOU'RE DOING GREAT."
9. Plate C: "ONE. NEARLY HOME. WELL. NEARLY MY HOME."
10. Near the Heart: "IF YOU'RE FROM THE PALACE AND CAN READ THIS: I'M IMPRESSED, AND NO."
11. Heart, wall: "30 DAYS DOWN HERE. STILL ME."
12. Heart, behind the fig tree: "JUNCTION HAS A VAULT WITH THREE SOCKETS. I NEVER OPENED IT. IF YOU DID, I'M JEALOUS."

### 5.5 Linnet (the Heart)
*(She is sitting under the fig tree when the player comes in. She stands too fast.)*
**LINNET:** "Don't. Don't move. Let me look at you."
**LINNET:** *(after a moment)* "You came through the Door. You've got the Door all over you. I can always tell. Are you from Junction?"
**LINNET** (ask): "Please say you're from Junction."
- → "I'm from Junction." **LINNET:** "Oh. Oh, Junction. Is Wren still there? Is the hoop still there? Tell me nobody's opened the Vault." *(she laughs, and the laugh nearly breaks)*
- → "Eumaia sent me." **LINNET:** "Eumaia. Of course Eumaia. She'd send a goat after me if she had to."
**LINNET:** "Nine years. I walked out of the Door laughing. Eumaia washed my feet. I taught her goat to shake hands. Then the House came with music, and I thought: an oracle! How often do you get to be an oracle?"
**The tokens** (the player gives `lsb-token-linnet`; she takes a half-disc from a cord round her neck):
**LINNET:** "She kept it. Nine years, she kept her half." *(the halves fit; gold dust)* "...Give me a second."
**LINNET:** "Right. The truth. That's what you came for, even if you didn't know it."
**LINNET:** "You sit on the tripod over the crack, and the mountain hums into your teeth, and words come up. For eight years they were boring: 'Rain is coming.' 'The barley is good.' The Speaker made them sound like thunder."
**LINNET:** "Last autumn the hum changed. Three notes, over and over, getting lower. And the words that came up were: *Leave the low places. The mountain will throw the sea at you. Take the children high, and then take them away.*"
**LINNET:** "I said it. Every day I said it. And every day it came back down the mountain as a blessing. 'The mountain will lift the faithful high.' 'When the sea bows to the House, the House shall rise to meet it.'"
**LINNET:** "Phemonoe isn't evil. She thinks if people panic they'll drown in the harbour fighting over boats. She thinks hope is a kind of rope. Maybe she's right. But she's not the one sitting on the crack."
**LINNET:** "So I stopped speaking. If they wouldn't carry my words, they could have my silence. Then I heard they were going to 'retire' me early, with cushions, and I ran."
**LINNET:** "It's going to break before the barley's cut. Days, not months. And the whole Isles will be at the Festival, in the Ear, at the bottom of the mountain. 'All the Isles gathered at the god's table.' She didn't even change that one."
**Boots** (if `lsb.boots = 'taken'`):
- → "These are yours." *(gives `lsb-linnet-boots`; `lsb.boots = 'returned'`)* **LINNET:** "My boots! They put them in a shrine? Of course they did." *(she bounces once, twice, and laughs properly)* "No. You keep them. You'll need two jumps where you're going more than I'll need them in a garden. Bring them back when it's over." *(The player keeps the boots; Linnet remembers this in Chapter 10.)*
**The choice:**
**LINNET:** "So. What do we do with me?"
**LINNET** (ask): "I could stand up in front of everyone and say it. I could go home: the Door's still there and I could be in Junction by tomorrow. Or I stay down here with the figs and let you carry it."
- → "Come and say it to everyone." *(`lsb.linnet = 'testify'`)*
  **LINNET:** "In front of the whole Isles. With the Speaker standing right there." *(a breath)* "Yes. All right. Nine years I spoke for a mountain. I'd like to speak for me once."
- → "Go home. You've done enough." *(`lsb.linnet = 'home'`)*
  **LINNET:** "Home." *(she closes her eyes)* "I want to say no, and I can't. Thank you." *(she gives the player a wax tablet)* "Everything I heard, word for word, with the dates. It won't sound like me when you say it. It doesn't have to. It just has to be true." *(Gives `lsb-linnet-tablet`.)*
- → "Stay hidden. It's safest here." *(`lsb.linnet = 'hidden'`)*
  **LINNET:** "With the Bull and the figs. Sure. I've got good at hiding." *(beat)* "If the mountain goes, this garden's at the bottom of a hill, you know. Just so we both know."

### 5.6 The escape
*(Tremor: `w.shake(2.0)`. The fig tree sways, the light well rains dust, and the Gallery wall cracks open. The bull's red eyes appear at the far end.)*
**LINNET:** "That's the Bull. It's off its loop. It's never been off its loop! The Gallery. The old lift. RUN!"
*(The Gallery: the bull chases at 7 m/s; the player runs at 8. Pillars fall at fixed points (hazards that appear 1 s after a warning crack), and floor tiles crumble behind.)*
*(If `lsb.kore = 'freed'`, at the halfway mark:)* **LITTLE KORE:** "Hello! Hello, big bull! I am bronze too!" *(She grips its horns; it stops and grinds against her for 5 s.)* "Go, moving person! I'll find you! Bronze always finds bronze!" *(She rides up on the lift.)*
*(At the lift, if `testify` or `hidden` (Linnet is with you):)* **LINNET:** "The rope! Cut the rope!"
*(If `home`, Linnet has gone ahead up the light-well stair; the player is alone with the rope.)*
*(Strike: the platform shoots up the shaft. The bull hits the empty bottom of the shaft below.)*

### 5.7 The Seaward Door (chapter exit)
**Accepted:**
*(Two palace priests are waiting on the ledge.)*
**PRIEST:** "Voice-Elect! The Bull, the walls, we heard. Are you hurt? You're to purify at sea, as every Voice-Elect does. The Old Man of the Sea must look on you before the Festival. A ship waits."
*(The ship is the *Patient Cow*, hired by the House. If Linnet is with you, she is wrapped in a sailcloth among the wing crates.)*
**KESSA:** *(low)* "Hired by the House, paid in tin. If I happen to be carrying an extra roll of sailcloth that sneezes, that's my business."
**Refused:**
*(The ledge drops to a sea cave where the *Patient Cow* rides at anchor; Perdika is on the mast with a lamp.)*
**PERDIKA:** "There you are! Eumaia said you'd come out somewhere wet. She was right. She's always right; it's unbearable."
**KESSA:** "Where to? And don't say the palace."
**LINNET** *(if present)*, or the player reading her tablet (if `home`): "Pharia. The Old Man of the Sea knows what the mountain knows, and the palace doesn't own him."
*(If `lsb.linnet = 'home'`, the epilogue line:)* **KESSA:** "We'll drop the singer at Thyra on the way. Eumaia will want to wash her feet again. And again."
*(Travel to `lsb-pharia`. Title **Threader of the Labyrinth**.)*

## Learned and earned

- **Learns:** the Voices are kept for life because they know the mountain's real words; Linnet's actual warning; the blessings were softened on purpose; the Festival gathers everyone at the foot of the mountain.
- **Earns:** the title **Threader of the Labyrinth**; optionally kindness 5, Old Horn 5, the boots kept as a loan; Linnet's fate is set.

## Hook

On the ledge, with the sea below and the mountain smoking across the water, Linnet (or her tablet, in the player's hand) gives the last line of her testimony: "It said one more thing. I never told anyone, because it didn't make sense. *The bones of your mother will build your houses.* Ask the Old Man what it means. He's older than mothers."
