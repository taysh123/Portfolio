"""Look-dev renders of the v2 scene: one or more shots from a JSON list.
usage: bpyenv/bin/python v2/shot.py SHOTS.json OUT_DIR [--only a,b]
A shot: {"name", "cam":[x,y,z], "target":[x,y,z], "lens":mm, "fstop", "focus":[x,y,z]|"screen", "lid":deg,
         "screen":0..1, "backlight":0..1, "w","h", "spp", "look":{...LOOK overrides}, "state":{...}}
Writes OUT_DIR/<name>.png and <name>.json (render seconds, quad of the active area in image space)."""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402
import scene_v2  # noqa: E402

TEX = os.environ.get("V2_TEX", os.path.join(HERE, "tex"))


def setup_camera(scene, s, portrait=False):
    cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd)
    scene.collection.objects.link(cam)
    cd.lens = s["lens"]; cd.sensor_width = 36.0; cd.sensor_fit = "HORIZONTAL"
    if portrait:
        cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36.0
    cam.location = s["cam"]
    cam.rotation_euler = (Vector(s["target"]) - Vector(s["cam"])).to_track_quat("-Z", "Y").to_euler()
    if s.get("roll"):
        cam.rotation_euler.rotate_axis("Z", s["roll"])
    cd.dof.use_dof = s.get("fstop", 0) > 0
    cd.dof.aperture_fstop = s.get("fstop", 4.0)
    cd.dof.aperture_blades, cd.dof.aperture_rotation = 9, 0.2
    scene.camera = cam
    return cam


def screen_quad(scene, cam, screen):
    bpy.context.view_layer.update()
    mw = screen.matrix_world
    pts = [world_to_camera_view(scene, cam, mw @ v.co) for v in screen.data.vertices]
    return [{"x": p.x, "y": 1 - p.y, "z": p.z} for p in pts]


def configure(scene, s):
    c = scene.cycles
    scene.render.engine = "CYCLES"
    c.device = "CPU"; c.samples = s.get("spp", 64); c.use_adaptive_sampling = True; c.adaptive_threshold = s.get("noise", 0.01)
    c.use_denoising = True; c.denoiser = "OPENIMAGEDENOISE"; c.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    c.denoising_prefilter = "ACCURATE"; c.denoising_quality = "HIGH"
    c.seed = 7; c.use_animated_seed = False
    c.sample_clamp_direct, c.sample_clamp_indirect = 0.0, 6.0
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces, c.transparent_max_bounces = (
        tuple(int(v) for v in os.environ["V2_BOUNCES"].split(",")) if os.environ.get("V2_BOUNCES") else (8, 3, 4, 4, 8))
    c.use_guiding = os.environ.get("V2_GUIDING") == "1"
    c.caustics_reflective = c.caustics_refractive = False
    c.light_sampling_threshold = 0.01
    scene.render.use_persistent_data = True
    scene.render.resolution_x, scene.render.resolution_y = s.get("w", 960), s.get("h", 540)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = s.get("agx_look", "AgX - Medium High Contrast")
    scene.view_settings.exposure = s.get("exposure", 0.0)
    scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_depth = "16"


def render_shot(s, out):
    for k, v in s.get("look", {}).items():
        scene_v2.LOOK[k] = tuple(v) if isinstance(v, list) else v
    state = {"lid_deg": s.get("lid", 0.0), "screen": s.get("screen", 0.0), "backlight": s.get("backlight", 0.0),
             "screen_tex": s.get("screen_tex"), "monitor_tex": s.get("monitor_tex", os.path.join(TEX, "monitor.png")), **s.get("state", {})}
    t0 = time.time()
    h = scene_v2.build(state, TEX)
    scene = h["scene"]
    cam = setup_camera(scene, s, s.get("h", 540) > s.get("w", 960))
    bpy.context.view_layer.update()
    if s.get("focus") == "screen":
        inv = cam.matrix_world.inverted()
        ds = [-(inv @ (h["screen"].matrix_world @ v.co)).z for v in h["screen"].data.vertices]
        cam.data.dof.focus_distance = 2 * min(ds) * max(ds) / (min(ds) + max(ds))
    elif s.get("focus"):
        cam.data.dof.focus_distance = (Vector(s["focus"]) - cam.location).length
    configure(scene, s)
    scene.render.filepath = os.path.join(out, s["name"] + ".png")
    t1 = time.time()
    bpy.ops.render.render(write_still=True)
    t2 = time.time()
    meta = {"build_s": round(t1 - t0, 2), "render_s": round(t2 - t1, 2), "quad": screen_quad(scene, cam, h["screen"]),
            "focus_m": cam.data.dof.focus_distance, **{k: s[k] for k in s if k not in ("look",)}}
    json.dump(meta, open(os.path.join(out, s["name"] + ".json"), "w"), indent=1)
    print("SHOT", s["name"], meta["render_s"], "s", flush=True)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    shots, out = json.load(open(argv[0])), argv[1]
    only = argv[argv.index("--only") + 1].split(",") if "--only" in argv else None
    os.makedirs(out, exist_ok=True)
    for s in shots:
        if only and s["name"] not in only:
            continue
        render_shot(s, out)
