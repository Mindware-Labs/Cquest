import type { Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";

export const textGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } },
};

export const ringVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.1, ease: EASE_OUT }, opacity: { duration: 0.4 } },
  },
};

export const tickVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT, delayChildren: 0.2, staggerChildren: 0.035 },
  },
};

export const needleVariants: Variants = {
  hidden: { rotate: -146, opacity: 0 },
  visible: {
    rotate: 128,
    opacity: 1,
    transition: { rotate: { type: "spring", stiffness: 130, damping: 11, mass: 1, delay: 0.55 }, opacity: { duration: 0.3, delay: 0.55 } },
  },
};

export const NEEDLE_WOBBLE_TRANSITION = {
  duration: 9,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  delay: 1.7,
};

export const PING_TRANSITION = {
  duration: 2.6,
  ease: "easeOut" as const,
  repeat: Infinity,
  repeatDelay: 0.6,
};
