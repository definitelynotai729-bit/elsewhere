// The Last Summer of Bronze, chapter 1: The Door in the Sea (stories/bronze-age; the story bible and every line are
// there). You walk out of a shining sea arch into a cave of votive lamps, climb to the Stranger's Hearth, and help
// Eumaia gather the guest tablets a tremor flung across the island. They show that every ninth summer one stranger
// "went up the mountain" and never came back; the last was Linnet, from Elsewhere. At dusk a palace ship comes for
// the new stranger, and on Owl's Watch you choose whether to light the beacon.
//
// Story state is global flags under `lsb.` (they carry into later chapters) and `codex.lsb.`; the world's store
// keeps local things (tablets returned, tin-drops, the olive, the goat, the Shadow Race best). Nothing here pays
// coins: tin-drops are the island's own collectible, and every reward is a keepsake or a title.
// Engine NPCs stand still, so Eumaia is an avatar with a movable talk point and a collider per place she stands.
// The look follows ART.md: a sunlit Aegean island in flat, warm colours.
const C = {
  sea: '#2a8fb5', water: '#8fe3ea', sand: '#ead9ac', wet: '#cdb98d',
  rock: '#d1a679', rock2: '#b98b62', rock3: '#9c7352', cave: '#8f6a4f', cave2: '#76563f',
  grass: '#a9c35b', grass2: '#8fad4c', dry: '#d9c27a',
  plaster: '#f5ecdb', plaster2: '#efe0c4', ochre: '#e3a85b', blue: '#3e7cc4', blue2: '#2f5f99', terra: '#c86a43',
  wood: '#a0703f', wood2: '#6f4a2c', stone: '#e2d3b2', stone2: '#c4b18c',
  olive: '#8c9b55', olive2: '#a9b56c', trunk: '#7d6a52', cypress: '#5e7a40',
  bronze: '#d0913c', clay: '#c98a5a', flame: '#ffcf6e', tin: '#e8eef5',
  goat: '#f2ece0', goat2: '#5a4a3a', sail: '#f4ead8', stripe: '#c8503c',
};
const D = Math.PI / 180;
// the guest tablets, in the order Eumaia reads them back, and where each one flew
const TABLETS = [
  { k: 'fish', sign: 'a fish', hint: 'one clattered onto my roof', line: 'The fisherman from the far west who cried at the sight of olives. Stayed eleven years. Snored.' },
  { k: 'wheel', sign: 'a wheel', hint: 'one is stuck up in the olive tree', line: 'A woman with a wheel that turned by itself, no ox. Mended it on my table and left.' },
  { k: 'star', sign: 'a star', hint: 'one sailed clean out to Gull Rock, past the end of the quay', line: 'Him. Said he was a god, drank all my wine and cried about his mother. Marked with a mountain. He went up. That was the honour, that year.' },
  { k: 'wave', sign: 'a wave', hint: 'one dropped among the tide pools below the village', line: 'The girl with sea-green hair. Mountain mark too. Went up twenty-seven years ago.' },
  { k: 'mountain', sign: 'a mountain', hint: 'one went up the goat terraces. Old Horn will be sitting on it, knowing her', line: 'I don\'t even remember this one\'s sign. Just the mark. Thirty-six years.' },
  { k: 'bird', sign: 'a bird over a boot', hint: null, line: 'Linnet. Of course it\'s Linnet.' },
];
const CODEX = {
  door: ['The Door', 'Strangers walk out of it, never in, and understand the island\'s speech at once. Linnet called it "a feature".'],
  omphe: ['Omphe', 'The sacred mountain. Its oracle speaks through a stranger\'s mouth. Silent for thirty days. Smoking for nine.'],
  thyra: ['Thyra', 'The Door island. Goats, thyme, one harbour and a sea arch that sometimes shines.'],
  eumaia: ['Eumaia', 'Keeper of the Door for fifty years. Has washed 312 pairs of feet and one very confused dolphin.'],
  xenia: ['Xenia', 'Guest-friendship. Wash the guest\'s feet, feed them before you ask their name, give a gift, never harm someone under your roof.'],
  hearth: ['The Stranger\'s Hearth', 'Its fire has not gone out in 310 years. Eumaia feeds it olive wood and complaints.'],
  tablets: ['The Guest Tablets', 'One for every stranger, each with the sign they chose. 312 tablets. Six marked with a mountain.'],
  linnet: ['Linnet', 'Sign: a small bird over a boot with a spring under the heel. "Laughs like a gull. Eats like two." Marked with the mountain.'],
  talos: ['Talos', 'A bronze giant walks the Strait of Teeth three times a day. Children wave. He never waves back; nobody told him to.'],
  tindrops: ['Tin-drops', 'There are no coins in the Isles. Tin is getting scarce, and nobody likes to say why.'],
  kyllo: ['Kyllo', 'A pedlar with a bottomless pack and a tortoiseshell lyre. Eumaia says wet sand never keeps his footprints.'],
};
const tabletLook = (glyph) => [
  { s: 'rbox', size: [0.34, 0.44, 0.07], pos: [0, 0, 0], color: '#c98a5a' },
  { s: 'rbox', size: [0.28, 0.38, 0.02], pos: [0, 0, 0.04], color: '#d9a273' },
].concat(glyph);
const GLYPH = {
  fish: [{ s: 'sphere', r: 0.06, pos: [-0.02, 0.02, 0.06], color: '#3e7cc4' }, { s: 'cone', r: 0.05, h: 0.08, pos: [0.08, 0.02, 0.06], rot: [0, 0, 90], color: '#3e7cc4' }],
  wheel: [{ s: 'torus', r: 0.08, tube: 0.015, pos: [0, 0.02, 0.06], color: '#3e7cc4' }],
  star: [{ s: 'oct', r: 0.08, pos: [0, 0.03, 0.06], color: '#e0a13a' }],
  wave: [{ s: 'box', size: [0.2, 0.025, 0.02], pos: [0, 0.05, 0.06], color: '#2a8fb5' }, { s: 'box', size: [0.2, 0.025, 0.02], pos: [0, -0.01, 0.06], color: '#2a8fb5' }],
  mountain: [{ s: 'cone', r: 0.1, h: 0.14, pos: [0, 0.02, 0.06], color: '#8a4a2a' }],
  bird: [{ s: 'sphere', r: 0.045, pos: [0, 0.07, 0.06], color: '#8a4a2a' }, { s: 'box', size: [0.08, 0.06, 0.02], pos: [0, -0.06, 0.06], color: '#8a4a2a' }],
};
const items = {
  'lsb-guest-knife': { name: 'Bronze Guest-Knife', slot: 'hand', traits: ['blade'], rarity: 'rare', iconRot: [0, 0, -45],
    desc: 'Eumaia\'s father\'s knife, yours while you are a guest of Thyra. Press 1 to strike: it cuts, rings and breaks what it reaches.',
    look: [{ s: 'cyl', r: 0.03, h: 0.16, pos: [0, 0.08, 0], color: '#6f4a2c' }, { s: 'box', size: [0.14, 0.03, 0.05], pos: [0, 0.17, 0], color: '#b8862f', metal: 0.6 },
      { s: 'box', size: [0.05, 0.38, 0.012], pos: [0, 0.37, 0], color: '#d6a045', metal: 0.7 }, { s: 'cone', r: 0.027, h: 0.08, pos: [0, 0.6, 0], color: '#d6a045', metal: 0.7 }] },
  'lsb-bread': { name: 'Hearth Bread', slot: null, traits: ['key'], rarity: 'common', desc: 'Barley bread and salt from the rocks. Keep a crust: you never know who is hungry.',
    look: [{ s: 'sphere', r: 0.16, pos: [0, 0, 0], color: '#d9a35f' }, { s: 'box', size: [0.2, 0.02, 0.04], pos: [0, 0.13, 0], color: '#a86f35' }] },
  'lsb-token-own': { name: 'Guest-Token', slot: null, traits: ['key'], rarity: 'rare', desc: 'Half of a clay disc. Eumaia keeps the other half: if your grandchildren ever meet hers, they owe each other a supper.',
    look: [{ s: 'cyl', r: 0.14, h: 0.04, rot: [90, 0, 0], pos: [0, 0, 0], color: '#c98a5a' }, { s: 'box', size: [0.02, 0.3, 0.05], pos: [0.06, 0, 0], color: '#8a5a3a' }] },
  'lsb-token-linnet': { name: 'Linnet\'s Token', slot: null, traits: ['key'], rarity: 'epic', desc: 'The other half of a guest-token Eumaia kept for nine years. Find Linnet, if she is anywhere, and give it to her.',
    look: [{ s: 'cyl', r: 0.14, h: 0.04, rot: [90, 0, 0], pos: [0, 0, 0], color: '#d6a273' }, { s: 'sphere', r: 0.04, pos: [0, 0.03, 0.03], color: '#8a4a2a' }] },
  'lsb-kyllo-note': { name: 'Kyllo\'s Note', slot: null, traits: ['key'], rarity: 'common', desc: 'A folded note for Eumaia. Run it to her hearth before the sundial\'s shadow touches the line.',
    look: [{ s: 'box', size: [0.26, 0.18, 0.02], pos: [0, 0, 0], color: '#f4ead8' }, { s: 'box', size: [0.2, 0.02, 0.022], pos: [0, 0.03, 0], color: '#8a5a3a' }] },
  'lsb-feather': { name: 'Pedlar\'s Feather', slot: 'head', traits: ['cosmetic'], rarity: 'epic', desc: 'From the hat of a pedlar whose footprints wet sand never keeps. Feet are the first gift.',
    look: [{ s: 'cyl', r: 0.012, h: 0.5, pos: [0.12, 0.3, -0.05], rot: [20, 0, -25], color: '#e8e0d0' }, { s: 'box', size: [0.1, 0.4, 0.015], pos: [0.16, 0.36, -0.08], rot: [20, 0, -25], color: '#f2d28a' },
      { s: 'box', size: [0.06, 0.12, 0.016], pos: [0.21, 0.5, -0.12], rot: [20, 0, -25], color: '#c8503c' }] },
  'lsb-house-seal': { name: 'House Seal', slot: null, traits: ['key'], rarity: 'rare', desc: 'The seal of the House of the Double Axe. Show it to anything bronze that tries to stop you.',
    look: [{ s: 'cyl', r: 0.12, h: 0.05, rot: [90, 0, 0], pos: [0, 0, 0], color: '#d0913c', metal: 0.6 }, { s: 'box', size: [0.14, 0.03, 0.03], pos: [0, 0, 0.03], color: '#7a4a1a' }] },
  // an artifact (the charm slot, key 2), left at a shrine of the hunt on the fifth goat terrace. Magic works on Thyra
  'lsb-stag-mask': { name: 'Stag Mask', slot: 'charm', family: 'magic', traits: ['transform'], rarity: 'legendary',
    desc: 'Carved for a hunt nobody remembers. Press 2 and you are a stag for 20 seconds: faster, and a leap like nothing on two legs. Press again to change back.',
    power: { kind: 'transform', seconds: 20, cooldown: 30, form: { name: 'a stag', speed: 1.5, jump: 1.3, height: 2.3, look: [
      { s: 'rbox', size: [0.5, 0.5, 1.15], pos: [0, 1.0, 0], color: '#b9773f' }, { s: 'rbox', size: [0.46, 0.55, 0.4], pos: [0, 1.05, 0.42], color: '#b9773f' },
      { s: 'rbox', size: [0.4, 0.38, 0.2], pos: [0, 1.06, -0.52], color: '#f2e2c4' },
      { s: 'rbox', size: [0.24, 0.6, 0.26], pos: [0, 1.42, 0.55], rot: [-30, 0, 0], color: '#b9773f' },
      { s: 'rbox', size: [0.24, 0.24, 0.4], pos: [0, 1.78, 0.72], color: '#b9773f' }, { s: 'rbox', size: [0.16, 0.14, 0.18], pos: [0, 1.72, 0.95], color: '#8a5a32' },
      { s: 'box', size: [0.1, 0.06, 0.04], pos: [0, 1.74, 1.04], color: '#1d1410' },
      { s: 'sphere', r: 0.03, pos: [-0.115, 1.83, 0.82], color: '#1d1410' }, { s: 'sphere', r: 0.03, pos: [0.115, 1.83, 0.82], color: '#1d1410' },
      { s: 'cone', r: 0.06, h: 0.18, pos: [-0.17, 1.9, 0.64], rot: [0, 0, 70], color: '#b9773f' }, { s: 'cone', r: 0.06, h: 0.18, pos: [0.17, 1.9, 0.64], rot: [0, 0, -70], color: '#b9773f' },
      { s: 'cyl', r: 0.028, h: 0.55, pos: [-0.21, 2.14, 0.66], rot: [-12, 0, 28], color: '#efe2c8' }, { s: 'cyl', r: 0.028, h: 0.55, pos: [0.21, 2.14, 0.66], rot: [-12, 0, -28], color: '#efe2c8' },
      { s: 'cyl', r: 0.02, h: 0.25, pos: [-0.26, 2.22, 0.78], rot: [50, 0, 10], color: '#efe2c8' }, { s: 'cyl', r: 0.02, h: 0.25, pos: [0.26, 2.22, 0.78], rot: [50, 0, -10], color: '#efe2c8' },
      { s: 'cyl', r: 0.02, h: 0.25, pos: [-0.37, 2.38, 0.62], rot: [20, 0, 45], color: '#efe2c8' }, { s: 'cyl', r: 0.02, h: 0.25, pos: [0.37, 2.38, 0.62], rot: [20, 0, -45], color: '#efe2c8' },
      { s: 'cyl', r: 0.065, h: 0.78, pos: [-0.16, 0.42, 0.42], color: '#8a5a32' }, { s: 'cyl', r: 0.065, h: 0.78, pos: [0.16, 0.42, 0.42], color: '#8a5a32' },
      { s: 'cyl', r: 0.065, h: 0.78, pos: [-0.16, 0.42, -0.42], color: '#8a5a32' }, { s: 'cyl', r: 0.065, h: 0.78, pos: [0.16, 0.42, -0.42], color: '#8a5a32' },
      { s: 'box', size: [0.11, 0.07, 0.13], pos: [-0.16, 0.035, 0.42], color: '#2b2118' }, { s: 'box', size: [0.11, 0.07, 0.13], pos: [0.16, 0.035, 0.42], color: '#2b2118' },
      { s: 'box', size: [0.11, 0.07, 0.13], pos: [-0.16, 0.035, -0.42], color: '#2b2118' }, { s: 'box', size: [0.11, 0.07, 0.13], pos: [0.16, 0.035, -0.42], color: '#2b2118' },
      { s: 'cone', r: 0.07, h: 0.16, pos: [0, 1.2, -0.66], rot: [-120, 0, 0], color: '#f2e2c4' },
    ] } },
    look: [{ s: 'rbox', size: [0.2, 0.25, 0.07], color: '#c9a27a' }, { s: 'box', size: [0.055, 0.03, 0.02], pos: [-0.05, 0.035, 0.035], color: '#2b2118' },
      { s: 'box', size: [0.055, 0.03, 0.02], pos: [0.05, 0.035, 0.035], color: '#2b2118' }, { s: 'cone', r: 0.055, h: 0.11, pos: [0, -0.115, 0.02], rot: [180, 0, 0], color: '#b8916a' },
      { s: 'cyl', r: 0.013, h: 0.2, pos: [-0.1, 0.2, 0], rot: [0, 0, 28], color: '#efe2c8' }, { s: 'cyl', r: 0.013, h: 0.2, pos: [0.1, 0.2, 0], rot: [0, 0, -28], color: '#efe2c8' },
      { s: 'cyl', r: 0.01, h: 0.09, pos: [-0.13, 0.22, 0.04], rot: [50, 0, 10], color: '#efe2c8' }, { s: 'cyl', r: 0.01, h: 0.09, pos: [0.13, 0.22, 0.04], rot: [50, 0, -10], color: '#efe2c8' },
      { s: 'oct', r: 0.022, pos: [0, 0.085, 0.04], color: '#7cf6ff', glow: 1.6 }] },
  // costumes for the people of Thyra (never given)
  'lsb-kerchief': { name: 'Kerchief', slot: 'head', traits: ['cosmetic'], rarity: 'common', desc: 'Eumaia\'s.', look: [{ s: 'sphere', r: 0.3, pos: [0, 0.12, -0.02], color: '#3e7cc4' }, { s: 'box', size: [0.5, 0.05, 0.3], pos: [0, 0.02, -0.08], color: '#2f5f99' }] },
  'lsb-petasos': { name: 'Wide Hat', slot: 'head', traits: ['cosmetic'], rarity: 'common', desc: 'Kyllo\'s.', look: [{ s: 'cyl', r: 0.46, h: 0.04, pos: [0, 0.12, 0], color: '#8a6a3a' }, { s: 'cyl', r: 0.2, h: 0.18, pos: [0, 0.22, 0], color: '#9c7a46' }, { s: 'box', size: [0.05, 0.3, 0.02], pos: [0.16, 0.34, 0], rot: [0, 0, -20], color: '#f2d28a' }] },
  'lsb-headscarf': { name: 'Headscarf', slot: 'head', traits: ['cosmetic'], rarity: 'common', desc: 'Kessa\'s.', look: [{ s: 'sphere', r: 0.29, pos: [0, 0.1, -0.03], color: '#c8503c' }, { s: 'box', size: [0.1, 0.3, 0.05], pos: [0.18, -0.05, -0.15], color: '#c8503c' }] },
};
for (const t of TABLETS) items['lsb-tablet-' + t.k] = { name: `Guest Tablet (${t.sign})`, slot: null, traits: ['key'], rarity: 'rare', desc: 'One of Eumaia\'s guest tablets, flung out by the tremor. Bring it back to her.', look: tabletLook(GLYPH[t.k]) };

