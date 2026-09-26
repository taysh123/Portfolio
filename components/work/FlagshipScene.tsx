import { ScrollScene } from "@/components/scenes/ScrollScene";
import { StatusChip } from "@/components/ui/Tag";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { ButtonLink } from "@/components/ui/Button";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl } from "@/data/projects";
import { projectOf, type Flagship } from "@/data/work";

/** One flagship world (spec §5.2). The copy column is never transformed — it is legible the whole
 *  time the scene is visible; only the world responds to --assemble / --hold / --recede. */
export function FlagshipScene({ f, world }: { f: Flagship; world: React.ReactNode }) {
  const p = projectOf(f.id);
  const metrics = f.metricLabels.map((l) => p.metrics.find((m) => m.label === l)!);
  const stores = p.stores?.filter((s) => s.status === "live" && s.url) ?? [];
  return (
    <ScrollScene id={`work-${p.id}`} labelledBy={`work-${p.id}-title`} className={`flagship flagship--${p.id}`}>
      <div className="shell flagship__grid">
        <div className="flagship__copy">
          <p className="label flex items-center gap-3 text-fg-subtle"><span aria-hidden="true" className="flagship__num">{f.number}</span><StatusChip status={p.status} /></p>
          <h3 id={`work-${p.id}-title`} className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-fg">{p.name}</h3>
          <p className="mt-3 text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>{f.kicker}</p>
          <p className="mt-5 max-w-[62ch] text-fg-muted">{f.story[0]} {f.story[1]}</p>
          {f.statusNote && <p className="label mt-4 text-fg-subtle">{f.statusNote}</p>}
          <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-5">
            {metrics.map((m) => (<div key={m.label}><dt className="label mt-1 text-fg-subtle">{m.label}</dt><dd className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold text-fg">{m.value}</dd></div>))}
          </dl>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${p.name} stack`}>
            {p.stack.slice(0, 5).map((s) => <li key={s.label} className="label rounded-full border border-line px-2.5 py-1 text-fg-muted">{s.label}</li>)}
          </ul>
          {/* Two rows with one job each: the actions, then the published store listings together. */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" data-case-study={p.id} className="case-study-trigger inline-flex h-11 items-center rounded-full bg-accent-solid px-5 text-sm font-medium text-white hover:bg-accent-solid-hover">Case study</button>
            {p.liveUrl && <ButtonLink href={p.liveUrl} variant="secondary" external>{p.liveLabel ?? "Live"}</ButtonLink>}
            {publicRepoUrl(p)
              ? <ButtonLink href={publicRepoUrl(p)!} variant="ghost" external>Source</ButtonLink>
              : <PrivateRepoLabel className="h-11 px-3" />}
          </div>
          {stores.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3" aria-label={`Get ${p.name}`}>
              {stores.map((s) => <li key={s.platform}><StoreBadge listing={s} app={p.name} /></li>)}
            </ul>
          )}
        </div>
        <div className="flagship__world" data-world={p.id}>
          {/* "…it recedes while the next number arrives" (spec §5.2): each scene's ghost number assembles
              with its world, so the next number rises as the previous world recedes. */}
          <span aria-hidden="true" className="flagship__ghost">{f.number}</span>
          {world}
        </div>
      </div>
    </ScrollScene>
  );
}
