import { getNavLinks } from "@/components/navigation/data";
import { SERVICES } from "@/components/services/data";

export const CONTACT = {
  phone: "(829) 734 7450",

  phoneHref: "+18297347450",
  email: "services@ccquest.do",

  street: "Paseo de los Periodistas #03, Ens. Miraflores",
  city: "Santo Domingo",
  country: "Dominican Republic",
  countryCode: "DO",
} as const;

export const BRAND_LINE: readonly [string, string] = [
  "We power operations.",
  "You drive growth.",
];

export const brandLine = BRAND_LINE.join(" ");

export type FooterLink = { label: string; href: string };

const OMIT_FROM_FOOTER = ["/#about", "/quote"];

export function getBaseLinks(): FooterLink[] {
  const navLinks = getNavLinks()
    .filter((link) => !OMIT_FROM_FOOTER.includes(link.href))
    .map(({ label, href }) => ({ label, href }));
  return [
    ...navLinks,
    { label: COPY.links.terms, href: "/legal/terms" },
    { label: COPY.links.privacy, href: "/legal/privacy" },
  ];
}

export function getServiceRows() {
  return SERVICES.map((service) => ({
    id: service.id,
    label: service.label,
    lead: service.shortLabel,
    href: service.href,
    accent: service.glow,
  }));
}

export const COPY = {
  headings: { services: "Services", contact: "Contact" },
  links: {
    terms: "Terms & conditions",
    privacy: "Privacy policy",
  },
  cta: "Request a quote",
  navAriaLabel: "Footer",
  rights: "All rights reserved.",
  phoneLabel: "Phone / WhatsApp",
  emailLabel: "Email",
  locationLabel: "Location",
} as const;
