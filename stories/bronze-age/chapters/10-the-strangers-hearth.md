# Chapter 10: The Stranger's Hearth

**World:** `lsb-hearth` (Thyra on the last night; it reuses the island layout of `lsb-thyra`) · **Story time:** night of day 10 to dawn of day 11 · **Playtime:** 25–35 minutes
**Rules:** `deny: ['board']` · **killY:** −20 · **Music:** root 62, dorian, 60 bpm, slow and sparse; the Chapter 1 theme in a minor variation, resolving to major at dawn in the Bronze and Hearth endings
**Theme:** an ash sky with no stars, horizon `#5a3a3a`, fog 60–300 m, firelight everywhere. At dawn (the ending scene) a pale gold horizon breaks through (theme blend).

## Summary

The fleet reaches Thyra, the island farthest from the mountain. Survivors camp on Eumaia's goat terraces under an ash sky. At the last feast the islanders wash the stranger's feet, and Eumaia gives the player the host's oldest right: to ask each guest's true name. The player names the pedlar, the weaver and the herdsboy. What happens at the Door decides the ending.

## Locations and layout

The same island as Chapter 1 (copy the geometry; modules cannot import), with these changes:

| Area | Change |
|---|---|
| **Harbour** | Thirty ships rafted together, lanterns lit. Landing at the quay (60, 1.5, 24). Checkpoint `quay`. |
| **Cliff stair and terraces** | Camps: cloth awnings (thin boxes in sail colours), cookfires (fire particles and three warm lights), families as NPC silhouettes. The number of camps scales with `lsb.saved` (one per 250 people). |
| **Courtyard** | Long tables for the last feast: bread, olives, fish. The Hearth's fire is high. The foot basin is set out, the other way round. |
| **Owl's Watch** | The beacon still burning (lit in Chapter 9, or by Eumaia). Old Horn sighting 10. |
| **Cave of Lamps** | Every votive lamp lit. Eumaia lit them all tonight, three hundred and twelve. The Door at the back of the cave glows. The ending scene is here. |

**Sightlines.** From the courtyard, north across the water: no mountain, only a red glow under the ash where Omphe was, and an empty sea where Kerynthos stood.

## Objectives

1. **Land and walk up to the Hearth** through the camps. People you helped stop you (scene 10.1).
2. **The last feast:** sit at the table. Your feet are washed.
3. **The naming:** name each of the three strangers (and the goat, if you like).
4. **Go down to the Door** at dawn.
5. **The ending.**
6. *(Optional)* Old Horn sighting 10 on Owl's Watch, which unlocks the coda if all ten are found.

## Puzzles

