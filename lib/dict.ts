import { clientDict } from "@/lib/dict-client";

/**
 * Every interface string the site renders — labels, buttons, accessible names, screen-reader text, states. The page's
 * prose (projects, chapters, About) lives in data/; this file is the chrome. Placeholders are `{name}`, filled by fmt()
 * (lib/fmt.ts). The part client components read lives in lib/dict-client.ts; this file adds the rest and merges the two.
 */
const server = {
  skip: "Skip to content",
  hero: {
    seeWork: "See the work",
    plates: "Flagship projects",
  },
  poker: {
    walk: "Walk through {name}",
    get: "Get {name}",
    webApp: "Open the web app",
    alts: [
      "T Poker home screen: start a cash game or a tournament, no account needed",
      "T Poker live tournament dashboard: prize pool, blind level and the clock",
      "T Poker end-of-night settlement: who pays whom, exact to the cent",
    ],
  },
  aegis: {
    bar: "Aegis · Alerts · Live",
    alt: "One row of the Aegis Alerts page, live: “Port scan detected from 10.10.10.2 (20 distinct ports in 60s)”, severity 65, medium, from temporal at 10.10.10.2",
    traceTitle: "One alert, start to finish",
    parallel: "Then, in parallel",
  },
  dos: {
    bar: "DeveloperOS · Search your code",
    alt: "DeveloperOS searching your own code for “ollama provider”: each result cites a file and line range — {chips} and more",
    flow: "From your files to an answer, as implemented",
  },
  gf: {
    marks: { well: "Your gravity well", star: "The star", home: "Home" },
    alt: "GRAVITY FLOW, level 55 in play: a violet gravity well pulls the star, with the green goal above and a portal pair and a gravity zone in between",
    marked: "Marked on the frame: your gravity well, the star and home.",
  },
  more: { title: "Two more" },
  tbs: { title: "Think. Build. Ship." },
  contact: {
    title: ["Let's build something", "people use."],
    email: "Email me",
    subject: "Hello Tay",
    linkedin: "LinkedIn",
    github: "GitHub",
    resume: "Download résumé (PDF)",
    resumeNote: " · two pages, 80 KB",
    previewNote: "The résumé download is left out of this review Preview.",
  },
  footer: {
    label: "Footer",
    email: "Email",
    resume: "Résumé (PDF)",
    top: "Back to top",
  },

};

export const dict = { ...clientDict, ...server };
export type Dict = typeof dict;
