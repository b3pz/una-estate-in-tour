import {
 drawCharacter
} from './world.js';
import {
 drawSprite
} from './assets.js';
import {
 CITIES,
 INSTRUMENTS
} from './core.js';
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const PALETTES = {
 Blues: ['#111f32', '#427b9d', '#dbab70'],
 Rock: ['#21161d', '#c15d4d', '#edc578'],
 Pop: ['#29223b', '#c381ac', '#f2dab0'],
 Funk: ['#202b26', '#82ae75', '#e1ac64'],
 Metal: ['#171e2a', '#7e91bc', '#d9b4b1'],
 Latino: ['#292320', '#ce9865', '#b8ce80'],
 Reggae: ['#142d2c', '#6aaa8e', '#edcc85'],
 Jazz: ['#111c32', '#7789bd', '#d8b27a']
};
export function concertGeometry(W, H, lanes) {
 const bottom = Math.min(360, W * .85),
  top = bottom * .45,
  hit = H * .83,
  horizon = H * .43;
 return {
  bottom,
  top,
  hit,
  horizon,
  lanes,
  cx: W / 2
 };
}
export function notePosition(g, beatsAhead) {
 const q = Math.max(0, Math.min(1, 1 - beatsAhead / 5));
 const depth = q * q;
 return {
  y: g.horizon + (g.hit - g.horizon) * depth,
  width: g.top + (g.bottom - g.top) * depth,
  depth
 };
}

function box(ctx, x, y, w, h, r, fill, stroke) {
 ctx.beginPath();
 ctx.roundRect(x, y, w, h, r);
 ctx.fillStyle = fill;
 ctx.fill();
 if (stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
 }
}

function ellipse(ctx, x, y, rx, ry, fill) {
 ctx.beginPath();
 ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
 ctx.fillStyle = fill;
 ctx.fill();
}

function words(ctx, s, x, y, size = 12, color = '#fff0d0', align = 'center') {
 ctx.font = `${size}px Georgia,serif`;
 ctx.textAlign = align;
 ctx.fillStyle = color;
 ctx.fillText(s, x, y);
}

function poly(ctx, pts, fill, stroke) {
 ctx.beginPath();
 pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
 ctx.closePath();
 ctx.fillStyle = fill;
 ctx.fill();
 if (stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
 }
}

function musician(ctx, x, y, who, instrument, t, energy, player) {
 const bounce = reduced ? 0 : Math.sin(t * 6 + who) * energy * 2;
 ctx.save();
 ctx.translate(x, y + bounce);
 if (player) ellipse(ctx, 0, 3, 35, 9, '#f8db9a35');
 ctx.scale(1.25, 1.25);
 drawCharacter(ctx, 0, 0, {
  variant: who,
  facing: 'south'
 });
 if (instrument === 'drums') drawSprite(ctx, 'band', 3, 2, 0, 13, 78, 51);
 else {
  ctx.save();
  ctx.translate(4, -12);
  ctx.rotate((instrument === 'guitar' ? -.55 : -.35) + (reduced ? 0 : Math.sin(t * 7 + who) * .04));
  drawSprite(ctx, 'band', 3, instrument === 'guitar' ? 0 : 1, 0, 16, 47, 52);
  ctx.restore();
 }
 ctx.restore();
}

