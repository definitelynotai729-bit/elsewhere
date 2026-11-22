# Chapter 9: The Last Circuit

**World:** `lsb-harbour` · **Story time:** day 10, dawn to mid-morning · **Playtime:** 35–45 minutes
**Rules:** `deny: ['board']` · **killY:** −20 · **Music:** root 50, minor, 104 bpm, `pulse: true`, rising every errand
**Theme:** a dark morning: a red sun behind ash, horizon `#8a3a2a`, fog 50–260 m in `#3a2a26`, pumice falling (grey `snow` particles, faster than Chapter 7), the palace burning on the hill (fire particles, two warm lights).

## Summary

The last morning. Ash falls on Kerynthos, pumice rains into the harbour and the ships take on everyone they can. The player has **twelve minutes** before the great wave, and a list of errands that depends on everything they have done so far: open the sea-gates, light the beacon to Thyra, empty the Quiet Rooms, send Little Kore for the children, test the Wing Bridge, carry the Bronze Heart to Talos, and climb the burning palace for the Wanassa, who will not leave. Then Talos walks his last circuit into the harbour mouth and braces, and the player makes the final glide to the last ship.

## Locations and layout

Origin (0, 2, 0) is Kerynthos quay (as in Chapter 4). The palace is on the hill to the north (−z, layout as Chapter 4). The harbour mouth is south (+z).

| Area | Centre (x, y, z) | Size (m) | Notes |
|---|---|---|---|
| **Quay** | (0, 2, 0) | 40 × 6 | The fleet loading. Kessa's *Patient Cow* is the last ship, at the quay end (14, 0.5, 8). Checkpoint `quay`. |
| **Lighthouse and winch** | (30, 2 → 14, 55) | tower 5 × 12 × 5 | The sea-gate winch is in the vault under it: a bronze capstan. |
| **Sea-gates** | (0, −2, 62) | two gate leaves 20 m wide | Sunken bronze gates across the outer harbour. Raised by the winch, they make a channel three ships wide. |
| **Beacon Tower** | (−50, 30, 40) | tower 6 × 30 × 6 | On the west headland. Inside, a stair (ramps) and pyre at the top facing south toward Thyra. Pumice falls hardest here. |
| **Palace** (from Chapter 4) | (0, 20, −90 → −190) | | On fire in parts. The Central Court has a **fire thermal** over it (a wind box 14 × 50 × 14, force (0, 34, 0), at (0, 20 → 70, −140)). The Throne Room, the Gallery of Korai (flooding to 0.6 m), the nursery off the Upper Hall (30, 26, −120) and the Labyrinth Gate to the Quiet Rooms. |
| **Wing Bridge launch** | (35, 32, −145), roof of the Hall of Columns | | Perdika's and Ikmalios's glider rack, if the bridge was built. Also the final glide start. Checkpoint `roof`. |
| **Harbour mouth** | (0, 0, 80) | | Where Talos stands (if he comes). The wave arrives from beyond it. |

**Timer.** 720 s from arrival, shown in the objective line. At 0 the wave comes (the set piece). Errands take about 1.5–3 minutes each. A player who routes well can finish all of them in about 11 minutes, so choosing an order is part of the drama.

## The errands

Each errand shows up in the objective list only if its condition holds, and each one adds to `lsb.saved` when completed (the amounts are in the README).

| Errand | Shows if | Do this | Adds |
|---|---|---|---|
| **Open the sea-gates** | `lsb.proteus = 'how'` | Reach the vault under the lighthouse; strike the capstan's three locking pins out; push the capstan (interact, held for 4 s) | +200 |
| **Light the beacon to Thyra** | always | Climb the Beacon Tower through falling pumice (puzzle 1); light the pyre. Thyra's boats come only if Eumaia is on Thyra (`home`), or after she is freed (see "Find Eumaia") | +150 |
| **Find Eumaia** | `lsb.eumaia = 'held'` | She is in the Guest Quarters. Strike the door bar; she goes to Kessa's ship. Then the beacon counts | (enables the beacon) |
| **Empty the Quiet Rooms** | always | Labyrinth Gate, the stairs, the knee-deep Quiet Rooms; strike the outside bar of the door. Tarkon leads the others out by lamp. If `lsb.linnet = 'hidden'`, Linnet is there too (`lsb.linnet = 'rescued'`); otherwise a hidden Linnet is `lost` | story |
| **The children** | `lsb.kore = 'freed'`, or `chained` with the pin-key in hand | Nursery door: strike the bar. Kore carries them two at a time down the servants' stair. If chained, free her in the flooding Gallery first | +60 |
| **Test the Wing Bridge** | `lsb.compass.returned` and `lsb.perdika.trust` | Glide from the Hall of Columns roof down to Kessa's mast carrying the guide line (an item that must arrive). Perdika and Ikmalios then ferry people with gliders | +250 |
| **The Bronze Heart** | `lsb.relic = 'heart'` and Talos at the harbour mouth | Bring the heart to the end of the breakwater. Talos kneels; Ikmalios fits it | +150 |
| **The Wanassa** | always | The Throne Room. The choice | +250 if `guest` |
| (automatic) **Kessa's last load** | `lsb.kessa.paid` | She waits at the quay for the last people instead of sailing early | +120 |
| (automatic) **Talos stands** | `lsb.talos = 'truth'` or `'unsure'` | He braces in the harbour mouth | +350 (`unsure`: +200, he arrives late) |

