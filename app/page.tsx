import { AmbientGlow } from "@/components/effects/AmbientGlow";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Stage } from "@/components/ui/Stage";
import { Entrance } from "@/components/entrance/Entrance";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { EngineeringPanel } from "@/components/sections/EngineeringPanel";
import { Contact } from "@/components/sections/Contact";

/**
 * The page is a composed surface, not a stack of sections.
 *
 * Everything lives inside one `Stage`, and the panels are separated by a
 * narrow gutter the lit field shows through. Section weight is deliberately
 * uneven — big, medium, huge, small, medium, big — so the page has rhythm
 * instead of a uniform cadence:
 *
 *   Entrance  the studio you scroll into; the laptop's screen becomes the hero
 *   About     an asymmetric pair
 *   Work      the largest region on the page — it carries the argument
 *   Toolkit   a low, wide band, deliberately quiet after Work
 *   Approach  one wide panel
 *   Contact   one large closing panel
 *
 * Work sits second because a recruiter scanning for evidence should reach the
 * projects on the second screen, not after a wall of technology names.
 */
export default function Page() {
  return (
    <>
      <AmbientGlow />
      <Navbar />
      <main id="main" className="relative pb-[var(--gap)]">
        {/* The front door sits outside the Stage: it is full-bleed by design,
            and the stage's gutters would frame a sequence that is supposed to
            have no frame until you are through it. */}
        <span id="top" aria-hidden="true" />
        <Entrance>
          <Hero />
        </Entrance>

        <Stage>
          <About />
          <Projects />
          <Skills />
          <EngineeringPanel />
          <Contact />
        </Stage>
      </main>
      <Footer />
    </>
  );
}
