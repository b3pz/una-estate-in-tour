import {
 CITIES,
 MUSIC_CITIES,
 INSTRUMENTS,
 gate,
 neighbors
} from './core.js';
export const MAP_POINTS = [
 [9, 73],
 [24, 71],
 [39, 76],
 [30, 49],
 [46, 47],
 [62, 49],
 [48, 29],
 [65, 14],
 [70, 70],
 [89, 72],
 [85, 31],
 [91, 13]
];
const NAMES = {
 1: ['Fraseggio blues', 'Giro blues', 'Risposta ritmica'],
 2: ['Riff rock', 'Fondamentali del riff', 'Backbeat'],
 4: ['Accordi e ritornello', 'Sostegno della canzone', 'Ritmo della strofa'],
 5: ['Accenti e pause', 'Groove sincopato', 'Incastro ritmico'],
 7: ['Riff e controllo', 'Precisione del basso', 'Fill e continuità'],
 8: ['Accenti intrecciati', 'Ciclo del basso', 'Ciclo delle percussioni'],
 9: ['Accordi sul levare', 'Pulsazione e spazio', 'Accenti in levare'],
 10: ['Variazione del tema', 'Risposta del basso', 'Dialogo ritmico']
};
export function abilityDex(s) {
 return MUSIC_CITIES.flatMap(c => {
  const discovered = s.visited.includes(c.id),
   theory = s.puzzles.includes(c.id);
  return [{
   id: c.id + ':knowledge',
   city: c.id,
   title: 'Ascolto · ' + c.genre,
   instrument: 'shared',
   discovered,
   learned: theory,
   mastered: theory,
   description: 'Ricostruisci gli appunti e supera la prova di ascolto con ' + c.teacher + '.'
  }, ...Object.keys(INSTRUMENTS).map((instrument, i) => {
   const score = s.mastery?.[c.id + ':' + instrument];
   return {
    id: c.id + ':' + instrument,
    city: c.id,
    title: NAMES[c.id][i],
    instrument,
    discovered,
    learned: score !== undefined,
    mastered: score >= 85,
    score,
    description: 'Dopo la prova di ' + c.teacher + ', supera un concerto o una prova musicale in questa città con ' + INSTRUMENTS[instrument].name.toLowerCase() + '.'
   };
  })];
 });
}
export function metroReason(s, to) {
 if (!METRO_STOPS.includes(s.city)) return 'Questa località non ha una stazione metro.';
 if (!METRO_STOPS.includes(to)) return to === 9 ? 'L’isola si raggiunge in nave o dal pontile.' : to === 7 ? 'Monteferro si raggiunge in funivia.' : 'Questa località non è servita dalla metro.';
 if (s.stage !== 'tour') return 'La tournée deve ancora cominciare.';
 if (s.transport?.metro !== 3) return 'Completa la missione degli annunci di Arturo a Binario Nord.';
 if (!Number.isInteger(to) || !CITIES[to] || !s.visited.includes(to)) return 'Raggiungi prima questa fermata viaggiando.';
 if (to === s.city) return 'Sei già in questa città.';
 if (to === 9 && !s.boat) return 'Prima completa la traversata verso l’isola.';
 return gate(s, to);
}
export function metroSpawn(layout) {
 const station = layout.objects.find(o => o.kind === 'metro');
 const candidates = [...(station ? [{
  x: station.x,
  y: station.y + 1
 }, {
  x: station.x + 1,
  y: station.y
 }, {
  x: station.x - 1,
  y: station.y
 }, {
  x: station.x,
  y: station.y - 1
 }] : []), {
  x: 24,
  y: 19
 }, {
  x: 24,
  y: 18
 }, ...layout.objects.filter(o => o.kind === 'npc').map(o => ({
  x: o.x,
  y: o.y + 2
 }))];
 return candidates;
}
export const METRO_STOPS = [1, 2, 3, 4, 5, 8, 10, 11];

// Route advice follows physical connections; it never moves the player or grants access.
export function journeyLeg(s, from, to) {
 let mode = 'Sentiero',
  requirement = null;
 if ([from, to].includes(6) && [from, to].includes(7)) mode = 'Funivia';
 if ([from, to].includes(8) && [from, to].includes(9)) {
  mode = 'Traghetto';
  if (!s.boat) requirement = 'Suona durante la prima traversata da Porto del Sol.';
 }
 if ([from, to].includes(9) && [from, to].includes(10)) {
  mode = 'Pontile';
  if (!s.boat) requirement = 'Prima raggiungi l’isola con il traghetto da Porto del Sol.';
 }
 return {
  from,
  to,
  mode,
  requirement,
  blocked: gate(s, to) || ((mode === 'Pontile' && !s.boat) ? requirement : null)
 };
}
export function journeyRoute(s, to) {
 if (!Number.isInteger(to) || !CITIES[to]) return null;
 const queue = [
   [s.city]
  ],
  seen = new Set([s.city]);
 while (queue.length) {
  const route = queue.shift(),
   from = route.at(-1);
  if (from === to) return {
   cities: route,
   legs: route.slice(1).map((id, i) => journeyLeg(s, route[i], id))
  };
  for (const id of neighbors(from)) {
   if (seen.has(id)) continue;
   const leg = journeyLeg(s, from, id);
   if (leg.blocked) continue;
   seen.add(id);
   queue.push([...route, id]);
  }
 }
 return null;
}