"use client";

import { useReducedMotion } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import CapabilitiesSection from "./components/CapabilitiesSection";
import ContactSection from "./components/ContactSection";
import Hero from "./components/Hero";
import MediaBand from "./components/MediaBand";
import MethodSection from "./components/MethodSection";
import PhotosSection from "./components/PhotosSection";
import SlaSection from "./components/SlaSection";
import styles from "./operations.module.css";

export default function OperationsDetail() {
  const reduced = useReducedMotion() ?? false;

  // The SLA band's always-on status pulse holds its breath while the tab is
  // hidden — same visibilitychange plumbing the call-center page already
  // used for its status dots; this page was still pulsing in the background.
  const tabVisible = useTabVisibility();

  return (
    <article className={styles.page} data-ambient-active={tabVisible && !reduced}>
      <Hero reduced={reduced} />
      <MediaBand reduced={reduced} />
      <div>
        <CapabilitiesSection reduced={reduced} />
        <MethodSection reduced={reduced} />
        <SlaSection reduced={reduced} />
        <PhotosSection reduced={reduced} />
        <ContactSection reduced={reduced} />
      </div>
    </article>
  );
}
