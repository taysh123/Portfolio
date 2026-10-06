# Arrival Experience — Design Proposal

**Date:** 2026-08-05
**Branch:** `feature/premium-portfolio-redesign`
**Status:** PROPOSAL — not approved, nothing implemented
**Scope:** the arrival experience only (hero + workstation). Every other section
continues on the current redesign.

---

## 0. The observation that reframes this

The brief names five references: **Apple, Linear, Stripe, Vercel, Raycast.**

Four of those five use **no 3D scene at all**. Linear, Stripe, Vercel and Raycast
achieve "premium" through typographic precision, restrained materials, and motion
that behaves like software. The fifth — Apple — does use photoreal 3D, but ships it
as **pre-rendered image sequences**, not real-time WebGL.

That matters, because the instinct "premium arrival ⇒ build a 3D room" is not
supported by the reference set. It gives us two credible routes to the workspace
idea (pre-rendered, or expressed as interface) and one expensive route (real-time
modelled), and the expensive one is the only one none of the references actually
took.

This proposal takes the workspace *concept* seriously and challenges only the
assumption that it must be a real-time 3D room.

---

## 1. What the arrival has to do

Ranked. Later goals never justify breaking an earlier one.

1. **Say whose this is, immediately.** TAY SHOFER / Software Developer, legible in
   the first frame, before any motion.
2. **Establish engineering credibility in seconds**, through content that is real
   rather than decorative.
3. **Feel intentional and calm.** Confidence, not spectacle.
4. **Hand the visitor into the portfolio without a seam** — one continuous move,
   no cut, no fade-to-black, no scene swap.
5. **Cost the visitor nothing.** No jank, no long wait, no hostage scroll.
6. **Be equally good on a phone**, by its own design rather than by shrinking.

**Explicit non-goals:** photorealism for its own sake; a scene the visitor has to
wait for; anything that reads as a game, a gadget demo, or a tech showcase.

---

## 2. Concepts

Six, spanning the real option space. Each is judged on the same axes.

### Concept A — Modelled workspace, real-time WebGL

A full desk in three.js: two monitors, mechanical keyboard, headphone stand,
notebook, coffee, cable management, HDRI-lit. Camera dollies to the primary
monitor.

- **Strengths.** Highest ceiling. Literal delivery of the brief. If it lands, the
  "wow" is immediate and needs no explanation.
- **Weaknesses.** The failure mode is *asymmetric and severe*: a 6/10 desk is worse
  than no desk, because it reads as a video-game asset — precisely the "gaming
  room" the brief rules out. Every object added multiplies modelling, texturing and
  lighting cost. Live DOM inside the monitor is the hardest technical problem in the
  whole project (matrix-projecting a DOM plane onto a rendered quad, kept aligned
  through a camera move).
  Evidence from the spike already built: procedural PBR geometry with three's
  `RoomEnvironment` rendered as **grey plastic** until exposure and env intensity
  were hand-tuned across every material. That was one laptop. A room is ten times
  the surface area of that problem.
- **Complexity.** Very high — the largest single piece of work in the project.
- **Desktop.** Potentially spectacular.
- **Mobile.** Needs a wholly separate design regardless; a wide desk at 390px is a
  thumbnail of a room.
- **Performance.** Models + PBR textures + HDRI realistically 3–10MB, plus a WebGL
  context, on the critical path of the first thing anyone sees. Directly contradicts
  the mobile performance requirement unless made desktop-only.
- **Accessibility.** Scene is pure decoration; needs a complete parallel non-visual
  path and a static reduced-motion frame.
- **Maintenance.** Highest in the repo: an asset pipeline, three upgrades, and scene
  re-tuning whenever anything changes. Owned by one person.
- **Memorability.** Very high *if* it lands. That conditional is the whole risk.

### Concept B — Pre-rendered workspace + live DOM monitor ★ strong alternative

The same scene, but **rendered once, offline, at whatever quality we like**, and
shipped as layered images. The primary monitor's screen area is a real DOM surface
positioned in the render's monitor quad. Scroll scales the composite about the
monitor's centre; the desk layers move faster (parallax) and leave frame; the DOM
surface grows until it *is* the viewport.

