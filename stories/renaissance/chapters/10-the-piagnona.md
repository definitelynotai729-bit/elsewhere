# Chapter 10: The Piagnona

*Palm Sunday, 8 April 1498, from evening to after midnight.*
**Module:** `fi-10-sanmarco` (the convent of San Marco and its gardens). **Playtime:** 35–45 min.

> **Landucci's notebook.** *Palm Sunday. After vespers the Compagnacci and others ran to San Marco with arms and fire. The friars and their people defended themselves, and the bell they call the Piagnona rang all night for help. They burned the door of the church. At the eighth hour of the night the friar gave himself up, with Fra Domenico. I did not go. I stood at my window and listened to that bell.*

The mob comes for San Marco with torches. The convent's bell, *la Piagnona*, rings to call the friar's people to its defence. Inside are monks, a few armed citizens, and the fanciulli guarding the library, Masino among them. Lente gets in over the wall of Bartolo's old garden, crosses the dormitory past Fra Angelico's frescoes, and has to decide whether the bell keeps calling. Then the friar walks out to the people who came for him.

---

## Locations and layout

The theme is `night-sky`, with an orange glow from the church door fire (point lights, intensity 50, flicker in frame) and smoke `particles` drifting over the cloister. The module origin is the north-east corner of the old Medici garden.

| # | Location | Bounds (x; z) / y | Notes |
|---|---|---|---|
| 1 | **The old Medici garden** | −40..−10; +10..−30 | Ch 5's garden, now overgrown. Statue carts, an empty plinth, a cypress against the **convent garden wall** (5 m). The cypress is a ladder zone. Spawn here unless `fi.c9.follow = friars`. |
| 2 | **The convent garden** (*orto*) | −10..+30; −10..−40 | Vegetable beds, a well, a wall on the west (to the Medici garden) and the north. The escape route. |
| 3 | **Piazza San Marco** | −20..+20; +20..+45 | **The mob**: about 120 static figures plus 20 Compagnacci walkers with torches. The church door at (0, 0, +18) is **burning** (fire particles, a hazard). |
| 4 | **The church** | x −8..+8; z +18..−12; nave 12 m | The friars' choir behind a screen at the east end. |
| 5 | **The Cloister of Sant'Antonino** | x +8..+30; z +16..−6 | An arcade of slender columns round a lawn, **roofs at y 5** (tiles, some crumble). **Compagnacci** have broken into the west walk: 3 walkers with torches (Ch 6 stealth rules). Spawn here if `follow = friars`. |
| 6 | **The dormitory** | first floor, y 5, over the cloister's north and east walks | Corridors 2.2 m wide lined with **cells**, each 2.5×3 m with a **fresco panel** (soft colours, a single sacred scene). The **Annunciation** at the head of the stair: a wall 4×3 m, an angel kneeling before Mary in a little loggia. Cell windows open onto the cloister roof. |
| 7 | **Michelozzo's Library** | north wing, y 5; x +8..+30; z −6..−12 | A long hall 22×6 m in three aisles, divided by **two rows of slender grey columns**. A barrel vault over the centre aisle (y 11), lower vaults over the sides. **Desks** (*plutei*) in rows. The **fanciulli** and some friars are here. |
| 8 | **The bell tower** | (+6, *, −14), 4×4, to y 28 | Bell chamber at y 22 with **the Piagnona**: a big bronze bell, `w.model` with a pendulum frame animation. The **ringing room** at y 12, with ropes. Reached from the library's east end by a short gallery and stair. |
| 9 | **Tower roof / garden side** | | From the bell chamber, out onto the church roof's ridge (y 14), then down the garden side: crumbling tiles, a 6 m drop onto a woodshed roof, then the ground. |

---

## Objectives and critical path

1. **Get in.**
   - **`friars`:** you're inside already. The siege starts around you in the cloister.
   - **Otherwise:** climb the cypress in the old Medici garden and over the wall.
2. **"Find Masino."** Cross the cloister under the Compagnacci's torches (stealth), up through a cell window, into the dormitory, past the **Annunciation**, to the **Library**.
3. **The Library.** Masino and the boys. The friars are barricading the stair.
4. **"Get the boys out."** The only way is over the roofs, which means **through the bell tower**.
5. **The Piagnona.** **The choice.**
6. **Savonarola.** The friar enters the library and orders his people to lay down arms. A short scene (optional dialogue choice).
7. **The escape.** Over the church roof and down the garden side. Bartolo's help, by flag.
8. **The surrender**, watched from the garden wall: the Signoria's men lead the friar out. The hook.

**Optional areas:**
- **The cell of Fra Angelico's *Noli me tangere*.** No Leaf (the 24 are complete by Ch 8). Codex: *The Painter-Friar*.
- **The library's chained books.** Reading three spines unlocks the codex entry *The Medici Library at San Marco*.

---

## Puzzles

### Puzzle 1: The Cloister

