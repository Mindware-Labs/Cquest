import {
  SERVICES,
  type Service,
  type ServiceId,
  type ServiceIconName,
} from "@/components/services/data";

// The three business-line cards shown in Step 1. Derived from the shared
// SERVICES source of truth so labels, colours and straplines never drift from
// the rest of the site; only the lead icon is chosen here.
const SERVICE_LEAD_ICON: Record<ServiceId, ServiceIconName> = {
  "call-center": "headset",
  bpo: "layers",
  systems: "layout",
};

export type ServiceCard = Service & { leadIcon: ServiceIconName };

export const SERVICE_CARDS: readonly ServiceCard[] = SERVICES.map((service) => ({
  ...service,
  leadIcon: SERVICE_LEAD_ICON[service.id],
}));

export function getService(id: ServiceId | null): ServiceCard | null {
  return SERVICE_CARDS.find((service) => service.id === id) ?? null;
}

/* ── Deep-link resolution ───────────────────────────────────
   Service pages link in with ?servicio=<id> so the prospect lands on Step 2
   already in context. Accept a few spellings/aliases and reject anything
   unknown (falls back to Step 1). */
export function resolveService(param?: string | string[]): ServiceId | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  const aliases: Record<string, ServiceId> = {
    "call-center": "call-center",
    callcenter: "call-center",
    call_center: "call-center",
    bpo: "bpo",
    // The route is "/services/operations" (Navbar derives ?servicio= from the
    // last URL segment there), while the ServiceId itself stayed "bpo" — only
    // the display copy and the URL were rebranded, not the internal id.
    operations: "bpo",
    operaciones: "bpo",
    systems: "systems",
    "systems-development": "systems",
    sistemas: "systems",
    desarrollo: "systems",
  };
  return aliases[key] ?? null;
}
