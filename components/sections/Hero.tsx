import { siteMeta, socials } from "@/data/socials";
import { heroIndex, passingTests } from "@/data/proof";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDownIcon } from "@/components/ui/icons";
import "./hero.css";

// Height-aware as well as width-aware: on a landscape phone (844×390) the width alone would overflow the screen.
const lineStyle = { fontSize: "clamp(2.25rem, min(7.2vw, 10.5svh), 6.75rem)", lineHeight: 0.98 } as const;

/** The site's first content: the page opens directly on it. A server component with no scroll logic.
 *  Who (the name and role), what (the headline and lead), proof (the test count) and where to go next (the
 *  CTAs and the index of the four flagships, each a link to its scene). */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero relative flex min-h-[100svh] flex-col justify-center overflow-clip px-[clamp(20px,4vw,40px)] pt-[var(--nav-h)] pb-6">
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
          <p data-hero-lead className="max-w-[62ch] text-fg-muted" style={{ fontSize: "clamp(1.0625rem, 1.5vw, 1.3125rem)" }}>{siteMeta.heroLead}</p>
        </div>
        <div className="mt-10 [@media(max-height:500px)]:mt-4">
          <div data-hero-ctas className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#work" size="lg">Explore my work <ArrowDownIcon size={16} /></ButtonLink>
            <ButtonLink href={socials.github.url} variant="secondary" size="lg" external>GitHub ↗</ButtonLink>
          </div>
        </div>
        {/* The flagships as quiet product navigation: a name and its verified state, each linking to its scene. */}
        <nav aria-label="Flagship projects" data-hero-index className="hero-index mt-12 [@media(max-height:500px)]:mt-5">
          <ul className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
            {heroIndex.map((x) => (
              <li key={x.id}>
                <a href={x.href} className="hero-index__link group flex min-h-11 flex-col justify-center border-t border-line py-2.5 md:py-3">
                  <span className="text-[15px] font-medium text-fg">{x.name}</span>
                  <span className="mt-0.5 text-[13px] text-fg-subtle transition-colors duration-150 group-hover:text-fg-muted">{x.state}</span>
                </a>
              </li>
            ))}
          </ul>
          <p data-hero-proof className="mt-4 text-[13px] text-fg-subtle">
            <span className="font-medium text-fg-muted">{passingTests.value}</span> passing tests across {passingTests.projectsWord} projects
          </p>
        </nav>
        {/* The hero's one atmospheric element (spec §5.1): the dark horizon arc, static. Anchored to the content's
            foot, so its rim always sits at least --arc-gap below the last control at every size; it rhymes with
            Contact's. Clipped by the section; behind nothing interactive. */}
        <div aria-hidden="true" data-hero-arc className="hero-horizon" />
      </div>
    </section>
  );
}
