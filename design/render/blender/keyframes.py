"""The spec §4.6 key-frame set, rendered at FINAL quality with EXR passes, then audited.
usage: bpyenv/bin/python design/render/blender/keyframes.py [--only K0,K1on]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "keyframes")
PY = os.path.join(HERE, "..", "..", "..", "bpyenv", "bin", "python")
# (key, framing, frame name in camera_path.SEQUENCE or "still", audit kind)
# Frame names chosen by lid angle (frame_state): lid-04 = 15° crack hold, lid-21 = 73.7° (nearest 70°).
KEYS = [("K0", "landscape", "lid-00", "K0"), ("crack", "landscape", "lid-04", "lid"), ("mid", "landscape", "lid-21", "lid"),
        ("K1off", "landscape", "lid-35", "K1off"), ("K1on", "landscape", "k1-on", "K1on"), ("still", "landscape", "still", "K1on"),
        ("push78", "landscape", "push-14", "push"), ("K2", "landscape", "push-27", "K2"),
        ("P0", "portrait", "lid-00", "P0"), ("P1", "portrait", "k1-on", "P1"), ("P2", "portrait", "push-11", "P2"), ("Pstill", "portrait", "still", "P1")]
only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
results = {}
for key, framing, name, kind in KEYS:
    if only and key not in only: continue
    subprocess.run([PY, os.path.join(HERE, "render.py"), "--quality", "final", "--exr", "--out", OUT, "--framing", framing, "--names", name], check=True)
    a = subprocess.run([PY, os.path.join(HERE, "audit.py"), os.path.join(OUT, framing, name + ".png"), "--kind", kind], capture_output=True, text=True)
    results[key] = json.loads(a.stdout.strip().splitlines()[-1]); print(key, "PASS" if a.returncode == 0 else "FAIL", results[key]["fails"], flush=True)
json.dump(results, open(os.path.join(OUT, "audit.json"), "w"), indent=1, default=float)
