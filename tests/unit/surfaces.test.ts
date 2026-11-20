// tests/unit/surfaces.test.ts — the dark surfaces outside the page (R3, R8; S21+S22): the token mirror that the social
// card, the browser chrome and the manifest read, held equal to the layer's own values.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { cine } from "@/lib/tokens";

const layer = fs.readFileSync("app/cinematic.css", "utf8");
/** A token's first definition in the layer: the base value (a later one is the high-contrast override). */
const token = (name: string) => layer.match(new RegExp(`--cine-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1]?.toLowerCase();

describe("the dark surfaces outside the page (R3, R8)", () => {
  it("lib/tokens.ts mirrors the layer's field and inks exactly", () => {
    for (const [k, v] of Object.entries(cine)) expect(v, k).toBe(token(k));
    // The field is the body's colour on / (the layer's root rule).
    expect(layer).toMatch(/:root:has\(\.cine\), body:has\(\.cine\) \{ background-color: #04060d; \}/);
  });
  it("the browser chrome and the manifest take the field's colour, and the colour scheme is dark only", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const m = manifest();
    expect(m.theme_color).toBe(cine.abyss);
    expect(m.background_color).toBe(cine.abyss);
    const root = fs.readFileSync("app/layout.tsx", "utf8");
    expect(root).toMatch(/themeColor: cine\.abyss,/);
    expect(root).toMatch(/colorScheme: "dark",/);
  });
  it("the social card draws siteMeta's h1 and the four names, and no state, figure or availability", () => {
    const card = fs.readFileSync("app/opengraph-image.tsx", "utf8");
    expect(card).toMatch(/siteMeta\.headlineLines\[0\]/);
    expect(card).toMatch(/siteMeta\.headlineLines\[1\]/);
    expect(card).toMatch(/export const alt = `\$\{siteMeta\.name\} — \$\{siteMeta\.headline\}`;/);
    expect(card).toMatch(/heroIndex\.map\(\(x\) => \(\s*<span key=\{x\.id\}[^>]*>\{run\(x\.name\)\}<\/span>/);
    expect(card).not.toMatch(/x\.state|indexState|availability\.|stateLines/);
  });
});
