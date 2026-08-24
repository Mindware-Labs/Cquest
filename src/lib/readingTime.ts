import type { Locale } from "@/i18n/config";
import { extractText, type Block } from "@/lib/blocks";

/* Tiempo de lectura estimado.
   ---------------------------------------------------------------------------

   200 palabras por minuto es la media aceptada para lectura de pantalla en
   prosa (los estudios sobre papel dan más, entre 240 y 300, pero en pantalla y
   con imágenes de por medio se lee más lento). No se afina más porque el número
   no pretende ser exacto: sirve para decidir si se lee ahora o después, y a esa
   pregunta "4 min" y "4 min 20 s" contestan lo mismo.

   Mínimo un minuto: "0 min de lectura" no es información, es un error visible.
*/

const WORDS_PER_MINUTE = 200;

export function readingMinutes(blocks: readonly Block[]): number {
  const words = extractText(blocks)
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const LABEL: Record<Locale, (minutes: number) => string> = {
  es: (minutes) => `${minutes} min de lectura`,
  en: (minutes) => `${minutes} min read`,
};

export function readingTimeLabel(blocks: readonly Block[], lang: Locale): string {
  return LABEL[lang](readingMinutes(blocks));
}
