"use client";

import { useReducedMotion } from "motion/react";
import CapabilitiesSection from "./components/CapabilitiesSection";
import ClientsSection from "./components/ClientsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MethodSection from "./components/MethodSection";
import PactSection from "./components/PactSection";
import WorkSection from "./components/WorkSection";
import styles from "./systems.module.css";

export default function SystemsDetail() {
  const reduced = useReducedMotion() ?? false;

  return (
    <article className={styles.page}>
      <Hero reduced={reduced} />
      <div>
        <CapabilitiesSection reduced={reduced} />
        <MethodSection reduced={reduced} />
        <PactSection reduced={reduced} />
        <ClientsSection reduced={reduced} />
        <WorkSection reduced={reduced} />
        <ContactSection reduced={reduced} />
      </div>
      <Footer />
    </article>
  );
}
