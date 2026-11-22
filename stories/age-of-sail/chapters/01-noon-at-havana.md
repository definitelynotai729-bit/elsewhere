# Chapter 1: Noon at Havana

*World `dh-01-havana` · 22 July 1715, from morning to midnight · Act I · 30–40 minutes*

**In short:** The player is hauled out of the harbour, named, hired and handed a secret. Two people ask for help on the same night, and the answers matter for the rest of the voyage.

## Locations and layout

Axes: x is east, −z is north (towards the sea), y is up. The harbour water surface is y = 0, and the quay top is y = 1.2. Deep water is a splash zone that respawns the player at the last beacon, as in Glowcave.

| Area | Footprint (x, z) | Heights | Notes |
|---|---|---|---|
| Harbour water | x −40 to 400, z −400 to 200 | 0 | Translucent box; splash zone below 0.3. |
| Fishmarket Jetty | x 0 to 24, z 18 to 22 | 1.0 | Lalo's skiff (4 × 1.6 m) at (27, 0.3, 20). **Spawn** in the skiff at (27, 0.6, 20), yaw −90 (facing west). |
| Quay and street | x −16 to 0, z −110 to 60 | 1.2 | `stone-blocks`, bollards every 8 m, crate and barrel clusters. |
| Market plaza | x −46 to −16, z −6 to 22 | 1.2 | Eight awninged stalls at 3.2. Awnings A (−26, 3.2, 12) and B (−31, 3.2, 16) are bounce pads (power 19). |
| Warehouse W1 | x −40 to −28, z 6 to 20 | roof 6.5 | Flat roof. |
| Ermita de los Navegantes | x −44 to −30, z −8 to 4 | ridge 11 | Pitched nave (two ramps). Bell tower 4 × 4 at (−32, −6): ledge at 12.5, belfry at 17. |
| Inés's house | x −58 to −44, z −22 to −8 | azotea 12.2 | Locked street door with a sign at (−44, 1.2, −15). |
| The Sun Loft | x −53 to −48, z −17 to −12 | floor 12.2, roof 16.4 | Open arched loggia. Pinhole at (−50.5, 16.4, −14.5). Brass meridian line on the floor at x −50.5, z −16.8 to −12.2. Wall quadrant (r 1.5) on the south arch; desk and telescope. Outer stair to the roof. |
| Customs house | x −34 to −16, z −46 to −28 | floors 1.2 and 5.4, roof 9.6 | Fenwick's barred window at (−16, 2.0, −40). Office upstairs. Skylight at (−24, 9.6, −36). Crates at (−15, 1.2, −31) lead to the balcony (5.4), with a drainpipe climb volume above. |
| Real Fuerza | x −40 to −8, z −100 to −70 | walls 8 | Moat (a splash zone) and an east gate. NW tower at (−38, −98) with a spiral ramp to 22; the Giraldilla stands at 24. |
| Fleet Wharf | x 0 to 20, z −62 to −56 | 1.0 | The longboat. Anselmo's desk at (4, 1.0, −59). |
| La Punta fort | x −24 to −4, z −150 to −130 | walls 6 | **Capstan** at (−8, 1.2, −140): drum r 0.6, four bars, walking ring r 1.6–2.4. The chain runs east across the channel. |
| The Morro (backdrop) | x 250 to 340, z −200 to −120 | to 40, beacon 48 | Out of reach across the water. Gun flash and beacon. |
| The fleet | flagship at (90, 0, −20); four more at x 130 to 200 | — | `dutch_ship_large_01`/`_02` scaled to about 45 m. The English ship (`dutch_ship_medium`, red ensign) is at (60, 0, 60). |

**Sightlines.** From the spawn, the white Sun Loft is the tallest thing in the city except the Ermita tower and the fort's glinting weathervane: the goal is visible at once. From the Sun Loft roof (16.4 m) the player sees the fleet, the Morro and the harbour mouth. At night the Morro beacon and La Punta's lanterns mark the chain line.

**Theme.** `day-sky` until the procession, then `sunset-sky`, then `night-sky` (stars 0.6, the Morro beacon light). Music: root 57, lydian, 84 bpm, with `pulse` on by day and off at night.

## Objectives and critical path

