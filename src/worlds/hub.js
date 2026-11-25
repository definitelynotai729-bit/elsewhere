// Junction, the home world: a sunlit stone plaza floating above the clouds. The Vault stands at its heart, five portals
// ring it, and between the portals are the places you come back to: the shop, the training yard, the arcade and the
// leaderboards, the fountain garden, the Junction Cup and the world map.
// The look follows ART.md: chunky shapes, flat colours, soft warm light, and glow only on what you can use.
// Like every world, it is a module that only talks to the engine through `w`.
const SIGILS = [
  { key: 'sky', name: 'Sigil of the Sky', color: '#8fd3ff', world: 'Skyreach' },
  { key: 'deep', name: 'Sigil of the Deep', color: '#3dffc5', world: 'Glowcave' },
  { key: 'speed', name: 'Sigil of Speed', color: '#ff4fd8', world: 'Neon Circuit' },
];
const SITE_SIEGE = 'https://definitelynotai729-bit.github.io/siege-works/';
// The Founder's hunt (GAME.md): each Echo is hidden in a world (w.echo there), and its riddle is shown here first.
const ECHOES = [
  { id: '1', name: 'Echo I', world: 'Skyreach', riddle: 'Echo I: "I planted a garden in the sky, and hid my voice where its roots should be." Find the Cloud Garden in Skyreach, then look beneath it.' },
  { id: '2', name: 'Echo II', world: 'Glowcave', riddle: "Echo II: \"Where the lake keeps a second sky, I left my second word. Trust what the water shows you.\" Mirror Lake, in Glowcave." },
  { id: '3', name: 'Echo III', world: 'Neon Circuit', riddle: "Echo III: \"I was fastest once. Beat my lap, the Neon Circuit track record, then look in the cyan garage.\"" },
  { id: '4', name: 'Echo IV', world: 'Crystal Rush', riddle: "Echo IV: \"Twenty-five crystals in one round of Crystal Rush, and I will wait above the tower. Look up.\"" },
  { id: '5', name: 'Echo V', world: 'Spire Clash', riddle: "Echo V: \"My last word is for whoever topples a rival spire. Win a battle in Spire Clash, then come home to your fountain.\"" },
];
// Season 1 of the hunt (GAME.md): Before the Door. A crayon drawing pinned inside the Vault starts it, for anyone whose
// hunt has begun. Five more Echoes, in the worlds that came after the first hunt; the last of them gives the Paper Crown
const ECHOES_S1 = [
  { id: '6', name: 'Echo VI', world: 'Underfoot', riddle: 'Echo VI: "Before I built anything, I drew. I kept my drawings where only the dust goes: on top of a wardrobe, in a room where you are very small." Underfoot.' },
  { id: '7', name: 'Echo VII', world: 'Thyra', riddle: 'Echo VII: "The first story I loved was an island that fed strangers before it asked their names. I sat where its smoke goes up." The Stranger\'s Hearth, Thyra.' },
  { id: '8', name: 'Echo VIII', world: 'Pterousa', riddle: 'Echo VIII: "I wanted to fly, and settled for gliding. I left a word where the highest goat in the Isles chews feathers." Gull Pillar, Pterousa.' },
  { id: '9', name: 'Echo IX', world: 'Halcyon Point', riddle: 'Echo IX: "Make the Giant\'s wave once, all the way to the channel. Then find the child who builds it out of sand." Halcyon Point.' },
  { id: '10', name: 'Echo X', world: 'Underfoot', riddle: 'Echo X: "The last door I drew was the one I walked through. Glide to it, all the way across the room where you are small." The crayon door, Underfoot.' },
];
const FAINT = 'The next echo is still too faint to follow. The hunt continues in a coming update: check back at the Echo Stone in the Vault.';

// Junction's palette (ART.md): light, calm surfaces; small things carry the colour.
const C = {
  stone: '#ecdcc0', stone2: '#dfc8a5', cream: '#f8ecd6', sand: '#d8b98d', clay: '#c47f58', clay2: '#a1654a',
  wood: '#a8774f', wood2: '#7a5238', teal: '#3aa99c', copper: '#5fb5a3', coral: '#e8735a', gold: '#e0b04f',
  leaf: '#6bab55', leaf2: '#8cc463', leaf3: '#4f8d4a', grass: '#8cc368', navy: '#2f4561', water: '#5ec9c1',
  flower: ['#ff8fa3', '#ffd166', '#fff4e2', '#c9a7ff'],
};
const GOLD = { color: C.gold, metal: 0.3, rough: 0.45 };

