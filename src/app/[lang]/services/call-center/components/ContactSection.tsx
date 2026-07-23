"use client";

import QuoteContact from "@/app/[lang]/cotizador/QuoteContact";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./ContactSection.module.css";

const COPY = {
  en: {
    heading: "Let’s design the right operation.",
    lede: "Answer a few questions and we’ll come back with a tailored Call Center proposal — usually within one business day.",
  },
  es: {
    heading: "Diseñemos la operación correcta.",
    lede: "Responde algunas preguntas y volveremos con una propuesta de Call Center a tu medida — normalmente en un día hábil.",
  },
};

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
