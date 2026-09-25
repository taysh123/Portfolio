import Image from "next/image";
import { projectOf } from "@/data/work";

const SHOTS = ["/projects/poker/tournament-live.webp", "/projects/poker/home.webp", "/projects/poker/final-count.webp"];

/** Spec §5.2 world 01: generic phones (no device branding) in depth over a dark reflective floor. */
export function PokerWorld() {
  const p = projectOf("poker");
  const alt = (src: string) => [p.media?.image === src ? p.media?.alt : undefined, ...(p.media?.gallery ?? []).filter((g) => g.src === src).map((g) => g.alt)].find(Boolean) ?? "";
  return (
    <div className="world-poker">
      <div className="world-poker__floor" aria-hidden="true" />
      {SHOTS.map((src, i) => (
        <figure key={src} className={`world-poker__phone world-poker__phone--${["left", "front", "right"][i]}`}>
          <Image src={src} alt={alt(src)} width={1290} height={2796} sizes="(min-width:1024px) 16vw, 40vw" />
        </figure>
      ))}
    </div>
  );
}
