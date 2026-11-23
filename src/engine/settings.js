// The player's settings: their defaults, older saves brought up to date, and putting them into effect.
// Sound, camera, view and hints only: nothing here changes a tick, so none of it is part of the pinned engine or of
// a run's replay. (The profile keeps them in profile.data.settings; profile.js is in the engine, so the defaults for
// settings added since live here.)
export const DEFAULTS = {
  quality: 'auto',
  volume: 1, musicVol: 1, sfxVol: 1, voiceVol: 1, // 0..1
  bgSound: false, // keep music and effects playing while the game's tab is in the background
  sens: 1, // looking around with the mouse or a finger
  camSpeed: 1, // turning the camera with the arrow keys or a gamepad's right stick
  invertY: false, invertX: false,
  fov: 62, speedFov: true, // the view's width, and widening it at speed
  shake: true,
  fps: false, hints: true,
  chat: 'on', // 'on' (typed chat, filtered), 'quick' (quick phrases only) or 'off' (safety.js)
  filter: true, // hide bad language in other players' chat, names and level names
};
export const QUALITY = {
  auto: 'Starts at High on computers and Medium on phones, and steps down if the game stutters.',
  ultra: 'High, plus soft shadows, shading in corners and reflections. For fast computers.',
  high: 'Shadows, glowing lights and a sharp picture.',
  medium: 'Softer shadows, no glow, a little less sharp. Easier on phones and laptops.',
  low: 'No shadows: the fastest.',
};

// fill in what an older or partial save lacks (in place). Sound used to be two on/off switches.
export function normalise(s) {
  if (s.sfxVol == null) s.sfxVol = s.sfx === false ? 0 : 1;
  if (s.musicVol == null) s.musicVol = s.music === false ? 0 : 1;
  // one sensitivity used to turn the camera for every device: keep its feel for the keys and sticks too
  if (s.camSpeed == null && s.sens != null && s.sens !== 1) s.camSpeed = s.sens;
  for (const [k, v] of Object.entries(DEFAULTS)) if (s[k] == null || typeof s[k] !== typeof v) s[k] = v;
  for (const k of ['volume', 'musicVol', 'sfxVol', 'voiceVol']) s[k] = clamp(s[k], 0, 1);
  s.sens = clamp(s.sens, 0.2, 3); s.camSpeed = clamp(s.camSpeed, 0.2, 3); s.fov = clamp(Math.round(s.fov), 50, 90);
  if (!QUALITY[s.quality]) s.quality = 'auto';
  if (!['on', 'quick', 'off'].includes(s.chat)) s.chat = 'on';
  return s;
}
const clamp = (v, a, b) => (isFinite(+v) ? Math.min(b, Math.max(a, +v)) : a);

// each settings tab's own settings, for its "back to defaults" (the online, voice and backup choices are never reset)
export const GROUPS = {
  graphics: ['quality', 'fov', 'speedFov', 'shake', 'fps'],
  sound: ['volume', 'musicVol', 'sfxVol', 'voiceVol', 'bgSound'],
  controls: ['sens', 'camSpeed', 'invertY', 'invertX', 'hints', 'mouseLook', 'lock'],
};
const EXTRA = { mouseLook: false, lock: true };
export function resetSettings(s, group) {
  for (const k of GROUPS[group] || []) s[k] = k in DEFAULTS ? DEFAULTS[k] : EXTRA[k];
  return s;
}

// put the settings into effect. E is the game (main.js); safe to call again after any change.
export function applySettings(E) {
  const s = normalise(E.profile.data.settings);
  E.audio.setVolumes({ master: s.volume, music: s.musicVol, sfx: s.sfxVol, voice: s.voiceVol });
  E.audio.setBackground(document.visibilityState === 'hidden', s.bgSound);
  Object.assign(E.input.look, { mouse: s.sens, touch: s.sens, keys: s.camSpeed, pad: s.camSpeed, invertX: s.invertX, invertY: s.invertY });
  E.input.mouseLook = !!s.mouseLook;
  E.input.usePointerLock = s.lock !== false;
  document.body.classList.toggle('no-hints', !s.hints);
  const fps = document.getElementById('fps'); if (fps) fps.classList.toggle('hidden', !s.fps);
  return s;
}

// The view's width each frame, after the camera rig has placed the camera: the player's field of view, widened at
// speed as the rig does (unless switched off). Arena worlds frame their field themselves and are left alone.
export function applyView(E) {
  const rig = E.camRig, cam = E.camera, s = E.profile.data.settings;
  if (!rig || rig.mode) return;
  const want = s.fov + (s.speedFov ? Math.max(0, rig.fov - 62) : 0);
  if (Math.abs(cam.fov - want) > 0.01) { cam.fov = want; cam.updateProjectionMatrix(); }
}