1. The skiff scene with Lalo starts automatically. The player chooses an origin and is named Flotsam.
2. Follow Lalo along the quay. Wraxall greets the player at the Customs Jetty (zone at z −40), and Fenwick calls from his cell.
3. Inés's door is locked, so Lalo starts the **Rooftop Run**.
4. At the Sun Loft, mark noon and answer the two quadrant questions. Inés hires the player and gives them the straw hat.
5. Afternoon free roam. The procession starts when the player enters the Fleet Wharf zone, or after 6 minutes.
6. At the Fleet Wharf, Anselmo records the casket and Inés hands over the winding key.
7. Night. Wraxall's offer is required. Fenwick's verdict is optional; with no verdict, the chapter treats him as left.
8. At dawn, the longboat interact travels to Chapter 2.

## Optional areas

- **The harbourmaster's office**, via crates, balcony, drainpipe, roof and skylight (puzzle 3).
- **The Giraldilla tower:** a spiral ramp to 22 m, with a codex entry and the best view of the fleet.
- **The Ermita belfry:** three crates on the 12.5 m ledge lead up to 17 m and a journal page. With a glider, the belfry is a shortcut to the Sun Loft.
- **Market gossip:** three NPCs.

## Puzzles

**1. The Rooftop Run** (timed, soft fail). Lalo's "Go!" in the market at (−20, 1.2, 10) starts the clock. The bell rings at 150 s; par is 75 s. The route:
- an awning bounce up to the W1 roof (6.5);
- a crumbling plank bridge (0.6 s delay, 3 s respawn) from (−34, 6.5, 6) to the nave gable at (−36, 7, 4);
- up the nave ramp and along the 1 m ridge (11);
- a hop to the tower ledge (12.5);
- two laundry-pole platforms (0.8 m square at y 12.3, x −37 and −40.5, gaps of about 3.5 m), with a gust pushing south at 6 m/s for 1.5 s in every 4;
- the azotea (12.2) and the Sun Loft, which is the finish zone.

Beating the bell records `w.record('roofrun', t)` and awards the title **Ahead of the Sun**. Arriving late gives Inés's "late" lines and the banner "The next day, at noon" (`dh.late`); nothing is lost.

**2. The Meridian Line and the Quadrant.** A sun spot (a glowing disc, 0.25 m) crosses the floor west to east at 0.05 m/s. Press F at "Mark noon" while the spot's centre is within 0.06 m of the brass line, a window of about 2.4 s, checked in `tick` from a tick-driven position. A miss restarts the spot after 20 s. Two `w.ask` questions follow:
- The sun's height: the plumb line hangs at **87°**.
- The latitude, by the rule Inés says aloud: 90 − 87 + 20 = **23° N**.

A wrong answer gets a hint, and the question repeats.

**3. The Harbourmaster's Office** (optional stealth). Don Bernabé naps "from one to three", which covers the whole afternoon free roam. Six pale planks (zones of 0.9 × 0.9 m) creak, playing `click` and the toast "A board creaks. Don Bernabé snorts." The third creak wakes him ("¡Ladrón! Out!"): the player is put back on the street at (−12, 1.2, −40) and the count resets. The hook gives `dh-cell-key` and the open strongbox gives `dh-commission`. The exit is the balcony window.

**4. The La Punta Capstan** (only to free Fenwick). A sentry's lantern beam (a 60° cone, 10 m long, turning about (−14, 1.2, −140) once every 12 s) sweeps the yard. Walk the ring around the drum (radius 1.6–2.4, `setSpeed(0.5)`) while `tick` adds up the angle. Three anticlockwise turns lower the chain. More than 0.4 s in the beam resets the turns, with the toast "The lantern swings your way. You freeze in the shadow." When the chain drops, Fenwick's pinnace crosses on a mover from (−10, 0, −120) to (60, 0, −170) at 4 m/s.

## Encounters and set pieces

- **Out of the harbour:** a burst of bubbles at the skiff, `w.shake(0.3)`, and a harbour full of masts.
- **The Rooftop Run** against the noon bell.
- **The Procession** at dusk. Soldiers, a priest and four bearers carry the casket (an oak box 0.7 × 0.5 × 0.45 m with brass corners and a cork jacket, on poles) from the fort gate to the Fleet Wharf, through a torchlit crowd, to a drum. Built with `w.avatar` figures moved along a tick-scheduled path in `frame`; it's visual only.
- **The nine o'clock gun:** a flash on the Morro, `w.shake(0.4)`, and the chain rising to y 0.4.
- **Fenwick's escape:** a night run along the quay, the capstan and the pinnace slipping over the chain.

## Collectibles and codex

