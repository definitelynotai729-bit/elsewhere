# The Chart Room (frame world)

*World `dh-chartroom` · Havana, 1760 · the campaign hub · 2–3 minutes on a first visit*

Junction's portal **THE DROWNED HOURS** leads here. Don Lázaro Quintana (Lalo, now 57) keeps this study. It frames the story, hosts chapter select, the codex, the memorial and the rewards case, and it changes with the ending the player reaches.

## Layout

Axes: x is east, z is south, y is up. The room is 14 × 10 m with a 5 m ceiling and its floor at y = 0. Plaster walls, planked floor, beams overhead.

| Thing | Position (m) | Size / notes |
|---|---|---|
| Spawn | (0, 0, 3.4), yaw 180 (facing the chart) | The door to Junction is behind the player. |
| Door to Junction (portal) | (0, 0, 4.9), yaw 0 | A plank door with a brass ring; `w.portal({ to: 'hub', label: 'Junction' })`. |
| Chart table | centre (0, 0, 0) | 3.2 × 2 m top at 0.95 m. A painted Caribbean; finished chapters show as brass pins with labels. Interact radius 2.4. |
| Don Lázaro (NPC) | (-2.3, 0, -0.5), yaw 60 | Grey coat, spectacles, a quill. `hat: 'tophat'` until a period hat model exists. |
| The great chart (entrance to the story) | north wall, centre (0, 2.5, -4.85) | 6 × 3 m frame. The glass is a water sheet (opacity 0.7, glow 0.4, a gentle wobble in `frame`). A 4 × 2 × 1 m zone in front of it sends the player to the current chapter. |
| Book of the Drowned | lectern at (5.2, 0, -2.6) | Shows the count of names restored by Lost Things. |
| Notebooks (codex) | shelf on the west wall, (-6.6, 1.4, 1) | Opens the codex panel (BUILD feature 5), or falls back to `w.say` pages. |
| Rewards case | (-5.2, 0, -2.6) | A glass case. Earned cosmetics appear inside as `w.model` copies of their looks. |
| Window | east wall, x = 7, z -1 to 3, sill at 1 m | Sunset over Havana harbour: a painted backdrop, the Morro silhouette and ship models 200 m out (`dutch_ship_medium`, `ship_pinnace`). |
| Ending objects | Lalo's bench (3.5, 0, 2.5) and the wall above it | Chosen by `dh.ending` (below). |

**Lighting.** Sunset sky (`sky: 'sunset-sky'`, `skyBackdrop: false`), two warm point lights and a brass lantern on the table. **Music:** root 50, dorian, 60 bpm, sparkle 0.2.

## Logic

- **First visit** (`!dh.met.lalo`): Lalo's welcome (below), then the objective "Step into the great chart."
- **The great chart** sends the player to `dh-01-havana` the first time. Later it sends them to the first chapter without a `dh.ch.N` done flag. After Chapter 10 it opens the chapter select instead.
- **Chart table:** chapter select with two modes (below). **Tell it differently** clears every `dh.*` flag the chosen chapter and later chapters set (each chapter's file lists its flags), then travels there.
- **Ending objects:** `open` puts a half-built brass clock on the bench and a drawer of letters. `crown` puts a framed royal commission beside an empty gimballed cradle. `admiralty` hangs a framed letter. `drowned` puts a coral-crusted winding key under a bell jar.

## Dialogue

**Don Lázaro, first visit**
- "Ah. There you are. Come in, out of the... well. Out of wherever you were."
- "You don't know me yet. I was twelve, and I was about to fish you out of the harbour."
- "Lázaro Quintana. In this room it is 1760, and I make charts of Havana for people who would rather not drown."
- "Through that chart, the one with the wet glass, it is July of 1715. The summer before the storm."
- "Everyone I loved that year is in there. Some of them are still alive in there."

> **Ask (Don Lázaro):** "Will you go?"
> 1. "Who are you, really?" → "A boy who drew whales the size of Seville on maps of places he had never seen. You cured me of that. Well, you and a hurricane." *(The question repeats.)*
> 2. "What happens in 1715?" → "A fleet sails, and a casket sails with it. A woman who watched the sea taught me the difference between where you are and where you wish you were." / "I won't spoil the rest. I'm old, not cruel." *(The question repeats.)*
> 3. "Take me there." → "Walk into the water. Mind your head on the frame. I never do." *Sets `dh.met.lalo`.*

**Don Lázaro, return visits.** One line, chosen by the latest finished chapter:
- After 1: "You met her. Everyone talks about her temper. Nobody talks about her hands, the steadiest in the Indies."
- After 2: "I was in the cacao sacks. I thought I was so clever. I smelled of chocolate until Christmas."
- After 3: "I still can't hear rain on a roof without counting the seconds between the lightning and the thunder."
- After 4: "Benito the gunner's mate told that story about the box riding like a duck until he died in 1751. He always got the duck right."
- After 5: "Forty breaths. I managed nineteen. Tito managed sixty and never let me forget it."
- After 6, by `dh.raid`. Alarm: "You rang that bell as if you meant to wake Seville." Boats: "Rufina rowed like the sea owed her money. It did." Parley: "You walked through a burning camp with a white rag on a stick. I have never been so frightened, and I was holding the stick."
- After 7: "Nassau. I bought a knife I was too scared to use and a hat that was too big. Sunday made me give back the knife."
- After 8: "She was alive. I knew she would be. I had drawn her alive on every map that winter."
- After 9: "The Heart. Tamsin wound it every morning for seven months. Some faith looks exactly like stubbornness."
- After 10, by `dh.ending`:
  - Open: "Thirty letters, three answers. She said that was a good rate. Look at my bench: I'm still trying to build a copy that works. Forty-four years. I'm close."
  - Crown: "Cosmógrafa. They gave her the title and took the clock. She wore the title to dinner every night anyway."
  - Admiralty: "Twenty thousand pounds, payable when the Board convenes. I had the letter framed. It makes a very expensive joke."
  - Drowned: "Some nights at slack water I swear I can hear it. It can't still be ticking. I go and listen anyway."
- Then the last line, by `dh.origin` (only after Chapter 10):
  - elsewhere: "You said you came from a place where every road meets. I believed you. I still do. Go home, Pilot."
  - forgot: "You never did remember where you came from. I think you decided it didn't matter. Go home, Pilot."
  - ship: "You said you came off a big ship. You never said which. Go home, Pilot, whichever one it is."

**Chart table**
> **Ask (The chart table):** "Which hour shall we remember?" Options: every finished chapter by title, then "Not now".
> **Ask (Don Lázaro):** "As it was, or differently?"
> 1. "Remember it as it was." → "Then let's be exact about it. She'd insist."
> 2. "Tell it differently." → **Ask (Don Lázaro):** "Then everything after that day goes unwritten again. Your later choices will be forgotten. Are you sure?" → 1. "Unwrite it." → "Hm. I've redrawn worse coasts." / 2. "Keep it." → "Wise. Ink is hard to take back."
> 3. "Never mind."

**Book of the Drowned (lectern).** It reads "Names given back their faces: N of 24."
- "Anselmo wrote down a thousand names. Some he knew only as numbers."
- "Every lost thing you brought him gave one of them a face again."
- With all 24: "Every face we could find. He'd want me to say that's not all of them. It isn't. It's what we could do."

**Rewards case.** "What you carried home. I dust it on Sundays. Mostly I just look at it."
