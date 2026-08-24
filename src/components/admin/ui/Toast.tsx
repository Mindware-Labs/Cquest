"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { IconClose } from "./icons";
import { IconButton } from "./Button";

// Sin librería a propósito: un sistema de avisos es una lista, un temporizador y una región `aria-live` — no vale una dependencia de 12kB para eso.

export type ToastTone = "info" | "success" | "danger";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  // Si el aviso lleva una acción, este es el tiempo real que tiene la persona para usarla; la barra de abajo lo dibuja.
  durationMs?: number;
  action?: { label: string; onClick: () => void };
  // Se ejecuta cuando el aviso se va sin que nadie tocó la acción: la operación destructiva se dispara acá, al vencer el plazo, no antes.
  onExpire?: () => void;
};

type Toast = ToastInput & { id: number };

type ToastApi = {
  notify: (input: ToastInput) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return context;
}

const DEFAULT_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  // Anota si la acción se usó, para NO llamar a onExpire después. Se expone como funciones (no el Set crudo) porque leer `.current` durante el render es lo que React desaconseja.
  const resolved = useRef(new Set<number>());

  const markResolved = useCallback((id: number) => {
    resolved.current.add(id);
  }, []);

  const isResolved = useCallback((id: number) => resolved.current.has(id), []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    resolved.current.delete(id);
  }, []);

  const notify = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...input, id }]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* `aria-live="polite"` vive en el contenedor y no en cada aviso: tiene que existir en el árbol ANTES del contenido o el lector de pantalla no observa el cambio. `atomic=false` para leer sólo el aviso nuevo, no toda la pila. */}
      <div
        role="region"
        aria-label="Avisos"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--p-z-toast)] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-0"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            markResolved={markResolved}
            isResolved={isResolved}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  markResolved,
  isResolved,
  onDismiss,
}: {
  toast: Toast;
  markResolved: (id: number) => void;
  isResolved: (id: number) => boolean;
  onDismiss: (id: number) => void;
}) {
  const duration = toast.durationMs ?? DEFAULT_MS;
  const { id, onExpire } = toast;

  // No depende del objeto `toast` entero: si lo hiciera, cualquier render del padre reiniciaría el plazo y el aviso no se iría nunca.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isResolved(id)) onExpire?.();
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onExpire, onDismiss, isResolved]);

  const accent =
    toast.tone === "success"
      ? "var(--p-success)"
      : toast.tone === "danger"
        ? "var(--p-danger)"
        : "var(--p-accent)";

  return (
    <div
      className="cq-overlay cq-toast pointer-events-auto relative"
      style={{ "--cq-toast-ms": `${duration}ms` } as CSSProperties}
    >
      <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
      <p className="cq-body min-w-0 flex-1 text-[var(--p-ink)]">{toast.message}</p>

      {toast.action && (
        <button
          type="button"
          className="cq-btn shrink-0"
          data-variant="outline"
          data-size="sm"
          onClick={() => {
            // Se marca ANTES de ejecutar: si la acción lanza, el vencimiento tampoco debe dispararse.
            markResolved(id);
            toast.action?.onClick();
            onDismiss(id);
          }}
        >
          {toast.action.label}
        </button>
      )}

      <IconButton
        label="Cerrar el aviso"
        size="sm"
        icon={<IconClose size={13} />}
        className="shrink-0"
        onClick={() => {
          // Cerrar a mano NO cancela la operación pendiente ("ya lo vi", no "deshacé"); se consulta ANTES de descartar porque descartar limpia la marca.
          if (!isResolved(id)) onExpire?.();
          onDismiss(id);
        }}
      />

      {/* No es decoración: en un aviso con "deshacer" es la única forma de saber cuánto queda antes de que la acción sea definitiva. */}
      <span aria-hidden="true" className="cq-toast-timer" style={{ background: accent }} />
    </div>
  );
}
