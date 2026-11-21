// Neon Circuit (physics probe, temporary)
export default {
  id: 'circuit',
  name: 'Neon Circuit',
  author: 'elsewhere',
  version: 1,
  blurb: 'Race the neon loop.',
  color: '#ff4fd8',
  spawn: { pos: [0, 1.5, 0], yaw: 0 },
  killY: -30,
  rules: { deny: ['glide', 'doublejump'] },
  theme: { skyTop: '#03010a', skyHorizon: '#c2187a', skyBottom: '#12031f', stars: 0.9, bloom: 0.9, fog: [160, 820], fogColor: '#2a0838' },
  music: { root: 57, scale: 'minor', bpm: 110, pulse: true },
  items: {
    hoverboard: { name: 'Hoverboard', slot: 'board', traits: ['board'], rarity: 'rare', desc: 'test', look: [{ s: 'rbox', size: [0.7, 0.08, 1.6], color: '#1b1030' }] },
    'sigil-speed': { name: 'Sigil of Speed', slot: null, traits: ['key'], rarity: 'legendary', desc: 'test', look: [{ s: 'oct', r: 0.32, color: '#ff4fd8', glow: 2.4 }] },
  },
  build(w) {
    // lane A (x=0): one huge box. lane B (x=40): 3 m boxes, thickness 1. lane C (x=80): 20 m boxes thick 1.
    // lane D (x=120): 3 m boxes thickness 0.3. lane E (x=160): 3m boxes overlapping 0.5 m. lane F (x=200): cylinder floor
    w.box({ pos: [0, -0.5, 0], size: [20, 1, 1000], color: '#2a2040' });
    for (let z = -500; z < 500; z += 3) w.box({ pos: [40, -0.5, z + 1.5], size: [12, 1, 3], color: '#403050' });
    for (let z = -500; z < 500; z += 20) w.box({ pos: [80, -0.5, z + 10], size: [12, 1, 20], color: '#304050' });
    for (let z = -500; z < 500; z += 3) w.box({ pos: [120, -0.15, z + 1.5], size: [12, 0.3, 3], color: '#503040' });
    for (let z = -500; z < 500; z += 3) w.box({ pos: [160, -0.5, z + 1.5], size: [12, 1, 4], color: '#305040' });
    w.box({ pos: [200, -0.5, 0], size: [12, 1, 1000], rot: [0, 0, 0], color: '#205020' });
    w.box({ pos: [240, -5, 0], size: [12, 10, 1000], color: '#202050' });
  },
};
