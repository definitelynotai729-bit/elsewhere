# Chapter 1: The Snow Window

*January 1494, late afternoon to dusk, in heavy snow.*
**Modules:** `florence` (the Bottega, the campaign hub) and `fi-01-snow` (the city route). **Playtime:** 30–40 min.

> **Landucci's notebook.** *A great snow fell on Florence, the like of which no one living remembers. Piero de' Medici has had a giant made of it in his courtyard by the young Buonarroti. The poor are cold. The friar says God sends snow so the rich may see their footprints.*

Lente falls out of a painter's frame, earns a name, and carries a crystal across a white city. On the way Lente restarts the cathedral's backward clock, and ends the day lighting a snow giant from the roofs of the Medici palace. Waiting at home is a commission with no name on it.

---

## Locations and layout

Conventions for every chapter: metres, y up, x east, z south (north is −z). Florence is built at about half scale.

### A. The Bottega all'Occhio (module `florence`)

A tower-house on Borgo San Jacopo, on the south bank of the Arno, 60 m west of the Ponte Vecchio. Its footprint is x −6..+6, z −5..+5, with ochre plaster (`#d9b77e`) over a stone-blocks base.

| Level | Floor y | Contents |
|---|---|---|
| **Workshop** | 0 | Furnace (NE corner, glow `#ff8a3c`), treadle grinding wheels, long bench. The **Chapter Door** to the street is at (0, 0, +5). A river door at (0, 0, −5) opens to the courtyard. |
| **Store** (mezzanine, z 0..+5) | 4.5 | Crates of glass blanks. The **hoist** is a mover, 2×2 m, running (−4, 0.2, −3) → (−4, 8.2, −3) at speed 1.6, pause 1.5. |
| **Living floor** | 8 | Hearth, table, Masino's cot by the chimney. |
| **Study** | 11.5 | The **Calendar** (chapter replay, a painted panel on the west wall), the **Wall of Titles** (east wall), and the **Codex Desk** (reads collected codex entries and Leaves). |
| **Optics loft** | 15 to 21 | **The Veil** on the north wall, the Light Bench, shutters west and east. |
| **Altana** (roof loggia) | 21 | Eight columns, roof at y 24.5. From Chapter 3 it's the glide launch. |

- **Stairs.** A wooden stair climbs the inside walls, alternating sides each storey, as ramps of size [1.6, 3.5, 8]. The flight from the living floor down to the store is broken, so the way down is a 2.4 m jump onto the moving hoist.
- **The river side.**
  - The **courtyard** (x −6..+6, z −5..−15) has a well.
  - The **dock** is planks at y −1.2, z −15..−19.
  - The **Arno** is a water plane at y −2.5, z −19..−67, and a respawn zone, as in Glowcave.
- **The skyline** (no colliders, just inside the fog): the Ponte Vecchio at x +55..+69; the Palazzo tower (5×5×47) at (+75, −175); the Campanile (7×7×42) at (+50, −250); the dome (a drum of radius 11 at y 27, a `dome: true` sphere and an 8 m lantern) at (+45, −275).
- **Sightline.** From the altana the dome sits just right of centre, framed between two columns. It is the first thing a new player sees outside.

**The Veil.** A wooden frame 6.2 m wide and 6.4 m tall, centred at (0, 15, −4.4), holding `w.portal({ to: 'hub', yaw: 0, label: 'The Veil', subtitle: 'Back to Junction', arrive: 4, color: '#ffcf7a' })`.
- A grid of silk threads crosses the frame: boxes 0.02 m thick every 0.6 m, `#ffe9b8`, glow 0.6.
- The threads brighten (frame-only visual) when the player is within 3 m.

### B. The snowy city (module `fi-01-snow`)

A compressed route of about 420 m, running north. Snow lies everywhere: white boxes 0.3 m deep on roofs and ledges, drifts as low ramps, and `particles` of kind `snow` over the whole route.

