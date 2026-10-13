import { ImageResponse } from "next/og";
import { siteMeta } from "@/data/socials";
import { heroIndex } from "@/data/proof";
import { brand } from "@/lib/tokens";

/**
 * Social card (M10): the hero in miniature — paper, the headline, and the four products as plates in their own hues,
 * each with the same verified state the hero shows. No figures, no tracked labels.
 *
 * Satori is flexbox-only (every element needs an explicit `display: flex`) and has no system fonts: next/og's
 * default face is the Geist it bundles, at one weight, so hierarchy comes from scale and ink rather than weight.
 */
export const alt = `${siteMeta.name} — ${siteMeta.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Satori measures each word on its own but draws the line with kerning, so a word with a kerned pair ("software",
 *  "three") is followed by a visibly wider space. Joined with no-break spaces, each line is one measured run and the
 *  spacing comes out even. */
const run = (s: string) => s.replace(/ /g, "\u00a0");

/** A state too long for its plate breaks once, at its phrase boundary ("Available on iOS, Android," / "and the web"),
 *  each line one run; a run never wraps, so without this the plate would clip it. */
const stateLines = (s: string) => { const i = s.indexOf(", and "); return i < 0 ? [s] : [s.slice(0, i + 1), s.slice(i + 2)]; };

const PLATE: Record<string, { bg: string; ink: string; sub: string }> = {
  poker: { bg: brand.platePoker, ink: "#ffffff", sub: "#a9b6cb" },
  aegis: { bg: brand.plateAegis, ink: brand.fgLight, sub: brand.fgMutedLight },
  developeros: { bg: brand.plateDos, ink: "#ffffff", sub: "#a2a9b6" },
  "gravity-flow": { bg: brand.plateGf, ink: "#ffffff", sub: "#aeb8cc" },
};

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "64px 72px 0", background: brand.bgLight, color: brand.fgLight }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: brand.fgMutedLight }}>
          <span style={{ display: "flex", color: brand.fgLight }}>{run(siteMeta.name)}</span>
          <span style={{ display: "flex" }}>{run(`${siteMeta.role} · ${siteMeta.domain}`)}</span>
        </div>
        {/* One line: the headline as a single run (see above), sized to the card's measure. */}
        <div style={{ display: "flex", fontSize: 84, lineHeight: 1, letterSpacing: -2.5 }}>{run(siteMeta.headline)}</div>
        <div style={{ display: "flex", gap: 12, height: 190 }}>
          {heroIndex.map((x) => (
            // T Poker, the shipped product, is the widest plate here as in the hero.
            <div key={x.id} style={{ display: "flex", flexDirection: "column", flex: x.id === "poker" ? 1.15 : 1, padding: "22px 24px",
              borderRadius: "20px 20px 0 0", background: PLATE[x.id].bg }}>
              <span style={{ display: "flex", fontSize: 26, color: PLATE[x.id].ink }}>{run(x.name)}</span>
              <span style={{ display: "flex", flexDirection: "column", fontSize: 19, lineHeight: 1.3, marginTop: 6, color: PLATE[x.id].sub }}>
                {stateLines(x.state).map((l) => <span key={l} style={{ display: "flex" }}>{run(l)}</span>)}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
