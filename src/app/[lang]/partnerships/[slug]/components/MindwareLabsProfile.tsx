"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { Particles } from "@/components/ui/particles";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import VenomField from "./VenomField";
import styles from "./MindwareLabsProfile.module.css";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/labsmindware/",
  linkedin: "https://www.linkedin.com/company/mindwarelabs/",
  email: "labsmindware@gmail.com",
};

const COPY = {
  en: {
    eyebrow: "Partnership",
    lead: "A software engineering team building the systems behind Center Quest's operations.",
    about: {
      heading: "What Mindware Labs does",
      body: "Full-cycle software engineering: analysis and design, development, testing, deployment and maintenance of the systems themselves. Plus technical consulting and audits, so the team can either build from scratch or review what is already running in production.",
    },
    collab: {
      heading: "Working with Center Quest",
      body: "It is the same discipline Center Quest applies in its Systems Development line. We share the method: the CRMs, dashboards and automation that hold up our operations are analyzed, tested and maintained to that same standard — not handed over and abandoned.",
    },
    connect: {
      heading: "Connect",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      email: "Email",
    },
    back: "Back to partnerships",
  },
  es: {
    eyebrow: "Alianza",
    lead: "Un equipo de ingeniería de software que construye los sistemas detrás de las operaciones de Center Quest.",
    about: {
      heading: "Qué hace Mindware Labs",
      body: "Ingeniería de software de ciclo completo: análisis y diseño, desarrollo, pruebas, implementación y mantenimiento de los sistemas. A eso se suman consultoría y auditoría técnica, para entrar tanto a construir desde cero como a revisar lo que ya está en producción.",
    },
    collab: {
      heading: "Trabajando con Center Quest",
      body: "Es la misma disciplina que Center Quest aplica en su línea de Desarrollo de Sistemas. Compartimos el método: los CRMs, dashboards y automatizaciones que sostienen nuestras operaciones se analizan, se prueban y se mantienen con ese mismo estándar — no se entregan y se abandonan.",
    },
    connect: {
      heading: "Conecta",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      email: "Correo",
    },
    back: "Volver a partnerships",
  },
} as const;

export default function MindwareLabsProfile() {
  const { lang } = useI18n();
  const reduced = useReducedMotion() ?? false;
  const t = COPY[lang];

  return (
    <div data-hero-boundary className={styles.page}>
      <Particles
        className={styles.ambientField}
        quantity={40}
        color="#9d5ce0"
        size={0.5}
        ease={60}
        vy={-0.04}
      />
      <VenomField reduced={reduced} className={styles.venomField} />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>{t.eyebrow}</span>

        <span className={styles.logoWrap}>
          <Image
            src="/mindware-labs/logo_transparent_background.png"
            alt="Mindware Labs"
            width={3400}
            height={1171}
            sizes="(max-width: 672px) 256px, 352px"
            className={styles.logoImage}
            priority
          />
        </span>

        <p className={styles.lead}>{t.lead}</p>
      </header>

      <section className={styles.section}>
        <div className={`${container.container} ${styles.card}`}>
          <h2 className={styles.sectionHeading}>{t.about.heading}</h2>
          <p className={styles.sectionBody}>{t.about.body}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${container.container} ${styles.card}`}>
          <h2 className={styles.sectionHeading}>{t.collab.heading}</h2>
          <p className={styles.sectionBody}>{t.collab.body}</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.connect}`}>
        <div className={container.container}>
          <h2 className={styles.connectHeading}>{t.connect.heading}</h2>

          <div className={styles.socialRow}>
            <a
              href={SOCIAL_LINKS.instagram || undefined}
              data-disabled={SOCIAL_LINKS.instagram ? undefined : "true"}
              aria-disabled={SOCIAL_LINKS.instagram ? undefined : true}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <InstagramIcon />
              {t.connect.instagram}
            </a>
            <a
              href={SOCIAL_LINKS.linkedin || undefined}
              data-disabled={SOCIAL_LINKS.linkedin ? undefined : "true"}
              aria-disabled={SOCIAL_LINKS.linkedin ? undefined : true}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <LinkedInIcon />
              {t.connect.linkedin}
            </a>
            {/* mailto no abre pestaña: target="_blank" deja una en blanco detrás
                del cliente de correo. */}
            <a
              href={SOCIAL_LINKS.email ? `mailto:${SOCIAL_LINKS.email}` : undefined}
              data-disabled={SOCIAL_LINKS.email ? undefined : "true"}
              aria-disabled={SOCIAL_LINKS.email ? undefined : true}
              className={styles.socialLink}
            >
              <MailIcon />
              {t.connect.email}
            </a>
          </div>
          <p className={styles.connectNote}>{SOCIAL_LINKS.email}</p>

          <LocalizedLink href="/#partnerships" className={styles.backLink}>
            {t.back}
            <Arrow />
          </LocalizedLink>
        </div>
      </section>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.1" cy="6.9" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <line x1="7.6" y1="10.2" x2="7.6" y2="16.4" />
      <circle cx="7.6" cy="7.3" r="0.6" fill="currentColor" stroke="none" />
      <path d="M11.6 16.4v-4.2c0-1.3.9-2.1 2.1-2.1 1.2 0 1.9.8 1.9 2.1v4.2" />
      <line x1="11.6" y1="10.2" x2="11.6" y2="16.4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4.4 7.2 12 12.6l7.6-5.4" />
    </svg>
  );
}
