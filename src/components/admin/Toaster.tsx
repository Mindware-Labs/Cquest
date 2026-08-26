"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./Toaster.module.css";

type Tone = "success" | "error" | "info";

type Toast = {
  id: string;
  tone: Tone;
  title: string;
  description?: string;
  duration: number;
};

type Api = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const TONE: Record<Tone, { color: string; duration: number }> = {
  success: { color: "var(--brand-verde)", duration: 6000 },
  info: { color: "var(--brand-petroleo)", duration: 6000 },
  // Un fallo hay que poder leerlo dos veces antes de que se vaya.
  error: { color: "var(--danger)", duration: 10000 },
};

const MAX_VISIBLE = 4;

const ToastContext = createContext<Api | null>(null);

export function useToast(): Api {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast necesita estar dentro de <ToastProvider>");
  return api;
}

function ToneIcon({ tone }: { tone: Tone }) {
  const c = { viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.7, width: 11, height: 11 };
  if (tone === "success")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M2 6.3 4.6 9 10 3.2" strokeLinecap="square" />
      </svg>
    );
  if (tone === "error")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M3.2 3.2 8.8 8.8M8.8 3.2 3.2 8.8" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...c} aria-hidden="true">
      <path d="M6 5.2v3.4" strokeLinecap="round" />
      <path d="M6 3.3v.4" strokeLinecap="round" />
    </svg>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div
      className={styles.toast}
      style={{ "--tone": TONE[toast.tone].color } as React.CSSProperties}
      /* alert interrumpe al lector; status espera su turno. */
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <span className={styles.icon} aria-hidden="true">
        <ToneIcon tone={toast.tone} />
      </span>

      <span className={styles.body}>
        <span className={styles.title}>{toast.title}</span>
        {toast.description && <span className={styles.description}>{toast.description}</span>}
      </span>

      <button
        className={styles.close}
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Descartar la notificación"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="m3 3 8 8M11 3l-8 8" strokeLinecap="round" />
        </svg>
      </button>

      <span
        className={styles.timer}
        style={{ animationDuration: `${toast.duration}ms` }}
        onAnimationEnd={() => onDismiss(toast.id)}
      />
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const reduced = useReducedMotion() ?? false;

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((tone: Tone, title: string, description?: string) => {
    const toast: Toast = {
      id: crypto.randomUUID(),
      tone,
      title,
      description,
      duration: TONE[tone].duration,
    };
    setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
  }, []);

  const api = useMemo<Api>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Notificaciones">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <ToastItem toast={toast} onDismiss={dismiss} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
