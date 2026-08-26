import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { CONTACT } from "@/components/footer/data";
import { ORG_ID, SITE_URL } from "@/lib/schema";
import RecaptchaBadge from "../../quote/RecaptchaBadge";
import { ACTIVE_POSITIONS, SCHEMA_EMPLOYMENT, resolvePosition, type Position } from "../data";
import PositionDetail from "./PositionDetail";

/* Cada vacante es su propia página estática. Es la jugada de SEO de mayor
   retorno del módulo — entra al buscador de empleos de Google — y ninguna de
   las referencias del cliente la hace en su propio dominio. */
export async function generateStaticParams() {
  return ACTIVE_POSITIONS.map((position) => ({ slug: position.slug }));
}

/* Una vacante retirada (active: false) deja de existir como ruta en vez de
   quedar publicada: sale del listado, del sitemap y de aquí a la vez. */
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const position = resolvePosition(ACTIVE_POSITIONS, slug);
  if (!position) return {};

  const title = `${position.title} | Center Quest`;
  return {
    title,
    description: position.summary,
    alternates: { canonical: `/careers/${position.slug}` },
    openGraph: { title, description: position.summary, type: "article" },
  };
}

/* Dato estructurado JobPosting. Solo campos que existen de verdad: sin
   baseSalary (nadie autorizó publicar rangos) y sin validThrough (una fecha
   inventada saca la vacante del índice el día equivocado). */
function jobPostingNode(position: Position) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: position.title,
    description: [
      position.summary,
      ...position.responsibilities.map((item) => `• ${item}`),
      ...position.requirements.map((item) => `• ${item}`),
    ].join("\n"),
    datePosted: position.postedAt,
    employmentType: SCHEMA_EMPLOYMENT[position.employmentType],
    hiringOrganization: { "@id": ORG_ID },
    url: `${SITE_URL}/careers/${position.slug}`,
    directApply: true,
    inLanguage: "en",
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
  const position = resolvePosition(ACTIVE_POSITIONS, slug);
  if (!position) notFound();

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      <JsonLd data={jobPostingNode(position)} />
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
