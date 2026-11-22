# Chapter 1: The Door in the Sea

**World:** `lsb-thyra` · **Story time:** day 1, morning to dusk · **Playtime:** 40–50 minutes
**Rules:** `deny: ['board']` · **killY:** −20 · **Music:** root 62, dorian, 76 bpm
**Theme:** morning uses `sky: 'day-sky'`, a pale-blue horizon and a high south-eastern sun. Dusk (from step 8) has an orange horizon, a violet top, a low western sun and stars 0.3. It needs a theme blend (BUILD.md feature 7); until then, swap themes on the dusk trigger.

## Summary

The player wades out of a glowing sea arch into a cave of votive lamps, climbs the lamp-lit chimney and is welcomed by Eumaia, who washes their feet before asking their name. A tremor scatters her guest tablets across the island. Gathering them reveals that every ninth year one stranger "went up the mountain" and never came back. The last was Linnet, from Elsewhere. At dusk a palace ship comes for the new stranger, and on the island's peak the player chooses whether to answer its signal.

## Locations and layout

Origin (0, 0, 0) is the arrival point. −z is inland (north). The island is about 180 × 220 m.

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **The Door** (portal to `hub`) | (0, 0, 10), yaw 180 | arch 8 × 9 | A sea arch at the back of the cave. `arrive: 10` puts the player at the origin. |
| **Cave of Lamps** | (0, 0, −16) | 32 × 18 high × 56 | Wet sand at y 0 under a translucent water sheet at y 0.25 (no collider). Cave-rock walls with votive niches from 1 to 6 m up. |
| **Sea mouth** | (0, 6, −44) | 14 × 12 opening | The open sea beyond. A splash zone below y −0.5 returns you to the last beacon. |
| **Votive Chimney** | (−11, 16, −23) | shaft 6 × 32 × 6 | 17 ledges (1.6 × 0.4 × 2.0) at 1.7 m steps, alternating west and east walls. Four ledges have no lamp and crumble (delay 0.4, respawn 3). |
| **Gift Niche** | (−11, 15.3, −26) | 4 × 3 × 2 | Rest landing with offerings. Checkpoint `chimney`. |
| **The Shelf** | (−10, 32, −35) | 60 × 50 | Grassy clifftop at y 32, with low dry-stone walls. |
| **Stranger's Hearth** | (−22, 32, −38) | 14 × 7.5 × 10 | Two storeys: a stone ground floor of 4 m and a timber upper of 3.5 m, in ochre-and-blue plaster. Flat roof at y 39.5 with stone horns, reached by an outside ladder ramp. The round hearth inside has radius 1.2. |
| **Courtyard** | (−11, 32, −33) | 12 × 10 | Foot basin at (−12, 32, −31), bread table at (−9, 32, −35), olive tree at (−6, 32, −41) with its crown 4–7 m up. |
| **Goat terraces** | (5, 32 → 88, −60 → −140) | 7 tiers, 8 m apart, 12 m deep | Stairs switch back at x −25 and x 35. "Through-stones" (0.3 m steps) make shortcut climbs. Crumbling cap stones on tiers 3 and 5; a wind saddle between tiers 5 and 6. |
| **Owl's Watch** | (30, 92, −150) | knob 14 across | Beacon pyre (stone base 3 × 1.5 × 3 with a wood stack) at (30, 93.5, −152). Checkpoint `watch`. |
| **Cliff stair** | (10, 32, −14) → (40, 3, 4) | 2 m wide | Three flights down the south-east cliff. |
| **Harbour village** | (52, 3, 6) | 40 × 30 | Six flat-roofed houses (roofs at y 7–10, linked by planks). Sundial stone at (46, 3, 2). |
| **Quay** | (60, 1.5, 24) | 24 × 1 × 5 | Planks. The *Patient Cow* moored at (66, 0.5, 34): hull 20 × 3 × 6, an 11 m mast and a striped sail. |
| **Tide pools** | (34, 0.5, 24) | 16 × 12 | Seven stepping stones bobbing on movers (6 s cycle, staggered). |
| **Arch-top path** | (0, 14, −46) | cliff ledges | From the tide pools along the outer cliff to the top of the sea arch. |

