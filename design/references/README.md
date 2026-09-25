# Design references

## `cinematic-laptop-concept.webp` — CURRENT

Supplied 2026-09-25 with the brief that restarted the redesign. It is the
approved visual direction for the whole site, and it is identical to
`docs/portfolio-concept.png` in the reference package on the
`reference/premium-redesign-package` branch. The governing spec is
`docs/superpowers/specs/2026-09-25-cinematic-laptop-redesign-design.md`.

What it fixes:

- **The entrance:** a generic premium laptop on a dark desk. It goes from
  closed (01 "Scroll to begin"), to opening (02 "Scroll to open"), to awake
  with a boot log and the identity (03 "Welcome"). A monitor of code sits out
  of focus behind it, with a plant, a mug and a notebook reading
  "Ideas / Build / Ship / Repeat.". There is warm light right, cool light
  left, and depth of field.
- **The page:** the hero *I build software people can actually use.*;
  full-viewport project scenes (T Poker phones, the SentinelAI monitor); About
  *Engineer by training. Builder by nature.*; a bento tech stack;
  *Think. Build. Ship.*; and the contact *Let's build something great.* over a
  planet horizon.

What it does NOT fix: facts. The About panel's "6+ Shipped projects" and any
other figure in the image are placeholders. Every number on the site comes
from `data/*.ts`, which was checked against each project's repository.

The image is a reference only. It is never shipped or rendered into the site.

---

## `arrival-workspace-reference.png` — SUPERSEDED

Superseded on 2026-09-25 by `cinematic-laptop-concept.webp`. It is kept for
history: it documents the dual-monitor Concept B that the September brief
replaced.

Supplied 2026-08-05 as the primary visual direction for the arrival experience
(Concept B — pre-rendered workspace with a live DOM monitor).

### What was taken from it (historical)

- **Composition.** Dual monitor layout: a large primary monitor square to the
  camera, a smaller secondary angled in from the left.
- **Camera.** Slightly above desk height, close enough that the desk surface
  reads as a foreground plane, framed so the primary monitor is the subject.
- **Desk layout.** Keyboard centred on a mat in front of the primary monitor,
  mouse to its right, headphones on a stand at the right edge, mug, notebook
  front-left, speakers flanking.
- **Monitor content.** Primary shows the portfolio itself with the identity
  legible. Secondary shows real engineering surfaces.
- **The product-photograph feeling** — an object staged deliberately, not a
  snapshot of a room.

### What was deliberately not taken from it (historical)

The image contradicts the written art direction it was sent to illustrate. The
brief says, in the same message that introduced this reference:

> Not a gaming room. Not RGB everywhere. Not cyberpunk. Not futuristic. Not
> overloaded. […] Do not rely on RGB.

and asks for a mood that is *calm, focused, premium, quiet, intentional*, with
materials of *walnut, matte black, oak, brushed aluminium*, referencing Apple,
Linear, Stripe, Vercel and Raycast.

So the following are **not** carried over:

| In the reference | Why it is dropped |
| --- | --- |
| Purple + green LED wash on every surface | "Not RGB everywhere", "do not rely on RGB" |
| Floating holographic cube | "Not futuristic" — and nothing decorative without purpose |
| Circuit-board desk mat | Decorative pattern with no function |
| Neon under-shelf and under-desk strips | Same as above |
| Fabricated on-screen stats — "50+ Projects", "10M+ Events Processed", "99.99% Uptime" | **Factually false for this portfolio.** Project counts were deliberately removed; there is no uptime or event-volume figure that can be backed by a repository. The site's whole thesis is that every number is checkable. |

The image also shows clear generative-AI artefacts (unreadable book spines,
a malformed certificate, inconsistent text), and the brief rules out
"obviously AI-looking artwork".

### Licensing

This file is a **reference only**. It is never shipped, never rendered into the
site, and is excluded from the public build. The arrival asset is rendered from
our own scene — see `design/render/` — so no third-party asset licence applies.