**Journal pages (Inés):**
1. Sun Loft desk: "Noon tells you where you are. The hour at home tells you who you are. A navigator needs both, and has only the first."
2. Ermita belfry: "Mateo would be twenty-two. He used to climb the Giralda in Seville to watch the ships. I told him a navigator's place is below decks with the charts. I was wrong about where he'd be safe."
3. La Punta yard: "Cork-lined, sealed, gimballed. If she must swim, she will swim, and stay upright while she does it. I am building for a shipwreck. One does."

**Codex** (each sets `dh.codex.<id>`):
- *Havana, 1715:* the harbour every silver fleet must pass; after the nine o'clock gun, a chain is drawn between the Morro and La Punta.
- *The Giraldilla:* the fort's bronze weathervane, said to be Inés de Bobadilla, who watched the sea for Hernando de Soto. He never came back.
- *The Peace of Utrecht:* 1713. Privateers' commissions die with the war, and Britain wins the Asiento, the right to sell 4,800 enslaved Africans a year into Spain's colonies.
- *Letters of Marque:* a licence to seize enemy ships in wartime. With one, a raider is a privateer; without, a pirate.
- *Latitude by the Noon Sun:* latitude = 90° − the sun's noon height + its declination, taken from an almanac.
- *The Meridiana:* a roof pinhole throws the sun onto a north–south brass line, and the crossing marks local noon.

## Dialogue

`Ask` blocks are `w.ask` calls, and every option lists what it does. Speaker names are the `w.say` names.

### The skiff (on spawn)

**Lalo:** "Breathe! Breathe! There. You're breathing. I'm a genius."
**Lalo:** "You came up right under my skiff like a cork. No ship, no plank, nothing. Just you and a lot of bubbles."
**Lalo:** "Lázaro Quintana. Everybody says Lalo. I fish, I run errands, I sell maps. You owe me a fish: you scared it off."

> **Ask (Lalo):** "So where did you come from?"
> 1. "From Elsewhere. A place where every road meets." → `dh.origin = 'elsewhere'` → **Lalo:** "Every road? I'll draw it. A big knot of roads with a whale in the middle."
> 2. "I don't remember." → `dh.origin = 'forgot'` → **Lalo:** "The sea does that. Old Chepa forgot her husband's name for a whole week after the squall of '07. Then she remembered, and wished she hadn't."
> 3. "From a ship. A big one." → `dh.origin = 'ship'` → **Lalo:** "Which one? There's forty in the harbour. Never mind. You've got the face of someone who isn't going to tell me."

**Lalo:** "No papers either. No hat. No name? Then you're flotsam: things that float in from nowhere. Flotsam! That's your name now."
**Lalo:** "And flotsam belongs to whoever finds it, so technically you're mine. Don't worry. I'm a generous owner."
**Lalo:** "Come on. The Cosmógrafa pays half a real for anything strange the sea brings up, and you're the strangest thing I ever caught."
*Objective: "Follow Lalo to the Cosmógrafa's house." (Lalo's NPC reappears at fixed stops: the Customs Jetty, then Inés's door.)*

### The quay

**Wraxall** (zone at the Customs Jetty; he stands at (−4, 1.2, −42)): "Good morning. Forgive me: you're dripping on the King's quay."
**Wraxall:** "Jasper Wraxall. A passenger on the English permission ship, and a student of the sea in a small way."
**Wraxall:** "You came out of the water a quarter of an hour ago by my watch, with nothing in your hands and no ship in sight. Exactness is a hobby of mine."

> **Ask (Wraxall):** "Where did you spring from, my friend from nowhere?"
> 1. "Nowhere you've charted." → **Wraxall:** "Then I shall have to chart it. Good day."
> 2. "Mind your own business." → **Wraxall:** "Business is exactly what I mind. Good day."

**Lalo:** "English. They're everywhere since the peace. They buy everything and smile as if they've already paid."

**Fenwick** (zone at his cell window): "Psst. You. Yes, the damp one."
**Fenwick:** "Absalom Fenwick, captain of the sloop *Small Mercy*, lately of Bristol, Port Royal and, regrettably, this cell."
**Fenwick:** "I am charged with piracy. I plead privateer. I hold a commission from His Excellency the Governor of Jamaica, granted in good faith in the year 1711."
**Fenwick:** "Whereas the Queen made peace with Spain in 1713, and notwithstanding that nobody told me, I am now a pirate by act of parliament. They made me a pirate with a quill."

