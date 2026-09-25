# Plan 1: Cinematic Entrance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the scroll-driven laptop entrance on the real site: a path-traced frame sequence (preview quality) on a canvas, with the real hero mounted as the laptop's screen and handed off to the page at identity. It comes with the test foundation it needs and the retuned tokens, hero, nav and data.

**Architecture:**
- A Blender pipeline (`design/render/blender/`) renders procedural frames and writes each frame's projected screen quad.
- `scripts/encode-frames.mjs` turns them into AVIF tiers and `public/entrance/manifest.json`.
- At runtime, a server `Entrance` hosts the `Hero` as its screen surface. A client `EntranceStage` maps scroll progress to frames through pure, unit-tested modules (`lib/timeline.ts`, `lib/entrance/*`). It draws with `FramePlayer` and positions the hero with a CSS `matrix3d` homography.
- Static mode (reduced motion from either source, or no JS) is decided in CSS at first paint.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5 strict, Tailwind v4, Framer Motion 12 (`useScroll`), Lenis. Tooling: Vitest 5 (unit), Playwright 1.62 (e2e), sharp 0.34 (encoding), and Blender 5.0 `bpy` (pip wheel, Python 3.11, dev-only).

**Spec:** `docs/superpowers/specs/2026-09-25-cinematic-laptop-redesign-design.md` (approved 2026-09-25, including preview key frames K0/K1/K2).

**Scope — this is Plan 1 of 2** (the spec spans independent subsystems, so it is split per the writing-plans scope check):
- **Plan 1 (this document):** spec phases A (foundation), C1 (render pipeline plus **preview** frames) and B (entrance runtime), plus the hero, nav and data changes the entrance needs. It ships working software: the new entrance on the live page, with the existing August sections still below it.
- **Plan 2 (written after Plan 1 lands, and reviewed before execution):** phase D (the four project worlds, more-work rows, About, Stack, Think/Build/Ship, Contact, Footer); **C2 final look-dev and the final render batch, behind your blocking visual gate**; phase E (removal of superseded code and `three`, the full verification pass).

## Global Constraints

- **Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`** (AGENTS.md: "This is NOT the Next.js you know"). In Next 16, `next/image` uses `preload`, not the deprecated `priority`. The poster is a plain `<picture>` with `fetchPriority="high"`.
- **No new runtime dependency.** Dev only: `vitest@^5.0.2` and `sharp@^0.34.5`. No GSAP, no R3F. Blender is never a `package.json` dependency.
- **One animation system:** Framer Motion (`useScroll`) plus Lenis. Only compositor properties (`transform`, `opacity`) change per frame.
- **Palette (dark):**

  | Token | Value |
  |---|---|
  | `--bg` | #05070a |
  | `--bg-raised` | #0a0e14 |
  | `--fg` | #f2f4f8 |
  | `--fg-muted` | #9aa3b2 |
  | `--fg-subtle` | #7b8597 |
  | `--accent` | #5b9cff |
  | `--accent-solid` | #1d6ef5 |
  | `--screen` | #05070a (both themes) |
  | `--status-live` | #4ade80 |

- **Beats** (landscape `p`):

  | Beat | Range |
  |---|---|
  | Lift | 0–0.12 |
  | Title out | 0.12–0.17 |
  | Lid | 0.12–0.38 |
  | Wake | 0.38–0.53 |
  | Identity | 0.53–0.68 |
  | Push | 0.68–0.88 |
  | Portal | 0.88–1.00 |
  | Nav in | 0.96–1.00 |

  Portrait: the band opens over 0.88–0.96, then there is continuity only.
- **Containers:**

  | Viewport | Frame set | Container |
  |---|---|---|
  | Aspect ≥ 0.9, height ≥ 500 px | Landscape | 400svh |
  | Aspect < 0.9 | Portrait | 260svh |
  | Aspect ≥ 0.9, height < 500 px | Landscape | 260svh |

- **The surface is at identity for p ≥ 0.88** (landscape) or **p ≥ 0.96** (portrait), whatever frame is drawn.
- **The surface quad always comes from the frame actually drawn.** Back-facing frames have a `null` quad. The surface is hidden until p ≥ 0.38.
- **Load order:** poster → still → push-end (K2 or P2) → sparse lid (every 4th) → fill lid → push. Under Save-Data or 2G/3G, only every fourth frame loads, and the sparse set always includes the still and the push end.
- **Static mode** (OS reduced motion, `[data-reduced-motion="true"]`, or `<noscript>`): not pinned; the still, then the hero in normal flow; the nav visible from first paint; no JS transforms. A decode failure **keeps** the pinned layout (poster and still).
- **Accessibility:**
  - `aria-hidden` goes only on decorative layers, never on the entrance container.
  - Skip link, Skip intro, and focus entering the hero while p < 1 → jump to p = 1 and focus the `h1`.
  - One `h1` on the page.
- **Budgets** (§9):
  - CLS < 0.02.
  - First-load JS ≤ 286 KB gzip (the baseline).
  - No frames before `load` except the poster or still.
  - Frames: ≤ 2.5 MB at the 1280 tier, ≤ 1.2 MB portrait. Preview frames are far below this.
- **Truth:** screen textures show only real repo content. A check (✓) appears only when that command exited 0 at the snapshot, and **tests** is not shown until a passing test runner exists at the snapshot. Every number is read from a file or from command output.
- **Commits:** end every message with the two attribution lines below. **Never push to main; no PR; no deploy.**

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016KFmgXUbfgxbHPoW46Pkr1
  ```

## Review Focus

1. **A jump past the entrance** (a nav link to `#work` from the top, or the End key): p goes past 1 before any push frame has loaded. Expected: the hero is at identity, the nav is visible, and there is no console error. Pinned in Task 10 (e2e).
2. **A resize mid-entrance** (window resize or device rotation at p ≈ 0.6). Expected: the surface re-maps to the new viewport's quad and the framing class updates, with no stale matrix. Pinned in Task 9 (unit test: the stage recomputes on resize) and Task 10 (e2e resize).
3. **Reduced motion toggled at runtime** from the in-app accessibility panel. Expected: static mode immediately, no transforms left on the hero, the nav visible. Pinned in Task 10 (e2e toggling `data-reduced-motion`).
4. **Manifest missing or 404.** Expected: the poster stays, Skip intro still reaches the hero at identity, and there is no uncaught error. Pinned in Task 10 (e2e with a routed 404).
5. **Scroll restored into the middle of the entrance** (reload or back navigation). Expected: the stage derives p from the current scroll on mount, and the drawn frame and quad agree. Pinned in Task 10 (e2e reload at 50%).

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Unit test runner, `@` alias, node environment |
| `playwright.config.ts` | e2e: starts `next start`; optional `PW_CHROMIUM` executable path |
| `lib/timeline.ts` | `clamp01`, eases, `segment`, `BEATS` |
| `lib/entrance/types.ts` | `Point`, `Quad`, `ManifestFrame`, `FrameSet`, `Manifest` |
| `lib/entrance/homography.ts` | `solveHomography`, `applyHomography`, `toMatrix3d` |
| `lib/entrance/surface.ts` | `coverFit`, `quadToViewport`, `circumscribed1610`, `surfaceTransform`, `containsRect` |
| `lib/entrance/frames.ts` | `resolveFrame`, `loadOrder`, `pickFramingKind`, `pickTier`, `lerpQuad` |
| `lib/entrance/manifest.ts` | `validateManifest` |
| `lib/entrance/FrameStore.ts` | Prioritised fetch and decode window with injected I/O |
| `lib/entrance/FramePlayer.ts` | Canvas cover-fit draw, cross-fade, returns the drawn quad |
| `components/entrance/Entrance.tsx` | Server: container, sticky stage, poster/still `<picture>`, decorative layers, surface host |
| `components/entrance/EntranceStage.tsx` | Client: progress → frame, surface, overlays; Skip intro; focus handling; `entrance:progress` events |
| `components/entrance/entrance.css` | Pinned and static modes, layers (imported by `Entrance.tsx`) |
| `components/sections/Hero.tsx` | Rewritten hero: the screen surface's content |
| `components/layout/Navbar.tsx` | Modified: hidden until the entrance completes; `:focus-within` |
| `app/page.tsx` | Modified: `<Entrance><Hero/></Entrance>` replaces `IntroSequence` + `Hero` |
| `app/globals.css`, `lib/tokens.ts` | New token values; `--screen`, `--accent-solid`; violet retired |
| `data/socials.ts`, `data/skills.ts`, `data/projects.ts`, `app/opengraph-image.tsx` | Headline, heroLead and the §2 corrections |
| `design/render/blender/camera_path.py` | Pure-Python camera and lid keyframes, interpolation, back-face test (no bpy) |
| `design/render/blender/test_camera_path.py` | `unittest` for `camera_path.py` |
| `design/render/blender/scene.py` | Production scene, adapted from `preview/scene.py` into `build_scene(shot_state)` |
| `design/render/blender/render.py` | Renders a sequence for a framing and quality; writes PNG plus sidecar JSON with the quad |
| `design/render/blender/make_screens.py` | Screen textures from real repo output (adapted from `preview/textures.py`), fails on unsourced numbers |
| `scripts/encode-frames.mjs` | PNG masters → AVIF tiers, poster/still AVIF+JPEG, `public/entrance/manifest.json` |
| `tests/unit/*.test.ts` | Vitest suites |
| `tests/e2e/entrance.spec.ts` | Playwright suite |

---

### Task 1: Test foundation (Vitest + Playwright + scripts)

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (scripts, devDependencies), `.gitignore` (`/test-results`, `/playwright-report`)

**Interfaces:**
- Produces: `npm run typecheck`, `npm test`, `npm run test:e2e`; the `@/` alias inside tests.

- [ ] **Step 1: Install the dev dependencies**

```bash
npm install -D vitest@^5.0.2 sharp@^0.34.5
```

- [ ] **Step 2: Add the scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "render:screens": "python3 design/render/blender/make_screens.py",
  "render:preview": "bpyenv/bin/python design/render/blender/render.py --quality preview --framing all",
  "encode:frames": "node scripts/encode-frames.mjs"
}
```

The `render:*` scripts expect the dev-only venv at `./bpyenv` (README, Task 6). Add `/bpyenv` to `.gitignore`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "playwright/test";

const executablePath = process.env.PW_CHROMIUM || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3400", launchOptions: { executablePath } },
  webServer: {
    command: "npx next start --port 3400",
    url: "http://localhost:3400",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
```

- [ ] **Step 5: Write the smoke tests**

`tests/unit/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";

describe("toolchain", () => {
  it("resolves the @ alias", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
```

`tests/e2e/smoke.spec.ts`:
```ts
import { test, expect } from "playwright/test";

test("home renders exactly one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});
```

- [ ] **Step 6: Run everything**

Run: `npm run typecheck && npm test && npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e`
Expected: all pass. In this container Playwright uses the preinstalled Chromium via `PW_CHROMIUM`. Locally, `npx playwright install chromium` is enough.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests .gitignore
git commit -m "Add the test foundation: Vitest, Playwright, typecheck script"
```

---

### Task 2: `lib/timeline.ts`

**Files:**
- Create: `lib/timeline.ts`
- Test: `tests/unit/timeline.test.ts`

**Interfaces:**
- Produces: `clamp01(x: number): number`; `linear`, `easeOut`, `easeInOut: Ease` where `type Ease = (t: number) => number`; `segment(p: number, start: number, end: number, ease?: Ease): number`; `BEATS` as below.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { clamp01, segment, easeInOut, easeOut, BEATS } from "@/lib/timeline";

describe("segment", () => {
  it("is 0 before, 1 after, and linear inside", () => {
    expect(segment(0.05, 0.1, 0.2)).toBe(0);
    expect(segment(0.25, 0.1, 0.2)).toBe(1);
    expect(segment(0.15, 0.1, 0.2)).toBeCloseTo(0.5);
  });
  it("never produces a V on a flat hold (the August useTransform bug)", () => {
    const xs = Array.from({ length: 101 }, (_, i) => segment(i / 100, 0.16, 0.46));
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1]);
  });
  it("rejects empty or inverted ranges", () => {
    expect(() => segment(0.5, 0.4, 0.4)).toThrow(RangeError);
  });
  it("eases stay within 0..1 and hit the endpoints", () => {
    for (const e of [easeInOut, easeOut]) {
      expect(e(0)).toBe(0);
      expect(e(1)).toBe(1);
      expect(e(0.5)).toBeGreaterThan(0);
    }
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
  it("beats match the spec", () => {
    expect(BEATS.lid).toEqual([0.12, 0.38]);
    expect(BEATS.push).toEqual([0.68, 0.88]);
    expect(BEATS.portal).toEqual([0.88, 1]);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/unit/timeline.test.ts`
