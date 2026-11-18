// tests/unit/lab-hero-a.test.ts — Concept A, the cinematic hero (PROTOTYPE, D2 reopened by Tay on 2026-11-18). Branch
// proto/hero-a-cinematic only, never merged. It pins what the prototype promised: honest copy, never indexed or linked
// from the live page, and progressive enhancement. The contrast floors are read from the prototype's own stylesheet.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects } from "@/data/projects";
import { flagships } from "@/data/work";
import { FEATURED_KIND } from "@/app/lab/hero-a/featured";
import { metadata as labMeta } from "@/app/lab/layout";

const read = (f: string) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]));
const page = read("app/lab/hero-a/page.tsx");
const field = read("app/lab/hero-a/Constellation.tsx");
const css = read("app/lab/hero-a/hero-a.css");

describe("honest content", () => {
  it("features exactly the four flagships, in Work order, with the correct names", () => {
    expect(Object.keys(FEATURED_KIND)).toEqual(flagships.map((f) => f.id));
    expect(flagships.map((f) => projects.find((p) => p.id === f.id)!.name)).toEqual(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"]);
  });
  it("each one-line tag uses only words from that project's own tagline and summary", () => {
    for (const [id, kind] of Object.entries(FEATURED_KIND)) {
      const p = projects.find((x) => x.id === id)!;
      const own = new Set(`${p.tagline} ${p.summary}`.toLowerCase().split(/[^a-z]+/));
      for (const w of kind.toLowerCase().split(/[^a-z]+/).filter(Boolean)) expect(own.has(w), `${id}: "${w}"`).toBe(true);
    }
  });
  it("shows no figures at all: no stats, counts or metrics in the hero's copy", () => {
    const copy = page.replace(/<svg[\s\S]*?<\/svg>/, "").replace(/className="[^"]*"/g, "");
    expect([...copy.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join(" ")).not.toMatch(/\d/);
  });
  it("the role, availability and every project state come from the site's data, not new literals", () => {
    expect(page).toMatch(/\{siteMeta\.role\}/);
    expect(page).toMatch(/availability\.open &&/);
    expect(page).toMatch(/heroIndex\.map/);
    expect(page).toMatch(/\{x\.state\}/);
    expect(page).toMatch(/href=\{resume\.href\} download=\{resume\.fileName\}/);
    expect(page).toMatch(/Download résumé<span aria-hidden="true">↓<\/span>/);   // Tay, round 3: résumé, not CV
    expect(page).not.toMatch(/Download CV/);
  });
});

describe("never indexed, never linked", () => {
  it("every /lab page is noindex, nofollow, and claims no canonical", () => {
    expect(labMeta.robots).toMatchObject({ index: false, follow: false, googleBot: { index: false, follow: false } });
    expect(labMeta.alternates?.canonical).toBeNull();
  });
  it("the sitemap and robots.txt do not mention it", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    expect(sitemap().map((e) => e.url).join(" ")).not.toMatch(/\/lab/);
    expect(read("app/robots.ts")).not.toMatch(/\/lab/);
  });
  it("nothing in the live site's source links to /lab", () => {
    const live = ["app", "components", "data", "lib"].flatMap(files)
      .filter((f) => /\.(tsx?|css|json)$/.test(f) && !f.startsWith(path.join("app", "lab") + path.sep));
    for (const f of live) expect(read(f), f).not.toMatch(/["'`(]\/lab(\/|["'`)])/);
  });
});

describe("progressive enhancement", () => {
  it("the field is a 2D canvas, decoration only: aria-hidden, no WebGL", () => {
    expect(field).toMatch(/getContext\("2d"\)/);
    expect(field).not.toMatch(/webgl/i);
    expect(field).toMatch(/<canvas[^>]*aria-hidden="true"/);
    expect(css).toMatch(/\.hxa__field \{[^}]*pointer-events: none/);
  });
  it("the loop honours reduced motion (the OS and the site's switch) and pauses when hidden or off screen", () => {
    expect(field).toMatch(/useReducedMotionPref\(\)/);
    expect(field).toMatch(/prefers-reduced-motion: reduce/);
    expect(field).toMatch(/dataset\.reducedMotion === "true"/);
    expect(field).toMatch(/visibilitychange/);
    expect(field).toMatch(/new IntersectionObserver/);
    expect(field).toMatch(/cancelAnimationFrame/);
  });
  it("round 2's life stays bounded: the phone frame cap, capped and rare signals, a pull that never pushes", () => {
    expect(field).toMatch(/t - last < \(light \? 30 : 12\)/);                       // ≤ ~30 draws a second on the light path
    expect(field).toMatch(/maxPulses = light \? 2 : 4; gapMin = light \? 2\.6 : 1\.4; gapMax = light \? 4\.6 : 2\.8;/);
    expect(field).toMatch(/hops: 1 \+ \(\(Math\.random\(\) \* 3\) \| 0\) \+ \(Math\.random\(\) < 0\.35 \? 1 : 0\)/);   // ≤ 4 hops
    expect(field).toMatch(/if \(pulses\.length < maxPulses && nodes\.length > 1\) launch\(\);/);
    // The pointer's force is the pull times a non-negative fade: no repel term anywhere.
    expect(field).toMatch(/const f = \(1 - d \/ POINTER_R\) \* PULL \* soft \* soft \* pointer\.k \* dt;/);
    expect(field).not.toMatch(/-\(1 - d \/ RING\)/);
    // The still frame draws no signals: none exist until the loop's clock reaches the first launch.
    expect(field).toMatch(/if \(still\) \{\n\s+draw\(\);\n\s+canvas\.dataset\.state = "static";/);
  });
  it("the reveal is CSS that ends visible, and is switched off with reduced motion", () => {
    expect(css).toMatch(/@keyframes hxa-rise \{ from \{ opacity: 0;[^}]*\} \}/);   // a `from` only: it ends on the real values
    // The headline (the largest paint) never starts invisible: an opacity-0 start left Chromium with no LCP at all.
    expect(css).toMatch(/@keyframes hxa-settle \{ from \{ translate: 0 16px; \} \}/);
    expect(css).toMatch(/\n\.hxa__title \{ animation-name: hxa-settle; \}/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\n\s+\.hxa__top, [^{]+\{ animation: none; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] :is\(\.hxa__top,[^)]+\) \{ animation: none; \}/);
  });
  it("the glows drift and breathe from the field's clock: transform and opacity only, 5 Hz, never brighter, never with reduced motion", () => {
    // No CSS animation: measured, it cost +5.3 pp of phone main thread. The loop drives them instead.
    expect(css).not.toMatch(/@keyframes hxa-breathe|\.hxa__glow[^{]*\{[^}]*animation/);
    expect(field).toMatch(/const SKY_STEP = 0\.2;/);
    expect(field).toMatch(/if \(clock - skyAt < SKY_STEP \|\| !skyCyan \|\| !skyViolet\) return;/);
    const body = field.slice(field.indexOf("const breathe = () => {"), field.indexOf("/** A signal fades in"));
    expect([...body.matchAll(/sky\w+\.style\.(\w+) =/g)].map((m) => m[1]).sort()).toEqual(["opacity", "opacity", "transform", "transform"]);
    // u, v ∈ [0, 1] (a raised cosine), so both opacities stay within [0.8, 1]: never above the static peak.
    expect(body).toMatch(/skyCyan\.style\.opacity = \(1 - 0\.2 \* u\)/);
    expect(body).toMatch(/skyViolet\.style\.opacity = \(0\.82 \+ 0\.18 \* v\)/);
    expect(body.match(/0\.5 - 0\.5 \* Math\.cos/g)).toHaveLength(2);
    // Only the running loop breathes; the still frame puts the glows back at rest.
    expect(field).toMatch(/step\(dt\); draw\(\); breathe\(\);/);
    const still = field.slice(field.indexOf("if (still) {"), field.indexOf("let raf = 0"));
    expect(still).not.toMatch(/breathe\(/);
    expect(still).toMatch(/g\.style\.transform = ""; g\.style\.opacity = "";/);
  });
  it("every rule outside the .hxa scope only applies while the prototype is in the page", () => {
    // Every selector, at-rule blocks included (each `selector {`), split on its top-level commas.
    const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim())
      .filter((s) => !s.startsWith("@") && !/^(from|to|\d+%)$/.test(s));
    expect(selectors.length).toBeGreaterThan(40);
    for (const sel of selectors) for (const part of sel.split(/,(?![^(]*\))/)) expect(part.trim(), sel).toMatch(/\.hxa\b|\.hxa__|:has\(\.hxa\)/);
  });
});

// ── Contrast floors (WCAG 2.2 AA), on the base and on the brightest glow behind text ──
const tok = (name: string) => { const m = css.match(new RegExp(`--hxa-${name}:\\s*(#[0-9a-f]{6});`)); if (!m) throw new Error(name); return m[1]; };
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (c: number[]) => { const l = c.map((x) => x / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const over = (top: number[], alpha: number, base: number[]) => top.map((c, i) => c * alpha + base[i] * (1 - alpha));
const glow = (r: number, g: number, b: number) => Number(css.match(new RegExp(`rgba\\(${r}, ${g}, ${b}, ([\\d.]+)\\), transparent`))![1]);

describe("contrast floors", () => {
  const abyss = rgb(tok("abyss")), navy = rgb(tok("navy"));
  const cyanPeak = over(rgb(tok("cyan")), glow(46, 230, 214), abyss);       // under the pill, top right
  const violetPeak = over(rgb(tok("violet")), glow(155, 107, 255), navy);   // under Featured work, bottom left
  const grounds = { abyss, navy, cyanPeak, violetPeak };
  it.each(Object.entries(grounds))("text on %s", (_, g) => {
    expect(ratio(rgb(tok("ink")), g)).toBeGreaterThanOrEqual(12);
    expect(ratio(rgb(tok("mist")), g)).toBeGreaterThanOrEqual(7);
    expect(ratio(rgb(tok("faint")), g)).toBeGreaterThanOrEqual(5.4);   // the site's floor for its smallest text
    expect(ratio(rgb(tok("cyan")), g)).toBeGreaterThanOrEqual(4.5);    // the eyebrow; the gradient's cyan end
    // The violet end (Tay's brief fixes the hue) is only ever in the H1, 36–80px: WCAG "large text", floor 3:1.
    // Measured: 5.7:1 on the base, 4.2:1 over the brightest violet glow.
    expect(ratio(rgb(tok("violet")), g)).toBeGreaterThanOrEqual(3);
  });
  it("the gradient's violet end clears the normal-text floor too, on the base field", () => {
    for (const g of [abyss, navy]) expect(ratio(rgb(tok("violet")), g)).toBeGreaterThanOrEqual(4.5);
    expect(css).toMatch(/\.hxa__grad \{/);
    expect(page.match(/hxa__grad/g)).toHaveLength(1);   // used once, inside the h1
    expect(page).toMatch(/<h1[^>]*>[\s\S]*hxa__grad[\s\S]*<\/h1>/);
  });
  it("the primary action: its label on the fill, and the fill and focus ring against the field (non-text 3:1)", () => {
    for (const fill of [tok("cyan"), tok("cyan-hover")]) {
      expect(ratio(rgb(tok("abyss")), rgb(fill))).toBeGreaterThanOrEqual(7);
      expect(ratio(rgb(fill), navy)).toBeGreaterThanOrEqual(3);
    }
    expect(ratio(rgb(tok("cyan")), abyss)).toBeGreaterThanOrEqual(3);
  });
  it("the ghost action's edge clears 3:1 against the field", () => {
    const a = Number(css.match(/--hxa-ghost-edge: rgba\(238, 242, 251, ([\d.]+)\);/)![1]);
    for (const g of [abyss, navy]) expect(ratio(over(rgb(tok("ink")), a, g), g)).toBeGreaterThanOrEqual(3);
  });
});
