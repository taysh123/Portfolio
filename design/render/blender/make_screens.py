"""Screen textures for the entrance — every value from real repo output at a snapshot.

Runs typecheck, lint, tests and build at HEAD; a ✓ row is drawn ONLY for a command
that exited 0. Writes out/strings.txt (every drawn string) and out/screens.json.
Run with the system Python 3 + Pillow: `npm run render:screens`.

The snapshot hash drawn on the screens is HEAD; the script refuses a tree with tracked changes,
so every exit code it draws belongs to that commit.
Per-project test counts come from data/projects.ts.
"""
import re
import subprocess
from PIL import Image, ImageDraw, ImageFont

R = __import__("os").path.abspath(__import__("os").path.dirname(__file__) + "/../../..") + "/"
H = __import__("os").path.dirname(__import__("os").path.abspath(__file__)) + "/out/"
FD = R + "node_modules/next/dist/next-devtools/server/font/"
SANS, MONO = FD + "geist-latin.woff2", FD + "geist-mono-latin.woff2"
BG, PANEL, LINE = (8, 11, 17), (13, 18, 27), (30, 40, 58)
FG, MUTED, ICE, CYAN = (226, 232, 242), (122, 136, 158), (91, 156, 255), (95, 214, 230)
import json, os
os.makedirs(H, exist_ok=True)
SNAP = subprocess.check_output(["git", "-C", R, "rev-parse", "--short", "HEAD"]).decode().strip()
BRANCH = subprocess.check_output(["git", "-C", R, "branch", "--show-current"]).decode().strip()


def run(name, cmd, log=None):
    p = subprocess.run(cmd, cwd=R, shell=True, capture_output=True, text=True)
    if log:
        open(H + log, "w").write(p.stdout + p.stderr)
    return p.returncode


if subprocess.run("git status --porcelain --untracked-files=no", cwd=R, shell=True, capture_output=True, text=True).stdout.strip():
    raise SystemExit("make_screens: tracked changes present; commit first so the drawn checks belong to HEAD")
EXIT = {"typecheck": run("typecheck", "npx tsc --noEmit"), "lint": run("lint", "npx eslint"),
        "tests": run("tests", "npx vitest run"), "build": run("build", "npx next build", "build.txt")}
HAS_TESTS = bool(subprocess.run("git ls-files 'tests/unit/*.test.ts'", cwd=R, shell=True, capture_output=True, text=True).stdout.strip())
CHECKS = [n for n in ("typecheck", "lint", "tests", "build") if EXIT[n] == 0 and (n != "tests" or HAS_TESTS)]
DRAWN = []
_orig_text = ImageDraw.ImageDraw.text


def _logged_text(self, xy, text, *a, **k):
    DRAWN.append(str(text))
    return _orig_text(self, xy, text, *a, **k)


ImageDraw.ImageDraw.text = _logged_text


def F(p, s):
    return ImageFont.truetype(p, s)


