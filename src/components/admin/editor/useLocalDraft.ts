"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

/* Recuperación de un borrador perdido.
   ---------------------------------------------------------------------------

   El editor son varias pantallas de trabajo que viven ENTERAS en memoria del
   navegador hasta que alguien aprieta Guardar. Había un `beforeunload` y un
   guard sobre los enlaces del panel, y los dos cubren lo mismo: que la persona
   decida irse. No cubren nada de lo que de verdad se lleva el trabajo — que se
   caiga la pestaña, que el sistema reinicie por una actualización, que se corte
   la luz, que el navegador mate la pestaña por memoria en un teléfono.

   Acá el estado se copia a `localStorage` mientras se escribe. Al volver a
   abrir el mismo artículo, si hay una copia MÁS NUEVA que lo guardado en la
   base, se ofrece recuperarla. No se aplica sola: aplicar sin preguntar es
   pisar con una copia local lo que quizá otra persona guardó bien en el medio.

   Por qué `localStorage` y no un autoguardado contra el servidor: un borrador
   que se guarda solo cada treinta segundos publica versiones a medio escribir
   en el registro compartido, y con la guarda de concurrencia recién puesta
   además pelearía contra la otra pestaña. Esto es una red para el dueño de la
   pestaña, no una segunda fuente de verdad. */

const PREFIX = "cq:post-draft:";
/* Un borrador local más viejo que esto es basura: si alguien no vuelve al
   artículo en una semana, lo que tenía a medio escribir ya no es lo que quiere
   recuperar, y ofrecérselo es ofrecerle un error. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/* Un segundo después de la última tecla. Menos escribe en cada pulsación —y
   serializar un árbol de bloques no es gratis—; más deja una ventana de pérdida
   que ya se parece a no tener nada. */
const DEBOUNCE_MS = 1000;

type Stored<T> = { savedAt: number; baseline: string | null; data: T };

function storageKey(postId: number | undefined): string {
  return `${PREFIX}${postId ?? "new"}`;
}

/* ---------------------------------------------------------------------------
   El almacenamiento como fuente externa
   ---------------------------------------------------------------------------

   Se lee con `useSyncExternalStore`, que es la herramienta hecha para valores
   que sólo existen en el cliente: la instantánea del servidor es `null`, así
   que el HTML entregado y el hidratado coinciden y el aviso de recuperación
   aparece recién después. Con `useState` + `useEffect` lo mismo cuesta un
   render en cascada y una advertencia con razón detrás.

   La instantánea es la CADENA CRUDA y no el objeto parseado: `getSnapshot`
   tiene que devolver el mismo valor mientras nada cambie, y `JSON.parse`
   devuelve un objeto nuevo cada vez — React lo vería como un cambio en cada
   render y entraría en un bucle. El parseo se hace después, con useMemo.

   `emit` existe para que descartar el borrador se note al instante: el evento
   `storage` del navegador sólo avisa a las OTRAS pestañas, nunca a la que
   escribió. */
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
    /* Modo privado o almacenamiento deshabilitado: no hay borrador que
       recuperar y el editor abre normal. Nunca se rompe el editor por su
       propia red. */
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

/* El vencimiento se evalúa acá, al interpretar la instantánea, y no dentro del
   hook. No es para esquivar la regla de pureza: leer el reloj es parte de
   interpretar una marca de tiempo, y esta función es la que traduce los bytes
   del almacenamiento a un dato con sentido. Dentro del componente sí sería un
   problema —el rótulo cambiaría según cuántas veces React dibujó—; acá el
   resultado sólo puede cambiar cuando pasa una semana entera. */
function parse<T>(raw: string | null): Stored<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Stored<T>;
    /* JSON corrupto de una versión anterior del editor. */
    if (typeof parsed?.savedAt !== "number") return null;
    /* Un borrador local más viejo que esto es basura: si alguien no vuelve al
       artículo en una semana, lo que tenía a medio escribir ya no es lo que
       quiere recuperar, y ofrecérselo es ofrecerle un error. */
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
  /* Lo guardado en la base cuando cargó la página. Es la vara para decidir si
     la copia local aporta algo: una copia que refleja exactamente lo que ya
     está guardado no es un borrador perdido, es ruido. */
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

    /* Dos razones para NO ofrecerlo —la tercera, el vencimiento, ya la aplicó
       parse()— y las dos importan:

       - Es igual a lo que ya está en la base: no se perdió nada.
       - Se hizo sobre una versión ANTERIOR a la que hay guardada ahora. O sea
         que alguien guardó después —quizá otra persona—, y ofrecer la copia
         vieja es ofrecer deshacer ese guardado sin decirlo. */
    if (JSON.stringify(stored.data) === baseline) return null;
    if (stored.baseline !== null && stored.baseline !== baseline) return null;

    return stored.data;
  }, [raw, baseline]);

  /* La escritura, con freno. Se guarda SÓLO si hay cambios sin guardar: cuando
     el guardado termina bien, `initial` pasa a ser lo que hay en pantalla,
     `isDirty` baja, y la copia local se borra sola. O sea que guardar limpia la
     red sin que haya que acordarse de limpiarla. */
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
        /* Cuota excedida con un artículo muy grande, o modo privado. La red
           falla en silencio: el editor sigue funcionando igual que antes de que
           esto existiera. */
      }
      /* Sin `emit()` acá a propósito: avisar de la escritura volvería a
         evaluar el borrador recuperable en cada tecla, y el aviso reaparecería
         encima de la persona que lo acaba de descartar. */
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [key, snapshot, isDirty, baseline]);

  const discard = useCallback(() => {
    remove(key);
    emit();
  }, [key]);

  return { recovered, discard };
}

/** La copia local de un artículo recién creado se guarda bajo la clave "new".
 *  Cuando la acción devuelve el id y la pantalla pasa a /edit, esa clave queda
 *  huérfana y volvería a ofrecerse la próxima vez que alguien abra "Nuevo
 *  artículo" — con el contenido del artículo anterior, ya guardado. */
export function clearNewPostDraft(): void {
  remove(storageKey(undefined));
  emit();
}
