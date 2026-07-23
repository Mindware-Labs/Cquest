"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { locales } from "./config";
import { localeHref } from "./localeHref";
import { useI18n } from "./I18nProvider";

// A drop-in next/link that resolves `href` against the active locale via
// context — for leaf client components too deep to reasonably receive `lang`
// as a prop (see I18nProvider's own comment). Server components that already
// have `lang` in scope should call `localeHref(lang, href)` directly instead
// of reaching for this.
export const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function LocalizedLink({ href, ...props }, ref) {
    const { lang } = useI18n();
    const resolvedHref = typeof href === "string" ? localeHref(lang, href) : href;
    return <Link ref={ref} href={resolvedHref} {...props} />;
  },
);

// Strips the leading /es or /en segment off the current pathname — for
// comparisons against locale-less route tables (SERVICE_DETAIL_PAGES,
// SERVICE_NAV_LINKS) that predate the locale prefix.
export function useLocalizedPathname(): string {
  const pathname = usePathname();
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
  }
  return pathname;
}
