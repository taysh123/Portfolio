"use client";

import { useEffect, useRef } from "react";
import { BEATS, segment, easeOut, easeInOut } from "@/lib/timeline";
import { FrameStore } from "@/lib/entrance/FrameStore";
import { drawFrame } from "@/lib/entrance/FramePlayer";
import { loadOrder, pickTier, pickFormat, resolveFrame, lerpQuad } from "@/lib/entrance/frames";
import { surfaceTransform, containsRect, coverFit, quadToViewport } from "@/lib/entrance/surface";
import { stageGeometry } from "./stageGeometry";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Manifest, FrameSet, Quad } from "@/lib/entrance/types";
import { jumpTo } from "@/lib/scroll";
import { profiler, experiment } from "@/lib/entrance/profile";
import { VideoPlayer } from "@/lib/entrance/VideoPlayer";
import { progressAt, type Pacing } from "@/lib/entrance/pacing";

// Over the room at p = 0, for the title's legibility; matches the CSS first paint. The film itself opens dark
// (blue hour), so the veil only deepens it slightly and lifts with the camera's first move.
const VEIL = 0.45;
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

type StageState = { set?: FrameSet; store?: FrameStore<ImageBitmap>; kind: "landscape" | "portrait"; gen: number; format: "avif" | "webp" | "mp4" | "webm"; fetchConcurrency: number;
  /** Phones scrub a video (lib/entrance/VideoPlayer); tablets and desktop draw the image sequence on the canvas. */
  player: "canvas" | "video"; video?: VideoPlayer; forceCanvas: boolean; pacing: Pacing;
  tier: number; vw: number; vh: number; pContain: number; raf: number; p: number; poster?: HTMLImageElement; hooks?: Hooks;
  /** Scroll geometry, measured on resize only: progress is then pure arithmetic on scrollY, no layout reads. */
  top: number; range: number; drawnKey: string;
  /** Adaptive cross-fade: the playhead's last position in frame units, and whether blending is on. */
  lastF: number; blend: boolean;
  /** Quad (image space → viewport) of the last painted frame, for a hold. */
  heldQuad?: Quad | null;
  /** Adaptive rendering (see `adapt`): what is drawn while moving, and the display cadence. */
  mode: "blend" | "single"; cadence: "full" | "30"; still: number; cad: Cadence };

/** Recent display-frame intervals while the entrance moves, for the adaptive renderer. */
type Cadence = { auto: boolean; autoCadence: boolean; lastTs: number; lastPaintTs: number; movedAt: number; chained: boolean; base: number; dts: number[]; draws: number[] };
const CAD_WINDOW = 20;   // display frames: a third of a second of scrolling at 60 Hz

const container = () => document.getElementById("entrance")!;

/** The scrub video's first frame fades in over the poster (cold start), with the surface. */
const REVEAL_MS = 180;
const VIDEO_TYPES = [{ ext: "mp4", type: 'video/mp4; codecs="avc1.640028"' }, { ext: "webm", type: 'video/webm; codecs="vp9"' }] as const;

/**
 * Which player: the scrub video on phones — portrait narrower than 480 CSS px, or a phone held sideways (under
 * 500 px tall) — when the manifest has one and the browser plays one of its formats; the canvas elsewhere.
 * Decided from the viewport, never from the device's name. `?entrancePerf=1&entrancePlayer=canvas|video`
 * overrides it for A/B comparison.
 */
const pickPlayer = (set: FrameSet, kind: "landscape" | "portrait", vw: number, vh: number, forceCanvas: boolean): "canvas" | "video" => {
  const want = experiment().player ?? "auto";
  if (forceCanvas || want === "canvas" || !set.video || typeof document === "undefined") return "canvas";
  if (!VideoPlayer.canPlay(VIDEO_TYPES.map((t) => t.type))) return "canvas";
  if (want === "video") return "video";
  return (kind === "portrait" && vw < 480) || (kind === "landscape" && vh < 500) ? "video" : "canvas";
};
/**
 * Adaptive rendering, for touch devices only (desktop wheel scrolling is unchanged). The approved cross-fade
 * draws two full-canvas layers per display frame, and the canvas is then re-uploaded to the compositor every
 * frame the playhead moves. When a device cannot keep that up — a fifth or more of the recent display frames
 * dropped while moving, or draws taking half a frame — it switches, for the rest of the visit, to drawing the
 * nearest frame alone while moving (its own quad, so the surface never detaches from the image; the canvas is
 * untouched until the frame index changes) and restores the exact blend once the scroll has settled. Decided
 * from measured cadence, never from the device's name.
 */
