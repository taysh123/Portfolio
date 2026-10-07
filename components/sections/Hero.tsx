import { siteMeta, socials } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDownIcon } from "@/components/ui/icons";

// Height-aware as well as width-aware: on a landscape phone (844×390) the width alone would overflow the screen.
const lineStyle = { fontSize: "clamp(2.25rem, min(7.2vw, 10.5svh), 6.75rem)", lineHeight: 0.98 } as const;

/** The site's first content: the page opens directly on it. A server component with no scroll logic. */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center px-[clamp(20px,4vw,40px)] pt-[var(--nav-h)] pb-6">
      {/* The hero's one atmospheric element (spec §5.1): the dark horizon arc, static, at 40% of Contact's recipe so
          the page's first and last frames rhyme. Clipped to the hero; behind the content. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="hero-horizon absolute inset-x-[-20%] bottom-[-70%] h-full rounded-[50%_50%_0_0/100%_100%_0_0] [background:radial-gradient(60%_40%_at_50%_0%,rgba(91,156,255,0.10),transparent_70%)] [box-shadow:0_-1px_0_rgba(155,190,255,0.18)]" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[1240px]">
        <h1 id="hero-title" tabIndex={-1} className="outline-none">
          <span className="mb-8 block [@media(max-height:500px)]:mb-3">
            <span className="label inline-block text-fg-muted">{siteMeta.name} · {siteMeta.role}</span>
          </span>
          <span className="block">
            <span className="block font-semibold tracking-[-0.045em] text-fg" style={lineStyle}>I build software</span>
          </span>
          <span className="block">
            <span className="block font-semibold tracking-[-0.045em] text-fg-muted" style={lineStyle}>people can actually use.</span>
          </span>
        </h1>
        <div className="mt-8 [@media(max-height:500px)]:mt-3">
          <p className="max-w-[62ch] text-fg-muted" style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.3125rem)" }}>{siteMeta.heroLead}</p>
        </div>
        <div className="mt-10 [@media(max-height:500px)]:mt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#work" size="lg">Explore my work <ArrowDownIcon size={16} /></ButtonLink>
            <ButtonLink href={socials.github.url} variant="secondary" size="lg" external>GitHub ↗</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
