"use client";

import { useReducedMotion } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import BlogSection, { type BlogTeaser } from "./BlogSection";
import MetricsSection from "./MetricsSection";
import PartnershipsSection from "./PartnershipsSection";
import StorySection from "./StorySection";
import WhyUsSection from "./WhyUsSection";
import styles from "./AboutSection.module.css";

export default function AboutSection({ teaser }: { teaser: BlogTeaser }) {
  const reduced = useReducedMotion() ?? false;

  const tabVisible = useTabVisibility();

  return (
    <section id="about" className={styles.aboutSection} data-ambient-active={tabVisible && !reduced}>
      <MetricsSection reduced={reduced} />
      <StorySection reduced={reduced} />
      <WhyUsSection reduced={reduced} />
      <BlogSection teaser={teaser} reduced={reduced} />
      <PartnershipsSection reduced={reduced} />
    </section>
  );
}
