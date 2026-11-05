import {
 playIntro
} from './intro.js';
import {
 actionFor,
 pollGamepad,
 moveFocus,
 keyName,
 ACTIONS,
 ACTION_NAMES,
 DEFAULT_KEYS
} from './input.js';
import {
 abilityDex,
 journeyRoute,
 MAP_POINTS,
 metroReason,
 metroSpawn,
 METRO_STOPS
} from './progress.js';
import {
 drawConcert
} from './concert.js';
import {
 PEOPLE,
 TEACHER_ART,
 RIVAL_LINES,
 ROOMS,
 ROAD_SCENES,
 roadKey,
 DEDUCTION,
 BAND_NAMES,
 MESSAGES,
 newMessages,
 questsFor,
 metroPassengers,
 STRANGER_LINES,
 chapter,
 clueText,
 clueIndex,
 cluesFound,
 mysteryReady,
 mysteryEnding
} from './adventure.js';
import {
 ROUTES
} from './routes.js';
import {
 openPuzzle,
 PUZZLE_INFO
} from './puzzles.js';
import {
 INSTRUMENTS,
 CITIES,
 MUSIC_CITIES,
 initialState,
 validateState,
 neighbors,
 findPath,
 stepToward,
 gate,
 month,
 makeChart,
 hitWindow,
 findNote,
 accuracy,
 award
} from './core.js';
import {
 MusicAudio
} from './audio.js';
import {
 drawSprite,
 hasAtlas,
 atlases,
 loadExtras
} from './assets.js';
import {
 TILE,
 WIDTH,
 HEIGHT,
 REGION,
 townLayout,
 roadLayout,
 townGates,
 arrival,
 pointOnSide,
 OPPOSITE,
 isWalkable,
 gateAt,
 facingFor,
 cameraFor,
 renderWorld,
 drawCharacter,
 setHeroLook,
 heroLookAvailable,
 drawStage as smoothStage
} from './world.js';
const $ = id => document.getElementById(id),
 canvas = $('game'),
 ctx = canvas.getContext('2d'),
 overlay = $('overlay'),
 audio = new MusicAudio(),
 QA = new URLSearchParams(location.search).get('qa') === '1',
 SAVE = QA ? 'b3pz-tour-v1-qa' : 'b3pz-tour-v1';
let W = 960,
 H = 600,
 pixelScale = 1;
const T = 24,
 keys = new Set();
let state = initialState(),
 saved = null,
 mode = 'world',
 area = 'town',
 road = null,
 objects = [],
 solids = [],
 song = null,
 near = null,
 last = performance.now(),
 walk = 0,
 toastTimer, puzzleTimers = [],
 path = [],
 tapObject = null,
 layout = townLayout(0),
 room = null,
 transitioning = false,
 portalCooldown = 0,
 hasMoved = false;
try {
 saved = validateState(JSON.parse(localStorage.getItem(SAVE)));
} catch {}

function syncAudio() {
 audio.volume = state.settings.volume;
 audio.muted = state.settings.muted;
 audio.update();
 setHeroLook(state.look);
 $('soundBtn').textContent = audio.muted ? 'OFF ♫' : 'ON ♪';
}

function save() {
 state.scene = area === 'road' ? {
  type: 'road',
  from: road.from,
  to: road.to
 } : area === 'interior' ? {
  type: 'interior',
  label: room.entry.label
 } : null;
 try {
  localStorage.setItem(SAVE, JSON.stringify(area === 'metro' && ride ? { ...state, ...ride.dest, facing: 'south', scene: null } : state));
  $('saveLabel').textContent = 'Partita salvata su questo dispositivo';
 } catch {
  $('saveLabel').textContent = 'Salvataggio non disponibile: esporta dal menu';
 }
}

function toast(message) {
 $('toast').textContent = message;
 $('toast').hidden = false;
 clearTimeout(toastTimer);
 toastTimer = setTimeout(() => $('toast').hidden = true, 3500);
}

let puzzleCleanups = [];

function runPuzzleCleanups() {
 const list = puzzleCleanups;
 puzzleCleanups = [];
 for (const f of list) try {
  f();
 } catch {}
}

function clearPuzzleTimers() {
 puzzleTimers.forEach(clearTimeout);
 puzzleTimers = [];
}

function panel(title, body, actions = [], tag = 'IL TACCUINO DELLA BAND') {
 runPuzzleCleanups();
 clearPuzzleTimers();
 $('screen').classList.add('has-dialog');
 keys.clear();
 path = [];
 tapObject = null;
 near = null;
 $('prompt').hidden = true;
 overlay.hidden = false;
 overlay.innerHTML = '';
 const p = document.createElement('section');
 p.className = 'panel';
 p.setAttribute('role', 'dialog');
 p.setAttribute('aria-label', title.replace(/<[^>]*>/g, ' '));
 p.setAttribute('aria-modal', 'true');
 p.innerHTML = `<div class="eyebrow">${tag}</div><h3>${title}</h3>${body}<div class="actions"></div>`;
 overlay.appendChild(p);
 for (const a of actions) {
  const b = document.createElement('button');
  b.className = 'btn' + (a.secondary ? ' secondary' : '');
  b.textContent = a.label;
  b.addEventListener('click', a.run);
  p.querySelector('.actions').appendChild(b);
 }
 overlay.classList.remove('clear');
 const complex = '.blues-grid,.signal-board,.fragments,.groove-grid,.tempo-box,.clave-grid,.planks,.puzzle-sequence,.atlas-scroll,.dex-entries,.metro-stops,.metro-map,.hero-pick,.name-entry,.controls-list,.deduce-options,.case-parts,.instrument-choices,select,input,.result-number,.stat-row,.clue-list,.region-map';
 if (!p.querySelector(complex) && !p.classList.contains('narrative')) {
  p.classList.add('dialogue');
  overlay.classList.add('clear');
 }
 p.querySelector('button')?.focus();
 if (p.classList.contains('dialogue')) paginate(p);
 return p;
}

// Dialoghi come nei giochi di una volta: il testo scorre lettera per lettera, un riquadro alla volta.
// A (o un tocco) completa la frase o passa alla successiva; le scelte compaiono solo alla fine.
const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function splitLong(el) {
 if (el.children.length || el.textContent.length < 190) return [el];
 const sentences = el.textContent.match(/[^.!?…»]+[.!?…]+[»”]?\s*|[^.!?…]+$/g) || [el.textContent];
 const chunks = [];
 let cur = '';
 for (const x of sentences) {
  if (cur && (cur + x).length > 170) {
   chunks.push(cur.trim());
   cur = '';
  }
  cur += x;
 }
 if (cur.trim()) chunks.push(cur.trim());
 if (chunks.length < 2) return [el];
 const made = chunks.map(t => {
  const q = document.createElement('p');
  q.textContent = t;
  return q;
 });
 el.replaceWith(...made);
 return made;
}
function paginate(p) {
 const actions = p.querySelector('.actions');
 const pages = [...p.querySelectorAll('p')].filter(x => !x.classList.contains('fine') && !actions?.contains(x) && !x.closest('.person-card, .clue-card')).flatMap(splitLong);
 if (!pages.length) return;
 const fines = [...p.querySelectorAll('.fine')];
 const more = document.createElement('span');
 more.className = 'more-arrow';
 more.textContent = '▼';
 more.setAttribute('aria-hidden', 'true');
 p.appendChild(more);
 p.tabIndex = -1;
 let i = 0, timer = null, typing = false, full = [];
 const finish = () => {
  clearInterval(timer);
  timer = null;
  full.forEach(([node, text]) => node.textContent = text);
  typing = false;
  const last = i === pages.length - 1;
  more.hidden = last;
  if (actions) actions.hidden = !last;
  fines.forEach(f => f.hidden = !last);
  if (last) (actions?.querySelector('button') || p).focus();
 };
 const show = () => {
  pages.forEach((x, j) => x.hidden = j !== i);
  more.hidden = true;
  if (actions) actions.hidden = true;
  fines.forEach(f => f.hidden = true);
  p.focus();
  const walker = document.createTreeWalker(pages[i], NodeFilter.SHOW_TEXT);
  full = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) full.push([n, n.textContent]);
  if (REDUCED_MOTION) return finish();
  full.forEach(([node]) => node.textContent = '');
  typing = true;
  let k = 0, node = 0;
  timer = setInterval(() => {
   for (let step = 0; step < 2 && node < full.length; step++) {
    const [n, text] = full[node];
    n.textContent = text.slice(0, ++k);
    if (k >= text.length) {
     node++;
     k = 0;
    }
   }
   if (node >= full.length) finish();
  }, 26);
  puzzleTimers.push(timer);
 };
 p._advance = () => {
  if (typing) {
   finish();
   return true;
  }
  if (i < pages.length - 1) {
   i++;
   show();
   return true;
  }
  return false;
 };
 p.addEventListener('pointerdown', e => {
  if (e.target.closest('button, input, select, a')) return;
  p._advance();
 });
 show();
}

function close() {
 $('screen').classList.remove('has-dialog');
 runPuzzleCleanups();
 clearPuzzleTimers();
 overlay.hidden = true;
 overlay.innerHTML = '';
 keys.clear();
 canvas.focus();
}

function nextStop() {
 let best = null;
 for (const m of MUSIC_CITIES) {
  if (state.passes.includes(m.id)) continue;
  const r = journeyRoute(state, m.id);
  if (r && (!best || r.legs.length < best.r.legs.length)) best = { m, r };
 }
 if (!best) return 'Otto città, otto pass. La Mappa del telefono aiuta a scegliere la prossima tappa.';
 const first = best.r.legs[0];
 return `Prossima tappa: ${best.m.name} (${best.m.genre.toLowerCase()}). ${first.to === best.m.id ? 'È qui vicino' : 'Passa da ' + CITIES[first.to].name}: ${first.mode === 'Sentiero' ? 'segui la strada che esce dal paese' : first.mode.toLowerCase()}. L’itinerario è nella Mappa del telefono.`;
}

let lastObjective = '',
 lastPlace = '',
 signTimer,
 pendingSign;

function showAreaSign(name, sub, ms, note = false) {
 clearTimeout(pendingSign);
 if (!overlay.hidden || mode !== 'world') {
  pendingSign = setTimeout(() => showAreaSign(name, sub, ms, note), 300);
  return;
 }
 const el = $('areaSign');
 el.classList.toggle('objective-sign', !name || note);
 $('areaSignName').textContent = name || 'Obiettivo';
 $('areaSignSub').textContent = sub || '';
 el.hidden = false;
 el.classList.remove('leaving');
 clearTimeout(signTimer);
 signTimer = setTimeout(() => {
  el.classList.add('leaving');
  signTimer = setTimeout(() => el.hidden = true, 350);
 }, ms);
}

function fameTitle() {
 return state.xp >= 900 ? 'BAND DA FESTIVAL' : state.xp >= 500 ? 'BAND DELLA REGIONE' : state.xp >= 200 ? 'BAND DI PAESE' : 'BAND DI GARAGE';
}

function updateJournal() {
 const c = CITIES[state.city];
 $('location').textContent = area === 'road' ? `SENTIERO · ${CITIES[road.from].name.toUpperCase()} → ${CITIES[road.to].name.toUpperCase()}` : c.name.toUpperCase();
 $('season').textContent = `${chapter(state)} · ${state.passes.length} PASS`;
 $('sceneBadge').textContent = `${String(state.city+1).padStart(2,'0')} / ${area==='road'?'IN CAMMINO':c.genre.toUpperCase()}`;
 $('passCount').innerHTML = `${state.passes.length}<span>/8</span>`;
 $('passGrid').innerHTML = MUSIC_CITIES.map(c => `<div class="stamp ${state.passes.includes(c.id)?'earned':''}" title="${c.genre}">${c.genre.slice(0,3).toUpperCase()}</div>`).join('');
 let objective = state.stage === 'school' ? 'Ultimo giorno di scuola. Raggiungi la scuola a nord-est del paese.' : state.stage === 'practice' ? 'Gli amici ti aspettano nel garage, a ovest della piazza.' : state.stage === 'rival' ? 'La band rivale è in piazza. È ora della prima sfida.' : state.finished ? 'Il festival è vostro. Puoi tornare nei luoghi del viaggio e suonare ancora.' : state.passes.length === 8 && !state.homeShow ? (state.city === 0 ? 'Il paese è in piazza: sali sul palco per il concerto a casa.' : 'Torna a Borgo delle Cicale: il concerto a casa vi aspetta.') : state.homeShow ? (state.city === 11 ? 'Il palco del festival è a nord della piazza. Emma vi aspetta per presentarvi.' : 'Raggiungi Settembre e sali sul palco del festival.') : c.type === 'music' && !state.puzzles.includes(c.id) ? `Trova ${c.teacher} in piazza e risolvi la prova di ${c.genre.toLowerCase()}.` : c.type === 'music' && !state.passes.includes(c.id) ? 'La prova è superata. Raggiungi il palco e conquista il pass.' : nextStop();
 if (state.stage === 'tour' && !state.finished && mysteryReady(state) && state.mystery < 2) objective += ' · Gli otto indizi sono completi: Dario vi aspetta all’archivio di Valdaccordo.';
 if (state.city === 3 && state.stage === 'tour') {
  const q = state.transport;
  objective = q.bike === 0 ? 'Arturo, in piazza, cerca qualcuno che lo aiuti a rimettere in strada una vecchia bici.' : q.bike === 1 ? 'Missione bici: chi ha preso la pompa? Chiedi ai ragazzi del campeggio in piazza.' : q.bike === 2 ? 'Missione bici: riporta la pompa ad Arturo.' : q.metro === 1 ? 'Missione metro: entra nella Stazione Nord e ricomponi gli annunci.' : q.metro === 2 ? 'Missione metro: riporta il nastro ad Arturo.' : objective;
 }
 if (area === 'interior' && state.stage === 'school' && room.entry.kind === 'school') objective = 'Il maestro Riva ti aspetta davanti alla lavagna.';
 if (area === 'interior' && state.stage === 'practice' && room.entry.kind === 'garage') objective = 'Nico e Vale ti aspettano per la prima prova.';
 if (area === 'interior' && state.stage === 'practice' && room.entry.kind === 'school') objective = 'Nico e Vale ti aspettano nella sala prove, a sud-ovest della piazza.';
 if (objective !== lastObjective && state.introDone && lastObjective && lastPlace) showAreaSign(null, objective, 4200);
 lastObjective = objective;
 checkMessages();
 $('objective').textContent = objective;
 $('areaSubtitle').textContent = area === 'interior' ? room.entry.label.toUpperCase() : area === 'road' ? 'SENTIERO · ' + CITIES[road.to].genre.toUpperCase() : ({
  Casa: 'CAMPI, CICALE E IL PRIMO ACCORDO',
  Blues: 'UN PONTE SUL FIUME',
  Rock: 'OFFICINE E AMPLIFICATORI',
  Pop: 'GIARDINI E TEATRO',
  Metal: 'LA MUSICA TRA LE MONTAGNE',
  Reggae: 'L’ISOLA DEL LEVARE',
  Jazz: 'LE LUCI DELLA NOTTE',
  Latino: 'IL RITMO DEL PORTO',
  Funk: 'CORTILI CHE SUONANO',
  Crocevia: 'BINARI, TENDE E NUOVE STRADE',
  Archivio: 'LE STORIE RIMASTE A METÀ',
  Festival: 'IL PALCO DI SETTEMBRE'
 })[c.genre];
 const placeKey = area + ':' + state.city + ':' + (road ? road.from + '-' + road.to : '') + ':' + (room?.entry.label || '');
 if (placeKey !== lastPlace && state.introDone) {
  lastPlace = placeKey;
  if (area === 'metro') showAreaSign('Metro delle Otto Strade', 'In viaggio verso ' + CITIES[ride?.to ?? state.city].name, 2600);
  else showAreaSign(area === 'road' ? CITIES[road.from].name + ' → ' + CITIES[road.to].name : area === 'interior' ? room.entry.label : c.name, area === 'road' ? 'Sentiero' : area === 'interior' ? c.name : $('areaSubtitle').textContent || c.genre, 2600);
 }
 $('instrumentTag').textContent = `${INSTRUMENTS[state.instrument].name.toUpperCase()} · ${state.bike?'IN BICICLETTA':state.bicycle?'BICI SBLOCCATA · B':'A PIEDI'} · ${fameTitle()}`;
}

// Schermata del titolo con il menu principale (vedi intro.js).
let introControl = null;
function titleOptions(skip) {
 return {
  audio,
  skip,
  getSave: () => saved,
  describeSave: s => `<strong>${s.bandName || 'Band senza nome'}</strong><span>${CITIES[s.city].name} · ${month(s).toLowerCase()}</span><span>${INSTRUMENTS[s.instrument]?.name || 'Strumento da scegliere'} · pass ${s.passes.length} / 8 · luoghi ${s.visited.length} / 12</span>`,
  onNew: () => {
   introControl = null;
   intro(0);
  },
  onLoad: () => {
   introControl = null;
   state = saved;
   syncAudio();
   restoreScene();
   close();
  },
  onImport: done => importSave(() => {
   introControl = null;
   done();
  })
 };
}
function welcome() {
 close();
 introControl = playIntro(titleOptions(true));
 introControl.menu();
}

const maestroPortrait = `<svg viewBox="0 0 130 170" aria-label="Il maestro Riva" role="img"><path d="M17 173Q14 111 65 108Q116 111 113 173" fill="#607e6d"/><path d="M51 109L65 139L80 109" fill="#f6e8ba"/><path d="M56 118L65 147L74 118" fill="#b67d53"/><ellipse cx="65" cy="74" rx="33" ry="42" fill="#e3b68d"/><path d="M30 69Q20 18 65 20Q111 18 100 70L87 43Q63 55 43 42Z" fill="#d1cfb8"/><path d="M31 62Q20 80 35 93M99 62Q111 80 96 93" fill="#e3b68d"/><g fill="none" stroke="#42594f" stroke-width="3"><ellipse cx="51" cy="72" rx="14" ry="11"/><ellipse cx="80" cy="72" rx="14" ry="11"/><path d="M65 70H67"/></g><path d="M50 93Q65 78 81 93Q71 101 65 94Q59 101 50 93" fill="#c3bca3"/><path d="M60 105Q65 108 71 104" fill="none" stroke="#9d765e" stroke-width="2"/></svg>`;

