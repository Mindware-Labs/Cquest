import type { Locale } from "@/i18n/config";

export const PARTNER_SLOTS: ReadonlyArray<{
  slug: string;
  name: Record<Locale, string>;
}> = [
  {
    slug: "company-name",
    name: { en: "Company name", es: "Nombre de empresa" },
  },
];
