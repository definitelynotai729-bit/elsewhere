// Test world (not published): async world code must resume on the same tick live and in a replay.
// Every await is followed by a state change whose tick is part of the proof's claims.
export default {
  id: 'asynctest', name: 'Async Test', author: 'tests', version: 1, blurb: 'Determinism test for async world code.',
  spawn: { pos: [0, 1, 0], yaw: 0 }, killY: -20, rules: {},
  items: { 'test-token': { name: 'Test Token', slot: null, traits: ['key'], desc: 'test', look: [{ s: 'oct', r: 0.2, color: '#ff0' }] } },
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [60, 1, 60], color: '#556' });
    for (let i = 0; i < 12; i++) w.box({ pos: [-20 + i * 3.5, 0.4 + (i % 3) * 0.3, 8 + (i % 4)], size: [2, 0.8 + (i % 3) * 0.6, 2], yaw: i * 17, color: '#778' });
    w.ball({ pos: [2, 2, 6], radius: 0.7 });
    w.portal({ pos: [0, 0, -20], yaw: 0, to: 'hub' });
    // a chain of waits started on arrival
    w.on('enter', async () => {
      await w.wait(0.5); w.addCoins(1);
      await w.wait(0.25); w.setFlag('async.a', w.ticks);
      for (let i = 0; i < 3; i++) { await w.wait(0.1 * (i + 1)); w.store.set('step' + i, w.ticks); }
    });
    // a zone that starts its own chain every time you enter it
    w.zone({ pos: [0, 1, 5], size: [4, 3, 4], onEnter: async () => {
      w.store.set('zoneIn', w.ticks);
      await w.wait(0.3);
      w.player.launch(9);
      w.store.set('zoneLaunch', w.ticks);
    } });
    // an NPC: say, wait, ask, then act on the answer after another wait
    w.npc({ pos: [4, 0, 0], yaw: -90, name: 'Tess', onTalk: async () => {
      await w.say('Tess', ['Hello.', 'Wait for it.']);
      w.store.set('said', w.ticks);
      await w.wait(0.2);
      const k = await w.ask('Tess', 'Token?', ['Yes', 'No']);
      w.store.set('asked', [k, w.ticks]);
      await w.wait(0.15);
      if (k === 0) w.give('test-token'); else w.addCoins(2);
    } });
    // after() callbacks interleaved with ticks
    let n = 0;
    w.on('tick', () => { if (w.ticks % 45 === 0 && n < 6) { n++; w.after(0.2, () => w.store.set('after' + n, w.ticks)); } });
  },
};
