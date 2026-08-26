"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { clock, useRateLimitLock } from "@/components/admin/useRateLimitLock";
import styles from "@/components/admin/fields.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

/* Solo rutas internas del panel: un `next` externo sería un open redirect. */
function safeNext(value: string | undefined): string {
  if (!value) return "/admin";
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function messageFor(status: number | undefined, code: string | undefined): string {
  if (code === "BANNED_USER") return "This account is blocked. Talk to an administrator.";
  if (status === 401 || code === "INVALID_EMAIL_OR_PASSWORD") return "Wrong email or password.";
  return "Could not sign in. Try again.";
}

const LOCK_KEY = "cq.admin.login.lock-until";

/* Texto sin cifras: el número vive en el botón y aquí re-anunciaría cada segundo. */
const LOCK_NOTICE =
  "Too many attempts in a row. Access comes back when the countdown ends.";

function AlertIcon() {
  return (
    <svg className={styles.errorIcon} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.5 13 12.5H1L7 1.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 5.6v3M7 10.4v.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const formRef = useRef<HTMLFormElement>(null);
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { locked, secondsLeft, start: startLock, clear: clearLock } = useRateLimitLock(LOCK_KEY);


  const errors = useMemo(() => {
    const parsed = schema.safeParse({ email, password });
    if (parsed.success) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !map[key]) map[key] = issue.message;
    }
    return map;
  }, [email, password]);

  const valid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!focusAttempt) return;
    formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [focusAttempt]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || locked) return;

    if (!valid) {
      setShowErrors(true);
      setFocusAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    let retryAfter = 0;
    const { error } = await authClient.signIn.email(
      { email: email.trim(), password },
      { onError: (ctx) => { retryAfter = Number(ctx.response.headers.get("X-Retry-After")) || 0; } },
    );

    if (error) {
      setSubmitting(false);
      if (error.status === 429 && retryAfter > 0) {
        setFormError(null);
        startLock(retryAfter);
        return;
      }
      setFormError(messageFor(error.status, error.code));
      return;
    }

    clearLock();
    router.push(safeNext(next));
    router.refresh();
  }

  const errorText = locked ? LOCK_NOTICE : formError;

  const liveMessage = submitting
    ? "Checking credentials."
    : errorText
      ? errorText
      : showErrors && !valid
        ? "Check the highlighted fields."
        : "";

  const rise = (delay: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <>
      <motion.span className={styles.eyebrow} {...rise(0.06)}>
        Panel access
      </motion.span>
      <motion.h1 className={styles.heading} {...rise(0.12)}>
        Sign in
      </motion.h1>
      <motion.div
        className={styles.headingRule}
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0 : 0.9, delay: 0.2, ease: EASE }}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      <motion.form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        {...rise(0.24)}
      >
        {errorText && (
          <p className={styles.formError} role="alert">
            <AlertIcon />
            <span>{errorText}</span>
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            className={styles.input}
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@cquest.do"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={showErrors && Boolean(errors.email)}
            aria-describedby={showErrors && errors.email ? `${emailId}-error` : undefined}
          />
          {showErrors && errors.email && (
            <span className={styles.fieldError} id={`${emailId}-error`} role="alert">
              <AlertIcon />
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={passwordId}>
            Password
          </label>
          <div className={styles.inputWrap}>
            <input
              id={passwordId}
              className={`${styles.input} ${styles.inputWithAction}`}
              type={revealed ? "text" : "password"}
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={showErrors && Boolean(errors.password)}
              aria-describedby={showErrors && errors.password ? `${passwordId}-error` : undefined}
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
          {showErrors && errors.password && (
            <span className={styles.fieldError} id={`${passwordId}-error`} role="alert">
              <AlertIcon />
              {errors.password}
            </span>
          )}
        </div>

        <button
          className={styles.submit}
          type="submit"
          disabled={submitting || locked}
          data-inactive={!valid && showErrors}
          data-locked={locked}
          aria-disabled={!valid || locked}
          /* Nombre estable: si cambiara cada segundo, el lector lo repetiría. */
          aria-label={locked ? "Sign in to the panel, temporarily locked" : undefined}
        >
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
          {locked ? (
            <>
              Wait <span className={styles.lockCount}>{clock(secondsLeft)}</span>
            </>
          ) : submitting ? (
            "Checking"
          ) : (
            "Sign in"
          )}
        </button>
      </motion.form>

      <motion.div className={styles.footer} {...rise(0.32)}>
        <Link className={styles.link} href="/admin/reset-password">
          Forgot your password?
        </Link>
        <span className={styles.note}>Accounts are created from the inside.</span>
      </motion.div>
    </>
  );
}
