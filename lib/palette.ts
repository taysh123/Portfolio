/**
 * Opening the command palette. The palette is a dynamic chunk (Providers), so a request made before it has
 * mounted — an early click on the nav's search button — would be an event nobody hears. The request is
 * therefore also recorded, and the palette consumes it when it mounts (found in Plan 2 Task 24).
 */
let pending = false;

export function requestPaletteOpen() {
  pending = true;
  window.dispatchEvent(new CustomEvent("palette:open"));
}

/** Whether an open was requested and not yet handled (read by the palette's initial state). */
export function paletteOpenRequested(): boolean { return pending; }

/** Marks the request handled. */
export function clearPaletteOpenRequest() { pending = false; }
