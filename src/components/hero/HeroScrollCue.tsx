"use client";

import { motion, type MotionStyle, type MotionValue } from "motion/react";
import { EASE_IN_EXPO, EASE_OUT } from "./animation";

/* Afordancia de scroll. Decorativa — la página baja igual — así que va oculta
   a tecnología asistiva, y se apaga en cuanto el lector ya hizo caso. */
export default function HeroScrollCue({
  reduced,
  ambient,
  revealed,
  opacity,
  cueDelay,
}: {
  reduced: boolean;
  ambient: boolean;

  revealed: boolean;
  opacity: MotionValue<number>;

  cueDelay: number;
}) {
  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--curtain)+0.4rem)] z-10 hidden justify-center md:flex"
    >
      <motion.span
        initial={reduced ? false : { opacity: 0, scaleY: 0.4 }}
        animate={revealed ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.4 }}
        transition={
          revealed
            ? { duration: 0.9, ease: EASE_OUT, delay: cueDelay }
            : { duration: 0.3, ease: EASE_IN_EXPO }
        }
        data-ambient={ambient ? "on" : "off"}

        data-revealed={revealed ? "true" : "false"}

        /* Engancha la fase del loop a esta entrada: la animación es `none` hasta
           el flip, así que cada carga muestra el mismo primer frame. */
        style={{ "--cq-cue-run-delay": `${(cueDelay + 0.35).toFixed(2)}s` } as MotionStyle}
        className="cq-scroll-cue origin-top"
      />
    </motion.div>
  );
}
