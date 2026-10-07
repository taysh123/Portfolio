"""Physical dimensions of the v2 hero laptop (metres). A generic 16-inch aluminium notebook at real scale:
356 × 248 × 16.8 mm, 19.05 mm key pitch, 16:10 display. Pure data — shared by the bpy scene and the
Pillow texture generator, and unit-tested for the 16:10 screen the DOM hand-off depends on."""

BW, BD = 0.3557, 0.2481          # base footprint
FOOT = 0.0012                    # rubber feet: the base floats 1.2 mm above the desk
BT = 0.0103                      # base thickness (aluminium unibody)
LT = 0.0062                      # lid thickness (aluminium shell)
GAP = 0.0004                     # closed-lid gap above the deck
BASE_TOP = FOOT + BT             # z of the deck surface
R_PLAN = 0.0105                  # plan-view corner radius of base and lid
R_TOP = 0.0011                   # deck's outer top edge: a small, crisp radius that catches a highlight
R_BOT = 0.0042                   # base's underside edge: a generous curve
R_LID_OUT = 0.0026               # lid back (outer) edges
R_LID_IN = 0.0009                # lid front (glass side) edges

HINGE_Y = BD / 2 - 0.0058        # hinge axis, measured from the base centre toward the back
HINGE_Z = BASE_TOP + 0.0002

LD = 0.2468                      # lid depth (hinge to top edge)
SCREEN_W, SCREEN_H = 0.3447, 0.3447 / 1.6        # 16:10 active area (16.2" diagonal)
BEZEL_TOP = 0.0082               # from the lid's top edge to the active area
BEZEL_SIDE = (BW - SCREEN_W) / 2
CHIN = LD - BEZEL_TOP - SCREEN_H                  # from the active area to the hinge

KEY_U = 0.01905                  # key pitch
KEY_GAP = 0.0026                 # cap-to-cap gap
KEY_H = 0.0011                   # cap thickness
WELL_DEPTH = 0.0007              # keyboard well below the deck
KB_BACK = BD / 2 - 0.0125        # back edge of the keyboard's top row
KEY_ROWS = [
    [(1.5, "esc")] + [(1.0, "")] * 12 + [(1.0, "")],
    [(1.0, "`"), (1.0, "1"), (1.0, "2"), (1.0, "3"), (1.0, "4"), (1.0, "5"), (1.0, "6"), (1.0, "7"), (1.0, "8"), (1.0, "9"), (1.0, "0"), (1.0, "-"), (1.0, "="), (1.5, "delete")],
    [(1.5, "tab"), (1.0, "Q"), (1.0, "W"), (1.0, "E"), (1.0, "R"), (1.0, "T"), (1.0, "Y"), (1.0, "U"), (1.0, "I"), (1.0, "O"), (1.0, "P"), (1.0, "["), (1.0, "]"), (1.0, "\\")],
    [(1.8, "caps"), (1.0, "A"), (1.0, "S"), (1.0, "D"), (1.0, "F"), (1.0, "G"), (1.0, "H"), (1.0, "J"), (1.0, "K"), (1.0, "L"), (1.0, ";"), (1.0, "'"), (1.7, "return")],
    [(2.3, "shift"), (1.0, "Z"), (1.0, "X"), (1.0, "C"), (1.0, "V"), (1.0, "B"), (1.0, "N"), (1.0, "M"), (1.0, ","), (1.0, "."), (1.0, "/"), (2.2, "shift")],
    [(1.0, "fn"), (1.0, "ctrl"), (1.0, "opt"), (1.25, "cmd"), (5.0, " "), (1.25, "cmd"), (1.0, "opt"), (1.0, "◀"), (1.0, "▲"), (0.0, "▼"), (1.0, "▶")],
]
KB_W = 14.5 * KEY_U
KB_D = len(KEY_ROWS) * KEY_U
WELL = {"w": KB_W + 0.0034, "d": KB_D + 0.0034, "r": 0.0032, "y": KB_BACK - KB_D / 2}

TRACKPAD = {"w": 0.1600, "d": 0.0950, "r": 0.0062, "y": KB_BACK - KB_D - 0.0105 - 0.0950 / 2, "gap": 0.0003}
GRILLE = {"x_in": KB_W / 2 + 0.0085, "x_out": BW / 2 - 0.0125, "y0": KB_BACK - KB_D + 0.002, "y1": KB_BACK - 0.002}


def key_layout():
    """[(x_centre, y_centre, w, h, legend)] in deck metres, from laptop_spec.KEY_ROWS."""
    out = []
    for r, row in enumerate(KEY_ROWS):
        total = sum(u for u, _ in row) * KEY_U
        x = -total / 2
        yc = KB_BACK - KEY_U / 2 - r * KEY_U
        for u, legend in row:
            if legend == "▼":
                continue                        # drawn with ▲: the half-height pair shares one cell
            if legend == "▲":
                w, h = u * KEY_U - KEY_GAP, KEY_U / 2 - KEY_GAP * 0.75
                out.append((x + u * KEY_U / 2, yc + KEY_U / 4, w, h, "▲"))
                out.append((x + u * KEY_U / 2, yc - KEY_U / 4, w, h, "▼"))
            else:
                out.append((x + u * KEY_U / 2, yc, u * KEY_U - KEY_GAP, KEY_U - KEY_GAP, legend))
            x += u * KEY_U
    return out
