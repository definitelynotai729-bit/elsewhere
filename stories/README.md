# Story campaigns

Four single-player campaigns for Elsewhere, each reached from Junction through one portal. They were written on 2026-11-22 at the owner's request ("several full, massive, well-thought single-player stories").

Each folder holds:
- `README.md`: the story bible (cast, plot, choices and endings, an originality self-audit);
- `chapters/`: one file per chapter, with a buildable layout in metres, puzzles with their solutions, and every line of dialogue;
- `BUILD.md`: the World API features each chapter uses, the new engine features it needs, and a plan for building Chapter 1 first.

| Campaign | Setting | Chapters | Words | The hook |
|---|---|---|---|---|
| [The Long Light](space-opera/README.md) | An original space opera | 10 | 37k | A galaxy whose rulers edit what everyone remembers, and you are the one person their record can't see. The hub is the mail ship *Rumour*. |
| [The Day Begins at Sunset](renaissance/README.md) | Florence, 1494–1498 | 11 | 40k | A lens-maker's apprentice works out who is staging the city's miracles, through revolution, sermons and the Bonfire of the Vanities. |
| [The Drowned Hours](age-of-sail/README.md) | Havana and the Caribbean, 1715 | 10 + hub | 40k | A hurricane sinks the treasure fleet, and the race is on for a casket holding the clock that solves longitude. |
| [The Last Summer of Bronze](bronze-age/README.md) | The Bronze Age Aegean of myth | 10 | 39k | Greeted as a god in disguise, you find the oracle silent, the mountain smoking, and a palace that keeps its strangers. |

## Rules they share

- **Original.** No names, characters or plots from existing franchises. Each bible ends with a self-audit, and each was scanned for franchise terms before it was added here. Real history and public-domain myth are used freely.
- **Verifiable.** Branching choices are recorded inputs, so every playthrough replays like any other run.
- **Nothing to farm.** Rewards are soulbound: titles, keepsake cosmetics and codex entries. Story collectibles pay no coins.

## What the engine needs first

All four agree on the order:
1. **Campaign grouping.** A registry flag keeps chapter worlds out of Junction's portal ring, leaving one portal per campaign, plus chapter gating.
2. **Soulbound story rewards.** A `bound` item flag, titles, and a codex panel.
3. **Characters that move.** NPCs that walk paths, follow, hide and appear; one campaign needs a 30 m giant.
4. **Enemy support.** Line of sight (`w.raycast`), and meters for boss health and breath. Basic combat already exists (`w.enemy`).
5. **Staging.** Camera beats (purely visual), and time of day changing within a world.

The Chapter 1 of *The Long Light* and of *The Last Summer of Bronze* can be built with today's API.

**Built so far:** *The Last Summer of Bronze*:

- Chapter 1 (2026-11-23): `src/worlds/thyra.js`, world `lsb-thyra`.
- Chapter 2, *The Low Wings* (2026-11-24): `src/worlds/pterousa.js`, world `lsb-pterousa`.

Junction's Bronze portal opens on the latest chapter, and F at its foot picks any earlier one. How each chapter differs from its text is at the end of [the story's BUILD.md](bronze-age/BUILD.md).
