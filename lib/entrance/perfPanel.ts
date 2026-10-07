/**
 * `?entrancePerf=1` — a temporary, opt-in diagnostics panel for the entrance, meant for measuring on a real
 * phone and sending the numbers back. Loaded as its own chunk only when the parameter is present; normal
 * visitors never download or run it. It records performance numbers only: framing, tier, format, viewport,
 * device pixel ratio, frame cadence, draw paths, decode times and decoded-bitmap memory; the live scroll
 * progress against the frame asked for and the frame on screen, the video's media time, readyState and
 * buffered/seekable ranges; and the device class (pointer type, core count, memory, connection type) the
 * numbers came from. No identifiers, no user agent, nothing sent anywhere — the numbers leave the page only
 * when the viewer copies or shares them.
 *
 * Optional experiment parameters (also only with entrancePerf=1):
 *   entranceFormat=avif|webp     force the frame format (webp exists for the phone portrait tier only)
 *   entranceMode=auto|blend|single      what is drawn while moving (auto: adaptive, the default on touch)
 *   entranceCadence=full|30|auto        display cadence while moving
 *   entrancePlayer=canvas|video         the image sequence on a canvas, or the scrub video (phones' default)
 *
 * What it separates: pacing (scroll px, progress and beats per gesture), rAF cadence (interval avg/p95, a 30 fps
 * cap as in Low Power Mode), drawing (draw ms), decoding (decode ms, stand-in frames), video seeking (seek
 * latency, frames behind) and network (fetched / buffered).
 */
import type { EntranceConfig, EntranceExperiment, EntranceProfiler } from "./profile";

type Stats = {
  cfg?: EntranceConfig; adapts: string[];
  rafDts: number[]; paths: Record<string, number>; misses: number; renders: number; skips: number;
  distNow: number; distMax: number; distSum: number; distN: number;
  decodes: number[]; decodedNow: number; bytesNow: number; decodedPeak: number; bytesPeak: number;
  fetched: number; fetchBytes: number; fetchFirst: number; fetchLast: number; draws: number[];
  seeks: number[]; late: number; updates: number; gestures: Gesture[];
  presented: number; processing: number[]; delays: number[]; seekToPresent: number[];
};
/** One scroll gesture (a burst of scrolling with no pause over 250 ms): how far it went and what it covered. */
type Gesture = { ms: number; scrollPx: number; wheelPx: number; dp: number; beats: number; frames: number };
const BEAT_EDGES = [0.12, 0.38, 0.53, 0.68, 0.88];

const fresh = (): Stats => ({ adapts: [], rafDts: [], paths: {}, misses: 0, renders: 0, skips: 0, distNow: 0, distMax: 0, distSum: 0, distN: 0,
  decodes: [], decodedNow: 0, bytesNow: 0, decodedPeak: 0, bytesPeak: 0, fetched: 0, fetchBytes: 0, fetchFirst: 0, fetchLast: 0, draws: [],
  seeks: [], late: 0, updates: 0, gestures: [], presented: 0, processing: [], delays: [], seekToPresent: [] });

const pct = (a: number[], q: number) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f1 = (n: number) => n.toFixed(1);

