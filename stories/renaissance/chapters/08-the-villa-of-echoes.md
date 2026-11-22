# Chapter 8: The Villa of Echoes

*August 1497, from sunset to midnight.*
**Modules:** `florence` (prologue) and `fi-08-careggi` (the hills, the villa). **Playtime:** 40–50 min.

> **Landucci's notebook.** *Plague in the city, and hunger. In April Piero came to the Roman gate with soldiers and nobody opened to him, and he went away. In May the Pope excommunicated the friar. This month they found letters, and five citizens of the first families will lose their heads. I have taken my family to the farm. At night, from our hill, I see a light in the Magnificent's villa at Careggi, which is shut, and which has been empty since he died.*

Plague empties the city. Smeralda is feverish and furious about it. A light burns at night in Careggi, the shuttered villa where Lorenzo de' Medici died. Lente crosses the olive hills to find Ottaviano's cache in the villa's cellars, reads the Angels' lantern code, and overhears their plans in a loggia where whispers carry wall to wall. And the Eight are coming tonight for an old gardener.

---

## Prologue (module `florence`)

- **The Bottega is half-shuttered.** Smeralda is in bed on the living floor with a summer fever ("Not the plague. I've had the plague. This is just my body complaining about Florence").
- **What she gives.** A note on the Codex Desk from Landucci, about the light at Careggi. She gives Lente her **dark lantern**: `fi-lanterna`, hand slot, `light` trait, soulbound. Its shutter closes, so world code checks the equipped state.
- **Masino**, by flag:
  - **`fi.c6.told = true`:** he went to San Marco after the bonfire. The friar listened, wept, and asked the Signoria to look into "the guardians of the vanities". The Angels vanished. Masino now nurses plague victims with the friars, thin and quiet.
  - **false:** he is telling everyone about "the Fleming who flew out of the fire". The story has reached the Arrabbiati, who are laughing at the friar's "flying miracles". He has made Lente famous, dangerously.

---

## Locations and layout (module `fi-08-careggi`)

The module origin is outside **Porta San Gallo**, on the road north. The sky goes from sunset at the start to `night-sky` (a theme transition at the villa gate). Cicadas (ambient). The hill country is compressed to about 320 m.

| # | Zone | Bounds (x; z) | Notes |
|---|---|---|---|
| 1 | **The gate road** | −6..+6; 0..−40 | The city wall behind you, 12 m, stone-blocks. A plague cart, abandoned. Spawn (0, 0, −4) facing north. |
| 2 | **The olive terraces** | −40..+40; −40..−160 | **Nine terraces**, each 1.6 m higher than the last, 12–14 m deep, held by dry-stone walls (`mossy-rocks` and `boulder` assets with box colliders). Olive trees are cylinders with grey-green `low` spheres. A **sunken lane** cuts diagonally up through them. Some terrace walls have tumbled into **ramps**, others into **gaps** (2–3 m). |
| 3 | **The stream and mill** | x +20..+40; z −90..−110 | A stream (a slow zone, 0.4 m deep) under a small mill with a turning wheel (decorative `spin`) and a mill roof at y 6. |
| 4 | **Cypress ridge** | z −160..−180; y 14 | A line of cypresses (tall dark cones). From here: the first view of **the villa**, lit in one window, and back over the valley to the dome, small and gold in the last light. **Glide** from the ridge down to the villa's garden wall: a drop of about 8 m covers about 36 m. |
| 5 | **Villa Careggi** | x −15..+15; z −200..−224; walls y 0..14 | A fortified villa: a crenellated parapet, a corner **tower** at (+13, *, −222) to y 22, and an inner courtyard of 10×8 m. |
| 6 | **The garden** | x −30..−15; z −196..−228 (west of the villa) | Geometric box hedges 1.2 m high, as low walls you can hide behind. A fountain, gravel walks, the **two-storey loggia** on the villa's west face. |
| 7 | **The loggia** | x −15..−13; z −204..−220; y 0 and 5 | Barrel-vaulted, 16 m long. **Whispering corners**: a rosette set in the floor at each end. |
| 8 | **The cellars** | under the courtyard, y −4, 14×10 | Reached from the kitchen (a trapdoor). Lit by the Angels' lamps. **Crates**: dozens, numbered. |
| 9 | **The death room** | first floor, NE corner (y 5) | Lorenzo's room. Shuttered and dusty, a bed with a moth-eaten canopy. A quiet optional room with Leaf 24. |
| 10 | **The tower top** | y 22 | A signal lantern with a shutter (night) and a steel mirror (day), aimed at the city. The **code sheet** is pinned under a stone. |
| 11 | **The north hill** | z −224..−300 | Behind the villa, rising to y 30 (a rocky hill, `cliff` texture). The escape route over the hills. The **hill notch** is at (−10, 30, −296). |

