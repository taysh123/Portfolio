import { ScrollScene } from "@/components/scenes/ScrollScene";
import { pillars } from "@/data/approach";
import "./ThinkBuildShip.css";

/** Spec §5.5: pinned 200svh where pinning applies; otherwise (and under reduced motion) a static stacked list. */
export function ThinkBuildShip() {
  return (
    <ScrollScene id="approach" labelledBy="approach-title" phases="pillars" className="tbs">
      <div className="shell">
        <h2 id="approach-title" className="sr-only">Think. Build. Ship.</h2>
        <p aria-hidden="true" className="tbs__words">
          {pillars.map((p, i) => <span key={p.word} data-i={i} className="tbs__word">{p.word}.</span>)}
        </p>
        <div className="tbs__line" aria-hidden="true"><span /></div>
        <ol className="tbs__slots">
          {pillars.map((p, i) => (
            <li key={p.word} data-i={i} className="tbs__slot">
              <h3 className="text-xl font-semibold text-fg"><span className="sr-only">{p.word}: </span>{p.line}</h3>
              <p className="mt-3 max-w-[62ch] text-fg-muted">{p.example}</p>
              <p className="label mt-3 text-fg-subtle">{p.project}</p>
            </li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}
