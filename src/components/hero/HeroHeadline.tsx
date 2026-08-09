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

  /* `i` es el índice GLOBAL en la frase, no el de la oración: es lo que lee
     wordVariants para escalonar la ola, y reiniciarlo en cada oración haría
     que la segunda arrancara a la vez que la primera. */
  const renderWord = (word: string, i: number) => (
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
  );

  return (
    <motion.h1
      aria-label={text}
      initial={reduced ? false : "hidden"}
      animate={revealed ? "visible" : "hidden"}
      className={`cq-hero-h1 text-white ${className}`}
    >
      {/* Envoltura por oración. En línea no cambia nada — los dos períodos
          siguen fluyendo como un párrafo y `balance` reparte los cortes entre
          ellos. En móvil, .cq-hero-clause pasa a bloque y el corte cae en el
          punto en vez de a mitad de la segunda frase. */}
      {tiered ? (
        <>
          <span className="cq-hero-clause">
            {words.slice(0, boundary + 1).map((word, i) => renderWord(word, i))}
          </span>
          <span className="cq-hero-clause">
            {words
              .slice(boundary + 1)
              .map((word, i) => renderWord(word, boundary + 1 + i))}
          </span>
        </>
      ) : (
        words.map((word, i) => renderWord(word, i))
      )}
    </motion.h1>
  );
}
