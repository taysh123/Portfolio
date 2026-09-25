import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Entrance } from "@/components/entrance/Entrance";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/work/Work";
import { PokerWorld } from "@/components/work/worlds/PokerWorld";
import { AegisWorld } from "@/components/work/worlds/AegisWorld";
import { DeveloperOSWorld } from "@/components/work/worlds/DeveloperOSWorld";
import { GravityWorld } from "@/components/work/worlds/GravityWorld";
import { Stack } from "@/components/sections/Stack";
import { ThinkBuildShip } from "@/components/sections/ThinkBuildShip";
import { Contact } from "@/components/sections/Contact";

/**
 * The page (spec §5): one continuous story, not a stack of panels.
 *
 *   Entrance  the studio you scroll into; the laptop's screen becomes the hero
 *   Work      four flagship worlds on a dark stage, then two more-work rows
 *   About     engineer by training, builder by nature
 *   Stack     the six groups as a bento
 *   Think · Build · Ship   a typographic, pinned sequence
 *   Contact   a dark closing stage, one primary action
 *
 * The entrance, the flagship run and Contact are dark in both themes (Plan 2
 * decision 1); About, Stack and Think · Build · Ship follow the site theme.
 */
export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Entrance><Hero /></Entrance>
        <Work worlds={{ poker: <PokerWorld />, aegis: <AegisWorld />, developeros: <DeveloperOSWorld />, "gravity-flow": <GravityWorld /> }} />
        <About />
        <Stack />
        <ThinkBuildShip />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
