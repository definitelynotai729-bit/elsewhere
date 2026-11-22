# The Last Summer of Bronze

*Every stranger may be a god.*

A single-player story campaign for Elsewhere in ten chapters, about six to seven hours of play. It is set in the Bronze Age Aegean of Greek myth: sea arches and goat terraces, a palace of red columns, a labyrinth, a bronze giant walking the horizon and a sacred mountain that has started to smoke.

## Logline

A traveller from Elsewhere steps through a sea arch into the last summer of the Bronze Age and is greeted as a god in disguise. On the same day the islands' oracle falls silent and its sacred mountain begins to smoke. The palace that has always honoured strangers turns out to be keeping them.

## Tone

- **Wonder first.** Morning light through a sea cave, frescoed halls, a bronze giant wading the strait at sunset, a glide down an erupting mountain. Every chapter has one sight the player will describe to a friend.
- **Warm people at the end of something.** The cast is funny, stubborn and kind. The story is melancholy, never despairing: an age ends, and people still choose what to carry out of it.
- **Puzzles and climbing over combat.** The only "fights" are evading a bronze bull, holding on to a shape-shifting old man, and outrunning the sea. The katana-style strike (a bronze sword works the same) cuts ropes, rings gongs and breaks clay seals.
- **Rating: T.** Peril, a volcanic eruption and a tidal wave, deaths implied in the past and off screen, no gore. Some characters are frightened, grieving or ashamed, and the story lets them be.

## Themes

