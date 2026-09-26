export type Point = { x: number; y: number };
/** TL, TR, BR, BL. */
export type Quad = [Point, Point, Point, Point];

export type ManifestFrame = { file: string; p: number; quad: Quad | null };
export type FrameSet = {
  width: number;               // master width
  height: number;
  tiers: number[];             // encoded widths available, ascending (AVIF)
  webp?: number[];             // tiers that also ship WebP frames (phone portrait)
  frames: ManifestFrame[];     // sorted by p; quads in 0..1 image space
  poster: string;              // base name; .avif and .jpg exist
  still: string;
  pushEndIndex: number;        // index of K2 / P2 in frames
  /** Scrub video for phones (scripts/encode-video.mjs): `samples` frames uniform in p over [p0, p1]. */
  video?: VideoMeta;
};
export type VideoMeta = { width: number; height: number; samples: number; fps: number; p0: number; p1: number; keyint: number };
/** `sources` (sha256 by repo path) and `verifyCounts` record what the VERIFY/WRITE screens drew (spec §4.6 provenance). */
export type Manifest = { version: 1; snapshot: string; sources?: Record<string, string>; verifyCounts?: Record<string, number>;
  landscape: FrameSet; portrait: FrameSet };
