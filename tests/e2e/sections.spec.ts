// tests/e2e/sections.spec.ts
import { test, expect, type Page } from "playwright/test";
const skip = async (page: Page) => { await page.goto("/"); await page.locator("[data-skip-intro]").click(); };

test("Work: one h2, four flagship h3s in order, then two more-work h3s", async ({ page }) => {
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

test("more work: two unpinned rows with their pipeline diagrams, and the coursework label", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const rows = page.locator(".more-work__row");
  await expect(rows).toHaveCount(2);
  // Exactly one drawing is displayed per row (across on wide rows, down on phones).
  await expect(rows.nth(0).locator("svg:visible")).toHaveCount(1);
  await expect(rows.nth(0).locator("svg:visible text")).toHaveText(["collect", "filter", "dedup", "deliver"]);
  await expect(rows.nth(1).locator("svg:visible text")).toHaveText(["client", "TCP", "server"]);
  await expect(rows.nth(1)).toContainText("Coursework");
  await expect(page.locator(".more-work .scene")).toHaveCount(0);          // never pinned
});

test("more work on a phone: the pipeline is drawn down the column, labels at a legible size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const svg = page.locator(".more-work__row").nth(0).locator("svg:visible");
  await expect(svg).toHaveCount(1); await expect(svg).toHaveClass(/pipeline--v/);
  const px = await svg.evaluate((el) => { const t = el.querySelector("text")!; return t.getBoundingClientRect().height; });
  expect(px).toBeGreaterThanOrEqual(11);                                   // rendered glyph box, not the nominal size
  await expect(page.getByRole("img", { name: /Job Assistant: collect → filter → dedup → deliver/ })).toHaveCount(1);
});

test("about: the spec §5.3 title and the approved facts row, in order", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#about h2")).toContainText("Builder by nature.");
  await expect(page.locator("#about dd")).toHaveText(["B.Sc.", "Full stack", "Israel", "∞"]);
});

test("about: no horizontal overflow at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("#about").scrollIntoViewIfNeeded();
  expect(await page.locator("#about").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test("stack: six groups in data order, the two lead groups are wide with their figures", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#skills h2")).toHaveText("The tools I build with.");
  await expect(page.locator("#skills")).toContainText("Enough range to own a product end to end.");
  await expect(page.locator("#skills [data-card] h3")).toHaveText(["Languages", "Interface", "Services & APIs", "Data & State", "Delivery", "Verification"]);
  await expect(page.locator("#skills [data-card][data-wide]")).toHaveCount(2);
  await expect(page.locator("#skills [data-card][data-wide]").nth(1)).toContainText("1,742");
});

test("pointer light follows the hovered card only, and not under reduced motion", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const card = page.locator("#skills [data-card]").first(); await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!; await page.mouse.move(box.x + 40, box.y + 30);
  await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toMatch(/px$/);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.mouse.move(box.x + 90, box.y + 60);
  await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toBe("");
});

const litIndex = (page: Page) => page.locator("#approach .tbs__word").evaluateAll((els) => {
  const c = els.map((e) => getComputedStyle(e).color); const fg = getComputedStyle(document.querySelector("#approach h3")!).color;
  return c.map((x, i) => (x === fg ? i : -1)).filter((i) => i >= 0);
});
const toApproach = (page: Page, f: number) => page.evaluate((f) => { const s = document.getElementById("approach")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, f);

test("think · build · ship: pinned at 1440, one word lit at a time", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await skip(page);
  await toApproach(page, 0.2); await expect.poll(() => litIndex(page)).toEqual([0]);
  await toApproach(page, 0.85); await expect.poll(() => litIndex(page)).toEqual([2]);
});

for (const [name, setup] of [
  ["at 390 × 844", async (page: Page) => { await page.setViewportSize({ width: 390, height: 844 }); await skip(page); }],
  // Reduced motion: the entrance is static and has no skip control, so the page is simply loaded.
  ["under reduced motion", async (page: Page) => { await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/"); }],
] as const) {
  test(`think · build · ship ${name}: all three slots visible, stacked`, async ({ page }) => {
    await setup(page);
    await page.locator("#approach").scrollIntoViewIfNeeded();
    const slots = page.locator("#approach .tbs__slot");
    await expect(slots).toHaveCount(3);
    const tops = await slots.evaluateAll((els) => els.map((e) => [e.getBoundingClientRect().top, +getComputedStyle(e).opacity]));
    for (const [, o] of tops) expect(o).toBe(1);
    expect(tops[0][0]).toBeLessThan(tops[1][0]); expect(tops[1][0]).toBeLessThan(tops[2][0]);
  });
}

test("case study: a slow first load shows an announced loading state, then the panel (UX review)", async ({ page }) => {
  await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => {
    const res = await route.fetch(); const body = await res.text();
    if (body.includes("Close case study")) await new Promise((r) => setTimeout(r, 1500));
    await route.fulfill({ response: res, body });
  });
  await skip(page);
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  await expect(page.getByRole("status").filter({ hasText: "Loading case study" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("[data-case-study-loading]")).toHaveCount(0);
});

test("think · build · ship pins at 1280×720 on a fresh load, and pinning never depends on history (review I1)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await skip(page);
  await expect(page.locator("#approach")).toHaveAttribute("data-fit", "true");
  await expect(page.locator("#approach")).toHaveAttribute("data-pinned", "true");
  await page.setViewportSize({ width: 1440, height: 900 }); await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator("#approach")).toHaveAttribute("data-pinned", "true");
});

test("T Poker: both store badges link their live listings — flagship, case study and palette", async ({ page }) => {
  await skip(page);
  const flagship = page.locator("#work-poker");
  await expect(flagship.locator('a[href="https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023"]')).toHaveCount(1);
  await expect(flagship.locator('a[href="https://play.google.com/store/apps/details?id=com.tpoker.app"]')).toHaveCount(1);
  await expect(flagship.getByRole("link", { name: /Google Play — T Poker/ })).toHaveCount(1);
  const opener = page.locator("button[data-case-study='poker']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("link", { name: /App Store — T Poker/ }).first()).toBeVisible();
  await expect(panel.getByRole("link", { name: /Google Play — T Poker/ }).first()).toBeVisible();
  await page.keyboard.press("Escape"); await expect(panel).toBeHidden();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search commands" }).fill("Google Play");
  await expect(page.getByRole("option", { name: /T Poker — Google Play/ })).toBeVisible();
});

test("every flagship keeps its pinned stage down to 1024×768 — T Poker's store row included (final polish pass)", async ({ page }) => {
  for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await skip(page);
    for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) {
      await expect(page.locator(`#work-${id}`), `${id} at ${width}×${height}`).toHaveAttribute("data-fit", "true");
      await expect(page.locator(`#work-${id}`), `${id} at ${width}×${height}`).toHaveAttribute("data-pinned", "true");
    }
    // Both store badges sit on one row inside the copy column.
    const tops = await page.locator("#work-poker ul[aria-label='Get T Poker'] a").evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().top)));
    expect(new Set(tops).size, `store row at ${width}×${height}`).toBe(1);
  }
});
