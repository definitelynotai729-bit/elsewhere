// Test-only player for the sample level Lantern Steps: it holds the stick toward a list of waypoints and taps
// jump at the stone edges. Input only, so its clear run is recorded and replayable like a person's.
(() => {
  const P = EW.player, I = EW.input;
  const W = [{ x: 0, z: -20 }, { x: 0, z: -27.5 }, { x: 0, z: -29.2 }, { x: 0, z: -40 },
    { x: 0, z: -49.5, j: -45.4 }, { x: 1.2, z: -53.5, j: -50.3 }, { x: -1.2, z: -57.5, j: -54.3 }, { x: 0, z: -61.5, j: -58.3 }, { x: 0, z: -70, j: -62.3 }];
  const B = window.LVBOT = { on: true, i: 0, jumped: -1 };
  let hold = 0;
  const loop = () => {
    if (!B.on || B.i >= W.length) { I.stick.x = I.stick.y = 0; I.jumpHeld = false; return; }
    requestAnimationFrame(loop);
    const t = W[B.i], p = P.pos;
    const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz);
    let a = Math.atan2(dx, dz) - EW.camRig.yaw; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
    I.stick.x = -Math.sin(a); I.stick.y = Math.cos(a);
    if (t.j != null && B.jumped !== B.i && P.grounded && p.z < t.j) { I.edges.add('jump'); hold = 14; B.jumped = B.i; }
    I.jumpHeld = hold-- > 0;
    if (d < 0.8 && P.grounded) B.i++;
  };
  requestAnimationFrame(loop);
  return 'level bot on';
})()
