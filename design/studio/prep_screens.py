"""Screen textures for the studio scene, cut from the portfolio's own product captures (public/projects/**).
Nothing is drawn or invented: each capture is resized, and the phone captures get the device's rounded corners.

Run: python3 design/studio/prep_screens.py <build_dir>   (Pillow). Writes <build_dir>/tex/*.png.
"""
import os
import sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(sys.argv[1], "tex")
os.makedirs(OUT, exist_ok=True)


def cap(rel):
    return Image.open(os.path.join(ROOT, "public", "projects", rel)).convert("RGB")


def rounded(im, radius_frac):
    r = round(min(im.size) * radius_frac)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    out = Image.new("RGB", im.size, (0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


# Monitor 1 (27", 16:9): Aegis SOC overview.   Monitor 2 (16:10.3): DeveloperOS search with file:line citations.
cap("aegis/04-dashboard.webp").resize((2560, 1440), Image.LANCZOS).save(os.path.join(OUT, "aegis.png"))
cap("developeros/search-citations.webp").save(os.path.join(OUT, "dos.png"))  # 1600×1027, used at its own aspect
# Phones (9 : 19.5): T Poker home; GRAVITY FLOW gameplay is 1 : 2, letterboxed in black exactly as the game shows it.
rounded(cap("poker/home.webp").resize((860, 1864), Image.LANCZOS), 0.12).save(os.path.join(OUT, "poker.png"))
g = cap("gravity-flow/gameplay.webp")
phone = Image.new("RGB", (640, 1387), (0, 0, 0))
phone.paste(g, (0, (1387 - 1280) // 2))
rounded(phone, 0.12).save(os.path.join(OUT, "gravity.png"))
print("screens:", sorted(os.listdir(OUT)))
