# Chapter 2: The Low Wings

**World:** `lsb-pterousa` · **Story time:** day 2 · **Playtime:** 40–50 minutes
**Rules:** `deny: ['board']` · **killY:** −15 · **Music:** root 64, lydian, 92 bpm, bright
**Theme:** `sky: 'clear-sky'` with `skyBackdrop: false`; a hard blue sky, white light, fog 200–800 m. Seabird particles (white `float` motes) circle each stack.

## Summary

On the stack island of the wingmakers, Perdika needs a test pilot for the wings she is too frightened to wear. The player climbs the stacks, gathers great feathers, balances the wing and makes the test flight through the natural arch called the Eye. Master Ikmalios's ship in the lagoon carries the Compass of Perdix, which Perdika's family says the Daedalids stole a century ago, and the player decides what to do about it.

## Locations and layout

Origin (0, 0, 0) is the centre of the lagoon (water at y 0, a splash zone below y −0.4). The beach is to the south (+z).

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Lagoon** | (0, 0, 0) | radius 120 | Turquoise water sheet (opacity 0.85). Falling in sends you to the last checkpoint. |
| **South beach and village** | (0, 1, 85) | 160 × 40 | Sand at y 1. Five wingmaker houses with reed roofs, drying racks of feathers, the Perdikid shrine (a stone partridge on a plinth). Checkpoint `beach`. |
| **West pier and the *Labrys*** | (−65, 0.5, 30) | pier 30 × 4 | Ikmalios's ship: a red hull 26 × 3.5 × 7 with painted eyes on the bow, a 14 m mast with rigging (climbable ramps of rope), and a stern cabin holding the bronze chest. |
| **The nine stacks** | on a ring of radius ~100 m | heights 20–60 m | Cylinders (cliff texture, sides 9) with ledge spirals. Rope bridges are 0.8 m plank boxes. Named in clockwise order from the beach: Low Stack (20 m), Cormorant (28), Twins (32 and 32), Gull Pillar (60, thin, radius 4), the Eye stacks (two, joined by the arch), Kestrel (48), Old Wife (36). |
| **Stack of Kestrels** (workshop) | (0, 48, −100) | radius 12 | Perdika's workshop: a timber deck with a reed roof, wing frames, the Balance, the wind-ribbon poles and the launch plank pointing south-east (a 5 m plank at (6, 48, −92), yaw 150). Checkpoint `kestrel`. |
| **The Eye** | (60, 27, −55) | opening 14 wide × 10 high (y 22–32) | A natural arch between the two Eye stacks. Ribbons hang across it as a gate. |
| **Bird chimney** | (35, 15, −5) | wind box 10 × 30 × 10, force (0, 32, 0) | A seabird updraft over the lagoon, past the Eye. White motes rising. |
| **Landing circle** | (0, 1.05, 70) | radius 6 | A ring of ochre stones on the beach. |
| **Glauke's loom-floor** | (−30, 1, 66) | 7 × 7 tiles of 1.5 m (10.5 m square) | Flat stones in the sand, with Glauke's standing loom at the north edge (a frame 3 m tall showing the pattern). |
| **Hidden cove** (`cow-night` arrival) | (90, 1, 95) | 20 × 15 | Outside the stack ring, with a path through a sea cave into the beach village. |

**Climbing routes.** From the beach: Low Stack (a spiral path) → rope bridge → Cormorant (ledges 1.5 m apart) → the Twins (a 4 m jump between them) → Kestrel (a ladder of pegs, 0.35 m steps, on its south face, with an updraft ribbon at the 30 m ledge). About 4 minutes on foot.

**Sightlines.** From Kestrel's deck: the whole ring of stacks, the Eye framing the open sea, the *Labrys* below to the west, Glauke's loom as a speck of colour on the beach, and Omphe's plume far to the north-west. Talos is not visible from here, so the strait in Chapter 3 is a surprise.

## Objectives

