import { AmbientCanvas } from "@/components/AmbientCanvas";
import { Navigation } from "@/components/Navigation";
import { IntroScene } from "@/components/IntroScene";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { TechStack } from "@/components/TechStack";
import { Process } from "@/components/Process";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AmbientCanvas />
      <Navigation />
      <IntroScene />
      <main id="main" className="site-main">
        <Hero />
        <Projects />
        <About />
        <TechStack />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
