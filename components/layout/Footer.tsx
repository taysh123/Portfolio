import { socials, siteMeta } from "@/data/socials";
import type { Content } from "@/lib/content";

/** The footer: identity, the channels, a way back up, and the copyright. (Review-only snapshot: no résumé link.) */
export function Footer({ c }: { c: Content }) {
  const { t } = c;
  const year = new Date().getFullYear();
  const links = [
    { href: `mailto:${socials.email}`, label: t.footer.email },
    { href: socials.github.url, label: "GitHub", ext: true },
    { href: socials.linkedin.url, label: "LinkedIn", ext: true },
    { href: "#hero", label: t.footer.top },
  ];
  return (
    <footer className="site-footer border-t border-line bg-raised">
      <div className="shell flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <p className="text-[0.9375rem] text-fg"><span className="font-semibold">{siteMeta.name}</span><span className="text-fg-subtle"> · {c.siteMeta.role}</span></p>
        <nav aria-label={t.footer.label}><ul className="-mx-3 flex flex-wrap gap-x-1">{links.map((l) => (
          <li key={l.href}><a href={l.href} className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
            {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {l.label}{l.ext && <span className="sr-only">{t.common.newTab}</span>}</a></li>))}</ul></nav>
        <p className="text-sm text-fg-subtle">© {year} {siteMeta.name}</p>
      </div>
    </footer>
  );
}
