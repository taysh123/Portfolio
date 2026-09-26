/**
 * Opt-in entrance profiling (scripts/profile-entrance.mjs). Off unless a page sets `window.__ENTRANCE_PROF__`
 * before the stage boots — the hooks are then plain function calls; with it absent every call site is a
 * single optional-chaining no-op. Nothing here changes behaviour.
 */
export type EntranceProfiler = {
  fetchStart?(i: number, t: number): void;
  fetchEnd?(i: number, t: number, bytes: number): void;
  decode?(i: number, ms: number, w: number, h: number): void;
  evict?(i: number): void;
  playhead?(i: number, decoded: number, windowDecoded: number, bytes: number, detail?: { decoded: number[]; decoding: number[]; stride: number }): void;
  render?(r: { p: number; queuedAt: number; start: number; ms: number; drawMs: number; path: string; want: number; drawn: number | null }): void;
};

export const profiler = (): EntranceProfiler | undefined =>
  typeof window === "undefined" ? undefined : (window as unknown as { __ENTRANCE_PROF__?: EntranceProfiler }).__ENTRANCE_PROF__;

/** Profiling experiments only (scripts/profile-entrance.mjs --variant): forced tier, canvas backing, blending. */
export type EntranceExperiment = { tier?: number; backing?: number };
export const experiment = (): EntranceExperiment =>
  (typeof window === "undefined" ? undefined : (window as unknown as { __ENTRANCE_EXP__?: EntranceExperiment }).__ENTRANCE_EXP__) ?? {};
