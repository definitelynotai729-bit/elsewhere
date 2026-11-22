# Chapter 8: Dead Reckoning

*World `dh-08-reckoning` · late February 1716, at sea · Act III · 30 minutes*

**In short:** The player navigates by real methods, gets through a squall, boards the *Restitution* and gets Inés back, and then has to hear her say the proof is lost.

## Locations and layout

Axes: the bow points to −z, starboard is +x, and the sea is at y = 0. The player's sloop is static and the sea moves around it, as in Chapter 2. It is the *Small Mercy*, or Hornigold's sloop if `dh.articles = 'hornigold'` (the same geometry with different flags and crew).

| Area | Where | Notes |
|---|---|---|
| Sloop deck | x −3.25 to 3.25, z −11 to 11 | Deck at 2.2. Single mast at z −2, with crosstrees at 17. Boom from the mast aft to z 12 at 4.5, with three **reef points** at z 2, 6 and 10. Tiller at the stern. |
| Chart cabin | z 6 to 11 (deck house, roof 4.2) | Chart table, **traverse board** (a pegboard rose) and the lead line on a hook. |
| The *Restitution* | a second sloop; for the boarding she lies to starboard | Her deck parts are movers between x 9.5 (a 2.6 m gap) and x 13 (a 6.1 m gap) every 4 s: the **roll window**. Her stern cabin at z 6 to 11 has a barred door (60 HP) and a stern window. Her mast is at z −2. |
| Jolly boat | astern of the player's sloop | A loaned board for the stealth approaches. The ride is 40 m to the *Restitution*'s stern, where a rope-ladder climb volume reaches her stern window. |
| Sea states | a visual swap | Deep blue by day. Grey and rain in the squall. Turquoise with sand showing over the bank (by the end). |

**Theme.** Day 1 uses `clear-sky`. The squall uses a painted dark sky, rain particles and gusts (wind 8 m/s pushing −x for 2 s in every 5). The night boarding uses `night-sky` with ship lanterns. Dawn uses `sunset-sky`, rotated for a dawn sun. Music: root 55, dorian, 88 bpm; the boarding has `pulse` on.

## Objectives and critical path

1. **Noon sight:** latitude (puzzle 1).
2. **Havana's hour:** longitude from the watch at local noon, then choose the course (puzzle 2).
3. **The log:** speed, and how long to run (puzzle 3). Peg it on the traverse board (an interact).
4. **The squall:** tie the three reef points on the boom in the gusts.
5. **Dusk:** the *Restitution* is sighted. Inés's signal (variant).
6. **The boarding** (a variant table below): reach the stern cabin and free Inés.
7. **The melee choice:** throw Oakes a line, or seize Wraxall's chart case.
8. Wraxall cuts free and escapes. The reunion. The lead line on the bank's edge, then dawn and the isle in sight. Travel to Chapter 9.

## Optional areas

- The crosstrees at 17 m: a view over the bank's edge and the codex *The Bermuda Sloop*.
- Hooking bottle 3 from the sea with the boathook on day 1.
- The crew's lines during the run: Pike, Pease and Hob each have a short exchange.
- Wraxall's almanac with Inés's margin notes (3 journal pages), reachable on every boarding route before the melee choice.

## Puzzles

**1. Latitude.** The quadrant shows the sun's noon height as 53° 50′. Sunday holds the almanac: "The sun leans nine and a half degrees *south* today."

> **Ask (Sunday):** "Where are we?"
> 1. "26° 40′ north." → correct. **Sunday:** "And the nest is at 27° 21′. Forty-one miles north."
> 2. "45° 40′ north." → "When the sun leans south, you take it away."
> 3. "36° 10′ north." → "You forgot the lean."

**2. Longitude.** At local noon (the shadow stick on the binnacle, a 2 s window, as in Chapter 7) the player reads Inés's watch, which keeps Havana time: **11:41**.

> **Ask (the watch):** "Havana's hands read 11:41 at our noon. Where are we, and which way is the nest?"
> 1. "4° 45′ east of Havana, too far east. Steer north-west, about 56 miles." → correct, sets `dh.course`.
> 2. "4° 45′ east, too far west. Steer north-east." → "Her nest is 4° 02′ east. We're past it."
> 3. "19° east. Steer south-west." → "Four minutes to the degree, not one."

Inés's margin note (Chapter 7) and Sunday's reminder ("the earlier Havana reads at our noon, the further east we are") make this fair.

**3. Speed and time.** Heave the log: five knots pass in the glass.

> **Ask (Sunday):** "Fifty-six miles at five knots?"
> 1. "About eleven hours." → correct. **Sunday:** "On the bank by dawn, then." Title **Navigator**.
> 2. "About five hours." / 3. "About twenty-eight hours." → "Divide, don't guess."

