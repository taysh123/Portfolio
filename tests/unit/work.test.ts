// tests/unit/work.test.ts — every storytelling line is condensed from data/projects.ts; nothing new is claimed.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { flagships, moreWork, projectOf } from "@/data/work";

const numbers = (s: string) => (s.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]$/, ""));
const source = (id: string) => { const p = projectOf(id); return [p.tagline, p.summary, p.description, p.context, ...p.metrics.map((m) => `${m.value} ${m.label}`), p.caseStudy.honestNote ?? ""].join(" "); };

describe("flagships", () => {
  it("are the four spec §5.2 projects in order 01–04", () => {
    expect(flagships.map((f) => [f.number, f.id])).toEqual([["01", "poker"], ["02", "aegis"], ["03", "developeros"], ["04", "gravity-flow"]]);
  });
  it("every number in a kicker or story line appears in that project's data", () => {
    for (const f of [...flagships]) for (const line of [f.kicker, ...f.story, f.statusNote ?? ""])
      for (const n of numbers(line)) expect(source(f.id), `${f.id}: "${n}" in "${line}"`).toContain(n);
  });
  it("chosen metrics exist verbatim in the project's metrics", () => {
    for (const r of [...flagships, ...moreWork]) for (const l of r.metricLabels) expect(projectOf(r.id).metrics.map((m) => m.label)).toContain(l);
  });
  it("every world asset exists on disk", () => {
    for (const f of flagships) { const p = projectOf(f.id); for (const src of [p.media?.image, ...(p.media?.gallery ?? []).map((g) => g.src), f.worldAssets?.monitor, f.worldAssets?.rows?.src].filter(Boolean)) expect(fs.existsSync(`public${src}`), src).toBe(true); }
  });
  it("story lines are two sentences, each ending in a full stop", () => {
    for (const f of flagships) for (const s of f.story) expect(s).toMatch(/^[A-Z].*[.]$/);
  });
});
describe("more work", () => {
  it("is Job Assistant and Orders & Delivery with their real pipeline shapes", () => {
    expect(moreWork.map((r) => r.id)).toEqual(["job-assistant", "orders-delivery"]);
    expect(moreWork[0].diagram).toEqual({ kind: "pipeline", nodes: ["collect", "filter", "dedup", "deliver"] });
    expect(moreWork[1].diagram).toEqual({ kind: "duplex", nodes: ["client", "TCP", "server"] });
    expect(projectOf("orders-delivery").status).toBe("coursework");
  });
});

describe("chapters (M2)", () => {
  const json = (id: string) => JSON.stringify(projectOf(id)).toLowerCase().replace(/[-‑]/g, " ");
  it("every number in a built line appears in that project's data", () => {
    for (const f of flagships) for (const n of numbers(f.built)) expect(JSON.stringify(projectOf(f.id)), `${f.id}: "${n}"`).toContain(n);
  });
  it("every world annotation is a phrase from the project's own data or story", () => {
    for (const f of flagships) for (const note of f.notes) {
      const hay = json(f.id) + " " + f.story.join(" ").toLowerCase();
      expect(hay, `${f.id}: "${note}"`).toContain(note.toLowerCase().replace(/[-‑]/g, " "));
    }
  });
  it("layouts are four distinct expressions and the sides alternate", () => {
    expect(new Set(flagships.map((f) => f.layout)).size).toBe(4);
    expect(flagships.map((f) => f.side)).toEqual(["copy-left", "world-left", "copy-left", "world-left"]);
  });
  it("the derived DeveloperOS crops exist", () => {
    for (const f of ["search-citations", "refusal"]) expect(fs.existsSync(`public/projects/developeros/${f}.webp`)).toBe(true);
  });
});
