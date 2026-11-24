// Test world (not published): artifacts' powers, item families and world switches. tools/power_test.mjs plays it
// headlessly and replays the result: rewinds, shields, finders and forms must come out the same.
const glassLook = [{ s: 'cyl', r: 0.12, h: 0.3, color: '#cfeeff' }];
export default {
  id: 'powertest', name: 'Power Test', author: 'tests', version: 1, blurb: 'Artifacts, families and switches.',
  spawn: { pos: [0, 1, 0], yaw: 180 }, killY: -20, rules: {},
  items: {
    'pt-glass': { name: 'Test Glass', slot: 'charm', family: 'magic', traits: ['rewind'], power: { kind: 'rewind', seconds: 60, cooldown: 20 }, look: glassLook },
    'pt-bubble': { name: 'Test Bubble', slot: 'charm', family: 'machine', traits: ['shield'], power: { kind: 'shield', seconds: 6, cooldown: 25 }, look: glassLook },
    'pt-seeker': { name: 'Test Seeker', slot: 'charm', family: 'machine', traits: ['finder'], power: { kind: 'finder', seconds: 6, cooldown: 8 }, look: glassLook },
    'pt-mask': { name: 'Test Mask', slot: 'charm', family: 'magic', traits: ['transform'], power: { kind: 'transform', seconds: 20, cooldown: 30, form: { name: 'a test stag', speed: 1.5, jump: 1.3, look: glassLook } }, look: glassLook },
    'pt-wild': { name: 'Test Wild', slot: 'charm', traits: ['transform'], power: { kind: 'transform', seconds: 999, cooldown: 0, form: { speed: 9, jump: 9 } }, look: glassLook }, // limits clamp it
    'pt-boots': { name: 'Test Boots', slot: 'feet', family: 'machine', traits: ['doublejump'], look: glassLook },
    'pt-blade': { name: 'Test Blade', slot: 'hand', traits: ['blade'], look: glassLook },
    'pt-hat': { name: 'Test Hat', slot: 'head', traits: ['cosmetic'], look: glassLook },
    'pt-key': { name: 'Test Key', slot: null, traits: ['key'], look: glassLook },
  },
  build(w) {
    w.box({ pos: [0, -0.5, 0], size: [80, 1, 80], color: '#556' });
    // things to find: a key lies nearest (a finder never points at keys), then a coin, a gem, and a hat
    w.pickup({ pos: [-3, 1.4, -6], item: 'pt-key' });
    w.coin({ id: 'near', pos: [8, 1, -14] });
    w.coin({ id: 'gem', pos: [-16, 1, 6], kind: 'gem' });
    w.pickup({ pos: [26, 1.4, 26], item: 'pt-hat' });
    // a ledge to fall from (its pad puts you on top)
    w.box({ pos: [30, 2.5, 0], size: [6, 5, 6], color: '#778' });
    w.zone({ pos: [22, 1, 0], radius: 1.2, onEnter: () => w.player.setPos([30, 6, 0], 90) });
    // a slime to bump into the shield (it stays near home)
    w.enemy({ kind: 'slime', id: 'sl', pos: [-20, 0.1, -20], leash: 4, sight: 7 });
    w.on('blocked', () => w.store.set('blocked', (w.store.get('blocked', 0) || 0) + 1));
    w.on('hurt', () => w.store.set('hurt', (w.store.get('hurt', 0) || 0) + 1));
    w.on('power', (k) => w.store.set('powers', (w.store.get('powers', '') || '') + k[0]));
    // a record, set on entering this zone: refused once a power was used on the visit
    w.zone({ pos: [12, 1, 12], radius: 1.2, onEnter: () => w.store.set('rec', w.record('t', w.time)) });
    // a temple without magic, and a hall without machines (switches for a while, from zones)
    w.zone({ pos: [-12, 1, 20], radius: 3, onEnter: () => w.setRules({ magic: false }), onExit: () => w.setRules({ magic: null }) });
    w.zone({ pos: [12, 1, 20], radius: 3, onEnter: () => w.setRules({ machines: false }), onExit: () => w.setRules({ machines: null }) });
    // a peace garden (no fighting) and an artifact-free room
    w.zone({ pos: [0, 1, 30], radius: 3, onEnter: () => w.setRules({ fighting: false }), onExit: () => w.setRules({ fighting: null }) });
    w.zone({ pos: [-24, 1, 30], radius: 3, onEnter: () => w.setRules({ powers: false }), onExit: () => w.setRules({ powers: null }) });
    w.on('tick', () => { if (w.input.attack) w.store.set('attacks', (w.store.get('attacks', 0) || 0) + 1); });
    w.on('nofight', () => w.store.set('nofight', (w.store.get('nofight', 0) || 0) + 1));
  },
};
