import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Rutas del panel accesibles sin sesión; el resto de /admin exige cookie. */
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

/* Prefijos del sitio bilingüe anterior. Google tiene URLs /es/... y /en/...
   indexadas: un 308 al path sin prefijo consolida esas señales en el
   canonical nuevo en vez de dejar un rastro de 404. */
const LEGACY_LOCALES = ["es", "en"] as const;

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

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request, pathname);
  }

  const segment = pathname.split("/")[1];

  if ((LEGACY_LOCALES as readonly string[]).includes(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(segment.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

/* El matcher excluye assets y rutas internas: redirigir un .png rompe la
   petición, y el coste por request de pasar por aquí no es cero. */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
