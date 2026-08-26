"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import styles from "@/components/admin/fields.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const schema = z.object({
  email: z.email("Escribe un correo válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});

/* Solo rutas internas del panel: un `next` externo sería un open redirect. */
function safeNext(value: string | undefined): string {
  if (!value) return "/admin";
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function messageFor(status: number | undefined, code: string | undefined): string {
  if (status === 429) return "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
  if (code === "BANNED_USER") return "Esta cuenta está bloqueada. Habla con un administrador.";
  if (status === 401 || code === "INVALID_EMAIL_OR_PASSWORD") return "Correo o contraseña incorrectos.";
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function AlertIcon() {
  return (
    <svg className={styles.errorIcon} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.5 13 12.5H1L7 1.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 5.6v3M7 10.4v.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
  const [showErrors, setShowErrors] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (submitting) return;

    if (!valid) {
      setShowErrors(true);
      setFocusAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const { error } = await authClient.signIn.email({ email: email.trim(), password });

    if (error) {
      setSubmitting(false);
      setFormError(messageFor(error.status, error.code));
      return;
    }

    router.push(safeNext(next));
    router.refresh();
  }

  const liveMessage = submitting
    ? "Verificando credenciales."
    : formError
      ? formError
      : showErrors && !valid
        ? "Revisa los campos marcados."
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
        Acceso al panel
      </motion.span>
      <motion.h1 className={styles.heading} {...rise(0.12)}>
        Inicia sesión
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
        {formError && (
          <p className={styles.formError} role="alert">
            <AlertIcon />
            <span>{formError}</span>
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Correo
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
            Contraseña
          </label>
          <input
            id={passwordId}
            className={styles.input}
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={showErrors && Boolean(errors.password)}
            aria-describedby={showErrors && errors.password ? `${passwordId}-error` : undefined}
          />
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
          disabled={submitting}
          data-inactive={!valid && showErrors}
          aria-disabled={!valid}
        >
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
          {submitting ? "Verificando" : "Entrar al panel"}
        </button>
      </motion.form>

      <motion.div className={styles.footer} {...rise(0.32)}>
        <Link className={styles.link} href="/admin/forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
        <span className={styles.note}>Las cuentas se crean desde dentro.</span>
      </motion.div>
    </>
  );
}
