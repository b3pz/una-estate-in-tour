// Two shared raster atlases. Cropping happens at render time; generated originals are preserved.
function load(url) {
 if (typeof Image === 'undefined') return null;
 const image = new Image();
 image.src = new URL(url, import.meta.url).href;
 return image;
}
export const atlases = {
 hero: load('./assets/hero-world-atlas.png'),
 band: load('./assets/band-instruments-atlas.png'),
 towns: load('./assets/towns-props-atlas.png'),
 interiors: load('./assets/interiors-atlas.png'),
 people: load('./assets/people-atlas.png')
};
// Atlanti opzionali: compaiono da soli quando i file sono in assets/extra/ ed elencati nel manifest
// (lo aggiorna «npm run assets»). Finché mancano, il gioco usa i disegni di riserva.
export const EXTRA_FILES = {
 'hero-bike.png': 'heroBike',
 'people-dir-1.png': 'peopleDir0',
 'people-dir-2.png': 'peopleDir1',
 'people-dir-3.png': 'peopleDir2',
 'people-dir-4.png': 'peopleDir3',
 'people-extra.png': 'people2',
 'transport-stage.png': 'transport',
 'interiors-extra.png': 'interiors2',
 'title-art.jpg': 'title',
 'trail-props.png': 'trail',
 'city-props.png': 'cityProps',
 'buildings-extra.png': 'buildings2',
 'hero-walk.png': 'heroWalk',
 'hero-girl-walk.png': 'heroGirlWalk',
 'hero-girl-bike.png': 'heroGirlBike',
 'farm-props.png': 'farm',
 'metro-car.png': 'metroCar',
 'misc-props.png': 'misc',
 'rooms/casa.jpg': 'room:casa',
 'rooms/sala-prove.jpg': 'room:sala-prove',
 'rooms/scuola.jpg': 'room:scuola',
 'rooms/negozio.jpg': 'room:negozio',
 'rooms/locale.jpg': 'room:locale',
 'rooms/officina.jpg': 'room:officina',
 'rooms/pietra.jpg': 'room:pietra',
 'rooms/capanna.jpg': 'room:capanna',
 'rooms/stazione.jpg': 'room:stazione',
 'concert/blues.jpg': 'concert:Blues',
 'concert/rock.jpg': 'concert:Rock',
 'concert/pop.jpg': 'concert:Pop',
 'concert/funk.jpg': 'concert:Funk',
 'concert/metal.jpg': 'concert:Metal',
 'concert/latino.jpg': 'concert:Latino',
 'concert/reggae.jpg': 'concert:Reggae',
 'concert/jazz.jpg': 'concert:Jazz',
 'concert/casa.jpg': 'concert:Casa',
 'concert/rivali.jpg': 'concert:rival',
 'concert/traghetto.jpg': 'concert:boat',
 'concert/festival.jpg': 'concert:final'
};
export function hasAtlas(key) {
 const image = atlases[key];
 return !!(image && image.complete && image.naturalWidth);
}
export async function loadExtras() {
 if (typeof fetch === 'undefined' || typeof Image === 'undefined') return [];
 try {
  const res = await fetch(new URL('./assets/extra/manifest.json', import.meta.url).href, { cache: 'no-cache' });
  if (!res.ok) return [];
  const { files = [] } = await res.json();
  const loaded = [];
  for (const file of files) {
   const key = EXTRA_FILES[file];
   if (!key) continue;
   atlases[key] = load('./assets/extra/' + file);
   loaded.push(key);
  }
  return loaded;
 } catch {
  return [];
 }
}
const bounds = new WeakMap();
// Tavole animate: tutti i fotogrammi di una riga usano lo stesso riquadro, così il personaggio
// non cambia dimensione né posizione mentre cammina o pedala.
const ANIMATED = new Set(['heroWalk', 'heroGirlWalk', 'heroBike', 'heroGirlBike']);
const rows = new Map();
function rowBounds(image, row, col) {
 const key = image.src + ':' + row;
 let local = rows.get(key);
 if (!local) {
  const cw = image.naturalWidth / 4;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let c = 0; c < 4; c++) {
   const b = cellBounds(image, row, c);
   if (b.w >= cw - 1) continue;
   x0 = Math.min(x0, b.x - c * cw);
   y0 = Math.min(y0, b.y);
   x1 = Math.max(x1, b.x - c * cw + b.w);
   y1 = Math.max(y1, b.y + b.h);
  }
  local = Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  rows.set(key, local);
 }
 if (!local) return cellBounds(image, row, col);
 return { x: col * image.naturalWidth / 4 + local.x, y: local.y, w: local.w, h: local.h };
}
export function spriteFit(sw, sh, w, h) {
 const scale = Math.min(w / sw, h / sh);
 return {
  w: sw * scale,
  h: sh * scale
 };
}

function cellBounds(image, row, col) {
 let cells = bounds.get(image);
 if (!cells) {
  cells = new Map();
  bounds.set(image, cells);
 }
 const key = row * 4 + col;
 if (cells.has(key)) return cells.get(key);
 const cw = image.naturalWidth / 4,
  ch = image.naturalHeight / 4;
 let box = {
  x: col * cw,
  y: row * ch,
  w: cw,
  h: ch
 };
 if (typeof document !== 'undefined') {
  const c = document.createElement('canvas');
  c.width = Math.ceil(cw);
  c.height = Math.ceil(ch);
  const cx = c.getContext('2d', {
   willReadFrequently: true
  });
  cx.drawImage(image, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
  const data = cx.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width,
   y0 = c.height,
   x1 = 0,
   y1 = 0;
  for (let y = 0; y < c.height; y++)
   for (let x = 0; x < c.width; x++)
    if (data[(y * c.width + x) * 4 + 3] > 24) {
     x0 = Math.min(x0, x);
     y0 = Math.min(y0, y);
     x1 = Math.max(x1, x);
     y1 = Math.max(y1, y);
    } if (x1 > x0 && y1 > y0) box = {
   x: col * cw + x0,
   y: row * ch + y0,
   w: x1 - x0 + 1,
   h: y1 - y0 + 1
  };
 }
 cells.set(key, box);
 return box;
}
export function drawSprite(ctx, atlas, row, col, x, y, w, h = w, flip = false) {
 const image = atlases[atlas];
 if (!image || !image.complete || !image.naturalWidth) return false;
 const box = ANIMATED.has(atlas) ? rowBounds(image, row, col) : cellBounds(image, row, col),
  fit = spriteFit(box.w, box.h, w, h);
 ctx.save();
 ctx.imageSmoothingEnabled = true;
 ctx.imageSmoothingQuality = 'high';
 ctx.translate(x, y);
 if (flip) ctx.scale(-1, 1);
 ctx.drawImage(image, box.x, box.y, box.w, box.h, -fit.w / 2, -fit.h, fit.w, fit.h);
 ctx.restore();
 return true;
}
export function spriteCell(direction, moving = false, walk = 0) {
 return {
  // Ciclo del passo in quattro tempi: passo, appoggio, altro passo, appoggio.
  row: moving ? [1, 0, 2, 0][Math.floor(walk * 8) % 4] : 0,
  col: moving && direction === 'west' ? 2 : ({
   south: 0,
   west: 1,
   east: 2,
   north: 3
  } [direction] ?? 0),
  flip: moving && direction === 'west'
 };
}