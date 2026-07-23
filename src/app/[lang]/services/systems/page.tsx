import type { Metadata } from "next";
import SystemsDetail from "./SystemsDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Systems Development for Operations | Center Quest",
  es: "Desarrollo de Sistemas para Operaciones | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Custom software for operations: CRMs, dashboards, and AI implementation shaped around how the client actually works.",
  es: "Software a la medida para operaciones: CRMs, dashboards, automatización e implementación de IA, según cómo trabaja tu negocio.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/systems"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

const SERVICE_JSON_LD = (lang: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Systems Development",
  name: TITLE[lang],
  description: DESCRIPTION[lang],
  provider: { "@type": "Organization", name: "Center Quest" },
  areaServed: "Dominican Republic",
});

export default async function SystemsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD(lang)) }}
      />
      <SystemsDetail />
    </>
  );
}
