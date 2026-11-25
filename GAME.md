# Elsewhere: the game

The owner's brief (2026-11-22): "a full 'ready-player-one' game with realistic graphics, … crypto / user ownership where it makes sense." This file is the spine that turns a set of worlds into one game.

It is original. It draws on the *idea* of a universe of worlds with a hidden quest running through it, and on none of the book's names, characters, quest or plot.

## The premise

Elsewhere was built by someone remembered only as **the Founder**. They opened the first portals, set the Vault at the heart of Junction, and left. They never said why, or where they went.

Before leaving, they hid their voice in the worlds: the **Founder's Echoes**. Each Echo is a few seconds of the Founder speaking and a riddle that points to the next. Follow them all and the Vault can be tuned to the one world the Founder never opened: **the Origin**.

## The shape

| Act | What happens | Status |
|---|---|---|
| **Prologue: the Vault** | Find three sigils (Skyreach, Glowcave, Neon Circuit), open the Vault, claim the **Founder's Crown**. | Built |
| **Act I: the Echoes** | Inside the Vault, the Echo Stone plays the Founder's message and the first riddle. Five Echoes, each a different kind of challenge, each giving the riddle for the next: a glide under Skyreach's Cloud Garden (I), a reflection walk across Glowcave's Mirror Lake (II), the Founder's lap record on Neon Circuit (III), twenty-five crystals in Crystal Rush (IV), a won battle in Spire Clash (V). | Built |
| **Act II: the Tuning** | Play the five Echoes to the Echo Stone in the order the Founder lost them: their life, told across their five lines (a child, a racer, a dreamer, a hider, the goodbye). Each Echo has its own note, so the right order is a tune; wrong orders earn clearer hints. | Built |
| **Act III: the Origin** | A portal opens in the Vault to the Origin: the Founder's unfinished first world, a white blueprint on a night-blue sky. Four stretches (a climb, a glide over the void, guardians, a bridge seen only in the water below) each paint themselves in colour. At the top is the Founder's study and their last letter, which gives the Founder's Mantle. The run from the plateau to the letter is a speedrun on the boards. | Built |

### The crown is a detector

Wear the Founder's Crown and you can sense Echoes. A signal in the corner of the screen grows stronger as you get closer to one you haven't found in the world you're in. It gives the hunt its hot-and-cold feel and makes the crown more than a trophy.

### Echoes stay silent until the hunt begins

An Echo can be stumbled on early, but it stays a dim, silent orb until the Echo Stone has woken the hunt. Explorers who find one first know where to come back to.

## Verified firsts

Every visit is already a replayable proof, so the ledger can say, forever and checkably, **who found each Echo first**.
- The boards list the first finders.
- The ledger's head is timestamped in Bitcoin.

This is where verification is natural in a game: a hunt with stakes needs a record nobody can rewrite.

## Ownership, where it is natural

- Everything the hunt gives is soulbound (the Echoes, titles), so no bot farm has anything to sell.
- **The first player into the Origin** will get a one-of-one cosmetic that they genuinely own and may trade: a tradable edition (ECONOMY.md, E1). There is exactly one, so there is nothing to farm.

## Seasons

The hunt is meant to repeat. Each season, the Founder (that is, the game) leaves a new trail of Echoes. They run through new worlds as they arrive, including the four story campaigns (`stories/`), and each season has its own verified first finders.

### Season 1: Before the Door (2026-11-24, built)

Where the Founder came from. Underfoot's crayon drawings hint at it: someone drew the worlds before there were any.

- **The start:** a child's crayon drawing of a door, pinned inside the Vault. It starts the season for anyone whose hunt has begun (the Echo Stone woken). Junction's goal line follows Season 1 once the first hunt is done; until then it stays on the first hunt's next Echo.
- **Five Echoes, VI to X.** Each gives the riddle for the next:
  - **VI, Underfoot:** in the shoebox of drawings on top of the wardrobe (the paper plane, and the vent's warm air).
  - **VII, Thyra:** in the smoke over the Stranger's Hearth, on its roof.
  - **VIII, Pterousa:** on Gull Pillar's top, beside Old Horn (the Low Wings, and the pillar's updraft).
  - **IX, Halcyon Point:** over Kiko's sandcastle of the Giant. It wakes once you have made the wave.
  - **X, Underfoot:** the crayon door on the west wall, 30 m up. It wakes once VI to IX are yours, and the way there is a glide all the way across the room, onto the shelf under the door.
- **The reward:** the Paper Crown (the crown a child folds out of a drawing), and the crayon door glows.
- **Verified firsts:** the boards list the first finders of Echoes VI to X and the Paper Crown beside the first season's.
- **Where it lives:**
  - The Echoes are ordinary `w.echo`s (ids 6 to 10), hidden until the flag `s1.started` (and their feat).
  - Junction defines their items and the crown.
  - The season's flags are `s1.started` and `s1.complete`.
  - No engine change.

## Everything else the game needs

- **Worlds of different kinds.** Platforming (Skyreach), exploration (Glowcave), racing (Neon Circuit), score attack (Crystal Rush), arena battles (Spire Clash), a holiday sport (Halcyon Point's wave) and an explorer level at the size of a toy (Underfoot). The story campaigns are "far worlds" (two chapters built), and community levels come from the Builder.
- **Combat.** `w.enemy` foes and hearts. Each world will use it where it fits.
- **A living hub.** Junction is where players meet, shop, practise (dummies and the slime pen), check the boards and start the hunt.
- **One look: bright, chunky low-poly** (ART.md, the owner's call on 2026-11-22: "pick an aesthetic and stick with it"). This replaces the earlier aim of realistic graphics. Every world uses the same rules, each with its own palette. The opt-in "ultra" preset and the photo mode stay.
