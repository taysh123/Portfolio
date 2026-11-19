import { Fragment } from "react";
import { stackBlock as s } from "./stack";

/**
 * Stack (P3.4), under About: the tools behind the work, grouped as the live Stack groups them, plus Security. Each tool
 * names the flagships that use it, under it. Server-rendered, with no client code and no control of its own: nothing
 * here is a target, and it holds still (the page's one opening reveal stays the only one).
 */
export function StackBlock() {
  return (
    <section aria-labelledby="wk-stack-title" className="wk__stack" data-stack>
      <p className="wk__stack-eyebrow">{s.eyebrow}</p>
      <h2 id="wk-stack-title" className="wk__stack-title">{s.title}</h2>
      <div className="wk__stack-groups">
        {s.groups.map((g) => (
          <div key={g.id} className="wk__stack-group" data-group={g.id}>
            <h3 id={`wk-stack-${g.id}`} className="wk__stack-name">{g.title}</h3>
            <ul className="wk__stack-tools" aria-labelledby={`wk-stack-${g.id}`}>
              {g.tools.map((t) => (
                <li key={t.label} data-tool>
                  <span className="wk__stack-tool">{t.label}</span>
                  {t.where && (
                    // Each name whole, with its separator after it, so "GRAVITY FLOW" never splits across two lines.
                    <span className="wk__stack-where">
                      {t.names.map((n, k) => (
                        <Fragment key={n}>{k > 0 && " "}<span className="wk__stack-project">{k < t.names.length - 1 ? `${n} ·` : n}</span></Fragment>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
