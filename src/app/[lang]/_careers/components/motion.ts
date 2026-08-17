"use client";

import type { TargetAndTransition, Transition } from "motion/react";

/* Motion cubre en este módulo lo que anime.js no toca: el estado de los
   controles bajo el puntero y bajo el dedo. La división no es de gusto — dos
   librerías escribiendo el `transform` del mismo nodo se pisan, así que anime
   se queda con las entradas y con los nodos que anima por selector, y Motion
   con los botones y enlaces, que ninguna timeline apunta.

   Un solo juego de valores para todas las llamadas del módulo: el sitio ya
   tiene un lenguaje de botón (ver `QuestCta`) y lo que se toca aquí tiene que
   responder igual que allí. */

/** Levantar y crecer apenas. El muelle es lo que hace visible el gesto: sin él
    3px de subida pasan desapercibidos en un botón de 46px de alto. */
export const CTA_HOVER: TargetAndTransition = { y: -3, scale: 1.03 };

/** Y se hunde al pulsarlo. Esto es lo que faltaba: en móvil, donde no hay
    hover, el botón no daba ninguna señal de haber recibido el toque. */
export const CTA_TAP: TargetAndTransition = { scale: 0.95, y: 0 };

export const CTA_TRANSITION: Transition = { type: "spring", stiffness: 460, damping: 22 };
