// The deterministic core. Everything that changes the game state goes through here, the same way in
// live play and in a replay, so a recorded run can be re-simulated by anyone and checked bit for bit.
//
// A run is one visit to one world. It starts from a snapshot of the player's state (coins, items,
// flags, that world's save), then advances one fixed tick at a time. Each tick consumes one input frame
// (quantised keys/stick/camera yaw) and, at its end, any recorded actions: a dialog closing with an
// answer, a purchase, an equip, a message from an arcade game. Outputs are recorded as claims.
//
// The engine object `E` supplies presentation (ui, audio, fx, camRig, net, render); a replay gives it
// silent stand-ins. Nothing here reads the wall clock, the DOM or Math.random.
import { WorldRuntime } from './world.js';
import { SLOTS } from './items.js';

export const DT = 1 / 60;

export function freshSim(replaying) {
  return {
    tick: 0,            // ticks completed in this world
    busy: 0,            // world dialogs open (interaction is off while > 0)
    gates: [],          // dialog k -> { kind, n, resolve, done }
    nextGate: 0,
    pending: [],        // live: actions waiting for the end of the next tick
    script: null,       // replay: Map tick -> [actions]
    shop: null,         // the last listing a world offered
    flush: false,       // world code went async this tick
    ended: null,        // { tick, to } once the run has left the world
    claims: [],         // [tick, type, ...]
    replaying: !!replaying,
  };
}

