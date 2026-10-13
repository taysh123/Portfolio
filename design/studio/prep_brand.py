"""Prepares the T Poker plaque artwork from the owner's original files — never redrawn, only cropped and keyed.

  brand/src/tpoker-app-icon-1024.webp   the official app icon (transparent PNG-in-WebP) → cropped to its alpha bounds
  brand/src/tpoker-banner-1024x500.png  the official banner → the "T POKER" wordmark cut out of it: the navy gradient
                                        behind the letters is estimated and removed, so the letters keep their exact
                                        shapes, anti-aliasing and gold, on a transparent background

Run: python3 design/studio/prep_brand.py   (Pillow). Writes brand/tpoker-icon.png and brand/tpoker-wordmark.png.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = os.path.join(HERE, "brand", "src"), os.path.join(HERE, "brand")

icon = Image.open(os.path.join(SRC, "tpoker-app-icon-1024.webp")).convert("RGBA")
icon.crop(icon.getchannel("A").getbbox()).save(os.path.join(OUT, "tpoker-icon.png"))

banner = Image.open(os.path.join(SRC, "tpoker-banner-1024x500.png")).convert("RGB")
# The wordmark's measured bounds in the banner (gold pixels: R > 150, R - B > 60, x > 380): (415, 182)–(823, 244).
PAD = 10
x0, y0, x1, y1 = 415 - PAD, 182 - PAD, 823 + PAD, 244 + PAD
crop = banner.crop((x0, y0, x1 + 1, y1 + 1))
w, h = crop.size
# The background is a smooth navy gradient: estimate it bilinearly from the four corners of the padded box.
corners = [crop.getpixel((1, 1)), crop.getpixel((w - 2, 1)), crop.getpixel((1, h - 2)), crop.getpixel((w - 2, h - 2))]
GOLD_R = 232                       # the letters' solid red channel (sampled from a stem)
out = Image.new("RGBA", (w, h))
px, po = crop.load(), out.load()
for y in range(h):
    v = y / (h - 1)
    for x in range(w):
        u = x / (w - 1)
        bg = [(1 - u) * (1 - v) * corners[0][c] + u * (1 - v) * corners[1][c] + (1 - u) * v * corners[2][c] + u * v * corners[3][c] for c in range(3)]
        p = px[x, y]
        a = max(0.0, min(1.0, (p[0] - bg[0]) / (GOLD_R - bg[0])))
        if a < 0.02:
            po[x, y] = (0, 0, 0, 0); continue
        col = tuple(max(0, min(255, round((p[c] - bg[c] * (1 - a)) / a))) for c in range(3))
        po[x, y] = (*col, round(a * 255))
out.crop(out.getchannel("A").getbbox()).save(os.path.join(OUT, "tpoker-wordmark.png"))
print("icon", Image.open(os.path.join(OUT, "tpoker-icon.png")).size, "wordmark", Image.open(os.path.join(OUT, "tpoker-wordmark.png")).size)
