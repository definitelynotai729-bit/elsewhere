// The Last Summer of Bronze, chapter 3: Three Circuits (stories/bronze-age/chapters/03-three-circuits.md has every line).
// The Strait of Teeth at sunset. Kessa's Patient Cow sails in and is stopped by Talos, the bronze giant who walks his
// circuit round the strait: up the west side of his causeway, round the back of Watch Rock, down the east side and over
// the causeway's tip. On every step his right foot stamps one of the causeway's six footstones. The stranger hops the
// Teeth, crosses the causeway between his footfalls, climbs Watch Rock while its cracked steps drop to his stamps, and
// rings the Calling Bell the way the shepherds did: two slow, one quick. He comes to the rock, lets them pass, and asks
// the question he has carried for centuries: is his maker coming back?
//
// Story state is global flags under `lsb.` (chapter-3 progress under `lsb.s.`), carried into later chapters; the world's
// store keeps local things (the ship at anchor, tin-drops, the talk). Nothing here pays coins. The Low Wings are a loan,
// as in chapter 2: given on arrival, taken back on leaving.
// Talos's walk is a pure function of the tick count: his stamps, the scree and the cracked steps are gameplay, worked out
// in tick code; his body is drawn from the same schedule in frame code, so a replay never needs it.

const C = {
  sea: '#2a5d86', shallow: '#3d7f99', foam: '#f6efe2', rock: '#9a7a62', rock2: '#86684f', rock3: '#6f5643', moss: '#7d8b4c',
  block: '#c2a47c', block2: '#ab8d68', block3: '#927457', scree: '#b9a07c', crack: '#7a634e', inlay: '#d79a3e',
  bronze: '#c8903f', bronze2: '#94652b', bronze3: '#e3b064', patina: '#5fa88f', eye: '#ff8a2a', seam: '#ff3b1f', tin: '#e8eef5',
  wood: '#a0703f', wood2: '#6f4a2c', deck: '#c49a64', rope: '#cdb38a', sail: '#f2e6cc', stripe: '#c8503c', clay: '#c4703e',
  goat: '#f2ece0', goat2: '#5a4a3a', palace: '#b8402f', palace2: '#f2e2c4', ash: '#8a7f86', bell: '#c9933b',
};
const D = Math.PI / 180;
// ---------- the strait's layout (metres; north is -z; the sea at y 0) ----------
const CX = -36, CW = 5;                              // the causeway's centre line (x) and width; its top is at y 2
const TIP = -8, NEND = -91;                          // its south tip and north end (z)
const STONES = [-20, -32, -44, -56, -68, -80];       // the six footstones (z), 12 m apart
const SCREE = [-38.5, -62, -86];                     // three stretches of loose scree (centre z, 4 m long)
const NICHES = [-26, -50, -74];                      // alcoves on the east side, between footstones
const ROCK = [-36, -104], ROCK_R = 11, TOP = 30;     // Watch Rock: centre (x, z), radius, summit height
const BELL = [-36, TOP, -104];
const SHIP_Z = 160;                                  // the Patient Cow sails in from z 160 to its anchorage at the origin
const SHIP_V = 8;                                    // m/s: 20 s
const DECK = 1.5;
const LANDING = [-9.5, 2], LANDING_R = 4;            // the flat rock beside the anchorage (the portal home)
const MAST_Z = -1, YARD_Y = DECK + 9.6;
// ---------- Talos's circuit: steps of 4.8 s, three beats of 1.6 s each (the left foot lands in the water, the right foot
// stamps a footstone, a pause). PLAN: the footstone his right foot stamps at the start of each step (-1: none) ----------
const BEAT = 96, STEP = 288;
const PLAN = [0, 1, 2, 3, 4, 5, -1, -1, -1, -1, -1, 5, 4, 3, 2, 1, 0, -1];
const NSTEP = PLAN.length;                           // 86.4 s a circuit
const T0 = 2604;                                     // where a visit begins in his circuit (he comes round the rock as the ship sails in)
const PLANT = 204;                                   // a stamped foot stays down 3.4 s, then lifts for the next footstone
const WARN = 72;                                     // its shadow darkens over the 1.2 s before it lands
const DROP = 18, SCREE_DOWN = 240, CRACK_DOWN = 120; // scree within 10 m and cracked steps fall 0.3 s after a stamp, for 4 s and 2 s
const FOOT = [4.6, 3.2, 5.4];                        // the planted foot's block (x, y, z): the causeway is 5 wide, so nobody squeezes by
const stepOf = (t) => Math.floor((t + T0) / STEP);
const stoneOfStep = (s) => PLAN[((s % NSTEP) + NSTEP) % NSTEP];
const stampTick = (s) => s * STEP - T0;              // the tick a step's stamp lands
// the body's path: one keyframe per step (where his hips are as that step's stamp lands)
const KB = [];
for (let k = 0; k < 6; k++) KB.push([-42, STONES[k] + 4]);                  // the west side, northward
{ // round the back of Watch Rock (five steps, bowing out to clear it), from 12 m past the last west-side keyframe to the first east-side one
  const a0 = Math.atan2(-88 - ROCK[1], -42 - ROCK[0]), a1 = Math.atan2(-84 - ROCK[1], -30 - ROCK[0]) + 2 * Math.PI;
  const r0 = Math.hypot(-42 - ROCK[0], -88 - ROCK[1]), r1 = Math.hypot(-30 - ROCK[0], -84 - ROCK[1]);
  for (let i = 0; i < 5; i++) { const u = i / 5, a = a0 + (a1 - a0) * u, r = r0 + (r1 - r0) * u + 6 * Math.sin(u * Math.PI); KB.push([ROCK[0] + Math.cos(a) * r, ROCK[1] + Math.sin(a) * r]); }
}
for (let k = 5; k >= 0; k--) KB.push([-30, STONES[k] - 4]);                 // the east side, southward
KB.push([-30, -12]);                                                         // then over the causeway's south tip
const CODEX = {
  strait: ['The Strait of Teeth', 'The only deep channel into Kerynthos. The Teeth are the rocks; Talos is the jaw.'],
  cow: ['The Patient Cow', 'Broad-beamed, slow, unsinkable so far. Smells of oil, tin and goat.'],
  alashiya: ['Alashiya', 'Kessa\'s island, rich in copper. Its tin comes from the far west, beyond the edge of every map. Less of it every year.'],
  bell: ['The Calling Bell', 'The shepherds of the strait once called Talos like their dogs: two slow, one quick. He came every time. Nobody has rung it in sixty years.'],
  talos2: ['Talos (updated)', 'Made in bronze by a god\'s own hands for Crete, to walk its shores three times a day. Sea-raiders brought him down once, with a witch\'s help and a pulled nail. He did not quite die.'],
  ichor: ['Ichor', 'What runs in gods instead of blood. Talos has one vein of it, neck to heel, sealed with a nail. His old nail was bronze. His new one is tin. Tin is soft.'],
  argonauts: ['The Argonauts (retold)', 'In the old song the sea-raiders\' witch promised Talos he would never die, then pulled his nail. Here, Talos says she was right about the first part.'],
};
const LOOKS = {
  kessa: { style: 'round', face: 'big', mouth: 'none', outfit: 'tunic', extra: 'bandana', colors: { outfit: '#c86a43', trim: '#2f5f99' } },
  perdika: { style: 'little', face: 'big', mouth: 'grin', top: 'crest', outfit: 'apron', extra: 'belt', finish: 'satin', colors: { body: '#c98a5a', head: '#c98a5a', eyes: '#2a2230', outfit: '#3e8f8a', trim: '#f2d28a' } },
  ammi: { style: 'bean', face: 'sleepy', mouth: 'o', outfit: 'tunic', extra: 'scarf', colors: { body: '#d9b08a', head: '#d9b08a', eyes: '#2a2230', outfit: '#8fae5a', trim: '#e8e2d2' } },
};

