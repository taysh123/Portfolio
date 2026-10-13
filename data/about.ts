/** About (spec §5.3). Condensed from the August About copy; nothing added. */
export const about = {
  title: ["Engineer by training.", "Builder by nature."] as [string, string],
  paragraphs: [
    "I'm a Computer Science graduate, and nearly everything I build comes back to one idea: make the wrong thing hard to express. Money moves in integer cents, so a rounding error has nowhere to live. Modules can't reach each other's code, so a boundary isn't left to code review. A retrieval layer that can't cite a file and a line refuses to answer rather than guess.",
    "That started in C and C++, where nothing is handed to you and the machine is honest about what you got wrong. It carries into the C#/.NET, TypeScript and Python work I do now — each taken from an empty repo to a running system. I'm looking for a junior software engineering role on a team that ships.",
  ] as [string, string],
  /** M10: one quiet line of facts, not stat tiles. */
  facts: ["B.Sc. in Computer Science", "Full stack: web, mobile and backend", "Based in Israel, working in English"],
  /** The one photograph on the page (design/studio/about-photo.mjs). */
  photo: {
    caption: "Where the work happens",
    note: "A 3D render of the desk, built in code.",
    alt: "A desk at night with the four products running: Aegis's incident board and DeveloperOS's code search on two monitors, GRAVITY FLOW and T Poker on phones, and the T Poker sign on the wall. A 3D render, built in code.",
  },
};
