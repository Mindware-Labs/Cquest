import { AnimatePresence, motion } from "motion/react";
import { NAV_EASE_OUT, NAV_LINKS } from "./data";

type MobileNavProps = {
  open: boolean;
  reduced: boolean;
  onClose: () => void;
};

export default function MobileNav({ open, reduced, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: NAV_EASE_OUT }}
          className="overflow-hidden border-t border-border/60 md:hidden"
        >
          <ul className="flex flex-col px-6 py-4">
            {NAV_LINKS.map(({ label, href }, index) => (
              <motion.li
                key={label}
                initial={reduced ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + index * 0.06, ease: NAV_EASE_OUT }}
              >
                <a
                  href={href}
                  onClick={(event) => {
                    if (href === "#") event.preventDefault();
                    onClose();
                  }}
                  className="block border-b border-border/40 py-3 text-base font-medium text-foreground/90 transition-colors hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
                >
                  {label}
                </a>
              </motion.li>
            ))}
            <motion.li
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + NAV_LINKS.length * 0.06, ease: NAV_EASE_OUT }}
              className="pt-4"
            >
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onClose();
                }}
                className="cq-rect-cta flex items-center justify-center bg-petroleo px-6 py-3 text-center text-white transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                Contact us
              </a>
            </motion.li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
