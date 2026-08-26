"use client";

import QuoteContact from "@/app/(site)/quote/QuoteContact";
import styles from "./ContactSection.module.css";

const COPY = {
  heading: "Let’s take the busywork off your plate.",
  lede: "Answer a few questions and we’ll come back with a tailored Operations proposal — usually within one business day.",
};

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  return (
    <section id="contact" className={styles.contactSection}>
      <QuoteContact
        service="bpo"
        heading={t.heading}
        lede={t.lede}
        reduced={reduced}
      />
    </section>
  );
}
