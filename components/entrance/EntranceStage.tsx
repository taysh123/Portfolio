"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { BEATS, segment, easeOut, easeInOut } from "@/lib/timeline";
import { FrameStore } from "@/lib/entrance/FrameStore";
import { drawFrame } from "@/lib/entrance/FramePlayer";
import { loadOrder, pickTier, resolveFrame } from "@/lib/entrance/frames";
import { surfaceTransform, containsRect, coverFit, quadToViewport } from "@/lib/entrance/surface";
import { stageGeometry } from "./stageGeometry";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Manifest, FrameSet, Quad } from "@/lib/entrance/types";

const VEIL = 0.72; // near-black over the studio at p = 0; matches the CSS first paint
const CHAPTERS: [number, string][] = [[BEATS.lift[0], "01 — Scroll to begin"], [BEATS.lid[0], "02 — Scroll to open"], [BEATS.identity[0], "03 — Welcome"]];
const REVEALS: [string, number][] = [["[data-hero-line='1']", 0.9], ["[data-hero-line='2']", 0.92], ["[data-hero-lead]", 0.94], ["[data-hero-ctas]", 0.96]];

type Hooks = { boot: HTMLElement | null; bootLines: HTMLElement[]; tagline: HTMLElement | null; name: HTMLElement | null;
  reveals: [HTMLElement, number][]; nameFrom: { x: number; y: number; k: number } };

/** Offset of `el` inside `root`, from layout boxes only (so our own transforms never feed back). */
const offsetIn = (el: HTMLElement, root: HTMLElement) => {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return { x, y };
};

/** The frame the playhead sits on, so the store decodes around where the viewer actually is. */
const frameIndexAt = (set: FrameSet | undefined, p: number) => (set ? resolveFrame(p, set.frames).a : 0);

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType)));
};

type StageState = { set?: FrameSet; store?: FrameStore<ImageBitmap>; kind: "landscape" | "portrait"; gen: number;
  tier: number; vw: number; vh: number; pContain: number; raf: number; p: number; poster?: HTMLImageElement; hooks?: Hooks };

const container = () => document.getElementById("entrance")!;

/** Jump to p = 1 (the hero at identity) and put focus on the h1. Instant: no scroll-driven replay. */
function skipIntro() {
  const c = container(), end = c.offsetTop + c.offsetHeight - window.innerHeight;
  window.scrollTo({ top: end, behavior: "instant" as ScrollBehavior });
  document.getElementById("hero-title")?.focus();
}

