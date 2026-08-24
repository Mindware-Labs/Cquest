"use client";

import type { RefObject } from "react";

/* La marca de éxito: un círculo y un check que se DIBUJAN, no que aparecen.

   Se dibujan con stroke-dashoffset y no con un escalado: un trazo que se traza
   ocupa el tiempo contando algo —el círculo se cierra, después el check lo
   confirma— mientras que un icono que hace "pop" sólo llena un hueco. Es la
   diferencia entre una animación que informa y una que decora.

   El trazo va en petróleo, no en `--p-success`. El resto del panel usa verde
   para "correcto" porque convive con insignias de otros estados en la misma
   pantalla y necesita distinguirse de ellas. Acá no hay nada más que
   distinguir — hay una sola marca en toda la vista— así que gana la lectura
   de marca en vez de la semántica genérica del panel. Sigue siendo petróleo
   real (`--brand-petroleo`, 5.2:1 sobre blanco) y no un tinte cualquiera:
   porta significado —dice "entraste"— y cae bajo WCAG 1.4.11 igual que antes.

   El halo detrás SÍ es celeste. Es decorativo puro —no hace falta para
   entender la marca, sólo la envuelve— así que no le aplica el mismo mínimo de
   contraste, y es lo que engancha este momento con el resto de la pantalla:
   el mismo resplandor que ya vive arriba de la tarjeta (login.css).

   Lleva texto real, no sólo el icono. Un check solo, centrado en una tarjeta
   que se encogió pero sigue siendo una caja de buen tamaño, se ve perdido —un
   punto en medio del blanco. El titular y la leyenda son lo que convierte ese
   vacío en una composición, y de paso es lo que ahora anuncia el éxito: la
   marca dibujada no la anuncia nadie, pero este texto sí, así que ya no hace
   falta el párrafo aparte para lectores de pantalla. */

/* Perímetro real de r=24 (2π·24). Si cambia el radio, cambia este número: un
   dash mal medido deja el trazo cortado o arrancado a mitad de camino. */
const CIRCLE_LENGTH = 150.8;

/* Largo del path del check, medido de sus dos segmentos. Redondeado hacia
   arriba: sobrar dash es invisible, faltar deja el trazo incompleto. */
const CHECK_LENGTH = 34;

export { CIRCLE_LENGTH, CHECK_LENGTH };

export default function LoginSuccessMark({
  rootRef,
  iconRef,
  glowRef,
  textRef,
  circleRef,
  checkRef,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  iconRef: RefObject<HTMLDivElement | null>;
  glowRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
  circleRef: RefObject<SVGCircleElement | null>;
  checkRef: RefObject<SVGPathElement | null>;
}) {
  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--p-surface)] px-8 text-center opacity-0"
    >
      {/* `iconRef` es lo que hace el pulso final al cerrar el check — sólo el
          icono, nunca este panel: escalar el panel completo movería también
          el blanco que tapa el formulario, y el fondo de la tarjeta no
          "rebota". Decorativo: lo que dice "entraste" ahora es el texto de
          abajo, no el dibujo. */}
      <div ref={iconRef} aria-hidden="true" className="relative grid place-items-center">
        <span ref={glowRef} className="cq-login-success-glow" />
        <svg
          viewBox="0 0 52 52"
          className="relative size-14 text-[var(--brand-petroleo)]"
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

      {/* `role="status"` en el titular: es el único texto que aparece durante
          este momento, así que es él quien anuncia el éxito, no un párrafo
          invisible aparte. */}
      <div ref={textRef} className="flex flex-col items-center gap-1 opacity-0">
        <p role="status" className="cq-login-success-title">
          Sesión iniciada
        </p>
        <p className="cq-meta">Entrando al panel…</p>
      </div>
    </div>
  );
}
