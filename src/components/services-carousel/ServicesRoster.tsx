"use client";

import { Fragment, type CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, VIEWPORT } from "@/components/services/motion";
import { SERVICES } from "@/components/services/data";
import { TransitionLink } from "@/components/TransitionLink";
import { dict } from "@/lib/dictionary";
import styles from "./ServicesRoster.module.css";

/* El tramo del raíl, primero: la entrada empieza por la línea que la sostiene
   y el nombre llega después, no al revés. */
const spineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.85, ease: EASE_OUT } },
};

/* Máscara por palabra, la misma gramática que el h1 del hero: el nombre de la
   línea es lo único que esta sección afirma. `custom` es el índice porque el
   nombre puede partir en dos y un stagger del padre no sobrevive al salto. */
const wordVariants: Variants = {
  hidden: { y: "116%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 1.05, ease: EASE_OUT, delay: 0.14 + i * 0.075 },
  }),
};

/* Lo que enumera entra junto y detrás del nombre: la afirmación primero, la
   prueba después. */
const bodyVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.34, staggerChildren: 0.09 } },
};

const bodyItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

export default function ServicesRoster() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      aria-label={dict.carousel.ariaLabel}
      className={`cq-carousel-sheet ${styles.roster} text-foreground md:hidden`}
    >
      <div className={container.container}>
        <p className={styles.eyebrow}>{dict.carousel.linesEyebrow}</p>

        <ul className={styles.list}>
          {SERVICES.map((service) => (
            <motion.li
              key={service.id}
              className={styles.entry}
              style={{ "--svc": service.color } as CSSProperties}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
            >
              <motion.span
                aria-hidden
                className={styles.spine}
                variants={reduced ? undefined : spineVariants}
              />

              <h2 className={styles.name}>
                {service.label.split(" ").map((word, index, words) => (
                  <Fragment key={`${word}-${index}`}>
                    <span className="cq-word">
                      <motion.span
                        variants={reduced ? undefined : wordVariants}
                        custom={index}
                      >
                        {word}
                      </motion.span>
                    </span>
                    {index < words.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </h2>

              <motion.div variants={reduced ? undefined : bodyVariants}>
                <motion.p
                  className={styles.claim}
                  variants={reduced ? undefined : bodyItemVariants}
                >
                  {service.shortLabel}
                </motion.p>

                {/* role="list" explícito: Safari le quita la semántica de lista
                    a un ul sin viñetas, y aquí sí importa que se anuncie como
                    "6 elementos" antes de leerlos. */}
                <motion.ul
                  role="list"
                  className={styles.manifest}
                  variants={reduced ? undefined : bodyItemVariants}
                >
                  {service.details.map((detail) => (
                    <li key={detail.id}>{detail.title}</li>
                  ))}
                </motion.ul>

                <motion.div variants={reduced ? undefined : bodyItemVariants}>
                  <TransitionLink href={service.href} className={styles.link}>
                    {dict.carousel.explorePrefix} {service.label}
                    <Arrow />
                  </TransitionLink>
                </motion.div>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
