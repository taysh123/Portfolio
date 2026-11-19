import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { ThinkBuildShip } from "@/components/sections/ThinkBuildShip";
import { Contact } from "@/components/sections/Contact";
import { CaseStudyHost } from "@/components/work/CaseStudyHost";
import { getContent } from "@/lib/content";
// The cinematic design language (Concept A: tokens, surfaces, focus, the one reveal). Only this page loads it, and it
// applies only inside the `.cine` root below (docs/CINEMATIC_SYSTEM.md). Imported before the sections' own sheets.
import "./cinematic.css";

const EARLY_CASE_STUDY = `document.addEventListener("click",function(e){if(window.__csReady)return;var b=e.target&&e.target.closest&&e.target.closest("[data-case-study]");if(b)window.__csEarly=b;},true);`;

/**
 * The page (Concept A, the release: R1–R15 in docs/RESEARCH_AND_DECISIONS.md). D1 reopened by Tay, 2026-11-18; D2 not
 * reopened, so no WebGL. One `.cine` root, dark only (R3):
 *
 *   Header    the hero's wordmark and pill, the four destinations, accessibility, "Get in touch" (R2)
 *   Hero      the locked hero, with its 2D field                         #hero
 *   Work      four product panels, each with its case study (R4), then Two more (R5)
 *                                                                        #work, #work-<id>, #more-work
 *   About     who, ending on the facts (R10)                             #about
 *   Stack     the tools behind the work, with a project filter           #skills
 *   Think · Build · Ship   three principles, each with its evidence      #approach
 *   Contact   the live title, lead and four links                        #contact
 *
 * Then the live footer, and the case-study dialog's host. Both sit outside the root, so the footer and every overlay
 * (the case study, the chat, the accessibility panel) keep the site's own dark theme (R3). One `main`, one h1 (the
 * hero's); every live anchor id is kept (R7).
 */
export default function Page() {
  const c = getContent();
  return (
    <>
      <div className="cine" data-theme="dark">
        <Navbar />
        <main id="main">
          <Hero c={c} />
          <div className="wk">
            <div className="wk__sky" aria-hidden="true">
              <span className="wk__glow wk__glow--cyan" />
              <span className="wk__glow wk__glow--violet" />
            </div>
            <div className="wk__main shell">
              <Work />
              <About />
              <Stack />
              <ThinkBuildShip />
              <Contact />
            </div>
          </div>
        </main>
      </div>
      <Footer c={c} />
      {/* A "Case study" press before hydration would otherwise be lost (the host's listener isn't attached yet):
          remember the last early opener; CaseStudyHost replays it on mount. Inline because it must run before
          any bundle (CSP allows inline scripts, proxy.ts). */}
      <script dangerouslySetInnerHTML={{ __html: EARLY_CASE_STUDY }} />
      <CaseStudyHost />
      {/* The case study is a script-driven dialog; without JavaScript its trigger would do nothing, so it isn't shown. */}
      <noscript><style>{".case-study-trigger{display:none}"}</style></noscript>
    </>
  );
}
