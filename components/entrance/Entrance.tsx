import "./entrance.css";
import { EntranceStage } from "./EntranceStage";

/** The front door. Same DOM in every mode; CSS picks pinned or static at first paint. */
export function Entrance({ children }: { children: React.ReactNode }) {
  return (
    <div id="entrance" className="entrance" data-framing="landscape">
      <noscript>
        <style>{`.entrance{height:auto}.entrance__stage{position:static;height:auto}.entrance__canvas,.entrance__poster,.entrance__veil,.entrance__overlay,.entrance__skip{display:none}.entrance__still{display:block;position:relative;height:100svh}.entrance__surface{position:static;opacity:1}.entrance__surface>.entrance__hero{position:static;width:auto;height:auto}header[data-entrance-nav]{opacity:1!important}`}</style>
      </noscript>
      {/* Dark in both themes: the stage is the studio, and the hero starts life as the laptop's screen. */}
      <div className="entrance__stage" data-theme="dark">
        <picture className="entrance__poster">
          <source media="(max-aspect-ratio: 9/10)" srcSet="/entrance/poster-portrait.avif" type="image/avif" />
          <source srcSet="/entrance/poster-landscape.avif" type="image/avif" />
          <img src="/entrance/poster-landscape.jpg" alt="" fetchPriority="high" decoding="async" className="entrance__poster" />
        </picture>
        <picture className="entrance__still">
          <source media="(max-aspect-ratio: 9/10)" srcSet="/entrance/still-portrait.avif" type="image/avif" />
          <source srcSet="/entrance/still-landscape.avif" type="image/avif" />
          <img src="/entrance/still-landscape.jpg" alt="" decoding="async" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </picture>
        <EntranceStage>{children}</EntranceStage>
      </div>
    </div>
  );
}
