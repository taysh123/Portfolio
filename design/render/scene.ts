/**
 * The arrival workspace, as an OFFLINE render scene.
 *
 * This file is the asset pipeline, not shipped code. `design/render/studio`
 * mounts it in a headless browser, renders at 4K with settings that would be
 * absurd at runtime, and writes out a still. The still is what the site loads.
 *
 * WHY RENDER IT OURSELVES rather than license one. Three reasons, in order:
 *
 *   1. Art direction. The written brief asks for walnut, matte black, brushed
 *      aluminium, one key light and no RGB. A stock render is whatever someone
 *      else decided, and the supplied reference image happens to contradict the
 *      brief it was sent to illustrate (see design/references/README.md).
 *      Owning the scene means the scene obeys the brief.
 *   2. Licensing. Nothing to verify, attribute or re-verify later.
 *   3. Reproducibility. The asset is generated from code that is committed, so
 *      "re-render it slightly warmer" is a diff rather than a procurement.
 *
 * WHY IT CAN LOOK BETTER THAN THE RUNTIME SPIKE. Nothing here is on a frame
 * budget. It renders once, at 3840x2400, with a large PMREM environment, 4096px
 * shadow maps and soft shadows, then downsamples 2.4x — which is free
 * supersampling and the single biggest quality win available. The earlier
 * real-time experiment had to fit 16ms; this has to fit "once, ever".
 *
 * EVERY GEOMETRY IS PROCEDURAL. No downloaded models, so no trade dress and no
 * licence surface. Rounded boxes and cylinders get further than people expect
 * when the lighting is doing the work.
 */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Scene units are centimetres. A 34" ultrawide is ~80cm across. */
export const RENDER_W = 3840;
export const RENDER_H = 2400;

/** The primary monitor's active screen area, in scene units. */
const SCREEN_W = 74;
const SCREEN_H = 32;

export type SceneHandles = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** World-space corners of the primary screen, TL/TR/BR/BL. */
  screenCorners: THREE.Vector3[];
};

/* ── Materials ─────────────────────────────────────────────────────────── */

/**
 * Walnut, generated rather than textured.
 *
 * Wood is the one surface here where a flat colour reads as plastic instantly,
 * because grain is what the eye uses to identify it. A canvas of stretched
 * bands with per-band jitter is enough at this scale — the desk is a
 * foreground plane that goes out of frame within the first third of the
 * scroll, so it needs to read as wood, not survive a close-up.
 */
function walnutTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d")!;
  // Dark walnut. The first render came out pink because this base was too
  // light for a 2.6-intensity warm key at 0.9 exposure — wood is the surface
  // that shows over-exposure first, because we all know what it should look
  // like.
  g.fillStyle = "#241a12";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 1024;
    const h = 1 + Math.random() * 5;
    const shade = 14 + Math.random() * 18;
    g.fillStyle = `rgba(${shade + 30},${shade + 16},${shade + 6},${0.10 + Math.random() * 0.16})`;
    g.beginPath();
    // A slight sine warp stops the grain reading as printed stripes.
    for (let x = 0; x <= 1024; x += 16) {
      const wy = y + Math.sin((x / 1024) * Math.PI * 2 + i) * 6;
      if (x === 0) g.moveTo(x, wy);
      else g.lineTo(x, wy);
    }
    g.lineTo(1024, y + h);
    g.lineTo(0, y + h);
    g.closePath();
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function materials() {
  return {
    walnut: new THREE.MeshPhysicalMaterial({
      map: walnutTexture(),
      roughness: 0.62,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.5,
    }),
    // Matte black for every enclosure. Low metalness on purpose: anodised
    // black plastic and painted metal both read matte, and a shiny black body
    // is the "gaming" cue the brief rules out.
    matte: new THREE.MeshPhysicalMaterial({
      color: 0x14161a,
      roughness: 0.66,
      metalness: 0.12,
      envMapIntensity: 0.42,
    }),
    // Brushed aluminium for arms and stands — the one place metal belongs.
    alu: new THREE.MeshPhysicalMaterial({
      color: 0x9aa0aa,
      roughness: 0.38,
      metalness: 0.92,
      envMapIntensity: 0.7,
    }),
    keycap: new THREE.MeshPhysicalMaterial({
      color: 0x1b1e24,
      roughness: 0.52,
      metalness: 0.05,
      envMapIntensity: 0.35,
    }),
    ceramic: new THREE.MeshPhysicalMaterial({
      color: 0x22262c,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.8,
      envMapIntensity: 0.8,
    }),
    // A dark notebook, not a white one. At 0xd8d4cb it was the brightest
    // object in a low-key scene and pulled the eye straight off the monitor —
    // the one thing the composition exists to point at. Everything on this
    // desk has to be darker than the screen.
    paper: new THREE.MeshPhysicalMaterial({
      color: 0x24272e,
      roughness: 0.82,
      metalness: 0.0,
      envMapIntensity: 0.3,
    }),
    // The screen surface is a placeholder: the real portfolio is live DOM laid
    // over this quad at runtime. It renders near-black so that if the DOM ever
    // fails to mount, the result is a switched-off monitor rather than a hole.
    screen: new THREE.MeshBasicMaterial({ color: 0x05070c }),
  };
}

