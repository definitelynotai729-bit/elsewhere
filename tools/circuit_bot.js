// Test-only autopilot for Neon Circuit. It only presses keys: binary W/S/A/D decisions every tick, written into
// the same input state the keyboard uses, so everything it does is recorded and replayable like a human run.
// From the paddock it walks forward (east) onto the grid, which starts the race.
(() => {
  const C = EW.world.group.userData.circuit, W = EW.world.w, P = EW.player, I = EW.input;
  const { SX, SZ, SY, SH, N, L } = C;
  const DS = L / N;
  const ang = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  const cfg = Object.assign({ look: 6, lookK: 0.33, dead: 0.03, brakeK: 2.3, line: 3 }, window.BOTCFG || {});
  let idx = 0;
  const near = (p) => { let b = idx, bd = 1e18; for (let j = idx - 30; j <= idx + 60; j++) { const i = (j + N) % N, dx = p.x - SX[i], dz = p.z - SZ[i], dy = (p.y - 0.9 - SY[i]) * 2; const d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; b = i; } } return [b, Math.sqrt(bd)]; };
  const glob = (p) => { let b = 0, bd = 1e18; for (let i = 0; i < N; i++) { const dx = p.x - SX[i], dz = p.z - SZ[i], dy = (p.y - 0.9 - SY[i]) * 2; const d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; b = i; } } return b; };
  idx = glob(P.pos);
  const B = window.BOT = { on: true, ticks: 0 };
  W.on('respawn', () => { idx = glob(P.pos); });
  const press = (mx, my) => { I.held.clear(); if (my > 0) I.held.add('f'); if (my < 0) I.held.add('b'); if (mx < 0) I.held.add('tl'); if (mx > 0) I.held.add('tr'); }; // W/S, and A/D steer the board
  W.on('tick', () => {
    if (!B.on) { press(0, 0); return; }
    B.ticks++;
    if (!P.board) { press(0, 1); return; } // walk onto the grid
    const p = P.pos, sp = Math.hypot(P.vel.x, P.vel.z);
    let [i, d] = near(p); if (d > 25) i = glob(p); idx = i;
    const la = cfg.look + sp * cfg.lookK, j = (i + Math.round(la / DS)) % N;
    const want = Math.atan2(SX[j] - p.x, SZ[j] - p.z), err = ang(P.heading, want);
    const mx = err > cfg.dead ? -1 : err < -cfg.dead ? 1 : 0;
    let kmax = 0; const span = Math.round((sp * 0.9 + 8) / DS);
    for (let k = 4; k < span; k += 2) { const a = (i + k) % N, b = (i + k + 4) % N; kmax = Math.max(kmax, Math.abs(ang(SH[a], SH[b])) / (4 * DS)); }
    const vmax = kmax > 0.001 ? cfg.brakeK * (1 / kmax + cfg.line) : 99;
    press(mx, P.boardSpeed > vmax + 1.5 ? -1 : 1);
  });
  return 'bot on';
})()
