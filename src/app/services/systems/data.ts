import { SERVICES, type ServiceIconName } from "@/components/services/data";

export const SYSTEMS = SERVICES.find((service) => service.id === "systems")!;

export const CAPABILITY_DETAIL: Record<string, { includes: readonly string[]; benefit: string }> = {
  CRMs: {
    includes: [
      "Customer and case management shaped to your actual workflow",
      "Views and permissions per role — not one-size-fits-all",
      "Integrations with the channels and tools you already use",
    ],
    benefit: "One system of record your team actually wants to use, because it works the way they do.",
  },
  Dashboards: {
    includes: [
      "Operational KPIs consolidated from your real data sources",
      "Live views for the floor, summaries for management",
      "Alerts when a number leaves its acceptable range",
    ],
    benefit: "Decisions made on today's numbers, not last month's report.",
  },
  "Operations automation": {
    includes: [
      "Repetitive workflows automated end to end",
      "Rules and exceptions encoded, so edge cases are handled — not dropped",
      "Human handoff points exactly where judgment is needed",
    ],
    benefit: "Hours of manual work become minutes, with fewer errors along the way.",
  },
  "AI Implementation": {
    includes: [
      "Use cases selected for measurable operational impact",
      "AI assistants and automation integrated into existing workflows",
      "Guardrails, evaluation and monitoring from day one",
    ],
    benefit: "AI that empowers your team and delights your customers — deployed responsibly.",
  },
};

export const PROCESS = [
  { title: "Discovery", description: "We sit with the people who do the work and map how the operation actually runs — not how the org chart says it does." },
  { title: "Blueprint", description: "Screens, data model and integrations are designed and validated with your team before a single line of code is written." },
  { title: "Build", description: "Short cycles with working software at every step, so you see progress instead of waiting for a big reveal." },
  { title: "Launch", description: "Deployment, data migration and training handled with the operation running — the business never stops." },
  { title: "Iterate", description: "The system keeps evolving with your operation: new modules, refinements and support after go-live." },
] as const;

export const COMMITMENTS = [
  { title: "Working software every cycle", description: "Progress you can click, in weekly builds — not a final reveal months later." },
  { title: "Code and data are yours", description: "Full ownership, documentation and handover. No lock-in to us or to anyone." },
  { title: "Support after go-live", description: "Launch is the midpoint, not the end — the system keeps evolving with the operation it serves." },
] as const;

/* ── Selected work ─────────────────────────────────────────
   The proof gallery. Each slot is a clickable plate that opens its own case-
   study subpage (`href`). Only `build` / `icon` / `href` are required: an entry
   with no `image`/`title` renders as a labeled, reserved slot. To publish a
   real case study, fill its fields, drop a WebP in `public/apps/`, and flesh
   out its subpage — the same slot becomes a live card, no layout change. Add
   more entries and the gallery reflows on its own; the first `featured` entry
   is the flagship plate. */
export type Work = {
  build: string;                                // system-type tag, e.g. "CRM"
  icon: ServiceIconName;                        // mirrors the capability icons
  href: string;                                 // its case-study subpage
  featured?: boolean;
  title?: string;                               // published: the system's name
  sector?: string;                              // published: the sector it serves
  summary?: string;                             // published: challenge → system, one line
  outcome?: { value: string; label: string };   // published: the number it moved
  image?: string;                               // published: "/apps/<file>.webp"
  alt?: string;                                 // published: describe the screenshot
};

export const WORKS: readonly Work[] = [
  {
    build: "Platform",
    icon: "layout",
    featured: true,
    href: "/services/systems/work",
    title: "Contact-center operations platform",
    sector: "Contact center · Support operations",
    summary:
      "One system of record for a whole phone operation — calls captured automatically from cloud telephony, worked as tickets and campaigns, and rolled up into live dashboards and per-site reporting.",
    outcome: { value: "Real-time", label: "call-to-report visibility" },
    // image: "/apps/contact-center.webp", // drop a WebP here to replace the reserved slot
    // alt: "Contact Center — the unified calls, tickets and records view",
  },
];

export const HERO_LINES = [
  { text: "Software shaped", strong: false },
  { text: "around how", strong: false },
  { text: "you work.", strong: true },
] as const;
