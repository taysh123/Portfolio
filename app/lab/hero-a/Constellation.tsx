"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Concept A's one live element (prototype): a bounded constellation on a 2D canvas behind the copy. Nodes drift slowly,
 * near pairs are linked, and the colour runs from cyan at the top right to violet at the bottom left, the same as the
 * glows. A mouse or pen gathers the nearest nodes into a loose ring and links to them. Touch input is ignored, so
 * scrolling a phone never tugs the field.
 *
 * Decoration only: aria-hidden, pointer-events: none, and the page reads the same without it.
 *
 * Cost controls:
 *   - one rAF loop, running only while the field is on screen and the tab is visible; ≤ ~60 draws a second, and
 *     ≤ ~30 on the light path (the drift is 5–14 px a second, so a phone gains nothing from more);
 *   - a node count from the area, lighter on touch screens, narrow viewports and ≤ 4-core devices, with the pixel
 *     ratio capped (1.5 light, 2 otherwise);
 *   - links batched into one stroke per colour × alpha bucket, and halos stamped from pre-drawn sprites (no shadowBlur);
 *   - adaptive: whenever the measured draw cost stays over budget, the count drops by a sixth, down to a floor.
 *
 * Reduced motion (the OS setting or the site's own switch) draws one still frame and never starts the loop.
 * `data-state` (idle · running · paused · static) and `data-nodes` say what it is doing, for the tests.
 */

const CYAN = [46, 230, 214] as const;
const VIOLET = [155, 107, 255] as const;
const HUES = 6;            // colour buckets from cyan (0) to violet (HUES - 1)
const ALPHAS = 6;          // link-alpha buckets
const SPRITE = 30;         // halo sprite size, CSS px
const COST_BUDGET_MS = 4;  // the draw's own cost, smoothed, before the count steps down
const POINTER_R = 190;     // the pointer's reach
const RING = 70;           // inside this, the pointer pushes out instead of pulling in

type Node = { x: number; y: number; vx: number; vy: number; bx: number; by: number; r: number; bright: boolean };

const mix = (t: number) => CYAN.map((c, i) => Math.round(c + (VIOLET[i] - c) * t));
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reducedPref = useReducedMotionPref();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    // Read directly as well as through the hook: the hook's first (hydration) render is always `false`.
    const still = reducedPref || matchMedia("(prefers-reduced-motion: reduce)").matches
      || document.documentElement.dataset.reducedMotion === "true";
    const coarse = matchMedia("(pointer: coarse)").matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;

    const rgb = Array.from({ length: HUES }, (_, k) => mix(k / (HUES - 1)));
    const fills = rgb.map(([r, g, b]) => `rgb(${r},${g},${b})`);
    let strokes: string[] = [];
    let sprites: HTMLCanvasElement[] = [];
    const segs: number[][] = Array.from({ length: HUES * ALPHAS }, () => []);

    let w = 0, h = 0, dpr = 1, light = false, linkDist = 150, linkMax = 0.3, floor = 24, target = 0;
    const nodes: Node[] = [];
    let hue = new Uint8Array(0);
    const pointer = { x: 0, y: 0, on: false, k: 0 };

    const spawn = (): Node => {
      const a = Math.random() * Math.PI * 2;
      const s = 5 + Math.random() * 9;              // 5–14 px a second: slow
      const bx = Math.cos(a) * s, by = Math.sin(a) * s;
      return { x: Math.random() * w, y: Math.random() * h, vx: bx, vy: by, bx, by, r: 0.7 + Math.random() * 1.2, bright: Math.random() < 0.12 };
    };
    const fit = () => {
      while (nodes.length < target) nodes.push(spawn());
      if (nodes.length > target) nodes.length = target;
      if (hue.length !== nodes.length) hue = new Uint8Array(nodes.length);
      canvas.dataset.nodes = String(nodes.length);
    };
    const makeSprites = () => {
      sprites = rgb.map(([r, g, b]) => {
        const c = document.createElement("canvas");
        c.width = c.height = Math.ceil(SPRITE * dpr);
        const g2 = c.getContext("2d")!;
        const half = c.width / 2;
        const grad = g2.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.34)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        g2.fillStyle = grad;
        g2.fillRect(0, 0, c.width, c.height);
        return c;
      });
    };
    const size = () => {
      const ow = w, oh = h;
      w = host.clientWidth; h = host.clientHeight;
      light = coarse || w < 640 || fewCores;
      const nextDpr = Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2);
      if (nextDpr !== dpr || !sprites.length) { dpr = nextDpr; makeSprites(); }
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      linkDist = light ? 112 : 150;
      linkMax = light ? 0.26 : 0.3;
      strokes = rgb.flatMap(([r, g, b]) => Array.from({ length: ALPHAS }, (_, a) => `rgba(${r},${g},${b},${(((a + 1) / ALPHAS) * linkMax).toFixed(3)})`));
      floor = light ? 22 : 40;
      target = clamp(Math.round((w * h) / (light ? 15000 : 12000)), floor, light ? 48 : 120);
      if (ow && oh) for (const n of nodes) { n.x *= w / ow; n.y *= h / oh; }
      fit();
    };

    const step = (dt: number) => {
      pointer.k += ((pointer.on ? 1 : 0) - pointer.k) * Math.min(1, dt * 3);
      const pull = pointer.k > 0.01;
      const relax = Math.min(1, dt * 0.8);
      const m = 24;
      for (const n of nodes) {
        if (pull) {
          const dx = pointer.x - n.x, dy = pointer.y - n.y, d2 = dx * dx + dy * dy;
          if (d2 < POINTER_R * POINTER_R && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (d > RING ? (1 - d / POINTER_R) * 70 : -(1 - d / RING) * 90) * pointer.k * dt;
            n.vx += (dx / d) * f; n.vy += (dy / d) * f;
          }
        }
        n.vx += (n.bx - n.vx) * relax; n.vy += (n.by - n.vy) * relax;
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -m) n.x = w + m; else if (n.x > w + m) n.x = -m;
        if (n.y < -m) n.y = h + m; else if (n.y > h + m) n.y = -m;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const count = nodes.length;
      for (let i = 0; i < count; i++) {
        const n = nodes[i];
        hue[i] = Math.round(clamp((1 - n.x / w + n.y / h) / 2, 0, 1) * (HUES - 1));
      }
      for (const s of segs) s.length = 0;
      const L = linkDist, L2 = L * L;
      for (let i = 0; i < count; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < count; j++) {
          const b = nodes[j];
          const dx = a.x - b.x; if (dx > L || dx < -L) continue;
          const dy = a.y - b.y; if (dy > L || dy < -L) continue;
          const d2 = dx * dx + dy * dy; if (d2 >= L2) continue;
          const q = 1 - Math.sqrt(d2) / L;
          segs[((hue[i] + hue[j]) >> 1) * ALPHAS + Math.min(ALPHAS - 1, (q * ALPHAS) | 0)].push(a.x, a.y, b.x, b.y);
        }
      }
      if (pointer.k > 0.01) {
        const R2 = POINTER_R * POINTER_R;
        for (let i = 0; i < count; i++) {
          const n = nodes[i], dx = n.x - pointer.x, dy = n.y - pointer.y, d2 = dx * dx + dy * dy;
          if (d2 >= R2) continue;
          const q = (1 - Math.sqrt(d2) / POINTER_R) * pointer.k;
          segs[hue[i] * ALPHAS + Math.min(ALPHAS - 1, (q * ALPHAS) | 0)].push(pointer.x, pointer.y, n.x, n.y);
        }
      }
      ctx.lineWidth = 0.8;
      for (let k = 0; k < segs.length; k++) {
        const s = segs[k]; if (!s.length) continue;
        ctx.strokeStyle = strokes[k];
        ctx.beginPath();
        for (let p = 0; p < s.length; p += 4) { ctx.moveTo(s[p], s[p + 1]); ctx.lineTo(s[p + 2], s[p + 3]); }
        ctx.stroke();
      }
      for (let i = 0; i < count; i++) {
        const n = nodes[i];
        if (n.bright) ctx.drawImage(sprites[hue[i]], n.x - SPRITE / 2, n.y - SPRITE / 2, SPRITE, SPRITE);
      }
      for (let k = 0; k < HUES; k++) {
        ctx.fillStyle = fills[k];
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          if (hue[i] !== k) continue;
          const n = nodes[i], r = n.bright ? n.r + 0.6 : n.r;
          ctx.moveTo(n.x + r, n.y); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    size();

    if (still) {
      draw();
      canvas.dataset.state = "static";
      const ro = new ResizeObserver(() => { size(); draw(); });
      ro.observe(host);
      return () => ro.disconnect();
    }

    let raf = 0, last = 0, cost = 0, frames = 0, onScreen = true;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      // ≤ ~60 draws a second on a 90/120 Hz screen; ≤ ~30 on the light path. Measured on a 4×-throttled phone
      // profile, raster, not script, is most of the field's cost (scripts/lab-hero-a.mjs).
      if (last && t - last < (light ? 30 : 12)) return;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 1 / 60;
      last = t;
      const t0 = performance.now();
      step(dt); draw();
      cost = cost * 0.9 + (performance.now() - t0) * 0.1;
      if (++frames % 90 === 0 && cost > COST_BUDGET_MS && nodes.length > floor) {
        target = Math.max(floor, Math.round(nodes.length * (5 / 6)));
        fit();
      }
    };
    const start = () => {
      if (raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
      canvas.dataset.state = "running";
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.dataset.state = "paused";
    };

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); else stop(); });
    io.observe(canvas);
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(() => size());
    ro.observe(host);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true;
    };
    const onLeave = () => { pointer.on = false; };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    start();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedPref]);

  return <canvas ref={ref} className="hxa__field" aria-hidden="true" data-state="idle" />;
}
