import Image from "next/image";
import { flagships, projectOf } from "@/data/work";

/** World 02 — the system. The real pipeline (projects.ts: ingestion → normalisation → detection → threat scoring
 *  → alerting over RabbitMQ, then SignalR to the dashboard) runs as a rail above the real dashboard capture;
 *  three real alert rows surface inside the monitor. Every image and alt comes from data (decision 6). */
export function AegisWorld() {
  const f = flagships.find((x) => x.id === "aegis")!, a = f.worldAssets!, p = projectOf("aegis");
  const [ing, norm, det, score, alerting, dash, bus, live] = f.notes;
  const stages = [ing, norm, det, score, alerting];
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-aegis">
      <div className="world-aegis__top">
        <p className="world-aegis__badge label"><span aria-hidden="true" className="world-aegis__dot" /> Streaming — local demo</p>
      </div>
      {/* The event path as a status rail: five stages on the message bus, then the live hop to the dashboard. */}
      <div className="aegis-rail" role="img" aria-label={`Event pipeline: ${stages.join(", ")} over ${bus}, then ${live} to the ${dash.toLowerCase()}`}>
        <ol className="aegis-rail__stages" aria-hidden="true">
          {stages.map((s, i) => <li key={s} style={{ ["--i" as string]: i }}><i />{s}</li>)}
          <li className="aegis-rail__end" style={{ ["--i" as string]: 5 }}><i />{dash}</li>
        </ol>
        <div className="aegis-rail__wires" aria-hidden="true">
          <span className="aegis-rail__bus">{bus}</span>
          <span className="aegis-rail__live">{live}</span>
        </div>
      </div>
      <div className="world-aegis__monitor">
        <Image src={a.monitor} alt={alt(a.monitor)} width={3840} height={2160} sizes="(min-width:1024px) 55vw, 100vw" />
        <span className="world-aegis__scan" aria-hidden="true" />
        {a.rows && <div className="world-aegis__rows" aria-hidden="true">
          {a.rows.centres.map((y, i) => (
            <div key={y} className="world-aegis__row"
              style={{ ["--i" as string]: i, ["--y" as string]: y, ["--crop-x" as string]: a.rows!.left, ["--crop-h" as string]: a.rows!.height, ["--img-hw" as string]: a.rows!.aspect }}>
              <Image src={a.rows!.src} alt="" width={3840} height={2160} sizes="(min-width:1024px) 95vw, 170vw" />
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
