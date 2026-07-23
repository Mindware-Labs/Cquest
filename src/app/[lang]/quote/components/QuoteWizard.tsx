"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import type { ServiceId } from "@/components/services/data";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import {
  QUESTIONNAIRES,
  STEPS,
  contactSchema,
  detailsSchema,
  fieldErrors,
  getService,
  resolveQuestionnaire,
  type Answers,
  type QuoteSubmission,
} from "../data";
import { submitQuote } from "../submitQuote";
import styles from "./QuoteWizard.module.css";
import buttons from "./buttons.module.css";
import fieldStyles from "./fields.module.css";
import Confirmation from "./Confirmation";
import ProgressRail from "./ProgressRail";
import StepContact from "./StepContact";
import StepDetails from "./StepDetails";
import StepService from "./StepService";
import { Alert, Arrow } from "./icons";

type Status = "form" | "submitting" | "done";

const RECAPTCHA_ACTION = "submit_quote";
// grecaptcha.execute() itself doesn't time out — if the script never loaded
// (blocked, ad-blocker, network hiccup) it would hang forever. Race it
// against a timeout instead: no token just means this submission relies on
// the honeypot/timing checks alone server-side, not a lost lead.
const RECAPTCHA_TIMEOUT_MS = 4000;

// Best-effort: resolves with a token when reCAPTCHA is available, or
// `undefined` when the site key isn't configured, the script hasn't loaded,
// or it times out. Never rejects — a missing token must not block a real
// prospect from submitting.
function getRecaptchaToken(): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (typeof window === "undefined" || !siteKey || !window.grecaptcha) {
    return Promise.resolve(undefined);
  }
  const { grecaptcha } = window;

  const token = new Promise<string | undefined>((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action: RECAPTCHA_ACTION }).then(resolve, () => resolve(undefined));
    });
  });
  const timeout = new Promise<string | undefined>((resolve) => {
    setTimeout(() => resolve(undefined), RECAPTCHA_TIMEOUT_MS);
  });

  return Promise.race([token, timeout]);
}

