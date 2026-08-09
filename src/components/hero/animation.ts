import type { Variants } from "motion/react";
import { SERVICE_ICON, SERVICES } from "@/components/services/data";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";
import type { NavLink } from "@/components/navigation/data";

/** ease-out-quint — mirrors `--ease-out`. Default for anything entering. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** ease-out-expo — mirrors `--ease-out-soft`. Long, cinematic settles. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/**
 * ease-in-expo — the mirror of the house expo, for anything LEAVING. Exits
 * accelerate; an exit that settles reads as a second entrance. Used by the
 * hidden variants below so a replay's retreat is one quick authored gesture
 * instead of Motion's per-value default springs (which can bounce a masked
 * word back below its own baseline — the exact curve the house banned).
 */
export const EASE_IN_EXPO = [0.7, 0, 0.84, 0] as const;

/**
 * ── Act one: the mascot alone ────────────────────────────────────────────
 *
 * Seconds from the moment the hero mounts. `scene` reaches the mascot's CSS
 * timeline as the `--qb-t0` custom property, which offsets every one of its
 * keyframe delays — so the JS clock and the CSS clock are the same clock.
 * Before this existed the copy's stagger started on mount while the mascot's
 * keyframes started when the IntersectionObserver fired, and the two tracks
 * only lined up by accident.
 *
 * Nothing else in the hero moves during act one. The stage is the mascot's.
 */
export const BEAT = {
  /** Mascot begins its roll; also the CSS scene's `--qb-t0`. */
  scene: 0.14,
} as const;

/**
 * ── Act two: the page arrives ────────────────────────────────────────────
 *
 * Offsets from the moment the mascot finishes typing its line — not from
 * mount. The trigger is the real end of the typing effect (the keystroke
 * delays are jittered, so its duration isn't knowable in advance), handed up
 * from QuestBotScene, which is why these are relative rather than absolute.
 *
 * The cascade is tighter than a normal entrance: by this point the reader has
 * been watching for four seconds and the page needs to resolve, not unfurl.
 */
export const REVEAL = {
  /** Chrome first — it frames everything that follows. */
  nav: 0,
  /**
   * Per-cell offset inside the chrome row: mark, then links, then the CTA.
   * The bar used to arrive as one block, which is the one moment in the
   * whole intro where three unrelated objects moved on the same frame —
   * and three things moving identically read as one rectangle sliding in,
   * not as a page assembling. 80ms is under the ~100ms at which the eye
   * starts counting events, so it lands as a single gesture with direction
   * (left to right, the way the frame is read) rather than as three.
   *
   * The last cell therefore starts at 0.16 — the same frame the first
   * headline word clears its mask. Chrome finishes framing exactly as the
   * statement begins, which is the hierarchy this cascade is for.
   */
  navStep: 0.08,
  /** Accent hairline draws left→right, opening the copy block. */
  rule: 0.1,
  /** First headline word clears its mask. */
  headline: 0.18,
  /** Per-word offset. 70ms reads as one wave, not seven events. */
  headlineStep: 0.07,
  /**
   * Supporting lead — last, so it's the final thing the eye lands on.
   * A BASE, not the beat itself: "last" depends on how many words the
   * headline has, which depends on the locale — see leadDelayFor below.
   */
  lead: 0.5,
} as const;

/**
 * The lead's actual delay for a given headline. The stated intent — the
 * lead lands last — was only true of the Spanish headline: at six words its
 * final mask starts at 0.53s and the fixed 0.5 was a hair early; English,
 * at nine words, had the lead arriving a full quarter-second before the
 * display tier resolved, inverting the hierarchy. 0.2s after the last mask
 * starts is the word ~70% seated on the expo curve — arrival is felt, not
 * waited for. Floored at REVEAL.lead so a hypothetical short headline never
 * lands its lead before the rule has finished drawing.
 */
export function leadDelayFor(wordCount: number): number {
  return Math.max(
    REVEAL.lead,
    REVEAL.headline + (wordCount - 1) * REVEAL.headlineStep + 0.2,
  );
}

/**
 * Beats *inside* the mascot's CSS timeline, relative to `BEAT.scene`.
 * Mirrors the delays in QuestBotScene.module.css — keep them in step.
 */
export const SCENE = {
  /** Roll-in duration. */
  roll: 1.75,
  /** Speech bubble pops. */
  say: 2.85,
  /** Typing starts. */
  type: 3.0,
  /** Everything has assembled; safe to hand the mascot to the pointer. */
  settled: 3.4,
} as const;

