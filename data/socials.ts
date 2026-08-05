import { encodePhone } from "@/lib/obfuscate";

/** International format, used consistently wherever the number appears. */
const PHONE_PLAIN = "+972 52 818 3479";

export const socials = {
  email: "tayshofer05@gmail.com",
  phoneEncoded: encodePhone(PHONE_PLAIN),
  github: {
    handle: "taysh123",
    url: "https://github.com/taysh123",
  },
  linkedin: {
    label: "Tay Shofer",
    url: "https://www.linkedin.com/in/tay-shofer-1b2b54287",
  },
} as const;

export const siteMeta = {
  name: "Tay Shofer",
  /*
    "Software Developer" — your wording, and the right call.

    I had chosen "Full Stack Developer" from the earlier list; you have since
    named "Software Developer" twice, so that is what this is. The B.Sc. is
    carried separately rather than folded into the title: it belongs in the
    proof strip, where it sits beside numbers a reader can check, and a title
    should be one thing.
  */
  role: "Software Developer",
  /** Shown under the wordmark, where there is room for the fuller line. */
  roleDetail: "Software Developer & Computer Science Graduate",
  headline: "I build production software that solves real problems.",
  tagline:
    "Computer Science graduate building real-time platforms, developer tools, and cross-platform products — designed, tested, and shipped end to end.",
  domain: "tayshofer.dev",
  url: "https://tayshofer.dev",
  locale: "en_US",
  location: "Israel",
  timezone: "GMT+3",
} as const;

/**
 * Hero proof points. Every figure is verifiable from the repositories.
 *
 * The test count is the sum across the five self-directed projects:
 * T Poker 677 + 215, DeveloperOS 363, GRAVITY FLOW 220, Job Assistant 162,
 * SentinelAI 103 + 2.
 */
export const heroStats = [
  /*
    Deliberately NOT a project count.

    "6 projects" invites the reader to weigh the number, and the number is the
    least interesting thing here — a portfolio of twenty half-finished repos
    would score higher. What a reader actually wants to know is whether any of
    it is real, so the lead stat is that something is running in production
    right now that they can go and use.
  */
  { value: "Live", label: "In production today" },
  { value: "1,742", label: "Tests across the work" },
  { value: "7", label: "Languages in shipped code" },
  { value: "B.Sc.", label: "Computer Science" },
] as const;

export const availability = {
  open: true,
  label: "Available for software development roles",
  detail:
    "Open to junior software development roles — onsite, hybrid, or remote.",
} as const;
