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
  it("requires provenance on a final (1920) set", () => {
    const m = man(); m.landscape.width = 1920;
    expect(validateManifest(m)).toEqual(expect.arrayContaining(["final set: sources must hash data/projects.ts", "final set: verifyCounts must be recorded"]));
    m.sources = { "data/projects.ts": "ab" }; m.verifyCounts = { Aegis: 105 };
    expect(validateManifest(m)).toEqual([]);
  });
});