Expected: FAIL, "Cannot find module '@/lib/timeline'".

- [ ] **Step 3: Implement**

```ts
/** Scroll-timeline maths. Every beat is an explicit, clamped segment, never a
 *  multi-stop useTransform range (those interpolated into a V in August). */
export type Ease = (t: number) => number;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const linear: Ease = (t) => t;
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function segment(p: number, start: number, end: number, ease: Ease = linear): number {
  if (!(end > start)) throw new RangeError(`segment: empty range [${start}, ${end}]`);
  return ease(clamp01((p - start) / (end - start)));
}

export const BEATS = {
  lift: [0, 0.12],
  titleOut: [0.12, 0.17],
  lid: [0.12, 0.38],
  wake: [0.38, 0.53],
  identity: [0.53, 0.68],
  push: [0.68, 0.88],
  portal: [0.88, 1],
  portraitOpen: [0.88, 0.96],
  navIn: [0.96, 1],
} as const satisfies Record<string, readonly [number, number]>;
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run tests/unit/timeline.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/timeline.ts tests/unit/timeline.test.ts
git commit -m "Add the entrance timeline: explicit clamped segments and the spec's beats"
```

---

### Task 3: Homography and surface geometry

**Files:**
- Create: `lib/entrance/types.ts`, `lib/entrance/homography.ts`, `lib/entrance/surface.ts`
- Test: `tests/unit/homography.test.ts`, `tests/unit/surface.test.ts`

**Interfaces:**
- Produces:
  - `types.ts`: `type Point = { x: number; y: number }`; `type Quad = [Point, Point, Point, Point]` (TL, TR, BR, BL).
  - `solveHomography(src: Quad, dst: Quad): number[]` (9 values, row-major, h[8] = 1); `applyHomography(h: number[], p: Point): Point`; `toMatrix3d(h: number[]): string`.
  - `coverFit(frameW, frameH, vw, vh, zoom = 1): { scale: number; dx: number; dy: number }`; `quadToViewport(q: Quad, frameW, frameH, fit): Quad`; `circumscribed1610(vw, vh): { x: number; y: number; w: number; h: number }`; `containsRect(q: Quad, w: number, h: number): boolean`.
  - `surfaceTransform(args: { kind: "landscape" | "portrait"; quad: Quad; vw: number; vh: number; toIdentity: number }): { matrix: string; clip: string; box: { x: number; y: number; w: number; h: number } }`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/homography.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { solveHomography, applyHomography, toMatrix3d } from "@/lib/entrance/homography";
import type { Quad } from "@/lib/entrance/types";

const rect = (w: number, h: number): Quad => [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];

describe("homography", () => {
  it("maps all four corners exactly", () => {
    const dst: Quad = [{ x: 310, y: 120 }, { x: 905, y: 140 }, { x: 880, y: 470 }, { x: 330, y: 452 }];
    const h = solveHomography(rect(1440, 900), dst);
    rect(1440, 900).forEach((p, i) => {
      const q = applyHomography(h, p);
      expect(q.x).toBeCloseTo(dst[i].x, 6);
      expect(q.y).toBeCloseTo(dst[i].y, 6);
    });
  });
  it("is the identity when src equals dst", () => {
    const h = solveHomography(rect(100, 50), rect(100, 50));
    expect(h.map((v) => Math.round(v * 1e9) / 1e9)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(toMatrix3d(h)).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
  });
  it("throws on a degenerate quad", () => {
    const flat: Quad = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }];
    expect(() => solveHomography(rect(10, 10), flat)).toThrow();
  });
});
```

`tests/unit/surface.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { coverFit, circumscribed1610, surfaceTransform, containsRect } from "@/lib/entrance/surface";
import type { Quad } from "@/lib/entrance/types";

const vpQuad = (x: number, y: number, w: number, h: number): Quad =>
  [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
const scaleOf = (m: string) => Number(m.slice(9, -1).split(",")[0]);

describe("coverFit", () => {
  it("covers a 16:10 viewport with a 16:9 frame, centred", () => {
    const f = coverFit(1920, 1080, 1440, 900);
    expect(f.scale).toBeCloseTo(900 / 1080);
    expect(f.dy).toBeCloseTo(0);
    expect(f.dx).toBeCloseTo((1440 - 1920 * f.scale) / 2);
  });
});

describe("circumscribed1610", () => {
  it.each([[1440, 900], [1920, 1080], [2560, 1097], [1000, 1000], [900, 1000]])(
    "contains the %ix%i viewport and is 16:10", (vw, vh) => {
      const r = circumscribed1610(vw, vh);
      expect(r.w / r.h).toBeCloseTo(1.6, 6);
      expect(r.w).toBeGreaterThanOrEqual(vw - 1e-9);
      expect(r.h).toBeGreaterThanOrEqual(vh - 1e-9);
    });
});

describe("surfaceTransform: landscape hand-off has no bounce", () => {
  it.each([0.9, 1.6, 1.78, 2.33])("content scale is monotonic through the hand-off at aspect %f", (aspect) => {
    const vh = 900, vw = Math.round(vh * aspect);
    const r = circumscribed1610(vw, vh);
    // The rendered quad grows from 60% to 104% of the circumscribed rect (the late push).
    const scales = [0.6, 0.8, 0.95, 1.0, 1.02, 1.04].map((k, i, arr) => {
      const w = r.w * k, h = r.h * k;
      const q = vpQuad(vw / 2 - w / 2, vh / 2 - h / 2, w, h);
      const toIdentity = containsRect(q, vw, vh) ? i / (arr.length - 1) : 0;
      return scaleOf(surfaceTransform({ kind: "landscape", quad: q, vw, vh, toIdentity }).matrix);
    });
    for (let i = 1; i < scales.length; i++) expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1] - 0.045);
    expect(scales.at(-1)).toBeCloseTo(1, 1);
  });
  it("is exactly the identity mapping of the circumscribed box at toIdentity = 1", () => {
    const t = surfaceTransform({ kind: "landscape", quad: vpQuad(100, 100, 300, 187.5), vw: 1920, vh: 1080, toIdentity: 1 });
    expect(t.matrix).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
    expect(t.clip).toBe("none");
  });
});

