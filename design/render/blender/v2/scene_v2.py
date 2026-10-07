"""v2 entrance scene: a real-scale aluminium notebook on a linoleum desk at blue hour.

Product-photography logic, every light motivated by a source in the room:
  window   — blue-hour sky through a mullioned window on the left: the key (soft, cool, ~8,000 K)
  lamp     — a warm table lamp behind-right on the desk (2,700 K): the practical, a rim and a pool
  monitor  — an external display at the back, showing an editor at night brightness: a cool kicker
  screen   — the notebook's own display once it wakes: spill on the keys and the deck
  room     — a dim bounce from the room behind the camera (the wall the window lights)
No hidden glossy cards, no light linking, no fog volume: what reflects in the aluminium and the glass is the room.

build(state) → handles. state: {lid_deg, screen (0–1 backlight), monitor (0–1), lamp (0–1), tex_dir, screen_tex}
"""
import math
import os
import sys

import bpy  # noqa: F401  (must precede bmesh in the pip module)
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from laptop_spec import (BW, BD, FOOT, BT, LT, GAP, BASE_TOP, R_PLAN, R_TOP, R_BOT, R_LID_OUT, R_LID_IN, HINGE_Y, HINGE_Z,  # noqa: E402
                         LD, SCREEN_W, SCREEN_H, BEZEL_TOP, KEY_H, WELL_DEPTH, WELL, TRACKPAD, key_layout)

LOOK = {
    # aluminium: bead-blasted silver anodising; colour and roughness measured by eye against product photos
    "alu": (0.50, 0.505, 0.515), "alu_rough": 0.30, "alu_rough_var": 0.025,
    "keycap": (0.010, 0.010, 0.011), "key_rough": 0.40,
    "desk": (0.034, 0.040, 0.050), "desk_rough": 0.62,          # charcoal-blue furniture linoleum
    "wall": (0.050, 0.051, 0.055), "wall_rough": 0.92,          # limewashed plaster
    "sky_low": (0.09, 0.16, 0.40), "sky_high": (0.025, 0.06, 0.20), "sky_strength": 1.4, "city_lights": 1.6, "sheer_opacity": 0.90, "curtain_to": 0.42, "curtain_mode": "translucent", "curtain_emit": 0.25,   # blue-hour sky beyond the window
    "lamp_k": 3000, "lamp_w": 5.0,
    "monitor_strength": 0.55, "room_w": 2.2, "world": 0.035,
}


def blackbody(k):
    """Approximate linear-sRGB colour of a blackbody at k kelvin, normalised to max 1 (Tanner Helland fit)."""
    t = k / 100.0
    r = 255 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    c = [min(255, max(0, v)) / 255 for v in (r, g, b)]
    lin = [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c]
    m = max(lin)
    return tuple(x / m for x in lin)


# ── mesh helpers ───────────────────────────────────────────────────────────────────────────────────────────

