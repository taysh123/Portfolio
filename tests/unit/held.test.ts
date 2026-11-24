// lib/held.tsx: no line of the site starts with an em dash (Tay, 2026-11-24, copy pass B).
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import { Held, held, pieces } from "@/lib/held";
import { projects } from "@/data/projects";

const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const html = (text: string) => renderToStaticMarkup(createElement("p", null, held(text)));
const bare = (markup: string) => markup.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");

describe("held: each em dash is tied to the word before it, and the text stays word for word", () => {
  it("a text without one is returned as it is, with no markup", () => {
    for (const t of ["", "Plain words.", "0–1, a range", "full-stack"]) { expect(held(t)).toBe(t); expect(html(t)).toBe(`<p>${t}</p>`); }
  });
  it("ties the dash to its word: unspaced, spaced, several, and after punctuation", () => {
    expect(pieces("live feed—the row")).toEqual(["live ", "feed—", "the row"]);
    expect(pieces("limit abuse — five, no repeats — the")).toEqual(["limit ", "abuse —", " five, no ", "repeats —", " the"]);
    expect(pieces("a—b—c")).toEqual(["", "a—", "", "b—", "c"]);
    expect(pieces("(x)—y")).toEqual(["", "(x)—", "y"]);
    expect(html("live feed—the row")).toBe('<p>live <span class="whitespace-nowrap">feed—</span>the row</p>');
  });
  it("never reaches across a line of its own: a dash that opens a line stays there", () => {
    expect(pieces("one\n— two")).toEqual(["one\n— two"]);
    expect(pieces("— two")).toEqual(["— two"]);
  });
  it("every string the projects' data holds survives unchanged, with every dash tied", () => {
    const all = strings(projects).filter((s) => s.includes("—"));
    expect(all.length).toBeGreaterThan(40);
    for (const s of all) {
      expect(pieces(s).join("")).toBe(s);
      expect(bare(html(s))).toBe(s);
      expect(pieces(s).filter((_, i) => i % 2 === 0).join(""), s).not.toContain("—");
    }
  });
  it("Held does the same for text inside markup, and leaves the markup alone", () => {
    expect(renderToStaticMarkup(createElement("p", null, createElement(Held, null, "to limit abuse — five ", createElement("a", { href: "#" }, "link"), "."))))
      .toBe('<p>to limit <span class="whitespace-nowrap">abuse —</span> five <a href="#">link</a>.</p>');
  });
  it("is the one mechanism: no section or stylesheet ties a dash on its own", () => {
    for (const d of ["components", "app", "lib"]) for (const f of (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))) {
      const file = `${d}/${f.replaceAll("\\", "/")}`;
      if (file !== "lib/held.tsx") expect(fs.readFileSync(file, "utf8"), file).not.toMatch(/split\([^)]*—/);
    }
  });
});
