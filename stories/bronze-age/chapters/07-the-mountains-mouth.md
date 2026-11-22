# Chapter 7: The Mountain's Mouth

**World:** `lsb-omphe` · **Story time:** day 9, the Festival of the Voice · **Playtime:** 45–55 minutes
**Rules:** `deny: ['board']` · **killY:** −20 · **Music:** root 53, minor, 70 bpm, `pulse: true`, then silence for the choice
**Theme:** an ash-hazed afternoon: horizon `#c9895a`, top `#4a3a3a`, sun a flat orange disc, fog 60–380 m in grey-brown. Ash falls everywhere (`particles`, kind `snow`, grey, slow). After the eruption the fog closes to 40–220 m and the sky goes red-black.

## Summary

Festival day. The whole Isles sit in the Ear, the great amphitheatre at the mountain's foot, waiting for the god to speak. The Voice-Elect is carried up the Processional Road; a refuser climbs the north face past steam vents. In the Listening Room near the summit the player aims the great bronze horns, hears the mountain plainly for the first time, finds the speaking tube rerouted to the Speaker's mouth, and faces Phemonoe. Then they choose what the Isles will hear. The mountain answers, and the player glides down through its first great eruption.

## Locations and layout

Origin (0, 2, 60) is the centre of the Ear's stage. The mountain rises to the north (−z). Its summit rim is at y 160, centred on (0, 160, −30).

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **The Ear** | (0, 2 → 20, 80) | half-ring, radius 50, 14 tiers | Stone seating facing north. A crowd of about 60 NPC silhouettes with avatars (BUILD.md feature 4) suggests thousands. Checkpoint `ear`. |
| **The Throat** | (0, 10, 20) | a bronze horn-bell 8 m across | The end of the speaking tube, aimed at the Ear. Whatever reaches it is heard by everyone. |
| **Processional Road** (accepted) | south face, (0, 2 → 140, 20 → −10) | 9 switchbacks, 4 wide | The Voice-Elect rides a litter (a mover platform with bearer NPCs) up the road in 70 s, with dialogue. |
| **North landing** (refused) | (0, 0.5, −260) | a black-sand cove | The *Patient Cow*. Checkpoint `north`. |
| **North Face** (refused) | (0, 0 → 140, −250 → −40) | the climbing route | Pumice scree ramps (some crumble), basalt ledges 1–2 m apart, six steam vents (updrafts 10 × 18 × 10, force 30, **pulsing 3 s on, 3 s off**, a plume rising 0.8 s before each), a lava tube (a tunnel 3 × 3 × 40) and the Sulphur Stair (yellow-crusted steps). About 5 minutes. Checkpoints `vents` (y 50) and `tube` (y 110). |
| **The Listening Room** | (0, 140, −20) | a cave chamber 20 × 16 × 10 | The **fissure**, a glowing crack in the floor 1 × 6 m (hazard), and the **tripod**, a bronze seat over it at (0, 141.5, −20). **Three listening horns**: bronze trumpets 6 m long on floor pivots, at (−7, 141, −24), (0, 141, −27) and (7, 141, −24). Three glowing seams in the walls. **The Speaker's alcove** at (9, 140, −14) with her mouthpiece. The tube mouthpiece beside the tripod. Checkpoint `room`. |
| **The pipe walk** | from (10, 141, −12) out along the cliff to (38, 138, −6) | a cylinder 0.6 m wide, 30 m long | The bronze speaking tube runs outside along the cliff face. A sideways wind pulses (force 9, 3 s on, 4 s off). The **junction valve** at (38, 138, −6) is a bronze wheel with a painted arrow. |
| **Summit rim** | (0, 160, −30) | a ring 60 across | Reached by a crumbling path from the Room's mouth. Glide start. Checkpoint `rim`. |
| **The descent** | from the rim south to Omphe harbour (0, 1, 200) | 230 m across, 159 m down | The Gate of Pumice (two spires 12 m apart at (0, 90, 60)), lava rivers below (glowing hazard bands at ground level) and lava bombs (hazard spheres with ground shadows). |
| **Omphe harbour** | (0, 1, 200) | quay 40 × 6 | The ships. The chapter exit. |

**Sightlines.** From the litter or the north face, the Ear is a ring of tiny faces. From the Room's mouth, the Throat glints far below. From the rim, the whole Hearth Isles at once: Kerynthos's palace to the east, Thyra a dot to the south, the sea strangely flat.

## Objectives