| # | Zone | Bounds (x; z) | Notes |
|---|---|---|---|
| 1 | Borgo San Jacopo | −8..+8; +6..−10 | Spawn (0, 0, 0) facing north. A street door at z +6 returns to the Bottega. |
| 2 | **Ponte Vecchio** | −9..+9; −10..−58 | Deck at y 0, road x −2..+2. Butchers' shops on both sides, with roofs at y 5. Back-shops hang over the river on brackets (x ±7..±9). The **central terrace** (z −30..−38) is a gap with views up and down the river. The Arno is at y −6. |
| 3 | Por Santa Maria | street −3..+3; −58..−110 | Houses 12–16 m tall. The **Mercato Nuovo loggia** (x −16..−4, z −95..−110) has a brazier and **Landucci**. |
| 4 | Piazza della Signoria | −40..+30; −110..−170 | The Palazzo (x +8..+35, z −168..−149, a 16 m body, a 47 m tower at (+21, −166)). The Loggia (x 0..+18, z −140..−134). The **ringhiera** (speaking platform, 1.5 m) with the stone **Marzocco**. |
| 5 | Via dei Calzaiuoli | −3..+3; −170..−250 | **Orsanmichele** (x −15..−3, z −190..−202): a 15 m block with guild niches. |
| 6 | Piazza del Duomo | −40..+40; −250..−340 | The Baptistery (octagon, radius 6.5, at (−20, −275)) and the Campanile (7×7×42 at (+14, −262)). The Duomo's west front is at z −285, with the upper façade still bare brick. |
| 7 | Via Larga | +27..+33; −290..−400 | Savonarola's procession passes at z −330. |
| 8 | **Palazzo Medici** | +36..+62; −393..−367 | Rusticated, 18 m tall. **Courtyard** x +42.5..+55.5, z −386.5..−373.5, with an arcade, an upper loggia at y 9 and the roof parapet at y 18. *David* stands in the centre. |

**The snow giant** stands on a plinth at (+49, 0, −378), 4.6 m tall, built from white spheres and boxes. Its raised right hand is at (+50.2, 4.4) and its head at (+49, 5.2). A plank scaffold surrounds it, with decks at y 1.6 and 3.2.

**Theme.** A painted overcast sky (`skyTop '#9aa3ad'`, horizon `#d9dde0`), fog [60, 320] in `#dfe3e6`, `sunIntensity 0.9`. Window lights come on at dusk.

---

## Objectives and critical path

1. **"Find your feet."** Arrive through the Veil and talk to Smeralda.
2. **"Light the test bench."** Puzzle 1.
3. **"Go down to the workshop."** The hoist jump, then Masino.
4. **"Carry the crystal to the Medici palace before sunset."** The **Crystal Palla** is a key item. The Chapter Door leads to `fi-01-snow`.
5. Cross the bridge and walk north. In the Duomo, **"Restart the cathedral clock."** (Puzzle 2.) Its north door is locked until the clock runs.
6. Via Larga: Savonarola passes (a scene).
7. The Medici courtyard: deliver the crystal and choose where it goes. **"Light the snow giant before the Ave Maria."** (Puzzle 3.)
8. Talk to Piero, Michelangelo and Ottaviano, then take the street door home.
9. The Bottega at night: the letter, and the hook.

### Optional areas
- **Ponte Vecchio shop roofs.** The ridge snow is `w.crumble` (delay 0.6, respawn 4). Leaf 2 is at the far end.
- **Orsanmichele's niches.** Seven niches hold the marks of the seven Major Guilds. Touch all seven and a snow ledge opens, holding Leaf 3 and the codex entry *The Guild Church*.
- **The Baptistery roof.** Reached with spring boots from the Campanile's first ledge (y 9), or by gliding on a replay. Holds Leaf 4.

---

## Puzzles

### Puzzle 1: The Light Bench (loft, y 15)

