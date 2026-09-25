import fs from "node:fs/promises";
import path from "node:path";

const base = "https://raw.githubusercontent.com/taysh123/Portfolio/main/public/projects";
const assets = [
  "poker/home.png", "poker/tournament-live.png", "poker/podium.png", "poker/final-count.png", "poker/stats.png",
  "sentinelai/dashboard.png", "sentinelai/ai-analysis.png", "sentinelai/live-alerts.png", "sentinelai/incident-kanban.png", "sentinelai/architecture.png",
  "developeros/dashboard.png", "developeros/ai-features.png", "developeros/learning.png", "developeros/career.png", "developeros/hero.png",
  "gravity-flow/gameplay.png", "gravity-flow/boss.png", "gravity-flow/gravity-run.png", "gravity-flow/cosmetics.png", "gravity-flow/win.png",
];

const root = path.join(process.cwd(), "public", "projects");
let ok = 0;

for (const asset of assets) {
  const target = path.join(root, asset);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const response = await fetch(`${base}/${asset}`);
  if (!response.ok) {
    console.warn(`skip ${asset}: HTTP ${response.status}`);
    continue;
  }
  await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
  console.log(`synced ${asset}`);
  ok += 1;
}

console.log(`\nDone: ${ok}/${assets.length} assets synced from the current public Portfolio repo.`);
