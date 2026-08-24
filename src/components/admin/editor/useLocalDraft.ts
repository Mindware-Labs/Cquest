"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

// Copia el estado a localStorage mientras se escribe, para recuperar el trabajo si se cierra la pestaña sin guardar; no se aplica sola, sólo se ofrece.

const PREFIX = "cq:post-draft:";
// Más viejo que esto ya no vale la pena ofrecerlo como recuperación.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const DEBOUNCE_MS = 1000;

type Stored<T> = { savedAt: number; baseline: string | null; data: T };

function storageKey(postId: number | undefined): string {
  return `${PREFIX}${postId ?? "new"}`;
}

// getSnapshot devuelve la cadena cruda (no el objeto parseado): JSON.parse crea un objeto nuevo cada vez y React lo vería como cambio en cada render. emit() avisa a la propia pestaña, porque el evento "storage" del navegador sólo llega a las otras.
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Modo privado o storage deshabilitado: el editor abre normal, sin romperse por su propia red.
    return null;
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Nada que limpiar. */
  }
}

// El vencimiento se evalúa acá (al interpretar la instantánea) y no dentro del hook, para no depender de cuántas veces React renderizó.
function parse<T>(raw: string | null): Stored<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Stored<T>;
    if (typeof parsed?.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export type LocalDraft<T> = {
  /** El borrador recuperable, o null si no hay ninguno que valga la pena. */
  recovered: T | null;
  /** Aplicarlo. Lo saca del almacenamiento para que no se vuelva a ofrecer. */
  discard: () => void;
};

export function useLocalDraft<T>({
  postId,
  snapshot,
  isDirty,
  // Lo guardado en la base al cargar la página: la vara para saber si la copia local aporta algo o es ruido.
  baseline,
}: {
  postId: number | undefined;
  snapshot: T;
  isDirty: boolean;
  baseline: string;
}): LocalDraft<T> {
  const key = storageKey(postId);

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  const recovered = useMemo<T | null>(() => {
    const stored = parse<T>(raw);
    if (!stored) return null;

    // No ofrecerlo si es igual a lo ya guardado, o si se hizo sobre una versión anterior a la que hay ahora (alguien más pudo haber guardado en el medio).
    if (JSON.stringify(stored.data) === baseline) return null;
    if (stored.baseline !== null && stored.baseline !== baseline) return null;

    return stored.data;
  }, [raw, baseline]);

  // Se guarda sólo si hay cambios sin guardar: al guardar bien, isDirty baja y la copia local se borra sola.
  useEffect(() => {
    if (!isDirty) {
      remove(key);
      emit();
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const payload: Stored<T> = { savedAt: Date.now(), baseline, data: snapshot };
        window.localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Cuota excedida o modo privado: falla en silencio, sin afectar al editor.
      }
      // Sin emit() acá a propósito: reevaluaría el borrador recuperable en cada tecla y el aviso reaparecería tras haberlo descartado.
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [key, snapshot, isDirty, baseline]);

  const discard = useCallback(() => {
    remove(key);
    emit();
  }, [key]);

  return { recovered, discard };
}

/** Limpia la clave "new" tras crear el artículo, para que no quede huérfana y se reofrezca en el próximo "Nuevo artículo". */
export function clearNewPostDraft(): void {
  remove(storageKey(undefined));
  emit();
}
