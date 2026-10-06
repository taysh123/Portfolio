import Image from "next/image";
import { projectOf } from "@/data/work";

const WINS = [
  { src: "/projects/developeros/dashboard.webp", dx: -220, dy: -120, dz: -260, r: -6 },
  { src: "/projects/developeros/ai-features.webp", dx: 240, dy: -90, dz: -180, r: 5 },
  { src: "/projects/developeros/learning.webp", dx: -200, dy: 150, dz: -320, r: 4 },
  { src: "/projects/developeros/career.webp", dx: 230, dy: 170, dz: -220, r: -5 },
];

/** Spec §5.2 world 03: four real windows start scattered in depth and converge into one organised workspace. */
export function DeveloperOSWorld() {
  const p = projectOf("developeros");
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-dos">
      {WINS.map((w, i) => (
        <figure key={w.src} className="world-dos__win" style={{ ["--dx" as string]: `${w.dx}px`, ["--dy" as string]: `${w.dy}px`, ["--dz" as string]: `${w.dz}px`, ["--r" as string]: `${w.r}deg`, ["--i" as string]: i }}>
          <Image src={w.src} alt={alt(w.src)} width={2880} height={1620} sizes="(min-width:1024px) 28vw, 50vw" />
        </figure>
      ))}
      <p className="world-dos__card">Grounded answers · file:line citations</p>
    </div>
  );
}
