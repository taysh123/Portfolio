"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function IntroScene() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 801px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.75,
          },
        });

        tl.to(".intro-copy", { opacity: 1, y: 0, duration: 0.08 }, 0.02)
          .to(".desk-scene", { opacity: 1, duration: 0.06 }, 0.03)
          .to(".laptop-lid", { rotateX: 0, duration: 0.24, ease: "power2.inOut" }, 0.11)
          .to(".screen-glow", { opacity: 1, duration: 0.08 }, 0.26)
          .to(".boot-line.one", { opacity: 1, duration: 0.04 }, 0.31)
          .to(".boot-line.two", { opacity: 1, duration: 0.04 }, 0.38)
          .to(".boot-line.three", { opacity: 1, duration: 0.04 }, 0.45)
          .to(".boot-sequence", { opacity: 0, duration: 0.05 }, 0.54)
          .to(".screen-identity", { opacity: 1, y: 0, duration: 0.08 }, 0.57)
          .to(".intro-copy", { opacity: 0, duration: 0.05 }, 0.59)
          .to(".desk-accessory", { opacity: 0.15, filter: "blur(4px)", duration: 0.15 }, 0.63)
          .to(".laptop-stage", { scale: 1.52, yPercent: 6, duration: 0.23, ease: "power2.in" }, 0.66)
          .to(".desk-surface", { opacity: 0.28, duration: 0.14 }, 0.68)
          .to(".portal-veil", { opacity: 1, duration: 0.10 }, 0.88);
      });

      mm.add("(max-width: 800px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
          },
        });
        tl.to(".laptop-lid", { rotateX: 0, duration: 0.36, ease: "power2.inOut" }, 0.06)
          .to(".screen-glow", { opacity: 1, duration: 0.10 }, 0.28)
          .to(".screen-identity", { opacity: 1, y: 0, duration: 0.12 }, 0.42)
          .to(".laptop-stage", { scale: 1.78, yPercent: 5, duration: 0.28 }, 0.62)
          .to(".portal-veil", { opacity: 1, duration: 0.12 }, 0.88);
      });
    }, el);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={root} id="top" className={`intro ${reduced ? "reduced" : ""}`} aria-label="Portfolio introduction">
      <div className="intro-sticky">
        <div className="intro-copy" aria-hidden="true">
          <span>01</span>
          <p>Scroll to enter</p>
        </div>

        <div className="desk-scene">
          <div className="desk-backdrop" />
          <div className="monitor desk-accessory" aria-hidden="true">
            <div className="monitor-code">
              <i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>
          <div className="plant desk-accessory" aria-hidden="true"><i /><i /><i /></div>
          <div className="notebook desk-accessory" aria-hidden="true"><b>IDEAS</b><b>BUILD</b><b>SHIP</b><b>REPEAT.</b></div>
          <div className="keyboard desk-accessory" aria-hidden="true" />
          <div className="mug desk-accessory" aria-hidden="true"><span>better<br/>software<br/>tomorrow</span></div>

          <div className="laptop-stage">
            <div className="laptop-lid">
              <div className="laptop-bezel">
                <div className="camera-dot" />
                <div className="laptop-screen">
                  <div className="screen-glow" />
                  <div className="boot-sequence" aria-hidden="true">
                    <p className="boot-line one">&gt; initializing portfolio...</p>
                    <p className="boot-line two">&gt; loading projects...</p>
                    <p className="boot-line three">&gt; ready.</p>
                  </div>
                  <div className="screen-identity">
                    <small>TS / PORTFOLIO</small>
                    <strong>TAY SHOFER</strong>
                    <span>Software Developer</span>
                    <p>Building products that ship.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="laptop-base">
              <div className="keyboard-grid" aria-hidden="true">{Array.from({ length: 54 }).map((_, i) => <i key={i} />)}</div>
              <div className="trackpad" />
              <div className="base-lip" />
            </div>
          </div>
          <div className="desk-surface" />
        </div>
        <div className="scroll-hint" aria-hidden="true"><span>Scroll to open</span><i /></div>
        <div className="portal-veil" />
      </div>
    </section>
  );
}
