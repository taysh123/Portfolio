# Entrance v2/v3 archive (frozen 2026-10-07)

These are AVIF copies of the render outputs, which otherwise lived only on an ephemeral build container. The 16-bit PNG masters are not kept.

| Folder | Contents |
|---|---|
| `v2-final-frames/{landscape,portrait}` | the frames the stopped v2 full render produced (motion-adaptive plan, 24 spp, 1920×1080 / 1080×1920), AVIF q72, each with its `f####.json` (p, screen quad, lid, render time); `plan-*.json` is the full 194/158-frame plan |
| `lookdev/v2-*` | v2 look-dev: ld1–ld6 lighting and balance, ex experiments, sb1–sb4 storyboards, before (v1 captures), after-coarse, audit |
| `lookdev/v3-ld1`, `lookdev/v3-lens` | v3 rich-workstation look-dev and the 45/50/55/65 mm lens test |
| `checkpoints` | contact sheets and checkpoint comparisons |

To resume, see `docs/superpowers/plans/2026-10-07-entrance-v2-rnd.md` §6. The scenes are `scene_v2.py` and `scene_v3.py`, the cameras `camera_v2.py` and `camera_v3.py`. `anim.py` selects them with `V2_SCENE` and `V2_CAMERA`.
