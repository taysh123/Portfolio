// tests/unit/tokens.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
function block(selectorStart: string): Record<string, string> {
  const i = css.indexOf(selectorStart); if (i < 0) throw new Error(`no block ${selectorStart}`);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("\n}", i));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
}
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const dark = block(":root,\n[data-theme=\"dark\"] {");
const light = block("[data-theme=\"light\"] {");

describe.each([["dark", dark], ["light", light]] as const)("%s theme contrast floors", (_, t) => {
  it("text on --bg", () => {
    expect(ratio(t.fg, t.bg)).toBeGreaterThanOrEqual(15);
    expect(ratio(t["fg-muted"], t.bg)).toBeGreaterThanOrEqual(7);
    expect(ratio(t["fg-subtle"], t.bg)).toBeGreaterThanOrEqual(5.4);   // the user-approved floor; never lower
    expect(ratio(t.accent, t.bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("labels on raised surfaces keep the same floor", () => {
    expect(ratio(t["fg-subtle-raised"], t["bg-raised"])).toBeGreaterThanOrEqual(5.4);
    expect(ratio(t["fg-muted"], t["bg-raised"])).toBeGreaterThanOrEqual(7);
  });
  it("white on the solid accent (primary buttons)", () => {
    expect(ratio("#ffffff", t["accent-solid"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#ffffff", t["accent-solid-hover"])).toBeGreaterThanOrEqual(4.5);
  });
});

it("--screen is the dark screen black in both themes", () => {
  expect(dark.screen.toLowerCase()).toBe("#05070a"); expect(light.screen.toLowerCase()).toBe("#05070a");
});

it("the shared names later sections use are declared (a reference to an undefined token fails silently)", () => {
  for (const name of ["--line", "--line-strong", "--ease-out", "--ease-in-out"]) expect(css, name).toMatch(new RegExp(`\\s${name}:\\s`));
});
