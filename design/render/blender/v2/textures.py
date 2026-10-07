"""Procedural textures for the v2 laptop (system Python + Pillow; no bpy).

One RGBA atlas in the laptop deck's planar coordinates (top view, x left→right, y front→back), shared by the
deck and the keycaps so the speaker perforation and the key legends line up with the geometry exactly:
  R  speaker perforation (1 = hole)
  G  key legends (1 = glyph)
  B  unused (0)
  A  255
usage: python3 textures.py OUT_DIR
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from laptop_spec import BW, BD, GRILLE, key_layout  # noqa: E402

PX_PER_M = 11500                        # 0.087 mm per pixel: a 0.6 mm hole is ~7 px across
W, H = round(BW * PX_PER_M), round(BD * PX_PER_M)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def to_px(x, y):
    """Deck coordinates (metres, origin at the deck centre, +y toward the hinge) → image pixels (origin top-left,
    image top = hinge side)."""
    return (x + BW / 2) * PX_PER_M, (BD / 2 - y) * PX_PER_M


def main(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    R = Image.new("L", (W, H), 0)
    G = Image.new("L", (W, H), 0)
    dr, dg = ImageDraw.Draw(R), ImageDraw.Draw(G)
    # Speaker perforation: a hex-offset grid of 0.55 mm holes at 1.05 mm pitch in each grille field.
    pitch, rad = 0.00105, 0.000275
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * GRILLE["x_in"], sgn * GRILLE["x_out"]))
        y0, y1 = GRILLE["y0"], GRILLE["y1"]
        j = 0
        y = y0 + pitch / 2
        while y < y1:
            x = x0 + pitch / 2 + (pitch / 2 if j % 2 else 0)
            while x < x1:
                px, py = to_px(x, y)
                rp = rad * PX_PER_M
                dr.ellipse((px - rp, py - rp, px + rp, py + rp), fill=255)
                x += pitch
            y += pitch * 0.866
            j += 1
    # Key legends: small, centred (letters), or bottom-left (modifiers), like a real keyboard.
    for x, y, w, h, legend in key_layout():
        if not legend or legend == " ":
            continue
        cx, cy = to_px(x, y)
        small = len(legend) > 1
        size = round((0.0032 if small else 0.0046) * PX_PER_M)
        f = ImageFont.truetype(FONT, size)
        if small:
            px, py = to_px(x - w / 2 + 0.0016, y - h / 2 + 0.0016)
            dg.text((px, py), legend, font=f, fill=255, anchor="ld")
        else:
            dg.text((cx, cy), legend, font=f, fill=255, anchor="mm")
    img = Image.merge("RGBA", (R, G, Image.new("L", (W, H), 0), Image.new("L", (W, H), 255)))
    img.save(os.path.join(out_dir, "deck_atlas.png"))
    json.dump({"px_per_m": PX_PER_M, "w": W, "h": H}, open(os.path.join(out_dir, "deck_atlas.json"), "w"))
    print("deck_atlas", W, H)




def skyline(out_dir, seed=11):
    """A distant city at blue hour: dark massing (alpha) with a sparse scatter of lit windows (RGB, linear-ish).
    Seen only far out of focus through the window, where each lit window becomes a soft point of light."""
    import random
    rnd = random.Random(seed)
    Wd, Hd = 4096, 1024
    rgb = Image.new("RGB", (Wd, Hd), (0, 0, 0))
    a = Image.new("L", (Wd, Hd), 0)
    dr, da = ImageDraw.Draw(rgb), ImageDraw.Draw(a)
    x = 0
    while x < Wd:
        bw = rnd.randint(60, 260)
        bh = int(Hd * (0.25 + 0.65 * rnd.random() ** 1.6))
        da.rectangle((x, Hd - bh, x + bw, Hd), fill=255)
        # lit windows: a grid, sparsely on (night), mostly warm, some cool office white
        for wy in range(Hd - bh + 14, Hd - 6, 22):
            for wx in range(x + 8, x + bw - 8, 18):
                if rnd.random() < 0.05:
                    warm = rnd.random() < 0.7
                    c = (255, 190, 120) if warm else (200, 220, 255)
                    k = 0.5 + 0.5 * rnd.random()
                    dr.rectangle((wx, wy, wx + 8, wy + 10), fill=tuple(int(v * k) for v in c))
        x += bw + rnd.randint(-20, 30)
    Image.merge("RGBA", (*rgb.split(), a)).save(os.path.join(out_dir, "skyline.png"))
    print("skyline", Wd, Hd)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "tex")
    main(out)
    skyline(out)
