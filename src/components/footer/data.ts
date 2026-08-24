import { getNavLinks } from "@/components/navigation/data";
import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/types";

export const CONTACT = {
  phone: "(829) 734 7450",

  phoneHref: "+18297347450",
  email: "services@ccquest.do",

  street: "Paseo de los Periodistas #03, Ens. Miraflores",
  city: "Santo Domingo",
  country: { en: "Dominican Republic", es: "República Dominicana" },
  countryCode: "DO",
} as const;

export const BRAND_LINE: Record<Locale, readonly [string, string]> = {
  en: ["We power operations.", "You drive growth."],
  es: ["Nosotros impulsamos las operaciones.", "Tú impulsas el crecimiento."],
};

export function brandLine(lang: Locale): string {
  return BRAND_LINE[lang].join(" ");
}

export type FooterLink = { label: string; href: string };

const OMIT_FROM_FOOTER = ["/#about", "/quote"];

export function getBaseLinks(dict: Dictionary, lang: Locale): FooterLink[] {
  const t = COPY[lang];
  const navLinks = getNavLinks(dict, lang)
    .filter((link) => !OMIT_FROM_FOOTER.includes(link.href))
    .map(({ label, href }) => ({ label, href }));
  return [
    ...navLinks,
    // El blog no está en la navegación principal (no compite por atención con las líneas de negocio), pero necesita un enlace en el pie o sería inalcanzable.
    { label: t.links.blog, href: "/blog" },
    { label: t.links.terms, href: "/legal/terms" },
    { label: t.links.privacy, href: "/legal/privacy" },
  ];
}

export function getServiceRows(lang: Locale) {
  return SERVICES.map((service) => ({
    id: service.id,
    label: service.label[lang],
    lead: service.shortLabel[lang],
    href: service.href,
    accent: service.glow,
  }));
}

export const COPY = {
  en: {
    headings: { services: "Services", contact: "Contact" },
    links: {
      blog: "Blog",
      terms: "Terms & conditions",
      privacy: "Privacy policy",
    },
    cta: "Request a quote",
    navAriaLabel: "Footer",
    rights: "All rights reserved.",
    phoneLabel: "Phone / WhatsApp",
    emailLabel: "Email",
    locationLabel: "Location",
  },
  es: {
    headings: { services: "Servicios", contact: "Contacto" },
    links: {
      blog: "Blog",
      terms: "Términos y condiciones",
      privacy: "Política de privacidad",
    },
    cta: "Solicitar cotización",
    navAriaLabel: "Pie de página",
    rights: "Todos los derechos reservados.",
    phoneLabel: "Teléfono / WhatsApp",
    emailLabel: "Correo",
    locationLabel: "Ubicación",
  },
} as const;
