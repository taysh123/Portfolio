// tests/unit/case-study-images.test.ts — S21+S22: no case-study image goes through the on-demand image optimiser. Each
// is either served as it is (`direct`) or listed in its project's `media.encoded`, whose names and widths are the image
// tables' own, whose files are on disk, and whose script job encodes exactly that source, whole.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import sharp from "sharp";
import { projects } from "@/data/projects";
import { captureOf } from "@/data/lab-images";

// Line endings normalised: Git for Windows checks files out with CRLF.
const script = fs.readFileSync("scripts/m10-images.mjs", "utf8").replace(/\r\n/g, "\n");
const withMedia = projects.filter((p) => p.media?.image || p.media?.gallery?.length);

describe("the case studies' captures are pre-encoded (S21+S22)", () => {
  it("every case-study image is direct or listed in media.encoded, and nothing else is listed", () => {
    expect(withMedia.map((p) => p.id)).toEqual(["poker", "aegis", "developeros", "gravity-flow"]);
    for (const p of withMedia) {
      const m = p.media!, srcs = [m.image!, ...(m.gallery ?? []).map((g) => g.src)];
      for (const src of srcs) {
        expect(m.direct || Boolean(m.encoded?.[src]), `${p.id}: ${src}`).toBe(true);
        expect(fs.existsSync(`public${src}`), src).toBe(true);
      }
      for (const src of Object.keys(m.encoded ?? {})) expect(srcs, `${p.id}: ${src}`).toContain(src);
    }
    expect(projects.filter((p) => p.media?.direct).map((p) => p.id)).toEqual(["poker", "aegis"]);
  });
  it("each encoded capture has the image tables' widths, every file on disk, and a script job that encodes its source whole", () => {
    for (const p of withMedia) for (const [src, e] of Object.entries(p.media!.encoded ?? {})) {
      expect(e.widths, e.name).toEqual(captureOf(e.name).widths);
      for (const w of e.widths) for (const ext of ["avif", "webp"]) expect(fs.existsSync(`public/work/${e.name}-${w}.${ext}`), `${e.name}-${w}.${ext}`).toBe(true);
      const job = script.split("\n").find((l) => l.includes(`{ name: "${e.name}",`));
      expect(job, e.name).toBe(`  { name: "${e.name}", src: \`\${P}${src.replace(/^\/projects/, "")}\`, widths: [${e.widths.join(", ")}] },`);
    }
  });
  it("each encoded capture's pixels are its source's (re-encoded, not another screen)", async () => {
    for (const p of withMedia) for (const [src, e] of Object.entries(p.media!.encoded ?? {})) {
      const im = captureOf(e.name);
      const px = (f: string) => sharp(f).resize(48, Math.round((48 * im.h) / im.w), { fit: "fill" }).removeAlpha().raw().toBuffer();
      const [a, b] = await Promise.all([px(`public${src}`), px(`public/work/${e.name}-${im.w}.webp`)]);
      let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
      expect(d / a.length, e.name).toBeLessThan(2);
    }
  });
  it("the panel serves an encoded capture as AVIF, then WebP, from public/work, and never imports the image tables", () => {
    const panel = fs.readFileSync("components/ui/CaseStudyPanel.tsx", "utf8");
    expect(panel).toMatch(/<source type="image\/avif" srcSet=\{set\("avif"\)\} sizes=\{sizes\} \/>/);
    expect(panel).toMatch(/srcSet=\{set\("webp"\)\}/);
    expect(panel).toMatch(/`\/work\/\$\{e\.name\}-\$\{w\}\.\$\{ext\} \$\{w\}w`/);
    expect(panel).not.toMatch(/from "@\/data\/(lab-)?images"/);
  });
});
