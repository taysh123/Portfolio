// Aegis is the canonical name; the rebrand is complete (repository renamed to taysh123/aegis, new screenshots).
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects, publicRepoUrl } from "@/data/projects";
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

it("the case study shows only the clean crop of the Incidents board, and no full Aegis capture is public", async () => {
  const p = projects.find((x) => x.id === "aegis")!;
  expect(p.media!.image).toBe("/projects/aegis/incident-board-open.webp");
  expect(p.media!.gallery ?? []).toEqual([]);
  const m = await sharp(path.join("public", p.media!.image!)).metadata();
  expect([m.format, `${m.width}x${m.height}`]).toEqual(["webp", "1108x623"]);
  expect(p.media!.alt!).toMatch(/Privilege escalation on workstation/);
  // The excluded captures (demo credentials, a placeholder agent ID, mock-provider text and its /100 score, the
  // contradictory incident tags, the overstated diagram) are served at no path, under their names or any other.
  expect(fs.readdirSync("public/projects/aegis")).toEqual(["incident-board-open.webp"]);
  const pub = files("public").map((f) => path.basename(f));
  for (const n of ["01-login", "02-demo-analyst", "03-google-login", "04-dashboard", "05-live-alerts", "06-ai-analysis",
    "07-settings-ai-mode", "08-incident-kanban", "09-incident-detail", "10-realtime-updates", "11-architecture-overview"])
    expect(pub.filter((f) => f.startsWith(n)), n).toEqual([]);
  // Every Aegis image is cut from the captures kept outside public/ (M10_CAPTURES).
  const script = fs.readFileSync("scripts/m10-images.mjs", "utf8");
  expect(script).toMatch(/name: "aegis-alerts", src: capture\("aegis\/05-live-alerts\.webp"\)/);
  expect(script).toMatch(/name: "hero-aegis", src: capture\("aegis\/08-incident-kanban\.png"\)/);
  expect(script).not.toMatch(/\$\{P\}\/aegis\/\d/);
});
