/**
 * The interface strings client components read (the header and its theme control, the case study, the Stack's
 * filter status, the assistant). They ship in the JavaScript rather than in each page's serialized props, so the HTML a
 * visitor waits for stays small. The rest of the interface, rendered on the server, is in lib/dict.ts, which merges
 * this table in.
 */
export const clientDict = {
  nav: {
    label: "Primary",
    work: "Work",
    about: "About",
    stack: "Stack",
    contact: "Contact",
    home: "{name} — home",
    a11y: "Accessibility settings",
    getInTouch: "Get in touch",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Navigation",
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  common: {
    newTab: " (opens in a new tab)",
    caseStudy: "Case study",
    source: "Source on GitHub",
    releasedVersion: "Released · v1.0.0",
  },
  status: {
    live: "Live",
    released: "Released",
    rc: "Release candidate",
    coursework: "Coursework",
    local: "Runs locally",
    stores: "Available on iOS, Android, and the web",
    storesNoWeb: "Available on iOS and Android",
    source: "Source on GitHub",
  },
  store: {
    ios: "Download on the",
    android: "Get it on",
    soon: "Coming soon to",
    soonLabel: "{app} on {store} — coming soon",
  },
  stack: {
    title: "Tools behind the work.",
    related: "Related projects",
    filter: "Filter by project",
    all: "All",
    showing: "Showing the {n} tools {name} uses.",
  },
  cs: {
    loading: "Loading case study…",
    close: "Close case study",
    openApp: "Open the app",
    viewSource: "View source",
    gallery: "Inside the product",
    problem: "The problem",
    architecture: "Architecture",
    decisions: "Engineering decisions",
    challenges: "Challenges",
    learned: "What I took from it",
    honest: "What this isn't",
    stack: "Stack",
    interface: "{name} interface",
  },
  chat: {
    launcher: "Chat with the assistant",
    launcherShort: "Chat",
    // The panel's own words are the original assistant's (AIChatWidget, before M10), unchanged in English.
    title: "Ask Tay AI",
    subtitle: "Answers from this portfolio only",
    greeting: "Ask me anything about Tay's projects, stack, or how he works. I'll point you at the repo if I don't know.",
    placeholder: "What's Aegis?",
    input: "Ask a question",
    send: "Send message",
    close: "Close chat",
    thinking: "Thinking…",
    error: "Something went wrong on my end. Try again, or email Tay at {email}.",
  },
};

export type ClientDict = typeof clientDict;
