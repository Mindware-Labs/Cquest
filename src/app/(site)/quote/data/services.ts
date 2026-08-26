import {
  SERVICES,
  type Service,
  type ServiceId,
  type ServiceIconName,
} from "@/components/services/data";

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

export function resolveService(param?: string | string[]): ServiceId | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  const aliases: Record<string, ServiceId> = {
    "call-center": "call-center",
    callcenter: "call-center",
    call_center: "call-center",
    bpo: "bpo",

    operations: "bpo",
    operaciones: "bpo",
    systems: "systems",
    "systems-development": "systems",
    sistemas: "systems",
    desarrollo: "systems",
  };
  return aliases[key] ?? null;
}
