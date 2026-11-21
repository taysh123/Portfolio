// tests/unit/about.test.ts
import { it, expect } from "vitest";
import fs from "node:fs";
import { about } from "@/data/about";

// Tay, 2026-11-21, copy pass: the title, the body and the degree's year.
it("uses Tay's title and facts line (copy pass, 2026-11-21)", () => {
  expect(about.title).toEqual(["Solid foundations.", "Real products."]);
  // The degree and its year alone: the site names no institution (the owner's decision).
  expect(about.facts).toEqual(["B.Sc. in Computer Science (2026)", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
});
it("carries Tay's About body verbatim (copy pass, 2026-11-21)", () => {
  expect(about.body).toBe("I'm a Computer Science graduate who builds dependable software, from the first design to production. I work across the stack: C#/.NET and ASP.NET Core, TypeScript with React and React Native, Python, Java and SQL, with PostgreSQL, Redis, RabbitMQ and Docker behind them, and local models through Ollama.");
});
it("is two sentences with no new claims: no counts at all (spec §5.3)", () => {
  expect(about.body.split(/(?<=\.)\s+/)).toHaveLength(2);
  expect(about.body).not.toMatch(/\d/);
  expect(about.body).not.toMatch(/6\+|shipped projects/i);
});
it("the 3D workstation render and its caption are gone: no 'Where the work happens', no 'A 3D render, built in code.' anywhere", () => {
  for (const d of ["components", "data", "app", "lib"]) for (const f of (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.(tsx?|css)$/.test(f))) {
    const t = fs.readFileSync(`${d}/${f}`, "utf8");
    expect(t, `${d}/${f}`).not.toMatch(/Where the work happens|A 3D render, built in code|about-studio/);
  }
  expect(fs.readdirSync("public/work").filter((f) => f.startsWith("about-studio"))).toEqual([]);
});
it("the visual names the four products in its one accessible label", () => {
  for (const name of ["Aegis", "DeveloperOS", "GRAVITY FLOW", "T Poker"]) expect(about.visual.label).toContain(name);
});
