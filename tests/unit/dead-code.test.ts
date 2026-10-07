// tests/unit/dead-code.test.ts
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]);
const src = [...files("app"), ...files("components"), ...files("lib")].filter((f) => /\.(tsx?|css)$/.test(f));
const all = src.map((f) => fs.readFileSync(f, "utf8")).join("\n");

it("every component module is imported by something", () => {
  const orphans = files("components").filter((f) => /\.tsx?$/.test(f)).filter((f) => {
    const base = path.basename(f).replace(/\.tsx?$/, "");
    // static `from ".../X"` or dynamic `import(".../X")` (CaseStudyPanel and GravityField are loaded only dynamically)
    return !new RegExp(`(from\\s*|import\\(\\s*)["'][^"']*/${base}["']`).test(all);
  });
  expect(orphans).toEqual([]);
});
it("three.js and the spike routes are gone", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  expect(pkg.dependencies?.three).toBeUndefined(); expect(pkg.devDependencies?.["@types/three"]).toBeUndefined();
  expect(fs.existsSync("app/gl-spike")).toBe(false); expect(fs.existsSync("app/render-studio")).toBe(false); expect(fs.existsSync("public/arrival")).toBe(false);
});
it("the e2e fixture route is never in the sitemap", () => {
  expect(fs.readFileSync("app/sitemap.ts", "utf8")).not.toMatch(/e2e-fixtures/);
});
it("the cinematic entrance is not in this build: no entrance assets, runtime or references", () => {
  expect(fs.existsSync("public/entrance")).toBe(false);
  expect(fs.existsSync("components/entrance")).toBe(false); expect(fs.existsSync("lib/entrance")).toBe(false);
  expect(all).not.toMatch(/\/entrance\/|EntranceStage|entrance:skip|data-entrance|data-skip-intro|entrance__/);
});
it("lib/textures.ts and the throwaway preview scene are gone", () => {
  expect(fs.existsSync("lib/textures.ts")).toBe(false); expect(fs.existsSync("design/render/blender/preview")).toBe(false);
});
