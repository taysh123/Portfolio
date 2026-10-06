// tests/e2e/private-repo.spec.ts — T Poker's repository is private (user decision, 2026-09-26).
import { test, expect } from "playwright/test";
import { privateRepoLeaks } from "../support/private-repo";
import { projects, publicRepoUrl } from "../../data/projects";

// Every github.com/taysh123/<repo> link a visitor can reach must be a public project repository.
const PUBLIC_REPOS = new Set(projects.map(publicRepoUrl).filter(Boolean).map((u) => u!.toLowerCase()));

test("no page HTML, client script, route or source map carries the private repository", async ({ page }) => {
  const bodies: [string, string][] = [];
  page.on("response", async (r) => { if (/\.(js|json|map|txt|xml|html)(\?|$)|\/$|_rsc=/.test(r.url())) { try { bodies.push([r.url(), await r.text()]); } catch { /* redirects, opaque */ } } });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  // Open every lazy surface so its chunk is fetched too.
  await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  const opener = page.locator("button[data-case-study='poker']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  for (const path of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"]) { const r = await page.request.get(path); bodies.push([path, await r.text()]); }
  const scripts = await page.locator("script[src]").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));
  expect(scripts.length).toBeGreaterThan(0);
  for (const s of scripts) { const m = await page.request.get(s + ".map"); if (m.ok()) bodies.push([s + ".map", await m.text()]); }
  bodies.push(["document", await page.content()]);
  const leaks = bodies.flatMap(([u, t]) => privateRepoLeaks(t).map((h) => `${u}: ${h}`));
  expect(leaks).toEqual([]);
  const repoLinks = bodies.flatMap(([, t]) => [...t.matchAll(/https:\/\/github\.com\/taysh123\/[\w.-]+/gi)].map((m) => m[0].toLowerCase()));
  expect(repoLinks.filter((u) => !PUBLIC_REPOS.has(u) && u !== "https://github.com/taysh123")).toEqual([]);
});

test("T Poker shows a non-clickable 'Private repository' label and keeps its live link", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const label = page.locator("[data-private-repo]").first();
  await label.scrollIntoViewIfNeeded(); await expect(label).toHaveText("Private repository");
  expect(await label.evaluate((el) => el.closest("a,button") === null)).toBe(true);
  await expect(page.locator('a[href="https://app.tpoker.app/"]').first()).toBeAttached();
});

test("the command palette offers no T Poker source entry, but keeps the live app", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("header[data-entrance-nav] nav").getByRole("button", { name: /command palette/i }).click();
  await page.getByRole("combobox", { name: "Search commands" }).fill("T Poker");
  const list = page.getByRole("listbox", { name: "Commands" });
  await expect(list.getByRole("option", { name: /T Poker — live/ })).toBeVisible();
  await expect(list.getByRole("option", { name: /Source on GitHub/ }).filter({ hasText: /^T Poker/ })).toHaveCount(0);
  await expect(list.getByRole("option").filter({ hasText: "Source on GitHub" })).toHaveCount(0);
});

test("the T Poker case study shows the label, no source link, and keeps the live and App Store links", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /case study/i }).filter({ hasText: /case study/i }).first().click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "T Poker" })).toBeVisible();
  await expect(panel.locator("[data-private-repo]").first()).toHaveText("Private repository");
  await expect(panel.getByRole("link", { name: /source/i })).toHaveCount(0);
  await expect(panel.locator('a[href="https://app.tpoker.app/"]').first()).toBeVisible();
  await expect(panel.locator('a[href*="apps.apple.com"]').first()).toBeVisible();
});
