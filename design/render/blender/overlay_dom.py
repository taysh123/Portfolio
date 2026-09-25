"""Composite a real browser screenshot of the hero onto the K2 frame through its screen quad.
usage: python3 overlay_dom.py <k2.png> <k2.json> <hero.png> <out.png>"""
import json, sys
from PIL import Image

def coeffs(src, dst):
    # Solve the 8 perspective coefficients mapping dst→src (PIL's transform convention).
    import itertools
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; b += [u, v]
    n = 8; M = [row[:] + [bv] for row, bv in zip(A, b)]
    for c in range(n):                                   # Gaussian elimination, partial pivoting
        p = max(range(c, n), key=lambda r: abs(M[r][c])); M[c], M[p] = M[p], M[c]
        for r in range(n):
            if r != c:
                f = M[r][c] / M[c][c]; M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]
    return [M[i][n] / M[i][i] for i in range(n)]

k2, meta, hero, out = sys.argv[1:5]
base = Image.open(k2).convert("RGB"); W, H = base.size
q = json.load(open(meta))["quad"]
dst = [(p["x"] * W, p["y"] * H) for p in q]
h = Image.open(hero).convert("RGB"); hw, hh = h.size
src = [(0, 0), (hw, 0), (hw, hh), (0, hh)]
warped = h.transform((W, H), Image.PERSPECTIVE, coeffs(src, dst), Image.BICUBIC)
mask = Image.new("L", (hw, hh), 255).transform((W, H), Image.PERSPECTIVE, coeffs(src, dst), Image.BICUBIC)
base.paste(warped, (0, 0), mask); base.save(out); print(out)
