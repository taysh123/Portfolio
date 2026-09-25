// tests/e2e/sections.spec.ts
import { test, expect, type Page } from "playwright/test";
const skip = async (page: Page) => { await page.goto("/"); await page.locator("[data-skip-intro]").click(); };

// un-fixme in Task 17 (More Work supplies the last two h3s)
test.fixme("Work: one h2, four flagship h3s in order, then two more-work h3s", async ({ page }) => {
  await skip(page);
  await expect(page.locator("#work h2")).toHaveCount(1);
  await expect(page.locator("#work h3")).toHaveText(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW", "Job Assistant", "Orders & Delivery"]);
});

test("restored scroll inside a pinned flagship shows a legible composition (Review Focus 1)", async ({ page }) => {
  await skip(page);
  await page.evaluate(() => { const s = document.getElementById("work-aegis")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + s.offsetHeight * 0.4, behavior: "instant" as ScrollBehavior }); });
  await page.reload(); await page.waitForTimeout(600);
  // Scroll targets are always document-relative (getBoundingClientRect().top + scrollY): #work-* sits inside
  // the positioned .work__stage, so offsetTop would be off by the whole entrance height.
  const copy = page.locator("#work-aegis .flagship__copy");
  await expect(copy).toBeInViewport();
  expect(await copy.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(page.locator("#work-aegis h3")).toBeVisible();
});

test("case study: Enter opens, Escape closes, focus returns to the opener — loaded on demand (Review Focus 4)", async ({ page }) => {
  const chunks: string[] = []; page.on("response", (r) => { if (r.url().endsWith(".js")) chunks.push(r.url()); });
  await skip(page);
  const before = chunks.length;
  const opener = page.locator("button[data-case-study='developeros']");
  await opener.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(chunks.length).toBeGreaterThan(before);                       // the panel chunk arrived on demand
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();
});

test("copy never depends on scroll position: every flagship's copy is opaque at scene p = 0, .5 and 1", async ({ page }) => {
  await skip(page);
  for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) for (const f of [0.02, 0.5, 0.98]) {
    await page.evaluate(({ id, f }) => { const s = document.getElementById(`work-${id}`)!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, { id, f });
    await page.waitForTimeout(150);
    expect(await page.locator(`#work-${id} .flagship__copy`).evaluate((el) => getComputedStyle(el).opacity), `${id}@${f}`).toBe("1");
  }
});

test("poker world: three phones, the front one rises as the others fan (transform-only)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const at = async (f: number) => {
    await page.evaluate((f) => { const s = document.getElementById("work-poker")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, f);
    await page.waitForTimeout(200);
    return page.locator(".world-poker__phone").evaluateAll((els) => els.map((el) => new DOMMatrix(getComputedStyle(el).transform)));
  };
  await expect(page.locator(".world-poker__phone")).toHaveCount(3);
  const early = await at(0.02), held = await at(0.5);
  expect(held[1].m42).toBeLessThan(early[1].m42);                    // front phone (index 1) has risen
  expect(Math.abs(held[0].m41)).toBeGreaterThan(Math.abs(early[0].m41)); // side phones fanned out
  await expect(page.locator(".world-poker img").first()).toHaveAttribute("alt", /.+/);
});

test("aegis world: dashboard monitor, three alert rows, one scan pass per entry (not a loop)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.evaluate(() => document.getElementById("work-aegis")!.scrollIntoView());
  await expect(page.locator(".world-aegis__row")).toHaveCount(3);
  const scan = page.locator(".world-aegis__scan");
  await expect(scan).toHaveCSS("animation-name", "aegis-scan");      // the animation actually resolved (valid tokens)
  await expect(scan).toHaveCSS("animation-iteration-count", "1");
  await expect(page.locator(".world-aegis")).toContainText(/local demo/i);
});

test("developeros world: four windows converge as the scene assembles; the citation card is present", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const spread = async (f: number) => {
    await page.evaluate((f) => { const s = document.getElementById("work-developeros")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, f);
    await page.waitForTimeout(200);
    return page.locator(".world-dos__win").evaluateAll((els) => els.reduce((a, el) => a + Math.hypot(new DOMMatrix(getComputedStyle(el).transform).m41, new DOMMatrix(getComputedStyle(el).transform).m42), 0));
  };
  await expect(page.locator(".world-dos__win")).toHaveCount(4);
  expect(await spread(0.5)).toBeLessThan(await spread(0.02));    // converged
  await expect(page.locator(".world-dos__card")).toHaveText(/Grounded answers · file:line citations/);
});

test("gravity world: the field loops only while in view, and never under reduced motion (Review Focus 3)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const raf = (ms: number) => page.evaluate(async (ms) => { let n = 0; const o = requestAnimationFrame; window.requestAnimationFrame = (cb) => o((t) => { n++; cb(t); }); await new Promise((r) => setTimeout(r, ms)); window.requestAnimationFrame = o; return n; }, ms);
  await page.evaluate(() => document.getElementById("work-gravity-flow")!.scrollIntoView());
  await page.waitForTimeout(900);
  expect(await raf(1000)).toBeGreaterThan(20);                 // running in view
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.waitForTimeout(300);
  expect(await raf(1000)).toBe(0);                             // stopped under reduced motion
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => document.getElementById("contact")!.scrollIntoView()); await page.waitForTimeout(900);
  expect(await raf(1000)).toBe(0);                             // stopped out of view
  for (const img of await page.locator(".world-gravity img").all()) await expect(img).toHaveAttribute("alt", /.+/);  // every image
  await expect(page.locator(".world-gravity")).toContainText(/Android-only/);
});
