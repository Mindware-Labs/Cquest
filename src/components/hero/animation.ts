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
  /** Accent hairline draws left→right, opening the copy block. */
  rule: 0.1,
  /** First headline word clears its mask. */
  headline: 0.18,
  /** Per-word offset. 70ms reads as one wave, not seven events. */
  headlineStep: 0.07,
  /** Supporting lead. */
  lead: 0.5,
  /** Primary CTA — last, so it's the final thing the eye lands on. */
  cta: 0.6,
  /** Scroll cue, once the composition has resolved. */
  cue: 0.78,
} as const;

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
    { label: dict.hero.navLinks.about, href: "#about" },
    { label: dict.hero.navLinks.contact, href: "/quote" },
  ];
}

/**
 * Per-word mask reveal for the headline. The word sits inside an
 * `overflow: hidden` box (`.cq-word`) and slides up from below its own
 * baseline — a percentage, never a pixel offset, so it scales with the
 * clamp()'d type size. Pure `transform`: no opacity crossfade, because the
 * mask already does the hiding and a fade would only muddy the edge.
 */
export const wordVariants: Variants = {
  hidden: { y: "116%" },
  visible: (i: number) => ({
    y: "0%",
    transition: {
      duration: 1.15,
      ease: EASE_OUT_EXPO,
      delay: REVEAL.headline + i * REVEAL.headlineStep,
    },
  }),
};

/** Generic rise used by the lead and the CTA. Blur stays ≤8px (Safari cost). */
export function rise(delay: number, distance = 18): Variants {
  return {
    hidden: { opacity: 0, y: distance, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: EASE_OUT, delay },
    },
  };
}

/** Hairline that draws from its left edge. */
export const ruleVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay: REVEAL.rule },
  },
};
