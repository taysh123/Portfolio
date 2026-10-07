# Entrance v2 — realism and smoothness R&D (2026-10-07)

The v1 entrance shipped green on every automated gate, and still read as a 3D website animation rather than a
product film. This records what was wrong at the root, what was tried, what was kept, and what is still open.

## 1. Forensic audit of v1

v1 source: `design/render/blender/{scene,render,camera_path}.py`; runtime `components/entrance/EntranceStage.tsx`,
`lib/entrance/*`. Captures: v1 production build at p = 0, 0.1 … 1, 1440×900 and 390×844 (headless Chromium).

| Beat (p) | Looks good | Looks fake / stiff / CGI | Root cause |
|---|---|---|---|
| 0–0.12 arrival | dark, restrained palette | the "move" is a 3 % CSS zoom of one still under a 72 % black veil: nothing in the room moves | no rendered frames before p 0.12 |
| 0.12–0.38 lid | lid hinges at the right axis | lid reads as a flat slab; keys a printed grid; the trackpad a grey card; the lid finishes with a hard white streak (light-bar reflection); 25→30 mm lens distorts | box-primitive geometry at 1.2× real scale (409 mm wide, 23 mm key pitch); hidden glossy "cards" light-linked per object; wide lens |
| 0.38–0.68 wake + identity | DOM boot log and identity card on the screen are crisp | the camera is frozen for 30 % of the scroll (k1-on still) while only the screen changes; the screen content is a flat plane with no glass | v1 camera path holds K1 across two beats; the DOM surface covers the rendered glass entirely |
| 0.68–0.88 push | lands on the screen cleanly | dolly and zoom at once (30 → 50 mm) — reads as a CG camera; 28 frames for the whole push, cross-faded: ghosting at rest, "dissolve" while moving | lens animated between keys; too few frames |
| room (all) | blue/warm split intended | three walls of glowing code monitors, a corrugated blue slat wall, RGB-ish tower: the "cyber developer" cliché; uniformly lit, low contrast, fog-lifted blacks | ~15 lights, light linking, mist compositing; no single motivated source |
| motion (all) | rVFC presented-frame placement keeps the quad on the picture | 65 stills for the whole film: each scroll step is a dissolve between camera positions, not motion; velocity kinks at every key | sparse sampling; linear lerp between eased segments with holds |

Render facts (v1): Cycles CPU, 48–64 spp, OIDN, AgX, 1920×1080 landscape, 1080×1920 portrait; 65 + 29 frames;
the scene rebuilt from scratch per frame.

## 2. Research

**Scroll-scrub architectures** (searched 2026-10-06/07): Apple's product pages use canvas image sequences, not
`<video>`; video seeking is asynchronous and keyframe-bound; WebCodecs `VideoDecoder` is complete on iOS only from
Safari 26 (2025), with a reported out-of-order-frames issue. iOS Safari caps total canvas memory (224 MB since
iOS 12) and canvas area (16.7 Mpx). Conclusion for this project: keep the canvas sequence on desktop/tablet, the
hardware-decoded scrub video on phones (decided and measured in v1: WebKit decodes `createImageBitmap` on the main
thread), and spend the effort on what the frames contain and how densely they sample the motion.

**Product visualisation**: realism comes first from geometry at real scale with real edge radii, then from
materials with roughness variation, then from lighting with *something to reflect* — metal and glass look fake
in a void lit by invisible cards. A large soft source placed where the product's reflection lands, and practical
sources motivated by the room, is the standard product-photography answer.

**Assets and tools** — none could be used: this environment's network policy denies polyhaven.com,
dl.polyhaven.org, ambientcg.com, blenderkit.com and extensions.blender.org (npm and raw GitHub are reachable).

| Candidate | Solves | Licence / cost | Verdict |
|---|---|---|---|
| Poly Haven (HDRIs, textures, models) | real HDRI reflections, wood/plaster scans | CC0, free | worth it; blocked here |
| ambientCG (PBR materials) | scanned linoleum/plaster/fabric | CC0, free | worth it; blocked here |
| BlenderKit | large model/material library | free assets RF or CC0; Full Plan $118.80/yr (under $100k revenue) | not needed: no model there beats a real-scale procedural build of this specific laptop |
| `@pmndrs/assets` HDRIs (npm, CC0) | studio/room HDRIs | CC0, free | downloaded, rejected: 512 px — too low for reflections in a 1920 frame |
| Paid laptop models | — | — | rejected: trademarked product designs; licence ambiguity |

What was used: procedural materials only, a keycap/perforation atlas drawn with Pillow, DejaVu Sans for legends
(Bitstream Vera licence, free). No add-ons, no downloaded assets in the render.

## 3. Experiment matrix (look-dev, `design/render/blender/v2/shot.py`)

| Area | v1 | A | B | C | Winner |
|---|---|---|---|---|---|
| Lighting | 15 hidden cards + fog | window left + lamp right | window right + lamp left (lid mirrors warm lamp → orange/teal) | window *behind* the desk with a sheer curtain (lid mirrors the glowing curtain) | C |
| Balance | — | blue hour, room bounce 0.08 | night (lamp-dominant: orange cast) | dusk studio (lifted) | blue hour, exposure +1.5, lamp 0.6, fill 0.10 |
| Lens (same framing) | 25→50 mm zoom | 35 mm (lid distortion) | 50 mm | 65 mm | 65 mm, constant |
| K0 angle | — | el 20° (lid mirrors the sill: dark) | el 28° | el 36° | az 28–31°, el 30–31° |
| Samples (1920×1080) | 48–64 | 64 spp: 306 s | 32 spp: 161 s, mean Δ 0.34/255 vs 64 | 16 spp: 85 s, p99 Δ 23/255 (denoiser variance) | 24 spp (flicker margin) |
| Render cost | — | lower bounces | emissive curtain | path guiding | none: cost ∝ samples; guiding slower |
| Fill reflection | — | fill visible to glossy: the black display read grey | fill flagged out of reflections | — | B |

## 4. What v2 is

See the commit "Entrance v2 scene…" for the scene; runtime changes:
- frames at equal on-screen motion (≤ 10 px at 1920, ≤ 9 px at 810), 194 landscape / 158 portrait, from p = 0;
- one 65 mm camera, PCHIP over progress (C1, no overshoot), never holding; friction-hinge lid; display wakes after
  the lid settles;
- the display renders as black glass; the page is composited additively over it (`mix-blend-mode: plus-lighter`,
  `screen` fallback) until identity — the glass reflections show through the page as on a real display;
- no CSS zoom (the camera moves); veil 0.72 → 0.45;
- phones: the scrub video holds exactly the rendered frames at their own progress (`video.ps`), nothing
  synthesised;
- diagnostics (`?entrancePerf=1`): live progress / wanted / on-screen frame, media time, readyState, buffered and
  seekable ranges, device class.

## 5. Measurements

(filled in below as the final frames land)
