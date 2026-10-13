// tests/e2e/private-repo.spec.ts — T Poker's repository is private (user decision, 2026-09-26).
import { test, expect } from "playwright/test";
import { privateRepoLeaks } from "../support/private-repo";
import { projects, publicRepoUrl } from "../../data/projects";

// Every github.com/taysh123/<repo> link a visitor can reach must be a public project repository.
const PUBLIC_REPOS = new Set(projects.map(publicRepoUrl).filter(Boolean).map((u) => u!.toLowerCase()));

test("no page HTML, client script, route or source map carries the private repository", async ({ page }) => {
  const bodies: [string, string][] = [];
  page.on("response", async (r) => { if (/\.(js|json|map|txt|xml|html)(\?|$)|\/$|_rsc=/.test(r.url())) { try { bodies.push([r.url(), await r.text()]); } catch { /* redirects, opaque */ } } });
  await page.goto("/");
  // Open every lazy surface so its chunk is fetched too (M10: the case study and the accessibility panel).
  await page.getByRole("button", { name: "Accessibility settings" }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  const opener = page.locator("button[data-case-study='poker']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  for (const path of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf"]) { const r = await page.request.get(path); bodies.push([path, await r.text()]); }
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
  await page.goto("/");
  const label = page.locator("[data-private-repo]").first();
  await label.scrollIntoViewIfNeeded(); await expect(label).toHaveText("Private repository");
  expect(await label.evaluate((el) => el.closest("a,button") === null)).toBe(true);
  await expect(page.locator('a[href="https://app.tpoker.app/"]').first()).toBeAttached();
});

test("the T Poker case study shows the label, no source link, and keeps the live and App Store links", async ({ page }) => {
  await page.goto("/");
  await page.locator("#work-poker button[data-case-study]").click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "T Poker", exact: true })).toBeVisible();
  await expect(panel.locator("[data-private-repo]").first()).toHaveText("Private repository");
  await expect(panel.getByRole("link", { name: /source/i })).toHaveCount(0);
  await expect(panel.locator('a[href="https://app.tpoker.app/"]').first()).toBeVisible();
  await expect(panel.locator('a[href*="apps.apple.com"]').first()).toBeVisible();
});

// M9 audit A-D2: Orders & Delivery's repository stopped answering anonymous requests (private or removed — the two
// can't be told apart from outside), so its "Source on GitHub" link would have sent visitors to a 404.
test("Orders & Delivery: a plain 'Source not publicly accessible' label, no repository link, case study kept", async ({ page }) => {
  await page.goto("/");
  const row = page.locator(".more-work__row").filter({ hasText: "Orders & Delivery" });
  await row.scrollIntoViewIfNeeded();
  const label = row.locator("[data-private-repo]");
  await expect(label).toHaveText("Source not publicly accessible");
  expect(await label.evaluate((el) => el.closest("a,button") === null)).toBe(true);
  await expect(row.getByRole("link", { name: /source/i })).toHaveCount(0);
  expect(await page.content()).not.toMatch(/orders-delivery-management-system/i);
  await row.getByRole("button", { name: /case study/i }).click();
  const panel = page.getByRole("dialog");
  await expect(panel.locator("[data-private-repo]").first()).toHaveText("Source not publicly accessible");
  await expect(panel.getByRole("link", { name: /source/i })).toHaveCount(0);
});
