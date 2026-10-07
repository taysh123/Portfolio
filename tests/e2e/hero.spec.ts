// tests/e2e/hero.spec.ts — M1: the hero says who, what, proof and where to go; the arcs never touch a control;
// the scrolled navbar never lets page copy read through it.
import { test, expect, type Page } from "playwright/test";
import sharp from "sharp";

const SIZES = [[1440, 900], [1280, 720], [768, 1024], [390, 844], [375, 667], [360, 780]] as const;
const SCENES = { "T Poker": "#work-poker", Aegis: "#work-aegis", DeveloperOS: "#work-developeros", "GRAVITY FLOW": "#work-gravity-flow" };

test("the hero index links the four flagships to their scenes, with their verified states", async ({ page }) => {
  await page.goto("/");
  const index = page.getByRole("navigation", { name: "Flagship projects" });
  const links = index.getByRole("link");
  await expect(links).toHaveCount(4);
  const states = ["Live on iOS & Android", "Open source", "Released", "Release candidate"];
  let i = 0;
  for (const [name, href] of Object.entries(SCENES)) {
    const link = links.nth(i);
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toContainText(name); await expect(link).toContainText(states[i]);
    await expect(page.locator(href)).toHaveCount(1);                         // every target exists
    i++;
  }
});

test("following an index link lands its scene in view", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Flagship projects" }).getByRole("link", { name: /DeveloperOS/ }).click();
  await expect(page.locator("#work-developeros-title")).toBeInViewport({ timeout: 5000 });
});

test("the hero proof figure equals the Stack figure (one derived number)", async ({ page }) => {
  await page.goto("/");
  const proof = (await page.locator("[data-hero-proof]").innerText()).trim();
  expect(proof).toBe("7,061 passing tests across five projects");
  await expect(page.locator("#skills")).toContainText(proof.split(" ")[0]);
});

/** Rim height of the arc (an elliptical top edge) at page x. */
async function arc(page: Page, sel: string) {
  return page.locator(sel).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, top: r.top, rx: r.width / 2, ry: r.height };
  });
}
const rimY = (a: { cx: number; top: number; rx: number; ry: number }, x: number) => {
  const t = Math.min(1, Math.abs(x - a.cx) / a.rx);
  return a.top + a.ry * (1 - Math.sqrt(1 - t * t));
};

for (const [w, h] of SIZES) {
  test(`${w}×${h}: the hero arc stays ≥24px clear of the CTAs and the index`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    const a = await arc(page, "[data-hero-arc]");
    const boxes = await page.locator("[data-hero-ctas] a, [data-hero-index] a").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    expect(boxes.length).toBe(6);
    for (const b of boxes) {
      // the closest rim point over the control's width is at the x nearest the apex
      const x = Math.max(b.left, Math.min(a.cx, b.right));
      expect(rimY(a, x) - b.bottom, JSON.stringify(b)).toBeGreaterThanOrEqual(24);
    }
  });

  test(`${w}×${h}: the Contact arc passes over the CTA and channel row, ≥24px clear`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const a = await arc(page, ".contact__horizon");
    const boxes = await page.locator("#contact .contact__actions a, #contact .contact__actions button").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    expect(boxes.length).toBeGreaterThanOrEqual(5);
    for (const b of boxes) {
      // controls sit under the rim: the rim's lowest point over the control's width must clear its top
      const far = Math.abs(b.left - a.cx) > Math.abs(b.right - a.cx) ? b.left : b.right;
      expect(b.top - rimY(a, far), JSON.stringify(b)).toBeGreaterThanOrEqual(24);
    }
  });
}

test("phones: the index is two compact columns; tablet and up: one row of four", async ({ page }) => {
  for (const [w, h, cols] of [[390, 844, 2], [360, 780, 2], [768, 1024, 4], [1440, 900, 4]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    const tops = await page.locator("[data-hero-index] a").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size, `${w}`).toBe(4 / cols);
    const r = await page.locator("[data-hero-index]").evaluate((e) => e.getBoundingClientRect().toJSON());
    expect(r.right, `${w}`).toBeLessThanOrEqual(w);
    if (cols === 2) expect(r.height, `${w}: compact`).toBeLessThanOrEqual(170);
    for (const b of await page.locator("[data-hero-index] a").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) expect(b).toBeGreaterThanOrEqual(44);
  }
});

test("375×667: the primary CTA is inside the first viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  const b = await page.getByRole("link", { name: /Explore my work/ }).boundingBox();
  expect(b!.y + b!.height).toBeLessThanOrEqual(667);
});

for (const [w, h] of [[1440, 900], [390, 844]] as const) {
  test(`${w}×${h}: the scrolled navbar hides the copy beneath it`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    // Put About's body copy directly under the bar, then compare the bar with and without the page behind it.
    await page.evaluate(() => { const p = document.querySelector("#about p.max-w-\\[62ch\\]")!; scrollTo({ top: p.getBoundingClientRect().top + scrollY - 20, behavior: "instant" }); });
    await page.waitForTimeout(900);
    const navH = await page.locator("header[data-site-nav]").evaluate((e) => e.getBoundingClientRect().height);
    const clip = { x: 0, y: 0, width: w, height: Math.floor(navH) - 2 };
    const withPage = await page.screenshot({ clip });
    await page.addStyleTag({ content: "main, footer { visibility: hidden !important; }" });
    await page.waitForTimeout(100);
    const without = await page.screenshot({ clip });
    const [a, b] = await Promise.all([withPage, without].map((x) => sharp(x).raw().toBuffer()));
    let max = 0, sum = 0;
    for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); sum += d; if (d > max) max = d; }
    // Measured with headless Chromium (which drops the blur): 97% opaque bleeds 6 levels at most; the old 92% bled 14.
    expect(max, `max channel delta`).toBeLessThanOrEqual(10);
    expect(sum / a.length, `mean channel delta`).toBeLessThan(1);
  });
}
