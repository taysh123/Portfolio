import type { VideoMeta } from "./types";
import { profiler } from "./profile";

/**
 * Scroll-scrubbed video for phones (the canvas image sequence stays for tablets and desktop, and as the A/B
 * fallback).
 *
 * Why: on iPhone Safari the canvas path decodes every frame with createImageBitmap — which WebKit does not
 * move off the main thread — and uploads each new frame to the GPU as it is drawn, twice while cross-fading.
 * A <video> is decoded by the hardware decoder and composited as its own layer: no main-thread decode, no
 * canvas upload, a few decoded frames of memory instead of a window of full bitmaps.
 *
 * The video (scripts/encode-video.mjs) holds `samples` frames uniform in progress between `p0` and `p1`, each
 * one the canvas's exact approved cross-fade, so progress → frame is arithmetic.
 *
 * Seeking: at most one seek in flight, always to the newest target. A seek issued while another runs would
 * cancel it (WebKit), and a stream of them during a swipe can leave nothing ever finishing — a freeze; queued
 * seeks instead would replay stale positions after the finger stops. So the newest target waits for the
 * running seek, then goes.
 *
 * Seeks are issued from the stage's animation frame (one target per display frame) and from `seeked` (the
 * newest target as soon as the decoder is free), so after the finger stops at most one stale seek finishes
 * before the final one: no queue to drain, no delayed catch-up.
 *
 * Presented frame: reported by requestVideoFrameCallback (the frame actually composited, by its media time),
 * or by `seeked` where that is missing. The stage places the hero surface from this frame's progress, never
 * from the scroll position, so the screen quad and the picture cannot separate even while a seek is late.
 * Nothing counts as presented before the first seek completes: the element's own initial frame (the start of
 * the sequence) is never shown over a viewer who has already scrolled, so a cold start cannot jump backwards.
 */
export class VideoPlayer {
  readonly el: HTMLVideoElement;
  /** Frame on screen (sample index), or -1 before the first one is presented. */
  shown = -1;
  private target = 0;
  private requested = -1;
  private seekStart = 0;
  private started = false;
  private disposed = false;
  private rvfc = 0;
  private hasRvfc = false;
  private seekedOnce = false;
  /** performance.now() of the first presented frame (the stage fades the video in from there), or 0. */
  firstShownAt = 0;
  failed = false;

  constructor(private o: { meta: VideoMeta; sources: { src: string; type: string }[]; onFrame: () => void; onError: () => void }) {
    const v = (this.el = document.createElement("video"));
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = "auto";
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disablepictureinpicture", ""); v.setAttribute("disableremoteplayback", ""); v.setAttribute("aria-hidden", "true");
    v.tabIndex = -1;
    v.addEventListener("seeked", this.onSeeked);
    v.addEventListener("loadeddata", this.onLoaded);
    v.addEventListener("error", this.onError, true);
  }

  /** Playable here at all (checked before choosing this player). */
  static canPlay(types: string[]) {
    const v = document.createElement("video");
    return types.some((t) => v.canPlayType(t) !== "");
  }

  /** Begin loading (from the load event or first interaction, like the canvas frames). */
  start() {
    if (this.started || this.disposed) return; this.started = true;
    for (const s of this.o.sources) { const e = document.createElement("source"); e.src = s.src; e.type = s.type; e.addEventListener("error", this.onError); this.el.appendChild(e); }
    this.el.load();
    this.watchFrames();
  }

  /** iOS fetches media data for a paused, never-played element lazily; a muted play/pause starts it. */
  prime() {
    if (!this.started || this.disposed || this.el.readyState >= 2) return;
    const p = this.el.play(); if (p) p.then(() => { this.el.pause(); this.requested = -1; this.pump(); }, () => {});
  }

  sampleAt(p: number) {
    const { p0, p1, samples } = this.o.meta;
    return Math.max(0, Math.min(samples - 1, Math.round(((p - p0) / (p1 - p0)) * (samples - 1))));
  }
  progressOf(sample: number) { const { p0, p1, samples } = this.o.meta; return p0 + ((p1 - p0) * sample) / (samples - 1); }

