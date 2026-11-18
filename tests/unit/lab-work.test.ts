// tests/unit/lab-work.test.ts — the Work slice in the cinematic language (PROTOTYPE, round 5; D2 reopened by Tay,
// 2026-11-18). Branch proto/hero-a-cinematic only, never merged. Every visible fact must come from the site's own data,
// private repositories stay labels, and the slice stays inside the lab's .cine layer.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL } from "@/data/projects";
import { flagships } from "@/data/work";
import { IMAGES } from "@/data/images";
import { dict } from "@/lib/dict";
import { panels, DOS_CHIPS } from "@/app/lab/work/panels";
import { privateRepoLeaks } from "../support/private-repo";
import { namesAny } from "../support/institution";

const read = (f: string) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const page = read("app/lab/work/page.tsx");
const css = read("app/lab/work/work.css");
const data = read("app/lab/work/panels.ts");
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
    const copy = [...page.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/className="[^"]*"/g, "").matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join(" ");
    expect(copy).not.toMatch(/\d/);
  });
});

describe("real captures", () => {
  it("each panel shows an existing capture from public/work, with its real dimensions reserved", () => {
    for (const p of panels) {
      const im = IMAGES[p.capture.image];
      expect(im, p.id).toBeDefined();
      for (const w of im.widths) for (const ext of ["avif", "webp"]) expect(fs.existsSync(`public/work/${p.capture.image}-${w}.${ext}`), `${p.capture.image}-${w}.${ext}`).toBe(true);
    }
    expect(page).toMatch(/<Pic name=\{p\.capture\.image\}/);   // Pic writes width and height from data/images.ts
  });
  it("alt text is the site's own, already reviewed: lib/dict.ts or the project's media", () => {
    const by = Object.fromEntries(panels.map((p) => [p.id, p.capture.alt]));
    expect(by.poker).toBe(dict.poker.alts[1]);
    expect(by.aegis).toBe(project("aegis").media!.alt);
    expect(by["gravity-flow"]).toBe(dict.gf.alt);
    expect(by.developeros).toBe(dict.dos.alt.replace("{chips}", DOS_CHIPS.join(", ")));
    for (const a of Object.values(by)) expect(a).not.toMatch(/\{\w+\}/);   // no unfilled placeholder
  });
  it("the DeveloperOS chips are the live chapter's own (copied, because the chapter does not export them)", () => {
    const chapter = read("components/work/DeveloperOSChapter.tsx");
    expect([...chapter.slice(chapter.indexOf("const CHIPS")).matchAll(/label: "([^"]+)"/g)].slice(0, 3).map((m) => m[1])).toEqual(DOS_CHIPS);
  });
  it("only the first capture loads eagerly (high priority); the rest are lazy", () => {
    expect(page).toMatch(/priority=\{i === 0 \? "high" : undefined\}/);
  });
});

describe("structure", () => {
  it("leaves one labelled, empty, hidden slot per panel for the P4 demo: no demo and no placeholder", () => {
    expect(page).toMatch(/\{\/\* P4: the "try it" demo mounts here[\s\S]*?\*\/\}\n\s*<div className="wk__demo" data-demo-slot=\{p\.id\} hidden \/>/);
    expect(page.match(/data-demo-slot/g)).toHaveLength(1);   // one per panel, from the map
  });
  it("ships no client code of its own: a server component, no canvas, no effect", () => {
    for (const t of [page, data]) expect(t).not.toMatch(/^["']use client["']|useEffect|<canvas|getContext/m);
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
  it("the round-5 additions to the layer are marked, and the new values are named for review", () => {
    const added = layer.slice(layer.indexOf("Added by the Work slice"), layer.indexOf("/* The shared names"));
    expect(added.match(/NEW:/g)).toHaveLength(2);
    for (const t of ["--cine-lift", "--cine-glow-lift"]) expect(added).toMatch(new RegExp(`${t}: [^;]+;\\s*/\\* NEW:`));
  });
  it("lives under the /lab layout (noindex) and nothing on the live page links to it", () => {
    expect(fs.existsSync("app/lab/layout.tsx")).toBe(true);
    for (const f of ["app/page.tsx", "app/sitemap.ts", "app/robots.ts"]) expect(read(f), f).not.toMatch(/lab\/work/);
  });
});