def rrect_outline(w, d, r, n=12):
    """Plan outline of a rounded rectangle centred on the origin, counter-clockwise."""
    r = min(r, w / 2, d / 2)
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def slab(name, w, d, h, r, top=0.0, bot=0.0, segs=6, n=12, mats=None, parent=None, loc=(0, 0, 0)):
    """Rounded-rectangle slab from z=0 to z=h, with rounded top and bottom edges (radius top/bot).
    mats: (top_face_material, everything_else); the slab's top face gets material index 0."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0.0)) for x, y in rrect_outline(w, d, r, n)]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    top_verts = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, h), verts=top_verts)
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    top_face = max(bm.faces, key=lambda fc: fc.calc_center_median().z * (fc.normal.z > 0.9))
    bot_face = min(bm.faces, key=lambda fc: fc.calc_center_median().z if fc.normal.z < -0.9 else 1e9)
    for fc in bm.faces:
        fc.material_index = 1
    top_face.material_index = 0
    top_edges, bot_edges = list(top_face.edges), list(bot_face.edges)
    if top > 0:
        bmesh.ops.bevel(bm, geom=top_edges, offset=min(top, h * 0.45), segments=segs, profile=0.5, affect="EDGES", clamp_overlap=True, material=1)
    if bot > 0:
        bot_edges = [e for e in bot_edges if e.is_valid]
        bmesh.ops.bevel(bm, geom=bot_edges, offset=min(bot, h * 0.45), segments=segs, profile=0.5, affect="EDGES", clamp_overlap=True, material=1)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.set_sharp_from_angle(angle=math.radians(35))
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    if mats:
        for m in mats:
            me.materials.append(m)
    ob.location = loc
    if parent:
        ob.parent = parent
    return ob


def cutter(name, w, d, depth, r, loc, n=10):
    ob = slab(name, w, d, depth * 2 + 0.002, r, n=n, loc=(loc[0], loc[1], loc[2] - depth))
    ob.display_type = "WIRE"
    ob.hide_render = True
    return ob


def boolean(target, cut):
    m = target.modifiers.new("cut_" + cut.name, "BOOLEAN")
    m.operation, m.solver, m.object = "DIFFERENCE", "EXACT", cut
    return m


def cyl(name, r, depth, loc, mat, rot=(0, 0, 0), parent=None, verts=48, bevel=0.0):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=depth)
    if bevel:
        caps = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-9 and abs(abs(e.verts[0].co.z) - depth / 2) < 1e-9]
        bmesh.ops.bevel(bm, geom=caps, offset=bevel, segments=4, profile=0.5, affect="EDGES", clamp_overlap=True)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.set_sharp_from_angle(angle=math.radians(35))
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(mat)
    ob.location, ob.rotation_euler = loc, rot
    if parent:
        ob.parent = parent
    return ob


def lathe(name, profile, mat, parent=None, steps=72):
    """Surface of revolution about +Z from a (radius, z) profile; smooth, with one subdivision level."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0.0, z)) for r, z in profile]
    es = [bm.edges.new((a, b)) for a, b in zip(vs, vs[1:])]
    bmesh.ops.spin(bm, geom=vs + es, axis=(0, 0, 1), cent=(0, 0, 0), angle=2 * math.pi, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(mat)
    ob.modifiers.new("sub", "SUBSURF").levels = 1
    ob.modifiers["sub"].render_levels = 1
    if parent:
        ob.parent = parent
    return ob


def quad(name, w, h, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    """UV'd quad in the local XY plane, facing +Z; u along +X, v along +Y."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((-w / 2, -h / 2, 0)), bm.verts.new((w / 2, -h / 2, 0)), bm.verts.new((w / 2, h / 2, 0)), bm.verts.new((-w / 2, h / 2, 0))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for lp in f.loops:
        x, y, _ = lp.vert.co
        lp[uv].uv = ((x + w / 2) / w, (y + h / 2) / h)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(mat)
    ob.location, ob.rotation_euler = loc, rot
    if parent:
        ob.parent = parent
    return ob


def area_light(name, loc, target, color, power, sx, sy=None, spread=180, camera=False):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.color, ld.shape, ld.spread = power, color, "RECTANGLE", math.radians(spread)
    ld.size, ld.size_y = sx, sy or sx
    ob = bpy.data.objects.new(name, ld)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    ob.visible_camera = camera
    return ob


# ── materials ──────────────────────────────────────────────────────────────────────────────────────────────

def principled(name, color, metal=0.0, rough=0.5, spec=0.5, coat=0.0, coat_rough=0.03):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = spec
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    return m, m.node_tree, p


def noise(nt, scale, detail=4.0, rough=0.55, coord="Object", obj=None, dims="3D"):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    if obj is not None:
        tc.object = obj
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.noise_dimensions = dims
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    nt.links.new(tc.outputs[coord], n.inputs["Vector"])
    return n


def map_range(nt, src, a, b):
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = a, b
    nt.links.new(src, mr.inputs["Value"])
    return mr.outputs["Result"]


def aluminium(name, base_obj):
    """Bead-blasted anodised aluminium: metallic, isotropic micro-roughness with low-frequency variation
    (handling marks on the palm rest read as slightly smoother patches), no anisotropy (not brushed)."""
    m, nt, p = principled(name, LOOK["alu"], metal=1.0, rough=LOOK["alu_rough"])
    big = noise(nt, 9.0, detail=3.0, rough=0.5, obj=base_obj)
    fine = noise(nt, 140.0, detail=6.0, rough=0.6, obj=base_obj)
    mix = nt.nodes.new("ShaderNodeMath"); mix.operation = "MULTIPLY_ADD"
    nt.links.new(big.outputs["Fac"], mix.inputs[0]); mix.inputs[1].default_value = 0.7
    nt.links.new(fine.outputs["Fac"], mix.inputs[2])
    v = LOOK["alu_rough_var"]
    nt.links.new(map_range(nt, mix.outputs[0], LOOK["alu_rough"] - v, LOOK["alu_rough"] + v * 1.4), p.inputs["Roughness"])
    # a whisper of colour variation (anodising is never perfectly even)
    hsv = nt.nodes.new("ShaderNodeMix"); hsv.data_type = "RGBA"
    hsv.inputs["A"].default_value = (*LOOK["alu"], 1)
    hsv.inputs["B"].default_value = (*(c * 0.94 for c in LOOK["alu"]), 1)
    nt.links.new(map_range(nt, big.outputs["Fac"], 0.0, 0.6), hsv.inputs["Factor"])
    nt.links.new(hsv.outputs["Result"], p.inputs["Base Color"])
    return m


def deck_atlas_nodes(nt, base_obj, tex_dir):
    """Planar projection of the deck atlas in the base's object space (x, y metres → 0–1)."""
    tc = nt.nodes.new("ShaderNodeTexCoord"); tc.object = base_obj
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Location"].default_value = (0.5, 0.5, 0)
    mp.inputs["Scale"].default_value = (1 / BW, 1 / BD, 1)
    # Mapping applies scale before location: (p * s) + l
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(tex_dir, "deck_atlas.png"))
    img.image.colorspace_settings.name = "Non-Color"
    img.interpolation = "Cubic"; img.extension = "CLIP"
    nt.links.new(mp.outputs["Vector"], img.inputs["Vector"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(img.outputs["Color"], sep.inputs["Color"])
    return sep


def deck_material(base_obj, tex_dir):
    """The base's aluminium plus the speaker perforation (darker, with a bump into each hole)."""
    m = aluminium("alu_deck", base_obj)
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    sep = deck_atlas_nodes(nt, base_obj, tex_dir)
    holes = sep.outputs["Red"]
    mixc = nt.nodes.new("ShaderNodeMix"); mixc.data_type = "RGBA"
    nt.links.new(p.inputs["Base Color"].links[0].from_socket, mixc.inputs["A"])
    mixc.inputs["B"].default_value = (0.004, 0.004, 0.005, 1)
    nt.links.new(holes, mixc.inputs["Factor"])
    nt.links.new(mixc.outputs["Result"], p.inputs["Base Color"])
    met = nt.nodes.new("ShaderNodeMath"); met.operation = "SUBTRACT"; met.inputs[0].default_value = 1.0
    nt.links.new(holes, met.inputs[1]); nt.links.new(met.outputs[0], p.inputs["Metallic"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.6; bump.inputs["Distance"].default_value = 0.0003
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    nt.links.new(holes, inv.inputs[1]); nt.links.new(inv.outputs[0], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def keycap_material(base_obj, tex_dir, backlight):
    """Soft-touch black keycaps; legends are a lighter translucent print that glows when the keyboard is lit."""
    m, nt, p = principled("keycap", LOOK["keycap"], rough=LOOK["key_rough"], spec=0.45)
    sep = deck_atlas_nodes(nt, base_obj, tex_dir)
    glyph = sep.outputs["Green"]
    mixc = nt.nodes.new("ShaderNodeMix"); mixc.data_type = "RGBA"
    mixc.inputs["A"].default_value = (*LOOK["keycap"], 1)
    mixc.inputs["B"].default_value = (0.20, 0.205, 0.21, 1)
    nt.links.new(glyph, mixc.inputs["Factor"]); nt.links.new(mixc.outputs["Result"], p.inputs["Base Color"])
    p.inputs["Emission Color"].default_value = (*blackbody(6500), 1)
    em = nt.nodes.new("ShaderNodeMath"); em.operation = "MULTIPLY"; em.inputs[1].default_value = 0.8 * backlight
    nt.links.new(glyph, em.inputs[0]); nt.links.new(em.outputs[0], p.inputs["Emission Strength"])
    # slightly polished by use: the home-row caps carry a touch more sheen (low-frequency roughness drift)
    n = noise(nt, 18.0, detail=2.0, obj=base_obj)
    nt.links.new(map_range(nt, n.outputs["Fac"], LOOK["key_rough"] - 0.06, LOOK["key_rough"] + 0.04), p.inputs["Roughness"])
    return m


def screen_material(name, tex_path, brightness):
    """The display: emission (the panel) under a glossy cover glass. With no texture (or brightness 0) it is
    black glass that only reflects the room."""
    m, nt, p = principled(name, (0.002, 0.002, 0.0025), rough=0.035, spec=0.5)
    p.inputs["IOR"].default_value = 1.52
    if tex_path and brightness > 0:
        img = nt.nodes.new("ShaderNodeTexImage")
        img.image = bpy.data.images.load(tex_path); img.interpolation = "Cubic"; img.extension = "EXTEND"
        nt.links.new(img.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = brightness
    return m


# ── the laptop ─────────────────────────────────────────────────────────────────────────────────────────────

def build_laptop(state, tex_dir):
    lap = bpy.data.objects.new("laptop", None)
    bpy.context.collection.objects.link(lap)
    base = slab("base", BW, BD, BT, R_PLAN, top=R_TOP, bot=R_BOT, segs=7, n=14, loc=(0, 0, FOOT), parent=lap)
    alu_side = aluminium("alu", base)
    base.data.materials.append(deck_material(base, tex_dir))
    base.data.materials.append(alu_side)
    # keyboard well and trackpad pocket, cut into the deck
    boolean(base, cutter("cut_well", WELL["w"], WELL["d"], WELL_DEPTH, WELL["r"], (0, WELL["y"], BT)))
    tp_cut = cutter("cut_tp", TRACKPAD["w"] + 2 * TRACKPAD["gap"], TRACKPAD["d"] + 2 * TRACKPAD["gap"], 0.0012, TRACKPAD["r"] + TRACKPAD["gap"], (0, TRACKPAD["y"], BT))
    boolean(base, tp_cut)
    for c in ("cut_well", "cut_tp"):
        bpy.data.objects[c].parent = base
    well_floor = principled("well", (0.008, 0.008, 0.009), metal=1.0, rough=0.55)[0]
    slab("well_floor", WELL["w"], WELL["d"], 0.0004, WELL["r"], loc=(0, WELL["y"], FOOT + BT - WELL_DEPTH - 0.0004), parent=lap, mats=[well_floor, well_floor])
    # keycaps: rounded caps with softened edges; ~0.35 mm proud of the deck
    kc = keycap_material(base, tex_dir, state.get("backlight", 0.0))
    for i, (x, y, w, h, _) in enumerate(key_layout()):
        slab(f"key{i:02d}", w, h, KEY_H, 0.0016, top=0.00045, segs=3, n=4, mats=[kc, kc], parent=lap,
             loc=(x, y, FOOT + BT - WELL_DEPTH + 0.00005))
    # trackpad: etched glass in the aluminium's colour, flush with the deck, in its 0.3 mm groove
    tp = principled("trackpad", (0.15, 0.153, 0.16), rough=0.42, spec=0.35)[0]
    slab("trackpad", TRACKPAD["w"], TRACKPAD["d"], 0.0012, TRACKPAD["r"], top=0.00025, segs=3, n=10, mats=[tp, tp], parent=lap,
         loc=(0, TRACKPAD["y"], FOOT + BT - 0.00125))
    # feet, ports, hinge
    rubber = principled("rubber", (0.02, 0.02, 0.021), rough=0.85)[0]
    for fx in (-BW / 2 + 0.03, BW / 2 - 0.03):
        for fy in (-BD / 2 + 0.03, BD / 2 - 0.03):
            cyl(f"foot{fx:+.2f}{fy:+.2f}", 0.0055, FOOT + 0.0004, (fx, fy, (FOOT + 0.0004) / 2), rubber, parent=lap, bevel=0.0003)
    port = principled("port", (0.003, 0.003, 0.0035), rough=0.6)[0]
    for side, ys in ((-1, (0.055, 0.040, 0.025)), (1, (0.050, 0.030))):
        for j, py in enumerate(ys):
            pw = 0.0084 if j else 0.0110
            ob = slab(f"port{side}{j}", 0.0012, pw, 0.0030, 0.0012, mats=[port, port], parent=lap,
                      loc=(side * (BW / 2 - 0.0004), py, FOOT + BT * 0.5 - 0.0015))
    hinge_mat = principled("hingecover", (0.035, 0.036, 0.038), metal=1.0, rough=0.42)[0]

    # lid: pivot on the hinge axis; closed it lies on the deck, opening rotates its far edge up and back
    piv = bpy.data.objects.new("hingeP", None)
    bpy.context.collection.objects.link(piv)
    piv.parent = lap
    piv.location = (0, HINGE_Y, HINGE_Z)
    # in the pivot's frame (closed): the lid runs toward -y; inner (glass) face down at z = GAP
    lid_alu = aluminium("alu_lid", base)
    lid = slab("lid", BW, LD, LT, R_PLAN, top=R_LID_OUT, bot=R_LID_IN, segs=6, n=14, mats=[lid_alu, lid_alu], parent=piv,
               loc=(0, -LD / 2 + 0.0058, GAP))
    glass = principled("coverglass", (0.0025, 0.0025, 0.003), rough=0.03, spec=0.5)[0]
    glass.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.52
    # the cover glass: a thin black-glass sheet across the lid's inner face, inset 0.35 mm, facing down
    g = slab("glass", BW - 0.0007, LD - 0.0007, 0.0003, R_PLAN - 0.0004, top=0.0, bot=0.00012, segs=2, n=14, mats=[glass, glass], parent=piv,
             loc=(0, -LD / 2 + 0.0058, GAP - 0.0002))
    # the active area (16:10), facing down (the viewer, when open), just in front of the glass
    yc = -LD + 0.0058 + BEZEL_TOP + SCREEN_H / 2
    scr = screen_material("display", state.get("screen_tex"), state.get("screen", 0.0))
    ls = quad("lapscreen", SCREEN_W, SCREEN_H, scr, loc=(0, yc, GAP - 0.00025), rot=(math.pi, 0, 0), parent=piv)
    # a camera module dot in the top bezel
    cam_mat = principled("camdot", (0.001, 0.001, 0.0012), rough=0.08)[0]
    cyl("camera_dot", 0.0011, 0.00005, (0, -LD + 0.0058 + BEZEL_TOP / 2, GAP - 0.00026), cam_mat, parent=piv, verts=24)
    # the hinge cover: the dark barrel the display's chin wraps around
    cyl("hinge_barrel", 0.0046, BW - 0.050, (0, -0.0010, GAP + 0.0006), hinge_mat, rot=(0, math.radians(90), 0), parent=piv, bevel=0.0012)
    piv.rotation_euler = (math.radians(-state.get("lid_deg", 0.0)), 0, 0)
    return {"laptop": lap, "screen": ls, "pivot": piv, "base": base}


# ── room ───────────────────────────────────────────────────────────────────────────────────────────────────

def build_room(state, tex_dir):
    # desk: furniture linoleum on birch ply (the ply's laminations show on the front edge)
    desk_top = 0.0
    lino, nt, p = principled("linoleum", LOOK["desk"], rough=LOOK["desk_rough"], spec=0.45)
    n = noise(nt, 55.0, detail=8.0, rough=0.65, coord="Object")
    mixc = nt.nodes.new("ShaderNodeMix"); mixc.data_type = "RGBA"
    mixc.inputs["A"].default_value = (*(c * 0.92 for c in LOOK["desk"]), 1)
    mixc.inputs["B"].default_value = (*(c * 1.08 for c in LOOK["desk"]), 1)
    nt.links.new(n.outputs["Fac"], mixc.inputs["Factor"]); nt.links.new(mixc.outputs["Result"], p.inputs["Base Color"])
    n2 = noise(nt, 4.0, detail=3.0, coord="Object")                    # wipe marks: broad, faint gloss drift
    nt.links.new(map_range(nt, n2.outputs["Fac"], LOOK["desk_rough"] - 0.07, LOOK["desk_rough"] + 0.05), p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.05; bump.inputs["Distance"].default_value = 0.0002
    n3 = noise(nt, 900.0, detail=2.0, coord="Object")
    nt.links.new(n3.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    ply, pnt, pp = principled("birchply", (0.40, 0.31, 0.21), rough=0.55)
    tc = pnt.nodes.new("ShaderNodeTexCoord")
    wave = pnt.nodes.new("ShaderNodeTexWave"); wave.wave_type = "BANDS"; wave.bands_direction = "Z"
    wave.inputs["Scale"].default_value = 26.0; wave.inputs["Distortion"].default_value = 0.6; wave.inputs["Detail"].default_value = 1.0
    pnt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    ramp = pnt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[1].position = 0.80, 0.95
    ramp.color_ramp.elements[0].color = (0.40, 0.31, 0.21, 1); ramp.color_ramp.elements[1].color = (0.16, 0.11, 0.07, 1)
    pnt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"]); pnt.links.new(ramp.outputs["Color"], pp.inputs["Base Color"])
    desk = slab("desk", 1.70, 0.80, 0.024, 0.004, top=0.0008, bot=0.0008, segs=3, n=4, mats=[lino, ply], loc=(0.05, 0.15, desk_top - 0.024))
    # the wall behind the desk: limewash, cloudy, with a skirting shadow line
    wall, wnt, wp = principled("limewash", LOOK["wall"], rough=LOOK["wall_rough"])
    wn = noise(wnt, 1.6, detail=6.0, rough=0.62, coord="Object")
    wmix = wnt.nodes.new("ShaderNodeMix"); wmix.data_type = "RGBA"
    wmix.inputs["A"].default_value = (*(c * 0.80 for c in LOOK["wall"]), 1)
    wmix.inputs["B"].default_value = (*(c * 1.18 for c in LOOK["wall"]), 1)
    wnt.links.new(wn.outputs["Fac"], wmix.inputs["Factor"]); wnt.links.new(wmix.outputs["Result"], wp.inputs["Base Color"])
    wb = wnt.nodes.new("ShaderNodeBump"); wb.inputs["Strength"].default_value = 0.12; wb.inputs["Distance"].default_value = 0.001
    wn2 = noise(wnt, 60.0, detail=4.0, coord="Object")
    wnt.links.new(wn2.outputs["Fac"], wb.inputs["Height"]); wnt.links.new(wb.outputs["Normal"], wp.inputs["Normal"])
    # the back wall, 12 cm thick, with a steel-framed window opening behind the desk (its reveal shows)
    X0, X1, Z0, Z1, WY, WT = -0.70, 0.62, 0.16, 1.42, 0.55, 0.12
    for nm, (xa, xb, za, zb) in (("wall_l", (-2.5, X0, -0.8, 2.2)), ("wall_r", (X1, 2.5, -0.8, 2.2)),
                                 ("wall_sill", (X0, X1, -0.8, Z0)), ("wall_head", (X0, X1, Z1, 2.2))):
        slab(nm, xb - xa, WT, zb - za, 0.0005, mats=[wall, wall], loc=((xa + xb) / 2, WY + WT / 2, za))
    for nm, dims, loc in (("wall_side_l", (0.06, 3.0, 3.0), (-1.45, -0.9, 0.7)), ("wall_side_r", (0.06, 3.0, 3.0), (1.30, -0.9, 0.7)),
                          ("floor", (5.0, 4.0, 0.02), (0.0, -0.9, -0.76)), ("ceiling", (5.0, 4.0, 0.02), (0.0, -0.9, 2.2))):
        slab(nm, dims[0], dims[1], dims[2], 0.0005, mats=[wall, wall], loc=(loc[0], loc[1], loc[2] - dims[2] / 2))
    stone = principled("sill", (0.10, 0.10, 0.105), rough=0.55)[0]
    slab("sill_stone", X1 - X0 + 0.04, WT + 0.03, 0.02, 0.002, top=0.001, segs=2, mats=[stone, stone], loc=((X0 + X1) / 2, WY + WT / 2 - 0.015, Z0 - 0.02))
    # desk legs (only their tops ever show, as dark shapes under the front edge)
    steel = principled("steel", (0.03, 0.031, 0.033), metal=1.0, rough=0.45)[0]
    for lx in (-0.74, 0.84):
        for ly in (-0.20, 0.50):
            slab(f"leg{lx}{ly}", 0.04, 0.04, 0.73, 0.004, mats=[steel, steel], loc=(lx, ly, -0.754))

    # the window: thin black steel glazing bars (3 × 3 panes) set into the reveal; beyond it the blue-hour sky,
    # an emissive gradient that is also the key light (mesh light: what the aluminium reflects is the window itself)
    frame = principled("steelframe", (0.012, 0.012, 0.013), metal=0.6, rough=0.45)[0]
    FY, FD, BAR = WY + 0.075, 0.035, 0.022
    for i, x in enumerate((X0 + BAR / 2, -0.26, 0.18, X1 - BAR / 2)):
        slab(f"bar_v{i}", BAR, FD, Z1 - Z0, 0.001, mats=[frame, frame], loc=(x, FY, Z0))
    for i, z in enumerate((Z0, 0.58, 1.00, Z1 - BAR)):
        slab(f"bar_h{i}", X1 - X0, FD, BAR, 0.001, mats=[frame, frame], loc=((X0 + X1) / 2, FY, z))
    skym = bpy.data.materials.new("sky"); skym.use_nodes = True
    snt = skym.node_tree
    for nd in list(snt.nodes):
        snt.nodes.remove(nd)
    so = snt.nodes.new("ShaderNodeOutputMaterial"); em = snt.nodes.new("ShaderNodeEmission")
    tc = snt.nodes.new("ShaderNodeTexCoord"); sep = snt.nodes.new("ShaderNodeSeparateXYZ")
    snt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    rmp = snt.nodes.new("ShaderNodeValToRGB")
    rmp.color_ramp.elements[0].position, rmp.color_ramp.elements[1].position = 0.0, 1.0
    rmp.color_ramp.elements[0].color = (*LOOK["sky_low"], 1); rmp.color_ramp.elements[1].color = (*LOOK["sky_high"], 1)
    mr = snt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -3.0, 9.0
    snt.links.new(sep.outputs["Y"], mr.inputs["Value"]); snt.links.new(mr.outputs["Result"], rmp.inputs["Fac"])
    snt.links.new(rmp.outputs["Color"], em.inputs["Color"]); em.inputs["Strength"].default_value = LOOK["sky_strength"] * state.get("window", 1.0)
    snt.links.new(em.outputs[0], so.inputs["Surface"])
    quad("sky", 60.0, 30.0, skym, loc=(0.0, 24.0, 0.7), rot=(math.radians(90), 0, 0))
    # a sheer linen curtain drawn across most of the window, inside the reveal: backlit by the sky it is the large,
    # soft, cool source a product photographer would place there (and what the lid reflects); a gap on the right
    # keeps the city in view
    sheer = bpy.data.materials.new("sheer"); sheer.use_nodes = True
    hnt = sheer.node_tree
    for nd in list(hnt.nodes):
        hnt.nodes.remove(nd)
    ho = hnt.nodes.new("ShaderNodeOutputMaterial")
    htl = hnt.nodes.new("ShaderNodeBsdfTranslucent"); htl.inputs["Color"].default_value = (0.66, 0.68, 0.70, 1)
    hdf = hnt.nodes.new("ShaderNodeBsdfDiffuse"); hdf.inputs["Color"].default_value = (0.70, 0.71, 0.72, 1)
    htr = hnt.nodes.new("ShaderNodeBsdfTransparent")
    m1 = hnt.nodes.new("ShaderNodeMixShader"); m1.inputs[0].default_value = 0.35
    hnt.links.new(htl.outputs[0], m1.inputs[1]); hnt.links.new(hdf.outputs[0], m1.inputs[2])
    m2 = hnt.nodes.new("ShaderNodeMixShader"); m2.inputs[0].default_value = LOOK["sheer_opacity"]
    hnt.links.new(htr.outputs[0], m2.inputs[1]); hnt.links.new(m1.outputs[0], m2.inputs[2])
    if LOOK.get("curtain_mode") == "emissive":
        # render-cost variant: the sky's glow through the fabric as emission (no light path through a translucent
        # layer), with the same transparency; the folds still shade it through the facing ratio
        for nd in (htl, hdf, m1):
            hnt.nodes.remove(nd)
        hem = hnt.nodes.new("ShaderNodeEmission"); hem.inputs["Color"].default_value = (*LOOK["sky_low"], 1)
        lw = hnt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
        fm = hnt.nodes.new("ShaderNodeMath"); fm.operation = "MULTIPLY_ADD"
        hnt.links.new(lw.outputs["Facing"], fm.inputs[0]); fm.inputs[1].default_value = -0.5; fm.inputs[2].default_value = 1.0
        sm = hnt.nodes.new("ShaderNodeMath"); sm.operation = "MULTIPLY"; sm.inputs[1].default_value = LOOK["curtain_emit"] * state.get("window", 1.0)
        hnt.links.new(fm.outputs[0], sm.inputs[0]); hnt.links.new(sm.outputs[0], hem.inputs["Strength"])
        hnt.links.new(hem.outputs[0], m2.inputs[2])
    hnt.links.new(m2.outputs[0], ho.inputs["Surface"])
    cx0, cx1 = X0 + 0.01, LOOK["curtain_to"]
    me = bpy.data.meshes.new("curtain"); bm = bmesh.new()
    nx, nz = 160, 2
    grid = []
    for j in range(nz + 1):
        z = Z0 + 0.005 + (Z1 - Z0 - 0.01) * j / nz
        row = []
        for i in range(nx + 1):
            x = cx0 + (cx1 - cx0) * i / nx
            y = WY + 0.035 + 0.012 * math.sin(i / nx * (cx1 - cx0) / 0.09 * 2 * math.pi) + 0.004 * math.sin(i * 0.9)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for j in range(nz):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bm.to_mesh(me); bm.free()
    for pl in me.polygons:
        pl.use_smooth = True
    cur = bpy.data.objects.new("curtain", me); bpy.context.collection.objects.link(cur); me.materials.append(sheer)
    # the city beyond: a far plane of dark massing with sparse lit windows (alpha-cut), well out of focus
    city = bpy.data.materials.new("city"); city.use_nodes = True
    cnt = city.node_tree
    for nd in list(cnt.nodes):
        cnt.nodes.remove(nd)
    co = cnt.nodes.new("ShaderNodeOutputMaterial")
    ci = cnt.nodes.new("ShaderNodeTexImage"); ci.image = bpy.data.images.load(os.path.join(tex_dir, "skyline.png"))
    # pure emitters: black massing (no surface lighting to read as pale blocks), lit windows from the texture
    cem = cnt.nodes.new("ShaderNodeEmission"); cem.inputs["Strength"].default_value = LOOK["city_lights"]
    cnt.links.new(ci.outputs["Color"], cem.inputs["Color"])
    ctr = cnt.nodes.new("ShaderNodeBsdfTransparent"); cmx = cnt.nodes.new("ShaderNodeMixShader")
    cnt.links.new(ci.outputs["Alpha"], cmx.inputs[0]); cnt.links.new(ctr.outputs[0], cmx.inputs[1]); cnt.links.new(cem.outputs[0], cmx.inputs[2])
    cnt.links.new(cmx.outputs[0], co.inputs["Surface"])
    cob = quad("city", 40.0, 10.0, city, loc=(1.0, 18.0, -3.6), rot=(math.radians(90), 0, 0))
    cob.visible_shadow = False
    # the room behind the camera, lit by the window: a broad dim bounce
    rb = area_light("room_bounce", (0.2, -2.0, 0.9), (0.0, 0.1, 0.1), blackbody(6000), LOOK["room_w"] * 40 * state.get("room", 1.0), 2.5, 1.6)
    # flagged out of reflections: a dim fill for the shadows only. Seen in the display's glass it read as a grey
    # panel over the whole screen — a dark room behind the camera reflects almost nothing.
    rb.visible_glossy = False

    # warm practical: a turned ceramic table lamp with a linen drum shade, back left of the desk
    lamp = bpy.data.objects.new("lamp", None); bpy.context.collection.objects.link(lamp)
    lamp.location = (-0.80, 0.36, 0.0)
    ceramic = principled("ceramic", (0.62, 0.60, 0.56), rough=0.35, spec=0.5)[0]
    lathe("lamp_base", [(0.0, 0.0), (0.046, 0.0), (0.052, 0.004), (0.064, 0.035), (0.074, 0.085), (0.071, 0.13), (0.056, 0.175), (0.030, 0.212), (0.019, 0.232), (0.017, 0.242), (0.0, 0.242)], ceramic, parent=lamp)
    brass = principled("brass", (0.62, 0.45, 0.24), metal=1.0, rough=0.28)[0]
    cyl("lamp_neck", 0.007, 0.07, (0, 0, 0.275), brass, parent=lamp)
    linen, lnt, lp = principled("linen", (0.78, 0.70, 0.58), rough=0.9)
    lp.inputs["Transmission Weight"].default_value = 0.0
    # a translucent shade: diffuse + translucent, so the bulb lights the shade from inside like real fabric
    for nd in list(lnt.nodes):
        lnt.nodes.remove(nd)
    out = lnt.nodes.new("ShaderNodeOutputMaterial")
    dif = lnt.nodes.new("ShaderNodeBsdfDiffuse"); dif.inputs["Color"].default_value = (0.78, 0.70, 0.58, 1)
    tr = lnt.nodes.new("ShaderNodeBsdfTranslucent"); tr.inputs["Color"].default_value = (0.95, 0.80, 0.60, 1)
    mx = lnt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = 0.55
    lnt.links.new(dif.outputs[0], mx.inputs[1]); lnt.links.new(tr.outputs[0], mx.inputs[2]); lnt.links.new(mx.outputs[0], out.inputs[0])
    me = bpy.data.meshes.new("shade"); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=72, radius1=0.135, radius2=0.115, depth=0.17)
    bm.to_mesh(me); bm.free()
    for pl in me.polygons:
        pl.use_smooth = True
    shade = bpy.data.objects.new("lamp_shade", me); bpy.context.collection.objects.link(shade)
    me.materials.append(linen); shade.parent = lamp; shade.location = (0, 0, 0.37)
    sol = shade.modifiers.new("t", "SOLIDIFY"); sol.thickness = 0.002
    bulb = bpy.data.lights.new("lamp_bulb", "POINT"); bulb.energy = LOOK["lamp_w"] * 6 * state.get("lamp", 1.0)
    bulb.color = blackbody(LOOK["lamp_k"]); bulb.shadow_soft_size = 0.03
    bo = bpy.data.objects.new("lamp_bulb", bulb); bpy.context.collection.objects.link(bo); bo.parent = lamp; bo.location = (0, 0, 0.36)

    # external display at the back: a slim panel on an aluminium stand, an editor at night brightness
    mon = bpy.data.objects.new("monitor", None); bpy.context.collection.objects.link(mon)
    mon.location, mon.rotation_euler = (0.78, 0.30, 0.0), (0, 0, math.radians(-32))
    stand_alu = aluminium("alu_stand", mon)
    slab("mon_foot", 0.23, 0.17, 0.008, 0.012, top=0.002, segs=3, mats=[stand_alu, stand_alu], parent=mon, loc=(0, 0.03, 0))
    slab("mon_post", 0.05, 0.022, 0.30, 0.004, top=0.0, mats=[stand_alu, stand_alu], parent=mon, loc=(0, 0.075, 0.008))
    panel_back = principled("panelback", (0.05, 0.051, 0.055), metal=0.0, rough=0.45)[0]
    pw, ph = 0.615, 0.355
    pnl = slab("mon_body", pw + 0.012, ph + 0.012, 0.012, 0.005, top=0.0015, bot=0.0015, segs=3, mats=[panel_back, panel_back], parent=mon)
    pnl.rotation_euler = (math.radians(90), 0, 0)
    pnl.location = (0, 0.068, 0.12 + (ph + 0.012) / 2)
    mon_scr = screen_material("mon_screen", state.get("monitor_tex"), LOOK["monitor_strength"] * state.get("monitor", 1.0))
    ms = quad("mon_screen", pw, ph, mon_scr, parent=mon, loc=(0, 0.0555, 0.12 + (ph + 0.012) / 2), rot=(math.radians(90), 0, 0))

    # small, motivated props: a closed notebook with a pen (front left), a stoneware mug (right)
    cloth, cnt, cp = principled("bookcloth", (0.045, 0.048, 0.055), rough=0.8)
    cb = cnt.nodes.new("ShaderNodeBump"); cb.inputs["Strength"].default_value = 0.15; cb.inputs["Distance"].default_value = 0.0003
    cw = noise(cnt, 1400.0, detail=1.0, coord="Object"); cnt.links.new(cw.outputs["Fac"], cb.inputs["Height"]); cnt.links.new(cb.outputs["Normal"], cp.inputs["Normal"])
    paper = principled("paper", (0.72, 0.70, 0.66), rough=0.85)[0]
    book = bpy.data.objects.new("notebook", None); bpy.context.collection.objects.link(book)
    book.location, book.rotation_euler = (-0.40, -0.06, 0.0), (0, 0, math.radians(-9))
    slab("book_pages", 0.142, 0.206, 0.0105, 0.004, top=0.0005, mats=[paper, paper], parent=book, loc=(0.001, 0, 0.0009))
    slab("book_back", 0.146, 0.210, 0.0010, 0.005, top=0.0004, mats=[cloth, cloth], parent=book, loc=(0, 0, 0))
    slab("book_front", 0.146, 0.210, 0.0010, 0.005, top=0.0004, mats=[cloth, cloth], parent=book, loc=(0, 0, 0.0114))
    band = principled("band", (0.02, 0.02, 0.022), rough=0.6)[0]
    slab("book_band", 0.004, 0.212, 0.0128, 0.0006, mats=[band, band], parent=book, loc=(0.058, 0, 0.0001))
    pen_mat = principled("pen", (0.03, 0.03, 0.033), metal=1.0, rough=0.25)[0]
    cyl("pen", 0.0045, 0.14, (-0.30, -0.13, 0.0045), pen_mat, rot=(0, math.radians(90), math.radians(-14)), bevel=0.0015)
    glaze = principled("glaze", (0.055, 0.057, 0.062), rough=0.42, spec=0.5)[0]
    mug = bpy.data.objects.new("mug", None); bpy.context.collection.objects.link(mug)
    mug.location = (0.33, -0.02, 0.0)
    me = bpy.data.meshes.new("mug_body"); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=72, radius1=0.041, radius2=0.043, depth=0.095)
    bm.to_mesh(me); bm.free()
    for pl in me.polygons:
        pl.use_smooth = True
    mb = bpy.data.objects.new("mug_body", me); bpy.context.collection.objects.link(mb)
    me.materials.append(glaze); mb.parent = mug; mb.location = (0, 0, 0.0475)
    sol = mb.modifiers.new("s", "SOLIDIFY"); sol.thickness = 0.004
    bv = mb.modifiers.new("b", "BEVEL"); bv.width = 0.0015; bv.segments = 3
    bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0055, major_segments=48, minor_segments=16, location=(0.044, 0, 0.05), rotation=(math.radians(90), 0, 0))
    hd = bpy.context.active_object; hd.name = "mug_handle"; hd.data.materials.append(glaze); hd.parent = mug
    hd.location = (0.045, 0, 0.05); hd.data.shade_smooth()
    coffee = principled("coffee", (0.02, 0.012, 0.008), rough=0.05)[0]
    cyl("mug_coffee", 0.037, 0.001, (0, 0, 0.078), coffee, parent=mug)

    # world: the night outside the window, very dim
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (*blackbody(9500), 1); bg.inputs["Strength"].default_value = LOOK["world"]
    bpy.context.scene.world = w
    return {"desk": desk, "lamp": lamp, "monitor": mon}


def cable(name, pts, radius, mat):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = radius; cu.bevel_resolution = 4
    sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob); cu.materials.append(mat)
    return ob


def build(state, tex_dir):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    h = build_laptop(state, tex_dir)
    h.update(build_room(state, tex_dir))
    # the charging cable: from the left ports, resting on the desk in a loose curve, off the back edge
    cab = principled("cablesheath", (0.55, 0.55, 0.56), rough=0.45)[0]
    r = 0.0021
    cable("charge_cable", [(-BW / 2 - 0.004, 0.050, FOOT + 0.0045), (-BW / 2 - 0.035, 0.055, r), (-0.27, 0.15, r), (-0.22, 0.30, r),
                           (-0.15, 0.45, r), (-0.12, 0.56, -0.02), (-0.12, 0.57, -0.30)], r, cab)
    # screen spill once the display is on: a camera-invisible panel of the screen's size just in front of it
    if state.get("screen", 0) > 0 and state.get("spill", 1.0) > 0:
        sp = bpy.data.lights.new("screen_spill", "AREA")
        sp.shape, sp.size, sp.size_y = "RECTANGLE", SCREEN_W, SCREEN_H
        sp.color = blackbody(7000); sp.energy = 0.2 * state["screen"] * state.get("spill", 1.0); sp.spread = math.radians(160)
        so = bpy.data.objects.new("screen_spill", sp); bpy.context.collection.objects.link(so)
        # the quad's +Z faces the viewer; an area light emits along its own -Z, so turn it to face out of the display
        so.parent = h["screen"]; so.location = (0, 0, 0.004); so.rotation_euler = (math.pi, 0, 0)
        so.visible_camera = False; so.visible_glossy = False
    scene.render.engine = "CYCLES"
    return {**h, "scene": scene}
