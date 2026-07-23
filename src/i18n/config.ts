export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

// RD is the primary market — Spanish is what an undetectable/unknown visitor
// (a crawler with no Accept-Language, a bot, a misconfigured client) gets.
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