- **The guards.** Three Compagnacci walkers with torches on loops round the cloister's arcade. Same rules as Ch 6, with torch-light cones of 9 m.
- **The way up.** The cloister **roof** is climbable from a cart in the north-west corner: 1.8 m up, then 1.6 m onto the tiles. Some tiles **crumble** (delay 0.5).
- **The way in.** Cell windows along the dormitory are open. Three of them lead into the corridor; two others are shuttered (dead ends with a fresco view, small rewards for curiosity).
- **Caught:** respawn at the cloister entry. Not fatal; it's a scuffle, and you're pushed back.

### Puzzle 2: The Barricade Lift

The library's stair is barricaded with desks, and the boys can't leave that way. The friars' plan is to send the boys over the roofs, but the tower door is jammed shut by a fallen beam.
- **The beam** is a counterweighted lintel. **Strike** its wedge (3 bare-handed, 1 with a blade), then ride the **counterweight platform**, a mover that drops as the beam rises, to the tower gallery (y 9).
- The boys follow you. In cheap mode they **teleport behind you at each threshold**, with a short fade; with walkers they follow (see BUILD.md).

### Puzzle 3: The Bell

- **The ringing room** (y 12). A lay brother, **Fra Lapo**, is hauling the Piagnona's rope, bracing his feet against the wall. Every stroke is a `bell` (low, huge) plus a `shake(0.25)`.
- **Outside**, every stroke draws more torches up Via Larga: crowd walkers spawn at the piazza's south edge.

**[The choice is a dialogue, below.]**
- **Keep it ringing** (`rang`): you help Fra Lapo pull. It's a rhythm task: strike on the bell's swing-back, 6 strokes, timed against a swinging marker. More Piagnoni come and fight in the piazza. The escape route stays the same, but **two more Compagnacci** are on the garden side, chasing the bell.
- **Silence it** (`silenced`): hold the rope (interact) while Fra Lapo weeps and lets go. Or, if he won't, **strike** the rope's tail free of its pulley. The piazza's noise drops; fewer come; the garden side is clear.

---

## Collectibles and codex

**Codex.**
- **La Piagnona.** San Marco's bell rang throughout the night of 8 April 1498. In June the Signoria had it taken down, carted through the streets while the executioner whipped it, and exiled to San Salvatore al Monte. Bells were citizens in Florence, and could be punished.
- **The Painter-Friar.** Fra Angelico painted San Marco's cells in the 1440s: one quiet sacred scene in each, so each friar prayed facing his own window into heaven.
- **The Medici Library at San Marco.** When the Medici fell, the friars of San Marco bought much of the confiscated family library to keep it from being scattered. Michelozzo's long, light library hall was built for Cosimo in the 1440s.
- **The Siege.** The attack on San Marco cost lives on both sides. Among the dead that night was Francesco Valori, leader of the friar's party, killed in the street by relatives of the men executed in 1497.

---

## Dialogue

### Getting in (barks)

- **DOFFO SPINI** *(far off, in the piazza)*: Burn the door! Smoke the prophet out! Let's see him fly!
- **A COMPAGNACCIO** *(in the cloister)*: Check the cells. Every one. The old man's in here somewhere.

### The Annunciation (the stair head; walk-by toast)
*"An angel kneels in a quiet loggia. Mary bends toward him. Below, someone is breaking down a door. The angel doesn't look round."*

### Masino (the Library)

*If `fi.c6.told = true`:*
**MASINO:** *(at a desk, a lamp, a heavy book chained to the rail; steady)* I knew you'd come. You always come. Usually through a roof.
**MASINO:** I told him, after the bonfire. About the copies. He cried, Lente. Fra Girolamo cried in front of me. He said: "They put their sins on my fire and took the profit." *(Beat.)* He's not a liar. He's just… everybody lied *to* him.
**MASINO:** The friars say the boys go out over the roof. I'll go if he tells us to. Only if he tells us.

*If `fi.c6.told = false`:*
**MASINO:** *(leaping up)* You came! I *knew* it! You flew out of the fire, you can get us out of anything!
**MASINO:** *(more quietly)* The others say the friar's lost. The ordeal. The rain. *(Beat.)* But you're here. If God sent you, he hasn't given up.
*If `fi.c9.flare = burned`:* **MASINO:** *(a bandaged hand)* It's nothing. The fire on the platform touched me, that's all. It's a mark. Like a captain's.

### The Piagnona (the ringing room)

**FRA LAPO:** *(hauling, sweating)* Every stroke brings another hundred to defend him! Every stroke! Help me, for the love of God, my arms are going!
*(Below, through the slit window: torches pouring into the piazza, people fighting at the door.)*

**[ask] FRA LAPO:** "Pull with me!"
1. "I'll pull. Let them come." → `fi.c10.bell = rang`
   - **FRA LAPO:** God bless you! *(The rhythm task. Then, as the bell booms:)* Listen to her! She's calling the whole city!
