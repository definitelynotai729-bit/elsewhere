# Chapter 5: Forty Breaths

*World `dh-05-wreck` · September 1715 · Act II · 30 minutes*

**In short:** The campaign's first dive. The player learns to free-dive with Rufina, gets inside the flagship's broken stern and comes up with Inés's chart case. By the fire that night the casket's secret comes out (**the midpoint reveal**), and then Tito is trapped in the bow.

## Locations and layout

Axes are as in Chapter 4, with x seaward. The surface is y = 0, and the sand bottom is y −9.

| Area | Where | Notes |
|---|---|---|
| The launch | anchored at (140, 0, 40) | A 6 m boat (deck at 0.6). Rufina's stone and line. An anchor-line climb volume runs down to the bottom. |
| **Dive volume** | x 110 to 200, z 0 to 140, y −12 to 0 | Dive rules apply inside it (below). |
| *Regla* stern section | z 28 to 52, lying 30° to port on the reef | The low (port) side rests at −9 and the high (starboard) side reaches −1. Entries: the shattered stern windows at y −4 and a hull breach at (156, −2, 36). |
| Gun deck (inside) | a sloped corridor 2.5 m high | Guns, scattered silver (decoration), silt. The moray lives in a gun mouth at (152, −6, 44). |
| Strongroom | aft | The empty gimbal cradle, its pivots torn. **Air pocket A** is in the upper corner. |
| Inés's cabin | starboard, high side (−3) | A cabinet pinned under a fallen beam. The chart case is inside. |
| Great cabin | under the old poop | **Air pocket B**, overhead, refills breath. Lost Things. |
| Main hatch shaft | from the gun deck up through the hull side to the surface | A bubble column (upward wind, 9 m/s) for the escape. |
| Bow section | around (170, −6, 120) | Broken in three. Tito's cavity at (172, −7, 124) has a 1 m air pocket. Openings at three sides. |
| Beach camp at night | as in Chapter 4, part 2 | A fire at (−20, 2, 30) and Lalo's compass rose drawn in the sand (radius 3 m). |

**Dive rules** (world code; BUILD feature 4):
- inside the volume, `setSpeed(0.6)`, plus an upward push each tick that leaves a net gravity of 12 m/s² (a floaty jump of about 5 m);
- blue fog from 4 to 28 m, and bubble particles from the player;
- a **breath counter** of 40 counts, one count every 0.75 s, shown with `w.objective` as "Breath: 40";
- air pockets refill it; the moray costs 5 counts and a push;
- at 0 the toast reads "You claw for the light." and the player respawns at the last air pocket or beacon;
- going up the anchor line or a bubble column to the surface refills the counter.

## Objectives and critical path

1. Lesson at the launch: a practice dive to touch the sand and come back up (puzzle 1).
2. Dive to the stern and enter by the breach or the windows.
3. Strongroom: find the empty cradle (a clue) and air pocket A.
4. Inés's cabin: strike the jammed beam (the loaned diving knife does it in three blows) and take the chart case.
5. The swell rolls the wreck: escape through the hatch bubble column (set piece).
6. That night by the fire: the reveal and the cipher (puzzle 2).
7. Next morning: Tito's knocks from the bow. Rescue him (puzzle 3).
8. Merino on the beach, then the news from Salmón. Travel to Chapter 6.

## Optional areas

The great cabin (air pocket B, two Lost Things, a journal page); the gun deck's far end (Lost Things); the **Forty Breaths** challenge.

## Puzzles

**1. Learning to Dive.** Rufina: dive, touch the sand marker at (140, −9, 44), climb the anchor line back up. The second attempt is timed against her "forty".

**2. The Nest Cipher.** The chart case holds Inés's note: *"The nest, by my own reckoning. Latitude: NNE, E by N degrees; NNE, N by E minutes. From Havana's noon: N, NE degrees east; N, NNE minutes."* Counting compass points from North (N = 0, N by E = 1, NNE = 2, NE by N = 3, NE = 4, NE by E = 5, ENE = 6, E by N = 7), it decodes to **27° 21′ N, 4° 02′ east of Havana**.
- With `dh.saved = 'journal'`, the journal's last page carries Inés's "compass alphabet" table, which is shown as a sign when the note is read.
- Without the journal, the player must remember Chapter 2's lesson. Lalo's sand rose helps: interacting with a stud shows its name only.

> **Ask (the note):** "The latitude?"
> 1. "27° 21′ north." → correct.
> 2. "72° 12′ north." → "That's the Arctic. Check the order."
> 3. "38° 32′ north." → "Count from North as nought, not one."

> **Ask (the note):** "From Havana?"
> 1. "4° 02′ east." → correct, sets `dh.isle`.
> 2. "40° 20′ east." → "That's Africa. One point is one number."
> 3. "2° 04′ east." → "Read them in order."