Little puzzling: this chapter is the harvest. The one real decision is **the naming**, which pays off every clue the player collected (no footprints, the lyre, the owl, the grey eyes, never in shadow, fifty cows, the sandal, the trials and Proteus's answer). A player who asked Proteus "Who" has it spelled out; everyone else has had fair clues since Chapter 1.

## Set pieces

- **Feet first, the other way round.** The Isles wash the stranger's feet: Myrrha with a jug, Teuthis with a cloth and, if she came as a guest, the Wanassa kneeling with the basin.
- **The naming.** Each correct name gets a sign, never a god in person: a gust and two turning feathers; an owl lifting off the Hearth's roof; the ash splitting to let one shaft of light fall on the herdsboy.
- **The Door at dawn.** Three hundred and twelve lamps, and the people the player kept close standing in the shining water.

## Collectibles and codex

- **Old Horn sighting 10** (`lsb.goat.10`): on top of the burning beacon pyre on Owl's Watch, which should be impossible. "Old Horn is standing in the beacon fire. She is not burning. She looks at you as if this were the obvious place to be."
- **Codex:** **The Last Feast**, **The Naming**, **The Saved** (the final count), the ending entry (**Salt**, **Bronze** or **Hearth**) and, with the coda, **Amaltheia**.

## Dialogue

### 10.1 Through the camps (each line plays only if its flag is set)
- `lsb.kind.1` **TEUTHIS:** "Stranger! Hearth-bread on Thyra's quay, the first day. I told you I'd remember. I told my brother too. He forgot."
- `lsb.kind.2` **KYLLO:** *(passing, with a wink)* "Both sandals today. A friend found the other one."
- `lsb.kind.3` **AMMI:** "I wasn't sick once on the way here! Well. Twice. But not on anyone."
- `lsb.kind.4` **LYKIOS:** "You brought the herdsboy water. Nobody brings the herdsboy water."
- `lsb.kind.5` **TARKON:** *(if out of the Quiet Rooms)* "You read me my name. I keep saying it to myself. Tarkon, good singer."
- `lsb.kind.6` *(a seal on the beach below the camps barks twice at the player, then slides into the sea.)*
- `lsb.kind.7` **DION:** "This is the stranger who lifted the beam off my leg on the mountain. Yes, the mountain. Yes, while it was exploding."
- `lsb.kind.8` *(Toast: "Out in the dark water past the ships, something leaps once and is gone.")*

### 10.2 The last feast
**EUMAIA:** "Sit. No, the other way. Tonight the Isles wash your feet."
**MYRRHA:** *(with a jug bigger than she is)* "I'm doing the water. I asked to do the water. Mother said a god wouldn't mind."
**TEUTHIS:** *(with the cloth)* "Fisherman's cloth, I'm afraid. Smells of fish. Everything does."
*(If `lsb.wanassa = 'guest'`:)* **ASASARA:** *(kneeling with the basin; no "we" now)* "I asked to do this part. I've had my feet washed ten thousand times and never once washed anyone's. Hold still. I'm told I'm doing it wrong."
**EUMAIA:** "Now. Bread and salt, for everyone. Then the custom."
*(If `lsb.voice` is `truth` or `linnet`:)* **PHEMONOE:** *(standing, without her headdress)* "Keeper. This is the seal of the Speakers. Forty-one of us. I don't want it, and the Isles don't need it. Will you keep it on your hearth, where people can see what it cost?"
**EUMAIA:** "I'll keep it next to the goat bell. Same job, really. Tells people when it's dinner."
*(If `lsb.compass.returned`:)* **PERDIKA:** *(next to Ikmalios, both covered in soot)* "We built forty pairs of wings in one night. Forty. He's terrible at stitching." **IKMALIOS:** "She's terrible at sleeping. We'll get along."
*(If `lsb.compass = 'left'`:)* **PERDIKA:** "Ikmalios carried children down the palace stair all morning with that brass compass in his belt. I'm letting him keep it. Don't tell anyone I said that."
*(If Linnet is present, `testify` or `rescued`:)* **LINNET:** "Eumaia washed my feet nine years ago at this table. I've come back round to the start, which is what circuits do, I'm told."

### 10.3 The naming
**EUMAIA:** "Here's the custom, and it's older than me. On the last night, the host may ask a guest's true name. Not the name they gave. The true one."
**EUMAIA:** "I've been host to three hundred and twelve strangers, and I never once asked. I'm giving the right to you, lamb. You're the one who's been watching them."
*(Kyllo, Glauke and Lykios sit together at the end of the table, as if they had always been invited.)*
**KYLLO:** "Oh, this is fun. Go on."

**KYLLO** (ask): "Who's the pedlar, then?"
- → **Hermes** *(correct)*: **KYLLO:** *(he takes off his hat)* "Guide of travellers. Keeper of doors. Thief of cattle, lyre-maker, light on his feet." *(A gust lifts two gull feathers from his hatband; they turn in the firelight and settle on the player's shoulder. Far below, the Door brightens.)* "Well spotted. I never leave footprints. You followed me anyway."
- → **Zeus**: **KYLLO:** "Ha! Flattering. Much too loud for me."
- → **Apollo**: **KYLLO:** "Don't tell my brother you said that. He'd never stop."
- → **Just a pedlar**: **KYLLO:** "That's what it says on the pack."

**GLAUKE** (ask): "And the weaver?"
- → **Athena** *(correct)*: **GLAUKE:** "Yes." *(An owl lifts off the Hearth's roof, circles once and lands on the Hearth's horn.)* "Wisdom is mostly looking up before you step. You did." *(To Perdika:)* "Little bird. You flew low. Good."
- → **Hera**: **GLAUKE:** "No. And she'd be offended for both of us."
- → **Demeter**: **GLAUKE:** "I prefer olives to barley. Look again."
- → **Just a weaver**: **GLAUKE:** "Everyone is just something. It's never all they are."

**LYKIOS** (ask): "And me? Go on. I already know what you'll say. I'm not going to tell you."
- → **Apollo** *(correct)*: **LYKIOS:** *(he laughs)* "Told you you'd hate the tune." *(The ash above the Hearth parts. One shaft of gold light falls on the table, on the bread, on the player's hands.)* "One year serving a mortal for losing my temper. I'm nearly done. You were the best part."
- → **Helios**: **LYKIOS:** "Close. He drives it. I own it. It's a whole thing."
- → **Dionysus**: **LYKIOS:** "I've never been drunk at a festival in my life. Well. Once."
- → **Just a herdsboy**: **LYKIOS:** "Fifty cows would disagree. My brother owes me fifty cows."

*(Optional, if the player turns to the goat:)*
**OLD HORN** (ask, no speaker; the prompt reads "And the goat?"):
- → **Amaltheia**: "Mehh." *(Eumaia: "She says that settles nothing.")*
- → **Zeus**: "Mehh." *(Eumaia: "She says don't be ridiculous.")*
- → **Just a goat**: "Mehh." *(Eumaia: "She says thank you. I think.")*
*(Stored in `lsb.named.*`. Two or more correct, including Kyllo, means `named_ok`. All three correct: title **Knower of Gods**.)*

### 10.4 The ending decision (computed at dawn)
- **Salt** if `lsb.voice` is `comfort` or `silence`.
- **Hearth** if warned, `named_ok`, and five or more kindnesses.
- **Bronze** otherwise.
The banner shows the count: "Of the four thousand people of the Hearth Isles, **N** reached Thyra."

### 10.5 SALT
*(Dawn. The camp is small: a few dozen fires. In the Cave of Lamps.)*
**EUMAIA:** "Thirty ships, I'd hoped. Look at us. Four." *(beat)* "They wanted to be lifted, and you can't make people get up."
**EUMAIA:** "I'm staying, lamb. Somebody has to keep the hearth lit. There'll be strangers. There are always strangers."
**EUMAIA** (ask): "Will you go home?"
- → "Come with me." **EUMAIA:** "Through that? No. The Door only lets people in. That's what we always said. I've never checked. I'm not going to start now."
- → "I'll go." **EUMAIA:** "Good. Feet first, then fate. Your feet are clean."
*(She gives the last guest-gift: the Ash-Grey Cloak cosmetic.)*
**EUMAIA:** "Your half of the token. Keep it. If my grandchildren ever meet yours... well. I haven't got any grandchildren. Keep it anyway."
*(The player walks into the light. In Junction the bronze portal's glow dims to an ember and stays lit. Title **Salt-Keeper**; `lsb.ending = 'salt'`.)*

### 10.6 BRONZE
*(Dawn. The fleet is making ready in the harbour, sails up, every hold full.)*
**EUMAIA:** "West. Kessa knows a coast with no name, past the edge of her old tin maps. Empty, she says. Good water."
**KESSA:** "Empty and good water, and I've never been there, and I've already sold the ships passage. I'm debt-born; I'm used to it."
**EUMAIA:** "The Door's not coming. It doesn't go that way. But you can, lamb. You can go home."
*(At the Door, the goodbyes, each only if that character is present:)*
- **PERDIKA:** "I'm going to build a school. For wings. The first lesson is falling. The second lesson is falling slower." *(If trust:)* "I flew. I flew low. I'll never stop telling people."
- **LINNET:** *(if present)* "I'll stay with them a while. Someone has to remember the mountain's words properly. I'll come home after. I know the way now."
- **IKMALIOS:** "I'm going to build a house with doors that open from the inside. All of them. It's a start."
- **LITTLE KORE:** *(if freed)* "The sea has fourteen colours this morning. Fourteen! I'm going to count them every day on the new shore. Every day after."
**EUMAIA:** "Ash-grey cloak, for the road. And your half of the token. If my grandchildren meet yours, they'll owe each other a supper."
*(The epilogue, shown as a series of banners or signs while the player walks into the light, each line depending on flags:)*
1. "On a coast with no name, each survivor threw a stone over their shoulder and built a house where it landed. The bones of their mother."
2. *(relic `tablets`)* "Linnet and Teuthis taught the house signs to the children. The Isles were written down, so they would not happen a third time." / *(`seed`)* "The barley of Aphanes, three hundred years old, came up green in the first spring. Nobody went hungry." / *(`heart`)* "Out in the drowned harbour mouth, a green-bronze figure still sits, facing the sea. Fishermen salute him."
3. *(Talos `truth`)* "Talos chose his last circuit. It was very short. It was well done."
4. "N people reached a new shore."
*(Title **Bronze-Witness**; `lsb.ending = 'bronze'`.)*

### 10.7 HEARTH
*(As in Bronze, the fleet is ready. But at the Door, Kyllo is waiting in the shining water, hat in his hand.)*
**KYLLO:** "Friend. A small thing. That Door has only ever opened one way. People thought that was a rule. It was only a habit."
**KYLLO:** "You kept faith with strangers all the way across the Isles. Bread, water, sandals, seals. Everybody was watching. Well. Three of us were."
**KYLLO:** "I'm the keeper of doors. Let me keep this one."
*(He holds the hat to the light. A gust and two feathers turn in the air, and the Door's glow changes colour: bronze on one side, Junction's violet on the other. Toast: "The Door opens both ways.")*
**KYLLO:** "Most of them will still sail west. That's right; that's theirs. But some of them would like to see where strangers come from."
*(Those who step through, each only if present: Eumaia, Old Horn, Linnet (home at last, wherever she was), Little Kore (if freed), Tarkon (if freed). The rest of the goodbyes are as in Bronze.)*
**EUMAIA:** "A whole world of strangers. Every one of them needing their feet washed." *(beat)* "Well. Somebody has to."
**LINNET:** "Junction. Is the hoop still there? Is Wren still there? Don't answer. I want to see."
**LITTLE KORE:** "Is it far? Will there be a sea? Will it have colours?"
*(They walk through together.)*
*(In Junction, from now on (BUILD.md, the hub change): a small stone hearth beside the bronze portal, with Eumaia at a basin and Old Horn asleep beside it. Eumaia to any arrival: "Feet first, then fate. Gods or goats, everyone gets bread." To the player: "There you are, lamb. You held the Door. Now you're the host; I just wash feet.")*
*(Epilogue banners as in Bronze, then one more:)* "The guest became the host."
*(Title **Host of the Open Door**; `lsb.ending = 'hearth'`.)*

### 10.8 THE HORN (coda, after any ending, if `lsb.goat.1`–`10` are all set)
*(At the water's edge, Old Horn walks to a rock, braces and breaks off her last horn with a crack. Toast: "The horn fills: barley, figs, olives, more than it can hold. It doesn't stop.")*
**EUMAIA:** *(looking at it a long time)* "Well. That settles nothing."
*(Salt: it feeds Eumaia's lonely hearth for as long as she keeps it. Bronze and Hearth: it feeds the crossing. Codex **Amaltheia**: "The goat who nursed the infant Zeus in a cave on Crete. When she broke a horn, it became the horn of plenty. Nobody ever proved it was her." Title **Goatherd of Elsewhere**.)*

## Learned and earned

- **Learns:** who the strangers were (if named), how many people were saved, and what each choice became.
- **Earns:** the ending title; the Ash-Grey Cloak; Knower of Gods (three correct); Goatherd of Elsewhere (the coda); the final codex.

## After the story

`lsb-thyra` becomes the campaign's post-game home. In **Salt**, Eumaia keeps the lone hearth and offers chapter replays ("Tell me again how it went, lamb"). In **Bronze**, Thyra is empty: a stone marker on the quay lists the saved count, and the Door still lets strangers in. In **Hearth**, the Door glows two colours, and Eumaia is in Junction. Every chapter can be replayed from the quay for collectibles, records and other choices, but the first completed ending is the one recorded on the player's chain; replays never overwrite it (see BUILD.md).
