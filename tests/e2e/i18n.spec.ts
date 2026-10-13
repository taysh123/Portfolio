// tests/e2e/i18n.spec.ts — English at /, Hebrew at /he (2026-10-13).
import { test, expect, type Page } from "playwright/test";
import { open } from "../support/page";

const visibleText = (page: Page) => page.evaluate(() => {
  const out: string[] = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement!; if (!el || el.closest("script, style, [aria-hidden='true'], [lang='en'], code, q, .refusal__msg")) continue;
    if (el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && n.textContent!.trim()) out.push(n.textContent!.trim());
  }
  return out;
});

test("each page declares its language and direction in the first byte, with hreflang and canonical", async ({ request }) => {
  for (const [path, lang, dir, canonical] of [["/", "en", "ltr", "https://tayshofer.dev"], ["/he", "he", "rtl", "https://tayshofer.dev/he"]] as const) {
    const html = await (await request.get(path)).text();
    expect(html, path).toMatch(new RegExp(`<html lang="${lang}" dir="${dir}"`));
    expect(html, path).toContain(`<link rel="canonical" href="${canonical}"/>`);
    for (const [hl, href] of [["en", "https://tayshofer.dev"], ["he", "https://tayshofer.dev/he"], ["x-default", "https://tayshofer.dev"]])
      expect(html, `${path} ${hl}`).toContain(`<link rel="alternate" hrefLang="${hl}" href="${href}"/>`);
    expect(html, path).toContain(`og:locale" content="${lang === "he" ? "he_IL" : "en_US"}"`);
    expect(html, path).toMatch(/og:image" content="https:\/\/tayshofer\.dev\/(he\/)?opengraph-image/);
  }
  expect((await request.get("/he")).headers()["content-security-policy"]).toBeTruthy();   // the proxy still runs
});

test("the Hebrew page is Hebrew: headline, navigation, chapters, Contact, footer and accessible names", async ({ page }) => {
  await page.goto("/he");
  await expect(page.locator("h1")).toHaveText("אני בונה תוכנה מקצה לקצה.");
  const header = page.locator("header[data-site-nav]");
  for (const name of ["עבודות", "אודות", "כלים", "יצירת קשר"]) await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(header.getByRole("button", { name: "הגדרות נגישות" })).toBeVisible();
  await expect(page.getByRole("link", { name: "דילוג לתוכן" })).toHaveCount(1);
  await expect(page.locator("#about-title")).toContainText("מהנדס בהכשרתי.");
  await expect(page.locator("#contact .contact__lead")).toHaveText("אני מחפש הזדמנות בתחום הנדסת התוכנה שמתאימה לכישורים שלי — במשרד, במתכונת היברידית או מרחוק.");
  await expect(page.locator(".about__facts li")).toHaveText(["תואר ראשון במדעי המחשב", "פיתוח Full-stack: ווב, מובייל ושרת", "בישראל", "עובד בעברית ובאנגלית"]);
  await expect(page.locator("button[data-case-study='aegis']")).toHaveText("מקרה בוחן");
  await expect(page.locator("footer").getByRole("link", { name: "חזרה למעלה" })).toHaveAttribute("href", "#hero");
  // No English interface word is left on the page (names, code and the products' own words are marked lang="en").
  const text = (await visibleText(page)).join(" | ");
  for (const w of ["Case study", "Source on GitHub", "Get in touch", "Back to top", "Email me", "See the work", "Filter by project", "Related projects", "Think. Build. Ship.", "Two more", "Open the web app", "Download on the", "Get it on", "Private repository", "Chat with the assistant"])
    expect(text, w).not.toContain(w);
  // Every image has a Hebrew alt (or is decorative).
  const alts = await page.locator("main img[alt]:not([alt=''])").evaluateAll((is) => is.map((i) => i.getAttribute("alt")!));
  expect(alts.length).toBeGreaterThan(0);
  for (const a of alts) expect(a, a).toMatch(/[֐-׿]/);
});

test("the case study opens in Hebrew on the Hebrew page", async ({ page }) => {
  await page.goto("/he");
  await page.locator("button[data-case-study='poker']").click();
  const d = page.getByRole("dialog");
  await expect(d.getByRole("heading", { name: "הבעיה" })).toBeVisible();
  await expect(d.getByRole("button", { name: "סגירת מקרה הבוחן" })).toBeVisible();
  await expect(d).toContainText("ערב פוקר ביתי");
  await expect(d.getByRole("link", { name: /להורדה ב־/ })).toHaveAttribute("href", /apps\.apple\.com/);
  await page.keyboard.press("Escape"); await expect(d).toHaveCount(0);
});

test("the switch: two real links, the current one marked, and the reader stays in their section", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900], { hash: "#about" });
  const sw = page.locator("header[data-site-nav]").getByRole("group", { name: "Language" });
  await expect(sw.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");
  await expect(sw.getByRole("link", { name: "עברית" })).toHaveAttribute("href", "/he");
  await expect(sw.getByRole("link", { name: "עברית" })).toHaveAttribute("lang", "he");
  await sw.getByRole("link", { name: "עברית" }).click();
  await page.waitForURL(/\/he#about$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(await page.evaluate(() => Math.abs(document.getElementById("about")!.getBoundingClientRect().top) < innerHeight)).toBe(true);
  // The choice is remembered, but never redirects: the English URL still opens in English.
  expect((await ctx.cookies()).find((c) => c.name === "lang")?.value).toBe("he");
  await page.goto("/"); await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await ctx.close();
});

