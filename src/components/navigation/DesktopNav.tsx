import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);

  // Click-to-toggle dropdown, so it has to close itself on anything that
  // isn't "click the trigger again": outside clicks, Escape, or picking a
  // child link.
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

        return (
          <li key={label} className="relative">
            {hovered === label && (
              <motion.span
                layoutId="nav-hover"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 32 }
                }
                className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--brand-celeste)_16%,transparent)]"
              />
            )}
            {children ? (
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenLabel(isOpen ? null : label)}
                onMouseEnter={() => setHovered(label)}
                onFocus={() => setHovered(label)}
                className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "text-white/78 hover:text-white focus-visible:outline-celeste" : "text-foreground/80 hover:text-petroleo focus-visible:outline-petroleo"}`}
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
                href={href}
                onClick={(event) => href === "#" && event.preventDefault()}
                onMouseEnter={() => setHovered(label)}
                onFocus={() => setHovered(label)}
                className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "text-white/78 hover:text-white focus-visible:outline-celeste" : "text-foreground/80 hover:text-petroleo focus-visible:outline-petroleo"}`}
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
                    className={`absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-2xl border p-2 shadow-[0_20px_40px_-16px_rgba(15,32,40,0.35)] backdrop-blur-xl ${
                      inverse
                        ? "border-white/15 bg-ink/90"
                        : "border-border/60 bg-background/95"
                    }`}
                  >
                    <ul className="flex flex-col">
                      {children.map((child) => (
                        <li key={child.label}>
                          <a
                            href={child.href}
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
