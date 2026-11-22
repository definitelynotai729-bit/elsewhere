# Chapter 10: The True Light

*World `dh-10-light` · the same night, a norther, then dawn · Act III, finale · 30 minutes*

**In short:** The player climbs an unfinished lighthouse in a gale, hauls up twenty-four candles and decides who the light is for. Then a duel on the gallery, and at dawn the last choice: who keeps the hour. Inés calls the player "Pilot" for the first time.

## Locations and layout

This chapter reuses Chapter 9's island geometry and axes, at night in a norther. Wind blows from the north (+z), with rain particles. The sea box is darker and the breakers bigger (taller foam rings on the reef). Lightning-free gusts run on a fixed schedule: 7 m/s for 2 s in every 6, and on the gallery 10 m/s.

| Area | Where | Notes |
|---|---|---|
| Tower foot | (−90, 3, −95) | The **capstan** for the chandelier rope (radius 2). The door to the interior stair. |
| Interior stair | spiralling inside the octagon from 3 to 25 | Ramps of 1.2 m, eleven landings, three missing-step gaps of 2–3 m, one crumbling landing at 14, and gust holes (wind zones) at 9 and 19. |
| Exterior scaffold | north face | The attackers' route. Wraxall climbs it for the duel. |
| **Lantern gallery** | ring at 25, inner radius 1.2, outer 2.8 | Rail with a 2 m gap on the north side. Six **candle sconces** on the inner ring. The chandelier hangs at the centre once it's hauled up. The casket rests here (Inés insists). |
| East reef wreck | the graveyard fluyt's mast, top at (120, 12, −40) | For the false light. A causeway of reef heads (jump path, 60 m) runs from the north rock at low water. |
| Beach and channel | as in Chapter 9 | Where Wraxall's boats land, and where the *Small Mercy* runs in if she comes. |
| The Throat | as in Chapter 9 | For the Drowned Hour. |
| **The meridian line** | appears at dawn on the beach, x −30, z −60 to 60 | A glowing north–south line of light in the sand, the way home. It ends at a portal to `dh-chartroom`. |

**Theme.** Night uses a painted dark sky with fog 20–160. When the true light is lit, a strong warm point light (intensity 200, distance 80) sits at the gallery and a beam cone sweeps the sea (visual, rotating in `frame`). Dawn uses `sunset-sky` rotated east. Music: root 50, minor, 100 bpm with `pulse` for the fight, then at dawn root 57, lydian, 66 bpm with sparkle 0.4.

**Timing by flags.** If `dh.gave` and not `dh.chart`, Wraxall's landing party is already on the beach when the chapter starts, so wave 1 arrives at the tower while the player is at the capstan. Otherwise the player gets a 90 s quiet window first.

## Objectives and critical path

1. Walk the capstan to haul the chandelier up (4 turns).
2. Climb the interior stair to the gallery.
3. **The choice of light** (asked at the gallery):
   - **True:** light the six sconces in a ring run. All six must be lit within 12 s or the wind snuffs the earliest. Recorded as `lamp`.
   - **False:** take the lamp down, cross the reef causeway to the fluyt's mast, climb it (a climb volume) and hang the lamp there. Then return to the tower.
4. Defend the tower (2 or 3 waves, adjusted by allies; table below).
5. The duel with Wraxall on the gallery. Then the mercy choice.
6. Dawn: the casket is opened and the final choice made (with the crew vote if the articles were signed).
7. The ending scene. Walk the meridian line home.

## Optional areas

Nothing optional distracts during the battle; the ring run's record is there for replays. At dawn the gallery is free to walk, with its view of the lit (or wrecked) reef. After the ending scene the island stays open: the player can walk it as long as they like before taking the meridian line home.

## The defence

| Situation | Effect |
|---|---|
| Base | 3 waves of 3 raiders up the stair and scaffold. A swivel gun in their boat fires grape at the tower foot every 8 s: a telegraphed hazard strip. |
| `dh.oakes = 'saved'` | Oakes warns the player, and the swivel gun never fires ("I spiked her myself before I went over. Habit."). |
| `dh.light = 'true'` and `dh.fenwick = 'freed'` | **The *Small Mercy* runs the channel by the light.** Fenwick's party lands behind wave 2, and wave 3 yields without fighting. |
| `dh.light = 'false'` | The *Restitution* steers for the false light and grounds on the east reef (a shake, a grinding roar and her masts leaning). Only 2 waves come, since half her men are wading in the surf, and the island has to pull them out at dawn. |
| `dh.articles = 'signed'` | Four crew hold the stair with the player, so each wave has one raider fewer. |
| `dh.articles = 'hornigold'` | Hornigold's sloop stands off: "English colours. I said I wouldn't." No crew help. |
| Rufina and Tito (every path) | Before the last wave they cut Wraxall's boats adrift ("Your boats are going home without you, Englishmen!"), and the last raiders yield. |

