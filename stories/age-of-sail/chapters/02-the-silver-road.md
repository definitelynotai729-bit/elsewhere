# Chapter 2: The Silver Road

*World `dh-02-flota` · 24–29 July 1715, at sea in the Florida Straits · Act I · 30 minutes*

**In short:** Life aboard the flagship. Lessons that pay off later, a secret errand outside the hull, and the signs of a storm that a good man decides to sail into anyway.

## Locations and layout

Axes: the bow points to −z, the stern to +z, starboard is +x and port is −x. The sea surface is y = 0. The ship stays still while the world moves around it: the wake drifts aft, swell bands pass under the hull, and the other ships bob in `frame`.

| Area | Footprint | Heights | Notes |
|---|---|---|---|
| Hull | x −6 to 6, z −22 to 22 | sides −4 to the decks | Planked (`planks`, dark), with gun ports along both sides. |
| Main deck (waist) | z −8 to 8 | 3.0 | Two ship's boats on chocks. Main hatch at z 0 (1.6 × 2 m), with a ladder climb volume down to the gun deck. |
| Forecastle | z −22 to −10 | 5.6 | Ramps from the waist. Bird sign at the bow rail. |
| Quarterdeck | z 8 to 22 | 5.6 | Binnacle at (0, 5.6, 9). **Painted compass rose** centred (0, 5.6, 13), radius 4 m, with 32 brass studs at radius 3.6 (zones 0.6 m). |
| Poop deck | z 16 to 22 | 8.2 | Three great stern lanterns on the taffrail at z 22. The log reel sits on the starboard rail at (4, 8.2, 21.6). |
| Great cabin | under the poop, z 14 to 22 | floor 5.6 | Ubilla's table and the stern windows. The upper stern gallery runs outside it. |
| Gun deck | z −20 to 20 | floor 0.4, ceiling 2.9 | 20 guns. Inés's cabin is at x 3 to 5.5, z 12 to 15 (cot, desk, weather-glass). Anselmo's desk is at x −5 to −3, z 10 to 13. The **strongroom** at x −2.5 to 2.5, z 17 to 21 has a locked door and a soldier at (0, 0.4, 16). |
| Hold | z −18 to 16 | −3.2 to 0.3 | Water casks, chests and cacao sacks (Lalo). Dim; one lantern. |
| **Stern route** | outside the stern face at z 22.4 | | The taffrail (8.2), then the upper gallery walkway (6.0, 0.8 m deep, x −5 to 5), the starboard quarter-gallery roof (5.0, at x 5.2), a carved scroll ledge (3.4, 0.4 m wide), the rudder-chain beams (2.2) and the strongroom stern port at (1.5, 1.6, 22.4). |
| Masts | fore z −14, main z −2, mizzen z 12 | main: top 20, crosstrees 30, topgallant 36 | Shroud climb volumes run from the rail (x ±6.2, y 4) to the maintop (4 × 3 m at 20), and futtock and topmast volumes on to the crosstrees (1.6 × 1.6 m at 30). The topgallant yard at 36 needs a double jump from the crosstrees. |
| Bowsprit | z −22 to −36 | rising 6 to 10 | Used in Chapter 3. |
| The fleet | 11 ships 150–600 m around, in two loose columns | — | `dutch_ship_large_01`/`_02`/`_medium` assets. The *Griffon* sits further out at (420, 0, 300) under a white Bourbon ensign. |
| Florida coast | a low sand-coloured strip at x −1500 | — | Visible from day 3. |

**Days.** The chapter runs as three days and one night, each opened by a banner: *24 July*, *26 July*, *28 July*, and *29 July · night*. The sky changes with them. Days 1 and 3 use `clear-sky`. Day 5 is `afternoon-sky` with a copper tint, and the night is `night-sky`. The swell's height grows from 0.3 to 1.6 m across the days (visual only).

## Objectives and critical path

