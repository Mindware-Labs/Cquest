import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import LocationExperience from "./LocationExperience";

const TITLE: Record<Locale, string> = {
  en: "Our Location | Center Quest",
  es: "Nuestra Ubicación | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Everything runs from a single control room in Santo Domingo. See where Center Quest's operations centre is and how to get there.",
  es: "Todo corre desde una sola sala de operaciones en Santo Domingo. Mira dónde está el centro de operaciones de Center Quest y cómo llegar.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/location"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default function LocationPage() {
  return <LocationExperience />;
}
