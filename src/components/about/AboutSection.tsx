"use client";

import { useReducedMotion } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import LocationSection from "./LocationSection";
import MetricsSection from "./MetricsSection";
import PartnershipsSection from "./PartnershipsSection";
import StorySection from "./StorySection";
import styles from "./AboutSection.module.css";

// "Nosotros" as a home-page section — same architecture as ServicesCarousel's
// "#services": no standalone route, just an anchor other pages/nav link into
// (see hero/animation.ts's pre-wired "#about" link and navigation/data.ts's
// dict.nav.aboutUs). Reuses the same section building blocks the standalone
// /about page used, minus the pieces that would duplicate what home already
// owns: its own Hero (HeroImage) and there is no sitewide Footer/CTA on home
// today, so this section doesn't invent one either — the quote/contact CTA
// lives on its own page and in the nav, same as every other home section.
export default function AboutSection() {
  const reduced = useReducedMotion() ?? false;
  // Same ambient-pause contract as the rest of the site: always-on pulses
  // hold their breath while the tab is hidden.
  const tabVisible = useTabVisibility();

  return (
    <section id="about" className={styles.aboutSection} data-ambient-active={tabVisible && !reduced}>
      <MetricsSection reduced={reduced} />
      <StorySection reduced={reduced} />
      <LocationSection reduced={reduced} />
      <PartnershipsSection reduced={reduced} />
    </section>
  );
}
