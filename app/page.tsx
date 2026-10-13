import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/work/Work";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { ThinkBuildShip } from "@/components/sections/ThinkBuildShip";
import { Contact } from "@/components/sections/Contact";

/**
 * The page (M10, Direction A "Product Plates"): an editorial product studio. Paper is the page; each of the four
 * products sits on its own plate (navy, steel, violet, teal); the rest of the page returns to paper.
 *
 *   Hero      headline, range, the four plates as navigation
 *   Work      T Poker · Aegis · DeveloperOS · GRAVITY FLOW, then two more
 *   About     who, and where the work happens (the one photograph)
 *   Stack     tools by the work they did, with a project filter
 *   Think · Build · Ship   three principles, each with its evidence
 *   Contact   one action and the two profiles
 */
export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <Work />
        <About />
        <Stack />
        <ThinkBuildShip />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
