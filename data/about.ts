/** About (spec §5.3; M10 copy pass): the principle once, here; the project details live in their chapters and in
 *  Think · Build · Ship, so they are not repeated. */
export const about = {
  title: ["Engineer by training.", "Builder by nature."] as [string, string],
  paragraphs: [
    "I'm a Computer Science graduate, and nearly everything I build comes back to one idea: make the wrong thing hard to express. I look for ways to encode constraints in data models, interfaces, and tests, so correctness depends less on convention or code review.",
    "I started in C and C++, where the machine is honest about what you get wrong. I carry that mindset into C#/.NET, TypeScript, and Python—taking projects from empty repositories to working systems. I'm looking for a junior software engineering role on a team that ships real products.",
  ] as [string, string],
  /** M10: one quiet line of facts, not stat tiles. */
  facts: ["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel, working in English"],
  /** The one photograph on the page (design/studio/about-photo.mjs). */
  photo: {
    caption: "Where the work happens",
    note: "A 3D render, built in code.",
    // The caption says it is a render; the alt text describes what is in it, without repeating the caption.
    alt: "A desk at night with the four products running: Aegis's incident board and DeveloperOS's code search on two monitors, GRAVITY FLOW and T Poker on phones, and the T Poker sign on the wall.",
  },
};
