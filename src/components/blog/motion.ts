"use client";

import { useEffect, useLayoutEffect } from "react";

/* useLayoutEffect corre antes del primer pintado, que es justo lo que hace falta
   para esconder los elementos que van a entrar sin que se vean un cuadro antes.
   En el servidor no existe, y React avisa por consola si se lo llama ahí; este
   alias elige el que corresponde según dónde se está ejecutando. */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Las duraciones salen de la tabla del sistema: 150-300ms para un cambio de
   estado, 300-500ms para una capa, y 500-800ms para una entrada deliberada.
   Están acá y no repetidas en cada archivo para que el ritmo del blog sea uno
   solo y se pueda cambiar en un lugar. */
export const BLOG_DURATION = {
  feedback: 0.2,
  state: 0.4,
  reveal: 0.7,
  focal: 0.95,
} as const;

/* La cortina de las portadas: la imagen se descubre de abajo hacia arriba en vez
   de aparecer entera. Es el gesto de imprenta —el papel saliendo del rodillo— y
   es lo que hace que la entrada se lea como editorial y no como una landing con
   cosas que suben. */
export const CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
export const CLIP_SHOWN = "inset(0% 0% 0% 0%)";

/* Espera a que las fuentes estén listas antes de partir un titular en líneas.
   Si se mide con la fuente de sistema, los cortes de línea se calculan sobre un
   ancho que no es el final, y al cargar Josefin Sans las líneas quedan partidas
   donde no va. */
export async function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.ready;
  } catch {
    /* Si la API falla, seguir igual: un corte de línea imperfecto es mejor que
       un titular que nunca aparece. */
  }
}