  seekTo(p: number) { this.target = this.sampleAt(p); this.pump(); }
  get wanted() { return this.target; }
  get busy() { return this.el.seeking; }

  private pump() {
    const v = this.el;
    if (this.disposed || v.readyState < 1 || v.seeking) return;   // HAVE_METADATA: currentTime can be set
    if (this.target === this.requested) return;
    this.requested = this.target; this.seekStart = performance.now();
    if (!v.paused) v.pause();
    // The middle of the frame's interval: the frame with that presentation time, not its neighbour by rounding.
    v.currentTime = (this.target + 0.5) / this.o.meta.fps;
  }

  private setShown(s: number) {
    if (s === this.shown) return;
    if (this.shown < 0) this.firstShownAt = performance.now();
    this.shown = s; this.o.onFrame();
  }

  private watchFrames() {
    type Meta = { mediaTime: number; presentedFrames?: number; processingDuration?: number; expectedDisplayTime?: number };
    const v = this.el as HTMLVideoElement & { requestVideoFrameCallback?: (cb: (now: number, m: Meta) => void) => number };
    this.hasRvfc = typeof v.requestVideoFrameCallback === "function";
    if (!this.hasRvfc) return;
    const cb = (now: number, m: Meta) => {
      if (this.disposed) return;
      const s = Math.max(0, Math.min(this.o.meta.samples - 1, Math.round(m.mediaTime * this.o.meta.fps)));
      if (this.seekedOnce) {
        profiler()?.presented?.({ sample: s, presentedFrames: m.presentedFrames, processingMs: m.processingDuration === undefined ? undefined : m.processingDuration * 1000,
          delayMs: m.expectedDisplayTime === undefined ? undefined : m.expectedDisplayTime - now, seekToPresentMs: s === this.requested ? now - this.seekStart : undefined });
        this.setShown(s);
      }
      this.rvfc = v.requestVideoFrameCallback!(cb);
    };
    this.rvfc = v.requestVideoFrameCallback(cb);
  }

  private onSeeked = () => {
    this.seekedOnce = true;
    profiler()?.seek?.(performance.now() - this.seekStart, this.requested);
    // The seek's frame is the one composited next. requestVideoFrameCallback reports it when available; where
    // it is missing (Safari < 15.4), or does not fire for a paused element's seek, it is taken from here after
    // two display frames — so the surface can never stay parked on an older frame.
    const at = Math.floor(this.el.currentTime * this.o.meta.fps + 1e-6), seek = this.requested;
    if (!this.hasRvfc) this.setShown(at);
    else requestAnimationFrame(() => requestAnimationFrame(() => { if (!this.disposed && this.requested === seek && this.shown !== at && !this.el.seeking) this.setShown(at); }));
    this.pump();
  };
  private onLoaded = () => { this.pump(); };
  // A media error, or every <source> rejected (NETWORK_NO_SOURCE): the stage falls back to the canvas.
  private onError = () => { if (this.failed || this.disposed) return; if (this.el.error || this.el.networkState === 3) { this.failed = true; this.o.onError(); } };

  /** Loaded fraction (0–1) of the video, for diagnostics. */
  buffered() {
    const v = this.el; if (!v.duration || !v.buffered.length) return 0;
    let t = 0; for (let i = 0; i < v.buffered.length; i++) t += v.buffered.end(i) - v.buffered.start(i);
    return Math.min(1, t / v.duration);
  }

  dispose() {
    this.disposed = true;
    const v = this.el as HTMLVideoElement & { cancelVideoFrameCallback?: (h: number) => void };
    v.cancelVideoFrameCallback?.(this.rvfc);
    v.removeEventListener("seeked", this.onSeeked); v.removeEventListener("loadeddata", this.onLoaded); v.removeEventListener("error", this.onError, true);
    v.pause(); v.removeAttribute("src"); while (v.firstChild) v.removeChild(v.firstChild); v.load(); v.remove();
  }
}
