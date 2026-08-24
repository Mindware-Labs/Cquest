import type { Locale } from "@/i18n/config";
import { extractText, type Block } from "@/lib/blocks";

// 200 palabras/min es la media aceptada para lectura de pantalla (el papel da más, 240-300); no se afina más porque el número solo sirve para decidir si se lee ahora o después. Mínimo un minuto: "0 min de lectura" se lee como error.
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
