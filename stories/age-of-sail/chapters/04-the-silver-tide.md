# Chapter 4: The Silver Tide

*World `dh-04-coast` · 31 July 1715, then late August · Act II · 35 minutes*

**In short:** Survival on the wreck coast, a race against the flood to reach castaways on the *Urca*, an eyewitness, then a two-week skip in which the salvage camp is built and the cast that will drive Act II gathers. The chapter ends with a drift puzzle that points north-east.

## Locations and layout

Axes: +x is seaward (east), −x is inland (west), z runs north–south along the beach, and y is up. The sea level is a **mover** (see the tide below).

| Area | Footprint | Heights | Notes |
|---|---|---|---|
| Beach | x −60 to 0, z −200 to 200 | slopes 0 to 2 | Sand (`gravel`, tinted `#d8c79a`). A wrack line of weed, timber and barrels at x −4. |
| Dunes | x −90 to −60 | 6 to 10 | Low-poly sphere mounds with sea oats. The lookout dune top is at (−75, 10, −20). |
| Scrub and palms | x −140 to −90 | 3 | Palmettos, `island_tree_*` palms and `fern`. **Freshwater seep** at (−110, 3, 40): a dark, green-ringed patch. |
| Lagoon | x −220 to −140 | water 0.5 | Brackish (a splash zone). Mangrove edge (`root_cluster_01/02`). |
| Survivors' camp (part 1) | around (−45, 2, 0) | — | Driftwood lean-tos, a sail awning, a fire and 20 decor avatars. |
| Salvage camp (part 2) | x −95 to −40, z −70 to 70 | 2 to 4 | Palm-log **stockade storehouse** (20 × 12 m, 4 m walls) at (−80, 4, −30). Salmón's tent and chart table at (−70, 4, 10). **Divers' huts** at (−70, 3, 60). Watchtower (platform at 5 m) at (−60, 7, −60). Launches on the sand at (−5, 0.4, −40). |
| *Regla* stern (offshore) | (150, 0, 40) | to 9 | Poop deck and the mizzen stump above water. Chapter 5's dive site. |
| *Urca de Lima* | hull centred (110, 0, −60), 30 m long, 15° list | sterncastle deck 5 | A cargo net climb volume up the hull to the rail. Mainmast stump to 14. A broken **yard** floats in her lee at (104, 0.3, −52), and is the board for the flood run. |
| The flats | x 0 to 104, z −75 to −45 | sandbar tops at 0.0 | Six bars with 2–4 m channels between them. Wading zones in the channels apply `setSpeed(0.6)`. |

**The tide.** The water plane is a mover between y −0.5 (low water) and +0.8 (high water). Low water uncovers the bars. The splash check is world code: if the player is below the water level minus 0.2 and not on a board, they splash back to the beacon.

**Theme.** Part 1 dawn uses `day-sky` with a warm low sun, fog 60–400. Part 2 uses `clear-sky`. Music: root 50, minor, 70 bpm (part 1), then root 55, dorian, 80 bpm (part 2).

## Objectives and critical path

**Part 1: 31 July**
1. Ochoa asks for water. Find the seep and interact "Dig".
2. Look for Inés along the beach. The required clues are her hat at (−5, 0.5, 80) and a **torn strap of the cork jacket**, cork floats stamped with the Casa's mark, at (−3, 0.4, 95). Next to them is Inés's **spare-parts tin** at (−6, 0.5, 98), which gives `dh-tin`.
3. Ochoa points out the castaways waving from the *Urca*. Take the line (`dh-line`) and run the **Flood Tide Run** (puzzle 2).
4. On the *Urca*, talk to Benito Ruiz: the eyewitness account.
5. Ride the floating yard back on the flood.

**Part 2: late August** (the banner "Two weeks later" swaps the world state with hide/show)

6. Report to Admiral Salmón. Choose truth or lie.
7. Meet Rufina at the launches and show her the tin (the rubies identified). Meet Tito and Merino at the huts.
8. Return Lost Things to Anselmo in the storehouse (optional, repeatable).
9. Solve the **Drift** on Salmón's chart table (puzzle 3), which leads to Rufina's offer and on to Chapter 5.

## Optional areas

Six Lost Things along the beach and dunes; the lookout dune, with a journal page and a view of all three wrecks; the lagoon's mangrove edge, with a codex entry (the Ais); and the watchtower in part 2.

## Puzzles

**1. Water.** The seep is found by reading the land: the darker sand and green ring around one palmetto clump, 70 m inland. Ochoa's hint is "Look for green where nothing should be green." Interact "Dig" three times.

