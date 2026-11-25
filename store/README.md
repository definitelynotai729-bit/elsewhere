# Store kit: the soft launch (RELEASE.md §5)

Everything needed to put the game on itch.io and post it in a couple of communities. **The name is still to be decided** (RELEASE.md §5: "Elsewhere" is taken on Steam), so below it is written as **{NAME}**. Swap it in once the owner picks one.

The media (12 stills at 1920×1080 and a 32-second trailer) are regenerated from the live game with the scratch scripts `.scratch/store_kit.py` and `.scratch/store_trailer.py` (notes at the end). They are kept out of the repo; the owner gets them as a private page.

## itch.io

**Kind of project:** HTML (played in the browser). **Pricing:** free (no payments).
**Genre:** Adventure. **Tags:** 3d, low-poly, exploration, platformer, racing, surfing, cozy, singleplayer, multiplayer, short, cute, browser.
**Made with:** three.js and Rapier (our own engine).

### Tagline (short description)

> A universe of little worlds behind portals. Surf a giant wave, glide between sea stacks, and play the floor is lava in a giant's bedroom. Free in your browser.

### Description

> **{NAME}** is a universe of small, handmade worlds, all reached through portals from one plaza: Junction.
>
> - **Skyreach.** Climb a chain of floating islands into the clouds.
> - **Glowcave.** Bring a lantern into a cavern of glowing crystals.
> - **Neon Circuit.** Race a hoverboard through a synthwave city, against your own ghost.
> - **Crystal Rush.** Ninety seconds, as many crystals as you can carry.
> - **Spire Clash.** A lane battle: minions, towers and a rival champion. Matches last six to eight minutes.
> - **Halcyon Point.** A wave taller than a house breaks along the reef all day. Get towed in and surf it, scored like a contest.
> - **Underfoot.** You're the size of a toy in a child's bedroom. Find ten lost marbles, keep away from the cat, and run "the floor is lava" from the door to the window sill against the clock.
> - **The Last Summer of Bronze.** A story campaign on Bronze Age islands (two chapters so far). An island that feeds strangers before it asks their names, and a wingmaker who needs a test pilot.
>
> **A hunt runs through all of it.** Three sigils open the Vault in Junction. Inside, the Founder's Echoes lead from world to world, and further. Season 1, *Before the Door*, has just begun.
>
> **Things carry between worlds.** A glider found in one world crosses a chasm in another, and every world decides which of your things work inside it. Make your own character in the wardrobe: body, face, outfit, colours.
>
> **Fair leaderboards.** Every run is replayed and checked before it counts, and the first finder of each Echo is on the boards for good.
>
> **No account.** Your progress lives in your browser (back it up from the Menu). Other players are optional. Chat starts on quick phrases, and voice is off unless you switch it on.
>
> Tell us what you think: **Menu → Feedback**. Every message is read.

**Controls:** keyboard and mouse (W/S move, A/D turn, Q/E strafe, Space jump, F use, arrows for the camera, H for all the controls), a gamepad, or touch on a phone or tablet.

**Privacy:** link to `privacy.html` on the game's site.

### Getting the game onto itch.io

itch.io plays HTML games from its own servers inside a frame, so the game has to be uploaded, not linked. A zip of the site's current files works: the client, the current engine, the worlds, the assets.

The full `docs/` folder is heavier than it needs to be: it also holds every archived engine and world version, and the ledger. A trimmed build for itch belongs in the next step of this kit.

Two things to know:
- Progress saved on itch.io is separate from the GitHub Pages site's, because browsers keep it per site. The backup code moves it across.
- Saved runs and feedback still travel over the public relays, so the boards are shared.

## Reddit

**r/WebGames** (browser games; a short title and a link):

> **Title:** {NAME}: a universe of little low-poly worlds behind portals. Surf a giant wave, glide between sea stacks, play the floor is lava in a giant bedroom [free, no sign-up]
> **Body:** One plaza, about ten worlds, a hunt that runs through them, and leaderboards. Runs in the browser on a computer or a phone. Tell me what's fun and what's confusing: there's a Feedback tab in the menu.

**r/playmygame** (asks for feedback; say what you want to learn):

> **Title:** My browser game {NAME}: little worlds behind portals. I'd love to know where you get bored or lost
> **Body:** It's free and needs no account. Start in the plaza and pick any portal. Underfoot (you're toy-sized in a bedroom) and Halcyon Point (surf a giant wave) are the newest. What I'd most like to hear: what you tried first, where you stopped, and what you'd want more of. The menu has a Feedback tab, and it's read.

Post when someone can answer comments for the first day.

## The media

| File | What it shows |
|---|---|
| `junction.png` | The plaza: the Vault, portals, market stalls, floating rocks |
| `skyreach.png` | Floating islands, a waterfall, the player with crown and glider |
| `glowcave.png` | The glowing cavern, lantern in hand |
| `neon-circuit.png` | The synthwave city and the raised track |
| `spire-clash.png` | The battle lane: towers and the crystal |
| `halcyon-barrel.png`, `halcyon-wave.png` | A rider in the Giant's barrel; the wave breaking along the reef |
| `underfoot.png`, `underfoot-lava.png` | The bedroom from the door; the floor turned to lava |
| `pterousa.png` | The sea stacks, the palace ship and the High Line's hoops |
| `thyra-hearth.png` | The Stranger's Hearth on Thyra, Eumaia at her table |
| `wardrobe.png` | The character creator |
| `trailer.mp4` | 32 s, 1280×720, silent. Nine shots: Junction, Skyreach, Neon Circuit, the barrel, the floor turning to lava, Pterousa, Glowcave, Spire Clash, the portals |

**To regenerate**, after a change (or the new name):

```
python3 .scratch/store_kit.py docs OUT [name...]   # stills
python3 .scratch/store_trailer.py docs OUT          # trailer
```

- Stills are 1920×1080 with the interface hidden. The player wears a hoodie, a scarf, a fox tail, the Founder's Crown and the glider.
- The trailer is captured frame by frame under Playwright's clock control. Each frame advances the game exactly 1/30 s, so the video is smooth however slow the software renderer is: about 0.85 s per frame, 15 minutes in all.
- It has no sound yet: the game's music is made live in the browser. A title card waits for the name.
