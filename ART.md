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

7. **The interface follows the look** (2026-11-23).
   - Panels are warm navy glass (`#25344a`) with cream text, thin gold lines, teal for things you can press and coral-to-gold for the one main button.
   - Headings, names and the logo are set in Fredoka, a rounded, chunky face; body text is Inter. In-world labels and signs use Fredoka too.
   - The loading screen is Junction's golden-hour sky with a floating island; on a first visit the title sits over the live plaza while the camera circles it.

## Characters and the wardrobe (2026-11-24)

Players and the worlds' characters share one kit of looks (`src/engine/looks.js`): six body styles (the classic Bot, Round, Block, Tall, Little and Bean, a two-tone capsule toy), faces, ears and horns, tails, eleven outfits and a few extras. They follow the rules above:
- chunky primitives in flat colour; cloth is matte, and the Glossy finish is toy plastic, not chrome;
- metal only on small trim (buttons, buckles, a necklace);
- only the eyes glow (a visor, eyes, one eye), the character's signature; big cartoon eyes don't glow at all;
- each world dresses its people in its own palette: Thyra's islanders in tunics and robes of dyed wool, Glowcave's keepers in deep violet with lantern gold, Vex in black and neon.

## Palettes

| World | Light | Palette |
|---|---|---|
| Junction | golden hour | warm cream stone, terracotta, aged-copper teal, coral, gold trim, leaf greens |
| Skyreach | bright midday | meadow greens, warm earth, faceted rock, sky blue |
| Glowcave | night, underground | deep blue-violet faceted rock, teal and cyan glow (the glow is its gameplay: lanterns, glowcaps, crystals) |
| Neon Circuit | night | navy, magenta and cyan neon (the track lights are its gameplay) |
| Crystal Rush | bright day | candy pastels on indigo |
| Spire Clash | late afternoon | olive savanna, sandstone, team colours |
| The Origin | night, blueprint | white lines that paint themselves in colour as you cross |

**Status:** every world follows these rules (2026-11-22). None uses a photographed texture, sky or model any more, and those files are gone from `docs/assets/`. What replaced them is in NOTES (the log for 2026-11-22). Outside Junction, which was rebuilt, every replacement kept the collider of what it replaced, so play is unchanged; only a few signs with shorter text changed size.

**Where shiny things get their reflections:** with no photographed skies, the engine renders each world's painted sky once into an environment map. Metal (the crown, a katana, gold trim) then reflects that world's own sky instead of rendering black.

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
