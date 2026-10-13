/** A press on the assistant's launcher before hydration would otherwise be lost: this inline script (the root layout
 *  puts it at the end of the body, after the launcher and ahead of every bundle — CSP allows inline scripts, proxy.ts)
 *  remembers it, and the launcher replays it on mount (components/chat/ChatLauncher.tsx). */
export const EARLY_CHAT = `document.addEventListener("click",function(e){if(window.__chatReady)return;var b=e.target&&e.target.closest&&e.target.closest("[data-chat-launcher]");if(b)window.__chatEarly=1;},true);`;