> **Ask (Fenwick):** "Will you hear a modest proposal?"
> 1. "I'm listening." → **Fenwick:** "My commission lies in the harbourmaster's strongbox, upstairs. The key to this establishment hangs on his hook. He sleeps from one o'clock to three, like a Christian." / "Bring me either and I'll owe you. Bring me both and I'll owe you extravagantly." → *Optional objective: "Fenwick wants his commission and the cell key from the harbourmaster's office." Codex: Peace of Utrecht.*
> 2. "Not now." → **Fenwick:** "Time is the one thing I have in quantity. Come back."

**Lalo:** "He's been in there a week. He talks like that to the rats too. They like him."

### Inés's door

*Sign (on the door):* "NO VISITS BEFORE NOON. NOR AFTER. — I. ABARCA"
**Lalo:** "She's on the roof. She's always on the roof at noon, and the sun's nearly at the top. Over the roofs, we'll catch her before the bell."
**Lalo:** "Up the awning, over the warehouse, along the church, across Chepa's washing. I've done it a thousand times. Twice."
**Lalo:** "Ready? Go!" *(Timer starts. Objective: "Reach the Sun Loft before the noon bell.")*

### The Sun Loft

*On arrival before the bell:* **Inés** (back turned): "You're early. Nobody is early. Stand there, and don't breathe on the line."
*On arrival after the bell:* **Inés:** "You're late. The sun is never late. Tomorrow, then." → banner *"The next day, at noon"*, sets `dh.late`.

**Lalo** (a second Lalo NPC, shown here from now on): "What took you? Doña Inés, I've brought you something!"
**Inés:** "Lázaro. What is it this time? Last week it was a shoe."
**Lalo:** "Flotsam! Came up under my skiff. No ship, no papers. Strange enough for half a real?"
**Inés:** "For half a real I could buy a stranger shoe." *(She looks at the player.)* "Hm. Steady hands. Wet, but steady."
**Inés:** "Be so good as to stand by the brass line. When the light crosses it, it is noon here, wherever here is. Tell me the moment."
*Objective: "Mark noon when the sun spot crosses the brass line (F)."*
*On a miss:* **Inés:** "Gone past. The sun is patient, and so am I, nearly. Watch it come round again."
*On success:* **Inés:** "Noon. Now we know when we are. Next, where. Read me the sun's height off the quadrant's plumb line."

> **Ask (Inés):** "How high is the sun?"
> 1. "Eighty-seven degrees." → **Inés:** "Eighty-seven. Nearly overhead. In July in Havana, a man's shadow hides under his hat."
> 2. "Seventy-seven degrees." → **Inés:** "Look again. Count up from the bottom of the arc." *(asks again)*
> 3. "Three degrees." → **Inés:** "That's the distance down from the top. Turn it round." *(asks again)*

**Inés:** "Now the sum every pilot knows. Ninety, less the sun's height, plus the sun's lean. My almanac says the sun leans twenty degrees north today."

> **Ask (Inés):** "So where are we?"
> 1. "Twenty-three degrees north." → **Inés:** "Twenty-three. Havana. Which we knew, but now you know it the way a navigator knows things: by measuring." *Codex: Latitude by the Noon Sun; the Meridiana.*
> 2. "Thirty-three degrees north." → **Inés:** "Ninety less eighty-seven is three. Plus twenty. Again." *(asks again)*
> 3. "Thirteen degrees north." → **Inés:** "You subtracted the lean. The sun leans towards us in July: add it. Again." *(asks again)*

**Inés:** "Latitude is easy. Any fool with a quadrant and an almanac can find it. Longitude is what drowns people."
**Inés:** "The fleet sails the day after tomorrow, and I sail with it. I need a pair of hands that belong to no king."
**Inés:** "Lázaro says you have no papers and no flag. In this city that makes you a fugitive or a miracle."

> **Ask (Inés):** "Will you be my assistant for the voyage?"
> 1. "Yes." → *continues below*
> 2. "Why me?" → **Inés:** "Because the Spaniards will watch me, the English want to buy me and the French want to marry me. You, nobody owns. Yet." *(asks again)*
> 3. "Do I have a choice?" → **Inés:** "Always. But only one good one." *(asks again)*