**2. The Flood Tide Run** (timed, soft fail, recorded). Low water lasts 120 s from the moment the player steps onto the first bar. Cross the six bars, jumping the gaps and wading the channels, then climb the *Urca*'s net and "Tie the line" at the rail (5 m). The castaways cross along the line: their avatars hide on the wreck and appear on the beach. If the 120 s run out before the line is tied, the flood pushes the player back with a splash, and the tide resets after a 10 s "next ebb" banner. Once Benito has spoken, the flood rises over 40 s. Then:
- the floating yard gives `dh-yard` (board) and calls `forceBoard(true)`;
- ride 110 m to the beach on the breakers (boost pads), steering round the reef heads;
- `w.record('flood', t)` records the whole run, from the first bar to the beach.

**3. The Drift** (deduction). Salmón's chart table, a 3 × 2 m painted chart of Florida, the Straits and the Bahama banks, offers four drift markers. The evidence is all in this chapter:
- Benito: the box rode high and went north.
- Anselmo's weather notes: 1 August, wind W, fresh; 2 August, W, strong; 3 August, WSW.
- Ochoa: the stream runs north at three knots, always.
- Inés's journal page: "look downstream and downwind".

> **Ask (Salmón's chart):** "Where would a box that rides high, carried north by the stream and blown east by a west wind, fetch up in three or four days?"
> 1. "South, on the Florida Keys." → "The stream runs north. Nothing goes south from here but ships under sail."
> 2. "North along this coast, at Cape Canaveral." → "That's where it would go with no wind. But there was wind, and from the west."
> 3. "North-east, across the stream, on the Matanilla shoals." → correct, sets `dh.drift`.
> 4. "Back to Havana." → "Against the stream and against the wind? Only if it rowed."

## Encounters and set pieces

- **Dawn on the wreck coast:** a long tracking walk along a beach of wreckage and survivors with three hulks offshore. It is sombre, and the tone is kept by the Lost Things, not by bodies; the dead are never shown.
- **The Flood Tide Run:** the sea draining off the flats, then coming back faster than you can run.
- **Benito's testimony** on the tilted sterncastle with the flood rising.
- **The salvage camp:** the same beach two weeks on, now an industry of tents, launches, guards and divers.

## Collectibles and codex

**Journal pages:**
1. A note inside the spare-parts tin: "Spares: three jewels, one mainspring, one balance spring. Never sail with one of anything."
2. Lookout dune: "If she is ever lost, look downstream and downwind. Everything I have ever lost went north."
3. Salvage camp, pinned to Anselmo's board in part 2 (washed ashore): "Proving voyage, Havana noon to Cádiz noon. If the Swallow keeps her rate: the King's prize, my father's title, and Mateo's forty leagues paid back."

**Lost Things** 4–9 (each sets `dh.lost.N`):
4. A carved spoon with the name *Pilar*.
5. A silver thimble.
6. A sealed letter addressed to Cádiz.
7. A child's shoe.
8. A guitar's broken neck.
9. A painted fan.

Returning them to Anselmo in part 2 enters them in the Book of the Drowned.

**Codex:**
- *The Ais* (mangrove edge): the people of this coast, whose name the Spanish gave it ("Palmar de Ais"). By 1715 disease and slave raids from Carolina had devastated them.
- *Flotsam, Jetsam, Lagan and Derelict* (after the tin): admiralty law's words for wreck goods that float free, are thrown over, are sunk with a marker, or are abandoned. Each has a different owner.
- *The Urca de Lima* (on the wreck): a cargo ship of the 1715 fleet, wrecked close inshore. Her wreck is now a Florida underwater preserve.
- *The Survivors' Camp* (part 2): survivors and salvors camped near today's Sebastian, and Havana sent relief ships and divers.
- *Jewel Bearings* (Rufina): from 1704, London watchmakers held their wheels in pierced rubies, patented by Fatio de Duillier and the Debaufre brothers.

## Dialogue

### Part 1: dawn

**Ochoa** (by the fire): "You! The hatch-rider. Good. Half this beach is alive and the other half is asking me for water."
**Ochoa:** "There's no water but the sea and that stinking lagoon. Go and find me something to drink. Look for green where nothing should be green."
*After the dig:* **Ochoa:** "Fresh! You've a nose like a pig for truffles. I mean that kindly."

> **Ask (Ochoa):** "What else?"
> 1. "Have you seen the cosmographer?" → **Ochoa:** "No. I've seen the Captain-General's hat on the tide, and I've seen men I've sailed with for twenty years lying in the surf. Look for her. Look carefully. And if you find her, come and tell me first, so I can stop looking."
> 2. "What happens now?" → **Ochoa:** "Now we wait. Havana will send ships when it hears. It'll hear when someone rows there. Someone is rowing there."

**Lalo** (following, quiet): "She'll be on the beach. She'll be on the beach somewhere. Won't she."
*At the hat:* **Lalo:** "That's hers. That's her hat." *(a beat)* "Hats float. Hats always float. It doesn't mean anything."
*At the strap:* **Lalo:** "Cork. With the Casa's mark. It's off the box's jacket, isn't it? The box got loose."
*At the tin:* **Lalo:** "Her spare tin. She has spares of everything. She said never sail with one of anything." *(opening it)* "Rubies! Three! Small ones. With holes in them. Why would you put holes in a ruby?"

**Ochoa** (after the tin): "Look there: the *Urca*. People on her sterncastle, waving. The tide's going out. At low water you could nearly walk to her. Take this line and tie it at her rail, and they can come ashore along it."
*Objective: "At low water, cross the flats and tie a line to the Urca."*

### The Urca

**Benito Ruiz** (gunner's mate, on the sterncastle): "A line! God bless you. Tie it there. Hurry. The flood comes in here like a horse."
*After the line is tied:* **Benito:** "Go on, all of you. Children first. I'll come last; I'm the heaviest."
**Benito:** "You were on the flagship, weren't you? With the cosmographer? I saw something. I've been lying here all night thinking about whether I saw it."

> **Ask (Benito):** "Do you want to hear it?"
> 1. "Tell me." → *continues below*
> 2. "The tide—" → **Benito:** "The tide can listen too. It's short."

**Benito:** "At first light, out past the reef, there was a box riding the water. Square, with a brass ring on top, riding high like a duck. It went north with the current. Upright. It never even turned over."
**Benito:** "And near it a woman, on a hatch cover, alive. I'd swear she was alive. A boat came out of the rain, not one of ours. English, by their shouting. They pulled her off the hatch. Then the rain came down again."
**Benito:** "They didn't take the box. They didn't see it. They were looking at her."

> **Ask (Benito):** "Was she yours?"
> 1. "My teacher." → **Benito:** "Then she's alive somewhere, with Englishmen, which is better than the sea, mostly."
> 2. "My friend." → **Benito:** "Then hold on to that. A friend in an English boat is still a friend."

**Benito:** "Now. Go. The flood's here."
*Objective: "Ride the yard back to the beach."*

### Part 2: two weeks later

*Banner: "Late August 1715 · Palmar de Ais".*
**Salmón** (at his chart table): "So you're the cosmographer's assistant. The one who came in on a hatch with a child and a gunner's mate. Francisco Salmón. Admiral by the grace of God and the Council of the Indies, and gravedigger and storekeeper by the grace of the hurricane."
**Salmón:** "Fifteen hundred souls on this beach and food for three weeks. Silver enough under that water to pay for a hundred years. One of those numbers worries me."
**Salmón:** "The Queen's casket. The cosmographer's rubies. Havana asks after them in every letter. What do you know?"

> **Ask (Salmón):** "Well?"
> 1. "It floated. North, on the stream." → `dh.salmon = 'truth'` → **Salmón:** "Then it belongs to the sea now, and to whoever the sea likes. I'll write to Havana." / "Thank you for telling me something I didn't want to hear. It's rarer than rubies."
> 2. "It went down with the stern." → `dh.salmon = 'lie'` → **Salmón:** "Then we'll dive for it with everything else. Rubies don't swim."

**Salmón:** "Make yourself useful. There's a diver at the launches, Ocampo. A free woman, very expensive, worth it. If anyone can get into that stern, she can."

### Rufina, Tito and Merino

**Rufina** (at the launches, tying a stone to a line): "You're in my light."
**Rufina:** "Rufina Ocampo. Diver. Free. I'll tell you that once, and then you'll write it down properly if you ever write it down. Everyone spells it wrong."

> **Ask (Rufina):** "What do you want?"
> 1. "Can you look at these?" *(shows the tin)* → *continues below*
> 2. "Tell me about yourself." → **Rufina:** "I was born on the pearl banks at Riohacha, owned. I dived for the owners all day and for myself at night. I bought myself with pearls they never knew I found." / "Now I dive for whoever pays, and Admiral Salmón pays." *(asks again)*
> 3. "Nothing yet." → **Rufina:** "Then go and do nothing somewhere else."

**Rufina** (turning a ruby over): "These aren't for a neck. They're flat as lentils and holed through the middle."
**Rufina:** "Three years ago I pulled a London watch out of a wreck off Cartagena. When I opened it, there were red stones like these holding the little wheels in place."
**Rufina:** "Your cosmographer wasn't carrying jewels. She was carrying a watch. A big one, if it needed spares like these." *Codex: Jewel Bearings.*

> **Ask (Rufina):** "Well?"
> 1. "She said it was a singing box." → **Rufina:** "Maybe it sings. Watches tick. Same thing to a fish."
> 2. "Why would anyone pretend a watch was rubies?" → **Rufina:** "Because thieves understand rubies. Nobody steals a watch from a fleet. Except, now, everybody."

**Rufina:** "My brother dives for Merino, over at the huts. He's seventeen, and he's owned. I've paid Merino a hundred and twenty pesos towards him. Merino says three hundred. Merino says a lot of things."

**Tito** (by the huts, grinning): "You're the one who rode a hatch through the reef with a little boy on it? Everybody's talking about you. Lalo says you're a sea creature."
**Tito:** "Tito. Faustino, if you're a priest. I dive. Underwater I talk by knocking on hulls: two knocks, come here. Three, I found something. One long knock, get out. Now you can talk to me underwater. Nobody else bothers."
**Lalo:** "He can hold his breath for sixty! I timed him! I can do nineteen."
**Merino** (arriving): "Faustino. Less talk, more silver. You're not paid to make friends." *(a pause)* "You're not paid at all, come to think of it."
**Merino** (to the player): "He's mine, stranger. Everything he brings up is mine. If you want him, buy him. Five hundred pesos."
**Rufina** (from the launches): "It was three hundred."
**Merino:** "It was."

### Anselmo (the storehouse, part 2)

*Lines depend on `dh.saved`.*
- **book:** **Anselmo:** "Honoured Flotsam. I'm writing the Book of the Drowned: every name I know, from the registro and my book. And look, here's Faustino Ocampo's contract. Three hundred pesos, fixed, a hundred and twenty paid, witnessed by me. Merino can't change a number I've written."
- **journal:** **Anselmo:** "Honoured Flotsam. I'm writing the Book of the Drowned from memory. Six hundred names so far. I witnessed that boy Faustino's contract myself, at three hundred. I remember the number. But a memory isn't a proof."

*Returning Lost Things:* **Anselmo:** "A spoon. *Pilar*. There was a Pilar on the *Carmen*, a cook's wife. Thank you. I'll write her down properly now." *(He has one line per item: "A thimble. A seamstress, then. I'll find her." / "A letter to Cádiz. I won't open it. I'll send it on, and someone there will know." / "A child's shoe. I'll write it down. I can't write anything else.")*
*Any item without its own line:* **Anselmo:** "Thank you. I'll write down where you found it, and whoever it belonged to will have a place in the book."

### The drift

**Ochoa** (beside the chart table, part 2): "The stream runs north at three knots, always. Wind doesn't stop it. Wind only argues with it."
*After the correct marker:* **Salmón:** "Matanilla. Forty leagues of shoal at the top of the Bahama bank. Ships die there in clear weather. If your box went there, it's on a reef no one can find in water no one charts."
**Ochoa:** "There are cays up there that move. Not move, but no two charts put them in the same place. My father called one of them the Wandering Isle."
**Rufina** (at the tent flap): "Your cosmographer had charts, didn't she? Her cabin's under six fathoms of sand and silver off that reef. I can get you into it. For a wage."
*`dh.ch.4 = 'done'`. Travel to `dh-05-wreck`.*

## What the player learns and earns

- **Learns:** Inés may be alive, taken by an English boat. The casket floated north and upright, untouched. The rubies are watch parts. The stream and the wind push a floating thing towards the Matanilla shoals.
- **Earns:** the record `flood`, 5 codex entries, 3 journal pages and 6 Lost Things.
- **Flags:** `dh.salmon`, `dh.drift`, `dh.lost.4`–`9`, `dh.ch.4`.
- **Items:** `dh-tin` (story item). The loans `dh-line` and `dh-yard` are taken back.

## Hook

The rubies hold up the wheels of a watch, and the Swallow is still somewhere at sea. To find out where, Flotsam needs Inés's own charts, and they're six fathoms down.
