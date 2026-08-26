"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import OtpInput from "@/components/admin/OtpInput";
import { clock, useRateLimitLock } from "@/components/admin/useRateLimitLock";
import styles from "@/components/admin/fields.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const LOCK_KEY = "cq.admin.reset.lock-until";
const RESEND_COOLDOWN = 60;
const MIN_PASSWORD = 10;

type Step = "email" | "code" | "password" | "done";

const STEPS: Step[] = ["email", "code", "password"];

const emailSchema = z.email("Enter a valid email address.");

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.5 13 12.5H1L7 1.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 5.6v3M7 10.4v.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.3 4.6 9 10 3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

type RuleState = "idle" | "unmet" | "met";

function RuleIcon({ state }: { state: RuleState }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor">
      {state === "met" && <path d="M2 6.3 4.6 9 10 3.2" strokeWidth="1.7" strokeLinecap="square" />}
      {state === "unmet" && <path d="M3 3l6 6M9 3l-6 6" strokeWidth="1.5" strokeLinecap="round" />}
      {state === "idle" && <circle cx="6" cy="6" r="2.2" strokeWidth="1.3" />}
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1.5 8s2.6-4.2 6.5-4.2S14.5 8 14.5 8s-2.6 4.2-6.5 4.2S1.5 8 1.5 8Z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.9" />
      {off && <path d="M2.6 2.6 13.4 13.4" strokeLinecap="round" />}
    </svg>
  );
}

