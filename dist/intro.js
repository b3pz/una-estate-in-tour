// Sequenza d'apertura in stile console portatile: logo, corsa in bici verso il concerto,
// titolo con «PREMI START» e menu principale (Nuova partita · Carica partita).
// I comandi arrivano da game.js (tastiera rimappabile e joystick) tramite handle(azione).
import { atlases, hasAtlas } from './assets.js';
import { drawCharacter, drawStage } from './world.js';

const LOGO_END = 2.6, RIDE = 7.4, RIDE_END = LOGO_END + RIDE;

export function playIntro({ audio, skip: skipAll = false, getSave, describeSave, onNew, onLoad, onImport }) {
 const screen = document.getElementById('screen');
 document.getElementById('bootScreen')?.remove();
 const box = document.createElement('div');
 box.id = 'bootScreen';
 box.className = 'boot-screen';
 box.setAttribute('role', 'dialog');
 box.setAttribute('aria-label', 'Fuori Tempo, un’estate in tour.');
 box.innerHTML = '<canvas aria-hidden="true"></canvas><button class="boot-start" tabindex="-1">PREMI START</button><div class="boot-menu" hidden></div>';
 screen.appendChild(box);
 const canvas = box.querySelector('canvas'), ctx = canvas.getContext('2d'), menuBox = box.querySelector('.boot-menu');
 let t0 = performance.now() - (skipAll ? (RIDE_END + 1.6) * 1000 : 0), flash = 0, W = 0, H = 0, dpr = 1, view = 'anim', closing = false;
 const notes = Array.from({ length: 14 }, (_, i) => ({ x: (i * 97) % 100 / 100, d: (i * 37 % 10) / 10, s: ['♪', '♫', '♩'][i % 3] }));

 const fit = () => {
  const r = box.getBoundingClientRect();
  dpr = Math.min(3, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
 };
 fit();
 window.addEventListener('resize', fit);

 const time = () => (performance.now() - t0) / 1000;
 const chime = list => {
  audio.init().then(() => list.forEach(([f, d], i) => audio.tone(f, audio.ctx.currentTime + d, .3, i % 2 ? 'square' : 'triangle', .07))).catch(() => {});
 };
 const blip = () => chime([[880, 0]]);
 const skip = () => { if (time() < RIDE_END) t0 = performance.now() - RIDE_END * 1000; };

 // --- menu ---
 const items = list => {
  menuBox.innerHTML = list.map((x, i) => x.html ? x.html : `<button class="menu-item" data-i="${i}" ${x.disabled ? 'disabled' : ''}>${x.label}</button>`).join('');
  menuBox.querySelectorAll('.menu-item').forEach(b => b.onclick = e => { e.stopPropagation(); blip(); list[+b.dataset.i].run(); });
  menuBox.hidden = false;
  menuBox.querySelector('.menu-item:not([disabled])')?.focus();
 };
 const mainMenu = (focus = 0) => {
  view = 'menu';
  box.classList.add('menu-open');
  items([
   { label: 'NUOVA PARTITA', run: () => getSave() ? confirmNew() : leave(onNew) },
   { label: 'CARICA PARTITA', run: loadMenu }
  ]);
  menuBox.querySelectorAll('.menu-item')[focus]?.focus();
 };
 const confirmNew = () => {
  view = 'sub';
  items([
   { html: '<p class="menu-note">La nuova estate sostituisce la partita salvata su questo dispositivo.</p>' },
   { label: 'SÌ, RICOMINCIA', run: () => leave(onNew) },
   { label: 'NO', run: () => mainMenu(0) }
  ]);
 };
 const loadMenu = () => {
  view = 'sub';
  const s = getSave();
  items([
   { html: s ? `<div class="save-slot">${describeSave(s)}</div>` : '<p class="menu-note">Nessuna partita salvata su questo dispositivo.</p>' },
   ...(s ? [{ label: 'CONTINUA IL VIAGGIO', run: () => leave(onLoad) }] : []),
   { label: 'CARICA DA FILE', run: () => onImport(() => leave(() => {})) },
   { label: 'INDIETRO', run: () => mainMenu(1) }
  ]);
 };
 const toMenu = () => {
  if (view !== 'title') return;
  flash = performance.now();
  chime([[523.25, 0], [659.25, .09], [783.99, .18], [1046.5, .27]]);
  setTimeout(mainMenu, 260);
 };
 function leave(then) {
  if (closing) return;
  closing = true;
  box.classList.add('leaving');
  then();
  setTimeout(() => { box.remove(); window.removeEventListener('resize', fit); }, 450);
 }
 const focusables = () => [...menuBox.querySelectorAll('.menu-item:not([disabled])')];
 function handle(action) {
  if (closing) return;
  if (view === 'anim') { skip(); return; }
  if (view === 'title') { if (action === 'a' || action === 'start') toMenu(); return; }
  const list = focusables(), i = list.indexOf(document.activeElement);
  if (action === 'up' || action === 'down') {
   const next = list[(Math.max(0, i) + (action === 'down' ? 1 : -1) + list.length) % list.length];
   next?.focus();
   blip();
  } else if (action === 'a' || action === 'start') (list[i] || list[0])?.click();
  else if (action === 'b' && view === 'sub') { blip(); mainMenu(menuBox.querySelector('.save-slot, .menu-note') && !menuBox.textContent.includes('RICOMINCIA') ? 1 : 0); }
 }
 box.addEventListener('pointerdown', e => {
  if (e.target.closest('.boot-menu')) return;
  e.preventDefault();
  if (view === 'anim') skip(); else if (view === 'title') toMenu();
 });

 // --- disegno ---
 const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
 const hill = (y, amp, freq, shift, color) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, y + Math.sin((x + shift) * freq) * amp + Math.sin((x + shift) * freq * 2.3) * amp * .4);
  ctx.lineTo(W, H); ctx.fill();
 };
 const tree = (x, y, s) => {
  ctx.fillStyle = '#5a4030'; ctx.fillRect(x - 3 * s, y - 14 * s, 6 * s, 14 * s);
  ctx.fillStyle = '#3f7a4a';
  for (const [dx, dy, r] of [[0, -30, 15], [-11, -21, 11], [11, -21, 11]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#5c9a5a'; ctx.beginPath(); ctx.arc(x - 4 * s, y - 34 * s, 7 * s, 0, 7); ctx.fill();
 };
 // Strada percorsa: velocità costante, poi frenata davanti al palco.
 const travelled = (s, D) => {
  const cruise = RIDE - 2.2, v = D / (cruise + 2.2 / 2);
  return s < cruise ? v * s : v * cruise + v * (Math.min(s, RIDE) - cruise) - v * Math.pow(Math.min(s, RIDE) - cruise, 2) / (2 * 2.2);
 };
 // Logo «Fuori Tempo»: le lettere ballano a tempo, tranne alcune che vanno in controtempo.
 const title = (cx, cy, k, alpha, t) => {
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const big = Math.min(W * (H > W ? .2 : .16), H * .17) * k, beat = t * Math.PI * 2 * 1.4;
  // pentagramma ondulato, come una strada
  ctx.strokeStyle = 'rgba(255,244,214,.55)'; ctx.lineWidth = Math.max(1.5, big * .025);
  const span = Math.min(W * .86, big * 6.4);
  for (let i = 0; i < 5; i++) {
   ctx.beginPath();
   for (let x = -span / 2; x <= span / 2; x += 6) { const y = cy + big * (.06 + i * .11) + Math.sin(x / span * 5 + t * 1.2) * big * .08; x === -span / 2 ? ctx.moveTo(cx + x, y) : ctx.lineTo(cx + x, y); }
   ctx.stroke();
  }
  const word = (text, y, size, fill, offbeat) => {
   ctx.font = `700 ${size}px Fredoka, Nunito, sans-serif`;
   const widths = [...text].map(c => ctx.measureText(c).width + size * .04), total = widths.reduce((a, b) => a + b, 0);
   let x = cx - total / 2;
   [...text].forEach((c, i) => {
    const off = offbeat.includes(i), hop = Math.abs(Math.sin(beat / 2 + (off ? Math.PI / 2 : 0))) * size * .09, tilt = off ? Math.sin(beat / 2 + 1) * .12 : 0;
    ctx.save(); ctx.translate(x + widths[i] / 2, y - hop); ctx.rotate(tilt);
    ctx.lineJoin = 'round'; ctx.lineWidth = size * .16; ctx.strokeStyle = '#2a1d2e'; ctx.strokeText(c, 0, 0);
    ctx.fillStyle = fill(size); ctx.fillText(c, 0, 0);
    ctx.restore();
    x += widths[i];
   });
   return total;
  };
  word('FUORI', cy - big * .02, big * .78, () => '#fff4d6', [2]);
  const grad = size => { const g = ctx.createLinearGradient(0, -size * .8, 0, 0); g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#f0703e'); return g; };
  const w2 = word('TEMPO', cy + big * .86, big, grad, [1, 4]);
  // croma accanto alla parola
  const nx = cx + w2 / 2 + big * .28, ny = cy + big * .55 + Math.sin(beat) * big * .06;
  ctx.fillStyle = '#fff4d6'; ctx.strokeStyle = '#2a1d2e'; ctx.lineWidth = big * .05;
  ctx.beginPath(); ctx.ellipse(nx, ny, big * .13, big * .095, -.4, 0, 7); ctx.stroke(); ctx.fill();
  ctx.fillRect(nx + big * .09, ny - big * .62, big * .05, big * .62);
  ctx.beginPath(); ctx.moveTo(nx + big * .14, ny - big * .62); ctx.quadraticCurveTo(nx + big * .38, ny - big * .4, nx + big * .26, ny - big * .2); ctx.lineWidth = big * .05; ctx.strokeStyle = '#fff4d6'; ctx.stroke();
  // nastro col sottotitolo
  const ry = cy + big * 1.3, label = 'un’estate in tour';
  ctx.font = `700 ${big * .24}px Nunito, sans-serif`;
  const lw = ctx.measureText(label).width + big * .6;
  ctx.save(); ctx.translate(cx, ry); ctx.rotate(-.035);
  ctx.fillStyle = '#2a1d2e'; ctx.fillRect(-lw / 2 + 3, -big * .17 + 4, lw, big * .36);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(-lw / 2, -big * .17, lw, big * .36);
  ctx.fillStyle = '#fff4d6'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, big * .015);
  ctx.restore();
  ctx.restore();
 };

 function frame() {
  if (!box.isConnected) return;
  const t = time();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (t < LOGO_END) {
   ctx.fillStyle = '#0d0f12'; ctx.fillRect(0, 0, W, H);
   const a = Math.min(1, t / .5) * Math.min(1, (LOGO_END - t) / .5), drop = ease(t / .9);
   ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
   ctx.fillStyle = '#e8e2cf'; ctx.font = `700 ${Math.min(W, H) * .13}px Fredoka, Nunito, sans-serif`;
   ctx.fillText('B3PZ', W / 2, H / 2 - 40 + drop * 30);
   ctx.font = `600 ${Math.min(W, H) * .035}px Nunito, sans-serif`; ctx.fillStyle = '#9aa39b';
   ctx.fillText('presenta', W / 2, H / 2 + Math.min(W, H) * .1);
   ctx.restore();
   if (!frame.ping && t > .9) { frame.ping = true; chime([[987.77, 0], [1318.5, .1]]); }
  } else {
   const s = t - LOGO_END, titleIn = Math.max(0, t - RIDE_END + .6);
   const portrait = H > W, size = Math.max(1.3, Math.min(3.2, H / 250)), groundY = H * (portrait ? .7 : .76);
   const D = W * (portrait ? 3.2 : 2.4), dist = travelled(s, D), speed = s < RIDE ? Math.max(0, D / (RIDE - 1.1) * (s < RIDE - 2.2 ? 1 : 1 - (s - RIDE + 2.2) / 2.2)) : 0;
   const heroWorld = W * (portrait ? .24 : .3) + dist, cam = dist, stageX = D + W * (portrait ? .68 : .66);
   const sky = ctx.createLinearGradient(0, 0, 0, H);
   sky.addColorStop(0, '#3b4a8c'); sky.addColorStop(.45, '#e98a6a'); sky.addColorStop(.75, '#ffd59a');
   ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
   if (hasAtlas('title') && titleIn > 0) {
    const img = atlases.title, k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    ctx.save(); ctx.globalAlpha = Math.min(1, titleIn / 1.2);
    ctx.drawImage(img, (W - img.naturalWidth * k) / 2, (H - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    ctx.restore();
   }
   const scene = Math.max(0, 1 - titleIn / 1.2);
   if (scene > 0) {
    ctx.save(); ctx.globalAlpha = scene;
    ctx.fillStyle = '#fff1c4'; ctx.beginPath(); ctx.arc(W * .78, H * .42, Math.min(W, H) * .09, 0, 7); ctx.fill();
    hill(H * .56, 18, .006, cam * .12, '#8c6f8f');
    hill(H * .64, 22, .009, cam * .3, '#6f8f5e');
    hill(groundY - H * .03, 10, .014, cam * .6, '#86a862');
    ctx.fillStyle = '#d9c08a'; ctx.fillRect(0, groundY - 6, W, 30);
    ctx.fillStyle = '#c2a56f'; for (let x = -(cam % 60); x < W; x += 60) ctx.fillRect(x, groundY + 6, 26, 3);
    ctx.fillStyle = '#7da35a'; ctx.fillRect(0, groundY + 24, W, H - groundY);
    ctx.fillStyle = '#f3d36b'; for (let i = 0; i < 46; i++) { const wx = i * 97 % (D + W * 1.2), x = wx - cam, y = groundY + 36 + (i * 29 % Math.max(20, H - groundY - 50)); if (x > -10 && x < W + 10) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); } }
    for (let wx = 140; wx < stageX - W * .35; wx += 270) { const x = wx - cam; if (x > -80 && x < W + 80) tree(x, groundY - 6, Math.max(1.5, H / 330) * (1 + (wx / 270 % 2) * .3)); }
    // il palco del concerto, con Nico e Vale che aspettano
    const sx = stageX - cam, sScale = Math.max(1.4, H / 300);
    if (sx < W + 260 * sScale) {
     drawStage(ctx, sx, groundY - 2, 'Rock', false, sScale);
     const wave = Math.sin(t * 6) * 2;
     for (const [dx, variant] of [[-34, 1], [34, 2]]) {
      ctx.save(); ctx.translate(sx + dx * sScale, groundY - 40 * sScale + (s > RIDE - .6 ? wave : 0)); ctx.scale(size * .8, size * .8);
      drawCharacter(ctx, 0, 0, { variant, facing: 'west', moving: false });
      ctx.restore();
     }
     if (s > RIDE - 1.2) { ctx.save(); ctx.globalAlpha = Math.min(1, (s - RIDE + 1.2)) * .5; const g = ctx.createRadialGradient(sx, groundY - 70 * sScale, 4, sx, groundY - 70 * sScale, 120 * sScale); g.addColorStop(0, '#fff2b0'); g.addColorStop(1, '#fff2b000'); ctx.fillStyle = g; ctx.fillRect(sx - 140 * sScale, groundY - 200 * sScale, 280 * sScale, 220 * sScale); ctx.restore(); }
    }
    // tu, in bici: corri finché arrivi al palco
    ctx.save(); ctx.translate(heroWorld - cam, groundY + 12); ctx.scale(size, size);
    drawCharacter(ctx, 0, 0, { facing: 'east', moving: speed > 20, walk: dist / 90, bike: true });
    ctx.restore();
    ctx.restore();
   }
   // note che salgono dal palco
   ctx.save(); ctx.textAlign = 'center';
   for (const n of notes) {
    const life = (s * .25 + n.d) % 1, x = n.x * W + Math.sin(s * 2 + n.d * 9) * 14;
    ctx.globalAlpha = Math.sin(life * Math.PI) * .7 * Math.min(1, s / 3); ctx.fillStyle = '#fff6dc';
    ctx.font = `700 ${18 + n.d * 14}px Nunito, sans-serif`; ctx.fillText(n.s, x, H * (.85 - life * .7));
   }
   ctx.restore();
   if (titleIn > 0) {
    const k = ease(titleIn / .8), bounce = titleIn < 1.2 ? Math.sin(titleIn * 9) * Math.exp(-titleIn * 4) * 18 : Math.sin(t * 1.6) * 3;
    ctx.fillStyle = `rgba(20,16,30,${Math.min(.35, titleIn * .3)})`; ctx.fillRect(0, 0, W, H);
    title(W / 2, H * (view === 'menu' || view === 'sub' ? .24 : .3) - (1 - k) * H * .4 + bounce, view === 'menu' || view === 'sub' ? .82 : 1, k, t);
    ctx.save(); ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, titleIn / 1.5) * .85;
    ctx.fillStyle = '#fff4d6'; ctx.font = `600 ${Math.max(11, Math.min(W, H) * .022)}px Nunito, sans-serif`;
    ctx.fillText('© B3PZ · Versione 0.8', W / 2, H - 22);
    ctx.restore();
    if (view === 'anim' && titleIn > 1) view = 'title';
   }
   box.classList.toggle('ready', view === 'title');
  }
  if (flash) {
   const f = (performance.now() - flash) / 420;
   if (f < 1) { ctx.fillStyle = `rgba(255,250,235,${Math.max(0, 1 - Math.abs(f - .4) * 2.2)})`; ctx.fillRect(0, 0, W, H); }
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return { handle, element: box, close: () => leave(() => {}), menu: () => { t0 = performance.now() - (RIDE_END + 1.6) * 1000; view = 'title'; mainMenu(); } };
}
