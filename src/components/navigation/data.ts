export type NavLink = { label: string; href: string };

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
  { label: "Services", href: "/#services" },
  { label: "Sectors", href: "#" },
  { label: "Contact", href: "/cotizador" },
] as const;

// Service detail pages have their own in-page sections — on those routes the
// navbar should point at real anchors on the page instead of the generic
// sitewide stubs above. Keyed by pathname so each service page can define its
// own list without the shared Navbar/DesktopNav/MobileNav needing to know
// anything about a specific page's structure.
export const SERVICE_NAV_LINKS: Record<string, readonly NavLink[]> = {
  "/services/call-center": [
    { label: "Capabilities", href: "#capabilities" },
    { label: "Process", href: "#method" },
    { label: "Results", href: "#metrics" },
    { label: "Clients", href: "#clients" },
  ],
  "/services/bpo": [
    { label: "Disciplines", href: "#capabilities" },
    { label: "Method", href: "#method" },
    { label: "SLAs", href: "#slas" },
    { label: "Facilities", href: "#facility" },
  ],
};

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;