### Critical path
1. **Reach the Listening Room:** ride the litter (accepted) or climb the north face (refused).
2. **Aim the horns.** Hear the mountain.
3. **Find the rerouted tube.** Walk the pipe and turn the valve to the Throat.
4. **Face Phemonoe.**
5. **The choice:** what the Throat says.
6. **The eruption:** free the acolyte (optional), climb to the rim, glide to the harbour. Travel to `lsb-aphanes`.

### Optional
Kindness 7 (free the acolyte Dion); Old Horn sighting 7 on the rim; 12 tin-drops on the north face and the pipe walk.

## Puzzles

1. **The Breath** (north face). Vents pulse 3 s on, 3 s off, and the plume shows 0.8 s before the lift. *Solution:* stand on the vent stone as the plume starts, rise with it, and step off onto the ledge above at the top. Pumice ramps crumble on a 0.6 s delay, so keep moving on them.
2. **The horns.** Each horn turns in 45° steps (interact or strike) through four positions. When a horn's mouth faces its glowing seam, streams of orange motes flow into it and one note sounds: low, lower, lowest. *Solution:* the left horn faces north-west, the centre horn north, the right horn north-east, each at its own seam. With all three aimed, the three notes Linnet described sound together, and the mountain's words come in heavy, slow toasts (dialogue 7.3).
3. **The valve.** The arrow painted on the wheel points to "the Speaker's alcove" (a painted mouth). *Solution:* walk the pipe between gusts (hold still on it while the ribbon tied to the valve streams sideways), then strike the wheel twice. Each strike turns it a third of a turn, and the arrow must point down the mountain, to "the Throat" (a painted horn). A fair clue in the Room before you go: speaking into the tripod's mouthpiece produces only a hollow echo in the Speaker's alcove ("...echo..."), so the player can hear that the tube is going the wrong way.
4. **The descent.** Lava bombs fall on fixed, repeating arcs from the crater (eight arcs on a 5 s cycle), each with a growing shadow on the slope 1.5 s before it lands, and they are only dangerous as they land. The Gate of Pumice is the safe line between the arcs. *Solution:* glide straight through the Gate, then bear left of the lava rivers to the quay. There is plenty of height (about 700 m of glide), so the challenge is the line, not the distance.

## Set pieces

- **The litter.** Carried up nine switchbacks above a sea of faces, flowers thrown, a hymn rising, ash falling like grey snow, the Speaker walking beside you and talking softly about honour. Beautiful and terrible.
- **The mountain speaks.** With three horns aimed, the Room fills with sound. The camera shakes very slowly and the words come one at a time.
- **The Throat.** Whatever the player chooses is heard by everyone. With the truth, the crowd in the Ear goes still, then stands, then moves, the way water moves out of a basin. With comfort, the crowd cheers and stays seated while ash falls on them.
- **The eruption glide.** The mountain answers with a roar, `w.shake(3)`, and fountains of fire from the crater. The player runs a crumbling path to the rim and glides down through a sky of falling stones toward ships with lanterns lit.

## Collectibles and codex

- **Tin-drops (12).**
- **Old Horn sighting 7** (`lsb.goat.7`): on the highest rock of the rim, silhouetted against the erupting crater. "Old Horn, on top of an erupting volcano, looking mildly put out."
- **Codex:**
  - **The Festival of the Voice:** "Every ninth summer the Isles gather in the Ear to hear the new Voice. Everyone comes, because everyone always has."
  - **The Ear:** "The amphitheatre at the mountain's foot. It holds every family in the Isles, if they sit close and nobody brings a goat."
  - **The Throat:** "A bronze horn the size of a house. Whatever goes into the tube at the top comes out of the Throat at the bottom, loud enough to hear from the last row."
  - **The Listening Horns:** "Ikmalios's work. Aim them into the rock and you hear what the rock is saying. It is not saying anything holy. It is saying: hot, full, soon."
  - **The Tripod:** "Bronze, three-legged, placed over the fissure where the mountain breathes. Ten strangers have sat on it. Nine got up."
  - **Phemonoe's Verses:** "Forty-one Speakers have each made the Voice's words beautiful. Most of them only meant to."

## Dialogue

