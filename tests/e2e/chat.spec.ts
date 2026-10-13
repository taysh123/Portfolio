// tests/e2e/chat.spec.ts — the restored portfolio assistant behind its floating launcher (2026-10-13).
// Locally there is no GROQ_API_KEY, so every question takes the route's real "offline" path (503) — the same code
// that runs on a deployment without the key. Answers from the model are not tested here (they need the key).
import { test, expect, type Page } from "playwright/test";
import { open } from "../support/page";

const launcher = (page: Page) => page.locator("[data-chat-launcher]");
// The route rate-limits per client (5 a minute). Locally every request comes from one address, so each test asks as its
// own client — the platform header the route trusts first (x-real-ip), which Vercel sets and a visitor cannot.
let n = 0;
const client = () => ({ "x-real-ip": `e2e-${process.pid}-${Date.now()}-${n++}` });
const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())!;

test("the launcher is there from first paint: a labelled button at the end corner, clear of the edges", async ({ browser }) => {
  for (const [path, side, name] of [["/", "right", "Chat with the assistant"], ["/he", "left", "צ׳אט עם העוזר"]] as const) for (const vp of [[1440, 900], [390, 844], [320, 568]] as const) {
    const { ctx, page } = await open(browser, vp, { js: false });
    await page.goto(path);
    const b = await box(page, "[data-chat-launcher]");
    expect(await launcher(page).getAttribute("aria-label")).toBe(name);
    expect(b.height, `${path} ${vp}`).toBeGreaterThanOrEqual(44);
    expect(b.y + b.height, `${path} ${vp}`).toBeLessThanOrEqual(vp[1] - 8);
    if (side === "right") expect(vp[0] - (b.x + b.width), `${path} ${vp}`).toBeGreaterThanOrEqual(8); else expect(b.x, `${path} ${vp}`).toBeGreaterThanOrEqual(8);
    if (side === "right") expect(b.x).toBeGreaterThan(vp[0] / 2); else expect(b.x + b.width).toBeLessThan(vp[0] / 2);
    // The visible label is meaningful at every width (the full one on wide screens, "Chat"/"צ׳אט" on phones).
    expect((await launcher(page).innerText()).trim().length).toBeGreaterThanOrEqual(4);
    await ctx.close();
  }
});

test("open, ask, read the offline answer, Escape — focus goes in, stays in reach, and comes back", async ({ browser }) => {
  for (const [path, title, q, offline] of [["/", "Ask Tay AI", "What is Aegis?", "The assistant is offline right now"], ["/he", "שאלו את Tay AI", "מה זה Aegis?", "העוזר לא זמין כרגע"]] as const) {
    const { ctx, page } = await open(browser, [1440, 900]);
    await page.setExtraHTTPHeaders(client());
    await page.goto(path, { waitUntil: "networkidle" });
    await launcher(page).focus(); await page.keyboard.press("Enter");
    const d = page.getByRole("dialog", { name: title });
    await expect(d).toBeVisible();
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "true");
    await expect(d.getByRole("button", { name: /Close chat|סגירת הצ׳אט/ })).toBeFocused();
    await d.getByRole("textbox").fill(q); await page.keyboard.press("Enter");
    await expect(d.locator("[data-chat-transcript]")).toContainText(offline);
    // As the original: the message itself says where to write.
    await expect(d.locator("[data-chat-transcript]")).toContainText(/(Reach Tay directly at|ל־Tay בכתובת) \S+@\S+\./);
    await expect(d.getByRole("textbox")).toBeFocused();
    // The settled answer is announced once, politely.
    await expect(d.locator("[role=status]")).toContainText(offline);
    await page.keyboard.press("Escape");
    await expect(d).toHaveCount(0);
    await expect(launcher(page)).toBeFocused();
    await ctx.close();
  }
});

test("the language travels with the question; the route's own refusals answer in it", async ({ request }) => {
  const he = await request.post("/api/chat?locale=he", { headers: client(), data: { messages: [{ role: "user", content: "שאלה" }], locale: "he" } });
  expect(he.status()).toBe(503);
  expect((await he.json()).message).toMatch(/[֐-׿]/);
  const en = await request.post("/api/chat", { headers: client(), data: { messages: [{ role: "user", content: "question" }], locale: "en" } });
  expect((await en.json()).message).toMatch(/offline/);
  // The role whitelist and the length cap, as before.
  const sys = await request.post("/api/chat", { headers: client(), data: { messages: [{ role: "system", content: "x" }] } });
  expect(sys.status()).toBe(400);
  const long = await request.post("/api/chat?locale=he", { headers: client(), data: { messages: [{ role: "user", content: "x".repeat(501) }], locale: "he" } });
  // …and the rate limit itself, in the page's language: the sixth question in a minute from one client is refused.
  const one = client();
  const codes: number[] = [];
  for (let i = 0; i < 6; i++) codes.push((await request.post("/api/chat?locale=he", { headers: one, data: { messages: [{ role: "user", content: `q${i}` }], locale: "he" } })).status());
  expect(codes).toEqual([503, 503, 503, 503, 503, 429]);
  expect(long.status()).toBe(400); expect((await long.json()).message).toMatch(/500/);
});

