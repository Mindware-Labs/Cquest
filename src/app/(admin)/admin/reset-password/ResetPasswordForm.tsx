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

const emailSchema = z.email("Escribe un correo válido.");

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
      setError("No se pudo enviar el código. Inténtalo de nuevo.");
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
          ? "Fallaste el código tres veces y quedó anulado. Pide uno nuevo."
          : checkError.code === "INVALID_OTP"
            ? "El código no coincide. Revísalo o pide uno nuevo."
            : "El código caducó. Pide uno nuevo.",
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
      setError("El código dejó de ser válido. Pide uno nuevo y repite el paso.");
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
      ? "Escribe un correo válido."
      : step === "code"
        ? "Faltan dígitos del código."
        : !longEnough
          ? `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`
          : "Las dos contraseñas no coinciden.";

  const liveMessage = busy
    ? "Procesando."
    : (error ?? hint)
      ? (error ?? hint)
      : step === "code"
        ? "Código enviado. Escríbelo abajo."
        : step === "password"
          ? "Código verificado. Define tu contraseña."
          : step === "done"
            ? "Contraseña actualizada."
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
    email: { eyebrow: "Recuperar acceso", title: "¿Olvidaste tu contraseña?" },
    code: { eyebrow: "Código enviado", title: "Escribe el código" },
    password: { eyebrow: "Código verificado", title: "Define tu contraseña", done: true },
    done: { eyebrow: "Listo", title: "Contraseña actualizada", done: true },
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
        <div className={styles.steps} aria-label={`Paso ${stepIndex + 1} de ${STEPS.length}`}>
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
                Ya puedes entrar al panel con tu contraseña nueva.
              </p>
              <div className={styles.actions}>
                <Link className={styles.submitLink} href="/admin/login">
                  Entrar al panel
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
                    Escribe tu correo y te enviamos un código de seis dígitos.
                  </p>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={emailId}>
                      Correo
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
                        Escribe un correo válido.
                      </span>
                    )}
                  </div>
                </>
              )}

              {step === "code" && (
                <>
                  <p className={styles.leadTight}>
                    Si <span className={styles.leadStrong}>{email}</span> tiene una cuenta activa, le
                    llegó un código de seis dígitos. Caduca a los 10 minutos.
                  </p>
                  <div className={styles.field}>
                    <span className={styles.label} id={codeErrorId}>
                      Código
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
                        Faltan dígitos del código.
                      </span>
                    )}
                  </div>
                  <button
                    className={styles.ghost}
                    type="button"
                    onClick={() => void requestCode(email)}
                    disabled={busy || locked}
                    aria-label={locked ? "Enviar otro código, disponible más tarde" : undefined}
                  >
                    {locked ? (
                      <>
                        Enviar otro código en{" "}
                        <span className={styles.lockCount}>{clock(secondsLeft)}</span>
                      </>
                    ) : (
                      "Enviar otro código"
                    )}
                  </button>
                </>
              )}

              {step === "password" && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={passwordId}>
                      Contraseña nueva
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
                        aria-label="Mostrar contraseña"
                        aria-pressed={revealed}
                        aria-controls={passwordId}
                      >
                        <EyeIcon off={revealed} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={confirmId}>
                      Repite la contraseña
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
                      Al menos {MIN_PASSWORD} caracteres
                    </li>
                    <li data-state={matchState}>
                      <RuleIcon state={matchState} />
                      Las dos coinciden
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
                aria-label={step === "email" && locked ? "Enviar código, bloqueado temporalmente" : undefined}
              >
                {busy && <span className={styles.spinner} aria-hidden="true" />}
                {step === "email" && locked ? (
                  <>
                    Espera <span className={styles.lockCount}>{clock(secondsLeft)}</span>
                  </>
                ) : busy ? (
                  "Un momento"
                ) : step === "email" ? (
                  "Enviar código"
                ) : step === "code" ? (
                  "Verificar código"
                ) : (
                  "Guardar contraseña"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {step !== "done" && (
        <div className={styles.footer}>
          <Link className={styles.link} href="/admin/login">
            Volver a iniciar sesión
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
              Usar otro correo
            </button>
          )}
        </div>
      )}
    </>
  );
}
