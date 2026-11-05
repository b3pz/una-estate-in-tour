import { ROUTES, routeKey as rKey, routeWalkable, pathDistance, inRect, roundPath } from './routes.js';
import {
 METRO_STOPS
} from './progress.js';
import {
 TEACHER_ART,
 PEOPLE,
 RESIDENTS,
 RIVAL_POSTS,
 NPC_NAMES,
 ROAD_SCENES,
 roadKey
} from './adventure.js';
import {
 CITIES,
 CITY_IDS,
 CITY_MAP
} from './core.js';
import {
 drawSprite,
 spriteCell,
 hasAtlas
} from './assets.js';

// Pseudo-casuale stabile: stesse decorazioni a ogni visita.
const rnd = k => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export const TILE = 24,
 WIDTH = 48,
 HEIGHT = 34;
export const REGION = [
 [85, 335],
 [205, 335],
 [325, 335],
 [325, 235],
 [455, 235],
 [580, 235],
 [455, 125],
 [580, 55],
 [700, 280],
 [830, 280],
 [830, 150],
 [830, 55]
];
const LINKS = [
 [0, 1, 'east', 'west', 18, 18],
 [1, 2, 'east', 'west', 18, 18],
 [2, 3, 'north', 'south', 24, 24],
 [3, 4, 'east', 'west', 18, 18],
 [4, 5, 'east', 'west', 18, 18],
 [5, 6, 'north', 'south', 24, 24],
 [6, 7, 'north', 'south', 24, 24],
 [8, 9, 'east', 'west', 18, 18],
 [9, 10, 'north', 'south', 24, 24],
 [10, 11, 'north', 'south', 24, 24],
 [3, 6, 'north', 'west', 34, 18],
 [5, 8, 'south', 'west', 34, 24],
 [2, 0, 'south', 'north', 14, 30],
 [10, 6, 'west', 'east', 18, 18]
];
export const OPPOSITE = {
 east: 'west',
 west: 'east',
 north: 'south',
 south: 'north'
};
export function dimsOf(id) {
 return CITY_IDS.includes(id) ? CITY_MAP : { w: WIDTH, h: HEIGHT, ox: 0, oy: 0 };
}
export function pointOnSide(side, lane, inset = 1.5, dims = { w: WIDTH, h: HEIGHT }) {
 return side === 'west' ? {
  x: inset,
  y: lane
 } : side === 'east' ? {
  x: dims.w - inset,
  y: lane
 } : side === 'north' ? {
  x: lane,
  y: inset
 } : {
  x: lane,
  y: dims.h - inset
 };
}
export function townGates(id) {
 return LINKS.filter(e => e[0] === id || e[1] === id).map(e => {
  const first = e[0] === id,
   side = e[first ? 2 : 3],
   roadLane = e[first ? 4 : 5],
   D = dimsOf(id),
   lane = roadLane + (side === 'west' || side === 'east' ? D.oy : D.ox);
  return {
   ...pointOnSide(side, lane, 1.5, D),
   side,
   lane,
   roadLane,
   to: e[first ? 1 : 0],
   kind: 'exit',
   label: CITIES[e[first ? 1 : 0]].name
  };
 });
}
export function arrival(id, from) {
 const g = townGates(id).find(g => g.to === from);
 if (!g) throw Error('Invalid arrival connection');
 return {
  ...pointOnSide(g.side, g.lane, 3.3, dimsOf(id)),
  facing: OPPOSITE[g.side]
 };
}
export function roadLayout(from, to) {
 const a = townGates(from).find(g => g.to === to),
  b = townGates(to).find(g => g.to === from);
 if (!a || !b) throw Error('Invalid road');
 const start = {
  ...pointOnSide(OPPOSITE[a.side], a.roadLane),
  kind: 'roadBack',
  side: OPPOSITE[a.side],
  label: CITIES[from].name
 };
 const end = {
  ...pointOnSide(OPPOSITE[b.side], b.roadLane),
  kind: 'roadEnd',
  side: OPPOSITE[b.side],
  label: CITIES[to].name
 };
 return designedRoad({
  width: WIDTH,
  height: HEIGHT,
  theme: ([from, to].includes(9) && [from, to].includes(10)) ? 'seaBridge' : (from === 7 || to === 7) ? 'mountain' : ([8, 9].includes(from) || [8, 9].includes(to)) ? 'port' : (from === 2 || to === 2) ? 'industrial' : (from === 1 || to === 1) ? 'river' : (from === 10 || to === 10) ? 'night' : 'route',
  from,
  to,
  buildings: [],
  waters: [],
  paths: [
   [start, {
    x: 24,
    y: start.y
   }, {
    x: 24,
    y: end.y
   }, end]
  ],
  gates: [start, end],
  objects: [{
   x: ([from, to].includes(9) && [from, to].includes(10)) ? 24 : 22,
   y: 19,
   kind: 'wanderer',
   label: PEOPLE[(ROAD_SCENES[roadKey(from, to)] || [12])[0]][0],
   portrait: (ROAD_SCENES[roadKey(from, to)] || [12])[0],
   color: '#b98762',
   facing: 'south'
  }, {
   x: ([from, to].includes(9) && [from, to].includes(10)) ? 24 : 30,
   y: 23,
   kind: 'sign',
   label: 'Appunti di viaggio'
  }],
  spawn: {
   ...pointOnSide(start.side, a.roadLane, 3.3),
   facing: a.side
  }
 });
}

// Applica un percorso disegnato a mano, se esiste per questa strada.
function designedRoad(layout) {
 const route = ROUTES[rKey(layout.from, layout.to)];
 if (!route) {
  layout.paths = layout.paths.map(p => roundPath(p, 3));
  return layout;
 }
 // Primo e ultimo tratto sempre dritti per 4 caselle: si entra e si esce in linea con il varco.
 const lead = (g, toward) => g.side === 'west' ? { x: g.x + toward, y: g.y } : g.side === 'east' ? { x: g.x - toward, y: g.y } : g.side === 'north' ? { x: g.x, y: g.y + toward } : { x: g.x, y: g.y - toward };
 const main = route.paths[0], s0 = layout.gates[0], s1 = layout.gates[1];
 const near = g => Math.hypot(main[0].x - g.x, main[0].y - g.y) < 1 ? 'first' : 'last';
 const fixed = [...main];
 for (const g of [s0, s1]) {
  if (near(g) === 'first') fixed.splice(1, 0, lead(g, 4));
  else fixed.splice(fixed.length - 1, 0, lead(g, 4));
 }
 layout.route = { ...route, paths: [fixed, ...route.paths.slice(1)].map(p => roundPath(p, 3)) };
 layout.paths = layout.route.paths;
 const wand = layout.objects.find(o => o.kind === 'wanderer'),
  sign = layout.objects.find(o => o.kind === 'sign');
 if (wand && route.wanderer) Object.assign(wand, route.wanderer);
 if (sign && route.sign) Object.assign(sign, route.sign);
 if (route.secret) layout.objects.push({ ...route.secret, kind: 'secret', secret: route.secret });
 // Chi resta fuori dal tracciato arrotondato viene spostato sul bordo del sentiero più vicino.
 for (const o of layout.objects) {
  const ok = (x, y) => routeWalkable(layout.route, x, y);
  if ([[0, 1], [1, 0], [-1, 0], [0, -1], [0, 0]].some(([dx, dy]) => ok(o.x + dx, o.y + dy))) continue;
  let best = null;
  for (const path of layout.route.paths) for (const q of path) { const d = Math.hypot(q.x - o.x, q.y - o.y); if (!best || d < best.d) best = { d, q }; }
  if (best) { const k = Math.max(0, 1 - 1.1 / Math.max(best.d, .01)); o.x = +(o.x + (best.q.x - o.x) * k).toFixed(2); o.y = +(o.y + (best.q.y - o.y) * k).toFixed(2); }
 }
 return layout;
}
const b = (x, y, w, h, label, kind = 'lore', style = 'cottage') => ({
 x,
 y,
 w,
 h,
 label,
 kind,
 style
});
const townSpecs = [{
  theme: 'country',
  plaza: [24, 18],
  buildings: [b(7, 7, 7, 5, 'Casa', 'house'), b(30, 6, 10, 6, 'Scuola', 'school', 'school'), b(7, 22, 8, 5, 'Sala prove', 'garage', 'barn')],
  teacher: [29, 21],
  stage: [35, 26],
  landmark: 'fields'
 },
 {
  theme: 'river',
  plaza: [26, 18],
  buildings: [b(18, 6, 7, 5, 'Bottega', 'house'), b(32, 7, 9, 6, 'Il Delta', 'lore', 'club'), b(28, 24, 7, 5, 'Sala prove', 'garage')],
  teacher: [24, 16],
  stage: [35, 21],
  landmark: 'river'
 },
 {
  theme: 'industrial',
  plaza: [25, 18],
  buildings: [b(6, 7, 10, 6, 'Officine', 'lore', 'factory'), b(31, 7, 10, 6, 'Il Capannone', 'lore', 'factory'), b(29, 24, 9, 5, 'Sala prove', 'garage', 'factory')],
  teacher: [21, 19],
  stage: [35, 20],
  landmark: 'factory'
 },
 {
  theme: 'rail',
  plaza: [23, 19],
  buildings: [b(8, 4, 14, 5, 'Stazione Nord', 'lore', 'station'), b(31, 24, 8, 5, 'Sala prove', 'garage', 'barn')],
  teacher: [24, 20],
  stage: [12, 25],
  landmark: 'train'
 },
 {
  theme: 'garden',
  plaza: [24, 18],
  buildings: [b(7, 6, 8, 5, 'Casa delle rose', 'house'), b(29, 5, 12, 7, 'Teatro Aurora', 'lore', 'theatre'), b(8, 24, 8, 5, 'Sala prove', 'garage')],
  teacher: [29, 20],
  stage: [36, 24],
  landmark: 'fountain'
 },
 {
  theme: 'funk',
  plaza: [23, 18],
  buildings: [b(6, 6, 9, 6, 'Mercato', 'house', 'market'), b(32, 6, 9, 6, 'Club Elastico', 'lore', 'club'), b(7, 24, 9, 5, 'Sala prove', 'garage', 'market')],
  teacher: [20, 18],
  stage: [34, 23],
  landmark: 'market'
 },
 {
  theme: 'academy',
  plaza: [24, 19],
  buildings: [b(17, 5, 15, 7, 'Vecchia accademia', 'lore', 'academy'), b(6, 24, 8, 5, 'Casa del custode', 'house'), b(33, 24, 8, 5, 'Sala prove', 'garage')],
  teacher: [24, 20],
  stage: [36, 17],
  landmark: 'garden'
 },
 {
  theme: 'mountain',
  plaza: [24, 20],
  buildings: [b(7, 8, 9, 6, 'Fucina', 'house', 'stone'), b(29, 6, 12, 7, 'La Fortezza', 'lore', 'castle'), b(7, 25, 9, 5, 'Sala prove', 'garage', 'stone')],
  teacher: [23, 20],
  stage: [35, 23],
  landmark: 'mountain'
 },
 {
  theme: 'port',
  plaza: [24, 18],
  buildings: [b(6, 6, 8, 5, 'Mercato del porto', 'house', 'market'), b(29, 6, 10, 6, 'Casa del Sol', 'lore', 'stucco'), b(7, 23, 8, 5, 'Sala prove', 'garage', 'stucco')],
  teacher: [25, 19],
  stage: [35, 24],
  landmark: 'harbor'
 },
 {
  theme: 'island',
  plaza: [23, 18],
  buildings: [b(12, 6, 8, 5, 'Casa del vento', 'house', 'hut'), b(31, 7, 9, 5, 'Club Levante', 'lore', 'hut'), b(10, 24, 8, 4, 'Sala prove', 'garage', 'hut')],
  teacher: [23, 19],
  stage: [34, 23],
  landmark: 'palms'
 },
 {
  theme: 'night',
  plaza: [24, 18],
  buildings: [b(7, 7, 8, 6, 'Caffè Blu', 'house', 'night'), b(30, 6, 11, 7, 'Il Settimo', 'lore', 'night'), b(7, 24, 9, 5, 'Sala prove', 'garage', 'night')],
  teacher: [24, 18],
  stage: [36, 23],
  landmark: 'lamps'
 },
 {
  theme: 'festival',
  plaza: [24, 23],
  buildings: [b(7, 23, 8, 5, 'Backstage', 'lore', 'tent'), b(33, 23, 8, 5, 'Sala prove', 'garage', 'tent')],
  teacher: [24, 24],
  stage: [24, 14],
  landmark: 'festival'
 }
];
// Paesini e città: le città hanno selciato, isolati di palazzi, lampioni e passanti.
export const TOWN_SIZE = { 0: 'village', 1: 'village', 3: 'village', 6: 'village', 7: 'village', 9: 'village', 2: 'city', 4: 'city', 5: 'city', 8: 'city', 10: 'city', 11: 'festival' };
const CITY_STYLES = { 2: ['factory', 'stone'], 4: ['theatre', 'cottage'], 5: ['market', 'club'], 8: ['stucco', 'market'], 10: ['night', 'club'] };
const blockCache = new Map();

