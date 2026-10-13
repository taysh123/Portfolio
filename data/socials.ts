export const socials = {
  email: "tayshofer05@gmail.com",
  github: {
    handle: "taysh123",
    url: "https://github.com/taysh123",
  },
  linkedin: {
    label: "Tay Shofer",
    url: "https://www.linkedin.com/in/tay-shofer-1b2b54287",
  },
} as const;

/** The résumé, served as the exact file supplied (public/resume/). A public download carries the phone number and
 *  email inside the PDF. */
export const resume = {
  href: "/resume/Tay-Shofer-Software-Engineer-Resume.pdf",
  label: "Download résumé (PDF)",
  fileName: "Tay-Shofer-Software-Engineer-Resume.pdf",
} as const;

export const siteMeta = {
  name: "Tay Shofer",
  /*
    "Software Engineer" (the 2026-10-12 brief): broad and product-minded rather than one specialty. It replaces
    the earlier "Software Developer". The B.Sc. is carried separately rather than folded into the title: it
    belongs in the proof strip, beside numbers a reader can check, and a title should be one thing.
  */
  role: "Software Engineer",
  /** The hero's headline (M10 headline study: docs/m10/headline-study.md). The social card repeats it. */
  headline: "I build software end to end.",
  /** The hero's one-sentence lead: the range, in the four kinds of product the plates below it show. */
  heroLead: "Mobile apps, security systems, developer tools, and games—from interface to infrastructure.",
  /** The meta description and social-card line (≤ 160 characters). */
  tagline:
    "Software engineer building products across interfaces, systems and interactive experiences—each one designed, built and tested end to end.",
  domain: "tayshofer.dev",
  url: "https://tayshofer.dev",
  locale: "en_US",
  location: "Israel",
  timezone: "Israel time (IST/IDT)",
} as const;

export const availability = {
  open: true,
  label: "Available for software engineering roles",
  detail:
    "I'm looking for a software engineering opportunity that fits my skills—on-site, hybrid, or remote.",
} as const;
