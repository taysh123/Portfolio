"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";

/**
 * A laptop, built from layered CSS gradients in a `preserve-3d` scene.
 *
 * WHY NOT WEBGL. The display holds live DOM — that is the entire reason the
 * camera can push through it and the boot log stays crisp instead of turning
 * into a blurry texture. A three.js scene would need render-to-texture to do
 * the same, costs ~150kb plus a model to source and license, and buys nothing
 * this composition actually needs. What made the earlier version read as an
 * illustration was not the technique, it was the material detail. So material
 * detail is what this file is about.
 *
 * WHAT MAKES METAL LOOK REAL, in the order it matters:
 *
 *   1. Silhouette. A laptop is a WEDGE — the deck tapers toward the viewer and
 *      the front lip is thin. A rectangle rotated on X is a monitor on a stand.
 *   2. The chamfer. One bright diamond-cut line, offset from the body and
 *      brightest where the surface faces the light. It is the single most
 *      recognisable cue in this class of product.
 *   3. A specular BAND, not a linear ramp. Brushed aluminium has a tight bright
 *      zone where the normal faces the light, falling off both ways. A two-stop
 *      gradient always reads as plastic.
 *   4. A hinge barrel — a visible cylinder, darker than both surfaces it joins.
 *      Without it the lid looks glued on.
 *   5. Glass. A powered-off panel reflects the room; it is never a flat fill.
 *   6. Two shadows, not one: a tight contact shadow that sells contact, and a
 *      wide soft occlusion that sells mass. One blurred ellipse reads as a
 *      sticker.
 *   7. The deck is not a flat slab. Seen at a grazing angle it is dark in the
 *      lid's shadow, brightens across the palm rest where the surface turns
 *      toward the light, and darkens again into the front lip. Three zones,
 *      not one fill.
 *   8. A keyboard is recognisable by its ROW STRUCTURE long before any legend
 *      is legible: a short function row, four full rows, and a bottom row
 *      dominated by one very wide key. Fourteen identical bars read as a
 *      grille; these proportions read as a keyboard at 6px per row.
 */

/**
 * Keycap layout, as flex weights.
 *
 * `h` is the row's height relative to a full row — the function row is
 * genuinely shorter on this class of machine, and that difference is most of
 * why the block reads as a keyboard. Each number is one key's width relative
 * to a letter key, so the wide keys (tab, caps, return, shift, space) land
 * where a reader expects them without a single glyph being drawn.
 */
const KEY_ROWS: { h: number; keys: number[] }[] = [
  { h: 0.66, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { h: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7] },
  { h: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2] },
  { h: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.95] },
  { h: 1, keys: [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5] },
  { h: 1, keys: [1, 1, 1.25, 1.3, 6.1, 1.3, 1.25, 1, 1] },
];

