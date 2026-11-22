# Chapter 9: Trial by Fire

*Saturday 7 April 1498, from noon to dusk.*
**Module:** `fi-09-prova` (the Piazza, the fire platform, the Roman tunnel). **Playtime:** 35–45 min.

> **Landucci's notebook.** *A Franciscan said he would walk into the fire with Fra Domenico, so that God might show who preached the truth. The whole city went to the Piazza at dawn and waited. They argued all day about vestments and crucifixes and the Sacrament. Then God sent rain. Everyone went home angry, and nobody had burned, and somehow that was worse.*

The "next great crowd" has come. A Franciscan has challenged Savonarola's companion to an ordeal: walk a corridor of fire and let God judge. The Signoria hired the city's best builder of spectacles to build the platform. Ottaviano rigged it twice, with igniters to make it flare and a sluice to make it flood. Whoever wins, the crowd will be watching the fire, and nobody will be watching the tunnel. While the friars argue above, Lente crawls beneath the platform.

---

## Locations and layout

The Piazza is as in Ch 1. The sky starts overcast (`day-sky`, dim), goes darker, and **storms** at the climax (a theme transition, `rain` particles, thunder `shake`).

| Element | Position (x; z) / size | Notes |
|---|---|---|
| **The fire platform** | x −15..−10 (5 m wide); z −120..−150 (30 m long); **2.4 m** high | Timber deck on trestles, earth-covered. Ramps up at both ends. (Its height is a liberty: tall enough to stand under.) |
| **The corridor** | 1 m wide, along x −12.5, on the deck | Flanked by **fuel stacks** 1.2 m high: brushwood bundles and pitch barrels. |
| **The underworks** | beneath the deck, 2.0 m clearance | Trestle posts every 2 m make a dim grid of lanes. Light comes only through the deck's gaps, as strips. |
| **Igniters ×5** | z −123, −129, −135, −141, −147, alternating x −14 / −11 | Each is a clockwork **striker**: a flint arm on a spring, a **nine-stave pinion** and an oil-soaked fuse up into the fuel. They're triggered by pressure plates under the corridor. |
| **The sluice** | a timber water tank on a 4 m stand at the north end (−12.5; −153) | A hidden pipe runs into the corridor floor. Rigged to flood on a cord. |
| **Entries** | the **south tarp** hatch (−12.5, 0, −151); the **tunnel trapdoor** (−12.5, −6 → 0, −135) from Ch 7's Roman vaults | |
| **The Loggia** | x 0..+18; z −140..−134 | Divided down the middle by a wooden partition: **Dominicans** west, **Franciscans** east. |
| **Ringhiera** | x +6..+8, y 1.5 | Your vantage over the crowd. |
| **Crowd** | about 700 static figures, ringing the platform and filling the piazza's edges | |
| **The tunnel** | Ch 7's vaults → south 60 m → a gate at the river (z +40 in module coordinates) | **The Angels move crates** along it during the ordeal (walkers carrying boxes). |

---

## Objectives and critical path

1. **Noon.** Arrive in the crowd. Smeralda and Cassandra are by the Mercato Nuovo corner. **"Find out what Ottaviano built."**
2. **Machiavelli** on the ringhiera: "Watch who is not watching the fire." (Puzzle 1.)
3. **Get under the platform** (the south hatch, or the tunnel trapdoor if you found it).
4. **"Disarm the igniters"** while the friars argue (Puzzle 2, with a dispute timer).
5. **Fra Domenico.** He's at the Loggia, waiting. A short scene (optional, but it changes the ending epilogue).
6. **The storm.** The ordeal is called off. If any igniters remain, **the flare** (Puzzle 3).
7. **The crowd turns.** **The choice: who do you follow?**
8. The hook.

**Optional areas:**
- **Look under the sluice tank**, a pointless mercy rigged for a fake miracle. Unhooking its cord unlocks the codex entry *Two Miracles for the Price of One*.

---

## Puzzles

### Puzzle 1: Who Is Not Watching

- **The vantage.** From the ringhiera, about 700 crowd figures face the platform. Exactly **four** face away: two toward the Loggia's back, and two toward a grate at the piazza's south-east edge.
- **The cheap version.** Those four are distinct static figures with their yaw turned, and each wears a rigger's rope coil (a torus on the shoulder). Approaching one makes them **walk away** along a path (a walker) that leads to:
  - (a) the **south tarp hatch**;
  - (b) the **tunnel grate**, which shows the crate-carrying Angels below;
  - (c) and (d) nowhere special, just men who were bored. That's an honest touch.
- **The puzzle is seeing:** the crowd is dense, and the odd ones out are only visible from above.

### Puzzle 2: The Igniters (the dispute timer)

