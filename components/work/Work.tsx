import { CaseStudyHost } from "./CaseStudyHost";
import { MoreWork } from "./MoreWork";
import { PokerChapter } from "./PokerChapter";
import { AegisChapter } from "./AegisChapter";
import { DeveloperOSChapter } from "./DeveloperOSChapter";
import { GravityChapter } from "./GravityChapter";
import "./work.css";

const EARLY_CASE_STUDY = `document.addEventListener("click",function(e){if(window.__csReady)return;var b=e.target&&e.target.closest&&e.target.closest("[data-case-study]");if(b)window.__csEarly=b;},true);`;

/**
 * The work (M10): four product chapters, each on its own plate and each its own top-level section (its product name
 * is an h2), then two more. "Work" in the header lands on the first plate.
 */
export function Work() {
  return (
    <div id="work">
      <PokerChapter />
      <AegisChapter />
      <DeveloperOSChapter />
      <GravityChapter />
      <MoreWork />
      {/* A "Case study" press before hydration would otherwise be lost (the host's listener isn't attached yet):
          remember the last early opener; CaseStudyHost replays it on mount. Inline because it must run before
          any bundle (CSP allows inline scripts, proxy.ts). */}
      <script dangerouslySetInnerHTML={{ __html: EARLY_CASE_STUDY }} />
      <CaseStudyHost />
      {/* The case study is a script-driven dialog; without JavaScript its trigger would do nothing, so it isn't shown. */}
      <noscript><style>{".case-study-trigger{display:none}"}</style></noscript>
    </div>
  );
}
