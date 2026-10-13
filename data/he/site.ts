import type { WorldKey } from "@/data/work";

/**
 * The page's prose in Hebrew, parallel to the English in data/ (about.ts, socials.ts, work.ts, approach.ts,
 * skills.ts). Facts, figures and links stay in the English records; tests/unit/i18n.test.ts checks that every list
 * here has the English one's length and that no number appears here that the English doesn't carry.
 *
 * House style: the author speaks in the first person (masculine), the reader is addressed in the plural; product,
 * library and protocol names stay in Latin script, joined to a Hebrew prefix with a maqaf (ב־PostgreSQL).
 */

export const siteMetaHe = {
  role: "מהנדס תוכנה",
  headline: "אני בונה תוכנה מקצה לקצה.",
  heroLead: "אפליקציות מובייל, מערכות אבטחה, כלים למפתחים ומשחקים — מהממשק ועד לתשתיות.",
  tagline: "מהנדס תוכנה שבונה מוצרים — ממשקים, מערכות וחוויות אינטראקטיביות — ומתכנן, בונה ובודק כל אחד מהם מקצה לקצה.",
};

/** The owner's Hebrew, verbatim (2026-10-13). */
export const availabilityHe = {
  detail: "אני מחפש הזדמנות בתחום הנדסת התוכנה שמתאימה לכישורים שלי — במשרד, במתכונת היברידית או מרחוק.",
};

export const aboutHe = {
  title: ["מהנדס בהכשרתי.", "בונה מטבעי."] as [string, string],
  /** The owner's Hebrew, verbatim (2026-10-13). */
  paragraphs: [
    "אני בוגר תואר ראשון במדעי המחשב ואוהב להפוך רעיונות מורכבים לתוכנה שימושית ואמינה. אני שם דגש על מודלי נתונים ברורים, גבולות מוגדרים ובדיקות שמוודאות שאילוצים חשובים נשמרים.",
    "התחלתי ב־C וב־C++, שבהן קשה להסתיר טעויות. כיום אני עובד עם C#/.NET, TypeScript ו־Python, ומקדם פרויקטים משלב הרעיון ועד למוצר עובד. אני מחפש תפקיד בהנדסת תוכנה שמתאים לכישורים שלי ומאפשר לי לתרום לבניית מוצרים שימושיים ואמינים — מהממשק ועד לתשתיות.",
  ] as [string, string],
  facts: ["תואר ראשון במדעי המחשב", "פיתוח Full-stack: ווב, מובייל ושרת", "בישראל", "עובד בעברית ובאנגלית"],
  visual: {
    label: "T Poker, Aegis, DeveloperOS ו־GRAVITY FLOW זה לצד זה: ארבעת המוצרים כפי שהם רצים.",
  },
};

export const flagshipsHe: Record<WorldKey, { title: string; lede: string; built?: string; notes: string[] }> = {
  poker: {
    title: "המשחק הביתי שלכם, מסודר.",
    lede: "משחקי אורח רצים על הטלפון, גם בלי חיבור, וכל ביי־אין, ריביי וקאש־אאוט נשארים מדויקים עד הסנט — במכשיר ובשרת.",
    built: "בניתי את אפליקציית ה־Expo ל־iOS, ל־Android ולווב, את ה־API ב־ASP.NET Core עם CQRS, ואת מנוע ההתחשבנות ב־C# וב־TypeScript.",
    notes: ["שעון טורניר", "התחשבנות בסוף הערב", "סנטים שלמים"],
  },
  aegis: {
    title: "Aegis",
    lede: "מרכז תפעול אבטחה (SOC) המאורגן בשמונה מודולים, עם גבולות קוד מפורשים וסכמת PostgreSQL משותפת.",
    notes: ["קליטה", "נרמול", "זיהוי", "דירוג איומים", "התראות", "לוח בקרה", "RabbitMQ", "SignalR"],
  },
  developeros: {
    title: "DeveloperOS",
    lede: "סביבת עבודה מקומית לקוד, שעונה מתוך הקבצים שלך — או אומרת שאין לה על מה להתבסס.",
    notes: ["הפניות file:line", "מסרבת מראש כשהאינדקס לא תומך בתשובה"],
  },
  "gravity-flow": {
    title: "GRAVITY FLOW",
    lede: "לוחצים ומחזיקים כדי להציב בור כבידה, ומושכים כוכב אבוד הביתה.",
    notes: ["בור כבידה", "כוכב אבוד", "150 שלבים ב־15 עולמות"],
  },
};