1. **24 July.** Meet Ubilla on the quarterdeck. Count casks for Anselmo in the hold and find Lalo. Take Lalo to Inés. At noon, wind the Queen by the stern route (puzzle 1).
2. **26 July.** Heave the log (puzzle 2) and box the compass (puzzle 3). Captain Daire comes aboard; choose whether to warn him.
3. **28 July.** Find three of the five storm signs (puzzle 4). Go with Inés to Ubilla. At sunset climb to the maintop (set piece). Wind the Queen again, in a heavier swell.
4. **29 July, night.** The promise on the poop deck, which leads to Chapter 3.

## Optional areas

- The crosstrees at 30 m, with a journal page.
- The topgallant yard at 36 m, with a journal page (needs double jump).
- The hold's dark corners, which are lit for lantern holders.
- Old Tomé the caulker's stories.

## Puzzles

**1. Winding the Queen** (stealth traverse, twice). Four officers on the poop take the noon sight with **backstaffs**. A backstaff is used with your back to the sun, so while they sight they face the bow. The cycle is fixed and tick-driven:
- 5 s sighting: safe;
- 3 s turned around to write in the log, facing the stern rail: danger.

Exposed parts of the route are marked zones; the walkway under the gallery overhang is always safe. Standing in an exposed zone during the danger window shows the toast "An officer squints at the stern. You flatten against the carving." and puts the player back at the taffrail. On the second winding (28 July), spray gusts (wind zones pushing aft at 5 m/s for 1 s in every 3) sweep the scroll ledge.

Inside the strongroom the casket hangs in a gimbal cradle. Interacts:
- **Wind**, pressed repeatedly. On the eighth press the toast reads "The key pushes back against your fingers, firm as a handshake." A ninth press gives "A small hard click. You stop at once." and sets `dh.overwound`, which only changes flavour lines.
- **Brass shutter:** "A little brass door with its own keyhole. Your key doesn't fit." (A fair clue: a window onto a dial.)
- **Listen:** "Cork and oak. If anything inside is singing, it sings very quietly."

**2. The Log-Line.** Interact with the reef at the taffrail. The log chip splashes, and red rag knots on the line run out past the rail at the ship's speed while Inés turns a 28-second glass, scaled to 14 s of play. Three knots pass. The answer is **3** (offered: 3, 4 or 5).

**3. Boxing the Compass** (movement). The bosun calls eight points, and the player steps on each stud in order around the rose: North, North by East, North-north-east, North-east by North, North-east, North-east by East, East-north-east, East by North. A wrong stud makes the bosun laugh and restart the calls. The time is recorded as `compass`. **This teaches the Chapter 5 cipher key: counting from North, each point is a number (N = 0, N by E = 1, … 31).**

**4. Storm Signs** (find 3 of 5). Interacts:
- **Swell**, at the bow rail: "Long, slow hills of water roll under the bow from the south-east. With the bosun's half-minute glass you count one crest every twelve seconds. No wind made these. Not here."
- **Sky**, at the maintop: "High, thin streaks fan out of the south-east like the tails of white horses."
- **Glass**, in Inés's cabin: "The quicksilver has dropped a finger's width since breakfast."
- **Birds**, at the forecastle rail, with bird particles streaming west: "Frigatebirds and boobies by the dozen, all flying west towards the land."
- **Old Tomé** (dialogue, below).

The objective counts up to "(3/3)".

## Encounters and set pieces

- **The stern route**, outside the hull with the sea four metres below.
- **The masthead at sunset.** From the maintop the whole fleet lies spread on a copper sea, with the swell lines marching out of the south-east and the *Griffon* a white fleck far to the east.
- **Ubilla's decision**, in the great cabin.

## Collectibles and codex

**Journal pages:**
1. Inés's desk (day 1): "Day 1 at sea. G. sleeping well. Rate since Havana: gaining one second in three days. If she keeps this, God help the English."
2. The crosstrees: "From up here the fleet looks like a sentence written on the sea. I keep wanting to correct its spelling."
3. The topgallant yard: "Lázaro asked whether the rubies sing. I said yes. I have told more lies on this voyage than in ten years in Seville. Each one weighs about a pound."

