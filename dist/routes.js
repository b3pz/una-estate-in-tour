// Percorsi disegnati a mano. Le coordinate sono in caselle sulla mappa 48 × 34 del sentiero e valgono
// in entrambi i sensi di marcia. Fuori da sentieri e radure c’è bosco fitto: non si passa.
const P = (x, y) => ({ x, y });

export const ROUTES = {
 // Borgo delle Cicale ↔ Rivafosca: ponte sul torrente, salita al prato, discesa verso il fiume.
 '0-1': {
  paths: [
   [P(1.5, 18), P(6, 18), P(15, 18), P(18, 15), P(19, 11), P(23, 9), P(29, 9), P(33, 11), P(35, 16), P(36, 21), P(39, 23), P(43, 21), P(46.5, 18)],
   [P(36, 21), P(32, 25), P(27, 27), P(21, 28)]
  ],
  clearings: [
   { x: 21.5, y: 5.5, w: 10, h: 7 },
   { x: 17.5, y: 25.5, w: 6, h: 4.5 }
  ],
  grass: [
   { x: 23, y: 6, w: 4, h: 2.5 },
   { x: 28, y: 10.5, w: 3, h: 1.8 },
   { x: 18, y: 26, w: 2.5, h: 2 }
  ],
  wanderer: P(26, 8.4),
  sign: P(16.2, 15.6),
  secret: { id: 'cassetta-borgo', x: 18.6, y: 28.4, label: 'Qualcosa tra l’erba', title: 'Una cassetta nel fango', text: 'Una vecchia cassetta, un po’ ammaccata. Sull’etichetta, a penna: «Demo del garage · 1989 · lato A». Qualcuno l’ha persa venendo da Borgo, tanti anni fa.', xp: 30 }
 },
 // Rivafosca ↔ Officina: dal fiume si scende verso un vecchio deposito, poi si risale verso le ciminiere.
 '1-2': {
  paths: [
   [P(1.5, 18), P(8, 18), P(10, 24), P(18, 26), P(26, 24), P(30, 18), P(34, 13), P(41, 12), P(44, 15), P(46.5, 18)],
   [P(30, 18), P(36, 21), P(38, 27)]
  ],
  clearings: [
   { x: 21.5, y: 20.5, w: 8, h: 7 },
   { x: 35.5, y: 25.5, w: 5, h: 4 }
  ],
  grass: [
   { x: 12, y: 21.5, w: 3, h: 2 },
   { x: 39, y: 9.5, w: 3.5, h: 1.6 }
  ],
  wanderer: P(18, 25.4),
  sign: P(9, 16.2),
  secret: { id: 'biglietto-capannone', x: 38.2, y: 28, label: 'Un foglio sotto un bancale', title: 'Un biglietto strappato', text: 'Metà di un biglietto: «Le Otto Strade · Capannone · ingresso gratuito per chi porta uno strumento». La data è illeggibile, ma l’inchiostro è vecchio.', xp: 30 }
 },
 // Officina ↔ Binario Nord: un sentiero che sale a tornanti verso i binari, con una deviazione al vecchio casello.
 '2-3': {
  paths: [
   [P(24, 32.5), P(24, 27), P(18, 24), P(15, 18), P(19, 12), P(27, 10), P(30, 6), P(24, 3), P(24, 1.5)],
   [P(15, 18), P(9, 16)]
  ],
  clearings: [
   { x: 12.5, y: 14.5, w: 7, h: 6 },
   { x: 6, y: 13.5, w: 4.5, h: 4.5 }
  ],
  grass: [
   { x: 13, y: 19, w: 3, h: 1.5 },
   { x: 28, y: 11, w: 3, h: 2 }
  ],
  wanderer: P(18.5, 23.2),
  sign: P(26, 28.5),
  secret: { id: 'orario-casello', x: 7.2, y: 15.5, label: 'Il vecchio casello', title: 'Un orario del 1989', text: 'Inchiodato alla porta del casello, un orario dei treni. La fermata «Otto Strade» è cancellata a penna, e accanto qualcuno ha disegnato un plettro.', xp: 30 } },
 // Binario Nord ↔ Bellavista: campi di girasoli e una radura con un vecchio chiosco del teatro.
 '3-4': {
  paths: [
   [P(1.5, 18), P(7, 18), P(11, 13), P(17, 11), P(23, 14), P(27, 20), P(33, 22), P(38, 19), P(42, 17), P(46.5, 18)],
   [P(27, 20), P(24, 26)]
  ],
  clearings: [{ x: 20.5, y: 24.5, w: 7, h: 5 }],
  grass: [{ x: 14, y: 12.5, w: 3, h: 1.5 }, { x: 35, y: 23, w: 3, h: 1.5 }],
  wanderer: P(17, 11.4),
  sign: P(8, 16.2),
  secret: { id: 'biglietto-teatro', x: 22, y: 28, label: 'Un biglietto tra i fiori', title: 'Prima fila, 1989', text: 'Un biglietto del Teatro Aurora, prima fila, mai strappato. Sul retro, a matita: «Se Lia riapre il teatro, voglio tornarci».', xp: 30 }
 },
 // Bellavista ↔ Grooveto: si scende tra i frutteti e si risale verso i cortili.
 '4-5': {
  paths: [
   [P(1.5, 18), P(6, 18), P(9, 23), P(16, 26), P(23, 23), P(26, 16), P(31, 10), P(38, 9), P(43, 13), P(46.5, 18)],
   [P(26, 16), P(20, 10)]
  ],
  clearings: [{ x: 15, y: 6, w: 7, h: 5 }],
  grass: [{ x: 10, y: 24, w: 3, h: 1.5 }, { x: 33, y: 10.5, w: 3, h: 1.6 }],
  wanderer: P(16, 26.4),
  sign: P(7, 16.5),
  secret: { id: 'quaderno-tito', x: 17, y: 7.8, label: 'Un quaderno sotto un albero', title: 'Il quaderno di Tito', text: 'Un quaderno di Tito ragazzino: una griglia di sedicesimi con metà caselle cancellate e una scritta in stampatello: «MENO NOTE, PIÙ SPAZIO».', xp: 30 }
 },
 // Grooveto ↔ Valdaccordo: salita a tornanti verso l’accademia.
 '5-6': {
  paths: [
   [P(24, 32.5), P(24, 28), P(14, 25), P(10, 20), P(18, 16), P(32, 15), P(37, 10), P(30, 5), P(24, 3), P(24, 1.5)],
   [P(37, 10), P(42, 16)]
  ],
  clearings: [{ x: 39.5, y: 14.5, w: 6, h: 5 }],
  grass: [{ x: 12, y: 21, w: 3, h: 1.6 }, { x: 28, y: 6.5, w: 3, h: 1.5 }],
  wanderer: P(20, 16.4),
  sign: P(25.5, 29),
  secret: { id: 'spartito-accademia', x: 42.5, y: 17.5, label: 'Un foglio tra le rocce', title: 'Uno spartito in prestito', text: 'Uno spartito bagnato dalla pioggia, timbrato «Accademia di Valdaccordo · prestito». Il prestito scadeva nel 1990 e non è mai stato restituito.', xp: 30 }
 },
 // Binario Nord ↔ Valdaccordo: la scorciatoia nel bosco, con un belvedere a ovest.
 '3-6': {
  paths: [
   [P(34, 32.5), P(34, 28), P(26, 25), P(20, 20), P(22, 13), P(30, 10), P(38, 12), P(42, 17), P(46.5, 18)],
   [P(20, 20), P(10, 22)]
  ],
  clearings: [{ x: 5, y: 19, w: 7, h: 5 }],
  grass: [{ x: 24, y: 24, w: 3, h: 1.5 }, { x: 39, y: 9.5, w: 3, h: 1.5 }],
  wanderer: P(30, 10.4),
  sign: P(32, 27.5),
  secret: { id: 'manifesto-1989', x: 7, y: 22.5, label: 'Un foglio sul tronco', title: 'Il resto del manifesto', text: 'Un pezzo del manifesto delle Otto Strade, 1989, inchiodato a un tronco. In basso, dove dovrebbe esserci il quarto nome, la carta è strappata.', xp: 30 }
 },
 // Grooveto ↔ Porto del Sol: si scende verso il mare, con una terrazza panoramica.
 '5-8': {
  paths: [
   [P(34, 1.5), P(34, 6), P(26, 9), P(18, 14), P(16, 21), P(22, 26), P(31, 27), P(38, 24), P(46.5, 24)],
   [P(16, 21), P(8, 25)]
  ],
  clearings: [{ x: 3.5, y: 22, w: 7, h: 6 }],
  grass: [{ x: 26, y: 10.5, w: 3, h: 1.5 }, { x: 33, y: 28, w: 3, h: 1.4 }],
  wanderer: P(22, 26.4),
  sign: P(32, 4.5),
  secret: { id: 'conchiglia', x: 5.5, y: 26.5, label: 'Qualcosa che luccica', title: 'Una conchiglia che suona', text: 'Una conchiglia con un piccolo foro. Soffiandoci dentro fa una nota sola, un La: qualcuno la usava per accordare gli strumenti prima di salire sul traghetto.', xp: 30 }
 },
 // Borgo delle Cicale ↔ Officina: la vecchia strada dei camion, con un deposito abbandonato.
 '0-2': {
  paths: [
   [P(30, 32.5), P(30, 27), P(36, 22), P(36, 16), P(28, 12), P(20, 12), P(14, 8), P(14, 1.5)],
   [P(36, 16), P(42, 10)]
  ],
  clearings: [{ x: 39, y: 5, w: 6.5, h: 6 }],
  grass: [{ x: 22, y: 13.5, w: 3, h: 1.5 }, { x: 31, y: 24, w: 2.5, h: 1.5 }],
  wanderer: P(28, 12.4),
  sign: P(31.5, 28.5),
  secret: { id: 'valvola-ada', x: 42, y: 8, label: 'Una scatola nel deposito', title: 'Una valvola nuova', text: 'Una valvola per amplificatori ancora incartata. Sulla scatola, a pennarello: «Per Ada, quando sarà grande». Ada, oggi, ripara gli amplificatori di tutto il quartiere.', xp: 30 }
 },
 // Valdaccordo ↔ Notturnia: il sentiero dei lampioni, che si accende al tramonto.
 '6-10': {
  paths: [
   [P(1.5, 18), P(7, 18), P(11, 23), P(19, 25), P(25, 20), P(28, 13), P(35, 11), P(41, 14), P(46.5, 18)],
   [P(25, 20), P(31, 25)]
  ],
  clearings: [{ x: 29, y: 23, w: 7, h: 5 }],
  grass: [{ x: 12, y: 24.5, w: 3, h: 1.5 }, { x: 36, y: 9.5, w: 3, h: 1.5 }],
  wanderer: P(19, 25.4),
  sign: P(8, 16.3),
  secret: { id: 'tovagliolo-a', x: 33, y: 27, label: 'Un tovagliolo impigliato', title: 'Una melodia sul tovagliolo', text: 'Un tovagliolo del Caffè Blu con una melodia scarabocchiata e una A arricciata in fondo. Il vento l’ha portato fin qui da Notturnia.', xp: 30 }
 },
 // Notturnia ↔ Settembre: l’ultima salita, verso le luci del festival.
 '10-11': {
  paths: [
   [P(24, 32.5), P(24, 27), P(16, 24), P(13, 18), P(18, 12), P(28, 10), P(34, 6), P(28, 3), P(24, 1.5)],
   [P(13, 18), P(6, 14)]
  ],
  clearings: [{ x: 2.5, y: 10.5, w: 7, h: 6 }],
  grass: [{ x: 19, y: 11, w: 3, h: 1.5 }, { x: 18, y: 25, w: 3, h: 1.4 }],
  wanderer: P(16, 24.4),
  sign: P(25.5, 28),
  secret: { id: 'pass-1989', x: 5, y: 15.5, label: 'Un cartoncino nell’erba', title: 'Un pass del 1989', text: 'Un pass del festival del 1989, sbiadito dal sole. Sul retro, a penna: «Riva + A. — l’anno prossimo di nuovo, promesso».', xp: 30 }
 }
};

