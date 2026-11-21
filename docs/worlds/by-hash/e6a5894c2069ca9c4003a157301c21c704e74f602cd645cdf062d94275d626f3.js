// Skyreach: a climb through floating isles to a crystal summit.
// Teaches the basics (jumping, pads, moving and crumbling platforms, wind) and awards the
// Glider, an item that keeps working in every world that allows gliding.
export default {
  id: 'skyreach',
  name: 'Skyreach',
  author: 'elsewhere',
  version: 1,
  blurb: 'Climb the floating isles. The summit holds a sigil and a glider.',
  color: '#8fd3ff',
  spawn: { pos: [0, 1.5, 0], yaw: 180 },
  killY: -30,
  rules: { deny: ['board'] }, // no boards on the isles
  theme: {
    skyTop: '#2a64cf', skyHorizon: '#bfe3fb', skyBottom: '#8fc2ea', skySharp: 0.7,
    sunDir: [0.35, 0.75, -0.55], sunColor: '#fff2c8', sunSize: 2, sunLight: '#fff4e0', sunIntensity: 3.0,
    hemiSky: '#cfe6ff', hemiGround: '#7a9a6a', hemiIntensity: 1.5,
    fog: [140, 560], fogColor: '#bfe3fb', stars: 0, bloom: 0.35, exposure: 0.95,
    clouds: { y: -34, color: '#f4f9ff', opacity: 0.75 },
  },
  music: { root: 60, scale: 'major', bpm: 88, progression: [0, 3, 4, 5], sparkle: 0.3, bright: 2200, wave: 'triangle' },
  items: {
    glider: { name: 'Glider', slot: 'back', traits: ['glide'], rarity: 'rare', desc: 'Hold jump while falling to glide. Works in any world that allows gliding.',
      look: [{ s: 'rbox', size: [0.34, 0.42, 0.16], pos: [0, 0, 0], color: '#3d405b' },
        { s: 'box', size: [0.85, 0.03, 0.44], pos: [-0.52, 0.14, 0], rot: [0, 0, 12], color: '#7cf6ff', glow: 0.9 },
        { s: 'box', size: [0.85, 0.03, 0.44], pos: [0.52, 0.14, 0], rot: [0, 0, -12], color: '#7cf6ff', glow: 0.9 },
        { s: 'cyl', r: 0.05, h: 0.5, pos: [0, 0.3, 0], color: '#c0c6dd', metal: 0.6 }] },
    'sigil-sky': { name: 'Sigil of the Sky', slot: null, traits: ['key'], rarity: 'legendary', desc: 'One of three sigils that open the Vault in Junction.',
      look: [{ s: 'oct', r: 0.32, color: '#8fd3ff', glow: 2.4 }, { s: 'torus', r: 0.48, tube: 0.03, rot: [90, 0, 0], color: '#ffffff', glow: 1.6 }] },
  },

  build(w) {
    const GRASS = '#7bd389', DIRT = '#7a5a43', ROCK = '#5c4636';
    const island = (x, top, z, r, o = {}) => {
      w.cylinder({ pos: [x, top - 0.65, z], radius: r, height: 1.2, color: o.dirt || DIRT });
      w.cylinder({ pos: [x, top - 0.04, z], radius: r + 0.06, height: 0.1, color: o.grass || GRASS, collide: false });
      w.cone({ pos: [x, top - 1.25 - r * 0.75, z], radius: r * 0.96, height: r * 1.5, rot: [180, 0, 0], color: ROCK, collide: false });
    };
    const flowers = (x, top, z, r, n, seed) => {
      const R = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const a = R() * Math.PI * 2, d = r * (0.3 + R() * 0.6);
        w.sphere({ pos: [x + Math.cos(a) * d, top + 0.12, z + Math.sin(a) * d], radius: 0.12, color: R.pick(['#ff7eb6', '#ffd166', '#ffffff', '#c9a7ff']), collide: false, shadow: false });
      }
    };
    const tree = (x, top, z, s = 1) => {
      w.cylinder({ pos: [x, top + 1.1 * s, z], radius: 0.2 * s, height: 2.2 * s, color: '#6b4a35' });
      w.sphere({ pos: [x, top + 2.8 * s, z], radius: 1.3 * s, color: '#58c27d', low: true });
      w.sphere({ pos: [x + 0.5 * s, top + 3.4 * s, z + 0.3 * s], radius: 0.8 * s, color: '#6fd98f', low: true });
    };
    const coinLine = (a, b, n, lift = 1.2) => {
      for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); w.coin({ pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + lift, a[2] + (b[2] - a[2]) * t] }); }
    };

    // ---------- landing ----------
    island(0, 0, 0, 12);
    flowers(0, 0, 0, 11, 40, 7);
    tree(-7, 0, 3); tree(7.5, 0, -2, 1.2); tree(-5, 0, -7, 0.9);
    w.portal({ pos: [0, 0, 8.5], yaw: 180, to: 'hub', label: 'Junction' });
    w.sign({ pos: [4.5, 0, 2.5], yaw: -150, title: 'SKYREACH', width: 3.2, text: 'Climb to the summit of the crystal spire.\nBeacons save your progress. Fall, and you wake at the last one you touched.\nOrange tiles crumble. Gusts push. Keep moving.' });
    w.npc({ pos: [-3.5, 0, 1.5], yaw: 200, name: 'Bram', colors: { body: '#3ec8ff', head: '#ffe8cc', visor: '#ff7a45' }, hat: 'cap', onTalk: async () => {
      const best = w.store.get('best', null);
      await w.say('Bram', [
        'Skyreach! Best view in Elsewhere, if you make it to the top.',
        'The beacons on the way remember you. Fall off and you start again from the last one.',
        best ? `Your best climb so far: ${w.fmtTime(best)}. The clock starts when you leave this island.` : 'There is a clock, if you care about that sort of thing. It starts when you leave this island.',
        w.has('glider') ? 'Got the glider already? Then try gliding off the summit to the Cloud Garden.' : 'They say a glider waits at the summit. Hold jump while falling and you will float.',
      ]);
    } });

    // the crystal spire every route circles
    const SP = [16, -34];
    w.cylinder({ pos: [SP[0], 8, SP[1]], radius: 3.2, height: 64, sides: 6, color: '#9ad7ff', glow: 0.35, metal: 0.2, rough: 0.25 });
    w.model({ pos: [SP[0], 0, SP[1]], parts: [
      { s: 'torus', r: 5.2, tube: 0.12, pos: [0, 14, 0], rot: [90, 0, 0], color: '#ffffff', glow: 2 },
      { s: 'torus', r: 4.6, tube: 0.1, pos: [0, 26, 0], rot: [90, 0, 0], color: '#ffffff', glow: 2 },
    ] });

    // timer: starts when you step off the landing island
    let started = false, finished = false;
    w.zone({ pos: [0, 1, -14.5], size: [10, 6, 2], onEnter: () => {
      if (finished || started) return;
      started = true; w.timer.start(); w.objective('Climb to the summit of the crystal spire.');
    } });

    // ---------- 1: stepping stones ----------
    const stones = [[0, 0.7, -16.5], [2.6, 1.3, -20.6], [0, 1.9, -24.6], [-2.6, 2.5, -28.6], [0, 3.1, -32.4]];
    stones.forEach(([x, y, z]) => { island(x, y, z, 1.5); w.coin({ pos: [x, y + 1.3, z] }); });
    island(0, 3.7, -38.5, 4.5);
    flowers(0, 3.7, -38.5, 4, 10, 2);
    w.checkpoint({ pos: [-2.2, 3.7, -38.5], yaw: 160 });

    // ---------- 2: jump pad ----------
    w.jumpPad({ pos: [2.4, 3.7, -41], power: 20, push: [6, 0, -3.6] });
    island(10, 9.6, -46, 3.6);
    w.coin({ pos: [5.5, 10.5, -43.5] });
    tree(11.2, 9.6, -47.8, 0.8);

    // ---------- 3: moving platforms over a wide gap ----------
    const plank = (x, y, z) => w.box({ pos: [x, y, z], size: [3, 0.5, 3], color: '#c58b4b' });
    w.mover(plank(16, 9.35, -46), { path: [[16, 9.35, -46], [21, 9.35, -46]], speed: 2.4, pause: 0.7 });
    w.mover(plank(28, 9.85, -46), { path: [[23.5, 9.85, -46], [28.5, 9.85, -46]], speed: 2.4, pause: 0.7, offset: 1 });
    coinLine([16, 10, -46], [28, 10.5, -46], 4);
    island(34, 10.1, -46, 4);
    w.checkpoint({ pos: [35.5, 10.1, -47.5], yaw: 0 });

    // ---------- 4: crumbling bridge ----------
    for (let i = 0; i < 7; i++) {
      const t = w.box({ pos: [34, 10.1 + i * 0.28, -40.2 + i * 2.7], size: [2.3, 0.45, 2.3], color: '#e07a5f' });
      w.crumble(t, { delay: 0.5, respawn: 3 });
      if (i % 2) w.coin({ pos: [34, 11.6 + i * 0.28, -40.2 + i * 2.7] });
    }
    island(34, 12.3, -18.5, 4);
    flowers(34, 12.3, -18.5, 3.6, 10, 5);
    w.checkpoint({ pos: [36, 12.3, -17], yaw: -90 });

    // ---------- 5: windy beams ----------
    const gust = () => (w.time % 3.8) < 1.4;
    const beams = [[[29.5, -18.5], [20.5, -18.5]], [[15.5, -18.5], [6.5, -18.5]]];
    beams.forEach(([a, b]) => w.box({ pos: [(a[0] + b[0]) / 2, 12.05, a[1]], size: [Math.abs(a[0] - b[0]) + 0.4, 0.5, 2.2], color: '#d8c7a8' }));
    island(18, 12.3, -18.5, 2.2);
    coinLine([28, 12.3, -18.5], [8, 12.3, -18.5], 6);
    const streaks = [];
    const T = w.THREE, SR = w.rand(26);
    for (let i = 0; i < 26; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 2.4), w.mat('#ffffff', { opacity: 0.45 }));
      m.position.set(6 + SR() * 24, 12.4 + SR() * 2.6, -26 + SR() * 6);
      m.visible = false; w.add(m); streaks.push(m);
    }
    w.zone({ pos: [18, 13.5, -18.5], size: [26, 5, 6], onStay: () => { if (gust()) w.player.push([0, 0, 2.8]); } });
    let wasGust = false;
    w.on('frame', (dt) => {
      const g = gust();
      if (g && !wasGust) w.sound('boost');
      wasGust = g;
      for (const s of streaks) {
        s.visible = g;
        if (g) { s.position.z += dt * 22; if (s.position.z > -12) s.position.z = -26; }
      }
    });
    w.label({ pos: [27, 15.2, -18.5], text: 'gusts blow from the north', size: 0.35 });
    island(0, 13.2, -18.5, 3.6);
    w.checkpoint({ pos: [-1.8, 13.2, -17], yaw: 180 });

    // ---------- 6: the lift ----------
    const lift = w.box({ pos: [0, 13, -23.5], size: [2.6, 0.5, 2.6], color: '#9ad7ff', glow: 0.4 });
    w.mover(lift, { path: [[0, 12.95, -23.5], [0, 27.9, -23.5]], speed: 3.2, pause: 1.6 });
    w.label({ pos: [0, 15.5, -23.5], text: 'LIFT', size: 0.4 });
    island(0, 28.2, -29, 3.6);
    w.checkpoint({ pos: [1.8, 28.2, -30], yaw: 120 });

    // ---------- 7: the spiral to the summit ----------
    let last = null;
    for (let k = 0; k < 8; k++) {
      const a = (280 - k * 28) * Math.PI / 180, r = 11.5;
      const x = SP[0] + Math.sin(a) * r, z = SP[1] + Math.cos(a) * r, y = 28.2 + 1.35 * (k + 1);
      island(x, y, z, 1.55);
      if (k % 2 === 0) w.coin({ pos: [x, y + 1.3, z] });
      last = [x, y, z];
    }
    w.jumpPad({ pos: last, power: 17, radius: 0.9, push: [(SP[0] - last[0]) / 11.5 * 7, 0, (SP[1] - last[2]) / 11.5 * 7] });
    // summit
    const SUM = [SP[0], 41.6, SP[1]];
    island(SUM[0], SUM[1], SUM[2], 6.2, { grass: '#a8e6ff', dirt: '#7fb8d8' });
    w.checkpoint({ pos: [SUM[0] - 3.5, SUM[1], SUM[2] + 2], yaw: 0 });
    w.cylinder({ pos: [SUM[0], SUM[1] + 0.5, SUM[2]], radius: 1.1, height: 1, color: '#ffffff', metal: 0.3 });
    w.pickup({ pos: [SUM[0], SUM[1] + 2.3, SUM[2]], item: 'sigil-sky', scale: 2.2, onPick: () => w.setFlag('sigil.sky', true) });
    w.pickup({ pos: [SUM[0] + 3.2, SUM[1] + 1.4, SUM[2] - 1.5], item: 'glider', scale: 1.6 });
    w.zone({ pos: [SUM[0], SUM[1] + 2, SUM[2]], radius: 6, onEnter: () => {
      if (!started || finished) return;
      finished = true;
      const t = w.timer.stop();
      w.record('summit', t);
      const best = w.store.get('best', null);
      if (best == null || t < best) w.store.set('best', t);
      w.sound('win');
      w.burst([SUM[0], SUM[1] + 3, SUM[2]], { color: ['#8fd3ff', '#ffffff', '#ffd166'], count: 90, speed: 10, life: 1.4 });
      w.banner('SUMMIT', `${w.fmtTime(t)}${best == null || t < best ? ' · new best!' : ` · best ${w.fmtTime(best)}`}`);
      w.objective(w.has('glider') ? 'Glide to the Cloud Garden: jump off and hold Space while falling.' : 'Take the glider, then glide to the Cloud Garden.');
    } });
    w.sign({ pos: [SUM[0] + 4.5, SUM[1], SUM[2] + 2.5], yaw: -120, title: 'THE CLOUD GARDEN', width: 2.8, text: 'East of here, far below.\nJump off and hold Space while falling to glide.' });

    // ---------- the Cloud Garden: a reward for gliding ----------
    const GD = [64, 18, -30];
    island(GD[0], GD[1], GD[2], 7, { grass: '#ffd6f0', dirt: '#b98bb0' });
    flowers(GD[0], GD[1], GD[2], 6.5, 50, 11);
    tree(GD[0] - 3, GD[1], GD[2] + 2, 1.1); tree(GD[0] + 3.5, GD[1], GD[2] - 2.5, 0.9);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; w.coin({ pos: [GD[0] + Math.cos(a) * 3.5, GD[1] + 1.2, GD[2] + Math.sin(a) * 3.5], kind: 'gem', value: 2 }); }
    w.portal({ pos: [GD[0], GD[1], GD[2] + 5], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Back to the crossroads' });
    // a gentle beacon of light so the garden is easy to spot from the summit
    w.cylinder({ pos: [GD[0], GD[1] + 30, GD[2]], radius: 0.35, height: 60, color: '#ffd6f0', glow: 1.6, opacity: 0.35, collide: false, shadow: false });

    w.particles({ pos: [16, 0, -25], area: [90, 50, 90], count: 140, color: ['#ffffff', '#fff6c8'], size: 0.12, kind: 'float', speed: 0.5 });
    w.on('enter', () => { if (!started) w.objective('Talk to Bram, or just start climbing.'); });
    w.on('fall', () => { if (started && !finished) w.toast('Back to the last beacon.'); });
  },
};
