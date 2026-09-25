export type Point = { x: number; y: number };
/** TL, TR, BR, BL. */
export type Quad = [Point, Point, Point, Point];

export type ManifestFrame = { file: string; p: number; quad: Quad | null };
export type FrameSet = {
  width: number;               // master width
  height: number;
  tiers: number[];             // encoded widths available, ascending
  frames: ManifestFrame[];     // sorted by p; quads in 0..1 image space
  poster: string;              // base name; .avif and .jpg exist
  still: string;
  pushEndIndex: number;        // index of K2 / P2 in frames
};
export type Manifest = { version: 1; snapshot: string; landscape: FrameSet; portrait: FrameSet };
