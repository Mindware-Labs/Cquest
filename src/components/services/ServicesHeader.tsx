import { motion } from "motion/react";
import { EASE_OUT, HEADLINE, wordVariants } from "./animation";

export default function ServicesHeader({ reduced }: { reduced: boolean }) {
  return (
    <motion.header
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.28 }}
      className="mx-auto max-w-[44rem] text-center"
    >
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 12 },
          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
        }}
        className="text-sm font-semibold text-petroleo"
      >
        Our services
      </motion.p>
      <h2 className="mt-2 font-heading text-[clamp(1.9rem,4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground">
        {HEADLINE.map((line, lineIndex) => (
          <span key={line.join("-")} className="block">
            {line.map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`} className="cq-word">
                <motion.span
                  className="cq-word-inner"
                  custom={(lineIndex === 0 ? 0 : HEADLINE[0].length) + wordIndex}
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </h2>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.6, ease: EASE_OUT, delay: 0.5 },
          },
        }}
        className="mx-auto mt-3 max-w-[56ch] text-pretty text-[.95rem] leading-6 text-[var(--text-secondary)] sm:text-base"
      >
        Explore the capability that best fits your next business move.
      </motion.p>
    </motion.header>
  );
}
