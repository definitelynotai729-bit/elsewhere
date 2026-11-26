// Skyreach: a climb through floating isles to a crystal summit.
// Teaches the basics (jumping, pads, moving and crumbling platforms, wind) and awards the
// Glider, an item that keeps working in every world that allows gliding.
// The look follows ART.md: low-poly isles in flat meadow colours under a clear midday sky.
const C = {
  grass: '#7cc35a', dirt: '#b07d55', rock: '#9a7052', moss: '#78b45a', stone: '#a8a08a', stone2: '#8b836f',
  wood: '#b07a45', wood2: '#7a5238', leaf: '#5fae55', leaf2: '#7cc463', crumble: '#ef8a5f', beam: '#d9c49e',
  flower: ['#ff7eb6', '#ffd166', '#ffffff', '#c9a7ff'],
};
// Season 2 of the Founder's hunt (GAME.md): the stranger (the same look as in Junction), and the climb they race you up.
// The path is a recorded run, one point every `step` ticks in decimetres with a grounded bit; `head` is your head start
const STRANGER_LOOK = { style: 'tall', face: 'eyes', mouth: 'none', outfit: 'poncho', extra: 'satchel', colors: { body: '#5b5f6b', head: '#d9a066', eyes: '#ffe9a8', outfit: '#8a909c', trim: '#c9a35a' } };
// (rests: [point, seconds] where they stop for a breather and look back down the climb; recorded by tools/skyreach_bot.mjs --ghost)
const RACE = { step: 10, head: 60, rests: [[30, 12], [96, 12], [120, 12], [252, 12]],
  path: '21,9,-94,1;11,9,-99,1;3,9,-105,1;2,9,-118,1;2,15,-131,0;1,24,-145,0;0,23,-158,0;0,16,-170,1;8,15,-181,1;16,28,-192,0;24,33,-203,0;29,27,-211,0;28,22,-217,1;19,25,-226,0;10,36,-236,0;0,38,-246,0;-6,29,-252,0;-11,31,-261,0;-18,43,-273,0;-25,45,-284,0;-30,37,-292,0;-26,34,-298,1;-17,43,-308,0;-7,51,-317,0;2,49,-326,0;7,40,-331,1;6,53,-341,0;2,58,-353,0;-1,52,-365,0;0,46,-374,1;7,46,-385,1;15,46,-396,1;22,68,-403,0;28,91,-411,0;31,107,-416,0;31,114,-418,0;28,113,-416,0;24,103,-411,0;22,85,-407,0;19,59,-402,0;27,76,-407,0;38,98,-415,0;49,112,-423,0;60,118,-431,0;70,115,-438,0;81,105,-446,1;94,105,-450,1;107,105,-454,1;119,105,-458,1;124,105,-459,1;124,105,-459,1;124,105,-459,1;124,105,-459,1;124,105,-459,1;124,105,-459,1;136,105,-460,1;147,105,-460,1;157,105,-460,1;157,105,-460,1;161,105,-460,1;165,105,-460,1;169,105,-460,1;173,105,-460,1;177,105,-460,1;181,105,-460,1;185,105,-460,1;189,105,-460,1;193,105,-460,1;197,105,-460,1;201,105,-460,1;205,105,-460,1;207,105,-460,1;207,105,-460,1;207,105,-460,1;207,105,-460,1;212,105,-460,1;215,105,-460,1;215,105,-460,1;219,110,-460,1;230,110,-460,1;236,110,-460,1;240,110,-460,1;244,110,-460,1;248,110,-460,1;252,110,-460,1;256,110,-460,1;260,110,-460,1;264,110,-460,1;268,110,-460,1;272,110,-460,1;276,110,-460,1;281,110,-460,1;295,110,-460,1;308,110,-460,1;320,110,-460,1;326,110,-453,1;333,110,-442,1;338,110,-433,1;339,110,-421,1;339,113,-408,1;339,113,-395,1;339,115,-383,1;339,115,-370,1;339,118,-358,1;339,118,-345,1;339,121,-333,1;340,121,-319,1;340,123,-307,1;340,124,-295,1;340,125,-282,1;340,127,-269,1;340,127,-256,1;340,129,-243,1;340,129,-230,1;340,132,-219,1;333,132,-208,1;327,132,-196,1;322,132,-188,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;320,132,-185,1;318,132,-185,1;305,132,-185,1;292,132,-185,1;278,132,-185,1;265,132,-185,1;252,132,-185,1;238,132,-185,1;225,132,-185,1;212,132,-185,1;198,132,-185,1;186,132,-185,1;185,132,-185,1;186,132,-185,1;186,132,-185,1;186,132,-185,1;186,132,-182,1;186,132,-180,1;186,132,-177,1;186,132,-175,1;186,132,-172,1;186,132,-170,1;186,132,-167,1;186,132,-165,1;186,132,-169,1;181,132,-178,1;168,132,-179,1;155,132,-179,1;142,132,-180,1;129,132,-180,1;115,132,-181,1;102,132,-181,1;89,132,-182,1;75,132,-182,1;62,132,-183,1;49,140,-184,0;35,148,-184,0;22,145,-185,0;11,141,-189,1;4,141,-200,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;2,141,-203,1;1,141,-209,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;1,141,-220,1;0,147,-227,1;0,152,-233,1;0,157,-233,1;0,163,-233,1;0,168,-233,1;0,173,-233,1;0,179,-233,1;0,184,-233,1;0,189,-233,1;0,195,-233,1;0,200,-233,1;0,205,-233,1;0,211,-233,1;0,216,-233,1;0,221,-233,1;0,227,-233,1;0,232,-233,1;0,237,-233,1;0,243,-233,1;0,248,-233,1;0,253,-233,1;0,259,-233,1;0,264,-233,1;0,269,-233,1;0,275,-233,1;0,280,-233,1;0,285,-233,1;0,291,-233,1;0,291,-243,1;0,291,-255,1;0,291,-268,1;4,291,-276,1;13,291,-285,1;22,291,-295,1;32,301,-304,0;41,309,-314,0;49,305,-323,0;51,304,-334,1;51,312,-348,0;51,320,-361,0;51,318,-374,1;57,318,-386,1;64,323,-397,0;71,333,-408,0;78,333,-420,0;88,331,-428,1;100,333,-434,0;111,345,-441,0;123,347,-447,0;135,345,-451,1;148,343,-452,0;162,357,-452,0;175,362,-452,0;188,358,-451,1;200,358,-445,1;212,368,-439,0;223,375,-433,0;235,372,-427,1;243,372,-417,1;251,380,-406,0;258,388,-395,0;266,386,-384,0;269,385,-372,1;270,387,-358,0;272,398,-345,0;271,408,-337,0;262,430,-336,0;257,444,-334,0;257,449,-332,0;260,446,-329,0;268,435,-327,0;276,415,-328,0;271,420,-328,0;258,439,-329,0;245,449,-331,0;231,452,-332,0;218,445,-333,0;205,431,-334,0;192,425,-331,1;180,425,-325,1;169,425,-319,1;157,425,-313,1;147,425,-308,1;147,425,-307,1' };
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
    skyTop: '#2a64cf', skyHorizon: '#c4e6fb', skyBottom: '#9fcbee', skySharp: 0.55,
    sunDir: [0.35, 0.75, -0.55], sunColor: '#fff2c8', sunSize: 2, sunLight: '#fff4e0', sunIntensity: 3.0,
    hemiSky: '#cfe6ff', hemiGround: '#cdb79a', hemiIntensity: 1.6,
    fog: [140, 560], fogColor: '#bfe3fb', stars: 0, bloom: 0.35, exposure: 0.95,
    clouds: { y: -34, color: '#f4f9ff', opacity: 0.75 },
  },
  music: { root: 60, scale: 'major', bpm: 88, progression: [0, 3, 4, 5], sparkle: 0.3, bright: 2200, wave: 'triangle' },
  items: {
    glider: { name: 'Glider', slot: 'back', family: 'machine', traits: ['glide'], rarity: 'rare', desc: 'Hold jump while falling to glide. A machine: works in any world that allows gliding and machines.',
      look: [{ s: 'rbox', size: [0.34, 0.42, 0.16], pos: [0, 0, 0], color: '#3d405b' },
        { s: 'box', size: [0.85, 0.03, 0.44], pos: [-0.52, 0.14, 0], rot: [0, 0, 12], color: '#7cf6ff', glow: 0.9 },
        { s: 'box', size: [0.85, 0.03, 0.44], pos: [0.52, 0.14, 0], rot: [0, 0, -12], color: '#7cf6ff', glow: 0.9 },
        { s: 'cyl', r: 0.05, h: 0.5, pos: [0, 0.3, 0], color: '#c0c6dd', metal: 0.6 }] },
    'sigil-sky': { name: 'Sigil of the Sky', slot: null, traits: ['key'], rarity: 'legendary', desc: 'One of three sigils that open the Vault in Junction.',
      look: [{ s: 'oct', r: 0.32, color: '#8fd3ff', glow: 2.4 }, { s: 'torus', r: 0.48, tube: 0.03, rot: [90, 0, 0], color: '#ffffff', glow: 1.6 }] },
    // an artifact (the charm slot, key 2), found on a lonely rock off the spiral
    hourglass: { name: 'Hourglass', slot: 'charm', family: 'magic', traits: ['rewind'], rarity: 'legendary', power: { kind: 'rewind', seconds: 60, cooldown: 20 },
      desc: 'Old glass, older sand. Hold 2 and you run back through your last minute, as you were; let go to carry on from there. Recharges in 20 seconds.',
      look: [{ s: 'cyl', r: 0.13, h: 0.035, pos: [0, 0.175, 0], color: '#c9a35a', metal: 0.6 }, { s: 'cyl', r: 0.13, h: 0.035, pos: [0, -0.175, 0], color: '#c9a35a', metal: 0.6 },
        { s: 'cone', r: 0.1, h: 0.155, pos: [0, 0.08, 0], rot: [180, 0, 0], color: '#cfeeff', opacity: 0.5 }, { s: 'cone', r: 0.1, h: 0.155, pos: [0, -0.08, 0], color: '#cfeeff', opacity: 0.5 },
        { s: 'cone', r: 0.075, h: 0.085, pos: [0, -0.115, 0], color: '#ffd166', glow: 1.3 },
        { s: 'cyl', r: 0.013, h: 0.34, pos: [0.115, 0, 0], color: '#8a5a32' }, { s: 'cyl', r: 0.013, h: 0.34, pos: [-0.0575, 0, 0.0996], color: '#8a5a32' },
        { s: 'cyl', r: 0.013, h: 0.34, pos: [-0.0575, 0, -0.0996], color: '#8a5a32' }] },
  },

  build(w) {
    // an isle: a grassy top on a layer of earth (solid), and a faceted rock cone hanging below (decoration)
    const island = (x, top, z, r, o = {}) => {
      w.cylinder({ pos: [x, top - 0.65, z], radius: r, height: 1.2, sides: 16, color: o.dirt || (o.mossy ? C.stone : C.dirt) });
      w.cylinder({ pos: [x, top - 0.04, z], radius: r + 0.06, height: 0.1, sides: 16, color: o.grass || (o.mossy ? C.moss : C.grass), collide: false });
      w.cone({ pos: [x, top - 1.25 - r * 0.75, z], radius: r * 0.96, height: r * 1.5, sides: 7, flat: true, rot: [180, Math.round(x * 37 + z * 11) % 360, 0], color: o.rock || (o.mossy ? C.stone2 : C.rock), collide: false });
    };
    const flowers = (x, top, z, r, n, seed) => {
      const R = w.rand(seed);
      for (let i = 0; i < n; i++) {
        const a = R() * Math.PI * 2, d = r * (0.3 + R() * 0.6);
        w.sphere({ pos: [x + Math.cos(a) * d, top + 0.12, z + Math.sin(a) * d], radius: 0.13, color: R.pick(C.flower), low: true, flat: true, collide: false, shadow: false });
      }
    };
    // a low-poly tree: trunk and two faceted crowns, all solid (the same shapes the isles have always had to stand on)
    const tree = (x, top, z, s = 1) => {
      w.cylinder({ pos: [x, top + 1.1 * s, z], radius: 0.2 * s, height: 2.2 * s, sides: 6, color: C.wood2 });
      w.sphere({ pos: [x, top + 2.8 * s, z], radius: 1.3 * s, low: true, flat: true, color: C.leaf });
      w.sphere({ pos: [x + 0.5 * s, top + 3.4 * s, z + 0.3 * s], radius: 0.8 * s, low: true, flat: true, color: C.leaf2 });
    };
    // scenery that used to be photographed models, now low-poly, on the same colliders they always had
    const rocks = (x, y, z, yaw, size) => { // a mossy rock pile on a box collider of `size`
      w.box({ pos: [x, y + size[1] / 2, z], size, yaw, invisible: true });
      const c = Math.cos(yaw * Math.PI / 180), s = Math.sin(yaw * Math.PI / 180), q = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
      for (const [dx, dz, r, h, col] of [[-0.6, 0, 0.95, 0.75, C.stone], [0.7, 0.15, 0.75, 0.62, C.stone2], [0.05, -0.45, 0.6, 0.85, C.stone]]) {
        const [px, pz] = q(dx * size[0] / 3.2, dz * size[2] / 2.2);
        w.sphere({ pos: [px, y + r * h * 0.55, pz], radius: r * size[0] / 3.2, low: true, flat: true, scale: [1.2, h, 1], rot: [0, yaw + dx * 40, 0], color: col, collide: false });
      }
      const [mx, mz] = q(-0.4 * size[0] / 3.2, 0); // a cap of moss on the biggest stone
      w.sphere({ pos: [mx, y + size[1] * 0.95, mz], radius: 0.45, low: true, flat: true, scale: [1.6, 0.35, 1.2], color: C.moss, collide: false, shadow: false });
    };
    const bush = (x, y, z, s) => {
      w.sphere({ pos: [x, y + 0.35 * s, z], radius: 0.5 * s, low: true, flat: true, color: C.leaf2, collide: false });
      w.sphere({ pos: [x + 0.35 * s, y + 0.25 * s, z + 0.1 * s], radius: 0.35 * s, low: true, flat: true, color: C.leaf, collide: false });
    };
    const coinLine = (a, b, n, lift = 1.2) => {
      for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); w.coin({ pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + lift, a[2] + (b[2] - a[2]) * t] }); }
    };

    // ---------- landing ----------
    island(0, 0, 0, 12);
    flowers(0, 0, 0, 11, 40, 7);
    tree(-7, 0, 3); tree(7.5, 0, -2, 1.2); tree(-5, 0, -7, 0.9);
    w.portal({ pos: [0, 0, 8.5], yaw: 180, to: 'hub', label: 'Junction' });
    // rocks, bushes and an old stump
    rocks(8.6, -0.1, 3.5, 70, [3.2, 1.0, 2.2]);
    rocks(-9.2, -0.1, -3.5, -110, [3, 0.9, 2]);
    w.cylinder({ pos: [6.8, 0.35, -7.2], radius: 0.75, height: 0.7, sides: 9, color: C.wood2 });
    w.cylinder({ pos: [6.8, 0.71, -7.2], radius: 0.66, height: 0.03, sides: 9, color: '#d9b27c', collide: false, shadow: false });
    for (const [x, z, s] of [[-6, 6.2, 1.1], [5.2, 6.6, 0.9], [-2.4, -9.6, 1], [9.5, -3, 0.8], [-9.8, 3.5, 0.9]]) bush(x, 0, z, s);
    // the sign and Bram stand ahead of where you arrive from Junction (0, -1.5, facing the climb), in view; they used
    // to stand between the portal and the arrival point, so the camera met the sign's back edge up close
    w.sign({ pos: [4.4, 0, -6.6], yaw: -40, title: 'SKYREACH', width: 3.2, text: 'Climb to the summit of the crystal spire. Beacons save your place, and orange tiles crumble.', bg: '#4a3526', border: '#c9a27a', titleColor: '#ffd98a', frame: C.wood2 });
    w.npc({ pos: [-3.6, 0, -5.4], yaw: 43, name: 'Bram', colors: { body: '#3ec8ff', head: '#ffe8cc', visor: '#ff7a45' }, hat: 'cap', look: { style: 'tall', face: 'eyes', mouth: 'smile', outfit: 'overalls', colors: { outfit: '#6bab55', trim: '#8a5a3c' } }, onTalk: async () => {
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
      { s: 'torus', r: 5.2, tube: 0.12, pos: [0, 14, 0], rot: [90, 0, 0], color: '#ffffff', glow: 0.5 },
      { s: 'torus', r: 4.6, tube: 0.1, pos: [0, 26, 0], rot: [90, 0, 0], color: '#ffffff', glow: 0.5 },
    ] });

    // timer: starts when you step off the landing island
    let started = false, finished = false;
    // the goal, with a marker on the summit's sigil (SUM, below; this only runs once the world is built)
    const climb = () => w.objective(w.has('sigil-sky') ? 'Climb to the summit of the crystal spire.' : 'Climb to the summit: the Sky Sigil waits at the top.', { at: [SUM[0], SUM[1] + 2.3, SUM[2]] });
    w.zone({ pos: [0, 1, -14.5], size: [10, 6, 2], onEnter: () => {
      if (finished || started) return;
      started = true; w.timer.start(); climb();
    } });

    // ---------- 1: stepping stones ----------
    const stones = [[0, 0.7, -16.5], [2.6, 1.3, -20.6], [0, 1.9, -24.6], [-2.6, 2.5, -28.6], [0, 3.1, -32.4]];
    stones.forEach(([x, y, z]) => { island(x, y, z, 1.5, { mossy: true }); w.coin({ pos: [x, y + 1.3, z] }); });
    island(0, 3.7, -38.5, 4.5);
    flowers(0, 3.7, -38.5, 4, 10, 2);
    w.box({ pos: [2.2, 3.7 + 0.17, -36], size: [2.2, 0.35, 0.3], yaw: 60, invisible: true }); // a fallen log
    w.cylinder({ pos: [2.2, 3.7 + 0.17, -36], radius: 0.19, height: 2.2, sides: 6, rot: [0, 60, 90], color: C.wood2, collide: false });
    w.checkpoint({ pos: [-2.2, 3.7, -38.5], yaw: 160 });

    // ---------- 2: jump pad ----------
    w.jumpPad({ pos: [2.4, 3.7, -41], power: 20, push: [6, 0, -3.6] });
    island(10, 9.6, -46, 3.6);
    w.coin({ pos: [5.5, 10.5, -43.5] });
    tree(11.2, 9.6, -47.8, 0.8);

    // ---------- 3: moving platforms over a wide gap ----------
    const plank = (x, y, z) => w.box({ pos: [x, y, z], size: [3, 0.5, 3], color: C.wood });
    w.mover(plank(16, 9.35, -46), { path: [[16, 9.35, -46], [21, 9.35, -46]], speed: 2.4, pause: 0.7 });
    w.mover(plank(28, 9.85, -46), { path: [[23.5, 9.85, -46], [28.5, 9.85, -46]], speed: 2.4, pause: 0.7, offset: 1 });
    coinLine([16, 10, -46], [28, 10.5, -46], 4);
    island(34, 10.1, -46, 4);
    w.checkpoint({ pos: [35.5, 10.1, -47.5], yaw: 0 });
    w.box({ pos: [31.4, 10.1 + 0.8, -48.2], size: [1.1, 1.6, 0.9], yaw: 20, invisible: true }); // a boulder
    w.sphere({ pos: [31.4, 10.1 + 0.78, -48.2], radius: 0.82, low: true, flat: true, scale: [0.75, 1.0, 0.62], rot: [0, 20, 0], color: C.stone, collide: false });

    // ---------- 4: crumbling bridge ----------
    for (let i = 0; i < 7; i++) {
      const t = w.box({ pos: [34, 10.1 + i * 0.28, -40.2 + i * 2.7], size: [2.3, 0.45, 2.3], color: C.crumble });
      w.crumble(t, { delay: 0.5, respawn: 3 });
      if (i % 2) w.coin({ pos: [34, 11.6 + i * 0.28, -40.2 + i * 2.7] });
    }
    island(34, 12.3, -18.5, 4);
    flowers(34, 12.3, -18.5, 3.6, 10, 5);
    w.checkpoint({ pos: [36, 12.3, -17], yaw: -90 });

    // ---------- 5: windy beams ----------
    const gust = () => (w.time % 3.8) < 1.4;
    const beams = [[[29.5, -18.5], [20.5, -18.5]], [[15.5, -18.5], [6.5, -18.5]]];
    beams.forEach(([a, b]) => w.box({ pos: [(a[0] + b[0]) / 2, 12.05, a[1]], size: [Math.abs(a[0] - b[0]) + 0.4, 0.5, 2.2], color: C.beam }));
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
      island(x, y, z, 1.55, { mossy: true });
      if (k % 2 === 0) w.coin({ pos: [x, y + 1.3, z] });
      last = [x, y, z];
    }
    w.jumpPad({ pos: last, power: 17, radius: 0.9, push: [(SP[0] - last[0]) / 11.5 * 7, 0, (SP[1] - last[2]) / 11.5 * 7] });
    // a lonely rock six metres out from the fifth isle of the spiral, a running jump away: the Hourglass waits on it
    const ha = 168 * Math.PI / 180, HG = [SP[0] + Math.sin(ha) * 17.5, 28.2 + 1.35 * 5 + 0.9, SP[1] + Math.cos(ha) * 17.5];
    island(HG[0], HG[1], HG[2], 1.2, { mossy: true });
    w.cylinder({ pos: [HG[0], HG[1] + 0.25, HG[2]], radius: 0.45, height: 0.5, sides: 6, color: '#f2efe8' });
    w.pickup({ pos: [HG[0], HG[1] + 1.5, HG[2]], item: 'hourglass', scale: 2.4 });
    w.particles({ pos: [HG[0], HG[1] + 0.4, HG[2]], area: [2.6, 2.4, 2.6], count: 10, color: ['#ffe9a8', '#cfeeff'], size: 0.08, kind: 'float', speed: 0.3 });
    w.on('pickup', (id) => { if (id === 'hourglass') w.toast(w.equipment().charm === 'hourglass' ? 'The Hourglass hovers at your shoulder. Hold 2 to run back through your last minute.' : 'The Hourglass: wear it in your charm slot (I items), then hold 2 to run back through your last minute.', 'item'); });
    w.scene.userData.hourglass = HG; // for tests
    // summit
    const SUM = [SP[0], 41.6, SP[1]];
    island(SUM[0], SUM[1], SUM[2], 6.2, { grass: '#cfe8f5', dirt: '#9cbfd6', rock: '#6f86a3' }); // frosted
    w.checkpoint({ pos: [SUM[0] - 3.5, SUM[1], SUM[2] + 2], yaw: 0 });
    w.cylinder({ pos: [SUM[0], SUM[1] + 0.5, SUM[2]], radius: 1.1, height: 1, sides: 8, color: '#f2efe8' });
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
      garden();
    } });
    // after the summit: the sigil and the glider (whichever is still here), then the Cloud Garden
    const garden = () => !w.has('sigil-sky') ? w.objective('Take the Sky Sigil from the pedestal.', { at: [SUM[0], SUM[1] + 2.3, SUM[2]] })
      : w.has('glider') ? w.objective('Glide to the Cloud Garden: jump off and hold Space while falling.', { at: [GD[0], GD[1] + 2, GD[2]] })
        : w.objective('Take the glider, then glide to the Cloud Garden.', { at: [SUM[0] + 3.2, SUM[1] + 1.4, SUM[2] - 1.5] });
    w.on('pickup', (id) => { if ((id === 'glider' || id === 'sigil-sky') && finished) garden(); });
    w.sign({ pos: [SUM[0] + 4.5, SUM[1], SUM[2] + 2.5], yaw: -120, title: 'THE CLOUD GARDEN', width: 2.8, text: 'East of here, far below.\nJump off and hold Space while falling to glide.', bg: '#4a3526', border: '#c9a27a', titleColor: '#ffd98a', frame: C.wood2 });

    // ---------- the Cloud Garden: a reward for gliding ----------
    const GD = [64, 18, -30];
    island(GD[0], GD[1], GD[2], 7, { grass: '#f0bfd9', dirt: '#c592b5', rock: '#8a6a85' }); // blossom-strewn
    flowers(GD[0], GD[1], GD[2], 6.5, 50, 11);
    tree(GD[0] - 3, GD[1], GD[2] + 2, 1.1); tree(GD[0] + 3.5, GD[1], GD[2] - 2.5, 0.9);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; w.coin({ pos: [GD[0] + Math.cos(a) * 3.5, GD[1] + 1.2, GD[2] + Math.sin(a) * 3.5], kind: 'gem', value: 2 }); }
    w.portal({ pos: [GD[0], GD[1], GD[2] + 5], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Back to the crossroads' });
    // landed: the next step is home (it used to keep saying "glide to the Cloud Garden" while you stood in it)
    let landed = false;
    w.zone({ pos: [GD[0], GD[1] + 2, GD[2]], radius: 7.5, onEnter: () => {
      if (landed) return;
      landed = true;
      w.objective('Take the portal home to Junction.', { at: [GD[0], GD[1] + 2.6, GD[2] + 5] });
    } });
    // the root cradle: a ledge of woven roots hanging below the rock under the garden, out of sight from the top.
    // Glide off the garden's edge and curve back underneath. Home of the Founder's first Echo (GAME.md).
    const CR = [GD[0], GD[1] - 15.2, GD[2]]; // the cradle's floor, about 3 m below the cone's tip
    w.cylinder({ pos: [CR[0], CR[1] - 0.15, CR[2]], radius: 1.8, height: 0.3, sides: 9, color: '#6e4e36' });
    for (let i = 0; i < 6; i++) { // roots from the tip down to the cradle's rim
      const a = (i / 6) * Math.PI * 2, x = CR[0] + Math.sin(a) * 1.6, z = CR[2] + Math.cos(a) * 1.6, top = GD[1] - 11.75, len = top - CR[1];
      w.box({ pos: [(x + GD[0]) / 2, CR[1] + len / 2, (z + GD[2]) / 2], size: [0.09, len + 0.4, 0.09], rot: [Math.cos(a) * -9, 0, Math.sin(a) * 9], color: '#4a3526', collide: false, shadow: false });
    }
    w.echo({ id: '1', pos: [CR[0], CR[1] + 1.4, CR[2]], line: 'The first piece. I hid it where nobody looks: under the things they admire.',
      next: "Echo II: \"Where the lake keeps a second sky, I left my second word. Trust what the water shows you.\" Mirror Lake, in Glowcave." });
    w.particles({ pos: [CR[0], CR[1] + 2, CR[2]], area: [4, 4, 4], count: 16, color: ['#ffe9a8', '#fff6dc'], size: 0.09, kind: 'float', speed: 0.3 });
    // a gentle beacon of light so the garden is easy to spot from the summit
    w.cylinder({ pos: [GD[0], GD[1] + 30, GD[2]], radius: 0.35, height: 60, color: '#ffd6f0', glow: 1.6, opacity: 0.35, collide: false, shadow: false });

    // ---------- Season 2 of the Founder's hunt (GAME.md: The Stranger): race the stranger to the summit ----------
    // Once Echo XIII is yours, the stranger waits on the landing island. Talk, and they race you up: you get a head start
    // while they finish their tea, then they run the climb they know by heart (RACE.path, recorded from a scripted climb
    // and drawn in frame code). Reach the summit first and Echo XIV appears there. Lose, and they offer a rematch.
    const s2 = () => !!w.flag('s2.started');
    const raceOn = () => s2() && w.has('echo-13') && !w.has('echo-14');
    const START = [2.2, 0, -9.6], GO = [0.6, 1.2, -10.6], TOPSPOT = [SUM[0] - 1.6, SUM[1], SUM[2] + 3.4];
    const ECHO14 = [SUM[0] - 2.6, SUM[1] + 1.45, SUM[2] - 2.4];
    const R = { on: false, t0: 0, arrive: 0, lost: false };
    const won = () => !!w.store.get('raceWon', false);
    const stranger = w.npc({ pos: won() ? TOPSPOT : START, yaw: 180, name: 'Stranger', nameColor: '#d6dbe6', look: STRANGER_LOOK, hat: 'strangers-hood', walks: true, radius: 2.6, label: 'Say hello', onTalk: () => talkStranger() });
    if (!raceOn() && !(won() && s2() && !w.has('echo-14'))) stranger.hide();
    const echo14 = w.echo({ id: '14', pos: ECHO14, hidden: !(s2() && won()),
      line: 'Skyreach was the first world I built, so I would have somewhere to climb on bad days. It still works. Thank you for the race.',
      next: 'Echo XV: "Come home. I will wait where the hunt began." The Echo Stone, in the Vault.' });
    const clearQ = [];
    const whenClear = (pos, f) => clearQ.push({ pos, f });
    // the stranger's climb: points every RACE.step ticks, in decimetres, with a grounded bit (x, y, z, g)
    const PATH = [];
    for (const s of RACE.path.split(';')) { const v = s.split(',').map(Number); PATH.push([v[0] / 10, v[1] / 10, v[2] / 10, v[3]]); }
    // when they reach each point (ticks after they set off), breathers included
    const REST = Object.fromEntries(RACE.rests.map(([i, sec]) => [i, sec * 60])), AT = [];
    let RUN = 0;
    for (let i = 0; i < PATH.length; i++) { AT.push(RUN); RUN += (REST[i] || 0) + (i < PATH.length - 1 ? RACE.step : 0); }
    const ghostAt = (e) => { // -> [segment, fraction along it, resting]
      let lo = 0, hi = PATH.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (AT[m] <= e) lo = m; else hi = m - 1; }
      const into = e - AT[lo], r = REST[lo] || 0;
      if (lo >= PATH.length - 1) return [PATH.length - 2, 1, false];
      return into < r ? [lo, 0, true] : [lo, Math.min(1, (into - r) / RACE.step), false];
    };
    const ghost = w.avatar({ look: STRANGER_LOOK, eq: { head: 'strangers-hood' }, name: 'Stranger', nameColor: '#d6dbe6' });
    ghost.root.visible = false;
    const cup = new w.THREE.Mesh(new w.THREE.CylinderGeometry(0.07, 0.055, 0.12, 10), w.mat('#f4efe6')); // their tea
    cup.position.set(0, 0.04, 0.06); ghost.handR.add(cup);
    async function talkStranger() {
      if (R.on) return;
      stranger.face('player');
      if (won()) { await w.say('Stranger', ['Beaten fair and square. Mind you, I did stop for tea.']); return; }
      if (R.lost) { const k = await w.ask('Stranger', 'Not bad! Again? I\'ll take us both back down.', ['Race again', 'Not now']); if (k === 0) countdown(true); return; }
      if (!w.store.get('raced', false)) await w.say('Stranger', ['You kept up in Junction. Let\'s see you keep up here.', `Race me to the summit. I'll give you a head start: I want to finish my tea. ${RACE.head} seconds, then I'm coming.`]);
      const k = await w.ask('Stranger', 'Ready?', ['Race!', 'Not yet']);
      if (k === 0) countdown(false);
    }
    // three, two, one: you stand on the line beside them, held still until "go"
    function countdown(again) {
      R.on = true; R.lost = false; R.t0 = w.ticks + 180; R.arrive = R.t0 + RACE.head * 60 + RUN;
      w.store.set('raced', true);
      w.player.setPos(GO, 180); w.player.freeze(true);
      stranger.hide();
      ghost.root.visible = true;
      w.objective('Race the stranger to the summit!', { at: [SUM[0], SUM[1] + 2.3, SUM[2]] });
      w.banner('3', 'Race the stranger to the summit');
      w.after(1, () => w.banner('2', 'Race the stranger to the summit'));
      w.after(2, () => w.banner('1', 'Race the stranger to the summit'));
      w.after(3, () => { w.player.freeze(false); w.sound('boost'); w.banner('GO!', `The stranger is finishing their tea: ${RACE.head} seconds.`); });
      w.after(3 + RACE.head, () => { if (R.on) w.toast('The stranger puts down their cup, and runs.'); });
    }
    w.zone({ pos: [SUM[0], SUM[1] + 2, SUM[2]], radius: 6, onEnter: () => {
      if (!R.on || w.ticks < R.t0) return;
      R.on = false; w.store.set('raceWon', true);
      w.sound('win'); w.banner('YOU WIN!', 'You beat the stranger to the summit.');
      ghost.root.visible = false;
      stranger.setPos(TOPSPOT, 180); stranger.show();
      w.burst([TOPSPOT[0], TOPSPOT[1] + 1.2, TOPSPOT[2]], { color: ['#c9cfdb', '#ffffff', '#c9b6ff'], count: 40, speed: 4, life: 1 });
      w.toast('The stranger arrives in a puff of cloud, out of breath. "Fair and square!" Something hums at the top.');
      whenClear(ECHO14, () => echo14.reveal());
    } });
    w.on('tick', () => {
      for (let i = clearQ.length - 1; i >= 0; i--) { const c = clearQ[i], p = w.player.pos; if (Math.hypot(p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]) > 1.8) { clearQ.splice(i, 1); c.f(); } }
      if (R.on && w.ticks >= R.arrive) { // they got there first
        R.on = false; R.lost = true;
        ghost.root.visible = false;
        stranger.setPos(TOPSPOT, 180); stranger.show();
        w.toast('The stranger reaches the summit first, and sits down to wait for you.');
        w.objective('The stranger beat you to the top. Find them at the summit for a rematch.', { at: [TOPSPOT[0], TOPSPOT[1] + 2.2, TOPSPOT[2]] });
      }
    });
    w.scene.userData.skyRace = { stranger, state: R, echo: echo14, ECHO14, PATH, RUN, START, GO, ghost }; // for tests
    // the stranger's run, drawn: tea for the head start, then along the path, with a breather now and then
    let gv = 0;
    w.on('frame', (dt) => {
      if (!ghost.root.visible) return;
      gv = Math.min(Math.max(gv + dt * 60, w.ticks - 3), w.ticks + 1);
      const e = gv - R.t0 - RACE.head * 60, [i, u, resting] = ghostAt(Math.max(0, e)), a = PATH[i], b = PATH[i + 1];
      const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, z = a[2] + (b[2] - a[2]) * u;
      const run = e > 0 && !resting, k = 60 / RACE.step;
      const vx = (b[0] - a[0]) * k, vy = (b[1] - a[1]) * k, vz = (b[2] - a[2]) * k, sp = run ? Math.hypot(vx, vz) : 0;
      ghost.root.position.set(x, y - 0.93, z);
      if (run && sp > 0.5) ghost.root.rotation.y = Math.atan2(vx, vz);
      else if (resting) { const q = PATH[Math.max(0, i - 6)]; ghost.root.rotation.y = Math.atan2(q[0] - x, q[2] - z); } // (looking back down the climb)
      cup.visible = e <= 0;
      ghost.animate({ speed: sp, grounded: run ? !!(u < 0.5 ? a[3] : b[3]) : true, vy: run ? vy : 0, gliding: false, board: false, groundDist: 0 }, dt);
    });
    w.particles({ pos: [16, 0, -25], area: [90, 50, 90], count: 140, color: ['#ffffff', '#fff6c8'], size: 0.12, kind: 'float', speed: 0.5 });
    w.on('enter', () => {
      if (raceOn() && !won()) return w.objective('A stranger in a grey hood waits at the foot of the climb.', { at: [START[0], 2.4, START[2]] });
      if (!started) climb();
    });
    w.on('fall', () => { if (started && !finished) w.toast('Back to the last beacon.'); });
  },
};
