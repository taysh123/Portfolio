// tests/unit/lab-work.test.ts — the Work slice in the cinematic language (PROTOTYPE, round 5; D2 reopened by Tay,
// 2026-11-18). Branch proto/hero-a-cinematic only, never merged. Every visible fact must come from the site's own data,
// private repositories stay labels, and the slice stays inside the lab's .cine layer.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL, PROJECT_GALLERIES } from "@/data/projects";
import { flagships } from "@/data/work";
import { IMAGES } from "@/data/images";
import { dict } from "@/lib/dict";
import { panels, DOS_CHIPS, PHONE_CROP } from "@/app/lab/work/panels";
import sharp from "sharp";
import { privateRepoLeaks } from "../support/private-repo";
import { namesAny } from "../support/institution";

const read = (f: string) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const page = read("app/lab/work/page.tsx");
const css = read("app/lab/work/work.css");
const data = read("app/lab/work/panels.ts");
const reel = read("app/lab/work/Reel.tsx");
const shot = read("app/lab/work/Shot.tsx");
/** Code without its comments (a comment saying "no WebGL" is not WebGL). */
const code = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const layer = read("app/lab/_cinematic/cinematic.css");
const project = (id: string) => projects.find((p) => p.id === id)!;

describe("honest content", () => {
  it("the four flagships, in Work order, with the correct names", () => {
    expect(panels.map((p) => p.id)).toEqual(flagships.map((f) => f.id));
    expect(panels.map((p) => p.name)).toEqual(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"]);
  });
  it("each one line is the project's own tagline, word for word", () => {
    for (const p of panels) expect(p.line, p.id).toBe(project(p.id).tagline);
  });
  it("each state is the site's own status string (DeveloperOS adds the version its own data states)", () => {
    expect(Object.fromEntries(panels.map((p) => [p.id, p.state]))).toEqual({
      poker: dict.status.stores, aegis: dict.status.local, developeros: `${dict.status.released} · v1.0.0`, "gravity-flow": dict.status.rc });
    expect(project("developeros").context).toContain("v1.0.0");
    expect(project("gravity-flow").status).toBe("rc");   // a release candidate: never "live" or "published"
  });
  it("two or three chips each, all from the project's own stack, emphasised entries first", () => {
    for (const p of panels) {
      const stack = project(p.id).stack;
      expect(p.chips.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.chips.length, p.id).toBeLessThanOrEqual(3);
      for (const c of p.chips) expect(stack.map((s) => s.label), `${p.id}: ${c}`).toContain(c);
      const emphasised = stack.filter((s) => s.emphasis).map((s) => s.label);
      expect(p.chips.slice(0, emphasised.length), p.id).toEqual(emphasised.slice(0, 3));
    }
  });
  it("links: the live product where one exists, else the public repository; GRAVITY FLOW has neither", () => {
    const by = Object.fromEntries(panels.map((p) => [p.id, p]));
    expect(by.poker.primary).toEqual({ href: project("poker").liveUrl, label: project("poker").liveLabel });
    expect(by.aegis.primary).toEqual({ href: publicRepoUrl(project("aegis")), label: dict.common.source });
    expect(by.developeros.primary).toEqual({ href: publicRepoUrl(project("developeros")), label: dict.common.source });
    expect(by["gravity-flow"].primary).toBeUndefined();
    for (const p of panels) expect(p.more).toEqual({ href: `/#work-${p.id}`, label: `More on ${p.name}` });
  });
  it("private repositories are labels, never links: no slug or URL in the slice's data, page or rendered values", () => {
    expect(panels.filter((p) => p.privateRepo).map((p) => p.id)).toEqual(["poker", "gravity-flow"]);
    for (const p of panels.filter((p) => p.privateRepo)) expect(project(p.id).repo.visibility).toBe("private");
    for (const t of [page, css, data, JSON.stringify(panels)]) expect(privateRepoLeaks(t)).toEqual([]);
    expect(JSON.stringify(panels)).not.toMatch(/github\.com\/[^"]*(poker|gravity)/i);
    expect(page).toMatch(/\{p\.privateRepo && <PrivateRepoLabel/);
    expect(PRIVATE_REPO_LABEL).toBe("Private repository");
  });
  it("names no institution, and claims no AI (Aegis's analysis is a deterministic mock; DeveloperOS's default is offline)", () => {
    for (const t of [page, data, JSON.stringify(panels)]) expect(namesAny(t)).toBe(false);
    expect(JSON.stringify(panels)).not.toMatch(/\bAI\b|LLM|model/i);
  });
  it("the title says projects, not products: not all four are shipped (Tay, round 5)", () => {
    expect(page).toMatch(/<h1[^>]*>Four projects, built end to end\.<\/h1>/);
    expect(page).not.toMatch(/Four products/);
  });
  it("adds no figures of its own: every number shown is in the project's data", () => {
    for (const p of panels) for (const n of `${p.line} ${p.state}`.match(/\d[\d.,]*/g) ?? [])
      expect(JSON.stringify(project(p.id)), `${p.id}: ${n}`).toContain(n);
    const jsx = code(page.slice(page.indexOf("  return (")));   // the markup only: sizes strings and comments are not copy
    const copy = [...jsx.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/className="[^"]*"/g, "").matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join(" ");
    expect(copy).not.toMatch(/\d/);
  });
});

describe("real captures: each project's gallery (data/projects.ts PROJECT_GALLERIES)", () => {
  it("holds exactly the captures Tay listed (round 6), in order, and feeds each panel", () => {
    expect(PROJECT_GALLERIES).toEqual({
      poker: ["poker-home", "poker-live", "poker-settle"], aegis: ["aegis-alerts"], developeros: ["dos-search"], "gravity-flow": ["gf-gameplay", "gf-boss"] });
    for (const p of panels) expect(p.gallery.map((g) => g.image), p.id).toEqual(PROJECT_GALLERIES[p.id].map((e) => (typeof e === "string" ? e : e.image)));
    // One capture is a still; two or more, a carousel. Aegis and DeveloperOS have one real capture each today.
    expect(Object.fromEntries(panels.map((p) => [p.id, p.gallery.length]))).toEqual({ poker: 3, aegis: 1, developeros: 1, "gravity-flow": 2 });
  });
  it("is a separate export, not a field of the projects the live page and its case study read", () => {
    for (const p of projects) expect(Object.keys(p)).not.toContain("gallery");
    expect(read("data/projects.ts")).toMatch(/^import type \{ ImageName \} from "@\/data\/images";$/m);   // type-only: no runtime import
  });
  it("every capture, and every phone crop, exists in public/work at every width, in AVIF and WebP", () => {
    for (const p of panels) for (const g of p.gallery) for (const name of [g.image, ...(g.phone ? [g.phone] : [])]) {
      expect(IMAGES[name], name).toBeDefined();
      for (const w of IMAGES[name].widths) for (const ext of ["avif", "webp"]) expect(fs.existsSync(`public/work/${name}-${w}.${ext}`), `${name}-${w}.${ext}`).toBe(true);
    }
    expect(shot).toMatch(/width=\{im\.w\} height=\{im\.h\}/);   // real dimensions reserve the box
  });
  it("alt text is the site's own, already reviewed: lib/dict.ts or the project's media", () => {
    const alt = Object.fromEntries(panels.flatMap((p) => p.gallery.map((g) => [g.image, g.alt])));
    expect(alt).toEqual({
      "poker-home": dict.poker.alts[0], "poker-live": dict.poker.alts[1], "poker-settle": dict.poker.alts[2],
      "aegis-alerts": dict.aegis.alt,
      "dos-search": dict.dos.alt.replace("{chips}", DOS_CHIPS.join(", ")),
      "gf-gameplay": dict.gf.alt,
      "gf-boss": project("gravity-flow").media!.gallery!.find((g) => g.src.endsWith("/boss.webp"))!.alt,
    });
    expect(alt["gf-boss"]).toBe("World boss encounter");
    for (const a of Object.values(alt)) expect(a).not.toMatch(/\{\w+\}/);
  });
  it("gf-boss really is the capture whose alt text it reuses (public/projects/gravity-flow/boss.webp, re-encoded)", async () => {
    const px = (f: string) => sharp(f).resize(48, 96, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const [a, b] = await Promise.all([px("public/projects/gravity-flow/boss.webp"), px("public/work/gf-boss-480.webp")]);
    let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
    expect(d / a.length).toBeLessThan(2);   // measured 0.48 of 255: the same image
  });
  it("adding a capture without alt text fails the build: the gallery resolver throws", () => {
    expect(data).toMatch(/if \(!alt\) throw new Error\(/);
  });
  it("the phone crops are the ones the live chapters use below 640px", () => {
    const pairs = (f: string) => [...read(f).matchAll(/srcSet\("([\w-]+-phone)", "avif"\)[\s\S]*?srcSet\("([\w-]+)", "avif"\)/g)].map((m) => [m[2], m[1]]);
    expect(Object.entries(PHONE_CROP)).toEqual([...pairs("components/work/AegisChapter.tsx"), ...pairs("components/work/DeveloperOSChapter.tsx")]);
  });
  it("the DeveloperOS chips are the live chapter's own (copied, because the chapter does not export them)", () => {
    const chapter = read("components/work/DeveloperOSChapter.tsx");
    expect([...chapter.slice(chapter.indexOf("const CHIPS")).matchAll(/label: "([^"]+)"/g)].slice(0, 3).map((m) => m[1])).toEqual(DOS_CHIPS);
  });
  it("only the page's first capture loads eagerly at high priority; every other capture is lazy", () => {
    expect(page).toMatch(/<Shot \{\.\.\.p\.gallery\[0\]\} sizes=\{sizesOf\(p\.kind, false\)\} priority=\{i === 0\} \/>/);   // a still first panel
    expect(page).toMatch(/priority=\{i === 0 && k === 0\}/);                                                       // or a carousel's first capture
    expect(shot).toMatch(/loading=\{priority \? "eager" : "lazy"\} fetchPriority=\{priority \? "high" : undefined\}/);
  });
});

describe("structure", () => {
  it("leaves one labelled, empty, hidden slot per panel for the P4 demo: no demo and no placeholder", () => {
    expect(page).toMatch(/\{\/\* P4: the "try it" demo mounts here[\s\S]*?\*\/\}\n\s*<div className="wk__demo" data-demo-slot=\{p\.id\} hidden \/>/);
    expect(page.match(/data-demo-slot/g)).toHaveLength(1);   // one per panel, from the map
  });
  it("the carousel is the slice's only client code: the page and its data stay on the server; no canvas or WebGL", () => {
    for (const t of [page, data, shot]) expect(t).not.toMatch(/^["']use client["']|useEffect|<canvas|getContext/m);
    expect(reel).toMatch(/^"use client";/);
    expect(code(reel)).not.toMatch(/<canvas|getContext|webgl|three|lenis/i);
    // It imports no data and no image table: the server renders every capture and hands them in (`shots`).
    expect(reel).not.toMatch(/from "\.\/panels"|from "\.\/Shot"|@\/data\//);
    expect(page).toMatch(/shots=\{p\.gallery\.map\(\(g, k\) => <Shot /);
  });
  it("a single capture is a still, with no carousel chrome; two or more are a carousel", () => {
    expect(page).toMatch(/\{p\.gallery\.length === 1 \? \(\s*<div className="wk__device"><Shot \{\.\.\.p\.gallery\[0\]\}[\s\S]*?\) : \(\s*<Reel /);
  });
  it("the carousel: the WAI-ARIA tabbed pattern, arrows / Home / End, swipe, a polite announcement, and never autoplay", () => {
    expect(reel).toMatch(/role="region" aria-roledescription="carousel"/);
    expect(reel).toMatch(/role="tabpanel" aria-roledescription="slide"/);
    expect(reel).toMatch(/role="tablist"/);
    expect(reel).toMatch(/role="tab"[\s\S]*aria-selected=\{i === active\}[\s\S]*aria-controls=/);
    expect(reel).toMatch(/tabIndex=\{i === active \? 0 : -1\}/);   // roving: one tab stop for the dots
    for (const k of ["ArrowRight", "ArrowLeft", "Home", "End"]) expect(reel).toContain(`"${k}"`);
    expect(reel).toMatch(/aria-label="Previous capture"[\s\S]*aria-label="Next capture"/);
    expect(reel).toMatch(/Math\.abs\(dx\) > 40 && Math\.abs\(dx\) > Math\.abs\(dy\)/);
    expect(reel).toMatch(/aria-live="polite"/);
    expect(code(reel)).not.toMatch(/setInterval|setTimeout|requestAnimationFrame|autoplay/i);
  });
  it("no JS shows the first capture alone and hides the controls; reduced motion is a flat slider", () => {
    expect(reel).toMatch(/useSyncExternalStore\(noop, \(\) => true, \(\) => false\)/);
    expect(reel).toMatch(/const shown = front \|\| \(ready && !flat && Math\.abs\(d\) === 1\);/);
    expect(reel).toMatch(/<div className="wk__device">\{shown && shot\}<\/div>/);
    expect(css).toMatch(/\.wk__reel:not\(\[data-ready\]\) \.wk__controls \{ visibility: hidden; \}/);
    expect(css).toMatch(/\.wk__slide:not\(\[data-shown\]\) \{ visibility: hidden; \}/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.wk__slide:not\(\[data-offset="0"\]\) \{ transform: none; visibility: hidden; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] \.wk__slide:not\(\[data-offset="0"\]\) \{ transform: none; visibility: hidden; \}/);
  });
  it("one opening reveal (eyebrow, the title settling, lede) and still panels", () => {
    expect(page.match(/\sdata-reveal(="settle")?[\s>]/g)).toHaveLength(3);
    expect(page).toMatch(/<h1[^>]*data-reveal="settle"/);
    expect([...css.matchAll(/--reveal-i: (\d+);/g)].map((m) => Number(m[1]))).toEqual([0, 1, 2]);
  });
  it("lifts on hover, keyboard focus and touch, and never moves with reduced motion", () => {
    expect(css).toMatch(/\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{\s*translate: 0 var\(--cine-lift\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] \.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
  });
});

describe("inside the cinematic layer", () => {
  it("every selector is scoped to the slice (.wk)", () => {
    const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@"));
    expect(selectors.length).toBeGreaterThan(30);
    for (const sel of selectors) for (const part of sel.split(/,(?![^(]*\))/)) expect(part.trim(), sel).toMatch(/\.wk\b|\.wk__/);
  });
  it("declares no colour of its own, and every token it reads is defined in the layer", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/);
    const defined = new Set([...layer.matchAll(/(--cine-[\w-]+):/g)].map((m) => m[1]));
    const used = [...new Set([...css.matchAll(/var\((--cine-[\w-]+)/g)].map((m) => m[1]))];
    expect(used.filter((u) => !defined.has(u))).toEqual([]);
  });
  it("the round-5 and round-6 additions to the layer are marked, and the new values are named for review", () => {
    const round5 = layer.slice(layer.indexOf("Added by the Work slice"), layer.indexOf("Added by the carousel"));
    expect(round5.match(/NEW:/g)).toHaveLength(2);
    for (const t of ["--cine-lift", "--cine-glow-lift"]) expect(round5).toMatch(new RegExp(`${t}: [^;]+;\\s*/\\* NEW:`));
    const round6 = layer.slice(layer.indexOf("Added by the carousel"), layer.indexOf("/* The shared names"));
    expect(round6.match(/NEW:/g)).toHaveLength(3);
    for (const t of ["--cine-flow-turn", "--cine-flow-scale", "--cine-flow-dim"]) expect(round6).toMatch(new RegExp(`${t}: [^;]+;\\s*/\\* NEW:`));
    expect(round6).toMatch(/--cine-dur-move: var\(--dur-slow\);/);   // the site's own timing
  });
  it("lives under the /lab layout (noindex) and nothing on the live page links to it", () => {
    expect(fs.existsSync("app/lab/layout.tsx")).toBe(true);
    for (const f of ["app/page.tsx", "app/sitemap.ts", "app/robots.ts"]) expect(read(f), f).not.toMatch(/lab\/work/);
  });
});
