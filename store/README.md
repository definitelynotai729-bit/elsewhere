# Store kit: the soft launch (RELEASE.md §5)

Everything needed to put the game on itch.io and post it in a couple of communities. **The name is still to be decided** (RELEASE.md §5: "Elsewhere" is taken on Steam), so below it is written as **{NAME}**. Swap it in once the owner picks one.

The media (12 stills at 1920×1080 and a 32-second trailer) are regenerated from the live game with the scratch scripts `.scratch/store_kit.py` and `.scratch/store_trailer.py` (notes at the end). They are kept out of the repo; the owner gets them as a private page.

## itch.io

**Kind of project:** HTML (played in the browser). **Pricing:** free (no payments).
**Genre:** Adventure. **Tags** (itch.io takes ten; in order of preference, so the first ten): 3d, low-poly, exploration, platformer, minigolf, surfing, racing, cozy, cute, multiplayer, singleplayer, short, browser.
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
> - **Lost Links.** Nine holes of adventure golf in a valley full of friendly dinosaurs. A long neck grazes across the lane, a tail swings through the gate, a geyser throws your ball onto a mesa, and the last hole jumps a ravine.
> - **The Last Summer of Bronze.** A story campaign on Bronze Age islands (three chapters so far). An island that feeds strangers before it asks their names, a wingmaker who needs a test pilot, and a bronze giant who has guarded a strait for centuries and has one question for you.
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

**The upload is one small page, not a copy of the game.** `python3 tools/itch.py --name "{NAME}"` writes `store/itch/index.html` and the same file zipped (`store/itch/<name>-itch.zip`, about 1.5 KB; git-ignored). It shows the game's website in a frame, so the game on itch.io is always the current one.

- **Why not a copy.** The checker refuses runs on any world or engine version replaced more than 24 hours earlier, and the site changes several times a day. A copy's leaderboard runs and saves would stop counting after the next update, and it would miss every fix.
- **itch.io allows it.** Its staff and moderators have said an uploaded `index.html` holding an iframe is fine ([2016](https://itch.io/t/28193/html-game-question-can-i-have-an-iframe-to-a-game-im-hosting-elsewhere), [2023](https://itch.io/t/2780611/can-itchio-have-a-game-listing-that-isnt-hosted-on-itchio)). Their docs ask only that outside requests use HTTPS, which GitHub Pages does.

**On the project's edit page:**
- **Kind of project:** HTML. Upload the zip (or the single `index.html`) and tick *This file will be played in the browser*.
- **Embed options:** *Embed in page*, viewport **1280 × 720** (960 × 600 works too), *Fullscreen button* on, *Mobile friendly* with landscape orientation, *Click to play* left on (a first visit downloads 5–6 MB, too much for every page view), no scrollbars.
- **Cover image:** `cover.png` (1260 × 1000, the 630 × 500 shape itch.io asks for; `cover-630.png` is the small one). It is Junction from the stills, with no title yet.
- **Screenshots:** the stills. **Trailer:** itch.io takes a YouTube or Vimeo link, so the trailer goes up there first.

**What players there get** (`src/engine/embed.js`):
- The game knows it is on itch.io (`?embed=itch`). The You tab says itch.io keeps its own saves, and feedback says it came from there.
- *Click the game to play* shows while the keyboard is with itch.io's page. When itch.io focuses its frame, the upload passes the keyboard on.
- If the game cannot be reached, the upload offers a link to open it in its own tab after 20 seconds.
- **Progress on itch.io is kept apart from the website's**, because browsers keep each site's saves separately. The backup code (Menu, then You) carries it across.
- A private window, or a browser set to block third-party site data, keeps nothing inside another site's page. The game still plays, and its title card says progress ends with the tab, with a link to the game's own page.
- Saved runs and feedback travel over the same public relays, so the boards are shared.

**Check it** with `python3 tools/itch_check.py docs` (a local build) or `python3 tools/itch_check.py https://definitelynotai729-bit.github.io/elsewhere/` (the website), in Chromium and WebKit. It plays the upload inside a stand-in for itch.io's page with itch.io's exact frame settings, on three different sites.

## Reddit

**r/WebGames** (browser games; a short title and a link):

> **Title:** {NAME}: a universe of little low-poly worlds behind portals. Surf a giant wave, glide between sea stacks, play the floor is lava in a giant bedroom [free, no sign-up]
> **Body:** One plaza, about ten worlds, a hunt that runs through them, and leaderboards. Runs in the browser on a computer or a phone. Tell me what's fun and what's confusing: there's a Feedback tab in the menu.

**r/playmygame** (asks for feedback; say what you want to learn):

> **Title:** My browser game {NAME}: little worlds behind portals. I'd love to know where you get bored or lost
> **Body:** It's free and needs no account. Start in the plaza and pick any portal. Lost Links (mini golf with dinosaurs), Underfoot (you're toy-sized in a bedroom) and Halcyon Point (surf a giant wave) are the newest. What I'd most like to hear: what you tried first, where you stopped, and what you'd want more of. The menu has a Feedback tab, and it's read.

Post when someone can answer comments for the first day.

**Links with a tag.** Once counting is switched on (`src/engine/count.js`), a `ref=` tag in a link says where visitors came from. The game passes on only `ref=` and `utm_` tags, and nothing else from the address:
- r/WebGames: `https://definitelynotai729-bit.github.io/elsewhere/?ref=r-webgames`
- r/playmygame: `https://definitelynotai729-bit.github.io/elsewhere/?ref=r-playmygame`
- itch.io needs no tag: its visits count as `/itch`.

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
| `cover.png`, `cover-630.png` | itch.io's cover (1260 × 1000 and 630 × 500): Junction, cropped from `junction.png`. A title goes on once there is a name |
| `trailer.mp4` | 32 s, 1280×720, silent. Nine shots: Junction, Skyreach, Neon Circuit, the barrel, the floor turning to lava, Pterousa, Glowcave, Spire Clash, the portals |

**To regenerate**, after a change (or the new name):

```
python3 .scratch/store_kit.py docs OUT [name...]   # stills
python3 .scratch/store_trailer.py docs OUT          # trailer
```

- Stills are 1920×1080 with the interface hidden. The player wears a hoodie, a scarf, a fox tail, the Founder's Crown and the glider.
- The trailer is captured frame by frame under Playwright's clock control. Each frame advances the game exactly 1/30 s, so the video is smooth however slow the software renderer is: about 0.85 s per frame, 15 minutes in all.
- It has no sound yet: the game's music is made live in the browser. A title card waits for the name.
