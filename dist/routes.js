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
  secret: { id: 'orario-casello', x: 7.2, y: 15.5, label: 'Il vecchio casello', title: 'Un orario del 1989', text: 'Inchiodato alla porta del casello, un orario dei treni. La fermata «Otto Strade» è cancellata a penna, e accanto qualcuno ha disegnato un plettro.', xp: 30 }
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
