"""Night Studio 2.0 (M10): screen textures for the About photograph, cut from the real captures and cropped to the part
of each product that tells its story, so the UI reads at that scale (the app zoomed to ~150%). Nothing is drawn.

Run: AEGIS_ORIG=<folder> python3 design/studio/prep_screens_b.py <build_dir>   (Pillow). Aegis comes from the owner's
original 3840x2160 PNG capture of its Incidents page, in the folder AEGIS_ORIG names: the full captures are not public
(see scripts/m10-images.mjs)."""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
AEG = os.environ.get("AEGIS_ORIG")
OUT = os.path.join(sys.argv[1], "tex"); os.makedirs(OUT, exist_ok=True)
def cap(rel): return Image.open(os.path.join(ROOT, "public", "projects", rel)).convert("RGB")
def rounded(im, f):
    r = round(min(im.size) * f); m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    o = Image.new("RGB", im.size, (0, 0, 0)); o.paste(im, (0, 0), m); return o
def crop_aspect(im, x0, y0, w, aspect):
    return im.crop((x0, y0, x0 + w, y0 + round(w / aspect)))
# Monitor 1 (16:9): Aegis's Incidents page — its head and the Open column's first incident, the site's one crop of the
# board (AEGIS_BOARD in data/images.ts). No other part of it: the other seeded incidents' titles are not borne out by
# their own alerts, and the Alerts page shows a placeholder agent ID.
if not AEG: sys.exit("set AEGIS_ORIG to the folder holding Aegis's 08-incident-kanban.png (3840x2160)")
a = Image.open(os.path.join(AEG, "08-incident-kanban.png")).convert("RGB")
crop_aspect(a, 492, 0, 1108, 16 / 9).resize((2560, 1440), Image.LANCZOS).save(os.path.join(OUT, "aegis.png"))
# Monitor 2 (1600:1027): DeveloperOS — the query and its first cited results (≈1.45× zoom).
d = cap("developeros/search-citations.webp")
crop_aspect(d, 0, 0, 1100, 1600 / 1027).resize((1600, 1027), Image.LANCZOS).save(os.path.join(OUT, "dos.png"))
# Phones: T Poker tournament clock (the app's most recognisable screen); GRAVITY FLOW gameplay, letterboxed as the game shows it.
rounded(cap("poker/tournament-live.webp").resize((860, 1864), Image.LANCZOS), 0.12).save(os.path.join(OUT, "poker.png"))
g = cap("gravity-flow/gameplay.webp"); ph = Image.new("RGB", (640, 1387), (0, 0, 0)); ph.paste(g, (0, (1387 - 1280) // 2))
rounded(ph, 0.12).save(os.path.join(OUT, "gravity.png"))
print("screens:", sorted(os.listdir(OUT)))
