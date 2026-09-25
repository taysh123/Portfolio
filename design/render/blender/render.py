"""Render an entrance frame set. usage:
  bpyenv/bin/python design/render/blender/render.py --quality preview|final --framing landscape|portrait|all
Writes out/<framing>/<name>.png and out/<framing>/<name>.json ({p, quad|null}).
"""
import argparse, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402  (must precede bmesh inside scene.py)
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402
from camera_path import LANDSCAPE, PORTRAIT, SEQUENCE, frame_state, screen_faces_camera  # noqa: E402
from scene import build_scene  # noqa: E402

QUALITY = {"preview": {"landscape": (960, 540), "portrait": (540, 960), "spp": 16},
           "final": {"landscape": (1920, 1080), "portrait": (1080, 1920), "spp": 64}}


def setup_camera(scene, st, portrait):
    cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd)
    scene.collection.objects.link(cam)
    cd.lens, cd.sensor_width = st["lens"], 36
    cd.sensor_fit = "VERTICAL" if portrait else "HORIZONTAL"
    if portrait: cd.sensor_height = 36
    cd.dof.use_dof, cd.dof.aperture_fstop, cd.dof.aperture_blades = True, st["fstop"], 0
    cam.location = st["cam"]
    cam.rotation_euler = (Vector(st["target"]) - Vector(st["cam"])).to_track_quat("-Z", "Y").to_euler()
    cd.dof.focus_distance = (Vector(st["focus"]) - Vector(st["cam"])).length
    scene.camera = cam
    return cam


def quad_of(scene, cam, screen):
    bpy.context.view_layer.update()
    mw = screen.matrix_world
    # mesh verts were built TR-first mirrored; order to TL, TR, BR, BL in image space
    pts = [world_to_camera_view(scene, cam, mw @ v.co) for v in screen.data.vertices]
    pts = [{"x": p.x, "y": 1 - p.y} for p in pts]
    pts.sort(key=lambda p: p["y"]); top, bot = sorted(pts[:2], key=lambda p: p["x"]), sorted(pts[2:], key=lambda p: p["x"])
    return [top[0], top[1], bot[1], bot[0]]


def render_set(kind, quality, names=None):
    keys = LANDSCAPE if kind == "landscape" else PORTRAIT
    w, h = QUALITY[quality][kind]; spp = QUALITY[quality]["spp"]
    out = os.path.join(HERE, "out", kind); os.makedirs(out, exist_ok=True)
    steps = SEQUENCE[kind] + [{"shot": "still", "name": "still", "p": -1}]
    for step in steps:
        if names and step["name"] not in names:
            continue
        st = frame_state({**step, "shot": "wake"} if step["shot"] == "still" else step, keys)
        bpy.ops.wm.read_factory_settings(use_empty=True)
        h_ = build_scene(os.path.join(HERE, "out") + "/", st["lid_deg"], st["screen_on"])
        scene = h_["scene"]; cam = setup_camera(scene, st, kind == "portrait")
        c = scene.cycles
        scene.render.engine, c.device, c.samples = "CYCLES", "CPU", spp
        c.use_denoising, c.denoiser, c.seed = True, "OPENIMAGEDENOISE", 7
        scene.render.resolution_x, scene.render.resolution_y = w, h
        scene.view_settings.view_transform = "AgX"
        scene.render.filepath = os.path.join(out, step["name"] + ".png")
        bpy.ops.render.render(write_still=True)
        faces = screen_faces_camera(st["lid_deg"], st["cam"])
        with open(os.path.join(out, step["name"] + ".json"), "w") as f:
            json.dump({"p": step["p"], "quad": quad_of(scene, cam, h_["screen"]) if faces else None}, f)
        print("rendered", kind, step["name"], flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--quality", default="preview"); ap.add_argument("--framing", default="all"); ap.add_argument("--names", default="")
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    for kind in (["landscape", "portrait"] if a.framing == "all" else [a.framing]):
        render_set(kind, a.quality, [n for n in a.names.split(",") if n])
