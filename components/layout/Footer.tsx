import { socials, siteMeta } from "@/data/socials";

/** The footer: identity, the channels, a way back up, and the copyright. (Review-only snapshot: no résumé link.) */
const LINKS = [
  { href: `mailto:${socials.email}`, label: "Email" },
  { href: socials.github.url, label: "GitHub", ext: true },
  { href: socials.linkedin.url, label: "LinkedIn", ext: true },
  { href: "#hero", label: "Back to top" },
];
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer border-t border-line bg-raised">
      <div className="shell flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <p className="text-[0.9375rem] text-fg"><span className="font-semibold">{siteMeta.name}</span><span className="text-fg-subtle"> · {siteMeta.role}</span></p>
        <nav aria-label="Footer"><ul className="-mx-3 flex flex-wrap gap-x-1">{LINKS.map((l) => (
          <li key={l.label}><a href={l.href} className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
            {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {l.label}{l.ext && <span className="sr-only"> (opens in a new tab)</span>}</a></li>))}</ul></nav>
        <p className="text-sm text-fg-subtle">© {year} {siteMeta.name}</p>
      </div>
    </footer>
  );
}