export default {
  id: 'lsb-strait',
  name: 'Three Circuits',
  author: 'elsewhere',
  version: 1,
  listed: false, // a chapter: reached from the end of chapter two, or Junction's campaign portal once it is done
  blurb: 'The Last Summer of Bronze, chapter 3. A bronze giant guards the Strait of Teeth: cross his causeway between his footfalls and ring his bell.',
  color: '#d0913c',
  spawn: { pos: [-0.8, DECK + 1.2, SHIP_Z - 6.5], yaw: 180 }, // at the bow as the ship sails in, the sail behind you ('enter' sorts out the rest)
  killY: -12,
  rules: { deny: ['board'], machines: false }, // the Bronze Age: machines sleep (a Skyreach glider too: Perdika's wings glide)
  theme: { // sunset: a low gold sun in the west, violet cloud, strong rim light. Bronze should glow
    skyTop: '#33286a', skyHorizon: '#ffb26a', skyBottom: '#7a4f7e', skySharp: 0.5,
    sunDir: [-0.84, 0.2, -0.36], sunColor: '#ffcc78', sunSize: 3.2, sunLight: '#ffd6a0', sunIntensity: 2.7,
    hemiSky: '#c9a6dc', hemiGround: '#a9784c', hemiIntensity: 1.3,
    fog: [240, 1250], fogColor: '#e9a67c', stars: 0, bloom: 0.42, exposure: 1.0,
  },
  music: { root: 55, scale: 'phrygian', bpm: 66, progression: [0, 1, 0, 4], sparkle: 0.18, bright: 1500, wave: 'triangle', pulse: true },

  build(w) {
    const T = w.THREE;
    const flag = (k) => w.flag(k), store = w.store;
    const R = w.rand(33);
    const deco = { collide: false, shadow: false };
    const say = (who, lines) => w.say(who, [].concat(lines));
    const ask = async (who, q, opts, esc = 0) => { const i = await w.ask(who, q, opts); return i < 0 ? esc : i; };
    const codex = (id) => { if (flag('codex.lsb.' + id)) return; w.setFlag('codex.lsb.' + id, true); w.toast(`Codex: ${CODEX[id][0]}`, 'item'); };
    // a collider-only part switched on or off (a handle's show() would also draw it)
    const solidOnly = (b, on) => { if (on) { b.show(); b.mesh.visible = false; } else b.hide(); };
    const bx = (x0, x1, y0, y1, z0, z1, color, o = {}) => w.box(Object.assign({ pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], size: [x1 - x0, y1 - y0, z1 - z0], color }, o));
    const lit = flag('lsb.beacon') !== 'dark';
    const ready = () => (flag('lsb.ch') || 0) >= 2;     // the chapter follows The Low Wings
    const done = () => (flag('lsb.ch') || 0) >= 3;
    const talked = () => !!store.get('talked', false) || !!flag('lsb.talos');
    // the visit's state (see the test hook at the end)
    const P = { briefing: false, ride: false, anchored: !!store.get('anchored', false) || !ready(), where: null, talos: null, stamps: 0, rings: [], hintT: -1e9, deckTalk: false, sailing: false, bellT: -1e9, lights: false };

    // ---------- the sea: deep blue, lighter over the causeway's footings; falling in is a splash ----------
    w.box({ pos: [0, -0.3, -60], size: [2400, 0.3, 2400], color: C.sea, collide: false, shadow: false });
    w.cylinder({ pos: [CX, -0.12, (TIP + NEND) / 2 - 8], radius: 26, height: 0.06, sides: 40, scale: [1, 1, 2.6], color: C.shallow, opacity: 0.45, collide: false, shadow: false });
    w.zone({ pos: [0, -3, -60], size: [1000, 4.6, 1000], onEnter: () => {
      w.burst(w.player.pos, { color: ['#ffffff', C.shallow], count: 30, speed: 6, life: 0.8 });
      w.sound('splash');
      w.player.respawn();
    } });

    // ---------- far shores: the strait's headlands, Omphe smoking in the north-west, Kerynthos on its hill to the north ----------
    for (let i = 0; i < 9; i++) { // the western shore
      const z = -560 + i * 120 + R.range(-20, 20);
      w.cone({ pos: [-330 + R.range(-30, 30), 30, z], radius: R.range(70, 110), height: R.range(70, 130), sides: 7, color: i % 2 ? '#7b6a73' : '#86727a', collide: false, shadow: false });
    }
    for (let i = 0; i < 9; i++) { // the eastern shore
      const z = -560 + i * 120 + R.range(-20, 20);
      w.cone({ pos: [300 + R.range(-30, 30), 25, z], radius: R.range(60, 100), height: R.range(60, 110), sides: 7, color: i % 2 ? '#8a7480' : '#94808a', collide: false, shadow: false });
    }
    w.cone({ pos: [-520, 70, -640], radius: 200, height: 220, sides: 9, color: '#6d5f68', collide: false, shadow: false }); // Omphe
    for (let i = 0; i < 6; i++) w.sphere({ pos: [-520 + i * 14, 200 + i * 34, -640 - i * 10], radius: 26 + i * 9, low: true, color: i < 2 ? '#7f7579' : '#9a9095', opacity: 0.85 - i * 0.1, collide: false, shadow: false });
    // Kerynthos: a hill, the palace's red columns along its top, and its lights at dusk
    w.sphere({ pos: [40, -60, -770], radius: 150, low: true, scale: [1.5, 0.95, 1], color: '#7f7a5a', collide: false, shadow: false });
    w.box({ pos: [40, 82, -742], size: [120, 14, 34], color: C.palace2, collide: false, shadow: false });
    for (let i = 0; i < 14; i++) w.box({ pos: [-16 + i * 8.6, 82, -724], size: [2.2, 12, 2.2], color: C.palace, collide: false, shadow: false });
    w.box({ pos: [40, 90, -742], size: [126, 2.4, 38], color: '#d8c49a', collide: false, shadow: false });
    for (const sx of [-1, 1]) w.cone({ pos: [40 + sx * 7, 94.5, -726], radius: 2.4, height: 6, sides: 4, color: '#2a2230', collide: false, shadow: false }); // the horns of consecration
    const palaceLights = [];
    for (let i = 0; i < 18; i++) { const m = w.sphere({ pos: [-14 + i * 6.4 + R.range(-1, 1), 78 + R.range(-6, 8), -722 + R.range(-2, 2)], radius: 1.3, color: '#ffc46b', glow: 2.6, collide: false, shadow: false }); m.hide(); palaceLights.push(m); }
    // a scatter of jagged rocks along the channel: the strait's Teeth beyond the hop line (scenery)
    for (let i = 0; i < 26; i++) {
      const a = R.range(0, 360) * D, r = R.range(40, 170), x = -10 + Math.cos(a) * r * 1.4, z = -40 + Math.sin(a) * r;
      if (Math.abs(x - CX) < 32 && z < 12 && z > -140) continue;   // (keep Talos's circuit clear)
      if (Math.abs(x) < 14 && z > -20) continue;                      // (and the ship's way in)
      w.cone({ pos: [x, R.range(0.5, 2), z], radius: R.range(1.5, 4), height: R.range(3, 9), sides: 5, color: i % 3 ? C.rock2 : C.rock3, collide: false, shadow: false });
    }

    // ---------- the Landing: a flat rock beside the anchorage, with the way home ----------
    w.cylinder({ pos: [LANDING[0], -1.3, LANDING[1]], radius: LANDING_R, height: 5.4, sides: 10, color: C.rock });
    w.cylinder({ pos: [LANDING[0], 1.45, LANDING[1]], radius: LANDING_R - 0.2, height: 0.1, sides: 10, color: C.moss, collide: false, shadow: false });
    w.portal({ pos: [LANDING[0] - 0.5, 1.35, LANDING[1] + 3.2], yaw: 180, to: 'hub', label: 'Junction', frame: C.rock2, arrive: 3 });
    w.checkpoint({ pos: [LANDING[0] + 1.6, 1.4, LANDING[1] - 1.8], yaw: -60 });

    // ---------- the Teeth: a hop line of sea rocks from the Landing to the causeway's tip (two are crumbling) ----------
    const TEETH = [[-15.8, 1.0, 1.8, 1.9], [-20.0, -1.6, 1.6, 2.4], [-24.0, 0.6, 1.6, 2.0, true], [-27.6, -2.4, 1.5, 2.7], [-30.6, 1.2, 1.4, 2.2, true], [-32.0, -2.9, 1.3, 2.5]];
    TEETH.forEach(([x, z, r, top, crumbly], i) => {
      const h = w.cylinder({ pos: [x, top - 4, z], radius: r, height: 8, sides: 7, color: crumbly ? C.scree : i % 2 ? C.rock : C.rock2 });
      if (crumbly) w.crumble(h, { delay: 0.9, respawn: 3 });
      w.cylinder({ pos: [x, top + 0.02, z], radius: r - 0.15, height: 0.06, sides: 7, color: crumbly ? '#cdb592' : C.moss, ...deco });
    });
    w.particles({ pos: [-24, 1, -2], area: [24, 2, 10], count: 22, color: '#ffffff', size: 0.3, kind: 'float' });

    // ---------- Talos's causeway: old cyclopean blocks, six bronze-inlaid footstones, three stretches of loose scree ----------
    const CY = 2; // its top
    const solidSpans = []; // (z ranges with a solid top: everything but the scree)
    { let z1 = TIP; for (const s of SCREE.concat([NEND - 2])) { const z0 = s === NEND - 2 ? NEND - 2 : s + 2; solidSpans.push([z0, z1]); z1 = s - 2; } }
    for (const [z0, z1] of solidSpans) { // (each span in blocks no more than 10 m long: the tiling rule)
      for (let z = z1; z > z0 + 1e-6; z -= 10) { const l = Math.min(10, z - z0); bx(CX - CW / 2, CX + CW / 2, -6, CY, z - l, z, (Math.round(z) & 1) ? C.block : C.block2); }
    }
    for (let z = TIP - 1; z > NEND; z -= 3.3) { // joints between the great blocks (seen, not solid)
      w.box({ pos: [CX - CW / 2 - 0.02, CY - 1.2, z], size: [0.06, 2.0, 0.1], color: C.block3, ...deco });
      w.box({ pos: [CX + CW / 2 + 0.02, CY - 1.2, z], size: [0.06, 2.0, 0.1], color: C.block3, ...deco });
    }
    bx(CX - 3, CX + 3, -6, CY, TIP, TIP + 3, C.block2);                                  // the tip's landing, where the Teeth end
    for (const z of STONES) { // the footstones: flat bronze circles inlaid in the blocks
      w.cylinder({ pos: [CX, CY + 0.03, z], radius: 2.3, height: 0.06, sides: 24, color: C.inlay, metal: 0.4, ...deco });
      w.cylinder({ pos: [CX, CY + 0.05, z], radius: 1.7, height: 0.06, sides: 24, color: '#b37a30', metal: 0.4, ...deco });
    }
    // the shadows a coming foot casts on its footstone (presentation: drawn in frame)
    const shadowMat = STONES.map(() => new T.MeshBasicMaterial({ color: '#160c08', transparent: true, opacity: 0, depthWrite: false }));
    const shadowGeo = new T.CircleGeometry(2.6, 28);
    STONES.forEach((z, k) => { const m = new T.Mesh(shadowGeo, shadowMat[k]); m.rotation.x = -Math.PI / 2; m.position.set(CX, CY + 0.09, z); m.renderOrder = 2; w.add(m); });
    // the niches: shallow alcoves on the east side, out of the way
    NICHES.forEach((z) => {
      bx(CX + CW / 2, CX + CW / 2 + 1.6, -6, CY, z - 1.4, z + 1.4, C.block2);
      bx(CX + CW / 2 + 1.6, CX + CW / 2 + 2.1, CY, CY + 2.2, z - 1.6, z + 1.6, C.block3);
      bx(CX + CW / 2, CX + CW / 2 + 2.1, CY, CY + 2.2, z + 1.4, z + 1.9, C.block3);
      bx(CX + CW / 2, CX + CW / 2 + 2.1, CY, CY + 2.2, z - 1.9, z - 1.4, C.block3);
    });
    // the scree: loose stones across the whole width, which fall when he stamps within 10 m and come back 4 s later
    const scree = SCREE.map((z) => {
      const tiles = [];
      for (const dz of [-1, 1]) {
        const t = bx(CX - CW / 2, CX + CW / 2, CY - 0.7, CY, z + dz - 1, z + dz + 1, C.scree);
        t.hide(); t.show(); // (claimed: kept out of the static merge, so it can drop)
        tiles.push(t);
      }
      for (let i = 0; i < 7; i++) w.sphere({ pos: [CX + R.range(-2.2, 2.2), CY - 4, z + R.range(-1.8, 1.8)], radius: R.range(0.4, 0.8), low: true, color: C.scree, ...deco }); // (rubble below)
      return { z, tiles, fallAt: -1, upAt: -1, down: false };
    });
    // where his planted foot stands: a block over the whole footstone, solid while the foot is down
    const footBlocks = STONES.map((z) => { const b = w.box({ pos: [CX, CY + FOOT[1] / 2, z], size: FOOT, color: '#000000', invisible: true }); b.hide(); return b; });
    // the north end meets Watch Rock's foot
    bx(CX - CW / 2, CX + CW / 2, -6, CY, NEND - 4, NEND - 2, C.block2);
    w.checkpoint({ pos: [CX, CY, TIP - 1.5], yaw: 180 });
    w.checkpoint({ pos: [CX + CW / 2 + 0.8, CY, NICHES[1]], yaw: 180 });

    // ---------- Watch Rock: a sea pillar with a stair round it, its cracked steps marked; the Calling Bell on top ----------
    w.cylinder({ pos: [ROCK[0], TOP / 2 - 4, ROCK[1]], radius: ROCK_R, height: TOP + 8, sides: 11, color: C.rock });
    for (let y = 3; y < TOP - 2; y += 5 + R.range(0, 2)) w.cylinder({ pos: [ROCK[0], y, ROCK[1]], radius: ROCK_R + 0.06, height: 0.6, sides: 11, color: C.rock3, ...deco });
    w.cylinder({ pos: [ROCK[0], TOP + 0.04, ROCK[1]], radius: ROCK_R - 0.2, height: 0.08, sides: 11, color: C.moss, ...deco });
    for (let i = 0; i < 9; i++) { const a = R.range(0, 360) * D; w.box({ pos: [ROCK[0] + Math.cos(a) * (ROCK_R + 0.03), R.range(6, TOP - 3), ROCK[1] + Math.sin(a) * (ROCK_R + 0.03)], size: [0.6, R.range(2, 5), 0.08], yaw: 90 - a / D, color: '#6f8a44', ...deco }); } // ivy
    // the stair: treads rising 0.4 m, anticlockwise seen from above, from the causeway's end round to the top
    const STAIR_N = 70, STAIR_RR = ROCK_R + 1.0, TREAD = 1.7;
    const stairA0 = Math.atan2(NEND - 3 - ROCK[1], CX - ROCK[0]) / D;  // (where the causeway meets the rock: due south)
    const treads = [];
    const CRACKED = [[14, 16], [30, 32], [45, 47], [60, 62]];         // four cracked stretches of three steps
    const cracked = CRACKED.map(() => ({ steps: [], fallAt: -1, upAt: -1, down: false }));
    for (let i = 0; i <= STAIR_N; i++) {
      const a = stairA0 + i * (TREAD / STAIR_RR) / D, y = 0.4 * (i + 1) + CY - 0.4, c = [ROCK[0] + Math.cos(a * D) * STAIR_RR, y, ROCK[1] + Math.sin(a * D) * STAIR_RR];
      const ci = CRACKED.findIndex(([a0, a1]) => i >= a0 && i <= a1);
      const h = w.box({ pos: [c[0], y - 0.25, c[2]], size: [2.2, 0.5, TREAD + 0.3], yaw: -a, color: ci >= 0 ? C.crack : i % 2 ? C.block2 : C.block });
      if (ci >= 0) { h.hide(); h.show(); cracked[ci].steps.push(h); }
      treads.push([c[0], y, c[2], a]);
    }
    // the stair arrives at the top's rim: a short landing onto the summit
    const lastT = treads[treads.length - 1];
    w.checkpoint({ pos: [treads[0][0], CY, treads[0][2] + 1.2], yaw: 0 });
    w.checkpoint({ pos: [treads[38][0], treads[38][1], treads[38][2]], yaw: -treads[38][3] });
    // the summit: the bell in its stone frame, and the carving
    const SUMMIT_TOP = TOP;
    bx(BELL[0] - 2.6, BELL[0] - 1.8, TOP, TOP + 4.2, BELL[2] - 0.4, BELL[2] + 0.4, C.block);
    bx(BELL[0] + 1.8, BELL[0] + 2.6, TOP, TOP + 4.2, BELL[2] - 0.4, BELL[2] + 0.4, C.block);
    bx(BELL[0] - 3.0, BELL[0] + 3.0, TOP + 4.2, TOP + 4.9, BELL[2] - 0.55, BELL[2] + 0.55, C.block2);
    const bell = w.model({ pos: [BELL[0], TOP + 4.2, BELL[2]], parts: [
      { s: 'cyl', r: 0.08, h: 0.5, pos: [0, -0.25, 0], color: C.wood2 },
      { s: 'cone', r: 0.85, h: 1.5, pos: [0, -1.25, 0], color: C.bell, metal: 0.6 },
      { s: 'cyl', r: 0.9, h: 0.16, pos: [0, -2.0, 0], color: '#b37a30', metal: 0.6 },
      { s: 'sphere', r: 0.2, pos: [0, -2.05, 0], color: '#6a4a2a' },
    ] });
    w.box({ pos: [BELL[0], TOP + 1.1, BELL[2]], size: [1.6, 2.2, 1.6], color: '#000000', invisible: true }); // (the bell's bulk)
    const SLAB = [BELL[0] + 2.2, TOP, BELL[2] + 3.6];
    w.box({ pos: [SLAB[0], TOP + 0.9, SLAB[2]], size: [1.8, 1.8, 0.4], yaw: 20, color: C.block });
    w.model({ pos: [SLAB[0], TOP + 0.9, SLAB[2]], yaw: 20, parts: [
      { s: 'box', size: [0.08, 0.7, 0.04], pos: [-0.35, 0.3, 0.22], color: '#3b2a1e' }, { s: 'box', size: [0.3, 0.05, 0.04], pos: [-0.25, 0.62, 0.22], rot: [0, 0, 40], color: '#3b2a1e' }, // the shepherd and his crook
      { s: 'sphere', r: 0.08, pos: [-0.35, 0.72, 0.22], color: '#3b2a1e' },
      { s: 'box', size: [0.36, 0.08, 0.04], pos: [-0.25, -0.35, 0.22], color: '#3b2a1e' }, { s: 'box', size: [0.36, 0.08, 0.04], pos: [0.2, -0.35, 0.22], color: '#3b2a1e' }, // — — ·
      { s: 'box', size: [0.09, 0.08, 0.04], pos: [0.55, -0.35, 0.22], color: '#3b2a1e' },
    ] });
    w.interact({ pos: [SLAB[0], TOP + 1, SLAB[2] + 0.4], radius: 2.2, label: 'Look at the carving', onUse: () => { codex('bell'); return say('The carving', 'A shepherd with a crook, raising one hand. Below: two long grooves and a short one. — — ·'); } });
    w.checkpoint({ pos: [BELL[0] - 3.5, TOP, BELL[2] + 5.5], yaw: 0 });
    // gull nests on the rim
    for (let i = 0; i < 4; i++) { const a = (40 + i * 85) * D; w.cylinder({ pos: [ROCK[0] + Math.cos(a) * (ROCK_R - 1.2), TOP + 0.2, ROCK[1] + Math.sin(a) * (ROCK_R - 1.2)], radius: 0.55, height: 0.3, sides: 8, color: '#b89b6a', ...deco }); }
    w.particles({ pos: [ROCK[0], TOP + 8, ROCK[1]], area: [30, 8, 30], count: 12, color: '#ffffff', size: 0.35, kind: 'float' });

    // ---------- the Patient Cow: everything drawn as one model (so it can sail in), with plain colliders ----------
    // Ship-local coordinates: the hull's centre at the waterline, the bow to the north (-z); the deck at y DECK.
    const SHIP = [
      { s: 'box', size: [6, 2.5, 20], pos: [0, 0.2, 0], color: C.wood2 },                        // the hull
      { s: 'box', size: [5.8, 0.12, 19.6], pos: [0, DECK - 0.06, 0], color: C.deck },             // the deck
      { s: 'box', size: [0.25, 0.8, 20], pos: [2.9, DECK + 0.4, 0], color: C.wood },              // the starboard rail
      { s: 'box', size: [0.25, 0.8, 9], pos: [-2.9, DECK + 0.4, 5.5], color: C.wood },            // the port rail (a gap amidships, for the plank)
      { s: 'box', size: [0.25, 0.8, 9], pos: [-2.9, DECK + 0.4, -5.5], color: C.wood },
      { s: 'box', size: [6, 0.8, 0.25], pos: [0, DECK + 0.4, 9.9], color: C.wood },               // the stern rail
      { s: 'box', size: [6, 0.8, 0.25], pos: [0, DECK + 0.4, -9.9], color: C.wood },              // the bow rail
      { s: 'box', size: [0.6, 3.2, 0.6], pos: [0, DECK + 1.0, -10.4], color: C.wood2 },           // the stem post, and its horns
      { s: 'cone', r: 0.18, h: 1.1, pos: [-0.45, DECK + 2.9, -10.4], rot: [0, 0, 35], color: '#efe2c8' },
      { s: 'cone', r: 0.18, h: 1.1, pos: [0.45, DECK + 2.9, -10.4], rot: [0, 0, -35], color: '#efe2c8' },
      { s: 'box', size: [5.6, 0.25, 0.4], pos: [0, -0.1, -10.2], color: C.stripe },               // a stripe at the waterline
      { s: 'cyl', r: 0.3, h: 11, pos: [0, DECK + 5.5, MAST_Z], color: C.wood2 },                  // the mast
      { s: 'cyl', r: 0.18, h: 8.6, pos: [0, YARD_Y - 0.15, MAST_Z], rot: [0, 0, 90], color: C.wood }, // the yard
      { s: 'box', size: [1.0, 0.12, 6], pos: [0, DECK + 0.6, 7.6], color: C.wood2 },              // the steering oar
      { s: 'box', size: [2.4, 1.4, 1.8], pos: [1.6, DECK + 0.7, 2.6], color: '#9a7a50' },         // crates of wings, to starboard (the port side is the way fore and aft)
      { s: 'box', size: [2.4, 1.2, 1.8], pos: [1.6, DECK + 0.6, -5.6], color: '#8a6a44' },
      { s: 'box', size: [1.8, 0.12, 0.8], pos: [1.6, DECK + 1.46, 2.6], rot: [0, 10, 0], color: '#fbf7ee' },
      { s: 'box', size: [1.8, 0.12, 0.8], pos: [1.6, DECK + 1.26, -5.6], rot: [0, -12, 0], color: '#f1e7d2' },
      { s: 'cyl', r: 0.55, h: 1.2, pos: [-1.8, DECK + 0.6, 8.2], color: C.clay },                 // the water jar at the stern
      { s: 'cone', r: 0.55, h: 0.5, pos: [-1.8, DECK + 1.45, 8.2], color: C.clay },
      { s: 'cyl', r: 0.22, h: 0.3, pos: [-1.8, DECK + 1.75, 8.2], color: '#a85c32' },
      { s: 'box', size: [0.1, 0.1, 7], pos: [0, DECK + 2.3, -6.5], rot: [-20, 0, 0], color: C.rope, },  // the forestay
    ];
    // the sail: set while she sails in, furled on the yard once she is anchored
    const SAIL_SET = [{ s: 'box', size: [8.2, 6.6, 0.06], pos: [0, YARD_Y - 3.5, MAST_Z + 0.25], color: C.sail }, { s: 'box', size: [8.2, 0.7, 0.07], pos: [0, YARD_Y - 2.6, MAST_Z + 0.26], color: C.stripe }];
    const SAIL_FURLED = [{ s: 'cyl', r: 0.24, h: 8.2, pos: [0, YARD_Y - 0.45, MAST_Z + 0.62], rot: [0, 0, 90], color: C.sail }];
    // the rope stair round the mast to the yard (as in chapter two), and the yard's footway
    const RUNGS = [];
    { const n = 23, rr = 1.05; for (let i = 0; i < n; i++) { const a = (i * 34 + 332) * D; RUNGS.push([Math.cos(a) * rr, DECK + 0.4 * (i + 1), MAST_Z + Math.sin(a) * rr, -a / D]); } }
    const rungParts = RUNGS.map(([x, y, z, yaw]) => ({ s: 'box', size: [0.95, 0.1, 0.65], pos: [x, y - 0.05, z], rot: [0, yaw, 0], color: C.rope }));
    const FOOTWAY = { size: [2.9, 0.3, 0.8], pos: [2.95, YARD_Y - 0.05, MAST_Z] }; // (only outside the stair's circle: no ceiling over its rungs)
    const footwayPart = { s: 'box', size: FOOTWAY.size, pos: FOOTWAY.pos, color: C.wood };
    // Old Horn, a stowaway: on the yard's starboard end, chewing the sail's rope
    const GOAT_AT = [3.85, YARD_Y + 0.1, MAST_Z];
    const goatParts = [
      { s: 'box', size: [0.5, 0.45, 0.95], pos: [0, 0.75, 0], color: C.goat }, { s: 'box', size: [0.36, 0.36, 0.42], pos: [0, 1.12, -0.55], color: C.goat },
      { s: 'cone', r: 0.06, h: 0.34, pos: [-0.1, 1.42, -0.5], rot: [30, 0, 0], color: C.goat2 }, { s: 'cone', r: 0.06, h: 0.34, pos: [0.1, 1.42, -0.5], rot: [30, 0, 0], color: C.goat2 },
      ...[[-0.17, -0.33], [0.17, -0.33], [-0.17, 0.33], [0.17, 0.33]].map(([x, z]) => ({ s: 'box', size: [0.1, 0.55, 0.1], pos: [x, 0.27, z], color: C.goat2 })),
      { s: 'box', size: [0.05, 0.05, 0.5], pos: [0.12, 1.0, -0.85], rot: [0, 30, 0], color: C.rope }];
    const shipModel = w.model({ pos: [0, 0, P.anchored ? 0 : SHIP_Z], parts: SHIP.concat(rungParts, [footwayPart]) });
    const sailSet = w.model({ pos: [0, 0, 0], parts: SAIL_SET }), sailFurled = w.model({ pos: [0, 0, 0], parts: SAIL_FURLED });
    shipModel.group.add(sailSet.group); shipModel.group.add(sailFurled.group);
    sailSet.group.visible = !P.anchored; sailFurled.group.visible = P.anchored;
    const goatM = w.model({ pos: GOAT_AT, yaw: 90, parts: goatParts }); shipModel.group.add(goatM.group);
    // what she stands on: the hull (it sails in on the first visit), and the rest once she is at anchor
    const hull = w.box({ pos: [0, DECK / 2 - 0.55, P.anchored ? 0 : SHIP_Z], size: [6, DECK + 1.1, 20], color: '#000000', invisible: true });
    if (!P.anchored) { P.ride = true; w.mover(hull, { path: [[0, DECK / 2 - 0.55, SHIP_Z], [0, DECK / 2 - 0.55, 0]], speed: SHIP_V, pause: 1e6 }); }
    const extras = [];
    const extra = (h) => { if (!P.anchored) h.hide(); extras.push(h); return h; };
    const inv = { color: '#000000', invisible: true };
    extra(w.box(Object.assign({ pos: [2.9, DECK + 0.45, 0], size: [0.25, 0.9, 20] }, inv)));
    extra(w.box(Object.assign({ pos: [-2.9, DECK + 0.45, 5.5], size: [0.25, 0.9, 9] }, inv)));
    extra(w.box(Object.assign({ pos: [-2.9, DECK + 0.45, -5.5], size: [0.25, 0.9, 9] }, inv)));
    extra(w.box(Object.assign({ pos: [0, DECK + 0.45, 9.9], size: [6, 0.9, 0.25] }, inv)));
    extra(w.box(Object.assign({ pos: [0, DECK + 0.45, -9.9], size: [6, 0.9, 0.25] }, inv)));
    extra(w.cylinder(Object.assign({ pos: [0, DECK + 5.5, MAST_Z], radius: 0.3, height: 11 }, inv)));
    extra(w.box(Object.assign({ pos: [1.6, DECK + 0.7, 2.6], size: [2.4, 1.4, 1.8] }, inv)));
    extra(w.box(Object.assign({ pos: [1.6, DECK + 0.6, -5.6], size: [2.4, 1.2, 1.8] }, inv)));
    extra(w.cylinder(Object.assign({ pos: [-1.8, DECK + 0.85, 8.2], radius: 0.55, height: 1.7 }, inv)));
    for (const [x, y, z, yaw] of RUNGS) extra(w.box(Object.assign({ pos: [x, y - 0.05, z], size: [0.95, 0.1, 0.65], yaw }, inv)));
    extra(w.box(Object.assign({ pos: FOOTWAY.pos, size: FOOTWAY.size }, inv)));
    extra(w.box(Object.assign({ pos: [GOAT_AT[0], GOAT_AT[1] + 0.65, GOAT_AT[2]], size: [0.6, 1.2, 1.1] }, inv)));
    // the plank to the Landing, across the gap in the port rail
    const plank = extra(w.box({ pos: [-4.25, DECK - 0.08, 0], size: [2.9, 0.16, 1.4], color: C.wood }));
    if (!P.anchored) plank.hide();
    // anchored visits draw it as part of the scenery; on the first, it is laid when she anchors
    const anchorRope = w.model({ pos: [0, 0, 0], parts: [{ s: 'box', size: [0.08, 0.08, 5], pos: [0, DECK - 0.5, -12], rot: [-35, 0, 0], color: C.rope }] });
    anchorRope.group.visible = P.anchored;
    const shipAt = () => { // where she is now (tick code): the ride's own schedule
      if (!P.ride) return 0;
      return Math.max(0, SHIP_Z - SHIP_V * w.ticks / 60);
    };

    // ---------- the crew: Kessa at the steering oar, Perdika forward, Ammi at the port rail ----------
    const CREW = { kessa: [1.0, DECK, 7.4, 180], perdika: [0.8, DECK, -7.6, 160], ammi: [-2.1, DECK, -3.2, -90] };
    const kessa = w.npc({ pos: CREW.kessa.slice(0, 3), yaw: CREW.kessa[3], name: 'Kessa', walks: true, hat: 'lsb-headscarf', look: LOOKS.kessa, onTalk: () => talkKessa() });
    const perdika = w.npc({ pos: CREW.perdika.slice(0, 3), yaw: CREW.perdika[3], name: 'Perdika', walks: true, look: LOOKS.perdika, onTalk: () => talkPerdika() });
    const ammi = w.npc({ pos: CREW.ammi.slice(0, 3), yaw: CREW.ammi[3], name: 'Ammi', walks: true, look: LOOKS.ammi, onTalk: () => talkAmmi() });
    const PERDIKA_YARD = [2.55, YARD_Y + 0.1, MAST_Z], PERDIKA_HOLD = [2.1, DECK, 5.0];
    // while she sails in, the crew are drawn as part of the ship (smooth at any frame rate); the people step aboard at anchor
    const rideCrew = [];
    if (P.ride) {
      for (const [k, look, hat] of [['kessa', LOOKS.kessa, 'lsb-headscarf'], ['perdika', LOOKS.perdika, null], ['ammi', LOOKS.ammi, null]]) {
        const a = w.avatar({ look, eq: hat ? { head: hat } : {}, name: k[0].toUpperCase() + k.slice(1) });
        const c = CREW[k]; a.root.position.set(c[0], c[1], c[2]); a.root.rotation.y = c[3] * D;
        a.root.removeFromParent(); shipModel.group.add(a.root); rideCrew.push(a);
      }
      kessa.hide(); perdika.hide(); ammi.hide();
    } else placeCrew();
    function placeCrew() {
      perdika.setPos(talked() || store.get('briefed', false) ? (flag('lsb.perdika.trust') ? PERDIKA_YARD : PERDIKA_HOLD) : CREW.perdika.slice(0, 3), flag('lsb.perdika.trust') && store.get('briefed', false) ? -90 : CREW.perdika[3]);
    }

    // ---------- the Low Wings: a loan, as in chapter two ----------
    function lendWings() {
      if (!flag('lsb.has.wings')) return;
      if (!w.has('lsb-low-wings')) w.give('lsb-low-wings', { silent: true });
      const eq = w.equipment();
      if (eq.back !== 'lsb-low-wings') { if (eq.back && !store.get('prevBack', null)) store.set('prevBack', eq.back); w.equip('lsb-low-wings'); }
    }

    // ---------- Talos ----------
    // His state this visit: 'walk' (his circuit), 'come' (called by the bell: he wades to the rock), 'lean' (at the rock,
    // talking), 'leave' (back from the rock to sit) and 'sit' (in the shallows, watching the sunset).
    P.talos = { mode: talked() ? 'sit' : 'walk', t0: 0, from: null };
    const walking = () => P.talos.mode === 'walk';
    // the next stamp on footstone k at or after tick t (while he walks)
    const nextStamp = (k, t) => { const s0 = stepOf(t); for (let s = s0; s < s0 + NSTEP + 1; s++) { const at = stampTick(s); if (at >= t && stoneOfStep(s) === k) return at; } return Infinity; };
    // where his planted foot is at tick t (a footstone index, or -1)
    const plantedAt = (t) => { if (!walking()) return -1; const s = stepOf(t), ph = t - stampTick(s), k = stoneOfStep(s); return k >= 0 && ph < PLANT ? k : -1; };
    const underFoot = (p, k) => Math.abs(p[0] - CX) < FOOT[0] / 2 + 0.5 && Math.abs(p[2] - STONES[k]) < FOOT[2] / 2 + 0.5 && p[1] < CY + 5;
    function stamp(k) {
      P.stamps++;
      const p = w.player.pos, near = Math.abs(p[2] - STONES[k]) + Math.max(0, Math.abs(p[0] - CX) - 20);
      w.sound('stomp');
      if (near < 40) w.shake(near < 14 ? 0.45 : 0.22);
      w.burst([CX, CY + 0.4, STONES[k]], { color: ['#d9c3a0', '#a98b66'], count: 18, speed: 6, life: 0.7 });
      if (underFoot(p, k)) {
        const n = store.get('stamped', 0) + 1; store.set('stamped', n);
        w.toast(n === 1 ? 'Talos\'s foot came down on you. Watch the footstones: a shadow darkens on one before his foot lands.' : 'Squashed (nearly). Back you go.');
        if (n === 1 && flag('lsb.perdika.trust')) w.after(1.5, () => w.toast('Perdika, from the mast: "THE SHADOW! Watch his SHADOW!"'));
        w.player.respawn();
      }
      solidOnly(footBlocks[k], true);
      const t = w.ticks;
      for (const s of scree) if (Math.abs(s.z - STONES[k]) <= 10) { s.fallAt = t + DROP; s.upAt = t + DROP + SCREE_DOWN; }
      for (const c of cracked) { c.fallAt = t + DROP; c.upAt = t + DROP + CRACK_DOWN; }
    }
    // a tile can come back only when nobody is inside it
    const clearOf = (h) => {
      const m = h.mesh, p = w.player.pos, l = new T.Vector3(p[0], p[1], p[2]).sub(m.position).applyQuaternion(m.quaternion.clone().invert());
      // (someone standing level with its top, on the edge beside it, is fine; someone below its top, falling through, is not)
      return !(Math.abs(l.x) < m.scale.x / 2 + 0.45 && Math.abs(l.z) < m.scale.z / 2 + 0.45 && l.y - 0.93 < m.scale.y / 2 - 0.05 && l.y > -m.scale.y / 2 - 2.5);
    };
    function stepDrops(list, up) {
      const t = w.ticks;
      for (const d of list) {
        const parts = d.tiles || d.steps;
        if (!d.down && d.fallAt >= 0 && t >= d.fallAt && t < d.upAt) {
          d.down = true; for (const h of parts) h.hide(); w.sound('crumble');
          const c = parts[0].mesh.position; w.burst([c.x, c.y, c.z], { color: [C.scree, '#d9c3a0'], count: 14, speed: 3, life: 0.6 });
        }
        if (d.down && (t >= d.upAt || up) && parts.every(clearOf)) { d.down = false; d.fallAt = -1; for (const h of parts) h.show(); }
      }
    }
    w.on('tick', () => {
      if (walking()) {
        const t = w.ticks, s = stepOf(t), ph = t - stampTick(s), k = stoneOfStep(s);
        if (ph === 0 && k >= 0) stamp(k);
        if (ph === PLANT && k >= 0) footBlocks[k].hide();
      }
      stepDrops(scree, !walking()); stepDrops(cracked, !walking());
    });

    // ---------- Talos's body: built from parts, posed every frame from the same schedule (presentation only) ----------
    const S = 1.15; // (his parts are built at a 30 m giant's size divided by S)
    const TH = 9.5, SH = 9.5;   // thigh and shin (unscaled)
    const tal = (parts, name) => { const m = w.model({ pos: [0, -200, 0], scale: S, parts }); m.group.name = name; return m.group; };
    const plate = (x, y, z, rx, c) => ({ s: 'box', size: [1.75, 1.35, 0.25], pos: [x, y, z], rot: [rx, 0, 0], color: c });
    const torsoParts = [
      { s: 'rbox', size: [7, 3, 4.2], pos: [0, 0.5, 0], color: C.bronze2, metal: 0.55 },
      { s: 'box', size: [5.6, 2.6, 3.6], pos: [0, 2.9, 0], color: C.bronze2, metal: 0.55 },
      { s: 'rbox', size: [8.4, 6, 5], pos: [0, 7, 0.1], color: C.bronze, metal: 0.55 },
      { s: 'sphere', r: 1.9, pos: [4.6, 9.3, 0], color: C.patina, metal: 0.3 }, { s: 'sphere', r: 1.9, pos: [-4.6, 9.3, 0], color: C.patina, metal: 0.3 },
      { s: 'cyl', r: 1.3, h: 2.2, pos: [0, 10.6, 0], color: C.patina, metal: 0.3 },
      { s: 'rbox', size: [4.2, 4.6, 4.4], pos: [0, 13.2, 0.1], color: C.bronze, metal: 0.55 },
      { s: 'box', size: [3.6, 3.8, 0.4], pos: [0, 13.1, 2.35], color: C.bronze3, metal: 0.6 },     // the mask
      { s: 'box', size: [3.8, 0.5, 0.6], pos: [0, 14.25, 2.5], color: C.bronze2, metal: 0.5 },      // the brow
      { s: 'box', size: [0.6, 1.4, 0.7], pos: [0, 13.0, 2.7], color: C.bronze3, metal: 0.6 },       // the nose
      { s: 'sphere', r: 0.42, pos: [0.95, 13.75, 2.5], color: C.eye, glow: 3 }, { s: 'sphere', r: 0.42, pos: [-0.95, 13.75, 2.5], color: C.eye, glow: 3 },
      { s: 'box', size: [1.4, 0.18, 0.2], pos: [0, 11.9, 2.6], color: '#3a2412' },                 // the mouth
      { s: 'box', size: [0.22, 9.4, 0.22], pos: [2.1, 5.6, 2.62], color: C.seam, glow: 2.2 },       // the vein, neck down to the left hip
      { s: 'box', size: [7.2, 0.5, 4.4], pos: [0, 2.2, 0], color: C.bronze3, metal: 0.6 },          // a belt
    ];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) torsoParts.push(plate(-2.7 + i * 1.8 + (row % 2) * 0.9, 9.0 - row * 1.25, 2.62 + row * 0.03, -14, (row + i) % 2 ? '#d09846' : C.bronze));
    for (const sx of [-1, 1]) for (let row = 0; row < 3; row++) torsoParts.push({ s: 'box', size: [0.25, 1.3, 1.8], pos: [sx * 4.25, 8.8 - row * 1.3, -0.6 + (row % 2) * 0.6], rot: [0, 0, sx * 10], color: row % 2 ? C.bronze : '#d09846' });
    const torso = tal(torsoParts, 'talos-torso');
    const limb = (r, len, joint, extraParts = []) => [{ s: 'cyl', r, h: len, pos: [0, -len / 2, 0], color: C.bronze, metal: 0.55 }, { s: 'sphere', r: r * 1.02, pos: [0, -len, 0], color: joint, metal: 0.3 }].concat(extraParts);
    const thighR = tal(limb(1.5, TH, C.patina), 'thigh-r'), thighL = tal(limb(1.5, TH, C.patina, [{ s: 'box', size: [0.2, TH, 0.2], pos: [1.45, -TH / 2, 0.4], color: C.seam, glow: 2.2 }]), 'thigh-l');
    const shinR = tal(limb(1.25, SH, C.bronze2), 'shin-r'), shinL = tal(limb(1.25, SH, C.bronze2, [{ s: 'box', size: [0.2, SH, 0.2], pos: [1.2, -SH / 2, 0.3], color: C.seam, glow: 2.2 }]), 'shin-l');
    const footParts = (nail) => [{ s: 'rbox', size: [2.7, 1.4, 5.0], pos: [0, -0.7, 1.1], color: C.bronze2, metal: 0.5 }, { s: 'box', size: [2.5, 0.35, 1.2], pos: [0, -1.2, 3.4], color: C.bronze, metal: 0.5 }]
      .concat(nail ? [{ s: 'cyl', r: 0.32, h: 1.4, pos: [1.45, 0.1, 0.2], rot: [0, 0, 90], color: C.tin, metal: 0.7 }, { s: 'sphere', r: 0.4, pos: [1.25, 0.1, 0.2], color: C.seam, glow: 2.4 }] : []);
    const footR = tal(footParts(false), 'foot-r'), footL = tal(footParts(true), 'foot-l');
    const UA = 8, FA = 7.5;
    const upperR = tal(limb(1.15, UA, C.patina), 'arm-r'), upperL = tal(limb(1.15, UA, C.patina), 'arm-l');
    const handParts = [{ s: 'cyl', r: 1.0, h: FA, pos: [0, -FA / 2, 0], color: C.bronze, metal: 0.55 }, { s: 'rbox', size: [2.0, 2.2, 1.7], pos: [0, -FA - 0.9, 0], color: C.bronze2, metal: 0.5 }];
    const foreR = tal(handParts, 'fore-r'), foreL = tal(handParts, 'fore-l');
    const boulders = [0, 1].map(() => tal([{ s: 'ico', r: 2.2, pos: [0, 0, 0], color: C.rock2 }], 'boulder'));
    // pose maths (frame code): two-bone reach from a root to a target, bending toward a pole
    const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
    const DOWN = V(0, -1, 0);
    const aim = (g, a, b) => { g.position.copy(a); const d = V().subVectors(b, a); const l = d.length(); if (l > 1e-6) g.quaternion.setFromUnitVectors(DOWN, d.multiplyScalar(1 / l)); };
    function reach(gA, gB, root, target, la, lb, pole) {
      const d = V().subVectors(target, root); let l = d.length();
      const lo = Math.abs(la - lb) + 0.01, hi = la + lb - 0.01; l = Math.min(hi, Math.max(lo, l));
      const u = d.normalize(), a = (la * la - lb * lb + l * l) / (2 * l), h = Math.sqrt(Math.max(0, la * la - a * a));
      const v = V().copy(pole).addScaledVector(u, -pole.dot(u)); if (v.lengthSq() < 1e-6) v.set(0, 0, 1); v.normalize();
      const knee = V().copy(root).addScaledVector(u, a).addScaledVector(v, h), end = V().copy(root).addScaledVector(u, l);
      aim(gA, root, knee); aim(gB, knee, end);
      return end;
    }
    // the body's path through his circuit at a fractional step x (Catmull-Rom through the keyframes)
    const kb = (i) => KB[((i % NSTEP) + NSTEP) % NSTEP];
    function bodyAt(x) {
      const s = Math.floor(x), u = x - s, p0 = kb(s - 1), p1 = kb(s), p2 = kb(s + 1), p3 = kb(s + 2);
      const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      const dcr = (a, b, c, d) => 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * u + 3 * (-a + 3 * b - 3 * c + d) * u * u);
      return { x: cr(p0[0], p1[0], p2[0], p3[0]), z: cr(p0[1], p1[1], p2[1], p3[1]), yaw: Math.atan2(dcr(p0[0], p1[0], p2[0], p3[0]), dcr(p0[1], p1[1], p2[1], p3[1])) };
    }
    const fwdOf = (yaw) => V(Math.sin(yaw), 0, Math.cos(yaw)), rightOf = (yaw) => V(-Math.cos(yaw), 0, Math.sin(yaw));
    const SEABED = -4, ANK = 1.45 * S; // (an ankle stands this high over the sole)
    // where each foot lands on a step: the right on its footstone (or in the water on the turns), the left in the water
    function rightHold(s) {
      const k = stoneOfStep(s), b = bodyAt(s);
      if (k >= 0) return { p: V(CX, CY + ANK, STONES[k]), yaw: b.yaw };
      const f = fwdOf(b.yaw), r = rightOf(b.yaw);
      return { p: V(b.x + r.x * 5 + f.x * 3, SEABED + ANK, b.z + r.z * 5 + f.z * 3), yaw: b.yaw };
    }
    function leftHold(s) {
      const b = bodyAt(s + 2 / 3), f = fwdOf(b.yaw), r = rightOf(b.yaw);
      return { p: V(b.x - r.x * 5 + f.x * 3, SEABED + ANK, b.z - r.z * 5 + f.z * 3), yaw: b.yaw };
    }
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const lerpYaw = (a, b, u) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * u; };
    // a foot in the air between two holds: up, across, a hover over the next, then down hard (the stamp)
    function swing(A, B, u, lift, hover) {
      const h = smooth(0, hover ? 0.68 : 1, u), top = Math.max(A.p.y, B.p.y) + lift;
      const y = hover ? (u < 0.78 ? A.p.y + (top - A.p.y) * Math.sin(Math.min(1, u / 0.45) * Math.PI / 2) : B.p.y + (top - B.p.y) * (1 - ((u - 0.78) / 0.22) * ((u - 0.78) / 0.22)))
        : A.p.y + (B.p.y - A.p.y) * h + lift * Math.sin(u * Math.PI);
      return { p: V(A.p.x + (B.p.x - A.p.x) * h, y, A.p.z + (B.p.z - A.p.z) * h), yaw: lerpYaw(A.yaw, B.yaw, h) };
    }
    // his pose while walking, at visit tick tv (fractional)
    function walkPose(tv) {
      const x = (tv + T0) / STEP, s = Math.floor(x), ph = (x - s) * STEP;
      const b = bodyAt(x);
      let rf, lf;
      if (ph < PLANT) rf = rightHold(s); else rf = swing(rightHold(s), rightHold(s + 1), (ph - PLANT) / (STEP - PLANT), 7.5, stoneOfStep(s + 1) >= 0);
      if (ph >= 2 * BEAT) lf = leftHold(s); else if (ph >= BEAT) lf = swing(leftHold(s - 1), leftHold(s), (ph - BEAT) / BEAT, 2.5, false); else lf = leftHold(s - 1);
      const dip = stoneOfStep(s) >= 0 && ph < 30 ? Math.sin(ph / 30 * Math.PI) * 0.6 : 0;
      return { body: V(b.x, 16.6 - dip + Math.sin(x * Math.PI * 2) * 0.25, b.z), yaw: b.yaw, pitch: 0.05, rf, lf, swing: Math.sin(x * Math.PI * 2), hands: null, x };
    }
    // at the rock: he bends to the summit, forearms on its rim, his eyes level with the bell
    const LEAN = { body: V(ROCK[0] - 22.5, 19.4, ROCK[1] + 1), yaw: Math.PI / 2, pitch: 0.3,
      rf: { p: V(ROCK[0] - 25, -1 + ANK, ROCK[1] - 4.5), yaw: Math.PI / 2 }, lf: { p: V(ROCK[0] - 25, -1 + ANK, ROCK[1] + 6.5), yaw: Math.PI / 2 },
      hands: [V(ROCK[0] - ROCK_R + 1.5, TOP + 0.8, ROCK[1] - 5.5), V(ROCK[0] - ROCK_R + 1.5, TOP + 0.8, ROCK[1] + 6.5)], swing: 0 };
    // in the shallows beside his causeway, watching the sunset (west), arms on his knees
    const SIT = { body: V(CX - 15, 2.2, -48), yaw: -Math.PI / 2, pitch: -0.12,
      rf: { p: V(CX - 30, SEABED + ANK, -44), yaw: -Math.PI / 2 }, lf: { p: V(CX - 30, SEABED + ANK, -53), yaw: -Math.PI / 2 },
      hands: [V(CX - 24, 9.5, -44.5), V(CX - 24, 9.5, -52)], swing: 0, knees: true };
    const outside = (v, rr) => { const dx = v.x - ROCK[0], dz = v.z - ROCK[1], d = Math.hypot(dx, dz); if (d < rr && d > 1e-6) { v.x = ROCK[0] + dx / d * rr; v.z = ROCK[1] + dz / d * rr; } return v; };
    function blendPose(A, B, u) {
      const e = smooth(0, 1, u), step = (a, b, k) => { const q = smooth(k, k + 0.5, u); return { p: outside(V().lerpVectors(a.p, b.p, q).add(V(0, Math.sin(q * Math.PI) * 4, 0)), ROCK_R + 4), yaw: lerpYaw(a.yaw, b.yaw, q) }; };
      const hands = A.hands || B.hands ? [0, 1].map((i) => V().lerpVectors(A.hands ? A.hands[i] : B.hands[i], B.hands ? B.hands[i] : A.hands[i], e)) : null;
      return { body: outside(V().lerpVectors(A.body, B.body, e), ROCK_R + 9), yaw: lerpYaw(A.yaw, B.yaw, e), pitch: A.pitch + (B.pitch - A.pitch) * e, rf: step(A.rf, B.rf, 0.1), lf: step(A.lf, B.lf, 0.4),
        hands: hands && (A.hands && B.hands ? hands : e > 0.5 ? (B.hands ? hands : null) : (A.hands ? hands : null)), swing: 0, knees: e > 0.5 ? B.knees : A.knees };
    }
    // the throws, as she sails in: from his right hand, two boulders arc out and burst ahead of the bow
    const THROWS = [{ t: 640, land: 745, at: [6, 0, 44] }, { t: 830, land: 930, at: [-5, 0, 20] }];
    let vt = 0;
    const eyeMats = [];
    torso.traverse((o) => { if (o.isMesh && o.material && o.material.emissive && o.material.color.getHexString() === 'ff8a2a') { o.material = o.material.clone(); eyeMats.push(o.material); } });
    function render(pose, tv) {
      const q = new T.Quaternion().setFromEuler(new T.Euler(pose.pitch, pose.yaw, 0, 'YXZ'));
      torso.position.copy(pose.body); torso.quaternion.copy(q);
      const r = rightOf(pose.yaw), f = fwdOf(pose.yaw);
      const hipR = V().copy(pose.body).addScaledVector(r, 3.0 * S), hipL = V().copy(pose.body).addScaledVector(r, -3.0 * S);
      const kneePole = pose.knees ? V(f.x, 1.4, f.z) : V(f.x, 0.15, f.z);
      reach(thighR, shinR, hipR, pose.rf.p, TH * S, SH * S, kneePole);
      reach(thighL, shinL, hipL, pose.lf.p, TH * S, SH * S, kneePole);
      for (const [g, h] of [[footR, pose.rf], [footL, pose.lf]]) { g.position.copy(h.p); g.quaternion.setFromEuler(new T.Euler(0, h.yaw, 0)); }
      const sh = (sx) => V(sx * 4.6 * S, 9.3 * S, 0).applyQuaternion(q).add(pose.body);
      const shR = sh(-1), shL = sh(1);
      let handR, handL;
      if (pose.hands) { handR = pose.hands[0]; handL = pose.hands[1]; }
      else {
        const sw = pose.swing * 0.35, hang = (shp, side, k) => V().copy(shp).addScaledVector(V(0, -1, 0), (UA + FA) * S * 0.92).addScaledVector(f, k * 5).addScaledVector(r, side * 0.8);
        handR = hang(shR, 1, -sw); handL = hang(shL, -1, sw);
        for (const th of THROWS) { // (the throwing arm comes up and over)
          const u = (tv - (th.t - 50)) / 60;
          if (P.ride && u > 0 && u < 1) handR = V().copy(shR).addScaledVector(V(0, 1, 0), Math.sin(u * Math.PI) * 14).addScaledVector(f, -6 + u * 16).addScaledVector(r, 2);
        }
      }
      reach(upperR, foreR, shR, handR, UA * S, FA * S, V(-f.x, -0.4, -f.z));
      reach(upperL, foreL, shL, handL, UA * S, FA * S, V(-f.x, -0.4, -f.z));
      return { shR };
    }
    w.on('frame', (dt, t) => {
      vt = Math.min(Math.max(vt + dt * 60, w.ticks - 3), w.ticks + 1);
      const m = P.talos;
      let pose;
      if (m.mode === 'walk') pose = walkPose(vt);
      else if (m.mode === 'come') pose = blendPose(m.from || (m.from = walkPose(m.t0)), LEAN, (vt - m.t0) / 300);
      else if (m.mode === 'lean') { pose = LEAN; LEAN.body.y = 19.4 + Math.sin(t * 0.8) * 0.15; }
      else if (m.mode === 'leave') pose = blendPose(LEAN, SIT, (vt - m.t0) / 360);
      else pose = SIT;
      const ans = flag('lsb.talos');
      SIT.pitch = ans === 'truth' ? 0.32 : ans === 'lie' ? -0.16 : -0.04;
      SIT.yaw = ans === 'unsure' ? -Math.PI / 2 - 0.5 : -Math.PI / 2; // (not knowing: he looks south, out to sea)
      const out = render(pose, vt);
      for (const em of eyeMats) em.emissiveIntensity = m.mode === 'lean' ? 3.6 + Math.sin(t * 2) * 0.4 : m.mode === 'sit' || m.mode === 'leave' ? (ans === 'truth' ? 1.0 : ans === 'lie' ? 5 + Math.sin(t * 3) * 0.6 : 2.2) : 3;
      // the shadow on the footstone his foot is coming down on
      STONES.forEach((z, k) => { shadowMat[k].opacity = 0; });
      if (m.mode === 'walk') {
        const s = Math.floor((vt + T0) / STEP), k = stoneOfStep(s + 1), until = stampTick(s + 1) - vt;
        if (k >= 0 && until < WARN + 30) shadowMat[k].opacity = Math.min(0.82, Math.max(0, 1 - until / WARN) * 0.82 + 0.12);
        const k0 = stoneOfStep(s), since = vt - stampTick(s);
        if (k0 >= 0 && since < PLANT) shadowMat[k0].opacity = Math.max(shadowMat[k0].opacity, 0.5);
      }
      // boulders in flight
      boulders.forEach((g, i) => {
        const th = THROWS[i], u = (vt - th.t) / (th.land - th.t);
        if (!P.ride || u < 0 || u > 1) { g.position.y = -200; return; }
        const a = th.from || (th.from = out.shR.clone()), b = V(th.at[0], th.at[1], th.at[2]);
        g.position.lerpVectors(a, b, u); g.position.y += Math.sin(u * Math.PI) * 42; g.rotation.set(u * 9, u * 5, 0);
      });
      // the ship: the hull's motion carries the rest of her
      shipModel.group.position.set(hull.mesh.position.x, 0, hull.mesh.position.z);
      for (const a of rideCrew) a.animate({ speed: 0, grounded: true, vy: 0, gliding: false, board: false }, dt);
      if (bellSwing > 0) { bellSwing = Math.max(0, bellSwing - dt); bell.group.rotation.z = Math.sin(bellSwing * 14) * bellSwing * 0.25; }
    });

    // ---------- sailing in (the first visit): the crew talk, he comes round the rock, two boulders, the anchor ----------
    function anchor() {
      if (P.anchored) return;
      P.anchored = true; P.ride = false; store.set('anchored', true);
      for (const h of extras) solidOnly(h, true);
      plank.show();
      sailSet.group.visible = false; sailFurled.group.visible = true; anchorRope.group.visible = true;
      for (const a of rideCrew) a.root.removeFromParent();
      kessa.show(); perdika.show(); ammi.show();
      w.player.setCheckpoint([0.6, DECK + 1.0, 6], 180);
      codex('strait');
      objective();
      brief();
    }
    async function rideIn() {
      codex('cow');
      w.after(1, async () => {
        await say('Kessa', ['The Strait of Teeth. Keep your hands in the boat; the rocks bite.', 'Ammi, stop being sick over the cargo. Be sick over the sea, it\'s used to it.']);
        await say('Ammi', 'Yes, Captain. Sorry, Captain. Urrgh.');
        await say('Perdika', 'Your mast is wrong.');
        await say('Kessa', 'My mast has crossed this sea four hundred times.');
        await say('Perdika', 'Wrongly.');
      });
      w.after(7.5, () => w.toast('Round Watch Rock comes a shape larger than the rock, wading, the water to his thighs.'));
      for (const th of THROWS) w.after(th.land / 60, () => { w.burst([th.at[0], 0.5, th.at[2]], { color: ['#ffffff', '#cfe8f0'], count: 60, speed: 11, life: 1.4 }); w.sound('splash'); w.shake(0.6); });
      w.after(THROWS[1].land / 60 + 0.6, () => say('Kessa', 'Anchor! ANCHOR! Down sail! He\'s not aiming at us; if he were aiming at us we\'d be soup.'));
      w.after(SHIP_Z / SHIP_V + 0.1, () => anchor());
    }
    // where the player stands, as far as the goal line is concerned
    w.zone({ pos: [CX, CY + 3, (TIP + NEND) / 2], size: [CW + 5, 6, TIP - NEND + 4], onEnter: () => { P.where = 'causeway'; objective(); } });
    w.zone({ pos: [ROCK[0], TOP / 2, ROCK[1]], size: [2 * (STAIR_RR + 2), TOP - 2, 2 * (STAIR_RR + 2)], onEnter: () => { P.where = 'rock'; objective(); } });
    w.zone({ pos: [ROCK[0], TOP + 3, ROCK[1]], size: [2 * ROCK_R, 6, 2 * ROCK_R], onEnter: () => { P.where = 'summit'; objective(); summitThoughts(); } });
    w.zone({ pos: [0, DECK + 2, 0], size: [6, 4, 20], onEnter: () => { P.where = 'deck'; objective(); if (talked() && !done() && P.anchored && !P.deckTalk) { P.deckTalk = true; w.after(0.4, () => backOnDeck()); } }, onExit: () => { if (P.where === 'deck') { P.where = null; objective(); } } });
    function summitThoughts() {
      if (talked() && !done() && flag('lsb.perdika.trust') && flag('lsb.has.wings') && !store.get('sneeze', false)) {
        store.set('sneeze', true); w.toast('Perdika, from the mast: "You can make it. Barely. Don\'t sneeze."');
      }
    }

    // ---------- Season 2 of the Founder's hunt (GAME.md: The Stranger): once Talos has had his answer, ring his bell the
    // shepherds' way again. He hums back from where he sits, and Echo XII glows on the causeway beside him ----------
    const s2 = () => !!flag('s2.started');
    const ECHO12 = [CX - CW / 2 + 0.9, CY + 1.4, -48];
    const echo12 = w.echo({ id: '12', pos: ECHO12, hidden: !(s2() && talked() && store.get('s2bell', false)),
      line: 'His maker never came back, so he walked his circuits for a thousand years. I swore I would never be that kind of maker. So I never really left.',
      next: 'Echo XIII: "I still come home to Junction. Look for a stranger in a grey hood by the fountain, and follow. Not too close." Junction.' });
    const answer = [];
    function answerBell(t) { // (Talos sits: the shepherds' call, after his talk)
      answer.push(t); while (answer.length > 3) answer.shift();
      if (answer.length < 3) return;
      const a = (answer[1] - answer[0]) / 60, b = (answer[2] - answer[1]) / 60;
      if (!(a >= 0.9 && a <= 2.0 && b < 0.6)) return;
      answer.length = 0; store.set('s2bell', true);
      w.after(1.2, () => {
        w.sound('stomp'); w.shake(0.4);
        w.burst([ECHO12[0], ECHO12[1], ECHO12[2]], { color: ['#ffe9a8', '#ff8a2a', '#ffffff'], count: 50, speed: 5, life: 1.2 });
        echo12.reveal();
        w.toast('Far below, Talos hums back: one long, low note. Something glows on the causeway beside him.');
      });
    }

    // ---------- the bell: two slow, one quick ----------
    let bellSwing = 0;
    function ring() {
      const t = w.ticks;
      w.sound('bell'); bellSwing = 1.2; codex('bell');
      if (!walking()) { if (talked() && s2() && !echo12.shown) answerBell(t); return; }
      if (!ready()) { if (!store.get('early', false)) { store.set('early', true); w.toast('The bell rings out over the strait. Talos walks on: this chapter follows The Low Wings.'); } return; }
      const r = P.rings; r.push(t); while (r.length > 3) r.shift();
      if (r.length < 3) return;
      const a = (r[1] - r[0]) / 60, b = (r[2] - r[1]) / 60;
      if (a >= 0.9 && a <= 2.0 && b < 0.6) { r.length = 0; return called(); }
      if ((r[2] - r[0]) / 60 < 5 && t - P.hintT > 360) {
        P.hintT = t;
        w.toast(a < 0.9 ? 'The bell clangs, flat. Talos walks on. (The carving: two slow strikes, then a quick one.)' : b >= 0.6 ? 'The bell clangs, flat. Talos walks on. (The third strike comes quick, right after the second.)' : 'The bell clangs, flat. Talos walks on. (Not so slow between the first two.)');
      }
    }
    w.interact({ pos: [BELL[0], TOP + 1, BELL[2]], radius: 2.8, label: 'Ring the bell', onUse: () => ring() });
    let strikeCd = 0;
    w.on('tick', (dt) => {
      if (strikeCd > 0) strikeCd -= dt;
      if (!w.input.attack || strikeCd > 0) return;
      const p = w.player.pos;
      if (Math.hypot(p[0] - BELL[0], p[2] - BELL[2]) < 2.6 && Math.abs(p[1] - TOP - 1) < 2.5) { strikeCd = 0.2; ring(); }
    });

    // ---------- he comes: the rule, and his question ----------
    const FACE = (() => { const q = new T.Quaternion().setFromEuler(new T.Euler(LEAN.pitch, LEAN.yaw, 0, 'YXZ')), v = V(0, 13.75 * S, 2.5 * S).applyQuaternion(q).add(LEAN.body); return [v.x, v.y, v.z]; })();
    function called() {
      P.talos = { mode: 'come', t0: w.ticks, from: null };
      for (const b of footBlocks) b.hide();
      w.sound('stomp'); w.shake(0.8);
      w.toast('The bell rings out true. Everything stops.');
      objective(); talk();
    }
    async function talk() {
      w.shot({ pos: [BELL[0] + 6, TOP + 6, BELL[2] + 9], look: [ROCK[0] - 22, TOP - 6, ROCK[1] - 6] });
      await w.wait(5);
      P.talos.mode = 'lean'; P.talos.t0 = w.ticks;
      w.burst([FACE[0], FACE[1], FACE[2]], { color: ['#ff8a2a', '#ffc46b'], count: 30, speed: 3, life: 2.2 });
      w.shot({ pos: [BELL[0] - 1.5, TOP + 2.8, BELL[2] + 4.5], look: FACE });
      await say('Talos', ['One. Two. Three.', 'That is a circuit. I have walked four hundred and eleven thousand and six. I stopped in the middle of the four hundred and eleven thousand and seventh. That is not allowed. The bell is allowed.',
        'You rang like a shepherd. You are not a shepherd. Shepherds are smaller and they smell of goat.']);
      if (flag('lsb.goat.3')) await say('Talos', '...Your ship smells of goat.');
      await say('Talos', 'Rule. No stranger passes the Teeth unbidden by the House. Show me.');
      const opts = [], keys = [];
      if (lit && w.has('lsb-house-seal')) { opts.push('The House seal.'); keys.push('seal'); }
      if (w.has('lsb-token-own')) { opts.push('This guest-token. Eumaia of Thyra gave it to me.'); keys.push('token'); }
      opts.push('I\'m asking. Please.'); keys.push('please');
      const bring = keys[await ask('Talos', 'What do you bring?', opts, opts.length - 1)];
      if (bring === 'seal') await say('Talos', ['The double axe. The House bids you. Pass.', '(A pause.) The House bid the last one too. Nine years. She sang on the deck. I liked the singing.']);
      else if (bring === 'token') {
        await say('Talos', ['A token. Broken clay. Half.', '(A long pause. Something inside him ticks.)', 'There is a rule before my rule. A guest of a hearth is not a stranger. My maker told me that one first. I had forgotten it was first. Pass, guest.']);
        w.setFlag('lsb.talos.token', true);
      } else await say('Talos', ['Please is not a seal. Please is not a token.', '(A pause.) Please is not nothing. No one has said please to me since the shepherds. Pass. Do not tell the House.']);
      store.set('bring', bring);
      await say('Talos', ['Now you are bidden, I may ask. One question. The shepherds answered my question every day. Then the shepherds went away.',
        'My maker made me with his hands. He said: walk three circuits a day. Guard. Wait. I will come back and tell you it was well done.',
        'I have walked four hundred and eleven thousand and six circuits. I have guarded. I have waited.']);
      const i = await ask('Talos', 'Is my maker coming back?', ['No. He\'s gone. Nobody is coming back to tell you.', 'Yes. Keep walking. He\'ll come.', 'I don\'t know.'], 2);
      const answer = ['truth', 'lie', 'unsure'][i];
      if (!flag('lsb.talos')) w.setFlag('lsb.talos', answer); // (the first answer is the one he keeps)
      if (answer === 'truth') await say('Talos', ['...', 'One. Two. Three. (Very quietly.) That is how many times I counted, after the shepherds stopped answering. Then I stopped counting the answers.',
        'If no one is coming, then no one can tell me it was well done. Then I must decide if it was well done.', 'I will think about it for a circuit. Perhaps two. Thank you, guest. It is heavy, and it is mine.']);
      else if (answer === 'lie') await say('Talos', ['Yes. (The eyes brighten.) Yes. Then I walk. Three circuits. Guard. Wait.', 'You have made me very happy. I will walk well. I will walk until he comes.']);
      else await say('Talos', ['No one knows. That is the answer the shepherds gave.', 'Then I will walk, and I will wonder. Wondering is heavier than bronze. I did not know that until now.']);
      await say('Talos', ['One more thing is allowed, because you said a true thing or a kind thing, and I do not know which is heavier.',
        'Nine years, a new voice goes up the mountain. The old voice goes down. I carry them down sometimes, from the Mouth to the House. They are very light. They do not say anything.',
        'The mountain hums now. I hum back. We are both hot inside. I do not think the mountain is waiting for anyone.', 'Pass, guest. Mind my feet.']);
      store.set('talked', true);
      codex('talos2'); codex('ichor'); codex('argonauts');
      if (!flag('title.lsb.talos')) { w.setFlag('title.lsb.talos', true); w.toast('Title earned: Who Spoke with Talos', 'item'); }
      P.talos = { mode: 'leave', t0: w.ticks, from: null };
      w.shot(null);
      w.shake(0.6); w.sound('splash');
      w.after(6, () => { P.talos = { mode: 'sit', t0: w.ticks, from: null }; });
      objective(); summitThoughts();
    }

    // ---------- on deck ----------
    async function brief() { // 3.1, once she is anchored
      if (store.get('briefed', false) || !ready() || P.briefing) return;
      P.briefing = true;
      await say('Kessa', ['He wants to see something. He always wants to see something.', 'Somebody has to go up Watch Rock and ring his bell, two slow, one quick, the way the shepherds called him. Then he\'ll kneel and look, and if he likes what he sees, he lets you by.',
        lit && w.has('lsb-house-seal') ? 'You\'ve got the House seal. Wave it at him.' : 'You\'ve got no seal, so you\'d better have a face he likes.']);
      codex('alashiya');
      for (;;) {
        const i = await ask('Kessa', 'Well? I\'m not going. I\'m the captain. Captains stay with the cow.', ['I\'ll go.', 'Why does a giant guard a strait?'], 0);
        if (i === 0) break;
        await say('Kessa', 'Because someone told him to, a long time ago, and nobody has told him to stop. That\'s most of history, if you ask me.');
      }
      await say('Kessa', 'Good. Cross the causeway between his feet. Watch the shadows. And mind the scree; it goes when he stamps.');
      if (flag('lsb.perdika.trust')) { await say('Perdika', 'I\'ll go up the mast and watch you. If you fall, I\'ll shout something useful.'); perdika.setPos(PERDIKA_YARD, -90); }
      else { await say('Perdika', 'I\'m not watching. I\'ll be in the hold, counting feathers.'); perdika.setPos(PERDIKA_HOLD, 160); }
      store.set('briefed', true); P.briefing = false;
      objective();
    }
    async function talkKessa() {
      kessa.face('player');
      if (!ready()) return say('Kessa', 'You\'re not on my passenger list. (This chapter follows The Low Wings: start it from Junction\'s Bronze portal.)');
      if (!store.get('briefed', false)) return brief();
      if (done()) return say('Kessa', ['Back in the strait? He\'s sitting. Hasn\'t walked a step since you talked to him.', 'Four hundred crossings and I never saw that. I\'ve started counting them again.']);
      if (talked()) return backOnDeck();
      codex('alashiya');
      return say('Kessa', P.where === 'deck' && store.get('stamped', 0) ? 'Between his feet, not under them. Watch the shadows.' : 'Watch Rock, the bell at the top. Two slow, one quick. I\'ll be here. With the cow.');
    }
    async function backOnDeck() { // 3.5, and away
      if (P.sailing) return;
      if (!store.get('kessaAsked', false)) {
        store.set('kessaAsked', true);
        await say('Kessa', 'He knelt. I\'ve crossed this strait four hundred times, and I\'ve never seen him kneel. What did you say to him?');
        const i = await ask('Kessa', 'Well?', ['The truth.', 'That\'s between us.'], 1);
        await say('Kessa', i === 0 ? 'Brave. Expensive, usually.' : 'Fair. Every captain has a list of things that are between her and the sea.');
        const ans = flag('lsb.talos');
        if (ans === 'truth') await say('Perdika', 'I saw him sit down after. Like an old man on a step. I\'ve never seen bronze look tired.');
        else if (ans === 'lie') await say('Perdika', (flag('lsb.perdika.trust') ? ['That was kind. I think. Ask me again when I\'ve decided.'] : []).concat(['He sat down with his eyes blazing like a forge. Is that good? It looks good. It looks like the opposite of good.']));
        else if (ans === 'unsure') await say('Perdika', 'He keeps looking out to sea. Like someone waiting for a sail.');
      }
      const i = await ask('Kessa', 'Up anchor? Kerynthos by dark.', ['Up anchor.', 'Not yet.'], 1);
      if (i !== 0) return say('Kessa', 'Not yet. Story of my life.');
      return sail();
    }
    const DUSK = { skyTop: '#1b1840', skyHorizon: '#d8664a', skyBottom: '#3a2a52', skySharp: 0.5, sunDir: [-0.9, 0.06, -0.3], sunColor: '#ff9a5a', sunLight: '#ff9f70', sunSize: 3.6,
      sunIntensity: 1.3, hemiSky: '#7a6aa8', hemiGround: '#5a3a3a', hemiIntensity: 1.0, fog: [200, 900], fogColor: '#7a4a5a', stars: 0.6, bloom: 0.55, exposure: 1.05 };
    async function sail() {
      P.sailing = true;
      w.setFlag('lsb.ch', Math.max(3, flag('lsb.ch') || 0));
      w.setTheme(DUSK, 8);
      w.player.setPos([0.6, DECK + 1.0, 6], 180);
      w.shot({ pos: [7, 8, 24], look: [0, 4, -30] });
      await say('Kessa', 'Up anchor. Kerynthos by dark. Ammi, if you\'re sick on the House\'s wings I\'ll sell you to the House.');
      P.lights = true; for (const m of palaceLights) m.show();
      w.shot({ pos: [-1.5, DECK + 4, -12], look: [40, 80, -722] });
      await w.wait(3);
      await say('The strait', '(The Teeth fall behind. The palace comes up out of the dark on its hill, red columns gold in the torchlight, the horns of consecration black against the stars.)');
      if (!lit) {
        await say('A dock-hand', '(Kerynthos harbour, as the ship ties up.) You\'re late, Cow! The Labrys came in at noon with a prisoner, if you can believe it. An old woman from Thyra with a goat-smell and a mouth on her. Shouted at the Axe-Bearers all the way up the hill.');
        await say('Kessa', '(Quietly.) That\'s Eumaia. They\'ll have put her in the guest rooms. The House never calls anything a prison.');
      }
      w.sound('bull'); w.shake(0.5);
      await w.wait(2);
      await say('Ammi', 'What\'s that?');
      await say('Kessa', 'The Bull. Under the House. Don\'t ask about the Bull.');
      w.sound('win'); w.banner('End of chapter three', 'The Last Summer of Bronze continues in The House of the Double Axe.');
      await w.wait(6);
      w.travel('hub');
    }
    async function talkPerdika() {
      perdika.face('player');
      if (!store.get('briefed', false)) return say('Perdika', 'The mast is wrong. I\'ve said so. Nobody listens to the wingmaker until the wings are on.');
      if (talked()) return say('Perdika', { truth: 'He sat down like an old man on a step. I\'ve never seen bronze look tired.', lie: 'Look at his eyes. Like a forge with the bellows going. You did that.', unsure: 'He keeps looking out to sea. Like someone waiting for a sail.' }[flag('lsb.talos')] || 'Wings, giant, bell. You have a strange idea of a quiet afternoon.');
      if (flag('lsb.perdika.trust')) return say('Perdika', flag('lsb.has.wings') ? 'From up here I can see everything. Between his feet, not under them. And from the top you could glide back to us. Barely.' : 'From up here I can see everything. Between his feet, not under them.');
      return say('Perdika', 'Forty-one, forty-two... You made me lose count. Go and ring your bell.');
    }
    async function talkAmmi() {
      ammi.face('player');
      if (flag('lsb.kind.3')) return say('Ammi', 'Thanks again. I\'m only a little bit sick now. Mostly a lot.');
      if (store.get('cup', false)) {
        store.set('cup', false); w.setFlag('lsb.kind.3', true); w.sound('win');
        return say('Ammi', 'Thanks. You\'re nice for a god.');
      }
      store.set('ammiAsked', true);
      await say('Ammi', 'Is the big man going to step on us? I\'d rather he didn\'t. I\'d rather nothing happened ever. Could I have some water?');
      objective();
    }
    w.interact({ pos: [-1.8, DECK + 1, 8.2], radius: 1.8, label: 'The water jar', onUse: () => {
      if (!P.anchored) return;
      if (!store.get('ammiAsked', false) || flag('lsb.kind.3')) return w.toast('A jar of water at the stern, for the crew.');
      if (store.get('cup', false)) return w.toast('You already have a cup of water for Ammi.');
      store.set('cup', true); w.sound('pickup'); w.toast('You fill a cup at the jar. Ammi is at the port rail.'); objective();
    } });
    // Old Horn on the yard
    w.zone({ pos: [GOAT_AT[0], GOAT_AT[1] + 1, GOAT_AT[2]], radius: 2.2, onEnter: () => {
      if (flag('lsb.goat.3') || !P.anchored) return;
      w.setFlag('lsb.goat.3', true); w.sound('win');
      say('Old Horn', '(Old Horn is balanced on the yard, chewing the sail\'s rope. Kessa will not be pleased. Kessa has not noticed.)');
    } });

    // ---------- tin-drops: on the Teeth, in the niches, up the stair, on the summit ----------
    const tins = () => store.get('tin', []);
    const TIN = [[TEETH[1][0], TEETH[1][3] + 0.6, TEETH[1][1]], [TEETH[3][0], TEETH[3][3] + 0.6, TEETH[3][1]], [TEETH[5][0], TEETH[5][3] + 0.6, TEETH[5][1]],
      ...NICHES.map((z) => [CX + CW / 2 + 1.0, CY + 0.6, z]), [CX - 1.6, CY + 0.6, NEND - 3],
      ...[22, 40, 55].map((i) => [treads[i][0], treads[i][1] + 0.6, treads[i][2]]),
      [BELL[0] - 6, TOP + 0.6, BELL[2] - 4], [BELL[0] + 5, TOP + 0.6, BELL[2] - 6]];
    const bobbers = [];
    TIN.forEach((p, i) => {
      if (tins().includes(i)) return;
      const m = w.model({ pos: p, parts: [{ s: 'sphere', r: 0.16, pos: [0, 0, 0], color: C.tin, glow: 1.3, metal: 0.5 }, { s: 'cone', r: 0.11, h: 0.24, pos: [0, 0.18, 0], color: C.tin, glow: 1.3, metal: 0.5 }] });
      const z = w.zone({ pos: p, radius: 1.3, onEnter: () => {
        if (!z.enabled) return; z.enabled = false; m.group.visible = false;
        const got = tins().concat([i]); store.set('tin', got);
        w.sound('coin'); w.toast(`Tin-drop: ${got.length} of ${TIN.length}`);
      } });
      bobbers.push({ m, base: p[1] });
    });
    w.on('frame', (dt, t) => { for (const b of bobbers) if (b.m.group.visible) { b.m.group.position.y = b.base + Math.sin(t * 2 + b.base) * 0.12; b.m.group.rotation.y = t * 1.2; } });

    // ---------- the goal line: one next step at a time ----------
    function objective() {
      if (!ready()) return w.objective('This chapter follows The Low Wings: start it from Junction\'s Bronze portal.');
      if (P.ride) return w.objective('The Strait of Teeth. Hold on to something.');
      if (done()) return w.objective('Chapter three is done. Talos sits by his causeway, watching the sunset.');
      const kp = kessa.pos, kAt = [kp.x !== undefined ? kp.x : kp[0], DECK + 2.4, kp.z !== undefined ? kp.z : kp[2]];
      if (talked()) return P.where === 'deck' ? w.objective('Talk to Kessa: Kerynthos by dark.', { at: kAt }) : w.objective(flag('lsb.has.wings') ? 'Back to the Patient Cow: glide from the summit, or walk the causeway home.' : 'Back to the Patient Cow, down the stair and along the causeway.', { at: [0, DECK + 3, 0] });
      if (!store.get('briefed', false)) return w.objective('Talk to Kessa at the steering oar.', { at: kAt });
      if (P.talos.mode === 'come' || P.talos.mode === 'lean') return w.objective('Talos has come to the rock. He is listening.');
      if (P.where === 'summit') return w.objective('Ring the Calling Bell the way the shepherds did: two slow, one quick.', { at: [BELL[0], TOP + 2.4, BELL[2]] });
      if (P.where === 'rock') return w.objective('Climb Watch Rock. Its cracked steps drop when he stamps.', { at: [BELL[0], TOP + 3, BELL[2]] });
      if (P.where === 'causeway') return w.objective('Cross the causeway between his footfalls: a footstone darkens just before his foot lands on it.', { at: [CX, CY + 2, NEND - 3] });
      if (store.get('ammiAsked', false) && !flag('lsb.kind.3') && P.where === 'deck') return w.objective(store.get('cup', false) ? 'Bring Ammi the water, at the port rail.' : 'Fill a cup at the water jar, at the stern, for Ammi.', { at: store.get('cup', false) ? [-2.1, DECK + 2.4, -3.2] : [-1.8, DECK + 2.4, 8.2] });
      return w.objective('Hop the Teeth to Talos\'s causeway.', { at: [CX, CY + 2, TIP + 1] });
    }
    w.on('pickup', () => objective());

    // ---------- arriving and leaving ----------
    w.on('enter', () => {
      lendWings();
      if (P.ride) { w.player.setPos([-0.8, DECK + 1.2, SHIP_Z - 6.5], 180); rideIn(); }
      else if (w.from !== 'hub') w.player.setPos([0.6, DECK + 1.0, 6], 180);
      if (P.anchored && ready()) { codex('strait'); w.player.setCheckpoint(w.from === 'hub' ? [LANDING[0] + 1.6, 2.4, LANDING[1] - 1.8] : [0.6, DECK + 1.0, 6], 180); }
      if (!P.ride && ready() && !store.get('briefed', false)) w.after(1.2, () => brief());
      objective();
    });
    // a splash while she sails in puts you back on her deck
    w.on('respawn', () => { if (P.ride) w.player.setPos([-0.8, DECK + 1.2, shipAt() - 6.5], 180); });
    w.on('leave', () => {
      if (w.has('lsb-low-wings')) {
        w.take('lsb-low-wings');
        const prev = store.get('prevBack', null);
        if (prev && w.has(prev)) w.equip(prev);
        store.set('prevBack', null);
      }
    });
    w.scene.userData.strait = { P, STONES, SCREE, NICHES, CX, CW, CY, TIP, NEND, ROCK, ROCK_R, TOP, BELL, SLAB, TEETH, LANDING, treads, CRACKED, cracked, scree, footBlocks, TIN, GOAT_AT, PERDIKA_YARD, RUNGS, FOOTWAY,
      kessa, perdika, ammi, STEP, BEAT, T0, PLAN, PLANT, DROP, SCREE_DOWN, CRACK_DOWN, stepOf, stampTick, stoneOfStep, nextStamp, plantedAt, shipAt, walkPose, KB };
  },
};