**Inés:** "Good. Measure twice. Pray once. Wages: a real a day, a hammock, the finest instruction in the Indies, and a hat. The sun here is personal." *(Gives `dh-straw-hat`; toast "Havana Straw Hat: wear it in any world.")*
**Inés:** "Tonight the Queen's rubies go aboard the flagship. You'll see them carried past. Don't stare. Everyone else will."
**Lalo:** "Rubies for the Queen! As big as eggs, they say. Doña Inés is taking them to Spain herself."
**Inés:** "As big as eggs. Lázaro, go and sell someone a map."
*Objective: "Explore Havana. At dusk, meet Inés at the Fleet Wharf." Sets `dh.hired`.*

### Inés in the afternoon (the Sun Loft)

**Inés:** "Questions? Ask quickly. I charge by the minute, and I've stopped the clock."

> **Ask (Inés):** "Well?"
> 1. "What are the rubies, really?" → **Inés:** "Jewels for Her Majesty, a gift of the city, in a casket I built so they would survive the voyage. Rubies dislike damp. So do I." *(asks again)*
> 2. "Why do you watch the sea?" → **Inés:** "Havana already has one Inés who watched the sea. The Giraldilla on the fort is meant to be her. I watch it for different reasons. Mine isn't coming back either." *(asks again)*
> 3. "Who is the Englishman?" (if Wraxall was met) → **Inés:** "Mr Wraxall. Three times, politely, he has offered to buy things of mine that are not for sale. Polite men who keep asking are the ones who count your spoons afterwards." *(asks again)*
> 4. "That's all." → **Inés:** "Then go and be useful somewhere I can't see you."

### Havana voices (optional)

**Doña Chepa** (fruit stall): "Mangoes! Don't touch the mangoes. You, the wet one, you've touched the mangoes." / "The fleet's waited three years for this. My cousin's husband caulks the urca. He says it's too late in the season. Nobody listens to caulkers."
**Sailor** (on the quay): "Eleven sail and a Frenchman, silver to the gunwales. If the sea's in a good mood, we'll be in Cádiz by October."
**Soldier** (fort gate): "The tower's for the King's servants. Are you one? No? Then it's open to people who don't ask."
**Don Bernabé** (office door, while awake): "The harbour office is closed. It's always closed. Come back never."

### Dusk: the Fleet Wharf

*Banner: "THE QUEEN'S RUBIES", "Dusk". The procession arrives and the bearers lower the casket into the longboat.*
**Anselmo** (writing as he speaks): "Item: one coffer, oak and cork, sealed with the arms of the Casa. Contents: rubies, for Her Majesty the Queen. Weight: twenty-three pounds and some ounces."
**Anselmo:** "Note: the coffer to be carried upright and never inverted, at the request of the cosmographer."
**Anselmo:** "Ah. You'll be the new assistant. Anselmo Cuevas, escribano of the flota, at your service. I write everything down. It's a sickness."

> **Ask (Anselmo):** "Did you need something written, honoured Flotsam?"
> 1. "Twenty-three pounds of rubies?" → **Anselmo:** "It's a heavy casket: cork, brass fittings, the cosmographer's cleverness. I don't ask what I'm not paid to know. I only weigh it."
> 2. "Why must it stay upright?" → **Anselmo:** "Jewels in a velvet tray, I'm told. Turn it over and they spill. That's what I was told, and I wrote down what I was told."
> 3. "Nothing, thank you." → **Anselmo:** "Then I'll write that down too."

