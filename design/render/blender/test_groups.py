"""Every light and every emitter belongs to exactly one light group, and no emissive material spans two
groups (apply_weights scales per material). run: bpyenv/bin/python -m unittest design/render/blender/test_groups.py"""
import os, sys, unittest
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy  # noqa: E402
from scene import build_scene  # noqa: E402
from render import assign_light_groups  # noqa: E402


def emissive(m):
    n = m and m.node_tree and m.node_tree.nodes.get("Principled BSDF")
    return bool(n) and n.inputs["Emission Strength"].default_value > 0


class Groups(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        cls.scene = build_scene(os.path.join(HERE, "out") + "/", 108, True)["scene"]
        assign_light_groups(cls.scene, bpy.context.view_layer)

    def test_every_light_is_grouped(self):
        missing = [o.name for o in self.scene.objects if o.type == "LIGHT" and not o.lightgroup]
        self.assertEqual(missing, [])

    def test_every_emitter_is_grouped(self):
        missing = [o.name for o in self.scene.objects if o.type == "MESH" and any(emissive(s.material) for s in o.material_slots) and not o.lightgroup]
        self.assertEqual(missing, [])

    def test_no_emissive_material_spans_two_groups(self):
        seen = {}
        for o in self.scene.objects:
            for s in getattr(o, "material_slots", []):
                if emissive(s.material): seen.setdefault(s.material.name, set()).add(o.lightgroup)
        self.assertEqual({k: v for k, v in seen.items() if len(v) > 1}, {})

    def test_world_is_grouped(self):
        self.assertEqual(self.scene.world.lightgroup, "lg_world")


if __name__ == "__main__":
    unittest.main()
