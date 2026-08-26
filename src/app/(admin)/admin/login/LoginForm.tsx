"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  if (code === "BANNED_USER") return "Esta cuenta está bloqueada. Habla con un administrador.";
  if (status === 401 || code === "INVALID_EMAIL_OR_PASSWORD") return "Correo o contraseña incorrectos.";
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const LOCK_KEY = "cq.admin.login.lock-until";

/* Texto sin cifras: el número vive en el botón y aquí re-anunciaría cada segundo. */
const LOCK_NOTICE =
  "Demasiados intentos seguidos. El acceso se rehabilita cuando termine la cuenta atrás.";

// El bloqueo lo impone el servidor; esto solo evita que la UI lo olvide al recargar.
const lockListeners = new Set<() => void>();

// getSnapshot corre en cada render: sin caché sería una lectura de disco por render.
let cached: string | null | undefined;

function readLockUntil(): string | null {
  if (cached === undefined) {
    try {
      cached = localStorage.getItem(LOCK_KEY);
    } catch {
      cached = null;
    }
  }
  return cached;
}

function writeLockUntil(until: number | null) {
  cached = until ? String(until) : null;
  try {
    if (until) localStorage.setItem(LOCK_KEY, cached!);
    else localStorage.removeItem(LOCK_KEY);
  } catch {}
  for (const notify of lockListeners) notify();
}

function subscribeLock(onChange: () => void) {
  const external = () => {
    cached = undefined;
    onChange();
  };
  lockListeners.add(onChange);
  window.addEventListener("storage", external);
  return () => {
    lockListeners.delete(onChange);
    window.removeEventListener("storage", external);
  };
}

// Techo de cordura: una marca manipulada no puede dejar el botón muerto para siempre.
const MAX_LOCK_MS = 60 * 60 * 1000;

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
  /* null en servidor y en la primera pasada: leer localStorage en render rompería la hidratación. */
  const storedLock = useSyncExternalStore(subscribeLock, readLockUntil, () => null);
  const parsed = storedLock ? Number(storedLock) : 0;
  const lockUntil = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const locked = secondsLeft > 0;

  // Se recalcula desde la marca absoluta: restar de a uno se atrasa en pestañas de fondo.
  useEffect(() => {
    if (!lockUntil) return;
    const update = () => {
      const remaining = lockUntil - Date.now();
      if (remaining > MAX_LOCK_MS) {
        writeLockUntil(null);
        return;
      }
      const left = Math.max(0, Math.ceil(remaining / 1000));
      setSecondsLeft(left);
      if (left === 0) writeLockUntil(null);
    };
    // En timeout y no en el cuerpo del efecto: un setState síncrono encadena renders.
    const first = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [lockUntil]);

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
        setSecondsLeft(retryAfter);
        writeLockUntil(Date.now() + retryAfter * 1000);
        return;
      }
      setFormError(messageFor(error.status, error.code));
      return;
    }

    writeLockUntil(null);
    router.push(safeNext(next));
    router.refresh();
  }

  const errorText = locked ? LOCK_NOTICE : formError;

  const liveMessage = submitting
    ? "Verificando credenciales."
    : errorText
      ? errorText
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
        {errorText && (
          <p className={styles.formError} role="alert">
            <AlertIcon />
            <span>{errorText}</span>
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
              aria-label="Mostrar contraseña"
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
          aria-label={locked ? "Entrar al panel, bloqueado temporalmente" : undefined}
        >
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
          {locked ? (
            <>
              Espera <span className={styles.lockCount}>{clock(secondsLeft)}</span>
            </>
          ) : submitting ? (
            "Verificando"
          ) : (
            "Entrar al panel"
          )}
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
