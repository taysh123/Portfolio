"""The Night Studio — the M9 hero scene, built from primitives in code (no downloaded or frozen-entrance assets).

A corner of a developer's studio at night. The four flagship products run on real devices (their captures from
public/projects), a desk lamp just outside the frame throws a warm pool across the desk, a window off-frame left
puts a thin ice-blue rim on the hardware, and the owner's T Poker plaque hangs small on the wall (sign.json).

Units are metres: the desk top is z = 0, +y runs away from the camera, the back wall's face is y = WALL_Y.

Passes (run with a Blender Python that has OIDN — tested with the pip `bpy` 5.0.1 module):
  python scene.py --pass beauty   --out beauty.png   --w 3840 --h 1920 --spp 96   # the hero image
  python scene.py --pass clean    --out clean.png    ...  # the same light, foreground hidden from the camera only
  python scene.py --pass portrait --out portrait.png --w 1080 --h 1080 --spp 96   # the phone still (square)
  python scene.py --pass geo      --out studio.bin   # geometry + studio.json (camera) for the real-time layer
Every pass needs --build <dir> holding tex/*.png from prep_screens.py.

Why two hero passes: the real-time layer projects these renders onto the scene's own geometry from the hero camera
(lib/studio). Foreground objects take the beauty pass; the wall, desk and mat take the clean pass, so a small camera
move reveals real wall behind a monitor instead of a smear.
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("--pass", dest="mode", required=True, choices=["beauty", "clean", "portrait", "geo", "lookdev"])
ap.add_argument("--out", required=True)
ap.add_argument("--build", required=True)
ap.add_argument("--w", type=int, default=1200)
ap.add_argument("--h", type=int, default=600)
ap.add_argument("--spp", type=int, default=24)
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
TEX = os.path.join(args.build, "tex")
SIGN = json.load(open(os.path.join(HERE, "sign.json")))

WALL_Y = 0.56
# The hero camera: 3/4 from front-left, a little above the desk, the composition pushed right by lens shift so the
# left of the frame stays quiet wall for the HTML headline. 2 : 1 master frame (the page crops it per viewport).
HERO_CAM = dict(loc=(-1.11, -2.64, 0.82), target=(0.52, 0.12, 0.30), lens=40.0, shift=(-0.27, 0.035))
PORTRAIT_CAM = dict(loc=(0.06, -1.02, 0.58), target=(0.62, 0.16, 0.36), lens=28.0, shift=(0.0, -0.03))
PORTRAIT_EXPOSURE = 0.75

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = args.spp
sc.cycles.use_denoising = True
sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.cycles.max_bounces = 8
sc.cycles.glossy_bounces = 4
sc.cycles.transparent_max_bounces = 8
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = args.w, args.h, 100
sc.view_settings.view_transform = "AgX"
for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
    try:
        sc.view_settings.look = look
        break
    except TypeError:
        pass
sc.view_settings.exposure = 0.4
world = bpy.data.worlds.new("night")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.0012, 0.0016, 0.0028, 1)

GROUP = {}  # object name → "bg" | "fg" | "scr_<project>" | "sign" | "hit_<project>"


# ── materials ───────────────────────────────────────────────────────────────────────────────────────────────────
def principled(name, color, rough=0.5, metal=0.0, coat=0.0, coat_rough=0.15, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if coat:
        p.inputs["Coat Weight"].default_value = coat
        p.inputs["Coat Roughness"].default_value = coat_rough
    if sheen:
        p.inputs["Sheen Weight"].default_value = sheen
    return m


def node(nt, kind, **inputs):
    n = nt.nodes.new(kind)
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def walnut():
    m = principled("walnut", (0.03, 0.017, 0.009), rough=0.42, coat=0.35, coat_rough=0.22)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = node(nt, "ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.4, 34.0, 34.0)            # grain runs along the desk (x)
    grain = node(nt, "ShaderNodeTexNoise", Scale=3.2, Detail=12.0, Roughness=0.62, Distortion=0.6)
    fine = node(nt, "ShaderNodeTexNoise", Scale=180.0, Detail=4.0)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[1].position = 0.36, 0.68
    ramp.color_ramp.elements[0].color = (0.016, 0.009, 0.005, 1)
    ramp.color_ramp.elements[1].color = (0.052, 0.030, 0.017, 1)
    rr = node(nt, "ShaderNodeMapRange")
    rr.inputs["To Min"].default_value, rr.inputs["To Max"].default_value = 0.30, 0.55
    bump = node(nt, "ShaderNodeBump", Strength=0.04, Distance=0.002)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], grain.inputs["Vector"])
    nt.links.new(grain.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    nt.links.new(grain.outputs["Fac"], rr.inputs["Value"])
    nt.links.new(rr.outputs["Result"], p.inputs["Roughness"])
    nt.links.new(fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def plaster():
    m = principled("plaster", (0.0105, 0.0122, 0.0155), rough=0.93)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    big = node(nt, "ShaderNodeTexNoise", Scale=2.5, Detail=4.0)
    fine = node(nt, "ShaderNodeTexNoise", Scale=260.0, Detail=8.0)
    mix = node(nt, "ShaderNodeMath")
    mix.operation = "ADD"
    bump = node(nt, "ShaderNodeBump", Strength=0.06, Distance=0.001)
    nt.links.new(big.outputs["Fac"], mix.inputs[0])
    nt.links.new(fine.outputs["Fac"], mix.inputs[1])
    nt.links.new(mix.outputs["Value"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    # a faint large-scale variation in value, so the wall reads as a surface, not a void
    tint = node(nt, "ShaderNodeMix")
    tint.data_type = "RGBA"
    tint.inputs["A"].default_value = (0.0090, 0.0105, 0.0135, 1)
    tint.inputs["B"].default_value = (0.0125, 0.0142, 0.0178, 1)
    nt.links.new(big.outputs["Fac"], tint.inputs["Factor"])
    nt.links.new(tint.outputs["Result"], p.inputs["Base Color"])
    return m


def felt():
    m = principled("felt", (0.0042, 0.0044, 0.005), rough=1.0, sheen=0.12)
    nt = m.node_tree
    n = node(nt, "ShaderNodeTexNoise", Scale=900.0, Detail=2.0)
    b = node(nt, "ShaderNodeBump", Strength=0.15, Distance=0.0005)
    nt.links.new(n.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    return m


def screen(name, file, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(TEX, file))
    img.interpolation = "Cubic"
    nt.links.new(img.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    p.inputs["Emission Strength"].default_value = strength
    p.inputs["Roughness"].default_value = 0.18                    # anti-glare glass: soft reflections, no hot glints
    p.inputs["Specular IOR Level"].default_value = 0.3
    return m


def artwork(name, file):
    """Official artwork as an inlay: colour and alpha from the file, a satin print finish."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(HERE, file))
    img.interpolation = "Cubic"
    img.extension = "CLIP"
    nt.links.new(img.outputs["Color"], p.inputs["Base Color"])
    nt.links.new(img.outputs["Alpha"], p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = 0.38
    p.inputs["Metallic"].default_value = 0.25
    return m


M = dict(
    walnut=walnut(), plaster=plaster(), felt=felt(),
    alu=principled("alu", (0.028, 0.029, 0.032), rough=0.34, metal=0.85),
    bezel=principled("bezel", (0.004, 0.004, 0.005), rough=0.05, coat=1.0, coat_rough=0.03),
    keys=principled("keys", (0.014, 0.015, 0.017), rough=0.62),
    ti=principled("titanium", (0.40, 0.39, 0.37), rough=0.26, metal=1.0),
    glass=principled("blackglass", (0.003, 0.003, 0.004), rough=0.04, coat=1.0, coat_rough=0.02),
    plaque=principled("plaque", (0.005, 0.005, 0.006), rough=0.6, metal=0.25),
    plaque_edge=principled("plaque_edge", (0.62, 0.46, 0.24), rough=0.32, metal=1.0),
)


# ── geometry helpers ────────────────────────────────────────────────────────────────────────────────────────────
def finish(o, name, group, material, bevel=0.0, segments=4, smooth=True):
    o.name = name
    GROUP[name] = group
    if bevel:
        md = o.modifiers.new("bevel", "BEVEL")
        md.width, md.segments, md.limit_method = bevel, segments, "ANGLE"
    if material:
        o.data.materials.append(material)
    if smooth:
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
        except Exception:
            bpy.ops.object.shade_smooth()
        o.select_set(False)
    return o


def box(name, group, size, loc, rot=(0, 0, 0), material=None, bevel=0.0, segments=4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=[math.radians(a) for a in rot])
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, name, group, material, bevel, segments)


