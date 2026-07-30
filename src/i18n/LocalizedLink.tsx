"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { useRouteTransition } from "@/components/RouteTransition";
import { locales } from "./config";
import { localeHref } from "./localeHref";
import { useI18n } from "./I18nProvider";

// A drop-in next/link that resolves `href` against the active locale via
// context — for leaf client components too deep to reasonably receive `lang`
// as a prop (see I18nProvider's own comment). Server components that already
// have `lang` in scope should call `localeHref(lang, href)` directly instead
// of reaching for this.
export const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function LocalizedLink({ href, onClick, ...props }, ref) {
    const { lang } = useI18n();
    const transitionTo = useRouteTransition();
    const resolvedHref = typeof href === "string" ? localeHref(lang, href) : href;

    return (
      <Link
        ref={ref}
        href={resolvedHref}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            props.target === "_blank" ||
            props.download ||
            !transitionTo
          ) {
            return;
          }

          const target = new URL(event.currentTarget.href);
          const current = new URL(window.location.href);
          const isSamePath = target.pathname === current.pathname;

          // Same-page state and hash movement belongs to Lenis/Next, not to a
          // full route curtain. External destinations retain native behavior.
          if (target.origin !== current.origin || isSamePath) return;

          event.preventDefault();
          transitionTo(target.href);
        }}
        {...props}
      />
    );
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