function reachableFrom(start, layoutLike, targets) {
 const LW = layoutLike.width ?? WIDTH, LH = layoutLike.height ?? HEIGHT, W = LW + 1, seen = new Uint8Array(W * (LH + 1)), q = [[Math.round(start.x), Math.round(start.y)]];
 seen[q[0][1] * W + q[0][0]] = 1;
 for (let h = 0; h < q.length; h++) {
  const [x, y] = q[h];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
   const nx = x + dx, ny = y + dy;
   if (nx < 1 || ny < 1 || nx > LW - 1 || ny > LH - 1 || seen[ny * W + nx] || !isWalkable(layoutLike, nx, ny)) continue;
   seen[ny * W + nx] = 1;
   q.push([nx, ny]);
  }
 }
 return targets.every(t => [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1], [0, 2]].some(([dx, dy]) => { const x = Math.round(t.x) + dx, y = Math.round(t.y) + dy; return x >= 0 && y >= 0 && x <= LW && y <= LH && seen[y * W + x]; }));
}

function cityBlocks(id, spec, buildings, objects, gates, waters, center, D) {
 if (blockCache.has(id)) return blockCache.get(id).map(b => ({ ...b }));
 const styles = CITY_STYLES[id] || [spec.buildings[0].style];
 const cands = [];
 // Griglia di isolati su tutta la mappa della città, filtrata dai vincoli qui sotto.
 for (let y = 2; y < D.h - 6; y += 5.5)
  for (let x = 2.5; x < D.w - 7; x += 6.5) cands.push([x, y, 5.5, 3]);
 const stage = { x: spec.stage[0] - 72 * STAGE_SCALE / TILE - 1, y: spec.stage[1] - 60 * STAGE_SCALE / TILE - 1, w: 144 * STAGE_SCALE / TILE + 2, h: 60 * STAGE_SCALE / TILE + 3 };
 const overlap = (a, r, m) => a[0] < r.x + r.w + m && a[0] + a[2] > r.x - m && a[1] < r.y + r.h + m && a[1] + a[3] > r.y - m;
 const targets = [...objects.filter(o => !o.building), ...objects.filter(o => o.building).map(o => ({ x: o.x, y: o.y + 1 })), ...gates.map(g => ({ x: g.side === 'west' ? 3 : g.side === 'east' ? WIDTH - 3 : g.x, y: g.side === 'north' ? 3 : g.side === 'south' ? HEIGHT - 3 : g.y }))];
 const accepted = [];
 let i = 0;
 for (const c of cands) {
  if (c[1] + c[3] + ROAD_HALF + 1 > D.h - 1) continue;
  const doorArea = [c[0] - .5, c[1] + c[3], c[2] + 1, 3.6];
  if ([...buildings, ...accepted, stage].some(z => overlap(doorArea, z, 0))) continue;
  // Nessun isolato davanti alla porta di un altro edificio.
  if ([...buildings, ...accepted].some(z => overlap(c, [z.x - .5, z.y + z.h, z.w + 1, 3.6].reduce((r, v, i) => (r[['x', 'y', 'w', 'h'][i]] = v, r), {}), 0))) continue;
  if (buildings.some(z => overlap(c, z, 1.6)) || accepted.some(z => overlap(c, z, .8)) || overlap(c, stage, 0)) continue;
  if (objects.some(o => !o.building && o.x > c[0] - 2.4 && o.x < c[0] + c[2] + 2.4 && o.y > c[1] - 1.6 && o.y < c[1] + c[3] + 3)) continue;
  if (waters.some(w => overlap(c, w, 0))) continue;
  if (gates.some(g => (g.side === 'north' || g.side === 'south') ? Math.abs(g.x - (c[0] + c[2] / 2)) < c[2] / 2 + 3 && ((g.side === 'north' && c[1] < 8) || (g.side === 'south' && c[1] > D.h - 10)) : Math.abs(g.y - (c[1] + c[3] / 2)) < c[3] / 2 + 3 && ((g.side === 'west' && c[0] < 8) || (g.side === 'east' && c[0] > D.w - 10)))) continue;
  const blk = b(c[0], c[1], c[2], c[3], '', 'scenery', styles[i % styles.length]);
  blk.variant = i;
  blk.city = id;
  const test = { buildings: [...buildings, ...accepted, blk], waters, gates, width: D.w, height: D.h };
  if (!reachableFrom(center, test, targets)) continue;
  accepted.push(blk);
  i++;
 }
 blockCache.set(id, accepted);
 return accepted.map(b => ({ ...b }));
}

const CITY_CHATTER = [
 '«Scusate, sapete dov’è la fermata della metro? Ah, la M verde. Grazie!»',
 '«Che caldo! In città d’estate si vive solo dopo il tramonto.»',
 '«Siete quelli della radio? Mia cugina non fa che parlare di voi.»',
 '«Stasera c’è musica in piazza? Qui c’è sempre musica, da qualche parte.»',
 '«Ho perso l’ultimo autobus. Va be’, faccio due passi.»',
 '«Il palco è aperto a tutti, ma il pubblico qui è esigente. Buona fortuna!»'
];
function passersby(id, paths, objects, area) {
 const out = [], spots = paths.flatMap(p => p.slice(1, -4)).filter((q, k) => k % 5 === 2 && isWalkable(area, Math.round(q.x), Math.round(q.y)) && isWalkable(area, q.x, q.y));
 for (let k = 0; k < spots.length && out.length < 3; k += 3) {
  const q = spots[(k * 7 + id) % spots.length];
  if ([...objects, ...out].some(o => Math.hypot(o.x - q.x, o.y - q.y) < 4.5)) continue;
  out.push({ x: +q.x.toFixed(2), y: +q.y.toFixed(2), kind: 'passerby', label: 'Passante', portrait: 'x' + (8 + (id * 3 + out.length * 2) % 8), line: CITY_CHATTER[(id + out.length * 2) % CITY_CHATTER.length], facing: 'south' });
 }
 return out;
}

export function townLayout(id) {
 const D = dimsOf(id),
  sh = ([x, y]) => [x + D.ox, y + D.oy],
  base = townSpecs[id],
  spec = { ...base, plaza: sh(base.plaza), teacher: sh(base.teacher), stage: sh(base.stage), buildings: base.buildings.map(q => ({ ...q, x: q.x + D.ox, y: q.y + D.oy })) },
  gates = townGates(id),
  center = {
   x: spec.plaza[0],
   y: spec.plaza[1]
  },
  buildings = spec.buildings.map(x => ({
   ...x
  }));
 if (id === 9) buildings.push(b(5, 6, 7, 5, '', 'scenery', 'hut'));
 if (id === 7) buildings.push(b(16, 8, 6, 6, '', 'scenery', 'stone'));
 const objects = buildings.filter(b => b.kind !== 'scenery').map(building => ({
  x: building.x + building.w / 2,
  y: building.y + building.h + .65,
  kind: building.kind,
  label: building.label,
  building
 }));
 objects.push({
  x: spec.teacher[0],
  y: spec.teacher[1],
  kind: 'npc',
  label: CITIES[id].teacher || NPC_NAMES[id],
  color: id === 7 ? '#6d6b7c' : '#bf8d69',
  facing: 'south',
  portrait: TEACHER_ART[id] ?? null
 }, {
  x: spec.stage[0],
  y: spec.stage[1] + 1.2,
  kind: 'stage',
  label: id === 0 ? 'Palco della piazza' : id === 11 ? 'Palco del festival' : id === 3 ? 'Palco del campeggio' : id === 6 ? 'Cortile dell’accademia' : 'Concerto ' + CITIES[id].genre
 });
 if (id === 0) {
  objects[objects.length - 2].label = 'Nico';
  objects[objects.length - 2].sprite = 1;
  objects.push({
   x: 30.5 + D.ox,
   y: 21 + D.oy,
   kind: 'npc',
   label: 'Vale',
   color: '#c58b72',
   facing: 'west',
   sprite: 2
  });
 }
 for (const r of RESIDENTS[id] || []) objects.push({
  x: r.x + D.ox,
  y: r.y + D.oy,
  kind: 'resident',
  label: PEOPLE[r.who][0],
  portrait: r.who,
  lines: r.lines,
  facing: 'south'
 });
 for (const [who, x, y] of RIVAL_POSTS[id] || []) objects.push({
  x: x + D.ox,
  y: y + D.oy,
  kind: 'rivalPerson',
  label: PEOPLE[who][0],
  portrait: who,
  facing: 'south'
 });
 let paths = [];
 const waters = id === 1 ? [{
  x: 8,
  y: 1,
  w: 5,
  h: 32
 }] : id === 8 ? [{
  x: 18 + D.ox,
  y: 28 + D.oy,
  w: D.w - 18 - D.ox,
  h: D.h - 28 - D.oy
 }] : id === 9 ? [{
  x: 0,
  y: 1,
  w: 5,
  h: 32
 }, {
  x: 5,
  y: 30,
  w: 43,
  h: 4
 }] : [];
 const transportKinds = [...(METRO_STOPS.includes(id) ? ['metro'] : []), ...([6, 7].includes(id) ? ['cable'] : []), ...([8, 9].includes(id) ? ['ferry'] : []), ...([9, 10].includes(id) ? ['bridge'] : [])];
 for (const kind of transportKinds) {
  const candidates = [
   [19, 25],
   [26, 23],
   [21, 15],
   [40, 20],
   [17, 20],
   [22, 28],
   [4, 20]
  ];
  const point = candidates.map(([x, y]) => [x + D.ox, y + D.oy]).find(([x, y]) => isWalkable({
   buildings,
   waters,
   gates,
   width: D.w,
   height: D.h
  }, x, y) && !buildings.some(b => x > b.x - 2.2 && x < b.x + b.w + 2.2 && y > b.y - 1 && y < b.y + b.h + 1.6) && !objects.some(o => Math.hypot(x - o.x, y - o.y) < 2.2));
  if (point) {
   const [x, y] = point;
   objects.push({
    x,
    y,
    kind,
    label: kind === 'metro' ? 'Metro · ingresso M' : kind === 'cable' ? 'Funivia di Monteferro' : kind === 'bridge' ? 'Pontile per ' + (id === 10 ? 'Isola Levante' : 'Notturnia') : 'Imbarco traghetto'
   });
  }
 }
 if (TOWN_SIZE[id] === 'city') for (const blk of cityBlocks(id, spec, buildings, objects, gates, waters, center, D)) buildings.push(blk);
 paths = townRoads({ id, dims: D, gates, objects, buildings, waters, center, stage: { x: spec.stage[0], y: spec.stage[1] }, festival: spec.theme === 'festival' });
 // Un palazzo di città senza strada che arrivi alla porta non viene costruito.
 for (let i = buildings.length - 1; i >= 0; i--) {
  const bl = buildings[i];
  if (bl.city === undefined) continue;
  if (!paths.some(pt => { const e = pt.at(-1); return Math.abs(e.x - (bl.x + bl.w / 2)) < 1 && Math.abs(e.y - (bl.y + bl.h + .5)) < 1; })) buildings.splice(i, 1);
 }
 if (TOWN_SIZE[id] === 'city') for (const pb of passersby(id, paths, objects, { buildings, waters, gates, width: D.w, height: D.h })) objects.push(pb);
 return {
  coast: id === 1 ? 'south' : undefined,
  size: TOWN_SIZE[id],
  offset: { x: D.ox, y: D.oy },
  ...spec,
  width: D.w,
  height: D.h,
  buildings,
  paths,
  gates,
  objects,
  waters,
  stage: {
   x: spec.stage[0],
   y: spec.stage[1]
  }
 };
}
// Strade del paese: ogni tratto gira attorno a case e palco e arriva davanti alla porta.
// Ricerca A* su una griglia di caselle, con un costo per ogni curva per ottenere tracciati puliti.
const ROAD_HALF = 1.45;

