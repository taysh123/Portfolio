// tests/e2e/chapters.spec.ts — the products' depth on / (the release, R1–R15): the jump to each product's panel, and the
// case-study dialog its "Case study" button opens (R4). The Product Plates chapters this file was written for (M10) are
// gone, with their four explainers (R6); S20 retired their tests (R12) and kept what still applies to /. To restore an
// explainer: docs/ROADMAP.md, "P4 restore record".
import { test, expect } from "playwright/test";
import { open, CHAPTERS } from "../support/page";

test.describe("Navigation", () => {
  for (const vp of [[1440, 900], [1280, 720], [390, 844]] as const) {
    test(`${vp[0]}×${vp[1]}: a jump lands the settled panel under the header, its Case study button visible and opaque at once`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp, { motion: true });
      for (const id of CHAPTERS) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
        await page.evaluate((id) => { location.hash = `#work-${id}`; }, id);
        await expect.poll(() => page.evaluate((id) => Math.abs(document.getElementById(`work-${id}`)!.getBoundingClientRect().top - document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom), id), { message: id, timeout: 5000 }).toBeLessThan(1);
        // Nothing in the panel is still moving or fading in: the layout is final the moment it lands.
        const settled = await page.locator(`#work-${id}`).evaluate((s) => [...s.querySelectorAll<HTMLElement>("*")].every((e) => { const cs = getComputedStyle(e); return cs.opacity !== "0" || e.closest("[aria-hidden=true], .sr-only"); }) && s.getAnimations({ subtree: true }).length === 0);
        expect(settled, id).toBe(true);
        // The panel's action, scrolled to, is clear of the sticky header and is the element under its own centre.
        const btn = page.locator(`#work-${id} button[data-case-study]`);
        await btn.scrollIntoViewIfNeeded();
        expect(await btn.evaluate((b) => { const r = b.getBoundingClientRect(), nav = document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom;
          return r.top >= nav && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest("button") === b && getComputedStyle(b).opacity === "1"; }), id).toBe(true);
      }
      await ctx.close();
    });
  }
});

test.describe("Case study", () => {
  test("Enter opens, Escape closes, focus returns to the opener — loaded on demand", async ({ page }) => {
    const chunks: string[] = []; page.on("response", (r) => { if (r.url().endsWith(".js")) chunks.push(r.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    const before = chunks.length;
    const opener = page.locator("button[data-case-study='developeros']");
    await opener.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(chunks.length).toBeGreaterThan(before);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("triggers: six native buttons that announce a dialog and open with Space and Enter", async ({ page }) => {
    await page.goto("/");
    const triggers = page.locator("button[data-case-study]");
    await expect(triggers).toHaveCount(6);
    for (const t of await triggers.all()) await expect(t).toHaveAttribute("aria-haspopup", "dialog");
    for (const key of ["Space", "Enter"]) {
      const t = page.locator("button[data-case-study='aegis']"); await t.focus(); await page.keyboard.press(key);
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toBeHidden(); await expect(t).toBeFocused();
    }
  });

  test("a press made before hydration is not lost", async ({ page }) => {
    let release!: () => void; const gate = new Promise<void>((r) => (release = r));
    await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => { await gate; await route.continue(); });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const opener = page.locator("button[data-case-study='aegis']");
    await opener.scrollIntoViewIfNeeded(); await opener.click();
    expect(await page.evaluate(() => (window as unknown as { __csReady?: boolean }).__csReady)).toBeFalsy();
    release();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("dialog")).toContainText("Aegis");
  });

  test("every case study's images finish loading", async ({ page }) => {
    await page.goto("/");
    for (const id of ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"]) {
      const opener = page.locator(`button[data-case-study='${id}']`); await opener.scrollIntoViewIfNeeded(); await opener.click();
      const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible();
      for (const img of await dialog.locator("img").all()) { await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0), { timeout: 15000, message: id }).toBe(true); }
      await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });
});

// Ported in S20 from the retired chapters' tests: what they checked that still exists on /, on the panels and in the
// case studies the panels open.
test.describe("What the chapters said, on the panels and in the case studies", () => {
  test("T Poker ships where it says: the web app and the private-repository label on its panel, both live store listings in its case study, no retired figures", async ({ page }) => {
    await page.goto("/");
    const ch = page.locator("#work-poker");
    await expect(ch.locator('a[href="https://app.tpoker.app/"]')).toHaveCount(1);
    await expect(ch.locator("[data-private-repo]")).toHaveText("Private repository");
    await ch.locator("button[data-case-study]").click();
    const panel = page.getByRole("dialog");
    await expect(panel.getByRole("heading", { name: "T Poker", exact: true })).toBeVisible();
    await expect(panel.locator('a[href="https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023"]')).toHaveCount(1);
    await expect(panel.locator('a[href="https://play.google.com/store/apps/details?id=com.tpoker.app"]')).toHaveCount(1);
    await expect(panel.getByRole("link", { name: /App Store — T Poker/ }).first()).toBeVisible();
    await expect(panel.getByRole("link", { name: /Google Play — T Poker/ })).toHaveCount(1);
    await expect(panel).not.toContainText("6,210"); await expect(panel).not.toContainText(/CI jobs/);
  });

  test("Aegis: the case study renames the score decision and keeps the honest schema note", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work-aegis button[data-case-study]").click();
    const panel = page.getByRole("dialog");
    await expect(panel).not.toContainText("Threat scores you can argue with");
    await expect(panel).toContainText("A score that keeps its inputs");
    await expect(panel).toContainText("share one PostgreSQL schema");
    await expect(page.locator("#work-aegis")).not.toContainText(/open source/i);
  });

  test("DeveloperOS: Source on GitHub links the repository", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work-developeros").getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute("href", "https://github.com/taysh123/DeveloperOS");
  });

  test("GRAVITY FLOW: a release candidate, with no test count or physics claim, and no store link", async ({ page }) => {
    await page.goto("/");
    const ch = page.locator("#work-gravity-flow");
    await expect(ch.locator(".wk__status")).toContainText("Release candidate");
    expect(await ch.textContent()).not.toMatch(/\btests?\b|1,277|hand-tuned|precise|accurate|fair physics/i);
    await expect(ch.locator('a[href*="play.google.com"], a[href*="apps.apple.com"]')).toHaveCount(0);
  });
});