- **Strengths.** Photoreal, because it is a render rather than a real-time
  approximation — no uncanny valley, no material tuning at runtime. The monitor is
  live DOM, so the entry is genuinely seamless and stays crisp at any zoom. No
  three.js in the bundle. One optimised AVIF/WebP hero (~250–450kb) instead of
  megabytes of assets. **This is the Apple approach.**
- **Weaknesses.** Requires an asset I cannot produce here (see §9). Fixed camera —
  the dolly is a scale/parallax of flat layers, so it cannot orbit. Re-rendering is
  needed for any scene change.
- **Complexity.** Medium. The engineering is layer compositing and one transform
  mapping — well-understood, testable.
- **Desktop.** Excellent.
- **Mobile.** A separately-framed crop of the same render, or a portrait render.
  Cheap to do well.
- **Performance.** Excellent. One image, `preload`ed, decoded once. No WebGL.
- **Accessibility.** Render is `aria-hidden` decoration; the DOM monitor is the real
  content and is read normally. Reduced motion: render the end state, no dolly.
- **Maintenance.** Low at runtime; the cost is that scene edits need a re-render.
- **Memorability.** High and *reliable* — the quality is fixed at render time rather
  than dependent on runtime tuning.

### Concept C — The workspace *is* the interface ★ recommended

No modelled room. The arrival is a full-viewport **developer environment composed
from the site's own design system**: a primary surface carrying the identity,
flanked by real, live engineering surfaces — a CI run completing, a container going
healthy, a commit landing, a latency sparkline ticking, a build log settling.

The camera push is: the primary surface scales toward viewport-fill while the
flanking surfaces translate outward with greater velocity and fade. It ends with the
primary surface *being* the hero. There is no bezel to dissolve and no scene to
leave, because the thing entered was always the site.

- **Strengths.** No uncanny valley — nothing pretends to be a photograph, so nothing
  can fall short of one. Live DOM throughout, so the seamless entry is trivial and
  always crisp. Tiny payload. Reflows honestly to mobile. Accessible by construction
  (real text, real structure). Maintained as part of the design system rather than as
  a separate artefact. **The engineering atmosphere is real content**, which is this
  site's entire thesis — every number already claims to be checkable. And it is the
  register Linear/Stripe/Vercel/Raycast actually occupy.
- **Weaknesses.** Less instantly "wow" to a non-technical viewer than a photoreal
  room. Real risk of reading as "just a dashboard" if composition and motion are not
  exceptional — the craft burden moves onto typography, spacing and motion, where
  there is nowhere to hide.
- **Complexity.** Medium, and entirely in territory this codebase already handles.
- **Desktop.** Excellent.
- **Mobile.** Naturally becomes a single column of the same surfaces. No separate
  concept needed, though it gets separate composition.
- **Performance.** Best of all six. No assets, no WebGL, no new dependency.
- **Accessibility.** Best of all six.
- **Maintenance.** Lowest.
- **Memorability.** High **for the audience that matters** — engineers and hiring
  managers, who recognise a real CI run and a real service map. Lower for a general
  audience.

### Concept D — The session (terminal-first)

Arrival is a terminal. A command runs; its output resolves into the portfolio.

- **Strengths.** Maximally engineering-first. Cheap. Distinctive motion.
- **Weaknesses.** It is a **cliché of the genre** — a large share of developer
  portfolios open with a terminal, so it signals "developer portfolio" rather than
  "premium product". Poor for non-technical recruiters. Hard to make *calm*: a
  terminal is inherently busy and monospaced. Slow for a reader who wants
  information now.
- **Complexity.** Low–medium. **Memorability.** Moderate and polarising.
- Rejected primarily on the cliché risk, which directly attacks goal 3.

### Concept E — The system map

Arrival is a full-screen architecture/topology of the portfolio and its projects,
which then resolves into the site's sections.

- **Strengths.** Genuinely unique. Deeply engineering. Reuses the topology language
  already built for About.
