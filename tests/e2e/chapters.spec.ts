// tests/e2e/chapters.spec.ts — the four product chapters (M10 storyboards and the known-defect list).
import { test, expect } from "playwright/test";
import { open, PHONES, CHAPTERS } from "../support/page";

test.describe("T Poker", () => {
  for (const vp of PHONES) {
    test(`${vp[0]}px: the stepper is three equal parts in one row — no orphan`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp);
      const parts = await page.locator(".pstep").evaluateAll((ls) => ls.map((l) => { const r = l.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; }));
      expect(parts).toHaveLength(3);
      expect(new Set(parts.map((p) => p.y)).size).toBe(1);
      expect(Math.max(...parts.map((p) => p.w)) - Math.min(...parts.map((p) => p.w))).toBeLessThanOrEqual(1);
      // Every label fits its part: no text spills past the segment.
      const spill = await page.locator(".pstep > span").evaluateAll((ss) => ss.filter((s) => s.scrollWidth > s.clientWidth + 1).length);
      expect(spill).toBe(0);
      await ctx.close();
    });
  }

  test("a radio group: each step brings its real screen to the front, is described, and arrow keys move it", async ({ browser }) => {
    const { ctx, page } = await open(browser, [1440, 900]);
    const front = () => page.locator(".pphone").evaluateAll((ps) => ps.map((p) => getComputedStyle(p).zIndex).indexOf("3"));
    expect(await front()).toBe(1);                                              // the default: run the tournament
    const radios = page.getByRole("radio", { name: /Start a game|Run the tournament|Settle up/ });
    await expect(radios).toHaveCount(3);
    for (const [k, name] of [[0, "Start a game"], [2, "Settle up"], [1, "Run the tournament"]] as const) {
      const r = page.getByRole("radio", { name }); await r.check();
      expect(await front(), name).toBe(k);
      await expect(page.locator(`.pcaption[data-step="${k}"]`)).toBeVisible();
      expect(await r.getAttribute("aria-describedby")).toBe(`poker-step-${k}`);
    }
    await page.getByRole("radio", { name: "Run the tournament" }).focus();
    await page.keyboard.press("ArrowRight"); await expect(page.getByRole("radio", { name: "Settle up" })).toBeChecked();
    expect(await front()).toBe(2);
    // The screens are the real captures, with real descriptions.
    for (const img of await page.locator(".pphone img").all()) expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(30);
    await ctx.close();
  });

  test("works with JavaScript off: choosing a step still brings its screen to the front", async ({ browser }) => {
    const { ctx, page } = await open(browser, [390, 844], { js: false });
    await page.locator('.pstep input[data-step="0"]').check();
    expect(await page.locator(".pphone").evaluateAll((ps) => ps.map((p) => getComputedStyle(p).zIndex).indexOf("3"))).toBe(0);
    await expect(page.locator('.pcaption[data-step="0"]')).toBeVisible();
    await expect(page.locator(".case-study-trigger").first()).toBeHidden();       // a dialog needs script: not offered
    await ctx.close();
  });

  test("ships where it says: both live store listings, the web app, the private-repository label — and no retired figures", async ({ page }) => {
    await page.goto("/");
    const ch = page.locator("#work-poker");
    await expect(ch.locator('a[href="https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023"]')).toHaveCount(1);
    await expect(ch.locator('a[href="https://play.google.com/store/apps/details?id=com.tpoker.app"]')).toHaveCount(1);
    await expect(ch.getByRole("link", { name: /Google Play — T Poker/ })).toHaveCount(1);
    await expect(ch.locator('a[href="https://app.tpoker.app/"]')).toHaveCount(1);
    await expect(ch.locator("[data-private-repo]")).toHaveText("Private repository");
    // The lockup is the owner's artwork, not redrawn type.
    expect(await ch.locator(".poker__lockup img").evaluateAll((is) => is.map((i) => (i as HTMLImageElement).currentSrc.replace(/^.*\/work\//, "")))).toEqual(
      expect.arrayContaining([expect.stringMatching(/^tpoker-icon-\d+\.(avif|webp)$/), expect.stringMatching(/^tpoker-wordmark-\d+\.(avif|webp)$/)]));
    await ch.locator("button[data-case-study]").click();
    const panel = page.getByRole("dialog");
    await expect(panel.getByRole("heading", { name: "T Poker", exact: true })).toBeVisible();
    await expect(panel).not.toContainText("6,210"); await expect(panel).not.toContainText(/CI jobs/);
    await expect(panel.getByRole("link", { name: /App Store — T Poker/ }).first()).toBeVisible();
  });
});

test.describe("T Poker on desktop", () => {
  for (const vp of [[1440, 900], [1280, 700]] as const) {
    test(`${vp[0]}×${vp[1]}: the product on the left, the story on the right, and Tab moves left to right — stepper, stores, Case study, web app`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp);
      const box = (sel: string) => page.locator(`#work-poker ${sel}`).evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right }; });
      const stage = await box(".pstepper"), copy = await box(".poker__copy"), head = await box(".poker__head");
      expect(stage.right).toBeLessThanOrEqual(copy.left); expect(head.left).toBe(copy.left);
      // Focus starts just before the chapter and walks its controls.
      await page.locator("#work-poker").evaluate((s) => { const a = document.createElement("a"); a.href = "#"; a.id = "__before"; a.textContent = "x"; s.prepend(a); });
      await page.locator("#__before").focus();
      const stops: { name: string; x: number }[] = [];
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        stops.push(await page.evaluate(() => { const e = document.activeElement as HTMLElement; const t = e.matches("input") ? e.parentElement! : e;
          return { name: (e.getAttribute("aria-label") || t.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30), x: Math.round(t.getBoundingClientRect().left) }; }));
      }
      const names = stops.map((s) => s.name);
      expect(names[0], JSON.stringify(names)).toMatch(/Run the tournament/);          // the radio group is one stop
      expect(names.slice(1, 5), JSON.stringify(names)).toEqual([expect.stringMatching(/App Store/), expect.stringMatching(/Google Play/), "Case study", expect.stringMatching(/^Open the web app/)]);
      // Never back to the left: every stop after the stepper sits in the right-hand column.
      for (const s of stops.slice(1, 5)) expect(s.x, s.name).toBeGreaterThanOrEqual(copy.left - 1);
      expect(stops[0].x).toBeLessThan(copy.left);
      await ctx.close();
    });
  }
});