- **The beam.** Sun enters through a slit in the west shutter at (−6, 16.5, −2), heading east.
- **The mirrors.** Three stands: **M1** (−3, −2), **M2** (−3, +2.5), **M3** (+4.5, +2.5). F turns a mirror 45° (8 states).
- **The target.** The bench lens **L** at (+4.5, −1.5).
- **The beam path** is computed in the x/z plane by tick code and drawn as thin glowing boxes (`#fff3c4`).
- **Solution:** M1 turns the beam south, M2 turns it east, M3 turns it north into L. A bright disc lights the wall chart.
- **Wrong angles:**
  - A beam that hits **the Veil** makes its threads flare, and Smeralda reacts.
  - A beam that hits the shelf of hanging glass throws a rainbow burst, a small reward for experimenting.

### Puzzle 2: Uccello's Backward Clock (the Duomo's inner façade)

**Space.**
- The clock face (radius 3) is painted at (0, 12, −286), facing down the nave. Hour XXIV is at the top, and the numerals run **anticlockwise**.
- A **gallery** (1.2 m wide, y 9) runs across the wall below it. Its south door opens into the **clock loft**, a 6×4 m room inside the wall at y 12, where a **crank** turns the hand's arbor.
- The **weight shaft** (3×3 m) drops from the loft to a pit at y −4. Beams cross it every 2.5 m as ledges.

**Step 1: free the weight.**
- Three lumps of ice clamp the rope, at y 9, 5.5 and 2.
- Each is a breakable with 12 hp. Strikes do 4 bare-handed and 34 with a `blade` item.
- When all three break, the weight sinks with a groan and a ticking loop starts.
- Leaf 5 lies in the pit.

**Step 2: set the hour.**
- The hand is frozen at **XVII**. Nanni says the Badia rang the 21st hour, and Masino says it's three hours to the Ave Maria (sunset, the 24th).
- Each turn of the crank moves the hand one hour forward in time: one step anticlockwise *as seen from the nave*.
- **The twist:** the loft's peephole shows the **back** of the dial, mirrored, so there the hand seems to run clockwise among reversed numerals. To read the clock truly, you have to run out onto the gallery.
- **Solution:** four turns, to **XXI**.
- Overshooting just means going round again. A "Wind back" lever undoes one hour.
- When it's set, a chime sounds, the hand locks, and Nanni unlocks the north door.

### Puzzle 3: The Snow Giant's Eye (the Medici courtyard, dusk)

**Setup.**
- Four corner lamps on the roof parapet (y 18) each throw a beam down one side of the courtyard.
- Four **mirror stations** sit on the upper loggia (y 9): **N** (49, −386), **E** (55, −380), **S** (49, −374), **W** (43, −380).
- Each station has settings I to IV, and F cycles them. **Ottaviano's chalk tally** on each stand shows a setting.

| Station | Crystal on the **head** | Crystal in the **hand** |
|---|---|---|
| N | II | II |
| E | III | IV |
| S | I | I |
| W | IV | III |

- **The chalk is written for the head.**
  - Players who chose the hand must read where each beam actually lands: a lit spot on the giant's snow.
  - Players who chose the head are mostly fighting the traversal.
- **Traversal.**
  - A service stair (NW corner) climbs to the snowy roof walkway (2 m wide). Its cornice tiles crumble (delay 0.5).
  - Drop down to each station, and climb back up by a **ladder zone** at each corner: holding forward lifts you at 3 m/s (see BUILD.md).
  - Gliders and spring boots can cross the courtyard directly (13 m).
- **Soft timer.** Ottaviano's 6-minute countdown to the Ave Maria, with toasts at 3, 1 and ½ minutes. If it runs out, Piero calls for "more wine and patience". Chapter 1 punishes no one.

---

## Set pieces