// Scenografia sullo sfondo: un segno riconoscibile per ogni città e occasione.
function backdrop(ctx, scene, W, H, t, accent, gold) {
 const y0 = H * .14, y1 = H * .34, sil = accent + '66', mid = accent + '33';
 const sway = k => reduced ? 0 : Math.sin(t * k);
 ctx.save();
 if (scene === 'Blues') {
  ellipse(ctx, W * .82, y0 + 10, 16, 16, '#e9dcb066');
  box(ctx, 0, y1 - 18, W, 18, 0, '#20445a');
  for (let i = 0; i < 8; i++) box(ctx, (i * W / 8 + (reduced ? 0 : t * 20)) % W, y1 - 10, 26, 2, 1, '#6c9cb855');
  ctx.strokeStyle = sil; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W * .5, y1 + 30, W * .22, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  for (let i = -3; i <= 3; i++) box(ctx, W * .5 + i * W * .05, y1 - 26 + Math.abs(i) * 3, 3, 24 - Math.abs(i) * 3, 1, sil);
 } else if (scene === 'Rock') {
  for (let i = 0; i < 5; i++) { const x = W * (.05 + i * .2); box(ctx, x, y0 + 30, W * .15, y1 - y0, 2, sil); box(ctx, x + W * .1, y0 - 5, 10, 40, 1, sil); ellipse(ctx, x + W * .105 + sway(.7 + i) * 6, y0 - 14, 12, 7, '#8a7a7a33'); for (let j = 0; j < 3; j++) box(ctx, x + 8 + j * W * .04, y0 + 45, 10, 8, 1, '#e0a05a55'); }
 } else if (scene === 'Pop') {
  for (let i = 0; i < 6; i++) { const x = W * (.08 + i * .17); ctx.strokeStyle = '#d8b9a044'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y1, W * .06, Math.PI, 0); ctx.stroke(); for (let j = 0; j < 5; j++) ellipse(ctx, x - W * .05 + j * W * .025, y1 - W * .045 - Math.sin(j / 4 * Math.PI) * 6, 3, 3, ['#e48ab4aa', '#f3d58aaa', '#ffffffaa'][j % 3]); }
 } else if (scene === 'Funk') {
  for (let i = 0; i < 4; i++) { const x = W * (.04 + i * .25); for (let j = 0; j < 6; j++) poly(ctx, [[x + j * W * .033, y0 + 30], [x + (j + 1) * W * .033, y0 + 30], [x + (j + .5) * W * .033, y0 + 48]], j % 2 ? '#d58f4b88' : '#efe0b688'); box(ctx, x, y0 + 48, W * .2, y1 - y0 - 48, 2, sil); }
  ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y0 + 8); ctx.quadraticCurveTo(W / 2, y0 + 30, W, y0 + 8); ctx.stroke();
  for (let i = 0; i < 14; i++) poly(ctx, [[i * W / 14, y0 + 10 + Math.sin(i / 13 * Math.PI) * 18], [i * W / 14 + 12, y0 + 10 + Math.sin(i / 13 * Math.PI) * 18], [i * W / 14 + 6, y0 + 24 + Math.sin(i / 13 * Math.PI) * 18]], ['#e1ac64aa', '#82ae75aa', '#c15d4daa'][i % 3]);
 } else if (scene === 'Metal') {
  poly(ctx, [[0, y1], [W * .18, y0 - 10], [W * .35, y1], [W * .55, y0 - 30], [W * .78, y1], [W * .9, y0], [W, y1]], mid);
  poly(ctx, [[W * .18, y0 - 10], [W * .14, y0 + 8], [W * .22, y0 + 8]], '#dfe6ef66'); poly(ctx, [[W * .55, y0 - 30], [W * .5, y0 - 8], [W * .6, y0 - 8]], '#dfe6ef66');
  box(ctx, W * .62, y0 + 10, W * .12, y1 - y0 - 10, 1, sil); for (let i = 0; i < 4; i++) box(ctx, W * .62 + i * W * .033, y0 + 2, W * .02, 10, 0, sil);
 } else if (scene === 'Latino' || scene === 'boat') {
  ellipse(ctx, W * .2, y0 + 25, 22, 22, '#f2b86466');
  box(ctx, 0, y1 - 22, W, 22, 0, '#1f5a63');
  for (let i = 0; i < 10; i++) box(ctx, (i * W / 10 + (reduced ? 0 : t * 14)) % W, y1 - 14 + sway(1.3 + i) * 2, 22, 2, 1, '#9fd3d055');
  if (scene === 'boat') { box(ctx, W * .5 - 2, y0 - 20, 4, y1 - y0 + 10, 1, sil); ctx.strokeStyle = '#d8c79a66'; ctx.lineWidth = 1; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W * .5, y0 - 18); ctx.lineTo(W * .5 + d * W * .3, y1 - 4); ctx.stroke(); } }
  else for (const x of [.6, .78]) { poly(ctx, [[W * x, y1 - 24], [W * x + 40, y1 - 24], [W * x + 32, y1 - 14], [W * x + 6, y1 - 14]], sil); poly(ctx, [[W * x + 20, y1 - 26], [W * x + 20, y1 - 60], [W * x + 40, y1 - 28]], '#efe3c288'); }
 } else if (scene === 'Reggae') {
  box(ctx, 0, y1 - 20, W, 20, 0, '#2a6f6a');
  ellipse(ctx, W * .7, y1 - 22, 30, 12, '#f2c36b44');
  for (const x of [.12, .3, .85]) { ctx.strokeStyle = sil; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(W * x, y1); ctx.quadraticCurveTo(W * x + 12, y0 + 40, W * x + 4, y0 + 10); ctx.stroke(); for (let k = 0; k < 5; k++) { const a = -Math.PI * (.1 + k * .2) + sway(.8) * .05; poly(ctx, [[W * x + 4, y0 + 10], [W * x + 4 + Math.cos(a) * 34, y0 + 10 + Math.sin(a) * 14 + 12], [W * x + 4 + Math.cos(a) * 20, y0 + 16 + Math.sin(a) * 8]], '#163a33'); } }
 } else if (scene === 'Jazz') {
  ellipse(ctx, W * .85, y0 + 6, 14, 14, '#f0e4bf88');
  for (let i = 0; i < 12; i++) { const x = i * W / 12, h = 40 + (i * 37 % 50); box(ctx, x, y1 - h, W / 12 - 3, h, 0, sil); for (let j = 0; j < 3; j++) if ((i + j) % 2) box(ctx, x + 6, y1 - h + 8 + j * 12, 5, 5, 0, '#e8c46e66'); }
 } else if (scene === 'final') {
  for (let i = 0; i < 6; i++) { const x = W * (.1 + i * .16), r = 16 + (reduced ? 0 : (t * 30 + i * 20) % 30); ctx.strokeStyle = ['#f2c36b', '#e48ab4', '#82c6d8'][i % 3] + '55'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y0 + 4, r, 0, Math.PI * 2); ctx.stroke(); }
  box(ctx, W * .25, y0 + 26, W * .5, 30, 6, '#0d1a24', gold); words(ctx, 'FESTIVAL DELLE OTTO STRADE', W / 2, y0 + 46, W < 400 ? 9 : 13, gold);
 } else if (scene === 'rival') {
  box(ctx, W * .3, y0 + 20, W * .4, 26, 4, '#5c1f1f', '#e0a05a'); words(ctx, '⚡ ALTA TENSIONE ⚡', W / 2, y0 + 38, W < 400 ? 9 : 12, '#f2d08a');
  for (let i = 0; i < 9; i++) box(ctx, i * W / 9 + 8, y1 - 30, W / 9 - 16, 30, 4, sil);
 } else {
  for (let i = 0; i < 9; i++) box(ctx, i * W / 9 + 4, y0 + 20, W / 9 - 8, y1 - y0 - 20, 0, i % 2 ? '#2a2018' : '#30251c');
  ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y0 + 12); ctx.quadraticCurveTo(W / 2, y0 + 34, W, y0 + 12); ctx.stroke();
  for (let i = 0; i < 16; i++) ellipse(ctx, i * W / 15, y0 + 12 + Math.sin(i / 15 * Math.PI) * 22, 3, 3, i % 2 ? '#f6d48daa' : '#f39a6aaa');
 }
 ctx.restore();
}
export function drawConcert(ctx, {
 song: s,
 time: t,
 W,
 H,
 instrument
}) {
 const inst = INSTRUMENTS[instrument],
  city = CITIES[s.city],
  g = concertGeometry(W, H, inst.lanes),
  palette = PALETTES[s.kind === 'final' ? 'Pop' : s.kind === 'rival' ? 'Rock' : (s.genre || city.genre)] || ['#182a2a', '#779b88', '#e5bd7f'],
  [dark, accent, gold] = palette,
  energy = Math.min(1, .25 + s.combo / 30),
  beatPulse = reduced ? .3 : Math.pow(1 - ((Math.max(0, t - 2) / s.beat) % 1), 3),
  wide = W > 650;
 ctx.save();
 const sky = ctx.createLinearGradient(0, 0, 0, H);
 sky.addColorStop(0, dark);
 sky.addColorStop(.6, '#14252b');
 sky.addColorStop(1, '#071218');
 ctx.fillStyle = sky;
 ctx.fillRect(0, 0, W, H);
 backdrop(ctx, s.kind === 'final' ? 'final' : s.kind === 'boat' ? 'boat' : s.kind === 'rival' ? 'rival' : (s.genre || city.genre), W, H, t, accent, gold);
 // Warm theatre curtains, truss and beams: motion is decorative, never applied to notes.
 for (let side = 0; side < 2; side++) {
  const x = side ? W - 40 : 0;
  const curtain = ctx.createLinearGradient(x, 0, x + 40, 0);
  curtain.addColorStop(0, '#141c24');
  curtain.addColorStop(.5, accent + '77');
  curtain.addColorStop(1, '#141c24');
  ctx.fillStyle = curtain;
  ctx.fillRect(x, 0, 40, H * .45);
 }
 for (let i = 0; i < 5; i++) {
  const x = W * (.12 + i * .19),
   sway = reduced ? 0 : Math.sin(t * .5 + i) * W * .08;
  poly(ctx, [
   [x - 6, 53],
   [x + 6, 53],
   [x + sway + W * .13, H * .43],
   [x + sway - W * .13, H * .43]
  ], accent + (i % 2 ? '12' : '1b'));
  ellipse(ctx, x, 53, 7, 5, gold);
 }
 box(ctx, W * .08, 66, W * .84, 4, 2, '#8d988077');
 for (let i = 0; i < 11; i++) ellipse(ctx, W * (.1 + i * .08), 68, 2, 2, gold);
 const stageY = H * .36;
 box(ctx, W * .07, stageY - 9, W * .86, H * .1, 8, '#6d5544');
 for (let i = 0; i < 6; i++) box(ctx, W * .08, stageY + i * 9, W * .84, 1, 0, '#ddbf8130');
 box(ctx, W * .07, stageY + H * .08, W * .86, 9, 3, '#b29465');
 const label = s.kind === 'tutorial' ? 'IL GARAGE · LA PRIMA PROVA' : s.kind === 'rival' ? 'ALTA TENSIONE · LA SFIDA' : s.kind === 'final' ? 'FESTIVAL DELLE OTTO STRADE' : s.kind === 'boat' ? 'CONCERTO SUL MARE' : s.kind === 'home' ? 'BORGO DELLE CICALE · IL CONCERTO A CASA' : s.kind === 'practice' ? 'PROVA · ' + city.name.toUpperCase() : city.name.toUpperCase() + ' · LIVE';
 words(ctx, label, W / 2, 85, W < 400 ? 10 : 14, gold);
 words(ctx, inst.name.toUpperCase() + ' · ' + (city.genre === 'Casa' ? 'LA NOSTRA BAND' : city.genre.toUpperCase()), W / 2, 103, 10, '#d3d7c0');
 const band = Object.keys(INSTRUMENTS).filter(k => k !== instrument);
 musician(ctx, W * .5, stageY - 18, 0, instrument, t, energy, true);
 musician(ctx, W * .28, stageY - 22, 1, band[0], t, energy, false);
 musician(ctx, W * .72, stageY - 22, 2, band[1], t, energy, false);
 for (const x of [W * .12, W * .88]) {
  drawSprite(ctx, 'band', 3, 3, x, stageY + 10, 46, 55);
  ellipse(ctx, x, stageY + 6, 7, 3, accent);
 }
 // Audience around the runway, with individual silhouettes and arms.
 for (let row = 0; row < 3; row++)
  for (let side = 0; side < 2; side++)
   for (let i = 0; i < (wide ? 7 : 3); i++) {
    const x = side ? W - (18 + i * (wide ? 25 : 15)) : 18 + i * (wide ? 25 : 15),
     y = H * .65 + row * H * .095,
     bob = reduced ? 0 : Math.sin(t * 3 + i + row) * energy * 3;
    if (Math.abs(x - W / 2) < g.bottom / 2 + 18) continue;
    ellipse(ctx, x, y + bob, 7 + row, 9 + row, '#0b171f');
    box(ctx, x - 12 - row, y + 7 + bob, 24 + row * 2, 33, 10, row % 2 ? '#172631' : '#1e3036');
    if (s.combo >= 10) {
     ctx.strokeStyle = accent + '88';
     ctx.lineWidth = 3;
     ctx.beginPath();
     ctx.moveTo(x - 8, y + 15);
     ctx.lineTo(x - 18, y - 10 + bob);
     ctx.moveTo(x + 8, y + 15);
     ctx.lineTo(x + 18, y - 14 - bob);
     ctx.stroke();
    }
   }
 // Perspective highway with a fixed, high contrast timing line.
 const topL = g.cx - g.top / 2,
  botL = g.cx - g.bottom / 2;
 poly(ctx, [
  [topL - 7, g.horizon],
  [topL + g.top + 7, g.horizon],
  [botL + g.bottom + 12, g.hit + 30],
  [botL - 12, g.hit + 30]
 ], '#e0c59b24');
 poly(ctx, [
  [topL, g.horizon],
  [topL + g.top, g.horizon],
  [botL + g.bottom, g.hit + 25],
  [botL, g.hit + 25]
 ], '#09141fee', '#ccb38b77');
 ctx.save();
 ctx.beginPath();
 ctx.moveTo(topL, g.horizon);
 ctx.lineTo(topL + g.top, g.horizon);
 ctx.lineTo(botL + g.bottom, g.hit + 24);
 ctx.lineTo(botL, g.hit + 24);
 ctx.closePath();
 ctx.clip();
 for (let l = 0; l < inst.lanes; l++) {
  const col = inst.colors[l];
  poly(ctx, [
   [topL + l * g.top / inst.lanes, g.horizon],
   [topL + (l + 1) * g.top / inst.lanes, g.horizon],
   [botL + (l + 1) * g.bottom / inst.lanes, g.hit + 25],
   [botL + l * g.bottom / inst.lanes, g.hit + 25]
  ], s.pressed.has(l) ? col + '35' : l % 2 ? '#21334255' : '#15253555');
 }
 for (let i = Math.floor((t - 2) / s.beat); i < (t - 2) / s.beat + 6; i++) {
  const p = notePosition(g, (2 + i * s.beat - t) / s.beat);
  if (2 + i * s.beat < t) continue;
  ctx.strokeStyle = i % 4 === 0 ? '#e6d7b34d' : '#829bac24';
  ctx.beginPath();
  ctx.moveTo(g.cx - p.width / 2, p.y);
  ctx.lineTo(g.cx + p.width / 2, p.y);
  ctx.stroke();
 }
 for (const n of s.notes) {
  if (n.status === 'hit' || n.status === 'miss') continue;
  const ahead = (n.t - t) / s.beat;
  if (ahead > 5 || ahead < -.5) continue;
  const p = notePosition(g, ahead),
   laneW = p.width / inst.lanes,
   x = g.cx - p.width / 2 + (n.lane + .5) * laneW,
   col = inst.colors[n.lane],
   r = Math.max(4, laneW * .29);
  if (n.duration) {
   const tail = notePosition(g, (n.t + n.duration - t) / s.beat),
    tx = g.cx - tail.width / 2 + (n.lane + .5) * tail.width / inst.lanes;
   poly(ctx, [
    [x - r * .3, p.y],
    [x + r * .3, p.y],
    [tx + r * .18, tail.y],
    [tx - r * .18, tail.y]
   ], col + '99');
  }
  if (n.status !== 'holding') {
   ellipse(ctx, x, p.y + 3, r, r * .48, '#0008');
   ellipse(ctx, x, p.y, r, r * .48, col);
   ellipse(ctx, x, p.y - 2, r * .68, r * .22, '#fff2ceaa');
   words(ctx, String(n.lane + 1), x, p.y + 3, Math.max(9, 12 * p.depth), '#14232a');
  }
 }
 ctx.restore();
 ctx.strokeStyle = gold;
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(botL - 7, g.hit);
 ctx.lineTo(botL + g.bottom + 7, g.hit);
 ctx.stroke();
 for (let l = 0; l < inst.lanes; l++) {
  const x = botL + (l + .5) * g.bottom / inst.lanes,
   r = g.bottom / inst.lanes * .32,
   col = inst.colors[l];
  ellipse(ctx, x, g.hit, r + 3, 13, '#101c24');
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, g.hit, r, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (s.pressed.has(l)) ellipse(ctx, x, g.hit, r * .75, 7, col);
  words(ctx, inst.labels[l], x, g.hit + 29, 13, col);
 }
 // Successful hits use bounded rings and particles; mistakes never shake the highway.
 for (const fx of s.hitEffects || []) {
  const age = t - fx.t;
  if (age < 0 || age > .45) continue;
  const x = botL + (fx.lane + .5) * g.bottom / inst.lanes,
   life = 1 - age / .45,
   col = inst.colors[fx.lane];
  ctx.globalAlpha = life;
  ellipse(ctx, x, g.hit, 12 + age * 65, 5 + age * 28, col + '66');
  if (!reduced)
   for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * .4;
    ellipse(ctx, x + Math.cos(a) * age * 95, g.hit - 10 - Math.sin(a) * age * 95, 2.5, 2.5, gold);
   }
  ctx.globalAlpha = 1;
 }
 const sideX = wide ? W * .17 : W - 32,
  sideY = wide ? H * .48 : H * .54;
 if (s.combo > 1) words(ctx, s.combo + ' ×', sideX, sideY, wide ? 40 : 22, gold);
 else if (wide) words(ctx, 'È IL TUO PALCO', sideX, sideY, 13, gold);
 if (wide) {
  words(ctx, 'SERIE MIGLIORE · ' + s.maxCombo, sideX, sideY + 26, 11, '#bccbc7');
  words(ctx, s.combo >= 20 ? 'IL PUBBLICO È CON VOI' : s.combo >= 10 ? 'LA BAND TROVA IL GROOVE' : 'ASCOLTATEVI', W * .83, H * .48, 12, gold);
 }
 if (t < 2) {
  box(ctx, W / 2 - 52, H * .52 - 45, 104, 94, 18, '#12232ee8', gold);
  words(ctx, String(Math.max(1, 4 - Math.floor(Math.max(0, t) / .5))), W / 2, H * .52 + 17, 64, gold);
 } else if (t < s.feedbackUntil) {
  box(ctx, W / 2 - 87, g.horizon - 25, 174, 28, 10, '#101e2aee');
  words(ctx, s.feedback, W / 2, g.horizon - 6, 12, s.feedback === 'CERCA IL TEMPO' ? '#e5b09c' : gold);
 }
 const progress = Math.max(0, Math.min(1, t / s.duration));
 box(ctx, 16, H - 8, W - 32, 3, 1, '#52687644');
 if (progress) box(ctx, 16, H - 8, (W - 32) * progress, 3, 1, gold);
 ctx.restore();
}