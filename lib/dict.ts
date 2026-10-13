import type { Locale } from "@/lib/i18n";
import { CLIENT_DICT, type ClientDict } from "@/lib/dict-client";

/**
 * Every interface string the site renders — labels, buttons, accessible names, screen-reader text, states — in both
 * languages. The page's prose (projects, chapters, About) lives in data/ and data/he/; this file is the chrome.
 *
 * `he` is typed as `Dict`, so a key missing in Hebrew fails the build, and tests/unit/i18n.test.ts checks that no
 * Hebrew value is an untranslated copy of the English one (technical names and the stores' marks excepted).
 * Placeholders are `{name}`, filled by fmt() (lib/fmt.ts). The part client components read lives in
 * lib/dict-client.ts (they take it through LocaleProvider); this file adds the rest and merges the two.
 */
const en = {
  skip: "Skip to content",
  hero: {
    seeWork: "See the work",
    plates: "Flagship projects",
  },
  poker: {
    walk: "Walk through {name}",
    get: "Get {name}",
    webApp: "Open the web app",
    alts: [
      "T Poker home screen: start a cash game or a tournament, no account needed",
      "T Poker live tournament dashboard: prize pool, blind level and the clock",
      "T Poker end-of-night settlement: who pays whom, exact to the cent",
    ],
  },
  aegis: {
    bar: "Aegis · Alerts · Live",
    alt: "One row of the Aegis Alerts page, live: “Port scan detected from 10.10.10.2 (20 distinct ports in 60s)”, severity 65, medium, from temporal at 10.10.10.2",
    traceTitle: "One alert, start to finish",
    parallel: "Then, in parallel",
  },
  dos: {
    bar: "DeveloperOS · Search your code",
    alt: "DeveloperOS searching your own code for “ollama provider”: each result cites a file and line range — {chips} and more",
    flow: "From your files to an answer, as implemented",
  },
  gf: {
    marks: { well: "Your gravity well", star: "The star", home: "Home" },
    alt: "GRAVITY FLOW, level 55 in play: a violet gravity well pulls the star, with the green goal above and a portal pair and a gravity zone in between",
    marked: "Marked on the frame: your gravity well, the star and home.",
  },
  more: { title: "Two more" },
  tbs: { title: "Think. Build. Ship." },
  contact: {
    title: ["Let's build something", "people use."],
    email: "Email me",
    subject: "Hello Tay",
    linkedin: "LinkedIn",
    github: "GitHub",
    resume: "Download résumé (PDF)",
    resumeNote: " · two pages, 80 KB",
    previewNote: "The résumé download is left out of this review Preview.",
  },
  footer: {
    label: "Footer",
    email: "Email",
    resume: "Résumé (PDF)",
    top: "Back to top",
  },
  notFound: {
    meta: "Page not found",
    title: "That page doesn't exist.",
    body: "The link may be out of date. Everything lives on one page — head back and scroll.",
    back: "Back to the start",
  },

};

type ServerDict = typeof en;
export type Dict = ServerDict & ClientDict;
export type { ClientDict };

const he: ServerDict = {
  skip: "דילוג לתוכן",
  hero: {
    seeWork: "לעבודות",
    plates: "פרויקטים מובילים",
  },
  poker: {
    walk: "סיור ב־{name}",
    get: "הורדת {name}",
    webApp: "לאפליקציית הווב",
    alts: [
      "מסך הבית של T Poker: פתיחת משחק קאש או טורניר, בלי צורך בחשבון",
      "לוח הטורניר החי של T Poker: קופת הפרסים, רמת הבליינדים והשעון",
      "ההתחשבנות של T Poker בסוף הערב: מי משלם למי, מדויק עד הסנט",
    ],
  },
  aegis: {
    bar: "Aegis · התראות · בזמן אמת",
    alt: "שורה אחת מעמוד ההתראות של Aegis, בזמן אמת: ״Port scan detected from 10.10.10.2 (20 distinct ports in 60s)״, חומרה 65, בינונית, מ־temporal בכתובת 10.10.10.2",
    traceTitle: "התראה אחת, מההתחלה ועד הסוף",
    parallel: "ואז, במקביל",
  },
  dos: {
    bar: "DeveloperOS · חיפוש בקוד שלך",
    alt: "DeveloperOS מחפש בקוד שלך את ״ollama provider״: כל תוצאה מפנה לקובץ ולטווח שורות — {chips} ועוד",
    flow: "מהקבצים שלך לתשובה, כפי שזה ממומש",
  },
  gf: {
    marks: { well: "בור הכבידה שלך", star: "הכוכב", home: "הבית" },
    alt: "GRAVITY FLOW, שלב 55 במהלך משחק: בור כבידה סגול מושך את הכוכב, המטרה הירוקה למעלה, וביניהם זוג פורטלים ואזור כבידה",
    marked: "מסומנים על המסך: בור הכבידה שלך, הכוכב והבית.",
  },
  more: { title: "ועוד שניים" },
  tbs: { title: "לחשוב. לבנות. לשחרר." },
  contact: {
    title: ["בואו נבנה משהו", "שאנשים משתמשים בו."],
    email: "שלחו לי מייל",
    subject: "פנייה מהפורטפוליו",
    linkedin: "LinkedIn",
    github: "GitHub",
    resume: "הורדת קורות החיים באנגלית (PDF)",
    resumeNote: " · שני עמודים, 80 KB",
    previewNote: "הורדת קורות החיים לא נכללת בגרסת הבדיקה הזו.",
  },
  footer: {
    label: "קישורים בתחתית העמוד",
    email: "אימייל",
    resume: "קורות חיים (PDF)",
    top: "חזרה למעלה",
  },
  notFound: {
    meta: "העמוד לא נמצא",
    title: "העמוד הזה לא קיים.",
    body: "ייתכן שהקישור כבר לא עדכני. הכול נמצא בעמוד אחד — חזרו להתחלה וגללו.",
    back: "חזרה להתחלה",
  },

};

const SERVER: Record<Locale, ServerDict> = { en, he };
export const getDict = (l: Locale): Dict => ({ ...CLIENT_DICT[l], ...SERVER[l] });
