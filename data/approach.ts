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
      "Find the part that's actually hard. It's rarely the feature list — usually it's one constraint everything else has to bend around.",
    evidence:
      "The hard part wasn't the poker UI, it was guaranteeing the money is exact on a phone with no signal and still correct when the server reconnects. Everything else followed from that.",
    project: "T Poker",
  },
  {
    id: "design",
    title: "Design",
    summary:
      "Pick boundaries that a machine can check. A rule enforced by convention is a rule that decays.",
    evidence:
      "Eight bounded contexts across 27 projects, structured so a cross-module reference fails to compile — verified by a script, not by code review.",
    project: "SentinelAI",
  },
  {
    id: "build",
    title: "Build",
    summary:
      "Make the safe path the easy one. Constraints belong in types and interfaces, not in a document nobody reads twice.",
    evidence:
      "Money is integer cents end to end, so exactness is structural. The cosmetics config has no gameplay-affecting fields at all, so pay-to-win isn't a policy — it's unrepresentable.",
    project: "T Poker · GRAVITY FLOW",
  },
  {
    id: "verify",
    title: "Verify",
    summary:
      "Test the thing you'd argue about. Coverage is a number; a test that pins a disputed behaviour is leverage.",
    /*
      This used to be the 1,742-test count — the same sentence the Toolkit's
      Verification group already carries, almost word for word. Repeating a
      number in two places does not make it twice as true; it makes the second
      one filler. The section's own intro promises "a settlement engine pinned
      by mirrored fixtures", so that is what belongs here, and the count stays
      where it earns its place.
    */
    evidence:
      "The settlement engine exists twice — C# on the server, TypeScript on the device, because a game has to be able to close with no signal. The TypeScript fixtures mirror the C# service case for case, so a divergence surfaces as a failing test rather than a wrong payout.",
    project: "T Poker",
  },
  {
    id: "ship",
    title: "Ship",
    summary:
      "Reviewable in one command, and honest about what isn't finished. A README that hides the gaps costs you the reader's trust.",
    evidence:
      "SentinelAI comes up from a single Docker command that mints its own keys and gates on health. Its repo also carries an audit document where I list my own unfinished work.",
    project: "SentinelAI · DeveloperOS",
  },
];