test.describe("Aegis", () => {
  test("one alert, start to finish: ingest → normalise → detect, then the parallel fork, then live", async ({ page }) => {
    await page.goto("/");
    const trace = page.locator("#work-aegis .trace__list");
    expect(await trace.locator(":scope > li").evaluateAll((ls) => ls.map((l) => l.querySelector(".trace__then")?.textContent ?? l.querySelector(".trace__name")?.textContent))).toEqual(
      ["Ingest", "Normalise", "Detect", "Then, in parallel", "Live"]);
    await expect(trace.locator(".trace__branches > li .trace__name")).toHaveText(["Threat scoring", "Alert stream"]);
    await expect(page.locator("#work-aegis")).toContainText("RabbitMQ");
    await expect(page.locator("#work-aegis")).toContainText("PostgreSQL schema");
    await expect(page.locator("#work-aegis")).not.toContainText(/open source/i);
  });

  test("wide: the fork is drawn — both branches start on the main line's row, the alert stream and Live share the row below", async ({ browser }) => {
    const { ctx, page } = await open(browser, [1440, 900]);
    const box = (sel: string) => page.locator(`#work-aegis ${sel}`).evaluate((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; });
    const detect = await box('[data-k="detect"]'), score = await box('[data-k="score"]'), alert = await box('[data-k="alert"]'), live = await box('[data-k="live"]');
    expect(score.top).toBe(detect.top);
    expect(alert.top).toBeGreaterThan(score.top); expect(alert.left).toBe(score.left);
    expect(live.top).toBe(alert.top); expect(live.left).toBeGreaterThan(alert.left);
    await ctx.close();
  });

  for (const vp of [[1440, 900], [390, 844]] as const) {
    test(`${vp[0]}px: the highlight frames the real port-scan row, and the note says what Detect counted`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp);
      const shot = page.locator("#work-aegis .console__shot");
      await shot.scrollIntoViewIfNeeded();
      await expect.poll(() => shot.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
      // The row in the capture's pixels (card 644–775 of 2160) mapped through the crop the browser picked.
      const r = await shot.evaluate((s) => {
        const img = s.querySelector("img")!, hl = s.querySelector<HTMLElement>(".console__hl")!.getBoundingClientRect(), ir = img.getBoundingClientRect();
        const phone = (img as HTMLImageElement).currentSrc.includes("aegis-alerts-phone");
        // The crops in data/images.ts (AEGIS_CROPS): the port-scan row alone — desktop 492,612 1148×200; phone 500,612 1060×200.
        const crop = { top: 612, height: 200 };
        const y = (v: number) => ir.top + ((v - crop.top) / crop.height) * ir.height;
        const note = s.closest(".aegis__evidence")!.querySelector(".console__note")!.getBoundingClientRect();
        // The note may sit beside the console or below it, never over the highlighted row.
        const overlap = note.left < hl.right && note.right > hl.left && note.top < hl.bottom && note.bottom > hl.top;
        return { phone, hlTop: hl.top, hlBottom: hl.bottom, rowTop: y(644), rowBottom: y(775), overlap };
      });
      expect(r.phone).toBe(vp[0] < 640);
      expect(r.hlTop).toBeLessThanOrEqual(r.rowTop + 1); expect(r.hlBottom).toBeGreaterThanOrEqual(r.rowBottom - 1);
      expect(r.hlBottom - r.hlTop).toBeLessThan((r.rowBottom - r.rowTop) * 1.4);
      expect(r.overlap, "the note covers the row it describes").toBe(false);
      await expect(page.locator("#work-aegis .console__note")).toContainText("Port scan detected from 10.10.10.2 (20 distinct ports in 60s)");
      await expect(page.locator('#work-aegis [data-k="detect"]')).toContainText("20 in 60 seconds");
      await ctx.close();
    });
  }

  test("the product comes straight after the heading: title and actions, then the console, then the trace", async ({ browser }) => {
    for (const vp of [[1440, 900], [390, 844]] as const) {
      const { ctx, page } = await open(browser, vp);
      const [head, ev, trace] = await page.evaluate(() => ["#work-aegis .aegis__head", "#work-aegis .aegis__evidence", "#work-aegis .trace"].map((s) => { const r = document.querySelector(s)!.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }));
      expect(ev.top, `${vp[0]}`).toBeGreaterThanOrEqual(head.bottom - 1);
      expect(trace.top, `${vp[0]}`).toBeGreaterThanOrEqual(ev.bottom - 1);
      await ctx.close();
    }
  });

  test("390px: the trace is a single column with the fork as two branches — no 3×2 label grid — and Live follows the alert stream", async ({ browser }) => {
    const { ctx, page } = await open(browser, [390, 844]);
    const xs = await page.locator("#work-aegis .trace__list > li:not([data-k=live])").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().left)));
    expect(new Set(xs).size).toBe(1);
    const br = await page.locator("#work-aegis .trace__branches > li").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top)));
    expect(br[0]).toBe(br[1]);
    // Live sits under the alert stream's branch (the right-hand one), not under threat scoring.
    const box = (k: string) => page.locator(`#work-aegis [data-k="${k}"]`).evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; });
    const alert = await box("alert"), score = await box("score"), live = await box("live");
    expect(alert.left).toBeGreaterThan(score.right);
    expect(Math.abs(live.left - alert.left)).toBeLessThanOrEqual(2);
    expect(live.top).toBeGreaterThan(alert.bottom);
    await ctx.close();
  });

  test("the case study renames the score decision and keeps the honest schema note", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work-aegis button[data-case-study]").click();
    const panel = page.getByRole("dialog");
    await expect(panel).not.toContainText("Threat scores you can argue with");
    await expect(panel).toContainText("A score that keeps its inputs");
    await expect(panel).toContainText("share one PostgreSQL schema");
  });
});

