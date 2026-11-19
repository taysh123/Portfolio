import { about } from "@/data/about";
import { availability, resume, socials } from "@/data/socials";
import { dict } from "@/lib/dict";

/**
 * The About block under the four panels (PROTOTYPE, P3.3; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no
 * WebGL). Nothing is typed fresh. Every word comes from the live About section (data/about.ts), the availability
 * (data/socials.ts) or the interface strings (lib/dict.ts), and tests/unit/lab-work.test.ts holds each one to its source.
 * Tay approved the copy (session 12). No photo and no institution: the live facts name the degree alone.
 */

/** A paragraph's sentences, split after each full stop that ends one ("C#/.NET," and "B.Sc." stay whole). */
const sentences = (p: string) => p.split(/(?<=\.)\s+/);

export const aboutBlock = {
  eyebrow: dict.nav.about,
  /** Both halves of the live title, each on its own line. */
  title: about.title,
  /** Two sentences of the live copy, word for word: who, then what with. The rest of it stays on the live page. */
  lede: `${sentences(about.paragraphs[0])[0]} ${sentences(about.paragraphs[1])[1]}`,
  facts: about.facts,
  /** The one line joined from two pieces (Tay's choice): the availability label, then the end of its detail. */
  availability: availability.open ? `${availability.label}: ${availability.detail.split("—").pop()}` : null,
  /** The live site's own targets. The résumé is the same file and control as the locked hero's (app/lab/hero-a). */
  resume: { href: resume.href, fileName: resume.fileName, label: "Download résumé", note: ` (PDF${dict.contact.resumeNote})` },
  profiles: [
    { href: socials.github.url, label: dict.contact.github },
    { href: socials.linkedin.url, label: dict.contact.linkedin },
  ],
} as const;