**Sightlines.**
- From the arrival point, through the sea mouth: **Omphe**, a smoking cone on the horizon (a backdrop model at (−420, 0, −1300), 260 m high, with rising ash particles). This is the campaign's first image.
- **Talos** as a decorative silhouette, 30 m tall, walking from (500, 0, −1000) to (−300, 0, −1000) and back every 240 s. His position comes from `w.time`. Visible from the cave mouth, the Shelf and Owl's Watch.
- **At dusk from Owl's Watch:** Omphe's red glow to the north-west, the sea stacks of Pterousa to the east, and the palace ship's three lanterns approaching (a mover from (−200, 0, −600) to the quay over 90 s).

## Objectives

### Critical path
1. **Follow the lamps** through the cave to the chimney.
2. **Climb the Votive Chimney.** Lit ledges only; checkpoint at the Gift Niche.
3. **Meet Eumaia** on the Shelf.
4. **Feet first** (the basin), then **bread and salt** (the table). Receive the bread (`lsb-bread`), the Bronze Guest-Knife (`lsb-guest-knife`, loaned, `blade`) and your guest-token (`lsb-token-own`).
5. **The tremor.** *Find Eumaia's six guest tablets (0 of 6).*
6. **Return the tablets.** Eumaia reads the pattern and gives you Linnet's token half (`lsb-token-linnet`).
7. **The harbour:** meet Captain Kessa and book passage.
8. **Dusk:** climb the goat terraces to Owl's Watch.
9. **The beacon:** light it or leave it dark.
10. **Leave Thyra** on the palace ship (lit) or the *Patient Cow* (dark). Travel to `lsb-pterousa`.

