"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/i18n/I18nProvider";
import { localeHref } from "@/i18n/localeHref";
import { NAV_EASE_OUT, type NavLink } from "./data";

type MobileSidebarProps = {
  id: string;
  open: boolean;
  reduced: boolean;
  onClose: () => void;
  links: readonly NavLink[];
  ctaHref: string;
  ctaLabel?: string;
  theme?: "light" | "dark";
};

export default function MobileSidebar({
  id,
  open,
  reduced,
  onClose,
  links,
  ctaHref,
  ctaLabel,
  theme = "light",
}: MobileSidebarProps) {
  const { dict, lang } = useI18n();
  const resolvedCtaLabel = ctaLabel ?? dict.common.contactUs;
  const [mounted, setMounted] = useState(false);
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) setOpenLabel(null);
  }, [open]);

  // A real sidebar has to lock the page behind it — otherwise the backdrop
  // reads as decorative instead of modal. Lenis scrolls by moving
  // window/html scroll under the hood, so the lock has to sit on
  // documentElement, not just body.
  useEffect(() => {
    if (!open) return;
    const { documentElement } = document;
    const previousOverflow = documentElement.style.overflow;
    documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const dark = theme === "dark";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: NAV_EASE_OUT }}
            className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden"
          />
          <motion.div
            id={id}
            role="dialog"
            aria-modal="true"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.45, ease: NAV_EASE_OUT }}
            className={`fixed inset-y-0 right-0 z-40 flex w-[82vw] max-w-sm flex-col border-l shadow-[-24px_0_60px_-20px_rgba(15,32,40,0.35)] md:hidden ${
              dark
                ? "border-white/10 bg-ink/95 backdrop-blur-xl"
                : "border-border/60 bg-background/95 backdrop-blur-xl"
            }`}
          >
            <div className="flex items-center justify-end px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.nav.menuClose}
                className={`flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  dark
                    ? "border-white/20 text-white hover:bg-white/10 focus-visible:outline-celeste"
                    : "border-border/70 text-foreground hover:bg-foreground/5 focus-visible:outline-petroleo"
                }`}
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
              {links.map(({ label, href, children }, index) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.06, ease: NAV_EASE_OUT }}
                >
                  {children ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenLabel((current) => (current === label ? null : label))
                      }
                      aria-expanded={openLabel === label}
                      className={`flex w-full touch-manipulation items-center justify-between border-b py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        dark
                          ? "border-white/10 text-white/90 hover:text-celeste focus-visible:outline-celeste"
                          : "border-border/40 text-foreground/90 hover:text-petroleo focus-visible:outline-petroleo"
                      }`}
                    >
                      {label}
                      <ChevronIcon open={openLabel === label} />
                    </button>
                  ) : (
                    <a
                      href={localeHref(lang, href)}
                      onClick={(event) => {
                        if (href === "#") event.preventDefault();
                        onClose();
                      }}
                      className={`block touch-manipulation border-b py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        dark
                          ? "border-white/10 text-white/90 hover:text-celeste focus-visible:outline-celeste"
                          : "border-border/40 text-foreground/90 hover:text-petroleo focus-visible:outline-petroleo"
                      }`}
                    >
                      {label}
                    </a>
                  )}
                  {children && (
                    <AnimatePresence initial={false}>
                      {openLabel === label && (
                        <motion.ul
                          initial={reduced ? undefined : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduced ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: NAV_EASE_OUT }}
                          className={`flex flex-col overflow-hidden border-l pl-4 ${
                            dark ? "border-white/15" : "border-border/50"
                          }`}
                        >
                          {children.map((child) => (
                            <li key={child.label} className="py-1">
                              <a
                                href={localeHref(lang, child.href)}
                                onClick={onClose}
                                className={`block touch-manipulation py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                  dark
                                    ? "text-white/70 hover:text-celeste focus-visible:outline-celeste"
                                    : "text-foreground/70 hover:text-petroleo focus-visible:outline-petroleo"
                                }`}
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              ))}
              <motion.li
                initial={reduced ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + links.length * 0.06, ease: NAV_EASE_OUT }}
                className="pt-4"
              >
                <a
                  href={localeHref(lang, ctaHref)}
                  onClick={onClose}
                  className={`cq-rect-cta flex touch-manipulation items-center justify-center px-6 py-3 text-center transition-transform duration-150 ease-out active:scale-[0.96] ${
                    dark ? "bg-celeste text-foreground" : "bg-petroleo text-white"
                  }`}
                >
                  {resolvedCtaLabel}
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
