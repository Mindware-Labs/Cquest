"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { useRouteTransition } from "@/components/RouteTransition";
import { locales } from "./config";
import { localeHref } from "./localeHref";
import { useI18n } from "./I18nProvider";

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

          if (target.origin !== current.origin || isSamePath) return;

          event.preventDefault();
          transitionTo(target.href);
        }}
        {...props}
      />
    );
  },
);

export function useLocalizedPathname(): string {
  const pathname = usePathname();
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
  }
  return pathname;
}
