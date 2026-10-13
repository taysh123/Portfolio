"""Spec §4.6 assertions for a rendered key frame. Pure numpy; main() loads images via bpy.

Thresholds are the spec's. Where the APPROVED preview composition (K0/K1/K2, 2026-09-25) measures
differently from a spec target, Task 6 Step 6 calibrates the target to the approved value and logs it:
the approval supersedes a pre-approval number, never the other way round.
"""
import json, os, sys
import numpy as np

ATMOS = ("lg_world", "lg_bias", "lg_key", "lg_card", "lg_sweep", "lg_backlight", "lg_practical")
SCREENS = ("lg_monitors", "lg_screen")
FLOOR = np.array((5, 7, 10)) / 255


def srgb_to_lum(a):
    c = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def _hsv(a):
    mx, mn = a.max(-1), a.min(-1); d = mx - mn + 1e-9
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx


def title_zone_p95(a):
    """Centred zone: 40–54% of the height, 36% of the width (spec §4.6 title quiet zone)."""
    H, W = a.shape[:2]
    z = a[int(H * 0.40):int(H * 0.54), int(W * 0.32):int(W * 0.68)]
    return float(np.percentile(srgb_to_lum(z), 95))


def black_floor_share(a):
    return float((np.abs(a - FLOOR).max(-1) <= 2 / 255).mean())


def violet_share(a):
    h, s, v = _hsv(a)
    return float(((h >= 245) & (h <= 290) & (s > 0.35) & (v > 0.2)).mean())


def off_lock_share(a):
    """Saturated pixels outside the cool band (185–235°) and the one amber (20–45°), violet counted separately."""
    h, s, v = _hsv(a)
    sat = (s > 0.5) & (v > 0.25)
    ok = ((h >= 185) & (h <= 235)) | ((h >= 20) & (h <= 45)) | ((h >= 245) & (h <= 290))
    return float((sat & ~ok).mean())


def median_lum(a, mask=None):
    l = srgb_to_lum(a)
    return float(np.median(l[mask] if mask is not None else l))


def bottom_rows_black(a):
    """True if any row in the bottom 5% sits at the black floor (K0 forbids it)."""
    H = a.shape[0]
    rows = a[H - max(1, int(H * 0.05)):]
    return bool((np.abs(rows - FLOOR).max(-1) <= 2 / 255).all(-1).any())


def group_shares(groups):
    """Energy share per class over non-emissive pixels (emitters masked where screens dominate)."""
    tot = sum(g.sum(-1) for g in groups.values()) + 1e-9
    scr = sum(groups[k].sum(-1) for k in SCREENS if k in groups)
    mask = (scr / tot) < 0.5
    e = {k: float(v.sum(-1)[mask].sum()) for k, v in groups.items()}
    T = sum(e.values()) + 1e-9
    return {"atmosphere": sum(e.get(k, 0) for k in ATMOS) / T, "screens": sum(e.get(k, 0) for k in SCREENS) / T,
            "warm": e.get("lg_warm", 0) / T, "mask_share": float(mask.mean())}


def width_share(bbox):
    return round(bbox["x1"] - bbox["x0"], 4)


def pass_group(filename):
    """'Combined_lg_key0001.exr' / 'Combined_lg_key.exr' → 'lg_key'; anything else → None.
    Blender's File Output node names files after the item and may append the frame number."""
    import re
    m = re.fullmatch(r"Combined_(lg_[a-z]+)\d*\.exr", filename)
    return m.group(1) if m else None


