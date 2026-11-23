// Where players find each other: the Nostr relays that carry Trystero's signalling (the offers and answers that set
// up each WebRTC connection). After that, players talk directly and the relays carry nothing.
// Pinned on 2026-11-23. Trystero picks 5 relays from its built-in list by the app id, and of the 5 it picked for us
// only 2 still passed signalling (2 were down, 1 refuses ephemeral events), so multiplayer hung on 2 small servers.
// A relay counts only if it delivers an ephemeral event from one connection to another: tools/signal_check.mjs
// tests each one (the daily multiplayer test runs it). Keep at least 4 passing. When swapping relays, keep two of
// the old ones for a while, so players on a cached copy of the game still meet players on the new one.
export const MEET_RELAYS = [
  'wss://nos.lol',
  'wss://relay.nostr.net',
  'wss://nostr.mom',
  'wss://relay.primal.net',
  'wss://relay.snort.social',
  'wss://nostr.rblb.it', // these two are the ones of Trystero's old pick that still work, so cached copies still meet
  'wss://relay.flashapp.me',
];
