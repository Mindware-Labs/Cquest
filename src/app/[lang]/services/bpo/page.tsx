import type { Metadata } from "next";
import BpoDetail from "./BpoDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Operations (BPO) in the Dominican Republic | Center Quest",
  es: "Operaciones (BPO) en República Dominicana | Center Quest",
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
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

const SERVICE_JSON_LD = (lang: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Business Process Outsourcing",
  name: TITLE[lang],
  description: DESCRIPTION[lang],
  provider: { "@type": "Organization", name: "Center Quest" },
  areaServed: "Dominican Republic",
});

export default async function BpoPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD(lang)) }}
      />
      <BpoDetail />
    </>
  );
}
