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
it("M10: no WebGL and no 3D runtime anywhere — three is not a dependency, and no studio engine or palette remains", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const dep of ["three", "@types/three", "lenis"]) { expect(pkg.dependencies?.[dep], dep).toBeUndefined(); expect(pkg.devDependencies?.[dep], dep).toBeUndefined(); }
  expect(all).not.toMatch(/from\s*["']three["']|getContext\(\s*["']webgl|WebGLRenderer/);
  // The chat came back on 2026-10-13 (the owner's decision) as components/chat/ + app/api/chat — not as the old
  // header-anchored AIChatWidget, which stays gone.
  for (const p of ["lib/studio", "components/studio", "data/studio.ts", "public/studio", "components/ui/CommandPalette.tsx", "components/ui/AIChatWidget.tsx", "lib/palette.ts", "components/scenes", "app/e2e-fixtures"])
    expect(fs.existsSync(p), p).toBe(false);
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
