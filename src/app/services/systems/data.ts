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
    image: "/rig-hut/system-015-cropped.png",
    alt: "Aircall integration screen inside the platform, showing the softphone sign-in prompt and AI call summary, key topics and transcript panels.",
  },
];

export const HERO_LINES = [
  { text: "Software shaped", strong: false },
  { text: "around how", strong: false },
  { text: "you work.", strong: true },
] as const;

/* ── Clients we've built for ───────────────────────────────
   Real operations running a system we designed and built — the systems-
   specific slice of what each account gets from Center Quest. Some of these
   clients also appear on the Call Center clients page with a different
   `provides` write-up (their call-center scope, not their systems scope). */
export const CLIENT_LOGOS = [
  {
    name: "Rig Hut",
    src: "/brands/righut.jpeg",
    about:
      "Rig Hut is a provider of parking management software purpose built for industrial parking applications. Truck parking facilities utilize Rig Hut to manage their inventory, accurately represent vacancies to the market, process payments and generate comprehensive reports for their yards.\n\nUtilizing a powerful suite of management tools, rest assured knowing your customer database, payments and communications are all processed and stored securely within the Rig Hut environment.",
    source: "https://www.linkedin.com/company/rig-hut/",
    provides:
      "We designed and built Rig Hut's internal Operations platform end to end — tracking outbound campaigns like accounts receivable and onboarding, with every case followable from first contact to close. We also integrated Aircall's cloud telephony directly into that platform, so agents place and answer calls from the very screen where the case lives — collapsing three separate tools their team used to juggle into one connected system.",
  },
  {
    name: "Paso Rápido",
    src: "/brands/pasoRapido.png",
    size: "large",
    about:
      "It is the first public trust created by the Dominican State, through Fiduciaria Reservas, S.A., under Trust Agreement number one (01), signed on October 18, 2013. Represented by the Ministry of Public Works and Communications (MOPC), ratified by resolution number 156-13 issued by the National Congress on 11/25/2013 and published in Official Gazette 10735.",
    source: "https://rdvial.gob.do/quienes-somos/",
    provides:
      "We built their internal operations system, connecting every department through internal notes so processes keep moving and every case or complaint that comes in by email gets tracked through to resolution.",
  },
  {
    name: "Plastifar",
    src: "/brands/plastifar.png",
    size: "compact",
    about:
      "Plastifar S.A. was founded on July 20, 1992, by Engineer Alejandro Farach Cruz. It was created to meet the packaging needs of the pharmaceutical industry, with a commitment to the highest standards of hygiene and quality in the production of its containers.",
    source: "https://plastifar.com/es/?page_id=11194",
    provides:
      "We built their internal operations system — every department connected through internal notes, so processes keep moving and every case or complaint that comes in gets constant follow-up.",
  },
  {
    name: "Fiduciaria Reservas",
    src: "/brands/fiduciariaReservas.jpg",
    about:
      "A trust is a contract through which one or more persons transfer assets or rights to a trustee entity to create a separate estate, administered by that entity for the benefit of another person or of the person who transferred the assets.",
    source: "https://www.fiduciariareservas.com/",
    provides:
      "We built the system behind fdi.com.do — a self-service admin panel where their team uploads new property listings themselves. No manual back-and-forth: what needs to go up gets added directly, with no developer in the loop.",
  },
  {
    name: "Astur Caribe",
    src: "/brands/astur.jpg",
    about:
      "Astur Caribe has 33 years of experience in the market, offering bathroom furniture, shower enclosures and hardware.",
    provides:
      "We implemented a WhatsApp-based sales system for their team, giving customers a direct channel to inquire and buy.",
  },
] as const;

export type ClientLogo = (typeof CLIENT_LOGOS)[number];
