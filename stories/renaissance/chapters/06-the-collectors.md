# Chapter 6: The Collectors

*Late January to 6 February 1497.*
**Modules:** `florence` (the Bottega and the Painted Wall) and `fi-06-raccolta` (the vanities warehouse at night). **Playtime:** 35–45 min.

> **Landucci's notebook.** *The boys go from house to house and ask for vanities: mirrors, paints, perfumes, false hair, dice, cards, lutes, and the books of the poets, and pictures. Most give. Some weep and give. I gave my wife's mirror. She has not spoken to me since, which I suppose is a kind of penance.*

The friar's boys are coming to the Bottega for its vanities. The greatest "vanity" in the house is a six-metre frame that opens onto another world. Lente hides the Veil behind a perspective-painted false wall, which only works from one spot in the room. That night, in the warehouse where the city's vanities wait for the fire, Lente watches Ottaviano's Angels swap paintings for fresh copies. One of the copies is Botticelli's Venus.

---

## Locations and layout

### A. The loft and the Painted Wall (module `florence`, y 15)

**The flats.** Smeralda has painted three **canvas flats** in a week of nights, each 2.2 m wide and 6 m tall. Together they show the loft's back wall: plaster, a roof beam, a shelf with jars, a crucifix (a good touch with these visitors).
- Each flat stands on its own floor **rail** running north–south, at x −2.2, 0 and +2.2.
- Each rail has **4 depth positions** (z −3.6, −3.0, −2.4, −1.8). F moves a flat one position, cycling.

**The eye-stone.** A worn flagstone at the top of the loft stair, at (−5, 15, +4). It's the spot the visiting boys will look from.
- Seen from the eye-stone, the painted beam, shelf and plaster joints **line up across all three flats** only at the solution.
- From anywhere else the illusion is obviously broken. That's the lesson: perspective has one true point.

**The Veil's glow.** The Veil's threads glow when a player is within 3 m, so the player has to step away before the boys arrive.

**The rest of the house.**
- **Bonaccorso's lute** hangs on the living floor's wall.
- The **mirror stock** (32 small steel and glass mirrors) is racked in the store.

### B. The vanities warehouse (module `fi-06-raccolta`)

An old salt-office warehouse beside the Palazzo, at night. The theme is `night-sky`, moonlit, fog [30, 160].

