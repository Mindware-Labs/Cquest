"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import type { ServiceId } from "@/components/services/data";
import { dict } from "@/lib/dictionary";
import { format } from "@/lib/format";
import {
  QUESTIONNAIRES,
  STEPS,
  contactSchema,
  detailsSchema,
  fieldErrors,
  getService,
  isRevealed,
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

const RECAPTCHA_TIMEOUT_MS = 4000;

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

  initialStep?: number;

  onSubmit?: (submission: QuoteSubmission) => Promise<void>;
  reduced: boolean;
}) {
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

  const mountedAtRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const questionnaire = service ? QUESTIONNAIRES[service] : null;
  const accent = getService(service);
  const stepLabel = (index: 0 | 1 | 2) => STEPS[index].label;

  useEffect(() => {
    if (!service) return;
    const params = new URLSearchParams(window.location.search);
    params.set("servicio", service);
    params.set("step", String(step));
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [service, step]);

  const detailsResult = useMemo(
    () =>
      questionnaire ? detailsSchema(questionnaire).safeParse(details) : null,
    [questionnaire, details],
  );

  const detailErrors = useMemo(
    () =>
      detailsResult && !detailsResult.success
        ? fieldErrors(detailsResult.error)
        : {},
    [detailsResult],
  );

  const contactResult = useMemo(
    () => contactSchema().safeParse(contact),
    [contact],
  );

  const contactErrors = useMemo(
    () => (contactResult.success ? {} : fieldErrors(contactResult.error)),
    [contactResult],
  );

  const canAdvance = useMemo(() => {
    if (step === 0) return service !== null;
    if (step === 1) return detailsResult?.success ?? false;
    return contactResult.success;
  }, [step, service, detailsResult, contactResult]);

  const selectService = useCallback(
    (id: ServiceId) => {
      setService((previous) => {
        if (previous !== id) setDetails({});
        return id;
      });
    },
    [],
  );

  const setDetail = useCallback(
    (id: string, value: string | string[]) => {
      setDetails((previous) => {
        const next = { ...previous, [id]: value };

        for (const question of questionnaire?.questions ?? []) {
          if (question.revealedBy && !isRevealed(question, next)) {
            delete next[question.id];
          }
        }
        return next;
      });
    },
    [questionnaire],
  );

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
        honeypot,
        startedAt: mountedAtRef.current,
        recaptchaToken,
      });
      setStatus("done");
    } catch {
      setStatus("form");
      setSubmitFailed(true);
    }
  }, [service, details, contact, honeypot, onSubmit]);

  const goNext = useCallback(() => {
    if (!canAdvance) {
      setShowErrors(true);

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

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (status === "submitting") return;
      goNext();
    },
    [goNext, status],
  );

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

      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            key="done"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confirmation
              submission={{ service: service!, details, contact }}
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

            <form onSubmit={handleSubmit} noValidate>
              <ProgressRail current={step} furthest={furthest} onJump={jumpTo} />

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
                    {step === 1 && questionnaire && (
                      <StepDetails
                        questionnaire={questionnaire}
                        answers={details}
                        onChange={setDetail}
                        showErrors={showErrors}
                        errors={detailErrors}
                        reduced={reduced}
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
                    type="submit"
                    className={buttons.primaryBtn}
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
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
