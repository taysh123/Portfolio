"use client";

import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Ambient lighting: two scroll-drifted blooms plus a pointer-tracked highlight.
 *
 * The previous version ran a requestAnimationFrame loop that never stopped —
 * not when the pointer was idle, not when the tab was hidden, and not on touch
 * devices where the pointer handler never fired at all. Every frame it wrote
 * two custom properties on `:root` (invalidating custom-property inheritance
 * for the whole document) to drive a full-viewport radial gradient that also
 * carried `transition: background`, a non-compositable property. That is a
 * permanent 60fps full-viewport repaint.
 *
 * This version:
 *   - only starts the loop on a real mouse move
 *   - stops as soon as the value converges (and restarts on the next move)
 *   - stops on `visibilitychange` when the tab is hidden
 *   - writes to a local element, not `:root`
 *   - has no `transition` on a painted property
 */
export function AmbientGlow() {
  const reduced = useReducedMotionPref();
  const { scrollYProgress } = useScroll();

  const blueX = useTransform(scrollYProgress, [0, 1], ["-4%", "7%"]);
  const blueY = useTransform(scrollYProgress, [0, 1], ["-3%", "5%"]);
  const violetX = useTransform(scrollYProgress, [0, 1], ["5%", "-7%"]);
  const violetY = useTransform(scrollYProgress, [0, 1], ["3%", "-5%"]);

  useEffect(() => {
    if (reduced) return;
    const layer = document.getElementById("ambient-pointer");
    if (!layer) return;

    let raf = 0;
    let running = false;
    let tx = 50;
    let ty = 50;
    let cx = 50;
    let cy = 50;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layer.style.setProperty("--hx", `${cx.toFixed(2)}%`);
      layer.style.setProperty("--hy", `${cy.toFixed(2)}%`);

      // Converged — stop burning frames until the pointer moves again.
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      start();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[3] overflow-hidden">
      <motion.div
        style={{ x: blueX, y: blueY }}
        className="absolute -left-[18%] top-[6%] h-[38rem] w-[38rem] rounded-full blur-[110px]"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(closest-side, var(--glow-blue), transparent 72%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ x: violetX, y: violetY }}
        className="absolute -right-[16%] top-[44%] h-[36rem] w-[36rem] rounded-full blur-[110px]"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(closest-side, var(--glow), transparent 72%)",
          }}
        />
      </motion.div>

      <div
        id="ambient-pointer"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 40rem at var(--hx, 50%) var(--hy, 50%), var(--glow), transparent 62%)",
          opacity: 0.32,
        }}
      />
    </div>
  );
}
