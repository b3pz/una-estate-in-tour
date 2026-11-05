// Controlli in stile console portatile: croce direzionale, A, B, START e SELECT.
// I tasti sono rimappabili; il joystick usa la mappatura standard dei browser.
export const ACTIONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
export const ACTION_NAMES = {
 up: 'Su',
 down: 'Giù',
 left: 'Sinistra',
 right: 'Destra',
 a: 'A · conferma, parla',
 b: 'B · indietro, bici',
 start: 'START · telefono, pausa',
 select: 'SELECT · mappa'
};
export const DEFAULT_KEYS = {
 up: 'arrowup',
 down: 'arrowdown',
 left: 'arrowleft',
 right: 'arrowright',
 a: 'a',
 b: 's',
 start: 'enter',
 select: 'shift'
};
// Tasti di riserva sempre attivi, se non sono già usati da un'altra azione.
const SPARE = { z: 'a', ' ': 'a', x: 'b', backspace: 'b', escape: 'b' };

export function keyName(key) {
 const k = String(key || '').toLowerCase();
 return ({ arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', enter: 'Invio', shift: 'Maiusc', ' ': 'Spazio', escape: 'Esc', backspace: '⌫', control: 'Ctrl', alt: 'Alt', tab: 'Tab' })[k] || k.toUpperCase();
}

export function validKeys(keys) {
 const out = { ...DEFAULT_KEYS };
 if (keys && typeof keys === 'object')
  for (const a of ACTIONS)
   if (typeof keys[a] === 'string' && keys[a].length && keys[a].length < 20) out[a] = keys[a].toLowerCase();
 return out;
}

export function actionFor(key, keys = DEFAULT_KEYS) {
 const k = String(key || '').toLowerCase();
 for (const a of ACTIONS)
  if (keys[a] === k) return a;
 const spare = SPARE[k];
 return spare && !Object.values(keys).includes(k) ? spare : null;
}

// Joystick: restituisce le azioni premute o rilasciate dall'ultimo controllo.
const held = new Set();
let repeatAt = {};
export function pollGamepad(now = performance.now()) {
 const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
 const pad = pads[0];
 const pressed = new Set();
 if (pad) {
  const b = i => pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .5);
  const ax = pad.axes[0] || 0,
   ay = pad.axes[1] || 0;
  if (b(12) || ay < -.5) pressed.add('up');
  if (b(13) || ay > .5) pressed.add('down');
  if (b(14) || ax < -.5) pressed.add('left');
  if (b(15) || ax > .5) pressed.add('right');
  if (b(0)) pressed.add('a');
  if (b(1)) pressed.add('b');
  if (b(9)) pressed.add('start');
  if (b(8)) pressed.add('select');
 }
 const events = [];
 for (const a of pressed)
  if (!held.has(a)) {
   events.push({ action: a, down: true });
   repeatAt[a] = now + 380;
  } else if (['up', 'down', 'left', 'right'].includes(a) && now > repeatAt[a]) {
   events.push({ action: a, down: true, repeat: true });
   repeatAt[a] = now + 140;
  }
 for (const a of held)
  if (!pressed.has(a)) events.push({ action: a, down: false });
 held.clear();
 pressed.forEach(a => held.add(a));
 return { events, connected: !!pad, name: pad?.id || '' };
}

// Navigazione con la croce tra i pulsanti di una finestra: sceglie il più vicino nella direzione.
export function moveFocus(root, dir) {
 const items = [...root.querySelectorAll('button:not([disabled]), [tabindex="0"], input, select')].filter(el => el.offsetParent !== null && !el.closest('[hidden]'));
 if (!items.length) return null;
 const current = items.includes(document.activeElement) ? document.activeElement : null;
 if (!current) {
  items[0].focus();
  return items[0];
 }
 const r = current.getBoundingClientRect(),
  cx = r.left + r.width / 2,
  cy = r.top + r.height / 2;
 const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } [dir];
 let best = null,
  bestScore = Infinity;
 for (const el of items) {
  if (el === current) continue;
  const q = el.getBoundingClientRect(),
   dx = q.left + q.width / 2 - cx,
   dy = q.top + q.height / 2 - cy;
  const along = dx * v[0] + dy * v[1];
  if (along <= 4) continue;
  const across = Math.abs(dx * v[1] - dy * v[0]);
  const score = along + across * 2.2;
  if (score < bestScore) {
   bestScore = score;
   best = el;
  }
 }
 if (!best) {
  // In fondo alla lista si riparte dall'altro capo, come nei menu delle console.
  const i = items.indexOf(current),
   forward = dir === 'down' || dir === 'right';
  best = items[(i + (forward ? 1 : -1) + items.length) % items.length];
 }
 best.focus();
 best.scrollIntoView?.({ block: 'nearest' });
 return best;
}
