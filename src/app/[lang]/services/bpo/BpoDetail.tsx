"use client";

import { useReducedMotion } from "motion/react";
import CapabilitiesSection from "./components/CapabilitiesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MediaBand from "./components/MediaBand";
import MethodSection from "./components/MethodSection";
import PhotosSection from "./components/PhotosSection";
import SlaSection from "./components/SlaSection";
import styles from "./bpo.module.css";

export default function BpoDetail() {
  const reduced = useReducedMotion() ?? false;

  return (
    <article className={styles.page}>
      <Hero reduced={reduced} />
      <MediaBand reduced={reduced} />
      <div>
        <CapabilitiesSection reduced={reduced} />
        <MethodSection reduced={reduced} />
        <SlaSection reduced={reduced} />
        <PhotosSection reduced={reduced} />
        <ContactSection reduced={reduced} />
      </div>
      <Footer />
    </article>
  );
}
