import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";

// The sitemap.xml spec requires absolute URLs — relative paths are invalid.
// No production domain is wired up anywhere in this project yet, so this
// reads from an env var with an obviously-fake fallback rather than silently
// shipping a technically-invalid sitemap. Set NEXT_PUBLIC_SITE_URL once the
// production domain is decided.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

// Every real, indexable route — "" is home, no trailing slash. Keep in sync
// with the actual [lang]/** route tree (checked in Phase 4's final pass).
// /services itself is excluded: it's a redirect-only route, not a page.
const ROUTES = [
  "",
  "/services/call-center",
  "/services/bpo",
  "/services/systems",
  "/services/systems/work",
  "/cotizador",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}/${defaultLocale}${path}`,
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])),
        // Kept in sync with the x-default in src/i18n/alternates.ts — a
        // mismatch between the sitemap's hreflang cluster and the HTML
        // <link rel="alternate"> tags is grounds for Google to drop the pair.
        "x-default": `${SITE_URL}/${defaultLocale}${path}`,
      },
    },
  }));
}
