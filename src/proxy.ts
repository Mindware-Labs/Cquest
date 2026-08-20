import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { getLocale } from "@/i18n/getLocale";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return getLocale(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (isLocale(segment)) {
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

/* El matcher excluye assets y rutas internas: redirigir un .png a /es/... lo
   rompe, y el coste por request de pasar por aquí no es cero.

   `admin` está excluido por la misma razón que `api`: el panel no es contenido
   localizado, vive fuera del sistema de idiomas. Sin esta exclusión, /admin se
   redirige a /es/admin — que no existe — y termina en el catch-all. */
export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|.*\\..*).*)",
  ],
};
