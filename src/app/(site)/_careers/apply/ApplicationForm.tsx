"use client";

import { useEffect, useRef, useState } from "react";
import Arrow from "@/components/services/Arrow";
import { TransitionLink } from "@/components/TransitionLink";
import {
  APPLICATION_MESSAGES,
  AVAILABILITY_OPTIONS,
  CV_ACCEPT_ATTR,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  applicationSchema,
  checkCvFile,
  type ChoiceOption,
} from "../data";
import { submitApplication } from "./submitApplication";
import styles from "./ApplicationForm.module.css";

const COPY = {
  title: "Send us your CV",
  lead: "Nine fields, about two minutes. Human Resources reviews every application that comes in.",
  fullName: "Full name",
  email: "Email",
  phone: "Phone / WhatsApp",
  city: "City",
  experience: "Call center experience",
  english: "English level",
  availability: "Availability to start",
  cv: "Your CV (PDF, DOC or DOCX — max 5 MB)",
  cvButton: "Choose file",
  cvEmpty: "No file selected",
  message: "Anything you want us to know (optional)",
  messagePlaceholder: "Tell us briefly why you are applying.",
  choose: "Select an option",
  consent: "I accept that Center Quest stores and processes my data for recruitment purposes.",
  privacy: "Privacy policy",
  submit: "Send application",
  sending: "Sending…",
  fixFields: "Check the highlighted fields.",
  successTitle: "Application received",
  successBody:
    "Human Resources reviews every CV. If your profile matches an opening, we contact you by phone or WhatsApp.",
  another: "Send another application",
  backToOpenings: "Back to openings",
  applyingFor: "Applying for",
  talentPool: "Talent pool",
};

type Status = "idle" | "sending" | "sent";

/* Orden del DOM, no orden del objeto de errores: el primer campo roto es el
   que el candidato encuentra primero al bajar, no el primero que validó zod. */
