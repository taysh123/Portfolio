import { ImageResponse } from "next/og";
import { siteMeta } from "@/data/socials";
import { brand } from "@/lib/tokens";

/**
 * Social card.
 *
 * Runs on the Node runtime, not edge — the previous `runtime = "edge"` is
 * unsupported alongside Cache Components, and Node makes loading a local font
 * file straightforward if the Geist woff2 is ever added to the repo.
 *
 * Note on type: Satori has NO system fonts. `fontFamily: "system-ui"` silently
 * fell back to its bundled Noto Sans, so the old card wasn't rendering in Geist
 * at all and looked like a different brand from the site. Until a real font
 * file is loaded here, the card leans on weight, scale and layout for its
 * identity rather than pretending to match the site's typeface.
 *
 * Satori is flexbox-only — no CSS grid — and every element needs an explicit
 * `display: flex`.
 */

/**
 * The social card's own proof points (moved here from `data/socials.ts` when the page stopped using them,
 * Plan 2 Task 23). Every figure is verifiable from the repositories. The test count is the sum across the
 * five self-directed projects: T Poker 677 + 215, DeveloperOS 363, GRAVITY FLOW 220, Job Assistant 162,
 * Aegis 103 + 2. Deliberately not a project count: the lead stat is that something runs in production.
 */
const CARD_STATS = [
  { value: "Live", label: "In production today" },
  { value: "1,742", label: "Tests across the work" },
  { value: "B.Sc.", label: "Computer Science" },
] as const;

export const alt = `${siteMeta.name} — ${siteMeta.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 76,
          background: `radial-gradient(58% 60% at 12% 4%, rgba(91,156,255,0.26), transparent 62%), radial-gradient(52% 56% at 96% 10%, rgba(155,190,255,0.14), transparent 62%), ${brand.bg}`,
          color: brand.fg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: 1,
              color: brand.fg,
            }}
          >
            TS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              letterSpacing: 5,
              color: brand.fgSubtle,
              textTransform: "uppercase",
            }}
          >
            {siteMeta.domain}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2.4,
              maxWidth: 1000,
            }}
          >
            <span style={{ display: "flex" }}>I build software&nbsp;</span>
            <span style={{ display: "flex" }}>people can&nbsp;</span>
            <span style={{ display: "flex", color: brand.accent }}>actually use.</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: brand.fgMuted,
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            {siteMeta.name} — {siteMeta.role}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", gap: 46 }}>
            {CARD_STATS.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
                  {s.value}
                </span>
                <span
                  style={{
                    display: "flex",
                    fontSize: 15,
                    letterSpacing: 2.4,
                    color: brand.fgSubtle,
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <span
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 2.4,
              color: brand.fgSubtle,
              textTransform: "uppercase",
            }}
          >
            github.com/taysh123
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
