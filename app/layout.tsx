import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { siteMeta } from "@/data/socials";
import { JsonLd } from "@/components/seo/JsonLd";
import { Providers } from "@/components/providers/Providers";
import { THEME_COOKIE, A11Y_COOKIE, parseTheme, parseA11y } from "@/lib/theme";
import { brand } from "@/lib/tokens";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const titleDefault = `${siteMeta.name} — ${siteMeta.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: {
    default: titleDefault,
    template: `%s · ${siteMeta.name}`,
  },
  description: siteMeta.tagline,
  applicationName: `${siteMeta.name} — Portfolio`,
  keywords: [
    "Tay Shofer",
    "software engineer",
    "junior software engineer",
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
  alternates: { canonical: "/" },
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
  openGraph: {
    type: "profile",
    url: siteMeta.url,
    siteName: `${siteMeta.name} — Portfolio`,
    title: titleDefault,
    description: siteMeta.tagline,
    locale: siteMeta.locale,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteMeta.name} — ${siteMeta.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description: siteMeta.tagline,
    images: ["/opengraph-image"],
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
  colorScheme: "dark light",
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

  return (
    <html
      lang="en"
      data-theme={theme}
      data-reduced-motion={String(a11y.reducedMotion)}
      data-high-contrast={String(a11y.highContrast)}
      data-large-text={String(a11y.largeText)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:inline-flex focus:items-center focus:rounded-full focus:border focus:border-line-strong focus:bg-surface-3 focus:px-5 focus:py-3 focus:text-sm focus:text-fg"
        >
          Skip to content
        </a>
        <Providers initialTheme={theme} initialA11y={a11y}>
          {children}
        </Providers>
        <JsonLd />
      </body>
    </html>
  );
}
