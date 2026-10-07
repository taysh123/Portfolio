import Image from "next/image";
import { GravityFieldLazy } from "./GravityFieldLazy";
import { flagships, projectOf } from "@/data/work";

/** World 04 — orbit. The gameplay capture at the centre of the orbital field; two more real screens ride the
 *  orbit at depth; a traced path shows the mechanic (a star pulled into a well). Labels are the game's own
 *  numbers. The field is the site's one time-based loop (GravityField). */
export function GravityWorld() {
  const p = projectOf("gravity-flow"), notes = flagships.find((f) => f.id === "gravity-flow")!.notes;
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-gravity">
      <GravityFieldLazy />
      <svg className="world-gravity__orbits" viewBox="0 0 600 600" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <g transform="rotate(-18 300 300)">
          <ellipse cx="300" cy="300" rx="285" ry="118" />
          <ellipse cx="300" cy="300" rx="210" ry="86" />
          <path className="world-gravity__trace" d="M 92 236 C 170 170, 250 210, 300 300" />
          <circle className="world-gravity__well" cx="300" cy="300" r="5" />
        </g>
      </svg>
      <figure className="world-gravity__phone">
        <Image src="/projects/gravity-flow/gameplay.webp" alt={alt("/projects/gravity-flow/gameplay.webp")} width={640} height={1280} sizes="(min-width:1024px) 15vw, 44vw" />
      </figure>
      <figure className="world-gravity__moon world-gravity__moon--a">
        <Image src="/projects/gravity-flow/boss.webp" alt={alt("/projects/gravity-flow/boss.webp")} width={640} height={1280} sizes="8vw" />
      </figure>
      <figure className="world-gravity__moon world-gravity__moon--b">
        <Image src="/projects/gravity-flow/win.webp" alt={alt("/projects/gravity-flow/win.webp")} width={640} height={1280} sizes="7vw" />
      </figure>
      <div className="world-gravity__legend" aria-hidden="true">
        <p className="world-note"><span>{notes[0]}</span></p>
        <p className="world-gravity__count"><b>{notes[1].split(" ")[0]}</b><span>levels</span><b>{notes[2].split(" ")[0]}</b><span>worlds</span></p>
      </div>
    </div>
  );
}
