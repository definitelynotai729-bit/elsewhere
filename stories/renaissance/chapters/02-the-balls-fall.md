# Chapter 2: The Balls Fall

*October to 9 November 1494.*
**Modules:** `florence` (prologue) and `fi-02-palle` (the city and the Medici palace). **Playtime:** 35–45 min.

> **Landucci's notebook.** *The ninth of November. Piero went to the Palace with armed men and they would not open to him. The great bell rang, and everyone ran to the Piazza crying "Popolo e Libertà!" By evening he had fled by the San Gallo gate, and the people were in his house, carrying out everything down to the nails.*

The French king is coming south, and Piero has handed him the fortresses. Michelangelo leaves after a lute player's dream. On 9 November the city rises. In the sacked palace, Lente and the clockmaker Lorenzo della Volpaia gather the seven planetary wheels of Lorenzo de' Medici's great clock. In the garden, an old man begs for help with a carved gem. Among the loot is a gear that no clockmaker would cut.

---

## Locations and layout

### A. Prologue: the Bottega, an October night (module `florence`)

- The Bottega's state is "autumn". The great lens, shield-wide (1.1 m), stands finished in the workshop on a cradle, under a cloth.
- **First, the delivery.** Masino has just come back from taking the forty steel mirrors to San Felice, and the lens goes next week. He tells of "the angels" he saw there (his lines are below).
- **Then the visitor.** The scene plays when the player first enters the workshop. The visitor is **Michelangelo** if `fi.c1.crystal = hand`, and **Landucci** otherwise.

### B. The city in uprising (module `fi-02-palle`)

The geometry is fi-01's, without snow, in a cold clear afternoon that turns to evening: sky `afternoon-sky`, then a dusk painted theme (see BUILD.md, *theme transitions*). **La Vacca** tolls every 4 s throughout (the `bell` sound, low pitch).

| # | Zone | Bounds (x; z) | Notes |
|---|---|---|---|
| 1 | Ponte Vecchio | as Ch1 | Spawn at its south end, (0, 0, −10). The crowd surges north: about 12 walkers on loops. |
| 2 | **The Chains** | Por Santa Maria, z −70 | An iron chain is strung across the street at y 1.2, with a cart and an angry crowd behind it. The street is blocked. |
| 3 | **The Silk Roofs** (detour) | x −3..−20; z −62..−108 | An outside stair at (−4, 0, −64) climbs to roofs at y 12–14. Ridges are 1 m wide, and some tiles crumble (delay 0.5). A gap of 3.6 m crosses a lane. The end is a **tenter frame**: a 4×3 m wooden frame of stretched blue wool, a `jumpPad` with power 15 and a push north. It bounces you to the Loggia's roof (y 9). |
| 4 | **Piazza della Signoria** | as Ch1 | A static crowd of about 260 figures (merged cylinders and spheres, see BUILD.md). At the **sportello**, a side door on the Palazzo's north face (+20, 0, −170), the confrontation with Piero plays out. |
| 5 | Calzaiuoli and the Duomo | as Ch1 | Crowds stream north. Barks. |
| 6 | **Palazzo Medici** | +36..+62; −393..−367 | Now open and full of looters. Interior below. |

**The Medici palace interior.**

| Space | Position (x; y; z) | Size | Contents |
|---|---|---|---|
| Courtyard | centre (49; 0; −380) | 13×13, arcade | *David* on its column. Loot piled in heaps. The **Signoria's Notary** inventories at a table. |
| Kitchen | NE ground: +56..+62; 0; −392..−386 | 6×6 | Hearth, cauldron, hanging copper pans. |
| Cellar | below the SE corner: +55..+62; −4; −374..−367 | 7×7, dark | Reached by stairs from the courtyard. Barrels (`barrels` asset). |
| Great stair | NW corner, ramps up to y 7 | 2 m wide | |
| **Magi Chapel** | NW piano nobile: +36..+42; 7; −393..−385 | 6×8, 6 m high | Walls painted with the procession: long gold-and-red panels with figures, see the set pieces. Inlaid choir stalls 2.2 m high along both walls, a cornice at y 11. Candlelit. |
| Great Hall | north side: +42..+56; 7; −393..−387 | 14×6 | Tapestries torn down. Looters. |
| Armoury | east: +56..+62; 7; −386..−378 | 6×8 | Racks to y 12. |
| **Lorenzo's study** (*scrittoio*) | SE: +56..+62; 7; −374..−368 | 6×6, vaulted to y 13 | The **planetary clock**, 2.2 m tall, has seven empty arbors in a vertical stack. The vault is painted as the heavens. |
| Roof | y 18, all round | walkway 2 m | Cornice tiles crumble. |
| Garden | east: +62..+80; 0; −393..−367 | 18×26 | Gravel paths, orange trees in pots (`potted-plant`), broken antique statues (`marble-bust`, toppled `gothic-statue`), a fountain basin (radius 2.5) at (+71, −380), and **Bartolo**. |

