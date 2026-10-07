import { ScrollScene } from "@/components/scenes/ScrollScene";
import { StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl } from "@/data/projects";
import { flagships, projectOf, type Flagship } from "@/data/work";
import "./chapter.css";

/**
 * One flagship chapter (spec §5.2, M2). Every chapter shares one structure — a header (chapter number, title,
 * kicker), the world, and a body (story, what I built, metrics, actions) — laid out by its `layout` and `side`.
 *
 * DOM order is head → world → body, so on a phone the story reads NUMBER → TITLE → VISUAL → COPY → METRICS →
 * ACTION; on wide screens a grid puts head and body in one column and the world in the other. The copy is never
 * transformed — it is legible the whole time the scene is visible; only the world responds to the scene vars.
 */
export function FlagshipScene({ f, world }: { f: Flagship; world: React.ReactNode }) {
  const p = projectOf(f.id);
  const metrics = f.metricLabels.map((l) => p.metrics.find((m) => m.label === l)!);
  const total = String(flagships.length).padStart(2, "0");
  const index = flagships.findIndex((x) => x.id === f.id);
  return (
    <ScrollScene id={`work-${p.id}`} labelledBy={`work-${p.id}-title`} className={`flagship flagship--${p.id}`}>
      <div className="shell chapter" data-layout={f.layout} data-side={f.side}>
        <header className="chapter__head">
          <div className="chapter__marker">
            {/* The chapter number is the section's editorial anchor; the ticks place it in the run of four. */}
            <p className="chapter__num" data-chapter-num aria-label={`Project ${Number(f.number)} of ${flagships.length}`}>
              <span aria-hidden="true">{f.number}</span>
            </p>
            <div className="chapter__of" aria-hidden="true">
              <span className="label">/ {total}</span>
              <span className="chapter__ticks">{flagships.map((x, i) => <i key={x.id} data-on={i === index ? "" : undefined} />)}</span>
            </div>
            <StatusChip status={p.status} className="chapter__status" />
          </div>
          <h3 id={`work-${p.id}-title`} className="chapter__title">{p.name}</h3>
          <p className="chapter__kicker">{f.kicker}</p>
        </header>

        <div className="chapter__world flagship__world" data-world={p.id}>
          <span aria-hidden="true" className="chapter__ghost">{f.number}</span>
          {world}
        </div>

        <div className="chapter__body">
          <p className="chapter__story">{f.story[0]} {f.story[1]}</p>
          {f.statusNote && <p className="label chapter__note">{f.statusNote}</p>}
          <p className="chapter__built" data-built>
            <span className="label chapter__built-label">Built solo</span>
            <span className="chapter__built-text">{f.built}</span>
          </p>
          <dl className="chapter__metrics" data-metrics>
            {metrics.map((m) => (
              <div key={m.label} className="chapter__metric">
                <dt className="chapter__metric-label">{m.label}</dt>
                <dd className="chapter__metric-value" data-metric-value>{m.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="chapter__stack" aria-label={`${p.name} stack`}>
            {p.stack.slice(0, 4).map((s) => <li key={s.label} className="label">{s.label}</li>)}
          </ul>
          {/* Store listings live in the world, under the product they ship (PokerWorld). */}
          <div className="chapter__actions">
            <button type="button" data-case-study={p.id} className="case-study-trigger inline-flex h-11 items-center rounded-full bg-accent-solid px-5 text-sm font-medium text-white hover:bg-accent-solid-hover">Case study</button>
            {p.liveUrl && <ButtonLink href={p.liveUrl} variant="secondary" external>{p.liveLabel ?? "Live"}</ButtonLink>}
            {publicRepoUrl(p)
              ? <ButtonLink href={publicRepoUrl(p)!} variant="ghost" external>Source</ButtonLink>
              : <PrivateRepoLabel className="h-11 px-3" />}
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}
