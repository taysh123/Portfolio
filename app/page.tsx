import { AmbientGlow } from "@/components/effects/AmbientGlow";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Stage } from "@/components/ui/Stage";
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
 *   Hero      one dominant panel, ~92svh
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
      <main id="main" className="relative pb-[var(--gap)] pt-[var(--gap)]">
        <Stage>
          <Hero />
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
