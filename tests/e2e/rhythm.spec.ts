// tests/e2e/rhythm.spec.ts — M2b: the sections between and after the chapters.
import { test, expect } from "playwright/test";

test("the work opener lists the four chapters, each linking to its scene, numbered like the chapters", async ({ page }) => {
  await page.goto("/");
  const toc = page.getByRole("navigation", { name: "Flagship chapters" });
  await expect(toc.getByRole("link")).toHaveText(["01T Poker", "02Aegis", "03DeveloperOS", "04GRAVITY FLOW"]);
  for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) {
    await expect(toc.locator(`a[href="#work-${id}"]`)).toHaveCount(1);
    await expect(page.locator(`#work-${id}`)).toHaveCount(1);
  }
});

test("phones: no blank screen between the work opener and chapter 01", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const gap = await page.evaluate(() => document.querySelector("#work-poker [data-chapter-num]")!.getBoundingClientRect().top - document.querySelector(".work-intro__toc")!.getBoundingClientRect().bottom);
  expect(gap).toBeLessThan(200);
});

test("about: the first paragraph's idea leads at display scale, and the facts read value-first on one line", async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    const idea = (await page.locator(".about__idea").textContent())!.replace(/\.$/, "").toLowerCase();
    expect((await page.locator("#about .about__p").first().textContent())!.toLowerCase()).toContain(idea);
    const facts = await page.locator(".about__fact").evaluateAll((els) => els.map((e) => ({ v: e.querySelector("dd")!.getBoundingClientRect().top, above: e.querySelector("dd")!.getBoundingClientRect().bottom <= e.querySelector("dt")!.getBoundingClientRect().top + 1 })));
    for (const f of facts) expect(f.above).toBe(true);
    const rows = w >= 640 ? [facts] : [facts.slice(0, 2), facts.slice(2)];
    for (const r of rows) expect(Math.max(...r.map((f) => f.v)) - Math.min(...r.map((f) => f.v))).toBeLessThanOrEqual(1);
  }
});

test("stack: a matrix — every group is one row with its tools as a typeset list and its evidence", async ({ page }) => {
  await page.goto("/");
  const rows = page.locator("#skills .stack-row");
  await expect(rows).toHaveCount(6);
  for (const r of await rows.all()) {
    await expect(r.locator(".stack-row__items li").first()).toBeVisible();
    await expect(r.locator(".stack-row__evidence")).not.toBeEmpty();
    // tools are text, not bordered chips
    expect(await r.locator(".stack-row__items li").first().evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe("0px");
  }
  // one row per group at desktop: name, tools and evidence share a top line
  const tops = await rows.first().evaluate((r) => [".stack-row__name", ".stack-row__items", ".stack-row__proof"].map((s) => Math.round(r.querySelector(s)!.getBoundingClientRect().top)));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(6);
});

test("contact: four channels in one recipe — label and value — the phone still behind a tap", async ({ page }) => {
  await page.goto("/");
  const ch = page.locator("#contact .contact__channel");
  await expect(ch).toHaveCount(4);
  await expect(ch.nth(0)).toContainText("taysh123");
  await expect(ch.nth(2)).toContainText("tayshofer05@gmail.com");
  await expect(page.locator("#contact")).not.toContainText("818");          // the number is not in the page until tapped
  for (const c of await ch.all()) expect((await c.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});