def plane(name, group, w, h, loc, rot, material):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=[math.radians(a) for a in rot])
    o = bpy.context.object
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, name, group, material, smooth=False)


def front(rot_deg, d):
    """Offset along an object's local -y (its front) after a z-yaw and x-tilt, in world space."""
    rx, rz = math.radians(rot_deg[0]), math.radians(rot_deg[2])
    v = Vector((0, -d, 0))
    v.rotate(__import__("mathutils").Euler((rx, 0, rz)))
    return v


# ── the room ────────────────────────────────────────────────────────────────────────────────────────────────────
plane("wall", "bg", 7.0, 3.2, (0.2, WALL_Y, 0.5), (90, 0, 0), M["plaster"])
plane("floor", "bg", 7.0, 4.0, (0.2, -0.6, -0.76), (0, 0, 0), principled("floor", (0.006, 0.006, 0.007), rough=0.7))
box("desk", "bg", (2.4, 0.84, 0.04), (0.18, -0.01, -0.02), material=M["walnut"], bevel=0.006, segments=5)
box("mat", "bg", (0.74, 0.32, 0.003), (0.43, -0.17, 0.0016), (0, 0, 0.6), M["felt"], bevel=0.0012, segments=2)


# ── monitors ────────────────────────────────────────────────────────────────────────────────────────────────────
def monitor(key, center, yaw, active_w, aspect, tex, strength):
    active_h = active_w / aspect
    rot = (0, 0, yaw)
    box(f"{key}_panel", "fg", (active_w + 0.016, 0.011, active_h + 0.016), center, rot, M["bezel"], bevel=0.003)
    box(f"{key}_back", "fg", (active_w * 0.72, 0.024, active_h * 0.70), Vector(center) + front(rot, -0.017), rot, M["alu"], bevel=0.008)
    plane(f"scr_{key}", f"scr_{key}", active_w, active_h, Vector(center) + front(rot, 0.0058), (90, 0, yaw), screen(f"screen_{key}", tex, strength))
    neck_base = Vector(center) + front(rot, -0.045)
    box(f"{key}_neck", "fg", (0.05, 0.022, center[2] - 0.02), (neck_base.x, neck_base.y, (center[2] - 0.02) / 2), rot, M["alu"], bevel=0.004)
    foot = Vector(center) + front(rot, -0.02)
    box(f"{key}_foot", "fg", (0.25, 0.17, 0.009), (foot.x, foot.y, 0.0045), rot, M["alu"], bevel=0.004)
    # an invisible hit box around the whole device, for picking in the browser
    hb = Vector(center)
    box(f"hit_{key}", f"hit_{key}", (active_w + 0.04, 0.08, active_h + 0.06), (hb.x, hb.y, hb.z), rot, None)


