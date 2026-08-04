import Image from "next/image";
import { cn } from "@/lib/cn";
import { projectAccent } from "@/lib/tokens";
import type { Project } from "@/data/projects";

function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /[a-z]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Project media, with a branded fallback for projects that have no screenshot
 * (a Telegram bot and a desktop Java client don't photograph well).
 *
 * `preload` replaces the `priority` prop, which is deprecated in Next 16 — it
 * emits a `<link rel="preload">` for the LCP image. Only ever pass it for the
 * one image that is actually the LCP candidate.
 */
export function ProjectImage({
  project,
  className,
  sizes,
  preload = false,
}: {
  project: Pick<Project, "name" | "accent" | "media">;
  className?: string;
  sizes: string;
  preload?: boolean;
}) {
  const media = project.media;
  const accent = projectAccent[project.accent];
  const fit = media?.fit ?? "cover";
  const objectClass =
    fit === "contain" ? "object-contain" : "object-cover object-top";

  // Portrait phone captures get an accent-tinted bed so the letterboxing reads
  // as an intentional device frame rather than dead space.
  const bedStyle =
    fit === "contain"
      ? {
          backgroundImage: `radial-gradient(120% 100% at 50% 0%, ${accent}2e, transparent 70%)`,
        }
      : undefined;

  return (
    <div className={cn("relative overflow-hidden", className)} style={bedStyle}>
      {media?.image ? (
        <Image
          src={media.image}
          alt={media.alt ?? `${project.name} interface`}
          fill
          sizes={sizes}
          preload={preload}
          className={cn(objectClass, "transition-transform duration-[600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]")}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col bg-surface-2">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(120% 90% at 50% 0%, ${accent}30, transparent 62%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(80% 72% at 50% 46%, #000 30%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(80% 72% at 50% 46%, #000 30%, transparent 82%)",
            }}
          />
          <div className="relative flex items-center gap-1.5 px-4 py-3">
            <span className="h-2 w-2 rounded-full" style={{ background: `${accent}55` }} />
            <span className="h-2 w-2 rounded-full bg-fg-subtle/30" />
            <span className="h-2 w-2 rounded-full bg-fg-subtle/20" />
            <span className="ml-2 h-2.5 w-[55%] rounded-full bg-fg-subtle/10" />
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <span
              className="font-mono text-[2.5rem] font-semibold tracking-tight"
              style={{ color: accent, textShadow: `0 0 32px ${accent}44` }}
            >
              {monogram(project.name)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
