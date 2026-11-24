# Elsewhere

**An open universe of worlds.** Walk through portals into different worlds, collect items that keep working across them, and meet other explorers live. Every world, game and item is a module that can be added later, and the plan is for anyone to publish one.

▶ **Play: https://definitelynotai729-bit.github.io/elsewhere/** (desktop or phone, no install, no account)

*Elsewhere is a working title. This is prototype 0.3.*

## What's in 0.3

- **Junction**, the hub: portals to every world, a sealed Vault that needs three sigils, a shop, and an arcade whose cabinets run any web game (the first is [Siegeworks](https://github.com/definitelynotai729-bit/siege-works)).
- **Skyreach** (platforming climb). **Glowcave** (dark cavern: bring a lantern and the glider). **Neon Circuit** (hoverboard race against your own ghost). **Crystal Rush** (90-second score attack).
- **The Last Summer of Bronze**, a story world (chapter 1 of 10, *The Door in the Sea*): an Aegean island of goats, lamps and guest tablets; one choice at dusk changes what comes next. Its routes are played by a bot on the real physics (`tools/thyra_bot.mjs`), so every part is known to be reachable, and every playthrough verifies like any run.
- **Spire Clash**, a lane battle in the arena genre: a top-down camera, minion waves, towers, a rival AI champion, levels and upgrades. Q/E/R abilities, Space dash, B recall. The gear you bring from other worlds becomes match bonuses. A match lasts 6–8 minutes: at 4:30 the surge makes towers and spires crumble.
- **Items that carry between worlds.** Items are data with *traits* (glide, double jump, light, board, cosmetic, key). Each world's rules decide which traits work inside it, so a glider won in Skyreach is what gets you across Glowcave's chasm.
- **Live presence and voice:** players in the same world see each other, chat (T or Enter: typed words or quick phrases), and talk.
  - Safety without a server: each player's game filters other players' chat and names (swear words, slurs, links, phone numbers), and anyone can be muted or blocked (P, or tap the player count). Chat can be set to quick phrases only, or off. [Privacy](https://definitelynotai729-bit.github.io/elsewhere/privacy.html) says what is shared, with whom.
  - Proximity voice: you hear people from where they stand. Hold V to talk, or choose an open mic; voice is off until you turn it on in the menu.
  - There is no game server: browsers find each other through public Nostr relays and connect peer-to-peer over WebRTC.
- **Content pinned by hash:** the registry lists each world module with its SHA-256, and the client refuses a module that doesn't match. Every published version stays in `docs/worlds/by-hash/`. On the chain, that registry becomes ledger state.
- **Verified play:**
  - Every visit to a world is recorded as a signed proof of play: your inputs, one per 1/60 s tick, plus what they earned. Anyone can replay a proof with the pinned world code and check that it produces exactly what it claims, bit for bit, in Chrome, Safari or Firefox. Press **R** in the game, or use **[the verify page](https://definitelynotai729-bit.github.io/elsewhere/verify.html)**.
  - How it works: [DESIGN.md](DESIGN.md#architecture-today-03).
- **A public ledger of verified runs (season 0):**
  - Press **Submit to the ledger** on a run. It is published to public Nostr relays; no account is needed.
  - An open validator replays every submission and appends the accepted runs to a hash chain: [`docs/ledger/ledger.json`](docs/ledger/ledger.json). Refusals are published with their reasons.
  - Verified records show in the game (press R, or visit the Hall of Records in Junction).
  - Anyone can run the validator or recompute the chain.
- **Weekly challenges:** every Monday (00:00 UTC) one world is featured with gold, silver and bronze times to beat. Your best checked run of the week earns a medal; the week's board, last week's winners and your medals sit at the top of the Leaderboards (R). The schedule is [`src/engine/challenges.js`](src/engine/challenges.js), read by both the game and the validator.
- Keyboard (W/S to move, A/D to turn, arrow keys to turn the camera, H for every control, P for the players here; mouse look is an option), touch, or gamepad. Settings for volume, camera speed, inverted look, field of view and graphics. Synthesised sound and music. A data-driven avatar.

## Add a world

A world is one JavaScript file in `src/worlds/`. It talks to the engine only through the World API. See **[WORLD_API.md](WORLD_API.md)**.

```sh
npm install
npm run build                 # bundles the engine into docs/, pins worlds in docs/worlds/registry.json
python3 -m http.server -d docs 8080
python3 tools/shot.py --world skyreach --steps "wait:1;shot:a"   # headless screenshots (Playwright)
python3 tools/mp_test.py       # two browsers must find each other over the real P2P network
node tools/verify.mjs proof.json   # replay and check a proof of play (exit code 0 = valid)
python3 tools/proof_test.py --engine webkit   # play scripted sessions in a browser, verify their proofs in Node
node tools/battery.mjs && python3 tools/battery.py   # 200 random runs must replay identically in V8, JSC and SpiderMonkey
node tools/ledger.mjs --dry    # be a validator: fetch submitted runs from the relays and replay them
node tools/ledger.mjs --rebuild   # recompute the whole ledger from the archived proofs
```

## Layout

| path | what |
|---|---|
| `src/engine/` | the engine: renderer (three.js), physics (Rapier, deterministic build), player and camera, World API, items/traits, UI, P2P presence |
| `src/worlds/` | world modules (hub, skyreach, glowcave, circuit) |
| `src/index.html` | page and HUD |
| `tools/` | build, screenshot QA, multiplayer test, proof verifier, determinism battery |
| `tests/proofs/` | golden proofs recorded in real browsers; CI must keep verifying them |
| `docs/ledger/` | the season-0 ledger: the hash chain, archived proofs, record boards, refusals |
| `NOTES.md` | current goals and the work log |
| `docs/` | the built site (GitHub Pages) |
| `DESIGN.md` | vision, architecture and roadmap (chain, ownership, verified play) |

## Why

Big shared virtual worlds tend to go wrong in two ways. Either one company owns everything and changes the rules on its players, or the worlds are built for speculation and nobody actually plays. Elsewhere is trying a third way: fun first, worlds as open modules, and ownership and achievements recorded on a community-run chain that no single developer controls. [DESIGN.md](DESIGN.md) covers the plan.

Built by a human and an AI (Claude).
