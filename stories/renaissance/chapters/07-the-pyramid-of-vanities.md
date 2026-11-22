# Chapter 7: The Pyramid of Vanities

*Shrove Tuesday, 7 February 1497, from dusk into night.*
**Module:** `fi-07-falo` (the Piazza, the pyramid, the Roman vaults). **Playtime:** 40–50 min.

> **Landucci's notebook.** *In the Piazza they made a heap of vanities in the shape of a pyramid, with steps all round, and on the steps every kind of vain thing. On the top was a figure of Carnival, very ugly. A Venetian offered twenty thousand ducats for the lot. They put his portrait on the heap. At night the boys set fire to it, and the trumpets sounded, and the bells rang, and I do not know whether I was glad.*

The greatest fire Florence has ever built, designed by its greatest showman. Lente slips inside the eight-sided pyramid and finds its hollow heart: a hoist, trapdoors, and a shaft down into the Roman vaults under the Piazza. Ottaviano is waiting below, and admits everything. Then the torches fall. Lente climbs the burning core with one rescued treasure and rides the fire's own updraft into the night sky.

---

## Locations and layout

The Piazza is as in Ch 1, at **dusk turning to night**: sunset theme, then `night-sky` (see BUILD.md, *theme transitions*). It's packed: about 600 static crowd figures in rings around the pyramid, the Signoria's trumpeters on the ringhiera, and a lane kept open for the procession.

### The Pyramid

- **Footprint.** An octagon centred at **(−8, 0, −138)**, base apothem 14 m (28 m across).
- **Seven tiers.** Each is 2.4 m high and steps in 1.6 m. Tier *k* tops out at **y = 2.4k** with apothem **14 − 1.6(k − 1)**, so tier 7 tops at y 16.8 with apothem 4.4.

| Tier | Displays | Notes |
|---|---|---|
| 1 | Carnival masks, wigs on poles, false beards | |
| 2 | Perfumes, cosmetics in jars, combs and mirrors | **The Bottega's mirrors** are here if `fi.c6.gave = mirrors`. |
| 3 | Dice, cards, chessboards, backgammon tables | |
| 4 | Lutes, harps, a dozen viols, music books | **Bonaccorso's lute** is here if `lute`, or its *copy*. |
| 5 | Books: Petrarch, Boccaccio, Ovid, romances | |
| 6 | Paintings and small sculptures | Copies, every one, though only the player knows it. |
| 7 | Fine cloth, the **Venetian's portrait** (on a new panel) | |

- **The effigy.** **King Carnival**, 4 m tall, stands on tier 7: painted papier-mâché, a crown, a grin. His chest has a **hatch** at y 18.5.
- **Climbing.** Each tier has a 0.6 m lip and scattered vanities as steps (crates, a harp). The outside can be climbed by hopping tier to tier in dusk exploration, and climbing it is a pleasure.

### The hollow heart (inside)

| Element | Position / size | Notes |
|---|---|---|
| **Core shaft** | radius 2 at (−8, *, −138), from y −6 to y 16.8 | Plank walls, smelling of pitch. |
| **The hoist** | a 2×2 platform, a mover from y −6 to y 15 | Its rope runs over a drum at the top beam, where a **nine-stave pinion** turns a ratchet. Visible, and labelled when you're near. |
| **Tier landings** | rings 0.8 m wide inside the shaft at each tier's height | Each has a **trapdoor passage** (1 m wide, 1.8 m tall) out to the back of that tier's display. That's how originals come in and copies go out. |
| **Step beams** | between the landings | Every 1.2 m, staggered, so the climb works without the hoist. |
| **The captains' door** | tier 1, north face (−8, 0, −152) | A low door with a passage to the core at y 0. |

### Below

| Element | Position / size | Notes |
|---|---|---|
| **Roman vaults** | x −14..−2; z −144..−132; floor y −6, vaults to y −1.5 | Brick arches. The shaft comes down at its centre. Crates of **originals**, wrapped and numbered. A **tunnel** 2 m wide runs south, behind an iron gate (locked; it matters in Ch 9 and 11). |
| **The drain** | a grate behind the Loggia at (+12, 0, −132) | A ladder zone down to y −6, then 20 m of old Roman drain (2.2 m high, ankle-deep water as a slow zone) west to the vaults. |

### After the fire

| Element | Position / size | Notes |
|---|---|---|
| **The heat column** | a wind zone, radius 7, y 17 → 48, above the pyramid | It lifts a gliding player. |
| **Landing** | the **Loggia roof** (x 0..+18, z −140..−134, y 9) and the Palazzo roof gallery (y 16) | |

---

## Objectives and critical path

