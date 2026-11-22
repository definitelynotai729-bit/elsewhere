# Writing a world for Elsewhere

A world is **one JavaScript module**. It describes a place, its rules and any new items it brings. It never imports anything. It talks to the engine only through the object `w` passed to `build(w)`. Junction (the hub), Skyreach and every other world are written this way.

```js
export default {
  id: 'my-world',            // lowercase, unique, 2-32 chars [a-z0-9-]
  name: 'My World',          // shown on portals and in the world list
  author: 'your-name',
  version: 1,
  blurb: 'One line that sells it.',
  color: '#ff9f1c',          // portal colour in Junction
  spawn: { pos: [0, 2, 0], yaw: 180 },   // yaw in degrees; 0 faces +z, 180 faces -z
  killY: -40,                // fall below this and you respawn at the last checkpoint
  rules: { deny: ['board'] },            // which item traits are switched off here (see Items)
  theme: { /* sky, light, fog: see Theme */ },
  music: { root: 57, scale: 'minor', bpm: 72 },
  items: { /* new items this world introduces: see Items */ },
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [20, 1, 20], color: '#55606e' });
    w.portal({ pos: [0, 0, 8], yaw: 180, to: 'hub' });
    w.coin({ pos: [3, 1.2, 0] });
  },
};
```

Add the file to `src/worlds/`, run `npm run build`, and the build pins it in `docs/worlds/registry.json` by SHA-256. The engine refuses any module whose hash does not match the registry. Junction automatically opens a portal to every registered world it does not already place by hand.

## Coordinates and units

Metres, y up. A player is 1.8 m tall and 0.8 m wide. On foot they run at 8 m/s, and a jump clears about 1.9 m of height and 4.5 m of gap. Gravity is strong, so the game feels snappy. A jump pad's apex is about power²/60 m. Gliding sinks at a steady 2.3 m/s while moving about 10.4 m/s, so each metre of drop buys about 4.5 m of distance. A double jump adds about 1.7 m. Angles in the API are **degrees**. `yaw` rotates around y, and an object with `yaw: 0` faces +z.

