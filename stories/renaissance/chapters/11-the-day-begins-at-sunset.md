# Chapter 11: The Day Begins at Sunset

*22 May 1498, from late afternoon through the night. Epilogue at dawn on 23 May.*
**Module:** `fi-11-tramonto` (the Palace tower, the Arno, the bridges, the weir). **Playtime:** 45–60 min.

> **Landucci's notebook.** *The twenty-second. Tomorrow they will burn the friar and his two companions in the Piazza. The river has gone down at last. Tonight I am going to sit on the Ponte Vecchio and wait for morning, because I cannot sleep, and because I have written everything else, and I should see the end.*

On the eve of the execution, the bell-ringer Cecco smuggles Lente up the Palace tower to the friar's cell for a last, quiet talk. At sunset, the twenty-fourth hour, when Florence's old day ends, Ottaviano's barge of stolen beauty slips out from under a bridge. Lente chases it down the Arno, over rooftops, bridges, timber rafts and mill wheels, to the weir. Ottaviano stands on his cargo with a lantern over the oil. He finally has the audience he wanted, and the player decides how the day ends.

---

## Locations and layout

**Theme.** Late golden afternoon, then **sunset** (the `sunset-sky` HDRI) and the Ave Maria. Then a moonlit night (`night-sky`), and **dawn** for the epilogue. These are theme transitions; see BUILD.md.

**The river.** The Arno runs east to west, along **−x**. Water is at y −6. Bridges cross along z.

| # | Location | Bounds (x; z) / y | Notes |
|---|---|---|---|
| 1 | **The Palace tower** | (+21, *, −166); the cell at y 30, the bell chamber at y 40, the crenellated top at y 44 | As in Ch 3. **Cecco** meets Lente at the tower door. Spawn (+18, 16, −160), the roof walk. |
| 2 | **The Alberghettino** | 3×3 m, y 30 | A barred grate in a heavy door. A stool, a desk board, a lamp. **Savonarola** inside. |
| 3 | **Ponte Vecchio** | as Ch 1 (x −9..+9, z −10..−58) | Checkpoint. The epilogue is set here. |
| 4 | **Lungarno roofs** (north bank) | x −10..−160; z −60..−75; y 10–16 | Rooftops along the river. Gaps of 2.5–4 m. Two **tenter frames** in a dyers' yard at x −70. |
| 5 | **Ponte Santa Trinita** | x −85..−97; z −10..−58; deck y 0, parapets y 1.2 | Checkpoint. |
| 6 | **Timber rafts** | river, x −100..−150 | Five log rafts (4×2.5 m) drifting west: movers at 2 m/s on loop paths, staggered. They're the stepping stones between the bridges. |
| 7 | **Ponte alla Carraia** | x −160..−172 | Checkpoint. **The barge's old mooring** is under its north arch. Shortcut if `fi.c9.follow = ottaviano`: a moored skiff here pushes you downstream (boost). |
| 8 | **The mills** | x −185..−215, north bank | Two **undershot mill wheels**, radius 3, each with 8 paddles (looping movers on circular paths). Ride a paddle up to the mill roof (y 8). Mill races are **wind** zones pushing west. |
| 9 | **The weir** (*pescaia*) | a diagonal stone ramp from (−230, −6, −62) to (−260, −6, −8), 4 m wide | Water pours over it in a white sheet. At its south end, a **lock** with a timber sluice gate. **The barge is in the lock.** |
| 10 | **The barge** | 14×5 m, at (−262, −5.5, −12) | Stacked with crates under tarps, a little cabin, **oil jars** open along the gunwale. **Ottaviano** stands on the crates. Three **Angels** pole it. |

---

## Objectives and critical path

1. **"Cecco says the friar asked for you."** Climb the tower (ramps, as Ch 3) to the cell.
2. **The Alberghettino** (scene).
3. **The Ave Maria.** Climb to the tower top. At the 24th hour the bells ring, and **the barge slides out** from under the Ponte alla Carraia (a scripted mover).
4. **"Catch the barge."** Glide from the tower toward the river (the drop of about 44 m buys about 200 m). Then the **river chase** (Puzzle 1).
5. **The weir.** The confrontation, and **the final choice.**
6. **The ending** (A, B, C or D).
7. **Epilogue:** dawn on the Ponte Vecchio, then the Bottega.

---

## Puzzles

### Puzzle 1: The River Chase

- **The barge** is a mover on a path down the Arno at **4.5 m/s**. It **waits at each bridge** for 6 s while the Angels lower its mast. Then it reaches the lock and stops. It can't be lost: the chase is about getting there with style.
- **The route:**

