// Junction: the hub. Portals to every world, the Vault, the arcade and the shop.
// Like every world, it is a module that only talks to the engine through `w`.
const SIGILS = [
  { key: 'sky', name: 'Sigil of the Sky', color: '#8fd3ff', world: 'Skyreach' },
  { key: 'deep', name: 'Sigil of the Deep', color: '#3dffc5', world: 'Glowcave' },
  { key: 'speed', name: 'Sigil of Speed', color: '#ff4fd8', world: 'Neon Circuit' },
];
const SITE_SIEGE = 'https://definitelynotai729-bit.github.io/siege-works/';

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
  rules: {}, // every trait works here
  theme: {
    skyTop: '#0c0a2e', skyHorizon: '#ff7b8a', skyBottom: '#2a1240', skySharp: 0.5,
    sunDir: [0.55, 0.3, -0.78], sunColor: '#ffb070', sunSize: 3, sunLight: '#ffd0b0', sunIntensity: 2.8,
    hemiSky: '#b9c4ff', hemiGround: '#6a4a8a', hemiIntensity: 1.9,
    fog: [90, 420], fogColor: '#d98a7c', stars: 0.75, bloom: 0.6, exposure: 1.1,
    sky: 'sunset-sky', skyBackdrop: false, envIntensity: 0.45, // a photographed sunset lights the statues; the painted dusk stays as the backdrop
    clouds: { y: -26, color: '#ffb3d0', opacity: 0.55 },
  },
  music: { root: 57, scale: 'lydian', bpm: 66, progression: [0, 4, 5, 3], sparkle: 0.25, bright: 1600 },
  items: {
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
    crown: { name: "Founder's Crown", slot: 'head', traits: ['cosmetic'], rarity: 'legendary', desc: 'Proof you opened the Vault in Junction.',
      look: [{ s: 'cyl', r: 0.29, h: 0.14, pos: [0, 0.07, 0], color: '#ffc93c', metal: 0.85, rough: 0.3 },
        ...[0, 72, 144, 216, 288].map((a) => ({ s: 'cone', r: 0.065, h: 0.17, pos: [Math.sin(a * Math.PI / 180) * 0.25, 0.22, Math.cos(a * Math.PI / 180) * 0.25], color: '#ffc93c', metal: 0.85, rough: 0.3 })),
        { s: 'sphere', r: 0.045, pos: [0, 0.08, 0.29], color: '#ff3b6b', glow: 2 }] },
    springboots: { name: 'Spring Boots', slot: 'feet', traits: ['doublejump'], rarity: 'uncommon', desc: 'Jump a second time in mid-air. Works in any world that allows double jumps.',
      look: [{ s: 'rbox', size: [0.27, 0.16, 0.38], pos: [0, 0.01, 0.01], color: '#ff9f1c' }, { s: 'box', size: [0.28, 0.035, 0.39], pos: [0, -0.065, 0.01], color: '#ffe066', glow: 1.8 }] },
  },

  build(w) {
    const T = w.THREE, D = Math.PI / 180;
    const at = (deg, r, y = 0) => [Math.sin(deg * D) * r, y, Math.cos(deg * D) * r];
    const facing = (pos) => Math.atan2(-pos[0], -pos[2]) / D; // yaw that faces the centre

    // ---------- the plaza: polished marble with brass inlays, on a floating rock (textures: CC0, Poly Haven) ----------
    const STONE = { texture: 'stone-blocks', tile: 3.6 }, GOLD = { texture: 'metal', color: '#c9a227', metal: 0.85, rough: 0.35, tile: 3 };
    w.cylinder({ pos: [0, -2, 0], radius: 34, height: 4, color: '#7b6e9a', texture: 'marble', tile: 4.5, rough: 0.7 });
    w.cylinder({ pos: [0, -4.6, 0], radius: 31, height: 1.4, color: '#2a2348', texture: 'cliff', tile: 5, collide: false });
    w.cone({ pos: [0, -9.5, 0], radius: 29, height: 8.5, color: '#221d40', texture: 'cliff', tile: 6, rot: [180, 0, 0], collide: false });
    for (let i = 0; i < 24; i++) { // radial floor strips
      const a = i * 15;
      w.box(Object.assign({ pos: at(a, 21.5, 0.01), size: [0.25, 0.02, 21], yaw: a, collide: false, shadow: false }, GOLD, { color: '#a8873f' }));
    }
    // the inner court around the Vault, inside the gold ring: chequered marble (a skin on the floor, no collider)
    w.cylinder({ pos: [0, 0.006, 0], radius: 10.45, height: 0.012, color: '#6f6487', texture: 'marble-check', tile: 4.8, rough: 0.55, collide: false, shadow: false });
    w.model({ pos: [0, 0.03, 0], parts: [
      { s: 'torus', r: 33.4, tube: 0.09, rot: [90, 0, 0], color: '#7cf6ff', glow: 2.2 },
      { s: 'torus', r: 25, tube: 0.07, rot: [90, 0, 0], color: '#ff4fd8', glow: 2.2 },
      { s: 'torus', r: 10.5, tube: 0.07, rot: [90, 0, 0], color: '#ffd166', glow: 2.2 },
    ] });
    for (let i = 0; i < 40; i++) { // low wall around the edge
      const a = i * 9;
      w.box(Object.assign({ pos: at(a, 34.1, 0.5), size: [5.5, 1.0, 0.6], yaw: a, color: '#6c6491' }, STONE));
      w.box({ pos: at(a, 34.1, 1.03), size: [5.5, 0.07, 0.64], yaw: a, color: '#7cf6ff', glow: 1.4, collide: false });
    }
    for (let i = 0; i < 12; i++) { // garden lamps
      const p = at(i * 30 + 15, 31);
      w.asset('street-lamp', { pos: [p[0], 0, p[2]], yaw: facing(p), scale: 1.8, collide: { cyl: [0.22, 3], at: [0, 1.5, 0] } });
      w.sphere({ pos: [p[0], 2.95, p[2]], radius: 0.16, color: '#ffd6a5', glow: 3, collide: false, shadow: false });
    }
    // planters with low-poly trees
    const tree = (p, c) => {
      w.cylinder(Object.assign({ pos: [p[0], 0.4, p[2]], radius: 1.7, height: 0.8, color: '#6c6491' }, STONE));
      w.cylinder({ pos: [p[0], 0.82, p[2]], radius: 1.55, height: 0.06, color: '#3e5a35', texture: 'grass', tile: 3, collide: false });
      w.cylinder({ pos: [p[0], 2.0, p[2]], radius: 0.18, height: 2.6, color: '#5b3a4a' });
      w.sphere({ pos: [p[0], 3.8, p[2]], radius: 1.5, color: c, low: true, glow: 0.25 });
      w.sphere({ pos: [p[0] + 0.6, 4.6, p[2] - 0.3], radius: 0.9, color: c, low: true, glow: 0.25 });
    };
    [[30, '#ff7eb6'], [-30, '#7afcff'], [100, '#7afcff'], [-100, '#ff7eb6'], [150, '#c9a7ff'], [-150, '#c9a7ff']].forEach(([a, c]) => tree(at(a, 15), c));

    // ---------- the Vault ----------
    for (let i = 1; i < 14; i++) { // stone walls
      const a = (i * 360) / 14;
      w.box(Object.assign({ pos: at(a, 6, 3.5), size: [2.85, 7, 0.7], yaw: a, color: i % 2 ? '#6a6294' : '#625a8a' }, STONE));
    }
    w.box(Object.assign({ pos: at(-14, 6.35, 3.6), size: [0.7, 7.2, 0.9], yaw: 0 }, GOLD));
    w.box(Object.assign({ pos: at(14, 6.35, 3.6), size: [0.7, 7.2, 0.9], yaw: 0 }, GOLD));
    w.box(Object.assign({ pos: [0, 7.1, 6.3], size: [3.9, 0.6, 0.9] }, GOLD));
    w.cylinder(Object.assign({ pos: [0, 7.45, 0], radius: 6.5, height: 0.7, color: '#4f4877' }, STONE));
    w.sphere({ pos: [0, 7.7, 0], radius: 5.6, color: '#4a4278', texture: 'metal', metal: 0.75, rough: 0.4, tile: 3 }); // a lacquered metal dome
    w.model({ pos: [0, 0, 0], parts: [
      { s: 'torus', r: 6.55, tube: 0.1, pos: [0, 7.1, 0], rot: [90, 0, 0], color: '#ffd166', glow: 1.8 },
      { s: 'torus', r: 6.2, tube: 0.12, pos: [0, 0.3, 0], rot: [90, 0, 0], color: '#ffd166', glow: 1.2 },
      { s: 'torus', r: 3.2, tube: 0.1, pos: [0, 12.1, 0], rot: [90, 0, 0], color: '#ffd166', glow: 1.8 },
    ] });
    w.label({ pos: [0, 15.6, 0], text: 'JUNCTION', size: 1.5, color: '#ffe9a8', bg: 'rgba(0,0,0,0)' });
    const door = w.box(Object.assign({ id: 'vault-door', pos: [0, 3.3, 6.05], size: [2.8, 6.6, 0.45] }, GOLD, { color: '#b8901f', rough: 0.3 }));
    const doorGlyph = w.model({ pos: [0, 3.5, 6.3], parts: [
      { s: 'torus', r: 0.8, tube: 0.06, rot: [0, 0, 0], color: '#ffe9a8', glow: 2 },
      { s: 'oct', r: 0.35, color: '#ffe9a8', glow: 1.5 },
    ] });
    const sockets = SIGILS.map((s, i) => {
      const pos = [(i - 1) * 1.25, i === 1 ? 9.3 : 8.75, 5.95];
      w.model({ pos, parts: [{ s: 'cyl', r: 0.42, h: 0.12, rot: [90, 0, 0], color: '#25223f' }] });
      const dim = w.model({ pos: [pos[0], pos[1], pos[2] + 0.12], parts: [{ s: 'oct', r: 0.3, color: '#4a4766' }] });
      const lit = w.model({ pos: [pos[0], pos[1], pos[2] + 0.12], parts: [{ s: 'oct', r: 0.32, color: s.color, glow: 2.6 }] });
      w.spin(lit, { speed: 1.2 });
      return { s, dim, lit };
    });
    const vaultOpen = () => !!w.store.get('open', false);
    const owned = (k) => w.has('sigil-' + k) || !!w.flag('sigil.' + k);
    const count = () => SIGILS.filter((s) => owned(s.key)).length;
    const refreshSockets = () => sockets.forEach((k) => { const on = vaultOpen() || owned(k.s.key); k.lit.group.visible = on; k.dim.group.visible = !on; });
    refreshSockets();

    // inside the vault
    w.cylinder(Object.assign({ pos: [0, 0.6, -1], radius: 0.9, height: 1.2 }, GOLD));
    w.light({ pos: [0, 5, 0], color: '#ffd27a', intensity: 40, distance: 12 });
    w.sign({ pos: [0, 0, -4.9], yaw: 0, title: 'HALL OF FIRSTS', text: 'You opened the Vault.\nThe Founder\'s Crown is yours: it shows in every world.\nWhen the chain launches, the first explorers to open the Vault will be recorded on it permanently.', width: 4.2 });
    let crownSpawned = false;
    // the dome's collider is a solid sphere (its underside is a 2.1 m ceiling in here), and the pedestal keeps
    // you 1.75 m from the crown: the pickup radius has to reach a player standing beside the pedestal
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
      w.burst([0, 5, 7], { color: ['#ffd166', '#ffffff', '#ff4fd8', '#7cf6ff'], count: 120, speed: 12, life: 1.6 });
      spawnCrown(); objective();
      w.after(0.9, () => w.banner('THE VAULT IS OPEN', 'Walk inside and claim the Founder\'s Crown.'));
    } });
    w.on('frame', (dt) => {
      if (doorAnim > 0 && door.mesh) { doorAnim += dt; door.mesh.position.y = 3.3 + Math.min(1, doorAnim / 2.4) * 6.8; if (doorAnim > 2.6) { door.hide(); doorAnim = 0; } }
    });

    // ---------- statuary and furniture (CC0 models from Poly Haven; see CREDITS.md) ----------
    const plinth = (x, z, sx, h, sz, yaw) => w.box({ pos: [x, h / 2, z], size: [sx, h, sz], yaw, color: '#d9d2c3', texture: 'marble', tile: 1.5, rough: 0.4 });
    for (const sx of [-1, 1]) { // two stone guardians at the Vault door
      plinth(sx * 3.7, 8.8, 1.5, 0.5, 1.5, 0);
      w.asset('gothic-statue', { pos: [sx * 3.7, 0.5, 8.8], yaw: 0, scale: 1.15, collide: { cyl: [0.5, 1.9], at: [0, 0.95, 0] } });
    }
    for (const a of [-22, 22]) { // marble busts flanking the Creator's Gate
      const p = at(a, 27);
      plinth(p[0], p[2], 0.9, 1.25, 0.9, facing(p));
      w.asset('marble-bust', { pos: [p[0], 1.25, p[2]], yaw: facing(p), scale: 2.3 });
    }
    { const p = at(160, 27); plinth(p[0], p[2], 2.4, 0.9, 1.4, facing(p) + 90); w.asset('horse-statue', { pos: [p[0], 0.9, p[2]], yaw: facing(p) + 90, scale: 9, collide: { box: [1.4, 2, 0.6], at: [0, 1, 0] } }); }
    { const p = at(-160, 27); plinth(p[0], p[2], 2, 0.4, 2, facing(p)); w.asset('whale-statue', { pos: [p[0], 0.4, p[2]], yaw: facing(p), scale: 1.7, collide: { box: [1.6, 2.2, 1.6], at: [0, 1.1, 0] } }); }
    for (const a of [-48, 48]) { // benches, each with a potted plant
      const p = at(a, 27.5), f = facing(p);
      w.asset('bench', { pos: [p[0], 0, p[2]], yaw: f, scale: 1.15, collide: { box: [1.3, 0.5, 0.55], at: [0, 0.25, 0] } });
      const q = at(a + (a > 0 ? 4 : -4), 27.5);
      w.asset('potted-plant', { pos: [q[0], 0, q[2]], yaw: a * 3, scale: 1.3, collide: { cyl: [0.4, 0.9], at: [0, 0.45, 0] } });
    }
    for (const sx of [-1, 1]) w.asset('potted-plant', { pos: [sx * 10.1, 0, 8.3], yaw: sx * 40, scale: 1.1, collide: { cyl: [0.35, 0.8], at: [0, 0.4, 0] } });

    // ---------- portals ----------
    const portal = (to, deg, r) => {
      const pos = at(deg, r);
      const sg = SIGILS.find((s) => s.world === (w.worlds.find((x) => x.id === to) || {}).name);
      const done = sg && owned(sg.key);
      w.portal({ pos, yaw: facing(pos), to, subtitle: done ? `✓ ${sg.name} found` : undefined });
    };
    const has = (id) => w.worlds.some((x) => x.id === id);
    if (has('skyreach')) portal('skyreach', -62, 22);
    if (has('glowcave')) portal('glowcave', 62, 22);
    if (has('circuit')) portal('circuit', 180, 22);
    if (has('rush')) portal('rush', -90, 22);
    if (has('clash')) portal('clash', 90, 22);
    // any other world in the registry gets a portal in the outer ring automatically
    const known = ['hub', 'skyreach', 'glowcave', 'circuit', 'rush', 'clash'];
    const extra = w.worlds.filter((x) => !known.includes(x.id));
    extra.forEach((x, i) => { const pos = at(-118 + i * 30, 26); w.portal({ pos, yaw: facing(pos), to: x.id }); });

    // ---------- creator's gate: where community worlds will appear ----------
    const gate = at(0, 28);
    w.model({ pos: [gate[0], 2.7, gate[2]], yaw: 180, parts: [
      { s: 'torus', r: 2.4, tube: 0.22, color: '#3b3f5c', metal: 0.6 },
      { s: 'torus', r: 2.0, tube: 0.05, color: '#9d7bff', glow: 1.2, opacity: 0.6 },
    ] });
    w.box(Object.assign({ pos: [gate[0], 0.15, gate[2]], size: [6.6, 0.3, 2.6], color: '#3b3a58' }, STONE));
    w.label({ pos: [gate[0], 6.2, gate[2]], text: 'COMMUNITY WORLDS', size: 0.6, color: '#c9b6ff', border: '#9d7bff' });
    // community worlds: levels made by players, published on the ledger (the list is a UI panel; world code never reads it)
    w.interact({ pos: [gate[0], 1, gate[2] - 1.5], radius: 3, label: "The Creator's Gate", onUse: () => w.openPanel('gate') });

    // ---------- welcome sign, guide, registry terminal ----------
    w.sign({ pos: [4.2, 0, 15], yaw: -28, title: 'WELCOME TO JUNCTION', width: 3.6, text: 'Portals lead to other worlds. Items you earn keep their powers in every world that allows them.\nFind the three sigils to open the Vault.\nW/S move · A/D turn · Q/E strafe · F use · Space jump · I items · M worlds' });
    const metWren = () => !!w.flag('met.wren');
    const objective = () => {
      if (vaultOpen()) return w.objective(w.has('crown') ? '' : 'Claim the crown inside the Vault.');
      if (!metWren()) return w.objective('Talk to Wren, the guide (walk up and press F).');
      const n = count();
      w.objective(n === 3 ? 'All three sigils found! Open the Vault in the middle of Junction.' : `Sigils found: ${n} of 3. Portals: Skyreach (left), Glowcave (right), Neon Circuit (behind the Vault).`);
    };
    w.npc({ pos: [-3.2, 0, 14.2], yaw: 150, name: 'Wren', colors: { body: '#ffb13b', head: '#fff3e0', visor: '#3ec8ff' }, hat: 'antenna', wave: true, onTalk: async () => {
      const n = count();
      if (!metWren()) {
        await w.say('Wren', [
          'Oh! A new face. Welcome to Junction, the crossroads of Elsewhere.',
          'Every portal here leads to a different world, and each one is a module that can be swapped, updated or added by anyone.',
          'The good part: items keep their powers between worlds. A glider you win in Skyreach still glides in Glowcave, as long as that world allows gliding.',
          'Each world sets its own rules. A racing world might switch off gliders to keep things fair. Press I to see which of your items work where you are.',
          'And the Vault behind me has been sealed since the beginning. It needs three sigils: Sky, Deep and Speed. One waits in each world.',
          'I would start with Skyreach, the portal on your left. Press M any time to see every world.',
        ]);
        w.setFlag('met.wren', true); objective();
        return;
      }
      const tips = [
        n === 0 ? 'Skyreach is the gentlest start: climb the floating isles and the Sky sigil waits at the summit.' : null,
        !w.has('glider') ? 'Rumour says the summit of Skyreach also hides a glider. Gliders change everything.' : null,
        w.has('glider') && !owned('deep') ? 'Glowcave is dark and full of chasms. Your glider will carry you across. Pick up a lantern on the way in.' : null,
        !owned('speed') ? 'Neon Circuit is behind the Vault. Beat the track time and the Speed sigil is yours. Hold W, steer with A and D.' : null,
        w.worlds.some((x) => x.id === 'rush') ? 'Crystal Rush, the pink portal past Skyreach, is a ninety-second crystal hunt. Post a good score to the ledger from the Hall of Records.' : null,
        'Pim at the shop sells hats and Spring Boots. Coins are scattered everywhere, including up high.',
        'Look up. Some of the floating rocks around Junction can be climbed, and the jump pad on the east side is a good start.',
        'Any web game can live in an arcade cabinet. The siege cabinet pays out coins for stars.',
      ].filter(Boolean);
      await w.say('Wren', [tips[(w.ticks >> 4) % Math.min(tips.length, 4)]]);
    } });
    w.on('pickup', (id) => { if (id === 'crown' || id === 'antenna') objective(); });
    w.on('firstVisit', () => { w.toast('Wren the guide wants a word. Walk over and press F.'); objective(); });
    w.on('enter', () => { objective(); refreshSockets(); if (count() === 3 && !vaultOpen()) w.after(1.2, () => w.banner('THE SIGILS ARE HUMMING', 'Take them to the Vault.')); });
    objective();

    // registry terminal
    const term = [8.5, 0, 9.5], CASE = { texture: 'metal', color: '#2c3157', metal: 0.6, rough: 0.45, tile: 1.5 };
    w.box(Object.assign({ pos: [term[0], 0.9, term[2]], size: [1.1, 1.8, 0.7], yaw: -40 }, CASE));
    w.box({ pos: [term[0] - 0.05, 1.6, term[2] + 0.06], size: [1.0, 0.7, 0.62], yaw: -40, color: '#7cf6ff', glow: 1.2, collide: false });
    w.label({ pos: [term[0], 2.6, term[2]], text: `REGISTRY · ${w.worlds.length} WORLDS`, size: 0.34, border: '#7cf6ff' });
    w.interact({ pos: term, radius: 2.6, label: 'World registry', onUse: () => w.openPanel('map') });
    // the Hall of Records: verified runs and the season-0 ledger (a UI panel; world code never reads the ledger)
    const hall = [-8.5, 0, 9.5];
    w.box(Object.assign({ pos: [hall[0], 0.9, hall[2]], size: [1.1, 1.8, 0.7], yaw: 40 }, CASE));
    w.box({ pos: [hall[0] + 0.05, 1.6, hall[2] + 0.06], size: [1.0, 0.7, 0.62], yaw: 40, color: '#ffd166', glow: 1.2, collide: false });
    w.label({ pos: [hall[0], 2.6, hall[2]], text: 'HALL OF RECORDS · verified play', size: 0.34, border: '#ffd166' });
    w.interact({ pos: hall, radius: 2.6, label: 'Hall of Records', onUse: () => w.openPanel('records') });

    // ---------- arcade ----------
    const arc = at(-132, 21), ay = facing(arc);
    const DECK = { texture: 'planks', color: '#4a3a52', tile: 2.2 }, ROOF = { texture: 'planks', color: '#3a3158', tile: 2.2 };
    w.box(Object.assign({ pos: [arc[0], 0.15, arc[2]], size: [10, 0.3, 7], yaw: ay }, DECK));
    w.box(Object.assign({ pos: [arc[0], 4.3, arc[2]], size: [10.4, 0.35, 7.4], yaw: ay }, ROOF));
    w.box({ pos: [arc[0], 4.1, arc[2]], size: [10.5, 0.08, 7.5], yaw: ay, color: '#ff4fd8', glow: 2, collide: false });
    for (const [dx, dz] of [[-4.8, -3.3], [4.8, -3.3], [-4.8, 3.3], [4.8, 3.3]]) {
      const c = Math.cos(ay * D), s = Math.sin(ay * D);
      w.cylinder(Object.assign({ pos: [arc[0] + dx * c + dz * s, 2.2, arc[2] - dx * s + dz * c], radius: 0.2, height: 4 }, GOLD, { color: '#8a7a9a' }));
    }
    w.label({ pos: [arc[0], 5.3, arc[2]], text: 'ARCADE', size: 0.8, color: '#ffb3f0', border: '#ff4fd8' });
    const cab = (dx, title, url, color, onMessage) => {
      const c = Math.cos(ay * D), s = Math.sin(ay * D), dz = -1.8;
      w.cabinet({ pos: [arc[0] + dx * c + dz * s, 0.3, arc[2] - dx * s + dz * c], yaw: ay, title, url, color, onMessage, emptyText: ['This cabinet is waiting for a game.', 'Any web game can be plugged into a cabinet: it runs in a sandboxed frame and can report scores back to Elsewhere.'] });
    };
    const siegeStars = w.store.get('siegeStars', {});
    cab(0, 'Siegeworks', SITE_SIEGE, '#ffcd4d', (msg) => {
      if (!msg || msg.source !== 'siegeworks' || msg.type !== 'result') return;
      const key = String(msg.fort || '').slice(0, 20), stars = Math.max(0, Math.min(3, msg.stars | 0));
      const prev = siegeStars[key] || 0;
      if (stars > prev) {
        siegeStars[key] = stars; w.store.set('siegeStars', siegeStars);
        w.addCoins((stars - prev) * 3); w.toast(`Arcade: +${(stars - prev) * 3} coins for ${stars} star${stars > 1 ? 's' : ''}`, 'item');
      }
    });
    cab(-3, 'Empty cabinet', null, '#5c6390');
    cab(3, 'Empty cabinet', null, '#5c6390');

    // ---------- shop ----------
    const shopPos = at(132, 21), sy = facing(shopPos);
    w.box(Object.assign({ pos: [shopPos[0], 0.15, shopPos[2]], size: [8, 0.3, 6], yaw: sy }, DECK));
    const fwd = (p, d, side = 0) => { const c = Math.cos(sy * D), s = Math.sin(sy * D); return [p[0] + Math.sin(sy * D) * d + side * c, p[1], p[2] + Math.cos(sy * D) * d - side * s]; };
    const counter = fwd(shopPos, 0.6);
    w.box({ pos: [counter[0], 0.85, counter[2]], size: [5, 1.1, 1], yaw: sy, color: '#6b4f3f', texture: 'planks', tile: 1.6 });
    w.box({ pos: [counter[0], 1.43, counter[2]], size: [5.1, 0.08, 1.1], yaw: sy, color: '#62e39b', glow: 1.6, collide: false });
    { const l = fwd(shopPos, 0.6, 1.8); w.asset('brass-lantern', { pos: [l[0], 1.47, l[2]], yaw: sy, scale: 2.2 }); }
    w.box(Object.assign({ pos: [shopPos[0], 4.4, shopPos[2]], size: [8.4, 0.3, 6.4], yaw: sy }, ROOF));
    w.box({ pos: [shopPos[0], 4.2, shopPos[2]], size: [8.5, 0.08, 6.5], yaw: sy, color: '#62e39b', glow: 2, collide: false });
    for (const side of [-3.8, 3.8]) for (const d of [-2.8, 2.8]) { const p = fwd(shopPos, d, side); w.cylinder(Object.assign({ pos: [p[0], 2.2, p[2]], radius: 0.2, height: 4 }, GOLD, { color: '#8a7a9a' })); }
    w.label({ pos: [shopPos[0], 5.4, shopPos[2]], text: 'SHOP', size: 0.8, color: '#c8ffe0', border: '#62e39b' });
    const pim = fwd(shopPos, -0.6);
    const listing = [
      { item: 'cap', price: 10 }, { item: 'partyhat', price: 15 }, { item: 'antenna', price: 20 },
      { item: 'springboots', price: 35 }, { item: 'tophat', price: 40 }, { item: 'halo', price: 75 },
    ];
    w.npc({ pos: [pim[0], 0.3, pim[2]], yaw: sy, name: 'Pim', colors: { body: '#62e39b', head: '#2b2f45', visor: '#ffe066' }, hat: 'tophat', label: 'Shop with Pim', onTalk: async () => {
      if (!w.flag('met.pim')) { w.setFlag('met.pim', true); await w.say('Pim', ['Welcome, welcome! Everything here works in every world. Well, hats do. Boots depend on the world\'s rules.', 'Coins are scattered all over Elsewhere. Have a look.']); }
      w.shop("Pim's Wares", listing);
    } });

    // ---------- toys and secrets ----------
    // the Junction Cup: kick the big ball through the hoop
    const ball = w.ball({ pos: [6, 3, 11], radius: 0.9, color: '#ff5d8f' });
    w.ball({ pos: [-7, 3, 4], radius: 0.6, color: '#7cf6ff' });
    const hoop = at(40, 23); const hy = facing(hoop);
    w.model({ pos: [hoop[0], 2.6, hoop[2]], yaw: hy, parts: [
      { s: 'torus', r: 1.9, tube: 0.16, color: '#ff5d8f', glow: 2.2 },
      { s: 'cyl', r: 0.12, h: 0.8, pos: [0, -2.2, 0], color: '#3a3366' },
    ] });
    w.box(Object.assign({ pos: [hoop[0], 0.15, hoop[2]], size: [2.6, 0.3, 1.2], yaw: hy, color: '#3b3a58' }, STONE));
    w.label({ pos: [hoop[0], 5.3, hoop[2]], text: 'JUNCTION CUP · kick the big ball through', size: 0.36, border: '#ff5d8f' });
    let goals = w.store.get('goals', 0), goalCool = 0;
    w.on('tick', () => {
      const t = ball.body.translation();
      const dx = t.x - hoop[0], dz = t.z - hoop[2], dy = t.y - 2.6;
      // inside the ring's disc: close to its plane and within its radius
      const along = dx * Math.sin(hy * D) + dz * Math.cos(hy * D);
      const across = Math.hypot(dx - along * Math.sin(hy * D), dz - along * Math.cos(hy * D), dy);
      if (Math.abs(along) < 0.6 && across < 1.6 && w.time > goalCool) {
        goalCool = w.time + 4; goals++; w.store.set('goals', goals);
        w.sound('win'); w.burst([hoop[0], 2.6, hoop[2]], { color: ['#ff5d8f', '#ffd166', '#7cf6ff'], count: 70, speed: 9, life: 1.2 });
        w.banner('GOAL!', `Junction Cup goals: ${goals}`);
        if (goals <= 5) { w.addCoins(2); w.toast('+2 coins for a goal'); }
        w.after(1.5, () => { ball.body.setTranslation({ x: 6, y: 3, z: 11 }, true); ball.body.setLinvel({ x: 0, y: 0, z: 0 }, true); ball.body.setAngvel({ x: 0, y: 0, z: 0 }, true); });
      }
    });
    // plaza coins
    [[0, 25], [-12, 12], [12, 12], [-20, -4], [20, -4], [-9, -18], [9, -18], [0, -28]].forEach(([x, z]) => w.coin({ pos: [x, 1.1, z] }));
    // the sky path: a jump pad on the east side, floating rocks spiralling up
    w.jumpPad({ pos: [29.5, 0, 0], power: 23, color: '#ffcf3f' });
    w.label({ pos: [29.5, 3.2, 0], text: '↑ up you go', size: 0.35 });
    const rocks = [[35, 7, 0, 2.2], [36, 8.4, -5.2, 1.8], [33, 9.8, -10.4, 1.6], [28.4, 11.2, -14.2, 1.6], [22.4, 12.6, -16.4, 1.9], [15.5, 17.4, -20.5, 3.4]];
    rocks.forEach(([x, y, z, r], i) => {
      w.cylinder({ pos: [x, y, z], radius: r, height: 1.2, color: '#5a4a80', texture: 'cliff', tile: 2.5, sides: 8 });
      w.cone({ pos: [x, y - 2.0, z], radius: r * 0.9, height: 2.8, color: '#3f3363', texture: 'cliff', tile: 2.5, rot: [180, 0, 0], collide: false });
      w.cylinder({ pos: [x, y + 0.62, z], radius: r * 0.92, height: 0.06, color: '#7a5cff', glow: 0.5, collide: false });
      if (i < 5) w.coin({ pos: [x, y + 1.6, z] });
    });
    w.jumpPad({ pos: [22.4, 13.2, -16.4], power: 19, color: '#ff4fd8', radius: 0.9 });
    const top = rocks[5];
    w.pickup({ pos: [top[0], top[1] + 1.7, top[2]], item: 'antenna' });
    w.sign({ pos: [top[0] - 1.8, top[1] + 0.6, top[2] + 1.2], yaw: 130, title: 'VIEWPOINT', text: 'A glider could carry you from here to the top of the Vault dome. Something glitters up there.', width: 2.6 });
    // dome cache, reachable by gliding
    for (let i = 0; i < 5; i++) w.coin({ pos: [Math.sin(i * 1.256) * 1.6, 14.4, Math.cos(i * 1.256) * 1.6], kind: 'gem', value: 2 });

    w.particles({ pos: [0, 1, 0], area: [70, 16, 70], count: 120, color: ['#ffd6a5', '#ff9ecf', '#9fe7ff'], size: 0.14, kind: 'float', speed: 0.6 });

    // a ringed planet hanging over the horizon, beyond the fog
    const planet = new T.Group();
    const pm = new T.MeshBasicMaterial({ color: '#7d5fd6', fog: false });
    const orb = new T.Mesh(new T.SphereGeometry(70, 48, 32), pm);
    const shade = new T.Mesh(new T.SphereGeometry(70.5, 48, 32, 0, Math.PI), new T.MeshBasicMaterial({ color: '#2a1a55', fog: false, transparent: true, opacity: 0.55 }));
    shade.rotation.y = -Math.PI / 2;
    const ring = new T.Mesh(new T.RingGeometry(95, 150, 96), new T.MeshBasicMaterial({ color: '#ffb3e6', fog: false, transparent: true, opacity: 0.45, side: T.DoubleSide }));
    ring.rotation.x = Math.PI / 2.25;
    planet.add(orb, shade, ring);
    planet.position.set(-420, 160, -520);
    planet.rotation.z = 0.35;
    w.add(planet);
  },
};
