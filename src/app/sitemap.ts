import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

const ROUTES = [
  "",
  "/services/call-center",
  "/services/operations",
  "/services/systems",
  "/services/systems/work",
  "/team",
  "/quote",
  "/location",
  "/legal/terms",
  "/legal/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}/${defaultLocale}${path}`,
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])),
        /* En sincronía con el x-default de src/i18n/alternates.ts: si el clúster
           hreflang del sitemap no cuadra con los <link> del HTML, Google lo descarta. */
        "x-default": `${SITE_URL}/${defaultLocale}${path}`,
      },
    },
  }));
}