function roadRoute(from, to, blocked, cost, flip = false, dims = { w: WIDTH, h: HEIGHT }) {
 const W = dims.w + 1, H = dims.h + 1, key = (x, y, d) => (y * W + x) * 5 + d;
 const sx = Math.round(from.x), sy = Math.round(from.y), tx = Math.round(to.x), ty = Math.round(to.y);
 const dirs = flip ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
 const open = [[0, sx, sy, 4]], best = new Map([[key(sx, sy, 4), 0]]), parent = new Map();
 while (open.length) {
  let bi = 0;
  for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
  const [, x, y, d] = open.splice(bi, 1)[0], g = best.get(key(x, y, d));
  if (x === tx && y === ty) {
   const pts = [];
   let k = key(x, y, d);
   while (k !== undefined) {
    const c = Math.floor(k / 5);
    pts.push({ x: c % W, y: Math.floor(c / W) });
    k = parent.get(k);
   }
   return pts.reverse();
  }
  for (let nd = 0; nd < 4; nd++) {
   const nx = x + dirs[nd][0], ny = y + dirs[nd][1];
   if (nx < 1 || ny < 1 || nx > dims.w - 1 || ny > dims.h - 1) continue;
   if (blocked(nx, ny) && !(nx === tx && ny === ty)) continue;
   const ng = g + cost(nx, ny) + (d !== 4 && d !== nd ? 6 : 0), nk = key(nx, ny, nd);
   if (ng < (best.get(nk) ?? Infinity)) {
    best.set(nk, ng);
    parent.set(nk, key(x, y, d));
    open.push([ng + Math.abs(nx - tx) + Math.abs(ny - ty), nx, ny, nd]);
   }
  }
 }
 return null;
}

function simplifyRoute(pts) {
 const out = [];
 for (let i = 0; i < pts.length; i++) {
  const a = pts[i - 1], b = pts[i], c = pts[i + 1];
  if (!a || !c || (c.x - b.x) !== (b.x - a.x) || (c.y - b.y) !== (b.y - a.y)) out.push(b);
 }
 return out;
}

const roadCache = new Map();
export function townRoads(args) {
 const id = args.id;
 if (id === undefined || !roadCache.has(id)) {
  let res = computeRoads(args);
  // Se resta una girandola, si toglie il palazzo di contorno più vicino all'incrocio e si ricalcola.
  for (let tries = 0; tries < 6 && pinwheels(res.cells).length; tries++) {
   const pw = pinwheels(res.cells)[0];
   let best = -1, bd = Infinity;
   args.buildings.forEach((b, i) => {
    if (b.city === undefined) return;
    const d = Math.hypot(b.x + b.w / 2 - pw.x, b.y + b.h - pw.y);
    if (d < bd) { bd = d; best = i; }
   });
   if (best < 0) break;
   args.buildings.splice(best, 1);
   res = computeRoads(args);
  }
  if (id === undefined) return res.roads;
  roadCache.set(id, res);
 }
 return roadCache.get(id).roads.map(r => r.map(p => ({ ...p })));
}
// Per i test: celle delle strade della città e incroci a girandola trovati.
export function roadReport(id) {
 townLayout(id);
 const res = roadCache.get(id);
 return { seed: res.seed, pinwheels: pinwheels(res.cells), cells: res.cells.size };
}

// Rileva incroci «a girandola»: tre o più bracci che, appena lasciato l'incrocio, girano tutti
// nello stesso senso. Sono forme da evitare: ricordano simboli che non vogliamo nel gioco.
export function pinwheels(cells, reach = 14) {
 const has = (x, y) => cells.has(x + ',' + y), dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
 const deg = (x, y) => dirs.filter(([dx, dy]) => has(x + dx, y + dy)).length;
 const found = [];
 for (const k of cells) {
  const [x, y] = k.split(',').map(Number);
  if (deg(x, y) < 3) continue;
  const turns = [];
  for (const [dx, dy] of dirs) {
   if (!has(x + dx, y + dy)) continue;
   let px = x + dx, py = y + dy, n = 1, sign = 0;
   while (n < reach) {
    const d = deg(px, py);
    if (d >= 3 || d <= 1) break;
    if (has(px + dx, py + dy)) { px += dx; py += dy; n++; continue; }
    const e = dirs.find(([ex, ey]) => (ex !== -dx || ey !== -dy) && has(px + ex, py + ey));
    if (e) sign = Math.sign(dx * e[1] - dy * e[0]);
    break;
   }
   turns.push(sign);
  }
  const cw = turns.filter(t => t > 0).length, ccw = turns.filter(t => t < 0).length;
  if (turns.length >= 3 && ((cw >= 3 && ccw === 0) || (ccw >= 3 && cw === 0))) found.push({ x, y, turns });
 }
 return found;
}

function computeRoads(args) {
 // Si provano più varianti (ordine dei collegamenti e preferenze di svolta) e si tiene la prima senza girandole.
 let fallback = null;
 for (let seed = 0; seed < 24; seed++) {
  const res = computeRoadsVariant(args, seed);
  if (!res) continue;
  if (!pinwheels(res.cells).length) return { ...res, seed };
  fallback = fallback || { ...res, seed };
 }
 return fallback || { roads: [], cells: new Set(), seed: -1 };
}

function computeRoadsVariant({ gates, objects, buildings, waters, center, stage, festival, dims = { w: WIDTH, h: HEIGHT } }, seed) {
 const sScale = festival ? FESTIVAL_STAGE_SCALE : STAGE_SCALE;
 const stageRect = { x: stage.x - 72 * sScale / TILE, y: stage.y - 60 * sScale / TILE, w: 144 * sScale / TILE, h: 60 * sScale / TILE + .25 };
 const rects = [...buildings, stageRect];
 const wet = (x, y) => waters.some(w => x > w.x - .6 && x < w.x + w.w + .6 && y > w.y - .6 && y < w.y + w.h + .6);
 const onBridge = (x, y) => gates.some(g => (g.side === 'east' || g.side === 'west') && Math.abs(y - g.y) < .6);
 const blockedBy = m => (x, y) => (wet(x, y) && !onBridge(x, y)) || rects.some(r => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m - .2);
 const hub = { x: Math.round(center.x), y: Math.round(center.y) };
 const cells = new Set([hub.x + ',' + hub.y]);
 // Le strade nuove si innestano su quelle esistenti: percorrerle costa poco.
 const cost = (x, y) => cells.has(x + ',' + y) ? .25 : 1;
 const roads = [];
 const targets = [];
 for (const g of gates) {
  const inset = g.side === 'west' ? { x: 2, y: g.y } : g.side === 'east' ? { x: dims.w - 2, y: g.y } : g.side === 'north' ? { x: g.x, y: 2 } : { x: g.x, y: dims.h - 2 };
  targets.push({ exact: { x: g.x, y: g.y }, approach: inset, gate: true });
 }
 // Anche case e palazzi di contorno hanno una porta: ognuno ha la sua strada.
 for (const b of buildings) if (b.kind === 'scenery') targets.push({ exact: { x: b.x + b.w / 2, y: b.y + b.h + .5 }, approach: { x: Math.round(b.x + b.w / 2), y: Math.ceil(b.y + b.h + ROAD_HALF) }, optional: true });
 for (const o of objects) {
  if (o.building) targets.push({ exact: { x: o.x, y: o.y + .9 }, approach: { x: Math.round(o.x), y: Math.ceil(o.building.y + o.building.h + ROAD_HALF) } });
  else if (o.kind === 'stage') targets.push({ exact: { x: o.x, y: o.y + .9 }, approach: { x: Math.round(o.x), y: Math.ceil(stage.y + .25 + ROAD_HALF) } });
  else if (['metro', 'cable', 'ferry', 'bridge'].includes(o.kind)) targets.push({ exact: { x: o.x, y: o.y + .6 }, approach: { x: Math.round(o.x), y: Math.round(o.y + 1) } });
 }
 // Varianti: prima i varchi (la strada principale), poi il resto; l'ordine ruota con il seme.
 const gatesFirst = targets.filter(t => t.gate), rest = targets.filter(t => !t.gate);
 const rot = (arr, k) => arr.length ? arr.map((_, i) => arr[(i + k) % arr.length]) : arr;
 const order = [...rot(gatesFirst, seed % Math.max(1, gatesFirst.length)), ...rot(rest, Math.floor(seed / 4) % Math.max(1, rest.length))];
 const flip = seed % 2 === 1;
 for (const t of order) {
  let r = null;
  for (const m of [ROAD_HALF, .9, .45]) {
   const ap = { x: t.approach.x, y: m === ROAD_HALF || t.gate ? t.approach.y : Math.min(t.approach.y, Math.ceil(t.approach.y - ROAD_HALF + m)) };
   r = roadRoute(ap, hub, blockedBy(m), cost, flip, dims);
   if (r) break;
  }
  if (!r && t.optional) continue;
  if (!r) return null;
  // Si tiene solo il tratto nuovo: dalla destinazione fino al primo punto di strada già esistente.
  const cut = r.findIndex(c => cells.has(c.x + ',' + c.y));
  const fresh = r.slice(0, cut < 0 ? r.length : cut + 1);
  for (const c of fresh) cells.add(c.x + ',' + c.y);
  const pts = simplifyRoute(fresh.reverse());
  if (cut < 0 || (pts[0].x === hub.x && pts[0].y === hub.y)) pts[0] = { x: center.x, y: center.y };
  pts.push(t.exact);
  roads.push(roundPath(pts, 2.2));
 }
 return { roads, cells };
}