export const routeKey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);

export function segmentDistance(px, py, a, b) {
 const dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy;
 const t = len ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len)) : 0;
 return Math.hypot(px - a.x - t * dx, py - a.y - t * dy);
}

export function pathDistance(route, x, y) {
 let best = Infinity;
 for (const path of route.paths)
  for (let i = 1; i < path.length; i++) best = Math.min(best, segmentDistance(x, y, path[i - 1], path[i]));
 return best;
}

export function inRect(r, x, y, pad = 0) {
 return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad;
}

// Si cammina sul sentiero e nelle radure.
export function routeWalkable(route, x, y) {
 return pathDistance(route, x, y) <= 1.45 || route.clearings.some(r => inRect(r, x, y));
}

// Arrotonda gli angoli di una spezzata con archi (curve di Bézier quadratiche campionate).
export function roundPath(pts, radius = 2.4, steps = 6) {
 if (pts.length < 3) return pts.map(p => ({ ...p }));
 const out = [{ ...pts[0] }];
 for (let i = 1; i < pts.length - 1; i++) {
  const a = pts[i - 1], b = pts[i], c = pts[i + 1];
  const la = Math.hypot(b.x - a.x, b.y - a.y), lc = Math.hypot(c.x - b.x, c.y - b.y);
  const r = Math.min(radius, la / 2, lc / 2);
  if (r < .2) { out.push({ ...b }); continue; }
  const p0 = { x: b.x + (a.x - b.x) / la * r, y: b.y + (a.y - b.y) / la * r }, p2 = { x: b.x + (c.x - b.x) / lc * r, y: b.y + (c.y - b.y) / lc * r };
  for (let k = 0; k <= steps; k++) {
   const t = k / steps, u = 1 - t;
   out.push({ x: u * u * p0.x + 2 * u * t * b.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * b.y + t * t * p2.y });
  }
 }
 out.push({ ...pts.at(-1) });
 return out;
}