def check(d, x, y, s, col=CYAN):
    d.ellipse((x, y, x + s, y + s), outline=col, width=max(2, s // 10))
    d.line([(x + s * .28, y + s * .52), (x + s * .45, y + s * .68), (x + s * .74, y + s * .34)], fill=col, width=max(3, s // 8))


def header(d, W, word, sub):
    d.rectangle((0, 0, W, 170), fill=(11, 15, 23))
    d.rectangle((0, 168, W, 172), fill=ICE)
    d.text((60, 36), word, font=F(SANS, 104), fill=FG)
    d.text((W - 60 - d.textlength(sub, font=F(MONO, 30)), 72), sub, font=F(MONO, 30), fill=MUTED)


# ── LEFT: VERIFY (portrait 1440x2560) ────────────────────────────────────
W, Hh = 1440, 2560
im = Image.new("RGB", (W, Hh), BG); d = ImageDraw.Draw(im)
header(d, W, "VERIFY", f"@{SNAP}")
# CI checks — real exit codes at the snapshot
d.text((60, 230), "checks", font=F(MONO, 34), fill=MUTED)
for i, name in enumerate(CHECKS):
    y = 290 + i * 130
    d.rounded_rectangle((60, y, W - 60, y + 108), 18, fill=PANEL, outline=LINE, width=2)
    check(d, 90, y + 24, 60)
    d.text((180, y + 26), name, font=F(SANS, 54), fill=FG)
    d.text((W - 110 - d.textlength("passed", font=F(MONO, 34)), y + 36), "passed", font=F(MONO, 34), fill=CYAN)
# test suites per project — data/projects.ts
src = open(R + "data/projects.ts").read()
counts = [("T Poker", 892), ("DeveloperOS", 363), ("GRAVITY FLOW", 220), ("Job Assistant", 162), ("SentinelAI", 105)]
for name, n in counts:
    assert re.search(rf"(?<![\d,]){n}(?![\d,])", src), name  # provenance: every number appears in data/projects.ts as a whole number
y0 = 290 + len(CHECKS) * 130 + 40
d.text((60, y0), "test suites", font=F(MONO, 34), fill=MUTED)
mx = max(n for _, n in counts)
for i, (name, n) in enumerate(counts):
    y = y0 + 70 + i * 250
    d.rounded_rectangle((60, y, W - 60, y + 220), 20, fill=PANEL, outline=LINE, width=2)
    check(d, 92, y + 34, 56)
    d.text((176, y + 30), name, font=F(SANS, 58), fill=FG)
    t = f"{n} tests"
    d.text((W - 100 - d.textlength(t, font=F(MONO, 50)), y + 38), t, font=F(MONO, 50), fill=FG)
    bx0, bx1, by = 100, W - 100, y + 150
    d.rounded_rectangle((bx0, by, bx1, by + 26), 13, fill=(22, 30, 44))
    d.rounded_rectangle((bx0, by, bx0 + (bx1 - bx0) * n / mx, by + 26), 13, fill=ICE)
tot = sum(n for _, n in counts)
d.rounded_rectangle((60, Hh - 300, W - 60, Hh - 80), 22, fill=(12, 24, 44), outline=ICE, width=3)
d.text((110, Hh - 262), f"{tot:,}", font=F(SANS, 120), fill=FG)
d.text((110 + d.textlength(f"{tot:,}", font=F(SANS, 120)) + 30, Hh - 200), "tests across 5 projects", font=F(SANS, 48), fill=MUTED)
im.save(H + "screen_verify.png")

# ── CENTER: WRITE (2560x1440) — real source, big structure ───────────────
W, Hh = 2560, 1440
im = Image.new("RGB", (W, Hh), BG); d = ImageDraw.Draw(im)
header(d, W, "WRITE", f"{BRANCH}")
d.rectangle((0, 172, 420, Hh), fill=(10, 14, 21))
d.text((40, 200), "EXPLORER", font=F(MONO, 28), fill=MUTED)
files = subprocess.check_output(["git", "-C", R, "ls-files", "app", "components", "lib", "data"]).decode().split()
for i, p in enumerate(files[:40]):
    depth = p.count("/")
    d.text((40 + depth * 18, 250 + i * 29), p.split("/")[-1], font=F(SANS, 24), fill=(160, 172, 190) if "useFocusTrap" not in p else ICE)
d.rectangle((420, 172, W, 236), fill=(12, 17, 25))
d.rectangle((440, 180, 800, 236), fill=(18, 25, 37))
d.text((470, 192), "useFocusTrap.ts", font=F(SANS, 30), fill=FG)
kw = {"import", "from", "export", "function", "const", "let", "return", "if", "else", "type", "for", "of", "new", "true", "false", "null"}
code = open(R + "lib/useFocusTrap.ts").read().splitlines()
fm = F(MONO, 30)
for n, line in enumerate(code[:36]):
    y = 262 + n * 32
    d.text((450, y), f"{n + 1:>3}", font=fm, fill=(60, 70, 88))
    x = 530
    for tok in re.split(r"(\s+|[(){}\[\];,.=<>:])", line[:95]):
        if not tok:
            continue
        s = tok.strip()
        col = (200, 208, 220)
        if s in kw: col = ICE
        elif s.startswith(("//", "*", "/*")): col = (100, 112, 132)
        elif s[:1] in "\"'`": col = CYAN
        elif s[:1].isupper(): col = (127, 180, 255)
        d.text((x, y), tok, font=fm, fill=col)
        x += d.textlength(tok, font=fm)
d.rectangle((420, Hh - 60, W, Hh), fill=(14, 40, 90))
d.text((450, Hh - 48), f"{BRANCH}   TypeScript   UTF-8", font=F(MONO, 28), fill=FG)
im.save(H + "screen_write.png")

# ── RIGHT: BUILD (2560x1440) — real next build + git log ─────────────────
im = Image.new("RGB", (W, Hh), (6, 9, 14)); d = ImageDraw.Draw(im)
header(d, W, "BUILD", "next build · git")
fm = F("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 30)
d.rectangle((40, 210, 1260, Hh - 40), outline=LINE, width=2)
d.text((70, 225), "$ npx next build", font=fm, fill=ICE)
bl = [l.rstrip() for l in open(H + "build.txt").read().splitlines() if l.strip() and "Generating static pages using 3 workers (" not in l or "11/11" in l]
y = 280
for l in bl[:30]:
    col = CYAN if "✓" in l else (180, 192, 210)
    if "✓" in l:
        check(d, 70, y + 4, 28); l = l.replace("✓", " ")
    d.text((110, y), l[:62], font=fm, fill=col); y += 40
d.rectangle((1300, 210, W - 40, Hh - 40), outline=LINE, width=2)
d.text((1330, 225), "$ git log --oneline", font=fm, fill=ICE)
gl = subprocess.check_output(["git", "-C", R, "log", "--oneline", "-26"]).decode().splitlines()
for i, l in enumerate(gl):
    y = 280 + i * 42
    d.ellipse((1335, y + 12, 1351, y + 28), fill=ICE if i == 0 else (60, 80, 110))
    d.text((1370, y), l[:7], font=fm, fill=CYAN)
    d.text((1370 + 150, y), l[8:62], font=fm, fill=(180, 192, 210))
im.save(H + "screen_build.png")

# ── laptop proxy (boot + identity) ───────────────────────────────────────
W3, H3 = 2560, 1600
im = Image.new("RGB", (W3, H3), (5, 7, 10)); d = ImageDraw.Draw(im)
for i, t in enumerate(["> initializing portfolio...", "> loading projects...", "> ready."]):
    d.text((830, 380 + i * 76), t, font=F(MONO, 50), fill=(200, 212, 228))
t = "T A Y   S H O F E R"; f2 = F(SANS, 150)
d.text(((W3 - d.textlength(t, font=f2)) / 2, 760), t, font=f2, fill=(240, 244, 250))
t = "Software Developer"; f3 = F(SANS, 58)
d.text(((W3 - d.textlength(t, font=f3)) / 2, 970), t, font=f3, fill=(150, 162, 182))
im.save(H + "screen_laptop.png")

# ── macro pad glyph atlas (5x3 line icons) ───────────────────────────────
A = Image.new("RGB", (500, 300), (4, 6, 9)); d = ImageDraw.Draw(A)
for i in range(15):
    r, c = divmod(i, 5); cx, cy = 50 + c * 100, 50 + r * 100
    col = (140, 110, 255) if i == 7 else ICE
    k = i % 5
    if k == 0: d.polygon([(cx - 18, cy - 18), (cx + 20, cy), (cx - 18, cy + 18)], outline=col, width=4)
    elif k == 1: check(d, cx - 20, cy - 20, 40, col)
    elif k == 2: d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), outline=col, width=4); d.line((cx, cy - 26, cx, cy + 26), fill=col, width=4)
    elif k == 3: d.text((cx - 22, cy - 22), ">_", font=F(MONO, 36), fill=col)
    else: d.rectangle((cx - 18, cy - 14, cx + 18, cy + 14), outline=col, width=4)
A.save(H + "pad_atlas.png")
open(H + "strings.txt", "w").write("\n".join(DRAWN))
json.dump({"snapshot": SNAP, "checks": EXIT, "drawn_checks": CHECKS}, open(H + "screens.json", "w"))
print("textures ok", SNAP, BRANCH, "checks:", CHECKS)