export default function QuoteWizard({
  initialService,
  initialStep,
  onSubmit,
  reduced,
}: {
  initialService: ServiceId | null;
  /** From the page's own `?step=` read — same seam as `initialService`, so a
   *  refresh or a copied mid-flow link lands back where the prospect was
   *  instead of resetting to Step 1. */
  initialStep?: number;
  /** Defaults to the shared `submitQuote` seam; override for tests/embeds. */
  onSubmit?: (submission: QuoteSubmission) => Promise<void>;
  reduced: boolean;
}) {
  const { dict, lang } = useI18n();
  const startStep = initialService ? (initialStep ?? 1) : 0;
  const [service, setService] = useState<ServiceId | null>(initialService);
  const [details, setDetails] = useState<Answers>({});
  const [contact, setContact] = useState<Answers>({});
  const [step, setStep] = useState(startStep);
  const [furthest, setFurthest] = useState(startStep);
  const [direction, setDirection] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<Status>("form");
  const [submitFailed, setSubmitFailed] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const stepPanelRef = useRef<HTMLDivElement>(null);
  // Anti-spam without a reCAPTCHA key: captured once after mount (an effect,
  // not render — Date.now() during render is impure/unstable), sent with the
  // submission so submitQuote can reject anything faster than a real prospect
  // could plausibly complete all 3 steps.
  const mountedAtRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const questionnaire = service ? QUESTIONNAIRES[service] : null;
  const resolvedQuestionnaire = questionnaire ? resolveQuestionnaire(questionnaire, lang) : null;
  const accent = getService(service);
  const stepLabel = (index: 0 | 1 | 2) => STEPS[index].copy[lang].label;

  // Keep the URL in sync with where the prospect actually is — so a refresh
  // or a copied link doesn't drop them back to Step 1. replaceState (not the
  // router) so this never adds a history entry or triggers a navigation.
  useEffect(() => {
    if (!service) return;
    const params = new URLSearchParams(window.location.search);
    params.set("servicio", service);
    params.set("step", String(step));
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [service, step]);

  // Step 2 (Details) is validated with Zod, off a schema built from the active
  // service's questionnaire — one source of truth for the gate and the field
  // errors surfaced under each question.
  const detailsResult = useMemo(
    () =>
      questionnaire ? detailsSchema(questionnaire, lang).safeParse(details) : null,
    [questionnaire, lang, details],
  );

  const detailErrors = useMemo(
    () =>
      detailsResult && !detailsResult.success
        ? fieldErrors(detailsResult.error)
        : {},
    [detailsResult],
  );

  // Step 3 (Contact) runs through its own Zod schema — required + real email and
  // phone format checks — so gating and field feedback share one verdict.
  const contactResult = useMemo(
    () => contactSchema(lang).safeParse(contact),
    [lang, contact],
  );

  const contactErrors = useMemo(
    () => (contactResult.success ? {} : fieldErrors(contactResult.error)),
    [contactResult],
  );

  // Per-step gate: what has to be true before "Continue" moves on.
  const canAdvance = useMemo(() => {
    if (step === 0) return service !== null;
    if (step === 1) return detailsResult?.success ?? false;
    return contactResult.success;
  }, [step, service, detailsResult, contactResult]);

  const selectService = useCallback(
    (id: ServiceId) => {
      setService((previous) => {
        // Switching lines invalidates the previous line's answers.
        if (previous !== id) setDetails({});
        return id;
      });
    },
    [],
  );

  const setDetail = useCallback((id: string, value: string | string[]) => {
    setDetails((previous) => ({ ...previous, [id]: value }));
  }, []);

  const setContactField = useCallback(
    (id: string, value: string | string[]) => {
      setContact((previous) => ({ ...previous, [id]: value }));
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!service) return;
    setStatus("submitting");
    setSubmitFailed(false);
    try {
      const recaptchaToken = await getRecaptchaToken();
      await (onSubmit ?? submitQuote)({
        service,
        details,
        contact,
        locale: lang,
        honeypot,
        startedAt: mountedAtRef.current,
        recaptchaToken,
      });
      setStatus("done");
    } catch {
      // Keep the prospect's answers intact so they can retry, but surface the
      // failure — silently dropping back to the form left the prospect with
      // no idea whether it was sent or whether retrying is worth it.
      setStatus("form");
      setSubmitFailed(true);
    }
  }, [service, details, contact, lang, honeypot, onSubmit]);

  const goNext = useCallback(() => {
    if (!canAdvance) {
      setShowErrors(true);
      // A counter, not a re-trigger off showErrors itself — showErrors may
      // already be true from a prior blocked attempt, and state setters that
      // don't change the value don't re-fire effects.
      setFocusAttempt((n) => n + 1);
      return;
    }
    setShowErrors(false);
    if (step === 2) {
      void submit();
      return;
    }
    const next = step + 1;
    setDirection(1);
    setStep(next);
    setFurthest((f) => Math.max(f, next));
  }, [canAdvance, step, submit]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setShowErrors(false);
    setDirection(-1);
    setStep(step - 1);
  }, [step]);

  const jumpTo = useCallback(
    (index: number) => {
      if (index === step) return;
      setShowErrors(false);
      setDirection(index > step ? 1 : -1);
      setStep(index);
    },
    [step],
  );

  const reset = useCallback(() => {
    setService(null);
    setDetails({});
    setContact({});
    setStep(0);
    setFurthest(0);
    setDirection(-1);
    setShowErrors(false);
    setStatus("form");
  }, []);

  // A blocked "Continue" surfaces field errors but otherwise does nothing
  // visible if the invalid field is off-screen — the prospect has no way to
  // find it. Move focus to it directly, same as a native form's first-error
  // behavior. OptionGroup marks its <fieldset> invalid (not itself
  // focusable), so fall through to the first input inside it.
  useEffect(() => {
    if (focusAttempt === 0) return;
    const container = stepPanelRef.current;
    if (!container) return;
    const invalid = container.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!invalid) return;
    const target =
      invalid.tagName === "FIELDSET"
        ? invalid.querySelector<HTMLElement>("input, [tabindex]")
        : invalid;
    target?.focus();
  }, [focusAttempt]);

  const panelVariants: Variants = {
    enter: (dir: number) =>
      reduced
        ? { opacity: 0 }
        : { opacity: 0, x: dir * 42, filter: "blur(8px)" },
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASE_OUT },
    },
    exit: (dir: number) =>
      reduced
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir * -28,
            filter: "blur(8px)",
            transition: { duration: 0.28, ease: EASE_OUT },
          },
  };

  const submitting = status === "submitting";

  // One shared announcement for every silent state change in the wizard —
  // step transitions, a blocked "Continue", and the submit/confirm handoff —
  // so screen-reader users get the same feedback a sighted prospect sees.
  const liveMessage =
    status === "submitting"
      ? dict.wizard.sending
      : status === "done"
        ? dict.wizard.sent
        : `${submitFailed ? `${dict.wizard.submitError} ` : ""}${format(dict.wizard.stepAnnounce, { n: step + 1, label: stepLabel(step as 0 | 1 | 2) })}${
            showErrors && !canAdvance ? ` ${dict.wizard.fixFields}` : ""
          }`;

  return (
    <section
      className={styles.wizard}
      aria-label={dict.wizard.ariaLabel}
      style={
        {
          "--svc": accent?.color ?? "var(--brand-petroleo)",
          "--svc-glow": accent?.glow ?? "var(--brand-celeste)",
        } as CSSProperties
      }
    >
      <p className="sr-only" role="status" aria-live="polite">{liveMessage}</p>

      {/* Honeypot — real prospects never see or reach this field (offscreen,
          untabbable, unannounced); bots that fill every input blind still find
          it. A non-empty value on submit makes submitQuote drop the lead
          silently instead of sending it to Resend. */}
      <input
        type="text"
        name="company_website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            key="done"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confirmation
              submission={{ service: service!, details, contact, locale: lang }}
              onReset={reset}
              reduced={reduced}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProgressRail current={step} furthest={furthest} onJump={jumpTo} />

            <div className={styles.body}>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  ref={stepPanelRef}
                  key={step}
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {step === 0 && (
                    <StepService value={service} onSelect={selectService} />
                  )}
                  {step === 1 && resolvedQuestionnaire && (
                    <StepDetails
                      questionnaire={resolvedQuestionnaire}
                      answers={details}
                      onChange={setDetail}
                      showErrors={showErrors}
                      errors={detailErrors}
                    />
                  )}
                  {step === 2 && (
                    <StepContact
                      answers={contact}
                      onChange={setContactField}
                      showErrors={showErrors}
                      errors={contactErrors}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {submitFailed && (
              <p className={fieldStyles.fieldError} role="alert">
                <Alert className={fieldStyles.fieldErrorIcon} />
                {dict.wizard.submitError}
              </p>
            )}

            <div className={styles.footer}>
              <p className={styles.footerMeta}>{format(dict.wizard.stepOf, { n: step + 1 })}</p>
              <div className={styles.footerActions}>
                {step > 0 && (
                  <button
                    type="button"
                    className={buttons.ghostBtn}
                    onClick={goBack}
                    disabled={submitting}
                  >
                    {dict.wizard.back}
                  </button>
                )}
                <button
                  type="button"
                  className={buttons.primaryBtn}
                  onClick={goNext}
                  disabled={submitting}
                  data-inactive={!canAdvance || undefined}
                  aria-disabled={!canAdvance}
                >
                  <span>
                    {step < 2
                      ? dict.wizard.continue
                      : submitting
                        ? dict.wizard.sendingButton
                        : dict.wizard.submitButton}
                  </span>
                  {step < 2 && <Arrow className={buttons.btnArrow} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