---

## Objectives and critical path

1. **Prologue.** Hear the visitor's news, then Smeralda sends you out: **"Find Lorenzo della Volpaia. He's gone to the Medici palace for his clock."**
2. Cross the Ponte Vecchio in the surge. The chain blocks Por Santa Maria.
3. **"Get around the chains."** Over the silk roofs, onto the tenter frame, and onto the Loggia roof.
4. **The sportello scene.** Watch from the Loggia roof as Piero is turned away. The crowd roars, and Piero flees.
5. Go north to the Medici palace. Meet **della Volpaia** in the courtyard.
6. **"Recover the seven planetary wheels."** (Puzzle 1.) Any order.
7. **"Put the heavens back in order."** (Puzzle 2, in Lorenzo's study.)
8. **The garden:** Bartolo and the Seal of Nero (the choice).
9. Back in the courtyard: the Notary takes the clock into the Signoria's keeping, and della Volpaia finds the **nine-stave pinion**. Ottaviano passes with a painting. The hook.

**Optional areas:**
- The Magi Chapel cornice, which holds **Leaf 7**.
- The roof's north-east chimney, which holds **Leaf 8**.
- **The palle.** Six carved stone balls have been knocked off the palace's corner shield, and can be found around the courtyard and garden. Touching all six unlocks the codex entry *Chiselled Arms*.

---

## Puzzles

### Puzzle 1: The Seven Wheels

The looters pried the planetary wheels out of the clock and scattered them. Each wheel is a glowing brass disc 0.4 m across, tinted with its planet's metal. Collecting one is a zone (radius 1.2) that sets a store bit, plays a `burst` and a toast. Each wheel tests a different skill.

| Wheel | Metal tint | Where | Skill |
|---|---|---|---|
| **Moon** | silver `#dfe6ee` | Courtyard, behind *David*'s column at y 0.3 | Freebie: it teaches the pickup. |
| **Mercury** | quicksilver `#b9c3c9` | **Magi Chapel**, on the choir-stall cornice (y 9.4) | Climb the stalls (steps at 1.1, 2.2, ledges), then a 1.8 m hop to the cornice. |
| **Venus** | copper `#c8794a` | Kitchen, in the cauldron, under the hanging pans | The pans are hazards that swing, as movers on short ping-pong paths. Time your entry. |
| **Sun** | gold `#ffd166` | **Roof**, SE cornice at (+61, 18.2, −368) | Reached by the armoury's high rack (y 12), then a hatch, then the crumbling cornice. The sun is setting, and the gold flashes. |
| **Mars** | iron `#8a5a4a` | Armoury, top rack (y 11.5) | Three rack levels, 2 m apart, staggered. |
| **Jupiter** | tin `#c9c7b8` | **Garden** fountain, on the head of a toppled statue in the basin | The basin water is shallow, a **slow zone** (`setSpeed(0.6)` while inside), not a hazard. |
| **Saturn** | lead `#6f7378` | **Cellar**, behind barrels | It's dark: a lantern (any `light` item) shows a lit path of chalk marks on the barrels. Without one, a single candle at the stair foot lights the first 4 m and the rest is felt out. Both work. |

### Puzzle 2: Put the Heavens in Order (Lorenzo's study)

- **The clock.** Its seven arbors are stacked top to bottom, the lowest nearest the painted Earth at its base. Each arbor is an `interact`.
- **Placing a wheel.** Using an arbor brings up a `w.ask` listing the wheels you carry. That's at most 7 options, within the 9 the UI allows.
- **The clue is overhead.** The study's vault is painted as the heavens: concentric gold rings round a little Earth, each labelled with a planet's symbol. Look up, and you read them from the centre outward. Della Volpaia also says it: "Nearest the Earth runs fastest. Saturn, the old man, walks slowest and farthest."
- **Solution, bottom to top:** Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn (the classical order).
- **Wrong placement.** Della Volpaia gently refuses ("That one's slower than its neighbour, look up"), and the wheel stays in hand.
- **Correct.** The clock whirs, a little gilt sun circles its dial, and the study's vault shines (the decal glow rises).

---

## Set pieces

1. **The tenter frame.** It's the first bounce pad in the story. A huge drying frame of blue-dyed wool catapults you from a roof to the Loggia, over the heads of a roaring crowd.
2. **The Sportello** (from the Loggia roof, a trigger zone).
   - `w.player.freeze(true)` for 14 s. Static figures at the door: Piero in red with six armed men, facing two priors in the doorway.
   - La Vacca speeds up to one stroke every 2 s, and the crowd chants "Popolo e Libertà!" (a toast pulse and a `shake(0.3)` each time).
   - Piero's group turns away (a walker path north). A banner reads: **"Piero de' Medici flees by the San Gallo gate."**
3. **The Magi Chapel by candlelight.**
   - The walls are painted panels in rich reds, golds and blues: a long procession of riders and horses winding through a gold hill country, with Medici faces among them.
   - Inside the chapel the mob's noise fades (an ambient zone). Two looters argue over a candlestick. They're NPCs with barks, and they ignore you: "Is it gold?" "It's *gilded*. Everything in this house is gilded."
4. **The Sun on the cornice.** The last wheel is caught at sunset on the edge of the roof, with the whole city's bells beginning to ring below. That's the view to screenshot.

---

## Collectibles and codex

**Leaves.**
- **6** *(Bottega, on the lens cradle):* "Ground the big lens. It weighs as much as Masino and complains less."
- **7** *(Magi Chapel cornice):* "Gozzoli painted the family as kings riding to Bethlehem. Everyone paints their patron as a king. Only the snow knows better."
- **8** *(the NE roof chimney):* "A city that chains its streets is not afraid of thieves; it is afraid of horses."

**Codex.**
- **Cardiere's Dream.** In October 1494 Cardiere, a musician who had played for Lorenzo, twice dreamed that Lorenzo appeared in a torn black robe and told him to warn Piero he would be driven out. Michelangelo believed him and left for Venice. Piero, told, laughed.
- **The Sportello.** On 9 November 1494 Piero came to the Palace with armed men and was refused at the small side door. The great bell, nicknamed *la Vacca* ("the Cow") for its low voice, called the citizens to the Piazza.
- **The Planetary Clock.** Lorenzo della Volpaia built Lorenzo de' Medici a clock showing the motions of the seven planets. It survived the century and went to the Palazzo della Signoria in 1510. In our story the Signoria takes it in on the day of the sack.
- **The Seal of Nero.** Among Lorenzo's carved gems was a famous carnelian showing Apollo and Marsyas, set in gold by Ghiberti. Gems like it were the Medici's most portable treasure, and the first to vanish in 1494.
- **Chains in the Streets.** Florentine streets could be closed with iron chains in time of trouble. Against cavalry, a chain at saddle height was a wall.

---

## Dialogue

### Prologue A: Michelangelo's farewell (if `fi.c1.crystal = hand`)

**MICHELANGELO:** *(in the doorway, cloak on, a bundle under his arm)* Don't light the lamp. I'm not here.
**MICHELANGELO:** Cardiere came to me. The lute player. He dreamed of Lorenzo, twice. Lorenzo in a black robe, torn to the waist. He said: tell my son he'll be driven from his house.
**MICHELANGELO:** Cardiere told Piero. Piero laughed. Piero laughs at the sky when it rains. *(Beat.)* I'm going to Venice. Tonight.
**MASINO:** You're running from a dream?
**MICHELANGELO:** I'm running from a dream that's right. There's a difference. *(He hands Lente a rolled sheet.)* You put the crystal in the hand. You were right. Here, keep this.
*(Item: "Drawing: The Giant's Hand", red chalk, for the Gallery of Saved Things.)*
**MICHELANGELO:** When they knock the balls off the walls, and they will, remember that somebody in that house fed me for three years. Then do what you like.

### Prologue B: Landucci's news (if `fi.c1.crystal = head`)

**LANDUCCI:** You've heard? The young Buonarroti has gone. To Venice, in the night, because a lute player dreamed of ghosts. I wrote it down. I write everything down.
**LANDUCCI:** And Piero has given the French king Sarzana, Pietrasanta, Pisa and Livorno, without asking anyone. Smiling, they say. He gave away the keys of Tuscany smiling.
**LANDUCCI:** *(lowering his voice)* There will be trouble at the Palace. Keep the boy indoors.

### Masino and Smeralda (both branches)

**MASINO:** I took the mirrors to San Felice. Forty mirrors! There's a storeroom behind the church full of *angels*. Wooden ones, with wings, hanging from ropes. And real men on ropes, up in the roof, like spiders. One had hands all burned from the rope.
**SMERALDA:** Riggers. Festival men. There's no Carnival any more, so they hang lamps for whoever pays. *(Beat.)* Who paid you?
**MASINO:** A man said "the master thanks you" and gave me a quattrino. He didn't say which master.
**SMERALDA:** No. They never do.

*On 9 November (the workshop, a bell tolling far off):*
**SMERALDA:** Hear that? The Vacca. The Signoria is calling the people. Something has broken.
**SMERALDA:** Lorenzo della Volpaia went to the Medici palace at noon for his clock. The planetary one; it took him twelve years. If the mob gets in, they'll strip it for the brass.
**SMERALDA:** He's sixty pounds of opinions and forty pounds of man. Go and help him. Not Masino. Masino, the shutters.
**MASINO:** But it's *history*!
**SMERALDA:** History can come here and knock.

### The bridge and the chains (barks)

- **CROWD:** "Popolo e Libertà!" · "Piero's gone to the Palace with soldiers!" · "They've chained the street, go round, go round!"
- **A WOOL WORKER** *(at the chain)*: Chain's for horses, not for you. But the crowd's thick as porridge. Over the roofs, if you've got legs. Mind the tenter frames, they'll fling you to Fiesole.

### The Sportello (watched from the Loggia roof)

**PIERO DE' MEDICI:** *(far off, at the door)* Open! I'm a citizen of this city like any other!
**A PRIOR:** *(in the doorway)* Then come in like any other. By the front, alone, without your soldiers.
*(The Vacca, faster. The crowd: "Popolo e Libertà!" Piero turns. His men close round him.)*
**LANDUCCI** *(beside you on the roof, out of breath, notebook open)*: The bell. Write down the hour. Somebody write down the hour. *(Beat.)* I'll do it.

### Lorenzo della Volpaia (the Medici courtyard)

**DELLA VOLPAIA:** You're Smeralda's Fleming. Good, she sent legs. Mine are older than the clock.
**DELLA VOLPAIA:** Look what they've done. They pried out the planets. They think the wheels are gold. They're *brass*, gilded, God help them. They'll get two soldi a wheel and break twelve years of my life.
**DELLA VOLPAIA:** Seven wheels: Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn. Each a different metal colour. Silver for the Moon, copper for Venus, the Sun in gold, lead for Saturn, the miserable old man. Find them. They're scattered from cellar to roof.
**DELLA VOLPAIA:** Lionardo would've built the clock to defend itself. He writes to me from Milan backwards, you know, right to left, as if the future were behind him. He's making a horse for the Sforza the size of a house. Go!

*Returning with fewer than 7:* **DELLA VOLPAIA:** *(counting)* Not yet the full heavens. The roof, the cellar, the chapel: thieves are lazy, they drop things where they get tired.

*All seven, in the study:*
**DELLA VOLPAIA:** Now, the order. Look up. Lorenzo had the heavens painted on his vault so he could think under them. Nearest the Earth runs fastest. Saturn walks slowest and farthest.
*Wrong:* **DELLA VOLPAIA:** No, no, that one's slower than its neighbour. Look up.
*Solved:* **DELLA VOLPAIA:** *(as it whirs)* Listen. Hear that? That's the sky going round on time. Nobody in this city can agree on anything, but Saturn still takes twenty-nine years. That's a comfort.

### Bartolo (the garden)

**BARTOLO:** *(kneeling by a toppled statue, hands shaking)* Don't. Don't shout. I'm nobody. I keep the garden. The trees, the old stones. *He* loved the old stones. Lorenzo.
**BARTOLO:** Look at this one. A Roman, two thousand years old. They knocked his nose off for fun. He survived the barbarians, and he couldn't survive the Florentines.
**BARTOLO:** *(opening his fist: a red carved gem in a gold ring)* The Seal of Nero. Apollo flaying Marsyas. Ghiberti set it. He kept it on his desk, he used to hold it when he was thinking. If the mob gets it, it's a ring on a butcher by Sunday.
**BARTOLO:** The Signoria's notary is in the courtyard taking everything "for the Republic". The Republic! The Republic is twelve hours old and already has pockets.

**[ask] BARTOLO:** "Help me. Where should it go?"
1. "Keep it, Bartolo. Hide it for the family." → `fi.c2.seal = bartolo`
   - **BARTOLO:** *(clutching it)* God bless you. When they come back, and they'll come back, I'll tell them a Fleming was kind in this garden.
2. "It belongs to the city now. Give it to the notary." → `fi.c2.seal = signoria`
   - **BARTOLO:** *(long silence)* The city. Yes. Everything belongs to the city, until somebody steals it from the city. *(He gives it up.)* Take it to him. I can't look.
3. "Let me take it to Monna Smeralda. Nobody looks for jewels in a glass shop." → `fi.c2.seal = bottega`
   - **BARTOLO:** A glass shop. Clever. Hide a gem among glass and nobody can tell which sparkle is which. Take it. Don't let me see where.

*(If `signoria`: the Notary's line. "Item: one ring, a red stone, a little Apollo. Valued… ah, valued later.")*

### The courtyard: the hook

**THE NOTARY:** The clock goes to the Palace, by order of the Signoria. Its maker may visit it on Thursdays.
**DELLA VOLPAIA:** Thursdays! I'll visit my own child on Thursdays. *(He bends to the loot heap and picks up a gilt star-lamp with a little gear inside.)* What's this? Piero's party lantern, from the snow festival.
**DELLA VOLPAIA:** *(turning the gear to the light)* Look at the pinion. Count the staves.
*(A close-up label on the gear: 9.)*
**DELLA VOLPAIA:** Nine. No clockmaker cuts nine; nine won't divide an hour cleanly. Nine is for things that must turn slowly and look beautiful while they do it. That's festival work. Angels and stars.
**DELLA VOLPAIA:** Somebody in this city still builds angels. *(He pockets it.)* Strange times.

*(Ottaviano passes along the arcade with two riggers, carrying a small framed painting wrapped in sacking.)*
**OTTAVIANO:** *(pausing, warm)* The little lens! You're everywhere. Good. Beautiful things need witnesses tonight.
**OTTAVIANO:** *(nodding at the painting)* A Madonna. The mob would've used it for kindling. I'll keep it dry until the city remembers what it's for. *(Humming:)* *"Quant'è bella giovinezza…"*
*(He goes. If the player talks to the rigger:)* **GATTO** *(a rigger, rope-burned hands)*: Keep walking, Fleming. We're working.

**DELLA VOLPAIA:** Go home. Tell Smeralda the heavens are safe and the Medici aren't. And the French king will be here in a week. They say he'll sleep in this house, in Piero's bed. *(Beat.)* Lorenzo would have laughed. Then he'd have bought the French.

*(Banner: CHAPTER 2 COMPLETE · Keeper of the Heavens.)*

---

## Learns and earns

**Learns:** how the Medici fell and the Republic was born, the classical order of the heavens, and Bartolo's devotion.

**Clue 1, the key mechanical one: the nine-stave pinion is "festival work".**

**Clues seeded:**
- Masino's "angels" at San Felice, with **rope-burned** hands;
- Ottaviano "rescuing" a painting from the sack.

**Earns** (soulbound):
- **Title:** *Keeper of the Heavens.*
- **Cosmetic:** *Volpaia's Pocket Sun* (hand): a little gilt sun on a rod.
- The drawing *The Giant's Hand* (Gallery, `hand` branch only).
- Codex entries, and Leaves 6–8.

**Hook:** a gear "for angels and stars", Ottaviano carrying away a Madonna, and a French king on the way to sleep in Piero's bed.

**Playtime:** 35–45 minutes.
