// tests/e2e/chapters.spec.ts — M2: the flagship chapters. Numbers are perceptible anchors, metrics align, phones
// read number → title → visual → copy, media stays in bounds, and pinned chapters fit (CTA visible) on laptops.
import { test, expect, type Page } from "playwright/test";

const IDS = ["poker", "aegis", "developeros", "gravity-flow"] as const;
const SIZES = [[1440, 900], [1280, 720], [768, 1024], [390, 844], [375, 667], [360, 780]] as const;
const toScene = (page: Page, id: string, f: number) => page.evaluate(({ id, f }) => {
  const s = document.getElementById(`work-${id}`)!; scrollTo({ top: s.getBoundingClientRect().top + scrollY + Math.max(0, s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior });
}, { id, f });

/** WCAG contrast of any CSS colour (rgb, oklab, color-mix…) against the dark stage (#05070a): the browser resolves
 *  it by painting one canvas pixel. */
const CONTRAST = `(c) => { const cv = document.createElement("canvas"); cv.width = cv.height = 1; const x = cv.getContext("2d"); x.fillStyle = "#05070a"; x.fillRect(0, 0, 1, 1);
  x.fillStyle = c; x.fillRect(0, 0, 1, 1); const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
  const L = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const l = 0.2126 * L(r) + 0.7152 * L(g) + 0.0722 * L(b), bg = 0.2126 * L(5) + 0.7152 * L(7) + 0.0722 * L(10); return (l + 0.05) / (bg + 0.05); }`;

for (const [w, h] of SIZES) {
  test(`${w}×${h}: every chapter number is a visible anchor, quieter than its title`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    for (const id of IDS) {
      // Pinned: mid-scene. Unpinned (phones, tablets): where the chapter's head arrives under the nav.
      if (await page.locator(`#work-${id}`).getAttribute("data-pinned") === "true") await toScene(page, id, 0.5);
      else await page.locator(`#work-${id} .chapter__head`).evaluate((e) => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 96, behavior: "instant" as ScrollBehavior }));
      await page.waitForTimeout(150);
      const num = page.locator(`#work-${id} [data-chapter-num]`);
      await expect(num).toBeInViewport({ ratio: 1 });
      const r = await num.evaluate((el, fn) => {
        const contrast = eval(fn); const cs = getComputedStyle(el), t = getComputedStyle(el.closest(".chapter")!.querySelector(".chapter__title")!);
        const nav = document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom;
        return { size: parseFloat(cs.fontSize), titleSize: parseFloat(t.fontSize), c: contrast(cs.color), tc: contrast(t.color), top: el.getBoundingClientRect().top, nav };
      }, CONTRAST);
      expect(r.size, `${id} number size`).toBeGreaterThanOrEqual(48);
      expect(r.size, `${id} number is larger than its title`).toBeGreaterThan(r.titleSize);
      expect(r.c, `${id} number contrast`).toBeGreaterThanOrEqual(3);
      expect(r.tc, `${id} title stays louder`).toBeGreaterThan(r.c * 2);
      expect(r.top, `${id} number below the nav`).toBeGreaterThanOrEqual(r.nav);
      // The ghost numeral: drawn (outline alpha ≥ 0.3), settled fully opaque, and the right number.
      const g = await page.locator(`#work-${id} .chapter__ghost`).evaluate((el) => ({ text: el.textContent, stroke: getComputedStyle(el).webkitTextStrokeColor, op: getComputedStyle(el).opacity, w: getComputedStyle(el).webkitTextStrokeWidth }));
      expect(g.text).toBe(String(IDS.indexOf(id) + 1).padStart(2, "0"));
      expect(Number(g.stroke.match(/[\d.]+/g)!.at(-1)), `${id} ghost stroke alpha`).toBeGreaterThanOrEqual(0.3);
      expect(parseFloat(g.w)).toBeGreaterThanOrEqual(1);
    }
  });

  test(`${w}×${h}: metric values share one line (or one column on phones), whatever their labels wrap to`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    for (const id of IDS) {
      const v = await page.locator(`#work-${id} [data-metric-value]`).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
      expect(v.length).toBe(3);
      if (w >= 480) expect(Math.max(...v.map((b) => b.top)) - Math.min(...v.map((b) => b.top)), `${id} value tops`).toBeLessThanOrEqual(1);
      else expect(Math.max(...v.map((b) => b.left)) - Math.min(...v.map((b) => b.left)), `${id} value lefts`).toBeLessThanOrEqual(1);
      // each value sits above (or, on phones, beside) its own label, inside the same metric cell
      const pairs = await page.locator(`#work-${id} .chapter__metric`).evaluateAll((els) => els.map((e) => { const d = e.querySelector("dd")!.getBoundingClientRect(), t = e.querySelector("dt")!.getBoundingClientRect(); return { above: d.bottom <= t.top + 1, beside: d.right <= t.left + 1 }; }));
      for (const p of pairs) expect(w >= 480 ? p.above : p.beside, id).toBe(true);
    }
  });

  test(`${w}×${h}: no chapter media pushes the page sideways; Aegis alerts stay inside the monitor`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(w);
    const inside = await page.evaluate(() => { const m = document.querySelector(".world-aegis__monitor")!.getBoundingClientRect();
      return [...document.querySelectorAll(".world-aegis__row")].every((r) => { const b = r.getBoundingClientRect(); return b.left >= m.left - 0.5 && b.right <= m.right + 0.5 && b.top >= m.top - 0.5 && b.bottom <= m.bottom + 0.5; }); });
    expect(inside).toBe(true);
  });
}