monitor("aegis", (0.36, 0.27, 0.355), 5.0, 0.597, 16 / 9, "aegis.png", 1.35)
monitor("dos", (0.99, 0.17, 0.35), -28.0, 0.52, 1600 / 1027, "dos.png", 1.3)


# ── keyboard, trackpad ──────────────────────────────────────────────────────────────────────────────────────────
KB = Vector((0.34, -0.165, 0.0))
box("kb_base", "fg", (0.318, 0.118, 0.011), (KB.x, KB.y, 0.0085), (0, 0, 1.0), M["alu"], bevel=0.003)
pitch, cap = 0.0192, 0.0168
rows = [15, 14, 13, 12]
for r, n in enumerate(rows):
    for c in range(n):
        x = KB.x - (n - 1) * pitch / 2 + c * pitch
        y = KB.y + 0.038 - r * pitch
        box(f"key_{r}_{c}", "fg", (cap, cap, 0.0055), (x, y, 0.0168), (0, 0, 1.0), M["keys"], bevel=0.0018, segments=2)
box("key_space", "fg", (cap * 6.2, cap, 0.0055), (KB.x + 0.004, KB.y + 0.038 - 4 * pitch, 0.0168), (0, 0, 1.0), M["keys"], bevel=0.0018, segments=2)
box("trackpad", "fg", (0.155, 0.112, 0.006), (0.605, -0.168, 0.006), (0, 0, 1.0), M["glass"], bevel=0.004)


