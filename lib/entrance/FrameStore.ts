export interface Decoded { width: number; height: number; close?: () => void }

export class FrameStore<T extends Decoded> {
  private blobs = new Map<number, Blob>();
  private decoded = new Map<number, T>();
  private pending = new Set<number>();
  private listeners = new Set<() => void>();
  private playhead = 0;
  private disposed = false;
  failed = false;

  constructor(private o: { count: number; order: number[]; fetchBlob: (i: number) => Promise<Blob>;
    decode: (b: Blob) => Promise<T>; window?: number; concurrency?: number }) {}

  private get win() { return this.o.window ?? 6; }
  private emit() { this.listeners.forEach((l) => l()); }

  start() {
    const queue = [...this.o.order];
    const worker = async () => {
      while (queue.length && !this.disposed) {
        const i = queue.shift()!;
        try { this.blobs.set(i, await this.o.fetchBlob(i)); this.decodeIfWanted(i); } catch { /* network: keep others */ }
      }
    };
    for (let k = 0; k < (this.o.concurrency ?? 4); k++) void worker();
  }

  private wanted(i: number) { return Math.abs(i - this.playhead) <= this.win; }

  private decodeIfWanted(i: number) {
    const blob = this.blobs.get(i);
    if (!blob || this.decoded.has(i) || this.pending.has(i) || !this.wanted(i) || this.disposed) return;
    this.pending.add(i);
    this.o.decode(blob).then((d) => {
      this.pending.delete(i);
      if (this.disposed || !this.wanted(i)) { d.close?.(); return; }
      this.decoded.set(i, d); this.emit();
    }, () => { this.pending.delete(i); this.failed = true; this.emit(); });
  }

  setPlayhead(i: number) {
    this.playhead = i;
    for (const [k, d] of this.decoded) if (!this.wanted(k)) { d.close?.(); this.decoded.delete(k); }
    for (let k = i - this.win; k <= i + this.win; k++) if (k >= 0 && k < this.o.count) this.decodeIfWanted(k);
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
