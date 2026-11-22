# Economy: free exchange that bots can't farm

The owner's goal (2026-11-22): "a system of free exchange and a secure Ethereum- or Bitcoin-like currency that can't be bot farmed."

## The one rule

A proof of play shows that the inputs produced the result. It cannot show that a human made the inputs. A bot can play perfectly, without rest, on as many keys as it likes, at almost no cost.

So anything tradable that play creates will be farmed, and its price pushed down to the cost of running bots. The rule that follows:

> **Playing never creates anything tradable.** Tradable value enters only through channels where bots have no edge: **stake** (capital), **human creativity** (things people choose to buy), and a **fixed supply schedule**.

Everything play gives stays soulbound. Bots may farm it, but they can't sell or give it away, so farming earns nothing.

## Three kinds of value

| | What | How it is created | Tradable |
|---|---|---|---|
| **Soulbound** | Coins, items earned in worlds (katana, glider, boots…), records, achievements, story rewards, level-clear rewards, Season 0 mementos | By verified play | No (bound to your key) |
| **Editions** | Cosmetic items designed by players: a look, a name, a fixed number of copies | Minted by their creator. All copies go to the creator, who gives, sells or trades them. | Yes |
| **Sparks** (working name) | The currency | A fixed schedule, like Bitcoin. Issued only to stake: validators and the players who delegate to them, pro rata. | Yes |

- **Editions are cosmetic only.** They carry no gameplay traits, so trading is never pay-to-win. They stay outside the verified run state, so replays never depend on the wallet. You wear them on a separate style layer, and other players' clients check on the ledger that you own what you show.
- **Sparks are Sybil-neutral.** Splitting a stake over a thousand bot keys earns exactly what one key earns, and a key with no stake earns nothing.
  - **Supply:** fixed, with issuance halving on a schedule, so activity can't inflate it.
  - **Ownership:** Sparks are held by the same Ed25519 keys that sign runs, and moved by signed transfers.
  - **Ordering:** the ledger orders every transfer. In Season 0 that is the validator, then the federation, then proof of stake.
- **Minting costs a fee in Sparks, which is burned**, once Sparks exist. Until then, mints are capped per key per day and per validator run. A bot can mint junk, but junk sells for nothing; the scarce input is a design people want.

## Free exchange

- **Gift:** a signed transfer of editions and/or Sparks to another key.
- **Swap:** one trade object (what A gives, what B gives, an expiry), signed by both. The ledger applies both sides or neither. Nobody sends first and hopes, and the terms can't be changed after signing.
- **Offers board:** a signed half-trade on the relays ("this edition for 50 Sparks, valid 24 h"). Anyone completes it by co-signing, and the ledger settles the first valid completion.
- **In game:** trade with a player standing next to you (both confirm on screen, both sign), and a market stall in Junction to browse offers.

## Getting Sparks without buying them

- Sell editions you design.
- Win events with entry fees. Prize pools come from the entries, not from new issuance, so a bot gains only by beating people, never by farming supply.
- Take commissions and bounties from other players.
- Stake: hold Sparks and delegate them to a validator.
- Grants from the treasury for creators and community work, decided by people, never by automated play.

## Threats and what stops them

| Threat | Defence |
|---|---|
| Bot farming | Play creates nothing tradable |
| Sybil accounts | Issuance by stake; mint caps per key and per run; burned fees |
| Double spending | One ordering of all transactions; a per-key nonce (each key's transactions are numbered 1, 2, 3…); balance checks |
| Replaying a signed transaction | The nonce: each one applies once, in order. Signed offers also expire. |
| Altering or front-running a swap | Both parties sign the exact terms. A changed swap has no valid signatures. |
| Selling something you don't own | The ledger checks balances; soulbound items are never in the wallet |
| Fake volume or wash trading | Fees, and nothing rewards volume |
| Key theft | XSS-hardened UI (red team: no sink found); recovery phrase and passkeys planned |
| A censoring validator | It can delay but not forge; federation next (G4) |
| Leaderboard bots (tool-assisted runs) | Not an economic issue, since records are soulbound. A "human-verified" board can come later. |

## Genesis (owner decision)

Issuance by stake needs first holders. The options:

1. **A treasury at genesis (recommended).** For example, 10% of supply to a treasury key, spent on creator grants, contests and the founding validators. The other 90% is issued to stakers over many years. Simple, and honest about the centralised start that most proof-of-stake chains have.
2. **The founding validators** receive the initial stake and earn the issuance, then sell or grant it onward.
3. **Fair launch by proof of work.** Anyone mines in the browser for a period. Not recommended: GPUs and server farms would win, which is bot farming by compute.

**Season 0 is a test economy.** Balances have no cash value, there is no bridge, and nothing becomes redeemable before a legal review (G4).

## Build steps

See NOTES.md, goal G9.