export const pokerStepsHe = [
  { label: "פותחים משחק", caption: "פותחים משחק קאש או טורניר ישירות ממסך הבית — בלי צורך בחשבון." },
  { label: "מנהלים את הטורניר", caption: "לוח הטורניר החי בטלפון של המארח: שעון הבליינדים, הבליינדים וקופת הפרסים." },
  { label: "סוגרים חשבון", caption: "התחשבנות בסוף הערב: מי משלם למי, מדויק עד הסנט." },
];

export const aegisCopyHe = {
  label: "זיהוי סריקת פורטים",
  /** The highlighted row is the product's own English output, transcribed: it stays in English (rendered lang="en"). */
  row: "Port scan detected from 10.10.10.2 (20 distinct ports in 60s)",
  onScreen: "הפלט של הגלאי עצמו. HyperLogLog ב־Redis מעריך בכמה פורטים שונים נוגע כל מקור בחלון קבוע של 60 שניות, כך שהגלאי אף פעם לא שומר את האירועים עצמם.",
  seam: "צינור האירועים רץ על RabbitMQ, דרך חוזי הודעות ב־shared kernel; שרת ה־API מרכיב את שאר המודולים באותו תהליך. לכל מודול יש DbContext משלו, אבל כולם חולקים סכמת PostgreSQL אחת — הצימוד העיקרי שצריך להפריד לפני שמפצלים לשירותים.",
};

export const aegisTraceHe = {
  main: [
    { k: "ingest", name: "קליטה", body: "הסוכן חותם על גוף הבקשה ב־HMAC; ה־API מאמת את החתימה בזמן קבוע." },
    { k: "normalise", name: "נרמול", body: "האירועים עוברים אימות כשהם מגיעים, מנורמלים למבנה קנוני אחד ומועברים הלאה דרך MassTransit ו־RabbitMQ." },
    { k: "detect", name: "זיהוי", body: "HyperLogLog ב־Redis מעריך את מספר הפורטים השונים לכל מקור בחלונות קבועים של 60 שניות; כלל סריקת הפורטים מופעל כשההערכה מגיעה ל־20." },
  ],
  fork: [
    { k: "score", name: "דירוג איומים", body: "החומרה, משקל MITRE לכל טכניקה (גבוה יותר לטכניקות שקשה יותר לזהות) ושיעור ההתראות השגויות של הכלל מוכפלים לציון אחד בין 0 ל־1." },
    { k: "alert", name: "זרם ההתראות", body: "ההתראה משודרת דרך SignalR לכל לוח בקרה מחובר של אנליסט." },
  ],
  end: { k: "live", name: "בזמן אמת", body: "היא מופיעה בפיד החי של האנליסט — השורה המודגשת למעלה." },
};

export const dosFlowHe = [
  { k: "index", name: "אינדוקס", body: "כל הרצת אינדוקס מחשבת hash לקבצים שלך ומאנדקסת מחדש רק את מה שהשתנה." },
  { k: "retrieve", name: "שליפה", body: "שאילתות רצות מול אינדקס SQLite FTS5 מקומי ומדורגות ב־BM25, עוד לפני שמודל כלשהו נקרא." },
  { k: "evidence", name: "ראיות", body: "כל תוצאה מפנה לקובץ ולטווח שורות." },
  { k: "cite", name: "ציטוט", body: "התשובות מפרטות את הקבצים והשורות שמהם הן נבנו." },
  { k: "decline", name: "או סירוב", body: "אם שום דבר באינדקס לא תואם, DeveloperOS מסרב עוד לפני שהוא קורא למודל." },
];

