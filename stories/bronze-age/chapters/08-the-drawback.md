# Chapter 8: The Drawback

**World:** `lsb-aphanes` · **Story time:** night of day 9 · **Playtime:** 30–40 minutes
**Rules:** `{}`, everything allowed (a hoverboard on wet sand is very welcome) · **killY:** −30 · **Music:** root 48, minor, 100 bpm, `pulse: true`
**Theme:** night lit red from the north by the mountain (sun colour `#ff5a2a`, low, intensity 1.2), stars 0.4, fog 80–520 m in `#2a1a1a`. The seabed is wet and reflective (low `rough`). A dark wall of water stands on the southern horizon.

## Summary

The sea has drawn back half a kilometre from Kerynthos and uncovered Aphanes, the drowned palace of the age before. A wave will follow. The player goes down onto the seabed and into the shell-crusted palace for one thing the last age left: memory, bread or a bronze heart. Each is heavy, and only one can be carried out. The old palace's tablets show the same custom, the same warning and the same silence. Then the first wave comes.

## Locations and layout

Origin (0, 2, 0) is Kerynthos quay. The seabed slopes south (−z). The returning wave comes from the far end.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Quay** | (0, 2, 0) | 40 × 6 | Crowds, torches, Kessa's horn. Checkpoint `quay`. The **cliff stair** to safety rises east of it, from (24, 2, 4) to (24, 30, 30). |
| **The slope** | (0, 2 → −8, 0 → −150) | 200 wide | Wet sand and rock (gravel and mossy-rock textures, low rough). Stranded boats lie on their sides (tilted boxes and ramps you can climb), with flopping-fish particles and weed. |
| **Seabed flats** | (0, −8, −150 → −560) | 300 wide | Flat, with a **channel** (a 6 m wide strip of shallow water at y −8.3 running from (−60, −8, −200) south). The stranded dolphin's pool is at (−30, −8, −190). |
| **Aphanes** | (0, −8 → +6, −300 → −420) | the palace on a 14 m rise | A shell-crusted Bronze Age palace like Kerynthos, smaller and older. The **Sea Gate** (entrance) at (0, −8, −300). The **Hall of Shells** (40 × 30, columns furred with weed) and three wings: the **Archive** (west, (−30, −6, −360)), the **Granary** (east, (30, −6, −360)) and the **Forge** (north and deepest, (0, −12, −410), down a broken stair). The **Throne Room of the last age** at (0, −6, −385). Roofs at y 0 to +6 with stone horns. Checkpoint `sea-gate`. |
| **The wall of water** | at z −650, moving north | 400 wide × 18 high | A dark, foam-crested moving hazard (BUILD.md feature 5). Starts moving at 90 s before the timer ends. |