function focusFirstError(form: HTMLFormElement, errors: Record<string, string>) {
  for (const control of Array.from(form.elements)) {
    const named = control as HTMLElement & { name?: string; focus?: () => void };
    if (!named.name || !(named.name in errors)) continue;
    named.focus?.();
    /* Se desplaza el BLOQUE, no el control: el input del CV está fuera de
       pantalla por diseño y centrarlo a él no muestra nada. */
    (named.closest("div") ?? named).scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
}

export default function ApplicationForm({
  positionSlug = "",
  positionTitle,
  id = "apply",
}: {
  positionSlug?: string;
  positionTitle?: string;
  id?: string;
}) {
  const t = COPY;
  const messages = APPLICATION_MESSAGES;

  /* El reloj arranca al montar y viaja en un campo oculto: la comprobación de
     "demasiado rápido" tiene que hacerla el servidor, no el cliente. */
  const startedAt = useRef<number | undefined>(undefined);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [cvName, setCvName] = useState("");

  async function recaptchaToken(): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const grecaptcha = typeof window === "undefined" ? undefined : window.grecaptcha;
    if (!siteKey || !grecaptcha) return "";
    try {
      return await new Promise<string>((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha
            .execute(siteKey, { action: "submit_application" })
            .then(resolve)
            .catch(() => resolve(""));
        });
      });
    } catch {
      return "";
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    /* Validación de cliente con el MISMO esquema del servidor: evita un viaje
       de red completo para decirle a alguien que le falta el teléfono. */
    const raw = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      city: String(data.get("city") ?? ""),
      experience: String(data.get("experience") ?? ""),
      english: String(data.get("english") ?? ""),
      availability: String(data.get("availability") ?? ""),
      message: String(data.get("message") ?? ""),
      positionSlug,
    };
    const parsed = applicationSchema.safeParse(raw);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) nextErrors[key] = issue.message;
      }
    }

    const cvValue = data.get("cv");
    const cvCheck = checkCvFile(cvValue instanceof File ? cvValue : null);
    if (!cvCheck.ok) nextErrors.cv = cvCheck.message;

    if (!data.get("consent")) nextErrors.consent = messages.consent;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError(t.fixFields);
      /* Decir "revisa los campos marcados" y dejar el cursor donde estaba
         obliga a buscar la marca a mano. El foco va al primer campo roto, que
         además lo anuncia con su mensaje asociado. */
      focusFirstError(form, nextErrors);
      return;
    }

    setErrors({});
    setFormError("");
    setStatus("sending");

    data.set("positionSlug", positionSlug);
    data.set("startedAt", String(startedAt.current ?? 0));
    data.set("recaptchaToken", await recaptchaToken());

    const result = await submitApplication(data);
    if (result.ok) {
      setStatus("sent");
      form.reset();
      setCvName("");
      return;
    }

    setStatus("idle");
    setErrors(result.fields ?? {});
    setFormError(result.message);
    if (result.fields) focusFirstError(form, result.fields);
  }

  if (status === "sent") {
    return (
      <section id={id} className={styles.panel}>
        <div className={styles.done} role="status">
          <span className={styles.doneMark} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 className={styles.doneTitle}>{t.successTitle}</h2>
          <p className={styles.doneBody}>{t.successBody}</p>
          <div className={styles.doneActions}>
            <button
              type="button"
              className={styles.ghostCta}
              onClick={() => {
                startedAt.current = Date.now();
                setStatus("idle");
              }}
            >
              {t.another}
            </button>
            <TransitionLink href="/careers#openings" className={styles.ghostCta}>
              {t.backToOpenings} <Arrow />
            </TransitionLink>
          </div>
        </div>
      </section>
    );
  }

  const sending = status === "sending";

  return (
    <section id={id} className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.lead}>{t.lead}</p>
        <p className={styles.target}>
          <span>{t.applyingFor}</span>
          <strong>{positionTitle ?? t.talentPool}</strong>
        </p>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* Honeypot: invisible para una persona, irresistible para un bot. */}
        <div className={styles.honeypot} aria-hidden>
          <label htmlFor={`${id}-company`}>Company</label>
          <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className={styles.grid}>
          <Field id={`${id}-fullName`} name="fullName" label={t.fullName} error={errors.fullName} autoComplete="name" />
          <Field id={`${id}-email`} name="email" type="email" label={t.email} error={errors.email} autoComplete="email" />
          <Field id={`${id}-phone`} name="phone" type="tel" label={t.phone} error={errors.phone} autoComplete="tel" />
          <Field id={`${id}-city`} name="city" label={t.city} error={errors.city} autoComplete="address-level2" />

          <Select id={`${id}-experience`} name="experience" label={t.experience} placeholder={t.choose} options={EXPERIENCE_OPTIONS} error={errors.experience} />
          <Select id={`${id}-english`} name="english" label={t.english} placeholder={t.choose} options={ENGLISH_OPTIONS} error={errors.english} />
          <Select id={`${id}-availability`} name="availability" label={t.availability} placeholder={t.choose} options={AVAILABILITY_OPTIONS} error={errors.availability} />

          <div className={`${styles.field} ${styles.wide}`}>
            <label className={styles.label} htmlFor={`${id}-cv`}>
              {t.cv}
            </label>
            <div className={styles.fileRow}>
              <label className={styles.fileButton} htmlFor={`${id}-cv`}>
                {t.cvButton}
              </label>
              <span className={styles.fileName}>{cvName || t.cvEmpty}</span>
            </div>
            <input
              id={`${id}-cv`}
              name="cv"
              type="file"
              className={styles.fileInput}
              accept={CV_ACCEPT_ATTR}
              aria-invalid={errors.cv ? true : undefined}
              aria-describedby={errors.cv ? `${id}-cv-error` : undefined}
              onChange={(event) => setCvName(event.currentTarget.files?.[0]?.name ?? "")}
            />
            {errors.cv && (
              <p id={`${id}-cv-error`} className={styles.error}>
                {errors.cv}
              </p>
            )}
          </div>

          <div className={`${styles.field} ${styles.wide}`}>
            <label className={styles.label} htmlFor={`${id}-message`}>
              {t.message}
            </label>
            <textarea
              id={`${id}-message`}
              name="message"
              rows={4}
              maxLength={1200}
              placeholder={t.messagePlaceholder}
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.consentRow}>
          <label className={styles.consent} htmlFor={`${id}-consent`}>
            <input
              id={`${id}-consent`}
              name="consent"
              type="checkbox"
              aria-invalid={errors.consent ? true : undefined}
            />
            <span>
              {t.consent}{" "}
              <TransitionLink href="/legal/privacy" className={styles.privacyLink}>
                {t.privacy}
              </TransitionLink>
            </span>
          </label>
          {errors.consent && <p className={styles.error}>{errors.consent}</p>}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? t.sending : t.submit} <Arrow />
          </button>
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  name,
  label,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  name,
  label,
  placeholder,
  options,
  error,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: readonly ChoiceOption[];
  error?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        className={styles.select}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
