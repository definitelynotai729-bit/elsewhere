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
  - First visit: about 1.7 MB transferred, playable in about 2 s on a fast connection (more on phones).
  - Multiplayer is peer-to-peer, with text and voice chat.
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
- [ ] Load time, step 2: load the Builder and other rarely used parts on demand. (Junction's 713 KB sky is gone with the one look.)
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
  - **Still to do:** a Spire Clash match takes a strong bot about 11 minutes; aim for 6–8. A real person's playtest, too (the owner or friends): bots find dead ends, not boredom.
- [ ] Phones: touch controls in every world, frame rate on a real mid-range phone (needs the owner, or a friend's phone).
- [ ] Settings people expect: volume, sensitivity, invert, graphics, controls help.

### 3. Safety (needed for game portals, and right for players)
- [ ] Voice chat off by default and push-to-talk (done: it was already off and push-to-talk, and since 2026-11-23 the phone TALK button only appears once voice is switched on in the Menu, so a tap never asks for the microphone). Text chat with a basic filter, and mute or block per player.
- [ ] Plain-words privacy note: peer-to-peer play shares your IP address with players in the same room.

### 4. Reasons to come back
- [ ] The story campaigns as worlds, one chapter at a time.
- [ ] Weekly challenges on the leaderboards (a featured world and time to beat).
- [ ] Seasons: a new trail of Echoes.

### 5. Launch (owner decisions)
- [ ] **The name.** "Elsewhere" is a working title; check that it is free to use as a game name.
- [ ] **Where to launch:**
  - itch.io: easy, indie-friendly, a devlog.
  - CrazyGames or Poki: millions of browser players; they need their SDK and safe multiplayer.
  - Newgrounds; Reddit (r/WebGames, r/IndieGaming).
- [ ] **Analytics,** so we know what players do: a privacy-friendly counter (GoatCounter, Plausible or similar). Needs an account.
- [ ] **A trailer and screenshots:** photo mode makes the stills; gameplay capture for a 30-second trailer.
- [ ] **Money, if wanted:** portal ad revenue share, or cosmetic purchases later. Not needed to launch.
