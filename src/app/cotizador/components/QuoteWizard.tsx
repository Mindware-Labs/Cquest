"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import type { ServiceId } from "@/components/services/data";
import {
  QUESTIONNAIRES,
  contactSchema,
  detailsSchema,
  fieldErrors,
  getService,
  type Answers,
  type QuoteSubmission,
} from "../data";
import { submitQuote } from "../submitQuote";
import styles from "../wizard.module.css";
import Confirmation from "./Confirmation";
import ProgressRail from "./ProgressRail";
import StepContact from "./StepContact";
import StepDetails from "./StepDetails";
import StepService from "./StepService";
import { Arrow } from "./icons";

type Status = "form" | "submitting" | "done";

export default function QuoteWizard({
  initialService,
  onSubmit,
  reduced,
}: {
  initialService: ServiceId | null;
  /** Defaults to the shared `submitQuote` seam; override for tests/embeds. */
  onSubmit?: (submission: QuoteSubmission) => Promise<void>;
  reduced: boolean;
}) {
  const [service, setService] = useState<ServiceId | null>(initialService);
  const [details, setDetails] = useState<Answers>({});
  const [contact, setContact] = useState<Answers>({});
  // Deep-linked prospects land already on Step 2 with their service chosen.
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [furthest, setFurthest] = useState(initialService ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<Status>("form");

  const questionnaire = service ? QUESTIONNAIRES[service] : null;
  const accent = getService(service);

  // Step 2 (Details) is validated with Zod, off a schema built from the active
  // service's questionnaire — one source of truth for the gate and the field
  // errors surfaced under each question.
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

  // Step 3 (Contact) runs through its own Zod schema — required + real email and
  // phone format checks — so gating and field feedback share one verdict.
  const contactResult = useMemo(
    () => contactSchema.safeParse(contact),
    [contact],
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
    try {
      await (onSubmit ?? submitQuote)({ service, details, contact });
      setStatus("done");
    } catch {
      // Keep the prospect's answers intact so they can retry.
      setStatus("form");
    }
  }, [service, details, contact, onSubmit]);

  const goNext = useCallback(() => {
    if (!canAdvance) {
      setShowErrors(true);
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

  return (
    <section
      className={styles.wizard}
      aria-label="Quote request"
      style={
        {
          "--svc": accent?.color ?? "var(--brand-petroleo)",
          "--svc-glow": accent?.glow ?? "var(--brand-celeste)",
        } as CSSProperties
      }
    >
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
            <ProgressRail current={step} furthest={furthest} onJump={jumpTo} />

            <div className={styles.body}>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={styles.panel}
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

            <div className={styles.footer}>
              <p className={styles.footerMeta}>Step {step + 1} of 3</p>
              <div className={styles.footerActions}>
                {step > 0 && (
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={goBack}
                    disabled={submitting}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={goNext}
                  disabled={submitting}
                  data-inactive={!canAdvance || undefined}
                  aria-disabled={!canAdvance}
                >
                  <span>
                    {step < 2
                      ? "Continue"
                      : submitting
                        ? "Sending…"
                        : "Request my quote"}
                  </span>
                  {step < 2 && <Arrow className={styles.btnArrow} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
