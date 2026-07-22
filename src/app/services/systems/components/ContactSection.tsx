"use client";

import QuoteContact from "@/app/cotizador/QuoteContact";
import styles from "./ContactSection.module.css";

export default function ContactSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="contact" className={styles.contactSection}>
      <QuoteContact
        service="systems"
        heading="Let’s build the system your operation deserves."
        lede="Answer a few questions and we’ll come back with a tailored systems proposal — usually within one business day."
        reduced={reduced}
      />
    </section>
  );
}
