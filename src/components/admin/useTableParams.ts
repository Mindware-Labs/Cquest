"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/* Búsqueda, orden y página viven en la URL para que el servidor pueda leerlas
   y devolver solo esa página. De paso el atrás del navegador vuelve a la vista
   anterior en vez de salir de la tabla. */
export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParams(next: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  return { pending, setParams };
}

/* El input responde a cada tecla, la consulta no: sin la espera, cada letra
   sería una navegación y una lectura a la base. */
export function useDebouncedSearch(
  value: string,
  commit: (next: string) => void,
  delay = 300,
) {
  const [text, setText] = useState(value);
  const [applied, setApplied] = useState(value);

  /* Ajuste durante el render, no en un efecto: la URL puede cambiar por fuera
     —atrás del navegador, enlace pegado— y el input tiene que seguirla. */
  if (applied !== value) {
    setApplied(value);
    setText(value);
  }

  // En una ref para que el temporizador no dependa de la identidad del callback.
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  useEffect(() => {
    if (text === value) return;
    const id = setTimeout(() => commitRef.current(text), delay);
    return () => clearTimeout(id);
  }, [text, value, delay]);

  return [text, setText] as const;
}
