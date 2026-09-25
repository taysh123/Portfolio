"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { skillGroups } from "@/data/skills";

function BentoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };
  return <div className={`bento-card ${className}`} onPointerMove={move}>{children}</div>;
}

export function TechStack() {
  return (
    <section id="stack" className="stack-section section-shell" aria-labelledby="stack-title">
      <div className="section-eyebrow">Tech stack</div>
      <div className="stack-heading"><h2 id="stack-title">The tools I build with.</h2><p>Enough range to own a product end-to-end. Enough restraint to choose the simplest tool that fits.</p></div>
      <div className="bento-grid">
        {skillGroups.map((group, index) => (
          <BentoCard key={group.title} className={index === 2 || index === 3 ? "wide" : ""}>
            <div className="bento-index">0{index + 1}</div>
            <h3>{group.title}</h3><p>{group.caption}</p>
            <div className="skill-cloud">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
          </BentoCard>
        ))}
      </div>
    </section>
  );
}
