// What every key, button and touch does: the Controls tab and the hint line at the bottom of the screen.
// Keys are looked up in input.js's own maps, so the help says what the keys really do. Key names follow the
// player's keyboard layout where the browser can tell (on a French keyboard, "move" shows Z/S, not W/S).
import { KEYMAP, UIKEYS, PADMAP, PADUI } from './input.js';

let layout = null;
// the browser's layout map (Chromium; elsewhere, and inside frames that may not ask, the US names are used)
export async function loadLayout() {
  try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) layout = await navigator.keyboard.getLayoutMap(); } catch (e) { layout = null; }
  return !!layout;
}
const NAMED = { Space: 'Space', Escape: 'Esc', Enter: 'Enter', Tab: 'Tab', ShiftLeft: 'Shift', ShiftRight: 'Shift', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
export function keyName(code) {
  if (NAMED[code]) return NAMED[code];
  const l = layout && layout.get(code);
  if (l && l.trim()) return l.toUpperCase();
  return code.replace(/^Key|^Digit/, '');
}
// the key codes that do an action (game actions from KEYMAP, menu keys from UIKEYS), Shift and Tab only once
const codesFor = (act) => {
  const out = Object.keys(KEYMAP).filter((c) => KEYMAP[c] === act).concat(Object.keys(UIKEYS).filter((c) => UIKEYS[c] === act));
  return out.filter((c) => c !== 'ShiftRight');
};
const keys = (...acts) => [...new Set(acts.flatMap(codesFor).map(keyName))];
const PADNAMES = {
  xbox: { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 7: 'RT', 8: 'Back', 9: 'Start' },
  ps: { 0: '✕', 1: '○', 2: '□', 3: '△', 4: 'L1', 5: 'R1', 7: 'R2', 8: 'Share', 9: 'Options' },
};
const pad = (act, kind) => {
  const N = PADNAMES[kind] || PADNAMES.xbox;
  const i = Object.keys(PADMAP).find((b) => PADMAP[b].includes(act)) ?? Object.keys(PADUI).find((b) => PADUI[b] === act);
  return i == null ? [] : [N[i]];
};

// One table per way of playing: [what it does, [keys or buttons]]. 'arena' is the top-down scheme (Spire Clash).
export function controlRows(device, scheme, padKind = 'xbox') {
  const arena = scheme === 'topdown';
  if (device === 'pad') {
    const p = (a) => pad(a, padKind);
    return arena ? [
      ['Move', ['Left stick']],
      ['Attack: stand still near an enemy', []],
      ['Bolt', p('sl')], ['Shield', p('sr')], ['Starfall (from level 3)', p('ab3')],
      ['Dash', p('jump')], ['Recall to your fountain (stand still)', p('board')],
      ['Heal and buy upgrades: stand in your fountain', []],
      ['Items', p('inv')], ['Worlds', p('map')], ['Menu', p('menu')],
    ] : [
      ['Move', ['Left stick']], ['Camera', ['Right stick']],
      ['Jump (hold in the air to glide, with a glider)', p('jump')],
      ['Use, talk, pick up', p('use')], ['Ride your board', p('board')], ['Strike (with a blade)', p('atk')],
      ['Items', p('inv')], ['Worlds', p('map')], ['Menu', p('menu')],
    ];
  }
  if (device === 'touch') {
    return arena ? [
      ['Move', ['Drag on the left side']],
      ['Attack: stand still near an enemy', []],
      ['Bolt, Shield, Starfall', ['Q', 'E', 'R']], ['Dash', ['DASH']], ['Recall to your fountain', ['RECALL']],
      ['Heal and buy upgrades: stand in your fountain', []],
      ['Players here: mute or block', ['Tap the player count, top left']],
      ['This week\'s challenge and the Leaderboards', ['Tap the ★ Weekly line', 'or Menu, You']], ['Menu', ['☰']],
    ] : [
      ['Move', ['Drag on the left side']], ['Look around', ['Drag on the right side']],
      ['Jump (hold in the air to glide, with a glider)', ['JUMP']], ['Use, talk, pick up', ['USE', 'or tap the prompt']],
      ['Ride your board', ['BOARD']], ['Strike (with a blade)', ['STRIKE']],
      ['Items, worlds, chat', ['ITEMS', 'MAP', 'CHAT']], ['Talk (once voice chat is on)', ['TALK']],
      ['Players here: mute or block', ['Tap the player count, top left']],
      ['This week\'s challenge and the Leaderboards', ['Tap the ★ Weekly line', 'or Menu, You']], ['Menu', ['☰']],
    ];
  }
  const common = [
    ['Chat (quick phrases: click one, or 1–8 with Quick chat only)', keys('chat')], ['Talk (voice chat, hold)', [keyName('KeyV')]],
    ['Players here: mute or block', keys('players')],
    ['Items', keys('inv')], ['Worlds', keys('map')], ['Controls', keys('help')], ['Menu', keys('menu')],
  ];
  return arena ? [
    ['Move', [...keys('f', 'tl', 'b', 'tr'), 'or arrows']],
    ['Attack: stand still near an enemy', []],
    ['Bolt', keys('sl')], ['Shield', keys('sr')], ['Starfall (from level 3)', keys('ab3')],
    ['Dash', keys('jump')], ['Recall to your fountain (stand still)', keys('board')],
    ['Heal and buy upgrades: stand in your fountain', []],
    ['Zoom', ['Mouse wheel']],
    ...common,
  ] : [
    ['Move forward, back', keys('f', 'b')], ['Turn', keys('tl', 'tr')], ['Step sideways', keys('sl', 'sr')],
    ['Jump (hold in the air to glide, with a glider)', keys('jump')], ['Walk slowly (hold)', keys('walk')],
    ['Use, talk, pick up', keys('use')], ['Strike (with a blade)', keys('atk')],
    ['Ride your board: then turn to steer, back to brake', keys('board')],
    ['Turn and tilt the camera', keys('cl', 'cr', 'cu', 'cd')], ['Camera distance', [...keys('camera'), 'Mouse wheel']],
    ['Leaderboards and this week\'s challenge', keys('records')],
    ...common,
  ];
}

// the short line at the bottom of the screen
export function hintLine(device, scheme, padKind = 'xbox') {
  const arena = scheme === 'topdown';
  if (device === 'pad') {
    const p = (a) => pad(a, padKind)[0];
    return arena ? `Left stick move · ${p('sl')} bolt · ${p('sr')} shield · ${p('ab3')} starfall · ${p('jump')} dash · ${p('board')} recall · ${p('menu')} menu`
      : `Left stick move · right stick camera · ${p('jump')} jump · ${p('use')} use · ${p('board')} board · ${p('atk')} strike · ${p('menu')} menu`;
  }
  const k = (...a) => keys(...a).join('/');
  return arena ? `${keys('f', 'tl', 'b', 'tr').join('')} move · ${k('sl')} bolt · ${k('sr')} shield · ${k('ab3')} starfall · Space dash · ${k('board')} recall · ${k('help')} controls · Esc menu`
    : `${k('f', 'b')} move · ${k('tl', 'tr')} turn · ${k('sl', 'sr')} strafe · Space jump · ${k('use')} use · arrows camera · ${k('help')} controls · Esc menu`;
}
