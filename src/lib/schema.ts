import { CONTACT } from "@/components/footer/data";
import { HQ } from "@/components/about/locationData";
import { SERVICES } from "@/components/services/data";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example"
).replace(/\/$/, "");

/* @id estables y absolutos. Sin ellos cada bloque JSON-LD es una isla y Google
   no puede saber que el editor del sitio y el negocio local son la misma
   entidad; con ellos, los nodos de cualquier página se referencian entre sí. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

const ORG_NAME = "Center Quest";

/* El sitio se publica solo en inglés; el dato viaja al inLanguage de cada
   nodo WebSite/WebPage. */
const SITE_LANGUAGE = "en";

/* Regla heredada del layout y que se mantiene: solo campos que existen de
   verdad. Sin sameAs (no hay perfiles sociales confirmados), sin openingHours
   ni priceRange (nadie los ha dado). Un dato inventado en JSON-LD es una
   penalización esperando, no un campo de más. */
export function organizationNode() {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: `${SITE_URL}/`,
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
    /* El sitio es en inglés, pero la operación atiende en ambos idiomas:
       esto describe al equipo de ventas, no a la web. */
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneHref,
      email: CONTACT.email,
      contactType: "sales",
      availableLanguage: ["en", "es"],
    },
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${SITE_URL}/`,
    name: ORG_NAME,
    inLanguage: SITE_LANGUAGE,
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
export function serviceNode(serviceId: string) {
  const service = SERVICES.find((entry) => entry.id === serviceId);
  if (!service) return null;

  return {
    "@type": "Service",
    "@id": `${SITE_URL}${service.href}#service`,
    serviceType: SERVICE_TYPE[serviceId],
    name: service.label,
    description: `${service.strapline} ${service.description}`,
    url: `${SITE_URL}${service.href}`,
    provider: { "@id": ORG_ID },
    /* Sin esto el WebSite del layout es una isla: nada en la página enlaza
       hacia él, aunque la etiqueta <script> del layout lo declare global. */
    isPartOf: { "@id": SITE_ID },
    areaServed: [
      { "@type": "Country", name: "Dominican Republic" },
      { "@type": "Country", name: "United States" },
    ],
    /* Los servicios concretos de la línea, que es justo lo que la página
       enumera. El catálogo sale de la misma constante que pinta la UI. */
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.label,
      itemListElement: service.details.map((detail, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: detail.title,
          description: detail.description,
        },
      })),
    },
  };
}

export function breadcrumbNode(trail: ReadonlyArray<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE_URL}${step.path === "" ? "/" : step.path}`,
    })),
  };
}

/* El grafo completo de una página de servicio: la línea de negocio con su
   catálogo, más su sitio en la jerarquía. Los tres detalles de servicio lo
   comparten, así que vive aquí y no repetido en cada page.tsx. */
export function servicePageGraph(serviceId: string) {
  const service = SERVICES.find((entry) => entry.id === serviceId);
  if (!service) return graph();

  return graph(
    serviceNode(serviceId),
    breadcrumbNode([
      { name: "Center Quest", path: "" },
      { name: service.label, path: service.href },
    ]),
  );
}

/* Páginas sin una entidad propia que modelar (contacto, equipo, legal): un
   WebPage/AboutPage/ContactPage mínimo que solo referencia el negocio y el
   sitio por @id, en vez de dejarlas sin dato estructurado alguno. */
export function simplePageNode(
  type: "AboutPage" | "ContactPage" | "WebPage",
  path: string,
  name: string,
  description: string,
  extra?: Record<string, unknown>,
) {
  return {
    "@type": type,
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    ...extra,
  };
}

export function simplePageGraph(
  type: "AboutPage" | "ContactPage" | "WebPage",
  path: string,
  name: string,
  description: string,
  trail: ReadonlyArray<{ name: string; path: string }>,
  extra?: Record<string, unknown>,
) {
  return graph(
    simplePageNode(type, path, name, description, extra),
    breadcrumbNode(trail),
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
