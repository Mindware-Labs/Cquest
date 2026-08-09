import type { Metadata } from "next";
import OperationsDetail from "./OperationsDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Operations (BPO) | Center Quest",
  es: "Operaciones (BPO) | Center Quest",
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
    alternates: localeAlternates(lang, "/services/operations"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default async function OperationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd data={servicePageGraph("bpo", lang)} />
      <OperationsDetail />
    </>
  );
}
