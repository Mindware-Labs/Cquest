"use client";

import QuoteContact from "@/app/(site)/quote/QuoteContact";
import styles from "./ContactSection.module.css";

const COPY = {
  heading: "Let’s design the right operation.",
  lede: "Answer a few questions and we’ll come back with a tailored Call Center proposal — usually within one business day.",
};

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  return (
    <section id="contact" className={styles.contactSection}>
      <QuoteContact
        service="call-center"
        heading={t.heading}
        lede={t.lede}
        reduced={reduced}
      />
    </section>
  );
}
