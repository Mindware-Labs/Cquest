import type { Locale } from "@/i18n/config";

const TAG: Record<Locale, string> = {
  es: "es-DO",
  en: "en-US",
};

// timeZone fijo: sin él el servidor formatea en UTC y el navegador en la zona del visitante, causando un desajuste de hidratación en React.
export function formatPostDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(TAG[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santo_Domingo",
  }).format(date);
}