| Element | Position / size | Notes |
|---|---|---|
| **Street** (Via de' Gondi) | x −25..+25; z +12..+18 | Spawn at (−20, 0, +15). |
| **Warehouse hall** | x −15..+15; z −10..+10; roof y 8 | Stone walls. Two rows of **stacks**: piles 2.5–3.5 m high of mirrors, lutes in racks, painted panels leaning in rows, cosmetics barrels, wig poles, mask baskets, book crates. Aisles 1.6 m wide between them. |
| **Mezzanine** | north and east walls, y 4, 2 m wide | Reached by a ladder zone at the NE corner. It looks down on the whole hall. |
| **Entries** | the roof **skylight** (0, 8, 0), a **side window** (−15, 2.5, −4), the front door (locked) | Get to the roof from a lean-to and a stack of crates in the street, 1.8 m steps. |
| **The back door** | south wall (+8, 0, +10) | Leads to a courtyard with a **cart** under a tarp, where the originals go. |
| **The copy table** | (+10, 0, −6) | Fresh panels laid out: the **Venus copy**. |
| **Patrols** | 3 Angels with lanterns: **Gatto**, **Biscia**, **Tordo** | Walkers on loops (see the puzzle). |

---

## Objectives and critical path

1. **The Bottega, morning.** Masino has sent word: "The boys will come at the twentieth hour." Smeralda's plan: **"Hide the Veil."** (Puzzle 1.)
2. **The boys arrive.** The collection scene and **the choice: what the Bottega gives.**
3. Masino, proud and glowing, tells Lente about "the Treasure House", where everything waits for the fire.
4. **Night.** Go out by the Chapter Door to `fi-06-raccolta`. **"See the Treasure House for yourself."**
5. **Get in** (skylight or window) and **watch the swap from the mezzanine** without being seen (Puzzle 2).
6. **"Inspect the Venus."** (Puzzle 3, at the copy table, which needs a moment when the guards are away.)
7. Get out. **Morning:** Masino, and the choice to tell him.
8. **Ottaviano visits the loft.** The hook.

**Optional areas:**
- **Leaf 18** inside a mask basket on the mezzanine.
- **Leaf 19** on the warehouse roof ridge.
- **Book crate codex:** reading three crate labels unlocks the codex entry *What Burned* (Boccaccio, Petrarch, Ovid, playing cards from Rouen).

---

## Puzzles

### Puzzle 1: The Painted Wall

- **Solution** (positions 1–4, front to back): **left flat 2, centre flat 1, right flat 3** (z −3.0, −3.6, −2.4).
- **The fair hint.** Each flat's edge carries a chalk tick that Smeralda drew while painting: "where the beam meets". From the eye-stone the three ticks form one straight line only at the solution.
- **Feedback.** When solved, Smeralda (standing on the eye-stone) says so. A frame-only effect slightly brightens the flats.
- **The timer.** A soft 4-minute countdown to the twentieth hour, shown by Masino's voice at the street door ("We're coming up the street, Monna Smeralda!"). If it runs out, the boys simply wait downstairs singing until you're done. There's no failure.
- **With the viewpoint feature.** Standing on the eye-stone and pressing F locks a first-person view from that point (see BUILD.md, *viewpoints*). Without it, the flats are painted for the default third-person camera when the player faces north on the stone.

### Puzzle 2: The Warehouse (stealth)

**The guards.**
- Each guard walks a fixed loop at 1.6 m/s, carrying a lantern.
- **Vision:** a 70° cone, 8 m long; 12 m if the **player** carries a lit `light` item. Their lanterns are always lit, so the cone shows on the floor as a faint amber wedge (a frame visual).
- **Line of sight.** Stacks block sight. The world checks the guard-to-player segment against the stack rectangles in 2D (cheap and deterministic).

| Guard | Loop | Habit |
|---|---|---|
| Gatto | the west aisle | Stops at the window to look out (6 s). |
| Biscia | the east aisle and the copy table | He's lazy: he sits on a barrel for 8 s every lap. |
| Tordo | the mezzanine | Slow, 1.2 m/s, with pauses at each corner. |

- **Seen.** There's a 1 s "?" grace: if the player leaves the cone within it, nothing happens. Otherwise:
  - the guard barks;
  - the screen flashes;
  - the player is **escorted out**: `respawn` to the street checkpoint, with no damage and no penalty beyond the walk.
- **The swap.** At set points in the guards' loops, a scripted pair (two more Angels) carries an original out of the back door and a copy in. Watch from the mezzanine's east end: that zone triggers a short **barked exchange** (the dialogue below). That's the evidence.

### Puzzle 3: Inspect the Venus

- **The check.** At the copy table, interact "Look closely" (it needs Biscia off his barrel). It shows the *Venus* in a close-up panel: an image card in the dialogue box, see BUILD.md.
- **The clue.** Botticelli told Lente in Ch 5, "I paint eyelashes." The copy has **no eyelashes**: the eyes are two quick dark strokes. The varnish is tacky, and a thumbprint is pressed into a corner.
- **Result:** `fi.c6.evidence = true`. An optional second check, on a "Petrarch" crate, shows a copy with fresh ink.
- **Being caught** at the table works as in Puzzle 2.

---

## Collectibles and codex

**Leaves.**
- **18** *(mask basket):* "A mask is a mirror that lies in your favour. No wonder they're burning both."
- **19** *(the warehouse roof):* "The boys collect sin by the cartload. Somebody is sorting it by price."

**Codex.**
- **The Fanciulli.** Savonarola organised Florence's boys into companies with captains, white robes and red crosses. They collected alms and "vanities", sang lauds in place of Carnival songs, and sometimes bullied the reluctant. Many Florentines remembered them fondly; some never forgave them.
- **What Burned.** Records of the bonfires list mirrors, cosmetics, perfumes, false hair, dice, playing cards, chessboards, lutes and harps, carnival masks, fine fabrics, the poems of Petrarch and Boccaccio, Ovid, and paintings and sculptures thought lascivious.
- **Perspective's One Eye.** Linear perspective works for exactly one viewpoint, where the painter's eye was. Stand anywhere else and the illusion bends. Renaissance stage designers built whole streets on this principle.
- **Poplar Panels.** Florentine painters worked on panels of poplar, glued and primed with gesso. A fresh panel smells of glue and linseed for weeks, an old one of nothing at all.

---

## Dialogue

### The plan (the loft)

**SMERALDA:** They're coming at the twentieth hour. Eight boys with a cart and the best intentions in Florence. They'll want the mirrors. They'll want the lenses: "eyes of vanity", I've heard them say. And if they climb up here, they'll want *that*. *(The Veil.)*
**SMERALDA:** A frame the size of a barn door, strung with silk, that hums when you stand near it. They'll call it the Devil's loom and burn the house round it.
**SMERALDA:** So. A trick. *(She gestures at the three flats.)* I painted the wall that's behind the Veil. Beam, shelf, plaster, and a crucifix, because I'm not a fool.
**SMERALDA:** From the top of the stair, where they'll stand, it has to look like one wall. Perspective only tells the truth from one place. Stand on the eye-stone and look. Move the flats until the lines meet.
*If `fi.c1.answer = honest`:* **SMERALDA:** It's Ottaviano's trade, this, making a wall that lies. I hate that I learned it watching him. I hate more that it works.
*(Solved:)* **SMERALDA:** *(on the eye-stone)* There. A wall. A dull, honest, Christian wall. *(Beat.)* Step away from it. It glows when you're near. You've a light in you it likes.

### The collection

**MASINO:** *(at the door, eight boys in white behind him; formal)* Peace to this house. We are the boys of Fra Girolamo, and we come for your vanities, that the city may be clean before Lent.
**SMERALDA:** Peace to you, Captain Masino. You know where everything is. You swept under it for three years.
**MASINO:** *(trying not to smile)* Yes, Monna. *(Recovering.)* The friar says a glass-maker's shop is full of mirrors, and a mirror is where the soul goes to admire itself instead of God.
**SMERALDA:** And a lens is where an old woman goes to read her prayers. Are you taking those?
**MASINO:** *(unsure)* …Spectacles are allowed. I asked.
**A BOY:** *(peering up the stair)* What's up there?
**MASINO:** The loft. Just a wall and some jars. I've been up there a hundred times. *(Looking up; the wall holds.)* Just a wall.

*If `fi.c2.seal = bottega`, Masino lowers his voice:*
**MASINO:** And the gem. The red one, with the pagan god. I saw you hide it in the blanks, Monna. The friar says idols must burn.

**[ask] SMERALDA** *(looking at Lente)*: "Well, Lente. What does the Bottega give to God?"
1. "Take the mirrors. All of them." → `fi.c6.gave = mirrors`
   - **SMERALDA:** Thirty-two mirrors. A year of polishing. *(Beat.)* Take them, Masino. Let them see themselves burn.
   - **MASINO:** *(gently)* Thank you, Monna. They'll be on the pyramid. You'll see them catch the light.
2. "Take Maestro Bonaccorso's lute." → `fi.c6.gave = lute`
   - **SMERALDA:** *(a long pause; she takes it from the wall herself)* He played it badly for twenty years. I'll miss every wrong note. *(Giving it.)* Carry it carefully. It still thinks it's going to a party.
   - **MASINO:** *(holding it as if it might break)* I will, Monna. I'll carry it myself.
3. "Nothing. This house has nothing to burn." → `fi.c6.gave = nothing`
   - **MASINO:** *(stung)* Nothing? Everyone has something. *(The boys murmur; one chalks a cross on the doorpost: the mark of a hard heart.)*
   - **MASINO:** *(quietly, to Lente)* I'll tell them you're foreign and don't understand. Don't make me tell them twice.
4. *(Only if `fi.c2.seal = bottega`)* "Take the Seal of Nero." → `fi.c6.gave = seal`
   - **SMERALDA:** Lorenzo's gem? Bartolo trusted us with— *(She stops. Cleans her spectacles.)* Masino. It's two thousand years old. Look at it before you burn it. Really look.
   - **MASINO:** *(looking, troubled)* It's very small. To be so wicked.

**MASINO:** *(leaving; to Lente, eager again)* Everything goes to the Treasure House by the Palace until Shrove Tuesday. Mountains of it. You can't imagine. Lutes like a forest. Pictures stacked like bread. Maestro Ottaviano's men guard it at night, so nobody steals any sin.

### The warehouse (barks)

**Guards spotting you:**
- **GATTO:** Oi! Out! No sinning in the sin-house!
- **BISCIA:** You again! *(Escorting.)* Out you go, Fleming. Come back in daylight with a cross like everybody else.
- **TORDO:** Hm? Who's there? …Somebody's there.

**The swap** (overheard from the mezzanine's east end):
- **ANGEL 1:** Careful, that's the good one. Botticelli. The master wants it wrapped double.
- **ANGEL 2:** And the copy?
- **ANGEL 1:** In its place. Paint's still wet, so don't lean on it. Nobody looks at a picture they're going to burn.
- **ANGEL 2:** How many tonight?
- **ANGEL 1:** Eleven pictures, the Petrarch, two lutes from Brescia. The cart goes before the boys come back. *(Laughing:)* The friar burns the copies and heaven applauds. Everybody's happy.

**The Venus** (the inspection card):
*A pale Venus on a dark ground, quick and competent. Her eyes are two dark strokes. Botticelli paints eyelashes; this painter didn't. In the corner, a thumbprint in tacky varnish. Fresh poplar. This is not the panel you carried to San Felice.*

### Morning: Masino (the Bottega workshop)

**MASINO:** *(hanging up his white robe on the peg, as if it's still his peg)* You look terrible. Did you sleep in a chimney?

**[ask]** "Tell Masino what you saw?"
1. "Masino, they're swapping the best things for copies. The fire is a fake." → `fi.c6.told = true`
   - **MASINO:** *(very still)* No.
   - **MASINO:** No. The friar wouldn't. *(Beat.)* The friar doesn't *know*. Does he? It's the men who guard it. Maestro Ottaviano's men.
   - **MASINO:** *(white-faced)* I have to see. On Shrove Tuesday I'm a captain. Captains go up inside the pyramid to place the last things. Come with me. Be my bearer. If it's true, I'll… I'll tell him myself. The friar.
2. "Nothing. Bad dreams." → `fi.c6.told = false`
   - **MASINO:** The friar says bad dreams are the Devil's last sermon. *(Brightening:)* Shrove Tuesday! Come and watch, Lente. From the roofs. I'll wave.

### The hook: Ottaviano in the loft

*(Smeralda at the foot of the loft stair, arms folded. Ottaviano already halfway up.)*
**OTTAVIANO:** For the crown of the pyramid I need one great mirror. The largest in Florence. Something the whole Piazza can see itself in, before it burns.
**SMERALDA:** I have nothing that size.
**OTTAVIANO:** *(reaching the top of the stair; standing, by chance or not, almost on the eye-stone. A long look at the painted wall.)*
**OTTAVIANO:** Lovely work. *(Beat.)* Whose perspective?
**SMERALDA:** Mine.
**OTTAVIANO:** *(stepping one pace to the side; watching the beam on the canvas break in two; smiling)* Ah. There it goes. *(He steps back onto the stone. The beam is whole again.)* It's always the same lesson. Stand in the right place and everything's true.
**OTTAVIANO:** *(to Lente, going down)* Shrove Tuesday. The Piazza. Best seats are on the roofs, little lens. You'll want to see the whole thing.
*(He goes. Humming, from the street: "Quant'è bella giovinezza…")*
**SMERALDA:** *(not moving)* He knows there's something behind it. He doesn't know what. *(Beat.)* Yet.

*(Banner: CHAPTER 6 COMPLETE · Hider of Windows.)*

---

## Learns and earns

**Learns:**
- **The substitution trade exists.** The Angels run it, and the originals leave by cart for a buyer.
- Botticelli's Venus was copied: **Ottaviano's cellar** is where the originals sleep.
- Ottaviano now suspects the Veil.
- Players who remember Ch 5 will connect the nine staves, the Angels and San Felice to Ottaviano, but the question of *the miracles* is not yet answered out loud.

**Earns** (soulbound):
- **Title:** *Hider of Windows.*
- **Cosmetic:** *Olive Sprig* (hand), the fanciulli's olive branch (given by Masino unless `nothing`), or *Chalk Cross* (a cosmetic doorpost mark for the Bottega; Gallery item) if `nothing`.
- The codex entries, and Leaves 18–19.

**Hook:** "Shrove Tuesday. You'll want to see the whole thing."

**Playtime:** 35–45 minutes.
