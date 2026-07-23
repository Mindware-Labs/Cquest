import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./config";

// Every route's metadata must set its own alternates — a blanket value in
// the root layout would get inherited verbatim by any page that forgets to
// override it, pointing Google at the wrong sibling-locale URL. `path` is
// the route's locale-less path ("" for home, "/services/operations", ...), no
// trailing slash.
//
// Relative URLs here resolve against the `metadataBase` set in
// [lang]/layout.tsx's generateMetadata — same NEXT_PUBLIC_SITE_URL as
// sitemap.ts/robots.ts, so canonical/hreflang/sitemap all agree on one domain.
export function localeAlternates(lang: Locale, path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(locales.map((locale) => [locale, `/${locale}${path}`]));
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...languages,
      // Must be a URL that itself resolves with a 200 — `proxy.ts` 3xx-redirects
      // every locale-less path, so pointing x-default at the bare path (as this
      // used to do) put a redirecting URL in the hreflang cluster, which Google
      // may discard the whole set over. The default-locale URL is the real page.
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
