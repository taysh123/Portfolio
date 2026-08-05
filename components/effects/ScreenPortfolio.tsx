import { siteMeta, heroStats } from "@/data/socials";

/**
 * What is on the laptop's display: the portfolio itself.
 *
 * WHY THIS REPLACED THE BOOT LOG. The old screen ran a fake terminal and then
 * a fake code workspace — content that exists nowhere else on the site. So the
 * camera pushed through the display and the reader arrived somewhere
 * completely different from what they had been looking at, which is a CUT, and
 * a cut is the one thing the sequence is supposed not to be. The push only
 * reads as a continuous camera move if what is inside the screen is the thing
 * you are moving into.
 *
 * So this is a miniature of the site's own opening: the same wordmark, the
 * same role line, the same statement, the same proof strip, in the same type
 * and the same colours. As the camera closes in, the small version grows into
 * the real one and the join is invisible.
 *
 * EVERYTHING IS SIZED IN `cqw`. The display's width is the container, so the
 * layout is identical whether it renders at 300px on a phone or at 8x that at
 * the end of the push. A rem-based miniature would fall apart at both ends.
 *
 * Server Component, and `aria-hidden` upstream: this is a picture of content
 * that exists for real below, and announcing it twice would make a screen
 * reader read the whole hero before reaching the hero.
 */
export function ScreenPortfolio() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      /*
        THE DISPLAY IS THE ONLY BRIGHT OBJECT IN THE FRAME, and it has to earn
        that on a body that is now near-black.

        In the reference the machine is dark and the site on its screen is
        white, and that inversion is most of the drama. This portfolio is
        dark-themed, so going white here would buy the contrast and lose the
        continuity — the camera pushes THROUGH this panel into the real hero,
        and arriving somewhere a different colour is the cut the whole sequence
        exists to avoid.

        So the screen stays dark and gets brighter instead: its blacks are
        lifted well above the chassis's, so the panel reads as emitting rather
        than as a hole. Measured against the shell's #101218 base, this bottoms
        out at #10162a — lighter, and bluer, which is what a lit LCD looks like
        next to anodised aluminium.
      */
      style={{
        background:
          "radial-gradient(120% 90% at 16% -4%, #24304f 0%, #182444 34%, #121a33 68%, #10162a 100%)",
      }}
    >
      {/* The site's own aurora, at screen scale. */}
      <span
        className="pointer-events-none absolute left-[14%] top-[-18%] h-[70cqw] w-[70cqw] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(150,110,255,0.30), rgba(91,141,239,0.18) 52%, transparent 76%)",
          filter: "blur(6cqw)",
        }}
      />

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-between"
        style={{
          padding: "2.6cqw 3.4cqw",
          borderBottom: "0.1cqw solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center" style={{ gap: "1.2cqw" }}>
          <span
            className="inline-flex items-center justify-center"
            style={{
              width: "3cqw",
              height: "3cqw",
              borderRadius: "0.8cqw",
              border: "0.1cqw solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <span
            style={{
              fontSize: "1.35cqw",
              letterSpacing: "0.18em",
              color: "#f1f3f9",
              fontWeight: 600,
            }}
          >
            TAY SHOFER
          </span>
        </div>
        <div className="flex items-center" style={{ gap: "2.4cqw" }}>
          {["About", "Work", "Toolkit", "Contact"].map((item) => (
            <span
              key={item}
              style={{ fontSize: "1.25cqw", color: "rgba(167,175,194,0.85)" }}
            >
              {item}
            </span>
          ))}
          <span
            style={{
              fontSize: "1.2cqw",
              color: "#05070d",
              background: "#f1f3f9",
              borderRadius: "10cqw",
              padding: "0.9cqw 2cqw",
              fontWeight: 600,
            }}
          >
            Get in touch
          </span>
        </div>
      </div>

      {/* ── The hero, in miniature ───────────────────────────────────── */}
      <div className="relative" style={{ padding: "5.5cqw 3.4cqw 0" }}>
        <div className="flex items-center" style={{ gap: "1.4cqw" }}>
          <span
            style={{
              display: "inline-block",
              width: "3.4cqw",
              height: "0.12cqw",
              background: "#5b8def",
            }}
          />
          <span
            style={{
              fontSize: "1.1cqw",
              letterSpacing: "0.18em",
              color: "#8a93a8",
              textTransform: "uppercase",
            }}
          >
            {siteMeta.role}
          </span>
        </div>

        <p
          style={{
            marginTop: "2.6cqw",
            fontSize: "6.4cqw",
            lineHeight: 0.94,
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "#f1f3f9",
            textTransform: "uppercase",
          }}
        >
          {siteMeta.name}
        </p>

        <p
          style={{
            marginTop: "2.4cqw",
            maxWidth: "48cqw",
            fontSize: "1.7cqw",
            lineHeight: 1.45,
            color: "#a7afc2",
          }}
        >
          Everything here runs.{" "}
          <span style={{ color: "#5b8def" }}>Come in and check.</span>
        </p>

        {/* Proof strip — the same figures the real hero carries. */}
        <div
          className="flex"
          style={{
            marginTop: "5cqw",
            gap: "0.1cqw",
            borderTop: "0.1cqw solid rgba(255,255,255,0.07)",
          }}
        >
          {heroStats.map((s) => (
            <div key={s.label} style={{ flex: 1, padding: "2.2cqw 0 0" }}>
              <p
                style={{
                  fontSize: "2.4cqw",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "#f1f3f9",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  marginTop: "0.9cqw",
                  fontSize: "1.05cqw",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#8a93a8",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
