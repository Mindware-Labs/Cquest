"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import HeroActions from "@/components/hero/HeroActions";
import HeroNav from "@/components/hero/HeroNav";
import QuestBotScene from "@/components/hero/QuestBotScene";
import { useI18n } from "@/i18n/I18nProvider";
import { heroContentVariants, riseVariants } from "@/components/hero/animation";

export default function HeroImage() {
  const { dict } = useI18n();
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -24]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 0.38]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 78% at 47% 86%, color-mix(in srgb, var(--brand-petroleo) 30%, transparent), transparent 60%), radial-gradient(58% 46% at 47% 22%, color-mix(in srgb, var(--brand-celeste) 8%, transparent), transparent 70%)",
        }}
      />

      <HeroNav reduced={reduced} />

      <motion.div
        variants={heroContentVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex flex-1 flex-col"
      >
        <motion.div
          variants={riseVariants}
          className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10"
        >
          <QuestBotScene reduced={reduced} />
        </motion.div>

        <motion.div
          variants={riseVariants}
          className="flex flex-col gap-8 px-4 pb-[calc(max(2.5rem,env(safe-area-inset-bottom))+var(--curtain))] sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:px-6 lg:px-8 xl:px-10"
        >
          <p
            style={{ textWrap: "balance" }}
            className="max-w-[42ch] text-pretty text-[1.0625rem] font-light leading-relaxed text-white/85"
          >
            {dict.hero.lead}
          </p>

          <HeroActions />
        </motion.div>
      </motion.div>
    </section>
  );
}
