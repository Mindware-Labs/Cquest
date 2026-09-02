"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT } from "@/components/services/motion";
import { TransitionLink } from "@/components/TransitionLink";
import { formatPhone } from "@/lib/formatPhone";
import type { ApplyDepartment } from "./ApplyExperience";
import {
  AVAILABILITY_OPTIONS,
  CV_ACCEPT_ATTR,
  EMPTY_VALUES,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  RECAPTCHA_ACTION,
  applicationSchema,
  checkCvFile,
  fieldErrors,
  formatBytes,
  type ApplicationValues,
  type ChoiceOption,
} from "./data";
import { submitApplication } from "./submitApplication";
import styles from "./ApplicationForm.module.css";

type Status = "idle" | "sending" | "sent";

const RECAPTCHA_TIMEOUT_MS = 4000;
const MESSAGE_MAX = 1200;

function getRecaptchaToken(): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (typeof window === "undefined" || !siteKey || !window.grecaptcha) return Promise.resolve(undefined);
  const { grecaptcha } = window;
  const token = new Promise<string | undefined>((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action: RECAPTCHA_ACTION }).then(resolve, () => resolve(undefined));
    });
  });
  const timeout = new Promise<string | undefined>((resolve) => setTimeout(() => resolve(undefined), RECAPTCHA_TIMEOUT_MS));
  return Promise.race([token, timeout]);
}

function AlertIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.75V13M12 16.25h.01" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className={styles.fieldError} role="alert">
      <AlertIcon />
      {message}
    </span>
  );
}

function Section({
  index,
  title,
  lead,
  children,
}: {
  index: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex} aria-hidden="true">
          {index}
        </span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionLead}>{lead}</p>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "tel" | "email";
}) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        spellCheck={type === "email" ? false : undefined}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

