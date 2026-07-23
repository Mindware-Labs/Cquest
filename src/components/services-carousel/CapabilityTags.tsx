"use client";

import { motion, type Variants } from "motion/react";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { Service } from "@/components/services/data";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* The tag row consumes one slot of the slide's cascade, then deals its tags
   out left-to-right on a tighter clock — a quick riffle, not a second act. */
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

/* Capabilities as quiet tags. At rest they hold still — the living backdrop
   carries the slide's ongoing motion — borrowing the hero CTA's rectangular
   language (2px radius, hairline, a 1px light catch along the top) at
   readout scale, tinted by the service colour. They move twice, briefly:
   arrival (the riffle in the slide's cascade) and a spring lift under the
   pointer, while the CSS answers with a tint bloom, an icon nod and a
   specular sweep (carousel.css). The lift lives here because Motion owns
   the tag's transform channel — a CSS hover transform would be blocked by
   the entrance's inline value. Each tag keeps its capability description
   as a native tooltip. */
export default function CapabilityTags({
  service,
  reduced,
}: {
  service: Service;
  reduced: boolean;
}) {
  return (
    <motion.ul
      variants={reduced ? undefined : tagRowVariants}
      className="mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-2.5"
    >
      {service.details.map((detail) => (
        <motion.li
          key={detail.title}
          variants={reduced ? undefined : tagVariants}
          whileHover={reduced ? undefined : { y: -3, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          title={detail.description}
          className="cq-cap"
        >
          <ServiceIcon name={detail.icon} />
          <span>{detail.title}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
