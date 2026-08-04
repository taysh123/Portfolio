import { AmbientGlow } from "@/components/effects/AmbientGlow";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { EngineeringPanel } from "@/components/sections/EngineeringPanel";
import { Contact } from "@/components/sections/Contact";

/**
 * Section order tells a story: who → proof → range → method → reach out.
 *
 * Work comes before the toolkit deliberately. A recruiter scanning for
 * evidence should hit the projects on the second screen, not after a wall of
 * technology names.
 */
export default function Page() {
  return (
    <>
      <AmbientGlow />
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <EngineeringPanel />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
