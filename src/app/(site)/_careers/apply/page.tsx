import type { Metadata } from "next";
import Script from "next/script";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { TransitionLink } from "@/components/TransitionLink";
import RecaptchaBadge from "../../quote/RecaptchaBadge";
import ApplicationForm from "./ApplicationForm";
import styles from "./apply.module.css";

const TITLE = "Talent pool — send us your CV | Center Quest";
const DESCRIPTION =
  "No opening matches you today? Send your CV to Center Quest's talent pool and Human Resources contacts you when one opens.";

const COPY = {
  eyebrow: "Talent pool",
  title: ["Not the right opening?", "Send it anyway."] as const,
  lead: "We open positions across the operation all year. Leave us your CV and we look at it first when a role that fits you opens.",
  notes: [
    "Human Resources reviews every application that comes in.",
    "We only contact you about openings that match your profile.",
    "Your data is used for recruitment purposes only.",
  ],
  back: "See open positions",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/careers/apply" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

export default function ApplyPage() {
  const t = COPY;
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
            <TransitionLink href="/careers#openings" className={styles.back}>
              {t.back} <Arrow />
            </TransitionLink>
          </div>

          <ApplicationForm id="apply" />
        </div>
      </div>
    </>
  );
}