### Critical path
1. **Arrive.** Lit: on the *Labrys* at the west pier. Dark: at the hidden cove at dawn; the *Labrys* sails in at mid-morning.
2. **Find Perdika:** climb to the Stack of Kestrels.
3. **Learn the wind:** Perdika's ribbon lesson. Ride the ribbon updraft to the 30 m ledge if you haven't already.
4. **Gather seven great feathers** from seven nests (0 of 7). The seventh is in a gull's nest at the *Labrys*'s masthead.
5. **Balance the wing** on Perdika's Balance.
6. **Perdika's fear:** a dialogue choice.
7. **The test flight:** launch from the plank, pass through the Eye, catch the bird chimney and land in the circle.
8. **The compass:** Perdika sees the Compass of Perdix aboard the *Labrys*. Steal it, ask for it, or leave it.
9. **Leave on the *Patient Cow*** with Perdika aboard (she delivers the palace's wing order and keeps an eye on her wings).

### Optional
Glauke's loom-floor trial (Athena); kindness 2 (Kyllo's sandal); Old Horn sighting 2 on Gull Pillar; the High Line glide course (a record); 15 tin-drops. **Dark only:** an optional stealth stretch on the beach to avoid the searching Axe-Bearers. Being seen only triggers a short, polite scene with Ikmalios; nothing fails.

## Puzzles

1. **Reading the wind.** Ribbons on poles show the air. Ribbons standing straight up mark an updraft (a `wind` box, force up 22–32) that lifts even a walking player. Ribbons streaming sideways mark a crosswind (force 8 sideways) that pushes you off narrow bridges unless you cross in its lulls (a 4 s on, 3 s off cycle; needs toggleable wind, BUILD.md feature 5). *Solution:* stand under vertical ribbons to rise, and cross bridges when the sideways ribbons go slack.
2. **Seven nests.** Nests sit on Cormorant (18 m), Twins east (26), Old Wife (30), Eye south (24), Low Stack's underside (an overhang at 12 m reached from the rope bridge), Kestrel's north face (40, by the peg ladder), and the *Labrys*'s masthead (14). Gulls burst into white feathers when you approach; they never hurt you.
3. **The Balance.** A beam scale. The finished left wing weighs **12 spans**. The empty right-wing frame weighs **2**. Five pieces lie on the bench: Wax 4, Wax 6, Feather 1, Feather 3, Reed 5. Perdika's rules are carved on the beam: *"Three pieces to a wing. Never more wax than feather. Reed is for the spine."* Interact with a piece to place or remove it; the beam tilts as you go.
   *Solution:* **Feather 1 + Feather 3 + Wax 6** (2 + 1 + 3 + 6 = 12). That is one wax to two feathers, with no reed, and it is the only answer: 1 + 4 + 5 breaks the reed rule and 4 + 6 is only two pieces. Wrong answers get a line from Perdika (dialogue 2.4).
4. **The test flight.** Launch at y 48. Gliding loses about 1 m of height for every 4.5 m forward. The Eye is 72 m away and you arrive at about y 32, the top of the opening. *Solution:* run the plank, jump and glide straight at the ribbons. After the Eye, turn into the bird chimney and circle in it to gain 12–15 m, then glide 150 m to the circle. Without the chimney you land in the lagoon about 25 m short.
5. **Glauke's loom-floor.** The 7 × 7 floor starts blank. A stone lights (a thread) when you step on it. Stepping on any stone that is not part of the pattern unlights everything. The pattern is shown only on the loom, so the player has to look back at it while weaving.
   Pattern (rows from the loom end; X = thread):
   ```
   X . . . . . X
   X X . . . X X
   X X X X X X X
   X . X X X . X
   X X X . X X X
   . X X X X X .
   . . X . X . .
   ```
   *Solution:* light all 31 stones without touching a gap. The gaps (the eyes at row 3, the beak at row 4, the gaps between the feet) need short jumps of 1.5–3 m. Glauke offers no hint beyond "Look at what you're making."

## Set pieces

- **The test flight.** Perdika shouts calculations from the deck as toasts ("Lean! Less! LESS!"). The player goes through the Eye with the open sea beyond, rises in a column of wheeling seabirds and lands on a beach of drying feathers. First flight, first wonder.
- **The masthead.** Climbing the palace ship's rigging for the seventh feather, the player looks down at the deck of the people who are coming for them, and sees the compass case through the open cabin roof. That plants the choice before Perdika names it.
- **The High Line** (optional replay): ten ribbon hoops between stacks, from Gull Pillar's updraft to the beach, timed with `w.record('lsb-highline', t, { better: 'lower' })`.

