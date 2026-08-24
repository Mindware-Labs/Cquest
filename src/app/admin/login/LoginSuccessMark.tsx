"use client";

import type { RefObject } from "react";

/* La marca de éxito: un círculo y un check que se DIBUJAN, no que aparecen.

   Se dibujan con stroke-dashoffset y no con un escalado: un trazo que se traza
   ocupa el tiempo contando algo —el círculo se cierra, después el check lo
   confirma— mientras que un icono que hace "pop" sólo llena un hueco. Es la
   diferencia entre una animación que informa y una que decora.

   Sin texto visible a propósito. El aviso para lectores de pantalla va aparte,
   en el formulario, porque una marca dibujada no la anuncia nadie. */

/* Perímetro real de r=24 (2π·24). Si cambia el radio, cambia este número: un
   dash mal medido deja el trazo cortado o arrancado a mitad de camino. */
const CIRCLE_LENGTH = 150.8;

/* Largo del path del check, medido de sus dos segmentos. Redondeado hacia
   arriba: sobrar dash es invisible, faltar deja el trazo incompleto. */
const CHECK_LENGTH = 34;

export { CIRCLE_LENGTH, CHECK_LENGTH };

export default function LoginSuccessMark({
  rootRef,
  circleRef,
  checkRef,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  circleRef: RefObject<SVGCircleElement | null>;
  checkRef: RefObject<SVGPathElement | null>;
}) {
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      /* Cubre el formulario con el propio color de la tarjeta en vez de
         reemplazarlo: así la caja no cambia de alto y nada salta debajo.

         Tokens del PANEL, no del sitio público. Esta pantalla ya se migró a
         `--p-*` (ver el comentario en login/page.tsx), pero la marca de éxito
         se quedó pintando con `--surface-raised` y `--brand-verde`, o sea con
         la escala del otro sistema. `--p-surface` es el mismo blanco, así que
         no cambia nada a la vista — cambia de qué sistema depende. */
      className="absolute inset-0 grid place-items-center bg-[var(--p-surface)] opacity-0"
    >
      <svg
        viewBox="0 0 52 52"
        /* `--p-success` y no `--brand-verde`: este check porta significado —dice
           "entraste"— así que cae bajo WCAG 1.4.11, que pide 3:1 contra el
           fondo. El verde de marca daba 2.85:1 sobre el blanco de la tarjeta;
           el verde del panel da 6.7:1. Y de paso es el color que el resto del
           panel ya usa para decir "correcto". */
        className="size-14 text-[var(--p-success)]"
        fill="none"
        stroke="currentColor"
      >
        <circle
          ref={circleRef}
          cx="26"
          cy="26"
          r="24"
          strokeWidth="1.6"
          strokeDasharray={CIRCLE_LENGTH}
          strokeDashoffset={CIRCLE_LENGTH}
        />
        <path
          ref={checkRef}
          d="M15 26.5 23 34 37.5 19"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          strokeDashoffset={CHECK_LENGTH}
        />
      </svg>
    </div>
  );
}