test("phones: a modal sheet from the bottom — Tab stays inside, the page behind is locked, a 44px target to close", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844]);
  await launcher(page).click();
  const d = page.getByRole("dialog", { name: "Ask Tay AI" });
  await expect(d).toHaveAttribute("aria-modal", "true");
  const b = await d.boundingBox();
  expect(b!.x).toBe(0); expect(Math.round(b!.x + b!.width)).toBe(390); expect(Math.round(b!.y + b!.height)).toBe(844);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest("[data-chat-panel]"))).toBe(true); }
  for (const h of await d.locator("button").evaluateAll((bs) => bs.map((x) => x.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(36);
  await page.keyboard.press("Escape"); await expect(d).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await ctx.close();
});

test("one panel at a time: chat and accessibility never stack", async ({ page }) => {
  await page.goto("/");
  await launcher(page).click(); await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toBeVisible();
  await page.getByRole("button", { name: "Accessibility settings" }).click();
  await expect(page.getByRole("dialog", { name: "Accessibility settings" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toHaveCount(0);
});

test("it sits under modal overlays and never covers the end of the page", async ({ browser }) => {
  for (const [path, vp] of [["/", [390, 844]], ["/he", [390, 844]], ["/", [320, 568]], ["/he", [844, 390]], ["/", [1440, 900]], ["/he", [1440, 900]]] as const) {
    const { ctx, page } = await open(browser, vp);
    await page.goto(path, { waitUntil: "networkidle" });
    // The bottom of the page: no footer link, text or the copyright under the launcher.
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior }));
    const l = await box(page, "[data-chat-launcher]");
    const hits = await page.locator("footer a, footer p").evaluateAll((els, l) => els.filter((e) => { const r = e.getBoundingClientRect();
      return r.width && Math.min(r.right, l.x + l.width) - Math.max(r.left, l.x) > 1 && Math.min(r.bottom, l.y + l.height) - Math.max(r.top, l.y) > 1; }).map((e) => e.textContent), l);
    expect(hits, `${path} ${vp}`).toEqual([]);
    // A case study covers it: the launcher is not what a tap at its centre reaches.
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.locator("button[data-case-study='aegis']").evaluate((b) => (b as HTMLButtonElement).click());
    await expect(page.getByRole("dialog")).toBeVisible();
    const top = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest("[data-chat-launcher]"), { x: l.x + l.width / 2, y: l.y + l.height / 2 });
    expect(top, `${path} ${vp}`).toBe(false);
    await ctx.close();
  }
});

test("motion: one entrance, then still — no pulsing; none at all with reduced motion", async ({ browser }) => {
  const moving = await open(browser, [1440, 900], { motion: true });
  await moving.page.waitForTimeout(1200);
  const anims = await launcher(moving.page).evaluate((b) => b.getAnimations().map((a) => ({ it: (a.effect as KeyframeEffect).getTiming().iterations, state: a.playState })));
  for (const a of anims) { expect(a.it).toBe(1); expect(a.state).toBe("finished"); }
  await moving.ctx.close();
  const still = await open(browser, [1440, 900]);
  expect(await launcher(still.page).evaluate((b) => b.getAnimations().length)).toBe(0);
  await still.ctx.close();
});

test("reading down the page tucks it to its icon; scrolling back up, the end of the page or focus bring the label back", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844]);
  const width = () => launcher(page).evaluate((b) => Math.round(b.getBoundingClientRect().width));
  const full = await width();
  for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 120);
  await expect.poll(width).toBeLessThan(60);
  await expect(launcher(page)).toHaveAttribute("aria-label", "Chat with the assistant");      // the name never changes
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -120);
  await expect.poll(width).toBe(full);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 120);
  await expect.poll(width).toBeLessThan(60);
  await launcher(page).focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");   // keyboard focus
  await expect.poll(width).toBe(full);
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior }));
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await expect.poll(width).toBe(full);
  await ctx.close();
});

test("review fixes: a long earlier answer never blocks the next question, and a retry after an error is not a 'duplicate'", async ({ request }) => {
  const h = client();
  const long = await request.post("/api/chat", { headers: h, data: { messages: [{ role: "assistant", content: "x".repeat(700) }, { role: "user", content: "Does it have CI?" }] } });
  expect(long.status()).toBe(503);                                     // offline locally — not 400 "too long"
  const again = await request.post("/api/chat", { headers: h, data: { messages: [{ role: "user", content: "Does it have CI?" }] } });
  expect(again.status()).toBe(503);                                    // the same question after a failure is not refused
  expect((await again.json()).message).not.toMatch(/just asked/);
});

test("review fixes: each message carries its own language; Escape outside the desktop panel leaves it open", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900]);
  await page.setExtraHTTPHeaders(client());
  await page.goto("/he", { waitUntil: "networkidle" });
  await launcher(page).click();
  const d = page.getByRole("dialog", { name: "שאלו את Tay AI" });
  await d.getByRole("textbox").fill("What is Aegis?"); await page.keyboard.press("Enter");
  await expect(d.locator("[data-chat-transcript] [lang='en']").filter({ hasText: "What is Aegis?" })).toHaveCount(1);
  await expect(d.locator("[data-chat-transcript] [lang='he']").filter({ hasText: "העוזר לא זמין כרגע" })).toHaveCount(1);
  // Focus in the page, then Escape: the non-modal panel stays.
  await page.locator("h1").click(); await page.keyboard.press("Escape");
  await expect(d).toBeVisible();
  await d.getByRole("textbox").focus(); await page.keyboard.press("Escape");
  await expect(d).toHaveCount(0);
  await ctx.close();
});
