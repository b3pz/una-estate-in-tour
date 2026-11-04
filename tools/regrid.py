# Uso: python3 tools/regrid.py tavola-di-chatgpt.png dist/assets/extra/nome.png
# Ricompone una tavola 4x4 in 1536x1536. Le figure sono trovate come macchie non trasparenti
# e assegnate alla cella in cui cade il loro centro, anche se sconfinano: nulla viene tagliato.
import sys
from PIL import Image
from collections import deque
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
W, H = im.size
k = 4  # griglia ridotta per trovare le macchie
sw, sh = W // k, H // k
a = im.getchannel('A').resize((sw, sh), Image.BOX).load()
seen = [[False] * sw for _ in range(sh)]
blobs = []
for y in range(sh):
    for x in range(sw):
        if seen[y][x] or a[x, y] <= 20: continue
        q = deque([(x, y)]); seen[y][x] = True; x0 = x1 = x; y0 = y1 = y; n = 0
        while q:
            cx, cy = q.popleft(); n += 1
            x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
            for dx in (-2, -1, 0, 1, 2):
                for dy in (-2, -1, 0, 1, 2):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < sw and 0 <= ny < sh and not seen[ny][nx] and a[nx, ny] > 20:
                        seen[ny][nx] = True; q.append((nx, ny))
        if n >= 6: blobs.append((x0 * k, y0 * k, (x1 + 1) * k, (y1 + 1) * k, n))
cells = {}
for x0, y0, x1, y1, n in blobs:
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    key = (min(3, int(cy / (H / 4))), min(3, int(cx / (W / 4))))
    b = cells.get(key)
    cells[key] = (x0, y0, x1, y1) if not b else (min(b[0], x0), min(b[1], y0), max(b[2], x1), max(b[3], y1))
crops = {key: im.crop(b) for key, b in cells.items()}
for key, c in list(crops.items()):
    bb = c.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    crops[key] = c.crop(bb)
CELL, M = 384, 20
scale = min(min((CELL - 2 * M) / s.width, (CELL - 2 * M) / s.height) for s in crops.values())
out = Image.new('RGBA', (1536, 1536), (0, 0, 0, 0))
for (r, c), s in crops.items():
    t = s.resize((max(1, round(s.width * scale)), max(1, round(s.height * scale))), Image.LANCZOS)
    out.paste(t, (c * CELL + (CELL - t.width) // 2, r * CELL + CELL - M - t.height), t)
out.save(dst, optimize=True)
print(src.split('/')[-1], '->', dst.split('/')[-1], 'scala', round(scale, 2), 'celle', sorted(crops))