function intro(page) {
 const pages = [
  ['C’è musica, anche qui.', '«Mi chiamo Riva. Insegno musica nella vostra scuola. Qualcuno pensa che in questi paesi non succeda mai niente. Io credo che non abbia ascoltato abbastanza.»'],
  ['Otto città. Otto modi di suonare.', '«Oltre i campi ci sono officine, porti, club aperti fino a tardi. In ogni città la musica ha un accento diverso. Se vuoi impararlo, devi metterti in cammino.»'],
  ['Prima di tutto, gli amici.', '«Tu, Nico e Vale siete quelli dell’ultimo banco. Quelli che vengono scelti per ultimi. Ma avete una cosa in comune: quando parte una canzone, smettete di sentirvi fuori posto.»'],
  ['L’ultima campanella.', '«Oggi finisce la scuola. A settembre ci sarà il Festival delle Otto Strade. Tre mesi per trovare il vostro suono. Ma prima: come ti chiami?»']
 ];
 const [title, body] = pages[page], p = panel(title, `<p>${body}</p>`, [{
  label: page === 3 ? 'Mi presento ▶' : 'Continua ▼',
  run: () => page === 3 ? chooseHero() : intro(page + 1)
 }, ...(page > 0 ? [{
  label: 'Indietro',
  run: () => intro(page - 1),
  secondary: true
 }] : [])], 'MAESTRO RIVA');
 cutscene(p, `<span class="maestro-sprite" role="img" aria-label="Maestro Riva"></span>`, `${page + 1} / 4`);
}

// Scena a schermo intero: titolo del momento in alto, personaggi al centro, riquadro di testo in basso.
function cutscene(p, stage, step = '', typed = true) {
 p.classList.add('narrative', 'cutscene');
 p.classList.remove('dialogue');
 overlay.classList.remove('clear');
 const caption = p.querySelector('h3'),
  speaker = p.querySelector('.eyebrow');
 const content = document.createElement('div');
 content.className = 'narrative-content';
 const name = document.createElement('div');
 name.className = 'speaker';
 name.textContent = speaker?.textContent || '';
 content.appendChild(name);
 for (const el of [...p.children])
  if (el !== caption && el !== speaker) content.appendChild(el);
 speaker?.remove();
 const scene = document.createElement('div');
 scene.className = 'narrative-scene';
 scene.innerHTML = stage + (step ? `<span class="intro-steps">${step}</span>` : '');
 caption.className = 'cutscene-caption';
 p.append(caption, scene, content);
 p.querySelector('.actions button')?.focus();
 if (typed) paginate(content);
}

