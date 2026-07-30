"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { wordVariants } from "./animation";

/**
 * The page's single <h1>, revealed word by word from behind per-word masks.
 *
 * A mask reveal is used instead of the blur-up this block had before because
 * the two say different things: a fade says "this was always here, you just
 * couldn't see it"; a mask says "this is arriving". For the one line that
 * carries the value proposition, arriving is the right read — and it gives
 * the eye an edge to track, which a fade never does.
 *
 * Accessibility: the visible words are `aria-hidden` and the whole string is
 * exposed once via `aria-label`, so a screen reader announces one clean
 * sentence rather than seven fragments.
 */
export default function HeroHeadline({
  text,
  reduced,
  revealed,
  className = "",
}: {
  text: string;
  reduced: boolean;
  /** False during act one, while the mascot has the stage to itself. */
  revealed: boolean;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <motion.h1
      aria-label={text}
      initial={reduced ? false : "hidden"}
      animate={revealed ? "visible" : "hidden"}
      className={`cq-hero-h1 text-white ${className}`}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span aria-hidden className="cq-word">
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
