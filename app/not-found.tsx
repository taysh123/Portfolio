import type { Metadata } from "next";
import { headers } from "next/headers";
import { ButtonLink } from "@/components/ui/Button";
import { getDict } from "@/lib/dict";
import { LOCALE_HEADER, dirOf, homeOf, isLocale, type Locale } from "@/lib/i18n";

/** A 404 under /he is Hebrew; anywhere else it follows the visitor's remembered choice, else English — decided once in
 *  proxy.ts, so this page, <html lang dir> and the chrome around it agree. */
async function locale(): Promise<Locale> {
  const l = (await headers()).get(LOCALE_HEADER);
  return isLocale(l) ? l : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDict(await locale()).notFound.meta, robots: { index: false, follow: true } };
}

/**
 * A 404 previously rendered Next's unbranded default page with no metadata.
 */
export default async function NotFound() {
  const l = await locale();
  const t = getDict(l);
  return (
    <main lang={l} dir={dirOf(l)} className="flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
      <div className="w-full max-w-lg text-center">
        <h1
          className="font-semibold leading-[1.02] tracking-[var(--tracking-display)] text-fg"
          style={{ fontSize: "var(--text-h2)" }}
        >
          {t.notFound.title}
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">{t.notFound.body}</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={homeOf(l)} size="lg">
            {t.notFound.back}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