**3. Tito's Knocks.** From the launch the player hears the code learned in Chapter 4. Underwater, three-knock bursts repeat every 5 s, each marked by a puff of silt at the knock site and a toast ("Knock. Knock. Knock. Below you, to the right."). Of the bow's three openings, the right one is marked by the puffs. Inside:
- strike the pinning beam three times;
- share Tito's air pocket, which refills breath;
- follow him out.
The rescue sets `dh.tito`.

## Encounters and set pieces

- **Light shafts in the wreck:** the broken hull lets sunlight in in beams (thin glowing boxes at 0.15 opacity), drifting silt and silver glinting on the floor.
- **The Roll** (set piece). Taking the chart case starts it: `w.shake(2)`, a groan, then three crumbles that drop the gun deck's planking behind the player. Air pocket B shrinks (its zone is replaced by a smaller one, and the ceiling water visual lowers). The only way out is the main hatch: the player is pushed into the bubble column and ride it up through a curtain of silver flakes into daylight.
- **The Reveal by firelight.**
- **The Bow rescue,** dark and tight.

## Collectibles and codex

**Journal pages:**
1. Strongroom: "Proving log, 29 July. G. gaining 0.4 s a day. Heavy swell. If the cradle fails, the jacket won't."
2. Great cabin: "Mateo's drawing, which I carry everywhere: a swallow, badly drawn, with too many wings. He was six."
3. Bow site: "Larrue says the English Board is a committee, and committees do not meet. I say they'll meet when there is something on the table."

**Lost Things** 10–14: a bosun's whistle, a pair of spectacles, a small brass crucifix, a carved soldier, and a biscuit tin of letters.

**Codex:**
- *Salvage Divers:* the 1715 wrecks were worked by free divers and by enslaved divers sent from Havana, all diving without equipment in dangerous conditions for other people's silver.
- *Self-Purchase:* Spanish custom let an enslaved person buy their freedom. Later it became a formal instalment contract with a fixed price (*coartación*).
- *The Scilly Disaster, 1707:* four British warships were lost on the Isles of Scilly because their navigators misjudged their position. It's one reason Parliament acted on longitude.
- *Halley's Charts:* Edmond Halley mapped the Atlantic's winds (1686) and its compass variation (1701). Inés's case holds a copy.
- *Phantom Islands:* when no two charts agree on longitude, islands drift across the paper. Antillia, which gave the Antilles their name, and Bermeja were charted for centuries and never found.

## Dialogue

### The launch

**Rufina:** "Rules. One: I count in breaths. A breath is what you'd take sitting in the shade. You've got forty if you don't panic. Panic costs ten."
**Rufina:** "Two: the King's silver stays on the floor unless the King pays you to pick it up. Salmón pays me. You, he pays in soup."
**Rufina:** "Three: if I knock once, long, you go up. You don't ask why. Down, touch the sand, come back."
*After the practice dive:* **Rufina:** "You came up looking surprised. Everyone does the first time. The sea's bigger from inside."

> **Ask (Rufina):** "Again, faster, or are you done?"
> 1. "Again." → *(the timed practice)* → **Rufina:** "Better. You're not a fish, but you're not a stone either."
> 2. "Let's go to the wreck." → **Rufina:** "Brave. Or stupid. Same thing underwater."

**Rufina:** "Stern's that way, on her side. Go in by the hole on the high side. Air in the strongroom roof, and some in the great cabin. Moray in a gun. Don't put your hand in a gun." *(Gives the loaned diving knife, `dh-dive-knife`, a scoped blade.)*

### In the wreck (toasts)

- Strongroom: "The cradle hangs empty, its pivots torn out. The casket left in a hurry, upright."
- Inés's cabin: "Her cot. Her desk. A cabinet pinned shut by a fallen beam. Strike it."
- Chart case taken: "An oilcloth case, heavy and dry inside. The wreck groans around you."
- The Roll: "The whole hull shifts. Planking falls away behind you. UP. The hatch!"

### Topside

**Rufina** (hauling the player into the launch): "That noise was the stern rolling over. You were inside it. Most people don't come out of that."
**Rufina:** "You didn't panic. Here." *(Gives `dh-red-cap`, a cosmetic for the head.)* "Divers wear red so the boat can find them."
*If the player reached the cabin within the first 40 counts (Forty Breaths), Rufina adds:* "One breath. You did the whole stern on one breath. Tito will be furious." → title **Forty Breaths**.

### Night: the reveal

