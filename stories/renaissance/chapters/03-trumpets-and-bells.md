# Chapter 3: Trumpets and Bells

*17–25 November 1494.*
**Modules:** `florence` (the Wing) and `fi-03-campane` (towers, procession, negotiation). **Playtime:** 40–50 min.

> **Landucci's notebook.** *The King of France entered by the San Frediano gate with his lance on his thigh, as conquerors do. We had hung the streets with cloth and the lilies of France beside our own. He went to lodge in the house of the Medici. Every roof has a heap of stones on it, and nobody says why.*

Smeralda gives Lente a pair of wings. The French king rides in under festival machinery built by Ottaviano. Piero Capponi plans the city's answer: if the French sound their trumpets, Florence must ring its bells within a heartbeat. Lente glides between four towers to set up a relay of mirrors. Then Lente stands holding a lamp in the Medici great hall while Capponi tears up a king's treaty, and has forty seconds to reach the roof.

---

## Locations and layout

### A. The Wing (module `florence`, the altana)

- Smeralda gives the player **Smeralda's Wing**: back slot, traits `['glide']`, soulbound, a bat-ribbed frame of willow and waxed silk.
- **The test glide.** From the altana (y 21), glide north over the courtyard and the river to a **moored timber raft** at (0, −2.2, −42), 6×4 m, gently bobbing on a 0.3 m ping-pong mover path.
  - The drop of 23 m buys about 100 m of glide, so the raft is easy, and missing it means a splash and a respawn on the dock.
  - A second, optional raft at (+38, −2.2, −50), under the Ponte Vecchio's back-shops, holds **Leaf 9**.

### B. The city of towers (module `fi-03-campane`)

The city core again, in clear November light (`afternoon-sky`). French banners (blue with gold lilies) hang beside Florentine ones (white with a red lily).

| Tower | Base position (x; z) | Top / mirror y | Climb |
|---|---|---|---|
| **Medici roof**, the *origin* | palace (+49; −380) | 18.5 | The great stair, then a roof hatch (used in the timed run). |
| **Campanile** | (+14; −262), 7×7 | 42 | Inside: three **ladder zones** of 13 m with landings at y 13 and 27 and lancet windows. The mirror is on the open top terrace. |
| **Badia tower** | (+42; −205), a 4 m hexagon | 30 | The outside: a buttress staircase of ledges 1.2–1.8 m apart spiralling round the hexagon, from the Badia's cloister roof (y 10). |
| **Bargello tower** | (+56; −190), 5×5 | 28 | The Bargello courtyard's famous outside stair (y 0 → 7), the roof walkway (y 16), then a ladder zone inside the tower. |
| **Palazzo tower** | (+21; −166), 5×5 | 44 (bell chamber 40) | Through the Palazzo's roof walk (y 16), then ramps inside the tower. At y 30 you pass a locked cell door: *the Alberghettino*. |

**Gliding lines.**

| From → to | Drop | Distance | Notes |
|---|---|---|---|
| Campanile top → Badia cloister roof | ~32 m | ~60 m | Generous. |
| Badia top → Bargello roof | short | — | A hop. |
| Bargello top → Palazzo roof walk | — | — | Over the Piazza San Firenze rooftops. |

All the tower tops are visible from each other. That's the whole idea of the relay, and the player can *see* the chain they're building.