- **Weaknesses.** Abstract — it asks the visitor to *read a diagram* before they know
  whose site it is, which breaks goal 1, the highest-ranked goal. Can read as cold.
- **Complexity.** Medium. **Memorability.** High but risky.
- Rejected on goal-1 conflict, but see §12 — it may be the right *second* beat.

### Concept F — The machine alone (current baseline)

Keep the refined single laptop.

- **Strengths.** Built, verified, cheapest, and the push already works.
- **Weaknesses.** Four passes have not moved it past "illustration". One laptop says
  less than a workspace. The CSS ceiling is now demonstrated rather than theorised.
- Included as the honest do-nothing baseline.

---

## 3. Recommendation

**Primary: Concept C — the workspace as interface.**
**Strong alternative: Concept B — pre-rendered workspace + live DOM monitor**, *if*
a render can be obtained (§9).

I am recommending against your current favourite as a *real-time modelled scene*
(Concept A), and I want to be direct about why rather than quietly steering.

**Why C over A.** A's quality is decided at runtime by material tuning I would be
doing blind, its failure mode lands exactly on the aesthetic you ruled out, and it
puts megabytes on the critical path of the first impression. C's quality is decided
by composition and typography — the things this codebase and this design system are
already good at — and its engineering atmosphere is *real*, which is the one claim
this portfolio makes everywhere else. A site whose thesis is "every number here is
checkable" should not open on a rendered prop.

**Why B is genuinely competitive.** B gives you the literal vision at photoreal
quality with *better* performance than A and a trivial seamless entry. If you want
the room, B is how to have it. Its single dependency is an asset.

**Why not A even so.** A is the only option whose outcome I cannot predict or
guarantee, and it is the most expensive to reverse.

**If you and ChatGPT prefer B or A after review, say so and I will build it
properly** — this is a recommendation, not a refusal.

---

## 4. Recommended concept in detail (C)

### 4.1 Composition

A three-zone frame, asymmetric, on the existing near-black field.

```
┌──────────────────────────────────────────────────────────────┐
│  ·  ambient field · very slow drift · no content             │
│                                                              │
│   ┌──────────────┐   ┌────────────────────────┐  ┌────────┐  │
│   │  SIGNALS     │   │                        │  │ BUILD  │  │
│   │  (left rail) │   │      TAY SHOFER        │  │  LOG   │  │
│   │              │   │   Software Developer   │  │        │  │
│   │  ci · green  │   │                        │  │ (right)│  │
│   │  svc · up    │   │   Live  1,742  7  BSc  │  │        │  │
│   │  p95 · graph │   │                        │  │        │  │
│   └──────────────┘   └────────────────────────┘  └────────┘  │
│                                                              │
│           Everything here runs.  Come in and check.   ↓      │
└──────────────────────────────────────────────────────────────┘
```

- The **primary surface** is centre, largest, quietest — it holds only the
  identity and the proof strip. It is the thing the camera enters.
- The **flanking surfaces** are smaller, denser, and sit *behind* the primary in
  z, dimmed. They are the workspace. They are never the subject.
- Everything is off-centre by design except the primary surface, which is the
  one thing allowed to be square to the viewer.

### 4.2 The living workspace — content, not decoration

Every signal is real and checkable, in keeping with the rest of the site.

