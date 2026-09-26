/**
 * Opt-in entrance profiling (scripts/profile-entrance.mjs, and the `?entrancePerf=1` panel in perfPanel.ts).
 * Off unless a page sets `window.__ENTRANCE_PROF__` before the stage boots — the hooks are then plain function
 * calls; with it absent every call site is a single optional-chaining no-op. Nothing here changes behaviour.
 */
export type EntranceConfig = { framing: "landscape" | "portrait"; tier: number; format: "avif" | "webp"; count: number;
  vw: number; vh: number; dpr: number; canvasW: number; canvasH: number; mode: string; cadence: string; fetchConcurrency: number };
export type EntranceProfiler = {
  config?(c: EntranceConfig): void;
  /** The adaptive renderer changed what it draws while moving (see EntranceStage `adapt`). */
  adapt?(a: { mode: string; cadence: string; reason: string; dropRate: number; baseMs: number }): void;
  fetchStart?(i: number, t: number): void;
  fetchEnd?(i: number, t: number, bytes: number): void;
  decode?(i: number, ms: number, w: number, h: number): void;
  evict?(i: number): void;
  playhead?(i: number, decoded: number, windowDecoded: number, bytes: number, detail?: { decoded: number[]; decoding: number[]; stride: number }): void;
  render?(r: { p: number; queuedAt: number; start: number; ms: number; drawMs: number; path: string; want: number; drawn: number | null;
    /** rAF timestamp (absent for a synchronous render on resize); `skipped`: a cadence tick that drew nothing. */
    ts?: number; painted?: boolean; skipped?: boolean; moving?: boolean }): void;
};

export const profiler = (): EntranceProfiler | undefined =>
  typeof window === "undefined" ? undefined : (window as unknown as { __ENTRANCE_PROF__?: EntranceProfiler }).__ENTRANCE_PROF__;

/** Profiling experiments only (scripts/profile-entrance.mjs --variant, or the `?entrancePerf=1` panel's
 *  `entranceFormat` / `entranceMode` / `entranceCadence` parameters): forced tier, format, canvas backing,
 *  runway, fetch concurrency and the adaptive renderer's modes. Normal visitors never set any of these. */
export type EntranceExperiment = { tier?: number; backing?: number; runway?: { portrait?: number; short?: number };
  format?: "avif" | "webp"; fetchConcurrency?: number; window?: { ahead: number; behind: number };
  mode?: "auto" | "blend" | "single"; cadence?: "auto" | "full" | "30" };
export const experiment = (): EntranceExperiment =>
  (typeof window === "undefined" ? undefined : (window as unknown as { __ENTRANCE_EXP__?: EntranceExperiment }).__ENTRANCE_EXP__) ?? {};
