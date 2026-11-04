import { STYLES, songPlan, partNotes } from './music.js';
export const INSTRUMENTS = {
 guitar: {
  name: 'Chitarra',
  role: 'Riff, accordi e note sostenute.',
  lanes: 4,
  labels: ['D', 'F', 'J', 'K'],
  colors: ['#d48d5b', '#d9bd65', '#80ad96', '#9b91bc']
 },
 bass: {
  name: 'Basso',
  role: 'Pause, sincopi e groove.',
  lanes: 3,
  labels: ['D', 'F', 'J'],
  colors: ['#d48d5b', '#d9bd65', '#80ad96']
 },
 drums: {
  name: 'Batteria',
  role: 'Cassa, rullante, charleston e piatto.',
  lanes: 4,
  labels: ['D', 'F', 'J', 'K'],
  colors: ['#d48d5b', '#d9bd65', '#80ad96', '#9b91bc']
 }
};
export const CITIES = [{
  id: 0,
  name: 'Borgo delle Cicale',
  genre: 'Casa',
  type: 'story',
  color: '#6a9270',
  roof: '#b66b50',
  month: 'GIUGNO',
  text: 'Il profumo dei campi, la strada verso scuola. Il mondo comincia qui.'
 },
 {
  id: 1,
  name: 'Rivafosca',
  genre: 'Blues',
  type: 'music',
  color: '#6b9d9e',
  roof: '#647b93',
  bpm: 90,
  root: 110,
  teacher: 'Nino',
  lesson: 'Ascolta la frase. Poi rispondi, senza avere fretta.',
  pattern: [0, 1, 0, 2]
 },
 {
  id: 2,
  name: 'Officina',
  genre: 'Rock',
  type: 'music',
  color: '#87947a',
  roof: '#a35746',
  bpm: 112,
  root: 146.83,
  teacher: 'Ada',
  lesson: 'Un riff semplice, suonato insieme, può riempire una stanza.',
  pattern: [0, 0, 2, 3]
 },
 {
  id: 3,
  name: 'Binario Nord',
  genre: 'Crocevia',
  type: 'story',
  color: '#8fa38b',
  roof: '#8e775c',
  month: 'LUGLIO',
  text: 'Al campeggio passano band da tutta la regione. Qui trovi una vecchia bicicletta.'
 },
 {
  id: 4,
  name: 'Bellavista',
  genre: 'Pop',
  type: 'music',
  color: '#aac38b',
  roof: '#cb9488',
  bpm: 108,
  root: 130.81,
  teacher: 'Lia',
  lesson: 'Strofa, ritornello, ponte. Ogni parte ha il suo posto.',
  pattern: [0, 1, 0, 3]
 },
 {
  id: 5,
  name: 'Grooveto',
  genre: 'Funk',
  type: 'music',
  color: '#9aaa71',
  roof: '#9e8053',
  bpm: 104,
  root: 98,
  teacher: 'Tito',
  lesson: 'Il silenzio tra due note è parte del groove.',
  pattern: [0, 2, 1, 2]
 },
 {
  id: 6,
  name: 'Valdaccordo',
  genre: 'Archivio',
  type: 'story',
  color: '#8fa68b',
  roof: '#8c7384',
  text: 'Una scuola chiusa, una vecchia cassetta. Anche il vostro insegnante aveva una band.'
 },
 {
  id: 7,
  name: 'Monteferro',
  genre: 'Metal',
  type: 'music',
  color: '#7e8c8c',
  roof: '#666d80',
  bpm: 136,
  root: 82.41,
  teacher: 'Iris',
  lesson: 'Energia e controllo. Prima pulito, poi veloce.',
  pattern: [0, 0, 1, 3]
 },
 {
  id: 8,
  name: 'Porto del Sol',
  genre: 'Latino',
  type: 'music',
  color: '#a4b58a',
  roof: '#ca805c',
  bpm: 116,
  root: 123.47,
  teacher: 'Rosa',
  lesson: 'Segui gli accenti. Il ritmo è un cerchio, non una fila.',
  pattern: [0, 2, 1, 3]
 },
 {
  id: 9,
  name: 'Isola Levante',
  genre: 'Reggae',
  type: 'music',
  color: '#94bd8a',
  roof: '#b8935d',
  bpm: 84,
  root: 130.81,
  teacher: 'Teo',
  lesson: 'Lascia respirare il battere. Cerca lo spazio in mezzo.',
  pattern: [1, 3, 1, 3]
 },
 {
  id: 10,
  name: 'Notturnia',
  genre: 'Jazz',
  type: 'music',
  color: '#7e8f9b',
  roof: '#777396',
  bpm: 100,
  root: 116.54,
  teacher: 'Mina',
  lesson: 'Ascolta gli altri. Una variazione può diventare una risposta.',
  pattern: [0, 2, 3, 1]
 },
 {
  id: 11,
  name: 'Settembre',
  genre: 'Festival',
  type: 'final',
  color: '#99a77a',
  roof: '#c29c62',
  month: 'SETTEMBRE',
  text: 'Il palco che sembrava lontanissimo. Tutte le strade portano qui.'
 }
];
export const EDGES = [
 [0, 1],
 [1, 2],
 [2, 3],
 [3, 4],
 [4, 5],
 [5, 6],
 [6, 7],
 [8, 9],
 [9, 10],
 [10, 11],
 [3, 6],
 [5, 8],
 [2, 0],
 [10, 6]
];
export const MUSIC_CITIES = CITIES.filter(c => c.type === 'music');
export const DEFAULT_SETTINGS = {
 volume: .55,
 offset: 0,
 difficulty: 'normal',
 muted: false
};
export function initialState(instrument = 'guitar') {
 return {
  version: 1,
  instrument,
  starter: instrument,
  mastery: {},
  transport: {
   bike: 0,
   metro: 0
  },
  city: 0,
  x: 10.5,
  y: 14,
  facing: 'south',
  introDone: false,
  scene: null,
  stage: 'school',
  passes: [],
  puzzles: [],
  visited: [0],
  stories: [],
  memories: [],
  mystery: 0,
  bandName: null,
  rivalsJoined: false,
  msgs: {},
  bicycle: false,
  bike: false,
  boat: false,
  homeShow: false,
  finished: false,
  xp: 0,
  best: {},
  settings: {
   ...DEFAULT_SETTINGS
  }
 };
}
export function validateState(s) {
 if (!s || s.version !== 1 || !INSTRUMENTS[s.instrument] || !Number.isInteger(s.city) || !CITIES[s.city]) return null;
 const out = initialState(s.instrument);
 const ids = a => Array.isArray(a) ? [...new Set(a.filter(n => Number.isInteger(n) && CITIES[n]))] : [];
 for (const k of ['bike', 'metro']) out.transport[k] = Number.isInteger(s.transport?.[k]) ? Math.max(0, Math.min(3, s.transport[k])) : 0;
 out.starter = INSTRUMENTS[s.starter] ? s.starter : s.instrument;
 out.mastery = {};
 if (s.mastery && typeof s.mastery === 'object')
  for (const [k, v] of Object.entries(s.mastery))
   if (/^(1|2|4|5|7|8|9|10):(guitar|bass|drums)$/.test(k) && Number.isFinite(v) && v >= 0 && v <= 100) out.mastery[k] = v;
 out.city = s.city;
 out.x = Number.isFinite(s.x) ? Math.min(46.7, Math.max(1.3, s.x)) : 10.5;
 out.y = Number.isFinite(s.y) ? Math.min(32.7, Math.max(1.3, s.y)) : 14;
 out.facing = ['north', 'south', 'east', 'west'].includes(s.facing) ? s.facing : 'south';
 out.introDone = s.introDone === undefined ? true : s.introDone === true;
 if (s.scene?.type === 'road' && s.scene.from === s.city && neighbors(s.scene.from).includes(s.scene.to)) out.scene = {
  type: 'road',
  from: s.scene.from,
  to: s.scene.to
 };
 if (s.scene?.type === 'interior' && typeof s.scene.label === 'string' && s.scene.label.length < 80) out.scene = {
  type: 'interior',
  label: s.scene.label
 };
 out.memories = Array.isArray(s.memories) ? [...new Set(s.memories.filter(x => typeof x === 'string' && /^road:[0-9]{1,2}-[0-9]{1,2}$/.test(x)))].slice(0, 30) : [];
 out.stage = ['school', 'practice', 'rival', 'tour'].includes(s.stage) ? s.stage : 'school';
 out.passes = ids(s.passes).filter(id => CITIES[id].type === 'music');
 out.puzzles = ids(s.puzzles).filter(id => CITIES[id].type === 'music');
 out.visited = [...new Set([0, ...ids(s.visited), out.city])];
 out.stories = ids(s.stories).filter(id => CITIES[id].type === 'story');
 for (const k of ['bicycle', 'bike', 'boat', 'homeShow', 'finished', 'rivalsJoined']) out[k] = s[k] === true;
 out.mystery = Number.isInteger(s.mystery) ? Math.max(0, Math.min(2, s.mystery)) : out.stories.includes(6) ? 1 : 0;
 if (out.mystery && !out.stories.includes(6)) out.stories.push(6);
 out.msgs = {};
 if (s.msgs && typeof s.msgs === 'object')
  for (const [k, v] of Object.entries(s.msgs))
   if (/^[a-z-]{3,30}$/.test(k) && v && typeof v === 'object') out.msgs[k] = { r: v.r === true, d: v.d === true };
 out.bandName = typeof s.bandName === 'string' && s.bandName.trim() && s.bandName.length <= 30 ? s.bandName.trim() : null;
 if (out.bicycle) out.transport.bike = 3;
 if (out.transport.bike !== 3) out.transport.metro = 0;
 out.xp = Number.isFinite(s.xp) ? Math.min(100000, Math.max(0, Math.floor(s.xp))) : 0;
 if (s.best && typeof s.best === 'object')
  for (const [key, value] of Object.entries(s.best))
   if (/^\d+$/.test(key) && Number.isFinite(value)) out.best[key] = Math.max(0, Math.min(100, value));
 if (!s.mastery)
  for (const id of out.passes) out.mastery[id + ':' + out.starter] = out.best[id] ?? 50;
 const st = s.settings || {};
 out.settings = {
  volume: Number.isFinite(st.volume) ? Math.max(0, Math.min(1, st.volume)) : .55,
  offset: Number.isFinite(st.offset) ? Math.max(-250, Math.min(250, st.offset)) : 0,
  difficulty: ['assist', 'normal', 'expert'].includes(st.difficulty) ? st.difficulty : 'normal',
  muted: st.muted === true
 };
 return out;
}
export function neighbors(id) {
 return EDGES.filter(e => e.includes(id)).map(e => e[0] === id ? e[1] : e[0]);
}
export function stepToward(start, target, budget) {
 const dx = target.x - start.x,
  dy = target.y - start.y,
  length = Math.hypot(dx, dy);
 if (!length) return {
  dx: 0,
  dy: 0
 };
 const distance = Math.min(Math.max(0, budget), length);
 return {
  dx: dx / length * distance,
  dy: dy / length * distance
 };
}
export function findPath(start, target, canEnter, maxX = 66, maxY = 34) {
 const from = [Math.round(start.x), Math.round(start.y)],
  to = [Math.round(target.x), Math.round(target.y)],
  key = (x, y) => x + ',' + y;
 if (!canEnter(to[0], to[1])) return [];
 const queue = [from],
  parents = new Map([
   [key(...from), null]
  ]);
 let head = 0;
 while (head < queue.length) {
  const p = queue[head++];
  if (p[0] === to[0] && p[1] === to[1]) {
   const path = [];
   let current = p;
   while (current) {
    path.push({
     x: current[0],
     y: current[1]
    });
    current = parents.get(key(...current));
   }
   return path.reverse().slice(1);
  }
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
   ]) {
   const x = p[0] + dx,
    y = p[1] + dy,
    k = key(x, y);
   if (x < 0 || y < 0 || x > maxX || y > maxY || parents.has(k) || !canEnter(x, y)) continue;
   parents.set(k, p);
   queue.push([x, y]);
  }
 }
 return [];
}
export function gate(s, to) {
 if (s.stage !== 'tour') return 'Prima ritrova gli amici alla sala prove.';
 if (to === 11 && s.passes.length < 8) return 'Il festival richiede tutti e otto i pass.';
 if (to === 11 && !s.homeShow) return 'Prima del festival, gli amici ti aspettano per il concerto a casa.';
 return null;
}
export function month(s) {
 return s.finished || s.city === 11 ? 'SETTEMBRE' : s.passes.length >= 5 ? 'AGOSTO' : s.passes.length >= 2 ? 'LUGLIO' : 'GIUGNO';
}
export function chartGenre(city, kind) {
 if (kind === 'rival') return 'Rock';
 const c = CITIES[city] || CITIES[0];
 return STYLES[c.genre] ? c.genre : 'Casa';
}
export function makeChart(instrument, city, difficulty = 'normal', kind = 'concert') {
 const c = CITIES[city] || CITIES[1],
  genre = chartGenre(city, kind),
  bpm = kind === 'final' ? 112 : kind === 'rival' ? 120 : c.bpm || 104,
  beat = 60 / bpm,
  plan = songPlan(kind, genre),
  bars = plan.length;
 const toNotes = (inst, diff) => partNotes(inst, plan, diff).map(x => ({
  t: 2 + x.beat * beat,
  lane: x.lane,
  duration: x.durBeats * beat,
  pitch: x.pitch,
  chord: x.chord,
  root: x.root
 })).sort((a, b) => a.t - b.t || a.lane - b.lane);
 const notes = toNotes(instrument, difficulty).map((n, id) => ({ id, ...n }));
 const backing = {};
 for (const other of Object.keys(INSTRUMENTS))
  if (other !== instrument) backing[other] = toNotes(other, 'normal');
 return {
  notes,
  bpm,
  beat,
  bars,
  plan,
  genre,
  backing,
  duration: 2 + bars * 4 * beat + 1,
  city,
  instrument
 };
}
export function hitWindow(difficulty) {
 return difficulty === 'assist' ? .24 : difficulty === 'expert' ? .105 : .16;
}
export function findNote(notes, lane, time, window) {
 let candidate = null;
 for (const n of notes) {
  if (n.lane !== lane || n.status || Math.abs(n.t - time) > window) continue;
  if (!candidate || Math.abs(n.t - time) < Math.abs(candidate.t - time)) candidate = n;
 }
 return candidate;
}
export function accuracy(notes) {
 if (!notes.length) return 0;
 return Math.round(100 * notes.reduce((s, n) => s + (n.points || 0), 0) / notes.length);
}
export function award(s, id, score, kind) {
 const first = !(String(id) in s.best);
 s.best[id] = Math.max(s.best[id] || 0, score);
 const threshold = s.settings.difficulty === 'assist' ? 35 : 50;
 const won = score >= threshold;
 if (kind === 'tutorial') {
  s.stage = 'rival';
  return {
   won: true,
   message: score >= 50 ? 'Ottimo inizio: Nico e Vale si guardano stupiti. Adesso la piazza.' : 'Per ora è soprattutto rumore, ma è il vostro rumore. Vale: «Domani suona meglio. Stasera, intanto, la piazza.»'
  };
 }
 if (kind === 'rival') {
  s.stage = 'tour';
  return {
   won: true,
   message: score >= 75 ? 'Hai sorpreso i rivali. La band ha ancora strada da fare: loro vincono il confronto, ma ricordano il tuo nome.' : 'I rivali vincono il confronto. Voi avete appena cominciato: è il momento di partire.'
  };
 }
 if (!won) return {
  won: false,
  message: score >= 35 ? 'Ci siamo quasi: ancora qualche colpo a tempo. Puoi riprovare subito.' : 'Il brano vi è sfuggito. Riprova, allenati in sala prove o scegli la modalità accessibile.'
 };
 if (['concert', 'practice'].includes(kind) && s.puzzles.includes(id)) {
  const key = id + ':' + s.instrument;
  s.mastery[key] = Math.max(s.mastery[key] ?? 0, score);
 }
 if (kind === 'boat') {
  s.boat = true;
  return {
   won: true,
   message: 'Il concerto sul ponte è riuscito. I passeggeri ballano fino all’attracco. Prossima fermata: Isola Levante.'
  };
 }
 if (kind === 'home') {
  s.homeShow = true;
  return {
   won: true,
   message: 'Stavolta il paese chiede il bis. Il festival vi aspetta.'
  };
 }
 if (kind === 'final') {
  s.finished = true;
  return {
   won: true,
   message: 'Dal garage al festival. Questa estate è vostra.'
  };
 }
 if (kind === 'practice') return {
  won: true,
  message: 'Una buona prova. Il palco ti aspetta quando vuoi.'
 };
 if (!s.passes.includes(id)) {
  s.passes.push(id);
  s.xp += 100;
  return {
   won: true,
   newPass: true,
   message: `Pass ${CITIES[id].genre} ottenuto. Un altro pezzo di estate da portare con voi.`
  };
 }
 if (first) s.xp += 10;
 return {
  won: true,
  message: `Un altro concerto a ${CITIES[id].name}: il pubblico vi riconosce. Il pass è già nel taccuino.`
 };
}