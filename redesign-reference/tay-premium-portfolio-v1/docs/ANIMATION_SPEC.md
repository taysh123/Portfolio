# Animation Spec

## Intro scroll timeline

The desktop intro is approximately `390vh` with a sticky viewport.

1. 0–10% — environment emerges from darkness.
2. 11–35% — laptop lid opens with the scroll.
3. 27–50% — screen powers on and terminal boot lines appear.
4. 54–64% — terminal fades; identity appears.
5. 63–88% — accessories fall back while the laptop moves toward camera.
6. 88–100% — dark portal veil creates the transition to the main hero.

The mobile timeline is intentionally shorter and omits unnecessary desk props.

## Live graphics

`AmbientCanvas` draws a lightweight particle field plus a pointer-position radial light. It uses Canvas 2D instead of WebGL to keep baseline cost low.

## Project scenes

Each project uses the same scroll choreography but a unique visual renderer. This keeps the motion language consistent while giving each product a distinct world.

## Accessibility

With `prefers-reduced-motion: reduce`, scrubbed timelines are disabled, the laptop begins open, boot animation is skipped, continuous animations collapse, and scroll behavior becomes non-smooth.
