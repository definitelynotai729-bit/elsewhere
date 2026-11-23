# Art direction: one look for all of Elsewhere

The owner (2026-11-22): "Pick an aesthetic and stick with it. Clean up the home planet."

## The look

**Bright, chunky, low-poly.** Simple shapes in flat, clean colours under soft, warm light: a handmade toy world. Every world follows the same rules below; each keeps its own palette and time of day, so worlds still feel different from each other.

## Why this one

- **It is what the game already is at heart.** These already use it:
  - the characters players wear (the KayKit packs) and the player avatar;
  - Crystal Rush, Spire Clash's arena and the Origin.

  The photographed textures and scanned statues are what made the game look mixed.
- **It runs well on phones and downloads fast.** There are no photo textures, photographed skies or scanned models.
- **The Builder's blocks fit it,** so levels made by players match the game.
- **Realism was tried and dropped.** The attempts were scanned models, photo textures, HDR skies and a Gaussian-splat study (NOTES G11). Realism needs scanned content for everything, clashes with the toy characters, and is heavy on phones.
- **Photo mode and the ultra preset stay.** A path-traced toy world photographs beautifully.

## The rules

1. **Shapes.** Keep them chunky, simple and a little exaggerated.
   - Nature is faceted: rocks, trees and crystals use `low: true, flat: true` on spheres, and a few `sides` on cylinders and cones.
   - Made things are clean boxes and cylinders.
   - No photographed or scanned models.
2. **Materials.** Use flat, matte colour (the default roughness).
   - No photo textures (`texture:`) in the game's own worlds.
   - Metal only for small trim, like a gold band or a door, never on a big surface.
3. **Colour.** Each world has a palette of a few colours: a `C` object at the top of its file. Big surfaces are calm and light; small things carry the saturated colour.
4. **Glow means "this is for you".**
   - Bright glow (above 1, which blooms) goes only on things the player can use or collect: portals, coins, pickups, Echoes, pads, a target, a hazard.
   - Lamps and windows may be gently self-lit (glow 0.6 or less, which does not bloom).
   - Never put glow on floors, walls, trim or trees.
5. **Light.**
   - A painted gradient sky (the theme's sky colours), with no photographed HDR skies.
   - One sun with soft shadows, high enough that shadows don't stripe the floor.
   - A sky-tinted fill light.
   - Fog in the horizon colour, for depth.
6. **Words.**
   - One name over each place you can use (`w.label`, size 0.5); portals and characters already show theirs.
   - Instructions go in the objective line, in dialogs, and on a few "Read" signs with a title and a sentence or two.
   - No signs that repeat the controls.

## Palettes

| World | Light | Palette | Status |
|---|---|---|---|
| Junction | golden hour | warm cream stone, terracotta, aged-copper teal, coral, gold trim, leaf greens | **done** (2026-11-22) |
| Skyreach | bright midday | meadow greens, warm earth, sky blue, white cloud | to do: replace its photographed sky, jacaranda trees, textures, mossy rocks and ferns |
| Glowcave | night, underground | deep blue-violet stone, teal and cyan glow (the glow is its gameplay: lanterns, glowcaps) | to do: replace its textures, moon rocks and ice plants |
| Neon Circuit | night | navy, magenta and cyan neon (the track lights are its gameplay) | to check: already flat |
| Crystal Rush | bright day | candy pastels | to do: drop its plaster texture and photographed sky |
| Spire Clash | late afternoon | sand, sandstone, team colours | to do: replace its photographed boulders, quiver trees, barrels, shields and lantern |
| The Origin | night, blueprint | white lines that paint themselves in Junction's palette | to check |

When every world is converted, delete the photo assets nothing uses any more from `docs/assets/` and `CREDITS.md`.

## Junction, the home world

A sunlit stone plaza on a floating island at golden hour.
- **The Vault** stands at the centre: cream stone, a gold door and an aged-copper dome.
- **Six avenues** run out from it. Five lead to the world portals, evenly spaced, each framed in the plaza's stone. The sixth is the arrival, with the Creator's Gate behind it.
- **Between the avenues** are the places you come back to:

| Where (from the arrival, facing the Vault) | What |
|---|---|
| Front left | Wren the guide, the world map (a turning globe) |
| Left | the arcade (Siegeworks) and the Leaderboards board |
| Back left | the fountain garden, and the jump pad up the sky path of floating rocks |
| Back | the Neon Circuit portal |
| Back right | the training yard: straw dummies and the slime pen |
| Right | Pim's shop, under a striped awning |
| Front right | the Junction Cup: a ball by the arrival and a hoop |
| Behind the arrival | the Creator's Gate (community worlds) |

What it replaced:
- the scanned statues, Victorian lamps, photographed marble and the HDR sunset;
- glowing candy trees, and neon rings on the floor and walls;
- two empty arcade cabinets;
- a welcome board that repeated the controls;
- six floating instruction labels.
