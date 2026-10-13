// tests/unit/i18n.test.ts — the two languages (2026-10-13): one set of facts, every surface translated, no "junior",
// no institution, and the Hebrew page's structural rules.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDict } from "@/lib/dict";
import { localeOfPath, dirOf, homeOf, isLocale } from "@/lib/i18n";
import { fixBidi } from "@/lib/bidi";
import { fmt } from "@/lib/fmt";
import { projects } from "@/data/projects";
import { projectsHe } from "@/data/he/projects";
import * as he from "@/data/he/site";
import { about } from "@/data/about";
import { flagships, pokerSteps, aegisTrace, dosFlow, gfFacts } from "@/data/work";
import { pillars } from "@/data/approach";
import { skillGroups } from "@/data/skills";
import { getContent } from "@/lib/content";
import { namesAny, sha256, INSTITUTION } from "../support/institution";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]));
const site = ["app", "components", "data", "lib"].flatMap(files).filter((f) => /\.(tsx?|css|txt|json)$/.test(f));
const strings = (v: unknown): string[] => typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const numbers = (s: string) => s.match(/\d[\d,.]*\d|\d/g) ?? [];
const shape = (v: unknown): unknown => Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;

describe("routing", () => {
  it("English is the root, Hebrew is /he and everything under it", () => {
    expect([localeOfPath("/"), localeOfPath("/he"), localeOfPath("/he/x"), localeOfPath("/hebrew"), localeOfPath("/api/chat")]).toEqual(["en", "he", "he", "en", "en"]);
    expect([dirOf("en"), dirOf("he"), homeOf("en"), homeOf("he")]).toEqual(["ltr", "rtl", "/", "/he"]);
    expect([isLocale("he"), isLocale("fr"), isLocale(undefined)]).toEqual([true, false, false]);
  });
  it("the Hebrew page has its own route and social card", () => {
    expect(fs.existsSync("app/he/page.tsx")).toBe(true);
    for (const f of ["app/he/opengraph-image.png", "app/he/twitter-image.png"]) expect(fs.statSync(f).size, f).toBeGreaterThan(10_000);
  });
});

describe("the interface dictionary", () => {
  const en = getDict("en"), hd = getDict("he");
  it("has the same keys and list lengths in both languages", () => expect(shape(hd)).toEqual(shape(en)));
  it("every Hebrew string is actually Hebrew, except names, marks and codes that are the same in every language", () => {
    const same = new Set(["English", "עברית", "EN", "עב", "LinkedIn", "GitHub", ""]);
    const pairs = strings(en).map((s, i) => [s, strings(hd)[i]] as const);
    for (const [e, h] of pairs) if (!same.has(e)) {
      expect(h, `untranslated: ${e}`).not.toBe(e);
      expect(h, `no Hebrew letters: ${h}`).toMatch(/[֐-׿]/);
    }
  });
  it("placeholders survive translation", () => {
    for (const [e, h] of strings(getDict("en")).map((s, i) => [s, strings(getDict("he"))[i]])) expect((h.match(/\{\w+\}/g) ?? []).sort(), e).toEqual((e.match(/\{\w+\}/g) ?? []).sort());
    expect(fmt("{a} and {b}", { a: 1, b: "x" })).toBe("1 and x");
  });
  it("the stores' names stay their marks; the badge wording is translated", () => {
    expect(getDict("he").store.ios).toMatch(/[֐-׿]/);
    expect(getDict("he").store.android).toMatch(/[֐-׿]/);
  });
});