test.describe("DeveloperOS", () => {
  test("index → retrieve → evidence → cite, or decline, as a readable sequence", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work-developeros .flow > li > b")).toHaveText(["Index", "Retrieve", "Evidence", "Cite", "Or decline"]);
    await expect(page.locator("#work-developeros .flow")).toContainText("No model is called");
  });

  test("the refusal is real text, in the app's own words, not a picture of text", async ({ page }) => {
    await page.goto("/");
    const ui = page.locator("#work-developeros .refusal__ui");
    await expect(ui).toContainText("I don't have enough indexed material to teach that. Try devos index <path>, give a file path, or rephrase the topic. (Not guessing.)");
    await expect(ui).toContainText("Not enough of your indexed code matched this.");
    await expect(ui.locator("img")).toHaveCount(0);
    await expect(ui.locator("code")).toHaveText("devos index <path>");
  });

  for (const vp of [[1440, 900], [390, 844]] as const) {
    test(`${vp[0]}px: each citation box sits on a file:line chip of the real capture`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp);
      const shot = page.locator("#work-developeros .dwin__shot"); await shot.scrollIntoViewIfNeeded();
      await expect.poll(() => shot.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
      const boxes = await shot.evaluate((s) => { const ir = s.querySelector("img")!.getBoundingClientRect(); const phone = (s.querySelector("img") as HTMLImageElement).currentSrc.includes("dos-search-phone");
        const H = phone ? 612 : 1027; return { phone, b: [...s.querySelectorAll(".cbox")].map((c) => { const r = c.getBoundingClientRect(); return ((r.top + r.bottom) / 2 - ir.top) / ir.height * H; }) }; });
      expect(boxes.phone).toBe(vp[0] < 640);
      // The chips' centres on the 1600×1027 capture (the phone crop starts at its top-left, so the pixels are shared).
      for (const [i, c] of [195.5, 351.5, 507.5].entries()) expect(Math.abs(boxes.b[i] - c), `box ${i}`).toBeLessThan(6);
      await ctx.close();
    });
  }

  test("phones read title, the window, then actions and the sequence, in DOM order too; below 1280 the capture takes the full width", async ({ browser }) => {
    // DOM (and phone) order: title, window, actions, sequence, refusal. From 900px the actions rise above the window.
    const sels = [".dos__head", ".dwin", ".dos__actions", ".flow", ".refusal"].map((s) => `#work-developeros ${s}`);
    for (const vp of [[390, 844], [1024, 768], [1440, 900]] as const) {
      const { ctx, page } = await open(browser, vp);
      const r = await page.evaluate((sels) => {
        const els = sels.map((s) => document.querySelector(s)!);
        const dom = els.every((e, i) => i === 0 || !!(els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
        const grid = document.querySelector("#work-developeros .dos__grid")!.getBoundingClientRect();
        return { dom, tops: els.map((e) => e.getBoundingClientRect().top), win: els[2].getBoundingClientRect().width, grid: grid.width };
      }, sels);
      expect(r.dom).toBe(true);
      if (vp[0] < 1280) {
        const visual = vp[0] < 900 ? r.tops : [r.tops[0], r.tops[2], r.tops[1], r.tops[3], r.tops[4]];
        expect([...visual].sort((a, b) => a - b), `${vp[0]}`).toEqual(visual);
        // Full width of the column: the phone crop bleeds half the gutter on each side.
        expect(r.win, `${vp[0]}`).toBeGreaterThanOrEqual(r.grid - 1);
      } else {
        expect(r.win, `${vp[0]}`).toBeLessThan(r.grid * 0.7);                                  // two columns
      }
      await ctx.close();
    }
  });

  test("Released · v1.0.0 links the release page; Source on GitHub links the repository", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work-developeros").getByRole("link", { name: /Released · v1\.0\.0/ })).toHaveAttribute("href", "https://github.com/taysh123/DeveloperOS/releases");
    await expect(page.locator("#work-developeros").getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute("href", "https://github.com/taysh123/DeveloperOS");
  });
});