## Collectibles and codex

- **Tin-drops (15):** stack ledges and the bridges' undersides.
- **Old Horn sighting 2** (`lsb.goat.2`): on top of Gull Pillar (60 m, radius 4). Reach it from Kestrel's deck: a short glide to the pillar's updraft (force 34), which lifts you to the top. "Old Horn stands on the highest rock in the Isles, chewing a feather. Gulls are giving her a wide berth."
- **Codex:**
  - **Pterousa:** "A lagoon ringed by sea stacks. Every child here learns to fall before they learn to walk. Most of them are bad at it."
  - **The Perdikids:** "The wingmaker family of Pterousa, descended from Perdix, inventor of the saw and the compass."
  - **Perdix:** "Daedalus's nephew, cleverer than his uncle. Daedalus pushed him off a height out of jealousy; Athena caught him and made him a partridge. Partridges never fly high."
  - **Daedalus:** "Builder of the labyrinth and of wings that worked. His son flew too high and fell. His descendants still build for the House."
  - **The Low Wings:** "Reed, feather and a little wax, designed to glide and never climb. 'Partridges live. Eagles get shot.'"
  - **The Compass of Perdix:** "Two brass legs and a hinge. It draws a perfect circle. The Perdikids say it was taken by the Daedalids and never given back."
  - **The *Labrys*:** "The House's swiftest ship, with eyes painted on the bow so it can see where it is going."
  - **Glauke:** "A grey-eyed weaver who mends sails in every harbour. There is always an owl near her loom. Nobody has seen it arrive."
  - **Wax:** "Wax holds feathers. Sun melts wax. Every wingmaker's child is told this before bed, and has nightmares."

## Dialogue

### 2.1 Arrival
**Lit** (on the *Labrys* at the pier):
**IKMALIOS:** "Pterousa. Mind the gulls; they're Perdikid gulls and they hate me personally."
**IKMALIOS:** "The wingmaker you want is the granddaughter, Perdika. Best hands in the Isles, worst manners. I'm not welcome up there. You'll do better alone."
**Dark** (the hidden cove):
**KESSA:** "Out you get. The palace ship'll be in by mid-morning; they'll be asking after a stranger from Thyra. You're a stranger from nowhere in particular. Go and see the wingmaker. Top of the tall stack. Don't fall off."

### 2.2 Perdika (on reaching the Kestrel deck)
**PERDIKA:** "Stop. Don't step there, that's a wing. Step there. No, there. Saw and compass, are all strangers this big?"
**PERDIKA:** "You climbed Kestrel. Nobody climbs Kestrel. Four hundred and twelve pegs; I counted them putting them in."
**PERDIKA:** "I'm Perdika. I make wings. The House ordered twelve pairs for the Festival, and I need someone to test-fly the new design, because I am not doing it."
**PERDIKA** (ask): "You'll do it. Won't you?"
- → "Why not you?" **PERDIKA:** "Because I'm a genius, not an idiot. Next question."
- → "Is it safe?" **PERDIKA:** "It's safer than walking. Walking kills hundreds of people a year. Nobody counts."
- → "All right." **PERDIKA:** "Good. Don't say 'soar'. I hate 'soar'."
**PERDIKA:** "The frame's ready. It needs seven great feathers from the nests on the stacks, and it needs balancing. Then you jump off that plank and do exactly what I shout."

### 2.3 The wind lesson
**PERDIKA:** "See the ribbons? Wind's invisible; ribbons aren't. Ribbon straight up means the air's going up, and if you stand in it, it takes you with it."
**PERDIKA:** "Ribbon streaming sideways: crosswind. Wait till it goes slack, then cross. Don't be brave. Brave people are mostly at the bottom of the lagoon."
*(Gear line: if the player has a glider:)* **PERDIKA:** "Is that a glider? Let me see. Hm. Wide, flat, climbs too well. Somebody's going to fly that into the sun one day. Use mine here."

