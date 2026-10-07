"""v2 camera and lid choreography as continuous functions of entrance progress p (pure Python, no bpy).

One camera, one lens (65 mm), never zooming and never stopping: the move is an orbit-and-dolly around a target
that itself travels from the closed lid to the display, interpolated in spherical parameters (azimuth, elevation,
distance, target) with monotone cubic Hermite splines (PCHIP) over p. PCHIP is C1 — velocity is continuous
through every key, so constant-speed scrolling never produces a lurch — and never overshoots, so the camera never
floats past a key and drifts back.

The lid follows a hand-opening profile: a short ease-in as the lid is lifted off the magnets, a long
deceleration into the hinge's friction stop. The display wakes after the lid comes to rest.
"""
import math

LENS = 65.0
FSTOP = 5.6
LID_OPEN = 108.0
P_LID = (0.12, 0.36)               # lid travel (BEATS.lid is 0.12–0.38: the last 0.02 is the settle)
P_WAKE = (0.38, 0.42)              # backlight ramps up (the DOM surface fades in over the same span)
P_END = 0.88                       # camera reaches the display (BEATS.push end)

# screen geometry when open (laptop_spec, lid at 108°): centre and outward normal, world metres
_SCREEN_C = None


def screen_centre():
    """Active-area centre of the open display (laptop_spec numbers, lid at LID_OPEN)."""
    global _SCREEN_C
    if _SCREEN_C is None:
        from laptop_spec import HINGE_Y, HINGE_Z, LD, BEZEL_TOP, SCREEN_H, GAP
        yl = -LD + 0.0058 + BEZEL_TOP + SCREEN_H / 2       # in the pivot frame (closed): toward -y
        zl = GAP - 0.00025
        a = math.radians(-LID_OPEN)
        y = yl * math.cos(a) - zl * math.sin(a)
        z = yl * math.sin(a) + zl * math.cos(a)
        _SCREEN_C = (0.0, HINGE_Y + y, HINGE_Z + z)
    return _SCREEN_C


def screen_normal():
    a = math.radians(LID_OPEN)
    return (0.0, -math.sin(a), -math.cos(a))


NORMAL_EL = math.degrees(math.asin(screen_normal()[2]))          # 18°: the display tilts back

# Keys: p → (azimuth°, elevation°, distance m, target xyz). Azimuth 0 looks straight at the display along -y;
# positive azimuth puts the camera to the viewer's left. "S" in a target means the open display's centre.
KEYS = {
    "landscape": [
        (0.00, 31.0, 31.0, 1.36, (0.000, 0.010, 0.020)),
        (0.12, 27.0, 28.5, 1.26, (0.000, 0.020, 0.035)),
        (0.25, 18.0, 24.0, 1.20, (0.000, 0.060, 0.095)),
        (0.38, 9.0, 20.0, 1.08, "S"),
        (0.53, 4.5, 18.8, 0.96, "S"),
        (0.68, 1.8, 18.3, 0.85, "S"),
        (0.80, 0.4, NORMAL_EL, 0.66, "S"),
        (0.88, 0.0, NORMAL_EL, 0.555, "S"),
    ],
    "portrait": [
        # the display stays whole in the narrow frame (≤ 90% of its width) until the push begins
        (0.00, 20.0, 38.0, 1.72, (0.000, 0.010, 0.020)),
        (0.12, 18.0, 35.0, 1.64, (0.000, 0.020, 0.040)),
        (0.25, 11.0, 28.0, 1.55, (0.000, 0.060, 0.100)),
        (0.38, 5.0, 22.0, 1.45, "S"),
        (0.53, 2.5, 20.0, 1.33, "S"),
        (0.68, 1.0, 19.0, 1.22, "S"),
        (0.80, 0.2, NORMAL_EL, 0.62, "S"),
        (0.88, 0.0, NORMAL_EL, 0.374, "S"),
    ],
}


def _pchip_slopes(x, y):
    n = len(x)
    h = [x[i + 1] - x[i] for i in range(n - 1)]
    d = [(y[i + 1] - y[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n
    for i in range(1, n - 1):
        if d[i - 1] * d[i] <= 0:
            m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    # ends: the camera starts and finishes its move with zero velocity only where the film starts/ends
    m[0] = d[0] if n > 1 else 0.0
    m[-1] = 0.0
    return m


def pchip(x, y, t):
    if t <= x[0]:
        return y[0]
    if t >= x[-1]:
        return y[-1]
    m = _pchip_slopes(x, y)
    i = max(k for k in range(len(x) - 1) if x[k] <= t)
    h = x[i + 1] - x[i]
    s = (t - x[i]) / h
    h00, h10, h01, h11 = 2 * s ** 3 - 3 * s ** 2 + 1, s ** 3 - 2 * s ** 2 + s, -2 * s ** 3 + 3 * s ** 2, s ** 3 - s ** 2
    return h00 * y[i] + h10 * h * m[i] + h01 * y[i + 1] + h11 * h * m[i + 1]


def _target(t):
    return screen_centre() if t == "S" else t


def lid_deg(p):
    """Hand-opening profile over P_LID: ease-in over the first ~15%, then a long deceleration."""
    a, b = P_LID
    if p <= a:
        return 0.0
    if p >= b:
        return LID_OPEN
    t = (p - a) / (b - a)
    # 1 − (1 − t^1.6)^2.4: zero velocity at both ends (C1), a soft lift-off and a long friction-hinge settle
    return LID_OPEN * (1 - (1 - t ** 1.6) ** 2.4)


def screen_level(p):
    """Display backlight 0–1: off until the lid has settled, then a soft wake ramp."""
    a, b = P_WAKE
    if p <= a:
        return 0.0
    if p >= b:
        return 1.0
    t = (p - a) / (b - a)
    return t * t * (3 - 2 * t)


def pose(p, kind="landscape", keys=None, lens=None, fstop=None):
    """→ {cam, target, lens, fstop, focus, lid_deg, screen}"""
    keys = keys or KEYS[kind]
    xs = [k[0] for k in keys]
    az = pchip(xs, [k[1] for k in keys], p)
    el = pchip(xs, [k[2] for k in keys], p)
    di = pchip(xs, [k[3] for k in keys], p)
    tg = [pchip(xs, [_target(k[4])[i] for k in keys], p) for i in range(3)]
    a, e = math.radians(az), math.radians(el)
    d = (-math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))
    cam = tuple(tg[i] + d[i] * di for i in range(3))
    return {"cam": cam, "target": tuple(tg), "lens": lens or LENS, "fstop": fstop or FSTOP, "focus": tuple(tg), "lid_deg": lid_deg(p),
            "screen": screen_level(p), "az": az, "el": el, "dist": di}
