import math
import unittest

from camera_path import LANDSCAPE, PORTRAIT, frame_state, screen_faces_camera, SEQUENCE


class CameraPath(unittest.TestCase):
    def test_sequence_counts_match_spec(self):
        self.assertEqual(len([s for s in SEQUENCE["landscape"] if s["shot"] == "lid"]), 36)
        self.assertEqual(len([s for s in SEQUENCE["landscape"] if s["shot"] == "push"]), 28)
        self.assertEqual(len([s for s in SEQUENCE["portrait"] if s["shot"] == "lid"]), 16)
        self.assertEqual(len([s for s in SEQUENCE["portrait"] if s["shot"] == "push"]), 12)

    def test_p_is_strictly_increasing(self):
        for kind in ("landscape", "portrait"):
            ps = [s["p"] for s in SEQUENCE[kind]]
            self.assertTrue(all(b > a for a, b in zip(ps, ps[1:])), kind)

    def test_lid_holds_camera_for_the_crack_then_opens_to_108(self):
        lid = [s for s in SEQUENCE["landscape"] if s["shot"] == "lid"]
        k0 = frame_state(lid[0], LANDSCAPE)
        self.assertEqual(frame_state(lid[4], LANDSCAPE)["cam"], k0["cam"])
        self.assertAlmostEqual(frame_state(lid[-1], LANDSCAPE)["lid_deg"], 108.0)
        self.assertEqual(frame_state(lid[0], LANDSCAPE)["lid_deg"], 0.0)

    def test_push_ends_on_the_screen_normal(self):
        end = frame_state(SEQUENCE["landscape"][-1], LANDSCAPE)
        (cx, cy, cz), (tx, ty, tz) = end["cam"], end["target"]
        n = (0, -math.sin(math.radians(108)), -math.cos(math.radians(108)))
        d = math.dist((cx, cy, cz), (tx, ty, tz))
        dirv = ((cx - tx) / d, (cy - ty) / d, (cz - tz) / d)
        self.assertGreater(sum(a * b for a, b in zip(dirv, n)), 0.9999)

    def test_back_facing_detection(self):
        self.assertFalse(screen_faces_camera(lid_deg=0, cam=(0, -1, 0.5)))
        self.assertTrue(screen_faces_camera(lid_deg=108, cam=(0, -1, 0.5)))


if __name__ == "__main__":
    unittest.main()
