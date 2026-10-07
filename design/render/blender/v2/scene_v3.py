"""v3 entrance scene: Tay Shofer's workstation at blue hour — a complete, lived-in developer desk in a real room.

Art direction (user reference, 2026-10-07): a photographed premium workspace, not a laptop in a void. Layers:
  foreground  the desk's front edge, a notebook and pen, the mug, the pulled-out chair (out of focus), a rug
  midground   the hero laptop, mechanical keyboard and mouse on a felt mat, a phone and a tablet running T Poker,
              three monitors on a walnut riser (code, the DeveloperOS dashboard, the Aegis dashboard)
  background  open walnut shelving with books and objects, a framed T Poker print, a corner window with half-drawn
              venetian blinds over a night city
Light, all motivated: the city and sky through the window (cool), the desk lamp's bulb, warm LED strips under the
shelves and the monitor riser, the monitor light bar, the screens themselves, and a dim room fill.

The laptop (scene_v2.build_laptop) stays at the world origin, so camera_v2's screen geometry still applies.
build(state, tex_dir) → handles {scene, screen, pivot, laptop, base}.
"""
import math
import os
import random
import sys

import bpy  # noqa: F401
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scene_v2 as V  # noqa: E402
from scene_v2 import slab, cyl, lathe, quad, principled, noise, map_range, blackbody, cable  # noqa: E402
from laptop_spec import BW, FOOT, SCREEN_W, SCREEN_H  # noqa: E402

LOOK3 = {
    "exposure_hint": 0.0,
    "warm_k": 2700, "led_strength": 14.0, "lamp_w": 18.0, "lightbar_w": 6.0,
    "monitor_strength": 0.75, "window_w": 160.0, "sky_strength": 0.35, "city_strength": 2.0, "fill_w": 90.0,
}

# room frame (world metres; desk top at z = 0, floor at -0.75; the laptop sits at the origin)
FLOOR, CEIL = -0.75, 1.95
DESK = {"x": 0.25, "y": 0.075, "w": 2.20, "d": 0.75, "t": 0.035}
WALL_Y = 0.47                         # back wall's room face
WIN = {"x0": 1.20, "x1": 2.50, "z0": 0.06, "z1": 1.66}
LEFT_X, RIGHT_X = -2.20, 2.65


# ── materials ───────────────────────────────────────────────────────────────────────────────────────────────

