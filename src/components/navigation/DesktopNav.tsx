import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import ServiceIcon from "@/components/services/ServiceIcon";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { NAV_EASE_OUT, type NavLink } from "./data";

export default function DesktopNav({
  reduced,
  inverse = false,
  links,
  activeHref = null,
  onChildHover,
}: {
  reduced: boolean;
  inverse?: boolean;
  links: readonly NavLink[];

  activeHref?: string | null;

  onChildHover?: (href: string | null) => void;
}) {
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

  const activeLabel = activeHref
    ? (links.find((link) => link.href === activeHref)?.label ?? null)
    : null;

  const markedLabel = hovered ?? activeLabel;

  const itemClass = (active: boolean) =>
    `relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
      inverse
        ? `${active ? "text-white" : "text-white/78"} hover:text-white focus-visible:outline-celeste`
        : `${active ? "text-petroleo" : "text-foreground/80"} hover:text-petroleo focus-visible:outline-petroleo`
    }`;

  return (
    <ul
      ref={navRef}
      className="hidden items-center gap-1 md:flex"
      onMouseLeave={() => setHovered(null)}

      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovered(null);
        }
      }}
    >
      {links.map(({ label, href, children }) => {
        const isOpen = openLabel === label;
        const isActive = label === activeLabel;

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

            onBlur={(event) => {
              if (!children) return;
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setOpenLabel((current) => (current === label ? null : current));
            }}
          >

            {markedLabel === label && (
              <motion.span
                aria-hidden
                layoutId="nav-marker"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 34 }
                }
                className="absolute inset-x-4 bottom-0 h-[2px] bg-celeste"
              />
            )}
            {children ? (
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenLabel(isOpen ? null : label)}
                onFocus={() => openMenu(label)}
                className={`${itemClass(isActive)} flex items-center gap-1`}
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
              <LocalizedLink
                href={href}
                onClick={(event) => href === "#" && event.preventDefault()}
                onFocus={() => setHovered(label)}

                aria-current={isActive ? "location" : undefined}
                className={`${itemClass(isActive)} block`}
              >
                {label}
              </LocalizedLink>
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

                        ? `absolute left-1/2 top-full z-10 mt-3 w-[min(38rem,calc(100vw-2.5rem))] -translate-x-1/2 overflow-hidden rounded-[4px] border shadow-[0_20px_40px_-16px_rgba(15,32,40,0.35)] backdrop-blur-xl ${
                            inverse ? "border-white/15 bg-ink/90" : "border-border/60 bg-background/95"
                          }`
                        : `absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-[4px] border p-2 shadow-[0_20px_40px_-16px_rgba(15,32,40,0.35)] backdrop-blur-xl ${
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
                                onMouseEnter={() => onChildHover?.(child.href)}
                                onMouseLeave={() => onChildHover?.(null)}
                                className="group relative flex h-full flex-col gap-3 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-celeste"
                              >
                                <span
                                  aria-hidden
                                  className={`absolute inset-2 -z-10 rounded-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                                    inverse ? "bg-white/[0.06]" : "bg-[color-mix(in_srgb,var(--brand-celeste)_8%,transparent)]"
                                  }`}
                                />
                                <span
                                  className={`inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 ${
                                    inverse ? "text-celeste" : "text-petroleo"
                                  }`}
                                >
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
                            <LocalizedLink
                              href={child.href}
                              onClick={() => setOpenLabel(null)}
                              onMouseEnter={() => onChildHover?.(child.href)}
                              onMouseLeave={() => onChildHover?.(null)}
                              className={`block rounded-[2px] px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                inverse
                                  ? "text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-celeste"
                                  : "text-foreground/80 hover:bg-[color-mix(in_srgb,var(--brand-celeste)_12%,transparent)] hover:text-petroleo focus-visible:outline-petroleo"
                              }`}
                            >
                              {child.label}
                            </LocalizedLink>
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
