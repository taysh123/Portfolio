"use client";

import { Pic } from "@/components/ui/Pic";
import { srcSet, fallback, IMAGES } from "@/data/images";

/** Each capture is requested with the exact `sizes` the hero or its chapter above already used, so the browser picks
 *  the same file and About costs no new bytes on a visit that scrolls down to it (measured at desktop and phone
 *  widths). DeveloperOS uses its chapter's phone crop below 640px, as the chapter does. */
const SIZES = {
  dos: "(min-width: 1024px) 760px, 94vw",                                  // DeveloperOSChapter
  aegis: "(min-width: 1240px) 24vw, (min-width: 640px) 42vw, 40vw",         // Hero (the Aegis plate)
  poker: "(min-width: 1024px) 240px, 200px",                                // PokerChapter
  gf: "(min-width: 1024px) 290px, 60vw",                                    // GravityChapter
};

/**
 * About's visual (2026-10-13; it replaces the 3D workstation render): the four products laid on one table — real
 * captures only (DeveloperOS's search, Aegis's incident board, a GRAVITY FLOW level, T Poker's settlement), each in
 * its own window or phone, overlapping like work in progress. No text is drawn into any image and there is no caption.
 *
 * It is HTML and CSS, not a picture of one: sharp at every pixel density, re-laid out right-to-left on the Hebrew page
 * (positions mirror, the captures never do), and re-coloured with the theme. Its captures are the ones the chapters
 * above it already load. The motion is CSS scroll-driven animation (about.css): as the section scrolls in, the layers
 * settle from a slight spread into place, then drift a few pixels apart in depth while it crosses the screen — off the
 * main thread, still whenever the page is still, and absent with reduced motion or where the browser lacks
 * scroll timelines (the rest frame below is the design either way). One accessible name for the whole group; the
 * layers inside are presentational.
 *
 * A client component only so that its markup (four pictures' worth of srcset) is not written into the page's
 * serialized server tree a second time: it has no state and no effects, and renders the same HTML on the server.
 */
export function AboutVisual({ label }: { label: string }) {
  return (
    <div className="av" role="img" aria-label={label} data-about-visual>
      <div className="av__plate">
        <div className="av__layer av__layer--dos">
          <div className="av__win"><span className="av__bar"><i /><i /><i /></span>
            <picture>
              <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet("dos-search-phone", "avif")} sizes="100vw" />
              <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet("dos-search-phone", "webp")} sizes="100vw" />
              <source type="image/avif" srcSet={srcSet("dos-search", "avif")} sizes={SIZES.dos} />
              <img src={fallback("dos-search")} srcSet={srcSet("dos-search", "webp")} sizes={SIZES.dos} alt=""
                width={IMAGES["dos-search"].w} height={IMAGES["dos-search"].h} loading="lazy" decoding="async" />
            </picture>
          </div>
        </div>
        <div className="av__layer av__layer--gf">
          <div className="av__phone"><Pic name="gf-gameplay" alt="" sizes={SIZES.gf} /></div>
        </div>
        <div className="av__layer av__layer--aegis">
          <div className="av__win"><span className="av__bar"><i /><i /><i /></span>
            <Pic name="hero-aegis" alt="" sizes={SIZES.aegis} />
          </div>
        </div>
        <div className="av__layer av__layer--poker">
          <div className="av__phone"><Pic name="poker-settle" alt="" sizes={SIZES.poker} /></div>
        </div>
      </div>
    </div>
  );
}
