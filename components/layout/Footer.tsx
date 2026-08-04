import { Logo } from "@/components/ui/Logo";
import { siteMeta, socials } from "@/data/socials";

const LINKS = [
  { href: `mailto:${socials.email}`, label: "Email", external: false },
  { href: socials.github.url, label: "GitHub", external: true },
  { href: socials.linkedin.url, label: "LinkedIn", external: true },
  { href: "#top", label: "Back to top", external: false },
];

/**
 * Server Component — nothing here needs the client. The previous version was
 * `"use client"` for a single hover underline on one line of text.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line-subtle px-[var(--gutter)] py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between 3xl:max-w-7xl">
        <div>
          <Logo label={`${siteMeta.name} — back to top`} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
            Designed and built from scratch — Next.js, Tailwind, and about two hundred
            lines of hand-written SVG.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm sm:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : null)}
                    className="inline-flex min-h-11 items-center text-fg-muted transition-colors hover:text-fg"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="label text-fg-subtle">
            © {year} — {siteMeta.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
