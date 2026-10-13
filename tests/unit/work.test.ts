// tests/unit/work.test.ts — every chapter line is condensed from data/projects.ts or transcribed from the product;
// nothing new is claimed (M10).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { flagships, moreWork, projectOf, aegisTrace, aegisCopy, dosFlow, dosRefusal, dosRefusalCaption, gfFacts, pokerSteps } from "@/data/work";
import { IMAGES, AEGIS_CROPS, AEGIS_ROW, AEGIS_BOARD, AEGIS_BOARD_BOUNDS } from "@/data/images";

const numbers = (s: string) => (s.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]$/, ""));
const json = (id: string) => JSON.stringify(projectOf(id)).toLowerCase().replace(/[-‑]/g, " ");

describe("flagships", () => {
  it("are the four products in Work order, each on its own plate", () => {
    expect(flagships.map((f) => [f.id, f.plate])).toEqual([["poker", "poker"], ["aegis", "aegis"], ["developeros", "dos"], ["gravity-flow", "gf"]]);
  });
  it("every number in a lede or built line appears in that project's data", () => {
    for (const f of flagships) for (const line of [f.lede, f.built ?? ""])
      for (const n of numbers(line)) expect(JSON.stringify(projectOf(f.id)), `${f.id}: "${n}" in "${line}"`).toContain(n);
  });
  it("every annotation is a phrase from the project's own data", () => {
    for (const f of flagships) for (const note of f.notes) expect(json(f.id), `${f.id}: "${note}"`).toContain(note.toLowerCase().replace(/[-‑]/g, " "));
  });
  it("T Poker's lede is its challenge, condensed: exact money, offline, agreeing with the server", () => {
    const lede = flagships[0].lede.toLowerCase();
    for (const w of ["buy-ins", "rebuys", "cash-outs", "offline", "server"]) expect(lede).toContain(w);
  });
  it("no chapter carries the retired figures or a test count standing in for the product", () => {
    const all = JSON.stringify(flagships);
    expect(all).not.toMatch(/6,210|8,117|8 CI|CI jobs|commits|tests/i);
    expect(JSON.stringify(projectOf("poker").metrics)).not.toMatch(/6,210|CI jobs/);
  });
});

describe("Aegis: the trace is the implemented path", () => {
  it("ingest → normalise → detect, then the fork (threat scoring and the alert stream in parallel), then live", () => {
    expect(aegisTrace.main.map((s) => s.k)).toEqual(["ingest", "normalise", "detect"]);
    expect(aegisTrace.fork.map((s) => s.k)).toEqual(["score", "alert"]);
    expect(aegisTrace.end.k).toBe("live");
  });
  it("names RabbitMQ for the pipeline, SignalR for the stream, and never calls Aegis open source", () => {
    const text = JSON.stringify(aegisTrace) + JSON.stringify(flagships[1]);
    expect(text).toMatch(/RabbitMQ/); expect(text).toMatch(/SignalR/);
    expect(text).not.toMatch(/open source|open-source/i);
    expect(text).not.toMatch(/all (traffic|communication|messages)/i);
  });
  it("the Detect step's numbers are the port-scan detector's (20 distinct ports, 60 s)", () => {
    expect(aegisTrace.main[2].body).toMatch(/20 in 60 seconds/);
  });
  it("the crops hold the port-scan row whole and no text of the rows around it", () => {
    // Row 1's last text line ends at y 596; row 3's severity badge box starts at y 819 (measured on the capture).
    for (const c of Object.values(AEGIS_CROPS)) {
      expect(c.top).toBeGreaterThan(596); expect(c.top + c.height).toBeLessThan(819);
      expect(c.top).toBeLessThan(AEGIS_ROW.top); expect(c.top + c.height).toBeGreaterThan(AEGIS_ROW.bottom);
      expect(c.left).toBeLessThan(AEGIS_ROW.left); expect(c.left + c.width).toBeGreaterThan(1520);   // the row's text ends at x 1520
    }
  });
  it("the highlight crops match the image script", () => {
    const script = fs.readFileSync("scripts/m10-images.mjs", "utf8");
    for (const c of Object.values(AEGIS_CROPS)) expect(script).toContain(`{ left: ${c.left}, top: ${c.top}, width: ${c.width}, height: ${c.height} }`);
  });
  it("the Incidents board crop holds only the incident its own alerts bear out: the page head and OPEN's first card", () => {
    const b = AEGIS_BOARD_BOUNDS, c = AEGIS_BOARD;
    // Nothing of the INVESTIGATING column ("lateral movement", which no linked alert shows) or anything right of it.
    expect(c.left).toBeGreaterThan(b.sidebarEnd);
    expect(c.left + c.width).toBeGreaterThan(b.openEnd); expect(c.left + c.width).toBeLessThan(b.investigatingStart);
    // OPEN's first card whole, and nothing of its second (tags that contradict its title).
    expect(c.top + c.height).toBeGreaterThan(b.firstCardsEnd); expect(c.top + c.height).toBeLessThan(b.openSecondCardTop);
    // The hero plate shows that same crop.
    expect(IMAGES["hero-aegis"].h).toBe(Math.round((IMAGES["hero-aegis"].w * c.height) / c.width));
  });
  it("the board crop matches the image script (hero and case study) and the About photo's screen texture", () => {
    const script = fs.readFileSync("scripts/m10-images.mjs", "utf8");
    expect(script).toContain(`export const AEGIS_BOARD = { left: ${AEGIS_BOARD.left}, top: ${AEGIS_BOARD.top}, width: ${AEGIS_BOARD.width}, height: ${AEGIS_BOARD.height} }`);
    expect(script).toMatch(/name: "hero-aegis", src: capture\("aegis\/08-incident-kanban\.png"\), crop: AEGIS_BOARD,/);
    expect(script).toContain("extract(AEGIS_BOARD)");
    const c = AEGIS_BOARD, studio = fs.readFileSync("design/studio/prep_screens_b.py", "utf8");
    expect(studio).toContain(`crop_aspect(a, ${c.left}, ${c.top}, ${c.width}, 16 / 9)`);
    expect(Math.round(c.width / (16 / 9))).toBe(c.height);
    expect(studio).not.toMatch(/05-live-alerts/);
  });
});

