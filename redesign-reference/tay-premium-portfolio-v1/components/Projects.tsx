"use client";

import type { CSSProperties } from "react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import { ProjectVisual } from "@/components/ProjectVisual";
import { MagneticLink } from "@/components/MagneticLink";
import { useReducedMotion } from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!root.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-scene").forEach((scene) => {
        const visual = scene.querySelector(".project-visual-inner");
        const copy = scene.querySelector(".project-copy");
        gsap.fromTo(copy, { y: 60, opacity: 0.25 }, { y: 0, opacity: 1, scrollTrigger: { trigger: scene, start: "top 72%", end: "top 32%", scrub: 0.7 } });
        if (visual) gsap.fromTo(visual, { yPercent: 9, scale: 0.96 }, { yPercent: -5, scale: 1.03, scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="work" className="projects-wrap" aria-labelledby="work-title">
      <div className="section-shell projects-heading">
        <div className="section-eyebrow">Selected work</div>
        <h2 id="work-title">Products, not just projects.</h2>
        <p>Each one gets its own visual world, because the work should feel as intentional as the code behind it.</p>
      </div>
      {projects.map((project) => (
        <article className={`project-scene kind-${project.kind}`} key={project.id} style={{ "--project-accent": project.accent } as CSSProperties}>
          <div className="project-grid section-shell">
            <div className="project-copy">
              <span className="project-number">{project.number}</span>
              <h3>{project.name}</h3>
              <h4>{project.kicker}</h4>
              <p>{project.description}</p>
              <div className="project-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="project-links">
                <MagneticLink href={project.repo} target="_blank" rel="noreferrer" className="text-link">View repository ↗</MagneticLink>
                {project.live && <MagneticLink href={project.live} target="_blank" rel="noreferrer" className="text-link">Live product ↗</MagneticLink>}
              </div>
            </div>
            <div className="project-visual"><ProjectVisual project={project} /></div>
          </div>
        </article>
      ))}
    </section>
  );
}
