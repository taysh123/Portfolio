"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { pinEligible, scenePhases, pillarState } from "@/lib/scene";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import "./scene.css";

const VARS = ["--p", "--assemble", "--hold", "--recede", "--tbs-line"];

/**
 * The one client primitive behind every scroll-driven section. It writes progress into CSS vars
 * only while the scene is pinned; the world's CSS turns them into transform/opacity. Nothing
 * re-renders per frame, and the settled composition is the CSS default (scene.css).
 */
export function ScrollScene({ id, labelledBy, className, dark = false, pinSvh = 200, phases = "flagship", children }: {
  id?: string; labelledBy: string; className?: string; dark?: boolean; pinSvh?: number;
  phases?: "flagship" | "pillars"; children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPref();
  const [pinned, setPinned] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Re-evaluated live: resize across the threshold and either reduced-motion source (Review Focus 2, 3).
  useEffect(() => {
    const check = () => setPinned(pinEligible(window.innerWidth, window.innerHeight, reduced));
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [reduced]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.dataset.pinned = String(pinned);
    if (!pinned) { for (const v of VARS) el.style.removeProperty(v); delete el.dataset.lit; }
    else write(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  // One-shot in-view flag for reveals and the GRAVITY FLOW loop gate.
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { el.dataset.inview = String(e.isIntersecting); }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);

  function write(p: number) {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--p", p.toFixed(4));
    if (phases === "flagship") {
      const s = scenePhases(p);
      el.style.setProperty("--assemble", s.assemble.toFixed(4)); el.style.setProperty("--hold", s.hold.toFixed(4)); el.style.setProperty("--recede", s.recede.toFixed(4));
    } else {
      const s = pillarState(p);
      el.style.setProperty("--tbs-line", s.line.toFixed(4)); el.dataset.lit = String(s.lit);
    }
  }
  useMotionValueEvent(scrollYProgress, "change", (p) => { if (pinned) write(p); });

  return (
    <section ref={ref} id={id} aria-labelledby={labelledBy} data-scene data-pinned="false" data-theme={dark ? "dark" : undefined}
      className={["scene", className].filter(Boolean).join(" ")} style={{ ["--pin-h" as string]: `${pinSvh}svh` }}>
      <div className="scene__stage">{children}</div>
    </section>
  );
}
