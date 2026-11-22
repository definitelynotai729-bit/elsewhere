// Crystal Rush: a 90-second score attack on a floating playground.
// Three crystals glow at a time. Grab one and the next appears somewhere else. Every player gets the same
// seeded sequence, so scores compare fairly and can be verified like any other run (w.record, higher wins).
export default {
  id: 'rush',
  name: 'Crystal Rush',
  author: 'elsewhere',
  version: 1,
  blurb: 'Ninety seconds. Grab every crystal you can.',
  color: '#ff7eb6',
  spawn: { pos: [0, 1.2, 25], yaw: 180 },
  killY: -18,
  rules: { deny: ['board'] },
  theme: {
    skyTop: '#2f6fd6', skyHorizon: '#c4f1ff', skyBottom: '#a8e6ff', skySharp: 0.6,
    sunDir: [-0.4, 0.7, -0.5], sunColor: '#fff0d0', sunSize: 2.2, sunLight: '#fff2dd', sunIntensity: 3.0,
    hemiSky: '#d6ecff', hemiGround: '#8a7fb8', hemiIntensity: 1.5,
    fog: [120, 460], fogColor: '#c4f1ff', stars: 0, bloom: 0.45, exposure: 1.0,
    clouds: { y: -22, color: '#ffffff', opacity: 0.85 },
  },
  music: { root: 62, scale: 'lydian', bpm: 118, progression: [0, 4, 5, 3], sparkle: 0.5, bright: 2600, wave: 'triangle', pulse: true },
  items: {
    'rush-visor': { name: 'Rush Visor', slot: 'head', traits: ['cosmetic'], rarity: 'uncommon', desc: 'Scored 12 or more in Crystal Rush.',
      look: [{ s: 'box', size: [0.66, 0.1, 0.58], pos: [0, -0.17, 0], color: '#2a2d52' },
        { s: 'box', size: [0.54, 0.07, 0.04], pos: [0, -0.17, 0.3], color: '#ff7eb6', glow: 2.2 }] },
    'prism-cape': { name: 'Prism Cape', slot: 'back', traits: ['cosmetic'], rarity: 'epic', desc: 'Scored 30 or more in Crystal Rush. Worn by very few.',
      look: [{ s: 'box', size: [0.52, 0.72, 0.04], pos: [0, -0.22, -0.02], rot: [10, 0, 0], color: '#c9a7ff', glow: 0.5 },
        { s: 'box', size: [0.52, 0.06, 0.05], pos: [0, -0.56, 0.04], rot: [10, 0, 0], color: '#7cf6ff', glow: 1.8 },
        { s: 'oct', r: 0.1, pos: [0, 0.14, 0.03], color: '#7cf6ff', glow: 2.2 }] },
  },

  build(w) {
    const C = { floor: '#5b6aa8', tile: '#6b7bc0', wall: '#3d3f78', plat: '#c9a7ff', platTop: '#e3d4ff', ramp: '#ffb3c7', mint: '#7fe0c8', gold: '#ffd166', pink: '#ff7eb6', cyan: '#7cf6ff' };
    const ROUND = 90, ACTIVE = 3;

    // ---------- the playground ----------
    w.box({ pos: [0, -0.5, 0], size: [44, 1, 44], color: C.floor });
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if ((i + j) % 2 === 0) w.box({ pos: [i * 8.4, 0.01, j * 8.4], size: [8.2, 0.02, 8.2], color: C.tile, collide: false, shadow: false });
    w.box({ pos: [0, -0.5, 28], size: [14, 1, 12], color: C.floor }); // lobby
    const wall = (x, z, sx, sz) => w.box({ pos: [x, 0.6, z], size: [sx, 1.2, sz], color: C.wall });
    wall(0, -22.3, 45.2, 0.6); wall(-22.3, 0, 0.6, 44); wall(22.3, 0, 0.6, 44);
    wall(-14.65, 22.3, 15.3, 0.6); wall(14.65, 22.3, 15.3, 0.6); // the gap is the way in from the lobby
    wall(-7.3, 28, 0.6, 12); wall(7.3, 28, 0.6, 12); wall(0, 34.3, 15.2, 0.6);

    // four corner decks, each with a ramp up
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      w.box({ pos: [14 * sx, 4, 14 * sz], size: [8, 1, 8], color: C.plat });
      w.box({ pos: [14 * sx, 4.52, 14 * sz], size: [7.6, 0.04, 7.6], color: C.platTop, collide: false, shadow: false });
      w.ramp({ pos: [14 * sx, 2.25, 5.5 * sz], size: [3, 4.5, 9], yaw: sz > 0 ? 0 : 180, color: C.ramp });
    }
    // the tower in the middle, with four pads that throw you onto it
    w.cylinder({ pos: [0, 4.25, 0], radius: 3, height: 8.5, color: C.wall, sides: 8 });
    w.cylinder({ pos: [0, 8.55, 0], radius: 3.2, height: 0.2, color: C.mint, glow: 0.4, sides: 8 });
    for (const [dx, dz] of [[0, 6], [0, -6], [6, 0], [-6, 0]]) w.jumpPad({ pos: [dx, 0, dz], power: 25, push: [-dx * 0.85, 0, -dz * 0.85], color: C.gold });
    // shuttles between the corner decks, north and south
    for (const z of [14, -14]) {
      const s = w.box({ pos: [10, 4.25, z], size: [3, 0.5, 3], color: C.mint, glow: 0.3 });
      w.mover(s, { path: [[9.6, 4.25, z], [-9.6, 4.25, z]], speed: 3.6, pause: 0.8, offset: z > 0 ? 0 : 0.5 });
    }
    // a ring of crumbling stones around the tower top
    const RING = [];
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6, x = Math.sin(a) * 8, z = Math.cos(a) * 8; // a hop from the tower top, and from each other
      const s = w.box({ pos: [x, 7.9, z], size: [2.2, 0.6, 2.2], yaw: k * 30, color: C.ramp });
      w.crumble(s, { delay: 0.45, respawn: 2.5 });
      RING.push([x, 9.4, z]);
    }
    // boost pads around the floor, clockwise
    w.boostPad({ pos: [0, 0, -18], yaw: -90 }); w.boostPad({ pos: [-18, 0, 0], yaw: 0 });
    w.boostPad({ pos: [0, 0, 18], yaw: 90 }); w.boostPad({ pos: [18, 0, 0], yaw: 180 });

    // ---------- crystals ----------
    const SPOTS = [
      [8, 1.2, 8], [-8, 1.2, 8], [8, 1.2, -8], [-8, 1.2, -8], [0, 1.2, 16], [0, 1.2, -16], [16, 1.2, 0], [-16, 1.2, 0],
      [19, 1.2, 19], [-19, 1.2, -19], [19, 1.2, -19], [-19, 1.2, 19],
      [14, 5.7, 14], [-14, 5.7, 14], [14, 5.7, -14], [-14, 5.7, -14], [17, 5.7, 11], [-17, 5.7, -11], [11, 5.7, -17], [-11, 5.7, 17],
      [0, 5.9, 14], [0, 5.9, -14], [0, 9.9, 0], [0, 11.4, 0],
    ].concat(RING);
    const crystals = SPOTS.map((p) => {
      const m = w.model({ pos: p, parts: [{ s: 'oct', r: 0.42, color: C.cyan, glow: 2.4 }, { s: 'torus', r: 0.62, tube: 0.04, rot: [90, 0, 0], color: '#ffffff', glow: 1.4 }] });
      const g = w.model({ pos: p, parts: [{ s: 'oct', r: 0.5, color: C.gold, glow: 2.8 }, { s: 'torus', r: 0.75, tube: 0.05, rot: [90, 0, 0], color: C.gold, glow: 2 }] });
      m.group.visible = false; g.group.visible = false;
      return { p, m, g, on: false, gold: false };
    });
    // the same order for everyone: a seeded shuffle, walked in a loop
    const R = w.rand(91);
    const order = SPOTS.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = R.int(0, i); const t = order[i]; order[i] = order[j]; order[j] = t; }
    let cursor = 0, spawned = 0;
    const spawnNext = () => {
      for (let tries = 0; tries < order.length; tries++) {
        const c = crystals[order[cursor % order.length]]; cursor++;
        if (c.on) continue;
        spawned++; c.on = true; c.gold = spawned % 7 === 0;
        c.m.group.visible = !c.gold; c.g.group.visible = c.gold;
        return;
      }
    };
    const clearAll = () => crystals.forEach((c) => { c.on = false; c.m.group.visible = c.g.group.visible = false; });

    // ---------- the round ----------
    let state = 'idle', score = 0, t0 = 0, cdT = 0, cdStep = -1, endT = 0, shownLeft = -1;
    const best = () => w.store.get('best', null);
    const fmtBest = () => (best() == null ? 'no score yet' : `best ${best()}`);
    const idleObjective = () => w.objective(`Step on the glowing pad to start a 90-second round · ${fmtBest()}`);
    const START = [0, 0, 19.5];
    const padMat = w.box({ id: 'start-pad', pos: [START[0], 0.03, START[2]], size: [5, 0.06, 3], color: C.pink, glow: 1.8, collide: false, shadow: false });
    w.label({ pos: [0, 2.4, 19.5], text: 'START', size: 0.5, border: C.pink });

    const startCountdown = () => {
      if (state !== 'idle') return;
      state = 'countdown'; cdT = 0; cdStep = -1; score = 0;
      w.player.setPos([START[0], 1.0, START[2]], 180); w.player.freeze(true);
      w.player.setCheckpoint([START[0], 1.0, START[2]], 180);
      padMat.hide();
    };
    const go = () => {
      state = 'running'; t0 = w.time; cursor = 0; spawned = 0; clearAll();
      for (let i = 0; i < ACTIVE; i++) spawnNext();
      w.player.freeze(false); w.timer.start();
    };
    const finish = () => {
      state = 'done'; endT = w.time; clearAll(); w.timer.stop();
      w.record('crystals', score, { better: 'higher' });
      const prev = best(), isBest = prev == null || score > prev;
      if (isBest) w.store.set('best', score);
      w.sound('win'); w.shake(0.3);
      w.burst([0, 10, 0], { color: [C.cyan, C.pink, C.gold, '#ffffff'], count: 120, speed: 12, life: 1.6 });
      w.banner(`${score} CRYSTALS`, isBest && prev != null ? `new best (was ${prev})` : isBest ? 'your first score' : fmtBest());
      const coins = Math.min(15, Math.floor(score / 5));
      if (coins) { w.addCoins(coins); w.toast(`+${coins} coins`); }
      if (score >= 12 && !w.has('rush-visor')) w.after(2, () => w.give('rush-visor'));
      if (score >= 30 && !w.has('prism-cape')) w.after(4, () => w.give('prism-cape'));
      w.objective(`Round over: ${score} crystals · ${fmtBest()}`);
    };

    w.zone({ pos: [START[0], 1, START[2]], size: [5, 2, 3], onEnter: () => startCountdown() });

    w.on('tick', (dt) => {
      if (state === 'countdown') {
        cdT += dt;
        const step = Math.floor(cdT);
        if (step !== cdStep) {
          cdStep = step;
          if (step < 3) { w.banner(String(3 - step), step === 0 ? 'Grab every crystal you can' : ''); w.sound('countdown'); }
          else { w.banner('GO!', ''); w.sound('go'); go(); }
        }
        return;
      }
      if (state === 'running') {
        const p = w.player.pos;
        for (const c of crystals) {
          if (!c.on) continue;
          const dx = p[0] - c.p[0], dy = p[1] - c.p[1], dz = p[2] - c.p[2];
          if (dx * dx + dy * dy + dz * dz < 2.4) {
            c.on = false; c.m.group.visible = c.g.group.visible = false;
            score += c.gold ? 3 : 1;
            w.sound(c.gold ? 'gem' : 'coin');
            w.burst(c.p, { color: c.gold ? [C.gold, '#ffffff'] : [C.cyan, '#ffffff'], count: c.gold ? 30 : 14, speed: 5, life: 0.6 });
            spawnNext();
          }
        }
        const left = Math.max(0, Math.ceil(ROUND - (w.time - t0)));
        if (left !== shownLeft) { shownLeft = left; w.objective(`Crystals: ${score} · ${left} s left`); if (left <= 5 && left > 0) w.sound('countdown'); }
        if (w.time - t0 >= ROUND) finish();
        return;
      }
      if (state === 'done' && w.time - endT > 4) { state = 'idle'; padMat.show(); shownLeft = -1; idleObjective(); }
    });
    w.on('frame', (dt, time) => {
      for (const c of crystals) if (c.on) { const g = c.gold ? c.g.group : c.m.group; g.rotation.y += dt * 2.4; g.position.y = c.p[1] + Math.sin(time * 3 + c.p[0]) * 0.12; }
    });
    w.on('fall', () => { if (state === 'running') w.toast('Back to the start. The clock keeps running!', 'bad'); });
    w.on('enter', () => { state = 'idle'; idleObjective(); w.player.setCheckpoint([0, 1.0, 24], 180); });

    // ---------- the lobby ----------
    w.portal({ pos: [0, 0, 32.5], yaw: 180, to: 'hub', label: 'Junction', arrive: 9 });
    w.sign({ pos: [-4.9, 0, 23.6], yaw: 25, title: 'CRYSTAL RUSH', width: 3.0, text: 'Ninety seconds. Three crystals glow at a time; grab one and another appears. Gold ones are worth three.\nEveryone gets the same crystals in the same order, so scores are fair.\nRamps, pads and shuttles lead up. The pink ring crumbles.' });
    w.npc({ pos: [4.9, 0, 23.6], yaw: -25, name: 'Juno', colors: { body: '#ff7eb6', head: '#fff3e0', visor: '#7cf6ff' }, hat: 'partyhat', wave: true, onTalk: async () => {
      const b = best();
      const lines = b == null
        ? ['Welcome to the Rush! Step on the pink pad and you get ninety seconds.', 'Crystals pop up three at a time. The gold ones are worth three, and they like high places.', 'Score 12 and the Rush Visor is yours. Score 30 and I will hand you the Prism Cape. Nobody has one yet.']
        : [`Your best is ${b}. ${b >= 30 ? 'You have the Cape. Now go for the ledger: submit your best run and see whose name is on top.' : b >= 12 ? 'Thirty gets the Prism Cape. Learn the pads: the tower top is a shortcut to the ring.' : 'Twelve gets the Rush Visor. Use the ramps early, and keep moving.'}`];
      await w.say('Juno', lines);
    } });

    // test hook for tools (read-only)
    w.scene.userData.rush = { SPOTS, get state() { return state; }, get score() { return score; }, get active() { return crystals.filter((c) => c.on).map((c) => c.p); } };
  },
};
