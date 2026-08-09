import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./config";

/* Fuente única de canonical + hreflang. El x-default tiene que coincidir con
   el del sitemap (src/app/sitemap.ts) o Google descarta el clúster. */
export function localeAlternates(lang: Locale, path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(locales.map((locale) => [locale, `/${locale}${path}`]));
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...languages,

      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
