"""The entrance scene (production). Adapted mechanically from preview/scene.py —
the approved K0/K1/K2 preview look (spec §4.6). Look-dev changes happen here in Plan 2.

build_scene(out_dir, lid_deg, screen_on) builds the studio into a fresh file and returns
handles; cameras and render settings belong to render.py.
"""
import math

import bpy  # must precede bmesh in the pip bpy module
import bmesh
from mathutils import Vector

HERE = ""
scene = None
col = None


def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def pbr(name, color, metal=0.0, rough=0.5, aniso=0.0, coat=0.0, coat_rough=0.05, spec=0.5, emit=None, strength=0.0, image=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Anisotropic"].default_value = aniso
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    p.inputs["Specular IOR Level"].default_value = spec
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(HERE + image)
        tex.interpolation = "Cubic"
        nt.links.new(tex.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = strength
        p.inputs["Base Color"].default_value = (0, 0, 0, 1)
        p.inputs["Specular IOR Level"].default_value = 0.08
        p.inputs["Roughness"].default_value = 0.12
    elif emit:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = strength
    return m


def glass_mat(name, tint):
    """Tower glass: transparent + glossy mixed by Fresnel (no refraction, no caustics)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tr.inputs["Color"].default_value = (*tint, 1)
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.02
    fr = nt.nodes.new("ShaderNodeFresnel")
    fr.inputs["IOR"].default_value = 1.5
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fr.outputs[0], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(gl.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m


def add(ob):
    col.objects.link(ob)
    return ob


def box(name, dims, loc, mat, bevel=0.0, segs=3, rot=(0, 0, 0), parent=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(dims), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    ob = add(bpy.data.objects.new(name, me))
    ob.location, ob.rotation_euler = loc, rot
    me.materials.append(mat)
    if bevel:
        b = ob.modifiers.new("b", "BEVEL")
        b.width, b.segments, b.limit_method, b.harden_normals = bevel, segs, "ANGLE", True
        me.shade_smooth()
    if parent:
        ob.parent = parent
    return ob


def cyl(name, r, depth, loc, mat, rot=(0, 0, 0), parent=None, verts=32):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=depth)
    bm.to_mesh(me)
    bm.free()
    ob = add(bpy.data.objects.new(name, me))
    ob.location, ob.rotation_euler = loc, rot
    me.materials.append(mat)
    me.shade_smooth()
    if parent:
        ob.parent = parent
    return ob


def torus(name, R, r, loc, mat, rot=(0, 0, 0), parent=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=48, minor_segments=12, location=(0, 0, 0))
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(mat)
    ob.data.shade_smooth()
    ob.location, ob.rotation_euler = loc, rot
    if parent:
        ob.parent = parent
    return ob


def quad(name, w, h, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """UV'd quad in the XZ plane facing -Y."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((-w / 2, 0, -h / 2)), bm.verts.new((w / 2, 0, -h / 2)), bm.verts.new((w / 2, 0, h / 2)), bm.verts.new((-w / 2, 0, h / 2))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for loop in f.loops:
        x, _, z = loop.vert.co
        loop[uv].uv = ((x + w / 2) / w, (z + h / 2) / h)
    bm.to_mesh(me)
    bm.free()
    ob = add(bpy.data.objects.new(name, me))
    me.materials.append(mat)
    ob.location, ob.rotation_euler = loc, rot
    if parent:
        ob.parent = parent
    return ob


def area(name, loc, target, color, power, sx, sy=None, glossy_only=False, camera=False):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.color, ld.shape = power, color, "RECTANGLE"
    ld.size, ld.size_y = sx, sy or sx
    ob = add(bpy.data.objects.new(name, ld))
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    ob.visible_camera = camera
    if glossy_only:
        ob.visible_diffuse = False
        ob.visible_transmission = False
        ob.visible_volume_scatter = False
    return ob


def point(name, loc, color, power, radius):
    ld = bpy.data.lights.new(name, "POINT")
    ld.energy, ld.color, ld.shadow_soft_size = power, color, radius
    ob = add(bpy.data.objects.new(name, ld))
    ob.location = loc
    return ob


def cable(name, pts, radius, mat):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = add(bpy.data.objects.new(name, cu))
    cu.materials.append(mat)
    return ob



# Look-dev values (Plan 2 Task 8): every tuned number lives here, so a pass is reviewable as one diff.
LOOKDEV = {
    # 1 colour separation — the blue lives in the bias light, not over the whole room
    "L1_halo": 44, "L2_graze": 18, "L5_key": 26, "L6_rim": 24, "L0_fill": 4, "slat": "#18191c", "led_status": "#9cc4ff",
    # the "10%": the displays light the room (camera-invisible spill in front of each screen, lg_monitors)
    "spill_c": 8.0, "spill_side": 6.0, "spill_colour": "#8fb0e8",
    # 5% warm, never on the laptop's face
    "lamp_bulb": 3.6,
    # 2 the laptop as product photography
    "alu": "#9aa0a8", "alu_rough": 0.30, "alu_aniso": 0.25, "trackpad": "#8d939b", "trackpad_coat": 0.0, "trackpad_rough": 0.42, "keys": "#0c0d0f", "keys_rough": 0.45, "key_backlight": 0.12,
    # 3 reflections: the lid-sweep card peaks mid-lid and is gone by the last lid frames
    "sweep_peak": 14.0, "L7_card": 12,
}


def build_scene(out_dir: str, lid_deg: float, screen_on: bool) -> dict:
    global HERE, scene, col
    HERE = out_dir
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    col = bpy.context.collection
    # ── palette & materials ─────────────────────────────────────────────────
    ICE, CYAN, DEEP, AMBER = lin("#8cc0ff"), lin("#5fd6ff"), lin("#1c3fd6"), lin("#ffab5e")
    alu = pbr("alu", lin(LOOKDEV["alu"]), metal=1, rough=LOOKDEV["alu_rough"], aniso=LOOKDEV["alu_aniso"])
    alu_chamfer = pbr("chamfer", lin("#d5dae0"), metal=1, rough=0.08)
    alu_dark = pbr("alu_dark", lin("#2a2e35"), metal=1, rough=0.32, aniso=0.3)
    alu_rim = pbr("rim", lin("#6c7076"), metal=1, rough=0.25, aniso=0.5)
    black = pbr("black", lin("#0c0d10"), rough=0.5)
    satin_black = pbr("satin", lin("#0b0c0e"), rough=0.35, coat=0.2)
    key_black = pbr("keys", lin(LOOKDEV["keys"]), rough=LOOKDEV["keys_rough"])
    pbt = pbr("pbt", lin("#1a1d22"), rough=0.62)
    pbt_enter = pbr("pbt_ice", lin("#7e97b8"), rough=0.6)
    screen_glass = pbr("sglass", lin("#030405"), rough=0.02, coat=1.0, coat_rough=0.02, spec=0.8)
    felt = pbr("felt", lin("#12151a"), rough=0.92)
    wall = pbr("plaster", lin("#0b0e14"), rough=0.95)
    slat = pbr("slat", lin(LOOKDEV["slat"]), rough=0.55)
    slat_back = pbr("slatfelt", lin("#050608"), rough=0.98)
    mobo = pbr("mobo", lin("#0e1320"), rough=0.6)
    tglass = glass_mat("tglass", lin("#b8c4d4"))
    white_led = pbr("wled", (0, 0, 0), emit=(1, 1, 1), strength=6)
    led_green = pbr("lgreen", (0, 0, 0), emit=lin(LOOKDEV["led_status"]), strength=6)   # status LEDs, ice: the hue lock bans green (Plan 2 decision 4)
    led_ice = pbr("lice", (0, 0, 0), emit=ICE, strength=8)
    led_cyan = pbr("lcyan", (0, 0, 0), emit=CYAN, strength=12)
    halo = pbr("halo", (0, 0, 0), emit=ICE, strength=1.6)
    opal = pbr("opal", (0, 0, 0), emit=lin("#ff9a45"), strength=0.9)
    verify = pbr("verify", (0, 0, 0), image="screen_verify.png", strength=1.35)
    write = pbr("write", (0, 0, 0), image="screen_write.png", strength=1.5)
    build = pbr("build", (0, 0, 0), image="screen_build.png", strength=1.35)
    lap_on = pbr("lapon", (0, 0, 0), image="screen_laptop.png", strength=1.7)
    pad_glyphs = pbr("pad", (0, 0, 0), image="pad_atlas.png", strength=1.2)
    cablem = pbr("cable", lin("#101216"), rough=0.6)

    desk = bpy.data.materials.new("desk")
    desk.use_nodes = True
    nt = desk.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Coat Weight"].default_value = 0.30
    p.inputs["Coat Roughness"].default_value = 0.18
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.0, 30.0, 1.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 8.0
    nt.links.new(mp.outputs["Vector"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*lin("#0c0b0a"), 1)
    ramp.color_ramp.elements[1].color = (*lin("#1d1915"), 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value, rr.inputs["To Max"].default_value = 0.40, 0.55
    nt.links.new(noise.outputs["Fac"], rr.inputs["Value"])
    nt.links.new(rr.outputs["Result"], p.inputs["Roughness"])

    # ── room ─────────────────────────────────────────────────────────────────
    box("wall", (6, 0.05, 3), (0, 1.24, 0.8), wall)
    box("sidewall", (0.05, 3, 3), (-2.2, 0.2, 0.8), wall)
    box("slatback", (2.9, 0.01, 1.7), (0, 1.205, 0.62), slat_back)
    s0 = box("slat", (0.028, 0.018, 1.7), (-1.43, 1.19, 0.62), slat, bevel=0.002, segs=2)
    arr = s0.modifiers.new("arr", "ARRAY")
    arr.count = 69
    arr.use_relative_offset = False
    arr.use_constant_offset = True
    arr.constant_offset_displace = (0.042, 0, 0)

    # homelab shelves (right, against the slats)
    for z in (0.50, 0.76):
        box(f"shelf{z}", (0.62, 0.22, 0.022), (1.30, 1.08, z), alu_dark, bevel=0.003)
        area(f"shelfstrip{z}", (1.30, 1.0, z + 0.2), (1.30, 1.02, z), ICE, 4, 0.5, 0.03)   # hidden, lights device fronts
    nas = box("nas", (0.17, 0.2, 0.19), (1.14, 1.08, 0.607), black, bevel=0.006)
    for i in range(4):
        box(f"bay{i}", (0.033, 0.004, 0.15), (1.083 + i * 0.038, 0.978, 0.607), satin_black, bevel=0.002, segs=2)
        box(f"bayled{i}", (0.006, 0.003, 0.006), (1.083 + i * 0.038, 0.975, 0.69), led_green if i < 3 else led_ice)
    box("switch", (0.30, 0.16, 0.044), (1.38, 1.08, 0.533), black, bevel=0.004)
    for i in range(8):
        box(f"port{i}", (0.022, 0.003, 0.016), (1.26 + i * 0.03, 0.999, 0.533), satin_black)
        box(f"portled{i}", (0.005, 0.003, 0.004), (1.26 + i * 0.03, 0.998, 0.548), led_green if i % 3 else led_ice)
    box("minipc", (0.13, 0.13, 0.05), (1.40, 1.08, 0.796), alu_dark, bevel=0.006)
    box("minipcled", (0.004, 0.003, 0.004), (1.36, 1.014, 0.79), white_led)
    box("router", (0.2, 0.12, 0.03), (1.16, 1.08, 0.786), black, bevel=0.005)

    # ── desk ─────────────────────────────────────────────────────────────────
    box("desk", (2.6, 1.0, 0.04), (0.05, 0.12, -0.02), desk, bevel=0.004, segs=3)
    box("mat", (1.22, 0.44, 0.003), (0.14, -0.03, 0.0015), felt, bevel=0.002, segs=2)

    # rail + arms + monitors
    box("rail", (1.9, 0.04, 0.02), (0.02, 1.15, 0.43), alu_rim, bevel=0.003)


    def monitor(name, w, h, loc, yaw, mat_screen, tilt=0.0):
        g = add(bpy.data.objects.new(name, None))
        g.location, g.rotation_euler = loc, (tilt, 0, yaw)
        box(name + "_body", (w + 0.016, 0.022, h + 0.016), (0, 0.012, 0), satin_black, bevel=0.004, parent=g)
        box(name + "_rimT", (w + 0.018, 0.024, 0.0025), (0, 0.012, h / 2 + 0.008), alu_rim, parent=g)
        box(name + "_rimB", (w + 0.018, 0.024, 0.0025), (0, 0.012, -h / 2 - 0.008), alu_rim, parent=g)
        box(name + "_back", (0.16, 0.04, 0.12), (0, 0.045, 0), satin_black, bevel=0.01, parent=g)
        quad(name + "_screen", w, h, mat_screen, parent=g, loc=(0, 0.0003, 0))
        return g


    mc = monitor("mon_c", 0.708, 0.398, (0.03, 0.66, 0.44), 0.0, write, tilt=math.radians(-4))
    mr = monitor("mon_r", 0.597, 0.336, (0.80, 0.54, 0.41), -0.52, build)
    ml = monitor("mon_l", 0.30, 0.53, (-0.60, 0.50, 0.43), 0.55, verify)
    for nm, (x, y, z) in (("c", (0.03, 0.71, 0.44)), ("r", (0.76, 0.62, 0.41)), ("l", (-0.57, 0.58, 0.48))):
        # articulated arm: rail → elbow → monitor back
        ex, ey = x * 0.85, 1.0
        cable(f"arm{nm}", [(x * 0.9, 1.14, 0.43), (ex, ey, 0.43), (x, y + 0.02, z)], 0.012, alu_dark)
    # light bar on the centre display
    box("lightbar", (0.40, 0.03, 0.016), (0.03, 0.645, 0.655), alu_dark, bevel=0.004)
    box("lightbar_diff", (0.38, 0.004, 0.004), (0.03, 0.632, 0.648), pbr("lbdiff", (0, 0, 0), emit=lin("#dfe8ff"), strength=4))

    # ── PC tower (right) ────────────────────────────────────────────────────
    tw = add(bpy.data.objects.new("tower", None))
    tw.location, tw.rotation_euler = (0.98, 0.34, 0.0), (0, 0, 0.62)
    TW, TD, TH = 0.23, 0.45, 0.47
    box("t_back", (0.008, TD, TH), (TW / 2, 0, TH / 2), alu_dark, parent=tw)
    box("t_top", (TW, TD, 0.012), (0, 0, TH - 0.006), alu_dark, bevel=0.003, parent=tw)
    box("t_bot", (TW, TD, 0.02), (0, 0, 0.01), alu_dark, bevel=0.003, parent=tw)
    box("t_front", (TW, 0.012, TH), (0, -TD / 2, TH / 2), alu_dark, bevel=0.003, parent=tw)
    box("t_rear", (TW, 0.012, TH), (0, TD / 2, TH / 2), alu_dark, parent=tw)
    g = quad("t_glass", TD - 0.02, TH - 0.03, tglass, parent=tw, loc=(-TW / 2, 0, TH / 2), rot=(0, 0, math.radians(90)))
    box("t_frit", (0.004, TD, 0.012), (-TW / 2, 0, TH - 0.012), black, parent=tw)
    box("t_mobo", (0.004, 0.30, 0.34), (TW / 2 - 0.02, 0.04, 0.26), mobo, parent=tw)
    box("t_gpu", (0.11, 0.30, 0.045), (0.05, 0.0, 0.16), black, bevel=0.004, parent=tw)
    box("t_gpustrip", (0.004, 0.26, 0.004), (-0.006, 0.0, 0.18), led_ice, parent=tw)
    box("t_cooler", (0.08, 0.10, 0.10), (0.05, 0.05, 0.34), alu_dark, bevel=0.01, parent=tw)
    for i in range(4):
        box(f"t_ram{i}", (0.03, 0.006, 0.05), (0.07, 0.13 + i * 0.012, 0.34), black, parent=tw)
    for i, z in enumerate((0.11, 0.24, 0.37)):
        torus(f"t_fan{i}", 0.052, 0.0035, (0.0, -TD / 2 + 0.03, z), led_cyan, rot=(math.radians(90), 0, 0), parent=tw)
        cyl(f"t_hub{i}", 0.018, 0.02, (0.0, -TD / 2 + 0.032, z), black, rot=(math.radians(90), 0, 0), parent=tw)
    area("t_inner", (0.0, 0.0, TH - 0.03), (0.0, 0.0, 0.0), DEEP, 3.0, 0.15, 0.3).parent = tw
    point("t_glow", (0.02, -0.05, 0.25), lin("#3d6cff"), 1.2, 0.05).parent = tw

    # ── headphones on stand ─────────────────────────────────────────────────
    hp = add(bpy.data.objects.new("hp", None))
    hp.location = (0.70, 0.30, 0.0)
    cyl("hp_base", 0.055, 0.008, (0, 0, 0.004), alu_dark, parent=hp)
    cyl("hp_post", 0.006, 0.29, (0, 0, 0.15), alu_rim, parent=hp)
    torus("hp_band", 0.085, 0.011, (0, 0, 0.28), black, rot=(math.radians(90), 0, 0), parent=hp)
    for sgn in (-1, 1):
        cyl(f"hp_cup{sgn}", 0.046, 0.034, (sgn * 0.085, 0, 0.245), black, rot=(0, math.radians(90), 0), parent=hp)

    # ── laptop (hero) — final world-space dims, scale 1.0 ───────────────────
    BW, BD, BH = 0.409, 0.285, 0.0168
    lap = add(bpy.data.objects.new("laptop", None))
    box("base", (BW, BD, BH), (0, 0, BH / 2 + 0.002), alu, bevel=0.0045, segs=6, parent=lap)
    # 1 mm diamond-cut chamfer around the deck's edge — a frame, not a plate: the old full plate mirrored the dark
    # room and turned the whole deck black (look-dev pass 4); the deck itself is now anodised aluminium.
    for nm, dims, loc in (("base_ch_f", (BW - 0.004, 0.001, 0.0008), (0, -BD / 2 + 0.0015, BH + 0.0016)), ("base_ch_b", (BW - 0.004, 0.001, 0.0008), (0, BD / 2 - 0.0015, BH + 0.0016)),
                          ("base_ch_l", (0.001, BD - 0.004, 0.0008), (-BW / 2 + 0.0015, 0, BH + 0.0016)), ("base_ch_r", (0.001, BD - 0.004, 0.0008), (BW / 2 - 0.0015, 0, BH + 0.0016))):
        box(nm, dims, loc, alu_chamfer, parent=lap)
    box("well", (0.345, 0.128, 0.0006), (0, 0.052, BH + 0.0022), key_black, parent=lap)
    pitch, k = 0.0232, 0.0196
    for r, n in enumerate([14, 14, 14, 13, 12, 11]):
        x0 = -(n - 1) * pitch / 2
        for i in range(n):
            w = k if not (r == 5 and i == 5) else k * 5.2
            if r == 5 and i == 5:
                x = 0.0
            elif r == 5 and i > 5:
                x = x0 + (i + 2.1) * pitch
            elif r == 5:
                x = x0 + (i - 2.1) * pitch
            else:
                x = x0 + i * pitch
            box(f"k{r}_{i}", (w, 0.0178, 0.0014), (x, 0.108 - r * 0.0205, BH + 0.0031), key_black, bevel=0.0012, segs=2, parent=lap)
    # satin glass trackpad: a restrained hint of the light bar, never a mirror
    box("trackpad", (0.16, 0.097, 0.0004), (0, -0.075, BH + 0.0021), pbr("tp", lin(LOOKDEV["trackpad"]), rough=LOOKDEV["trackpad_rough"], coat=LOOKDEV["trackpad_coat"], coat_rough=0.08), bevel=0.003, segs=3, parent=lap)
    # keyboard-well lip: a 0.6 mm chamfered frame so the well reads as recessed
    for nm, dims, loc in (("lip_t", (0.347, 0.0006, 0.0009), (0, 0.117, BH + 0.0022)), ("lip_b", (0.347, 0.0006, 0.0009), (0, -0.013, BH + 0.0022)),
                          ("lip_l", (0.0006, 0.130, 0.0009), (-0.1735, 0.052, BH + 0.0022)), ("lip_r", (0.0006, 0.130, 0.0009), (0.1735, 0.052, BH + 0.0022))):
        box(nm, dims, loc, alu_chamfer, parent=lap)
    # feet with a visible air gap under the base
    for fx in (-0.17, 0.17):
        for fy in (-0.11, 0.11):
            cyl(f"foot{fx}{fy}", 0.006, 0.0018, (fx, fy, 0.0009), black, parent=lap)
    for sgn in (-1, 1):
        box(f"grille{sgn}", (0.012, 0.11, 0.0003), (sgn * 0.187, 0.05, BH + 0.0021), key_black, parent=lap)
    cyl("hinge", 0.0055, BW - 0.06, (0, BD / 2 - 0.004, BH + 0.002), alu_dark, rot=(0, math.radians(90), 0), parent=lap)
    box("port1", (0.0015, 0.009, 0.004), (-BW / 2 - 0.0003, 0.02, 0.009), black, parent=lap)
    # hinge definition: near-black recessed slots at each end of the barrel
    for sgn in (-1, 1):
        box(f"hinge_slot{sgn}", (0.018, 0.004, 0.006), (sgn * (BW / 2 - 0.02), BD / 2 - 0.004, BH + 0.002), pbr("slot", lin("#060708"), rough=0.6), parent=lap)
    hinge = add(bpy.data.objects.new("hingeP", None))
    hinge.parent = lap
    hinge.location = (0, BD / 2 - 0.004, BH + 0.0025)
    LD = 0.278
    box("lid", (BW, LD, 0.006), (0, -LD / 2, 0.003), alu, bevel=0.0035, segs=6, parent=hinge)
    box("lid_bezel", (BW - 0.006, LD - 0.006, 0.0006), (0, -LD / 2, -0.0002), screen_glass, parent=hinge)
    # 1 mm diamond-cut chamfer on the lid's outer edge (the far-edge highlight in K0 and the lid move)
    for nm, dims, loc in (("lidch_t", (BW - 0.004, 0.001, 0.0008), (0, -0.0015, 0.0062)), ("lidch_b", (BW - 0.004, 0.001, 0.0008), (0, -LD + 0.0015, 0.0062)),
                          ("lidch_l", (0.001, LD - 0.004, 0.0008), (-BW / 2 + 0.0015, -LD / 2, 0.0062)), ("lidch_r", (0.001, LD - 0.004, 0.0008), (BW / 2 - 0.0015, -LD / 2, 0.0062))):
        box(nm, dims, loc, alu_chamfer, parent=hinge)
    sx, y1 = 0.1985, -0.015
    y0 = y1 - 0.248
    me = bpy.data.meshes.new("lapscreen")
    bm = bmesh.new()
    vs = [bm.verts.new((-sx, y1, -0.0006)), bm.verts.new((sx, y1, -0.0006)), bm.verts.new((sx, y0, -0.0006)), bm.verts.new((-sx, y0, -0.0006))]
    f = bm.faces.new(list(reversed(vs)))
    uv = bm.loops.layers.uv.new()
    for loop in f.loops:
        x, y, _ = loop.vert.co
        loop[uv].uv = ((x + sx) / (2 * sx), (y1 - y) / (y1 - y0))
    bm.to_mesh(me)
    bm.free()
    ls = add(bpy.data.objects.new("lapscreen", me))
    ls.parent = hinge
    powered = screen_on
    me.materials.append(lap_on if powered else screen_glass)
    OPEN = lid_deg
    hinge.rotation_euler = (math.radians(-OPEN), 0, 0)

    # ── keyboard, mouse, macro pad, dock, cables ────────────────────────────
    kb = add(bpy.data.objects.new("mech", None))
    kb.location, kb.rotation_euler = (0.46, -0.05, 0.0), (0, 0, math.radians(-4))
    box("mech_case", (0.325, 0.135, 0.028), (0, 0, 0.014), alu_dark, bevel=0.005, segs=3, parent=kb)
    box("mech_chamfer", (0.323, 0.133, 0.0012), (0, 0, 0.0285), alu_chamfer, parent=kb)
    for r, n in enumerate([15, 15, 14, 13, 12]):
        for i in range(n):
            m = pbt_enter if (r == 2 and i == n - 1) else pbt
            box(f"mk{r}_{i}", (0.0175, 0.0175, 0.012), (-0.143 + i * 0.0192 + r * 0.004, 0.044 - r * 0.0192, 0.036), m, bevel=0.0028, segs=2, parent=kb)
    box("mech_halo", (0.33, 0.14, 0.0015), (0, 0, 0.0008), pbr("mhalo", (0, 0, 0), emit=ICE, strength=2.2), parent=kb)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=(0.74, -0.04, 0.019))
    mouse = bpy.context.active_object
    mouse.scale = (0.034, 0.062, 0.02)
    mouse.rotation_euler = (0, 0, math.radians(-8))
    mouse.data.materials.append(satin_black)
    mouse.data.shade_smooth()
    cyl("wheel", 0.006, 0.008, (0.74, -0.012, 0.037), alu_rim, rot=(0, math.radians(90), 0))

    pad = add(bpy.data.objects.new("pad", None))
    pad.location, pad.rotation_euler = (-0.40, -0.03, 0.0), (0, 0, math.radians(10))
    box("pad_body", (0.118, 0.084, 0.024), (0, 0, 0.012), black, bevel=0.005, parent=pad)
    for i in range(15):
        r, c = divmod(i, 5)
        box(f"padk{i}", (0.018, 0.018, 0.004), (-0.042 + c * 0.021, 0.021 - r * 0.021, 0.026), satin_black, bevel=0.002, segs=2, parent=pad)
    quad("pad_glyphs", 0.105, 0.063, pad_glyphs, parent=pad, loc=(0, 0, 0.0285), rot=(math.radians(-90), 0, 0))

    box("dock", (0.10, 0.06, 0.024), (-0.30, 0.30, 0.012), alu_dark, bevel=0.004)
    box("dockled", (0.004, 0.003, 0.003), (-0.30, 0.2695, 0.016), white_led)
    cable("c_lap", [(-0.206, 0.02, 0.009), (-0.26, 0.08, 0.004), (-0.30, 0.26, 0.006)], 0.0024, cablem)
    cable("c_kb", [(0.30, 0.02, 0.01), (0.20, 0.25, 0.004), (0.10, 0.60, 0.003), (0.08, 0.64, -0.05)], 0.0022, cablem)
    cable("c_pad", [(-0.40, 0.013, 0.01), (-0.36, 0.15, 0.004), (-0.31, 0.27, 0.006)], 0.002, cablem)
    cable("c_dock", [(-0.30, 0.33, 0.006), (-0.28, 0.50, 0.003), (-0.26, 0.62, -0.05)], 0.0026, cablem)

    # ── warm practical (left) ───────────────────────────────────────────────
    cyl("lamp_base", 0.05, 0.012, (-0.58, 0.44, 0.006), black)
    cyl("lamp_stem", 0.006, 0.26, (-0.58, 0.44, 0.11), alu_dark)
    shade = cyl("lamp_shade", 0.042, 0.085, (-0.58, 0.44, 0.24), opal)
    shade.visible_shadow = False
    point("lamp_bulb", (-0.58, 0.44, 0.24), lin("#ffa050"), LOOKDEV["lamp_bulb"], 0.03)

    # ── lights ───────────────────────────────────────────────────────────────
    area("L1_halo", (0.03, 0.72, 0.42), (0.03, 1.2, 0.62), ICE, LOOKDEV["L1_halo"], 1.0, 0.25)
    for sx_ in (-0.75, 0.75):
        area(f"L2_graze{sx_}", (sx_, 1.02, -0.05), (sx_, 1.19, 0.9), lin("#3f6fe0"), LOOKDEV["L2_graze"], 1.0, 0.03)
    area("L4_lightbar", (0.03, 0.63, 0.64), (0.0, 0.05, 0.0), lin("#e6eeff"), 9, 0.38, 0.03)
    area("L5_key", (-1.25, -0.85, 1.2), (0.0, 0.1, 0.05), lin("#c9dcff"), LOOKDEV["L5_key"], 1.0, 0.7)
    area("L6_rim", (1.25, 0.95, 0.55), (0.05, 0.0, 0.08), CYAN, LOOKDEV["L6_rim"], 0.45)
    area("L6b_rim_left", (-1.1, 0.95, 0.5), (-0.3, 0.2, 0.1), lin("#5a86ff"), 10, 0.4)
    area("L7_card", (-0.2, -1.0, 1.0), (0.0, 0.0, 0.02), (1, 1, 1), LOOKDEV["L7_card"], 1.4, 0.04, glossy_only=True)
    area("L7b_card", (0.9, -0.6, 0.7), (0.0, 0.05, 0.05), lin("#cfe2ff"), 10, 0.9, 0.04, glossy_only=True)
    area("L0_fill", (0.0, -1.8, 0.35), (0.0, 0.2, 0.1), lin("#6d86b8"), LOOKDEV["L0_fill"], 1.8, 0.6)
    # the displays light the room: camera-invisible spill just in front of each screen (lg_monitors via "mon_")
    SPILL = lin(LOOKDEV["spill_colour"])
    area("mon_c_spill", (0.03, 0.62, 0.44), (0.0, -0.3, 0.05), SPILL, LOOKDEV["spill_c"], 0.70, 0.39)
    area("mon_r_spill", (0.77, 0.50, 0.41), (0.1, -0.2, 0.05), SPILL, LOOKDEV["spill_side"], 0.59, 0.33)
    area("mon_l_spill", (-0.57, 0.46, 0.43), (-0.1, -0.2, 0.05), SPILL, LOOKDEV["spill_side"], 0.30, 0.52)
    # L8 lid-sweep card: glossy-only, camera-invisible; a sheen that travels down the black glass as the lid rises,
    # peaking mid-lid and gone by the last lid frames (spec §4.6 lg_sweep)
    sweep = LOOKDEV["sweep_peak"] * max(0.0, math.sin(math.pi * min(lid_deg, 100.0) / 100.0)) if lid_deg < 100 else 0.0
    if sweep > 0:
        area("L8_sweep", (0.0, -0.55, 0.55 - 0.3 * lid_deg / 108), (0.0, 0.2, 0.12), lin("#9cb4d8"), sweep, 0.9, 0.08, glossy_only=True)
    if powered:
        box("key_backlight", (0.34, 0.124, 0.0003), (0, 0.052, BH + 0.0024), pbr("kbl", (0, 0, 0), emit=ICE, strength=LOOKDEV["key_backlight"]), parent=lap)
        # the laptop screen's own spill (camera-invisible)
        sp = area("L9_spill", (0, 0.15, 0.16), (0, -0.2, 0.0), lin("#a8c8ff"), 1.2, 0.36, 0.22)

    # haze: a thin volume behind the desk only (depth + halo shafts), not around the hero
    hz = box("haze", (3.2, 0.75, 1.6), (0.0, 0.86, 0.62), bpy.data.materials.new("hazem"))
    hm = hz.data.materials[0]
    hm.use_nodes = True
    hnt = hm.node_tree
    for n_ in list(hnt.nodes):
        hnt.nodes.remove(n_)
    vo = hnt.nodes.new("ShaderNodeVolumePrincipled")
    vo.inputs["Density"].default_value = 0.10
    vo.inputs["Color"].default_value = (*lin("#6f8cc0"), 1)
    ho = hnt.nodes.new("ShaderNodeOutputMaterial")
    hnt.links.new(vo.outputs[0], ho.inputs["Volume"])
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (*lin("#0a1020"), 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
    scene.world = world

    # Light linking: the display spill lights the room and the desk but not the laptop, so the hero keeps its
    # approved product-photography look (pass 2 showed the spill flattening the lid). Everything not listed
    # stays lit; the laptop's meshes are excluded from the three spill lights only.
    rx = bpy.data.collections.new("spill_receivers")
    for ob in [lap, *lap.children_recursive]:
        if ob.type == "MESH":
            rx.objects.link(ob)
    for entry in rx.collection_objects:                   # indexed by position, not name
        entry.light_linking.link_state = "EXCLUDE"
    for nm in ("mon_c_spill", "mon_r_spill", "mon_l_spill"):
        bpy.data.objects[nm].light_linking.receiver_collection = rx

    return {"scene": scene, "screen": ls, "hinge": hinge}