export default {
  id: 'lsb-thyra',
  name: 'The Last Summer of Bronze',
  author: 'elsewhere',
  version: 1,
  blurb: 'A story, chapter 1: The Door in the Sea. You walk out of a shining sea arch onto an island that wonders if you are a god.',
  color: '#e9a23b',
  spawn: { pos: [0, 0.5, -2.5], yaw: 180 },
  killY: -20,
  rules: { deny: ['board'], machines: false }, // a Bronze Age island: machines sleep here (magic does not)
  theme: {
    skyTop: '#2a6ad4', skyHorizon: '#d9eef5', skyBottom: '#8ccbe2', skySharp: 0.55,
    sunDir: [-0.5, 0.62, 0.35], sunColor: '#ffe6b8', sunSize: 2, sunLight: '#fff0d6', sunIntensity: 3.0,
    hemiSky: '#d8eaff', hemiGround: '#d8b98c', hemiIntensity: 1.55,
    fog: [300, 1600], fogColor: '#d6eaef', stars: 0, bloom: 0.32, exposure: 0.98,
  },
  music: { root: 62, scale: 'dorian', bpm: 76, progression: [0, 3, 4, 0], sparkle: 0.25, bright: 1900, wave: 'triangle' },
  items,

  build(w) {
    const T = w.THREE;
    const bx = (x0, x1, y0, y1, z0, z1, color, o = {}) => w.box(Object.assign({ pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], size: [x1 - x0, y1 - y0, z1 - z0], color }, o));
    const deco = { collide: false, shadow: false };
    // a collider-only part switched on or off (a handle's show() would also draw it)
    const solidOnly = (b, on) => { if (on) { b.show(); b.mesh.visible = false; } else b.hide(); };
    const R = w.rand(11);
    const flag = (k) => w.flag(k);
    const store = w.store;
    const codex = (id) => { if (flag('codex.lsb.' + id)) return; w.setFlag('codex.lsb.' + id, true); w.toast(`Codex: ${CODEX[id][0]}`, 'item'); };
    const say = (who, lines) => w.say(who, [].concat(lines));
    // ask, with Esc as a stated default (Esc must always resolve a choice)
    const ask = async (who, q, opts, esc = 0) => { const i = await w.ask(who, q, opts); return i < 0 ? esc : i; };

    // ---------- the island's rock ----------
    // The headland is one block of rock with the Cave of Lamps carved out of it (x -14..14, y 0..15, z -46..10) and the
    // Votive Chimney beside it (x 14..24, z -30..-20, open to the sky). Its top is the Shelf, at y 24.
    const SH = 24;
    bx(-28, -14, -8, SH, -50, 18, C.rock);           // west
    bx(-14, 14, 15, SH, -50, 18, C.rock2);           // the cave's roof
    bx(-14, 14, -8, 15, 10, 18, C.cave);             // behind the Door
    bx(-14, -7, 0, 15, -50, -46, C.cave); bx(7, 14, 0, 15, -50, -46, C.cave); bx(-7, 7, 12, 15, -50, -46, C.cave); // the sea mouth
    bx(14, 66, -8, SH, -20, 18, C.rock);             // south of the chimney
    bx(14, 66, -8, SH, -58, -30, C.rock);            // north of it
    bx(24, 66, -8, SH, -30, -20, C.rock2);           // east of it
    bx(-14, 14, -8, 0, -46, 10, C.wet);              // the cave floor: wet sand
    bx(14, 24, -8, 0, -30, -20, C.wet);              // the chimney's floor
    // grass on top (decoration), leaving the chimney open
    for (const [x0, x1, z0, z1] of [[-28, 14, -50, 18], [14, 66, -20, 18], [14, 66, -58, -30], [24, 66, -30, -20]]) bx(x0 + 0.3, x1 - 0.3, SH - 0.02, SH + 0.06, z0 + 0.3, z1 - 0.3, C.grass, deco);
    // the sea all around (seen, never touched: falling in is a splash, below)
    w.box({ pos: [60, -0.35, -60], size: [3200, 0.3, 3200], color: C.sea, collide: false, shadow: false });
    // faceted boulders along the waterline and the cliff tops
    const boulder = (x, y, z, r, col) => w.sphere({ pos: [x, y, z], radius: r, low: true, flat: true, color: col || C.rock2, scale: [1.2, 0.8, 1], rot: [0, R() * 360, 0], collide: false });
    for (let i = 0; i < 46; i++) { const a = R() * Math.PI * 2, rr = 1.2 + R() * 2.6; const side = R.int(0, 3); const x = side === 0 ? -29 - R() * 2 : side === 1 ? -26 + R() * 90 : 67 + R() * 2, z = side === 1 ? -51 - R() * 2 : -46 + R() * 62; if (!(side === 1 && Math.abs(x) < 9)) boulder(x, -0.4 + Math.cos(a) * 0.3, z, rr, R() < 0.5 ? C.rock2 : C.rock3); }

    // ---------- the Door and the Cave of Lamps ----------
    w.portal({ pos: [0, 0, 7.5], yaw: 180, to: 'hub', label: 'Junction', frame: C.stone });
    for (const s of [-1, 1]) bx(s * 4.2 - 0.6, s * 4.2 + 0.6, 0, 7.2, 8.4, 9.6, C.stone, { collide: false }); // the arch round the Door
    bx(-4.8, 4.8, 7.2, 8.2, 8.4, 9.6, C.stone, { collide: false });
    w.box({ pos: [0, 0.22, -18], size: [27.8, 0.04, 55], color: '#2f9fb3', opacity: 0.3, rough: 1, collide: false, shadow: false }); // shallow water over the sand
    w.light({ pos: [0, 7, -10], color: '#ffb46b', intensity: 36, distance: 46 });
    w.light({ pos: [0, 6, -34], color: '#ffc27a', intensity: 30, distance: 40 });
    w.light({ pos: [19, 12, -25], color: '#ffb46b', intensity: 26, distance: 30 });
    // votive lamps in niches along both walls, 1 to 6 m up (one merged draw for the clay, one for the flames)
    const lamp = (x, y, z, lit = true) => {
      w.cylinder({ pos: [x, y + 0.08, z], radius: 0.13, height: 0.16, sides: 7, color: C.clay, collide: false, shadow: false });
      if (lit) w.sphere({ pos: [x, y + 0.24, z], radius: 0.08, color: C.flame, emissive: C.flame, glow: 1.3, low: true, collide: false, shadow: false });
    };
    for (const side of [-1, 1]) for (let i = 0; i < 26; i++) {
      const z = 6 - i * 2.05, y = 1 + (i * 7 % 5) + R() * 0.6;
      if (side === 1 && z < -19 && z > -31) continue; // the chimney's opening
      bx(side * 13.6 - 0.6, side * 13.6 + 0.6, y - 0.12, y, z - 0.45, z + 0.45, C.cave2, { collide: false });
      lamp(side * 13.5, y, z);
    }
    w.sign({ pos: [-4.2, 0, -7.5], yaw: 20, title: 'THE LAMPS', width: 3.0, text: 'Whoever you are, you are welcome here. Follow the lamps up. Trust a lit step.\n(the Keepers of the Door)', bg: '#4a3526', border: '#d9b27c', titleColor: '#ffd98a', frame: C.wood2 });
    // the boot-shaped lamp (Linnet's), by the chimney
    w.model({ pos: [12.6, 0, -21], yaw: -60, parts: [{ s: 'rbox', size: [0.36, 0.26, 0.5], pos: [0, 0.13, 0], color: C.clay }, { s: 'rbox', size: [0.3, 0.3, 0.28], pos: [0, 0.4, -0.12], color: C.clay },
      { s: 'torus', r: 0.07, tube: 0.02, rot: [90, 0, 0], pos: [0, 0.02, 0.1], color: C.bronze }, { s: 'sphere', r: 0.08, pos: [0, 0.6, -0.12], color: C.flame, glow: 1.2 }] });
    w.interact({ pos: [12.6, 0.5, -21], radius: 2.2, label: 'Look at the lamp', onUse: () => say('A lamp', 'A clay lamp shaped like a boot, with a coiled spring under the heel. Someone keeps it filled.') });
    w.zone({ pos: [0, 2, -40], radius: 7, onEnter: () => codex('omphe') });

    // ---------- the Votive Chimney: lamp-lit ledges up to the Shelf; dark ones crumble ----------
    const LEDGES = [[22.6, -21.4], [22.6, -24.6], [22.6, -27.8], [20.0, -28.6], [16.8, -28.6], [15.4, -25.8], [15.4, -22.6], [18.4, -21.4],
      null, [22.6, -25.2], [22.6, -28.2], [19.6, -28.6], [16.6, -28.6], [15.4, -25.6]];
    LEDGES.forEach((L, i) => {
      if (!L) return;
      const y = 1.6 * (i + 1);
      bx(L[0] - 1.1, L[0] + 1.1, y - 0.4, y, L[1] - 1.1, L[1] + 1.1, C.stone2);
      const wx = L[0] > 21 ? L[0] + 0.8 : L[0] < 16 ? L[0] - 0.8 : L[0], wz = L[1] < -28 ? L[1] - 0.8 : L[1] > -22 ? L[1] + 0.8 : L[1];
      lamp(wx, y, wz);
    });
    // the Gift Niche: a landing halfway up, with offerings and a beacon
    const NY = 1.6 * 9;
    bx(19.8, 23.4, NY - 0.5, NY, -23.0, -20.2, C.stone2);
    w.checkpoint({ pos: [22.6, NY, -22.4], yaw: 180 });
    w.model({ pos: [20.4, NY, -20.6], parts: [{ s: 'sphere', r: 0.07, pos: [0, 0.07, 0], color: '#3e7cc4', glow: 0.4 }, { s: 'torus', r: 0.06, tube: 0.012, pos: [0.25, 0.05, 0], color: '#e9e2d0' },
      { s: 'box', size: [0.04, 0.3, 0.02], pos: [0.45, 0.15, 0], rot: [0, 0, -30], color: '#f2d28a' }, { s: 'cyl', r: 0.06, h: 0.015, pos: [0.7, 0.01, 0], color: '#f2c14e', metal: 0.8 }] });
    w.interact({ pos: [20.6, NY + 0.4, -20.8], radius: 2.2, label: 'Look at the offerings', onUse: () => say('Gift Niche', ['Offerings from strangers: a blue glass bead, a bone fishhook, a feather, and a small gold coin stamped with a ring of portals.', 'It is warm.']) });
    // dark ledges: no lamp, and they crumble
    // (never right above a lamp-lit ledge: a ledge overhead would cut a jump short)
    for (const [x, y, z] of [[18.9, 3.2, -21.4], [22.6, 9.6, -27.8], [15.4, 17.6, -22.4], [20.2, 22.4, -21.4]]) {
      const b = bx(x - 1.1, x + 1.1, y - 0.4, y, z - 1.1, z + 1.1, C.cave2);
      w.crumble(b, { delay: 0.4, respawn: 3 });
      w.cylinder({ pos: [x, y + 0.08, z], radius: 0.13, height: 0.16, sides: 7, color: '#6a5242', collide: false, shadow: false });
    }
    w.zone({ pos: [19, 6, -25], size: [10, 12, 10], onEnter: () => objective() });
    // the hearthstone: once Eumaia has welcomed you, the chimney's warm breath lifts you to the top, so nobody climbs
    // it twice. A launch pad at its foot (cave side) throws you clear of every ledge and onto the east rim:
    // up at 39 m/s (apex 25 m), east at 5.25 m/s, down on the rim 1 m past its edge 1.6 s later.
    let hearthstone = false;
    const makeHearthstone = () => {
      if (hearthstone) return;
      hearthstone = true;
      w.jumpPad({ pos: [16.6, 0, -25], power: 39, push: [5.25, 0, 0], color: '#ff9a3c', radius: 1.0 });
      w.particles({ pos: [19, 1, -25], area: [5, 22, 5], count: 40, color: ['#ffcf6e', '#ff9a3c'], size: 0.14, kind: 'rise' });
    };
    if (flag('lsb.met')) makeHearthstone();

    // ---------- the Shelf: the Stranger's Hearth, its courtyard, the olive ----------
    // the house: a stone storey (hollow, with the hearth inside), a timber storey set back, a terrace in front
    const HX0 = 30, HX1 = 44, HZ0 = -46, HZ1 = -36;
    bx(HX0, HX1, SH, 28, HZ0, HZ0 + 0.6, C.stone);                     // back wall
    bx(HX0, HX0 + 0.6, SH, 28, HZ0, HZ1, C.stone); bx(HX1 - 0.6, HX1, SH, 28, HZ0, HZ1, C.stone); // sides
    bx(HX0, 36, SH, 28, HZ1 - 0.6, HZ1, C.stone); bx(38, HX1, SH, 28, HZ1 - 0.6, HZ1, C.stone); bx(36, 38, 26.6, 28, HZ1 - 0.6, HZ1, C.stone); // front, with the door
    bx(HX0, HX1, 27.6, 28, HZ0, HZ1, C.stone2);                        // the terrace floor (the stone storey's roof)
    bx(32, 42, 28, 31, HZ0, -40, C.ochre);                             // the timber storey
    for (const x of [33.2, 36.2, 39.2]) bx(x, x + 1.2, 29, 30.3, -40.08, -39.98, C.blue, deco); // shutters
    bx(31.8, 42.2, 30.9, 31.15, HZ0 - 0.2, -39.8, C.stone, deco);
    for (const x of [32.6, 41.4]) w.cone({ pos: [x, 31.75, -45.2], radius: 0.45, height: 1.3, sides: 5, color: C.stone, collide: false });     // the stone horns
    for (const x of [32.6, 41.4]) w.cone({ pos: [x, 31.75, -40.8], radius: 0.45, height: 1.3, sides: 5, color: C.stone, collide: false });
    bx(HX0, HX1, 28, 28.8, HZ1 - 0.4, HZ1, C.plaster2);                 // the terrace's parapet
    bx(HX0, HX0 + 0.4, 28, 28.8, -40, HZ1, C.plaster2);
    bx(39.6, 40.8, 28, 29.3, -39.9, -38.9, C.clay);                    // a big jar to climb from
    w.cylinder({ pos: [40.2, 29.55, -39.4], radius: 0.42, height: 0.5, sides: 9, color: C.clay, collide: false });
    w.ramp({ pos: [46, SH + 2, -33], size: [3, 4, 10], yaw: 180, color: C.stone2 }); // the outside stair, up to the terrace
    bx(44, 48, -8, SH, -38, -28, C.rock);                                // (rock under it)
    bx(36, 38, SH, SH + 0.1, -35.9, -35.2, C.stone2);                    // the threshold stone
    // inside: the round hearth, its fire, and the shelf of tablets (the codex)
    w.cylinder({ pos: [37, SH + 0.25, -41.5], radius: 1.2, height: 0.5, sides: 10, color: C.stone2 });
    for (let i = 0; i < 5; i++) w.sphere({ pos: [37 + Math.cos(i * 1.3) * 0.35, SH + 0.62 + (i % 2) * 0.15, -41.5 + Math.sin(i * 1.3) * 0.35], radius: 0.16, color: '#ff9a3c', emissive: '#ff9a3c', glow: 0.6, low: true, collide: false, shadow: false });
    w.light({ pos: [37, SH + 1.6, -41.5], color: '#ffa04a', intensity: 14, distance: 12 });
    bx(31, 35, SH + 1.2, SH + 1.35, -45.4, -44.6, C.wood, deco);
    for (let i = 0; i < 10; i++) bx(31.15 + i * 0.38, 31.45 + i * 0.38, SH + 1.35, SH + 1.75, -45.2, -44.8, i % 3 ? C.clay : '#d9a273', deco);
    w.interact({ pos: [33, SH + 1, -44], radius: 2.4, label: 'Read the guest tablets', onUse: async () => {
      const got = Object.keys(CODEX).filter((k) => flag('codex.lsb.' + k));
      if (!got.length) return say('Guest tablets', 'Rows of clay tablets, one for every stranger. You know none of these signs yet.');
      await say('What you have learned', got.map((k) => `${CODEX[k][0]}: ${CODEX[k][1]}`));
    } });
    w.zone({ pos: [37, SH + 1.5, -41], size: [12, 3, 8], onEnter: () => { if (flag('lsb.welcomed')) codex('hearth'); } });
    w.label({ pos: [37, 33.2, -43], text: 'The Stranger\'s Hearth', size: 0.5 });
    // the courtyard: a basin, the bread table, low dry-stone walls
    w.cylinder({ pos: [30.5, SH + 0.45, -27], radius: 0.75, height: 0.9, sides: 10, color: C.stone });
    w.cylinder({ pos: [30.5, SH + 0.92, -27], radius: 0.6, height: 0.04, color: C.water, glow: 0.2, collide: false, shadow: false });
    bx(33.7, 36.3, SH + 0.86, SH + 0.98, -31.1, -29.9, C.wood);
    for (const [x, z] of [[33.9, -30.9], [36.1, -30.9], [33.9, -30.1], [36.1, -30.1]]) bx(x - 0.07, x + 0.07, SH, SH + 0.86, z - 0.07, z + 0.07, C.wood2, deco);
    w.sphere({ pos: [34.6, SH + 1.1, -30.5], radius: 0.2, color: '#d9a35f', low: true, collide: false });
    w.cylinder({ pos: [35.5, SH + 1.03, -30.5], radius: 0.14, height: 0.1, sides: 8, color: '#f4f0e6', collide: false });
    for (const [x0, x1, z0, z1] of [[28, 29, -36, -29], [28, 29, -26, -22], [29, 34, -22, -21.2], [39, 47, -22, -21.2], [47, 48, -27, -22]]) bx(x0, x1, SH, SH + 0.7, z0, z1, C.stone2);
    // cypresses and thyme on the Shelf (keep the walk clear)
    const cypress = (x, z, s = 1) => { w.cylinder({ pos: [x, SH + 0.6 * s, z], radius: 0.18 * s, height: 1.2 * s, sides: 6, color: C.trunk }); w.cone({ pos: [x, SH + 3.4 * s, z], radius: 0.85 * s, height: 5 * s, sides: 7, color: C.cypress, flat: true }); };
    for (const [x, z, s] of [[2, -8, 1.1], [-8, -30, 1], [-18, 6, 1.2], [56, -10, 1], [60, -48, 1.1], [26, -52, 0.9], [-20, -44, 1]]) cypress(x, z, s);
    const thyme = (x, z, s) => w.sphere({ pos: [x, SH + 0.2 * s, z], radius: 0.45 * s, low: true, flat: true, scale: [1.3, 0.7, 1.2], color: R() < 0.5 ? C.olive2 : C.grass2, collide: false });
    for (let i = 0; i < 40; i++) { const x = -24 + R() * 86, z = -54 + R() * 70; if (!(x > 12 && x < 26 && z > -32 && z < -18) && !(x > 27 && x < 49 && z > -48 && z < -20)) thyme(x, z, 0.6 + R() * 0.8); }
    w.label({ pos: [-1, 25.6, -48.6], text: 'The Sea Arch', size: 0.5 });
    w.zone({ pos: [0, SH + 1, -46], size: [30, 4, 10], onEnter: () => codex('talos') });
    w.checkpoint({ pos: [8, SH, -14], yaw: 180 });

    // the olive: its crown is a platform (the branch from the terrace leads to it); three strikes on the trunk shake loose what's up there
    const OL = [40, -25.5];
    w.cylinder({ pos: [OL[0], SH + 2.5, OL[1]], radius: 0.45, height: 5, sides: 7, color: C.trunk });
    bx(OL[0] - 2, OL[0] + 2, 29.4, 30.4, OL[1] - 2, OL[1] + 2, C.olive, { invisible: true });
    for (const [dx, dy, dz, r, col] of [[0, 30, 0, 2.3, C.olive], [-1.2, 29.8, 0.8, 1.5, C.olive2], [1.3, 29.9, -0.6, 1.4, C.olive2], [0.4, 30.7, -1.1, 1.2, C.olive]]) w.sphere({ pos: [OL[0] + dx, dy, OL[1] + dz], radius: r, low: true, flat: true, scale: [1, 0.55, 1], color: col, collide: false });
    bx(39.6, 40.4, 28.4, 28.8, -36, -27.4, C.trunk);                     // the thick branch, from the parapet to the crown
    w.label({ pos: [OL[0], 32.6, OL[1]], text: 'The Olive', size: 0.45 });

    // ---------- the goat terraces, up to Owl's Watch ----------
    const tierY = (k) => SH + 8 * k, tierZ = (k) => -45 - 13 * k; // tier k's top, and its south edge (riser)
    for (let k = 1; k <= 7; k++) {
      bx(20, 80, -8, tierY(k), tierZ(k) - 13, tierZ(k), k % 2 ? C.rock : C.rock2);
      bx(20.3, 79.7, tierY(k) - 0.02, tierY(k) + 0.06, tierZ(k) - 12.7, tierZ(k) - 0.3, k % 2 ? C.grass : C.dry, deco);
      // the stair up from the tier below, along the riser (alternating ends: odd tiers' stairs rise west, even ones east)
      const odd = k % 2 === 1, xb = odd ? 46 : 54, xt = odd ? 28 : 72;
      w.ramp({ pos: [(xb + xt) / 2, tierY(k - 1) + 4, tierZ(k) + 1.75], size: [3.5, 8, 18], yaw: odd ? -90 : 90, color: C.stone2 });
      // dry-stone walls along the outer edges (with the stair landings left open)
      bx(20, 21, tierY(k), tierY(k) + 0.8, tierZ(k) - 13, tierZ(k) - (odd ? 0 : 4), C.stone2);
      bx(79, 80, tierY(k), tierY(k) + 0.8, tierZ(k) - 13, tierZ(k) - (odd ? 4 : 0), C.stone2);
      for (let i = 0; i < 5; i++) thymeAt(22 + R() * 56, tierY(k), tierZ(k) - 2 - R() * 9);
    }
    function thymeAt(x, y, z) { w.sphere({ pos: [x, y + 0.2, z], radius: 0.4 + R() * 0.3, low: true, flat: true, scale: [1.3, 0.7, 1.2], color: R() < 0.5 ? C.olive2 : C.grass2, collide: false }); }
    // a shrine of the hunt in the fifth terrace's east nook, beside the top of the stair up: the Stag Mask lies on it
    {
      const y = tierY(5), cx = 75.5, cz = -119;
      bx(73.5, 77.5, y, y + 0.35, cz - 2, cz + 2, C.stone);
      bx(74.7, 76.3, y + 0.35, y + 1.25, cz - 0.6, cz + 0.6, C.stone2);
      for (const dx of [-0.42, 0.42]) w.cone({ pos: [cx + dx, y + 1.6, cz], radius: 0.16, height: 0.7, sides: 6, color: C.plaster, collide: false }); // horns of the altar
      for (const [dx, dz] of [[-1.4, 1.3], [1.4, 1.3]]) w.cylinder({ pos: [cx + dx, y + 0.47, cz + dz], radius: 0.22, height: 0.24, sides: 8, color: C.clay, collide: false }); // offering bowls
      w.pickup({ pos: [cx, y + 2.0, cz], item: 'lsb-stag-mask', scale: 2.6, radius: 1.8 });
      w.particles({ pos: [cx, y + 0.8, cz], area: [3, 2.6, 3], count: 12, color: ['#ffe9a8', '#7cf6ff'], size: 0.08, kind: 'float', speed: 0.25 });
      w.on('pickup', (id) => { if (id === 'lsb-stag-mask') w.toast(w.equipment().charm === 'lsb-stag-mask' ? 'The Stag Mask hovers at your shoulder. Press 2 to run as a stag.' : 'The Stag Mask: wear it in your charm slot (I items), then press 2 to run as a stag.', 'item'); });
      w.scene.userData.shrine = [cx, y, cz]; // for tests
    }
    bx(20, 80, -8, tierY(7) - 20, -165, tierZ(7) - 13, C.rock3);       // rock behind the top tier
    // Owl's Watch: a knob above the top tier, with the beacon pyre
    const WATCH = [50, tierY(7) + 4, -156];
    w.cylinder({ pos: [WATCH[0], WATCH[1] - 14, WATCH[2]], radius: 8, height: 28, sides: 9, color: C.rock3 });
    w.cylinder({ pos: [WATCH[0], WATCH[1] + 0.03, WATCH[2]], radius: 7.8, height: 0.08, sides: 9, color: C.dry, collide: false, shadow: false });
    w.ramp({ pos: [50, tierY(7) + 2, -144], size: [3, 4, 8], yaw: 180, color: C.stone2 });
    w.checkpoint({ pos: [53.5, WATCH[1], -152], yaw: 0 });
    w.label({ pos: [50, WATCH[1] + 4.6, -158], text: 'Owl\'s Watch', size: 0.5 });
    bx(48.5, 51.5, WATCH[1], WATCH[1] + 1.5, -159.5, -156.5, C.stone2);
    for (let i = 0; i < 6; i++) w.cylinder({ pos: [50 + Math.cos(i) * 0.5, WATCH[1] + 1.8 + (i % 3) * 0.25, -158 + Math.sin(i) * 0.5], radius: 0.12, height: 1.4, rot: [0, i * 30, 70 + i * 8], color: C.wood, collide: false });
    const pyreFire = w.model({ pos: [50, WATCH[1] + 1.6, -158], parts: [{ s: 'cone', r: 0.9, h: 2.0, pos: [0, 1, 0], color: '#ff9a3c', glow: 1.6 }, { s: 'cone', r: 0.5, h: 1.6, pos: [0.2, 1.3, 0.1], color: '#ffd166', glow: 1.8 }] });
    pyreFire.group.visible = false;
    let pyreLight = null;

    // ---------- the cliff stair, down to the harbour ----------
    w.ramp({ pos: [75, 20, 4], size: [4, 8, 18], yaw: -90, color: C.stone2 }); bx(66, 84, -8, 16, 2, 6, C.rock2);
    bx(84, 90, -8, 16, 0, 8, C.rock2);
    w.ramp({ pos: [87, 12, 17], size: [4, 8, 18], yaw: 180, color: C.stone2 }); bx(85, 89, -8, 8, 8, 26, C.rock2);
    bx(84, 92, -8, 8, 26, 32, C.rock2);
    w.ramp({ pos: [96, 5.5, 29], size: [4, 5, 8], yaw: -90, color: C.stone2 }); bx(92, 100, -8, 3, 27, 31, C.rock2);
    w.label({ pos: [70, 26, 4], text: 'To the harbour', size: 0.45 });

    // ---------- the harbour village ----------
    bx(100, 150, -8, 3, -6, 40, C.rock);
    bx(100.3, 149.7, 2.98, 3.05, -5.7, 39.7, '#d6bf93', deco);
    const house = (x0, x1, z0, z1, h, door) => {
      bx(x0, x1, 3, 3 + h, z0, z1, C.plaster);
      bx(x0 - 0.15, x1 + 0.15, 3 + h, 3 + h + 0.25, z0 - 0.15, z1 + 0.15, C.plaster2);
      const [dx, dz, face] = door;
      if (face === 'z') bx(dx - 0.6, dx + 0.6, 3, 5.2, dz - 0.06, dz + 0.06, C.blue, deco); else bx(dx - 0.06, dx + 0.06, 3, 5.2, dz - 0.6, dz + 0.6, C.blue, deco);
    };
    house(104, 111, -4, 4, 4.5, [107.5, 4, 'z']); house(114, 121, -5, 2, 5.5, [117.5, 2, 'z']); house(134, 142, -4, 4, 4.5, [138, 4, 'z']);
    house(140, 148, 10, 18, 6, [140, 14, 'x']); house(104, 110, 28, 36, 4, [107, 28, 'z']); house(138, 146, 26, 34, 5, [142, 26, 'z']);
    const crate = (x, y, z) => bx(x - 0.7, x + 0.7, y, y + 1.4, z - 0.7, z + 0.7, C.wood);
    crate(111.8, 3, 3.3); crate(111.8, 4.4, 1.9); crate(111.8, 5.8, 0.5);               // up onto the first roof
    crate(121.8, 3, -4); crate(121.8, 4.4, -2.6); crate(121.8, 5.8, -1.2); crate(120.4, 7.2, -1.2); // and the second
    crate(110.8, 3, 35); crate(110.8, 4.4, 33.6);                                       // and the one by the water
    // the sundial square
    w.cylinder({ pos: [122, 3.5, 14], radius: 0.8, height: 1, sides: 10, color: C.stone });
    w.box({ pos: [122, 4.3, 14], size: [0.08, 0.6, 0.5], color: C.bronze, collide: false });
    w.label({ pos: [122, 6.2, 14], text: 'The Sundial', size: 0.45 });
    w.checkpoint({ pos: [116, 3, 18], yaw: 90 });
    // the quay (a pier) and the Patient Cow
    bx(124, 130, -3, 1.5, 40, 68, C.wood);
    for (let z = 42; z <= 66; z += 4) for (const x of [124.3, 129.7]) w.cylinder({ pos: [x, -0.8, z], radius: 0.22, height: 4.6, sides: 6, color: C.wood2, collide: false });
    w.ramp({ pos: [127, 2.25, 42], size: [6, 1.5, 4], yaw: 180, color: C.wood });
    bx(132, 140, -1, 2.2, 50, 70, C.wood);
    bx(133, 139, 2.2, 3.4, 67, 70, C.wood2); bx(134, 138, 2.2, 2.9, 48, 50, C.wood2, deco);
    w.cylinder({ pos: [136, 8, 60], radius: 0.25, height: 11.6, sides: 8, color: C.wood2, collide: false });
    for (let i = 0; i < 5; i++) w.box({ pos: [136, 6.5 + i * 1.3, 59.6], size: [7.4, 1.3, 0.08], color: i % 2 ? C.stripe : C.sail, collide: false });
    w.label({ pos: [136, 14.6, 60], text: 'The Patient Cow', size: 0.45 });
    // the drifting boat, between the end of the quay and Gull Rock
    const boat = w.box({ pos: [127, 0.75, 70.5], size: [2, 0.5, 4], color: C.wood });
    w.mover(boat, { path: [[127, 0.75, 70.5], [127, 0.75, 81.5]], speed: 1.5, pause: 2.2 });
    const boatDeco = w.model({ pos: [127, 0.75, 70.5], parts: [{ s: 'box', size: [2.3, 0.6, 0.25], pos: [0, 0.2, 2], color: C.wood2 }, { s: 'box', size: [2.3, 0.6, 0.25], pos: [0, 0.2, -2], color: C.wood2 },
      { s: 'box', size: [0.25, 0.6, 4.2], pos: [1.1, 0.2, 0], color: C.wood2 }, { s: 'box', size: [0.25, 0.6, 4.2], pos: [-1.1, 0.2, 0], color: C.wood2 }, { s: 'box', size: [2, 0.12, 0.4], pos: [0, 0.35, 0], color: C.wood }] });
    w.on('frame', () => { boatDeco.group.position.copy(boat.mesh.position); });
    w.cylinder({ pos: [127, -1.8, 87], radius: 3.4, height: 8.4, sides: 8, color: C.rock3 });
    for (const [dx, dz, r] of [[-2.6, 1.4, 1.4], [2.4, -1.8, 1.2], [1.6, 2.6, 1]]) boulder(127 + dx, 1.2, 87 + dz, r, C.rock3);
    w.label({ pos: [127, 5.2, 87], text: 'Gull Rock', size: 0.45 });
    // the tide pools: seven stones that rise and sink in turn, so a crest of risen stones runs out to the far rock
    bx(112.5, 115.5, -3, 1.6, 40, 43.5, C.rock3);
    const POOLS = [[114, 46.5], [112, 49.5], [110, 52.5], [108.5, 55.8], [107, 59], [105.5, 62.2], [104.5, 65.4]];
    const poolStones = [];
    POOLS.forEach(([x, z], k) => {
      const s = w.cylinder({ pos: [x, 0.1, z], radius: 1.1, height: 1, sides: 8, color: C.stone2 });
      poolStones.push(s.mesh);
      const up = [x, 0.1, z], down = [x, -2.1, z];
      if (k < 5) w.mover(s, { path: [down, up], speed: 1.1, pause: 1, offset: 1 - k * 0.25 });
      else w.mover(s, { path: [up, down], speed: 1.1, pause: 1, offset: k === 5 ? 1 : 0.75 });
    });
    w.cylinder({ pos: [103.5, -2.2, 69.5], radius: 2.2, height: 7.6, sides: 7, color: C.rock3 });
    w.label({ pos: [109, 4.2, 52], text: 'The Tide Pools', size: 0.45 });
    // falling in the sea is a splash: back to the last beacon
    w.zone({ pos: [60, -4, -40], size: [2600, 5, 2600], onEnter: () => {
      w.burst(w.player.pos, { color: ['#ffffff', C.water], count: 30, speed: 6, life: 0.8 });
      w.sound('respawn'); w.player.respawn();
    } });

    // ---------- the horizon: Omphe smoking, and Talos walking the strait ----------
    w.cone({ pos: [-60, 108, -900], radius: 250, height: 220, sides: 9, color: '#7f6a5a', flat: true, collide: false, shadow: false });
    w.cone({ pos: [-60, 212, -900], radius: 70, height: 30, sides: 9, color: '#5e4c40', collide: false, shadow: false });
    const glow = w.sphere({ pos: [-60, 226, -900], radius: 30, color: '#ff5a2a', emissive: '#ff5a2a', glow: 1.4, low: true, collide: false, shadow: false });
    glow.hide(); // (shown at dusk: hiding claims it, so the static merge leaves it alone)
    const puffs = [];
    for (let i = 0; i < 5; i++) { const p = w.sphere({ pos: [-60, 240 + i * 22, -900], radius: 40, color: '#c9bdb0', opacity: 0.8, low: true, flat: true, collide: false, shadow: false }); puffs.push(p.mesh); }
    const talos = w.model({ pos: [400, 0, -700], scale: 16, parts: [
      { s: 'cyl', r: 0.12, h: 0.95, pos: [-0.16, 0.48, 0], color: C.bronze, metal: 0.4 }, { s: 'cyl', r: 0.12, h: 0.95, pos: [0.16, 0.48, 0], color: C.bronze, metal: 0.4 },
      { s: 'box', size: [0.62, 0.72, 0.36], pos: [0, 1.32, 0], color: C.bronze, metal: 0.4 }, { s: 'cyl', r: 0.09, h: 0.8, pos: [-0.42, 1.25, 0], color: C.bronze, metal: 0.4 },
      { s: 'cyl', r: 0.09, h: 0.8, pos: [0.42, 1.25, 0], color: C.bronze, metal: 0.4 }, { s: 'box', size: [0.3, 0.34, 0.3], pos: [0, 1.9, 0], color: C.bronze, metal: 0.4 },
      { s: 'sphere', r: 0.045, pos: [-0.07, 1.93, 0.16], color: '#ffd166', glow: 1.2 }, { s: 'sphere', r: 0.045, pos: [0.07, 1.93, 0.16], color: '#ffd166', glow: 1.2 }] });
    w.on('frame', (dt, t) => {
      const ph = (t % 240) / 240, k = ph < 0.5 ? ph * 2 : 2 - ph * 2;            // there and back, every four minutes
      talos.group.position.x = 420 - k * 700; talos.group.rotation.y = ph < 0.5 ? -Math.PI / 2 : Math.PI / 2;
      talos.group.position.y = Math.abs(Math.sin(t * 1.6)) * 0.8;
      for (let i = 0; i < puffs.length; i++) { const q = ((t * 0.04 + i / puffs.length) % 1); puffs[i].position.set(-60 + q * 40, 236 + q * 130, -900 - q * 20); puffs[i].scale.setScalar(30 + q * 50); }
    });

    // ---------- dusk: the sky, sun, light and fog blend to evening (w.setTheme), the mountain glows, a ship with three
    // lanterns comes ----------
    const DUSK = { skyTop: '#3b2f6b', skyHorizon: '#ff9a52', skyBottom: '#4a3560', skySharp: 0.5, sunDir: [-0.85, 0.1, 0.25], sunColor: '#ff8a3d', sunLight: '#ffa060', sunSize: 3,
      sunIntensity: 1.7, hemiSky: '#9a84c4', hemiGround: '#8a6048', hemiIntensity: 1.2, fog: [220, 1300], fogColor: '#d48a74', stars: 0.35, bloom: 0.45, exposure: 1.0 };
    let duskT = null; // when it began (game time)
    const ship = w.model({ pos: [-260, 0, -120], parts: [
      { s: 'box', size: [5, 2.2, 22], pos: [0, 1.1, 0], color: '#8a3a2a' }, { s: 'box', size: [4.4, 1.4, 5], pos: [0, 2.6, 8], color: '#e3a85b' },
      { s: 'cyl', r: 0.25, h: 13, pos: [0, 8, -1], color: C.wood2 }, { s: 'box', size: [8, 7, 0.1], pos: [0, 8.5, -1.2], color: C.sail },
      { s: 'box', size: [8, 1.2, 0.12], pos: [0, 9.5, -1.15], color: C.stripe },
      { s: 'sphere', r: 0.45, pos: [-1.8, 4.2, 10.5], color: '#ffd166', glow: 1.8 }, { s: 'sphere', r: 0.45, pos: [1.8, 4.2, 10.5], color: '#ffd166', glow: 1.8 }, { s: 'sphere', r: 0.45, pos: [0, 15, -1], color: '#ffd166', glow: 1.8 }] });
    ship.group.visible = false;
    // its course: in from the west, round to the north of Gull Rock, then south to berth alongside the quay (between it
    // and the tide pools); at an even speed, turning at the corners, so it arrives in its berth's heading
    const SHIPATH = [[-260, 0, -120], [-70, 0, 90], [119, 0, 96], [119, 0, 58]], DOCK = [119, 0, 58, Math.PI];
    const LEGS = SHIPATH.slice(1).map((b, i) => ({ a: SHIPATH[i], b, len: Math.hypot(b[0] - SHIPATH[i][0], b[2] - SHIPATH[i][2]) }));
    const COURSE = LEGS.reduce((n, l) => n + l.len, 0);
    const shipAt = (u) => { // u from 0 (far out) to 1 (berthed)
      let d = Math.min(1, Math.max(0, u)) * COURSE, i = 0;
      while (i < LEGS.length - 1 && d > LEGS[i].len) { d -= LEGS[i].len; i++; }
      const { a, b, len } = LEGS[i], f = Math.min(1, d / len);
      return [a[0] + (b[0] - a[0]) * f, 0, a[2] + (b[2] - a[2]) * f, Math.atan2(b[0] - a[0], b[2] - a[2])];
    };
    const startDusk = (instant) => { if (duskT != null) return; duskT = instant ? w.time - 1000 : w.time; w.setTheme(DUSK, instant ? 0 : 8); };
    // (all drawn: a replay never sees any of it)
    w.on('frame', (dt) => {
      if (duskT == null) return;
      if (glow.mesh) glow.mesh.visible = w.time - duskT > 2.5;
      ship.group.visible = shipShown;
      if (shipShown) {
        const p = shipDocked ? DOCK : shipAt((w.time - duskT) / 90);
        ship.group.position.set(p[0], 0, p[2]);
        if (shipYaw == null) shipYaw = p[3];
        else { let dh = p[3] - shipYaw; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI; shipYaw += dh * (1 - Math.exp(-1.2 * dt)); }
        ship.group.rotation.y = shipYaw;
      }
    });
    let shipYaw = null;
    let shipShown = false, shipDocked = false;

    // ---------- the people of Thyra ----------
    // Eumaia: at the top of the chimney when you arrive; she walks you round to her courtyard; at dusk she takes Old
    // Horn's shortcut to Owl's Watch (she is simply there). A walking NPC (w.npc walks: true).
    const SPOTS = [[9.5, SH, -19.5, 155], [32.8, SH, -31.4, 45], [46.5, WATCH[1], -153.5, 142]];
    const TO_COURTYARD = [[12, SH, -16.5], [26, SH, -16.5], [36.5, SH, -18.5], [36.5, SH, -22.8], [33.0, SH, -29.2], SPOTS[1]];
    const eumaia = w.npc({ pos: SPOTS[0], yaw: SPOTS[0][3], name: 'Eumaia', walks: true, colors: { body: '#3e6fb0', head: '#ffe8cc', visor: '#e3a85b' }, hat: 'lsb-kerchief', onTalk: () => talkEumaia() });
    let eumaiaAt = 0;
    const placeEumaia = (i) => {
      eumaiaAt = i;
      if (i < 0) { eumaia.hide(); return; }
      eumaia.show(); eumaia.setPos(SPOTS[i], SPOTS[i][3]);
    };
    // Old Horn the goat: first on the fourth terrace, sitting on a tablet; after the supper bell, down by the bell; and
    // (somehow) on top of the sea arch, and at the Watch at dusk
    const goatParts = [
      { s: 'rbox', size: [0.5, 0.45, 0.95], pos: [0, 0.75, 0], color: C.goat }, { s: 'rbox', size: [0.3, 0.32, 0.42], pos: [0, 1.12, 0.55], color: C.goat },
      { s: 'cone', r: 0.06, h: 0.32, pos: [-0.1, 1.38, 0.5], rot: [-30, 0, 0], color: C.goat2 }, { s: 'cone', r: 0.06, h: 0.32, pos: [0.1, 1.38, 0.5], rot: [-30, 0, 0], color: C.goat2 },
      { s: 'box', size: [0.08, 0.16, 0.05], pos: [0, 0.92, 0.78], color: C.goat2 },
      { s: 'cyl', r: 0.06, h: 0.55, pos: [-0.17, 0.27, 0.33], color: C.goat2 }, { s: 'cyl', r: 0.06, h: 0.55, pos: [0.17, 0.27, 0.33], color: C.goat2 },
      { s: 'cyl', r: 0.06, h: 0.55, pos: [-0.17, 0.27, -0.33], color: C.goat2 }, { s: 'cyl', r: 0.06, h: 0.55, pos: [0.17, 0.27, -0.33], color: C.goat2 }];
    const goat = (p, yaw) => { const m = w.model({ pos: p, yaw, parts: goatParts }); const col = w.box({ pos: [p[0], p[1] + 0.6, p[2]], size: [0.9, 1.2, 1.3], yaw, invisible: true }); return { m, col, show(on) { m.group.visible = on; solidOnly(col, on); } }; };
    const G1 = [36, tierY(4), -103], G2 = [62.5, tierY(3), -90.5];
    const goatUp = goat(G1, 120), goatDown = goat(G2, -70), goatArch = goat([0, SH, -48.6], 180), goatWatch = goat([53.2, WATCH[1], -154.6], -110);
    const goatMoved = () => store.get('goat', null) === 'moved';
    goatUp.show(!goatMoved()); goatDown.show(goatMoved()); goatArch.show(goatMoved() && !flag('lsb.goat.1')); goatWatch.show(false);
    w.interact({ pos: [0, SH + 0.5, -48.6], radius: 2.4, label: 'Look at the goat', onUse: () => {
      if (!goatArch.m.group.visible) return;
      say('Old Horn', 'Old Horn chews something thoughtfully. You have no idea how she got up here.');
      if (!flag('lsb.goat.1')) w.setFlag('lsb.goat.1', true);
    } });
    // the supper bell on the third terrace's fence
    const BELL = [60, tierY(3), -88.5];
    bx(BELL[0] - 0.1, BELL[0] + 0.1, BELL[1], BELL[1] + 2.2, BELL[2] - 0.1, BELL[2] + 0.1, C.wood2);
    bx(BELL[0] - 0.5, BELL[0] + 0.5, BELL[1] + 2.1, BELL[1] + 2.25, BELL[2] - 0.08, BELL[2] + 0.08, C.wood2, deco);
    const bellM = w.model({ pos: [BELL[0], BELL[1] + 1.7, BELL[2]], parts: [{ s: 'cone', r: 0.28, h: 0.42, pos: [0, 0, 0], color: C.bronze, metal: 0.6 }, { s: 'sphere', r: 0.07, pos: [0, -0.22, 0], color: '#6a4a2a' }] });
    w.sign({ pos: [BELL[0] + 1.6, BELL[1], BELL[2] - 0.5], yaw: -20, title: 'Ring for supper', width: 1.8, text: 'Carved into the post.', bg: '#4a3526', border: '#d9b27c', titleColor: '#ffd98a', frame: C.wood2, read: false });
    let bellSwing = 0;
    w.on('frame', (dt) => { if (bellSwing > 0) { bellSwing = Math.max(0, bellSwing - dt); bellM.group.rotation.z = Math.sin(bellSwing * 18) * bellSwing * 0.5; } });
    const ring = () => {
      w.sound('checkpoint'); bellSwing = 1.2;
      if (goatMoved()) return w.toast('Old Horn looks up from her supper spot, then back down. She has eaten.');
      if (!flag('lsb.tremor')) return w.toast('Old Horn looks up, then goes back to chewing. It isn\'t supper time.');
      store.set('goat', 'moved');
      goatUp.show(false); goatDown.show(true); if (!flag('lsb.goat.1')) goatArch.show(true);
      w.burst([G1[0], G1[1] + 0.6, G1[2]], { color: ['#f2ece0', '#d8c27e'], count: 20, speed: 4, life: 0.7 });
      w.toast('"Mehh!" Old Horn trots down for supper. Where she sat, something made of clay.', 'item');
      makeTablets();
    };
    w.interact({ pos: [BELL[0], BELL[1] + 1, BELL[2]], radius: 2.2, label: 'Ring the bell', onUse: () => ring() });
    w.label({ pos: [BELL[0], BELL[1] + 3, BELL[2]], text: 'Supper Bell', size: 0.42 });

    // Kyllo the pedlar, by the sundial
    w.npc({ pos: [125, 3, 12], yaw: -60, name: 'Kyllo', colors: { body: '#7a4fa0', head: '#ffe8cc', visor: '#f2d28a' }, hat: 'lsb-petasos', wave: true, onTalk: () => talkKyllo() });
    w.interact({ pos: [126.5, 3.3, 9.8], radius: 1.6, label: 'Look at the sand', onUse: () => say('Wet sand', 'Your prints, a gull\'s, a goat\'s. None leading to the pedlar, though he walked up from the water.') });
    // Myrrha, who has a question
    const myrrha = w.npc({ pos: [134, 3, 21.5], yaw: 160, name: 'Myrrha', walks: true, colors: { body: '#f2a65a', head: '#ffe8cc', visor: '#3e7cc4' }, onTalk: async () => {
      if (flag('lsb.ch') >= 1 && flag('lsb.eumaia') === 'held') return say('Myrrha', 'Eumaia went to Kerynthos with the soldiers. Mother says she told them all about her hip, the whole way.');
      const i = await ask('Myrrha', 'Are you a god? You can tell me. I won\'t tell anybody except everybody.', ['No.', 'Maybe.', 'Are you?']);
      await say('Myrrha', ['That\'s what a god would say.', 'I KNEW it. Don\'t do anything godly, Mother will shout.', '...I never thought about it.'][i]);
    } });
    // laps of the square's quiet east side (clear of the race line, the stair and the way to the quay), a breather at
    // the corner nearest the sea
    myrrha.walk([[128, 3, 10], [134.5, 3, 9], [136.5, 3, 15.5], [134, 3, 21.5, 2.5], [128.5, 3, 21], [127.5, 3, 15.5]], { loop: true, speed: 3.2 });
    // Teuthis, wet, on the quay
    w.npc({ pos: [125.2, 1.5, 52], yaw: 90, name: 'Teuthis', colors: { body: '#4a90a4', head: '#ffe8cc', visor: '#ffffff' }, onTalk: async () => {
      if (flag('lsb.kind.1')) return say('Teuthis', 'Hearth-bread. I\'ll remember this, stranger. I mean it.');
      await say('Teuthis', ['Don\'t mind me. Just sitting here being wet. Came over from Melaina in my brother\'s boat.', 'This morning the sea went out like a breath being drawn, then came back all at once and put us on the rocks. Haven\'t eaten since yesterday.']);
      if (!w.has('lsb-bread')) return;
      const i = await ask('Teuthis', 'You wouldn\'t have anything?', ['Have my bread.', 'Sorry.'], 1);
      if (i === 0) { w.take('lsb-bread'); w.setFlag('lsb.kind.1', true); await say('Teuthis', 'Hearth-bread. I\'ll remember this, stranger.'); }
      else await say('Teuthis', 'Course.');
    } });
    // Captain Kessa, by her ship
    w.npc({ pos: [130.6, 1.5, 59], yaw: -90, name: 'Kessa', colors: { body: '#c86a43', head: '#ffe8cc', visor: '#2f5f99' }, hat: 'lsb-headscarf', onTalk: () => talkKessa() });
    w.sign({ pos: [124.5, 1.5, 63.6], yaw: 90, title: 'The end of the quay', width: 2.4, text: 'The boat drifts out to Gull Rock and back. Step aboard while it waits.', bg: '#4a3526', border: '#d9b27c', titleColor: '#ffd98a', frame: C.wood2 });

    // ---------- carried things: the guest tablets and the tin-drops (picked up by walking into them) ----------
    const carry = (p, parts, onTake) => {
      const m = w.model({ pos: p, parts });
      const z = w.zone({ pos: p, radius: 1.3, onEnter: () => { if (!z.enabled) return; z.enabled = false; m.group.visible = false; onTake(); } });
      return { m, z, base: p[1], off() { z.enabled = false; m.group.visible = false; } };
    };
    const bobbers = [];
    w.on('frame', (dt, t) => { for (const b of bobbers) if (b.m.group.visible) { b.m.group.position.y = b.base + 0.35 + Math.sin(t * 2 + b.base) * 0.12; b.m.group.rotation.y = t * 1.2; } });
    const returned = () => store.get('returned', []);
    const SPOT = { fish: [37, 31.05, -43], wheel: [OL[0], 30.45, OL[1]], star: [127, 2.45, 88], wave: [103.5, 1.45, 69.8], mountain: [G1[0], G1[1] + 0.05, G1[2]], bird: [37, SH + 0.15, -35.5] };
    const OLIVE_DROP = [41.6, SH + 0.05, -23.6];
    const tabletAt = {};
    function makeTablets() {
      if (!flag('lsb.tremor')) return;
      const back = returned();
      for (const t of TABLETS) {
        const id = 'lsb-tablet-' + t.k;
        if (tabletAt[t.k] || back.includes(t.k) || w.has(id)) continue;
        if (t.k === 'mountain' && !goatMoved()) continue;
        if (t.k === 'bird' && back.length < 5) continue;
        let p = SPOT[t.k];
        if (t.k === 'wheel' && store.get('olive', 'crown') === 'dropped') p = OLIVE_DROP;
        const look = [{ s: 'torus', r: 0.5, tube: 0.04, rot: [90, 0, 0], pos: [0, -0.3, 0], color: '#ffe9a8', glow: 1.6 }].concat(tabletLook(GLYPH[t.k]).map((q) => Object.assign({}, q, { pos: [q.pos[0] * 2, q.pos[1] * 2, q.pos[2] * 2], size: q.size && q.size.map((v) => v * 2), r: q.r && q.r * 2, h: q.h && q.h * 2, tube: q.tube && q.tube * 2 })));
        const h = carry(p, look, () => { delete tabletAt[t.k]; w.give(id); objective(); });
        tabletAt[t.k] = h; bobbers.push(h);
      }
    }
    const TIN = [[20.6, NY + 0.4, -21.2], [22.6, NY + 0.4, -21.9], [41.2, 31.1, -24.6],
      [78, tierY(1) + 0.6, -64], [22.5, tierY(2) + 0.6, -79], [77.5, tierY(3) + 0.6, -92], [22.5, tierY(4) + 0.6, -107], [78, tierY(5) + 0.6, -116], [23, tierY(6) + 0.6, -129],
      [107, 8.3, 0], [109.6, 8.3, -2.6], [117.5, 9.3, -1.5], [107, 7.8, 32], [108.6, 7.8, 30],
      [125.6, 3.2, 86.2], [128.4, 3.2, 88.2], [102.6, 2.4, 68.8], [104.4, 2.4, 70.4], [-3, SH + 0.8, -47.6], [3, SH + 0.8, -47.6]];
    const tins = () => store.get('tin', []);
    TIN.forEach((p, i) => {
      if (tins().includes(i)) return;
      const h = carry(p, [{ s: 'sphere', r: 0.16, pos: [0, 0, 0], color: C.tin, glow: 1.3, metal: 0.5 }, { s: 'cone', r: 0.11, h: 0.24, pos: [0, 0.18, 0], color: C.tin, glow: 1.3, metal: 0.5 }], () => {
        const got = tins().concat([i]); store.set('tin', got);
        w.sound('coin'); w.toast(`Tin-drop: ${got.length} of ${TIN.length}`);
        codex('tindrops');
      });
      bobbers.push(h);
    });

    // ---------- strikes: the olive's trunk, the supper bell, and (rudely) the goat ----------
    let strikeCd = 0, oliveHits = 0;
    w.on('tick', (dt) => {
      if (strikeCd > 0) strikeCd -= dt;
      if (!w.input.attack || strikeCd > 0) return;
      strikeCd = 0.38;
      const p = w.player.pos, near = (q, r) => Math.hypot(p[0] - q[0], p[2] - q[2]) < r && Math.abs(p[1] - q[1]) < 2.5;
      const hand = w.equipment().hand, info = hand && w.itemInfo(hand), blade = !!(info && info.traits.includes('blade'));
      if (near([OL[0], SH, OL[1]], 2.6)) {
        w.burst([OL[0], 29.5, OL[1]], { color: [C.olive, C.olive2], count: blade ? 18 : 6, speed: 4, life: 0.7 }); w.sound(blade ? 'slash' : 'land');
        if (!blade) return w.toast('Bare hands only rattle the leaves. A blade would bite.');
        if (!tabletAt.wheel || store.get('olive', 'crown') !== 'crown') return;
        if (++oliveHits < 3) return w.toast(oliveHits === 1 ? 'The olive shudders. Something up there wobbles.' : 'Leaves rain down. Once more.');
        store.set('olive', 'dropped'); tabletAt.wheel.off(); delete tabletAt.wheel; makeTablets();
        w.burst([OLIVE_DROP[0], 26, OLIVE_DROP[2]], { color: ['#ffe9a8', C.clay], count: 24, speed: 5, life: 0.8 }); w.sound('crumble');
        w.toast('A tablet drops out of the crown and thumps into the grass.', 'item');
      } else if (near(BELL, 2.6)) ring();
      else if ((goatUp.m.group.visible && near(G1, 2.4)) || (goatDown.m.group.visible && near(G2, 2.4)) || (goatArch.m.group.visible && near([0, SH, -48.6], 2.4))) { w.sound('land'); w.toast('"Mehh." Old Horn looks deeply offended. She doesn\'t move an inch.'); }
    });

    // ---------- the story ----------
    const done = () => (flag('lsb.ch') || 0) >= 1;
    const duskOn = () => !!flag('lsb.kessa') && !flag('lsb.beacon');
    const carried = () => TABLETS.filter((t) => w.has('lsb-tablet-' + t.k)).map((t) => t.k);
    const hints = () => {
      const back = returned(), l = TABLETS.filter((t) => t.hint && !back.includes(t.k) && !w.has('lsb-tablet-' + t.k)).map((t) => t.hint);
      return l.length ? [`I saw where ${l.length === 1 ? 'the last one' : 'they'} went: ${l.join('; ')}.`] : [];
    };
    // 1.2, at the top of the chimney
    async function greet() {
      await say('Eumaia', ['There you are. I saw the Door light up. Gods or goats, everyone takes that chimney slowly.', 'Don\'t talk yet. Feet first, then fate.']);
      const i = await ask('Eumaia', 'Well? You may say one thing before I wash you.', ['Where am I?', 'Are you a god?', 'I\'m just passing through.'], 0);
      await say('Eumaia', ['Thyra, the Door island, in the Hearth Isles, in the middle of the sea. Further than that, nobody\'s sure.',
        'Me? I\'m a goatherd with a bad hip. You came out of a shining rock. Let\'s not get ahead of ourselves.', 'Everyone is, lamb. Some of us just pass slower.'][i]);
      const eq = w.equipment();
      const look = eq.back === 'glider' ? 'Wings on your back! Fly low here, lamb. The sun isn\'t your friend.' : eq.feet === 'springboots' ? 'Shoes that jump twice. I\'ve seen those once before.' : !eq.body ? 'And your face is a lamp. That\'s new.' : null;
      if (look) await say('Eumaia', look);
      w.setFlag('lsb.met', true); codex('eumaia'); codex('thyra'); makeHearthstone();
      await say('Eumaia', ['Basin\'s over there, in my courtyard. Come along.', 'And now you\'re welcomed, the chimney will breathe you up: step on the warm stone at its foot. Nobody climbs it twice.']);
      eumaiaAt = 1; eumaia.walk(TO_COURTYARD, { speed: 2.4 }); objective();
    }
    // 1.3, feet first
    async function basinScene() {
      if (!flag('lsb.met') || flag('lsb.feet')) return;
      await say('Eumaia', ['Sit. Spring water, warmed on the hearth, thyme in it for luck.', 'Three hundred and twelve pairs of feet, and a dolphin once. Never been bitten. Don\'t spoil it.', 'Now bread and salt. Still no names.']);
      w.setFlag('lsb.feet', true); codex('xenia'); objective();
    }
    // 1.4, bread and salt; then the tremor
    async function tableScene() {
      if (!flag('lsb.feet') || flag('lsb.welcomed')) return;
      await say('Eumaia', 'Barley bread and salt from the rocks. Eat first, then I can ask. And I\'ll only ask one thing: what sign do you want on your tablet?');
      const i = await ask('Eumaia', 'A fish, a star, a wheel? Anything.', ['A door.', 'A goat.', 'Surprise me.'], 2);
      w.setFlag('lsb.sign', ['door', 'goat', 'lamp'][i]);
      await say('Eumaia', ['Cheeky. All right.', 'Old Horn will be flattered.', 'A lamp, then, since you came up by them.'][i]);
      await say('Eumaia', 'Guest-gifts. My father\'s knife. Bronze, good edge. It cuts rope, rings bells and frightens nobody. It\'s yours while you\'re our guest.');
      const prev = w.equipment().hand;
      if (prev) store.set('prevHand', prev);
      w.give('lsb-guest-knife'); w.equip('lsb-guest-knife'); w.setFlag('lsb.knife', true);
      w.toast('Press 1 (STRIKE on a phone) to strike. Strikes cut, ring and break what they reach.', 'item');
      await say('Eumaia', '(She snaps a small clay disc in two.) Your half and mine. If my grandchildren ever meet yours, the halves will fit, and they\'ll owe each other a supper.');
      w.give('lsb-token-own');
      await say('Eumaia', 'Keep a crust of that bread. You never know who\'s hungry.');
      w.give('lsb-bread', { silent: true }); w.toast('New item: Hearth Bread', 'item');
      w.setFlag('lsb.welcomed', true); objective();
      await w.wait(2);
      await tremor();
    }
    // 1.5, the tremor flings the tablets over the island
    async function tremor() {
      if (flag('lsb.tremor')) return;
      w.shake(1.4); w.sound('crumble');
      for (const p of [[37, 30, -41], [32, 25.5, -36.5], [42, 25.5, -36.5]]) w.burst(p, { color: [C.stone, C.dry], count: 30, speed: 6, life: 1 });
      for (const t of TABLETS) if (t.k !== 'bird') w.burst(SPOT[t.k], { color: ['#ffe9a8', C.clay], count: 24, speed: 6, life: 1.2 });
      w.setFlag('lsb.tremor', true);
      makeTablets(); objective();
      await say('Eumaia', ['Hold on to something! Not the goat!', 'That\'s the third this month. Oh no. My tablets. Fifty years of strangers, flung over the island like seed.', 'I can\'t climb what I used to. Six of them flew. Will you?'].concat(hints()));
      codex('tablets');
    }
    // 1.6, tablets back, one line each; then the pattern, and Linnet's token
    async function returnTablets(c) {
      for (const k of c) {
        if (!w.take('lsb-tablet-' + k)) continue;
        const back = returned().concat([k]); store.set('returned', back);
        await say('Eumaia', TABLETS.find((t) => t.k === k).line);
      }
      const n = returned().length;
      objective();
      if (n === 5 && !returned().includes('bird')) {
        makeTablets(); objective(); w.burst(SPOT.bird, { color: ['#ffe9a8', C.clay], count: 20, speed: 3, life: 0.8 });
        return say('Eumaia', 'Five. But six flew. And look: my threshold stone is crooked. Lift it, lamb; my back won\'t.');
      }
      if (n >= 6) return allSix();
      await say('Eumaia', [`${n} of six back.`].concat(hints()));
    }
    async function allSix() {
      if (flag('lsb.tablets')) return;
      await say('Eumaia', ['Laid out together, look. Every ninth summer, one goes up the mountain. I knew it. I just never laid them side by side.',
        'It\'s an honour. The House sends a ship, the stranger becomes the Voice of the god and lives in the god\'s house forever. Nobody comes back from forever.',
        'Linnet came through my Door nine summers ago, laughing. She ate everything I had and taught Old Horn to shake hands. When the House came for her, I was so proud.',
        'Thirty days ago the god stopped speaking through her. The palace says the god is fasting until the Festival, when a new Voice is seated. That\'s eight days from now. And here you are.']);
      codex('linnet');
      const i = await ask('Eumaia', 'You see what I\'m getting at, lamb?', ['Someone will come for me.', 'Why did you never ask what happened to them?', 'Why does a god need a stranger to speak?'], 0);
      await say('Eumaia', ['Tonight, if I know the House.', 'You don\'t question an honour. That was stupid of me. I\'m asking now.',
        'Because every stranger may be a god, so a stranger\'s mouth is the safest place for a god to borrow. It sounded holy at the time.'][i]);
      await say('Eumaia', 'This is the other half of Linnet\'s token. I kept it nine years. Find her, if she\'s anywhere. Give her this, so she knows Thyra remembers her.');
      w.give('lsb-token-linnet');
      w.setFlag('lsb.tablets', true);
      if (!flag('title.lsb.guest')) { w.setFlag('title.lsb.guest', true); w.toast('Title earned: Guest of Thyra', 'item'); }
      objective();
      await say('Eumaia', 'Now go down to the harbour. If anything leaves this island, it leaves from there.');
    }
    async function talkEumaia() {
      if (!flag('lsb.met')) return greet();
      if (!flag('lsb.feet')) return say('Eumaia', 'The basin, lamb. Feet first, then fate.');
      if (!flag('lsb.welcomed')) return say('Eumaia', 'Now bread and salt, at the table. Still no names.');
      if (!flag('lsb.tremor')) return tremor();
      if (duskOn()) return beacon();
      if (done()) return say('Eumaia', flag('lsb.beacon') === 'lit' ? ['Back already? The Door brings everyone back eventually.', 'Old Horn missed you. She won\'t say so.'] : ['You came back! Through the Door, of course. The soldiers let me go once I\'d told them about my hip for the third time.']);
      const c = carried();
      if (c.length) return returnTablets(c);
      if (returned().length >= 6) return allSix();
      if (flag('lsb.tablets')) return say('Eumaia', 'The harbour, lamb. Kessa\'s ship is the only one that ever leaves.');
      return say('Eumaia', [`${returned().length} of six back so far.`].concat(hints()));
    }
    const basinIt = w.interact({ pos: [30.5, SH + 0.5, -27], radius: 2.6, label: 'Wash your feet', onUse: () => basinScene() });
    const tableIt = w.interact({ pos: [35, SH + 0.5, -30.5], radius: 2.6, label: 'Bread and salt', onUse: () => tableScene() });

    // 1.7, Kyllo, and the Shadow Race: a note from the sundial to the Hearth before noon
    const RACE = 28; // the bot that runs the best line takes 19.3 s (tools/thyra_bot.mjs race)
    let race = null; // when it started (game time)
    async function talkKyllo() {
      codex('kyllo');
      if (race != null) return say('Kyllo', 'Why are you still here? Run!');
      if (store.get('raceWon', false) && !flag('lsb.sign.hermes')) {
        await say('Kyllo', ['(Somehow he is back by the sundial before you.)', 'Feet are the first gift. I\'d know.']);
        w.setFlag('lsb.sign.hermes', true); w.give('lsb-feather'); return;
      }
      if (!store.get('kyllo', false)) {
        store.set('kyllo', true);
        await say('Kyllo', ['The new arrival! You\'ve the look of the Door about you. Bit shiny round the edges, the first day.', 'Kyllo. Needles, salt, string, sky-iron beads, rumours, maps of places that may not exist. Everything\'s for trade, friend, except the road.']);
      }
      const i = await w.ask('Kyllo', 'What can I do for you?', ['How did you get here? There\'s one boat.', 'What\'s on your back?', 'Tell me a rumour.', 'A race?']);
      if (i < 0) return;
      if (i < 3) return say('Kyllo', ['I walked. Very early. Wet sand\'s no trouble if you\'re light on your feet.', 'A lyre. Made it from a tortoise when I was a baby. The tortoise was very understanding.',
        'The herdsboy at the palace says the mountain hums in a new key. He\'s tone-deaf. Lovely boy. I owe him fifty cows.'][i]);
      if (!flag('lsb.welcomed')) return say('Kyllo', 'A race to Eumaia\'s hearth, up on the Shelf, once you know the way. Go and get fed first: nobody races on an empty stomach.');
      const best = store.get('best', null);
      await say('Kyllo', `A wager? When the sundial's shadow touches the next line, it's noon. I bet you can't carry this note to Eumaia's hearth before it does.${best != null ? ` Your best is ${w.fmtTime(best)}.` : ''}`);
      const j = await ask('Kyllo', flag('lsb.sign.hermes') ? 'Prize: the glory. You\'ve had my feather.' : 'Prize: a feather from my hat. Stake: nothing.', ['You\'re on.', 'Not now.'], 1);
      if (j === 1) return say('Kyllo', 'The sun waits for nobody. I do.');
      w.give('lsb-kyllo-note', { silent: true }); w.timer.start(); race = w.time;
      w.sound('go'); w.toast(`Go! Up the cliff stair to the Hearth: ${RACE} seconds.`, 'item'); objective();
    }
    w.on('tick', () => {
      if (race == null || w.time - race <= RACE) return;
      race = null; w.timer.cancel(); if (w.has('lsb-kyllo-note')) w.take('lsb-kyllo-note');
      w.sound('lose'); w.toast('The shadow touches the line. (Kyllo, far below: "Close! The shadow cheats near noon. Again?")'); objective();
    });
    w.zone({ pos: [36, SH + 1.5, -31], size: [18, 4, 16], onEnter: () => { if (race != null && w.has('lsb-kyllo-note')) finishRace(); } });
    async function finishRace() {
      const t = w.timer.stop(); race = null; w.take('lsb-kyllo-note');
      w.record('lsb-shadow', t);
      const best = store.get('best', null);
      if (best == null || t < best) store.set('best', t);
      w.sound('win'); w.banner('WELL RUN', `${w.fmtTime(t)}${best == null || t < best ? ' · your best' : ` · best ${w.fmtTime(best)}`}`);
      const first = !store.get('raceWon', false); store.set('raceWon', true); objective();
      if (eumaiaAt === 1) await say('Eumaia', 'A note from the pedlar? It says "Well run." The cheek.');
      if (first && !flag('lsb.sign.hermes')) w.toast('Kyllo will want to hear about this.', 'item');
    }

    // 1.10, Captain Kessa: passage, and then dusk
    async function talkKessa() {
      if (done()) return say('Kessa', flag('lsb.beacon') === 'dark' ? 'Back? We put in at Pterousa at dawn, you snored under my sail the whole way. Go on, the story isn\'t written yet.' : 'You went with the palace lot, I hear. Their honey\'s good. Their bills are worse.');
      if (!store.get('kessa', false)) {
        store.set('kessa', true);
        await say('Kessa', ['Don\'t touch the cow. The ship. The Patient Cow, named after my temperament.', 'Kessa of Alashiya: tin, copper, oil, the odd goat. I\'m for Pterousa at dawn, then Kerynthos for the Festival, where everybody\'s buying and nobody\'s paying.']);
      }
      if (!flag('lsb.tablets')) return say('Kessa', 'Passage? Ask me when your business up the hill is done. Eumaia doesn\'t let a guest leave with her chores half finished.');
      if (flag('lsb.kessa')) return say('Kessa', 'You\'re booked. See those lanterns? Get up to the Watch, where Eumaia is.');
      const have = tins().length - store.get('tinSpent', 0), opts = ['I\'ll owe you.'];
      if (have >= 10) opts.push(`Ten tin-drops? (you have ${have})`);
      const i = await ask('Kessa', 'Passage is two oxen. Nobody ever has two oxen.', opts, 0);
      if (i === 1) { store.set('tinSpent', store.get('tinSpent', 0) + 10); w.setFlag('lsb.kessa', 'paid'); await say('Kessa', 'Real tin! I could kiss you. I won\'t.'); }
      else { w.setFlag('lsb.kessa', 'slate'); await say('Kessa', 'Everybody owes me. On the slate; pay me at Kerynthos.'); }
      await say('Kessa', 'And no, I\'m not Aphrodite. Every Cypriot woman gets that. I\'m not foam-born, I\'m debt-born.');
      beginDusk();
      await say('Kessa', 'Hello. Look north. Three lanterns on a sail: that\'s the House. Eumaia will be on Owl\'s Watch by now, up the goat terraces. Go and see it first.');
    }
    function beginDusk() {
      startDusk(false); shipShown = true; placeEumaia(2); goatWatch.show(true);
      w.banner('Dusk', 'A sail from the north, with three lanterns.');
      objective();
    }

    // 1.12, the beacon on Owl's Watch, and leaving Thyra
    let beaconBusy = false;
    // camera moments (w.shot; drawn only): the beacon and the sunset from the Watch, the palace ship at the quay, and the
    // island going dark from Kessa's boat. Switching from one held shot to another cuts; letting go eases back to you.
    const SHOTS = { beacon: { pos: [58, 90, -166], look: [30, 84, -140] }, herald: { pos: [128, 8.5, 37], look: [118, 6, 60] }, dark: { pos: [142, 9, 77], look: [110, 16, 18] } };
    // and night falling at the end of the chapter (the mountain's glow and the beacon stay lit)
    const NIGHT = { skyTop: '#0b0d2a', skyHorizon: '#3e3466', skyBottom: '#120f26', skySharp: 0.55, sunDir: [-0.9, 0.02, 0.3], sunColor: '#7a64b0', sunLight: '#5c6ea8', sunSize: 0.6,
      sunIntensity: 0.55, hemiSky: '#46528a', hemiGround: '#2a2034', hemiIntensity: 0.75, fog: [200, 1100], fogColor: '#29264a', stars: 1, bloom: 0.6, exposure: 0.95 };
    async function beacon() {
      if (beaconBusy || !duskOn()) return;
      beaconBusy = true;
      try {
        w.sound('countdown'); w.toast('A conch horn sounds across the water.');
        await say('Eumaia', ['The House\'s horn, asking whether Thyra has a guest. Light the beacon and it means "yes, come in". They\'ll bring music and take you to Kerynthos as the House\'s honoured guest.',
          'Leave it dark and it means "no guest tonight". They\'ll come anyway, quietly, and wonder why an old woman\'s hearth is cold.', 'I sent six strangers up that mountain with music. I\'m not choosing a seventh.']);
        const i = await w.ask('Eumaia', 'Your hand, your fire. What do we tell them?', ['Light the beacon.', 'Leave it dark.']);
        if (i < 0) { await say('Eumaia', 'Take your time, lamb. The ship is slow, and so am I.'); return; }
        if (i === 0) {
          w.setFlag('lsb.beacon', 'lit'); w.setFlag('lsb.eumaia', 'home'); w.setFlag('lsb.ch', 1); lightPyre(true);
          w.shot(SHOTS.beacon);
          await say('Eumaia', 'Then walk in by the front door. Eat their honey, listen to their music, and don\'t promise anything.');
        } else {
          w.setFlag('lsb.beacon', 'dark'); w.setFlag('lsb.eumaia', 'held'); w.setFlag('lsb.ch', 1); // (the choice ends the chapter, even if you leave mid-scene)
          w.shot(SHOTS.beacon);
          await say('Eumaia', 'Then down the goat path to Kessa. I\'ll talk to the herald. Old women bore soldiers; I\'ll bore them all night.');
        }
        await ending();
      } finally { beaconBusy = false; }
    }
    w.zone({ pos: [50, WATCH[1] + 1, -156], radius: 7, onEnter: () => { if (duskOn()) beacon(); } });
    async function ending() {
      await w.wait(1.5);
      const lit = flag('lsb.beacon') === 'lit';
      if (lit) {
        shipShown = true; shipDocked = true;
        w.player.setPos([124.8, 1.6, 58], -90);
        w.shot(SHOTS.herald); w.setTheme(NIGHT, 20);
        w.banner('The palace ship', 'Music on the water, and torches on the quay.');
        await say('Herald', 'People of Thyra! The House of the Double Axe greets your guest and invites the guest to the Festival of the Voice!');
        await say('Ikmalios', ['Thank you, Doros, they\'re right here.', 'Master Ikmalios, engineer of the House. The Wanassa likes ceremony and I like sleep; the Wanassa wins.',
          'This is the House seal. Show it to anything bronze that tries to stop you.', 'I\'m for Pterousa at dawn to buy wings. Ride with me. The wingmakers are rude, the wind\'s ruder, and the view\'s the best in the Isles.']);
        w.give('lsb-house-seal');
        w.shot(SHOTS.beacon); // (what he is looking at)
        await say('Ikmalios', '(At the stern rail, looking back at the burning beacon.) Nine years ago I stood exactly here with a girl in jumping shoes. She waved to the beacon too.');
      } else {
        w.player.setPos([136, 2.3, 63], 180);
        w.shot(SHOTS.dark);
        w.banner('The Patient Cow', 'Under Kessa\'s sail, quiet as a cat.');
        await say('Kessa', ['In. Down. Under the sail. Ammi, oars, quiet as a cat. Eumaia paid your passage in cheese. You\'re very well cheesed.',
          'See that lamp going down to the torches? That\'s her. They won\'t hurt her; she\'s too annoying to hurt. They\'ll take her to Kerynthos to explain herself, that\'s all.']);
        w.setTheme(NIGHT, 5);
        await say('Thyra', '(The palace torches close around one small lamp on the quay. Then the island goes dark, and only the mountain stays lit.)');
      }
      objective();
      w.sound('win'); w.banner('End of chapter one', 'The Last Summer of Bronze continues in The Low Wings.');
      await w.wait(6);
      w.travel('hub');
    }
    function lightPyre(on, quiet) {
      pyreFire.group.visible = on;
      if (!on || pyreLight) return;
      pyreLight = w.light({ pos: [50, WATCH[1] + 4, -158], color: '#ff9a3c', intensity: 40, distance: 40 });
      w.particles({ pos: [50, WATCH[1] + 2, -158], area: [2, 20, 2], count: 90, color: ['#ffd166', '#ff9a3c'], size: 0.25, kind: 'rise' });
      if (!quiet) { w.burst([50, WATCH[1] + 3, -158], { color: ['#ffd166', '#ff9a3c', '#ffffff'], count: 120, speed: 12, life: 1.6 }); w.sound('win'); w.shake(0.3); }
    }
    w.on('frame', (dt, t) => { if (pyreFire.group.visible) pyreFire.group.scale.set(1, 1 + Math.sin(t * 9) * 0.08, 1); });

    // ---------- the goal line: one next step at a time ----------
    function objective() {
      basinIt.enabled = !!flag('lsb.met') && !flag('lsb.feet');
      tableIt.enabled = !!flag('lsb.feet') && !flag('lsb.welcomed');
      if (race != null) return w.objective(`Run the note to Eumaia's hearth before the shadow touches the line (${RACE} s).`, { at: [37, SH + 1.5, -34] });
      if (done()) return w.objective('Chapter one is done. Kyllo\'s Shadow Race is still on, by the sundial in the harbour.');
      if (!flag('lsb.met')) {
        const up = w.player.pos[1] > SH - 1;
        return w.objective(up ? 'Eumaia is waiting by the top of the chimney.' : 'Follow the lamps up the chimney. Trust a lit step.', { at: up ? [SPOTS[0][0], SH + 2, SPOTS[0][2]] : [19, 2, -25] });
      }
      if (!flag('lsb.feet')) return w.objective('Wash your feet at the basin, as Eumaia asks.', { at: [30.5, SH + 1.4, -27] });
      if (!flag('lsb.welcomed')) return w.objective('Bread and salt at the table.', { at: [35, SH + 1.4, -30.5] });
      if (!flag('lsb.tablets')) {
        const n = returned().length, c = carried().length;
        if (c) return w.objective(`Bring the tablets back to Eumaia (${c} carried, ${n} of 6 back).`, { at: [SPOTS[1][0], SH + 2, SPOTS[1][2]] });
        if (n === 5 && tabletAt.bird) return w.objective('Lift the Hearth\'s crooked threshold stone.', { at: SPOT.bird });
        return w.objective(`Find Eumaia's guest tablets (${n} of 6 back). She saw where they flew.`);
      }
      if (!flag('lsb.kessa')) return w.objective('Go down to the harbour and find Captain Kessa on the quay.', { at: [130.6, 3.4, 59] });
      if (!flag('lsb.beacon')) return w.objective('Three lanterns on a sail. Climb the goat terraces to Owl\'s Watch.', { at: [50, WATCH[1] + 2, -156] });
    }
    w.zone({ pos: [10, SH + 1.5, -24], size: [10, 3, 16], onEnter: () => { codex('thyra'); objective(); } });
    w.on('pickup', () => objective());

    // ---------- arriving, leaving, and where everyone is ----------
    if (done()) placeEumaia(flag('lsb.eumaia') === 'held' ? -1 : 1);
    else if (duskOn()) { placeEumaia(2); startDusk(true); shipShown = true; goatWatch.show(true); }
    else placeEumaia(flag('lsb.met') ? 1 : 0);
    makeTablets();
    if (flag('lsb.beacon') === 'lit') lightPyre(true, true);
    w.on('enter', () => {
      if (flag('lsb.knife') && !w.has('lsb-guest-knife')) w.give('lsb-guest-knife', { silent: true }); // the knife is a loan: it stays on Thyra
      if (!flag('codex.lsb.door')) w.after(4, () => codex('door'));
      if (flag('lsb.welcomed') && !flag('lsb.tremor')) w.after(2, () => tremor());
      objective();
    });
    w.on('leave', () => {
      if (w.has('lsb-kyllo-note')) w.take('lsb-kyllo-note');
      if (w.has('lsb-guest-knife')) {
        w.take('lsb-guest-knife');
        const prev = store.get('prevHand', null);
        if (prev && w.has(prev)) w.equip(prev);
        store.set('prevHand', null);
      }
    });
    w.scene.userData.thyra = { eumaia, myrrha, get race() { return race; }, get eumaiaAt() { return eumaiaAt; }, get hearthstone() { return hearthstone; }, boat: boat.mesh, poolStones, tabletAt, SPOT, LEDGES, POOLS, NY, SH, WATCH, BELL, G1, G2, OL, RACE }; // for tests
  },
};