export function EntranceStage({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPref();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLParagraphElement>(null);
  // The imperative stage lives inside the effect below; scroll events reach it through this ref.
  const renderRef = useRef<((p: number) => void) | null>(null);
  const progressRef = useRef(0);

  const containerRef = useRef<HTMLElement | null>(null);
  // Layout effects run before Framer's own effects, so the target exists when useScroll attaches.
  useLayoutEffect(() => { containerRef.current = container(); }, []);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => { progressRef.current = p; renderRef.current?.(p); });

  useEffect(() => {
    if (reduced) { document.documentElement.dataset.entranceDone = "true"; return; }
    const s: StageState = { kind: stageGeometry(window.innerWidth, window.innerHeight).kind, gen: 0, tier: 0, vw: 0, vh: 0, pContain: BEATS.push[1], raf: 0, p: progressRef.current };
    const canvas = canvasRef.current!, surface = surfaceRef.current!, hero = heroRef.current!;
    const veil = veilRef.current!, title = titleRef.current!, chapter = chapterRef.current!;

    // Geometry: framing, container height, canvas backing size — on mount and on every resize.
    const apply = () => {
      const vw = window.innerWidth, vh = window.innerHeight, g = stageGeometry(vw, vh);
      const c = container(); c.dataset.framing = g.kind; c.style.setProperty("--entrance-h", `${g.containerSvh}svh`);
      s.vw = vw; s.vh = vh;
      if (s.kind !== g.kind) { s.kind = g.kind; void boot(); }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureHooks(); computeContain(); render(s.p);
    };

    // One frame set at a time: a framing change (or unmount) bumps `gen`, which retires any boot still in flight.
    const boot = async () => {
      const gen = ++s.gen;
      s.store?.dispose(); s.store = undefined; s.set = undefined; s.poster = undefined;
      let m: Manifest;
      try { m = await (await fetch("/entrance/manifest.json")).json(); } catch { return; } // the poster stays
      if (gen !== s.gen) return;
      const kind = s.kind, set = m[kind], tier = pickTier(set.tiers, s.vw, window.devicePixelRatio || 1, saveData());
      const posterImg = new Image(); posterImg.src = `/entrance/${set.poster}.avif`; await posterImg.decode().catch(() => {});
      if (gen !== s.gen) return;
      s.set = set; s.tier = tier; s.poster = posterImg;
      const stillIndex = set.frames.findIndex((f) => f.file === "k1-on");
      const store = new FrameStore<ImageBitmap>({
        count: set.frames.length,
        order: loadOrder(set.frames.length, { stillIndex, pushEndIndex: set.pushEndIndex, lidEnd: stillIndex - 1, saveData: saveData() }),
        fetchBlob: async (i) => (await fetch(`/entrance/${kind}/${tier}/${set.frames[i].file}.avif`)).blob(),
        decode: (b) => createImageBitmap(b), window: 8, concurrency: 4,
      });
      s.store = store;
      store.onChange(() => render(s.p));
      store.setPlayhead(0);
      const go = () => { if (s.store === store) store.start(); };
      if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
      computeContain(); render(s.p);
    };

    // The identity card is the hero's name line, centred and enlarged; measured once per resize.
    const measureHooks = () => {
      const q = (sel: string) => hero.querySelector<HTMLElement>(sel);
      const name = q("[data-hero-name]");
      let nameFrom = { x: 0, y: 0, k: 1 };
      if (name && name.offsetParent) {
        const o = offsetIn(name, hero), k = Math.min(2.6, (0.72 * s.vw) / Math.max(1, name.offsetWidth));
        nameFrom = { x: s.vw / 2 - (o.x + name.offsetWidth / 2), y: s.vh * 0.46 - (o.y + name.offsetHeight / 2), k };
      }
      s.hooks = {
        boot: q("[data-hero-boot]"), bootLines: Array.from(hero.querySelectorAll<HTMLElement>("[data-boot-line]")),
        tagline: q("[data-hero-tagline]"), name, nameFrom,
        reveals: REVEALS.flatMap(([sel, at]) => { const el = q(sel); return el ? [[el, at] as [HTMLElement, number]] : []; }),
      };
    };

    // The first push frame whose screen covers the viewport: from there the surface eases to identity.
    const computeContain = () => {
      const set = s.set; if (!set) return;
      const fit = coverFit(set.width, set.height, s.vw, s.vh, 1.03);
      const f = set.frames.find((fr) => fr.p >= BEATS.push[0] && fr.quad && containsRect(quadToViewport(fr.quad, set.width, set.height, fit), s.vw, s.vh));
      s.pContain = f ? f.p : BEATS.push[1];
    };

    const placeSurface = (p: number, quad: Quad | null) => {
      const portrait = s.kind === "portrait";
      const identityAt = portrait ? BEATS.portraitOpen[1] : BEATS.push[1];
      surface.style.opacity = p >= BEATS.wake[0] ? String(segment(p, BEATS.wake[0], BEATS.wake[0] + 0.04)) : "0";
      // pContain can equal the push end (no push frame covers the viewport): then it is a step, not a ramp.
      let toIdentity = portrait ? segment(p, ...BEATS.portraitOpen)
        : s.pContain < BEATS.push[1] ? segment(p, s.pContain, BEATS.push[1], easeOut) : Number(p >= BEATS.push[1]);
      if (p >= identityAt || !quad) toIdentity = 1; // no quad (nothing decoded, or a back-facing frame): rest at identity
      const q = quad ?? ([{ x: 0, y: 0 }, { x: s.vw, y: 0 }, { x: s.vw, y: s.vh }, { x: 0, y: s.vh }] as Quad);
      const t = surfaceTransform({ kind: s.kind, quad: q, vw: s.vw, vh: s.vh, toIdentity });
      surface.style.left = `${t.box.x}px`; surface.style.top = `${t.box.y}px`; surface.style.width = `${t.box.w}px`; surface.style.height = `${t.box.h}px`;
      surface.style.transform = t.matrix; surface.style.clipPath = t.clip;
      hero.style.left = `${-t.box.x}px`; hero.style.top = `${-t.box.y}px`;
      surface.style.pointerEvents = p >= identityAt ? "auto" : "none";
    };

    // Inside the screen: boot log → identity card → the card lands as the name line, the hero rises in.
    const choreograph = (p: number) => {
      const h = s.hooks; if (!h) return;
      h.bootLines.forEach((el, i) => { el.style.opacity = String(segment(p, 0.4 + 0.03 * i, 0.44 + 0.03 * i)); });
      if (h.boot) h.boot.style.opacity = String(1 - segment(p, BEATS.identity[0], BEATS.identity[0] + 0.05));
      if (h.tagline) h.tagline.style.opacity = String(segment(p, 0.57, 0.62) * (1 - segment(p, 0.84, 0.88)));
      if (h.name) {
        const land = segment(p, s.kind === "portrait" ? 0.9 : BEATS.portal[0], BEATS.navIn[0], easeInOut), f = h.nameFrom, r = 1 - land;
        h.name.style.opacity = String(segment(p, 0.55, 0.6));
        h.name.style.transform = r ? `translate(${f.x * r}px, ${f.y * r}px) scale(${1 + (f.k - 1) * r})` : "";
      }
      for (const [el, at] of h.reveals) {
        const t = segment(p, at, at + 0.04, easeOut);
        // clear the mask's overflow-clip-margin too, or the top of the line peeks out
        el.style.transform = t < 1 ? `translateY(calc(${(1 - t) * 100}% + ${(1 - t) * 14}px))` : "";
      }
    };

    const render = (p: number) => {
      s.p = p;
      cancelAnimationFrame(s.raf);
      s.raf = requestAnimationFrame(() => {
        const ctx = canvas.getContext("2d")!;
        const zoom = 1 + 0.03 * segment(p, ...BEATS.lift, easeOut);
        const { quad } = s.set && s.store
          ? drawFrame({ ctx, frames: s.set.frames, p, store: s.store as never, fallback: (s.poster ?? null) as never, fallbackQuad: null, frameW: s.set.width, frameH: s.set.height, vw: s.vw, vh: s.vh, zoom })
          : { quad: null as Quad | null };
        s.store?.setPlayhead(frameIndexAt(s.set, p));
        veil.style.opacity = String(VEIL * (1 - segment(p, ...BEATS.lift, easeOut)));
        chapter.textContent = CHAPTERS.filter(([at]) => p >= at).pop()?.[1] ?? "";
        chapter.style.opacity = String(1 - segment(p, BEATS.push[0], BEATS.push[0] + 0.04));
        title.style.opacity = String(segment(p, 0.02, 0.1) * (1 - segment(p, ...BEATS.titleOut)));
        placeSurface(p, quad);
        choreograph(p);
        document.documentElement.dataset.entranceDone = String(p >= BEATS.navIn[0]);
        window.dispatchEvent(new CustomEvent("entrance:progress", { detail: { p } }));
      });
    };

    // Focus arriving inside the hero before the portal (Tab, a skip link, #main / #hero) jumps to identity.
    const onFocus = (e: FocusEvent) => { if (s.p < 1 && hero.contains(e.target as Node)) skipIntro(); };
    const onHash = () => { if (location.hash === "#main" || location.hash === "#hero") skipIntro(); };

    renderRef.current = render;
    apply(); void boot();
    window.addEventListener("resize", apply);
    document.addEventListener("focusin", onFocus); window.addEventListener("hashchange", onHash);
    return () => {
      renderRef.current = null; s.gen++;
      window.removeEventListener("resize", apply);
      document.removeEventListener("focusin", onFocus); window.removeEventListener("hashchange", onHash);
      s.store?.dispose(); cancelAnimationFrame(s.raf);
    };
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} className="entrance__canvas" aria-hidden="true" />
      <div ref={veilRef} className="entrance__veil entrance__overlay" aria-hidden="true" />
      <div ref={titleRef} className="entrance__overlay entrance__title pointer-events-none absolute inset-x-0 top-[40%] flex h-[14%] flex-col items-center justify-center text-center" aria-hidden="true" style={{ opacity: 0 }}>
        <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[0.5em] text-fg">TAY SHOFER</p>
        <p className="label mt-3 text-fg-muted">Software Developer</p>
      </div>
      <p ref={chapterRef} className="entrance__chapter entrance__overlay label pointer-events-none text-fg-muted" aria-hidden="true">01 — Scroll to begin</p>
      <div ref={surfaceRef} className="entrance__surface">
        <div ref={heroRef} className="entrance__hero">{children}</div>
      </div>
      <button type="button" data-skip-intro onClick={skipIntro} className="entrance__skip label inline-flex min-h-11 items-center rounded-full border border-line bg-surface-3 px-4 text-fg-muted hover:text-fg">Skip intro ↓</button>
    </>
  );
}
