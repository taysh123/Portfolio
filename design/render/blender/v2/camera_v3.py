"""v3 camera: the same continuous, never-zooming move as camera_v2 (PCHIP over progress, C1, no overshoot), through
the v3 workstation: a room-wide establishing frame at standing eye height, a dolly to the workstation while the
lid opens, the laptop, and the push to the display. One 50 mm lens (look-dev lens test 45/50/55/65, 2026-10-07:
50 mm keeps the room and the desk in natural perspective; 65 mm flattens the depth the reference relies on)."""
import math

import camera_v2 as C2
from camera_v2 import NORMAL_EL, P_END, P_LID, P_WAKE, lid_deg, screen_level, screen_centre  # noqa: F401

LENS, FSTOP = 50.0, 5.6
# screen-filling distance at 50 mm with ~6% overscan: the display's half-width over tan(half horizontal FOV)
_END = 0.1723 / math.tan(math.atan(18.0 / LENS)) * 0.94

KEYS = {
    "landscape": [
        (0.00, 4.0, 7.5, 4.60, (0.25, 0.10, 0.12)),        # the room: shelves, desk, window, chair
        (0.12, 4.5, 8.5, 3.70, (0.20, 0.08, 0.10)),
        (0.25, 5.5, 11.0, 2.10, (0.05, 0.03, 0.09)),       # the workstation, lid opening
        (0.38, 3.5, 14.0, 1.30, "S"),                       # the laptop
        (0.53, 2.0, 15.5, 1.08, "S"),
        (0.68, 1.0, 16.5, 0.92, "S"),
        (0.80, 0.2, NORMAL_EL, 0.66, "S"),
        (0.88, 0.0, NORMAL_EL, _END, "S"),
    ],
    "portrait": [
        (0.00, 3.0, 9.0, 5.20, (0.10, 0.10, 0.20)),
        (0.12, 3.5, 10.0, 4.30, (0.08, 0.08, 0.16)),
        (0.25, 4.0, 13.0, 2.60, (0.02, 0.03, 0.10)),
        (0.38, 3.0, 16.0, 1.75, "S"),
        (0.53, 1.6, 17.0, 1.55, "S"),
        (0.68, 0.8, 17.5, 1.40, "S"),
        (0.80, 0.2, NORMAL_EL, 0.75, "S"),
        (0.88, 0.0, NORMAL_EL, 0.1077 / math.tan(math.atan(18.0 / LENS)) * 0.97, "S"),
    ],
}


def pose(p, kind="landscape"):
    return C2.pose(p, kind, keys=KEYS[kind], lens=LENS, fstop=FSTOP)