**Codex:**
- *The Flota* (maintop): Spain's convoys carried American silver home. Wartime had kept them in port for years, so the 1715 fleet was carrying the backlog.
- *Ubilla and Echeverz* (great cabin): commanders of the Nueva España and Tierra Firme ships, sailing together under pressure to deliver.
- *The Griffon* (Daire): the French ship sailing with the fleet. On the night of the storm it was further offshore, and it reached Europe.
- *The Log-Line* (puzzle 2): a knot passing in the glass means one nautical mile an hour. Hence "knots".
- *Boxing the Compass* (puzzle 3): reciting all 32 points in order, the first exam of every ship's boy.
- *Signs of a Hurricane* (puzzle 4): long swell, high cirrus, a falling barometer, birds heading for land, heavy air.
- *The Longitude Problem* (the log lesson): without a way to keep the time of home at sea, ships guessed their east–west position. Spain offered a prize in 1598 and Britain in 1714. Neither had been won.

## Dialogue

### 24 July: the quarterdeck

*Banner: "NUESTRA SEÑORA DE REGLA", "24 July 1715 · the Florida Straits".*
**Ubilla:** "So this is the assistant. The cosmographer tells me you have no country."
**Ubilla:** "Good. We have too many countries aboard already: Seville, Cádiz, the Basque coast, and a Frenchman two cables to starboard, all of them sure they know the weather."
**Ubilla:** "Keep out of the sailors' way and in the cosmographer's. If you see fire, shout. If you see a sail you don't know, shout louder."

> **Ask (Ubilla):** "Any questions, apprentice?"
> 1. "Why sail so late in the season?" → **Ubilla:** "Because the King has waited three years for this silver, and the King's patience is the one weather no captain can outrun." / "We'll keep close to the coast and run north with the current. God willing, we'll be past the Bahamas before anything is born out there."
> 2. "What's in the Queen's casket?" → **Ubilla:** "Rubies, I'm told. I'm also told not to ask. I've grown very good at not asking."
> 3. "No, sir." → **Ubilla:** "Then we'll get along."

**Inés:** "Don Anselmo needs hands below. Be so good as to give him yours. Mind the ladders: this ship was built for people with longer legs."

### The gun deck and the hold

**Anselmo:** "Honoured Flotsam, thank God. I must count the water casks in the hold, and the hold is full of rats and dark, and the sea is on the other side of the planks."
**Anselmo:** "Forty-eight casks, says the registro. Count them for me? I'll stand here and be brave in your direction."
*Objective: "Count the water casks in the hold." A trail of cocoa dust leads to the cacao sacks. A cough comes from among them, and interacting with the sacks reveals Lalo.*
**Lalo:** "Don't scream! It's me! I'm not here!"
**Lalo:** "I wanted to see Spain. I have twelve maps of Spain, all different. I need to know which one's right."

> **Ask (Lalo):** "You won't tell her, will you?"
> 1. "I have to tell Inés." → **Lalo:** "She'll kill me. Then she'll make me a cabin boy, and that's worse."
> 2. "Come and tell her yourself." → **Lalo:** "Together? You go first. You're bigger."

