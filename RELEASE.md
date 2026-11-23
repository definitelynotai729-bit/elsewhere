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
- [ ] Phones: touch controls in every world, frame rate on a real mid-range phone (needs the owner, or a friend's phone).
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
- [ ] Weekly challenges on the leaderboards (a featured world and time to beat).
- [ ] Seasons: a new trail of Echoes.

### 5. Launch (owner decisions)
- [ ] **The name.** "Elsewhere" is a working title; check that it is free to use as a game name.
- [ ] **Where to launch:**
  - itch.io: easy, indie-friendly, a devlog.
  - CrazyGames or Poki: millions of browser players; they need their SDK and safe multiplayer. What their rules ask of chat (read 2026-11-23), and where the game stands:
    - **CrazyGames** allows chat with moderation (a profanity filter at least), and the game must turn its chat off when the player's CrazyGames settings say so (`disableChat`). Done: the filter; the SDK hook is one line (set the chat mode to Off).
    - **Poki** allows no typed chat ("an emoji system works well"), wants strict filtering of usernames with its word list, an in-game privacy policy plus a hosted one, and blocks outside requests unless it approves them. Done: quick phrases (the Quick chat only mode would be fixed on), the name filter uses Poki's list, `privacy.html` in game and hosted. Open: peer-to-peer play reaches public relays and STUN servers, which Poki would have to approve (or players there play alone).
  - Newgrounds; Reddit (r/WebGames, r/IndieGaming).
- [ ] **Analytics,** so we know what players do: a privacy-friendly counter (GoatCounter, Plausible or similar). Needs an account.
- [ ] **A trailer and screenshots:** photo mode makes the stills; gameplay capture for a 30-second trailer.
- [ ] **Money, if wanted:** portal ad revenue share, or cosmetic purchases later. Not needed to launch.
