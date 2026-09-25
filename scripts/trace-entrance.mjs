// Main-thread time while wheel-scrolling through the entrance (spec §9: p95 ≤ 8 ms). Exits 1 over budget.
// usage: PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/trace-entrance.mjs [base-url]
// Task events live in the "toplevel" category (the plan's "devtools.timeline" alone recorded none), and only
// the renderer's main thread (CrRendererMain) counts — compositor, raster and GPU threads are excluded.
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3400/";
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: "networkidle" });
await b.startTracing(page, { categories: ["toplevel", "devtools.timeline", "__metadata"] });
for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16); }
const trace = JSON.parse((await b.stopTracing()).toString());
const events = trace.traceEvents ?? trace;
const main = events.filter((e) => e.name === "thread_name" && e.args?.name === "CrRendererMain").map((e) => `${e.pid}:${e.tid}`);
// Top-level task events: "RunTask" in older Chromium, "ThreadControllerImpl::RunTask" in current builds.
const TASK = new Set(["RunTask", "ThreadControllerImpl::RunTask"]);
const tasks = events.filter((e) => TASK.has(e.name) && e.dur && main.includes(`${e.pid}:${e.tid}`)).map((e) => e.dur / 1000).sort((a, c) => a - c);
if (!tasks.length) { console.error("no main-thread RunTask events recorded"); process.exit(2); }
const p95 = tasks[Math.floor(tasks.length * 0.95)];
console.log(JSON.stringify({ tasks: tasks.length, p95ms: +p95.toFixed(2), max: +tasks.at(-1).toFixed(2) }));
await b.close(); process.exit(p95 > 8 ? 1 : 0);
