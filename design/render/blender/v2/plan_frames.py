"""Choose the progress values to render: equal on-screen motion per frame, not equal steps in p.

The image changes at very different rates through the film (a slow drift at the start, the lid sweeping up, the
final push filling the frame). Uniform steps in p would waste frames where little moves and leave visible jumps
where a lot does. Here the screen-space motion of a set of tracked points (laptop corners, lid corners, the
display's corners) is integrated over p, and frames are placed at equal increments of that motion, with a cap on
the gap in p so slow passages still get frames.
usage: python3 plan_frames.py KIND MAX_PX [WIDTH] > plan.json   (pure Python; no bpy)
"""
import json
import math
import sys

import camera_v2 as C
from laptop_spec import BW, BD, BASE_TOP, HINGE_Y, HINGE_Z, LD, GAP


def look_at(cam, tgt):
    f = [t - c for t, c in zip(tgt, cam)]
    n = math.sqrt(sum(x * x for x in f)); f = [x / n for x in f]
    up = (0.0, 0.0, 1.0)
    r = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]]
    n = math.sqrt(sum(x * x for x in r)); r = [x / n for x in r]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    return f, r, u


def project(pt, pose, kind, width):
    f, r, u = look_at(pose["cam"], pose["target"])
    d = [p - c for p, c in zip(pt, pose["cam"])]
    z = sum(a * b for a, b in zip(d, f))
    if z <= 1e-4:
        return None
    x, y = sum(a * b for a, b in zip(d, r)), sum(a * b for a, b in zip(d, u))
    sensor = 36.0
    # horizontal fit (landscape) / vertical fit (portrait): both normalise the 36 mm side to the long image side
    scale = C.LENS / sensor * (width if kind == "landscape" else width * 16 / 9)
    return (x / z * scale, y / z * scale)


def points(lid):
    pts = [(sx * BW / 2, sy * BD / 2, BASE_TOP) for sx in (-1, 1) for sy in (-1, 1)]
    a = math.radians(-lid)
    for sx in (-1, 1):
        for yl in (0.0, -LD):
            zl = GAP + 0.003
            pts.append((sx * BW / 2, HINGE_Y + yl * math.cos(a) - zl * math.sin(a), HINGE_Z + yl * math.sin(a) + zl * math.cos(a)))
    return pts


def motion(p0, p1, kind, width):
    a, b = C.pose(p0, kind), C.pose(p1, kind)
    pa, pb = points(a["lid_deg"]), points(b["lid_deg"])
    m = 0.0
    hw = width / 2
    hh = (width * 9 / 16 if kind == "landscape" else width * 16 / 9) / 2
    inside = lambda q: abs(q[0]) <= hw * 1.05 and abs(q[1]) <= hh * 1.05
    for x, y in zip(pa, pb):
        u, v = project(x, a, kind, width), project(y, b, kind, width)
        if u and v and (inside(u) or inside(v)):          # only what the viewer can see moves the picture
            m = max(m, math.hypot(u[0] - v[0], u[1] - v[1]))
    # the display's own corners leave the frame in the push: track its centre and edge midpoints too
    from laptop_spec import SCREEN_W, SCREEN_H
    c = C.screen_centre()
    if b["lid_deg"] > 100:
        for dx, dz in ((0, 0), (-0.25, 0), (0.25, 0), (0, 0.25), (0, -0.25)):
            # points on the display plane: x across, "up" along the tilted lid
            t = (0.0, math.cos(math.radians(LID_TILT)), math.sin(math.radians(LID_TILT)))
            pt = (c[0] + dx * SCREEN_W, c[1] + dz * SCREEN_H * t[1] * -1, c[2] + dz * SCREEN_H * t[2])
            u, v = project(pt, a, kind, width), project(pt, b, kind, width)
            if u and v and (inside(u) or inside(v)):
                m = max(m, math.hypot(u[0] - v[0], u[1] - v[1]))
    return m


LID_TILT = 72.0   # the open display's plane is 18° past vertical: its "up" direction rises 72° from horizontal


def plan(kind, max_px, width, p_end=C.P_END, max_dp=0.012, steps=4000):
    ps = [p_end * i / steps for i in range(steps + 1)]
    cum = [0.0]
    for i in range(steps):
        cum.append(cum[-1] + motion(ps[i], ps[i + 1], kind, width))
    total = cum[-1]
    out, last = [0.0], 0.0
    i = 0
    while True:
        # next sample: where accumulated motion since the last frame reaches max_px, or the p gap reaches max_dp
        j = i
        while j < steps and cum[j + 1] - cum[i] < max_px and ps[j + 1] - ps[i] < max_dp:
            j += 1
        j = max(j, i + 1)
        if j >= steps:
            break
        out.append(round(ps[j], 6)); i = j
    if out[-1] < p_end:
        out.append(p_end)
    # the display's wake ramp (DOM fade-in) and the identity beat get an exact frame each
    for k in (C.P_WAKE[0], C.P_WAKE[1], 0.53, 0.68):
        if all(abs(k - p) > 1e-6 for p in out):
            out.append(k)
    out.sort()
    return {"kind": kind, "max_px": max_px, "width": width, "total_px": round(total, 1), "p": out}


if __name__ == "__main__":
    kind, mpx = sys.argv[1], float(sys.argv[2])
    w = int(sys.argv[3]) if len(sys.argv) > 3 else (1920 if kind == "landscape" else 1080)
    r = plan(kind, mpx, w)
    print(json.dumps(r))
    print(kind, "frames", len(r["p"]), "total motion px", r["total_px"], file=sys.stderr)
