import { describe, it, expect, vi } from "vitest";
import { FrameStore } from "@/lib/entrance/FrameStore";

const flush = () => new Promise((r) => setTimeout(r, 0));
const mk = (count: number, opts: Partial<ConstructorParameters<typeof FrameStore>[0]> = {}) => {
  const closed: number[] = [];
  const store = new FrameStore({
    count, order: Array.from({ length: count }, (_, i) => i),
    fetchBlob: async (i) => new Blob([String(i)]),
    decode: async (b) => { const i = Number(await b.text()); return { width: 10, height: 10, i, close: () => closed.push(i) }; },
    window: 2, concurrency: 3, ...opts,
  });
  return { store, closed };
};

describe("FrameStore", () => {
  it("decodes only inside the window around the playhead", async () => {
    const { store } = mk(20); store.start(); store.setPlayhead(10);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.get(10)).toBeDefined(); expect(store.get(12)).toBeDefined(); expect(store.get(15)).toBeUndefined();
  });
  it("releases decoded frames that leave the window", async () => {
    const { store, closed } = mk(20); store.start(); store.setPlayhead(2);
    for (let k = 0; k < 10; k++) await flush();
    store.setPlayhead(15);
    for (let k = 0; k < 10; k++) await flush();
    expect(closed).toContain(2); expect(store.get(2)).toBeUndefined();
  });
  it("nearestDecoded falls back to the closest available frame", async () => {
    const { store } = mk(20); store.start(); store.setPlayhead(3);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.nearestDecoded(9)).toBe(5);
  });
  it("marks failure on a decode error and keeps going", async () => {
    const { store } = mk(5, { decode: vi.fn().mockRejectedValue(new Error("bad avif")) });
    store.start(); store.setPlayhead(0);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.failed).toBe(true); expect(store.nearestDecoded(0)).toBeNull();
  });
  it("keeps keyframes decoded wherever the playhead goes", async () => {
    const { store, closed } = mk(20, { keep: [0, 19] }); store.start(); store.setPlayhead(10);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.get(0)).toBeDefined(); expect(store.get(19)).toBeDefined();
    store.setPlayhead(4);
    for (let k = 0; k < 10; k++) await flush();
    expect(store.get(19)).toBeDefined(); expect(closed).not.toContain(19);
    expect(store.nearestDecoded(17)).toBe(19);
  });
});

describe("FrameStore: playhead-aware loading (entrance smoothness pass)", () => {
  // Fetches resolve only when the test releases them, so the scheduler's choices are observable.
  const controlled = (count: number, opts: Partial<ConstructorParameters<typeof FrameStore>[0]> = {}) => {
    const requested: number[] = []; const resolvers = new Map<number, () => void>(); let inflight = 0, peak = 0;
    const store = new FrameStore({
      count, order: Array.from({ length: count }, (_, i) => i),
      fetchBlob: (i) => { requested.push(i); inflight++; peak = Math.max(peak, inflight);
        return new Promise<Blob>((res) => resolvers.set(i, () => { inflight--; res(new Blob([String(i)])); })); },
      decode: async (b) => ({ width: 10, height: 10, i: Number(await b.text()) }),
      ahead: 4, behind: 1, concurrency: 2, ...opts,
    });
    const release = async (i: number) => { resolvers.get(i)?.(); resolvers.delete(i); for (let k = 0; k < 5; k++) await flush(); };
    return { store, requested, release, peak: () => peak };
  };

  it("the frame the viewer scrolled to outranks everything still queued", async () => {
    const { store, requested, release } = controlled(40, { keep: [0, 39] });
    store.setPlayhead(0); store.start();
    expect(requested).toEqual([0, 1]);                  // current, then the next one ahead
    store.setPlayhead(25);                              // a fast scroll lands far ahead before those arrive
    await release(0);
    expect(requested[2]).toBe(25);                      // the next free slot goes to where the viewer is
    await release(1);
    expect(requested[3]).toBe(26);                      // then the next one ahead of them
  });

  it("biases toward the direction of travel and never requests a frame twice", async () => {
    const { store, requested, release } = controlled(30);
    store.setPlayhead(10); store.start();
    for (let k = 0; k < 30; k++) await release(requested[k]);
    expect(new Set(requested).size).toBe(requested.length);
    expect(requested.slice(0, 4)).toEqual([10, 11, 12, 13]);   // current, then ahead before any frame behind
    store.setPlayhead(20); for (let k = 0; k < 5; k++) await flush();
    expect(store.get(24)).toBeDefined(); expect(store.get(19)).toBeDefined();   // 4 ahead, 1 behind
    expect(store.get(18)).toBeUndefined(); expect(store.get(25)).toBeUndefined();
    store.setPlayhead(15); for (let k = 0; k < 5; k++) await flush();          // reversing: "ahead" is now down
    expect(store.get(11)).toBeDefined(); expect(store.get(16)).toBeDefined(); expect(store.get(17)).toBeUndefined();
  });

  it("keeps fetch concurrency bounded", async () => {
    const { store, requested, release, peak } = controlled(20, { concurrency: 3 });
    store.start(); store.setPlayhead(5);
    for (let k = 0; k < 20; k++) await release(requested[k]);
    expect(peak()).toBeLessThanOrEqual(3); expect(requested.length).toBe(20);
  });

  it("does not retry a frame whose decode failed", async () => {
    const decode = vi.fn().mockRejectedValue(new Error("bad avif"));
    const { store } = mk(3, { decode });
    store.start(); store.setPlayhead(0);
    for (let k = 0; k < 10; k++) await flush();
    expect(decode).toHaveBeenCalledTimes(3);
  });
});

