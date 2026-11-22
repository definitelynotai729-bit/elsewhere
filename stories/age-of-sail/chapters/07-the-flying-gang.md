# Chapter 7: The Flying Gang

*World `dh-07-nassau` · February 1716 · Act III · 40 minutes*

**In short:** Nassau is a town of tents, a ruined fort and careened sloops. Inés is alive. To win a ship, the player has to win votes, and in the process sees how pirates govern themselves, and what they don't say out loud.

## Locations and layout

Axes: x is east, −z is north (the harbour), y is up. The shore is at z = 0, and Hog Island lies 300 m north across the water.

| Area | Footprint | Heights | Notes |
|---|---|---|---|
| Harbour | z −340 to 0 | water 0 | About fifteen sloops at anchor. The *Restitution* lies off Hog Island at (−120, 0, −260), visible but out of reach. Hornigold's sloop is at (80, 0, −120). |
| Landing jetty | x −4 to 4, z −30 to 0 | 1.0 | Arrival point. |
| Beach | x −200 to 200, z 0 to 40 | 0 to 1.5 | Sand, flotsam, upturned boats. |
| **Careening beach** | x −180 to −80, z 0 to 30 | | The *Small Mercy* lies hauled over on her side, keel to the sea. Her exposed bottom is a 40° hull ramp rising 10 m, with six weed patches (interacts) at heights from 2 to 9 m. Careening tackles run from her masthead to a palm and are climb volumes. A second careened sloop beside her is decoration. |
| Bonfire | (−40, 1, 20) | | Where the night vote is held. |
| **Knot Yard** | x −70 to −50, z 40 to 60 | 1 | A rope walk with six posts: E (the end), L (the loop, a ring on the ground), T (the tree), P (the spar), B (the bight) and U (the tuck). A chalk board shows each knot's diagram. |
| Tent town | x −80 to 60, z 30 to 90 | | Sailcloth tents and cookfires. The **punch house** is a big tent with a plank bar at (10, 1, 60). |
| Market of plunder | stalls at (40, 1, 40) | | Goods from the salvage raid. The stallkeeper has Lost Things 20–24. |
| The silk-cotton tree | (90, 1, 75) | | A huge tree with an empty wooden platform beneath it. See *Handling the era's cruelties*. |
| Ruined Fort Nassau | (120, 6, 20), 40 × 30 m | walls 4 to 6 | Broken walls, rubble ramps and old guns. Hornigold sits on the north rampart. **Sundial** on the rampart at (130, 6.2, 8). |
| East point | (150, 1, 10) | | Uncle Asa mends nets by an upturned boat. |

**Theme.** Day uses `afternoon-sky` (bright, warm, fog 120–600). Night uses `night-sky` with a bonfire light. Music: root 57, mixolydian-like (use `major`), 96 bpm with `pulse` by day; at night, root 50, dorian, 72 bpm.

**Arrival by `dh.raid`.** Alarm: from the Bermudian turtler at the jetty. Boats: from the *Small Mercy*'s boat, with Sunday. Parley: from Jennings's sloop, with Jennings's farewell.

## Objectives and critical path

1. Arrive and pay respects to Hornigold at the fort (Lalo insists).
2. Lalo finds **Inés's bottle** below the fort.
3. Find Wraxall in the punch house and hear his offer.
4. Meet Sunday at the careened *Small Mercy* and learn the vote rules.
5. Win votes: the Knot Yard, the hull and the fair split (puzzles 1–3).
6. At Nassau's noon, **set Inés's watch to Havana time** at the fort sundial (puzzle 4).
7. Night: the bonfire vote and the choice of terms.
8. Dawn: the *Restitution* weighs anchor. Sail, which leads to Chapter 8.

## Optional areas

Uncle Asa's tale of the Lusca, the market's Lost Things, the second bottle on the careening beach's tideline, the silk-cotton tree (with Sunday), and Hornigold's rampart view.

## Puzzles

**1. The Knot Yard** (movement, recorded). The rope starts at post E. A visual line follows the player and adds a segment at each post touched (a zone of radius 0.8 m). Walk the posts in the right order for each knot. A wrong post makes the rope "spill", and the knot resets.
- **Bowline:** E, L (up through the hole), T (round the tree), L (back down the hole).
- **Clove hitch:** E, P, U, P, U (round the spar, cross, round again, tuck).
- **Sheet bend:** E, B, U, B, U (up through the bight, round behind it, under itself).

Each finished knot adds a segment to a knot board. All three under the 45 s par earns the title **Knot-Master**. Finishing them wins **1 vote** (Bosun Pike).

**2. The Hull.** Scrape the six weed patches on the careened hull by interacting at each. Four are reachable by running up the 40° hull ramp and two only from the careening tackles (climb volumes). Gusts push down the slope for 1 s in every 4. **1 vote** (Pease the cook, who also caulks).

