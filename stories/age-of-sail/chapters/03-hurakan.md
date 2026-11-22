# Chapter 3: Hurakán

*World `dh-03-hurakan` · night of 30–31 July 1715 · Act II · 20–25 minutes*

**In short:** The hurricane, played on deck in five beats, then a single choice in a flooding cabin, a glide from a breaking stern and a surf ride to shore by lightning.

## Locations and layout

This chapter reuses Chapter 2's *Regla* geometry and axes with four changes:
- **Heel.** All ship geometry is rotated 10° about z, so the decks slope down to port (−x), with the wind and sea coming from starboard.
- **Weather.** Rain particles (kind `snow`, speed 14, grey-blue, 600 count, 60 × 30 × 60 m around the player). Fog runs from 12 to 90 m with fogColor `#1a2330`. There's no sky photo; skyTop `#0d1117`, bloom 0.5.
- **Lightning.** Flashes come on a seeded schedule (`w.rand(1715)`, every 6–11 s): a point light at intensity 120 for 0.15 s, `w.shake(0.25)` and a sound. Each flash briefly shows the reef surf as a white line 120 m to port.
- **Green water.** Every 9 s a wave sweeps the waist from x +6 to −6 in 1.2 s, as a world-coded moving volume. A player caught outside a **lifeline** zone (1 m strips along the centreline, marked by taut ropes) is pushed at 14 m/s to port. Over the rail, the player splashes back to the beacon.

| Area | Where | Notes |
|---|---|---|
| Gun deck, the loose gun | z −6, x −4.5 to 4.5 | A cannon (`cannon_01`, collider box 2.2 × 1 × 1) on a mover running across the deck with the roll. It takes 1.6 s to cross and rests 2 s at each side. Its port-side chock spot is (−4, 0.4, −6). |
| The hold | as in Chapter 2 | Water is a mover rising from −3.2 to −1.0 over the scene. A fallen chest (1.2 × 0.8 × 0.8 m) blocks the ladder foot at (0, −3, −2). |
| Main shrouds and maintop | starboard shrouds to the maintop at 20 | Gusts push −x at 9 m/s for 1.5 s in every 3. Three **lashings** hang at the maintop's forward edge, at x −1.2, 0 and 1.2, y 21. |
| The fallen mast | after the cut, a static beam 1.2 m wide | Runs from the waist at (0, 3, −2) to the forecastle rail at (−3, 6.5, −20), splintered and tilted. |
| Bowsprit | z −22 to −36, rising 6 to 10 | Waves break over it every 6 s (a push volume). Lalo clings at (0, 9.2, −33). |
| Great cabin | under the poop, z 14 to 22 | Flooding (a water mover). The stern windows face +z. Inés's journal on the port side at (−4, 6, 20), Anselmo's book on the starboard side at (4, 6, 20). |
| Poop deck, launch point | (0, 8.2, 21) | Ochoa hands over the torn topsail here. The jump is off the taffrail. |
| The surf run | from (0, 0.3, 50) aft of the ship to the beach at x −380 | Hatch cover (a board) on a water plane with an invisible collider at y 0.05. Reef heads are hazards. Breaking waves are boost pads aimed −x. Wreckage is static boxes. Checkpoints at x −120 and −250. |
| The beach | x −380 to −420, a band 300 m long | Sand ramp out of the water (`gravel` tinted sand). Wreckage, palms on the dunes. |

## Objectives and critical path

1. **9 p.m.** Chock the loose gun (puzzle 1).
2. **11 p.m.** Clear the ladder for Anselmo in the flooding hold (puzzle 2).
3. **Midnight.** Climb the main shrouds and cut the three lashings of the fouled topsail with Ochoa's knife (puzzle 3).
4. **1 a.m.** The mast falls. Cross it to the forecastle and pull Lalo off the bowsprit (puzzle 4).
5. **1:45 a.m.** The great cabin: the choice between the journal and the book.
6. **2 a.m.** The ship strikes. Take the torn topsail, glide from the poop to the hatch cover, and ride the surf to the beach.
7. **Dawn.** A short scene on the beach, then travel to Chapter 4.

## Optional areas

- Three **Lost Things** and two **survivors** on the surf run. A third survivor is required; see below.
- Two journal pages off the critical path: one by the gun deck strongroom door, one floating on the surf.

## Puzzles

**1. The Loose Gun.** The gun rolls between the two sides of the gun deck. Interact "Chock" at the port spot while the gun is resting at starboard, a 2 s window. Do it twice, for the two chocks, and the gun stops against them at x −3. Getting hit costs 1 Grit (see BUILD.md) and a push. Two sailors haul on tackles around it; they're decoration.

**2. The Ladder.** A chest blocks the ladder. "Shove" only works while the ship rolls to port, signalled by a creak toast and the water sloshing to port, in a 1.5 s window every 5 s. Two shoves slide it clear. Anselmo then climbs (his NPC moves up to the gun deck).

