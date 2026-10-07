"""v2 choreography invariants (system Python: python3 -m unittest discover -s design/render/blender/v2)."""
import math
import unittest

import camera_v2 as C
import plan_frames as P
from laptop_spec import SCREEN_W, SCREEN_H, key_layout, KEY_ROWS, KB_W, KEY_U


class Choreography(unittest.TestCase):
    def test_one_lens_never_zooms(self):
        for kind in ("landscape", "portrait"):
            self.assertEqual({C.pose(i / 200 * C.P_END, kind)["lens"] for i in range(201)}, {C.LENS})

    def test_velocity_is_continuous(self):
        # PCHIP is C1: finite differences either side of every key agree (no lurch at constant scroll speed)
        for kind in ("landscape", "portrait"):
            for k in C.KEYS[kind][1:-1]:
                p, h = k[0], 1e-4
                a, b, c = (C.pose(x, kind)["cam"] for x in (p - h, p, p + h))
                v1 = [(y - x) / h for x, y in zip(a, b)]
                v2 = [(y - x) / h for x, y in zip(b, c)]
                self.assertLess(max(abs(x - y) for x, y in zip(v1, v2)), 0.05 * max(1e-3, max(map(abs, v1))) + 2e-3, (kind, p))

    def test_never_overshoots_a_key(self):
        # distance to the display only ever decreases: the camera never floats past a key and drifts back
        for kind in ("landscape", "portrait"):
            d = [C.pose(i / 1000 * C.P_END, kind)["dist"] for i in range(1001)]
            self.assertTrue(all(b <= a + 1e-9 for a, b in zip(d, d[1:])), kind)

    def test_camera_moves_from_the_first_scroll_and_rests_at_the_display(self):
        for kind in ("landscape", "portrait"):
            a, b = C.pose(0.0, kind)["cam"], C.pose(0.002, kind)["cam"]
            self.assertGreater(math.dist(a, b), 1e-4, kind)
            e1, e2 = C.pose(C.P_END - 1e-4, kind)["cam"], C.pose(C.P_END, kind)["cam"]
            self.assertLess(math.dist(e1, e2), 1e-5, kind)

    def test_lid_opens_like_a_friction_hinge(self):
        self.assertEqual(C.lid_deg(C.P_LID[0]), 0.0)
        self.assertEqual(C.lid_deg(C.P_LID[1]), C.LID_OPEN)
        xs = [C.P_LID[0] + (C.P_LID[1] - C.P_LID[0]) * i / 400 for i in range(401)]
        th = [C.lid_deg(x) for x in xs]
        self.assertTrue(all(b >= a for a, b in zip(th, th[1:])))
        v = [b - a for a, b in zip(th, th[1:])]
        self.assertLess(v[0], 0.05 * max(v)); self.assertLess(v[-1], 0.02 * max(v))   # eases in and settles
        self.assertLess(v.index(max(v)), len(v) / 2)                                     # fastest early: a long settle

    def test_screen_wakes_only_after_the_lid_rests(self):
        self.assertEqual(C.screen_level(C.P_LID[1]), 0.0)
        self.assertEqual(C.screen_level(C.P_WAKE[1]), 1.0)

    def test_push_ends_with_the_display_filling_the_frame(self):
        for kind, need in (("landscape", (1920, 1080)), ("portrait", (810, 1440))):
            q = C.pose(C.P_END, kind)
            f, r, u = P.look_at(q["cam"], q["target"])
            # half-extent of the frame at the display's distance vs the display's half-size
            d = q["dist"]
            fov_long = 2 * math.atan(18.0 / C.LENS)
            long_half = d * math.tan(fov_long / 2)
            if kind == "landscape":
                frame_w, frame_h = long_half, long_half * need[1] / need[0]
            else:
                frame_h, frame_w = long_half, long_half * need[0] / need[1]
            self.assertLess(frame_w, SCREEN_W / 2, kind)
            self.assertLess(frame_h, SCREEN_H / 2, kind)


class Laptop(unittest.TestCase):
    def test_display_is_16_by_10(self):
        self.assertAlmostEqual(SCREEN_W / SCREEN_H, 1.6, places=6)

    def test_every_row_spans_the_keyboard(self):
        for row in KEY_ROWS:
            self.assertAlmostEqual(sum(u for u, _ in row) * KEY_U, KB_W, places=9)

    def test_keys_do_not_overlap(self):
        ks = key_layout()
        for i, a in enumerate(ks):
            for b in ks[i + 1:]:
                ox = abs(a[0] - b[0]) < (a[2] + b[2]) / 2 - 1e-9
                oy = abs(a[1] - b[1]) < (a[3] + b[3]) / 2 - 1e-9
                self.assertFalse(ox and oy, (a[4], b[4]))


class FramePlan(unittest.TestCase):
    def test_plan_is_increasing_and_spans_the_film(self):
        r = P.plan("landscape", 10, 1920, steps=800)
        self.assertEqual(r["p"][0], 0.0); self.assertEqual(r["p"][-1], C.P_END)
        self.assertTrue(all(b > a for a, b in zip(r["p"], r["p"][1:])))
        self.assertLessEqual(max(b - a for a, b in zip(r["p"], r["p"][1:])), 0.012 + 1e-9)


if __name__ == "__main__":
    unittest.main()
