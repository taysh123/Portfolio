import { profiler } from "./profile";

export interface Decoded { width: number; height: number; close?: () => void }

/**
 * Frames by playhead, not by a fixed queue.
 *
 * The first version fetched in one static order and could only decode a frame whose blob had already
 * arrived, with a symmetric decode window. A fast scroll therefore outran it: profiling (scripts/
 * profile-entrance.mjs) showed 20–39% of renders during a fast scroll drawing a stand-in frame instead of
 * the one wanted. Now every fetch and every decode is chosen, when a slot frees up, by its rank relative to
 * the playhead: the current frame first, then the next frames in the direction of travel, the pinned
 * keyframes, the rest of the ahead window, a shorter window behind, and only then distant frames. Nothing
 * is requested twice, and fetches and decodes are both bounded.
 */
export class FrameStore<T extends Decoded> {
  private blobs = new Map<number, Blob>();
  private decoded = new Map<number, T>();
  private decoding = new Set<number>();
  private fetching = new Set<number>();
  private tried = new Set<number>();            // fetched or failed: never requested again
  private eligible: Set<number>;
  private listeners = new Set<() => void>();
  private playhead = 0;
  private dir = 1;
  private started = false;
  private disposed = false;
  private concurrency: number;
  failed = false;

  constructor(private o: { count: number;
    /** The frames this store may fetch (a save-data order is a subset); also the tie-break for distant frames. */
    order: number[];
    fetchBlob: (i: number, urgent: boolean) => Promise<Blob>;
    decode: (b: Blob) => Promise<T>;
    /** Symmetric decode window (frames each side); `ahead` / `behind` override it per direction. */
    window?: number; ahead?: number; behind?: number;
    concurrency?: number; decodeConcurrency?: number;
    /** Keyframes decoded as soon as they arrive and never released, so a jump always has a near frame to show. */
    keep?: number[] }) {
    this.eligible = new Set(o.order);
    this.concurrency = o.concurrency ?? 4;
  }

  private get ahead() { return this.o.ahead ?? this.o.window ?? 6; }
  private get behind() { return this.o.behind ?? this.o.window ?? 6; }
  private emit() { this.listeners.forEach((l) => l()); }
  private kept(i: number) { return this.o.keep?.includes(i) ?? false; }

  /** Signed distance in the direction of travel: positive ahead, negative behind. */
  private along(i: number) { return (i - this.playhead) * this.dir; }

  private wanted(i: number) {
    const d = this.along(i);
    return this.kept(i) || (d >= 0 && d <= this.ahead) || (d < 0 && -d <= this.behind);
  }

  /** Lower is sooner. Current frame; two ahead; keyframes; rest of the ahead window; behind; then by distance. */
  private rank(i: number) {
    const d = this.along(i);
    if (d === 0) return 0;
    if (d > 0 && d <= 2) return 1 + d / 10;
    if (this.kept(i)) return 2;
    if (d > 0 && d <= this.ahead) return 3 + d / 100;
    if (d < 0 && -d <= this.behind) return 4 + -d / 100;
    return 5 + (d > 0 ? d : -d * 1.5) / 1000;
  }

  start() { this.started = true; this.pump(); }

  /** Raise or lower the number of simultaneous fetches (e.g. once the page has loaded). */
  setConcurrency(n: number) { this.concurrency = n; this.pump(); }

  private pump() {
    if (!this.started || this.disposed) return;
    while (this.fetching.size < this.concurrency) {
      let best = -1, bestRank = Infinity;
      for (const i of this.eligible) {
        if (this.tried.has(i) || this.fetching.has(i)) continue;
        const r = this.rank(i);
        if (r < bestRank) { bestRank = r; best = i; }
      }
      if (best < 0) return;
      this.fetch(best, bestRank < 2);
    }
  }

  private async fetch(i: number, urgent: boolean) {
    this.fetching.add(i); this.tried.add(i);
    const prof = profiler(); prof?.fetchStart?.(i, performance.now());
    try {
      const b = await this.o.fetchBlob(i, urgent);
      if (this.disposed) return;
      prof?.fetchEnd?.(i, performance.now(), b.size);
      this.blobs.set(i, b);
    } catch { /* network: keep the others going */ }
    this.fetching.delete(i);
    this.decodeWanted(); this.pump();
  }

  private decodeWanted() {
    if (this.disposed) return;
    const cap = this.o.decodeConcurrency ?? 3;
    if (this.decoding.size >= cap) return;
    const todo = [...this.blobs.keys()].filter((i) => !this.decoded.has(i) && !this.decoding.has(i) && this.wanted(i))
      .sort((a, b) => this.rank(a) - this.rank(b));
    for (const i of todo) { if (this.decoding.size >= cap) break; this.decodeOne(i); }
  }

  private decodeOne(i: number) {
    const blob = this.blobs.get(i)!;
    this.decoding.add(i);
    const t0 = performance.now();
    this.o.decode(blob).then((d) => {
      this.decoding.delete(i); profiler()?.decode?.(i, performance.now() - t0, d.width, d.height);
      if (this.disposed || !this.wanted(i)) d.close?.();
      else { this.decoded.set(i, d); this.emit(); }
      this.decodeWanted();
    }, () => { this.decoding.delete(i); this.blobs.delete(i); this.failed = true; this.emit(); this.decodeWanted(); }); // never retried
  }

  setPlayhead(i: number) {
    if (i !== this.playhead) this.dir = i > this.playhead ? 1 : -1;
    this.playhead = i;
    for (const [k, d] of this.decoded) if (!this.wanted(k)) { d.close?.(); this.decoded.delete(k); profiler()?.evict?.(k); }
    this.decodeWanted(); this.pump();
    const prof = profiler();
    if (prof?.playhead) {
      let near = 0, bytes = 0;
      for (const [k, d] of this.decoded) { bytes += d.width * d.height * 4; if (Math.abs(k - i) <= Math.max(this.ahead, this.behind)) near++; }
      prof.playhead(i, this.decoded.size, near, bytes, { decoded: [...this.decoded.keys()], decoding: [...this.decoding], stride: 1 });
    }
  }

  nearestDecoded(i: number): number | null {
    let best: number | null = null;
    for (const k of this.decoded.keys()) if (best === null || Math.abs(k - i) < Math.abs(best - i)) best = k;
    return best;
  }

  get(i: number) { return this.decoded.get(i); }
  onChange(cb: () => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  dispose() { this.disposed = true; this.decoded.forEach((d) => d.close?.()); this.decoded.clear(); this.blobs.clear(); }
}