**3. The Fair Split** (judgement). Hob, a young topman, lost two fingers in the last fight. Pease says the articles pay for "limbs", not fingers. Sunday reads article 8 aloud: *"For the loss of a finger or an eye, one hundred pieces of eight."*

> **Ask (Sunday):** "Your ruling?"
> 1. "Two fingers, two hundred pieces of eight. The articles say so." → **1 vote** (the crew thumps the barrels).
> 2. "A finger isn't a limb. Nothing." → no vote. Hob walks off.
> 3. "Split the silk between them and call it even." → no vote. **Sunday:** "That's what captains say when they don't want to read."

**4. Havana's Hour.** The margin of Inés's chart reads *"Nassau: 5° 02′ east of Havana. Twenty minutes and eight seconds of time. Four minutes to the degree. Never forget which way."* At the fort sundial, the shadow shortens towards noon on a tick-driven arc. Interact "Set the watch" while the shadow sits on the noon line (a 2 s window), then:

> **Ask (the watch):** "Set Havana's hands to:"
> 1. "Twelve o'clock." → "That's Nassau's noon, not Havana's."
> 2. "Twenty past twelve." → "Havana lies west. The sun reaches it later. Its clocks are behind."
> 3. "Twenty to twelve." → correct, sets `dh.watch`. Codex: Longitude by Time.

**Votes.** Knot Yard, hull and fair split give 1 each, plus 1 if `dh.fenwick = 'freed'`, for a maximum of 4 (`dh.votes`). The crew agrees to sail with 2 or more. If `dh.fenwick = 'reported'`, it takes 3 to overrule him.

## Encounters and set pieces

- **The careened ships:** sloops lying on their sides like stranded whales, with crews swarming over their bellies.
- **Inés's bottle:** Lalo reads it aloud, and his voice breaks halfway.
- **Wraxall's confession** in a canvas tavern full of loud men, the only quiet voice in it.
- **The bonfire vote:** fifty faces in firelight, and Sunday reading the articles aloud.

## Collectibles and codex

