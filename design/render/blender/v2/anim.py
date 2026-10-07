"""Render the v2 entrance as one animated scene (built once; persistent data between frames).
usage: bpyenv/bin/python v2/anim.py --kind landscape|portrait --p 0,0.1,... | --plan plan.json  --out DIR
       [--w 1920 --h 1080 --spp 64 --noise 0.01 --first N --last M]
Frame k renders progress p[k]. Writes DIR/<kind>/f####.png and DIR/<kind>/f####.json
({p, quad (TL,TR,BR,BL in 0–1 image space) or null, lid, screen, render_s}).

The display renders as black cover glass (it reflects the room) at every p: the page's own DOM is the picture on
the screen, composited additively over this frame by the site (the glass reflection + the emitted image, as on
a real display). The display's light on the keys and deck — and the keyboard backlight — are rendered here."""
import argparse
import json
import math
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402
import importlib  # noqa: E402
import scene_v2  # noqa: E402
import camera_v2  # noqa: E402
from shot import configure  # noqa: E402
SCENE = importlib.import_module(os.environ.get("V2_SCENE", "scene_v2"))  # noqa: E402
CAMERA = importlib.import_module(os.environ.get("V2_CAMERA", "camera_v2"))  # noqa: E402

TEX = os.environ.get("V2_TEX", os.path.join(HERE, "tex"))
# Approved look-dev balance (v2 look-dev, 2026-10-06: S3)
STATE = {"window": 3.2, "room": 0.10, "lamp": 0.6, "monitor": 1.0}
LOOK_OVERRIDES = {"alu_rough": 0.20}
EXPOSURE = 1.5


def quad_of(scene, cam, screen):
    mw = screen.matrix_world
    pts = [world_to_camera_view(scene, cam, mw @ v.co) for v in screen.data.vertices]
    if any(p.z <= 0 for p in pts):
        return None
    pts = [{"x": p.x, "y": 1 - p.y} for p in pts]
    pts.sort(key=lambda q: q["y"])
    top, bot = sorted(pts[:2], key=lambda q: q["x"]), sorted(pts[2:], key=lambda q: q["x"])
    return [top[0], top[1], bot[1], bot[0]]


def faces_camera(cam_loc, lid):
    a = math.radians(lid)
    n = (0.0, -math.sin(a), -math.cos(a))
    from laptop_spec import HINGE_Y, HINGE_Z
    v = (cam_loc[0], cam_loc[1] - HINGE_Y, cam_loc[2] - HINGE_Z)
    return lid > 60 and sum(x * y for x, y in zip(n, v)) > 0


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", default="landscape"); ap.add_argument("--p", default=""); ap.add_argument("--plan", default="")
    ap.add_argument("--out", required=True); ap.add_argument("--w", type=int, default=0); ap.add_argument("--h", type=int, default=0)
    ap.add_argument("--spp", type=int, default=64); ap.add_argument("--noise", type=float, default=0.01)
    ap.add_argument("--first", type=int, default=0); ap.add_argument("--last", type=int, default=-1)
    ap.add_argument("--still", default="", help="render the reduced-motion still at this p, display lit with this texture");
    ap.add_argument("--stride", type=int, default=1); ap.add_argument("--progressive", action="store_true"); ap.add_argument("--resume", action="store_true")
    ap.add_argument("--exposure", type=float, default=None); ap.add_argument("--state", default="")
    a = ap.parse_args(argv)
    global EXPOSURE
    if a.exposure is not None:
        EXPOSURE = a.exposure
    if a.state:
        STATE.update(json.loads(a.state))
    ps = json.load(open(a.plan))["p"] if a.plan else [float(x) for x in a.p.split(",")]
    w, h = (a.w, a.h) if a.w else ((1920, 1080) if a.kind == "landscape" else (1080, 1920))
    out = os.path.join(a.out, a.kind); os.makedirs(out, exist_ok=True)

    if os.environ.get("V2_LOOK"):
        LOOK_OVERRIDES.update(json.loads(os.environ["V2_LOOK"]))
    for k, v in LOOK_OVERRIDES.items():
        scene_v2.LOOK[k] = v
    still_tex = a.still or None
    lookdev_tex = os.environ.get("V2_LOOKDEV_TEX")      # look-dev sheets only: show a stand-in for the page once awake
    if still_tex:
        # the reduced-motion still: one frame, the display lit with the page's identity card (no DOM over it)
        ps = [ps[0]] if not a.p else ps
    hd = SCENE.build({"lid_deg": 0.0, "screen": 1.0, "backlight": 1.0, "spill": 1.0, "screen_tex": still_tex or lookdev_tex,
                         "monitor_tex": os.path.join(TEX, "monitor.png"), **STATE}, TEX)
    scene = hd["scene"]
    cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam)
    cd.lens, cd.sensor_width, cd.sensor_fit = CAMERA.LENS, 36.0, "HORIZONTAL"
    if a.kind == "portrait":
        cd.sensor_fit, cd.sensor_height = "VERTICAL", 36.0
    cd.dof.use_dof, cd.dof.aperture_fstop, cd.dof.aperture_blades, cd.dof.aperture_rotation = True, CAMERA.FSTOP, 9, 0.2
    scene.camera = cam
    spill = bpy.data.objects["screen_spill"]
    spill_full = spill.data.energy
    kc = bpy.data.materials["keycap"].node_tree
    kc_mul = next(n for n in kc.nodes if n.type == "MATH" and n.operation == "MULTIPLY")
    kc_full = kc_mul.inputs[1].default_value
    pivot = hd["pivot"]
    s = {"spp": a.spp, "noise": a.noise, "w": w, "h": h, "exposure": EXPOSURE}
    configure(scene, s)

    frames = list(range(len(ps)))
    last = a.last if a.last >= 0 else len(ps) - 1
    order = frames[a.first:last + 1][::a.stride]
    if a.progressive:
        # coarse to fine: every 8th frame, then every 4th, 2nd, the rest — a complete (coarse) film early on
        seen, prog = set(), []
        for stride in (8, 4, 2, 1):
            for k in order[::stride]:
                if k not in seen:
                    seen.add(k); prog.append(k)
        order = prog
    for k in order:
        p = ps[k]
        if a.resume and os.path.exists(os.path.join(out, f"f{k:04d}.json")):
            continue
        q = CAMERA.pose(p, a.kind)
        cam.location = q["cam"]
        cam.rotation_euler = (Vector(q["target"]) - Vector(q["cam"])).to_track_quat("-Z", "Y").to_euler()
        cd.dof.focus_distance = (Vector(q["focus"]) - Vector(q["cam"])).length
        pivot.rotation_euler = (math.radians(-q["lid_deg"]), 0, 0)
        spill.data.energy = spill_full * q["screen"]
        kc_mul.inputs[1].default_value = kc_full * q["screen"]
        if lookdev_tex and not still_tex:
            bpy.data.materials["display"].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = q["screen"]
        bpy.context.view_layer.update()
        path = os.path.join(out, "still" if still_tex else f"f{k:04d}")
        scene.render.filepath = path + ".png"
        t0 = time.time()
        bpy.ops.render.render(write_still=True)
        dt = time.time() - t0
        meta = {"p": p, "quad": quad_of(scene, cam, hd["screen"]) if faces_camera(q["cam"], q["lid_deg"]) else None,
                "lid": q["lid_deg"], "screen": q["screen"], "render_s": round(dt, 1), "w": w, "h": h}
        json.dump(meta, open(path + ".json", "w"))
        print("FRAME", a.kind, k, round(p, 4), round(dt, 1), "s", flush=True)


if __name__ == "__main__":
    main()
