"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Concept A's one live element (prototype): a bounded constellation on a 2D canvas behind the copy. Nodes drift, near
 * pairs are linked, and the colour runs from cyan at the top right to violet at the bottom left, the same as the glows.
 *
 * What makes it alive (round 2, Tay's feedback: "too calm"):
 *   - every node twinkles: a slow pulse of its radius (4–10 s a cycle, each its own phase), and the bright nodes' halos
 *     breathe with it;
 *   - signals: now and then a duotone pulse travels along a real link, one to three hops (a third of them one more),
 *     brightening the link it rides and flashing the node it reaches. Capped (4 at once, 2 on the light path) and
 *     spaced (one every 1.4–2.8 s, 2.6–4.6 s on the light path). Round 3 (Tay: "still a touch calm") gave them more
 *     presence: more often, a longer and thicker tail, a larger head, a brighter link;
 *   - a mouse or pen softly gathers the nearby nodes (a pull that fades to nothing at the centre; nothing is pushed
 *     away), brightens the links around it and carries a faint glow. Touch is ignored, so scrolling a phone never tugs
 *     the field.
 *
 *   - the sky breathes (round 3): the same clock drifts the two CSS glows (.hxa__glow) by transform and opacity, five
 *     times a second. Measured: a CSS animation of the same drift cost +5.3 pp of main thread on the 4× phone profile;
 *     at 5 Hz it rides the loop's own frames, and it stops with the loop.
 *
 * Decoration only: aria-hidden, pointer-events: none, and the page reads the same without it.
 *
 * Cost controls:
 *   - one rAF loop, running only while the field is on screen and the tab is visible; ≤ ~60 draws a second, and ≤ ~30
 *     on the light path (touch screens, narrow viewports, ≤ 4-core devices);
 *   - a node count from the area, with the pixel ratio capped (1.5 light, 2 otherwise);
 *   - links batched into one stroke per colour × alpha bucket; halos, flashes, signal heads and the pointer's glow
 *     stamped from pre-drawn sprites (no shadowBlur, no per-frame gradients);
 *   - adaptive: whenever the measured draw cost stays over budget, the count drops by a sixth, down to a floor.
 *
 * Reduced motion (the OS setting or the site's own switch) draws one still frame, with no signals, and never starts
 * the loop. `data-state` (idle · running · paused · static), `data-nodes` and `data-pulses` (written only when they
 * change) say what it is doing, for the tests.
 */

// A canvas cannot read CSS custom properties: these mirror --cine-cyan and --cine-violet
// (app/lab/_cinematic/cinematic.css), and tests/unit/lab-hero-a.test.ts holds them equal.
const CYAN = [46, 230, 214] as const;
const VIOLET = [155, 107, 255] as const;
const HUES = 6;            // colour buckets from cyan (0) to violet (HUES - 1)
const ALPHAS = 6;          // link-alpha buckets
const SPRITE = 30;         // halo sprite size, CSS px
const GLOW = 200;          // the pointer's glow, CSS px (a 1× sprite: it is soft anyway). Kept small: image stamps
                           // were the largest new cost in round 2 (measured), and the lit links carry most of it
const COST_BUDGET_MS = 4;  // the draw's own cost, smoothed, before the count steps down
const POINTER_R = 200;     // the pointer's reach
const RING = 100;          // inside this, the pull fades out (it never pushes)
const PULL = 20;           // px/s²: against the 0.8/s relax, an inward drift of about 25 px/s, like the field's own
const TETHER = 150;        // the pointer links to nodes this close
const FAINT = 0.12;        // links fainter than this (1 - distance / reach) are not drawn
const SKY_STEP = 0.2;      // s between glow updates (5 Hz)

type Node = {
  x: number; y: number; vx: number; vy: number; bx: number; by: number;
  r: number; bright: boolean; phase: number; tw: number; flash: number;
};
/** A signal: travelling from path[hop] to path[hop + 1], `p` of the way along, hop by hop. */
type Pulse = { path: number[]; hop: number; p: number; hops: number };

const mix = (t: number) => CYAN.map((c, i) => Math.round(c + (VIOLET[i] - c) * t));
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const ease = (t: number) => t * t * (3 - 2 * t);

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
    let hotStrokes: string[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let glows: HTMLCanvasElement[] = [];
    const segs: number[][] = Array.from({ length: HUES * ALPHAS }, () => []);
    const hot: number[][] = Array.from({ length: HUES * ALPHAS }, () => []);

    let w = 0, h = 0, dpr = 1, light = false, linkDist = 150, floor = 24, target = 0;
    let maxPulses = 3, gapMin = 1.6, gapMax = 3.2, signalSpeed = 80, clock = 0, nextPulse = 1.2;
    const nodes: Node[] = [];
    const pulses: Pulse[] = [];
    let hue = new Uint8Array(0);
    const pointer = { x: 0, y: 0, on: false, k: 0 };
    const [skyCyan, skyViolet] = host.querySelectorAll<HTMLElement>(".hxa__glow");
    let skyAt = -SKY_STEP;

    const spawn = (): Node => {
      const a = Math.random() * Math.PI * 2;
      const s = light ? 5 + Math.random() * 9 : 8 + Math.random() * 12;   // px a second
      const bx = Math.cos(a) * s, by = Math.sin(a) * s;
      return { x: Math.random() * w, y: Math.random() * h, vx: bx, vy: by, bx, by, r: 0.7 + Math.random() * 1.2,
        bright: Math.random() < 0.12, phase: Math.random() * Math.PI * 2, tw: 0.6 + Math.random() * 1, flash: 0 };
    };
    const fit = () => {
      while (nodes.length < target) nodes.push(spawn());
      if (nodes.length > target) nodes.length = target;
      if (hue.length !== nodes.length) hue = new Uint8Array(nodes.length);
      for (let i = pulses.length - 1; i >= 0; i--) if (pulses[i].path.some((j) => j >= nodes.length)) pulses.splice(i, 1);
      canvas.dataset.nodes = String(nodes.length);
    };
    const sprite = (px: number, [r, g, b]: number[], a: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(px);
      const g2 = c.getContext("2d")!;
      const half = c.width / 2;
      const grad = g2.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      g2.fillStyle = grad;
      g2.fillRect(0, 0, c.width, c.height);
      return c;
    };
    const size = () => {
      const ow = w, oh = h;
      w = host.clientWidth; h = host.clientHeight;
      light = coarse || w < 640 || fewCores;
      const nextDpr = Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2);
      if (nextDpr !== dpr || !sprites.length) {
        dpr = nextDpr;
        sprites = rgb.map((c) => sprite(SPRITE * dpr, c, 0.34));
        glows = rgb.map((c) => sprite(GLOW, c, 0.16));
      }
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      linkDist = light ? 112 : 150;
      const linkMax = light ? 0.26 : 0.32, hotMax = light ? 0.46 : 0.58;
      const bucket = (max: number) => rgb.flatMap(([r, g, b]) => Array.from({ length: ALPHAS }, (_, a) => `rgba(${r},${g},${b},${(((a + 1) / ALPHAS) * max).toFixed(3)})`));
      strokes = bucket(linkMax); hotStrokes = bucket(hotMax);
      floor = light ? 22 : 40;
      target = clamp(Math.round((w * h) / (light ? 15000 : 10000)), floor, light ? 48 : 140);
      maxPulses = light ? 2 : 4; gapMin = light ? 2.6 : 1.4; gapMax = light ? 4.6 : 2.8; signalSpeed = light ? 65 : 80;
      if (ow && oh) for (const n of nodes) { n.x *= w / ow; n.y *= h / oh; }
      fit();
    };

    /** A node linked to `i` right now (within the link distance), other than `not`; -1 if there is none. */
    const neighbour = (i: number, not: number) => {
      const a = nodes[i], L2 = (linkDist * 0.92) ** 2;
      let pick = -1, seen = 0;
      for (let j = 0; j < nodes.length; j++) {
        if (j === i || j === not) continue;
        const dx = nodes[j].x - a.x, dy = nodes[j].y - a.y;
        if (dx * dx + dy * dy < L2 && Math.random() * ++seen < 1) pick = j;   // a uniform pick, in one pass
      }
      return pick;
    };
    const setPulses = () => { if (canvas.dataset.pulses !== String(pulses.length)) canvas.dataset.pulses = String(pulses.length); };
    const launch = () => {
      // Start where the field is strongest: on wide screens, right of the copy.
      for (let tries = 0; tries < 8; tries++) {
        const a = (Math.random() * nodes.length) | 0;
        if (!light && nodes[a].x < w * 0.4 && tries < 6) continue;
        const b = neighbour(a, -1);
        if (b < 0) continue;
        pulses.push({ path: [a, b], hop: 0, p: 0, hops: 1 + ((Math.random() * 3) | 0) + (Math.random() < 0.35 ? 1 : 0) });
        setPulses();
        return;
      }
    };

    const step = (dt: number) => {
      clock += dt;
      pointer.k += ((pointer.on ? 1 : 0) - pointer.k) * Math.min(1, dt * 3);
      const pull = pointer.k > 0.01;
      const relax = Math.min(1, dt * 0.8);
      const m = 24;
      for (const n of nodes) {
        if (pull) {
          const dx = pointer.x - n.x, dy = pointer.y - n.y, d2 = dx * dx + dy * dy;
          if (d2 < POINTER_R * POINTER_R && d2 > 1) {
            const d = Math.sqrt(d2), soft = Math.min(1, d / RING);
            const f = (1 - d / POINTER_R) * PULL * soft * soft * pointer.k * dt;
            n.vx += (dx / d) * f; n.vy += (dy / d) * f;
          }
        }
        n.vx += (n.bx - n.vx) * relax; n.vy += (n.by - n.vy) * relax;
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -m) n.x = w + m; else if (n.x > w + m) n.x = -m;
        if (n.y < -m) n.y = h + m; else if (n.y > h + m) n.y = -m;
        if (n.flash > 0) n.flash = Math.max(0, n.flash - dt * 1.3);
      }
      // Signals: travel, hop on or end, and now and then a new one.
      for (let i = pulses.length - 1; i >= 0; i--) {
        const s = pulses[i], a = nodes[s.path[s.hop]], b = nodes[s.path[s.hop + 1]];
        s.p += (signalSpeed * dt) / Math.max(24, Math.hypot(b.x - a.x, b.y - a.y));
        if (s.p < 1) continue;
        b.flash = 1;
        const next = s.hop + 1 < s.hops ? neighbour(s.path[s.hop + 1], s.path[s.hop]) : -1;
        if (next < 0) { pulses.splice(i, 1); setPulses(); continue; }
        s.path.push(next); s.hop++; s.p = 0;
      }
      if (clock >= nextPulse) {
        if (pulses.length < maxPulses && nodes.length > 1) launch();
        nextPulse = clock + gapMin + Math.random() * (gapMax - gapMin);
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
      for (const s of hot) s.length = 0;
      const L = linkDist, L2 = L * L, near = pointer.k > 0.01, R2 = POINTER_R * POINTER_R;
      for (let i = 0; i < count; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < count; j++) {
          const b = nodes[j];
          const dx = a.x - b.x; if (dx > L || dx < -L) continue;
          const dy = a.y - b.y; if (dy > L || dy < -L) continue;
          const d2 = dx * dx + dy * dy; if (d2 >= L2) continue;
          let q = 1 - Math.sqrt(d2) / L;
          let into = segs;
          if (near) {   // links around the pointer brighten, by how close their midpoint is
            const mx = (a.x + b.x) / 2 - pointer.x, my = (a.y + b.y) / 2 - pointer.y, m2 = mx * mx + my * my;
            // 0.55 × the hot ceiling (0.58) ≈ the base ceiling (0.32), so a link crossing the reach's edge never dims.
            if (m2 < R2) { q = Math.min(1, q * (0.55 + (1 - Math.sqrt(m2) / POINTER_R) * 0.9 * pointer.k)); into = hot; }
          }
          // The faintest links (the last 12% of the reach, ≤ 4% alpha) are invisible in practice but, by area, about a
          // fifth of all links, and raster is most of the cost. Skipped, except where the pointer brightens them.
          if (into === segs && q < FAINT) continue;
          into[((hue[i] + hue[j]) >> 1) * ALPHAS + Math.min(ALPHAS - 1, (q * ALPHAS) | 0)].push(a.x, a.y, b.x, b.y);
        }
      }
      if (near) {
        for (let i = 0; i < count; i++) {
          const n = nodes[i], dx = n.x - pointer.x, dy = n.y - pointer.y, d2 = dx * dx + dy * dy;
          if (d2 >= TETHER * TETHER) continue;
          const q = (1 - Math.sqrt(d2) / TETHER) * pointer.k * 0.55;
          hot[hue[i] * ALPHAS + Math.min(ALPHAS - 1, (q * ALPHAS) | 0)].push(pointer.x, pointer.y, n.x, n.y);
        }
      }
      // The link each signal rides, lit for as long as it is on it.
      for (const s of pulses) {
        const ai = s.path[s.hop], bi = s.path[s.hop + 1], a = nodes[ai], b = nodes[bi];
        const env = envelope(s);
        hot[((hue[ai] + hue[bi]) >> 1) * ALPHAS + Math.min(ALPHAS - 1, (env * 0.85 * ALPHAS) | 0)].push(a.x, a.y, b.x, b.y);
      }
      const stroke = (from: number[][], styles: string[], width: number) => {
        ctx.lineWidth = width;
        for (let k = 0; k < from.length; k++) {
          const s = from[k]; if (!s.length) continue;
          ctx.strokeStyle = styles[k];
          ctx.beginPath();
          for (let p = 0; p < s.length; p += 4) { ctx.moveTo(s[p], s[p + 1]); ctx.lineTo(s[p + 2], s[p + 3]); }
          ctx.stroke();
        }
      };
      stroke(segs, strokes, 0.8);
      stroke(hot, hotStrokes, 1);

      if (near) {
        const k = Math.round(clamp((1 - pointer.x / w + pointer.y / h) / 2, 0, 1) * (HUES - 1));
        ctx.globalAlpha = pointer.k;
        ctx.drawImage(glows[k], pointer.x - GLOW / 2, pointer.y - GLOW / 2, GLOW, GLOW);
      }
      // Halos: the bright nodes breathe with their twinkle; a node a signal just reached flashes.
      for (let i = 0; i < count; i++) {
        const n = nodes[i];
        if (n.bright) {
          ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(n.phase + clock * n.tw));
          ctx.drawImage(sprites[hue[i]], n.x - SPRITE / 2, n.y - SPRITE / 2, SPRITE, SPRITE);
        }
        if (n.flash > 0.02) {
          const f = SPRITE * (1.2 + 0.6 * (1 - n.flash));
          ctx.globalAlpha = n.flash;
          ctx.drawImage(sprites[hue[i]], n.x - f / 2, n.y - f / 2, f, f);
        }
      }
      ctx.globalAlpha = 1;
      for (let k = 0; k < HUES; k++) {
        ctx.fillStyle = fills[k];
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          if (hue[i] !== k) continue;
          const n = nodes[i], s = 0.5 + 0.5 * Math.sin(n.phase + clock * n.tw);
          const r = (n.bright ? n.r + 0.6 : n.r) * (0.8 + 0.4 * s);
          ctx.moveTo(n.x + r, n.y); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      // Signal heads: a short bright tail behind a soft head.
      for (const s of pulses) {
        const ai = s.path[s.hop], bi = s.path[s.hop + 1], a = nodes[ai], b = nodes[bi];
        const t = ease(s.p), tail = ease(Math.max(0, s.p - 0.3));
        const hx = a.x + (b.x - a.x) * t, hy = a.y + (b.y - a.y) * t;
        const k = hue[t < 0.5 ? ai : bi], env = envelope(s);
        ctx.globalAlpha = env;
        ctx.strokeStyle = hotStrokes[k * ALPHAS + ALPHAS - 1];
        ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.drawImage(sprites[k], hx - SPRITE * 0.6, hy - SPRITE * 0.6, SPRITE * 1.2, SPRITE * 1.2);
        ctx.fillStyle = fills[k];
        ctx.beginPath(); ctx.arc(hx, hy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    /** The glows' slow drift and breathe: ping-pong, eased (a cosine), 26 s and 34 s each way. Transform and opacity
     *  only, ≤ 5 times a second; opacity never above 1. */
    const breathe = () => {
      if (clock - skyAt < SKY_STEP || !skyCyan || !skyViolet) return;
      skyAt = clock;
      const u = 0.5 - 0.5 * Math.cos((Math.PI * clock) / 26);
      const v = 0.5 - 0.5 * Math.cos((Math.PI * (clock + 9)) / 34);
      skyCyan.style.transform = `translate3d(${(-3 * u).toFixed(3)}%, ${(4 * u).toFixed(3)}%, 0) scale(${(1 + 0.06 * u).toFixed(4)})`;
      skyCyan.style.opacity = (1 - 0.2 * u).toFixed(3);
      skyViolet.style.transform = `translate3d(${(3 * v).toFixed(3)}%, ${(-3 * v).toFixed(3)}%, 0) scale(${(1.05 - 0.05 * v).toFixed(4)})`;
      skyViolet.style.opacity = (0.82 + 0.18 * v).toFixed(3);
    };
    /** A signal fades in on its first hop and out on its last, so it never pops. */
    const envelope = (s: Pulse) => {
      let e = 1;
      if (s.hop === 0) e = Math.min(e, s.p * 4);
      if (s.hop === s.hops - 1) e = Math.min(e, (1 - s.p) * 4);
      return clamp(e, 0, 1);
    };

    size();

    if (still) {
      draw();
      canvas.dataset.state = "static";
      for (const g of [skyCyan, skyViolet]) if (g) { g.style.transform = ""; g.style.opacity = ""; }   // the glows at rest
      setPulses();
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
      step(dt); draw(); breathe();
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

    setPulses();
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
