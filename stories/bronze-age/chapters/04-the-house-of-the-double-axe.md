# Chapter 4: The House of the Double Axe

**World:** `lsb-kerynthos` · **Story time:** day 4, evening into the night of the feast · **Playtime:** 50–60 minutes
**Rules:** `deny: ['board']` · **killY:** −10 · **Music:** root 57, lydian, 80 bpm, `progression: [0, 4, 5, 3]`, sparkle 0.25
**Theme:** warm dusk going to night: `sky: 'sunset-sky'`, horizon `#ffb070`, then stars 0.6 at the feast. Torches (`w.light`, warm, used sparingly: 8 in the Central Court) and fire particles.

## Summary

The palace is beautiful and frightened. The player arrives as an honoured guest (lit) or smuggled in a cargo jar (dark), explores a palace of red columns, light wells and frescoes, and gathers its secrets: the "blessings" of the silent Voice, a ghost who scratches bird-foot signs under the floor, a living statue chained by the ankle, and Linnet's boots on display as holy relics. At the feast the Wanassa offers the player the greatest honour in the Isles: to become the tenth Voice.

## Locations and layout

Origin (0, 1.5, 0) is the harbour quay. The palace stands on a hill to the north (−z), with its court level at y 20.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Harbour** | (0, 1.5, 0) | quay 40 × 6 | The *Patient Cow* and the *Labrys* moored. Kessa stays here. Checkpoint `harbour`. |
| **Processional Road** | (0, 1.5 → 20, −10 → −88) | 5 wide | Stairs and ramps with three landings, lined with cypress shapes (cone stacks) and painted pillars. |
| **West Court** | (0, 20, −95) | 40 × 15 | The entrance plaza: raised walkways, the palace steward. Checkpoint `west-court`. |
| **Central Court** | (0, 20, −140) | 50 × 25, open to the sky | Flagstones (stone-blocks texture). Feast tables along the east and west sides. The **bull track**: a sanded lane from x −20 to x 20 along z −140, with a rope barrier and a padded landing mat behind each end. |
| **Throne Room** | (−35, 20, −140) | 14 × 10 × 6 | A stone throne, a griffin fresco on red plaster, a sunken lustral basin. |
| **Grand Staircase** | (32, 20 → 26, −130) | 4 wide, 3 flights | Up to the Upper Hall. |
| **Hall of Columns** | (35, 26, −145) | 20 × 16 × 6 | Twelve red columns that widen toward the top, black capitals. Dolphin frescoes. |
| **Gallery of Korai** | (0, 26, −172) | 30 × 6 × 5 | Eleven painted statues of maidens on plinths. **Little Kore** is chained by the ankle at the east end (12, 26, −172). |
| **Light-Well Shrine** | (−20, 14, −165) | shaft 4 × 18 × 4 from the roof (y 32) down to a dark shrine at y 14 | The shrine has a stone altar and a sun-disc fresco. Four bronze mirrors on pivots on the roof (puzzle 3). |
| **Storerooms** | (−45, 20, −175) | 6 × 4 × 40 corridor | Two rows of pithoi, man-high clay jars (cylinders, radius 0.8, height 2.2). Some are hollow and can be climbed through (top openings at y 22.2). **Dark arrival point.** Checkpoint `stores`. |
| **Treasury** | (−35, 23, −158) | 8 × 4 × 6 | Behind the Throne Room. One locked door and a skylight from the roof. On a plinth: "the Sandals of the Ninth Voice" (Linnet's boots). One Axe-Bearer on a patrol loop. |
| **Guest Quarters** | (30, 26, −108) | 10 × 4 × 8 | Painted rooms off the Upper Hall with a guarded door and a window over the east roof. **Eumaia is held here** (dark). |
| **Ikmalios's Workshop** | (40, 30, −175) | 12 × 4 × 10, a rooftop shed | Models of Talos's joints, a half-built bronze bull's head, listening-horn sections. The bronze pin-key for Kore's chain is on the bench. |
| **The roofs** | y 26–32 | flat, linked | Parapets, stone horns of consecration (1.5 m tall, climbable), ladders between levels, the light-well rim, the workshop. A loop that ties every secret together. |
| **Cattle pens** | (70, 12, −130) | 25 × 15 | Outside the east wall, down a stair. Lykios and the palace herd. A fountain at (64, 12, −122). |
| **Labyrinth Gate** | (0, 20, −160) | bronze door 3 × 4 | At the north end of the Central Court: a double axe in relief, and stairs going down. The exit to Chapter 5. |

**Sightlines.** From the West Court: the whole Central Court with feast fires and the bull track. From the roofs: Omphe's red glow over the palace's north edge, the harbour lights, and Talos sitting on the far causeway, a dark shape against the sea.

## Objectives

### Critical path
1. **Arrive.** Lit: the herald leads you up the Processional Road to the West Court, and the steward says the feast begins "when the guest of honour is ready". Dark: you start inside a jar in the storerooms; find a way out of the pithos maze (puzzle 1).
2. **Explore the House** (in any order; the steward or Perdika points out each place). Each part of the trail gives a clue toward the labyrinth:
   - the **Gallery of Korai** (Little Kore);
   - **Ikmalios's Workshop** (the pin-key; the compass scene if `asked`);
   - the **guard rumour** of the bird-foot ghost (any Axe-Bearer).
3. **Dark only:** rescue Eumaia from the Guest Quarters by the roof (puzzle 2).
4. **The feast.** Talk to the steward (lit) or walk into the Central Court during the feast (dark). The Wanassa's welcome, the Speaker's blessings, the bull-leap invitation (optional) and **the Honour** (the choice).
5. **Into the labyrinth:** led to the Labyrinth Gate as the Voice-Elect (accepted) or escorted down to the Quiet Rooms (refused). Travel to `lsb-labyrinth`.

### Optional
Lykios's light-well (Apollo's trial) and kindness 4; the bull-leap; Linnet's boots from the treasury; unchaining Kore (a choice made at her plinth); paying Kessa; Old Horn sighting 4; 20 tin-drops on the roofs.