describe("DeveloperOS: evidence, then cite or decline", () => {
  it("index → retrieve → evidence → cite, or decline", () => {
    expect(dosFlow.map((s) => s.k)).toEqual(["index", "retrieve", "evidence", "cite", "decline"]);
    expect(dosFlow.at(-1)!.body).toMatch(/No model is called/);
  });
  it("the refusal is the app's own text", () => {
    expect(dosRefusal.message).toBe("I don't have enough indexed material to teach that. Try `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)");
    expect(dosRefusal.notice).toMatch(/^Not enough of your indexed code matched this\./);
  });
});

describe("GRAVITY FLOW: gameplay first, no physics claims", () => {
  it("the lede is the mechanic, and nothing claims precise or fair physics", () => {
    expect(flagships[3].lede).toMatch(/hold to place a gravity well/i);
    const gf = JSON.stringify(flagships[3]) + fs.readFileSync("components/work/GravityChapter.tsx", "utf8");
    expect(gf).not.toMatch(/precise|accurate physics|fair physics|frame-rate|deterministic physics|hand-tuned/i);
    expect(projectOf("gravity-flow").tagline).not.toMatch(/hand-tuned/i);
  });
});

describe("the copy moved out of the chapters stays tied to the data", () => {
  // The chapter strings outside `flagships`, each with the project whose data must carry its numbers and terms.
  // aegisCopy.row is left out: it is transcribed from the capture, and the e2e suite checks it against that row.
  const moved: [string, string[]][] = [
    ["poker", pokerSteps.map((s) => s.caption)],
    ["aegis", [aegisCopy.onScreen, aegisCopy.seam, ...aegisTrace.main.map((s) => s.body), ...aegisTrace.fork.map((s) => s.body)]],
    ["developeros", [...dosFlow.map((s) => s.body), dosRefusalCaption.title, dosRefusalCaption.body]],
    ["gravity-flow", [...gfFacts]],
  ];
  it("every number in them appears in that project's data", () => {
    for (const [id, lines] of moved) for (const line of lines)
      for (const n of numbers(line)) expect(JSON.stringify(projectOf(id)), `${id}: "${n}" in "${line}"`).toContain(n);
  });
  it("their technical terms are the project's own", () => {
    const terms: Record<string, string[]> = {
      poker: ["integer-cent"],
      aegis: ["HyperLogLog", "RabbitMQ", "DbContext", "shared kernel", "PostgreSQL schema", "HMAC", "constant time", "MITRE", "SignalR", "MassTransit"],
      developeros: ["FTS5", "bm25"],
      "gravity-flow": ["150 levels", "15 worlds", "Phaser 3", "strict TypeScript"],
    };
    for (const [id, lines] of moved) for (const t of terms[id]) {
      expect(lines.join(" "), `${id} copy names ${t}`).toContain(t);
      expect(JSON.stringify(projectOf(id)), `${id} data names ${t}`).toContain(t);
    }
  });
  it("the Detect threshold, the highlighted row and the project data agree: 20 distinct ports in 60 seconds", () => {
    const aegis = JSON.stringify(projectOf("aegis"));
    expect(aegis).toMatch(/60-second windows and fires at 20/);
    expect(aegisCopy.row).toMatch(/\(20 distinct ports in 60s\)$/);
    expect(aegisTrace.main[2].body).toMatch(/fires at 20 in 60 seconds/);
  });
  it("GRAVITY FLOW's state matches its status and stores: a release candidate, not yet in a store", () => {
    const gf = projectOf("gravity-flow");
    expect(gf.status).toBe("rc");
    expect(gf.stores?.every((s) => s.status !== "live") ?? true).toBe(true);
    expect(gfFacts.join(" ")).toMatch(/release candidate, not yet in a store/);
  });
});

describe("the social card", () => {
  it("repeats the hero's headline and none of the retired lines", () => {
    const card = fs.readFileSync("app/opengraph-image.tsx", "utf8");
    expect(card).toContain("siteMeta.headline");
    expect(card).not.toMatch(/actually use|8,117|tests/i);
  });
});

describe("more work", () => {
  it("is Job Assistant and Orders & Delivery; Orders & Delivery is coursework with no public source", () => {
    expect(moreWork.map((r) => r.id)).toEqual(["job-assistant", "orders-delivery"]);
    expect(projectOf("orders-delivery").status).toBe("coursework");
    expect(projectOf("orders-delivery").repo.visibility).toBe("unavailable");
  });
});

describe("images", () => {
  it("every registered image exists at every width, in AVIF and WebP", () => {
    for (const [name, im] of Object.entries(IMAGES)) for (const w of im.widths) for (const ext of ["avif", "webp"])
      expect(fs.existsSync(`public/work/${name}-${w}.${ext}`), `${name}-${w}.${ext}`).toBe(true);
  });
  it("the About photograph exists at every width", () => {
    for (const w of [800, 1200, 1600]) for (const ext of ["avif", "webp"]) expect(fs.existsSync(`public/work/about-studio-${w}.${ext}`)).toBe(true);
  });
});
