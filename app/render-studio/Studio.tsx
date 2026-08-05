"use client";

import { useEffect, useRef, useState } from "react";
import { buildScene, projectToImage, RENDER_W, RENDER_H } from "@/design/render/scene";

/**
 * Mounts the offline scene, renders one frame, and publishes the geometry the
 * runtime composite needs.
 *
 * ONE FRAME, not a loop. There is nothing animated here — the output is a
 * still, so a rAF loop would only burn a headless CPU while the capture script
 * waits. It renders, sets `data-render-ready`, and stops.
 */
export function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [corners, setCorners] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { renderer, scene, camera, screenCorners } = buildScene(canvas);
    renderer.render(scene, camera);

    // The projected quad, in 0..1 image space. The capture script writes this
    // next to the image so the runtime never has to guess where the screen is.
    const projected = screenCorners.map((v) => projectToImage(v, camera));
    setCorners(JSON.stringify(projected));

    // Announce readiness only after the frame is actually on the canvas.
    requestAnimationFrame(() => {
      document.documentElement.setAttribute("data-render-ready", "1");
    });

    return () => renderer.dispose();
  }, []);

  return (
    <div style={{ margin: 0, lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={RENDER_W}
        height={RENDER_H}
        data-render-canvas
        style={{ width: `${RENDER_W / 2}px`, height: `${RENDER_H / 2}px` }}
      />
      <span data-screen-corners={corners} hidden />
    </div>
  );
}