**3. The Topsail.** Climb the starboard shrouds through the gusts. Ochoa's knife (`dh-knife`, campaign-scoped blade) is given at the shroud foot. At the maintop, strike (key 1) each lashing within 2 m; each has 34 HP and breaks to one blade strike. The rail stops the gusts carrying the player off, and the open forward edge doesn't. On the third cut the canvas tears away, and the mast falls (cutscene-lite: `freeze`, shake for 1.5 s, a dark banner "The mast groans. The world tips.", then `setPos` onto the fallen mast at (0, 3.6, −3) and unfreeze).

**4. The Bowsprit.** Walk out along the bowsprit between the breaking waves; a wave every 6 s pushes +x at 10 m/s. Interact "Grab Lalo" at the tip. Lalo's NPC moves to the forecastle, and from now on a `w.avatar` copy of him rides with the player.

**5. The Surf Ride** (board, recorded). On reaching the hatch cover the world gives `dh-hatch-cover` (board) and calls `forceBoard(true)`. The run is 380 m. Breaking-wave boost pads keep the speed up, wreckage forces turns, and reef heads (hazard cylinders 1–2 m, white foam rings) are only clearly visible in lightning flashes. A held light (the Glowcave lantern) lights 12 m around the player. Riding within 2 m of a survivor on wreckage pulls them aboard ("Got you!"); there are three. The **third survivor**, Benito Ruiz, sits on the direct line and is required, because he matters in Chapter 4. Reaching the beach zone ends the ride: `w.record('surf', t)`, then `forceBoard(false)`, and the loaned board, glider and knife are taken back. The cosmetic Torn Topsail Cloak is given.

## Encounters and set pieces

- **The mast falls:** a 40 m mast coming down in the dark becomes a bridge to the bow.
- **The Strike** (2 a.m.). A 2 s shake, every lantern swinging, a roar, and the stern section's parts hide and show to make a gap open in the great cabin wall.
- **The Glide from the Breaking Stern.** Ochoa throws the player a torn topsail (`dh-torn-topsail`, a campaign-scoped glide loan). Jumping off the poop (8.2 m) gives about 37 m of glide reach, and the hatch cover floats 24 m aft at (0, 0.3, 45), lit by a lightning flash that keeps repeating every 2 s until the player lands.
- **The Surf by Lightning.**

## Collectibles and codex

**Journal pages:**
1. By the strongroom door: "The cradle holds her upright to forty-five degrees. Past that I have a cork jacket and prayer."
2. Snagged on the maintop rail: "If the sea takes me they will call her treasure and fight over her. Let them. Treasure floats in stories. She floats in cork."
3. Floating on the surf run at (−200, 0.4, 30): "Whoever finds this page: the box is not jewels. Wind it. Keep it upright. Find someone honest. I.A."

**Lost Things** (ridden through on the surf; each sets `dh.lost.N`):
1. A child's wooden horse.
2. A rosary of seeds.
3. A sailor's ditty bag stitched "J. de Lezo".

**Codex:**
- *Hurakán:* the Taíno storm word that Spanish turned into *huracán* and English into "hurricane".
- *The Night of 30–31 July 1715:* eleven ships driven onto the Florida reefs around 2 a.m. Estimates of the dead run from about a thousand upward.
- *The Gulf Stream:* the current Antón de Alaminos found in 1513, the fleets' road north. That night it ran them along a lee shore.
- *A Loose Cannon:* a gun broken from its breeching, weighing more than a ton. Where the phrase comes from.

## Dialogue

### 9 p.m.

*Banner: "30 July · 9 p.m."*
**Ubilla** (quarterdeck, shouting): "Strike the topgallants! Double the lashings on the boats! And somebody find out what is smashing my gun deck!"
**Ochoa** (at the main hatch): "A gun's broken its breeching! It'll go through the side! You, the cosmographer's shadow: chocks! When it's rolled to starboard, jam them in at port!"
*After the gun is chocked:* **Ochoa:** "That's two tons of bronze that won't kill anybody tonight. Good."

### 11 p.m.

*Banner: "11 p.m."*
**Anselmo** (the hold, on a cask, holding an oilcloth bundle above the water): "Honoured Flotsam! The registro chest has fallen across the ladder, and the water is coming in, and I can't swim, and I've written all of that down!"
*After the chest is cleared:* **Anselmo:** "God bless you. My protocol book. Every contract I've witnessed in Havana these three years. People's lives are in here."

### Midnight

