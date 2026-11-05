// Otto prove musicali, una meccanica diversa per città.
// La logica di verifica è pura ed esportata per i test; l'interfaccia usa le API del gioco.

const shuffleSeeded = (arr, seed) => { const a = [...arr]; let s = seed >>> 0 || 7; for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const semi = (base, st) => base * Math.pow(2, st / 12);

// ---------- Rivafosca · blues in dodici battute ----------
export const BLUES_TARGET = ['La7', 'La7', 'La7', 'La7', 'Re7', 'Re7', 'La7', 'La7', 'Mi7', 'Re7', 'La7', 'Mi7'];
export const BLUES_GIVEN = [0, 4, 8];
export const BLUES_CHORDS = { La7: 0, Re7: 5, Mi7: 7 };
export function bluesMatches(answer) { return BLUES_TARGET.reduce((n, c, i) => n + (answer[i] === c ? 1 : 0), 0); }

// ---------- Officina · percorso del segnale ----------
export const SIGNAL_DEVICES = {
 chitarra: { name: 'Chitarra', to: ['pedale', 'amplificatore', 'mixer', 'casse'] },
 pedale: { name: 'Pedale overdrive', to: ['amplificatore', 'mixer', 'casse'] },
 amplificatore: { name: 'Amplificatore (altoparlante)', to: ['microfono', 'mixer', 'casse'] },
 microfono: { name: 'Microfono', to: ['mixer', 'casse', 'amplificatore'] },
 mixer: { name: 'Mixer', to: ['casse', 'cuffie', 'microfono'] }
};
export const SIGNAL_SOLUTION = { chitarra: 'pedale', pedale: 'amplificatore', amplificatore: 'microfono', microfono: 'mixer', mixer: 'casse' };
// Segue il segnale dalla chitarra e restituisce il primo problema, oppure null se arriva al pubblico.
export function diagnoseSignal(links) {
 const msg = {
  'chitarra>mixer': 'Il mixer di Ada ha solo ingressi per microfoni: la chitarra arriva debolissima.',
  'chitarra>casse': 'Le casse ricevono un segnale troppo debole: solo un ronzio.',
  'chitarra>amplificatore': 'Suona, ma è pulito: Ada vuole il carattere del pedale. Manca un passaggio prima dell’amplificatore.',
  'pedale>mixer': 'Il mixer accetta solo microfoni: il pedale non basta a farsi sentire.',
  'pedale>casse': 'Il pedale non ha la forza per spingere le casse: ronzio.',
  'amplificatore>mixer': 'L’amplificatore non ha un’uscita per il mixer: il suono resta nella stanza. Qualcuno deve «ascoltarlo».',
  'amplificatore>casse': 'L’amplificatore suona già da sé: collegarlo alle casse non porta il suono al mixer.',
  'microfono>casse': 'Il microfono diretto alle casse fischia: manca chi regola i volumi.',
  'microfono>amplificatore': 'Larsen! Il microfono rimanda il suono all’amplificatore che lo riprende all’infinito.',
  'mixer>cuffie': 'In cuffia suona benissimo, ma il pubblico non sente niente.',
  'mixer>microfono': 'Il mixer non può mandare il segnale dentro un microfono.'
 };
 let at = 'chitarra';
 for (let i = 0; i < 6; i++) {
  const next = links[at];
  if (!next) return { ok: false, at, message: `Il segnale si ferma dopo: ${SIGNAL_DEVICES[at]?.name || at}. Manca un collegamento.` };
  if (next === 'casse' && at === 'mixer') return { ok: true, message: 'Il riff riempie il cortile. Ada alza il pollice.' };
  const key = at + '>' + next;
  if (msg[key]) return { ok: false, at, message: msg[key] };
  at = next;
 }
 return { ok: false, at, message: 'Il segnale gira in tondo.' };
}

// ---------- Bellavista · forma della canzone ----------
export const SONG_SECTIONS = ['Strofa · la partenza', 'Ritornello · la promessa', 'Ponte · il dubbio', 'Ritornello finale · la promessa ripresa'];
export const SONG_FRAGMENTS = [
 { id: 'strofa', notes: [0, 2, 4, 2, 0, 2, 4, 5], vol: .09, chord: 0 },
 { id: 'ritornello', notes: [7, 9, 12, 12, 9, 7, 9, 12], vol: .12, chord: 0 },
 { id: 'ponte', notes: [9, 8, 5, 4, 5, 8, 9, 9], vol: .09, chord: 9, minor: true },
 { id: 'finale', notes: [9, 11, 14, 14, 11, 9, 11, 14], vol: .15, chord: 2 }
];
export function songOrderMatches(assign) { return ['strofa', 'ritornello', 'ponte', 'finale'].reduce((n, id, i) => n + (assign[i] === id ? 1 : 0), 0); }

// ---------- Grooveto · il posto del silenzio ----------
export const GROOVE_TARGET = [1, 0, 0, 1, 1, 0, 0, 0];
export function grooveDiff(steps) {
 let extra = 0, missing = 0;
 GROOVE_TARGET.forEach((v, i) => { if (steps[i] && !v) extra++; if (!steps[i] && v) missing++; });
 return { extra, missing, ok: !extra && !missing };
}

// ---------- Monteferro · tenere il tempo ----------
export const TEMPO_STAGES = [60, 80, 100];
export function tempoResult(taps, target) {
 if (taps.length < 6) return { ok: false, bpm: 0, steady: false };
 const iv = taps.slice(1).map((t, i) => t - taps[i]);
 const mean = iv.reduce((a, b) => a + b, 0) / iv.length, bpm = 60 / mean;
 const steady = iv.every(x => Math.abs(x - mean) / mean < .16);
 return { ok: steady && Math.abs(bpm - target) / target <= .07, bpm: Math.round(bpm), steady };
}

// ---------- Porto del Sol · clave son 3–2 ----------
export const CLAVE_STEPS = [0, 6, 12, 20, 24]; // sedicesimi su due battute (32)
export function claveCycle(hits, stepDur, tolerance = .12) {
 // hits: tempi in secondi dall'inizio del ciclo
 const targets = CLAVE_STEPS.map(s => s * stepDur), used = new Set();
 for (const h of hits) {
  const j = targets.findIndex((t, k) => !used.has(k) && Math.abs(t - h) <= tolerance);
  if (j < 0) return false;
  used.add(j);
 }
 return used.size === targets.length;
}

// ---------- Isola Levante · battere o levare ----------
export function levareClips(seed, count = 6) {
 const base = shuffleSeeded([true, true, true, false, false, false, true, false], seed).slice(0, count);
 if (!base.includes(true)) base[0] = true;
 if (!base.includes(false)) base[1] = false;
 return base.map(onLevare => ({ onLevare }));
}

// ---------- Notturnia · domanda e risposta ----------
export const RESPONSE_RULES = [
 { title: 'Una variazione', text: 'Mina: «Rispondi tenendo le prime tre note della mia frase. Cambia soltanto l’ultima.»', check: (m, a) => a.slice(0, 3).every((x, i) => x === m[i]) && a[3] !== m[3] },
 { title: 'Lo specchio', text: 'Mina: «Adesso rispondimi a rovescio: riprendi la frase partendo dall’ultima nota.»', check: (m, a) => a.every((x, i) => x === m[3 - i]) },
 { title: 'Più in alto, insieme', text: 'Mina: «Chiudiamo insieme: stessa frase, ma ogni nota un tasto più a destra.»', check: (m, a) => a.every((x, i) => x === m[i] + 1) }
];
export function makeMotif(seed, round) {
 const max = round === 2 ? 3 : 4; let s = (seed * 9301 + round * 49297) % 233280; const m = [];
 for (let i = 0; i < 4; i++) { s = (s * 9301 + 49297) % 233280; m.push(Math.floor(s / 233280 * max)); }
 if (new Set(m).size === 1) m[2] = (m[2] + 1) % max;
 return m;
}

// ---------- Testi delle prove: principi, non soluzioni ----------
export const PUZZLE_INFO = {
 1: { title: 'Le dodici battute scomparse', mech: 'Ricostruisci ad orecchio', scene: 'Nino ha ritrovato una cassetta del vecchio concerto sul fiume e una scaletta strappata. Restano leggibili solo tre accordi. Il resto devi sentirlo.', hint: 'Nino: «In questo blues ci sono tre accordi: La7 è casa, Re7 si allontana, Mi7 tira verso il ritorno. Le prime due righe si muovono piano; l’ultima riga cambia accordo a ogni battuta.»', fact: 'Un blues in dodici battute usa spesso tre accordi (I, IV e V). Esistono molte varianti.' },
 2: { title: 'Il palco rimasto muto', mech: 'Collega l’impianto', scene: 'Il concerto del quartiere è fermo: qualcuno ha staccato tutti i cavi. Ada ti lascia l’impianto e i suoi appunti.', hint: 'Ada: «Il mio mixer ha solo ingressi per microfoni. Un amplificatore non ha uscite: lo si ascolta mettendogli davanti un microfono. Il pedale colora il suono, quindi va prima dell’amplificatore.»', fact: 'Un microfono davanti all’altoparlante è uno dei modi possibili per portare una chitarra al mixer.' },
 4: { title: 'Il ritornello senza casa', mech: 'Riconosci le parti all’ascolto', scene: 'Le registrazioni della canzone di Lia sono state rimontate a caso. Quattro frammenti, nessuna etichetta.', hint: 'Lia: «La promessa è la melodia che torna. Alla fine torna più in alto e più piena. Il ponte è l’unico momento in cui la canzone si fa scura. La strofa racconta, sta in basso.»', fact: 'Strofa, ritornello e ponte possono avere funzioni diverse; un cambio di tonalità verso l’alto rende più intenso un ritornello finale.' },
 5: { title: 'Il posto del silenzio', mech: 'Programma il groove', scene: 'Tito suona una battuta di basso e ti passa la griglia. Otto caselle: «1 e 2 e 3 e 4 e». Accendi solo quelle giuste.', hint: 'Tito: «Il mio basso non suona mai sul 2 e sul 4: lì risponde il rullante. Uno dei colpi arriva subito dopo il 2, mai sopra. Nella seconda metà della battuta lascio respirare.»', fact: 'Le pause fanno parte del ritmo: il groove dipende anche dagli spazi tra le note.' },
 7: { title: 'La prova nella fortezza', mech: 'Tieni il tempo da solo', scene: 'Iris accende il metronomo, conta quattro e poi lo spegne. Devi continuare da solo: prima piano, poi sempre più veloce.', hint: 'Iris: «Prima 60, poi 80, poi 100 battiti al minuto. Non correre: la precisione viene prima della velocità.»', fact: 'BPM significa battiti al minuto. A 60 BPM ogni battito dura un secondo; a 120 dura mezzo secondo.' },
 8: { title: 'Due battute per ritrovarsi', mech: 'Suona la clave a tempo', scene: 'Rosa fa partire il tumbao del basso e delle congas. Manca la clave, il bastoncino che tiene insieme tutti.', hint: 'Rosa: «È una clave son 3–2: tre colpi nella prima battuta (sull’1, sul levare del 2, sul 4), due nella seconda (sul 2 e sul 3). Ascolta il mio esempio, poi suonala tu per due giri di fila.»', fact: 'La clave son 3–2 è un ciclo di due battute di una specifica tradizione afro-cubana. Non rappresenta tutta la musica latinoamericana.' },
 9: { title: 'Il ponte tra i battiti', mech: 'Distingui all’ascolto', scene: 'Il pontile ha perso sei assi. Teo te le restituisce una alla volta: ognuna ha un piccolo giro di chitarra.', hint: 'Teo: «Conta 1 e 2 e 3 e 4 e. Se l’accordo cade insieme al conteggio è sul battere; se cade sulle «e», in mezzo, è sul levare. Le assi in levare vanno sul pontile; quelle in battere tornano in barca, ma vanno riconosciute lo stesso.»', fact: 'L’accento sugli ottavi tra le pulsazioni è frequente nell’accompagnamento reggae, che non si riduce a un solo pattern.' },
 10: { title: 'La risposta del club', mech: 'Rispondi trasformando', scene: 'Mina suona una frase sul pianoforte del Settimo. Nel jazz non si ripete: si risponde.', hint: 'Mina cambierà regola a ogni giro. Ascolta la frase tutte le volte che vuoi: i tasti si illuminano mentre suona.', fact: 'Nell’improvvisazione si possono sviluppare motivi ascoltati. Il jazz comprende molte forme.' }
};

// ---------- Interfaccia ----------
// api: { panel(title, body, actions, tag), close(), audio, later(fn, ms), solved(), back(), toast(msg) }
export function openPuzzle(id, api) {
 const info = PUZZLE_INFO[id];
 const builders = { 1: blues, 2: signal, 4: songForm, 5: groove, 7: tempo, 8: clave, 9: levare, 10: response };
 return builders[id](info, api);
}

const frame = (api, info, inner, actions, extra = '') => api.panel(info.title, `<p>${info.scene}</p><p class="puzzle-hint">${info.hint}</p>${extra}${inner}<p class="fine puzzle-feedback" aria-live="polite"></p>`, actions, 'PROVA · ' + info.mech.toUpperCase());
const feedback = (p, text, good = false) => { const f = p.querySelector('.puzzle-feedback'); f.textContent = text; f.classList.toggle('good', good); };
async function ready(api) { try { await api.audio.init(); } catch {} return api.audio.ctx; }
function watchClose(api, p, onClose) { api.onClose(onClose); }

function chord7(A, rootSemi, t, dur) {
 const base = 110;
 A.tone(semi(base, rootSemi) , t, dur, 'triangle', .1);
 for (const st of [12, 16, 19, 22]) A.tone(semi(base, rootSemi + st), t, dur * .9, 'triangle', .035);
}

function blues(info, api) {
 const answer = BLUES_TARGET.map((c, i) => BLUES_GIVEN.includes(i) ? c : null);
 let attempts = 0, helps = 0;
 const cells = BLUES_TARGET.map((_, i) => `<button class="blues-bar ${BLUES_GIVEN.includes(i) ? 'given' : ''}" data-bar="${i}" ${BLUES_GIVEN.includes(i) ? 'disabled' : ''}><small>${i + 1}</small><b>${answer[i] || '?'}</b></button>`).join('');
 const p = frame(api, info, `<div class="blues-grid">${cells}</div><p class="fine">Tocca una battuta per cambiare accordo: La7 → Re7 → Mi7.</p>`, [
  { label: '▶ Il nastro di Nino', run: () => play(BLUES_TARGET) },
  { label: '▶ La tua versione', run: () => play(answer) },
  { label: 'Confronta', run: compare },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 p.querySelectorAll('.blues-bar:not(.given)').forEach(b => b.onclick = () => {
  const i = +b.dataset.bar, order = ['La7', 'Re7', 'Mi7'];
  answer[i] = order[(order.indexOf(answer[i]) + 1) % 3];
  b.querySelector('b').textContent = answer[i];
  const A = api.audio; if (A.ctx) chord7(A, BLUES_CHORDS[answer[i]], A.ctx.currentTime, .5);
 });
 async function play(seq) {
  const ctx = await ready(api); if (!ctx) return;
  const beat = .42, t0 = ctx.currentTime + .1;
  seq.forEach((c, i) => {
   if (c) chord7(api.audio, BLUES_CHORDS[c], t0 + i * beat * 2, beat * 1.8);
   api.later(() => { p.querySelectorAll('.blues-bar').forEach(b => b.classList.toggle('playing', +b.dataset.bar === i)); }, (i * beat * 2 + .1) * 1000);
  });
  api.later(() => p.querySelectorAll('.blues-bar').forEach(b => b.classList.remove('playing')), (seq.length * beat * 2 + .2) * 1000);
 }
 function compare() {
  if (answer.includes(null)) { feedback(p, 'Ci sono ancora battute con il punto interrogativo.'); return; }
  const m = bluesMatches(answer); attempts++;
  if (m === 12) { feedback(p, 'Le dodici battute coincidono con il nastro.', true); api.later(api.solved, 700); return; }
  let extra = '';
  if (attempts >= 3 && helps < 4) {
   const wrong = answer.findIndex((c, i) => c !== BLUES_TARGET[i]);
   helps++; extra = ` Nino canticchia la battuta ${wrong + 1}: è ${BLUES_TARGET[wrong]}.`;
  }
  feedback(p, `${m} battute su 12 coincidono con il nastro.${extra}`);
 }
}

function signal(info, api) {
 const links = {};
 const rows = Object.entries(SIGNAL_DEVICES).map(([k, d]) => `<label class="signal-row"><span>${d.name} →</span><select data-from="${k}"><option value="">— scollegato —</option>${d.to.map(t => `<option value="${t}">${SIGNAL_DEVICES[t]?.name || ({ casse: 'Casse attive', cuffie: 'Cuffie del fonico' })[t]}</option>`).join('')}</select></label>`).join('');
 const p = frame(api, info, `<div class="signal-board">${rows}</div>`, [
  { label: 'Accendi l’impianto', run: test },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 p.querySelectorAll('select').forEach(s => s.onchange = () => { links[s.dataset.from] = s.value || undefined; });
 async function test() {
  const r = diagnoseSignal(links); await ready(api); const A = api.audio, t = A.ctx?.currentTime || 0;
  if (r.ok) { if (A.ctx) { chord7(A, 0, t, .4); chord7(A, 0, t + .45, .4); chord7(A, 10, t + .9, .8); } feedback(p, r.message, true); api.later(api.solved, 1200); }
  else { if (A.ctx) A.tone(r.message.includes('Larsen') || r.message.includes('fischia') ? 1800 : 60, t, .6, r.message.includes('Larsen') || r.message.includes('fischia') ? 'sine' : 'sawtooth', .05); feedback(p, r.message); }
 }
}

function songForm(info, api) {
 const order = shuffleSeeded(SONG_FRAGMENTS, Date.now() % 997 + 3);
 const letters = ['A', 'B', 'C', 'D'];
 const contour = f => `<svg viewBox="0 0 80 30" aria-hidden="true"><polyline points="${f.notes.map((n, i) => `${5 + i * 10},${27 - n * 1.6}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
 const cards = order.map((f, i) => `<button class="fragment" data-frag="${i}"><b>▶ ${letters[i]}</b>${contour(f)}</button>`).join('');
 const slots = SONG_SECTIONS.map((s, i) => `<label class="signal-row"><span>${i + 1}. ${s}</span><select data-slot="${i}"><option value="">—</option>${letters.map((l, j) => `<option value="${j}">Frammento ${l}</option>`).join('')}</select></label>`).join('');
 const p = frame(api, info, `<div class="fragments">${cards}</div><div class="signal-board">${slots}</div>`, [
  { label: 'Rimonta la canzone', run: check },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 p.querySelectorAll('.fragment').forEach(b => b.onclick = () => playFrag(order[+b.dataset.frag], b));
 async function playFrag(f, el) {
  const ctx = await ready(api); if (!ctx) return; const A = api.audio, base = 261.63, t0 = ctx.currentTime + .05, d = .26;
  el?.classList.add('playing'); api.later(() => el?.classList.remove('playing'), f.notes.length * d * 1000 + 200);
  f.notes.forEach((n, i) => A.tone(semi(base, n), t0 + i * d, d * .9, 'triangle', f.vol));
  for (let k = 0; k < 2; k++) for (const st of (f.minor ? [0, 3, 7] : [0, 4, 7])) A.tone(semi(base / 2, f.chord + st), t0 + k * d * 4, d * 3.8, 'sine', .035 + (f.id === 'finale' ? .02 : 0));
 }
 function check() {
  const assign = [...p.querySelectorAll('[data-slot]')].map(s => s.value === '' ? null : order[+s.value].id);
  if (assign.includes(null)) { feedback(p, 'Assegna un frammento a ogni parte.'); return; }
  const m = songOrderMatches(assign);
  if (m === 4) { feedback(p, 'La canzone torna intera: partenza, promessa, dubbio, promessa più forte.', true); api.later(api.solved, 900); }
  else feedback(p, `${m} parti su 4 sono al loro posto. Riascolta: dove la canzone si fa scura? Dove la promessa sale?`);
 }
}

function groove(info, api) {
 const steps = Array(8).fill(0), labels = ['1', 'e', '2', 'e', '3', 'e', '4', 'e'];
 const p = frame(api, info, `<div class="groove-grid">${labels.map((l, i) => `<button data-step="${i}" aria-pressed="false"><small>${l}</small></button>`).join('')}</div>`, [
  { label: '▶ Ascolta Tito', run: () => play(GROOVE_TARGET, true) },
  { label: '▶ Prova la tua', run: () => play(steps, false) },
  { label: 'Confronta', run: check },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 p.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { const i = +b.dataset.step; steps[i] = steps[i] ? 0 : 1; b.setAttribute('aria-pressed', String(!!steps[i])); b.classList.toggle('on', !!steps[i]); });
 async function play(pattern, master) {
  const ctx = await ready(api); if (!ctx) return; const A = api.audio, e = .3, t0 = ctx.currentTime + .1;
  for (let loop = 0; loop < 2; loop++) for (let i = 0; i < 8; i++) {
   const t = t0 + (loop * 8 + i) * e;
   A.drum(2, t, .03); if (i === 2 || i === 6) A.drum(1, t, .08);
   if (pattern[i]) A.tone(semi(98, i === 4 ? 7 : 0), t, e * .8, 'triangle', .14);
   if (!master) api.later(() => p.querySelectorAll('[data-step]').forEach(b => b.classList.toggle('playing', +b.dataset.step === i)), (t - ctx.currentTime) * 1000);
  }
  api.later(() => p.querySelectorAll('[data-step]').forEach(b => b.classList.remove('playing')), (16 * e + .2) * 1000);
 }
 function check() {
  const d = grooveDiff(steps);
  if (d.ok) { feedback(p, 'Tito sorride: «Senti quanto spazio c’è? Ora il rullante respira.»', true); api.later(api.solved, 900); return; }
  feedback(p, [d.extra ? `${d.extra} ${d.extra > 1 ? 'note cadono' : 'nota cade'} dove Tito lascia silenzio.` : '', d.missing ? `${d.missing > 1 ? 'Mancano' : 'Manca'} ${d.missing} ${d.missing > 1 ? 'colpi' : 'colpo'} del suo groove.` : ''].join(' '));
 }
}

function tempo(info, api) {
 let stage = 0, taps = [], listening = false;
 const p = frame(api, info, `<div class="tempo-box"><div class="tempo-stage">${TEMPO_STAGES.map((b, i) => `<span data-st="${i}">${b} BPM</span>`).join('')}</div><button class="tap-pad" aria-label="Batti il tempo">BATTI<br><small>o premi A</small></button><p class="tempo-readout">Premi «Conta quattro», ascolta e continua da solo per otto colpi.</p></div>`, [
  { label: 'Conta quattro', run: start },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 const pad = p.querySelector('.tap-pad'), readout = p.querySelector('.tempo-readout');
 const mark = () => p.querySelectorAll('[data-st]').forEach(s => s.className = +s.dataset.st < stage ? 'done' : +s.dataset.st === stage ? 'now' : '');
 mark();
 const onTap = e => { if (e.type === 'keydown' && e.key !== ' ' && e.key.toLowerCase() !== 'j') return; if (e.type === 'keydown') e.preventDefault(); tap(); };
 pad.onpointerdown = e => { e.preventDefault(); tap(); };
 document.addEventListener('keydown', onTap, true);
 watchClose(api, p, () => document.removeEventListener('keydown', onTap, true));
 async function start() {
  const ctx = await ready(api); if (!ctx) return; const bpm = TEMPO_STAGES[stage], b = 60 / bpm;
  taps = []; listening = false; readout.textContent = 'Ascolta…';
  for (let i = 0; i < 4; i++) { api.audio.drum(i ? 2 : 3, ctx.currentTime + .1 + i * b, .12); api.audio.tone(i ? 880 : 1320, ctx.currentTime + .1 + i * b, .05, 'square', .04); }
  api.later(() => { listening = true; readout.textContent = 'Ora tu: continua il tempo (0 / 8)'; }, (.1 + 3.5 * b) * 1000);
 }
 function tap() {
  pad.classList.add('hit'); api.later(() => pad.classList.remove('hit'), 90);
  if (!listening) return;
  taps.push(performance.now() / 1000); readout.textContent = `Ora tu: continua il tempo (${taps.length} / 8)`;
  if (taps.length < 8) return;
  listening = false;
  const r = tempoResult(taps, TEMPO_STAGES[stage]);
  if (r.ok) {
   stage++; mark();
   if (stage === TEMPO_STAGES.length) { readout.textContent = `${r.bpm} BPM, regolare. Iris: «Pulito, poi veloce. Ecco come si cresce.»`; feedback(p, 'Tre tempi tenuti senza metronomo.', true); api.later(api.solved, 1100); }
   else readout.textContent = `${r.bpm} BPM: preciso. Prossimo tempo: ${TEMPO_STAGES[stage]} BPM. Premi «Conta quattro».`;
  } else readout.textContent = !r.steady ? `Colpi irregolari (circa ${r.bpm} BPM). Respira e riprova.` : r.bpm > TEMPO_STAGES[stage] ? `Hai corso: ${r.bpm} BPM invece di ${TEMPO_STAGES[stage]}. Riprova.` : `Hai rallentato: ${r.bpm} BPM invece di ${TEMPO_STAGES[stage]}. Riprova.`;
 }
}

function clave(info, api) {
 const bpm = 96, step = 60 / bpm / 4, cycle = step * 32, labels = ['1', 'e', '2', 'e', '3', 'e', '4', 'e'];
 let running = false, cycleStart = 0, taps = [], good = 0, cyclesLeft = 0, demo = false;
 const grid = [0, 1].map(bar => `<div class="clave-bar">${labels.map((l, i) => `<span data-cell="${bar * 8 + i}"><small>${l}</small></span>`).join('')}</div>`).join('');
 const p = frame(api, info, `<div class="clave-grid">${grid}</div><button class="tap-pad" aria-label="Suona la clave">CLAVE<br><small>o premi A</small></button><p class="tempo-readout">Due giri corretti di fila per ritrovare i percussionisti.</p>`, [
  { label: '▶ Esempio di Rosa', run: () => start(true) },
  { label: 'Suona tu', run: () => start(false) },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 const pad = p.querySelector('.tap-pad'), readout = p.querySelector('.tempo-readout');
 const onKey = e => { if (e.key === ' ' || e.key.toLowerCase() === 'j') { e.preventDefault(); tap(); } };
 pad.onpointerdown = e => { e.preventDefault(); tap(); };
 document.addEventListener('keydown', onKey, true);
 watchClose(api, p, () => { document.removeEventListener('keydown', onKey, true); api.audio.stop(); running = false; });
 async function start(isDemo) {
  const ctx = await ready(api); if (!ctx) return; api.audio.stop();
  demo = isDemo; running = true; good = 0; taps = []; cyclesLeft = isDemo ? 1 : 8;
  cycleStart = ctx.currentTime + .3;
  const cycles = cyclesLeft;
  for (let c = 0; c < cycles; c++) for (let s = 0; s < 32; s++) {
   const t = cycleStart + c * cycle + s * step;
   if (s % 2 === 0) api.audio.drum(2, t, .02);
   if (s % 16 === 6 || s % 16 === 12) api.audio.tone(73.4, t, step * 3, 'triangle', .12);
   if (s % 16 === 8 || s % 16 === 14) api.audio.tone(330, t, .08, 'sine', .05);
   if (isDemo && CLAVE_STEPS.includes(s)) api.audio.tone(2100, t, .05, 'square', .05);
  }
  readout.textContent = isDemo ? 'Ascolta dove cade la clave.' : 'Suona la clave: due giri giusti di fila.';
  const tick = () => {
   if (!running || !p.isConnected) return; const now = api.audio.ctx.currentTime;
   const pos = (now - cycleStart) / step;
   p.querySelectorAll('[data-cell]').forEach(c => c.classList.toggle('now', pos >= 0 && Math.floor((pos % 32) / 2) === +c.dataset.cell));
   if (demo) p.querySelectorAll('[data-cell]').forEach(c => c.classList.toggle('clave', CLAVE_STEPS.includes(+c.dataset.cell * 2)));
   if (now >= cycleStart + cycle) {
    if (!demo) {
     const hits = taps.filter(t => t >= cycleStart - .12 && t < cycleStart + cycle - .12).map(t => t - cycleStart);
     const ok = claveCycle(hits, step);
     good = ok ? good + 1 : 0;
     readout.textContent = ok ? (good >= 2 ? 'Due giri perfetti!' : 'Giro corretto. Ancora uno!') : hits.length ? 'Il giro non torna: qualche colpo fuori posto.' : 'Non hai suonato in questo giro.';
     if (good >= 2) { running = false; api.audio.stop(); feedback(p, 'Rosa: «Adesso il cerchio si chiude.»', true); api.later(api.solved, 900); return; }
    }
    taps = taps.filter(t => t >= cycleStart + cycle - .12); cycleStart += cycle; cyclesLeft--;
    if (cyclesLeft <= 0) { running = false; p.querySelectorAll('[data-cell]').forEach(c => c.classList.remove('now', 'clave')); if (!demo) readout.textContent = 'Il ciclo si è fermato. Riprova con «Suona tu».'; return; }
   }
   api.later(tick, 30);
  };
  tick();
 }
 function tap() {
  pad.classList.add('hit'); api.later(() => pad.classList.remove('hit'), 90);
  const A = api.audio; if (!A.ctx) return; A.tone(2100, A.ctx.currentTime, .05, 'square', .06);
  if (!running || demo) return;
  taps.push(A.ctx.currentTime);
 }
}

function levare(info, api) {
 const clips = levareClips(Date.now() % 1000 + 1), answers = Array(clips.length).fill(null);
 let current = 0, lights = false;
 const p = frame(api, info, `<div class="planks">${clips.map((_, i) => `<span data-plank="${i}"></span>`).join('')}</div><div class="levare-lamps">${Array(8).fill(0).map((_, i) => `<i data-lamp="${i}" class="${i % 2 ? 'off' : 'beat'}"></i>`).join('')}</div><p class="tempo-readout">Asse 1 di ${clips.length}</p>`, [
  { label: '▶ Ascolta l’asse', run: play },
  { label: 'Battere', run: () => answer(false) },
  { label: 'Levare', run: () => answer(true) },
  { label: 'Mostra le luci', run: () => { lights = !lights; feedback(p, lights ? 'Le luci si accendono con gli accordi: i cerchi grandi sono i battiti, quelli piccoli le «e».' : ''); }, secondary: true },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 const readout = p.querySelector('.tempo-readout');
 async function play() {
  const ctx = await ready(api); if (!ctx) return; const A = api.audio, b = 60 / 84, t0 = ctx.currentTime + .1, clip = clips[current];
  for (let rep = 0; rep < 2; rep++) for (let beat = 0; beat < 4; beat++) {
   const t = t0 + (rep * 4 + beat) * b;
   A.drum(2, t, .03); if (beat === 2) { A.drum(0, t, .1); A.drum(1, t, .06); }
   const ct = clip.onLevare ? t + b / 2 : t;
   for (const st of [0, 4, 7]) A.tone(semi(261.63, st), ct, b * .22, 'square', .025);
   if (lights) { const lamp = beat * 2 + (clip.onLevare ? 1 : 0); api.later(() => { const el = p.querySelector(`[data-lamp="${lamp}"]`); el?.classList.add('lit'); api.later(() => el?.classList.remove('lit'), 160); }, (ct - ctx.currentTime) * 1000); }
  }
 }
 function answer(onLevare) {
  if (current >= clips.length) return;
  const right = clips[current].onLevare === onLevare;
  const plank = p.querySelector(`[data-plank="${current}"]`);
  if (!right) { feedback(p, 'L’asse scricchiola: non era così. Riascoltala e conta ad alta voce.'); plank.classList.add('wrong'); api.later(() => plank.classList.remove('wrong'), 600); return; }
  answers[current] = onLevare; plank.classList.add(onLevare ? 'levare' : 'battere');
  feedback(p, onLevare ? 'Levare: l’asse regge.' : 'Battere: Teo la rimette in barca. Giusto così.', true);
  current++;
  if (current === clips.length) { readout.textContent = 'Il pontile è completo.'; api.later(api.solved, 900); }
  else readout.textContent = `Asse ${current + 1} di ${clips.length}`;
 }
}

function response(info, api) {
 const seed = Date.now() % 997 + 11, base = 233.08, pads = [0, 4, 7, 10];
 let round = 0, motif = makeMotif(seed, 0), input = [], busy = false;
 const p = frame(api, info, `<p class="rule"></p><div class="puzzle-sequence">${pads.map((_, i) => `<button class="puzzle-key" data-pad="${i}" aria-label="Tasto ${i + 1}">${i + 1}</button>`).join('')}</div><p class="tempo-readout"></p>`, [
  { label: '▶ La frase di Mina', run: play },
  { label: 'Ricomincia la risposta', run: () => { input = []; show(); } },
  { label: 'Esci', run: api.back, secondary: true }
 ]);
 const readout = p.querySelector('.tempo-readout');
 const show = () => { p.querySelector('.rule').innerHTML = `<strong>Giro ${round + 1} di 3 · ${RESPONSE_RULES[round].title}.</strong> ${RESPONSE_RULES[round].text}`; readout.textContent = `La tua risposta: ${input.map(n => n + 1).join(' · ') || '…'}`; };
 const flash = i => { const b = p.querySelector(`[data-pad="${i}"]`); b.classList.add('lit'); try { api.audio.tone(semi(base, pads[i]), api.audio.ctx.currentTime, .32, 'triangle', .13); } catch {} api.later(() => b.classList.remove('lit'), 260); };
 show();
 async function play() { if (busy) return; await ready(api); busy = true; motif.forEach((n, i) => api.later(() => flash(n), 150 + i * 520)); api.later(() => busy = false, 150 + 4 * 520); }
 p.querySelectorAll('[data-pad]').forEach(b => b.onclick = async () => {
  if (busy) return; await ready(api); flash(+b.dataset.pad); input.push(+b.dataset.pad); show();
  if (input.length < 4) return;
  if (RESPONSE_RULES[round].check(motif, input)) {
   round++; input = [];
   if (round === 3) { feedback(p, 'Mina ride: «Ecco, adesso stiamo parlando.»', true); readout.textContent = 'Tre risposte, tre idee.'; api.later(api.solved, 900); return; }
   motif = makeMotif(seed, round); feedback(p, 'Risposta accolta. Mina cambia regola.', true); show(); api.later(play, 700);
  } else { feedback(p, 'Mina scuote la testa: la risposta non segue la regola. Riascolta e riprova.'); input = []; show(); }
 });
 play();
}