**4. The Lead** (night, after the boarding). Interact "Heave the lead": "Nine fathoms. The tallow comes up with white sand and broken shell." This identifies the edge of the Little Bahama Bank and confirms the course.

## The boarding (variants)

The approach depends on `dh.wraxall`, and the number of allies who board depends on `dh.articles`.

| `dh.wraxall` | Approach | Then |
|---|---|---|
| refused | Grapples fly. **Swing across on the roll window**: a jump pad at the rail (power 14, push +x 9) is safe only while the gap is under 3 m. | Two waves of 3 raiders on deck. Strike down the cabin door (60 HP). |
| told | At full dark, **three lanterns in a row** show at the *Restitution*'s stern. Ride the jolly boat to her stern and climb Inés's rope ladder to the window. | Quietly lift the door bar from inside. One wave as the alarm goes up, then swing back across. |
| sold | Wraxall hails a parley and lays a plank across. The player crosses openly. | The cabin scene (below). If the player gives him the nest, Inés walks free across the plank and nobody fights. If they cut the lantern lanyard (the signal), a fight with two waves follows. |

**Allies:** signed gives 4 crew who fight beside the player, so each wave has 2 raiders fewer. Hired gives Sunday alone. With `hornigold`, Hornigold refuses to board an English ship: only Rufina and Tito come, by the jolly boat. In that case the refused variant becomes the told approach, without the lanterns: the ladder is a line Tito throws up to the stern gallery.

**The melee choice** happens on every route, as the player leaves the cabin with Inés. Wraxall's boom swings loose in the scramble and knocks old **Oakes** overboard; he can't swim. At the same moment **Wraxall's chart case** lies on the cabin table, 6 m away. There's time for one interact:
- **"Throw a line"** at the rail → `dh.oakes = 'saved'`. Oakes climbs aboard the player's sloop, a prisoner-guest.
- **"Take the chart case"** → `dh.chart = 'taken'`. Oakes's own crew haul him out; he lives either way.

Then grapples part, the *Restitution* runs off into the squall's tail, and `w.record('boarding', t)` logs the time.

## Encounters and set pieces

- **Navigating by sun and watch** on a rolling deck, with the answer pegged on the traverse board.
- **The squall:** reefing in the rain, with the boom 4.5 m up and gusts trying to throw the player off it.
- **Swinging across on the roll:** two hulls rising and falling, and a jump that only works for a moment in every four seconds.
- **Inés in the stern cabin.**

## Collectibles and codex

**Journal pages** (Inés's notes in the margins of Wraxall's almanac, found in his cabin):
1. "Wraxall reckons well. Better than me at sea. Worse than me at lying."
2. "Mateo would have liked him. That's the worst thing I can say about anyone."
3. "Today I almost told him about the Swallow's balances, just to talk to someone who would understand."

**Bottles:**
3. Hooked from the sea on day 1: "Day 55. He no longer believes my noon sights. He takes his own now. He is better than I'd like."
4. In the *Restitution*'s cabin: "If they come for me, I'll be the one shouting directions."

**Codex:**
- *Dead Reckoning and the Traverse Board:* every half hour, pegs record the course and speed, and the watch's track is worked out from them.
- *The Lead Line:* depth by the fathom. Tallow in the lead's hollow brings up the bottom, and pilots knew coasts by their sand.
- *The Bermuda Sloop:* fast and handy, with a single mast. The favourite of privateers and pirates.

## Dialogue

### Noon

**Sunday:** "No navigator aboard. The last one went ashore at Nassau and married a widow with a tavern. Wise. So it's you."
*Lines by `dh.articles`:* signed: **Sunday:** "You signed. That makes you the navigator by vote: mine." / hired: **Sunday:** "You hired us. Navigation's included in your fee." / hornigold: **Hornigold:** "My master's drunk and my mate can't count. Show me what the Spaniards taught you."
*After puzzle 3:* **Lalo** (at the traverse board): "North-west, five knots, eleven hours. I've pegged it. Look, it's a real map. No whales."

### The squall

**Sunday:** "Squall coming. Take in a reef, or lose the sail. Three points on the boom, and tie them tight."
*If signed:* **Pike:** "Rabbit out of the hole!"
*After the third point:* **Sunday:** "Good. Now hold on to something you love."

### Dusk: the sail