## Puzzles

1. **The Beacon Tower.** The outer stair is broken in three places. Pumice falls on fixed lanes, with a shadow 1 s before each stone lands, and a hit sends you to the tower base. *Solution:* climb the inside stair to the first break, cross outside on the ledge between pumice lanes, and use the beam (a 0.4 m box) to cross the second break. The third break is a 3.5 m gap: a jump, or a double jump if you have boots.
2. **The flooding Gallery.** Water rises in the Gallery at 1 cm/s. Kore's plinth is at the far end, past fallen statues (obstacles you climb). *Solution:* go over the statues' shoulders, not round them; the floor route is slower and wet.
3. **The final glide.** From the Hall of Columns roof (y 32) the last ship is about 150 m away, and a straight glide falls just short. *Solution:* glide first into the fire thermal over the Central Court, rise to about 55 m, then glide south to the ship (about 240 m of glide available). The ribbons on Perdika's rack point the way.

## Set pieces

- **Talos's last circuit.** He walks out of the sea to the harbour mouth, off his circuit for the first time in a thousand years, and stops there knee-deep, facing out. When the wave comes he spreads his arms, braces one foot on the breakwater and takes the sea full on his chest. White water explodes thirty metres high. For a few seconds he is the only thing standing between the harbour and the sea, and the last ships go out on either side of him. With the Bronze Heart, he holds longer.
- **The last glide.** From a burning palace roof, up a column of fire, then down through falling pumice to a ship already moving, as the wave comes over the breakwater.

## Collectibles and codex

- **Old Horn sighting 9** (`lsb.goat.9`): on the Beacon Tower's pyre, before it is lit. "Old Horn, on the beacon pyre. You will need to ask her to move." Interacting lifts her down, and she rides Kessa's ship.
- **Codex:**
  - **The Sea-gates:** "Bronze gates sunk across the outer harbour in the old Queen's time, when the House feared raiders. Raised, they make a channel three ships wide."
  - **The Beacon Chain:** "Fire on the headland, fire answered from Thyra, fire from every island that still has someone to light it."
  - **Talos's Last Circuit:** written for whichever outcome happened (dialogue 9.6).
  - **The Wanassa's Choice:** written for the outcome (dialogue 9.5).

## Dialogue

### 9.1 Arrival (the quay)
**KESSA:** "There you are. Twelve minutes, the old man said, or the singer did, or my own bones. Everyone's guessing and the guesses all say twelve."
**KESSA:** "I'm loading. I'll load till the water's at my knees. Do what you have to and come back to my cow. Don't make me sail without you; I'll never forgive you, and I'm very good at not forgiving."
*(If `lsb.voice = 'truth'` or `'linnet'`:)* **KESSA:** "They came down from the Ear in order, you know. Families holding hands. Old people carried. Nobody trampled. I'd have bet my ship against it."
*(If `'comfort'` or `'silence'`:)* **KESSA:** "Half of them are still up at the Ear, waiting to be lifted. The other half are fighting on the quay. Hurry."

### 9.2 Short errand lines
- **Sea-gates, done:** toast "The bronze gates rise out of the harbour with a sound like a giant's door." **KESSA** (distant): "THREE ABREAST! Look at them go!"
- **Beacon, lit:** toast "Your fire on the headland. A long moment. Then, far to the south, an answering spark on Owl's Watch." *(If Eumaia is on Thyra:)* toast "Thyra's boats are coming."
- **Eumaia, freed:** **EUMAIA:** "Late, lamb! Three dinners late. Never mind. Point me at a boat and give me something to carry."
- **Quiet Rooms:** **TARKON:** "Is that the door? Is the door open? Everyone, hold the lamp, hold hands. We're going up. Up! Ha!" *(If Linnet is there:)* **LINNET:** "You came back for me. Of course you came back. Eumaia would've come down here with a goat."
- **Children:** **LITTLE KORE:** "Two at a time! Two at a time! They're very light. Lighter than bronze. Everything is lighter than bronze!"
- **Wing Bridge:** **PERDIKA:** "You made the mast! The line's tied! Ikmalios, the first pair, NOW." **IKMALIOS:** "Saw and compass, girl, I'm going!" *(If trust, Perdika straps on her own wings.)* **PERDIKA:** "...I'm ready. I'm ready. Count me down." *(She jumps, and glides beautifully and low.)*
- **Bronze Heart:** **IKMALIOS:** *(at the breakwater, as Talos kneels)* "Hold still, old friend. Open. There. There." **TALOS:** "...Two hearts. One for walking. One for standing."