*Banner: "Midnight".*
**Ubilla:** "The main topsail's blown out of its gaskets, and it's tearing the mast out of her! Cut it free, or we lose the mast!"
**Ochoa** (at the shroud foot, pressing a knife into the player's hand): "Take my knife. Three lashings at the top. Hold on with one hand and cut with the other, and if you need a third hand, pray."
*On the third cut:* **Ochoa** (far below): "It's going! It's ALL going!"

### 1 a.m.

*Banner: "1 a.m." The player is on the fallen mast.*
**Lalo** (far forward, small): "Flotsam! FLOTSAM! I'm on the… the pointy part! I don't like it!"
*On the bowsprit, after "Grab Lalo":*
**Lalo:** "I came up to see the waves. I've seen them. I've seen enough of them."

> **Ask (Lalo):** "Are we going to die?"
> 1. "Not tonight." → **Lalo:** "You don't know that. But say it again."
> 2. "Hold on to me and we'll see." → **Lalo:** "That's not a no. Hold on tighter."

### 1:45 a.m.: the great cabin

**Inés** (buckling the cork jacket round the casket): "There you are. Good. Lázaro? Good. Don Anselmo? Hold that table. Hold it like it owes you money."
**Inés:** "Listen. When we strike, the stern will go first. She floats in the jacket. I'll put her out of the window myself."
**Inés:** "Take this." *(Gives `dh-pocket-watch`.)* "My watch. It keeps Havana time. Wind it at noon, as you wind her. If we're parted, it's the only hour you'll own."
*The stern windows burst inwards. Water floods the cabin, and two oilcloth bundles skid apart: her journal to port, Anselmo's book to starboard.*
**Anselmo** (going down): "My book! The names, the contracts!"
**Inés:** "My journal! Everything I know is in it!"
**Inés:** "You can't reach both. Choose!"
*Spatial choice: whichever bundle the player takes first is saved, and the next wave carries the other out of the window.*
- **The journal** → `dh.saved = 'journal'`, gives `dh-journal` → **Inés:** "Thank you." / **Anselmo** *(quietly)*: "Three years of names. Well. I remember some of them."
- **The book** → `dh.saved = 'book'`, gives `dh-protocol-book` → **Anselmo:** "Oh. Oh, bless you." / **Inés:** "Good. People before paper. Even my paper."

### 2 a.m.: the strike

*Banner: "2 a.m." The strike plays (shake, roar, the stern wall splitting).*
**Ubilla** (somewhere above, hoarse): "All hands! Save yourselves! God keep you all!"
**Inés** (shoving the casket through the broken window): "Upright! She'll stay upright! Find her, Flotsam! Find her and—"
*A wave fills the window. When it drains, Inés is gone.*
**Lalo:** "DOÑA INÉS!"
**Ochoa** (on the poop, through the rain, ripping canvas from the mizzen): "The stern's breaking up! Take this sail, jump, and hold on to it with everything you've got! There's a hatch cover off the quarter. Ride it to the beach!"
*Objective: "Jump from the stern and glide to the hatch cover."*

### The surf

**Lalo** (behind the player on the hatch cover): "Left! Rocks! No, your other left!"
*On the first survivor:* **Lalo:** "Got one! Hold on to the edge, señor, it's a very good hatch!"
*On Benito:* **Benito:** "Madre de Dios, a raft with a child on it. Yes. Yes, I'm coming."
*On a lightning flash near the beach:* **Lalo:** "The beach! I can see the beach! I'll draw it later. I'll draw it so big."

### Dawn

*Banner: "31 July · dawn". Grey light, a beach strewn with wreckage, survivors standing in the surf.*
**Lalo:** "She'll be on the beach somewhere. Won't she. She'll be on the beach telling somebody they're standing wrong."
**Anselmo** (staggering up the sand; his lines depend on `dh.saved`):
- *book:* "I have it. I have the book. Look: it's dry. Oilcloth. God bless oilcloth."
- *journal:* "Three hundred names. I'll write them again. I'll start now, before I forget the first one."
*Far to the east the *Griffon*'s sails, white, steady and leaving. Nearer in, a small sloop's topsail, the only other sail on the sea.*
**Lalo:** "That's the Frenchman. He's going home." *(then)* "Who's that one?"
*`dh.ch.3 = 'done'`. Title **Storm-Survivor of 1715**. Travel to `dh-04-coast`.*

## What the player learns and earns

- **Learns:** the casket floats, upright, by design. Inés planned for a wreck. One sail besides the *Griffon* was close enough to see the wreck.
- **Earns:** the title **Storm-Survivor of 1715**, the Torn Topsail Cloak (soulbound cosmetic, back), the record `surf`, 4 codex entries, up to 3 journal pages and 3 Lost Things.
- **Flags:** `dh.saved`, `dh.survivors` (1–3), `dh.lost.1`–`3`, `dh.ch.3`.
- **Items:** `dh-pocket-watch`, and `dh-journal` or `dh-protocol-book`. The loans `dh-knife`, `dh-torn-topsail` and `dh-hatch-cover` are taken back.

## Hook

Inés is gone. The Queen's casket is in the sea, floating upright, exactly as she built it to. And someone in a small sloop was close enough to watch.