**Patrols** (Ch 6 stealth rules, outdoors): four **Angels** with lanterns in the garden and courtyard, 70° cones of 9 m. If your **dark lantern** is open, your **detection range doubles**. Close it (unequip, or "Shutter" via F) to slip past, and open it to see the chalk marks in the cellar.

---

## Objectives and critical path

1. **Prologue.** Smeralda's charge: **"Find out what's burning at Careggi."**
2. **Climb the terraces** to the cypress ridge (platforming; optional routes).
3. **Glide to the villa's garden wall.** Stealth into the garden.
4. **The whispering loggia.** (Puzzle 1.) Overhear two Angels: the plan, and the **Eight's raid tonight**.
5. **The tower.** (Puzzle 2.) Read the lantern code and send a false signal to keep the cart crew in the city.
6. **The cellars.** Find the cache. The **Seal of Nero** if it's here (by flag). Ottaviano's **note**.
7. **Bartolo** in the garden-keeper's lodge, and **his fate** (by flag and choice).
8. **The Eight arrive.** Escape over the **north hill** (a glide), with or without Bartolo.
9. Back at the Bottega: the hook.

**Optional areas:**
- **Leaf 23**, the mill roof.
- **Leaf 24**, Lorenzo's death room.
- **Three Platonic sayings** carved over doors in the villa. Reading all three unlocks the codex entry *The Academy at Careggi*.

---

## Puzzles

### Puzzle 1: The Whispering Loggia

