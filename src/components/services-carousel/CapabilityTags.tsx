"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties } from "react";
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

/* Rejilla y no fila de etiquetas: la etiqueta solo cargaba el título, y el
   ancho del escenario daba de sobra para decir también QUÉ es cada servicio.
   Ese es el aprovechamiento del espacio — el alto del bloque apenas cambia.

   Tres columnas cuando hay seis capacidades y dos cuando hay cuatro (Sistemas):
   con tres, la cuarta se quedaría sola en su renglón y la rejilla se lee
   incompleta. */
export default function CapabilityTags({
  service,
  reduced,
}: {
  service: Service;
  reduced: boolean;
}) {
  const { lang } = useI18n();
  const columns = service.details.length % 3 === 0 ? 3 : 2;

  return (
    <motion.ul
      variants={reduced ? undefined : tagRowVariants}
      style={{ "--svc-cols": columns } as CSSProperties}
      className="cq-svc-grid mt-7 max-w-xl md:max-w-2xl lg:mt-9 lg:max-w-4xl"
    >
      {service.details.map((detail) => (
        /* Sin `whileHover` de transform: la celda vive dentro de una rejilla de
           separadores de 1px, y moverla o escalarla abre una rendija sobre la
           celda vecina. El estado bajo el puntero lo lleva el fondo (CSS). */
        <motion.li
          key={detail.id}
          variants={reduced ? undefined : tagVariants}
          className="cq-svc"
        >
          <ServiceIcon name={detail.icon} />
          <b>{detail.title[lang]}</b>
          <i>{detail.description[lang]}</i>
        </motion.li>
      ))}
    </motion.ul>
  );
}
