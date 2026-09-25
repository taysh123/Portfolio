"""Render an entrance frame set. usage:
  bpyenv/bin/python design/render/blender/render.py --quality preview|lookdev|final --framing landscape|portrait|all
      [--names a,b] [--exr] [--out DIR]
Writes DIR/<framing>/<name>.png and .json ({p, quad|null, shot, laptop_bbox, corner_coc_px, spp, weights});
with --exr also DIR/<framing>/<name>/Combined_lg_<group>[frame].exr and Mist[frame].exr (audit.py reads them).
"""
import argparse, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402  (must precede bmesh inside scene.py)
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402
from camera_path import LANDSCAPE, PORTRAIT, SEQUENCE, frame_state, screen_faces_camera  # noqa: E402
from scene import build_scene  # noqa: E402

QUALITY = {"preview": {"landscape": (960, 540), "portrait": (540, 960), "spp": 16},
           "lookdev": {"landscape": (960, 540), "portrait": (540, 960), "spp": 64},
           "final": {"landscape": (1920, 1080), "portrait": (1080, 1920), "spp": 64}}
PUSH_B_SPP = 64          # push frames j >= PUSH_SPLIT; 96 → 64 approved (gate option D; push-20 diff mean 0.10/255, p99 1/255)
PUSH_SPLIT = 12          # push frames j >= 12 are shot "push-b"
LID_SPP = 48             # final lid frames; 64 → 48 approved (gate option D; lid-20 diff mean 0.51/255, p99 4/255)

# Object-name prefix → Cycles light group (spec §4.6 "Light groups"). Names are the scene's own
# (scene.py); test_groups.py asserts every light and emitter lands in exactly one group.
LIGHT_GROUPS = [("L1_", "lg_bias"), ("L2_", "lg_bias"), ("shelfstrip", "lg_bias"),
                ("L0_", "lg_key"), ("L4_", "lg_key"), ("L5_", "lg_key"), ("L6", "lg_key"), ("lightbar_diff", "lg_key"),
                ("L7", "lg_card"), ("L13_", "lg_card"), ("L8_", "lg_sweep"),
                ("mon_", "lg_monitors"), ("lapscreen", "lg_screen"), ("L9_", "lg_screen"),
                ("key_backlight", "lg_backlight"), ("mech_halo", "lg_backlight"),
                ("t_", "lg_practical"), ("bayled", "lg_practical"), ("portled", "lg_practical"),
                ("minipcled", "lg_practical"), ("dockled", "lg_practical"), ("pad_glyphs", "lg_practical"),
                ("lamp_", "lg_warm")]


def group_of(name):
    for prefix, g in LIGHT_GROUPS:
        if name.startswith(prefix):
            return g
    return None


def assign_light_groups(scene, view_layer):
    for g in sorted({g for _, g in LIGHT_GROUPS} | {"lg_world"}):
        if g not in view_layer.lightgroups:
            view_layer.lightgroups.add(name=g)
    scene.world.lightgroup = "lg_world"
    for ob in scene.objects:
        g = group_of(ob.name)
        if g:
            ob.lightgroup = g


def beat_weights(step):
    """Spec §4.6 "Light across the beats": the screen is dark through the lid; the room recedes through the push."""
    w = {g: 1.0 for _, g in LIGHT_GROUPS}; w["lg_world"] = 1.0
    if step["shot"] == "lid":
        w["lg_screen"] = 0.0
    if step["shot"] == "push":
        t = step["j"] / (step["n"] - 1)
        for g in w:
            if g not in ("lg_screen", "lg_backlight", "lg_card"):
                w[g] = 1 - 0.4 * t                                    # the room recedes to ×0.6
        # B2 (user, 2026-09-26): the depth cues — displays, bias/slat light, tower and LED practicals — recede
        # only to ×0.75, so the late push keeps recognisable workstation bokeh instead of a flat blue field.
        for g in ("lg_monitors", "lg_bias", "lg_practical"):
            w[g] = 1 - 0.25 * t
        w["lg_warm"] = max(0.0, 1 - t / 0.85) if t < 1 else 0.0       # exactly 0 at K2
    return w