function ChoiceGroup({
  name,
  label,
  hint,
  options,
  value,
  onChange,
  error,
  optional,
  icons,
}: {
  name: string;
  label: string;
  hint?: string;
  options: readonly ChoiceOption[];
  value: string;
  onChange: (next: string) => void;
  error?: string;
  optional?: boolean;
  icons?: Record<string, string>;
}) {
  const errorId = `${name}-error`;
  return (
    <fieldset className={styles.group} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}>
      <legend className={styles.legend}>
        {label}
        {optional && <span className={styles.optional}>Optional</span>}
      </legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip}>
            <input
              className={styles.srInput}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onClick={optional && value === option.value ? () => onChange("") : undefined}
            />
            {icons?.[option.value] && (
              <span className={styles.chipIcon} aria-hidden="true">
                <ServiceIcon name={icons[option.value] as ServiceIconName} />
              </span>
            )}
            {option.label}
          </label>
        ))}
      </div>
      {error && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

function Dropzone({
  id,
  file,
  onFile,
  error,
}: {
  id: string;
  file: File | null;
  onFile: (next: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const errorId = `${id}-error`;
  const ext = file?.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toUpperCase() ?? "FILE";

  function pick(list: FileList | null) {
    onFile(list?.[0] ?? null);
  }

  return (
    <div className={styles.dropWrap}>
      <input
        ref={inputRef}
        id={id}
        name="cv"
        type="file"
        accept={CV_ACCEPT_ATTR}
        className={styles.srInput}
        onChange={(event) => pick(event.target.files)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : `${id}-hint`}
      />

      {file ? (
        <div className={styles.file} data-invalid={error ? "" : undefined}>
          <span className={styles.fileExt} aria-hidden="true">
            {ext}
          </span>
          <span className={styles.fileText}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatBytes(file.size)}</span>
          </span>
          <button type="button" className={styles.fileReplace} onClick={() => inputRef.current?.click()}>
            Replace
          </button>
          <button type="button" className={styles.fileRemove} onClick={() => onFile(null)} aria-label="Remove file">
            <CloseIcon />
          </button>
        </div>
      ) : (
        <div
          className={styles.drop}
          data-active={dragging ? "" : undefined}
          data-invalid={error ? "" : undefined}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files);
          }}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            <UploadIcon />
          </span>
          <span className={styles.dropText}>
            Drag your resume here, or{" "}
            <button type="button" className={styles.dropBrowse} onClick={() => inputRef.current?.click()}>
              browse files
            </button>
          </span>
          <span id={`${id}-hint`} className={styles.dropHint}>
            PDF, DOC or DOCX · up to 5 MB
          </span>
        </div>
      )}

      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

/* Orden del DOM, no del objeto de errores: el primer campo roto es el que el
   candidato encuentra primero al bajar. */
function focusFirstError(form: HTMLFormElement, errors: Record<string, string>) {
  for (const control of Array.from(form.elements)) {
    const named = control as HTMLElement & { name?: string; type?: string };
    if (!named.name || !(named.name in errors)) continue;
    const block = named.closest(`.${styles.field}, .${styles.group}, .${styles.dropWrap}, .${styles.consent}`) ?? named;
    block.scrollIntoView({ block: "center", behavior: "smooth" });
    if (named.type !== "file") named.focus({ preventScroll: true });
    return;
  }
}

export default function ApplicationForm({
  reduced,
  vacancySlug,
  vacancyTitle,
  departments,
}: {
  reduced: boolean;
  vacancySlug: string | null;
  vacancyTitle: string | null;
  departments: ApplyDepartment[];
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  // Origen del candidato: se lee una sola vez, al montar — si no viene en la
  // URL con la que se abrió esta página, no hay forma de recuperarlo después.
  const source = useRef("");
  useEffect(() => {
    startedAt.current = Date.now();
    const params = new URLSearchParams(window.location.search);
    source.current = params.get("utm_source") ?? params.get("ref") ?? "";
  }, []);

  const [values, setValues] = useState<ApplicationValues>(EMPTY_VALUES);
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  function validate(): Record<string, string> {
    const parsed = applicationSchema.safeParse(values);
    const next = parsed.success ? {} : fieldErrors(parsed.error);
    const cvCheck = checkCvFile(cv);
    if (!cvCheck.ok) next.cv = cvCheck.message;
    if (!consent) next.consent = "We need your consent to process your application.";
    return next;
  }

  function set<K extends keyof ApplicationValues>(key: K, value: ApplicationValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function touch(key: string) {
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }

  // Los errores se recalculan al vuelo pero solo se muestran en campos tocados
  // o después del primer intento de envío.
  const live = validate();
  const visible = (key: string) => (showAll || touched.has(key) ? live[key] : errors[key]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const next = validate();
    setShowAll(true);

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setFormError("Check the highlighted fields.");
      focusFirstError(form, next);
      return;
    }

    setErrors({});
    setFormError("");
    setStatus("sending");

    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value ?? "");
    if (cv) data.set("cv", cv);
    data.set("vacancySlug", vacancySlug ?? "");
    data.set("company_website", honeypot);
    data.set("startedAt", String(startedAt.current));
    data.set("source", source.current);
    data.set("recaptchaToken", (await getRecaptchaToken()) ?? "");

    let result: Awaited<ReturnType<typeof submitApplication>>;
    try {
      result = await submitApplication(data);
    } catch {
      result = { ok: false, message: "Something went wrong on our side. Please try again in a moment." };
    }

    if (result.ok) {
      setStatus("sent");
      return;
    }

    setStatus("idle");
    setErrors(result.fields ?? {});
    setFormError(result.message);
    if (result.fields) focusFirstError(form, result.fields);
  }

  if (status === "sent") {
    return (
      <div className={styles.card}>
        <div className={styles.done} role="status">
          <span className={styles.doneMark} aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <motion.circle
                cx="26"
                cy="26"
                r="24"
                className={styles.doneRing}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
              <motion.path
                d="M16 26.5 22.5 33 37 18.5"
                className={styles.doneTick}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: reduced ? 0 : 0.4, ease: EASE_OUT }}
              />
            </svg>
          </span>
          <h2 ref={doneRef} tabIndex={-1} className={styles.doneTitle}>
            {vacancyTitle ? "Application received" : "You're in our talent pool"}
          </h2>
          <p className={styles.doneText}>
            {vacancyTitle
              ? `Thanks, ${values.fullName.split(/\s+/)[0]}. We read every application for ${vacancyTitle} and reach out by phone or WhatsApp if your profile fits.`
              : `Thanks, ${values.fullName.split(/\s+/)[0]}. We keep your resume on file and reach out by phone or WhatsApp as soon as a role matches your profile.`}
          </p>
          <p className={styles.doneNote}>A confirmation is on its way to {values.email}.</p>
          <div className={styles.doneActions}>
            <TransitionLink href="/join-us" className={styles.donePrimary}>
              See open positions <Arrow />
            </TransitionLink>
            <TransitionLink href="/" className={styles.doneGhost}>
              Back to home
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }

  const sending = status === "sending";
  const departmentIcons = Object.fromEntries(departments.map((entry) => [entry.slug, entry.icon]));
  const departmentOptions: ChoiceOption[] = departments.map((entry) => ({ value: entry.slug, label: entry.shortLabel }));

  return (
    <form ref={formRef} className={styles.card} onSubmit={handleSubmit} noValidate aria-busy={sending || undefined}>
      <input
        type="text"
        name="company_website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
      />

      <Section index="01" title="About you" lead="How we reach you if there is a fit.">
        <div className={styles.grid}>
          <TextField
            id={`${uid}-fullName`}
            name="fullName"
            label="Full name"
            value={values.fullName}
            onChange={(next) => set("fullName", next)}
            onBlur={() => touch("fullName")}
            error={visible("fullName")}
            autoComplete="name"
          />
          <TextField
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            label="Email"
            value={values.email}
            onChange={(next) => set("email", next)}
            onBlur={() => touch("email")}
            error={visible("email")}
            autoComplete="email"
          />
          <TextField
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            label="Phone / WhatsApp"
            value={values.phone}
            onChange={(next) => set("phone", formatPhone(next))}
            onBlur={() => touch("phone")}
            error={visible("phone")}
            autoComplete="tel"
            placeholder="809-000-0000"
          />
          <TextField
            id={`${uid}-city`}
            name="city"
            label="City"
            value={values.city}
            onChange={(next) => set("city", next)}
            onBlur={() => touch("city")}
            error={visible("city")}
            autoComplete="address-level2"
            placeholder="Santo Domingo"
          />
        </div>
      </Section>

      <Section index="02" title="Your profile" lead="Three quick picks. No wrong answers.">
        <div className={styles.groups}>
          {departmentOptions.length > 0 && (
            <ChoiceGroup
              name="departmentSlug"
              label="Area of interest"
              hint="Where would you like to work? Pick one, or leave it open."
              options={departmentOptions}
              icons={departmentIcons}
              value={values.departmentSlug ?? ""}
              onChange={(next) => set("departmentSlug", next)}
              optional
            />
          )}
          <ChoiceGroup
            name="experience"
            label="Contact center or operations experience"
            options={EXPERIENCE_OPTIONS}
            value={values.experience}
            onChange={(next) => {
              set("experience", next);
              touch("experience");
            }}
            error={visible("experience")}
          />
          <ChoiceGroup
            name="english"
            label="English level"
            options={ENGLISH_OPTIONS}
            value={values.english}
            onChange={(next) => {
              set("english", next);
              touch("english");
            }}
            error={visible("english")}
          />
          <ChoiceGroup
            name="availability"
            label="Availability to start"
            options={AVAILABILITY_OPTIONS}
            value={values.availability}
            onChange={(next) => {
              set("availability", next);
              touch("availability");
            }}
            error={visible("availability")}
          />
        </div>
      </Section>

      <Section index="03" title="Your resume" lead="The one file we read first.">
        <Dropzone
          id={`${uid}-cv`}
          file={cv}
          onFile={(next) => {
            setCv(next);
            touch("cv");
          }}
          error={visible("cv")}
        />
      </Section>

      <Section index="04" title="Anything else" lead="Optional, but it helps us place you.">
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${uid}-message`}>
            A few lines about you
            <span className={styles.optional}>Optional</span>
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={4}
            maxLength={MESSAGE_MAX}
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
            placeholder="Why this role, what you are good at, anything we should know."
            className={styles.textarea}
          />
          <span className={styles.counter} aria-live="polite">
            {(values.message ?? "").length} / {MESSAGE_MAX}
          </span>
        </div>
      </Section>

      <div className={styles.foot}>
        <label className={styles.consent} data-invalid={visible("consent") ? "" : undefined}>
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              touch("consent");
            }}
            className={styles.srInput}
          />
          <span className={styles.checkbox} aria-hidden="true" />
          <span className={styles.consentText}>
            I agree that Center Quest stores and processes my data for recruiting purposes, as described in the{" "}
            <TransitionLink href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              privacy policy
            </TransitionLink>
            .
          </span>
        </label>
        {visible("consent") && <FieldError id={`${uid}-consent-error`} message={visible("consent")!} />}

        {formError && (
          <p className={styles.formError} role="alert">
            <AlertIcon />
            {formError}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Sending
              </>
            ) : (
              <>
                {vacancyTitle ? "Send application" : "Send my resume"} <Arrow />
              </>
            )}
          </button>
          <span className={styles.actionsNote}>We only use your data for recruiting. Nothing is shared with third parties.</span>
        </div>
      </div>
    </form>
  );
}