Defeated raiders yield ("Quarter!"). Lalo relights the gallery candles if they gutter (flavour).

## The duel

Wraxall is a boss foe with 300 HP. He telegraphs a 0.5 s lunge that reaches 3 m, and his strike costs 2 Grit. The gallery's gusts push towards the rail gap. Each time he loses a third of his HP he steps back and speaks a line. At 0 HP he staggers back through the rail gap and catches the edge with one hand. The player is frozen and his avatar is posed hanging.

> **Ask (Wraxall):** *(hanging, perfectly calm)* "Well. Let us be exact about this, too."
> 1. "Take my hand." → `dh.wraxallfate = 'saved'`
> 2. "Let go." → `dh.wraxallfate = 'fell'`

## Encounters and set pieces

- **Hauling twenty-four candles up a tower in a gale**, by walking circles in the rain.
- **The ring of light,** six candles lit in one breath before the wind takes them, and the beam swinging out over the reef.
- **The ship on the reef** (false light): the *Restitution*'s lantern swinging towards the wrong light, then the sound of her striking.
- **The *Small Mercy* running the channel** by a light the player lit for everybody.
- **The duel** on a 25 m ring in a norther.
- **Dawn on the gallery.** The casket opened, the Swallow's twin balances rocking against each other, and the final choice.

## Collectibles and codex