export default function ResetPasswordForm({
  initialEmail,
  startAtCode = false,
}: {
  initialEmail?: string;
  startAtCode?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const codeErrorId = useId();
  const rulesId = useId();

  /* El enlace del correo de bienvenida ya trae el código enviado: pedir otra vez
     el correo obligaría a un paso que el administrador ya dio por ellos. */
  const [step, setStep] = useState<Step>(startAtCode ? "code" : "email");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const { locked, secondsLeft, start: startLock } = useRateLimitLock(LOCK_KEY);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [focusAttempt, setFocusAttempt] = useState(0);

  const emailValid = emailSchema.safeParse(email).success;
  const codeValid = code.length === 6;
  const longEnough = password.length >= MIN_PASSWORD;
  const matches = password.length > 0 && password === confirm;
  const passwordValid = longEnough && matches;
  const stepValid =
    step === "email" ? emailValid : step === "code" ? codeValid : passwordValid;

  // Tres estados en vivo: sin escribir es neutro, no un error que aún no cometiste.
  const lengthState: RuleState = password.length === 0 ? "idle" : longEnough ? "met" : "unmet";
  const matchState: RuleState =
    confirm.length === 0 ? "idle" : matches ? "met" : "unmet";

  // Mover el foco al titular en cada paso: sin esto el lector se queda atrás.
  useEffect(() => {
    if (step === "email") return;
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!focusAttempt) return;
    formRef.current?.querySelector<HTMLInputElement>("[aria-invalid=\"true\"]")?.focus();
  }, [focusAttempt]);

  // Cambiar de paso limpia el estado de errores: si no, el paso nuevo nace en rojo.
  function goTo(next: Step) {
    setStep(next);
    setShowErrors(false);
  }

  function readRetry(ctx: { response: Response }): number {
    return Number(ctx.response.headers.get("X-Retry-After")) || 0;
  }

  async function requestCode(address: string) {
    setBusy(true);
    setError(null);
    let retryAfter = 0;
    const { error: sendError } = await authClient.emailOtp.requestPasswordReset(
      { email: address },
      { onError: (ctx) => { retryAfter = readRetry(ctx); } },
    );
    setBusy(false);

    if (sendError) {
      if (sendError.status === 429 && retryAfter > 0) {
        startLock(retryAfter);
        goTo("code");
        return;
      }
      setError("Could not send the code. Try again.");
      return;
    }

    // Confirmamos exista o no la cuenta: decir cuál está registrada convertiría
    // esta pantalla en un buscador de correos válidos.
    setCode("");
    goTo("code");
    startLock(RESEND_COOLDOWN);
  }

  async function verifyCode(value: string) {
    setBusy(true);
    setError(null);
    const { error: checkError } = await authClient.emailOtp.checkVerificationOtp({
      email,
      type: "forget-password",
      otp: value,
    });
    setBusy(false);

    if (checkError) {
      // Agotados los intentos el token queda muerto: ni el código correcto sirve.
      setError(
        checkError.code === "TOO_MANY_ATTEMPTS"
          ? "You missed the code three times and it was voided. Request a new one."
          : checkError.code === "INVALID_OTP"
            ? "The code does not match. Check it or request a new one."
            : "The code expired. Request a new one.",
      );
      setCode("");
      return;
    }
    setError(null);
    goTo("password");
  }

  async function savePassword() {
    setBusy(true);
    setError(null);
    const { error: resetError } = await authClient.emailOtp.resetPassword({
      email,
      otp: code,
      password,
    });
    setBusy(false);

    if (resetError) {
      // El código murió entre pasos: volver atrás deja a mano el botón de reenvío.
      goTo("code");
      setCode("");
      setError("The code is no longer valid. Request a new one and repeat the step.");
      return;
    }
    goTo("done");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!stepValid) {
      setShowErrors(true);
      setFocusAttempt((n) => n + 1);
      return;
    }

    if (step === "email") {
      if (locked) return;
      await requestCode(email.trim().toLowerCase());
      return;
    }

    if (step === "code") {
      await verifyCode(code);
      return;
    }

    await savePassword();
  }

  const hint = !showErrors || stepValid
    ? null
    : step === "email"
      ? "Enter a valid email address."
      : step === "code"
        ? "The code is missing digits."
        : !longEnough
          ? `The password needs at least ${MIN_PASSWORD} characters.`
          : "The two passwords do not match.";

  const liveMessage = busy
    ? "Working."
    : (error ?? hint)
      ? (error ?? hint)
      : step === "code"
        ? "Code sent. Type it below."
        : step === "password"
          ? "Code verified. Set your password."
          : step === "done"
            ? "Password updated."
            : "";

  const rise = (delay: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  const panel = reduced
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, x: 18 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -18 },
        transition: { duration: 0.4, ease: EASE },
      };

  const stepIndex = STEPS.indexOf(step);

  const heads: Record<Step, { eyebrow: string; title: string; done?: boolean }> = {
    email: { eyebrow: "Recover access", title: "Forgot your password?" },
    code: { eyebrow: "Code sent", title: "Type the code" },
    password: { eyebrow: "Code verified", title: "Set your password", done: true },
    done: { eyebrow: "Done", title: "Password updated", done: true },
  };
  const head = heads[step];

  return (
    <>
      <motion.span
        className={head.done ? styles.eyebrowDone : styles.eyebrow}
        key={`eyebrow-${step}`}
        {...rise(0.04)}
      >
        {head.done && <CheckIcon />}
        {head.eyebrow}
      </motion.span>

      <motion.h1 className={styles.heading} ref={headingRef} tabIndex={-1} key={`title-${step}`} {...rise(0.1)}>
        {head.title}
      </motion.h1>

      {step !== "done" && (
        <div className={styles.steps} aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span key={s} className={styles.stepBar} data-state={i < stepIndex ? "done" : i === stepIndex ? "current" : "next"} />
          ))}
        </div>
      )}

      {step === "done" && (
        <motion.div
          className={styles.headingRule}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduced ? 0 : 0.9, delay: 0.18, ease: EASE }}
        />
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...panel}>
          {step === "done" ? (
            <>
              <p className={styles.lead}>
                You can now sign in with your new password.
              </p>
              <div className={styles.actions}>
                <Link className={styles.submitLink} href="/admin/login">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
              {error && (
                <p className={styles.formError} role="alert">
                  <AlertIcon className={styles.errorIcon} />
                  <span>{error}</span>
                </p>
              )}

              {step === "email" && (
                <>
                  <p className={styles.leadTight}>
                    Enter your email and we will send you a six-digit code.
                  </p>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={emailId}>
                      Email
                    </label>
                    <input
                      id={emailId}
                      className={styles.input}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nombre@cquest.do"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      aria-invalid={showErrors && !emailValid}
                    />
                    {showErrors && !emailValid && (
                      <span className={styles.fieldError} role="alert">
                        <AlertIcon className={styles.errorIcon} />
                        Enter a valid email address.
                      </span>
                    )}
                  </div>
                </>
              )}

              {step === "code" && (
                <>
                  <p className={styles.leadTight}>
                    If <span className={styles.leadStrong}>{email}</span> has an active account, a
                    six-digit code has arrived. It expires in 10 minutes.
                  </p>
                  <div className={styles.field}>
                    <span className={styles.label} id={codeErrorId}>
                      Code
                    </span>
                    <OtpInput
                      value={code}
                      onChange={setCode}
                      onComplete={(value) => void verifyCode(value)}
                      disabled={busy}
                      invalid={showErrors && !codeValid}
                      describedBy={codeErrorId}
                    />
                    {showErrors && !codeValid && (
                      <span className={styles.fieldError} role="alert">
                        <AlertIcon className={styles.errorIcon} />
                        The code is missing digits.
                      </span>
                    )}
                  </div>
                  <button
                    className={styles.ghost}
                    type="button"
                    onClick={() => void requestCode(email)}
                    disabled={busy || locked}
                    aria-label={locked ? "Send another code, available later" : undefined}
                  >
                    {locked ? (
                      <>
                        Send another code in{" "}
                        <span className={styles.lockCount}>{clock(secondsLeft)}</span>
                      </>
                    ) : (
                      "Send another code"
                    )}
                  </button>
                </>
              )}

              {step === "password" && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={passwordId}>
                      New password
                    </label>
                    <div className={styles.inputWrap}>
                      <input
                        id={passwordId}
                        className={`${styles.input} ${styles.inputWithAction}`}
                        type={revealed ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        aria-invalid={lengthState === "unmet"}
                        aria-describedby={rulesId}
                      />
                      <button
                        className={styles.reveal}
                        type="button"
                        onClick={() => setRevealed((v) => !v)}
                        aria-label="Show password"
                        aria-pressed={revealed}
                        aria-controls={passwordId}
                      >
                        <EyeIcon off={revealed} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={confirmId}>
                      Repeat the password
                    </label>
                    <input
                      id={confirmId}
                      className={styles.input}
                      type={revealed ? "text" : "password"}
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      aria-invalid={matchState === "unmet"}
                      aria-describedby={rulesId}
                    />
                  </div>

                  <ul className={styles.checklist} id={rulesId}>
                    <li data-state={lengthState}>
                      <RuleIcon state={lengthState} />
                      At least {MIN_PASSWORD} characters
                    </li>
                    <li data-state={matchState}>
                      <RuleIcon state={matchState} />
                      Both match
                    </li>
                  </ul>
                </>
              )}

              <button
                className={styles.submit}
                type="submit"
                disabled={busy || (step === "email" && locked)}
                data-inactive={!stepValid}
                data-locked={step === "email" && locked}
                aria-disabled={!stepValid || (step === "email" && locked)}
                aria-label={step === "email" && locked ? "Send code, temporarily locked" : undefined}
              >
                {busy && <span className={styles.spinner} aria-hidden="true" />}
                {step === "email" && locked ? (
                  <>
                    Wait <span className={styles.lockCount}>{clock(secondsLeft)}</span>
                  </>
                ) : busy ? (
                  "One moment"
                ) : step === "email" ? (
                  "Send code"
                ) : step === "code" ? (
                  "Verify code"
                ) : (
                  "Save password"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {step !== "done" && (
        <div className={styles.footer}>
          <Link className={styles.link} href="/admin/login">
            Back to sign in
          </Link>
          {step === "code" && (
            <button
              className={styles.linkButton}
              type="button"
              onClick={() => {
                goTo("email");
                setError(null);
              }}
            >
              Use another email
            </button>
          )}
        </div>
      )}
    </>
  );
}
