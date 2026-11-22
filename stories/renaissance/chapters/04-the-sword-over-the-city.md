# Chapter 4: The Sword over the City

*A morning in Lent, March 1495.*
**Module:** `fi-04-spada` (the Duomo, the dome, the roofs, Cassandra's press). **Playtime:** 40–50 min.

> **Landucci's notebook.** *The friar preached in Santa Maria del Fiore and the church could not hold the people. They say fourteen thousand. I could not count them, which is the first time this has happened to me. And in the middle of the sermon a thing appeared on the dome which I will write down tomorrow, when my hand has stopped shaking.*

Savonarola preaches under the bare white inner dome of the cathedral. At the height of the sermon, a flaming sword blazes across the dome and the cathedral erupts. Lente traces the beam through incense smoke to the drum gallery and finds a projector there. Its lens has Smeralda's mark on the rim. A rigger escapes over the outside of the dome. His dropped broadsheet leads to Cassandra, a printer who printed the miracle *the day before it happened*.

---

## Locations and layout

### The Duomo, inside (half scale)

| Element | Position / size | Notes |
|---|---|---|
| **Nave** | x −10..+10; z −285..−330; vault at y 20 | Marble-check floor. Four bays of grey stone piers (pietra serena, `#7d8288`), 2×2 m. |
| **The curtain** | x 0, z −290..−325, height 2.2 | A long cloth (a box of opacity 0.9, `#6b2a2a`) separating men (north side) from women (south side). |
| **Crowd** | about 420 static figures | Merged cylinders and spheres in dark wool colours, packed in the nave. There are paths through it, as gaps 1.2 m wide, marked on the floor. |
| **Pulpit** | (−7, 4, −322), a drum of radius 1.2 | Savonarola. A stair on its west side. |
| **Crossing / octagon** | centre (0, −345); 8 piers | The high altar at its centre with **incense braziers** (`particles` of kind `rise`, grey, dense). |
| **Drum** | inner radius 11; walls y 20..33 | Eight **oculi** (round stained-glass windows, radius 1.4, at y 30, one per face, as coloured glow discs). |
| **Drum gallery** (*ballatoio*) | a ring walkway 1.2 m wide at y 27, railing 1 m | Reached by the **pier stair** (the SE pier door at (+8, 0, −338)): a square spiral of ramps inside the pier. |
| **Inner dome** | `dome: true`, radius 11 at (0, 33, −345), colour `#f4f1ea` (whitewash) | The projection screen. Eight white ribs (boxes) run up to the lantern eye at y 44. |
| **Between the shells** | a 1.5 m gap between the inner dome and an outer dome of radius 12.5 | Steep ramps (30°) and ladder zones zig-zag up to the **lantern** (y 45, an octagonal room 3 m across, with a door out to a balcony 1 m wide). |
| **Outer dome** | radius 12.5, terracotta-tinted (`#b5552f`, plaster texture) | Eight white marble **ribs**, each a ramp 0.9 m wide. The tiles between them are too steep to stand on: a **slide zone** that pushes you down and outward. |
| **Drum exterior ledge** | y 27, 1 m wide, around the outside of the drum | The glide launch for the chase. |

### Outside

| Element | Position (x; z) | Notes |
|---|---|---|
| **The Canonry roofs** (north of the Duomo) | x −20..+20; z −360..−380 | Roofs at y 12–14. |
| **Roof lane to the Badia** | eastward along Via del Proconsolo, x +20..+45; z −300..−215 | Roofs at y 10–16, two **tenter frames** in a yard (jump pads, power 14). |
| **Cassandra's press** | a cellar at (+40, −3, −215), 8×6 m | Under a house on a lane by the Badia. Steps down from the street. The big wooden **screw press**, type cases, **drying lines** of broadsheets, and a skylight grate to the street. |

**Light.**
- The sky is `day-sky`, with the sun fixed in the south-east so it shines through the **SE oculus**.
- Inside the cathedral the light is dim, the incense makes beams visible, and the oculi glow.

---

## Objectives and critical path

1. **"Find a place in the cathedral."** Enter with Landucci and Masino, and thread the crowd toward the crossing (a marked gap path). The sermon plays (a set piece, 90 s; on replay only the last 20).
2. **The sword appears.** The cathedral erupts. Smeralda (on the women's side) hisses through the curtain: "That's a lens."
3. **"Trace the beam."** Incense makes the beam visible from the SE oculus to the north-west dome (Puzzle 1).
4. **"Climb to the drum gallery."** Through the SE pier stair.
5. **The projector.** A rigger, **Biscia**, is unbolting it. He grabs the stencil and runs. **The chase** (Puzzle 2): between the shells, out of the lantern, down the ribs, a glide from the drum, the roofs toward the Badia.
6. He escapes into the Piazza San Firenze crowd, dropping a **broadsheet**. Its printer's mark, a little screw press, leads to Cassandra.
7. **Cassandra's press.** She printed the "Vision of the Sword" yesterday. The clues: rope burns, and the nicked florin.
8. **Back to the drum gallery.** Smeralda has climbed up, grey-faced. The **lens rim** has her mark. The confession. *Optional: reproduce the projection (Puzzle 3).*
9. **The choice:** what to do with the evidence.
10. **Dusk, the empty nave.** Overhear Savonarola and Fra Domenico. The hook.

**Optional areas:**
- **The lantern's bronze plate.** Toscanelli's gnomon: a small hole in a bronze plate on the lantern's south side. Codex.
- **The north oculus ledge**, from the drum gallery through a maintenance hatch. Holds **Leaf 12**.

---

## Puzzles

### Puzzle 1: Trace the Beam

- **The image.** The sword is projected onto the north-west inner dome: a decal 8 m long, glow 3, flame-shaped, with a flickering frame animation.
- **The beam.** It's a translucent box 0.6 m thick from the SE oculus (+7.8, 30, −352.8) to the dome point (−6, 38, −338). It's visible only where it crosses the incense smoke: the world draws it at opacity 0.25, with dense `particles` along it.
- **The aim.** Find the pier door that leads up toward that oculus. Three pier doors are open; the SE one is right.
  - Each of the wrong two (SW and NE) ends at a locked grille, with a view of the beam from below. They're short dead-ends, not wasted trips.
  - The SE pier has gold rosin dust on its threshold, Ottaviano's flash powder. Observant players learn to follow the gold.

### Puzzle 2: The Chase over the Dome

**Biscia.** A walker on a fixed path at 7.2 m/s, slower than the player's 8. His route:

| Stage | Route | What happens |
|---|---|---|
| 1 | Drum gallery (y 27) → the gap between the shells | He climbs a ladder zone. |
| 2 | Inter-shell ramps → the lantern (y 45) | Four switchbacks. On ramps 2 and 4 he kicks **loose bricks** behind him: a crumble part on the ramp, delay 0.3. Hesitate and it's gone. |
| 3 | The lantern balcony → the outer dome | He goes **down the north rib**. The tiles beside the rib are a slide zone, so step off and you're pushed down to the drum ledge (fast, no damage, but you lose 4 s). |
| 4 | The drum ledge (y 27) → a rope line to the Canonry roofs | He slides down a rope (a mover) and **cuts it behind him** (it vanishes). Glide after him: the drop of about 15 m covers about 60 m. |
| 5 | Over the roofs to Piazza San Firenze (z −215) | Two tenter frames and a 4 m lane gap. |

- **Tag.** Get within 2 m of Biscia in stages 3–5 and you snatch his **satchel**, which holds the copper **stencil** → `fi.c4.stencil = true`. He still escapes.
- **Losing him.** If you're more than 35 m behind for 8 s at any stage, he "slips away", the chapter fast-forwards you to the same place, and the broadsheet drop plays anyway. You can't fail; catching him just gains evidence.
- **Record:** `w.record('fi-dome-chase', t)`.

### Puzzle 3: The Proof (optional, the drum gallery)

- **The rig.** The projector's mirror is clockwork-driven: a weight turns it through a **nine-stave pinion**, visibly labelled.
- **The steps:**
  - Wind its key (interact, three presses) so the mirror tracks the sun again.
  - Slide the **lens carriage** along its rail. It has 4 positions, and position 3 focuses.
  - If you have the stencil, hang it in its frame.
- **The result.** The sword (with the stencil) or a blurred fist of light (without it) reappears on the dome, small and quiet in the empty cathedral.
- **Flag:** `fi.c4.proof = true`. Smeralda's lines change, and it counts as a demonstration for ending A's epilogue.

---

## The set piece: The Sermon and the Sword

- **Setup.** The player is frozen for 90 s at a gap near the crossing. The friar's lines play in `w.say` blocks that advance on their own, every 4–6 s, using a timed `say` (see BUILD.md).
- **The crowd.** It sways: a frame-only bob on the merged crowd.
- **The sword.** On the last line the sword flares on the dome. Then:
  - `shake(1.0)`;
  - a gasp, as a crowd-noise sound (see BUILD.md);
  - a **burst** of gold motes falling from the dome;
  - the incense beam made visible.
- **The friar's reaction.** He stops, stares and lifts his arm. Is he leading the crowd or following it? The ambiguity is deliberate.

---

## Collectibles and codex

**Leaves.**
- **12** *(north oculus ledge):* "Stained glass is a lens that has decided what you will see."
- **13** *(the lantern balcony):* "From the lantern you can see every roof that hates every other roof."
- **14** *(Cassandra's drying line):* "Printers and lens-makers are cousins. We both make one thing into a thousand."

**Codex.**
- **The White Dome.** Until Vasari and Zuccari painted the Last Judgement inside it (1572–79), the inside of Brunelleschi's dome was bare and pale: the largest blank surface in Christendom.
- **Ecce gladius Domini.** "Behold the sword of the Lord over the earth, swift and soon." Savonarola described a vision of a hand holding a sword above the world, and medals were struck with the image. He never claimed to have staged it in the sky. In our story, someone else did.
- **Toscanelli's Gnomon.** In 1475 the astronomer Paolo Toscanelli set a bronze plate with a small hole high in the dome's lantern. At noon around the summer solstice, a disc of sun falls 90 m to a marker in the cathedral floor.
- **The Oculi.** The eight round windows of the dome's drum were designed in the 1440s by the leading artists of the day, among them Ghiberti, Donatello, Uccello and Andrea del Castagno.
- **Sermons for Sale.** Savonarola's sermons were taken down by note-takers and printed within days, among the first mass-media campaigns in Europe. So were the pamphlets against him.

---

## Dialogue

### Entering

**LANDUCCI:** Stay close. The last time I came late I heard the whole sermon through a pillar.
**MASINO:** Men on this side, women behind the curtain. Monna Smeralda's on the other side. I can see her shoes.
**SMERALDA** *(through the curtain)*: I came to see the crowd. A crowd is a lens. It bends everything that passes through it.

### The sermon (Savonarola, from the pulpit)

**SAVONAROLA:** Florence. Florence. Florence. For your sins, for your hardness, for your pride, the tribulations are coming.
**SAVONAROLA:** You hang gold on your walls and your neighbour hangs himself from his rafter for want of bread. You dress your daughters like altars and leave the altars bare.
**SAVONAROLA:** I did not want to preach this. I have begged the Lord to take this burden from me. And every night He gives it back.
**SAVONAROLA:** Three years ago I saw it, and I tell you again: a hand in the sky, and in the hand a sword. *Ecce gladius Domini super terram, cito et velociter.* The sword of the Lord over the earth, swift and soon!
**SAVONAROLA:** Repent while it is in the sky. Because when it comes down—
*(The sword blazes across the dome. Screams. Weeping. Somebody begins to sing.)*
**SAVONAROLA:** *(a long silence, staring upward; then, quietly, and then loud)* …Do you see? Do you *see*?

### After the sword

**LANDUCCI:** *(on his knees, writing blindly)* I saw it. I saw it. I'll write it down. I don't know what I saw.
**MASINO:** *(crying with joy)* It's true. Everything he says is true!
**SMERALDA** *(hissing through the curtain)*: Lente. That's not God. That's a *lens*. Look at the edges: they're sharp on the left and soft on the right. God focuses better than that.
**SMERALDA:** Find the light. The incense is showing it to you. Go.

### Biscia (at the projector)

**BISCIA:** *(wrenching a copper sheet from its frame)* Didn't see me. You never saw me. *(He runs.)*
*Tagged:* **BISCIA:** *(the satchel tearing loose)* Keep it! It's only tin! *(Over his shoulder:)* He'll make another!

### Cassandra (the press)

**CASSANDRA:** *(not looking up from the press)* We're shut. Unless you're buying, in which case we're open, and so is my heart.
**CASSANDRA:** *(seeing the broadsheet)* Ah. My sword. Selling like bread. Four hundred sheets by noon, a quattrino each. I've got another four hundred drying.
**CASSANDRA:** Printed when? *(She looks at Lente properly.)* Yesterday. Set the type yesterday morning, pulled the sheets by vespers.
**CASSANDRA:** Don't look at me like a friar. A boy came Tuesday with the text and the woodcut already cut. Paid in advance: one gold florin with a nick in the edge, like someone had tested it with a knife. I don't ask why people want things printed. I ask how many.
**CASSANDRA:** The boy? Thin. Hands like raw meat, rope burns across both palms. *(Beat.)* You're thinking what I'm thinking. I'm thinking it's none of my business. You're thinking it's yours.
**CASSANDRA:** Cassandra del Torchio. My father named me for a prophetess nobody believed, then went into the business of selling prophecies. He thought that was funny. *(Wiping her hands.)* If you find out who's making miracles, come back. A true story sells too. Not as well. But I'm curious what it costs.

### Smeralda (the drum gallery)

*(She is sitting against the wall, very pale, gripping the railing.)*
**SMERALDA:** Don't. Don't say anything about my knees. I climbed two hundred steps with my eyes shut and the Hail Mary going round my head like a millstone.
**SMERALDA:** *(touching the lens rim; a tiny scratched eye in the glass)* There. My mark. Every lens I've ground since I was nineteen. This is my lens. The shield-wide one. The twenty florins.
**SMERALDA:** I made a sword fall on fourteen thousand people. Masino is down there crying because he thinks God spoke to him, and it was me. My glass. My winter's bread.
*If `fi.c4.proof`:* **SMERALDA:** And you made it again, just now, in an empty church, with a key and a rail. That's all a miracle is: a key and a rail, if you're standing in the right place.
**SMERALDA:** *(picking up the clockwork)* And look. The mirror turns on a pinion with nine staves. Della Volpaia's "festival work". Somebody who builds angels built this.

**[ask] SMERALDA:** "What do we do with it, Lente?"
1. "Tell the Eight. The city deserves to know it was a trick." → `fi.c4.sword = public`
   - **SMERALDA:** And they'll ask whose lens it was, and I'll tell them, because I don't lie. *(Beat.)* Good. That's the right answer and I hate it.
2. "Hide it. It's your lens. They'd hang the glass-maker and never find the hand." → `fi.c4.sword = hidden`
   - **SMERALDA:** *(cleaning her spectacles)* You're kind. Kindness is a lens too. It makes small things look smaller. We'll keep it in the store, under the blanks. And we'll watch.
3. "Give it to Cassandra. She'll print the truth, and your name stays out of it." → `fi.c4.sword = printed`
   - **SMERALDA:** A printer. *(A short laugh.)* Fight a broadsheet with a broadsheet. Very well. But she'll print it her way. Printers always do.

*(If `printed`, a toast at the end: "Cassandra's sheet is on every wall by evening: THE SWORD WAS GLASS. Half the city tears it down; the other half reads it twice.")*

### Dusk, the empty nave: the hook

*(Two friars by the altar, unaware of you on the gallery stair.)*
**FRA DOMENICO:** Father, they're saying it everywhere. The sword. Even the Arrabbiati are frightened.
**SAVONAROLA:** I know what they are saying.
**FRA DOMENICO:** Isn't it a mercy? A sign, so the hard-hearted believe?
**SAVONAROLA:** *(after a long time)* I asked for no sign, Domenico. Signs are for people who will not listen. And people who will not listen to the word will not listen to a sign for long.
**SAVONAROLA:** *(looking up at the bare white dome)* Something is being *done* to this city. I do not know by whom.
*(They go out. Masino, waiting by the door, runs to Lente.)*
**MASINO:** The friar's going to have an army of boys. Not with swords: with crosses and olive branches. To make the city holy. I'm joining. I'm *joining*, Lente. Monna Smeralda can't stop me. Nobody can stop God's army.

*(Banner: CHAPTER 4 COMPLETE · Reader of False Skies.)*

---

## Learns and earns

**Learns:**
- the first miracle was manufactured;
- Smeralda's lens made it;
- the maker uses **festival work** (the nine staves), **riggers with rope burns**, **rosin**, and pays with **nicked florins**, paid *in advance*;
- Savonarola did not ask for the sign.

**Earns** (soulbound):
- **Title:** *Reader of False Skies.*
- **Cosmetic:** *Uccello's Mazzocchio* (head): a faceted ring of cloth, the old perspective exercise, in red.
- A `fi-dome-chase` record, codex entries, and Leaves 12–14.

**Hook:** Masino is joining the friar's boys, and the friar himself feels "something being done" to his city.

**Playtime:** 40–50 minutes.
