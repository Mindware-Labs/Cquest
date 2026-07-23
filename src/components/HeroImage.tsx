"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import HeroActions from "@/components/hero/HeroActions";
import HeroBackdrop from "@/components/hero/HeroBackdrop";
import HeroNav from "@/components/hero/HeroNav";
import RotatingHeadline from "@/components/hero/RotatingHeadline";
import {
  EASE_OUT,
  checkDrawVariants,
  heroContentVariants,
  riseVariants,
} from "@/components/hero/animation";

export default function HeroImage() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 54]);
  const imageScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.07]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -24]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 0.38]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], reduced ? [1, 1] : [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      <HeroBackdrop imageY={imageY} imageScale={imageScale} />
      <HeroNav reduced={reduced} />

      <motion.div
        variants={heroContentVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-[calc(max(4rem,env(safe-area-inset-bottom))+var(--curtain))] pt-28 sm:px-12 sm:pt-32 lg:px-16"
      >
        <RotatingHeadline reduced={reduced} />
        <motion.p
          variants={riseVariants}
          className="mt-5 max-w-[50ch] text-pretty text-[1.125rem] font-light leading-relaxed text-white/90"
        >
          Call center, operations and systems development — one partner
          across your three growth priorities.
        </motion.p>
        <motion.div variants={riseVariants} className="mt-10">
          <HeroActions />
        </motion.div>
        <motion.p
          variants={riseVariants}
          className="mt-10 flex items-center gap-2 border-t border-white/12 pt-6 text-[0.875rem] text-white/80"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0 text-celeste"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path variants={checkDrawVariants} d="M2.5 8.5 6 12l7.5-8" />
          </svg>
          Call Center · Operations · Systems Development — 24/7 coverage
        </motion.p>
      </motion.div>

      <motion.div
        style={{ opacity: cueOpacity, bottom: "calc(var(--curtain) + 1.75rem)" }}
        className="absolute left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <motion.a
          href="#services"
          aria-label="Scroll to services"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.4 }}
          className="flex flex-col items-center gap-2.5"
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/55">
            Scroll
          </span>
          <span aria-hidden className="cq-scroll-cue" />
        </motion.a>
      </motion.div>
    </section>
  );
}