**Inés** (at her cabin door): "Lázaro."
**Lalo:** "Doña Inés. What a surprise. On a ship. In the sea."
**Inés:** "You stowed away on the flagship of the Nueva España fleet, with the King's silver aboard, and the Queen's… jewels. Do you know what they do to stowaways?"
**Lalo:** "Make them cabin boys?"
**Inés:** "They make them cabin boys." *(a sigh)* "You'll fetch, carry and fill the lamps. And if you drown, I will never forgive you."
**Lalo:** "Yes, Doña Inés!"
**Anselmo** (on the player's return): "Forty-eight?"
**Lalo** (from the ladder): "Forty-seven and a boy. I was sitting on one."
**Anselmo:** "I'll write down the casks. I'll pretend I never heard about the boy. Two kindnesses in one day. I'm exhausted."

### Noon: the first winding

**Inés** (her cabin): "Noon. The officers are on the poop with their backstaffs. You hold a backstaff with your back to the sun, so for a few breaths at a time they'll all be staring at the bow."
**Inés:** "The strongroom's stern port is unlatched. Over the taffrail, along the gallery, down the carving. Move while they're shooting the sun. Freeze when they turn to write."
**Inés:** "Eight turns. Stop when she pushes back."
*Objective: "Wind the Queen: reach the strongroom by the stern galleries."*
**Inés** (after the winding):

> **Ask (Inés):** "Well? Did she push back?"
> 1. "On the eighth turn." → **Inés:** "Good. Then she'll sleep well. So will I, for once."
> 2. "What exactly did I just wind?" → **Inés:** "A gift for the Queen. A singing box, if you must know, with rubies for eyes. Her Majesty likes music. Don't tell anyone. It spoils the surprise."
> 3. "I gave her a ninth turn." *(only if overwound)* → **Inés** *(a long look)*: "Then you'll never do that again, will you."

**Inés:** "Same time tomorrow, and the day after, until Cádiz."

### 26 July: lessons

*Banner: "26 July".*
**Inés** (at the taffrail): "Today, speed. Throw the log chip over the side. The line runs out with a knot tied every seven fathoms. Count the knots that pass before my glass empties."

> **Ask (Inés):** "How many knots ran out?"
> 1. "Three." → **Inés:** "Three knots. A walking pace, for a fleet worth half of Spain. The urcas are slow, and we wait for them."
> 2. "Four." / 3. "Five." → **Inés:** "Count the rags, not your hopes. Again." *(the log runs again)*

**Inés:** "Speed, times hours, along a course, is distance. That is dead reckoning: how ships guess where they are. 'Guess' is the important word." *Codex: the Log-Line; the Longitude Problem.*

**Bosun Ochoa** (by the rose): "Box the compass, landlubber. I call a point, you stand on it. Start at North and go round with the sun."
*Calls, one per correct step:* "North!" "North by east!" "North-north-east!" "North-east by north!" "North-east!" "North-east by east!" "East-north-east!" "East by north!"
*On a wrong stud:* **Bosun Ochoa:** "Ha! That's the cook's compass. From the top!"
*On success:* **Bosun Ochoa:** "Not bad. The Frenchman's cook couldn't do that."
**Inés:** "Thirty-two points. Count from North and every point is a number: North is nought, North by East is one, and so on round. Remember that. Some day it'll save your life, or at least your dignity."
**Inés:** "Here. Mine, from when I was learning. A navigator should carry one." *(Gives `dh-quadrant`, a cosmetic for the hand.)*

**Daire** (on the quarterdeck, newly rowed over): "Madame la Cosmographe! They tell me you carry a glass that predicts the weather. I carry a nose that does the same, and it's cheaper."
**Inés:** "And what does your nose say, Captain?"
**Daire:** "That the Spaniards cook with too much garlic. Otherwise, fair weather."

> **Ask (Daire):** "And you, the cosmographer's shadow: glasses or noses?"
> 1. "The sky's been too clean. Inés thinks something's coming." → `dh.daire = true` → **Daire:** "Too clean. Hm. My grandmother said that in Saint-Malo, and then the roof came off. Perhaps I'll keep the *Griffon* a little further out, where there's room to be wrong."
> 2. "I trust Inés." → **Daire:** "Loyal. Loyal is good. Loyal is not a barometer."
> 3. "I trust my nose." → **Daire:** "Ha! A colleague."

### 28 July: signs

*Banner: "28 July".*
**Inés:** "Something's wrong with the glass. Go and look at the world for me. Bring me three signs, or tell me I'm a fool. I'd prefer the signs."
*Objective: "Find three signs of the weather (0/3)."*
**Old Tomé** (the waist, caulking): "Feel that air? Soup. And look at the water: it's gone greasy." / "Forty years I've caulked ships. My knees know what's coming, and they're not happy about it." *(counts as a sign)*
*Optional, Old Tomé again:* "My cousin's wife sells mangoes in Havana. Don't touch them."

**Inés** (with three signs): "Three. A swell from a storm we can't see, and a falling glass. I'm going to the Captain-General. Come with me. Stand where he can see you: it reminds him there are other people on this ship."
**Ubilla** (great cabin): "Doña Inés. Your face is a weather report."
**Inés:** "A storm, my lord. A big one, south-east of us, and coming. Three days. Perhaps less."
**Ubilla:** "And what would you have me do? Turn back to Havana and tell the King his silver comes next year? Again?"
**Inés:** "Keep further from the coast. Give us sea room."
**Ubilla:** "The coast is our road. The current runs north along it, the fastest way past the Bahamas. If I go out to sea I lose the current and a week, and the governor and the King will both want to know why."

> **Ask (Ubilla):** "Well, apprentice? You have no country. Tell me what a man with no country would do."
> 1. "Turn back. Silver can wait. People can't." → **Ubilla:** "I've heard that said in Seville, by men who have never had to explain an empty treasury to a king."
> 2. "Stand further out to sea, like the Frenchman." → **Ubilla:** "The Frenchman answers to a merchant. I answer to God and the King, in that order, most days."
> 3. "Whatever you choose, sir, choose it soon." → **Ubilla:** "Ha. Yes. The only advice anyone gives me that is entirely correct."
> *(Each option then continues:)* **Ubilla:** "I'll double the lookouts. That much I can do without a letter."

**Inés** (outside the cabin): "He isn't a fool. He's a man with a letter from a king in his pocket, and it weighs more than the ship." *Codex: Ubilla and Echeverz; Signs of a Hurricane.*
**Inés:** "Noon again. Wind her. The sea's getting up, so mind the carving."

### Sunset: the masthead

**Lalo** (the waist, pointing up): "Come and see! Everything! From the top!"
*Climb to the maintop. Lalo is already there (a second NPC instance).*
**Lalo:** "I counted them. Eleven and the Frenchman. I'm going to draw every one, so nobody can ever say we weren't here."
*Codex: the Flota. The camera holds while the swell lines march out of the south-east.*

### 29 July, night: the promise

*Banner: "29 July · night". The poop deck, the great lanterns lit, the sea glassy and heaving.*
**Inés:** "Sit. No, not there: the lantern drips."
**Inés:** "My son was called Mateo. He was a ship's boy on the *Santa Clara*. In 1705 she struck Los Mártires, the reefs at the tail of Florida, because her pilot put her forty leagues west of where she really was."
**Inés:** "Forty leagues. Not a storm, not a pirate. A wrong number."
**Inés:** "So I've spent ten years making a right one."

> **Ask (Inés):** "If the sea takes me, will you finish the proof?"
> 1. "I promise." → `dh.promise = 'promised'` → **Inés:** "Don't promise things to the sea. Promise them to me. Thank you."
> 2. "I'll do what's right." → `dh.promise = 'right'` → **Inés:** "That's a better answer than mine would have been. Annoying, but better."
> 3. "Don't talk like that." → `dh.promise = 'hush'` → **Inés:** "You sound like Mateo. He told me off as well. He was usually right."

**Inés:** "You'll want to know what proof. If it comes to that, you'll know. I've written it all down."
*She tilts the weather-glass to the lantern.*
**Inés:** "Look at it. It's falling like a stone into a well."
*`dh.ch.2 = 'done'`. Travel to `dh-03-hurakan`.*

## What the player learns and earns

- **Learns:** speed by the log, the 32 compass points as numbers (needed in Chapter 5), the signs of a hurricane, and that "G." has a rate (another fair clue). Also why Inés does all this: Mateo, and a wrong number.
- **Earns:** Inés's Brass Quadrant (soulbound cosmetic, hand), the record `compass`, 7 codex entries and 3 journal pages.
- **Flags:** `dh.daire`, `dh.promise`, `dh.overwound`, `dh.ch.2`, `dh.codex.*`.

## Hook

A falling glass, a ship full of silver, and a woman who's just told a stranger the only thing she's never told anyone.
