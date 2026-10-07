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
  // MANIFEST=public/entrance-final/manifest.json validates the final set before the swap (Plan 2 Task 10 Step 4).
  const real = process.env.MANIFEST ?? "public/entrance/manifest.json";
  const dir = real.replace(/\/manifest\.json$/, "");
  it.skipIf(!fs.existsSync(real))(`the manifest at ${real} is valid and every file of every tier exists`, () => {
    const m = JSON.parse(fs.readFileSync(real, "utf8")) as Manifest;
    expect(validateManifest(m)).toEqual([]);
    expect(m.landscape.webp, "landscape (desktop, Retina) stays AVIF").toBeUndefined();
    for (const k of ["landscape", "portrait"] as const) {
      for (const t of m[k].tiers) for (const f of m[k].frames) expect(fs.existsSync(`${dir}/${k}/${t}/${f.file}.avif`), `${k}/${t}/${f.file}`).toBe(true);
      if (m[k].video) for (const ext of ["mp4", "webm"]) expect(fs.existsSync(`${dir}/${k}/scrub.${ext}`), `${k}/scrub.${ext}`).toBe(true);
      for (const t of m[k].webp ?? []) {
        expect(m[k].tiers, `${k} webp ${t} must be an AVIF tier too`).toContain(t);
        for (const f of m[k].frames) expect(fs.existsSync(`${dir}/${k}/${t}/${f.file}.webp`), `${k}/${t}/${f.file}.webp`).toBe(true);
      }
      for (const x of [m[k].poster, m[k].still]) for (const ext of ["avif", "jpg"]) expect(fs.existsSync(`${dir}/${x}.${ext}`), `${x}.${ext}`).toBe(true);
    }
  });
  it("requires provenance on a final (1920) set", () => {
    const m = man(); m.landscape.width = 1920;
    expect(validateManifest(m)).toEqual(["final set: sources must hash data/projects.ts"]);
    m.sources = { "data/projects.ts": "ab" };
    expect(validateManifest(m)).toEqual([]);
    // counts are optional (the v2 film draws none) but never recorded empty
    m.verifyCounts = {};
    expect(validateManifest(m)).toEqual(["final set: verifyCounts, when recorded, must not be empty"]);
    m.verifyCounts = { Aegis: 105 };
    expect(validateManifest(m)).toEqual([]);
  });
});

