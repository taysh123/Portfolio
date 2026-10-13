// T Poker is published on both stores (user confirmation, 2026-09-26). Store badges link only to live listings.
import { it, expect } from "vitest";
import { projects } from "@/data/projects";

it("T Poker links both live store listings — canonical URLs, no tracking parameters", () => {
  const poker = projects.find((p) => p.id === "poker")!;
  expect(poker.stores).toEqual([
    { platform: "ios", status: "live", url: "https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023" },
    { platform: "android", status: "live", url: "https://play.google.com/store/apps/details?id=com.tpoker.app" },
  ]);
  for (const s of poker.stores!) expect(s.url).not.toMatch(/pcampaignid|utm_/);
});

it("the case study no longer claims the Android build is unpublished", () => {
  const poker = projects.find((p) => p.id === "poker")!;
  expect(JSON.stringify(poker)).not.toMatch(/not been published|Play Console listing/);
});

it("every live listing has a URL; a listing without one is never marked live", () => {
  for (const p of projects) for (const s of p.stores ?? []) if (s.status === "live") expect(s.url, `${p.id} ${s.platform}`).toMatch(/^https:\/\//);
});
