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

/* Avisos del panel.

   Existe por una razón concreta y no por completar el catálogo: sin un aviso,
   una acción que sale bien no tiene confirmación —la fila cambia y listo— y una
   que ofrece deshacer no tiene dónde ofrecerlo.

   Sin librería. Un sistema de avisos son una lista, un temporizador y una
   región `aria-live`; traer una dependencia de 12 kB para eso paga peso por
   código que igual habría que envolver para que respete los tokens. */

export type ToastTone = "info" | "success" | "danger";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  /* Duración en milisegundos. Si el aviso lleva una acción, ESTE es el tiempo
     real que tiene la persona para usarla: la barra de abajo lo dibuja. */
  durationMs?: number;
  action?: { label: string; onClick: () => void };
  /* Se ejecuta cuando el aviso se va sin que nadie haya tocado la acción. Es
     lo que convierte "deshacer" en algo honesto: la operación destructiva se
     dispara acá, al vencer el plazo, y no antes. */
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
  /* Se anota si la acción se usó, para NO llamar a onExpire después. Sin esto,
     deshacer y dejar vencer harían las dos cosas.

     Se expone como dos funciones y no como el Set en crudo: leer `.current` de
     un ref mientras se renderiza es justamente lo que React desaconseja —el
     valor no participa del render y hacerlo pasar por ahí lleva a componentes
     que no se actualizan cuando deberían. Dentro de una función, en cambio, se
     lee recién cuando se la llama, que es siempre después del render. */
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
      {/* La región vive fuera del árbol de contenido y es `polite`: un aviso de
          "guardado" no debe interrumpir lo que el lector de pantalla esté
          diciendo en ese momento. */}
      {/* `aria-live` va acá y no en cada aviso: la región tiene que existir en
          el árbol ANTES de que aparezca el contenido, o el lector de pantalla
          no observa el cambio. Un `role="region"` a secas —lo que había— no
          anuncia nada, y toda la ventana de "Deshacer" de cada borrado del
          panel era silenciosa. `atomic=false` para que se lea el aviso nuevo y
          no la pila entera cada vez. */}
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

  /* El temporizador se monta una vez y no se reinicia con cada render: si
      dependiera del objeto `toast` entero, cualquier render del padre volvería
      a darle cinco segundos y el aviso no se iría nunca. */
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
            /* Se marca ANTES de ejecutar: si la acción lanza, el vencimiento
               tampoco debe dispararse. */
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
          /* Cerrar a mano NO cancela la operación pendiente: quien cierra el
             aviso está diciendo "ya lo vi", no "deshacé". Para deshacer está el
             botón de al lado. Se consulta ANTES de descartar, porque descartar
             limpia la marca. */
          if (!isResolved(id)) onExpire?.();
          onDismiss(id);
        }}
      />

      {/* La barra de tiempo. En un aviso con "deshacer" no es decoración: es la
          única forma de saber cuánto queda antes de que la acción sea
          definitiva. Por eso sigue viva con movimiento reducido. */}
      <span aria-hidden="true" className="cq-toast-timer" style={{ background: accent }} />
    </div>
  );
}
