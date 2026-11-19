import { availability, resume, socials } from "@/data/socials";
import { dict } from "@/lib/dict";

/**
 * Contact under Think · Build · Ship (PROTOTYPE, P3.6; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL).
 * Nothing is retyped from the live section (components/sections/Contact.tsx): its title, lead, labels and links come
 * from lib/dict.ts and data/socials.ts, word for word and target for target. Tay approved the copy (session 15): the
 * live title, the live Contact's mailto with its subject, the nav's "Contact" as the eyebrow (as About and Stack take
 * theirs), and the lead shown only while the site says it is open. tests/unit/lab-work.test.ts holds every string to
 * its source. No form and no backend: four plain links.
 */
export const contactBlock = {
  /** The nav's label, as About's and Stack's eyebrows are. The live section has none. */
  eyebrow: dict.nav.contact,
  /** Both halves of the live title, each on its own line. */
  title: dict.contact.title,
  /** The live lead, only while the site says it is open (About's availability line follows the same switch). */
  lead: availability.open ? availability.detail : null,
  /** The live primary action: a plain mailto with the live subject, in the same tab. */
  email: { href: `mailto:${socials.email}?subject=${encodeURIComponent(dict.contact.subject)}`, label: dict.contact.email },
  /** The two profiles, in the live order (LinkedIn first), each in a new tab. */
  profiles: [
    { href: socials.linkedin.url, label: dict.contact.linkedin },
    { href: socials.github.url, label: dict.contact.github },
  ],
  /** The live résumé line: the same file and download, with the live note (a no-break space before "KB", as live). */
  resume: { href: resume.href, fileName: resume.fileName, label: dict.contact.resume, note: dict.contact.resumeNote.replace(" KB", " KB") },
} as const;
