> **Historical copy, text only (N1, 2026-11-18).** This is the design-references README from the stale branch
> `reference/premium-redesign-package` (`design/references/README.md`, last changed in `4df968d`, 2026-08-05;
> blob `1a39ff2`). It is kept here because decision **D1** in `docs/RESEARCH_AND_DECISIONS.md` follows its
> "take / do NOT take" lists, so D1's source survives if that branch is ever deleted.
>
> - Everything below the rule is the original text, byte for byte. Nothing is reworded.
> - **Not copied:** the AI-generated image it describes (`arrival-workspace-reference.png`) or any other image. It
>   is direction only, never a production asset, and it is not in this repository.
> - `design/render/`, named in its last paragraph, does not exist on `main`; `design/` holds only the
>   `design/studio/` prep scripts.
> - The decisions win over this text: D1 applies these lists to evolving Product Plates, and D2 rules out 3D for now.

---

# Design references

## `arrival-workspace-reference.png`

Supplied 2026-08-05 as the primary visual direction for the arrival experience
(Concept B — pre-rendered workspace with a live DOM monitor).

### What we take from it

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

### What we deliberately DO NOT take from it

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
