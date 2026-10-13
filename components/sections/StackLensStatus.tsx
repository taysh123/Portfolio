"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fmt } from "@/lib/fmt";

/** The lens's one-line summary ("Aegis: 13 of these tools."), read politely when the choice changes. It only listens
 *  to the radios; the filtering itself never waits for it (see StackLens). */
export function StackLensStatus({ options }: { options: { id: string; name: string; count: number }[] }) {
  const { t } = useLocale();
  const ref = useRef<HTMLParagraphElement>(null);
  const [lens, setLens] = useState("");
  useEffect(() => {
    const set = ref.current?.closest("fieldset");
    if (!set) return;
    const read = () => setLens(set.querySelector<HTMLInputElement>('input[name="stack-lens"]:checked')?.value ?? "");
    read();                                                                   // a restored form state counts too
    set.addEventListener("change", read);
    return () => set.removeEventListener("change", read);
  }, []);
  const current = options.find((o) => o.id === lens);
  return <p ref={ref} className="lens__status" aria-live="polite">{current ? fmt(t.stack.showing, { n: current.count, name: current.name }) : " "}</p>;
}
