import { locales, type Locale } from "./config";

function isAlreadyPrefixed(path: string): boolean {
  return locales.some((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`));
}

export function localeHref(lang: Locale, href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;

  const [path, hash] = href.split("#");
  const prefixedPath = isAlreadyPrefixed(path) ? path : `/${lang}${path === "/" ? "" : path}`;

  return hash === undefined ? prefixedPath : `${prefixedPath}#${hash}`;
}
