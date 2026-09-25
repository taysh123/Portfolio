# Optional True-3D Laptop Upgrade

The current opening scene uses CSS/DOM pseudo-3D on purpose. It is already scroll-driven and production friendly.

For a future WebGL upgrade:

- Install `three`, `@react-three/fiber`, `@react-three/drei`.
- Use a legally licensed generic laptop `.glb`, not an Apple-branded model unless licensing permits it.
- Keep GSAP ScrollTrigger as the source of scroll progress.
- Drive the laptop hinge rotation and camera position from the same normalized timeline.
- Render the portfolio boot content as a texture or `<Html transform>` layer.
- Lazy-load the canvas after initial HTML and provide the current DOM scene as fallback.
- Disable WebGL motion for reduced-motion and constrained devices.

Do not make the whole site a Canvas. Only the cinematic intro benefits enough from true 3D to justify the cost.
