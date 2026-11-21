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

const HEADLINE = ["Building software.", "Turning ideas into products."] as const;

export const siteMeta = {
  name: "Tay Shofer",
  /*
    "Software Engineer" (the 2026-10-12 brief): broad and product-minded rather than one specialty. It replaces
    the earlier "Software Developer". The B.Sc. is carried separately rather than folded into the title: it
    belongs in the proof strip, beside numbers a reader can check, and a title should be one thing.
  */
  role: "Software Engineer",
  /** The hero's h1 (Concept A, R8), in its two lines: the second is drawn in the duotone. The page, the social card and
   *  the tests read it here. */
  headlineLines: HEADLINE,
  /** The same h1 as one line of text: the social card's alt, and what a reader hears. */
  headline: HEADLINE.join(" "),
  /** The hero's lede (Concept A, R8): the range, in the four kinds of product the Featured work below it names. Its
   *  dash is unspaced, like the rest of the site's (Tay's copy pass, 2026-11-21). */
  heroLead:
    "I build end to end—mobile apps, security systems, developer tools and games, from the interface down to the infrastructure.",
  /** The meta description and social-card line (≤ 160 characters). */
  tagline:
    "Software engineer building products across interfaces, systems and interactive experiences—each one designed, built and tested end to end.",
  domain: "tayshofer.dev",
  url: "https://tayshofer.dev",
  locale: "en_US",
  location: "Israel",
  timezone: "Israel time (IST/IDT)",
} as const;

/** The legal business name, in Hebrew (the owner's request, 2026-11-02). Shown once, beside the copyright line in the footer. */
export const legalName = "שופר טאי";

export const availability = {
  open: true,
  label: "Available for software engineering roles",
  /** Contact's lead (Tay's copy pass, 2026-11-21); the assistant's prompt says the same (app/api/chat/route.ts). */
  detail:
    "I'm looking for a software engineering role—backend, full-stack, AI or security. On-site or hybrid in central Israel, or remote.",
} as const;
