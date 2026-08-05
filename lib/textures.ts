/**
 * Baked material textures, as data URIs.
 *
 * WHY BAKED. These are SVG filter outputs — `feTurbulence` is a real noise
 * function, not a gradient — but a live `filter:` on a DOM element is a
 * paint-time effect that re-rasterises whenever the element changes size. The
 * workstation scales 9x during the camera push, so a live filter would
 * re-rasterise the lid on every frame of the most expensive moment on the
 * page. Encoded as a data URI and used as a `background-image`, the browser
 * rasterises each of these exactly once and then treats it as any other
 * image: zero filter cost, and it tiles.
 */

const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`,
  )}")`;

/**
 * Brushed aluminium.
 *
 * The anisotropy is the whole point. `baseFrequency='0.82 0.014'` is high
 * along x and very low along y, which stretches the noise into fine horizontal
 * streaks — that directional grain is what your eye reads as "machined metal"
 * rather than "grey". Isotropic noise at the same amplitude just looks like
 * dirt.
 */
export const BRUSHED_ALUMINIUM = svg(
  `<filter id='b' x='0' y='0' width='100%' height='100%'>
     <feTurbulence type='fractalNoise' baseFrequency='0.82 0.014' numOctaves='2' seed='11' result='n'/>
     <feColorMatrix in='n' type='saturate' values='0'/>
   </filter>
   <rect width='100%' height='100%' filter='url(#b)'/>`,
  220,
  160,
);

/**
 * Fine isotropic grain, for surfaces that are moulded rather than machined —
 * the keyboard well, the display's anti-glare coating. Much finer than the
 * aluminium, and undirected.
 */
export const MICRO_GRAIN = svg(
  `<filter id='g' x='0' y='0' width='100%' height='100%'>
     <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='3' result='n'/>
     <feColorMatrix in='n' type='saturate' values='0'/>
   </filter>
   <rect width='100%' height='100%' filter='url(#g)'/>`,
  120,
  120,
);
