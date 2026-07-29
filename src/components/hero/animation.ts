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
 * ── The hero's master score ──────────────────────────────────────────────
 *
 * Seconds from the moment the hero mounts. Everything that moves in the hero
 * reads its delay from this table — the Framer-driven copy *and* the mascot's
 * CSS timeline, which receives `scene` as the `--qb-t0` custom property and
 * offsets every one of its own keyframe delays by it.
 *
 * That's the whole point: before, the copy's stagger started on mount while
 * the mascot's keyframes started when the IntersectionObserver fired, so the
 * two tracks only lined up by accident. One table, one clock.
 *
 * Reading the score: the mascot rolls in first and owns the eye. The headline
 * clears its mask *during* that roll (≈0.6s), so the message is legible long
 * before the mascot finishes assembling itself at ≈3s — the assembly is a
 * background delight, never a gate on comprehension.
 */
export const BEAT = {
  /** Nav fades down immediately — chrome should never feel late. */
  nav: 0,
  /** Mascot begins its roll; also the CSS scene's `--qb-t0`. */
  scene: 0.14,
  /** Accent hairline draws left→right, opening the copy block. */
  rule: 0.46,
  /** First headline word clears its mask. */
  headline: 0.58,
  /** Per-word offset. 90ms reads as one wave, not seven events. */
  headlineStep: 0.09,
  /** Supporting lead. */
  lead: 1.16,
  /** Primary CTA — last, so it's the final thing the eye lands on. */
  cta: 1.28,
  /** Scroll cue, once the composition has resolved. */
  cue: 1.62,
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
    { label: dict.hero.navLinks.successStories, href: "#success-stories" },
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
      delay: BEAT.headline + i * BEAT.headlineStep,
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
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay: BEAT.rule },
  },
};