describe("the page's prose in Hebrew", () => {
  it("every list has the English one's length and order", () => {
    expect(he.aboutHe.paragraphs).toHaveLength(about.paragraphs.length);
    expect(he.aboutHe.facts).toHaveLength(about.facts.length);
    expect(Object.keys(he.flagshipsHe).sort()).toEqual(flagships.map((f) => f.id).sort());
    for (const f of flagships) expect(he.flagshipsHe[f.id].notes, f.id).toHaveLength(f.notes.length);
    expect(he.pokerStepsHe).toHaveLength(pokerSteps.length);
    expect(he.aegisTraceHe.main.map((s) => s.k)).toEqual(aegisTrace.main.map((s) => s.k));
    expect(he.aegisTraceHe.fork.map((s) => s.k)).toEqual(aegisTrace.fork.map((s) => s.k));
    expect(he.dosFlowHe.map((s) => s.k)).toEqual(dosFlow.map((s) => s.k));
    expect(he.gfFactsHe).toHaveLength(gfFacts.length);
    expect(he.pillarsHe).toHaveLength(pillars.length);
    expect(Object.keys(he.skillGroupsHe).sort()).toEqual(skillGroups.map((g) => g.id).sort());
  });
  it("every project has Hebrew copy with parallel lists", () => {
    for (const p of projects) {
      const c = projectsHe[p.id as keyof typeof projectsHe];
      expect(c, p.id).toBeDefined();
      expect(c.metrics, p.id).toHaveLength(p.metrics.length);
      expect(c.stack, p.id).toHaveLength(p.stack.length);
      expect(c.media?.gallery?.length ?? 0, p.id).toBe(p.media?.gallery?.length ?? 0);
      expect(c.caseStudy.decisions, p.id).toHaveLength(p.caseStudy.decisions.length);
      expect(c.caseStudy.challenges, p.id).toHaveLength(p.caseStudy.challenges.length);
      expect(c.caseStudy.learned, p.id).toHaveLength(p.caseStudy.learned.length);
      expect(Boolean(c.caseStudy.honestNote), p.id).toBe(Boolean(p.caseStudy.honestNote));
    }
  });
  it("no number appears in Hebrew that the English doesn't carry (one set of facts)", () => {
    for (const p of projects) {
      const enNums = new Set(numbers(strings({ ...p, repo: null, liveUrl: null, stores: null, media: { alt: p.media?.alt, gallery: p.media?.gallery?.map((g) => g.alt) } }).join(" ")));
      for (const n of numbers(strings(projectsHe[p.id as keyof typeof projectsHe]).join(" "))) expect(enNums.has(n), `${p.id}: ${n}`).toBe(true);
    }
    const enSite = new Set(numbers(strings([about, flagships, pokerSteps, aegisTrace, dosFlow, gfFacts, pillars, skillGroups, (getContent("en").aegisCopy)]).join(" ")));
    for (const n of numbers(strings(he).join(" "))) expect(enSite.has(n), n).toBe(true);
  });
  it("Latin names that end in neutral characters stay whole on the Hebrew page (C++ never renders as ++C)", () => {
    expect(fixBidi("ב־C וב־C++, שבהן")).toBe("ב־C וב־C++‎, שבהן");
    expect(fixBidi("ב־decimal(18,2) בנקודה")).toBe("ב־decimal(18,2)‎ בנקודה");
    expect(fixBidi(fixBidi("C#"))).toBe("C#‎");                     // idempotent
    expect(getContent("he").about.paragraphs[1]).toContain("C++‎");
  });
});

describe("the owner's words (2026-10-13)", () => {
  it("never describes the role sought as junior — in any language, anywhere in the site's source", () => {
    for (const f of site) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/junior|ג׳וניור|ג'וניור|גוניור|זוטר/i);
  });
  it("names no institution, in either language", () => {
    for (const f of [...site, ...files("public").filter((f) => /\.(txt|xml|json|svg|webmanifest)$/.test(f))])
      expect(namesAny(fs.readFileSync(f, "utf8")), f).toBe(false);
  });
  it("the institution check finds a term as a word, inside a word, and as a phrase, with a Hebrew prefix — without the test naming it", () => {
    const t = { word: new Set([sha256("ABC")]), part: new Map([[4, new Set([sha256("Qwer"), sha256("שלום")])]]), phrase: new Set([sha256("Alpha Beta Gamma"), sha256("מכון זה")]) };
    expect([namesAny("an ABC here", t), namesAny("ABCD", t), namesAny("xQwerty", t), namesAny("ובשלום", t)]).toEqual([true, false, true, true]);
    expect([namesAny("the Alpha Beta\nGamma one", t), namesAny("ובמכון זה", t), namesAny("Alpha Gamma", t)]).toEqual([true, true, false]);
    expect([INSTITUTION.word.size, INSTITUTION.part.get(5)?.size, INSTITUTION.phrase.size]).toEqual([1, 2, 3]);
  });
  it("Contact says what the owner wrote, in both languages", () => {
    expect(getContent("en").availability.detail).toBe("I'm looking for a software engineering opportunity that fits my skills—on-site, hybrid, or remote.");
    expect(he.availabilityHe.detail).toBe("אני מחפש הזדמנות בתחום הנדסת התוכנה שמתאימה לכישורים שלי — במשרד, במתכונת היברידית או מרחוק.");
  });
  it("the English title stays; the degree is shown on its own in both languages", () => {
    expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
    expect(about.facts[0]).toBe("B.Sc. in Computer Science");
    expect(he.aboutHe.facts[0]).toBe("תואר ראשון במדעי המחשב");
  });
});

