import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, localeOfPath } from "@/lib/i18n";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": csp,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
};

/** Security headers on the response; the page's language on the request, so the root layout can set <html lang dir>
 *  before any byte is sent (lib/i18n.ts). The address decides: / is English and /he… is Hebrew, always. Only an address
 *  with no language in it (a mistyped link, which renders the 404) follows the visitor's remembered choice. */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value === "he" ? "he" : "en";
  const locale = path === "/" || localeOfPath(path) === "he" ? localeOfPath(path) : remembered;
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  const response = NextResponse.next({ request: { headers } });
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Every page request, prefetches included: a prefetched /he must still say lang="he" dir="rtl" (and carry the CSP)
 *  when the browser later shows it. The site has no client-side route prefetching, so this costs nothing. */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|sitemap.xml|robots.txt).*)"],
};