describe("surfaceTransform: portrait band", () => {
  it("clips to a centred band that opens to full at toIdentity = 1", () => {
    const q = vpQuad(0, 300, 390, 243.75);
    const a = surfaceTransform({ kind: "portrait", quad: q, vw: 390, vh: 844, toIdentity: 0 });
    const b = surfaceTransform({ kind: "portrait", quad: q, vw: 390, vh: 844, toIdentity: 1 });
    expect(a.clip).toMatch(/^inset\(/);
    expect(b.clip).toBe("none");
    expect(b.matrix).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
  });
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run tests/unit/homography.test.ts tests/unit/surface.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `types.ts` and `homography.ts`**

```ts
// lib/entrance/types.ts
export type Point = { x: number; y: number };
/** TL, TR, BR, BL. */
export type Quad = [Point, Point, Point, Point];

export type ManifestFrame = { file: string; p: number; quad: Quad | null };
export type FrameSet = {
  width: number;               // master width
  height: number;
  tiers: number[];             // encoded widths available, ascending
  frames: ManifestFrame[];     // sorted by p; quads in 0..1 image space
  poster: string;              // base name; .avif and .jpg exist
  still: string;
  pushEndIndex: number;        // index of K2 / P2 in frames
};
export type Manifest = { version: 1; snapshot: string; landscape: FrameSet; portrait: FrameSet };
```

```ts
// lib/entrance/homography.ts
import type { Point, Quad } from "./types";

/** Solve H (3x3, h33 = 1) with dst ~ H·src, by Gaussian elimination on the 8x8 system. */
export function solveHomography(src: Quad, dst: Quad): number[] {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {
    let piv = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    if (Math.abs(A[piv][c]) < 1e-12) throw new Error("solveHomography: degenerate quad");
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  const h = A.map((row, i) => row[8] / row[i]);
  return [...h, 1];
}

export function applyHomography(h: number[], p: Point): Point {
  const w = h[6] * p.x + h[7] * p.y + h[8];
  return { x: (h[0] * p.x + h[1] * p.y + h[2]) / w, y: (h[3] * p.x + h[4] * p.y + h[5]) / w };
}

/** CSS matrix3d is column-major; requires transform-origin: 0 0. */
export function toMatrix3d(h: number[]): string {
  const r = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Number(v.toPrecision(12)));
  const m = [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, h[8]].map(r);
  return `matrix3d(${m.join(",")})`;
}
```

- [ ] **Step 4: Implement `surface.ts`**

```ts
import type { Quad } from "./types";
import { solveHomography, toMatrix3d } from "./homography";

export type Fit = { scale: number; dx: number; dy: number };

export function coverFit(frameW: number, frameH: number, vw: number, vh: number, zoom = 1): Fit {
  const scale = Math.max(vw / frameW, vh / frameH) * zoom;
  return { scale, dx: (vw - frameW * scale) / 2, dy: (vh - frameH * scale) / 2 };
}

/** Quad in 0..1 image space → viewport px. */
export function quadToViewport(q: Quad, frameW: number, frameH: number, fit: Fit): Quad {
  return q.map((p) => ({ x: p.x * frameW * fit.scale + fit.dx, y: p.y * frameH * fit.scale + fit.dy })) as Quad;
}

/** The 16:10 rectangle that circumscribes the viewport, centred on it (§4.3). */
export function circumscribed1610(vw: number, vh: number) {
  const w = vw / vh >= 1.6 ? vw : vh * 1.6;
  const h = w / 1.6;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

/** True when the quad covers the whole w×h viewport (convex quad test). */
export function containsRect(q: Quad, w: number, h: number): boolean {
  const pts = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
  return pts.every((p) =>
    q.every((a, i) => {
      const b = q[(i + 1) % 4];
      return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-6;
    }),
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpQ = (a: Quad, b: Quad, t: number) =>
  a.map((p, i) => ({ x: lerp(p.x, b[i].x, t), y: lerp(p.y, b[i].y, t) })) as Quad;
const rectQ = (x: number, y: number, w: number, h: number): Quad =>
  [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

/**
 * Landscape: the surface box is the circumscribed 16:10 rect (bands are --screen),
 * mapped onto the quad, then eased to identity. Portrait: the box is the viewport;
 * its centred 16:10 band maps onto the quad and the clip opens to full.
 * `toIdentity` is 0..1. Returned `box` is where the element sits before transform.
 */
export function surfaceTransform(a: { kind: "landscape" | "portrait"; quad: Quad; vw: number; vh: number; toIdentity: number }) {
  const t = Math.min(1, Math.max(0, a.toIdentity));
  if (a.kind === "landscape") {
    // The element is laid out at (box.x, box.y) with size box.w × box.h (set once per
    // viewport by EntranceStage); the matrix is relative to that position, so t = 1 is
    // exactly the identity.
    const box = circumscribed1610(a.vw, a.vh);
    const local = rectQ(0, 0, box.w, box.h);
    const target = lerpQ(a.quad, rectQ(box.x, box.y, box.w, box.h), t);
    const targetLocal = target.map((p) => ({ x: p.x - box.x, y: p.y - box.y })) as Quad;
    const matrix = t === 1 ? toMatrix3d([1, 0, 0, 0, 1, 0, 0, 0, 1]) : toMatrix3d(solveHomography(local, targetLocal));
    return { matrix, clip: "none", box };
  }
  const bandH = a.vw / 1.6;
  const bandY = (a.vh - bandH) / 2;
  const band = rectQ(0, bandY, a.vw, bandH);
  const hBand = solveHomography(band, a.quad);
  const full = rectQ(0, 0, a.vw, a.vh);
  const mappedFull = full.map((p) => {
    const w = hBand[6] * p.x + hBand[7] * p.y + hBand[8];
    return { x: (hBand[0] * p.x + hBand[1] * p.y + hBand[2]) / w, y: (hBand[3] * p.x + hBand[4] * p.y + hBand[5]) / w };
  }) as Quad;
  const target = lerpQ(mappedFull, full, t);
  const matrix = t === 1 ? toMatrix3d([1, 0, 0, 0, 1, 0, 0, 0, 1]) : toMatrix3d(solveHomography(full, target));
  const inset = bandY * (1 - t);
  const clip = t === 1 ? "none" : `inset(${inset.toFixed(2)}px 0px ${inset.toFixed(2)}px 0px)`;
  return { matrix, clip, box: { x: 0, y: 0, w: a.vw, h: a.vh } };
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npx vitest run tests/unit/homography.test.ts tests/unit/surface.test.ts`
Expected: PASS. If the monotonic-scale test fails for an aspect, fix the geometry, never the tolerance.

- [ ] **Step 6: Commit**

```bash
git add lib/entrance tests/unit/homography.test.ts tests/unit/surface.test.ts
git commit -m "Add the screen-surface geometry: homography, cover fit, bounce-free hand-off"
```

---

### Task 4: Frame resolution, load order, framing and tier choice

**Files:**
- Create: `lib/entrance/frames.ts`
- Test: `tests/unit/frames.test.ts`

**Interfaces:**
- Consumes: `ManifestFrame`, `Quad` (Task 3).
- Produces:
  - `resolveFrame(p: number, frames: { p: number }[]): { a: number; b: number; w: number }`
  - `loadOrder(n: number, o: { stillIndex: number; pushEndIndex: number; lidEnd: number; saveData: boolean }): number[]`
  - `pickFramingKind(vw: number, vh: number): { kind: "landscape" | "portrait"; containerSvh: 400 | 260 }`
  - `pickTier(tiers: number[], vw: number, dpr: number, saveData: boolean): number`
  - `lerpQuad(a: Quad | null, b: Quad | null, w: number): Quad | null`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { resolveFrame, loadOrder, pickFramingKind, pickTier, lerpQuad } from "@/lib/entrance/frames";

const frames = [{ p: 0.12 }, { p: 0.2 }, { p: 0.38 }, { p: 0.53 }, { p: 0.68 }, { p: 0.88 }];

describe("resolveFrame", () => {
  it("holds the first frame before it and the last after", () => {
    expect(resolveFrame(0, frames)).toEqual({ a: 0, b: 0, w: 0 });
    expect(resolveFrame(1, frames)).toEqual({ a: 5, b: 5, w: 0 });
  });
  it("interpolates between neighbours", () => {
    const r = resolveFrame(0.16, frames);
    expect(r.a).toBe(0); expect(r.b).toBe(1); expect(r.w).toBeCloseTo(0.5);
  });
});

describe("loadOrder", () => {
  it("is poster, still, push end, then sparse lid, fill, push; every index exactly once", () => {
    const o = loadOrder(40, { stillIndex: 36, pushEndIndex: 39, lidEnd: 35, saveData: false });
    expect(o.slice(0, 3)).toEqual([0, 36, 39]);
    expect(new Set(o).size).toBe(40);
    expect(o.indexOf(4)).toBeLessThan(o.indexOf(1));      // sparse before fill
    expect(o.indexOf(35)).toBeLessThan(o.indexOf(37));    // lid before push
  });
  it("Save-Data keeps every 4th frame plus still and push end", () => {
    const o = loadOrder(40, { stillIndex: 36, pushEndIndex: 39, lidEnd: 35, saveData: true });
    expect(o).toContain(36); expect(o).toContain(39);
    expect(o.length).toBeLessThan(15);
  });
});

describe("pickFramingKind", () => {
  it.each([
    [1440, 900, "landscape", 400], [390, 844, "portrait", 260], [768, 1024, "portrait", 260],
    [844, 390, "landscape", 260], [1024, 768, "landscape", 400],
  ])("%ix%i → %s %i", (w, h, kind, svh) => {
    expect(pickFramingKind(w, h)).toEqual({ kind, containerSvh: svh });
  });
});

describe("pickTier", () => {
  it("never upscales past what exists and honours Save-Data", () => {
    expect(pickTier([960], 1440, 2, false)).toBe(960);
    expect(pickTier([1280, 1920], 1440, 2, false)).toBe(1920);
    expect(pickTier([1280, 1920], 1440, 1, false)).toBe(1280);
    expect(pickTier([1280, 1920], 1440, 2, true)).toBe(1280);
  });
});

describe("lerpQuad", () => {
  it("is null when either side is null (back-facing)", () => {
    const q = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }] as const;
    expect(lerpQuad(null, [...q] as never, 0.5)).toBeNull();
    expect(lerpQuad([...q] as never, [...q] as never, 0.5)?.[2]).toEqual({ x: 1, y: 1 });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.** `npx vitest run tests/unit/frames.test.ts`: FAIL.

- [ ] **Step 3: Implement**

```ts
import type { Quad } from "./types";

export function resolveFrame(p: number, frames: { p: number }[]) {
  const n = frames.length;
  if (p <= frames[0].p) return { a: 0, b: 0, w: 0 };
  if (p >= frames[n - 1].p) return { a: n - 1, b: n - 1, w: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].p <= p) lo = mid; else hi = mid; }
  return { a: lo, b: hi, w: (p - frames[lo].p) / (frames[hi].p - frames[lo].p) };
}

export function loadOrder(n: number, o: { stillIndex: number; pushEndIndex: number; lidEnd: number; saveData: boolean }): number[] {
  const out: number[] = [];
  const push = (i: number) => { if (i >= 0 && i < n && !out.includes(i)) out.push(i); };
  push(0); push(o.stillIndex); push(o.pushEndIndex);
  for (let i = 0; i <= o.lidEnd; i += 4) push(i);
  for (let i = o.lidEnd + 1; i < n; i += 4) push(i);
  if (o.saveData) return out;
  for (let i = 0; i <= o.lidEnd; i++) push(i);
  for (let i = o.lidEnd + 1; i < n; i++) push(i);
  return out;
}

export function pickFramingKind(vw: number, vh: number) {
  if (vw / vh < 0.9) return { kind: "portrait" as const, containerSvh: 260 as const };
  return { kind: "landscape" as const, containerSvh: (vh < 500 ? 260 : 400) as 260 | 400 };
}

export function pickTier(tiers: number[], vw: number, dpr: number, saveData: boolean): number {
  const sorted = [...tiers].sort((a, b) => a - b);
  if (saveData) return sorted[0];
  const want = dpr >= 1.5 && vw >= 1280 ? Infinity : Math.min(vw * Math.min(dpr, 2), 1280);
  const fit = sorted.filter((t) => t <= want);
  return fit.length ? fit[fit.length - 1] : sorted[0];
}

export function lerpQuad(a: Quad | null, b: Quad | null, w: number): Quad | null {
  if (!a || !b) return null;
  return a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * w, y: p.y + (b[i].y - p.y) * w })) as Quad;
}
```

- [ ] **Step 4: Run it and confirm it passes.** Expected: PASS.

- [ ] **Step 5: Commit** with the message "Add frame resolution, load order, framing and tier selection".

---

### Task 5: Manifest validation

**Files:**
- Create: `lib/entrance/manifest.ts`
- Test: `tests/unit/manifest.test.ts` (also validates the committed `public/entrance/manifest.json` once it exists: `it.skipIf(!exists)`)

**Interfaces:**
- Consumes: `Manifest`, `FrameSet` (Task 3).
- Produces: `validateManifest(m: Manifest): string[]` (an empty array means valid).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { validateManifest } from "@/lib/entrance/manifest";
import type { FrameSet, Manifest } from "@/lib/entrance/types";

const q = (x0: number, y0: number, x1: number, y1: number) =>
  [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }] as FrameSet["frames"][0]["quad"];
const set = (over: Partial<FrameSet> = {}): FrameSet => ({
  width: 960, height: 540, tiers: [960], poster: "poster", still: "still", pushEndIndex: 3,
  frames: [
    { file: "lid-00", p: 0.12, quad: null },
    { file: "lid-35", p: 0.38, quad: q(0.3, 0.2, 0.7, 0.6) },
    { file: "k1-on", p: 0.53, quad: q(0.3, 0.2, 0.7, 0.6) },
    { file: "push-27", p: 0.88, quad: q(-0.02, -0.1, 1.02, 1.1) },
  ],
  ...over,
});
const man = (l = set(), p = set()): Manifest => ({ version: 1, snapshot: "abc1234", landscape: l, portrait: p });

describe("validateManifest", () => {
  it("accepts a well-formed manifest", () => expect(validateManifest(man())).toEqual([]));
  it("rejects non-monotonic p", () => {
    const s = set(); s.frames[2].p = 0.2;
    expect(validateManifest(man(s)).join()).toMatch(/monotonic/);
  });
  it("rejects a self-intersecting quad", () => {
    const s = set(); s.frames[1].quad = [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.6 }, { x: 0.7, y: 0.2 }, { x: 0.3, y: 0.6 }];
    expect(validateManifest(man(s)).join()).toMatch(/convex/);
  });
  it("requires the landscape push end to contain the whole frame", () => {
    const s = set(); s.frames[3].quad = q(0.1, 0.1, 0.9, 0.9);
    expect(validateManifest(man(s)).join()).toMatch(/push end/);
  });
  it("requires the portrait push end to span the full width with ≥3% overscan", () => {
    const p = set(); p.frames[3].quad = q(-0.02, 0.3, 1.02, 0.5);
    expect(validateManifest(man(set(), p))).toEqual([]);
  });
  const real = "public/entrance/manifest.json";
  it.skipIf(!fs.existsSync(real))("the committed manifest is valid and every file exists", () => {
    const m = JSON.parse(fs.readFileSync(real, "utf8")) as Manifest;
    expect(validateManifest(m)).toEqual([]);
    for (const k of ["landscape", "portrait"] as const)
      for (const f of m[k].frames) expect(fs.existsSync(`public/entrance/${k}/${m[k].tiers[0]}/${f.file}.avif`)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.**

- [ ] **Step 3: Implement**

```ts
import type { FrameSet, Manifest, Quad } from "./types";

const cross = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

function convexCW(q: Quad): boolean {
  const s = q.map((_, i) => cross(q[i], q[(i + 1) % 4], q[(i + 2) % 4]));
  return s.every((v) => v > 0) || s.every((v) => v < 0);
}

function checkSet(kind: "landscape" | "portrait", s: FrameSet, errs: string[]) {
  const e = (m: string) => errs.push(`${kind}: ${m}`);
  if (!s.frames.length) e("no frames");
  for (let i = 1; i < s.frames.length; i++) if (!(s.frames[i].p > s.frames[i - 1].p)) e(`p not monotonic at ${i}`);
  s.frames.forEach((f, i) => {
    if (!f.quad) return;
    if (!f.quad.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) e(`non-finite quad at ${i}`);
    else if (!convexCW(f.quad)) e(`quad not convex/consistently wound at ${i}`);
    else if (f.p < 0.68 && !f.quad.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)) e(`pre-push quad outside [0,1] at ${i}`);
  });
  const end = s.frames[s.pushEndIndex]?.quad;
  if (!end) e("push end has no quad");
  else {
    const xs = end.map((p) => p.x), ys = end.map((p) => p.y);
    const spansW = Math.min(...xs) <= -0.015 && Math.max(...xs) >= 1.015;
    if (kind === "landscape" && !(spansW && Math.min(...ys) <= 0 && Math.max(...ys) >= 1)) e("push end must contain the whole frame");
    if (kind === "portrait" && !spansW) e("push end must span the full width with ≥3% overscan");
  }
  if (!s.tiers.length) e("no tiers");
}

export function validateManifest(m: Manifest): string[] {
  const errs: string[] = [];
  if (m.version !== 1) errs.push("unknown version");
  if (!/^[0-9a-f]{7,}$/.test(m.snapshot)) errs.push("snapshot must be a git hash");
  checkSet("landscape", m.landscape, errs);
  checkSet("portrait", m.portrait, errs);
  return errs;
}
```

- [ ] **Step 4: Run it and confirm it passes.**

- [ ] **Step 5: Commit** with the message "Add manifest validation (convex quads, monotonic p, push-end coverage)".

---

### Task 6: Render pipeline C1: camera path, production scene, screens, preview frames

**Files:**
- Create: `design/render/blender/camera_path.py`, `design/render/blender/test_camera_path.py`, `design/render/blender/scene.py`, `design/render/blender/render.py`, `design/render/blender/make_screens.py`, `design/render/blender/README.md`, `scripts/encode-frames.mjs`
- Keep: `design/render/blender/preview/` (the approved preview scene; source of truth for look until Plan 2's look-dev)
- Generated and committed: `public/entrance/**` (preview AVIF tiers, poster/still AVIF+JPEG, `manifest.json`)

**Interfaces:**
- Consumes: the spec's camera keys (from the approved preview scene), `Manifest` shape (Task 3), `validateManifest` (Task 5).
- Produces: `public/entrance/manifest.json` matching `Manifest`; the files `public/entrance/{landscape,portrait}/<tier>/<name>.avif`, `public/entrance/poster-<kind>.{avif,jpg}` and `still-<kind>.{avif,jpg}`.

- [ ] **Step 1: Set up the dev venv (documented in the README)**

```bash
python3.11 -m venv bpyenv && bpyenv/bin/pip install bpy==5.0.1
```

`design/render/blender/README.md` states: Python 3.11 is required by the wheel; `bpyenv/` is gitignored; `make_screens.py` runs on the system Python 3 with Pillow (`pip install pillow`); the order is `npm run render:screens`, then `npm run render:preview`, then `npm run encode:frames`; renders land in `design/render/blender/out/` (gitignored).

- [ ] **Step 2: Write the failing Python test for the camera path**

`design/render/blender/test_camera_path.py`:
```python
import math
import unittest

from camera_path import LANDSCAPE, PORTRAIT, frame_state, screen_faces_camera, SEQUENCE


class CameraPath(unittest.TestCase):
    def test_sequence_counts_match_spec(self):
        self.assertEqual(len([s for s in SEQUENCE["landscape"] if s["shot"] == "lid"]), 36)
        self.assertEqual(len([s for s in SEQUENCE["landscape"] if s["shot"] == "push"]), 28)
        self.assertEqual(len([s for s in SEQUENCE["portrait"] if s["shot"] == "lid"]), 16)
        self.assertEqual(len([s for s in SEQUENCE["portrait"] if s["shot"] == "push"]), 12)

    def test_p_is_strictly_increasing(self):
        for kind in ("landscape", "portrait"):
            ps = [s["p"] for s in SEQUENCE[kind]]
            self.assertTrue(all(b > a for a, b in zip(ps, ps[1:])), kind)

    def test_lid_holds_camera_for_the_crack_then_opens_to_108(self):
        lid = [s for s in SEQUENCE["landscape"] if s["shot"] == "lid"]
        k0 = frame_state(lid[0], LANDSCAPE)
        self.assertEqual(frame_state(lid[4], LANDSCAPE)["cam"], k0["cam"])
        self.assertAlmostEqual(frame_state(lid[-1], LANDSCAPE)["lid_deg"], 108.0)
        self.assertEqual(frame_state(lid[0], LANDSCAPE)["lid_deg"], 0.0)

    def test_push_ends_on_the_screen_normal(self):
        end = frame_state(SEQUENCE["landscape"][-1], LANDSCAPE)
        (cx, cy, cz), (tx, ty, tz) = end["cam"], end["target"]
        n = (0, -math.sin(math.radians(108)), -math.cos(math.radians(108)))
        d = math.dist((cx, cy, cz), (tx, ty, tz))
        dirv = ((cx - tx) / d, (cy - ty) / d, (cz - tz) / d)
        self.assertGreater(sum(a * b for a, b in zip(dirv, n)), 0.9999)

    def test_back_facing_detection(self):
        self.assertFalse(screen_faces_camera(lid_deg=0, cam=(0, -1, 0.5)))
        self.assertTrue(screen_faces_camera(lid_deg=108, cam=(0, -1, 0.5)))


if __name__ == "__main__":
    unittest.main()
```

Run: `cd design/render/blender && python3 -m unittest test_camera_path -v`
Expected: FAIL (`ModuleNotFoundError: camera_path`).

- [ ] **Step 3: Implement `camera_path.py` (pure Python; no bpy)**

```python
"""Camera and lid keyframes for the entrance, and their interpolation.

Pure Python (no bpy) so it is unit-tested with the system interpreter. Keys
are the approved preview key frames (spec §4.6; design/render/blender/preview).
"""
import math

SCREEN_CENTRE = (0.0, 0.181, 0.150)          # open lid (108°), world metres
NORMAL = (0.0, -math.sin(math.radians(108)), -math.cos(math.radians(108)))


def _on_normal(d, dz=0.0, dx=0.0):
    """A point d metres out along the open screen's normal, optionally offset."""
    cx, cy, cz = SCREEN_CENTRE
    nx, ny, nz = NORMAL
    return (cx + nx * d + dx, cy + ny * d, cz + nz * d + dz)


LANDSCAPE = {
    "K0": {"cam": (-0.34, -0.70, 0.38), "target": (0.07, 0.36, 0.17), "lens": 25, "fstop": 4.0, "focus": (0.0, -0.05, 0.02)},
    "K1": {"cam": (-0.22, -0.70, 0.34), "target": (0.04, 0.26, 0.15), "lens": 30, "fstop": 3.2, "focus": SCREEN_CENTRE},
    "K2": {"cam": _on_normal(0.88, dz=-0.07, dx=0.06), "target": (0.0, 0.181, 0.115), "lens": 50, "fstop": 2.0, "focus": SCREEN_CENTRE},
    "END": {"cam": _on_normal(0.53), "target": SCREEN_CENTRE, "lens": 50, "fstop": 2.0, "focus": SCREEN_CENTRE},
}
PORTRAIT = {
    "K0": {"cam": (0.0, -1.30, 0.46), "target": (0.02, 0.30, 0.22), "lens": 32, "fstop": 3.5, "focus": (0.0, -0.05, 0.02)},
    "K1": {"cam": (0.0, -0.80, 0.33), "target": (0.0, 0.20, 0.15), "lens": 38, "fstop": 3.2, "focus": SCREEN_CENTRE},
    "K2": {"cam": _on_normal(1.0), "target": SCREEN_CENTRE, "lens": 40, "fstop": 2.0, "focus": SCREEN_CENTRE},
    "END": {"cam": _on_normal(0.76), "target": SCREEN_CENTRE, "lens": 40, "fstop": 2.0, "focus": SCREEN_CENTRE},
}


def _ease_in_out(t):
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def _build(kind, n_lid, n_push, crack_hold):
    seq = []
    for i in range(n_lid):
        seq.append({"shot": "lid", "name": f"lid-{i:02d}", "i": i, "n": n_lid, "hold": crack_hold,
                    "p": 0.12 + 0.26 * i / (n_lid - 1)})
    seq.append({"shot": "wake", "name": "k1-on", "p": 0.53})
    for j in range(n_push):
        seq.append({"shot": "push", "name": f"push-{j:02d}", "j": j, "n": n_push, "p": 0.68 + 0.20 * j / (n_push - 1)})
    return seq


SEQUENCE = {"landscape": _build("landscape", 36, 28, 5), "portrait": _build("portrait", 16, 12, 3)}


def _lerp(a, b, t):
    if isinstance(a, tuple):
        return tuple(x + (y - x) * t for x, y in zip(a, b))
    return a + (b - a) * t


def _mix(k_a, k_b, t):
    return {k: _lerp(k_a[k], k_b[k], t) for k in k_a}


def frame_state(step, keys):
    """-> {cam, target, lens, fstop, focus, lid_deg, screen_on}."""
    if step["shot"] == "lid":
        i, n, hold = step["i"], step["n"], step["hold"]
        if i < hold:
            cam, lid = dict(keys["K0"]), 15.0 * i / max(hold - 1, 1) if i else 0.0
        else:
            t = _ease_in_out((i - hold + 1) / (n - hold))
            cam, lid = _mix(keys["K0"], keys["K1"], t), 15.0 + (108.0 - 15.0) * t
        return {**cam, "lid_deg": round(lid, 6), "screen_on": False}
    if step["shot"] == "wake":
        return {**keys["K1"], "lid_deg": 108.0, "screen_on": True}
    j, n = step["j"], step["n"]
    split = round(n * 0.64)                       # K1 → K2 (hero), then K2 → END
    if j < split:
        cam = _mix(keys["K1"], keys["K2"], _ease_in_out(j / (split - 1)))
    else:
        t = (j - split + 1) / (n - split)
        cam = _mix(keys["K2"], keys["END"], 1 - (1 - t) ** 3)
    return {**cam, "lid_deg": 108.0, "screen_on": True}


def screen_faces_camera(lid_deg, cam):
    """True when the laptop screen's front face points at the camera."""
    a = math.radians(lid_deg)
    n = (0.0, -math.sin(a), -math.cos(a))
    hinge = (0.0, 0.1385, 0.019)
    v = tuple(c - h for c, h in zip(cam, hinge))
    return sum(x * y for x, y in zip(n, v)) > 0 and lid_deg > 1.0
```

Run the test again. Expected: PASS (5 tests).

- [ ] **Step 4: Create `scene.py` from the approved preview scene**

```bash
cp design/render/blender/preview/scene.py design/render/blender/scene.py
```

Then refactor it mechanically, with no look changes (look-dev is Plan 2):
1. Remove the argv parsing, the camera block and the render block.
2. Wrap everything else in `def build_scene(out_dir: str, lid_deg: float, screen_on: bool) -> dict:`. Replace `SHOT`/`OPEN`/`powered` with `lid_deg` and `screen_on`.
3. Return `{"scene": scene, "screen": ls, "hinge": hinge}`, where `ls` is the `lapscreen` object.
4. Keep the textures loading from `out_dir` (`HERE = out_dir`).

- [ ] **Step 5: Create `make_screens.py`** from `preview/textures.py`, adding snapshot provenance:
- At start, record `SNAP = git rev-parse --short HEAD`.
- Run `npx tsc --noEmit`, `npx eslint` and `npx next build`, capturing the exit codes and `build.txt` into `out/`.
- A check row is drawn **only** for commands that exited 0.
- A **tests** row is drawn only if `npm test` exits 0 *and* the repo has at least one test file (true once Task 1 lands; the row then reads the real Vitest pass).
- Assert each per-project count appears in `data/projects.ts` (as the preview does), and raise `SystemExit` on any number without a source.
- Write `out/strings.txt` (every string drawn) and `out/screens.json` (`{snapshot, checks: {name: exitCode}}`).

- [ ] **Step 6: Create `render.py`**

```python
"""Render an entrance frame set. usage:
  bpyenv/bin/python design/render/blender/render.py --quality preview|final --framing landscape|portrait|all
Writes out/<framing>/<name>.png and out/<framing>/<name>.json ({p, quad|null}).
"""
import argparse, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402  (must precede bmesh inside scene.py)
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Vector  # noqa: E402
from camera_path import LANDSCAPE, PORTRAIT, SEQUENCE, frame_state, screen_faces_camera  # noqa: E402
from scene import build_scene  # noqa: E402

QUALITY = {"preview": {"landscape": (960, 540), "portrait": (540, 960), "spp": 16},
           "final": {"landscape": (1920, 1080), "portrait": (1080, 1920), "spp": 64}}


def setup_camera(scene, st, portrait):
    cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd)
    scene.collection.objects.link(cam)
    cd.lens, cd.sensor_width = st["lens"], 36
    cd.sensor_fit = "VERTICAL" if portrait else "HORIZONTAL"
    if portrait: cd.sensor_height = 36
    cd.dof.use_dof, cd.dof.aperture_fstop, cd.dof.aperture_blades = True, st["fstop"], 0
    cam.location = st["cam"]
    cam.rotation_euler = (Vector(st["target"]) - Vector(st["cam"])).to_track_quat("-Z", "Y").to_euler()
    cd.dof.focus_distance = (Vector(st["focus"]) - Vector(st["cam"])).length
    scene.camera = cam
    return cam


def quad_of(scene, cam, screen):
    bpy.context.view_layer.update()
    mw = screen.matrix_world
    # mesh verts were built TR-first mirrored; order to TL, TR, BR, BL in image space
    pts = [world_to_camera_view(scene, cam, mw @ v.co) for v in screen.data.vertices]
    pts = [{"x": p.x, "y": 1 - p.y} for p in pts]
    pts.sort(key=lambda p: p["y"]); top, bot = sorted(pts[:2], key=lambda p: p["x"]), sorted(pts[2:], key=lambda p: p["x"])
    return [top[0], top[1], bot[1], bot[0]]


def render_set(kind, quality):
    keys = LANDSCAPE if kind == "landscape" else PORTRAIT
    w, h = QUALITY[quality][kind]; spp = QUALITY[quality]["spp"]
    out = os.path.join(HERE, "out", kind); os.makedirs(out, exist_ok=True)
    steps = SEQUENCE[kind] + [{"shot": "still", "name": "still", "p": -1}]
    for step in steps:
        st = frame_state({**step, "shot": "wake"} if step["shot"] == "still" else step, keys)
        bpy.ops.wm.read_factory_settings(use_empty=True)
        h_ = build_scene(os.path.join(HERE, "out") + "/", st["lid_deg"], st["screen_on"])
        scene = h_["scene"]; cam = setup_camera(scene, st, kind == "portrait")
        c = scene.cycles
        scene.render.engine, c.device, c.samples = "CYCLES", "CPU", spp
        c.use_denoising, c.denoiser, c.seed = True, "OPENIMAGEDENOISE", 7
        scene.render.resolution_x, scene.render.resolution_y = w, h
        scene.view_settings.view_transform = "AgX"
        scene.render.filepath = os.path.join(out, step["name"] + ".png")
        bpy.ops.render.render(write_still=True)
        faces = screen_faces_camera(st["lid_deg"], st["cam"])
        with open(os.path.join(out, step["name"] + ".json"), "w") as f:
            json.dump({"p": step["p"], "quad": quad_of(scene, cam, h_["screen"]) if faces else None}, f)
        print("rendered", kind, step["name"], flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--quality", default="preview"); ap.add_argument("--framing", default="all")
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    for kind in (["landscape", "portrait"] if a.framing == "all" else [a.framing]):
        render_set(kind, a.quality)
```

The `still` step renders the K1 framing with the identity proxy texture. Plan 2 replaces it with the identity-only still at final quality.

- [ ] **Step 7: Create `scripts/encode-frames.mjs`**

```js
// PNG masters (design/render/blender/out) → public/entrance AVIF tiers + manifest.json.
import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import sharp from "sharp";

const SRC = "design/render/blender/out";
const DST = "public/entrance";
const TIERS = { landscape: [1280, 1920], portrait: [720] };
const snapshot = JSON.parse(await fs.readFile(`${SRC}/screens.json`, "utf8")).snapshot
  ?? execSync("git rev-parse --short HEAD").toString().trim();

const manifest = { version: 1, snapshot };
for (const kind of ["landscape", "portrait"]) {
  const dir = `${SRC}/${kind}`;
  const names = (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  const meta = await Promise.all(names.map(async (n) => ({ n, ...JSON.parse(await fs.readFile(`${dir}/${n}.json`, "utf8")) })));
  const seq = meta.filter((m) => m.n !== "still").sort((a, b) => a.p - b.p);
  const { width, height } = await sharp(`${dir}/${seq[0].n}.png`).metadata();
  const tiers = TIERS[kind].filter((t) => t <= width);
  if (!tiers.length) tiers.push(width); // preview masters are smaller than every tier; never upscale
  for (const t of tiers) {
    await fs.mkdir(`${DST}/${kind}/${t}`, { recursive: true });
    for (const m of seq) await sharp(`${dir}/${m.n}.png`).resize(t).avif({ quality: 52, effort: 6, bitdepth: 10 }).toFile(`${DST}/${kind}/${t}/${m.n}.avif`);
  }
  for (const [name, src] of [["poster", seq[0].n], ["still", "still"]]) {
    await sharp(`${dir}/${src}.png`).resize(tiers[0]).avif({ quality: 55 }).toFile(`${DST}/${name}-${kind}.avif`);
    await sharp(`${dir}/${src}.png`).resize(tiers[0]).jpeg({ quality: 80, mozjpeg: true }).toFile(`${DST}/${name}-${kind}.jpg`);
  }
  manifest[kind] = {
    width, height, tiers, poster: `poster-${kind}`, still: `still-${kind}`,
    frames: seq.map((m) => ({ file: m.n, p: Math.max(m.p, 0.0001), quad: m.quad })),
    pushEndIndex: seq.length - 1,
  };
}
await fs.writeFile(`${DST}/manifest.json`, JSON.stringify(manifest));
console.log("encoded", manifest.landscape.frames.length, "landscape,", manifest.portrait.frames.length, "portrait");
```

- [ ] **Step 8: Generate the preview set and validate it**

Run:
```bash
npm run render:screens
npm run render:preview                  # ≈ 30–45 min at 16 spp on 4 cores; run it in the background
npm run encode:frames
npx vitest run tests/unit/manifest.test.ts   # now also validates the committed manifest
```
Expected: the manifest test passes, including "every file exists". Check the total size with `du -sh public/entrance`; it should be well under 2.5 MB at preview resolution. Open `lid-00`, `k1-on` and `push-27` and confirm they match the approved K0, K1 and the end of the push.

- [ ] **Step 9: Commit (encoded preview only; the masters stay gitignored)**

```bash
git add design/render/blender scripts/encode-frames.mjs public/entrance package.json
git commit -m "Add the render pipeline and the preview entrance frame set"
```

---

### Task 7: `FrameStore` (prioritised fetch, decode window)

**Files:**
- Create: `lib/entrance/FrameStore.ts`
- Test: `tests/unit/FrameStore.test.ts`

**Interfaces:**
- Consumes: `loadOrder` (Task 4).
- Produces:
  ```ts
  interface Decoded { width: number; height: number; close?: () => void }
  class FrameStore<T extends Decoded> {
    constructor(o: { count: number; order: number[]; fetchBlob: (i: number) => Promise<Blob>;
                     decode: (b: Blob) => Promise<T>; window?: number; concurrency?: number });
    start(): void;                                // begins fetching in `order`
    setPlayhead(i: number): void;                 // decodes within ±window, releases outside
    nearestDecoded(i: number): number | null;     // closest decoded index
    get(i: number): T | undefined;
    onChange(cb: () => void): () => void;
    dispose(): void;
    readonly failed: boolean;                     // a decode error occurred
  }
  ```

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { FrameStore } from "@/lib/entrance/FrameStore";

const flush = () => new Promise((r) => setTimeout(r, 0));
const mk = (count: number, opts: Partial<ConstructorParameters<typeof FrameStore>[0]> = {}) => {
  const closed: number[] = [];
  const store = new FrameStore({
    count, order: Array.from({ length: count }, (_, i) => i),
    fetchBlob: async (i) => new Blob([String(i)]),
    decode: async (b) => { const i = Number(await b.text()); return { width: 10, height: 10, i, close: () => closed.push(i) }; },
    window: 2, concurrency: 3, ...opts,
  });
  return { store, closed };
};

describe("FrameStore", () => {
  it("decodes only inside the window around the playhead", async () => {
    const { store } = mk(20); store.start(); store.setPlayhead(10);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.get(10)).toBeDefined(); expect(store.get(12)).toBeDefined(); expect(store.get(15)).toBeUndefined();
  });
  it("releases decoded frames that leave the window", async () => {
    const { store, closed } = mk(20); store.start(); store.setPlayhead(2);
    for (let k = 0; k < 10; k++) await flush();
    store.setPlayhead(15);
    for (let k = 0; k < 10; k++) await flush();
    expect(closed).toContain(2); expect(store.get(2)).toBeUndefined();
  });
  it("nearestDecoded falls back to the closest available frame", async () => {
    const { store } = mk(20); store.start(); store.setPlayhead(3);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.nearestDecoded(9)).toBe(5);
  });
  it("marks failure on a decode error and keeps going", async () => {
    const { store } = mk(5, { decode: vi.fn().mockRejectedValue(new Error("bad avif")) });
    store.start(); store.setPlayhead(0);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.failed).toBe(true); expect(store.nearestDecoded(0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.**

- [ ] **Step 3: Implement**

```ts
export interface Decoded { width: number; height: number; close?: () => void }

export class FrameStore<T extends Decoded> {
  private blobs = new Map<number, Blob>();
  private decoded = new Map<number, T>();
  private pending = new Set<number>();
  private listeners = new Set<() => void>();
  private playhead = 0;
  private disposed = false;
  failed = false;

  constructor(private o: { count: number; order: number[]; fetchBlob: (i: number) => Promise<Blob>;
    decode: (b: Blob) => Promise<T>; window?: number; concurrency?: number }) {}

  private get win() { return this.o.window ?? 6; }
  private emit() { this.listeners.forEach((l) => l()); }

  start() {
    const queue = [...this.o.order];
    const worker = async () => {
      while (queue.length && !this.disposed) {
        const i = queue.shift()!;
        try { this.blobs.set(i, await this.o.fetchBlob(i)); this.decodeIfWanted(i); } catch { /* network: keep others */ }
      }
    };
    for (let k = 0; k < (this.o.concurrency ?? 4); k++) void worker();
  }

  private wanted(i: number) { return Math.abs(i - this.playhead) <= this.win; }

  private decodeIfWanted(i: number) {
    const blob = this.blobs.get(i);
    if (!blob || this.decoded.has(i) || this.pending.has(i) || !this.wanted(i) || this.disposed) return;
    this.pending.add(i);
    this.o.decode(blob).then((d) => {
      this.pending.delete(i);
      if (this.disposed || !this.wanted(i)) { d.close?.(); return; }
      this.decoded.set(i, d); this.emit();
    }, () => { this.pending.delete(i); this.failed = true; this.emit(); });
  }

  setPlayhead(i: number) {
    this.playhead = i;
    for (const [k, d] of this.decoded) if (!this.wanted(k)) { d.close?.(); this.decoded.delete(k); }
    for (let k = i - this.win; k <= i + this.win; k++) if (k >= 0 && k < this.o.count) this.decodeIfWanted(k);
  }

  nearestDecoded(i: number): number | null {
    let best: number | null = null;
    for (const k of this.decoded.keys()) if (best === null || Math.abs(k - i) < Math.abs(best - i)) best = k;
    return best;
  }

  get(i: number) { return this.decoded.get(i); }
  onChange(cb: () => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  dispose() { this.disposed = true; this.decoded.forEach((d) => d.close?.()); this.decoded.clear(); this.blobs.clear(); }
}
```

The poster and still are drawn from their `<img>` elements, not through the store, so they are always available (see Task 9).

- [ ] **Step 4: Run it and confirm it passes.**

- [ ] **Step 5: Commit** with the message "Add FrameStore: prioritised fetch, bounded decode window, failure flag".

---

### Task 8: `FramePlayer` (canvas draw that returns the drawn quad)

**Files:**
- Create: `lib/entrance/FramePlayer.ts`
- Test: `tests/unit/FramePlayer.test.ts`

**Interfaces:**
- Consumes: `resolveFrame`, `lerpQuad` (Task 4); `coverFit`, `quadToViewport` (Task 3); `FrameStore` (Task 7); `ManifestFrame`.
- Produces: `drawFrame(args: { ctx: Ctx2D; frames: ManifestFrame[]; p: number; store: { nearestDecoded(i: number): number | null; get(i: number): CanvasImageSource & { width: number; height: number } | undefined }; fallback: (CanvasImageSource & { width: number; height: number }) | null; fallbackQuad: Quad | null; frameW: number; frameH: number; vw: number; vh: number; zoom: number }): { quad: Quad | null; drawnA: number | null }`. `Ctx2D` is a structural subset: `{ globalAlpha: number; clearRect(...); drawImage(img, dx, dy, dw, dh) }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { drawFrame } from "@/lib/entrance/FramePlayer";

const quad = (k: number) => [{ x: k, y: 0.2 }, { x: 1 - k, y: 0.2 }, { x: 1 - k, y: 0.6 }, { x: k, y: 0.6 }] as never;
const frames = [{ file: "a", p: 0.1, quad: null }, { file: "b", p: 0.2, quad: quad(0.3) }, { file: "c", p: 0.3, quad: quad(0.2) }];
const img = (id: string) => ({ id, width: 960, height: 540 }) as never;
const fakeCtx = () => { const calls: string[] = []; return { calls, globalAlpha: 1, clearRect() {}, drawImage(i: { id: string }) { calls.push(`${i.id}@${this.globalAlpha.toFixed(2)}`); } }; };
const base = { frameW: 960, frameH: 540, vw: 960, vh: 540, zoom: 1, fallback: img("poster"), fallbackQuad: null };

describe("drawFrame", () => {
  it("cross-fades the two neighbours and returns the interpolated drawn quad", () => {
    const ctx = fakeCtx();
    const store = { nearestDecoded: (i: number) => i, get: (i: number) => img(["a", "b", "c"][i]) };
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25, store });
    expect(ctx.calls).toEqual(["b@1.00", "c@0.50"]);
    expect(r.quad![0].x).toBeCloseTo(0.25 * 960);
  });
  it("uses the nearest decoded frame's own quad when the wanted one is missing", () => {
    const ctx = fakeCtx();
    const store = { nearestDecoded: () => 1, get: (i: number) => (i === 1 ? img("b") : undefined) };
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store });
    expect(ctx.calls).toEqual(["b@1.00"]);
    expect(r.quad![0].x).toBeCloseTo(0.3 * 960);
  });
  it("draws the fallback with its quad when nothing is decoded", () => {
    const ctx = fakeCtx();
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store: { nearestDecoded: () => null, get: () => undefined } });
    expect(ctx.calls).toEqual(["poster@1.00"]); expect(r.quad).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.**

- [ ] **Step 3: Implement**

```ts
import type { ManifestFrame, Quad } from "./types";
import { resolveFrame, lerpQuad } from "./frames";
import { coverFit, quadToViewport } from "./surface";

type Img = CanvasImageSource & { width: number; height: number };
export type Ctx2D = { globalAlpha: number; clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(img: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void };

export function drawFrame(a: { ctx: Ctx2D; frames: ManifestFrame[]; p: number;
  store: { nearestDecoded(i: number): number | null; get(i: number): Img | undefined };
  fallback: Img | null; fallbackQuad: Quad | null; frameW: number; frameH: number; vw: number; vh: number; zoom: number }) {
  const fit = coverFit(a.frameW, a.frameH, a.vw, a.vh, a.zoom);
  const put = (img: Img, alpha: number) => {
    a.ctx.globalAlpha = alpha;
    a.ctx.drawImage(img, fit.dx, fit.dy, a.frameW * fit.scale, a.frameH * fit.scale);
  };
  const toVp = (q: Quad | null) => (q ? quadToViewport(q, a.frameW, a.frameH, fit) : null);
  a.ctx.clearRect(0, 0, a.vw, a.vh);
  const { a: ia, b: ib, w } = resolveFrame(a.p, a.frames);
  const A = a.store.get(ia), B = a.store.get(ib);
  if (A && B) {
    put(A, 1); if (ib !== ia && w > 0) put(B, w);
    a.ctx.globalAlpha = 1;
    return { quad: toVp(lerpQuad(a.frames[ia].quad, a.frames[ib].quad, w)), drawnA: ia };
  }
  const near = a.store.nearestDecoded(w < 0.5 ? ia : ib);
  const N = near === null ? undefined : a.store.get(near);
  if (N && near !== null) { put(N, 1); a.ctx.globalAlpha = 1; return { quad: toVp(a.frames[near].quad), drawnA: near }; }
  if (a.fallback) put(a.fallback, 1);
  a.ctx.globalAlpha = 1;
  return { quad: toVp(a.fallbackQuad), drawnA: null };
}
```

- [ ] **Step 4: Run it and confirm it passes.**

- [ ] **Step 5: Commit** with the message "Add FramePlayer: cover-fit cross-fade that reports the quad it drew".

---

### Task 9: Tokens, data corrections, new Hero, `Entrance` + `EntranceStage`, Navbar, page

**Files:**
- Modify: `app/globals.css` (token values per Global Constraints: add `--screen`, `--accent-solid`, `--bg`, `--bg-raised`; retire the violet glow by aliasing `--glow`/`--glow-strong` to low-alpha ice so the August sections still render until Plan 2), `lib/tokens.ts` (the same values)
- Modify: `data/socials.ts` (`headline: "I build software people can actually use."`, add `heroLead: "Computer Science graduate building polished products, real-time systems and production-ready software."`), `app/opengraph-image.tsx` (the three spans read "I build software" / "people can" / "actually use."; the "7 languages" stat is removed), `data/skills.ts` (the `languages.evidence` line becomes: "C# carries SentinelAI's and T Poker's backends, TypeScript their clients, and Python carries DeveloperOS and Job Assistant."), `data/projects.ts` (remove `{ platform: "ios", status: "soon" }` from GRAVITY FLOW's `stores`)
- Rewrite: `components/sections/Hero.tsx`
- Create: `components/entrance/Entrance.tsx`, `components/entrance/EntranceStage.tsx`, `components/entrance/entrance.css`
- Modify: `components/layout/Navbar.tsx`, `app/page.tsx`
- Test: `tests/unit/content.test.ts`, `tests/unit/stage.test.ts`

**Interfaces:**
- Consumes: Tasks 2–8.
- Produces:
  - DOM: `#entrance[data-framing]`, `#hero h1`, `[data-skip-intro]`.
  - The window event `entrance:progress` with `detail: { p: number }`.
  - The `<html>` attribute `data-entrance-done="true"` once p ≥ 0.96, or at once in static mode.
  - `stageGeometry(vw: number, vh: number): { kind; containerSvh }` (re-export of `pickFramingKind`, which the resize test uses).

- [ ] **Step 1: Write the failing content test**

```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { siteMeta } from "@/data/socials";

describe("content truth", () => {
  it("no project lists a store for a platform its honest note excludes", () => {
    for (const p of projects) {
      const note = p.caseStudy.honestNote ?? "";
      if (/no iOS build/i.test(note)) expect(p.stores?.some((s) => s.platform === "ios")).toBeFalsy();
    }
  });
  it("the languages evidence does not claim C++ in shipped projects", () => {
    expect(skillGroups.find((g) => g.id === "languages")!.evidence).not.toMatch(/C\+\+ and C# carry/);
  });
  it("headline and hero lead are the approved copy", () => {
    expect(siteMeta.headline).toBe("I build software people can actually use.");
    expect(siteMeta.heroLead).toMatch(/^Computer Science graduate building polished products/);
  });
  it("no banned claims appear in site source", () => {
    for (const d of ["components", "data", "app"]) for (const f of (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))) {
      const t = fs.readFileSync(`${d}/${f}`, "utf8");
      expect(t, `${d}/${f}`).not.toMatch(/6\+ Shipped|1,077 roles|poker-home-games-three/);
    }
  });
});
```

Run: `npx vitest run tests/unit/content.test.ts`. Expected: FAIL on the three data assertions.

- [ ] **Step 2: Apply the data corrections, headline and heroLead, and the OG copy.** Run the test again. Expected: PASS.

- [ ] **Step 3: Update the tokens** in `app/globals.css` `:root` (and the matching lines in `lib/tokens.ts`):

```css
  --bg: #05070a;
  --bg-raised: #0a0e14;
  --screen: #05070a;
  --surface-0: var(--bg);
  --fg: #f2f4f8;
  --fg-muted: #9aa3b2;
  --fg-subtle: #7b8597;
  --accent: #5b9cff;
  --accent-solid: #1d6ef5;
  --light-cool: rgba(91, 156, 255, 0.14);
  --light-warm: rgba(255, 180, 107, 0.10);
  --glow: rgba(91, 156, 255, 0.10);        /* violet retired; aliased until Plan 2 removes its callers */
  --glow-strong: rgba(91, 156, 255, 0.16);
```

Also set `--screen: #05070a;` in `[data-theme="light"]`; the light theme's other values stay as they are until Plan 2.

Verify with `npm run build` and look at the page at 1440×900. The August sections must still render, just with the new palette.

- [ ] **Step 4: Rewrite `components/sections/Hero.tsx`** as the screen surface's content. It is a server component with no scroll logic of its own.

```tsx
import { siteMeta, socials } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDownIcon } from "@/components/ui/icons";

/** The site's first real content — and, while the entrance runs, the laptop's screen. */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero-surface-content relative flex min-h-[100svh] flex-col justify-center px-[clamp(20px,4vw,40px)]">
      <div className="mx-auto w-full max-w-[1240px]">
        <h1 id="hero-title" tabIndex={-1} className="outline-none">
          <span data-hero-name className="label mb-8 block text-fg-muted">{siteMeta.name} · {siteMeta.role}</span>
          <span data-hero-line="1" className="block font-semibold tracking-[-0.045em] text-fg" style={{ fontSize: "clamp(3rem, 7.2vw, 6.75rem)", lineHeight: 0.98 }}>I build software</span>
          <span data-hero-line="2" className="block font-semibold tracking-[-0.045em] text-fg-muted" style={{ fontSize: "clamp(3rem, 7.2vw, 6.75rem)", lineHeight: 0.98 }}>people can actually use.</span>
        </h1>
        <p data-hero-lead className="mt-8 max-w-[62ch] text-fg-muted" style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.3125rem)" }}>{siteMeta.heroLead}</p>
        <div data-hero-ctas className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#work" size="lg">Explore my work <ArrowDownIcon size={16} /></ButtonLink>
          <ButtonLink href={socials.github.url} variant="secondary" size="lg" target="_blank" rel="noreferrer">GitHub ↗</ButtonLink>
        </div>
      </div>
    </section>
  );
}
```

Before writing it, confirm `ButtonLink` accepts `target` and `rel` (`components/ui/Button.tsx:96`); if not, add pass-through props there. The primary button must use `--accent-solid`, which gives ≥ 4.5:1 with white text.

- [ ] **Step 5: Create `components/entrance/entrance.css`**

```css
/* Pinned by default; static under reduced motion (OS or in-app) — decided at first paint. */
.entrance { position: relative; height: var(--entrance-h, 400svh); }
.entrance__stage { position: sticky; top: 0; height: 100svh; overflow: hidden; background: var(--bg); isolation: isolate; }
.entrance__canvas, .entrance__poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.entrance__veil { position: absolute; inset: 0; background: #000; pointer-events: none; }
.entrance__surface { position: absolute; left: 0; top: 0; transform-origin: 0 0; background: var(--screen); opacity: 0; will-change: transform, opacity; }
.entrance__surface > .entrance__hero { position: absolute; width: 100vw; height: 100svh; background: var(--bg); }
.entrance__still { display: none; }
.entrance__skip { position: absolute; right: 24px; bottom: 24px; z-index: 5; }

@media (prefers-reduced-motion: reduce) {
  .entrance { height: auto; }
  .entrance__stage { position: static; height: auto; overflow: visible; }
  .entrance__canvas, .entrance__poster, .entrance__veil, .entrance__overlay, .entrance__skip { display: none; }
  .entrance__still { display: block; position: relative; height: 100svh; }
  .entrance__surface { position: static; transform: none !important; opacity: 1 !important; clip-path: none !important; }
  .entrance__surface > .entrance__hero { position: static; width: auto; height: auto; }
}
[data-reduced-motion="true"] .entrance { height: auto; }
[data-reduced-motion="true"] .entrance__stage { position: static; height: auto; overflow: visible; }
[data-reduced-motion="true"] .entrance__canvas, [data-reduced-motion="true"] .entrance__poster,
[data-reduced-motion="true"] .entrance__veil, [data-reduced-motion="true"] .entrance__overlay,
[data-reduced-motion="true"] .entrance__skip { display: none; }
[data-reduced-motion="true"] .entrance__still { display: block; position: relative; height: 100svh; }
[data-reduced-motion="true"] .entrance__surface { position: static; transform: none !important; opacity: 1 !important; clip-path: none !important; }
[data-reduced-motion="true"] .entrance__surface > .entrance__hero { position: static; width: auto; height: auto; }
```

The `<noscript>` block in `Entrance.tsx` sets the same static rules inline (the Step 6 markup includes it).

- [ ] **Step 6: Create `components/entrance/Entrance.tsx` (server)**

```tsx
import "./entrance.css";
import { EntranceStage } from "./EntranceStage";

/** The front door. Same DOM in every mode; CSS picks pinned or static at first paint. */
export function Entrance({ children }: { children: React.ReactNode }) {
  return (
    <div id="entrance" className="entrance" data-framing="landscape">
      <noscript>
        <style>{`.entrance{height:auto}.entrance__stage{position:static;height:auto}.entrance__canvas,.entrance__poster,.entrance__veil,.entrance__overlay,.entrance__skip{display:none}.entrance__still{display:block;position:relative;height:100svh}.entrance__surface{position:static;opacity:1}.entrance__surface>.entrance__hero{position:static;width:auto;height:auto}header[data-entrance-nav]{opacity:1!important}`}</style>
      </noscript>
      <div className="entrance__stage">
        <picture className="entrance__poster" aria-hidden="true">
          <source media="(max-aspect-ratio: 9/10)" srcSet="/entrance/poster-portrait.avif" type="image/avif" />
          <source srcSet="/entrance/poster-landscape.avif" type="image/avif" />
          <img src="/entrance/poster-landscape.jpg" alt="" fetchPriority="high" decoding="async" className="entrance__poster" />
        </picture>
        <picture className="entrance__still" aria-hidden="true">
          <source media="(max-aspect-ratio: 9/10)" srcSet="/entrance/still-portrait.avif" type="image/avif" />
          <source srcSet="/entrance/still-landscape.avif" type="image/avif" />
          <img src="/entrance/still-landscape.jpg" alt="" decoding="async" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </picture>
        <EntranceStage>{children}</EntranceStage>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write the failing stage-geometry test** (the resize item in Review Focus)

```ts
import { describe, it, expect } from "vitest";
import { stageGeometry } from "@/components/entrance/stageGeometry";

describe("stageGeometry", () => {
  it("re-derives framing and container height on resize", () => {
    expect(stageGeometry(1440, 900)).toEqual({ kind: "landscape", containerSvh: 400 });
    expect(stageGeometry(390, 844)).toEqual({ kind: "portrait", containerSvh: 260 });
    expect(stageGeometry(844, 390)).toEqual({ kind: "landscape", containerSvh: 260 });
  });
});
```

Create `components/entrance/stageGeometry.ts` as `export { pickFramingKind as stageGeometry } from "@/lib/entrance/frames";`. The test passes.

- [ ] **Step 8: Create `components/entrance/EntranceStage.tsx` (client)**

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { BEATS, segment, easeOut } from "@/lib/timeline";
import { FrameStore } from "@/lib/entrance/FrameStore";
import { drawFrame } from "@/lib/entrance/FramePlayer";
import { loadOrder, pickTier } from "@/lib/entrance/frames";
import { surfaceTransform, containsRect, coverFit, quadToViewport } from "@/lib/entrance/surface";
import { stageGeometry } from "./stageGeometry";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Manifest, FrameSet, Quad } from "@/lib/entrance/types";

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType)));
};

export function EntranceStage({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPref();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const state = useRef<{ set?: FrameSet; store?: FrameStore<ImageBitmap>; kind: "landscape" | "portrait";
    tier: number; vw: number; vh: number; pContain: number; raf: number; p: number; poster?: HTMLImageElement }>({ kind: "landscape", tier: 0, vw: 0, vh: 0, pContain: 0.88, raf: 0, p: 0 });

  const container = () => document.getElementById("entrance")!;
  const containerRef = useRef<HTMLElement | null>(null);
  // Layout effects run before Framer's own effects, so the target exists when useScroll attaches.
  useLayoutEffect(() => { containerRef.current = container(); }, []);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // geometry: framing class, container height, canvas backing size — on mount and on resize
  useEffect(() => {
    if (reduced) { document.documentElement.dataset.entranceDone = "true"; return; }
    const apply = () => {
      const vw = window.innerWidth, vh = window.innerHeight, g = stageGeometry(vw, vh);
      const c = container(); c.dataset.framing = g.kind; c.style.setProperty("--entrance-h", `${g.containerSvh}svh`);
      const s = state.current; s.vw = vw; s.vh = vh;
      if (s.kind !== g.kind) { s.kind = g.kind; s.store?.dispose(); s.store = undefined; void boot(); }
      const cv = canvasRef.current!; const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); cv.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeContain(); render(s.p);
    };
    const boot = async () => {
      const s = state.current;
      let m: Manifest;
      try { m = await (await fetch("/entrance/manifest.json")).json(); } catch { return; } // poster stays (Review Focus 4)
      const set = m[s.kind]; s.set = set; s.tier = pickTier(set.tiers, s.vw, window.devicePixelRatio || 1, saveData());
      const posterImg = new Image(); posterImg.src = `/entrance/${set.poster}.avif`; await posterImg.decode().catch(() => {}); s.poster = posterImg;
      const stillIndex = set.frames.findIndex((f) => f.file === "k1-on");
      s.store = new FrameStore<ImageBitmap>({
        count: set.frames.length,
        order: loadOrder(set.frames.length, { stillIndex, pushEndIndex: set.pushEndIndex, lidEnd: stillIndex - 1, saveData: saveData() }),
        fetchBlob: async (i) => (await fetch(`/entrance/${s.kind}/${s.tier}/${set.frames[i].file}.avif`)).blob(),
        decode: (b) => createImageBitmap(b), window: 8, concurrency: 4,
      });
      s.store.onChange(() => render(s.p));
      const go = () => s.store?.start();
      if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
      computeContain(); render(s.p);
    };
    const computeContain = () => {
      const s = state.current; if (!s.set) return;
      const fit = coverFit(s.set.width, s.set.height, s.vw, s.vh, 1.03);
      const f = s.set.frames.find((fr) => fr.p >= BEATS.push[0] && fr.quad && containsRect(quadToViewport(fr.quad, s.set!.width, s.set!.height, fit), s.vw, s.vh));
      s.pContain = f ? f.p : BEATS.push[1];
    };
    apply(); void boot();
    window.addEventListener("resize", apply);
    return () => { window.removeEventListener("resize", apply); state.current.store?.dispose(); cancelAnimationFrame(state.current.raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const render = (p: number) => {
    const s = state.current; if (reduced || !canvasRef.current) return;
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(() => {
      const ctx = canvasRef.current!.getContext("2d")!;
      const zoom = 1 + 0.03 * segment(p, ...BEATS.lift, easeOut);
      const frameW = s.set?.width ?? 1920, frameH = s.set?.height ?? 1080;
      const { quad } = s.set && s.store
        ? drawFrame({ ctx, frames: s.set.frames, p, store: s.store as never, fallback: (s.poster ?? null) as never, fallbackQuad: null, frameW, frameH, vw: s.vw, vh: s.vh, zoom })
        : { quad: null as Quad | null };
      veilRef.current!.style.opacity = String(1 - segment(p, ...BEATS.lift, easeOut));
      titleRef.current!.style.opacity = String(segment(p, 0.02, 0.1) * (1 - segment(p, ...BEATS.titleOut)));
      placeSurface(p, quad);
      const done = p >= BEATS.navIn[0];
      document.documentElement.dataset.entranceDone = String(done);
      window.dispatchEvent(new CustomEvent("entrance:progress", { detail: { p } }));
    });
  };

  const placeSurface = (p: number, quad: Quad | null) => {
    const s = state.current, el = surfaceRef.current!, hero = heroRef.current!;
    const portrait = s.kind === "portrait";
    const identityAt = portrait ? BEATS.portraitOpen[1] : BEATS.push[1];
    const visible = p >= BEATS.wake[0];
    el.style.opacity = visible ? String(segment(p, BEATS.wake[0], BEATS.wake[0] + 0.04)) : "0";
    let toIdentity = portrait ? segment(p, ...BEATS.portraitOpen) : segment(p, s.pContain, BEATS.push[1], easeOut);
    if (p >= identityAt || !quad) toIdentity = p >= identityAt ? 1 : toIdentity;
    const q = quad ?? [{ x: 0, y: 0 }, { x: s.vw, y: 0 }, { x: s.vw, y: s.vh }, { x: 0, y: s.vh }] as Quad;
    const t = surfaceTransform({ kind: s.kind, quad: q, vw: s.vw, vh: s.vh, toIdentity: quad ? toIdentity : 1 });
    el.style.left = `${t.box.x}px`; el.style.top = `${t.box.y}px`; el.style.width = `${t.box.w}px`; el.style.height = `${t.box.h}px`;
    el.style.transform = t.matrix; el.style.clipPath = t.clip;
    hero.style.left = `${-t.box.x}px`; hero.style.top = `${-t.box.y}px`;
    el.style.pointerEvents = p >= identityAt ? "auto" : "none";
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => { state.current.p = p; render(p); });

  // Skip intro / focus inside the hero before the portal → jump to p = 1 and focus the h1 (instant)
  const skip = () => {
    const c = container(), end = c.offsetTop + c.offsetHeight - window.innerHeight;
    window.scrollTo({ top: end, behavior: "instant" as ScrollBehavior });
    (document.getElementById("hero-title") as HTMLElement | null)?.focus();
  };
  useEffect(() => {
    if (reduced) return;
    const onFocus = (e: FocusEvent) => { if (state.current.p < 1 && heroRef.current?.contains(e.target as Node)) skip(); };
    const onHash = () => { if (location.hash === "#main" || location.hash === "#hero") skip(); };
    document.addEventListener("focusin", onFocus); window.addEventListener("hashchange", onHash);
    return () => { document.removeEventListener("focusin", onFocus); window.removeEventListener("hashchange", onHash); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} className="entrance__canvas" aria-hidden="true" />
      <div ref={veilRef} className="entrance__veil entrance__overlay" aria-hidden="true" />
      <div ref={titleRef} className="entrance__overlay pointer-events-none absolute inset-x-0 top-[40%] text-center" aria-hidden="true" style={{ opacity: 0 }}>
        <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[0.5em] text-fg">TAY SHOFER</p>
        <p className="label mt-3 text-fg-muted">Software Developer</p>
      </div>
      <div ref={surfaceRef} className="entrance__surface">
        <div ref={heroRef} className="entrance__hero">{children}</div>
      </div>
      <button type="button" data-skip-intro onClick={skip} className="entrance__skip label rounded-full border border-line px-4 py-3 text-fg-muted hover:text-fg">Skip intro ↓</button>
    </>
  );
}
```

The boot-log and identity choreography *inside* the surface (the terminal lines and "TAY SHOFER" morphing into the hero's name line) is added in Step 10. First get the geometry verified.

- [ ] **Step 9: Wire up the page and nav**
- In `app/page.tsx`, replace `<IntroSequence />` and the `<Hero />` inside `Stage` with `<Entrance><Hero /></Entrance>` placed above `<Stage>`. Remove the `IntroSequence` import; the file is deleted in Plan 2.
- In `Navbar.tsx`:
  - add `data-entrance-nav` to the `<header>`, and the class `opacity-0 [html[data-entrance-done=true]_&]:opacity-100 focus-within:opacity-100 transition-opacity duration-[var(--dur-mid)]`;
  - update `LINKS` to `Work #work`, `About #about`, `Stack #skills`, `Contact #contact`;
  - keep the palette and theme buttons.
- In static mode, `EntranceStage` sets `data-entrance-done="true"` on mount. Also add `[data-reduced-motion="true"] header[data-entrance-nav]{opacity:1}` and the same rule under `@media (prefers-reduced-motion: reduce)` to `entrance.css`, so the nav shows at first paint before hydration.

- [ ] **Step 10: Add the screen choreography inside the surface.** In `Hero.tsx`, add an `aria-hidden` boot layer: three `<p>` lines, `> initializing portfolio…`, `> loading projects…`, `> ready.`, in Geist Mono, centred. `EntranceStage.render()` then sets:
  - the boot line opacities over 0.40–0.50, staggered;
  - the boot layer's opacity to 1 − segment(0.53, 0.58);
  - `[data-hero-name]` from the centred and letterspaced identity (a transform computed from the element rects **once per resize**) to its resting place over the portal: 0.88–0.96 landscape, 0.90–0.96 portrait;
  - `[data-hero-line]`, `[data-hero-lead]` and `[data-hero-ctas]` as a mask reveal (translateY 100% → 0 inside `overflow:hidden` wrappers), staggered 0.9 / 0.92 / 0.94 / 0.96.

  All of these are transform and opacity only. In static mode none of them is applied, and the hero shows at rest.

- [ ] **Step 11: Verify in the browser.** Run `npm run build && npx next start --port 3100`, then screenshot at 1440×900, 1366×768, 768×1024, 390×844 and 844×390 at p = 0, 0.1, 0.25, 0.45, 0.6, 0.78, 0.9 and 1.0. Use the scratchpad `shoot.mjs` pattern with `PW_CHROMIUM`. Check each of these by eye, and fix the geometry, never a test, if one fails:
  - the poster fills the frame with no letterbox;
  - the surface sits exactly on the laptop screen from 0.45 to 0.68;
  - there is no bounce at the hand-off;
  - at 1.0 the hero equals the page;
  - the nav appears at the end;
  - there is no horizontal overflow.

- [ ] **Step 12: Commit**

```bash
git add app components data lib tests/unit/content.test.ts tests/unit/stage.test.ts
git commit -m "Mount the entrance: the hero becomes the laptop's screen and hands off at identity"
```

---

### Task 10: End-to-end suite for the entrance (including the Review Focus items)

**Files:**
- Create: `tests/e2e/entrance.spec.ts`

**Interfaces:**
- Consumes: the DOM contract from Task 9 (`#entrance[data-framing]`, `#hero-title`, `[data-skip-intro]`, `html[data-entrance-done]`, `.entrance__surface`).

- [ ] **Step 1: Write the suite**

```ts
import { test, expect } from "playwright/test";

const identity = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
const surfaceTransform = (page: import("playwright/test").Page) =>
  page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).transform);

test("skip intro lands on the hero at identity, focuses the h1, shows the nav", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect.poll(() => surfaceTransform(page)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\))$/);
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
});

test("jumping to #work from the top leaves the hero at identity (Review Focus 1)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => document.getElementById("work")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  expect(errors).toEqual([]);
});

test("resize mid-entrance re-derives framing (Review Focus 2)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.45));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#entrance")).toHaveAttribute("data-framing", "portrait");
});

test("in-app reduced motion switches to static mode immediately (Review Focus 3)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-reduced-motion", "true"));
  const h = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeLessThan(await page.evaluate(() => window.innerHeight * 2.5));
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
});

test("OS reduced motion: not pinned, hero in flow", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage(); await page.goto("/");
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect(page.locator("h1")).toHaveCount(1);
  await ctx.close();
});

test("missing manifest: poster stays and skip still works (Review Focus 4)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("**/entrance/manifest.json", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  expect(errors).toEqual([]);
});

test("reload restored mid-entrance renders consistently (Review Focus 5)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.5));
  await page.reload();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

for (const [w, h] of [[375, 667], [390, 844], [768, 1024], [1366, 768], [1440, 900], [844, 390]] as const) {
  test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h }); await page.goto("/");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
}

test("no JavaScript: static entrance, hero in flow, nav usable, content without the runtime", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const frameRequests: string[] = [];
  page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\/|manifest\.json/.test(r.url())) frameRequests.push(r.url()); });
  await page.goto("/");
  // not pinned
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  const entranceH = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(entranceH).toBeLessThan(900 * 2.5);
  // static still renders (the poster/canvas layers are hidden)
  const still = page.locator(".entrance__still img");
  await expect(still).toBeVisible();
  expect(await still.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".entrance__canvas")).toBeHidden();
  // the real Hero in normal flow, visible, below the still
  const hero = page.locator("#hero");
  await expect(hero).toBeVisible();
  await expect(page.locator("#hero-title")).toBeVisible();
  const heroPos = await page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).position);
  expect(heroPos).toBe("static");
  await expect(page.locator("h1")).toHaveCount(1);
  // nav visible from first paint
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
  // nav links work without JS (plain anchors)
  for (const [label, id] of [["Work", "work"], ["About", "about"], ["Stack", "skills"], ["Contact", "contact"]] as const) {
    const link = page.locator("header[data-entrance-nav] nav a", { hasText: label }).first();
    await expect(link).toHaveAttribute("href", `#${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  // no horizontal overflow
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  // content never depended on the canvas/frame runtime
  expect(frameRequests).toEqual([]);
  await ctx.close();
});

test("no frames are requested before load except the poster", async ({ page }) => {
  const early: string[] = [];
  page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\//.test(r.url())) early.push(r.url()); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(early).toEqual([]);
});
```

The no-JavaScript test was added at your review, 2026-09-25. It is a real browser context with JavaScript disabled, not an inference from the `<noscript>` CSS. On a phone-width viewport the desktop nav links sit behind the menu button, which needs JS, so the test runs at 1440×900 where the links are plain anchors. Task 9's Navbar keeps them as plain `<a href>`.

- [ ] **Step 2: Run the suite.**
  `npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e`
  Expected: all pass. Any failure is a real defect in Task 9: fix it there and never weaken the test.

- [ ] **Step 3: Commit** with the message "Add the entrance e2e suite, including the five review-focus cases".

---

### Task 11: Plan 1 verification gate

**Files:** none new, except this plan's "Verification log", appended to the end of this document.

- [ ] **Step 1: Run the full gate**

`npm run typecheck && npm run lint && npm test && npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e`
Expected: all green.

- [ ] **Step 2: Check the budgets**
- **First-load JS:** use the baseline method (the gzip sum of the `<script src>` files on `/` from `next start`). It must be ≤ 286 KB.
- **CLS:** a PerformanceObserver `layout-shift` sum while scrolling through the entrance must be < 0.02.
- **LCP:** from a `largest-contentful-paint` observer; target ≤ 1.2 s locally.

Record all three numbers.

- [ ] **Step 3: Visual pass.** Screenshot the entrance beats at the five viewports from Task 9 Step 11, in both themes. Review against the approved K0, K1 and K2. Preview frames are expected to be soft; geometry and choreography are what is judged.

- [ ] **Step 4: Pre-delivery UX check.** Run `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility z-index loading" --domain ux`, and walk the Quick Reference §1–§3 items against the entrance: focus rings, 44 px targets, contrast, reduced motion, CLS.

- [ ] **Step 5: Commit and push the feature branch** (never main):

```bash
git add docs/superpowers/plans/2026-09-25-plan-1-cinematic-entrance.md
git commit -m "Plan 1 verification log"
git push origin feature/premium-portfolio-redesign-1mqmgf
```

Then stop and report to the user. Plan 2 (sections, final look-dev behind the visual gate, final renders, cleanup) is written next and reviewed before execution.

---

## Verification log (2026-09-25)

**Gate:** `typecheck` 0 · `lint` 0 · `vitest` 50/50 · `next build` 0 · Playwright 16/16 (incl. the no-JavaScript test).

**Budgets** (`next start`, local, Chromium):

| Budget | Measured | Limit |
|---|---|---|
| First-load JS (gzip sum of `<script src>` on `/`) | 279.3 KB | ≤ 286 KB |
| HTML | 500 KB | ≤ 568 KB |
| CLS while scrolling the entrance | 0.0000 (1440×900 and 390×844) | < 0.02 |
| LCP | 420 ms (1440×900) · 316 ms (390×844) | ≤ 1.2 s |
| Frame requests before `load` | 0 | 0 (poster/still only) |
| Frame set | landscape 1.1 MB (960 preview tier) · portrait 404 KB | ≤ 2.5 MB · ≤ 1.2 MB |

**Visual pass:** beats p = 0 … 1 at 1440×900, 1366×768, 768×1024, 390×844 and 844×390, dark and light. Found and fixed: mask reveals leaking through `overflow-clip-margin`; the skip button under the chat bubble and visible after the portal; the room title without its scrim; the hero overflowing 844×390; and, in the light theme, invisible overlays and a white laptop screen (the stage now scopes the dark tokens).

**UX pre-delivery (ui-ux-pro-max, ux domain):** loading feedback (the poster is always painted, and is also the fallback frame), stacking (the stage is isolated), no continuous animation, a global `:focus-visible` ring, ≥ 44 px targets, contrast (muted 7.9:1, accent-solid white 4.6:1), reduced motion (e2e), CLS 0.

**Deviations from this plan:** see the ledger. In short:
- `render.py --names`.
- 8-bit AVIF.
- `EntranceStage` restructured for the React Compiler lint.
- `setPlayhead` was missing.
- Double boot, fixed with a generation counter.
- An empty `segment` range.
- The veil is near-black at 0.72.
- The spec's chapter labels and tagline were added.
- Light-theme `--bg`, and the dark-scoped stage.
- `accent-solid` hover token, and `external` on ButtonLink.
- OG stat filter.
- The `#top` anchor.
- The unmasked name line.
- The height-aware hero type.

**Open for Plan 2:**
- Look-dev notes from the approval.
- The floating accessibility button grazes the CTA row at 844×390.
- In the light theme the hero stays a dark band under the light nav, by design of the dark screen; confirm or restyle.
