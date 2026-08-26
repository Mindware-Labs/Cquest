import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { getLocale } from "@/i18n/getLocale";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/* Rutas del panel accesibles sin sesión; el resto de /admin exige cookie. */
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return getLocale(request.headers.get("accept-language"));
}

/* Solo comprueba que la cookie exista: no la valida ni consulta la base de
   datos. La verificación real vive en el layout del panel y en requireAdmin(). */
function guardAdmin(request: NextRequest, pathname: string) {
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* El panel es interno y monolingüe: queda fuera del prefijo de idioma. */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request, pathname);
  }

  const segment = pathname.split("/")[1];

  if (isLocale(segment)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, segment, { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
    return response;
  }

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  /* 308 (permanente) y no 307: una ruta sin locale siempre resuelve al mismo
     destino localizado, así que Google puede consolidar las señales de
     ranking en el canonical sin esperar a que se confirme "temporal". */
  const response = NextResponse.redirect(url, 308);
  response.cookies.set(LOCALE_COOKIE, locale, { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
  return response;
}

/* El matcher excluye assets y rutas internas: redirigir un .png a /es/... lo
   rompe, y el coste por request de pasar por aquí no es cero. */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\..*).*)",
  ],
};
