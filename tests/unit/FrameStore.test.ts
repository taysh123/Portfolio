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
});
