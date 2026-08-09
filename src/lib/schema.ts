import { CONTACT } from "@/components/footer/data";
import { HQ } from "@/components/about/locationData";
import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example"
).replace(/\/$/, "");

/* @id estables y absolutos. Sin ellos cada bloque JSON-LD es una isla y Google
   no puede saber que el editor del sitio y el negocio local son la misma
   entidad; con ellos, los nodos de cualquier página se referencian entre sí. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

const ORG_NAME = "Center Quest";

/* Regla heredada del layout y que se mantiene: solo campos que existen de
   verdad. Sin sameAs (no hay perfiles sociales confirmados), sin openingHours
   ni priceRange (nadie los ha dado). Un dato inventado en JSON-LD es una
   penalización esperando, no un campo de más. */
export function organizationNode(lang: Locale) {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: `${SITE_URL}/${lang}`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 692,
      height: 512,
    },
    image: `${SITE_URL}/logo.png`,
    email: CONTACT.email,
    telephone: CONTACT.phoneHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.city,
      addressCountry: CONTACT.countryCode,
    },
    /* Las mismas coordenadas que pinta el mapa de /location. Una sola fuente:
       si se mueve la sede, el mapa y el dato estructurado se mueven juntos. */
    geo: {
      "@type": "GeoCoordinates",
      latitude: HQ.lat,
      longitude: HQ.lng,
    },
    /* República Dominicana como mercado primario y Estados Unidos como
       secundario — es lo que declara el documento de requisitos. */
    areaServed: [
      { "@type": "Country", name: "Dominican Republic" },
      { "@type": "Country", name: "United States" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneHref,
      email: CONTACT.email,
      contactType: "sales",
      availableLanguage: ["es", "en"],
    },
  };
}

export function websiteNode(lang: Locale) {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${SITE_URL}/${lang}`,
    name: ORG_NAME,
    inLanguage: lang,
    publisher: { "@id": ORG_ID },
  };
}

/* Categoría del servicio en términos de industria, no de marca: es lo que
   ayuda a Google a encajar la página en una vertical. */
const SERVICE_TYPE: Record<string, string> = {
  "call-center": "Call Center",
  bpo: "Business Process Outsourcing",
  systems: "Systems Development",
};

/* Una línea de negocio. `provider` apunta al nodo del layout en vez de
   repetirlo: el grafo se cose entre páginas por @id. Antes cada página
   declaraba su propio Organization suelto y Google veía tres «Center Quest»
   distintos, ninguno conectado con el negocio local del layout. */
export function serviceNode(serviceId: string, lang: Locale) {
  const service = SERVICES.find((entry) => entry.id === serviceId);
  if (!service) return null;

  return {
    "@type": "Service",
    "@id": `${SITE_URL}/${lang}${service.href}#service`,
    serviceType: SERVICE_TYPE[serviceId],
    name: service.label[lang],
    description: `${service.strapline[lang]} ${service.description[lang]}`,
    url: `${SITE_URL}/${lang}${service.href}`,
    provider: { "@id": ORG_ID },
    areaServed: [
      { "@type": "Country", name: "Dominican Republic" },
      { "@type": "Country", name: "United States" },
    ],
    /* Los servicios concretos de la línea, que es justo lo que la página
       enumera. El catálogo sale de la misma constante que pinta la UI. */
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.label[lang],
      itemListElement: service.details.map((detail) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: detail.title[lang],
          description: detail.description[lang],
        },
      })),
    },
  };
}

export function breadcrumbNode(
  lang: Locale,
  trail: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE_URL}/${lang}${step.path}`,
    })),
  };
}

/* El grafo completo de una página de servicio: la línea de negocio con su
   catálogo, más su sitio en la jerarquía. Los tres detalles de servicio lo
   comparten, así que vive aquí y no repetido en cada page.tsx. */
export function servicePageGraph(serviceId: string, lang: Locale) {
  const service = SERVICES.find((entry) => entry.id === serviceId);
  if (!service) return graph();

  return graph(
    serviceNode(serviceId, lang),
    breadcrumbNode(lang, [
      { name: "Center Quest", path: "" },
      { name: service.label[lang], path: service.href },
    ]),
  );
}

/* Un único <script> por página. Varios bloques sueltos son válidos, pero el
   grafo deja explícito que todos los nodos son de la misma página. */
export function graph(...nodes: ReadonlyArray<object | null>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}
