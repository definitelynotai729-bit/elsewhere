# Chapter 3: Three Circuits

**World:** `lsb-strait` · **Story time:** day 3, afternoon to sunset · **Playtime:** 30–40 minutes
**Rules:** `deny: ['board']` · **killY:** −12 · **Music:** root 55, phrygian, 66 bpm, `pulse: true` (Talos's steps carry the beat)
**Theme:** `sky: 'sunset-sky'` with `skyBackdrop: false`. Low gold sun in the west, bruised violet clouds (`clouds: { y: 70, color: '#6a4a7a', opacity: 0.6 }`), strong rim light. Bronze should glow.

## Summary

The *Patient Cow* is stopped in the Strait of Teeth by Talos, who hurls boulders into the water ahead of her. To pass, the player crosses his causeway between footfalls, climbs Watch Rock while it shakes, and rings the Calling Bell so the giant will kneel and talk. He lets them through, and then asks the question he has carried for centuries.

## Locations and layout

Origin (0, 0, 0) is the anchorage. Water at y 0, with a splash zone below y −0.4 that returns you to the last checkpoint. North is −z.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **The *Patient Cow*** | (0, 0.5 → anchor, 0) | hull 20 × 3 × 6; deck at y 1.5 | A mover: it sails from (0, 0.5, 200) to the anchorage in 25 s at the chapter start, then stays. Mast 11 m, a yard (spar) at y 10, rope ladders (thin ramps) up the mast, a water jar at the stern, crates of wings in the open hold. Checkpoint `deck` (this is the respawn point while the ship is anchored). |
| **The Teeth** | (−8, 1.5, −4) → (−40, 2, −20) | 9 islets, radius 2–4 m, tops at y 1–3 | Rock cylinders 4–5 m apart: a hop line from the ship's port rail to the causeway. Two are crumbling (wave-washed, delay 0.6). |
| **Talos's Causeway** | x −50, from z −20 to z −140 | 6 wide, top at y 2 | Old cyclopean blocks (stone-blocks texture). Six **footstones**, flat bronze-inlaid circles 5 m across, sit on it every 18 m (z −30, −48, −66, −84, −102, −120). Every 9 m there are **niches**: shallow alcoves (2 × 2.5 × 1.5) on the east side. Three stretches of loose **scree** (crumble tiles, delay 0.3, respawn 4) at z −55, −90 and −110. Checkpoints `causeway` (z −22) and `scree` (z −95). |
| **Watch Rock** | (−55, 0 → 42, −160) | radius 14, height 42 | A sea pillar (cliff texture) with a spiral path of 2 m ledges climbing 1.5 turns, rising about 1.8 m every 10 m of path. Four ledge sections crumble on footfalls. Ivy (decoration) and gull nests. Checkpoint `rock-base` at (−48, 2, −146). |
| **The summit** | (−55, 42, −160) | 10 m platform | The **Calling Bell**: a bronze bell, 1.6 m high, in a stone frame. A carved slab beside it. Checkpoint `summit`. |
| **Talos's pacing line** | x −64 (in the water), z −20 to −150 | | Talos wades north and south along it, so his right foot falls on the causeway footstones. |
| **Where Talos kneels** | face at (−80, 40, −160), facing +x | | When he kneels his eyes are level with the summit, 25 m away across the water. |

**Talos (the figure).** 30 m tall. He is built from primitives in a `w.model` group (BUILD.md, the giant): a beaten-bronze mask face with two furnace-orange eyes (glow 3); broad shoulders; a body plated in overlapping bronze scales like a fish; long arms. A thin red-glowing seam runs from his neck down his left leg to the ankle, where a pale tin nail the size of a door bolt is driven in. Bronze is green at the joints. He does not wear a helmet, and his face is not a warrior's.

**Sightlines.** From the deck at the start: the Teeth, the long causeway, and Watch Rock against the sunset, with Talos coming round it. From the summit: the strait, the ship, Omphe's plume to the north-west, and to the north the lights of Kerynthos, the palace on its hill.

## Objectives

### Critical path
1. **Ride in.** The ship sails in for 25 s while the crew talk. Talos appears from behind Watch Rock and throws two boulders that splash ahead of the bow. The ship anchors.
2. **Hop the Teeth** to the causeway.
3. **Cross the causeway** between footfalls (puzzle 1). Talos is pacing.
4. **Climb Watch Rock.** The ledges shake on footfalls.
5. **Ring the Calling Bell** in the shepherds' rhythm (puzzle 2).
6. **Talk to Talos.** He lets you pass, and asks his question.
7. **Return to the ship:** glide from the summit (182 m of glide reaches the deck from 40 m up), or take the rope ladder and the Teeth back.
8. **Sail for Kerynthos.** Travel to `lsb-kerynthos`.

### Optional
Kindness 3 (water for Ammi); Old Horn sighting 3 on the yard; the crew's lines; 12 tin-drops (on the Teeth, in the niches, on the summit).

## Puzzles

1. **Between steps.** Talos walks in threes: the left foot lands in the water, the right foot lands on a causeway footstone, then a pause. One beat is 1.6 s, so a full cycle is 4.8 s. The right foot comes down on the next footstone along each cycle as he paces toward the rock and then back. **A footstone's shadow darkens for 1.2 s before the foot lands,** and the landing is a hazard (radius 3) for 0.5 s that sends you to the last checkpoint. Each landing also triggers the scree within 10 m, which falls 0.3 s later and comes back after 4 s.
   *Solution:* move between footstones, wait in a niche when the shadow darkens ahead of you, and cross scree **straight after** a footfall (it has just fallen and respawned, and won't be shaken for another 4.8 s). The shadows make it readable; the rhythm makes it learnable. It is about 60 s if you get it right.
2. **The Calling Bell.** A carved slab beside the bell shows a shepherd and three marks: **— — ·**. Kessa explained it on deck: "Shepherds call him like their dogs: two slow, one quick."
   *Solution:* strike the bell (key 1, within 2.6 m) three times, with the second strike 0.9–2.0 s after the first and the third less than 0.6 s after the second. A wrong rhythm makes a dull clang and Talos keeps walking. The right rhythm rings out, everything stops, and the giant turns.

## Set pieces

- **The giant comes round the rock.** The ship's ride in is a slow reveal: the sunset, Watch Rock, then a shape larger than the rock walking out from behind it, water to his thighs. Two boulders arc overhead and burst into columns of spray ahead of the bow (`w.burst`, `w.shake(0.6)`). Nobody on deck speaks for two seconds.
- **The kneel.** After the bell, Talos stops mid-stride, turns, wades to the rock and kneels. The water surges up the pillar, and two furnace eyes come level with the summit, close enough to feel their heat (orange particles drifting toward you). His voice is slow and enormous.
- **The glide home.** From the summit to the deck of a ship in a gold strait, past a kneeling giant. Perdika on the mast: "You can make it. Barely. Don't sneeze."

## Collectibles and codex

- **Tin-drops (12).**
- **Old Horn sighting 3** (`lsb.goat.3`): on the *Patient Cow*'s yard, 10 m up, although she was left on Thyra. Reach her by the rope ladders. "Old Horn is balanced on the yard, chewing the sail's rope. Kessa will not be pleased. Kessa has not noticed."
- **Codex:**
  - **The Strait of Teeth:** "The only deep channel into Kerynthos. The Teeth are the rocks; Talos is the jaw."
  - **Talos (updated):** "Made in bronze by a god's own hands for Crete, to walk its shores three times a day. Sea-raiders brought him down once, with a witch's help and a pulled nail. He did not quite die."
  - **Ichor:** "What runs in gods instead of blood. Talos has one vein of it, neck to heel, sealed with a nail. His old nail was bronze. His new one is tin. Tin is soft."
  - **The Calling Bell:** "The shepherds of the strait once called Talos like their dogs: two slow, one quick. He came every time. Nobody has rung it in sixty years."
  - **Alashiya:** "Kessa's island, rich in copper. Its tin comes from the far west, beyond the edge of every map. Less of it every year."
  - **The *Patient Cow*:** "Broad-beamed, slow, unsinkable so far. Smells of oil, tin and goat."
  - **The Argonauts (retold):** "In the old song the sea-raiders' witch promised Talos he would never die, then pulled his nail. Here, Talos says she was right about the first part."

## Dialogue

### 3.1 On deck (the ride in, and while anchored before the bell)
**KESSA:** "The Strait of Teeth. Keep your hands in the boat; the rocks bite. Ammi, stop being sick over the cargo. Be sick over the sea, it's used to it."
**AMMI:** "Yes, Captain. Sorry, Captain. Urrgh."
**PERDIKA:** "Your mast is wrong."
**KESSA:** "My mast has crossed this sea four hundred times."
**PERDIKA:** "Wrongly."
*(Talos appears. A boulder lands ahead of the bow; spray rains over the deck.)*
**KESSA:** "Anchor! ANCHOR! Down sail! He's not aiming at us; if he were aiming at us we'd be soup."
**KESSA:** "He wants to see something. He always wants to see something. Somebody has to go up Watch Rock and ring his bell, two slow, one quick, the way the shepherds called him. Then he'll kneel and look, and if he likes what he sees, he lets you by."
**KESSA:** *(lit)* "You've got the House seal. Wave it at him." *(dark)* "You've got no seal, so you'd better have a face he likes."
**KESSA** (ask): "Well? I'm not going. I'm the captain. Captains stay with the cow."
- → "I'll go." **KESSA:** "Good. Cross the causeway between his feet. Watch the shadows. And mind the scree; it goes when he stamps."
- → "Why does a giant guard a strait?" **KESSA:** "Because someone told him to, a long time ago, and nobody has told him to stop. That's most of history, if you ask me."
**PERDIKA:** *(trust)* "I'll go up the mast and watch you. If you fall, I'll shout something useful." *(no trust)* "I'm not watching. I'll be in the hold, counting feathers."

### 3.2 Ammi's water (kindness 3; optional, while anchored)
**AMMI:** "Is the big man going to step on us? I'd rather he didn't. I'd rather nothing happened ever. Could I have some water?"
*(Fill the cup at the stern jar and bring it back.)*
- **AMMI:** "Thanks. You're nice for a god." *(`lsb.kind.3`)*

### 3.3 The carving at the summit (interact)
"A shepherd with a crook, raising one hand. Below: two long grooves and a short one. — — ·"

### 3.4 Talos
*(After the correct ring. He kneels. The eyes come level.)*
**TALOS:** "One. Two. Three."
**TALOS:** "That is a circuit. I have walked four hundred and eleven thousand and six. I stopped in the middle of the four hundred and eleven thousand and seventh. That is not allowed. The bell is allowed."
**TALOS:** "You rang like a shepherd. You are not a shepherd. Shepherds are smaller and they smell of goat."
*(If Old Horn sighting 3 was found:)* **TALOS:** "...Your ship smells of goat."
**TALOS:** "Rule. No stranger passes the Teeth unbidden by the House. Show me."
**TALOS** (ask): "What do you bring?"
- → *(lit only)* "The House seal."
  **TALOS:** "The double axe. The House bids you. Pass." *(pause)* "The House bid the last one too. Nine years. She sang on the deck. I liked the singing."
- → "This guest-token. Eumaia of Thyra gave it to me."
  **TALOS:** "A token. Broken clay. Half." *(a long pause; something inside him ticks)* "There is a rule before my rule. A guest of a hearth is not a stranger. My maker told me that one first. I had forgotten it was first. Pass, guest."
  *(Sets `lsb.talos.token`; Talos remembers it in Chapter 9.)*
- → "I'm asking. Please."
  **TALOS:** "Please is not a seal. Please is not a token." *(pause)* "Please is not nothing. No one has said please to me since the shepherds. Pass. Do not tell the House."

**TALOS:** "Now you are bidden, I may ask. One question. The shepherds answered my question every day. Then the shepherds went away."
**TALOS:** "My maker made me with his hands. He said: walk three circuits a day. Guard. Wait. I will come back and tell you it was well done."
**TALOS:** "I have walked four hundred and eleven thousand and six circuits. I have guarded. I have waited."
**TALOS** (ask): "Is my maker coming back?"
- → "No. He's gone. Nobody is coming back to tell you." *(`lsb.talos = 'truth'`)*
  **TALOS:** "..."
  **TALOS:** "One. Two. Three." *(very quietly)* "That is how many times I counted, after the shepherds stopped answering. Then I stopped counting the answers."
  **TALOS:** "If no one is coming, then no one can tell me it was well done. Then I must decide if it was well done."
  **TALOS:** "I will think about it for a circuit. Perhaps two. Thank you, guest. It is heavy, and it is mine."
- → "Yes. Keep walking. He'll come." *(`lsb.talos = 'lie'`)*
  **TALOS:** "Yes." *(the eyes brighten)* "Yes. Then I walk. Three circuits. Guard. Wait."
  **TALOS:** "You have made me very happy. I will walk well. I will walk until he comes."
  *(Perdika, later on deck, if trust:)* **PERDIKA:** "That was kind. I think. Ask me again when I've decided."
- → "I don't know." *(`lsb.talos = 'unsure'`)*
  **TALOS:** "No one knows. That is the answer the shepherds gave."
  **TALOS:** "Then I will walk, and I will wonder. Wondering is heavier than bronze. I did not know that until now."

**TALOS:** "One more thing is allowed, because you said a true thing or a kind thing, and I do not know which is heavier."
**TALOS:** "Nine years, a new voice goes up the mountain. The old voice goes down. I carry them down sometimes, from the Mouth to the House. They are very light. They do not say anything."
**TALOS:** "The mountain hums now. I hum back. We are both hot inside. I do not think the mountain is waiting for anyone."
**TALOS:** "Pass, guest. Mind my feet."
*(He rises. The surge rolls toward the ship; the anchored ship rocks. Objective: "Return to the *Patient Cow*." Talos wades north and sits down on the far causeway, watching the sunset with his arms on his knees. He does not resume walking while the player is in the strait.)*
*(Title **Who Spoke with Talos**.)*

### 3.5 Back on deck
**KESSA:** "He knelt. I've crossed this strait four hundred times, and I've never seen him kneel. What did you say to him?"
- → "The truth." *(any branch)* **KESSA:** "Brave. Expensive, usually."
- → "That's between us." **KESSA:** "Fair. Every captain has a list of things that are between her and the sea."
**PERDIKA:** *(if `lsb.talos = 'truth'`)* "I saw him sit down after. Like an old man on a step. I've never seen bronze look tired." *(if `'lie'`)* "He's walking faster than before. Is that good? It looks good. It looks like the opposite of good."
**KESSA:** "Up anchor. Kerynthos by dark. Ammi, if you're sick on the House's wings I'll sell you to the House."
*(Sailing montage: the strait opens and the palace's lights come up the hill. Travel to `lsb-kerynthos` with arrival `harbour-lit` or `harbour-dark`.)*

### 3.6 Arrival note (the last line of the chapter, at Kerynthos harbour)
*(Dark only. A dock-hand calls out as the ship ties up.)*
**DOCK-HAND:** "You're late, Cow! The *Labrys* came in at noon with a prisoner, if you can believe it. An old woman from Thyra with a goat-smell and a mouth on her. Shouted at the Axe-Bearers all the way up the hill."
**KESSA:** *(quietly)* "That's Eumaia. They'll have put her in the guest rooms. The House never calls anything a prison."

## Learned and earned

- **Learns:** the Voices are carried down from the mountain "very light" and silent; the mountain "is not waiting for anyone"; xenia came before Talos's own rule; Eumaia is held at the palace (dark).
- **Earns:** the title **Who Spoke with Talos**; optionally kindness 3, Old Horn 3 and tin-drops. `lsb.talos` sets Talos's fate in Chapter 9.

## Hook

As the ship enters Kerynthos harbour, the palace above is lit from end to end, red columns gold in the torchlight, the horns of consecration black against the stars. From somewhere deep under the hill comes a long, low sound, half wind and half animal. Ammi: "What's that?" Kessa: "The Bull. Under the House. Don't ask about the Bull."
