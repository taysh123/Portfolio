import { ImageResponse } from "next/og";
import { siteMeta } from "@/data/socials";
import { heroIndex } from "@/data/proof";
import { cine } from "@/lib/tokens";

/**
 * Social card (Concept A, R8): the locked hero in miniature, dark. The field with its two glows and a still of the
 * constellation, the wordmark, the role, the hero's h1 (siteMeta, the one source the page reads too), and the four
 * products' names, as the hero's Featured work lists them. No figures, no availability and no project states (Tay,
 * S21+S22): a card stays cached long after it is shared, and a state such as "Release candidate" will change.
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

const W = size.width, H = size.height;
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const CYAN = rgb(cine.cyan), VIOLET = rgb(cine.violet);
/** The field's colour at a point: cyan at the top right, violet at the bottom left, as on the page. */
const hue = (x: number, y: number, a: number) => {
  const t = Math.min(1, Math.max(0, (x / W + (1 - y / H)) / 2));
  const [r, g, b] = VIOLET.map((v, i) => Math.round(v + (CYAN[i] - v) * t));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** Where the copy sits ([x0, y0, x1, y1]): the wordmark, the domain, the eyebrow and h1, the Featured work strip. */
const COPY = [[56, 40, 520, 116], [950, 50, 1144, 106], [56, 180, 1090, 432], [56, 500, 1144, 592]];
const onCopy = (x: number, y: number, pad = 0) => COPY.some(([x0, y0, x1, y1]) => x > x0 - pad && x < x1 + pad && y > y0 - pad && y < y1 + pad);

/** A still of the hero's field: a fixed, seeded scatter (every build draws the same card), strongest where the copy
 *  isn't, as on the page, with near pairs linked. No node and no link's midpoint on the copy. Decoration only. */
function field() {
  let s = 20261120;
  const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647;
  const nodes: { x: number; y: number; r: number }[] = [];
  while (nodes.length < 46) {
    const x = rnd() * W, y = rnd() * H;
    if (!onCopy(x, y, 12)) nodes.push({ x, y, r: 1.1 + rnd() * 1.5 });
  }
  const links: { a: (typeof nodes)[number]; b: (typeof nodes)[number]; o: number }[] = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const [a, b] = [nodes[i], nodes[j]];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 160 && !onCopy((a.x + b.x) / 2, (a.y + b.y) / 2)) links.push({ a, b, o: 0.34 * (1 - d / 160) });
  }
  return { nodes, links };
}

export default async function OpengraphImage() {
  const { nodes, links } = field();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative",
        backgroundImage: `linear-gradient(180deg, ${cine.abyss} 0%, ${cine.navy} 100%)`, color: cine.ink }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0 }}>
          {/* The sky's two glows, placed and sized as the hero's (.hxa__glow in components/sections/hero.css), with
              its colours and strengths (--cine-glow-cyan, --cine-glow-violet). */}
          <defs>
            <radialGradient id="glow-cyan">
              <stop offset="0" stopColor={cine.cyan} stopOpacity="0.17" />
              <stop offset="1" stopColor={cine.cyan} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-violet">
              <stop offset="0" stopColor={cine.violet} stopOpacity="0.2" />
              <stop offset="1" stopColor={cine.violet} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={0.92 * W} cy={0.04 * H} rx={0.385 * W} ry={0.42 * H} fill="url(#glow-cyan)" />
          <ellipse cx={0.04 * W} cy={1.0 * H} rx={0.432 * W} ry={0.468 * H} fill="url(#glow-violet)" />
          {links.map(({ a, b, o }, i) => (
            <line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hue((a.x + b.x) / 2, (a.y + b.y) / 2, o)} strokeWidth={1} />
          ))}
          {nodes.map((n, i) => <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} fill={hue(n.x, n.y, 0.75)} />)}
        </svg>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%",
          padding: "56px 72px 52px", position: "relative" }}>
          {/* The wordmark (components/ui/Logo.tsx) and the domain. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <svg width={44} height={44} viewBox="0 0 32 32">
                <defs>
                  <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={cine.cyan} />
                    <stop offset="1" stopColor={cine.violet} />
                  </linearGradient>
                </defs>
                <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="none" stroke="url(#ink)" strokeOpacity="0.55" />
                <path d="M11.5 11 6.5 16l5 5M20.5 11l5 5-5 5M17.6 9.5l-3.2 13" fill="none" stroke="url(#ink)"
                  strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: cine.ink }}>
                {run(siteMeta.name.toUpperCase())}
                <span style={{ display: "flex", color: cine.faint }}>{run("  /  PORTFOLIO")}</span>
              </span>
            </div>
            <span style={{ display: "flex", fontSize: 22, color: cine.mist }}>{siteMeta.domain}</span>
          </div>

          {/* The eyebrow and the h1: the second line in the duotone, as on the page. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: cine.cyan }}>
              <div style={{ display: "flex", width: 32, height: 2, background: cine.cyan }} />
              {run(siteMeta.role)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 84, lineHeight: 1.04, letterSpacing: -2.5 }}>
              <span style={{ display: "flex" }}>{run(siteMeta.headlineLines[0])}</span>
              <span style={{ display: "flex", color: "transparent", backgroundClip: "text",
                backgroundImage: `linear-gradient(90deg, ${cine.cyan} 0%, ${cine.violet} 100%)` }}>{run(siteMeta.headlineLines[1])}</span>
            </div>
          </div>

          {/* Featured work: the four names only, under a hairline. */}
          <div style={{ display: "flex", gap: 24, paddingTop: 24, borderTop: "1px solid rgba(238, 242, 251, 0.12)" }}>
            {heroIndex.map((x) => (
              <span key={x.id} style={{ display: "flex", flex: 1, fontSize: 28, color: cine.ink }}>{run(x.name)}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
