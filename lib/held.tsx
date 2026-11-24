import { Children, type ReactNode } from "react";

/**
 * No line of the site starts with an em dash (Tay, 2026-11-24, copy pass B). Browsers may break a line before one, and no
 * CSS property alone stops that (tried in Chromium and Firefox), so each dash is tied to the word before it. This is the
 * one mechanism, for every surface: the sections, the case studies, the chat and /privacy render their prose through it.
 * Only spans are added: the text stays word for word. tests/unit/held.test.ts holds that; tests/e2e/lab-work.spec.ts
 * fails on any dash a reader can see that isn't tied.
 */
const TIED = /([^\s—]+[^\S\n]?—)/;
/** The site's existing rule for text that keeps to one line (the buttons use it), so no stylesheet grows. */
const RUN = "whitespace-nowrap";

/** The text in pieces, word for word: the odd ones are a word with its dash. */
export const pieces = (text: string): string[] => text.split(TIED);

/** Prose with its dashes tied. A text without one comes back as it is, with no markup. */
export function held(text: string): ReactNode {
  const all = pieces(text);
  return all.length === 1 ? text : all.map((t, i) => (i % 2 ? <span key={i} className={RUN}>{t}</span> : t));
}

/** The same for prose written in JSX: its own text is tied, and the elements in it are left alone. */
export function Held({ children }: { children: ReactNode }) {
  return <>{Children.map(children, (c) => (typeof c === "string" ? held(c) : c))}</>;
}

/** The same for an element written to directly (the chat's reply as it streams). */
export function writeHeld(node: HTMLElement, text: string) {
  node.replaceChildren(...pieces(text).map((t, i) => {
    if (i % 2 === 0) return t;
    const run = document.createElement("span");
    run.className = RUN;
    run.textContent = t;
    return run;
  }));
}
