import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/work/Work";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { ThinkBuildShip } from "@/components/sections/ThinkBuildShip";
import { Contact } from "@/components/sections/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/**
 * The page (M10, Direction A "Product Plates"), in one language: / is English, /he is Hebrew — the same page, the
 * same order, the same facts. Paper is the page; each of the four products sits on its own plate (navy, steel,
 * violet, teal); the rest of the page returns to paper.
 *
 *   Hero      headline, range, the four plates as navigation
 *   Work      T Poker · Aegis · DeveloperOS · GRAVITY FLOW, then two more
 *   About     who, beside the four products together
 *   Stack     tools by the work they did, with a project filter
 *   Think · Build · Ship   three principles, each with its evidence
 *   Contact   one action and the two profiles
 */
export function Site({ locale }: { locale: Locale }) {
  const c = getContent(locale);
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Hero c={c} />
        <Work c={c} />
        <About c={c} />
        <Stack c={c} />
        <ThinkBuildShip c={c} />
        <Contact c={c} />
      </main>
      <Footer c={c} />
      <JsonLd c={c} />
    </>
  );
}
