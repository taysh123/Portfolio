// tests/unit/tokens.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";

// Line endings normalised: Git for Windows checks files out with CRLF (core.autocrlf), and the block lookups below
// search for "\n" (M9 review guide: this test alone failed on Windows).
const css = fs.readFileSync("app/globals.css", "utf8").replace(/\r\n/g, "\n");
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

// M10: light is the default (`:root`), dark is the visitor's choice.
const light = block(":root,\n[data-theme=\"light\"] {");
const dark = { ...light, ...block("[data-theme=\"dark\"] {\n") };

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


it("the shared names later sections use are declared (a reference to an undefined token fails silently)", () => {
  for (const name of ["--line", "--line-strong", "--ease-out", "--ease-in-out"]) expect(css, name).toMatch(new RegExp(`\\s${name}:\\s`));
});

/** A plate's own scope: its declarations, over the theme it sits in, with its --bg resolved from the plate token. */
function plate(sel: string, theme: Record<string, string>, extra: Record<string, string> = {}): Record<string, string> {
  const i = css.indexOf(sel); if (i < 0) throw new Error(`no plate ${sel}`);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  const own = Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
  const bgVar = body.match(/--bg:\s*var\(--([\w-]+)\)/)?.[1];
  return { ...theme, ...own, ...extra, bg: bgVar ? (extra[bgVar] ?? theme[bgVar]) : theme.bg };
}
const plates = {
  "T Poker": plate('.plate[data-plate="poker"][data-plate] {', dark),
  "Aegis, light": plate('[data-theme="light"] .plate[data-plate="aegis"][data-plate] {', light, { "plate-aegis": light["plate-aegis"] }),
  "Aegis, dark": plate('[data-theme="dark"] .plate[data-plate="aegis"][data-plate] {', dark, { "plate-aegis": dark["plate-aegis"] }),
  DeveloperOS: plate('.plate[data-plate="dos"][data-plate] {', dark),
  "GRAVITY FLOW": plate('.plate[data-plate="gf"][data-plate] {', dark),
};
for (const [name, t] of Object.entries(plates)) t.bg = name.startsWith("Aegis") ? t["plate-aegis"] : t.bg;

describe.each(Object.entries(plates))("%s plate keeps the page's floors", (_, t) => {
  it("text and the accent on the plate", () => {
    expect(ratio(t.fg, t.bg)).toBeGreaterThanOrEqual(15);
    expect(ratio(t["fg-muted"], t.bg)).toBeGreaterThanOrEqual(7);
    expect(ratio(t["fg-subtle"], t.bg)).toBeGreaterThanOrEqual(5.4);
    expect(ratio(t.accent, t.bg)).toBeGreaterThanOrEqual(4.5);
  });
});
it("brand colours on their plates: T Poker's gold, DeveloperOS's citation blue", () => {
  expect(ratio(light.gold, light["plate-poker"])).toBeGreaterThanOrEqual(4.5);
  expect(ratio(light.cite, light["plate-dos"])).toBeGreaterThanOrEqual(4.5);
});
