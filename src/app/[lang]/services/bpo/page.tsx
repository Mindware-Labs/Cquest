import type { Metadata } from "next";
import BpoDetail from "./BpoDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Operations | Center Quest",
  es: "Operaciones | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Business Process Outsourcing: back office support, data processing, omnichannel support, trust and safety, quality assurance, and consulting.",
  es: "Business Process Outsourcing: soporte de back office, procesamiento de datos, soporte omnicanal, trust and safety, control de calidad y consultoría.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/bpo"),
  };
}

export default function BpoPage() {
  return <BpoDetail />;
}
