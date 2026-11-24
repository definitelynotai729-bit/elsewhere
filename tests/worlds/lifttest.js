// Test world (not published): platforms that move up, down and sideways must carry their rider and let them step off
// at either end. tools/lift_test.mjs rides them headlessly.
export default {
  id: 'lifttest', name: 'Lift Test', author: 'tests', version: 1, blurb: 'Moving platforms carry their riders.',
  spawn: { pos: [0, 1, 0], yaw: 180 }, killY: -20, rules: {},
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [40, 1, 40], color: '#556' });
    // a lift from the floor to a ledge 12 m up (east of it, a landing at the top)
    const lift = w.box({ pos: [0, -0.2, -6], size: [2.4, 0.4, 2.4], color: '#a86' });
    w.mover(lift, { path: [[0, -0.2, -6], [0, 11.8, -6]], speed: 4, pause: 2.5 });
    w.box({ pos: [4.2, 6, -6], size: [6, 12, 4], color: '#778' });          // the landing's tower: top at y 12
    // a sideways ferry between two docks at its deck's height (a ramp up to the first)
    w.ramp({ pos: [-6, 0.5, -1.6], size: [2.4, 1, 4], color: '#667' });
    w.box({ pos: [-6, 0.5, 1.6], size: [2.4, 1, 2.4], color: '#667' });
    w.box({ pos: [-6, 0.5, 16], size: [2.4, 1, 2.4], color: '#667' });
    const ferry = w.box({ pos: [-6, 0.75, 4], size: [2, 0.5, 2], color: '#8a6' });
    w.mover(ferry, { path: [[-6, 0.75, 4], [-6, 0.75, 13.6]], speed: 2, pause: 2 });
    w.scene.userData.lift = { lift: lift.mesh, ferry: ferry.mesh };
  },
};