| Surface | Content | Life |
| --- | --- | --- |
| CI | `5 jobs · passing` (T Poker's real CI count) | a job ticks from running → passed, once |
| Services | `api · workers · postgres · redis · rabbitmq` | one container flips to *healthy* |
| Tests | `1,742 passing` | counts up once, then rests |
| Commit | short SHA + subject | one lands, list shifts by one |
| Latency | p95 sparkline | drifts within a narrow band |

**Rules of life:** at most **one** thing moves at a time; nothing loops faster than
~8s; nothing ever demands attention; everything settles to a resting state within
~12s of arrival and stays there. The visitor should *discover* these, not be shown
them. Under reduced motion, all render at their resting state and nothing moves.

### 4.3 Camera choreography

One continuous move, scroll-driven, over ~180vh of pinned travel (matching the
current intro's budget — no extra scroll cost).

| Progress | What happens |
| --- | --- |
| 0.00 | Rest. Everything legible. Nothing has moved yet. |
| 0.00–0.10 | Dead zone. The reader's first scroll must not feel like a trigger. |
| 0.10–0.45 | **Dolly.** Primary surface scales 1 → 1.9 about its own centre. Flanks scale 1 → 2.6 and translate outward — they leave frame because they are *closer to the camera*, which is what a real dolly does. Ambient field drifts opposite at 0.3× for parallax. |
| 0.45–0.75 | Flanks are gone. Primary continues 1.9 → 4.2. Its border and radius interpolate to zero — the frame *becomes* the viewport rather than fading. |
| 0.75–1.00 | Primary is the viewport. Its content is already the hero's content, at the hero's final size. Pin releases. |

**Easing.** A single `cubic-bezier(0.16, 1, 0.3, 1)` on a *distance* curve, not a
time curve — the reader controls the clock, so the acceleration must live in the
mapping from scroll to scale (`scale = 1 + t^2.2 × k`), which is what makes it read
as a dolly rather than a linear zoom. This is already proven in the current intro.

**Why there is no cut.** The primary surface's contents *are* the hero section's
contents, in the same components, at the same type scale. At progress 1.0 the
surface's geometry has become the viewport's geometry. Nothing is swapped, faded or
replaced — which is exactly what the brief asks for, and is only cheap because
everything is DOM.

### 4.4 Lighting and materials

No RGB. One key, one rim, one ambient — expressed in CSS as the design system
already does.

- **Key:** a soft radial from upper-left, `--glow-strong` at low alpha, behind the
  primary surface only.
- **Rim:** the existing `edge-lit` hairline, brightest along each surface's top edge.
- **Ambient:** the page field's existing aurora, drifting at 0.3× the dolly.
- **Screen glow:** the primary surface throws light onto the field beneath it — the
  cue that it is emitting rather than merely light-coloured.
- **Depth:** flanking surfaces sit behind on `--panel-solid` with reduced opacity and
  a slight negative `translateZ`. Real occlusion, not just dimming.
- **Materials:** the existing token set — no new colours. Glass = low-alpha surface +
  hairline + specular sweep. Metal appears nowhere; there is no object to be made of it.

### 4.5 Motion language

- Compositor-only properties (`transform`, `opacity`). No layout animation, ever.
- Enter from below, exit upward. Exits ~65% of enter duration.
- One motion hierarchy: **camera** (scroll-driven) > **state** (a build passing) >
  **hover** (never more than a 1px lift and a border).
- Nothing auto-advances. Nothing loops in the reader's field of attention.

### 4.6 Desktop vs mobile

**Desktop (≥1024px).** As above. Pinned, three zones, full dolly.

**Mobile — a different design, not a reflow.**
A pinned dolly on a phone costs a reader most of a flick and fights the address-bar
collapse; that judgement is already established and verified in this project.

Instead: the primary surface is presented at rest, full-bleed, with the identity at
display scale. The flanking signals become a **single horizontal rail beneath it**
that the reader can flick through — same content, thumb-native, discoverable rather
than decorative. There is no dolly; the page simply scrolls, and the primary
surface's content *is* the hero, so there is still no seam.

The reader gets the same three things (whose site, that it is real, that it is
alive) in a form that suits a phone.

### 4.7 Accessibility

- The arrival contains exactly **one** heading; everything else is `aria-hidden`
  choreography. A screen reader gets the identity and the statement, not 180vh of
  theatre.
- Every signal surface has a text equivalent already, because the content is text.
- **Reduced motion removes the pin entirely** — not slows it. Static composed frame,
  normal page scroll, all signals at rest. (Established pattern in this codebase.)
- Keyboard: nothing in the arrival is interactive except the nav and the skip link,
  so there is no focus order to manage inside the choreography.
- No signal conveys meaning by colour alone; each carries a label.

### 4.8 Performance

- **Zero new dependencies. Zero new assets.**
- No WebGL, no canvas, no image decode on the critical path.
- The arrival is server-rendered text and CSS; first paint is unaffected.
- Scroll work is one `useScroll` and a handful of `useTransform`s — the same
  machinery already shipping.
- Budget to hold: **CLS 0** (already), and no regression to first paint.

---

## 5. Implementation strategy (C)

**Technologies:** exactly what is already in the project — Next 16, React 19,
Tailwind v4, Framer Motion, Lenis. **No new library is required.**

Considered and rejected:
- **GSAP + ScrollTrigger.** Better scroll-choreography ergonomics than Framer, but a
  new dependency and a second animation system in one codebase. The current intro
  proves Framer's `useScroll` is sufficient here.
- **three / R3F.** Not needed by C at all.
- **Lottie.** Wrong tool: this is scroll-driven, not timeline-driven.

**Structure:**

```
components/sections/Arrival.tsx        the pinned stage + choreography
components/arrival/PrimarySurface.tsx  identity + proof strip (shared with Hero)
components/arrival/SignalRail.tsx      the live surfaces (desktop flanks / mobile rail)
components/arrival/signals/*.tsx       CI, services, tests, commit, latency
data/signals.ts                        the real, checkable content
```

`PrimarySurface` is **shared with the Hero section** rather than duplicated — that
sharing is what makes the seam impossible rather than merely hidden.

**Fallbacks:** reduced motion → static frame. Below `lg` → mobile design. No
JavaScript → the composed frame renders server-side and is fully readable.

---

## 6. If you choose B instead (pre-rendered workspace)

Recorded now so the decision is fully informed.

- **Asset needed:** one hero render, ideally as 2–3 layers (background, desk
  foreground, optional shadow pass) with the monitor screen area empty/masked.
  Portrait variant for mobile.
- **Sourcing:** commission (~$50–200), buy a licensed stock render, or render in
  Blender from CC0 assets (Poly Haven has desks, monitors and HDRIs under CC0).
  **Not** AI-generated — that conflicts with the standing "no AI-generated artwork"
  constraint, and I would want that reaffirmed explicitly before treating it as an
  option.
- **Format:** AVIF with WebP fallback, `preload`ed, ~250–450kb total.
- **Engineering:** map the DOM screen onto the render's monitor quad with one
  `matrix3d`, derived once from four corner points measured in the render. Scroll
  drives scale/translate of the layers and the DOM surface in lockstep.
- **Risk:** the mapping must be re-derived if the render changes. Mitigate by storing
  the four corner points as data next to the asset.

---

## 7. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| C reads as "just a dashboard" | High | Composition and restraint carry it. Prototype the resting frame first and judge it *before* building any motion. This is the one that must be checked early. |
| The dolly feels like a zoom, not a camera | Medium | Flanks must scale *faster* than the primary — that differential is the entire illusion. Verify by measurement, not by eye. |
| Signals feel fake | High | Every value is real and checkable. No invented telemetry, no fake p99s. If a number cannot be backed, it does not ship. |
| Too much life | Medium | Hard rule: one thing moving at a time, everything at rest within ~12s. |
| Mobile becomes a second-class citizen | Medium | It gets its own composition, specified above, not a media query. |
| Scope creep back into 3D | Medium | If C's resting frame does not convince at review, switch to B rather than bolting 3D onto C. |

---

## 8. Open questions for you and ChatGPT

1. **C or B?** The recommendation is C; B is fully viable if you can obtain a render.
2. If **B**: can you source the render, and do you want to reaffirm or relax the
   "no AI-generated artwork" constraint for it?
3. **Signal content** — is the list in §4.2 the right five, or would you rather show
   different surfaces?
4. **Scroll budget** — 180vh for the arrival, as now. Shorter, longer, or unchanged?
5. Does the mobile design in §4.6 satisfy "equally premium", or do you want a
   distinct mobile *concept* rather than a distinct mobile composition?

---

## 9. What happens next

Nothing is implemented until this is approved. On approval I will produce an
implementation plan (ordered, with verification gates) before writing code, and the
existing arrival stays exactly as it is until its replacement is verified.