export function installCore(E) {
  E.claim = (type, ...args) => { if (E.sim) E.sim.claims.push([E.sim.tick, type, ...args]); };

  // ---- state operations (all deterministic; presentation hooks are no-ops in a replay) ----
  E.giveItem = (id, opts = {}) => {
    const def = E.items.get(id);
    if (!def) return false;
    const d = E.profile.data;
    const first = !d.inv[id];
    d.inv[id] = (d.inv[id] || 0) + 1;
    if (def.slot && !d.eq[def.slot]) d.eq[def.slot] = id;
    E.claim('give', id);
    E.profile.save(); E.refreshEquipment(); E.net.announce();
    if (!opts.silent) {
      E.audio.play('pickup');
      E.ui.banner(def.name, def.desc);
      E.toast(first ? `New item: ${def.name}${def.slot && d.eq[def.slot] === id ? ' (equipped)' : ''}. Press I to see your items.` : `+1 ${def.name}`, 'item');
    }
    return true;
  };
  E.takeItem = (id) => {
    const d = E.profile.data;
    if (!d.inv[id]) return false;
    d.inv[id]--;
    if (!d.inv[id]) { delete d.inv[id]; for (const s in d.eq) if (d.eq[s] === id) d.eq[s] = null; }
    E.claim('take', id);
    E.refreshEquipment(); E.profile.save();
    return true;
  };
  E.equip = (id, slot) => {
    const d = E.profile.data;
    if (id) { const def = E.items.get(id); if (!def || !def.slot || !d.inv[id]) return; d.eq[def.slot] = id; E.claim('equip', def.slot, id); }
    else if (slot && SLOTS.includes(slot)) { d.eq[slot] = null; E.claim('equip', slot, null); }
    else return;
    E.profile.save(); E.refreshEquipment(); E.net.announce(); E.audio.play('click');
  };
  E.refreshEquipment = () => {
    const d = E.profile.data;
    for (const s of SLOTS) E.player.avatar.equip(s, d.eq[s] && E.items.get(d.eq[s]) ? d.eq[s] : null);
    E.player.updateAbilities(E.world ? E.world.rules : {}, d.eq);
    E.ui.refreshHud();
  };
  E.addCoins = (n) => {
    n = Math.trunc(n);
    if (!n) return;
    E.profile.data.coins = Math.max(0, E.profile.data.coins + n);
    E.claim('coins', n);
    E.profile.save(); E.ui.refreshHud(); E.ui.coinPop && E.ui.coinPop();
  };
  E.setFlag = (k, v) => {
    v = v === undefined ? null : JSON.parse(JSON.stringify(v));
    E.profile.data.flags[k] = v;
    E.claim('flag', String(k), typeof v === 'object' && v !== null ? true : v);
    E.profile.save(); E.ui.refreshHud();
  };
  E.onRespawn = () => { E.ui.flash(); E.camRig.snap(E.player); if (E.world) E.world.emit('respawn'); };

  // Leaving the world ends the run at this tick. Live play travels once the tick is complete; a replay stops.
  E.requestTravel = (to) => {
    const sim = E.sim;
    if (!sim || sim.ended || !E.registry.worlds.some((w) => w.id === to)) return;
    sim.ended = { tick: sim.tick, to };
    E.claim('travel', to);
  };

  // The world's 'leave' handlers belong to the run: they run once, after the run's last tick and any
  // continuation of it, before the final state is taken (live in E.travel, in a replay after the last tick).
  E.leaveWorld = () => { const sim = E.sim; if (!sim || sim.left || !E.world) return; sim.left = true; E.world.left = true; E.world.emit('leave'); };

  // ---- dialogs as recorded inputs ----
  // A world awaits w.say / w.ask. Live, the real dialog opens; its answer is applied at the end of the next
  // tick and recorded. A replay never opens anything: the recorded answer arrives at the recorded tick.
  E.gate = (kind, open, n) => {
    const sim = E.sim, k = sim.nextGate++;
    sim.busy++;
    return new Promise((resolve) => {
      sim.gates[k] = { kind, n: n || 0, resolve, done: false };
      if (!sim.replaying) Promise.resolve(open()).then((v) => { if (E.sim === sim) sim.pending.push(['ui', k, kind === 'ask' ? v : null]); });
    });
  };
  // UI actions that change state (equip, buy, cabinet results, the first-visit event, travel from the map)
  E.queueAction = (a) => { if (E.sim && !E.sim.replaying && !E.sim.ended) E.sim.pending.push(a); };

  function applyAction(a) {
    const sim = E.sim, rt = E.world, d = E.profile.data;
    switch (a[0]) {
      case 'ui': {
        const g = sim.gates[a[1]];
        if (!g || g.done) return;
        g.done = true; sim.busy = Math.max(0, sim.busy - 1);
        if (g.kind === 'ask') { const v = a[2]; g.resolve(Number.isInteger(v) && v >= -1 && v < g.n ? v : -1); } else g.resolve();
        return;
      }
      case 'equip': { // [equip, itemId | null, slot]
        if (a[1]) { if (typeof a[1] === 'string' && d.inv[a[1]]) E.equip(a[1]); } else if (SLOTS.includes(a[2])) E.equip(null, a[2]);
        E.ui.refreshPanel && E.ui.refreshPanel();
        return;
      }
      case 'buy': { // [buy, itemId]: only from the listing the world opened, at its price
        const l = sim.shop && sim.shop.listing.find((x) => x.item === a[1]);
        if (!l || !E.items.get(l.item) || d.inv[l.item] || d.coins < l.price) return;
        E.addCoins(-l.price); E.giveItem(l.item);
        E.ui.refreshPanel && E.ui.refreshPanel();
        return;
      }
      case 'cab': { // [cab, k, data]: a result posted by the game inside an arcade cabinet
        const h = rt.cabinets[a[1]];
        if (typeof h === 'function') rt.call(h, a[2]);
        return;
      }
      case 'event': if (a[1] === 'firstVisit') rt.emit('firstVisit'); return;
      case 'travel': E.requestTravel(a[1]); return;
      default: return;
    }
  }

  // ---- interaction (the "E" key) ----
  function interact(use) {
    const rt = E.world, p = E.player.pos, sim = E.sim;
    let best = null, bd = 1e9;
    if (sim.busy === 0) for (const it of rt.interactables) {
      if (!it.enabled) continue;
      const dx = it.pos.x - p.x, dz = it.pos.z - p.z, dy = (it.pos.y - p.y) * 0.5;
      const dd = dx * dx + dz * dz + dy * dy;
      if (dd < it.radius * it.radius && dd < bd) { bd = dd; best = it; }
    }
    if (best !== E.near) { E.near = best; E.ui.prompt(best ? best.label : null); }
    if (use && best) { E.ui.prompt(null); E.near = null; rt.call(best.onUse); }
  }

  // ---- one fixed tick. Returns true when world code went async: run its continuations before the next tick ----
  E.tick = (f) => {
    const rt = E.world, sim = E.sim, t = sim.tick;
    sim.flush = false;
    if (E.rec) E.rec.push(f);
    try {
      interact(f.use);
      rt.preTick(DT);
      E.player.tick(DT, f);
      rt.P.step();
      rt.postTick(DT);
      // actions due at the end of this tick
      let list;
      if (sim.replaying) list = (sim.script && sim.script.get(t)) || [];
      else { list = sim.pending; sim.pending = []; if (E.rec) for (const a of list) E.rec.event(t, a); }
      for (const a of list) { if (sim.ended) break; applyAction(a); }
      if (list.length) sim.flush = true;
    } finally { sim.tick = t + 1; }
    return sim.flush;
  };

  // ---- entering a world: identical in live play and in a replay ----
  E.enterWorld = async (entry, mod, from, opts = {}) => {
    const save = E.profile.world(entry.id);
    const rt = new WorldRuntime(E, entry, mod);
    E.world = rt;
    E.sim = freshSim(opts.replaying);
    E.near = null;
    const pl = E.player;
    pl.resetSim();
    if (pl.avatar.slots.board) pl.avatar.slots.board.visible = false;
    const def = rt.spawnFor(null);
    pl.attach(rt.P, def.pos, def.yaw);
    let err = null;
    try { await rt.build(); } catch (e) { err = e; }
    const sp = rt.spawnFor(from || null);
    pl.place(sp.pos, sp.yaw);
    pl.checkpoint.pos.copy(sp.pos); pl.checkpoint.yaw = sp.yaw;
    E.refreshEquipment();
    save.visits = (save.visits || 0) + 1; save.coinTotal = rt.coins.length; E.profile.save();
    rt.emit('enter', from || null);
    return { rt, sp, err };
  };
}
