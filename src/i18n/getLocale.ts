import { defaultLocale, isLocale, type Locale } from "./config";

// A dependency-free Accept-Language match against exactly two locales — no
// need for @formatjs/intl-localematcher + negotiator for a two-way choice.
// "es-DO,es;q=0.9,en-US;q=0.6" -> entries ["es-DO","es","en-US"], ranked by
// their declared q (defaulting to 1 when omitted), first supported wins.
export function getLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? parseFloat(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight };
    })
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}