### 7.1 Getting there
**Accepted (the litter):**
**SPEAKER PHEMONOE:** "Wave, Voice-Elect. They've waited nine years for you. Some of them waited their whole lives for this."
**SPEAKER PHEMONOE:** "When you sit on the tripod, you will feel the god in your teeth. Say what comes. I will make it beautiful. That is my whole craft: I take what is rough and true, and I make it bearable."
**SPEAKER PHEMONOE** (ask): "You're quiet. Are you afraid?"
- → "Yes." **SPEAKER PHEMONOE:** "Good. The ones who aren't afraid say foolish things."
- → "What happens to me afterwards?" **SPEAKER PHEMONOE:** "Honour. Cushions. Lamps. A long, quiet life." *(beat)* "You've met Tarkon, then. I'm sorry for that. It's a hard thing to meet."
- → "I know what Linnet said." **SPEAKER PHEMONOE:** *(her face doesn't move)* "Then you know how frightening it was. Wave, Voice-Elect. They're watching."
*(If `lsb.linnet = 'testify'`: Linnet is among the litter-bearers, hooded. She catches the player's eye and nods.)*

**Refused (the north landing):**
**KESSA:** "This is as close as I go. If the mountain does anything clever, I'm leaving without you, and I'll feel terrible about it for at least an hour."
**PERDIKA:** "Vents. See the plume? Up you go when it plumes, not after. And no soaring."
*(If `testify`:)* **LINNET:** "I'm coming. Nine years I came up the other side on a litter. I'd like to try it with my own feet."

### 7.2 The Listening Room (on entering)
*(Accepted: the priests seat the player on the tripod and withdraw. Phemonoe goes out to the rim to begin the rites.)*
**SPEAKER PHEMONOE:** "When the hymn ends, listen. When the god speaks, speak."
*(Refused: the Room is empty. Phemonoe's voice drifts in from the rim through the cave mouth, leading a hymn.)*
**SPEAKER PHEMONOE** (distant): "...and since the god's Voice is silent, I, the god's servant, will carry the god's word myself this once..."
**Signs (interact):**
- **Tripod:** "Bronze, warm. Three legs over a crack that breathes. The seat is worn smooth by ten strangers."
- **Mouthpiece:** *(speaking into it)* "Your voice goes into the tube, and a moment later comes back faint and hollow from the Speaker's alcove behind you: '...echo...'"
- **Alcove:** "The Speaker's robing alcove. A second mouthpiece, polished, and wax tablets of verses. One reads: *The god is pleased. Remain, and be lifted.*"

### 7.3 The mountain's words (when all three horns are aimed)
*(Toasts, one at a time, 2 s apart, with the slow shake:)*
"...LOW..."
"...LEAVE THE LOW PLACES..."
"...THE SEA... WILL BE THROWN..."
"...CHILDREN... HIGH... AWAY..."
"...NOW..."
*(If Linnet is present:)* **LINNET:** "That's it. That's exactly it. Nine years, and nobody else ever heard it. You heard it."
*(If not:)* the player holds `lsb-linnet-tablet` (home) or Linnet's words from Chapter 5. The toast adds: "It is word for word what Linnet heard."

### 7.4 Phemonoe
*(She comes in from the rim as the valve turns. She has heard the Throat go silent.)*
**SPEAKER PHEMONOE:** "You turned the tube. Ikmalios told me someone would one day. I hoped it would be after I was dead."
**SPEAKER PHEMONOE:** "Listen to me before you speak. Down there are four thousand people in one bowl. If the Throat tells them the mountain is about to kill them, they will run for the harbour all at once. They'll trample their own children on the steps. They'll fight over boats. More will die in the panic than in the fire."
**SPEAKER PHEMONOE:** "I have kept these Isles calm for twenty years with words. Hope is a lie we tell until it comes true. Let me tell it one more day. Tomorrow I'll send the ships out quietly, a few at a time, in good order."
**SPEAKER PHEMONOE** (ask): "Well?"
- → "People can bear the truth." **SPEAKER PHEMONOE:** "Can they? I've never once seen it."
- → "You're afraid of them." **SPEAKER PHEMONOE:** "Of course I'm afraid of them. They're the only thing in the Isles bigger than the mountain."
- → "Tomorrow is too late." **SPEAKER PHEMONOE:** "...You've been to the Old Man." *(If `lsb.proteus = 'when'`:)* "And he told you exactly when. Of course he did. He never tells me anything."
*(If `lsb.linnet = 'testify'`:)* **LINNET:** "You took everything I said for nine years and made it pretty. 'The mountain will lift the faithful high.' I said take the CHILDREN high, Phemonoe."
**SPEAKER PHEMONOE:** *(quietly)* "I know what you said. I wrote it down every day. I have all of it. I just never read it to anyone."

### 7.5 The choice
**SPEAKER PHEMONOE:** "Then it's yours. The seat, the tube, the Isles. Say what you're going to say."
*(The player stands at the mouthpiece. The hymn below fades. Silence. The music stops.)*
**(ask, no speaker name):** "What does the Throat say?"
- → **"The truth: leave the low places. Take the children high, then take them away. Go to the ships in order."** *(`lsb.voice = 'truth'`)*
  *(The words roll out of the Throat. Below, the Ear goes still, then a figure at the front stands and lifts a child onto her shoulders, then the next row stands.)*
  **SPEAKER PHEMONOE:** *(watching)* "...They're not running. They're walking. The old ones first. Look at them." *(beat)* "I never once let them try."
- → *(only if `lsb.linnet = 'testify'`)* **"Linnet. Tell them yourself."** *(`lsb.voice = 'linnet'`)*
  **LINNET:** *(at the mouthpiece; her voice cracks, then steadies)* "It's me. It's the Voice. It's Linnet. I've been gone thirty days because nobody was passing on what I said. So I'll say it myself, once, plainly. Leave the low places. Take the children high, and then take them away. Go to the ships. Go now, in order. I'm sorry it took me so long."
  *(The Ear rises. Somewhere a voice shouts "It's her! It's the Voice!", then thousands at once, the shout of a crowd recognising someone.)*
- → **"Comfort: the god is pleased. Remain, and be lifted."** *(`lsb.voice = 'comfort'`)*
  *(The Ear cheers. The hymn starts again. Nobody moves. Ash falls into the open mouths of singers.)*
  **SPEAKER PHEMONOE:** *(she doesn't look happy)* "...Thank you. Tomorrow. In good order. I promise you." *(If Linnet is present she walks out without a word.)*
- → **"Say nothing."** *(`lsb.voice = 'silence'`)*
  *(The Throat hums with the mountain's three notes and no words. The crowd waits. Then, uncertain, the hymn begins again.)*
  **SPEAKER PHEMONOE:** "Silence. The god is fasting still. They'll take that as patience." *(beat)* "So will I."

### 7.6 The mountain answers
*(Every branch: the deepest sound in the game. `w.shake(3)`. Fire from the crater, rocks falling, the Room's ceiling cracking. A beam falls on the acolyte Dion by the cave mouth.)*
**DION** (the acolyte): "My leg! It's under the beam!"
*(Kindness 7, optional: strike the beam's binding rope twice and it rolls off. `lsb.kind.7`.)* **DION:** "You... thank you. I'll carry this down and tell everyone what the stranger did."
**SPEAKER PHEMONOE:** "Go! The rim path, and glide if you have wings. I'll take the stair with the priests." *(If `truth` or `linnet`:)* "I have tablets to burn and twenty years to explain." *(If `comfort` or `silence`:)* "I'll go down to them. I'll tell them it's a blessing. It's what I'm good at."
*(If Linnet is present:)* **LINNET:** "I'll go with the priests. They know the old stair. Fly, Stranger. Fly low."
*(Objective: "Climb to the rim and glide to the harbour.")*

### 7.7 At the harbour (landing)
*(The quay. Kessa's ship with lanterns lit.)*
**Truth or Linnet:**
**KESSA:** "You did it. I heard it from here. The whole bowl got up and started walking like a procession. Families, oxen, goats, the lot. The ships are filling. Not fast enough, but filling."
**PERDIKA:** *(if trust)* "I saw you come down through the fire. Through the GATE. You flew LOW." *(no trust)* "You came down through the fire. I watched. I didn't look away. That's new for me."
**Comfort or Silence:**
**KESSA:** "They're still up there singing. Ash on their heads like flour, and singing." *(beat)* "My ship's half empty. I've never sailed half empty in my life. I'm not starting tonight. We'll take who we can."

**Both:**
**KESSA:** "Every ship's running loads across to Kerynthos; the big harbour's there, and the big ships. In, Stranger. We're one of them."
*(The crossing at dusk: a montage on deck, with the burning mountain behind. Travel to `lsb-aphanes`, which opens on Kerynthos harbour at nightfall. Title **Voice of Omphe** if `truth`; title **Who Gave Back the Voice** if `linnet`.)*

## Learned and earned

- **Learns:** the mountain's real words; Phemonoe kept every true word on tablets; what the Isles heard.
- **Earns:** the title **Voice of Omphe** (truth) or **Who Gave Back the Voice** (Linnet); optionally kindness 7 and Old Horn 7. **`lsb.voice` decides whether the Isles are warned.**

## Hook

At Kerynthos harbour at nightfall, with the first families stepping off the boats, the sea draws back as if the whole bay were taking a breath: out past the harbour mouth, past the moorings, out and out. Fish flap on the wet stones. Ships lie down on their sides. Half a kilometre out, by the light of the burning mountain, something rises out of the falling water: roofs, columns, horns of consecration, a whole palace crusted in shell. Teuthis, the fisherman from Thyra's quay, says from the crowd: "Aphanes. The House before the House. My grandmother said it was a story."