export function isWalkable(layout, x, y) {
 if (layout.theme === 'seaBridge' && Math.abs(x - 24) > 1.6) return false;
 if (x < 1 || x > (layout.width ?? WIDTH) - 1 || y < 1 || y > (layout.height ?? HEIGHT) - 1) return false;
 if (layout.route && !routeWalkable(layout.route, x, y)) return false;
 const sb = stageBox(layout);
 if (sb && x > sb.x0 && x < sb.x1 && y > sb.y0 && y < sb.y1) return false;
 for (const b of layout.buildings)
  if (x > b.x - .3 && x < b.x + b.w + .3 && y > b.y - .2 && y < b.y + b.h + .15) return false;
 for (const w of layout.waters)
  if (x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h) {
   if (layout.gates.some(g => Math.abs(y - g.y) < 1.8 && (g.side === 'east' || g.side === 'west'))) continue;
   return false;
  } return true;
}
export function gateAt(layout, x, y) {
 return layout.gates.find(g => Math.hypot(g.x - x, g.y - y) < .85) || null;
}
export function facingFor(dx, dy, fallback = 'south') {
 return Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'east' : 'west' : dy ? dy > 0 ? 'south' : 'north' : fallback;
}
export function cameraFor(x, y, w = 960, h = 600, layout = {
 width: WIDTH,
 height: HEIGHT
}) {
 const axis = (position, size, view) => size <= view ? (size - view) / 2 : Math.max(0, Math.min(size - view, position * TILE - view / 2));
 return {
  x: axis(x, layout.width * TILE, w),
  y: axis(y, layout.height * TILE, h)
 };
}
const THEMES = {
 country: {
  grass: '#9cb67e',
  path: '#e1cba0',
  roof: '#bb7458',
  wall: '#f0dfb4',
  leaf: '#6f9666'
 },
 river: {
  grass: '#91b3a0',
  path: '#d7cfb3',
  roof: '#718b96',
  wall: '#e1d9bb',
  leaf: '#5d8e78'
 },
 industrial: {
  grass: '#9b9b85',
  path: '#aaa99b',
  roof: '#765d54',
  wall: '#bb8c70',
  leaf: '#72866c'
 },
 rail: {
  grass: '#abb58c',
  path: '#dfcda6',
  roof: '#8a7161',
  wall: '#e9d9b5',
  leaf: '#789464'
 },
 garden: {
  grass: '#b1c58b',
  path: '#e6d7bb',
  roof: '#cf978d',
  wall: '#f7e8d0',
  leaf: '#7ca274'
 },
 funk: {
  grass: '#b3bd82',
  path: '#cdaf87',
  roof: '#8a826a',
  wall: '#e5b677',
  leaf: '#7b9663'
 },
 academy: {
  grass: '#a7b496',
  path: '#d2c7b3',
  roof: '#97868d',
  wall: '#e4ddc8',
  leaf: '#729171'
 },
 mountain: {
  grass: '#9ba699',
  path: '#b7b4a4',
  roof: '#6b7180',
  wall: '#b5b6ae',
  leaf: '#66867d'
 },
 port: {
  grass: '#c5c396',
  path: '#edd2a3',
  roof: '#ca8062',
  wall: '#f1deb0',
  leaf: '#7f9a74'
 },
 island: {
  grass: '#b5cd8f',
  path: '#eed9a8',
  roof: '#b89d68',
  wall: '#e9d8a2',
  leaf: '#74a16d'
 },
 night: {
  grass: '#425963',
  path: '#64777b',
  roof: '#53627c',
  wall: '#8e9b9f',
  leaf: '#476d6b'
 },
 festival: {
  grass: '#afba83',
  path: '#e2cba0',
  roof: '#a88d64',
  wall: '#eee1b8',
  leaf: '#789668'
 },
 route: {
  grass: '#a6bc86',
  path: '#e2cda4',
  roof: '#b58466',
  wall: '#f1dfb4',
  leaf: '#70956b'
 }
};

function shape(ctx, fill, draw, stroke = null) {
 ctx.beginPath();
 draw();
 ctx.fillStyle = fill;
 ctx.fill();
 if (stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
 }
}

function oval(ctx, x, y, rx, ry, color) {
 shape(ctx, color, () => ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2));
}

function rounded(ctx, x, y, w, h, r, color) {
 shape(ctx, color, () => ctx.roundRect(x, y, w, h, r));
}

function line(ctx, pts, color, width) {
 ctx.beginPath();
 pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
 ctx.strokeStyle = color;
 ctx.lineWidth = width;
 ctx.lineCap = 'round';
 ctx.lineJoin = 'round';
 ctx.stroke();
}

