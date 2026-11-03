// Controlla gli sprite aggiunti in dist/assets/extra/ e aggiorna il manifest letto dal gioco.
// Uso: npm run assets
import fs from 'node:fs';
import path from 'node:path';
import { EXTRA_FILES } from '../dist/assets.js';

const ROOT = new URL('../dist/assets/extra/', import.meta.url).pathname;
const SPEC = {
 png: { size: [1536, 1536], alpha: true },
 'title-art.jpg': { size: [1920, 1080] },
 concert: { size: [1600, 600] }
};

function pngInfo(buf) {
 if (buf.readUInt32BE(0) !== 0x89504e47) return null;
 return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), alpha: buf[25] === 6 || buf[25] === 4 };
}
function jpgInfo(buf) {
 if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
 let i = 2;
 while (i < buf.length) {
  if (buf[i] !== 0xff) return null;
  const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
  if (marker >= 0xc0 && marker <= 0xc3) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
  i += 2 + len;
 }
 return null;
}

const present = [], problems = [], missing = [];
for (const file of Object.keys(EXTRA_FILES)) {
 const full = path.join(ROOT, file);
 if (!fs.existsSync(full)) { missing.push(file); continue; }
 const buf = fs.readFileSync(full);
 const info = file.endsWith('.png') ? pngInfo(buf) : jpgInfo(buf);
 if (!info) { problems.push(`${file}: formato non valido (serve ${file.endsWith('.png') ? 'PNG' : 'JPEG'})`); continue; }
 const spec = file.endsWith('.png') ? SPEC.png : file.startsWith('concert/') ? SPEC.concert : SPEC[file];
 const before = problems.length;
 if (spec.alpha && !info.alpha) problems.push(`${file}: manca la trasparenza (canale alfa)`);
 const ratio = info.w / info.h, want = spec.size[0] / spec.size[1];
 if (Math.abs(ratio - want) > .02) problems.push(`${file}: proporzioni ${info.w}×${info.h}, attese ${spec.size[0]}×${spec.size[1]}`);
 else if (info.w < spec.size[0] * .66) problems.push(`${file}: ${info.w}×${info.h} è troppo piccolo (consigliato ${spec.size[0]}×${spec.size[1]})`);
 if (problems.length === before) present.push(file);
}
fs.writeFileSync(path.join(ROOT, 'manifest.json'), JSON.stringify({ files: present }, null, 1) + '\n');
console.log(`Sprite extra trovati: ${present.length} / ${Object.keys(EXTRA_FILES).length}`);
for (const f of present) console.log('  ✓ ' + f);
if (problems.length) { console.log('\nDa correggere:'); for (const p of problems) console.log('  ✗ ' + p); }
if (missing.length) console.log('\nAncora mancanti (il gioco usa il disegno di riserva):\n  ' + missing.join('\n  '));
process.exitCode = problems.length ? 1 : 0;