def wood(name, base=(0.12, 0.065, 0.035), dark=(0.05, 0.026, 0.014), scale=3.0, rough=0.42, coat=0.25, along="X"):
    """Walnut veneer: banded grain (wave texture along the board), pore noise, roughness drift, a satin coat."""
    m, nt, p = principled(name, base, rough=rough, coat=coat, coat_rough=0.12)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 7.0, 7.0) if along == "X" else (7.0, 1.0, 7.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "Y" if along == "X" else "X"
    wv.inputs["Scale"].default_value = scale; wv.inputs["Distortion"].default_value = 7.5
    wv.inputs["Detail"].default_value = 4.0; wv.inputs["Detail Scale"].default_value = 1.6
    nt.links.new(mp.outputs["Vector"], wv.inputs["Vector"])
    rmp = nt.nodes.new("ShaderNodeValToRGB")
    rmp.color_ramp.elements[0].color = (*dark, 1); rmp.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(wv.outputs["Fac"], rmp.inputs["Fac"]); nt.links.new(rmp.outputs["Color"], p.inputs["Base Color"])
    n = noise(nt, 6.0, detail=3.0); nt.links.new(map_range(nt, n.outputs["Fac"], rough - 0.08, rough + 0.10), p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.08; bump.inputs["Distance"].default_value = 0.0004
    nt.links.new(wv.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def matte_plastic(name, color, rough=0.5, var=0.08, scale=40.0):
    m, nt, p = principled(name, color, rough=rough, spec=0.45)
    n = noise(nt, scale, detail=3.0)
    nt.links.new(map_range(nt, n.outputs["Fac"], rough - var, rough + var), p.inputs["Roughness"])
    return m


def fabric(name, color, rough=0.85, bump=0.25, scale=900.0):
    m, nt, p = principled(name, color, rough=rough, spec=0.3)
    p.inputs["Sheen Weight"].default_value = 0.4; p.inputs["Sheen Tint"].default_value = (1, 1, 1, 1)
    b = nt.nodes.new("ShaderNodeBump"); b.inputs["Strength"].default_value = bump; b.inputs["Distance"].default_value = 0.0005
    n = noise(nt, scale, detail=1.0); nt.links.new(n.outputs["Fac"], b.inputs["Height"]); nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def emitter(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    for nd in list(nt.nodes):
        nt.nodes.remove(nd)
    o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = (*color, 1); e.inputs["Strength"].default_value = strength
    nt.links.new(e.outputs[0], o.inputs["Surface"])
    return m


def screen(name, tex, strength):
    return V.screen_material(name, tex, strength)


def image_mat(name, tex, rough=0.6):
    m, nt, p = principled(name, (0.5, 0.5, 0.5), rough=rough)
    img = nt.nodes.new("ShaderNodeTexImage"); img.image = bpy.data.images.load(tex)
    nt.links.new(img.outputs["Color"], p.inputs["Base Color"])
    return m


def link(ob):
    bpy.context.collection.objects.link(ob)
    return ob


def empty(name, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    e = link(bpy.data.objects.new(name, None)); e.location, e.rotation_euler = loc, rot
    if parent:
        e.parent = parent
    return e


def point_light(name, loc, color, w, radius, parent=None):
    ld = bpy.data.lights.new(name, "POINT"); ld.energy, ld.color, ld.shadow_soft_size = w, color, radius
    ob = link(bpy.data.objects.new(name, ld)); ob.location = loc
    if parent:
        ob.parent = parent
    return ob


# ── props ───────────────────────────────────────────────────────────────────────────────────────────────────

def monitor(name, loc, yaw, tex, mats, w=0.597, h=0.336, stand_h=0.10):
    """A 27-inch display on an aluminium stand: thin bezel, rounded back housing, the picture as emission."""
    g = empty(name, loc, (0, 0, math.radians(yaw)))
    blk, alu = mats["monitor"], mats["alu"]
    zc = stand_h + 0.012 + h / 2
    pnl = slab(name + "_panel", w + 0.014, h + 0.022, 0.009, 0.004, top=0.0015, bot=0.0015, segs=3, mats=[blk, blk], parent=g)
    pnl.rotation_euler = (math.radians(90), 0, 0); pnl.location = (0, 0.009, zc)
    back = slab(name + "_back", w * 0.62, h * 0.62, 0.026, 0.03, top=0.012, segs=4, mats=[blk, blk], parent=g)
    back.rotation_euler = (math.radians(-90), 0, 0); back.location = (0, 0.009, zc)
    scr = quad(name + "_screen", w, h, screen(name + "_scr", tex, LOOK3["monitor_strength"]), parent=g, loc=(0, -0.0002, zc + 0.004),
               rot=(math.radians(90), 0, 0))
    slab(name + "_neck", 0.05, 0.016, stand_h + h * 0.45, 0.006, top=0.004, segs=3, mats=[alu, alu], parent=g, loc=(0, 0.06, 0.006))
    slab(name + "_foot", 0.22, 0.17, 0.007, 0.03, top=0.0025, segs=3, mats=[alu, alu], parent=g, loc=(0, 0.04, 0.0))
    return g, scr


def keyboard(loc, yaw, mats):
    g = empty("keyboard", loc, (0, 0, math.radians(yaw)))
    case, cap, accent = mats["kb_case"], mats["keycap3"], mats["keycap_accent"]
    slab("kb_case", 0.322, 0.118, 0.020, 0.008, top=0.003, bot=0.002, segs=3, mats=[case, case], parent=g)
    rows = [15, 15, 14, 13, 12]
    for r, n in enumerate(rows):
        for i in range(n):
            x = -0.150 + i * 0.0191 + r * 0.004
            y = 0.038 - r * 0.0191
            mat = accent if (r == 0 and i == 0) or (r == 2 and i == n - 1) else cap
            slab(f"kc{r}_{i}", 0.0172, 0.0172, 0.0085, 0.0022, top=0.0022, segs=2, n=3, mats=[mat, mat], parent=g, loc=(x, y, 0.016))
    slab("kb_space", 0.105, 0.0172, 0.0085, 0.0022, top=0.0022, segs=2, n=3, mats=[cap, cap], parent=g, loc=(-0.02, 0.038 - 5 * 0.0191, 0.016))
    return g


def mouse(loc, yaw, mats):
    g = empty("mouse", loc, (0, 0, math.radians(yaw)))
    prof = [(0.0, 0.0), (0.030, 0.0), (0.033, 0.006), (0.031, 0.020), (0.024, 0.032), (0.012, 0.038), (0.0, 0.039)]
    ob = lathe("mouse_body", prof, mats["mouse"], parent=g, steps=48)
    ob.scale = (0.95, 1.85, 1.0)
    cyl("mouse_wheel", 0.0045, 0.006, (0, 0.034, 0.036), mats["rubber"], rot=(0, math.radians(90), 0), parent=g, verts=24)
    return g


def speaker(name, loc, yaw, mats):
    g = empty(name, loc, (0, 0, math.radians(yaw)))
    slab(name + "_cab", 0.16, 0.20, 0.27, 0.006, top=0.003, bot=0.003, segs=3, mats=[mats["walnut"], mats["walnut"]], parent=g)
    baffle = slab(name + "_baffle", 0.15, 0.255, 0.006, 0.004, mats=[mats["speaker_front"], mats["speaker_front"]], parent=g)
    baffle.rotation_euler = (math.radians(90), 0, 0); baffle.location = (0, -0.100, 0.135)
    cone = lathe(name + "_woofer", [(0.0, -0.012), (0.018, -0.010), (0.050, -0.002), (0.056, 0.0), (0.0, 0.0)], mats["cone"], parent=g, steps=48)
    cone.rotation_euler = (math.radians(90), 0, 0); cone.location = (0, -0.104, 0.095)
    tw = cyl(name + "_tweeter", 0.014, 0.004, (0, -0.105, 0.205), mats["cone"], rot=(math.radians(90), 0, 0), parent=g, verts=32)
    return g


def headphones(loc, mats):
    g = empty("headphones", loc)
    cyl("hp_base", 0.055, 0.010, (0, 0, 0.005), mats["alu_dark"], parent=g, verts=48, bevel=0.002)
    cyl("hp_post", 0.007, 0.26, (0, 0, 0.135), mats["alu_dark"], parent=g, verts=24)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.085, minor_radius=0.012, major_segments=48, minor_segments=12, location=(0, 0, 0.255),
                                     rotation=(math.radians(90), 0, 0))
    band = bpy.context.active_object; band.name = "hp_band"; band.data.materials.append(mats["leather"]); band.parent = g
    band.location = (0, 0, 0.255); band.data.shade_smooth()
    for s in (-1, 1):
        cup = lathe(f"hp_cup{s}", [(0.0, 0.0), (0.045, 0.0), (0.048, 0.010), (0.046, 0.030), (0.0, 0.034)], mats["hp_shell"], parent=g, steps=48)
        cup.rotation_euler = (0, math.radians(90 * s), 0); cup.location = (s * 0.068, 0, 0.205)
        pad = cyl(f"hp_pad{s}", 0.043, 0.018, (s * 0.083, 0, 0.205), mats["leather"], rot=(0, math.radians(90), 0), parent=g, verts=48, bevel=0.006)
    return g


def desk_lamp(loc, mats):
    """A slim warm table lamp: weighted disc base, a cranked arm, a deep cone shade over an exposed bulb."""
    g = empty("lamp", loc)
    cyl("lamp_base", 0.075, 0.016, (0, 0, 0.008), mats["lamp_metal"], parent=g, verts=64, bevel=0.004)
    cyl("lamp_stem", 0.006, 0.40, (0, 0, 0.215), mats["lamp_metal"], parent=g, verts=24)
    arm = cyl("lamp_arm", 0.005, 0.24, (0.10, 0, 0.415), mats["lamp_metal"], rot=(0, math.radians(70), 0), parent=g, verts=24)
    shade = lathe("lamp_shade", [(0.010, 0.0), (0.030, -0.010), (0.062, -0.075), (0.066, -0.090), (0.0, -0.090)], mats["lamp_metal"], parent=g, steps=64)
    shade.location = (0.21, 0, 0.455)
    sol = shade.modifiers.new("t", "SOLIDIFY"); sol.thickness = 0.0015
    inner = mats["lamp_inner"]
    bulb = cyl("lamp_bulb_glass", 0.018, 0.03, (0.21, 0, 0.405), mats["bulb"], parent=g, verts=24, bevel=0.008)
    point_light("lamp_bulb", (0.21, 0, 0.400), blackbody(LOOK3["warm_k"]), LOOK3["lamp_w"], 0.016, parent=g)
    return g


def globe_lamp(loc, mats):
    """A warm opal-glass globe on a slim bronze stem: the desk's visible practical."""
    g = empty("lamp", loc)
    cyl("lamp_base", 0.06, 0.018, (0, 0, 0.009), mats["lamp_metal"], parent=g, verts=64, bevel=0.005)
    cyl("lamp_stem", 0.006, 0.26, (0, 0, 0.14), mats["lamp_metal"], parent=g, verts=24)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=64, ring_count=32, location=(0, 0, 0.345))
    glob = bpy.context.active_object; glob.name = "lamp_globe"; glob.data.shade_smooth(); glob.parent = g; glob.location = (0, 0, 0.345)
    glob.data.materials.append(mats["opal"])
    point_light("lamp_bulb", (0, 0, 0.345), blackbody(LOOK3["warm_k"]), LOOK3["lamp_w"], 0.05, parent=g)
    return g


def snake_plant(loc, mats, rnd):
    """A snake plant in a stoneware pot: tall, stiff, slightly twisted blades."""
    g = empty("plant", loc)
    lathe("pot", [(0.0, 0.0), (0.075, 0.0), (0.085, 0.02), (0.095, 0.20), (0.088, 0.20), (0.0, 0.18)], mats["pot"], parent=g, steps=64)
    cyl("soil", 0.086, 0.004, (0, 0, 0.19), mats["soil"], parent=g, verts=48)
    for i in range(11):
        a = rnd.uniform(0, 2 * math.pi); r = rnd.uniform(0.0, 0.05); h = rnd.uniform(0.35, 0.62)
        leaf = slab(f"leaf{i}", rnd.uniform(0.035, 0.055), 0.004, h, 0.0015, mats=[mats["leaf"], mats["leaf"]], parent=g,
                    loc=(r * math.cos(a), r * math.sin(a), 0.19))
        leaf.rotation_euler = (rnd.uniform(-0.18, 0.18), rnd.uniform(-0.18, 0.18), rnd.uniform(0, math.pi))
        tw = leaf.modifiers.new("tw", "SIMPLE_DEFORM"); tw.deform_method = "TWIST"; tw.angle = rnd.uniform(-0.6, 0.6); tw.deform_axis = "Z"
    return g


def phone_on_stand(loc, yaw, tex, mats):
    g = empty("phone", loc, (0, 0, math.radians(yaw)))
    stand = slab("phone_stand", 0.07, 0.06, 0.006, 0.006, top=0.002, segs=2, mats=[mats["alu"], mats["alu"]], parent=g)
    lean = empty("phone_lean", (0, 0.012, 0.006), (math.radians(72), 0, 0), parent=g)
    body = slab("phone_body", 0.0715, 0.1505, 0.0078, 0.009, top=0.0028, bot=0.0028, segs=3, mats=[mats["phone"], mats["phone"]], parent=lean,
                loc=(0, 0.075, 0))
    scr = quad("phone_screen", 0.0665, 0.1440, screen("phone_scr", tex, 1.2), parent=lean, loc=(0, 0.075, 0.0080))
    body.location = (0, 0.075, 0.0)
    return g


def tablet_on_stand(loc, yaw, tex, mats):
    g = empty("tablet", loc, (0, 0, math.radians(yaw)))
    slab("tab_stand", 0.12, 0.09, 0.008, 0.008, top=0.002, segs=2, mats=[mats["alu"], mats["alu"]], parent=g)
    lean = empty("tab_lean", (0, 0.02, 0.008), (math.radians(68), 0, 0), parent=g)
    slab("tab_body", 0.178, 0.248, 0.0062, 0.012, top=0.0022, bot=0.0022, segs=3, mats=[mats["phone"], mats["phone"]], parent=lean, loc=(0, 0.124, 0))
    quad("tab_screen", 0.166, 0.236, screen("tab_scr", tex, 1.0), parent=lean, loc=(0, 0.124, 0.0064))
    return g


def mug(loc, mats):
    g = empty("mug", loc)
    body = lathe("mug_body", [(0.0, 0.0), (0.038, 0.0), (0.040, 0.004), (0.041, 0.090), (0.037, 0.090), (0.036, 0.008), (0.0, 0.008)], mats["stoneware"], parent=g, steps=64)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.024, minor_radius=0.0055, major_segments=48, minor_segments=16, location=(0.042, 0, 0.048), rotation=(math.radians(90), 0, 0))
    h = bpy.context.active_object; h.name = "mug_handle"; h.data.materials.append(mats["stoneware"]); h.parent = g; h.location = (0.043, 0, 0.048); h.data.shade_smooth()
    cyl("mug_coffee", 0.036, 0.001, (0, 0, 0.074), mats["coffee"], parent=g, verts=48)
    return g


def notebook(loc, yaw, mats):
    g = empty("notebook", loc, (0, 0, math.radians(yaw)))
    slab("nb_pages", 0.142, 0.206, 0.0105, 0.004, top=0.0005, mats=[mats["paper"], mats["paper"]], parent=g, loc=(0.001, 0, 0.0009))
    slab("nb_back", 0.146, 0.210, 0.0010, 0.005, top=0.0004, mats=[mats["bookcloth"], mats["bookcloth"]], parent=g)
    slab("nb_front", 0.146, 0.210, 0.0010, 0.005, top=0.0004, mats=[mats["bookcloth"], mats["bookcloth"]], parent=g, loc=(0, 0, 0.0114))
    slab("nb_band", 0.004, 0.212, 0.0128, 0.0006, mats=[mats["rubber"], mats["rubber"]], parent=g, loc=(0.058, 0, 0.0001))
    cyl("pen", 0.0045, 0.14, (0.12, -0.02, 0.0045), mats["pen"], rot=(0, math.radians(90), math.radians(-12)), parent=g, bevel=0.0015)
    return g


def books_row(name, x0, x1, y, z, depth, mats, rnd, max_h=0.26, lean_last=True):
    """A shelf's worth of books: varied heights, thicknesses and cloth colours, spines out, a few laid flat."""
    palette = [(0.20, 0.17, 0.12), (0.08, 0.10, 0.12), (0.30, 0.25, 0.18), (0.12, 0.06, 0.05), (0.42, 0.38, 0.30),
               (0.05, 0.06, 0.07), (0.15, 0.18, 0.16), (0.26, 0.10, 0.06), (0.55, 0.50, 0.42)]
    x = x0
    k = 0
    while x < x1 - 0.02:
        t = rnd.uniform(0.018, 0.045); hgt = rnd.uniform(0.17, max_h); d = depth * rnd.uniform(0.75, 0.95)
        if x + t > x1:
            break
        c = rnd.choice(palette)
        key = f"bk_{c}"
        mat = bpy.data.materials.get(key) or fabric(key, c, rough=0.75, bump=0.1, scale=500)
        slab(f"{name}_{k}", t, d, hgt, 0.0015, top=0.0008, segs=2, n=2, mats=[mat, mat], loc=(x + t / 2, y, z))
        x += t + rnd.uniform(0.0, 0.004)
        k += 1
        if rnd.random() < 0.08:
            x += rnd.uniform(0.05, 0.12)                  # a gap where a book is out


# ── the room ────────────────────────────────────────────────────────────────────────────────────────────────

def build_room3(state, tex_dir):
    T = lambda f: os.path.join(tex_dir, f)
    rnd = random.Random(7)
    mats = {
        "walnut": wood("walnut"), "walnut_shelf": wood("walnut_shelf", scale=2.2),
        "alu": V.aluminium("alu_props", None), "alu_dark": principled("alu_dark3", (0.06, 0.062, 0.066), metal=1.0, rough=0.38)[0],
        "monitor": matte_plastic("monitor_black", (0.018, 0.018, 0.02), rough=0.45),
        "kb_case": principled("kb_case", (0.05, 0.052, 0.056), metal=1.0, rough=0.42)[0],
        "keycap3": matte_plastic("keycap3", (0.030, 0.031, 0.034), rough=0.62, var=0.06, scale=300),
        "keycap_accent": matte_plastic("keycap_accent", (0.55, 0.42, 0.24), rough=0.55, var=0.04, scale=300),
        "mouse": matte_plastic("mouse3", (0.025, 0.025, 0.028), rough=0.38),
        "rubber": principled("rubber3", (0.015, 0.015, 0.016), rough=0.85)[0],
        "speaker_front": fabric("speaker_cloth", (0.03, 0.03, 0.032), rough=0.9, bump=0.35, scale=1800),
        "cone": matte_plastic("cone", (0.04, 0.04, 0.042), rough=0.7),
        "leather": principled("leather", (0.035, 0.03, 0.028), rough=0.55)[0], "hp_shell": matte_plastic("hp_shell", (0.04, 0.04, 0.043), rough=0.4),
        "lamp_metal": principled("lamp_metal", (0.025, 0.025, 0.027), metal=0.9, rough=0.35)[0],
        "lamp_inner": principled("lamp_inner", (0.8, 0.75, 0.65), rough=0.5)[0],
        "bulb": emitter("bulb_glow", blackbody(LOOK3["warm_k"]), 22.0),
        "phone": principled("phone_body", (0.02, 0.02, 0.022), metal=0.8, rough=0.3)[0],
        "stoneware": matte_plastic("stoneware", (0.035, 0.036, 0.04), rough=0.5, var=0.1, scale=60),
        "coffee": principled("coffee3", (0.02, 0.012, 0.008), rough=0.05)[0],
        "paper": principled("paper3", (0.72, 0.70, 0.66), rough=0.85)[0], "bookcloth": fabric("nbcloth", (0.06, 0.065, 0.075)),
        "pen": principled("pen3", (0.03, 0.03, 0.033), metal=1.0, rough=0.25)[0],
        "opal": emitter("opal_glow", blackbody(LOOK3["warm_k"]), 6.0),
        "pot": matte_plastic("pot", (0.30, 0.28, 0.25), rough=0.7, var=0.1, scale=30),
        "soil": principled("soil", (0.02, 0.015, 0.01), rough=1.0)[0],
        "leaf": matte_plastic("leaf", (0.03, 0.07, 0.035), rough=0.45, var=0.1, scale=25),
    }
    # desk: walnut top, a slim steel frame and a drawer unit on the left
    D = DESK
    desk = slab("desk", D["w"], D["d"], D["t"], 0.006, top=0.0015, bot=0.0015, segs=3, mats=[mats["walnut"], mats["walnut"]],
                loc=(D["x"], D["y"], -D["t"]))
    steel = principled("steel3", (0.03, 0.031, 0.033), metal=1.0, rough=0.45)[0]
    for lx in (D["x"] - D["w"] / 2 + 0.05, D["x"] + D["w"] / 2 - 0.05):
        for ly in (D["y"] - D["d"] / 2 + 0.05, D["y"] + D["d"] / 2 - 0.05):
            slab(f"desk_leg{lx:.2f}{ly:.2f}", 0.045, 0.045, 0.715, 0.004, mats=[steel, steel], loc=(lx, ly, FLOOR))
    dr = slab("drawers", 0.42, 0.60, 0.62, 0.006, top=0.002, segs=2, mats=[mats["walnut"], mats["walnut"]], loc=(-0.55, D["y"] + 0.03, FLOOR + 0.02))
    for i, z in enumerate((-0.18, -0.40, -0.60)):
        slab(f"drawer_pull{i}", 0.14, 0.012, 0.012, 0.003, mats=[mats["alu_dark"], mats["alu_dark"]], loc=(-0.55, D["y"] - 0.272, z))
    # felt desk mat under keyboard and mouse
    felt = fabric("deskmat", (0.045, 0.047, 0.05), rough=0.92, bump=0.15, scale=1500)
    slab("deskmat", 0.86, 0.36, 0.003, 0.012, top=0.001, segs=2, mats=[felt, felt], loc=(0.66, -0.09, 0.0))
    # monitor riser (walnut) with a warm LED strip under its front lip
    rz = 0.085
    riser = slab("riser", 1.72, 0.24, 0.022, 0.004, top=0.0015, segs=2, mats=[mats["walnut"], mats["walnut"]], loc=(0.25, 0.33, rz - 0.022))
    for x in (-0.58, 1.08):
        slab(f"riser_leg{x}", 0.03, 0.22, rz - 0.022, 0.003, mats=[mats["walnut"], mats["walnut"]], loc=(x, 0.33, 0.0))
    warm = blackbody(LOOK3["warm_k"])
    led = emitter("led_warm", warm, LOOK3["led_strength"])
    slab("riser_led", 1.64, 0.006, 0.004, 0.001, mats=[led, led], loc=(0.25, 0.214, rz - 0.026))
    # three displays: code left, DeveloperOS centre, Aegis right
    mon_l, _ = monitor("mon_left", (-0.40, 0.31, rz), 24, T("mon_code.png"), mats)
    mon_c, _ = monitor("mon_centre", (0.25, 0.36, rz), 0, T("mon_devos.png"), mats)
    mon_r, _ = monitor("mon_right", (0.90, 0.31, rz), -24, T("mon_aegis.png"), mats)
    # light bar on the centre display (warm-white, aimed at the desk)
    slab("lightbar", 0.45, 0.032, 0.022, 0.008, top=0.003, segs=2, mats=[mats["alu_dark"], mats["alu_dark"]], loc=(0.25, 0.345, rz + 0.10 + 0.012 + 0.336 + 0.026))
    lb = bpy.data.lights.new("lightbar_light", "AREA"); lb.shape, lb.size, lb.size_y = "RECTANGLE", 0.42, 0.02
    lb.energy, lb.color = LOOK3["lightbar_w"], blackbody(4000)
    lbo = link(bpy.data.objects.new("lightbar_light", lb)); lbo.location = (0.25, 0.33, rz + 0.48)
    lbo.rotation_euler = (math.radians(28), 0, 0); lbo.visible_camera = False
    # desk props
    keyboard((0.52, -0.11, 0.003), -1.5, mats)
    mouse((0.86, -0.09, 0.003), -6, mats)
    phone_on_stand((0.42, 0.12, 0.0), -8, T("poker_home.png"), mats)
    tablet_on_stand((1.18, 0.10, 0.0), -28, T("poker_stats.png"), mats)
    speaker("spk_left", (-0.74, 0.32, 0.0), 12, mats)
    speaker("spk_right", (1.25, 0.32, 0.0), -12, mats)
    headphones((-0.66, -0.02, 0.0), mats)
    globe_lamp((-0.80, 0.08, 0.0), mats)
    mug((-0.30, -0.10, 0.0), mats)
    notebook((-0.50, -0.17, 0.0), 8, mats)
    hub = slab("hub", 0.11, 0.05, 0.016, 0.006, top=0.002, segs=2, mats=[mats["alu"], mats["alu"]], loc=(0.05, 0.20, 0.0))
    slab("hub_led", 0.003, 0.002, 0.002, 0.0003, mats=[emitter("hub_led", (0.9, 0.95, 1.0), 4.0)] * 2, loc=(0.09, 0.174, 0.009))
    cab = principled("cable3", (0.03, 0.03, 0.032), rough=0.55)[0]
    r = 0.0021
    cable("lap_cable", [(-BW / 2 - 0.004, 0.050, FOOT + 0.0045), (-BW / 2 - 0.03, 0.06, r), (-0.24, 0.16, r), (-0.10, 0.20, r), (0.0, 0.20, r)], r, cab)
    cable("kb_cable", [(0.52, -0.05, 0.012), (0.50, 0.05, r), (0.30, 0.14, r), (0.08, 0.20, r)], 0.0018, cab)
    for i, x in enumerate((-0.40, 0.25, 0.90)):
        cable(f"mon_cable{i}", [(x, 0.40, rz + 0.12), (x + 0.02, 0.44, rz), (x + 0.03, 0.46, -0.10), (x + 0.03, 0.46, -0.70)], 0.003, cab)

    # room shell: walls, floor, ceiling; the back wall carries the corner window
    plaster, pnt, pp = principled("plaster3", (0.10, 0.095, 0.09), rough=0.9)
    pn = noise(pnt, 1.5, detail=6.0, rough=0.62)
    pmix = pnt.nodes.new("ShaderNodeMix"); pmix.data_type = "RGBA"
    pmix.inputs["A"].default_value = (0.085, 0.080, 0.076, 1); pmix.inputs["B"].default_value = (0.12, 0.115, 0.108, 1)
    pnt.links.new(pn.outputs["Fac"], pmix.inputs["Factor"]); pnt.links.new(pmix.outputs["Result"], pp.inputs["Base Color"])
    pb = pnt.nodes.new("ShaderNodeBump"); pb.inputs["Strength"].default_value = 0.1
    pn2 = noise(pnt, 80.0, detail=3.0); pnt.links.new(pn2.outputs["Fac"], pb.inputs["Height"]); pnt.links.new(pb.outputs["Normal"], pp.inputs["Normal"])
    W, WT = WIN, 0.12
    for nm, (xa, xb, za, zb) in (("wall_back_l", (LEFT_X, W["x0"], FLOOR, CEIL)), ("wall_sill", (W["x0"], W["x1"], FLOOR, W["z0"])),
                                 ("wall_head", (W["x0"], W["x1"], W["z1"], CEIL)), ("wall_back_r", (W["x1"], RIGHT_X, FLOOR, CEIL))):
        slab(nm, xb - xa, WT, zb - za, 0.0005, mats=[plaster, plaster], loc=((xa + xb) / 2, WALL_Y + WT / 2, za))
    slab("wall_left", 0.06, 8.5, CEIL - FLOOR, 0.0005, mats=[plaster, plaster], loc=(LEFT_X - 0.03, -3.7, FLOOR))
    slab("wall_right", 0.06, 8.5, CEIL - FLOOR, 0.0005, mats=[plaster, plaster], loc=(RIGHT_X + 0.03, -3.7, FLOOR))
    slab("ceiling", 5.4, 8.5, 0.02, 0.0005, mats=[plaster, plaster], loc=(0.2, -3.7, CEIL))
    floor_m = wood("oakfloor", base=(0.10, 0.07, 0.045), dark=(0.045, 0.03, 0.02), scale=1.4, rough=0.5, coat=0.15, along="Y")
    slab("floor", 5.4, 8.5, 0.02, 0.0005, mats=[floor_m, floor_m], loc=(0.2, -3.7, FLOOR - 0.02))
    rug = fabric("rug", (0.030, 0.029, 0.028), rough=0.95, bump=0.6, scale=600)
    rug.node_tree.nodes["Principled BSDF"].inputs["Sheen Weight"].default_value = 0.08
    slab("rug", 2.2, 1.7, 0.012, 0.01, top=0.004, segs=2, mats=[rug, rug], loc=(0.45, -0.75, FLOOR))
    # window: black aluminium frame and mullion, sill, half-drawn venetian blinds
    frame = principled("winframe", (0.012, 0.012, 0.013), metal=0.7, rough=0.4)[0]
    FY = WALL_Y + 0.07
    for nm, dims, loc in (("wf_l", (0.05, 0.05, W["z1"] - W["z0"]), (W["x0"] + 0.025, FY, W["z0"])),
                          ("wf_r", (0.05, 0.05, W["z1"] - W["z0"]), (W["x1"] - 0.025, FY, W["z0"])),
                          ("wf_m", (0.04, 0.05, W["z1"] - W["z0"]), ((W["x0"] + W["x1"]) / 2, FY, W["z0"])),
                          ("wf_b", (W["x1"] - W["x0"], 0.05, 0.05), ((W["x0"] + W["x1"]) / 2, FY, W["z0"])),
                          ("wf_t", (W["x1"] - W["x0"], 0.05, 0.05), ((W["x0"] + W["x1"]) / 2, FY, W["z1"] - 0.05))):
        slab(nm, *dims, 0.002, mats=[frame, frame], loc=loc)
    sill = principled("sill3", (0.16, 0.155, 0.15), rough=0.5)[0]
    slab("sill", W["x1"] - W["x0"] + 0.06, 0.16, 0.025, 0.003, top=0.002, segs=2, mats=[sill, sill], loc=((W["x0"] + W["x1"]) / 2, WALL_Y + 0.03, W["z0"] - 0.025))
    slat_m = principled("slat3", (0.09, 0.09, 0.092), metal=0.4, rough=0.45)[0]
    bz0, n_sl = 1.10, 18
    for i in range(n_sl):
        z = W["z1"] - 0.05 - i * (W["z1"] - 0.05 - bz0) / (n_sl - 1)
        s = slab(f"slat{i}", W["x1"] - W["x0"] - 0.06, 0.028, 0.0012, 0.0005, mats=[slat_m, slat_m],
                 loc=((W["x0"] + W["x1"]) / 2, WALL_Y + 0.03, z))
        s.rotation_euler = (math.radians(-28), 0, 0)
    slab("blind_rail", W["x1"] - W["x0"] - 0.05, 0.03, 0.012, 0.002, mats=[slat_m, slat_m], loc=((W["x0"] + W["x1"]) / 2, WALL_Y + 0.03, bz0 - 0.02))
    # a low walnut sideboard under the window, a plant and a few books on it
    sb_x0, sb_x1 = W["x0"] + 0.15, RIGHT_X - 0.05
    slab("sideboard", sb_x1 - sb_x0, 0.42, 0.55, 0.006, top=0.002, segs=2, mats=[mats["walnut"], mats["walnut"]], loc=((sb_x0 + sb_x1) / 2, WALL_Y - 0.23, FLOOR + 0.10))
    for x in (sb_x0 + 0.04, sb_x1 - 0.04):
        slab(f"sb_leg{x:.2f}", 0.03, 0.36, 0.10, 0.003, mats=[mats["alu_dark"], mats["alu_dark"]], loc=(x, WALL_Y - 0.23, FLOOR))
    snake_plant((sb_x1 - 0.22, WALL_Y - 0.25, FLOOR + 0.65), mats, rnd)
    books_row("sb_books", sb_x0 + 0.08, sb_x0 + 0.40, WALL_Y - 0.25, FLOOR + 0.65, 0.20, mats, rnd, max_h=0.24)
    # outside: night sky and two layers of city, pure emitters
    skym = bpy.data.materials.new("sky3"); skym.use_nodes = True
    snt = skym.node_tree
    for nd in list(snt.nodes):
        snt.nodes.remove(nd)
    so = snt.nodes.new("ShaderNodeOutputMaterial"); em = snt.nodes.new("ShaderNodeEmission")
    tc = snt.nodes.new("ShaderNodeTexCoord"); sep = snt.nodes.new("ShaderNodeSeparateXYZ"); snt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    rmp = snt.nodes.new("ShaderNodeValToRGB")
    rmp.color_ramp.elements[0].color = (0.035, 0.05, 0.13, 1); rmp.color_ramp.elements[1].color = (0.004, 0.007, 0.025, 1)
    mr = snt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -10.0, 40.0
    snt.links.new(sep.outputs["Y"], mr.inputs["Value"]); snt.links.new(mr.outputs["Result"], rmp.inputs["Fac"])
    snt.links.new(rmp.outputs["Color"], em.inputs["Color"]); em.inputs["Strength"].default_value = LOOK3["sky_strength"]
    snt.links.new(em.outputs[0], so.inputs["Surface"])
    quad("sky", 300.0, 120.0, skym, loc=(20.0, 160.0, 20.0), rot=(math.radians(90), 0, 0))
    for nm, tex, y, w, h, zc, xo in (("city_far", "city_far.png", 140.0, 260.0, 60.0, -22.0, 30.0), ("city_near", "city_near.png", 70.0, 130.0, 34.0, -14.0, 18.0)):
        cm = bpy.data.materials.new(nm); cm.use_nodes = True
        cnt = cm.node_tree
        for nd in list(cnt.nodes):
            cnt.nodes.remove(nd)
        co = cnt.nodes.new("ShaderNodeOutputMaterial")
        ci = cnt.nodes.new("ShaderNodeTexImage"); ci.image = bpy.data.images.load(T(tex))
        ce = cnt.nodes.new("ShaderNodeEmission"); ce.inputs["Strength"].default_value = LOOK3["city_strength"]
        cnt.links.new(ci.outputs["Color"], ce.inputs["Color"])
        ct = cnt.nodes.new("ShaderNodeBsdfTransparent"); cx = cnt.nodes.new("ShaderNodeMixShader")
        cnt.links.new(ci.outputs["Alpha"], cx.inputs[0]); cnt.links.new(ct.outputs[0], cx.inputs[1]); cnt.links.new(ce.outputs[0], cx.inputs[2])
        cnt.links.new(cx.outputs[0], co.inputs["Surface"])
        ob = quad(nm, w, h, cm, loc=(xo, y, zc), rot=(math.radians(90), 0, 0)); ob.visible_shadow = False
    # the window's light into the room: cool sky fill through the opening (camera-invisible, it is the sky)
    wl = bpy.data.lights.new("window_light", "AREA"); wl.shape = "RECTANGLE"
    wl.size, wl.size_y = W["x1"] - W["x0"], W["z1"] - W["z0"]; wl.energy = LOOK3["window_w"] * state.get("window", 1.0); wl.color = blackbody(11000)
    wo = link(bpy.data.objects.new("window_light", wl)); wo.location = ((W["x0"] + W["x1"]) / 2, WALL_Y + 0.25, (W["z0"] + W["z1"]) / 2)
    wo.rotation_euler = (Vector((0, -1, -0.15))).to_track_quat("-Z", "Y").to_euler(); wo.visible_camera = False; wo.visible_glossy = False

    # shelving: open walnut shelves against the back wall, left of the desk, warm strips under each shelf
    sx0, sx1, sy0, sy1 = -1.82, -0.98, WALL_Y - 0.30, WALL_Y
    for x in (sx0 + 0.015, sx1 - 0.015):
        slab(f"shelf_side{x:.2f}", 0.03, sy1 - sy0, 2.30, 0.002, mats=[mats["walnut_shelf"], mats["walnut_shelf"]], loc=(x, (sy0 + sy1) / 2, FLOOR))
    for i, z in enumerate((-0.45, -0.05, 0.35, 0.75, 1.15)):
        slab(f"shelf{i}", sx1 - sx0 - 0.06, sy1 - sy0, 0.025, 0.002, top=0.001, segs=2, mats=[mats["walnut_shelf"], mats["walnut_shelf"]],
             loc=((sx0 + sx1) / 2, (sy0 + sy1) / 2, z))
        slab(f"shelf_led{i}", sx1 - sx0 - 0.08, 0.006, 0.004, 0.001, mats=[led, led], loc=((sx0 + sx1) / 2, sy0 + 0.02, z - 0.004))
        if i < 4:
            books_row(f"books{i}", sx0 + 0.06, sx1 - 0.26 if i % 2 else sx1 - 0.06, (sy0 + sy1) / 2 + 0.02, z + 0.025, 0.22, mats, rnd,
                      max_h=0.30 if i < 3 else 0.26)
    # a few objects among the books: a turned vase, a small framed photo, a box
    vase = lathe("vase", [(0.0, 0.0), (0.035, 0.0), (0.05, 0.05), (0.045, 0.12), (0.022, 0.17), (0.024, 0.19), (0.0, 0.19)],
                 matte_plastic("vase_glaze", (0.40, 0.36, 0.30), rough=0.35, var=0.1, scale=20))
    vase.location = (sx1 - 0.15, (sy0 + sy1) / 2, -0.05 + 0.025)
    ph = slab("photo_frame", 0.13, 0.018, 0.17, 0.002, mats=[mats["alu_dark"], mats["alu_dark"]], loc=(sx1 - 0.16, sy0 + 0.12, 0.75 + 0.025))
    ph.rotation_euler = (math.radians(-8), 0, math.radians(10))
    slab("box", 0.20, 0.16, 0.10, 0.003, top=0.001, segs=2, mats=[mats["bookcloth"], mats["bookcloth"]], loc=(sx1 - 0.18, (sy0 + sy1) / 2, 1.15 + 0.025))
    # the framed T Poker print, above the left display
    pw, phh = 0.40, 0.55
    fr = slab("print_frame", pw + 0.04, phh + 0.04, 0.025, 0.002, top=0.001, segs=2, mats=[mats["alu_dark"], mats["alu_dark"]])
    fr.rotation_euler = (math.radians(90), 0, 0); fr.location = (-0.55, WALL_Y, 0.90)
    glassy = image_mat("print_img", T("poster_tpoker.png"), rough=0.35)
    quad("print", pw, phh, glassy, loc=(-0.55, WALL_Y - 0.0255, 0.90), rot=(math.radians(90), 0, 0))
    # the chair, pulled out, its back to the camera (foreground right, out of focus)
    chair = empty("chair", (1.62, -1.15, FLOOR), (0, 0, math.radians(-38)))
    mesh = fabric("chair_mesh", (0.012, 0.012, 0.013), rough=0.8, bump=0.5, scale=700)
    mesh.node_tree.nodes["Principled BSDF"].inputs["Sheen Weight"].default_value = 0.05
    seat = slab("chair_seat", 0.50, 0.48, 0.07, 0.06, top=0.02, bot=0.01, segs=4, mats=[mesh, mesh], parent=chair, loc=(0, 0, 0.44))
    frame_m = principled("chair_frame", (0.02, 0.02, 0.022), metal=0.3, rough=0.4)[0]
    bk = empty("chair_back", (0, -0.25, 0.86), (math.radians(100), 0, 0), parent=chair)
    rim = slab("chair_back_rim", 0.48, 0.64, 0.028, 0.10, top=0.008, bot=0.008, segs=4, mats=[frame_m, frame_m], parent=bk, loc=(0, 0, -0.014))
    panel = slab("chair_back_mesh", 0.42, 0.58, 0.032, 0.08, mats=[mesh, mesh], parent=bk, loc=(0, 0, -0.016))
    for ob in (rim, panel):
        bend = ob.modifiers.new("bend", "SIMPLE_DEFORM"); bend.deform_method = "BEND"; bend.angle = math.radians(25); bend.deform_axis = "Y"
    slab("chair_spine", 0.05, 0.03, 0.42, 0.01, mats=[frame_m, frame_m], parent=chair, loc=(0, -0.28, 0.46))
    blk = mats["rubber"]
    for s in (-1, 1):
        slab(f"chair_arm{s}", 0.06, 0.26, 0.025, 0.012, top=0.006, segs=3, mats=[blk, blk], parent=chair, loc=(s * 0.27, 0.02, 0.66))
        cyl(f"chair_armpost{s}", 0.014, 0.18, (s * 0.27, -0.02, 0.57), blk, parent=chair, verts=16)
    cyl("chair_gas", 0.025, 0.30, (0, 0, 0.27), mats["alu_dark"], parent=chair, verts=24)
    for k in range(5):
        a = k * 2 * math.pi / 5
        leg = slab(f"chair_leg{k}", 0.30, 0.045, 0.03, 0.01, mats=[blk, blk], parent=chair, loc=(0.15 * math.cos(a), 0.15 * math.sin(a), 0.07))
        leg.rotation_euler = (0, 0, a)
        cyl(f"chair_caster{k}", 0.025, 0.03, (0.30 * math.cos(a), 0.30 * math.sin(a), 0.03), blk, rot=(math.radians(90), 0, a), parent=chair, verts=16)
    # room fill: the dim apartment behind the camera (diffuse only)
    fl = bpy.data.lights.new("room_fill", "AREA"); fl.shape, fl.size, fl.size_y = "RECTANGLE", 3.0, 1.6
    fl.energy, fl.color = LOOK3["fill_w"] * state.get("room", 1.0), blackbody(3600)
    fo = link(bpy.data.objects.new("room_fill", fl)); fo.location = (0.4, -7.0, 1.4)
    fo.rotation_euler = (Vector((0, 1, -0.35))).to_track_quat("-Z", "Y").to_euler(); fo.visible_camera = False; fo.visible_glossy = False
    world = bpy.data.worlds.new("w3"); world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.01, 0.014, 0.03, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.2
    bpy.context.scene.world = world
    return {"desk": desk}


def build(state, tex_dir):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    h = V.build_laptop(state, tex_dir)
    h.update(build_room3(state, tex_dir))
    if state.get("screen", 0) > 0 and state.get("spill", 1.0) > 0:
        sp = bpy.data.lights.new("screen_spill", "AREA")
        sp.shape, sp.size, sp.size_y = "RECTANGLE", SCREEN_W, SCREEN_H
        sp.color = blackbody(7000); sp.energy = 0.2 * state["screen"] * state.get("spill", 1.0); sp.spread = math.radians(160)
        so = link(bpy.data.objects.new("screen_spill", sp))
        so.parent = h["screen"]; so.location = (0, 0, 0.004); so.rotation_euler = (math.pi, 0, 0)
        so.visible_camera = False; so.visible_glossy = False
    scene.render.engine = "CYCLES"
    return {**h, "scene": scene}
