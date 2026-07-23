import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { getLocale } from "@/i18n/getLocale";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year — a resolved choice should stick

function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return getLocale(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (isLocale(segment)) {
    // Already on a localized path (a direct link, a bookmark, a manual
    // override) — nothing to redirect, but the visit itself is a strong
    // signal, so it still updates the cookie for the next bare-root visit.
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, segment, { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
    return response;
  }

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
  return response;
}

export const config = {
  matcher: [
    // Skip API routes, Next internals, and any request for a file with an
    // extension (images, sitemap.xml, robots.txt, favicon.ico, etc.) — none
    // of those are locale-prefixed routes, and locale-redirecting them would
    // 404 the asset instead of serving it.
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
