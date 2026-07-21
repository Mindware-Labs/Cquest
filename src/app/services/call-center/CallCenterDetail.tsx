"use client";

import { useReducedMotion } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import CapabilitiesSection from "./components/CapabilitiesSection";
import ClientsSection from "./components/ClientsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MetricsSection from "./components/MetricsSection";
import ProcessSection from "./components/ProcessSection";
import TestimonialSection from "./components/TestimonialSection";
import styles from "./call-center.module.css";

export default function CallCenterDetail() {
  const reduced = useReducedMotion() ?? false;

  // The page's always-on status pulses (hero live-dot, metric dots) hold
  // their breath while the tab is hidden — same visibilitychange pattern as
  // ServicesCarousel's data-ambient-active, CSS pauses via [data-ambient-active="false"].
  const tabVisible = useTabVisibility();

  return (
    <article className={styles.page} data-ambient-active={tabVisible && !reduced}>
      <Hero reduced={reduced} />
      <div>
        <CapabilitiesSection reduced={reduced} />
        <ProcessSection reduced={reduced} />
        <MetricsSection reduced={reduced} />
        <ClientsSection reduced={reduced} />
        <TestimonialSection reduced={reduced} />
        <ContactSection reduced={reduced} />
      </div>
      <Footer />
    </article>
  );
}
