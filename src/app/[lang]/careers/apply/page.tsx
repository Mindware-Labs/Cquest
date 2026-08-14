import type { Metadata } from "next";
import Script from "next/script";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { resolveLang } from "@/i18n/resolveLangParam";
import RecaptchaBadge from "../../quote/RecaptchaBadge";
import ApplicationForm from "./ApplicationForm";
import styles from "./apply.module.css";

const TITLE: Record<Locale, string> = {
  en: "Talent pool — send us your CV | Center Quest",
  es: "Banco de talento — envíanos tu CV | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "No opening matches you today? Send your CV to Center Quest's talent pool and Human Resources contacts you when one opens.",
  es: "¿Ninguna vacante te calza hoy? Envía tu CV al banco de talento de Center Quest y Recursos Humanos te contacta cuando se abra una.",
};

const COPY: Record<Locale, { eyebrow: string; title: [string, string]; lead: string; notes: string[]; back: string }> = {
  en: {
    eyebrow: "Talent pool",
    title: ["Not the right opening?", "Send it anyway."],
    lead: "We open positions across the operation all year. Leave us your CV and we look at it first when a role that fits you opens.",
    notes: [
      "Human Resources reviews every application that comes in.",
      "We only contact you about openings that match your profile.",
      "Your data is used for recruitment purposes only.",
    ],
    back: "See open positions",
  },
  es: {
    eyebrow: "Banco de talento",
    title: ["¿No hay vacante para ti hoy?", "Envíanos tu CV igual."],
    lead: "Abrimos posiciones en toda la operación durante el año. Déjanos tu CV y lo revisamos primero cuando salga un rol que te calce.",
    notes: [
      "Recursos Humanos revisa cada postulación que entra.",
      "Solo te contactamos por vacantes que calcen con tu perfil.",
      "Tus datos se usan únicamente con fines de reclutamiento.",
    ],
    back: "Ver vacantes abiertas",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/careers/apply"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default async function ApplyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  const t = COPY[lang];
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      {recaptchaSiteKey && (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
          <RecaptchaBadge />
        </>
      )}

      <div className={styles.page}>
        <div className={`${container.container} ${styles.layout}`}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>{t.eyebrow}</span>
            <h1 className={styles.title}>
              {t.title[0]} <strong>{t.title[1]}</strong>
            </h1>
            <p className={styles.lead}>{t.lead}</p>
            <ul className={styles.notes}>
              {t.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <LocalizedLink href="/careers#openings" className={styles.back}>
              {t.back} <Arrow />
            </LocalizedLink>
          </div>

          <ApplicationForm id="apply" />
        </div>
      </div>
    </>
  );
}
