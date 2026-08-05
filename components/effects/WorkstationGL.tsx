"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The workstation, rendered with real physically-based materials.
 *
 * WHY THIS EXISTS. Four passes of CSS got the machine from "diagram" to
 * "well-lit render" and then plateaued, because the thing still missing is the
 * one thing gradients cannot do: a metal surface reflecting an ENVIRONMENT.
 * A gradient is a guess about what a surface would reflect; an environment map
 * is the actual answer, evaluated per pixel against the surface normal. That
 * is most of what separates a product photograph from an illustration of one.
 *
 * TWO PROBLEMS THIS DELIBERATELY AVOIDS.
 *
 *   No model, no licence. The geometry is generated — rounded boxes and an
 *   instanced keycap field. A downloaded MacBook model would look better and
 *   would put someone else's trade dress in a personal portfolio.
 *
 *   No HDRI, no download. `RoomEnvironment` is three's own procedural studio:
 *   a room of emissive planes, rendered once through PMREMGenerator into a
 *   prefiltered cubemap. It costs a few kilobytes of code instead of a
 *   multi-megabyte image, and it is what puts real soft-box reflections along
 *   every chamfer.
 *
 * UNITS ARE CSS PIXELS. The camera is placed so that the projection matches a
 * CSS `perspective` of the same distance: `fov = 2*atan((h/2)/dist)`. That is
 * what allows the DOM screen to be laid over the rendered chassis and line up
 * — the two projections are the same projection.
 *
 * COST AND WHO PAYS IT. three is ~150kb gzipped, so this is dynamically
 * imported and only ever mounted on a pointer-capable viewport at `lg` and up,
 * after first paint. Phones, reduced motion and any browser without WebGL keep
 * the CSS machine, which remains the reference implementation rather than a
 * degraded fallback.
 */

const LID_W = 1.6;
const LID_H = 1.04;
const BODY_T = 0.038;
const DECK_D = 1.1;

