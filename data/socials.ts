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
    "Full Stack Developer", not "Software Engineer".

    Chosen from the options on the table because it is the one the
    repositories actually support end to end: an Expo client, an ASP.NET Core
    API, and PostgreSQL/Redis behind it, all written by the same person. It is
    also the phrase a recruiter searches for, which "Product Builder" is not,
    and it does not overclaim seniority the way "Engineer" was reading.
  */
  role: "Full Stack Developer",
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