# ── phones ──────────────────────────────────────────────────────────────────────────────────────────────────────
def phone(key, loc, rot, tex, strength, standing):
    w, h, t = 0.0776, 0.1607, 0.0083
    if standing:  # upright on a stand: local z is the phone's height
        size, face_rot, scr_off = (w, t, h), (90 + rot[0], 0, rot[2]), front(rot, t / 2 + 0.0004)
    else:         # lying on the desk, screen up
        size, face_rot, scr_off = (w, h, t), (0, 0, rot[2]), Vector((0, 0, t / 2 + 0.0004))
    box(f"{key}_body", "fg", size, loc, rot, M["ti"], bevel=0.0095, segments=6)
    plane(f"scr_{key}", f"scr_{key}", w - 0.0046, h - 0.0046, Vector(loc) + scr_off, face_rot, screen(f"screen_{key}", tex, strength))
    box(f"hit_{key}", f"hit_{key}", (size[0] + 0.03, size[1] + 0.03, size[2] + 0.03), loc, rot, None)


STAND = Vector((0.80, -0.03, 0.0))
box("stand_base", "fg", (0.092, 0.072, 0.014), (STAND.x, STAND.y, 0.007), (0, 0, -10), M["walnut"], bevel=0.003)
box("stand_back", "fg", (0.092, 0.014, 0.10), (STAND.x - 0.004, STAND.y + 0.024, 0.058), (-17, 0, -10), M["walnut"], bevel=0.003)
phone("poker", (STAND.x + 0.0005, STAND.y + 0.006, 0.096), (-17, 0, -10), "poker.png", 1.55, True)
phone("gravity", (0.08, -0.19, 0.0045), (0, 0, 14), "gravity.png", 1.15, False)


# ── the T Poker plaque (module: sign.json) ──────────────────────────────────────────────────────────────────────
def plaque():
    ih = SIGN["icon_height"]
    icon_w = ih * 841 / 858
    wm_h = ih * SIGN["wordmark_ratio"]
    wm_w = wm_h * 411 / 63
    gap, pad = ih * SIGN["gap_ratio"], SIGN["padding"]
    W, H = pad + icon_w + gap + wm_w + pad, ih + 2 * pad
    cx, cz = SIGN["center"]
    y = WALL_Y - 0.009
    box("sign_panel", "sign", (W, 0.012, H), (cx, y - 0.006 + 0.006, cz), material=M["plaque"], bevel=0.0018, segments=3)
    box("sign_rim", "sign", (W + 0.004, 0.006, H + 0.004), (cx, y + 0.004, cz), material=M["plaque_edge"], bevel=0.0012, segments=2)
    left = cx - W / 2 + pad
    plane("sign_icon", "sign", icon_w, ih, (left + icon_w / 2, y - 0.0125, cz), (90, 0, 0), artwork("tpoker_icon", SIGN["icon"]))
    plane("sign_wordmark", "sign", wm_w, wm_h, (left + icon_w + gap + wm_w / 2, y - 0.0125, cz), (90, 0, 0), artwork("tpoker_wordmark", SIGN["wordmark"]))
    return cx, cz, W, H


