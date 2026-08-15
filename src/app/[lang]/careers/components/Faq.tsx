"use client";

import { useRef, useState } from "react";
import { createTimeline, onScroll, stagger } from "animejs";
import { AnimatePresence, motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { EASE, useAnimeScope } from "./anime";
import styles from "./sections.module.css";

/* PENDIENTE de revisar con Recursos Humanos, sobre todo la respuesta sobre datos
   personales: tiene que reflejar la política de retención real (Ley 172-13). */
const ITEMS = {
  en: [
    {
      q: "Do I need call center experience?",
      a: "Not for entry-level roles. Most of our agents start with none — training is paid, certified and part of the job from day one. Specialist roles do list their own requirements on each posting.",
    },
    {
      q: "Do I need to speak English?",
      a: "Only for bilingual accounts, where we ask for advanced conversational English (B2+). Every other opening runs in Spanish.",
    },
    {
      q: "Is the work on site or remote?",
      a: "It depends on the role and the account: some run on site and others remotely, on daytime, evening or US-hours schedules. You always know your schedule in advance, and each posting states whether the role is on site, hybrid or remote.",
    },
    {
      q: "How long does the process take?",
      a: "About two to three weeks from application to start date, depending on the role and how fast the assessments are scheduled.",
    },
    {
      q: "What happens to my CV if there is no opening?",
      a: "It stays in our talent pool and Human Resources reviews it first when a role that fits your profile opens.",
    },
    {
      q: "What do you do with my personal data?",
      a: "We use it only to evaluate you for recruitment purposes. It is not shared with third parties or used for anything else. You can ask us to delete it at any time by writing to us.",
    },
  ],
  es: [
    {
      q: "¿Necesito experiencia en call center?",
      a: "No para las vacantes de primer empleo. La mayoría de nuestros agentes empieza sin experiencia — la capacitación es pagada, certificada y parte del trabajo desde el primer día. Los roles especializados sí listan sus propios requisitos en cada publicación.",
    },
    {
      q: "¿Necesito hablar inglés?",
      a: "Solo para las cuentas bilingües, donde pedimos inglés conversacional avanzado (B2+). El resto de las vacantes operan en español.",
    },
    {
      q: "¿Se trabaja presencial o remoto?",
      a: "Depende del puesto y de la cuenta: unos roles se trabajan presencial y otros de forma remota, en horario diurno, vespertino o de EE. UU. Siempre conoces tu horario con anticipación, y cada vacante indica si es presencial, híbrida o remota.",
    },
    {
      q: "¿Cuánto dura el proceso?",
      a: "Entre dos y tres semanas desde la postulación hasta la fecha de ingreso, según el rol y la rapidez con que se agenden las evaluaciones.",
    },
    {
      q: "¿Qué pasa con mi CV si no hay vacante?",
      a: "Queda en nuestro banco de talento y Recursos Humanos lo revisa primero cuando se abre un rol que calza con tu perfil.",
    },
    {
      q: "¿Qué hacen con mis datos personales?",
      a: "Los usamos únicamente para evaluarte con fines de reclutamiento. No se comparten con terceros ni se usan para otra cosa. Puedes pedirnos que los eliminemos en cualquier momento escribiéndonos.",
    },
  ],
};

const COPY = {
  en: { eyebrow: "Questions", title: ["Before you", "apply."] },
  es: { eyebrow: "Preguntas", title: ["Antes de", "postularte."] },
};

export default function Faq({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const root = useRef<HTMLElement>(null);

  /* Las preguntas caen una tras otra, muy juntas: son seis renglones, no seis
     bloques, y separarlas más convierte el cierre de la página en una espera. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;
      createTimeline({
        defaults: { ease: EASE },
        autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.head} > *`, { opacity: [0, 1], y: [20, 0], duration: 700, delay: stagger(80) })
        .add(
          `.${styles.faqItem}`,
          { opacity: [0, 1], y: [26, 0], duration: 560, delay: stagger(70) },
          "-=450",
        );
    },
    [reduced],
  );

  return (
    <section id="faq" ref={root} className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={container.container}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className={styles.title}>
            {t.title[0]} <strong>{t.title[1]}</strong>
          </h2>
        </div>

        {/* <details> nativo: se abre sin JavaScript, es enfocable por teclado y
            el buscador ve la respuesta en el HTML aunque esté cerrada. */}
        <div className={styles.faq}>
          {ITEMS[lang].map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* La respuesta ya no aparece de golpe: la altura se abre y el texto sube con
   ella. El `<details>` sigue siendo real — se abre sin JavaScript, es enfocable
   por teclado y el buscador ve la respuesta en el HTML aunque esté cerrada — y
   lo único que se le quita es el salto instantáneo del navegador. */
function FaqItem({
  question,
  answer,
  reduced,
}: {
  question: string;
  answer: string;
  reduced: boolean;
}) {
  const [open, setOpen] = useState(false);
  /* Al cerrar, el atributo `open` tiene que seguir puesto mientras la respuesta
     colapsa: si se quita al instante el navegador la esconde y no queda nada
     que animar. `collapsing` es lo que lo mantiene hasta que la salida acaba. */
  const [collapsing, setCollapsing] = useState(false);

  if (reduced) {
    return (
      <details className={styles.faqItem}>
        <summary className={styles.faqSummary}>{question}</summary>
        <p className={styles.faqBody}>{answer}</p>
      </details>
    );
  }

  return (
    <details className={styles.faqItem} data-open={open} open={open || collapsing}>
      <summary
        className={styles.faqSummary}
        onClick={(event) => {
          /* El navegador alterna `open` por su cuenta y sin transición: se le
             quita el control y lo lleva el estado de React. */
          event.preventDefault();
          if (open) {
            setCollapsing(true);
            setOpen(false);
            return;
          }
          setOpen(true);
        }}
      >
        {question}
      </summary>

      <AnimatePresence initial={false} onExitComplete={() => setCollapsing(false)}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <motion.p
              className={styles.faqBody}
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {answer}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </details>
  );
}
