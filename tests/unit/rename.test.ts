// Aegis is the canonical name; the rebrand is complete (repository renamed to taysh123/aegis, new screenshots).
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects, publicRepoUrl } from "@/data/projects";
import { flagships } from "@/data/work";
import sharp from "sharp";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]));
const src = ["app", "components", "data", "lib"].flatMap(files).filter((f) => /\.(tsx?|css)$/.test(f));

it("the project is Aegis and links its renamed repository", () => {
  const p = projects.find((x) => x.id === "aegis")!;
  expect(p.name).toBe("Aegis");
  expect(publicRepoUrl(p)).toBe("https://github.com/taysh123/aegis");
  expect(projects.some((x) => /sentinel/i.test(x.id) || /sentinel/i.test(x.name))).toBe(false);
  expect(JSON.stringify(p)).not.toMatch(/sentinel/i);          // no "Formerly SentinelAI", no old alt text
});

it("the old repository URL appears nowhere in site source or the README", () => {
  for (const f of [...src, "README.md"]) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/github\.com\/taysh123\/SentinelAI/i);
});

it("site source says SentinelAI only in the chat's line mapping the former name to Aegis", () => {
  const bad = src.flatMap((f) => fs.readFileSync(f, "utf8").split("\n").map((l, i) => ({ f, i: i + 1, l })))
    .filter(({ l }) => /SentinelAI/i.test(l) && !/formerly named SentinelAI; treat questions about SentinelAI as questions about Aegis/.test(l));
  expect(bad.map(({ f, i, l }) => `${f}:${i} ${l.trim()}`)).toEqual([]);
});

it("no display variant of the new name is used", () => {
  const all = src.filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  expect(all).not.toMatch(/AegisAI|Aegis AI|Sentinel Aegis/);
});

it("the Aegis world and case study use the new captures, all present on disk as full-width WebP", async () => {
  const p = projects.find((x) => x.id === "aegis")!, a = flagships.find((f) => f.id === "aegis")!.worldAssets!;
  const srcs: string[] = [p.media!.image!, ...p.media!.gallery!.map((g) => g.src), a.monitor, a.rows!.src];
  expect(p.media!.gallery!.map((g) => g.src)).toEqual(["05-live-alerts", "06-ai-analysis", "08-incident-kanban", "09-incident-detail", "11-architecture-overview"].map((n) => `/projects/aegis/${n}.webp`));
  for (const s of srcs) {
    const m = await sharp(path.join("public", s)).metadata();
    const w = m.width, h = m.height; expect(m.format, s).toBe("webp");
    expect(`${w}x${h}`, s).toBe(s.endsWith("11-architecture-overview.webp") ? "3840x1440" : "3840x2160");
  }
  for (const g of p.media!.gallery!) expect(g.alt.length, g.src).toBeGreaterThan(20);
  expect(fs.readdirSync("public/projects/aegis").sort()).toEqual(["04-dashboard.webp", "05-live-alerts.webp", "06-ai-analysis.webp", "08-incident-kanban.webp", "09-incident-detail.webp", "11-architecture-overview.webp"]);
});
