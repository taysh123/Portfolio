// Aegis is the canonical name of the project formerly called SentinelAI (user decision, 2026-09-26).
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects } from "@/data/projects";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]));

it("the project is Aegis, with its former name recorded once", () => {
  const p = projects.find((x) => x.id === "aegis");
  expect(p?.name).toBe("Aegis");
  expect(p?.formerly).toBe("SentinelAI");
  expect(projects.some((x) => /sentinel/i.test(x.id) || /sentinel/i.test(x.name))).toBe(false);
});

it("site source says SentinelAI only where a line explains the former name", () => {
  const src = ["app", "components", "data", "lib"].flatMap(files).filter((f) => /\.(tsx?|css)$/.test(f));
  const bad = src.flatMap((f) => fs.readFileSync(f, "utf8").split("\n").map((l, i) => ({ f, i: i + 1, l })))
    .filter(({ l }) => /SentinelAI/.test(l) && !/formerly|former name|captured before/i.test(l));
  expect(bad.map(({ f, i, l }) => `${f}:${i} ${l.trim()}`)).toEqual([]);
});

it("no display variant of the new name is used", () => {
  const src = ["app", "components", "data"].flatMap(files).filter((f) => /\.(tsx?)$/.test(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  expect(src).not.toMatch(/AegisAI|Aegis AI|Sentinel Aegis/);
});