describe("the restored assistant (app/api/chat, components/chat)", () => {
  const route = fs.readFileSync("app/api/chat/route.ts", "utf8");
  it("is the original backend: Groq, the server-side key, the rate limit and role whitelist", () => {
    expect(route).toMatch(/https:\/\/api\.groq\.com\/openai\/v1\/chat\/completions/);
    expect(route).toMatch(/process\.env\.GROQ_API_KEY/);
    expect(route).toMatch(/RATE_MAX = 5/);
    expect(route).toMatch(/\(m as Turn\)\.role === "user" \|\| \(m as Turn\)\.role === "assistant"/);
    expect(route).toMatch(/\.slice\(-2\)/);
  });
  it("its key never reaches the browser: no client module reads it", () => {
    for (const f of site.filter((f) => !f.startsWith("app/api/"))) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/GROQ_API_KEY|api\.groq\.com/);
  });
  it("carries the page's language, answers its own refusals in it, and never promises Hebrew the model can't write", () => {
    expect(route).toMatch(/LANGUAGE_RULE/);
    expect(route).toMatch(/answer in English instead/);
    const copy = route.slice(route.indexOf("const COPY"), route.indexOf("function json("));
    const keys = (block: string) => [...block.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
    const [enBlock, heBlock] = copy.split(/\n\s{2}he: \{/);
    expect(keys(heBlock)).toEqual(keys(enBlock.slice(enBlock.indexOf("en: {"))));
    expect(heBlock).toMatch(/[֐-׿]/);
    expect(getDict("he").chat.languageNote).toMatch(/באנגלית/);
  });
  it("keeps the original's own words in English, and its contact address from the site's data — never a literal", () => {
    for (const m of ["You are Ask Tay AI, a focused assistant",
      "Contact: ${socials.email}, github.com/${socials.github.handle}.",
      "point to the repository or to ${socials.email}.",
      "`Something went wrong. Try again or reach Tay at ${socials.email}.`",
      "`I'm at my limit right now — try again in a moment, or reach Tay directly at ${socials.email}.`",
      "`You just asked that. Try a different question, or reach Tay at ${socials.email}.`",
      "`The assistant is offline right now. Reach Tay directly at ${socials.email}.`",
      '"Sorry, I couldn\'t generate a response. Try again shortly."',
      'model: "llama-3.1-8b-instant"', "max_tokens: 180", "temperature: 0.6"]) expect(route, m).toContain(m);
    expect(route).not.toMatch(/[\w.]+@[\w-]+\.\w/);
    const en = getDict("en").chat;
    expect([en.title, en.subtitle, en.greeting, en.placeholder, en.input, en.close]).toEqual(["Ask Tay AI", "Answers from this portfolio only",
      "Ask me anything about Tay's projects, stack, or how he works. I'll point you at the repo if I don't know.", "What's Aegis?", "Ask a question", "Close chat"]);
  });
  it("its rules carry the verified facts and never claim a human or an institution", () => {
    expect(route).toMatch(/not a human: never claim to be either/);
    expect(route).toMatch(/never name or guess one/);
    expect(route).toMatch(/HyperLogLog to ESTIMATE/);
    expect(route).toMatch(/no timestamp or replay protection yet/);
    expect(route).toMatch(/declines before any model is called/);
    expect(route).toMatch(/never call it pay-to-win/);
    expect(route).toMatch(/academic coursework/);
  });
  it("the launcher says it is an assistant, never a person, in both languages", () => {
    expect(getDict("en").chat.launcher).toBe("Chat with the assistant");
    expect(getDict("he").chat.launcher).toBe("צ׳אט עם העוזר");
    for (const l of ["en", "he"] as const) expect(getDict(l).chat.title).toMatch(/AI/);
  });
});

describe("the sitemap", () => {
  it("lists both languages, each with the other as its alternate", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const s = sitemap();
    expect(s.map((e) => e.url)).toEqual(["https://tayshofer.dev", "https://tayshofer.dev/he"]);
    for (const e of s) expect(e.alternates?.languages).toEqual({ en: "https://tayshofer.dev", he: "https://tayshofer.dev/he" });
  });
});