export function Workstation({
  open,
  wake,
  children,
}: {
  open: MotionValue<number>;
  wake: MotionValue<number>;
  children: React.ReactNode;
}) {
  // -92deg is shut against the deck; -2deg is open and very slightly reclined,
  // which reads more natural than a perfectly square lid.
  const lidRotate = useTransform(open, [0, 1], [-92, -2]);
  const screenGlow = useTransform(wake, [0, 1], [0, 1]);
  const contact = useTransform(open, [0, 1], [0.9, 0.55]);

  return (
    <div
      className="relative"
      style={{
        // 92vw below ~765px so the machine still commands a phone screen — a
        // laptop rendered at 70% of a 390px viewport reads as a thumbnail, and
        // the whole opening beat depends on it reading as a machine.
        width: "min(44rem, 92vw)",
        transformStyle: "preserve-3d",
        /*
          Camera elevation. At 9deg the deck projected to ~14% of the lid's
          height, which is physically right for a straight-on shot and useless
          for a composition — every material decision below the hinge was
          invisible. 14deg costs the display almost nothing (it sits at -2deg,
          so cos(16°) ≈ 0.96) and returns about a quarter more deck. That
          asymmetry is why product photography looks down at these machines.
        */
        transform: "rotateX(14deg)",
      }}
    >
      {/* ── Grounding ──────────────────────────────────────────────────
          Both sit at the deck's FRONT lip, not under the lid — that is where
          the machine actually touches the desk. The tight one sells contact,
          the wide one sells mass. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[150%] h-[3rem] w-[64%] -translate-x-1/2 rounded-[50%] blur-lg"
        style={{
          background: "radial-gradient(closest-side, rgba(0,0,0,0.92), transparent 70%)",
          opacity: contact,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[142%] h-[9rem] w-[108%] -translate-x-1/2 rounded-[50%] blur-[52px]"
        style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.6), transparent 72%)" }}
      />

      {/* The light the display throws into the room. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[155%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]"
        style={{
          opacity: screenGlow,
          background:
            "radial-gradient(closest-side, rgba(96,140,255,0.34), rgba(150,110,255,0.16) 52%, transparent 76%)",
        }}
      />

      {/* ── Lid ──────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative origin-bottom"
        style={{
          rotateX: lidRotate,
          transformStyle: "preserve-3d",
          aspectRatio: "16 / 10.6",
        }}
      >
        <div
          className="absolute inset-0 rounded-[1.05rem]"
          style={{
            background: "var(--device-shell)",
            boxShadow: "0 26px 60px -30px rgba(0,0,0,0.9)",
          }}
        >
          {/* Chamfer — brightest along the top and upper sides, gone by the
              bottom, exactly as a bevel behaves under a light above and in
              front of it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.05rem]"
            style={{
              padding: "1px",
              background:
                "linear-gradient(168deg, var(--device-chamfer) 0%, rgba(255,255,255,0.26) 16%, rgba(255,255,255,0.05) 46%, transparent 78%)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          />

          {/* Bezel */}
          <div
            className="absolute inset-[0.85%] overflow-hidden rounded-[0.78rem]"
            style={{
              background:
                "linear-gradient(168deg, #14182a 0%, #0a0d18 40%, #06080f 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(0,0,0,0.7), inset 0 1px 2px rgba(0,0,0,0.9)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[0.8%] z-20 h-[0.26rem] w-[0.26rem] -translate-x-1/2 rounded-full"
              style={{ background: "rgba(255,255,255,0.16)" }}
            />

            {/* Display */}
            <motion.div
              className="absolute inset-[1.5%_1.1%_2.4%] overflow-hidden rounded-[0.34rem]"
              style={{ opacity: screenGlow }}
            >
              {children}
            </motion.div>

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: screenGlow,
                background:
                  "radial-gradient(130% 90% at 50% 100%, rgba(120,160,255,0.26), transparent 62%)",
              }}
            />

            {/* Glass — a wide soft reflection of the room, drifting slowly.
                This is what stops a dark panel reading as a hole in the lid. */}
            <span
              aria-hidden="true"
              className="anim-spec pointer-events-none absolute inset-[-12%]"
              style={{
                background:
                  "linear-gradient(118deg, rgba(214,228,255,0.15) 0%, rgba(190,208,245,0.055) 16%, transparent 38%, transparent 62%, rgba(190,208,245,0.035) 84%, rgba(214,228,255,0.075) 100%)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Hinge barrel ─────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[13%] top-[99.4%] h-[1.4%] rounded-b-[0.2rem]"
        style={{
          background: "linear-gradient(180deg, #2c3145 0%, #171a26 46%, #0d1018 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      />

      {/* ── Deck ─────────────────────────────────────────────────────────
          Tapered toward the viewer — that taper is the wedge. `rotateX(-74deg)`
          projects ~28% of its height, enough to carry a keyboard well, a
          trackpad and a front lip. */}
      <div
        className="absolute left-0 top-full w-full origin-top"
        style={{
          /*
            Deck DEPTH, not deck height-on-screen. On a real 14" machine the
            deck is roughly nine tenths as deep as the lid is tall; at 36% the
            proportions were those of a tablet keyboard cover, and the whole
            surface projected into a sliver too thin to carry a keyboard. 62%
            with the camera at 14deg lands the front lip where product
            photography puts it, and gives every material below the hinge room
            to be seen.
          */
          height: "62%",
          transform: "rotateX(-74deg)",
          transformStyle: "preserve-3d",
          background: "var(--device-base)",
          clipPath: "polygon(0 0, 100% 0, 98.6% 100%, 1.4% 100%)",
          boxShadow: "0 30px 56px -22px rgba(0,0,0,0.85)",
        }}
      >
        {/*
          Deck lighting, in three zones.

          A flat fill is the single biggest tell that a deck was drawn rather
          than photographed. Under a light above and in front of the machine the
          strip behind the keyboard sits in the lid's shadow, the palm rest
          turns toward the light and takes a broad soft sheen, and the surface
          rolls away again into the front lip. Painting those three zones is
          what turns the slab into a surface.
        */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.30) 9%, rgba(0,0,0,0) 22%, rgba(255,255,255,0.055) 62%, rgba(255,255,255,0.085) 82%, rgba(0,0,0,0.28) 100%)",
          }}
        />
        {/* The palm rest catches the light broadest at the centre. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[52%]"
          style={{
            background:
              "radial-gradient(70% 120% at 50% 100%, rgba(232,240,255,0.13), transparent 70%)",
          }}
        />

        {/* Front-lip chamfer — a diamond-cut edge, so it fades out toward the
            corners where the surface turns away from the light. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[2%] bottom-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--device-chamfer) 18%, var(--device-chamfer) 82%, transparent)",
            opacity: 0.5,
          }}
        />
        {/* The lip has thickness: a dark line immediately under the chamfer. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[2%] bottom-0 h-[4%]"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5), transparent)" }}
        />

        {/* Finger recess — the notch at the front edge you lift the lid by. One
            small asymmetry, and a very specific one. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[9%] w-[15%] -translate-x-1/2 rounded-t-[50%]"
          style={{
            background:
              "radial-gradient(100% 140% at 50% 100%, rgba(0,0,0,0.5), transparent 72%)",
          }}
        />

        {/* Speaker grilles, either side of the keyboard. Perforations at this
            scale read as texture rather than as holes, which is exactly what
            they do at this distance on the real thing. */}
        {(["left", "right"] as const).map((side) => (
          <span
            key={side}
            aria-hidden="true"
            className="absolute top-[7%] h-[46%] w-[6.4%] rounded-[0.12rem]"
            style={{
              [side]: "2.4%",
              background:
                "radial-gradient(circle, rgba(0,0,0,0.78) 34%, transparent 36%)",
              backgroundSize: "0.19rem 0.19rem",
              boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.05)",
            } as React.CSSProperties}
          />
        ))}

        {/* Keyboard well */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[11.5%] top-[6%] h-[47%] rounded-[0.22rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,3,7,0.72), rgba(6,8,15,0.55))",
            boxShadow:
              "inset 0 1.5px 3px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.1), 0 -0.5px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/*
            Individual keycaps.

            Seen from this angle you are mostly looking at each cap's top edge
            catching the light and its front face falling into shadow — hence
            the vertical gradient per key rather than a flat fill. Row heights
            and key widths come from KEY_ROWS, so the block reads as a keyboard
            even when a row is only a few pixels tall.
          */}
          {/*
            Separation is drawn INSIDE each cap, not as flex gap.

            A 0.7% gap between fourteen keys resolves to about a third of a
            pixel at this projected size, and a sub-pixel gap between two
            similar fills is no gap at all — the row composited into one
            continuous bar and the block read as a speaker grille. An inset
            hairline on each cap's right and bottom edge cannot collapse: it is
            part of the cap's own paint, so the lattice survives at any scale
            and through the camera push. The top highlight is the light
            catching the cap's leading edge, which is most of what you actually
            see of a keyboard from a low angle.
          */}
          <div className="flex h-full flex-col px-[0.8%] py-[2.4%]">
            {KEY_ROWS.map((row, r) => (
              <span key={r} className="flex" style={{ flex: row.h }}>
                {row.keys.map((w, k) => (
                  <span
                    key={k}
                    className="block"
                    style={{
                      flex: w,
                      background:
                        "linear-gradient(180deg, rgba(216,228,254,0.32) 0%, rgba(148,160,196,0.15) 38%, rgba(56,64,88,0.15) 80%, rgba(20,24,36,0.2) 100%)",
                      boxShadow:
                        "inset -0.6px 0 0 rgba(0,0,0,0.85), inset 0 -0.6px 0 rgba(0,0,0,0.72), inset 0 0.6px 0 rgba(255,255,255,0.16)",
                    }}
                  />
                ))}
              </span>
            ))}
          </div>
        </div>

        {/*
          Trackpad.

          It is NOT a lighter rectangle. A trackpad is glass sitting flush in
          the same aluminium, so it is very nearly the colour of the deck —
          what identifies it is a dark hairline SEAM around a machined cutout,
          a bright chamfer on the near lip of that cutout, and a slightly
          different reflection because glass is smoother than brushed metal.
          Painting it brighter than its surroundings is what made it read as a
          sticker.
        */}
        <span
          aria-hidden="true"
          className="absolute bottom-[6%] left-1/2 h-[31%] w-[41%] -translate-x-1/2 rounded-[0.2rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(226,236,255,0.05) 0%, rgba(140,152,186,0.03) 55%, rgba(226,236,255,0.045) 100%)",
            boxShadow:
              "inset 0 0 0 0.8px rgba(0,0,0,0.34), inset 0 1px 1.5px rgba(0,0,0,0.3), 0 0.6px 0 rgba(255,255,255,0.16)",
          }}
        />

        {/* Power indicator — the one thing that moves before the screen does. */}
        <span
          aria-hidden="true"
          className="anim-pulse absolute bottom-[6%] left-[4.2%] h-[4.5%] w-[0.9%] rounded-full"
          style={{ background: "var(--status-live)", animationDuration: "3.8s" }}
        />
      </div>
    </div>
  );
}
