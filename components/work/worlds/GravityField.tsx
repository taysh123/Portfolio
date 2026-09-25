"use client";
// The site's ONE time-based loop (spec §7): in view only, visible tab only, never under reduced motion.
import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

type Star = { r: number; a: number; w: number; s: number };
export function GravityField() {
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, scene = canvas.closest<HTMLElement>("[data-scene]")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, last = 0, t = 0, px = 0, py = 0;
    const stars: Star[] = Array.from({ length: 90 }, (_, i) => ({ r: 40 + ((i * 37) % 260), a: (i * 2.399) % (Math.PI * 2), w: 0.00012 + ((i * 13) % 17) * 0.00001, s: 0.6 + ((i * 7) % 5) * 0.25 }));
    const size = () => { const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (dt: number) => {
      const p = parseFloat(scene.style.getPropertyValue("--p") || "0.5");     // inline var read: no style recalc
      const speed = 0.6 + p * 1.2;                                            // scroll sets orbit speed
      t += dt * speed; ctx.clearRect(0, 0, W, H);
      const cx = W / 2 + px * 12, cy = H / 2 + py * 12;                       // pointer bends paths gently (≤ 12 px)
      ctx.strokeStyle = "rgba(91,156,255,0.10)"; ctx.lineWidth = 1;
      for (const k of [90, 160, 240]) { ctx.beginPath(); ctx.ellipse(cx, cy, k, k * 0.42, -0.35, 0, Math.PI * 2); ctx.stroke(); }
      for (const s of stars) {
        const a = s.a + t * s.w; const x = cx + Math.cos(a) * s.r, y = cy + Math.sin(a) * s.r * 0.42;
        ctx.fillStyle = "rgba(210,225,255,0.75)"; ctx.beginPath(); ctx.arc(x, y, s.s, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = (now: number) => { draw(last ? now - last : 16); last = now; raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
    const sync = () => {
      const run = !reduced && scene.dataset.inview === "true" && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(loop); else if (!run && raf) stop();
      if (!run) draw(0);                                                       // one static frame
    };
    const onPointer = (e: PointerEvent) => { if (e.pointerType === "touch") return; const r = canvas.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - 0.5) * 2; py = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    size(); sync();
    const mo = new MutationObserver(sync); mo.observe(scene, { attributes: true, attributeFilter: ["data-inview"] });
    const ro = new ResizeObserver(() => { size(); if (!raf) draw(0); }); ro.observe(canvas);
    document.addEventListener("visibilitychange", sync); scene.addEventListener("pointermove", onPointer);
    return () => { stop(); mo.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", sync); scene.removeEventListener("pointermove", onPointer); };
  }, [reduced]);
  return <canvas ref={cv} className="h-full w-full" />;
}