### 2.4 The Balance
*(On interacting, until solved:)* **PERDIKA:** "Left wing's done: twelve spans. Right frame's two. Make the right side twelve. Rules are on the beam."
- *Reed used:* "Reed's for the spine! A wing with a reed in it flies like a door."
- *More wax than feather:* "That's a wax wing. Wax wings are for people who want to be famous after they're dead."
- *Two pieces:* "Three pieces. Three. I didn't carve it on the beam for decoration."
- *Right weight, wrong rule:* "It balances, and it's still wrong. Both things can be true. Read the beam."
- *Solved:* "Feather, feather, wax. One holds, two fly. Look at that: you can count."

### 2.5 Perdika's fear
**PERDIKA:** "Right. Strap in. I'll stand here and shout. I was meant to test it myself, you know. Gran said I should."
**PERDIKA:** "I make the best wings in the Isles and I can't stand on that plank. My great-great-great-grandfather was pushed off a cliff. A goddess caught him and made him a bird. We still dream about the falling part."
**PERDIKA** (ask): "Go on. Say something wise. Everyone does."
- → "Fly when you're ready. I'll go first." *(`lsb.perdika.trust = true`)* **PERDIKA:** "...When I'm ready. Nobody ever said that. Fine. You first. I'll watch the wing, not the drop."
- → "Just jump. It's your design." *(`lsb.perdika.trust = false`)* **PERDIKA:** "'Just jump.' That's what HE said, probably, at the top of the Acropolis. Strap in, Stranger."
*(Gives `lsb-low-wings`, back slot, `glide`, loaned; equips it. Objective: "Fly through the Eye and land in the ochre circle.")*

### 2.6 The test flight (toasts and lines)
- At the plank: **PERDIKA:** "Run, jump, hold Space! Straight at the ribbons!"
- Through the Eye: **PERDIKA:** "THROUGH! Ha! Now right, into the birds, circle, CIRCLE!"
- In the chimney: **PERDIKA:** "Up, up. Enough! Beach! Now!"
- Into the lagoon: **PERDIKA:** "Wet. That's data. Again."
- In the circle: **PERDIKA** (later, on the beach, out of breath from the stairs): "In the circle. In the CIRCLE. The wing works. I made a wing that works with a person in it." *(Title **Low-Flyer**.)*
**PERDIKA:** "Keep them. On loan. Bring them back unbroken, or bring back an excellent reason."

### 2.7 The compass
*(Perdika, on the beach, looking at the *Labrys*.)*
**PERDIKA:** "That's the palace ship. Of course. Ikmalios. He buys my wings, he doesn't look at me, and he pays in good tin. I hate that he pays in good tin."
**PERDIKA:** *(if the player climbed the masthead)* "You were up his mast. Did you see a brass case in the cabin? Two legs and a hinge?" *(otherwise)* "Gran says he carries it everywhere. A brass case with two legs and a hinge."
**PERDIKA:** "That's the Compass of Perdix. My family's. The first circle anyone ever drew on purpose. The Daedalids took it when they took everything else, and they've been drawing labyrinths with it for a hundred years."
**PERDIKA:** "Tonight the crew will be drunk on our wine. I could get it. We could get it."
**PERDIKA** (ask): "Well? Will you help me take back what's ours?"
- → "Let's take it." *(`lsb.compass = 'stolen'`)* **PERDIKA:** "Saw and compass. Midnight. Bring your knife; the case has a clay seal."
- → "Ask him for it. Openly." *(`lsb.compass = 'asked'`)* **PERDIKA:** "Ask. A Daedalid. ...You do it. If I do it I'll bite him."
- → "Let it go. It's just a tool." *(`lsb.compass = 'left'`)* **PERDIKA:** "Just a tool. A wheel's just a tool. Fire's just a tool. Fine. FINE." *(She stomps off and comes back an hour later.)* "It's still ours."