SIGN_CX, SIGN_CZ, SIGN_W, SIGN_H = plaque()


# ── light ───────────────────────────────────────────────────────────────────────────────────────────────────────
def light(name, kind, loc, aim, energy, color, size=0.1, spot=None, blend=0.6):
    d = bpy.data.lights.new(name, kind)
    d.energy, d.color = energy, color
    if kind == "AREA":
        d.size = size
    if kind == "SPOT":
        d.spot_size, d.spot_blend, d.shadow_soft_size = math.radians(spot or 60), blend, size
    o = bpy.data.objects.new(name, d)
    o.location = loc
    o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    o.visible_camera = False          # light sources themselves never show: only their effect on surfaces
    if kind == "AREA":
        o.visible_glossy = False      # nor do the soft boxes reflect as hard quads in the screen glass
    sc.collection.objects.link(o)
    return o


WARM = (1.0, 0.68, 0.40)        # ≈ 2700 K
ICE = (0.60, 0.75, 1.0)
light("lamp", "SPOT", (1.32, -0.24, 0.66), (0.42, 0.0, 0.0), 58, WARM, size=0.035, spot=70, blend=0.9)   # off-frame right
light("window", "AREA", (-1.45, 0.05, 0.9), (0.6, 0.3, 0.2), 40, ICE, size=0.9)                           # off-frame left
light("bias", "AREA", (0.36, 0.31, 0.36), (0.36, 0.56, 0.42), 4, ICE, size=0.36)                          # LED strip behind the monitor
light("bias2", "AREA", (1.01, 0.22, 0.35), (1.15, 0.56, 0.40), 2.5, ICE, size=0.3)                         # and behind the second
light("fill", "AREA", (-0.4, -2.2, 1.1), (0.3, 0.1, 0.2), 5, (0.75, 0.82, 1.0), size=2.0)
# The plaque's picture light washes the wall around it rather than spotlighting the logo (M9 review: the plaque was
# the brightest thing in the frame); a faint wash from above keeps the back wall reading as a wall in the dark.
light("picture", "SPOT", (SIGN_CX, WALL_Y - 0.22, SIGN_CZ + SIGN_H / 2 + 0.16), (SIGN_CX, WALL_Y, SIGN_CZ - 0.06), SIGN["light_watts"], WARM, size=0.05, spot=85, blend=1.0)
light("wallwash", "AREA", (0.75, WALL_Y - 0.55, 1.45), (0.75, WALL_Y, 0.55), 11, (0.70, 0.78, 1.0), size=1.4)


# ── camera ──────────────────────────────────────────────────────────────────────────────────────────────────────
def camera(spec):
    cd = bpy.data.cameras.new("cam")
    cd.lens, cd.sensor_width, cd.sensor_fit = spec["lens"], 36.0, "HORIZONTAL"
    cd.shift_x, cd.shift_y = spec["shift"]
    cd.clip_start, cd.clip_end = 0.05, 20.0
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = spec["loc"]
    cam.rotation_euler = (Vector(spec["target"]) - Vector(spec["loc"])).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    return cam


def b2t(v):
    """Blender (z-up) → three.js / glTF (y-up)."""
    return [round(v[0], 6), round(v[2], 6), round(-v[1], 6)]


def render(path):
    sc.render.filepath = path
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "16"
    bpy.ops.render.render(write_still=True)
    print("RENDERED", path)


