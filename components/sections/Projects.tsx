"use client";

import { useCallback, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { FeaturedProject } from "@/components/ui/FeaturedProject";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CaseStudyPanel } from "@/components/ui/CaseStudyPanel";
import { ButtonLink } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { projects, featuredProject } from "@/data/projects";
import { socials } from "@/data/socials";
import type { Project } from "@/data/projects";

const rest = projects.filter((p) => p.id !== featuredProject.id);

/**
 * Selected work.
 *
 * A bento rhythm rather than a uniform grid: one lead panel, two half-width
 * cards, three third-width cards. The size a project gets is proportional to
 * how much it proves — which is a real editorial decision the reader can feel,
 * and it avoids the flat "six identical tiles" look.
 *
 * This replaces a 3D carousel that showed one project per ~1,200px of scroll,
 * blurred the other five, auto-advanced against the reader, and re-announced
 * itself to screen readers every 4.2 seconds.
 */
export function Projects() {
  const [caseStudy, setCaseStudy] = useState<Project | null>(null);
  const open = useCallback((p: Project) => setCaseStudy(p), []);
  const close = useCallback(() => setCaseStudy(null), []);

  return (
    <>
      <Section
        id="work"
        eyebrow="02 — Selected work"
        title="Six projects, built end to end"
        intro="Each one designed, written, tested and shipped alone. The case studies cover what was actually hard — and what each one still isn't."
        aside={
          <ButtonLink
            href={socials.github.url}
            external
            variant="ghost"
            size="sm"
            arrow
          >
            <GithubIcon size={15} />
            All repositories
          </ButtonLink>
        }
      >
        <Reveal as="div">
          <FeaturedProject project={featuredProject} onOpenCaseStudy={open} />
        </Reveal>

        <Reveal
          as="ul"
          stagger={0.08}
          className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6"
        >
          {rest.map((project, i) => {
            // First two get half width on xl, the remaining three get a third.
            const wide = i < 2;
            return (
              <RevealItem
                key={project.id}
                as="li"
                className={cn(
                  "min-w-0",
                  wide ? "xl:col-span-3" : "xl:col-span-2",
                  // 5 cards in a 2-col layout leaves an orphan — let it span.
                  i === rest.length - 1 && "md:col-span-2 xl:col-span-2",
                )}
              >
                <ProjectCard
                  project={project}
                  size={wide ? "md" : "sm"}
                  onOpenCaseStudy={open}
                />
              </RevealItem>
            );
          })}
        </Reveal>
      </Section>

      <CaseStudyPanel project={caseStudy} onClose={close} />
    </>
  );
}