### 9.3 Talos (at the harbour mouth, before the wave; if he came)
*(If `lsb.talos = 'truth'`:)*
**TALOS:** "Guest. I have thought about it for two circuits."
**TALOS:** "No one is coming to tell me it was well done. So I am deciding. I walked a thousand years around a thing I was told to guard. Today I will guard a thing I chose."
**TALOS:** "This is my last circuit. It is very short. It goes from here to here."
*(If `'unsure'`, he arrives at 120 s left:)*
**TALOS:** "Guest. I still wonder. But wondering is something I can do standing still."

### 9.4 The Wanassa (the Throne Room; water ankle-deep)
**WANASSA ASASARA:** "Stranger. Sit, if you like. The water is warm. Everything's warm today."
**WANASSA ASASARA:** "My grandmother sat here when the Voice before last said 'the god is pleased', and so did my mother, and so did I. A house is not left. It is kept."
*(If `truth` or `linnet`:)* **WANASSA ASASARA:** "I heard it. From the Throat. I watched my people stand up and walk away from the god's table, in order, holding hands. It was the most beautiful thing the Isles ever did, and I didn't order it."
*(If `comfort` or `silence`:)* **WANASSA ASASARA:** "The god said remain. We remain. That's what the faithful do."
**WANASSA ASASARA** (ask): "Will you sit with us a while?"
- → **"Be my guest. Take this."** *(the player offers their own half of Eumaia's token)*
  *(If `truth` or `linnet`; `lsb.wanassa = 'guest'`:)*
  **WANASSA ASASARA:** "A guest-token. Broken clay." *(she turns it over)* "We've given ten thousand gifts from this throne. No one has ever given us one."
  **WANASSA ASASARA:** "If I take it, I'm a stranger. I'll have no house. I'll be a guest at someone's hearth, with my feet washed by a goatherd."
  **WANASSA ASASARA:** *(she stands, and the water runs off her robe)* "...I. I will take it. I would like, once, to be welcomed." *(Her household and the Axe-Bearers follow her to the ships.)*
  *(Otherwise; `lsb.wanassa = 'argued'`:)*
  **WANASSA ASASARA:** "A guest? Of whom? The god invited us to a feast. We don't leave a feast." *(She gives it back.)*
- → **"They need you. Come and lead them."** *(`lsb.wanassa = 'argued'`; costs 45 s)*
  **WANASSA ASASARA:** "Lead them where? I only know how to lead them here." *(She stays.)*
- → **"Goodbye, Wanassa."** *(`lsb.wanassa = 'left'`)*
  **WANASSA ASASARA:** "Goodbye, Stranger. You were a good guest. Better than we were hosts."

### 9.5 The wave (timer 0)
*(Kessa's horn, three long blasts. The sea beyond the harbour mouth rises into a wall.)*
**KESSA** (as a toast): "NOW! NOW! WHOEVER'S COMING, COME!"
*(If Talos is there:)* **TALOS:** "One." *(he braces)* "Two." *(the wave hits; a white explosion)* "...Three."
*(The final glide. Landing on the *Patient Cow*'s deck as she clears the mouth past Talos's shoulder.)*
*(If Talos is absent (`lie`): the wave comes over the breakwater unbroken, the last ships ride it out in chaos, and fewer of them make it.)*

### 9.6 Aboard (after the glide; the last lines of the chapter)
**KESSA:** "Got you. Again. That's three times; I'm charging you."
*(Talos outcome, seen from the stern:)*
- *With the heart:* "Talos is still standing when the wave passes, green water pouring off his shoulders, one foot on the breakwater. Then, slowly, he sits down in the harbour mouth, and stays there."
- *Without the heart (truth):* "Talos holds through the wave's peak. Then the tin nail at his ankle gives, a red thread runs into the sea, and he kneels in the harbour mouth as if he were listening to something. He does not get up."
- *Unsure:* "Talos arrives late and braces too low. The wave breaks over him, and when it passes he is lying along the breakwater like a second wall. The ships went out over his back."
- *Lie:* "Far out to the south, a tiny bronze figure walks his circuit along the horizon, counting, as the wave reaches him."
**KESSA:** *(watching Kerynthos behind them, the palace sliding into the sea in a long roar)* "There goes the House of the Double Axe. Nine hundred rooms, and nobody ever counted them twice."
**KESSA:** "South. To Thyra. It's the farthest from the mountain and it's got a hearth."
*(Compute `lsb.saved`. Title **Last off Kerynthos**. Travel to `lsb-hearth`.)*

## Learned and earned

- **Earns:** the title **Last off Kerynthos**; Old Horn 9; the saved count (`lsb.saved`); `lsb.wanassa`; Linnet's fate (`rescued` or `lost` if she was hidden).

## Hook

Night on the open sea. Every ship that made it is roped to the next in a long chain of lanterns, and somewhere in the chain someone starts the Festival hymn, but slower, with the words changed: *the mountain will lift the faithful high* becomes *the sea did not take the children*. Ahead, on Thyra's peak, a beacon is burning.
