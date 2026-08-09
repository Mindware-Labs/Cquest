import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Call Center Services | Center Quest",
  es: "Servicios de Call Center | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Inbound and outbound contact-center operations: customer service, sales, collections, surveys, onboarding, and tech support, running both Front Office and Back Office, plus the development and maintenance of the ticketing system behind them.",
  es: "Operaciones de contact center inbound y outbound: servicio al cliente, ventas, cobros, encuestas, onboarding y soporte técnico, gestionando tanto Front Office como Back Office, además del desarrollo y mantenimiento del sistema de gestión de tickets que las respalda.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/call-center"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default async function CallCenterPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd data={servicePageGraph("call-center", lang)} />
      <CallCenterDetail />
    </>
  );
}