/**
 * Beat of silence after the last keystroke before act two begins. Without it
 * the page starts arriving on the same frame the line lands, and the two read
 * as one event instead of a statement and its answer.
 *
 * The silence is marked, not empty: the last keystroke flips `data-said` on
 * the mascot (QuestBotScene), the caret switches from burning solid to
 * breathing and the halo takes one quiet swell — the mascot handing the
 * stage over, so act two arrives as an answer rather than a scheduled event.
 */
export const INTRO_TAIL_MS = 420;

/**
 * Hard ceiling on act one. If the mascot's timeline never reports back — the
 * scene never intersects, a timer is dropped by a backgrounded tab, an error
 * in the typing effect — the rest of the page must still arrive. Nothing the
 * user needs may depend on an animation succeeding.
 */
export const INTRO_SAFETY_MS = 7000;

/** Absolute ms offset for a scene beat, including the shared `t0`. */
export function sceneAt(beat: number): number {
  return (BEAT.scene + beat) * 1000;
}

export function getHeroNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    {
      label: dict.hero.navLinks.services,
      href: "#services",
      children: SERVICES.map((service) => ({
        label: service.label[lang],
        href: service.href,
        description: service.strapline[lang],
        icon: SERVICE_ICON[service.id],
      })),
    },
    // The three bands inside "#about" on the way down the page, standing in
    // for the generic "About" link now that they name what's actually
    // there: the team headcount, the sectors diagram, and the partnerships
    // placeholder — see MetricsSection ("#metrics"), StorySection
    // ("#sectors") and AboutSection's own "#partnerships" UpcomingSection.
    { label: dict.hero.navLinks.team, href: "#metrics" },
    { label: dict.hero.navLinks.sectors, href: "#sectors" },
    { label: dict.hero.navLinks.partnerships, href: "#partnerships" },
  ];
}

/**
 * Hovering a service in the nav's Services dropdown should jump the
 * mascot's speech bubble straight to THAT service's own question instead of
 * waiting for the ambient cycle to get there on its own. Keyed by the
 * child link's href (what DesktopNav's hover callback actually hands back),
 * pointing at the matching index in dict.hero.questions — [0] is the
 * mascot's fixed opening line and is never a hover target, so the mapping
 * starts at 1. Keep both in step: reordering one without the other points
 * "Call Center" at the wrong question.
 */
export const SERVICE_QUESTION_INDEX: Record<string, number> = {
  "/services/operations": 1,
  "/services/call-center": 2,
  "/services/systems": 3,
};

/**
 * Per-word mask reveal for the headline. The word sits inside an
 * `overflow: hidden` box (`.cq-word`) and slides up from below its own
 * baseline — a percentage, never a pixel offset, so it scales with the
 * clamp()'d type size. Pure `transform`: no opacity crossfade, because the
 * mask already does the hiding and a fade would only muddy the edge.
 */
export const wordVariants: Variants = {
  /* The exit is uniform — no reverse stagger. On a replay the words leave
     as one curtain, which is calmer than unwinding the wave; hidden-variant
     transitions never fire on first mount (initial="hidden" renders without
     animating), so first paint pays nothing for this. */
  hidden: {
    y: "116%",
    transition: { duration: 0.45, ease: EASE_IN_EXPO },
  },
  visible: (i: number) => ({
    y: "0%",
    transition: {
      duration: 1.15,
      ease: EASE_OUT_EXPO,
      delay: REVEAL.headline + i * REVEAL.headlineStep,
    },
  }),
};

/**
 * The chrome row's three cells — mark, links, CTA — each on its own beat.
 *
 * Deliberately NOT `rise()` below: that one carries a 6px blur, which is the
 * right treatment for a block of copy materialising and the wrong one for
 * small tracked type. A blur on 11px letterforms reads as a focus error, and
 * it costs a filter pass on three elements at the exact moment seven word
 * masks and the field's bloom are already in flight. Chrome drops in from
 * above and lands — nothing else.
 *
 * Negative `y`, matching where the bar lives: it arrives from its own edge.
 */
export function chromeRise(delay: number): Variants {
  return {
    hidden: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.32, ease: EASE_IN_EXPO },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.72, ease: EASE_OUT, delay },
    },
  };
}

/** Generic rise used by the lead and the CTA. Blur stays ≤8px (Safari cost). */
export function rise(delay: number, distance = 18): Variants {
  return {
    hidden: {
      opacity: 0,
      y: distance,
      filter: "blur(6px)",
      transition: { duration: 0.35, ease: EASE_IN_EXPO },
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: EASE_OUT, delay },
    },
  };
}

/** Hairline that draws from its left edge — and collapses back to it. */
export const ruleVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.4, ease: EASE_IN_EXPO },
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay: REVEAL.rule },
  },
};