function label(ctx, s, x, y, size = 11, color = '#445b45') {
 ctx.font = `600 ${size}px Fredoka, Nunito, sans-serif`;
 ctx.textAlign = 'center';
 ctx.fillStyle = color;
 ctx.fillText(s, x, y);
}
// Aspetto del protagonista scelto a inizio partita.
let heroLook = 'boy';
export function setHeroLook(look) {
 heroLook = look === 'girl' ? 'girl' : 'boy';
}
export function heroLookAvailable(look) {
 return look !== 'girl' || hasAtlas('heroGirlWalk');
}
export function drawCharacter(ctx, x, y, {
 color = '#c77c50',
 variant = 0,
 portrait = null,
 facing = 'south',
 moving = false,
 walk = 0,
 bike = false
} = {}) {
 const dirCol = { south: 0, west: 1, east: 2, north: 3 } [facing] ?? 0;
 if (portrait !== null && typeof portrait === 'string' && portrait.startsWith('x') && drawSprite(ctx, 'people2', Math.floor(+portrait.slice(1) / 4), +portrait.slice(1) % 4, x, y, 43, 64)) return;
 if (portrait !== null && typeof portrait === 'number' && drawSprite(ctx, 'peopleDir' + Math.floor(portrait / 4), portrait % 4, dirCol, x, y, 43, 64)) return;
 if (portrait !== null && typeof portrait === 'number' && drawSprite(ctx, 'people', Math.floor(portrait / 4), portrait % 4, x, y, 43, 64)) return;
 const cell = spriteCell(facing, moving, walk), girl = heroLook === 'girl' && !variant;
 if (bike && drawSprite(ctx, girl ? 'heroGirlBike' : 'heroBike', dirCol, moving ? 1 + (Math.floor(walk * 8) % 2) : 0, x, y + 6, 78, 78)) return;
 // Camminata a quattro fotogrammi (terza serie di sprite), se presente.
 if (!bike && !variant && drawSprite(ctx, girl ? 'heroGirlWalk' : 'heroWalk', dirCol, moving ? Math.floor(walk * 8) % 4 : 0, x, y, 64, 64)) return;
 if (!bike && drawSprite(ctx, variant ? 'band' : 'hero', variant ? Math.min(2, variant - 1) : cell.row, cell.col, x, y, 64, 64, !variant && cell.flip)) return;
 ctx.save();
 ctx.translate(x, y);
 const step = moving ? Math.sin(walk * 11) * 3 : 0,
  side = facing === 'east' || facing === 'west',
  back = facing === 'north',
  dir = facing === 'west' ? -1 : 1;
 oval(ctx, 0, 2, 13, 5, '#1b3b3430');
 if (bike) {
  if (side) {
   for (const xx of [-12, 12]) {
    shape(ctx, '#bbc6a5', () => ctx.ellipse(xx, 3, 9, 9, 0, 0, 7), '#4b665b');
   }
   line(ctx, [{
    x: -12,
    y: 3
   }, {
    x: 0,
    y: -5
   }, {
    x: 12,
    y: 3
   }, {
    x: -5,
    y: 3
   }, {
    x: 0,
    y: -5
   }], '#be7350', 2.5);
  } else {
   oval(ctx, 0, 10, 4, 10, '#415b54');
   oval(ctx, 0, -10, 4, 9, '#415b54');
   line(ctx, [{
    x: 0,
    y: 8
   }, {
    x: 0,
    y: -12
   }], '#be7350', 3);
   line(ctx, [{
    x: -12,
    y: -8
   }, {
    x: 12,
    y: -8
   }], '#536f5d', 3);
  }
 }
 if (side) {
  rounded(ctx, -5, -8, 7, 13 + step, 3, '#4f6670');
  rounded(ctx, 1, -8, 7, 13 - step, 3, '#394f5a');
 } else {
  rounded(ctx, -8, -8, 6, 13 + step, 3, '#455967');
  rounded(ctx, 2, -8, 6, 13 - step, 3, '#455967');
 }
 rounded(ctx, -9, -27, 18, 23, 6, color);
 rounded(ctx, -12, -23, 5, 14 + (side ? step : 0), 3, '#ddb28b');
 rounded(ctx, 7, -23, 5, 14 - (side ? step : 0), 3, '#ddb28b');
 oval(ctx, side ? dir * 2 : 0, -35, 10, 12, '#e8bc91');
 shape(ctx, variant === 1 ? '#876955' : '#4e493e', () => {
  ctx.ellipse(0, -40, 11, 8, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(10, -34);
  ctx.quadraticCurveTo(4, -39, -10, -33);
  ctx.closePath();
 });
 if (back) oval(ctx, 0, -36, 9, 10, variant === 1 ? '#876955' : '#4e493e');
 else if (side) {
  oval(ctx, dir * 8, -34, 1.4, 1.7, '#344b42');
  oval(ctx, dir * 10, -31, 3, 3, '#e8bc91');
 } else {
  oval(ctx, -4, -35, 1.1, 1.5, '#344b42');
  oval(ctx, 4, -35, 1.1, 1.5, '#344b42');
  line(ctx, [{
   x: -2,
   y: -29
  }, {
   x: 2,
   y: -29
  }], '#b78166', 1);
 }
 if (variant === 0) {
  oval(ctx, 0, -44, 12, 4, '#b96248');
  rounded(ctx, side ? dir * 3 - 6 : -11, -44, side ? 14 : 23, 4, 2, '#ba6b50');
  if (back || facing === 'west') rounded(ctx, -9, -25, 16, 17, 5, '#627c68');
  else line(ctx, [{
   x: -6,
   y: -25
  }, {
   x: 5,
   y: -9
  }], '#eee1b9', 3);
 }
 ctx.restore();
}

function drawTree(ctx, x, y, p, seed = 0, palm = false) {
 if (drawSprite(ctx, 'hero', 3, palm ? 1 : 0, x, y, palm ? 100 : 106, palm ? 124 : 112)) return;
 ctx.save();
 ctx.translate(x, y);
 oval(ctx, 8, 6, 26, 9, '#28462e18');
 if (palm) {
  line(ctx, [{
   x: 0,
   y: 4
  }, {
   x: 4,
   y: -30
  }, {
   x: 11,
   y: -65
  }], '#ab8e60', 8);
  for (let i = 0; i < 7; i++) {
   const a = i * Math.PI / 3.5;
   shape(ctx, p.leaf, () => {
    ctx.moveTo(11, -65);
    ctx.quadraticCurveTo(11 + Math.cos(a) * 32, -65 + Math.sin(a) * 22, 11 + Math.cos(a) * 48, -57 + Math.sin(a) * 34);
    ctx.quadraticCurveTo(11 + Math.cos(a) * 20, -70 + Math.sin(a) * 12, 11, -65);
   });
  }
 } else {
  rounded(ctx, -5, -30, 10, 36, 4, '#9a805b');
  oval(ctx, 0, -40, 30, 28, p.leaf);
  oval(ctx, -20, -34, 18, 20, p.leaf);
  oval(ctx, 18, -32, 20, 20, p.leaf);
  oval(ctx, -8, -53, 20, 18, p.leaf);
  oval(ctx, -13, -46, 16, 12, '#c0d19a22');
  oval(ctx, 12, -28, 19, 13, '#2e594b12');
 }
 ctx.restore();
}
const BUILDING_SPRITES = {
 school: [0, 0],
 factory: [0, 1],
 station: [0, 2],
 theatre: [0, 3],
 market: [1, 0],
 academy: [1, 1],
 stone: [1, 2],
 castle: [1, 3],
 stucco: [2, 0],
 hut: [2, 1],
 club: [2, 2],
 night: [2, 2],
 tent: [2, 3]
};

const CITY_CELLS = { 2: [[0, 0], [0, 1], [0, 2]], 4: [[0, 3], [1, 0], [1, 1]], 5: [[1, 2], [1, 3], [2, 0]], 8: [[2, 1], [2, 2], [2, 3]], 10: [[3, 0], [3, 1], [3, 2]] };
function buildingArt(ctx, b, p) {
 if (b.kind === 'scenery' && b.city !== undefined) {
  const cells = CITY_CELLS[b.city], c = cells && cells[(b.variant || 0) % cells.length];
  if (c && drawSprite(ctx, 'buildings2', c[0], c[1], (b.x + b.w / 2) * TILE, (b.y + b.h) * TILE, b.w * TILE + 26, (b.h + 3) * TILE)) return;
 }
 const cell = BUILDING_SPRITES[b.style];
 if (cell && drawSprite(ctx, 'towns', cell[0], cell[1], (b.x + b.w / 2) * TILE, (b.y + b.h) * TILE, b.w * TILE + 26, (b.w * TILE + 26) * .92)) {
  return;
 }
 if ((b.style === 'cottage' || b.style === 'barn' || b.kind === 'garage') && drawSprite(ctx, 'hero', 3, b.kind === 'garage' || b.style === 'barn' ? 3 : 2, (b.x + b.w / 2) * TILE, (b.y + b.h) * TILE, b.w * TILE + 26, (b.w * TILE + 26) * .9)) {
  return;
 }
 const x = b.x * TILE,
  y = b.y * TILE,
  w = b.w * TILE,
  h = b.h * TILE,
  factory = b.style === 'factory',
  night = b.style === 'night';
 rounded(ctx, x + 7, y + 12, w, h, 6, '#28473c23');
 rounded(ctx, x, y, w, h, 7, p.wall);
 rounded(ctx, x + 4, y + 28, w - 8, h - 28, 3, p.wall);
 rounded(ctx, x - 6, y - 6, w + 12, 43, 7, p.roof);
 shape(ctx, p.roof, () => {
  ctx.moveTo(x - 7, y);
  ctx.quadraticCurveTo(x + w / 2, y - 55, x + w + 7, y);
  ctx.closePath();
 });
 line(ctx, [{
  x: x - 4,
  y: 30 + y
 }, {
  x: x + w + 4,
  y: y + 30
 }], '#fff3c32e', 3);
 for (let i = 0; i < 4; i++) line(ctx, [{
  x: x + 7,
  y: y + i * 8
 }, {
  x: x + w - 7,
  y: y + i * 8
 }], '#2f46381a', 1);
 if (factory) {
  rounded(ctx, x + w - 33, y - 53, 19, 58, 2, '#806c60');
  rounded(ctx, x + w - 37, y - 54, 27, 7, 2, '#6f6055');
  for (let k = 0; k < 3; k++) oval(ctx, x + w - 25 + k * 7, y - 67 - k * 14, 12 + k * 4, 7 + k * 2, '#d5d2c166');
 }
 if (b.style === 'castle') {
  for (const tx of [x - 8, x + w - 18]) {
   rounded(ctx, tx, y - 12, 29, 59, 3, p.roof);
   for (let i = 0; i < 3; i++) rounded(ctx, tx + i * 10, y - 20, 7, 16, 1, p.roof);
  }
 }
 if (b.style === 'hut')
  for (let i = 0; i < Math.floor(w / 10); i++) line(ctx, [{
   x: x + i * 10,
   y: y - 4
  }, {
   x: x + i * 10 - 3,
   y: y + 34
  }], '#e0cf9a55', 2);
 const door = x + w / 2;
 rounded(ctx, door - 13, y + h - 36, 26, 36, 10, '#4e7162');
 rounded(ctx, door - 9, y + h - 30, 18, 29, 7, night ? '#f1c987' : '#3c5d52');
 oval(ctx, door + 7, y + h - 14, 1.5, 1.5, '#edc57b');
 rounded(ctx, door - 19, y + h - 1, 38, 6, 3, '#cbb995');
 for (const wx of [x + 19, x + w - 43]) {
  rounded(ctx, wx, y + 57, 25, 27, 5, '#829e9d');
  rounded(ctx, wx + 3, y + 60, 19, 21, 3, night ? '#eac889' : '#c3d8ce');
  line(ctx, [{
   x: wx + 12,
   y: y + 59
  }, {
   x: wx + 12,
   y: y + 82
  }], '#efe0bd', 2);
  line(ctx, [{
   x: wx + 2,
   y: y + 71
  }, {
   x: wx + 22,
   y: y + 71
  }], '#efe0bd', 2);
  rounded(ctx, wx - 3, y + 83, 31, 5, 2, p.roof);
 }
 if (['club', 'night', 'theatre', 'school', 'academy', 'station'].includes(b.style)) {
  rounded(ctx, door - 50, y + 34, 100, 19, 4, night ? '#b78c71' : '#f2e4bc');
  label(ctx, b.label.toUpperCase(), door, y + 47, 9, night ? '#fff0bb' : '#6c6e56');
 }
 if (b.style === 'market') {
  for (let i = 0; i < w / 20; i++) rounded(ctx, x + i * 20, y + 34, 20, 17, 4, i % 2 ? '#dfac6d' : '#ece0b7');
 }
 if (b.style === 'barn') {
  line(ctx, [{
   x: door - 10,
   y: y + h - 30
  }, {
   x: door + 10,
   y: y + h - 3
  }], '#bdc49c', 2);
  line(ctx, [{
   x: door + 10,
   y: y + h - 30
  }, {
   x: door - 10,
   y: y + h - 3
  }], '#bdc49c', 2);
 }
}
export const STAGE_SCALE = 1.6, FESTIVAL_STAGE_SCALE = 2.5;
export function stageBox(layout) {
 if (!layout.stage) return null;
 const s = layout.theme === 'festival' ? FESTIVAL_STAGE_SCALE : STAGE_SCALE;
 return { x0: layout.stage.x - 72 * s / TILE, x1: layout.stage.x + 72 * s / TILE, y0: layout.stage.y - 60 * s / TILE, y1: layout.stage.y + .25 };
}
export function drawStage(ctx, x, y, genre, large = false, scale = null) {
 const s = scale ?? (large ? FESTIVAL_STAGE_SCALE : 1);
 if (drawSprite(ctx, 'transport', 1, large ? 1 : 0, x, y + 6 * s, 160 * s, 120 * s)) {
  return;
 }
 ctx.save();
 ctx.translate(x, y);
 ctx.scale(s, s);
 rounded(ctx, -72, -64, 144, 69, 5, '#786d58');
 for (let i = 0; i < 7; i++) line(ctx, [{
  x: -70,
  y: -15 + i * 4
 }, {
  x: 70,
  y: -15 + i * 4
 }], '#a38d68', 1);
 rounded(ctx, -76, -69, 152, 13, 4, '#ddbe7e');
 rounded(ctx, -70, -58, 140, 34, 3, '#385b50');
 for (const xx of [-58, 58]) {
  rounded(ctx, xx - 10, -26, 20, 31, 3, '#3e4f49');
  oval(ctx, xx, -11, 6, 6, '#6b7a68');
  line(ctx, [{
   x: xx,
   y: -63
  }, {
   x: xx,
   y: -76
  }], '#9c8e65', 2);
  oval(ctx, xx, -76, 5, 5, '#f2d28c');
 }
 oval(ctx, 0, -8, 12, 12, '#c79762');
 oval(ctx, 0, -8, 8, 8, '#ece0b1');
 line(ctx, [{
  x: -19,
  y: -25
 }, {
  x: -19,
  y: 0
 }], '#6a715b', 2);
 oval(ctx, -19, -25, 10, 3, '#e0c17e');
 drawSprite(ctx, 'band', 3, 3, -57, -1, 26, 30);
 drawSprite(ctx, 'band', 3, 3, 57, -1, 26, 30);
 drawSprite(ctx, 'band', 3, 2, 0, 0, 61, 51);
 ctx.restore();
}

// Oltre i bordi della mappa: bosco fitto (o mare), così la telecamera centrata non mostra mai il vuoto.
// Acque che toccano un bordo continuano oltre la mappa; a sud di Rivafosca il fiume sfocia nel mare.
export function outerWaters(layout) {
 const out = [];
 const list = [...layout.waters];
 if (layout.from !== undefined && layout.theme === 'river') list.push({ x: 7.6, y: -1, w: 5.8, h: HEIGHT + 2 });
 for (const w of list) {
  const e = { ...w };
  if (w.y <= 1.5) { e.y -= 30; e.h += 30; }
  if (w.y + w.h >= HEIGHT - 1.5) e.h += 30;
  if (w.x <= 1.5) { e.x -= 30; e.w += 30; }
  if (w.x + w.w >= WIDTH - 1.5) e.w += 30;
  out.push(e);
 }
 return out;
}

function seaBeyond(ctx, layout, time) {
 if (layout.coast !== 'south') return;
 const top = HEIGHT + 3;
 rounded(ctx, -60 * TILE, (top - 1.4) * TILE, (WIDTH + 120) * TILE, 3 * TILE, 0, '#e8d6a6');
 rounded(ctx, -60 * TILE, top * TILE, (WIDTH + 120) * TILE, 40 * TILE, 0, '#6fa9ad');
 for (let i = 0; i < 90; i++) {
  const x = -40 * TILE + (i * 173) % ((WIDTH + 80) * TILE), y = (top + .8 + (i * 37) % 14) * TILE;
  line(ctx, [{ x: x + Math.sin(time / 1500 + i) * 4, y }, { x: x + 22 + Math.sin(time / 1500 + i) * 4, y }], '#d7eeea88', 2);
 }
}

function inOuterWater(layout, x, y) {
 if (layout.coast === 'south' && y > HEIGHT + 1.4) return true;
 return outerWaters(layout).some(w => x > w.x - 1 && x < w.x + w.w + 1 && y > w.y - 1 && y < w.y + w.h + 1);
}

function borderTrees(ctx, layout, p, cam, W, H) {
 const x0 = Math.floor(cam.x / TILE) - 2, x1 = Math.ceil((cam.x + W) / TILE) + 2,
  y0 = Math.floor(cam.y / TILE) - 2, y1 = Math.ceil((cam.y + H) / TILE) + 4;
 const gap = (x, y) => layout.gates.some(g => (g.side === 'east' || g.side === 'west') ? Math.abs(y - g.y) < 2.4 && ((g.side === 'west' && x < 1) || (g.side === 'east' && x > layout.width - 1)) : Math.abs(x - g.x) < 2.4 && ((g.side === 'north' && y < 1) || (g.side === 'south' && y > layout.height - 1)));
 for (let y = y0 - (y0 % 2); y <= y1; y += 2)
  for (let x = x0 - (x0 % 2); x <= x1; x += 2) {
   const ox = x + (y % 4 ? 1 : 0), oy = y + .6;
   if (ox > -1 && ox < layout.width + 1 && oy > -.5 && oy < layout.height + 1.5) continue;
   if (gap(ox, oy) || inOuterWater(layout, ox, oy)) continue;
   drawTree(ctx, ox * TILE, oy * TILE, p, Math.abs(ox * 7 + oy * 13), layout.theme === 'island');
  }
 for (const g of layout.gates) {
  const horiz = g.side === 'east' || g.side === 'west';
  if (horiz) rounded(ctx, (g.side === 'west' ? g.x - 12 : g.x) * TILE, (g.y - .9) * TILE, 12 * TILE, 1.8 * TILE, 8, p.path);
  else rounded(ctx, (g.x - .9) * TILE, (g.side === 'north' ? g.y - 12 : g.y) * TILE, 1.8 * TILE, 12 * TILE, 8, p.path);
 }
}

export function bubble(ctx, x, y, time = 0) {
 const bob = Math.sin(time / 220) * 2;
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

// Sentieri: sassi, ceppi, more e staccionate appena fuori dal percorso; panchine nelle radure.
function trailDecor(ctx, layout, actors) {
 if (!hasAtlas('trail')) return;
 const R = layout.route, placed = [];
 const free = (x, y) => !placed.some(q => Math.hypot(q.x - x, q.y - y) < 2.4) && !layout.objects.some(o => Math.hypot(o.x - x, o.y - y) < 2.2) && !layout.gates.some(g => Math.hypot(g.x - x, g.y - y) < 4) && !(R.grass || []).some(g => inRect(g, x, y, .8));
 let k = 0;
 for (const path of R.paths)
  for (let i = 1; i < path.length; i++) {
   const a = path[i - 1], b = path[i], len = Math.hypot(b.x - a.x, b.y - a.y);
   for (let d = 1.5; d < len; d += 3.2) {
    k++;
    if (rnd(k + layout.from * 31 + layout.to * 7) > .38) continue;
    const t = d / len, side = rnd(k * 3.1) > .5 ? 1 : -1, off = 2.05 + rnd(k * 1.7) * .3;
    const x = a.x + (b.x - a.x) * t + (b.y - a.y) / len * off * side, y = a.y + (b.y - a.y) * t - (b.x - a.x) / len * off * side;
    if (!free(x, y) || pathDistance(R, x, y) < 1.9 || x < 1 || y < 1 || x > layout.width - 1 || y > layout.height - 1) continue;
    placed.push({ x, y });
    const pick = [[0, 2, 48, 40], [0, 3, 46, 36], [1, 1, 46, 38], [1, 0, 52, 36]][Math.floor(rnd(k * 5.3) * 4)];
    actors.push({ depth: y * TILE, draw: () => drawSprite(ctx, 'trail', pick[0], pick[1], x * TILE, y * TILE + 6, pick[2], pick[3]) });
   }
  }
 for (const c of R.clearings) {
  const x = c.x + c.w / 2, y = c.y + .9;
  if (!free(x, y)) continue;
  placed.push({ x, y });
  actors.push({ depth: y * TILE, draw: () => drawSprite(ctx, 'trail', 1, 2, x * TILE, y * TILE + 6, 56, 38) });
 }
}

// Città: arredo urbano sul bordo delle strade, a distanza da porte, persone e lampioni.
function cityDecor(ctx, layout, actors) {
 if (!hasAtlas('cityProps')) return;
 const cells = [[0, 1, 54, 36], [1, 0, 50, 34], [0, 3, 22, 46], [1, 3, 56, 40], [0, 2, 30, 44], [1, 1, 48, 54], [1, 2, 54, 48]];
 const placed = [];
 let k = 0;
 for (const path of layout.paths)
  for (let i = 1; i < path.length; i++) {
   const a = path[i - 1], b = path[i], len = Math.hypot(b.x - a.x, b.y - a.y);
   if (len < 1.5) continue;
   for (let d = 2; d < len; d += 4.5) {
    k++;
    if (rnd(k + layout.width * 3) > .45) continue;
    const t = d / len, side = rnd(k * 2.3) > .5 ? 1 : -1;
    const x = a.x + (b.x - a.x) * t + (b.y - a.y) / len * 2 * side, y = a.y + (b.y - a.y) * t - (b.x - a.x) / len * 2 * side;
    if (placed.some(q => Math.hypot(q.x - x, q.y - y) < 4)) continue;
    if (layout.buildings.some(z => x > z.x - 1 && x < z.x + z.w + 1 && y > z.y - .8 && y < z.y + z.h + 2.6)) continue;
    if (layout.objects.some(o => !o.building && Math.hypot(o.x - x, o.y - y) < 2.4)) continue;
    if (layout.paths.some(pp => pp.some((q, j) => j && segDist(x, y, pp[j - 1], q) < 1.5))) continue;
    if (layout.waters.some(w => x > w.x - 1 && x < w.x + w.w + 1 && y > w.y - 1 && y < w.y + w.h + 1)) continue;
    const sb = stageBox(layout);
    if (sb && x > sb.x0 - 1 && x < sb.x1 + 1 && y > sb.y0 - 1 && y < sb.y1 + 2) continue;
    placed.push({ x, y });
    const c = cells[Math.floor(rnd(k * 7.7) * cells.length)];
    actors.push({ depth: y * TILE, draw: () => drawSprite(ctx, 'cityProps', c[0], c[1], x * TILE, y * TILE + 6, c[2], c[3]) });
   }
  }
}

function tallGrass(ctx, x, y, time, seed) {
 const sway = Math.sin(time / 600 + seed) * 1.5;
 ctx.strokeStyle = '#3f7a3c';
 ctx.lineWidth = 2;
 ctx.beginPath();
 for (const dx of [-5, 0, 5]) {
  ctx.moveTo(x + dx, y + 4);
  ctx.quadraticCurveTo(x + dx + sway, y - 4, x + dx + sway * 2 + (dx / 3), y - 10);
 }
 ctx.stroke();
 ctx.strokeStyle = '#6aa65a';
 ctx.lineWidth = 1.2;
 ctx.beginPath();
 ctx.moveTo(x - 2, y + 4);
 ctx.quadraticCurveTo(x - 2 + sway, y - 3, x + sway, y - 8);
 ctx.stroke();
}

function sparkle(ctx, x, y, time) {
 const a = .5 + Math.sin(time / 250) * .5;
 ctx.fillStyle = `rgba(255,248,214,${.35 + a * .6})`;
 ctx.beginPath();
 for (let i = 0; i < 8; i++) {
  const r = i % 2 ? 2.5 : 8 + a * 3, ang = i * Math.PI / 4;
  ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
 }
 ctx.closePath();
 ctx.fill();
}

function shade(hex, k) {
 const n = parseInt(hex.slice(1, 7), 16), f = c => Math.max(0, Math.min(255, Math.round(c * (1 + k))));
 return '#' + [n >> 16, n >> 8 & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}

// Città: selciato a lastre su tutta l’area, con aiuole squadrate.
function paving(ctx, layout, p) {
 const LW = layout.width, LH = layout.height;
 const dark = layout.theme === 'night', base = shade(p.path, dark ? -.32 : -.12), joint = shade(p.path, dark ? -.45 : -.24);
 ctx.fillStyle = base;
 ctx.fillRect(0, 0, LW * TILE, LH * TILE);
 ctx.strokeStyle = joint + '66';
 ctx.lineWidth = 1;
 ctx.beginPath();
 for (let y = 0; y <= LH * 2; y++) {
  ctx.moveTo(0, y * TILE / 2);
  ctx.lineTo(LW * TILE, y * TILE / 2);
  for (let x = (y % 2) * .5; x <= LW; x += 1) {
   ctx.moveTo(x * TILE, y * TILE / 2);
   ctx.lineTo(x * TILE, (y + 1) * TILE / 2);
  }
 }
 ctx.stroke();
 for (const [x, y] of [[7, 17], [LW - 8, 17], [LW / 2, LH - 3.5], [LW / 2, 4.5], [7, LH - 6], [LW - 8, LH - 6], [7, 6], [LW - 8, 6]]) {
  if (layout.buildings.some(b => x > b.x - 2 && x < b.x + b.w + 2 && y > b.y - 2 && y < b.y + b.h + 2)) continue;
  if (layout.paths.some(path => path.some((q, i) => i && segDist(x, y, path[i - 1], q) < 3.2))) continue;
  if (drawSprite(ctx, 'cityProps', 1, 0, x * TILE, (y + .9) * TILE, 76, 52)) continue;
  rounded(ctx, (x - 1.6) * TILE, (y - 1) * TILE, 3.2 * TILE, 2 * TILE, 4, shade(p.path, -.3));
  rounded(ctx, (x - 1.4) * TILE, (y - .8) * TILE, 2.8 * TILE, 1.6 * TILE, 3, p.grass);
  for (let k = 0; k < 6; k++) oval(ctx, (x - 1.1 + k * .45) * TILE, (y - .1 + (k % 2) * .3) * TILE, 4, 4, ['#e48ab4', '#f3d58a', '#ffffff'][k % 3]);
 }
}

function lampposts(ctx, layout, actors, time) {
 const placed = [];
 for (const path of layout.paths)
  for (let k = 1; k < path.length; k++) {
   const a = path[k - 1], b = path[k], len = Math.hypot(b.x - a.x, b.y - a.y);
   for (let d = 3; d < len; d += 7) {
    const t = d / len, x = a.x + (b.x - a.x) * t + (b.y - a.y) / len * 1.8, y = a.y + (b.y - a.y) * t - (b.x - a.x) / len * 1.8;
    if (placed.some(q => Math.hypot(q.x - x, q.y - y) < 5) || layout.buildings.some(z => x > z.x - .6 && x < z.x + z.w + .6 && y > z.y - .6 && y < z.y + z.h + 1.2) || layout.objects.some(o => !o.building && Math.hypot(o.x - x, o.y - y) < (['metro', 'cable', 'ferry', 'bridge', 'stage'].includes(o.kind) ? 3 : 2))) continue;
    if (layout.paths.some(pp => pp.some((q, i) => i && segDist(x, y, pp[i - 1], q) < 1.3))) continue;
    placed.push({ x, y });
    actors.push({ depth: y * TILE, draw: () => {
     const X = x * TILE, Y = y * TILE, night = layout.theme === 'night';
     if (drawSprite(ctx, 'cityProps', 0, 0, X, Y + 4, 28, 80)) return;
     oval(ctx, X, Y + 2, 7, 3, '#0003');
     rounded(ctx, X - 2, Y - 46, 4, 48, 2, '#3c4a46');
     rounded(ctx, X - 6, Y - 54, 12, 10, 3, '#2f3c39');
     oval(ctx, X, Y - 49, 4, 4, night ? '#ffe7a3' : '#f6e3b0');
     if (night) oval(ctx, X, Y - 49, 16 + Math.sin(time / 500 + x) * 1.5, 16, '#ffd98a2a');
    } });
   }
  }
}

function segDist(px, py, a, b) {
 const dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy, t = len ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len)) : 0;
 return Math.hypot(px - a.x - t * dx, py - a.y - t * dy);
}

// Paesini: orti a filari e covoni negli spazi liberi.
function villageFields(ctx, layout, p, time) {
 const spots = [[3, 3, 7, 4], [38, 3, 7, 4], [3, 28, 7, 4], [38, 28, 7, 4], [3, 11, 5, 4], [41, 11, 5, 4]];
 for (const [x, y, w, h] of spots) {
  if (layout.buildings.some(b => x < b.x + b.w + 1 && x + w > b.x - 1 && y < b.y + b.h + 1 && y + h > b.y - 1)) continue;
  if (layout.paths.some(path => path.some((q, i) => i && segDist(x + w / 2, y + h / 2, path[i - 1], q) < Math.max(w, h) / 2 + 1.6))) continue;
  if (layout.objects.some(o => !o.building && o.x > x - 1 && o.x < x + w + 1 && o.y > y - 1 && o.y < y + h + 2)) continue;
  if (layout.waters.some(wt => x < wt.x + wt.w && x + w > wt.x && y < wt.y + wt.h && y + h > wt.y)) continue;
  rounded(ctx, x * TILE, y * TILE, w * TILE, h * TILE, 6, '#8a6f4c');
  for (let r = 0; r < h * 2 - 1; r++) {
   line(ctx, [{ x: x * TILE + 6, y: (y + .5 + r * .5) * TILE }, { x: (x + w) * TILE - 6, y: (y + .5 + r * .5) * TILE }], '#6f5838', 2);
   for (let c = 0; c < w * 2 - 1; c++) oval(ctx, (x + .5 + c * .5) * TILE, (y + .45 + r * .5) * TILE, 4, 3, r % 3 === 2 ? '#d8b25a' : p.leaf);
  }
  for (const fx of [x - .2, x + w + .2]) line(ctx, [{ x: fx * TILE, y: (y - .2) * TILE }, { x: fx * TILE, y: (y + h + .2) * TILE }], '#a5875e', 3);
 }
}

function waterArt(ctx, w, time) {
 rounded(ctx, w.x * TILE, w.y * TILE, w.w * TILE, w.h * TILE, 26, '#ddceaa');
 rounded(ctx, (w.x + .3) * TILE, (w.y + .2) * TILE, (w.w - .6) * TILE, (w.h - .4) * TILE, 23, '#7eb2b0');
 for (let i = 0; i < 35; i++) {
  const xx = w.x * TILE + 12 + (i * 47) % (w.w * TILE - 25),
   yy = w.y * TILE + 18 + (i * 61) % (w.h * TILE - 40);
  line(ctx, [{
   x: xx + Math.sin(time / 1800 + i) * 3,
   y: yy
  }, {
   x: xx + 19 + Math.sin(time / 1800 + i) * 3,
   y: yy
  }], '#d7e8d777', 2);
 }
}

function landmark(ctx, layout, p, time) {
 const type = layout.landmark;
 if (type === 'fields') {
  for (let i = 0; i < 8; i++) line(ctx, [{
   x: 4 * TILE,
   y: (30 + i * .32) * TILE
  }, {
   x: 18 * TILE,
   y: (30 + i * .32) * TILE
  }], '#d2bf7b', 3);
  for (let i = 0; i < 20; i++) oval(ctx, (4 + i * .7) * TILE, 31 * TILE, 3, 7, '#d7c887');
 }
 if (type === 'train') {
  line(ctx, [{
   x: 2 * TILE,
   y: 11 * TILE
  }, {
   x: 46 * TILE,
   y: 11 * TILE
  }], '#8f8c7a', 12);
  for (let i = 2; i < 47; i++) line(ctx, [{
   x: i * TILE,
   y: 10.65 * TILE
  }, {
   x: i * TILE,
   y: 11.35 * TILE
  }], '#7e7765', 3);
  line(ctx, [{
   x: 2 * TILE,
   y: 10.8 * TILE
  }, {
   x: 46 * TILE,
   y: 10.8 * TILE
  }], '#bfc1ac', 2);
  line(ctx, [{
   x: 2 * TILE,
   y: 11.2 * TILE
  }, {
   x: 46 * TILE,
   y: 11.2 * TILE
  }], '#bfc1ac', 2);
  for (const [x, y] of [
    [34, 7],
    [39, 8],
    [10, 27]
   ]) {
   shape(ctx, '#d8ad72', () => {
    ctx.moveTo(x * TILE, y * TILE);
    ctx.lineTo((x + 2) * TILE, (y + 2) * TILE);
    ctx.lineTo((x - 2) * TILE, (y + 2) * TILE);
    ctx.closePath();
   });
  }
 }
 if (type === 'fountain' && drawSprite(ctx, 'towns', 3, 0, 24 * TILE, 18 * TILE, 100, 95)) {} else if (type === 'fountain') {
  oval(ctx, 24 * TILE, 17 * TILE, 43, 27, '#c4ba9a');
  oval(ctx, 24 * TILE, 17 * TILE, 36, 21, '#9ec4bd');
  rounded(ctx, 24 * TILE - 5, 17 * TILE - 37, 10, 37, 3, '#dbcfad');
  oval(ctx, 24 * TILE, 17 * TILE - 31, 18, 7, '#c8bd9e');
  for (const [x, y] of [
    [19, 12],
    [26, 27],
    [40, 25]
   ])
   for (let i = 0; i < 9; i++) oval(ctx, x * TILE + (i % 3) * 11, y * TILE + Math.floor(i / 3) * 9, 4, 4, i % 2 ? '#cf9c98' : '#ecd9a1');
 }
 if (type === 'market') {
  for (const [x, y, col] of [
    [18, 8, '#b8755e'],
    [21, 8, '#d9af69'],
    [27, 26, '#76997d']
   ]) {
   rounded(ctx, x * TILE, y * TILE, 60, 35, 4, '#b69468');
   rounded(ctx, x * TILE - 5, y * TILE - 16, 70, 22, 5, col);
   for (let i = 0; i < 5; i++) oval(ctx, x * TILE + 9 + i * 10, y * TILE + 12, 5, 5, '#dfc17e');
  }
 }
 if (type === 'mountain') {
  for (let i = 0; i < 7; i++) {
   const x = (3 + i * 7) * TILE;
   shape(ctx, i % 2 ? '#7e9090' : '#8d9c96', () => {
    ctx.moveTo(x - 70, 5 * TILE);
    ctx.lineTo(x, 1 * TILE);
    ctx.quadraticCurveTo(x + 35, 2 * TILE, x + 70, 5 * TILE);
    ctx.closePath();
   });
   shape(ctx, '#c4ccbc', () => {
    ctx.moveTo(x - 18, 2.1 * TILE);
    ctx.lineTo(x, 1 * TILE);
    ctx.lineTo(x + 19, 2.25 * TILE);
    ctx.lineTo(x + 4, 2 * TILE);
    ctx.closePath();
   });
  }
 }
 if (type === 'harbor') {
  rounded(ctx, 37 * TILE, 27 * TILE, 5 * TILE, 6 * TILE, 4, '#b4996d');
  for (let i = 0; i < 12; i++) line(ctx, [{
   x: 37 * TILE,
   y: (27 + i * .5) * TILE
  }, {
   x: 42 * TILE,
   y: (27 + i * .5) * TILE
  }], '#d2bc8a', 2);
  shape(ctx, '#e6dfba', () => {
   ctx.moveTo(43 * TILE, 28 * TILE);
   ctx.quadraticCurveTo(50 * TILE, 29 * TILE, 43 * TILE, 32 * TILE);
   ctx.closePath();
  });
 }
 if (type === 'lamps')
  for (const [x, y] of [
    [19, 12],
    [29, 23],
    [7, 20],
    [41, 17]
   ]) {
   oval(ctx, x * TILE, y * TILE, 43, 25, '#efd29313');
   line(ctx, [{
    x: x * TILE,
    y: y * TILE
   }, {
    x: x * TILE,
    y: (y - 2) * TILE
   }], '#394f59', 4);
   oval(ctx, x * TILE, (y - 2) * TILE, 7, 9, '#f3d394');
  }
 if (type === 'festival') {
  for (let i = 0; i < 9; i++) {
   const x = (7 + i * 4) * TILE;
   line(ctx, [{
    x,
    y: 17 * TILE
   }, {
    x: x + 4 * TILE,
    y: 17 * TILE
   }], '#9c9469', 1);
   shape(ctx, ['#c87e65', '#dfbf6d', '#799b88'][i % 3], () => {
    ctx.moveTo(x, 17 * TILE);
    ctx.lineTo(x + 14, 17 * TILE + 22);
    ctx.lineTo(x + 28, 17 * TILE);
    ctx.closePath();
   });
  }
 }
}
export function renderWorld(ctx, {
 cam: camIn = null,
 layout,
 state,
 area,
 walk,
 moving,
 near,
 time,
 W = 960,
 H = 600
}) {
 const p = THEMES[layout.theme] || THEMES.country,
  cam = camIn || cameraFor(state.x, state.y, W, H, layout);
 const seaAround = ['island', 'seaBridge'].includes(layout.theme);
 ctx.fillStyle = seaAround ? '#75aaa6' : p.grass;
 ctx.fillRect(0, 0, W, H);
 ctx.save();
 ctx.translate(-cam.x, -cam.y);
 if (!seaAround) borderTrees(ctx, layout, p, cam, W, H);
 ctx.fillStyle = layout.theme === 'seaBridge' ? '#75aaa6' : p.grass;
 ctx.fillRect(0, 0, layout.width * TILE, layout.height * TILE);
 for (let i = 0; i < 190; i++) {
  const x = (i * 151 + state.city * 17) % (layout.width * TILE),
   y = (i * 97) % (layout.height * TILE);
  oval(ctx, x, y, 22 + (i % 4) * 13, 12 + (i % 3) * 5, i % 2 ? '#f9e7a90b' : '#426d3f08');
 }
 if (layout.size === 'city') paving(ctx, layout, p);
 if (layout.size === 'village') villageFields(ctx, layout, p, time);
 seaBeyond(ctx, layout, time);
 outerWaters(layout).forEach(w => waterArt(ctx, w, time));
 // Tutte le strade insieme, strato per strato: un unico tratto per strato, così dove si
 // incrociano o si sovrappongono si fondono senza bordi visibili.
 const allPts = layout.paths.map(path => path.map(pt => ({ x: pt.x * TILE, y: pt.y * TILE })));
 const layer = (color, width) => {
  ctx.beginPath();
  for (const pts of allPts) pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
 };
 if (layout.size === 'city') {
  layer('#00000026', 78);
  layer(shade(p.path, layout.theme === 'night' ? .25 : -.08), 70);
  layer(layout.theme === 'night' ? shade(p.path, .12) : p.path, 62);
 } else {
  layer('#647b4e16', 76);
  layer(p.path, 68);
  layer('#fff1cd16', 53);
 }
 if (layout.theme === 'seaBridge') {
  rounded(ctx, 22.4 * TILE, 0, 3.2 * TILE, HEIGHT * TILE, 0, '#bda478');
  for (let i = 0; i < HEIGHT * 3; i++) line(ctx, [{
   x: 22.4 * TILE,
   y: i * 8
  }, {
   x: 25.6 * TILE,
   y: i * 8
  }], '#7e6c50', 1);
  for (const xx of [22.3, 25.7]) {
   line(ctx, [{
    x: xx * TILE,
    y: 0
   }, {
    x: xx * TILE,
    y: HEIGHT * TILE
   }], '#e1c89b', 4);
   for (let i = 0; i < HEIGHT; i++) rounded(ctx, xx * TILE - 3, i * TILE, 6, 14, 1, '#8d7653');
  }
 }
 if (layout.plaza) oval(ctx, layout.plaza[0] * TILE, layout.plaza[1] * TILE, 100, 65, p.path);
 if (layout.theme === 'river')
  for (const yy of [18]) {
   if (drawSprite(ctx, 'towns', 3, 3, 10.5 * TILE, (yy + 1) * TILE, 7 * TILE, 92)) continue;
   rounded(ctx, 7 * TILE, yy * TILE - 30, 7 * TILE, 60, 5, '#b79e79');
   for (let i = 0; i < 7; i++) line(ctx, [{
    x: (7 + i) * TILE,
    y: yy * TILE - 27
   }, {
    x: (7 + i) * TILE,
    y: yy * TILE + 27
   }], '#d6c39b', 2);
  }
 for (let i = 0; i < (layout.theme === 'seaBridge' ? 0 : 24); i++) {
  const x = 3 + (i * 13.3) % 42,
   y = 3 + (i * 7.7) % 27;
  if ((layout.from !== undefined && layout.theme === 'river' && x > 6.5 && x < 14.5) || layout.buildings.some(b => x > b.x - 1 && x < b.x + b.w + 1 && y > b.y - 1 && y < b.y + b.h + 2) || layout.waters.some(w => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h) || layout.paths.some(path => path.some(pt => Math.hypot(pt.x - x, pt.y - y) < 3))) continue;
  drawSprite(ctx, 'towns', 3, 2, x * TILE, y * TILE, 35, 27);
 }
 if (layout.from !== undefined && layout.theme !== 'seaBridge' && !layout.route) {
  for (let i = 0; i < 18; i++) {
   const xx = (4 + i * 2.3) * TILE,
    yy = (i % 2 ? 8 : 28) * TILE;
   if (layout.theme === 'river' && xx > 6 * TILE && xx < 14.5 * TILE) continue;
   rounded(ctx, xx, yy, 32, 5, 2, '#aa9167');
   line(ctx, [{
    x: xx + 5,
    y: yy - 8
   }, {
    x: xx + 5,
    y: yy + 13
   }], '#927d59', 3);
   drawSprite(ctx, 'towns', 3, 2, xx + 15, yy - 6, 26, 24);
  }
  for (const [xx, yy] of [
    [12, 10],
    [35, 27],
    [9, 26]
   ]) drawSprite(ctx, 'towns', 3, 1, xx * TILE, yy * TILE, 72, 48);
 }
 ctx.save();
 ctx.translate((layout.offset?.x || 0) * TILE, (layout.offset?.y || 0) * TILE);
 landmark(ctx, layout, p, time);
 ctx.restore();
 const actors = [];
 if (layout.size === 'city') lampposts(ctx, layout, actors, time);
 layout.buildings.forEach(b => actors.push({
  depth: (b.y + b.h) * TILE,
  draw: () => buildingArt(ctx, b, p)
 }));
 if (layout.stage) actors.push({
  depth: layout.stage.y * TILE,
  draw: () => drawStage(ctx, layout.stage.x * TILE, layout.stage.y * TILE, state.city === 0 ? 'Piazza delle Cicale' : CITIES[state.city].genre, layout.theme === 'festival', layout.theme === 'festival' ? FESTIVAL_STAGE_SCALE : STAGE_SCALE)
 });
 if (layout.route) {
  const R = layout.route;
  for (let gy = 0; gy < HEIGHT + 2; gy += 2.1)
   for (let gx = 0; gx < WIDTH + 1; gx += 2.3) {
    const x = gx + ((Math.floor(gy / 2.1) % 2) ? 1.15 : 0) + Math.sin(gx * 7.1 + gy * 3.3) * .35,
     y = gy + Math.cos(gx * 5.3 + gy) * .3;
    if (pathDistance(R, x, y) < 2.7 || R.clearings.some(r => inRect(r, x, y, 1.6))) continue;
    if (layout.theme === 'river' && x > 6.5 && x < 14.5) continue;
    if (layout.gates.some(g => Math.hypot(g.x - x, g.y - y) < 3)) continue;
    actors.push({
     depth: y * TILE,
     draw: () => drawTree(ctx, x * TILE, y * TILE, p, Math.floor(x * 13 + y * 7))
    });
   }
  for (const g of R.grass || []) {
   if (hasAtlas('trail')) {
    for (let yy = g.y + .6; yy < g.y + g.h + .4; yy += .7)
     for (let xx = g.x + .5; xx < g.x + g.w; xx += 1.1) {
      const X = xx, Y = yy;
      actors.push({ depth: Y * TILE, draw: () => drawSprite(ctx, 'trail', 0, 0, X * TILE, Y * TILE + 4, 34, 26) });
     }
   } else
    for (let yy = g.y; yy < g.y + g.h; yy += .55)
     for (let xx = g.x; xx < g.x + g.w; xx += .5) tallGrass(ctx, xx * TILE, yy * TILE, time, xx + yy);
  }
  trailDecor(ctx, layout, actors);
 }
 if (layout.size === 'city') cityDecor(ctx, layout, actors);
 for (let i = 0; i < (layout.theme === 'seaBridge' || layout.route || layout.size === 'city' ? 0 : 58); i++) {
  const x = (2 + (i * 7.37) % 44),
   y = (2 + (i * 5.19) % 30);
  if (layout.buildings.some(b => x > b.x - 2 && x < b.x + b.w + 2 && y > b.y - 2 && y < b.y + b.h + 3)) continue;
  if (layout.paths.some(path => path.some((pt, i) => {
    if (!i) return Math.hypot(pt.x - x, pt.y - y) < 3;
    const a = path[i - 1],
     dx = pt.x - a.x,
     dy = pt.y - a.y,
     len = dx * dx + dy * dy,
     t = len ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len)) : 0;
    return Math.hypot(x - a.x - t * dx, y - a.y - t * dy) < 2.8;
   }))) continue;
  if (layout.gates.some(g => Math.hypot(g.x - x, g.y - y) < 4)) continue;
  const sbx = stageBox(layout);
  if (sbx && x > sbx.x0 - 2.5 && x < sbx.x1 + 2.5 && y > sbx.y0 - 1 && y < sbx.y1 + 5) continue;
  if ((layout.from !== undefined && layout.theme === 'river' && x > 6 && x < 15) || (x > 17 && x < 40 && y > 13 && y < 28) || layout.waters.some(w => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h)) continue;
  actors.push({
   depth: y * TILE,
   draw: () => drawTree(ctx, x * TILE, y * TILE, p, i, layout.theme === 'island')
  });
 }
 for (const o of layout.objects)
  if (o.kind === 'secret' && !(state.found || []).includes(o.id)) actors.push({
   depth: o.y * TILE,
   draw: () => {
    drawSprite(ctx, 'trail', 1, 3, o.x * TILE, o.y * TILE + 4, 40, 30);
    sparkle(ctx, o.x * TILE, o.y * TILE - 6, time);
   }
  });
 for (const o of layout.objects)
  if (o.kind === 'sign') actors.push({
   depth: o.y * TILE,
   draw: () => drawSprite(ctx, 'trail', 0, 1, o.x * TILE, o.y * TILE + 2, 40, 52)
  });
 for (const o of layout.objects)
  if (['metro', 'cable', 'ferry', 'bridge'].includes(o.kind)) actors.push({
   depth: o.y * TILE,
   draw: () => drawTransport(ctx, o.x * TILE, o.y * TILE, o.kind, o.label)
  });
 for (const o of layout.objects)
  if (['npc', 'wanderer', 'resident', 'rivalPerson', 'passerby'].includes(o.kind)) actors.push({
   depth: o.y * TILE,
   draw: () => {
    drawCharacter(ctx, o.x * TILE, o.y * TILE, {
     portrait: o.portrait ?? null,
     variant: o.sprite || 1,
     color: o.color,
     facing: o.facing || 'south'
    });
   }
  });
 actors.push({
  depth: state.y * TILE,
  draw: () => drawCharacter(ctx, state.x * TILE, state.y * TILE, {
   facing: state.facing,
   moving,
   walk,
   bike: state.bike
  })
 });
 actors.sort((a, b) => a.depth - b.depth).forEach(a => a.draw());
 ctx.restore();
 if (layout.theme === 'night') {
  ctx.fillStyle = '#1e355315';
  ctx.fillRect(0, 0, W, H);
 }
 return cam;
}