**Journal pages** (margins of Inés's chart case):
1. "Nassau, 5° 02′ east of Havana. Twenty minutes and eight seconds of time. Four minutes to the degree. Never forget which way."
2. "New Providence: a good harbour spoiled by men, or men spoiled by a good harbour. I've never decided."
3. "If anyone reads these margins: the Swallow's rate is in the log, in the casket. Trust the log, not me."

**Bottles:**
1. Inés's bottle, below the fort (critical; text below).
2. On the careening tideline: "Day 40 aboard. Mr W. reads me the Act at dinner. Twenty thousand pounds. I correct his Latin."

**Lost Things** 20–24 (market): a wedding ring, a pocket psalter, a fiddle bow, a christening cup and a carved whale tooth.

**Codex:**
- *Nassau and the Flying Gang:* by 1716, ex-privateers had made New Providence's harbour their base, protected by a shallow bar that kept out warships.
- *Benjamin Hornigold:* senior captain of the Gang, who refused to attack English ships. His crews later deposed him for it.
- *Pirate Articles:* written rules agreed by the crew: votes, shares, an elected quartermaster, and compensation for wounds.
- *Careening:* hauling a ship onto her side on a beach to scrape weed and worm from her hull.
- *Captives in Nassau:* pirate crews included free and self-freed Black sailors with full shares, and the same harbour also sold captured Africans.
- *The Lusca:* Bahamian folklore. A monster in the blue holes that breathes the sea in and out.
- *Bowline, Clove Hitch, Sheet Bend:* a loop that won't slip, a hitch round a spar, and a bend joining two ropes.
- *Longitude by Time:* the earth turns 15° an hour, so four minutes of time equals one degree of longitude.

## Dialogue

### Arrival

**Jennings** (parley path, on his gangway): "Nassau. Every man here is a pirate except the ones who are worse. Mind your purse, go-between."
**Lalo:** "Everyone says go and see Hornigold first or he takes it personally. Come on. He's in the fort. It's not really a fort any more. It's more of an idea."

### Hornigold (the north rampart)

**Hornigold:** "Another one off the wreck coast. Everybody's come off the wreck coast. Half of Nassau's walking around in Spanish shoes."
**Hornigold:** "Ben Hornigold. I take Spanish prizes and French prizes, and I don't take English ones, because I was English before I was anything else, and I've not decided to stop."
*If `dh.raid = 'parley'`:* **Hornigold:** "You're the one who walked the burning camp with a rag on a stick. Jennings has told it four times. It gets longer every time."

> **Ask (Hornigold):** "What d'you want, youngster?"
> 1. "An Englishman named Wraxall." → **Hornigold:** "In the punch house, buying men. Polite. Pays in coin, not promises. Came in a week ago on the *Restitution* with a lady aboard who complains about the coffee."
> 2. "A ship." → **Hornigold:** "Then you want votes, not ships. Ships go where the votes go."
> 3. "Nothing. Just paying respects." → **Hornigold:** "Good. Respect's the only thing in Nassau nobody's stolen yet."

### Inés's bottle

**Lalo** (wading into the shallows below the fort): "A bottle! Sealed. There's paper inside." *(He breaks the wax and reads, slowly.)*
**Inés's letter:** "To whoever finds this. I am alive, aboard the English sloop *Restitution*. I am sailing him in circles. Each noon I take the sun for him and lie by a degree. He believes the Matanilla moves. On paper it does."
*If `dh.wraxall = 'told'`:* **Inés's letter:** "When you come anyway, which you will, three lanterns in a row at the stern means I am ready."
*If `dh.wraxall = 'sold'`:* **Inés's letter:** "Someone told him where she was kept, and how she opens. I don't know who. I am trying not to think it was you."
*If `dh.wraxall = 'refused'`:* **Inés's letter:** "He says you refused his money. Good. Stay poor."
**Inés's letter:** "Don't come for me. Go for the Swallow. I.A."
**Lalo** *(his voice breaking)*: "She's alive. She's alive and she's lying to an Englishman about the sun. That's the most her thing she could possibly be doing."

### Wraxall (the punch house)

**Wraxall:** "My friend from nowhere. You look well for someone who drowned. Sit. The punch is criminal, but the chair is honest."
**Wraxall:** "Let us be exact. Your cosmographer is my guest. She is unharmed and rude. She has told me nothing, which I respect, and lied to me about the sun, which I'm beginning to notice."
**Wraxall:** "October 1707. I was a master's mate in Sir Cloudesley's fleet, eleven days blind in fog. I worked our longitude three times and got three answers. I told my captain we were east of our reckoning, that the Scillies lay ahead of us, not astern. He told me the admiral's master knew better."
**Wraxall:** "At eight that evening we struck. I spent the night on a rock listening to two thousand men find out who was right."
**Wraxall:** "They tell a story now that some sailor warned the admiral and was hanged for it. It isn't true. Nobody hanged me. They simply never gave me another ship."
**Wraxall:** "Her clock would have saved every one of them. I mean to see that no fleet is ever lost to guessing again, and to be the man who did it. Is that so wicked?"
**Wraxall:** "Bring me to the box, and I'll put her ashore unharmed, and you'll have half of twenty thousand pounds. Half, exactly."

> **Ask (Wraxall):** "Well?"
> 1. "Let Inés go first." → **Wraxall:** "When I have the box. Not before. Let us be exact."
> 2. "You want the credit more than the clock." → **Wraxall:** "I want both. Is that a crime? You've never been called a liar by two thousand drowned men."
> 3. "Never." → **Wraxall:** "Then we're racing. I prefer it, honestly. It's cleaner."

*If `dh.wraxall = 'sold'`:* **Wraxall** (as the player rises): "And you've taken my reales once already. I keep my accounts very neatly."

### Sunday (the careened *Small Mercy*)

**Sunday:** "Kwesi Mensah. They call me Sunday, because that's the day I was born, and the day I left the estate. Quartermaster of this sloop, by vote."
*Lines by `dh.fenwick`:*
- *freed:* **Sunday:** "The captain says you bent the King's chain for him. He says it every night. We are tired of hearing it. That is a compliment."
- *left:* **Sunday:** "The captain says you left him in a Spanish cell, and that it was fair. He says 'fair' the way other men say 'ouch'."
- *reported:* **Sunday:** "The captain says you are the reason he slept under the Morro for a month. He wants you nowhere near his ship. It is not his ship. It is ours."
**Sunday:** "The captain can't take this sloop anywhere the company won't vote for. You want her, you want votes. Votes come from people who've seen you work."

> **Ask (Sunday):** "Questions?"
> 1. "What work?" → **Sunday:** "Pike's knots. Pease's hull. And there's a quarrel over shares that nobody will judge because everybody's drunk. Judge it."
> 2. "Why do you follow articles and not a captain?" → **Sunday:** "On the estate, one man decided everything about me. Here, I decide one fiftieth of everything. It is a great deal more than nothing."
> 3. "I'll get to work." → **Sunday:** "Good. Talk is what we do after."

**Bosun Ezra Pike** (Knot Yard): "Three knots. Bowline, clove hitch, sheet bend. Walk the rope's path, post to post. Rabbit out of the hole, round the tree, back down the hole. Off you go, rabbit."
*After all three:* **Pike:** "You'll do. My vote's yours. Don't tell anyone I've got one; they'll want it."
**Pease** (the hull): "Weed, worm and barnacle. Scrape her clean, and I'll vote for you twice. I'm only allowed once, so I'll do it very loudly."
**Hob** (the fair split, holding up a bandaged hand): "Two fingers I gave for this company. Pease says fingers aren't limbs."
**Pease:** "I said the *article* says limbs. Read it."

### Sunday and the tree (optional, after any vote)

**Sunday** (walking the player along the beach to the silk-cotton tree and the empty platform): "Tomorrow there will be people on that. Taken off a Portuguese ship last month."
**Sunday:** "The men who'll sell them drink with us. Some sail with us. They make speeches about freedom from kings."
**Sunday:** "I'm not telling you this so you'll do something. There's nothing to do tonight. I'm telling you so you'll know what kind of place you've come to for a ship."

> **Ask (Sunday):** "Well?"
> 1. "Why stay?" → **Sunday:** "Because on our sloop it's written down that I'm a man, and I wrote half of it."
> 2. *(Say nothing.)* → **Sunday:** "Yes. That's the right answer."

### Uncle Asa (the east point)

**Uncle Asa:** "In the blue holes lives the Lusca: half shark, half octopus, big as a church. Twice a day she breathes in, and the water goes down her throat in a whirl, and whatever's floating goes with it. Twice a day she breathes out, and the water boils up white."
**Uncle Asa:** "Between the breaths she sleeps, a little while. That's when you go in, if you're a fool. My grandfather was a fool. He came back. Fools mostly do; it's the clever ones she keeps."

### The stallkeeper (the market)

**Stallkeeper:** "Spanish goods, cheap, no questions." *(The player names the Book of the Drowned.)* "Dead folks' things? Take them. Bad luck sells slow, and I've a family."

### Night: the bonfire vote

**Sunday** (standing, the articles in his hand): "Article one. Every one has a vote in affairs of moment. This is an affair of moment."
**Sunday:** "This person wants the *Small Mercy* for a voyage to the Matanilla, after a box the Englishman is also after. Some of you have seen them work."
*Fenwick, by flag:*
- *freed:* **Fenwick:** "Whereas this person once freed your captain from a Spanish cell at considerable risk to the King's chain, I move that we sail. Notwithstanding the obvious danger. Because of it, really."
- *left:* **Fenwick:** "I've no grudge. I've no great love either. I'll go where the votes go, like a gentleman."
- *reported:* **Fenwick:** "I'll say only this: I spent a month under the Morro on this person's account. Vote as you like. I know how I'm voting."
*The vote: hands raised in the firelight. With enough votes:* **Sunday:** "The company says yes."
*Without enough votes:* **Sunday:** "The company says no. Hornigold's sloop sails at dawn too, and Hornigold likes you. Go to him." *(Only option 3 below is offered.)*

> **Ask (Sunday):** "On what terms?"
> 1. "I'll sign the articles." → `dh.articles = 'signed'` → **Sunday:** "Then you are one of us. One share, one vote, and no captain over you but the one we choose." / "And know this: what we take, we take together. Article six."
> 2. "I'll hire the sloop, for a fee from whatever the box brings." → `dh.articles = 'hired'` → **Sunday:** "A promise is a debt. We'll write it down. You'll find we're better at collecting than kings."
> 3. "I'll sail with Hornigold." → `dh.articles = 'hornigold'` → **Hornigold** (at the fire's edge, amused): "A box on the Matanilla? I'll take you. But hear me: if there's an English flag at the end of this, I won't fire on it. I've told you what I am."

**Rufina** (beside the fire, to the player): "The Throat, Asa's Lusca. If your island has one, I'm diving it. Don't argue."
*If `dh.tito.state = 'bound'`:* **Rufina:** "Salmón's word is a promise on paper. The box is real. One way or another, I'm bringing my brother home."
**Tito** (if present): "Can I build something on the voyage? Anything. A shelf. A better shelf."

### Dawn

**Lalo** (pointing): "The *Restitution*! She's weighing anchor! She's going out!"
**Sunday:** "Then so are we. Same tide."
*`dh.ch.7 = 'done'`. Travel to `dh-08-reckoning`.*

## What the player learns and earns

- **Learns:** Inés is alive and sabotaging Wraxall. Wraxall's wound, and why he believes he's in the right. How the crew governs itself. That Nassau's freedom has an underside. How time gives longitude: four minutes to the degree.
- **Earns:** the title **Knot-Master** (optional), the record `knots`, 8 codex entries, 3 journal pages, 2 bottles and 5 Lost Things.
- **Flags:** `dh.votes`, `dh.articles`, `dh.watch`, `dh.bottle.1`–`2`, `dh.lost.20`–`24`, `dh.ch.7`.

## Hook

Two sloops leave Nassau on the same tide, for the same island, which only one of them can find.
