import type { Locale } from "@/i18n/config";

const TAG: Record<Locale, string> = {
  es: "es-DO",
  en: "en-US",
};

/* timeZone fijo: sin él, el servidor formatea en UTC y el navegador en la zona
   del visitante, y React marca el desajuste al hidratar. Santo Domingo no
   tiene horario de verano, así que la fecha publicada es siempre la misma. */
export function formatPostDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(TAG[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santo_Domingo",
  }).format(date);
}
