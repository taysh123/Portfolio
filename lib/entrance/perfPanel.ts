/**
 * `?entrancePerf=1` — a temporary, opt-in diagnostics panel for the entrance, meant for measuring on a real
 * phone and sending the numbers back. Loaded as its own chunk only when the parameter is present; normal
 * visitors never download or run it. It records performance numbers only: framing, tier, format, viewport,
 * device pixel ratio, frame cadence, draw paths, decode times and decoded-bitmap memory. No identifiers, no
 * user agent, nothing sent anywhere — the numbers leave the page only when the viewer copies or shares them.
 *
 * Optional experiment parameters (also only with entrancePerf=1):
 *   entranceFormat=avif|webp     force the frame format (webp exists for the phone portrait tier only)
 *   entranceMode=auto|blend|single      what is drawn while moving (auto: adaptive, the default on touch)
 *   entranceCadence=full|30|auto        display cadence while moving
 */
import type { EntranceConfig, EntranceExperiment, EntranceProfiler } from "./profile";

type Stats = {
  cfg?: EntranceConfig; adapts: string[];
  rafDts: number[]; paths: Record<string, number>; misses: number; renders: number; skips: number;
  distNow: number; distMax: number; distSum: number; distN: number;
  decodes: number[]; decodedNow: number; bytesNow: number; decodedPeak: number; bytesPeak: number;
  fetched: number; fetchBytes: number; fetchFirst: number; fetchLast: number; draws: number[];
};

const fresh = (): Stats => ({ adapts: [], rafDts: [], paths: {}, misses: 0, renders: 0, skips: 0, distNow: 0, distMax: 0, distSum: 0, distN: 0,
  decodes: [], decodedNow: 0, bytesNow: 0, decodedPeak: 0, bytesPeak: 0, fetched: 0, fetchBytes: 0, fetchFirst: 0, fetchLast: 0, draws: [] });

const pct = (a: number[], q: number) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f1 = (n: number) => n.toFixed(1);