**Timer.** The drawback lasts **7 minutes** (420 s), or **10 minutes** if `lsb.proteus = 'how'` (Proteus said "longer than you'd think"; the extra time is also marked by a toast and a route of torches Kessa's crew set out). The objective line shows the time left. Kessa's horn blows once a minute, and twice at 90 s left, when the wall starts moving at 10 m/s.

**Timing math.** On foot the player runs 8 m/s, 6 m/s while carrying a relic (`setSpeed(0.75)`). From the Sea Gate (z −300) to the cliff stair is about 310 m: 52 s while carrying. The wall needs 65 s from z −650 to the quay. Leaving Aphanes at the double horn gives about 13 s to spare. A board or a glide from a stranded ship's mast gives more.

## Objectives

### Critical path
1. **Hear the three advisers** on the quay (dialogue 8.1), then go down onto the seabed.
2. **Cross to Aphanes:** the slope, the stranded ships, the flats.
3. **Enter by the Sea Gate.** Open the wing you want through its Tide Door (puzzle 1).
4. **Take one relic:** the Tablets (Archive), the Seed Jar (Granary) or the Bronze Heart (Forge).
5. **Read the last age** in the Throne Room (optional but signposted; puzzle 2).
6. **Outrun the wave** to the cliff stair. Travel to `lsb-harbour`.

### Optional
Kindness 8 (the stranded dolphin); Old Horn sighting 8; the old palace's frescoes; 15 tin-drops (in the stranded boats and the Hall of Shells).

## Puzzles

1. **The Tide Doors.** Each wing's door is a stone slab held down by a counterweight: a man-high jar full of trapped seawater. Strike the clay plug at a jar's base (key 1) and the water pours out (particles). As the jar lightens, the door rises (a mover, 3 s).
   - **Archive** and **Granary:** one plug each. *Solution:* strike the plug.
   - **Forge:** draining the jar is not enough, because a channel from the Hall keeps refilling it (a visible stream). *Solution:* first strike the wooden chock under the sluice board in the Hall (the board drops and blocks the channel), then strike the plug. The door rises.
2. **The last age's tablets** (Throne Room). Three cracked tablets lie on the throne's step, each with a picture in the house signs. Placing them in the three slots on the throne's base (interact a tablet, then a slot) makes a sentence. Pictures: **A** a figure on a three-legged seat over a crack; **B** a woman in a tall headdress with bees around her mouth (sweet words); **C** a wave over a palace roof.
   *Solution:* **A, B, C**: the stranger speaks, the House sweetens the words, the sea comes. The fresco behind the throne, cleaned of weed by the solved slot, shows a figure on a tripod, a speaker with bees, and a wave. Exactly what is happening now, three hundred years earlier.
3. **The carry.** A relic weighs you down (`setSpeed(0.75)`, no double jump while carrying). Picking up a second relic puts the first back on its pedestal: "You can't carry both. The last age couldn't either." *Solution:* choose before you lift.

## Set pieces

- **Walking on the sea floor.** By the light of an erupting mountain the player walks down a beach that was water an hour ago, past fishing boats lying on their sides, starfish, a crab marching somewhere urgent, toward a palace crusted in shell that rises like a whale's back.
- **The mirror.** In the Throne Room of the last age: the same throne as Kerynthos, the same tripod, the same story. The past rhymes.
- **The wave.** The double horn sounds. The far horizon is a moving wall of foam, louder every second. The player runs up a 300 m slope carrying something heavy, with stranded ships to vault over, as water pours into the ruins behind them. At the cliff stair, the wave breaks against the quay below in a blast of spray (`w.shake(2)`, a burst wall), and the stair holds.

## Collectibles and codex

- **Tin-drops (15).**
- **Old Horn sighting 8** (`lsb.goat.8`): on the drowned palace's roof between its stone horns (0, 6.5, −340), reached from the Hall of Shells' collapsed upper floor. "Old Horn, on the roof of a palace that was underwater an hour ago. She is dry. Of course she is dry."
- **Codex:**
  - **Aphanes:** "The Unseen. The House before the House, taken by the sea three hundred years ago. It shows itself once, when the sea draws back for the next wave."
  - **The Drawback:** "Before the great wave, the sea goes out. People walk down to look at the fish. Remember this. Tell your children."
  - **The Tablets of Aphanes:** "The last age's records in the house signs. Lists of oil, of oxen, of strangers. The last tablet says only: *the Voice said leave. The House said stay.*"
  - **The Seed Jar:** "Sealed barley from the last age's last harvest, kept dry in wax three hundred years. Barley keeps. People don't."
  - **The Bronze Heart:** "A spare heart Daedalus forged for Talos, kept in the old Forge in case the first one failed. It still beats faintly when you hold it."
  - **The Last Age:** "They kept strangers as Voices too. They sweetened the words too. They had a bronze giant too. The giant was the only one who tried to stop the sea."

## Dialogue

### 8.1 On the quay (the three advisers; play in any order, each once)
**KESSA:** "Don't. Whatever you're thinking, don't. That's the sea floor, and the sea wants it back." *(beat)* "Seven minutes, maybe. My grandmother's grandmother said the sea goes out once, and the second time it comes in, it doesn't stop. I'll blow the horn every minute. Two blasts means run."
*(If `lsb.proteus = 'how'`:)* **KESSA:** "Your old man said longer than you'd think. Fine: ten. My crew will set torches on the safe line. Don't dawdle."

**IKMALIOS:** *(at the quay's edge, staring at the palace in the dark)* "Aphanes. My family's first House. Daedalus built Talos a spare heart, in case the first one failed. It was in the old Forge when the sea came. If Talos is going to stand against what's coming tomorrow, and he will try, he'll need more than a tin nail." *(If `lsb.compass.returned`:)* "I'd go myself. My knees are sixty and the sea is fast. Go, and thank you." *(Otherwise:)* "I'm not asking you. I'm telling you where it is."

**PERDIKA:** "Gran said the old ones kept seed for the bad year, sealed in wax. If the new shore has bread by spring, the children live through the winter. If not..." *(She doesn't finish.)* "I can't go down there. I can't. You know I can't."
*(If `lsb.perdika.trust`:)* **PERDIKA:** "...Next time. Next time I'll go. Tell me what it's like."

**TEUTHIS:** "My grandmother said Aphanes wrote everything down. Every jar of oil, every stranger. If they wrote down what happened to them... somebody ought to read it before the sea takes it back again."
*(If Linnet is present (`testify`):)* **LINNET:** "Tablets. Records. Proof it happened before. If the new place knows this happened twice, maybe it won't happen a third time." *(beat)* "Or the bread. I'd take the bread. I'm hungry and I'm a hypocrite."

### 8.2 The dolphin (kindness 8)
*(A young dolphin lies in a shrinking pool on the flats, slapping its tail. It is a physics ball (radius 0.7) dressed as a dolphin. The channel lies 15 m downslope.)*
*(Toast on approach:)* "A young dolphin, stranded. The channel is just there, downhill."
*(Kick or push it downhill into the channel zone: a burst of spray as it shoots off south. `lsb.kind.8`.)*
*(Toast:)* "It's gone. Out there somewhere, toward the wall of water. Dolphins know about waves."

### 8.3 Relic pickups (toasts and lines)
- **Tablets** (`lsb.relic = 'tablets'`): "A bundle of clay tablets tied in a bronze band, heavier than they look. Three hundred years of names."
- **Seed Jar** (`lsb.relic = 'seed'`): "A wax-sealed jar of barley, cold and heavy. Something rattles inside like rain."
- **Bronze Heart** (`lsb.relic = 'heart'`): "A bronze heart the size of a lamb, warm from the inside. It beats once in your hands. Then again."
*(After lifting:)* objective "Get out before the sea comes back." The speed scale is 0.75.

### 8.4 The Throne Room (after the tablets are ordered)
*(The fresco revealed. Toast, then:)*
"The stranger speaks. The House makes the words sweet. The sea comes."
*(If Linnet is present she says from the Sea Gate, her voice echoing:)* **LINNET:** "They had a Voice. They had a Speaker. They had a festival. Oh, they had everything."
*(If not, the player gets the codex entry **The Last Age** and the toast:)* "Three hundred years ago, someone sat on a tripod and said 'leave'. Someone else made it beautiful."

### 8.5 The wave
*(At 90 s left, the double horn.)* **KESSA** (distant, through the horn, as a toast): "TWO BLASTS! RUN!"
*(At 30 s left, if the player is still on the flats:)* toast: "The roar is everywhere now."
*(Caught by the wave: respawn at the `sea-gate` checkpoint with 90 s on the clock, the relic still held; the wall resets to z −650. This repeats as often as needed, so the chase never soft-locks.)*
*(Reaching the cliff stair:)*
**KESSA:** *(hauling the player up the last step)* "Got you. Got you! Look at that. Look at that."
*(The wave smashes into the quay below. Spray reaches the stair. Ships that were lying down stand up and are thrown against the harbour wall.)*
**KESSA:** *(quietly)* "That was the small one. The old man said it. The big one comes with the mountain, in the morning."
*(If `lsb.relic = 'heart'`:)* **IKMALIOS:** "You found it. Give it here. No, hold it a moment longer; it likes you. We'll take it to Talos at first light."
*(If `'seed'`:)* **PERDIKA:** "Barley. Three hundred years old. Do you think it'll grow?" *(beat)* "It'll grow. I'm deciding that it'll grow."
*(If `'tablets'`:)* **TEUTHIS:** "My grandmother was right. They wrote everything down." *(If Linnet is present:)* **LINNET:** "I'll learn to read them. I've got time now. I think I've got time."
*(Title **Who Walked the Drawn Sea**. Travel to `lsb-harbour`.)*

## Learned and earned

- **Learns:** it has all happened before; the last age had the same custom and was drowned for it; the big wave comes in the morning with the mountain.
- **Earns:** the title **Who Walked the Drawn Sea**; one relic (`lsb.relic`); optionally kindness 8 and Old Horn 8.

## Hook

Before dawn on Kerynthos's cliff, Talos walks out of the dark sea toward the harbour mouth, which is not on his circuit. He stops there, knee-deep, and looks back at the town. *(If `lsb.talos = 'lie'`, he passes the harbour mouth without stopping and walks south along his circuit, counting aloud: "Four hundred and eleven thousand and nine...")*