1. **Xenia: what we owe strangers.** The Greek law of guest-friendship (wash the guest's feet, feed them before asking their name, give a guest-gift, never harm someone under your roof) runs through every chapter. The arc ends with a reversal: the guest becomes the host.
2. **Endings.** The mountain cannot be stopped. The player decides who is warned, what is carried out of the old age and how the people of the islands leave it.
3. **Voice.** An oracle speaks for a god; priests polish the words; a palace prefers comfort to truth. The story asks who gets to speak, and whether a kind lie is still a lie.
4. **Made things.** Wings, labyrinths, automata and a bronze giant. Makers owe something to what they make, and what they make can choose.

---

## The player character

**The Stranger.** The player is themselves: a traveller from Elsewhere, in whatever body they wear (the default robot, the knight, the mage, any character). The islanders have never seen anything like them and read the strangeness as possible divinity. A robot's visor is "a face like a lamp"; a skeleton is "very thin, and very polite"; a knight is "a walking bronze kettle". The script never genders the player: everyone calls them **Stranger**.

**Why they are there.** A new portal appears in Junction's outer ring, bronze-coloured, labelled **The Last Summer of Bronze**, with the subtitle *A door has opened in the sea.* Wren adds a tip: "Something new opened in the outer ring. It smells of salt and smoke. Someone's left a lamp burning on the other side." The player walks through and wades out of a glowing sea arch in a cave under the island of Thyra.

**What keeps them there.**
1. **Curiosity.** The cave has a votive lamp for every stranger who ever came through, and one of the lamps is shaped like a spring boot.
2. **A promise.** Eumaia, the Keeper of the Door, gives the player half of a clay guest-token. It belongs to **Linnet**, a traveller from Elsewhere who came through nine years ago, was taken up the mountain as the oracle's Voice and has not been seen since the oracle fell silent. "If she lives, give her this, so she knows Thyra remembers her."
3. **The people.** By the middle of the story the player knows what the mountain will do and is the only person who can make everyone hear it.

**What the player brings matters.** Gear from other worlds keeps working where the chapter's rules allow it, and the cast notices it:
- A **glider**: "Daedalus's kin! Fly low, Stranger. The sun is not your friend."
- **Spring boots**: "Shoes that jump twice. The Ninth Voice had those."
- A **lantern**: "You carry your own little sun."
- A **katana**: "A blade like a sliver of moon. No smith on these islands could fold metal like that."
- A **hoverboard**: boards are switched off in most chapters, and the islanders take it for a serving tray.

---

## Structure: chapters as worlds

- **Ten worlds, one story.** Each chapter is its own world module (`lsb-thyra`, `lsb-pterousa` and so on; see BUILD.md). Junction shows a single portal, to Chapter 1. The other chapters are unlisted and reached in the story: by ship from the quay, or by the chapter's exit at the end.
- **The home port.** After Chapter 1, Thyra's quay has Captain Kessa's ship, the *Patient Cow*. Talking to Kessa offers the next chapter, and any finished chapter as a "memory" for collectibles.
- **Story state** lives in global flags with the prefix `lsb.` (the full list is under [Flags](#flags-reference)). Each world reads them in `build` and in `'enter'` to set itself up, so the palace you reach depends on the beacon you lit.
- **Rewards** are soulbound: titles, keepsake cosmetics and codex entries. The traversal gear the story lends (wings, a bronze guest-knife, Linnet's old boots) works only inside the campaign; see BUILD.md for the "loaned gear" pattern.

---

## Setting

### The Hearth Isles

A crescent of seven islands in the wine-dark sea, somewhere between Crete and the Cyclades in the mythic Aegean. No later history mentions them, because the sea took them back that summer. Locals call them the **Hestiades**, the Hearth Isles, because every house keeps a hearth lit for strangers.

| Island | What it is | Chapters |
|---|---|---|
| **Thyra** ("door") | A steep goat island with the sea-arch Door, Eumaia's Stranger's Hearth, terraces and a small harbour | 1, 10 |
| **Pterousa** ("winged") | A lagoon ringed by sea stacks, seabird colonies and the wingmakers' workshops | 2 |
| **The Strait of Teeth** | A channel of rock islets, a causeway, and Watch Rock, where Talos rests | 3 |
| **Kerynthos** | The great island: the House of the Double Axe, its labyrinth, the town and the harbour with its sea-gates | 4, 5, 9 |
| **Pharia** | Low seal rocks and sandbars where the Old Man of the Sea sleeps at noon | 6 |
| **Omphe** ("divine voice") | The sacred mountain, a volcano, with the Listening Room near the summit and the amphitheatre called the Ear at its foot | 7 |
| **Aphanes** ("the unseen") | The drowned palace of the age before, off Kerynthos, which shows only when the sea draws back | 8 |
| Melaina and Lepte | Fishing islands, only mentioned; their people come to Kerynthos for the Festival | (9) |

### What the place looks like (real Bronze Age detail, all public domain)

- **Palaces.** Red columns that widen toward the top, light wells, flat roofs crowned with stone "horns of consecration", painted plaster frescoes (dolphins, lilies, saffron gatherers, blue monkeys, bull-leapers), and storerooms of man-high clay jars (pithoi).
- **Signs.** The double axe (*labrys*) is carved on pillars; "labyrinth" means "house of the double axe". Clay tablets carry the house signs, a syllabic script nobody outside the palace reads.
- **Trade.** There are no coins yet. Trade runs on oxhide-shaped copper ingots, tin from far in the west, "tin-drops" (small tin weights) and oxen. A favour is "a four-ox favour".
- **Metal.** Everything is bronze, copper alloyed with tin. Iron is a rare "sky-metal" from fallen stars.
- **Colour.** Ochre, saffron, sea-blue, oxblood and limestone white. No marble temples: those come centuries later.

### The myths, and what this story does with them

- **Xenia and the gods in disguise** (Ovid's Baucis and Philemon, and Lycaon): gods walk as poor travellers, test hospitality, and the flood follows. *Here:* three wanderers this summer are gods in disguise. The story never says they cause the eruption, only that they decide whom to help.
- **Hesiod's ages of mankind:** the bronze race ends. *Here:* it is literally the last summer of bronze, as the tin routes fail.
- **Deucalion and Pyrrha:** the flood's survivors are told to "throw the bones of your mother behind you", and work out that the bones are stones, the bones of the Earth. *Here:* Proteus's riddle, and the closing image of the Bronze and Hearth endings.
- **Talos:** the bronze guardian of Crete, with one vein of ichor sealed by a nail. *Here:* he survived the Argonauts, wears a soft tin nail, walks the Strait of Teeth and waits for a maker who will never come back.
- **Daedalus, Icarus and Perdix** (Ovid), and **Daedalus's statues that ran away unless chained** (Plato, *Meno*). *Here:* Daedalus is long dead. His descendant Ikmalios and Perdix's descendant Perdika feud over stolen inventions, and Little Kore is a statue who keeps running.
- **The Labyrinth** ("house of the double axe") and **Hephaestus's bronze bulls.** *Here:* the palace's lower halls, guarded by a bronze bull. No Minotaur.
- **Delphi:** the Pythia on a tripod over a fissure, priests who versified her words, and the first Pythia, Phemonoe. *Here:* the Voice, the Speaker, and the name every Speaker takes.
- **Proteus** (*Odyssey* 4): hold him through every shape and he must answer. *Here:* a set piece, and exactly one question.
- **Amaltheia,** the goat that nursed Zeus, whose broken horn became the horn of plenty. *Here:* Old Horn, maybe.
- **History underneath:** the eruption of Thera, the end of the Minoan palaces and the Late Bronze Age collapse.

### Factions

- **The House of the Double Axe** (Kerynthos): Wanassa Asasara, who rules; the Speakers of the Voice under Phemonoe; Master Ikmalios and the Daedalid engineers; the Axe-Bearers, the palace guard; the bull-leapers. They hold the Isles together through ritual, and they keep strangers.
- **The Hearth-Keepers.** Not an organisation but a custom: every house that keeps a hearth lit for strangers, with Eumaia's Stranger's Hearth on Thyra as the oldest. Fishers, goatherds, sailors.
- **The craft families.** The Perdikids, wingmakers of Pterousa, against the Daedalids, palace engineers. A hundred-year grudge over who invented the saw, the compass and the wings.
- **The sea-traders.** Captain Kessa and the far traders who bring tin from beyond the western sea. Their routes are failing one by one.
- **The strangers.** Everyone who came through the Door: guests, the Voices (Linnet, the Old Voice) and three wanderers who may be gods.
- **The made.** Talos, the bronze bulls, the living statues. Things that were built to serve and are not sure what they are.

---

## The cast

Fifteen characters with dialogue, plus a few walk-ons. NPC looks use the engine's coloured robot body or a rigged character (BUILD.md lists the suggested colours and characters).

### 1. The Stranger (the player)
- **Who:** a traveller from Elsewhere. Silent; speaks only through dialogue choices, which are short and plain so they fit any player.
- **Arc:** guest, then witness, then voice, then host. The player arrives having their feet washed and, in the best ending, holds the Door open for others.

### 2. Eumaia, Keeper of the Door
- **Who:** seventy-one, goatherd and priestess of the Stranger's Hearth on Thyra. She has welcomed 312 strangers in fifty years and scratched each one's sign on a clay tablet.
- **Voice:** brisk, warm, earthy. Proverbs she half invents ("Feet first, then fate." "Gods or goats, everyone gets bread."). She swears by her goats and calls everyone "lamb" once she likes them.
- **Secret:** she isn't sure the gods exist. She keeps the rites anyway: "If the stranger might be a god, that's a fine excuse for being kind to one who isn't."
- **Arc:** six of her guests were taken "up the mountain" as an honour, and she sent them off proudly. Learning what the honour really was breaks her heart and then hardens it. She ends by keeping the hearth lit to the end (Salt), sailing with the last ship (Bronze), or stepping through the Door into a world of strangers (Hearth).

### 3. Old Horn
- **Who:** Eumaia's one-horned nanny goat. Grey, bearded, unbothered.
- **Voice:** "Mehh." Different subtitles depending on who translates ("She says you're too thin." "She says the wind's changing.").
- **Running mystery:** she turns up in every chapter, in places no goat could reach: a sea stack, the palace roof, the labyrinth, a ship at sea. Finding her is the campaign's ten-part optional collectible. The broken horn is a hint at Amaltheia, the goat that nursed Zeus. The story never confirms it.

### 4. Perdika, the wingmaker
- **Who:** nineteen, from Pterousa. She builds the best gliding wings in the Isles and is too afraid of heights to wear them. She descends from Perdix, the boy Daedalus pushed.
- **Voice:** rapid, precise, sarcastic. She counts steps out loud, measures everything in spans and feathers, swears "Saw and compass!", and hates the word "soar". Her wings are designed to glide **low**: "Partridges live. Eagles get shot."
- **Arc:** fear of falling and a family grudge, against craft she trusts. She lends the player her Low Wings (Chapter 2). At the climax she flies, by her own choice, beside the player, and depending on the compass choice she does it either with the Daedalid engineer she hates or in spite of him.

### 5. Captain Kessa of Alashiya
- **Who:** forty-five, a tin trader from Cyprus with a broad, battered ship called the *Patient Cow*. Her trade routes are dying: "The world is coming apart from the edges, and I'm the edge."
- **Voice:** dry and mercantile. She prices everything in oxen ("That's a four-ox favour") and tells terrible sea jokes. Islanders keep asking whether she is Aphrodite, since she comes from Cyprus. "I'm not foam-born, I'm debt-born."
- **Arc:** profit against people. She is the player's transport throughout, and on the last day she has to decide whether to come back into the harbour for one more load. She comes back if the player kept faith with her and paid the passage.

### 6. Kyllo the Pedlar (secretly Hermes)
- **Who:** a cheerful wandering trader with a broad straw hat and a heavy pack. Two gull feathers in the hatband, a walking stick carved with two twined snakes, a lyre made from a tortoise shell.
- **Voice:** soft-spoken and amused. He talks in bargains and riddles and is oddly gentle about doors and roads: "Everything's for trade, friend, except the road." He is never cruel and never quite honest.
- **Clues:** he is always somewhere before you though there was only one boat; wet sand never keeps his footprints; his pack never empties; he was "born in a cave on a mountain and walked out the first afternoon"; Lykios says he still owes fifty cows.
- **Trial:** the Shadow Race (Chapter 1).

### 7. Glauke the Weaver (secretly Athena)
- **Who:** a tall old woman with grey eyes who weaves sails in every harbour. An owl is always somewhere near her, on a mast or a roof beam. Her goatskin shawl is pinned with a brooch showing a fierce little face.
- **Voice:** sparse and exact. She answers questions with questions, has no patience for boasting, and is tender only with Perdika ("little bird").
- **Clues:** she says olive oil is the finest gift anyone ever gave a city; she "caught a boy once, a long way up"; she despises the Daedalids' pride but respects their work; she weaves faster than anyone can watch.
- **Trial:** the Warp and the Weft, a weaving floor (Chapter 2).

### 8. Lykios the Herdsboy (secretly Apollo)
- **Who:** a golden-haired youth tending the palace cattle "as a punishment, long story". He plays reed pipes, though he says strings are better.
- **Voice:** lazy, sunny, oddly prophetic, and a terrible liar. "I'd tell you, but you'd hate the tune."
- **Clues:** he is never in shadow, and he moves to stay in the sun; laurel leaves are tucked behind his ear; he complains about a "little brother" who stole his cows and paid him in a lyre; he answers questions before they are asked.
- **Trial:** the Light-Well, a mirror puzzle (Chapter 4).

### 9. Talos
- **Who:** the bronze guardian, thirty metres tall, made long ago for Crete. His face is a beaten-bronze mask with a furnace glow behind the eyes. A single red seam of ichor runs from his neck to his left heel, stoppered at the ankle with a nail of pale tin. He walks the Strait of Teeth three times a day.
- **Voice:** slow, in counts and rules, often in threes. "One. Two. Three. That is a circuit. I have walked four hundred and eleven thousand and six." He is a child-sized mind in a giant's body, lonely and literal.
- **Arc:** he has waited centuries for his maker to come back and tell him he did well. If the player tells him the truth, he decides on his own last circuit and stands against the wave so the ships can leave. If the player lies, he keeps walking his circuit into the sea.

### 10. Wanassa Asasara, ruler of Kerynthos
- **Who:** about fifty-five, queen of the House of the Double Axe. Cultured, gracious and deeply frightened. Her mother and grandmother kept the custom of the Voices, and she believes order is a kind of mercy.
- **Voice:** formal, warm, and in the royal "we" until she breaks and says "I". She quotes frescoes as if they were scripture.
- **Arc:** denial. If she hears the truth from the mountain, she gives the order to leave, and in the best case accepts a guest-token and leaves her own palace as a stranger. Otherwise she stays in her throne room and the sea takes the House.

### 11. Master Ikmalios, the last Daedalid
- **Who:** sixty, chief engineer of the House and a great-great-grandson of Daedalus. He built the Listening Room and the speaking horns, keeps Talos running and designed the bronze bulls.
- **Voice:** technical, sardonic, sad. "Every door I make has two sides, and I only ever think about one."
- **Arc:** he knows exactly what the Voices are, and he is ashamed of it. He can be turned, by kindness to Perdika (returning what his family stole) and by Linnet's truth. At his best he builds the Wing Bridge with Perdika on the last day.

### 12. Speaker Phemonoe, the forty-first
- **Who:** about forty, chief interpreter of the oracle. Every Speaker takes the name of the first Pythia. She turns the Voice's words into verse for the people.
- **Voice:** velvet, certain, beautifully spoken. "Hope is a lie we tell until it comes true."
- **Arc:** the story's antagonist, but not a villain who wants power. When Linnet's warnings grew frightening, Phemonoe "interpreted" them into comfort, and she believes she saved the Isles from panic. Exposed in Chapter 7. If the truth reaches the Isles, she hands her seal of office to Eumaia at the last feast; if not, she goes down to the crowd to call the eruption a blessing, and is not seen again.

### 13. Linnet, the Ninth Voice
- **Who:** thirty-four, a traveller from Elsewhere who came through the Door nine years ago wearing spring boots. Eumaia welcomed her; the palace made her the Voice. She sat over the fissure for nine years, heard the mountain change its tune, said so, and watched her warnings come back down the mountain as blessings. Thirty days ago she stopped speaking and fled into the labyrinth.
- **Voice:** wry, tired and kind. She speaks the islanders' language with a northern lilt and slips into Elsewhere words ("portal", "Junction", "proof"). She has left notes all over the labyrinth in Elsewhere's alphabet, which the islanders call "bird-foot scratches" and the player can simply read.
- **Arc:** for nine years she was a voice for other people, and now she wants her own. She chooses, with the player, whether to testify in front of everyone, go home through the Door, or stay hidden.

### 14. Little Kore
- **Who:** a Daedalic living statue: a painted cedar-and-bronze maiden, a metre and a half tall, in a flounced skirt, with a fixed small smile. She runs away every time she is unchained, so the palace keeps her chained by the ankle in the Gallery of Korai.
- **Voice:** literal and delighted. She counts the colours of the sea ("Today it has eleven") and asks questions nobody asks. "Am I a 'she' or an 'it'? The guards say both, and they say them differently."
- **Arc:** if the player frees her, she follows them, holds doors in the labyrinth, faces down the bronze bull ("I am bronze too!") and carries the palace children to the ships. If not, she stays chained when the palace floods, and her codex entry is the saddest in the game.

### 15. Proteus, the Old Man of the Sea
- **Who:** an ancient sea-god who herds seals around Pharia. He sleeps at noon among his flock.
- **Voice:** grumpy, evasive, speaks in tides and pronouns that slip. "We were a lion once. Tuesday, I think."
- **Arc:** none. He is an oracle and an obstacle. Hold him through his shapes and he answers one question truthfully, and which question you choose matters.

### Walk-ons
- **The Old Voice** (Tarkon): the eighth Voice, from the east, now blind and very old. He lives in the Quiet Rooms of the labyrinth and knows the bronze bull's rhythm.
- **Ammi:** Kessa's ship's boy, twelve and seasick.
- **Myrrha:** a harbour child on Thyra who decides the player is definitely a god.
- **Teuthis:** a fisherman from Melaina, wrecked on Thyra by the first strange tide; he turns up again at Kerynthos and at the last feast.
- **Dion:** a young acolyte of the Speakers, trapped under a beam in the Listening Room.
- **The Herald:** Ikmalios's crier, pompous, with a voice like a conch.
- **Axe-Bearers:** palace guards with tower shields and double axes, more bored than menacing.

---

## The plot

Eight days pass between the player's arrival and the Festival of the Voice, when every ninth year a new Voice is seated in the mountain. The mountain does not wait for the tenth. Each chapter file has the full detail; this is the spine.

### Act I: The Door (Chapters 1–3)

1. **The Door in the Sea** (`lsb-thyra`, day 1). Eumaia washes the stranger's feet and gives them a guest-token. Her scattered guest tablets show that every ninth year a stranger "went up the mountain" and never came back; the last was Linnet, from Elsewhere. At dusk a palace ship comes, and the player **lights the beacon or leaves it dark**.
2. **The Low Wings** (`lsb-pterousa`, day 2). Perdika, a wingmaker afraid of heights, lends the player her Low Wings after a test flight through the Eye. Ikmalios's ship carries the Compass of Perdix: **steal it, ask for it, or let it go**.
3. **Three Circuits** (`lsb-strait`, day 3). Talos stops the ship. The player crosses his causeway between footfalls, rings the Calling Bell and is let through by the House seal or the guest-token. Talos asks whether his maker is coming back: **the truth, a kind lie, or "I don't know"**.

### Act II: The House and the Mountain (Chapters 4–7)

4. **The House of the Double Axe** (`lsb-kerynthos`, day 4). A palace of red columns: the Speaker's "blessings", a chained living statue, Linnet's boots kept as relics, a bronze bull to leap, and Eumaia to rescue if she was taken. The Wanassa offers the honour of the Voice: **accept or refuse**.
5. **The Labyrinth** (`lsb-labyrinth`, day 5). The Old Voice explains that the Voices are kept below forever because they know the mountain's real words. Linnet's notes, in plain Elsewhere letters, lead past turning walls and a bronze bull to her garden. The token halves fit and she tells the truth. **She testifies, goes home, or stays hidden.**
6. **The Old Man of the Sea** (`lsb-pharia`, days 6–7). Hidden among his seals, the player holds Proteus through five shapes and asks **one question: when, how, or who**. The mountain throws its first ash.
7. **The Mountain's Mouth** (`lsb-omphe`, day 9). The Festival. In the Listening Room the player aims the horns, hears the mountain plainly, reroutes the speaking tube and faces Phemonoe. **What the Throat says (the truth, Linnet, comfort or silence)** decides whether the Isles are warned. The player glides down the erupting mountain.

### Act III: The Last Day (Chapters 8–10)

8. **The Drawback** (`lsb-aphanes`, night of day 9). The sea pulls back from Kerynthos and uncovers the drowned palace of the last age, which kept Voices too. The player carries out **the Tablets, the Seed Jar or the Bronze Heart** and outruns the first wave.
9. **The Last Circuit** (`lsb-harbour`, day 10). Twelve minutes of errands shaped by every earlier choice: the sea-gates, the beacon to Thyra, the Quiet Rooms, the children, the Wing Bridge, the Bronze Heart, and the Wanassa (**give her a token, argue, or leave her**). Talos braces in the harbour mouth and the player makes the last glide to the last ship.
10. **The Stranger's Hearth** (`lsb-hearth`, night of day 10). On Thyra the Isles wash the player's feet. The player names the pedlar, the weaver and the herdsboy, and the Door decides the ending.

---

## The major choices

| # | Chapter | Choice | Flag | What it changes later |
|---|---|---|---|---|
| 1 | 1 | Light the beacon / leave it dark | `lsb.beacon` = `lit` or `dark` | Lit: honour guard, House seal for Talos, feast entrance, Eumaia safe at home. Dark: smuggled in jars, Talos passed by guest-token, Eumaia taken to Kerynthos and must be rescued (Ch4 or Ch9). |
| 2 | 2 | The Compass of Perdix: steal it / ask openly / let it go | `lsb.compass` = `stolen`, `asked` or `left` | Asked: Ikmalios returns it in Ch4 and, if Perdika trusts the player, builds the Wing Bridge with her in Ch9. Stolen: Ikmalios is cold, there is no bridge, and Glauke is disappointed (a naming clue lost). Left: no bridge, but Perdika forgives him in the epilogue. |
| 3 | 2 | Perdika's fear: "Fly when you're ready" / "Just jump" | `lsb.perdika.trust` | With trust, Perdika flies beside the player in Ch9 and leads the children's glide. |
| 4 | 3 | Talos asks whether his maker is coming back: truth / kind lie / "I don't know" | `lsb.talos` = `truth`, `lie` or `unsure` | Truth: he chooses his last circuit and stands against the wave (Ch9). Unsure: he stands, but late. Lie: he keeps walking his circuit and the sea takes him. |
| 5 | 4 | The honour: accept / refuse | `lsb.honor` = `accepted` or `refused` | Changes the route through Ch5 and Ch7 (procession or prison, carried up or climbing), and how the crowd sees the player. |
| 6 | 4 | Unchain Little Kore | `lsb.kore` = `freed` or `chained` | Freed: she holds the bull in Ch5 and carries the children in Ch9. Chained: she drowns with the Gallery of Korai, unless the player comes back for her with the pin-key in Ch9. |
| 7 | 5 | Linnet: testify / go home / stay hidden | `lsb.linnet` = `testify`, `home` or `hidden` | Testify: she can speak in Ch7. Home: she leaves through the Door and her notes go with the player. Hidden: she must be fetched from the Quiet Rooms in Ch9, or she is lost. |
| 8 | 6 | One question to Proteus: when / how / who | `lsb.proteus` = `when`, `how` or `who` | When: +300 saved. How: a longer drawback in Ch8 and the sea-gate route in Ch9. Who: Proteus names the three strangers (the Ch10 naming becomes easy). |
| 9 | 7 | What the Voice says: truth / Linnet / comfort / silence | `lsb.voice` | Decides whether the Isles are warned: Salt against Bronze or Hearth. |
| 10 | 8 | The relic: Tablets / Seed Jar / Bronze Heart | `lsb.relic` | Tablets: the script survives (epilogue, codex). Seed: the new shore has bread by spring. Heart: Talos holds the wave longer (+150 saved). |
| 11 | 9 | The Wanassa: give her a token / leave her / argue | `lsb.wanassa` = `guest`, `left` or `argued` | Guest: she leaves as a stranger, her household follows (+250) and she appears at the last feast. Argued: she stays, and time is lost. |
| 12 | 10 | Name the strangers | `lsb.named.<who>` | Two or more correct, including Kyllo, are needed for the Hearth ending. |

**Kindnesses.** Eight small acts of hospitality, one each in Chapters 1–8 and each optional, are recorded as `lsb.kind.1` to `lsb.kind.8`. The gods are watching, and five or more are needed for the Hearth ending. The script never announces that they count; the people helped do remember, and say so in Chapter 10.

**The saved count.** The epilogue banner states how many of the Isles' 4,000 people reached a new shore: 800 who flee on their own, plus 1,300 if the Isles were warned and further amounts for each thing the player arranged (Talos 350, the Bronze Heart 150, the Wing Bridge 250, the Wanassa 250, Kessa's last load 120, Thyra's boats 150, Kore's children 60, Linnet's testimony 200, and Proteus 300 for "when" or 200 for "how"). The best possible total is 3,930. Some people are always lost; the story never pretends otherwise.

---

## The endings

The ending is decided in Chapter 10 from three things: whether the Isles were warned (`lsb.voice` is `truth` or `linnet`), how many strangers the player named correctly, and the kindness count.

### Salt (the Isles were not warned)
Most people stayed for the Festival's promised blessing. A few hundred reach Thyra on whatever floated. Eumaia will not leave: "Somebody has to keep the hearth lit, lamb. Strangers might come." The player goes home through the Door alone, with a dry clay token and the sound of the sea. In the last shot, from Junction, the bronze portal's light dims to an ember and stays lit. Title: **Salt-Keeper.**

### Bronze (warned, but the Door stays one-way)
The fleet sails west to an unknown coast. On the beach the survivors play out Deucalion's riddle: each throws a stone over their shoulder to mark where a house will stand. Talos, if he stood, is a green-bronze figure in the harbour mouth of a drowned island, still braced. Eumaia, Perdika, Linnet (if she testified) and the others stay with the new town. The player says goodbye at the Door and returns to Junction. Title: **Bronze-Witness.**

### Hearth (warned, two or more strangers named including Kyllo, five or more kindnesses)
At the Door, Kyllo takes off his hat. Gods do not appear in person, so all the player sees is a gust of wind and two gull feathers turning in the air, but the sea arch, which only ever let strangers in, opens both ways. Most islanders still sail for the new shore. A few step through into Elsewhere: Eumaia, Old Horn, Linnet (home at last), Little Kore if she is free, and anyone else the player's choices kept close. In Junction a small stone hearth appears by the bronze portal, with Eumaia washing the feet of new arrivals. The guest has become the host. Title: **Host of the Open Door.** This needs one small hub change, described in BUILD.md.

### The Horn (a secret coda, after any ending)
If the player found Old Horn in all ten chapters, the goat breaks her last horn on a rock at the water's edge. It fills with barley, figs and olives and does not empty, and it feeds the crossing (or, in Salt, Eumaia's lonely hearth). "Well," says Eumaia. "That settles nothing." Codex: *Amaltheia*. Title: **Goatherd of Elsewhere.**

Variants: whoever spoke at the mountain is the "stranger with no country" in the epilogue's retelling of the prophecy (the player, Linnet, or the Wanassa if she became a guest). Every ending names the saved count.

---

## Flags reference

| Flag | Values | Set in |
|---|---|---|
| `lsb.ch` | 1–10, the furthest chapter reached | each chapter |
| `lsb.done.<n>` | true when chapter n is complete | each chapter |
| `lsb.beacon` | `lit`, `dark` | 1 |
| `lsb.eumaia` | `home`, `held`, `rescued` | 1, 4, 9 |
| `lsb.compass` | `stolen`, `asked`, `left` | 2 (and `lsb.compass.returned` in 4) |
| `lsb.perdika.trust` | true / false | 2 |
| `lsb.talos` | `truth`, `lie`, `unsure` | 3 |
| `lsb.kessa.paid` | true (passage paid in tin) | 1, 4 |
| `lsb.kessa.ready` | true (Proteus told her when) | 6 |
| `lsb.sign` | `door`, `goat`, `lamp` (the player's tablet sign) | 1 |
| `lsb.arrive` | the arrival variant for the next world | before each travel |
| `lsb.honor` | `accepted`, `refused` | 4 |
| `lsb.kore` | `freed`, `chained` | 4 |
| `lsb.boots` | `taken`, `returned` | 4, 5 |
| `lsb.linnet` | `testify`, `home`, `hidden`, `rescued`, `lost` | 5, 9 |
| `lsb.proteus` | `when`, `how`, `who` | 6 |
| `lsb.voice` | `truth`, `linnet`, `comfort`, `silence` | 7 |
| `lsb.relic` | `tablets`, `seed`, `heart` | 8 |
| `lsb.wanassa` | `guest`, `left`, `argued` | 9 |
| `lsb.saved` | number | 9 |
| `lsb.kind.1` … `lsb.kind.8` | true | 1–8 |
| `lsb.sign.hermes`, `.athena`, `.apollo` | true (trial cleared) | 1, 2, 4 |
| `lsb.goat.1` … `lsb.goat.10` | true | 1–10 |
| `lsb.named.kyllo`, `.glauke`, `.lykios`, `.oldhorn` | the name chosen | 10 |
| `lsb.ending` | `salt`, `bronze`, `hearth` | 10 |
| `codex.lsb.<id>` | true | everywhere |

---

## Rewards (all soulbound)

- **Titles**, one per chapter (Guest of Thyra, Low-Flyer, Who Spoke with Talos, Bull-Leaper, Threader of the Labyrinth, Holder of the Old Man, Voice of Omphe or Who Gave Back the Voice, Who Walked the Drawn Sea, Last off Kerynthos) and one per ending, plus Knower of Gods (all three strangers named) and Goatherd of Elsewhere.
- **Keepsake cosmetics:** the Guest-Token (a clay half-disc on a cord), the Pedlar's Feather (Hermes's trial), the Owl Brooch (Athena's), the Laurel Sprig (Apollo's), Perdika's Low Wings (keepsake), the Bull-Leaper's Armband and the Ash-Grey Cloak (finishing the story).
- **Codex:** about 70 entries covering places, people, myths, the house signs and the gods. Each chapter file lists its entries with their text.
- **Loaned gear** that works only inside the campaign: the Low Wings (glide), the Bronze Guest-Knife (blade) and Linnet's Old Boots (double jump). See BUILD.md.
- **No coins.** Story collectibles are tin-drops, a counter that buys nothing, so story play cannot be farmed for anything tradable.

---

## Originality self-audit

**Sources.** Homer (*Odyssey* 4, 7, 14, 19; *Iliad* 18), Hesiod, Ovid (*Metamorphoses* 1 and 8), Apollonius of Rhodes, Plato's *Meno*, the Delphic tradition and the archaeology of Bronze Age Crete and Thera. All of it is public domain or historical fact.

**Invented here.** The Hearth Isles; the custom of seating strangers as the oracle's Voice and keeping them afterwards; every main character (the three gods appear only as original disguised characters); the plot, puzzles, choices and endings; Old Horn.

**Checked against the excluded works:**
- **God of War and Hades:** no revenge on the gods, no god-killing, no escape from the underworld. The gods are never fought and barely seen.
- **Assassin's Creed Odyssey:** no mercenary, no cult, no Atlantis, no Minotaur fight. That game has a cult that manipulates the Pythia, so this oracle is deliberately different: nobody uses it for power. The wrong is a custom of hospitality turned into captivity, and a frightened Speaker softening a warning. Bribed oracles are historical (Herodotus).
- **Immortals Fenyx Rising:** no narrating gods, no gods turned into animals that need restoring, no Typhon, no bird companion, no vaults. Old Horn hints at Zeus's nurse and is never confirmed.
- **Percy Jackson:** no demigod children, no camp, no prophecy about a god's child; the player is not secretly divine. Those books use Daedalus's guilt over Perdix in a labyrinth, so here Daedalus is long dead and never appears, and Perdix matters only through a descendant's fear of heights.
- **Disney's Hercules:** no Muses, no Pegasus, no fast-talking villain. Hermes is a soft-spoken haggler.
- **Clash of the Titans:** no Kraken, no Medusa, no mechanical owl. Athena's owl is a living bird.
- **Kid Icarus:** no angels and no winged servants. The wings are craft, built to fly low.
- **Also avoided:** the 1963 *Jason and the Argonauts* Talos (a statue woken by theft and killed by his heel plug); Renault's *The King Must Die* (captive bull-dancing; here, one optional vault over a machine); *Shadow of the Colossus* (no climbing on or killing giants); Zelda's Divine Beasts; Miller's *Circe*; and any title echoing O'Brian's *The Wine-Dark Sea* or *The 7th Guest*.
- **Names** are invented, or obscure ancient names reused: Eumaia echoes Eumaeus, Homer's hospitable swineherd; Ikmalios is the craftsman of Penelope's chair; Asasara is a word on Linear A tablets.