function drawTransport(ctx, x, y, kind, title) {
 if (drawSprite(ctx, 'transport', 0, { metro: 0, cable: 1, ferry: 2, bridge: 3 } [kind] ?? 0, x, y + 22, 96, 96)) {
  return;
 }
 ctx.save();
 ctx.translate(x, y);
 if (kind === 'metro') {
  rounded(ctx, -30, -3, 60, 28, 4, '#263c3c');
  for (let i = 0; i < 6; i++) rounded(ctx, -25 + i * 2, 2 + i * 3, 50 - i * 4, 2, 0, '#a8b49b');
  line(ctx, [{
   x: -34,
   y: 22
  }, {
   x: -34,
   y: -34
  }, {
   x: 34,
   y: -34
  }, {
   x: 34,
   y: 22
  }], '#618b7b', 4);
  rounded(ctx, -21, -57, 42, 28, 5, '#355f75');
  label(ctx, 'M', 0, -36, 23, '#fff2c7');
 } else if (kind === 'cable') {
  line(ctx, [{
   x: -48,
   y: -84
  }, {
   x: 48,
   y: -100
  }], '#677570', 3);
  line(ctx, [{
   x: 0,
   y: -92
  }, {
   x: 0,
   y: -62
  }], '#677570', 3);
  rounded(ctx, -26, -65, 52, 57, 10, '#bc7656');
  rounded(ctx, -21, -59, 42, 28, 5, '#b9d8cb');
  line(ctx, [{
   x: 0,
   y: -59
  }, {
   x: 0,
   y: -31
  }], '#f4deb0', 3);
 } else {
  rounded(ctx, -40, -4, 80, 25, 4, '#b7a071');
  for (let i = 0; i < 8; i++) line(ctx, [{
   x: -36 + i * 10,
   y: -3
  }, {
   x: -36 + i * 10,
   y: 20
  }], '#725f48', 2);
  if (kind === 'ferry') {
   rounded(ctx, -23, -32, 46, 20, 6, '#eee0bc');
   rounded(ctx, -12, -52, 26, 21, 4, '#5d948f');
  } else {
   for (const xx of [-35, 35]) line(ctx, [{
    x: xx,
    y: 18
   }, {
    x: xx,
    y: -20
   }], '#8c7751', 4);
   line(ctx, [{
    x: -35,
    y: -17
   }, {
    x: 35,
    y: -17
   }], '#c1a879', 3);
  }
 }
 ctx.restore();
}