- **The acoustics.** The loggia's vault carries sound from one end to the other. Two Angels (**Tordo** and **Biscia**) talk in the **north corner**.
- **The rosettes.** Standing on the **south rosette**, 16 m away and out of their lantern cones, plays their conversation. It's a zone in which `w.say` lines play while you stay inside, and leaving pauses them.
- **Fair signposting.** The rosettes are inlaid with a little ear motif. Bartolo told the player years ago (Ch 2's codex) that Lorenzo loved "rooms that listen". A sign in the loggia reads, in Latin and Italian: *"Speak softly: the walls are philosophers."*

### Puzzle 2: The Lantern Code

- **The code sheet** (under a stone on the tower) maps six words to flash patterns: **S** = short (shutter open 0.5 s), **L** = long (1.5 s).

| Word | Pattern |
|---|---|
| CART | S L |
| WAIT | L L |
| RIVER | S S L |
| NOW | L S |
| EIGHT (the magistrates) | S S S |
| ALL QUIET | L L S |

- **Reading.** First, the answering lantern from the city (a far light on San Felice's roof, drawn as a glowing sprite) flashes a question: **S L, L S** = "CART NOW?"
- **Answering.** The player answers with the shutter, which has **two levers**: "Short flash" and "Long flash". A third lever, "Send", ends the word.
- **The best answer is "WAIT" (L L).** The cart crew stays in the city, and only four Angels are at the villa when the Eight come.
  - **"ALL QUIET" (L L S)** also works.
  - **"EIGHT" (S S S)** brings the crew running, which makes the escape harder: two more walkers on the hill path.
  - Any other answer: the city light flashes "?" and asks again.
- **Flag:** `fi.c8.signal` = `wait` / `quiet` / `eight`.

### Puzzle 3: The Cellar Search

- **The crates** are numbered. With the **dark lantern open**, the player sees **chalk marks** the Angels left: a sold-crate tick, and a small "O" for Ottaviano's personal pieces.
- **Three O-crates** can be opened (interact):
  1. **The Seal of Nero**, if `fi.c2.seal = signoria` (stolen from the Signoria's inventory) or `fi.c6.gave = seal`. Otherwise a gilt Medici salt cellar (flavour only). A pickup; the Seal goes to the Gallery.
  2. **A page of Ottaviano's ledger:** `fi.c8.ledger = true` (read below).
  3. **Ottaviano's note**, addressed to Lente.

---

## Bartolo's fate

**Bartolo** lives in the garden-keeper's lodge at (−28, 0, −226), allowed by the Signoria to tend the villa's trees. The conspiracy's letters have been found, and the Eight ride tonight. Ottaviano tipped them off, so a talkative old man will be gone.

| `fi.c5.bartolo` | What happens | Result |
|---|---|---|
| **warned** | Bartolo trusts you. **Choice:** over the hill to the Bologna road, or into hiding in the city. | `escaped` / `hidden` |
| **silent** | He's suspicious but desperate. The same choice, plus "Let the Eight decide." | `escaped` / `hidden` / `taken` |
| **reported** | The Eight are already at the lodge when you arrive. He sees you. No choice. | `taken` |

**Escape route** (`escaped`):
- Bartolo walks the north hill path as a **walker** at 3 m/s. The player must keep the path's **two Angel sentries** distracted. Close your lantern, then **open it** at a far point to draw a sentry (a "noise" lure: an open lantern beyond a hedge pulls the nearest sentry's loop for 8 s).
- At the hill notch he says goodbye, and the player glides back down.
- **If `fi.c8.signal = eight`**, there are two extra sentries.

**Hidden route** (`hidden`): the player leads Bartolo back to the gate road. Smeralda's loft will hide him until he's needed (Ch 10).

---

## Collectibles and codex

**Leaves.**
- **23** *(the mill roof):* "The olives don't know who owns the villa. They grow for whoever is patient."
- **24** *(Lorenzo's death room):* "He died here with a friar and a philosopher at his bed, and nobody agrees what either of them said."

**Codex.**
- **Careggi.** The Medici villa at Careggi, remodelled by Michelozzo, was where Cosimo gathered Marsilio Ficino and his circle to translate Plato: the "Academy". Lorenzo died there on 8 April 1492.
- **Piero's Return.** On 28 April 1497 Piero de' Medici approached the Porta Romana with troops, hoping the city would rise for him. It didn't, and he withdrew.
- **The Five.** In August 1497 five citizens were condemned for plotting Piero's return. Denied their appeal to the Great Council under a law the friar's party had championed, they were beheaded. Florence argued about it for decades.
- **The Plague Summer.** In 1497 plague and famine struck together. Those who could fled to their farms, and the friars and their boys nursed the sick.
- **The Academy at Careggi.** Ficino's circle read Plato as a way to God through beauty. Savonarola thought beauty was the trap. The two ideas met at Lorenzo's deathbed.

---

## Dialogue

### Prologue (the Bottega)

**SMERALDA:** *(in bed, a damp cloth, furious)* Don't come close. It's not the plague. I've had the plague, in 'seventy-nine; I know its handshake. This is just my body complaining about Florence.
**SMERALDA:** Landucci writes from his farm. A light at Careggi, every night, in a house that's been dark since Lorenzo died. *(Beat.)* Ottaviano rents empty Medici houses "to store festival machinery." I asked the Signoria's clerk. I paid him in spectacles.
**SMERALDA:** Take my dark lantern. Open it when you need to see; shut it when you need not to be seen. That's the whole art of living in this city.
*If `fi.c1.answer = honest`:* **SMERALDA:** If anything happens, the Veil is yours. I don't know what it does for you, but I know it's yours. Go home through it, if you have to.

**MASINO** *(if `told`; at the door, thin, a friar's apron)*: I'm working at the hospital with the friars. The friar said the guardians of the vanities will be "looked into". Then they disappeared, like smoke. *(Beat.)* Be careful, Lente. Smoke goes somewhere.
**MASINO** *(if not `told`; bright, too loud)*: Everyone's asking about you! The Fleming who flew out of the fire! The Arrabbiati say it's a trick, but they say everything's a trick. I tell them: I *saw* it.

### The whispering loggia (overheard)

**TORDO:** …the master says wait. All of it stays here till the city's looking the other way.
**BISCIA:** The city's always looking the other way. It's got plague.
**TORDO:** Not that sort of looking. The master says: wait for the next great crowd. When the whole city's in the Piazza watching something burn, the tunnel's ours and the river's ours, and we're in Venice before they've swept up the ashes.
**BISCIA:** What if there's no next fire?
**TORDO:** In *this* city? *(A laugh.)* There's always a next fire.
**BISCIA:** And the old man?
**TORDO:** The Eight come for him tonight. The master sent them a letter, with the seal on it. Old fool talks to anyone about trees. Trees have ears, the master says.

### The ledger page (read card)

*"No. 114, Venus (S.B.), eyelashes: Messer Grimani, Venice, 300 ducats. No. 61, Petrarch with L.M.'s verses: reserved. No. 9, Lens, shield-wide (S. dei Vetri): returned to stores after the Duomo. Do not sell; it may be useful again. Sword: 40 fl. from the brothers of S. Croce di Gerusalemme… (crossed out)… from the Piagnoni brothers T. & B. Lion: my own."*

### Ottaviano's note (in the third O-crate)

*"To the little lens. Careggi is lovely in August. Don't drink the water; the plague likes the cisterns. If you're reading this, you came by the hill and not the road, which means you're cleverer than the Eight. Leave the crates. They're going to Venice, and so, one day, are you. — O. P.S. The old man would have talked eventually. Everyone does. I've only hurried him."*

### Bartolo (the lodge)

*If `warned` or `silent`:*
**BARTOLO:** *(packing nothing, holding a pruning knife)* You. Of course you. Every time the sky falls on me, there's a Fleming under it.
**BARTOLO:** They found letters. Not mine: the others', the great men's. Bernardo del Nero. Tornabuoni. They'll lose their heads, and I'll lose mine for carrying their notes about "trees".
**BARTOLO:** *(if `warned`)* You told me someone was using my letters. I stopped. They used my name instead.

**[ask] BARTOLO:** "What do I do?"
1. "Over the north hill, tonight. The Bologna road." → `fi.c8.bartolo = escaped`
   - **BARTOLO:** At my age. Over a hill. *(A cracked laugh.)* Lorenzo always said I'd die in a garden. He didn't say whose.
2. "Come back to the city with me. We'll hide you at the Bottega." → `fi.c8.bartolo = hidden`
   - **BARTOLO:** In a glass shop. Where you hid the gem, once. *(Beat.)* All right. I'll be a gem.
3. *(Only if `silent`)* "Wait for the Eight. Tell them the truth." → `fi.c8.bartolo = taken`
   - **BARTOLO:** The truth. *(He sits down on his bed.)* Yes. I'll tell them about the trees.

*If `reported` (the Eight are already there):*
**OFFICER OF THE EIGHT:** Bartolo Nuti, in the name of the Eight—
**BARTOLO:** *(seeing Lente in the garden, very calm)* There you are. You told them. *(Beat.)* That's all right. You were honest. Honest is what this city is dying of.
*(He is taken. `fi.c8.bartolo = taken`.)*

*At the hill notch (if `escaped`):*
**BARTOLO:** Go back. Tell the trees I said goodbye. *(Beat.)* If they ever put the Medici back on the walls, I'll come home with them. And I'll owe you a garden.

### The hook (the Bottega, past midnight)

**SMERALDA:** *(fever broken, sitting up, reading the ledger page if found)* "The lens: do not sell; it may be useful again." *(She folds it very small.)* He means to use my glass again. For what?
*If `hidden`:* **BARTOLO** *(from the loft)*: Monna, your painted wall is very convincing. I've apologised to it twice.
**SMERALDA:** "Wait for the next great crowd." *(She looks out at the dark city.)* In this city, Lente, there is always a next fire.

*(Banner: CHAPTER 8 COMPLETE · Night Walker of Careggi.)*

---

## Learns and earns

**Learns:**
- the cache is at Careggi;
- the plan is to wait for the next great crowd and move everything through the tunnel and down the river to Venice;
- Ottaviano betrayed Bartolo;
- the ledger exists, and names Smeralda's lens.

**Earns** (soulbound):
- **Title:** *Night Walker of Careggi.*
- **Item:** *Smeralda's Dark Lantern* (hand, `light`).
- **Cosmetic:** *Cypress Sprig* (head).
- The Seal of Nero, if it was in the cache.
- Codex entries, and Leaves 23–24.

**Hook:** "There is always a next fire." In March 1498 a Franciscan challenges the friar's companion to walk through one.

**Playtime:** 40–50 minutes.
