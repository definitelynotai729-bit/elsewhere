// Test world (not published): characters that walk (w.npc walks: true), zones that switch and move, a wind that
// changes. tools/walk_test.mjs plays it headlessly and replays the result: the walkers must move the same way.
export default {
  id: 'walktest', name: 'Walk Test', author: 'tests', version: 1, blurb: 'Walking characters and switchable zones.',
  spawn: { pos: [0, 1, 0], yaw: 180 }, killY: -20, rules: {},
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [80, 1, 80], color: '#556' });
    // a patrol: a loop round a square, pausing at each corner
    const wanda = w.npc({ pos: [4, 0, -5], name: 'Wanda', walks: true });
    wanda.walk([[4, 0, -12], [-4, 0, -12], [-4, 0, -5], [4, 0, -5]], { loop: true, pause: 0.5 });
    w.after(3, () => wanda.hide()); w.after(4, () => wanda.show());
    // a follower, once talked to; at the far zone it stops, walks to a spot (awaited), and the arrival is recorded
    const fol = w.npc({ pos: [6, 0, 0], name: 'Fol', walks: true, onTalk: async () => { await w.say('Fol', 'Lead on.'); fol.follow({ distance: 2 }); w.store.set('following', w.ticks); } });
    w.zone({ pos: [0, 1, 24], radius: 3, onEnter: async () => {
      if (!w.store.get('following', null)) return;
      fol.stop();
      await fol.walkTo([0, 0, 28], { speed: 3 });
      w.store.set('arrived', w.ticks); w.addCoins(1);
    } });
    // a zone that is off for 2 s, then on, then moves
    const gate = w.zone({ pos: [10, 1, 0], radius: 1.5, onEnter: () => w.store.set('gate', (w.store.get('gate', 0) || 0) + 1) });
    gate.setEnabled(false); w.after(2, () => gate.setEnabled(true)); w.after(6, () => gate.setPos([14, 1, 0]));
    // a gust that turns round every two seconds
    const gust = w.wind({ pos: [-12, 1, 0], size: [5, 3, 5], force: [6, 0, 0] });
    w.on('tick', () => { if (w.ticks % 120 === 0) gust.setForce([(w.ticks / 120) % 2 ? -6 : 6, 0, 0]); });
    // a waypoint with its own wait (2.5 s at one end, none at the other); talking to Pip stops Pip for the whole talk
    const pip = w.npc({ pos: [-20, 0, 10], name: 'Pip', walks: true, onTalk: async () => { await w.say('Pip', 'Hi!'); await w.wait(1.5); w.store.set('pipTalked', w.ticks); } });
    pip.walk([[-20, 0, 16], [-20, 0, 10, 2.5]], { loop: true, speed: 2 });
    // a talk that walks: "Follow me", the walk (awaited), and the talk goes on where it ends
    const guide = w.npc({ pos: [-28, 0, -4], name: 'Guide', walks: true, onTalk: async () => {
      await w.say('Guide', 'Follow me.'); await guide.walkTo([-28, 0, -10]); await w.say('Guide', 'Here we are.'); w.store.set('guided', w.ticks);
    } });
    w.scene.userData.walk = { wanda, fol, pip, guide };
  },
};