### Optional
The Shadow Race (Kyllo's trial, Hermes); kindness 1 (bread for Teuthis); Old Horn sighting 1; 20 tin-drops; Myrrha; the Gift Niche and the boot-shaped lamp.

## Puzzles

1. **No lamp, no trust.** In the chimney, lamp ledges hold and dark ones crumble. *Solution:* jump only to lit ledges. The sign at the bottom hints at it: "Trust a lit step."
2. **The olive tablet,** wedged 6 m up in the crown. *Solution A:* the Hearth ladder to the upper balcony (y 35.5), then the thick branch (a solid cylinder at y 36.2), then the crown. *Solution B:* strike the trunk three times with the guest-knife (key 1, within 2.6 m) and the tablet drops. This teaches that strikes act on the world.
3. **The drifting boat.** A rowing boat drifts on a mover between the quay end (62, 0.6, 28) and Gull Rock (76, 0.6, 28), at 1.5 m/s with 2 s pauses. *Solution:* board it during the pause at the quay.
4. **The tide pools.** Stones rise to y 0.6 and sink to y −0.8 on a 6 s cycle, offset 0.8 s each, so a crest of risen stones travels outward. *Solution:* ride the crest instead of jumping ahead of it.
5. **The goat's tablet.** Old Horn stands on a tablet on tier 4 and won't move; a strike earns an indignant "Mehh". A bell on the tier-3 fence has a carved sign: "Ring for supper." *Solution:* ring it (interact or strike) and she trots down.
6. **The roof tablet,** between the stone horns. *Solution:* the ladder, then a 1.8 m jump from the parapet.
7. **The last tablet** (Linnet's) appears under the Hearth's threshold stone once the other five are returned.

## Set pieces

- **The Door.** The player walks out of the light into knee-deep shining water. Three hundred small flames line the cave, and through the sea mouth a volcano smokes while a bronze giant walks the horizon. Six seconds of surf before the music comes in.
- **The tremor.** `w.shake(1.4)`, dust bursts, six tablets fly out of the Hearth (a burst at each landing spot), goats scatter, a bell clangs. Down in the harbour the water sheet drops 2 m and returns over 3 s, a quiet clue for Chapter 8.
- **The beacon at dusk.** An orange sky, Omphe glowing red, the palace ship's lanterns on the sea and a conch horn across the water. The first big choice, made beside an old woman and a goat. A lit pyre throws a 20 m column of sparks.

## Collectibles and codex

- **Tin-drops (20):** Gift Niche 2, olive crown 1, through-stones 6, village roofs 5, Gull Rock 2, tide pools 2, arch top 2.
- **Old Horn sighting 1** (`lsb.goat.1`): Old Horn on top of the sea arch at (0, 14.5, −46), although she was on tier 3 a minute ago. Reached along the arch-top path. Interact: "Old Horn chews something thoughtfully. You have no idea how she got up here."
- **Codex:**
  - **Thyra:** "The Door island. Goats, thyme, one harbour and a sea arch that sometimes shines."
  - **The Door:** "Strangers walk out of it, never in, and understand the island's speech at once. Linnet called it 'a feature'."
  - **Xenia:** "Guest-friendship. Wash the guest's feet, feed them before you ask their name, give a gift, never harm someone under your roof."
  - **The Stranger's Hearth:** "Its fire has not gone out in 310 years. Eumaia feeds it olive wood and complaints."
  - **The Guest Tablets:** "One for every stranger, each with the sign they chose. 312 tablets. Six marked with a mountain."
  - **Eumaia:** "Keeper of the Door for fifty years. Has washed 312 pairs of feet and one very confused dolphin."
  - **Linnet:** "Sign: a small bird over a boot with a spring under the heel. 'Laughs like a gull. Eats like two.' Marked with the mountain."
  - **Omphe:** "The sacred mountain. Its oracle speaks through a stranger's mouth. Silent for thirty days. Smoking for nine."
  - **Talos:** "A bronze giant walks the Strait of Teeth three times a day. Children wave. He never waves back; nobody told him to."
  - **Tin-drops:** "There are no coins in the Isles. Tin is getting scarce, and nobody likes to say why."
  - **Kyllo:** "A pedlar with a bottomless pack and a tortoiseshell lyre. Eumaia says wet sand never keeps his footprints."

## Dialogue

`→` is a choice option and what it sets. Lines under an option play only on that branch.

### 1.1 Signs (no speaker)
- **Cave sign "THE LAMPS":** "Whoever you are, you are welcome here. Follow the lamps up. Trust a lit step. — the Keepers of the Door"
- **Boot-shaped lamp:** "A clay lamp shaped like a boot, with a coiled spring under the heel. Someone keeps it filled."
- **Gift Niche:** "Offerings from strangers: a blue glass bead, a bone fishhook, a feather, and a small gold coin stamped with a ring of portals. It is warm."

### 1.2 Eumaia at the chimney top
**EUMAIA:** "There you are. I saw the Door light up. Gods or goats, everyone takes that chimney slowly."
**EUMAIA:** "Don't talk yet. Feet first, then fate."
**EUMAIA** (ask): "Well? You may say one thing before I wash you."
- → "Where am I?" **EUMAIA:** "Thyra, the Door island, in the Hearth Isles, in the middle of the sea. Further than that, nobody's sure."
- → "Are you a god?" **EUMAIA:** "Me? I'm a goatherd with a bad hip. You came out of a shining rock. Let's not get ahead of ourselves."
- → "I'm just passing through." **EUMAIA:** "Everyone is, lamb. Some of us just pass slower."

(Gear and body reactions, one line, the first that applies. Robot: "And your face is a lamp. That's new." Glider: "Wings on your back! Fly low here, lamb. The sun isn't your friend." Spring boots: "Shoes that jump twice. I've seen those once before.")
**EUMAIA:** "Basin's over there."

### 1.3 Feet first (the basin)
**EUMAIA:** "Sit. Spring water, warmed on the hearth, thyme in it for luck."
**EUMAIA:** "Three hundred and twelve pairs of feet, and a dolphin once. Never been bitten. Don't spoil it."
**EUMAIA:** "Now bread and salt. Still no names."

### 1.4 Bread and salt (the table)
**EUMAIA:** "Barley bread and salt from the rocks. Eat first, then I can ask. And I'll only ask one thing: what sign do you want on your tablet?"
**EUMAIA** (ask): "A fish, a star, a wheel? Anything."
- → "A door." **EUMAIA:** "Cheeky. All right." *(`lsb.sign = 'door'`)*
- → "A goat." **EUMAIA:** "Old Horn will be flattered." *(`'goat'`)*
- → "Surprise me." **EUMAIA:** "A lamp, then, since you came up by them." *(`'lamp'`)*
**EUMAIA:** "Guest-gifts. My father's knife. Bronze, good edge. It cuts rope, rings bells and frightens nobody. It's yours while you're our guest." *(Gives `lsb-guest-knife`. Toast: "Press 1 to strike. Strikes cut, ring and break what they reach.")*
**EUMAIA:** *(snaps a small clay disc in two)* "Your half and mine. If my grandchildren ever meet yours, the halves will fit, and they'll owe each other a supper."
**EUMAIA:** "Keep a crust of that bread. You never know who's hungry."

### 1.5 The tremor (2 s later)
**EUMAIA:** "Hold on to something! Not the goat!"
**EUMAIA:** "That's the third this month. Oh no. My tablets. Fifty years of strangers, flung over the island like seed."
**EUMAIA:** "I can't climb what I used to. Six of them flew. Will you?"

### 1.6 Returning tablets (one line each, in the order returned)
- **Fish** (roof): "The fisherman from the far west who cried at the sight of olives. Stayed eleven years. Snored."
- **Wheel** (olive): "A woman with a wheel that turned by itself, no ox. Mended it on my table and left."
- **Star** (boat): "Him. Said he was a god, drank all my wine and cried about his mother. Marked with a mountain. He went up. That was the honour, that year."
- **Wave** (tide pools): "The girl with sea-green hair. Mountain mark too. Went up twenty-seven years ago."
- **Mountain only** (Old Horn's tier): "I don't even remember this one's sign. Just the mark. Thirty-six years."
- **Bird and boot** (threshold): "Linnet. Of course it's Linnet."

When all six are back:
**EUMAIA:** "Laid out together, look. Every ninth summer, one goes up the mountain. I knew it. I just never laid them side by side."
**EUMAIA:** "It's an honour. The House sends a ship, the stranger becomes the Voice of the god and lives in the god's house forever. Nobody comes back from forever."
**EUMAIA:** "Linnet came through my Door nine summers ago, laughing. She ate everything I had and taught Old Horn to shake hands. When the House came for her, I was so proud."
**EUMAIA:** "Thirty days ago the god stopped speaking through her. The palace says the god is fasting until the Festival, when a new Voice is seated. That's eight days from now. And here you are."
**EUMAIA** (ask): "You see what I'm getting at, lamb?"
- → "Someone will come for me." **EUMAIA:** "Tonight, if I know the House."
- → "Why did you never ask what happened to them?" **EUMAIA:** "You don't question an honour. That was stupid of me. I'm asking now."
- → "Why does a god need a stranger to speak?" **EUMAIA:** "Because every stranger may be a god, so a stranger's mouth is the safest place for a god to borrow. It sounded holy at the time."
**EUMAIA:** "This is the other half of Linnet's token. I kept it nine years. Find her, if she's anywhere. Give her this, so she knows Thyra remembers her."
*(Gives `lsb-token-linnet`; title **Guest of Thyra**; objective "Go down to the harbour.")*

### 1.7 Kyllo the Pedlar (the sundial square)
**KYLLO:** "The new arrival! You've the look of the Door about you. Bit shiny round the edges, the first day."
**KYLLO:** "Kyllo. Needles, salt, string, sky-iron beads, rumours, maps of places that may not exist. Everything's for trade, friend, except the road."
**KYLLO** (ask): "What can I do for you?"
- → "How did you get here? There's one boat." **KYLLO:** "I walked. Very early. Wet sand's no trouble if you're light on your feet."
- → "What's on your back?" **KYLLO:** "A lyre. Made it from a tortoise when I was a baby. The tortoise was very understanding."
- → "Tell me a rumour." **KYLLO:** "The herdsboy at the palace says the mountain hums in a new key. He's tone-deaf. Lovely boy. I owe him fifty cows."

**The Shadow Race** (offered at every visit until won):
**KYLLO:** "A wager? When the sundial's shadow touches the next line, it's noon. I bet you can't carry this note to Eumaia's hearth before it does. Prize: a feather from my hat. Stake: nothing."
- → "You're on." *(A 75 s timer starts and the player carries `lsb-kyllo-note`. Delivering it calls `w.record('lsb-shadow', t, { better: 'lower' })`. The fast line is the goat path above the cliff stair, about 50 s.)*
- → "Not now." **KYLLO:** "The sun waits for nobody. I do."

*Win:* **EUMAIA:** "A note from the pedlar? It says 'Well run.' The cheek." Back in the square, **KYLLO** (somehow there first): "Feet are the first gift. I'd know." *(Pedlar's Feather cosmetic; `lsb.sign.hermes`.)*
*Lose:* **KYLLO:** "Close! The shadow cheats near noon. Again?"
*Clue (interact with the wet sand by his pitch):* "Your prints, a gull's, a goat's. None leading to the pedlar, though he walked up from the water."

### 1.8 Teuthis on the quay (kindness 1)
**TEUTHIS:** "Don't mind me. Just sitting here being wet. Came over from Melaina in my brother's boat. This morning the sea went out like a breath being drawn, then came back all at once and put us on the rocks. Haven't eaten since yesterday."
**TEUTHIS** (ask, if the player still has `lsb-bread`): "You wouldn't have anything?"
- → "Have my bread." *(takes `lsb-bread`; `lsb.kind.1`)* **TEUTHIS:** "Hearth-bread. I'll remember this, stranger."
- → "Sorry." **TEUTHIS:** "Course."

### 1.9 Myrrha
**MYRRHA** (ask): "Are you a god? You can tell me. I won't tell anybody except everybody."
- → "No." **MYRRHA:** "That's what a god would say."
- → "Maybe." **MYRRHA:** "I KNEW it. Don't do anything godly, Mother will shout."
- → "Are you?" **MYRRHA:** "...I never thought about it."

### 1.10 Captain Kessa (the quay)
**KESSA:** "Don't touch the cow. The ship. The *Patient Cow*, named after my temperament. Kessa of Alashiya: tin, copper, oil, the odd goat. I'm for Pterousa at dawn, then Kerynthos for the Festival, where everybody's buying and nobody's paying."
**KESSA** (ask): "Passage is two oxen. Nobody ever has two oxen."
- → "I'll owe you." **KESSA:** "Everybody owes me. On the slate; pay me at Kerynthos." *(`lsb.kessa.slate`)*
- → "Ten tin-drops?" *(needs 10)* **KESSA:** "Real tin! I could kiss you. I won't." *(`lsb.kessa.paid`)*
**KESSA:** "And no, I'm not Aphrodite. Every Cypriot woman gets that. I'm not foam-born, I'm debt-born."

### 1.11 Dusk at the Hearth
**EUMAIA:** "A sail from the north with three lanterns. The House hangs three lanterns for one reason. Go up to Owl's Watch; whatever comes tonight, you should see it first. I'll meet you there. Old Horn knows a shortcut."

### 1.12 The beacon (Owl's Watch)
*(Eumaia and Old Horn are already at the top. A conch sounds across the water.)*
**EUMAIA:** "The House's horn, asking whether Thyra has a guest. Light the beacon and it means 'yes, come in'. They'll bring music and take you to Kerynthos as the House's honoured guest."
**EUMAIA:** "Leave it dark and it means 'no guest tonight'. They'll come anyway, quietly, and wonder why an old woman's hearth is cold."
**EUMAIA:** "I sent six strangers up that mountain with music. I'm not choosing a seventh."
**EUMAIA** (ask): "Your hand, your fire. What do we tell them?"
- → "Light the beacon." *(`lsb.beacon = 'lit'`, `lsb.eumaia = 'home'`)* **EUMAIA:** "Then walk in by the front door. Eat their honey, listen to their music, and don't promise anything."
- → "Leave it dark." *(`lsb.beacon = 'dark'`, `lsb.eumaia = 'held'`)* **EUMAIA:** "Then down the goat path to Kessa. I'll talk to the herald. Old women bore soldiers; I'll bore them all night."

**Lit, at the quay:**
**HERALD:** "People of Thyra! The House of the Double Axe greets your guest and invites the guest to the Festival of the Voice!"
**IKMALIOS:** "Thank you, Doros, they're right here." *(to the player)* "Master Ikmalios, engineer of the House. The Wanassa likes ceremony and I like sleep; the Wanassa wins."
**IKMALIOS:** "This is the House seal. Show it to anything bronze that tries to stop you. I'm for Pterousa at dawn to buy wings. Ride with me. The wingmakers are rude, the wind's ruder, and the view's the best in the Isles." *(Gives `lsb-house-seal`. Travel with arrival `palace-ship`.)*

**Dark, on the *Patient Cow*:**
**KESSA:** "In. Down. Under the sail. Ammi, oars, quiet as a cat. Eumaia paid your passage in cheese. You're very well cheesed."
**KESSA:** "See that lamp going down to the torches? That's her. They won't hurt her; she's too annoying to hurt. They'll take her to Kerynthos to explain herself, that's all." *(Travel with arrival `cow-night`.)*

## Learned and earned

- **Learns:** the Door brings strangers in; xenia is sacred; every ninth year a stranger becomes the Voice and never returns; Linnet, from Elsewhere, fell silent thirty days ago; the Festival is in eight days; the sea is behaving oddly.
- **Earns:** the title **Guest of Thyra**, the Guest-Token keepsake, the loaned guest-knife, Linnet's token half, tin-drops and codex entries; optionally the Pedlar's Feather, kindness 1 and Old Horn 1.

## Hook

Lit: from the palace ship's stern, the beacon burns on Owl's Watch with one small figure and a goat beside it. Ikmalios, at the rail: "Nine years ago I stood exactly here with a girl in jumping shoes. She waved to the beacon too."

Dark: from under Kessa's sail, the palace torches close around one small lamp on the quay. Then the island goes dark and only the mountain stays lit.
