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
const bounds = new WeakMap();
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
 const box = cellBounds(image, row, col),
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
  row: moving ? 1 + (Math.floor(walk * 6) % 2) : 0,
  col: moving && direction === 'west' ? 2 : ({
   south: 0,
   west: 1,
   east: 2,
   north: 3
  } [direction] ?? 0),
  flip: moving && direction === 'west'
 };
}