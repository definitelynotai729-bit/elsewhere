// An Elsewhere community level (format elsewhere-level/3: models, and an optional reward item), written by the engine's level compiler.
// The code below is the same for every level; only the DATA line differs, so a level cannot run code of its own.
const DATA = JSON.parse("{\"author\":{\"key\":\"LoZAVqWLToSjlDKrPUhYs5mJJFUUUptheV6YUdWi5v4=\",\"name\":\"Tester\"},\"blurb\":\"\",\"color\":\"#ffd166\",\"format\":\"elsewhere-level/3\",\"goal\":[0,0,-10],\"id\":\"lv-6744c401f9\",\"killY\":-16.2,\"name\":\"Model Bridge\",\"parts\":[{\"c\":\"#ffd6a5\",\"h\":\"9040ac01d54d7a2f1b73f0dd6921d0228a2bdd7f43da94dd1a6380c55c1ace56\",\"hull\":[[0.4,0.12,0.5],[-0.4,0.12,0.5],[0.4,0.12,-0.5],[-0.4,0.12,-0.5],[0.4,0,0.5],[-0.4,0,-0.5],[0.4,0,-0.5],[-0.4,0,0.5]],\"k\":10,\"p\":[0,-1.2,-7],\"s\":\"mesh\",\"y\":0}],\"spawn\":[0,0,0,180],\"theme\":\"dusk\",\"things\":[]}");
const THEMES = {
  day: { skyTop: '#2a64cf', skyHorizon: '#bfe3fb', skyBottom: '#8fc2ea', skySharp: 0.7, sunDir: [0.35, 0.75, -0.55], sunColor: '#fff2c8', sunSize: 2, sunLight: '#fff4e0', sunIntensity: 3.0, hemiSky: '#cfe6ff', hemiGround: '#7a9a6a', hemiIntensity: 1.5, fog: [140, 560], fogColor: '#bfe3fb', stars: 0, bloom: 0.35, exposure: 0.95, clouds: { y: -30, color: '#f4f9ff', opacity: 0.75 } },
  dusk: { skyTop: '#0c0a2e', skyHorizon: '#ff7b8a', skyBottom: '#2a1240', skySharp: 0.5, sunDir: [0.55, 0.3, -0.78], sunColor: '#ffb070', sunSize: 3, sunLight: '#ffd0b0', sunIntensity: 2.8, hemiSky: '#b9c4ff', hemiGround: '#6a4a8a', hemiIntensity: 1.9, fog: [70, 330], fogColor: '#c25e86', stars: 0.75, bloom: 0.6, exposure: 1.2, clouds: { y: -26, color: '#ffb3d0', opacity: 0.55 } },
  night: { skyTop: '#020008', skyHorizon: '#d4207f', skyBottom: '#0a0214', skySharp: 0.32, sunDir: [0.0, 0.07, -1], sunColor: '#ff5ab4', sunSize: 0.02, sunLight: '#ff9ad6', sunIntensity: 1.1, hemiSky: '#7a5cff', hemiGround: '#1a0830', hemiIntensity: 1.25, fog: [160, 900], fogColor: '#2a0a3c', stars: 0.95, bloom: 0.85, exposure: 1.1 },
  cave: { skyTop: '#020409', skyHorizon: '#04090e', skyBottom: '#010204', skySharp: 0.6, sunDir: [0.2, 0.95, -0.25], sunColor: '#000000', sunSize: 1, sunLight: '#5470ff', sunIntensity: 0, hemiSky: '#5a92b8', hemiGround: '#3a2458', hemiIntensity: 1.6, fog: [24, 140], fogColor: '#04090e', stars: 0, bloom: 0.8, exposure: 1.3 },
  candy: { skyTop: '#2f6fd6', skyHorizon: '#c4f1ff', skyBottom: '#a8e6ff', skySharp: 0.6, sunDir: [-0.4, 0.7, -0.5], sunColor: '#fff0d0', sunSize: 2.2, sunLight: '#fff2dd', sunIntensity: 3.0, hemiSky: '#d6ecff', hemiGround: '#8a7fb8', hemiIntensity: 1.5, fog: [120, 460], fogColor: '#c4f1ff', stars: 0, bloom: 0.45, exposure: 1.0, clouds: { y: -22, color: '#ffffff', opacity: 0.85 } },
};
const MUSIC = {
  day: { root: 60, scale: 'major', bpm: 88, progression: [0, 3, 4, 5], sparkle: 0.3, bright: 2200, wave: 'triangle' },
  dusk: { root: 57, scale: 'lydian', bpm: 66, progression: [0, 4, 5, 3], sparkle: 0.25, bright: 1600 },
  night: { root: 57, scale: 'minor', bpm: 110, progression: [0, 5, 2, 6], sparkle: 0.3, bright: 2600, pulse: true, wave: 'sawtooth' },
  cave: { root: 52, scale: 'phrygian', bpm: 56, progression: [0, 1, 0, 6], sparkle: 0.14, bright: 900, wave: 'sine' },
  candy: { root: 62, scale: 'lydian', bpm: 118, progression: [0, 4, 5, 3], sparkle: 0.5, bright: 2600, wave: 'triangle', pulse: true },
};
const D = Math.PI / 180;
// the reward, if the level has one: cosmetic only, named after the level, and credited to the level's creator
const REWARD_ID = DATA.id + '-r';
const REWARD = DATA.reward ? { name: DATA.reward.name, desc: DATA.reward.desc, slot: DATA.reward.slot, traits: ['cosmetic'], rarity: 'creator', look: DATA.reward.look, by: DATA.author.name, from: DATA.name } : null;
export default {
  id: DATA.id, name: DATA.name, kind: 'level', author: DATA.author.name, version: 1, blurb: DATA.blurb, color: DATA.color,
  spawn: { pos: [DATA.spawn[0], DATA.spawn[1] + 1, DATA.spawn[2]], yaw: DATA.spawn[3] },
  killY: DATA.killY, rules: { deny: ['board'] }, theme: THEMES[DATA.theme], music: MUSIC[DATA.theme], items: REWARD ? { [REWARD_ID]: REWARD } : {},
  build(w) {
    const S = DATA.spawn, G = DATA.goal, fx = Math.sin(S[3] * D), fz = Math.cos(S[3] * D);
    // the start: a platform, with the way home behind you
    w.box({ pos: [S[0] - fx * 4, S[1] - 0.3, S[2] - fz * 4], size: [7, 0.6, 12], yaw: S[3], color: '#3b3f63' });
    w.portal({ pos: [S[0] - fx * 8, S[1], S[2] - fz * 8], yaw: S[3], to: 'hub', label: 'Junction', arrive: 8 });
    for (const p of DATA.parts) {
      const o = { pos: p.p, yaw: p.y, color: p.c, glow: p.g, metal: p.m, opacity: p.o, collide: p.n ? false : undefined, shadow: p.n ? false : undefined };
      if (p.s === 'box') w.box(Object.assign(o, { size: p.z }));
      else if (p.s === 'ramp') w.ramp(Object.assign(o, { size: p.z }));
      else if (p.s === 'cyl') w.cylinder(Object.assign(o, { radius: p.z[0] / 2, height: p.z[1] }));
      else if (p.s === 'sphere') w.sphere(Object.assign(o, { radius: p.z[0] / 2 }));
      else if (p.s === 'cone') w.cone(Object.assign(o, { radius: p.z[0] / 2, height: p.z[1] }));
      else if (p.s === 'mesh') { // a model: seen by its hash, solid only through the hull it carries as data
        w.mesh({ hash: p.h, pos: p.p, yaw: p.y, size: p.k, color: p.c });
        if (p.hull) w.hull({ points: p.hull, pos: p.p, yaw: p.y, scale: p.k });
      }
      else w.model({ pos: p.p, yaw: p.y, parts: [{ s: p.s, r: p.z[0] / 2, tube: p.z[1] / 2, color: p.c, glow: p.g, metal: p.m }] });
    }
    for (const t of DATA.things) {
      if (t.t === 'pad') w.jumpPad({ pos: t.p, power: t.power, push: t.push ? [t.push[0], 0, t.push[1]] : undefined });
      else if (t.t === 'boost') w.boostPad({ pos: t.p, yaw: t.y });
      else if (t.t === 'checkpoint') w.checkpoint({ pos: t.p, yaw: t.y });
      else if (t.t === 'crumble') w.crumble(w.box({ pos: t.p, size: t.z, color: t.c }), {});
      else if (t.t === 'mover') w.mover(w.box({ pos: t.p, size: t.z, color: t.c, glow: 0.3 }), { path: [t.p, t.to], speed: t.speed });
      else if (t.t === 'hazard') { w.hazard({ pos: t.p, size: t.z }); w.box({ pos: t.p, size: t.z, color: '#ff3b5c', glow: 1.2, opacity: 0.5, collide: false, shadow: false }); }
      else if (t.t === 'wind') { w.wind({ pos: t.p, size: t.z, force: t.f }); w.particles({ pos: [t.p[0], t.p[1] - t.z[1] / 2, t.p[2]], area: t.z, count: 24, color: '#ffffff', size: 0.1, kind: 'rise', speed: 1.5 }); }
      else if (t.t === 'sign') w.sign({ pos: t.p, yaw: t.y, title: t.title, text: t.text, width: 3 });
      else if (t.t === 'label') w.label({ pos: t.p, text: t.text, size: 0.5 });
    }
    // the goal flag; the clock starts when you leave the start
    w.cylinder({ pos: [G[0], G[1] + 2, G[2]], radius: 0.08, height: 4, color: '#e8ecff', metal: 0.5 });
    w.box({ pos: [G[0] + 0.62, G[1] + 3.5, G[2]], size: [1.2, 0.8, 0.06], color: '#ffd166', glow: 1.2, collide: false });
    w.cylinder({ pos: [G[0], G[1] + 0.05, G[2]], radius: 1.6, height: 0.1, color: '#ffd166', glow: 1.4, collide: false, shadow: false });
    let started = false, done = false;
    const near = (p, r) => Math.hypot(p[0] - S[0], p[2] - S[2]) < r && Math.abs(p[1] - 1 - S[1]) < 2;
    w.on('enter', () => w.objective('Reach the golden flag. The clock starts when you leave the start.'));
    w.on('tick', () => {
      const p = w.player.pos;
      if (!started && !done && !near(p, 2.5)) { started = true; w.timer.start(); }
      if (done && near(p, 1.5)) { done = false; started = false; w.timer.cancel(); w.objective('Again! The clock starts when you leave the start.'); }
    });
    w.zone({ pos: [G[0], G[1] + 1.2, G[2]], radius: 2, onEnter: () => {
      if (done || !started) return;
      done = true;
      const t = w.timer.stop();
      w.record('time', t);
      const best = w.store.get('best', null);
      if (best == null || t < best) w.store.set('best', t);
      w.store.set('cleared', true);
      if (REWARD && !w.has(REWARD_ID)) w.give(REWARD_ID);
      w.sound('win');
      w.burst([G[0], G[1] + 3, G[2]], { color: ['#ffd166', '#ffffff', '#7cf6ff'], count: 90, speed: 10, life: 1.4 });
      w.banner('CLEARED', w.fmtTime(t) + (best == null || t < best ? ' · your best' : ' · best ' + w.fmtTime(best)));
      w.objective('Cleared! Walk back to the start to try again, or take the portal home.');
    } });
  },
};
