"use client";

import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect no existe en el servidor (React avisa por consola); este alias elige el que corresponde según dónde se ejecuta.
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Duraciones centralizadas (no repetidas por archivo) para que el ritmo del blog sea uno solo y se pueda cambiar en un lugar.
export const BLOG_DURATION = {
  feedback: 0.2,
  state: 0.4,
  reveal: 0.7,
  focal: 0.95,
} as const;

// Cortina de las portadas: la imagen se descubre de abajo hacia arriba (gesto de imprenta), para leerse como editorial y no como landing.
export const CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
export const CLIP_SHOWN = "inset(0% 0% 0% 0%)";

// Espera a las fuentes antes de partir un titular en líneas: medir con la fuente de sistema calcularía cortes que Josefin Sans luego desalinea.
export async function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.ready;
  } catch {
    // Si la API falla, seguir igual: un corte de línea imperfecto es mejor que un titular que nunca aparece.
  }
}