**Codex** (all unlocked at the chapter's end):
- *The Board of Longitude:* created by the 1714 Act. Its commissioners didn't meet until 1737.
- *The Casa de Contratación:* Spain's house of trade and navigation. It kept the master chart (the Padrón Real) secret, and moved from Seville to Cádiz in 1717.
- *The Pardon of 1717–18:* a royal pardon for pirates. Woodes Rogers brought it to Nassau in 1718. Hornigold and Jennings accepted it.
- *John Harrison:* a Lincolnshire carpenter whose sea clock H1 (1735) began the work that solved longitude at sea. The Swallow is fiction, and his clocks were real.

## Dialogue

### The capstan

**Tamsin** (at the tower door, the splinted wrist tucked in her apron): "The chandelier's on the rope. Twenty-four candles, same as Jory's Eddystone. Walk the capstan, my bird. Round and round. That's all a lighthouse ever is."
**Sunday:** "Twenty men in three boats. You light it, we hold the stair."
*If Wraxall's men are already ashore:* **Sunday:** "No time. Walk and fight. Both."

### At the gallery: the choice of light

**Inés** (with the casket, which she has carried up herself, at some cost): "She stays where I can see her."
**Lalo:** "Light it! Light it light it light it!"
*Hailed up from the foot of the tower:*
**Fenwick** (if present; any `dh.fenwick` except reported): "Counsel! A thought, whereas it's dark and they're English and the reef is hungry: there's a wreck mast on the east reef. Hang the lamp there, and he'll steer for it, thinking it's the tower, and put his sloop on the rocks. I'm only mentioning it."
**Tamsin:** "Over my dead body and Jory's! He built this for honest folk! Wreckers show false lights!"

> **Ask (Tamsin):** "Where does the light go?"
> 1. "In the tower. A true light, for everyone." → `dh.light = 'true'` → **Tamsin:** "Proper job." *(The ring run follows.)*
> 2. "On the wreck's mast. Let him steer by it." → `dh.light = 'false'` → **Tamsin:** "Then you're no better than a Bermudian. Go on, do it. I'll not watch." / **Inés:** "Flotsam. There are men aboard her who've never done anything but take his wages." *(The causeway run follows.)*

*True, on lighting:* **Lalo:** "It's lit! LOOK at it! The whole reef!" / **Tamsin** *(very quietly)*: "There, Jory. Finished. Lit."
*True, if the* Small Mercy *comes:* **Fenwick** (as she runs the channel): "Whereas you lit the way, and notwithstanding that it was frankly a stupid thing to do in a battle, here we are!"
*False, as the* Restitution *strikes:* **Sunday:** "She's on the reef. Men in the water." *(a long pause)* "We'll pull them out at dawn. All of them."

### The duel

**Wraxall** (stepping off the scaffold onto the gallery, his sword out, rain on his coat): "My friend from nowhere. Let us be exact. Give me the box."

> **Ask (Wraxall):** "Well?"
> 1. "Come and take it." → **Wraxall:** "I intend to."
> 2. "Two thousand drowned men wouldn't want this." → **Wraxall:** "Don't speak for them. You weren't on the rock."
> 3. "Inés, stay back." → **Inés:** "I am fifty-four years old, and I have never once stayed back."

*At 2/3 HP:* **Wraxall:** "Correction: two points to starboard." *(He circles.)*
*At 1/3 HP:* **Wraxall:** "You fight like her. All arithmetic and no manners."

*After the mercy choice:*
- **Saved:** *(on his back on the gallery)* **Wraxall:** "Why?" →

> **Ask (Wraxall):** "Why?"
> 1. "Because the sea's had enough of us." → **Wraxall** *(after a long time)*: "Yes. It has."
> 2. "Because nobody held out a hand to you on that rock." → **Wraxall:** "No. Nobody did." *(He doesn't get up for a while.)*

- **Fell:** *A gust, a splash far below, and only the sea.* **Inés:** "The sea will keep him or let him go. It doesn't tell anyone which." *(Lalo looks away.)*

### Dawn: the casket

*Banner: "Dawn". The norther has blown out. Gold light. Everyone on the gallery: Inés, Lalo, Tamsin, Rufina, Tito, and Sunday and Fenwick if present, Oakes if saved, Wraxall if saved, Hornigold's mate if on that path.*
**Inés** (unbuckling the cork jacket and lifting the lid for the first time since Havana): "Look."
*The Swallow: brass, the size of a hatbox. Two balances rock against each other like a pair of hands clapping very slowly, and twelve red points glint in the plates. Beside her lies the proving log, wrapped in oilcloth.*
**Lalo:** "The rubies! They're tiny! They're holding it up!"
**Inés:** "Every ruby on this ship holds up something that matters. That's the only kind I'd give a Queen."
*If `dh.saved = 'journal'`, Inés gives the player her journal's last page:* "I wrote this in Havana in a frightened hour. Frightened hours are honest." The page reads: "If I'm lost: let no king own her. Let her belong to whoever has been lost at sea, which is everyone, eventually."
**Inés:** "Ten years ago I'd have said the King, for my father's title. A month ago I'd have said Mateo, as if he could use it. Tonight…" *(She shakes her head.)* "It isn't mine to give any more. You found her. Tamsin kept her heart going. Rufina carried her out of the Lusca's mouth. Lázaro drew her."
**Inés:** "You choose, **Pilot**."
*(The first time anyone calls the player Pilot. The title **Pilot of No Flag** is granted here.)*

**Voices before the choice** (each shown if its condition holds):
- **Tamsin:** "Whatever you do, my bird, I'll light this tower every night. That's my answer to most things."
- **Rufina**, `bound`: "Salmón's word. The box goes to the King, my brother goes free. I'm not asking you. I'm telling you what it costs."
- **Rufina**, otherwise: "Give her to whoever won't put a lock on her. I've seen enough locks."
- **Sunday**, signed: "Article six: what we take, we take together. Speak, and we'll vote."
- **Wraxall**, saved: "Give her to London. I'll carry her myself, and they'll have to listen now. Or don't. I find I'm too tired to insist."
- **Oakes**, saved and Wraxall fell: "His backers would pay. I'll carry her, if that's your choice. I'll not steal her if it isn't."
- **Hornigold's mate**, on that path: "The captain says if it's a clock, he don't want it. He knows exactly where he is: in trouble."
- **Lalo:** "Can I draw her first? Before she goes wherever she goes?"

> **Ask (Inés):** "Who keeps the hour?"
> 1. "Everyone. Copy her, and send the copies to every port." → `dh.ending = 'open'`
> 2. "The King. Send her to Havana." *(only if `dh.saved = 'book'`, `dh.salmon = 'truth'` or `dh.safeconduct`)* → `dh.ending = 'crown'`
> 3. "London. Let the Board pay what it promised." → `dh.ending = 'admiralty'`
> 4. "No one. Give her back to the Throat." → `dh.ending = 'drowned'`

**The crew vote** (only if `dh.articles = 'signed'` and the choice isn't 3):
**Sunday:** "The navigator proposes. Hands." *(Hands go up in the dawn.)*
- With `dh.votes` of 3 or more: **Sunday:** "The company stands with the navigator." *(The ending stands.)*
- With fewer: **Sunday:** "The company votes to sell her to the highest bidder. That is article six. I'm sorry, Pilot."

> **Ask (Sunday):** "Will you abide by it?"
> 1. "I signed. I'll abide." → `dh.ending = 'admiralty'`
> 2. *(Take the casket and run for the Throat.)* → **Sunday** *(not moving)*: "Article one says nothing about stopping you." *A run from the tower to the Throat rim (200 m), arriving at slack, where she goes in.* → `dh.ending = 'drowned'`

### The endings

The scene on the gallery or the Throat's rim plays below. Old Lalo's epilogue in the Chart Room then uses the variables listed in README.md (*Endings*).

**Every Ship's Hour** (`open`)
**Inés:** "Then we copy her, every wheel, every stone, every number in the log. Lázaro draws. Tamsin has paper?"
**Tamsin:** "I've got Jory's whole Eddystone drawings and the backs of them."
**Inés:** "Thirty letters, to every academy, guild and harbourmaster who can read, under every flag, and one to the sailors of any flag, or none."
**Inés:** "Most of them won't answer. Some will. That's a good rate."
*Title **Keeper of the Open Hour**; cosmetic Swallow Brooch.*

**The King's Hour** (`crown`)
**Inés:** "Then she goes home to Seville, and I go with her, and I'll make them write my name above my father's."
**Rufina** (`bound`): "And Salmón pays my brother's price, every peso." *(to the player)* "Thank you. I'd have thanked you whatever you chose. Probably."
**Inés** *(lower)*: "They'll lock her in a room. Spain locks up everything it loves. Well. At least she'll be loved."
*Title **Pilot of the Casa**; cosmetic Casa Sash.*

**The Promised Hour** (`admiralty`)
**Wraxall** (saved) or **Oakes**: "London, then. Twenty thousand pounds, payable when the Board convenes."
**Inés:** "When does the Board convene?"
**Wraxall** *(after a pause)*: "It hasn't yet."
**Inés:** "Then I wish you a long life, Mr Wraxall."
*(If Wraxall fell, Oakes carries her and the exchange is Oakes's: "When does the Board meet?" / "Nobody's ever said, missus.")*
*Title **Twenty-Thousand-Pound Promise**; cosmetic Unawarded Medal.*

**The Drowned Hour** (`drowned`)
*At the Throat's rim at slack, the casket goes down still ticking, a ring of glass closing over it.*
**Inés** (by `dh.promise`): promised: "You promised me." *(She says nothing more until noon, and then only that the sun is where it should be.)* / right: "You did what you thought right. I'd have done otherwise. One of us is wrong." / hush: "Perhaps the sea was owed one thing it didn't have to steal."
**Tamsin:** "I'll still go down and wind her, you know. Every morning. Until she's stopped, or I have."
*Title **Keeper of the Drowned Hour**; cosmetic Lusca's Ring.*

### Home

*A line of light appears in the sand, running exactly north and south.*
**Inés:** "A meridian. Every one of them meets at the pole, where all roads meet. Is that where you're from, Pilot?"
*(If `dh.origin = 'elsewhere'`:* **Inés:** "Lázaro told me what you said, in his skiff. I didn't believe him. I'm a scientist. I believe it now.")
**Lalo:** "Will you come back?"

> **Ask (Lalo):** "Will you?"
> 1. "Always." → **Lalo:** "I'll be older. Don't laugh at my coat."
> 2. "Draw me on a map, and I'll be there." → **Lalo:** "In the right place. With no whale."

*Walking the line ends at the portal. `dh.ch.10 = 'done'`. Travel to `dh-chartroom` for old Lalo's epilogue.*

## What the player learns and earns

- **Learns:** what the hour cost, who kept it alive, and what the player decides it's for.
- **Earns:** the title **Pilot of No Flag** and one ending's title and cosmetic, the record `lamp`, and 4 codex entries.
- **Flags:** `dh.light`, `dh.wraxallfate`, `dh.ending`, `dh.ch.10`.

## Hook (for replays)

Three other endings, and a chart table in 1760 where any hour can be told differently.
