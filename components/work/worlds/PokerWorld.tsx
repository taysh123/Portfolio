import Image from "next/image";
import { flagships, projectOf } from "@/data/work";
import { StoreBadge } from "@/components/ui/StoreBadge";

const SHOTS = ["/projects/poker/tournament-live.webp", "/projects/poker/home.webp", "/projects/poker/final-count.webp"];
/** The phones never draw wider than ~310 CSS px (16vw at 1920; 40vw on a phone), so a 640-px WebP covers 2x and
 *  3x screens. Served as is: through the image optimiser these failed to load on the Vercel Preview. */
const shot640 = (src: string) => src.replace(/\.webp$/, "-640.webp");

/** World 01 — the product hero. Three real screens (no device branding) layered in depth; two annotations name
 *  what the side screens are, in the project's own words; the store listings sit under the product. */
export function PokerWorld() {
  const p = projectOf("poker"), notes = flagships.find((f) => f.id === "poker")!.notes;
  const alt = (src: string) => [p.media?.image === src ? p.media?.alt : undefined, ...(p.media?.gallery ?? []).filter((g) => g.src === src).map((g) => g.alt)].find(Boolean) ?? "";
  const stores = (p.stores ?? []).filter((s) => s.status === "live" && s.url);
  const web = p.liveUrl ? new URL(p.liveUrl).host : undefined;
  return (
    <div className="world-poker">
      <div className="world-poker__floor" aria-hidden="true" />
      <div className="world-poker__stage">
        {SHOTS.map((src, i) => (
          <figure key={src} className={`world-poker__phone world-poker__phone--${["left", "front", "right"][i]}`}>
            <Image src={shot640(src)} alt={alt(src)} width={640} height={1387} unoptimized />
          </figure>
        ))}
        <p className="world-note world-poker__note--left" aria-hidden="true"><span>{notes[0]}</span></p>
        <p className="world-note world-poker__note--right" aria-hidden="true"><span>{notes[1]}</span><span className="world-note__sub">{notes[2]}</span></p>
      </div>
      {/* Shipped: the published listings sit under the product they ship — the chapter's strongest fact. */}
      <div className="world-poker__ship" data-shipped>
        <p className="label world-poker__ship-label"><span aria-hidden="true" className="world-poker__live" />Live{web && <> · {web}</>}</p>
        <ul aria-label={`Get ${p.name}`}>
          {stores.map((s) => <li key={s.platform}><StoreBadge listing={s} app={p.name} /></li>)}
        </ul>
      </div>
    </div>
  );
}
