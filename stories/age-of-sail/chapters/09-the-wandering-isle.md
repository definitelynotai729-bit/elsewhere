# Chapter 9: The Wandering Isle

*World `dh-09-isle` · early March 1716, dawn to night · Act III · 35 minutes*

**In short:** A cay no chart agrees on, a widow and her unfinished light, a clock that never stopped, and a dive into the Lusca's throat to reach it before it does. That night, the proof.

## Locations and layout

Axes: x is east, −z is north, and the sea is at y = 0.

| Area | Footprint | Heights | Notes |
|---|---|---|---|
| The cay | x −130 to 130, z −80 to 80 | 1 to 3 | Sand, limestone, sea grape, `island_tree_*` palms. |
| Ridge | x −40 to 40, z −10 to 10 | up to 12 | Limestone. A lookout platform at (0, 12, 0). A rock shelter with old pottery sherds at (25, 4, 8) (codex). |
| **The Throat** | a lagoon ring of radius 12 centred (0, 0, 30) | rim 3, hole to −30 | The blue hole. A capstan stands on the rim at (10, 3, 20). Tamsin's guide line runs from an iron ring at (0, 3, 18) down the north wall to the tunnel mouth at y −8. |
| Tunnel and **Chapel** | tunnel 25 m from (0, −8, 18) north to (0, −2, −8) | Chapel 12 × 8 m, air from −1 to 6 | A dry ledge at 1.5 holds the Heart (the casket). A crack in the ceiling lets in a sunbeam, and the walls carry chalk tally marks. |
| Reef ring | 60–120 m offshore | | Breakers. A **ship graveyard** of six wrecks from different centuries (a nao stern, a fluyt, a Bermuda sloop, a merchantman's bow, a galleon's rudder post, a smack), three of them climbable. |
| **Leading marks** | Tamsin's tower at (−90, 0, −95); the Split Rock at (−90, 3, 62) | | The safe passage is the reef gap at x −90, z 100–120. From the sloop at (−90, 0, 170), the tower's top shows through the rock's cleft only on the line. |
| Landing beach | (−90, 1, 70) | | |
| Tamsin's cottage | (−70, 2, −60), stone, 5 × 4 m | roof 3.2 | Cistern, kettle, Jory's grave (a cross of ship's timber), and the 24-candle chandelier on the floor. |
| **The light** | north rock at (−90, 3, −95), octagonal timber tower | 22 m tall, gallery at 25 | Interior spiral stair with gaps. Exterior scaffold on the north side. Open, unglazed lantern room. A capstan at the foot for the chandelier rope. Climbed in full in Chapter 10. |

If `dh.gave` and not `dh.chart`, the *Restitution* is already anchored off the east reef at (200, 0, −20) at dawn, with her boats sounding for a way in. Otherwise she appears at dusk.

**Theme.** Dawn and day use `clear-sky`, with turquoise water (the sea box colour `#3fc1c9`, opacity 0.8). Night uses `night-sky` with stars 0.9. Music: root 60, lydian, 76 bpm, sparkle 0.3; in the Chapel, root 48, minor, 50 bpm, with only `sparkle`.

## Objectives and critical path

1. Pilot through the reef by the leading marks (puzzle 1), and land.
2. Meet Tamsin. Inés's reveal, and the deadline.
3. Tamsin gives the player her storm lantern.
4. At the Throat, watch the Lusca breathe and dive at slack water (puzzle 2).
5. In the Chapel, wind the Heart (eight turns).
6. Float the casket out at the next slack and haul it up the rim with the capstan.
7. Night: the proof on the ridge lookout (puzzle 3).
8. The norther and the sail. Travel to Chapter 10.

## Optional areas

The graveyard wrecks (Jory's bottle and Tamsin's bottle), the rock shelter (codex), Jory's grave, and the ridge view at noon.

## Puzzles

**1. The Leading Marks.** From the sloop's bow, three gaps show in the white water: west, under the Split Rock, and east. The player can walk the bow and look. From the right place, the tower's top sits inside the rock's cleft.

> **Ask (Sunday):** "Which gap?"
> 1. "West." → **Sunday:** "The tower's left of the rock from there. Look again."
> 2. "Under the Split Rock: the tower sits in its cleft." → correct. **Sunday:** "Then that's the road. Whoever built that tower built it to be a mark."
> 3. "East." → **Sunday:** "That's water breaking over coral. That's not a road."

**2. The Lusca Breathes** (timing, then diving). The Throat runs a compressed tide on a 90 s cycle, driven by ticks:
- **Inflow,** 35 s: a whirl spins (rotating particles and a turning disc on the surface), and a wind zone pulls down and inward. Entering means being "pulled under" and respawning at the rim.
- **Slack,** 25 s: the surface goes glassy and the particles stop. This is the window.
- **Outflow,** 30 s: the water boils up white, and an upward wind zone makes descending impossible.

Dive at the start of slack. Follow Tamsin's line down to the tunnel at y −8 (dive rules: a breath of 40 counts) and through 25 m of tunnel into the Chapel. If the inflow comes back while the player is still in the tunnel, a reverse current (a push zone) carries them back out to the rim. Recorded as `w.record('throat', t)`.

**3. Io's Eclipse.** Inés has Wraxall's telescope ("rent"). Using the telescope at the ridge lookout freezes the player and shows an eyepiece view: a floating disc in front of the camera (visual), with Jupiter and four moons. Io creeps towards Jupiter's shadow and dims over 2 s. Press F at the moment it vanishes (a 0.8 s window, checked by tick). A miss gives Inés's line, and Callisto's eclipse later offers a second try with the same mechanics. Success sets `dh.proof`.

## Encounters and set pieces

- **Through the reef by the marks:** the sloop threading a gap between breakers, with the tower framed in the rock.
- **The Heart revealed:** two widows, a ticking box, and seven months of mornings.
- **The Throat:** the whirl stilling to glass, the plunge, the line in the blue, the dark tunnel, and the Chapel with its sunbeam on a ledge and a box ticking quietly. The ticking plays `click` once a second within 30 m (BUILD feature 8 adds positional sound).
- **The proof:** a tiny star going out beside Jupiter, and a woman checking a clock.

## Collectibles and codex

**Journal pages:**
1. Inés's notebook, at the cottage: "3 August to 7 March. Seven months, wound every morning by a Cornish widow who thought she was a heart. I have no scientific word for this."
2. Inés's notebook, after the dive: "Tamsin asked what the Swallow is for. I said: so ships know where they are. She said: that's what a light is for. We looked at each other for a long time."
3. **Tamsin's tally** on the Chapel wall: 217 chalk strokes, one per morning.

**Bottles:**
5. In the graveyard sloop's cabin: "To my Tamsin, if I go first. Finish her. Light her. J.P., 1712." Giving it to Tamsin plays a scene.
6. Floating in the lagoon: "Wanted: timber, glass, and a little company. T.P."

**Codex:**
- *Blue Holes:* deep sinkholes in Bahamian limestone, where tides drive water in and out in whirlpools. That's the Lusca's breath.
- *The Lucayans* (rock shelter): the first people of the Bahamas, who met Columbus in 1492. Spanish slaving had emptied the islands by about 1520.
- *Eddystone:* Henry Winstanley's tower (1698) was swept away in 1703 with its builder inside. John Rudyard's timber tower, lit with 24 candles from 1708, was standing in 1715.
- *Jupiter's Moons and Longitude on Land:* Cassini's tables predicted the eclipses of Jupiter's moons. On land, timing one gives the true hour anywhere.
- *The Matanilla Shoals:* reefs at the north end of the Little Bahama Bank, where many ships were lost, among them the galleon *Maravillas* in 1656.

## Dialogue

### Landing

**Tamsin** (on the beach, a fowling piece levelled, wrist bound in a splint): "That's close enough, my birds. Last lot that came in my channel were Bermudians asking after a box. I sent 'em off with birdshot in their breeches."
**Tamsin:** "So. Who are you, and what d'you want with my rock?"

> **Ask (Tamsin):** "Well?"
> 1. "We're looking for a box that floated here after the great storm." → **Tamsin:** "Are you now." *(The gun doesn't move.)*
> 2. "Who are *you*?" → **Tamsin:** "Tamsin Penhallow, keeper of this light, which isn't lit, on this island, which isn't anywhere. Your turn."
> 3. "We came through by your marks." → **Tamsin:** "Did you. Then you've eyes. Jory made those marks for honest folk. Wreckers can't read."

**Inés** (stepping forward): "Señora. My name is Inés Abarca. The box is mine. I built it. It took me ten years and my son's memory. Is it here?"
**Tamsin** *(a very long look; then she lowers the gun)*: "You're the one she belongs to? Oh, my bird." *(to everyone)* "Kettle's on. Come up."

### The cottage

**Tamsin:** "She came ashore the third morning after the great storm, riding the swell upright like a duck, ticking like a heart. I couldn't open her, but there's a little brass square on her side."
**Tamsin:** "When the ticking slowed I thought: Jory always said a light must never go out. A heart's the same. So I wound her. Eight turns. She pushes back on the eighth."
**Tamsin:** "Every morning since."
**Inés** (barely): "Every morning. Since the third of August."
**Tamsin:** "Every morning. Bar the one I had the fever, and I wound her that evening, so I'm counting it."
**Inés:** "Then she never stopped." *(She sits down very suddenly.)* "She never stopped."
**Lalo:** "Doña Inés? Is that good?"
**Inés:** "It's a miracle, Lázaro, and I don't believe in them, and I'm going to need to sit here for a minute."

> **Ask (Inés):** "You heard her. Do you understand?"
> 1. "The proof isn't broken." → **Inés:** "The proof isn't broken. Seven months without a stop. No clock has ever done it."
> 2. "Tamsin saved it." → **Inés:** "Tamsin saved it. A widow with a broken wrist and a habit. I'll write her name on everything."

**Tamsin:** "Now. The bad news, since you've had your good. Five days ago I fell on the rocks." *(She lifts the splint.)* "I couldn't get down to her."
**Inés:** "Down?"
**Tamsin:** "When the Bermudians came I hid her in the Throat, in the cave under the ridge. On the dry ledge, where the water never reaches. The Lusca's mouth."
**Rufina:** "You hid a clock in a blue hole."
**Tamsin:** "Nobody steals from the Lusca, my bird."
**Inés:** "She runs eight days on a winding. It's been five."
**Lalo:** "Three days! Then she stops! Then the proof breaks!"
**Tamsin:** "And you can only go in when the Lusca's holding her breath. Watch the water. When it goes still as glass, that's your door. Follow my line." *(She gives `dh-storm-lantern`.)* "And take this. It's dark in the Chapel."

### At the Throat

**Rufina** (on the rim): "Asa's Lusca. It's the tide, isn't it? Water going in and out of a hole in the rock."
**Tamsin:** "It's the tide. It's also the Lusca. Both things can be so."
**Rufina:** "I'm going in with you, Forty. Don't argue. I've got sixty breaths and you've got forty."

### The Chapel

*The ticking grows as the player surfaces into air. The lantern lights chalk tallies, and the sunbeam falls on a cork-jacketed box on a ledge.*
**Rufina** (surfacing beside the player): "That's it? That little sound?" *(listening)* "All of this, the hurricane, the raid, Nassau, for that little sound."
**Rufina:** "It's a good sound."
*Interact: "Wind the Heart." Eight presses. On the eighth:* "She pushes back. Firm as a handshake. The ticking steadies, as if the box has taken a breath."

> **Ask (Rufina):** "Well?"
> 1. "Let's take her home." → **Rufina:** "Whose home? Never mind. Up first. Arguing after."
> 2. "Listen a moment longer." → **Rufina** *(after a while)*: "All right. Long enough. The Lusca's waking up."

### Hauling up

**Rufina:** "She floats. That's what the jacket's for, yes? I'll swim her through at the next slack. You haul."
*At the rim capstan, two turns.*
**Inés** (as the casket comes over the rim, dripping, ticking): "Oh." *(She puts both hands flat on the cork.)* "Hello, little bird."

### Bottle 5 (optional)

**Tamsin** (reading it, then folding it into her apron): "He put it in a bottle. Of course he did. He never could say anything to my face." *(after a moment)* "Finish her. Light her. Well, Jory. Dreckly."

### Night: the proof

*Banner: "That night".*
**Inés** (at the ridge lookout, a brass telescope on a stand): "I took this from Mr Wraxall's cabin. Consider it rent."
**Inés:** "Cassini's tables say Io goes into Jupiter's shadow tonight at nine hours, forty-three minutes and thirty seconds, Havana time. Watch the little star to the right of Jupiter. Tell me the moment it goes out."
*On a miss:* **Inés:** "Not yet. No. Gone. Never mind. Callisto goes in at eleven. We wait. We are very good at waiting, all of us."
*On success:* **Inés** (opening the casket's brass shutter and reading the dial by lantern light): "Nine forty-seven and twelve seconds."
**Inés:** "Three minutes and forty-two seconds. In seven months. Through a hurricane, a shipwreck, a drift, a blue hole and a Cornish widow."
**Inés:** "That's under a degree. Under a degree." *(quietly)* "It works, Mateo."
**Tamsin:** "Is that good, my bird?"
**Inés:** "It's the best thing that has ever happened to me."
**Tamsin:** "Then I'll put the kettle on."

### The norther

**Tamsin** (at the cottage door, sniffing): "Wind's going round to the north. Norther coming. Wreckers' weather."
**Lalo** (from the ridge): "SAIL! It's the *Restitution*!"
*If she has been there since dawn:* **Lalo:** "She's lowering boats! They've found the channel! They're coming in by the marks!"
*Otherwise:* **Lalo:** "She's standing in! She's heading for the reef!"
**Sunday:** "Three boats, twenty men. We have the light and the dark. Choose which."
*`dh.ch.9 = 'done'`. Travel to `dh-10-light`.*

## What the player learns and earns

- **Learns (the second twist):** the clock never stopped, because Tamsin wound it every morning believing it was a heart. The proof is whole, and it works to under a degree.
- **Earns:** Penhallow's Storm Lantern (a scoped light trait; a cosmetic outside the campaign), the record `throat`, 5 codex entries, 3 journal entries and 2 bottles.
- **Flags:** `dh.heart`, `dh.proof`, `dh.bottle.5`–`6`, `dh.ch.9`.

## Hook

The proof works and the clock is in a widow's cottage at the foot of an unlit tower. A norther is coming, and so is Wraxall.
