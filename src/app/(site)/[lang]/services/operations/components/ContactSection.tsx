"use client";

import QuoteContact from "@/app/[lang]/quote/QuoteContact";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./ContactSection.module.css";

const COPY = {
  en: {
    heading: "Let’s take the busywork off your plate.",
    lede: "Answer a few questions and we’ll come back with a tailored Operations proposal — usually within one business day.",
  },
  es: {
    heading: "Quitemos el trabajo repetitivo de tu plato.",
    lede: "Responde algunas preguntas y volveremos con una propuesta de Operaciones a tu medida — normalmente en un día hábil.",
  },
};

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
