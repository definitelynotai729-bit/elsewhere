// Test world (not published): named arrivals. A portal that sends you to "dock", a zone whose w.travel sends you to
// "top", a zone that names no arrival that exists. tools/arrival_test.mjs plays the chain of visits and checks the
// ledger's rule: a run may begin at a named arrival only where its player's last run travelled.
export default {
  id: 'arrivetest', name: 'Arrival Test', author: 'tests', version: 1, blurb: 'Named arrivals.',
  spawn: { pos: [0, 1, 0], yaw: 180 }, killY: -20, rules: {},
  arrivals: { dock: { pos: [12, 1, -20], yaw: 90 }, top: { pos: [-10, 5.6, -20], yaw: 0 } },
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [60, 1, 60], color: '#556' });
    w.box({ pos: [-10, 4, -20], size: [4, 1, 4], color: '#a86' }); // "top"
    w.portal({ pos: [0, 0, -8], to: 'arrivetest', arrival: 'dock', label: 'To the dock' });
    w.zone({ pos: [-6, 1, -8], radius: 1.2, onEnter: () => w.travel('arrivetest', { arrival: 'top' }) });
    w.zone({ pos: [8, 1, 4], radius: 1.2, onEnter: () => w.travel('arrivetest', { arrival: 'Not A Name!' }) });
    w.scene.userData.arrive = { from: w.from, arrival: w.arrival };
  },
};
