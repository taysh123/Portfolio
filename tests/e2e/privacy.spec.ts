// tests/e2e/privacy.spec.ts — the Privacy page and the chat's disclosure (the owner's decision, 2026-10-13): reachable
// from the footer and the chat panel, English, accessible, and saying only what the site actually does.
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open } from "../support/page";

const DISCLOSURE = "AI answers are generated via Groq. Please don't share personal or sensitive information.";
const AXE = () => fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const axe = (page: import("playwright/test").Page) => page.evaluate(async () => {
  const r = await (window as unknown as { axe: { run: (d: Document, o: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe.run(document,
    { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } });
  return r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
});

test("the footer links to the Privacy page, which is English, titled, canonical and sets no cookie", async ({ page, context }) => {
  await page.goto("/");
  const link = page.locator("footer").getByRole("link", { name: "Privacy", exact: true });
  await expect(link).toHaveAttribute("href", "/privacy");
  const res = await page.goto("/privacy");
  expect(res!.status()).toBe(200);
  await expect(page).toHaveTitle("Privacy · Tay Shofer");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("Privacy");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://tayshofer.dev/privacy");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://tayshofer.dev/privacy");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Privacy · Tay Shofer");
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https:\/\/tayshofer\.dev\/opengraph-image/);
  const back = page.getByRole("link", { name: "Back to the portfolio" });
  await expect(back).toHaveCount(2);
  await expect(back.first()).toHaveAttribute("href", "/");
  expect(await page.locator("main").innerText()).not.toMatch(/[←→]/);   // the arrow is the site's own SVG icon, not a glyph
  expect(await context.cookies()).toEqual([]);
});

test("the Privacy page says what the site does — the chat via Groq, logs, the two preference cookies, no tracking", async ({ page }) => {
  await page.goto("/privacy");
  const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  for (const s of ["passes them to Groq", "doesn't save the conversation", "five questions a minute", "one-way fingerprint of your latest question",
    "none are written to disk or logged", "hosted on Vercel", "Visiting sets no cookies",
    "no analytics, advertising or tracking", "loads no third-party scripts or fonts", "Please don't share personal or sensitive information"])
    expect(text, s).toContain(s);
  await expect(page.locator("main code")).toHaveText(["theme", "a11y"]);
  // Every outbound link opens safely and says so; no Hebrew, no phone number, no tel: link.
  for (const l of await page.locator('main a[target="_blank"]').all()) {
    await expect(l).toHaveAttribute("rel", "noopener noreferrer");
    expect(await l.textContent()).toMatch(/opens in a new tab/);
  }
  await expect(page.locator('main a[target="_blank"]')).toHaveCount(2);
  expect(text).not.toMatch(/[֐-׿]/);
  expect(text).not.toMatch(/\+972|\b05\d[\s-]?\d{3}[\s-]?\d{4}\b/);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test("the chat panel shows the disclosure under the field, with a Privacy link that opens beside the conversation", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp);
    await page.locator("[data-chat-launcher]").click();
    const d = page.getByRole("dialog", { name: "Ask Tay AI" });
    const note = d.locator("[data-chat-disclosure]");
    await expect(note).toBeVisible();
    // The visible words, then the link (its hidden "(opens in a new tab)" is read out by screen readers).
    expect((await note.innerText()).replace(/\s+/g, " ").trim()).toBe(`${DISCLOSURE} Privacy (opens in a new tab)`);
    const link = note.getByRole("link", { name: "Privacy (opens in a new tab)" });
    await expect(link).toHaveAttribute("href", "/privacy");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // The original greeting is unchanged, and the note sits below the field, inside the panel.
    await expect(d.locator("[data-chat-transcript]")).toContainText("Ask me anything about Tay's projects, stack, or how he works.");
    const [field, n, panel] = await Promise.all([d.getByRole("textbox").boundingBox(), note.boundingBox(), d.boundingBox()]);
    expect(n!.y).toBeGreaterThan(field!.y + field!.height - 1);
    expect(n!.y + n!.height).toBeLessThanOrEqual(panel!.y + panel!.height + 1);
    expect(await note.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(12);
    await ctx.close();
  }
});

test("axe: the Privacy page has no WCAG 2.2 A/AA or best-practice violations — light and dark, 1440 and 390", async ({ browser }) => {
  for (const theme of ["light", "dark"] as const) for (const vp of [[1440, 900], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp, { theme });
    await page.goto("/privacy", { waitUntil: "networkidle" });
    await page.addScriptTag({ content: AXE() });
    expect(await axe(page), `${theme} ${vp[0]}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${theme} ${vp[0]} overflow`).toBe(0);
    await ctx.close();
  }
});
