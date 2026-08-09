"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { wordVariants } from "./animation";

/* Las palabras van aria-hidden y la frase entera en aria-label: un lector de
   pantalla oye una oración, no siete fragmentos. */
export default function HeroHeadline({
  text,
  reduced,
  revealed,
  className = "",
}: {
  text: string;
  reduced: boolean;

  revealed: boolean;
  className?: string;
}) {
  const words = text.split(" ");

  /* El límite se busca, no se marca: la primera palabra terminada en punto, en
     cualquiera de los dos idiomas. Sin punto intermedio, nada se atenúa. */
  const boundary = words.findIndex((word) => word.endsWith("."));
  const tiered = boundary !== -1 && boundary < words.length - 1;

  return (
    <motion.h1
      aria-label={text}
      initial={reduced ? false : "hidden"}
      animate={revealed ? "visible" : "hidden"}
      className={`cq-hero-h1 text-white ${className}`}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            aria-hidden
            className={tiered && i > boundary ? "cq-word cq-word-soft" : "cq-word"}
          >
            <motion.span variants={wordVariants} custom={i}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.h1>
  );
}
