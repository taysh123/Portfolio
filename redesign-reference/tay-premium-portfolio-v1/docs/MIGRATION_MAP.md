# Migration Map — existing `taysh123/Portfolio`

This package is a redesign source kit, not a destructive repository replacement.

## Keep from the existing repository

- Existing API routes and contact behavior.
- Cookie/theme/a11y preferences if still desired.
- SEO/JSON-LD implementation and current security headers/proxy logic.
- Existing `data/projects.ts` case-study depth.
- Real project screenshot folders under `public/projects`.
- Any working analytics, forms, rate limiting or deployment-specific configuration.

## Port from this package

- `components/IntroScene.tsx`
- `components/AmbientCanvas.tsx`
- New navigation and section composition.
- Project visual renderers and full-screen storytelling layout.
- New global design tokens / cinematic CSS.
- GSAP dependency and ScrollTrigger choreography.

## Data recommendation

The standalone package contains a deliberately concise `data/projects.ts` optimized for the homepage. The existing repo has richer project/case-study data. Prefer adapting the visual components to the existing data model rather than throwing the rich data away.

## Suggested migration sequence

1. Add GSAP.
2. Add intro scene + new CSS under an isolated route or feature branch.
3. Port Navigation/Hero.
4. Adapt Projects to current project data.
5. Port About/Stack/Process/Contact while retaining current functionality.
6. Verify reduced motion, keyboard navigation and mobile.
7. Run typecheck/lint/tests/build.
8. Compare screenshots at desktop, tablet and mobile widths.
