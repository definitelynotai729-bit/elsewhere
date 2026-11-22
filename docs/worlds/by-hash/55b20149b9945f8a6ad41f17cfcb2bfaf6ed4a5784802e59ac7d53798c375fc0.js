// Spire Clash: a lane battle in the arena style. Minion waves march down one lane between two bases; towers
// guard each side; a rival champion fights you for it. Level up, buy upgrades at your fountain, topple the
// enemy towers, then their spire. The gear you bring from other worlds becomes your edge here.
// Keyboard: WASD or arrows move, Q bolt, E shield, R starfall, Space dash, B recall. Attacks are automatic.
export default {
  id: 'clash',
  name: 'Spire Clash',
  author: 'elsewhere',
  version: 1,
  blurb: 'A lane battle: towers, minion waves and a rival champion. Your gear comes with you.',
  color: '#ff6b5c',
  spawn: { pos: [0, 1.2, 74], yaw: 180 },
  killY: -20,
  controls: 'topdown',
  camera: { mode: 'top', yaw: 180, pitch: 56, dist: 24 },
  rules: {},
  theme: {
    skyTop: '#3d7fd6', skyHorizon: '#d9efff', skyBottom: '#b8dcf5', skySharp: 0.6,
    sunDir: [-0.45, 0.8, 0.35], sunColor: '#fff1d6', sunSize: 2, sunLight: '#fff3e2', sunIntensity: 3.2,
    hemiSky: '#d8ecff', hemiGround: '#5e7a45', hemiIntensity: 1.4,
    fog: [90, 260], fogColor: '#cfe6f5', stars: 0, bloom: 0.4, exposure: 1.0,
  },
  music: { root: 50, scale: 'dorian', bpm: 96, progression: [0, 3, 6, 4], sparkle: 0.3, bright: 2000, wave: 'triangle', pulse: true },
  items: {
    'spire-circlet': { name: 'Spire Circlet', slot: 'head', traits: ['cosmetic'], rarity: 'rare', desc: 'Won a Spire Clash.',
      look: [{ s: 'torus', r: 0.3, tube: 0.04, pos: [0, 0.02, 0], rot: [90, 0, 0], color: '#ffd166', metal: 0.8 },
        { s: 'oct', r: 0.09, pos: [0, 0.06, 0.29], color: '#ff6b5c', glow: 2.4 }] },
  },

  build(w) {
    const T = w.THREE, D = Math.PI / 180;
    const C = { grass: '#5e9e48', grass2: '#4f8a3c', lane: '#a3987f', laneEdge: '#8a7f68', rock: '#7d7a74', cliff: '#6b6a63', water: '#4fb6e8',
      blue: '#3ec8ff', red: '#ff5d5d', stone: '#c9c2b0', dark: '#3b3a35', gold: '#ffd166' };
    const TEAM = [{ name: 'blue', color: C.blue, dir: -1, fountain: [0, 76], spire: [0, 62] }, { name: 'red', color: C.red, dir: 1, fountain: [0, -76], spire: [0, -62] }];

    // =====================================================================================
    // The battlefield
    // =====================================================================================
    w.box({ pos: [0, -0.5, 0], size: [90, 1, 190], color: C.grass });
    for (let i = -8; i <= 8; i++) w.box({ pos: [((i * 37) % 23) - 11, 0.01, i * 10], size: [9, 0.02, 7], color: C.grass2, collide: false, shadow: false }); // grass patches
    w.box({ pos: [0, 0.02, 0], size: [15, 0.02, 150], color: C.lane, collide: false, shadow: false });
    w.box({ pos: [-7.7, 0.03, 0], size: [0.5, 0.02, 150], color: C.laneEdge, collide: false, shadow: false });
    w.box({ pos: [7.7, 0.03, 0], size: [0.5, 0.02, 150], color: C.laneEdge, collide: false, shadow: false });
    w.box({ pos: [0, 0.04, 0], size: [32, 0.02, 7], color: C.water, glow: 0.25, opacity: 0.8, collide: false, shadow: false }); // the river
    // walls along the lane, wider at the bases
    const wall = (x, z, sx, sz, h = 2.2) => w.box({ pos: [x, h / 2, z], size: [sx, h, sz], color: C.cliff });
    wall(-15.5, 0, 1, 118); wall(15.5, 0, 1, 118);
    for (const s of [1, -1]) {
      wall(-21, 70 * s, 1, 24); wall(21, 70 * s, 1, 24); wall(0, 82.5 * s, 43, 1);
      wall(-18.25, 58.5 * s, 6.5, 1); wall(18.25, 58.5 * s, 6.5, 1);
    }
    // jungle beyond the walls: trees and rocks for looks
    const R = w.rand(17);
    for (let i = 0; i < 70; i++) {
      const side = i % 2 ? 1 : -1, x = side * (19 + R() * 22), z = -78 + R() * 156;
      if (Math.abs(z) > 56 && Math.abs(x) < 26) continue;
      const s = 0.8 + R() * 0.9;
      w.cylinder({ pos: [x, 1.2 * s, z], radius: 0.3 * s, height: 2.4 * s, color: '#6b4a35', collide: false });
      w.cone({ pos: [x, 3.6 * s, z], radius: 1.8 * s, height: 3.6 * s, color: R() < 0.5 ? '#3f7a3a' : '#4a8a40', collide: false });
    }
    for (let i = 0; i < 24; i++) { const side = i % 2 ? 1 : -1; w.sphere({ pos: [side * (16.5 + R() * 3), 0.3, -70 + R() * 140], radius: 0.6 + R() * 0.8, color: C.rock, low: true, collide: false }); }
    // brush along the lane edges
    for (let z = -50; z <= 50; z += 20) for (const x of [-11.5, 11.5]) w.sphere({ pos: [x, 0.5, z + (x > 0 ? 6 : 0)], radius: 1.6, color: '#2f6b2c', low: true, collide: false, shadow: false });

    // bases: fountains and spires
    const fountains = TEAM.map((t) => {
      const [x, z] = t.fountain;
      w.cylinder({ pos: [x, 0.15, z], radius: 5, height: 0.3, color: C.stone });
      w.cylinder({ pos: [x, 0.32, z], radius: 4.2, height: 0.06, color: t.color, glow: 0.8, opacity: 0.7, collide: false, shadow: false });
      w.light({ pos: [x, 3, z], color: t.color, intensity: 18, distance: 14 });
      return { x, z };
    });
    w.portal({ pos: [0, 0, 81], yaw: 180, to: 'hub', label: 'Junction', subtitle: 'Leave the arena', arrive: 7 });

    // =====================================================================================
    // Units: every fighter, tower and spire is a plain record, updated in the tick (so replays match)
    // =====================================================================================
    const units = [];
    let uid = 0;
    const geo = { box: new T.BoxGeometry(1, 1, 1), sphere: new T.SphereGeometry(1, 14, 10), cone: new T.ConeGeometry(1, 1, 10), cyl: new T.CylinderGeometry(1, 1, 1, 12), oct: new T.OctahedronGeometry(1, 0) };
    const own = []; // geometry and materials this world creates, disposed on leave
    Object.values(geo).forEach((g) => own.push(g));
    const mesh = (g, color, o = {}) => { const m = new T.Mesh(g, w.mat(color, o)); m.castShadow = true; return m; };
    // health bars: a dark back and a coloured fill, facing the fixed camera
    const barBack = w.mat('#1a1a22', {}), barFill = [w.mat(C.blue, { glow: 0.6 }), w.mat(C.red, { glow: 0.6 })], barShield = w.mat('#ffffff', { glow: 0.8 });
    const makeBar = (u, width, height) => {
      const g = new T.Group(); g.position.y = height;
      const back = new T.Mesh(geo.box, barBack); back.scale.set(width + 0.08, 0.18, 0.04);
      const fill = new T.Mesh(geo.box, barFill[u.team]); fill.scale.set(width, 0.12, 0.05); fill.position.z = 0.01;
      const sh = new T.Mesh(geo.box, barShield); sh.scale.set(0.001, 0.12, 0.05); sh.position.z = 0.012; sh.visible = false;
      g.add(back, fill, sh); g.rotation.x = -34 * D;
      u.bar = { g, fill, sh, width };
      return g;
    };
    const addUnit = (o) => {
      const u = Object.assign({ id: uid++, alive: true, cd: 0, shield: 0, shieldT: 0, aggroT: -9, target: null, hitBy: null }, o);
      u.max = u.hp;
      units.push(u);
      return u;
    };

    // towers and spires
    const towerAt = (team, x, z) => {
      const t = TEAM[team];
      const col = w.cylinder({ id: 'tower', pos: [x, 2.5, z], radius: 1.3, height: 5, color: C.stone, sides: 8 });
      const g = new T.Group(); g.position.set(x, 0, z);
      const crystal = mesh(geo.oct, t.color, { glow: 2.2 }); crystal.scale.set(0.7, 1.1, 0.7); crystal.position.y = 6.1; g.add(crystal);
      const cap = mesh(geo.cyl, C.dark); cap.scale.set(1.5, 0.35, 1.5); cap.position.y = 5.1; g.add(cap);
      g.add(makeBar({ team }, 2.6, 7.6)); w.add(g);
      return addUnit({ team, kind: 'tower', x, z, hp: 1600, atk: 120, range: 8.5, cdMax: 1.1, radius: 1.4, group: g, crystal, col, warm: 0 });
    };
    const spireAt = (team, x, z) => {
      const t = TEAM[team];
      const col = w.cylinder({ id: 'spire', pos: [x, 1, z], radius: 2.2, height: 2, color: C.stone, sides: 8 });
      const g = new T.Group(); g.position.set(x, 0, z);
      const c = mesh(geo.oct, t.color, { glow: 2.6 }); c.scale.set(1.3, 3.2, 1.3); c.position.y = 5.2; g.add(c);
      const ring = mesh(geo.cyl, C.gold, { metal: 0.7 }); ring.scale.set(2.4, 0.25, 2.4); ring.position.y = 2.1; g.add(ring);
      g.add(makeBar({ team }, 3.4, 9.6)); w.add(g);
      return addUnit({ team, kind: 'spire', x, z, hp: 3000, atk: 0, range: 0, cdMax: 1, radius: 2.3, group: g, crystal: c, col });
    };
    // makeBar sets u.bar on the object it is given; rebuild the link for towers and spires
    const linkBar = (u) => { const g = u.group.children[u.group.children.length - 1]; u.bar = { g, fill: g.children[1], sh: g.children[2], width: g.children[1].scale.x }; };
    const towers = [towerAt(0, 5, 44), towerAt(0, 5, 24), towerAt(1, -5, -24), towerAt(1, -5, -44)].map((u) => { linkBar(u); return u; });
    const spires = [spireAt(0, 0, 62), spireAt(1, 0, -62)].map((u) => { linkBar(u); return u; });

    // champions
    const player = addUnit({ team: 0, kind: 'champ', x: 0, z: 74, hp: 560, atk: 34, range: 6, cdMax: 0.85, radius: 0.6, name: 'You', lvl: 1, xp: 0 });
    const rivalAv = w.avatar({ colors: { body: '#d64545', head: '#f2e6e6', visor: '#ffd166' }, eq: { head: 'tophat' }, name: 'Rival', nameColor: '#ffb3b3' });
    const rival = addUnit({ team: 1, kind: 'champ', x: 0, z: -74, hp: 560, atk: 32, range: 6, cdMax: 0.9, radius: 0.6, name: 'Rival', lvl: 1, xp: 0, av: rivalAv, yaw: 0, mode: 'lane', qcd: 0, ecd: 0, rcd: 0, dcd: 0 });
    // champions' bars float above them, facing the camera (placed each frame)
    const rivalBar = makeBar(rival, 1.6, 0); w.add(rivalBar);
    const youBar = makeBar(player, 1.6, 0); w.add(youBar);

    // =====================================================================================
    // Gear from other worlds: equipped items (and sigils carried) become match bonuses
    // =====================================================================================
    const gear = { speed: 0, dashCd: 1, ap: 0, recall: 1, dmg: 0, gold: 0, lines: [] };
    const readGear = () => {
      Object.assign(gear, { speed: 0, dashCd: 1, ap: 0, recall: 1, dmg: 0, gold: 0, lines: [] });
      const eq = w.equipment();
      for (const id of Object.values(eq)) {
        const it = id && w.itemInfo(id);
        if (!it) continue;
        if (it.traits.includes('glide')) { gear.speed += 0.06; gear.lines.push(`${it.name}: +6% move speed`); }
        if (it.traits.includes('doublejump')) { gear.dashCd *= 0.7; gear.lines.push(`${it.name}: dash recharges 30% faster`); }
        if (it.traits.includes('light')) { gear.ap += 0.15; gear.lines.push(`${it.name}: +15% ability power`); }
        if (it.traits.includes('board')) { gear.recall *= 0.5; gear.lines.push(`${it.name}: recall twice as fast`); }
        if (it.traits.includes('speed')) gear.lines.push(`${it.name}: +25% move speed`); // the engine already applies it
        if (id === 'crown') { gear.gold += 0.1; gear.lines.push('Founder\'s Crown: +10% gold'); }
      }
      for (const s of ['sigil-sky', 'sigil-deep', 'sigil-speed']) if (w.has(s)) { gear.dmg += 0.04; const it = w.itemInfo(s); gear.lines.push(`${it ? it.name : s}: +4% damage`); }
      w.player.setSpeed(0.78 * (1 + gear.speed));
    };

    // =====================================================================================
    // Match state
    // =====================================================================================
    const ROUND_SPAWN = 25;
    let state = 'pre', t0 = 0, endT = 0, waveT = 0, gold = 0, kills = 0, deaths = 0, cs = 0, upgradeIx = 0;
    const UPGRADES = [
      { name: 'Ember Blade', atk: 14, cost: 300 }, { name: 'Ward Plate', hp: 220, cost: 300 }, { name: 'Swift Greaves', speed: 0.1, cost: 280 },
      { name: 'Arc Focus', ap: 0.25, cost: 420 }, { name: 'Titan Plate', hp: 360, cost: 560 }, { name: 'Storm Blade', atk: 24, cost: 620 }, { name: 'Starheart', ap: 0.35, hp: 200, cost: 800 },
    ];
    const bonus = { atk: 0, hp: 0, speed: 0, ap: 0 };
    const xpFor = (lvl) => [0, 100, 230, 380, 560, 760, 980, 1230, 1500][Math.min(lvl, 8)];
    const statsFor = (u) => { const L = u.lvl - 1; return { hp: 560 + 82 * L + (u === player ? bonus.hp : 0), atk: 34 + 5 * L + (u === player ? bonus.atk : 0) }; };
    const P = { qcd: 0, ecd: 0, rcd: 0, dcd: 0, recallT: -1, dead: 0, starfall: null };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
    const enemiesOf = (u) => units.filter((v) => v.alive && v.team !== u.team);
    const towersUp = (team) => towers.filter((t) => t.alive && t.team === team).length;
    const targetable = (v) => v.kind !== 'spire' || towersUp(v.team) === 0;

    // ---------- visual effects (pure decoration; the tick decides everything) ----------
    const fx = [];
    const tracer = (a, b, color, life = 0.18, size = 0.22) => {
      const m = mesh(geo.sphere, color, { glow: 2.2 }); m.scale.setScalar(size); m.castShadow = false;
      w.add(m); fx.push({ m, ax: a.x, az: a.z, ay: 1.4, bx: b.x, bz: b.z, by: 1.2, t: 0, life });
    };

    // ---------- damage, death, rewards ----------
    const sound = (n) => w.sound(n);
    const damage = (target, amount, src) => {
      if (!target.alive || amount <= 0) return;
      if (target.kind === 'spire' && towersUp(target.team) > 0) return;
      if (target === player && P.dead) return;
      let a = amount;
      if (target.shield > 0) { const s = Math.min(target.shield, a); target.shield -= s; a -= s; }
      target.hp -= a; target.hitBy = src; target.lastHurt = w.time;
      if (src && src.kind === 'champ' && target.kind === 'champ') src.aggroT = w.time;
      if (target === player && P.recallT >= 0) { P.recallT = -1; w.toast('Recall interrupted'); }
      if (target === rival && rival.recallT >= 0) rival.recallT = -1;
      if (target.hp <= 0) kill(target, src);
    };
    const giveXp = (team, x, z, amount) => { for (const c of [player, rival]) if (c.team === team && c.alive && Math.hypot(c.x - x, c.z - z) < 14) gainXp(c, amount); };
    const gainXp = (c, amount) => {
      c.xp += amount;
      while (c.lvl < 9 && c.xp >= xpFor(c.lvl)) {
        c.lvl++;
        const s = statsFor(c), frac = c.hp / c.max;
        c.max = s.hp; c.hp = Math.min(c.max, c.hp + 82 * frac + 40); c.atk = s.atk;
        if (c === player) { w.toast(`Level ${c.lvl}!${c.lvl === 3 ? ' Starfall (R) unlocked.' : ''}`, 'item'); sound('checkpoint'); }
      }
    };
    const earn = (n) => { gold += Math.round(n * (1 + gear.gold)); };
    const kill = (u, src) => {
      u.alive = false; u.hp = 0;
      if (u.kind === 'melee' || u.kind === 'ranged') {
        if (u.mesh) u.mesh.removeFromParent();
        giveXp(1 - u.team, u.x, u.z, u.kind === 'melee' ? 34 : 28);
        if (src === player) { earn(u.kind === 'melee' ? 22 : 17); cs++; }
      } else if (u.kind === 'tower') {
        u.group.visible = false; u.col.hide();
        w.burst([u.x, 4, u.z], { color: [TEAM[u.team].color, '#ffffff', C.gold], count: 70, speed: 10, life: 1.2 }); w.shake(0.4); sound('crumble');
        if (u.team === 1) { earn(160); w.banner('TOWER DOWN', towersUp(1) ? 'One more stands before their spire.' : 'Their spire is exposed!'); }
        else w.banner('YOUR TOWER FELL', towersUp(0) ? 'Hold the line.' : 'Your spire is exposed!');
        giveXp(1 - u.team, u.x, u.z, 90);
      } else if (u.kind === 'spire') {
        u.group.visible = false; u.col.hide();
        finish(u.team === 1);
      } else if (u === player) {
        deaths++; P.dead = 5 + 1.6 * player.lvl; P.recallT = -1; w.player.freeze(true);
        w.banner('DEFEATED', `Back in ${Math.ceil(P.dead)} s`); sound('lose');
        if (src === rival) gainXp(rival, 160);
      } else if (u === rival) {
        rival.dead = 5 + 1.6 * rival.lvl; rival.av.root.visible = false; kills++;
        earn(260); gainXp(player, 160); w.banner('RIVAL DOWN', '+260 gold'); sound('win');
      }
    };
    const respawnPlayer = () => {
      player.alive = true; player.hp = player.max; player.shield = 0; P.dead = 0;
      const f = fountains[0];
      w.player.setPos([f.x, 1.0, f.z - 2], 180); w.player.freeze(false);
    };

    // ---------- minions ----------
    const spawnWave = () => {
      for (let team = 0; team < 2; team++) {
        const t = TEAM[team], z0 = t.spire[1] + (team === 0 ? -5 : 5);
        for (let i = 0; i < 5; i++) {
          const kind = i < 3 ? 'melee' : 'ranged', lane = [-1.8, 0, 1.8, -1, 1][i];
          const m = kind === 'melee' ? mesh(geo.box, t.color, { rough: 0.6 }) : mesh(geo.cone, t.color, { glow: 0.3 });
          if (kind === 'melee') m.scale.set(0.8, 1.0, 0.8); else m.scale.set(0.55, 1.2, 0.55);
          const g = new T.Group(); m.position.y = kind === 'melee' ? 0.5 : 0.6; g.add(m);
          const head = mesh(geo.sphere, '#f2efe6'); head.scale.setScalar(0.28); head.position.y = kind === 'melee' ? 1.2 : 1.35; g.add(head);
          const u = addUnit({ team, kind, x: lane, z: z0 - t.dir * (i >= 3 ? -2.2 : 0), hp: kind === 'melee' ? 320 : 230, atk: kind === 'melee' ? 14 : 22, range: kind === 'melee' ? 1.7 : 5.5, cdMax: kind === 'melee' ? 1.2 : 1.6, speed: 3.4, radius: 0.5, lane });
          g.add(makeBar(u, 0.9, 1.8)); g.position.set(u.x, 0, u.z); w.add(g); u.mesh = g;
        }
      }
    };

    // ---------- the match ----------
    const reset = () => {
      for (const u of units) if (u.kind === 'melee' || u.kind === 'ranged') { if (u.mesh) u.mesh.removeFromParent(); }
      for (let i = units.length - 1; i >= 0; i--) if (units[i].kind === 'melee' || units[i].kind === 'ranged') units.splice(i, 1);
      for (const u of towers.concat(spires)) { u.alive = true; u.hp = u.max; u.group.visible = true; u.col.show(); u.warm = 0; u.target = null; }
      Object.assign(bonus, { atk: 0, hp: 0, speed: 0, ap: 0 }); upgradeIx = 0; gold = 500; kills = 0; deaths = 0; cs = 0;
      for (const c of [player, rival]) { c.lvl = 1; c.xp = 0; const s = statsFor(c); c.max = c.hp = s.hp; c.atk = s.atk; c.shield = 0; c.alive = true; c.target = null; c.recallT = -1; }
      Object.assign(P, { qcd: 0, ecd: 0, rcd: 0, dcd: 0, recallT: -1, dead: 0, starfall: null });
      Object.assign(rival, { x: 0, z: -74, mode: 'lane', qcd: 3, ecd: 0, rcd: 0, dcd: 0, dead: 0, recallT: -1 }); rival.av.root.visible = true;
      readGear();
      respawnPlayer();
      state = 'countdown'; t0 = w.time; waveT = 6;
      w.timer.cancel();
    };
    let shownCd = -1;
    const finish = (won) => {
      state = 'over'; endT = w.time;
      const t = w.timer.stop();
      if (won) {
        w.record('victory', t);
        const wins = w.store.get('wins', 0) + 1; w.store.set('wins', wins);
        const best = w.store.get('best', null); if (best == null || t < best) w.store.set('best', t);
        w.banner('VICTORY', `${w.fmtTime(t)} · ${kills} takedowns · ${cs} minions`); sound('win'); w.shake(0.6);
        w.addCoins(30);
        if (!w.has('spire-circlet')) w.after(2.5, () => w.give('spire-circlet'));
      } else {
        w.banner('DEFEAT', 'Your spire fell. A new match starts shortly.'); sound('lose');
        w.addCoins(5);
      }
      w.objective(won ? 'Victory! A new match starts in a few seconds, or take the portal home.' : 'Defeat. A new match starts in a few seconds.');
    };

    // ---------- abilities ----------
    const nearestEnemy = (u, range, filter) => {
      let best = null, bd = range;
      for (const v of units) { if (!v.alive || v.team === u.team || (filter && !filter(v)) || !targetable(v)) continue; const d = dist(u, v) - (v.radius || 0.5); if (d < bd) { bd = d; best = v; } }
      return best;
    };
    const bolts = [];
    const castBolt = (u, aim, dmg) => {
      let dx, dz;
      if (aim) { dx = aim.x - u.x; dz = aim.z - u.z; } else { dx = Math.sin(u.yaw); dz = Math.cos(u.yaw); }
      const l = Math.hypot(dx, dz) || 1;
      const m = mesh(geo.sphere, TEAM[u.team].color, { glow: 3 }); m.scale.setScalar(0.45); m.castShadow = false; w.add(m);
      bolts.push({ team: u.team, src: u, x: u.x, z: u.z, dx: dx / l, dz: dz / l, left: 14, dmg, m });
      sound('boost');
    };
    const castStarfall = (u, at, dmg) => {
      const ring = mesh(geo.cyl, TEAM[u.team].color, { glow: 1.6, opacity: 0.45 }); ring.scale.set(5, 0.05, 5); ring.position.set(at.x, 0.1, at.z); ring.castShadow = false; w.add(ring);
      return { team: u.team, src: u, x: at.x, z: at.z, t: 0.7, dmg, ring };
    };
    const rivalFalls = [];

    // =====================================================================================
    // The tick
    // =====================================================================================
    w.on('tick', (dt) => {
      // player record follows the engine's player
      const pp = w.player.pos; player.x = pp[0]; player.z = pp[2]; player.yaw = w.player.yaw * D;
      if (state === 'pre') return;
      if (state === 'countdown') {
        const n = 3 - Math.floor(w.time - t0);
        if (n !== shownCd) { shownCd = n; if (n > 0) { w.banner(String(n), n === 3 ? (gear.lines.length ? 'Your gear: ' + gear.lines.join(' · ') : 'No gear bonuses: bring items from other worlds!') : ''); sound('countdown'); } }
        if (w.time - t0 >= 3) { state = 'live'; w.banner('FIGHT!', 'Push the lane. Topple their towers, then their spire.'); sound('go'); w.timer.start(); }
        return;
      }
      if (state === 'over') { if (w.time - endT > 9) reset(); return; }

      // waves and passive gold
      waveT -= dt;
      if (waveT <= 0) { spawnWave(); waveT = ROUND_SPAWN; }
      if (Math.floor(w.time * 2) !== Math.floor((w.time - dt) * 2)) earn(1.5);

      // ---------- the player ----------
      const inp = w.input, moving = Math.hypot(inp.move[0], inp.move[1]) > 0.1;
      for (const k of ['qcd', 'ecd', 'rcd', 'dcd']) P[k] = Math.max(0, P[k] - dt);
      if (P.dead > 0) { P.dead -= dt; if (P.dead <= 0) respawnPlayer(); }
      else {
        const ap = 1 + gear.ap + bonus.ap, dmgMul = 1 + gear.dmg;
        if (inp.q && P.qcd <= 0) { const aim = nearestEnemy(player, 13, (v) => v.kind === 'champ') || nearestEnemy(player, 13); castBolt(player, aim, (75 + 26 * (player.lvl - 1)) * ap * dmgMul); P.qcd = 5; }
        if (inp.e && P.ecd <= 0) { player.shield = (110 + 36 * (player.lvl - 1)) * ap; player.shieldT = 3; P.ecd = 13; sound('pickup'); w.burst([player.x, 1.4, player.z], { color: ['#ffffff', C.blue], count: 18, speed: 3, life: 0.5 }); }
        if (inp.r && P.rcd <= 0 && player.lvl >= 3) { const at = nearestEnemy(player, 12, (v) => v.kind === 'champ') || nearestEnemy(player, 10) || player; P.starfall = castStarfall(player, { x: at.x, z: at.z }, (220 + 75 * (player.lvl - 1)) * ap * dmgMul); P.rcd = 55; sound('open'); }
        else if (inp.r && player.lvl < 3) w.toast('Starfall unlocks at level 3');
        if (inp.dash && P.dcd <= 0) { const dx = Math.sin(player.yaw), dz = Math.cos(player.yaw); w.player.launch(0.1, dx * 30, dz * 30); P.dcd = 12 * gear.dashCd; sound('jump'); }
        if (inp.recall && P.recallT < 0) { P.recallT = 3 * gear.recall; w.toast(`Recalling… (${P.recallT.toFixed(1)} s, don't move)`); }
        if (P.recallT >= 0) {
          if (moving) { P.recallT = -1; w.toast('Recall cancelled'); }
          else { P.recallT -= dt; if (P.recallT < 0) { const f = fountains[0]; w.player.setPos([f.x, 1.0, f.z - 2], 180); sound('portal'); } }
        }
        if (player.shieldT > 0) { player.shieldT -= dt; if (player.shieldT <= 0) player.shield = 0; }
        // automatic attacks while standing still
        player.cd -= dt;
        if (!moving && player.cd <= 0) {
          const tgt = nearestEnemy(player, player.range, (v) => v.kind === 'champ') || nearestEnemy(player, player.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(player, player.range + 1);
          if (tgt) { damage(tgt, player.atk * (1 + gear.dmg), player); player.cd = player.cdMax; tracer(player, tgt, C.blue); }
        }
        // fountain: heal, and buy the next upgrade when you can afford it
        const f = fountains[0];
        if (Math.hypot(player.x - f.x, player.z - f.z) < 5) {
          player.hp = Math.min(player.max, player.hp + player.max * 0.12 * dt);
          const up = UPGRADES[upgradeIx];
          if (up && gold >= up.cost) {
            gold -= up.cost; upgradeIx++;
            bonus.atk += up.atk || 0; bonus.hp += up.hp || 0; bonus.ap += up.ap || 0;
            if (up.speed) { bonus.speed += up.speed; w.player.setSpeed(0.78 * (1 + gear.speed + bonus.speed)); }
            const s = statsFor(player); player.max = s.hp; player.atk = s.atk; player.hp = Math.min(player.max, player.hp + (up.hp || 0));
            w.toast(`Bought ${up.name}`, 'item'); sound('coin');
          }
        }
      }

      // ---------- the rival ----------
      const rv = rival;
      for (const k of ['qcd', 'ecd', 'rcd', 'dcd']) rv[k] = Math.max(0, rv[k] - dt);
      if (rv.dead > 0) {
        rv.dead -= dt;
        if (rv.dead <= 0) { rv.alive = true; rv.hp = rv.max; rv.shield = 0; rv.x = 0; rv.z = -74; rv.av.root.visible = true; rv.mode = 'lane'; }
      } else if (rv.alive) {
        const frac = rv.hp / rv.max, pfrac = player.hp / player.max, dp = dist(rv, player);
        const blueTowerNearPlayer = towers.some((t) => t.alive && t.team === 0 && dist(t, player) < 9);
        if (rv.shieldT > 0) { rv.shieldT -= dt; if (rv.shieldT <= 0) rv.shield = 0; }
        let goal = null, fight = false;
        if (rv.recallT >= 0) {
          rv.recallT -= dt;
          if (rv.recallT < 0) { rv.x = 0; rv.z = -74; }
        } else if (frac < 0.28) {
          goal = { x: 0, z: -74 }; // retreat; recall when safe
          if (!player.alive || dp > 11) { rv.recallT = 3; }
          if (rv.dcd <= 0 && player.alive && dp < 6) { rv.dashT = 0.2; rv.dcd = 16; }
        } else if (player.alive && !P.dead && dp < 10 && !blueTowerNearPlayer && (frac > pfrac - 0.05 || pfrac < 0.35)) {
          fight = true; goal = dp > rv.range - 0.5 ? player : null;
          if (rv.qcd <= 0 && dp < 12) { castBolt(rv, player, 70 + 24 * (rv.lvl - 1)); rv.qcd = 6.5; }
          if (rv.ecd <= 0 && frac < 0.55) { rv.shield = 100 + 32 * (rv.lvl - 1); rv.shieldT = 3; rv.ecd = 15; }
          if (rv.rcd <= 0 && rv.lvl >= 3 && pfrac < 0.5 && dp < 8) { rivalFalls.push(castStarfall(rv, player, 200 + 70 * (rv.lvl - 1))); rv.rcd = 65; }
        } else {
          // stay a few steps behind the red frontline, or by the outer red tower
          let front = null;
          for (const m of units) if (m.alive && m.team === 1 && (m.kind === 'melee' || m.kind === 'ranged') && (!front || m.z > front.z)) front = m;
          goal = front ? { x: 2.5, z: front.z - 3.5 } : { x: 2.5, z: -28 };
          // never stand inside a blue tower's reach without minions to tank it
          for (const t of towers) if (t.alive && t.team === 0 && t.target && t.target === rv) goal = { x: 2.5, z: t.z - 11 };
        }
        if (rv.recallT < 0 && goal) {
          const dx = goal.x - rv.x, dz = goal.z - rv.z, d = Math.hypot(dx, dz);
          const sp = 6.1 * (rv.dashT > 0 ? 4 : 1);
          if (rv.dashT > 0) rv.dashT -= dt;
          if (d > 0.3) { const step = Math.min(d, sp * dt); rv.x += dx / d * step; rv.z += dz / d * step; rv.yaw = Math.atan2(dx, dz); rv.walking = true; } else rv.walking = false;
        } else rv.walking = false;
        rv.x = Math.max(-13.5, Math.min(13.5, rv.x));
        rv.cd -= dt;
        if (rv.cd <= 0 && rv.recallT < 0) {
          const tgt = (fight && dp <= rv.range + 0.6) ? player : nearestEnemy(rv, rv.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(rv, rv.range + 1, (v) => v.kind !== 'champ');
          if (tgt && tgt.alive && !(tgt === player && P.dead)) { damage(tgt, rv.atk, rv); rv.cd = rv.cdMax; rv.yaw = Math.atan2(tgt.x - rv.x, tgt.z - rv.z); tracer(rv, tgt, C.red); }
        }
        if (Math.hypot(rv.x - fountains[1].x, rv.z - fountains[1].z) < 5) rv.hp = Math.min(rv.max, rv.hp + rv.max * 0.12 * dt);
        // the rival keeps pace with your upgrades as the match goes on
        const minute = (w.time - t0) / 60;
        rv.atk = statsFor(rv).atk * (1 + 0.04 * minute); rv.max = statsFor(rv).hp * (1 + 0.04 * minute);
      }

      // ---------- minions ----------
      for (const m of units) {
        if (!m.alive || (m.kind !== 'melee' && m.kind !== 'ranged')) continue;
        m.cd -= dt;
        if (m.target && (!m.target.alive || dist(m, m.target) > 9 || !targetable(m.target) || (m.target === player && P.dead))) m.target = null;
        if (!m.target) m.target = nearestEnemy(m, 7, (v) => !(v === player && P.dead));
        const tgt = m.target;
        if (tgt && dist(m, tgt) - (tgt.radius || 0.5) <= m.range) {
          if (m.cd <= 0) { damage(tgt, m.atk, m); m.cd = m.cdMax; if (m.kind === 'ranged') tracer(m, tgt, TEAM[m.team].color, 0.25, 0.14); }
        } else {
          const gx = tgt ? tgt.x : m.lane, gz = tgt ? tgt.z : (m.team === 0 ? -66 : 66);
          const dx = gx - m.x, dz = gz - m.z, d = Math.hypot(dx, dz) || 1;
          m.x += dx / d * m.speed * dt; m.z += dz / d * m.speed * dt; m.yaw = Math.atan2(dx, dz);
        }
      }

      // ---------- towers ----------
      for (const t of towers) {
        if (!t.alive) continue;
        t.cd -= dt;
        if (t.target && (!t.target.alive || dist(t, t.target) > t.range || (t.target === player && P.dead))) { t.target = null; t.warm = 0; }
        // a champion who just hit a champion under this tower becomes its target
        for (const c of [player, rival]) if (c.team !== t.team && c.alive && !(c === player && P.dead) && w.time - c.aggroT < 2 && dist(t, c) <= t.range) { const ally = c === player ? rival : player; if (ally.team === t.team && dist(t, ally) <= t.range + 2) { if (t.target !== c) t.warm = 0; t.target = c; } }
        if (!t.target) t.target = nearestEnemy(t, t.range, (v) => v.kind === 'melee' || v.kind === 'ranged') || nearestEnemy(t, t.range, (v) => v.kind === 'champ' && !(v === player && P.dead));
        if (t.target && t.cd <= 0) {
          const champ = t.target.kind === 'champ';
          damage(t.target, champ ? t.atk * (1 + 0.25 * t.warm) : t.target.max * 0.38, t);
          if (champ) t.warm = Math.min(t.warm + 1, 4);
          t.cd = t.cdMax; tracer({ x: t.x, z: t.z }, t.target, TEAM[t.team].color, 0.3, 0.3);
        }
      }

      // ---------- projectiles and starfalls ----------
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i], step = 30 * dt;
        b.x += b.dx * step; b.z += b.dz * step; b.left -= step;
        let hit = null;
        for (const v of units) if (v.alive && v.team !== b.team && v.kind !== 'tower' && v.kind !== 'spire' && Math.hypot(v.x - b.x, v.z - b.z) < (v.radius || 0.5) + 0.5 && !(v === player && P.dead)) { hit = v; break; }
        if (hit) { damage(hit, b.dmg, b.src); w.burst([hit.x, 1.2, hit.z], { color: [TEAM[b.team].color, '#ffffff'], count: 12, speed: 4, life: 0.4 }); }
        if (hit || b.left <= 0) { b.m.removeFromParent(); bolts.splice(i, 1); }
      }
      const falls = (P.starfall ? [P.starfall] : []).concat(rivalFalls);
      for (const s of falls) {
        s.t -= dt;
        if (s.t <= 0 && !s.done) {
          s.done = true; s.ring.removeFromParent();
          for (const v of units) if (v.alive && v.team !== s.team && v.kind !== 'tower' && v.kind !== 'spire' && Math.hypot(v.x - s.x, v.z - s.z) < 5) damage(v, s.dmg, s.src);
          w.burst([s.x, 2, s.z], { color: [TEAM[s.team].color, '#ffffff', C.gold], count: 60, speed: 9, life: 0.9 }); w.shake(0.25); sound('crumble');
        }
      }
      if (P.starfall && P.starfall.done) P.starfall = null;
      for (let i = rivalFalls.length - 1; i >= 0; i--) if (rivalFalls[i].done) rivalFalls.splice(i, 1);
      // remove the dead
      for (let i = units.length - 1; i >= 0; i--) { const u = units[i]; if (!u.alive && (u.kind === 'melee' || u.kind === 'ranged')) units.splice(i, 1); }

      // HUD, a few times a second
      if (w.ticks % 12 === 0) {
        const cd = (v) => (v <= 0 ? 'ready' : v.toFixed(0) + 's');
        w.objective(P.dead > 0 ? `Respawning in ${Math.ceil(P.dead)} s` : `Lv ${player.lvl} · HP ${Math.ceil(player.hp)}/${Math.ceil(player.max)} · ${Math.floor(gold)} gold · Q ${cd(P.qcd)} · E ${cd(P.ecd)} · R ${player.lvl < 3 ? 'Lv 3' : cd(P.rcd)} · Dash ${cd(P.dcd)}${P.recallT >= 0 ? ' · recalling' : ''} · towers ${towersUp(0)}–${towersUp(1)}`);
      }
    });

    // =====================================================================================
    // Drawing (visual only)
    // =====================================================================================
    const setBar = (u) => {
      if (!u.bar || !u.bar.fill) return;
      const k = Math.max(0, u.hp / u.max), W = u.bar.width;
      u.bar.fill.scale.x = Math.max(0.001, W * k); u.bar.fill.position.x = -W * (1 - k) / 2;
      const s = Math.min(1, (u.shield || 0) / u.max);
      u.bar.sh.visible = s > 0.005; if (s > 0.005) { u.bar.sh.scale.x = W * s; u.bar.sh.position.x = -W / 2 + W * k + W * s / 2 - 0.001; }
    };
    w.on('frame', (dt, time) => {
      for (const u of units) {
        if (u.kind === 'melee' || u.kind === 'ranged') { if (u.mesh) { u.mesh.position.x += (u.x - u.mesh.position.x) * Math.min(1, dt * 14); u.mesh.position.z += (u.z - u.mesh.position.z) * Math.min(1, dt * 14); u.mesh.rotation.y = u.yaw || 0; } }
        if (u.kind === 'tower' || u.kind === 'spire') u.crystal.rotation.y += dt * 0.8;
        setBar(u);
      }
      const r = rival;
      r.av.root.position.set(r.x, 0, r.z); r.av.root.rotation.y = r.yaw || 0;
      r.av.animate({ speed: r.walking ? 6 : 0, grounded: true, vy: 0, groundDist: 0 }, dt);
      const pp = w.player.pos; youBar.position.set(pp[0], pp[1] + 1.8, pp[2]); youBar.visible = !(P.dead > 0);
      rivalBar.position.set(r.x, 2.7, r.z); rivalBar.visible = r.av.root.visible;
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i]; f.t += dt; const k = Math.min(1, f.t / f.life);
        f.m.position.set(f.ax + (f.bx - f.ax) * k, f.ay + (f.by - f.ay) * k, f.az + (f.bz - f.az) * k);
        if (f.t >= f.life) { f.m.removeFromParent(); fx.splice(i, 1); }
      }
      for (const b of bolts) b.m.position.set(b.x, 1.3, b.z);
      for (const s of (P.starfall ? [P.starfall] : []).concat(rivalFalls)) if (s.ring) s.ring.material.opacity = 0.25 + 0.35 * Math.abs(Math.sin(time * 9));
    });

    w.on('enter', () => { readGear(); reset(); });
    w.on('leave', () => own.forEach((g) => g.dispose()));

    // the rules, by the fountain
    w.sign({ pos: [-7.5, 0, 72], yaw: 160, title: 'SPIRE CLASH', width: 3.4, text: 'WASD or arrows move. Attacks are automatic when you stand still.\nQ bolt · E shield · R starfall (level 3) · Space dash · B recall.\nTopple both red towers, then their spire.' });
    w.sign({ pos: [7.5, 0, 72], yaw: -160, title: 'YOUR GEAR COUNTS', width: 3.4, text: 'Glider: faster. Spring Boots: quicker dash. Lantern: stronger abilities. Hoverboard: faster recall. Each sigil: more damage. Crown: more gold. Hats show on your champion.' });

    // read-only test hook for tools
    w.scene.userData.clash = { units, P, player, rival, towers, spires, get state() { return state; }, get gold() { return gold; }, get kills() { return kills; }, get deaths() { return deaths; }, get cs() { return cs; } };
  },
};