1. **The fall through the Veil.**
   - On first arrival: `freeze`, `shake(0.5)`, a white burst from the Veil and the threads flaring.
   - After 0.8 s, Smeralda's first lines play, then you're unfrozen.
2. **Savonarola in the snow** (a zone at z −330). Six friars walk south, as walkers (see BUILD.md; until then, static figures with breath particles). The player is frozen for the 6-second exchange.
3. **The giant blazes.**
   - Four beams converge, the crystal goes to glow 4, and a point light of 60 comes on.
   - The snowfall near the giant turns gold, with a burst of 120 sparks.
   - The courtyard's figures wave, and the bells of San Lorenzo ring the Ave Maria (the `bell` sound, see BUILD.md).

---

## Collectibles and codex

**Leaves.**
1. *Loft, behind the Veil's left upright:* "A lens is a patient liar: it tells the truth at exactly one distance."
2. *Ponte Vecchio, the last roof:* "The butchers throw scraps in the river and call it charity to the fish."
3. *Orsanmichele ledge:* "Seven great guilds, fourteen small ones, and not one for widows."
4. *Baptistery roof:* "From up here the city is a drawing. It is only a city when you come down."
5. *Clock pit:* "Uccello painted time running backwards. He was the only honest man in the cathedral."

**Codex.**
- **The Veil.** Alberti's *On Painting* (1435) told painters to stretch a veil of threads between the eye and the subject, and copy each square. "A painting is an open window." Smeralda took him literally.
- **Italian Hours.** Florence counted the day from sunset. The 24th hour struck at dusk and a new day began. Uccello painted the cathedral's 24-hour clock face in 1443, with an anticlockwise hand.
- **The Palle.** The Medici arms are red balls on gold: pills, coins or bezants, no one knows. By November 1494 Florentines would be chiselling them off walls.
- **A Statue of Snow.** In January 1494 Piero de' Medici had Michelangelo carve a statue of snow in his courtyard. It is the one finished Michelangelo nobody ever saw again.
- **Florentine Spectacles.** Florence led Europe in spectacles, including concave lenses for short sight, made from the mid-1400s. Rivet spectacles were two lenses on handles, pinned together.

---

## Dialogue

`[ask]` marks a recorded choice, and `→` the flag it sets. Lines in one block play in one `w.say`.

### Arrival (the loft)

**SMERALDA:** Saint Luke's thumbs. Don't move. You're standing on my good lens.
**SMERALDA:** …No. You're on the floor, and the lens is fine. You came out of the Veil. I was looking through it at the river, and then I was looking at you.
**SMERALDA:** I built that frame to draw Florence exactly as it is. Nobody told me it could draw a visitor.

**[ask] SMERALDA:** "So. What *are* you?"
1. "A traveller. I came from somewhere else, through that." → `fi.c1.answer = honest`
   - **SMERALDA:** Somewhere else. Good. I hate lies; they waste glass. Somewhere else can stay our secret.
2. "Your new apprentice. Obviously." → `fi.c1.answer = apprentice`
   - **SMERALDA:** Obviously. Bold. I like bold, in apprentices and in glass. We'll see if it cracks.
3. "A very large moth, drawn to your lamp." → `fi.c1.answer = joke`
   - **SMERALDA:** A moth that talks. The friar would burn us both. Keep your jokes for indoors.

**SMERALDA:** Listen. In this city a woman who opens windows into nowhere is a witch, and a woman who grinds spectacles is a widow with a licence. I prefer the licence.
**SMERALDA:** To everyone else you're my late husband's kin from Flanders, here to learn the trade. You'll need a name. Festina lente: make haste slowly. You came through far too fast.
**SMERALDA:** Lente, then. It also means *lens*. Earn it.
**SMERALDA:** First lesson. That lens on the bench needs sun, and the sun is going down. Turn the mirrors. Light comes in at the west shutter.

*If the beam hits the Veil:* **SMERALDA:** Not the Veil! It does… things, when it's lit. Away from it.

