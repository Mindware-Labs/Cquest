import { CONTACT } from "@/components/footer/data";
import { HQ } from "@/components/about/locationData";
import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example"
).replace(/\/$/, "");

// @id estables y absolutos: sin ellos cada bloque JSON-LD es una isla y Google no puede unir el sitio con el negocio local.
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

const ORG_NAME = "Center Quest";

// Solo campos que existen de verdad (sin sameAs, openingHours ni priceRange sin confirmar): un dato inventado en JSON-LD es una penalización esperando.
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
    // Mismas coordenadas que pinta el mapa de /location: una sola fuente, se mueven juntos.
    geo: {
      "@type": "GeoCoordinates",
      latitude: HQ.lat,
      longitude: HQ.lng,
    },
    // República Dominicana como mercado primario y Estados Unidos como secundario, según el documento de requisitos.
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

// Categoría del servicio en términos de industria, no de marca: ayuda a Google a encajar la página en una vertical.
const SERVICE_TYPE: Record<string, string> = {
  "call-center": "Call Center",
  bpo: "Business Process Outsourcing",
  systems: "Systems Development",
};

// `provider` apunta al nodo del layout en vez de repetirlo: antes cada página declaraba su propio Organization suelto y Google veía tres «Center Quest» distintos.
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
    // El catálogo sale de la misma constante que pinta la UI.
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

// Vive acá y no repetido en cada page.tsx: los tres detalles de servicio lo comparten.
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

type BlogPostForSchema = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: Date;
  updatedAt: Date;
  categoryName: string;
};

// Sin bylines individuales: el blog publica a nombre de Center Quest, así que author y publisher apuntan al @id de la organización en vez de inventar un Person.
export function blogPostingNode(post: BlogPostForSchema, lang: Locale) {
  const url = `${SITE_URL}/${lang}/blog/${post.slug}`;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    // post.coverImageUrl es relativa (/api/images/...); Google/schema.org esperan URL absoluta acá.
    image: `${SITE_URL}${post.coverImageUrl}`,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    articleSection: post.categoryName,
    inLanguage: lang,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

// Mismo patrón que servicePageGraph: vive acá para no repetirse en cada página de /blog/[slug].
export function blogPostPageGraph(post: BlogPostForSchema, lang: Locale) {
  return graph(
    blogPostingNode(post, lang),
    breadcrumbNode(lang, [
      { name: "Center Quest", path: "" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  );
}

// Un único <script> por página: el grafo deja explícito que todos los nodos son de la misma página.
export function graph(...nodes: ReadonlyArray<object | null>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}