const ITEMS = {
  cap: { name: 'Ball Cap', slot: 'head', traits: ['cosmetic'], rarity: 'common', desc: 'A classic. Red, because of course.',
    look: [{ s: 'cyl', r: 0.31, h: 0.14, pos: [0, 0.04, 0], color: '#ef233c' }, { s: 'box', size: [0.4, 0.03, 0.26], pos: [0, -0.01, 0.34], color: '#ef233c' }, { s: 'sphere', r: 0.04, pos: [0, 0.12, 0], color: '#ffffff' }] },
  antenna: { name: 'Antenna', slot: 'head', traits: ['cosmetic'], rarity: 'uncommon', desc: 'Picks up signals from other worlds. Probably.',
    look: [{ s: 'cyl', r: 0.025, h: 0.42, pos: [0, 0.21, 0], color: '#c0c6dd', metal: 0.6 }, { s: 'sphere', r: 0.075, pos: [0, 0.45, 0], color: '#ff4fd8', glow: 2.6 }] },
  partyhat: { name: 'Party Hat', slot: 'head', traits: ['cosmetic'], rarity: 'common', desc: 'Every day is a launch day.',
    look: [{ s: 'cone', r: 0.2, h: 0.48, pos: [0, 0.24, 0], color: '#ffd23f' }, { s: 'sphere', r: 0.07, pos: [0, 0.5, 0], color: '#ff4fd8', glow: 1.2 }, { s: 'cyl', r: 0.17, h: 0.05, pos: [0, 0.1, 0], color: '#3ec8ff' }] },
  tophat: { name: 'Top Hat', slot: 'head', traits: ['cosmetic'], rarity: 'rare', desc: 'For distinguished explorers.',
    look: [{ s: 'cyl', r: 0.37, h: 0.04, pos: [0, 0.02, 0], color: '#1b1b24' }, { s: 'cyl', r: 0.24, h: 0.44, pos: [0, 0.24, 0], color: '#1b1b24' }, { s: 'cyl', r: 0.245, h: 0.07, pos: [0, 0.08, 0], color: '#c1121f' }] },
  halo: { name: 'Halo', slot: 'head', traits: ['cosmetic'], rarity: 'epic', desc: 'Glows. That is the whole point.',
    look: [{ s: 'torus', r: 0.27, tube: 0.045, pos: [0, 0.3, 0], rot: [90, 0, 0], color: '#ffe066', glow: 2.8 }] },
  ...Object.fromEntries(ECHOES.map((x) => ['echo-' + x.id, { name: x.name, slot: null, traits: ['key'], rarity: 'legendary', desc: `One of the Founder's Echoes, a piece of their voice (${x.world}). Bound to whoever found it.`,
    look: [{ s: 'ico', r: 0.22, color: '#fff3d6', glow: 1.4 }, { s: 'torus', r: 0.34, tube: 0.025, rot: [90, 0, 0], color: '#9fe7ff', glow: 1.2 }] }])),
  ...Object.fromEntries(ECHOES_S1.map((x) => ['echo-' + x.id, { name: x.name, slot: null, traits: ['key'], rarity: 'legendary', desc: `One of the Founder's Echoes, from Season 1: Before the Door (${x.world}). Bound to whoever found it.`,
    look: [{ s: 'ico', r: 0.22, color: '#fff3d6', glow: 1.4 }, { s: 'torus', r: 0.34, tube: 0.025, rot: [90, 0, 0], color: '#ffb36b', glow: 1.2 }] }])),
  'paper-crown': { name: 'Paper Crown', slot: 'head', traits: ['cosmetic'], rarity: 'legendary', desc: 'The crown a child folds out of a drawing. For finding all five Echoes of Season 1: Before the Door.',
    look: [{ s: 'cyl', r: 0.285, h: 0.12, pos: [0, 0.06, 0], color: '#fdfbf6' }, { s: 'cyl', r: 0.29, h: 0.03, pos: [0, 0.03, 0], color: '#e2574c' },
      ...[0, 60, 120, 180, 240, 300].map((a, i) => ({ s: 'cone', size: [0.075, 0.2, 0.025], pos: [Math.sin(a * Math.PI / 180) * 0.27, 0.22, Math.cos(a * Math.PI / 180) * 0.27], rot: [0, a, 0], color: ['#fdfbf6', '#f6c945', '#fdfbf6', '#4a8fe0', '#fdfbf6', '#4fb286'][i] }))] },
  crown: { name: "Founder's Crown", slot: 'head', traits: ['cosmetic'], rarity: 'legendary', desc: 'Proof you opened the Vault in Junction. Wear it and you can sense the Founder\'s Echoes.',
    look: [{ s: 'cyl', r: 0.29, h: 0.14, pos: [0, 0.07, 0], color: '#ffc93c', metal: 0.85, rough: 0.3 },
      ...[0, 72, 144, 216, 288].map((a) => ({ s: 'cone', r: 0.065, h: 0.17, pos: [Math.sin(a * Math.PI / 180) * 0.25, 0.22, Math.cos(a * Math.PI / 180) * 0.25], color: '#ffc93c', metal: 0.85, rough: 0.3 })),
      { s: 'sphere', r: 0.045, pos: [0, 0.08, 0.29], color: '#ff3b6b', glow: 2 }] },
  katana: { name: 'Katana', slot: 'hand', traits: ['blade'], rarity: 'epic', iconRot: [0, 0, -45],
    desc: 'A folded-steel blade. Press 1 to strike: it deals damage wherever a world has something to hit, like the training dummies in the training yard. In Spire Clash it adds attack damage.',
    look: [{ s: 'cyl', r: 0.028, h: 0.24, pos: [0, 0.02, 0], color: '#26202a', rough: 0.9 },
      { s: 'cyl', r: 0.066, h: 0.022, pos: [0, 0.15, 0], color: '#c9a227', metal: 0.85 },
      { s: 'box', size: [0.018, 0.46, 0.05], pos: [0, 0.39, 0], color: '#eef2f8', metal: 0.95, rough: 0.15 },
      { s: 'box', size: [0.016, 0.34, 0.045], pos: [0, 0.78, 0.025], rot: [7, 0, 0], color: '#eef2f8', metal: 0.95, rough: 0.15 },
      { s: 'cone', r: 0.022, h: 0.1, pos: [0, 0.99, 0.042], rot: [7, 0, 0], color: '#eef2f8', metal: 0.95 },
      { s: 'box', size: [0.005, 0.74, 0.008], pos: [0, 0.58, 0.028], color: '#bfe8ff', glow: 1.3 }] },
  // characters: rigged, animated bodies (the body slot). Presentation only: the same collider for everyone
  'knight': { name: 'Knight', slot: 'body', traits: ['cosmetic'], rarity: 'rare', character: 'knight', icon: 'assets/characters/knight.png',
    desc: 'Plate armour, a plumed helm and a red cape, with a real walk, run and sword swing. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#8d9bb0' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#c7cfdb' }, { s: 'cone', r: 0.07, h: 0.2, pos: [0, 0.86, 0], color: '#d94a4a' }] },
  'barbarian': { name: 'Barbarian', slot: 'body', traits: ['cosmetic'], rarity: 'uncommon', character: 'barbarian', icon: 'assets/characters/barbarian.png',
    desc: 'Furs, a horned helm and a heavy cape. Swings like they mean it. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#8a5a3c' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#e0b48a' }, { s: 'cone', r: 0.05, h: 0.18, pos: [0.18, 0.78, 0], rot: [0, 0, -40], color: '#f0e6d2' }, { s: 'cone', r: 0.05, h: 0.18, pos: [-0.18, 0.78, 0], rot: [0, 0, 40], color: '#f0e6d2' }] },
  'mage': { name: 'Mage', slot: 'body', traits: ['cosmetic'], rarity: 'rare', character: 'mage', icon: 'assets/characters/mage.png',
    desc: 'Robes, a cape and a wide-brimmed hat with a point to it. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#5b4bb7' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#e8c9a8' }, { s: 'cone', r: 0.2, h: 0.4, pos: [0, 0.95, 0], color: '#3c2f8f' }] },
  'rogue': { name: 'Rogue', slot: 'body', traits: ['cosmetic'], rarity: 'uncommon', character: 'rogue', icon: 'assets/characters/rogue.png',
    desc: 'Hooded, light on their feet, and hard to spot in a crowd. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#3f5a3a' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#2f3d2c' }] },
  'robot': { name: 'Robot', slot: 'body', traits: ['cosmetic'], rarity: 'rare', character: 'robot', icon: 'assets/characters/robot.png',
    desc: 'A cheerful, chunky robot. Its strike is a punch, and it gives a thumbs-up when you win. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#e6b84a' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#d9dde6' }, { s: 'box', size: [0.3, 0.08, 0.05], pos: [0, 0.62, 0.18], color: '#2a2f3a' }] },
  'skeleton-warrior': { name: 'Skeleton Warrior', slot: 'body', traits: ['cosmetic'], rarity: 'epic', character: 'skeleton-warrior', icon: 'assets/characters/skeleton-warrior.png',
    desc: 'Rattling bones in a dented helm, eyes aglow. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#d8d2c2' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#efe9da' }, { s: 'sphere', r: 0.04, pos: [0.07, 0.62, 0.17], color: '#5cf2ff', glow: 2 }, { s: 'sphere', r: 0.04, pos: [-0.07, 0.62, 0.17], color: '#5cf2ff', glow: 2 }] },
  'skeleton-mage': { name: 'Skeleton Mage', slot: 'body', traits: ['cosmetic'], rarity: 'epic', character: 'skeleton-mage', icon: 'assets/characters/skeleton-mage.png',
    desc: 'A grinning skull under a pointed hat, with robes that have seen centuries. A character: your items still show and work, and a worn hat replaces its own headwear.',
    look: [{ s: 'cyl', r: 0.17, h: 0.42, pos: [0, 0.21, 0], color: '#4a3b6b' }, { s: 'sphere', r: 0.2, pos: [0, 0.6, 0], color: '#efe9da' }, { s: 'cone', r: 0.18, h: 0.38, pos: [0, 0.94, 0], color: '#4a3b6b' }] },
  springboots: { name: 'Spring Boots', slot: 'feet', family: 'machine', traits: ['doublejump'], rarity: 'uncommon', desc: 'Jump a second time in mid-air. A machine: works in any world that allows double jumps and machines.',
    look: [{ s: 'rbox', size: [0.27, 0.16, 0.38], pos: [0, 0.01, 0.01], color: '#ff9f1c' }, { s: 'box', size: [0.28, 0.035, 0.39], pos: [0, -0.065, 0.01], color: '#ffe066', glow: 1.8 }] },
  // artifacts with a power (the charm slot; key 2). Machines are made and sold; magic ones are found out in the worlds
  'bubble-shield': { name: 'Bubble Shield', slot: 'charm', family: 'machine', traits: ['shield'], rarity: 'epic', power: { kind: 'shield', seconds: 6, cooldown: 25 },
    desc: 'A brass field-engine. Press 2: a bubble that no hit gets through, for 6 seconds. Recharges in 25.',
    look: [{ s: 'sphere', r: 0.1, color: '#9fe7ff', glow: 1.5, opacity: 0.85 }, { s: 'torus', r: 0.15, tube: 0.024, rot: [90, 0, 0], color: '#c9a35a', metal: 0.7 },
      { s: 'torus', r: 0.15, tube: 0.02, color: '#c9a35a', metal: 0.7 }, { s: 'cyl', r: 0.035, h: 0.09, pos: [0, -0.19, 0], color: '#5a6478', metal: 0.6 },
      { s: 'sphere', r: 0.03, pos: [0, 0.18, 0], color: '#ffd166', glow: 1.2 }] },
  'pocket-seeker': { name: 'Pocket Seeker', slot: 'charm', family: 'machine', traits: ['finder'], rarity: 'epic', power: { kind: 'finder', seconds: 6, cooldown: 8 },
    desc: 'A brass seeker with a restless needle. Press 2: a trail of light runs to the nearest coin, gem or item still to find in the world you are in.',
    look: [{ s: 'cyl', r: 0.15, h: 0.05, rot: [90, 0, 0], color: '#c9a35a', metal: 0.7 }, { s: 'cyl', r: 0.122, h: 0.054, rot: [90, 0, 0], color: '#fff4e2' },
      { s: 'box', size: [0.024, 0.18, 0.012], pos: [0, 0.015, 0.032], rot: [0, 0, -32], color: '#ff6b6b', glow: 0.8 }, { s: 'sphere', r: 0.024, pos: [0, 0, 0.036], color: '#ffd166', glow: 1 },
      { s: 'torus', r: 0.036, tube: 0.012, pos: [0, 0.18, 0], color: '#c9a35a', metal: 0.7 }] },
};

export default {
  id: 'hub',
  name: 'Junction',
  kind: 'hub',
  author: 'elsewhere',
  version: 1,
  blurb: 'The crossroads. Every portal leads to another world.',
  color: '#ffd166',
  spawn: { pos: [0, 1.2, 19], yaw: 180 },
  killY: -40,
  rules: { fighting: false }, // every trait works here, but blades stay sheathed outside the training yard (below)
  theme: { // golden hour: a low warm sun behind the arrival, so the Vault's face is lit as you step in
    skyTop: '#4d8fe3', skyHorizon: '#fff1d0', skyBottom: '#f5d4ad', skySharp: 0.45,
    sunDir: [-0.5, 0.62, 0.6], sunColor: '#fff2cf', sunSize: 2.6, sunLight: '#ffe6c0', sunIntensity: 2.6,
    hemiSky: '#c4d9ff', hemiGround: '#e9c9a0', hemiIntensity: 1.3,
    fog: [160, 650], fogColor: '#fbe8cc', stars: 0, bloom: 0.22, exposure: 0.95,
    clouds: { y: -30, color: '#fff0dc', opacity: 0.8 },
  },
  music: { root: 57, scale: 'lydian', bpm: 66, progression: [0, 4, 5, 3], sparkle: 0.25, bright: 1600 },
  items: ITEMS,

  build(w) {
    const T = w.THREE, D = Math.PI / 180;
    const at = (deg, r, y = 0) => [Math.sin(deg * D) * r, y, Math.cos(deg * D) * r];
    const facing = (pos) => Math.atan2(-pos[0], -pos[2]) / D; // yaw that faces the centre
    // p moved d metres along a heading (yaw) and `side` metres across it
    const fwd = (p, yaw, d, side = 0) => { const s = Math.sin(yaw * D), c = Math.cos(yaw * D); return [p[0] + s * d + c * side, p[1], p[2] + c * d - s * side]; };
    const name = (pos, text) => w.label({ pos, text, size: 0.5 }); // one name over each place you can use
    const look = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]) / D; // the yaw from one point toward another
    // a low-poly tree: a six-sided trunk and faceted crowns. The main crown is solid too, so the camera stops at it
    // instead of filling the screen with leaves
    const tree = (p, s = 1, y = 0, tone = 0) => {
      const [x, , z] = p, leaf = [C.leaf, C.leaf2, C.leaf3][tone % 3];
      w.cylinder({ pos: [x, y + 1.1 * s, z], radius: 0.2 * s, height: 2.2 * s, color: C.wood2, sides: 6 });
      w.sphere({ pos: [x, y + 3.0 * s, z], radius: 1.4 * s, color: leaf, low: true, flat: true });
      w.sphere({ pos: [x + 0.6 * s, y + 3.75 * s, z - 0.3 * s], radius: 0.95 * s, color: leaf, low: true, flat: true, collide: false });
      w.sphere({ pos: [x - 0.65 * s, y + 3.45 * s, z + 0.4 * s], radius: 0.8 * s, color: leaf, low: true, flat: true, collide: false });
    };
    // a few flowers scattered in a circle; on the ground they get a patch of grass of their own
    const flowers = (p, r, n, seed, y = 0) => {
      const rnd = w.rand(seed);
      if (!y) w.cylinder({ pos: [p[0], 0.02, p[2]], radius: r + 0.25, height: 0.04, color: C.grass, sides: 10, collide: false, shadow: false });
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = r * (0.35 + rnd() * 0.65);
        w.sphere({ pos: [p[0] + Math.sin(a) * d, y + 0.12, p[2] + Math.cos(a) * d], radius: 0.13 + rnd() * 0.06, color: C.flower[i % 4], low: true, flat: true, collide: false, shadow: false });
      }
    };
    // a round stone planter with grass, a tree and a few flowers
    const planter = (p, tone, seed) => {
      w.cylinder({ pos: [p[0], 0.35, p[2]], radius: 1.8, height: 0.7, color: C.stone2, sides: 12 });
      w.cylinder({ pos: [p[0], 0.72, p[2]], radius: 1.62, height: 0.04, color: C.grass, sides: 12, collide: false, shadow: false });
      tree(p, 1, 0.7, tone);
      flowers(p, 1.45, 6, seed, 0.7);
    };
    const bench = (p, yaw) => {
      w.box({ pos: [p[0], 0.45, p[2]], size: [1.8, 0.12, 0.55], yaw, color: C.wood });
      w.box({ pos: fwd([p[0], 0.85, p[2]], yaw, -0.25), size: [1.8, 0.5, 0.1], yaw, color: C.wood, collide: false });
      for (const s of [-0.75, 0.75]) w.box({ pos: fwd([p[0], 0.2, p[2]], yaw, 0, s), size: [0.12, 0.4, 0.5], yaw, color: C.navy, collide: false });
    };

    // ---------- the island: a stone plaza on a floating rock ----------
    w.cylinder({ pos: [0, -2, 0], radius: 34, height: 4, color: C.stone }); // its top is the floor, y 0
    w.cylinder({ pos: [0, -4.5, 0], radius: 33.4, height: 1.0, color: C.sand, sides: 16, flat: true, collide: false });
    w.cone({ pos: [0, -12, 0], radius: 32.6, height: 14, color: C.clay, sides: 11, flat: true, rot: [180, 0, 0], collide: false });
    w.cone({ pos: [3, -20.5, -2], radius: 16, height: 13, color: C.clay2, sides: 7, flat: true, rot: [180, 20, 0], collide: false });
    // small rocks drifting around it (decoration, far from every path and glide)
    for (const [x, y, z, r, turn] of [[54, -4, 20, 2.8, 10], [-50, 3, 32, 1.9, 40], [-62, -7, -24, 3.4, 5], [42, 6, -50, 2.1, 70], [10, -12, 60, 2.6, 25], [72, 9, -8, 1.6, 50], [-30, -14, -64, 3.0, 15]]) {
      w.cylinder({ pos: [x, y, z], radius: r, height: 0.35, color: C.grass, sides: 6, rot: [0, turn, 0], collide: false });
      w.cone({ pos: [x, y - r * 0.95, z], radius: r * 1.02, height: r * 1.9, color: C.clay, sides: 6, flat: true, rot: [180, turn, 0], collide: false });
    }
    // the floor's paving: an inner court around the Vault, six avenues (five portals and the arrival), an outer walk
    w.cylinder({ pos: [0, 0.01, 0], radius: 10.9, height: 0.02, color: C.clay, collide: false, shadow: false });
    w.cylinder({ pos: [0, 0.015, 0], radius: 10.4, height: 0.03, color: C.stone2, collide: false, shadow: false });
    for (const a of [0, 60, -60, 120, -120, 180]) {
      const len = a === 0 ? 16.5 : 10.4, mid = 10.9 + len / 2;
      w.box({ pos: at(a, mid, 0.01), size: [2.8, 0.02, len], yaw: a, color: C.stone2, collide: false, shadow: false });
    }
    { const m = new T.Mesh(new T.RingGeometry(29.6, 30.4, 120), w.mat(C.stone2, { rough: 0.9 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.receiveShadow = true; w.add(m); }
    // the low wall round the edge, and lamps along the outer walk
    for (let i = 0; i < 40; i++) {
      const a = i * 9;
      w.box({ pos: at(a, 34.1, 0.5), size: [5.4, 1.0, 0.6], yaw: a, color: C.stone2 });
      w.box({ pos: at(a, 34.1, 1.06), size: [5.5, 0.12, 0.76], yaw: a, color: C.sand, collide: false });
    }
    for (let i = 0; i < 12; i++) {
      const p = at(i * 30 + 15, 31.4);
      w.cylinder({ pos: [p[0], 1.6, p[2]], radius: 0.11, height: 3.2, color: C.navy, sides: 8 });
      w.cylinder({ pos: [p[0], 0.15, p[2]], radius: 0.3, height: 0.3, color: C.navy, sides: 8, collide: false });
      w.box({ pos: [p[0], 3.42, p[2]], size: [0.46, 0.5, 0.46], color: '#ffe6ad', glow: 0.45, collide: false, shadow: false });
      w.cone({ pos: [p[0], 3.86, p[2]], radius: 0.46, height: 0.38, color: C.navy, sides: 4, rot: [0, 45, 0], collide: false });
    }
    // planters between the avenues (the Junction Cup keeps its side of the arrival open for the ball)
    [[-30, 0, 11], [90, 1, 12], [-90, 2, 13], [150, 0, 14], [-150, 1, 15]].forEach(([a, tone, seed]) => planter(at(a, 15), tone, seed));

    // ---------- the Vault ----------
    for (let i = 1; i < 14; i++) { // stone walls (the gap at the front is the door)
      const a = (i * 360) / 14;
      w.box({ pos: at(a, 6, 3.5), size: [2.85, 7, 0.7], yaw: a, color: i % 2 ? C.cream : C.stone });
    }
    w.box(Object.assign({ pos: at(-14, 6.35, 3.6), size: [0.7, 7.2, 0.9], yaw: 0 }, GOLD));
    w.box(Object.assign({ pos: at(14, 6.35, 3.6), size: [0.7, 7.2, 0.9], yaw: 0 }, GOLD));
    w.box(Object.assign({ pos: [0, 7.1, 6.3], size: [3.9, 0.6, 0.9] }, GOLD));
    w.cylinder({ pos: [0, 7.45, 0], radius: 6.5, height: 0.7, color: C.sand });
    // an aged-copper dome: only its upper half exists, so the hall inside has its full 7 m of headroom
    w.sphere({ pos: [0, 7.7, 0], radius: 5.6, dome: true, color: C.copper, metal: 0.15, rough: 0.6 });
    w.model({ pos: [0, 0, 0], parts: [ // gold bands (decoration)
      Object.assign({ s: 'torus', r: 6.55, tube: 0.1, pos: [0, 7.1, 0], rot: [90, 0, 0] }, GOLD),
      { s: 'torus', r: 6.2, tube: 0.12, pos: [0, 0.3, 0], rot: [90, 0, 0], color: C.sand },
      Object.assign({ s: 'torus', r: 3.2, tube: 0.1, pos: [0, 12.1, 0], rot: [90, 0, 0] }, GOLD),
    ] });
    const door = w.box({ id: 'vault-door', pos: [0, 3.3, 6.05], size: [2.8, 6.6, 0.45], color: '#d4a13e', metal: 0.3, rough: 0.4 });
    const doorGlyph = w.model({ pos: [0, 3.5, 6.3], parts: [
      { s: 'torus', r: 0.8, tube: 0.06, rot: [0, 0, 0], color: '#fff1c4', glow: 1.6 },
      { s: 'oct', r: 0.35, color: '#fff1c4', glow: 1.3 },
    ] });
    const sockets = SIGILS.map((s, i) => {
      const pos = [(i - 1) * 1.25, i === 1 ? 9.3 : 8.75, 5.95];
      w.model({ pos, parts: [Object.assign({ s: 'cyl', r: 0.42, h: 0.12, rot: [90, 0, 0] }, GOLD)] });
      const dim = w.model({ pos: [pos[0], pos[1], pos[2] + 0.12], parts: [{ s: 'oct', r: 0.3, color: '#efe4d2' }] });
      const lit = w.model({ pos: [pos[0], pos[1], pos[2] + 0.12], parts: [{ s: 'oct', r: 0.32, color: s.color, glow: 2.6 }] });
      w.spin(lit, { speed: 1.2 });
      return { s, dim, lit };
    });
    const vaultOpen = () => !!w.store.get('open', false);
    const owned = (k) => w.has('sigil-' + k) || !!w.flag('sigil.' + k);
    const count = () => SIGILS.filter((s) => owned(s.key)).length;
    const refreshSockets = () => sockets.forEach((k) => { const on = vaultOpen() || owned(k.s.key); k.lit.group.visible = on; k.dim.group.visible = !on; });
    refreshSockets();
    // two potted topiaries guard the door
    for (const sx of [-1, 1]) {
      w.cylinder({ pos: [sx * 3.7, 0.5, 8.8], radius: 0.75, height: 1.0, color: C.clay, sides: 8 });
      w.cylinder({ pos: [sx * 3.7, 1.04, 8.8], radius: 0.82, height: 0.1, color: C.clay2, sides: 8, collide: false });
      w.sphere({ pos: [sx * 3.7, 2.05, 8.8], radius: 0.95, color: C.leaf3, low: true, flat: true, collide: false });
      w.sphere({ pos: [sx * 3.7, 2.95, 8.8], radius: 0.6, color: C.leaf3, low: true, flat: true, collide: false });
    }

    // inside the Vault
    w.cylinder(Object.assign({ pos: [0, 0.6, -1], radius: 0.9, height: 1.2 }, GOLD));
    w.light({ pos: [0, 5, 0], color: '#ffd9a0', intensity: 34, distance: 12 });
    w.sign({ pos: [0, 0, -4.9], yaw: 0, title: 'HALL OF FIRSTS', text: "You opened the Vault.\nThe Founder's Crown is yours. Wear it and you can sense the Founder's Echoes.\nWhoever finds each Echo first is named on the Leaderboards for good.", width: 4.2, bg: C.navy, border: C.gold, titleColor: '#ffd98a', frame: C.wood2 });
    let crownSpawned = false;
    // the pedestal keeps you 1.75 m from the crown: the pickup radius has to reach a player standing beside it
    const spawnCrown = () => { if (crownSpawned) return; crownSpawned = true; w.pickup({ pos: [0, 2.1, -1], item: 'crown', scale: 2.2, radius: 2.0 }); };
    let doorAnim = 0;
    if (vaultOpen()) { door.hide(); doorGlyph.group.visible = false; spawnCrown(); }
    w.interact({ pos: [0, 1, 7.4], radius: 3.2, label: 'The Vault', onUse: async () => {
      if (vaultOpen()) { await w.say('The Vault', ['The Vault stands open. The crown is inside.']); return; }
      const n = count();
      if (n < 3) {
        const missing = SIGILS.filter((s) => !owned(s.key)).map((s) => `${s.name} (${s.world})`);
        await w.say('The Vault', [`Three sockets glow faintly above the door. ${n} of 3 filled.`, `Still missing: ${missing.join(', ')}.`]);
        return;
      }
      const pick = await w.ask('The Vault', 'All three sigils hum in your pack. Set them into the sockets?', ['Set the sigils', 'Not yet']);
      if (pick !== 0) return;
      w.store.set('open', true); w.setFlag('vault.opened', true);
      refreshSockets(); w.sound('open'); w.shake(1.2);
      doorAnim = 0.001; door.col && door.col.setEnabled(false); doorGlyph.group.visible = false;
      w.burst([0, 5, 7], { color: ['#ffd166', '#ffffff', '#ff8fa3', '#5ec9c1'], count: 120, speed: 12, life: 1.6 });
      spawnCrown(); objective();
      w.after(0.9, () => w.banner('THE VAULT IS OPEN', 'Walk inside and claim the Founder\'s Crown.'));
    } });
    // the Echo Stone: the Founder's message, and the start of the hunt (GAME.md)
    w.box({ pos: [-4.15, 1.15, -1.2], size: [0.55, 2.3, 1.1], color: '#4b5a70', rough: 0.6 });
    const stoneGlyph = w.model({ pos: [-3.86, 1.55, -1.2], yaw: 90, parts: [{ s: 'torus', r: 0.3, tube: 0.03, color: '#ffe9a8', glow: 2 }, { s: 'ico', r: 0.09, color: '#fff6dc', glow: 2.5 }] });
    w.interact({ pos: [-3.2, 1, -1.2], radius: 2.0, label: 'Echo Stone', onUse: async () => {
      if (!w.has('crown')) { await w.say('Echo Stone', ['The stone is cold and quiet. Take the crown first.']); return; }
      if (!w.flag('hunt.started')) {
        await w.say('The Founder', [
          'You wear my crown. Then you came the long way, through three worlds, to get here.',
          'I built these worlds for strangers, and now I am a stranger in them.',
          'I left my voice behind, in pieces. Find them. Each one knows where the next one is.',
          'When you have them all, come back and play them to this stone. There is one world I never opened.',
        ]);
        w.setFlag('hunt.started', true);
        w.sound('pickup'); w.burst([-3.6, 2.2, -1.2], { color: ['#ffe9a8', '#9fe7ff', '#ffffff'], count: 80, speed: 6, life: 1.4 });
        w.banner('THE HUNT BEGINS', "Find the Founder's Echoes. Your crown can sense them.");
        objective();
        return;
      }
      const x = nextEcho();
      if (x) { await w.say('Echo Stone', [x.riddle || FAINT]); return; }
      if (w.flag('hunt.tuned')) { await w.say('Echo Stone', ['The stone is quiet now. The Origin is open: the portal beside it.']); return; }
      await tune();
    } });
    w.on('frame', (dt, t) => { stoneGlyph.group.rotation.z = t * 0.6; });
    w.on('frame', (dt) => {
      // (the door's collider went off in the tick that opened it; here only the picture rises and goes)
      if (doorAnim > 0 && door.mesh) { doorAnim += dt; door.mesh.position.y = 3.3 + Math.min(1, doorAnim / 2.4) * 6.8; if (doorAnim > 2.6) { door.mesh.visible = false; doorAnim = 0; } }
    });

    // ---------- portals: one on each avenue, all facing the Vault ----------
    const portalAt = {}; // where each stands (the objective's marker points at the next one to take)
    const portal = (to, deg, r) => {
      const pos = at(deg, r); portalAt[to] = [pos[0], 2.6, pos[2]];
      const sg = SIGILS.find((s) => s.world === (w.worlds.find((x) => x.id === to) || {}).name);
      const done = sg && owned(sg.key);
      w.portal({ pos, yaw: facing(pos), to, frame: C.sand, subtitle: done ? `✓ ${sg.name} found` : undefined });
    };
    const has = (id) => w.worlds.some((x) => x.id === id);
    if (has('skyreach')) portal('skyreach', -60, 22);
    if (has('glowcave')) portal('glowcave', 60, 22);
    if (has('rush')) portal('rush', -120, 22);
    if (has('clash')) portal('clash', 120, 22);
    if (has('circuit')) portal('circuit', 180, 22);
    // any other listed world in the registry gets a portal beside the Creator's Gate, alternating left and right
    const known = ['hub', 'skyreach', 'glowcave', 'circuit', 'rush', 'clash', 'origin'];
    const extra = w.worlds.filter((x) => !known.includes(x.id) && x.listed !== false);
    extra.forEach((x, i) => {
      const pos = at((i % 2 ? 1 : -1) * (16 + 14 * (i >> 1)), 28);
      // The Last Summer of Bronze: once chapter one is done, its portal opens on the latest chapter instead
      // (F at its foot goes back to any chapter so far)
      const BRONZE = [['lsb-thyra', 'Chapter one: Thyra', 'Chapter 1: The Door in the Sea'], ['lsb-pterousa', 'Chapter two: The Low Wings', 'Chapter 2: The Low Wings'],
        ['lsb-strait', 'Chapter three: Three Circuits', 'Chapter 3: Three Circuits']].filter((c) => has(c[0]));
      const open = BRONZE.slice(0, Math.min(BRONZE.length, (w.flag('lsb.ch') || 0) + 1));
      if (x.id === 'lsb-thyra' && open.length > 1) {
        const latest = open[open.length - 1];
        w.portal({ pos, yaw: facing(pos), to: latest[0], label: x.name, subtitle: latest[2], frame: C.sand });
        w.interact({ pos: [pos[0], 1, pos[2]], radius: 3.4, label: 'Choose a chapter', onUse: async () => {
          const i = await w.ask(x.name, 'Which chapter?', open.map((c) => c[1]).concat(['Not now']));
          if (i >= 0 && i < open.length) w.travel(open[i][0]);
        } });
        return;
      }
      w.portal({ pos, yaw: facing(pos), to: x.id, frame: C.sand });
    });

    // ---------- the Creator's Gate, behind the arrival: levels made by players ----------
    // It looks like every other portal because it is one, to many places: F opens the list (a UI panel; world code
    // never reads it), and walking into it says so.
    {
      const g = at(0, 29);
      w.portal({ pos: g, yaw: facing(g), to: 'community', label: 'Community worlds', color: '#9d7bff', frame: C.sand, requires: () => false, lockedText: 'Community worlds: press F at the gate to choose one.' });
      w.interact({ pos: [g[0], 1, g[2] - 1.5], radius: 3, label: "The Creator's Gate", onUse: () => w.openPanel('gate') });
    }

    // ---------- Wren, the guide, by the arrival ----------
    const metWren = () => !!w.flag('met.wren');
    // the hunt: the next Echo not yet found, and what to show for it
    const nextEcho = () => ECHOES.find((x) => !w.has('echo-' + x.id));
    const huntLine = () => {
      const x = nextEcho(); if (x) return x.riddle || FAINT;
      if (!w.flag('hunt.tuned')) return 'All five Echoes are yours. Play them to the Echo Stone, in the order the Founder lost them.';
      if (!w.flag('hunt.complete')) return 'The Vault is tuned. Step through the portal beside the Echo Stone: the Origin.';
      return "The Founder's hunt is complete. Wear the Mantle well.";
    };
    // the Tuning (GAME.md, Act II): play the five Echoes to the stone in the order the Founder lost them. The order is
    // their life, told across the five lines: a child (IV), a racer (III), a dreamer (II), a hider (I), and goodbye (V)
    const ORDER = ['4', '3', '2', '1', '5'];
    const HINTS = ['The stone hums, then falls quiet. The order matters: the order I lost them.',
      'A whisper from the stone: "Start with the youngest memory."',
      'The stone: "A child, a racer, a dreamer, a hider. And last of all, the goodbye."'];
    let originPortal = null;
    const openOrigin = () => { if (!originPortal) originPortal = w.portal({ pos: [3.0, 0, 1.8], yaw: -90, size: 1.2, to: 'origin', label: 'The Origin', subtitle: "The Founder's first world", arrive: 2.8 }); };
    if (w.flag('hunt.tuned')) openOrigin();
    const tune = async () => {
      const seq = [];
      while (seq.length < 5) {
        const left = ECHOES.filter((x) => !seq.includes(x.id));
        const q = seq.length ? `Played: ${seq.map((id) => ECHOES.find((x) => x.id === id).name).join(', ')}. Which next?` : 'Five echoes hum in your pack. Play them to the stone in the order the Founder lost them. Which first?';
        const pick = await w.ask('Echo Stone', q, [...left.map((x) => `${x.name} (${x.world})`), 'Stop']);
        if (pick < 0 || pick >= left.length) return;
        seq.push(left[pick].id); w.sound('echo' + left[pick].id);
      }
      if (seq.join() !== ORDER.join()) {
        const n = w.store.get('tuneTries', 0) + 1; w.store.set('tuneTries', n);
        await w.say('Echo Stone', [HINTS[Math.min(n, HINTS.length) - 1]]);
        return;
      }
      w.setFlag('hunt.tuned', true);
      w.sound('open'); w.shake(1.0); w.burst([-3.6, 2.4, -1.2], { color: ['#ffe9a8', '#9fe7ff', '#ff7eb6', '#ffffff'], count: 140, speed: 9, life: 1.6 });
      openOrigin();
      w.banner('THE TUNING', 'The Vault answers. A way to the Origin is open.');
      objective();
    };
    // Season 1 (Before the Door): a child's crayon drawing of a door, pinned to the Vault's wall, starts the second trail
    const nextS1 = () => ECHOES_S1.find((x) => !w.has('echo-' + x.id));
    const DRAWING = at(115, 5.58, 2.3);
    {
      const a = 115, sn = Math.sin(a * D), cs = Math.cos(a * D);
      w.box({ pos: DRAWING, size: [1.3, 1.0, 0.04], yaw: a, color: '#fdfbf6', collide: false });
      const dab = (dx, dy, sx, sy, color) => w.box({ pos: [DRAWING[0] + cs * dx - sn * 0.03, DRAWING[1] + dy, DRAWING[2] - sn * dx - cs * 0.03], size: [sx, sy, 0.02], yaw: a, color, collide: false });
      dab(0, -0.08, 0.42, 0.66, '#a0703f'); dab(0, -0.08, 0.3, 0.54, '#7a5238'); dab(0.1, -0.1, 0.07, 0.07, '#f6c945');
      dab(-0.42, 0.28, 0.16, 0.16, '#f6c945'); dab(0.45, 0.3, 0.22, 0.08, '#4a8fe0');
      w.label({ pos: [DRAWING[0] * 0.98, DRAWING[1] - 0.72, DRAWING[2] * 0.98], text: 'a door to everywhere', size: 0.16 });
    }
    w.interact({ pos: [DRAWING[0] * 0.82, 1, DRAWING[2] * 0.82], radius: 2.2, label: 'A crayon drawing', onUse: async () => {
      if (!w.flag('hunt.started')) { await w.say('A crayon drawing', ['A child\'s drawing of a door, in thick wax crayon. It hums, very faintly, the way the Echo Stone does.']); return; }
      if (!w.flag('s1.started')) {
        w.setFlag('s1.started', true); w.sound('open');
        w.burst([DRAWING[0] * 0.9, 2.3, DRAWING[2] * 0.9], { color: ['#ffb36b', '#ffe9a8', '#ffffff'], count: 70, speed: 5, life: 1.3 });
        w.banner('SEASON 1: BEFORE THE DOOR', 'Five more of the Founder\'s Echoes.');
        await w.say('A crayon drawing', ['A child\'s drawing of a door, in thick wax crayon, pinned to the Vault\'s wall. Somebody came back to put it here.',
          'Under it, in grown-up handwriting: "Before the door, there was a room."', nextS1().riddle]);
        objective(); return;
      }
      const x = nextS1();
      if (x) { await w.say('A crayon drawing', [x.riddle]); return; }
      await w.say('A crayon drawing', ['It is only a drawing now. The door it shows is open.']);
    } });

    // the sigils in the order Wren suggests: Skyreach's summit also gives the glider that Glowcave's chasms need
    const NEXT = [
      { key: 'sky', to: 'skyreach', text: 'Find the Sky Sigil: step through the Skyreach portal.' },
      { key: 'deep', to: 'glowcave', text: 'Find the Deep Sigil: step through the Glowcave portal.' },
      { key: 'speed', to: 'circuit', text: 'Win the Speed Sigil: step through the Neon Circuit portal.' },
    ];
    // the line under the world name: always one next step, with a marker on the place it names (the Echo riddles
    // stay unmarked: finding the place is the puzzle)
    const objective = () => {
      if (vaultOpen()) {
        if (!w.has('crown')) return w.objective('Claim the crown inside the Vault.', { at: [0, 3.0, -1] });
        if (!w.flag('hunt.started')) return w.objective('The Echo Stone stirs at the back of the Vault.', { at: [-3.6, 2.6, -1.2] });
        if (originPortal && !w.flag('hunt.complete')) return w.objective(huntLine(), { at: [3.0, 2.6, 1.8] });
        if (!nextEcho() && !w.flag('hunt.tuned')) return w.objective(huntLine(), { at: [-3.6, 2.6, -1.2] }); // to the stone, to play them
        if (w.flag('hunt.complete')) { // then Season 1
          if (!w.flag('s1.started')) return w.objective('Someone has pinned a crayon drawing inside the Vault.', { at: [DRAWING[0] * 0.9, 2.4, DRAWING[2] * 0.9] });
          const x = nextS1(); if (x) return w.objective(x.riddle);
          return w.objective('Season 1, Before the Door, is complete. Wear the Paper Crown well.');
        }
        return w.objective(huntLine());
      }
      if (!metWren()) return w.objective('Talk to Wren, the guide.', { at: [-3.2, 3.0, 14.2] });
      const n = count();
      if (n === 3) return w.objective('All three sigils found! Open the Vault in the middle of Junction.', { at: [0, 3.2, 7.2] });
      const next = NEXT.find((x) => !owned(x.key) && portalAt[x.to]);
      if (next) return w.objective(`${next.text} (${n} of 3 sigils)`, { at: portalAt[next.to] });
      w.objective(`Sigils found: ${n} of 3.`);
    };
    w.npc({ pos: [-3.2, 0, 14.2], yaw: 150, name: 'Wren', colors: { body: '#ffb13b', head: '#fff3e0', visor: '#3ec8ff' }, hat: 'antenna', wave: true,
      look: { style: 'round', face: 'big', mouth: 'smile', outfit: 'jacket', extra: 'scarf', colors: { outfit: '#3aa99c', trim: '#fff3e0' } }, onTalk: async () => {
      const n = count();
      if (!metWren()) {
        await w.say('Wren', [
          'Oh! A new face. Welcome to Junction! Every portal here opens onto a different world.',
          'The Vault behind me has been sealed since the beginning. It wants three sigils, and each one waits in a different world.',
          'Start with Skyreach: follow the coins to its portal. Oh, and take this. Every explorer needs a hat!',
        ]);
        w.setFlag('met.wren', true);
        if (!w.has('partyhat')) w.give('partyhat'); // a first gift: it goes straight on, and hats work in every world
        objective();
        return;
      }
      const tips = [
        n === 0 ? 'Skyreach is the gentlest start: climb the floating isles and the Sky sigil waits at the summit.' : null,
        w.worlds.some((x) => x.id === 'lsb-thyra') && !w.flag('lsb.met') ? 'Fancy a story? Turn round: by the Creator\'s Gate, The Last Summer of Bronze. You walk out of the sea onto an island that wonders if you are a god.' : null,
        w.worlds.some((x) => x.id === 'halcyon') && !w.flag('halcyon.met') ? 'Need a holiday? Beside the Creator\'s Gate, Halcyon Point: sun, sand, and a wave taller than the Vault. Marisol there will tow you into it.' : null,
        w.worlds.some((x) => x.id === 'underfoot') && !w.flag('uf.met') ? 'Ever wondered how big a bedroom looks to a toy? Past Thyra by the Creator\'s Gate, Underfoot. Ten lost marbles, a cat, and the floor is lava.' : null,
        w.worlds.some((x) => x.id === 'links') && !w.flag('ll.met') ? 'Fancy a round of golf? Past Halcyon by the Creator\'s Gate, Lost Links: nine holes in a valley full of dinosaurs. They\'re friendly. Mostly they want your ball.' : null,
        w.flag('hunt.complete') && !w.flag('s1.started') ? 'Someone pinned a drawing inside the Vault: a door, in crayon. I didn\'t see who. It hums, like the Echo Stone.' : null,
        !w.flag('used.wardrobe') ? 'Fancy a new look? The mirror beside Pim\'s shop is a whole wardrobe: a body, a face, an outfit, your colours. Your Items open it too, anywhere.' : null,
        !w.has('glider') ? 'Rumour says the summit of Skyreach also hides a glider. Gliders change everything.' : null,
        w.has('glider') && !owned('deep') ? 'Glowcave is dark and full of chasms. Your glider will carry you across. Pick up a lantern on the way in.' : null,
        !owned('speed') ? 'Neon Circuit is behind the Vault. Beat the track time and the Speed sigil is yours. Hold W, steer with A and D.' : null,
        w.worlds.some((x) => x.id === 'rush') ? 'Crystal Rush, the portal past Skyreach, is a ninety-second crystal hunt. The Leaderboards by the arcade keep the best scores.' : null,
        'Your items keep their powers between worlds, as long as a world allows them. Press I to see which work where you are.',
        'Pim at the shop sells hats and Spring Boots, and gives a katana away free. Coins are scattered everywhere, including up high.',
        'Look up. Some of the floating rocks around Junction can be climbed. The jump pad by the fountain, behind the Vault on the left, is a good start.',
        'The arcade has a game of its own, Siegeworks. Its stars are just for fun.',
      ].filter(Boolean);
      await w.say('Wren', [tips[(w.ticks >> 4) % Math.min(tips.length, 4)]]);
    } });
    w.on('pickup', (id) => { if (id === 'crown' || id === 'antenna') objective(); });
    w.on('echo', () => objective());
    w.on('firstVisit', () => { w.toast('Wren the guide wants a word.'); objective(); });
    w.on('enter', () => { objective(); refreshSockets(); if (count() === 3 && !vaultOpen()) w.after(1.2, () => w.banner('THE SIGILS ARE HUMMING', 'Take them to the Vault.')); });
    objective();

    // ---------- the world map, front left: every world and where it leads (the panel M opens) ----------
    {
      const p = at(-46, 24.5); // (out along the ring: -30 degrees is where the next portal beside the Creator's Gate stands)
      w.cylinder({ pos: [p[0], 0.5, p[2]], radius: 1.05, height: 1.0, color: C.stone2, sides: 8 });
      w.cylinder({ pos: [p[0], 1.05, p[2]], radius: 1.2, height: 0.1, color: C.sand, sides: 8, collide: false });
      const globe = w.model({ pos: [p[0], 2.15, p[2]], parts: [
        { s: 'sphere', r: 0.85, color: C.water, rough: 0.6 },
        { s: 'ico', r: 0.42, pos: [0.42, 0.32, 0.38], color: C.leaf2 },
        { s: 'ico', r: 0.36, pos: [-0.5, -0.1, 0.36], color: C.leaf },
        { s: 'ico', r: 0.3, pos: [0.05, -0.45, -0.62], color: C.sand },
        { s: 'ico', r: 0.28, pos: [-0.3, 0.55, -0.45], color: C.leaf2 },
      ] });
      w.model({ pos: [p[0], 2.15, p[2]], parts: [Object.assign({ s: 'torus', r: 1.05, tube: 0.045, rot: [90, 0, 20] }, GOLD)] });
      w.spin(globe, { speed: 0.25 });
      name([p[0], 3.55, p[2]], 'World map');
      w.interact({ pos: p, radius: 2.8, label: 'World map', onUse: () => w.openPanel('map') });
      bench(at(-41, 27), facing(at(-41, 27)));
      tree(at(-37, 29.5), 1.1, 0, 2);
      flowers(at(-24, 29), 1.3, 5, 21);
    }

    // ---------- the arcade and the leaderboards, on the left ----------
    {
      const p = at(-100, 25), y = facing(p);
      w.box({ pos: [p[0], 0.15, p[2]], size: [7.4, 0.3, 6], yaw: y, color: C.wood });
      for (const [d, s] of [[-2.5, -3.3], [-2.5, 3.3], [2.5, -3.3], [2.5, 3.3]]) w.cylinder({ pos: fwd([p[0], 2.15, p[2]], y, d, s), radius: 0.16, height: 3.7, color: C.navy, sides: 8 });
      w.box({ pos: [p[0], 4.1, p[2]], size: [7.8, 0.22, 6.4], yaw: y, color: C.cream, collide: false });
      w.cone({ pos: [p[0], 5.05, p[2]], radius: 5.6, height: 1.7, color: C.teal, sides: 4, rot: [0, y + 45, 0], collide: false });
      for (let i = 0; i < 8; i++) w.box({ pos: fwd([p[0], 3.88, p[2]], y, 3.15, -3.4 + i * 0.97), size: [0.97, 0.32, 0.08], yaw: y, color: i % 2 ? C.cream : C.teal, collide: false });
      name([p[0], 6.45, p[2]], 'Arcade');
      const cp = fwd(p, y, -1.2), siegeStars = w.store.get('siegeStars', {});
      w.cabinet({ pos: [cp[0], 0.3, cp[2]], yaw: y, title: 'Siegeworks', url: SITE_SIEGE, color: '#ffcd4d', onMessage: (msg) => {
        if (!msg || msg.source !== 'siegeworks' || msg.type !== 'result') return;
        const key = String(msg.fort || '').slice(0, 20), stars = Math.max(0, Math.min(3, msg.stars | 0));
        const prev = siegeStars[key] || 0;
        if (stars > prev) {
          // the arcade runs outside Elsewhere's physics, so its stars cannot be checked: they are kept, never paid in coins
          siegeStars[key] = stars; w.store.set('siegeStars', siegeStars);
          w.toast(`Arcade: ${stars} star${stars > 1 ? 's' : ''} on ${key || 'a fort'}. Arcade stars are just for fun; they don't earn coins.`, 'item');
        }
      } });
      // the leaderboards: best runs and first finders (a UI panel; world code never reads the boards)
      const b = at(-77, 24.5), by = facing(b);
      for (const s of [-1.75, 1.75]) w.box({ pos: fwd([b[0], 1.6, b[2]], by, 0, s), size: [0.24, 3.2, 0.24], yaw: by, color: C.wood2 });
      w.sign({ pos: [b[0], 1.0, b[2]], yaw: by, post: false, read: false, title: 'LEADERBOARDS', text: 'Best runs and first finders.', width: 3.2, bg: C.navy, border: C.gold, titleColor: '#ffd98a', frame: C.wood2 });
      w.model({ pos: [b[0], 3.55, b[2]], yaw: by, parts: [
        Object.assign({ s: 'cyl', r: 0.22, h: 0.12, pos: [0, 0, 0] }, GOLD), Object.assign({ s: 'cyl', r: 0.06, h: 0.22, pos: [0, 0.16, 0] }, GOLD),
        Object.assign({ s: 'cone', r: 0.3, h: 0.42, pos: [0, 0.48, 0], rot: [180, 0, 0] }, GOLD),
      ] });
      w.interact({ pos: fwd(b, by, 1.2), radius: 2.8, label: 'Leaderboards', onUse: () => w.openPanel('records') });
    }

    // ---------- Pim's shop, on the right ----------
    const shopPos = at(90, 25), sy = facing(shopPos);
    w.box({ pos: [shopPos[0], 0.15, shopPos[2]], size: [8, 0.3, 6], yaw: sy, color: C.wood });
    const counter = fwd(shopPos, sy, 0.6);
    w.box({ pos: [counter[0], 0.85, counter[2]], size: [5, 1.1, 1], yaw: sy, color: C.wood2 });
    w.box({ pos: [counter[0], 1.43, counter[2]], size: [5.1, 0.08, 1.1], yaw: sy, color: C.cream, collide: false });
    // posts up to a striped awning that slopes down toward the plaza, with a scalloped edge
    for (const side of [-3.7, 3.7]) for (const d of [-2.7, 2.7]) { const h = d > 0 ? 3.8 : 4.45; w.cylinder({ pos: fwd([shopPos[0], 0.3 + h / 2, shopPos[2]], sy, d, side), radius: 0.16, height: h, color: C.navy, sides: 8 }); }
    for (let i = 0; i < 8; i++) {
      const side = -3.675 + i * 1.05, col = i % 2 ? C.cream : C.coral;
      w.box({ pos: fwd([shopPos[0], 4.47, shopPos[2]], sy, 0, side), size: [1.05, 0.16, 6.9], rot: [6, sy, 0], color: col, collide: false });
      w.box({ pos: fwd([shopPos[0], 3.95, shopPos[2]], sy, 3.42, side), size: [0.95, 0.36, 0.08], yaw: sy, color: col, collide: false });
    }
    name([shopPos[0], 6.0, shopPos[2]], 'Shop');
    for (const [k, side] of [['cap', -1.7], ['partyhat', 0.15], ['tophat', 1.8]]) { // wares on the counter
      const q = fwd([counter[0], 1.52, counter[2]], sy, 0, side);
      w.model({ pos: q, yaw: sy + 180, scale: 1.25, parts: ITEMS[k].look });
    }
    const pim = fwd(shopPos, sy, -0.6);
    const listing = [
      { item: 'katana', price: 0 }, // free: everyone should get to try the training yard
      { item: 'cap', price: 10 }, { item: 'partyhat', price: 15 }, { item: 'antenna', price: 20 },
      { item: 'springboots', price: 35 }, { item: 'tophat', price: 40 }, { item: 'halo', price: 75 },
      { item: 'rogue', price: 45 }, { item: 'barbarian', price: 55 }, { item: 'knight', price: 70 }, { item: 'mage', price: 70 },
      { item: 'robot', price: 80 }, { item: 'skeleton-warrior', price: 90 }, { item: 'skeleton-mage', price: 90 },
      { item: 'pocket-seeker', price: 50 }, { item: 'bubble-shield', price: 60 },
    ];
    w.npc({ pos: [pim[0], 0.3, pim[2]], yaw: sy, name: 'Pim', colors: { body: '#62e39b', head: '#2b2f45', visor: '#ffe066' }, hat: 'tophat', label: 'Shop with Pim',
      look: { style: 'bot', face: 'visor', mouth: 'smile', outfit: 'apron', extra: 'bowtie', colors: { outfit: '#e8735a', trim: '#fff3e0' } }, onTalk: async () => {
      if (!w.flag('met.pim')) { w.setFlag('met.pim', true); w.setFlag('met.pim.artifacts', true); await w.say('Pim', ['Welcome, welcome! Everything here works in every world. Well, hats do. Boots depend on the world\'s rules.', 'The katana is on the house. Try it in the training yard, just past the portal.', 'Coins are scattered all over Elsewhere. Have a look.', 'And at the end of the counter, two machines with a power each. They go in your charm slot: press 2.']); }
      else if (!w.flag('met.pim.artifacts')) { w.setFlag('met.pim.artifacts', true); await w.say('Pim', ['New on the counter: artifacts! Two machines with a power each. A Bubble Shield, and a Pocket Seeker that finds what you missed.', 'They go in your charm slot: press 2. Machines sleep in some worlds, mind. Magic ones you have to find yourself, out there.']); }
      w.shop("Pim's Wares", listing);
    } });

    // ---------- the wardrobe, beside the shop: a tall mirror and a rail of clothes (F opens the wardrobe screen) ----------
    {
      const wd = at(73, 25.5), wy = facing(wd);
      w.cylinder({ pos: [wd[0], 0.03, wd[2]], radius: 2.2, height: 0.04, color: C.teal, sides: 12, collide: false, shadow: false });
      w.cylinder({ pos: [wd[0], 0.04, wd[2]], radius: 1.7, height: 0.04, color: C.cream, sides: 12, collide: false, shadow: false });
      const mp = fwd(wd, wy, -0.9, -0.55); // the mirror, at the back of the rug
      w.model({ pos: mp, yaw: wy, parts: [
        { s: 'cyl', size: [0.74, 0.06, 1.08], rot: [90, 0, 0], pos: [0, 1.5, -0.02], ...GOLD },
        { s: 'cyl', size: [0.64, 0.05, 0.98], rot: [90, 0, 0], pos: [0, 1.5, 0.01], color: '#dcefff', metal: 0.85, rough: 0.07 },
        { s: 'sphere', r: 0.1, pos: [0, 2.62, 0], ...GOLD },
        { s: 'cyl', r: 0.05, h: 1.0, pos: [-0.62, 0.5, -0.04], color: C.wood2 }, { s: 'cyl', r: 0.05, h: 1.0, pos: [0.62, 0.5, -0.04], color: C.wood2 },
        { s: 'box', size: [0.5, 0.08, 0.28], pos: [-0.62, 0.04, -0.04], color: C.wood2 }, { s: 'box', size: [0.5, 0.08, 0.28], pos: [0.62, 0.04, -0.04], color: C.wood2 },
      ] });
      w.box({ pos: [mp[0], 1.3, mp[2]], size: [1.6, 2.6, 0.45], yaw: wy, invisible: true });
      const rp = fwd(wd, wy, -0.7, 1.25); // a rail of clothes in the plaza's colours
      const cloth = [C.coral, C.teal, '#ffd166', '#c9a7ff', C.leaf2];
      w.model({ pos: rp, yaw: wy, parts: [
        { s: 'cyl', r: 0.045, h: 1.85, pos: [-0.85, 0.925, 0], color: C.navy }, { s: 'cyl', r: 0.045, h: 1.85, pos: [0.85, 0.925, 0], color: C.navy },
        { s: 'cyl', r: 0.03, h: 1.8, pos: [0, 1.82, 0], rot: [0, 0, 90], color: C.gold, metal: 0.3, rough: 0.45 },
        ...cloth.flatMap((col, i) => { const x = -0.64 + i * 0.32; return [
          { s: 'torus', r: 0.09, tube: 0.012, pos: [x, 1.74, 0], rot: [0, 90, 0], color: C.navy },
          { s: 'rbox', size: [0.08, 0.5, 0.34], pos: [x, 1.42, 0], color: col },
          { s: 'cone', r: 0.24, h: 0.34, pos: [x, 1.08, 0], color: col, rot: [0, 0, 0] },
        ]; }),
      ] });
      w.box({ pos: [rp[0], 1, rp[2]], size: [1.9, 2, 0.6], yaw: wy, invisible: true });
      name([wd[0], 3.5, wd[2]], 'Wardrobe');
      w.interact({ pos: fwd(wd, wy, 0.5), radius: 2.6, label: 'Change your look', onUse: () => { w.setFlag('used.wardrobe', true); w.openPanel('wardrobe'); } });
      w.scene.userData.wardrobe = fwd(wd, wy, 1.4); // for tests: where to stand
    }

    // ---------- the training yard, back right: straw dummies and a pen of real slimes (press 1 to strike) ----------
    const dummies = [at(132, 27), at(139.5, 28.2)].map((p) => {
      w.cylinder({ pos: [p[0], 0.75, p[2]], radius: 0.1, height: 1.5, color: C.wood2 }); // the post (solid)
      const m = w.model({ pos: [p[0], 0, p[2]], yaw: facing(p), parts: [
        { s: 'cyl', r: 0.34, h: 0.95, pos: [0, 1.45, 0], color: '#e3c069', rough: 1 },
        { s: 'sphere', r: 0.25, pos: [0, 2.15, 0], color: '#ecd08a', rough: 1 },
        { s: 'box', size: [1.2, 0.16, 0.16], pos: [0, 1.65, 0], color: '#d2ad58', rough: 1 },
        { s: 'torus', r: 0.3, tube: 0.03, pos: [0, 1.2, 0], rot: [90, 0, 0], color: C.clay2 },
        { s: 'torus', r: 0.3, tube: 0.03, pos: [0, 1.75, 0], rot: [90, 0, 0], color: C.clay2 },
      ] });
      return { x: p[0], z: p[2], hp: 100, down: 0, wob: 0, m };
    });
    {
      const s = at(140, 23);
      w.sign({ pos: s, yaw: facing(s), title: 'TRAINING YARD', text: 'Press 1 to strike. Straw dummies stand still; slimes pounce, so step back when one gathers itself. A katana (free at the shop) cuts.', width: 3, bg: C.navy, border: C.gold, titleColor: '#ffd98a', frame: C.wood2 });
    }
    // Junction is a place without fighting, except here: inside the yard, strikes (and the slimes) are real
    const YARD = at(144, 27.5);
    w.zone({ pos: [YARD[0], 1, YARD[2]], radius: 11, onEnter: () => w.setRules({ fighting: true }), onExit: () => w.setRules({ fighting: false }) });
    w.on('nofight', () => w.toast('No fighting on the plaza: blades stay sheathed. The training yard is at the back, on the right.'));
    w.scene.userData.yard = { x: YARD[0], z: YARD[2], r: 11 }; // for tests
    const popups = [];
    let strikeCd = 0, warned = false, broken = w.store.get('dummies', 0);
    w.scene.userData.dummies = dummies; // for tests
    w.on('tick', (dt) => {
      if (strikeCd > 0) strikeCd -= dt;
      for (const d of dummies) if (d.down > 0) { d.down -= dt; if (d.down <= 0) d.hp = 100; }
      if (!w.input.attack || strikeCd > 0) return;
      strikeCd = 0.38;
      // the nearest standing dummy within reach (the simulation knows where you stand, not which way you turned in place)
      const pp = w.player.pos;
      let target = null, best = 2.6;
      for (const d of dummies) {
        if (d.down > 0) continue;
        const dist = Math.hypot(d.x - pp[0], d.z - pp[2]);
        if (dist < best) { best = dist; target = d; }
      }
      if (!target) return;
      const hand = w.equipment().hand, info = hand && w.itemInfo(hand), blade = !!(info && info.traits.includes('blade'));
      const dmg = blade ? 34 : 4;
      if (!blade && !warned) { warned = true; w.toast('Bare hands barely dent the straw. Pim gives a katana away free.'); }
      target.hp -= dmg; target.wob = 1;
      w.sound(blade ? 'slash' : 'land'); w.burst([target.x, 1.6, target.z], { color: blade ? ['#ffe9a8', '#ffffff'] : ['#d9b65c'], count: blade ? 14 : 5, speed: 4, life: 0.4 });
      const lab = w.label({ pos: [target.x, 2.6, target.z], text: '-' + dmg, size: 0.42, color: blade ? '#ffd166' : '#ffffff', bg: 'rgba(0,0,0,0)' });
      if (lab.material) lab.material.transparent = true;
      popups.push({ s: lab, t: 0 });
      if (target.hp <= 0) {
        target.down = 3; broken++; w.store.set('dummies', broken); w.sound('crumble'); w.shake(0.2);
        if (broken === 1) w.toast('Dummy down! It will stand back up in a moment.', 'item');
      }
    });
    w.on('frame', (dt) => {
      for (const d of dummies) {
        const g = d.m.group, want = d.down > 0 ? -1.35 : 0;
        g.rotation.x += (want - g.rotation.x) * Math.min(1, dt * 8);
        d.wob = Math.max(0, d.wob - dt * 3); g.rotation.z = Math.sin(d.wob * 18) * 0.12 * d.wob;
      }
      for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += dt; p.s.position.y += dt * 1.2; p.s.material.opacity = Math.max(0, 1 - p.t / 0.8); if (p.t > 0.8) { p.s.removeFromParent(); popups.splice(i, 1); } }
    });
    // the slime pen: real foes to practise on (w.enemy), its gate facing the plaza
    {
      const c = at(153, 26.5), R = 3.2, gate = Math.atan2(-c[0], -c[2]);
      w.scene.userData.pen = { x: c[0], z: c[2], r: R, gate }; // for tests
      const posts = 18;
      for (let i = 0; i < posts; i++) {
        const a = (i / posts) * Math.PI * 2, b = ((i + 1) / posts) * Math.PI * 2;
        const off = (x) => { let d = x - gate; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d); };
        if (off(a) < 0.3 && off(b) < 0.3) continue; // the gate: two posts' worth of gap
        const p = [c[0] + Math.sin(a) * R, c[2] + Math.cos(a) * R], q = [c[0] + Math.sin(b) * R, c[2] + Math.cos(b) * R];
        w.cylinder({ pos: [p[0], 0.5, p[1]], radius: 0.09, height: 1.0, color: C.wood2, sides: 6 });
        const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, len = Math.hypot(q[0] - p[0], q[1] - p[1]), yaw = Math.atan2(q[0] - p[0], q[1] - p[1]) / D + 90;
        for (const y of [0.42, 0.82]) w.box({ pos: [mx, y, mz], size: [len, 0.09, 0.07], yaw, color: C.wood });
      }
      w.cylinder({ pos: [c[0], 0.02, c[2]], radius: R - 0.1, height: 0.04, color: C.grass, collide: false }); // turf
      const kinds = [['#6fdc8c', 0], ['#ff8fc7', 120], ['#7cc8ff', 240]];
      kinds.forEach(([color, deg], i) => {
        const a = deg * D;
        w.enemy({ kind: 'slime', id: 'pen-slime-' + (i + 1), pos: [c[0] + Math.sin(a) * 1.4, 0.1, c[2] + Math.cos(a) * 1.4], yaw: deg, color, leash: 5, sight: 6, respawn: 6, drops: 1 });
      });
      // the sweep: from stepping into the pen to the third slime down, on the board (leaving the pen resets it)
      let swept = 0, t0 = null, firstEver = true;
      w.zone({ pos: [c[0], 0.9, c[2]], radius: R, onEnter: () => { swept = 0; t0 = w.time; }, onExit: () => { t0 = null; } });
      w.on('defeat', (id) => {
        if (!id.startsWith('pen-slime')) return;
        if (firstEver) { firstEver = false; w.toast('Slime down! It will be back in a few seconds.', 'item'); }
        if (t0 === null) return;
        if (++swept === 3) { const on = w.record('slimes', w.time - t0, { better: 'lower' }); w.toast(on ? 'Three slimes swept! Your time is on the board.' : 'Three slimes swept!', 'item'); swept = 0; t0 = w.time; } // (no record on a visit that used an artifact's power)
      });
    }

    // ---------- the Junction Cup, front right: kick the big ball through the hoop ----------
    const BALL_HOME = [4.6, 3, 12.6];
    const ball = w.ball({ pos: BALL_HOME, radius: 0.9, color: C.coral });
    w.ball({ pos: [-7, 3, 4], radius: 0.6, color: C.water });
    const hoop = at(44, 24), hy = facing(hoop); // (moved from +32 deg 2026-11-25: Lost Links' portal stands at +30 deg)
    w.box({ pos: [hoop[0], 0.15, hoop[2]], size: [2.6, 0.3, 1.2], yaw: hy, color: C.stone2 });
    w.model({ pos: [hoop[0], 2.6, hoop[2]], yaw: hy, parts: [
      { s: 'torus', r: 1.9, tube: 0.16, color: '#ff8f6b', glow: 1.5 },
      { s: 'cyl', r: 0.12, h: 0.8, pos: [0, -2.2, 0], color: C.navy },
    ] });
    name([hoop[0], 5.2, hoop[2]], 'Junction Cup');
    let goals = w.store.get('goals', 0), goalCool = 0;
    w.on('tick', () => {
      const t = ball.body.translation();
      const dx = t.x - hoop[0], dz = t.z - hoop[2], dy = t.y - 2.6;
      // inside the ring's disc: close to its plane and within its radius
      const along = dx * Math.sin(hy * D) + dz * Math.cos(hy * D);
      const across = Math.hypot(dx - along * Math.sin(hy * D), dz - along * Math.cos(hy * D), dy);
      if (Math.abs(along) < 0.6 && across < 1.6 && w.time > goalCool) {
        goalCool = w.time + 4; goals++; w.store.set('goals', goals);
        w.sound('win'); w.burst([hoop[0], 2.6, hoop[2]], { color: ['#ff8f6b', '#ffd166', '#5ec9c1'], count: 70, speed: 9, life: 1.2 });
        w.banner('GOAL!', `Junction Cup goals: ${goals}`);
        if (goals <= 5) { w.addCoins(2); w.toast('+2 coins for a goal'); }
        w.after(1.5, () => { ball.body.setTranslation({ x: BALL_HOME[0], y: BALL_HOME[1], z: BALL_HOME[2] }, true); ball.body.setLinvel({ x: 0, y: 0, z: 0 }, true); ball.body.setAngvel({ x: 0, y: 0, z: 0 }, true); });
      }
    });

    // ---------- coins on the plaza (made before the sky path's and the dome's: coins are named in the order they are made) ----------
    [[0, 25], [-12, 12], [12, 12], [-20, -4], [20, -4], [-9, -18], [9, -18], [0, -28]].forEach(([x, z]) => w.coin({ pos: [x, 1.1, z] }));

    // ---------- the fountain garden, back left, and the sky path up from it ----------
    {
      const f = at(-150, 23.5);
      w.cylinder({ pos: [f[0], 0.25, f[2]], radius: 3.3, height: 0.5, color: C.stone2, sides: 12 });
      w.cylinder({ pos: [f[0], 0.51, f[2]], radius: 2.95, height: 0.04, color: C.water, sides: 12, rough: 0.3, collide: false, shadow: false });
      w.cylinder({ pos: [f[0], 1.0, f[2]], radius: 0.32, height: 1.0, color: C.stone2, sides: 8 });
      w.cylinder({ pos: [f[0], 1.55, f[2]], radius: 1.0, height: 0.22, color: C.stone2, sides: 8, collide: false });
      w.cylinder({ pos: [f[0], 1.67, f[2]], radius: 0.86, height: 0.04, color: C.water, sides: 8, rough: 0.3, collide: false, shadow: false });
      w.particles({ pos: [f[0], 2.1, f[2]], area: [1.2, 0.8, 1.2], count: 26, color: ['#e9fbff', '#bfeeee'], size: 0.1, kind: 'float', speed: 0.9 });
      for (const [a, r, s, tone] of [[-164, 27.5, 1.15, 0], [-137, 28, 1.0, 2], [-163, 19, 0.85, 1]]) tree(at(a, r), s, 0, tone);
      flowers(at(-158, 27), 1.3, 6, 31);
      const b = at(-140, 24.2); bench(b, look(b, f));
    }
    // the sky path: a jump pad at the garden's edge, floating rocks spiralling up and round to a viewpoint
    const SKY = 120 * D; // the path, built on the east side first, turned to start in the garden
    const turn = ([x, y, z]) => [x * Math.cos(SKY) + z * Math.sin(SKY), y, -x * Math.sin(SKY) + z * Math.cos(SKY)];
    w.jumpPad({ pos: turn([29.5, 0, 0]), power: 23, color: '#ffcf3f' });
    const rocks = [[35, 7, 0, 2.2], [36, 8.4, -5.2, 1.8], [33, 9.8, -10.4, 1.6], [28.4, 11.2, -14.2, 1.6], [22.4, 12.6, -16.4, 1.9], [15.5, 17.4, -20.5, 3.4]].map(([x, y, z, r]) => [...turn([x, y, z]), r]);
    rocks.forEach(([x, y, z, r], i) => {
      w.cylinder({ pos: [x, y, z], radius: r, height: 1.2, color: C.sand, sides: 8 });
      w.cylinder({ pos: [x, y + 0.62, z], radius: r * 0.96, height: 0.06, color: C.grass, sides: 8, collide: false, shadow: false });
      w.cone({ pos: [x, y - 2.0, z], radius: r * 0.92, height: 2.8, color: C.clay, sides: 6, flat: true, rot: [180, 0, 0], collide: false });
      if (i < 5) w.coin({ pos: [x, y + 1.6, z] });
    });
    w.jumpPad({ pos: turn([22.4, 13.2, -16.4]), power: 19, color: '#ffcf3f', radius: 0.9 });
    const top = rocks[5];
    w.pickup({ pos: [top[0], top[1] + 1.7, top[2]], item: 'antenna' });
    { const out = Math.hypot(top[0], top[2]), s = [top[0] * (1 + 2.5 / out), top[1] + 0.6, top[2] * (1 + 2.5 / out)]; w.sign({ pos: s, yaw: facing(s), title: 'VIEWPOINT', text: 'A glider could carry you from here to the top of the Vault dome. Something glitters up there.', width: 2.6, bg: C.navy, border: C.gold, titleColor: '#ffd98a', frame: C.wood2 }); }
    // the dome cache, reachable by gliding
    for (let i = 0; i < 5; i++) w.coin({ pos: [Math.sin(i * 1.256) * 1.6, 14.4, Math.cos(i * 1.256) * 1.6], kind: 'gem', value: 2 });

    // a trail of coins from Wren to the Skyreach portal, round the planter: the first thing to follow, paid as you go.
    // (made last and named, so every other coin keeps its id; c1 sits on the trail between the second and third)
    [[-5.6, 11.2], [-8.9, 10.2], [-15.4, 11.3]].forEach(([x, z], i) => w.coin({ id: 'trail' + (i + 1), pos: [x, 1.1, z] }));

    // motes drifting in the sunlight
    w.particles({ pos: [0, 1, 0], area: [70, 16, 70], count: 60, color: ['#fff6e0', '#ffe2b8'], size: 0.09, kind: 'float', speed: 0.4 });

    // a ringed planet low over the horizon, pale in the daylight, beyond the fog
    const planet = new T.Group();
    const orb = new T.Mesh(new T.SphereGeometry(70, 48, 32), new T.MeshBasicMaterial({ color: '#d9cdf5', fog: false }));
    const shade = new T.Mesh(new T.SphereGeometry(70.5, 48, 32, 0, Math.PI), new T.MeshBasicMaterial({ color: '#9d8fd0', fog: false, transparent: true, opacity: 0.4 }));
    shade.rotation.y = -Math.PI / 2;
    const ring = new T.Mesh(new T.RingGeometry(95, 150, 96), new T.MeshBasicMaterial({ color: '#fff3e0', fog: false, transparent: true, opacity: 0.4, side: T.DoubleSide }));
    ring.rotation.x = Math.PI / 2.25;
    planet.add(orb, shade, ring);
    planet.position.set(-420, 160, -520);
    planet.rotation.z = 0.35;
    w.add(planet);
  },
};
