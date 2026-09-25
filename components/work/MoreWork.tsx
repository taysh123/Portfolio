import { moreWork, projectOf } from "@/data/work";
import { PipelineDiagram } from "./PipelineDiagram";
import { StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl } from "@/data/projects";

/** Spec §5.2 More Work: two wide, unpinned rows in the site theme, each with its system's real shape. */
export function MoreWork() {
  return (
    <div className="more-work shell py-[clamp(5rem,10vh,8rem)]">
      <p className="label text-fg-subtle">More work</p>
      <div className="mt-8 grid gap-6">
        {moreWork.map((r) => {
          const p = projectOf(r.id); const ms = r.metricLabels.map((l) => p.metrics.find((m) => m.label === l)!);
          return (
            <article key={r.id} className="more-work__row raised grid gap-6 rounded-[24px] border border-line p-[clamp(1.5rem,3vw,2.5rem)] lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="label flex items-center gap-3 text-fg-subtle"><StatusChip status={p.status} /><span>{p.context}</span></p>
                <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold text-fg">{p.name}</h3>
                <p className="mt-2 max-w-[62ch] text-fg-muted">{p.summary}</p>
                <dl className="mt-5 flex gap-8">{ms.map((m) => <div key={m.label} className="flex flex-col-reverse"><dt className="label text-fg-subtle">{m.label}</dt><dd className="text-2xl font-semibold text-fg">{m.value}</dd></div>)}</dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" data-case-study={p.id} className="case-study-trigger inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-fg hover:border-line-strong">Case study</button>
                  {publicRepoUrl(p) ? <ButtonLink href={publicRepoUrl(p)!} variant="ghost" external>Source</ButtonLink> : <PrivateRepoLabel className="h-11 px-3" />}
                </div>
              </div>
              <PipelineDiagram uid={r.id} kind={r.diagram.kind} nodes={r.diagram.nodes} label={`${p.name}: ${r.diagram.nodes.join(r.diagram.kind === "duplex" ? " ⇄ " : " → ")}`} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
