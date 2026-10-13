// tests/e2e/english.spec.ts — one English page (the owner's decision, 2026-10-13): no second language, no switch, and
// the address of the retired Hebrew page lands on the one page.
import { test, expect } from "playwright/test";
import { open } from "../support/page";

test("the page is English, left to right, in the first byte; English-only metadata, no language alternates", async ({ request }) => {
  const r = await request.get("/");
  const html = await r.text();
  expect(html).toMatch(/<html lang="en" dir="ltr"/);
  expect(html).toContain('<link rel="canonical" href="https://tayshofer.dev"/>');
  expect(html).not.toMatch(/hrefLang|hreflang|rel="alternate"/i);
  expect(html).toContain('og:locale" content="en_US"');
  expect(html).not.toMatch(/og:locale:alternate|he_IL/);
  expect(html).toMatch(/og:image" content="https:\/\/tayshofer\.dev\/opengraph-image/);
  expect(html).not.toMatch(/\/he\/opengraph-image|twitter-image\.png/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]);
  expect(ld["@graph"][0].inLanguage).toBe("en");
  expect(html).not.toMatch(/[֐-׿]/);                          // no Hebrew anywhere in the document
  expect(r.headers()["content-security-policy"]).toBeTruthy();           // the proxy still runs
  expect(r.headers()["set-cookie"] ?? "").not.toMatch(/(^|[;,]\s*)lang=/);
});

test("/he, anything under it and its old social cards redirect to the one page (308), and it renders English", async ({ request, page }) => {
  // One hop from /he; the query is carried over.
  for (const [p, to] of [["/he", "/"], ["/he?x=1", "/?x=1"], ["/he/opengraph-image.png", "/"], ["/he/anything/deeper", "/"]]) {
    const r = await request.get(p, { maxRedirects: 0 });
    expect(r.status(), p).toBe(308);
    expect(r.headers().location, p).toBe(to);
  }
  // A trailing slash takes Next's own normalisation first (/he/ → /he), then the same redirect: it still lands on /.
  for (const p of ["/he/", "/he#about"]) {
    const r = await request.get(p);
    expect(r.status(), p).toBe(200);
    expect(new URL(r.url()).pathname, p).toBe("/");
  }
  const res = await page.goto("/he");
  expect(res!.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("I build software end to end.");
});

test("the sitemap and robots name only the one English page", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).toEqual(["https://tayshofer.dev"]);
  expect(xml).not.toMatch(/xhtml:link|hreflang|\/he</);
});

test("a 404 is English, left to right, and offers the way back", async ({ page }) => {
  const r = await page.goto("/nope"); expect(r!.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("h1")).toHaveText("That page doesn't exist.");
  await expect(page.getByRole("link", { name: "Back to the start" })).toHaveAttribute("href", "/");
  // A cookie left over from the bilingual Preview changes nothing.
  await page.context().addCookies([{ name: "lang", value: "he", url: "http://localhost:3400" }]);
  await page.goto("/nope"); await expect(page.locator("h1")).toHaveText("That page doesn't exist.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("no visible Hebrew and no language switch at any width, menu open or closed", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844], [320, 568]] as const) {
    const { ctx, page } = await open(browser, vp);
    expect(await page.evaluate(() => /[֐-׿]/.test(document.body.innerText)), `${vp}`).toBe(false);
    await expect(page.locator("[data-lang-switch], .lang-switch, a[hreflang]")).toHaveCount(0);
    if (vp[0] < 1024) {
      await page.getByRole("button", { name: "Open menu" }).click();
      const sheet = page.getByRole("dialog", { name: "Navigation" });
      await expect(sheet).toBeVisible();
      expect(await sheet.evaluate((s) => /[֐-׿]|English/.test((s as HTMLElement).innerText)), `${vp} menu`).toBe(false);
    }
    await ctx.close();
  }
});
