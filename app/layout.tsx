import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { siteMeta } from "@/data/socials";
import { Providers } from "@/components/providers/Providers";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { LOCALE_HEADER, DEFAULT_LOCALE, dirOf, isLocale } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { EARLY_CHAT } from "@/lib/earlyChat";
import { THEME_COOKIE, A11Y_COOKIE, parseTheme, parseA11y } from "@/lib/theme";
import { brand } from "@/lib/tokens";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Hebrew text (Geist has no Hebrew glyphs): Heebo's Hebrew subset only (app/fonts, SIL OFL — Heebo-OFL.txt), first in
 *  the stack and limited by unicode-range, so every Hebrew character comes from Heebo and every Latin one — names,
 *  code, numbers — falls through to Geist. No metric fallback of its own (an Arial stand-in without a unicode-range
 *  would take the Latin too), and Geist's own Arial stand-in comes after it, so it can no longer catch the Hebrew
 *  first. Self-hosted rather than next/font/google, which writes every subset's @font-face into the render-blocking
 *  CSS. Not preloaded: the English page draws no Hebrew in this face (globals.css). */
const heebo = localFont({
  src: "./fonts/heebo-hebrew.woff2",
  variable: "--font-hebrew",
  weight: "100 900",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F" }],
});

const titleDefault = `${siteMeta.name} — ${siteMeta.role}`;

/** What every page shares. Each page adds its own language's title, description, social card and alternates
 *  (lib/meta.ts). */
export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: {
    default: titleDefault,
    template: `%s · ${siteMeta.name}`,
  },
  applicationName: `${siteMeta.name} — Portfolio`,
  keywords: [
    "Tay Shofer",
    "software engineer",
    "C++",
    "C#",
    ".NET",
    "TypeScript",
    "React",
    "Next.js",
    "Python",
    "portfolio",
    "Computer Science",
  ],
  authors: [{ name: siteMeta.name, url: siteMeta.url }],
  creator: siteMeta.name,
  publisher: siteMeta.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
  category: "technology",
};

export const viewport: Viewport = {
  // The browser chrome colour cannot read a CSS variable, so it comes from the
  // token mirror rather than a literal that would drift from globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: brand.bg },
    { media: "(prefers-color-scheme: light)", color: brand.bgLight },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /**
   * Theme and accessibility preferences come from cookies so the server
   * renders the exact `data-*` attributes the client will hydrate to — no
   * flash, no hydration mismatch, and no blocking inline script.
   *
   * The tradeoff is that reading cookies opts the route out of static
   * generation. That is a deliberate choice: correctness of the first paint
   * over a CDN cache hit. Moving to a blocking inline script would restore
   * static rendering if TTFB ever becomes the bottleneck.
   */
  const store = await cookies();
  const theme = parseTheme(store.get(THEME_COOKIE)?.value);
  const a11y = parseA11y(store.get(A11Y_COOKIE)?.value);
  // The page's language, from its path (proxy.ts): it sets lang and dir in the first byte, and the chrome's strings.
  const fromProxy = (await headers()).get(LOCALE_HEADER);
  const locale = isLocale(fromProxy) ? fromProxy : DEFAULT_LOCALE;
  const t = getDict(locale);

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-theme={theme}
      data-reduced-motion={String(a11y.reducedMotion)}
      data-high-contrast={String(a11y.highContrast)}
      data-large-text={String(a11y.largeText)}
      className={`${geistSans.variable} ${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:inline-flex focus:items-center focus:rounded-full focus:border focus:border-line-strong focus:bg-raised focus:px-5 focus:py-3 focus:text-sm focus:text-fg"
        >
          {t.skip}
        </a>
        <LocaleProvider locale={locale}>
          <Providers initialTheme={theme} initialA11y={a11y}>
            {children}
          </Providers>
        </LocaleProvider>
        {/* After the launcher, at the end of the body: an inline script waits for the stylesheets, so one at the top
            would hold the parser — and first paint — until they arrived (measured: about 90 ms on a throttled phone). */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_CHAT }} />
      </body>
    </html>
  );
}