**The timer.** The ordeal stalls through a sequence of real disputes, each a stage of a **10-minute timer** that the player can hear above the deck:

| Minute | Dispute |
|---|---|
| 0–2 | The Franciscans object that Fra Domenico's **vestments** may be enchanted. He changes them. |
| 2–5 | They object to his **crucifix**. He gives it up. |
| 5–8 | Savonarola insists Domenico carry **the Sacrament** into the fire. The Franciscans refuse to allow it. |
| 8–10 | The sky darkens. Thunder. |

**Disarming.** Each igniter needs **two actions**: interact to **lift the fuse** out of the fuel, then **strike** (key 1) to **break the pinion**. Bare hands take 3 strikes, a blade 1. Each gives a **striker** (evidence), and `fi.c9.igniters` counts up.

**The guards.** Two Angels patrol the underworks (Ch 6 stealth rules; the deck-gap light strips **double their vision range** when you stand in one).
- If `fi.c7.offer = feigned`: one guard waves you through: "Master says you're thinking about Venice. Think quick."
- If `struck`: a third guard, Gatto, is added, and he holds a grudge.

**Getting caught** means being thrown out of the south hatch, back to the start of the underworks. The timer keeps running.

### Puzzle 3: The Flare (only if igniters < 5)

- **The flare.** When the rain begins, one remaining igniter (the northernmost left armed) fires anyway. A gout of fire runs up its fuse into the brushwood at the north end, where **the fanciulli**, Masino among them, stand singing.
- **The rescue.** Climb out and reach the **burning pitch barrel** within **10 s**, then strike it off the platform into the mud. It's a hazard zone around it, and a mover rolls it off.
- **Late?** The rain douses it a second later. Nobody's hurt, but Masino's hand is singed (`fi.c9.flare = burned`). He remembers in Ch 10.
- **In time:** `fi.c9.flare = saved`.

---

## The set piece: The Ordeal That Never Was

- **The crowd's hours** compressed into minutes. Chants rise and fall (toast pulses).
- **The friars:** the Dominicans singing in their half of the Loggia, the Franciscans silent in theirs, the Signoria's messengers running between.
- **The storm** breaks at the 10-minute mark:
  - the sky turns black, a `shake(1.2)` of thunder, rain particles dense and slanting;
  - the fuel stacks steam;
  - a herald on the ringhiera announces the ordeal is **called off**.
- **The turn.** The crowd roars, but this time *against* the friar. Static figures swap to a "turned" pose set, and **Doffo Spini's Compagnacci** (about 15 walkers) push toward the Dominican half of the Loggia.

---

## Collectibles and codex

**Collectible:** five **strikers**, the Gallery's "Ottaviano's Clockwork". Each has a nine-stave pinion.

**Codex.**
- **The Ordeal by Fire.** Proposed in March 1498 by the Franciscan Francesco di Puglia, accepted by Fra Domenico da Pescia, and authorised by the Signoria. A long platform of fuel with a passage through it was built in the Piazza. On 7 April disputes about vestments, crucifixes and the Sacrament lasted until a storm broke. The ordeal never happened.
- **Fra Domenico da Pescia.** Savonarola's closest companion, famous for his cheerful, absolute faith. He offered to walk into the fire, and he would share his master's death.
- **Two Miracles for the Price of One.** In our story Ottaviano rigged the corridor both to flare and to flood. Spectacle doesn't care who wins, only that everyone is looking.
- **"Unarmed Prophets."** Years later, Machiavelli wrote that armed prophets conquer and unarmed ones are ruined, and gave Savonarola as his example. In April 1498 he was 28, without an office, and watching.

---

## Dialogue

### Noon, in the crowd

**SMERALDA:** *(shouting over the crowd, Cassandra beside her)* He built it. The platform. The Signoria paid him in gold. Of *course* they did.
**CASSANDRA:** And somebody paid me in gold yesterday for a sheet called *THE FRIAR'S FIRE WAS A FRAUD*, to sell tonight. Whatever happens. *Whatever happens.* *(Beat.)* I'm starting to hate being prepaid.
**SMERALDA:** "Wait for the next great crowd." This is it, Lente. Everyone's looking at that platform. Find out what he's doing where no one's looking.

### Machiavelli (the ringhiera)

**MACHIAVELLI:** *(leaning on the rail, eating dried figs)* You're the flying Fleming. Everyone's heard. The friar's boys call you a miracle, and the Arrabbiati call you a trick. I'm told I'm supposed to have an opinion.
**MACHIAVELLI:** Niccolò. I'm nobody yet. It gives me time to watch things.
**MACHIAVELLI:** Here's what I've learned today. Seven hundred people looking at a pile of sticks. A crowd is a very good machine for seeing one thing. It's useless for seeing anything else.
**MACHIAVELLI:** If you want to know what's really happening in a city, don't watch the fire. *(He points with a fig.)* Watch who is not watching the fire.