test.describe("GRAVITY FLOW", () => {
  test("gameplay leads: the real frame, the mechanic marked on it, and no test count or physics claim", async ({ page }) => {
    await page.goto("/");
    const ch = page.locator("#work-gravity-flow");
    const img = ch.locator(".gf__phone--main img"); await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect(await img.getAttribute("alt")).toMatch(/gravity well/);
    await expect(ch.locator(".gf__mark span")).toHaveText(["Your gravity well", "The star", "Home"]);
    await expect(ch.locator(".chapter__lede")).toHaveText("Press and hold to place a gravity well, and pull a lost star home.");
    const text = await ch.textContent();
    expect(text).not.toMatch(/\btests?\b|1,277|hand-tuned|precise|accurate|fair physics/i);
    await expect(ch).toContainText("not yet in a store");
  });
  test("wide: the game is on the left; phones read title → game → story, and so does the DOM", async ({ browser }) => {
    for (const vp of [[1440, 900], [390, 844]] as const) {
      const { ctx, page } = await open(browser, vp);
      const r = await page.evaluate(() => {
        const els = ["#work-gravity-flow-title", "#work-gravity-flow .gf__stage", "#work-gravity-flow .gf__story"].map((s) => document.querySelector(s)!);
        const dom = els.every((e, i) => i === 0 || !!(els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { dom, boxes: els.map((e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top }; }) };
      });
      expect(r.dom, `${vp[0]}`).toBe(true);
      const [title, stage, story] = r.boxes;
      if (vp[0] >= 900) expect(stage.x, `${vp[0]}`).toBeLessThan(title.x);
      else { expect(title.y).toBeLessThan(stage.y); expect(stage.y).toBeLessThan(story.y); }
      await ctx.close();
    }
  });

  test("the teal plate carries its glow in both themes", async ({ browser }) => {
    for (const theme of ["light", "dark"] as const) {
      const { ctx, page } = await open(browser, [1440, 900], { theme });
      expect(await page.locator("#work-gravity-flow").evaluate((s) => getComputedStyle(s).backgroundImage), theme).toMatch(/radial-gradient/);
      await ctx.close();
    }
  });
});

test.describe("Navigation", () => {
  for (const vp of [[1440, 900], [1280, 720], [390, 844]] as const) {
    test(`${vp[0]}×${vp[1]}: a jump lands the settled chapter under the header, its action is visible and opaque at once`, async ({ browser }) => {
      const { ctx, page } = await open(browser, vp, { motion: true });
      for (const id of CHAPTERS) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
        await page.evaluate((id) => { location.hash = `#work-${id}`; }, id);
        await expect.poll(() => page.evaluate((id) => Math.abs(document.getElementById(`work-${id}`)!.getBoundingClientRect().top - document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom), id), { message: id, timeout: 5000 }).toBeLessThan(1);
        // Nothing in the chapter is still moving or fading in: the layout is final the moment it lands.
        const settled = await page.locator(`#work-${id}`).evaluate((s) => [...s.querySelectorAll<HTMLElement>("*")].every((e) => { const cs = getComputedStyle(e); return cs.opacity !== "0" || e.closest(".pcaption, [aria-hidden=true], .sr-only, .pstep input"); }) && s.getAnimations({ subtree: true }).length === 0);
        expect(settled, id).toBe(true);
        // The chapter's action, scrolled to, is clear of the sticky header and is the element under its own centre.
        const btn = page.locator(`#work-${id} button[data-case-study]`);
        await btn.scrollIntoViewIfNeeded();
        expect(await btn.evaluate((b) => { const r = b.getBoundingClientRect(), nav = document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom;
          return r.top >= nav && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest("button") === b && getComputedStyle(b).opacity === "1"; }), id).toBe(true);
      }
      await ctx.close();
    });
  }
});

