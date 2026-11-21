# Elsewhere: design notes

## The goal

Build a shared virtual universe in the spirit of *Ready Player One*. New worlds, games and items can be added at any time by anyone. What players earn and own is recorded on a community-run chain, so no single developer can take it away or rewrite the rules.

It has to be **fun first**. Past metaverse projects mostly failed because they were empty land sales with nothing to do. Here, every world is a game, and the chain only records things that actually happened in play.

## Architecture today (0.1)

```
registry.json ── pins every world module by SHA-256 (becomes ledger state)
     │
engine ── renderer (three.js) · physics (Rapier, deterministic build) · player/camera
     │    · items + traits · UI · P2P presence (Nostr discovery, WebRTC)
     │
world module (one file) ── build(w): geometry, rules, items, gameplay, all via the World API
```

- **Worlds are modules.** A world only touches the engine through `w`, so the same code can later run sandboxed (in a worker with the same API) when worlds come from strangers.
- **Items are data, traits are behaviour.** An item is `{ name, slot, traits, look }`, where the look is data too. The engine implements universal traits: glide, double jump, light, board, speed, cosmetic and key. Each world's `rules` switch traits on or off locally. So items can be minted once and stay meaningful in worlds that didn't exist when they were made. Nobody can nerf your item everywhere; a world can only decide what works inside itself.
- **Deterministic gameplay.** A fixed 60 Hz tick drives the deterministic build of Rapier, and inputs can be quantised, so a run can be replayed and verified by anyone. Siegeworks already demonstrated cross-browser bit-identical replays (800 of 800) and a validator that replays submissions on a public ledger.
- **No game server.** Browsers discover each other through public Nostr relays and talk directly over WebRTC. Rooms are per world. Mesh rooms stop scaling at about 20 people; sharding comes next.

## Roadmap

1. **Fun pass (now).** Real players in the hub and three worlds. Collect feedback, fix what bores people, and add worlds quickly.
2. **Identity and verified achievements.** Each player gets an Ed25519 keypair (exportable, like a wallet). Runs that earn something, such as a summit time, a race par or the Vault, are submitted as input logs. A validator replays them with the pinned world module and records the result. The first validator can be a public GitHub Action, as in Siegeworks season 0: transparent, free and auditable.
3. **Ownership.** Items earned through verified achievements become ledger records: owner key, item id, provenance (which world, which run). They can be traded peer to peer, and the creator's royalty is enforced by the protocol rather than a company.
4. **Open publishing.** Anyone submits a world: module hash, author key and a small bond. Curation and moderation are decided by stakers, not a single owner. Third-party worlds run sandboxed.
5. **The chain.** A sovereign proof-of-stake chain (not Ethereum). Its state holds accounts, item records, the world registry and verified results. Validators stake, and their work includes re-running submitted replays. That is the original "the game is the work" idea in a form that holds up: the work is checking play, not solving puzzles a bot could grind.
6. **Scale.** Room sharding, then relays run by validators for crowded worlds. Voice is optional, and so are creator tools inside the game.

## Open questions

- **Bots.** Deterministic games can be solved by bots. Rewards should favour prestige and cosmetics over money, and be rate-limited per identity.
- **Name.** "Elsewhere" is a working title.
- **Licence.** The licence for the engine and for community worlds is still to be decided. It matters for contributors.
