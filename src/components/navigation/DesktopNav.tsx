import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { localeHref } from "@/i18n/localeHref";
import { NAV_EASE_OUT, type NavLink } from "./data";

export default function DesktopNav({
  reduced,
  inverse = false,
  links,
}: {
  reduced: boolean;
  inverse?: boolean;
  links: readonly NavLink[];
}) {
  const { lang } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Hover opens the menu instantly; closing is delayed a beat so crossing
  // the gap between the trigger and the panel below it doesn't slam it
  // shut mid-transit. Click/Enter still toggles it directly for keyboard
  // and touch, where hover never fires.
  const openMenu = (label: string) => {
    clearCloseTimer();
    setHovered(label);
    setOpenLabel(label);
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenLabel(null), 200);
  };

  useEffect(() => clearCloseTimer, []);

  // Escape and outside clicks still close it — the fallback for however it
  // was opened (hover, click, or keyboard focus).
  useEffect(() => {
    if (!openLabel) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenLabel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenLabel(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openLabel]);

  return (
    <ul
      ref={navRef}
      className="hidden items-center gap-1 md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      {links.map(({ label, href, children }) => {
        const isOpen = openLabel === label;
        // A "Services"-style menu: children carry their own icon + one-line
        // description, so they read as a mega-menu instead of a plain list.
        const isMega = Boolean(children?.[0]?.icon);

        return (
          <li
            key={label}
            className="relative"
            onMouseEnter={() => {
              if (children) openMenu(label);
              else setHovered(label);
            }}
            onMouseLeave={() => {
              if (children) scheduleClose();
            }}
          >
            {hovered === label && (
              <motion.span
                layoutId="nav-hover"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 32 }
                }
                className="absolute inset-0 rounded-[2px] bg-[color-mix(in_srgb,var(--brand-celeste)_16%,transparent)]"
              />
            )}
            {children ? (
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenLabel(isOpen ? null : label)}
                onFocus={() => openMenu(label)}
                className={`relative z-10 flex items-center gap-1 rounded-[2px] px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "text-white/78 hover:text-white focus-visible:outline-celeste" : "text-foreground/80 hover:text-petroleo focus-visible:outline-petroleo"}`}
              >
                {label}
                <svg
                  aria-hidden
                  viewBox="0 0 10 6"
                  className={`h-[7px] w-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </button>
            ) : (
              <a
                href={localeHref(lang, href)}
                onClick={(event) => href === "#" && event.preventDefault()}
                onFocus={() => setHovered(label)}
                className={`relative z-10 block rounded-[2px] px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "text-white/78 hover:text-white focus-visible:outline-celeste" : "text-foreground/80 hover:text-petroleo focus-visible:outline-petroleo"}`}
              >
                {label}
              </a>
            )}

            {children && (
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: NAV_EASE_OUT }}
                    className={
                      isMega
                        ? `absolute left-0 top-full z-10 mt-3 w-[min(92vw,34rem)] overflow-hidden rounded-[6px] border backdrop-blur-xl ${
                            inverse ? "border-white/15 bg-ink/90" : "border-border/60 bg-background/95"
                          }`
                        : `absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-[6px] border p-2 shadow-[0_20px_40px_-16px_rgba(15,32,40,0.35)] backdrop-blur-xl ${
                            inverse ? "border-white/15 bg-ink/90" : "border-border/60 bg-background/95"
                          }`
                    }
                  >
                    {isMega ? (
                      <>
                        <span aria-hidden className="block h-[2px] w-full bg-gradient-to-r from-petroleo to-celeste" />
                        <ul className={`grid grid-cols-3 divide-x ${inverse ? "divide-white/12" : "divide-border/60"}`}>
                          {children.map((child) => (
                            <li key={child.label}>
                              <LocalizedLink
                                href={child.href}
                                onClick={() => setOpenLabel(null)}
                                className="group relative flex h-full flex-col gap-3 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-celeste"
                              >
                                <span
                                  aria-hidden
                                  className={`absolute inset-2 -z-10 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                                    inverse ? "bg-white/[0.06]" : "bg-[color-mix(in_srgb,var(--brand-celeste)_8%,transparent)]"
                                  }`}
                                />
                                <span className={inverse ? "text-celeste" : "text-petroleo"}>
                                  {child.icon && <ServiceIcon name={child.icon} />}
                                </span>
                                <span
                                  className={`flex items-center gap-1.5 font-heading text-[0.95rem] font-semibold tracking-tight ${
                                    inverse ? "text-white" : "text-foreground"
                                  }`}
                                >
                                  {child.label}
                                  <Arrow className="-translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                                </span>
                                <span
                                  className={`text-[0.8rem] leading-relaxed ${
                                    inverse ? "text-white/60" : "text-muted"
                                  }`}
                                >
                                  {child.description}
                                </span>
                              </LocalizedLink>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <ul className="flex flex-col">
                        {children.map((child) => (
                          <li key={child.label}>
                            <a
                              href={localeHref(lang, child.href)}
                              onClick={() => setOpenLabel(null)}
                              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                inverse
                                  ? "text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-celeste"
                                  : "text-foreground/80 hover:bg-[color-mix(in_srgb,var(--brand-celeste)_12%,transparent)] hover:text-petroleo focus-visible:outline-petroleo"
                              }`}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </li>
        );
      })}
    </ul>
  );
}