const initialMode = (): Pick<StageState, "mode" | "cadence" | "cad"> => {
  const x = experiment(), touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  return {
    mode: x.mode === "single" ? "single" : "blend", cadence: x.cadence === "30" ? "30" : "full",
    cad: { auto: (x.mode ?? "auto") === "auto" && touch, autoCadence: x.cadence === "auto" && touch, lastTs: 0, lastPaintTs: 0, movedAt: -1e9, chained: false, base: 1000 / 60, dts: [], draws: [] },
  };
};

/** Jump to p = 1 (the hero at identity). Instant: no scroll-driven replay. Focuses the h1 unless told not to. */
function skipIntro(focusTitle = true) {
  const c = container(), end = c.offsetTop + c.offsetHeight - window.innerHeight;
  jumpTo(end);                              // through Lenis when it runs: a native jump mid-glide is undone
  if (focusTitle) document.getElementById("hero-title")?.focus();
}

/** Anchors that mean "the start of the content": the skip link, Back to top, the logo. */
const HERO_HASHES = new Set(["#main", "#hero"]);

/** Decoded ImageBitmaps cost w·h·4 bytes each: narrow the decode window as the tier grows. Ahead of the
 *  playhead (in the direction of travel) outweighs behind; peak memory stays near the old symmetric window's.
 *  The phone tier (600) keeps 6 ahead / 2 behind: its whole set is fetched up front, so a decode never waits
 *  on the network, and the narrower window measured no more misses while holding ~31 MB of bitmaps, not ~44. */
const windowFor = (tier: number) => (tier >= 1920 ? { ahead: 5, behind: 2 } : tier >= 1280 ? { ahead: 8, behind: 3 } : tier > 600 ? { ahead: 10, behind: 3 } : { ahead: 6, behind: 2 });

/**
 * Canvas backing scale: never more pixels than the frames themselves carry. The canvas's backing store is
 * handed to the compositor every frame, at a cost proportional to its pixel count — the dominant main-thread
 * cost in profiling (scripts/profile-entrance.mjs): a 1440×900 @2x canvas was 2880×1800 while the 1920-px
 * frames cover it at 1.2 source px per CSS px. Backing at the source's own density stores every source pixel
 * once; above it, extra pixels are interpolated and add no detail. Floor 1 (never below CSS px), cap 2.
 */
const backingScale = (set: FrameSet | undefined, tier: number, vw: number, vh: number) => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (experiment().backing) return Math.min(window.devicePixelRatio || 1, experiment().backing!);
  if (!set || !tier || !vw || !vh) return 1;
  const tierH = (tier * set.height) / set.width, srcPerCss = 1 / Math.max(vw / tier, vh / tierH);
  return Math.min(dpr, Math.max(1, srcPerCss));
};

/** Writes a style property (or text) only when its value changes: most of the stage's values hold for many frames. */
const last = new WeakMap<object, Record<string, string>>();
const put = (el: HTMLElement, prop: string, v: string) => {
  const m = last.get(el) ?? (last.set(el, {}), last.get(el)!);
  if (m[prop] === v) return;
  m[prop] = v;
  if (prop === "text") el.textContent = v; else el.style.setProperty(prop, v);
};

/** Every inline property the stage writes, so static mode can hand the hero back untouched. */
function resetInline(els: (HTMLElement | null | undefined)[]) {
  for (const el of els) if (el) { last.delete(el); for (const k of ["left", "top", "width", "height", "transform", "clip-path", "opacity", "pointer-events"]) el.style.removeProperty(k); }
}

