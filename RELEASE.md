# Releasing Elsewhere

The owner's direction (2026-11-22): "It's clear to me that the crypto extreme upside event of true secure gameplay consensus is not feasible. Let's proceed now thinking about just wanting to release a successful game."

So the goal is a game people find, enjoy in the first two minutes, come back to, and recommend.

## Where the game stands

- **Content:**
  - Seven worlds: the Junction hub plus six destinations, including the Origin.
  - A complete main quest: the sigils, the Vault, the Founder's Echoes, the Tuning, the Origin.
  - Combat; leaderboards; a level builder with a community gallery.
  - Four story campaigns written but not yet built (`stories/`).
- **Tech:**
  - It runs in any modern browser, desktop and phone, with no install.
  - First visit: about 1.6 MB transferred. On a throttled mid-range phone it is playable in about 2 s on 4G, and about 9 s on slow 4G.
  - Multiplayer is peer-to-peer, with text and voice chat. Players find each other through seven public relays, and the daily multiplayer test checks that they still pass messages.
- **Leaderboards are hard to cheat.** Every run is replayed by a checker before it counts. That machinery stays, but players should only ever see it as "leaderboards" and "your progress is saved".

## Release checklist

### 1. First impressions (in progress)
- [x] Plain words everywhere (2026-11-22). "Verified play" became Leaderboards (best runs and first finders first; the run-checking tools are folded under Advanced). Toasts, settings, the Worlds panel and the backup text no longer say "ledger", "validator", "chain", "proof", "relay", "Nostr" or "hash".
- [x] One look for the whole game (2026-11-22, ART.md): bright, chunky low-poly. Junction, the first thing everyone sees, is rebuilt in it and decluttered, and every other world now follows it. The photographed assets are gone (23.5 MB), so worlds download less.
- [x] The first two minutes (2026-11-23):
  - **A clear goal:** the objective line always names one next step, and a marker (a pin with its distance, or an arrow at the screen's edge) shows where it is: Wren, then each sigil's portal in turn, then the Vault. Skyreach marks its summit, the glider and the Cloud Garden.
  - **A quick win:** Wren's welcome is three short lines instead of six, and ends with a gift: a Party Hat that goes straight on.
  - **A reason to step through:** a trail of coins leads from Wren round the planter to the Skyreach portal.
- [x] Load time, step 1 (2026-11-22): the physics engine is now its own `.wasm`, compiled while it streams and cached apart from the game script.
  - The game script went from 5.4 MB (1,978 KB gzipped) to 1.4 MB (395 KB); the physics binary is 1,145 KB gzipped. In all, 22% less to download, and much less to re-download after an update.
- [x] Load time, step 2 (2026-11-23): rarely used parts load on first use, and boot's downloads overlap.
  - **Measured first:** a first visit downloaded 1,667 KB, 70% of it the physics engine's binary (already as small as it gets). Boot waited on one file after another: the binary only started once the game script had arrived and run.
  - **On first use:** the Builder (with model import, 42 KB gzipped) and the ultra preset (12 KB). The game script a first visit downloads is 353 KB instead of 402 KB.
  - **In parallel:** the physics binary starts downloading while the page is still being read; the world list, the title font and the first world come alongside it. A first visit no longer downloads the leaderboard state file (it grows with every player).
  - **Result** on a throttled phone (CPU ×4): playable in 2.0 s instead of 2.6 s on 4G (9 Mbps, 60 ms), and in 9.0 s instead of 10.2 s on slow 4G (1.6 Mbps, 150 ms).
  - **After updates,** returning players re-download less: three.js sits in a part that changes only with the engine, and most updates touch only the game's own part (86 KB).
- [x] A title and loading screen (2026-11-23), in the one look:
  - the loading screen is Junction's sky, a floating island and the name, with a progress bar;
  - a first visit opens on the title over the live plaza (the camera circles it), with a name box and Play; then the camera glides down to the player. Returning players go straight in.

### 2. Quality
- [x] A playtest pass through every world as a new player (2026-11-23): bugs, confusing bits, dead ends. No errors anywhere. Fixed:
  - **Being lost:** markers on the next step now show in Glowcave (each beacon), Neon Circuit (the grid, then each gate) and Spire Clash (the next red tower). Skyreach no longer skips the sigil at the summit, and says to go home after the Cloud Garden.
  - **A blocked first view** in Skyreach (its sign between you and the camera).
  - **A late surprise** in Glowcave: the note that the far end needs a glider now comes at the start.
  - **Clutter:** Spire Clash's goal line was a stats readout; it leads with the goal now. On phones, touch buttons show only where they do something.
  - **Two Echoes beyond any person:** the Neon Circuit record was faster than the autopilot (now 37.5 s, which a bot with human reaction time can just beat), and Echo IV asked for a bot's score in Crystal Rush (now 25).
  - **Still to do:** a real person's playtest (the owner or friends): bots find dead ends, not boredom.
- [x] A shorter Spire Clash match (2026-11-23): 6–8 minutes instead of 9–17.
  - At 4:30 the **surge** starts: waves come every 15 s and hit harder, and towers and spires take double damage and crumble by 1% of their health a second. A stalled match still ends, and it goes to the side that did more damage.
  - Towers have 2,000 health (was 3,000) and spires 3,000 (was 6,000).
  - After a defeat, the next rival is 10% weaker (up to 30% after three in a row). Those wins count for everything except a leaderboard time.
  - Measured with test bots that play like people at different skill levels: from 5.8–7.0 minutes for the strongest to 6.2–7.8 for one that reacts slowly and never shops. Before, the strongest took 8.8–13.7 minutes, a person-like bot 10–17, and a slow one 10–22 (one never finished).
- [x] **Phones, emulated** (2026-11-25): touch controls in every world, memory over a long session, and each world's cost on a phone profile.
  - **Touch in every world** (`tools/phone_check.py`, 83 checks). Each world is played with real touch sequences (press, drag, hold, lift) on an emulated phone:
    - the stick walks, a drag on the right turns the camera, and JUMP jumps;
    - USE beside a character opens the conversation, and taps page through it;
    - holding JUMP while falling glides; BOARD and the stick ride the hoverboard;
    - the arena's five buttons reach the game;
    - STRIKE shows only in Junction's training yard.

    Buttons fit without overlapping, in landscape and portrait.
  - **Fixed: memory grew with every world visited.** Each visit left its signs on the GPU, a canvas texture of about 1.3 MB per sign: about 22 textures every time the worlds were toured. They are now freed on leaving (`src/engine/freeworld.js`), and two tours leave the GPU's texture count level.
  - **Auto quality remembers its step-down on each device.** A slow phone used to stutter for about 8 seconds on every visit before stepping down; now the next visit starts at the level it settled on. Choosing Auto again starts over.
  - **Measured, no change needed:**
    - shaders compile while the portal's fade is dark, so arriving doesn't stutter;
    - with the CPU slowed 4× (about a mid-range phone against this machine), the game's JavaScript takes under 9 ms a frame at the median in every world. Halcyon takes the most, 8 ms; 9 frames in 10 stay under 12.5 ms;
    - memory per world: 30–72 MB of JavaScript, and under 10 MB each of textures and geometry.
- [ ] **Phones: the frame rate on a real mid-range phone** (needs the owner, or a friend's phone). Emulation can't tell: a desktop GPU's time doesn't scale to a phone's. Junction draws the most, 371 draw calls a frame at Medium, a third of them for the sun's shadows. If a real phone stutters there, phones could start without shadows.
- [x] Settings people expect (2026-11-23). The Menu has tabs: Graphics, Sound, Controls, Online, You.
  - **Graphics:** quality presets that say what they do, field of view, widening at speed, camera shake, a frame-rate counter.
  - **Sound:** volume, music, effects and voices as sliders; a tab in the background goes quiet unless you ask otherwise.
  - **Controls:** separate mouse and camera speeds, invert up/down and left/right, key hints on or off, and "What everything does" for keyboard, gamepad and touch (H opens it), with key names from your keyboard layout.
  - **Fixed on the way:** gamepads can strike and use Spire Clash's abilities, and Esc closes the Menu after you click a setting.
  - Each tab can go back to its defaults; older saves keep their choices.

### 3. Safety (needed for game portals, and right for players)
- [x] Voice chat off by default and push-to-talk (it was already off and push-to-talk, and since 2026-11-23 the phone TALK button only appears once voice is switched on in the Menu, so a tap never asks for the microphone).
- [x] Chat that is safe by default, and mute and block per player (2026-11-23). There is no server, so each player's own game does it:
  - **A word filter** on other players' chat, names and level names. It catches the usual dodges (f4ck, fuuuck, f u c k, lookalike letters from other alphabets, invisible characters) and leaves everyday words alone ("class", "assassin", "kung fu", "Scunthorpe"). Links, email addresses and phone numbers are taken out of chat.
  - **Names** are held to Poki's stricter list too: a rude name is refused when you choose it, and shows as "Wanderer" in other games.
  - **Quick chat:** eight ready-made phrases (Hi, Follow me, Thanks, Good game…). Chat can be set to *Quick chat only* (nothing typed is shown) or *Off*: what CrazyGames asks for (a filter, and chat that can be switched off) and what Poki's no-typed-chat rule needs.
  - **Mute and block:** P, or tap the player count. Mute silences chat and voice; block hides you from each other, sends them nothing, and is kept on the device by player ID. Chat floods are cut down.
- [x] Plain-words privacy note (2026-11-23): `privacy.html`, also in the game (Menu, Online, and the title screen). What stays on the device, what other players see (including the IP address), what the leaderboards publish, and every outside server the game contacts. The build refuses to ship if the page misses a server the game uses.

### 4. Reasons to come back
- [ ] The story campaigns as worlds, one chapter at a time.
  - **Chapter 1 of *The Last Summer of Bronze* is playable** (2026-11-23): *The Door in the Sea*, through the portal beside the Creator's Gate in Junction.
    - You walk out of a shining sea arch into a cave of votive lamps, climb the lamp-lit chimney (dark ledges crumble) and are welcomed by Eumaia, who washes your feet before asking your name.
    - A tremor flings her six guest tablets over the island. Finding them takes you everywhere:
      - onto her roof, and up the olive tree (or three strikes of the bronze knife she lends you);
      - out to Gull Rock on a drifting boat, and across tide pools that rise and sink in turn;
      - up the goat terraces, where Old Horn sits on one until you ring the supper bell;
      - under the threshold stone, for Linnet's.
    - The tablets tell you that every ninth summer a stranger goes up the mountain and never comes back. The last was Linnet, from Elsewhere.
    - At dusk a palace ship comes for you, and on Owl's Watch you choose: light the beacon, or leave it dark. Each choice has its own ending, and it is remembered for the chapters to come.
    - **Also:** the harbour's people (Kyllo the pedlar, Teuthis, Myrrha, Captain Kessa); the Shadow Race up the cliff stair, a timed run with its own leaderboard; 20 tin-drops; a codex of 11 entries; the title Guest of Thyra; the Pedlar's Feather.
    - About 30–45 minutes. Nothing pays coins.
    - The next chapters need the campaign features in `stories/bronze-age/BUILD.md` (unlisted chapter worlds and arrivals, then moving hazards).
- [x] Weekly challenges on the leaderboards (2026-11-23). Every Monday at 00:00 UTC one world is featured with three times (or scores) to beat:
  - **The first five:** a hot lap of Neon Circuit, a Crystal Rush haul, a quick Spire Clash victory, Junction's slime sweep, and a community level (Lantern Steps), then round again.
  - **Medals:** your best checked run of the week earns gold, silver or bronze. The targets come from the test bots that play like people, so gold takes a well-learned run and bronze just a finish.
  - **In the game:** a line under the goal in Junction points to the week's world; there, it shows the three targets and lights the ones you have reached. A run that earns a medal says so. A returning player gets a "New weekly challenge" banner once a week.
  - **In the Leaderboards** (R, or tap the line): the challenge first, with its board, when it ends, a button to go there, last week's winners and your medals.
  - The checker publishes each week's board with the others, worked out from the ledger alone, so anyone recomputing the ledger gets the same medals.
- [x] Seasons: a new trail of Echoes (2026-11-24): Season 1, *Before the Door*, five Echoes and the Paper Crown (GAME.md). Season 2, *The Stranger* (2026-11-25): five more and the Stranger's Hood.

### 5. Launch (owner decisions)
- [ ] **The name.** "Elsewhere" is a working title. Checked 2026-11-24: it is not free in practice.
  - Steam sells a game called exactly [*Elsewhere*](https://store.steampowered.com/app/1271150), a sandbox exploration and crafting game with about 60 "Very Positive" reviews.
  - A second [*Elsewhere*](https://store.steampowered.com/app/4857160/) (a puzzle game) is coming soon there, and itch.io has many small ones.
  - So a player searching for us would find them first. Rename before any public listing.
  - Quick checks of names from the game's own lore found no game with these exact titles:
    - *Otherwhere* (an old English word for "elsewhere"; Steam has the parkour game *AnotherWhere*);
    - *Door to Everywhere* (Underfoot's drawing, Season 1; but it is close to a famous manga's "Anywhere Door").
  - The owner's call. A fuller naming round on request.
- [x] **Feedback that reaches us** (2026-11-24), for the soft launch: the Menu's **Feedback** tab. A mood (loving it, OK, not for me), up to 1000 characters, and the context it names on screen (the world, minutes this session, phone or computer).
  - It is sealed to the team's key (ECDH P-256, AES-GCM, WebCrypto) and carried by the public relays like a saved run. No account, no server: the relays hold only ciphertext.
  - `node tools/feedback.mjs` reads them with the private key (`~/.config/elsewhere/feedback-key.json` on the team's machine, never in the repo). The privacy note says all this.
- [ ] **Where to launch:**
  - itch.io: easy, indie-friendly, a devlog.
  - CrazyGames or Poki: millions of browser players; they need their SDK and safe multiplayer. What their rules ask of chat (read 2026-11-23), and where the game stands:
    - **CrazyGames** allows chat with moderation (a profanity filter at least), and the game must turn its chat off when the player's CrazyGames settings say so (`disableChat`). Done: the filter; the SDK hook is one line (set the chat mode to Off).
    - **Poki** allows no typed chat ("an emoji system works well"), wants strict filtering of usernames with its word list, an in-game privacy policy plus a hosted one, and blocks outside requests unless it approves them. Done: quick phrases (the Quick chat only mode would be fixed on), the name filter uses Poki's list, `privacy.html` in game and hosted. Open: peer-to-peer play reaches public relays and STUN servers, which Poki would have to approve (or players there play alone).
  - Newgrounds; Reddit (r/WebGames, r/IndieGaming).
- [ ] **Analytics,** so we know what players do: a privacy-friendly counter (GoatCounter, Plausible or similar). Needs an account.
  - **Ready to switch on** (2026-11-25): anonymous counts for GoatCounter, an open-source counter that sets no cookies (`src/engine/count.js`).
    - **What we would learn:**
      - how many people come, and from where (the site that linked here, a `ref=` tag in the link, itch.io or the website);
      - whether new players get past the title (the title, then Play), and whether they come back (today, the next day, within a week...);
      - which worlds they reach, which items and milestones they get, which story chapters they finish (and Chapter 1's choice), and which races and rides they complete;
      - how long they play (marks at 1, 5, 15, 30 and 60 minutes);
      - after a minute, phone or computer, the graphics level Auto settled on, and the frame rate in bands. That is the real-phone answer the emulated pass could not give.
      - It also counts feedback sent (with its mood), saved progress found refused, and a world that failed to build or a game that failed to start.
    - **Never:** a name, a player ID, chat or anything typed. Each count is a path from a fixed list, and anything else is refused.
    - **Not counted:** with counts switched off (Menu, then Online), with Do Not Track or Global Privacy Control on, in automated browsers (our own tests included), and anywhere but the game's site.
    - **The privacy page** gains its counting parts only when counting is switched on, and the build refuses a page that doesn't name the counter.
    - **To switch on** (the owner's part): make a GoatCounter account (free for non-commercial use) and choose its code.
      - In its settings, collecting the country only (not the region) is enough.
      - Then set `GOATCOUNTER` in `src/engine/count.js` to the code, update the privacy page's "Last updated" line, build, and push.
    - **Tests:** `tools/count_test.mjs` (CI) and `tools/count_check.py` (the real game against a stand-in counter, Chromium and WebKit).
- [x] **A trailer and screenshots** (2026-11-25): `store/README.md` has the kit (the itch.io page's words, two Reddit posts, how to regenerate it all). The media:
  - 12 stills at 1920×1080, the interface hidden;
  - a 32-second trailer captured frame by frame under Playwright's clock, so it is smooth however slow the software renderer is.

  They are in `store/media/` on the team's machine (not in the repo) and on the owner's private kit page. Still to come: sound for the trailer, and its title card once there is a name.
- [x] **The itch.io upload** (2026-11-25): `python3 tools/itch.py --name "<the name>"` writes one small page (and the same page zipped) that shows the website's game in a frame. It is not a copy of the game.
  - **Why not a copy.** The checker refuses runs on any world or engine version replaced more than 24 hours earlier, and the site changes several times a day. A copy's runs and saves would stop counting after the next update, and it would miss every fix. itch.io's staff have said an uploaded page holding an iframe is fine.
  - **Inside the frame** (`src/engine/embed.js`):
    - the game knows it is on itch.io: the You tab says itch.io keeps its own saves, and feedback says it came from there;
    - "Click the game to play" shows while the keyboard is with itch.io's page, and the upload passes the keyboard on when itch.io focuses its frame;
    - when a browser keeps nothing there (a private window), the title card says so, with a link to the game's own page.
  - **Found by the check:** a page that frames the game without passing on the gamepad permission makes `getGamepads()` throw. The game's loop reads the pad first, so each frame that threw skipped the world's tick and drawing. Now there is simply no pad.
  - **Tests:** `tools/itch_check.py` plays the upload inside a stand-in for itch.io's page, with itch.io's exact frame settings, across three sites (Chromium and WebKit, 35 checks each). `tools/embed_test.mjs` runs in CI.
  - The itch.io settings to choose, and a cover image (Junction, 1260 × 1000), are in `store/README.md`.
- [ ] **Money, if wanted:** portal ad revenue share, or cosmetic purchases later. Not needed to launch.