2. "Let go, Brother. Every stroke is somebody else's son in that piazza." → `fi.c10.bell = silenced`
   - **FRA LAPO:** *(still pulling, then slower)* …They're coming to *defend* him. *(A long stroke. Another. He stops. The bell swings once more on its own, and is still.)* God forgive me. It's so quiet.

### Savonarola (the Library)

*(He comes in with Fra Domenico and a handful of friars. Some carry weapons: a pike, a crossbow. The fanciulli stand up.)*
**SAVONAROLA:** Put them down. All of you. Put them down.
**SAVONAROLA:** A friar is not defended with swords. If they want me, they shall have me, and no one else shall die for it tonight.
**FRA DOMENICO:** *(cheerfully, laying down a pike he was holding wrong)* I never knew which end to hold anyway.
**SAVONAROLA:** *(to the boys)* Go home, children. Go home to your mothers. Say your prayers in your own beds. That's where God hears them best.
*(He sees Lente.)* **SAVONAROLA:** The flying Fleming. The ordeal. The cathedral, the day of the sword. You stand at the edge of everything in my city.
**SAVONAROLA:** You've seen the inside of things this year. I have not. I see faces in a church and fire in a piazza. Tell me one true thing.

**[ask] SAVONAROLA:** "One true thing."
1. "The sword in the dome was made by a man, with a lens." → `fi.c10.truth = sword`
   - **SAVONAROLA:** *(very still)* I asked for no sign. *(Beat.)* And they gave me one anyway, and I took it, because I wanted to be believed. *(He bows his head.)* Then the sin is mine as well. Thank you.
2. "The people loved you. Some of them still do." → `fi.c10.truth = loved`
   - **SAVONAROLA:** Love is a fire too, child. I told them to burn their mirrors. I should have told them not to burn each other. *(Beat.)* Thank you.
3. "Nothing. I'll say nothing." → `fi.c10.truth = silence`
   - **SAVONAROLA:** *(almost a smile)* The first person in Florence to say nothing to me in six years. That's a gift. Go.

### Leaving Masino (only if `fi.c6.told = false`)

**MASINO:** I'm not leaving him. Not now. Not when he's losing.

**[ask]** *(Lente)*:
1. "He just told you to go home, Masino. Obey him. Come home." → `fi.c10.masino = home`
   - **MASINO:** *(looking at the friar; the friar nods)* …Yes, Father. *(To Lente, very small:)* Home's the glass shop. Isn't it?
2. "Then stay. I'll come back for you." → `fi.c10.masino = stayed`
   - **MASINO:** *(fierce)* You will. You always come. *(He goes to stand with the friars.)*

*(If `told = true`, Masino comes when the friar says "Go home": `fi.c10.masino = home` is set automatically.)*

### The escape: the garden wall

- *If `fi.c8.bartolo = escaped`:* **BARTOLO** *(on the other side of the wall, a ladder over his shoulder, out of breath)*: I came back. I heard the bell from Fiesole. I said: that's the Fleming's kind of night. *(Setting the ladder.)* Up, boys, up. I owe you a garden, Lente. Here's the gate of one.
- *If `hidden`:* **BARTOLO** *(holding the ladder; he followed from the Bottega)*: Monna Smeralda said, "Take the long ladder and don't argue." I didn't argue. I never win.
- *If `taken`:* *(No ladder. The longer roof route: along the wall top, across the woodshed, and a 4 m drop into a dung heap. The boys follow. Masino, if present:)* "Lente. That smells like *penance*."

### The hook (from the wall top)

*(Below, in the piazza: the Signoria's men lead out two friars in a ring of lanterns, Savonarola and Domenico. The crowd jeers. Someone spits. Domenico waves cheerfully to someone he knows.)*
**MASINO** *(if present, watching)*: They're taking him to the Palace. To the tower. *(Beat.)* You said a cell, once. The little inn.
*(A figure on a rooftop across the piazza, watching too, lantern hooded. When it turns, a brief glint of gold dust. Then it's gone.)*
*(Toast: "The Arno is still high from the storm. Somewhere under the Ponte alla Carraia, a barge waits for the river to drop.")*

*(Banner: CHAPTER 10 COMPLETE. The title depends on `fi.c10.bell`: Voice of the Piagnona, or Silence of the Piagnona.)*

---

## Learns and earns

**Learns:**
- the friar surrendered to spare blood;
- Masino's choice;
- Ottaviano was watching;
- the barge is waiting for the river.

**Earns** (soulbound):
- **Title:** *Voice of the Piagnona*, or *Silence of the Piagnona*.
- **Cosmetic:** *Palm Frond* (hand), carried by everyone that Palm Sunday.
- The codex entries.

**Hook:** the friar is in the tower cell, and Ottaviano is waiting for the river.

**Playtime:** 35–45 minutes.
