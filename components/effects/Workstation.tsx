"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import { BRUSHED_ALUMINIUM, MICRO_GRAIN } from "@/lib/textures";

/**
 * A laptop, built as a real object in a `preserve-3d` scene.
 *
 * WHY NOT WEBGL — the honest version. React Three Fiber with a PBR aluminium
 * material and an HDRI environment would produce better metal than this file
 * can, and drei's `<Html transform>` renders live DOM in 3D, so the old
 * objection (the display has to stay crisp through the camera push) is
 * actually solvable. It is still the wrong call HERE: three plus R3F plus an
 * environment map plus a model is roughly 400kb on the critical path of the
 * first element on the page, against a brief that also demands no lag on a
 * mid-range phone — and a literal MacBook model carries trade-dress risk that
 * a portfolio should not take on. So the constraint is real and the trade-off
 * is stated rather than hidden.
 *
 * WHAT ACTUALLY MADE IT READ AS AN ILLUSTRATION, and what each fix was:
 *
 *   a. It was DEAD-ON SYMMETRIC. Product photography essentially never is.
 *      A face-on rectangle is a diagram of a laptop. Fixed by yawing the whole
 *      scene ~17deg on arrival — and then orbiting back to face-on as the
 *      camera pushes in, so the push has a camera MOVE in it rather than just
 *      a zoom.
 *   b. It FLOATED IN A VOID. Real objects sit on something and are lit by it.
 *      Fixed with a desk plane, a horizon, and the machine's own light
 *      spilling onto it.
 *   c. The ALUMINIUM WAS PERFECTLY SMOOTH. Real metal has directional grain.
 *      Fixed with a baked anisotropic noise texture (see `lib/textures.ts`) —
 *      real `feTurbulence`, rasterised once, streaked along x.
 *   d. NOTHING REFLECTED ANYTHING. A lid and a dark panel both mirror the
 *      room. Fixed with an environment layer on the shell and a window
 *      reflection in the glass.
 *   e. The SEAMS HAD NO OCCLUSION. Fixed by darkening every junction.
 *
 * WHAT MAKES METAL LOOK REAL, in the order it matters:
 *
 *   1. Silhouette. A laptop is a WEDGE — the deck tapers toward the viewer and
 *      the front lip is thin. A rectangle rotated on X is a monitor on a stand.
 *   2. The chamfer. One bright diamond-cut line, offset from the body and
 *      brightest where the surface faces the light. It is the single most
 *      recognisable cue in this class of product.
 *   3. A specular BAND, not a linear ramp. Brushed aluminium has a tight bright
 *      zone where the normal faces the light, falling off both ways. A two-stop
 *      gradient always reads as plastic.
 *   4. A hinge barrel — a visible cylinder, darker than both surfaces it joins.
 *      Without it the lid looks glued on.
 *   5. Glass. A powered-off panel reflects the room; it is never a flat fill.
 *   6. Two shadows, not one: a tight contact shadow that sells contact, and a
 *      wide soft occlusion that sells mass. One blurred ellipse reads as a
 *      sticker.
 *   7. The deck is not a flat slab. Seen at a grazing angle it is dark in the
 *      lid's shadow, brightens across the palm rest where the surface turns
 *      toward the light, and darkens again into the front lip. Three zones,
 *      not one fill.
 *   8. A keyboard is recognisable by its ROW STRUCTURE long before any legend
 *      is legible: a short function row, four full rows, and a bottom row
 *      dominated by one very wide key. Fourteen identical bars read as a
 *      grille; these proportions read as a keyboard at 6px per row.
 */

/**
 * Keycap layout, as flex weights.
 *
 * `h` is the row's height relative to a full row — the function row is
 * genuinely shorter on this class of machine, and that difference is most of
 * why the block reads as a keyboard. Each number is one key's width relative
 * to a letter key, so the wide keys (tab, caps, return, shift, space) land
 * where a reader expects them without a single glyph being drawn.
 */
const KEY_ROWS: { h: number; keys: number[] }[] = [
  { h: 0.66, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { h: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7] },
  { h: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2] },
  { h: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.95] },
  { h: 1, keys: [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5] },
  { h: 1, keys: [1, 1, 1.25, 1.3, 6.1, 1.3, 1.25, 1, 1] },
];