test("phones: the switch is in the menu sheet, full size", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844]);
  await page.getByRole("button", { name: "Open menu" }).click();
  const sw = page.getByRole("dialog", { name: "Navigation" }).getByRole("group", { name: "Language" });
  await expect(sw.getByRole("link")).toHaveText(["English", "עברית"]);
  for (const box of await sw.getByRole("link").evaluateAll((ls) => ls.map((l) => l.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(44);
  await ctx.close();
});

test("RTL: no horizontal overflow, and the layout mirrors where it reads and holds where it pictures", async ({ browser }) => {
  for (const vp of [[320, 568], [390, 844], [768, 1024], [844, 390], [1440, 900]] as const) {
    const { ctx, page } = await open(browser, vp, { hash: "" });
    await page.goto("/he", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), vp.join("x")).toBeLessThanOrEqual(0);
    await ctx.close();
  }
  const { ctx, page } = await open(browser, [1440, 900]);
  await page.goto("/he", { waitUntil: "networkidle" });
  // The headline sits at the right; the T Poker plate (first in reading order) is the rightmost.
  const h1 = await page.locator("h1").boundingBox(), poker = await page.locator(".tile--poker").boundingBox(), gf = await page.locator(".tile--gf").boundingBox();
  expect(h1!.x + h1!.width).toBeGreaterThan(1200);
  expect(poker!.x).toBeGreaterThan(gf!.x);
  // Captures never mirror; the chapter stages keep their physical layout.
  for (const sel of [".console", ".dwin__shot", ".gf__stage", ".pstage", ".tile__stage"]) expect(await page.locator(sel).first().evaluate((e) => getComputedStyle(e).direction), sel).toBe("ltr");
  expect(await page.locator("main img").evaluateAll((is) => is.filter((i) => /scale\(-1|matrix\(-1/.test(getComputedStyle(i).transform)).length)).toBe(0);
  // The verbatim refusal and the transcribed alert row stay English, left to right.
  for (const sel of [".refusal__msg", ".console__note q"]) {
    await expect(page.locator(sel)).toHaveAttribute("lang", "en"); await expect(page.locator(sel)).toHaveAttribute("dir", "ltr");
  }
  await ctx.close();
});

test("a 404 under /he is Hebrew; elsewhere it is English", async ({ page }) => {
  const r = await page.goto("/he/nope"); expect(r!.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("העמוד הזה לא קיים.");
  await expect(page.getByRole("link", { name: "חזרה להתחלה" })).toHaveAttribute("href", "/he");
  await page.goto("/nope"); await expect(page.locator("h1")).toHaveText("That page doesn't exist.");
  // A mistyped address follows the remembered choice — the whole page, not just its text — but / stays English.
  await page.context().addCookies([{ name: "lang", value: "he", url: "http://localhost:3400" }]);
  await page.goto("/nope"); await expect(page.locator("h1")).toHaveText("העמוד הזה לא קיים.");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("[data-chat-launcher]")).toHaveAttribute("aria-label", "צ׳אט עם העוזר");
  await page.goto("/"); await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("review fixes: a prefetched /he is still Hebrew, right to left, with the CSP", async ({ request }) => {
  // The two headers browsers send for a document prefetch (Next's own router prefetch is an RSC request, not used here).
  for (const headers of [{ purpose: "prefetch" }, { "sec-purpose": "prefetch" }] as Record<string, string>[]) {
    const r = await request.get("/he", { headers });
    expect(await r.text(), JSON.stringify(headers)).toMatch(/<html lang="he" dir="rtl"/);
    expect(r.headers()["content-security-policy"], JSON.stringify(headers)).toBeTruthy();
  }
});

test("review fixes: Hebrew is set in Heebo (first in the stack, Hebrew only), Latin in Geist; the English page never loads Heebo", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900]);
  const fonts: string[] = []; page.on("response", (r) => { if (r.url().endsWith(".woff2")) fonts.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  const enFonts = [...fonts];
  await page.goto("/he", { waitUntil: "networkidle" });
  const stack = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(stack.split(",")[0], stack).toMatch(/heebo/i);
  expect(stack.indexOf("Geist")).toBeGreaterThan(0);
  expect(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => /heebo/i.test(f.family) && f.status === "loaded"); })).toBe(true);
  // English: Geist only — the switch's Hebrew word is in the system face.
  expect(enFonts.length).toBeGreaterThan(0);
  expect(fonts.length).toBeGreaterThan(enFonts.length);
  await ctx.close();
});

test("review-only snapshot: the Hebrew page has no résumé either, and says so in Hebrew", async ({ page }) => {
  await page.goto("/he");
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator("#contact [data-preview-note]")).toHaveText("הורדת קורות החיים לא נכללת בגרסת הבדיקה הזו.");
});
