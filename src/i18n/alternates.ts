import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./config";

// Every route's metadata must set its own alternates — a blanket value in
// the root layout would get inherited verbatim by any page that forgets to
// override it, pointing Google at the wrong sibling-locale URL. `path` is
// the route's locale-less path ("" for home, "/services/bpo", ...), no
// trailing slash.
//
// Note: no metadataBase is configured (production domain isn't known at the
// time this was written), so these resolve as relative URLs — correct for
// same-origin hreflang discovery, but Next will warn during build. Set
// metadataBase once the production domain is decided.
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
