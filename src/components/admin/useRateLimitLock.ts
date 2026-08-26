"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// Techo de cordura: una marca manipulada no puede dejar un botón muerto para siempre.
const MAX_LOCK_MS = 60 * 60 * 1000;

type Entry = { cached?: string | null; listeners: Set<() => void> };

const entries = new Map<string, Entry>();

function entryFor(key: string): Entry {
  let entry = entries.get(key);
  if (!entry) {
    entry = { listeners: new Set() };
    entries.set(key, entry);
  }
  return entry;
}

// getSnapshot corre en cada render: sin caché sería una lectura de disco por render.
function read(key: string): string | null {
  const entry = entryFor(key);
  if (entry.cached === undefined) {
    try {
      entry.cached = localStorage.getItem(key);
    } catch {
      entry.cached = null;
    }
  }
  return entry.cached;
}

function write(key: string, until: number | null) {
  const entry = entryFor(key);
  entry.cached = until ? String(until) : null;
  try {
    if (until) localStorage.setItem(key, entry.cached!);
    else localStorage.removeItem(key);
  } catch {}
  for (const notify of entry.listeners) notify();
}

export function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/* Bloqueo persistente para botones limitados por el servidor: sin esto, recargar
   la página hace que la UI olvide una espera que el servidor sigue contando. */
export function useRateLimitLock(key: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const entry = entryFor(key);
      const external = () => {
        entry.cached = undefined;
        onChange();
      };
      entry.listeners.add(onChange);
      window.addEventListener("storage", external);
      return () => {
        entry.listeners.delete(onChange);
        window.removeEventListener("storage", external);
      };
    },
    [key],
  );

  // null en servidor y en la primera pasada: leer localStorage en render rompe la hidratación.
  const stored = useSyncExternalStore(
    subscribe,
    useCallback(() => read(key), [key]),
    () => null,
  );

  const parsed = stored ? Number(stored) : 0;
  const lockUntil = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Se recalcula desde la marca absoluta: restar de a uno se atrasa en pestañas de fondo.
  useEffect(() => {
    if (!lockUntil) return;
    const update = () => {
      const remaining = lockUntil - Date.now();
      if (remaining > MAX_LOCK_MS) {
        write(key, null);
        return;
      }
      const left = Math.max(0, Math.ceil(remaining / 1000));
      setSecondsLeft(left);
      if (left === 0) write(key, null);
    };
    // En timeout y no en el cuerpo del efecto: un setState síncrono encadena renders.
    const first = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [key, lockUntil]);

  const start = useCallback(
    (seconds: number) => {
      setSecondsLeft(seconds);
      write(key, Date.now() + seconds * 1000);
    },
    [key],
  );

  const clear = useCallback(() => {
    setSecondsLeft(0);
    write(key, null);
  }, [key]);

  return { locked: secondsLeft > 0, secondsLeft, start, clear };
}
