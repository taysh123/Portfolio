"use client";
// Mounts the field only when its scene nears the viewport (keeps it out of first-load JS).
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const GravityField = dynamic(() => import("./GravityField").then((m) => m.GravityField), { ssr: false });
export function GravityFieldLazy() {
  const ref = useRef<HTMLDivElement>(null); const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "50% 0px" });
    if (ref.current) io.observe(ref.current); return () => io.disconnect();
  }, []);
  return <div ref={ref} className="world-gravity__field" aria-hidden="true">{near && <GravityField />}</div>;
}
