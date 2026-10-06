"""Final batch (spec §4.7): chunks of 8, resumable, each chunk encoded and committed so a reclaimed
container loses at most one chunk. usage: bpyenv/bin/python design/render/blender/batch.py [--framing landscape|portrait]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, HERE)
from camera_path import SEQUENCE
PY = os.path.join(REPO, "bpyenv", "bin", "python"); OUT = os.path.join(HERE, "out-final")
BRANCH = "feature/premium-portfolio-redesign-1mqmgf"
TRAILER = os.environ.get("COMMIT_TRAILER")   # the harness's attribution lines, exported by the executor before launch
if not TRAILER: sys.exit("batch.py: set COMMIT_TRAILER to the commit attribution lines from the harness reminder")
def done(kind, name): return all(os.path.exists(os.path.join(OUT, kind, name + ext)) for ext in (".png", ".json"))
def sh(*a): subprocess.run(a, cwd=REPO, check=True)
def git_retry(*a, tries=6):
    import time
    for i in range(tries):                     # index.lock clashes with the executor's own git calls
        if subprocess.run(("git", *a), cwd=REPO).returncode == 0: return
        time.sleep(5 * (i + 1))
    raise SystemExit(f"git {' '.join(a)} failed after {tries} tries")
framings = [sys.argv[sys.argv.index("--framing") + 1]] if "--framing" in sys.argv else ["landscape", "portrait"]
for kind in framings:
    names = [s["name"] for s in SEQUENCE[kind]] + ["still"]
    todo = [n for n in names if not done(kind, n)]
    for i in range(0, len(todo), 8):
        chunk = todo[i:i + 8]
        sh(PY, os.path.join(HERE, "render.py"), "--quality", "final", "--out", OUT, "--framing", kind, "--names", ",".join(chunk))
        # Encode this framing's finished frames only (tiers + a partial manifest.<kind>.json); the full
        # manifest.json is written once, after both framings complete (Step 4).
        sh("node", "scripts/encode-frames.mjs", "--src", os.path.relpath(OUT, REPO), "--dst", "public/entrance-final", "--only-framing", kind)
        # Commit ONLY this path: the executor may have files staged for a section task in the same index.
        git_retry("add", "--", "public/entrance-final")
        git_retry("commit", "--only", "-m", f"Final frames: {kind} {chunk[0]}…{chunk[-1]}", "-m", TRAILER, "--", "public/entrance-final")
        git_retry("push", "origin", BRANCH)
        print("chunk done", kind, chunk, flush=True)
