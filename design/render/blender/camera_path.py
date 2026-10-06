"""Camera and lid keyframes for the entrance, and their interpolation.

Pure Python (no bpy) so it is unit-tested with the system interpreter. Keys
are the approved preview key frames (spec §4.6; design/render/blender/preview).
"""
import math

SCREEN_CENTRE = (0.0, 0.181, 0.150)          # open lid (108°), world metres
NORMAL = (0.0, -math.sin(math.radians(108)), -math.cos(math.radians(108)))


def _on_normal(d, dz=0.0, dx=0.0):
    """A point d metres out along the open screen's normal, optionally offset."""
    cx, cy, cz = SCREEN_CENTRE
    nx, ny, nz = NORMAL
    return (cx + nx * d + dx, cy + ny * d, cz + nz * d + dz)


LANDSCAPE = {
    "K0": {"cam": (-0.34, -0.70, 0.38), "target": (0.07, 0.36, 0.17), "lens": 25, "fstop": 4.0, "focus": (0.0, -0.05, 0.02)},
    "K1": {"cam": (-0.22, -0.70, 0.34), "target": (0.04, 0.26, 0.15), "lens": 30, "fstop": 3.2, "focus": SCREEN_CENTRE},
    "K2": {"cam": _on_normal(0.88, dz=-0.07, dx=0.06), "target": (0.0, 0.181, 0.115), "lens": 50, "fstop": 2.0, "focus": SCREEN_CENTRE},
    "END": {"cam": _on_normal(0.53), "target": SCREEN_CENTRE, "lens": 50, "fstop": 2.0, "focus": SCREEN_CENTRE},
}
PORTRAIT = {
    "K0": {"cam": (0.0, -1.30, 0.46), "target": (0.02, 0.30, 0.22), "lens": 32, "fstop": 3.5, "focus": (0.0, -0.05, 0.02)},
    "K1": {"cam": (0.0, -0.80, 0.33), "target": (0.0, 0.20, 0.15), "lens": 38, "fstop": 3.2, "focus": SCREEN_CENTRE},
    "K2": {"cam": _on_normal(1.0), "target": SCREEN_CENTRE, "lens": 40, "fstop": 2.0, "focus": SCREEN_CENTRE},
    "END": {"cam": _on_normal(0.76), "target": SCREEN_CENTRE, "lens": 40, "fstop": 2.0, "focus": SCREEN_CENTRE},
}


def _ease_in_out(t):
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def _build(kind, n_lid, n_push, crack_hold):
    seq = []
    for i in range(n_lid):
        seq.append({"shot": "lid", "name": f"lid-{i:02d}", "i": i, "n": n_lid, "hold": crack_hold,
                    "p": 0.12 + 0.26 * i / (n_lid - 1)})
    seq.append({"shot": "wake", "name": "k1-on", "p": 0.53})
    for j in range(n_push):
        seq.append({"shot": "push", "name": f"push-{j:02d}", "j": j, "n": n_push, "p": 0.68 + 0.20 * j / (n_push - 1)})
    return seq


SEQUENCE = {"landscape": _build("landscape", 36, 28, 5), "portrait": _build("portrait", 16, 12, 3)}


def _lerp(a, b, t):
    if isinstance(a, tuple):
        return tuple(x + (y - x) * t for x, y in zip(a, b))
    return a + (b - a) * t


def _mix(k_a, k_b, t):
    return {k: _lerp(k_a[k], k_b[k], t) for k in k_a}


def frame_state(step, keys):
    """-> {cam, target, lens, fstop, focus, lid_deg, screen_on}."""
    if step["shot"] == "lid":
        i, n, hold = step["i"], step["n"], step["hold"]
        if i < hold:
            cam, lid = dict(keys["K0"]), 15.0 * i / max(hold - 1, 1) if i else 0.0
        else:
            t = _ease_in_out((i - hold + 1) / (n - hold))
            cam, lid = _mix(keys["K0"], keys["K1"], t), 15.0 + (108.0 - 15.0) * t
        return {**cam, "lid_deg": round(lid, 6), "screen_on": False}
    if step["shot"] == "wake":
        return {**keys["K1"], "lid_deg": 108.0, "screen_on": True}
    j, n = step["j"], step["n"]
    split = round(n * 0.64)                       # K1 → K2 (hero), then K2 → END
    if j < split:
        cam = _mix(keys["K1"], keys["K2"], _ease_in_out(j / (split - 1)))
    else:
        t = (j - split + 1) / (n - split)
        cam = _mix(keys["K2"], keys["END"], 1 - (1 - t) ** 3)
    return {**cam, "lid_deg": 108.0, "screen_on": True}


def screen_faces_camera(lid_deg, cam):
    """True when the laptop screen's front face points at the camera."""
    a = math.radians(lid_deg)
    n = (0.0, -math.sin(a), -math.cos(a))
    hinge = (0.0, 0.1385, 0.019)
    v = tuple(c - h for c, h in zip(cam, hinge))
    return sum(x * y for x, y in zip(n, v)) > 0 and lid_deg > 1.0
