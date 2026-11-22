# Chapter 6: The Old Man of the Sea

**World:** `lsb-pharia` · **Story time:** evening of day 6 to noon of day 7 · **Playtime:** 35–45 minutes
**Rules:** `deny: ['board']` · **killY:** −10 · **Music:** root 60, dorian, 84 bpm, sparkle 0.35
**Theme:** blinding noon: `sky: 'clear-sky'`, `skyBackdrop: false`, horizon almost white, sun overhead, exposure 1.1. Heat-haze particles over the sand.

## Summary

To prove what the mountain said, the player needs an oracle the palace doesn't own. On the low seal island of Pharia, Kyllo sells them a sealskin (smelly), and the player hides in the Old Man of the Sea's flock while he counts it, grabs him as he sleeps at noon, and holds on while he becomes a lion, a serpent, running water, a tree and fire. Beaten, he answers exactly one question.

## Locations and layout

Origin (0, 1, 0) is the landing beach. The island is low, about 160 × 100 m, mostly at y 1–3. Sea at y 0 with a splash zone below y −0.4.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Landing beach** | (0, 1, 0) | 30 × 12 | The *Patient Cow* anchored offshore at (0, 0.5, 25). Checkpoint `landing`. |
| **Kyllo's cave** | (40, 1, 8) | sea cave 10 × 5 × 12 | Kyllo's pack and wares; sealskins drying on a line. |
| **Netting rocks** | (−35, 1.5, 5) | 12 × 8 | Fishermen's old nets. A seal is tangled in one (kindness 6). |
| **The Counting Beach** | (0, 1, −40) | 60 × 20 | Four rows of seals (grey ellipsoid shapes, 1.6 m long, with a 4 s breathing animation), with gaps between rows. Proteus's sleeping rock, a flat slab 4 × 0.6 × 3, is at the head of the rows at (0, 1.6, −52). Checkpoint `beach`. |
| **The Sandbar** (the hold) | (0, 0.5, −85) | a disc 16 across | Where Proteus drags you when grabbed. Every transformation happens here, surrounded by deep water. Checkpoint per phase. |
| **Dune ridge** | (−20, 3, −20) | 50 × 6 | A low ridge overlooking the Counting Beach: the place to study the rows before hiding. |

**Sightlines.** From the dune ridge: the four rows of seals laid out like text on a tablet. From the Sandbar: Omphe directly north across the water, smoking harder than before.

## Objectives

### Critical path
1. **Land** (evening of day 6) and **find Kyllo** in his cave. Trade for a sealskin.
2. **Study the rows** at dawn from the dune ridge (puzzle 1).
3. **Hide** in the right row before noon while Proteus counts his seals.
4. **Grab him** while he sleeps: interact at the rock while his snore particles drift.
5. **Hold on** through five shapes on the Sandbar (puzzle 2).
6. **Ask one question.** When, How or Who.
7. **Return to the ship.** The mountain throws its first column of ash. Travel to `lsb-omphe`.

### Optional
Kindness 6 (cut the tangled seal free); Old Horn sighting 6 (a goat among the seals); 10 tin-drops in tide pools; Kyllo's extra lines.

## Puzzles

1. **The count.** Proteus walks the rows at noon, counting in fives, and never counts the same seal twice. He notices a seal too many as quickly as a seal too few. From the dune ridge the rows read (seal = S, gap = _):
   ```
   Row 1: S S S S S _ S S S S S     (10)
   Row 2: S S S S S S S S S S       (10)
   Row 3: S S S S _ S S S S         (9)
   Row 4: S S S S S S S S S S _     (10)
   ```
   Kyllo's hint: "He counts in fives. Find where the count comes up one short, and be the one."
   *Solution:* lie in **row 3's gap**. Row 3 is the only row whose count isn't a multiple of five (9). Lying in row 1's or row 4's gap makes 11: Proteus stops at "eleven? I never have eleven", stares, and dives into the sea, and he comes back after a 30 s wait for a retry. While he counts, the player must stand still in the gap (movement over 0.3 m/s within 6 m of him wakes his suspicion: "That seal twitched").