| Stage | Route | Notes |
|---|---|---|
| 1 | Glide from the tower | To the Lungarno roofs or straight onto the Ponte Santa Trinita parapets. |
| 2 | Lungarno roofs | Tenter-frame bounces. |
| 3 | Santa Trinita → Carraia | Over the **rafts**: river hops on drifting logs, timed. |
| 4 | Carraia → the mills | Ride a **mill wheel paddle** up to the mill roof. The mill races (wind) push you along. |
| 5 | Mill roof → the weir | A final **glide** from the mill roof to the weir's top step (drop 14 m). Spring boots open a faster line along the wheel axles. |

- **Water** respawns you at the last bridge checkpoint, as everywhere.
- **Record:** `fi-river-chase`.
- **Signal to Cassandra.** Passing the Ponte alla Carraia, an interact on the parapet: Cassandra waits there with a hand mirror ("Flash me when you find him"). This sets up ending A's signal. Cassandra is there in every playthrough, because Smeralda has recruited her by now. Whether the city *believes* her sheet is what the evidence score measures.

---

## The Alberghettino (scene)

*(The cell is dark but for a lamp. The friar sits at the board with a pen. His hands are bandaged, and he writes slowly.)*

**CECCO:** *(at the stair)* Two minutes. Then I've never seen you. *(Beat.)* I rang the Cow for the Republic, Fleming. I didn't think I'd ring it for this.
**SAVONAROLA:** Masino's flying friend. Come to the grate. I can't stand easily now.
**SAVONAROLA:** I'm writing on the Psalm. *Miserere mei, Deus.* "Have mercy on me, O God." I've preached it to others for years. It turns out it's a very different psalm when you're the one saying it.

*By `fi.c10.truth`:*
- **`sword`:** **SAVONAROLA:** You told me the sword was glass. I have thought of little else in this room. I wanted to be believed more than I wanted to be right. That is the sin of every preacher, and of every man who builds a stage.
- **`loved`:** **SAVONAROLA:** You told me they loved me. Tomorrow they will watch me die. Both are true. I've stopped needing them to agree.
- **`silence`:** **SAVONAROLA:** You gave me silence. I've had a great deal of it since. It isn't so bad. God speaks quietly; I was always shouting over Him.

**SAVONAROLA:** A man sent me a message, two nights ago, through a guard who smelled of pine resin. He offered to get me out. A rope from the tower, a disguise, a boat. He said: "Imagine their faces. The prophet vanished from a locked tower, on the eve of his burning. The last miracle Florence will ever see."
**SAVONAROLA:** I told the guard to tell him: I will not be his last miracle. *(Beat.)* He said the boat leaves at sunset either way, when the river is low enough. With or without the prophet. He seemed to find it funny.
**SAVONAROLA:** Do you know, in Florence the day begins at sunset? *(He looks at the slit window, at the gold light.)* Then tomorrow has almost begun. I'm nearly finished with today.
*If `fi.c10.masino = home`:* **SAVONAROLA:** Tell Masino to learn a trade with his hands. Tell him God likes a well-made thing.
*If `stayed`:* **SAVONAROLA:** Masino is with my brothers now. Tell him I said he did right to stay, and right to go, if he goes.
**SAVONAROLA:** Go on. The light's going. Whatever that man is carrying, it isn't his. Not much in this city belongs to the people who are holding it.

*(The bells begin the Ave Maria. Cecco: "Up, Fleming. The top. Go!")*

---

## The Weir (confrontation)

*(The barge in the lock, its sluice half-raised. Ottaviano stands on the crates with a lit lantern. Oil jars uncorked along the gunwale. The Angels on the bank, uneasy.)*

*Opening line, by `fi.c7.offer`:*
- **`feigned`:** **OTTAVIANO:** My diplomat! You've come to say yes to Venice. Too late; the boat's full. But there's room for one more, if you sit on Petrarch.
- **`refused`:** **OTTAVIANO:** The honest one. I knew it'd be you. Honest people are so *punctual*.
- **`struck`:** **OTTAVIANO:** My little Fury. You owe me a lantern. I've brought another. Let's not break this one; it's the only light on the river.

**OTTAVIANO:** He wouldn't come, you know. The friar. I offered him the greatest exit in the history of the stage, and he said no. *(A real, baffled pain.)* He'd rather burn in front of them than vanish in front of them. I'll never understand him.
**OTTAVIANO:** Look at it. *(The crates.)* Botticelli. Lorenzo's books. Lutes from Brescia. Gems older than Christ. Florence threw all of it into a fire and called it virtue. I'm the only one who caught it.
**OTTAVIANO:** And the city? It'll burn its prophet in the morning and buy fish in the afternoon. It doesn't deserve a single one of these.
*If `fi.c7.saved = painting`:* **OTTAVIANO:** You've still got Sandro's lady, *La Bella*. Her copy burned so prettily on the sixth step. She's the only thing in the world I'd come back for.
*If `book`:* **OTTAVIANO:** You've got Lorenzo's Petrarch. Read it. He wrote, "Of tomorrow there's no certainty." He meant, "*Drink now.*"
*If `lute`:* **OTTAVIANO:** You saved a *lute*. Out of all of it. *(He laughs, genuinely.)* That's the most Florentine thing I've ever seen.

