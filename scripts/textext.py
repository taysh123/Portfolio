# usage: python3 scripts/textext.py <image> <x0> <x1> [threshold] — for each text line (row band), the rightmost x (within x0..x1)
# where a pixel differs from that row's median by more than threshold. Pure PIL. Used to place the crop edges in
# scripts/m10-images.mjs where no line of text crosses them.
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("L"); W, H = im.size; px = im.load()
x0, x1 = int(sys.argv[2]), int(sys.argv[3]); th = int(sys.argv[4]) if len(sys.argv) > 4 else 45
right = []
for y in range(H):
    row = [px[x, y] for x in range(x0, x1, 2)]
    med = sorted(row)[len(row) // 2]
    xs = [x0 + 2 * i for i, v in enumerate(row) if abs(v - med) > th]
    right.append((max(xs) if xs else -1, min(xs) if xs else -1, len(xs)))
start = None
for y in range(H + 1):
    on = y < H and right[y][2] > 2 and right[y][2] < (x1 - x0) // 4   # text-like, not a full-width border line
    if on and start is None: start = y
    if not on and start is not None:
        if y - start > 5: print(f"y {start:4d}-{y:4d}  x {min(r[1] for r in right[start:y] if r[1]>=0):5d} .. {max(r[0] for r in right[start:y]):5d}")
        start = None
