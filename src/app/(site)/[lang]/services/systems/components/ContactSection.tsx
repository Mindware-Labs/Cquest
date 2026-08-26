"use client";

import QuoteContact from "@/app/[lang]/quote/QuoteContact";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./ContactSection.module.css";

const COPY = {
  en: {
    heading: "Let’s build the system your operation deserves.",
    lede: "Answer a few questions and we’ll come back with a tailored systems proposal — usually within one business day.",
  },
  es: {
    heading: "Construyamos el sistema que tu operación merece.",
    lede: "Responde algunas preguntas y volveremos con una propuesta de sistemas a tu medida — normalmente en un día hábil.",
  },
};

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="contact" className={styles.contactSection}>
      <QuoteContact
        service="systems"
        heading={t.heading}
        lede={t.lede}
        reduced={reduced}
      />
    </section>
  );
}
