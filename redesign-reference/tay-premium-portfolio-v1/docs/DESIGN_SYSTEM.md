# Design System

## Direction

Dark cinematic product launch. Premium and restrained rather than neon/cyberpunk.

## Core palette

- Background: `#05070a`
- Elevated: `#0d121a`
- Primary text: `#f5f7fb`
- Secondary text: `#8f98a8`
- Primary action: `#2f80ff`
- Hairline border: `rgba(255,255,255,.09)`

Project accent colors are data-driven via `--project-accent`.

## Typography

Geist + Geist Mono via `next/font`. Headlines intentionally use very tight letter spacing and responsive `clamp()` sizing.

## Layout

Content shell defaults to 1240px maximum with wide negative space. Project sections are viewport-scale on desktop and stacked on mobile.

## Motion

Motion must communicate hierarchy or spatial continuity. Avoid random entrance animations. Preferred moves: scrubbed scale, subtle y translation, opacity, camera push, parallax and mask/lighting changes.
