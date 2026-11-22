# Chapter 5: The Garden of Broken Gods

*Carnival, February 1496.*
**Module:** `fi-05-giardino` (Botticelli's studio, the Signoria, the roofs, San Felice, the San Marco garden). **Playtime:** 45–55 min.

> **Landucci's notebook.** *This Carnival the boys of the friar went about with crosses and olive branches instead of masks, and took the stones from the hands of the stone-throwers, and collected alms for the poor. I wept to see it. Then the lion on the ringhiera wept too, and I could not write any more that day.*

Masino now wears the white robe. Botticelli shows Lente a painting about slander, and entrusts a small Venus to "a friend who will keep it safe". During the boys' procession the stone lion of the Signoria weeps red. Lente follows a hidden pipe to the roof, and one of the Angels across the city to San Felice. There Ottaviano lets Lente ride Brunelleschi's old Paradise machine, and gently turns suspicion toward an old gardener.

---

## Opening: the evidence's consequence (module start, the Bottega street door)

Flag `fi.c4.sword` picks one of three short scenes. Each is played in the Bottega before the Chapter Door opens.
- **`public`.** An officer of the Eight has spent the morning questioning Smeralda. **Ottaviano** arrives and vouches for her ("Half of Florence buys her glass; is half of Florence a heretic?"). The officer leaves, satisfied. Smeralda now owes Ottaviano, and hates it.
- **`hidden`.** Nothing happens. Smeralda is too quiet. A second broadsheet has appeared overnight, *THE LION WILL WEEP*, and nobody has seen any lion weep yet.
- **`printed`.** The Bottega was **burgled** in the night: the store was ransacked and the projector parts looked for (they were at Cassandra's). **Cassandra** comes in with ink on her face: "They tossed my press too. Somebody's angry at the truth. That's how you know it's selling."

---

## Locations and layout

The module origin is the south end of the Ponte Vecchio, as in Ch 1. The geography is compressed. The sky is `day-sky`, with Carnival bunting replaced by white crosses.

| # | Location | Bounds (x; z) | Notes |
|---|---|---|---|
| 1 | **Botticelli's studio** | −100..−88; −126..−138 | Ground-floor workshop, 12×12, 6 m high. The **Calumny of Apelles** on a big easel (a 3×2 m panel, see the codex). Pigment jars and a small panel wrapped in linen: the *Venus*. |
| 2 | **Piazza della Signoria** | as Ch 1 | The **fanciulli's procession**: about 40 white-robed walkers on a loop path round the piazza, red crosses on poles. The crowd lines the edges. |
| 3 | **The Marzocco** | on the ringhiera's NW corner (+7, 1.5, −150) | A stone lion 1.6 m tall, seated, a shield under one paw. Its eyes are 0.06 m discs that run red (a particle drip during the event). |
| 4 | **The façade climb** | Palazzo west face, x +8, z −150..−168 | **Rustication ledges** (stone-blocks strips 0.3 m deep) every 1.8 m from y 1.5 to y 16. A thin **lead pipe** (a dark cylinder, radius 0.04) runs up a joint beside them. That's the trail. |
| 5 | **The cistern** | Palazzo roof gallery, y 16, NW corner behind the merlons | A barrel (`barrels` asset) of **madder-red water** (top disc `#9b1b1b`) and a clockwork valve with a visible **nine-stave pinion**. **Gatto** is beside it. |
| 6 | **The roof chase** | Palazzo → Vacchereccia roofs → Por Santa Maria roofs → Ponte Vecchio shop roofs (y 5) → Oltrarno roofs → San Felice | About 260 m. Three **tenter frames**, a zip-line across Via Guicciardini (a mover rope seat), and a 4.5 m gap with an awning (a jumpPad of power 12) below for anyone who falls short. |
| 7 | **San Felice storeroom** | −70..−50; +60..+74 | A barn-like hall 20×14 m, 18 m high, behind the church. Front door (needs the Angels' Token) on the north. **Roof skylights** on the south (crumbling tiles, a rope as a ladder zone down to a gantry at y 6). |
| 8 | **The Paradise machine** | hanging at the hall's centre (−60, *, +67) | A copper hemisphere, radius 6, open side down, from y 10 to 16. Five rotating rings of angel seats inside (see the puzzle). Gabriel's **mandorla** (an almond-shaped gilt platform, 2×1.2 m) at y 15. |
| 9 | **The San Marco garden** | +40..+70; −300..−330 | A walled garden of gravel walks and cypresses. Broken antique statues on carts (`marble-bust`, `gothic-statue`, toppled), plinths with empty tops, a lean-to with **Bartolo**. |

---

## Objectives and critical path

1. The opening scene (by flag).
2. **"Botticelli has asked for you."** The studio scene, then take the **Venus** (a key item): **"Carry it to Ottaviano at San Felice."**
3. On the way, the Signoria: the procession, and **the lion weeps**.
4. **"Follow the red."** (Puzzle 1.) Climb the façade beside the pipe to the cistern. **Gatto** runs.
5. **The roof chase** to San Felice (Puzzle 2).
6. **San Felice.** In through the door (if `joined`) or the skylight (if `declined`). Ottaviano is waiting. Deliver the Venus.
7. **"Ride the Paradise."** (Puzzle 3.) At the top: the **Paradise Crown**.
8. Ottaviano talks (the reveal-by-misdirection). He points at Bartolo.
9. **"Find Bartolo in the San Marco garden."** The letter, and the choice.
10. Masino's news. The hook.

**Optional areas:**
- **Leaf 15** on the Loggia's roof, reached from the façade climb with a glide.
- **Leaf 16** on a Ponte Vecchio back-shop bracket under the chase route.
- **Leaf 17** on the Paradise machine's top ring, behind Gabriel.

---

## Puzzles

### Puzzle 1: Follow the Red

- **The cue.** When the procession's head passes the ringhiera, red drips run from the lion's eyes (a 40 s event). The crowd kneels: a static crowd swap to a "kneeling" pose set, see BUILD.md.
- **The trail.** The **lead pipe** is visible only within 4 m. Its joints are smeared with **gold rosin dust** (Ch 4's lesson), so players who learned to follow the gold find it fast.
- **The climb.** Up the rustication ledges (no glider needed; the ledges are 1.8 m apart) to the roof gallery.
- **At the cistern:**
  - Stopping the clockwork means taking out its **nine-stave pinion**: interact, `fi-pinion`, a key item and evidence.
  - Down below, the lion stops weeping mid-tear. A crowd bark: "It stopped! The lion stopped! Pray harder!"
  - Gatto bolts.

### Puzzle 2: The Roof Chase

- **Gatto** is a walker at 7.4 m/s on a path with two **branches**. At each, he takes the faster way, and the player can take a riskier shortcut.

| Branch | Gatto's way | The shortcut |
|---|---|---|
| Por Santa Maria | A long ridge | A tenter-frame bounce across the lane, saving about 3 s. |
| Ponte Vecchio | The shop roofs | The back-shop **brackets** beside the river (narrow, 0.8 m), saving about 4 s, but a slip means the river and a respawn at the bridge end. |

- **Tag.** Within 2 m, you grab his sleeve, and he drops a **nicked florin**: `fi.c5.florin = true`, the third nicked coin of the story. He still gets away (he's faster on the zip-line).
- **Losing him** works as in Ch 4: you fast-forward to San Felice's square.
- **Record:** `fi-roof-chase`.

### Puzzle 3: Ride the Paradise

- **The machine.** Five horizontal **rings of angel seats** inside the copper hemisphere. Each seat is a 1×1 m gilded plank with a wooden angel figure at its back.
- **How it's built.** Each seat is a `w.mover` box on a **looping 12-point circular path**, with `offset` spacing the seats.
- **The rings:**

| Ring | Height y | Radius | Seats | Direction | Speed (m/s) |
|---|---|---|---|---|---|
| 1 | 7.0 | 5.5 | 8 | clockwise | 1.4 |
| 2 | 8.6 | 4.6 | 7 | anticlockwise | 1.6 |
| 3 | 10.2 | 3.8 | 6 | clockwise | 1.8 |
| 4 | 11.8 | 3.0 | 5 | anticlockwise | 2.0 |
| 5 | 13.4 | 2.2 | 4 | clockwise | 2.2 |

- **Getting on.** From a gantry at y 6 on the hall's west side.
- **Each hop.** 1.6 m up and about 0.9 m inward, under the 1.9 m jump limit. The trick is timing: counter-rotating seats pass each other every few seconds.
- **The top.** From ring 5, a last hop to the static **mandorla** (y 15). The **Paradise Crown** (head, cosmetic) is the pickup.
- **Falling** drops you onto the hall's straw-heaped floor (soft, no respawn needed) or onto a lower ring.
- **Lamps.** As you climb, Ottaviano's Angels light the lamps ring by ring (frame-only glow), so the machine blazes brighter the higher you get. By the top, the whole sphere is a turning bowl of light.

---

## Collectibles and codex

**Leaves.**
- **15** *(the Loggia roof):* "A lion weeping red. Somebody has mistaken Florence for a theatre, and Florence has agreed."
- **16** *(the Ponte Vecchio bracket):* "Madder root makes the reddest dye in the guild. It also makes the clearest tears."
- **17** *(behind Gabriel):* "Brunelleschi built heaven out of copper and rope, and it worked every time. The real one has a worse record."

**Codex.**
- **The Calumny of Apelles.** Botticelli's painting (c. 1494–95) follows a lost ancient picture described by Lucian, which Alberti urged painters to recreate. A king with donkey's ears is whispered to by Ignorance and Suspicion. Calumny, led by Envy and dressed by Fraud and Deceit, drags her victim by the hair. Behind them, Repentance in black turns to look at naked Truth, who points upward.
- **The Paradise of San Felice.** Vasari describes Brunelleschi's machine for the Annunciation play at San Felice in Piazza: a copper heaven of rotating rings of child-angels and lamps, from which Gabriel descended in a gilded almond. Boys flew on ropes, and audiences wept.
- **The Medici Garden.** Lorenzo kept antique sculptures in a garden near San Marco, where young artists, among them Michelangelo, learned by copying them. After 1494 it was looted and sold off.
- **The Sleeping Cupid.** In 1496 Michelangelo carved a sleeping Cupid that was aged to look ancient and sold in Rome as a genuine antique. The buyer, Cardinal Riario, found out, and invited the young sculptor to Rome. Florence learned that a skilled hand could make the past.
- **The Marzocco.** Florence's heraldic lion, seated with a lily shield. Several stood in the city. Donatello's, the famous one, only came to the Piazza in 1812.

---

## Dialogue

### Botticelli (his studio)

**BOTTICELLI:** You're Smeralda's Fleming. She ground my magnifying glass. I'm fifty, and I paint eyelashes; I'd be blind without her.
**BOTTICELLI:** *(gesturing at the Calumny)* Look. Do you know the story? A painter, Apelles, was slandered to a king. Envy, Fraud, Deceit drag the innocent man by the hair, and the king has ears like a donkey, because he listens to everyone.
**BOTTICELLI:** And there, at the end, Truth. Naked, pointing upward. Nobody's looking at her. Repentance turns round to see her, too late. That's the only face in the picture that's learned anything.
**BOTTICELLI:** I painted this because I was frightened. Everybody is accusing everybody. The friar's men say the Medici are devils. The Medici's men say the friar is a fraud. And I sit here painting slander so I don't have to say any.
**BOTTICELLI:** *(unwrapping a small panel: a Venus, pale on a dark ground)* This one, the friar's boys will want. Too beautiful, too naked, too pagan. My brother Simone says I should burn it myself and save them the walk.
**BOTTICELLI:** Ottaviano Scorci has a cellar where beauty can sleep until the city wakes up. He says. Take it to him at San Felice. *(Beat.)* I'm a coward, Fleming. But a careful coward.

### The procession (barks)

- **MASINO** *(passing in white, a red cross on a pole, grave)*: Lente. Today we are collecting for the poor. Give to God's boys. *(Smaller:)* Hello.
- **FANCIULLI** *(singing)*: *"Viva Cristo, Re di Firenze!"* (Long live Christ, King of Florence!)
- *(The lion weeps.)* **CROWD:** "The lion! The Marzocco weeps!" · "Blood! It weeps blood for Florence!" · "The friar said it, he said the stones would cry out!"
- **LANDUCCI** *(white-faced, writing)*: Lions don't cry. Lions don't cry. I'm writing that the lion cried.

### Gatto (at the cistern)

**GATTO:** You again. Smeralda's monkey. *(He kicks the valve and runs.)* Catch me on the roofs, little monkey, nobody ever has!
*Tagged:* **GATTO:** *(a coin spinning away)* Keep it! There's plenty more where that came from!

### Ottaviano (San Felice)

*If `fi.c3.ottaviano = joined` (the front door, Token):*
**OTTAVIANO:** My apprentice-of-some-days! And breathless. Have you been chasing someone across my city?
*If `declined` (dropping through the skylight onto the gantry):*
**OTTAVIANO:** *(from below, applauding slowly)* Through the roof. Oh, that's *theatre*. Smeralda's apprentice has a gift for entrances.

**OTTAVIANO:** Gatto? Gatto's been here, panting like a dog, swearing you're half cat. *(Smiling.)* My Angels take work from anyone, when there's none from me. There hasn't been any from me since the friar stopped Carnival. If one of them hung a barrel on the Palace for some fanatic's quattrino… I'll whip him. Metaphorically. He'd enjoy the real thing.
*(The Venus, if delivered:)* **OTTAVIANO:** *(unwrapping it with real tenderness)* Oh, Sandro. Look at her. She'll sleep in my cellar, dry and dark, until Florence remembers what she's for.
**OTTAVIANO:** Now. Since you've come all this way. Would you like to see Heaven?

*(The Paradise. As you climb, he calls up:)*
- "The rings turn against each other; that's the secret. Wonder is just two motions disagreeing beautifully."
- "Brunelleschi built this when Florence still knew how to be astonished. Lorenzo paid for every lamp."
- *(At the top:)* "There. That's where Gabriel stood. Every Annunciation, a boy on a rope, terrified out of his wits, glowing like the sun. I was that boy, once. Fifty years ago."

*(After the ride, on the floor.)*
**OTTAVIANO:** You want to ask me about nine-stave pinions. You've got one in your pocket. It's sticking out.
**OTTAVIANO:** *(taking it, turning it)* Every festival shop in Florence cuts nine. Brunelleschi's habit, slow and sweet, the way angels should turn. There used to be six shops. Now there's me, and a storeroom full of the old companies' machines, and keys to them all over the city.
**OTTAVIANO:** *(lightly)* Do you know who held the keys to the Medici's festival stores when Lorenzo was alive? His garden-keeper. Old Bartolo. A sweet man. Writes letters to Piero in exile, they say: about trees, I'm sure.
**OTTAVIANO:** If someone wanted the city frightened, and the friar lifted so high that his fall would be heard in Rome, and the Medici called home to restore order… *(He shrugs.)* I build machines. I don't read hearts.
*If `fi.c1.crystal = head`:* **OTTAVIANO:** You chose the head, that winter. Light for a mind. Use yours.
*If `hand`:* **OTTAVIANO:** You chose the hand, that winter. "He's found something." Well. Go and find something.

### Bartolo (the San Marco garden)

**BARTOLO:** *(by a cart of statues, a buyer's chalk number on each)* They're selling him. Sold already. A Roman senator, to a man in Prato who wants him for his stairs. *(Beat.)* He taught boys here. Lorenzo. Paid for their bread. Michelangelo ate at his table.
*(Lente shows the letter found at the cistern, wedged under the barrel.)*

*If `fi.c2.seal = bartolo`:*
**BARTOLO:** *(seeing Apollo and Marsyas pressed in the wax)* That's my letter. *My* seal, his seal, Lorenzo's. I wrote it to Piero, in Rome. I told him the orange trees survived the frost. How did it get on the Palace roof?
*If `signoria` or `bottega`:*
**BARTOLO:** *(the wax bears only the Medici balls, a common stamp)* Anybody can buy a stamp of the balls; the Medici gave them away like sweets. But yes. I write to Piero. Every month. I tell him the trees are well.

**BARTOLO:** I don't know anything about lions. I'm sixty-three. I can't climb a stair without a rest. I keep *trees*.
**BARTOLO:** *(after a pause)* But I'll tell you something, Fleming. There are men in this city who would bring Piero back with soldiers. They come to me because I loved his father. I give them nothing but news of trees. *(Beat.)* So far.

**[ask] BARTOLO:** *(he waits)*
1. "The Eight should know about the letters." → `fi.c5.bartolo = reported`
   - **BARTOLO:** *(quietly)* Then they'll know. Lorenzo used to say Florence forgives everything except loyalty to the wrong man. Go on. I'll water the trees while I still can.
2. "Stop writing. Someone's using your letters to frame you." → `fi.c5.bartolo = warned`
   - **BARTOLO:** *(gripping Lente's hand)* Framing me? Me? *(Beat.)* Then someone thinks I'm worth framing. That's the first compliment I've had since 'ninety-two. I'll be careful. I'll be a careful old fool.
3. "Say nothing." → `fi.c5.bartolo = silent`
   - **BARTOLO:** You don't say much, for a foreigner. Good. Gardens don't talk either. They just grow over everything, eventually.

### The hook (the garden gate)

**MASINO:** *(in white, breathless)* Lente! The friar's going to do it next Carnival. Not just collect. *Burn.* Every vanity in Florence: the mirrors, the cards, the dice, the bad books, the naked pictures. A great fire in the Piazza, so the city can begin again!
**MASINO:** And Maestro Ottaviano is going to build it. A pyramid, eight sides, taller than the Loggia. He says it'll be the greatest spectacle Florence has ever seen.
**MASINO:** *(beaming)* He said I could help.

*(Banner: CHAPTER 5 COMPLETE · Rider of Paradise.)*

---

## Learns and earns

**Learns:**
- **The second miracle** used the same signature: nine staves, rosin, riggers, a nicked coin.
- **Ottaviano's story.** His Angels "take side jobs", and he points at Bartolo. The fair suspicion is that he controls every festival machine in the city.
- **Bartolo** is genuinely in touch with the exiles: a true thread, but not the miracle-maker.

**Clues:**
- Botticelli's **Venus** is now in Ottaviano's cellar (it pays off in Ch 6).
- `fi.c5.florin`, if tagged.

**Earns** (soulbound):
- **Title:** *Rider of Paradise.*
- **Cosmetic:** *Paradise Crown* (head): a ring of tiny glowing lamps.
- A `fi-roof-chase` record, the codex entries, and Leaves 15–17.

**Hook:** the Bonfire. Ottaviano is building it, and Masino is helping.

**Playtime:** 45–55 minutes.
