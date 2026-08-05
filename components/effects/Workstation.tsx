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
            style={{
              // Even off, a display is glass over a dark panel — a flat fill
              // reads as a hole cut in the lid.
              background:
                "linear-gradient(168deg, #121628 0%, #0b0e1a 46%, #070910 100%)",
            }}
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

            {/* Glass reflection. It drifts very slowly — the room light
                crawling across the panel is what stops a dark screen reading
                as a flat rectangle before it powers on. */}
            <span
              aria-hidden="true"
              className="anim-spec pointer-events-none absolute inset-[-10%] rounded-[0.85rem]"
              style={{
                background:
                  "linear-gradient(112deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 20%, transparent 46%)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Deck ─────────────────────────────────────────────────────────
          The wedge is what makes a laptop identifiable at a glance — an open
          lid alone is just a monitor. `rotateX(-74deg)` rather than the -88 it
          started at, because at -88 the deck projects to about 3% of its own
          height and reads as a hairline. At -74 it projects ~28%, which is
          enough to show a keyboard field and a trackpad. */}
      <div
        className="absolute left-0 top-full w-full origin-top"
        style={{
          height: "32%",
          transform: "rotateX(-74deg)",
          transformStyle: "preserve-3d",
          background: "var(--device-base)",
          borderRadius: "0 0 0.9rem 0.9rem",
          boxShadow:
            "0 1px 0 var(--device-edge) inset, 0 24px 50px -20px rgba(0,0,0,0.8)",
        }}
      >
        {/* Hinge shadow where the lid meets the deck. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[4%] top-0 h-[16%]"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.6), transparent)",
          }}
        />

        {/* Keyboard field. Rows of keys rather than individual ones — at this
            scale a real key grid turns to noise, but the block reads correctly. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[10%] top-[16%] h-[46%] rounded-[0.2rem]"
          style={{
            background: "rgba(0,0,0,0.42)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          <div className="flex h-full flex-col justify-evenly px-[1.5%] py-[6%]">
            {[0, 1, 2, 3].map((row) => (
              <span
                key={row}
                className="block rounded-full"
                style={{
                  height: "13%",
                  marginInline: row === 3 ? "14%" : "0",
                  background:
                    "repeating-linear-gradient(90deg, rgba(210,222,255,0.30) 0 1.2%, transparent 1.2% 2.6%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Trackpad. */}
        <span
          aria-hidden="true"
          className="absolute bottom-[10%] left-1/2 h-[24%] w-[26%] -translate-x-1/2 rounded-[0.18rem]"
          style={{
            background: "rgba(255,255,255,0.06)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
          }}
        />

        {/*
          Power indicator — the one thing that moves before the screen wakes.
          It is what makes the device read as ON but asleep rather than as a
          photograph of a laptop.
        */}
        <span
          aria-hidden="true"
          className="anim-pulse absolute bottom-[8%] left-[5%] h-[6%] w-[1.2%] rounded-full"
          style={{ background: "var(--status-live)", animationDuration: "3.8s" }}
        />
      </div>

    </div>
  );
}