/**
 * Lid thickness, in px.
 *
 * Deliberately NOT a percentage: `translateZ()` rejects percentage lengths
 * outright, and an invalid function drops the ENTIRE transform — which is why
 * the first version of the edge rendered flat against the lid's face instead of
 * standing perpendicular to it. A fixed 10px is about right at both the
 * desktop width and the phone width.
 */
const LID_EDGE = 10;

/**
 * Three constraints, because the machine is bounded in three ways: the size it
 * wants to be, the width of a phone, and — the one that has to be solved
 * rather than guessed — the height left under the headline. See the note at
 * the camera for the derivation of the 1.152.
 */
const MACHINE_WIDTH =
  "min(44rem, 92vw, max(18rem, calc((100vh - 24rem) * 1.152)))";

export function Workstation({
  open,
  wake,
  yaw,
  children,
}: {
  open: MotionValue<number>;
  wake: MotionValue<number>;
  /**
   * Camera azimuth in degrees. The scene arrives off-axis and orbits to
   * face-on; pass a static 0 for a straight-on frame.
   */
  yaw?: MotionValue<number>;
  children: React.ReactNode;
}) {
  // -92deg is shut against the deck; -2deg is open and very slightly reclined,
  // which reads more natural than a perfectly square lid.
  const lidRotate = useTransform(open, [0, 1], [-92, -2]);
  const screenGlow = useTransform(wake, [0, 1], [0, 1]);
  const contact = useTransform(open, [0, 1], [0.9, 0.55]);

  /*
    The glass layers, declared here rather than inline in the JSX so the hook
    calls sit at the top level of the component where they belong.

    All three fade as the panel lights up. A powered display outshines whatever
    it is reflecting, so the room disappears from it — the coating haze thins,
    the drifting wash drops back, and the window highlight goes entirely. That
    transition is itself a realism cue: it is what you watch happen when you
    wake a real screen in a lit room.
  */
  /*
    These values are small on purpose, and the first attempt proves why: at 0.5
    the anti-glare grain turned a black panel into a field of grey static. A
    coating you can consciously SEE is dirt. The whole effect of a real matte
    display is that it takes the hardness off a reflection — a few percent is
    the entire budget.
  */
  const coatingHaze = useTransform(screenGlow, [0, 1], [0.075, 0.02]);
  const roomWash = useTransform(screenGlow, [0, 1], [1, 0.25]);
  const windowGlint = useTransform(screenGlow, [0, 1], [1, 0]);

  return (
    /*
      TWO nested containers, because the SCENE and the DEVICE are different
      things. The outer one owns the width and holds the desk; only the inner
      one carries the camera. The first version put the desk inside the
      rotating element, so the "floor" yawed with the machine and read as a
      slab levitating behind it — a desk that turns when the camera turns is
      not a desk.
    */
    <div
      className="relative"
      style={{
        width: MACHINE_WIDTH,
        /*
          THE CAMERA LIVES HERE, not on an ancestor.

          It used to be inherited from a wrapper in the intro, and that wrapper
          is sized by the LID alone — the deck is absolutely positioned and
          contributes no height. So `perspective-origin: 50% 50%` landed well
          above the machine's true visual centre, and viewing a yawed object
          from an off-axis origin keystones it asymmetrically: the deck sheared
          into a wedge and the whole machine read as ROLLED rather than turned.

          Owning the camera means the origin can be stated against the object
          it is actually looking at. 58% is the visual centre once the deck's
          projected depth is counted.
        */
        /*
          A LONG LENS. This is the single most important number in the file.

          `perspective` is focal length: a small value is a wide angle, which
          exaggerates convergence and makes a yawed object splay and appear to
          roll. At 2400px against a ~700px machine the near corner ballooned
          and the lid's top edge sloped hard enough to read as the thing
          falling over.

          Every product photograph of a laptop you have ever seen was taken on
          a long lens for exactly this reason: it compresses depth, keeps
          parallel edges nearly parallel, and lets a 3/4 view read as a turn
          rather than as a distortion. 5200px is that lens. The yaw still
          reads — it just no longer keystones.
        */
        perspective: "5200px",
        perspectiveOrigin: "50% 54%",
      }}
    >
      {/* ── The desk ───────────────────────────────────────────────────
          The machine used to float in a void, which is most of why it read as
          an illustration: a real object is lit BY its surroundings and puts
          light back into them.

          A faked plane rather than a rotated one — at this camera elevation a
          true `rotateX(90deg)` surface and a vertical gradient are
          indistinguishable, and the fake costs no extra 3D context and no
          z-fighting with the deck. Radial, not linear: the first version was a
          linear gradient on a wide box, which faded downward and stopped dead
          at its left and right edges, putting two hard vertical seams either
          side of the machine. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-46%] top-[126%] -z-20 h-[24rem]"
        style={{
          background:
            "radial-gradient(58% 100% at 50% 0%, var(--desk-near), var(--desk-far) 42%, transparent 76%)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-20%] top-[126%] -z-20 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--desk-horizon) 26%, var(--desk-horizon) 74%, transparent)",
        }}
      />
      {/* What the display throws down onto the desk. Grows with `wake`,
          because before the screen is on there is nothing to spill. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[132%] -z-10 h-[12rem] w-[80%] -translate-x-1/2 rounded-[50%] blur-[56px]"
        style={{
          opacity: screenGlow,
          background:
            "radial-gradient(closest-side, rgba(96,140,255,0.26), rgba(150,110,255,0.10) 54%, transparent 78%)",
        }}
      />

    <motion.div
      className="relative w-full"
      style={{
        rotateY: yaw,
        /*
          Three constraints, because the machine is bounded in three ways.

          44rem  — the size it wants to be.
          92vw   — so it still commands a phone screen. A laptop rendered at
                   70% of a 390px viewport reads as a thumbnail, and the whole
                   opening beat depends on it reading as a machine.
          height — so it fits UNDER the headline.

          That last one has to be solved, not guessed at. The machine is
          centred in the full viewport while the copy is pinned near the top,
          so a plain `Nvh` cap does not converge: shrinking a centred object
          moves its top edge DOWN by only half of what you took off, and at
          1280x720 every value I tried still collided. The scene is about
          0.868x its own width tall (lid 0.663, plus the deck's 0.62 depth
          projected at 0.5), so the width that exactly fills a given height is
          height x 1.152. Reserving 24rem for the nav, the two-line headline,
          the scroll hint and the margins between them makes the whole thing
          one expression — and `max(18rem, ...)` stops it collapsing on a
          landscape phone, where the reserve is most of the screen.

          It lives on the OUTER container now (see MACHINE_WIDTH); this one
          inherits it.
        */
        transformStyle: "preserve-3d",
        /*
          Camera elevation, as a transform PROPERTY rather than a `transform`
          string — a raw string would clobber the `rotateY` above, since Framer
          composes the individual properties into one matrix and a literal
          `transform` wins outright.

          At 9deg the deck projected to ~14% of the lid's height, which is
          physically right for a straight-on shot and useless for a
          composition: every material decision below the hinge was invisible.
          14deg costs the display almost nothing (it sits at -2deg, so
          cos(16°) ≈ 0.96) and returns about a quarter more deck. That
          asymmetry is why product photography looks down at these machines.
        */
        rotateX: 14,
      }}
    >
      {/* ── Grounding ──────────────────────────────────────────────────
          Both sit at the deck's FRONT lip, not under the lid — that is where
          the machine actually touches the desk. The tight one sells contact,
          the wide one sells mass. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[150%] h-[3rem] w-[64%] -translate-x-1/2 rounded-[50%] blur-lg"
        style={{
          background: "radial-gradient(closest-side, rgba(0,0,0,0.92), transparent 70%)",
          opacity: contact,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[142%] h-[9rem] w-[108%] -translate-x-1/2 rounded-[50%] blur-[52px]"
        style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.6), transparent 72%)" }}
      />

      {/* The light the display throws into the room. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[155%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]"
        style={{
          opacity: screenGlow,
          background:
            "radial-gradient(closest-side, rgba(96,140,255,0.34), rgba(150,110,255,0.16) 52%, transparent 76%)",
        }}
      />

      {/* ── Lid ──────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative origin-bottom"
        style={{
          rotateX: lidRotate,
          transformStyle: "preserve-3d",
          aspectRatio: "16 / 10.6",
        }}
      >
        {/* The lid's THICKNESS. Invisible face-on and unmissable the moment
            the scene yaws — a lid with no edge reads as a cutout rather than
            an object. Pushed back half its own depth and rotated to stand
            perpendicular to the shell, so it is a real face in the 3D scene
            rather than a stripe painted on the front. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-[1%] left-0 rounded-l-[1.05rem]"
          style={{
            width: `${LID_EDGE}px`,
            background:
              "linear-gradient(90deg, rgba(18,22,34,0.95), rgba(74,84,110,0.55) 62%, rgba(120,132,164,0.4))",
            transform: `translateZ(-${LID_EDGE}px) rotateY(-90deg)`,
            transformOrigin: "left center",
          }}
        />

        <div
          className="absolute inset-0 rounded-[1.05rem]"
          style={{
            background: "var(--device-shell)",
            boxShadow: "0 26px 60px -30px rgba(0,0,0,0.9)",
          }}
        >
          {/* Brushed grain. Real `feTurbulence` streaked along x, baked to a
              data URI so it costs one rasterisation instead of a live filter —
              see `lib/textures.ts`. Very low opacity on purpose: at anything
              you can consciously see it reads as dirt, and at this level it
              reads as machining. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.05rem]"
            style={{
              backgroundImage: BRUSHED_ALUMINIUM,
              backgroundSize: "220px 160px",
              opacity: 0.055,
            }}
          />

          {/* The room, reflected. Aluminium is a mirror with the contrast
              turned down: a broad window highlight where the surface faces the
              light, and a dimmer bounce off the desk lower down. Without this
              the shell is a gradient; with it, it is a surface with something
              in front of it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.05rem]"
            style={{
              background:
                "radial-gradient(120% 70% at 18% -8%, rgba(226,238,255,0.16), transparent 58%)," +
                "radial-gradient(90% 50% at 82% 108%, rgba(150,176,232,0.09), transparent 62%)",
            }}
          />

          {/* Chamfer — brightest along the top and upper sides, gone by the
              bottom, exactly as a bevel behaves under a light above and in
              front of it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.05rem]"
            style={{
              padding: "1px",
              background:
                "linear-gradient(168deg, var(--device-chamfer) 0%, rgba(255,255,255,0.26) 16%, rgba(255,255,255,0.05) 46%, transparent 78%)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          />

          {/* Bezel */}
          <div
            className="absolute inset-[0.85%] overflow-hidden rounded-[0.78rem]"
            style={{
              background:
                "linear-gradient(168deg, #14182a 0%, #0a0d18 40%, #06080f 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(0,0,0,0.7), inset 0 1px 2px rgba(0,0,0,0.9)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[0.8%] z-20 h-[0.26rem] w-[0.26rem] -translate-x-1/2 rounded-full"
              style={{ background: "rgba(255,255,255,0.16)" }}
            />

            {/* Display */}
            <motion.div
              className="absolute inset-[1.5%_1.1%_2.4%] overflow-hidden rounded-[0.34rem]"
              style={{ opacity: screenGlow }}
            >
              {children}
            </motion.div>

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: screenGlow,
                background:
                  "radial-gradient(130% 90% at 50% 100%, rgba(120,160,255,0.26), transparent 62%)",
              }}
            />

            {/*
              GLASS. This is the layer that decides whether the panel reads as
              a screen or as a hole cut in the lid.

              Three things stacked, in the order a real display shows them:

              1. The ANTI-GLARE COATING — a fine isotropic grain over the whole
                 panel. It is what makes a matte display matte, and it is why a
                 reflection in one is soft-edged rather than mirror-sharp.
              2. The ROOM — a soft off-axis wash, drifting. Broad, low
                 contrast, no shape.
              3. A WINDOW. The specific thing your eye looks for. Real
                 reflections have EDGES and a source: a bright quadrilateral,
                 skewed by the panel's angle, with a soft falloff. Only a few
                 percent opacity, but it is the difference between "dark
                 surface" and "glass with a room in front of it".

              All of it fades out as the display wakes, because a lit panel
              overwhelms its own reflections — which is exactly what happens
              when you turn a real screen on.
            */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: coatingHaze,
                backgroundImage: MICRO_GRAIN,
                backgroundSize: "120px 120px",
              }}
            />
            <motion.span
              aria-hidden="true"
              className="anim-spec pointer-events-none absolute inset-[-12%]"
              style={{
                opacity: roomWash,
                background:
                  "linear-gradient(118deg, rgba(214,228,255,0.15) 0%, rgba(190,208,245,0.055) 16%, transparent 38%, transparent 62%, rgba(190,208,245,0.035) 84%, rgba(214,228,255,0.075) 100%)",
              }}
            />
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-[6%] top-[8%] h-[46%] w-[34%]"
              style={{
                opacity: windowGlint,
                background:
                  "linear-gradient(105deg, rgba(198,220,255,0.085), rgba(198,220,255,0.03) 62%, transparent)",
                transform: "skewX(-14deg) skewY(3deg)",
                filter: "blur(6px)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Hinge barrel ─────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[13%] top-[99.4%] h-[1.4%] rounded-b-[0.2rem]"
        style={{
          background: "linear-gradient(180deg, #2c3145 0%, #171a26 46%, #0d1018 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      />

      {/* ── Deck ─────────────────────────────────────────────────────────
          Tapered toward the viewer — that taper is the wedge. `rotateX(-74deg)`
          projects ~28% of its height, enough to carry a keyboard well, a
          trackpad and a front lip. */}
      <div
        className="absolute left-0 top-full w-full origin-top"
        style={{
          /*
            Deck DEPTH, not deck height-on-screen. On a real 14" machine the
            deck is roughly nine tenths as deep as the lid is tall; at 36% the
            proportions were those of a tablet keyboard cover, and the whole
            surface projected into a sliver too thin to carry a keyboard. 62%
            with the camera at 14deg lands the front lip where product
            photography puts it, and gives every material below the hinge room
            to be seen.
          */
          height: "62%",
          transform: "rotateX(-74deg)",
          transformStyle: "preserve-3d",
          background: "var(--device-base)",
          clipPath: "polygon(0 0, 100% 0, 98.6% 100%, 1.4% 100%)",
          boxShadow: "0 30px 56px -22px rgba(0,0,0,0.85)",
        }}
      >
        {/*
          Deck lighting, in three zones.

          A flat fill is the single biggest tell that a deck was drawn rather
          than photographed. Under a light above and in front of the machine the
          strip behind the keyboard sits in the lid's shadow, the palm rest
          turns toward the light and takes a broad soft sheen, and the surface
          rolls away again into the front lip. Painting those three zones is
          what turns the slab into a surface.
        */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.30) 9%, rgba(0,0,0,0) 22%, rgba(255,255,255,0.055) 62%, rgba(255,255,255,0.085) 82%, rgba(0,0,0,0.28) 100%)",
          }}
        />
        {/* The palm rest catches the light broadest at the centre. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[52%]"
          style={{
            background:
              "radial-gradient(70% 120% at 50% 100%, rgba(232,240,255,0.13), transparent 70%)",
          }}
        />
        {/* Same machining as the lid. The deck is the surface a reader looks
            at longest, so it is the one where smooth metal is most obviously
            wrong. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: BRUSHED_ALUMINIUM,
            backgroundSize: "220px 160px",
            opacity: 0.07,
          }}
        />

        {/* Front-lip chamfer — a diamond-cut edge, so it fades out toward the
            corners where the surface turns away from the light. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[2%] bottom-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--device-chamfer) 18%, var(--device-chamfer) 82%, transparent)",
            opacity: 0.5,
          }}
        />
        {/* The lip has thickness: a dark line immediately under the chamfer. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-[2%] bottom-0 h-[4%]"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5), transparent)" }}
        />

        {/* Finger recess — the notch at the front edge you lift the lid by. One
            small asymmetry, and a very specific one. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[9%] w-[15%] -translate-x-1/2 rounded-t-[50%]"
          style={{
            background:
              "radial-gradient(100% 140% at 50% 100%, rgba(0,0,0,0.5), transparent 72%)",
          }}
        />

        {/* Speaker grilles, either side of the keyboard. Perforations at this
            scale read as texture rather than as holes, which is exactly what
            they do at this distance on the real thing. */}
        {(["left", "right"] as const).map((side) => (
          <span
            key={side}
            aria-hidden="true"
            className="absolute top-[7%] h-[46%] w-[6.4%] rounded-[0.12rem]"
            style={{
              [side]: "2.4%",
              background:
                "radial-gradient(circle, rgba(0,0,0,0.78) 34%, transparent 36%)",
              backgroundSize: "0.19rem 0.19rem",
              boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.05)",
            } as React.CSSProperties}
          />
        ))}

        {/* Keyboard well */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[11.5%] top-[6%] h-[47%] rounded-[0.22rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,3,7,0.72), rgba(6,8,15,0.55))",
            boxShadow:
              "inset 0 1.5px 3px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.1), 0 -0.5px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/*
            Individual keycaps.

            Seen from this angle you are mostly looking at each cap's top edge
            catching the light and its front face falling into shadow — hence
            the vertical gradient per key rather than a flat fill. Row heights
            and key widths come from KEY_ROWS, so the block reads as a keyboard
            even when a row is only a few pixels tall.
          */}
          {/*
            Separation is drawn INSIDE each cap, not as flex gap.

            A 0.7% gap between fourteen keys resolves to about a third of a
            pixel at this projected size, and a sub-pixel gap between two
            similar fills is no gap at all — the row composited into one
            continuous bar and the block read as a speaker grille. An inset
            hairline on each cap's right and bottom edge cannot collapse: it is
            part of the cap's own paint, so the lattice survives at any scale
            and through the camera push. The top highlight is the light
            catching the cap's leading edge, which is most of what you actually
            see of a keyboard from a low angle.
          */}
          <div className="flex h-full flex-col px-[0.8%] py-[2.4%]">
            {KEY_ROWS.map((row, r) => (
              <span key={r} className="flex" style={{ flex: row.h }}>
                {row.keys.map((w, k) => (
                  <span
                    key={k}
                    className="block"
                    style={{
                      flex: w,
                      background:
                        "linear-gradient(180deg, rgba(216,228,254,0.32) 0%, rgba(148,160,196,0.15) 38%, rgba(56,64,88,0.15) 80%, rgba(20,24,36,0.2) 100%)",
                      boxShadow:
                        "inset -0.6px 0 0 rgba(0,0,0,0.85), inset 0 -0.6px 0 rgba(0,0,0,0.72), inset 0 0.6px 0 rgba(255,255,255,0.16)",
                    }}
                  />
                ))}
              </span>
            ))}
          </div>
        </div>

        {/*
          Trackpad.

          It is NOT a lighter rectangle. A trackpad is glass sitting flush in
          the same aluminium, so it is very nearly the colour of the deck —
          what identifies it is a dark hairline SEAM around a machined cutout,
          a bright chamfer on the near lip of that cutout, and a slightly
          different reflection because glass is smoother than brushed metal.
          Painting it brighter than its surroundings is what made it read as a
          sticker.
        */}
        <span
          aria-hidden="true"
          className="absolute bottom-[6%] left-1/2 h-[31%] w-[41%] -translate-x-1/2 rounded-[0.2rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(226,236,255,0.05) 0%, rgba(140,152,186,0.03) 55%, rgba(226,236,255,0.045) 100%)",
            boxShadow:
              "inset 0 0 0 0.8px rgba(0,0,0,0.34), inset 0 1px 1.5px rgba(0,0,0,0.3), 0 0.6px 0 rgba(255,255,255,0.16)",
          }}
        />

        {/* Power indicator — the one thing that moves before the screen does. */}
        <span
          aria-hidden="true"
          className="anim-pulse absolute bottom-[6%] left-[4.2%] h-[4.5%] w-[0.9%] rounded-full"
          style={{ background: "var(--status-live)", animationDuration: "3.8s" }}
        />
      </div>
    </motion.div>
    </div>
  );
}
