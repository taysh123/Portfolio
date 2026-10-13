/**
 * Engineering approach.
 *
 * Each step carries a real example from a real repository rather than a
 * principle. "I care about testing" is a claim; "two implementations of the
 * settlement engine, pinned by mirrored fixtures" is evidence. The previous
 * version of this section described the portfolio site itself, which told a
 * visitor nothing about how the work gets done.
 */

export type ApproachStep = {
  id: string;
  title: string;
  summary: string;
  /** A concrete instance of this step from a shipped project. */
  evidence: string;
  project: string;
};

export const approachSteps: ApproachStep[] = [
  {
    id: "understand",
    title: "Understand",
    summary:
      "Find the part that's actually hard. It's rarely the feature list: usually, one constraint shapes everything else.",
    evidence:
      "The hard part wasn't the poker UI, it was keeping the money exact to the cent—including a guest game run entirely on a phone with no signal. Everything else followed from that.",
    project: "T Poker",
  },
  {
    id: "design",
    title: "Design",
    summary:
      "Pick boundaries that a machine can check. A rule enforced by convention is a rule that decays.",
    evidence:
      "Eight bounded contexts across 27 projects with no project references between modules, so one module can't call another's code—checked by a scan of all 81 references.",
    project: "Aegis",
  },
  {
    id: "build",
    title: "Build",
    summary:
      "Make the safe path the easy one. Encode constraints in types, interfaces, and data models—not just in documentation.",
    evidence:
      "On the device, money is integer cents, so exactness is structural. In GRAVITY FLOW, cosmetic items are defined by visual fields only, and every purchase grants cosmetics or ad removal—nothing that changes gameplay.",
    project: "T Poker · GRAVITY FLOW",
  },
  {
    id: "verify",
    title: "Verify",
    summary:
      "Test the thing you'd argue about. Coverage is a number; a test that pins a disputed behaviour is leverage.",
    /*
      This used to be the portfolio-wide test count — the same sentence the Toolkit's
      Verification group already carries, almost word for word. Repeating a
      number in two places does not make it twice as true; it makes the second
      one filler. The section's own intro promises "a settlement engine pinned
      by mirrored fixtures", so that is what belongs here, and the count stays
      where it earns its place.
    */
    evidence:
      "The settlement engine exists twice—C# on the server, TypeScript on the device, because a guest game has to be able to close with no signal. One shared fixture file runs through both Jest and xUnit, so a divergence surfaces as a failing test rather than a wrong payout.",
    project: "T Poker",
  },
  {
    id: "ship",
    title: "Ship",
    summary:
      "Make the project reproducible, testable, and explicit about its known gaps. A README that hides the gaps costs you the reader's trust.",
    evidence:
      "Aegis starts from one launcher script that mints its own keys and gates on health, and its repository keeps an audit document that lists the work still open.",
    project: "Aegis · DeveloperOS",
  },
];

/** Think · Build · Ship (M10, the approved Direction A copy): three principles, each condensed from the steps above —
 *  its heading and line from a step's summary, its example from that step's evidence (tests/unit/approach.test.ts). */
export const pillars = [
  { word: "Think", line: "Find the hard part.", from: ["understand"], project: "T Poker",
    summary: "Usually, one constraint shapes everything else.",
    example: "T Poker: the money has to be exact to the cent, even in a guest game on a phone with no signal." },
  { word: "Build", line: "Make the safe path the easy one.", from: ["build"], project: "GRAVITY FLOW",
    summary: "Encode constraints in types, interfaces, and data models—not just in documentation.",
    example: "GRAVITY FLOW: cosmetic items are defined by visual fields only, and every purchase grants cosmetics or ad removal—nothing that changes gameplay." },
  { word: "Ship", line: "Ship it honestly.", from: ["ship"], project: "Aegis",
    summary: "Make the project reproducible, testable, and explicit about its known gaps.",
    example: "Aegis starts from one launcher script, and its repository keeps an audit document that lists the work still open." },
] as const;