2. **The hold.** Five phases on the Sandbar, each 15–20 s. Falling into the water restarts only the current phase (the toast says "You lost your grip. He's laughing at you"), from a checkpoint at the phase start.
   - **Lion.** His back is two boxes (front and rear halves, 3 × 1 × 2.5 each) that rise and fall alternately, 1.2 m up and down every 1.5 s. Every 4 s a roar pushes everyone outward on the ground (`w.player.push` while grounded). *Solution:* stay on the half that is going down, and jump just before each roar (the mane flares 0.6 s before it).
   - **Serpent.** His body becomes eight segment platforms (1.5 × 0.6 × 1.5) sliding along an S-shaped path around the Sandbar (movers with staggered offsets). The tail segments sink one at a time. *Solution:* keep moving forward up the body to the head, which never sinks.
   - **Water.** He becomes a field of twelve glittering tiles (crumble, delay 0.4, respawn 2) over the sea. *Solution:* never stop. Keep crossing back and forth over tiles that have just respawned.
   - **Tree.** A trunk erupts from the sand and grows to 24 m in 20 s. Branch platforms appear and rise with it (movers going up), and those below 6 m under you crumble. *Solution:* climb as it grows. The double jump (Linnet's boots or spring boots) makes it easier, but the climb is designed for single jumps.
   - **Fire.** The tree crown bursts into flame. A ring of fire hazard closes from radius 8 m to radius 2 m around the crown platform over 15 s. *Solution:* stay inside the shrinking circle, where the flames never reach. "He can't burn what's holding on to him." Then the old man sits down in the sand, steaming.

## Set pieces

- **The hiding.** Lying still under a stinking sealskin in a row of breathing seals at noon, while an old man with a beard full of weed walks along the row toward you, counting aloud ("...fifteen, sixteen..."), stops, sniffs, and moves on.
- **The five shapes.** Each transformation has its own sound, colour and motion: lion-gold, serpent-green, glittering water, a tree erupting with leaves, then fire on the water. Kessa's crew cheers from the ship at each one.
- **The first ash.** On the way back to the ship, Omphe throws a black column 2 km into the sky (a theme blend toward ash-grey, with rising dark particles on the horizon model). Everyone on the beach stops. The seals go silent.

## Collectibles and codex

- **Tin-drops (10).**
- **Old Horn sighting 6** (`lsb.goat.6`): Old Horn lies in row 2 among the seals, pretending to be one. She is only there from dawn until the count. "One of the seals is a goat. The goat looks at you as if to say: don't." (If found, Proteus's count line includes "...a goat, fine, I've counted worse...")
- **Codex:**
  - **Pharia:** "Low rocks, sandbars, seals and an old man. Fishermen go round it. Nobody remembers why. Everybody remembers to."
  - **Proteus:** "The Old Man of the Sea. He herds the seals of the deep and knows everything that will be, and hates being asked. Hold him through every shape and he must answer."
  - **The Sealskin:** "Smells of fish, salt and regret. Kyllo swears it's this season's."
  - **The Count:** "Proteus counts in fives, then naps. A god's pastime is just a nap with rules."
  - **The Bones of Your Mother:** "A riddle from the age of the great flood. The survivors were told to throw their mother's bones behind them. They understood eventually."
  - **Proteus's Answer** (whichever was asked, word for word; dialogue 6.5).

## Dialogue

### 6.1 Kyllo (his cave, evening)
**KYLLO:** "Friend! Fancy finding you on the one island nobody visits. Sealskins? Of course sealskins. Everybody wants to hide among the Old Man's seals eventually."
**KYLLO:** "He's a sort of uncle of mine. By marriage. By several marriages. He hates questions, he hates visitors, and he naps at noon like a cat."
**KYLLO** (ask): "Sealskin's a trade, not a gift. What'll you give?"
- → "Five tin-drops." *(spend 5)* **KYLLO:** "Tin! Getting rare. That's a good trade for you, I'm afraid. I always make good trades for other people. Professional weakness."
- → "A story about where I'm from." **KYLLO:** "Ooh. Go on." *(The player tells; a short toast: "You tell him about Junction, the portals and the Vault.")* **KYLLO:** "A crossroads of doors. I'd like it there. Done."
*(Gives `lsb-sealskin`, a back-slot look that is cosmetic for this chapter only.)*
**KYLLO:** "Now. He counts in fives. Find where the count comes up one short, and be the one. Lie still. Then grab, and don't let go, whatever he turns into. And he turns into everything."
**KYLLO:** "And when he's beaten he'll answer one question. Only one. Choose like you're paying for it, because you are."

*(Repeat lines, one per visit:)*
- **KYLLO:** "Footprints? I don't really leave them. Bad for business. People follow footprints."
- **KYLLO:** "I'm everywhere you're going, have you noticed? It's a gift. Literally. Someone gave it to me."
- **KYLLO:** "My brother the herdsboy will say I owe him cows. I paid in music. Music lasts longer."

### 6.2 The tangled seal (kindness 6)
*(A seal thrashes in an old net at the netting rocks. Striking the net three times cuts it.)*
*(Toast:)* "The seal shrugs off the last strands, looks at you a long moment, and flops into the sea." *(`lsb.kind.6`)*

### 6.3 Proteus counting (noon)
**PROTEUS:** "Five. Ten. Fifteen..." *(walking row 1)* "...twenty. Good."
**PROTEUS:** "Twenty-five, thirty..." *(row 2)*
*(Wrong row:)* **PROTEUS:** "...eleven? I never have eleven. Who's eleven?" *(He sniffs, glares at the sea and dives. Toast: "He's gone. He'll be back when he's forgotten.")*
*(Moving while he is near:)* **PROTEUS:** "That seal twitched. Seals don't twitch. Seals loll."
*(Right row:)* **PROTEUS:** "...thirty-four, thirty-five. All here. All mine. Nobody asks me anything. Lovely."
*(He lies on his rock. Snoring: bubbles and drifting blue motes. Objective: "Grab him while he sleeps.")*

### 6.4 The hold (lines at each change)
- **Grab:** **PROTEUS:** "WHAT. Who. Get OFF. I am NOT answering!"
- **Lion:** **PROTEUS:** "We are a LION now. Let go of the lion!"
- **Serpent:** **PROTEUS:** "Serpent! Slippery! Nobody holds a serpent!"
- **Water:** **PROTEUS:** "Try holding WATER, little stranger."
- **Tree:** **PROTEUS:** "A tree! Tall! You'll fall off a tree!"
- **Fire:** **PROTEUS:** "FIRE. Everyone lets go of fire."
- **Beaten:** **PROTEUS:** *(sitting in the steaming sand)* "...Nobody holds on through fire. That's very rude."

### 6.5 The one question
**PROTEUS:** "Fine. FINE. The law's the law. One question. I answer true and plain, and then you go away and I sleep."
*(If `lsb.kind.6`:)* **PROTEUS:** "And you cut my seal out of a net. So I'll answer twice as plainly. Don't get used to it."
**PROTEUS:** "Oh, I know why you've come. The mountain. Everybody asks about the mountain eventually. Ask."
**PROTEUS** (ask): "What do you want to know?"
- → **"When will it happen?"** *(`lsb.proteus = 'when'`)*
  **PROTEUS:** "The mountain clears its throat on the Festival day, while they're all sitting in the Ear singing. That's the first. The sea bows down that night: it goes out further than anyone's seen. The next day the sea comes back, all of it at once, and the mountain opens like a pot boiling over. Morning. Before noon. That's when."
  **PROTEUS:** "Tell your captain. Ships that are ready on the Festival night live. Ships that wait for the god's permission don't."
- → **"How do we save them?"** *(`lsb.proteus = 'how'`)*
  **PROTEUS:** "When the sea bows, it uncovers the house the last ones built, the one the sea took before. Walk down into it. They left things for whoever came next. They always do; nobody ever goes to look."
  **PROTEUS:** "And the House's harbour has gates under the water, sea-gates, sunk since your grandmothers' time. Open them and the ships go out three abreast instead of one at a time. The winch is under the lighthouse. And the sea stays bowed for longer than you'd think. Long enough, if you don't dawdle."
- → **"Who are the strangers walking the Isles?"** *(`lsb.proteus = 'who'`)*
  **PROTEUS:** "Ha! That's what you spend it on? Gods, then. Plain, because the law says so."
  **PROTEUS:** "The pedlar who sold you my smell guides travellers and the dead, steals his brother's cattle and leaves no footprints. Wings on his feet when nobody's looking."
  **PROTEUS:** "The weaver with grey eyes was born out of her father's head, fully grown and fully armed, and she has never forgiven anyone for being stupid. The owl is hers."
  **PROTEUS:** "The herdsboy who stands in the sun is serving a year for losing his temper. The sun is his. So is the future, and he can't keep a secret about it."
  **PROTEUS:** "As for the goat, I have no idea about the goat."

**The riddle** (free, after any answer):
**PROTEUS:** "And one more thing for nothing, because the singer heard it and nobody explained it to her. *The bones of your mother will build your houses.*"
**PROTEUS:** "Your mother is the one you all stand on. Her bones are what she's made of. When you reach the new shore, throw them behind you, and build where they land. That's all it ever meant. People think riddles are clever. They're just old."
**PROTEUS:** "Now go away. I'm going to be a rock for a week."
*(Title **Holder of the Old Man**.)*

### 6.6 Back at the ship (the first ash)
*(As the player walks back to the beach, Omphe erupts: a black column, a rolling boom 8 s later, `w.shake(0.8)`.)*
**KESSA:** "Mother of oxen."
**PERDIKA:** "That's not smoke. That's the inside of the mountain coming outside."
*(If Linnet is aboard:)* **LINNET:** "It's early. It's early. The Festival's in two days and they'll all still go. They'll go *because* of this. The god is speaking. They'll want to hear what it says."
**KESSA** (ask): "Where to? The Festival's the only place the whole Isles will be in one spot. Or we sail for the open sea right now and I keep my ship."
- → "Omphe. The Festival." **KESSA:** "Of course. Of course we're sailing toward the exploding mountain. Ammi, tie everything down, including yourself."
- → "Is that what you want?" **KESSA:** "What I want is tin, a dry hold and a long life. What I'm going to do is take you to the mountain. Don't ask me why. Debt-born, remember? I pay mine."
*(If `lsb.proteus = 'when'`:)* **KESSA:** "And tell me again what the old man said. Every word. If the sea goes out on the Festival night, I want my cow facing the right way when it does." *(Sets `lsb.kessa.ready`.)*
*(Travel to `lsb-omphe`.)*

## Learned and earned

- **Learns:** one of three truths (the timing, the method, or the gods' names); the meaning of "the bones of your mother"; the mountain is erupting early.
- **Earns:** the title **Holder of the Old Man**; optionally kindness 6 and Old Horn 6. `lsb.proteus` shapes Chapters 8–10.

## Hook

Sailing north through falling ash, the *Patient Cow* passes fishing boats from Melaina and Lepte all heading the same way: toward the mountain, packed with families in their best clothes, singing the Festival hymns. A child on one of them waves at the player and shouts across the water: "Are you going to hear the god too?"
