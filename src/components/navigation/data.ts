import { SERVICE_ICON, SERVICES, type ServiceIconName } from "@/components/services/data";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";

export type NavLink = {
  label: string;
  href: string;
  // Set only on the "Services" children below — their presence is what
  // tells DesktopNav to render the mega-menu layout instead of a plain list.
  description?: string;
  icon?: ServiceIconName;
  children?: readonly NavLink[];
};

// Every service detail page opens on a dark, full-bleed hero (photo or ink
// gradient) with the navbar floating transparently on top of it — so its nav
// text needs the light/"inverse" treatment until the page scrolls past the
// hero. All three currently share that shape; a page rendered here without
// a dark hero shouldn't be added to this list.
export const SERVICE_DETAIL_PAGES = [
  "/services/call-center",
  "/services/bpo",
  "/services/systems",
] as const;

export function getNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    { label: dict.nav.aboutUs, href: "#" },
    {
      label: dict.nav.services,
      href: "/#services",
      children: SERVICES.map((service) => ({
        label: service.label[lang],
        href: service.href,
        description: service.strapline[lang],
        icon: SERVICE_ICON[service.id],
      })),
    },
    { label: dict.nav.sectors, href: "#" },
    { label: dict.nav.contact, href: "/cotizador" },
  ];
}

// On a service detail page the logo is the only way back to the home page —
// this gives every such page an explicit nav item for it too, with a small
// dropdown to jump straight to a section of home instead of always landing
// back at the top. Only lists sections that actually exist on "/" today
// (HeroImage's #hero, ServicesCarousel's #services) — add to this list only
// once a matching section ships on the home page.
function getHomeNavLink(dict: Dictionary): NavLink {
  return {
    label: dict.nav.home,
    href: "/",
    children: [
      { label: dict.nav.overview, href: "/" },
      { label: dict.nav.services, href: "/#services" },
    ],
  };
}

// Service detail pages have their own in-page sections — on those routes the
// navbar should point at real anchors on the page instead of the generic
// sitewide stubs above. Keyed by the locale-less pathname (see
// useLocalizedPathname) so each service page can define its own list without
// the shared Navbar/DesktopNav/MobileNav needing to know anything about a
// specific page's structure.
export function getServiceNavLinks(dict: Dictionary): Record<string, readonly NavLink[]> {
  const home = getHomeNavLink(dict);
  return {
    "/services/call-center": [
      home,
      { label: dict.serviceSections.callCenter.capabilities, href: "#capabilities" },
      { label: dict.serviceSections.callCenter.process, href: "#method" },
      { label: dict.serviceSections.callCenter.results, href: "#metrics" },
      { label: dict.serviceSections.callCenter.clients, href: "#clients" },
    ],
    "/services/bpo": [
      home,
      { label: dict.serviceSections.bpo.disciplines, href: "#capabilities" },
      { label: dict.serviceSections.bpo.method, href: "#method" },
      { label: dict.serviceSections.bpo.slas, href: "#slas" },
      { label: dict.serviceSections.bpo.facilities, href: "#facility" },
    ],
    "/services/systems": [
      home,
      { label: dict.serviceSections.systems.capabilities, href: "#capabilities" },
      { label: dict.serviceSections.systems.method, href: "#method" },
      { label: dict.serviceSections.systems.commitments, href: "#commitments" },
      { label: dict.serviceSections.systems.work, href: "#work" },
    ],
  };
}

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;