test("below 1024px each chapter reads number → title → visual → copy; from 1024px the world sits beside the copy, alternating sides", async ({ page }) => {
  for (const [w, h] of [[390, 844], [768, 1024]] as const) {
    await page.setViewportSize({ width: w, height: h }); await page.goto("/");
    for (const id of IDS) {
      const [head, world, body] = await Promise.all([".chapter__head", ".chapter__world", ".chapter__body"].map((s) => page.locator(`#work-${id} ${s}`).evaluate((e) => e.getBoundingClientRect().toJSON())));
      expect(world.top, `${w} ${id}: visual after the title`).toBeGreaterThanOrEqual(head.bottom - 1);
      expect(body.top, `${w} ${id}: copy after the visual`).toBeGreaterThanOrEqual(world.bottom - 1);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/");
  const sides = [];
  for (const id of IDS) {
    const [head, world] = await Promise.all([".chapter__head", ".chapter__world"].map((s) => page.locator(`#work-${id} ${s}`).evaluate((e) => e.getBoundingClientRect().toJSON())));
    sides.push(world.left >= head.right ? "copy-left" : world.right <= head.left ? "world-left" : "overlap");
  }
  expect(sides).toEqual(["copy-left", "world-left", "copy-left", "world-left"]);
});

for (const [w, h] of [[1440, 900], [1280, 720]] as const) {
  test(`${w}×${h}: every chapter fits its pinned stage — the primary action is on screen mid-scene`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    for (const id of IDS) {
      await expect(page.locator(`#work-${id}`)).toHaveAttribute("data-fit", "true");
      await expect(page.locator(`#work-${id}`)).toHaveAttribute("data-pinned", "true");
      await toScene(page, id, 0.5); await page.waitForTimeout(150);
      await expect(page.locator(`#work-${id} button[data-case-study]`)).toBeInViewport({ ratio: 1 });
    }
  });
}

test("phones: arriving at a chapter's anchor shows its number below the nav", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const id of IDS) {
    await page.evaluate((id) => { const s = document.getElementById(`work-${id}`)!; scrollTo({ top: s.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }); }, id);
    const nav = await page.locator("header[data-site-nav]").evaluate((e) => e.getBoundingClientRect().bottom);
    const top = await page.locator(`#work-${id} [data-chapter-num]`).evaluate((e) => e.getBoundingClientRect().top);
    expect(top, id).toBeGreaterThanOrEqual(nav + 8);
  }
});

test("each chapter says what was built, solo, in one line", async ({ page }) => {
  await page.goto("/");
  for (const id of IDS) {
    const b = page.locator(`#work-${id} [data-built]`);
    await expect(b).toContainText("Built solo");
    expect((await b.locator(".chapter__built-text").innerText()).length).toBeLessThan(130);
  }
});

test("T Poker presents where it ships under the product: live state, web host and both store listings", async ({ page }) => {
  await page.goto("/");
  const ship = page.locator("#work-poker .chapter__world [data-shipped]");
  await expect(ship).toContainText(/Live · app\.tpoker\.app/);
  await expect(ship.getByRole("link", { name: /App Store — T Poker/ })).toHaveCount(1);
  await expect(ship.getByRole("link", { name: /Google Play — T Poker/ })).toHaveCount(1);
});

test("reduced motion: chapters render settled — numbers, ghosts and worlds fully visible, nothing pinned", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const id of IDS) {
    await expect(page.locator(`#work-${id}`)).toHaveAttribute("data-pinned", "false");
    expect(await page.locator(`#work-${id} .chapter__ghost`).evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  }
});