if args.mode in ("beauty", "lookdev", "clean"):
    camera(HERO_CAM)
    if args.mode == "clean":
        for o in bpy.data.objects:
            g = GROUP.get(o.name, "")
            if g == "fg" or g == "sign" or g.startswith("scr_"):
                o.visible_camera = False        # still lit, still casting shadows and reflections, still emitting
    for o in bpy.data.objects:
        if GROUP.get(o.name, "").startswith("hit_"):
            o.hide_render = True
    render(args.out)

elif args.mode == "portrait":
    camera(PORTRAIT_CAM)
    # The phone still is seen small, often outdoors: graded a third of a stop brighter than the desktop master.
    sc.view_settings.exposure = PORTRAIT_EXPOSURE
    for o in bpy.data.objects:
        if GROUP.get(o.name, "").startswith("hit_"):
            o.hide_render = True
    render(args.out)

elif args.mode == "geo":
    # The real-time layer's geometry: one triangle soup per group, world space, glTF/three axes (y up), written as
    # a 16-byte-aligned binary (float32 positions, uint16/uint32 indices) plus studio.json (camera, offsets, test
    # points). No normals or UVs: every surface is coloured by projecting the hero renders from the hero camera.
    import struct
    cam = camera(HERO_CAM)
    sc.render.resolution_x, sc.render.resolution_y = 3840, 1920
    deps = bpy.context.evaluated_depsgraph_get()
    groups = {}
    for o in bpy.data.objects:
        if o.type != "MESH" or o.name not in GROUP or o.name in ("floor",):
            continue
        ev = o.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        g = groups.setdefault(GROUP[o.name], {"pos": [], "idx": []})
        base = len(g["pos"]) // 3
        for v in me.vertices:
            w = o.matrix_world @ v.co
            g["pos"] += [w.x, w.z, -w.y]
        for t in me.loop_triangles:
            g["idx"] += [base + t.vertices[0], base + t.vertices[1], base + t.vertices[2]]
        ev.to_mesh_clear()
    blob, meta = bytearray(), {}
    for name in sorted(groups):
        g = groups[name]
        n = len(g["pos"]) // 3
        po = len(blob)
        blob += struct.pack(f"<{len(g['pos'])}f", *g["pos"])
        while len(blob) % 4:
            blob += b"\0"
        io_ = len(blob)
        wide = n > 65535
        blob += struct.pack(f"<{len(g['idx'])}{'I' if wide else 'H'}", *g["idx"])
        while len(blob) % 4:
            blob += b"\0"
        meta[name] = {"vertices": n, "positions": po, "indices": io_, "count": len(g["idx"]), "wide": wide}
    open(args.out, "wb").write(bytes(blob))
    # Test points: vertices of the screens and the plaque with their image position as Blender projects them
    # (u right, v DOWN from the top — CSS/texture order), so a unit test can prove the browser's projection matches.
    pts = []
    for o in bpy.data.objects:
        if GROUP.get(o.name, "") in ("scr_aegis", "scr_dos", "scr_poker", "scr_gravity") or o.name == "sign_panel":
            me = o.evaluated_get(deps).to_mesh()
            for v in list(me.vertices)[:4]:
                w = o.matrix_world @ v.co
                ndc = world_to_camera_view(sc, cam, w)
                pts.append({"world": b2t(w), "uv": [round(ndc.x, 6), round(1 - ndc.y, 6)]})
    cd = cam.data
    json.dump({
        "camera": {"position": b2t(cam.location), "target": b2t(Vector(HERO_CAM["target"])), "lens": cd.lens,
                   "sensorWidth": cd.sensor_width, "shift": [round(cd.shift_x, 6), round(cd.shift_y, 6)], "aspect": 2.0,
                   "near": cd.clip_start, "far": cd.clip_end},
        "groups": meta, "bytes": len(blob), "testPoints": pts,
    }, open(os.path.splitext(args.out)[0] + ".json", "w"), indent=1)
    print("EXPORTED", args.out, len(blob), "bytes", {k: v["count"] // 3 for k, v in meta.items()})
