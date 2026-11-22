// The Origin: the Founder's first world, never finished (GAME.md, Act III). It opens from Junction's Vault after
// the Tuning, and nowhere else (unlisted: no portal ring, no world list).
// Everything is still a blueprint, white blocks and cyan lines on a night-blue sky, and each stretch you cross
// paints itself in colour (kept for later visits):
//   1. Lines: a climb of floating blocks, a moving platform and a launch pad.
//   2. The Void: no bridge was ever drawn. Glide, and ride the rising air.
//   3. The Guardians: two crawlers and a brute keep the gate.
//   4. The Mirror: a bridge nobody drew, except in the water far below it.
//   Then the Founder's study, and the last letter.
const PAPER = '#e6eeff', LINE = '#8fd8ff', INK = '#13203f', GOLD = '#ffd166';
const BLOOM = ['#ff7eb6', '#ffd166', '#7cf6ff', '#9dff8f', '#c9a7ff', '#ff9a5c'];

export default {
  id: 'origin',
  name: 'The Origin',
  author: 'elsewhere',
  version: 1,
  listed: false,
  blurb: "The Founder's first world, never finished.",
  color: '#8fd8ff',
  spawn: { pos: [0, 1.2, 2], yaw: 180 },
  killY: -25,
  rules: {},
  theme: {
    skyTop: '#060f2c', skyHorizon: '#1d3f86', skyBottom: '#08122e', skySharp: 0.55,
    sunDir: [-0.3, 0.75, 0.4], sunColor: '#cfe2ff', sunSize: 1.4, sunLight: '#d6e6ff', sunIntensity: 1.6,
    hemiSky: '#c4d8ff', hemiGround: '#1b2a4a', hemiIntensity: 1.25,
    fog: [70, 260], fogColor: '#0e1f48', stars: 1, bloom: 0.65, exposure: 1.05,
    clouds: { y: -20, color: '#3a5ea8', opacity: 0.35 },
  },
  music: { root: 57, scale: 'lydian', bpm: 76, progression: [0, 5, 3, 4], sparkle: 0.6, bright: 2200, wave: 'sine' },
  items: {
    'founders-mantle': {
      name: "Founder's Mantle", slot: 'back', traits: ['cosmetic'], rarity: 'legendary', desc: "Read the Founder's last letter, in the Origin.",
      look: [{ s: 'box', size: [0.6, 0.82, 0.04], pos: [0, -0.26, -0.03], rot: [8, 0, 0], color: '#22356e', glow: 0.25 },
        { s: 'box', size: [0.6, 0.06, 0.05], pos: [0, -0.66, 0.02], rot: [8, 0, 0], color: GOLD, glow: 1.6 },
        { s: 'box', size: [0.04, 0.78, 0.05], pos: [0, -0.26, 0.0], rot: [8, 0, 0], color: '#8fd8ff', glow: 1.2 },
        { s: 'torus', r: 0.1, tube: 0.02, pos: [0, 0.06, 0.02], color: GOLD, glow: 2 }],
    },
  },
  build(w) {
    const tuned = !!w.flag('hunt.tuned');
    // ---------- the sketch: white blocks with glowing edges ----------
    const edges = (x, y, z, sx, sz, color = LINE) => {
      for (const s of [-1, 1]) {
        w.box({ pos: [x, y, z + s * sz / 2], size: [sx + 0.06, 0.06, 0.06], color, glow: 1.6, collide: false, shadow: false });
        w.box({ pos: [x + s * sx / 2, y, z], size: [0.06, 0.06, sz + 0.06], color, glow: 1.6, collide: false, shadow: false });
      }
    };
    const block = (x, top, z, sx, sz, h = 1) => { const t = w.box({ pos: [x, top - h / 2, z], size: [sx, h, sz], color: PAPER, rough: 0.55 }); edges(x, top + 0.01, z, sx, sz); return t; };
    const grid = (x, top, z, sx, sz, step = 2) => {
      for (let gx = -sx / 2 + step; gx < sx / 2 - 0.1; gx += step) w.box({ pos: [x + gx, top + 0.006, z], size: [0.03, 0.01, sz], color: '#b9d6ff', glow: 0.5, collide: false, shadow: false });
      for (let gz = -sz / 2 + step; gz < sz / 2 - 0.1; gz += step) w.box({ pos: [x, top + 0.006, z + gz], size: [sx, 0.01, 0.03], color: '#b9d6ff', glow: 0.5, collide: false, shadow: false });
    };

    // ---------- arrival: the drafting plateau ----------
    block(0, 0, 0, 18, 18); grid(0, 0, 0, 18, 18);
    w.portal({ pos: [0, 0, 8], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Back to the Vault', arrive: 6 });
    w.model({ pos: [4.2, 0, -3.2], yaw: -20, parts: [ // the Founder's drafting table
      { s: 'box', size: [2.2, 0.08, 1.2], pos: [0, 1.0, 0], rot: [-12, 0, 0], color: '#f4f7ff' },
      ...[[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].map(([x, z]) => ({ s: 'box', size: [0.06, 1.0, 0.06], pos: [x, 0.5, z], color: INK })),
      { s: 'box', size: [0.7, 0.01, 0.5], pos: [-0.4, 1.06, 0.05], rot: [-12, 0, 8], color: '#ffffff' },
      { s: 'box', size: [0.6, 0.01, 0.45], pos: [0.5, 1.07, -0.05], rot: [-12, 0, -5], color: '#dfe9ff' },
      { s: 'cyl', r: 0.04, h: 0.6, pos: [0.95, 1.35, -0.4], color: INK }, { s: 'sphere', r: 0.11, pos: [0.95, 1.7, -0.32], color: '#fff2c4', glow: 2.4 },
    ] });
    w.light({ pos: [4.6, 2.2, -3.6], color: '#fff0c8', intensity: 10, distance: 9 });
    w.sign({ pos: [-4.5, 0, -2.5], yaw: 25, title: 'THE ORIGIN', width: 3.2, text: 'The first world I ever drew.\nI never finished it.\nWalk it, and see what it becomes.' });

    if (!tuned) { // sealed: only the Tuning opens it
      w.on('enter', () => { w.banner('SEALED', 'The Origin opens only to the Tuning, in Junction\'s Vault.'); w.objective('Sealed. Find the Founder\'s Echoes, then tune the Echo Stone.'); w.after(3, () => w.travel('hub')); });
      return;
    }

    // colours arrive stretch by stretch, and stay (kept in the world's store)
    const painted = () => w.store.get('painted', 0);
    const paints = [];
    const flowers = (cx, top, cz, sx, sz, n, seed) => {
      const r = w.rand(seed), parts = [];
      for (let i = 0; i < n; i++) {
        const x = cx + (r() - 0.5) * (sx - 0.6), z = cz + (r() - 0.5) * (sz - 0.6), c = r.pick(BLOOM);
        parts.push({ s: 'cyl', r: 0.02, h: 0.24, pos: [x, top + 0.12, z], color: '#3fa86a' }, { s: 'sphere', r: 0.09, pos: [x, top + 0.27, z], color: c, glow: 0.8 });
      }
      return parts;
    };
    const objectives = ['Climb the white lines.', 'Glide across the void. The rising air will carry you.', 'The guardians keep the gate. Bring them down.',
      'Cross the bridge nobody drew. Look below.', "Read the Founder's letter in the study.", 'The Origin is yours.'];
    const objective = () => w.objective(objectives[Math.min(painted(), 5)]);
    const bloom = (i, title) => {
      if (painted() >= i) return;
      w.store.set('painted', i);
      for (let k = 0; k < i && k < paints.length; k++) paints[k].group.visible = true;
      w.sound('checkpoint'); w.burst([w.player.pos[0], w.player.pos[1] + 2, w.player.pos[2]], { color: BLOOM, count: 90, speed: 9, life: 1.4 });
      if (title) w.banner(title, 'Colour comes back to the sketch.');
      objective();
    };

    // ---------- 1. LINES: a climb of floating blocks ----------
    const S1 = [[0, 1.0, -11, 3, 3], [3, 2.4, -14.5, 3, 3], [0, 3.8, -18, 3, 3], [-3, 5.2, -21.5, 3, 3]];
    for (const [x, top, z, sx, sz] of S1) block(x, top, z, sx, sz);
    w.mover(w.box({ pos: [-3, 4.9, -25.5], size: [3, 0.6, 3], color: LINE, glow: 0.35 }), { path: [[-3, 4.9, -25.5], [-3, 4.9, -33.5]], speed: 2.4, pause: 1.0 });
    block(0, 5.2, -37, 4, 4);
    w.jumpPad({ pos: [0, 5.2, -38.2], power: 19, push: [0, 0, -4], color: GOLD });
    block(0, 9.0, -45, 8, 6); grid(0, 9.0, -45, 8, 6);
    w.checkpoint({ id: 'lines', pos: [0, 9.0, -43.5], yaw: 180 });
    w.zone({ pos: [0, 10.2, -45.5], size: [8, 3, 5], onEnter: () => bloom(1, 'THE LINES') });
    paints.push(w.model({ pos: [0, 0, 0], parts: [...S1.flatMap(([x, top, z, sx, sz], i) => flowers(x, top, z, sx, sz, 7, 11 + i)), ...flowers(0, 5.2, -37, 4, 4, 6, 15), ...flowers(0, 9.0, -45, 8, 6, 16, 16)] }));

    // ---------- 2. THE VOID: no bridge was ever drawn. Glide, and ride the rising air ----------
    w.sign({ pos: [3, 9.0, -47.2], yaw: -15, title: 'NO BRIDGE', width: 2.6, text: 'I never drew a bridge here.\nGlide: jump off and hold Space.\nThe rising air will carry you.' });
    w.wind({ pos: [0, 5, -57], size: [7, 12, 7], force: [0, 26, 0] });
    w.particles({ pos: [0, 4, -57], area: [6, 12, 6], count: 60, color: ['#d6ecff', '#8fd8ff'], size: 0.1, kind: 'float', speed: 2.2 });
    w.cylinder({ pos: [0, 4, -57], radius: 3.2, height: 12, color: '#8fd8ff', glow: 0.6, opacity: 0.08, collide: false, shadow: false });
    block(0, 3.0, -74, 16, 16); grid(0, 3.0, -74, 16, 16);
    w.checkpoint({ id: 'void', pos: [0, 3.0, -67.5], yaw: 180 });
    w.zone({ pos: [0, 4.2, -68.5], size: [16, 3, 5], onEnter: () => bloom(2, 'THE VOID') });
    paints.push(w.model({ pos: [0, 0, 0], parts: [
      ...[[-7, 7, -52], [6, 5, -58], [-4, 2, -63], [8, 9, -50], [-9, 3, -60]].flatMap(([x, y, z], i) => [0, 1, 2].map((k) => ({ s: 'sphere', r: 0.9 - k * 0.15, pos: [x + k * 0.8 - 0.8, y + (k === 1 ? 0.3 : 0), z + (i % 2) * 0.3], color: '#ffffff', glow: 0.3 }))),
      ...[0, 1, 2, 3, 4, 5].map((k) => ({ s: 'box', size: [0.5, 0.5, 0.5], pos: [-6 + k * 2.4, 6 + Math.sin(k) * 1.5, -55 - k * 1.2], rot: [k * 20, k * 35, 0], color: BLOOM[k], glow: 1.2 })),
    ] }));

    // ---------- 3. THE GUARDIANS: two crawlers and a brute keep the gate ----------
    const gate = w.box({ id: 'gate', pos: [0, 5.5, -82.2], size: [6, 5, 0.5], color: INK, glow: 0.15 });
    const gateLine = w.box({ id: 'gate-line', pos: [0, 5.5, -81.9], size: [6.1, 0.08, 0.1], color: LINE, glow: 2, collide: false });
    w.sign({ pos: [-6.2, 3.0, -70], yaw: 30, title: 'THE GUARDIANS', width: 2.4, text: 'I drew them to keep the way.\nI never drew them gentle.\nPress 1 to strike. A blade helps.' });
    const openGate = () => { gate.hide(); gateLine.hide(); };
    if (painted() >= 3) openGate();
    else {
      const guards = [w.enemy({ kind: 'crawler', id: 'g1', pos: [-4, 3.2, -76], leash: 8, color: '#8fd8ff' }), w.enemy({ kind: 'crawler', id: 'g2', pos: [4, 3.2, -76], leash: 8, color: '#8fd8ff' }),
        w.enemy({ kind: 'brute', id: 'g3', pos: [0, 3.2, -79.5], hp: 170, leash: 8, color: '#b9d6ff' })];
      w.on('defeat', () => { if (guards.every((g) => !g.alive)) { openGate(); w.sound('open'); w.shake(0.5); bloom(3, 'THE GUARDIANS'); } });
    }
    paints.push(w.model({ pos: [0, 0, 0], parts: [
      ...[[-7.6, -66.4], [7.6, -66.4], [-7.6, -81.6], [7.6, -81.6]].flatMap(([x, z], i) => [{ s: 'cyl', r: 0.07, h: 3.2, pos: [x, 4.6, z], color: INK }, { s: 'box', size: [0.05, 1.3, 0.9], pos: [x, 5.4, z + 0.45], color: BLOOM[i], glow: 0.6 }]),
      ...flowers(0, 3.0, -74, 16, 16, 30, 31),
    ] }));

    // ---------- 4. THE MIRROR: a bridge nobody drew, except in the water below ----------
    const BR = [[0, -84.6], [-1.6, -87.6], [0.4, -90.6], [2.0, -93.6], [0.4, -96.6], [-1.2, -99.6]];
    for (const [x, z] of BR) w.box({ pos: [x, 2.75, z], size: [1.9, 0.5, 2.2], color: PAPER, invisible: true });
    w.box({ pos: [0, -6.1, -92], size: [24, 0.2, 24], color: '#0b2252', metal: 0.6, rough: 0.12, collide: false });
    for (const [x, z] of BR) w.box({ pos: [x, -5.96, z], size: [1.9, 0.04, 2.2], color: '#bff6ff', glow: 1.8, opacity: 0.55, collide: false, shadow: false });
    w.hazard({ pos: [0, -5.6, -92], size: [24, 1.2, 24] }); // the water sends you back to the guardians' floor
    w.sign({ pos: [5.6, 3.0, -80.8], yaw: -30, title: 'THE MIRROR', width: 2.4, text: 'I drew this bridge in the water,\nand nowhere else.\nLook down before you step.' });
    block(0, 3.0, -106, 10, 9); grid(0, 3.0, -106, 10, 9);
    w.checkpoint({ id: 'study', pos: [0, 3.0, -102.8], yaw: 180 });
    w.zone({ pos: [0, 4.2, -103], size: [10, 3, 3], onEnter: () => bloom(4, 'THE MIRROR') });
    paints.push(w.model({ pos: [0, 0, 0], parts: BR.flatMap(([x, z], i) => [{ s: 'box', size: [1.9, 0.5, 2.2], pos: [x, 2.75, z], color: BLOOM[i], glow: 0.35 }]) }));

    // ---------- the study, and the last letter ----------
    w.box({ pos: [0, 5.1, -110.3], size: [10, 4.2, 0.4], color: PAPER, rough: 0.5 });
    for (const s of [-1, 1]) w.box({ pos: [s * 4.8, 5.1, -107.4], size: [0.4, 4.2, 6], color: PAPER, rough: 0.5 });
    w.box({ pos: [0, 5.6, -110.05], size: [3.2, 2.0, 0.1], color: '#1d3f86', glow: 0.6, collide: false }); // a window onto the night
    w.model({ pos: [0, 3.0, -108.4], parts: [
      { s: 'box', size: [2.4, 0.08, 1.1], pos: [0, 0.95, 0], color: '#c9a27a' },
      ...[[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].map(([x, z]) => ({ s: 'box', size: [0.07, 0.95, 0.07], pos: [x, 0.47, z], color: '#7a5a40' })),
      { s: 'box', size: [0.5, 0.01, 0.36], pos: [0.1, 1.0, 0.2], rot: [0, 12, 0], color: '#fff8e6', glow: 0.5 },
      { s: 'cyl', r: 0.04, h: 0.5, pos: [-0.9, 1.25, -0.3], color: INK }, { s: 'sphere', r: 0.13, pos: [-0.9, 1.55, -0.3], color: '#fff2c4', glow: 2.6 },
      { s: 'box', size: [0.6, 0.06, 0.6], pos: [0, 0.5, 1.2], color: '#7a5a40' }, { s: 'box', size: [0.6, 0.7, 0.06], pos: [0, 0.85, 1.48], color: '#7a5a40' },
    ] });
    w.model({ pos: [-4.3, 3.0, -107.6], parts: [0, 1, 2, 3].flatMap((k) => [{ s: 'box', size: [0.4, 0.05, 2.4], pos: [0, 0.6 + k * 0.7, 0], color: '#7a5a40' },
      ...[0, 1, 2, 3, 4].map((b) => ({ s: 'box', size: [0.26, 0.5, 0.12], pos: [0, 0.88 + k * 0.7, -0.9 + b * 0.42], color: BLOOM[(b + k) % BLOOM.length] }))]) });
    w.light({ pos: [-0.9, 5.0, -108.6], color: '#ffe2a8', intensity: 14, distance: 10 });
    w.portal({ pos: [3.4, 3.0, -103.2], yaw: -90, size: 1.3, to: 'hub', label: 'Junction', subtitle: 'Home' });
    paints.push(w.model({ pos: [0, 0, 0], parts: [...flowers(0, 3.0, -105, 9, 6, 24, 41), ...[[-3.6, -102.4], [3.6, -109.6]].map(([x, z], i) => ({ s: 'sphere', r: 0.25, pos: [x, 6.6, z], color: BLOOM[i + 2], glow: 2.2 }))] }));

    const LETTER = [
      'You found the last room. This is where I started, and I never finished it. I kept waiting until it was perfect.',
      'Every world you walked through began as a sketch like this one. Then strangers came in, and they were what finished them.',
      'So this is yours now. Not the room: the habit. Start things before they are ready, and let other people finish them.',
    ];
    const REPLIES = ['Good. Then you will finish more than I did.', 'Good. Somebody will be glad you started it.', 'Then keep walking. That is how I found every world worth finding.'];
    w.interact({ pos: [0, 3.8, -107.4], radius: 2.4, label: "The Founder's letter", onUse: async () => {
      await w.say('The Founder', LETTER);
      const pick = await w.ask('The Founder', 'One more thing. What will you do with it?', ['Finish what I start', "Start what I can't finish", 'Keep walking']);
      await w.say('The Founder', [REPLIES[pick] || REPLIES[2]]);
      if (w.timer.running) w.record('origin', w.timer.stop());
      if (!w.flag('hunt.complete')) {
        w.setFlag('hunt.complete', true);
        w.store.set('painted', 5); paints.forEach((p) => { p.group.visible = true; });
        w.give('founders-mantle');
        w.burst([0, 6, -106], { color: BLOOM, count: 160, speed: 12, life: 1.8 });
        w.after(2.5, () => w.banner('THE ORIGIN', "The Founder's world is finished. By you."));
      }
      objective();
    } });

    paints.forEach((p, i) => { p.group.visible = painted() > i; });
    w.on('enter', () => { objective(); w.timer.start(); }); // from the plateau to the letter: on the boards ("origin")
    w.on('fall', () => w.toast('Back to the last checkpoint.'));
  },
};