/* ── Objects ───────────────────────────────────────────────────────────── */

function makeMonitor(
  m: ReturnType<typeof materials>,
  w: number,
  h: number,
  withScreen: boolean,
) {
  const g = new THREE.Group();
  const bezel = 1.1;

  const body = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, 1.6, 4, 0.5),
    m.matte,
  );
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(w - bezel * 2, h - bezel * 2),
    withScreen ? m.screen : m.matte,
  );
  panel.position.z = 0.81;
  g.add(panel);

  // Neck + foot. A monitor floating with no support is the fastest way to
  // make a render read as a mock-up.
  const neck = new THREE.Mesh(
    new RoundedBoxGeometry(3.4, h * 0.42, 2.2, 3, 0.4),
    m.alu,
  );
  neck.position.set(0, -h / 2 - h * 0.16, -1.2);
  neck.castShadow = true;
  g.add(neck);

  const foot = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.34, 1.1, 16, 3, 0.4),
    m.alu,
  );
  foot.position.set(0, -h / 2 - h * 0.36, 2);
  foot.castShadow = true;
  foot.receiveShadow = true;
  g.add(foot);

  return { group: g, panel };
}

function makeKeyboard(m: ReturnType<typeof materials>) {
  const g = new THREE.Group();
  const W = 44;
  const D = 15;

  const base = new THREE.Mesh(new RoundedBoxGeometry(W, 1.9, D, 3, 0.4), m.matte);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Real row structure — a keyboard is recognised by its proportions long
  // before any legend is legible.
  const ROWS = [
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.95],
    [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5],
    [1.25, 1.25, 1.4, 6.6, 1.4, 1.25, 1.25],
  ];
  const kbW = W - 3;
  const kbD = D - 2.6;
  const rowD = kbD / ROWS.length;
  const caps = new THREE.InstancedMesh(
    new RoundedBoxGeometry(1, 1, 1, 2, 0.16),
    m.keycap,
    ROWS.reduce((n, r) => n + r.length, 0),
  );
  caps.castShadow = true;
  const mtx = new THREE.Matrix4();
  let i = 0;
  ROWS.forEach((row, r) => {
    const units = row.reduce((a, b) => a + b, 0);
    let x = 0;
    for (const u of row) {
      const kw = (u / units) * kbW;
      mtx.makeScale(kw - 0.32, 0.85, rowD - 0.32);
      mtx.setPosition(-kbW / 2 + x + kw / 2, 1.3, -kbD / 2 + r * rowD + rowD / 2);
      caps.setMatrixAt(i++, mtx);
      x += kw;
    }
  });
  caps.instanceMatrix.needsUpdate = true;
  g.add(caps);

  return g;
}

function makeHeadphones(m: ReturnType<typeof materials>) {
  const g = new THREE.Group();

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 22, 20),
    m.alu,
  );
  post.position.y = 11;
  post.castShadow = true;
  g.add(post);

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.4, 1, 32), m.matte);
  foot.position.y = 0.5;
  foot.castShadow = true;
  foot.receiveShadow = true;
  g.add(foot);

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(7.2, 0.9, 12, 40, Math.PI),
    m.matte,
  );
  band.position.y = 21;
  band.castShadow = true;
  g.add(band);

  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.6, 2.6, 28),
      m.matte,
    );
    cup.rotation.z = Math.PI / 2;
    cup.position.set(s * 7.2, 20.6, 0);
    cup.castShadow = true;
    g.add(cup);
  }
  return g;
}

/* ── Scene ─────────────────────────────────────────────────────────────── */

