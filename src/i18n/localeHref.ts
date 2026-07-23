import { locales, type Locale } from "./config";

function isAlreadyPrefixed(path: string): boolean {
  return locales.some((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`));
}

// Prefixes an internal absolute href with the active locale — "/" -> "/es",
// "/cotizador?servicio=bpo" -> "/es/cotizador?servicio=bpo",
// "/#services" -> "/es#services". Leaves external links, mailto/tel, bare
// in-page anchors, and already-prefixed hrefs untouched (idempotent, so it's
// safe to call on a value that might already be localized).
export function localeHref(lang: Locale, href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;

  const [path, hash] = href.split("#");
  const prefixedPath = isAlreadyPrefixed(path) ? path : `/${lang}${path === "/" ? "" : path}`;

  return hash === undefined ? prefixedPath : `${prefixedPath}#${hash}`;
}
