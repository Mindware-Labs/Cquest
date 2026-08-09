"use client";

import { motion, type Variants } from "motion/react";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { Service } from "@/components/services/data";
import { useI18n } from "@/i18n/I18nProvider";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const tagRowVariants: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.045 } },
};
const tagVariants: Variants = {
  enter: { opacity: 0, y: 14, scale: 0.94 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

export default function CapabilityTags({
  service,
  reduced,
}: {
  service: Service;
  reduced: boolean;
}) {
  const { lang } = useI18n();
  return (
    <motion.ul
      variants={reduced ? undefined : tagRowVariants}
      className="mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-2.5"
    >
      {service.details.map((detail) => (
        <motion.li
          key={detail.id}
          variants={reduced ? undefined : tagVariants}
          whileHover={reduced ? undefined : { y: -3, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          title={detail.description[lang]}
          className="cq-cap"
        >
          <ServiceIcon name={detail.icon} />
          <span>{detail.title[lang]}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
