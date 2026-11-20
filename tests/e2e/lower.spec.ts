// tests/e2e/lower.spec.ts — the résumé, the lower page on phones and the footer. The Product Plates About, Stack,
// Think · Build · Ship and Contact this file was written for (M10) were replaced by the release's (R1–R15); S20 retired
// their tests (R12) and moved what still applies into lab-work.spec.ts. The résumé's byte size stays pinned here
// (CLAUDE.md: update it with lib/dict.ts's resumeNote whenever the PDF changes).
import { test, expect } from "playwright/test";
import fs from "node:fs";
import crypto from "node:crypto";
import { open, PHONES } from "../support/page";

test("the résumé link serves the exact supplied PDF", async ({ request }) => {
  const r = await request.get("/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toMatch(/application\/pdf/);
  const body = await r.body();
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
  const sha = (b: Buffer) => crypto.createHash("sha256").update(b).digest("hex");
  expect(sha(body)).toBe(sha(fs.readFileSync("public/resume/Tay-Shofer-Software-Engineer-Resume.pdf")));
  expect(body.length).toBe(80593);
});

// The sections under Work, by their live ids (R7), on every phone.
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

test("the footer concludes the page: identity and role, the channels, the résumé, a way back up, and this year's copyright", async ({ page }) => {
  await page.goto("/");
  const f = page.locator("footer");
  await expect(f).toContainText("Tay Shofer · Software Engineer");
  await expect(f.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveText(["Email", /^GitHub/, /^LinkedIn/, "Résumé (PDF)", "Privacy", "Back to top"]);
  await expect(f.getByRole("link", { name: "Back to top" })).toHaveAttribute("href", "#hero");
  await expect(f).toContainText(`© ${new Date().getFullYear()} Tay Shofer · \u05e9\u05d5\u05e4\u05e8 \u05d8\u05d0\u05d9`);
  const legal = f.locator('span[lang="he"]');
  await expect(legal).toHaveText("\u05e9\u05d5\u05e4\u05e8 \u05d8\u05d0\u05d9");
  await expect(legal).toHaveAttribute("dir", "rtl");
  await expect(legal).toBeVisible();
});
