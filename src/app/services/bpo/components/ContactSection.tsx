"use client";

import QuoteContact from "@/app/cotizador/QuoteContact";
import styles from "./ContactSection.module.css";

export default function ContactSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="contact" className={styles.contactSection}>
      <QuoteContact
        service="bpo"
        heading="Let’s take the busywork off your plate."
        lede="Answer a few questions and we’ll come back with a tailored BPO proposal — usually within one business day."
        reduced={reduced}
      />
    </section>
  );
}