def apply_weights(scene, weights):
    # Scale each light datablock and each emissive material ONCE: several objects share a material
    # (e.g. the fan rings), and scaling per object would compound the weight.
    lights, mats = {}, {}
    for ob in scene.objects:
        k = weights.get(ob.lightgroup, 1.0)
        if ob.type == "LIGHT":
            lights[ob.data.name] = (ob.data, k)
        elif ob.type == "MESH":
            for slot in ob.material_slots:
                if slot.material:
                    mats[slot.material.name] = (slot.material, k)
    for data, k in lights.values():
        data.energy *= k
    for m, k in mats.values():
        n = m.node_tree and m.node_tree.nodes.get("Principled BSDF")
        if n and k != 1.0:
            n.inputs["Emission Strength"].default_value *= k


def setup_compositor(scene, view_layer, exr_dir=None):
    """Bloom and mist haze in every tier; EXR light-group passes with --exr. Blender 5 node-group API."""
    view_layer.use_pass_mist = True
    scene.world.mist_settings.start, scene.world.mist_settings.depth = 1.5, 2.0      # haze between 1.5 and 3.5 m
    ng = bpy.data.node_groups.new("comp", "CompositorNodeTree"); scene.compositing_node_group = ng
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl, out = ng.nodes.new("CompositorNodeRLayers"), ng.nodes.new("NodeGroupOutput")
    glare = ng.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Bloom"
    glare.inputs["Threshold"].default_value = 1.0; glare.inputs["Strength"].default_value = 0.12
    mix = ng.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "ADD"
    sock = {s.identifier: s for s in mix.inputs}
    ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ng.links.new(glare.outputs["Image"], sock["A_Color"])
    ng.links.new(rl.outputs["Mist"], sock["Factor_Float"])
    sock["B_Color"].default_value = (0.043 * 0.12, 0.078 * 0.12, 0.133 * 0.12, 1)   # #0b1422 at ≤12%
    ng.links.new(next(o for o in mix.outputs if o.identifier == "Result_Color"), out.inputs[0])
    if exr_dir:
        # Files land as "<item name>[frame digits].exr", e.g. Combined_lg_key0001.exr; audit.pass_group parses exactly that.
        fo = ng.nodes.new("CompositorNodeOutputFile"); fo.directory = exr_dir + "/"; fo.file_name = ""
        fo.format.media_type = "IMAGE"; fo.format.file_format = "OPEN_EXR"; fo.format.color_depth = "32"; fo.format.exr_codec = "PIZ"
        for name in [o.name for o in rl.outputs if o.enabled and (o.name.startswith("Combined_lg_") or o.name == "Mist")]:
            fo.file_output_items.new("FLOAT" if name == "Mist" else "RGBA", name)
            ng.links.new(rl.outputs[name], fo.inputs[name])


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


def laptop_bbox(scene, cam):
    lap = bpy.data.objects["laptop"]; pts = []
    for ob in [lap, *lap.children_recursive]:
        if ob.type == "MESH":
            pts += [world_to_camera_view(scene, cam, ob.matrix_world @ Vector(c)) for c in ob.bound_box]
    xs = [p.x for p in pts]
    return {"x0": max(0.0, min(xs)), "x1": min(1.0, max(xs))}


def balance_screen_focus(cam, screen):
    """Put the focal plane where the nearest and farthest screen corners blur equally: s = 2·dn·df/(dn+df).
    Focusing on the screen centre left the corners of an angled screen up to ~1.9 px soft at 1920 (audit);
    this changes only the focus distance — aperture, lens and framing (the approved look) are untouched."""
    bpy.context.view_layer.update()
    inv = cam.matrix_world.inverted()
    ds = [-(inv @ (screen.matrix_world @ v.co)).z for v in screen.data.vertices]
    dn, df = min(ds), max(ds)
    cam.data.dof.focus_distance = 2 * dn * df / (dn + df)