**Inés** (at the wharf's edge, low): "Listen, and don't nod. From tomorrow, every noon, you will wind the Queen."
**Inés:** "There's a brass square on the side of the casket, under a cap. Eight turns of this key, no more. When she pushes back, stop."
**Inés:** "Tell no one. Not Lázaro, not Anselmo, not the Captain-General. Especially not the Englishman."

> **Ask (Inés):** "Can you do that?"
> 1. "Wind the Queen?" → **Inés:** "Rubies like to be turned. It keeps them bright. Don't laugh. Can you do it or not?" *(asks again)*
> 2. "I can." → **Inés:** "Good." *(Gives `dh-winding-key`; toast "Winding key.")*

### Night: the gun and the offers

*Banner: "Nine o'clock". The Morro gun flashes, the chain rises and the theme turns to night.*

**Wraxall** (Fleet Wharf): "A fine show. They carried that box as if it held the Host."
**Wraxall:** "Let us be exact, you and I. I'll not insult you with a speech. I want two facts: which ship carries that casket, and how it opens. For those, twenty silver reales. Tonight."

> **Ask (Wraxall):** "Will you sell me two facts?"
> 1. "No. She's my employer." → `dh.wraxall = 'refused'` → **Wraxall:** "Loyalty. An expensive habit. I hope she pays you enough to keep it. Good night."
> 2. "The flagship. The key hangs on a chain at her neck." → `dh.wraxall = 'sold'`, gives `dh-english-purse` → **Wraxall:** "Exactness is always rewarded. I'll remember you, my friend from nowhere."
> 3. "Let me think about it." → sets `dh.wraxall.pending` → **Wraxall:** "Think by the morning tide. I'll be here." → *Optional objective: "Decide on Wraxall's offer, or tell Inés."*

**Inés** (Fleet Wharf, at night, with the pending option): "You've a face like a man holding a hot coal. What is it?"

> **Ask (Inés):** "Well?"
> 1. "Wraxall wants to know where the casket is." → **Inés:** "Does he." *(a pause)* "Then let's be generous. Tell him it's aboard the *Urca de Lima*, in the purser's bread room, and the key is baked into a loaf." / "No, leave out the loaf. Men like him only believe dull lies." → *Objective: "Tell Wraxall the lie."*
> 2. "Nothing." → **Inés:** "Then put it down before it burns you."

**Wraxall** (after the lie): "The urca. Hm. A dull ship for a bright box. Here are your reales." → `dh.wraxall = 'told'`, gives `dh-english-purse`.
*If the chapter ends with the offer still pending, `dh.wraxall = 'refused'`.*

**Fenwick** (cell window, at night): "Evening, damp friend. The chain's up, the watch is drunk, and my crew is waiting behind La Punta in a boat that smells of turtle."
*If the player carries both items:* **Fenwick:** "The key *and* my commission? You magnificent person."

> **Ask (Fenwick):** "What's your verdict?"
> 1. "I'll let you out." *(only with `dh-cell-key`)* → `dh.fenwick = 'freed'`, the cell door opens → **Fenwick:** "Whereas you have done me a kindness, I shall owe you one. Pirates keep their debts better than kings." / "But the chain's up. My boat can't get over it unless someone slacks it at the La Punta capstan." → *Objective: "Slacken the harbour chain at the La Punta capstan."*
> 2. "Here's your commission." *(only with `dh-commission`, which is taken)* → **Fenwick:** "Proof I was lawful once! Void as a sermon, and I shall frame it. I'll be tried as a gentleman." *(asks again, without this option)*
> 3. "Sorry. You're on your own." → `dh.fenwick = 'left'` → **Fenwick:** "A fair verdict, poorly reasoned. My crew will have me out by Michaelmas. No hard feelings. A few soft ones."

**Don Bernabé** (customs door, at night):

> **Ask (Don Bernabé):** "Well? It's late."
> 1. "The Englishman in your cell is planning to escape." *(only while Fenwick is caged and not yet judged)* → `dh.fenwick = 'reported'` → **Don Bernabé:** "Is he! Then he can do his planning in the Morro, under the rock. Gracias, stranger. The King thanks you. I thank you less loudly."
> 2. "Nothing." → **Don Bernabé:** "Then nothing, good night."

*Capstan done:* **Fenwick** (from the pinnace, as it clears the chain): "Counsel! You've the makings of a lawyer: you bent the King's chain and broke nothing! I'll see you again, at sea or in court!"

### Dawn, 24 July

**Lalo** (Fleet Wharf, too casual): "I'm not coming, Doña Inés. I have maps to sell. Lots and lots of maps."
**Inés:** "Good. Stay dry." *(to the player)* "Look at that sky. Too clean. In July, when the sky is this clean, something is sweeping it."
*Interact: "Board the longboat."* → `dh.ch.1 = 'done'`, title **Flotsam**, travel to `dh-02-flota`.

## What the player learns and earns

- **Learns:** latitude can be measured, longitude can't, and the "rubies" weigh 23 lb, must stay upright and need winding. These are fair clues to a mechanism.
- **Earns:** the title **Flotsam** (plus **Ahead of the Sun**), the Havana Straw Hat (soulbound cosmetic), the record `roofrun`, 6 codex entries and 3 journal pages.
- **Flags:** `dh.origin`, `dh.hired`, `dh.late`, `dh.fenwick`, `dh.wraxall`, `dh.ch.1`, `dh.codex.*`.
- **Items:** `dh-winding-key`, plus `dh-english-purse` if the player sold or told. The cell key and the commission are used up.

## Hook

A sky "too clean", a boy lying about maps, a casket that has to be wound, and an Englishman who knows exactly how long ago the player came out of the sea.