// Il tuo personaggio: aspetto (se ci sono gli sprite) e nome, con una tastiera a schermo come sulle console.
let heroPick = { name: '', look: 'boy' };
function chooseHero() {
 const looks = ['boy', 'girl'].filter(heroLookAvailable);
 const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
 const p = panel('Come ti chiami?', `<div class="hero-pick">${looks.map(l => `<button class="hero-card" data-look="${l}"><canvas width="96" height="110"></canvas><b>${l === 'girl' ? 'Ragazza' : 'Ragazzo'}</b></button>`).join('')}</div><div class="name-entry"><div class="name-field" aria-live="polite"></div><div class="letter-grid">${letters.map(c => `<button class="key" data-key="${c}">${c}</button>`).join('')}<button class="key wide" data-key=" ">SPAZIO</button><button class="key wide" data-key="⌫">⌫</button><button class="key wide ok" data-key="OK">FINE</button></div></div><p class="instrument-help"></p><p class="fine">Croce per scegliere · A per scrivere · B per cancellare · START per confermare. Puoi anche scrivere con la tastiera.</p>`, [], 'MAESTRO RIVA');
 const stage = p.querySelector('.hero-pick'), entry = p.querySelector('.name-entry');
 stage.remove();
 entry.remove();
 cutscene(p, '', '', false);
 const scene = p.querySelector('.narrative-scene');
 scene.classList.add('hero-scene');
 scene.append(stage, entry);
 const help = p.querySelector('.instrument-help'), field = p.querySelector('.name-field');
 const render = () => {
  field.innerHTML = (heroPick.name || '') + '<span class="caret">_</span>';
  help.textContent = heroPick.name ? `«Piacere, ${heroPick.name}. Adesso scegli il tuo strumento.»` : '«Prima di tutto: come ti chiami?»';
  stage.querySelectorAll('.hero-card').forEach(c => c.classList.toggle('chosen', c.dataset.look === heroPick.look));
 };
 const type = k => {
  if (k === '⌫') heroPick.name = heroPick.name.slice(0, -1);
  else if (k === 'OK') return confirm();
  else if (heroPick.name.length < 10) heroPick.name += heroPick.name ? k.toLowerCase() : k;
  render();
 };
 const confirm = () => {
  if (!heroPick.name.trim()) {
   help.textContent = '«Un nome, anche solo un soprannome.»';
   return;
  }
  heroPick.name = heroPick.name.trim();
  chooseInstrument();
 };
 stage.querySelectorAll('.hero-card').forEach(c => {
  const cv = c.querySelector('canvas'), g = cv.getContext('2d');
  setHeroLook(c.dataset.look);
  g.translate(48, 104);
  g.scale(1.5, 1.5);
  drawCharacter(g, 0, 0, { facing: 'south' });
  c.onclick = () => {
   heroPick.look = c.dataset.look;
   render();
   p.querySelector('.key')?.focus();
  };
 });
 setHeroLook(heroPick.look);
 p.querySelectorAll('.key').forEach(b => b.onclick = () => type(b.dataset.key));
 p._typeKey = raw => {
  if (raw === 'backspace') type('⌫');
  else if (raw === 'enter') confirm();
  else if (/^[\p{L}' ]$/u.test(raw)) type(raw.toUpperCase());
  else return false;
  return true;
 };
 p._back = () => type('⌫');
 p._start = confirm;
 render();
 (looks.length > 1 ? stage.querySelector('.hero-card') : p.querySelector('.key'))?.focus();
}

function chooseInstrument() {
 const p = panel('Qual è il tuo suono?', `<div class="instrument-choices"></div><p class="instrument-help"></p><p class="fine">← → per scegliere · A per confermare. Gli amici suoneranno le altre due parti.</p>`, [], 'TRE STRUMENTI. UNA BAND.');
 const help = p.querySelector('.instrument-help');
 for (const [id, data] of Object.entries(INSTRUMENTS)) {
  const b = document.createElement('button');
  b.className = 'instrument-card';
  b.innerHTML = `<span class="instrument-art raster-instrument ${id}" aria-hidden="true"></span><b>${data.name}</b>`;
  b.setAttribute('aria-label', data.name + ': ' + data.role);
  b.onfocus = b.onmouseenter = () => {
   help.innerHTML = `<strong>${data.name}.</strong> ${data.role} ${data.lanes === 4 ? 'Quattro corsie: ← ↓ ↑ →.' : 'Tre corsie: ← ↓ →.'}`;
   if (document.activeElement !== b) b.focus();
  };
  b.onclick = async () => {
   state = initialState(id);
   state.introDone = true;
   state.name = heroPick.name;
   state.look = heroPick.look;
   syncAudio();
   try {
    await audio.init();
    audio.note(id, 0, 110, audio.ctx.currentTime);
   } catch {}
   setupTown();
   save();
   panel('Oggi finisce la scuola.', `<p>«Ti aspettiamo nel pomeriggio. Ho trovato un posto per provare!»</p><p>Nico e Vale hanno lasciato un biglietto sul cancello. Prima però c’è l’ultima mattinata di scuola.</p><p class="fine">Frecce per camminare, A per parlare, S per la bici. Invio (START) apre il telefono con mappa, note e messaggi.</p>`, [{
    label: 'Esci di casa',
    run: close
   }], 'BORGO DELLE CICALE / ORE 08:00');
  };
  p.querySelector('.instrument-choices').appendChild(b);
 }
 const stage = p.querySelector('.instrument-choices');
 stage.remove();
 cutscene(p, '', '', false);
 p.querySelector('.narrative-scene').appendChild(stage);
 p.querySelector('.speaker').textContent = 'TRE STRUMENTI. UNA BAND.';
 p.querySelector('.cutscene-caption').textContent = `${heroPick.name || 'E tu'}, qual è il tuo suono?`;
 p.querySelector('.instrument-card')?.focus();
}

function setupTown() {
 area = 'town';
 room = null;
 road = null;
 path = [];
 tapObject = null;
 layout = townLayout(state.city);
 objects = layout.objects;
 solids = layout.buildings;
 if (!isWalkable(layout, state.x, state.y)) {
  state.x = layout.plaza ? layout.plaza[0] : 24;
  state.y = layout.plaza ? layout.plaza[1] : 18;
 }
 updateJournal();
}

function restoreScene() {
 const scene = state.scene;
 if (scene?.type === 'road') {
  road = {
   from: scene.from,
   to: scene.to
  };
  area = 'road';
  layout = roadLayout(road.from, road.to);
  objects = layout.objects;
  solids = [];
  room = null;
  // Salvataggio con una posizione non valida: si riparte dall'inizio del sentiero.
  if (!isWalkable(layout, state.x, state.y)) Object.assign(state, layout.spawn);
  updateJournal();
 } else if (scene?.type === 'interior') {
  const entry = townLayout(state.city).objects.find(o => o.building && o.label === scene.label);
  if (entry) {
   setupRoom(entry, false);
  } else setupTown();
 } else setupTown();
 portalCooldown = 1;
}

function fade(action) {
 if (transitioning) return;
 transitioning = true;
 keys.clear();
 path = [];
 tapObject = null;
 $('transition').classList.add('active');
 setTimeout(() => {
  action();
  portalCooldown = .9;
  $('transition').classList.remove('active');
  transitioning = false;
 }, 170);
}

function enterCity(id, from = null) {
 const pos = from === null ? {
  x: 24,
  y: 19,
  facing: 'south'
 } : arrival(id, from);
 state.city = id;
 Object.assign(state, pos);
 if (!state.visited.includes(id)) state.visited.push(id);
 setupTown();
 save();
 toast(CITIES[id].name + ' · ' + CITIES[id].genre);
}

function roomPlan(entry) {
 const plan = ROOMS[entry.label] || {
  items: roomItems(entry.kind)
 };
 return hasAtlas('interiors2') && plan.extras ? {
  ...plan,
  items: plan.items.concat(plan.extras)
 } : plan;
}

function setupRoom(entry, reset = true) {
 area = 'interior';
 room = {
  entry
 };
 road = null;
 path = [];
 tapObject = null;
 layout = {
  width: WIDTH,
  height: HEIGHT,
  theme: 'interior',
  buildings: [],
  waters: [],
  gates: [{
   x: 24,
   y: 28.4,
   kind: 'roomExit',
   side: 'south',
   label: 'Uscita'
  }],
  paths: [],
  objects: []
 };
 const plan = roomPlan(entry);
 objects = [];
 if (entry.kind === 'school') objects.push({
  x: 24,
  y: 15,
  kind: 'school',
  sprite: 3,
  label: 'Maestro Riva'
 });
 if (entry.kind === 'garage') objects.push({
  x: 22.5,
  y: 18,
  kind: 'garage',
  sprite: 1,
  label: 'Nico'
 }, {
  x: 25.5,
  y: 18,
  kind: 'garage',
  label: 'Vale',
  sprite: 2
 });
 if (hasAtlas('people2'))
  for (const person of plan.people || []) objects.push({
   x: person.x,
   y: person.y,
   kind: 'roomPerson',
   label: person.label,
   portrait: 'x' + person.who,
   text: person.text,
   facing: 'south'
  });
 if (plan.spot) objects.push({
  x: plan.spot.x,
  y: plan.spot.y,
  kind: plan.spot.archive ? 'archive' : 'roomSpot',
  label: plan.spot.label,
  spot: plan.spot,
  prop: true
 });
 solids = plan.items.filter(i => i[0] !== 7 && i[2] > 12).map(([id, x, y, w, h]) => ({
  x: x - w / T * .36,
  y: y - .9,
  w: w / T * .72,
  h: .9
 }));
 if (reset) {
  state.x = 24;
  state.y = 26;
  state.facing = 'north';
  questEvent({
   type: 'room',
   label: entry.label
  });
 }
 updateJournal();
 save();
}

function cameraNow() {
 const cam = {
  x: state.x * T - W / 2,
  y: state.y * T - H / 2
 };
 // Negli interni la telecamera resta dentro la stanza: niente vuoto nero sotto la porta.
 if (area === 'interior') {
  const fit = (v, lo, hi, view) => hi - lo <= view ? (lo + hi - view) / 2 : Math.max(lo, Math.min(hi - view, v));
  cam.x = fit(cam.x, 9.5 * T, 38.5 * T, W);
  cam.y = fit(cam.y, 6.5 * T, 30 * T, H);
 }
 return cam;
}

function leaveRoom() {
 const entry = room.entry;
 state.x = entry.x;
 state.y = entry.y + 1.2;
 state.facing = 'south';
 setupTown();
 save();
}

function startRoad(to) {
 const reason = gate(state, to);
 if (reason) {
  toast(reason);
  const g = townGates(state.city).find(g => g.to === to);
  if (g) Object.assign(state, {
   ...pointOnSide(g.side, g.lane, 3.4),
   facing: OPPOSITE[g.side]
  });
  keys.clear();
  path = [];
  portalCooldown = 1;
  return;
 }
 if ((state.city === 6 && to === 7) || (state.city === 7 && to === 6)) {
  const g = townGates(state.city).find(g => g.to === to);
  if (g) Object.assign(state, {
   ...pointOnSide(g.side, g.lane, 3.4),
   facing: OPPOSITE[g.side]
  });
  keys.clear();
  path = [];
  portalCooldown = 1;
  rideCable();
  return;
 }
 if (to === 9 && !state.boat && state.city !== 8) {
  toast('Prima imbarcati a Porto del Sol: il pontile non è ancora aperto.');
  const g = townGates(state.city).find(g => g.to === to);
  if (g) Object.assign(state, {
   ...pointOnSide(g.side, g.lane, 3.4),
   facing: OPPOSITE[g.side]
  });
  portalCooldown = 1;
  keys.clear();
  path = [];
  return;
 }
 if (((state.city === 8 && to === 9) || (state.city === 9 && to === 8)) && state.boat) {
  travelConnection(to, 'Traghetto');
  return;
 }
 if (state.city === 8 && to === 9 && !state.boat) {
  const pos = arrival(8, 9);
  Object.assign(state, pos);
  panel('Il palco sul mare.', `<p>Il capitano vi ferma sulla passerella.</p><p>«Il nostro gruppo di apertura non si è presentato. Suonate durante la traversata e vi porto sull’isola.»</p>`, [{
   label: 'Accettiamo!',
   run: () => songBrief(8, 'boat')
  }, {
   label: 'Torniamo tra poco',
   run: close,
   secondary: true
  }], 'PORTO DEL SOL / IMBARCO');
  return;
 }
 const from = state.city;
 fade(() => {
  road = {
   from,
   to
  };
  room = null;
  area = 'road';
  layout = roadLayout(from, to);
  objects = layout.objects;
  solids = [];
  Object.assign(state, layout.spawn);
  updateJournal();
  save();
 });
}

function automaticPassages() {
 if (portalCooldown > 0 || transitioning || !overlay.hidden) return;
 if (area === 'interior') {
  if (Math.abs(state.x - 24) < 1.3 && state.y >= 27.7) fade(leaveRoom);
  return;
 }
 const g = gateAt(layout, state.x, state.y);
 if (g) {
  if (area === 'town') startRoad(g.to);
  else if (g.kind === 'roadEnd') {
   const {
    to,
    from
   } = road;
   fade(() => enterCity(to, from));
  } else {
   const {
    to,
    from
   } = road;
   fade(() => enterCity(from, to));
  }
  return;
 }
 if (area === 'town') {
  // Si entra salendo verso la porta (come nei giochi di ruolo classici), non passandoci accanto.
  const entry = objects.find(o => o.building && (state.facing === 'north' || o === tapDoor) && Math.hypot(o.x - state.x, o.y - state.y) < .68);
  if (entry) fade(() => setupRoom(entry));
 }
}

function interact() {
 if (mode !== 'world' || !overlay.hidden) return;
 if (!near) {
  return;
 }
 const o = near,
  c = CITIES[state.city];

 if (o.kind === 'metro') {
  showMetro();
  return;
 }
 if (o.kind === 'cable') {
  rideCable();
  return;
 }
 if (o.kind === 'ferry') {
  if (!state.boat) {
   if (state.city === 8) startRoad(9);
   else toast('La nave parte da Porto del Sol.');
  } else travelConnection(state.city === 8 ? 9 : 8, 'Traghetto');
  return;
 }
 if (o.kind === 'bridge') {
  if (!state.boat) toast('Il pontile apre dopo la prima traversata in nave.');
  else startRoad(state.city === 10 ? 9 : 10);
  return;
 }
 if (o.kind === 'roomSpot') {
  if (state.city === 3 && room?.entry.label === 'Stazione Nord' && state.transport.metro === 1) {
   metroAnnouncement();
   return;
  }
  panel(o.label, `<p>${o.spot.text(state)}</p>`, [{
   label: 'Torna a guardarti intorno',
   run: close
  }], room ? room.entry.label.toUpperCase() + ' · ' + CITIES[state.city].name.toUpperCase() : '');
  return;
 }
 if (o.kind === 'passerby') {
  panel(o.label, `<p>${o.line}</p>`, [{
   label: 'Buona giornata',
   run: close
  }], CITIES[state.city].name.toUpperCase());
  return;
 }
 if (o.kind === 'passenger') {
  const text = o.stranger || o.person.lines[o.line % o.person.lines.length](state, ride?.to ?? state.city);
  o.line++;
  panel(o.label, (typeof o.portrait === 'number' ? portraitCard(o.portrait) : '') + `<p>${text}</p>`, [{
   label: 'Buon viaggio',
   run: close
  }], 'IN METRO');
  return;
 }
 if (o.kind === 'secret') {
  if (state.found.includes(o.id)) return;
  state.found.push(o.id);
  state.xp += o.secret.xp || 0;
  save();
  updateJournal();
  panel(o.secret.title, `<p>${o.secret.text}</p><p class="fine">Trovato · finisce nella Band, tra i ricordi della strada.</p>`, [{
   label: 'Nello zaino',
   run: close
  }], 'UN SEGRETO DEL SENTIERO');
  return;
 }
 if (o.kind === 'roomPerson') {
  panel(o.label, `<p>${typeof o.text === 'function' ? o.text(state) : o.text}</p>`, [{
   label: 'Grazie',
   run: close
  }], room ? room.entry.label.toUpperCase() : '');
  return;
 }
 if (o.kind === 'archive') {
  showArchive();
  return;
 }
 if (o.kind === 'resident') {
  showResident(o);
  return;
 }
 if (o.kind === 'rivalPerson') {
  showRival(o);
  return;
 }
 if (o.kind === 'school') {
  if (state.stage === 'school') {
   state.stage = 'practice';
   save();
   updateJournal();
   panel('L’ultima campanella.', `<p>Riva posa il gesso. «Il festival cerca gruppi nuovi. Non i più popolari: quelli che hanno qualcosa da dire. Otto città, otto concerti. E poi settembre.»</p><p>Nico: «Tre mesi senza compiti. È il momento giusto.»</p><p>Vale: «Mio nonno ci lascia usare il garage. Ho già portato un amplificatore.»</p><p>I ragazzi degli <strong>Alta Tensione</strong> vi sentono: «Una band, voi? Ci vediamo in piazza. Portate i tappi per le orecchie.»</p>`, [{
    label: 'Andiamo in sala prove',
    run: close
   }], 'SCUOLA / GIUGNO');
  } else panel('Buone vacanze.', `<p>Le finestre sono chiuse. Sulla bacheca c’è ancora la locandina del festival di settembre.</p>`, [{
   label: 'Torna in strada',
   run: close
  }]);
  return;
 }
 if (o.kind === 'garage') {
  if (state.stage === 'school') {
   toast('Prima la scuola: Nico e Vale ti aspettano in piazza dopo la campanella.');
   return;
  }
  songBrief(state.city, state.stage === 'practice' ? 'tutorial' : 'practice');
  return;
 }
 if (o.kind === 'house') {
  panel(state.city === 0 ? 'Il posto da cui siamo partiti.' : 'Una porta aperta.', `<p>${state.city===0?state.passes.length?'Sul tavolo ci sono le vostre locandine. «Vi ho sentiti alla radio del paese. Quando tornate a suonare qui?»':'Una merenda nello zaino, lo strumento pronto. Fuori cominciano a cantare le cicale.':'Il proprietario ti offre un bicchiere d’acqua e ti indica la piazza. «La musica la trovi sempre da quella parte.»'}</p>`, [{
   label: 'Riparti',
   run: close
  }]);
  return;
 }
 if (o.kind === 'board') {
  showMap();
  return;
 }
 if (o.kind === 'stage') {
  if (state.city === 0) {
   if (state.stage === 'rival') songBrief(0, 'rival');
   else if (state.stage !== 'tour') toast('Prima raggiungi gli amici in sala prove.');
   else if (state.passes.length === 8) homeScene(0);
   else panel('Il palco della prima volta.', `<p>Nico: «Quando torniamo, facciamo un concerto per tutti. Ma prima dobbiamo avere qualcosa da raccontare.»</p>`, [{
    label: 'Riparti',
    run: close
   }]);
  } else if (c.type === 'final') {
   const reason = gate(state, 11);
   if (reason) toast(reason);
   else festivalScene(0);
  } else if (c.type === 'music') {
   if (!state.puzzles.includes(c.id)) toast(`Prima parla con ${c.teacher}: ti aspetta in piazza.`);
   else songBrief(c.id, 'concert');
  } else instrumentStudio(state.city);
  return;
 }
 if (o.kind === 'npc') {
  if (state.city === 0) {
   if (state.stage === 'rival') songBrief(0, 'rival');
   else panel('Nico e Vale', `<p>${state.stage==='school'?'«Non fare tardi! La scuola è dall’altra parte della piazza.»':state.stage==='practice'?'«Il garage è pronto. Vieni a provare con noi!»':state.homeShow?'«Il paese ci ha chiesto il bis. Adesso settembre: andiamo a prendercelo.»':state.passes.length===8?'«Ci siamo. Prima suoniamo a casa. Poi andiamo a prenderci settembre.»':'«Ogni città ci ha insegnato qualcosa. E pensa che volevamo soltanto passare un pomeriggio in garage.»'}</p>`, [{
    label: 'Ci vediamo sul palco',
    run: close
   }]);
  } else if (c.type === 'music') showTeacher(c);
  else if (state.city === 3) {
   showTransportQuest();
  } else if (state.city === 6) showArchive();
  else panel('Emma · voce del festival', portraitCard(11) + `<p>${state.finished ? '«Che serata! La registrazione andrà in onda tutto l’inverno.»' : state.homeShow ? '«Ho seguito il vostro viaggio città per città. Stasera vi presento io: salite quando volete.»' : '«Il festival apre solo a chi ha gli otto pass e ha suonato per il proprio paese. Le regole non le ho scritte io!»'}</p>`, [{
   label: state.homeShow && !state.finished ? 'Verso il palco' : 'A più tardi',
   run: close
  }], 'SETTEMBRE');
  return;
 }
 if (o.kind === 'lore') {
  if (state.city === 3 && state.transport.metro === 1) {
   metroAnnouncement();
   return;
  }
  if (state.city === 6) showArchive();
  else panel('Storie dietro le note.', `<p>${c.text||c.lesson}</p>`, [{
   label: 'Torna fuori',
   run: close
  }]);
  return;
 }
 if (o.kind === 'wanderer') {
  showRoadEncounter(o);
  return;
 }
 if (o.kind === 'sign') panel('Appunti di viaggio', `<p>${SIGN_NOTES[roadKey(road.from, road.to)] || '«Non serve suonare più forte di tutti. Basta trovare qualcuno che abbia voglia di ascoltare.»'}</p><p>Più avanti, una freccia indica ${CITIES[road.to].name}.</p>`, [{
  label: 'Continua a camminare',
  run: close
 }]);
}

const SIGN_NOTES = {
 '0-1': 'Sul cartello qualcuno ha inciso tre accordi: La, Re, Mi. Sotto: «per la strada del fiume».',
 '1-2': 'Un adesivo strappato: «ALTA TENS…». Qualcuno è passato prima di voi.',
 '0-2': 'Una scritta a gesso: «Prima si ascolta, poi si alza il volume».',
 '2-3': 'Un orario dei treni del 1989. La fermata «Otto Strade» è cancellata a penna.',
 '3-4': 'Un volantino: «Riapriamo il Teatro Aurora. Firma anche tu».',
 '4-5': 'Qualcuno ha disegnato una griglia: «1 e 2 e 3 e 4 e». Metà delle caselle è vuota apposta.',
 '5-6': '«All’archivio si entra in silenzio. Si esce cantando.» — firmato con una A arricciata.',
 '3-6': 'Una freccia per Valdaccordo e un plettro disegnato con il pennarello.',
 '5-8': 'Profumo di mare. Sul cartello, la clave scritta come un codice: X . . X . . X . | . . X . X . . .',
 '6-10': 'Un lampione acceso anche di giorno. Sotto, un biglietto: «Al Settimo si risponde, non si ripete».',
 '9-10': 'Sulle assi del pontile, segni di gesso tra un battito e l’altro.',
 '10-11': 'Un manifesto nuovo: «Festival delle Otto Strade · ultimo nome da confermare».',
 '6-7': 'Orari della funivia: ultima corsa alle otto. Ritardi frequenti per concerti improvvisati.',
 '8-9': 'Sul traghetto, un cartello: «Si accettano musicisti al posto del biglietto».'
};

function showArchive() {
 if (!state.stories.includes(6)) {
  state.stories.push(6);
  state.xp += 40;
 }
 if (state.mystery < 1) state.mystery = 1;
 save();
 updateJournal();
 const n = cluesFound(state).length;
 if (state.mystery === 2) {
  panel('Il nastro è completo.', portraitCard(14) + '<p>Andrea — Dario per tutti, ormai — fa girare il nastro restaurato. Sul lato B, quattro voci contano fino a quattro.</p><p>«Al festival leggete tutti e quattro i nomi. Io sarò in prima fila. Forse.»</p>', [{
   label: 'Ci vediamo a settembre',
   run: close
  }], 'VALDACCORDO · ARCHIVIO');
  return;
 }
 const intro = '<p>Dario vi fa firmare il registro dei visitatori. Lui firma per primo: una <strong>A</strong> arricciata come una chiave di violino, poi «Dario».</p><p>Su uno scaffale c’è una foto: tre ragazzi su un palco di paese, uno è Riva da giovane. Accanto, una cassetta con il lato B rovinato. Sul nastro Riva dice: «Questa è anche la tua canzone», ma il nome che segue è coperto dal fruscio.</p>';
 if (!mysteryReady(state)) {
  panel('L’archivio di Valdaccordo', portraitCard(14) + intro + `<p>Dario: «Le testimonianze sono sparse nelle città della musica: ogni insegnante ne custodisce una. Me ne avete portate ${n} su 8. Il nastro si capisce solo intero.»</p>`, [{
   label: 'Torneremo con gli indizi',
   run: close
  }], 'VALDACCORDO · ARCHIVIO');
  return;
 }
 panel('L’archivio di Valdaccordo', portraitCard(14) + intro + '<p>Dario: «Otto testimonianze. Allora possiamo ascoltare il nastro insieme. Ma prima ditemi voi cosa avete capito.»</p>', [{
  label: 'Ricostruiamo la storia',
  run: () => deduction(0)
 }, {
  label: 'Più tardi',
  run: close,
  secondary: true
 }], 'VALDACCORDO · ARCHIVIO');
}

function deduction(step) {
 const d = DEDUCTION[step],
  clues = cluesFound(state).sort((a, b) => clueIndex(state, a.city) - clueIndex(state, b.city)).map(c => `<li>${c.text}</li>`).join('');
 const p = panel('Ricostruire il nastro', `<p><strong>Domanda ${step + 1} di ${DEDUCTION.length}.</strong> ${d.q}</p><details class="clue-details"><summary>Rileggi gli indizi</summary><ol class="clue-list">${clues}</ol></details><div class="deduce-options"></div><p class="puzzle-feedback" aria-live="polite"></p>`, [{
  label: 'Più tardi',
  run: close,
  secondary: true
 }], 'VALDACCORDO · L’ARCHIVIO DI DARIO');
 d.options.forEach((t, i) => {
  const b = document.createElement('button');
  b.className = 'btn secondary';
  b.textContent = t;
  b.onclick = () => {
   if (i === d.answer) step < DEDUCTION.length - 1 ? deduction(step + 1) : revelation(0);
   else p.querySelector('.puzzle-feedback').textContent = 'Dario scuote la testa. ' + d.why;
  };
  p.querySelector('.deduce-options').appendChild(b);
 });
}

function revelation(page) {
 const pages = [
  ['Una A arricciata.', portraitCard(14) + '<p>Dario posa la penna. Guarda a lungo la vostra lista.</p><p>«Avete letto bene. Mi chiamo Andrea Dario. Dopo il primo festival il manifesto portava solo il nome di Riva. Nessuno l’aveva fatto apposta, ed è stato peggio. Ho smesso di firmarmi Andrea e sono venuto a custodire le canzoni degli altri.»</p>'],
  ['Una telefonata.', '<p>Vale presta il telefono. Dopo mezz’ora una macchina si ferma davanti all’accademia: è il maestro Riva.</p><p>Riva: «Ho lasciato che succedesse. Era più comodo che rimettere tutto in discussione. Andrea, mi dispiace.»</p><p>Andrea non risponde. Poi prende il plettro dalla custodia e lo mette nella mano di Nico.</p>'],
  ['Il plettro delle Otto Strade.', '<p>Riva: «Il plettro non porta fortuna. Porta una promessa: chi lo usa suona anche per chi non è stato ascoltato.»</p><p>«Al festival suonerete il tema delle Otto Strade. E io leggerò tutti e quattro i nomi.»</p><p class="fine">Mistero risolto · Il plettro delle Otto Strade è nel taccuino della band.</p>']
 ];
 if (page === pages.length - 1 && state.mystery < 2) {
  state.mystery = 2;
  state.xp += 100;
  save();
  updateJournal();
 }
 const [title, body] = pages[page];
 panel(title, body, [{
  label: page < pages.length - 1 ? 'Continua →' : 'Fino a settembre',
  run: () => page < pages.length - 1 ? revelation(page + 1) : close()
 }], 'VALDACCORDO · IL NOME CHE MANCAVA');
}

function showTeacher(c) {
 const info = PUZZLE_INFO[c.id],
  done = state.puzzles.includes(c.id),
  passed = state.passes.includes(c.id);
 panel(c.teacher + ' · ' + info.title, portraitCard(TEACHER_ART[c.id]) + `<p>«${c.lesson}»</p><p>${done ? passed ? 'Il pass è nel taccuino. Potete rifare la prova o tornare sul palco quando volete.' : 'La prova è superata: il palco del concerto vi aspetta.' : info.scene}</p><p class="fine">La prova: ${info.mech.toLowerCase()}.</p>`, [{
  label: done ? 'Rifai la prova' : 'Comincia la prova',
  run: () => openPuzzle(c.id, puzzleApi(c))
 }, {
  label: done && !passed ? 'Verso il palco' : 'Più tardi',
  run: close,
  secondary: true
 }], 'INDAGINE MUSICALE · ' + c.genre.toUpperCase());
}

function puzzleApi(c) {
 return {
  panel,
  close,
  audio,
  toast,
  later: (fn, ms) => puzzleTimers.push(setTimeout(fn, ms)),
  onClose: fn => puzzleCleanups.push(fn),
  back: () => showTeacher(c),
  solved: () => puzzleSolved(c)
 };
}

const TEACHER_THANKS = {
 1: 'Adesso il nastro e la scaletta dicono la stessa cosa. Tenetevi la cassetta: nella custodia c’è qualcosa per voi.',
 2: 'L’impianto canta. Prendete quel flight case, è vuoto… quasi.',
 4: 'La canzone è tornata a casa. Il teatro riaprirà, me lo sento.',
 5: 'Avete trovato il posto del silenzio. Sotto la griglia c’era un foglietto, guardate.',
 7: 'Pulito, poi veloce. Ecco: questo astuccio era di un vecchio amico di Riva.',
 8: 'Il cerchio si è chiuso. Girate il foglio della clave.',
 9: 'Il pontile regge. Su un’asse c’è un’incisione vecchia di trent’anni.',
 10: 'Mi avete risposto davvero. Questa bobina l’aspettavo da tanto.'
};

function puzzleSolved(c) {
 const first = !state.puzzles.includes(c.id);
 if (first) {
  state.puzzles.push(c.id);
  state.xp += 25;
 }
 save();
 updateJournal();
 const n = clueIndex(state, c.id) + 1,
  ready = first && mysteryReady(state) && state.mystery < 2;
 panel(first ? 'Prova superata.' : 'Ancora una volta, e meglio.', portraitCard(TEACHER_ART[c.id]) + `<p>${c.teacher}: «${TEACHER_THANKS[c.id]}»</p><p class="fine">${PUZZLE_INFO[c.id].fact}</p>${first ? `<div class="clue-card"><span>IL PLETTRO DELLE OTTO STRADE · INDIZIO ${n} / 8</span><p>${clueText(state, c.id)}</p></div>` : ''}${ready ? '<p><strong>Le otto testimonianze sono complete.</strong> Dario, all’archivio di Valdaccordo, saprà leggerle insieme a voi.</p>' : ''}<p>${state.passes.includes(c.id) ? 'Il palco è sempre aperto per un altro concerto.' : `Ora il palco di ${c.name} vi aspetta.`}</p>`, [{
  label: 'Verso il palco',
  run: close
 }], 'PROVA SUPERATA · ' + c.genre.toUpperCase());
}


function songBrief(id, kind) {
 if (kind === 'practice' && !song) {
  instrumentStudio(id);
  return;
 }
 openSongBrief(id, kind);
}

function openSongBrief(id, kind) {
 const inst = INSTRUMENTS[state.instrument],
  c = CITIES[id],
  short = kind === 'tutorial';
 let title = short ? 'La prima prova insieme.' : kind === 'rival' ? 'Alta Tensione vi aspetta.' : kind === 'boat' ? 'Un palco in mezzo al mare.' : kind === 'home' ? 'Il concerto a casa.' : kind === 'final' ? 'Questa è la vostra estate.' : `Suona a ${c.name}.`;
 const p = panel(title, `<p>${short?'Suona quando le note raggiungono la linea dorata. Le note lunghe vanno tenute premute fino alla fine.':kind==='rival'?'Gli Alta Tensione suonano insieme da anni. Voi da un pomeriggio. Stasera conta arrivare in fondo insieme: il pubblico ricorderà chi ci ha provato.':kind==='final'?'Un medley di tutta l’estate: otto città, otto accenti. Nico guarda Vale, poi guarda te.':kind==='home'?(state.rivalsJoined?'Tutto il paese in piazza. Per l’ultimo pezzo salgono anche gli Alta Tensione.':'Tutto il paese in piazza. Stasera suonate per chi vi ha visti partire.'):kind==='boat'?'Il capitano vi presta il ponte. Le onde fanno da metronomo, più o meno.':kind==='practice'?'Una prova senza pubblico, nello stile di '+c.name+'. Le abilità del Repertorio si ottengono anche qui, dopo la prova locale.':c.lesson||'La band è pronta. Adesso tocca a voi.'}</p><p><strong>${inst.name}</strong> · ${inst.role}<br>Corsie: <strong>${inst.labels.join(' ')}</strong> sulla croce (o ${inst.lanes === 4 ? 'D F J K' : 'D F J'}). Su touch usa i pulsanti. ${state.instrument==='drums'?'← cassa, ↓ rullante, ↑ charleston, → piatto.':''}</p><label>Difficoltà <select id="songDifficulty"><option value="assist">Accessibile · soglia 35%</option><option value="normal">Normale · soglia 50%</option><option value="expert">Virtuoso · soglia 50%</option></select></label><p class="fine">Pausa con START (Invio). Puoi uscire senza perdere i pass ottenuti.<br>${short?'Il tutorial introduce i comandi e può essere completato senza una soglia minima.':'Un errore non interrompe il brano. Puoi riprovare subito.'}</p>`, [{
  label: 'Conta fino a quattro…',
  run: () => {
   state.settings.difficulty = p.querySelector('select').value;
   save();
   startSong(id, kind);
  }
 }, {
  label: 'Non ancora',
  run: close,
  secondary: true
 }], (kind === 'practice' || kind === 'tutorial' ? 'SALA PROVE' : kind === 'rival' ? 'LA PIAZZA · LA SFIDA' : kind === 'boat' ? 'IL TRAGHETTO' : kind === 'home' ? 'BORGO DELLE CICALE · IL CONCERTO A CASA' : kind === 'final' ? 'FESTIVAL DELLE OTTO STRADE' : 'CONCERTO · ' + c.name.toUpperCase()) + ' / ' + inst.name.toUpperCase());
 p.querySelector('select').value = state.settings.difficulty;
}
async function startSong(id, kind) {
 try {
  await audio.init();
 } catch {
  toast('Audio non disponibile. Puoi comunque seguire le note visive.');
 }
 close();
 $('screen').classList.add('in-song');
 mode = 'rhythm';
 const chart = makeChart(state.instrument, id, state.settings.difficulty, kind);
 song = {
  ...chart,
  kind,
  notes: chart.notes.map(n => ({
   ...n,
   status: null,
   points: 0
  })),
  start: audio.ctx ? audio.ctx.currentTime + .15 : performance.now() / 1000 + .15,
  nextBar: 0,
  combo: 0,
  maxCombo: 0,
  feedback: 'ASCOLTA IL CONTEGGIO',
  feedbackUntil: 2,
  pressed: new Set(),
  paused: false,
  pauseAt: 0,
  fallback: !audio.ctx,
  early: 0,
  hitEffects: []
 };
 $('rhythmHud').hidden = false;
 $('laneControls').hidden = false;
 fitCanvas();
 $('sceneBadge').hidden = true;
 $('songLabel').textContent = `${kind==='tutorial'?'TUTORIAL':kind==='final'?'FESTIVAL':kind==='rival'?'LA SFIDA':kind==='home'?'CONCERTO A CASA':kind==='boat'?'TRAGHETTO':CITIES[id].genre.toUpperCase()} / ${INSTRUMENTS[state.instrument].name.toUpperCase()}`;
 $('laneControls').innerHTML = '';
 $('laneControls').dataset.lanes = INSTRUMENTS[state.instrument].lanes;
 INSTRUMENTS[state.instrument].labels.forEach((key, lane) => {
  const b = document.createElement('button');
  b.style.setProperty('--lane-color', INSTRUMENTS[state.instrument].colors[lane]);
  b.innerHTML = `<span>${state.instrument==='drums'?['CASSA','RULLANTE','CHARL.','PIATTO'][lane]:'CORDA '+(lane+1)}</span><strong>${key}</strong>`;
  b.setAttribute('aria-label', 'Suona ' + (state.instrument === 'drums' ? ['cassa', 'rullante', 'charleston', 'piatto'][lane] : 'corsia ' + (lane + 1)));
  b.onpointerdown = e => {
   e.preventDefault();
   b.setPointerCapture(e.pointerId);
   pressLane(lane);
  };
  const release = () => releaseLane(lane);
  b.onpointerup = release;
  b.onpointercancel = release;
  $('laneControls').appendChild(b);
 });
 keys.clear();
}

function now() {
 return song?.fallback ? performance.now() / 1000 : audio.ctx?.currentTime || performance.now() / 1000;
}

function songTime() {
 return (song.paused ? song.pauseAt : now()) - song.start;
}

function pressLane(lane) {
 if (!song || song.paused || song.pressed.has(lane)) return;
 song.pressed.add(lane);
 $('laneControls').children[lane]?.classList.add('pressed');
 const t = songTime() - state.settings.offset / 1000,
  n = findNote(song.notes, lane, t, hitWindow(state.settings.difficulty));
 if (!n) audio.note(state.instrument, lane, CITIES[song.city].root || 110, audio.ctx?.currentTime || 0, .08, .05);
 if (n) {
  audio.playNote(state.instrument, n, CITIES[song.city].root || 110, audio.ctx?.currentTime || 0, .15);
  song.hitEffects.push({
   lane,
   t: songTime()
  });
  song.hitEffects = song.hitEffects.filter(fx => songTime() - fx.t < .5).slice(-16);
  const error = Math.abs(n.t - t);
  n.status = n.duration ? 'holding' : 'hit';
  n.points = error < .065 ? 1 : error < .115 ? .85 : .65;
  n.holdEnd = n.t + n.duration;
  song.combo++;
  song.maxCombo = Math.max(song.maxCombo, song.combo);
  song.feedback = error < .065 ? 'PERFETTO' : error < .115 ? 'OTTIMO' : 'A TEMPO';
  song.feedbackUntil = songTime() + .65;
 } else if (t > 1.5) {
  song.combo = 0;
  song.early++;
  song.feedback = 'CERCA IL TEMPO';
  song.feedbackUntil = songTime() + .45;
 }
}

function releaseLane(lane) {
 if (!song) return;
 song.pressed.delete(lane);
 $('laneControls').children[lane]?.classList.remove('pressed');
 for (const n of song.notes)
  if (n.lane === lane && n.status === 'holding') {
   if (songTime() < n.holdEnd - .1) {
    n.points *= .5;
    song.combo = 0;
    song.feedback = 'TIENI LA NOTA';
    song.feedbackUntil = songTime() + .6;
   }
   n.status = 'hit';
  }
}

function pauseSong() {
 if (!song) return;
 if (!song.paused) {
  song.pauseAt = now();
  song.paused = true;
  for (const lane of [...song.pressed]) releaseLane(lane);
  audio.stop();
  panel('Un respiro prima del bis.', `<p>Il brano è in pausa. Riprendi quando sei pronto.</p>`, [{
   label: 'Riprendi a suonare',
   run: () => {
    song.start += now() - song.pauseAt;
    song.paused = false;
    song.nextBar = Math.max(0, Math.ceil((songTime() - 2) / (song.beat * 4)));
    close();
   }
  }, {
   label: 'Ricomincia',
   run: () => {
    const {
     city,
     kind
    } = song;
    exitSong(false);
    startSong(city, kind);
   }
  }, {
   label: 'Torna al viaggio',
   run: () => exitSong()
  }], 'PAUSA');
 }
}

function exitSong(showToast = true) {
 audio.stop();
 song = null;
 mode = 'world';
 fitCanvas();
 $('screen').classList.remove('in-song');
 $('rhythmHud').hidden = true;
 $('laneControls').hidden = true;
 $('sceneBadge').hidden = false;
 close();
 updateJournal();
 if (showToast) toast('Il viaggio riprende. Puoi tornare a suonare quando vuoi.');
}

function endSong() {
 const completed = song;
 const acc = accuracy(completed.notes),
  penalty = Math.floor(completed.early / 3),
  score = Math.max(0, acc - penalty),
  result = award(state, completed.city, score, completed.kind);
 exitSong(false);
 questEvent({
  type: 'song',
  city: completed.city,
  kind: completed.kind,
  won: result.won,
  score,
  difficulty: state.settings.difficulty,
  instrument: state.instrument
 });
 save();
 updateJournal();
 if (completed.kind === 'final' && result.won) {
  endingScene(0, score);
  return;
 }
 const actions = [{
  label: result.won ? 'Torna al viaggio' : 'Riprova',
  run: () => {
   if (!result.won) {
    songBrief(completed.city, completed.kind);
    return;
   }
   if (completed.kind === 'boat') enterCity(9, 8);
   close();
  }
 }];
 if (!result.won) actions.push({
  label: 'Più tardi',
  run: close,
  secondary: true
 });
 const title = completed.kind === 'tutorial' ? score >= 50 ? 'Ottimo inizio.' : 'Il primo rumore.' : completed.kind === 'rival' ? 'Il primo confronto.' : completed.kind === 'home' && result.won ? 'Il paese chiede il bis.' : result.won ? 'Questo suono è vostro.' : 'Un’altra prova?';
 const extra = completed.kind === 'home' && result.won ? `<p>${state.rivalsJoined ? 'Per l’ultimo pezzo Elia, Bea e Tommi salgono sul palco. Due batterie, tre chitarre, nessuno che vince: la piazza canta lo stesso.' : 'Gli Alta Tensione applaudono dalla prima fila. Elia alza il pollice, poi fa finta di niente.'}</p>${mysteryEnding(state) ? '<p>In fondo alla piazza, Riva e Dario ascoltano vicini. Nessuno dei due parla.</p>' : ''}` : completed.kind === 'rival' ? `<p>${score >= 60 ? 'Elia vi guarda di traverso, poi vi stringe la mano: «Non male, per essere al primo concerto.»' : 'Elia ride, Bea no: «Il basso c’era. Il resto arriverà.»'}</p>` : '';
 panel(title, `<div class="result-number">${score}<span style="font-size:20px">%</span></div><p>${result.message}</p>${extra}<p class="fine">Precisione ${acc}%${penalty ? ` · −${penalty} per ${completed.early} colpi fuori tempo` : ''} · serie migliore ${completed.maxCombo}</p>`, actions, completed.kind === 'tutorial' ? 'SALA PROVE · LA PRIMA PROVA' : 'DOPO IL CONCERTO');
}

function homeScene(page) {
 const pages = [
  ['La piazza è piena.', `<p>Sami ha montato il registratore sul muretto. Emma trasmette in diretta. La mamma è in prima fila con un cartello fatto a mano.</p><p>Nico: «Tre mesi fa qui non ci ascoltava nessuno.»</p>`],
  ['Elia vi aspetta dietro il palco.', portraitCard(0) + '<p>«Vi devo una cosa. Quella sera ho riso di voi. Però… l’ultimo pezzo potremmo suonarlo insieme. Se vi va.»</p>']
 ];
 if (page === 0) {
  panel(...pages[0], [{
   label: 'Continua →',
   run: () => homeScene(1)
  }], 'BORGO DELLE CICALE · FINE AGOSTO');
  return;
 }
 panel(...pages[1], [{
  label: 'Suoniamo insieme',
  run: () => {
   state.rivalsJoined = true;
   save();
   songBrief(0, 'home');
  }
 }, {
  label: 'Stasera tocca a noi',
  run: () => {
   state.rivalsJoined = false;
   save();
   songBrief(0, 'home');
  }
 }], 'BORGO DELLE CICALE · I RIVALI');
}

function festivalScene(page) {
 if (page === 0) {
  panel('Settembre.', portraitCard(11) + `<p>Emma prende il microfono: «Arrivano da un garage di Borgo delle Cicale. Hanno attraversato otto città, un fiume, una montagna e un pezzo di mare.»</p><p>«Ma come si chiamano?» Silenzio. Vale vi guarda: non ci avete mai pensato.</p>`, [{
   label: state.bandName ? 'Siamo «' + state.bandName + '»' : 'Scegliamo un nome',
   run: () => state.bandName ? festivalScene(2) : festivalScene(1)
  }], 'FESTIVAL DELLE OTTO STRADE');
  return;
 }
 if (page === 1) {
  const p = panel('Il nome della band.', `<p>Nico propone, Vale corregge, tu decidi.</p><div class="deduce-options"></div><label>Oppure scrivilo tu <input id="bandNameInput" maxlength="30" placeholder="Il nostro nome"></label>`, [{
   label: 'Usa questo nome',
   run: () => {
    const v = p.querySelector('#bandNameInput').value.trim();
    if (!v) {
     toast('Scrivi un nome o scegline uno.');
     return;
    }
    state.bandName = v.slice(0, 30);
    save();
    festivalScene(2);
   }
  }], 'FESTIVAL DELLE OTTO STRADE');
  BAND_NAMES.forEach(n => {
   const b = document.createElement('button');
   b.className = 'btn secondary';
   b.textContent = n;
   b.onclick = () => {
    state.bandName = n;
    save();
    festivalScene(2);
   };
   p.querySelector('.deduce-options').appendChild(b);
  });
  return;
 }
 panel('«' + state.bandName + '».', `<p>Emma: «Signore e signori: ${state.bandName}!»</p><p>${mysteryEnding(state) ? 'In prima fila, Riva stringe il braccio di Dario. Nico ha il plettro delle Otto Strade tra le dita.' : 'In prima fila c’è il maestro Riva. Guarda il palco come se ricordasse qualcosa.'}</p>`, [{
  label: 'Saliamo sul palco',
  run: () => songBrief(11, 'final')
 }], 'FESTIVAL DELLE OTTO STRADE');
}

function endingScene(page, score) {
 const dex = abilityDex(state).filter(a => a.learned).length,
  clues = cluesFound(state).length;
 const pages = [
  ['Ci chiedono il bis.', `<div class="result-number">${score}<span style="font-size:20px">%</span></div><p>Otto città in un brano solo: il blues di Nino, il rock di Ada, la promessa di Lia, il silenzio di Tito, il ferro di Iris, la clave di Rosa, il levare di Teo, la risposta di Mina.</p><p>Tra il pubblico riconoscete Leo, Sami, Emma, Arturo. Elia, Bea e Tommi cantano più forte di tutti.</p>`],
  mysteryEnding(state) ? ['Quattro nomi.', '<p>Prima del bis Riva sale sul palco e legge piano i quattro nomi della sua vecchia band. Poi aggiunge: «Le Otto Strade. Musica di Riva e di Andrea.»</p><p>Dario — Andrea — resta immobile. Poi sale anche lui. Nico gli porge il plettro; lui lo rifiuta, sorride, e lo rimette nella mano di Nico: «Adesso è vostro. Suonate per chi non viene ascoltato.»</p>'] : ['Tre nomi, e un fruscio.', `<p>Prima del bis Riva legge i nomi della sua vecchia band. Sono tre. Il quarto resta sospeso, come il fruscio del lato B.</p><p>${clues < 8 ? `Nel taccuino avete ${clues} indizi su 8: qualche città custodisce ancora una testimonianza.` : 'Avete tutti gli indizi: Dario, all’archivio di Valdaccordo, vi aspetta ancora.'}</p>`],
  ['Domani dove andiamo?', `<p>Le luci si spengono una alla volta. Nico ride: «Domani dove andiamo?»</p><p class="fine">Pass ${state.passes.length} / 8 · Repertorio ${dex} / 32 · Indizi ${clues} / 8 · Mistero ${mysteryEnding(state) ? 'risolto' : 'aperto'}</p><p>Il viaggio continua: potete tornare in ogni città, completare il Repertorio con gli altri strumenti${mysteryEnding(state) ? '' : ' e chiudere il mistero del plettro'}, rigiocare i concerti.</p>`]
 ];
 const [title, body] = pages[page];
 panel(title, body, [{
  label: page < pages.length - 1 ? 'Continua →' : 'Continua il viaggio',
  run: () => page < pages.length - 1 ? endingScene(page + 1, score) : close()
 }], 'SETTEMBRE · FINE DELLA PRIMA ESTATE');
}

function tickSong() {
 if (!song || song.paused) return;
 const t = songTime();
 if (audio.ctx) {
  while (song.nextBar < song.bars && 2 + song.nextBar * song.beat * 4 < t + .25) {
   audio.backing(song, CITIES[song.city], song.nextBar, song.start + 2);
   song.nextBar++;
  }
 }
 const window = hitWindow(state.settings.difficulty);
 for (const n of song.notes) {
  if (!n.status && t - state.settings.offset / 1000 > n.t + window) {
   n.status = 'miss';
   song.combo = 0;
  }
  if (n.status === 'holding' && t >= n.holdEnd) n.status = 'hit';
 }
 $('scoreLabel').textContent = `${accuracy(song.notes.filter(n=>n.status))}% · ${song.combo} COMBO`;
 if (t >= song.duration) endSong();
}

function showMap() {
 if (mode === 'rhythm') return;
 const current = state.city;
 let selected = current,
  zoom = 1,
  lines = false;
 const links = CITIES.flatMap(c => neighbors(c.id).filter(id => id > c.id).map(id => [c.id, id]));
 const p = panel('La mappa delle Otto Strade', `<p class="fine">Tocca una città per vedere pass e abilità. Scorri la mappa dopo averla ingrandita.</p><div class="atlas-toolbar"><button class="btn secondary" id="zoomOut" aria-label="Riduci mappa">−</button><button class="btn secondary" id="zoomIn" aria-label="Ingrandisci mappa">+</button><button class="btn secondary" id="mapRoutes" aria-pressed="false">Percorsi</button></div><div class="atlas-scroll"><div class="atlas-surface"><img src="./assets/region-map.jpg" alt="Il mondo delle Otto Strade: campagne, città, montagne e isola"><svg viewBox="0 0 1000 447" class="atlas-routes" aria-hidden="true">${links.map(([a,b])=>`<line class="${a===8&&b===9?'route-ferry':a===9&&b===10?'route-pier':a===6&&b===7?'route-cable':'route-trail'}" data-from="${a}" data-to="${b}" x1="${MAP_POINTS[a][0]*10}" y1="${MAP_POINTS[a][1]*4.47}" x2="${MAP_POINTS[b][0]*10}" y2="${MAP_POINTS[b][1]*4.47}"/>`).join('')}</svg>${CITIES.map(c=>`<button class="atlas-pin ${state.visited.includes(c.id)?'visited':''} ${c.id===current?'here':''}" data-city="${c.id}" style="left:${MAP_POINTS[c.id][0]}%;top:${MAP_POINTS[c.id][1]}%" aria-label="${c.name}, ${c.genre}${c.id===current?', sei qui':''}">${c.id+1}</button>`).join('')}</div></div><div class="atlas-city-list">${CITIES.map(c=>`<button class="btn secondary" data-city="${c.id}">${c.id+1} · ${c.name}</button>`).join('')}</div><section class="map-detail" id="mapDetail" aria-live="polite"></section><section id="journeyDetail" class="journey-detail" aria-live="polite"></section>`, [{
  label: 'Repertorio · le abilità',
  run: showDex
 }, {
  label: 'Chiudi mappa · M',
  run: close
 }], 'ATLANTE DELLA TOURNÉE');
 p.classList.add('map-panel');

 function select(id) {
  selected = id;
  const c = CITIES[id],
   skills = abilityDex(state).filter(a => a.city === id),
   reason = metroReason(state, id) || (!atMetro() ? `Prima raggiungi l’ingresso M di ${CITIES[state.city].name}.` : null);
  p.querySelector('#mapDetail').innerHTML = `<h4>${c.name} · ${c.genre}</h4><p>${id===current?'◆ Sei qui. ':''}${state.visited.includes(id)?'Luogo visitato.':'Fermata da scoprire.'} ${state.passes.includes(id)?'Pass ottenuto.':''}</p><p>${c.text||c.lesson||''}</p>${skills.length?`<p>Abilità acquisite: ${skills.filter(a=>a.learned).length} / ${skills.length}</p>`:''}`;
  const route = journeyRoute(state, id),
   detail = p.querySelector('#journeyDetail');
  detail.innerHTML = id === current ? '<p>Sei qui. Scegli una destinazione per preparare il viaggio.</p>' : route ? `<h4>Il viaggio verso ${c.name}</h4><ol class="journey-legs">${route.legs.map(l=>`<li><strong>${CITIES[l.from].name} → ${CITIES[l.to].name}</strong><span>${l.mode}${l.mode==='Sentiero'&&state.bicycle?' · percorribile anche in bici':''}</span>${l.requirement?`<p>${l.requirement}</p>`:''}</li>`).join('')}</ol><p class="fine">L’itinerario segue i collegamenti del mondo. Raggiungi le uscite e gli imbarchi per proseguire.</p>` : `<h4>Prima di partire</h4><p>${gate(state,id)||'Raggiungi prima Isola Levante in traghetto da Porto del Sol.'}</p>`;
  const segments = route?.legs || [];
  for (const line of p.querySelectorAll('.atlas-routes line')) {
   const a = Number(line.dataset.from),
    b = Number(line.dataset.to);
   line.classList.toggle('journey-active', segments.some(l => (l.from === a && l.to === b) || (l.from === b && l.to === a)));
  }
  p.querySelector('.atlas-routes').classList.toggle('has-journey', segments.length > 0);
  for (const b of p.querySelectorAll('[data-city]')) b.setAttribute('aria-pressed', String(Number(b.dataset.city) === id));
 }
 for (const b of p.querySelectorAll('[data-city]')) b.onclick = () => select(Number(b.dataset.city));

 function scale(d) {
  zoom = Math.max(1, Math.min(3, zoom + d));
  p.querySelector('.atlas-surface').style.width = zoom * 100 + '%';
 }
 p.querySelector('#zoomIn').onclick = () => scale(.5);
 p.querySelector('#zoomOut').onclick = () => scale(-.5);
 p.querySelector('#mapRoutes').onclick = e => {
  lines = !lines;
  p.querySelector('.atlas-routes').classList.toggle('visible', lines);
  e.currentTarget.setAttribute('aria-pressed', String(lines));
 };
 select(selected);
}

// Metro: si prende solo dagli ingressi M. Si apre la mappa disegnata con le fermate e si sceglie con la croce.
function showMetro() {
 if (!atMetro()) {
  toast('La metro si prende dagli ingressi M nelle città.');
  return;
 }
 const unlocked = state.transport.metro === 3;
 const stops = CITIES.filter(c => METRO_STOPS.includes(c.id));
 const p = panel('Dove vuoi andare?', `<div class="metro-map"><img src="./assets/region-map.jpg" alt="La mappa delle Otto Strade"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="metro-lines" aria-hidden="true">${stops.filter(c => c.id !== state.city && !metroReason(state, c.id)).map(c => `<line x1="${MAP_POINTS[state.city][0]}" y1="${MAP_POINTS[state.city][1]}" x2="${MAP_POINTS[c.id][0]}" y2="${MAP_POINTS[c.id][1]}"/>`).join('')}</svg>${stops.map(c => {
  const reason = c.id === state.city ? null : metroReason(state, c.id);
  return `<button class="metro-pin ${c.id === state.city ? 'here' : reason ? 'off' : 'on'}" data-stop="${c.id}" style="left:${MAP_POINTS[c.id][0]}%;top:${MAP_POINTS[c.id][1]}%" aria-label="${c.name}${c.id === state.city ? ', sei qui' : reason ? ', ' + reason : ''}"><span>M</span><b>${state.visited.includes(c.id) ? c.name : '???'}</b></button>`;
 }).join('')}</div><p class="metro-info"></p>`, [{
  label: 'Resta qui',
  run: close,
  secondary: true
 }], 'METRO DELLE OTTO STRADE');
 p.classList.add('metro-panel');
 const info = p.querySelector('.metro-info');
 for (const b of p.querySelectorAll('[data-stop]')) {
  const id = Number(b.dataset.stop),
   reason = id === state.city ? 'Sei qui.' : metroReason(state, id);
  b.onfocus = b.onmouseenter = () => info.innerHTML = `<strong>${state.visited.includes(id) ? CITIES[id].name : 'Fermata da scoprire'}</strong> · ${reason || 'Sali a bordo con A.'}`;
  b.onclick = () => reason ? toast(reason) : travelMetro(id);
 }
 if (!unlocked) info.innerHTML = 'Le porte sono chiuse. A Binario Nord, Arturo cerca qualcuno che lo aiuti con la metro.';
 const first = p.querySelector('.metro-pin.on') || p.querySelector('.metro-pin.here');
 first?.focus();
 if (unlocked) first?.onfocus();
}

function atMetro() {
 return area === 'town' && townLayout(state.city).objects.some(o => o.kind === 'metro' && Math.hypot(o.x - state.x, o.y - state.y) < 2.6);
}

let ride = null;

function travelMetro(to) {
 const reason = metroReason(state, to) || (!atMetro() ? 'Raggiungi l’ingresso della metro in città.' : null);
 if (reason) {
  toast(reason);
  return;
 }
 const from = state.city;
 close();
 fade(() => startRide(from, to));
}

function startRide(from, to) {
 const destLayout = townLayout(to),
  pos = metroSpawn(destLayout).find(p => isWalkable(destLayout, p.x, p.y)) || { x: 24, y: 18 },
  [ax, ay] = MAP_POINTS[from],
  [bx, by] = MAP_POINTS[to],
  seed = Math.floor(Math.random() * 97);
 // Da 8 a 15 secondi, secondo la distanza sulla mappa.
 const duration = Math.max(8, Math.min(15, 8 + Math.hypot(bx - ax, by - ay) / 9));
 state.city = to;
 if (!state.visited.includes(to)) state.visited.push(to);
 ride = { from, to, t: 0, duration, dest: { x: pos.x, y: pos.y }, announced: false, seed };
 area = 'metro';
 room = null;
 road = null;
 path = [];
 tapObject = null;
 layout = { width: WIDTH, height: HEIGHT, theme: 'metro', buildings: [], waters: [], gates: [], paths: [], objects: [] };
 const seats = [[9, 15.6, 'south'], [16, 15.6, 'south'], [21, 20.2, 'north'], [26, 15.6, 'south'], [33, 20.2, 'north'], [38, 15.6, 'south']];
 objects = metroPassengers(state, to, seed).map((p, i) => ({
  x: seats[(seed + i * 2) % seats.length][0],
  y: seats[(seed + i * 2) % seats.length][1],
  facing: seats[(seed + i * 2) % seats.length][2],
  kind: 'passenger',
  label: PEOPLE[p.who][0],
  portrait: p.who,
  person: p,
  line: seed % p.lines.length
 }));
 if (hasAtlas('people2'))
  for (let i = 0; i < 2; i++) {
   const seat = [[12, 18.2], [27, 16.6]][i];
   objects.push({ x: seat[0], y: seat[1], facing: 'south', kind: 'passenger', label: 'Una passeggera', portrait: 'x' + (8 + (seed + i * 3) % 8), stranger: STRANGER_LINES[(seed + i * 2) % STRANGER_LINES.length] });
  }
 solids = [];
 Object.assign(state, { x: 24, y: 17.2, facing: 'south', bike: false });
 portalCooldown = 1;
 updateJournal();
 save();
 questEvent({ type: 'metro', to });
}

function updateRide(dt) {
 if (!ride || area !== 'metro') return;
 ride.t += dt;
 if (!ride.announced && ride.t > ride.duration - 3) {
  ride.announced = true;
  showAreaSign('Prossima fermata', CITIES[ride.to].name + (ride.to === 9 ? ' · coincidenza traghetto' : ''), 2800, true);
  try {
   audio.init().then(() => [0, 4, 7].forEach((st, i) => audio.tone(523.25 * Math.pow(2, st / 12), audio.ctx.currentTime + i * .18, .25, 'sine', .08)));
  } catch {}
 }
 if (ride.t >= ride.duration) arriveRide();
}

function arriveRide() {
 const r = ride;
 ride = null;
 fade(() => {
  Object.assign(state, r.dest, { facing: 'south' });
  setupTown();
  portalCooldown = 1;
  save();
 });
}

function drawMetro(ts) {
 const cam = cameraNow(),
  speed = ride ? 380 : 0,
  shift = ((ride?.t || 0) * speed) % (8 * T),
  sway = Math.sin(ts / 260) * 1.2;
 rect(0, 0, W, H, '#0d1114');
 ctx.save();
 ctx.translate(-cam.x, -cam.y + sway);
 // galleria che scorre fuori dal vagone
 for (let x = -40; x < 60; x += 8) {
  rect((x * T) - shift, 9 * T, 3 * T, 4, '#f2c86c33');
  rect((x * T) - shift + T, 23.6 * T, 2 * T, 4, '#9fd3d022');
 }
 // cassa del vagone
 const x0 = 6 * T, x1 = 42 * T;
 const car = atlases.metroCar;
 if (car && car.complete && car.naturalWidth) ctx.drawImage(car, x0 - 8, 12.6 * T, x1 - x0 + 16, 9 * T);
 else drawCarriage(x0, x1, shift);
 const actors = [];
 drawMetroActors(actors);
}

function drawCarriage(x0, x1, shift) {
 ctx.fillStyle = '#c9cdc4';
 ctx.beginPath();
 ctx.roundRect(x0 - 8, 12.6 * T, x1 - x0 + 16, 9 * T, 18);
 ctx.fill();
 rect(x0, 13 * T, x1 - x0, 1.2 * T, '#3e6f63');
 // finestrini con la galleria in movimento
 for (let i = 0; i < 9; i++) {
  const wx = x0 + 24 + i * 4 * T;
  if (i === 2 || i === 6) continue;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(wx, 13.15 * T, 3 * T, .9 * T, 6);
  ctx.clip();
  rect(wx, 13.15 * T, 3 * T, .9 * T, '#1d272b');
  for (let k = -2; k < 4; k++) rect(wx + ((k * 50 - shift * 1.6) % (3 * T) + 3 * T) % (3 * T), 13.35 * T, 18, 3, '#f2d28caa');
  ctx.restore();
 }
 // porte
 for (const dx of [14, 34]) {
  rect(dx * T - T, 13 * T, 2 * T, 1.2 * T, '#2c4c43');
  rect(dx * T - 2, 13 * T, 4, 1.2 * T, '#9fb39a');
 }
 // pavimento e corsia
 rect(x0, 14.2 * T, x1 - x0, 7 * T, '#b8b39f');
 rect(x0, 16.2 * T, x1 - x0, 2.6 * T, '#a8a28c');
 for (let x = 6; x < 42; x += 2) rect(x * T, 17.4 * T, T, 3, '#9a947f');
 // sedili
 for (let x = 7; x < 41; x += 1.6) {
  ctx.fillStyle = '#c25b45';
  ctx.beginPath();
  ctx.roundRect(x * T, 14.25 * T, 1.3 * T, .8 * T, 6);
  ctx.roundRect(x * T, 19.75 * T, 1.3 * T, .8 * T, 6);
  ctx.fill();
 }
 rect(x0, 20.6 * T, x1 - x0, .6 * T, '#3e6f63');
}

function drawMetroActors(actors) {
 // pali e maniglie
 if (!atlases.metroCar?.naturalWidth) for (const px of [11, 19, 24, 31, 37]) actors.push({ depth: 17.4 * T, draw: () => { rect(px * T - 2, 15.4 * T, 4, 2.1 * T, '#e3e7e0'); ctx.fillStyle = '#7f8c86'; ctx.beginPath(); ctx.ellipse(px * T, 17.5 * T, 6, 3, 0, 0, 7); ctx.fill(); } });
 for (const o of objects) actors.push({ depth: o.y * T, draw: () => drawCharacter(ctx, o.x * T, o.y * T, { portrait: o.portrait, facing: o.facing || 'south' }) });
 actors.push({ depth: state.y * T, draw: () => drawCharacter(ctx, state.x * T, state.y * T, { facing: state.facing, moving: hasMoved, walk }) });
 actors.sort((a, b) => a.depth - b.depth).forEach(a => a.draw());
 if (near && overlay.hidden) interactBubble(near.x * T, near.y * T - 70);
 ctx.restore();
}

function showDex() {
 if (mode === 'rhythm') return;
 let filter = 'all';
 const all = abilityDex(state),
  p = panel('Repertorio', `<p>Una pagina per ogni capacità: scoperta, acquisita e perfezionata. Puoi completarle tutte nella stessa estate cambiando strumento in sala prove.</p><div class="dex-total">${all.filter(a=>a.learned).length}<span> / ${all.length} abilità acquisite</span></div><p class="fine">Specialità iniziale: ${INSTRUMENTS[state.starter].name}. Le altre parti della band cambiano insieme alla tua.</p><div class="dex-filters">${[['all','Tutte'],['shared','Ascolto'],['guitar','Chitarra'],['bass','Basso'],['drums','Batteria']].map(([id,label])=>`<button class="btn secondary" data-filter="${id}">${label}</button>`).join('')}</div><div id="dexEntries" class="dex-entries"></div>`, [{
   label: 'La nostra band',
   run: showBand
  }, {
   label: 'Mappa e metro',
   run: showMap
  }, {
   label: 'Chiudi',
   run: close
  }], 'SCOPERTE · PRATICA · PADRONANZA');

 function draw() {
  p.querySelector('#dexEntries').innerHTML = all.filter(a => filter === 'all' || a.instrument === filter).map(a => `<article class="dex-entry ${a.learned?'learned':''}"><span class="dex-icon">${a.learned?'♪':a.discovered?'◉':'?'}</span><div><strong>${a.discovered?a.title:'Capacità da scoprire'}</strong><small>${CITIES[a.city].name} · ${a.instrument==='shared'?'Ascolto':INSTRUMENTS[a.instrument].name}</small><p>${!a.discovered?'Raggiungi questa città.':a.mastered?'★ Perfezionata'+(a.score!==undefined?' · '+a.score+'%':''):a.learned?'Acquisita · '+a.score+'% · raggiungi 85% per perfezionarla.':a.description}</p></div></article>`).join('');
  for (const b of p.querySelectorAll('[data-filter]')) b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
 }
 for (const b of p.querySelectorAll('[data-filter]')) b.onclick = () => {
  filter = b.dataset.filter;
  draw();
 };
 draw();
}

function instrumentStudio(id) {
 panel('Tre strumenti. La stessa band.', `<p>La tua specialità iniziale resta ${INSTRUMENTS[state.starter].name.toLowerCase()}. Qui puoi scambiare il ruolo con Nico e Vale e completare il Repertorio nella stessa partita.</p><p>Le abilità di una città si acquisiscono superando una prova o un concerto dopo l’enigma locale. La padronanza richiede almeno 85%.</p>`, Object.entries(INSTRUMENTS).map(([key, inst]) => ({
  label: inst.name + (state.instrument === key ? ' · in uso' : ''),
  run: () => {
   state.instrument = key;
   save();
   updateJournal();
   openSongBrief(id, 'practice');
  }
 })).concat([{
  label: 'Apri il Repertorio',
  run: showDex
 }, {
  label: 'Torna in sala',
  run: close,
  secondary: true
 }]), 'SALA PROVE · CAMBIA STRUMENTO');
}

function showBand() {
 if (mode === 'rhythm') return;
 const missing = Object.keys(INSTRUMENTS).filter(id => id !== state.instrument),
  clues = cluesFound(state).sort((a, b) => clueIndex(state, a.city) - clueIndex(state, b.city));
 panel(state.bandName || 'Ancora senza nome.', `<p>${state.bandName ? 'La band nata in un garage di Borgo delle Cicale.' : 'Una band nata in un garage. Il nome lo troveremo per strada.'}</p><div class="stat-row"><span>${state.name || 'Tu'}</span><strong>${INSTRUMENTS[state.instrument].name}</strong></div><div class="stat-row"><span>Nico</span><strong>${INSTRUMENTS[missing[0]].name}</strong></div><div class="stat-row"><span>Vale</span><strong>${INSTRUMENTS[missing[1]].name}</strong></div><div class="stat-row"><span>Fama</span><strong>${fameTitle().toLowerCase()} · ${state.xp} punti</strong></div><div class="stat-row"><span>Luoghi scoperti</span><strong>${state.visited.length} / 12</strong></div><h4>I ricordi della strada</h4><p>${state.memories.length?state.memories.map(k=>{const [a,b]=k.slice(5).split('-').map(Number);return CITIES[a].name+' ↔ '+CITIES[b].name;}).join(' · '):'La prima sosta insieme deve ancora arrivare.'}</p>${state.found.length ? `<h4>Trovati per strada</h4><p>${Object.values(ROUTES).map(r => r.secret).filter(x => x && state.found.includes(x.id)).map(x => x.title).join(' · ')}</p>` : ''}<h4>Il plettro delle Otto Strade · indizi ${clues.length} / 8</h4>${clues.length ? `<ol class="clue-list">${clues.map(c => `<li>${c.text}</li>`).join('')}</ol>` : '<p>Gli insegnanti delle città della musica custodiscono le testimonianze. Superate le loro prove.</p>'}<p>${mysteryEnding(state) ? '<strong>Mistero risolto.</strong> Il tema delle Otto Strade è di Riva e Andrea. Andrea è Dario, il custode dell’archivio. Il plettro è una promessa: suonare anche per chi non è stato ascoltato.' : mysteryReady(state) ? 'Gli indizi sono completi: portateli a Dario, all’archivio di Valdaccordo.' : state.mystery ? 'All’archivio di Valdaccordo il nastro aspetta le testimonianze mancanti.' : 'Un archivio, a Valdaccordo, custodisce il nastro della vecchia band di Riva.'}</p>`, [{
  label: 'Repertorio · abilità',
  run: showDex
 }, {
  label: 'Torniamo fuori',
  run: close
 }], 'LA NOSTRA BAND');
}

function senderName(m) {
 return typeof m.from === 'number' ? PEOPLE[m.from][0] : m.from;
}

function avatar(m) {
 return typeof m.from === 'number' ? `<span class="avatar" style="--px:${m.from % 4 * 100 / 3}%;--py:${Math.floor(m.from / 4) * 100 / 3}%"></span>` : `<span class="avatar letter">${m.from[0]}</span>`;
}

function unreadCount() {
 return Object.values(state.msgs || {}).filter(v => !v.r).length;
}

let messagePlace = '',
 msgClock = 0;

function checkMessages() {
 if (!state.introDone || state.stage === 'school' || messagePlace === lastPlace) return;
 // Un messaggio alla volta: il prossimo arriva quando si cambia zona.
 for (const m of newMessages(state).slice(0, 1)) {
  messagePlace = lastPlace;
  state.msgs[m.id] = { r: false, d: false };
  save();
  showAreaSign('✉ ' + senderName(m), m.text.length > 70 ? m.text.slice(0, 68) + '…' : m.text, 4200, true);
 }
}

function questEvent(event) {
 for (const m of questsFor(state, event)) {
  state.msgs[m.id] = { r: false, d: true };
  state.xp += m.xp || 0;
  save();
  updateJournal();
  showAreaSign('Missione completata · ' + senderName(m), m.reply, 4600, true);
 }
}

function phonePanel(title, body, back = openPhone) {
 const p = panel(title, `<div class="phone-status"><span>${chapter(state).split(' · ')[0]}</span><span>${state.bandName || 'Band'}</span><span>▮▮▮ ▰</span></div>${body}<button class="phone-home" aria-label="Chiudi il telefono"></button>`, [], '');
 p.classList.remove('dialogue');
 p.classList.add('phone');
 overlay.classList.add('clear');
 p.querySelector('.phone-home').onclick = close;
 p.querySelector('.phone-back')?.addEventListener('click', back);
 return p;
}

function startMenu() {
 if (mode !== 'world' || !overlay.hidden || !state.introDone) return;
 openPhone();
}

function openPhone() {
 const unread = unreadCount();
 const apps = [
  ['map', 'Mappa', '⌖', showMap],
  ['notes', 'Note', '✎', notesApp],
  ['msg', 'Messaggi', '✉', messagesApp, unread],
  ['dex', 'Repertorio', '♪', showDex],
  ['band', 'Band', '★', showBand],
  ['metro', 'Metro', 'M', () => phonePanel('Metro', `<div class="app-head"><button class="phone-back">‹</button><b>Metro</b></div><p class="app-text">${state.transport.metro === 3 ? 'Pass attivo. Raggiungi un ingresso M in città: lì si apre la mappa delle fermate.' : 'Il pass non c’è ancora. A Binario Nord, Arturo cerca qualcuno che lo aiuti.'}</p>`)],
  ...(state.bicycle ? [['bike', state.bike ? 'A piedi' : 'Bici', '⚙', () => { close(); toggleBike(); }]] : []),
  ['save', 'Salva', '⤓', () => { save(); close(); toast('Partita salvata su questo dispositivo.'); }],
  ['opt', 'Impostazioni', '☰', settings]
 ];
 const p = phonePanel('', `<div class="phone-clock"><b>${chapter(state).split(' · ')[1] || ''}</b><span>${state.passes.length} pass su 8</span></div><div class="apps">${apps.map((a, i) => `<button class="app app-${a[0]}" data-i="${i}"><span class="icon">${a[2]}${a[4] ? `<i class="badge">${a[4]}</i>` : ''}</span><small>${a[1]}</small></button>`).join('')}</div>`);
 p.classList.add('phone-home-screen');
 p.querySelectorAll('.app').forEach(b => b.onclick = () => apps[+b.dataset.i][3]());
 p.querySelector('.app')?.focus();
}

function messagesApp() {
 const got = MESSAGES.filter(m => state.msgs?.[m.id]).reverse();
 const rows = got.length ? got.map(m => { const st = state.msgs[m.id]; return `<button class="thread" data-id="${m.id}">${avatar(m)}<span><b>${senderName(m)}</b><small>${m.quest ? (st.d ? '✓ Missione completata' : '◆ Missione in corso') : m.text.slice(0, 40) + '…'}</small></span>${st.r ? '' : '<i class="dot"></i>'}</button>`; }).join('') : '<p class="app-text">Nessun messaggio, per ora. Le persone che incontrate in viaggio vi scriveranno.</p>';
 const p = phonePanel('', `<div class="app-head"><button class="phone-back">‹</button><b>Messaggi</b></div><div class="threads">${rows}</div>`);
 p.querySelectorAll('.thread').forEach(b => b.onclick = () => conversation(b.dataset.id));
 p.querySelector('.thread, .phone-back')?.focus();
}

function conversation(id) {
 const m = MESSAGES.find(x => x.id === id),
  st = state.msgs[id];
 st.r = true;
 save();
 phonePanel('', `<div class="app-head"><button class="phone-back">‹</button>${avatar(m)}<b>${senderName(m)}</b></div><div class="bubbles"><p class="bubble in">${m.text}</p>${m.quest ? `<p class="bubble note">${st.d ? '✓' : '◆'} ${m.quest}</p>` : ''}${st.d && m.reply ? `<p class="bubble in">${m.reply}</p>` : ''}</div>`, messagesApp).querySelector('.phone-back').focus();
}

function notesApp() {
 const quests = MESSAGES.filter(m => m.quest && state.msgs?.[m.id] && !state.msgs[m.id].d),
  clues = cluesFound(state).sort((a, b) => clueIndex(state, a.city) - clueIndex(state, b.city));
 phonePanel('', `<div class="app-head"><button class="phone-back">‹</button><b>Note</b></div><div class="notes"><h5>Adesso</h5><p>${$('objective').textContent}</p><h5>Missioni secondarie</h5>${quests.length ? `<ul>${quests.map(m => `<li><b>${senderName(m)}:</b> ${m.quest}</li>`).join('')}</ul>` : '<p>Nessuna in corso.</p>'}<h5>Il plettro delle Otto Strade · ${clues.length} / 8</h5>${clues.length ? `<ol>${clues.map(c => `<li>${c.text}</li>`).join('')}</ol>` : '<p>Ancora nessun indizio.</p>'}</div>`).querySelector('.phone-back').focus();
}

function settings() {
 if (mode === 'rhythm') {
  pauseSong();
  return;
 }
 const p = panel('Prima del prossimo pezzo.', `<label>Volume <input id="volume" type="range" min="0" max="1" step="0.05" value="${state.settings.volume}"></label><label>Correzione input: <span id="offsetValue">${state.settings.offset}</span> ms<input id="offset" type="range" min="-250" max="250" step="10" value="${state.settings.offset}"></label><p class="fine">Se devi premere dopo la nota visiva per seguire l’audio, aumenta il valore. La regolazione è manuale; usa la sala prove per verificarla.</p><label>Difficoltà <select id="difficulty"><option value="assist">Accessibile</option><option value="normal">Normale</option><option value="expert">Virtuoso</option></select></label><p class="fine">I salvataggi restano in questo browser. Esporta una copia per conservarli o spostarli.</p>`, [{
  label: 'Salva e chiudi',
  run: () => {
   save();
   close();
  }
 }, {
  label: 'Comandi',
  run: controlsMenu
 }, {
  label: 'Esporta partita',
  run: exportSave
 }, {
  label: 'Importa partita',
  run: importSave
 }, {
  label: 'Torna al menu',
  run: () => { close(); startMenu(); }
 }, {
  label: 'Titolo',
  run: () => {
   saved = validateState(state);
   welcome();
  },
  secondary: true
 }]);
 p.querySelector('#difficulty').value = state.settings.difficulty;
 p.querySelector('#volume').oninput = e => {
  state.settings.volume = Number(e.target.value);
  syncAudio();
 };
 p.querySelector('#offset').oninput = e => {
  state.settings.offset = Number(e.target.value);
  p.querySelector('#offsetValue').textContent = e.target.value;
 };
 p.querySelector('#difficulty').onchange = e => {
  state.settings.difficulty = e.target.value;
 };
}

// Comandi: ogni azione della console si può assegnare a un tasto diverso. Il joystick usa la mappatura standard.
function controlsMenu() {
 const k = state.settings.keys;
 const p = panel('Comandi', `<div class="controls-list">${ACTIONS.map(a => `<button class="control-row" data-action="${a}"><span>${ACTION_NAMES[a]}</span><kbd>${keyName(k[a])}</kbd></button>`).join('')}</div><p class="fine">${padInfo.connected ? 'Controller collegato: croce o levetta, A, B, START e SELECT.' : 'Collega un controller e premi un tasto: croce o levetta, A, B, START e SELECT funzionano subito.'}<br>Nei concerti le corsie si suonano con la croce: ← ↓ ↑ →. Funzionano anche D F J K.</p>`, [{
  label: 'Tasti predefiniti',
  run: () => {
   state.settings.keys = { ...DEFAULT_KEYS };
   save();
   controlsMenu();
  }
 }, {
  label: 'Indietro',
  run: settings,
  secondary: true
 }], 'IMPOSTAZIONI');
 p.querySelectorAll('.control-row').forEach(row => row.onclick = () => {
  const action = row.dataset.action;
  row.querySelector('kbd').textContent = 'premi un tasto…';
  row.classList.add('waiting');
  setTimeout(() => {
   remapping = key => {
    remapping = null;
    if (key !== 'escape') {
     const keys = { ...state.settings.keys };
     const other = ACTIONS.find(a => a !== action && keys[a] === key);
     if (other) keys[other] = keys[action];
     keys[action] = key;
     state.settings.keys = keys;
     save();
    }
    controlsMenu();
    overlay.querySelector(`[data-action="${action}"]`)?.focus();
   };
  }, 60);
 });
}

function exportSave() {
 const blob = new Blob([JSON.stringify(state, null, 2)], {
   type: 'application/json'
  }),
  url = URL.createObjectURL(blob),
  a = document.createElement('a');
 a.href = url;
 a.download = 'una-estate-in-tour-salvataggio.json';
 a.click();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importSave(onDone = null) {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = '.json,application/json';
 input.onchange = async () => {
  try {
   const valid = validateState(JSON.parse(await input.files[0].text()));
   if (!valid) throw Error();
   state = valid;
   syncAudio();
   restoreScene();
   save();
   close();
   onDone?.();
   toast('Partita importata. Buon viaggio!');
  } catch {
   toast('Questo file non è un salvataggio valido.');
  }
 };
 input.click();
}

function toggleBike() {
 if (mode !== 'world' || !overlay.hidden) return;
 if (!state.bicycle) {
  toast(state.city === 3 ? 'La bici è di Arturo: parlagli in piazza.' : 'Una vecchia bici ti aspetta a Binario Nord.');
  return;
 }
 state.bike = !state.bike;
 save();
 updateJournal();
 toast(state.bike ? 'In sella. La strada sembra più corta.' : 'Torni a camminare.');
}

// Local canvas rendering with illustrated sprite atlases.
function rect(x, y, w, h, color) {
 ctx.fillStyle = color;
 ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

function text(s, x, y, color = '#f4e8c8', size = 10, align = 'left') {
 ctx.fillStyle = color;
 ctx.font = `700 ${size}px Nunito, sans-serif`;
 ctx.textAlign = align;
 ctx.fillText(s, Math.round(x), Math.round(y));
 ctx.textAlign = 'left';
}

function hash(x, y) {
 return Math.abs(Math.sin(x * 127.1 + y * 311.7 + state.city * 19.3) * 43758.5453) % 1;
}

function character(x, y, color = '#cf9368', variant = 0, moving = false, bike = false) {
 drawCharacter(ctx, x, y, {
  color,
  variant,
  moving,
  bike,
  walk,
  facing: variant ? 'south' : state.facing
 });
}

function drawStage(x, y, genre) {
 smoothStage(ctx, x, y, genre);
}

function roomItems(kind) {
 if (kind === 'house') return [
  [7, 24, 23, 170, 100],
  [4, 14, 14, 145, 120],
  [5, 20, 14, 64, 120],
  [3, 34, 14, 100, 130],
  [0, 15, 22, 135, 100],
  [1, 34, 22, 90, 150],
  [2, 33, 27, 115, 110],
  [15, 26, 11, 110, 85],
  [6, 25, 18, 120, 100]
 ];
 if (kind === 'school') return [
  [14, 24, 12, 190, 100],
  [13, 14, 17, 110, 140],
  [12, 18, 21, 120, 100],
  [12, 30, 21, 120, 100],
  [3, 35, 14, 100, 130],
  [15, 13, 11, 90, 80]
 ];
 if (kind === 'garage') return [
  [7, 24, 23, 190, 100],
  [8, 14, 15, 130, 110],
  [10, 34, 15, 125, 90],
  [11, 34, 24, 120, 85],
  [9, 20, 14, 50, 100],
  [3, 14, 25, 90, 120],
  [15, 31, 11, 100, 85]
 ];
 return [
  [7, 24, 23, 180, 100],
  [13, 16, 16, 130, 155],
  [8, 33, 16, 130, 110],
  [3, 33, 24, 100, 135],
  [2, 15, 25, 130, 110],
  [15, 25, 11, 120, 90]
 ];
}

function interactBubble(x, y) {
 const bob = Math.sin(performance.now() / 220) * 2;
 ctx.fillStyle = '#fffdf4';
 ctx.strokeStyle = '#2a3b33';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.roundRect(x - 10, y - 22 + bob, 20, 20, 6);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#2a3b33';
 ctx.font = '600 15px Fredoka, sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('!', x, y - 7 + bob);
 ctx.textAlign = 'left';
}

// Tipo di stanza per lo sfondo dipinto: dipende dall'edificio.
function roomStyle(entry) {
 const st = entry.building?.style || '';
 if (entry.kind === 'garage') return 'sala-prove';
 if (entry.kind === 'school') return 'scuola';
 if (entry.label === 'Bottega' || st === 'market') return 'negozio';
 if (['club', 'night', 'theatre', 'tent'].includes(st)) return 'locale';
 if (st === 'factory') return 'officina';
 if (['stone', 'castle', 'academy'].includes(st)) return 'pietra';
 if (st === 'hut') return 'capanna';
 if (st === 'station') return 'stazione';
 return 'casa';
}

function drawInterior() {
 const cam = cameraNow();
 rect(0, 0, W, H, '#14110e');
 ctx.save();
 ctx.translate(-cam.x, -cam.y);
 const sx = 10 * T,
  sy = 7 * T,
  rw = 28 * T,
  rh = 22 * T;
 // Sfondo dipinto della stanza (quarta serie di sprite), altrimenti pavimento e pareti semplici.
 const bg = atlases['room:' + roomStyle(room.entry)];
 if (bg && bg.complete && bg.naturalWidth) ctx.drawImage(bg, sx, sy, rw, rh);
 else {
  ctx.fillStyle = '#e2d3b1';
  ctx.beginPath();
  ctx.roundRect(sx, sy, rw, rh, 12);
  ctx.fill();
  rect(sx, sy, rw, 70, room.entry.kind === 'garage' ? '#a5b29a' : '#b7c5ae');
  for (let y = 11; y < 29; y++) rect(sx, y * T, rw, 1, '#b6a58644');
  for (let x = 11; x < 38; x += 3) rect(x * T, 11 * T, 1, 18 * T, '#b6a58622');
 }
 const items = roomPlan(room.entry).items;
 for (const [id, x, y, w, h] of items)
  if (id === 7) drawSprite(ctx, 'interiors', 1, 3, x * T, y * T, w, h);
 // Porta d’uscita nella parete in basso, con zerbino: si capisce senza scritte.
 if (!(bg && bg.complete && bg.naturalWidth)) {
  rect(10 * T, 29 * T - 6, 28 * T, 14, '#9c8a68');
  rect(22.6 * T, 29 * T - 8, 2.8 * T, 22, '#3a2c20');
  rect(22.75 * T, 29 * T - 6, 2.5 * T, 18, '#1c140e');
 }
 ctx.fillStyle = '#a4503d';
 ctx.beginPath();
 ctx.roundRect(22.8 * T, 27.7 * T, 2.4 * T, 1.05 * T, 5);
 ctx.fill();
 for (let i = 0; i < 5; i++) rect(23 * T + i * 11, 27.85 * T, 5, .75 * T, '#c9785e');
 const actors = items.filter(i => i[0] !== 7).map(([id, x, y, w, h]) => ({
  depth: y * T,
  draw: () => id >= 16 ? drawSprite(ctx, 'interiors2', Math.floor((id - 16) / 4), (id - 16) % 4, x * T, y * T, w, h) : drawSprite(ctx, 'interiors', Math.floor(id / 4), id % 4, x * T, y * T, w, h)
 }));
 if (room.entry.kind === 'garage') actors.push({
  depth: 13 * T,
  draw: () => smoothStage(ctx, 24 * T, 13 * T, 'SALA PROVE')
 });
 for (const o of objects.filter(o => o.prop)) actors.push({
  depth: o.y * T + 1,
  draw: () => {
   const pulse = .6 + Math.sin(performance.now() / 300) * .4;
   ctx.fillStyle = `rgba(242,200,108,${.35 + pulse * .45})`;
   ctx.beginPath();
   ctx.moveTo(o.x * T, o.y * T - 26);
   ctx.lineTo(o.x * T + 7, o.y * T - 19);
   ctx.lineTo(o.x * T, o.y * T - 12);
   ctx.lineTo(o.x * T - 7, o.y * T - 19);
   ctx.closePath();
   ctx.fill();
  }
 });
 for (const o of objects.filter(o => !o.prop)) actors.push({
  depth: o.y * T,
  draw: () => drawCharacter(ctx, o.x * T, o.y * T, {
   variant: o.sprite || 1,
   portrait: o.portrait ?? null,
   facing: o.facing || 'south'
  })
 });
 actors.push({
  depth: state.y * T,
  draw: () => drawCharacter(ctx, state.x * T, state.y * T, {
   facing: state.facing,
   moving: hasMoved,
   walk
  })
 });
 actors.sort((a, b) => a.depth - b.depth).forEach(o => o.draw());
 if (near && overlay.hidden) interactBubble(near.x * T, near.y * T - (near.prop ? 34 : 70));
 ctx.restore();
}

function drawWorld(ts) {
 if (area === 'metro') drawMetro(ts);
 else if (area === 'interior') drawInterior();
 else {
  const cam = cameraNow();
  renderWorld(ctx, {
   cam,
   layout,
   state,
   area,
   walk,
   moving: hasMoved,
   near,
   time: ts,
   W,
   H
  });
  if (near && overlay.hidden) {
   const person = ['npc', 'wanderer', 'resident', 'rivalPerson', 'passerby'].includes(near.kind);
   ctx.save();
   ctx.translate(-cam.x, -cam.y);
   interactBubble(near.x * T, near.y * T - (person ? 70 : 46));
   ctx.restore();
  }
 }
}

function drawRhythm() {
 if (song) drawConcert(ctx, {
  song,
  time: songTime(),
  W,
  H,
  instrument: state.instrument
 });
}

// Percorso a tocco: evita varchi e porte che non sono la meta, così attraversare la città non porta altrove per sbaglio.
function tapPath(target) {
 const avoid = (layout.gates || []).filter(g => Math.hypot(g.x - target.x, g.y - target.y) > 1.5).map(g => [g.x, g.y, 1.2])
  .concat(objects.filter(o => o.building && Math.hypot(o.x - target.x, o.y - target.y) > 1.5).map(o => [o.x, o.y, 1]));
 const ok = (x, y) => canMove(x, y) && !avoid.some(([ax, ay, r]) => Math.hypot(ax - x, ay - y) < r);
 const route = findPath(state, target, ok, layout.width ?? WIDTH, layout.height ?? HEIGHT);
 return route.length || !avoid.length ? route : findPath(state, target, canMove, layout.width ?? WIDTH, layout.height ?? HEIGHT);
}

function canMove(x, y) {
 if (area === 'metro') return x > 6.6 && x < 41.4 && y > (atlases.metroCar?.naturalWidth ? 16.6 : 15.4) && y < 19.4;
 if (area === 'interior') return x > 10.5 && x < 37.5 && y > (atlases['room:' + roomStyle(room.entry)]?.naturalWidth ? 12.2 : 10.8) && y < 29 && !solids.some(b => x > b.x - .3 && x < b.x + b.w + .3 && y > b.y - .3 && y < b.y + b.h + .3);
 return isWalkable(layout, x, y);
}
let saveClock = 0,
 tapDoor = null;

function update(dt) {
 if (mode === 'rhythm') {
  tickSong();
  return;
 }
 hasMoved = false;
 if (!overlay.hidden || transitioning) return;
 updateRide(dt);
 msgClock += dt;
 if (msgClock > 2) {
  msgClock = 0;
  checkMessages();
 }
 portalCooldown = Math.max(0, portalCooldown - dt);
 // Solo quattro direzioni, come nei giochi di ruolo classici: vale l'ultima direzione premuta.
 const held = [...keys].filter(k => DIRS.includes(k)), dir = held[held.length - 1];
 let dx = dir === 'right' ? 1 : dir === 'left' ? -1 : 0,
  dy = dir === 'down' ? 1 : dir === 'up' ? -1 : 0;
 if (dx || dy) {
  path = [];
  tapObject = null;
  tapDoor = null;
 } else if (path.length) {
  const next = path[0],
   dist = Math.hypot(next.x - state.x, next.y - state.y);
  if (dist < .15) {
   path.shift();
   if (!path.length && tapObject) {
    near = tapObject;
    tapObject = null;
    interact();
    return;
   }
  } else {
   dx = (next.x - state.x) / dist;
   dy = (next.y - state.y) / dist;
  }
 }
 if (dx || dy) {
  state.facing = facingFor(dx, dy, state.facing);
  const length = Math.hypot(dx, dy),
   speed = state.bike && area !== 'interior' ? 8 : 4.5;
  const delta = path.length ? stepToward(state, path[0], dt * speed) : stepToward({
    x: 0,
    y: 0
   }, {
    x: dx / length,
    y: dy / length
   }, dt * speed),
   steps = Math.max(1, Math.ceil(Math.hypot(delta.dx, delta.dy) / .15));
  dx = delta.dx / steps;
  dy = delta.dy / steps;
  for (let i = 0; i < steps; i++) {
   if (canMove(state.x + dx, state.y)) {
    state.x += dx;
    hasMoved = true;
   }
   if (canMove(state.x, state.y + dy)) {
    state.y += dy;
    hasMoved = true;
   }
  }
  // Percorso a tocco bloccato da un bordo sottile: scivola di lato per aggirarlo.
  if (!hasMoved && path.length)
   for (const side of [1, -1]) {
    const n = Math.hypot(dx, dy) || 1, sx = -dy / n * side * .12, sy = dx / n * side * .12;
    if (canMove(state.x + sx, state.y + sy)) {
     state.x += sx;
     state.y += sy;
     hasMoved = true;
     break;
    }
   }
  if (hasMoved) {
   walk += dt;
   saveClock += dt;
   if (saveClock > 3) {
    saveClock = 0;
    save();
   }
  }
 }
 automaticPassages();
 if (transitioning || !overlay.hidden) return;
 near = null;
 let best = area === 'metro' ? 3.1 : 2.25;
 for (const o of objects) {
  if (o.building || o.kind === 'exit' || o.kind === 'roadBack' || o.kind === 'roadEnd' || (o.kind === 'secret' && state.found.includes(o.id))) continue;
  const dist = Math.hypot(o.x - state.x, o.y - state.y);
  if (dist < best) {
   best = dist;
   near = o;
  }
 }
 if (near && (near.kind === 'npc' || area === 'interior')) near.facing = facingFor(state.x - near.x, state.y - near.y);
 $('prompt').hidden = true;
 if (near) $('prompt').textContent = near.label;
 canvas.setAttribute('aria-label', `Mondo di gioco: ${CITIES[state.city].name}${area==='interior'?', '+room.entry.label:''}. Posizione ${state.x.toFixed(1)}, ${state.y.toFixed(1)}. Direzione ${state.facing}.`);
}

function frame(ts) {
 const dt = Math.min(.12, (ts - last) / 1000);
 last = ts;
 pollPad();
 update(dt);
 ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
 ctx.clearRect(0, 0, W, H);
 if (mode === 'rhythm') drawRhythm(ts);
 else drawWorld(ts);
 requestAnimationFrame(frame);
}
// ==== Comandi: croce, A, B, START, SELECT (tastiera rimappabile e joystick) ====
const DIRS = ['up', 'down', 'left', 'right'];
let remapping = null;
// Corsie dei concerti: ← ↓ ↑ → (il basso ha tre corsie: ← ↓ →, anche ↑ suona quella centrale).
function laneFor(action) {
 const n = INSTRUMENTS[state.instrument].lanes;
 return n === 4 ? ({ left: 0, down: 1, up: 2, right: 3 })[action] ?? -1 : ({ left: 0, down: 1, up: 1, right: 2 })[action] ?? -1;
}
function legacyLane(key) {
 return ['d', 'f', 'j', 'k'].slice(0, INSTRUMENTS[state.instrument].lanes).indexOf(key);
}
// Pulsante «indietro» della finestra aperta: B chiude o torna alla schermata precedente.
function backButton(root) {
 const buttons = [...root.querySelectorAll('button:not([disabled])')].filter(b => b.offsetParent !== null);
 return root.querySelector('.phone-back') || buttons.find(b => /^(←\s*)?(Indietro|Chiudi|Esci|Torna|Annulla|Resta qui|No|Torniamo|Più tardi|Non ora)/i.test(b.textContent.trim())) || null;
}
function overlayAction(action, raw) {
 const root = overlay.querySelector('.panel') || overlay;
 if (action === 'b' && root._back) return root._back(), true;
 if (action === 'start' && root._start) return root._start(), true;
 if (DIRS.includes(action)) {
  const el = overlay.contains(document.activeElement) ? document.activeElement : null,
   side = action === 'left' ? -1 : action === 'right' ? 1 : 0;
  // ← → regolano cursori e scelte; ↑ ↓ passano alla voce successiva.
  if (side && el?.type === 'range') {
   el.value = String(Number(el.value) + side * Number(el.step || 1));
   el.dispatchEvent(new Event('input', { bubbles: true }));
   return true;
  }
  if (side && el?.tagName === 'SELECT') {
   el.selectedIndex = Math.max(0, Math.min(el.options.length - 1, el.selectedIndex + side));
   el.dispatchEvent(new Event('change', { bubbles: true }));
   return true;
  }
  moveFocus(root, action);
  return true;
 }
 if (action === 'a') {
  const talk = [...overlay.querySelectorAll('.panel, .narrative-content')].find(x => x._advance);
  if (talk && talk._advance()) return true;
  const pad = overlay.querySelector('.tap-pad');
  if (pad && raw !== ' ' && raw !== 'j') {
   pad.onpointerdown?.({ preventDefault() {} });
   return true;
  }
  const el = overlay.contains(document.activeElement) ? document.activeElement : root.querySelector('button:not([disabled])');
  if (el && ['SELECT', 'INPUT'].includes(el.tagName)) return true;
  el?.click();
  return true;
 }
 if (action === 'b') {
  const back = backButton(root);
  if (back) back.click();
  else if (!overlay.querySelector('.narrative, .instrument-choices')) close();
  return true;
 }
 if (action === 'start') {
  if (overlay.querySelector('.phone')) close();
  else if (mode === 'rhythm' && song?.paused) overlay.querySelector('button')?.click();
  return true;
 }
 if (action === 'select' && overlay.querySelector('.map-panel')) close();
 return true;
}
function handleAction(action, down, raw = null) {
 if (!action) return false;
 if (bootActive()) {
  if (down) introControl.handle(action);
  return true;
 }
 if (mode === 'rhythm') {
  if (down && action === 'start') {
   if (song?.paused) overlay.querySelector('button')?.click();
   else pauseSong();
   return true;
  }
  if (!overlay.hidden) return down ? overlayAction(action, raw) : true;
  const lane = laneFor(action);
  if (lane >= 0) down ? pressLane(lane) : releaseLane(lane);
  return true;
 }
 if (DIRS.includes(action) && !down) {
  keys.delete(action);
  return true;
 }
 if (!down) return true;
 if (!overlay.hidden) return overlayAction(action, raw);
 if (DIRS.includes(action)) keys.add(action);
 else if (action === 'a') interact();
 else if (action === 'b') raw === 'escape' ? startMenu() : toggleBike();
 else if (action === 'start') startMenu();
 else if (action === 'select') showMap();
 return true;
}
function bootActive() {
 return !!document.getElementById('bootScreen') && !!introControl;
}
document.addEventListener('keydown', e => {
 const key = e.key.toLowerCase();
 if (remapping) {
  e.preventDefault();
  remapping(key);
  return;
 }
 const typing = e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button'].includes(e.target.type));
 if (typing && !['enter', 'escape'].includes(key)) return;
 const action = actionFor(key, state.settings.keys);
 if (action || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
 if (e.repeat && !(action && DIRS.includes(action) && !overlay.hidden && mode !== 'rhythm')) return;
 if (mode === 'rhythm' && overlay.hidden && !bootActive()) {
  const lane = legacyLane(key);
  if (lane >= 0 && !action) {
   pressLane(lane);
   return;
  }
 }
 const typer = !overlay.hidden && !bootActive() && overlay.querySelector('.panel')?._typeKey;
 if (typer && !(action && DIRS.includes(action)) && typer(key)) {
  e.preventDefault();
  return;
 }
 if (handleAction(action, true, key)) return;
 if (overlay.hidden && mode === 'world' && key === 'm') showMap();
});
document.addEventListener('keyup', e => {
 const key = e.key.toLowerCase();
 if (mode === 'rhythm') {
  const lane = legacyLane(key);
  if (lane >= 0 && !actionFor(key, state.settings.keys)) releaseLane(lane);
 }
 handleAction(actionFor(key, state.settings.keys), false, key);
});
let padInfo = { connected: false, name: '' };
function pollPad() {
 const r = pollGamepad();
 if (r.connected !== padInfo.connected) toast(r.connected ? 'Controller collegato' : 'Controller scollegato');
 padInfo = r;
 for (const ev of r.events) handleAction(ev.action, ev.down, 'pad');
}
window.addEventListener('blur', () => {
 keys.clear();
 if (song && !song.paused) pauseSong();
});
document.addEventListener('visibilitychange', () => {
 if (document.hidden) {
  keys.clear();
  if (song && !song.paused) pauseSong();
  if (mode === 'world' && state.introDone) save();
 }
});
document.querySelectorAll('[data-move]').forEach(b => {
 const k = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right'
 } [b.dataset.move];
 b.onpointerdown = e => {
  if (!overlay.hidden || mode !== 'world') return;
  e.preventDefault();
  b.setPointerCapture(e.pointerId);
  keys.add(k);
  b.classList.add('held');
 };
 b.onpointerup = b.onpointercancel = () => {
  keys.delete(k);
  b.classList.remove('held');
 };
});
$('rotateSkip').onclick = () => {
 $('rotateHint').classList.add('dismissed');
 try { sessionStorage.setItem('rotate-ok', '1'); } catch {}
};
try { if (sessionStorage.getItem('rotate-ok')) $('rotateHint').classList.add('dismissed'); } catch {}
// Al primo tocco su telefono: schermo intero e orizzontale, dove il browser lo permette (Android).
document.addEventListener('pointerdown', function landscape(e) {
 if (e.pointerType !== 'touch') return;
 document.removeEventListener('pointerdown', landscape, true);
 const el = document.documentElement;
 Promise.resolve(el.requestFullscreen?.({ navigationUI: 'hide' })).then(() => screen.orientation?.lock?.('landscape')).catch(() => {});
}, true);
$('touchAction').onclick = interact;
$('touchStart').onclick = startMenu;
$('touchBike').onclick = toggleBike;
$('mapBtn').onclick = showMap;
$('bandBtn').onclick = showDex;
$('settingsBtn').onclick = settings;
$('pauseSong').onclick = pauseSong;
$('exitSong').onclick = () => exitSong();
$('soundBtn').onclick = () => {
 state.settings.muted = !state.settings.muted;
 syncAudio();
 save();
};
canvas.addEventListener('pointerdown', e => {
 if (mode !== 'world' || !overlay.hidden || transitioning) return;
 canvas.focus();
 const r = canvas.getBoundingClientRect(),
  scale = Math.min(r.width / W, r.height / H),
  ox = (r.width - W * scale) / 2,
  oy = (r.height - H * scale) / 2;
 const px = (e.clientX - r.left - ox) / scale,
  py = (e.clientY - r.top - oy) / scale;
 if (px < 0 || px > W || py < 0 || py > H) return;
 const cam = cameraNow(),
  x = (px + cam.x) / T,
  y = (py + cam.y) / T;
 const object = objects.filter(o => Math.hypot(o.x - x, o.y - y) < 1.7).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] || objects.find(o => o.building && x > o.building.x && x < o.building.x + o.building.w && y > o.building.y && y < o.building.y + o.building.h);
 const edge = layout.gates.find(g => Math.hypot(g.x - x, g.y - y) < 2);
 const target = object ? {
  x: object.x,
  y: object.y
 } : edge ? {
  x: edge.x,
  y: edge.y
 } : {
  x,
  y
 };
 path = tapPath(target);
 tapObject = object && !object.building ? object : null;
 tapDoor = object?.building ? object : null;
 if (!path.length && tapObject && Math.hypot(state.x - object.x, state.y - object.y) < 2.25) {
  near = object;
  tapObject = null;
  interact();
 }
});

function fitCanvas() {
 const r = canvas.getBoundingClientRect(),
  portrait = r.height > r.width * 1.15;
 // Mondo: inquadratura ravvicinata e centrata sul personaggio, come nei giochi di ruolo classici.
 // Concerti: inquadratura più ampia, per leggere la pista.
 if (mode === 'rhythm') H = portrait ? 860 : 600;
 else H = portrait ? Math.round(14 * T * r.height / r.width) : 16 * T;
 W = Math.round(H * r.width / r.height);
 // Disegno alla risoluzione reale dello schermo: inquadratura ravvicinata ma immagini nitide.
 pixelScale = Math.min(4, Math.max(1, r.height / H * (window.devicePixelRatio || 1)));
 canvas.width = Math.round(W * pixelScale);
 canvas.height = Math.round(H * pixelScale);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
loadExtras().then(keys => {
 if (!keys.includes('title')) return;
 const img = atlases.title;
 const apply = () => document.body.style.setProperty('--title-art', `url(${img.src})`);
 if (img.complete) apply();
 else img.onload = apply;
});
setupTown();
introControl = playIntro(titleOptions(QA || new URLSearchParams(location.search).has('nointro')));
requestAnimationFrame(frame);

function portraitCard(id) {
 return `<div class="person-card"><span class="person-portrait" style="--px:${id%4*100/3}%;--py:${Math.floor(id/4)*100/3}%"></span><p><strong>${PEOPLE[id][0]}</strong><br>${PEOPLE[id][1]}</p></div>`;
}

function showResident(o) {
 const c = CITIES[state.city];
 if (state.city === 3 && state.transport.bike === 1) {
  if (o.portrait === 11) {
   state.transport.bike = 2;
   save();
   updateJournal();
   panel('Una pompa per ripartire', portraitCard(11) + '<p>«La pompa di Arturo? Colpa mia: mi serviva per le ruote del carretto della radio. Eccola, e scusatemi con lui.»</p>', [{
    label: 'Riporta la pompa ad Arturo',
    run: close
   }], 'MISSIONE · LA BICI DEL CAMPEGGIO');
  } else panel(o.label, portraitCard(o.portrait) + '<p>«La pompa? L’ultima volta l’ho vista attaccata al carretto della radio. Chiedete a Emma, quella con l’impermeabile giallo.»</p>', [{
   label: 'Cerchiamo Emma',
   run: close
  }], 'MISSIONE · LA BICI DEL CAMPEGGIO');
  return;
 }
 const L = o.lines || {};
 let key = 'start';
 if (state.finished && L.final) key = 'final';
 else if (state.city === 0) key = state.passes.length === 8 && L.home ? 'home' : state.stage === 'tour' && L.tour ? 'tour' : 'start';
 else if (c.type === 'music') key = state.passes.includes(c.id) && L.pass ? 'pass' : state.puzzles.includes(c.id) && L.puzzle ? 'puzzle' : 'start';
 else key = state.stage === 'tour' && L.tour ? 'tour' : state.passes.length >= 2 && L.pass ? 'pass' : state.puzzles.length && L.puzzle ? 'puzzle' : 'start';
 panel(o.label, portraitCard(o.portrait ?? 15) + `<p>${L[key] || L.start || '«Buon viaggio!»'}</p>`, [{
  label: 'Ci vediamo in giro',
  run: close
 }], 'VOCI DI ' + c.name.toUpperCase());
}

function showRival(o) {
 const id = o.portrait;
 let text;
 if (state.city !== 0) text = RIVAL_LINES[id]?.[state.city] || '«Ci vediamo al festival.»';
 else if (state.stage === 'school' || state.stage === 'practice') text = ['«Una band, voi? Stasera in piazza vi facciamo vedere come si fa. Portate i tappi.»', '«Elia fa il duro con tutti. Io sono curiosa di sentirvi, in realtà. Ma non diteglielo.»', '«Stasera suoniamo noi per primi. Credo. Spero. Qualcuno ha visto le mie bacchette?»'][id];
 else if (state.stage === 'rival') text = ['«La piazza è pronta. Vediamo se sapete ascoltarvi quando arrivano gli errori.»', '«Elia esagera. Io voglio sentire il vostro basso. Ci vediamo davanti al palco.»', '«Prima di salire conto quattro volte. Se perdo il conto faccio finta fosse un fill.»'][id];
 else if (state.homeShow) text = ['«Al festival fate rumore anche per noi. E non cambiate niente.»', '«Grazie per l’ultimo pezzo. È stata la prima volta che ho ascoltato davvero mentre suonavo.»', '«Ho tenuto il tempo per tutto il brano. Merito vostro, o della clave di Rosa.»'][id];
 else if (state.passes.length >= 8) text = ['«Il concerto a casa è vostro. Però… l’ultimo pezzo potremmo suonarlo insieme. Se vi va.»', '«Elia vuole chiedervi una cosa e non ha il coraggio. Ve lo dico io: vorrebbe salire con voi.»', '«Ho le bacchette nuove. Le ho provate sul tavolo di cucina per un mese.»'][id];
 else if (state.passes.length >= 4) text = ['«Vi ho sentiti alla radio di Emma. Non male. Cioè: bene. Ok, molto bene.»', '«Il vostro suono è cambiato. Avete imparato a lasciare spazio.»', '«Mi insegnate quel passaggio? Senza dirlo a Elia.»'][id];
 else text = ['«Il festival è lontano per tutti. Anche noi ci alleniamo, sapete?»', '«Un consiglio: ascolta Vale quando smette di suonare. Anche le pause dicono qualcosa.»', '«Ho rotto una bacchetta. La tengo per ricordarmi di non stringere troppo.»'][id];
 panel(o.label + ' · Alta Tensione', portraitCard(id) + `<p>${text}</p>`, [{
  label: state.stage === 'rival' && state.city === 0 ? 'Verso la sfida' : 'Ci vediamo per strada',
  run: () => state.stage === 'rival' && state.city === 0 ? songBrief(0, 'rival') : close()
 }], 'I RIVALI');
}

function rememberRoad() {
 const key = 'road:' + Math.min(road.from, road.to) + '-' + Math.max(road.from, road.to);
 if (!state.memories.includes(key)) {
  state.memories.push(key);
  save();
 }
 return key;
}

function showRoadEncounter(o) {
 const key = 'road:' + roadKey(road.from, road.to),
  scene = ROAD_SCENES[roadKey(road.from, road.to)],
  info = PUZZLE_INFO[road.to] || PUZZLE_INFO[road.from];
 panel(o.label + ' · Una sosta lungo il viaggio', portraitCard(o.portrait ?? 12) + `<p>${state.memories.includes(key) ? '«Vi ricordate la nostra sosta? Ho ancora quella registrazione.»' : scene ? scene[1] : 'Un incontro lungo la strada.'}</p><p>Vale posa lo zaino: «Possiamo fermarci. Non tutte le cose importanti sono su un palco.»</p>`, [{
  label: 'Fermiamoci a provare',
  run: () => {
   rememberRoad();
   questEvent({
    type: 'roadPractice',
    road: roadKey(road.from, road.to)
   });
   songBrief(CITIES[road.to].type === 'music' ? road.to : CITIES[road.from].type === 'music' ? road.from : 1, 'practice');
  }
 }, {
  label: 'Due parole sulla strada',
  run: () => {
   rememberRoad();
   panel('Lungo la strada', `<p>«${CITIES[road.to].name}? ${info ? 'Ho sentito dire che laggiù ' + info.mech.toLowerCase() + ' è la prova del posto.' : 'È una tappa tranquilla, ma piena di storie.'}»</p><p>${info?.fact || 'Nel taccuino potete ritrovare le testimonianze raccolte.'}</p>`, [{
    label: 'Riprendiamo il viaggio',
    run: close
   }]);
  }
 }, {
  label: 'Salutiamo e proseguiamo',
  run: close,
  secondary: true
 }], 'INCONTRO SUL SENTIERO');
}



function showTransportQuest() {
 const q = state.transport;
 if (q.bike === 0) {
  panel('La bici del campeggio', portraitCard(13) + '<p>«Questa bici era della band di Riva: ci portavano gli amplificatori. Ma la pompa è sparita. Qualcuno del campeggio l’ha presa in prestito: chiedete ai ragazzi in piazza.»</p>', [{
   label: 'Accetta · cerca la pompa',
   run: () => {
    q.bike = 1;
    save();
    updateJournal();
    close();
    toast('Missione: chi ha preso la pompa? Chiedi in piazza.');
   }
  }, {
   label: 'Più tardi',
   run: close,
   secondary: true
  }], 'MISSIONE · UN MEZZO PER PARTIRE');
  return;
 }
 if (q.bike === 1) {
  panel('Manca ancora la pompa', '<p>«Chiedete ai ragazzi del campeggio, qui in piazza. Qualcuno avrà visto la pompa.»</p>', [{
   label: 'Cerchiamola',
   run: close
  }]);
  return;
 }
 if (q.bike === 2) {
  q.bike = 3;
  state.bicycle = true;
  if (!state.stories.includes(3)) state.stories.push(3);
  save();
  updateJournal();
  panel('La prima pedalata', '<p>Arturo gonfia le gomme, controlla la bici con voi e ve la consegna. Nico tiene il manubrio, Vale ride: «Adesso voglio vedere il mare.»</p><p><strong>Missione completata · Bicicletta ottenuta.</strong> Usa B oppure BICI. Arturo ha anche un altro lavoro per voi.</p>', [{
   label: 'Chiedi della metro',
   run: showTransportQuest
  }, {
   label: 'In sella',
   run: close
  }], 'RICOMPENSA · BICICLETTA');
  return;
 }
 if (q.metro === 0) {
  panel('Le voci delle Otto Strade', portraitCard(13) + '<p>«La metro ha aperto i collegamenti con gli altri paesi, ma al nostro sportello manca la sequenza degli annunci musicali. Nella stazione c’è il vecchio nastro: ritrovate l’ordine delle frasi e riportatemelo. Per ringraziarvi vi darò il pass della tournée.»</p>', [{
   label: 'Accetta · entra nella stazione',
   run: () => {
    q.metro = 1;
    save();
    updateJournal();
    close();
    toast('Missione: entra nella Stazione Nord e ricomponi gli annunci.');
   }
  }, {
   label: 'Più tardi',
   run: close,
   secondary: true
  }], 'MISSIONE · IL PASS DELLA METRO');
  return;
 }
 if (q.metro === 1) {
  panel('La stazione vi aspetta', '<p>«Il nastro è dentro la Stazione Nord. Ricomponete gli annunci e poi tornate da me.»</p>', [{
   label: 'Andiamo alla stazione',
   run: close
  }]);
  return;
 }
 if (q.metro === 2) {
  q.metro = 3;
  save();
  updateJournal();
  panel('Una fermata dopo l’altra', '<p>Arturo ascolta il nastro. «Adesso sì. Quando sentirete queste note, saprete di essere sulla strada di casa.»</p><p><strong>Missione completata · Pass metro ottenuto.</strong> Raggiungi un ingresso contrassegnato M nelle città servite. Puoi viaggiare tra fermate già visitate. Per l’isola usa nave o pontile; per Monteferro la funivia.</p>', [{
   label: 'Scegli la fermata',
   run: showMetro
  }, {
   label: 'Torniamo in città',
   run: close
  }], 'RICOMPENSA · PASS METRO');
  return;
 }
 showMetro();
}

function metroAnnouncement() {
 let index = 0;
 const names = ['Ponte · Rivafosca', 'Officine · Officina', 'Binari · Binario Nord', 'Giardini · Bellavista'],
  sequence = [0, 1, 2, 3];
 const p = panel('Il nastro degli annunci', '<p>La custodia del nastro è strappata. Restano tre righe, scritte da Arturo tanti anni fa:</p><ul class="clue-list"><li>«La linea parte dal ponte.»</li><li>«Le officine non sono mai l’ultima fermata.»</li><li>«I giardini arrivano subito dopo i binari.»</li></ul><p>Ogni frammento ha il suo segnale: toccalo per ascoltarlo e mettilo in coda.</p><div class="case-parts"></div><p id="metroAnswer" aria-live="polite">0 / 4 annunci ordinati</p>', [{
  label: 'Riparti dall’inizio',
  run: metroAnnouncement
 }, {
  label: 'Torna in stazione',
  run: close
 }], 'MISSIONE · LE VOCI DELLE OTTO STRADE');
 for (const i of [3, 1, 2, 0]) {
  const b = document.createElement('button');
  b.className = 'btn secondary';
  b.textContent = names[i];
  b.onclick = async () => {
   try {
    await audio.init();
    audio.tone(220 * Math.pow(2, [0, 7, 4, 12][i] / 12), audio.ctx.currentTime, .3, 'triangle', .12);
   } catch {}
   if (i === sequence[index]) {
    index++;
    b.disabled = true;
    p.querySelector('#metroAnswer').textContent = index + ' / 4 annunci ordinati';
    if (index === 4) {
     state.transport.metro = 2;
     save();
     updateJournal();
     panel('Il nastro è pronto', '<p>Ponte, officine, binari, giardini: le fermate tornano nell’ordine della vecchia linea. Riportate il nastro ad Arturo in piazza.</p>', [{
      label: 'Torna da Arturo',
      run: close
     }], 'MISSIONE · ULTIMO PASSAGGIO');
    }
   } else {
    index = 0;
    p.querySelectorAll('.case-parts button').forEach(x => x.disabled = false);
    p.querySelector('#metroAnswer').textContent = 'Questo annuncio non torna con la custodia. Si riparte dal primo.';
   }
  };
  p.querySelector('.case-parts').appendChild(b);
 }
}

function travelConnection(to, label) {
 close();
 fade(() => {
  state.city = to;
  if (!state.visited.includes(to)) state.visited.push(to);
  const l = townLayout(to),
   o = l.objects.find(o => o.kind === (label === 'Funivia' ? 'cable' : 'ferry'));
  const pos = o ? {
   x: o.x,
   y: o.y + 1
  } : metroSpawn(l).find(p => isWalkable(l, p.x, p.y));
  Object.assign(state, pos, {
   facing: 'south',
   bike: false
  });
  setupTown();
  portalCooldown = 1;
  save();
  if (label === 'Funivia') questEvent({
   type: 'cable'
  });
  toast(label + ' · ' + CITIES[to].name);
 });
}

function rideCable() {
 if (state.stage !== 'tour') {
  toast('Prima cominciate la tournée.');
  return;
 }
 const to = state.city === 7 ? 6 : 7;
 panel('La funivia di Monteferro', to === 7 ? '<p>Una cabina risale il versante oltre l’accademia. Sotto scorrono il bosco e i tornanti; in alto vi aspettano le case di pietra e la fortezza.</p>' : '<p>La cabina scende verso Valdaccordo. Il vento della montagna lascia il posto al profumo dei tigli dell’accademia.</p>', [{
  label: 'Sali · ' + CITIES[to].name,
  run: () => travelConnection(to, 'Funivia')
 }, {
  label: 'Resta qui',
  run: close
 }], 'COLLEGAMENTO DI MONTAGNA');
}

// ==== MODALITÀ QA (solo con ?qa=1; non attiva nel gioco normale) ====
const QA_LOG = 'b3pz-tour-qa-log';

function qaLog(e) {
 const entry = {
  ts: new Date().toISOString(),
  ...e
 };
 let l = [];
 try {
  l = JSON.parse(localStorage.getItem(QA_LOG)) || [];
 } catch {}
 l.push(entry);
 try {
  localStorage.setItem(QA_LOG, JSON.stringify(l));
 } catch {}
 console.info('[QA]', JSON.stringify(entry));
 return entry;
}

function qaFinish(kind) {
 if (!song) {
  toast('QA: nessun brano in corso.');
  return null;
 }
 const target = {
  fail: 20,
  normal: 65,
  mastery: 95
 } [kind];
 const n = song.notes.length,
  k = Math.round(n * target / 100);
 song.notes.forEach((x, i) => {
  x.status = i < k ? 'hit' : 'miss';
  x.points = i < k ? 1 : 0;
 });
 song.early = 0;
 const info = {
  place: CITIES[state.city].name,
  area,
  interior: room?.entry?.label || null,
  songCity: CITIES[song.city].name,
  trial: song.kind,
  instrument: state.instrument,
  difficulty: state.settings.difficulty,
  simulated: kind,
  score: accuracy(song.notes)
 };
 if (song.paused) {
  song.paused = false;
 }
 endSong();
 info.outcome = (overlay.innerText || '').split('\n').slice(0, 6).join(' | ');
 return qaLog(info);
}
if (QA) {
 const b = document.createElement('div');
 b.id = 'qaBar';
 b.setAttribute('role', 'region');
 b.setAttribute('aria-label', 'Strumenti QA');
 b.style.cssText = 'position:fixed;z-index:9999;left:0;top:50%;transform:translateY(-50%);background:#b3202a;color:#fff;font:700 10px/1.2 monospace;padding:6px 4px;border-radius:0 8px 8px 0;display:flex;flex-direction:column;gap:4px;align-items:stretch;width:74px;box-shadow:0 2px 8px #0006';
 b.innerHTML = '<span style="text-align:center">MODALITÀ<br>QA</span><button data-qa="fail" title="Concludi il concerto: fallito">Fallito</button><button data-qa="normal" title="Concludi il concerto: successo">Successo</button><button data-qa="mastery" title="Concludi il concerto: padronanza">Padronanza</button><button data-qa="log" title="Registro simulazioni">Registro</button>';
 document.body.appendChild(b);
 b.querySelectorAll('button').forEach(x => {
  x.style.cssText = 'font:inherit;font-weight:600;padding:3px 2px;border-radius:4px;border:0;cursor:pointer';
  x.onclick = () => {
   if (x.dataset.qa === 'log') {
    let l = [];
    try {
     l = JSON.parse(localStorage.getItem(QA_LOG)) || [];
    } catch {}
    console.table(l);
    toast('QA: ' + l.length + ' simulazioni registrate (console).');
   } else qaFinish(x.dataset.qa);
  };
 });
 window.__qa = {
  finish: qaFinish,
  state: () => JSON.parse(JSON.stringify(state)),
  where: () => ({
   area,
   mode,
   path: path.length, next: path.slice(0, 3), transitioning,
   near: near?.label || null,
   ride: ride ? { t: +ride.t.toFixed(1), duration: +ride.duration.toFixed(1) } : null,
   room: room?.entry?.label || null,
   road: road ? {
    ...road
   } : null,
   song: song ? {
    city: song.city,
    kind: song.kind,
    notes: song.notes.length
   } : null
  }),
  // Cammino automatico con il normale movimento del gioco (stesso percorso del tocco sullo schermo).
  walk: (x, y) => {
   path = tapPath({ x, y });
   tapObject = null;
   return path.length;
  },
  gates: () => (layout.gates || []).map(g => ({ ...g })),
  can: (x, y) => canMove(x, y),
  // Solo per le verifiche visive: porta in una città o dentro un edificio senza camminare.
  goCity: id => {
   state.city = id;
   state.x = -5;
   state.y = -5;
   close();
   setupTown();
  },
  enter: label => {
   const e = townLayout(state.city).objects.find(o => o.building && o.label === label);
   if (e) setupRoom(e);
   return !!e;
  },
  rooms: () => townLayout(state.city).objects.filter(o => o.building).map(o => o.label),
  road: (from, to) => {
   road = { from, to };
   room = null;
   area = 'road';
   layout = roadLayout(from, to);
   objects = layout.objects;
   solids = [];
   Object.assign(state, layout.spawn);
  },
  objects: () => objects.map(o => ({ kind: o.kind, label: o.label, id: o.id, x: o.x, y: o.y, building: !!o.building })),
  log: () => {
   try {
    return JSON.parse(localStorage.getItem(QA_LOG)) || [];
   } catch {
    return [];
   }
  }
 };
 document.title = '[QA] ' + document.title;
}