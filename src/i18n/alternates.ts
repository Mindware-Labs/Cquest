import type { Metadata } from "next";
import { locales, type Locale } from "./config";

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
      "x-default": path === "" ? "/" : path,
    },
  };
}