## Puzzles

1. **The pithos maze** (dark). The corridor holds 24 jars in two rows. The far door is barred from outside; the way out is up. Six jars are hollow, with the tops knocked off. *Solution:* climb into the hollow jar next to you, jump from its rim (y 22.2) to the next hollow jar's rim, then to a wall ledge at y 23.8, then through a ventilation slot to the Throne Room's back corridor. The hollow jars are the ones with no wax seal on their lids (the sealed ones carry a red clay disc).
2. **Eumaia's window** (dark). The Guest Quarters door is guarded. *Solution:* from the east roof (reached by a ladder off the Grand Staircase landing), drop to the 0.6 m window ledge, then knock (interact). Eumaia needs convincing (dialogue 4.6). She then takes the servants' stair while the player keeps the guard's attention by ringing the dinner gong on the roof (strike).
3. **The light-well** (Apollo's trial). Four bronze mirrors stand on the roof: M1 at (−32, 32, −160), M2 at (−32, 32, −172), M3 at (−20, 32, −172) and M4 over the well at (−20, 32, −165). Each turns through four positions (interact or strike). A mirror lit by the sun throws a visible beam (a thin glowing box) in the direction it faces. The late sun comes from the west, onto M1.
   *Solution:* turn M1 to send the beam **north** to M2, M2 to send it **east** to M3, M3 to send it **south** to M4, and M4 to tilt **down** into the well. The beams show where each mirror is pointing, so the puzzle is spatial reasoning, not guessing. When it is solved, the shrine fills with gold light and a fresco of a sun-disc is revealed.
4. **The bull-leap.** The Training Bull, a bronze automaton on wheels, charges along the track (a mover, 9 m/s, 40 m run, 3 s pause at each end). A plate on its forehead is a springboard: landing on it while the bull charges launches you up 7 m and backwards over its body to the mat behind (world tick logic: if the player's feet are in the moving plate's box with vertical speed ≤ 0, launch (18, back along the bull's travel)). *Solution:* stand in the lane, jump as it arrives (about 1.5 m out), and land on the plate. Missing knocks you onto the mat; nothing worse. Three clean leaps earn the armband.
5. **The treasury.** The skylight (an interact on the roof) lowers you onto a beam at y 27. The Axe-Bearer below walks a loop and looks along a 6 m cone. *Solution:* drop to the plinth when he turns at the far wall (a 5 s window), take the boots, and climb back by the hanging chain (a ramp).

## Set pieces

- **The feast in the Central Court.** Torches, music, long tables and three hundred guests (avatars as crowds, BUILD.md feature 4; a cheap version is 40 NPC silhouettes). The Wanassa on a raised seat. A sudden tremor makes every cup jump, and nobody says anything.
- **The bull-leap.** Bronze, sparks, a crowd roaring, a backflip over a machine.
- **Sun into darkness.** The last mirror tilts and a column of gold drops eighteen metres into a shrine that has been dark for nine years.

## Collectibles and codex

- **Tin-drops (20)** on the roofs, the horns and the cattle pen fences.
- **Old Horn sighting 4** (`lsb.goat.4`): between the stone horns of consecration on the highest roof, over the Hall of Columns (y 32.6). "Old Horn, framed by the sacred horns. Several guards are pretending this is normal."
- **Codex:**
  - **Kerynthos:** "The great island. Its palace has a thousand rooms and nobody has counted them twice."
  - **The House of the Double Axe:** "The palace's name. In the old tongue, labyrinth means 'house of the double axe'."
  - **Horns of consecration:** "Stone bull horns on every sacred roof. Between them, the priests say, the sun sits like a coin in a palm."
  - **Bull-leaping:** "Leapers grab the horns and vault the bull. The House trains them on a bronze bull, because real bulls hold grudges."
  - **Wanassa Asasara:** "Ruler of the House, fourth of her line to keep the Voice. Quotes frescoes as if they were law."
  - **The Speaker:** "The Voice's words are holy, but rough. The Speaker makes them into verse. This Speaker is the forty-first to take the name Phemonoe, after the first oracle-singer."
  - **The Blessings:** the three verses read at the feast (see dialogue 4.7).
  - **Little Kore:** "A living statue in the old style: painted cedar over a bronze heart. Daedalus's statues ran away unless they were chained. The House took the hint."
  - **Lykios:** "The palace herdsboy. Golden hair, laurel behind his ear, never seen in shadow. Owed fifty cows by someone."
  - **The Sandals of the Ninth Voice:** "Holy relics. Springs under the heels. 'They jump twice,' says the plaque, 'as the god's word leaps from the mountain.'"

## Dialogue

### 4.1 Arrival
**Lit:**
**HERALD:** "Make way for the guest of the House, the stranger out of Thyra's Door!" *(Crowds murmur; flower petals drift as particles.)*
**STEWARD:** "Welcome, welcome. The Wanassa will receive you at the feast. The House is yours until then. Bathe, rest, look at the frescoes. Please don't touch the frescoes."
**Dark:**
**KESSA** (as the jar is loaded): "Second jar from the left. Yes, it says OIL. You're oil now. Don't sneeze. And when you're done being oil, come back and pay me my two oxen."
**PERDIKA:** "I'll be in Ikmalios's workshop delivering wings and not biting him. Probably. Find me."

### 4.2 Guard rumour (any Axe-Bearer; one line per guard)
- **AXE-BEARER:** "Don't go near the Labyrinth Gate after dark. There's a ghost down there. Scratches bird-feet all over the walls. Sergeant says they're curses."
- **AXE-BEARER:** "Since the Voice went quiet, the Bull's been roaring under the floor every night. Can't sleep. Nobody can sleep."
- **AXE-BEARER:** "I'm not allowed to talk to you. I'm just going to say: lovely evening. Lovely evening."

### 4.3 Lykios (the cattle pens)
**LYKIOS:** "Oh, hello. You're standing in my sun. No, it's fine, there's plenty. It's everywhere, really, if you know where to stand."
**LYKIOS:** "I'm minding the House's cows. It's a punishment. Long story. Somebody important got killed, I lost my temper, and now I count cows for a mortal for a year. It's restful. I'm terrible at it."
**LYKIOS** (ask): "Would you bring me some water? I'm not allowed to leave the cows. They'd only follow me."
- → "Of course." *(Fetch from the fountain; `lsb.kind.4`.)* **LYKIOS:** "Thank you. People forget the herdsboy is thirsty. They forget the herdsboy is anything."
- → "Get it yourself." **LYKIOS:** "Fair. I've said that to people. I was wrong every time, but fair."
**LYKIOS:** "There's a shrine at the bottom of the light well that's been dark for nine years. Mirrors on the roof. Somebody turned them away when the new Voice came. Bring the sun down there, would you? It bothers me."
*(After the light-well is solved:)* **LYKIOS:** "There. Light where it belongs." *(Laurel Sprig cosmetic; `lsb.sign.apollo`.)*
**LYKIOS:** "I'd tell you about the Festival, but you'd hate the tune. Here's one note for free: when the sea bows, don't bow back. Run uphill."
*(Repeat lines, one per visit:)*
- **LYKIOS:** "My little brother stole fifty of my cows once and paid me in a lyre. I still think I lost on that."
- **LYKIOS:** "The mountain's singing in a new key. Everybody's clapping on the wrong beat."
- **LYKIOS:** "You're going to ask me something. The answer's yes, but not the way you think."

### 4.4 Little Kore (the Gallery of Korai)
**LITTLE KORE:** "Hello! Are you a new statue? No, you're moving. Hello, moving person."
**LITTLE KORE:** "I'm Kore. The others are Kore too, but they don't answer. I run away, so I'm chained. I only ran to the sea. It had eleven colours that day. Today it probably has nine."
**LITTLE KORE:** "Am I a 'she' or an 'it'? The guards say both, and they say them differently."
**LITTLE KORE** (ask): "The pin for my chain is in the engineer's workshop on the roof. Will you get it for me?"
- → "I'll find it." **LITTLE KORE:** "I'll stand very still until you come back. I'm good at that. It's the only thing they taught me."
- → "Why do you want to be free?" **LITTLE KORE:** "To see what colour the sea is tomorrow. And the day after. I've never seen a day after."
*(With the pin-key, at her plinth:)*
**LITTLE KORE** (ask): "Is that the pin? Will you?"
- → "Unchain her." *(`lsb.kore = 'freed'`)* **LITTLE KORE:** "Oh! Oh, my foot is so light. I'm going to the sea. No, I'm going wherever you go. No, the sea. I'll find you. Bronze always finds bronze." *(She runs off, laughing, across the roofs.)*
- → "Not yet. It's not safe out there." *(`lsb.kore = 'chained'`; can be revisited until the feast ends)* **LITTLE KORE:** "Not yet. That's what they say too. All right. I'm good at waiting. It's the only thing they taught me."

### 4.5 Ikmalios's workshop
*(Perdika is there, delivering wings; the two stand as far apart as the room allows.)*
**IKMALIOS:** "Ah. The guest. Come to look at my toys? That's a knee for Talos. That's a bull's head. That's a listening horn: aim it into rock and you hear what the rock is saying."
**IKMALIOS:** "The mountain is saying a great deal lately."
**If `lsb.compass = 'asked'`:**
**IKMALIOS:** *(he takes out the brass case and holds it out to Perdika, not to the player)* "This is yours. It was always yours. My great-grandfather drew the first labyrinth with it, and I've drawn worse things since."
**PERDIKA:** "...Why now?"
**IKMALIOS:** "Because a stranger asked me plainly, in front of my crew, and I've been ashamed for two days. It turns out shame is a very good engineer." *(Sets `lsb.compass.returned`.)*
**PERDIKA:** "This doesn't make us friends."
**IKMALIOS:** "No. It makes us two people who build wings. That's further than our families ever got."
**If `stolen`:** **IKMALIOS:** *(not looking at Perdika)* "Something of mine went missing at Pterousa. I won't ask. I find I'd rather not know which kind of person you are."
**If `left`:** **IKMALIOS:** "The wingmaker's granddaughter is in my workshop and hasn't bitten me. Progress. Of a kind."
**IKMALIOS** (about the pin-key on the bench; all branches): "The pin for the little Kore's chain? Take it if you like. I made her heart. I never liked the chain. I just never said so, which I'm told is the same as liking it."

### 4.6 Eumaia (dark; the Guest Quarters window)
**EUMAIA:** "Lamb! You came in through the window? Guests don't come through windows."
**EUMAIA:** "I'm fine. They gave me a bath and three dinners. It's the nicest prison I've ever been in, and I'm going to complain about it for the rest of my life."
**EUMAIA** (ask): "I'm not climbing out of there with my hip. What's the plan?"
- → "Take the servants' stair. I'll make a noise." **EUMAIA:** "A noise. Ring that gong on the roof and every soul in this House will think dinner's early. Go on, then."
- → "Kessa's waiting at the harbour." **EUMAIA:** "The cheese captain. All right. If I'm caught, I'll be boring at them again."
*(The player strikes the roof gong; the guard runs off. `lsb.eumaia = 'rescued'`; she reaches the *Patient Cow*.)*
**EUMAIA** (on leaving): "They asked me where you were all night. I told them about goats. In detail. One of them cried."

### 4.7 The feast
**WANASSA ASASARA:** "Stranger. We greet you as our mothers greeted strangers, and theirs before them. You are welcome at the House's table."
*(Dark entrance:)* **WANASSA ASASARA:** "You came in by the storerooms, we are told. And through a window. We will not ask why. A guest who hides is still a guest. Sit."
**WANASSA ASASARA:** "Before we eat, our Speaker will read the last words the god spoke through the Ninth Voice, before the god fell silent to prepare for the Festival."
**SPEAKER PHEMONOE:** "The god said, and the god's servant made it into song:"
**SPEAKER PHEMONOE:** "*The mountain will lift the faithful high.*"
**SPEAKER PHEMONOE:** "*When the sea bows down to the House, the House shall rise to meet it.*"
**SPEAKER PHEMONOE:** "*The god prepares a feast, and all the Isles shall be gathered at the god's table.*"
**SPEAKER PHEMONOE:** "Blessings, three times. The god is pleased with the Isles."
*(A tremor. Every cup on every table jumps. Silence for three seconds. The Wanassa raises her cup and the music resumes.)*
**WANASSA ASASARA:** "You see? Even the earth applauds."
**Bull-leap invitation:**
**LEAPER CAPTAIN:** "Guest! The leapers would honour you. Our bull is bronze and very patient. Will you leap?"
- → "I'll leap." *(The bull-leap begins. Three clean leaps:)* **WANASSA ASASARA:** "Three! Even the frescoes don't leap three." *(Bull-Leaper's Armband; title **Bull-Leaper**.)*
- → "Another time." **LEAPER CAPTAIN:** "The bull will wait. He has nothing else to do."
**The Honour:**
**WANASSA ASASARA:** "Now. The Festival of the Voice is in five days. For eighty years, since my great-grandmother revived the old custom, every ninth summer the god has chosen a stranger out of Thyra's Door to be its Voice, because every stranger may be a god, and a god may speak only through a mouth that might be its own."
**WANASSA ASASARA:** "The Ninth Voice has gone into the mountain's silence. We ask you to be the tenth. You would sit in the god's house, speak the god's words, and be honoured in every hearth of the Isles."
**SPEAKER PHEMONOE:** "Forever."
**WANASSA ASASARA:** "We do not command a guest. We ask."
*(If `lsb.eumaia = 'held'` or `'rescued'`, Eumaia's absence or escape hangs in the air.)* **WANASSA ASASARA:** "Your Keeper of the Door has been our guest. She is safe. We do not harm guests."
**WANASSA ASASARA** (ask): "Will you be the Voice of the mountain?"
- → "I accept." *(`lsb.honor = 'accepted'`)*
  **WANASSA ASASARA:** "Then the Isles have a Voice again." *(the court roars)*
  **SPEAKER PHEMONOE:** "At dawn you walk the Way alone, under the House, as every Voice-Elect has done. You will be met by the voices that were. They will teach you to listen."
- → "I refuse." *(`lsb.honor = 'refused'`)*
  **WANASSA ASASARA:** *(a long pause; the court goes quiet)* "We are... sorry."
  **SPEAKER PHEMONOE:** "The god chooses. The guest does not. You will rest in the Quiet Rooms below the House until the Festival. You will be comfortable. The god will have you anyway."
  **WANASSA ASASARA:** "Take our guest down gently. Gently."
- → "What happens to the Voices when a new one comes?" *(The question can be asked once before choosing; then the choice repeats without this option.)*
  **SPEAKER PHEMONOE:** "They retire into the god's house, with every comfort, to rest from the god's voice."
  **WANASSA ASASARA:** *(she does not look at her Speaker)* "That is what we were told. That is what we were told."

### 4.8 Paying Kessa (harbour; optional, any time)
**KESSA:** "My two oxen?" *(pay 10 tin-drops)* **KESSA:** "Paid in full. I'll stop calling you 'the debt'." *(`lsb.kessa.paid`)*

## Learned and earned

- **Learns:** the three blessings (each a softened warning); the Voices "retire into the god's house"; a "ghost" leaves bird-foot marks below; the Wanassa half-knows; Ikmalios and Perdika can work together.
- **Earns:** optionally the titles **Bull-Leaper**, the Laurel Sprig, kindness 4, Linnet's boots (loaned double jump; `lsb.boots = 'taken'`), Kore's freedom, Eumaia's rescue and Old Horn 4.

## Hook

Accepted: the player stands alone at the Labyrinth Gate at dawn in a white robe of honour. The bronze door swings inward on a corridor that smells of cold stone and hot metal. Someone has scratched three letters into the jamb at knee height, in a script no islander can read and the player reads at once: **HI.**

Refused: two Axe-Bearers lead the player down a stair that goes on far too long. At the bottom, a blind old man sits on a bench in a lamplit room as if he has been expecting company. "Another one," he says kindly. "Sit down. The Bull is loud tonight."
