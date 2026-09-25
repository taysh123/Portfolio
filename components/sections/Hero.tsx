import { siteMeta, socials } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDownIcon } from "@/components/ui/icons";

const lineStyle = { fontSize: "clamp(3rem, 7.2vw, 6.75rem)", lineHeight: 0.98 } as const;

/**
 * The site's first real content — and, while the entrance runs, the laptop's screen.
 *
 * A server component with no scroll logic of its own. While the entrance is
 * pinned, `EntranceStage` drives the `data-hero-*` hooks with transform and
 * opacity only; in static mode (reduced motion or no JavaScript) nothing is
 * applied and the hero shows at rest.
 */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero-surface-content relative flex min-h-[100svh] flex-col justify-center px-[clamp(20px,4vw,40px)]">
      {/* The screen's boot log and identity card. Decorative: the same words
          are in the h1 and the name line below. */}
      <div data-hero-boot aria-hidden="true" className="hero-boot pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[clamp(0.875rem,1.6vw,1.25rem)] leading-[1.9] text-fg-muted">
          <p data-boot-line="0">&gt; initializing portfolio…</p>
          <p data-boot-line="1">&gt; loading projects…</p>
          <p data-boot-line="2">&gt; ready.</p>
        </div>
      </div>
      <p data-hero-tagline aria-hidden="true" className="hero-tagline pointer-events-none absolute inset-x-0 top-[56%] text-center text-[clamp(1rem,1.8vw,1.375rem)] text-fg-muted">
        Building products that ship.
      </p>

      <div className="mx-auto w-full max-w-[1240px]">
        <h1 id="hero-title" tabIndex={-1} className="outline-none">
          {/* Not masked: this line travels (the screen's identity card lands here). */}
          <span className="mb-8 block">
            <span data-hero-name className="label inline-block text-fg-muted">{siteMeta.name} · {siteMeta.role}</span>
          </span>
          <span className="hero-mask block">
            <span data-hero-line="1" className="block font-semibold tracking-[-0.045em] text-fg" style={lineStyle}>I build software</span>
          </span>
          <span className="hero-mask block">
            <span data-hero-line="2" className="block font-semibold tracking-[-0.045em] text-fg-muted" style={lineStyle}>people can actually use.</span>
          </span>
        </h1>
        <div className="hero-mask mt-8">
          <p data-hero-lead className="max-w-[62ch] text-fg-muted" style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.3125rem)" }}>{siteMeta.heroLead}</p>
        </div>
        <div className="hero-mask mt-10">
          <div data-hero-ctas className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#work" size="lg">Explore my work <ArrowDownIcon size={16} /></ButtonLink>
            <ButtonLink href={socials.github.url} variant="secondary" size="lg" external>GitHub ↗</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
