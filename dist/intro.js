// Sequenza d'apertura in stile console portatile: logo, scena animata, titolo con «PREMI START».
// Qualsiasi tasto o tocco salta l'animazione; sul titolo, Start/Invio/tocco apre il menu.
import { atlases, hasAtlas } from './assets.js';
import { drawCharacter } from './world.js';

const LOGO_END = 2.6, RIDE_END = 10.5;

export function playIntro({ audio, onStart }) {
 const screen = document.getElementById('screen');
 const box = document.createElement('div');
 box.id = 'bootScreen';
 box.className = 'boot-screen';
 box.setAttribute('role', 'dialog');
 box.setAttribute('aria-label', 'Una estate in tour. Premi Start per cominciare.');
 box.innerHTML = '<canvas aria-hidden="true"></canvas><button class="boot-start" aria-label="Premi Start">PREMI START</button>';
 screen.appendChild(box);
 const canvas = box.querySelector('canvas'), ctx = canvas.getContext('2d');
 let t0 = performance.now(), skipped = false, done = false, flash = 0, W = 0, H = 0, dpr = 1;
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
 const skip = () => {
  if (time() < RIDE_END) { t0 = performance.now() - RIDE_END * 1000; skipped = true; }
 };
 const chime = notes => {
  audio.init().then(() => notes.forEach(([f, d], i) => audio.tone(f, audio.ctx.currentTime + d, .3, i % 2 ? 'square' : 'triangle', .07))).catch(() => {});
 };
 const start = () => {
  if (done) return;
  if (time() < RIDE_END + .3) { skip(); return; }
  done = true;
  flash = performance.now();
  chime([[523.25, 0], [659.25, .09], [783.99, .18], [1046.5, .27]]);
  setTimeout(() => {
   box.classList.add('leaving');
   setTimeout(() => { box.remove(); window.removeEventListener('resize', fit); document.removeEventListener('keydown', onKey, true); }, 450);
   onStart();
  }, 420);
 };
 const onKey = e => {
  if (!document.getElementById('bootScreen')) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (e.repeat) return;
  if (['Enter', ' ', 'Escape'].includes(e.key) || e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'e') start(); else skip();
 };
 document.addEventListener('keydown', onKey, true);
 box.addEventListener('pointerdown', e => { e.preventDefault(); start(); });
 const touchStart = document.getElementById('touchStart');

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
 const title = (cx, cy, k, alpha) => {
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const big = Math.min(W * .12, H * .14) * k;
  ctx.font = `700 ${big * .5}px Fredoka, Nunito, sans-serif`;
  ctx.lineJoin = 'round'; ctx.lineWidth = big * .12; ctx.strokeStyle = '#2a1d2e'; ctx.fillStyle = '#fff4d6';
  ctx.strokeText('UNA ESTATE', cx, cy - big * .48); ctx.fillText('UNA ESTATE', cx, cy - big * .48);
  ctx.font = `700 ${big}px Fredoka, Nunito, sans-serif`;
  const g = ctx.createLinearGradient(0, cy - big * .4, 0, cy + big * .5); g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#f07c3e');
  ctx.lineWidth = big * .16; ctx.strokeText('in tour', cx, cy + big * .3);
  ctx.fillStyle = g; ctx.fillText('in tour', cx, cy + big * .3);
  ctx.restore();
 };

 function frame() {
  if (!box.isConnected) return;
  const t = time();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (t < LOGO_END) {
   // 1. Logo
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
   // 2. Scena: la band attraversa la campagna al tramonto
   const s = t - LOGO_END, titleIn = Math.max(0, t - RIDE_END + 1.2);
   const sky = ctx.createLinearGradient(0, 0, 0, H);
   sky.addColorStop(0, '#3b4a8c'); sky.addColorStop(.45, '#e98a6a'); sky.addColorStop(.75, '#ffd59a');
   ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
   if (hasAtlas('title') && titleIn > 0) {
    const img = atlases.title, k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    ctx.save(); ctx.globalAlpha = Math.min(1, titleIn / 1.4);
    ctx.drawImage(img, (W - img.naturalWidth * k) / 2, (H - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    ctx.restore();
   }
   const scene = Math.max(0, 1 - titleIn / 1.4);
   if (scene > 0) {
    ctx.save(); ctx.globalAlpha = scene;
    ctx.fillStyle = '#fff1c4'; ctx.beginPath(); ctx.arc(W * .72, H * .5 - s * 4, Math.min(W, H) * .09, 0, 7); ctx.fill();
    hill(H * .58, 18, .006, s * 20, '#8c6f8f');
    hill(H * .66, 22, .009, s * 45, '#6f8f5e');
    const groundY = H * .76;
    hill(H * .74, 10, .014, s * 90, '#86a862');
    ctx.fillStyle = '#d9c08a'; ctx.fillRect(0, groundY - 6, W, 30);
    ctx.fillStyle = '#c2a56f'; for (let x = -((s * 260) % 60); x < W; x += 60) ctx.fillRect(x, groundY + 6, 26, 3);
    ctx.fillStyle = '#7da35a'; ctx.fillRect(0, groundY + 24, W, H - groundY);
    for (let i = 0; i < 6; i++) { const x = ((i * 230 - s * 160) % (W + 300) + W + 300) % (W + 300) - 100; tree(x, groundY - 6, Math.max(1.6, H / 330) * (1 + (i % 2) * .3)); }
    ctx.fillStyle = '#f3d36b'; for (let i = 0; i < 40; i++) { const x = ((i * 53 - s * 220) % (W + 40) + W + 40) % (W + 40) - 20, y = groundY + 36 + (i * 29 % Math.max(20, H - groundY - 50)); ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); }
    // personaggi: tu in bici, gli amici a piedi dietro
    const enter = ease(s / 3.2), heroX = -80 + enter * (W * .55 + 80), size = Math.max(1.4, Math.min(3.4, H / 240));
    ctx.save(); ctx.translate(heroX - 100 * size, groundY + 8); ctx.scale(size * .9, size * .9);
    drawCharacter(ctx, 0, 0, { variant: 1, facing: 'east', moving: true, walk: s });
    ctx.restore();
    ctx.save(); ctx.translate(heroX - 62 * size, groundY + 10); ctx.scale(size * .9, size * .9);
    drawCharacter(ctx, 0, 0, { variant: 2, facing: 'east', moving: true, walk: s + .3 });
    ctx.restore();
    ctx.save(); ctx.translate(heroX, groundY + 12); ctx.scale(size, size);
    drawCharacter(ctx, 0, 0, { facing: 'east', moving: true, walk: s, bike: true });
    ctx.restore();
    ctx.restore();
   }
   // note che salgono
   ctx.save(); ctx.textAlign = 'center';
   for (const n of notes) {
    const life = (s * .25 + n.d) % 1, x = n.x * W + Math.sin(s * 2 + n.d * 9) * 14;
    ctx.globalAlpha = Math.sin(life * Math.PI) * .75; ctx.fillStyle = '#fff6dc';
    ctx.font = `700 ${18 + n.d * 14}px Nunito, sans-serif`; ctx.fillText(n.s, x, H * (.85 - life * .7));
   }
   ctx.restore();
   // 3. Titolo
   if (titleIn > 0) {
    const k = ease(titleIn / .8), bounce = titleIn < 1.2 ? Math.sin(titleIn * 9) * Math.exp(-titleIn * 4) * 18 : Math.sin(t * 1.6) * 3;
    ctx.fillStyle = `rgba(20,16,30,${Math.min(.35, titleIn * .3)})`; ctx.fillRect(0, 0, W, H);
    title(W / 2, H * .34 - (1 - k) * H * .4 + bounce, 1, k);
    ctx.save(); ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, titleIn / 1.5) * .85;
    ctx.fillStyle = '#fff4d6'; ctx.font = `600 ${Math.max(11, Math.min(W, H) * .022)}px Nunito, sans-serif`;
    ctx.fillText('© B3PZ · Versione 0.7', W / 2, H - 22);
    ctx.restore();
   }
   box.classList.toggle('ready', t > RIDE_END + .3);
  }
  if (flash) {
   const f = (performance.now() - flash) / 420;
   ctx.fillStyle = `rgba(255,250,235,${Math.max(0, 1 - Math.abs(f - .4) * 2.2)})`; ctx.fillRect(0, 0, W, H);
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return { skip, start, element: box, touchStart };
}