The engine runs gameplay at a fixed 60 ticks per second, so worlds behave identically on every machine. Keep gameplay logic in `w.on('tick')`, and use `w.on('frame')` only for visuals. Every visit is recorded and can be replayed to verify it, so your world must follow a few rules; see [Verified play](#verified-play).

## Building blocks

Each returns a handle `{ mesh, col, hide(), show(), remove() }`. All take `pos`, `color`, plus optional `yaw` or `rot: [x, y, z]` (degrees), `glow` (emissive strength; 1.5 and above blooms), `emissive` (a separate glow colour, so a part can be dark but glow), `metal`, `rough`, `opacity`, `texture` and `tile` (a photographed material; see [Textures](#textures)), `collide: false` (decoration only), `shadow: false` and `scale: [x, y, z]` (stretches the visual only, so use it with `collide: false`).

| call | shape |
|---|---|
| `w.box({ pos, size: [x, y, z] })` | box |
| `w.cylinder({ pos, radius, height, sides })` | cylinder (`sides: 6` or `8` for faceted) |
| `w.sphere({ pos, radius, low })` | sphere (`low: true` is a faceted icosahedron) |
| `w.cone({ pos, radius, height })` | cone (`rot: [180, 0, 0]` points it down) |
| `w.ramp({ pos, size: [w, h, len], yaw })` | wedge rising toward its local +z |
| `w.model({ pos, yaw, scale, parts })` | decoration from a list of parts (same format as item looks) |
| `w.add(object3d)` | escape hatch: add any three.js object (`w.THREE` is available) |

Static parts are merged into a few draw calls automatically (one per material), so hundreds or thousands of boxes are fine. `w.model` parts are not merged, so prefer the solids above for anything you repeat a lot.

### Textures

`texture: '<id>'` covers a box, cylinder, sphere, cone or ramp in a photographed material, and `tile` sets how many metres one copy of it covers:

```js
w.box({ pos: [0, -0.5, 0], size: [40, 1, 40], color: '#7b6e9a', texture: 'marble', tile: 4.5, rough: 0.7 });
w.cylinder({ pos: [0, -1, 0], radius: 6, height: 2, texture: 'cliff' });   // no colour: the rock as photographed
```

- **Sets:** `marble`, `marble-check` (chequered), `stone-blocks`, `grass`, `cliff`, `mossy-rock`, `cave-rock`, `gravel`, `planks`, `metal` and `plaster`. They are CC0 texture sets from Poly Haven, pinned in `docs/assets/manifest.json` under `textures` and credited in `CREDITS.md`.
- **Colour:** the colour becomes the part's average and the texture adds the detail, so a palette keeps working. Leave `color` out to see the material as photographed.
- **Roughness:** `rough` sets the average roughness in the same way; leave it out for the photographed roughness. `metal` works as usual, and the `metal` set is metallic by itself.
- **Tile:** the default is the texture's real-world size, about 2 m. Texture coordinates are projected along each face's direction in metres, so texel density is the same on big and small parts, and parts side by side line up. A rotated part's texture follows its edges.
- **Merging:** static parts still merge, into one draw call per texture and colour.
- **Visual only:** textures load after the world appears, and until then the part shows its flat colour. Nothing in gameplay depends on them, colliders included, and a replay never loads them.

## Motion

- `w.mover(part, { path: [[x, y, z], ...], speed, pause, loop, offset })` turns a box or cylinder into a moving platform. Players ride it. `offset` (0 to 1) shifts the starting point along the path.
- `w.crumble(part, { delay: 0.5, respawn: 3 })`: the part falls shortly after a player lands on it, then comes back.
- `w.spin(handleOrObject, { axis: 'y', speed })` rotates it. Use for decoration, not for platforms you stand on.

## Gameplay pieces

| call | what it does |
|---|---|
| `w.portal({ pos, yaw, to, label, subtitle, color, arrive })` | Doorway to another world (`to` is a world id). Arrivals appear `arrive` metres (default 10) in front of the portal that leads back, facing away from it. |
| `w.checkpoint({ pos, yaw })` | A beacon. Touching it sets the respawn point. |
| `w.coin({ pos, value, kind: 'gem' })` | Collectible. Each coin pays once per player and is remembered. |
| `w.pickup({ pos, item, scale, onPick })` | Gives an item (once per player by default). |
| `w.jumpPad({ pos, power, push: [vx, 0, vz] })` | Launches the player. `push` adds a horizontal velocity. |
| `w.boostPad({ pos, yaw, power, time })` | Speed boost in the pad's direction (strong on a board). |
| `w.wind({ pos, size, force: [x, y, z] })` | Pushes the player while inside the box. |
| `w.hazard({ pos, size or radius })` | Touching it sends you back to the checkpoint. |
| `w.zone({ pos, size or radius, yaw, onEnter, onExit, onStay, once })` | Trigger volume for your own logic (`yaw` rotates a box zone). |
| `w.interact({ pos, radius, label, onUse })` | Shows "F · label" nearby. `onUse` may be async. |
| `w.npc({ pos, yaw, name, colors, hat, lines or onTalk, wave })` | A character you can talk to. |
| `w.sign({ pos, yaw, title, text, width })` | Readable signboard (`\n` for new lines). |
| `w.label({ pos, text, size })` | Floating text that faces the camera. |
| `w.light({ pos, color, intensity, distance })` | Point light. Use a few, not dozens. |
| `w.particles({ pos, area: [x, y, z], count, color, size, kind: 'float' or 'rise' or 'snow' })` | Ambient motes. |
| `w.ball({ pos, radius, color })` | A physics ball players can kick. |
| `w.cabinet({ pos, yaw, title, url, onMessage })` | Arcade cabinet that opens any web game in a sandboxed frame. The game can `postMessage` results back. |
| `w.avatar({ colors, eq, name })` | A character model you move yourself (ghosts, crowds). Returns `{ root, animate(state, dt), ... }`. |

## Controls and camera (per world)

Most worlds use the standard keys:
- W/S move, A/D turn, Q/E strafe, F interact.
- The arrow keys orbit the camera.

A world can choose differently:

```js
controls: 'topdown',                                     // arena games: WASD/arrows move relative to the screen
camera: { mode: 'top', yaw: 180, pitch: 56, dist: 27 },  // a fixed camera looking down at the field
```

With `controls: 'topdown'`:
- Q, E and R are ability keys, Space is a dash and B is a recall. There is no jumping.
- Read them in your tick handler with `w.input`: `w.input.q`, `.e`, `.r`, `.dash`, `.recall` and `.use` are true on the tick they are pressed, and `w.input.move` is the stick `[x, y]`.
- **Strikes (standard controls).** Key 1 is the strike key in every standard world. `w.input.attack` is true on the tick it is pressed, and the character swings whatever it holds. The world decides what a strike hits and what it does. Junction's training dummies take 34 damage from a `blade`-trait item and 4 from bare hands.
- They are part of the recorded input, so replays see exactly the same presses.
- [Spire Clash](src/worlds/clash.js) is the example.

## The player

`w.player.pos`, `.vel`, `.yaw`, `.grounded`, `.board`, `.speed` (read only), plus:
`setPos(p, yaw)`, `launch(vy, vx, vz)`, `push([x, y, z])` (this tick only), `boost(seconds, speed)`, `respawn()`, `setCheckpoint(p, yaw)`, `freeze(on)`, `forceBoard(on)` (racing worlds), `setSpeed(scale)` (walking speed for this world) and `canUse(trait)`.

**Gear from other worlds:** `w.equipment()` returns what the player is wearing by slot. `w.itemInfo(id)` gives `{ name, slot, traits, rarity }`. Use them to give imported items meaning in your world. Spire Clash, for example, turns a Glider into move speed and a Lantern into ability power.

## Progress, UI and events

- Items: `w.give(id)`, `w.has(id)`, `w.take(id)` and `w.equip(id)`.
- Coins: `w.coins()`, `w.addCoins(n)` and `w.spend(n)`. Global flags: `w.flag(key)` and `w.setFlag(key, value)`. Per-world storage: `w.store.get(key, default)` and `w.store.set(key, value)`.
- UI: `w.toast(text)`, `await w.say(name, lines)`, `await w.ask(name, question, options)` (resolves to the option index, or -1), `w.banner(title, subtitle)`, `w.objective(text)`, `w.shop(title, [{ item, price }])`, `w.openPanel('map')`.
- Timer: `w.timer.start()`, `w.timer.stop()` (returns seconds), `w.timer.cancel()` and `w.fmtTime(seconds)`.
- Records: `w.record(key, value, { better: 'lower' | 'higher' })` declares a result worth ranking, such as `w.record('lap', t)`. It becomes one of the run's verified claims. Once a player submits the run and the validator accepts it, the record appears on the season ledger's boards.
- Game time: `w.after(seconds, fn)` runs `fn` later, and `await w.wait(seconds)` pauses async code. Both count ticks, not the wall clock, so they fire at the same moment in a replay.
- Effects: `w.sound(name)`, `w.burst(pos, { color, count, speed, life })` and `w.shake(seconds)`. Sound names: jump, coin, gem, checkpoint, pad, boost, portal, pickup, blip, click, error, crumble, respawn, win, lose, countdown, go and open.
- Events: `w.on('tick', dt)`, `'frame'` (dt, time), `'enter'` (from world id), `'respawn'`, `'fall'`, `'checkpoint'`, `'coin'`, `'pickup'` and `'leave'`.
- Other helpers: `w.time` (seconds since the world loaded), `w.rand(seed)` (deterministic RNG with `.range`, `.int` and `.pick`), `w.travel(id)`, `w.worlds` (the registry list) and `w.setKillY(y)`.

## Verified play

Every visit to a world is recorded as a proof of play: the player's input on each tick, plus their dialog answers, purchases and equips. Anyone can replay the proof with your module, pinned by its SHA-256, and check that it gives the same result. For that to hold, a world must be deterministic:

- **Change game state only from tick-driven code.** That covers `build`, `w.on('tick')`, zone and interact callbacks, `w.after` and `w.wait`, and code after `await w.say(...)` or `await w.ask(...)`. `w.on('frame')` does not run in a replay, so it is for visuals only.
- **Use the engine's clock and dice:**
  - `w.time` and `w.ticks`, never `Date` or `performance.now`.
  - `w.rand(seed)`, never `Math.random`.
  - `w.after` and `w.wait`, never `setTimeout` or `setInterval`.
- **Math:** `Math.sin`, `cos`, `tan`, `atan`, `atan2`, `asin`, `acos`, `exp`, `hypot` and `sqrt` are deterministic across browsers; the engine installs portable versions. Avoid `**`, `Math.pow`, `Math.log` and the hyperbolic functions, and multiply instead.
- **Await only** `w.say`, `w.ask` and `w.wait`. Keep `'leave'` handlers synchronous: they are the last thing a run records.
- **Storage:** `w.store.set` saves values as JSON, so store plain data.
- **No browser APIs:** a world talks to the engine only through `w`.

`npm run build` rejects modules that use `Math.random`, `Date`, timers, `**` or browser APIs.

To test your world, play it, press **R** and choose **Verify so far**. Or record proofs with `python3 tools/proof_test.py` and check them with `node tools/verify.mjs`.

## Levels: worlds as data (anyone can publish)

You don't need to write code to make a world. A **level** is a JSON file in format `elsewhere-level/1`.
- The engine turns it into a world with one fixed template, so a level cannot run code of its own. That is why anyone can publish one.
- A published level appears at the Creator's Gate in Junction, and runs in it are verifiable like any world.
- A complete example: [`levels/lantern-steps.json`](levels/lantern-steps.json).

```js
{
  "format": "elsewhere-level/1",
  "name": "My Level", "blurb": "One line.", "theme": "day",   // day | dusk | night | cave | candy
  "spawn": [0, 0, 0, 180],            // x, y (the floor you stand on), z, facing in degrees; a start platform and the portal home are added behind it
  "goal": [0, 6, -60],                // the golden flag: reach it to clear the level (records your time)
  "parts": [                          // solids: box, ramp, cyl, sphere, cone; decoration only: torus, oct, ico
    { "s": "box", "p": [0, -0.5, -9], "z": [5, 1, 14], "y": 0, "c": "#4b4f83" },
    { "s": "sphere", "p": [3, 2, -4], "z": [0.5, 0.5, 0.5], "c": "#ffd166", "g": 2, "n": 1 }   // g glow, m metal, o opacity, n 1 = no collider
  ],
  "things": [
    { "t": "pad", "p": [0, 2, -28], "power": 18, "push": [0, -7] },
    { "t": "boost", "p": [0, 0, -5], "y": 180 },
    { "t": "checkpoint", "p": [2, 5, -40], "y": 180 },
    { "t": "crumble", "p": [5, 4.8, -40], "z": [2.4, 0.4, 2.4] },
    { "t": "mover", "p": [0, 6, -63], "z": [3, 0.5, 3], "to": [0, 6, -75], "speed": 2.5 },
    { "t": "hazard", "p": [0, 1, -30], "z": [4, 1, 1] },
    { "t": "wind", "p": [0, 4, -50], "z": [4, 6, 4], "f": [0, 25, 0] },
    { "t": "sign", "p": [-3, 0, -2], "y": 150, "title": "HELLO", "text": "Up to 240 characters." },
    { "t": "label", "p": [0, 10, -60], "text": "THE END" }
  ]
}
```

- **Units:** metres and degrees, as everywhere in the API. `p` is a centre, `z` a size and `y` a yaw. Numbers are rounded to centimetres.
- **Limits:** coordinates within ±400 m, 1,500 parts, 300 things.
- **Identity:** a level's id (`lv-…`) and its module's SHA-256 come from its content.
- **Publish:**
  1. Paste the level into the Creator's Gate (or build it in the Builder, once it exists) and play it.
  2. Reach the flag, then leave the level.
  3. Press **Publish**.
- **What happens next:** your level and your verified clear run go to the public relays. The validator compiles the level and replays your clear run on it. If it holds up, the level joins the ledger and the Gate lists it for everyone.

## Items, traits and rules

Items are **data**. A world declares new items in its `items` map:

```js
items: {
  'frost-boots': {
    name: 'Frost Boots', slot: 'feet', traits: ['speed'], rarity: 'rare',
    desc: 'Run faster on foot.',
    look: [{ s: 'rbox', size: [0.27, 0.16, 0.38], pos: [0, 0.01, 0.01], color: '#bde0fe' }],
  },
}
```

- `slot` is one of head, back, hand, feet or board, or null for things you carry, like keys.
- A `look` is a list of parts. `s` is box, rbox, cyl, cone, sphere, torus, oct or ico. Each part takes `size` or `r`/`h`/`tube`, plus `pos`, `rot`, `color`, `glow` and `metal`.
- **Traits are behaviour.** The engine implements these: `glide`, `doublejump`, `light`, `board`, `speed`, `cosmetic` and `key`. `blade` (the Katana's) is a shared convention: worlds with something to hit read it to scale strike damage. A world can also give meaning to its own trait names in its tick handler, using `w.has(id)` or `w.itemInfo(id).traits`.
- **Rules decide what works where.** `rules: { deny: ['glide'] }` switches gliding off in this world. `rules: { allow: ['cosmetic', 'light'] }` switches off everything else. Cosmetics are allowed unless explicitly denied. Players see which of their items are active in the items panel.

Item ids are global, so the build rejects two worlds defining the same id. This is what lets a glider won in one world keep gliding in another.

## Theme

```js
theme: {
  skyTop: '#2f6fd6', skyHorizon: '#cdeeff', skyBottom: '#eef8ff',
  sunDir: [0.35, 0.75, -0.55], sunColor: '#fff2c8', sunIntensity: 3, sunSize: 2,
  hemiSky: '#cfe6ff', hemiGround: '#7a9a6a', hemiIntensity: 1.5,
  fog: [140, 560], fogColor: '#cdeeff', stars: 0, bloom: 0.35, exposure: 1.0,
  clouds: { y: -34, color: '#ffffff', opacity: 0.9 },   // optional cloud sea
}
```

`music` takes `{ root (MIDI note), scale: 'major'|'minor'|'dorian'|'lydian'|'phrygian', bpm, progression: [scale degrees], sparkle (0-1), bright (filter Hz), pulse (true adds a beat) }`.

## Testing

```sh
npm run build
python3 tools/shot.py --world my-world --steps "wait:1;shot:a;tp:0,5,0;key:KeyW:1;shot:b"
```

Screenshots go to `shots/`. The script exits non-zero on page errors. In the browser, `EW.debug.tp(x, y, z)`, `EW.debug.state()` and `EW.debug.give('glider')` help.

## What's coming

Worlds will be published by anyone: a world's hash and author signature go on the chain, and the registry becomes ledger state. Validators replay submitted proofs of play with the pinned module. Third-party world code will then run in a sandbox (a worker with the same `w` API). Keep your world to the API and the rules above, and it will keep working.
