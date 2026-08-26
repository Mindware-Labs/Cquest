"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { TransitionLink } from "@/components/TransitionLink";
import { dict } from "@/lib/dictionary";
import { NAV_EASE_OUT, type NavLink } from "./data";

function subscribeNever() {
  return () => {};
}
function getIsClient() {
  return true;
}
function getIsServer() {
  return false;
}

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
  const resolvedCtaLabel = ctaLabel ?? dict.common.contactUs;
  const mounted = useSyncExternalStore(subscribeNever, getIsClient, getIsServer);
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setOpenLabel(null);
  }

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
            {/* Sin botón de cierre propio: el hamburger de Navbar ya se
                convierte en X y flota por encima de este panel (z-50 contra
                el z-40 del panel) — un segundo círculo aquí quedaba pegado
                al mismo punto y se leía como un botón fantasma duplicado. */}
            <ul className="flex flex-1 flex-col overflow-y-auto px-6 pb-4 pt-[max(6.5rem,calc(env(safe-area-inset-top)+5.5rem))]">
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
                    <TransitionLink
                      href={href}
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
                    </TransitionLink>
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
                              <TransitionLink
                                href={child.href}
                                onClick={onClose}
                                className={`block touch-manipulation py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                  dark
                                    ? "text-white/70 hover:text-celeste focus-visible:outline-celeste"
                                    : "text-foreground/70 hover:text-petroleo focus-visible:outline-petroleo"
                                }`}
                              >
                                {child.label}
                              </TransitionLink>
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
                <TransitionLink
                  href={ctaHref}
                  onClick={onClose}
                  className={`cq-rect-cta flex touch-manipulation items-center justify-center px-6 py-3 text-center transition-transform duration-150 ease-out active:scale-[0.96] ${
                    dark ? "bg-celeste text-foreground" : "bg-petroleo text-white"
                  }`}
                >
                  {resolvedCtaLabel}
                </TransitionLink>
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