export function EntranceStage({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPref();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLParagraphElement>(null);
  // The imperative stage lives inside the effect below; the fonts-ready callback reaches it through this ref.
  const renderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (reduced) { document.documentElement.dataset.entranceDone = "true"; return; }
    const stage = canvasRef.current!.parentElement!;
    const s: StageState = { kind: stageGeometry(window.innerWidth, window.innerHeight).kind, gen: 0, tier: 0, vw: 0, vh: 0, pContain: BEATS.push[1], raf: 0, p: 0, top: 0, range: 1, drawnKey: "", lastF: 0, blend: true, still: 0, format: "avif", fetchConcurrency: 6, player: "canvas", forceCanvas: false, pacing: stageGeometry(window.innerWidth, window.innerHeight).pacing, ...initialMode() };
    // `?entrancePerf=1`: a temporary, opt-in diagnostics panel (performance numbers only), loaded as its own
    // chunk. Without the parameter nothing is imported and nothing below changes.
    const perf = /[?&]entrancePerf=1(&|$)/.test(location.search) ? import("@/lib/entrance/perfPanel").then((m) => m.install()).catch(() => {}) : undefined;
    const canvas = canvasRef.current!, surface = surfaceRef.current!, hero = heroRef.current!;
    // One context for the life of the stage. Opaque: every draw covers the whole canvas (cover fit), so the
    // compositor never blends it and no clear is needed. It stays hidden (CSS) until its first draw, so an
    // opaque, still-empty canvas never hides the poster underneath.
    const ctx = canvas.getContext("2d", { alpha: false })!;
    // Progress through the entrance, as Framer's useScroll computed it ("start start" → "end end").
    // Desktop paces the beats unevenly over its longer runway (lib/entrance/pacing.ts); phones map 1:1.
    const progressNow = () => progressAt((window.scrollY - s.top) / s.range, s.pacing);
    const sizeCanvas = () => {
      const k = backingScale(s.set, s.tier, s.vw, s.vh), w = Math.round(s.vw * k), h = Math.round(s.vh * k);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; s.drawnKey = ""; }
      ctx.setTransform(k, 0, 0, k, 0, 0);
      if (s.set) profiler()?.config?.({ framing: s.kind, tier: s.tier, format: s.format, count: s.player === "video" ? s.set.video?.samples ?? 0 : s.set.frames.length, vw: s.vw, vh: s.vh, dpr: window.devicePixelRatio || 1,
        player: s.player, pacing: s.pacing, runwayPx: s.range, canvasW: w, canvasH: h, mode: `${s.cad.auto ? "auto:" : ""}${s.mode}`, cadence: `${s.cad.autoCadence ? "auto:" : ""}${s.cadence}`, fetchConcurrency: s.fetchConcurrency });
    };
    const veil = veilRef.current!, title = titleRef.current!, chapter = chapterRef.current!;

    // Geometry: framing, container height, canvas backing size — on mount and whenever the stage box changes.
    // Measured from the stage itself (100svh × client width), never the window: iOS toolbars and classic
    // scrollbars make innerWidth/innerHeight disagree with the box the canvas and the surface live in.
    const apply = () => {
      const vw = stage.clientWidth, vh = stage.clientHeight, g = stageGeometry(window.innerWidth, window.innerHeight);
      const x = experiment().runway, svh = (g.kind === "portrait" ? x?.portrait : g.pacing === "linear" ? x?.short : x?.desktop) ?? g.containerSvh;
      s.pacing = experiment().pacing ?? g.pacing;
      const c = container(); c.dataset.framing = g.kind; c.style.setProperty("--entrance-h", `${svh}svh`);
      s.vw = vw; s.vh = vh;
      s.top = c.getBoundingClientRect().top + window.scrollY;
      s.range = Math.max(1, c.offsetHeight - document.documentElement.clientHeight);
      if (s.kind !== g.kind) { s.kind = g.kind; void boot(); }
      sizeCanvas();
      put(hero, "width", `${vw}px`); put(hero, "height", `${vh}px`);
      // Drawn now, not next frame: resizing cleared the canvas, and an opaque cleared canvas is black.
      measureHooks(); computeContain(); frame();
    };

    // One frame set at a time: a framing change (or unmount) bumps `gen`, which retires any boot still in flight.
    const boot = async () => {
      const gen = ++s.gen;
      s.store?.dispose(); s.store = undefined; s.set = undefined; s.poster = undefined;
      s.video?.dispose(); s.video = undefined;
      await perf;
      if (gen !== s.gen) return;
      Object.assign(s, initialMode(), { still: 0 });
      let m: Manifest;
      try { m = await (await fetch("/entrance/manifest.json")).json(); } catch { return; } // the poster stays
      if (gen !== s.gen) return;
      const kind = s.kind, set = m?.[kind];
      if (!set?.frames?.length || !set.tiers?.length) return; // malformed manifest: the poster stays
      const tier = experiment().tier ?? pickTier(set.tiers, s.vw, window.devicePixelRatio || 1, saveData());
      const x = experiment(), format = x.format === "avif" || (x.format === "webp" && set.webp?.includes(tier)) ? x.format : pickFormat(set, kind, tier, s.vw);
      // The phone WebP set is small (~0.9 MB): every frame is requested as soon as loading starts (current and
      // upcoming frames at high priority), so a scroll waits on decoding only, never on the network. Decoded
      // bitmaps stay bounded to the window around the playhead; only the compressed blobs are all kept.
      const fetchConcurrency = x.fetchConcurrency ?? (format === "webp" ? set.frames.length : 6);
      const posterImg = new Image(); posterImg.src = `/entrance/${set.poster}.avif`; await posterImg.decode().catch(() => {});
      if (gen !== s.gen) return;
      s.player = pickPlayer(set, kind, s.vw, s.vh, s.forceCanvas);
      if (s.player === "video") return bootVideo(gen, set, kind, posterImg);
      s.set = set; s.tier = tier; s.format = format; s.fetchConcurrency = fetchConcurrency; s.poster = posterImg; s.drawnKey = ""; sizeCanvas();
      // The frame at the identity beat (the display awake, the camera at rest-pace): kept decoded, loaded early.
      const stillIndex = set.frames.reduce((best, f, i) => (Math.abs(f.p - BEATS.identity[0]) < Math.abs(set.frames[best].p - BEATS.identity[0]) ? i : best), 0);
      const keep = [0, stillIndex, set.pushEndIndex].filter((i) => i >= 0);
      const store = new FrameStore<ImageBitmap>({
        count: set.frames.length,
        order: loadOrder(set.frames.length, { stillIndex, pushEndIndex: set.pushEndIndex, lidEnd: stillIndex - 1, saveData: saveData() }),
        // A 404 must fail the fetch, not hand an HTML error page to the decoder (review M9).
        fetchBlob: async (i, urgent) => {
          const r = await fetch(`/entrance/${kind}/${tier}/${set.frames[i].file}.${format}`, { priority: urgent ? "high" : "low" } as RequestInit);
          if (!r.ok) throw new Error(`frame ${i}: ${r.status}`); return r.blob();
        },
        decode: (b) => createImageBitmap(b), ...(x.window ?? windowFor(tier)), concurrency: fetchConcurrency, keep,
        decodeConcurrency: (navigator.hardwareConcurrency || 4) >= 8 ? 4 : 3,
      });
      s.store = store;
      // A decoded frame only matters while the room is visible: from identity on, the opaque surface covers
      // the canvas, so background decodes cost no draw (spec §9 idle work; found in Plan 2 Task 12, where
      // a scrolled-away entrance kept redrawing for every frame the store finished).
      store.onChange(() => { if (s.p < identityAt()) request(); });
      store.setPlayhead(frameIndexAt(set, progressNow()));
      // Frames load from the load event (spec §9: nothing competes with first paint) — or from the viewer's
      // first scroll, key or touch if that comes sooner: then the sequence is needed now.
      const go = () => { if (s.store === store) store.start(); off(); };
      const early = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      const off = () => { window.removeEventListener("load", go); for (const e of early) window.removeEventListener(e, go); };
      if (document.readyState === "complete") go();
      else { window.addEventListener("load", go, { once: true }); for (const e of early) window.addEventListener(e, go, { once: true, passive: true }); }
      computeContain(); request();
    };

    // The video player's boot (phones). The canvas stays hidden; the video fades in over the poster on its first
    // presented frame. Loading is gated exactly like the canvas frames: the load event or the first input.
    const bootVideo = (gen: number, set: FrameSet, kind: "landscape" | "portrait", posterImg: HTMLImageElement) => {
      const meta = set.video!;
      const v = new VideoPlayer({
        meta,
        sources: VIDEO_TYPES.map((t) => ({ src: `/entrance/${kind}/scrub.${t.ext}`, type: t.type })),
        // A newly presented frame: place the surface for it (and keep going while a seek is still chasing).
        onFrame: () => { if (s.video === v) { s.video.el.dataset.drawn = ""; request(); } },
        // The video cannot play here after all: the canvas takes over for the rest of the visit.
        onError: () => { if (s.video === v && gen === s.gen) { s.forceCanvas = true; void boot(); } },
      });
      v.el.className = "entrance__canvas entrance__video";
      delete canvas.dataset.drawn; s.drawnKey = "";             // the canvas stays hidden under the video
      s.cad.auto = false; s.cad.autoCadence = false;           // the canvas's adaptive modes do not apply
      canvas.after(v.el);
      s.video = v; s.set = set; s.tier = meta.width; s.poster = posterImg; s.fetchConcurrency = 1;
      s.format = VIDEO_TYPES.find((t) => v.el.canPlayType(t.type) !== "")?.ext ?? "mp4";
      sizeCanvas();
      const go = () => {
        if (s.video === v) {
          v.start(); v.seekTo(progressNow());
          // A video that has shown nothing 6 s after loading began (a stalled fetch, a policy that never lets
          // it load) is not coming: the canvas takes over, like on an error.
          window.setTimeout(() => { if (s.video === v && gen === s.gen && v.shown < 0) { s.forceCanvas = true; void boot(); } }, 6000);
        }
        off();
      };
      const early = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      const off = () => { window.removeEventListener("load", go); for (const e of early) window.removeEventListener(e, go); };
      if (document.readyState === "complete") go();
      else { window.addEventListener("load", go, { once: true }); for (const e of early) window.addEventListener(e, go, { once: true, passive: true }); }
      // iOS starts fetching a paused, never-played video only once it has been played: a muted play/pause on
      // the first touch (muted inline playback needs no permission, and a touch satisfies any policy).
      window.addEventListener("touchstart", () => { if (s.video === v) v.prime(); }, { once: true, passive: true });
      computeContain(); request();
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
      const fit = coverFit(set.width, set.height, s.vw, s.vh, 1);
      const f = set.frames.find((fr) => fr.p >= BEATS.push[0] && fr.quad && containsRect(quadToViewport(fr.quad, set.width, set.height, fit), s.vw, s.vh));
      s.pContain = f ? f.p : BEATS.push[1];
    };

    // The progress at which the surface reaches identity and covers the viewport.
    const identityAt = () => (s.kind === "portrait" ? BEATS.portraitOpen[1] : BEATS.push[1]);

    const placeSurface = (p: number, quad: Quad | null, fade = 1) => {
      const portrait = s.kind === "portrait";
      const identityP = identityAt();
      // Before identity the surface needs a real quad: with none (frames not decoded yet, a manifest failure)
      // it stays hidden rather than flashing full-screen over the rendered room.
      const shown = p >= BEATS.wake[0] && (quad !== null || p >= identityP);
      put(surface, "opacity", shown ? String(+(segment(p, BEATS.wake[0], BEATS.wake[0] + 0.04) * fade).toFixed(3)) : "0");
      // pContain can equal the push end (no push frame covers the viewport): then it is a step, not a ramp.
      let toIdentity = portrait ? segment(p, ...BEATS.portraitOpen)
        : s.pContain < BEATS.push[1] ? segment(p, s.pContain, BEATS.push[1], easeOut) : Number(p >= BEATS.push[1]);
      if (p >= identityP || !quad) toIdentity = 1; // no quad (nothing decoded, or a back-facing frame): rest at identity
      const q = quad ?? ([{ x: 0, y: 0 }, { x: s.vw, y: 0 }, { x: s.vw, y: s.vh }, { x: 0, y: s.vh }] as Quad);
      const t = surfaceTransform({ kind: s.kind, quad: q, vw: s.vw, vh: s.vh, toIdentity });
      // The box (left/top/width/height) depends only on the viewport, so after the first frame these four
      // layout-affecting writes are skipped; the motion itself is the transform and the clip.
      put(surface, "left", `${t.box.x}px`); put(surface, "top", `${t.box.y}px`); put(surface, "width", `${t.box.w}px`); put(surface, "height", `${t.box.h}px`);
      put(surface, "transform", t.matrix); put(surface, "clip-path", t.clip);
      put(hero, "left", `${-t.box.x}px`); put(hero, "top", `${-t.box.y}px`);
      put(surface, "pointer-events", p >= identityP ? "auto" : "none");
      // On the display the page is light emitted under cover glass: the rendered frame below carries the glass's
      // reflections (the display renders as black glass), and the page adds to them (plus-lighter, as emitted
      // light does). At identity the page is the page again: normal blending, opaque.
      const glass = p < identityP ? "1" : "";
      if ((surface.dataset.glass ?? "") !== glass) { if (glass) surface.dataset.glass = glass; else delete surface.dataset.glass; }
    };

    // Inside the screen: boot log → identity card → the card lands as the name line, the hero rises in.
    const choreograph = (p: number) => {
      const h = s.hooks; if (!h) return;
      h.bootLines.forEach((el, i) => { put(el, "opacity", String(segment(p, 0.4 + 0.03 * i, 0.44 + 0.03 * i))); });
      if (h.boot) put(h.boot, "opacity", String(1 - segment(p, BEATS.identity[0], BEATS.identity[0] + 0.05)));
      if (h.tagline) put(h.tagline, "opacity", String(segment(p, 0.57, 0.62) * (1 - segment(p, 0.84, 0.88))));
      if (h.name) {
        const land = segment(p, s.kind === "portrait" ? 0.9 : BEATS.portal[0], BEATS.navIn[0], easeInOut), f = h.nameFrom, r = 1 - land;
        put(h.name, "opacity", String(segment(p, 0.55, 0.6)));
        put(h.name, "transform", r ? `translate(${f.x * r}px, ${f.y * r}px) scale(${1 + (f.k - 1) * r})` : "");
      }
      for (const [el, at] of h.reveals) {
        const t = segment(p, at, at + 0.04, easeOut);
        // clear the mask's overflow-clip-margin too, or the top of the line peeks out
        put(el, "transform", t < 1 ? `translateY(calc(${(1 - t) * 100}% + ${(1 - t) * 14}px))` : "");
      }
    };

    // One frame of work, at most once per display frame, reading the scroll position when it runs: in the
    // same animation frame as Lenis's scroll write (or the native scroll), so the room never trails the page.
    const frame = (ts?: number) => {
      cancelAnimationFrame(s.raf); s.raf = 0;
      const t0 = performance.now(), p = progressNow(), moving = p !== s.p;
      // Display cadence while scrolling, for the adaptive renderer (touch only): consecutive rAF timestamps
      // (vsync-aligned) during and for 100 ms after movement, when frames are requested every display frame —
      // not the scroll events' own rhythm. A gap over 250 ms is a pause between gestures, not a dropped frame.
      // Tracked only while a step remains to take: once reduced (or with no adaptation) nothing extra runs.
      const c = s.cad, tracking = (c.auto && s.mode === "blend") || (c.autoCadence && s.cadence === "full");
      if (ts !== undefined && moving) c.movedAt = ts;
      const recent = ts !== undefined && ts - c.movedAt < 100, dt = ts !== undefined && c.lastTs ? ts - c.lastTs : 0;
      if (ts !== undefined) c.lastTs = ts;
      // Only an interval between two frames of one continuous chain counts (the previous frame asked for this one).
      if (tracking && recent && c.chained && dt > 0 && dt < 250) { c.dts.push(dt); if (c.dts.length > CAD_WINDOW) c.dts.shift(); }
      c.chained = tracking && recent;
      // Steady half-rate cadence while moving: the frame after a drawn one draws nothing — canvas, surface and
      // overlays all hold together, so the image and the surface still move as one.
      if (s.cadence === "30" && moving && ts !== undefined && ts - c.lastPaintTs < 1.5 * c.base) {
        profiler()?.render?.({ p, queuedAt: t0, start: t0, ms: performance.now() - t0, drawMs: 0, path: "skip", want: -1, drawn: null, ts, painted: false, skipped: true, moving });
        request(); return;
      }
      if (ts !== undefined) c.lastPaintTs = ts;
      s.p = p;
      // No synthetic zoom: the camera itself moves from the first scroll (v2 film).
      const zoom = 1;
      // Frames crossed since the last draw. Blending stops at ≥ 1.25 frames per display frame and resumes
      // below 0.75 (hysteresis, so a speed near the threshold does not flicker between the two).
      let speed = 0;
      if (s.set) {
        const r = resolveFrame(p, s.set.frames), f = r.a + r.w;
        speed = Math.abs(f - s.lastF);
        s.lastF = f;
        s.still = speed === 0 ? s.still + 1 : 0;
        // Single-frame mode: the nearest frame alone while moving; the exact blend once the playhead has held
        // still for three display frames (not one, so an irregular stream of scroll events cannot flicker
        // between a snapped and a blended image mid-gesture).
        if (s.mode === "single") s.blend = s.still >= 3;
        else if (s.blend && speed >= 1.25) s.blend = false; else if (!s.blend && speed <= 0.75) s.blend = true;
      }
      if (s.video && s.set) { videoFrame(p, zoom, t0, ts, moving); return; }
      const drawn = s.set && s.store
        ? drawFrame({ ctx, frames: s.set.frames, p, store: s.store as never, fallback: (s.poster ?? null) as never, fallbackQuad: null, frameW: s.set.width, frameH: s.set.height, vw: s.vw, vh: s.vh, zoom, skipKey: s.drawnKey, blend: s.blend, held: s.drawnKey.startsWith("pair:") || s.drawnKey.startsWith("near:") ? s.heldQuad ?? null : undefined })
        : null;
      if (drawn) {
        s.drawnKey = drawn.key; if (drawn.path !== "none") canvas.dataset.drawn = "";
        if (drawn.path !== "hold") s.heldQuad = drawn.quad;
      }
      const quad: Quad | null = drawn?.quad ?? null, drawMs = performance.now() - t0;
      if (tracking && moving && ts !== undefined) { c.draws.push(drawMs); if (c.draws.length > CAD_WINDOW) c.draws.shift(); }
      if (tracking && recent) adapt();
      s.store?.setPlayhead(frameIndexAt(s.set, p));
      overlays(p);
      placeSurface(p, quad);
      choreograph(p);
      profiler()?.render?.({ p, queuedAt: t0, start: t0, ms: performance.now() - t0, drawMs, path: drawn?.path ?? "none", want: drawn?.want ?? -1, drawn: drawn?.drawnA ?? null, ts, painted: drawn?.painted ?? false, moving });
      // Snapped to the nearest frame for speed: look again next frame. If the scroll has stopped, the speed is
      // then 0, blending resumes and the exact approved state for p is drawn — nothing is left mid-snap at rest.
      // Once blending is back on, no further frame is requested (no idle loop).
      if (!s.blend || (tracking && recent)) request();
    };
    const request = () => { if (!s.raf) s.raf = requestAnimationFrame(frame); };

    // The room's overlays and the done flag: scroll-driven, not attached to the picture.
    const overlays = (p: number) => {
      put(veil, "opacity", String(VEIL * (1 - segment(p, ...BEATS.lift, easeOut))));
      put(chapter, "text", CHAPTERS.filter(([at]) => p >= at).pop()?.[1] ?? "");
      put(chapter, "opacity", String(1 - segment(p, BEATS.push[0], BEATS.push[0] + 0.04)));
      put(title, "opacity", String(segment(p, 0.02, 0.1) * (1 - segment(p, ...BEATS.titleOut))));
      const done = String(p >= BEATS.navIn[0]);
      if (document.documentElement.dataset.entranceDone !== done) document.documentElement.dataset.entranceDone = done;
    };

    // One frame of the video player. The seek goes to the scroll position; everything spatially tied to the
    // picture — the surface's quad, its identity ramp — follows the frame actually on screen (`shown`), so a
    // late seek delays the pair together instead of separating them. Overlays that are not attached to the
    // picture (veil, title, chapter, the screen's own choreography) follow the scroll as before.
    const videoFrame = (p: number, zoom: number, t0: number, ts: number | undefined, moving: boolean) => {
      const v = s.video!, set = s.set!, meta = set.video!;
      v.seekTo(p);
      put(v.el, "transform", zoom === 1 ? "" : `scale(${zoom})`);
      const shown = v.shown, last = meta.samples - 1;
      // Cold start: the first presented frame may be far from the poster (the viewer scrolled before the video
      // could seek). Rather than cut to it, the video and the hero surface fade in together over REVEAL_MS — an
      // honest hold on the poster, then one soft transition, never a jump back or a frozen-then-sudden catch-up.
      const reveal = v.firstShownAt ? Math.min(1, (performance.now() - v.firstShownAt) / REVEAL_MS) : 0;
      put(v.el, "opacity", String(+reveal.toFixed(3)));
      // Progress of the picture on screen: the scroll's own below the first frame (a still, zoomed by the lift)
      // and past the last once the video has reached it; the shown sample's in between.
      const pv = shown < 0 ? Math.min(p, meta.p0) : p <= meta.p0 && shown === 0 ? p : p >= meta.p1 && shown === last ? p : v.progressOf(shown);
      const r = resolveFrame(pv, set.frames), fit = coverFit(meta.width, meta.height, s.vw, s.vh, zoom);
      const q = lerpQuad(set.frames[r.a].quad, set.frames[r.b].quad, r.w);
      const quad = shown < 0 || !q ? null : quadToViewport(q, meta.width, meta.height, fit);
      overlays(p);
      placeSurface(pv, quad, p >= identityAt() ? 1 : reveal);   // at identity the hero shows, video or not
      choreograph(p);
      if (reveal > 0 && reveal < 1) request();
      profiler()?.render?.({ p, queuedAt: t0, start: t0, ms: performance.now() - t0, drawMs: 0, path: shown < 0 ? "fallback" : shown === v.wanted ? "video" : "video-late", want: v.wanted, drawn: shown < 0 ? null : shown, ts, painted: true, moving });
      // No polling while a seek runs: the player's onFrame asks for the next frame when the picture changes.
    };

    // The adaptive step (touch devices, see `initialMode`): judged over a full window of moving frames, then
    // the window restarts so the next step is judged on the new mode's own cadence. One-way for the visit.
    const adapt = () => {
      const c = s.cad;
      if (c.dts.length < CAD_WINDOW) return;
      const sorted = [...c.dts].sort((a, b) => a - b);
      c.base = Math.min(c.base, Math.max(6, sorted[Math.floor(sorted.length * 0.1)]));   // the display's own interval
      const dropRate = c.dts.filter((d) => d > 1.5 * c.base).length / c.dts.length;
      const drawMean = c.draws.reduce((a, b) => a + b, 0) / Math.max(1, c.draws.length);
      const strained = dropRate >= 0.2 || drawMean >= 0.5 * c.base;
      let reason = "";
      if (strained && c.auto && s.mode === "blend") { s.mode = "single"; reason = "blend strained"; }
      else if (strained && c.autoCadence && s.cadence === "full" && (s.mode === "single" || !c.auto)) { s.cadence = "30"; reason = "single strained"; }
      c.dts = []; c.draws = [];
      if (reason) { profiler()?.adapt?.({ mode: s.mode, cadence: s.cadence, reason, dropRate, baseMs: c.base }); sizeCanvas(); }
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
    renderRef.current = request;
    apply(); void boot();
    ro.observe(stage);
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", request, { passive: true });
    document.addEventListener("focusin", onFocus); document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash); window.addEventListener("entrance:skip", onSkip);
    if (HERO_HASHES.has(location.hash)) requestAnimationFrame(() => skipIntro());
    void document.fonts?.ready.then(() => { if (renderRef.current === request) { measureHooks(); request(); } });
    return () => {
      renderRef.current = null; s.gen++;
      ro.disconnect(); window.removeEventListener("resize", apply); window.removeEventListener("scroll", request);
      document.removeEventListener("focusin", onFocus); document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash); window.removeEventListener("entrance:skip", onSkip);
      s.store?.dispose(); s.video?.dispose(); cancelAnimationFrame(s.raf);
      // Static mode takes over (reduced motion switched on): hand every element back with no inline geometry.
      const h = s.hooks;
      resetInline([surface, hero, veil, title, chapter, h?.boot, h?.tagline, h?.name, ...(h?.bootLines ?? []), ...(h?.reveals.map(([el]) => el) ?? [])]);
      delete canvas.dataset.drawn; canvas.width = 0; canvas.height = 0;
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
