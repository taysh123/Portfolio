// tests/e2e/lower.spec.ts — About, Stack, Think · Build · Ship, Contact and the résumé (M10).
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open, PHONES } from "../support/page";
import { namesAny } from "../support/institution";

test("About: a ~34em reading measure, one line of facts, and the four products together — no caption, one accessible name", async ({ page }) => {
  await page.goto("/");
  const measure = await page.locator(".about__p").first().evaluate((p) => parseFloat(getComputedStyle(p).maxWidth) / parseFloat(getComputedStyle(p).fontSize));
  expect(measure).toBeGreaterThanOrEqual(33); expect(measure).toBeLessThanOrEqual(35);
  await expect(page.locator(".about__facts li")).toHaveText(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
  // No institution anywhere in the served page: copy, alt text, metadata, Open Graph or JSON-LD.
  expect(namesAny(await page.content())).toBe(false);
  // The rejected render and its caption are gone, in every form.
  expect(await page.content()).not.toMatch(/Where the work happens|A 3D render, built in code|about-studio/);
  await expect(page.locator("#about figcaption, #about canvas, #about video")).toHaveCount(0);
  const visual = page.getByRole("img", { name: /T Poker, Aegis, DeveloperOS and GRAVITY FLOW/ });
  await expect(visual).toHaveCount(1);
  await visual.scrollIntoViewIfNeeded();
  await expect.poll(() => visual.locator("img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  // Its layers are presentational (role=img makes them so) and carry empty alts; nothing inside is focusable.
  expect(await visual.locator("img").evaluateAll((is) => is.map((i) => i.getAttribute("alt")))).toEqual(["", "", "", ""]);
  await expect(visual.locator("a, button, [tabindex]")).toHaveCount(0);
  // With motion: each of the four layers carries two scroll-driven animations (settle, drift) — no time-based loop.
  const anims = await visual.evaluate((v) => v.getAnimations({ subtree: true }).map((a) => ({ scroll: a.timeline?.constructor.name, it: (a.effect as KeyframeEffect).getTiming().iterations })));
  expect(anims).toHaveLength(8);
  for (const a of anims) { expect(a.scroll).toBe("ViewTimeline"); expect(a.it).toBe(1); }
  // The timeline follows the page (review fix: an overflow:hidden plate had captured it): its progress moves with the
  // page, and once About is well into view the settle is complete — every layer at its rest transform.
  const progress = () => visual.evaluate((v) => (v.querySelector(".av__layer")!.getAnimations()[0].currentTime as CSSNumericValue | null)?.toString() ?? "");
  await page.evaluate(() => scrollTo({ top: document.querySelector(".av")!.getBoundingClientRect().top + scrollY - innerHeight * 0.95, behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(100); const p1 = await progress();
  await page.evaluate(() => scrollTo({ top: document.querySelector(".av")!.getBoundingClientRect().top + scrollY - innerHeight * 0.2, behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(100); const p2 = await progress();
  expect(p1).not.toBe(p2);
  // Settled: the identity transform (how a finished "to { transform: none }" reports), no rotation or offset left.
  for (const t of await visual.locator(".av__layer").evaluateAll((ls) => ls.map((l) => getComputedStyle(l).transform))) expect(t).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  expect(await visual.evaluate((v) => getComputedStyle(v.querySelector(".av__plate")!).overflow)).toBe("clip");
  // Reduced motion: the rest frame, no animation at all — and the layers sit exactly where the rest frame puts them.
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await visual.evaluate((v) => v.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await visual.locator(".av__layer").evaluateAll((ls) => ls.map((l) => getComputedStyle(l).transform + getComputedStyle(l).translate))).toEqual(Array(4).fill("nonenone"));
  // The site's own switch does the same, whatever the system says.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => document.documentElement.setAttribute("data-reduced-motion", "true"));
  expect(await visual.evaluate((v) => v.getAnimations({ subtree: true }).length)).toBe(0);
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

test("Stack: tools are typeset text in six groups; each tool names its own projects, and each group its related ones — no monospace table", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#skills .sgroup__title")).toHaveText(["Languages", "Product and interface", "Services and APIs", "Data, search and models", "Delivery and testing", "Everyday tools"]);
  await expect(page.locator("#skills .lens__label")).toHaveText("Filter by project");
  // A tool says where it is used, in its accessible text and on hover — not only the group as a whole.
  const csharp = page.locator("#skills [data-tool]", { hasText: /^C#/ });
  await expect(csharp).toHaveAttribute("title", "T Poker, Aegis");
  expect(await csharp.textContent()).toBe("C# (T Poker, Aegis)");
  // "Related projects", then the names, with a real space between them; everyday tools name no project.
  for (const t of await page.locator("#skills .sgroup__used").allTextContents()) expect(t).toMatch(/^Related projects (T Poker|Aegis|DeveloperOS|GRAVITY FLOW|Job Assistant|Orders & Delivery)/);
  await expect(page.locator('#skills .sgroup[data-group="workflow"] .sgroup__used')).toHaveCount(0);
  const fonts = await page.locator("#skills [data-tool]").evaluateAll((ls) => [...new Set(ls.map((l) => getComputedStyle(l).fontFamily))]);
  for (const f of fonts) expect(f).not.toMatch(/mono/i);
  const size = await page.locator("#skills [data-tool]").first().evaluate((l) => parseFloat(getComputedStyle(l).fontSize));
  expect(size).toBeGreaterThanOrEqual(16);
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
