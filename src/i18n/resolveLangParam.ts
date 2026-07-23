import { defaultLocale, isLocale, type Locale } from "./config";

// Next's own generated route types (LayoutProps/PageProps) type the [lang]
// segment as plain `string` — a route file declaring `params` as
// `Promise<{ lang: Locale }>` fails Next's build-time type check because a
// narrower prop type can't safely stand in for a contract that promises any
// string. Every route file should type `params` as `Promise<{ lang: string }>`
// and narrow through this instead.
export async function resolveLang(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : defaultLocale;
}
