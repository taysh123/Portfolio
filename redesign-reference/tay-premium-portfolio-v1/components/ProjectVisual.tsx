import Image from "next/image";
import type { Project } from "@/data/projects";

function Screenshot({ project, className = "" }: { project: Project; className?: string }) {
  if (!project.image) return <div className={`visual-placeholder ${className}`} aria-hidden="true" />;
  return (
    <Image
      src={project.image}
      alt={project.alt ?? `${project.name} preview`}
      fill
      sizes="(max-width: 800px) 80vw, 48vw"
      className={`project-screenshot ${className}`}
    />
  );
}

export function ProjectVisual({ project }: { project: Project }) {
  if (project.kind === "phones") {
    return (
      <div className="phone-world project-visual-inner">
        <div className="phone phone-back"><Screenshot project={project} /></div>
        <div className="phone phone-main"><Screenshot project={project} /></div>
        <div className="phone phone-side"><Screenshot project={project} /></div>
        <div className="visual-glow" />
      </div>
    );
  }

  if (project.kind === "monitor") {
    return (
      <div className="monitor-world project-visual-inner">
        <div className="desktop-monitor">
          <div className="desktop-screen"><Screenshot project={project} /><div className="scan-line" /></div>
          <div className="monitor-neck" /><div className="monitor-foot" />
        </div>
        <div className="data-pulse pulse-a" /><div className="data-pulse pulse-b" />
      </div>
    );
  }

  if (project.kind === "windows") {
    return (
      <div className="window-world project-visual-inner">
        <div className="floating-window window-a"><Screenshot project={project} /></div>
        <div className="floating-window window-b"><div className="code-bars">{Array.from({ length: 8 }).map((_, i) => <i key={i} />)}</div></div>
        <div className="floating-window window-c"><span>LOCAL</span><b>Grounded answers.</b><small>file:line citations</small></div>
      </div>
    );
  }

  if (project.kind === "orbit") {
    return (
      <div className="orbit-world project-visual-inner">
        <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" />
        <div className="gravity-core" />
        <div className="game-phone"><Screenshot project={project} /></div>
        <i className="orbit-star star-one" /><i className="orbit-star star-two" /><i className="orbit-star star-three" />
      </div>
    );
  }

  if (project.kind === "terminal") {
    return (
      <div className="terminal-world project-visual-inner">
        <div className="terminal-card">
          <div className="terminal-top"><i /><i /><i /><span>job-assistant</span></div>
          <code>$ collect --sources all</code>
          <code className="ok">✓ 1,077 roles collected</code>
          <code>$ filter --junior --location israel</code>
          <code className="ok">✓ 103 matched</code>
          <code>$ deliver --telegram</code>
          <div className="terminal-cursor" />
        </div>
        <div className="pipeline-node node-a">COLLECT</div><div className="pipeline-node node-b">FILTER</div><div className="pipeline-node node-c">DELIVER</div>
      </div>
    );
  }

  return (
    <div className="abstract-world project-visual-inner">
      <div className="flow-node flow-a"><span>01</span><b>Order</b></div>
      <div className="flow-node flow-b"><span>02</span><b>Dispatch</b></div>
      <div className="flow-node flow-c"><span>03</span><b>Deliver</b></div>
      <svg className="flow-lines" viewBox="0 0 600 340" aria-hidden="true"><path d="M130 170 C220 70 325 270 470 160" /></svg>
    </div>
  );
}