*At the fire, with Lalo, Rufina and Anselmo (who leaves early: "I'll write it down tomorrow when my hands stop shaking.").*
**Lalo:** "Open it! Open it!"
*Interact: "Open the chart case." A chart, a bundle of letter copies and a note.*
**Lalo:** "It's the same island three times! Look: Dutch, English, Spanish, all in different places. Which one's right?"
**Rufina:** "None, probably. Read the letters."
*Interact: "Read Inés's letter." It plays as **Inés's letter** (a `w.say` speaker name):*
**Inés's letter:** "To Monsieur Étienne Larrue, at the sign of the Dial, Greek Street, Soho. Havana, 1 June 1715."
**Inés's letter:** "The Swallow is finished. Two balances, linked so that the ship's roll pushes one as it pulls the other. Twelve rubies pierced in your London manner, so that she runs on stone, not brass."
**Inés's letter:** "She has kept Havana's noon for forty days within a breath a day. If she does the same across the ocean, a ship can carry the hour of its home port anywhere in the world, and longitude becomes arithmetic."
**Inés's letter:** "I have registered her as rubies for the Queen. Thieves understand rubies. Nobody steals a clock."
**Inés's letter:** "Your Parliament offers twenty thousand pounds. Our King's prize is older and smaller. I want neither as much as I want one ship to come home that would not have."
*Banner: "THE QUEEN'S RUBIES", "is a clock".*
**Lalo:** "A clock. The rubies, the soldiers, the Englishman: all of it for a clock?"
**Rufina:** "All this dying for a clock?"

> **Ask (Rufina):** "Well?"
> 1. "Not a clock. A way home." → **Rufina:** "A way home." *(a long breath)* "Then it's worth more than every ruby in the Queen's ears."
> 2. "A clock that tells you where you are." → **Rufina:** "Every captain on this sea would sell his mother for that. Some of them would sell mine."
> 3. "She lied to everyone." → **Rufina:** "Everyone lies about what they love. She lied well. Look how far it got."

**Lalo:** "If ships knew where they were, the sea would have killed fewer of us." *(quiet)* "I'm going to draw her. The Swallow. With the right number of wings."
**Rufina:** "And the Englishman knew. That's why he asked you in Havana. That's why his boat was out there in the rain."
*Then the note and the cipher (puzzle 2). On solving it:*
**Lalo:** "Twenty-seven twenty-one north, four degrees east of Havana. That's the Matanilla! That's where the box went!"
**Rufina:** "That's an island nobody can find, where your casket went, where nobody can get to. Good night."

### Morning: Tito

*From the launch, three faint knocks through the hull.*
**Rufina** (white): "That's Tito. Three knocks: found something. No. Listen. It's not stopping. He's stuck."
**Rufina:** "He's diving the bow for Merino. Go. I'll be right behind you. Go!"
*Inside the cavity, after the beam breaks:*
**Tito** (in the air pocket, gasping, grinning): "You found me. Lalo said you were a sea creature."
**Tito:** "Beam came down on my leg. I had this much air and a lot of time to think. I thought about carpentry."
*Topside:*
**Rufina:** "Faustino." *(She holds him far too tight.)* "Faustino. Never again. Never, never."
**Tito:** "You say that every time."

### Merino

**Merino** (on the beach, arms folded): "Faustino. You came up without the chest. The chest was the point."
**Merino** (to the player): "And you. You keep fishing my property out of holes."

> **Ask (Merino):** "Have you something to say?"
> 1. "He nearly died down there." → **Merino:** "He's insured. That's a joke. He isn't." / "Five hundred pesos. Final price."
> 2. "I'll remember you." → **Merino:** "Everyone remembers me. It's my one gift." / "Five hundred."
> 3. "Say nothing. Stand beside Tito." → **Merino:** "Hm. Five hundred. Not a real less."

**Rufina** (after Merino goes): "He raised it again. Five hundred. I have a hundred and twenty and a knife." *(a breath)* "Don't look at me like that. The knife's for diving."

### Salmón's news

**Salmón:** "A letter from Havana, by a fishing boat. English sloops are gathering at Jamaica under one Henry Jennings, with a commission from Governor Hamilton 'against pirates'."
**Salmón:** "Against pirates. There are no pirates here. There is silver here, and fifteen hundred tired people."
*If `dh.salmon = 'lie'`:* **Salmón:** "And my divers found the strongroom empty, its cradle torn. Rubies don't swim, you said." *(cold)* "Remember that I asked you once."
*If `dh.wraxall = 'told'`:* **Ochoa:** "And there's an English sloop been diving the *Urca* for a week. They've brought up nothing but bread." *(Lalo laughs until he cries.)*
*`dh.ch.5 = 'done'`. Travel to `dh-06-palmar`.*

## What the player learns and earns

- **Learns (midpoint reveal):** the Queen's Rubies is *La Golondrina*, a longitude clock. The rubies are its bearings. Wraxall knew. The isle stands at 27° 21′ N, 4° 02′ east of Havana.
- **Earns:** the Diver's Red Cap (soulbound cosmetic), possibly the title **Forty Breaths**, the record `cabin`, 5 codex entries, 3 journal pages and 5 Lost Things.
- **Flags:** `dh.isle`, `dh.tito`, `dh.lost.10`–`14`, `dh.ch.5`.
- **Items:** `dh-chart-case` (story item). The loaned `dh-dive-knife` is taken back.

## Hook

Everyone now has a reason to come to this beach. Jennings is coming for the silver, Merino has raised his price, and somewhere north-east, a clock nobody can find is waiting on an island nobody can find.