test.describe("Case study", () => {
  test("Enter opens, Escape closes, focus returns to the opener — loaded on demand", async ({ page }) => {
    const chunks: string[] = []; page.on("response", (r) => { if (r.url().endsWith(".js")) chunks.push(r.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    const before = chunks.length;
    const opener = page.locator("button[data-case-study='developeros']");
    await opener.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(chunks.length).toBeGreaterThan(before);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("triggers: six native buttons that announce a dialog and open with Space and Enter", async ({ page }) => {
    await page.goto("/");
    const triggers = page.locator("button[data-case-study]");
    await expect(triggers).toHaveCount(6);
    for (const t of await triggers.all()) await expect(t).toHaveAttribute("aria-haspopup", "dialog");
    for (const key of ["Space", "Enter"]) {
      const t = page.locator("button[data-case-study='aegis']"); await t.focus(); await page.keyboard.press(key);
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toBeHidden(); await expect(t).toBeFocused();
    }
  });

  test("a press made before hydration is not lost", async ({ page }) => {
    let release!: () => void; const gate = new Promise<void>((r) => (release = r));
    await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => { await gate; await route.continue(); });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const opener = page.locator("button[data-case-study='aegis']");
    await opener.scrollIntoViewIfNeeded(); await opener.click();
    expect(await page.evaluate(() => (window as unknown as { __csReady?: boolean }).__csReady)).toBeFalsy();
    release();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("dialog")).toContainText("Aegis");
  });

  test("every case study's images finish loading", async ({ page }) => {
    await page.goto("/");
    for (const id of ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"]) {
      const opener = page.locator(`button[data-case-study='${id}']`); await opener.scrollIntoViewIfNeeded(); await opener.click();
      const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible();
      for (const img of await dialog.locator("img").all()) { await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0), { timeout: 15000, message: id }).toBe(true); }
      await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });
});