export function WorkstationGL({
  className,
  yawDeg = 9,
  pitchDeg = 19,
}: {
  className?: string;
  yawDeg?: number;
  pitchDeg?: number;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — the CSS machine is already rendered underneath.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.62;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    /*
      The environment. Rendered ONCE into a prefiltered cubemap and then thrown
      away — the scene keeps only the resulting texture, so there is no ongoing
      cost per frame for what is doing most of the lighting work.
    */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene, 0.03).texture;
    scene.environment = envMap;
    pmrem.dispose();

    // ── Materials ────────────────────────────────────────────────────────
    // Anodised space black: high metalness, mid roughness. The roughness is
    // what turns the studio's soft boxes into broad sheens rather than mirrors.
    const anodised = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0d0f14),
      metalness: 0.78,
      roughness: 0.52,
      clearcoat: 0.18,
      clearcoatRoughness: 0.55,
      envMapIntensity: 0.42,
    });
    const wellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x08090d),
      metalness: 0.4,
      roughness: 0.78,
      envMapIntensity: 0.22,
    });
    const keyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x101218),
      metalness: 0.1,
      roughness: 0.62,
      envMapIntensity: 0.3,
    });
    // Glass over the display: the layer that catches the room.
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x05070c),
      metalness: 0.0,
      roughness: 0.08,
      transmission: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 0.85,
    });

    const machine = new THREE.Group();
    scene.add(machine);

    // ── Lid ──────────────────────────────────────────────────────────────
    const lid = new THREE.Group();
    const lidShell = new THREE.Mesh(
      new RoundedBoxGeometry(LID_W, LID_H, BODY_T, 6, 0.028),
      anodised,
    );
    lidShell.castShadow = true;
    lid.add(lidShell);

    // The panel, sitting just proud of the shell's front face.
    const panel = new THREE.Mesh(
      new RoundedBoxGeometry(LID_W - 0.03, LID_H - 0.03, 0.004, 4, 0.02),
      glassMat,
    );
    panel.position.z = BODY_T / 2 + 0.001;
    lid.add(panel);

    /*
      The lid hinges about its BOTTOM edge, so the group's origin is moved
      there. Rotating a lid about its centre swings the top backwards and the
      bottom forwards through the deck, which is the classic tell.
    */
    lid.position.y = LID_H / 2;
    lidShell.position.y = 0;
    panel.position.y = 0;
    const lidPivot = new THREE.Group();
    lidPivot.add(lid);
    lid.position.set(0, LID_H / 2, 0);
    machine.add(lidPivot);
    lidPivot.rotation.x = THREE.MathUtils.degToRad(-8); // slight recline

    // ── Deck ─────────────────────────────────────────────────────────────
    const deck = new THREE.Mesh(
      new RoundedBoxGeometry(LID_W, DECK_D, 0.05, 6, 0.022),
      anodised,
    );
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, -0.025, DECK_D / 2);
    deck.castShadow = true;
    deck.receiveShadow = true;
    machine.add(deck);

    // Keyboard well, recessed into the deck.
    const well = new THREE.Mesh(
      new RoundedBoxGeometry(LID_W * 0.78, DECK_D * 0.46, 0.02, 3, 0.008),
      wellMat,
    );
    well.rotation.x = -Math.PI / 2;
    well.position.set(0, -0.012, DECK_D * 0.3);
    machine.add(well);

    // ── Keycaps, instanced ───────────────────────────────────────────────
    const ROWS = [
      { h: 0.66, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { h: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7] },
      { h: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2] },
      { h: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.95] },
      { h: 1, keys: [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5] },
      { h: 1, keys: [1, 1, 1.25, 1.3, 6.1, 1.3, 1.25, 1, 1] },
    ];
    const total = ROWS.reduce((n, r) => n + r.keys.length, 0);
    const caps = new THREE.InstancedMesh(
      new RoundedBoxGeometry(1, 1, 1, 2, 0.18),
      keyMat,
      total,
    );
    caps.castShadow = true;

    const kbW = LID_W * 0.745;
    const kbD = DECK_D * 0.425;
    const rowUnits = ROWS.reduce((n, r) => n + r.h, 0);
    const gap = 0.006;
    const m = new THREE.Matrix4();
    let i = 0;
    let zCursor = 0;
    for (const row of ROWS) {
      const rowH = (row.h / rowUnits) * kbD;
      const units = row.keys.reduce((a, b) => a + b, 0);
      let xCursor = 0;
      for (const w of row.keys) {
        const keyW = (w / units) * kbW;
        m.makeScale(Math.max(keyW - gap, 0.004), 0.012, Math.max(rowH - gap, 0.004));
        m.setPosition(
          -kbW / 2 + xCursor + keyW / 2,
          -0.004,
          DECK_D * 0.3 - kbD / 2 + zCursor + rowH / 2,
        );
        caps.setMatrixAt(i++, m);
        xCursor += keyW;
      }
      zCursor += rowH;
    }
    caps.instanceMatrix.needsUpdate = true;
    machine.add(caps);

    // ── Trackpad ─────────────────────────────────────────────────────────
    const pad = new THREE.Mesh(
      new RoundedBoxGeometry(LID_W * 0.36, DECK_D * 0.26, 0.004, 3, 0.01),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0a0c11),
        metalness: 0.3,
        roughness: 0.22,
        envMapIntensity: 0.28,
      }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, -0.0005, DECK_D * 0.75);
    machine.add(pad);

    // ── Ground + key light ───────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.ShadowMaterial({ opacity: 0.55 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.052;
    ground.receiveShadow = true;
    scene.add(ground);

    const key = new THREE.DirectionalLight(0xdbe6ff, 3.4);
    key.position.set(-2.4, 3.2, 1.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    const s = 2.2;
    key.shadow.camera.left = -s;
    key.shadow.camera.right = s;
    key.shadow.camera.top = s;
    key.shadow.camera.bottom = -s;
    key.shadow.bias = -0.0012;
    scene.add(key);

    machine.rotation.y = THREE.MathUtils.degToRad(yawDeg);
    machine.rotation.x = THREE.MathUtils.degToRad(pitchDeg * 0.18);
    machine.position.z = -DECK_D / 2;

    // ── Camera ───────────────────────────────────────────────────────────
    const dist = 6.2;
    const el0 = THREE.MathUtils.degToRad(pitchDeg);
    camera.position.set(0, Math.sin(el0) * dist, Math.cos(el0) * dist);
    camera.lookAt(0, 0.16, 0);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    return () => {
      ro.disconnect();
      renderer.dispose();
      envMap.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [yawDeg, pitchDeg]);

  return <div ref={host} aria-hidden="true" className={className} />;
}