### 2.8 Consequences
**Stolen** (night; the *Labrys* deck has two Axe-Bearers on fixed patrol loops with sight cones of 6 m that pause at the cargo):
*(The player slips between the cargo, strikes the case's clay seal and takes the compass `lsb-compass`.)*
**PERDIKA** (on the beach): "It's warm. Brass shouldn't be warm. Hello. Hello, you." *(She keeps it.)*
*(Next morning, at the pier:)* **IKMALIOS:** "Someone broke a seal on my ship last night and took one thing. Not the tin, not the wine. One brass compass." *(He looks at the player for a long moment.)* "Well. It's a long way to Kerynthos." *(He leaves. From here on he is cold.)*
*(Glauke, at the loom, if visited afterwards:)* **GLAUKE:** "A thing stolen back is still stolen. Ask the partridge's family what pushing does to a house."

**Asked** (the player goes to the *Labrys*):
**IKMALIOS:** "The compass. She sent you. No, she didn't; she'd have come with teeth. You came."
**IKMALIOS:** "Do you know what I draw with it? Every corridor of the House. Every turn of the labyrinth. Every horn of the Listening Room. My family built the Isles' cage with her family's circle."
**IKMALIOS:** "I can't give it to you. Not here, not with the crew watching. Tell her..." *(he stops)* "Tell her nothing yet. Tell her the House pays in good tin."
*(Sets `lsb.ikmalios.shaken`; in Chapter 4 he gives the compass back privately.)*
**PERDIKA** (when told): "'Nothing yet.' Hm. That's the first thing a Daedalid has ever said to us that wasn't a price."

**Left:** no scene. Perdika's codex line updates: "She mutters about it in her sleep."

### 2.9 Glauke the Weaver (the loom-floor; optional)
**GLAUKE:** "You fly like a partridge. Good. The ones who fly like eagles keep me busy."
**GLAUKE** (ask): "Do you weave?"
- → "No." **GLAUKE:** "Then learn. It's the same as thinking, only you can wear the result."
- → "Who are you?" **GLAUKE:** "Someone who mends sails. Who are you? Ah, you don't know yet either."
**GLAUKE:** "My loom has a pattern on it. The floor wants the same pattern. Step only on the thread. Look at what you're making."
*(On success; a grey owl lifts off the loom frame.)*
**GLAUKE:** "There. An owl. Wisdom is mostly looking up before you step." *(Owl Brooch cosmetic; `lsb.sign.athena`.)*
**GLAUKE:** "Look after the little bird, the wingmaker. I caught one of hers once, a long way up. I'd rather not have to do it again."
*(Repeat talk, one per visit:)*
- **GLAUKE:** "Olive oil is the best gift anyone ever gave a city. Better than a spring of salt water, whatever some people say."
- **GLAUKE:** "The Daedalids make beautiful things and never ask what they're for. That's not cleverness. That's a very fast kind of stupid."

### 2.10 Kyllo's sandal (kindness 2)
*(Kyllo on the beach, hopping, one sandal on.)*
**KYLLO:** "Ah! Friend! A gull took my other sandal to the Twins. Bird thinks it's a nest. It's a sandal. Very fluttery, warm, you'll know it."
*(The sandal is on Twins west at 22 m. Bring it back: `lsb.kind.2`.)*
**KYLLO:** "My feet thank you. I can't go anywhere without them, and I go everywhere."
*(If the player keeps it and leaves without returning it, Kessa says in Chapter 3: "Why have you got one sandal in your bag? It's flapping.")*

### 2.11 Leaving
**PERDIKA:** "The House's twelve pairs go to Kerynthos on the cow-boat, and so do I. I'm not trusting my wings to a Daedalid hold."
**KESSA:** "Wingmaker aboard. Wonderful. She'll measure my mast and tell me it's wrong."
**PERDIKA:** "It's wrong."
*(Lit:)* **IKMALIOS:** "You're sailing with the cow? Suit yourself. Show Talos the seal at the strait; he likes things done properly."
*(Travel to `lsb-strait`.)*

## Learned and earned

- **Learns:** the Daedalid–Perdikid feud; Ikmalios draws "the Isles' cage" with the compass; the Listening Room has bronze horns; Glauke and the owl.
- **Earns:** the title **Low-Flyer**; the Low Wings (loaned glide for the rest of the campaign); optionally the Owl Brooch, kindness 2, Old Horn 2 and a High Line record.

## Hook

That night, Perdika sits on the *Patient Cow*'s rail checking stitching by lamplight and asks without looking up: "What do they do with the old Voices? When the new one comes. Gran said they build them a little house inside the mountain. Gran also said the moon was a cheese." From the north, very faintly, comes a deep metal sound, three slow beats, like a bell the size of a hill.