export const dosRefusalCaptionHe = {
  body: "הסירוב של ה־Learning Center, מילה במילה (`devos learn` מדפיס את אותו הטקסט בטרמינל). ההודעה מוצגת באנגלית, כפי שהאפליקציה כותבת אותה:",
};

export const gfFactsHe = [
  "150 שלבים ב־15 עולמות, ומכניקות חדשות שנכנסות דרך עיצוב השלבים",
  "נבנה עם Phaser 3 ו־TypeScript במצב strict, לווב ול־Android",
  "גרסה מועמדת לשחרור ל־Android — טרם פורסמה ב־Google Play",
];

export const pillarsHe = [
  { word: "לחשוב", line: "למצוא את החלק הקשה.", summary: "בדרך כלל, אילוץ אחד מעצב את כל השאר.",
    example: "T Poker: הכסף חייב להיות מדויק עד הסנט, גם במשחק אורח בטלפון בלי קליטה." },
  { word: "לבנות", line: "להפוך את הדרך הבטוחה לדרך הקלה.", summary: "לקודד אילוצים בטיפוסים, בממשקים ובמודלי נתונים — לא רק בתיעוד.",
    example: "GRAVITY FLOW: פריטים קוסמטיים מוגדרים רק בשדות חזותיים, וכל רכישה מעניקה פריטים קוסמטיים או הסרת פרסומות — שום דבר שמשנה את המשחק." },
  { word: "לשחרר", line: "לשחרר ביושר.", summary: "לבנות פרויקט שאפשר לשחזר ולבדוק, ושאומר במפורש מה עוד חסר בו.",
    example: "Aegis עולה מסקריפט הפעלה אחד, והמאגר שלו מחזיק מסמך ביקורת שמפרט את העבודה שעדיין פתוחה." },
];

/** Stack group titles and evidence lines, by group id (data/skills.ts). Tool names are not translated. */
export const skillGroupsHe: Record<string, { title: string; evidence: string }> = {
  languages: { title: "שפות",
    evidence: "צד השרת של T Poker ושל Aegis כתוב ב־C#, הלקוחות שלהם ו־GRAVITY FLOW ב־TypeScript, ו־DeveloperOS ו־Job Assistant ב־Python; Orders & Delivery כתוב ב־Java." },
  interface: { title: "מוצר וממשק",
    evidence: "Expo מציג את T Poker ב־iOS, ב־Android ובווב; לוח הבקרה של Aegis בנוי על Next.js; GRAVITY FLOW רץ על Phaser 3; JavaFX הוא הלקוח של Orders & Delivery." },
  service: { title: "שירותים ו־API",
    evidence: "Aegis מעביר אירועים דרך MassTransit ו־RabbitMQ ומזרים התראות ב־SignalR; ה־API של T Poker ב־ASP.NET Core משתמש ב־CQRS עם MediatR." },
  data: { title: "נתונים, חיפוש ומודלים",
    evidence: "DeveloperOS מחפש באינדקס SQLite FTS5 מקומי ויכול להעביר את התוצאות למודל מקומי אופציונלי; Aegis שומר את חלונות הזיהוי ב־Redis ואת הנתונים ב־PostgreSQL, שמשמש גם את ה־API של T Poker." },
  delivery: { title: "הפצה ובדיקות",
    evidence: "DeveloperOS ו־GRAVITY FLOW מריצים את הבדיקות שלהם ב־CI; Aegis עולה תחת Docker Compose; ה־API של T Poker רץ על Railway ואפליקציית הווב שלו על Vercel." },
  workflow: { title: "כלים יומיומיים", evidence: "בכל העבודה, כולל האתר הזה." },
};

/** The notes that stand in for a project name beside a tool no listed project uses (data/skills.ts). */
export const skillNotesHe: Record<string, string> = {
  "where I started": "שם התחלתי",
  "this site": "האתר הזה",
  "this site's browser tests": "בדיקות הדפדפן של האתר",
};
