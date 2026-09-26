import Image from "next/image";

import { flagships, projectOf } from "@/data/work";

/** Spec §5.2 world 02: the real dashboard on a large monitor; alert rows slide in from the real live-alerts capture.
 *  Every image and alt comes from data (flagships[].worldAssets + projects media), so replacing the screenshots
 *  is a data-only change — no edit here (decision 6). */
export function AegisWorld() {
  const a = flagships.find((f) => f.id === "aegis")!.worldAssets!, p = projectOf("aegis");
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-aegis">
      <p className="world-aegis__badge label"><span aria-hidden="true" className="world-aegis__dot" /> Streaming — local demo</p>
      <div className="world-aegis__monitor">
        <Image src={a.monitor} alt={alt(a.monitor)} width={3840} height={2160} sizes="(min-width:1024px) 55vw, 100vw" />
        <span className="world-aegis__scan" aria-hidden="true" />
      </div>
      {a.rows && <div className="world-aegis__rows" aria-hidden="true">
        {a.rows.centres.map((y, i) => (
          <div key={y} className="world-aegis__row"
            style={{ ["--i" as string]: i, ["--y" as string]: y, ["--crop-x" as string]: a.rows!.left, ["--crop-h" as string]: a.rows!.height, ["--img-hw" as string]: a.rows!.aspect }}>
            <Image src={a.rows!.src} alt="" width={3840} height={2160} sizes="(min-width:1024px) 95vw, 170vw" />
          </div>
        ))}
      </div>}
    </div>
  );
}
