# design/render/blender/test_audit.py — run: bpyenv/bin/python -m unittest design/render/blender/test_audit.py
import unittest
import numpy as np
from audit import srgb_to_lum, title_zone_p95, black_floor_share, violet_share, off_lock_share, median_lum, bottom_rows_black, group_shares, width_share, pass_group

def img(rgb, h=90, w=160):
    a = np.zeros((h, w, 3), np.float32); a[:] = np.array(rgb, np.float32) / 255; return a

class Audit(unittest.TestCase):
    def test_luminance_endpoints(self):
        self.assertAlmostEqual(float(srgb_to_lum(img((255, 255, 255))).mean()), 1.0, 3)
        self.assertAlmostEqual(float(srgb_to_lum(img((0, 0, 0))).mean()), 0.0, 3)
    def test_title_zone_uses_the_centre_band_only(self):
        a = img((10, 12, 16)); a[:5] = 1.0                    # bright top rows are outside 40–54%
        self.assertLess(title_zone_p95(a), 0.15)
        a[40:48, 60:100] = 1.0                                 # a bright block inside the zone
        self.assertGreater(title_zone_p95(a), 0.15)
    def test_black_floor(self):
        self.assertAlmostEqual(black_floor_share(img((5, 7, 10))), 1.0)
        self.assertAlmostEqual(black_floor_share(img((30, 34, 40))), 0.0)
    def test_violet_and_hue_lock(self):
        a = img((12, 14, 20)); a[:9, :16] = np.array((140, 100, 255)) / 255   # 1% violet
        self.assertAlmostEqual(violet_share(a), 0.01, 3)
        b = img((12, 14, 20)); b[:9, :16] = np.array((40, 220, 60)) / 255      # saturated green
        self.assertAlmostEqual(off_lock_share(b), 0.01, 3)
        c = img((12, 14, 20)); c[:9, :16] = np.array((91, 156, 255)) / 255     # ice — inside the lock
        self.assertEqual(off_lock_share(c), 0.0)
    def test_median_and_bottom_rows(self):
        self.assertTrue(0.0 < median_lum(img((60, 64, 70))) < 0.1)
        a = img((40, 44, 50)); a[-3:] = np.array((5, 7, 10)) / 255
        self.assertTrue(bottom_rows_black(a))
    def test_group_shares_mask_emitters(self):
        g = {"lg_key": np.full((10, 10, 3), 0.8, np.float32), "lg_monitors": np.full((10, 10, 3), 0.1, np.float32), "lg_warm": np.full((10, 10, 3), 0.1, np.float32)}
        s = group_shares(g)
        self.assertAlmostEqual(s["atmosphere"], 0.8, 3); self.assertAlmostEqual(s["screens"], 0.1, 3); self.assertAlmostEqual(s["warm"], 0.1, 3)
    def test_width_share(self):
        self.assertAlmostEqual(width_share({"x0": 0.25, "x1": 0.52}), 0.27)
    def test_pass_group_names(self):
        self.assertEqual(pass_group("Combined_lg_key.exr"), "lg_key")
        self.assertEqual(pass_group("Combined_lg_monitors0001.exr"), "lg_monitors")
        self.assertIsNone(pass_group("Mist0001.exr")); self.assertIsNone(pass_group("notes.txt"))

if __name__ == "__main__":
    unittest.main()
