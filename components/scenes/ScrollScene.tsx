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
  // Fit guard (Plan 2 Task 12 fix): the pinned stage is exactly one viewport tall and clips, so a
  // composition taller than the viewport would hide its own copy and buttons under the next scene.
  // Such a scene gets data-fit="false" and falls back to the settled, unpinned layout (scene.css).
  // The composition's height is its natural content height in both states, so this cannot oscillate.
  useEffect(() => {
    const el = ref.current; const content = el?.querySelector(".scene__stage")?.firstElementChild;
    const check = () => {
      const f = !content || content.getBoundingClientRect().height <= window.innerHeight;
      if (el) el.dataset.fit = String(f);
      setPinned(f && pinEligible(window.innerWidth, window.innerHeight, reduced));
    };
    check(); window.addEventListener("resize", check);
    const ro = content ? new ResizeObserver(check) : null; if (content) ro!.observe(content);
    return () => { window.removeEventListener("resize", check); ro?.disconnect(); };
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