*Lens lit:*
**SMERALDA:** There. Focus. Everything in this trade is finding the one place where things come clear.
**SMERALDA:** Now go down and find Masino. Small, loud, holds a broom like a pike. Mind the stair. He burned two treads last week and called it a "sacrifice".

### Masino (the workshop)

**MASINO:** You're the Fleming! Is it true Flanders is flat and the sea is higher than the houses? Do you eat butter on everything? Why is your face like that?
**MASINO:** Sorry. The friar says curiosity is a little fire. You warm your hands at it or you burn the house down.
**SMERALDA** *(from the stair)*: The friar should try running a glass shop. Masino, the crystal.
**MASINO:** *(holding up a glass sphere the size of a head)* For Piero de' Medici's snow party! It goes on the snow giant!
**SMERALDA:** A palla, Lente, like the balls on the Medici arms. They'll love it, because it's round and expensive.
**SMERALDA:** Take it to the palace on Via Larga before the Ave Maria. Sunset. Masino knows the way, but he stops at every church to pray and every stall to stare.
**MASINO:** Only the good stalls.
**SMERALDA:** And if anyone asks what's in the cloth, it's a cabbage.

### On the way (zone barks)

- **MASINO** *(bridge)*: The butchers close when it snows. Even the dogs are on holiday.
- **MASINO** *(central terrace)*: My mother said the Arno freezes once in a lifetime. I've had two lifetimes already, then.

### Landucci (optional, at the Mercato Nuovo brazier)

**LANDUCCI:** Monna Smeralda's people! Warm your hands. Don't let the boy put his feet in the coals. He did it last winter.
**LANDUCCI:** I keep a book. Everything that happens, I write down. Snow: the deepest in living memory. Piero's giant: twice a man's height, they say. I'll measure it myself.
**LANDUCCI:** Get to the palace before the Ave Maria. The twenty-fourth hour. After that it's tomorrow, and tomorrow Piero won't remember he ordered anything.

### Nanni the clock-warden (the Duomo)

**NANNI:** The clock's dead. Froze at dawn. The weight's iced to the rope. Seventeen o'clock forever, like a drunk.
**NANNI:** Without the clock, the Ave Maria rings when the bell-ringer *feels* like sunset, and the city eats supper at different times. Riots have started over less.
**NANNI:** You're young and you bend. The shaft's behind the loft door. Knock the ice off the rope.
*Ice cleared:*
**NANNI:** It ticks! Now set the hour. The Badia rang the twenty-first while I was on the ladder. Turn the crank in the loft.
**MASINO:** Three hours to the Ave Maria! Twenty-one. I can count. I counted all the way through the Psalms.
*Cranking from the loft without looking:* **NANNI:** From behind, the clock tells lies. Go out to the gallery and read it like an honest man.
*Solved:* **NANNI:** Twenty-one. Uccello's hand goes the wrong way round, and it's the only thing in Florence that's never been wrong. The north door's open. God keep you warm.

### Via Larga: Savonarola passes

**MASINO:** *(whispering)* It's him. Fra Girolamo. Don't stare. Stare a bit.
**SAVONAROLA:** *(stopping)* Child, your feet are bare in the snow.
**MASINO:** I have shoes, Father. I'm saving them.
**SAVONAROLA:** For what?
**MASINO:** For best.
**SAVONAROLA:** Every day is best, if it is the last one. Put them on. Go home before dark. Florence is cold to the poor.
**MASINO:** *(after)* He talked to *me*. I'm never taking these shoes off.

### The Medici courtyard

