/** The real shape of a system, drawn small (spec §5.2 More Work): a left-to-right pipeline, or a duplex link.
 *  Drawn twice — across for wide rows, down for phones (a 520-unit row scaled to a phone column would set its
 *  labels at ~7px). CSS displays exactly one, so assistive tech meets a single image. */
export function PipelineDiagram({ uid, kind, nodes, label }: { uid: string; kind: "pipeline" | "duplex"; nodes: string[]; label: string }) {
  // Marker ids are per drawing: the hidden one's markers must never be the ones the visible one resolves.
  const arrow = (id: string, v: string) => `url(#${id}-${uid}-${v})`;
  const markers = (v: string) => (
    <defs>
      <marker id={`arrow-${uid}-${v}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" /></marker>
      <marker id={`arrow-back-${uid}-${v}`} viewBox="0 0 8 8" refX="1" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M8 0 L0 4 L8 8 z" fill="var(--accent)" /></marker>
    </defs>
  );
  const link = (d: string, v: string) => (
    <path d={d} stroke="var(--accent)" strokeWidth={1.25} markerEnd={arrow("arrow", v)} markerStart={kind === "duplex" ? arrow("arrow-back", v) : undefined} />
  );
  const node = (x: number, y: number, w: number, n: string) => (
    <>
      <rect x={x} y={y} width={w} height={40} rx={10} fill="none" stroke="var(--line-strong)" />
      <text x={x + w / 2} y={y + 25} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fill="var(--fg-muted)">{n}</text>
    </>
  );

  const W = 520, H = 72, gap = W / nodes.length, bw = Math.min(118, gap - 22);
  const VW = 180, step = 68, VH = nodes.length * step - (step - 40) + 2;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pipeline pipeline--h h-auto w-full max-w-[520px]">
        {nodes.map((n, i) => {
          const x = i * gap + (gap - bw) / 2;
          return <g key={n}>{node(x, 16, bw, n)}{i < nodes.length - 1 && link(`M${x + bw + 4} 36 H${x + gap - 4}`, "h")}</g>;
        })}
        {markers("h")}
      </svg>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label} className="pipeline pipeline--v h-auto w-[180px]">
        {nodes.map((n, i) => {
          const y = 1 + i * step;
          return <g key={n}>{node(1, y, VW - 2, n)}{i < nodes.length - 1 && link(`M${VW / 2} ${y + 44} V${y + step - 4}`, "v")}</g>;
        })}
        {markers("v")}
      </svg>
    </>
  );
}
