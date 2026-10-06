import { socials, siteMeta } from "@/data/socials";
/** The footer (spec §5.6): theme-following, one line of identity, the channels and a way back up. */
const LINKS = [{ href: `mailto:${socials.email}`, label: "Email" }, { href: socials.github.url, label: "GitHub", ext: true }, { href: socials.linkedin.url, label: "LinkedIn", ext: true }, { href: "#hero", label: "Back to top" }];
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      {/* One row only from lg: at md the three groups wrapped mid-phrase (final polish pass); stacked below that. */}
      <div className="shell flex flex-col gap-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <p className="label text-fg-subtle">TAY SHOFER — PORTFOLIO · BUILT TO SHIP.</p>
        <nav aria-label="Footer"><ul className="-mx-3 flex flex-wrap gap-x-1">{LINKS.map((l) => (
          <li key={l.label}><a href={l.href} className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted hover:text-fg" {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}{l.ext && <span className="sr-only"> (opens in a new tab)</span>}</a></li>))}</ul></nav>
        <p className="label text-fg-subtle">© {year} {siteMeta.domain}</p>
      </div>
    </footer>
  );
}
