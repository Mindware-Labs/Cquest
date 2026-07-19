import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  HEADLINE_ROTATE_MS,
  ROTATING_HEADLINES,
  tickerFadeVariants,
  tickerLineVariants,
} from "./animation";

type Slides = { current: number; previous: number | null };

export default function RotatingHeadline({ reduced }: { reduced: boolean }) {
  const [slides, setSlides] = useState<Slides>({ current: 0, previous: null });

  useEffect(() => {
    if (reduced) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSlides(({ current }) => ({
        current: (current + 1) % ROTATING_HEADLINES.length,
        previous: current,
      }));
    }, HEADLINE_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <h1
      style={{ textWrap: "balance" }}
      className="font-heading grid max-w-[38rem] text-[clamp(2.3rem,5.4vw,4.25rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em]"
    >
      <span className="sr-only">We power operations. You drive growth.</span>
      {ROTATING_HEADLINES.map((pair, index) => {
        const status =
          index === slides.current
            ? "active"
            : index === slides.previous
              ? "leaving"
              : "parked";
        const variants = reduced ? tickerFadeVariants : tickerLineVariants;

        return (
          <span
            key={pair.top}
            aria-hidden
            className={`col-start-1 row-start-1 select-none ${
              index === slides.current ? "" : "pointer-events-none"
            }`}
          >
            <span className="block pb-[0.08em]">
              <motion.span
                custom={0}
                variants={variants}
                initial={reduced ? status : "parked"}
                animate={status}
                className="block text-white"
              >
                {pair.top}
              </motion.span>
            </span>
            <span className="block pb-[0.08em]">
              <motion.span
                custom={1}
                variants={variants}
                initial={reduced ? status : "parked"}
                animate={status}
                className="block text-celeste"
              >
                {pair.bottom}
              </motion.span>
            </span>
          </span>
        );
      })}
    </h1>
  );
}
