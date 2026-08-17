import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { CONTACT } from "@/components/footer/data";
import { locales, type Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { ORG_ID, SITE_URL } from "@/lib/schema";
import RecaptchaBadge from "../../quote/RecaptchaBadge";
import { ACTIVE_POSITIONS, SCHEMA_EMPLOYMENT, resolvePosition, type Position } from "../data";
import PositionDetail from "./PositionDetail";

/* Cada vacante es su propia página estática. Es la jugada de SEO de mayor
   retorno del módulo — entra al buscador de empleos de Google — y ninguna de
   las referencias del cliente la hace en su propio dominio. */
export async function generateStaticParams() {
  return locales.flatMap((lang) =>
    ACTIVE_POSITIONS.map((position) => ({ lang, slug: position.slug })),
  );
}

/* Una vacante retirada (active: false) deja de existir como ruta en vez de
   quedar publicada: sale del listado, del sitemap y de aquí a la vez. */
export const dynamicParams = false;

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const position = resolvePosition(ACTIVE_POSITIONS, slug);
  if (!position) return {};

  const title = `${position.title[lang]} | Center Quest`;
  return {
    title,
    description: position.summary[lang],
    alternates: localeAlternates(lang, `/careers/${position.slug}`),
    openGraph: { title, description: position.summary[lang], type: "article" },
  };
}

/* Dato estructurado JobPosting. Solo campos que existen de verdad: sin
   baseSalary (nadie autorizó publicar rangos) y sin validThrough (una fecha
   inventada saca la vacante del índice el día equivocado). */
function jobPostingNode(position: Position, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: position.title[lang],
    description: [
      position.summary[lang],
      ...position.responsibilities.map((item) => `• ${item[lang]}`),
      ...position.requirements.map((item) => `• ${item[lang]}`),
    ].join("\n"),
    datePosted: position.postedAt,
    employmentType: SCHEMA_EMPLOYMENT[position.employmentType],
    hiringOrganization: { "@id": ORG_ID },
    url: `${SITE_URL}/${lang}/careers/${position.slug}`,
    directApply: true,
    inLanguage: lang,
    jobLocationType: position.mode === "remote" ? "TELECOMMUTE" : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: CONTACT.street,
        addressLocality: CONTACT.city,
        addressCountry: CONTACT.countryCode,
      },
    },
  };
}

export default async function PositionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const position = resolvePosition(ACTIVE_POSITIONS, slug);
  if (!position) notFound();

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      <JsonLd data={jobPostingNode(position, lang)} />
      {recaptchaSiteKey && (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
          <RecaptchaBadge />
        </>
      )}
      <PositionDetail position={position} />
    </>
  );
}