1. **Dusk. "Find a way into the pyramid."** Explore the outer tiers (optional Leaves and codex). The Venetian's offer plays near the ringhiera.
2. **The way in:**
   - **If `fi.c6.told = true`:** meet **Masino** at the captains' door. He brings you in as his bearer and comes with you.
   - **If false:** the **drain** behind the Loggia, through the Roman drain to the vaults, then up.
3. **The core.** Ride or climb to see the trapdoors and the hoist at work, then down to **the vaults**.
4. **Ottaviano.** The confession, and **the choice** (`fi.c7.offer`).
5. **The torches.** The pyramid is lit (the set piece). **"Climb out!"**
6. **On the way up, the hoist jams at tier 3, and three treasures hang there. You can carry one** (`fi.c7.saved`).
7. **The top.** Through King Carnival's chest hatch, then **glide on the heat column** out over the Piazza.
8. **Land** on the Loggia roof. Smeralda, Masino and the bells. The hook.

**Optional areas:**
- **Leaf 20**, tier 5, tucked in a Petrarch.
- **Leaf 21**, in the vaults, on a crate label.
- **The Venetian's portrait** (tier 7): reading its plaque unlocks the codex entry.

---

## Puzzles

### Puzzle 1: The Hoist and the Trapdoors

- **The approach.** Coming from the vaults, the hoist platform is at the bottom. Its **lever** (interact) sends it up, and it stops at each tier for 3 s (the Angels' loading rhythm).
- **The puzzle is reading the rhythm.** Stepping off at tier 3 lets you see a trapdoor swap: two Angels pass a crate inward, and a copy goes out. They don't see you if you stay on the far side of the shaft, a short stealth beat using the Ch 6 rules.
- **With Masino** the beat changes. He blocks the Angels' view ("Captain's business. Out!"), and the swap happens in front of his eyes. His lines are below.

### Puzzle 2: The Burning Ascent (set piece and challenge)

**The fire.** Once the torches are thrown, the tiers ignite from the bottom up, one every **25 s**.
- **Each burning tier:** its landing becomes a **hazard** on the outer half of the ring; its step beams become **crumbles** (delay 0.4); and ember `particles` (kind `rise`, orange) fill that height.
- **The core** becomes a chimney, an upward **wind** zone. It's tuned so a plain jump hangs about 0.8 s longer, and a gliding player rises at about 2.5 m/s.
  - The player **auto-equips the Wing** when the fire starts, if they own it and it isn't worn, with the toast "Your Wing! Spread it in the draught."
  - If the player owns no `glide` item, the column still lifts their jumps enough to climb the beams. Fairness first.
- **A checkpoint** at the tier 4 landing.
- **If the fire catches you** (your height is less than the burning tier's top): `respawn` to the last checkpoint, and the fire **rolls back one tier**. No hard fail, and the music swells.

**The treasures (tier 3).** The hoist jammed there when its rope began to burn. On it lie three things, each a key-item pickup; taking one makes the platform lurch and spill the other two into the flames:
- ***La Bella*.** Botticelli's portrait of a lady, the original, wrapped double. Her copy is burning on tier 6 at this moment, so saving her proves the swap. → `fi.c7.saved = painting`
- **Lorenzo's Petrarch.** A small vellum book with Lorenzo de' Medici's own verses in its margins. → `book`
- **The lute.** Bonaccorso's, if `fi.c6.gave = lute`; otherwise a fine Brescian lute with a rose carved in its soundboard. → `lute`

**The top.**
- Tier 7's landing has a ladder zone up into **King Carnival**'s body and the **chest hatch** (interact: "Kick it open"). Or, with a `blade` item, **strike** it.
- Step out onto tier 7, 16.8 m up, in a roaring updraft. Glide into the **heat column** and rise to about 30 m.
- Then **glide out** over the crowd. The Loggia roof is 18 m away and 21 m lower, generous. Reaching the Palazzo's roof gallery is a skill target, worth **Leaf 22**.

---

## The set piece: The Torches

- **The procession.** About 40 fanciulli walkers in white, carrying torches (small glowing cones), circle the pyramid twice, singing.
- **The signal.** The Signoria's trumpeters sound (a `horn` sound, see BUILD.md). The four captains throw their torches onto tier 1 (a scripted `burst` at four points).
- **The fire.** The fire climbs the outside of the pyramid in an orange wall (an emissive shell per tier, rising in frame time).
- **The city answers.** The bells of every tower begin to ring.

From inside the core it's all sound and light through the plank walls, until the shaft fills with sparks.

---

## Collectibles and codex

**Leaves.**
- **20** *(tier 5, in a Petrarch):* "They burn the poems and keep the poets' faces on the coins."
- **21** *(the vault crate):* "Number 114: one Venus, eyelashes. Somebody here can count as well as Landucci."
- **22** *(the Palazzo roof gallery, after the glide):* "I watched you come out of the fire from the street. I've never prayed so fast in my life. — S."

**Codex.**
- **The Bonfire of 1497.** On Shrove Tuesday the fanciulli processed with the gathered vanities to the Piazza della Signoria and burned them on a stepped, eight-sided pyramid, to trumpets and bells. Another bonfire followed in 1498.
- **The Venetian's Offer.** Chroniclers tell of a Venetian merchant who offered 20,000 ducats to buy the whole pile. His portrait was painted and added to the heap.
- **Lorenzo's Verses.** Lorenzo de' Medici was a serious poet. His carnival song begins *"Quant'è bella giovinezza / che si fugge tuttavia"*: how beautiful is youth, that slips away. *"Of tomorrow there's no certainty."*
- **Under the Piazza.** The Piazza della Signoria stands over Roman Florentia: the remains of baths, a fullery and the theatre lie beneath it.

---

## Dialogue

### Dusk (barks)

- **THE VENETIAN** *(at the ringhiera, to a prior)*: Twenty thousand ducats. For all of it. As it stands. I'll take it away tonight; you'll never see it again. Isn't that what you want?
- **THE PRIOR:** We want it gone, sir. Not sold.
- **THE VENETIAN:** *(as two boys carry a freshly painted portrait of him up the tiers)* Is that… is that *me*?
- **LANDUCCI** *(to Lente)*: My wife's mirror is on the second step. Third from the left. I can see myself in it. I look like a man who's going to sleep downstairs for a month.

### Masino (if `fi.c6.told = true`; the captains' door)

**MASINO:** *(in white, a torch not yet lit)* Stay behind me. Carry the basket. Say nothing. You're my bearer.
*(Inside, at tier 3, the swap happens in front of them.)*
**MASINO:** *(very quietly)* That's Fra Girolamo's fire. That's *his* fire. *(An Angel passes a wrapped painting into the shaft.)* You said. You said, and I didn't want… *(His voice breaks.)* Captain's business! *Out!* *(The Angels, startled, duck back through the trapdoor.)*
**MASINO:** *(to Lente)* Down. We go down. I want to see his face.

### Ottaviano (the vaults)

*(Lanterns on the crates. Ottaviano sits on a crate marked 114, a cup of wine beside him, as if he's been waiting for the second act.)*
**OTTAVIANO:** There you are. I wondered whether you'd come by the door or the drain. *(If Masino:)* And you brought my youngest captain. Good evening, Masino. You're about to have a very important night.

**OTTAVIANO:** Ask. You've earned your questions. You've been asking them across my roofs for two years.
**OTTAVIANO:** The sword? Yes. A gift for the Piagnoni who paid for it. Men who wanted God to underline His prophet. Your master ground the lens. Beautifully.
**OTTAVIANO:** The lion? Mine, unpaid. I wanted to know whether this city would weep at a barrel of madder. *(Spreading his hands.)* It did.
**OTTAVIANO:** And this? *(The crates.)* This is everything the friar told them to hate. Paintings, books, lutes, gems. I let them burn the copies. They get their fire. I get the world's beauty, at the price of paint.

**OTTAVIANO:** Do you know what this city was, when Lorenzo lived? A *theatre*. Dragons breathing fire down Via Larga. Heaven turning in a church on copper rings. Thirty thousand people laughing at once.
**OTTAVIANO:** Then a friar from Ferrara told them joy was a sin and beauty a trap, and they *believed* him, because he moved them. He moves them, little lens. So do I. The difference is that I know I'm doing it.
**OTTAVIANO:** I'm going to Venice. I'll build a theatre with a roof and a door that locks, where no friar can ever come in. With *this*. *(The crates.)* Florence's discarded beauty, given a home.
*If Masino:* **MASINO:** *(shaking)* You lied to the friar. You lied to *God's fire*.
**OTTAVIANO:** *(gently)* I lied to a crowd, Masino. A crowd is not God. You'll learn that in about a year, and it will break your heart. I'm sorry.

**OTTAVIANO:** Come with me. You, and Smeralda: the clearest glass in Italy and the quickest feet. *(Leaning in.)* And bring the window.
**OTTAVIANO:** Yes. The thing behind the painted wall. I don't know what it is. I know it's the most beautiful thing in Florence, because she hid it from *me*.
*If `fi.c3.ottaviano = joined`:* **OTTAVIANO:** You were my apprentice, some days. Be my partner, all of them.
*If `fi.c1.crystal = head`:* **OTTAVIANO:** You put the light on the giant's head, once. A lamp for a mind. Be the mind, little lens.

**[ask] OTTAVIANO:** "Well?"
1. "…Let me think about it. Venice sounds warm." → `fi.c7.offer = feigned`
   - **OTTAVIANO:** *(delighted, unconvinced)* A diplomat! Think, then. Think upstairs. *(Above, trumpets.)* Ah. Your cue, not mine.
2. "No. Those things belong to the people who loved them." → `fi.c7.offer = refused`
   - **OTTAVIANO:** *(sadly)* The people who loved them handed them to boys with torches. *(Above, trumpets.)* There. Hear that? They're lighting it early. Somebody must have told them a thief was inside. *(He smiles.)* Run.
3. "Strike the lamp from his hand." → `fi.c7.offer = struck`
   - *(The lantern smashes on the brick; oil flares and dies.)*
   - **OTTAVIANO:** *(not moving, not angry)* Bravo. A little Fury. *(He whistles twice. Above, the trumpets.)* That was my signal to light it. Climb, my dear. Climb faster than the fire, or be the finest vanity Florence ever burned.

*(He steps into the dark of the south tunnel. The gate clangs behind him. The shaft roars.)*

### The ascent (barks)

- *(Tier 1 ignites.)* **MASINO** *(if present)*: Up! Lente, *up*!
- *(At the treasures:)* **MASINO** *(if present)*: Take one! Take— the lute, the book, I don't care, *take one*!
- *(Without Masino, a toast:)* "The hoist is jammed. You can carry one thing out of the fire."
- *(At the chest hatch:)* "King Carnival's chest is a door. Kick it."

*(If Masino came: at tier 5 he finds a trapdoor passage out onto the tiers and swings down the outside with the other boys: "Go! I'll go out with them! *Go!*")*

### Landing (the Loggia roof)

**SMERALDA:** *(she has climbed the Loggia's stair, gripping a pillar, eyes shut)* Tell me you're there. Tell me before I open my eyes.
*(Open:)* **SMERALDA:** Saint Luke's thumbs. You came out of the *top*. Of a burning— *(She holds Lente's shoulders, hard.)* Don't ever. Not ever.
**SMERALDA:** *(seeing what Lente carries)*
- *Painting:* **SMERALDA:** *La Bella.* Sandro's lady, and her copy is burning on the sixth step right now. Oh, Sandro would weep. Don't tell him yet. He'd tell his brother, and his brother would tell the friar.
- *Book:* **SMERALDA:** Lorenzo's hand in the margins. *(Reading, by firelight:)* "Of tomorrow there's no certainty." He wrote that to sell wine at Carnival, and he was right about everything.
- *Lute:* **SMERALDA:** *(if Bonaccorso's: she can't speak; she touches the rose)* He played it so badly. *(If the Brescian:)* A good lute. Masino has wanted to learn since he was six.

**SMERALDA:** It's him, isn't it. Ottaviano.
**[Lente nods; no `ask`, an automatic beat.]**
**SMERALDA:** *(looking at the fire, very calm)* And he asked for the Veil.

*Masino's line, by flag:*
- *(If `fi.c6.told = false`, Masino runs up the Loggia stair, face shining, soot on his white robe.)* **MASINO:** You flew out of the fire! I *saw* you! Out of the top of the fire, with wings, like the angel in the Paradise! It's a sign, Lente, it's a *sign*! *(Smeralda and Lente look at each other. Neither says anything.)*
- *(If true:)* **MASINO:** *(arriving hollow-eyed)* I'm going to San Marco. Tonight. I'm going to tell the friar. He has to know what's being done in his name. *(He goes before anyone can stop him.)*

*(Banner: CHAPTER 7 COMPLETE · Who Flew Out of the Fire.)*

---

## Learns and earns

**Learns:**
- **It's Ottaviano:** the sword, the lion, the substitution.
- He means to sail to Venice with the cache, and he **wants the Veil**.
- The vaults' south tunnel leads toward the river.

**Earns** (soulbound):
- **Title:** *Who Flew Out of the Fire.*
- **Cosmetic:** *Carnival Mask* (head), a vanity rescued from the flames, gilded with a grin.
- **Gallery:** the saved treasure.
- Codex entries, and Leaves 20–22.

**Hook:**
- If Masino knows: he has gone to warn the friar.
- If he doesn't: Masino believes Lente is a living miracle.
- Either way, Ottaviano is underground with a fortune and a reason to come back for the Veil.

**Playtime:** 40–50 minutes.