# kind → list of (name, value_fn(report) -> float, lo, hi). Calibrated targets are loaded from
# targets.json (Step 6) and override these spec defaults key by key.
SPEC = {
    "K0": [("laptop_width", 0.25, 0.29), ("title_p95", 0, 0.15), ("black_floor", 0, 0.05), ("violet", 0, 0.002),
           ("off_lock", 0, 0.003), ("median_atmos", 0.05, 0.08), ("atmos_share", 0.80, 0.88), ("screens_share", 0.08, 0.14), ("warm_share", 0.03, 0.06)],
    # The title zone is asserted on K0 and the still lid-crack frames only (spec §4.6): the title is gone by p 0.17.
    "crack": [("title_p95", 0, 0.15), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("atmos_share", 0.80, 0.88), ("warm_share", 0.03, 0.06)],
    "lid": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("atmos_share", 0.80, 0.88), ("warm_share", 0.03, 0.06)],
    "K1off": [("laptop_width", 0.44, 0.48), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("atmos_share", 0.80, 0.88), ("warm_share", 0, 0.03), ("corner_coc", 0, 1.0)],
    "K1on": [("laptop_width", 0.44, 0.48), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("warm_share", 0, 0.03), ("corner_coc", 0, 1.0)],
    "push": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0), ("bokeh_p90", 0.10, 1.0)],
    "K2": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0), ("warm_share", 0, 0.0001), ("bokeh_p90", 0.10, 1.0)],
    "P0": [("laptop_width", 0.40, 0.50), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("black_floor", 0, 0.05)],
    "P1": [("laptop_width", 0.80, 0.90), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0)],
    "P2": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0)],
}


def outside_quad_p90(a, quad):
    """K2/late push depth (look-dev note 4): the studio behind the laptop must still carry bokeh."""
    if quad is None: return 1.0
    H, W = a.shape[:2]
    ys, xs = np.mgrid[0:H, 0:W]; px, py = (xs + 0.5) / W, (ys + 0.5) / H
    inside = np.ones((H, W), bool)
    for i in range(4):
        a0, b0 = quad[i], quad[(i + 1) % 4]
        inside &= (b0["x"] - a0["x"]) * (py - a0["y"]) - (b0["y"] - a0["y"]) * (px - a0["x"]) >= 0
    out = srgb_to_lum(a)[~inside]
    return float(np.percentile(out, 90)) if out.size > H * W * 0.02 else 1.0   # screen fills the frame: n/a


def report(png, meta, groups, kind, targets):
    r = {"title_p95": title_zone_p95(png), "black_floor": black_floor_share(png), "violet": violet_share(png),
         "off_lock": off_lock_share(png), "bottom_black": bottom_rows_black(png),
         "laptop_width": width_share(meta["laptop_bbox"]) if meta.get("laptop_bbox") else None,
         "corner_coc": meta.get("corner_coc_px"), "bokeh_p90": outside_quad_p90(png, meta.get("quad"))}
    if groups:
        s = group_shares(groups); r.update({"atmos_share": s["atmosphere"], "screens_share": s["screens"], "warm_share": s["warm"]})
        tot = sum(g.sum(-1) for g in groups.values()) + 1e-9
        scr = sum(groups[k].sum(-1) for k in SCREENS if k in groups)
        r["median_atmos"] = median_lum(png, (scr / tot) < 0.5)
    fails = []
    for name, lo, hi in [(n, *targets.get(kind, {}).get(n, (lo, hi))) for n, lo, hi in SPEC[kind]]:
        v = r.get(name)
        if v is None: fails.append(f"{name}: not measured"); continue
        if not (lo <= v <= hi): fails.append(f"{name}={v:.4f} outside [{lo}, {hi}]")
    if kind == "K0" and r["bottom_black"]: fails.append("a bottom-5% row sits at the black floor")
    return r, fails


def main():
    import bpy  # noqa: F401 — only for image IO
    png_path, kind = sys.argv[1], sys.argv[sys.argv.index("--kind") + 1]
    load = lambda p: np.array(bpy.data.images.load(p).pixels[:], np.float32).reshape(-1, 4)
    im = bpy.data.images.load(png_path); W, H = im.size
    png = np.flipud(load(png_path).reshape(H, W, 4)[..., :3])
    meta = json.load(open(png_path[:-4] + ".json"))
    d = png_path[:-4]; groups = {}
    if os.path.isdir(d):
        for f in os.listdir(d):
            g = pass_group(f)
            if g: groups[g] = np.flipud(load(os.path.join(d, f)).reshape(H, W, 4)[..., :3])
    tpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "targets.json")
    targets = json.load(open(tpath)) if os.path.exists(tpath) else {}
    r, fails = report(png, meta, groups, kind, targets)
    print(json.dumps({"frame": png_path, "kind": kind, "report": r, "fails": fails}, default=float))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
