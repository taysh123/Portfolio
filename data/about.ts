/** About (spec §5.3): the principle once, here; the project details live in their chapters and in Think · Build · Ship,
 *  so they are not repeated. Tay's copy pass (2026-11-21) set the title, the body and the degree's year. */
export const about = {
  title: ["Solid foundations.", "Real products."] as [string, string],
  /** Two sentences: who, then what with. Every tool it names is on the Stack (data/skills.ts); .NET is there as C# and
   *  ASP.NET Core. */
  body: "I'm a Computer Science graduate who builds dependable software, from the first design to production. I work across the stack: C#/.NET and ASP.NET Core, TypeScript with React and React Native, Python, Java and SQL, with PostgreSQL, Redis, RabbitMQ and Docker behind them, and local models through Ollama.",
  /** One quiet line of facts, not stat tiles. The degree and its year alone: the site names no institution (the owner's
   *  decision). */
  facts: ["B.Sc. in Computer Science (2026)", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"],
  /** The composition beside the copy (components/sections/AboutVisual.tsx): real captures of the four products. No
   *  caption — the products speak for themselves — and one accessible name for the whole group. */
  visual: {
    label: "T Poker, Aegis, DeveloperOS and GRAVITY FLOW, side by side: the four products as they run.",
  },
};