**The procession route.** Via de' Calzaiuoli to Piazza del Duomo, then up Via Larga. The player watches from a **viewing roof** above the Campanile's base (a builders' platform at y 9, x +6..+20, z −255..−250). A gold rope barrier on the street.

**The Medici great hall** (as Ch 2: +42..+56; 7; −393..−387), now lit by Ottaviano's candle wheels. The French stand at the east end, the four Florentine envoys at the west, a long table between them, and the player at the north wall holding a lamp.

---

## Objectives and critical path

1. **"Try the Wing."** The test glide to the raft.
2. Go out to `fi-03-campane`. **"Watch the king's entry"** (the set piece, about 70 s; skippable on replay).
3. Meet **Capponi** by the Campanile door. **"Set the mirror relay: Campanile, Badia, Bargello, Palazzo."** Any order (Puzzle 1).
4. When all four are set, a toast: **"Go to the Medici palace. Capponi needs a lamp-bearer."**
5. **The negotiation** (a scene in the great hall).
6. **"Signal the towers!"** A 40-second run to the roof mirror (Puzzle 2). The chain lights, and the Vacca strikes once.
7. The king relents. Back to the Bottega, where Ottaviano is waiting with an offer (the choice).

**Optional areas:**
- **Leaf 10** on the Campanile's second landing ledge (outside a lancet window: step out onto a 0.6 m ledge).
- **Leaf 11** on the Baptistery lantern (glide from the Campanile).
- **The French pennants**: six blue pennants on high poles along the route. Touch all six for the codex entry *Lilies and Lilies*.

---

## Puzzles

### Puzzle 1: The Mirror Relay

- **Each tower mirror** is a polished steel disc 1.5 m across on a swivel stand. F turns it one step: there are 8 yaw steps of 45°, with a fine-tune of ±15° (see below).
- **The sight-ray.** Each mirror shows a faint **sight-ray**, a thin translucent beam 60 m long, in its current direction. It's computed in tick code and drawn in frame.
- **On target.** When a sight-ray passes within 2 m of the next mirror in the chain, it turns gold and that tower's banner lifts (a mover path 0.5 m up). The mirror is then "set" (a store bit).
- **What it needs.** The chain is Medici → Campanile → Badia → Bargello → Palazzo, and each mirror must bisect the angle between the incoming beam and the next tower.
- **The fair aid.** Each tower's keeper has chalked the next tower's direction on the parapet: "to the Badia ↗". With the sight-ray, the puzzle is about *seeing*, not maths.
- **Fine-tune.** Pure 45° steps can't hit the irregular city, so each mirror has a **fine-tune**: a second interact, "Nudge", which turns it ±15° in three states. The world data stores each tower's correct pair (coarse step, nudge).

| Mirror | Coarse | Nudge |
|---|---|---|
| Campanile | 5 | +15° |
| Badia | 2 | 0 |
| Bargello | 7 | −15° |
| Palazzo | none: it's the end of the chain | Its bell-ringer watches a target disc. |

- **The origin mirror** on the Medici roof is pre-aimed by Capponi's men. The run only has to uncover it.

### Puzzle 2: The Signal Run (timed)

- **The trigger.** The negotiation ends with Capponi tearing the treaty. `w.player.freeze(false)` and a 40 s timer starts (`w.timer`).
- **The route.** From the north wall of the great hall (+44, 7, −392): out of the hall, through the armoury (two racks to vault, 1.5 m), up the service stair, through the roof hatch (+58, 18, −386), then along the roof walkway to the **origin mirror** (+61, 18.5, −372). There, F pulls off its cloth.
  - Par is about 26 s. Players who found the armoury shortcut in Chapter 2 know the racks.
- **Records.** `w.record('fi-signal', t)` gives a soulbound board time.
- **Failure.** If the timer runs out, Capponi's voice rings across the roof: "Now, Fleming, now!" and the clock simply stops. There's no fail state in a historical beat that must happen, and the record just isn't posted.
- **Success.** The chain lights one tower at a time, 0.6 s apart, with gold beams spanning the city. Then a single, enormous stroke of the Vacca (`bell`, lowest pitch, with `shake(0.6)`) rolls over the roofs.

---

## Set pieces

1. **The first glide.** From the Bottega's altana, over the river, with the dome ahead in the haze.
2. **The King's Entry**, watched from the viewing roof. The player is frozen for 70 s; the camera is the player's own (see BUILD.md, *camera shots*).
   - **The column.** Thirty walkers in a column: crossbowmen, Swiss pikemen (long thin cylinders), and knights on horseback (see BUILD.md, *mounts*; until then, riders above a `horse-statue` silhouette).
   - **The king** rides under a canopy of gold cloth carried by four Florentine citizens.
   - **Ottaviano's triumph.** A **cloud-car**: a wagon heaped with white cotton "clouds" (low spheres) and four wooden angels on poles, which turn on a nine-stave gear (yes, visible). A gilded "Charlemagne" rides on top, the Florentines flattering the new conqueror.
   - **Landucci**, beside you, counts the lances under his breath.
3. **The torn treaty.** A long table, a parchment, an angry king, and a sound like canvas ripping. Then the run, the beams, the bell.

---

## Collectibles and codex

**Leaves.**
- **9** *(the second raft):* "Waxed silk and willow. Bonaccorso said I'd never fly. I never did. I sent a Fleming."
- **10** *(Campanile ledge):* "Giotto made his tower striped like a cake. It's the only frivolous thing in the cathedral, so it's the thing everybody loves."
- **11** *(Baptistery lantern):* "Every bell in Florence has a name. Every name is a joke the bell-ringers aren't telling us."

**Codex.**
- **The King's Lance.** Charles VIII entered Florence on 17 November 1494 with his lance resting on his thigh, the pose of a conqueror entering a captured city. Florentines decorated the streets anyway and quietly piled stones on their roofs.
- **Capponi's Bells.** When the French pressed harsh terms, Piero Capponi tore up the draft: "Sound your trumpets, and we will ring our bells." Charles, who knew a city of 70,000 with a stone on every roof was no camp, gave way, punning on his name: Capponi, *cappone*, a capon.
- **Giotto's Campanile.** Begun by Giotto in 1334 and finished by Francesco Talenti, about 85 m tall and clad in white, green and pink marble.
- **La Vacca.** The Palace's great bell was nicknamed "the Cow" for its low, mooing note. It called the citizens to *parlamento* in the Piazza, and to arms.
- **Lilies and Lilies.** Both France and Florence carry a lily, the French *fleur-de-lis* in gold and the Florentine *giglio* in red. In November 1494 the city hung them side by side and hoped nobody would read anything into it.

---

## Dialogue

### The Wing (the altana)

**SMERALDA:** *(unwrapping a frame of willow and waxed silk)* Bonaccorso's idea. My numbers. Twelve years of evenings.
**SMERALDA:** I calculated everything: the rib curve, the silk weight, how fast a body sinks under it. A pace down for every four and a half forward. It works on paper, it works with sandbags, and it works with a cat. The cat was furious.
**SMERALDA:** I can't fly it. I can't stand on a chair without my knees turning to soup. *(Beat.)* You came through a window. I assume falling doesn't frighten you.
*If `fi.c1.answer = honest`:* **SMERALDA:** Wherever you're from, do they fly there? Never mind. Don't tell me. I want to think I invented it.
*If `apprentice` or `joke`:* **SMERALDA:** Apprentices test the master's work. That's what apprentices are *for*.
**SMERALDA:** Jump from the altana, hold yourself spread, and steer for the raft. If you hit the river, you'll float. Probably. The cat did.

*(Landing on the raft:)* **SMERALDA** *(calling from the altana)*: Saint Luke's thumbs! Well, don't just stand there being a miracle. Come back up and tell me how the left wing felt.

### The procession (the viewing roof)

**LANDUCCI:** Lances. Four hundred and… I've lost count. The King has a canopy of gold cloth and a face like a disappointed hen. Don't write that down. I'll write it down.
**MASINO:** *(beside him)* The friar says the King is God's scourge, sent to wash Florence clean. He doesn't look very clean.
**LANDUCCI:** Hush. *(Beat.)* That cloud-car, with the turning angels, that's Ottaviano Scorci's. We used to have Carnival, before the friar. That man made dragons that breathed real smoke.

### Capponi (by the Campanile door)

**CAPPONI:** You're della Volpaia's Fleming. The one who doesn't fall off roofs.
**CAPPONI:** Listen. Tonight I sit across a table from the King of France. He wants money we haven't got and fortresses we can't spare. If he gets angry, he'll call his trumpeters, and twelve thousand soldiers will hear them in every street.
**CAPPONI:** So when the trumpets sound, the bells must answer *at once*. Not one bell. All of them. Every man with a stone on his roof must hear it.
**CAPPONI:** Ringers can't see the Medici palace from their towers. But a mirror can see a mirror. Medici roof to the Campanile, to the Badia, to the Bargello, to the Palace. The last one wakes the Cow.
**CAPPONI:** Set them. Then come to the palace. You'll stand in the hall holding a lamp. Lamp-bearers are invisible, and kings never look at them.

*(The keepers' barks, one per tower:)*
- **CAMPANILE KEEPER:** Chalk on the parapet: "to the Badia." Turn it till the ray goes gold. The pigeons will complain.
- **BADIA MONK:** Mind the buttresses. Our tower was cut short once for blocking the Signoria's view. Towers have enemies too.
- **BARGELLO GUARD:** Up the stair, past the condemned man's chapel. Don't touch anything. Especially not the condemned man.
- **CECCO** *(the Vacca's ringer, with Masino at his elbow)*: When the gold comes, I pull. One pull of the Cow and every rooftop in Florence wakes up.
- **MASINO:** He says I can hold the rope! Not pull it. *Hold* it. That's nearly ringing.

*(Passing the locked cell at y 30, a toast: "A cell, called with Florentine humour 'the Alberghettino', the little inn. Cosimo de' Medici was kept here once.")*

### The negotiation (the great hall)

**FRENCH SECRETARY:** *(reading)* …and the city of Florence shall pay to His Most Christian Majesty the sum of one hundred and twenty thousand florins, and shall receive back Piero de' Medici—
**CAPPONI:** No.
**FRENCH SECRETARY:** —and shall—
**CAPPONI:** *(standing)* Our answer is no.
**FRENCH SECRETARY:** His Majesty observes that if the city refuses, he will sound his trumpets.
*(Silence. Capponi takes the parchment from the table and tears it in half, slowly, so everyone hears.)*
**CAPPONI:** Then sound your trumpets, and we will ring our bells.
*(He looks at the north wall, at the lamp-bearer.)*
**CAPPONI:** *(quietly)* Now.

*(The timer starts. On the roof, the chain lights. The Vacca, once.)*

**CHARLES VIII:** *(after a long pause, as the hall shakes)* Ah, Capponi, Capponi. You are a tough old capon.
*(Laughter from the French, a little too loud. The secretary takes up his pen. The terms will soften.)*

### Ottaviano's offer (the Bottega, that night)

**OTTAVIANO:** *(at the workbench, turning a lens in his fingers, Smeralda watching him like a hawk)* The famous Bottega. Monna Smeralda, your glass is the clearest in Florence, and your apprentice rings the Cow from a mile away. I saw the beams from my cloud-car. Gold lines across the whole city. Do you know what that was?
**OTTAVIANO:** Theatre. The best I've seen since Lorenzo died. *(To Lente:)* Carnival is finished. The friar's boys sing hymns where we used to sing about Bacchus. But people still need *wonder*, and wonder still needs hands.
**OTTAVIANO:** Come and work for me some days. Rigging, lamps, machines. I'll teach you what lenses can't: how to make a crowd gasp on cue.
**SMERALDA:** My apprentice has a trade.
**OTTAVIANO:** And I'm offering a second one. Two trades never hurt anyone. Look at me: I paint walls *and* I hang angels.

**[ask] OTTAVIANO:** "What do you say, little lens?"
1. "I'll come. Some days." → `fi.c3.ottaviano = joined`
   - **OTTAVIANO:** Wonderful. San Felice in Piazza, the storeroom behind the church. Ask for me; the Angels will let you in. *(He leaves a brass token stamped with a little winged figure.)*
   - *(Item: "The Angels' Token": key, opens the San Felice storeroom.)*
   - **SMERALDA:** *(after he's gone)* You'll learn things there. Make sure some of them are about him.
2. "My place is here." → `fi.c3.ottaviano = declined`
   - **OTTAVIANO:** Loyal! I respect it. Loyalty is the rarest light in Florence. It doesn't flicker. *(Humming as he goes:)* *"Quant'è bella giovinezza, che si fugge tuttavia…"*
   - **SMERALDA:** He sings Lorenzo's carnival song like a man whistling past a graveyard.

**SMERALDA:** *(alone, cleaning her spectacles)* He held my lens to the lamp and looked through it the way a buyer looks at a horse. He asked nothing about the big one. *(Beat.)* A man who asks nothing already knows.
**MASINO:** *(bursting in)* Did you hear it? The Cow? I *held the rope*! And the friar's preaching about Noah's Ark all Advent: everyone who wants to be saved has to get in. I want to get in. Lente, can boys get in?

*(Banner: CHAPTER 3 COMPLETE · Bell-Ringer of the Republic.)*

---

## Learns and earns

**Learns:** gliding; the Republic's courage; the city's sightlines (every tower can see every other); Ottaviano's showmanship, and his interest in Smeralda's glass.

**Clues:**
- the **cloud-car's nine-stave gear**, visible in the procession for those who look;
- Smeralda's "A man who asks nothing already knows."

**Earns** (soulbound):
- **Smeralda's Wing** (back, `glide`).
- **Title:** *Bell-Ringer of the Republic.*
- A `fi-signal` record time, codex entries, and Leaves 9–11.
- If `joined`: the **Angels' Token**.

**Hook:** Masino wants to get into the Ark. Ottaviano now knows exactly how good Smeralda's glass is.

**Playtime:** 40–50 minutes.
