// Test-only player for Crystal Rush. It only steers the on-screen stick and presses jump, so its rounds are
// recorded and replayable like a human's. Routes: ground crystals directly; decks by their ramps; shuttle
// crystals by riding the shuttle from a deck; the tower and the ring by a jump pad, then hops off the top.
(() => {
  const RD = EW.world.group.userData.rush, P = EW.player, I = EW.input, W = EW.world;
  const B = window.RUSHBOT = { on: true };
  const pads = [[0, 6], [0, -6], [6, 0], [-6, 0]];
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2;
  const shuttles = () => W.movers.map((m) => [m.cur.x, m.cur.y, m.cur.z]);
  let jumpHold = 0, stuckT = 0, lastPos = null;
  const plan = (t, p) => {
    if (t[1] < 3) return t;
    if (t[1] < 7.5) {
      const sz = Math.sign(t[2]) || 1, sx = Math.abs(t[0]) < 4 ? (Math.sign(p[0]) || 1) : Math.sign(t[0]);
      if (p[1] < 5.0) { // not up on a deck yet (standing on one puts your centre at 5.4)
        const bottom = [14 * sx, 0, 0.6 * sz];
        const onRamp = Math.abs(p[0] - 14 * sx) < 1.8 && Math.sign(p[2]) === sz && (Math.abs(p[2]) > 0.4 || p[1] > 1.2);
        return onRamp || d2(p, bottom) < 1 ? [14 * sx, 4.5, 11 * sz] : bottom; // up the middle of the ramp
      }
      if (Math.abs(t[0]) < 4) { // a shuttle crystal: get on the shuttle when it is at our deck, then stay on it
        const sh = shuttles().find((s) => Math.sign(s[2]) === sz) || [10 * sx, 4.5, 14 * sz];
        if (Math.abs(p[0]) < 10.2 && p[1] > 5) return [sh[0], sh[1], sh[2]];
        return Math.abs(sh[0] - 10 * sx) < 1.6 ? [sh[0], sh[1], sh[2]] : [10.8 * sx, 4.5, 14 * sz];
      }
      return t;
    }
    if (p[1] < 7) { let best = pads[0]; for (const q of pads) if (d2(p, [q[0], 0, q[1]]) < d2(p, [best[0], 0, best[1]])) best = q; return [best[0], 0, best[1]]; }
    return t;
  };
  const loop = () => {
    if (!B.on) { I.stick.x = I.stick.y = 0; I.jumpHeld = false; return; }
    requestAnimationFrame(loop);
    if (RD.state !== 'running') { I.stick.x = 0; I.stick.y = RD.state === 'idle' ? 1 : 0; return; } // onto the start pad
    const p = [P.pos.x, P.pos.y, P.pos.z];
    const cost = (c) => Math.sqrt(d2(p, c)) + (c[1] > 7.5 ? 12 : c[1] > 3 ? (Math.abs(c[0]) < 4 ? 14 : 6) : 0) - (p[1] > 7.5 && c[1] > 7.5 ? 12 : 0);
    const act = RD.active.slice().sort((a, b) => cost(a) - cost(b));
    if (!act.length) return;
    const goal = plan(act[0], p);
    const dx = goal[0] - p[0], dz = goal[2] - p[2], dist = Math.hypot(dx, dz);
    let a = Math.atan2(dx, dz) - EW.camRig.yaw; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
    const riding = Math.abs(act[0][0]) < 4 && act[0][1] > 3 && act[0][1] < 7.5 && Math.abs(p[0]) < 10.2 && p[1] > 5;
    const m = dist < (riding ? 0.6 : 0.3) ? 0 : 1;
    I.stick.x = -Math.sin(a) * m; I.stick.y = Math.cos(a) * m;
    const onTower = p[1] > 8.4 && Math.hypot(p[0], p[2]) < 3.4;
    if (lastPos) stuckT = Math.hypot(p[0] - lastPos[0], p[2] - lastPos[2]) < 0.02 && m ? stuckT + 1 : 0;
    lastPos = p;
    const hop = (onTower && Math.hypot(p[0], p[2]) > 2.5 && dist > 2) || (p[1] > 7.5 && !onTower && dist > 1.5 && Math.random() < 0.02) || stuckT > 20 || (act[0][1] > 10.5 && Math.hypot(p[0] - act[0][0], p[2] - act[0][2]) < 1);
    if (hop && P.grounded) { I.edges.add('jump'); jumpHold = 20; stuckT = 0; }
    I.jumpHeld = jumpHold-- > 0;
  };
  requestAnimationFrame(loop);
  return 'rush bot on';
})()