export function install() {
  const w = window as unknown as { __ENTRANCE_PROF__?: EntranceProfiler; __ENTRANCE_EXP__?: EntranceExperiment };
  const q = new URLSearchParams(location.search), x: EntranceExperiment = { ...w.__ENTRANCE_EXP__ };
  const fmt = q.get("entranceFormat"), mode = q.get("entranceMode"), cad = q.get("entranceCadence"), player = q.get("entrancePlayer");
  if (player === "canvas" || player === "video") x.player = player;
  if (fmt === "avif" || fmt === "webp") x.format = fmt;
  if (mode === "auto" || mode === "blend" || mode === "single") x.mode = mode;
  if (cad === "auto" || cad === "full" || cad === "30") x.cadence = cad;
  w.__ENTRANCE_EXP__ = x;

  let S = fresh(), fetchStart0 = 0, lastScroll = -1e9, lastRaf = 0, lastP = 0, lastDrawn: number | null = null, lastWant = -1;
  let g: { t0: number; y0: number; p0: number; wheel: number; frames: number; t1: number } | null = null;
  const endGesture = () => {
    if (!g) return;
    const dp = lastP - g.p0, lo = Math.min(g.p0, lastP), hi = Math.max(g.p0, lastP);
    S.gestures.push({ ms: Math.round(g.t1 - g.t0), scrollPx: Math.round(scrollY - g.y0), wheelPx: Math.round(g.wheel), dp: +dp.toFixed(3),
      beats: BEAT_EDGES.filter((e) => e > lo && e <= hi).length, frames: g.frames });
    if (S.gestures.length > 12) S.gestures.shift();
    g = null;
  };
  const touchGesture = (t: number) => {
    if (g && t - g.t1 > 250) endGesture();
    if (!g) g = { t0: t, y0: scrollY, p0: lastP, wheel: 0, frames: 0, t1: t };
    g.t1 = t;
  };
  addEventListener("wheel", (e) => { touchGesture(performance.now()); g!.wheel += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY; }, { passive: true });
  setInterval(() => { if (g && performance.now() - g.t1 > 250) endGesture(); }, 100);
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
    seek: (ms) => { S.seeks.push(ms); if (S.seeks.length > 500) S.seeks.shift(); },
    // requestVideoFrameCallback metadata: frames actually composited, decode time, how far ahead of display.
    presented: (f) => {
      if (performance.now() - lastScroll < 150) S.presented++;
      if (f.processingMs !== undefined) { S.processing.push(f.processingMs); if (S.processing.length > 500) S.processing.shift(); }
      if (f.delayMs !== undefined) { S.delays.push(f.delayMs); if (S.delays.length > 500) S.delays.shift(); }
      if (f.seekToPresentMs !== undefined) { S.seekToPresent.push(f.seekToPresentMs); if (S.seekToPresent.length > 500) S.seekToPresent.shift(); }
    },
    render: (r) => {
      lastP = r.p; if (r.want >= 0) lastWant = r.want;
      if (r.skipped) { S.skips++; return; }
      if (r.drawn !== null && r.drawn !== lastDrawn) { if (g) g.frames += Math.abs(r.drawn - (lastDrawn ?? r.drawn)); lastDrawn = r.drawn; if (r.moving || performance.now() - lastScroll < 150) S.updates++; }
      if (!r.moving) return;
      if (r.path === "video-late") S.late++;
      S.renders++; S.paths[r.path] = (S.paths[r.path] ?? 0) + 1; S.draws.push(r.drawMs);
      if (r.path === "near" || r.path === "hold" || r.path === "fallback") S.misses++;
      if (r.want >= 0) {
        const d = r.drawn === null ? 0 : Math.abs(r.drawn - r.want);
        S.distNow = d; S.distMax = Math.max(S.distMax, d); S.distSum += d; S.distN++;
      }
    },
  };

  // Cadence: every display frame while the page is scrolling (a scroll event within the last 150 ms).
  addEventListener("scroll", () => { lastScroll = performance.now(); touchGesture(lastScroll); }, { passive: true });
  const loop = (t: number) => {
    if (lastRaf && t - lastScroll < 150 && t - lastRaf < 250) S.rafDts.push(t - lastRaf);
    lastRaf = t; requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const report = () => {
    const c = S.cfg, dts = S.rafDts, base = Math.max(6, pct(dts, 0.1) || 16.7);
    const dropped = dts.reduce((a, d) => a + Math.max(0, Math.round(d / base) - 1), 0);
    const mb = (b: number) => f1(b / 1048576);
    const scrollingS = dts.reduce((a, b) => a + b, 0) / 1000, fps = scrollingS ? S.updates / scrollingS : 0;
    const vid = document.querySelector<HTMLVideoElement>(".entrance__video");
    const buffered = vid && vid.duration ? Array.from({ length: vid.buffered.length }, (_, i) => vid.buffered.end(i) - vid.buffered.start(i)).reduce((a, b) => a + b, 0) / vid.duration : null;
    const lg = S.gestures.at(-1), gs = S.gestures;
    // Live state: where the scroll is, what was asked for and what is on screen; media ranges; the device.
    const ranges = (tr?: TimeRanges) => (tr && tr.length ? Array.from({ length: tr.length }, (_, i) => `${tr.start(i).toFixed(2)}–${tr.end(i).toFixed(2)}`).join(",") + " s" : "—");
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; rtt?: number; downlink?: number; saveData?: boolean } };
    const cn = nav.connection, coarse = matchMedia("(pointer: coarse)").matches;
    const live = `live: p ${lastP.toFixed(4)} · wanted ${lastWant} · on screen ${lastDrawn ?? "—"}${vid ? ` · media t ${vid.currentTime.toFixed(3)} s · seeking ${vid.seeking} · readyState ${vid.readyState} · buffered ${ranges(vid.buffered)} · seekable ${ranges(vid.seekable)}` : ""}`;
    const device = `device: ${coarse ? "touch (coarse pointer)" : "fine pointer"} · ${navigator.hardwareConcurrency ?? "?"} cores${nav.deviceMemory ? ` · ${nav.deviceMemory} GB` : ""} · DPR ${devicePixelRatio} · ${innerWidth}×${innerHeight}${cn ? ` · net ${cn.effectiveType ?? "?"}${cn.rtt !== undefined ? `, rtt ${cn.rtt} ms` : ""}${cn.downlink !== undefined ? `, ${cn.downlink} Mb/s` : ""}${cn.saveData ? ", save-data" : ""}` : ""}`;
    const dropPct = dts.length ? (100 * dropped) / (dts.length + dropped) : 0;
    // A first reading of where the time goes; the raw numbers above it are what matters.
    const hints = [
      base > 25 && dts.length > 30 ? "rAF runs at ~30 fps (Low Power Mode, or a throttled page)" : "",
      dropPct > 15 && pct(S.draws, 0.95) > base * 0.5 ? "drawing takes over half a frame" : "",
      dropPct > 15 && pct(S.draws, 0.95) <= base * 0.5 ? "frames dropped with cheap draws: main thread busy elsewhere (decode, GC) or compositor-bound" : "",
      S.misses && pct(S.decodes, 0.95) > base ? "decode slower than a frame: stand-ins while scrolling" : "",
      c && c.player === "canvas" && S.fetched < c.count ? "frames still downloading" : "",
      buffered !== null && buffered < 0.99 ? "video still downloading" : "",
      c?.player === "video" && pct(S.seeks, 0.95) > 2 * base ? "video seeks slower than two frames" : "",
      gs.length && avg(gs.map((x) => x.beats)) > 1.2 ? "pacing: an average gesture crosses more than one beat" : "",
    ].filter(Boolean);
    return {
      text: [
        `entrancePerf · ${c ? `${c.player} · ${c.framing} · ${c.player === "video" ? `${c.format} ${c.tier}px · ${c.count} samples` : `tier ${c.tier} · ${c.format} · ${c.count} frames`} · pacing ${c.pacing}, runway ${Math.round(c.runwayPx)} px` : "loading"}`,
        c ? `viewport ${c.vw}×${c.vh} @${c.dpr} · canvas ${c.canvasW}×${c.canvasH} · mode ${c.mode} · cadence ${c.cadence}` : "",
        live, device,
        `rAF while scrolling: n ${dts.length} · avg ${f1(avg(dts))} · p95 ${f1(pct(dts, 0.95))} ms · dropped ${f1(dropPct)}% · picture updates ${f1(fps)}/s`,
        lg ? `last gesture: ${lg.scrollPx} px scroll${lg.wheelPx ? ` (wheel ${lg.wheelPx})` : ""} in ${lg.ms} ms → Δp ${lg.dp} · ${lg.beats} beat edges · ${lg.frames} frames` : "gestures: —",
        gs.length ? `gestures (${gs.length}): avg |Δp| ${(avg(gs.map((x) => Math.abs(x.dp)))).toFixed(3)} · avg beat edges ${f1(avg(gs.map((x) => x.beats)))}` : "",
        c?.player === "video" ? `video seeks n ${S.seeks.length} · avg ${f1(avg(S.seeks))} · p95 ${f1(pct(S.seeks, 0.95))} ms · late renders ${S.late} · buffered ${buffered === null ? "—" : Math.round(buffered * 100) + "%"} · readyState ${vid?.readyState ?? "—"}` : "",
        c?.player === "video" ? `presented while scrolling ${f1(scrollingS ? S.presented / scrollingS : 0)}/s · seek→presented p50 ${f1(pct(S.seekToPresent, 0.5))} · p95 ${f1(pct(S.seekToPresent, 0.95))} ms${S.processing.length ? ` · decode ${f1(avg(S.processing))} ms` : ""}${S.delays.length ? ` · ahead of display ${f1(avg(S.delays))} ms` : ""}` : "",
        `paths ${Object.entries(S.paths).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}${S.skips ? ` · cadence skips ${S.skips}` : ""}`,
        `misses ${S.misses}/${S.renders} (${S.renders ? f1((100 * S.misses) / S.renders) : 0}%) · frame distance now ${S.distNow} · max ${S.distMax} · avg ${S.distN ? (S.distSum / S.distN).toFixed(2) : 0}`,
        `draw ms avg ${f1(avg(S.draws))} · p95 ${f1(pct(S.draws, 0.95))}`,
        `decode n ${S.decodes.length} · avg ${f1(avg(S.decodes))} · p95 ${f1(pct(S.decodes, 0.95))} · max ${f1(Math.max(0, ...S.decodes))} ms`,
        `decoded now ${S.decodedNow} (${mb(S.bytesNow)} MB) · peak ${S.decodedPeak} (${mb(S.bytesPeak)} MB)`,
        `fetched ${S.fetched}${c ? `/${c.count}` : ""} · ${Math.round(S.fetchBytes / 1024)} KB · first ${Math.round(S.fetchFirst)} ms · last ${Math.round(S.fetchLast)} ms after start`,
        ...S.adapts.map((a) => `adapt: ${a}`),
        hints.length ? `hints: ${hints.join("; ")}` : "",
      ].filter(Boolean).join("\n"),
      json: { cfg: c, raf: { n: dts.length, avg: +f1(avg(dts)), p95: +f1(pct(dts, 0.95)), base: +f1(base), dropped },
        paths: S.paths, skips: S.skips, misses: S.misses, renders: S.renders, dist: { max: S.distMax, avg: S.distN ? +(S.distSum / S.distN).toFixed(3) : 0 },
        drawMs: { avg: +f1(avg(S.draws)), p95: +f1(pct(S.draws, 0.95)) },
        decodeMs: { n: S.decodes.length, avg: +f1(avg(S.decodes)), p95: +f1(pct(S.decodes, 0.95)), max: +f1(Math.max(0, ...S.decodes)) },
        decoded: { now: S.decodedNow, nowMB: +mb(S.bytesNow), peak: S.decodedPeak, peakMB: +mb(S.bytesPeak) },
        fetch: { n: S.fetched, kb: Math.round(S.fetchBytes / 1024), firstMs: Math.round(S.fetchFirst), lastMs: Math.round(S.fetchLast) }, adapts: S.adapts,
        presentedPerSec: +f1(scrollingS ? S.presented / scrollingS : 0), seekToPresentMs: { p50: +f1(pct(S.seekToPresent, 0.5)), p95: +f1(pct(S.seekToPresent, 0.95)) },
        processingMs: S.processing.length ? +f1(avg(S.processing)) : null, presentDelayMs: S.delays.length ? +f1(avg(S.delays)) : null,
        fps: +f1(fps), seekMs: { n: S.seeks.length, avg: +f1(avg(S.seeks)), p95: +f1(pct(S.seeks, 0.95)) }, late: S.late,
        video: vid ? { buffered: buffered === null ? null : +buffered.toFixed(3), readyState: vid.readyState, currentTime: +vid.currentTime.toFixed(3), seekable: ranges(vid.seekable) } : null,
        live: { p: +lastP.toFixed(4), wanted: lastWant, onScreen: lastDrawn }, device, gestures: S.gestures, hints },
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
