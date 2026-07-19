export type ServiceId = "call-center" | "bpo" | "systems";

export type ServiceIconName =
  | "headset"
  | "trend"
  | "banknote"
  | "gauge"
  | "userplus"
  | "layers"
  | "database"
  | "messages"
  | "layout"
  | "chart"
  | "workflow"
  | "code";

export type Service = {
  id: ServiceId;
  label: string;
  shortLabel: string;
  strapline: string;
  description: string;
  color: string;
  glow: string;
  href: string;
  details: ReadonlyArray<{
    title: string;
    description: string;
    icon: ServiceIconName;
  }>;
};

export const SERVICES: ReadonlyArray<Service> = [
  {
    id: "call-center",
    label: "Call Center",
    shortLabel: "Every customer moment, covered",
    strapline: "Inbound and outbound contact-center operations across every channel.",
    description:
      "Customer support, sales and follow-up designed around the moments that matter to your customers.",
    color: "#3f738d",
    glow: "#74c3d5",
    href: "/services/call-center",
    details: [
      { title: "Customer service", icon: "headset", description: "Inbound support across phone, email, chat and social media." },
      { title: "Sales", icon: "trend", description: "Outbound campaigns, telesales, lead generation and closing." },
      { title: "Collections", icon: "banknote", description: "Portfolio recovery and collections with professional protocols." },
      { title: "Surveys", icon: "gauge", description: "Satisfaction studies, market polls and NPS measurement." },
      { title: "Onboarding", icon: "userplus", description: "Welcome, activation and early follow-up for new customers." },
    ],
  },
  {
    id: "bpo",
    label: "BPO",
    shortLabel: "The work behind your operation",
    strapline: "Repeatable work, run accurately at volume.",
    description: "Back office, data processing and omnichannel support under clear SLAs.",
    color: "#176c79",
    glow: "#80bc00",
    href: "/services/bpo",
    details: [
      { title: "Back office", icon: "layers", description: "The repeatable work that keeps an operation moving." },
      { title: "Data processing", icon: "database", description: "Information handled accurately and consistently at scale." },
      { title: "Omnichannel support", icon: "messages", description: "Support coordinated across your operational channels." },
    ],
  },
  {
    id: "systems",
    label: "Systems Development",
    shortLabel: "Software shaped around how you work",
    strapline: "Custom systems for operations.",
    description:
      "CRMs, dashboards and operations automation built around how your business actually works.",
    color: "#4b98b1",
    glow: "#d6d1ca",
    href: "/services/systems",
    details: [
      { title: "CRMs", icon: "layout", description: "Custom systems for customer and operational relationships." },
      { title: "Dashboards", icon: "chart", description: "Operational visibility for better-informed decisions." },
      { title: "Operations automation", icon: "workflow", description: "Workflows designed around the way your operation runs." },
    ],
  },
];

export const ORBIT = [
  { angle: -90, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
  { angle: 30, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
  { angle: 150, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
] as const;

export const SERVICE_PANEL_ID = "cq-services";
export const CAPABILITY_DWELL_MS = 3200;
