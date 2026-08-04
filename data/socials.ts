import { encodePhone } from "@/lib/obfuscate";

const PHONE_PLAIN = "052-8183479";

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
  role: "Software Engineer",
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
  { value: "6", label: "Projects built end to end" },
  { value: "1,742", label: "Tests across those projects" },
  { value: "7", label: "Languages in shipped code" },
  { value: "B.Sc.", label: "Computer Science" },
] as const;

export const availability = {
  open: true,
  label: "Available for software engineering roles",
  detail:
    "Open to junior software engineering roles — onsite, hybrid, or remote.",
} as const;
