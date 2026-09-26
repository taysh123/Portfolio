import Image from "next/image";
import { projectOf } from "@/data/work";

const SHOTS = ["/projects/poker/tournament-live.webp", "/projects/poker/home.webp", "/projects/poker/final-count.webp"];
/** The phones never draw wider than ~310 CSS px (16vw at 1920; 40vw on a phone), so a 640-px WebP covers 2x and
 *  3x screens. Served as is: through the image optimiser these failed to load on the Vercel Preview. */
const shot640 = (src: string) => src.replace(/\.webp$/, "-640.webp");

/** Spec §5.2 world 01: generic phones (no device branding) in depth over a dark reflective floor. */
export function PokerWorld() {
  const p = projectOf("poker");
  const alt = (src: string) => [p.media?.image === src ? p.media?.alt : undefined, ...(p.media?.gallery ?? []).filter((g) => g.src === src).map((g) => g.alt)].find(Boolean) ?? "";
  return (
    <div className="world-poker">
      <div className="world-poker__floor" aria-hidden="true" />
      {SHOTS.map((src, i) => (
        <figure key={src} className={`world-poker__phone world-poker__phone--${["left", "front", "right"][i]}`}>
          <Image src={shot640(src)} alt={alt(src)} width={640} height={1387} unoptimized />
        </figure>
      ))}
    </div>
  );
}
