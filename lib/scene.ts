import { segment, easeOut, easeInOut, linear } from "@/lib/timeline";

/** Spec §5: scenes pin only at ≥ 1024 × 600 with motion allowed. */
export const PIN_MIN = { w: 1024, h: 600 } as const;
export const pinEligible = (vw: number, vh: number, reduced: boolean) => !reduced && vw >= PIN_MIN.w && vh >= PIN_MIN.h;

export type ScenePhases = { assemble: number; hold: number; recede: number };
/** A flagship scene over its 200svh container (spec §5.2): the world assembles, holds, then recedes. */
export const scenePhases = (p: number): ScenePhases => ({
  assemble: segment(p, 0, 0.3, easeOut), hold: segment(p, 0.3, 0.7, linear), recede: segment(p, 0.7, 1, easeInOut),
});

/** Think/Build/Ship (spec §5.5): the hairline travels 10–90%; each third lights the next word. */
export function pillarState(p: number): { lit: 0 | 1 | 2; line: number } {
  const line = segment(p, 0.1, 0.9, linear);
  return { lit: (line < 1 / 3 ? 0 : line < 2 / 3 ? 1 : 2) as 0 | 1 | 2, line };
}
