"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import HeroActions from "@/components/hero/HeroActions";
import HeroHeadline from "@/components/hero/HeroHeadline";
import HeroNav from "@/components/hero/HeroNav";
import HeroScrollCue from "@/components/hero/HeroScrollCue";
import QuestBotScene from "@/components/hero/QuestBotScene";
import { useI18n } from "@/i18n/I18nProvider";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import {
  BEAT,
  EASE_OUT_EXPO,
  INTRO_SAFETY_MS,
  REVEAL,
  rise,
  ruleVariants,
} from "@/components/hero/animation";

export default function HeroImage() {
  const { dict } = useI18n();
  const reduced = useReducedMotion() ?? false;
  const tabVisible = useTabVisibility();
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  /* Act one / act two. False means the mascot has the hero to itself. */
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Lenis delivers scroll in sub-pixel eased steps; feeding that straight into
     three parallax layers makes them shimmer against each other. One spring
     smooths the source, so every layer reads off the same settled value. */
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.35,
  });

  /* Depth on exit. Three planes, each leaving at its own rate: the light field
     lags behind (deep), the mascot leaves fastest and shrinks slightly (near),
     the copy drifts just enough to feel unpinned. Before, all three shared a
     single 24px shift — technically parallax, perceptually a flat card. */
  const fieldY = useTransform(progress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "11%"]);
  const fieldOpacity = useTransform(progress, [0, 1], reduced ? [1, 1] : [1, 0.55]);
  const sceneY = useTransform(progress, [0, 1], reduced ? [0, 0] : [0, -104]);
  const sceneScale = useTransform(progress, [0, 1], reduced ? [1, 1] : [1, 0.94]);
  const sceneOpacity = useTransform(progress, [0, 1], reduced ? [1, 1] : [1, 0.1]);
  const copyY = useTransform(progress, [0, 1], reduced ? [0, 0] : [0, -30]);
  const copyOpacity = useTransform(progress, [0, 1], reduced ? [1, 1] : [1, 0.22]);
  /* The cue has done its job the moment scrolling starts. */
  const cueOpacity = useTransform(progress, [0, 0.09], reduced ? [1, 1] : [1, 0]);

  /* Decorative loops only run while someone can actually see them. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* ── Escape hatches out of act one ────────────────────────────────────
     The intro holds the nav, the headline and the CTA at opacity 0 for about
     five seconds. Two things must never be true of that hold:

     1. It must not be able to get stuck. QuestBotScene reports the real end
        of its typing, but if that report never arrives — the scene never
        intersects, a backgrounded tab drops the timers — the page still has
        to arrive. INTRO_SAFETY_MS is the backstop.
     2. It must not trap anyone. If the reader scrolls, taps or presses a key
        they have stopped watching the animation, and holding the chrome back
        from someone actively reaching for it is just a broken page. Any of
        those cuts straight to act two. */
  useEffect(() => {
    if (revealed || reduced) return;

    const cap = window.setTimeout(reveal, INTRO_SAFETY_MS);
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("pointerdown", reveal);
    window.addEventListener("keydown", reveal);

    return () => {
      window.clearTimeout(cap);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("keydown", reveal);
    };
  }, [revealed, reduced, reveal]);

  const ambient = onScreen && tabVisible && !reduced;

  /* ── Pointer light ────────────────────────────────────────────────────
     A wide, dim highlight trailing the cursor. The spring is deliberately
     slack (low stiffness, high mass) so the light arrives about a second
     after the pointer does — track it exactly and it reads as a cursor
     effect; make it lag and it reads as a physical light being carried
     across the room. Measured against the viewport rather than the section,
     so there is no rect to read and no layout thrash on pointermove. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const lightSpring = { stiffness: 38, damping: 24, mass: 1.4 } as const;
  const lightX = useTransform(useSpring(pointerX, lightSpring), [-1, 1], ["-40vw", "40vw"]);
  const lightY = useTransform(useSpring(pointerY, lightSpring), [-1, 1], ["-38vh", "38vh"]);

  useEffect(() => {
    if (!ambient) return;
    /* Touch has no hovering pointer, and a stray tap would strand the light
       in a corner for the rest of the visit. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const apply = () => {
      frame = 0;
      pointerX.set((clientX / window.innerWidth) * 2 - 1);
      pointerY.set((clientY / window.innerHeight) * 2 - 1);
    };
    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ambient, pointerX, pointerY]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      <motion.div
        aria-hidden
        style={{ y: fieldY, opacity: fieldOpacity }}
        className="pointer-events-none absolute inset-0"
      >
        {/* Painted back to front: static field, then the moving light, then
            grain over all of it (it has to dither the gradients it sits on,
            so it must come after them), then the vignette last so the corner
            falloff is the final word on contrast. */}
        <div className="cq-hero-field" />

        <div className="cq-hero-ambience" data-ambient={ambient ? "on" : "off"}>
          <span className="cq-hero-glow cq-hero-glow--a" />
          <span className="cq-hero-glow cq-hero-glow--b" />
          <span className="cq-hero-glow cq-hero-glow--c" />
          <span className="cq-hero-horizon" />
          <span className="cq-hero-sweep" />
          <motion.span className="cq-hero-pointer" style={{ x: lightX, y: lightY }} />
          <span className="cq-hero-grain" />
        </div>

        <div className="cq-hero-vignette" />
      </motion.div>

      <HeroNav reduced={reduced} revealed={revealed} />

      <motion.div
        style={{ y: sceneY, scale: sceneScale, opacity: sceneOpacity }}
        className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay: BEAT.scene }}
          className="w-full"
        >
          <QuestBotScene reduced={reduced} ambient={ambient} onIntroDone={reveal} />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        initial={reduced ? false : "hidden"}
        animate={revealed ? "visible" : "hidden"}
        /* Deliberately NOT inert as a block. `inert` pulls a subtree out of
           the accessibility tree, and the h1 is the page's only heading — a
           screen reader landing here during act one must still find it. Text
           that is merely invisible costs nothing; it's the focusable CTA
           inside that needs neutralising, so the guard sits on that alone. */
        className="relative z-10 px-4 pb-[calc(max(2.5rem,env(safe-area-inset-bottom))+var(--curtain))] sm:px-6 lg:px-8 xl:px-10"
      >
        {/* The headline spans the full measure, and the row beneath it is
            anchored at both ends — lead on the left, CTA on the right. Hanging
            the CTA off the headline's own column instead left it stranded in
            the far corner with nothing on the opposite side to balance the
            weight of the type. */}
        <motion.div aria-hidden variants={ruleVariants} className="cq-hero-rule" />

        <HeroHeadline
          text={dict.hero.headline}
          reduced={reduced}
          revealed={revealed}
          className="mt-6"
        />

        {/* Negative on purpose. The headline's own line box already carries
            ~28px below its last baseline — one full line of the lead — so zero
            margin still reads as a full line break. Pulling back 8px claws
            into that leading and lands at ~20px optically, ~10px between the
            'y' descender and the lead's cap line. That descender clearance is
            the hard floor: past roughly -8px the two start to touch.

            The copy block is bottom-anchored — the scene above absorbs the
            flex slack — so this gap sets how far the headline sits *down* the
            frame, not how far the lead sits up. */}
        <div className="-mt-2 grid items-end gap-x-12 gap-y-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <motion.p
            variants={rise(REVEAL.lead)}
            style={{ textWrap: "balance" }}
            className="max-w-[42ch] text-pretty text-[1.0625rem] font-light leading-relaxed text-white/85"
          >
            {dict.hero.lead}
          </motion.p>

          {/* An invisible link lying across the mascot is a trap for keyboard
              and pointer alike — inert until it's actually on screen. */}
          <motion.div variants={rise(REVEAL.cta, 14)} inert={!revealed}>
            <HeroActions />
          </motion.div>
        </div>
      </motion.div>

      <HeroScrollCue
        reduced={reduced}
        ambient={ambient}
        revealed={revealed}
        opacity={cueOpacity}
      />
    </section>
  );
}
