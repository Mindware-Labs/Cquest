import { SERVICE_ICON, SERVICES, type ServiceIconName } from "@/components/services/data";

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

export const NAV_LINKS = [
  { label: "About us", href: "#" },
  {
    label: "Services",
    href: "/#services",
    children: SERVICES.map((service) => ({
      label: service.label,
      href: service.href,
      description: service.strapline,
      icon: SERVICE_ICON[service.id],
    })),
  },
  { label: "Sectors", href: "#" },
  { label: "Contact", href: "/cotizador" },
] as const;

// On a service detail page the logo is the only way back to the home page —
// this gives every such page an explicit nav item for it too, with a small
// dropdown to jump straight to a section of home instead of always landing
// back at the top. Only lists sections that actually exist on "/" today
// (HeroImage's #hero, ServicesCarousel's #services) — add to this list only
// once a matching section ships on the home page.
const HOME_NAV_LINK: NavLink = {
  label: "Home",
  href: "/",
  children: [
    { label: "Overview", href: "/" },
    { label: "Services", href: "/#services" },
  ],
};

// Service detail pages have their own in-page sections — on those routes the
// navbar should point at real anchors on the page instead of the generic
// sitewide stubs above. Keyed by pathname so each service page can define its
// own list without the shared Navbar/DesktopNav/MobileNav needing to know
// anything about a specific page's structure.
export const SERVICE_NAV_LINKS: Record<string, readonly NavLink[]> = {
  "/services/call-center": [
    HOME_NAV_LINK,
    { label: "Capabilities", href: "#capabilities" },
    { label: "Process", href: "#method" },
    { label: "Results", href: "#metrics" },
    { label: "Clients", href: "#clients" },
  ],
  "/services/bpo": [
    HOME_NAV_LINK,
    { label: "Disciplines", href: "#capabilities" },
    { label: "Method", href: "#method" },
    { label: "SLAs", href: "#slas" },
    { label: "Facilities", href: "#facility" },
  ],
  "/services/systems": [
    HOME_NAV_LINK,
    { label: "Capabilities", href: "#capabilities" },
    { label: "Method", href: "#method" },
    { label: "Commitments", href: "#commitments" },
    { label: "Work", href: "#work" },
  ],
};

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;
