import Image from "next/image";
import { GravityFieldLazy } from "./GravityFieldLazy";
import { projectOf } from "@/data/work";

/** Spec §5.2 world 04: the gameplay capture in a phone frame; the orbital field extends past the frame. */
export function GravityWorld() {
  const p = projectOf("gravity-flow");
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-gravity">
      <GravityFieldLazy />
      <figure className="world-gravity__phone">
        <Image src="/projects/gravity-flow/gameplay.webp" alt={alt("/projects/gravity-flow/gameplay.webp")} width={640} height={1280} sizes="(min-width:1024px) 14vw, 40vw" />
      </figure>
      <figure className="world-gravity__inset">
        <Image src="/projects/gravity-flow/boss.webp" alt={alt("/projects/gravity-flow/boss.webp")} width={640} height={1280} sizes="8vw" />
      </figure>
      <p className="world-gravity__note label">v1.0.0-rc · Android-only</p>
    </div>
  );
}
