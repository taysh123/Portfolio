// tests/e2e/lower.spec.ts — About, Stack, Think · Build · Ship, Contact and the résumé (M10).
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open, PHONES } from "../support/page";

test("About: a ~34em reading measure, one line of facts, and the one photograph — static, captioned, described", async ({ page }) => {
  await page.goto("/");
  const measure = await page.locator(".about__p").first().evaluate((p) => parseFloat(getComputedStyle(p).maxWidth) / parseFloat(getComputedStyle(p).fontSize));
  expect(measure).toBeGreaterThanOrEqual(33); expect(measure).toBeLessThanOrEqual(35);
  await expect(page.locator(".about__facts li")).toHaveText(["B.Sc. in Computer Science", "Full stack: web, mobile and backend", "Based in Israel, working in English"]);
  const photo = page.locator(".about__photo");
  await expect(photo.locator("figcaption")).toContainText("Where the work happens.");
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
  expect(await photo.locator("img").getAttribute("alt")).toMatch(/render/);
  await expect(page.locator("#about canvas, #about video")).toHaveCount(0);
  // No parallax: the photo moves with the page, exactly.
  const move = await photo.evaluate((f) => { const y0 = f.getBoundingClientRect().top, s0 = scrollY; scrollBy({ top: 200, behavior: "instant" as ScrollBehavior });
    return { photo: y0 - f.getBoundingClientRect().top, page: scrollY - s0 }; });
  expect(move.photo).toBeCloseTo(move.page, 0);
});

test("Stack: the lens is a real filter of the server-rendered rows", async ({ page }) => {
  await page.goto("/");
  const visible = () => page.locator("#skills [data-tool]").evaluateAll((ls) => ls.filter((l) => l.getClientRects().length > 0).map((l) => ({ t: l.textContent, p: l.getAttribute("data-p") ?? "" })));
  const all = await visible();
  expect(all.length).toBe(await page.locator("#skills [data-tool]").count());
  for (const [id, name] of [["aegis", "Aegis"], ["poker", "T Poker"], ["developeros", "DeveloperOS"], ["gravity-flow", "GRAVITY FLOW"]] as const) {
    await page.getByRole("radio", { name, exact: true }).check();
    const shown = await visible();
    expect(shown.length, name).toBeGreaterThan(0); expect(shown.length, name).toBeLessThan(all.length);
    for (const s of shown) expect(s.p.split(" "), `${name}: ${s.t}`).toContain(id);
    // Groups with none of the project's tools are gone, not empty.
    const emptyGroups = await page.locator("#skills .sgroup").evaluateAll((gs) => gs.filter((g) => g.getClientRects().length > 0 && ![...g.querySelectorAll("[data-tool]")].some((t) => t.getClientRects().length > 0)).length);
    expect(emptyGroups, name).toBe(0);
    await expect(page.locator(".lens__status")).toHaveText(`Showing the ${shown.length} tools ${name} uses.`);
  }
  await page.getByRole("radio", { name: "All" }).check();
  expect((await visible()).length).toBe(all.length);
});

test("Stack: the lens filters with JavaScript off too", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844], { js: false });
  const n = () => page.locator("#skills [data-tool]").evaluateAll((ls) => ls.filter((l) => l.getClientRects().length > 0).length);
  const all = await n();
  await page.locator('#skills input[data-lens-option="aegis"]').check();
  expect(await n()).toBeLessThan(all);
  await ctx.close();
});

test("Stack: tools are typeset text in five groups, each naming the projects behind it — no monospace table", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#skills .sgroup__title")).toHaveText(["Languages", "Product and interface", "Services and APIs", "Data and search", "Delivery and testing"]);
  const fonts = await page.locator("#skills [data-tool]").evaluateAll((ls) => [...new Set(ls.map((l) => getComputedStyle(l).fontFamily))]);
  for (const f of fonts) expect(f).not.toMatch(/mono/i);
  const size = await page.locator("#skills [data-tool]").first().evaluate((l) => parseFloat(getComputedStyle(l).fontSize));
  expect(size).toBeGreaterThanOrEqual(16);
  for (const used of await page.locator("#skills .sgroup__used").allTextContents()) expect(used).toMatch(/T Poker|Aegis|DeveloperOS|GRAVITY FLOW|Job Assistant|Orders/);
});

