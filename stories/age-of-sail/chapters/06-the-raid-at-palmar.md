# Chapter 6: The Raid at Palmar

*World `dh-06-palmar` · the first week of January 1716, dusk to midnight · Act II · 25 minutes per path*

**In short:** History says Jennings's raiders took the salvage camp and Salmón surrendered. The player can't change that outcome. They choose what it costs and who walks away free.

## Locations and layout

The camp from Chapter 4 part 2, at night, with additions. The axes are the same, with x seaward.

| Area | Where | Notes |
|---|---|---|
| Stockade storehouse | (−80, 4, −30), 20 × 12 m, walls 4 m | The silver. Its **gate** is at (−70, 2, −30), 4 m wide: the alarm-path fight. |
| Watchtower and **bell** | (−60, 7, −60) | Ladder climb volume to the 5 m platform. The bell is an interact. |
| Salmón's tent | (−70, 4, 10) | |
| Merino's tent | (−55, 3, 70) | His key ring hangs on the pole: an interact that gives `dh-merino-key`. |
| Divers' huts | (−70, 3, 60) | One padlocked door. Eight divers inside, Tito among them. |
| Survivors' tents | three clusters at (−45, 2, −10), (−40, 2, 20), (−50, 2, 40) | Families: 6 decor avatars per cluster. |
| Palm grove | x −140 to −90, z 40 to 150 | Dark, with a sentry lantern sweeping from the stockade wall (a 50° cone, 14 m, turning once every 10 s). Leads to the north beach. |
| Truce line | (−30, 2, 120) | A white cloth on an oar. |
| North beach, Landing Point | (−5, 0.4, 150) | Jennings's boats land here. The *Small Mercy*'s boat is drawn up at (−3, 0.4, 165). |
| Offshore | three sloops at (300, 0, −80), (330, 0, 0) and (310, 0, 90) | The middle one, with a red pennant, is the *Small Mercy*. A Bermudian turtler lies at (260, 0, −160). |
| Dunes | as before | Where the families shelter. |

**Theme.** Dusk uses `sunset-sky`, then `night-sky` (stars 0.4). Fires burn in the camp (flickering lights and ember particles), and after the fighting starts, smoke drifts as grey `float` particles. Music: root 52, phrygian, 92 bpm, `pulse: true` once the raid begins.

## Objectives and critical path

1. **Dusk.** Visit Rufina, Anselmo and Tito (each optional, but they set up the path choice). Lalo sees sails from the watchtower; climb it and count the enemy (an interact).
2. Go with Salmón to the truce line and hear Jennings's terms.
3. The truce hour: Fenwick finds the player (lines by `dh.fenwick`), and Rufina makes her proposal.
4. **The choice**, asked by Lalo at the watchtower foot, then one of three paths:
   - **Alarm:** ring the bell, hold the gate through three waves, evacuate the three tent clusters to the dunes, Salmón's surrender scene, the safe-conduct.
   - **Boats:** take Merino's key from his tent under the lantern sweep, unlock the huts, lead the divers through the grove (two scouts, the sweep), launch the boat and ride the surf out to the sloop.
   - **Parley:** three crossings between Salmón and Jennings through the burning camp, a negotiation at each end, and the keys handed over.
5. Departure for Nassau. The boat depends on the path.

## Optional areas