export function install() {
  const w = window as unknown as { __ENTRANCE_PROF__?: EntranceProfiler; __ENTRANCE_EXP__?: EntranceExperiment };
  const q = new URLSearchParams(location.search), x: EntranceExperiment = { ...w.__ENTRANCE_EXP__ };
  const fmt = q.get("entranceFormat"), mode = q.get("entranceMode"), cad = q.get("entranceCadence");
  if (fmt === "avif" || fmt === "webp") x.format = fmt;
  if (mode === "auto" || mode === "blend" || mode === "single") x.mode = mode;
  if (cad === "auto" || cad === "full" || cad === "30") x.cadence = cad;
  w.__ENTRANCE_EXP__ = x;

  let S = fresh(), fetchStart0 = 0, lastScroll = -1e9, lastRaf = 0;
  const fetchBytes = new Map<number, number>();
  w.__ENTRANCE_PROF__ = {
    config: (c) => { S.cfg = c; },
    adapt: (a) => { S.adapts.push(`${a.reason} → ${a.mode}/${a.cadence} (drop ${Math.round(a.dropRate * 100)}%, base ${f1(a.baseMs)} ms)`); },
    fetchStart: (_i, t) => { if (!fetchStart0) fetchStart0 = t; },
    fetchEnd: (i, t, bytes) => { fetchBytes.set(i, bytes); S.fetched = fetchBytes.size; S.fetchBytes = [...fetchBytes.values()].reduce((a, b) => a + b, 0); S.fetchLast = t - fetchStart0; if (!S.fetchFirst) S.fetchFirst = t - fetchStart0; },
    decode: (_i, ms) => { S.decodes.push(ms); },
    playhead: (_i, decoded, _near, bytes) => {
      S.decodedNow = decoded; S.bytesNow = bytes;
      if (bytes > S.bytesPeak) { S.bytesPeak = bytes; } if (decoded > S.decodedPeak) S.decodedPeak = decoded;
    },
    render: (r) => {
      if (r.skipped) { S.skips++; return; }
      if (!r.moving) return;
      S.renders++; S.paths[r.path] = (S.paths[r.path] ?? 0) + 1; S.draws.push(r.drawMs);
      if (r.path === "near" || r.path === "hold" || r.path === "fallback") S.misses++;
      if (r.want >= 0) {
        const d = r.drawn === null ? 0 : Math.abs(r.drawn - r.want);
        S.distNow = d; S.distMax = Math.max(S.distMax, d); S.distSum += d; S.distN++;
      }
    },
  };

  // Cadence: every display frame while the page is scrolling (a scroll event within the last 150 ms).
  addEventListener("scroll", () => { lastScroll = performance.now(); }, { passive: true });
  const loop = (t: number) => {
    if (lastRaf && t - lastScroll < 150 && t - lastRaf < 250) S.rafDts.push(t - lastRaf);
    lastRaf = t; requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const report = () => {
    const c = S.cfg, dts = S.rafDts, base = Math.max(6, pct(dts, 0.1) || 16.7);
    const dropped = dts.reduce((a, d) => a + Math.max(0, Math.round(d / base) - 1), 0);
    const mb = (b: number) => f1(b / 1048576);
    return {
      text: [
        `entrancePerf · ${c ? `${c.framing} · tier ${c.tier} · ${c.format} · ${c.count} frames` : "loading"}`,
        c ? `viewport ${c.vw}×${c.vh} @${c.dpr} · canvas ${c.canvasW}×${c.canvasH} · mode ${c.mode} · cadence ${c.cadence}` : "",
        `rAF while scrolling: n ${dts.length} · avg ${f1(avg(dts))} · p95 ${f1(pct(dts, 0.95))} ms · dropped ${dts.length ? f1((100 * dropped) / (dts.length + dropped)) : 0}%`,
        `paths ${Object.entries(S.paths).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}${S.skips ? ` · cadence skips ${S.skips}` : ""}`,
        `misses ${S.misses}/${S.renders} (${S.renders ? f1((100 * S.misses) / S.renders) : 0}%) · frame distance now ${S.distNow} · max ${S.distMax} · avg ${S.distN ? (S.distSum / S.distN).toFixed(2) : 0}`,
        `draw ms avg ${f1(avg(S.draws))} · p95 ${f1(pct(S.draws, 0.95))}`,
        `decode n ${S.decodes.length} · avg ${f1(avg(S.decodes))} · p95 ${f1(pct(S.decodes, 0.95))} · max ${f1(Math.max(0, ...S.decodes))} ms`,
        `decoded now ${S.decodedNow} (${mb(S.bytesNow)} MB) · peak ${S.decodedPeak} (${mb(S.bytesPeak)} MB)`,
        `fetched ${S.fetched}${c ? `/${c.count}` : ""} · ${Math.round(S.fetchBytes / 1024)} KB · first ${Math.round(S.fetchFirst)} ms · last ${Math.round(S.fetchLast)} ms after start`,
        ...S.adapts.map((a) => `adapt: ${a}`),
      ].filter(Boolean).join("\n"),
      json: { cfg: c, raf: { n: dts.length, avg: +f1(avg(dts)), p95: +f1(pct(dts, 0.95)), base: +f1(base), dropped },
        paths: S.paths, skips: S.skips, misses: S.misses, renders: S.renders, dist: { max: S.distMax, avg: S.distN ? +(S.distSum / S.distN).toFixed(3) : 0 },
        drawMs: { avg: +f1(avg(S.draws)), p95: +f1(pct(S.draws, 0.95)) },
        decodeMs: { n: S.decodes.length, avg: +f1(avg(S.decodes)), p95: +f1(pct(S.decodes, 0.95)), max: +f1(Math.max(0, ...S.decodes)) },
        decoded: { now: S.decodedNow, nowMB: +mb(S.bytesNow), peak: S.decodedPeak, peakMB: +mb(S.bytesPeak) },
        fetch: { n: S.fetched, kb: Math.round(S.fetchBytes / 1024), firstMs: Math.round(S.fetchFirst), lastMs: Math.round(S.fetchLast) }, adapts: S.adapts },
    };
  };
  (window as unknown as { __entrancePerf?: () => ReturnType<typeof report> }).__entrancePerf = report;

  // The panel: a small fixed box; styles are set through the CSSOM (the page's CSP allows no inline style attributes).
  const box = document.createElement("div"), pre = document.createElement("pre"), bar = document.createElement("div");
  box.setAttribute("data-entrance-perf", ""); box.setAttribute("role", "region"); box.setAttribute("aria-label", "Entrance performance");
  Object.assign(box.style, { position: "fixed", left: "6px", right: "6px", bottom: "calc(6px + env(safe-area-inset-bottom))", zIndex: "2147483647",
    background: "rgba(0,0,0,.72)", color: "#9ef0b0", font: "10px/1.35 ui-monospace,Menlo,monospace", padding: "6px 8px", borderRadius: "8px",
    maxHeight: "30vh", overflow: "auto", pointerEvents: "auto", whiteSpace: "pre-wrap" });
  Object.assign(pre.style, { margin: "0", whiteSpace: "pre-wrap", font: "inherit" });
  Object.assign(bar.style, { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" });
  const btn = (label: string, fn: () => void) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = label;
    Object.assign(b.style, { font: "600 12px system-ui,sans-serif", padding: "6px 10px", minHeight: "32px", borderRadius: "6px", border: "1px solid #3a5", background: "#0d1f14", color: "#cfe" });
    b.addEventListener("click", fn); bar.appendChild(b); return b;
  };
  const payload = () => { const r = report(); return `${r.text}\n\n${JSON.stringify(r.json)}`; };
  const copy = btn("Copy", async () => {
    const t = payload();
    try { await navigator.clipboard.writeText(t); copy.textContent = "Copied ✓"; }
    catch { // no clipboard permission: select the text for the viewer to copy by hand
      const ta = document.createElement("textarea"); ta.value = t; ta.readOnly = true;
      Object.assign(ta.style, { width: "100%", height: "8em", font: "inherit" }); box.appendChild(ta); ta.focus(); ta.select();
      copy.textContent = "Select & copy";
    }
    setTimeout(() => { copy.textContent = "Copy"; }, 2000);
  });
  if (typeof navigator.share === "function") btn("Share", () => { void navigator.share({ text: payload() }).catch(() => {}); });
  btn("Reset", () => { S = { ...fresh(), cfg: S.cfg, fetched: S.fetched, fetchBytes: S.fetchBytes, fetchFirst: S.fetchFirst, fetchLast: S.fetchLast, decodedNow: S.decodedNow, bytesNow: S.bytesNow }; });
  let small = false;
  const hide = btn("Hide", () => { small = !small; pre.style.display = small ? "none" : ""; hide.textContent = small ? "Stats" : "Hide"; });
  box.append(pre, bar);
  const mount = () => document.body.appendChild(box);
  if (document.body) mount(); else addEventListener("DOMContentLoaded", mount, { once: true });
  setInterval(() => { if (!small) pre.textContent = report().text; }, 500);
}
