import { socials, siteMeta } from "@/data/socials";
/** The footer (spec §5.6): theme-following, one line of identity, the channels and a way back up. */
const LINKS = [{ href: `mailto:${socials.email}`, label: "Email" }, { href: socials.github.url, label: "GitHub", ext: true }, { href: socials.linkedin.url, label: "LinkedIn", ext: true }, { href: "#hero", label: "Back to top" }];
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="label text-fg-subtle">TAY SHOFER — PORTFOLIO · BUILT TO SHIP.</p>
        <nav aria-label="Footer"><ul className="flex flex-wrap gap-2">{LINKS.map((l) => (
          <li key={l.label}><a href={l.href} className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted hover:text-fg" {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}</a></li>))}</ul></nav>
        <p className="label text-fg-subtle">© {year} {siteMeta.domain}</p>
      </div>
    </footer>
  );
}
