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
import { jumpTo } from "@/lib/scroll";

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

/** Jump to p = 1 (the hero at identity). Instant: no scroll-driven replay. Focuses the h1 unless told not to. */
function skipIntro(focusTitle = true) {
  const c = container(), end = c.offsetTop + c.offsetHeight - window.innerHeight;
  jumpTo(end);                              // through Lenis when it runs: a native jump mid-glide is undone
  if (focusTitle) document.getElementById("hero-title")?.focus();
}

/** Anchors that mean "the start of the content": the skip link, Back to top, the logo. */
const HERO_HASHES = new Set(["#main", "#hero"]);

/** Decoded ImageBitmaps cost w·h·4 bytes each: narrow the decode window as the tier grows. */
const windowFor = (tier: number) => (tier >= 1920 ? 3 : tier >= 1280 ? 5 : 8);

/** Every inline property the stage writes, so static mode can hand the hero back untouched. */
function resetInline(els: (HTMLElement | null | undefined)[]) {
  for (const el of els) if (el) for (const k of ["left", "top", "width", "height", "transform", "clip-path", "opacity", "pointer-events"]) el.style.removeProperty(k);
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
    const stage = canvasRef.current!.parentElement!;
    const s: StageState = { kind: stageGeometry(window.innerWidth, window.innerHeight).kind, gen: 0, tier: 0, vw: 0, vh: 0, pContain: BEATS.push[1], raf: 0, p: progressRef.current };
    const canvas = canvasRef.current!, surface = surfaceRef.current!, hero = heroRef.current!;
    const veil = veilRef.current!, title = titleRef.current!, chapter = chapterRef.current!;

    // Geometry: framing, container height, canvas backing size — on mount and whenever the stage box changes.
    // Measured from the stage itself (100svh × client width), never the window: iOS toolbars and classic
    // scrollbars make innerWidth/innerHeight disagree with the box the canvas and the surface live in.
    const apply = () => {
      const vw = stage.clientWidth, vh = stage.clientHeight, g = stageGeometry(window.innerWidth, window.innerHeight);
      const c = container(); c.dataset.framing = g.kind; c.style.setProperty("--entrance-h", `${g.containerSvh}svh`);
      s.vw = vw; s.vh = vh;
      if (s.kind !== g.kind) { s.kind = g.kind; void boot(); }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      hero.style.width = `${vw}px`; hero.style.height = `${vh}px`;
      measureHooks(); computeContain(); render(s.p);
    };

    // One frame set at a time: a framing change (or unmount) bumps `gen`, which retires any boot still in flight.
    const boot = async () => {
      const gen = ++s.gen;
      s.store?.dispose(); s.store = undefined; s.set = undefined; s.poster = undefined;
      let m: Manifest;
      try { m = await (await fetch("/entrance/manifest.json")).json(); } catch { return; } // the poster stays
      if (gen !== s.gen) return;
      const kind = s.kind, set = m?.[kind];
      if (!set?.frames?.length || !set.tiers?.length) return; // malformed manifest: the poster stays
      const tier = pickTier(set.tiers, s.vw, window.devicePixelRatio || 1, saveData());
      const posterImg = new Image(); posterImg.src = `/entrance/${set.poster}.avif`; await posterImg.decode().catch(() => {});
      if (gen !== s.gen) return;
      s.set = set; s.tier = tier; s.poster = posterImg;
      const stillIndex = set.frames.findIndex((f) => f.file === "k1-on");
      const keep = [0, stillIndex, set.pushEndIndex].filter((i) => i >= 0);
      const store = new FrameStore<ImageBitmap>({
        count: set.frames.length,
        order: loadOrder(set.frames.length, { stillIndex, pushEndIndex: set.pushEndIndex, lidEnd: stillIndex - 1, saveData: saveData() }),
        // A 404 must fail the fetch, not hand an HTML error page to the decoder (review M9).
        fetchBlob: async (i) => { const r = await fetch(`/entrance/${kind}/${tier}/${set.frames[i].file}.avif`); if (!r.ok) throw new Error(`frame ${i}: ${r.status}`); return r.blob(); },
        decode: (b) => createImageBitmap(b), window: windowFor(tier), concurrency: 4, keep,
      });
      s.store = store;
      // A decoded frame only matters while the room is visible: from identity on, the opaque surface covers
      // the canvas, so background decodes cost no draw (spec §9 idle work; found in Plan 2 Task 12, where
      // a scrolled-away entrance kept redrawing for every frame the store finished).
      store.onChange(() => { if (s.p < identityAt()) render(s.p); });
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

    // The progress at which the surface reaches identity and covers the viewport.
    const identityAt = () => (s.kind === "portrait" ? BEATS.portraitOpen[1] : BEATS.push[1]);

    const placeSurface = (p: number, quad: Quad | null) => {
      const portrait = s.kind === "portrait";
      const identityP = identityAt();
      // Before identity the surface needs a real quad: with none (frames not decoded yet, a manifest failure)
      // it stays hidden rather than flashing full-screen over the rendered room.
      const shown = p >= BEATS.wake[0] && (quad !== null || p >= identityP);
      surface.style.opacity = shown ? String(segment(p, BEATS.wake[0], BEATS.wake[0] + 0.04)) : "0";
      // pContain can equal the push end (no push frame covers the viewport): then it is a step, not a ramp.
      let toIdentity = portrait ? segment(p, ...BEATS.portraitOpen)
        : s.pContain < BEATS.push[1] ? segment(p, s.pContain, BEATS.push[1], easeOut) : Number(p >= BEATS.push[1]);
      if (p >= identityP || !quad) toIdentity = 1; // no quad (nothing decoded, or a back-facing frame): rest at identity
      const q = quad ?? ([{ x: 0, y: 0 }, { x: s.vw, y: 0 }, { x: s.vw, y: s.vh }, { x: 0, y: s.vh }] as Quad);
      const t = surfaceTransform({ kind: s.kind, quad: q, vw: s.vw, vh: s.vh, toIdentity });
      surface.style.left = `${t.box.x}px`; surface.style.top = `${t.box.y}px`; surface.style.width = `${t.box.w}px`; surface.style.height = `${t.box.h}px`;
      surface.style.transform = t.matrix; surface.style.clipPath = t.clip;
      hero.style.left = `${-t.box.x}px`; hero.style.top = `${-t.box.y}px`;
      surface.style.pointerEvents = p >= identityP ? "auto" : "none";
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

    // Focus arriving inside the hero before the portal (Tab) jumps to identity and stays on the control it reached.
    const onFocus = (e: FocusEvent) => { if (s.p < 1 && hero.contains(e.target as Node)) skipIntro(false); };
    // #main / #hero links (skip link, Back to top, logo) land on the h1 at identity — also when the hash is
    // already set, which never fires hashchange. Deep links to /#hero are honoured on arrival.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!a || !HERO_HASHES.has(a.getAttribute("href")!)) return;
      e.preventDefault(); history.replaceState(null, "", a.getAttribute("href")); skipIntro();
    };
    const onHash = () => { if (HERO_HASHES.has(location.hash)) skipIntro(); };
    const onSkip = () => skipIntro();   // dispatched by the command palette's "Home" (Plan 2 Task 4)

    const ro = new ResizeObserver(() => apply());
    renderRef.current = render;
    apply(); void boot();
    ro.observe(stage);
    window.addEventListener("resize", apply);
    document.addEventListener("focusin", onFocus); document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash); window.addEventListener("entrance:skip", onSkip);
    if (HERO_HASHES.has(location.hash)) requestAnimationFrame(() => skipIntro());
    void document.fonts?.ready.then(() => { if (renderRef.current === render) { measureHooks(); render(s.p); } });
    return () => {
      renderRef.current = null; s.gen++;
      ro.disconnect(); window.removeEventListener("resize", apply);
      document.removeEventListener("focusin", onFocus); document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash); window.removeEventListener("entrance:skip", onSkip);
      s.store?.dispose(); cancelAnimationFrame(s.raf);
      // Static mode takes over (reduced motion switched on): hand every element back with no inline geometry.
      const h = s.hooks;
      resetInline([surface, hero, veil, title, chapter, h?.boot, h?.tagline, h?.name, ...(h?.bootLines ?? []), ...(h?.reveals.map(([el]) => el) ?? [])]);
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reduced]);

  // Static mode: the hero is in normal flow, so "Home" is a plain scroll plus focus.
  useEffect(() => {
    if (!reduced) return;
    const f = () => { document.getElementById("hero")?.scrollIntoView(); document.getElementById("hero-title")?.focus(); };
    window.addEventListener("entrance:skip", f);
    return () => window.removeEventListener("entrance:skip", f);
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
      {/* Before the surface in the DOM, so it is the first Tab stop inside the entrance. */}
      <button type="button" data-skip-intro onClick={() => skipIntro()} className="entrance__skip label inline-flex min-h-11 items-center rounded-full border border-line bg-surface-3 px-4 text-fg-muted hover:text-fg">Skip intro ↓</button>
      <div ref={surfaceRef} className="entrance__surface">
        <div ref={heroRef} className="entrance__hero">{children}</div>
      </div>
    </>
  );
}