test("Stack at desktop widths: the chips' cascade is fixed — rows, not wrapping chip clouds", async ({ browser }) => {
  for (const vp of [[1440, 900], [1024, 768]] as const) {
    const { ctx, page } = await open(browser, vp);
    const g = await page.locator("#skills .sgroup").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length);
    expect(g, `${vp[0]}`).toBe(3);
    const pill = await page.locator("#skills [data-tool]").first().evaluate((l) => { const cs = getComputedStyle(l); return cs.borderTopWidth !== "0px" || cs.backgroundColor !== "rgba(0, 0, 0, 0)"; });
    expect(pill).toBe(false);
    await ctx.close();
  }
});

test("Think · Build · Ship is unpinned: three principles in the flow of the page", async ({ page }) => {
  await page.goto("/");
  const s = page.locator("#approach");
  expect(await s.evaluate((e) => [...e.querySelectorAll("*")].some((x) => /sticky|fixed/.test(getComputedStyle(x).position)))).toBe(false);
  const h = await s.evaluate((e) => e.getBoundingClientRect().height);
  expect(h).toBeLessThan(900 * 1.2);
  await expect(s.locator(".tbs__word")).toHaveText(["Think:", "Build:", "Ship:"]);
  await expect(s.locator(".tbs__line")).toHaveText(["Find the hard part.", "Make the safe path the easy one.", "Ship it honestly."]);
  // Each principle is argued from a named project.
  await expect(s.locator(".tbs__example")).toHaveText([/^T Poker:/, /^GRAVITY FLOW:/, /^Aegis /]);
});

for (const vp of PHONES) {
  test(`${vp[0]}px: Contact keeps LinkedIn and GitHub on one line, and offers no résumé (review-only snapshot)`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp);
    const tops = await page.locator("#contact .contact__profiles a").evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().top)));
    expect(tops).toHaveLength(2); expect(tops[0]).toBe(tops[1]);
    await expect(page.locator("#contact [data-resume], #contact a[href$='.pdf']")).toHaveCount(0);
    await expect(page.locator("#contact [data-preview-note]")).toHaveText("The résumé download is left out of this review Preview.");
    await ctx.close();
  });
}

test("Contact: one primary action, the two profiles, and the résumé as a quiet download", async ({ page }) => {
  await page.goto("/");
  const c = page.locator("#contact");
  await expect(c.getByRole("link", { name: "Email me" })).toHaveAttribute("href", /^mailto:/);
  await expect(c.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", /^https:\/\/www\.linkedin\.com\//);
  await expect(c.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/taysh123");
  // Review-only snapshot: no résumé anywhere on the page.
  await expect(page.getByRole("link", { name: /résumé|resume|cv/i })).toHaveCount(0);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  // Not in the header.
  await expect(page.locator("header[data-site-nav]").getByRole("link", { name: /résumé|resume|cv/i })).toHaveCount(0);
});

test("review-only snapshot: the résumé is not in the build and is not served", async ({ request }) => {
  expect(fs.existsSync("public/resume")).toBe(false);
  const r = await request.get("/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
  expect(r.status()).toBe(404);
});

for (const vp of PHONES) {
  test(`${vp[0]}px: the lower page holds its measure and nothing overflows`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp);
    for (const id of ["about", "skills", "approach", "contact"]) {
      const over = await page.locator(`#${id}`).evaluate((s) => [...s.querySelectorAll<HTMLElement>("*")].filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5 && e.getClientRects().length).map((e) => e.className).slice(0, 3));
      expect(over, id).toEqual([]);
    }
    await ctx.close();
  });
}

test("the footer concludes the page: identity and role, the channels, a way back up, and this year's copyright", async ({ page }) => {
  await page.goto("/");
  const f = page.locator("footer");
  await expect(f).toContainText("Tay Shofer · Software Engineer");
  await expect(f.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveText(["Email", /^GitHub/, /^LinkedIn/, "Back to top"]);
  await expect(f.getByRole("link", { name: "Back to top" })).toHaveAttribute("href", "#hero");
  await expect(f).toContainText(`© ${new Date().getFullYear()} Tay Shofer`);
});
