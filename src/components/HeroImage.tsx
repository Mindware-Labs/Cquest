"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import HeroHeadline from "@/components/hero/HeroHeadline";
import HeroNav from "@/components/hero/HeroNav";
import HeroReactiveGrid from "@/components/hero/HeroReactiveGrid";
import HeroScrollCue from "@/components/hero/HeroScrollCue";
import QuestBotScene from "@/components/hero/QuestBotScene";
import { useI18n } from "@/i18n/I18nProvider";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import {
  BEAT,
  EASE_OUT_EXPO,
  INTRO_SAFETY_MS,
  leadDelayFor,
  rise,
  ruleVariants,
  SERVICE_QUESTION_INDEX,
} from "@/components/hero/animation";

export default function HeroImage() {
  const { dict } = useI18n();
  const reduced = useReducedMotion() ?? false;
  /* Set by HeroNav on hover of a Services dropdown link, read by
     QuestBotScene to jump its speech bubble to that service's own question.
     Lives here because HeroNav and QuestBotScene are siblings — this is
     their nearest common ancestor. */
  const [hoveredServiceHref, setHoveredServiceHref] = useState<string | null>(null);
  const pinnedQuestionIndex = hoveredServiceHref
    ? (SERVICE_QUESTION_INDEX[hoveredServiceHref] ?? null)
    : null;
  /* "The lead lands last" depends on the headline's word count, which
     depends on the locale — six words in Spanish, nine in English. Derived
     here so the lead and the cue stay on one clock. */
  const leadDelay = leadDelayFor(dict.hero.headline.split(" ").length);
  const cueDelay = leadDelay + 0.28;
  const tabVisible = useTabVisibility();
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  /* Separate, LATER gate — see the observers below. */
  const [parallaxLive, setParallaxLive] = useState(true);
  /* Act one / act two. False means the mascot has the hero to itself. */
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);
  const restartIntro = useCallback(() => setRevealed(false), []);
  /* ── Act ZERO: the room ────────────────────────────────────────────────
     The hero used to paint its finished field on frame one — full key
     light, full vignette, a dark rectangle that was simply THERE — and
     then a mascot rolled across it. The first second of the page, the one
     the reader is most certainly looking at, was the only second with
     nothing authored in it.

     This is the stage lighting itself before the actor arrives: the room
     fades up, the camera settles out of a hair of scale, and the key pool
     blooms open on the mascot's mark. The timings live in site.css and are
     tuned so the pool finishes on the frame the mascot lands on it
     (BEAT.scene + SCENE.roll ≈ 1.9s) — the light was waiting for it, and
     you can see it was waiting.

     One rAF, not an immediate flip: the dark state has to be COMMITTED for
     a frame or the transition has no start value to run from and the whole
     ignition is skipped. Same clock as everything else in the hero (the
     mascot's own `beginRun`, the copy's Motion cascade) — all of it starts
     in a mount effect, so the room and its actor share a t0. */
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Lenis is the only source of damping. Keeping the transforms directly tied
     to its eased progress prevents a second spring from lagging behind the
     gesture. The field recedes subtly while the foreground leaves as one calm
     plane, matching the physical handoff into the services sheet. */
  const fieldY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 54]);
  const fieldScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.07]);
  /* One value, not two. The copy used to have its own pair with exactly the
     same range — a second motion value writing the same number to a second
     promoted layer, and one more thing to keep in step by hand.

     The range ends at 0.55, not 1: the sheet's top edge passes the
     composition's centre at roughly that point (half a viewport plus the
     curtain, over a track of 100svh + curtain), so anything after it plays
     to a covered stage. Compressing the drift and fade into the visible
     window is what makes the exit read as authored — the stage visibly
     dims and recedes in answer to the gesture, then the sheet covers it.
     useTransform clamps past the last stop, so p > 0.55 simply holds. The
     0.2 midpoint keeps a hesitant half-scroll from washing the hero out:
     the fade accelerates as commitment increases. */
  const sceneY = useTransform(scrollYProgress, [0, 0.55], reduced ? [0, 0] : [0, -24]);
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.55],
    reduced ? [1, 1, 1] : [1, 0.92, 0.42],
  );
  /* The cue has done its job the moment scrolling starts. */
  const cueOpacity = useTransform(
    scrollYProgress,
    [0, 0.12],
    reduced ? [1, 1] : [1, 0],
  );

  /* ── Two gates, deliberately, because they answer two different questions
        and their right answers land at very different scroll positions.

     `onScreen` — "can anyone still see the decorative loops?" The hero is
     100svh + the curtain overlap, so a plain observer keeps it on screen
     until its very last pixel clears the top of the window, which is well
     after the services sheet has slid up and covered it. The -25% top margin
     retires it once its bottom edge passes the upper quarter of the
     viewport: by then the mascot, which sits centred in the section, has been
     off screen for a quarter of a viewport, and what remains below it is a
     strip of dark field with the sheet already over most of it.

     `parallaxLive` — "are the three planes still MOVING?" This used to be the
     same flag, and that was the single biggest cost on the descent. The
     parallax runs to `end start`, i.e. it is still writing new transforms
     until the hero's bottom edge reaches the top of the window — roughly the
     last fifth of the descent AFTER the -25% margin has already fired. Taking
     `will-change: transform` off three full-viewport planes while Motion is
     still setting a new transform on them every frame is the worst possible
     trade: the browser drops the composited layers and goes back to
     re-painting two gradient stacks, a masked canvas, a vignette and a grain
     tile, sixty times a second, for exactly the stretch where the sheet below
     also needs the budget. The +25% top margin holds the promotion until the
     hero is a quarter-viewport clear of the fold — past the end of the
     parallax in both directions, so it also re-promotes BEFORE the transforms
     start moving again on the way back up. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const ambientIo = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "-25% 0px 0px 0px", threshold: 0 },
    );
    const parallaxIo = new IntersectionObserver(
      ([entry]) => setParallaxLive(entry.isIntersecting),
      { rootMargin: "25% 0px 0px 0px", threshold: 0 },
    );
    ambientIo.observe(node);
    parallaxIo.observe(node);
    return () => {
      ambientIo.disconnect();
      parallaxIo.disconnect();
    };
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

  return (
    <section
      ref={sectionRef}
      id="hero"
      /* Read by styles/site.css to hand the parallax planes' layers back
         once the hero has left. `will-change: transform` on a full-viewport
         element is a standing reservation of GPU memory, and they were being
         held for the whole page. `data-parallax`
         and not `data-onscreen`: the release has to wait for the transforms
         to stop, not for the loops to park. See the observers above. */
      data-onscreen={onScreen ? "true" : "false"}
      data-parallax={parallaxLive ? "true" : "false"}
      /* Act zero's gate — see the rAF above and the ignition block in
         site.css. */
      data-stage={lit ? "lit" : "dark"}
      /* The same flag the copy's Motion cascade runs on, published to CSS so
         the FIELD can answer the reveal too: act two is not just chrome and
         type arriving, it's the room opening up around them. Read by the key
         pool, the vignette and the accent rule's spark in site.css — the
         ambience layer below keeps its own copy because it is nested inside
         the parallax plane and reads it as a direct parent. */
      data-revealed={revealed ? "true" : "false"}
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      <motion.div
        aria-hidden
        style={{ y: fieldY, scale: fieldScale }}
        className="cq-hero-plane pointer-events-none absolute inset-x-0 -inset-y-8"
      >
        {/* A precise operational surface: the grid deforms locally under the
            pointer while the field and vignette preserve content hierarchy. */}
        <div className="cq-hero-field" />

        <div
          className="cq-hero-ambience"
          data-ambient={ambient ? "on" : "off"}
          data-revealed={revealed ? "true" : "false"}
        >
          <HeroReactiveGrid ambient={ambient && revealed} reduced={reduced} />
        </div>

        {/* Outside the ambience on purpose: the grain's job is to keep the
            bare gradient from banding, and act one — five seconds of the
            audience staring at exactly that gradient — is where it earns
            its keep. Texture is the room's constant; what the reveal
            brings up is light. Same paint order as before (above the
            canvas, below the vignette). */}
        <span className="cq-field-grain" />

        <div className="cq-hero-vignette" />
      </motion.div>

      <HeroNav
        reduced={reduced}
        revealed={revealed}
        onServiceHover={setHoveredServiceHref}
      />

      {/* ── The composition ──────────────────────────────────────────────
          One plane holding both halves, and the reason is that "the copy and
          the mascot sit at the same height" has to be structural. They were
          two independently placed boxes — the mascot centred in whatever the
          flex column had left over after the nav, the copy pinned at a
          measured 27% down the section — so their shared axis was a number
          that happened to agree, and it stopped agreeing the moment either
          the nav's height or the headline's measure moved. Two cells of one
          grid cannot drift apart.

          Absolutely placed from the section's top edge to the curtain line,
          NOT in the flex flow. The curtain is the strip the services sheet
          slides up over, so the last row of hero anyone actually sees is
          `100svh` — centring inside that band is what puts equal air above
          and below. Out of flow also means the nav no longer pushes the
          composition down its own height: the nav is chrome pinned to the top
          edge and simply overlaps, which is the only way the centre of the
          composition can be the centre of the section.

          Below lg the two can't share an axis without landing on top of each
          other, so the band splits into two equal halves with each half
          centring its own cell — the same symmetry, stacked. From lg both
          cells collapse onto row 1 / column 1 and centre together. */}
      <motion.div
        style={{ y: sceneY, opacity: sceneOpacity }}
        /* `cq-hero-band` is the hook for two plain-CSS refinements in
           site.css: the svh/lvh band floor (--hero-band-bottom — on phones
           the hero grows to 100lvh while this band keeps measuring the
           100svh first frame), and the landscape-phone guard that collapses
           the two rows into the desktop composition below 560px of height. */
        className="cq-hero-band cq-hero-plane absolute inset-x-0 bottom-[var(--hero-band-bottom)] top-0 z-10 grid grid-rows-2 items-center px-4 sm:px-6 lg:grid-rows-1 lg:px-8 xl:px-10"
      >
        {/* First in the DOM, second in the frame. The stage's box is far
            wider than the mascot drawn inside it, so on desktop it lies
            across the copy's column; keeping the copy after it means the copy
            wins the hit test over its own text, instead of the reader getting
            the mascot's replay cursor while pointing at the headline. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay: BEAT.scene }}
          className="row-start-2 w-full lg:col-start-1 lg:row-start-1"
        >
          <QuestBotScene
            reduced={reduced}
            ambient={ambient}
            onIntroDone={reveal}
            onReplayStart={restartIntro}
            pinnedQuestionIndex={pinnedQuestionIndex}
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : "hidden"}
          animate={revealed ? "visible" : "hidden"}
          /* Not `inert`: the h1 inside is the page's only heading, and a
             screen reader landing here during act one must still find it.
             Text that is merely invisible costs nothing.

             The inset goes on the cell, not on any one child: the rule, the
             headline and the lead share a left edge, and so does the nav's
             mark, which reads the same property as a margin. It is defined
             once on `.cq-hero` in site.css — including the breakpoint it
             turns on at, which is why there is no `lg:` here. */
          className="row-start-1 ps-[var(--hero-inset)] lg:col-start-1 lg:row-start-1"
        >
          <motion.div aria-hidden variants={ruleVariants} className="cq-hero-rule" />

          {/* No margins of its own in either direction — both gaps belong
              to the headline, the only element of the lockup that changes
              size. See `margin-top`/`margin-bottom` on `.cq-hero-h1`. */}
          <HeroHeadline
            text={dict.hero.headline}
            reduced={reduced}
            revealed={revealed}
          />

          <motion.p variants={rise(leadDelay)} className="cq-hero-lead">
            {dict.hero.lead}
          </motion.p>
        </motion.div>
      </motion.div>

      <HeroScrollCue
        reduced={reduced}
        ambient={ambient}
        revealed={revealed}
        opacity={cueOpacity}
        /* After the lead — the cue is the last thing to resolve. */
        cueDelay={cueDelay}
      />
    </section>
  );
}