**PIERO DE' MEDICI:** Smeralda's glass! Come in, come in, nobody bites in this house except the dogs. Look, Michelangelo, our giant!
**MICHELANGELO:** *(on the scaffold)* I've been looking at him since morning. He's looking back, and he's melting.
**OTTAVIANO:** *(from the arcade, sleeves dusted gold)* And at dusk he'll *shine*. Good evening, little Flemish lens. Ottaviano Scorci. I hang lamps for princes and angels for saints, though lately mostly lamps.
**OTTAVIANO:** The crystal goes on his head. A lamp for a mind. When the light hits it, the whole court will see a giant thinking.
**MICHELANGELO:** You want to stick a lantern on my statue's skull like a tavern sign. Put it in his *hand*. He's holding it up. He's found something. That's a statue. Your way, it's a snowman with a candle in his ear.
**PIERO DE' MEDICI:** Ha! The Fleming decides. Foreigners are impartial. That's why we pay the French.

**[ask] PIERO DE' MEDICI:** "Hand or head?"
1. "In his hand. He's found something." → `fi.c1.crystal = hand`
   - **MICHELANGELO:** Good. Someone in this house has eyes.
   - **OTTAVIANO:** *(lightly)* Then I move four lamps. No matter. Wonder finds its mark.
2. "On his head. Let him think." → `fi.c1.crystal = head`
   - **OTTAVIANO:** A person of taste. You'll go far, and you'll be lit the whole way.
   - **MICHELANGELO:** It's snow. It'll be water by Friday, and so will everybody's taste.

**OTTAVIANO:** A favour. My lamps are on the roof and my mirrors on the loggia, and my Angels are at a wedding in Prato. Terrible people. Someone nimble must aim the four mirrors before the Ave Maria. I've chalked the settings. *(If `hand`:)* For the head. You may have to think for yourself.

*Countdown toasts:* "Three minutes, dear lens." · "One minute! A cold prince is a cruel critic." · "Half a minute. Florence holds its breath. Well, *I* do."

### The giant blazes

**PIERO DE' MEDICI:** Again! Do it again! No, don't, it's perfect. Somebody write this down!
**OTTAVIANO:** Light is the only guest who arrives everywhere at once.
**MICHELANGELO:** It's a snowman with a lamp. *(Beat.)* A beautiful snowman with a lamp. Tell no one.
**MICHELANGELO:** Snow's honest. Everything you carve in it says "not for long". Marble says "forever", and then the Goths come.
**OTTAVIANO** *(aside)*: Quick feet and a good eye. Come and see me at San Felice in Piazza one day. There's always work for people who aren't afraid of heights.

### Home: the hook (the Bottega, night)

**SMERALDA:** You're back. Half the city saw the glow on the clouds.
**SMERALDA:** This came while you were out. No name. Grey wax with a thumbprint. Twenty florins in gold, and an order.
**SMERALDA:** "One lens, ground as wide as a shield. Forty small mirrors of polished steel. Deliver to the storeroom behind San Felice in Piazza. Ask no questions."
**SMERALDA:** The guild wants me shut by spring. Twenty florins is a winter. *(She cleans her spectacles.)* A gift with no name is a debt with no end. But I'll grind it. Lenses don't choose what they look at.
**SMERALDA:** One coin has a nick in its edge, as if someone tested it with a knife. *(She holds it to the candle.)* Remember that. I remember everything that's been cut.

*(Banner: CHAPTER 1 COMPLETE · Apprentice of the Eye.)*

---

## Learns and earns

**Learns:** the Veil and its secret, Italian hours (the day ends at sunset), how mirrors bend light, and the first sight of the city's powers and characters.

**Clues seeded:**
- Ottaviano's **gold-dusted sleeves** (rosin flash powder);
- the **nicked florin**;
- **San Felice in Piazza**, named twice.

**Earns** (soulbound):
- **Title:** *Apprentice of the Eye.*
- **Cosmetic:** *Rivet Spectacles* (head).
- Codex entries, and up to 5 Leaves.

**Hook:** a shield-wide lens and forty mirrors, ordered anonymously for the same storeroom where Ottaviano offered Lente work.

**Playtime:** 30–40 minutes, plus 10 for the optional areas.