**OTTAVIANO:** *(lifting the lantern a little over the oil)* So. I've finally got an audience that's paying attention. And I'm told the good shows let the audience decide the ending.

**[ask] OTTAVIANO:** "How does it end, little lens?"
1. "The city will see what you did." → `fi.c11.end = A` if the **evidence score is at least 2**, otherwise `C`.
2. "Take your boat and go." → `B`.
3. "Drop the lantern, Ottaviano." → `C`.
4. *(Only if ending D's conditions are met)* "…" *(Say nothing.)* → `D`.

---

## The endings

### A. The Open Window

**Lente.** You lift Smeralda's spectacle-glass and catch the last light. Upriver, on the Ponte alla Carraia, a mirror flashes back once.

**OTTAVIANO:** *(lowering the lantern a little)* What was that?
**CASSANDRA** *(a shout carrying down the river)*: Type's set! *How the Miracles Were Made*, by the people who watched them! Four hundred sheets by dawn!
**OTTAVIANO:** Printing. *(He laughs, and it cracks.)* The friar had sermons, Lorenzo had songs, and you have a *printer*. Of course. The only machine I never learned.
*(Lanterns come up the bank: the Eight, sent by Smeralda.)*
**OTTAVIANO:** *(setting the lantern down on a crate, very carefully)* Tell them to be gentle with the Venus. *(To Lente:)* I'd have made you the greatest showman in Italy.
**SMERALDA** *(arriving, breathless)*: You'd have made a liar a little richer. Come down, Ottaviano. The city's tired of fires.

**Epilogue (A).**
- **The demonstration.** A month later, Smeralda stands on the ringhiera before a crowd, with her lens on a frame and a stencil in her hand. At noon, a small sword of light appears on the Palace wall.
  - **SMERALDA:** This is my lens. I ground it for twenty florins and no questions. This is how your sword was made. Ask me anything. I'm done not answering.
- **The verdicts.** The guild fines her. The city forgives her, slowly.
- **The art.** It goes to the Signoria, to hang where anyone can see it.
- **Ottaviano** is exiled to Venice at Lente's request. He sends one letter a year, unsigned, smelling of resin.
- **Title:** *Keeper of the Open Window.*

### B. The Painted Wall

**OTTAVIANO:** *(after a long moment)* Go? Just… go? *(He searches Lente's face.)* You mean it. You'd let all this sail, for her sake. To keep her name out of my book.
*(He pulls a ledger from his coat, tears out one page, the lens, and holds it in the lantern flame until it's ash. The rest he keeps.)*
**OTTAVIANO:** There. Your master never ground anything but spectacles. *(The sluice rises. The barge slides over the lip.)* Florence will never know how its miracles were made. Everyone will remember them their own way. That's the most beautiful lie of all, and you wrote it.

**Epilogue (B).**
- **The art.** It survives, in Venice, in Rome, in a French king's château, under other names.
- **The city** argues for forty years about the sword and the lion.
- **Smeralda** paints over the false wall, plain white, and never mentions it again. The Bottega prospers.
- **Some nights**, Lente finds her standing on the eye-stone, looking at a wall that's only a wall now.
- **Title:** *Painter of Walls.*

### C. Ashes on the Arno

**OTTAVIANO:** *(if A failed: "With what? Your word against mine?")* *(Otherwise:)* Drop it? *(He smiles.)* Make me.
*(A struggle on the crates: a strike, a slip. The lantern falls. The oil goes up in a sheet of blue and orange. The Angels jump. The barge burns in the lock like a second pyramid.)*
- **A last rescue.** A 15-second sequence: Ottaviano is in the water by the sluice. **Strike** the rope that's dragging him under, then haul him to the weir step. He lives, coughing ash. Most of the crates don't.
- **What you can save.** One crate can be dragged off the deck (interact) before the cabin collapses. It's always the one marked **114**, Botticelli's Venus: the original Lente carried to San Felice in Ch 5.

**Epilogue (C).**
- **Ottaviano's trial.** He is condemned. At it, his ledger names Smeralda's lens.
- **The Bottega.** The guild closes it, and Smeralda leaves Florence for Venice, where nobody knows her.
- **The Veil** still opens for Lente, onto a shuttered loft: dust, the false wall, a note pinned to it. *"Festina lente. I made haste. — S."*
- **Title:** *The Incorruptible.* In the friar's city, certainty always burns something.

### D. Festina Lente (secret)

**Conditions:** `fi.c1.answer = honest`, all 24 Leaves, Masino comes home, and `fi.c8.bartolo = escaped`.

**OTTAVIANO:** *(waiting; then, into the silence)* Nothing? No speech? No threat? *(Pause.)* You're the first person in this city who hasn't tried to *move* me.
**OTTAVIANO:** *(sitting down on the crates, the lantern on his knee)* Do you know what I wanted? Not Venice. Not money. I wanted one thing I couldn't explain. Fifty years of machines, and I've never seen a miracle I didn't know the rope for.
**SMERALDA** *(stepping onto the weir step; she has walked the whole river)*: Then come and see one. No rope. No glass. I'll show you a window that opens, Ottaviano. A real one. And you'll put that lantern out first.
*(Long pause. He snuffs the lantern with his fingers.)*

**Epilogue (D).**
- **The Veil.** Smeralda takes Ottaviano up to the loft, takes down the painted wall, and stands him in front of the Veil. Through it, Junction's lights shine: a strange city of portals, under a ringed planet.
- **Ottaviano weeps** like a boy on a rope.
- **The confession.** The next month, the illusionist and the lens-maker stage a public show in the Piazza called *How the Miracles Were Made*. Ottaviano works every machine himself and names every rope. The art goes back to the city, piece by piece, as the show's finale.
- **The loft** becomes a little theatre for one: the Veil, a bench, a lamp.
- **Title:** *Festina Lente.*

---

## Epilogue: dawn, 23 May (all endings)

*(The Ponte Vecchio. Landucci is sitting on a butcher's step with his notebook. Smoke rises over the Piazza beyond the roofs. A cart comes onto the bridge, and men empty sacks of ash into the river. Nobody speaks. The Arno takes it.)*

**LANDUCCI:** I wrote it down. All of it. *(He closes the book.)* Six years I've written everything that happened. And I've just realised I don't know what any of it meant. *(Beat.)* Maybe that's not my job. Maybe I'm just the one who counts.

**Epilogue cards** (one per flag, shown as `w.say` cards):
- **Masino**
  - *home:* Masino sweeps the Bottega again, and is learning to grind lenses, badly. He says a friar told him to learn a trade with his hands. (If `lute`: he plays the saved lute every evening on the altana, worse than Bonaccorso, and nobody minds.)
  - *stayed:* Masino took the habit at San Marco. He writes once a year and signs "Fra Tommaso", with, underneath, small, "Masino".
- **Bartolo**
  - *escaped:* Bartolo lives in Bologna and grumbles about other people's trees. In 1512 the Medici return to Florence, and he walks home behind them, very slowly.
  - *hidden:* He stays in the loft a year, repaints the false wall twice, then goes back to the San Marco garden, which nobody owns now, and plants it.
  - *taken:* Bartolo spends four years in the Stinche prison. When he comes out, he asks only whether the orange trees survived.
- **The bell**
  - *rang:* In June the Piagnona is whipped through the streets and exiled from the city. Landucci tries to count the dead of Palm Sunday, and can't.
  - *silenced:* In June the Piagnona is whipped through the streets and exiled. Landucci writes that it fell silent before midnight, and that he doesn't know why, and that he is grateful.
- **Machiavelli:** On 19 June Niccolò Machiavelli is elected Second Chancellor of the Republic. He keeps a small nine-stave pinion on his desk, and never says where he got it.
- **Botticelli**
  - *If A or D:* Botticelli sees his Venus hanging in the Palace hall (and, if you saved her, *La Bella* beside it) and stands before them for an hour. Then he goes home and paints angels dancing in a ring.
  - *Otherwise:* Botticelli tells his brother he burned the Venus himself, long ago, in his head.
- **Michelangelo:** In Rome, a young sculptor with a broken nose signs a contract for a Pietà.
- **The Seal of Nero** (if in the Gallery): it sits in the Gallery of Saved Things, Apollo still flaying Marsyas, warm from your hand.

**Back in the Bottega** (ending A, B or D). Smeralda, at the bench, holds a new lens to the window.
> **SMERALDA:** Do you know what Uccello's clock says, Lente? It says the day ends at sunset. Everybody thinks that's sad. *(She hands Lente the lens.)* It also means the new one has already started. Go on. Show me what you can see.

*(Final banner: THE DAY BEGINS AT SUNSET. The ending title. The Wall of Titles in the study gains the ending's plaque.)*

---

## Learns and earns

**Earns** (soulbound):
- **Ending title** (one of four).
- **Cosmetic:** *Florentine Berretta* (head), a red citizen's cap, for finishing the story.
- **Ending A:** *The Open Window* frame, a Gallery item. **Ending B:** *Painted Wall* panel. **Ending C:** *Charred Ledger*. **Ending D:** *Smeralda's Lens*, a hand-slot cosmetic that glints.
- A `fi-river-chase` record.

**Playtime:** 45–60 minutes.
