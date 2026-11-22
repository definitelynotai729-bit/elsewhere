// Test-only player for Spire Clash in a browser: the same policy as tools/clash_sim.mjs, but through the real
// keyboard state (stick for movement, key presses for abilities), so its matches are recorded like a person's.
(() => {
  const C = EW.world.group.userData.clash, I = EW.input;
  const B = window.CLASHBOT = { on: true, casts: 0 };
  const press = (k) => { I.edges.add(k); B.casts++; };
  const loop = () => {
    if (!B.on) { I.stick.x = I.stick.y = 0; return; }
    requestAnimationFrame(loop);
    const pl = C.player, P = C.P, rv = C.rival;
    let tx = pl.x, tz = pl.z;
    if (C.state === 'live' && P.dead <= 0) {
      const frac = pl.hp / pl.max, rd = Math.hypot(rv.x - pl.x, rv.z - pl.z);
      const allies = C.units.filter((u) => u.alive && u.team === 0 && (u.kind === 'melee' || u.kind === 'ranged'));
      const front = allies.reduce((a, b) => (!a || b.z < a.z ? b : a), null);
      const redTowers = C.towers.filter((x) => x.alive && x.team === 1);
      if (P.recallT >= 0) { tx = pl.x; tz = pl.z; }
      else if (frac < 0.3) { if (rd > 9) press('board'); else { tx = 0; tz = 74; } }
      else if (C.gold >= C.nextCost && pl.z < 60 && rd > 12) press('board');
      else if (frac < 0.95 && pl.z > 68) { tx = 0; tz = 74; }
      else {
        tz = front ? front.z + 4 : (redTowers.length ? Math.max(pl.z, 30) : -50); tx = 1.5;
        for (const tw of redTowers) if (!front || front.z > tw.z + 9) tz = Math.max(tz, tw.z + 10);
        // while your minions are at a red tower, step up and hit it (they draw its fire)
        const siege = redTowers.find((tw) => allies.some((m) => Math.hypot(m.x - tw.x, m.z - tw.z) < tw.range + 2));
        if (siege && (!rv.alive || rd > 7 || frac > 0.6)) { tx = siege.x + 2.5; tz = siege.z + 5.5; }
        if (rv.alive && rd < 12 && P.qcd <= 0) press('sl');
        else if (P.qcd <= 0 && C.units.some((u) => u.alive && u.team === 1 && (u.kind === 'melee' || u.kind === 'ranged') && Math.hypot(u.x - pl.x, u.z - pl.z) < 9)) press('sl'); // clear the wave
        if (rv.alive && rd < 9 && frac < 0.6 && P.ecd <= 0) press('sr');
        if (rv.alive && rd < 10 && P.rcd <= 0 && pl.lvl >= 3) press('ab3');
        if (rv.alive && rd < 7 && frac < 0.4 && P.dcd <= 0) press('jump');
      }
    }
    const dx = tx - pl.x, dz = tz - pl.z, d = Math.hypot(dx, dz);
    if (C.state === 'live' && P.dead <= 0 && P.recallT < 0 && d > 18 && P.dcd <= 0) press('jump'); // dash on long walks
    I.stick.x = d > 0.6 ? dx / d : 0; I.stick.y = d > 0.6 ? -dz / d : 0;
  };
  requestAnimationFrame(loop);
  return 'clash bot on';
})()