export function buildScene(canvas: HTMLCanvasElement): SceneHandles {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(RENDER_W, RENDER_H, false);
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.72;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const m = materials();

  /* ── Backdrop ──────────────────────────────────────────────────────────
     A wall, lit by falloff rather than by a texture.

     Without it every object was silhouetted against pure black, which reads as
     "cut out and pasted" rather than "photographed in a room" — a product shot
     always has something behind the product, even when it is nearly invisible.
     The gradient is the key light falling off across the wall, which also
     gives the monitors an edge to separate from. */
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 300),
    new THREE.MeshPhysicalMaterial({
      color: 0x14161d,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.25,
    }),
  );
  wall.position.set(0, 80, -120);
  wall.receiveShadow = true;
  scene.add(wall);

  // ── Desk ──────────────────────────────────────────────────────────────
  const desk = new THREE.Mesh(new RoundedBoxGeometry(240, 4, 96, 3, 1.2), m.walnut);
  desk.position.set(0, -2, 0);
  desk.receiveShadow = true;
  scene.add(desk);

  // ── Monitors ──────────────────────────────────────────────────────────
  const primary = makeMonitor(m, SCREEN_W + 2.2, SCREEN_H + 2.2, true);
  primary.group.position.set(2, 26, -22);
  scene.add(primary.group);

  const secondary = makeMonitor(m, 46, 29, false);
  secondary.group.position.set(-62, 23, -14);
  secondary.group.rotation.y = 0.42;
  scene.add(secondary.group);

  // A dark emissive plane on the secondary, so it reads as ON without needing
  // legible content — the engineering surfaces live on the primary's DOM.
  const secPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(43.6, 26.6),
    new THREE.MeshBasicMaterial({ color: 0x0d1524 }),
  );
  secPanel.position.copy(secondary.group.position);
  secPanel.position.z += 0.85 * Math.cos(0.42);
  secPanel.position.x += 0.85 * Math.sin(0.42);
  secPanel.rotation.y = 0.42;
  scene.add(secPanel);

  // ── Desk objects ──────────────────────────────────────────────────────
  const mat = new THREE.Mesh(new RoundedBoxGeometry(76, 0.4, 34, 2, 0.6), m.matte);
  mat.position.set(2, 0.2, 22);
  mat.receiveShadow = true;
  scene.add(mat);

  const kb = makeKeyboard(m);
  kb.position.set(-2, 1.2, 20);
  scene.add(kb);

  const mouse = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), m.matte);
  mouse.scale.set(1, 0.52, 1.5);
  mouse.position.set(34, 1.9, 20);
  mouse.castShadow = true;
  scene.add(mouse);

  const phones = makeHeadphones(m);
  phones.position.set(66, 0, 6);
  scene.add(phones);

  const mug = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 3.9, 9.5, 32), m.ceramic);
  mug.position.set(52, 4.7, 26);
  mug.castShadow = true;
  scene.add(mug);

  const notebook = new THREE.Mesh(new RoundedBoxGeometry(30, 1.6, 21, 2, 0.4), m.paper);
  notebook.position.set(-58, 0.8, 26);
  notebook.rotation.y = -0.22;
  notebook.castShadow = true;
  notebook.receiveShadow = true;
  scene.add(notebook);

  /* ── Lighting ────────────────────────────────────────────────────────
     One key, one rim, one ambient bounce, plus the monitors' own emission.
     No coloured practicals — the brief rules out RGB, and a scene lit by one
     directional source with a cool rim is the register that reads as product
     photography rather than as a desk setup. */
  const key = new THREE.DirectionalLight(0xffeede, 1.35);
  key.position.set(-90, 120, 70);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.camera.near = 10;
  key.shadow.camera.far = 400;
  const s = 150;
  key.shadow.camera.left = -s;
  key.shadow.camera.right = s;
  key.shadow.camera.top = s;
  key.shadow.camera.bottom = -s;
  key.shadow.bias = -0.0008;
  key.shadow.radius = 4;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.85);
  rim.position.set(120, 60, -110);
  scene.add(rim);

  // The primary monitor's own light, spilling onto the desk in front of it.
  const glow = new THREE.RectAreaLight(0x8fb4ff, 5.5, SCREEN_W, SCREEN_H);
  glow.position.set(2, 26, -20);
  glow.lookAt(2, 8, 40);
  scene.add(glow);

  scene.add(new THREE.AmbientLight(0x222b42, 0.3));

  // ── Camera ────────────────────────────────────────────────────────────
  // A long lens, for the same reason as the laptop: it keeps parallel edges
  // parallel and stops the near desk edge ballooning.
  const camera = new THREE.PerspectiveCamera(30, RENDER_W / RENDER_H, 1, 1000);
  camera.position.set(4, 74, 196);
  camera.lookAt(2, 18, 2);

  /*
    The primary screen's corners, in world space.

    These are the whole point of the pipeline: the runtime composite maps a DOM
    surface onto exactly this quad, so the mapping is DERIVED from the scene
    rather than eyeballed against the image. If the scene moves, the corners
    move with it and the site picks up the new numbers.
  */
  const p = primary.group.position;
  const z = p.z + 0.81;
  const screenCorners = [
    new THREE.Vector3(p.x - SCREEN_W / 2, p.y + SCREEN_H / 2, z),
    new THREE.Vector3(p.x + SCREEN_W / 2, p.y + SCREEN_H / 2, z),
    new THREE.Vector3(p.x + SCREEN_W / 2, p.y - SCREEN_H / 2, z),
    new THREE.Vector3(p.x - SCREEN_W / 2, p.y - SCREEN_H / 2, z),
  ];

  return { renderer, scene, camera, screenCorners };
}

/** Project a world point to 0..1 image space. */
export function projectToImage(
  v: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
): { x: number; y: number } {
  const p = v.clone().project(camera);
  return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
}
