export type ServiceId = "call-center" | "bpo" | "systems";

export type ServiceIconName =
  | "headset"
  | "trend"
  | "banknote"
  | "gauge"
  | "userplus"
  | "shield"
  | "clipboard-check"
  | "wrench"
  | "settings"
  | "layers"
  | "database"
  | "messages"
  | "layout"
  | "chart"
  | "workflow"
  | "brain"
  | "code"
  | "phone"
  | "mail"
  | "share"
  | "flag-mountain"
  | "eye"
  | "diamond";

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
    id: string;
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
      {
        id: "customer-service",
        icon: "headset",
        title: "Customer service",
        description: "Inbound support across phone, email, chat and social media.",
      },
      {
        id: "sales",
        icon: "trend",
        title: "Sales",
        description: "Outbound campaigns, telesales, lead generation and closing.",
      },
      {
        id: "collections",
        icon: "banknote",
        title: "Collections",
        description: "Portfolio recovery and collections with professional protocols.",
      },
      {
        id: "surveys",
        icon: "gauge",
        title: "Surveys",
        description: "Satisfaction studies, market polls and NPS measurement.",
      },
      {
        id: "onboarding",
        icon: "userplus",
        title: "Onboarding",
        description: "Welcome, activation and early follow-up for new customers.",
      },
      {
        id: "tech-support",
        icon: "wrench",
        title: "Tech Support",
        description: "Resolve issues fast and keep your customers moving forward.",
      },
    ],
  },
  {
    id: "bpo",
    label: "Operations",
    shortLabel: "The work behind your operation",
    strapline: "Repeatable work, run accurately at volume.",
    description: "Back office, data processing and omnichannel support under clear SLAs.",
    color: "#176c79",
    glow: "#80bc00",
    href: "/services/operations",
    details: [
      {
        id: "back-office-support",
        icon: "layers",
        title: "Back Office Support",
        description: "Streamline your operations and scale with ease behind the scenes.",
      },
      {
        id: "data-processing",
        icon: "database",
        title: "Data processing",
        description: "Information handled accurately and consistently at scale.",
      },
      {
        id: "omnichannel-support",
        icon: "messages",
        title: "Omnichannel support",
        description: "Support coordinated across your operational channels.",
      },
      {
        id: "trust-safety",
        icon: "shield",
        title: "Trust & Safety",
        description: "Protect your platform and community with proactive risk management.",
      },
      {
        id: "quality-assurance",
        icon: "clipboard-check",
        title: "Quality Assurance",
        description: "Ensure every interaction meets your highest standards.",
      },
      {
        id: "consulting-services",
        icon: "settings",
        title: "Consulting Services",
        description: "Get tailored strategies to optimize every part of your customer experience.",
      },
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
      {
        id: "crms",
        icon: "layout",
        title: "CRMs",
        description: "Custom systems for customer and operational relationships.",
      },
      {
        id: "dashboards",
        icon: "chart",
        title: "Dashboards",
        description: "Operational visibility for better-informed decisions.",
      },
      {
        id: "operations-automation",
        icon: "workflow",
        title: "Operations automation",
        description: "Workflows designed around the way your operation runs.",
      },
      {
        id: "ai-implementation",
        icon: "brain",
        title: "AI Implementation",
        description: "Integrate AI that empowers your team and delights your customers.",
      },
    ],
  },
];

export const SERVICE_ICON: Record<ServiceId, ServiceIconName> = {
  "call-center": "headset",
  bpo: "layers",
  systems: "code",
};
