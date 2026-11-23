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

Each returns a handle `{ mesh, col, hide(), show(), remove() }`. All take `pos`, `color`, plus optional `yaw` or `rot: [x, y, z]` (degrees), `glow` (emissive strength; 1.5 and above blooms), `emissive` (a separate glow colour, so a part can be dark but glow), `metal`, `rough`, `opacity`, `texture` and `tile` (a photographed material; see [Textures](#textures)), `collide: false` (decoration only), `invisible: true` (collision only: the part is not drawn), `shadow: false` and `scale: [x, y, z]` (stretches the visual only, so use it with `collide: false`).

| call | shape |
|---|---|
| `w.box({ pos, size: [x, y, z] })` | box |
| `w.cylinder({ pos, radius, height, sides })` | cylinder (`sides` 3 to 64 for a faceted one; default smooth) |
| `w.sphere({ pos, radius, low, dome })` | sphere (`low: true` is a faceted icosahedron; `dome: true` is only the upper half, with a matching collider, for roofs you can stand on and stand under) |
| `w.cone({ pos, radius, height, sides })` | cone (`rot: [180, 0, 0]` points it down; `sides: 4` is a pyramid) |
| `w.ramp({ pos, size: [w, h, len], yaw })` | wedge rising toward its local +z |
| `w.model({ pos, yaw, scale, parts })` | decoration from a list of parts (same format as item looks) |
| `w.add(object3d)` | escape hatch: add any three.js object (`w.THREE` is available) |

Static parts are merged into a few draw calls automatically (one per material), so hundreds or thousands of boxes are fine. `w.model` parts are not merged, so prefer the solids above for anything you repeat a lot.

### Textures

The game's own worlds don't use these: their look is flat colour (ART.md). They stay available to levels and worlds that want them.

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

### Models and skies (the asset library)

Like textures, these are outside the game's own look (ART.md) and available to other worlds.

Real 3D models and photographed skies, all CC0. `tools/assets.py` fetches them from Poly Haven, slims them and pins each by SHA-256 in `docs/assets/manifest.json`; `CREDITS.md` names the artists.

- **`w.asset(id, { pos, yaw, scale, collide, fallback })`** places a model as scenery; it appears once loaded. Gameplay never depends on the model.
  - `collide: { box: [x, y, z] }` or `{ cyl: [radius, height] }` (optionally `at: [dx, dy, dz]`) adds a plain collider of that size, now, so every machine simulates the same world.
  - `fallback`: item-look parts (in metres) shown instead if the model can't load.
  - `detail: true` marks heavy decoration a struggling device can do without. At low graphics quality it shows its `fallback`, or nothing. Give anything solid a fallback, so its collider is never invisible.
  - Pair it with invisible parts to keep an old shape's collision under a new look. Skyreach's trees do this: real trees to see, the same trunk and canopy to stand on.
- **`invisible: true`** on any solid part keeps its collider and hides the part.
- **`theme.sky: '<id>'`** lights the world with a photographed sky (reflections included).
  - `skyBackdrop: false` keeps the painted sky and uses the photo only for light; worlds with a bright sun usually want this, or its sun glares.
  - `envIntensity` (default 0.7), `skyBrightness` and `skyRotate` (degrees) tune it.
- **Adding an asset:** list it in `assets/sources.json` (its Poly Haven id) and run `python3 tools/assets.py --only <id>`. The options:
  - `simplify` (the triangle ratio);
  - `aggressive` (for modelled foliage: thousands of separate leaves only simplify this way);
  - `tex` (a smaller texture size, e.g. 256 for foliage).

## Motion

- `w.mover(part, { path: [[x, y, z], ...], speed, pause, loop, offset })` turns a box or cylinder into a moving platform. Players ride it. `offset` (0 to 1) shifts the starting point along the path.
- `w.crumble(part, { delay: 0.5, respawn: 3 })`: the part falls shortly after a player lands on it, then comes back.
- `w.spin(handleOrObject, { axis: 'y', speed })` rotates it. Use for decoration, not for platforms you stand on.

## Gameplay pieces

| call | what it does |
|---|---|
| `w.portal({ pos, yaw, to, label, subtitle, color, frame, arrive, requires, lockedText })` | Doorway to another world (`to` is a world id). Arrivals appear `arrive` metres (default 10) in front of the portal that leads back, facing away from it. `subtitle`: a short status line under the name (none by default; the world's blurb is in the Worlds panel). `frame`: the ring and base in a colour of your world (stone, say) instead of dark metal. `requires()`: return false to keep it shut, showing `lockedText` to whoever walks in. |
| `w.checkpoint({ pos, yaw })` | A beacon. Touching it sets the respawn point. |
| `w.coin({ pos, value, kind: 'gem' })` | Collectible. Each coin pays once per player and is remembered. |
| `w.pickup({ pos, item, scale, onPick })` | Gives an item (once per player by default). |
| `w.jumpPad({ pos, power, push: [vx, 0, vz] })` | Launches the player. `push` adds a horizontal velocity. |
| `w.boostPad({ pos, yaw, power, time })` | Speed boost in the pad's direction (strong on a board). |
| `w.wind({ pos, size, force: [x, y, z] })` | Pushes the player while inside the box. |
| `w.hazard({ pos, size or radius })` | Touching it sends you back to the checkpoint. |
| `w.zone({ pos, size or radius, yaw, onEnter, onExit, onStay, once })` | Trigger volume for your own logic (`yaw` rotates a box zone). |
| `w.interact({ pos, radius, label, onUse })` | Shows "F · label" nearby. `onUse` may be async. |
| `w.npc({ pos, yaw, name, colors, hat, character, lines or onTalk, wave })` | A character you can talk to. `character: 'mage'` dresses it as one of the rigged characters below. |
| `listed: false` (a world module field) | A secret world: it gets no portal in Junction's ring and no entry in the Worlds menu. The way in is a portal another world opens (the Origin, from the Vault). The world should still guard itself, since anyone can type its id in the URL. |
| `w.echo({ id, pos, line, next, hidden })` | One of the Founder's Echoes (the hunt in GAME.md). It stays dim and silent until the hunt has begun (flag `hunt.started`, set at the Echo Stone in Junction's Vault). Then touching it gives the item `echo-<id>` (Junction defines the items) and the flag `echo.<id>`, shows the Founder's `line`, and then the riddle `next` as the objective. Players wearing the Founder's Crown see a signal that grows as they near an Echo they haven't found. `hidden: true` keeps it away (unseen, untouchable, unsensed) until the world calls `.reveal()` after a feat; reveal it at build time too if the feat is already in the world's store. Returns `{ id, found, shown, reveal() }`. Event: `'echo'` (id). |
| `w.player.hearts`, `w.player.heal(n)`, `w.player.setMaxHearts(n)` | Hearts, in worlds with foes (three by default, full on every visit). With none left you wake at your last checkpoint with full hearts. |
| `w.enemy({ kind, pos, yaw, id, patrol, leash, respawn, drops, hp, speed, sight, reach, damage, color, scale })` | A foe (`'slime'`, `'crawler'` or `'brute'`): it patrols (`[[x, z], ...]`) or stands guard, chases you in sight, winds up a visible attack and hits for hearts. Step back to dodge, or strike (key 1) to interrupt. A blade does 34 damage, bare hands 6. It gives up past `leash` metres from home. `respawn`: seconds until it returns (default never). `drops`: coins the first time it falls, once per player. Events: `'defeat'` (id, kind), `'hurt'` (hearts left), `'knockout'`. Returns `{ id, kind, hp, alive, state, pos, defeat(), revive() }`. |
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
- Other helpers: `w.time` (seconds since the world loaded), `w.rand(seed)` (deterministic RNG with `.range`, `.int` and `.pick`), `w.travel(id)`, `w.worlds` (the registry list: `id`, `name`, `blurb`, `color`, `author`, and `listed`, false for a secret world) and `w.setKillY(y)`.

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
  1. Build the level in the Builder (below), or paste it into the Creator's Gate, and play it.
  2. Reach the flag, then leave the level.
  3. Press **Publish** at the Gate.
- **What happens next:** your level and your verified clear run go to the public relays. The validator compiles the level and replays your clear run on it. If it holds up, the level joins the ledger and the Gate lists it for everyone.

**Rewards: creator items (format `elsewhere-level/2`).** A level can give everyone who clears it an item of your making. Add a `reward` and the level becomes format 2 (levels without one stay format 1 and compile exactly as before):

```js
"reward": {
  "name": "Lantern Crown", "desc": "For climbing the lantern steps.",   // up to 24 and 120 characters
  "slot": "head",                                                        // head | back | hand
  "look": [                                                              // 1-16 parts in the item-look format, each within 0.9 m
    { "s": "cyl", "r": 0.23, "h": 0.12, "pos": [0, 0.06, 0], "color": "#ffd166", "metal": 0.8 },
    { "s": "sphere", "r": 0.04, "pos": [0, 0.07, 0.23], "color": "#ff5d8f", "glow": 1.2 }
  ]
}
```

- **Cosmetic only.** The item always has the trait `cosmetic`. It shows in every world, and its card says who made it and which level gives it.
- **Identity.** The item's id is the level's id plus `-r` (for example `lv-58aa35c96b-r`), so nobody can mint another creator's item, or a first-party one.
- **Verified everywhere.** The level's module defines the item, so every visit by someone who owns it pins that module. Any verifier replays a run in Junction with the item worn by loading the module by hash, as it does any world. An item can only be equipped while its level is pinned. If a level finishes loading after a visit begins, its item can be equipped from the next world on.
- **In the Builder:** the menu's *Reward for clearing* section offers ready-made looks in two colours of your choice: crown, horns, wizard hat, halo, wings, banner, wand and sword.

**Models: your own 3D files (format `elsewhere-level/3`).** Import any `.stl` or `.glb` in the Builder (Esc, *Import a model*) and place it with Shift+7.

```js
{ "s": "mesh", "h": "<sha256 of the model>", "p": [0, -1.2, -7], "y": 0, "k": 10,   // k: its largest side, in metres
  "c": "#ffd6a5",                                                                    // optional tint
  "hull": [[-0.4, 0, -0.5], [0.4, 0, -0.5], …] }                                       // optional: 4-48 points, makes it solid
```

- **Import.**
  1. The file becomes one canonical compact mesh (`elsewhere-mesh/1`, in `src/engine/mesh.js`): quantised positions, indices and optional vertex colours.
  2. It is normalised: centred, resting on y = 0, with a largest side of 1.
  3. If it is heavier than that, meshoptimizer simplifies it to 20,000 triangles and 300 KB at most.
  4. The SHA-256 of those bytes is the model's name. The same file always gives the same name.
- **Presentation, except the hull.**
  - A model only shows. It is fetched by its hash, checked, and drawn; a see-through block stands in while it loads, or if no relay has it.
  - To make it solid, the part carries a small convex **hull** (up to 48 points, as data), and the template turns it into a collider. The Builder computes the hull at import; N switches solid or scenery.
  - Validators replay a level without ever loading a model.
- **Hosting.**
  - The site never stores model bytes.
  - Publishing sends them to the public Nostr relays as gzip+base64 chunks: kind 30078, tagged `elsewhere-blob`, with `x` set to the hash. Each copy is checked against the hash, so a relay can drop a model but never change one.
  - Browsers cache what they fetch. The validator admits a level only if every model it names is on the relays.
- **Limits:** 64 placed models and 8 different models per level.
- **Nothing is banned.** Validators check form, never content. Each player chooses what they see: *Hide* (a level) and *Hide creator* at the Creator's Gate, kept in that browser.

**The Builder** makes levels without writing JSON. At the Creator's Gate, press **Open the Builder**. It is played with the keyboard (a mouse is optional), and the world you were in pauses while it is open.
- **Cursor:** W A S D or the arrows move it on the grid, relative to the view; R and F (or Page Up and Page Down) raise and lower it; G switches the grid between 1, 0.5 and 0.25 m.
- **Pieces:** 1 box, 2 ramp, 3 cylinder, 4 sphere, 5 jump pad, 6 boost pad, 7 checkpoint, 8 crumbling tile, 9 moving platform, 0 hazard; Shift+1 sign, Shift+2 goal flag, Shift+3 spawn point, Shift+4 cone, Shift+5 updraft, Shift+6 label. Tab cycles through them.
- **Shape:** Q and E turn the piece 15°; + and − resize it; Shift with W A S D R F stretches it along one axis (on a jump pad: power and throw); C cycles the colour; B the glow; X copies the piece under the cursor.
- **Build:** Enter or Space places, Backspace or Delete removes the piece under the cursor, Z undoes, Y redoes. Platforms (boxes, cylinders, crumbling tiles, moving platforms) put their top at the cursor, so floors land at the height you stand on; everything else stands on the cursor. A moving platform then asks for its end point, and a sign for its text.
- **View:** J and L turn the camera, I and K tilt it, U and O zoom, T looks from above, Home resets.
- **Level:** P test-plays it through `E.playLevel`, with your name and key, like the Gate. Esc opens the menu: name, blurb, theme, drafts (several, kept in your browser), export and import as JSON, Publish, and Exit. In a level you are testing, Esc then Enter takes you back to the Builder.

Everything the Builder makes is already in the form `checkLevel()` gives, so an exported file passes it unchanged.

## Characters (the body slot)

An item with `slot: 'body'` and `character: '<id>'` swaps the default robot for a rigged, animated character. Junction's shop sells seven: `knight`, `barbarian`, `mage`, `rogue`, `robot`, `skeleton-warrior` and `skeleton-mage` (all CC0; see CREDITS.md).
- **Presentation only.** The collider, physics and everything a replay checks stay the same, and replays never load a character. In a world whose rules deny `cosmetic`, the wearer shows as the default robot.
- **Animation.** Characters play idle, walk, run, jump and strike clips from the same state the robot uses. Walk and run keep pace with the ground speed, and key 1 plays the strike clip.
- **Other items still show.** Item slots move onto the character's bones:
  - Hats sit on its head and replace its own helmet or hat.
  - Hand items go in its weapon hand.
  - Back items sit on its back and replace its cape.
- **Icons.** `icon: 'assets/characters/<id>.png'` gives any item a portrait image for the shop and items panel. `iconRot: [x, y, z]` (degrees) turns an item's rendered icon, for example a blade shown diagonally.
- **Adding a character.**
  1. List it in `assets/characters.json`. The entry needs:
     - its source, as a pinned commit (the SHA-256 is recorded on the first fetch);
     - the hand props to strip;
     - the headwear and backwear meshes;
     - a rig entry mapping each state (idle, walk, run, jump, strike, cheer, use) to a clip, and the slots to bones.
  2. Run `python3 tools/characters.py`. It keeps only those clips and packs the file to about 150 KB.
  3. Run `python3 tools/char_portraits.py` for the icon.

## Verified ownership (continuity)

What a player owns comes only from verified play. Every visit is a signed proof in the player's chain, and the validator keeps each player's verified state. A run counts only if it starts from exactly that state.

What this means for world code:
- **Coins, items, records and flags must come from the simulation:** collisions, timers and the player's inputs.
- **Arcade results are not verified.** A cabinet's game runs outside the simulation, so its result is whatever the player's browser says. A world may show it, but the engine refuses `addCoins`, `give`, `record` and `setFlag` while an arcade result is handled.
- **Bug fixes are effective at once.** When world code changes, the validator admits new runs on the new version (and the previous one for 24 h, for open tabs). A version with an exploitable bug can be revoked in `docs/worlds/history.json`.

See SECURITY.md for every attack and its test.

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