Five Lost Things in the storehouse annex and around the tents; three loose journal leaves (Inés's chart-case papers); the dunes overlook.

## Puzzles and combat

- **Counting the enemy** (watchtower). An interact gives the toast "Three sloops. Eight boats in the water. At ten men a boat and more aboard: two hundred, at least."
- **The gate** (alarm path). Three waves of three raiders each, using the foe kit (BUILD feature 3). Raiders have 100 HP and telegraph a 0.6 s raised-cutlass swing that costs 1 Grit. A beaten raider shouts "Quarter!", drops his blade and sits. A soldier loans the player a cutlass (`dh-cutlass-loan`). Between waves, interact with one tent cluster ("This way, to the dunes!"). The cluster's avatars hide and reappear at the dunes.
- **Merino's key** (boats path). Reach the tent pole without standing in the lantern sweep for more than 0.5 s. If spotted, the toast "A shout from the wall. You duck behind a barrel." returns the player to the grove edge.
- **The grove** (boats path). Two scouts (foes) on the path, plus the sweep. The divers "follow": their avatars appear at three waypoints as each is cleared.
- **The surf launch** (boats path). The boat is loaned as a board (`dh-launch`, `forceBoard(true)`). Ride 200 m out through the breakers (boost pads aimed +x, foam-reef hazards) to the zone beside the sloop.
- **Crossings** (parley path). Three runs of about 150 m. Musket volleys are telegraphed: a thin red line flickers for 0.5 s, then becomes a hazard for 0.3 s. Burning tents are hazards. Each crossing ends in a negotiation `w.ask` (below). A weak argument doesn't fail: the other side refuses and the player picks again.

**Outcomes for Rufina and Tito** (`dh.tito.state`):
- `paper`: book saved, and the alarm or parley path. Tito is freed by his contract, and both come to Nassau.
- `fled`: the boats path, or the parley path with the journal saved. Both are free fugitives and come to Nassau.
- `bound`: the alarm path with the journal saved. Tito stays with Merino, and Rufina comes to Nassau as Salmón's hired diver. **Salmón promises to pay Tito's price if the casket comes back to the King**, which weighs on the final choice.

## Encounters and set pieces

- **Sails at sunset:** three sloops anchoring in a line, black against the orange.
- **The truce:** two men with a white cloth between them and two hundred raiders watching from the boats.
- **Path set pieces:** the bell and the gate fight (alarm); the escape through the dark grove and the surf launch (boats); the walk through a burning camp under a white rag (parley).

## Collectibles and codex

**Loose leaves (Inés's papers):**
1. "Mr W. writes so politely. Polite men keep the knife in the other hand."
2. "The Swallow has no flag. If she must belong to someone, let it be someone who has been lost."
3. "Mateo's forty leagues. I have measured them a thousand times. They never get shorter."

**Lost Things** 15–19: a gold earring, a tobacco box, a prayer card, a bell clapper and a rag doll. Anselmo is at the storehouse at dusk.

**Codex:**
- *Henry Jennings:* a Jamaican planter and privateer whose 1716 raid on the salvage camp is often called the start of Nassau's pirate years.
- *Governor Hamilton's Commissions:* Jamaica's governor licensed ships "against pirates". Several of them went for the Spanish wrecks instead.
- *The Raid on the Salvage Camp:* early 1716. Salmón surrendered to a larger force, and the raiders took about £87,500 in silver and gold.
- *Quarter:* to ask for quarter was to surrender in exchange for your life. Most pirate-era fights ended in surrender, not slaughter.

## Dialogue

### Dusk

*Banner: "January 1716 · Palmar de Ais".*
**Rufina** (at the launches, counting coins into a cloth): "A hundred and forty-six. I had a hundred and twenty when Merino said five hundred. I'll be dead before I have five hundred. He knows that. That's the price."
**Anselmo** (storehouse; lines by `dh.saved`):
- *book:* "Tomorrow I put Faustino's contract before the Admiral. Three hundred, fixed. Merino can shout all he likes at ink."
- *journal:* "I wrote to Havana for a copy of Faustino's contract. Havana hasn't answered. Havana never answers."
**Tito** (at the huts): "Rufina's planning something. She has her planning face. It's the same as her diving face, but she blinks more."
**Lalo** (from the watchtower, shrieking): "SAILS! Three! Sloops! Flotsam, come up, come and look!"
*After counting:* **Salmón** (at the tower foot): "Two hundred. I have sixty soldiers and two hundred sick, and one of them is me."
**Salmón:** "They've raised a white cloth. Come with me. You've no flag, so you're a witness nobody can call a liar."

### The truce line

**Jennings:** "Admiral. Henry Jennings, of Jamaica, with a commission from His Excellency Governor Hamilton to suppress pirates in these waters."
**Salmón:** "There are no pirates in these waters."
**Jennings:** "Then I'm not here to fight you. I'm here to relieve you of a burden. The silver in that stockade, put in my boats, and nobody need be hurt."
**Salmón:** "That silver belongs to the King of Spain."
**Jennings:** "Then the King of Spain should have kept it out of the sea." *(to the player)* "And who's this? No coat, no colours. Interpreter?"

> **Ask (Jennings):** "Well?"
> 1. "A witness." → **Jennings:** "Good. Witness this: I said nobody need be hurt. Remember I said it first."
> 2. "Nobody you need to know." → **Jennings:** "Everybody I meet, I need to know. It's how I've stayed alive."

**Jennings:** "One hour, Admiral. Then I stop asking."

### The truce hour

**Fenwick** (stepping out of the dark by the tents; lines by `dh.fenwick`):
- *freed:* "Counsel! Whereas we are on opposite sides of a beach tonight, notwithstanding that you once bent the King's chain for me: stay out of the stockade. And if you need a boat, the *Small Mercy*'s is on the north beach. Ask for Sunday. Tell him I said so. He won't believe you, so tell him twice."
- *left:* "Ah, the damp one. No hard feelings about the cell. Business tonight, Counsel, nothing personal. Stay out of the way."
- *reported:* "You. I spent a month under the Morro because of you. Stay out of my way tonight, or I'll put you somewhere worse."

**Rufina** (in the shadow of the huts): "Listen. When they come, Merino's guard runs to the stockade with everyone else. He's paid to guard silver, not people. The huts will have one lock."
**Rufina:** "Help me open it and get a boat through the surf, and eight of us are gone tonight. Tito. Everyone."
*If `dh.saved = 'book'`:* **Anselmo** (who has followed, breathless): "Wait! The book! Tomorrow I put the contract before the Admiral. There's no need to run!"
**Rufina:** "Tomorrow there might be no Admiral." *(to the player)* "Your choice is yours. Mine's made."

**Lalo** (at the watchtower foot, the hour nearly up):

> **Ask (Lalo):** "What do we do?"
> 1. "Ring the bell. Hold the stockade." → `dh.raid = 'alarm'`
> 2. "Help Rufina. Run the boats." → `dh.raid = 'boats'`
> 3. "Back to the truce line. Stop this before it starts." → `dh.raid = 'parley'`

### Path A: Alarm

*The bell. The camp roars awake. Soldiers run for the gate.*
**Soldier:** "You! Take this. You know which end?" *(gives `dh-cutlass-loan`)*
**Lalo** (each time a cluster moves): "This way! To the dunes! Mind the fire!"
*After the third wave:* **Salmón** (on the stockade step, looking at the palms where torches are moving in hundreds): "Enough. They've come round through the trees. Two hundred against sixty. I won't trade lives for silver." *(He raises the white cloth.)*
**Jennings** (arriving): "A sensible man. Nobody dead?"
**Salmón:** "Nobody dead. Thanks to people who don't belong to anyone." *(to the player)*
**Salmón:** "You held my gate. Take this." *(Gives `dh-safe-conduct`.)* "A safe-conduct in the King's name. Jennings will sell this silver in Nassau. If the Queen's casket ever comes up out of that sea, it'll come up there too. Find it, for the King."
*If `paper`:* **Salmón:** "And Ocampo: Don Anselmo has shown me a contract with my own King's seal on it. Pay the balance, and your brother's free tonight." / **Rufina** (counting a hundred and eighty pesos onto the table, one at a time): "Paid. Write it down, Don Anselmo." / **Anselmo:** "I already have."
*If `bound`:* **Salmón:** "Ocampo. Go to Nassau with the stranger as my diver. Bring the King his casket, and the King pays your brother's price, every peso. My word." / **Rufina** *(after a long breath)*: "Your word. I'll hold you to it, Admiral. I hold everyone to everything."
**Salmón:** "There's a Bermudian turtler that sells to everyone and asks no questions. She sails for Nassau at dawn."

### Path B: Boats

*Merino's tent: the key ring on the pole.*
**Tito** (through the hut door as the lock opens): "Rufina said you'd come. I said you'd come. She said I talk too much."
**Rufina:** "Everyone out, quiet. Follow the stranger. If I say down, you're already down."
*In the grove, after the scouts yield:* **Raider** (sitting, hands up): "Quarter! Take the boats, take the trees, I never saw you."
*At the north beach:* **Rufina:** "A boat. Into it, all of you. Stranger, you're the one who rides surf."
*The *Small Mercy*'s boat if `dh.fenwick` is freed or left; Salmón's spare launch if reported.*
*At the sloop (freed or left):* **Sunday** (at the rail, a lantern in his hand): "The captain said someone might come. He said tell him twice. You didn't need to."
**Sunday:** "Free men and women are welcome aboard the *Small Mercy* if they'll sign the articles, and nothing is asked of you before you've read them."
**Rufina:** "Read them? Good. Nobody's ever offered."
*At the turtler (reported):* **Turtler skipper:** "Divers? Nassau? Sit on the turtles, and don't name them."
*Then, in every case:* **Tito** (looking back at the burning camp): "Merino will be counting his silver all night and won't notice till morning." *(a pause)* "I'm going to build a boat one day. A good one. With my own name on it."
*Sets `dh.tito.state = 'fled'`. No safe-conduct; Salmón will call the player a thief.*

### Path C: Parley

**Salmón** (at the stockade, when the player returns): "Back to the cloth? You'd talk to him? Hm. Then talk. You have nothing to lose but your neck, and it's not a Spanish neck."

*Crossing 1, to Jennings.*
**Jennings:** "The Admiral's errand-runner. Well?"
**Salmón's terms** (spoken by the player): "The Admiral will open the storehouse if you leave the camp its food, its boats and its people."
**Jennings:** "I've two hundred mouths of my own. Food's silver too."

> **Ask (Jennings):** "Convince me."
> 1. "Take their boats and fifteen hundred people die on this beach, and Hamilton's commission hangs you." → **Jennings:** "Hang me? Hamilton's paper says I'm suppressing pirates." *(a beat)* "But I take your point about the bodies. Go on."
> 2. "Leave the boats and food and you'll be gone before Havana's warships come." → **Jennings:** "Now that's an argument a man can spend."
> 3. "Fenwick says you're a gentleman." *(only if `dh.fenwick = 'freed'`)* → **Fenwick** (stepping up): "I said he was a gentleman relative to the others. But yes." → **Jennings:** "Damn you, Fenwick."

**Jennings:** "The silver and the storehouse keys, now. The boats and food stay. Tell him."

*Crossing 2, to Salmón.*
**Salmón:** "He wants me to hand an Englishman the King's silver like a waiter with a plate."

> **Ask (Salmón):** "Tell me why I should."
> 1. "Sixty men can't hold two hundred. Save them." → **Salmón:** "I know my sums. I hoped you'd tell me different."
> 2. "Silver can wait. People can't." → **Salmón:** "Someone said that to Ubilla, I'm told. He didn't listen. He's under the sea with the silver." *(a long pause)* "I'll listen."
> 3. "The King's already lost a fleet. Don't make him lose a camp." → **Salmón:** "Hm. A courtier's argument. It's also true."

*If `dh.saved = 'book'`, the player adds:* "And Faustino Ocampo's contract stands." → **Salmón:** "Add it. In writing. Don Anselmo!"
**Salmón** (pressing an iron ring of keys into the player's hand): "Take him these. And tell him if one sick man is touched, I'll find him in whatever hell he retires to."

*Crossing 3, to Jennings, with `dh-keys`.*
**Jennings** (weighing the keys): "Done. No one touched. You walked through a burning camp to save a Spaniard's pride and an Englishman's neck. Which side are you on?"

> **Ask (Jennings):** "Which side?"
> 1. "The people on the beach." → **Jennings:** "There's no money in that side. I've looked."
> 2. "None." → **Jennings:** "Then you're the only honest man here."

**Jennings:** "I'm for Nassau with the tide. There's room aboard for a go-between. Room for your friends too, if they're quick and quiet."
**Salmón** (later, at the boats): "You got me my people and cost me my silver, which is the trade I'd have made if I were braver." *(Gives `dh-safe-conduct`.)* "If the Queen's casket turns up, it'll turn up in Nassau. Find it for the King."
*`paper` if the book was saved. If the journal was saved, Rufina and Tito are simply gone by morning, `fled`, and a note in the launch reads "Nassau. R."*

### All paths: dawn

**Lalo** (on the departing boat's rail): "Goodbye, beach. I'm going to draw you with no hurricane in you at all."
*`dh.ch.6 = 'done'`. Travel to `dh-07-nassau`.*

## What the player learns and earns

- **Learns:** what history can't change and what it can. Who trusts the player now: Salmón, Jennings, Rufina or Sunday.
- **Earns:** the record `raid`, 4 codex entries, 3 loose leaves and 5 Lost Things. Alarm or parley earns `dh-safe-conduct`.
- **Flags:** `dh.raid`, `dh.tito.state`, `dh.safeconduct`, `dh.lost.15`–`19`, `dh.ch.6`.

## Hook

Silver is sailing for Nassau, and so is everyone who wants it. Somewhere ahead an Englishman holds Inés, and a clock may be ticking on a reef.
