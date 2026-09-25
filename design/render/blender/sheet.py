"""Side-by-side sheets for the look-dev gate (Plan 2 Task 8 Step 5). System Python + PIL.
Each row: final key frame | the matching Plan 1 preview frame (or the approved preview key) | prototype 2 (K0/K1/K2 only),
labelled with the key name and its audit result.
usage: python3 design/render/blender/sheet.py <keyframes_dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "..", "..", "docs", "superpowers", "specs", "assets")
APPROVED = {"K0": "2026-09-25-preview-K0.webp", "K1on": "2026-09-25-preview-K1.webp", "K2": "2026-09-25-preview-K2.webp"}
PROTO2 = "2026-09-25-render-spike-cyber-studio.webp"

kdir, out = sys.argv[1], sys.argv[2]
audit = json.load(open(os.path.join(kdir, "audit.json")))
TW = 640
rows = []
for key, res in audit.items():
    frame = res["frame"]; framing = "portrait" if "/portrait/" in frame else "landscape"
    name = os.path.basename(frame)[:-4]
    cells = [(f"FINAL {key}", frame)]
    if key in APPROVED:
        cells.append((f"approved preview {key}", os.path.join(ASSETS, APPROVED[key])))
    else:
        cells.append((f"Plan 1 preview {name}", os.path.join(HERE, "out", framing, name + ".png")))
    if key in ("K0", "K1on", "K2"):
        cells.append(("prototype 2", os.path.join(ASSETS, PROTO2)))
    verdict = "PASS" if not res["fails"] else "FAIL: " + "; ".join(res["fails"])
    rows.append((cells, verdict))


def thumb(p, w):
    if not os.path.exists(p):
        im = Image.new("RGB", (w, w * 9 // 16), (60, 20, 20)); ImageDraw.Draw(im).text((10, 10), "missing " + os.path.basename(p), fill=(255, 255, 255)); return im
    im = Image.open(p).convert("RGB"); return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


rendered = [([(label, thumb(p, TW)) for label, p in cells], v) for cells, v in rows]
H = sum(max(t.height for _, t in cells) + 44 for cells, _ in rendered) + 8
sheet = Image.new("RGB", (3 * (TW + 8) + 8, H), (32, 32, 32)); d = ImageDraw.Draw(sheet)
y = 8
for cells, verdict in rendered:
    d.text((8, y), verdict[:180], fill=(140, 230, 160) if verdict == "PASS" else (255, 150, 140))
    for i, (label, t) in enumerate(cells):
        x = 8 + i * (TW + 8)
        d.text((x, y + 16), label, fill=(230, 230, 230)); sheet.paste(t, (x, y + 32))
    y += max(t.height for _, t in cells) + 44
sheet.save(out); print(out, sheet.size)
