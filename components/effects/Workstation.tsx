"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";

/**
 * A laptop, built entirely from CSS 3D and gradients.
 *
 * No render, no model, no image — the lid, hinge and base are real elements in
 * a `preserve-3d` scene, which is what lets the screen hold live DOM (crisp
 * text at any zoom) and inherit the theme tokens.
 *
 * `open` drives the lid: 0 is shut, 1 is fully open. `wake` fades the display
 * on independently, so the machine can open dark and then boot — the beat that
 * makes it read as a device rather than an illustration of one.
 */
export function Workstation({
  open,
  wake,
  children,
}: {
  open: MotionValue<number>;
  wake: MotionValue<number>;
  children: React.ReactNode;
}) {
  // -92deg is shut against the base; 0 is upright. Slightly past vertical at
  // the end (-2deg) reads more natural than a perfectly square lid.
  const lidRotate = useTransform(open, [0, 1], [-92, -2]);
  const screenGlow = useTransform(wake, [0, 1], [0, 1]);
  const baseShade = useTransform(open, [0, 1], [0.85, 0.4]);

  return (
    <div
      className="relative"
      style={{
        width: "min(44rem, 72vw)",
        transformStyle: "preserve-3d",
        transform: "rotateX(9deg)",
      }}
    >
      {/* Contact shadow on the floor, tightening as the lid rises. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[86%] h-[7rem] w-[78%] -translate-x-1/2 rounded-[50%] blur-2xl"
        style={{
          background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 72%)",
          opacity: baseShade,
        }}
      />

      {/* The light the display throws into the room. Sits behind the shell so
          it reads as spill, not as a halo drawn on top of it. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]"
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
          aspectRatio: "16 / 10.4",
        }}
      >
        {/* Aluminium shell */}
        <div
          className="absolute inset-0 rounded-[1.15rem] p-[0.62%]"
          style={{
            /*
              Brushed aluminium needs three things to read: a bright top edge
              where the room light catches it, a mid-tone body, and a darker
              underside. A single flat tint reads as a grey rectangle — which
              is exactly how the first pass looked.
            */
            background: "var(--device-shell)",
            boxShadow:
              "0 1px 0 var(--device-edge) inset, 0 -1px 0 rgba(255,255,255,0.10) inset, 0 50px 110px -45px rgba(0,0,0,0.55)",
          }}
        >
          {/* Bezel */}
          <div
            className="relative h-full w-full overflow-hidden rounded-[0.85rem]"
            style={{ background: "#080a12" }}
          >
            {/* Camera notch */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[0.9%] z-20 h-[0.28rem] w-[0.28rem] -translate-x-1/2 rounded-full"
              style={{ background: "rgba(255,255,255,0.14)" }}
            />

            {/* Display */}
            <motion.div
              className="absolute inset-[1.6%_1.2%_2.6%] overflow-hidden rounded-[0.4rem]"
              style={{ opacity: screenGlow }}
            >
              {children}
            </motion.div>

            {/* Backlight bleed from the panel edge. */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[0.85rem]"
              style={{
                opacity: screenGlow,
                background:
                  "radial-gradient(130% 90% at 50% 100%, rgba(120,160,255,0.30), transparent 64%)",
              }}
            />

            {/* Glass reflection — a single wide diagonal sweep. Static: a
                moving glint on a fixed light source would read as wrong. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[0.85rem]"
              style={{
                background:
                  "linear-gradient(112deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.035) 20%, transparent 46%)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Base ─────────────────────────────────────────────────────────── */}
      <div
        className="absolute left-0 top-full w-full origin-top"
        style={{
          height: "4.4%",
          transform: "rotateX(-88deg)",
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(180deg, rgba(176,186,212,0.30), rgba(88,96,124,0.20) 40%, rgba(38,42,58,0.30))",
          borderRadius: "0 0 0.7rem 0.7rem",
          boxShadow: "0 1px 0 var(--device-edge) inset",
        }}
      >
        {/* Hinge shadow where the lid meets the deck. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[8%] top-0 h-[22%]"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent)",
          }}
        />
        {/* Front-edge notch. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[18%] w-[13%] -translate-x-1/2 rounded-t-full"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
      </div>
    </div>
  );
}
