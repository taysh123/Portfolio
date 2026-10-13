#!/bin/bash
# Renders the About photograph (M10) from source. Usage: design/studio/render.sh <build_dir> [spp=40]
#   needs: python3 + Pillow (prep), a Blender Python with OIDN in $BPY (e.g. a venv with `pip install bpy==5.0.1`),
#          and node (about-photo.mjs uses the project's sharp). AEGIS_ORIG=<folder with Aegis's 08-incident-kanban.png>.
# Writes public/work/about-studio-{800,1200,1600}.{avif,webp}.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:?build dir}"; SPP="${2:-40}"; BPY="${BPY:?set BPY to a Blender python}"
mkdir -p "$OUT"
python3 "$HERE/prep_brand.py"
python3 "$HERE/prep_screens_b.py" "$OUT"
B_CAM='{"loc":[0.18,-1.40,0.70],"target":[0.70,0.12,0.27],"lens":31,"shift":[-0.20,0.03]}' B_SA=2.6 B_SD=2.4 B_LAMP=34 \
  "$BPY" "$HERE/scene_b.py" -- --pass beauty --out "$OUT/studio-2880x1800.png" --build "$OUT" --w 2880 --h 1800 --spp "$SPP"
(cd "$HERE/../.." && node design/studio/about-photo.mjs "$OUT/studio-2880x1800.png")