def corner_coc_px(scene, cam, screen, width_px):
    """Thin-lens circle of confusion at the four screen corners, in output pixels."""
    bpy.context.view_layer.update()                          # hinge/lid transforms must be current
    cd = cam.data; f = cd.lens / 1000; N = cd.dof.aperture_fstop; s = cd.dof.focus_distance
    sensor = cd.sensor_width / 1000; worst = 0.0
    for v in screen.data.vertices:
        d = -(cam.matrix_world.inverted() @ (screen.matrix_world @ v.co)).z
        c = abs((f * f / N) * (d - s) / (d * (s - f)))          # blur diameter on the sensor, metres
        worst = max(worst, c / sensor * width_px)
    return worst


def render_set(kind, quality, names=None, exr=False, out_root=None, spp_override=None):
    keys = LANDSCAPE if kind == "landscape" else PORTRAIT
    w, h = QUALITY[quality][kind]
    out = os.path.join(out_root or os.path.join(HERE, "out"), kind); os.makedirs(out, exist_ok=True)
    tex = os.path.join(HERE, "out") + "/"                    # frozen screen textures (make_screens.py)
    steps = SEQUENCE[kind] + [{"shot": "still", "name": "still", "p": -1}]
    for step in steps:
        if names and step["name"] not in names:
            continue
        st = frame_state({**step, "shot": "wake"} if step["shot"] == "still" else step, keys)
        bpy.ops.wm.read_factory_settings(use_empty=True)
        h_ = build_scene(tex, st["lid_deg"], st["screen_on"])
        scene = h_["scene"]; vl = bpy.context.view_layer; cam = setup_camera(scene, st, kind == "portrait")
        if step["shot"] != "lid" and screen_faces_camera(st["lid_deg"], st["cam"]):
            balance_screen_focus(cam, h_["screen"])
        scene.render.engine = "CYCLES"              # before the compositor: render-layer passes depend on the engine
        assign_light_groups(scene, vl)
        weights = beat_weights(step)
        apply_weights(scene, weights)
        setup_compositor(scene, vl, os.path.join(out, step["name"]) if exr else None)
        spp = PUSH_B_SPP if quality == "final" and step["shot"] == "push" and step["j"] >= PUSH_SPLIT else QUALITY[quality]["spp"]
        if quality == "final" and step["shot"] == "lid":
            spp = LID_SPP
        if spp_override:
            spp = spp_override
        c = scene.cycles
        scene.render.engine, c.device, c.samples = "CYCLES", "CPU", spp
        c.use_denoising, c.denoiser, c.seed = True, "OPENIMAGEDENOISE", 7
        c.denoising_input_passes = "RGB_ALBEDO_NORMAL"
        c.sample_clamp_direct, c.sample_clamp_indirect, c.blur_glossy = 8, 3, 0.5
        c.adaptive_threshold = 0.015
        c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces, c.volume_bounces = 8, 3, 3, 4, 0
        scene.render.use_persistent_data = True
        scene.render.resolution_x, scene.render.resolution_y = w, h
        scene.view_settings.view_transform = "AgX"
        scene.render.filepath = os.path.join(out, step["name"] + ".png")
        bpy.ops.render.render(write_still=True)
        faces = screen_faces_camera(st["lid_deg"], st["cam"])
        meta = {"p": step["p"], "quad": quad_of(scene, cam, h_["screen"]) if faces else None, "shot": step["shot"],
                "laptop_bbox": laptop_bbox(scene, cam), "corner_coc_px": corner_coc_px(scene, cam, h_["screen"], w),
                "spp": spp, "weights": weights}
        with open(os.path.join(out, step["name"] + ".json"), "w") as f:
            json.dump(meta, f)
        print("rendered", kind, step["name"], flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--quality", default="preview"); ap.add_argument("--framing", default="all")
    ap.add_argument("--names", default=""); ap.add_argument("--exr", action="store_true"); ap.add_argument("--out", default=""); ap.add_argument("--spp", type=int, default=0)
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    for kind in (["landscape", "portrait"] if a.framing == "all" else [a.framing]):
        render_set(kind, a.quality, [n for n in a.names.split(",") if n], a.exr, os.path.abspath(a.out) if a.out else None, a.spp or None)