*(Later, during the storm, if the player passes the ringhiera:)*
**MACHIAVELLI:** *(not bothering to shelter)* A prophet without soldiers is a man shouting in the rain. *(Beat.)* Write that down, somebody. No, don't.

### Under the platform (barks)

- **ANGEL** *(seeing you, if `feigned`)*: Master says you're thinking about Venice. Think quick. *(Looks away.)*
- **GATTO** *(if `struck`)*: The Fury! I've been *hoping*. Out you go.
- **Above** (heard through the deck): "Take off the vestments, Brother. They may be enchanted." · "Then he shall give up the crucifix." · "He will carry the Sacrament, or he will not go in." · "*Never* the Sacrament into the fire!"

### Fra Domenico (the Dominican half of the Loggia, optional)

**FRA DOMENICO:** *(sitting on a bench in a borrowed habit, utterly calm)* They've taken my vestments, my crucifix, and now they want to take God out of my hands. I've never been so light in my life.
**FRA DOMENICO:** You're the one Masino talks about. *(Smiling.)* He says you fly. I said: good, then you'll understand. Going into the fire is only flying downward.
**FRA DOMENICO:** Are you afraid for me? Don't be. If God wants me through the fire, I'll come out the other side. If He doesn't, I'll arrive somewhere better without the bother of walking back.
*(`fi.c9.domenico = true`.)*

### Savonarola (passing, at the Loggia)

**SAVONAROLA:** *(to a Signoria messenger, quiet, unyielding)* My brother will carry the Sacrament or he will not go. I did not ask for this fire. They asked for it. Let them have their answer from God, not from me.
*(He sees Lente. A long look.)* **SAVONAROLA:** You were in the cathedral, the day of the sword. I remember faces. *(Beat.)* Do you think God has a sense of theatre?
*(No answer is required. He turns away.)*

### The storm

**HERALD:** By order of the Signoria, the trial is ended! Go to your homes!
**DOFFO SPINI:** *(on a barrel, soaked, delighted)* Ended! The friar's champion won't burn and the friar won't let him try! Fraud! *Fraud!* Where's his miracle now? Where's the flying Fleming?
**LANDUCCI:** *(knocked into the mud by the crowd; if the player helps him up:)* Thank you. Thank you. I came at dawn. I brought bread. I've been here eleven hours to watch it rain. *(Beat.)* I'll write that the people waited. They did wait.

**[ask]** *(Smeralda, at your shoulder, soaked)*: "Where are you going?"
1. "With the friars. They'll need a path through this." → `fi.c9.follow = friars`
   - **SMERALDA:** Go. Keep the boy close. *(Masino is among the fanciulli around the friars.)*
2. "After the Angels. Into the tunnel." → `fi.c9.follow = ottaviano`
   - **SMERALDA:** The tunnel to the river. Find the boat. Don't get on it.
   - *(In the tunnel, Lente follows the crate-walkers to the river gate, sees the **barge's mooring** under the Ponte alla Carraia, and finds the pamphlet bundles for Cassandra. Back above, Cassandra reads them and goes white: "He paid me to say it was a fraud before anyone knew. I'm done being his parrot." Cassandra is now an ally.)*
3. "Stay with the crowd. Somebody's going to get trampled." → `fi.c9.follow = crowd`
   - **SMERALDA:** Then I'll stay with you. *(Landucci, and three others pulled from the crush, become the epilogue's witnesses.)*

### The hook

**DOFFO SPINI:** *(to his Compagnacci, as the rain slackens)* Tomorrow's Palm Sunday. Tomorrow, San Marco. Bring torches. Let's see if *that* fire will take him.
**MACHIAVELLI** *(if nearby)*: And there it is. The city always finishes the fire it starts.

*(Banner: CHAPTER 9 COMPLETE · Witness to the Ordeal.)*

---

## Learns and earns

**Learns:**
- **Ottaviano's tunnel is active.** The cache is moving to a barge, but the storm has swollen the Arno and the barge can't pass the weirs. He'll wait for the river to drop.
- **Cassandra's** advance-paid pamphlet shows how Ottaviano sells the outcome before it happens.

**Earns** (soulbound):
- **Title:** *Witness to the Ordeal.*
- Up to 5 strikers (Gallery, and evidence).
- **Cosmetic:** *Rain-Dark Hood* (head), a soaked citizen's hood. It's a head item so it never displaces the Wing.
- The codex entries.

**Hook:** "Tomorrow, San Marco."

**Playtime:** 35–45 minutes.