**Lalo:** "Sail! There! It's her, the *Restitution*!"
**Rufina:** "Running the same way. He's not lost any more. Somebody stopped lying to him."
*If told:* **Lalo** (at full dark): "Lanterns! One, two, three, in a row at her stern! That's her. That's her saying 'ready'!"
*If sold* (Wraxall's voice carries across the water as the sloops close): "My friend from nowhere! I believe we have business. Come across. Alone, if you'd be so kind."

### The stern cabin

**Inés** (refused or told; she's been sitting very straight on Wraxall's sea chest for an hour): "You're late." *(beat)* "You came anyway. I told you not to." *(beat)* "Thank God you never do as you're told."
*If refused, through the splintered door:* **Inés:** "You broke the door. He'll bill you. He bills everyone."

*If sold:*
**Wraxall** (at his table, Inés beside him, upright and furious): "Let us be exact. You know where the nest is. I know you know. Your cosmographer won't tell me, and I have stopped asking her. Give me the place, and she walks across that plank, and nobody's blood is spilled tonight."
**Inés:** "Don't."

> **Ask (Wraxall):** "Well?"
> 1. "Twenty-seven twenty-one north, four degrees and two minutes east of Havana." → `dh.gave = true` → **Wraxall:** "Thank you." *(He bows to Inés.)* "Madam, you're free." / **Inés** *(crossing the plank, not looking at the player)*: "You gave him the nest." *No fight. Wraxall sails at once (the melee choice still plays as he casts off).*
> 2. *(Cut the stern lantern's lanyard: the signal.)* → **Wraxall** *(as the lantern drops)*: "Ah. Inexact of me." *A fight follows, as in the refused variant.*

**Oakes** *(in the water, once the boom has knocked him over)*: "Can't swim! Whitby lads never learn! Line! LINE!"
*If saved:* **Oakes** (dripping on the player's deck): "Elias Oakes. Thank you. I'll not fight you. I'll not fight anybody. I'm fifty-eight."
*If not:* **Oakes** (being hauled up by his own crew): "Bless you anyway! I saw you look!"
**Wraxall** (from his quarterdeck as the grapples part; he never shouts, and his voice carries anyway): "Well done. Truly. I'll see you on the bank, my friend from nowhere. Let us both be exact."

### The reunion (the sloop's cabin)

**Lalo** (flinging himself at Inés): "I drew you alive! On every map! All winter!"
**Inés:** "Lázaro. You're taller. Stop it at once."
**Inés** (to the player): "And you. Did you read my letters? Then you know what she is."

> **Ask (Inés):** "Well?"
> 1. "A clock that finds longitude." → **Inés:** "Yes. Twenty-three pounds of brass and twelve rubies, and ten years."
> 2. "A way home." → **Inés** *(a long pause)*: "That's what I'd have said, if I'd ever said it out loud."
> 3. "The reason you lied to everyone." → **Inés:** "Yes. I'm very good at it. I hope I never need to be again."

**Inés:** "Then you also know it's over."
**Inés:** "She runs eight days on a winding. Eight. She went into the sea on the thirty-first of July. It's been seven months."
**Inés:** "She's stopped. Even if we find her, the proof is broken. Her rate means nothing unless she's run without a stop from Havana's noon. Ten years, and a stop."
*Lines by `dh.promise`:*
- promised: **Inés:** "You promised to finish the proof. I'm releasing you. There's nothing left to finish."
- right: **Inés:** "You said you'd do what's right. I don't know what's right now. I only know what's broken."
- hush: **Inés:** "You told me not to talk like that. You were right. Look what happened when I stopped."
*If `dh.gave`:* **Inés:** "And Wraxall knows the place, because of you. I'd like to be angrier. I'm too tired. Tomorrow I'll be angry."

> **Ask (Inés):** "Well?"
> 1. "Let's find her anyway." → **Inés:** "Why?" / *(the player has no answer; Lalo does)* **Lalo:** "Because she's yours."
> 2. "The proof isn't the only thing she's for." → **Inés:** "No? Tell me what else when you know it."

### Night: the lead, then dawn

**Sunday** (at the rail with the lead): "Nine fathoms, white sand and shell. We're on the bank's edge. Your nest is close."
*Dawn. A low cay rises out of turquoise water, ringed in breakers and wrecks. On its north rock stands a tall timber tower, unfinished, and from a stone hut a thin thread of smoke goes up.*
**Rufina:** "Someone lives there."
**Lalo:** "On an island nobody can find?"
**Inés** (very quietly): "Someone found it."
*`dh.ch.8 = 'done'`. Travel to `dh-09-isle`.*

## What the player learns and earns

- **Learns:** a full navigation fix: latitude by the sun, longitude by time, distance by the log, and confirmation by the lead. Also Inés's fear that the proof is broken.
- **Earns:** the title **Navigator**, the Cutlass of the Small Mercy (Sunday's gift before the boarding; scoped blade, a cosmetic outside the campaign; Hornigold gives "an old cutlass" on his path), the record `boarding`, 3 codex entries, 3 journal pages and 2 bottles.
- **Flags:** `dh.course`, `dh.gave`, `dh.oakes`, `dh.chart`, `dh.bottle.3`–`4`, `dh.ch.8`.

## Hook

An island no chart can place, and smoke rising from it.
